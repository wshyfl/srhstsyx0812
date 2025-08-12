
var LabelUtils2 = require("LabelUtils2");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad() {
        this.dayLast = "20240702";//输入开关打开的日期(如:20040606),
        this.showLog = false;//显示log吗?
        this.couldCheck = true;//是否可以连接服务器?
        //如果需要测试开关打开 可以注销掉下面一行(正式包一定要打开)
        if (AD.chanelName1 == "vivo")
            this.getCouldCheck();//日期检测(是否在规定的评测时间内)


        this.chanelName1 = AD.chanelName1;
        this.chanelName = AD.chanelName;

        if (this.chanelName1 == "android") {
            return
        }
        if (this.chanelName1 == "WX") {
            return
        }
        cc.game.addPersistRootNode(this.node);

        switch (this.chanelName1) {
            case "WX":
                this.yuanShengSecond = 0;
                this.schedule(function () {
                    if (AD_WX.yuanShengIsOk == false) {
                        AD_WX.showYuanSheng();
                        this.yuanShengSecond = 0;
                    }
                    else {
                        this.yuanShengSecond++;
                        if (this.yuanShengSecond == 30) {
                            AD_WX.hideYuanSheng();
                        }
                    }
                }, 1);
                break;
            case "huaWei":
                cc.game.on(cc.game.EVENT_HIDE, event => {
                    console.log("------------>后台了");
                }, this);
                cc.game.on(cc.game.EVENT_SHOW, event => {
                    console.log("------------>前台了,开始上报");
                    cc.director.emit("chaPingReportAdShow");
                }, this);
                break;
        }


        //获取开关
        if (this.chanelName == this.chanelName1 && this.couldCheck) {
            this.getSwitchKey();
            if (this.key == "" || this.switch == "") {
                console.warn("传入的可以有问题  this.key:  " + this.key + "   this.switch: " + this.switch)
                return;
            }
            cc.director.once("服务器获取完毕", (_switchOn, _obj) => {
                console.log("服务器获取完毕  " + _switchOn + " _obj  " + _obj.autoVideo);

                if (_switchOn) {
                    this.switchOn();
                    if (_obj.autoVideo != 0) {//模式控制打开了?
                        AD.autoVideo = true;
                    }
                }
                cc.director.emit("服务器获取完毕1", _switchOn)
            }, this);
            LabelUtils2.getInstance().initLabel(this.key);
            LabelUtils2.getInstance().getLabel(this.switch);
        }

    },

    getSwitchKey() {
        switch (this.chanelName1) {
            case "touTiao":  //
                this.key = "com.wrrqmnq.tt0726";
                this.switch = "switch";
                break;
            case "oppo":  //OPPO
                // AD.switchOn = false;
                this.key = "com.srhsts.oppo250711";
                this.switch = "switch";
                break;
            case "vivo":  //vivo 
                this.key = "com.srhsts.vivo250711";
                this.switch = "switch";
                break;
            case "huaWei":  //华为 
                this.key = "";
                this.switch = "switch";
                break;
            case "QQ":  //QQ
                AD_QQ.initQQ();
                this.key = "";
                this.switch = "switch";
                break;
            case "WX":  //WX
                this.key = "";
                this.switch = "switch";
                break;
        }
    },

    switchOn() {
        switch (this.chanelName1) {
            case "vivo":
                AD_vivo.switchOn()
                break;
            case "oppo":
                AD_oppo.switchOn();
                break;
            case "huaWei":
                AD_HuaWei.switchOn();
                break;
            case "honor":
                AD_honor.switchOn();
                break;
            default:
                AD.wuDianRate = 1;//自点击概率
                break;
        }
    },

    getCouldCheck() {
        this.couldCheck = true;//可以开启服务器检测?
        if (this.dayLast.length != 8) {
            this.couldCheck = false;
            console.error("输入的日期信息格式有误")
            return;
        }

        else {

        }
        var _arr = new Array();
        for (var i = 0; i < 7; i++) {

            var _str = this.getDateDayString(i);
            if (_str == this.dayLast) {
                _arr.push(_str);
                break;
            }
            else
                _arr.push(_str);
        }
        if (this.showLog)
            console.log("评测的日期:  " + _arr);

        for (var i = 0; i < _arr.length; i++) {
            if (this.dayLast == _arr[i]) {
                this.couldCheck = false;
                break;
            }
        }

        if (this.showLog)
            if (_arr.length >= 7 && this.couldCheck == false) {
                console.warn("警告:!!!天数超过7天????????");
            }
        console.log("*********************开始游戏?" + this.couldCheck)




    },

    //获取  "20200101" 格式的  今天的 时间日期 addDate: -1表示昨天  1表示明天 2表示后天.....
    getDateDayString(...addDate) {
        var _strLog = "";
        if (addDate[0]) {
            var day1 = new Date();
            day1.setTime(day1.getTime() + addDate[0] * 24 * 60 * 60 * 1000);
            var _year = day1.getFullYear();
            var _month = (day1.getMonth() + 1);
            var _day = day1.getDate();
            if (addDate[0] > 0)
                _strLog = "当前日期+" + addDate[0];
            else
                _strLog = "当前日期" + addDate[0];
        }
        else {
            var _year = this.getDate("year2");
            var _month = this.getDate("month") + 1;
            var _day = this.getDate("day");

            _strLog = "今天日期是";
        }

        if (_month < 10)
            _month = "0" + _month;
        if (_day < 10)
            _day = "0" + _day;
        var _str = "" + _year + _month + _day;

        // console.log(_strLog + " : " + _str)
        return _str;
    },

    getDate(timeType) {
        var testDate = new Date();

        if (timeType == "year")
            return testDate.getYear();//获取当前年份(2位)
        else if (timeType == "year2")
            return testDate.getFullYear(); //获取完整的年份(4位,1970-????)
        else if (timeType == "month")
            return testDate.getMonth(); //获取当前月份(0-11,0代表1月)
        else if (timeType == "day")
            return testDate.getDate(); //获取当前日(1-31)
        else if (timeType == "week")
            return testDate.getDay(); //获取当前星期X(0-6,0代表星期天)
        else if (timeType == "millisecond")
            return testDate.getTime(); //获取当前时间(从1970.1.1开始的毫秒数)
        else if (timeType == "hour")
            return testDate.getHours(); //获取当前小时数(0-23)

        else if (timeType == "minute")
            return testDate.getMinutes(); //获取当前分钟数(0-59)

        else if (timeType == "second")
            return testDate.getSeconds(); //获取当前秒数(0-59)

        // testDate.getMilliseconds(); //获取当前毫秒数(0-999)

        // testDate.toLocaleDateString(); //获取当前日期

        // var mytime=testDate.toLocaleTimeString();//获取当前时间

        // testDate.toLocaleString( ); //获取日期与时间
    },
    // update (dt) {},
});

