/**
 * 
 *  掉落的修复道具 碰撞 tag= 10
 *  破损道具 碰撞 tag= 20
 */
module.exports = {
    VERSION: '1.0.0',

    //本地缓存KEY值
    LOCAL_CACHE: {
        PLAYER: 'player', //玩家基础数据缓存，如金币砖石等信息，暂时由客户端存储，后续改由服务端管理
        SETTINGS: 'settings', //设置相关，所有杂项都丢里面进去
        DATA_VERSION: 'dataVersion', //数据版本
    },


    ZORDER: {
        ACTOR: 5,   //角色、玩家 
        FIGHT_NUM: 50, //战斗数字特效 魔法数字
        GAME_MESSAGE: 100,  //游戏中的文字弹窗
        DIALOG: 500, //普通UI弹窗
        TIPS: 1000, //提示框
        ZMAX: 9999, //提示框
    },

    TIMER_KEY: {

    },

};