cc.Class({
    extends: cc.Component,

    properties: {
        labText: {
            default: null,
            type: cc.Label,
            tooltip: "提示文本的 Label 组件"
        }
    },

    onLoad() {
        this.callFnc = null;
    },

    /**
     * 显示游戏提示信息
     * @param {string} text - 要显示的提示文本
     * @param {number} duration- 提示显示的总时长（秒），默认 1.8 秒，与频率一致
     * @returns {boolean} - 是否成功显示
     */
    showTip(text, duration, callBack) {
        this.callFnc = callBack;
        // 设置文本
        if (!this.labText) {
            cc.warn("Tip: labText is not assigned!");
            return false;
        }
        this.labText.string = text || "";
        const moveDuration = 0.5; // 固定移动时间，与原代码一致
        const delayTime = duration - moveDuration * 2; // 剩余时间用于等待
        const startY = this.node.y;
        const peakY = startY + 230; // 上移 230，与原代码逻辑一致
        const endY = startY + 200;  // 下移到略低于起始位置

        const moveUp = cc.moveTo(moveDuration, cc.v2(this.node.x, peakY)).easing(cc.easeIn(0.5));
        const moveDown = cc.moveTo(moveDuration, cc.v2(this.node.x, endY)).easing(cc.easeOut(0.5));
        const destroyNode = cc.callFunc(() => this.callFnc(), this);

        const sequence = cc.sequence(
            moveUp,
            moveDown,
            cc.delayTime(delayTime > 0 ? delayTime : 0), // 确保等待时间非负
            destroyNode
        );
        this.node.runAction(sequence);
    },






});