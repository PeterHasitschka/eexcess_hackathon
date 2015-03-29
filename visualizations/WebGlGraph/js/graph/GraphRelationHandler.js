var GLGR = GLGR || {};

/**
 * Handling the positions and visual relations of several graphs
 * @param {GLGR.Scene} scene Current scene
 */


GLGR.GraphRelationHandler = function (scene) {

    /** @type  {GLGR.Scene} **/
    this.scene_ = scene;
    this.pos_update_needed_ = false;

    this.max_depth_of_graphs_ = 0;

    this.visualization_constants = {
        graph_distance: 400,
        graph_y_level_static_fact: 20,
        graph_y_level_static_add: 100
    };


    this.position_mode_ = null;
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
            currX = 0 - this.visualization_constants.graph_distance * (graphs.length - 1);

            for (var i = 0; i < graphs.length; i++)
            {
                graphs[i].setPosition(currX, null);
                graphs[i].force_update_while_inactive = true;
                graphs[i].update();
                currX += this.graph_distance_ + this.horizontal_offset_;
            }
            break;




        case GLGR.GraphRelationHandler.modes.MODE_HORIZONTAL_HIERACHICAL:

            var hierachy_unordered = this.getParentChildMap();

            //Getting roots
            var roots = [];
            for (var graph_id in hierachy_unordered)
            {
                if (hierachy_unordered[graph_id] === null)
                    roots.push(graph_id);
            }


            //Building hierachy tree
            var hierachy_data = {};
            for (var root_graph_id in roots)
            {
                hierachy_data[root_graph_id] = this.buildHierachy(root_graph_id, hierachy_unordered);

            }


            //Setting graph positions
            for (var root_graph_id in hierachy_data)
            {
                this.setHierachicalPosition(null, hierachy_data, 0, 0);
            }


            this.scene_.getNavigationHandler().setCamera(this.max_depth_of_graphs_ * this.visualization_constants.graph_distance);

            for (var i = 0; i < this.scene_.getGraphs().length; i++)
            {
                var curr_graph = this.scene_.getGraphs()[i];
                var graph_connection = new GLGR.ConnectionGraphGraph(
                        curr_graph,
                        curr_graph.getParent()
                        );

                this.scene_.addGraphConnection(graph_connection);
            }


            break;




        default :
            throw ("ERROR: Setted Display-Mode unknown");
    }

    this.setUpdateNeeded(false);
};

/**
 * Setting the positions of the graphs hierarchical in a recursive way
 * 
 * @param {integer} graph_id
 * @param {} hierarchy Hierarchy holding graph_id -> children
 * @param {integer} level 0 - * (Root has 0)
 * @param {integer} silbling_num 0 - * Number of silblings (Single child has 0)
 */
GLGR.GraphRelationHandler.prototype.setHierachicalPosition = function (graph_id, hierarchy, level, silbling_num) {

    if (graph_id !== null)
    {
        this.applyHierachicalDataToSingleGraph(graph_id, level, silbling_num);
    }




    //console.log("graph-id: " + graph_id + "  level: " + level + "  silblingnum " + silbling_num);

    var silblings = 0;
    for (var child_graph_id in hierarchy)
    {
        this.setHierachicalPosition(child_graph_id, hierarchy[child_graph_id], level + 1, silblings);
        silblings++;
    }
};



GLGR.GraphRelationHandler.prototype.applyHierachicalDataToSingleGraph = function (graph_id, level, silbling_num) {

    var graphs = this.scene_.getGraphs();

    /** @type{GLGR.Graph} **/
    var current_graph = null;

    for (var i = 0; i < graphs.length; i++)
    {
        //console.log(graphs[i].getId() + " -- " + parseInt(graph_id));
        if (graphs[i].getId() === parseInt(graph_id))
        {
            current_graph = graphs[i];
            break;
        }
    }


    if (!current_graph)
        throw("ERROR: Could not find graph with id " + graph_id);


    var y_pos_level = ((this.max_depth_of_graphs_ / level) *
            this.visualization_constants.graph_y_level_static_fact +
            this.visualization_constants.graph_y_level_static_add) *
            silbling_num;



    current_graph.setPosition(level * this.visualization_constants.graph_distance, y_pos_level);


    //Alternate label position a little bit...
    //var y_label_offset = 35 * (level % 2);
    //current_graph.setLabelIndividualYOffset(y_label_offset);




    current_graph.force_update_while_inactive = true;
    current_graph.update();
};



/**
 * Calculate hierachy recursively
 * 
 * @param {integer} parent_id
 * @param {type} hierachy_unordered array holding each graphid -> parentid
 * @param {integer} depth optional for calculating the maximal level of the tree
 * @returns {} Object holding the hierachy
 */
GLGR.GraphRelationHandler.prototype.buildHierachy = function (parent_id, hierachy_unordered, depth) {

    if (depth === undefined)
        depth = 0;

    this.max_depth_of_graphs_ = Math.max(this.max_depth_of_graphs_, depth);

    var children = {};
    for (var graph_id in hierachy_unordered)
    {
        if (parseInt(hierachy_unordered[graph_id]) === parseInt(parent_id))
        {
            children[graph_id] = this.buildHierachy(graph_id, hierachy_unordered, depth + 1);
        }
    }
    return children;
};


/**
 * Returning the map of parents and children
 */
GLGR.GraphRelationHandler.prototype.getParentChildMap = function () {

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