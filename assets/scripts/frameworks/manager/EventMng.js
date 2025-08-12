var EventMng = cc.Class({

    properties: {
        mode: {
            default: "multi", // 默认值
            visible: true
        },
        oneHandlers: {
            default: {},
            visible: false
        },
        multiHandlers: {
            default: {},
            visible: false
        },
        supportEvent: {
            default: null,
            visible: false
        },
        _EVENT_TYPE: {
            default: [],
            visible: false
        }
    },

    on: function (eventName, handler, target) {
        var objHandler = { handler: handler, target: target };
        if (this.mode === "one") {
            this.oneHandlers[eventName] = objHandler;
        } else {
            var handlerList = this.multiHandlers[eventName] || [];
            handlerList.push(objHandler);
            this.multiHandlers[eventName] = handlerList;
        }
    },

    off: function (eventName, handler, target) {
        if (this.mode === "one") {
            var oldObj = this.oneHandlers[eventName];
            if (oldObj && oldObj.handler === handler) {
                this.oneHandlers[eventName] = null;
            }
        } else {
            var handlerList = this.multiHandlers[eventName];
            if (handlerList) {
                for (var i = 0; i < handlerList.length; i++) {
                    if (handlerList[i].handler === handler && (!target || target === handlerList[i].target)) {
                        handlerList.splice(i, 1);
                        break;
                    }
                }
            }
        }
    },

    dispatchEvent: function (eventName /**/) {
        if (this.supportEvent !== null && !this.supportEvent.hasOwnProperty(eventName)) {
            cc.error("please add the event into EventMng.js");
            return;
        }
        var args = [].slice.call(arguments, 1);
        if (this.mode === "one") {
            var objHandler = this.oneHandlers[eventName];
            if (objHandler && objHandler.handler) {
                objHandler.handler.apply(objHandler.target, args);
            }
        } else {
            var handlerList = this.multiHandlers[eventName];
            if (handlerList) {
                for (var i = 0; i < handlerList.length; i++) {
                    handlerList[i].handler.apply(handlerList[i].target, args);
                }
            }
        }
    },

    setSupportEventList: function (arrSupportEvent) {
        if (!(arrSupportEvent instanceof Array)) {
            cc.error("supportEvent was not array");
            return false;
        }
        this.supportEvent = {};
        for (var i in arrSupportEvent) {
            this.supportEvent[arrSupportEvent[i]] = i;
        }
        return true;
    },

    onLoad: function () {
        this._EVENT_TYPE = [
            "UpdateGold"        //金币更新事件
        ];
        this.setSupportEventList(this._EVENT_TYPE);
    }
});

function createClientEvent(mode) {
    var instance = new EventMng(); // 不再传递参数
    instance.mode = mode || "multi"; // 通过属性赋值
    instance.onLoad();
    return instance;
}

module.exports = {
    one: createClientEvent("one"),
    multi: createClientEvent("multi"),
    default: createClientEvent("multi")
};