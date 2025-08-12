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

    start() {
    },
    /**
    * 当两个碰撞体开始接触时调用，仅触发一次
    * @param {cc.Contact} contact - 碰撞接触信息，包含碰撞细节
    * @param {cc.Collider} selfCollider - 当前节点的碰撞体组件
    * @param {cc.Collider} otherCollider - 与当前节点发生碰撞的另一个碰撞体
    */
    onBeginContact: function (contact, selfCollider, otherCollider) {

    },

    /**
     * 当两个碰撞体结束接触时调用，仅触发一次
     * @param {cc.Contact} contact - 碰撞接触信息
     * @param {cc.Collider} selfCollider - 当前节点的碰撞体组件
     * @param {cc.Collider} otherCollider - 与当前节点结束碰撞的另一个碰撞体
     */
    onEndContact(contact, selfCollider, otherCollider) {

    },
    /**
     * 在物理引擎求解碰撞之前调用，可用于调整碰撞行为（如禁用接触）
     * @param {cc.Contact} contact - 碰撞接触信息
     * @param {cc.Collider} selfCollider - 当前节点的碰撞体组件
     * @param {cc.Collider} otherCollider - 与当前节点发生碰撞的另一个碰撞体
     */
    onPreSolve(contact, selfCollider, otherCollider) {

    },



    /**
     * 当碰撞体进入碰撞范围时调用（基于非物理碰撞系统）
     * @param {cc.Collider} other - 进入碰撞的另一个碰撞体
     * @param {cc.Collider} self - 当前节点的碰撞体
     */
    onCollisionEnter: function (other, self) {

    },

    /**
     * 当碰撞体离开碰撞范围时调用（基于非物理碰撞系统）
     * @param {cc.Collider} other - 离开碰撞的另一个碰撞体
     * @param {cc.Collider} self - 当前节点的碰撞体
     */
    onCollisionExit: function (other, self) {


    },

    /**
     * 当两个碰撞体持续接触时每帧调用（基于非物理碰撞系统）
     * @param {cc.Collider} other - 持续接触的另一个碰撞体
     * @param {cc.Collider} self - 当前节点的碰撞体
     */
    onCollisionStay(other, self) {

    },
    // update (dt) {},
});
