
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (AD.chanelName != "WX" || AD.chanelName != AD.chanelName1) {
            this.node.active = false;
        }
        cc.tween(this.node)
            .repeatForever(
                cc.tween()
                    .by(0.3, { scale: 0.1 })
                    .by(0.3, { scale: -0.1 })
            )
            .start();
        this.node.on("touchend", () => {
            AD_WX.geZi();
        }, this);
    },

    start() {

    },

    // update (dt) {},
});
