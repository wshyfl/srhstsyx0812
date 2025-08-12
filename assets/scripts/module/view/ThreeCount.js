cc.Class({
    extends: cc.Component,

    properties: {
        numberNodes: {
            default: [],
            type: cc.Node,
            tooltip: "包含数字3,2,1和游戏开始的四个节点"
        }
    },

    onLoad() {
        // 确保有4个节点
        if (this.numberNodes.length !== 4) {
            cc.error("请确保配置了4个节点!");
            return;
        }

        // 初始化所有节点
        this.numberNodes.forEach(node => {
            node.active = false;
            node.scale = 0;
            node.opacity = 0;
        });


    },

    initEffect(...args) {
        cc.tween(this.node)
            .set({ scale: 0 })
            .to(0.2, { scale: 1 }, { easing: 'sineOut' })
            .call(() => {
                this.startCountdown(args[0]);
            })
            .start()
    },

    startCountdown(callBack) {
        let index = 0;
        const delay = 0;   // 每个数字之间的间隔
        const showNumber = () => {
            if (index >= this.numberNodes.length) {
                callBack && callBack();
                // 倒计时结束
                return
            }
            if (index == this.numberNodes.length - 1) {
                // 倒计时结束
                this.node.getChildByName("bg").active = false;
                GlobalMng.audioMng.playEffect("倒计时_02");
            } else {
                GlobalMng.audioMng.playEffect("倒计时_01");
            }

            let node = this.numberNodes[index];
            node.active = true;

            // 创建动画序列
            let scaleUp = cc.scaleTo(0.5, 1.2).easing(cc.easeBackOut());   // 0.24秒
            let scaleDown = cc.scaleTo(0.5, 1).easing(cc.easeBackIn());    // 0.18秒
            let fadeIn = cc.fadeIn(0.5);                                   // 0.24秒
            let fadeOut = cc.fadeOut(0.5);                                 // 0.18秒

            // 并行执行缩放和渐变
            let spawn = cc.spawn(
                cc.sequence(scaleUp, scaleDown),
                cc.sequence(fadeIn, fadeOut)
            );

            // 动画完成后等待delay时间再执行下一个数字
            let sequence = cc.sequence(
                spawn,
                cc.delayTime(delay),
                cc.callFunc(() => {
                    node.active = false;
                    index++;
                    showNumber();
                })
            );


            node.runAction(sequence);
        };

        // 开始第一个数字
        showNumber();
    }
});