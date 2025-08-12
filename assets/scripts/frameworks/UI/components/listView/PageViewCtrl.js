// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

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
        pageView: cc.PageView,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.currentPageIndex = 0;  // 初始化当前页面索引
    },

    start() {

    },

    onPrevPage() {
        // 切换到上一个页面
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.pageView.setCurrentPageIndex(this.currentPageIndex);
        }
    },

    onNextPage() {
        if (this.currentPageIndex < this.pageView.content.childrenCount - 1) {
            this.currentPageIndex++;
            this.pageView.setCurrentPageIndex(this.currentPageIndex)
        }

    },

     update (dt) {
        this.currentPageIndex = this.pageView.getCurrentPageIndex();
     },
});
