// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const Game = require("Game")
//地图钥匙
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
        this.keyName = "";
        this.qudaRect = null;
        this.ske = this.node.getChildByName("宝石").getComponent(sp.Skeleton);
        let texture = this.ske.skeletonData.textures[0];
        texture.packable = true; // 启用纹理压缩
        this.ske.batching = true;
        this.ske.enableBatch = true;

        this.flySpeed = 880;
        this.arriveThreshold = 10;
    },

    start() {
    },
    setFlayTarget(player) {
        this.player = player;
    },

    keyDesAnimation() {
        this.ske.setAnimation(0, "消失", false);
        this.ske.setCompleteListener((trackEntry, loopCount) => {
            if (trackEntry.animation.name === "消失") {
                this.node.destroy();
            }
        });
     
    },
    update(dt) {
        if (this.player) {
            let flysPos = this.player.getMagnetHandPos();
            if (flysPos) {
                // 获取当前节点位置
                let currentPos = this.node.getPosition();
                // 计算目标方向和距离
                let direction = flysPos.sub(currentPos); // flysPos - currentPos
                let distance = direction.mag(); // 计算距离
                // 判断是否到达目标
                if (distance <= this.arriveThreshold) {
                    // 到达目标，销毁节点
                    Game.instance.addKey();
                    this.node.destroy();
                    return;
                }
                // 计算每帧移动距离
                let moveDistance = this.flySpeed * dt;
                // 归一化方向并计算移动向量
                let moveVec = direction.normalize().mul(moveDistance);
                // 更新位置
                this.node.setPosition(currentPos.add(moveVec));
            }
        }
    },
});
