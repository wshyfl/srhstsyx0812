/**
 * k-cocos 扩展库
 * 作者： kuokuo
 * 地址： https://github.com/KuoKuo666/k-cocos
 * QQ讨论群： 1085201157
 */
 (function(global) {
    'use strict';

    var cc = global.cc;
    cc.log('k-cocos v0.1');

    // 游戏速率
    cc.director._kSpeed = 1;
    cc.director._isPaused = false; // 新增暂停状态标志
    cc.director._rawDeltaTime = 0; // 存储未经缩放的 deltaTime
    var _originCalculateDeltaTime = cc.Director.prototype.calculateDeltaTime;
    cc.director.calculateDeltaTime = function(now) {
        _originCalculateDeltaTime.call(this, now);
        this._rawDeltaTime = this._deltaTime; // 保存原始 deltaTime
        if (!this._isPaused) {
            this._deltaTime *= this._kSpeed; // 仅在非暂停时应用速率
        } else {
            this._deltaTime = 0; // 暂停时游戏逻辑停止
        }
    }

    cc.kSpeed = function(speed) {
        if (speed < 0) {
            cc.warn("Speed must be non-negative!");
            return;
        }
        cc.director._kSpeed = speed;
        cc.director._isPaused = (speed === 0); // speed 为 0 时标记暂停
    }

    cc.kGetSpeed = function() {
        return cc.director._kSpeed;
    }

    // 获取原始 deltaTime（用于 UI 动画）
    cc.kGetRawDeltaTime = function() {
        return cc.director._rawDeltaTime;
    }

    
    // 触点数量控制
    cc.kMultTouch = function(count) {
        if (cc.internal && cc.internal.inputManager) {
            cc.internal.inputManager._maxTouches = count;
            return;
        }
        if (_cc && _cc.inputManager) {
            _cc.inputManager._maxTouches = count;
        }
        if (CC_QQPLAY && BK && BK.inputManager) {
            BK.inputManager._maxTouches = count;
        }
    }

    // 扩展移动方式脚本
    cc.kSimpleMove = cc.Class({
        name: 'cc_kSimpleMove',
        extends: cc.Component,
        properties: {
            speed_x: 0,
            speed_y: 0,
            accelerate_x: 0,
            accelerate_y: 0,
            hasAim: false,
            aimPos_x: 0,
            aimPos_y: 0
        },
        editor: {
            executionOrder: 9999
        },
        getMoveSpeed: function() {
            return new cc.Vec2(this.speed_x, this.speed_y);
        },
        setMoveSpeed: function(x, y) {
            if (x && typeof x === 'object') {
                this.speed_x = x.x || 0;
                this.speed_y = x.y || 0;
            } else {
                this.speed_x = x || 0;
                this.speed_y = y || 0;
            }
        },
        getAccelerate: function() {
            return new cc.Vec2(this.accelerate_x, this.accelerate_y);
        },
        setAccelerate: function(x, y) {
            if (x && typeof x === 'object') {
                this.accelerate_x = x.x || 0;
                this.accelerate_y = x.y || 0;
            } else {
                this.accelerate_x = x || 0;
                this.accelerate_y = y || 0;
            }
        },
        setDestination: function(aim, speed, accelerate) {
            this.aimPos_x = aim.x || 0;
            this.aimPos_y = aim.y || 0;
            speed = speed || 0;
            accelerate = accelerate || 0;
            var dx = this.aimPos_x - this.node.x;
            var dy = this.aimPos_y - this.node.y;
            var len = Math.sqrt(dx * dx + dy * dy);
            if (len < 0.001) {
                this.hasAim = false;
                this.setMoveSpeed(0, 0);
                this.setAccelerate(0, 0);
                return;
            }
            var r_x = dx / len;
            var r_y = dy / len;
            this.setMoveSpeed(speed * r_x, speed * r_y);
            this.setAccelerate(accelerate * r_x, accelerate * r_y);
            this.hasAim = true;
        },
        update: function(dt) {
            if (cc.director._isPaused) return; // 暂停时停止移动
            this.speed_x += this.accelerate_x;
            this.speed_y += this.accelerate_y;
            if (this.hasAim) {
                var dir_x1 = this.aimPos_x > this.node.x ? 1 : -1;
                var dir_y1 = this.aimPos_y > this.node.y ? 1 : -1;
                this.node.x += this.speed_x * dt;
                this.node.y += this.speed_y * dt;
                var dir_x2 = this.aimPos_x > this.node.x ? 1 : -1;
                var dir_y2 = this.aimPos_y > this.node.y ? 1 : -1;
                if (((dir_x1 * dir_x2) < 0) || ((dir_y1 * dir_y2) < 0)) {
                    this.hasAim = false;
                    this.node.x = this.aimPos_x;
                    this.node.y = this.aimPos_y;
                    this.setAccelerate(0, 0);
                    this.setMoveSpeed(0, 0);
                }
            } else {
                this.node.x += this.speed_x * dt;
                this.node.y += this.speed_y * dt;
            }
        }
    });

    // 强化节点
    cc.kNode = function(node) {
        node.kTag = 0;
        node.kInfo = 'init';
        node._kState = 'init';
        node.kStateCb = null;
        Object.defineProperties(node, {
            kState: {
                get() {
                    return this._kState;
                },
                set(val) {
                    var old = this._kState;
                    this._kState = val;
                    this.kStateCb && this.kStateCb(val, old);
                }
            },
            kComponents: {
                get() {
                    return this._components;
                },
                set(val) {
                    cc.error(`can not set kComponents, please use addComponent()`);
                }
            },
            kFirstChild: {
                get() {
                    return this.children[0];
                },
                set(val) {
                    cc.error(`can not set kFirstChild, please use addChild()`);
                }
            },
            kSecondChild: {
                get() {
                    return this.children[1];
                },
                set(val) {
                    cc.error(`can not set kSecondChild, please use addChild()`);
                }
            },
            kThirdChild: {
                get() {
                    return this.children[2];
                },
                set(val) {
                    cc.error(`can not set kThirdChild, please use addChild()`);
                }
            },
            kLastChild: {
                get() {
                    return this.children[this.childrenCount - 1];
                },
                set(val) {
                    cc.error(`can not set kLastChild, please use addChild()`);
                }
            }
        });

        node.kHitTest = function(cb) {
            this._hitTest = cb;
        }

        return node;
    }

})(window)