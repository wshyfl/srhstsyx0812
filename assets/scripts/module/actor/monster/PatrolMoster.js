const Types = require('../../../module/data/Types');
const Game = require("Game");
//巡逻怪
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
        patrolVecB: cc.v2(0, 0)
    },

    initMonster() {
        this._super();
        //正面触发激怒距离
        this.frontPatrolDist = 360;
        //背面触发激怒距离
        this.backPatrolDist = 150;
        //视野距离
        this.viewDist = 600;
        //是否触发激怒  激怒后开始追击
        this.isfury = false;
        //是否在巡逻
        this.isPatrol = true;
        //巡逻点
        this.patrolVecA = this.node.getPosition();
        this.patrolVecB = cc.v2(1314, 230);
        //巡逻点名字
        this.patrolName = "B";
        this.setMoveLine(this.node.getPosition(), this.patrolVecB);

        this.skeNode = this.node.getChildByName("ske");

    },


    /**
     * 检查是否需要追击玩家
     * @returns {boolean} - 返回是否需要追击（true 表示追击，false 表示不追击）
     */
    checkNeedChasing() {
        // 如果没有最近的目标或距离未计算，返回 false
        if (!this.nearestTarget) {
            return false;
        }
        // 获取怪物的朝向（假设朝向由 scaleX 或其他方式表示）
        // scaleX > 0 表示朝右，< 0 表示朝左
        const monsterFacingRight = this.skeNode.scaleX > 0;
        // 判断玩家相对于怪物的位置（左或右）
        const playerIsRight = this.nearestTarget.x > this.node.x;

        // 判断是否面对玩家
        const isFacingPlayer = (monsterFacingRight && playerIsRight) || (!monsterFacingRight && !playerIsRight);

        // 定义正面和背面的追击距离
        if (isFacingPlayer) {
            // 正面面对玩家，检查距离是否小于 frontPatrolDist
            return this.nearestDist <= this.frontPatrolDist;
        } else {
            // 背对玩家，检查距离是否小于 backPatrolDist
            return this.nearestDist <= this.backPatrolDist;
        }
    },

    //设置是否巡逻
    setPatrol(flag) {
        if (this.isPatrol && flag) return

        this.isPatrol = flag;
        if (this.isPatrol) {
            switch (this.patrolName) {
                case 'A':
                    this.setMoveLine(this.node.getPosition(), this.patrolVecA);
                    break;
                case 'B':
                    this.setMoveLine(this.node.getPosition(), this.patrolVecB);
                    break;

            }
        }
    },

    //具体追击策略重写父类方法
    chasingPloy() {
        this.setMoveLine(this.node.getPosition(), this.nearestTarget.getPosition());
    },
    //更新动作
    updateAction() {
        if (this.getIsSportState()) {
            if (this.moveScript.getIsStopState()) {
                this.spineCtrl.playIdle();
            } else {
                if (this.isPatrol) {
                    this.moveScript.speedFast = 0.5;
                    this.spineCtrl.playLoop("走");
                } else {
                    this.moveScript.speedFast = 1;
                    this.spineCtrl.playLoop("跑");
                    this.playMonsterWalk();
                }

            }
        }
    },

    //切换巡逻点
    changePatrol() {
        this.patrolName = this.patrolName == 'A' ? 'B' : 'A';
        this.setPatrol(false); //先关一次
        this.setPatrol(true);
    },

    //检测和巡逻点的距离
    updatePatrol(dt) {
        let target = this.patrolName == 'A' ? this.patrolVecA : this.patrolVecB;
        let dist = this.node.getPosition().sub(target).mag();
        if (dist <= 30) {
            this.changePatrol();
        }

    },
    // 重写父类方法
    updateMonster(dt) {
        this._super();
        if (this.isfury) {
            this.setPatrol(false);
            this.setChasingPlayer(true);
            if (!this.nearestTarget) {
                this.isfury = false;
                return
            }
            //超出视野 结束发怒
            if (this.nearestDist > this.viewDist) {
                this.isfury = false;
            }
        } else {
            //判断是否满足追击条件
            if (this.checkNeedChasing()) {
                this.isfury = true;
            } else {
                this.setPatrol(true);
                this.setChasingPlayer(false)
            }

        }

        //判断巡逻点距离
        if (this.isPatrol) {
            this.updatePatrol(dt);
        }


    },
    // update (dt) {},
});
