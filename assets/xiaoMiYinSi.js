
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.node.on("touchend", function () {
            AD_android.yinSi();
        }, this)
    },

    // update (dt) {},
});
