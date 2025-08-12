class JSONConfigManager {
    constructor() {
        if (!JSONConfigManager.instance) {
            this.configs = {}; // 存储加载的配置数据
            JSONConfigManager.instance = this;
        }
        return JSONConfigManager.instance;
    }


    loadAllJson() {
        this.etConfig = this.getConfig("EnergyTable");

    }


    loadLevelTableById(value, idx) {
        // 获取符合条件的数据项数组
        const result = this.queryByField("LevelTable", "Level", value);
        // 检查 idx 是否在有效范围内
        if (idx < 0 || idx >= result.length) {
            console.error(`Index ${idx} is out of bounds. Valid range is 0 to ${result.length - 1}.`);
            return null;
        }

        // 返回指定索引的项
        return result[idx];
    }
    /**
     * 根据指定字段和字段值查询配置数据
     * @param {string} configName - 配置数据的名称（文件名）
     * @param {string} field - 查询字段
     * @param {any} value - 查询字段的值
     * @returns {Array} - 返回符合条件的数据项组成的数组
     */

    queryByField(configName, field, value) {
        const config = this.getConfig(configName);
        if (!config) {
            console.error(`Config '${configName}' not found.`);
            return [];
        }

        return config.filter(item => item[field] === value);
    }

    /**
     * 加载指定路径的 JSON 配置文件。
     * @param {string} filePath - JSON 文件路径
     * @param {Function} callback - 加载完成后的回调函数，可选
     */
    loadJSON(filePath, callback) {
        cc.resources.load("datas/" + filePath, (err, jsonAsset) => {
            if (err) {
                console.error(`Failed to load JSON file: ${filePath}`);
                return;
            }

            try {
                const jsonConfig = jsonAsset.json;
                const fileName = cc.path.basename(filePath, '.json');
                this.configs[fileName] = jsonConfig;
               // console.log(`JSON file loaded successfully: ${filePath}`);
                if (callback) {
                    callback(jsonConfig);
                }
            } catch (error) {
                console.error(`Error parsing JSON file: ${filePath}`);
                console.error(error);
            }
        });
    }

    /**
     * 加载多个 JSON 配置文件。
     * @param {Array} fileNames - 要加载的 JSON 文件名数组
     * @param {Function} callback - 加载完成后的回调函数，可选
     */
    loadJSONs(fileNames, callback) {
        if (fileNames.length == 0) {
            if (callback) {
                callback();
            }
            return
        }
        const loadedConfigs = {};
        let loadedCount = 0;
        const totalFiles = fileNames.length;

        fileNames.forEach(fileName => {
            this.loadJSON(fileName, jsonConfig => {
                loadedConfigs[fileName] = jsonConfig;
                loadedCount++;

                if (loadedCount === totalFiles && callback) {
                    callback(loadedConfigs);
                }
            });
        });
    }

    /**
     * 获取指定名称的配置数据。
     * @param {string} configName - 配置数据的名称（文件名）
     * @returns {object|null} - 返回对应的 JSON 数据，如果不存在则返回 null
     */
    getConfig(configName) {
        return this.configs[configName] || null;
    }

    /**
     * 查询指定配置数据中符合条件的数据项。
     * @param {string} configName - 配置数据的名称（文件名）
     * @param {Function} filterFn - 过滤函数，返回 true 表示符合条件的数据项
     * @returns {Array} - 返回符合条件的数据项组成的数组
     */
    queryConfig(configName, filterFn) {
        const config = this.getConfig(configName);
        if (!config) {
            console.error(`Config '${configName}' not found.`);
            return [];
        }

        return config.filter(filterFn);
    }

    /**
     * 根据键值对查询指定配置数据中的数据项。
     * @param {string} configName - 配置数据的名称（文件名）
     * @param {object} queryObj - 包含键值对的对象，用于查询
     * @returns {Array} - 返回符合键值对条件的数据项组成的数组
     */
    queryByKeyValuePair(configName, queryObj) {
        const config = this.getConfig(configName);
        if (!config) {
            console.error(`Config '${configName}' not found.`);
            return [];
        }

        return config.filter(item => {
            for (const key in queryObj) {
                if (item[key] !== queryObj[key]) {
                    return false;
                }
            }
            return true;
        });
    }


    /**
     * 从字符串中提取“-”左右两侧的值，并返回它们之间的随机值（包含边界）。
     * @param {String} str - 输入格式为 "左值-右值" 的字符串。
     * @returns {Number} 返回在左右值之间的随机数。
     */
    _getRandStrLeftRight(str) {
        if (!str || typeof str !== 'string') {
            throw new Error('输入必须是一个格式为 "左值-右值" 的字符串');
        }
        // 使用 "-" 分割字符串
        const parts = str.split('-');
        if (parts.length !== 2) {
            throw new Error('输入字符串格式错误，应为 "左值-右值"');
        }

        // 将分割后的部分转为数字
        const left = parseFloat(parts[0]);
        const right = parseFloat(parts[1]);

        if (isNaN(left) || isNaN(right)) {
            throw new Error('左右值必须是有效的数字');
        }

        if (left > right) {
            throw new Error('左值不能大于右值');
        }

        // 生成并返回随机数
        return _.random(left, right)
    }

}

const instance = new JSONConfigManager();
Object.freeze(instance);
module.exports = instance;
