
const Constants = require('../../module/data/Constants');
const ResourceMng = require('ResourceMng');
const SceneMng = require('SceneMng');
let UIManager = cc.Class({
    // LIFE-CYCLE CALLBACKS:

    start() {
        this.dictSharedPanel = {};   // 存储已加载的共享对话框节点，以便复用和快速显示/隐藏
        this.loadingDialogPaths = {};       // 跟踪正在加载的对话框路径，避免重复加载相同的对话框
        this.arrPopupDialog = [];    // 存储弹出对话框的队列，用于按顺序管理和控制弹出对话框
        this.lastClickTime = 0;      // 记录上次点击时间，用于防连点
        this.clickInterval = 0.2;    // 最小点击间隔（秒）
    },
    // 弹窗出现动画：缩放和透明度渐变
    // showPopup(popRoot, callback) {
    //     // 初始化弹窗的状态（缩小、透明）
    //     if (cc.director._isPaused) {
    //         this.showPopupPause(popRoot, callback)
    //     } else {
    //         popRoot.scale = 0;
    //         popRoot.opacity = 0;
    //         cc.tween(popRoot)
    //             .to(0.5, { scale: 1, opacity: 255 }, { easing: 'backOut' }) // backOut 函数使弹窗弹出时带有弹性效果
    //             .call(() => {
    //                 callback && callback()
    //             })
    //             .start();
    //     }

    // },
    /**
     * 显示弹窗，动画独立于 cc.kSpeed(0) 暂停系统
     * @param {cc.Node} popRoot 弹窗根节点
     * @param {Function} callback 动画完成后的回调函数
     */
     showPopup(popRoot, callback) {
        // 确保弹窗挂载到全局根节点
        // 初始化弹窗状态
        popRoot.scale = 0;
        popRoot.opacity = 0;
        // 动画参数
        let duration = 0.5; // 动画时长
        let elapsed = 0; // 已逝时间
        let scheduler = cc.director.getScheduler();
        // 自定义 backOut 缓动函数
        const backOut = (t) => {
            const s = 1.70158; // backOut 弹性参数
            return (t = t - 1) * t * ((s + 1) * t + s) + 1;
        };
        // 更新函数
        let updateFunc = () => {
            let dt = cc.kGetRawDeltaTime(); // 使用原始 deltaTime
            elapsed += dt;
            let progress = Math.min(elapsed / duration, 1); // 动画进度（0到1）
            // 应用 backOut 缓动
            let easedProgress = backOut(progress);
            // 更新 scale 和 opacity
            popRoot.scale = easedProgress * 1; // 从 0 到 1
            popRoot.opacity = easedProgress * 255; // 从 0 到 255
            // 动画完成
            if (progress >= 1) {
                popRoot.scale = 1;
                popRoot.opacity = 255;
                scheduler.unschedule(updateFunc, popRoot); // 停止调度
                callback && callback(); // 执行回调
            }
        };

        // 使用全局调度器运行动画
        scheduler.schedule(updateFunc, popRoot, 0, cc.macro.REPEAT_FOREVER, 0, false);
    },
    // 弹窗消失动画：缩小和透明度渐变
    hidePopup(hideRoot, callback) {
        let ysSc = hideRoot.scale;
        let usOpa = hideRoot.opacity;
        cc.tween(hideRoot)
            .to(0.2, { scale: 0, opacity: 0 }, { easing: 'backIn' }) // backIn 函数使弹窗缩回时带有弹性效果
            .call(() => {
                hideRoot.scale = ysSc;
                hideRoot.opacity = usOpa;
                callback && callback()
            })
            .start();
    },

    //隐藏隐形遮罩
    hideSharedMask() {
        this.dictSharedPanel['ui/global/ModalMask'].parent = null;
    },
    /**
     * 隐藏单例界面 有动画
     * @param {String} panelPath 
     * @param {Function} callback
     */
    hideSharedDialog(panelPath, callback) {
        if (this.dictSharedPanel.hasOwnProperty(panelPath)) {
            let panel = this.dictSharedPanel[panelPath];
            if (panel && cc.isValid(panel)) {
                this.hidePopup(panel.getChildByName("root"), () => {
                    panel.active = false;
                    panel.parent = null;
                    callback && callback();
                })
            }

        }
        this.loadingDialogPaths[panelPath] = false;
    },
    /**
    * 直接隐藏单例界面 无动画
    * @param {String} panelPath 
    */
    directlyHideSharedlog(panelPath) {
        if (this.dictSharedPanel.hasOwnProperty(panelPath)) {
            let panel = this.dictSharedPanel[panelPath];
            if (panel && cc.isValid(panel)) {
                panel.active = false;
                panel.parent = null;
            }
        }
        this.loadingDialogPaths[panelPath] = false;
    },

    //隐藏所有单例界面
    hideAllSharedDialog() {
        for (const key in this.dictSharedPanel) {
            this.directlyHideSharedlog(key);
        }
    },

    // 检查是否可以处理点击（防连点）
    canProcessClick() {
        let currentTime = Date.now() / 1000; // 当前时间（秒）
        if (currentTime - this.lastClickTime < this.clickInterval) {
            return false; // 时间间隔太短，忽略点击
        }
        this.lastClickTime = currentTime; // 更新上次点击时间
        return true;
    },

    //预加载下一个场景
    loadNextGameScene(sceneName) {
        let tasks = [
            function (callback) {
                cc.director.preloadScene(sceneName, (err) => {
                    callback();
                });
            },
            function (callback) {
                cc.director.loadScene(sceneName, (err) => {
                    console.log("游戏场景加载成功")
                    callback();
                });
            },
            function (callback) {
                cc.find("Canvas").getComponent("Game").initMap(() => {
                    callback();
                })
            },
            function (callback) {
                cc.find("Canvas").getComponent("Game").initMiNi(() => {
                    callback();
                })
            },
            function (callback) {
                cc.find("Canvas").getComponent("Game").initJoy(() => {
                    callback();
                })
            },
            function (callback) {
                cc.find("Canvas").getComponent("Game").initPlayer(() => {
                    callback();
                })
            },

            function (callback) {
                cc.find("Canvas").getComponent("Game").initJuQing(() => {
                    callback();
                })
            },
            //写几个模拟假的延时
            function (callback) {
                setTimeout(() => {
                    callback();
                }, 50);
            },
            function (callback) {
                setTimeout(() => {
                    callback();
                }, 50);
            },
        ];

        this.showLoadingWithTask(tasks, () => {
            console.log("游戏场景初始化完毕,进入游戏场景")
            cc.find("Canvas").getComponent("Game").gameLoadComplete();
        });
    },
    //预加载下一个场景
    loadNextGameSceneJJ(sceneName) {
        let tasks = [
            function (callback) {
                cc.director.preloadScene(sceneName, (err) => {
                    callback();
                });
            },
            function (callback) {
                cc.director.loadScene(sceneName, (err) => {
                    console.log("游戏场景加载成功")
                    callback();
                });
            },
            function (callback) {
                //写几个模拟假的延时
                setTimeout(() => {
                    callback();
                }, 200);
            },
            function (callback) {
                //写几个模拟假的延时
                setTimeout(() => {
                    callback();
                }, 200);
            },
            function (callback) {
                //写几个模拟假的延时
                setTimeout(() => {
                    callback();
                }, 200);
            },
            function (callback) {
                //写几个模拟假的延时
                setTimeout(() => {
                    callback();
                }, 200);
            },


        ];

        this.showLoadingWithTask(tasks, () => {
            console.log("游戏场景初始化完毕,进入游戏场景")
        });
    },

    /**UI弹窗 */
    //显示隐形遮罩 
    showSharedMask() {
        this.dictSharedPanel['ui/global/ModalMask'].parent = cc.find("Canvas");;
        this.dictSharedPanel['ui/global/ModalMask'].setPosition(0, 0);
        this.dictSharedPanel['ui/global/ModalMask'].zIndex = Constants.ZORDER.ZMAX;
    },

    /**
     * 显示loading界面 不能跨场景  
     * @param {Number} loadTime 加载时间
     * @param {Boolean} isControl 是否手动控制
     */
    showLoading(loadTime, isControl = false) {
        if (this.dictSharedPanel["ui/global/GameLoading"]) {
            const panelNode = this.dictSharedPanel["ui/global/GameLoading"];
            if (cc.isValid(panelNode)) {
                panelNode.parent = cc.find("Canvas");
                panelNode.active = true;
                panelNode.zIndex = Constants.ZORDER.TIPS;
                let gameLoading = panelNode.getComponent("GameLoading");
                gameLoading.init(loadTime);
                if (isControl === false) {
                    gameLoading.setLoadCompelect(1, () => {
                        this.directlyHideSharedlog("ui/global/GameLoading")
                    });
                } else {
                    return gameLoading; // 返回实例以便手动控制
                }
            }
        }
    },

    /**
     * 显示loadingTask界面 跨场景加载
     * @param {Number} tasks 任务队列
     * @param {Function} callback 完成后的回调
     */
    showLoadingWithTask(tasks, callback) {
        if (this.dictSharedPanel["ui/global/Loading"]) {
            const panelNode = this.dictSharedPanel["ui/global/Loading"] // cc.instantiate(this.dictSharedPanel["Loading"]);
            if (cc.isValid(panelNode)) {
                if (!cc.game.isPersistRootNode(panelNode)) {
                    cc.game.addPersistRootNode(panelNode); // 仅首次设置为常驻
                }
                panelNode.active = true;
                panelNode.zIndex = Constants.ZORDER.TIPS;
                panelNode.getComponent("LoadingUI").startLoading(tasks, () => {
                    //cc.game.removePersistRootNode(panelNode); // 完成后移除持久状态
                    callback && callback();
                });
            }
        }
    },

    //显示提示界面
    showTip(text, duration = 1.8) {
        if (this.dictSharedPanel["ui/global/Tip"]) {
            const panelNode = GlobalMng.poolMng.getNode(this.dictSharedPanel["ui/global/Tip"]);
            if (cc.isValid(panelNode) && !panelNode.parent) {
                panelNode.parent = cc.find("Canvas");
                panelNode.active = true;
                panelNode.zIndex = Constants.ZORDER.TIPS;
                panelNode.setPosition(0, - 200);
                panelNode.getComponent("Tip").showTip(text, duration, () => {
                    GlobalMng.poolMng.putNode(panelNode)
                })
            }
        }
    },


    //快速显示预制弹窗
    showOnceQuickDialog(panelPath, parent = null, callBack) {
        let parentNode = parent || cc.find("Canvas");
        let panelNode = cc.instantiate(this.dictSharedPanel[panelPath]);
        panelNode.parent = parentNode;
        panelNode.setPosition(0, 0);
        panelNode.zIndex = Constants.ZORDER.DIALOG;
        callBack && callBack(panelNode)
    },

    //不存储对话框UI
    showOnceDialog(panelPath, parent = null, callBack) {
        if (!this.canProcessClick()) return; // 防连点
        SceneMng.createUIByBundle(panelPath, parent, (panelNode) => {
            let parentNode = parent || cc.find("Canvas");
            // 保存加载后的节点并设置层级和动画
            panelNode.parent = parentNode;
            panelNode.active = true;
            panelNode.setPosition(0, 0);
            panelNode.zIndex = Constants.ZORDER.DIALOG;
            callBack && callBack(panelNode)
        });
    },
    //不存储对话框UI分屏
    showOnceDialogSplite(path, parent, cltype, callBack, posY = 150) {
        if (!this.canProcessClick()) return; // 防连点
        SceneMng.createUIByBundle(path, parent, (panelNode) => {
            if (!panelNode) {
                console.error(`Failed to create effect node from path: ${path}`);
                return;
            }
            panelNode.parent = parent;
            panelNode.zIndex = Constants.ZORDER.DIALOG;
            if (GlobalMng.isSingle()) {
                panelNode.setPosition(0, posY);
            } else {
                if (cltype == 1) {
                    panelNode.setPosition(GlobalMng.getDoubleLeftCenter().x, posY);
                } else {
                    panelNode.setPosition(GlobalMng.getDoubleRightCenter().x, posY);
                }
            }
            callBack && callBack(panelNode);
        });
    },
    /**
    * 显示单例界面,节点不销毁,必须手动隐藏 UI弹窗层级
    * @param {string} panelPath - 预制体路径。
    * @param {Node|null} parent - 父节点
    *      * @param {Function} callback
    * @param {Array} args - 可选参数，将传递给脚本的 show 方法。
    */
    showSharedDialog(panelPath, parent = null, args = []) {
        // 检查是否已在加载中，避免重复加载
        if (this.loadingDialogPaths[panelPath]) return;
        if (!this.canProcessClick()) return; // 防连点

        let parentNode = parent || cc.find("Canvas");
        // 如果对话框已存在，直接显示
        if (this.dictSharedPanel[panelPath] && cc.isValid(this.dictSharedPanel[panelPath])) {
            let panelNode = this.dictSharedPanel[panelPath];
            if (cc.isValid(panelNode)) {
                panelNode.parent = parentNode;
                panelNode.active = true;
                panelNode.setPosition(0, 0);
                panelNode.zIndex = Constants.ZORDER.DIALOG;
                const script = panelNode.getComponent("AShareUIBase");
                if (script && typeof script.setPrefabPath === "function") {
                    script.setPrefabPath(panelPath);
                }
                if (script && typeof script.show === "function") {
                    script.show(...args); // 使用展开操作符传递参数
                }
            }
        } else {
            // 启动加载对话框
            this.loadingDialogPaths[panelPath] = true;
            SceneMng.createUIByBundle(panelPath, parentNode, (panelNode) => {
                const isClosedBeforeShow = !this.loadingDialogPaths[panelPath]; // 检查是否在显示前已被关闭
                this.loadingDialogPaths[panelPath] = false;
                // 保存加载后的节点并设置层级和动画
                panelNode.parent = parentNode;
                panelNode.active = true;
                panelNode.setPosition(0, 0);
                panelNode.zIndex = Constants.ZORDER.DIALOG;
                this.dictSharedPanel[panelPath] = panelNode;
                // 如果在显示前已被关闭，则直接关闭
                if (isClosedBeforeShow) {
                    this.directlyHideSharedlog(panelPath)
                } else {
                    const script = panelNode.getComponent("AShareUIBase");
                    if (script && typeof script.setPrefabPath === "function") {
                        script.setPrefabPath(panelPath);
                    }
                    if (script && typeof script.show === "function") {
                        script.show(...args); // 使用展开操作符传递参数
                    }

                }
            });

        }
    },

    // 游戏中的提示文字、提示信息
    createGameTipMessage(path, parent, pos, callBack) {
        SceneMng.createUIByBundle(path, parent, (effNode) => {
            if (!effNode) {
                console.error(`Failed to create effect node from path: ${path}`);
                return;
            }
            effNode.parent = parent;
            effNode.zIndex = Constants.ZORDER.GAME_MESSAGE;
            if (pos) {
                effNode.setPosition(pos);
            }
            callBack && callBack(effNode);
        });
    },

    // 游戏中的提示文字、提示信息分屏
    createGameTipMessageSplite(path, parent, cltype, callBack, posY = 150) {
        SceneMng.createUIByBundle(path, parent, (effNode) => {
            if (!effNode) {
                console.error(`Failed to create effect node from path: ${path}`);
                return;
            }
            effNode.parent = parent;
            effNode.zIndex = Constants.ZORDER.GAME_MESSAGE;
            if (GlobalMng.isSingle()) {
                effNode.setPosition(0, posY);
            } else {
                if (cltype == 1) {
                    effNode.setPosition(GlobalMng.getDoubleLeftCenter().x, posY);
                } else {
                    effNode.setPosition(GlobalMng.getDoubleRightCenter().x, posY);
                }
            }
            callBack && callBack(effNode);
        });
    },



    /**
    * 游戏中的通用效果
    */
    createGamePublic(path, parent, pos, callBack) {
        SceneMng.createUIByBundle(path, parent, (effNode) => {
            if (!effNode) {
                console.error(`Failed to create effect node from path: ${path}`);
                return;
            }
            effNode.parent = parent;
            effNode.zIndex = Constants.ZORDER.FIGHT_NUM;
            // 设置位置（如果提供了 pos）
            if (pos) {
                effNode.setPosition(pos);
            }
            callBack && callBack(effNode);
        });
    },
    /**
     * 游戏中的魔法数字 特效、动画、通用
     * @param {string} path - 特效资源的路径（如预制体路径）
     * @param {cc.Node} parent - 特效节点的父节点
     * @param {cc.Vec2} [pos] - 特效放置的位置（可选，默认不设置位置）
     * @param {string|null} scriptName - 需要获取的脚本组件名称。
     * @param {Array} args - 参数，将传递给 initEffect 方法。
     */
    createGameEffect(path, parent, pos, scriptName, args = []) {
        SceneMng.createUIByBundle(path, parent, (effNode) => {
            if (!effNode) {
                console.error(`Failed to create effect node from path: ${path}`);
                return;
            }
            effNode.parent = parent;
            effNode.zIndex = Constants.ZORDER.FIGHT_NUM;
            // 设置位置（如果提供了 pos）
            if (pos) {
                effNode.setPosition(pos);
            }
            if (scriptName) {
                const script = effNode.getComponent(scriptName);
                if (script && typeof script.initEffect === "function") {
                    script.initEffect(...args); // 使用展开操作符传递参数
                }
            }
        });
    },


    /**
     *  游戏中魔法数字 Spine专用
     * @param {string} path - 特效资源的路径（如预制体路径）
     * @param {cc.Node} parent - 特效节点的父节点
     * @param {cc.Vec2} [pos] - 特效放置的位置（可选，默认不设置位置）
     * @param {Function} [callBack] - 回调
     * @param {Function} [desCallBack] - 销毁后的回调
     * @param {String} [animationName] - spine动画名字
     */
    createSkeBoomEffect(path, parent, pos, callBack, desCallBack, animationName = "animation") {
        SceneMng.createUIByBundle(path, parent, (effNode) => {
            if (!effNode) {
                console.error(`Failed to create effect node from path: ${path}`);
                return;
            }
            effNode.parent = parent;
            effNode.zIndex = Constants.ZORDER.FIGHT_NUM;
            // 设置位置（如果提供了 pos）
            if (pos) {
                effNode.setPosition(pos);
            }

            // 销毁特效的通用逻辑
            const destroyEffect = () => {
                desCallBack && desCallBack();
                effNode.destroy();
            };
            const ske = effNode.getChildByName("ske").getComponent(sp.Skeleton);
            if (!ske) {
                console.error(`Spine component not found on "effect" nodrpole
                e for path: ${path}`);
                destroyEffect();
                return;
            }
            ske.setAnimation(0, animationName, false);
            ske.setCompleteListener((trackEntry) => {
                // 如果未指定 animationName，则默认播放结束就销毁
                if (!animationName || trackEntry.animation.name === animationName) {
                    destroyEffect();
                }
            });
            callBack && callBack(effNode);

        });
    },

    //游戏中的角色|敌人|人物节点
    createGameRole(path, parent, pos, callBack) {
        SceneMng.createUIByBundle(path, parent, (effNode) => {
            if (!effNode) {
                console.error(`Failed to create effect node from path: ${path}`);
                return;
            }
            effNode.parent = parent;
            effNode.zIndex = Constants.ZORDER.ACTOR;
            if (pos) {
                effNode.setPosition(pos);
            }
            callBack && callBack(effNode);
        });
    },



});



