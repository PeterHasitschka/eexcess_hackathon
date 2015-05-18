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
    {
        return;
    }

    var graphs = this.scene_.getGraphs();



    switch (this.position_mode_)
    {
        case null :
            throw ("NO POSITION MODE SET!");




        case GLGR.GraphRelationHandler.modes.MODE_HORIZONTAL_ADDING_ORDER:
            var currX = 0 - this.visualization_constants.graph_distance * (graphs.length - 1);

            for (var i = 0; i < graphs.length; i++)
            {
                graphs[i].setPosition(currX, null);
                graphs[i].force_update_while_inactive = true;
                graphs[i].update();

                currX += this.graph_distance_ + this.horizontal_offset_;
            }
            break;




        case GLGR.GraphRelationHandler.modes.MODE_HORIZONTAL_HIERACHICAL:

            var hierarchy_unordered = this.getParentChildMap();

            //Getting roots
            var roots = [];
            for (var graph_id in hierarchy_unordered)
            {
                if (hierarchy_unordered[graph_id] === null)
                    roots.push(graph_id);
            }


            /*
             * Skip graphs that are unchecked in dashboard bookmark list.
             * @see {GLGR.WebGlDashboardHandler.handleBookmarkCheckboxChange}
             */
            hierarchy_unordered = this.filterHiddenGraphs_(hierarchy_unordered);

            //Updating the parent-ids of existing graphs
            this.updateParents_(hierarchy_unordered);




            //Building hierarchy tree
            var hierarchy_data = {};
            for (var root_graph_id in roots)
            {
                hierarchy_data[root_graph_id] = this.buildHierachy(root_graph_id, hierarchy_unordered);

            }





            //Setting graph positions
            this.setHierachicalPosition(null, hierarchy_data, 0, 0);

            //Move camera to active graph or to farest one
            if (this.scene_.active_graph)
            {
                //console.log("moving camera to active", this.scene_.active_graph);
                this.scene_.getNavigationHandler().setCamera(
                        this.scene_.active_graph.getPosition().x,
                        this.scene_.active_graph.getPosition().y
                        );
            }
            else
            {
                console.log("moving camera to farest right");
                this.scene_.getNavigationHandler().setCamera(
                        (this.max_depth_of_graphs_ + 1) *
                        this.visualization_constants.graph_distance
                        );
            }

            for (var i = 0; i < this.scene_.getGraphs().length; i++)
            {

                var curr_graph = this.scene_.getGraphs()[i];
                var graph_connection = new GLGR.ConnectionGraphGraph(
                        curr_graph.getParent(),
                        curr_graph
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
 * Filtering out graphs that are hidden by checkbox in Dashboard.
 * Going through variable GLGR.WebGlDashboardHandler.graphs_to_skip_by_checkbox
 * Beware that the graphs are still visible after this function. It only calculates
 * the positions and hierarchies. They are getting hidden in the @see{GLGR.WebGlDashboardHandler.handleBookmarkCheckboxChange} function.
 * @param {type} hierarchy_data
 * @returns {undefined}
 */
GLGR.GraphRelationHandler.prototype.filterHiddenGraphs_ = function (hierarchy_unordered) {

    var graphs_to_skip = GLGR.WebGlDashboardHandler.graphs_to_skip_by_checkbox;

    for (var i = 0; i < graphs_to_skip.length; i++) {
        var graph_id_to_skip = graphs_to_skip[i];

        //Getting parent
        var new_parent_id = hierarchy_unordered[parseInt(graph_id_to_skip)];
        
        if (new_parent_id !== null)
            new_parent_id = parseInt(new_parent_id);
        
        
        for (var hierarchy_key in hierarchy_unordered) {

            //Delete node to hide
            if (parseInt(hierarchy_key) === parseInt(graph_id_to_skip)) {
                delete hierarchy_unordered[hierarchy_key];
            }

            //Set parent of deleted to all children
            if (parseInt(hierarchy_unordered[hierarchy_key]) === parseInt(graph_id_to_skip)) {
                hierarchy_unordered[hierarchy_key] = new_parent_id;
            }
        }
    }
    return hierarchy_unordered;
};


/**
 * After updating the hierarchy existing graphs in the scene may have the wrong
 * parent-id. This function updates each existing graph's parent.
 * @param {} hierarchy_unordered
 */
GLGR.GraphRelationHandler.prototype.updateParents_ = function (hierarchy_unordered) {

    for (var current_graph_id in hierarchy_unordered) {

        var current_parent_id = hierarchy_unordered[current_graph_id];
        console.log("UPDATING PARENTS: " + current_graph_id + " -> " + current_parent_id);
        
        /** @type {GLGR.Graph} **/
        var graph = this.scene_.getGraph(current_graph_id);
        
        if (!graph)
            throw("Could not get graph to set parent id: " + current_graph_id);
        
        var parent_graph = this.scene_.getGraph(current_parent_id);
        graph.setParent(parent_graph);
    }

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

    if (GLGR.GraphRelationHandler.isInt(graph_id))
    {
        this.applyHierachicalDataToSingleGraph(graph_id, level, silbling_num);
    }


    //console.log("graph-id: " + graph_id + "  level: " + level + "  silblingnum " + silbling_num);

    //GO DOWN RECURSIVELY 

    var silblings = 0;
    for (var child_graph_id in hierarchy)
    {
        var next_level;
        next_level = level + 1;

        this.setHierachicalPosition(child_graph_id, hierarchy[child_graph_id], next_level, silblings);
        silblings++;
    }
};

GLGR.GraphRelationHandler.isInt = function (n) {
    return n !== null && n % 1 === 0;
};

GLGR.GraphRelationHandler.prototype.applyHierachicalDataToSingleGraph = function (graph_id, level, silbling_num) {

    var graphs = this.scene_.getGraphs();

    //console.log(graphs);
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


    var parent_y_add = 0;
    var parent = current_graph.getParent();
    if (parent) {
        parent_y_add = parent.getPosition().y;
    }


    var y_pos_level = ((this.max_depth_of_graphs_ / level) *
            this.visualization_constants.graph_y_level_static_fact +
            this.visualization_constants.graph_y_level_static_add) *
            silbling_num + parent_y_add;


    var x_pos;
    x_pos = level * this.visualization_constants.graph_distance;


    current_graph.setPosition(x_pos, y_pos_level);


    //Alternate label position a little bit...
    //var y_label_offset = 35 * (level % 2);
    //current_graph.setLabelIndividualYOffset(y_label_offset);




    current_graph.force_update_while_inactive = true;
    current_graph.update();
};



/**
 * Calculate hierarchy recursively
 * 
 * @param {integer} parent_id
 * @param {type} hierarchy_unordered array holding each graphid -> parentid
 * @param {integer} depth optional for calculating the maximal level of the tree
 * @returns {} Object holding the hierarchy
 */
GLGR.GraphRelationHandler.prototype.buildHierachy = function (parent_id, hierarchy_unordered, depth) {

    if (depth === undefined)
        depth = 0;

    this.max_depth_of_graphs_ = Math.max(this.max_depth_of_graphs_, depth);

    var children = {};
    for (var graph_id in hierarchy_unordered)
    {
        if (parseInt(hierarchy_unordered[graph_id]) === parseInt(parent_id))
        {
            children[graph_id] = this.buildHierachy(graph_id, hierarchy_unordered, depth + 1);
        }
    }
    return children;
};


/**
 * Returning the map of parents and children
 */
GLGR.GraphRelationHandler.prototype.getParentChildMap = function () {

    var graphs = this.scene_.getGraphs();

    var hierarchy = {};



    for (var i = 0; i < graphs.length; i++)
    {
        /** @type{GLGR.Graph} **/
        var graph = graphs[i];
        var parent_id = graph.getParentId();
        hierarchy[graph.getId()] = parent_id;
    }

    return hierarchy;
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