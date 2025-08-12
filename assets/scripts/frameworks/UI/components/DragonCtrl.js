cc.Class({
    extends: cc.Component,

    properties: {
        ske: dragonBones.ArmatureDisplay,
        daijiName: "待机"
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.currentAnimation = '';
        if (this.daijiName == "待机") {
            this.idleAnimation = "待机";
            this.playIdle();
        }

    },

   


    //设置位置 基于spine偏移量
    setSkePos(pos) {
        let offsetX = this.ske.node.x;
        let offsetY = this.ske.node.y;
        this.node.y = pos.y + offsetY;
        if (offsetX <= 0) {
            this.node.x = pos.x + offsetX;
        } else {
            this.node.x = pos.x - offsetX;
        }
    },

    playIdle() {
        if (this.currentAnimation === this.idleAnimation) return;
        this.ske.playAnimation(this.idleAnimation, 0);
        this.currentAnimation = this.idleAnimation;
    },



    playNoIdle(animationName, loop = false, callback = null) {
        if (callback) {
            this.ske.addEventListener(dragonBones.EventObject.COMPLETE, (event) => {
                if (event.animationState.name === animationName) {
                        callback();
                }
            });
        }
        this.ske.playAnimation(animationName, loop ? 0 : 1);
        this.currentAnimation = animationName;
    },


    playAnimation(animationName, loop = false, callback = null) {
        if (this.currentAnimation === animationName) return;
        this.ske.addEventListener(dragonBones.EventObject.COMPLETE, (event) => {
            if (event.animationState.name === animationName) {
                if (callback) {
                    callback();
                }
                if (!loop) {
                    this.playIdle();
                }
            }
        });

        this.ske.playAnimation(animationName, loop ? 0 : 1);
        this.currentAnimation = animationName;
    },

});
