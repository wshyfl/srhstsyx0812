cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        tmplID: 0,
        itemID: 0,
    },
    
    onLoad: function () {
        this.node.on('touchend', function () {
            console.log("Item " + this.itemID + ' clicked');
        }, this);
    },

    initItem: function (tmplID, itemID) {
        this.tmplID = tmplID;
        this.itemID = itemID;
    },

    updateItem: function(itemID) {
        this.itemID = itemID;
    },
});
