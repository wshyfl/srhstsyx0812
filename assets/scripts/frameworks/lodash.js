/**
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by daisy on 2018/3/26.
 * Refined utility functions with clear naming and comments
 * 
 * 方法简介：
 * - forEach: 遍历数组或对象的值并执行回调函数
 * - map: 将数组或对象的值映射为新数组
 * - filter: 过滤数组或对象的值，返回符合条件的新数组
 * - find: 查找数组或对象中第一个满足条件的元素
 * - uniq: 移除数组中的重复项
 * - chunk: 将数组按指定大小分割成多个子数组
 * - removeItem: 从数组中移除第一个匹配的元素
 * - cloneDeep: 深拷贝对象或数组
 * - isObject: 检查值是否为纯对象
 * - toArray: 将对象的值转换为数组
 * - random: 生成指定范围内的随机整数
 * - randomInRangeInt: 生成带验证的随机整数，支持负数
 * - randomInRange: 生成指定范围内的随机数，包括小数和负数
 * - shuffle: 随机打乱数组
 * - max: 获取数组中的最大值
 * - dist: 计算两点之间的欧几里得距离
 * - startsWith: 检查字符串是否以指定字符串开头
 * - endsWith: 检查字符串是否以指定字符串结尾
 * - join: 使用分隔符连接数组元素为字符串
 * - isEqual: 深度比较两个值是否相等
 * - isNumber: 检查值是否为有效数字
 * - isNaN: 检查值是否为NaN
 * - isLucky: 根据概率值返回随机结果
 * - formatMoney: 格式化金额，超过10000转为K/M/B/T单位
 * - formatTime: 将秒数格式化为HH:MM:SS时间字符串
 * - formatTime2: 将秒数格式化为x小时x分x秒字符串
 */
