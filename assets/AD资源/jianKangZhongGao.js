
cc.Class({
    extends: cc.Component,

    properties: {
        
    },
    // onLoad () {},

    start () {
        if(AD.chanelName1 != "oppo" && AD.chanelName1!="huaWei"&& AD.chanelName1!="QQ"){
            if(cc.winSize.width>cc.winSize.height)//横屏
            this.node.getComponent(cc.Label).string = "健康游戏忠告\n抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。"
            else
            this.node.getComponent(cc.Label).string = "健康游戏忠告\n抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。\n适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。"
     
        }
    },

    // update (dt) {},
});
