const Types = require('../../module/data/Types');
//玩家角色类
cc.Class({
    extends: require("Character"),

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
        skillType: {
            default: Types.ActorSkillType.FeiMaoTui,
            type: Types.ActorSkillType,
            tooltip: "角色技能"
        },

    },

    // LIFE-CYCLE CALLBACKS:

    // 初始化玩家
    init(game, data = {}) {
        this._super(game, data); // 调用父类的 init
        this.initCompleted = true;
        this.frameTime = 0;
        this.lastDir = cc.v2(0, 0);
        this.checkFaceTime = 0;
        //玩家摄像机
        this.cameraNode = cc.find(`Canvas/playerCamera${this.ctlType}`);
        this.cameraScript = this.cameraNode.getComponent("CameraController");
        this.cameraScript.initCamera(this.node, this.game.curMapScript.mapTotalWidth, this.game.curMapScript.mapTotalHeight, GlobalMng.isDouble());
        //初始化玩家信息
        this.initPlayerInfo();
        //初始化技能相关
        this.initPlayerSkill();
        //初始化节点相关
        this.initPlayerNode();
        this.setSportState();
        this.closeAllCollider();

        this.repairItem = [];
    },


    //吐出动画
    flyOut() {
        this.node.scale = 0;
        this.cameraScript.setFloow(false);
        this.spineCtrl.playIdle();
        let skeSelectPos = GlobalMng.getPlayerCenterById(this.ctlType);
        GlobalMng.uiMng.createSkeBoomEffect('levels/mapOffice/选人', this.game.playerRoot, skeSelectPos, () => {
            let upy = this.node.y + 360;
            let ysy = this.node.y;
            this.otherAction("选人2");
            cc.tween(this.node)
                .set({ scale: 0, y: upy })
                .to(1, { scale: 1, y: ysy })
                .call(() => {
                    this.sportAction();
                    this.openAllCollider();
                    this.cameraScript.setFloow(true);
                    if (this.ctlType == 1) {
                        this.game.timeStart();
                    }
                })
                .start()
        }, null, "吐");

        GlobalMng.uiMng.createGamePublic(`effects/checkGoldTips`, this.game.tipUIRoot, cc.v2(0, 0), (effNode) => {
            this.goodNode = effNode;
            this.goodNode.active = false;
        })
    },



    initPlayerInfo() {
        let bornPos = cc.v2(-150, 550);
        switch (GlobalMng.gameMap) {
            case Types.MapName.HouShi:
                bornPos = cc.v2(-320, -880);
                break;

        }


        //设置初始位置
        if (GlobalMng.isSingle()) {
            this.node.setPosition(bornPos);
        } else {
            let xPos = this.ctlType == 1 ? bornPos.x : -bornPos.x;
            this.node.setPosition(xPos, bornPos.y);
        }
        this.setupInputEvents();
        this.isPlayWalkSond = false;
        this.isOpenMagnet = false; //是否开启磁铁
        this.isFeiMaoTuiIng = false; //是否开启飞毛腿
        this.isHiding = false;      //是否隐形
        this.forceCharge = false; //强制冲刺
        this.isCharge = false;  // 是否在冲刺
        this.escape = false; //是否成功逃脱
    },
    initPlayerSkill() {
        this.skillNode = this.game.InputManager.getButtonNode(this.ctlType, "skill");
        this.skill = this.skillNode.addComponent("Skill");
        this.skill.initSkill(this.skillType);
        this.skill.setOwner(this);
    },
    initPlayerNode() {
        this.realAreaNode.getComponent("PlayerCollArea").setCharacterTarget(this);
        this.soleAreaNode.getComponent("PlayerSoleArea").setCharacterTarget(this);
        this.smoke = this.node.getChildByName("角色烟雾");
        this.skeletonData = this.spineCtrl.ske.skeletonData;
    },

    // 设置输入事件
    setupInputEvents() {
        this.game.InputManager.on('buttonDown', (buttonName, buttonNode) => {
            if (buttonName == "skill1") {
                this.useSkill();
            }
        }, this.ctlType);
    },

    //开启磁铁
    openMagnet() {
        this.isOpenMagnet = true;
        this.setRealAreaSize(650, 650)
    },

    //关闭磁铁
    closeMagnet() {
        this.isOpenMagnet = false;
        this.restoreRealAreaSize();
    },

    //开启飞毛腿
    openFeiMaoTui() {
        this.isFeiMaoTuiIng = true;
    },
    //关闭飞毛腿
    closeFeiMaoTui() {
        this.isFeiMaoTuiIng = false;
    },

    //强制开启冲刺 摇杆为0的情况
    openForceCharge() {
        this.forceCharge = true;
    },
    //强制关闭冲刺
    closeForceCharge() {
        this.forceCharge = false;
    },
    //隐藏自己 躲避怪物追击
    hideSelef() {
        this.isHiding = true;
        //this.blurring();
    },
    //现身
    appearSelf() {
        this.isHiding = false;
        //this.restoreBlurring();
    },
    getHideState() {
        return this.isHiding;
    },

    //正在冲刺
    openCharge() {
        this.isCharge = true;
    },
    //关闭冲刺
    closeChare() {
        this.isCharge = false;
    },


    //当前玩家是否能被发现
    isFindPlayer() {
        if (this.isInvalid || this.isHiding || !this.isAlive) {
            return false
        } else {
            return true
        }
    },

    //是否有效单位
    isValidPlayer() {
        if (this.isInvalid || this.isHiding || this.isTimeTravel || this.isCharge || !this.isAlive) {
            return false
        } else {
            return true
        }
    },

    //陷阱放置位置
    getTrapPos() {
        return cc.v2(this.node.x, this.node.y + 30)
    },
    //当前玩家方向
    getCurPayerDir() {
        let dir = this.game.InputManager.getDirection(this.ctlType);
        return dir
    },

    //当前正面朝向
    getMoveScaleX() {
        if (this.moveScript.mirrorImage.scaleX >= 0) {
            return 1
        } else {
            return -1
        }
    },
    //point是否在摄像机视野内
    isPointInCameraView(point) {
        return this.cameraScript.isPointInCameraView(point)
    },


    //磁铁侠活动磁铁手的位置
    getMagnetHandPos() {
        let x = this.node.x + 53;
        let y = this.node.y + 84;
        if (this.moveScript.mirrorImage.scaleX < 0) {
            x = this.node.x - 53;
        }
        return cc.v2(x, y)
    },

    onDeath() {
        this.setFreezeState();
        this.spineCtrl.resetAnimationState();
        this.spineCtrl.playAnimationByName("死", false, () => {
            if (this.game.playerIsAllDie()) {
                this.game.desperPopNodeByName('ReviveOne');
                GlobalMng.uiMng.showSharedDialog('ui/panel/RevivePanel', this.game.popUIRoot)
            } else {
                GlobalMng.uiMng.showOnceDialogSplite(`ui/panel/ReviveOne`, this.game.popUIRoot, this.ctlType, (node) => {
                    node.getComponent("ReviveOne").setPlayer(this);
                }, 0)
            }
        });



    },

    onRevive() {
        GlobalMng.uiMng.createSkeBoomEffect('levels/mapOffice/复活', this.game.playerRoot, this.node.position, (selectNode) => {
            this.setSportState();
            this.spineCtrl.playIdle();
            this.skill.reset();
            this.skill.resetSkillState();
            this.game.useOrCloseItemMonster(false);
            this.game.playerIsOpenMove = false;
            this.restoreAllSpeed();
        }, null, "吐");

    },
    useSkill(buttonNode) {
        if (!this.isAlive) return
        if (this.getInvalid()) return
        if (this.game.isRepaiModel && this.skillType == Types.ActorSkillType.WeiLaiZhanShi && this.game.gateIsOpen == false) {
            GlobalMng.uiMng.showTip('大门需开启后才可使用传送技能', 3)
            return
        }
        this.skill.cast();
    },

    otherAction(animationName, loop = false, callBack) {
        if (!this.isAlive) return
        this.setOtherState();
        this.spineCtrl.playAnimationByName(animationName, loop, callBack);
    },
    //技能动作    
    skillAction(actionLoop) {
        if (!this.isAlive) return
        if (this.isTimeTravel) return
        this.setSkillState();
        this.spineCtrl.playAnimationByName("技能", actionLoop);
    },

    //运动动作
    sportAction() {
        if (!this.isAlive) return
        this.setSportState();
    },
    //更新动作
    updateAction() {
        if (!this.isAlive) return
        if (this.getIsSportState()) {
            if (this.moveScript.getIsStopState()) {
                this.spineCtrl.playIdle();
                this.stopMotion();
            } else {
                let runSkeName = this.isFeiMaoTuiIng ? "技能" : "跑";
                this.spineCtrl.playLoop(runSkeName);
                this.motion()
                this.playPlayerWalk();

            }
        }
    },
    //怪物脚步声
    playPlayerWalk() {
        if (!this.isPlayWalkSond) {
            this.isPlayWalkSond = true;
            GlobalMng.audioMng.playEffectWithCallback(`跑步声_0${_.random(1, 4)}`, () => {
                this.isPlayWalkSond = false;
            });
        }
    },

    //跑步烟雾
    stopMotion() {
        if (this.smoke.active) {
            this.smoke.active = false;
        }
    },
    //跑步烟雾
    motion() {
        if (!this.smoke.active) {
            this.smoke.active = true;
        }
    },


    closeAllCollider() {
        this.realAreaNode.active = false;
        this.soleAreaNode.active = false;
        this.node.getComponent(cc.PhysicsCircleCollider).sensor = true;
        this.node.getComponent(cc.PhysicsCircleCollider).apply();
    },
    openAllCollider() {
        this.realAreaNode.active = true;
        this.soleAreaNode.active = true;
        this.node.getComponent(cc.PhysicsCircleCollider).sensor = false;
        this.node.getComponent(cc.PhysicsCircleCollider).apply();
    },


    changeFace(flag) {
        if (flag) {
            this.spineCtrl.ske.setAnimation(2, "表情害怕", false);
        } else {
            this.spineCtrl.ske.clearTrack(2);
            this.spineCtrl.ske.setAnimation(2, "表情正常", false);
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

    //逃离
    run(exitNode) {
        this.escape = true;
        cc.tween(this.node)
            .to(0.3, { position: exitNode.getPosition(), scale: 0 })
            .delay(0.5)
            .call(() => {
                if (GlobalMng.isSingle()) {
                    this.game.gameWin();
                } else {
                    this.game.addEscapePlayer(this.ctlType);
                }
            })
            .start()
    },


    //拾取修复道具 最多有两个
    addRepairItem(itemNode) {
        // if (this.repairItem.length >= 2) return
        itemNode.removeComponent(cc.BoxCollider);
        this.repairItem.push(itemNode);
        itemNode.parent = this.node.getChildByName("itemLayout");
        itemNode.setPosition(0, 0)
        GlobalMng.uiMng.createGamePublic('effects/tip', this.game.popUIRoot, cc.v2(0, 0), (tipNode) => {
            tipNode.getChildByName(`找到-${itemNode.name}`).active = true;
        })
    },

    //修复
    removeRepairItem(bedItem) {
        let itemNode = this.repairItem.filter(item => item.name === bedItem.name)[0];
        if (itemNode) {
            let str = itemNode.name;
            _.removeItem(this.repairItem, itemNode)
            let localPos = GlobalMng.ccTools.transformToNode1Local(this.game.curMapScript.mechanRootNode, itemNode);
            itemNode.parent = this.game.curMapScript.mechanRootNode;
            itemNode.setPosition(localPos);
            cc.tween(itemNode)
                .to(0.5, { position: bedItem.getPosition() }, { easing: 'smooth' })
                .call(() => {
                    GlobalMng.audioMng.playEffect(`修理成功`);
                    bedItem.getChildByName("好").active = true;
                    bedItem.getChildByName("坏").active = false;
                    this.game.repairOne(bedItem.name);
                    GlobalMng.uiMng.createGamePublic('effects/tip', this.game.popUIRoot, cc.v2(0, 0), (tipNode) => {
                        tipNode.getChildByName(`修复-${str}`).active = true;
                    })
                    itemNode.getChildByName("道具").getComponent(sp.Skeleton).setAnimation(0, '消失', 1)
                    itemNode.getChildByName("道具").getComponent(sp.Skeleton).setCompleteListener((trackEntry, loopCount) => {
                        if (trackEntry.animation.name === '消失') {
                            itemNode.destroy();
                        }
                    });

                })
                .start()
        }


    },
    updatePlayer(dt) {
        if (!this.initCompleted) return;
        // 获取遥感方向
        let dir = this.game.InputManager.getDirection(this.ctlType);
        // let force = this.game.InputManager.getStrength(this.ctlType);
        // 强制冲刺
        if (this.forceCharge) {
            this.moveScript.setMoveDir(cc.v2(this.getMoveScaleX(), 0));
        } else {
            this.moveScript.setMoveDir(dir);
        }
        //this.moveScript.setSpeedFast(force)
        this.moveScript.updateMove(dt);
        // 更新摄像机
        this.cameraScript.updateCamera(dt);
        //更新小地图
        this.game.curMapScript.updatePlayerMiniMap(this.ctlType, this.getCenterPos())


        //找到距离自己最近的怪物
        const result = GlobalMng.ccTools.findClosestNode(this.node, this.game.monsterArray);
        if (result) {
            this.nearestTarget = result[0];
            this.nearestDist = result[1];
            if (this.nearestTarget) {
                this.nearestDist = result[1];
            }
        }



    },

    update(dt) {
        this._super(dt); // 调用父类的 update
        if (!this.isAlive) return
        this.updatePlayer(dt);
        this.checkFace(dt);

        if (this.game.isLoadQuadCom) {
            this.frameTime++; //3帧更新一次
            if (this.frameTime >= 3) {
                this.frameTime = 0;
                let rw = this.realAreaNode.width;
                let rh = this.realAreaNode.height;
                let rx = this.node.x + this.realAreaNode.x - rw / 2;
                let ry = this.node.y + this.realAreaNode.y - rh / 2; //人物锚点在底部
                let rect = { x: rx, y: ry, width: rw, height: rh };
                let areaColloision = this.game.quadtree.retrieve(rect);
                for (let i = 0; i < areaColloision.length; i++) {
                    const obj = areaColloision[i];
                    if (this.isRectCollision(rect, obj)) {
                        if (!this.isOpenMagnet) {
                            this.game.takeKey(obj.fNode)
                        } else {
                            this.game.takeKey(obj.fNode, this.isOpenMagnet, this)
                        }

                    }
                }

            }

            if (this.game.isShowComplete) {
                GlobalMng.ccTools.checkGoldTips(this.game.curMapScript.mapExit, this.node, this.goodNode, this.ctlType)
            }

        }
    },
});
