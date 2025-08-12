
window.AD_oppo = {
    bannerID_normal: "2698149",//普通banner
    chaPing_TT: "2698154",//插屏
    videoID_TT: "2698155",//视频    


    
    chaPing_banner: "",//模板插屏banner


    timeOut: null,
    autoDestroyDuration: 7,//******** 自动关闭模板插屏 模板banner 的间隔  -1代表不会自动关闭
    switchOn() {
        AD.wuDianRate = 20;//自点击概率
        // this.durationChaPing =4;
    },

    shiPin() {
        if (AD.chanelName != AD.chanelName1) {
            AD.reward();
            return;
        }
        if (AD_oppo.videoAd_Revive != null)
            AD_oppo.videoAd_Revive.destroy();
        //复活视频 初始化
        AD_oppo.videoAd_Revive = qg.createRewardedVideoAd({
            adUnitId: AD_oppo.videoID_TT
        })
        AD_oppo.videoAd_Revive.load();

        AD_oppo.videoAd_Revive.onLoad(function () {
            console.log("激励视频加载成功");
            AD_oppo.videoAd_Revive.show();
            AD_oppo.videoAd_Revive.offLoad();

        })
        AD_oppo.videoAd_Revive.onVideoStart(function () {
            AD_oppo.videoAd_Revive.offVideoStart()
            console.log("激励视频 开始播放");
        })
        AD_oppo.videoAd_Revive.onError((err) => {
            AD_oppo.videoAd_Revive.offError()
            qg.showToast({
                //message: '暂无广告，请稍后重试',
                title: '暂无广告，请稍后重试',
                duration: 2000
            })
            console.log('激励视频 加载错误:  ' + JSON.stringify(err))
        })

        AD_oppo.videoAd_Revive.onClose((res) => {
            console.log("视频关闭  结果是   " + JSON.stringify(res))
            if (res.isEnded) {
                console.log('复活 激励视频广告完成，发放奖励');
                AD.reward();
                AD_oppo.videoAd_Revive.offClose();
            } else {
                AD_oppo.videoAd_Revive.offClose();
                console.log('激励视频广告取消关闭，不发放奖励')
                // cc.director.emit("videoTipView");
            }
        })
    },
    //多久可以展示插屏(一般在loading完毕后调用)
    couldShowChaPing: true,
    durationChaPing:15,//插屏间隔
    //普通插屏
    chaPing() {
        // if(AD.wuDianRate<=0) return;
        if (this.couldShowChaPing == false)
            return;
        this.couldShowChaPing = false;
        setTimeout(() => {
            AD_oppo.couldShowChaPing = true;
        }, AD_oppo.durationChaPing * 1000);
        var self = this;

        var _showSucess = false;
        var winHeight = qg.getSystemInfoSync().windowHeight
        var winWidth = qg.getSystemInfoSync().windowWidth
        if (winHeight > winWidth) { //竖屏
            var _x = winHeight / 2 - (winWidth - 100) / 32 * 9;
            var _width = winWidth - 100
        }
        else {
            var _width = winHeight - 100
            var _x = 50;
        }
        let customAd = qg.createCustomAd({
            adUnitId: AD_oppo.chaPing_TT,
            style: {
                top: _x,
                // left: width / 2,
                width: _width
            },
        });
        customAd.show()
            .then(() => {
                console.log("插屏 show success");
                _showSucess = true;
                if (AD_oppo.autoDestroyDuration > 0) {
                    if (AD_oppo.timeOut) {
                        clearTimeout(AD_oppo.timeOut);
                        AD_oppo.timeOut = null;
                    }
                    AD_oppo.timeOut = setTimeout(() => {
                        if (_showSucess)
                            customAd.destroy();
                            AD_oppo.timeOut = null;
                    }, AD_oppo.autoDestroyDuration * 1000)
                }
            })
            .catch((error) => {
                console.log("show fail with:" + error.errCode + "," + error.errMsg);
            });
        customAd.onError((err) => {

            console.log("模板插屏: " + JSON.stringify(err));
            customAd.offError();
        });
        customAd.onHide(() => {
            console.log("customAd广告隐藏");
            customAd.offHide();
            _showSucess = false;
            if (AD_oppo.timeOut) {
                clearTimeout(AD_oppo.timeOut);
                AD_oppo.timeOut = null;
            }
        });
    },
    chaPingBanner: null,//模板 banner
    /**显示banner */
    showBanner() {

        // if (AD.wuDianRate <= 0) return;
        this.showBannerNormal()
        
        
    },
    hideBanner() {
        // if (AD.wuDianRate<=0) return;

        this.hideBannerNormal()
     
        
    },

    bannerAd: null,//普通banner
    bannerIsOK: false,
    //普通banner
    showBannerNormal() {

        if (AD_oppo.bannerIsOK) {
            console.log("普通banner  只调用展示");
            AD_oppo.bannerAd.show()
            return
        }
        if(AD_oppo.bannerAd){
            AD_oppo.bannerAd.destroy();
            AD_oppo.bannerAd = null;
        }
        console.log("普通banner  生成");
        let screenHeight = qg.getSystemInfoSync().screenHeight;
        let screenWidth = qg.getSystemInfoSync().screenWidth;
        AD_oppo.bannerAd = qg.createBannerAd({
            adUnitId: AD_oppo.bannerID_normal,
            style: {
                top: screenHeight,
                left: 0,
                width: screenWidth,
                height: 300
            }
        })

        AD_oppo.bannerAd.onError(function (err) {
            // AD_oppo.bannerAd = null;
            console.log("banner 加载失败 " + JSON.stringify(err));
            AD_oppo.bannerAd.offError();
        })

        AD_oppo.bannerAd.onLoad(function () {
            AD_oppo.bannerIsOK = true;
            console.log("banner 加载成功  AD_oppo.bannerIsOK"+AD_oppo.bannerIsOK);

        })
        AD_oppo.bannerAd.onHide(function () {
            console.log("banner 广告隐藏");
        });
        AD_oppo.bannerAd.show()
    },
    hideBannerNormal() {
        if (AD_oppo.bannerIsOK) {
            // AD_oppo.bannerAd.destroy()
            AD_oppo.bannerAd.hide();
        }
    },

    /**添加到桌面 */
    addDesktop() {
        if (AD.chanelName != AD.chanelName1)
            return;

        qg.hasShortcutInstalled({
            success: function (res) {
                // 判断图标未存在时，创建图标
                if (res == false) {
                    qg.installShortcut({
                        success: function () {
                            // 执行用户创建图标奖励
                            cc.director.emit("桌面添加成功");
                        },
                        fail: function (err) { 
                            
                            console.log("桌面添加  失败 err"+JSON.stringify(err))
                            cc.director.emit("桌面添加失败");
                        },
                        complete: function () { }
                    })
                }
            },
            fail: function (err) { },
            complete: function () { }
        })
    },


}