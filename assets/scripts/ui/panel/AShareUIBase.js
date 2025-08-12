//面板层基类 必须有根节点root
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
    },
    // 以下内容如果有需要 子类重写
    onEnable() {
        AD.chaPing();
        AD.showBanner();
    },
    onDisable() {
        AD.hideBanner();
    },
    //子类重写后 必须先调用父类方法
    onLoad() {
        this.prefabPath = "";
        this.rootNode = this.node.getChildByName("root")
    },

    onDestroy() {
    },

    //设置预制体路径
    setPrefabPath(prefabPath) {
        this.prefabPath = prefabPath;
    },


    show(...args) {
        GlobalMng.uiMng.showPopup(this.node.getChildByName("root"), args[0])
    },

    //视频观看成功后回调
    videoSuccess(btnName) {
        console.log("视频按钮回调 节点名" + btnName)
    },
    //隐藏后回调
    hideSuccess() {

    },


    //直接关闭单例 无动画
    closeDirectlyShare() {
        GlobalMng.resumeAll();
        GlobalMng.uiMng.directlyHideSharedlog(this.prefabPath);
        this.hideSuccess();
    },

    //关闭单例 有缩放动画
    btnCloseShare() {
        GlobalMng.resumeAll();
        GlobalMng.uiMng.hideSharedDialog(this.prefabPath, () => {
            this.hideSuccess();
        });
    },


    //视频通用
    btnVideo(event) {
        AD.showAD(() => {
            GlobalMng.resumeAll();
            this.videoSuccess(event.currentTarget.name)
        }, this)
    },

});
