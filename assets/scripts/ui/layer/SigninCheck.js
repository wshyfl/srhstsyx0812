// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
const Main = require("Main")
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
        this.oneDay = this.timeStamp(GlobalMng.playerData.playerInfo.signTime);
        let isCanSign = false;
        if (GlobalMng.playerData.playerInfo.signData[this.oneDay - 1] == false) {
            //可以签到
            isCanSign = true;
        }

        for (let i = 0; i < this.oneDay; i++) {
            if (GlobalMng.playerData.playerInfo.signData[i] == false) {
                //可以签到
                isCanSign = true;
            }
        }

        if (isCanSign && GlobalMng.playerData.playerInfo.isFirstInGame == false) {
            Main.instance.btnMenu(null, 3)
        }
    },
    // update (dt) {},
});
