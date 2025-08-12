/**
 * quadtree-js
 * @version 1.2.6
 * @license MIT
 * @author Timo Hausmann
 */

/* https://github.com/timohausmann/quadtree-js.git v1.2.6 */

/*
版权所有 © 2012-2023 Timo Hausmann

特此免费授予任何获得本软件及相关文档文件副本（“软件”）的人，
在不受限制的情况下使用、复制、修改、合并、发布、分发、再授权和/或销售该软件的副本，
并允许向其提供本软件的人这样做，前提是符合以下条件：

以上版权声明和本许可声明应包含在所有副本或实质部分的“软件”中。

本软件按“原样”提供，不附带任何形式的明示或暗示的保证，包括但不限于对适销性、特定用途适用性及不侵权的保证。
在任何情况下，作者或版权持有人均不对任何索赔、损害或其他责任承担责任，无论是在合同、侵权或其他行为中，
由于本软件或使用或其他交易而引起的。
*/

; (function () {

    /**
     * 四叉树使用矩形对象来表示所有区域（"Rect"）。
     * 所有矩形都要求包含以下属性：x，y，宽度，和高度
     * @typedef {Object} Rect
     * @property {number} x         X坐标位置
     * @property {number} y         Y坐标位置
     * @property {number} width     宽度
     * @property {number} height    高度
     */

    /**
     * 四叉树构造函数
     * @class Quadtree
     * @param {Rect} bounds                 节点的边界（矩形区域）({ x, y, width, height })
     * @param {number} [max_objects=10]     （可选）每个节点可以容纳的最大对象数（默认值：10）
     * @param {number} [max_levels=4]       （可选）四叉树的最大深度（默认值：4）
     * @param {number} [level=0]            （可选）当前节点的深度，用于子节点（默认值：0）
     */
    function Quadtree(bounds, max_objects, max_levels, level) {
        this.max_objects = max_objects || 10;  // 每个节点最多容纳的对象数量
        this.max_levels = max_levels || 4;    // 四叉树的最大深度
        this.level = level || 0;              // 当前节点的深度
        this.bounds = bounds;                 // 当前节点的边界（矩形区域）
        this.objects = [];                    // 当前节点中的对象列表
        this.nodes = [];                      // 当前节点的四个子节点
    }

    /**
     * 将节点分割成4个子节点
     * @memberof Quadtree
     */
    Quadtree.prototype.split = function () {

        var nextLevel = this.level + 1,
            subWidth = this.bounds.width / 2,
            subHeight = this.bounds.height / 2,
            x = this.bounds.x,
            y = this.bounds.y;

        // 右上子节点
        this.nodes[0] = new Quadtree({
            x: x + subWidth,
            y: y,
            width: subWidth,
            height: subHeight
        }, this.max_objects, this.max_levels, nextLevel);

        // 左上子节点
        this.nodes[1] = new Quadtree({
            x: x,
            y: y,
            width: subWidth,
            height: subHeight
        }, this.max_objects, this.max_levels, nextLevel);

        // 左下子节点
        this.nodes[2] = new Quadtree({
            x: x,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, this.max_objects, this.max_levels, nextLevel);

        // 右下子节点
        this.nodes[3] = new Quadtree({
            x: x + subWidth,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        }, this.max_objects, this.max_levels, nextLevel);

        let rect0 = {
            x: x + subWidth,
            y: y,
            width: subWidth,
            height: subHeight
        };
        let rect1 = {
            x: x,
            y: y,
            width: subWidth,
            height: subHeight
        };
        let rect2 = {
            x: x,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        };
        let rect3 = {
            x: x + subWidth,
            y: y + subHeight,
            width: subWidth,
            height: subHeight
        };



        if (GlobalMng.isTestDraw) {
            // cc.find("Canvas").getComponent("Game").drawRectangle(rect0, cc.Color.RED)
            // cc.find("Canvas").getComponent("Game").drawRectangle(rect1, cc.Color.RED)
            // cc.find("Canvas").getComponent("Game").drawRectangle(rect2, cc.Color.RED)
            // cc.find("Canvas").getComponent("Game").drawRectangle(rect3, cc.Color.RED)
            // cc.find("Canvas").getComponent("Game").testQuadAreaNum += 4;
            // console.log("树组分叉: ", cc.find("Canvas").getComponent("Game").testQuadAreaNum)
        }

    };


    /**
     * 确定对象属于哪个子节点
     * @param {Rect} pRect      要检查的区域边界（{ x, y, width, height }）
     * @return {number[]}       一个包含与区域相交的子节点索引的数组（0-3：右上、左上、左下、右下）
     * @memberof Quadtree
     */
    Quadtree.prototype.getIndex = function (pRect) {

        var indexes = [],
            verticalMidpoint = this.bounds.x + (this.bounds.width / 2),
            horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

        var startIsNorth = pRect.y < horizontalMidpoint,
            startIsWest = pRect.x < verticalMidpoint,
            endIsEast = pRect.x + pRect.width > verticalMidpoint,
            endIsSouth = pRect.y + pRect.height > horizontalMidpoint;

        // 右上子节点
        if (startIsNorth && endIsEast) {
            indexes.push(0);
        }

        // 左上子节点
        if (startIsWest && startIsNorth) {
            indexes.push(1);
        }

        // 左下子节点
        if (startIsWest && endIsSouth) {
            indexes.push(2);
        }

        // 右下子节点
        if (endIsEast && endIsSouth) {
            indexes.push(3);
        }

        return indexes;
    };


    /**
     * 将对象插入到节点中。如果节点超过容量，它将分割并将所有对象插入到相应的子节点中。
     * @param {Rect} pRect      要添加的对象的边界（{ x, y, width, height }）
     * @memberof Quadtree
     */
    Quadtree.prototype.insert = function (pRect) {

        var i = 0,
            indexes;

        // 如果有子节点，则在匹配的子节点中插入
        if (this.nodes.length) {
            indexes = this.getIndex(pRect);

            for (i = 0; i < indexes.length; i++) {
                this.nodes[indexes[i]].insert(pRect);
            }
            return;
        }

        // 否则，将对象存储在此节点中
        this.objects.push(pRect);

        // 如果超过最大对象数
        if (this.objects.length > this.max_objects && this.level < this.max_levels) {

            // 如果没有子节点，则分割节点
            if (!this.nodes.length) {
                this.split();
            }

            // 将所有对象插入到对应的子节点中
            for (i = 0; i < this.objects.length; i++) {
                indexes = this.getIndex(this.objects[i]);
                for (var k = 0; k < indexes.length; k++) {
                    this.nodes[indexes[k]].insert(this.objects[i]);
                }
            }

            // 清理当前节点中的对象
            this.objects = [];
        }
    };


    /**
     * 返回所有可能与给定对象发生碰撞的对象
     * @param {Rect} pRect      要检查的对象边界（{ x, y, width, height }）
     * @return {Rect[]}         返回所有检测到的对象数组
     * @memberof Quadtree
     */
    Quadtree.prototype.retrieve = function (pRect) {

        var indexes = this.getIndex(pRect),
            returnObjects = this.objects;

        // 如果有子节点，检索它们的对象
        if (this.nodes.length) {
            for (var i = 0; i < indexes.length; i++) {
                returnObjects = returnObjects.concat(this.nodes[indexes[i]].retrieve(pRect));
            }
        }

        // 移除重复的对象
        if (this.level === 0) {
            return Array.from(new Set(returnObjects));
        }

        return returnObjects;
    };


    /**
     * 清空四叉树
     * @memberof Quadtree
     */
    Quadtree.prototype.clear = function () {

        this.objects = [];

        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes.length) {
                this.nodes[i].clear();
            }
        }

        this.nodes = [];
    };


    // Quadtree.prototype.removeObject = function (pRect) {
    //     // 从当前节点中移除对象
    //     const index = this.objects.indexOf(pRect);
    //     if (index > -1) {
    //         this.objects.splice(index, 1);
    //     }

    //     // 检查子节点以移除该对象
    //     for (var i = 0; i < this.nodes.length; i++) {
    //         this.nodes[i].removeObject(pRect);
    //     }
    // };
    /**
 * 从四叉树中移除一个对象
 * @param {Rect} pRect      要移除的对象边界（{ x, y, width, height }）
 * @memberof Quadtree
 */
    Quadtree.prototype.removeObject = function (pRect) {
        if (this.nodes.length) {
            const indexes = this.getIndex(pRect);
            for (let i = 0; i < indexes.length; i++) {
                this.nodes[indexes[i]].removeObject(pRect);
            }
        } else {
            const index = this.objects.indexOf(pRect);
            if (index > -1) {
                this.objects.splice(index, 1);
            }
        }
    };
    // 用于CommonJS或浏览器导出
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Quadtree;
    } else {
        window.Quadtree = Quadtree;
    }

})();
