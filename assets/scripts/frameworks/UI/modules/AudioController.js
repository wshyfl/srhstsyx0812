const Game = require("Game")
cc.Class({
    extends: cc.Component,

    properties: {
        MAX_DISTANCE: {
            default: 800,
            tooltip: "超过此距离无声音"
        },
        MIN_DISTANCE: {
            default: 400,
            tooltip: "在此距离或以内为最大音量"
        },
        MAX_VOLUME: {
            default: 1,
            tooltip: "最大音量"
        },
        MIN_VOLUME: {
            default: 0.5,
            tooltip: "最小音量"
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {
        this.trainAudio = this.node.getComponent(cc.AudioSource);
        this.trainAudio.volume = 0;
    },

    update(dt) {
        if (!Game.instance.roleLoadCompelete) return

        let targetNode = null;
        let distance = 0;

        // 单人模式
        if (GlobalMng.isSingel()) {
            if (GlobalMng.isHuman()) {
                targetNode = Game.instance.role1Script.node;
            } else {
                targetNode = Game.instance.ghost1Script.node;
            }
            distance = this.calculateDistance(this.node, targetNode);
        }
        // 双人模式
        else {
            let node1, node2, dist1, dist2;
            if (GlobalMng.isHuman()) {
                node1 = Game.instance.role1Script.node;
                node2 = Game.instance.role2Script.node;
            } else {
                node1 = Game.instance.ghost1Script.node;
                node2 = Game.instance.ghost2Script.node;
            }

            dist1 = this.calculateDistance(this.node, node1);
            dist2 = this.calculateDistance(this.node, node2);
            // 使用较近的节点
            distance = Math.min(dist1, dist2);
        }

        // 根据距离调整音频
        this.adjustAudioVolume(distance);
    },

    calculateDistance(node1, node2) {
        if (!node1 || !node2) return Infinity;
        const pos1 = node1.getPosition();
        const pos2 = node2.getPosition();
        return pos1.sub(pos2).mag(); // 计算两点之间的距离
    },

    adjustAudioVolume(distance) {
        if (distance > this.MAX_DISTANCE) {
            this.trainAudio.volume = 0;
        } else if (distance <= this.MIN_DISTANCE) {
            this.trainAudio.volume = this.MAX_VOLUME;
        } else {
            // 在最小和最大音量之间线性插值
            const volumeRange = this.MAX_VOLUME - this.MIN_VOLUME;
            const distanceRange = this.MAX_DISTANCE - this.MIN_DISTANCE;
            const relativeDistance = (distance - this.MIN_DISTANCE) / distanceRange;
            const volume = this.MAX_VOLUME - (volumeRange * relativeDistance);
            this.trainAudio.volume = Math.max(this.MIN_VOLUME, Math.min(this.MAX_VOLUME, volume));

        }
    }
});