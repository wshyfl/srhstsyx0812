const Types = require('../../../module/data/Types');
const AStarMap = require("../../../frameworks/AStar").AStarMap;
//怪物基类
cc.Class({
    extends: require('Character'),

    properties: {
        detectRange: {
            default: 100,
            tooltip: "检测玩家的范围"
        },

        monsterType: {
            default: Types.MonsterType.Chasing,
            type: Types.MonsterType,
            tooltip: "怪物类型"
        },

    },

    // 初始化怪物
    init(game, data = {}) {
        this._super(game, data); // 调用父类的 init 方法
        this.nearestTarget = null;      //最近目标
        this.chasingInterval = 1000;         //追击时间
        this.nearestDist = 0;           //最近的目标距离
        this.ischasingPlayer = false;  //是否追击玩家 
        this.isInTrap = false;  //是否已经中陷阱
        this.isAttacking = false; //是否正在攻击中
        this.pathPosArray = []; // 存储路径点
        this.currentTargetPos = null; // 当前目标点
        this.isPlayWalkSond = false;//是否在播放脚步声
        this.checkFaceTime = 0;   //检测表情时间
        this.astarMap = new AStarMap(this.game.curMapScript.curTiledMap, "路径");
        this.astarMap.initMap();
        if (GlobalMng.isTestDraw) {
            this.createDraw();
        }
        this.initMonster();

        this.realAreaNode.getComponent("MonsterCollArea").setCharacterTarget(this);
        this.soleAreaNode.getComponent("MonsterSoleArea").setCharacterTarget(this);


        let skeSkin = this.game.getMonsterSkeName();
        this.spineCtrl.loadAndChangeSkin(`monster/${skeSkin}`);
        this.setSportState();
    },
    //绘制路线的画笔
    createDraw() {
        let colorArray = [cc.Color.RED, cc.Color.YELLOW, cc.Color.BLUE]
        // 创建一个新的Node来容纳Graphics组件
        const graphicsNode = new cc.Node();
        this.game.curMapNode.addChild(graphicsNode);
        // 添加Graphics组件
        this.graphics = graphicsNode.addComponent(cc.Graphics);
        // 开始绘制
        this.graphics.lineWidth = 10;
        this.graphics.fillColor = colorArray[this.game.monsterArray.length - 1];
        // 随机生成 RGB 颜色
        // let randomColor = new cc.Color(
        //     Math.floor(Math.random() * 256),  // R
        //     Math.floor(Math.random() * 256),  // G
        //     Math.floor(Math.random() * 256)   // B
        // );
        // // 设置随机颜色
        // this.graphics.fillColor = randomColor;//randomColor;
    },


    //绘制点路线
    drawPathPoint(pathPosArray) {
        this.graphics.clear();
        // 检查是否有点可以绘制
        if (pathPosArray.length > 0) {
            // 绘制每个点
            for (let i = 0; i < pathPosArray.length; i++) {
                let pos = pathPosArray[i];
                //  this.graphics.fillColor = cc.Color.RED;
                this.graphics.circle(pos.x, pos.y, 10); // 5为点的半径，可根据需求调整
                this.graphics.fill(); // 填充绘制的圆
            }
        }
    },
    initMonster() {
        this.id = "Monster" + this.game.getMonsterNum();
    },

    isPatrol() {
        return this.monsterType == Types.MonsterType.Patrol
    },

    isChasing() {
        return this.monsterType == Types.MonsterType.Chasing
    },
    chasingPloy() { },
    updateMonster(dt) {
        if (this.game.monsterIsOpenMini) {
            this.game.curMapScript.updateMonsterMiniMap(this.id, this.node.getPosition())
        }
    },
    updateAction() {

    },

    changeFace(flag) {
        if (flag) {
            this.spineCtrl.ske.setAnimation(2, "表情2", false);
        } else {
            this.spineCtrl.ske.clearTrack(2);
            this.spineCtrl.ske.setAnimation(2, "表情1", false);
        }
    },
    checkFace(dt) {
        this.checkFaceTime += dt;
        if (this.checkFaceTime >= 0.5) {
            this.checkFaceTime = 0;
            if (this.nearestTarget && this.nearestDist <= 300) {
                this.changeFace(true)
            } else {
                this.changeFace(false)
            }
        }
    },
    attack(playerNode) {
        if (this.isAttacking) return
        this.isAttacking = true;
        GlobalMng.audioMng.playEffect(`怪物攻击`);
        this.spineCtrl.playNewTrack("攻击", 1, false, () => {
            this.spineCtrl._clearTracks(1);
        });
        let time = this.spineCtrl.getSkeTotalTime("攻击")
        this.scheduleOnce(() => {
            this.isAttacking = false;
        }, time);

        let player = playerNode.getComponent("Player");
        if (player.isValidPlayer()) {
            player.die()
        }


    },

    // 设置怪物的移动路线
    setMoveLine(startPos, endPos) {
        this.pathPosArray = this.astarMap.getPathByPos(startPos, endPos);
        if (this.pathPosArray && this.pathPosArray.length >= 3) {
            this.pathPosArray.shift(); // 移除起点（假设已经在起点）
        }
        this.currentTargetPos = this.pathPosArray.length > 0 ? this.pathPosArray[0] : null;

        if (GlobalMng.isTestDraw) {
            this.drawPathPoint(this.pathPosArray)
        }
    },

    //设置是否追求玩家
    setChasingPlayer(flag) {
        this.ischasingPlayer = flag;
    },


    //找到距离最近并且符合条件的玩家
    findClosestPlayerByRule(targetNode, nodeArray) {
        // 检查参数是否合法
        if (!targetNode || !nodeArray || nodeArray.length === 0) {
            return null;
        }
        let closestNode = null;   // 初始化最近的节点变量
        let minDistance = Infinity;   // 初始化最小距离为无限大，便于后续比较
        // 获取对比节点的世界坐标
        const targetWorldPos = targetNode.parent.convertToWorldSpaceAR(targetNode.position);
        // 遍历节点数组
        nodeArray.forEach(node => {
            // 获取当前节点的世界坐标
            const nodeWorldPos = node.parent.convertToWorldSpaceAR(node.position);
            // 计算与目标节点的距离
            const distance = targetWorldPos.sub(nodeWorldPos).mag();
            let player = node.getComponent("Player")
            // 判断是否找到更近的节点
            if (distance < minDistance && player.isFindPlayer()) {
                minDistance = distance;   // 更新最小距离
                closestNode = node;       // 更新最近的节点
            }
        });

        // 返回最近的节点
        return [closestNode, minDistance];;
    },
    //找到离自己最近的玩家
    findNearestPlayer(dt) {
        this.chasingInterval += dt;
        if (this.chasingInterval >= 0.2) {
            this.chasingInterval = 0;

            const result = this.findClosestPlayerByRule(this.node, this.game.playerArray);
            if (result) {
                this.nearestTarget = result[0];
                this.nearestDist = result[1];
                if (this.nearestTarget) {
                    this.nearestDist = result[1];
                }
            }

            if (this.ischasingPlayer) {
                if (this.nearestTarget) {
                    let valid = this.nearestTarget.getComponent("Player").isValidPlayer();
                    if (valid) {
                        if (this.nearestDist <= 800) {
                            this.setChasingTime(1);
                        } else if (this.nearestDist > 800 && this.nearestDist <= 1600) {
                            this.setChasingTime(2);
                        } else {
                            this.setChasingTime(3.5);
                        }
                        //追击策略放给子类
                        this.chasingPloy(0.2);
                        //达到攻击范围
                        if (!this.isInTrap && this.nearestDist <= this.detectRange) {
                            this.attack(this.nearestTarget);
                        }
                    }

                }
            }
        }

    },


    closeColliderBox() {
        this.node.getChildByName("realArea").getComponent(cc.BoxCollider).enabled = false;
        this.node.getChildByName("realArea").active = false;
    },
    openColliderBox() {
        this.node.getChildByName("realArea").getComponent(cc.BoxCollider).enabled = true;
        this.node.getChildByName("realArea").active = true;
    },

    //关闭碰撞
    closeTouchTrap() {
        this.isInTrap = true;

    },
    //开启碰撞
    openTouchTrap() {
        this.isInTrap = false;
        // this.node.getChildByName("realArea").getComponent(cc.BoxCollider).enabled = true;
        // this.node.getChildByName("realArea").active = true;
    },
    //吃到玩家技能
    eatTrap(skillData) {
        if (this.isInTrap) return
        this.closeTouchTrap();
        switch (skillData.id) {
            case Types.ActorSkillType.HuanMengGongZhu:  //水泡
                this.closeColliderBox();
                this.freezeMonster();
                this.paopaoTrap(skillData);
                break;
            case Types.ActorSkillType.XiangJIaoXia:  //香蕉
                this.freezeMonster();
                this.xiangJiaoTrap(skillData);
                break;
            case Types.ActorSkillType.ZhaDanChaoRen:  //炸弹
                this.freezeMonster();
                this.zhaDanTrap(skillData);
                break;
        }
    },

    //踩到泡泡
    paopaoTrap(skillData) {
        this.spineCtrl.resetAnimationState();
        this.spineCtrl.playAnimationByName('水泡开始', false, () => {
            this.spineCtrl.playLoop("水泡循环");
            this.scheduleOnce(() => {
                this.spineCtrl.playAnimationByName('水泡结束', false, () => {
                    this.freeMonster();
                    this.openTouchTrap();
                    this.openColliderBox();
                })
            }, skillData.controlTime)
        })
    },

    //踩到香蕉
    xiangJiaoTrap(skillData) {
        GlobalMng.audioMng.playEffectInSequence("滑", "摔倒");
        this.spineCtrl.resetAnimationState();
        this.spineCtrl.playAnimationByName('香蕉皮开始', false);
        this.scheduleOnce(() => {
            this.spineCtrl.playAnimationByName('香蕉皮结束', false, () => {
                this.freeMonster();
                this.openTouchTrap();
            })
        }, skillData.controlTime)
    },

    //吃到炸弹
    zhaDanTrap(skillData) {
        GlobalMng.audioMng.playEffect("爆炸");
        this.spineCtrl.resetAnimationState();
        this.spineCtrl.playAnimationByName('炸弹开始', false);
        this.scheduleOnce(() => {
            this.spineCtrl.playAnimationByName('炸弹结束', false, () => {
                this.freeMonster();
                this.openTouchTrap();
            })
        }, skillData.controlTime)
    },

    //冻结怪物
    freezeMonster() {
        this.setFreezeState();
        this.freeze();

    },
    //解除冻结
    freeMonster() {
        this.setSportState();
        this.thaw();
    },

    //怪物脚步声
    playMonsterWalk() {
        if (!this.isPlayWalkSond) {
            this.isPlayWalkSond = true;
            GlobalMng.audioMng.playEffectWithCallback(`怪物脚步声`, () => {
                this.isPlayWalkSond = false;
            });
        }
    },
    /**
     * 更新路径移动逻辑，使用插值处理高速移动
     * @param {number} dt - 每帧时间
     */
    updatePathMove(dt) {
        if (!this.pathPosArray || this.pathPosArray.length === 0 || !this.currentTargetPos) {
            this.moveScript.moveDir = null;
            return;
        }
        // 当前位置
        const currentPos = this.node.position;
        // 目标方向和距离
        const direction = this.currentTargetPos.sub(currentPos);
        const distance = direction.mag();
        // 获取移动速度
        const speed = this.moveScript.getCurSpeed(); // 默认速度，可根据实际调整
        const moveDistance = speed * dt; // 本帧移动距离
        if (distance <= moveDistance) {
            // 距离小于本帧移动步长，直接到达目标
            //  this.node.position = this.currentTargetPos;
            this.pathPosArray.shift();
            if (this.pathPosArray.length > 0) {
                this.currentTargetPos = this.pathPosArray[0];
            } else {
                this.currentTargetPos = null;
                this.moveScript.moveDir = null;
                return;
            }
        } else {
            // 计算插值移动
            this.moveScript.moveDir = direction.normalize();
        }
    },
    resMoveSetData() {
        this.pathPosArray = []; // 存储路径点
        this.currentTargetPos = null; // 当前目标点
        this.moveScript.moveDir = null; // 移动方向
        this.chasingInterval = 0;
        this.isFindNewLine = false;
        this.recordLineTime = 0;
        this.chasingTime = 0;
        this.dtTime = 0;
    },
    update(dt) {
        if (this.game.gameStateIsOver()) return
        this._super(dt); // 调用父类的 update
        this.updatePathMove(dt);
        this.moveScript.updateMove(dt);
        this.findNearestPlayer(dt);
        this.updateMonster(dt);
        // this.checkFace(dt);

    }
});