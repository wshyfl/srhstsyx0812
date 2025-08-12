// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
cc.Class({
    extends: require("MonsterCollArea"),

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
    setCharacterTarget(character) {
        this.character = character;
    },

    /**
     * 当碰撞体进入碰撞范围时调用（基于非物理碰撞系统）
     * @param {cc.Collider} other - 进入碰撞的另一个碰撞体
     * @param {cc.Collider} self - 当前节点的碰撞体
     */
    onCollisionEnter: function (other, self) {
        let collName = other.node.name;
        switch (collName) {
            case "水泡":
            case "香蕉":
                let effect = other.node.getComponent("EffectShuiPao");
                effect.desper();
                this.character.eatTrap(effect.skillData);
                break;
        }
    },

});
