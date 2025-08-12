// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const Types = require("../data/Types");
const Quadtree = require('QuadTree');
const PlayerData = require("PlayerData");
//核心管理类
var Game = cc.Class({
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
        inputRoot: cc.Node,
        mapRoot: cc.Node,
        splitLine: cc.Node,
        keyLog: cc.Label,
        miniMapNode: cc.Node,
        miniMaskNode: cc.Node,
        tipUIRoot: cc.Node,
        popUIRoot: cc.Node,
        glassPrefab: cc.Prefab,
        labGameTime: cc.Label,
        mapItem: cc.Node,
        repairIconRoot: cc.Node,
        miniNode: cc.Node,
    },

    statics: {
        instance: null
    },
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (AD.chanelName == "touTiao" && AD.chanelName1 == "touTiao") {
            cc.director.emit("录屏开始");
        }
        Game.instance = this;
        this.splitLine.active = GlobalMng.isDouble();
        this.InputManager = cc.find("InputManager").getComponent("InputManager");
        this.InputManager.init();
        this.timeMng = cc.find("TimeManager").getComponent("TimeManager");

        this.gameState = Types.GameState.None;
        this.escapePlayerNum = 0;
        this.isLoadQuadCom = false;
        this.eatKeyNum = 0;
        this.monsterSpeed = 210;
        this.monsterUpSpeedTimes = 3;
        this.monsterIsOpenMini = false;
        this.gameRunTime = 0;
        this.gameTimeFrame = 0;
        this.gameIsStart = false;
        this.monsterArray = [];
        this.playerArray = [];
        this.keyArray = [];
        this.keyPosArray = [];
        this.playerIsOpenMove = false;

        this.isShowComplete = false;
        this.p1FreeReviveTimes = 2;
        this.p2FreeReviveTimes = 2;
        this.curKey = 0;

        if (GlobalMng.isDouble()) {
            this.p1FreeReviveTimes = 1;
            this.p2FreeReviveTimes = 1;
        }
        //test
        if (GlobalMng.isTestDraw) {
            this.testQuadAreaNum = 0;
            this.createDraw();
        }


        //后室地图才有修复道具
        if (GlobalMng.gameMap == Types.MapName.HouShi) {
            this.isRepaiModel = true;
            this.mapItem.active = true;
            this.gateIsOpen = false;
            this.alreadyRepair = 0;
            this.totalRepai = 6;

            this.miniNode.getChildByName("剩余维修").active = true;
            this.weixiuKey = this.miniNode.getChildByName("剩余维修").getChildByName("key").getComponent(cc.Label);
            this.weixiuKey.string = this.totalRepai - 1;
        } else {
            this.isRepaiModel = false;
            this.mapItem.active = false;
        }

    },

    start() {

    },
    initMap(callBack) {
        GlobalMng.sceneMng.createUIByBundle(`levels/map/${GlobalMng.gameMap}`, this.mapRoot, (mapNode) => {
            this.curMapNode = mapNode;
            this.playerRoot = mapNode.getChildByName("playerRoot");
            this.curMapScript = mapNode.getComponent("Map");
            //动态添加物理  
            this.curMapScript.init(this);
            this.curMapScript.dynamicsCollide(() => {
                callBack && callBack();
                this.createQuqdTree();
            })

        })

    },

    initMiNi(callBack) {
        //初始化小地图
        this.curMapScript.initMiniMap(callBack);
    },


    initJoy(callBack) {
        this.InputManager.loadInputControls(this.inputRoot.getChildByName("joystick"), callBack);
    },

    initPlayer(callBack) {
        let playerConfig1 = {
            ctlType: Types.ActorControl.Player1,
            speed: 260,
        };

        let playerConfig2 = {
            ctlType: Types.ActorControl.Player2,
            speed: 260,
        }

        if (GlobalMng.isSingle()) {
            GlobalMng.sceneMng.createUIByBundle(`actor/human/${Types.ActorSkillData[PlayerData.playerInfo.curRole1SkinID].name}`, this.playerRoot, (playerNode) => {
                this.playerArray.push(playerNode);
                playerNode.getComponent("Player").init(this, playerConfig1);
                callBack && callBack();
            })
        } else {
            GlobalMng.sceneMng.createUIByBundle(`actor/human/${Types.ActorSkillData[PlayerData.playerInfo.curRole1SkinID].name}`, this.playerRoot, (playerNode) => {
                this.playerArray.push(playerNode);
                playerNode.getComponent("Player").init(this, playerConfig1);
                GlobalMng.sceneMng.createUIByBundle(`actor/human/${Types.ActorSkillData[PlayerData.playerInfo.curRole2SkinID].name}`, this.playerRoot, (playerNode) => {
                    this.playerArray.push(playerNode);
                    playerNode.getComponent("Player").init(this, playerConfig2);
                    callBack && callBack();
                })
            })

        }

    },

    //初始化游戏剧情
    initJuQing(callBack) {
        if (!PlayerData.playerInfo.hasSeenJuqing) {
            GlobalMng.uiMng.showOnceDialog('ui/layer/Plot', this.popUIRoot, (node) => {
                callBack && callBack();
                this.gameJuQingNode = node;
            })
        } else {
            this.gameJuQingNode = null;
            callBack && callBack();
        }
    },

    //游戏主要内容加载完毕
    gameLoadComplete() {
        // GlobalMng.audioMng.stopMusic();
        //先开启暂停触摸
        GlobalMng.uiMng.showSharedMask();
        //转场
        GlobalMng.uiMng.showOnceQuickDialog('ui/layer/转场', this.popUIRoot, (panelNode) => {
            panelNode.getComponent("TurnScene").show(() => {
                this.playPlot();
            })
        })

        if (GlobalMng.firstInGame) {
            GlobalMng.firstInGame = false;
        }
    },

    //播放剧情或...
    playPlot() {
        //判断是否已经观看了剧情
        if (!PlayerData.playerInfo.hasSeenJuqing && this.gameJuQingNode) {
            this.gameJuQingNode.getComponent("Plot").fadeInSequentially();
        } else {
            this.playerReady();
        }
    },

    //让玩家就绪 飞入
    playerReady() {
        this.playerArray.forEach(playerNode => {
            playerNode.getComponent("Player").flyOut();
        });
    },

    //倒计时3秒动画
    timeStart() {
        GlobalMng.uiMng.createGameEffect('effects/3秒倒计时', this.popUIRoot, cc.v2(0, 0), "ThreeCount", [() => {
            this.gameStart();
        }])
    },

    //游戏正式开始
    gameStart() {
        GlobalMng.audioMng.playGameMusic(1);
        this.setGameState(Types.GameState.Playing)
        this.createTaskTip();
        GlobalMng.uiMng.hideSharedMask();
        if (!PlayerData.playerInfo.hasSeenGuide) {
            GlobalMng.uiMng.showOnceDialog('ui/layer/触摸指引', this.popUIRoot, (node) => {
                node.getComponent("GameCommonTip").init();
                PlayerData.guiComplete();
            })
        }
    },

    //激活巡逻怪
    activePatrol() {
        let children = this.playerRoot.children;
        for (let i = 0; i < children.length; i++) {
            let monster = children[i].getComponent("Monster");
            if (monster && monster.isPatrol()) {
                this.monsterArray.push(monster.node);
                monster.init(this, { speed: this.monsterSpeed });
                monster.node.active = true;
            }
        }

    },

    //绘制路线的画笔 测试用
    createDraw() {
        // 创建一个新的Node来容纳Graphics组件
        const graphicsNode = new cc.Node();
        this.node.addChild(graphicsNode);
        // 添加Graphics组件
        this.graphics = graphicsNode.addComponent(cc.Graphics);
        // 开始绘制
        this.graphics.lineWidth = 10;
        this.graphics.fillColor = cc.Color.RED;
    },

    //创建单个追击怪
    createOneChasingMonster(monsterSpeed, isAlwaysFloow) {
        GlobalMng.audioMng.playEffect("恶魔笑声");
        GlobalMng.sceneMng.createUIByBundle(`actor/monster/ChasingMonster`, this.playerRoot, (actorNode) => {
            this.monsterArray.push(actorNode);
            let bornPos = this.findMonsterBornPos(600);
            actorNode.setPosition(bornPos);
            actorNode.getComponent("Monster").init(this, { speed: monsterSpeed });
            if (isAlwaysFloow) {
                actorNode.getComponent("ChasingMonster").isAlwaysFloow = isAlwaysFloow;
            }
        });
    },
    //创建怪物
    createAllMonster() {
        if (GlobalMng.gameMap == Types.MapName.MapPark) {
            this.createParkMonster();
        } else {
            this.createOneChasingMonster(this.monsterSpeed, true)
            this.scheduleOnce(() => {
                this.createOneChasingMonster(this.monsterSpeed);
                GlobalMng.uiMng.createGameTipMessage(`levels/tip/怪物增加`, this.popUIRoot, cc.v2(0, 200), (copscemmNode) => {
                    copscemmNode.getComponent("GameCommonTip").init();
                });
            }, 45);
        }

    },

    createParkMonster() {
        this.createOneChasingMonster(this.monsterSpeed, true);
        this.scheduleOnce(() => {
            this.createOneChasingMonster(this.monsterSpeed);
            GlobalMng.uiMng.createGameTipMessage(`levels/tip/怪物增加`, this.popUIRoot, cc.v2(0, 200), (copscemmNode) => {
                copscemmNode.getComponent("GameCommonTip").init();
            });
        }, 45);
    },

    createQuqdTree() {
        let widthMap = this.curMapScript.mapTotalWidth;
        let heightMap = this.curMapScript.mapTotalHeight;
        let bounds = { x: -widthMap / 2, y: -heightMap / 2, width: widthMap, height: heightMap };
        this.quadtree = new Quadtree(bounds, 15, 4);

        let kes = this.curMapScript.keyRoot.children;
        for (var i = 0; i < kes.length; ++i) {
            let key = kes[i]
            this.keyArray.push(key);
            this.keyPosArray.push(key.getPosition());
            let kWidth = key.width * key.scale;
            let kHeight = key.height * key.scale;
            let lex = key.x - kWidth / 2;
            let ley = key.y - kHeight / 2;
            let rect = { x: lex, y: ley, width: kWidth, height: kHeight, fNode: key };
            this.quadtree.insert(rect);
            key.getComponent("Key").qudaRect = rect;
            key.getComponent("Key").keyName = i;
        }
        this.isLoadQuadCom = true;

        this.keyTotal = this.getKeyTarget();
        this.curKey = this.keyTotal;
        console.log(this.keyArray.length)
    },



    createTaskTip() {
        let str = this.isRepaiModel ? '新任务目标' : '任务目标';
        GlobalMng.uiMng.createGameTipMessage(`levels/tip/${str}`, this.popUIRoot, cc.v2(0, 200), (commNode) => {
            commNode.getComponent("GameCommonTip").init();
            if (GlobalMng.gameMap != Types.MapName.HouShi) {
                this.scheduleOnce(() => {
                    GlobalMng.uiMng.createGameTipMessage(`levels/tip/小心怪物`, this.popUIRoot, cc.v2(0, 200), (copscemmNode) => {
                        copscemmNode.getComponent("GameCommonTip").init();
                        this.createAllMonster()
                    });
                }, 6)
            }

        });

    },

    //修复场景物品
    repairOne(name) {
        this.repairIconRoot.getChildByName(name).getChildByName("bed").active = false;
        this.repairIconRoot.getChildByName(name).getChildByName("good").active = true;
        this.alreadyRepair++;
        this.isCompleteAll();
        console.log(name)
        if (name == "大门") {
            this.createTaskTip();
            this.gateIsOpen = true;
            GlobalMng.uiMng.createGameTipMessage(`levels/tip/小心怪物`, this.popUIRoot, cc.v2(0, 200), (copscemmNode) => {
                copscemmNode.getComponent("GameCommonTip").init();
                this.createAllMonster()
            });
        } else {
            this.weixiuKey.string = this.totalRepai - this.alreadyRepair;
        }
    },

    //是否全部修复完毕
    isRepaiAll() {
        return this.alreadyRepair >= this.totalRepai;
    },
    //钥匙收集完成
    keysTaskComplete() {
        this.isShowComplete = true;
        GlobalMng.uiMng.createGameTipMessage(`levels/tip/成功搜集`, this.popUIRoot, cc.v2(0, 200), (commNode) => {
            commNode.getComponent("GameCommonTip").init();
        });
        this.curMapScript.showExit();

        this.schedule(this.playRepetChuanSong, 1);
    },
    playRepetChuanSong() {
        GlobalMng.audioMng.playEffect(`传送门开启`);
    },
    isCompleteAll() {
        if (this.isRepaiModel) {
            if (this.getKeyNum() == 0 && !this.isShowComplete && this.isRepaiAll()) {
                this.popUIRoot.children.forEach(item => {
                    if (item.name === "tip") {
                        item.destroy();
                    }
                });
                GlobalMng.uiMng.createGamePublic('effects/tip', this.popUIRoot, cc.v2(0, 0), (tipNode) => {
                    tipNode.getChildByName(`所有已修复`).active = true;
                })
                this.keysTaskComplete();
            }
        } else {
            if (this.getKeyNum() == 0 && !this.isShowComplete) {
                this.keysTaskComplete();
            }
        }
    },



    //吃钥匙
    takeKey(keyNode, isOpenMagnet, player) {
        if (keyNode.getComponent("Key").qudaRect) {
            this.quadtree.removeObject(keyNode.getComponent("Key").qudaRect)
        }
        _.removeItem(this.keyArray, keyNode);

        //移除小地图上的水晶
        let miniGlass = this.miniMapNode.getChildByName("crystalNode").getChildByName(keyNode.getComponent("Key").keyName);
        if (miniGlass) {
            GlobalMng.poolMng.putNode(miniGlass);
        }

        //是否开启磁铁
        if (isOpenMagnet) {
            keyNode.getComponent("Key").setFlayTarget(player);
        } else {
            this.addKey();
            keyNode.getComponent("Key").keyDesAnimation();
        }


    },

    //增加钥匙
    addKey() {
        GlobalMng.audioMng.playEffect("紫水晶");
        this.eatKeyNum++;
        this.curKey--;
        if (this.curKey <= 0) {
            this.curKey = 0;
        }
        //是否吃完所有水晶了
        if (this.getKeyNum() == 0 && !this.isShowComplete) {
            this.isCompleteAll();
        }
        //增加怪物移速
        if (this.eatKeyNum == 50 || this.eatKeyNum == 80 || this.eatKeyNum == 150) {
            this.upgradeSpeed();
        }

        //提示钥匙信息
        if (this.isTipKey()) {
            let temKey = this.getKeyNum();
            GlobalMng.uiMng.createGameTipMessage(`levels/tip/剩余钻石`, this.popUIRoot, cc.v2(0, 200), (commNode) => {
                console.log(temKey)
                let sNdoe = commNode.getChildByName(temKey + "");
                if (sNdoe) {
                    sNdoe.active = true;
                }
                commNode.getComponent("GameCommonTip").init();
            });
        }


    },

    //是否提示剩余水晶信息
    isTipKey() {
        if (this.getKeyNum() == 200 || this.getKeyNum() == 150 || this.getKeyNum() == 100 || this.getKeyNum() == 50 || this.getKeyNum() == 10) {
            return true
        } else {
            return false
        }
    },

    //当前钥匙的数量
    getKeyNum() {
        //    return this.keyArray.length;
        return this.curKey;
    },

    //要收数量手机目标 
    getKeyTarget() {
        if (GlobalMng.gameMap == Types.MapName.MapPark) {
            return 180;
        } else if (GlobalMng.gameMap == Types.MapName.MapSchool) {
            return 280;
        } else if (GlobalMng.gameMap == Types.MapName.MapHospital) {
            return this.keyArray.length;
        } else if (GlobalMng.gameMap == Types.MapName.HouShi) {
            return 120;
        }
    },
    //获取钥匙进度
    getKeyCollectProgress() {
        let curKey = this.getKeyNum();
        let progress = 1 - (curKey / this.keyTotal);
        return progress;
    },



    //玩家成功逃跑
    addEscapePlayer(ctlType) {
        this.escapePlayerNum++;
        if (this.escapePlayerNum >= 2) {
            this.gameWin();
        } else {
            GlobalMng.uiMng.createGameTipMessageSplite(`levels/tip/等待队友`, this.popUIRoot, ctlType, (copscemmNode) => {
                copscemmNode.getComponent("GameCommonTip").init();
            });
        }
    },

    //游戏胜利
    gameWin() {
        console.log("游戏胜利")
        this.setGameState(Types.GameState.Over);
        GlobalMng.uiMng.showSharedDialog('ui/panel/GameWin', this.popUIRoot)
        this.unschedule(this.playRepetChuanSong);
    },

    //游戏失败
    gameFail() {
        console.log("游戏失败")
        this.setGameState(Types.GameState.Over);
        GlobalMng.uiMng.showSharedDialog('ui/panel/GameFail', this.popUIRoot)
    },

    //统一升级怪物移速
    upgradeSpeed() {
        if (this.monsterUpSpeedTimes <= 0) return
        let addSpeedNum = 10;
        this.monsterSpeed += addSpeedNum;
        this.monsterUpSpeedTimes--;
        this.monsterArray.forEach(monster => {
            monster.getComponent("Monster").moveScript.changeBaseSpeedByNum(addSpeedNum);
        });
    },
    //找到离自己最近的怪物
    findNearestMonster(curNode) {
        const result = GlobalMng.ccTools.findClosestNode(curNode, this.monsterArray);
        return result;
    },

    //找到距离targePos至少为dist的随机点
    findOneKeyPosByDist(targePos, dist = 1280) {
        let tTemp = [];
        for (const kePos of this.keyPosArray) {
            if (kePos) {
                // 计算当前节点与目标位置的距离
                let dx = kePos.x - targePos.x;
                let dy = kePos.y - targePos.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                // 如果距离大于等于dist，添加到临时数组
                if (distance >= dist) {
                    tTemp.push(kePos);
                }
            }
        }

        // 如果数组不为空，从中随机返回一个点
        if (tTemp.length > 0) {
            let randomIndex = Math.floor(Math.random() * tTemp.length);
            return tTemp[randomIndex];
        }
        // 如果没有符合条件的点，返回null
        return null;
    },

    findMonsterBornPos(dist = 1000) {
        let tTemp = [];
        for (const kePos of this.keyPosArray) {
            if (kePos) {
                // 计算当前节点与目标位置的距离
                let dx = kePos.x - this.playerArray[0].x;
                let dy = kePos.y - this.playerArray[0].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let distance2 = Infinity;
                if (this.playerArray[1]) {
                    let dx2 = kePos.x - this.playerArray[1].x;
                    let dy2 = kePos.y - this.playerArray[1].y;
                    distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                }

                // 如果距离大于等于dist，添加到临时数组
                if (distance >= dist) {
                    return kePos
                }
            }
        }

        // 如果数组不为空，从中随机返回一个点
        // if (tTemp.length > 0) {
        //     let randomIndex = Math.floor(Math.random() * tTemp.length);
        //     return tTemp[randomIndex];
        // }
        // // 如果没有符合条件的点，返回null
        let randomIndex = Math.floor(Math.random() * this.keyPosArray.length);
        return this.keyPosArray[randomIndex];
    },
    /**
     * 根据范围查找距离目标最近的点并随机返回一个
     * @param {cc.Vec2} targePos 目标位置
     * @param {number} minDist 最小距离
     * @param {number} maxDist 最大距离
     * @returns {cc.Vec2|null} 随机选中的点，或 null（如果没有符合条件的点）
     */
    findOneKeyPosByRange(targePos, minDist, maxDist) {
        let tTemp = [];
        // 筛选符合距离范围的点
        for (const kePos of this.keyPosArray) {
            if (kePos) {
                // 计算当前节点与目标位置的距离
                let dx = kePos.x - targePos.x;
                let dy = kePos.y - targePos.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                // 如果距离在 minDist 和 maxDist 之间，添加到临时数组
                if (distance > minDist && distance <= maxDist) {
                    tTemp.push({ pos: kePos, distance: distance }); // 存储位置和距离
                }
            }
        }
        // 如果没有符合条件的点，返回 null
        if (tTemp.length === 0) {
            return null;
        }
        // 按距离排序，找到最近的点
        tTemp.sort((a, b) => a.distance - b.distance);
        let nearestPoints = tTemp.slice(0, Math.min(10, tTemp.length));
        // 从最近的点中随机选择一个
        // let randomIndex = Math.floor(Math.random() * nearestPoints.length);
        let newArrayPos = [];
        nearestPoints.forEach(element => {
            newArrayPos.push(element.pos)
        });
        return newArrayPos//nearestPoints[randomIndex].pos;

    },

    revivePlayer(palyer) {
        if (palyer) {
            palyer.revive();
        } else {
            this.playerArray.forEach(palyerNode => {
                palyerNode.getComponent("Player").revive();
            });
        }
        let monsterPos = this.findMonsterBornPos(2000);
        this.monsterArray.forEach(monsterNode => {
            let monster = monsterNode.getComponent("Monster");
            if (monster.isChasing()) {
                monsterNode.setPosition(monsterPos);
                monster.resMoveSetData();
            }
        });
    },

    //随机得到一钥匙点
    getOneRandKeyPos() {
        let randomIndex = Math.floor(Math.random() * this.keyPosArray.length);
        return this.keyPosArray[randomIndex];
    },

    getMonsterSkeName() {
        if (GlobalMng.gameMap == Types.MapName.MapPark) {
            return "怪物1"
        } else if (GlobalMng.gameMap == Types.MapName.MapSchool) {
            return "怪物2"
        } else if (GlobalMng.gameMap == Types.MapName.MapHospital) {
            if (this.getMonsterNum() == 1) {
                return "怪物3"
            } else {
                return "怪物4"
            }

        } else {
            return "怪物1"
        }
    },


    getMonsterNum() {
        return this.monsterArray.length;
    },

    setGameState(state) {
        this.gameState = state;
    },

    getGameState() {
        return this.gameState;
    },

    gameStateIsPlaying() {
        return this.gameState == Types.GameState.Playing
    },
    gameStateIsOver() {
        return this.gameState == Types.GameState.Over
    },
    gameStateIsPause() {
        return this.gameState == Types.GameState.Paused
    },

    getPlayerById(playerIdx) {
        return this.playerArray[playerIdx - 1].getComponent("Player");
    },
    getPlayerNodeById(playerIdx) {
        return this.playerArray[playerIdx - 1];
    },

    playerIsAllDie() {
        if (GlobalMng.isSingle()) {
            return true
        }
        let playeTimes = 0;
        for (let i = 0; i < this.playerArray.length; i++) {
            const player = this.playerArray[i].getComponent("Player");
            if (player.isDie()) {
                playeTimes++;
            }
            if (player.getInvalid()) {
                return true;
            }
        }
        if (playeTimes >= 2) {
            return true;
        } else {
            return false;
        }


    },

    addTimeSecond() {
        this.gameRunTime++;
        this.labGameTime.string = _.formatTime(this.gameRunTime);
        if (this.gameRunTime == 5) {
            this.btnItemShop();
        }

        if (AD.autoVideo) {
            if (AD.chanelName1 == "vivo") {
                if (this.gameRunTime % 60 == 0) {
                    AD.showAD(() => {
                    }, this);
                    // AD.chaPing("游戏中");
                    // AD.showBanner();
                }
            }
            else if (AD.chanelName1 == "oppo") {
                if (this.gameRunTime % 120 == 0) {
                    AD.showAD(() => {
                    }, this);
                    // AD.chaPing("游戏中");
                    // AD.showBanner();
                }
            }
        }
    },


    showMiniMapNode(flag) {
        // if (condition) {
        // }
    },

    desperPopNodeByName(name) {
        // 递归查找所有名称为 name 的节点
        function findAndDestroyNodes(node, name) {
            if (!node) return;
            // 检查当前节点是否匹配名称
            if (node.name === name) {
                node.destroy();
                return; // 销毁后不再继续处理该节点的子节点
            }
            // 遍历所有子节点
            let children = node.children;
            for (let i = children.length - 1; i >= 0; i--) {
                findAndDestroyNodes(children[i], name);
            }
        }

        // 从 popUIRoot 开始查找并销毁
        findAndDestroyNodes(this.popUIRoot, name);
    },
    //小地图显示怪物
    useOrCloseItemMonster(flag) {
        this.monsterIsOpenMini = flag;
        if (flag == false) {
            this.monsterArray.forEach(monsterNode => {
                let monsterId = monsterNode.getComponent("Monster").id;
                this.miniMapNode.getChildByName(monsterId + "").active = false;
            });
        }
    },
    //增加玩家移速
    useOrCloseItemMove(flag) {
        this.playerIsOpenMove = flag;
        if (flag) {
            this.playerArray.forEach(playerNode => {
                playerNode.getComponent("Player").changeBaseSpeed(50);
            });
        } else {
            playerNode.getComponent("Player").changeBaseSpeed(-50);
        }
    },

    itemMoveIsAlready() {
        return this.playerIsOpenMove;
    },
    itemMonsterIsAlready() {
        return this.monsterIsOpenMini;
    },


    btnReturn() {
        GlobalMng.uiMng.showSharedDialog('ui/panel/SecondPanel', this.popUIRoot);
    },

    btnItemShop() {
        GlobalMng.uiMng.showSharedDialog('ui/panel/ItemShop', this.popUIRoot);
    },
    btnQingDanClick() {
        GlobalMng.uiMng.showSharedDialog('ui/panel/QingDanPanel', this.popUIRoot);
    },

    btnItem1() {  //加速鞋
        if (this.itemMoveIsAlready()) {
            GlobalMng.uiMng.showTip("已使用道具飞毛腿")
            return
        }
        AD.showAD(() => {
            GlobalMng.uiMng.showTip("已使用道具飞毛腿")
            Game.instance.useOrCloseItemMove(true);
        }, this)
    },

    btnItem2() {  //望远镜
        if (this.itemMonsterIsAlready()) {
            GlobalMng.uiMng.showTip("已经使用望远镜")
            return
        }
        AD.showAD(() => {
            GlobalMng.uiMng.showTip("已经使用望远镜")
            Game.instance.useOrCloseItemMonster(true);
        }, this)
    },
    //test
    drawRectangle(rect, color) {
        this.graphics.strokeColor = color;
        this.graphics.rect(rect.x, rect.y, rect.width, rect.height);
        this.graphics.stroke();
    },
    update(dt) {
        this.keyLog.string = this.getKeyNum();;
        if (this.gameStateIsPlaying()) {
            this.gameTimeFrame += dt;
            if (this.gameTimeFrame >= 1) {
                this.gameTimeFrame = 0;
                this.addTimeSecond();
            }
        }

    },
});
