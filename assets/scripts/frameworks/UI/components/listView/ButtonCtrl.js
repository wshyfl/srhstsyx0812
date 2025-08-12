cc.Class({
  extends: cc.Component,

  properties: {

  },

  // use this for initialization
  onLoad: function () {
    var self = this;
    function onTouchDown(event) {
      GlobalMng.audioMng.playEffect("点击");
    }

    function onTouchUp(event) {
    }
    this.node.on('touchstart', onTouchDown, this.node);
    this.node.on('touchend', onTouchUp, this.node);
    this.node.on('touchcancel', onTouchUp, this.node);
  }
});