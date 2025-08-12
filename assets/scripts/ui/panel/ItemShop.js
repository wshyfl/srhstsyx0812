
const Game = require("Game");
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
        btnNode1: cc.Node,
        btnNode2: cc.Node,
    },
    onLoad() {
        this._super();
    },
    show(...args) {
        this._super();
        this.flushButton();
        GlobalMng.pauseAll();
    },

    videoSuccess(btnName) {
        this._super(btnName);
        if (btnName == "btn_Video1") {  //望远镜 显示怪在小地图的位置
            Game.instance.useOrCloseItemMonster(true);
        } else if (btnName == "btn_Video2") {  //加速鞋 增加玩家移速
            Game.instance.useOrCloseItemMove(true);
        }
        this.flushButton();
    },

    flushButton() {
        this.btnNode1.active = !Game.instance.monsterIsOpenMini;
        this.btnNode2.active = !Game.instance.playerIsOpenMove;
    },

    // update (dt) {},
});
