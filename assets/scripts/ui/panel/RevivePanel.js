

const Game = require("Game");
//复活界面
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
        labPress: cc.Label,
        labKeyNum: cc.Label,
        spProgress: cc.Sprite,
        btnCloseNode: cc.Node
    },
    onLoad() {
        this._super();
        //这个界面弹出 基本上是两个玩家都死或单人模式玩家死亡


    },
    show(...args) {
        if (Game.instance.p1FreeReviveTimes <= 0 || Game.instance.p2FreeReviveTimes <= 0) {
            this.node.getChildByName("root").getChildByName("btnVideo").getChildByName("icon_shiPin_1").active = true;
            this.btnCloseNode.active = true;
        } else {
            this.node.getChildByName("root").getChildByName("btnVideo").getChildByName("icon_shiPin_1").active = false;
            this.btnCloseNode.active = false;
        }


        //钥匙进度
        this.node.opacity = 0;
        this.scheduleOnce(() => {
            GlobalMng.audioMng.playEffect("复活界面");
            this.node.opacity = 255;
            GlobalMng.uiMng.showPopup(this.node.getChildByName("root"), args[0])
            this.spProgress.fillRange = Game.instance.getKeyCollectProgress();
            this.labPress.string = parseInt(Game.instance.getKeyCollectProgress() * 100) + "%";
            this.labKeyNum.string = Game.instance.getKeyNum();
            GlobalMng.pauseAll();
        }, 1)

    },

    videoSuccess(btnName) {
        Game.instance.revivePlayer();
        GlobalMng.uiMng.hideSharedDialog(this.prefabPath);
    },

    btnCloseShare() {
        this.closeDirectlyShare();
        // 游戏失败
        Game.instance.gameFail();
    },
    btnVideo(event) {
        if (Game.instance.p1FreeReviveTimes <= 0 || Game.instance.p2FreeReviveTimes <= 0) {
            AD.showAD(() => {
                GlobalMng.resumeAll();
                this.videoSuccess(event.currentTarget.name)
            }, this)
        } else {
            Game.instance.p1FreeReviveTimes--;
            Game.instance.p2FreeReviveTimes--;
            GlobalMng.resumeAll();
            this.videoSuccess(event.currentTarget.name)
        }
    },
    // update (dt) {},
});
