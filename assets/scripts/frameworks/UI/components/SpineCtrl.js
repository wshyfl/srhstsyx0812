cc.Class({
    extends: cc.Component,

    properties: {


    },

    init(idle = "") {
        this.ske = this.node.getChildByName("ske").getComponent(sp.Skeleton);
        this.idleActionName = idle
        this.currentAnimation = "";
        if (this.idleActionName != "") {
            this.playIdle();
        }
        this.openBatch();
    },

    // 使用压缩纹理格式
    openBatch() {
        if (!this.ske.enableBatch) { // 检查是否已启用
            let texture = this.ske.skeletonData.textures[0];
            texture.packable = true;
            this.ske.batching = true;
            this.ske.enableBatch = true;
        }
    },
    /**
     * 默认轨道0播放
     * 播放待机动画
     */
    playIdle() {
        if (this.idleActionName == "") return;
        if (this.currentAnimation === this.idleActionName) return;
        this.ske.timeScale = 1;
        this.ske.setAnimation(0, this.idleActionName, true);
        this.currentAnimation = this.idleActionName;
    },
    /**
     * 默认轨道0播放
     * 需要循环的动画
     * @param {string} animationName  动画名字
     */
    playLoop(animationName) {
        if (this.currentAnimation === animationName) return;
        this.ske.setAnimation(0, animationName, true);
        this.currentAnimation = animationName;
    },


    //新轨道上播放
    playNewTrack(animationName, trackID, isLoop = true, callback) {
        this.ske.setCompleteListener(null);
        this.ske.setCompleteListener((trackEntry, loopCount) => {
            if (trackEntry.animation.name === animationName) {
                callback && callback();
            }
        });
        this.ske.setAnimation(trackID, animationName, isLoop);
    },
    /**
     * 默认轨道0播放
     * 需要播放一次的动画
     * @param {string} animationName  动画名字
     * @param {Function} callback  播放完成后的回调
     */
    playAnimationByName(animationName, isLoop = false, callback) {
        this.ske.setCompleteListener(null);
        this.ske.setCompleteListener((trackEntry, loopCount) => {
            if (trackEntry.animation.name === animationName) {
                callback && callback();
            }
        });
        this.ske.setAnimation(0, animationName, isLoop);
        this.currentAnimation = animationName;
    },

    /**
     * 在默认轨道上按顺序播放一组动画。
     * @param {string[]} animations - 要按顺序播放的动画名称数组。
     * @param {boolean} isLoop - 最后一个动画是否循环（默认：false）。
     * @param {Function} callback - 可选的回调函数，在整个动画队列完成后执行。
     * @example
     * this.playAnimationQueue(["walk", "jump", "idle"], false, () => console.log("队列完成"));
     */
    playAnimationQueue(animations, isLoop = false, callback) {
        if (!animations || animations.length === 0) return;
        let index = 0;
        const playNext = () => {
            if (index >= animations.length) {
                callback && callback();
                return;
            }
            this.ske.setAnimation(0, animations[index], index === animations.length - 1 ? isLoop : false);
            this.ske.setCompleteListener(() => {
                index++;
                playNext();
            });
            this.currentAnimation = animations[index];
        };
        playNext();
    },

    /**
     *  播放一个动画基于事件回调
     * @param {number} index 动画轨道
     * @param {string} name 动画名字     
     * @param {boolean} isLoop 是否循环
     * @param {Function} callback1 事件回调
     * @param {Function} callback2 动画完成回调
     */
    playActionByEvent(index, name, isLoop, callback1, callback2) {
        this.ske.setEventListener(null); // 清理旧事件监听器
        this.ske.setCompleteListener(null); // 清理旧完成监听器
        this.ske.setAnimation(index, name, isLoop);
        this.ske.setEventListener((trackEntry, event) => {
            if (event.data.name === name) {
                callback1 && callback1();
            }
        });
        this.ske.setCompleteListener((trackEntry) => {
            if (trackEntry.animation.name === name) {
                callback2 && callback2();
            }
        });
    },

    test() {
        this.ske.setAnimation(0, "跳", true);
        this.ske.setAnimation(1, "攻击", true);
    },

    //设置播放速度
    setPlayTime(tsRate) {
        this.ske.timeScale = tsRate;
    },


    //设置皮肤
    _setSkin(name) {
        this.ske.setSkin(name);
        this.ske.setSlotsToSetupPose();
    },

    /**
     * 平滑过度两个动画
     * @param {string} animName1 动画名
     * @param {string} animName2 动画名
     * @param {number} mixTime 混合时间
     */
    _setMix(animName1, animName2, mixTime = 0.2) {
        this.ske.setMix(animName1, animName2, mixTime);
        this.ske.setMix(animName2, animName1, mixTime);
    },

    /**
     *  动态加载并设置 Spine 资源和皮肤
     */
    loadAndChangeSkin(skeletonDataPath, animationName = "待机", isLoop = true, skinName = null, callback) {
        GlobalMng.sceneMng.setSkeByBundle(skeletonDataPath, this.ske, animationName, isLoop, skinName, () => {
            this.resetAnimationState();
            if (callback) {
                callback();
            }
        })
    },
    /**
     * 重置动画状态，停止所有轨道并恢复到初始姿势。
     * 同时清除当前动画记录。
     */
    resetAnimationState() {
        this._clearTracks();
        this.currentAnimation = "";
    },


    _clearTracks(trackID = null) {
        if (!this.ske) return;
        if (trackID !== null) {
            this.ske.clearTrack(trackID);
        } else {
            this.ske.clearTracks();
        }
        this.ske.setToSetupPose();
    },
    /**
     * 得到当前动画的播放时间
     * @param {动画名称} animationName 
     * @returns 
     */
    getSkeTotalTime(animationName) {
        let animation = this.ske.skeletonData?.getRuntimeData().findAnimation(animationName);
        return animation ? animation.duration : 0;
    },
});
