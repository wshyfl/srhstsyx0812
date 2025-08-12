const DisplayType = cc.Enum({
    None: -1,    // 无效果
    Fade: -1,    // 渐隐
    Scale: -1,   // 缩放
    ScaleX: -1,   // 缩放
    Custom: -1   // 自定义
});
//游戏中通用提示基类
cc.Class({
    extends: cc.Component,

    properties: {
        // 提示持续时间（秒）
        isAutoInit: false,
        duration: {
            default: 2,
            type: cc.Float,
            tooltip: "提示显示的持续时间（秒）"
        },
        // 是否自动销毁
        autoDestroy: {
            default: true,
            tooltip: "提示结束后是否自动销毁节点"
        },
        // 显示类型（引用外部定义的枚举）
        displayType: {
            default: DisplayType.None, // 默认值使用枚举的键
            type: DisplayType,
            tooltip: "提示的显示效果类型"
        }
    },

    onLoad() {
        this.maxScale = 1.1;
        this.minScale = 0.9;
        this.scaleTime = 0.5;
        if (this.isAutoInit) {
            this.init();
        }
    },

    setScaleParam(maxScale, minScale, scaleTime) {
        this.maxScale = maxScale;
        this.minScale = minScale;
        this.scaleTime = scaleTime;
    },

    // 初始化方法，子类可重写
    init() {
        //具体持续的UI效果
        switch (this.displayType) {
            case DisplayType.Scale:
                cc.tween(this.node)
                    .repeatForever(
                        cc.tween()
                            .to(this.scaleTime, { scale: this.maxScale }, { easing: 'smooth' })  // 缓动放大
                            .to(this.scaleTime, { scale: this.minScale }, { easing: 'smooth' })  // 缓动缩小
                    )
                    .start();
                break;
            case DisplayType.ScaleX:
                cc.tween(this.node)
                    .set({ scaleX: 0 })
                    .to(this.scaleTime, { scaleX: 1 }, { easing: 'sineOut' })  // 缓动放大
                    .start();
                break;
        }
        if (this.autoDestroy) {
            this.scheduleOnce(this.destroyTip, this.duration);
        }
    },


    // 销毁提示  子类可重写
    destroyTip() {
        this.node.destroy();
    },

    // 设置持续时间
    setDuration(time) {
        this.duration = time;
    },

    // 设置显示类型
    setDisplayType(type) {
        this.displayType = type;
    },

    // 手动停止提示，子类可重写以清理动画等
    stopTip() {
        this.node.stopAllActions();
        this.destroyTip();
    }
});