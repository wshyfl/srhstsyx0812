// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
const Configuration = require('Configuration');
const Constants = require('../module/data/Constants');
const Types = require('../module/data/Types');

const PlayerData = cc.Class({

    // LIFE-CYCLE CALLBACKS:
    start() {

    },

    loadFromCache() {
        //读取玩家基础数据
        this.playerInfo = this.loadDataByKey(Constants.LOCAL_CACHE.PLAYER);
        this.settings = this.loadDataByKey(Constants.LOCAL_CACHE.SETTINGS);
    },

    loadDataByKey(keyName) {
        let ret = {};
        let str = Configuration.getConfigData(keyName);
        if (str) {
            try {
                ret = JSON.parse(str);
            } catch (e) {
                ret = {};
            }
        }
        return ret;
    },


    //首创建玩家数据
    createPlayerInfo(loginData) {
        this.playerInfo = {};
        this.playerInfo.gold = 0;
        this.playerInfo.roleSkinDataID = [Types.ActorSkillType.FeiMaoTui, Types.ActorSkillType.HuanMengGongZhu];
        this.playerInfo.curRole1SkinID = Types.ActorSkillType.FeiMaoTui;
        this.playerInfo.curRole2SkinID = Types.ActorSkillType.HuanMengGongZhu;
        this.playerInfo.mapRecord = [0, 0, 0, 0];
        this.playerInfo.lock = {
            "HouShi": false,     //后室
            "MapPark": false,    //游乐场
            "MapSchool": true,    //幼儿园
            "MapHospital": true,    //医院
        };
        this.playerInfo.createDate = new Date(); //记录创建时间
        this.playerInfo.hasSeenGuide = false; //是否已经看过新手引导
        this.playerInfo.hasSeenJuqing = false;
        this.savePlayerInfoToLocalCache();
    },


    juqingComplete() {
        this.playerInfo.hasSeenJuqing = true;
        this.savePlayerInfoToLocalCache();
    },

    guiComplete() {
        this.playerInfo.hasSeenGuide = true;
        this.savePlayerInfoToLocalCache();
    },


    addSkin(skinId, playerIndex) {
        if (playerIndex == 1) {
            this.playerInfo.curRole1SkinID = skinId;
        } else {
            this.playerInfo.curRole2SkinID = skinId;
        }
        this.playerInfo.roleSkinDataID.push(skinId);
        this.savePlayerInfoToLocalCache();
    },

    removeSkin(skinId) {
        _.removeItem(this.playerInfo.roleSkinDataID, skinId)
        this.savePlayerInfoToLocalCache();
    },

    useSkin(skinId, playerIndex) {
        if (playerIndex == 1) {
            this.playerInfo.curRole1SkinID = skinId;
        } else {
            this.playerInfo.curRole2SkinID = skinId;
        }
        this.savePlayerInfoToLocalCache();
    },

    recordTime(curMap, gameRunTime) {
        switch (curMap) {
            case Types.MapName.MapPark:
                if (gameRunTime < this.playerInfo.mapRecord[0] || this.playerInfo.mapRecord[0] == 0) {
                    this.playerInfo.mapRecord[0] = gameRunTime;
                }
                break;
            case Types.MapName.MapSchool:
                if (gameRunTime < this.playerInfo.mapRecord[1] || this.playerInfo.mapRecord[1] == 0) {
                    this.playerInfo.mapRecord[1] = gameRunTime;
                }
                break;
            case Types.MapName.MapHospital:
                if (gameRunTime < this.playerInfo.mapRecord[2] || this.playerInfo.mapRecord[2] == 0) {
                    this.playerInfo.mapRecord[2] = gameRunTime;
                }
                break;
            case Types.MapName.HouShi:
                if (gameRunTime < this.playerInfo.mapRecord[3] || this.playerInfo.mapRecord[3] == 0) {
                    this.playerInfo.mapRecord[3] = gameRunTime;
                }
                break;
        }
        this.savePlayerInfoToLocalCache();
    },

    /**
     * 保存玩家数据
     */
    savePlayerInfoToLocalCache() {
        this.addDataVersion();
        Configuration.setConfigData(Constants.LOCAL_CACHE.PLAYER, JSON.stringify(this.playerInfo));
    },


    hasSkinById(id) {
        if (!this.playerInfo || !this.playerInfo.roleSkinDataID) {
            console.error("playerInfo or roleSkinDataID is undefined");
            return false;
        }
        return this.playerInfo.roleSkinDataID.includes(Number(id));
    },

    /**
     * 新增数据版本
     */
    addDataVersion() {
        let today = new Date().toLocaleDateString();
        let isAdd = false;
        if (this.dataVersion && typeof (this.dataVersion) === 'string') {
            var arrVersion = this.dataVersion.split('@');
            if (arrVersion.length >= 2) {
                if (arrVersion[0] === today) {
                    this.dataVersion = today + '@' + (Number(arrVersion[1]) + 1);
                    isAdd = true;
                }
            }
        }
        if (!isAdd) {
            this.dataVersion = today + '@1';
        }
        Configuration.setConfigDataWithoutSave(Constants.LOCAL_CACHE.DATA_VERSION, this.dataVersion);
    },

    /**
     * 当数据同步完毕，即被覆盖的情况下，需要将数据写入到本地缓存，以免数据丢失
     */
    saveAll() {
        Configuration.setConfigDataWithoutSave(Constants.LOCAL_CACHE.PLAYER, JSON.stringify(this.playerInfo));
        Configuration.setConfigDataWithoutSave(Constants.LOCAL_CACHE.SETTINGS, JSON.stringify(this.settings));
        Configuration.setConfigData(Constants.LOCAL_CACHE.DATA_VERSION, this.dataVersion);
    },


    clear() {
        this.createPlayerInfo();
        Configuration.save();
    },
});

var shareData = new PlayerData();
shareData.start();
module.exports = shareData;