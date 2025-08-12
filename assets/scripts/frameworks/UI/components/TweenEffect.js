// HeartbeatEffect.js
cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad() {

    },
    //快速放大缩小一次
    scaleOnce() {
        cc.tween(this.node)
            .set({ scale: 1 })
            .to(0.1, { scale: 1.2 })
            .to(0.1, { scale: 1 })
            .start()
    },
    // 创建心跳效果的Tween动画
    startHeartbeat() {
        let scaleMax = 1.1;   // 最大缩放值
        let scaleMin = 0.9;   // 最小缩放值
        let duration = 0.25;   // 一个缩放周期的持续时间（秒）
        let waitTime = 0.5;
        // 心跳效果：不断放大和缩小
        cc.tween(this.node)
            .repeatForever(
                cc.tween()  // 一个心跳周期
                    .to(duration, { scale: scaleMax }, { easing: 'smooth' })  // 缓动放大
                    .to(duration, { scale: scaleMin }, { easing: 'smooth' })  // 缓动缩小
                    .delay(waitTime)
            )
            .start();
    },
    stopHeartbeat() {
        // 停止心跳动画
        cc.Tween.stopAllByTarget(this.node);
    },

    // 创轻微摆动晃效果的Tween动画
    startTimeAnim() {
        const tweenFunc = () => {
            cc.tween(this.node)
                // 1. 先上移并旋转
                .by(0.5, {
                    position: cc.v3(0, 10, 0),  // 向上移动 10 像素
                    angle: 5,                   // 顺时针旋转 5 度
                }, { easing: "sineInOut" })     // 使用缓动效果
                // 2. 然后回到原位并反方向旋转
                .by(0.5, {
                    position: cc.v3(0, -10, 0), // 向下移动 10 像素
                    angle: -5,                  // 逆时针旋转 5 度
                }, { easing: "sineInOut" })     // 使用缓动效果
                .call(tweenFunc)
                .start();
        }
        tweenFunc();
    },

    //快速摇晃3次
    shakeThree() {
        cc.tween(this.node)
            .repeat(3, // 抖动3次
                cc.tween()
                    .by(0.05, { angle: 10 })  // 向右抖动
                    .by(0.05, { angle: -15 }) // 向左抖动
                    .by(0.05, { angle: 10 })  // 回到原位
            )
            .to(1, { opacity: 0 }) // 1秒内渐隐消失
            .start();
    },

 
    /**
    * 应用浮动效果
    * @param {cc.Node} node - 要应用浮动效果的节点
    * @description 使节点在垂直方向上循环缓慢摇动，类似于水面上漂浮的物体。适用于创造柔和的上下浮动动画效果。
    */
    applyFloatingEffect(node) {
        let valueY = 15;
        let time = 1;
        let rotate1 = cc.tween().by(time, { position: { value: new cc.Vec2(0, valueY), easing: 'sineOut' } })
        let rotate2 = cc.tween().by(time, { position: { value: new cc.Vec2(0, -valueY), easing: 'sineIn' } })
        let rotate3 = cc.tween().by(time, { position: { value: new cc.Vec2(0, -valueY), easing: 'sineOut' } })
        let rotate4 = cc.tween().by(time, { position: { value: new cc.Vec2(0, valueY), easing: 'sineIn' } })
        let sequence1 = cc.tween().sequence(rotate1, rotate2, rotate3, rotate4)
        cc.tween(node).then(sequence1).repeatForever().start();
    },



});
