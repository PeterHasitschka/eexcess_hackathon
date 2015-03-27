/* 
 * Graph class for the RSWEBGL Graph
 */


var GLGR = GLGR || {};

/**
 * Constructor of the graph-object
 * @param {string} name_ Name of the node (optional)
 */
GLGR.Graph = function (name_)
{
    /** @type Integer **/
    this.id_ = null;
    this.parent_id_ = null;

    this.is_active_ = true;

    //Flag that can be set to force an update also if graph inactive
    this.force_update_while_inactive = false;

    this.graph_name_ = name_;

    //Meshes
    this.webGlObjects_ = {
        node: null,
        label: null
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
                label: {
                    y_offset: 200,
                    font: "helvetiker",
                    font_size: 15,
                    color: 0x555555
                },
                rec: {
                    init_distance: 150,
                    collapse_distance: 15
                }
            };

    this.is_graph_collapsed_ = false;

    /**
     * @type Array holding recommendations
     */
    this.recommendations_ = [];

    this.is_graph_initialized_ = false;
    this.are_recs_initialized_ = false;

    /** Static array holding the list of all graphs**/
    GLGR.Graph.graphlist_ = GLGR.Graph.graphlist_ || [];
    this.id_ = GLGR.Graph.graphlist_.length;
    GLGR.Graph.graphlist_.push(this);

    //this.mouse_current_over_obj = false;
};


/**
 * 
 * @param {GLGR.Recommendation} rec_to_add
 */
GLGR.Graph.prototype.addRecommendation = function (rec_to_add) {
    this.recommendations_.push(rec_to_add);
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

    if (parent_graph !== null && parent_graph !== undefined)
        this.parent_id_ = parent_graph.getId();
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

    var text_w = this.webGlObjects_.label.geometry.boundingBox.max.x -
            this.webGlObjects_.label.geometry.boundingBox.min.x;



    this.webGlObjects_.label.position.set(
            this.position_.x - text_w / 2,
            this.position_.y + GLGR.Graph.vis_params.label.y_offset,
            -10
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
                    old_degr_ + 0.005 * GLGR.Scene.getSingleton().getTimeDelta() / 10,
                    null);

        curr_recommendation.update();
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
    GLGR.Scene.getSingleton().getThreeScene().add(this.webGlObjects_.node);



    //Label

    var labelText;

    if (!this.graph_name_)
        labelText = "Graph #" + this.getId();
    else
        labelText = this.graph_name_;

    var labelGeometry = new THREE.TextGeometry(labelText,
            {
                font: GLGR.Graph.vis_params.label.font,
                size: GLGR.Graph.vis_params.label.font_size
            }
    );

    var labelMaterial = new THREE.MeshBasicMaterial(
            {
                color: GLGR.Graph.vis_params.label.color,
                overdraw: true,
                transparent: true
            }
    );
    var label = new THREE.Mesh(labelGeometry, labelMaterial);

    labelGeometry.computeBoundingBox();
    var text_w = labelGeometry.boundingBox.max.x - labelGeometry.boundingBox.min.x;

    label.applyMatrix(new THREE.Matrix4().makeScale(1, -1, -1));

    this.webGlObjects_.label = label;

    GLGR.Scene.getSingleton().getThreeScene().add(this.webGlObjects_.label);




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


GLGR.Graph.prototype.handleGraphClick = function () {

    /** @var {GLGR.Graph} **/
    var that = this.graphref;
    
    
    //Activate on click
    if (!that.is_active_)
    {
        that.setIsActive(true);
        return;
    }
    
    
    
    if (that.is_graph_collapsed_ === false)
        that.collapseGraph();
    else
        that.expandGraph();



    //Demo
    var infoblock = jQuery('#information-container-graph-info');
    if (!infoblock.length)
        throw ("ERROR: DEMO GRAPH INFO BLOCK NOT EXISTING! CLEAN UP YOUR CODE!");
    jQuery('#information-container-graph-info-id').html(that.getId());
    jQuery('#information-container-graph-info-title').html(that.graph_name_);
    infoblock.show();
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