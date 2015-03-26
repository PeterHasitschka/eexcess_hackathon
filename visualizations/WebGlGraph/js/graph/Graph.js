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
                sphere: {
                    radius: 10.0,
                    segments: 4,
                    rings: 8,
                    z_value: -40,
                    color: 0xFF5555
                },
                label: {
                    y_offset: 230,
                    font: "helvetiker",
                    font_size: 15,
                    color: 0x999999
                },
                rec: {
                    init_distance: 150,
                    collapse_distance : 15
                }
            };

    this.is_graph_collapsed_ = false;

    /**
     * @type Array holding recommendations
     */
    this.recommendations_ = [];


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



    this.webGlObjects_.label.position = new THREE.Vector3(
            this.position_.x - text_w / 2,
            this.position_.y + GLGR.Graph.vis_params.label.y_offset,
            0
            );
};


/**
 * Call from Scene-Renderer to update positions etc.
 */
GLGR.Graph.prototype.update = function () {



    //Demo (Lets move the graph)
    if (GLGR.animation_demo_flag === true)
        this.position_.x += 0.7 * GLGR.Scene.getSingleton().getTimeDelta() / 10;




    this.setMeshPositions_();

    var recs = this.getRecommendations();

    for (var i = 0; i < recs.length; i++)
    {
        /** @type {GLGR.Recommendation} **/
        var curr_recommendation = recs[i];
        var old_degr_ = curr_recommendation.getPositionData().degree;

        curr_recommendation.setGraphCenter(this.position_.x, this.position_.y);


        //Demo (Let's rotate the graph)
        if (GLGR.animation_demo_flag === true)
            curr_recommendation.setPositionData(
                    old_degr_ + 0.005 * GLGR.Scene.getSingleton().getTimeDelta() / 10,
                    null);


        curr_recommendation.update();
    }
};


/**
 * Init webGl Meshes and save them. Adding them to the 3-Scene
 */
GLGR.Graph.prototype.initWegGlObjects = function () {

    // create the sphere's material
    var sphereMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: GLGR.Graph.vis_params.sphere.color
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

    var labelMaterial = new THREE.MeshBasicMaterial({color: GLGR.Graph.vis_params.label.color, overdraw: true});
    var label = new THREE.Mesh(labelGeometry, labelMaterial);

    labelGeometry.computeBoundingBox();
    var text_w = labelGeometry.boundingBox.max.x - labelGeometry.boundingBox.min.x;

    label.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));

    this.webGlObjects_.label = label;

    GLGR.Scene.getSingleton().getThreeScene().add(this.webGlObjects_.label);




    this.setMeshPositions_();



    //Recommendations

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