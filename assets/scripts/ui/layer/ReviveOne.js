// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const Game = require("Game");
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
    onEnable() {
        AD.chaPing();
        AD.showBanner();


    },
    onDisable() {
        AD.hideBanner();
    },

    // LIFE-CYCLE CALLBACKS:
    setPlayer(player) {
        this.player = player;
        if (this.player.ctlType == 1) {
            if (Game.instance.p1FreeReviveTimes <= 0) {
                this.node.getChildByName("root").getChildByName("btnVideo").getChildByName("icon_shiPin_1").active = true;
            } else {
                this.node.getChildByName("root").getChildByName("btnVideo").getChildByName("icon_shiPin_1").active = false;
            }
        } else {
            if (Game.instance.p2FreeReviveTimes <= 0) {
                this.node.getChildByName("root").getChildByName("btnVideo").getChildByName("icon_shiPin_1").active = true;
            } else {
                this.node.getChildByName("root").getChildByName("btnVideo").getChildByName("icon_shiPin_1").active = false;
            }
        }

    },
    //销毁普通
    btnVideo() {
        if (this.player.ctlType == 1) {
            if (Game.instance.p1FreeReviveTimes <= 0) {
                AD.showAD(() => {
                    Game.instance.revivePlayer(this.player);
                    this.node.destroy();
                }, this)
            } else {
                Game.instance.p1FreeReviveTimes--;
                Game.instance.revivePlayer(this.player);
                this.node.destroy();
            }
        } else {
            if (Game.instance.p2FreeReviveTimes <= 0) {
                AD.showAD(() => {
                    Game.instance.revivePlayer(this.player);
                    this.node.destroy();
                }, this)
            } else {
                Game.instance.p2FreeReviveTimes--;
                Game.instance.revivePlayer(this.player);
                this.node.destroy();
            }
        }
    },

    // update (dt) {},
});
