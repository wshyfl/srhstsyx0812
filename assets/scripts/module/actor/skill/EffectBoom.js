// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const Game = require("Game")
cc.Class({
    extends: require("EffectShuiPao"),

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


    initEffect(skillData, owner) {
        this._super(skillData);
        let result = Game.instance.findNearestMonster(owner.node);
        if (result) {
            this.monster = result[0].getComponent("Monster")
            let targetPos = this.monster.getCenterPos();
            let dist = result[1];
            let speed = 1000; //秒/像素
            let time = dist / speed;
            cc.tween(this.node)
                .to(time, { position: targetPos }, { easing: "quadIn" })
                .call(() => {
                    this.desper();
                    this.monster.eatTrap(skillData);
                })
                .start()
        } else {
            this.desper();
        }


    },
    //销毁方法 重写
    desper() {
        GlobalMng.uiMng.createSkeBoomEffect('actor/skillBoom/boom_炸弹', Game.instance.playerRoot, this.monster.getCenterPos())
        this.node.destroy();
    },

});
