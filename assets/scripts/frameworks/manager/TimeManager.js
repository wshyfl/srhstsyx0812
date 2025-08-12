cc.Class({
    extends: cc.Component,

    properties: {
        activeTimers: {
            default: [],
            visible: false, // 不在编辑器中显示
        },
        isPaused: false, // 用于控制暂停状态
    },

    /**
     * 启动计时任务
     * @param {string} key - 计时任务的唯一标识
     * @param {number} duration - 持续时间，以秒为单位
     * @param {Function} callback - 计时完成后的回调函数
     * @param {Function} updateCallback - 用于更新进度条的回调函数，接受进度值（0到1之间）
     */
    startTimer(key, duration, callback, updateCallback) {
        // 检查是否已经存在相同 key 的计时任务
        if (this.activeTimers.some(timer => timer.key === key)) {
            console.warn(`计时任务 ${key} 已存在！`);
            return;
        }

        // 定义计时任务的数据结构
        const timerData = {
            key: key,
            remainingTime: duration,
            originalDuration: duration, // 初始时长用于计算进度
            callback: callback,
            updateCallback: updateCallback,
        };

        // 将计时任务添加到队列中
        this.activeTimers.push(timerData);
    },

    /**
     * 停止特定 key 的计时任务
     * @param {string} key - 计时任务的唯一标识
     */
    stopTimer(key) {
        this.activeTimers = this.activeTimers.filter(timer => timer.key !== key);
    },

    // 暂停所有计时任务
    pauseAllTimers() {
        this.isPaused = true;
    },

    // 恢复所有计时任务
    resumeAllTimers() {
        this.isPaused = false;
    },

    // 删除所有计时任务（如游戏结束）
    clearAllTimers() {
        this.activeTimers = [];
    },
    //是否同key的任务已经在运行了
    isKeyRuning(key) {
        return this.activeTimers.some(timer => timer.key === key)
    },

    // 每帧更新计时任务
    update(dt) {
        if (this.isPaused) return;
        // 遍历所有计时任务，更新剩余时间
        for (let i = this.activeTimers.length - 1; i >= 0; i--) {
            const timerData = this.activeTimers[i];
            timerData.remainingTime -= dt;

            // 更新进度条UI
            if (timerData.updateCallback) {
                const progress = timerData.remainingTime / timerData.originalDuration;
                timerData.updateCallback(progress);
            }

            // 计时完成，调用回调并移除计时任务
            if (timerData.remainingTime <= 0) {
                timerData.remainingTime = 0; // 避免负值
                timerData.callback();
                this.activeTimers.splice(i, 1); // 移除已完成的计时任务
            }
        }
    },
});
