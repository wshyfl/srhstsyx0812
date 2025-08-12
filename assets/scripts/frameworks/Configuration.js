const KEY_CONFIG = "HeiAnTaoLi20250711133849";

var Configuration = cc.Class({
    statics: {
        instance: null,

        /**
         * 获取 Configuration 单例
         * 如果不存在则创建一个新的实例
         * @returns {Configuration} Configuration 实例
         */
        getInstance() {
            if (!this.instance) {
                this.instance = new Configuration();
                this.instance.onLoad();
            }
            return this.instance;
        }
    },

    /**
     * 初始化配置数据并加载本地存储的配置
     */
    onLoad() {
        // 默认配置数据
        this.jsonData = {
            "userId": "",
            "lastSaveTime": 0,
            "music": true,
            "sound": true,
            "vibrate": true
        };

        // 获取配置文件路径
        this.path = this.getConfigPath();

        // 加载本地存储的配置数据
        let content;
        if (cc.sys.isNative) {
            let valueObject = jsb.fileUtils.getValueMapFromFile(this.path);
            content = valueObject[KEY_CONFIG];
        } else {
            content = cc.sys.localStorage.getItem(KEY_CONFIG);
        }

        if (content && content.length) {
            // 移除首字符 '@'（如有）
            if (content.startsWith('@')) {
                content = content.substring(1);
            }

            // 解析 JSON 数据
            try {
                this.jsonData = JSON.parse(content);
            } catch (exception) {
                console.error("Error parsing JSON data:", exception);
            }
        }

        // 设置保存标志和自动保存计时器
        this.markSave = false;
        this.saveTimer = setInterval(() => {
            this.scheduleSave();
        }, 500);
    },

    /**
     * 设置配置数据（不触发自动保存）
     * @param {string} key 键
     * @param {any} value 值
     */
    setConfigDataWithoutSave(key, value) {
        let account = this.jsonData.userId;
        if (this.jsonData[account]) {
            this.jsonData[account][key] = value;
        } else {
            console.error("No account, cannot save.");
        }
    },

    /**
     * 设置配置数据，并标记为已修改，触发自动保存
     * @param {string} key 键
     * @param {any} value 值
     */
    setConfigData(key, value) {
        this.setConfigDataWithoutSave(key, value);
        this.markSave = true;
    },

    /**
     * 获取配置数据
     * @param {string} key 键
     * @returns {any} 值
     */
    getConfigData(key) {
        let account = this.jsonData.userId;
        if (this.jsonData[account]) {
            return this.jsonData[account][key] || "";
        } else {
            console.log("No account, cannot load.");
            return "";
        }
    },

    /**
     * 设置全局数据并立即保存
     * @param {string} key 键
     * @param {any} value 值
     */
    setGlobalData(key, value) {
        this.jsonData[key] = value;
        this.save();
    },

    /**
     * 获取全局数据
     * @param {string} key 键
     * @returns {any} 值
     */
    getGlobalData(key) {
        return this.jsonData[key];
    },

    /**
     * 设置用户ID并初始化用户数据
     * @param {string} userId 用户ID
     */
    setUserId(userId) {
        this.jsonData.userId = userId;
        if (!this.jsonData[userId]) {
            this.jsonData[userId] = {};
        }
        this.save();
    },

    /**
     * 获取用户ID
     * @returns {string} 用户ID
     */
    getUserId() {
        return this.jsonData.userId;
    },

    /**
     * 定时保存配置数据
     */
    scheduleSave() {
        if (this.markSave) {
            this.save();
        }
    },

    /**
     * 标记配置为已修改
     */
    markModified() {
        this.markSave = true;
    },

    /**
     * 保存配置数据到本地
     */
    save() {
        let zipStr = JSON.stringify(this.jsonData);
        this.markSave = false;

        if (!cc.sys.isNative) {
            cc.sys.localStorage.setItem(KEY_CONFIG, zipStr);
            return;
        }

        let valueObj = {};
        valueObj[KEY_CONFIG] = zipStr;
        jsb.fileUtils.writeToFile(valueObj, this.path);
    },

    /**
     * 获取上次保存的时间差（单位：秒）
     * @returns {number} 时间差（秒）
     */
    getTimeDifference() {
        const currentTime = Date.now();
        const lastSaveTime = this.jsonData.lastSaveTime || currentTime;
        return (currentTime - lastSaveTime) / 1000;
    },

    /**
     * 获取配置文件路径
     * @returns {string} 配置文件路径
     */
    getConfigPath() {
        if (cc.sys.platform === cc.sys.OS_WINDOWS) {
            return "src/conf";
        } else if (cc.sys.platform === cc.sys.OS_LINUX) {
            return "./conf";
        } else if (cc.sys.isNative) {
            return jsb.fileUtils.getWritablePath() + "conf";
        } else {
            return "src/conf";
        }
    },

    /**
     * 解析 URL 参数并存储
     * @param {string | object} paramStr URL 参数字符串或对象
     */
    parseUrl(paramStr) {
        if (!paramStr || (typeof paramStr === 'string' && paramStr.length <= 0)) {
            return;
        }

        let dictParam = {};
        if (typeof paramStr === 'string') {
            try {
                let searchParams = new URLSearchParams(paramStr.split('?')[1]);
                searchParams.forEach((value, key) => {
                    dictParam[key] = value;
                });
            } catch (error) {
                console.error("Failed to parse URL parameters:", error);
            }
        } else {
            dictParam = paramStr;
        }

        if (dictParam.action) this.setGlobalData('urlParams', dictParam);
        if (dictParam.source) this.setGlobalData('source', dictParam.source);
        if (dictParam.adchannelid) this.setGlobalData('adchannelid', dictParam.adchannelid);
    },

    /**
     * 生成随机访客账号
     * @returns {string} 访客账号
     */
    generateGuestAccount() {
        return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    },

    /**
     * 清除所有配置数据
     */
    clearData() {
        this.jsonData = { "userId": "", "lastSaveTime": 0 };
        this.save();
    },

    /**
     * 清除当前用户信息
     */
    clearInfo() {
        this.jsonData[this.jsonData.userId] = {};
        this.jsonData.lastSaveTime = 0;
        this.save();
    },
});

module.exports = Configuration.getInstance();
