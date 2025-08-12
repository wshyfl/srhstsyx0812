cc.Class({
    extends: cc.Component,

    properties: {
        progressBar: { default: null, type: cc.ProgressBar, tooltip: "进度条组件" },
        percentLabel: { default: null, type: cc.Label, tooltip: "显示百分比的标签" }
    },

    onLoad: function () {
        if (!this.progressBar || !this.percentLabel) {
            cc.error("LoadingUI: progressBar or percentLabel is missing!");
            return;
        }
        this.updateTimer = 0;
        this.updateInterval = 0.1;
        this.totalLength = this.progressBar.totalLength;
        this.lengthInterval = 30;
        this.running = false;
    },

    startLoading: function (tasks, callback) {
        if (!this.node || !tasks || tasks.length === 0) {
            callback && callback("Invalid setup or no tasks provided");
            return;
        }
        this.reset();
        this.callback = callback;
        this.tasks = tasks.slice();
        this.currentMaxLength = 0;
        this.currentLength = 0;
        this.progressBar.progress = 0;
        this.percentLabel.string = '0%';
        this.taskIndex = 0;
        this.completedTasks = 0;
        this.running = true;
        // this.scheduleOnce(() => {
        //     if (this.running) {
        //         console.error("Loading timeout after 10 seconds");
        //         this.running = false;
        //         this.node.active = false;
        //         this.callback && this.callback("Timeout");
        //     }
        // }, 10); // 10 秒超时
        this.nextTask([]);
    },

    nextTask: function (args) {
        if (!this.tasks || !this.running) return;

        if (this.taskIndex === this.tasks.length) {
            if (this.completedTasks === this.tasks.length) {
                this.currentMaxLength = this.totalLength;
                this.setProgress();
            }
            return;
        }

        let _this = this;
        let taskCallback = function (err, progress, ...args) {
            if (err) {
                _this.running = false;
                return _this.callback.apply(null, [err].concat(args));
            }
            _this.completedTasks++;
            if (typeof progress === 'number') {
                _this.currentLength += progress;
                _this.currentLength = Math.min(_this.currentLength, _this.totalLength);
            }
            _this.currentMaxLength = _this.totalLength / _this.tasks.length * _this.taskIndex;
            _this.nextTask(args);
        };

        args.push(taskCallback);
        let task = this.tasks[this.taskIndex++];
        task.apply(null, args);
    },

    update: function (dt) {
        if (!this.running) return;
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) return;
        this.updateTimer = 0;
        if (this.currentLength < this.currentMaxLength) {
            this.currentLength += this.lengthInterval;
            this.currentLength = Math.min(this.currentLength, this.currentMaxLength);
        }
        this.setProgress();
    },

    setProgress: function () {
        let ratio = this.currentLength / this.totalLength;
        ratio = Math.min(Math.max(ratio, 0), 1);
        this.percentLabel.string = Math.round(ratio * 100) + '%';
        this.progressBar.progress = ratio;

        if (ratio === 1 && this.completedTasks === this.tasks.length) {
            this.running = false;
            this.scheduleOnce(() => {
                this.callback && this.callback(null, "Loading complete");
                this.node.active = false;
            }, 0.5);
        }
    },

    reset: function () {
        this.running = false;
        this.tasks = [];
        this.currentLength = 0;
        this.currentMaxLength = 0;
        this.taskIndex = 0;
        this.completedTasks = 0;
        this.progressBar.progress = 0;
        this.percentLabel.string = '0%';
    }
});