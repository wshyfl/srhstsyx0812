// InputManager.js
cc.Class({
    extends: cc.Component,

    properties: {
        // 是否启用双人模式
        isMultiplayerMode: false,
        // 是否启用键盘控制(PC版使用)
        enableKeyboard: true,
    },

    onLoad() {

    },

    init() {
        this.isMultiplayerMode = GlobalMng.isDouble();
        // 初始化输入状态对象
        this.inputState = {
            player1: {
                direction: cc.v2(0, 0),
                buttons: {
                    skill1: false,
                    skill2: false,
                    skill3: false,
                }
            },
            player2: {
                direction: cc.v2(0, 0),
                buttons: {
                    skill1: false,
                    skill2: false,
                    skill3: false,
                }
            }
        };

        // 加载键盘配置
        this.keyConfig = this.getDefaultKeyConfig();

        // 注册键盘事件(PC端)
        if (this.enableKeyboard) {
            this.setupKeyboardEvents();
        }

        // 输入事件监听器（仅用于技能按钮）
        this.listeners = {
            player1: {},
            player2: {}
        };
    },

    // 动态加载输入控件
    loadInputControls(parentNode, callback) {
        this.joystickPlayer1 = null;
        this.joystickPlayer2 = null;
        this.skillButtonsPlayer1 = [];
        this.skillButtonsPlayer2 = [];

        let totalTasks = this.isMultiplayerMode ? 2 : 1;
        let completedTasks = 0;
        const checkCompletion = () => {
            completedTasks++;
            if (completedTasks >= totalTasks) {
                this.setupJoystickEvents();
                this.setupButtonEvents();
                callback && callback();
            }
        };

        if (this.isMultiplayerMode) {
            GlobalMng.sceneMng.createUIByBundle(`input/double/Joystick1`, parentNode, (joystickNode) => {
                joystickNode.x = -400;
                this.joystickPlayer1 = joystickNode;
                const skillContainer = joystickNode.getChildByName('SkillButtons');
                if (skillContainer) {
                    this.skillButtonsPlayer1 = skillContainer.getComponentsInChildren(cc.Button);
                }
                checkCompletion();
            });

            GlobalMng.sceneMng.createUIByBundle(`input/double/Joystick2`, parentNode, (joystickNode) => {
                joystickNode.x = 400;
                this.joystickPlayer2 = joystickNode;
                const skillContainer = joystickNode.getChildByName('SkillButtons');
                if (skillContainer) {
                    this.skillButtonsPlayer2 = skillContainer.getComponentsInChildren(cc.Button);
                }
                checkCompletion();
            });
        } else {
            GlobalMng.sceneMng.createUIByBundle(`input/single/Joystick1`, parentNode, (joystickNode) => {
                this.joystickPlayer1 = joystickNode;
                const skillContainer = joystickNode.getChildByName('SkillButtons');
                if (skillContainer) {
                    this.skillButtonsPlayer1 = skillContainer.getComponentsInChildren(cc.Button);
                }
                checkCompletion();
            });
        }
    },

    // 注册技能按钮事件的监听器
    on(eventName, callback, playerIndex) {
        const player = playerIndex === 1 ? 'player1' : 'player2';
        if (!this.listeners[player][eventName]) {
            this.listeners[player][eventName] = [];
        }
        this.listeners[player][eventName].push(callback);
    },

    // 触发技能按钮事件
    emit(eventName, playerIndex, ...args) {
        const player = playerIndex === 1 ? 'player1' : 'player2';
        const callbacks = this.listeners[player][eventName];
        if (callbacks) {
            callbacks.forEach(callback => callback(...args));
        }
    },

    // 虚拟摇杆事件设置（保持原有的方向状态更新）
    setupJoystickEvents() {
        if (this.joystickPlayer1) {
            const joystick1 = this.joystickPlayer1.getComponent('Joystick');
            if (joystick1) {
                joystick1.onJoystickMove = (direction) => {
                    this.inputState.player1.direction = direction;
                };
                joystick1.onJoystickEnd = () => {
                    this.inputState.player1.direction = cc.v2(0, 0);
                };
            }
        }

        if (this.joystickPlayer2 && this.isMultiplayerMode) {
            const joystick2 = this.joystickPlayer2.getComponent('Joystick');
            if (joystick2) {
                joystick2.onJoystickMove = (direction) => {
                    this.inputState.player2.direction = direction;
                };
                joystick2.onJoystickEnd = () => {
                    this.inputState.player2.direction = cc.v2(0, 0);
                };
            }
        }
    },

    // 按钮事件设置（仅技能按钮使用事件驱动）
    setupButtonEvents() {
        this.skillButtonsPlayer1.forEach((btn, index) => {
            if (btn && btn.node) {
                btn.node.on('touchstart', (event) => {
                    this.inputState.player1.buttons[`skill${index + 1}`] = true;
                    this.emit('buttonDown', 1, `skill${index + 1}`, btn.node);
                });
                btn.node.on('touchend', () => {
                    this.inputState.player1.buttons[`skill${index + 1}`] = false;
                    this.emit('buttonUp', 1, `skill${index + 1}`, btn.node);
                });
                btn.node.on('touchcancel', () => {
                    this.inputState.player1.buttons[`skill${index + 1}`] = false;
                    this.emit('buttonUp', 1, `skill${index + 1}`, btn.node);
                });
            }
        });

        if (this.isMultiplayerMode) {
            this.skillButtonsPlayer2.forEach((btn, index) => {
                if (btn && btn.node) {
                    btn.node.on('touchstart', () => {
                        this.inputState.player2.buttons[`skill${index + 1}`] = true;
                        this.emit('buttonDown', 2, `skill${index + 1}`, btn.node);
                    });
                    btn.node.on('touchend', () => {
                        this.inputState.player2.buttons[`skill${index + 1}`] = false;
                        this.emit('buttonUp', 2, `skill${index + 1}`, btn.node);
                    });
                    btn.node.on('touchcancel', () => {
                        this.inputState.player2.buttons[`skill${index + 1}`] = false;
                        this.emit('buttonUp', 2, `skill${index + 1}`, btn.node);
                    });
                }
            });
        }
    },

    // 键盘事件设置(PC端)
    setupKeyboardEvents() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onKeyDown(event) {
        const keyCode = event.keyCode;
        if (this.isMultiplayerMode && this.isPlayer2Key(keyCode)) {
            this.processPlayerKeyDown(keyCode, 'player2');
        } else {
            this.processPlayerKeyDown(keyCode, 'player1');
        }
    },

    onKeyUp(event) {
        const keyCode = event.keyCode;
        if (this.isMultiplayerMode && this.isPlayer2Key(keyCode)) {
            this.processPlayerKeyUp(keyCode, 'player2');
        } else {
            this.processPlayerKeyUp(keyCode, 'player1');
        }
    },

    isPlayer2Key(keyCode) {
        const config = this.keyConfig.player2;
        return [
            config.up,
            config.down,
            config.left,
            config.right,
            config.skill1,
            config.skill2,
            config.skill3
        ].includes(keyCode);
    },
    processPlayerKeyDown(keyCode, playerKey) {
        const config = this.keyConfig[playerKey];
        const playerIndex = playerKey === 'player1' ? 1 : 2;
        // 处理移动按键
        if (keyCode === config.up) {
            this.inputState[playerKey].direction.y = 1;
        } else if (keyCode === config.down) {
            this.inputState[playerKey].direction.y = -1;
        } else if (keyCode === config.left) {
            this.inputState[playerKey].direction.x = -1;
        } else if (keyCode === config.right) {
            this.inputState[playerKey].direction.x = 1;
        }
        // 处理技能按键
        else if (keyCode === config.skill1) {
            this.inputState[playerKey].buttons.skill1 = true;
            this.emit('buttonDown', playerIndex, 'skill1', null);
        } else if (keyCode === config.skill2) {
            this.inputState[playerKey].buttons.skill2 = true;
            this.emit('buttonDown', playerIndex, 'skill2', null);
        } else if (keyCode === config.skill3) {
            this.inputState[playerKey].buttons.skill3 = true;
            this.emit('buttonDown', playerIndex, 'skill3', null);
        }
    },

    processPlayerKeyUp(keyCode, playerKey) {
        const config = this.keyConfig[playerKey];
        const playerIndex = playerKey === 'player1' ? 1 : 2;
        // 处理移动按键
        if (keyCode === config.up && this.inputState[playerKey].direction.y > 0) {
            this.inputState[playerKey].direction.y = 0;
        } else if (keyCode === config.down && this.inputState[playerKey].direction.y < 0) {
            this.inputState[playerKey].direction.y = 0;
        } else if (keyCode === config.left && this.inputState[playerKey].direction.x < 0) {
            this.inputState[playerKey].direction.x = 0;
        } else if (keyCode === config.right && this.inputState[playerKey].direction.x > 0) {
            this.inputState[playerKey].direction.x = 0;
        }
        // 处理技能按键
        else if (keyCode === config.skill1) {
            this.inputState[playerKey].buttons.skill1 = false;
            this.emit('buttonUp', playerIndex, 'skill1', null);
        } else if (keyCode === config.skill2) {
            this.inputState[playerKey].buttons.skill2 = false;
            this.emit('buttonUp', playerIndex, 'skill2', null);
        } else if (keyCode === config.skill3) {
            this.inputState[playerKey].buttons.skill3 = false;
            this.emit('buttonUp', playerIndex, 'skill3', null);
        }
    },

    // 获取玩家输入方向（外部实时调用）
    getDirection(playerIndex) {
        const player = playerIndex === 1 ? 'player1' : 'player2';
        return this.inputState[player].direction;
    },

    //获取摇杆力度
    getStrength(playerIndex) {
        if (playerIndex == 1) {
            return this.joystickPlayer1.getComponent('Joystick').getStrength();
        } else {
            return this.joystickPlayer2.getComponent('Joystick').getStrength();
        }
    },

    // 新增方法：获取按钮节点
    getButtonNode(playerIndex, buttonName) {
        const buttonsArray = playerIndex === 1 ? this.skillButtonsPlayer1 : this.skillButtonsPlayer2;
        if (!buttonsArray || buttonsArray.length === 0) {
            cc.warn(`玩家${playerIndex}的按钮数组未初始化`);
            return null;
        }

        for (let i = 0; i < buttonsArray.length; i++) {
            const button = buttonsArray[i];
            if (button && button.node && button.node.name === buttonName) {
                return button.node;
            }
        }
        cc.warn(`未找到玩家${playerIndex}的按钮 ${buttonName}`);
        return null;
    },


    getSkillBtn(playerIndex) {
        if (playerIndex == 1) {
            const skillContainer = this.joystickPlayer1.getChildByName('SkillButtons');
            if (skillContainer) {
                this.skillButtonsPlayer1 = skillContainer.getComponentsInChildren(cc.Button);
            }
        } else {
            const skillContainer = this.joystickPlayer2.getChildByName('SkillButtons');
            if (skillContainer) {
                this.skillButtonsPlayer2 = skillContainer.getComponentsInChildren(cc.Button);
            }
        }
        this.setupButtonEvents();
    },

    getButtonState(playerIndex, buttonName) {
        const player = playerIndex === 1 ? 'player1' : 'player2';
        return this.inputState[player].buttons[buttonName];
    },

    //按钮是否按下
    isButtonJustPressed(playerIndex, buttonName) {
        return this.getButtonState(playerIndex, buttonName);
    },

    getDefaultKeyConfig() {
        return {
            player1: {
                up: cc.macro.KEY.w,
                down: cc.macro.KEY.s,
                left: cc.macro.KEY.a,
                right: cc.macro.KEY.d,
                skill1: cc.macro.KEY.j,
                skill2: cc.macro.KEY.k,
                skill3: cc.macro.KEY.l,
            },
            player2: {
                up: cc.macro.KEY.up,
                down: cc.macro.KEY.down,
                left: cc.macro.KEY.left,
                right: cc.macro.KEY.right,
                skill1: cc.macro.KEY.num1,
                skill2: cc.macro.KEY.num2,
                skill3: cc.macro.KEY.num3,
            }
        };
    },

    update(dt) {
    },

    onDestroy() {
        if (this.enableKeyboard) {
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
            cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        }
    }
});