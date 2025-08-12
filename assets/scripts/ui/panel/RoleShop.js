
const Types = require("../../module/data/Types")
const MAXID = 8;
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
        skillNameSp: cc.Sprite,
        skillDetailSp: cc.Sprite,
        skillIconSp: cc.Sprite,
        rolePanel: cc.Node,

        //按钮
        gongengNode: cc.Node,
        videoNode: cc.Node,
        skeSelect: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onEnable() {
        AD.chaPing();
    },
    onLoad() {
        this._super();
        this.leftPos = cc.v2(-256, -182);
        this.centerPos = cc.v2(0, -218);
        this.rightPos = cc.v2(256, -182);
        this.playerData = GlobalMng.playerData;
        this.playerInfo = GlobalMng.playerData.playerInfo;
    },

    show(...args) {
        this.isVideo = false;
        this.vidoeId = null;
        this._super();
        this.isTruning = false;
        this.middleId = this.playerInfo.curRole1SkinID;
        this.getShowNode();

    },

    getShowNode() {
        this.flushSkinId();
        this.rolePanel.getChildByName(this.middleId + "").setPosition(this.centerPos);
        this.rolePanel.getChildByName(this.prevId + "").setPosition(this.leftPos);
        this.rolePanel.getChildByName(this.nextId + "").setPosition(this.rightPos);
        for (let index = 0; index < this.rolePanel.children.length; index++) {
            const id = this.rolePanel.children[index].name;
            if (id != this.middleId && id != this.prevId && id != this.nextId) {
                this.rolePanel.children[index].x = 5000; //不可见
            }
        }
    },

    flushSkinId() {
        this.prevId2 = ((this.middleId - 3 + MAXID) % MAXID) + 1;
        this.prevId = ((this.middleId - 2 + MAXID) % MAXID) + 1;
        this.nextId = ((this.middleId + 0) % MAXID) + 1;
        this.nextId2 = ((this.middleId + 1) % MAXID) + 1;
        this.flushShuXing();
        this.flushButton();
    },

    flushShuXing() {
        GlobalMng.sceneMng.setSpriteFrameByBundle(`res/actor/skill/技能图片/${Types.ActorSkillData[this.middleId].skillBg}`, this.skillIconSp);
        GlobalMng.sceneMng.setSpriteFrameByBundle(`res/actor/人物名字/${Types.ActorSkillData[this.middleId].name}`, this.skillNameSp);
        GlobalMng.sceneMng.setSpriteFrameByBundle(`res/actor/skill/技能介绍/${Types.ActorSkillData[this.middleId].skillBg}`, this.skillDetailSp);
    },
    flushButton() {
        this.gongengNode.getChildByName("goldNode").active = false;
        this.gongengNode.getChildByName("使用").active = false;
        //已经拥有
        if (this.playerData.hasSkinById(this.middleId)) {
            this.videoNode.active = false;
            this.gongengNode.getChildByName("使用").active = true;
        } else {
            this.gongengNode.getChildByName("goldNode").active = true;
            this.videoNode.active = true;
            this.gongengNode.getChildByName("goldNode").getChildByName("labGold").getComponent(cc.Label).string = Types.ActorSkillData[this.middleId].money;

        }
    },
    btnNext() {
        if (this.isTruning) return
        this.isTruning = true;

        //中间移-->左边
        cc.tween(this.rolePanel.getChildByName(this.middleId + ""))
            .to(0.25, { position: this.leftPos }, { easing: 'cubicInOut' })
            .start()
        //左边移出
        cc.tween(this.rolePanel.getChildByName(this.prevId + ""))
            .to(0.25, { position: cc.v2(this.leftPos.x - 400, this.leftPos.y) }, { easing: 'cubicInOut' })
            .start()
        //右边移-->中间
        cc.tween(this.rolePanel.getChildByName(this.nextId + ""))
            .to(0.25, { position: this.centerPos }, { easing: 'cubicInOut' })
            .start()
        //右侧第二个移-->右边
        cc.tween(this.rolePanel.getChildByName(this.nextId2 + ""))
            .set({ position: cc.v2(this.rightPos.x + 400, this.rightPos.y) })
            .to(0.25, { position: this.rightPos }, { easing: 'cubicInOut' })
            .call(() => {
                this.isTruning = false;
            })
            .start()

        this.middleId++;
        this.middleId = this.middleId > MAXID ? 1 : this.middleId;
        this.flushSkinId();

    },
    btnPrev() {
        if (this.isTruning) return;
        this.isTruning = true;

        // 中间移-->右边
        cc.tween(this.rolePanel.getChildByName(this.middleId + ""))
            .to(0.25, { position: this.rightPos }, { easing: 'cubicInOut' })
            .start();
        // 右边移出
        cc.tween(this.rolePanel.getChildByName(this.nextId + ""))
            .to(0.25, { position: cc.v2(this.rightPos.x + 400, this.rightPos.y) }, { easing: 'cubicInOut' })
            .start();
        // 左边移-->中间
        cc.tween(this.rolePanel.getChildByName(this.prevId + ""))
            .to(0.25, { position: this.centerPos }, { easing: 'cubicInOut' })
            .start();
        // 左侧第二个移-->左边
        cc.tween(this.rolePanel.getChildByName(this.prevId2 + ""))
            .set({ position: cc.v2(this.leftPos.x - 400, this.leftPos.y) })
            .to(0.25, { position: this.leftPos }, { easing: 'cubicInOut' })
            .call(() => {
                this.isTruning = false;
            })
            .start();this.playerData

        this.middleId--;
        this.middleId = this.middleId <= 0 ? MAXID : this.middleId;
        this.flushSkinId();
    },




    videoSuccess(btnName) {
        this.isVideo = true;
        this.vidoeId = this.middleId;
        this.playerData.addSkin(this.middleId, 1);
        this.flushSkinId();
    },

    btnGongNeng() {
        let boolGold = this.gongengNode.getChildByName("goldNode").active;
        let boolUse = this.gongengNode.getChildByName("使用").active;
        if (boolGold) {
            let needMoney = Types.ActorSkillData[this.middleId].money
            if (this.playerInfo.gold >= needMoney) {
                GlobalMng.eventOne.dispatchEvent("UpdateGold", -needMoney, true, true);
                this.playerData.addSkin(this.middleId, 1);
                this.flushSkinId();
            } else {
                this.btnGift();
            }

        } else {
            if (boolUse) {
                this.playerData.useSkin(this.middleId, 1);
                this.inGame();
            }
        }

    },
    btnGift() {
        GlobalMng.uiMng.showSharedDialog('ui/panel/GiftPack', cc.find("Canvas").getComponent("Main").UIPanel);
    },

    inGame() {
        GlobalMng.uiMng.showSharedMask();
        this.skeSelect.active = true;
        this.rolePanel.getChildByName(this.middleId + "").getComponent(sp.Skeleton).setAnimation(0, "选人1", true);
        cc.tween(this.rolePanel.getChildByName(this.middleId + ""))
            .to(2, { scale: 0, position: cc.v2(0, 235) }, { easing: "quadIn" })
            .call(() => {
                this.clear();
                GlobalMng.uiMng.hideSharedMask();
                this.closeDirectlyShare();
                GlobalMng.uiMng.loadNextGameScene("game");
            })
            .start()

    },

    clear() {
        this.rolePanel.getChildByName(this.middleId + "").getComponent(sp.Skeleton).setAnimation(0, "待机", true);
        this.skeSelect.active = false;
        this.rolePanel.getChildByName(this.middleId + "").scale = 3;
    },
    //隐藏后回调
    hideSuccess() {
        if (this.isVideo) {
            if (this.vidoeId) {
                this.playerData.removeSkin(this.vidoeId);
            }   
        }
    },
    // update (dt) {},
});
