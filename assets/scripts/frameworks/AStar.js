/** A星地图点类型 */
const AStarPointType = Object.freeze({
    /** 普通 */
    NORMAL: 0,
    /** 起点 */
    START: 1,
    /** 终点 */
    END: 2,
    /** 障碍 */
    OBSTACLES: 3,
});

/** A星地图点类 */
class AStarPoint {
    constructor(row, col, type) {
        this.row = row;
        this.col = col;
        this.type = type;
        this.value_G = 0;
        this.value_H = 0;
        this.value_F = 0;
        this.previousPoint = null;
    }
}

/** 最小堆优先队列类 */
class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this._bubbleUp(this.elements.length - 1);
    }

    dequeue() {
        const result = this.elements[0];
        const end = this.elements.pop();
        if (this.elements.length > 0) {
            this.elements[0] = end;
            this._sinkDown(0);
        }
        return result.element;
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    _bubbleUp(index) {
        const { element, priority } = this.elements[index];
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.elements[parent].priority <= priority) break;
            this.elements[index] = this.elements[parent];
            index = parent;
        }
        this.elements[index] = { element, priority };
    }

    _sinkDown(index) {
        const length = this.elements.length;
        const { element, priority } = this.elements[index];
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let swap = null;
            if (left < length && this.elements[left].priority < priority) {
                swap = left;
            }
            if (right < length && this.elements[right].priority < (swap === null ? priority : this.elements[left].priority)) {
                swap = right;
            }
            if (swap === null) break;
            this.elements[index] = this.elements[swap];
            index = swap;
        }
        this.elements[index] = { element, priority };
    }
}

/** A星地图类 */
export class AStarMap {
    constructor(_tiledMap, ..._obstacles) {
        if (!_tiledMap || _obstacles.length <= 0) {
            console.warn("AStarMap构建失败");
            return;
        }
        this.tiledMap = _tiledMap;
        this.obstaclesNameArray = _obstacles;
        this.mapObstaclesArray = [];
        this.mapHeight = null;
        this.mapWidth = null;
        this.tileHeight = null;
        this.tileWidth = null;
        this.tiledMapHeight = null;
        this.tiledMapWidth = null;
        this.mapPointsArray = null;
        this.startIndex = [0, 0];
        this.endIndex = [0, 0];
        this.eightDirectionCheck = true;
        this.isWorking = false;
        this.useOptimizedAlgorithm = true;
        this.posCache = new Map(); // 坐标转换缓存
        this.obstaclePoints = new Set(); // 障碍点缓存
    }

    initMap() {
        let mapSize = this.tiledMap.getMapSize();
        let tileSize = this.tiledMap.getTileSize();
        this.mapHeight = mapSize.height;
        this.mapWidth = mapSize.width;
        this.tileHeight = tileSize.height;
        this.tileWidth = tileSize.width;
        this.tiledMapHeight = mapSize.height * tileSize.height;
        this.tiledMapWidth = mapSize.width * tileSize.width;

        this.mapPointsArray = new Array(this.mapHeight);
        for (let i = 0; i < this.mapPointsArray.length; i++) {
            this.mapPointsArray[i] = new Array(this.mapWidth).fill(null);
        }

        for (let name of this.obstaclesNameArray) {
            let layer = this.tiledMap.getLayer(name);
            if (layer) this.mapObstaclesArray.push(layer);
        }

        this.cacheObstaclePoints();
        this.resetMap();
    }

    cacheObstaclePoints() {
        this.obstaclePoints.clear();
        for (let layer of this.mapObstaclesArray) {
            for (let j = 0; j < this.mapHeight * this.mapWidth; j++) {
                if (layer._tiles[j] !== 0) {
                    let row = Math.floor(j / this.mapWidth);
                    let col = j % this.mapWidth;
                    this.obstaclePoints.add(`${row},${col}`);
                }
            }
        }
    }

