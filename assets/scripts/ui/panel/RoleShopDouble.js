
const Types = require("../../module/data/Types");
const MAXID = 8;
const PLAYER1 = 1;
const PLAYER2 = 2;
cc.Class({
    extends: require("AShareUIBase"),

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
        shuxingPanel1: cc.Node,
        shuxingPanel2: cc.Node,
        rolePanel1: cc.Node,
        rolePanel2: cc.Node,
        skeSelect1: cc.Node,
        skeSelect2: cc.Node,

    },

    onEnable() {
        AD.chaPing();
    },
    onLoad() {
        this.leftPos = cc.v2(-250, 0);
        this.centerPos = cc.v2(250, 0);
        this.rightPos = cc.v2(750, 0);

        this._super();
        this.playerData = GlobalMng.playerData;
        this.playerInfo = GlobalMng.playerData.playerInfo;
        this.isTruning1 = false;
        this.isTruning2 = false;
        this.flyTimes = 0;
    },
    show(...args) {
        this._super();
        for (let i = 1; i <= 2; i++) {
            this.flushRole(i);
            this.flushShuXing(i);
            this.flushButton(i);
        }
        this.isVideo = false;
        this.vidoeId = null;
        this.vidoeId2 = null;
        this.isTruning1 = false;
        this.isTruning2 = false;
        this.flyTimes = 0;
    },


    btnNext(event, ind) {
        let playerIndex = parseInt(ind);
        if ((playerIndex == 1 && this.isTruning1) || (playerIndex == 2 && this.isTruning2)) {
            return
        }
        playerIndex == 1 ? this.isTruning1 = true : this.isTruning2 = true;
        let showRoleParent = this.getSkinParentById(playerIndex);
        let seledtId = playerIndex == 1 ? this.middleId1 : this.middleId2;
        let nextId = ((seledtId + 0) % MAXID) + 1;
        //当前中间节点
        cc.tween(showRoleParent.getChildByName(seledtId + ""))
            .to(0.25, { position: this.leftPos }, { easing: 'cubicInOut' })
            .start()
        //右侧节点
        cc.tween(showRoleParent.getChildByName(nextId + ""))
            .set({ position: this.rightPos })
            .to(0.25, { position: this.centerPos }, { easing: 'cubicInOut' })
            .call(() => {
                playerIndex == 1 ? this.isTruning1 = false : this.isTruning2 = false;
            })
            .start()
        playerIndex == 1 ? this.middleId1 = nextId : this.middleId2 = nextId;
        this.flushShuXing(playerIndex);
        this.flushButton(playerIndex);

    },
    btnPrev(event, ind) {
        let playerIndex = parseInt(ind);
        if ((playerIndex == 1 && this.isTruning1) || (playerIndex == 2 && this.isTruning2)) {
            return
        }
        playerIndex == 1 ? this.isTruning1 = true : this.isTruning2 = true;
        let showRoleParent = this.getSkinParentById(playerIndex);
        let seledtId = playerIndex == 1 ? this.middleId1 : this.middleId2;
        let prevId = ((seledtId - 2 + MAXID) % MAXID) + 1;

        //当前中间节点
        cc.tween(showRoleParent.getChildByName(seledtId + ""))
            .to(0.25, { position: this.rightPos }, { easing: 'cubicInOut' })
            .start()
        //右侧节点
        cc.tween(showRoleParent.getChildByName(prevId + ""))
            .set({ position: this.leftPos })
            .to(0.25, { position: this.centerPos }, { easing: 'cubicInOut' })
            .call(() => {
                playerIndex == 1 ? this.isTruning1 = false : this.isTruning2 = false;
            })
            .start()
        playerIndex == 1 ? this.middleId1 = prevId : this.middleId2 = prevId;
        this.flushShuXing(playerIndex);
        this.flushButton(playerIndex);
    },

    btnGongNeng(event, ind) {
        let playerIndex = parseInt(ind);
        let functionNode = this.getFunctionButtonById(playerIndex);
        let seledtId = playerIndex == 1 ? this.middleId1 : this.middleId2;
        let data = Types.ActorSkillData[seledtId];
        let boolGold = functionNode.getChildByName("goldNode").active;
        let boolUse = functionNode.getChildByName("使用").active;
        let boolalready = functionNode.getChildByName("使用中").active;

        if (boolGold) {
            let needMoney = data.money
            if (this.playerInfo.gold >= needMoney) {
                GlobalMng.eventOne.dispatchEvent("UpdateGold", -needMoney, true, true);
                this.playerData.addSkin(seledtId, playerIndex);
                this.flushButton(playerIndex);
                this.btnGongNeng(null, playerIndex)
                let anotherOneId = playerIndex == 1 ? 2 : 1;
                if (this.middleId1 == this.middleId2) {
                    this.flushButton(anotherOneId);
                }
            } else {
                this.btnGift();
            }

        } else {
            if (boolUse) {
                functionNode.getChildByName("使用中").active = true;
                functionNode.getChildByName("使用").active = false;
                this.playerData.useSkin(seledtId, playerIndex);
                this.check();
            }
        }
    },

    btnGift() {
        GlobalMng.uiMng.showSharedDialog('ui/panel/GiftPack', cc.find("Canvas").getComponent("Main").UIPanel)
    },



    flushRole(playerIndex) {
        let showRoleParent = this.getSkinParentById(playerIndex);
        if (playerIndex == 1) {
            this.middleId1 = this.playerInfo.curRole1SkinID;
        } else {
            this.middleId2 = this.playerInfo.curRole2SkinID;
        }
        let curId = playerIndex == 1 ? this.middleId1 : this.middleId2;
        let children = showRoleParent.children;
        for (let i = 0; i < children.length; i++) {
            const element = children[i];
            if (element.name == curId) {
                element.setPosition(this.centerPos)
            } else {
                element.setPosition(3000, 3000)
            }

        }

    },


    flushShuXing(playerIndex) {
        let shuxingPanel = this.getShuxingPanelById(playerIndex);
        let seledtId = playerIndex == 1 ? this.middleId1 : this.middleId2;
        //技能图标
        let skillIconSp = shuxingPanel.getChildByName("skillIcon").getComponent(cc.Sprite);
        //人物名字
        let skillNameSp = shuxingPanel.getChildByName("skillName").getComponent(cc.Sprite);
        // 人物秒升
        let skillDetailSp = shuxingPanel.getChildByName("skillDetail").getComponent(cc.Sprite);
        GlobalMng.sceneMng.setSpriteFrameByBundle(`res/actor/skill/技能图片/${Types.ActorSkillData[seledtId].skillBg}`, skillIconSp);
        GlobalMng.sceneMng.setSpriteFrameByBundle(`res/actor/人物名字/${Types.ActorSkillData[seledtId].name}`, skillNameSp);
        GlobalMng.sceneMng.setSpriteFrameByBundle(`res/actor/skill/技能介绍/${Types.ActorSkillData[seledtId].skillBg}`, skillDetailSp);
    },

    flushButton(playerIndex) {
        let functionNode = this.getFunctionButtonById(playerIndex);
        let videoNode = this.getVideoButtonById(playerIndex);
        let seledtId = playerIndex == 1 ? this.middleId1 : this.middleId2;
        let data = Types.ActorSkillData[seledtId];
        functionNode.getChildByName("goldNode").active = false;
        functionNode.getChildByName("使用").active = false;
        functionNode.getChildByName("使用中").active = false;
        //已经拥有
        if (this.playerData.hasSkinById(seledtId)) {
            videoNode.active = false;
            functionNode.getChildByName("使用").active = true;
        } else {
            functionNode.getChildByName("goldNode").active = true;
            videoNode.active = true;
            functionNode.getChildByName("goldNode").getChildByName("labGold").getComponent(cc.Label).string = data.money;
        }
    },


    getSkinParentById(playerIndex) {
        if (playerIndex == 1) {
            return this.rolePanel1.getChildByName("view").getChildByName("content");
        } else {
            return this.rolePanel2.getChildByName("view").getChildByName("content");
        }
    },
    getShuxingPanelById(playerIndex) {
        if (playerIndex == 1) {
            return this.shuxingPanel1;
        } else {
            return this.shuxingPanel2;
        }
    },

    getVideoButtonById(playerIndex) {
        if (playerIndex == 1) {
            return this.rolePanel1.getChildByName("New Node").getChildByName("btnVideo1");
        } else {
            return this.rolePanel2.getChildByName("New Node").getChildByName("btnVideo2");
        }
    },

    getFunctionButtonById(playerIndex) {
        if (playerIndex == 1) {
            return this.rolePanel1.getChildByName("New Node").getChildByName("btnGongNeng");
        } else {
            return this.rolePanel2.getChildByName("New Node").getChildByName("btnGongNeng");
        }
    },



    videoSuccess(btnName) {
        this.isVideo = true;
        if (btnName == "btnVideo1") {
            this.vidoeId = this.middleId;
            this.playerData.addSkin(this.middleId1, 1);
            this.flushButton(1);
            this.btnGongNeng(null, 1);
            if (this.middleId1 == this.middleId2) {
                this.flushButton(2);
            }
        } else {
            this.vidoeId2 = this.middleId;
            this.playerData.addSkin(this.middleId2, 2);
            this.flushButton(2);
            this.btnGongNeng(null, 2);
            if (this.middleId1 == this.middleId2) {
                this.flushButton(1);
            }
        }


    },


    //主要看当前金币够不够买另一个
    checkAnotherOne(playerIndex) {
        let anotherOneId = playerIndex == 1 ? 2 : 1;
        let data = Types.ActorSkillData[anotherOneId];
        let functionNode = this.getFunctionButtonById(anotherOneId);
        let boolGold = functionNode.getChildByName("goldNode").active;
        let boolUse = functionNode.getChildByName("使用").active;
        let boolalready = functionNode.getChildByName("使用中").active;
        if (boolGold) {
            this.flushButton(playerIndex);
        }

    },
    check() {
        let gn1 = this.getFunctionButtonById(1);
        let gn2 = this.getFunctionButtonById(2);
        if (gn1.getChildByName("使用中").active && gn2.getChildByName("使用中").active) {
            this.inGame();
        }
    },


    inGame() {
        GlobalMng.uiMng.showSharedMask();
        this.skeSelect1.active = true;
        this.skeSelect2.active = true;
        let p1 = this.getSkinParentById(1).getChildByName(this.middleId1 + "");
        let p2 = this.getSkinParentById(2).getChildByName(this.middleId2 + "");
        p1.getChildByName("ske").getComponent(sp.Skeleton).setAnimation(0, "选人1", true)
        p2.getChildByName("ske").getComponent(sp.Skeleton).setAnimation(0, "选人1", true)
        let nodes = [p1, p2];
        for (let i = 0; i < nodes.length; i++) {
            cc.tween(nodes[i])
                .to(2, { scale: 0, position: cc.v2(this.centerPos.x, 300) }, { easing: "smooth" })
                .call(() => {
                    this.flyDown();
                })
                .start();
        }
    },

    flyDown() {
        this.flyTimes++;
        if (this.flyTimes >= 2) {
            this.clear();
            GlobalMng.uiMng.hideSharedMask();
            this.closeDirectlyShare();
            GlobalMng.uiMng.loadNextGameScene("game");
        }
    },

    clear() {
        this.skeSelect1.active = false;
        this.skeSelect2.active = false;
        let p1 = this.getSkinParentById(1).getChildByName(this.middleId1 + "");
        let p2 = this.getSkinParentById(2).getChildByName(this.middleId2 + "");
        p1.scale = 1;
        p2.scale = 1;
        p1.getChildByName("ske").getComponent(sp.Skeleton).setAnimation(0, "待机", true)
        p2.getChildByName("ske").getComponent(sp.Skeleton).setAnimation(0, "待机", true)
    },

    //隐藏后回调
    hideSuccess() {
        if (this.isVideo) {
            if (this.vidoeId) {
                this.playerData.removeSkin(vidoeId);
            }
            if (this.vidoeId2) {
                this.playerData.removeSkin(vidoeId2);
            }
          
        }
    },
    // update (dt) {},
});
