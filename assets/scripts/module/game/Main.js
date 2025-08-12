// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const PlayerData = require("PlayerData");
const Types = require("../../module/data/Types")
//主界面管理类
var Main = cc.Class({
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
        bgNode: cc.Node,
        UIPanel: cc.Node,
        skeReplace: sp.Skeleton
        //模块管理 挂在各模块节点
    },

    statics: {
        instance: null
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        Main.instance = this;
        this.initMap();
        GlobalMng.audioMng.playGameMusic(0);
        this.flushVideo();
        if (!GlobalMng.firstInGame) {
            AD.chaPing();
        }

    },

    flushVideo() {
        //刷新视频
        this.UIPanel.getChildByName(`btnHouShi`).getChildByName("icon_shiPin_1").active = PlayerData.playerInfo.lock["HouShi"];
        this.UIPanel.getChildByName(`btnMapPark`).getChildByName("icon_shiPin_1").active = PlayerData.playerInfo.lock["MapPark"];
        this.UIPanel.getChildByName(`btnMapSchool`).getChildByName("icon_shiPin_1").active = PlayerData.playerInfo.lock["MapSchool"];
        this.UIPanel.getChildByName(`btnMapHospital`).getChildByName("icon_shiPin_1").active = PlayerData.playerInfo.lock["MapHospital"];
    },


    showRole() {
        if (GlobalMng.isSingle()) {
            GlobalMng.uiMng.showSharedDialog(`ui/panel/RoleShop`, this.UIPanel);
        } else {
            GlobalMng.uiMng.showSharedDialog(`ui/panel/RoleShopDouble`, this.UIPanel);
        }
    },
    btnTestInGame(event, modelName) {
        if (modelName == "单人") {
            GlobalMng.setSingle();
            GlobalMng.uiMng.showSharedDialog(`ui/panel/RoleShop`, this.UIPanel);
        } else {
            GlobalMng.setDouble();
            GlobalMng.uiMng.showSharedDialog(`ui/panel/RoleShopDouble`, this.UIPanel);
        }

    },



    btnSelectMap(event, name) {
        if (GlobalMng.gameMap != name) {
            let Func = () => {
                this.UIPanel.getChildByName(`btn${name}`).getChildByName("select").active = true;
                this.UIPanel.getChildByName(`btn${GlobalMng.gameMap}`).getChildByName("select").active = false;
                GlobalMng.gameMap = name;
                this.initMap();
                let curMap = this.bgNode.getChildByName(name);
                this.skeReplace.node.active = false;
                let children = this.bgNode.children;
                children.forEach(node => {
                    node.stopAllActions();
                });
                // 封装一个播放4次的 tween
                const bounceTween1 = cc.tween()
                    .set({ y: 720 })
                    .to(0.05, { y: 360 });
                const bounceTween2 = cc.tween()
                    .set({ y: 720 })
                    .to(0.05, { y: 0 });
                const bounceTween3 = cc.tween()
                    .repeat(2,
                        cc.tween()
                            .set({ y: 720 })
                            .to(0.08, { y: 0 })
                    );
                const bounceTween4 = cc.tween()
                    .repeat(2,
                        cc.tween()
                            .set({ y: 720 })
                            .to(0.08, { y: 0 })
                    );
                // 执行动画
                cc.tween(curMap)
                    .then(bounceTween1) // 第一次执行4次动画
                    .call(() => {
                        this.skeReplace.node.active = true;
                        this.skeReplace.setAnimation(0, "animation", false);
                    })
                    .delay(0.4)
                    .call(() => {
                        this.skeReplace.node.active = false;
                    })
                    .then(bounceTween2) // 第二次执行同样的4次动画（需要clone）
                    .start();
            }

            let videoSp = this.UIPanel.getChildByName(`btn${name}`).getChildByName("icon_shiPin_1");
            if (videoSp.active) {
                AD.showAD(() => {
                    PlayerData.playerInfo.lock[name] = false;
                    PlayerData.savePlayerInfoToLocalCache();
                    this.flushVideo();
                    Func();
                }, this)
            } else {
                Func();
            }

        }

    },

    btnJieShao() {
        GlobalMng.uiMng.showSharedDialog(`ui/panel/GamePlayIntro`, this.UIPanel);
    },

    initMap() {
        this.UIPanel.getChildByName(`btnMapPark`).getChildByName("select").active = false;
        this.UIPanel.getChildByName(`btnMapSchool`).getChildByName("select").active = false;
        this.UIPanel.getChildByName(`btnMapHospital`).getChildByName("select").active = false;
        this.UIPanel.getChildByName(`btnHouShi`).getChildByName("select").active = false;

        this.UIPanel.getChildByName(`btn${GlobalMng.gameMap}`).getChildByName("select").active = true;
        let children = this.bgNode.children;
        for (let i = 0; i < children.length; i++) {
            const curMpaNode = children[i];
            if (curMpaNode.name == GlobalMng.gameMap) {
                curMpaNode.zIndex = 100;
            } else {
                curMpaNode.zIndex = 0;
            }
        }

        this.showRecord("btnMapPark", PlayerData.playerInfo.mapRecord[0]);
        this.showRecord("btnMapSchool", PlayerData.playerInfo.mapRecord[1]);
        this.showRecord("btnMapHospital", PlayerData.playerInfo.mapRecord[2]);
        this.showRecord("btnHouShi", PlayerData.playerInfo.mapRecord[3]);
    },

    showRecord(mapName, record) {
        if (record > 0) {
            let str = _.formatTime2(record);
            this.UIPanel.getChildByName(mapName).getChildByName("zjm_dk_shiJian").active = true;
            this.UIPanel.getChildByName(mapName).getChildByName("zjm_dk_shiJian").getChildByName("labRecord").getComponent(cc.Label).string = `最佳纪录: ${str}`;
        } else {
            this.UIPanel.getChildByName(mapName).getChildByName("zjm_dk_shiJian").active = false;
            this.UIPanel.getChildByName(mapName).getChildByName("zjm_dk_shiJian").getChildByName("labRecord").getComponent(cc.Label).string = ``;
        }

    },


    initAnimation() {
        // 保存初始缩放
        let px = this.playerNode.scale;
        let mx = this.monsterNode.scale;
        let distance = 300; // 玩家和怪物之间的固定距离

        this.monsterNode.children.forEach(child => {
            child.active = false;
        });

        // 清理现有动作和调度器
        this.playerNode.stopAllActions();
        this.monsterNode.stopAllActions();
        this.unschedule(this.updateMonsterPosition);
        // 初始化位置
        this.playerNode.x = -1200;
        this.playerNode.y = -260; // 假设玩家的 Y 轴初始为 0，可根据需要调整
        this.monsterNode.x = -1200;
        this.monsterNode.y = -260;
        this.playerNode.scaleX = Math.abs(px);
        this.monsterNode.scaleX = Math.abs(mx);
        // 玩家动画：左右移动并翻转（可扩展到 Y 轴）
        cc.tween(this.playerNode)
            .repeatForever(
                cc.tween()
                    .to(5, { x: 1200 }) // 可添加 y 属性，例如 { x: 1200, y: 100 }
                    .call(() => { this.playerNode.scaleX = -px; this.monsterNode.scaleX = -mx; })
                    .to(5, { x: -1200 })
                    .call(() => { this.playerNode.scaleX = px; this.monsterNode.scaleX = mx; })
            )
            .start();
        // 每帧更新怪物的位置，保持固定距离
        this.updateMonsterPosition = () => {
            // 根据玩家的朝向确定怪物相对位置
            let direction = this.playerNode.scaleX > 0 ? 1 : -1;
            // 计算怪物目标位置，保持固定距离
            this.monsterNode.x = this.playerNode.x - distance * direction;
            this.monsterNode.y = this.playerNode.y; // Y 轴跟随玩家，可调整为偏移
        };
        this.schedule(this.updateMonsterPosition, 0);
        this.monsterNode.getChildByName(GlobalMng.gameMap + "").active = true;
    },
    btnGift() {
        GlobalMng.uiMng.showSharedDialog('ui/panel/GiftPack', this.UIPanel)
    },


    nextMap(isWin) {
        if (isWin) {
            if (GlobalMng.gameMap == Types.MapName.HouShi) {
                PlayerData.playerInfo.lock[Types.MapName.MapPark] = false;
                PlayerData.savePlayerInfoToLocalCache();
                this.flushVideo();
                this.btnSelectMap(null, Types.MapName.MapPark)
            } else if (GlobalMng.gameMap == Types.MapName.MapPark) {
                PlayerData.playerInfo.lock[Types.MapName.MapSchool] = false;
                PlayerData.savePlayerInfoToLocalCache();
                this.flushVideo();
                this.btnSelectMap(null, Types.MapName.MapSchool)
            } else if (GlobalMng.gameMap == Types.MapName.MapSchool) {
                PlayerData.playerInfo.lock[Types.MapName.MapHospital] = false;
                PlayerData.savePlayerInfoToLocalCache();
                this.flushVideo();
                this.btnSelectMap(null, Types.MapName.MapHospital)
            }
        }
    },
    // update (dt) {},
});
