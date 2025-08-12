
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
        GlobalMng.pauseAll();
    },

    btnReturn(){
        this.closeDirectlyShare();
        cc.director.loadScene("main")
    },



    // update (dt) {},
});