    resetMap() {
        for (let i = 0; i < this.mapPointsArray.length; i++) {
            for (let j = 0; j < this.mapPointsArray[i].length; j++) {
                this.mapPointsArray[i][j] = null;
            }
        }
        for (let point of this.obstaclePoints) {
            let [row, col] = point.split(',').map(Number);
            this.mapPointsArray[row][col] = new AStarPoint(row, col, AStarPointType.OBSTACLES);
        }
        this.mapPointsArray[this.startIndex[0]][this.startIndex[1]] = new AStarPoint(
            this.startIndex[0], this.startIndex[1], AStarPointType.START
        );
        this.mapPointsArray[this.endIndex[0]][this.endIndex[1]] = new AStarPoint(
            this.endIndex[0], this.endIndex[1], AStarPointType.END
        );
    }

    calculateHValue(current, end) {
        if (this.useOptimizedAlgorithm) {
            let dx = Math.abs(current.row - end[0]);
            let dy = Math.abs(current.col - end[1]);
            return Math.max(dx, dy) + 0.414 * Math.min(dx, dy); // 预计算 sqrt(2) - 1
        }
        return Math.abs(current.row - end[0]) + Math.abs(current.col - end[1]);
    }

    calculateGValue(current, neighbor) {
        if (this.useOptimizedAlgorithm) {
            let dx = Math.abs(current.row - neighbor.row);
            let dy = Math.abs(current.col - neighbor.col);
            return current.value_G + (dx + dy === 2 ? 1.414 : 1); // 预计算 sqrt(2)
        }
        return Math.abs(neighbor.row - this.startIndex[0]) + Math.abs(neighbor.col - this.startIndex[1]);
    }

