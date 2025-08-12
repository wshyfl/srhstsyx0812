/**
 * Copyright (c) 2017 Xiamen Yaji Software Co.Ltd. All rights reserved.
 * Created by lizhiyi on 2018/6/21.
 */
var ResourceMng = cc.Class({
    //cc.resources.release(resourceUrl, type);  手动调用cc.Prefab、cc.AudioClip、cc.SpriteFrame
    // GlobalMng.bundleRes.release(resourceUrl, type);  手动调用cc.Prefab、cc.AudioClip、cc.SpriteFrame
    // use this for initialization
    onLoad() {
    },

    loadRes(url, type, cb) {
        cc.resources.load(url, type, function (err, res) {
            if (err) {
                cc.error(err.message || err);
                cb(err, res);
                return;
            }

            cb(err, res);
        });
    },

    createUI(path, parent, cb) {
        // 延迟后进入加载逻辑
        this.loadRes("prefabs/" + path, cc.Prefab, (err, prefab) => {
            var node = cc.instantiate(prefab);
            if (parent) {
                parent.addChild(node);
                node.setPosition(cc.v2(0, 0));
            }
            cb && cb(node); // 调用回调

        });
    },

    /**
     * 加载数据文件并获取其内容
     * @param {String} fileName - 文件名（不带路径）
     * @param {Function} cb - 回调函数，接收参数 `err` 和 `text`（文件内容）
     */
    getData: function (fileName, cb) {
        // 加载资源文件夹中的数据文件
        cc.resources.load("datas/" + fileName, function (err, content) {
            if (err) {
                cc.error(err.message || err); // 打印错误信息
                return;
            }

            // 获取文件内容的文本
            var text = content.text;
            if (!text) {
                // 如果没有文本内容，则远程加载
                cc.assetManager.loadRemote(content.nativeUrl, function (err, content) {
                    text = content;
                    cb(err, text); // 回调函数返回加载结果
                });
                return;
            }
            // 直接回调返回文本内容
            cb(err, text);
        });
    },

    getJsonData(fileName, cb) {
        cc.resources.load("datas/" + fileName, function (err, content) {
            if (err) {
                cc.error(err.message || err);
                return;
            }

            if (content.json) {
                cb(err, content.json);
            } else {
                cb('failed!!!');
            }
        });
    },

    setSpriteFrame(path, sprite, cb) {
        this.loadRes(path, cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                console.error('set sprite frame failed! err:', path, err);
                cb(err);
                return;
            }
            if (sprite && cc.isValid(sprite)) {
                sprite.spriteFrame = spriteFrame;
                cb && cb(null);
            }
        });
    },

});

var sharedResourceUtil = new ResourceMng();
sharedResourceUtil.onLoad();
module.exports = sharedResourceUtil;
