/**
 * Cocos Creator 游戏开发常用工具类
 * 
 * 方法简介：
 * - hideChildNodesByName: 隐藏指定节点下的所有子节点
 * - deleteChildNodesByName: 删除指定节点下名称在数组中的子节点
 * - transformToNode1Local: 将节点2的世界坐标转换为节点1的本地坐标
 * - getDirectionVector: 获取从节点1到节点2的归一化方向向量
 * - screenShake: 对指定节点应用屏幕震动效果
 * - getRandomPointInRadius: 在指定中心点和半径范围内生成随机点
 * - calculatePoints: 计算圆周上均匀分布的点坐标
 * - getAngleBetweenNodes: 获取两节点之间的角度（度）
 * - getWorldDistance: 计算两节点在世界坐标系中的距离
 * - scrollVerticaPos: 垂直滚动视图定位到内容中的指定子节点
 * - getCameraMovePos: 限制摄像机移动位置不超出地图边界
 * - vectorsToDegress: 将方向向量转换为角度（度）
 * - degreesToVectors: 将角度转换为方向向量
 * - findClosestNode: 找到距离目标节点最近的节点
 * - setGray: 设置节点及其子节点为灰度或恢复正常
 * - checkGoldTips: 为地图外物品提供屏幕边缘导向指示
 * - loadMoveClip: 远程加载 MovieClip 的 JSON 和 PNG 转换为动画
 * - convertMovieClip2Animation: 将 MovieClip 数据和纹理转换为动画剪辑
 * - formatName: 格式化名称，超6个字符截断并添加省略号
 */
