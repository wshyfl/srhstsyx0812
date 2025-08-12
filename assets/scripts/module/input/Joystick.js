// Joystick.js - 虚拟摇杆控制组件
var JoystickEnum = cc.Enum({
    Fixed: 0,        // 固定
    FollowTouch: 1   // 跟随
});

cc.Class({
    extends: cc.Component,

    properties: {
        // 摇杆背景
        joystickBG: {
            default: null,
            type: cc.Node,
            tooltip: "摇杆背景节点"
        },

        // 摇杆控制点
        joystickStick: {
            default: null,
            type: cc.Node,
            tooltip: "摇杆控制点节点"
        },

        // 摇杆最大移动半径
        maxRadius: {
            default: 50,
            tooltip: "摇杆最大移动半径"
        },

        // 摇杆移动模式
        joystickType: {
            default: JoystickEnum.Fixed,
            type: JoystickEnum,
            tooltip: "摇杆移动模式：Fixed-固定位置, FollowTouch-跟随触摸点"
        },

        // 是否是动态摇杆(初始隐藏，点击时显示)
        isDynamicJoystick: {
            default: false,
            tooltip: "是否是动态摇杆"
        },

        // 是否启用摇杆
        isEnabled: {
            default: true,
            tooltip: "是否启用摇杆"
        }
    },

    onLoad() {

        this.joyArea = this.node.getChildByName("area");
        // 初始化摇杆状态
        this.isMoving = false;
        this.direction = cc.v2(0, 0);
        this.touchID = null;

        // 如果是动态摇杆，初始隐藏
        if (this.isDynamicJoystick) {
            this.joyArea.opacity = 0;
        }

        // 初始位置（仅用于固定模式参考）
        this.originPos = this.joystickBG.position;

        // 确保摇杆控制点是背景的子节点，并初始化位置为中心
        if (this.joystickStick.parent !== this.joystickBG) {
            this.joystickStick.parent = this.joystickBG;
        }
        this.joystickStick.position = cc.v2(0, 0); // 强制初始位置为中心


        // 注册触摸事件
        this.registerTouchEvents();
    },

    registerTouchEvents() {
        this.joyArea.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.joyArea.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.joyArea.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.joyArea.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    },

    onTouchStart(event) {
        if (!this.isEnabled) return;

        const touchPos = event.getLocation();
        const nodePos = this.node.convertToNodeSpaceAR(touchPos);

        // 如果是跟随触摸点模式或动态摇杆，设置背景位置
        if (this.joystickType === JoystickEnum.FollowTouch || this.isDynamicJoystick) {
            this.joystickBG.setPosition(nodePos); // 使用 setPosition 确保位置更新
            if (this.isDynamicJoystick) {
                this.joyArea.opacity = 255;
            }
        }

        // 设置摇杆状态
        this.isMoving = true;
        this.touchID = event.getID();

        // 重置控制点位置（相对于背景）
        this.joystickStick.setPosition(cc.v2(0, 0)); // 确保触摸开始时控制点在中心

        // 计算摇杆位置
        this.onTouchMove(event);
    },

    onTouchMove(event) {
        if (!this.isEnabled || !this.isMoving || this.touchID !== event.getID()) return;
        const touchPos = event.getLocation();
        const bgWorldPos = this.joystickBG.convertToWorldSpaceAR(cc.v2(0, 0));
        const stickPos = touchPos.sub(bgWorldPos);
        // 计算距离
        const distance = stickPos.mag();
        // 限制控制点在最大半径内
        if (distance > this.maxRadius) {
            stickPos.mulSelf(this.maxRadius / distance);
        }
        this.joystickStick.setPosition(stickPos);
        this.direction = stickPos.normalize();

        if (this.onJoystickMove) {
            this.onJoystickMove(this.direction);
        }
    },

    onTouchEnd(event) {
        if (!this.isEnabled || this.touchID !== event.getID()) return;

        // 重置摇杆状态
        this.isMoving = false;
        this.touchID = null;
        this.direction = cc.v2(0, 0);

        // 重置控制点位置（相对于背景）
        this.joystickStick.setPosition(cc.v2(0, 0));

        // 如果是动态摇杆，隐藏
        if (this.isDynamicJoystick) {
            this.joyArea.opacity = 0;
        }

        // 调用结束回调
        if (this.onJoystickEnd) {
            this.onJoystickEnd();
        }
    },

    // 获取摇杆方向
    getDirection() {
        return this.direction;
    },

    // 获取摇杆强度(0-1)
    getStrength() {
        let force = this.joystickStick.position.mag() / this.maxRadius;
        if (force <= 0.5) {
            force = 0.5;
        } else {
            force = 1;
        }
        return force;
    },

    // 启用/禁用摇杆
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.isMoving = false;
            this.touchID = null;
            this.direction = cc.v2(0, 0);
            this.joystickStick.setPosition(cc.v2(0, 0));
            if (this.isDynamicJoystick) {
                this.joyArea.opacity = 0;
            }
        }
    }
});