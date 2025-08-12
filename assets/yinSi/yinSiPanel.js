

cc.Class({
    extends: cc.Component,

    properties: {
        dialogYinSi: cc.Node,
        zhuTiCfg: {
            default: [],
            type: [cc.String],
            displayName: "主体配置(如:QQ,北京)"
        },

        btnAgree1: cc.Node,
        btnNotAgree: cc.Node,
        btnClose1: cc.Node,
        adressQQ: cc.Label,
        keFuQQ: cc.Label,
        yinSiSpr: cc.Sprite,
        zhuTiNameLabel: cc.Label,
        gameNameLabel: cc.Label,
    },

    onLoad() {
        this.zhuTiName = "石家庄玩呗网络科技有限公司";
        this.gameName = "双人后室逃生";

        this.zhuTiNameLabel.string = "主体名称:" + this.zhuTiName;
        this.gameNameLabel.string = "游戏名称:" + this.gameName;

        this.key = this.gameName;

        window.key_yinSi = AD.chanelName1 + "keyYinSi2" + this.key;
        window.showYinSi = false;
        this.dialogYinSi.active = false;
        AD.hadAgreenYinSi = false;


        this.adressQQ.node.active = (AD.chanelName1 == "QQ");
        this.keFuQQ.node.active = (AD.chanelName1 == "QQ");



    },

    start() {

        if (window.showYinSi) {//已经 弹过了
            this.dialogYinSi.active = false;
            // if (AD.delayTime > 0)
            this.checkPermission();
        }
        else {//还没有首次弹出过
            this.dialogYinSi.active = true;
        }

    },


    onEnable() {
        this.resetBtn();
    },
    resetBtn() {
        window.showYinSi = false;
        if (cc.sys.localStorage.getItem(window.key_yinSi) == 1)
            window.showYinSi = true;

        if (window.showYinSi) {
            this.btnClose1.active = true;
            this.btnAgree1.active = false;
            this.btnNotAgree.active = false;
        }
        else {
            this.btnClose1.active = false;
            this.btnAgree1.active = true;
            this.btnNotAgree.active = true;
        }

    },
    btnCallBack(event, type) {
        // if (AD.chanelName == "android") {
        //     if (cc.sys.os == cc.sys.OS_ANDROID) {
        //         jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showYinSi", "(Ljava/lang/String;)V", "申请权限");
        //     }
        // }
        // else 
        {
            this.dialogYinSi.active = true;

            this.resetBtn();
        }
    },

    //android 申请权限
    checkPermission() {
        AD.hadAgreenYinSi = true;
        if (AD.chanelName == "android") {
            console.log("初始化")
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "checkPermission", "(Ljava/lang/String;)V", "申请权限");
            }
        }
        if (AD.chanelName1 == "huaWei")
            AD_HuaWei.initSucess = true;
    },
    // update (dt) {},
});
