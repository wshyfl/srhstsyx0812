
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
    },
    onLoad() {
        this._super();
    },
    show(...args) {
        this._super();
        this.callBack = args[0];
    },

    videoSuccess(btnName) {
        GlobalMng.eventOne.dispatchEvent("UpdateGold", 1000, true, true, this.callBack)
    },


    // update (dt) {},
});
