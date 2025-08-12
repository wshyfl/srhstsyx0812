// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const Types = require("Types")
const Game = require("Game")
const AStarMap = require("AStar").AStarMap;
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


    init(data) {
        //存活
        this.alive = true;
        //移速
        this.speed = data.speed;
        //固定移速
        this.baseSpeed = data.speed;
        //是否静止
        this.freeze = true;
        //0:Ai    1:p1   2:p2
        this.ctlType = data.ctlType;
        //阵营
        this.team = data.team;
        //uuid 唯一
        this.suuid = data.suuid;
        //游戏显示编号  用于显示游戏头像图片位置 
        this.gameNum = data.gameNum;
        //AI寻路用 间隔
        this.isCanMove = true;  //是否开始允许AI走A*路线
        this.pathPosArray = null;
        this.moveTargetPos = null;
        this.gameUI = Game.instance.gameUI;
        //spine动画类
        this.spineCtrl = this.node.getComponent("SpineCtrl");
        this.spineCtrl.init();

        this.node.getComponent("Move").init(this);
        this.moveScript = this.node.getComponent("Move");
        this.actorState = Types.ActorState.Free
        this.moveScript.forceStop();


        this.node.getChildByName("boundingBox").getComponent(cc.Sprite).enabled = false;

        if (this.ctlType == 0) {
            ///初始化A*
            this.initAstart();
        }




    },
    initAstart() {
        this.astarMap = new AStarMap(this.gameUI.tiledMap, "块层2");
        this.astarMap.initMap();
        this.creaDraw();
    },
    creaDraw() {
        // 创建一个新的Node来容纳Graphics组件
        const graphicsNode = new cc.Node();
        this.gameUI.allColliderNode.addChild(graphicsNode);
        // 添加Graphics组件
        this.graphics = graphicsNode.addComponent(cc.Graphics);
        // 开始绘制
        this.graphics.lineWidth = 10;
        //  this.graphics.fillColor = cc.Color.RED;
        // 随机生成 RGB 颜色
        let randomColor = new cc.Color(
            Math.floor(Math.random() * 256),  // R
            Math.floor(Math.random() * 256),  // G
            Math.floor(Math.random() * 256)   // B
        );

        // 设置随机颜色
        this.graphics.fillColor = randomColor;//randomColor;
    },

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

    drawPath(pathPosArray) {
        this.graphics.clear();
        // 移动到第一个点
        if (pathPosArray.length > 0) {
            this.graphics.moveTo(pathPosArray[0].x, pathPosArray[0].y);

            // 连接剩余的点
            for (let i = 1; i < pathPosArray.length; i++) {
                this.graphics.lineTo(pathPosArray[i].x, pathPosArray[i].y);
            }
        }
        // 绘制路径
        this.graphics.stroke();
    },

    updateHumanSpine(dt) {
        switch (this.actorState) {
            case Types.ActorState.Free: //自由状态
                if (this.moveScript.moveState == Types.MoveState.None) {
                    this.playIdeAction();
                } else {
                    this.walkAction();
                }
                break;
            case Types.ActorState.Hide: //隐藏状态用于human

                break

            case Types.ActorState.Captured:
                this.capturedAction();
                break;
        }
    },

    //待机
    playIdeAction() {
        if (this.team == Types.ActorTeam.Ghost) {
            if (!this.isCatching) {
                this.spineCtrl.playIdle();
            }
        } else {
            this.spineCtrl.playIdle();
        }

    },
    //自由移动
    walkAction() {
        if (this.team == Types.ActorTeam.Ghost) {
            if (!this.isCatching) {
                if (this.moveScript.speedFast < 2) {
                    this.spineCtrl.playLoop("走")
                } else {
                    this.spineCtrl.playLoop("跑")
                }

            }
        } else {
            this.spineCtrl.playLoop("移动")
        }
    },

    hideAction() { },
    capturedAction() { },
    isHideJoy() {
        if (this.alive == false) return true;
        if (this.team == Types.ActorTeam.Human && this.actorState == Types.ActorState.Captured) return true;
        if (this.node.active == false) return true;

        return false



    },

    //获得静止状态下 真实spine大小
    getRealSize() {
        let bbNode = this.node.getChildByName("boundingBox");
        let parentNode = this.node.parent;
        let w = bbNode.width * parentNode.scaleX;
        let h = bbNode.height * parentNode.scaleY;
        return { width: w, height: h }
    },

    getCenterPos() {
        let selfSize = this.getRealSize();
        let yy = selfSize.height / 2 + this.node.y
        return cc.v2(this.node.x, yy)
    },

    closePhy() {
        let rigidBody = this.node.getComponent(cc.RigidBody);
        let collider = this.node.getComponent(cc.PhysicsCircleCollider);


        if (rigidBody) {
            this.node.removeComponent(cc.RigidBody);  // 移除 RigidBody
        }
        if (collider) {
            this.offset = collider.offset;
            this.radius = collider.radius;
            this.node.removeComponent(cc.PhysicsCircleCollider);  // 移除碰撞体
        }
    },


    openPhy() {
        if (!this.node.getComponent(cc.RigidBody)) {
            let rigidBody = this.node.addComponent(cc.RigidBody);
            rigidBody.type = cc.RigidBodyType.Dynamic;  // 设置为动态刚体
            rigidBody.gravityScale = 0;
            rigidBody.allowSleep = false;
        }
        if (!this.node.getComponent(cc.PhysicsCircleCollider)) {
            let collider = this.node.addComponent(cc.PhysicsCircleCollider);
            collider.radius = this.radius;  // 设置碰撞体的半径
            collider.offset = this.offset;
            collider.friction = 0;
            collider.restitution = 0;
            collider.apply();  // 应用碰撞体的改变
        }
    },


    checkLine(dt) {
        if (!this.isCanMove) { // this.pathPosArray && this.pathPosArray.length > 0 &&
            let checkDist = this.node.position.sub(this.moveTargetPos).mag();
            if (checkDist <= 10) {
                //  this.moveScript.moveDir = null;
                this.isCanMove = true;
            } else if (checkDist >= 200 && this.pathPosArray.length > 0) {
                //出问题了
                console.log("偏离目标点,重新绘制路线")
                let targetPos = this.pathPosArray[this.pathPosArray.length - 1];
                this.setMoveLine(this.node.position, targetPos)

            }
        }
    },

    drawMoveLine(dt) {
        if (this.pathPosArray && this.pathPosArray.length > 0 && this.isCanMove) {
            // if (!GlobalMng.isDaBao) {
            //     this.drawPathPoint(this.pathPosArray);
            // }
            this.drawPathPoint(this.pathPosArray);
            this.moveTargetPos = this.pathPosArray[0];
            let moveDirection = this.moveTargetPos.sub(this.node.position).normalize();
            this.moveScript.moveDir = moveDirection;  // 更新移动方向向
            this.pathPosArray.shift();
            this.isCanMove = false;
        }
        this.checkLine(dt)
    },


    resPath() {
        this.isCanMove = true;  //是否开始允许AI走A*路线
        this.pathPosArray = null;
        this.graphics.clear();
        this.moveScript.forceStop();
    },
    setMoveLine(startPos, endPos) {
        this.resPath();
        this.pathPosArray = this.astarMap.getPathByPos(startPos, endPos);

        //距离太短 直接走过去
        if (this.pathPosArray.length >= 3) {
            this.pathPosArray.shift();
        }
    },

    update(dt) {
        if (Game.instance.gameState != Types.GameState.GameRuning) return
        if (!this.alive) return


        this.updateHumanSpine(dt);
        this.updateActor(dt);

        //AI A*路线
        if (this.ctlType == 0) {
            this.checkLine(dt);
            this.drawMoveLine(dt);
        }
    },

});
