window.AD_TouTiao = {
    //**头条相关 */
    bannerID_TT: "478hhag165l9a9jg5g",//banner // 
    videoID_TT: "2dd2m1112l1ibhii1e",//视频 //  
    chaPing_TT: "h60h505h3i172640j9",//插屏 //  
    shareID_TT: "4tbpnaqklai4244bjj", //分享//  
    appName: "双人迷宫逃生",
    shareTitle_TT: "双人智破迷宫，惊险逃生！",
    phone: "null",
    transcribeBoo: false, //录制视频是否成功
    fenXiangBoo: false, //是否调起分享

    autoVideoBoo: false, //自动视频开关
    fenXiangImgBoo: false, //分享界面相关开关
    autoVideoNum: 0, //关卡通关次数

    TTBanner: null,
    luPingTimer: null,//录屏计时器
    luPingSecond: 0,

    switchOn() {
        AD.wuDianRate = 20;//自点击概率
    },
    /**插屏 */
    chaPing() {
        console.log("显示插屏");
        if (AD.chanelName != AD.chanelName1)
            return;

        // if (AD.wuDianRate == 0) return;
        //const isToutiaio = tt.getSystemInfoSync().appName === "Toutiao";
        const isIOS = tt.getSystemInfoSync().platform === "ios"
        // 插屏广告仅今日头条安卓客户端支持

        if (!isIOS) {
            const interstitialAd = tt.createInterstitialAd({
                adUnitId: AD_TouTiao.chaPing_TT
            });
            console.log("进来了");
            if (!interstitialAd) return;
            interstitialAd
                .load()
                .then(() => {
                    console.log("成功调取插屏");
                    interstitialAd.show();
                })
                .catch(err => {
                    console.log("头条插屏错误   " + JSON.stringify(err));
                });

            interstitialAd.onClose(function () {
                // interstitialAd.destroy();
                console.log("头条插屏关闭  后销毁 ");

            });
            interstitialAd.onError(function (err) {
                console.log("头条插屏错误1   " + JSON.stringify(err));
            });
        }
    },
    /**视频 
     * @method ： 成功方法
     * @method1 ：失败方法
     * @caller ：作用域
     * @data ：参数
     * */
    shiPin() {
        if (AD.chanelName != AD.chanelName1) {
            AD.reward();
            return;
        }
        let video_retry_times = 0;
        let videoAd = tt.createRewardedVideoAd({
            adUnitId: AD_TouTiao.videoID_TT,
        });
        videoAd.load()
            .then(() => {
                videoAd.show()

                // cc.director.pause();//暂停creator
                // cc.game.pause();  //有时候需要打开有时候需要注掉。。。同95行
            })
            .catch(err => {
                console.log(err.errMsg)
            });
        let loadCallback = () => {
            console.log("sdk videoAd start ........")
        };
        let errorCallback = (res) => {
            console.log(JSON.stringify(res));
            if (video_retry_times >= 0 && video_retry_times < 1) {
                videoAd.load()
                    .then(() => {
                        videoAd.show();
                        cc.director.pause();
                    })
                    .catch(err => {
                        console.log(err.errMsg);

                        // cc.director.resume();//暂停creator
                        //加载视频失败
                    });
                video_retry_times++;
            } else if (video_retry_times >= 1) {
                videoAd.offLoad(loadCallback);
                videoAd.offClose(closeCallback);
                videoAd.offError(errorCallback);
                console.log("miaoju_watch_retry_times" + video_retry_times);
                video_retry_times = -1;
            }
        };
        //关闭
        let closeCallback = (res) => {
            console.log("临时关闭视频：" + res);
            if (res.isEnded) {
                //发道具 
                //成功回调
                console.log("视频成功了，走成功回调");
                cc.director.resume();//暂停creator
                AD.reward();
            }
            else {
                console.log("视频失败了，走失败回调");
                // method1.call(caller,data[0]);
                cc.director.resume();//暂停creator
            }
            videoAd.offLoad(loadCallback);
            videoAd.offClose(closeCallback);
            videoAd.offError(errorCallback);
        };
        videoAd.onLoad(loadCallback);
        videoAd.onError(errorCallback);
        videoAd.onClose(closeCallback);
    },

    bannerLoadSucess: false,
    initBanner() {
        if (AD.chanelName != AD.chanelName1)
            return;

        // if (AD.wuDianRate == 0) return;

        const { windowWidth, windowHeight } = tt.getSystemInfoSync();
        var targetBannerAdWidth = 128;
        AD_TouTiao.TTBanner = tt.createBannerAd({
            adUnitId: AD_TouTiao.bannerID_TT,
            adIntervals:32,
            style: {
                width: targetBannerAdWidth,
                top: windowHeight - (targetBannerAdWidth / 16) * 9 - 10 // 根据系统约定尺寸计算出广告高度
            }
        });

        console.log("banner init")
        AD_TouTiao.TTBanner.onLoad(()=> {
            console.log("banner加载成功  ");
            AD_TouTiao.bannerLoadSucess = true;
            AD_TouTiao.TTBanner.show()
                .then(() => {
                    console.log('广告显示成功');
                })
                .catch(err => {
                    console.log('banner load错误 : ', err);
                })
        });

        AD_TouTiao.TTBanner.onResize(size => {
            console.log("改变size");
            AD_TouTiao.TTBanner.style.left = ((windowWidth - size.width) / 2);
            AD_TouTiao.TTBanner.style.top = windowHeight - size.height;
        });


        let errCallBack = (res) => {
            console.log("banner加载错误  " + JSON.stringify(res));
        };
        AD_TouTiao.TTBanner.onError(errCallBack);


    },
    /**显示banner */ 
    showBanner() {
        if (AD.chanelName != AD.chanelName1)
            return;

        // if (AD.wuDianRate == 0) return;
        // console.log("banner 调用");
        // if (AD_TouTiao.bannerLoadSucess) {
        //     AD_TouTiao.TTBanner.show()
        //         .then(() => {
        //             console.log('广告显示成功');
        //         })
        //         .catch(err => {
        //             console.log('广告组件出现问题', err);
        //         })
        // }
        // else
        AD_TouTiao.initBanner();
    },


    /**隐藏banner */
    hideBanner() {
        if (AD.chanelName != AD.chanelName1)
            return;

        // if (AD.wuDianRate == 0) return;
        // AD_TouTiao.TTBanner = null
        if(AD_TouTiao.bannerLoadSucess)
        AD_TouTiao.TTBanner.destroy();

        // if (AD_TouTiao.bannerLoadSucess)
        //     AD_TouTiao.TTBanner.hide();
    },
    /**开始录屏 */
    luPingBegin() {
        if (AD.chanelName != AD.chanelName1)
            return;
        this.luPingSecond = 0;
        this.luPingTimer = setInterval(() => {
            this.luPingSecond++;
        }, 1000);

        console.log("录屏开始")
        console.log("luping  開始")
        AD_TouTiao.transcribeBoo = false; //录制视频是否成功
        AD_TouTiao.fenXiangBoo = false; //是否调起分享
        AD_TouTiao.resVideoPathTouTiao = null; //录制视频地址
        let recorder = tt.getGameRecorderManager();
        if (!recorder) return;
        tt.onShow((res) => {
            recorder.resume();
        });
        tt.onHide(() => {
            recorder.pause();
        })

        recorder.onStart(res => {
            console.log('录屏开始');

        });

        recorder.start({ duration: 300, });
    },
    /**头条录屏结束 */
    luPingOver() {//头条录屏结束
        if (AD.chanelName != AD.chanelName1)
            return;

        if (AD_TouTiao.transcribeBoo == true) return;
        clearInterval(this.luPingTimer);
        AD_TouTiao.transcribeBoo = true;
        console.log("录屏结束")
        if (AD.chanelName == AD.chanelName1) {
            console.log("luping  結束");
            let recorder = tt.getGameRecorderManager();
            if (!recorder) return;
            tt.offShow(() => {
            });
            tt.offHide(() => {
            });
            recorder.onStop(res => {
                AD_TouTiao.resVideoPathTouTiao = res.videoPath;
                console.log('录屏结束：' + res.videoPath);
                console.log('录屏结束：' + res);

            });

            recorder.stop();
        }


    },
    /**录屏分享  
     * @method ： 成功方法
     * @method1 ：失败方法
     * @caller ：作用域
     * @data ：参数
     * */
    luPingShare() {//胜利界面录屏分享
        if (AD.chanelName != AD.chanelName1) {
            // method1.call(caller,"无地址");  
            return;
        }
        if (AD_TouTiao.resVideoPathTouTiao == null) {
            // method1.call(caller,"无地址");  
            return;
        }

        //在需要的地方调用
        if (AD_TouTiao.luPingSecond >= 18) {//可以显示分享弹窗

        }

        // if (AD_TouTiao.fenXiangBoo) return;
        // AD_TouTiao.fenXiangBoo = true;
        cc.log("分享视频 = " + AD_TouTiao.resVideoPathTouTiao);
        tt.shareAppMessage({
            channel: 'video',
            query: "",
            // templateId: AD_TouTiao.shareID_TT, // 替换成通过审核的分享ID
            title: AD_TouTiao.shareTitle_TT,
            desc: AD_TouTiao.shareTitle_TT,
            extra: {
                videoPath: AD_TouTiao.resVideoPathTouTiao, // 可用录屏得到的视频地址
                videoTopics: [AD_TouTiao.appName, "抖音小游戏"],
                hashtag_list: [AD_TouTiao.appName, "抖音小游戏"],
                video_title: AD_TouTiao.shareTitle_TT
            },
            success() {
                console.log('分享视频成功');
                // method.call(caller,data[0]);
                AD_TouTiao.fenXiangBoo = false;
                cc.director.emit("分享成功");
            },
            fail(e) {
                console.log(e);
                console.log('分享视频失败');

                // if (e.errMsg && e.errMsg != "shareAppMessage:cancel") {

                    // cc.director.emit("系统提示", "录屏失败：录屏时长低于 3 秒");

                    // tt.showToast({
                    //     title: "录屏时长低于3秒",
                    //     duration: 2000,
                    //     success(res) {
                    //         console.log(`${res}`);
                    //     },
                    //     fail(res) {
                    //         console.log(`showToast调用失败`);
                    //     },
                    // });

                // }
                // AD_TouTiao.fenXiangBoo = false;
            }
        })

    },
    /**视频分享 */
    shareTTNormal() {//头条视频分享分享
        if (AD.chanelName != AD.chanelName1)
            return;
        // if(AD_TouTiao.chanelName=="touTiao") 
        {//头条录屏
            cc.log("分享视频 = " + AD_TouTiao.resVideoPathTouTiao);
            tt.shareAppMessage({
                channel: '',
                query: "",
                templateId: AD_TouTiao.shareID_TT, // 替换成通过审核的分享ID
                title: AD_TouTiao.shareTitle_TT,
                desc: AD_TouTiao.shareTitle_TT,
                extra: {
                    videoPath: AD_TouTiao.resVideoPathTouTiao, // 可用录屏得到的视频地址
                    videoTopics: [AD_TouTiao.appName, AD_TouTiao.shareTitle_TT, "抖音小游戏"]
                },
                success() {

                },
                fail(e) {
                    console.log(e);
                    console.log('分享视频失败');
                    if (e.errMsg && e.errMsg != "shareAppMessage:cancel") {
                        cc.director.emit("系统提示", "录屏失败：录屏时长低于 3 秒");
                    }
                }
            })
        }
    },


    //添加桌面
    addDesktop() {
        tt.addShortcut({
            success() {
                console.log("添加桌面成功");

            },
            fail(err) {
                console.log("添加桌面失败", err.errMsg);
                tt.showToast({
                    title: "添加桌面失败",
                    duration: 1000,
                    success(res) {
                        console.log(`${res}`);
                    },
                    fail(res) {
                        console.log(`showToast调用失败`);
                    },
                });
            },
        });
    },
    //是否可以显示添加桌面按钮
    showBtnAddToDesk() {
        if (AD.chanelName != AD.chanelName1) return;

        var _couldShow = false;
        try {
            var res = tt.getSystemInfoSync();
            console.log(`手机型号为 ${res.model}`);
            if (res.platform == "android")//只有android可以添加桌面
            {
                tt.checkShortcut({
                    success(res) {
                        console.log("检查快捷方式", res.status);
                        if (res.status.exist == false) {//桌面没有图标 可以添加桌面
                            _couldShow = true;
                        }
                        else if (res.status.needUpdate) {//有桌面图标了  但是需要更新 也需要添加
                            _couldShow = true;
                        }

                        return _couldShow;
                    },
                    fail(res) {
                        console.log("检查快捷方式失败", res.errMsg);
                        return _couldShow;
                    },
                });
            }
        } catch (error) {
            console.log(`获取系统信息失败`);
            return _couldShow;
        }



    },
  fenXiang(){
        console.log("sssssssssssssssss")
        tt.shareAppMessage({
            templateId:AD.shareID_TT, // 替换成通过审核的分享ID
            title: AD.shareTitle_TT,
            desc: AD.shareTitle_TT,
            imageUrl: "",
            query: "",
            success() {
              console.log("分享视频成功");
            },
            fail(e) {
              console.log("分享视频失败");
            },
          });
    },
}