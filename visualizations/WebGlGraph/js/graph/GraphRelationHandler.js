var GLGR = GLGR || {};

/**
 * Handling the positions and visual relations of several graphs
 * @param {GLGR.Scene} scene Current scene
 */


GLGR.GraphRelationHandler = function (scene) {

    /** @type  {GLGR.Scene} **/
    this.scene_ = scene;
    this.pos_update_needed_ = false;

    this.graph_distance_ = 400;
    this.horizontal_offset_ = 0;

    this.position_mode_ = null
};

GLGR.GraphRelationHandler.modes = {
    MODE_HORIZONTAL: 0x0001
};

GLGR.GraphRelationHandler.prototype.setUpdateNeeded = function (update_needed) {
    this.pos_update_needed_ = update_needed;
};



/**
 * Calculates all (relative) positions of graphs and nodes
 */
GLGR.GraphRelationHandler.prototype.setGraphPositions = function () {

    if (!this.pos_update_needed_)
        return;

    var graphs = this.scene_.getGraphs();




    switch (this.position_mode_)
    {
        case null :
            throw ("NO POSITION MODE SET!");



        case GLGR.GraphRelationHandler.modes.MODE_HORIZONTAL:
            currX = 0 - this.graph_distance_ * (graphs.length - 1);

            for (var i = 0; i < graphs.length; i++)
            {
                graphs[i].setPosition(currX, null);
                graphs[i].force_update_while_inactive = true;
                graphs[i].update();
                currX += this.graph_distance_ + this.horizontal_offset_;
            }
            break;



        default :
            throw ("ERROR: Setted Display-Mode unknown");
    }

    this.setUpdateNeeded(false);
};


/**
 * Setting the mode of displaying the scene
 * @param {integer} mode see GLGR.GraphRelationHandler.modes
 */
GLGR.GraphRelationHandler.prototype.setMode = function (mode) {

    var found_mode = false;
    for (var key in GLGR.GraphRelationHandler.modes)
    {
        if (GLGR.GraphRelationHandler.modes[key] === mode)
        {
            found_mode = true;
            break;
        }
    }

    if (!found_mode)
        throw ("ERROR: MODE '" + mode + "' for displaying scene not found!");

    this.position_mode_ = mode;
};