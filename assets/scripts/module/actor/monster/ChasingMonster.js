const Types = require('../../../module/data/Types');
//追击怪 
cc.Class({
    extends: require("Monster"),

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
        isAlwaysFloow: false
    },

    // LIFE-CYCLE CALLBACKS:

    initMonster() {
        this._super();
        this.setChasingPlayer(true);
        this.isFindNewLine = false;
        this.recordLineTime = 0;
        this.randLineTime = 13;
        this.chasingTime = 1;
        this.dtTime = 0;
    },

    setChasingTime(time) {
        this.chasingTime = time;
    },
    resetLine() {
        this.isFindNewLine = false;
        this.recordLineTime = 0;
    },
    //更新动作
    updateAction() {
        if (this.getIsSportState()) {
            if (this.moveScript.getIsStopState()) {
                this.spineCtrl.playIdle();
            } else {
                this.spineCtrl.playLoop("跑");
                // this.playMonsterWalk();
            }
        }
    },

    updateMonster(dt) {
        this._super();
        if (this.isFindNewLine) {
            this.recordLineTime += dt;
        }
    },
    /**
   * 根据玩家移动方向从范围内找到合适的拦截点
   * @param {cc.Vec2} startPos - 起始位置
   * @param {cc.Vec2} endPos - 结束位置
   * @param {number} [minDist=640] - 最小距离
   * @param {number} [maxDist=800] - 最大距离
   */
    findOtherLine(startPos, endPos, minDist = 500, maxDist = 800) {
        // 获取范围内可选的点数组
        let blockArray = this.game.findOneKeyPosByRange(endPos, minDist, maxDist);
        // 获取玩家当前移动方向
        // let dirPlayer = this.nearestTarget.getComponent("Player").getCurPayerDir();
        let selectedPos = null;
        if (blockArray.length > 0) {
            // let targetPoints = [];
            // // 判断玩家移动方向并筛选相应位置的点
            // if (dirPlayer.x !== 0) {
            //     // 玩家在左右移动，找上方或下方的点
            //     targetPoints = blockArray.filter(point => {
            //         let dy = point.y - endPos.y; // Y 轴偏移
            //         return dy !== 0; // dy > 0（上方）或 dy < 0（下方）
            //     });
            // } else if (dirPlayer.y !== 0) {
            //     // 玩家在上下移动，找左侧或右侧的点
            //     targetPoints = blockArray.filter(point => {
            //         let dx = point.x - endPos.x; // X 轴偏移
            //         return dx !== 0; // dx > 0（右侧）或 dx < 0（左侧）
            //     });
            // }
            // if (targetPoints.length > 0) {
            //     // 从筛选出的点中随机选择一个
            //     let randomIndex = Math.floor(Math.random() * targetPoints.length);
            //     selectedPos = targetPoints[randomIndex];
            // } else {
            //     // 如果没有符合条件的点，从 blockArray 中随机选择一个
            //     let randomIndex = Math.floor(Math.random() * blockArray.length);
            //     selectedPos = blockArray[randomIndex];
            // }
            let randomIndex = Math.floor(Math.random() * blockArray.length);
            selectedPos = blockArray[randomIndex]
            if (selectedPos) {
                this.setMoveLine(startPos, selectedPos);
                this.isFindNewLine = true;
            }
        } else {
            // 没有可选点时，使用默认路径
            this.resetLine();
            this.setMoveLine(startPos, endPos);
        }
    },
    //具体追击策略 重写父类方法
    chasingPloy(intervalTime) {
        this.dtTime += intervalTime;
        if (this.dtTime < this.chasingTime) return
        this.dtTime = 0;

        let startPos = this.node.getPosition();
        let endPos = this.nearestTarget.getPosition();
        if (this.isAlwaysFloow) {
            this.setMoveLine(startPos, endPos);
        } else {
            // let path = this.astarMap.getPathByPos(startPos, endPos);
            // let totalDist = this.astarMap.calculatePathDistance(path);
            let isFloow = false;
            if (GlobalMng.isSingle()) {
                isFloow = this.nearestTarget.getComponent("Player").isPointInCameraView(this.getCenterPos());
            } else {
                let tDist = _.dist(startPos, endPos);
                isFloow = tDist <= 350;
            }


            if (isFloow) {
                this.resetLine();
                this.setMoveLine(startPos, endPos);
            } else {
                if (!this.isFindNewLine) {
                    // 寻找距离玩家600单位内的可到达随机点
                    this.findOtherLine(startPos, endPos)
                } else {
                    if (this.pathPosArray.length == 0) {
                        this.findOtherLine(startPos, endPos);
                    }
                    if (this.recordLineTime >= this.randLineTime) {
                        this.resetLine();
                        this.findOtherLine(startPos, endPos);
                    }
                }
            }

        }






    },
    // update (dt) {},
});
