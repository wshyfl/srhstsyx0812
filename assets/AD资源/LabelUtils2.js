
//更新日期**** 2024年1月17日   window.isPingBi == false
var LabelUtils2 = cc.Class({
    extends: cc.Component,

    properties: {
        _ISDEBUG: false,
        _RELEASE_BASE_URL: "https://wanbgame.com/gameroot",
        _DEBUG_BASE_URL: "http://192.168.0.242:19800/label2",
        _labelName: "",
        location: "",
        locationCID: null,
        locationCIDList: null,
        labels: null,

        isPingBiIng: false,
        initLocationSucess: false,
        checkPingBiSucess: false,

    },
    getBaseUrl: function () {
        if (this._ISDEBUG) {
            return this._DEBUG_BASE_URL;
        }
        return this._RELEASE_BASE_URL;
    },

    statics: {
        instance: null
    },
    onLoad: function () {
        this.canRefresh = false;
        this._getMyLocationTimes=0;
    },

    //初始化
    initLabel: function (labelName) {
        window.isPingBi = false;
        var self = this;
        self.logFunc("key:" + labelName)

        if (!!labelName && labelName.length > 0) {
            this._labelName = labelName;
        }

        this._getMyLocation();//获取ID地址所在地
        this._fetchLabel();//获取服务器配置信息
        this._checkPingBi();//判断

        this.getReusltSucess = false;//成功获取接口
        //6秒内 未能成功获取接口 则直接调用失败 停止调用服务器获取逻辑
        this.scheduleOnce(() => {
            if (this.getReusltSucess == false) {
                this.getReusltSucess = true;
                this.logFunc("6秒内 未能成功获取接口 则直接调用失败 停止调用服务器获取逻辑")
                var _switch = false;
                var key = this.key;
                if (self.labels.hasOwnProperty(key)) {
                    var temp = key;
                    var obj = self.labels;
                    for (var _temp in obj) {//用javascript的for/in循环遍历对象的属性 
                        if (_temp == temp) {
                            self.logFunc("获取到的开关 :" + temp + ",值是: " + obj[temp])
                            if (obj[temp] == 0)
                                _switch = false;
                            else
                                _switch = true;
                        }
                    }
                }
                else {
                    console.warn("传入的key 不存在 " + key);
                    _switch = false;
                }
                cc.director.emit("服务器获取完毕", _switch);
            }
        }, 5);
        this.retryTimes = 0;//获取最终结果的次数
    },


    //步骤1:获取服务器配置信息
    _fetchLabel: function () {
        let self = this;
        if (self.getReusltSucess) return;
        var _url = this._RELEASE_BASE_URL + "/" + this._labelName + ".json";
        self.logFunc("服务器配置 访问的网址是  " + _url)
        self._httpGets(_url, false, function (res) {

            self.logFunc("服务器配置: " + JSON.stringify(res));
            if (res != -1) {
                self.locationCIDList = JSON.stringify(res.gamecity_ids);
                self.labels = res.json;
            } else {
                self.logFunc("服务器配置获取失败 ");
                self.scheduleOnce(function () {
                    self._fetchLabel()
                }, 0.3)
            }

        })

    },
    //步骤1: 获取ID地址信息(与上一步是同步进行的 )
    _getMyLocation: function () {
        let self = this;
        if (self.getReusltSucess) return;
        self._getMyLocationTimes++;
        self._httpGets("https://web.wanbgame.com/api/freeapi/ipregion", false, function (res) {

            if (res != -1) {
                self.logFunc("IP地址的当前位置是  " + JSON.stringify(res));
                self.initLocationSucess = true;
                
                var _str = res.data.code.toString();
                _str = _str[0]+_str[1]+"0000";
                self.locationCID = _str;

            } else {
                self.logFunc("当前位置是获取失败");
                if(self._getMyLocationTimes>=60){
                    self.locationCID = "无屏蔽";
                    self.initLocationSucess = true;
                }
                else {
                    self.scheduleOnce(function () {
                        self._getMyLocation();
                    }, 0.3)
                }
                
            }
        })
    },
    //步骤2: 检测屏蔽
    _checkPingBi: function () {
        var self = this;
        //locationCID:ip地址定位到的本地地址  
        //locationCIDList:服务器配置的屏蔽地址
        if (self.locationCID == null || self.locationCIDList == null) {
            self.scheduleOnce(function () {
                self._checkPingBi();
            }, 0.1)
            return;
        }

        self.checkPingBiSucess = true;
       
        window.isPingBi = (self.locationCIDList.indexOf(self.locationCID) != -1);
        this.logFunc("屏蔽  " + self.locationCIDList + "   " + self.locationCID + "  " + window.isPingBi)
        this.logFunc("屏蔽  " + self.locationCIDList.indexOf(self.locationCID))

    },
    //获取结果
    getLabel: function (key) {

        var self = this;
        self.key = key;
        if (this.retryTimes == 0)
            self.logFunc("switch :" + key)
        if (!this.checkPingBiSucess) {//服务器获取未完成 / ID地址获取未完成
            this.retryTimes++;
            self.scheduleOnce(() => {
                if (!self.getReusltSucess)
                    self.getLabel(key);
            }, 0.1);
        }
        else {
            var _switch = false;
            if (this.isPingBiIng)//城市处于屏蔽状态
                _switch = false;
            else {
                if (self.labels.hasOwnProperty(key)) {
                    var temp = key;
                    var obj = self.labels;
                    for (var _temp in obj) {//用javascript的for/in循环遍历对象的属性 
                        if (_temp == temp) {
                            self.logFunc("获取到的开关 :" + temp + ",值是: " + obj[temp])
                            if (obj[temp] == 0)
                                _switch = false;
                            else
                                _switch = true;
                        }
                    }
                }
                else {
                    console.warn("传入的key 不存在 " + key);
                    _switch = false;
                }
            }
            self.logFunc("服务器获取完毕*********");
            self.getReusltSucess = true;
            cc.director.emit("服务器获取完毕", _switch,obj);
        }


    },
    _httpGets: function (url, needHeader, callback) {
        var self = this;

        let xhr = cc.loader.getXMLHttpRequest();

        xhr.onreadystatechange = function () {
            cc.log(" label location XML_HTTP_REQUEST onreadystatechange ");
            if (xhr.readyState === 4) {
                self.logFunc("httpGetsCode:" + xhr.status)
                if (xhr.status >= 200 && xhr.status <= 304) {
                    // var respone = xhr.responseText;
                    var respone = JSON.parse(xhr.responseText);
                    callback(respone);
                } else {
                    callback(-1);
                }

            }
        };

        xhr.open("GET", url, true);
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }
        xhr.setRequestHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36");
        xhr.setRequestHeader("Accept", "*/*");
        xhr.setRequestHeader("Connection", "keep-alive");
        /*
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        */

        xhr.timeout = 3000;
        let isCallback = false;
        xhr.ontimeout = function () {
            self.logFunc("xmlhttprequest timeout");
            if (!isCallback) {
                isCallback = true;
                callback(-1);
            }
        };
        xhr.onerror = function (e) {
            self.logFunc(e + "xmlhttprequest onerror")
            if (!isCallback) {
                isCallback = true;
                callback(-1);

            }
        };
        xhr.send();
    },

    logFunc(...obj) {
        // return;
        // console.log(obj)
    },
});

LabelUtils2.getInstance = function () {
    if (LabelUtils2.instance == null) {
        LabelUtils2.instance = new LabelUtils2();
    }
    return LabelUtils2.instance;
};
module.exports = LabelUtils2;