var sharedUIManager = new UIManager();
sharedUIManager.start();
module.exports = sharedUIManager;

//    /**
//      * 将单例界面加入弹出窗队列
//      * @param {string} panelPath 
//      * @param {string} scriptName 
//      * @param {*} param 
//      */
//     pushToPopupSeq(panelPath, scriptName, param) {
//         let popupDialog = {
//             panelPath: panelPath,
//             scriptName: scriptName,
//             param: param,
//             isShow: false
//         };

//         this.arrPopupDialog.push(popupDialog);
//         this.checkPopupSeq();
//     },

//     //在特定索引位置插入单例界面
//     insertToPopupSeq(index, panelPath, scriptName, param) {
//         let popupDialog = {
//             panelPath: panelPath,
//             scriptName: scriptName,
//             param: param,
//             isShow: false
//         };

//         this.arrPopupDialog.splice(index, 0, popupDialog);
//         //this.checkPopupSeq();
//     },

//     /**
//      * 将单例界面从弹出窗队列中移除
//      * @param {string} panelPath 
//      */
//     shiftFromPopupSeq(panelPath) {
//         this.hideSharedDialog(panelPath, () => {
//             if (this.arrPopupDialog[0] && this.arrPopupDialog[0].panelPath === panelPath) {
//                 this.arrPopupDialog.shift();
//                 this.checkPopupSeq();
//             }
//         })
//     },

//     //检查当前是否需要弹单例界面
//     checkPopupSeq() {
//         if (this.arrPopupDialog.length > 0) {
//             let first = this.arrPopupDialog[0];

//             if (!first.isShow) {
//                 this.showSharedDialog(first.panelPath);
//                 this.arrPopupDialog[0].isShow = true;
//             }
//         }
//     },

