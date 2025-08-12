cc.Class({
    extends: cc.Component,

    properties: {
        keyRoot: cc.Node,
        mapExit: cc.Node
    },

    init(game) {
        this.game = game;
        this.game.miniMaskNode.active = false;

        this.curTiledMap = this.node.getComponent(cc.TiledMap);
        this.curTiledMap.enableCulling(false);
        this.hideExit();


        this.mechanRootNode = this.node.getChildByName("mechanRoot");
    },


    dynamicsCollide(callBack) {
        // 获取地图尺寸和瓦片大小
        this.tileSize = this.curTiledMap.getTileSize();
        this.mapSize = this.curTiledMap.getMapSize();
        const tileWidth = this.mapSize.width; // 地图宽度（瓦片数）
        const tileHeight = this.mapSize.height; // 地图高度（瓦片数）

        const pixelWidth = this.tileSize.width; // 单个瓦片宽度（像素）
        const pixelHeight = this.tileSize.height; // 单个瓦片高度（像素）

        // 计算地图总大小（像素）
        this.mapTotalWidth = tileWidth * pixelWidth;
        this.mapTotalHeight = tileHeight * pixelHeight;
        console.log("地图大小: ", this.mapTotalWidth, this.mapTotalHeight)

        // 获取矩形对象层
        const objectGroup = this.curTiledMap.getObjectGroup("矩形");
        let rectObjects = [];
        if (!objectGroup) {
            console.error("未找到名为 '矩形' 的对象层");
        } else {
            rectObjects = objectGroup.getObjects() || [];
            if (rectObjects.length === 0) {
                console.warn("矩形对象层为空");
            }
        }

        // 获取圆形对象层
        const roundGroup = this.curTiledMap.getObjectGroup("圆");
        let roundObjects = [];
        if (!roundGroup) {
            console.log("未找到名为 '圆' 的对象层");
        } else {
            roundObjects = roundGroup.getObjects() || [];
            if (roundObjects.length === 0) {
                console.warn("圆对象层为空");
            }
        }

        // 计算总对象数
        const totalObjects = rectObjects.length + roundObjects.length;
        if (totalObjects === 0) {
            if (callBack) callBack(); // 如果没有对象，直接调用回调
            return;
        }

        // 已处理的对象计数
        let processedCount = 0;

        // 处理矩形碰撞框
        rectObjects.forEach(obj => {
            this.createCollisionBox(obj, this.node, "矩形");
            processedCount++;
            // 检查是否全部处理完成
            if (processedCount === totalObjects && callBack) {
                callBack();
            }
        });

        // 处理圆形碰撞框
        roundObjects.forEach(obj => {
            this.createCollisionBox(obj, this.node, "圆");
            processedCount++;
            // 检查是否全部处理完成
            if (processedCount === totalObjects && callBack) {
                callBack();
            }
        });
    },

    // 创建物理碰撞框
    createCollisionBox(obj, parentNode, shape) {
        // 获取对象属性
        const x = obj.x;         // 左下角 x
        const y = obj.y;         // 左下角 y
        const width = obj.width;
        const height = obj.height;

        // 创建碰撞节点
        const collisionNode = new cc.Node(`Collision_${x}_${y}`);
        collisionNode.group = "default";
        parentNode.addChild(collisionNode);

        // 添加物理组件
        const body = collisionNode.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;
        let collider;
        if (shape === "矩形") {
            collider = collisionNode.addComponent(cc.PhysicsBoxCollider);
            collider.size = cc.size(width, height);
            collider.apply();
        } else {
            collider = collisionNode.addComponent(cc.PhysicsCircleCollider);
            collider.radius = width / 2;
            collider.apply();
        }

        // 坐标转换：从 TiledMap 左下角转换为父节点的本地坐标
        const parentX = -parentNode.width / 2 + width / 2;
        const parentY = -parentNode.height / 2 - height / 2;

        let mapX = x + parentX;
        let mapY = y + parentY;
        collisionNode.setPosition(mapX, mapY);
    },

    initMiniMap(callBack) {
        GlobalMng.sceneMng.setSpriteFrameByBundle(`res/miniMap/${GlobalMng.gameMap}`, this.game.miniMapNode.getComponent(cc.Sprite), () => {
            this.scaleBili = this.game.miniMapNode.width / this.mapTotalWidth;
            this.initGlass(callBack);
        })
    },


    initGlass(callBack) {
        for (let i = 0; i < this.game.keyArray.length; i++) {
            let key = this.game.keyArray[i];
            let gNode = GlobalMng.poolMng.getNode(this.game.glassPrefab);
            let pos = key.getPosition();
            let findPos = pos.mul(this.scaleBili);
            gNode.parent = this.game.miniMapNode.getChildByName("crystalNode");
            gNode.setPosition(findPos);
            gNode._name = key.getComponent("Key").keyName;
        }
        this.game.miniMaskNode.active = true;

        callBack && callBack();
    },



    showExit() {
        if (this.mapExit) {
            this.mapExit.active = true;
            this.mapExit.getComponent(cc.BoxCollider).enabled = true;
        }
    },

    hideExit() {
        if (this.mapExit) {
            this.mapExit.active = false;
            this.mapExit.getComponent(cc.BoxCollider).enabled = false;
        }
    },


    updatePlayerMiniMap(playerIndex, pos) {
        let p = this.game.miniMapNode.getChildByName(playerIndex + "");
        if (!p.active) {
            p.active = true;
        }

        // 计算玩家在小地图上的位置
        let findPos = pos.mul(this.scaleBili);
        p.setPosition(findPos);

        if (playerIndex == 1) {
            // 小地图和遮罩参数
            const miniMapSize = this.game.miniMapNode.width; // 小地图原始尺寸
            const maskSize = this.game.miniMapNode.parent.width;    // 遮罩尺寸
            const halfMiniMap = miniMapSize / 2;
            const halfMask = maskSize / 2;
            // 计算最大可移动偏移量，防止小地图移出遮罩区域
            const maxOffset = halfMiniMap - halfMask; // 422/2 - 200/2 = 111
            // 计算需要将玩家居中所需的偏移量
            let targetOffsetX = -findPos.x;
            let targetOffsetY = -findPos.y;
            // 限制偏移范围在[-maxOffset, maxOffset]之间
            let clampedX = cc.misc.clampf(targetOffsetX, -maxOffset, maxOffset);
            let clampedY = cc.misc.clampf(targetOffsetY, -maxOffset, maxOffset);
            // 移动小地图节点
            this.game.miniMapNode.setPosition(clampedX, clampedY);
        }

    },
    updateMonsterMiniMap(monsterId, pos) {
        let p = this.game.miniMapNode.getChildByName(monsterId + "");
        if (p) {
            if (!p.active) {
                p.active = true;
            }
            let findPos = pos.mul(this.scaleBili);
            p.setPosition(findPos);
        }

    },



});