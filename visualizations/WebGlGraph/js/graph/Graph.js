/* 
 * Graph class for the RSWEBGL Graph
 */


var GLGR = GLGR || {};

/**
 * Constructor of the graph-object
 * @param {string} name_ Name of the node (optional)
 */
GLGR.Graph = function (graph_name, data)
{
    /** @type Integer **/
    this.id_ = null;
    this.parent_id_ = null;

    //Number to distinguish the silblings in the hierachical branch
    this.parents_childnum_ = null;


    //Flag that can be set to force an update also if graph inactive
    this.force_update_while_inactive = false;

    this.graph_name_ = graph_name;
    this.graph_data_ = data;
    //Meshes
    this.webGlObjects_ = {
        node: null
    };

    this.position_ = {
        x: 0.0,
        y: 0.0
    };



    /** 
     * Static object for visualization paremters
     */
    GLGR.Graph.vis_params = GLGR.Graph.vis_params ||
            {
                transparency: {
                    inactive: 0.5
                },
                sphere: {
                    radius: 10.0,
                    segments: 4,
                    rings: 8,
                    z_value: -20,
                    color: 0x1d904e
                },
                rec: {
                    init_distance: 150,
                    collapse_distance: 15
                }
            };



    //Graph gets updated in each step
    this.is_active_ = true;

    //Hide Recommendations (Move them to center)
    this.is_graph_collapsed_ = false;

    //Hides or shows the complete graph
    this.is_graph_visible_ = true;

    //Flag that holds select-status
    this.is_graph_selected_ = false;


    /**
     * @type Array holding recommendations
     */
    this.recommendations_ = [];

    /**
     * @type Array holding GLGR.ConnectionGraphRec objects
     */
    this.rec_connections_ = [];

    this.is_graph_initialized_ = false;
    this.are_recs_initialized_ = false;

    /** 
     * Static array holding the list of all graphs.
     * Necessary because the graphs may be created before adding to the scene
     * **/
    GLGR.Graph.graphlist_ = GLGR.Graph.graphlist_ || [];
    this.id_ = GLGR.Graph.graphlist_.length;
    GLGR.Graph.graphlist_.push(this);

    //this.mouse_current_over_obj = false;
};


/**
 * 
 * @param {GLGR.Recommendation} rec_to_add
 * @parem {boolean | null | undefined} recalculate_positions Flag if positions have to be resetted.
 */
GLGR.Graph.prototype.addRecommendation = function (rec_to_add, recalculate_positions) {


    this.recommendations_.push(rec_to_add);

    if (recalculate_positions === true)
        this.initRecommendationObjs_();
};



GLGR.Graph.prototype.getRecommendations = function () {
    return this.recommendations_;
};





/**
 * 
 * @param {GLGR.Graph} parent_graph
 * @returns boolean
 */
GLGR.Graph.prototype.setParent = function (parent_graph) {

    if (parent_graph !== undefined)
        if (parent_graph !== null)
            this.parent_id_ = parent_graph.getId();
        else
            this.parent_id_ = null;
};

/**
 * Returning the ID of the parent's graph
 * @returns {GLGR.Graph.id_ | null}
 */
GLGR.Graph.prototype.getParentId = function () {
    return this.parent_id_;
};

/**
 * Returning the parent's graph
 * @returns {GLGR.Graph.id_ | null}
 */
GLGR.Graph.prototype.getParent = function () {
    var parent_id = this.getParentId();

    var all_graphs = GLGR.Scene.getCurrentScene().getGraphs();
    for (var i = 0; i < all_graphs.length; i++)
    {
        if (all_graphs[i].getId() === parent_id)
        {
            return all_graphs[i];
        }
    }

};


/**
 * Returns the graph's id
 * @returns {GLGR.Graph.id_}
 */
GLGR.Graph.prototype.getId = function () {
    return this.id_;
};


GLGR.Graph.prototype.setMeshPositions_ = function () {


    this.webGlObjects_.node.position.set(
            this.position_.x,
            this.position_.y,
            GLGR.Graph.vis_params.sphere.z_value
            );
};


/**
 * Call from Scene-Renderer to update positions etc.
 */
