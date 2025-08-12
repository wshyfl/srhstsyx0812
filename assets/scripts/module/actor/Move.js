// MoveController.js
const Types = require('../../module/data/Types');
const MoveState = Types.MoveState;

cc.Class({
    extends: cc.Component,

    properties: {
        moveSpeed: {
            default: 100,
            tooltip: "移动速度"
        },
        baseSpeed: {
            default: 100,
            tooltip: "初始速度"
        },
        constantSpeed: {
            default: 100,
            visible: false
        },
        maxSpeed: {
            default: 500,
            tooltip: "最大速度"
        }
    },


    // 初始化移动相关参数
    initMove(speed, mirrorImage) {
        this.freeze = false;
        this.moveDir = null; // 移动方向
        this.moveState = MoveState.None; // 移动状态
        this.speedEffects = []; // 速度效果队列
        this.speedFast = 1; // 速度倍率

        if (speed && _.isNumber(speed) && speed > 0) {
            this.moveSpeed = speed; // 使用角色速度或默认值
            this.baseSpeed = this.moveSpeed; // 初始速度
            this.constantSpeed = this.moveSpeed; // 初始恒定速度
        }
        this.mirrorImage = mirrorImage || null;
    },

    //移动宿主
    setCharacter(owner) {
        this.owner = owner || null;
    },

    //设置移动方向
    setMoveDir(dir) {
        this.moveDir = dir;
    },

    //设置是否移动
    setFreeze(freeze) {
        this.freeze = freeze;
        if (freeze) {
            this.forceStop();
        }
    },


    // 强制停止移动
    forceStop() {
        this.moveState = MoveState.None;
        this.moveDir = null;
    },

    // 停止移动
    stop() {
        this.moveState = MoveState.None;
        this.moveDir = null;
    },

    // 上移
    moveUp() {
        if (this.moveState !== MoveState.Up) {
            this.moveState = MoveState.Up;
        }
    },

    // 下移
    moveDown() {
        if (this.moveState !== MoveState.Down) {
            this.moveState = MoveState.Down;
        }
    },

    // 右移并翻转
    moveRight() {
        if (this.moveState !== MoveState.Right) {
            this.moveState = MoveState.Right;
        }
        if (this.mirrorImage) {
            this.mirrorImage.scaleX = Math.abs(this.mirrorImage.scaleX); // 右移时翻转
        }
    },

    // 左移并翻转
    moveLeft() {
        if (this.moveState !== MoveState.Left) {
            this.moveState = MoveState.Left;
        }
        if (this.mirrorImage) {
            this.mirrorImage.scaleX = -Math.abs(this.mirrorImage.scaleX); // 左移时恢复
        }
    },

    //是否停止移动
    getIsStopState() {
        return this.moveState == MoveState.None
    },

    //AI移动镜像 需要更平滑
    smoothAIMirror() {
        let deg = cc.misc.radiansToDegrees(Math.atan2(this.moveDir.y, this.moveDir.x));
        if (deg >= 45 && deg < 135) {
            this.moveUp();
        } else if (deg >= 135 || deg < -135) {
            this.moveLeft();
        } else if (deg >= -45 && deg < 45) {
            this.moveRight();
        } else {
            this.moveDown();
        }
    },
    //玩家镜像需要更灵敏
    playerMirror() {
        // 方向判断
        let deg = cc.misc.radiansToDegrees(Math.atan2(this.moveDir.y, this.moveDir.x));
        if (deg >= 45 && deg < 135) {
            this.moveUp();
        } else if (deg >= 135 || deg < -135) {
            //   this.moveLeft();
        } else if (deg >= -45 && deg < 45) {
            //this.moveRight();
        } else {
            this.moveDown();
        }

        if (this.moveDir.x >= 0.1) {
            this.moveRight();
        } else {
            this.moveLeft();
        }
    },

    // 通用的移动逻辑
    commonPlayerMove(dt) {
        if (this.freeze) return; // 如果冻结则不移动

        if (this.moveDir && this.moveDir.mag() > 0) {
            if (this.moveSpeed < 0) {
                this.moveSpeed = 0;
            } else if (this.moveSpeed > this.maxSpeed) {
                this.moveSpeed = this.maxSpeed;
            }
            // 计算新位置
            let newX = this.node.x + this.moveSpeed * this.moveDir.x * this.speedFast * dt;
            let newY = this.node.y + this.moveSpeed * this.moveDir.y * this.speedFast * dt;
            this.node.setPosition(newX, newY);
            if (this.owner) {
                if (this.owner.isAI()) {
                    this.smoothAIMirror();
                } else {
                    this.playerMirror();
                }
            } else {
                this.smoothAIMirror();
            }
        } else {
            this.stop();
        }
    },

    // 添加临时速度效果
    addSpeedEffect(percentage, duration) {
        const effect = {
            percentage: percentage, // 速度变化百分比（正为加速，负为减速）
            duration: duration, // 总持续时间（秒）
            remainingTime: duration // 剩余时间（秒）
        };
        this.speedEffects.push(effect);
        this.updateSpeed(); // 立即更新速度
    },

    // 加速（便捷方法）
    speedUp(percentage, duration = 0) {
        if (duration > 0) {
            this.addSpeedEffect(percentage, duration); // 临时效果
        } else {
            this.addSpeedEffect(percentage, Infinity); // 永久效果
        }
    },

    // 减速（便捷方法）
    slowDown(percentage, duration = 0) {
        if (duration > 0) {
            this.addSpeedEffect(-percentage, duration); // 临时效果
        } else {
            this.addSpeedEffect(-percentage, Infinity); // 永久效果
        }
    },

    // 恢复初始速度
    restoreSpeed() {
        this.speedEffects = []; // 清空效果队列
        this.moveSpeed = this.baseSpeed;
        this.speedFast = 1; // 重置倍率
    },

    //恢复所有移速
    restoreAllSpeed() {
        this.baseSpeed = this.constantSpeed;
        this.restoreSpeed();
        this.updateSpeed();
    },

    // 设置速度倍率 一般用于遥感力度
    setSpeedFast(speed) {
        this.speedFast = speed;
    },
    //得到当前移速
    getCurSpeed() {
        this.updateSpeed();
        return this.moveSpeed * this.speedFast;
    },

    // 更新当前速度（根据所有活跃效果计算）
    updateSpeed() {
        let totalPercentage = this.speedEffects.reduce((sum, effect) => sum + effect.percentage, 0);
        this.moveSpeed = this.baseSpeed * (1 + totalPercentage / 100);
    },

    //改变基础移速百分比
    changeBaseSpeed(percentage) {
        this.baseSpeed = this.baseSpeed * (1 + percentage / 100);
        if (this.baseSpeed < 0) this.baseSpeed = 0;
        if (this.baseSpeed > this.maxSpeed) this.baseSpeed = this.maxSpeed;
        this.updateSpeed();
    },

    //改变基础移速数值
    changeBaseSpeedByNum(speed) {
        this.baseSpeed += speed;
        this.updateSpeed();
    },


    updateMove(dt) {
        // 更新速度效果
        if (this.speedEffects.length > 0) {
            for (let i = this.speedEffects.length - 1; i >= 0; i--) {
                const effect = this.speedEffects[i];
                effect.remainingTime -= dt;
                if (effect.remainingTime <= 0) {
                    this.speedEffects.splice(i, 1); // 移除过期效果
                }
            }
            this.updateSpeed(); // 重新计算速度
        }

        this.commonPlayerMove(dt);

        if (this.owner) {
            this.owner.updateAction();
        }
    }
});