
const Types = require('../../module/data/Types');
const Game = require("Game");
// 相机控制类
cc.Class({
    extends: cc.Component,

    properties: {
        ctlType: {
            default: 0, // 0: 无控制, 1: 玩家1, 2: 玩家2
            tooltip: "控制类型"
        },
        isUseRenderCamera: false,
        isFloow: true
    },

    // 初始化相机相关参数
    initCamera(followTarget, mapWidth, mapHeight, needSplit = false) {
        this.node.active = true;
        this.followTarget = followTarget; // 默认跟随角色节点
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
        this.camera = this.node.getComponent(cc.Camera);
        // 地图边界和相机中心
        let p1 = cc.v2(-this.mapWidth / 2, - this.mapHeight / 2);
        let p2 = cc.v2(this.mapWidth / 2, this.mapHeight / 2);
        let center = cc.v2(cc.winSize.width / 2, cc.winSize.height / 2);

        if (needSplit) {
            center = cc.v2(cc.winSize.width / 2 - GlobalMng.getDoubleRightCenter().x, cc.winSize.height / 2);
            if (this.isUseRenderCamera) {
                this.cameraRendeTextureSplit();
            } else {
                this.cameraViewPortSplit();
            }
        }


        // 设置相机边界
        this.cameraRangeBox = cc.rect(
            p1.x + center.x,
            p1.y + center.y,
            p2.x - center.x,
            p2.y - center.y
        );

    },


    // 更新相机位置
    // updateCamera(dt) {
    //     if (!this.followTarget) return;
    //     if (!this.isFloow) return;
    //     // 获取目标位置
    //     let newX = this.followTarget.x;
    //     let newY = this.followTarget.y;
    //     // 边界限制
    //     if (newX < this.cameraRangeBox.x) {
    //         newX = this.cameraRangeBox.x;
    //     } else if (newX > this.cameraRangeBox.width) {
    //         newX = this.cameraRangeBox.width;
    //     }
    //     if (newY < this.cameraRangeBox.y) {
    //         newY = this.cameraRangeBox.y;
    //     } else if (newY > this.cameraRangeBox.height) {
    //         newY = this.cameraRangeBox.height;
    //     }
    //     // 抖动过滤
    //     let currentPos = this.node.position;
    //     let targetPos = cc.v2(newX, newY);
    //     let distance = currentPos.sub(targetPos).mag();
    //     if (distance < 3) return; // 变化太小，忽略更新

    //     // 更新相机位置
    //     if (GlobalMng.isSingle()) {
    //         this.node.setPosition(newX, newY);
    //     } else {
    //         let offsetX = this.isUseRenderCamera ? 0 : GlobalMng.getDoubleRightCenter().x;
    //         if (this.ctlType === 1) {
    //             this.node.setPosition(newX - offsetX, newY);
    //         } else if (this.ctlType === 2) {
    //             this.node.setPosition(newX + offsetX, newY);
    //         }
    //     }
    // },
    updateCamera(dt) {
        if (!this.followTarget || !this.isFloow) return;
        // 获取目标位置
        let newX = this.followTarget.x;
        let newY = this.followTarget.y;
        // 边界限制
        newX = Math.max(this.cameraRangeBox.x, Math.min(newX, this.cameraRangeBox.width));
        newY = Math.max(this.cameraRangeBox.y, Math.min(newY, this.cameraRangeBox.height));

        // 更新相机位置
        if (GlobalMng.isSingle()) {
            // 当前相机位置
            let currentPos = this.node.position;
            let targetPos = cc.v2(newX, newY);
            // 计算目标速度（基于上一帧位置）
            if (!this.lastTargetPos) this.lastTargetPos = targetPos.clone();
            let targetVelocity = targetPos.sub(this.lastTargetPos).div(dt);
            this.lastTargetPos = targetPos.clone();

            // 计算目标与相机的距离
            let distance = currentPos.sub(targetPos).mag();

            // 动态调整平滑时间
            const baseSmoothTime = 0.1; // 基础平滑时间
            const maxSmoothTime = 0.3;  // 最大平滑时间
            const minSmoothTime = 0.02; // 最小平滑时间

            // 根据目标速度和距离计算动态平滑时间
            let speedFactor = targetVelocity.mag() / 500; // 500是参考速度，可根据需要调整
            let distanceFactor = distance / 200;          // 200是参考距离，可根据需要调整

            // 综合计算平滑时间（速度和距离因素取较大值）
            let dynamicFactor = Math.max(speedFactor, distanceFactor);
            let smoothTime = Math.max(minSmoothTime,
                Math.min(maxSmoothTime,
                    baseSmoothTime * (1 - dynamicFactor)));

            // 使用平滑阻尼(SmoothDamp)算法
            let velocity = cc.v2(0, 0);
            let smoothX = this.smoothDamp(currentPos.x, targetPos.x, velocity.x, smoothTime, Infinity, dt);
            let smoothY = this.smoothDamp(currentPos.y, targetPos.y, velocity.y, smoothTime, Infinity, dt);

            this.node.setPosition(smoothX, smoothY);
        } else {
            let offsetX = GlobalMng.getDoubleRightCenter().x;
            if (this.ctlType === 1) {
                this.node.setPosition(newX - offsetX, newY);
            } else if (this.ctlType === 2) {
                this.node.setPosition(newX + offsetX, newY);
            }
        }
    },
    smoothDamp(current, target, currentVelocity, smoothTime, maxSpeed, deltaTime) {
        smoothTime = Math.max(0.0001, smoothTime);
        let num = 2 / smoothTime;
        let num2 = num * deltaTime;
        let num3 = 1 / (1 + num2 + 0.48 * num2 * num2 + 0.235 * num2 * num2 * num2);
        let num4 = current - target;
        let num5 = target;
        let num6 = maxSpeed * smoothTime;
        num4 = Math.min(Math.max(num4, -num6), num6);
        target = current - num4;
        let num7 = (currentVelocity + num * num4) * deltaTime;
        currentVelocity = (currentVelocity - num * num7) * num3;
        let num8 = target + (num4 + num7) * num3;
        if (num5 - current > 0 === num8 > num5) {
            num8 = num5;
            currentVelocity = (num8 - num5) / deltaTime;
        }
        return num8;
    },

    //相机视口分屏
    cameraViewPortSplit() {
        if (this.ctlType == 1) {
            this.camera.rect = new cc.Rect(-0.5, 0, 1, 1);  // 左侧摄像机占据屏幕的左半部分
            this.node.setPosition(GlobalMng.getDoubleLeftCenter())
        } else if (this.ctlType == 2) {
            this.camera.rect = new cc.Rect(0.5, 0, 1, 1);  // 右侧摄像机占据屏幕的右半部分
            this.node.setPosition(GlobalMng.getDoubleRightCenter())
        }
    },

    //渲染Texture分屏
    cameraRendeTextureSplit() {
        let windowSize = cc.view.getVisibleSize(); // 视图窗口大小 
        // 设置精灵大小
        this.renderSp.node.width = windowSize.width / 2 - 10;
        this.renderSp.node.height = windowSize.height;
        // 创建RenderTexture并初始化尺寸
        let texture = new cc.RenderTexture();
        texture.initWithSize(this.renderSp.node.width, this.renderSp.node.height);
        // 设置相机的渲染目标
        this.camera.targetTexture = texture;
        // 创建并设置SpriteFrame
        let spriteFrame = new cc.SpriteFrame();
        spriteFrame.setTexture(texture);
        this.renderSp.spriteFrame = spriteFrame;
        // 垂直翻转
        this.renderSp.node.scaleY = -1;
        // 根据ctlType调整精灵位置
        if (this.ctlType == 1) {
            // 左侧玩家，精灵放在左边
            this.renderSp.node.x = -windowSize.width / 4;
            this.camera.clearFlags = cc.Camera.ClearFlags.COLOR | cc.Camera.ClearFlags.DEPTH | cc.Camera.ClearFlags.STENCIL;;
        } else if (this.ctlType == 2) {
            // 右侧玩家，精灵放在右边
            this.renderSp.node.x = windowSize.width / 4;
            this.camera.clearFlags = cc.Camera.ClearFlags.COLOR | cc.Camera.ClearFlags.DEPTH | cc.Camera.ClearFlags.STENCIL;
        }

    },

    /**
   * 判断某个点是否在摄像机视野内（支持双人 Viewport 分屏）
   * @param {cc.Vec2} point - 要检查的点坐标，例如 cc.v2(x, y)
   * @returns {boolean} - 是否在视野内
   */
    isPointInCameraView(point) {
        if (!this.camera || !this.node.active || !point) {
            return false; // 相机未初始化或点无效
        }

        // 获取当前相机位置
        const cameraPos = this.node.getPosition();
        // 获取窗口大小
        const winSize = cc.winSize;

        // 计算视野的宽高（考虑 rect 的分屏效果）
        const viewWidth = winSize.width * this.camera.rect.width;
        const viewHeight = winSize.height * this.camera.rect.height;

        // 计算视野偏移（基于 rect.x 和 rect.y）
        const viewOffsetX = this.camera.rect.x * winSize.width;
        const viewOffsetY = this.camera.rect.y * winSize.height;

        // 计算视野边界（世界坐标）
        const halfWidth = viewWidth / 2;
        const halfHeight = viewHeight / 2;
        const viewLeft = cameraPos.x - halfWidth + viewOffsetX;
        const viewRight = viewLeft + viewWidth;
        const viewBottom = cameraPos.y - halfHeight + viewOffsetY;
        const viewTop = viewBottom + viewHeight;

        // 判断点是否在视野范围内
        return (
            point.x >= viewLeft &&
            point.x <= viewRight &&
            point.y >= viewBottom &&
            point.y <= viewTop
        );
    },

    setFloow(flag) {
        this.isFloow = flag;
    },
}); 