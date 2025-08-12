
const Game = require("Game");

//地图自动门
cc.Class({
    extends: cc.Component,

    properties: {
        inRange: {
            default: 300,
            type: cc.Float,
            tooltip: "触发开门的范围",
        },
        levelRange: {
            default: 500,
            type: cc.Float,
            tooltip: "当所有实体都在外部时触发门关闭的范围",
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.inRange = 260;
        this.levelRange = 300;
        this.game = Game.instance;
        this.doorIsOpen = false;
        this.updateTime = 0; // 初始化为0
        this.ske = this.node.getChildByName("ske").getComponent(sp.Skeleton);
    },

    checkDistances() {
        const tempArray = this.game.playerArray.concat(this.game.monsterArray);
        let hasSomeOneInOpenRange = false;
        let allOutsideCloseRange = true;

        // 获取门的当前位置
        const selfPos = this.node.getPosition();

        // 遍历所有角色
        for (let i = 0; i < tempArray.length; i++) {
            // 确保节点有效
            if (!tempArray[i] || !tempArray[i].isValid) continue;

            const rolePos = tempArray[i].getPosition();
            const distance = _.dist(selfPos, rolePos);

            // 检查是否有人在开门范围内
            if (distance <= this.inRange) {
                hasSomeOneInOpenRange = true;
                allOutsideCloseRange = false;
                break;
            }
            // 检查是否所有角色都在关门范围外
            if (distance <= this.levelRange) {
                allOutsideCloseRange = false;
            }
        }

        // 更新状态并控制门
        if (hasSomeOneInOpenRange && !this.doorIsOpen) {
            this.openTheDoor();
        } else if (!hasSomeOneInOpenRange && this.doorIsOpen && allOutsideCloseRange) {
            this.closeTheDoor();
        }

    },

    openTheDoor() {
        if (this.doorIsOpen) return;

        this.doorIsOpen = true;
        this.ske.setAnimation(0, "开", false);
    },

    closeTheDoor() {
        if (!this.doorIsOpen) return;

        this.doorIsOpen = false;
        this.ske.setAnimation(0, "关", false);
    },

    update(dt) {
        this.updateTime += dt;
        // 每0.1秒检查一次距离（可以根据性能需求调整频率）
        if (this.updateTime >= 0.1) {
            this.updateTime = 0;
            this.checkDistances();
        }
    },
});