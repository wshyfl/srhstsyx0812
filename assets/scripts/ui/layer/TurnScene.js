
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
        ske: sp.Skeleton
    },
    onLoad() {
    },
    show(callback, isAutoDes = true) {
        this.ske.setCompleteListener(null);
        this.ske.setCompleteListener((trackEntry, loopCount) => {
            if (trackEntry.animation.name === "animation") {
                callback && callback();
                if (isAutoDes) {
                    this.node.destroy()
                }
            }
        });
        this.ske.setAnimation(0, "animation", false);
    },


    // update (dt) {},
});
