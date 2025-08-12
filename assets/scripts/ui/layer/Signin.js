// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
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
        rootNode: cc.Node
    },


    timeStamp: function (time) {
        let dateNow = new Date().getTime();
        dateNow = dateNow - time;
        dateNow = dateNow / 1000; //秒
        dateNow = dateNow / 60; //分
        dateNow = dateNow / 60; //时
        dateNow = dateNow / 24; //天
        //第2天
        if (dateNow < 1) {
            dateNow = 1;
        } else if (dateNow >= 1 && dateNow < 2) {
            dateNow = 2;
        } else if (dateNow >= 2 && dateNow < 3) { //第3天
            dateNow = 3;
        } else if (dateNow >= 3 && dateNow < 4) { //第4天
            dateNow = 4;
        } else if (dateNow >= 4 && dateNow < 5) { //第5天
            dateNow = 5;
        } else if (dateNow >= 5 && dateNow < 6) { //第6天
            dateNow = 6;
        } else if (dateNow >= 6 && dateNow < 7) { //第7天
            dateNow = 7;
        } else if (dateNow > 7) {
            dateNow = 7;
            // dateNow = 1;
            // this.retSign();
        }
        return dateNow;
    },

    onLoad() {
        this.node.zIndex = -1;
        GlobalMng.uiMng.showPopup(this.node.getChildByName("root"));
        this.dayMoney = [500, 500, 800, 800, 1000, 1000, 0];
        this.oneDay = this.timeStamp(GlobalMng.playerData.playerInfo.signTime);


        //刷新7天界面
        for (let i = 1; i <= 7; i++) {
            let dayNode = this.rootNode.getChildByName(`day${i}`);
            let index = i - 1;

            if (this.dayMoney[index] > 0) {
                //刷新钱
                dayNode.getChildByName("图标").getChildByName("labMoney").getComponent(cc.Label).string = this.dayMoney[index];
            }

            //先取消选择
            dayNode.getChildByName("bgselect").active = false;
            //刷新遮罩
            dayNode.getChildByName("遮罩1").active = GlobalMng.playerData.playerInfo.signData[index];
        }


        if (GlobalMng.playerData.playerInfo.signData[this.oneDay - 1] == false) {
            this.rootNode.getChildByName(`day${this.oneDay}`).getChildByName("bgselect").active = true;

        }

        for (let i = 0; i < this.oneDay; i++) {
            if (GlobalMng.playerData.playerInfo.signData[i] == false) {
                this.rootNode.getChildByName(`day${i + 1}`).on(cc.Node.EventType.TOUCH_END, () => {
                    this.touchDay(i + 1); // 传递 i 参数
                }, this);
            }
        }
    },

    start(){
        AD.chaPing();
        AD.showBanner();
    },


    touchDay(oneDay) {
        if (oneDay == 7) {
            if (GlobalMng.playerData.isHasSkinById(8) == false) {
                GlobalMng.playerData.addSkin(8);
            }
        } else {
            GlobalMng.eventOne.dispatchEvent("UpdateGold", this.dayMoney[oneDay - 1], true, true, { minGold: 200, maxGold: 300, scoreDur: 0.5 });
        }
        this.rootNode.getChildByName(`day${oneDay}`).off(cc.Node.EventType.TOUCH_END, this.touchDay, this);
        this.rootNode.getChildByName(`day${oneDay}`).getChildByName("遮罩1").active = true;
        this.rootNode.getChildByName(`day${oneDay}`).getChildByName("bgselect").active = false;
        GlobalMng.playerData.playerInfo.signData[oneDay - 1] = true;
        GlobalMng.playerData.savePlayerInfoToLocalCache();

    },
    btnClonse() {
        this.node.destroy();
    },

    retSign() {
        let firtInTime = new Date().getTime();
        let signData = [false, false, false, false, false, false, false];
        //从新更新一周签到时间
        GlobalMng.playerData.playerInfo.signTime = firtInTime;
        GlobalMng.playerData.playerInfo.signData = signData;
        GlobalMng.playerData.savePlayerInfoToLocalCache();
    },
    onDisable(){
        AD.hideBanner();
    },
    // update (dt) {},
});
