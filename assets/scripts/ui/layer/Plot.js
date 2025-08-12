const PlayerData = require("PlayerData");
const Game = require("Game");
cc.Class({
    extends: cc.Component,

    properties: {
        secNode: [cc.Node],
        secNodeParent: cc.Node
    },

    start() {
        this.fadeDuration = 1.75;
        this.delayBetween = 0.5;
    },

    fadeInSequentially() {
        let index = 0;
        let fadeNext = () => {
            if (index >= this.secNode.length) {
                // 所有动画完成，延迟后销毁
                this.nextAction();
                return;
            }
            let node = this.secNode[index];
            index++;
            // 初始透明
            node.opacity = 0;
            node.active = true;
            cc.tween(node)
                .to(this.fadeDuration, { opacity: 255 })
                .call(() => {
                    // 完成当前后，延迟再做下一个
                    this.scheduleOnce(fadeNext, this.delayBetween);
                })
                .start();
        };
        this.scheduleOnce(fadeNext, this.delayBetween);

    },

    nextAction() {
        cc.tween(this.secNodeParent)
            .to(0.85, { opacity: 0 }, { easing: 'smooth' })
            .call(() => {
                this.complete();
            })
            .start()
    },

    complete() {
        PlayerData.juqingComplete();
        Game.instance.playerReady();
        this.node.destroy();
    },

});
