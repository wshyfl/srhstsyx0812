
window.AD_vivo = {
    bannerID_TT: "75b7269b7d0947298f77a707c0b8deb3",//banner普通
    chaPing_TT: "4ac593ba18d841f1a7d3ff567bf9612d",//原生插屏
    videoID_TT: "55f6a329346e414dbc69dc6abd823045",//视频
    box_id: "9130b0c502d54d69bf90515d769ff56d",//互推九宫格
    
    banner: null,
    couldShowChaPing: true,//
    chaPingInterval: 5,

    //开关开启调用一次
    switchOn() {
        AD.wuDianRate = 20;//自点击概率
        //盒子广告
        AD_vivo.showBox();
        setTimeout(() => {
            AD_vivo.showBox();
        }, 10*1000);
    },
    /**视频 */
    shiPin() {
        if (AD.chanelName != AD.chanelName1) {
            AD.reward()
            return;
        }

        const rewardedAd = qg.createRewardedVideoAd({
            posId: AD_vivo.videoID_TT,
        });

        rewardedAd.onError(err => {
            // cc.audioEngine.resumeAll();
            // cc.audioEngine.resumeMusic();
            // cc.audioEngine.resumeAllEffects();
            console.log("激励视频广告加载失败", err);
            qg.showToast({
                message: "暂无广告"
            });
        });
        rewardedAd.onLoad(function (res) {
            console.log('激励视频广告加载完成-onload触发', JSON.stringify(res));
            // cc.audioEngine.pauseAll();
            // cc.audioEngine.pauseMusic();
            // cc.audioEngine.pauseAllEffects();
            rewardedAd.show().then(() => {
                console.log('激励视频广告展示完成');
            }).catch((err) => {
                // cc.audioEngine.resumeAll();
                // cc.audioEngine.resumeMusic();
                // cc.audioEngine.resumeAllEffects();
                console.log('激励视频广告展示失败', JSON.stringify(err));
                qg.showToast({
                    message: "暂无广告"
                });
                switch (err.errCode) {
                    case -3:
                        console.log("激励广告加载失败---调用太频繁", JSON.stringify(err));
                        break;
                    case -4:
                        console.log("激励广告加载失败--- 一分钟内不能重复加载", JSON.stringify(err));
                        break;
                    case 30008:
                        // 当前启动来源不支持激励视频广告，请选择其他激励策略
                        break;
                    default:
                        // 参考 https://minigame.vivo.com.cn/documents/#/lesson/open-ability/AD?id=广告错误码信息 对错误码做分类处理
                        console.log("激励广告展示失败")
                
                        break;
                }

            })
        })
        const func = (res) => {
            // cc.audioEngine.resumeAll();
            // cc.audioEngine.resumeMusic();
            // cc.audioEngine.resumeAllEffects();
            console.log('视频广告关闭回调')
            if (res && res.isEnded) {
                console.log("正常播放结束，可以下发游戏奖励");
                AD.reward()
            } else {
                console.log("播放中途退出，不下发游戏奖励");
                // method1.call(caller,data[0]);
            }
            // AD.audioMng.playMusic();
        }
        rewardedAd.onClose(func);
    },



    initBanner() {
        if (AD_vivo.chanelName != AD_vivo.chanelName1)
            return;
        const {
            screenHeight,
            screenWidth,
        } = qg.getSystemInfoSync();
        AD_vivo.banner = qg.createBannerAd({
            posId: AD_vivo.bannerID_TT,
        });
        AD_vivo.banner.onResize(size => {
            console.log("改变size");
            // if (AD_vivo.banner.style.left < ((screenWidth - size.width) / 2)) {
            //     AD_vivo.banner.style.left = ((screenWidth - size.width) / 2);
            // }
        });
        AD_vivo.banner.onLoad(function () {

        });

        let errCallBack = (res) => {
            console.log("banner错误 " + JSON.stringify(res));
        };
        AD_vivo.banner.onError(errCallBack);
    },
    /**显示banner */
    showBanner(...isBox) {
        console.log("banner 调用  showBanner");
        if (AD.chanelName != AD.chanelName1)
            return;
            
            
            this.showBannerNormal();

    },
    
    showBannerNormal() {

        if (AD_vivo.banner == null)
            AD_vivo.initBanner();
        AD_vivo.banner.show()
            .then(() => {
                console.log('banner 广告显示成功');
            })
            .catch(err => {
                console.log('banner 展示错误', JSON.stringify(err));
            })
    },
    /**隐藏banner */
    hideBanner() {
        if (AD.chanelName != AD.chanelName1)
            return;
            

        if (AD_vivo.banner != null) {
            console.log("banner 隐藏")
            AD_vivo.banner.destroy();
            AD_vivo.banner = null;
            AD_vivo.initBanner();
        }
        
    },
    chaPing() {
        if (AD.chanelName != AD.chanelName1)
            return;
        if (this.couldShowChaPing == false) return;
        setTimeout(() => {
            this.couldShowChaPing = true;
        }, 1000 * this.chaPingInterval)
        this.couldShowChaPing = false;

        //原生模板插屏
        const {
            screenHeight,
            screenWidth,
        } = qg.getSystemInfoSync();



        var _x = 0;
        if (screenWidth > screenHeight)
            _x = (screenWidth - 720) / 2;
        console.log("当前屏幕高度：" + screenHeight);
        const customAd = qg.createCustomAd({
            posId: AD_vivo.chaPing_TT,
            style: {
                // top: (screenHeight - 630) / 2//竖屏
                top: (screenHeight - 630) / 2,
                left: _x,
            }
        });
        customAd.onError(err => {
            console.log("原生模板广告加载失败", err);
        });
        customAd.show().then(() => {
            console.log('原生模板广告展示完成');
            cc.director.emit("vivo插屏显示", true)
        }).catch((err) => {
            console.log('原生模板广告展示失败', JSON.stringify(err));
        })
        customAd.onClose(() => {
            console.log('原生模板广告关闭');
            cc.director.emit("vivo插屏显示", false)
        })
    },
    
    showBox() {
        if (AD.chanelName != AD.chanelName1) return
        if (AD.chanelName1 != "vivo") return

        if (qg.createBoxPortalAd) {
            if (AD_vivo.boxPortalAd) return
            AD_vivo.boxPortalAd = qg.createBoxPortalAd({
                posId: AD_vivo.box_id,

                marginTop: 50
            })
            AD_vivo.boxPortalAd.onError(function (err) {
                console.log("盒子九宫格广告加载失败", err)
            })
            AD_vivo.boxPortalAd.onClose(function () {
                console.log('盒子九宫格广告close')
                AD_vivo.boxPortalAd = null;
                if (AD_vivo.boxPortalAd.isDestroyed) {
                    return
                }
                // 当九宫格关闭之后，再次展示Icon
                AD_vivo.boxPortalAd.show()
            })
            // 广告数据加载成功后展示
            AD_vivo.boxPortalAd.show().then(function () {
                console.log('盒子九宫格广告show success')
            })
        }
        else {
            console.log('暂不支持互推盒子相关 API')
        }
    },
    hideBox() {
        if (AD_vivo.boxPortalAd != null) {
            AD_vivo.boxPortalAd.isDestroyed = true
            AD_vivo.boxPortalAd.destroy();
            AD_vivo.boxPortalAd = null;
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
                        },
                        fail: function (err) { },
                        complete: function () { }
                    })
                }
            },
            fail: function (err) { },
            complete: function () { }
        })
    },

    //获得随机整数 上下限都包括
    random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    },
    
    
}