    getPathByPos(startPos, targetPos) {
        if (this.isWorking) return [startPos, startPos];
        this.isWorking = true;

        this.startIndex = this.getNearNomalTiled(startPos, targetPos);
        this.endIndex = this.getNearNomalTiled(targetPos);

        if (this.mapPointsArray[this.startIndex[0]][this.startIndex[1]]?.type === AStarPointType.OBSTACLES) {
            console.log("起点为障碍物，重新计算");
            this.startIndex = this.getNearNomalTiled(startPos);
        }
        if (this.mapPointsArray[this.endIndex[0]][this.endIndex[1]]?.type === AStarPointType.OBSTACLES) {
            console.log("终点为障碍物，重新计算");
            this.endIndex = this.getNearNomalTiled(targetPos);
        }

        this.resetMap();

        let startPoint = this.mapPointsArray[this.startIndex[0]][this.startIndex[1]];
        let openList = new PriorityQueue();
        let closeList = new Set();
        openList.enqueue(startPoint, 0);

        while (!openList.isEmpty()) {
            let point = openList.dequeue();
            if (point.type === AStarPointType.END) break;
            closeList.add(point);

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    let row = point.row + i;
                    let col = point.col + j;
                    if (row < 0 || row >= this.mapHeight || col < 0 || col >= this.mapWidth) continue;

                    let neighbor = this.mapPointsArray[row][col] || new AStarPoint(row, col, AStarPointType.NORMAL);
                    this.mapPointsArray[row][col] = neighbor;

                    if (neighbor.type === AStarPointType.OBSTACLES || closeList.has(neighbor)) continue;

                    if (this.eightDirectionCheck) {
                        if (this.mapPointsArray[row - i]?.[col]?.type === AStarPointType.OBSTACLES ||
                            this.mapPointsArray[row]?.[col - j]?.type === AStarPointType.OBSTACLES) continue;
                    } else {
                        if (Math.abs(i) === Math.abs(j)) continue;
                    }

                    let newG = this.calculateGValue(point, neighbor);
                    if (neighbor.value_G === 0 || neighbor.value_G > newG) {
                        neighbor.value_G = newG;
                        neighbor.previousPoint = point;
                        neighbor.value_H = this.calculateHValue(neighbor, this.endIndex);
                        neighbor.value_F = neighbor.value_G + neighbor.value_H;
                        openList.enqueue(neighbor, neighbor.value_F);
                    }
                }
            }
        }

        let targetPoint = this.mapPointsArray[this.endIndex[0]][this.endIndex[1]];
        let pathPosArray = [];
        while (targetPoint) {
            pathPosArray.unshift(this.convertTiledToNodePos(targetPoint.row, targetPoint.col));
            targetPoint = targetPoint.previousPoint;
        }

        // 增量重置
        const resetPoints = new Set(closeList);
        while (!openList.isEmpty()) {
            resetPoints.add(openList.dequeue());
        }
        for (let point of resetPoints) {
            point.value_G = 0;
            point.value_H = 0;
            point.value_F = 0;
            point.previousPoint = null;
            if (point.type !== AStarPointType.OBSTACLES &&
                point !== this.mapPointsArray[this.startIndex[0]][this.startIndex[1]] &&
                point !== this.mapPointsArray[this.endIndex[0]][this.endIndex[1]]) {
                point.type = AStarPointType.NORMAL;
            }
        }

        this.isWorking = false;
        return pathPosArray;
    }

    addMapPointToArray(row, col, pointType) {
        if (!this.mapPointsArray[row][col]) {
            this.mapPointsArray[row][col] = new AStarPoint(row, col, pointType);
        } else {
            this.mapPointsArray[row][col].type = pointType;
        }
    }

    convertTiledToNodePos(tileRow, tileCol) {
        let key = `${tileRow},${tileCol}`;
        if (this.posCache.has(key)) return this.posCache.get(key);
        let tileX = tileCol * this.tileWidth;
        let tileY = tileRow * this.tileHeight;
        let parentX = tileX - this.tiledMapWidth / 2 + this.tileWidth / 2;
        let parentY = this.tiledMapWidth / 2 - tileY - this.tileHeight / 2;
        let result = cc.v2(parentX, parentY);
        this.posCache.set(key, result);
        return result;
    }

    convertNodePosToTiled(nodePos) {
        let parentX = nodePos.x;
        let parentY = nodePos.y;
        let tileX = parentX + this.tiledMapWidth / 2 - this.tileWidth / 2;
        let tileY = (this.tiledMapWidth / 2 - parentY) - this.tileHeight / 2;
        let tileCol = Math.round(tileX / this.tileWidth);
        let tileRow = Math.round(tileY / this.tileHeight);
        tileRow = Math.max(0, Math.min(this.mapHeight - 1, tileRow));
        tileCol = Math.max(0, Math.min(this.mapWidth - 1, tileCol));
        return [tileRow, tileCol];
    }

    getDistanceByPoints(pos1, pos2) {
        return Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y); // 曼哈顿距离
    }

    calculatePathDistance(pathPosArray) {
        if (!pathPosArray || pathPosArray.length < 2) return 0;
        let totalDistance = 0;
        for (let i = 0; i < pathPosArray.length - 1; i++) {
            totalDistance += this.getDistanceByPoints(pathPosArray[i], pathPosArray[i + 1]);
        }
        return totalDistance;
    }

    getNearNomalTiled(curPos, targetPos = null) {
        let tiledRowCol = this.convertNodePosToTiled(curPos);
        let point = this.mapPointsArray[tiledRowCol[0]][tiledRowCol[1]];
        if (point && point.type !== AStarPointType.OBSTACLES) {
            return tiledRowCol;
        }

        let comVec = targetPos || this.convertTiledToNodePos(tiledRowCol[0], tiledRowCol[1]);
        let minDist = Infinity;
        let result = tiledRowCol;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                let row = tiledRowCol[0] + i;
                let col = tiledRowCol[1] + j;
                if (row < 0 || row >= this.mapHeight || col < 0 || col >= this.mapWidth) continue;

                let neighbor = this.mapPointsArray[row][col] || new AStarPoint(row, col, AStarPointType.NORMAL);
                this.mapPointsArray[row][col] = neighbor;

                if (neighbor.type !== AStarPointType.OBSTACLES) {
                    let tempVec = this.convertTiledToNodePos(row, col);
                    let dist = comVec.sub(tempVec).mag();
                    if (dist < minDist) {
                        minDist = dist;
                        result = [row, col];
                    }
                }
            }
        }
        return result;
    }
}