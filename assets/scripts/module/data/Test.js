// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    taskTest() {
        // 定义任务
        let tasks = [
            function (callback) {
                console.log("任务 1 开始");
                setTimeout(() => {
                    console.log("任务 1 完成");
                    callback(); // 任务完成后调用 callback，不传递任何参数
                }, 1000);
            },
            function (callback) {
                console.log("任务 2 开始");
                setTimeout(() => {
                    console.log("任务 2 完成");
                    callback();
                }, 500);
            },
            function (callback) {
                console.log("任务 3（场景预加载）开始");
                cc.director.preloadScene("game", (err) => {
                    if (err) {
                        console.error("场景加载失败", err);
                        return callback(err); // 发生错误时传递 err
                    }
                    console.log("场景预加载完成");
                    callback();
                });
            }
        ];
    },

    crossSceneTask() {
        // 定义任务
        let tasks = [
            function (callback) {
                console.log("任务 1: 预加载场景");
                cc.director.preloadScene("game", (err) => {
                    if (err) {
                        console.error("场景加载失败", err);
                        return callback(err);
                    }
                    callback(); // 预加载成功，继续下一个任务
                });
            },

            function (callback) {
                console.log("任务 2: 延时任务");
                // 添加延时 2 秒
                setTimeout(() => {
                    console.log("任务 2: 延时 2 秒后执行");
                    callback(); // 延时结束后继续下一个任务
                }, 2000); // 延时 2000 毫秒（2 秒）
            },
            function (callback) {
                console.log("任务 2: 切换场景");
                cc.director.loadScene("game", () => {
                    // 场景加载完成后的回调
                    let canvas = cc.find("Canvas");
                    if (canvas) {
                        let gameComp = canvas.getComponent("Game");
                        console.log("任务 2: 获取 Game 组件", gameComp);
                    } else {
                        console.error("Canvas 未找到");
                    }
                    callback(); // 完成任务
                });
            }
        ];
    },

    // update (dt) {},
});
