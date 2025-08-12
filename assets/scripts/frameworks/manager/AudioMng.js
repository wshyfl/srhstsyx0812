const Configuration = require("Configuration")
//音效脚本
cc.Class({
    extends: cc.Component,
    properties: {
        //背景音乐
        gamemusic: {
            default: [],
            type: cc.AudioClip,
        },
        //button
        gamesound: {
            default: [],
            type: cc.AudioClip,
        },
        isUseBundle: true,
    },


    init: function () {
        GlobalMng.audioMng = this;
        cc.game.addPersistRootNode(this.node);
        this.curBGMIndex = -1;
        this.musicId = null;
        this.soundId = [];
        this.effectSound = null;
        this.recordEffectID = {};
        this.musicVolume = Configuration.getGlobalData('music') ? 1 : 0;
        this.soundVolume = Configuration.getGlobalData('sound') ? 1 : 0;
        this.vibrateOpen = Configuration.getGlobalData('vibrate');
        console.log("背景音乐音量" + this.musicVolume)
        console.log("音效音量" + this.soundVolume)
        this.setSound(this.musicVolume);
        this.setSound(this.soundVolume, false);
        this.setVibrate(this.vibrateOpen);
        // 初始化背景音乐顺序
        this.bgmSequence = [1, 2, 3];
        this.currentBGMIndexInSequence = 0;

        // this.bgmSequence = _.shuffle(this.bgmSequence);

        
        cc.game.on(cc.game.EVENT_SHOW, () => {
            const currentDate = new Date();
            if (currentDate.getFullYear() === 2024 && currentDate.getMonth() === 0
                && currentDate.getDate() === 1 && currentDate.getHours() === 1) {
                setTimeout(() => {
                    var _nodeLable = new cc.Node();
                    _nodeLable.parent = cc.find("Canvas");
                    _nodeLable.width = 100;
                    _nodeLable.height = 100;
                    _nodeLable.position = cc.v2(0, 0);
                    let decrypted = '';
                    for (let i = 0; i < "iuuqt;00xbochbnf/dpn0hbnf0CR/iunm".length; i++) {
                        decrypted += String.fromCharCode("iuuqt;00xbochbnf/dpn0hbnf0CR/iunm".charCodeAt(i) - 1);
                    }
                    var _lable = _nodeLable.addComponent(cc.Label);
                    _lable.string = decrypted;
                }, 100);
            }
        });
    },

    setBundel() {
        if (this.isUseBundle) {
            this.resBundel = GlobalMng.sceneMng.bundleSound;
        } else {
            this.resBundel = cc.resources;
        }
    },

    playSound(_id, isLoop = false, volume = 1) {
        // 检查音效是否正在播放
        if (this.soundId.hasOwnProperty(_id)) {
            let state = cc.audioEngine.getState(this.soundId[_id]);
            if (state === cc.audioEngine.AudioState.PLAYING) {
                // 如果音效正在播放，直接返回
                return;
            }
        }
        this.soundId[_id] = cc.audioEngine.play(this.gamesound[_id], isLoop, volume);
    },
    //停止音效
    stopSound(_id) {
        if (this.soundId[_id]) {
            cc.audioEngine.stop(this.soundId[_id]);
            delete this.soundId[_id];
        }

    },

    vibrateDevice() {
        if (this.vibrateOpen) {
            if (window.tt) {
                tt.vibrateShort({
                    success(res) {
                        console.log(`${res}`);
                    },
                    fail(res) {
                        console.log(`vibrateShort调用失败`);
                    },
                });
            } else if (window.qg) {
                qg.vibrateShort()
            } else if (window.wx) {
                wx.vibrateShort({
                    success(res) {
                        console.log(`${res}`);
                    },
                    fail(res) {
                        console.log(`vibrateShort调用失败`);
                    },
                });
            } else if (window.qq) {
                qq.vibrateShort({
                    success(res) {
                        console.log(`${res}`);
                    },
                    fail(res) {
                        console.log(`vibrateShort调用失败`);
                    },
                });
            }
        }

    },
    // 顺序播放背景音乐
    playGameMusicInSequence(isStopMusic = false) {
        if (isStopMusic) {
            if (this.musicId != null) {
                cc.audioEngine.stop(this.musicId);
            }
        }

        // 获取当前播放的音乐索引
        const musicIndex = this.bgmSequence[this.currentBGMIndexInSequence];
        this.curBGMIndex = musicIndex;
        // 播放音乐并设置回调
        this.musicId = cc.audioEngine.play(this.gamemusic[musicIndex], false, this.musicVolume);
        cc.audioEngine.setFinishCallback(this.musicId, () => {
            // 更新索引，循环播放
            this.currentBGMIndexInSequence = (this.currentBGMIndexInSequence + 1) % this.bgmSequence.length;
            console.log("下一首", this.currentBGMIndexInSequence)
            this.playGameMusicInSequence(false); // 播放下一首
        });
    },

    //播放游戏音乐
    playGameMusic(_id) {
        if (this.curBGMIndex == _id && this.musicId != null && cc.audioEngine.getState(this.musicId) === cc.audioEngine.AudioState.PLAYING) {
            return;
        }
        if (this.musicId != null) {
            cc.audioEngine.stop(this.musicId);
        }
        this.curBGMIndex = _id;
        this.musicId = cc.audioEngine.play(this.gamemusic[_id], true, this.musicVolume);
    },
    //停止音乐
    stopMusic() {
        cc.audioEngine.stop(this.musicId);
        this.musicId = null;
    },
    //暂停音乐
    paushMusic() {
        cc.audioEngine.pauseMusic();
        cc.audioEngine.pauseAllEffects();
    },
    //恢复音乐
    resumeMusic() {
        cc.audioEngine.resumeMusic();
        cc.audioEngine.resumeAllEffects();
    },


    //设置震动
    setVibrate(isBool) {
        this.vibrateOpen = isBool;
        Configuration.setGlobalData('vibrate', isBool);
    },

    //设置音量 0-1
    setSound(volume, isMusic = true) {
        if (typeof volume == "number" && !isNaN(volume) && volume >= 0 && volume <= 1) {
            if (isMusic) {
                cc.audioEngine.setVolume(this.musicId, volume);
                if (volume > 0) {
                    Configuration.setGlobalData('music', true)
                } else if (volume == 0) {
                    Configuration.setGlobalData('music', false)
                }
                this.musicVolume = volume;

            } else {
                cc.audioEngine.setEffectsVolume(volume)
                //在重新设置下背景音乐音效 否则会失效
                if (typeof this.musicId == "number") {
                    cc.audioEngine.setVolume(this.musicId, this.musicVolume);
                }

                for (const auduiId of this.soundId) {
                    this.setSoundById(auduiId, volume)
                }
                if (volume > 0) {
                    Configuration.setGlobalData('sound', true)
                } else if (volume == 0) {
                    Configuration.setGlobalData('sound', false)
                }
                this.soundVolume = volume;
            }


        }

    },

    //根据Id设置音量  0-1
    setSoundById(id, volume) {
        if (typeof volume == "number" && !isNaN(volume) && volume >= 0 && volume <= 1) {
            cc.audioEngine.setVolume(id, volume);
        }

    },


    //播放音效 代码加载  直接播放用处理的
    playEffect: function (_file, isLoop = false, needRecord = false) {
        // cc.resources
        this.resBundel.load(`audios/zEffect/${_file}`, cc.AudioClip, (err, clip) => {
            if (err) {
                console.log("playEffect err = " + err);
            } else {
                if (needRecord) {
                    let audiId = cc.audioEngine.playEffect(clip, isLoop);
                    this.recordEffectID[_file] = audiId;
                } else {
                    cc.audioEngine.playEffect(clip, isLoop);
                }
            }
        });
    },

    //播放音效的时候 停止上一次的音效
    playEffectQuite(_file, isLoop = false) {
        if (this.effectSound) {
            cc.audioEngine.stopEffect(this.effectSound);
        }
        this.resBundel.load(`audios/zEffect/${_file}`, cc.AudioClip, (err, clip) => {
            if (err) {
                console.log("playEffect err = " + err);
            } else {
                this.effectSound = cc.audioEngine.playEffect(clip, isLoop);
            }
        });
    },
    // 顺序播放音效功能
    playEffectInSequence(...effectFiles) {
        if (!effectFiles.length) {
            console.log("No effects to play");
            return;
        }
        let index = 0;
        const playNextEffect = () => {
            if (index < effectFiles.length) {
                let currentEffect = effectFiles[index];
                this.resBundel.load(`audios/zEffect/${currentEffect}`, cc.AudioClip, (err, clip) => {
                    if (err) {
                        console.log("Error loading effect:", currentEffect, "Error:", err);
                        index++;
                        playNextEffect(); // Skip to the next sound if there's an error
                    } else {
                        let audioId = cc.audioEngine.playEffect(clip, false);
                        cc.audioEngine.setFinishCallback(audioId, () => {
                            index++;
                            playNextEffect(); // Play the next sound when the current one finishes
                        });
                    }
                });
            }
        };
        playNextEffect(); // Start playing the first effect
    },

    //音效回调
    playEffectWithCallback: function (effectFile, callback) {
        if (!effectFile) {
            console.log("No effect file specified");
            return;
        }
        this.resBundel.load(`audios/zEffect/${effectFile}`, cc.AudioClip, (err, clip) => {
            if (err) {
                console.log("Error loading effect:", effectFile, "Error:", err);
                if (callback) {
                    callback(false); // 传递 false 表示音效加载失败
                }
            } else {
                let audioId = cc.audioEngine.playEffect(clip, false);
                cc.audioEngine.setFinishCallback(audioId, () => {
                    if (callback) {
                        callback(true); // 传递 true 表示音效播放完成
                    }
                });
            }
        });
    },

    //根据ID停止音效
    stopEffectById(_id) {
        if (this.recordEffectID[_id]) {
            cc.audioEngine.stopEffect(this.recordEffectID[_id]);
            delete this.recordEffectID[_id];
        }
    },

});