GLGR.Graph.prototype.update = function () {

    //Only update if active or inactive and force flag active
    if (!this.is_active_ && !this.force_update_while_inactive)
        return;


    //DO THE FOLLOWING EVEN IF INACTIVE BUT FORCE-FLAG IS SET!

    //Setting transparency caused by inactivity
    var transparency_val = 1;
    if (!this.is_active_)
    {
        transparency_val = GLGR.Graph.vis_params.transparency.inactive;
    }
    this.updateTransparency(transparency_val);


    this.force_update_while_inactive = false;


    this.setMeshPositions_();


    if (!this.is_active_)
        return;


    //DO THE FOLLOWING ONLY IF ACTIVE!


    //If graph was inactive from the beginning, recs may not be created
    if (!this.are_recs_initialized_)
    {
        //console.log("Recs of graph " + this.getId() + " need to be init now!");
        this.initRecommendationObjs_();
    }






    var recs = this.getRecommendations();

    for (var i = 0; i < recs.length; i++)
    {
        /** @type {GLGR.Recommendation} **/
        var curr_recommendation = recs[i];
        var old_degr_ = curr_recommendation.getPositionData().degree;

        curr_recommendation.setGraphCenter(this.position_.x, this.position_.y);
        curr_recommendation.setTransparencyFromGraph(transparency_val);

        //Demo (Let's rotate the graph)
        if (GLGR.animation_demo_flag === true)
            curr_recommendation.setPositionData(
                    old_degr_ + 0.005 * GLGR.Scene.getCurrentScene().getTimeDelta() / 10,
                    null);

        //Delete overwritten color if not allowed
        if (!GLGR.Scene.getCurrentScene().allow_rec_color_overwrites)
            curr_recommendation.setColorOverwrite(null);

        curr_recommendation.update();
    }

    for (var i = 0; i < this.rec_connections_.length; i++)
    {
        /** @type {GLGR.ConnectionGraphRec} **/
        var curr_rec_connection = this.rec_connections_[i];

        curr_rec_connection.setIsBold(this.is_graph_selected_);

        curr_rec_connection.update();
    }
};


/**
 * Updating the transparency may changed by inactivity flag
 */
GLGR.Graph.prototype.updateTransparency = function (transparency_val) {


    //Iterate through gl-objects
    for (var webGlObjKey in this.webGlObjects_)
    {
        var curr_gl_obj = this.webGlObjects_[webGlObjKey];

        if (curr_gl_obj === null)
            continue;
        if (curr_gl_obj.material.opacity !== transparency_val)
            curr_gl_obj.material.opacity = transparency_val;
    }
};

/**
 * Init webGl Meshes and save them. Adding them to the 3-Scene
 */
GLGR.Graph.prototype.initWegGlObjects = function () {

    if (this.is_graph_initialized_)
        return;
    // create the sphere's material
    var sphereMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: GLGR.Graph.vis_params.sphere.color,
                        transparent: true
                    });

    var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                    GLGR.Graph.vis_params.sphere.radius,
                    GLGR.Graph.vis_params.sphere.segments,
                    GLGR.Graph.vis_params.sphere.rings),
            sphereMaterial);

    sphere.interaction_handlers = {
        "mouseclick": this.handleGraphClick,
        "graphref": this
    };

    this.webGlObjects_.node = sphere;
    GLGR.Scene.getCurrentScene().getThreeScene().add(this.webGlObjects_.node);




    this.setMeshPositions_();

    //Only init recs if active, else do on update
    if (this.is_active_)
    {
        //Recommendations
        this.initRecommendationObjs_();

    }

    this.is_graph_initialized_ = true;
};


GLGR.Graph.prototype.initRecommendationObjs_ = function () {
    //Calculate the degree of the recommendation
    var rec_dist = GLGR.Graph.vis_params.rec.init_distance
    var rec_degree_step = (Math.PI * 2) / this.getRecommendations().length;
    var rec_degree = 0.0;

    var recs = this.getRecommendations();
    for (var i = 0; i < recs.length; i++)
    {
        //First setting the global position of the graph
        recs[i].setPositionData(rec_degree, rec_dist);
        recs[i].setGraphCenter(this.position_.x, this.position_.y);
        recs[i].initWegGlObjects();

        rec_degree += rec_degree_step;

        //add connection
        var rec_connection = new GLGR.ConnectionGraphRec(this, recs[i]);
        this.rec_connections_.push(
                rec_connection
                );

    }

    this.are_recs_initialized_ = true;
};

/**
 * Setting the graph's 2D-Position
 * @param {float|null} x
 * @param {float|null} y
 * @returns {undefined}
 */
GLGR.Graph.prototype.setPosition = function (x, y) {
    if (x !== null)
        this.position_.x = x;
    if (y !== null)
        this.position_.y = y;
};

/**
 * Returns an object containing the x and y position of the graph
 * @returns {GLGR.Graph.position_}
 */
GLGR.Graph.prototype.getPosition = function () {
    return this.position_;
};

/**
 * Return the current position of the three-mesh-node
 * @returns {} array holding x and y of the node position
 */
