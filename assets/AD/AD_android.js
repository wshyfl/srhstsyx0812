window.AD_android = {
    shiPin() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            //调用安卓方法
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "shiPin", "(Ljava/lang/String;)V", "视频");
        }
    },
    //插屏
    showIcon() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            //调用安卓方法
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showIcon", "(Ljava/lang/String;)V", "iconAD");
        }
    },
    //插屏
    hideIcon() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            //调用安卓方法
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "hideIcon", "(Ljava/lang/String;)V", "iconAD");
        }
    },
    //插屏
    chaPing() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            //调用安卓方法
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "chaPing", "(Ljava/lang/String;)V", "插屏");
        }
    },
    //插屏
    chaPingVideo() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            //调用安卓方法
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "chaPingVideo", "(Ljava/lang/String;)V", "插屏视频");
        }
    },
    //显示banner
    showBanner() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            console.log("调用安卓方法插屏 ")
            //调用安卓方法
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "showBanner", "(Ljava/lang/String;)V", "showBanner");
        }
    },
    //隐藏banner
    hideBanner() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            console.log("调用安卓方法插屏 ")
            //调用安卓方法
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "hideBanner", "(Ljava/lang/String;)V", "hideBanner");
        }
    },
    moreGame() {
        console.log("超休闲 ")
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "moreGame", "(Ljava/lang/String;)V", JSON.stringify("超休闲"));
        }
    },
    checkPermission() {
        console.log("checkPermission ")
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "checkPermission", "(Ljava/lang/String;)V", "申请权限");
        }
    },
    //手机震动
    shake() {
        console.log("手机震动 ")
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "shake", "(Ljava/lang/String;)V", "zhendong");
        }
    },
    //手机震动
    yinSi() {
        console.log("yinSi ")
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "yinSi", "(Ljava/lang/String;)V", "yinSi");
        }
    },
}