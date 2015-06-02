var GLGR = GLGR || {};


GLGR.ConnectionGraphRec = function (graph, recommendation) {

    /** @type {GLGR.Graph} **/
    this.graph_ = graph;

    /** @type {GLGR.Recommendation} **/
    this.rec_ = recommendation;
    
    this.vis_data = {
        width: 1,
        bold_width: 3,
        color: 0x668866,
        z: -50
    };
    
    this.is_visible_ = true;
    this.is_bold = false;
};

GLGR.ConnectionGraphRec.prototype = new GLGR.ConnectionAbstract();



GLGR.ConnectionGraphRec.prototype.getPosSrc = function () {
    var pos = this.graph_.getNodePosition();
    return {x: pos.x, y: pos.y};
};

GLGR.ConnectionGraphRec.prototype.getPosDst = function () {

    var pos = this.rec_.getNodePosition();
    return {x: pos.x, y: pos.y};
};