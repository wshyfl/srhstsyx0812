// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const Game = require("Game")
//玩家技能传送门
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

    chuanSong(curTargetNode, targetPos) {
        let doorNode = null;
        GlobalMng.sceneMng.createUIByBundle('actor/skillEffect/传送门', Game.instance.curMapScript.keyRoot, (cNode) => {
            cNode.setPosition(targetPos);
            doorNode = cNode;
        });
        cc.tween(curTargetNode)
            .to(0.2, { scale: 0 })
            .call(() => {
                this.desper();
            })
            .to(0.3, { position: targetPos })
            .to(0.2, { scale: 1 })
            .call(() => {
                if (curTargetNode.getComponent("Character")) {
                    curTargetNode.getComponent("Character").thaw();
                }
                if (curTargetNode.getComponent("Player")) {
                    curTargetNode.getComponent("Player").closeTimeTravel();
                }
            })
            .delay(0.5)
            .call(() => {
                if (doorNode) {
                    doorNode.getComponent("EffectChuanSongMen").desper();
                }
            })
            .start()
    },


    initEffect(skillData, owner) {
        this._super(skillData);
        let targetPos = Game.instance.findOneKeyPosByDist(owner.node.getPosition());
        this.chuanSong(owner.node, targetPos);

    },
    //销毁方法 重写
    desper() {
        cc.tween(this.node)
            .to(0.3, { scale: 0 })
            .call(() => {
                this.node.destroy();
            })
            .start()

    },
    // update (dt) {},
});
