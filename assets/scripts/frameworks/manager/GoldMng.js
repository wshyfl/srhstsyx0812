var PlayerData = require("PlayerData");
var EventMng = require("EventMng").one;

cc.Class({
    extends: cc.Component,

    properties: {
        labGold: {
            default: null,
            type: cc.Label
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.isClicking = false;
        this.goldTitle = this.node.getChildByName("goldTitle");
        // 注册事件监听器
        EventMng.on('UpdateGold', this.updateGold, this);

        this.labGold.string = PlayerData.playerInfo.gold;
    },

    onDestroy() {
        // 注销事件监听器
        EventMng.off('UpdateGold', this.updateGold, this);
    },

    // effectData {scoreDur:0.5,flyPos:cc.v(0,0)}
    //scoreDur,flyPos,minGold,maxGold,flyParent
    updateGold(num, isPlayEffect = true, isFlyGold = true, callBack, effectData = {}) {
        let ysSord = 0;
        if (num !== undefined && num !== null && typeof num == 'number') {

            GlobalMng.audioMng.playEffect("获得金币");
            ysSord = PlayerData.playerInfo.gold;
            PlayerData.playerInfo.gold += num;
            PlayerData.savePlayerInfoToLocalCache();
            callBack && callBack();
            //是否需要延迟播放label张金币的效果
            if (isPlayEffect) {
                let flyTime = effectData.scoreDur ? effectData.scoreDur : 0.25;
                this.playScoreEffect(this.labGold, PlayerData.playerInfo.gold, flyTime, ysSord)
            } else {
                this.labGold.string = PlayerData.playerInfo.gold;
            }

            if (isFlyGold) {
                let min = effectData.minGold ? effectData.minGold : 100;
                let max = effectData.maxGold ? effectData.maxGold : 200;
                let startPos = effectData.startPos ? effectData.startPos : cc.v2(0, 0);
                let endPos = effectData.endPos ? effectData.endPos : this.goldTitle.position;
                let parentNode = effectData.flyParent ? effectData.flyParent : this.node;
                this.createGoldAnimation(15, parentNode, startPos, endPos, max, min)
            }
        }
    },
    /**
    * 分数特效函数
    * @param {cc.Label} lab - 要更新分数的 Label 组件
    * @param {number} targetScore - 目标分数
    * @param {number} duration - 动画持续时间（可选，默认1秒）
    * @param {number} startScore - 起始分数（可选，默认0）
    */
    playScoreEffect(lab, targetScore, duration = 1, startScore = 0) {
        let currentScore = startScore;  // 初始化当前分数为起始分数
        let interval = 0.02;            // 每次更新的间隔时间
        let steps = duration / interval; // 更新次数
        let increment = (targetScore - startScore) / steps; // 每次更新的增量

        // 停止之前的动作
        lab.unscheduleAllCallbacks();

        // 启动计时器更新分数
        lab.schedule(() => {
            currentScore += increment;
            // 根据方向检查是否达到目标分数，确保最终显示的分数与目标一致
            if ((increment > 0 && currentScore >= targetScore) || (increment < 0 && currentScore <= targetScore)) {
                currentScore = targetScore;
                lab.string = Math.floor(currentScore); // 显示最终分数
                lab.unscheduleAllCallbacks(); // 停止更新
            } else {
                lab.string = Math.floor(currentScore); // 显示当前分数
            }
        }, interval);
    },
    /**
     *  创建金币飞行动画函数
     * @param {number} numOfCoins  金币数量
     * @param {cc.Node} parentNode  父节点
     * @param {cc.v2} startPos 开始位置
     * @param {cc.v2} endPos  结束位置
     */
    createGoldAnimation(numOfCoins, parentNode, startPos, endPos, max = 200, min = 100) {
        for (let i = 0; i < numOfCoins; i++) {
            let gold = cc.instantiate(this.goldTitle.getChildByName("goldIcon"));
            parentNode.addChild(gold);
            gold.setPosition(startPos);
            let randomOffsetX = Math.random() * max - min; // X 轴偏移范围 [-100, 100]
            let randomOffsetY = Math.random() * max - min; // Y 轴偏移范围 [-100, 100]
            let middlePos = cc.v2(startPos.x + randomOffsetX, startPos.y + randomOffsetY);
            let delayTime = i * 0.05;  // 每个金币之间的时间间隔为 0.1 秒
            if (delayTime >= 0.3) {
                delayTime = 0.3
            }
            cc.tween(gold)
                .to(0.2, {
                    position: middlePos,
                    scale: 1.2  // 中间位置时稍微缩小
                }, { easing: "smooth" })  // 中间位置的缓动效果
                .to(0.2 + delayTime, {
                    position: endPos,
                    scale: 0.3  // 到达目标点时完全缩小
                }, { easing: "sineIn" })  // 飞向目标点
                .call(() => {
                    // 动画结束后，可以销毁金币节点或者执行其他逻辑
                    gold.destroy();
                })
                .start();
        }
    },



});
