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
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},


    init(ctlType) {
        if (GlobalMng.isDouble()) {
            let leftCenterPos = GlobalMng.getDoubleLeftCenter();
            let rightCenterPos = GlobalMng.getDoubleRightCenter();
            if (ctlType == 1) {
                this.node.getChildByName("root").x = leftCenterPos.x;
                this.node.getChildByName("mask").x = leftCenterPos.x * 2;
            } else {
                this.node.getChildByName("root").x = rightCenterPos.x;
                this.node.getChildByName("mask").x = rightCenterPos.x * 2;
            }
        } else {
            this.node.getChildByName("root").x = 0;
            this.node.getChildByName("mask").x = 0;
        }

    },
    // update (dt) {},
});