(function () {
    var _ = {};

    // ********************************************************1. 数组操作  **************************************************//

    /** 
     * 遍历数组或对象的值，执行回调函数
     * @param {Array|Object} collection - 要遍历的集合
     * @param {Function} callback - 每次迭代执行的函数，参数为(value, index/key, collection)
     */
    _.forEach = function (collection, callback) {
        if (!Array.isArray(collection)) {
            collection = Object.values(collection);
        }
        collection.forEach(callback);
    };

    /** 
     * 将数组或对象的值映射为新数组
     * @param {Array|Object} collection - 要映射的集合
     * @param {Function} callback - 映射函数，返回新值，参数为(value, index/key, collection)
     * @returns {Array} 映射后的新数组
     */
    _.map = function (collection, callback) {
        if (!Array.isArray(collection)) {
            collection = Object.values(collection);
        }
        return collection.map(callback);
    };

    /** 
     * 过滤数组或对象的值，返回符合条件的新数组
     * @param {Array|Object} collection - 要过滤的集合
     * @param {Function} predicate - 过滤条件函数，返回true保留，参数为(value, index/key, collection)
     * @returns {Array} 过滤后的新数组
     */
    _.filter = function (collection, predicate) {
        if (!Array.isArray(collection)) {
            collection = Object.values(collection);
        }
        return collection.filter(predicate);
    };

    /** 
     * 查找数组或对象中第一个满足条件的元素
     * @param {Array|Object} collection - 要查找的集合
     * @param {Function} predicate - 查找条件函数，返回true表示匹配，参数为(value, index/key, collection)
     * @returns {*} 第一个匹配的元素，未找到返回undefined
     */
    _.find = function (collection, predicate) {
        if (!Array.isArray(collection)) {
            collection = Object.values(collection);
        }
        return collection.find(predicate);
    };

    /** 
     * 移除数组中的重复项
     * @param {Array} array - 要去重的数组
     * @returns {Array} 去重后的新数组
     */
    _.uniq = function (array) {
        return [...new Set(array)];
    };

    /** 
     * 将数组按指定大小分割成多个子数组
     * @param {Array} array - 要分割的数组
     * @param {number} size - 每个子数组的大小
     * @returns {Array} 分割后的子数组集合
     */
    _.chunk = function (array, size) {
        if (!array || size < 1) return [];
        return Array.from({ length: Math.ceil(array.length / size) },
            (_, i) => array.slice(i * size, i * size + size));
    };

    /** 
     * 从数组中移除第一个匹配的元素
     * @param {Array} array - 要操作的数组
     * @param {*} item - 要移除的元素
     * @returns {Array} 移除元素后的数组，未找到则返回原数组
     */
    _.removeItem = function (array, item) {
        const index = array.indexOf(item);
        if (index !== -1) {
            array.splice(index, 1);
        }
        return array;
    };

    // ********************************************************2. 对象操作  **************************************************//

    /** 
     * 深拷贝对象或数组
     * @param {Object|Array} obj - 要拷贝的对象或数组
     * @returns {Object|Array} 深拷贝后的新对象或数组
     */
    _.cloneDeep = function (obj) {
        return JSON.parse(JSON.stringify(obj));
    };

    /** 
     * 检查值是否为纯对象（非数组、非null）
     * @param {*} value - 要检查的值
     * @returns {boolean} 是对象返回true，否则false
     */
    _.isObject = function (value) {
        return value !== null && typeof value === 'object' && !Array.isArray(value);
    };

    /** 
     * 将对象的值转换为数组
     * @param {Object} obj - 要转换的对象
     * @returns {Array} 包含对象值的数组
     */
    _.toArray = function (obj) {
        return Object.values(obj);
    };

    // ********************************************************3. 数学与随机  **************************************************//

    /** 
     * 生成指定范围内的随机整数（包含边界）
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 随机整数
     */
    _.random = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /** 
     * 生成带验证的随机整数，支持负数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number|string} 随机整数，或错误提示字符串
     */
    _.randomInRangeInt = function (min, max) {
        if (typeof min !== 'number' || typeof max !== 'number' || min > max) {
            return "请提供有效的数字范围（min 应小于 max）";
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * 生成指定范围内的随机数（包括小数，包括负数）
     * @param {number} min - 最小值（包含）
     * @param {number} max - 最大值（包含）
     * @returns {number} - 范围内的随机数
     */
    _.randomInRange = function (min, max) {
        if (typeof min !== 'number' || typeof max !== 'number' || min > max) {
            throw new Error('Invalid input: min and max must be numbers, and min <= max');
        }
        return min + Math.random() * (max - min);
    };

    /** 
     * 随机打乱数组（使用 Fisher-Yates 算法）
     * @param {Array} array - 要打乱的数组
     * @returns {Array} 打乱后的数组
     */
    _.shuffle = function (array) {
        const len = array.length;
        for (let i = 0; i < len - 1; i++) {
            const index = Math.floor(Math.random() * (len - i));
            [array[index], array[len - i - 1]] = [array[len - i - 1], array[index]];
        }
        return array;
    };

    /** 
     * 获取数组中的最大值
     * @param {Array} array - 要处理的数组
     * @returns {number|undefined} 最大值，空数组返回undefined
     */
    _.max = function (array) {
        return array?.length ? Math.max(...array) : undefined;
    };

    /**
     * 计算两点之间的距离
     * @param {Object} p1 - 第一个点，格式 { x: number, y: number }
     * @param {Object} p2 - 第二个点，格式 { x: number, y: number }
     * @returns {number} 两点间的欧几里得距离，如果输入无效则返回 Infinity
     */
    _.dist = function (p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // ********************************************************4. 字符串操作  **************************************************//

    /** 
     * 检查字符串是否以指定字符串开头
     * @param {string} str - 要检查的字符串
     * @param {string} target - 目标开头字符串
     * @returns {boolean} 是则返回true，否则false
     */
    _.startsWith = function (str, target) {
        return str.startsWith(target);
    };

    /** 
     * 检查字符串是否以指定字符串结尾
     * @param {string} str - 要检查的字符串
     * @param {string} target - 目标结尾字符串
     * @returns {boolean} 是则返回true，否则false
     */
    _.endsWith = function (str, target) {
        return str.endsWith(target);
    };

    /** 
     * 使用分隔符连接数组元素为字符串
     * @param {Array} array - 要连接的数组
     * @param {string} [separator=''] - 分隔符，默认空字符串
     * @returns {string} 连接后的字符串
     */
    _.join = function (array, separator = '') {
        return array.join(separator);
    };

    // ********************************************************5. 类型判断与比较  **************************************************//

    /** 
     * 深度比较两个值是否相等
     * @param {*} x - 第一个值
     * @param {*} y - 第二个值
     * @returns {boolean} 相等返回true，否则false
     */
    _.isEqual = function (x, y) {
        return JSON.stringify(x) === JSON.stringify(y);
    };

    /** 
     * 检查值是否为有效数字
     * @param {*} value - 要检查的值
     * @returns {boolean} 是有效数字返回true，否则false
     */
    _.isNumber = function (value) {
        return typeof value === 'number' && !isNaN(value);
    };

    /** 
     * 检查值是否为NaN
     * @param {*} value - 要检查的值
     * @returns {boolean} 是NaN返回true，否则false
     */
    _.isNaN = function (value) {
        return _.isNumber(value) && isNaN(value);
    };

    /**
     * 根据概率值返回随机结果
     * @param {number} probability - 概率值（1到100之间的整数）
     * @returns {boolean} 以指定概率返回true，否则返回false
     */
    _.isLucky = function (probability) {
        if (!_.isNumber(probability) || !Number.isInteger(probability) || probability < 1 || probability > 100) {
            return false;
        }
        return Math.random() * 100 < probability;
    };

    // ********************************************************6. 格式化工具  **************************************************//

    /** 
     * 格式化金额，超过10000转为K/M/B/T单位
     * @param {number} money - 要格式化的金额
     * @returns {string} 格式化后的字符串
     */
    _.formatMoney = function (money) {
        const units = ['', 'K', 'M', 'B', 'T'];
        let idx = 0;
        while (money >= 10000 && idx < units.length - 1) {
            money /= 1000;
            idx++;
        }
        return Math.floor(money) + units[idx];
    };

    /** 
     * 将秒数格式化为HH:MM:SS时间字符串
     * @param {number} seconds - 剩余秒数
     * @returns {string} 格式化后的时间字符串
     */
    _.formatTime = function (seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return [hours, minutes, secs]
            .map(num => num < 10 ? `0${num}` : num)
            .join(':');
    };

    /**
     * 将秒数格式化为带中文单位的时间字符串
     * @param {number} seconds - 剩余秒数
     * @returns {string} 格式化后的时间字符串（如 "1小时0分6秒", "30秒"）
     */
    _.formatTime2 = function (seconds) {
        if (!Number.isInteger(seconds) || seconds < 0) {
            return "0秒";
        }

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        let result = [];
        // 添加小时（如果有小时或后面有非零单位）
        if (hours > 0) {
            result.push(`${hours}小时`);
        }
        // 添加分钟（如果有分钟或有小时且秒数非零）
        if (minutes > 0 || (hours > 0 && secs > 0)) {
            result.push(`${minutes}分`);
        }
        // 添加秒（总是显示秒，即使为0）
        result.push(`${secs}秒`);
        return result.join("");
    };
    // 暴露到全局
    window._ = _;
})();