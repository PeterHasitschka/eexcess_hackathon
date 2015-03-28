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
    MODE_HORIZONTAL_ADDING_ORDER: 0x0001,
    MODE_HORIZONTAL_HIERACHICAL: 0x0002
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



        case GLGR.GraphRelationHandler.modes.MODE_HORIZONTAL_ADDING_ORDER:
            currX = 0 - this.graph_distance_ * (graphs.length - 1);

            for (var i = 0; i < graphs.length; i++)
            {
                graphs[i].setPosition(currX, null);
                graphs[i].force_update_while_inactive = true;
                graphs[i].update();
                currX += this.graph_distance_ + this.horizontal_offset_;
            }
            break;

        case GLGR.GraphRelationHandler.modes.MODE_HORIZONTAL_HIERACHICAL:
            console.log("WARNING! MODE NOT WORKING YET! SWITCH TO 'MODE_HORIZONTAL_ADDING_ORDER' INSTEAD FOR VISIBLE RESULT");
            
            
            console.log("Getting hierachy..");
            var hierachy = this.getGraphHierachy();
            console.log(hierachy);
          
            
            break;




        default :
            throw ("ERROR: Setted Display-Mode unknown");
    }

    this.setUpdateNeeded(false);
};



/**
 * Returning the hierachy
 */
GLGR.GraphRelationHandler.prototype.getGraphHierachy = function () {

    var graphs = this.scene_.getGraphs();

    var hierachy = {};
    
    
    
    for (var i = 0; i < graphs.length; i++)
    {
        /** @type{GLGR.Graph} **/
        var graph = graphs[i];
        var parent_id = graph.getParentId();
        hierachy[graph.getId()] = parent_id;
    }

    return hierachy;
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