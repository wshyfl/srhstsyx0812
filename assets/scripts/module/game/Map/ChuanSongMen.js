// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
//地图机关 传送点
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
        anotherDoor: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.coolDown = 10;
        this.passThrough = false;
        this.countDown = this.coolDown;
    },



    /**
    * 当碰撞体进入碰撞范围时调用（基于非物理碰撞系统）
    * @param {cc.Collider} other - 进入碰撞的另一个碰撞体
    * @param {cc.Collider} self - 当前节点的碰撞体
    */
    onCollisionEnter: function (other, self) {
        let collName = other.node.name;
        if (collName == "realArea" && !this.passThrough && this.anotherDoor) { //碰到的是角色
            let character = other.node.getComponent("MonsterCollArea").character;
            let curTargetNode = character.node;
            character.openTimeTravel();
            character.freeze();
            GlobalMng.audioMng.playEffect(`传送`);
            cc.tween(curTargetNode)
                .to(0.2, { scale: 0, position: this.node.getPosition() })
                .delay(0.2)
                .set({ position: this.anotherDoor.getPosition() })
                .to(0.2, { scale: 1 })
                .call(() => {
                    character.thaw();
                    character.closeTimeTravel();
                    if (character.ctlType == 0) {
                        character.resMoveSetData();
                    }
                })
                .start()
            this.passThrough = true;
            this.anotherDoor.getComponent("ChuanSongMen").passThrough = true;
        }
    },

    update(dt) {
        if (this.passThrough) {
            this.countDown -= dt;
            if (this.countDown <= 0) {
                this.countDown = this.coolDown;
                this.passThrough = false;
            }
        }
    },
});
