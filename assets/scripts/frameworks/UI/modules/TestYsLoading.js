// var Constants = require("../../module/data/Constants");
// //var localConfig = require('localConfig');

// cc.Class({
//     extends: cc.Component,

//     properties: {
//         progressBar: {
//             default: null,
//             type: cc.ProgressBar
//         },
//         percentLabel: {
//             default: null,
//             type: cc.Label
//         },
//         versionLabel: {
//             default: null,
//             type: cc.Label
//         },

  
//     },

//     // use this for initialization
//     onLoad: function () {
//         this.updateTimer = 0;
//         this.updateInterval = 0.01;
//         this.totalLength = this.progressBar.totalLength;
//         this.lengthInterval = 30;
//         //this.versionLabel.string = 'Ver:' + localConfig.getVersion();
//     },


//     startLoading: function (type, tasks, callback) {
//         cc.game.addPersistRootNode(this.node);

//         this.node.active = true;
//         this.type = type;
//         this.callback = callback;
//         this.tasks = tasks;

//         //初始化
//         this.currentMaxLength = 0;
//         this.currentLength = 0;
//         this.progressBar.progress = 0;
//         this.percentLabel.string = '0%';
//         this.taskIndex = 0;
//         this.running = true;

//         this.nextTask([]);
//     },

//     nextTask: function (args) {
//         //保护切换场景造成对象为空
//         if (!this.tasks) return;

//         if (this.taskIndex === this.tasks.length) {
//             this.currentMaxLength = this.totalLength;
//             // if (this.type === Constants.SCENE_MANAGER_TYPE.LOAD) {
//             //     this.currentLength = this.currentMaxLength;
//             //     this.setProgress();
//             // }
//             return;
//         }

//         // if (this.type === Constants.SCENE_MANAGER_TYPE.LOAD) {
//         //     this.currentLength = this.currentMaxLength;
//         //     this.setProgress();
//         // }

//         var _this = this;
//         var taskCallback = function (err, args) {
//             if (err) {
//                 return _this.callback.apply(null, [err].concat(args));
//             }

//             _this.nextTask(Array.prototype.slice.call(arguments).slice(1));
//         };

//         args.push(taskCallback);

//         var task = this.tasks[this.taskIndex++];
//         this.currentMaxLength = this.totalLength / (this.tasks.length + 1) * this.taskIndex;
//         task.apply(null, args);
//     },

//     // called every frame, uncomment this function to activate update callback
//     update: function (dt) {
//         this.updateTimer += dt;
//         if (this.updateTimer < this.updateInterval) {
//             return; // we don't need to do the math every frame
//         }

//         if (!this.running) return;

//         this.updateTimer = 0;
//         this.currentLength += this.lengthInterval;
//         this.currentLength = this.currentLength > this.currentMaxLength ? this.currentMaxLength : this.currentLength;

//         //console.log(this.currentLength, this.currentMaxLength, this.totalLength)
//         this.setProgress();
//     },

//     setProgress: function () {
//         var radio = this.currentLength / this.totalLength;
//         radio = radio > 1 ? 1 : radio;
//         this.percentLabel.string = parseInt(radio * 100) + '%';
//         this.progressBar.progress = radio;
//         if (radio === 1) {
//             this.running = false;
//             this.callback.apply(null, [null].concat(null));
//         }
//     }
// });