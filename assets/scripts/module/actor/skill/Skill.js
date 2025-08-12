
const Types = require('../../../module/data/Types');
const Game = require("Game");
//技能基类
cc.Class({
    extends: cc.Component,

    properties: {
        // 技能名称
        skillName: "UnnamedSkill",
        skillDesc: "技能描述",
        // 持续时间（秒，0 表示瞬发技能）
        duration: {
            default: 0.0,
            type: cc.Float,
            tooltip: "技能持续时间（秒），0 表示瞬发"
        },
        // 冷却时间（秒）
        cooldown: {
            default: 5.0,
            type: cc.Float,
            tooltip: "技能冷却时间（秒）"
        },




    },

    // 初始化技能
    onLoad() {
        this.game = Game.instance;
        // 当前冷却计时
        this.currentCooldown = 0;
        // 是否正在冷却
        this.isOnCooldown = false;
        // 剩余持续时间
        this.remainingDuration = 0;
        // 技能拥有者（例如玩家节点，需外部设置）
        this.owner = null;

    },

    //初始化技能
    initSkill(skillType) {
        this.skillType = skillType;
        this.skillData = Types.ActorSkillData[skillType];
        this.duration = this.skillData.duration;
        this.cooldown = this.skillData.cooldown;
        this.isUseSkillSuccess = false;
        //更换技能图片
        let skillSp = this.node.getChildByName("skillBg").getComponent(cc.Sprite);
        GlobalMng.sceneMng.setSpriteFrameByBundle(`res/actor/skill/技能图片/${this.skillData.skillBg}`, skillSp);
        //更换技能名字
        let skillNameSp = this.node.getChildByName("skillName").getComponent(cc.Sprite);
        GlobalMng.sceneMng.setSpriteFrameByBundle(`res/actor/skill/技能名字/${this.skillData.skillBg}`, skillNameSp);
        //技能冷却进度
        this.skillCoolMask = this.node.getChildByName("skillCool");
        this.skillProgress = this.node.getChildByName("skillProgress").getComponent(cc.Sprite);
        this.reset();

    },

    // 设置技能拥有者
    setOwner(owner) {
        this.owner = owner;
    },

    // 检查技能是否可用
    isAvailable() {
        return !this.isOnCooldown
    },


    // 触发技能
    cast() {
        if (!this.isAvailable()) {
            cc.log(`${this.skillName} 不可用，可能在冷却中或资源不足`);
            return false;
        }
        // 执行技能效果（子类实现）
        this.onCast();

        // 设置冷却
        if (this.cooldown > 0) {
            this.isOnCooldown = true;
            this.currentCooldown = this.cooldown;
            this.skillCoolMask.active = true;
        }

        // 如果是持续技能，设置激活状态
        if (this.duration > 0) {
            this.remainingDuration = this.duration;
        } else {
            // 瞬发技能直接完成
            this.onFinish();
        }

        //技能因为某些原因没有使用成功
        if (!this.isUseSkillSuccess) {
            this.reset();
        }

    },

    // 子类重写：技能具体效果
    onCast() {
        let isLoop = false;
        this.isUseSkillSuccess = true;

        switch (this.skillType) {
            case Types.ActorSkillType.FeiMaoTui:  //飞毛腿
                GlobalMng.audioMng.playEffect("疾跑");
                this.owner.speedUp(this.skillData.addSpeed, this.duration);
                this.owner.openFeiMaoTui();
                break;
            case Types.ActorSkillType.HuanMengGongZhu:  //放置水泡
                GlobalMng.audioMng.playEffect("放置水泡");
                this.owner.freeze();
                this.owner.skillAction(isLoop);
                GlobalMng.uiMng.createGameEffect('actor/skillEffect/水泡', this.game.curMapScript.keyRoot, this.owner.getTrapPos(), "EffectShuiPao", [this.skillData])
                break;
            case Types.ActorSkillType.XiangJIaoXia:  //放置香蕉
                GlobalMng.audioMng.playEffect("点击");
                this.owner.freeze();
                this.owner.skillAction(isLoop);
                GlobalMng.uiMng.createGameEffect('actor/skillEffect/香蕉', this.game.curMapScript.keyRoot, this.owner.getTrapPos(), "EffectShuiPao", [this.skillData])
                break;
            case Types.ActorSkillType.ZhaDanChaoRen:  //投掷炸弹
                GlobalMng.audioMng.playEffect("点击");
                let result = this.game.findNearestMonster(this.owner.node);
                if (result && result[1] <= this.skillData.range) {
                    this.owner.freeze();
                    this.owner.skillAction(isLoop);
                    this.scheduleOnce(() => {
                        GlobalMng.uiMng.createGameEffect('actor/skillEffect/炸弹', this.game.curMapScript.keyRoot, this.owner.getTrapPos(), "EffectShuiPao", [this.skillData, this.owner])
                    }, 0.3)
                } else {
                    this.isUseSkillSuccess = false;
                    GlobalMng.uiMng.showTip("距离怪物超出技能范围", 0.3);
                }
                break;
            case Types.ActorSkillType.RenZhe:  //忍者
                this.owner.spineCtrl.playNewTrack("技能", 1);
                GlobalMng.audioMng.playEffect(`隐身`);
                this.owner.hideSelef();
                break;
            case Types.ActorSkillType.NeZha:  //哪吒
                GlobalMng.audioMng.playEffect(`冲刺`);
                this.charge();
                break;
            case Types.ActorSkillType.WeiLaiZhanShi:  //未来战士
                GlobalMng.audioMng.playEffect(`传送`);
                this.owner.skillAction(isLoop);
                this.owner.openTimeTravel();
                this.owner.freeze();
                this.scheduleOnce(() => {
                    GlobalMng.uiMng.createGameEffect('actor/skillEffect/传送门', this.game.curMapScript.keyRoot, this.owner.getTrapPos(), "EffectShuiPao", [this.skillData, this.owner])
                }, 0.35)
                break;
            case Types.ActorSkillType.CiTieXia:  //磁铁侠
                GlobalMng.audioMng.playEffect("磁铁吸力");
                this.owner.openMagnet();
                this.owner.spineCtrl.playNewTrack("技能", 1);
                break;
        }


    },

    // 子类重写：技能结束时调用
    onFinish() {
        let actionTime = this.owner.spineCtrl.getSkeTotalTime("技能");
        switch (this.skillType) {
            case Types.ActorSkillType.FeiMaoTui:  //飞毛腿
                this.owner.closeFeiMaoTui();
                break;
            case Types.ActorSkillType.HuanMengGongZhu:  //放置水泡
            case Types.ActorSkillType.XiangJIaoXia:  //放置水泡
            case Types.ActorSkillType.ZhaDanChaoRen:  //放置水泡
                this.scheduleOnce(this.skillCallBackThaw, actionTime)
                break;
            case Types.ActorSkillType.RenZhe:  //忍者
                this.owner.spineCtrl._clearTracks(1)
                this.owner.appearSelf();
                break;
            case Types.ActorSkillType.NeZha:  //哪吒
                this.owner.sportAction();
                this.owner.closeForceCharge();
                this.owner.closeChare();
                break;
            case Types.ActorSkillType.WeiLaiZhanShi:  //未来战士
                this.scheduleOnce(this.skillCallBackSprot, actionTime)
                break;
            case Types.ActorSkillType.CiTieXia:  //磁铁侠
                this.owner.spineCtrl._clearTracks(1)
                this.owner.closeMagnet();
                break;
        }
    },


    skillCallBackThaw() {
        this.owner.sportAction();
        this.owner.thaw();
    },

    skillCallBackSprot() {
        this.owner.sportAction();
    },
    // 子类重写：冷却完成时调用
    onCooldownComplete() {
        this.isUseSkillSuccess = false;
    },




    // 获取冷却进度（0 到 1，1 表示冷却完成）
    getCooldownProgress() {
        if (this.cooldown <= 0) return 1;
        return (this.currentCooldown / this.cooldown);
    },


    //技能冲锋
    charge() {
        let dir = this.owner.getCurPayerDir();
        if (dir.x == 0 && dir.y == 0) {
            this.owner.openForceCharge();
        }
        this.owner.speedUp(500, this.skillData.duration);
        this.owner.skillAction(false);
        this.owner.openCharge();
    },

    // 获取技能描述（用于 UI 显示）
    getDescription() {
        return {
            name: this.skillName,
            desc: this.skillDesc,
            cooldown: this.cooldown,
            duration: this.duration,
        };
    },

    // 重置技能状态
    reset() {
        this.currentCooldown = 0;
        this.isOnCooldown = false;
        this.remainingDuration = 0;
        this.skillCoolMask.active = false;
        this.skillProgress.fillRange = 0;

    },
    resetSkillState() {
        switch (this.skillType) {
            case Types.ActorSkillType.FeiMaoTui:  //飞毛腿
                this.owner.closeFeiMaoTui();
                break;
            case Types.ActorSkillType.NeZha:  //哪吒
                this.owner.closeForceCharge();
                this.owner.closeChare();
                break;
            case Types.ActorSkillType.CiTieXia:  //磁铁侠
                this.owner.spineCtrl._clearTracks(1)
                this.owner.closeMagnet();
                break;
        }
        this.unschedule(this.skillCallBackThaw);
        this.unschedule(this.skillCallBackSprot);
    },
    // 更新技能状态（每帧调用）
    update(dt) {
        // 更新冷却时间
        if (this.isOnCooldown) {
            this.currentCooldown -= dt;
            if (this.currentCooldown <= 0) {
                this.isOnCooldown = false;
                this.skillCoolMask.active = false;
                this.skillProgress.fillRange = 0;
                this.currentCooldown = 0;
                this.onCooldownComplete();
            } else {
                this.skillProgress.fillRange = this.getCooldownProgress();
            }
        }

        // 更新持续时间
        if (this.remainingDuration > 0) {
            this.remainingDuration -= dt;
            if (this.remainingDuration <= 0) {
                this.remainingDuration = 0;
                this.onFinish();
            }
        }


    },


});