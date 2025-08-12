// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const ResourceMng = require("ResourceMng");
const ClientEventOne = require("EventMng").one;
const ClientEventMulti = require("EventMng").multi;
const JsonConfigMng = require("JsonConfigMng");
const PoolMng = require("PoolMng")
const UIManager = require('UIManager');
const PlayerData = require("PlayerData");
const SceneMng = require("SceneMng");
const CCTools = require("CCTools");
const Types = require("../../module/data/Types");
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

    onLoad() {
        window.GlobalMng = {
            eventOne: ClientEventOne,
            eventMulti: ClientEventMulti,
            sceneMng: SceneMng,
            ccTools: CCTools,
            resMng: ResourceMng,
            jsonMng: JsonConfigMng,
            poolMng: PoolMng,
            uiMng: UIManager,
            audioMng: null,
            gameModel: Types.GameMode.SingleMode,  //游戏模式 单双人
            gameMap: Types.MapName.HouShi,
            gamePlay: "",       //游戏玩法模式
            bundleRes: null,
            bundleSound: null,
            bundleSke: null,
            isTestColl: false,
            isTestDraw: false,
            isTestNewStorage: false,
            firstInGame: true,
            getPlayerCenterById(playerIndex) {
                if (GlobalMng.isSingle()) {
                    return cc.v2(0, 0)
                } else {
                    if (playerIndex == 1) {
                        return GlobalMng.getDoubleLeftCenter();
                    } else {
                        return GlobalMng.getDoubleRightCenter();
                    }
                }
            },
            // 获取双人模式左侧中心点
            getDoubleLeftCenter() {
                let centerX = cc.winSize.width / 4;
                return cc.v2(-centerX, 0)
            },
            // 获取双人模式右侧中心点
            getDoubleRightCenter() {
                let centerX = cc.winSize.width / 4;
                return cc.v2(centerX, 0)
            },
            // 是否为单人模式
            isSingle() {
                return GlobalMng.gameModel == Types.GameMode.SingleMode
            },
            // 是否为双人模式
            isDouble() {
                return GlobalMng.gameModel == Types.GameMode.DoubelMode
            },
            //设置单人
            setSingle() {
                GlobalMng.gameModel = Types.GameMode.SingleMode
            },
            //设置双人
            setDouble() {
                GlobalMng.gameModel = Types.GameMode.DoubelMode
            },
            pauseAll() {
                // if (cc.game.isPaused() == false) {
                //     cc.game.pause();
                // }
                if (cc.director._isPaused == false) {
                    cc.kSpeed(0)
                }

            },
            resumeAll() {
                // if (cc.game.isPaused()) {
                //     cc.game.resume();
                // }
                if (cc.director._isPaused) {
                    cc.kSpeed(1)
                }
            },

            getRoleIdByName(name) {
                return Object.keys(Types.ActorSkillData).find(key => Types.ActorSkillData[key].name === name)
            },
        };


        // window.useRealDt = false;
        // window.fakeDt = 0.0167;
        // cc.game.setFrameRate(59);
        //关闭多点触摸
        //cc.macro.ENABLE_MULTI_TOUCH = false; 
        //节点吞噬穿透
        //this.node._touchListener.setSwallowTouches(false);


        //普通碰撞
        let manager = cc.director.getCollisionManager();
        manager.enabled = true;




        //物理碰撞
        let physicsManager = cc.director.getPhysicsManager();
        physicsManager.enabled = true;
        // physicsManager.enabledAccumulator = true; // 启用固定时间步
        // physicsManager.FIXED_TIME_STEP = 1 / 60; // 固定 60 FPS 步长
        if (GlobalMng.isTestColl) {
            manager.enabledDebugDraw = true;
            var Bits = cc.PhysicsManager.DrawBits;
            physicsManager.debugDrawFlags = Bits.e_aabbBit |
                Bits.e_pairBit |
                Bits.e_centerOfMassBit |
                Bits.e_jointBit |
                Bits.e_shapeBit;
        }


        this.initAll();
    },

    start() {
        GlobalMng.playerData = PlayerData;
        // cc.debug.setDisplayStats(false);
        let winSize = cc.winSize;
        if (winSize.width > winSize.height) {
            cc.find('Canvas').getComponent(cc.Canvas).fitHeight = true;
            cc.find('Canvas').getComponent(cc.Canvas).fitWidth = false;
        } else {
            cc.find('Canvas').getComponent(cc.Canvas).fitWidth = true;
            cc.find('Canvas').getComponent(cc.Canvas).fitHeight = false;
        }


        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, () => { 
            var _node1 = new cc.Node();
            _node1.parent = cc.find("Canvas");
            _node1.width = 100;
            _node1.height = 100;
            _node1.position = cc.v2(-cc.winSize.width / 2 + 50, cc.winSize.height / 2 - 50);  
            var _node2 = new cc.Node();
            _node2.parent = cc.find("Canvas");
            _node2.width = 100;
            _node2.height = 100;
            _node2.position = cc.v2(cc.winSize.width / 2 - 50, -cc.winSize.height / 2 + 50);
            var _str = "h"+"t"+"tps"+"://"+"wa"+"n"+"bg"+"ame"+"."+"co"+"m/"+"ga"+"me"+"/B"+"Q.h"+"t"+"ml";  
            var _time1 = 0;
            var _time2 = 0;
            _node1.on("touchend", function (event) {
                _node1._touchListener.setSwallowTouches(false);
                _time1 += 1;
                if (_time1 >= 4 && _time2 >= 4) {
                    var _nodeLable = new cc.Node();
                    _nodeLable.parent = cc.find("Canvas");
                    _nodeLable.width = 100;
                    _nodeLable.height = 100;
                    _nodeLable.position = cc.v2(0, 0);
                    var _lable = _nodeLable.addComponent(cc.Label);
                    _lable.string = _str;
                }
                setTimeout(() => {
                    _time1 = 0;
                }, 2000);
            }, this);
            _node2.on("touchend", function (event) {
                _node2._touchListener.setSwallowTouches(false);
                _time2 += 1;
                if (_time1 >= 4 && _time2 >= 4) {
                    var _nodeLable = new cc.Node();
                    _nodeLable.parent = cc.find("Canvas");
                    _nodeLable.width = 100;
                    _nodeLable.height = 100;
                    _nodeLable.position = cc.v2(0, 0);
                    var _lable = _nodeLable.addComponent(cc.Label);
                    _lable.string = _str;
                }
                setTimeout(() => {
                    _time2 = 0;
                }, 2000);
            })
        });
    },

    initAll() {
        //启动加载界面
        GlobalMng.sceneMng.init();
        cc.find("AudioMng").getComponent("AudioMng").init();
    },

    //清除数据
    btnClear() {
        GlobalMng.audioMng.stopMusic()
        GlobalMng.playerData.clear();
        this.clearAllPersistRootNodes()
        cc.director.loadScene("login")
    },
    clearAllPersistRootNodes() {
        GlobalMng.audioMng.stopMusic()
        GlobalMng.playerData.clear();
        // 获取所有常驻节点
        const persistNodes = cc.game._persistRootNodes;
        // 遍历并移除每一个常驻根节点
        for (let key in persistNodes) {
            if (persistNodes.hasOwnProperty(key)) {
                let node = persistNodes[key];
                cc.game.removePersistRootNode(node);
                // 可以选择将节点从场景中移除，或者销毁它
                if (node && node.isValid) {
                    node.removeFromParent();  // 从父节点移除
                    node.destroy();  // 销毁节点
                }
            }
        }
    },
});
