var GLGR = GLGR || {};


GLGR.ConnectionGraphGraph = function (src_graph, dst_graph) {

    /** @type {GLGR.Graph} **/
    this.src_ = src_graph;

    /** @type {GLGR.Graph} **/
    this.dst_ = dst_graph;

    this.vis_data = {
        width: 0.5,
        bold_width: 1,
        color: 0xFF3333,
        z: -50
    };

    this.log = true;

    this.is_visible_ = true;
    this.is_bold = false;
};

GLGR.ConnectionGraphGraph.prototype = new GLGR.ConnectionAbstract();



GLGR.ConnectionGraphGraph.prototype.getPosSrc = function () {
    if (!this.src_)
        return null;

    var pos = this.src_.getNodePosition();

    if (!pos)
        return null;
    return {x: pos.x, y: pos.y};
};

GLGR.ConnectionGraphGraph.prototype.getPosDst = function () {


    if (!this.dst_)
        return null;

    var pos = this.dst_.getNodePosition();


    if (!pos)
        return null;
    return {x: pos.x, y: pos.y};
};