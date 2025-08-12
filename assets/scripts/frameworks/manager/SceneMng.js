var Constants = require("../../module/data/Constants");
var Configuration = require('Configuration');
var PlayerData = require("PlayerData");
var ResourceMng = require("ResourceMng");
var JsonConfigMng = require("JsonConfigMng");

var SceneMng = cc.Class({

    init: function () {
        this.bundleRes = null;
        this.bundleSound = null;
        this.bundleSke = null;
        if (Configuration.getUserId() == "") {
            let id = Configuration.generateGuestAccount();
            Configuration.setUserId(id);
            PlayerData.createPlayerInfo();
        } else {
            if (GlobalMng.isTestNewStorage) {
                PlayerData.clear();
            }
            PlayerData.loadFromCache();
        }

        cc.find("Canvas/GameLoading").getComponent("GameLoading").init(5.8);
        this.preloadAllResources(() => {
            GlobalMng.audioMng.setBundel();
            console.log("All resources have been loaded! Entering the Scene!");
            cc.find("Canvas/GameLoading").getComponent("GameLoading").setLoadCompelect(50, () => {
                cc.director.loadScene("main");
            });
        });
    },

    preloadAllResources(callback) {
        const jsonTableArray = ["servers"];
        const prefabPaths = [
            "ui/global/Loading",
            "ui/global/ModalMask",
            "ui/global/GameLoading",
            "ui/global/Tip",
            "ui/panel/RoleShop",
            "ui/panel/RoleShopDouble",
            "ui/layer/转场",
        ];

        // 辅助函数：加载 bundle
        const loadBundle = (bundleName) => {
            return new Promise((resolve, reject) => {
                cc.assetManager.loadBundle(bundleName, (err, bundle) => {
                    if (err) {
                        console.error(`加载分包 ${bundleName} 失败:`, err);
                        reject(err);
                        return;
                    }
                    resolve(bundle);
                });
            });
        };

        // 辅助函数：加载 JSON
        const loadJSONs = () => {
            return new Promise((resolve, reject) => {
                JsonConfigMng.loadJSONs(jsonTableArray, () => {
                    resolve();
                }, (err) => {
                    console.error("Failed to preload JSONs:", err);
                    reject(err);
                });
            });
        };

        // 辅助函数：加载目录资源
        const preloadDir = (bundle, dir, type) => {
            return new Promise((resolve, reject) => {
                bundle.preloadDir(dir, type, (err) => {
                    if (err) {
                        console.error(`Failed to preload directory ${dir}:`, err);
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        };

        // 辅助函数：预加载场景
        const preloadScene = (sceneName) => {
            return new Promise((resolve, reject) => {
                cc.director.preloadScene(sceneName, (err) => {
                    if (err) {
                        console.error(`Failed to preload scene ${sceneName}:`, err);
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        };

        // 按顺序加载资源
        loadJSONs()
            .then(() => {
                console.log("JSONs loaded");
                return loadBundle('bundle4'); //bundle4 静态资源
            })
            .then(() => {
                console.log("Bundle4 loaded");
                return loadBundle('bundle3'); //bundle3 spine资源
            })
            .then((bundle) => {
                this.bundleSke = bundle;
                console.log("Bundle3 loaded");
                return loadBundle('bundle2'); //bundle2 音效 场景
            })
            .then((bundle) => {
                this.bundleSound = bundle;
                console.log("Bundle2 loaded");
                return loadBundle('bundle1'); //bundle1 动态预制体 图片
            })
            .then((bundle) => {
                this.bundleRes = bundle;
                console.log("Bundle1 loaded");
                return this.loadAllPrefabs(prefabPaths); //预加载预制体放入内存
            })
            .then(() => {
                console.log("Prefabs loaded");
                return preloadDir(this.bundleRes, "res", cc.Texture2D); //预加载动态图片
            })
            .then(() => {
                console.log("Images loaded");
                return preloadScene("main");    //预加载场景
            })
            .then(() => {
                console.log("Main scene loaded");
                return preloadScene("game"); //预加载场景
            })
            .then(() => {
                console.log("Game scene loaded");
                if (callback) callback();
            })
            .catch((err) => {
                console.error("Failed to preload resources:", err);
            });

        // .then(() => {
        //     console.log("Prefabs loaded");
        //     return preloadDir(this.bundleSound, "audios", cc.AudioClip);
        // })
    },

    createLoadPrefabTasks(prefabPaths) {
        return prefabPaths.map(path => this.loadPrefab(path));
    },

    loadPrefab(prefabPath) {
        return new Promise((resolve, reject) => {
            this.createUIByBundle(prefabPath, null, (prefab) => {
                GlobalMng.uiMng.dictSharedPanel[prefabPath] = prefab;
                resolve(prefab);
            }, (err) => {
                console.error(`Failed to load prefab ${prefabPath}:`, err);
                reject(err);
            });
        });
    },

    loadAllPrefabs(prefabPaths, callback) {
        if (prefabPaths.length === 0) {
            if (callback) callback();
            return Promise.resolve();
        }
        return Promise.all(this.createLoadPrefabTasks(prefabPaths))
            .then(() => {
                if (callback) callback();
            })
            .catch(error => {
                console.error('Error loading prefabs:', error);
                throw error;
            });
    },

    //预制体动态加载基于bundle
    createUIByBundle(path, parent, cb, errCb) {
        this.bundleRes.load("prefabs/" + path, cc.Prefab, (err, prefab) => {
            if (err) {
                errCb && errCb(err);
                return;
            }
            var node = cc.instantiate(prefab);
            if (parent) {
                parent.addChild(node);
                node.setPosition(cc.v2(0, 0));
            }
            cb && cb(node);
        });
    },
    //图片体动态加载基于bundle
    setSpriteFrameByBundle(path, sprite, cb) {
        this.bundleRes.load(path, cc.SpriteFrame, (err, res) => {
            if (err) {
                console.error(err.message || err);
                cb(err, res);
                return;
            }
            sprite.spriteFrame = res;
            cb && cb();
        });
    },
    //spine体动态加载基于bundle
    setSkeByBundle(path, ske, aniName = "animation", isLoop = false, skinName = null, callback) {
        this.bundleSke.load(path, sp.SkeletonData, (err, skeletonData) => {
            if (err) {
                console.error("Failed to load SkeletonData:", err);
                return;
            }
            if (ske) {
                ske.skeletonData = skeletonData;
                ske.clearTracks();
                ske.setToSetupPose();
                ske.setAnimation(0, aniName, isLoop);
            }

            if (skinName) {
                ske.setSkin(skinName);
                ske.setSlotsToSetupPose();
            }
            if (callback) callback();
        });
    },
});

var sceneMng = new SceneMng();
module.exports = sceneMng;