const Types = require('../../module/data/Types');
//角色基类
cc.Class({
    extends: cc.Component,

    properties: {
        maxHealth: {
            default: 100,
            tooltip: "最大生命值"
        },
        speed: {
            default: 200,
            tooltip: "移动速度"
        },
        team: {
            default: Types.ActorTeam.None,
            type: Types.ActorTeam,
            tooltip: "所属队伍"
        },
        ctlType: {
            default: Types.ActorControl.Player1,
            type: Types.ActorControl,
            tooltip: "控制类型"
        },
    },



    /**
     * 初始化角色
     * {health, team,ctlType,speed,mirrorNode}
     */
    init(game, data = {}) {
        this.game = game;
        this.moveScript = this.node.getComponent("Move");
        if (!this.moveScript) {
            this.moveScript = this.node.addComponent("Move");
        }
        this.isAlive = true;
        this.isInvalid = false;
        this.health = data.health || this.maxHealth;
        this.team = data.team || this.team;
        this.ctlType = data.ctlType || this.ctlType;
        let speed = data.speed || this.speed;
        let mirrorNode = data.mirrorNode || this.node.getChildByName("ske")
        this.moveScript.initMove(speed, mirrorNode);
        this.moveScript.setCharacter(this);
        this.spineCtrl = this.node.getComponent("SpineCtrl");
        this.spineCtrl.init("待机");
        this.actionState = Types.ActorActionState.Sport;
        this.isUpdateZindex = true;
        this.updateZTime = 0;
        this.bufferData = [];
        this.isTimeTravel = false; //是否正在传送中




        this.realAreaNode = this.node.getChildByName("realArea");
        this.soleAreaNode = this.node.getChildByName("soleArea");
        this.ysAreaSzie = this.realAreaNode.getContentSize();
        this.node.getChildByName("realArea").getComponent(cc.Sprite).enabled = GlobalMng.isTestColl;


    },

    setAttackState() {
        this.actionState = Types.ActorActionState.Attack;
    },
    setSportState() {
        this.actionState = Types.ActorActionState.Sport;
    },
    setSkillState() {
        this.actionState = Types.ActorActionState.Skill;
    },
    setFreezeState() {
        this.actionState = Types.ActorActionState.Freeze;
    },
    setOtherState() {
        this.actionState = Types.ActorActionState.Other;
    },
    getIsAttackState() {
        return this.actionState === Types.ActorActionState.Attack;
    },

    getIsSportState() {
        return this.actionState === Types.ActorActionState.Sport;
    },
    getIsSkillState() {
        return this.actionState === Types.ActorActionState.Skill;
    },
    getIsFreezeState() {
        return this.actionState === Types.ActorActionState.Freeze;
    },

    addBufffer(bufferId) {
        this.bufferData.push(bufferId);
    },
    removeBuffer(bufferId) {
        _.removeItem(this.bufferData, bufferId)
    },

    isHasBufferById(bufferId) {
        return this.bufferData.includes(bufferId);
    },
    //开启传送
    openTimeTravel() {
        this.isTimeTravel = true;
    },
    //关闭时空
    closeTimeTravel() {
        this.isTimeTravel = false;
    },

    //是否为AI
    isAI() {
        if (this.ctlType == 0) {
            return true
        } else {
            return false
        }
    },
    //设置角色真实区域
    setRealAreaSize(w, h) {
        this.realAreaNode.width = w;
        this.realAreaNode.height = h;
    },
    //恢复真实区域
    restoreRealAreaSize() {
        this.realAreaNode.width = this.ysAreaSzie.height;
        this.realAreaNode.height = this.ysAreaSzie.width;
    },

    //得到中心区域
    getCenterPos() {
        let rx = this.node.x + this.realAreaNode.x
        let ry = this.node.y + this.realAreaNode.y
        return cc.v2(rx, ry);
    },

    // 受到伤害
    takeDamage(amount) {
        if (!this.isAlive) return;
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
        this.onHealthChanged();
    },

    // 恢复生命
    heal(amount) {
        if (!this.isAlive) return;
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
        this.onHealthChanged();
    },

    //复活
    revive() {
        this.isAlive = true;
        this.thaw();
        this.onRevive();
    },
    // 死亡
    die() {
        this.isAlive = false;
        this.freeze();
        this.onDeath();
    },

    isDie() {
        return !this.isAlive
    },

    // 设置移动方向
    setMoveDirection(direction) {
        this.moveScript.moveDir = direction;
    },

    // 加速
    speedUp(percentage, duration) {
        this.moveScript.speedUp(percentage, duration);
    },

    // 减速
    slowDown(percentage, duration) {
        this.moveScript.slowDown(percentage, duration);
    },

    // 恢复速度
    restoreSpeed() {
        this.moveScript.restoreSpeed();
    },
    //恢复所有移速 包括基础移速
    restoreAllSpeed() {
        this.moveScript.restoreAllSpeed();
    },

    //改变基础移速
    changeBaseSpeed(percentage) {
        this.moveScript.changeBaseSpeed(percentage)
    },



    //禁止移动
    freeze() {
        this.moveScript.setFreeze(true);
    },

    //设置当前角色是否已经无效 
    setInvalidFlg(isInvalid) {
        this.isInvalid = isInvalid;
    },

    //是否已经无效
    getInvalid() {
        return this.isInvalid;
    },

    //解除限制移动
    thaw() {
        if (!this.isAlive) return;
        if (this.isInvalid) return

        this.moveScript.setFreeze(false);
    },

    //人物虚化
    blurring(opacity = 125, node) {
        let tNode = node ? node : this.node;
        tNode.opacity = opacity;
    },

    //回复虚化
    restoreBlurring(opacity = 255, node) {
        let tNode = node ? node : this.node;
        tNode.opacity = opacity;
    },

    //是否可以减速  子类可重写 
    onIsCanSlown() {
        return true
    },
    //是否可以加速  子类可重写 
    onIsCanUp() {
        return true
    },
    //子类可重写
    onIsChangeSpeed() {
        return true
    },

    // 虚拟方法：生命值变化回调
    onHealthChanged() {
        // 子类可重写，例如更新 UI
        console.log(`${this.node.name} 生命值: ${this.health}/${this.maxHealth}`);
    },

    // 虚拟方法：死亡回调
    onDeath() {
        // 子类可重写，例如播放死亡动画
        console.log(`${this.node.name} 已死亡`);
    },
    // 虚拟方法：复活
    onRevive() {

    },

    //设置是否更新zIndex
    setUpdateZindex(flag) {
        this.isUpdateZindex = flag;
    },

    /**
     * 判断两个矩形是否相撞
     * @param {Rect} rect1 第一个矩形 ({ x, y, width, height })
     * @param {Rect} rect2 第二个矩形 ({ x, y, width, height })
     * @returns {boolean} 如果相撞，返回 true；否则返回 false
     */
    isRectCollision(rect1, rect2) {
        // 如果一个矩形的右边界在另一个矩形的左边界的左侧，或下边界在上边界上方，则没有碰撞
        if (rect1.x + rect1.width < rect2.x || rect1.x > rect2.x + rect2.width ||
            rect1.y + rect1.height < rect2.y || rect1.y > rect2.y + rect2.height) {
            return false; // 没有碰撞
        }

        return true; // 相撞
    },
    update(dt) {
        if (this.isUpdateZindex) {
            this.updateZTime += dt;
            if (this.updateZTime >= 0.1) {
                this.updateZTime = 0;
                this.node.zIndex = this.node.y * -1;
            }
        }

    },
});