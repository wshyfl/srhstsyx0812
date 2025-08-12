// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
//地图机关 传送带
const Dir = cc.Enum({
    Up: 0,
    Right: 1,
    Down: 2,
    Left: 3
});

cc.Class({
    extends: cc.Component,

    properties: {
        speedDir: {
            default: Dir.Right,
            type: Dir,
            tooltip: "传送带移动方向"
        },
        moveSpeed: {
            default: 100,
            type: cc.Float,
            tooltip: "传送带移动速度（像素/秒）"
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.moveSpeed = 50;
    },

    /**
     * 当两个碰撞体持续接触时每帧调用（基于非物理碰撞系统）
     * @param {cc.Collider} other - 持续接触的另一个碰撞体
     * @param {cc.Collider} self - 当前节点的碰撞体
     */
    onCollisionStay(other, self) {
        let collName = other.node.name;
        let moveNode = null;
        if (collName === "realArea") { // 碰到的是角色
            let character = other.node.getComponent("MonsterCollArea")?.character;
            if (character) {
                moveNode = character.node
            }
        } else if (collName == "香蕉" || collName == "水泡") {
            moveNode = other.node;
        }

        if (moveNode) {
            // 根据方向和速度移动角色
            let dt = cc.director.getDeltaTime(); // 获取每帧时间
            let moveDistance = this.moveSpeed * dt; // 计算每帧移动距离
            switch (this.speedDir) {
                case Dir.Up:
                    moveNode.y += moveDistance;
                    break;
                case Dir.Right:
                    moveNode.x += moveDistance;
                    break;
                case Dir.Down:
                    moveNode.y -= moveDistance;
                    break;
                case Dir.Left:
                    moveNode.x -= moveDistance;
                    break;
            }
        }
    },

    // update (dt) {},
});