var Tools = cc.Class({
    onLoad() { },

    /**
     * 隐藏指定节点下的所有子节点
     * @param {cc.Node} parentNode - 要删除子节点的父节点
     */
    hideChildNodesByName(parentNode) {
        parentNode.children.forEach(child => {
            child.active = false;
        });
    },

    /**
     * 删除指定节点下名称在指定数组中的所有子节点
     * @param {cc.Node} parentNode - 要删除子节点的父节点
     * @param {Array<String>} nameArray - 包含需要删除的子节点名称的数组
     */
    deleteChildNodesByName(parentNode, nameArray) {
        if (!parentNode || !Array.isArray(nameArray)) {
            console.error("无效的参数：请确保parentNode是cc.Node，nameArray是字符串数组。");
            return;
        }
        parentNode.children.forEach(child => {
            if (nameArray.includes(child.name)) {
                child.destroy();
            }
        });
    },

    /**
     * 将节点2的世界坐标转换为节点1的本地坐标
     * @param {cc.Node} node1 - 基准节点（本地坐标系的节点）
     * @param {cc.Node} node2 - 目标节点（将要转换坐标的节点）
     * @returns {cc.Vec2} 返回节点2在节点1本地坐标系下的坐标
     */
    transformToNode1Local(node1, node2) {
        let worldPos2 = node2.parent.convertToWorldSpaceAR(node2.getPosition());
        return node1.convertToNodeSpaceAR(worldPos2);
    },

    /**
     * 获取节点1到节点2的方向向量（以节点1为基准）
     * @param {cc.Node} node1 - 基准节点
     * @param {cc.Node} node2 - 目标节点
     * @returns {cc.Vec2} 返回节点1到节点2的归一化方向向量
     */
    getDirectionVector(node1, node2) {
        const worldPos1 = node1.convertToWorldSpaceAR(cc.v2(0, 0));
        const worldPos2 = node2.convertToWorldSpaceAR(cc.v2(0, 0));
        let direction = cc.v2(worldPos2.x - worldPos1.x, worldPos2.y - worldPos1.y);
        direction = direction.normalize();
        return direction;
    },

    /**
     * 使指定节点进行屏幕震动效果
     * @param {cc.Node} targetNode - 要执行震动效果的节点
     * @param {number} duration - 震动持续时间（秒）
     * @param {number} magnitude - 震动幅度（像素）
     */
    screenShake(targetNode, duration = 0.5, magnitude = 10) {
        targetNode.stopAllActions();
        const originalPosition = targetNode.position.clone();
        const shakeInterval = 0.1;
        const shakeAction = cc.sequence(
            cc.repeat(
                cc.sequence(
                    cc.moveBy(shakeInterval, cc.v2(
                        Math.random() * magnitude - magnitude / 2,
                        Math.random() * magnitude - magnitude / 2
                    )),
                    cc.moveTo(shakeInterval, originalPosition)
                ),
                Math.floor(duration / (2 * shakeInterval))
            ),
            cc.moveTo(shakeInterval, cc.v2(0, 0))
        );
        targetNode.runAction(shakeAction);
    },

    /**
     * 生成指定中心点和半径范围内的随机点
     * @param {cc.Vec2} center - 中心点
     * @param {number} radius - 半径
     * @returns {cc.Vec2} - 随机点
     */
    getRandomPointInRadius(center, radius) {
        let distance = Math.random() * radius;
        let angle = Math.random() * 2 * Math.PI;
        let offsetX = distance * Math.cos(angle);
        let offsetY = distance * Math.sin(angle);
        let randomPoint = cc.v2(center.x + offsetX, center.y + offsetY);
        return randomPoint;
    },

    /**
     * 计算均匀分布在圆周上的点
     * @param {cc.v2} cx - 圆心的 X 坐标
     * @param {cc.v2} cy - 圆心的 Y 坐标
     * @param {Number} diameter - 圆的直径
     * @param {Number} pointCount - 圆周上均匀分布点的数量
     * @returns {Array} 返回一个包含均匀分布点坐标的数组
     */
    calculatePoints(cx, cy, diameter, pointCount) {
        const radius = diameter / 2;
        const points = [];
        for (let i = 0; i < pointCount; i++) {
            const angle = (i * (360 / pointCount)) * (Math.PI / 180);
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            points.push({ x: x, y: y });
        }
        return points;
    },

    /**
     * 获取节点1到节点2的相对角度（以节点1为基准）
     * @param {cc.Node} node1 - 基准节点
     * @param {cc.Node} node2 - 目标节点
     * @returns {Number} 返回节点1到节点2的角度（单位：度）
     */
    getAngleBetweenNodes(node1, node2) {
        const worldPos1 = node1.convertToWorldSpaceAR(cc.v2(0, 0));
        const worldPos2 = node2.convertToWorldSpaceAR(cc.v2(0, 0));
        const deltaX = worldPos2.x - worldPos1.x;
        const deltaY = worldPos2.y - worldPos1.y;
        return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    },

    // 获取两节点之间的距离（世界坐标系）
    getWorldDistance(node1, node2) {
        const worldPos1 = node1.convertToWorldSpaceAR(cc.v2(0, 0));
        const worldPos2 = node2.convertToWorldSpaceAR(cc.v2(0, 0));
        let xdist = Math.abs(worldPos1.x - worldPos2.x);
        let ydist = Math.abs(worldPos1.y - worldPos2.y);
        let dist = worldPos1.sub(worldPos2).mag();
        return [dist, xdist, ydist];
    },

    /**
     * 垂直scrollView 定位到 content下的指定节点
     * @param {cc.ScrollView} scrollView 
     * @param {cc.Node} content     
     * @param {cc.Node} childNode - 定位到的子节点
     * scrollView,content,view坐标统一 cc.v2(0.5, 1) 
     */
    scrollVerticaPos(scrollView, content, childNode) {
        let childPosY = Math.abs(childNode.y);
        let contentSize = content.getContentSize();
        let posPercent = childPosY / contentSize.height;
        let ph = 0;
        if (posPercent >= 0.5) {
            ph = childPosY + childNode.height / 2;
        } else {
            ph = childPosY - childNode.height / 2;
        }
        let percent = 1 - (ph / contentSize.height);
        percent = Math.min(Math.max(percent, 0), 1);
        scrollView.scrollToPercentVertical(percent, 0.25);
    },

    /**
     * 得到摄像机移动的位置，不超出地图边界 
     * @param {number} mapWidth - 地图宽度
     * @param {number} mapHeight - 地图高度
     * @param {cc.Vec2} targetPos - 摄像机目标移动的位置
     * @returns {cc.Vec2} 返回摄像机限制在地图边界内的实际移动位置
     */
    getCameraMovePos(mapWidth, mapHeight, targetPos) {
        let halfMapWidth = mapWidth / 2;
        let halfMapHeight = mapHeight / 2;
        let cameraHalfWidth = cc.winSize.width / 2;
        let cameraHalfHeight = cc.winSize.height / 2;
        let cameraMoveX = targetPos.x;
        let cameraMoveY = targetPos.y;
        if (cameraMoveX < -halfMapWidth + cameraHalfWidth) {
            cameraMoveX = -halfMapWidth + cameraHalfWidth;
        } else if (cameraMoveX > halfMapWidth - cameraHalfWidth) {
            cameraMoveX = halfMapWidth - cameraHalfWidth;
        }
        if (cameraMoveY < -halfMapHeight + cameraHalfHeight) {
            cameraMoveY = -halfMapHeight + cameraHalfHeight;
        } else if (cameraMoveY > halfMapHeight - cameraHalfHeight) {
            cameraMoveY = halfMapHeight - cameraHalfHeight;
        }
        return cc.v2(cameraMoveX, cameraMoveY);
    },

    /**
     * 将方向向量转换为角度
     * dirVec：
     *   1.A.pos.sub(B):
     *      这表示从 B 到 A 的方向向量。
     *      结果是向量从点 B 指向点 A。
     *   2.B.pos.sub(A):
     *      这表示从 A 到 B 的方向向量。
     *      结果是向量从点 A 指向点 B。
     * 角度：cocos creator  angle = -degree
     * @param {cc.Vec2} dirVec - 方向向量
     * @param {cc.Vec2} comVec - 对比向量（参考方向，通常为cc.v2(0, 1)表示竖直向上）
     * @returns {Number} 返回方向向量与对比向量之间的夹角（单位：度）
     */
    vectorsToDegress(dirVec, comVec) {
        let radian = dirVec.signAngle(comVec);
        let degree = cc.misc.radiansToDegrees(radian);
        return degree;
    },

    /**
     * 将角度转换为方向向量
     * @param {Number} degree - 角度值（单位：度）
     * @param {cc.Vec2} comVec - 对比向量（参考方向，通常为cc.v2(0, 1)表示竖直向上）
     * @returns {cc.Vec2} 返回旋转后的新方向向量
     */
    degreesToVectors(degree, comVec) {
        let radian = cc.misc.degreesToRadians(degree);
        let dirVec = comVec.rotate(-radian);
        return dirVec;
    },

    /**
     * 找到距离对比节点最近的节点
     * @param {cc.Node} targetNode - 需要进行对比的目标节点
     * @param {cc.Node[]} nodeArray - 节点数组，需要从中找到与目标节点距离最近的节点
     * @returns {cc.Node|null} - 返回距离最近的节点，如果数组为空则返回 null
     */
    findClosestNode(targetNode, nodeArray) {
        if (!targetNode || !nodeArray || nodeArray.length === 0) {
            return null;
        }
        let closestNode = null;
        let minDistance = Infinity;
        const targetWorldPos = targetNode.parent.convertToWorldSpaceAR(targetNode.position);
        nodeArray.forEach(node => {
            const nodeWorldPos = node.parent.convertToWorldSpaceAR(node.position);
            const distance = targetWorldPos.sub(nodeWorldPos).mag();
            if (distance < minDistance) {
                minDistance = distance;
                closestNode = node;
            }
        });
        return [closestNode, minDistance];
    },

    // sprite置灰或者复原
    setGray(node, flag) {
        var sprites = node.getComponentsInChildren(cc.Sprite);
        for (var i = 0; i < sprites.length; ++i) {
            var sprite = sprites[i];
            if (flag) {
                sprite.setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
            } else {
                sprite.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
            }
        }
    },

    /**
     * 地图外物品导向
     * @param {cc.Node} targetNode -  目标节点 
     * @param {*} playerrNode  - 玩家节点
     * @param {*} goodNode - 地图上显示的导向节点 
     * @param {*} ctlType  - 玩家控制类型,双人玩家
     */
    checkGoldTips(targetNode, playerrNode, goodNode, ctlType) {
        let windowSize = cc.view.getVisibleSize();
        let halfScreenWidth = windowSize.width / 4;
        let guidePos = targetNode.convertToWorldSpaceAR(cc.v2(0, 0));
        let playerPos = playerrNode.convertToWorldSpaceAR(cc.v2(0, 0));
        let minV;
        let maxV;
        const edgeWadding = goodNode.width / 2;
        const edgeHadding = goodNode.height / 2;
        if (GlobalMng.isDouble() && ctlType == 1) {
            playerPos.x += halfScreenWidth;
            minV = cc.v2(-cc.winSize.width / 2 + edgeWadding, -cc.winSize.height / 2 + edgeHadding);
            maxV = cc.v2(-edgeWadding, cc.winSize.height / 2 - edgeHadding);
        } else if (GlobalMng.isDouble() && ctlType == 2) {
            playerPos.x -= halfScreenWidth;
            minV = cc.v2(edgeWadding, -cc.winSize.height / 2 + edgeHadding);
            maxV = cc.v2(cc.winSize.width / 2 - edgeWadding, cc.winSize.height / 2 - edgeHadding);
        } else {
            minV = cc.v2(-cc.winSize.width / 2 + edgeWadding, -cc.winSize.height / 2 + edgeHadding);
            maxV = cc.v2(cc.winSize.width / 2 - edgeWadding, cc.winSize.height / 2 - edgeHadding);
        }
        let disPos = guidePos.sub(playerPos);
        let earlyPos = disPos.clone();
        let rotatePos = disPos.clampf(minV, maxV);
        if (rotatePos.mag() == earlyPos.mag()) {
            goodNode.active = false;
        } else {
            goodNode.setPosition(rotatePos.x, rotatePos.y);
            let dir;
            if (GlobalMng.isDouble()) {
                dir = guidePos.sub(playerPos.add(rotatePos)).normalize();
            } else {
                dir = guidePos.sub(playerPos).normalize();
            }
            let angle = dir.signAngle(cc.v2(0, 1));
            let degree = angle / Math.PI * 180;
            goodNode.getChildByName("goldTipRotate").angle = -degree;
            goodNode.active = true;
        }
    },

    /**
     * 远程加载MovieClip的JSON文件和PNG纹理，转换为动画剪辑
     * @param {String} jsonFile - JSON文件的URL
     * @param {String} pngFile - PNG文件的URL
     * @param {Function} callback - 回调函数，接收参数 `err` 和 `arrClip`（动画剪辑数组）
     */
    loadMoveClip(jsonFile, pngFile, callback) {
        let jsonInfo = null;
        let pngTexture = null;
        cc.assetManager.loadRemote({ url: jsonFile, type: 'json' }, (err, info) => {
            if (err) {
                return;
            }
            jsonInfo = info;
            if (jsonInfo !== null && pngTexture !== null) {
                this.convertMovieClip2Animation(jsonInfo, pngTexture, callback);
            }
        });
        cc.assetManager.loadRemote({ url: pngFile, type: 'png' }, (err, tex) => {
            if (err) {
                return;
            }
            pngTexture = tex;
            if (jsonInfo !== null && pngTexture !== null) {
                this.convertMovieClip2Animation(jsonInfo, pngTexture, callback);
            }
        });
    },

    /**
     * 将MovieClip的数据和纹理转换为动画剪辑
     * @param {Object} jsonInfo - 包含动画信息的JSON对象
     * @param {cc.Texture2D} pngTexture - 动画帧使用的PNG纹理
     * @param {Function} callback - 回调函数，接收参数 `err` 和 `arrClip`（动画剪辑数组）
     */
    convertMovieClip2Animation(jsonInfo, pngTexture, callback) {
        let objRes = jsonInfo.res;
        let dictSpriteFrame = {};
        for (var resKey in objRes) {
            let res = objRes[resKey];
            let spriteFrame = new cc.SpriteFrame(pngTexture, cc.rect(res.x, res.y, res.w, res.h));
            dictSpriteFrame[resKey] = spriteFrame;
        }
        let objMc = jsonInfo.mc;
        let arrClip = [];
        for (var aniName in objMc) {
            let objAni = {};
            let ani = objMc[aniName];
            objAni.sample = ani.frameRate;
            objAni.frames = [];
            for (var idx = 0; idx < ani.frames.length; idx++) {
                let objFrame = ani.frames[idx];
                for (var idxFrames = 0; idxFrames < objFrame.duration; idxFrames++) {
                    objAni.frames.push(dictSpriteFrame[objFrame.res]);
                }
            }
            var clip = cc.AnimationClip.createWithSpriteFrames(objAni.frames, objAni.sample);
            clip.name = aniName;
            arrClip.push(clip);
        }
        callback(null, arrClip);
    },

    /**
     * 格式化名称，如果长度超过6个字符，则截取并处理emoji字符
     * @param {String} name - 需要格式化的名称
     * @returns {String} 返回格式化后的名称，长度超过6个字符时加上'...'
     */
    formatName(name) {
        var result = '';
        if (name.length) {
            if (name.length > 6) {
                for (var i = 0; i < 6; i++) {
                    var str = name[i] + name[i + 1];
                    if (emojione.regUnicode.exec(str) !== null) {
                        result += str;
                        i++;
                    } else {
                        result += name[i];
                    }
                }
                result += '...';
            } else {
                result = name;
            }
        }
        return result;
    }
});

var ccTools = new Tools();
ccTools.onLoad();
module.exports = ccTools;