
const Game = require("Game");
const PlayerData = require("PlayerData");
const Types = require("../../module/data/Types");

cc.Class({
    extends: require("AShareUIBase"),

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
        monsterSke: sp.Skeleton,
        gameOverSke: sp.Skeleton,
        player1Node: cc.Node,
        player2Node: cc.Node,
        labGold: cc.Label,
        labPassTime: cc.Label,
        rewardCoin: 1000,
    },

    onEnable() {
        AD.chaPing();
    },
    onLoad() {
        this._super();
        this.rootNode = this.node.getChildByName("root");
        //320 -90 金币飞起始点
    },
    show(...args) {
        this._super();
        this.isInitGold = false;
        this.initMonster();
        this.initPlayer();
        this.initOverSke();
        GlobalMng.uiMng.createGameTipMessage(`ui/global/GoldMng`, this.rootNode, cc.v2(0, 0), () => {
            this.isInitGold = true;
        })

        this.playerOverEffect();
    },


    initMonster() {
        let monsterName = Game.instance.getMonsterSkeName();
        GlobalMng.sceneMng.setSkeByBundle(`monster/${monsterName}`, this.monsterSke, "待机", true, null)
    },

    initPlayer() {
        if (GlobalMng.isSingle()) {
            this.player1Node.active = true;
            this.player2Node.active = false;
            this.playerInfo(this.player1Node, Game.instance.getPlayerById(1))
        } else {
            this.player1Node.active = true;
            this.player2Node.active = true;
            this.playerInfo(this.player1Node, Game.instance.getPlayerById(1))
            this.playerInfo(this.player2Node, Game.instance.getPlayerById(2))
        }
        this.winOrLose = true;
        //通过时间
        this.labPassTime.string = _.formatTime2(Game.instance.gameRunTime);
        if (Game.instance.gameRunTime > 0) {
            PlayerData.recordTime(GlobalMng.gameMap, Game.instance.gameRunTime);
        }
        this.labGold.string = this.rewardCoin;
    },

    initOverSke() {
        this.gameOverSke.setAnimation(0, "出现", false);
        this.gameOverSke.setCompleteListener(null);
        this.gameOverSke.setCompleteListener((trackEntry, loopCount) => {
            if (trackEntry.animation.name === "出现") {
                this.gameOverSke.setAnimation(0, "待机", true);
            }
        });
    },

    playerInfo(playerNode, player) {
        let nameSp = playerNode.getChildByName("bgName").getChildByName("nameSp").getComponent(cc.Sprite);
        let ske = playerNode.getChildByName("ske").getComponent(sp.Skeleton);
        GlobalMng.sceneMng.setSpriteFrameByBundle(`res/actor/人物名字/${Types.ActorSkillData[player.skillType].name}`, nameSp);
        ske.skeletonData = player.skeletonData;
        ske.clearTracks();
        ske.setToSetupPose();
        ske.setAnimation(0, "待机", true);
    },
    videoSuccess(btnName) {
        this.rewardCoin *= 2;//双倍领取
        this.hideSuccess();
    },

    hideSuccess() {
        if (!this.isInitGold) return
        GlobalMng.uiMng.showSharedMask();
        GlobalMng.eventOne.dispatchEvent('UpdateGold', this.rewardCoin, true, true, null, { startPos: cc.v2(320, -90) });
        cc.director.preloadScene("main");
        this.scheduleOnce(() => {
            this.playTrun();
        }, 0.85)

    },
    playerOverEffect() {
        GlobalMng.audioMng.playEffect("游戏胜利");
    },

    playTrun() {
        let winOrLose = this.winOrLose;
        GlobalMng.uiMng.showOnceQuickDialog('ui/layer/转场', cc.find("Canvas"), (panelNode) => {
            panelNode.getComponent("TurnScene").show(() => {
                cc.director.loadScene("main", () => {
                    cc.find("Canvas").getComponent("Main").nextMap(winOrLose);
                })
            }, false)
        })
        this.rootNode.getChildByName("GoldMng").destroy()
        GlobalMng.uiMng.directlyHideSharedlog(this.prefabPath);
        GlobalMng.uiMng.hideSharedMask();
    },



    // update (dt) {},
});
