

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        if (AD.chanelName != "vivo" && AD.chanelName1 != "oppo" && AD.chanelName1 != "QQ" 
        && AD.chanelName1 != "honor"&& AD.chanelName1 != "huaWei") {
            this.node.active = false;
        }
        else {
            if (AD.wuDianRate <= 0) {
                this.node.active = false;
                return;
            }
            // cc.tween(this.node)
            //     .repeatForever(
            //         cc.tween()
            //             .to(0.3, { scale: 1.1 })
            //             .to(0.3, { scale: 1.0 })
            //     )
            //     .start();
        }

        this.node.on("touchend", () => {
            console.log("addToDesk");
            this.addToDesk();
        }, this);
    },

    addToDesk() {
        if (AD.chanelName != AD.chanelName1) return;
        switch (AD.chanelName) {
            case "vivo":
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
                break;
            case "huaWei":         
                qg.hasShortcutInstalled({
                    success: function (ret) {
                        console.log('hasInstalled success ret---' + ret);
                        if (ret) {
                            // 桌面图标已创建    
                        } else {
                            // 桌面图标未创建
                            qg.installShortcut({
                                message: '将快捷方式添加到桌面以便下次使用',
                                success: function (ret) {
                                    console.log('handling createShortCut success');
                                },
                                fail: function (erromsg, errocode) {
                                    console.log('handling createShortCut fail');
                                }.bind(this),
                            })
                        }
                    }.bind(this),
                    fail: function (erromsg, errocode) {
                        console.log('hasInstalled fail ret---' + erromsg);
                    }.bind(this),
                    complete: function () {
                    }
                })
                break;
            case "QQ":
                AD_QQ.saveToDesktopQQ();
                break;
            case "oppo":

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

                                    console.log("桌面添加  失败 err" + JSON.stringify(err))
                                    cc.director.emit("桌面添加失败");
                                },
                                complete: function () { }
                            })
                        }
                    },
                    fail: function (err) { },
                    complete: function () { }
                })
                break;
            case "touTiao":
                AD_TouTiao.addDesktop();
                break;
            case "honor":
                qg.hasShortcutInstalled({
                    success: function (status) {
                        if (status) {
                            console.log('已创建')
                            qg.showToast({
                                title: "创建成功",
                            })
                        } else {
                            console.log('未创建')
                            qg.installShortcut({
                                success: function () {
                                    console.log("创建成功");
                                    qg.showToast({
                                        title: "创建成功",
                                    })
                                }
                            });
                        }
                    }
                })
                break;
        }
    },


    // update (dt) {},
});