GLGR.Graph.prototype.getNodePosition = function () {
    if (this.webGlObjects_.node)
        return this.webGlObjects_.node.position;
    return null;
};


GLGR.Graph.prototype.handleGraphClick = function () {

    /** @var {GLGR.Graph} **/
    var that = this.graphref;

    //Ignore click if hidden!
    if (!that.getisVisible())
        return;
    
    //Activate on click
    if (!that.is_active_)
    {
        that.setIsActive(true);
    }

    that.setIsSelected(!that.getIsSelected());






    //Show/Hide compare button
    //GLGR.Scene.getCurrentScene().getSimpleComparer().manageCompareButton();

    //Unset all overwritten colors of every rec
    //GLGR.Scene.getCurrentScene().allow_rec_color_overwrites = false;

    /*
     if (that.is_graph_collapsed_ === false)
     that.collapseGraph();
     else
     that.expandGraph();s
     */



    console.log("GRAPH CLICKED :", that);


    var status_text = that.graph_name_ + " (ID: " + that.getId() + ")";

    jQuery('#webgl_status_bar_content').html(status_text);

};


GLGR.Graph.prototype.collapseGraph = function () {
    var recs = this.getRecommendations();

    for (var i = 0; i < recs.length; i++)
    {
        /** @type {GLGR.Recommendation} **/
        var curr_recommendation = recs[i];
        curr_recommendation.setPositionData(
                null,
                GLGR.Graph.vis_params.rec.collapse_distance);
        curr_recommendation.toggleStateMinimized();
    }

    this.is_graph_collapsed_ = true;
};


GLGR.Graph.prototype.expandGraph = function () {
    var recs = this.getRecommendations();

    for (var i = 0; i < recs.length; i++)
    {
        /** @type {GLGR.Recommendation} **/
        var curr_recommendation = recs[i];
        curr_recommendation.setPositionData(
                null,
                GLGR.Graph.vis_params.rec.init_distance);
        curr_recommendation.toggleStateMinimized();
    }

    this.is_graph_collapsed_ = false;
};


GLGR.Graph.prototype.setIsActive = function (is_active) {
    this.is_active_ = is_active;
    this.force_update_while_inactive = true;
};

/**
 * Hides the graph (Not visible at all)
 */
GLGR.Graph.prototype.hide = function () {
    console.log("HIDING GRAPH " + this.getId());
    this.setMeshesVisible_(false);
};


GLGR.Graph.prototype.setIsSelected = function (is_selected) {
    this.is_graph_selected_ = is_selected;
};


GLGR.Graph.prototype.getIsSelected = function () {
    return this.is_graph_selected_;
};


/**
 * Shows (unhides) the graph
 */
GLGR.Graph.prototype.show = function () {
    console.log("SHOWING GRAPH " + this.getId());
    this.setMeshesVisible_(true);
};

GLGR.Graph.prototype.setMeshesVisible_ = function (status) {


    this.is_graph_visible_ = status;


    this.webGlObjects_.node.visible = status;

    for (var i = 0; i < this.recommendations_.length; i++)
    {
        if (status)
            this.recommendations_[i].show();
        else
            this.recommendations_[i].hide();
    }

    for (var i = 0; i < this.rec_connections_.length; i++)
    {
        if (status)
            this.rec_connections_[i].show();
        else
            this.rec_connections_[i].hide();
    }


    var graph_connections = GLGR.Scene.getCurrentScene().getGraphConnections();

    for (var i = 0; i < graph_connections.length; i++)
    {
        /** @type {GLGR.ConnectionGraphGraph} **/
        var curr_connection = graph_connections[i];

        var dst_graph = curr_connection.getDstGraph();
        if (dst_graph.getId() === this.getId()) {
            if (status)
                curr_connection.show();
            else
                curr_connection.hide();
        }
    }

};

/**
 * Returns 
 * @returns {Boolean}
 */
GLGR.Graph.prototype.getisVisible = function () {
    return this.is_graph_visible_;
};

/**
 * Setting the id of the parent's child.
 * Necessary for correct displaying the hierachy
 * @param {integer} child_number
 */
GLGR.Graph.prototype.setParentsChildnum = function (child_number) {
    this.parents_childnum_ = child_number;
};

/**
 * Getting the id of the parent's child.
 * Necessary for correct displaying the hierachy
 * @return {integer} child_number
 */
GLGR.Graph.prototype.getParentsChildnum = function () {
    return this.parents_childnum_;
};


/**
 * Returning the name and timestamp of the graph to identify it
 * @returns {}
 */
GLGR.Graph.prototype.getUniqueData = function () {
    return {
        name: this.graph_name_,
        timestamp: this.graph_data_.timestamp
    };
};