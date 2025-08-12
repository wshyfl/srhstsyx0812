cc.Class({
    extends: cc.Component,

    properties: {
        progress: cc.ProgressBar,
        percent: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    init(loadTime = 0.5) {

        this.node.opacity = 255;
        //加载时间总消耗时间
        this.loadTime = Math.random() * 0.35 + loadTime;
        // 更新经过的时间
        this.elapsedTime = 0;
        //加载完毕后 进度条加速倍率
        this.multip = 1;
        //加载进度条
        this.progress.progress = 0;
        //百分比
        this.percent.string = '0%';
        //是否加载完毕
        this.isLoadingCompleted = false;

        this.callBack = null;
    },


    update(dt) {
        // 更新经过的时间
        this.elapsedTime += dt * this.multip;

        // 根据经过的时间和总加载时间计算进度
        var progress = this.elapsedTime / this.loadTime;

        // 更新进度条和百分比显示
        this.progress.progress = progress;
        this.percent.string = Math.floor(progress * 100) + '%';

        // 如果加载完成，则停止更新
        if (this.elapsedTime >= this.loadTime) {
            this.progress.progress = 1;
            this.percent.string = '100%';
            if (this.isLoadingCompleted) {
                this.node.active = false;
                if (this.callBack) {
                    this.callBack();
                }
            }
        }
    },

    //设置加载完毕
    setLoadCompelect(doubleMultip = 1, callBack) {
        //提升加载速度
        this.multip = doubleMultip;
        //设置回调
        this.callBack = callBack;
        //设置加载完毕状态
        this.isLoadingCompleted = true;
    },
});
