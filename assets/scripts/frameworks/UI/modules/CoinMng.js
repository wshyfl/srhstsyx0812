
cc.Class({
    extends: cc.Component,

    properties: {
        coinPrefab: {
            default: null,
            type: cc.Prefab
        },
        diamondPrefab: {
            default: null,
            type: cc.Prefab
        },
        maxDuration: 0.8, // 默认最大飞行时间
    },

    onLoad() {
        // 创建一个节点池
        this.itemPool = null;
        this.goldPool = new cc.NodePool();
        this.diamondPool = new cc.NodePool();
        this.items = [];
        for (let i = 0; i < 10; i++) {
            let item = cc.instantiate(this.coinPrefab); // 默认创建金币
            let item2 = cc.instantiate(this.diamondPrefab); // 默认创建金币
            this.goldPool.put(item);
            this.diamondPool.put(item2);
        }
    },

    randomRange(min, max) {
        return min + Math.random() * (max - min);
    },

    spawnItem(worldStartPos, worldEndPos, parentNode, type = "coin", duration = null) {
        let prefab;
        switch (type) {
            case "diamond":
                prefab = this.diamondPrefab;
                this.itemPool = this.diamondPool;
                break;
            // 可以继续添加其他类型的预制体
            default:
                prefab = this.coinPrefab;
                this.itemPool = this.goldPool;
                break;
        }

        let item = null;
        if (this.itemPool.size() > 0) {
            item = this.itemPool.get();
        } else {
            item = cc.instantiate(prefab);
        }
        item.parent = parentNode;//Game.instance.gameUINode;
        item.zIndex = 900;
        // // 将 startPos 和 endPos 转换为世界坐标（如果传入的不是世界坐标）
        // let worldStartPos = parentNode.convertToWorldSpaceAR(startPos);
        // let worldEndPos = parentNode.convertToWorldSpaceAR(endPos);

        // 将世界坐标转换为相对于父节点的本地坐标
        let localStartPos = parentNode.convertToNodeSpaceAR(worldStartPos);
        let localEndPos = parentNode.convertToNodeSpaceAR(worldEndPos);

        item.setPosition(localStartPos);

        // 初始化物品飞行参数
        let itemData = {
            node: item,
            startPos: localStartPos,
            targetPos: localEndPos,
            controlPoint: this._calculateControlPoint(localStartPos, localEndPos),
            duration: duration || this.maxDuration,
            elapsed: 0
        };

        this.items.push(itemData);
    },

    _calculateControlPoint(startPos, targetPos) {
        let offset = 100; // 控制点的偏移量
        return cc.v2(
            (startPos.x + targetPos.x) / 2 + this.randomRange(-offset, offset),
            (startPos.y + targetPos.y) / 2 + this.randomRange(-offset, offset)
        );
    },

    update(dt) {
        this.items.forEach(itemData => {
            itemData.elapsed += dt;
            const progress = cc.misc.clamp01(itemData.elapsed / itemData.duration);
            // 计算贝塞尔曲线的位置
            let bezierPos = this._calculateBezierPosition(itemData.startPos, itemData.controlPoint, itemData.targetPos, progress);
            itemData.node.setPosition(bezierPos.x, bezierPos.y);

            if (progress >= 1) {
                this.itemPool.put(itemData.node); // 将物品放回节点池
                this.items = this.items.filter(id => id !== itemData); // 移除飞行完成的物品数据
            }
        });
    },

    _calculateBezierPosition(start, control, end, t) {
        let x = Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * control.x + Math.pow(t, 2) * end.x;
        let y = Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * control.y + Math.pow(t, 2) * end.y;
        return cc.v2(x, y);
    },


    /**
     *  创建金币飞行动画函数
     * @param {number} numOfCoins  金币数量
     * @param {cc.Node} parentNode  父节点
     * @param {cc.v2} startPos 开始位置
     * @param {cc.v2} endPos  结束位置
     */
    createGoldAnimation(numOfCoins, parentNode, startPos, endPos) {
        for (let i = 0; i < numOfCoins; i++) {
            let gold = cc.instantiate(this.coinPrefab);

            parentNode.addChild(gold);
            gold.setPosition(startPos);
            let randomOffsetX = Math.random() * 200 - 100; // X 轴偏移范围 [-100, 100]
            let randomOffsetY = Math.random() * 200 - 100; // Y 轴偏移范围 [-100, 100]
            let middlePos = cc.v2(startPos.x + randomOffsetX, startPos.y + randomOffsetY);
            let delayTime = i * 0.05;  // 每个金币之间的时间间隔为 0.1 秒
            if (delayTime >= 0.3) {
                delayTime = 0.3
            }
            cc.tween(gold)
                .to(0.35, {
                    position: middlePos,
                    scale: 0.8  // 中间位置时稍微缩小
                }, { easing: "smooth" })  // 中间位置的缓动效果
                .to(0.35 + delayTime, {
                    position: endPos,
                    scale: 0.3  // 到达目标点时完全缩小
                }, { easing: "sineIn" })  // 飞向目标点
                .call(() => {
                    // 动画结束后，可以销毁金币节点或者执行其他逻辑
                    gold.destroy();
                })
                .start();
        }
    }


});
