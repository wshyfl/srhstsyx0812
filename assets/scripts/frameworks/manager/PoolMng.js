var PoolMng = cc.Class({
    start() {
        this.dictPool = {};
    },

    /**
     * 根据预设从对象池中获取对应节点
     * @param {cc.Prefab} prefab 
     */
    getNode(prefab) {
        let name = prefab.name;
        let node = null;
        if (this.dictPool.hasOwnProperty(name)) {
            let pool = this.dictPool[name];
            if (pool.size() > 0) {
                node = pool.get();
            } else {
                node = cc.instantiate(prefab);
            }
        } else {
            let pool = new cc.NodePool();
            this.dictPool[name] = pool;
            node = cc.instantiate(prefab);
        }
        return node;
    },

    /**
     * 将对应节点放回对象池中
     * @param {cc.Node} node 
     */
    putNode(node) {
        let name = node.name;
        let pool = null;
        if (this.dictPool.hasOwnProperty(name)) {
            pool = this.dictPool[name];
        } else {
            pool = new cc.NodePool();
            this.dictPool[name] = pool;
        }
        pool.put(node);
    },

    /**
     * 预先填充对象池
     * @param {cc.Prefab} prefab 
     * @param {number} count 预先填充的数量
     */
    preloadPool(prefab, count) {
        let name = prefab.name;
        let pool = null;
        if (this.dictPool.hasOwnProperty(name)) {
            pool = this.dictPool[name];
        } else {
            pool = new cc.NodePool();
            this.dictPool[name] = pool;
        }
        for (let i = 0; i < count; i++) {
            let node = cc.instantiate(prefab);
            pool.put(node);
        }
    },

    /**
     * 根据名字从对象池中获取对应节点
     * @param {string} name 
     */
    getNodeByName(name) {
        let node = null;
        if (this.dictPool.hasOwnProperty(name)) {
            let pool = this.dictPool[name];
            if (pool.size() > 0) {
                node = pool.get();
            }
        }
        return node
    },
    /**
     * 获取对象池的大小
     * @param {string} name 对象池的名称
     * @returns {number} 对象池的大小
     */
    getPoolSize(name) {
        if (this.dictPool.hasOwnProperty(name)) {
            return this.dictPool[name].size();
        }
        return 0;
    },

    /**
     * 根据名称，清除并销毁对应对象池
     * @param {string} name 
     */
    clearPool(name) {
        if (this.dictPool.hasOwnProperty(name)) {
            let pool = this.dictPool[name];
            pool.clear();
            delete this.dictPool[name];
        }
    },

    /**
     * 获取所有对象池的名称
     * @returns {Array} 对象池名称数组
     */
    getAllPoolNames() {
        return Object.keys(this.dictPool);
    }
});

var sharedPooManager = new PoolMng();
sharedPooManager.start();
module.exports = sharedPooManager;
