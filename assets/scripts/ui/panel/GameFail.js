// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const Game = require("Game");
const Types = require("../../module/data/Types")
cc.Class({
    extends: require("GameWin"),

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

    // onLoad () {},

    // update (dt) {},
    initPlayer() {
        this.winOrLose = false;


        if (GlobalMng.isSingle()) {
            this.player1Node.active = true;
            this.player2Node.active = false;
            this.playerInfoFlush(this.player1Node, Game.instance.getPlayerById(1))
        } else {
            this.player1Node.active = true;
            this.player2Node.active = true;
            this.playerInfoFlush(this.player1Node, Game.instance.getPlayerById(1))
            this.playerInfoFlush(this.player2Node, Game.instance.getPlayerById(2))
        }

        this.rewardCoin = Game.instance.gameRunTime * 2;
        this.labGold.string = this.rewardCoin;
    },

    playerInfoFlush(playerNode, player) {
        let ske = playerNode.getChildByName("ske").getComponent(sp.Skeleton);
        ske.skeletonData = player.skeletonData;
        ske.clearTracks();
        ske.setToSetupPose();
        ske.setAnimation(0, "失败结算", true);
    },
    playerOverEffect() {
        GlobalMng.audioMng.playEffect("游戏失败");
    },

    btnAgain() {
        if (!this.isInitGold) return
        GlobalMng.uiMng.showSharedMask();
        GlobalMng.eventOne.dispatchEvent('UpdateGold', this.rewardCoin, true, true, null, { startPos: cc.v2(320, -90) });
        cc.director.preloadScene("main");
        this.scheduleOnce(() => {
            this.rootNode.getChildByName("GoldMng").destroy()
            GlobalMng.uiMng.directlyHideSharedlog(this.prefabPath);
            GlobalMng.uiMng.hideSharedMask();
            cc.director.loadScene("main", () => {
                cc.find("Canvas").getComponent("Main").showRole();
            })
        }, 0.85)

    },
});
