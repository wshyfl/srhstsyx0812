// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const Types = require("../../data/Types");
const Game = require("Game");
//地图机关 地刺
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

    onLoad() {
        this.isAttack = false;
        this.node.getComponent(cc.BoxCollider).enabled = false;
    },



    diciUp() {
        this.isAttack = true;
        this.node.getComponent(cc.BoxCollider).enabled = true;
    },

    diciDown() {
        this.isAttack = false;
        this.node.getComponent(cc.BoxCollider).enabled = false;
    },

    /**
     * 当碰撞体进入碰撞范围时调用（基于非物理碰撞系统）
     * @param {cc.Collider} other - 进入碰撞的另一个碰撞体
     * @param {cc.Collider} self - 当前节点的碰撞体
     */
    onCollisionEnter: function (other, self) {
        let collName = other.node.name;
        if (collName == "soleArea" && this.isAttack) { //碰到的是角色
            let character = other.node.getComponent("MonsterCollArea").character;
            let uid = character.node.uuid;
            let slowPercen = character.team == Types.ActorTeam.Human ? 50 : 30;
            if (character.isHasBufferById(Types.BufferKey.Dici) == false && character.onIsCanSlown()) {
                character.addBufffer(Types.BufferKey.Dici);
                character.slowDown(slowPercen, 3)
                Game.instance.timeMng.startTimer(uid, 0.5, () => {
                    character.removeBuffer(Types.BufferKey.Dici);
                })
            }
        }
    },

    // update (dt) {},
});
