/* 
 * Scene class for the GLGR Graph
 */


var GLGR = GLGR || {};



/** @constructor 
 *  @param {HTMLDivElement} canvas_element Canvas to use
 */
GLGR.Scene = function (canvas_element) {

    this.VIEWINGCONSTS = {
        //VIEW_ANGLE: 45,
        NEAR: 0.1,
        FAR: 10000,
        Z_POS: 300
    };




    //Setting the singleton
    if (GLGR.Scene.singleton_ !== undefined)
    {
        throw ('ERROR: Scene is for Singleton usage only!');
    }
    GLGR.Scene.singleton_ = this;


    /**
     * @type THREE.Scene
     */
    this.three_scene_ = null;

    /**
     * @type THREE.WebGLRenderer
     */
    this.three_renderer_ = null;

    /**
     * @type THREE.PerspectiveCamera
     */
    this.three_camera_ = null;


    this.scene_width_ = null;
    this.scene_height_ = null;

    /**
     * @type Array holding graph-objects
     */
    this.graphs_ = [];



    if (!canvas_element) {
        this.log("ERROR: Canvas element not found");
        return false;
    }
    this.canvas_ = canvas_element;


    this.interaction_handler_ = new GLGR.InteractionHandler(this);

    this.three_scene_ = new THREE.Scene();

    // set the scene size
    this.scene_width_ = jQuery(canvas_element).width();
    this.scene_height_ = jQuery(canvas_element).height();

    this._createCamera();
    this.three_scene_.add(this.three_camera_);

    // create a WebGL renderer, camera
    // and a scene
    this.three_renderer_ = new THREE.WebGLRenderer({antialias: true});
    this.three_renderer_.setSize(this.scene_width_, this.scene_height_);
    this.three_renderer_.setPixelRatio(window.devicePixelRatio);
    this.three_renderer_.setClearColor(0xFBFFFD);


    // attach the render-supplied DOM element
    jQuery(canvas_element).html(this.three_renderer_.domElement);


    GLGR.animation_demo_flag = false;

    this.time_ = {
        curr_time: null,
        delta: null
    };

    /** @type {GLGR.GraphRelationHandler} **/
    this.graph_pos_handler_ = new GLGR.GraphRelationHandler(this);
    this.graph_pos_handler_.setMode(
            GLGR.GraphRelationHandler.modes.MODE_HORIZONTAL_HIERACHICAL
            );
    this.navigation_handler_ = new GLGR.NavigationHandler(this);

    //managed by Graph Relation Handler
    this.graph_connections_ = [];

};

/**
 * 
 * @param {GLGR.Graph} graph_to_add
 * @returns {boolean}
 */
GLGR.Scene.prototype.addGraph = function (graph_to_add) {
    this.graphs_.push(graph_to_add);
    graph_to_add.initWegGlObjects();
    graph_to_add.update();

    //Line between graphs
    this.graph_pos_handler_.setUpdateNeeded(true);
};

/**
 * 
 * @returns {Array} Graph-objects
 */
GLGR.Scene.prototype.getGraphs = function () {
    return this.graphs_;
};



/**
 * Creating the Weg-GL-PerspectiveCamera and setting some viewing vars
 */
GLGR.Scene.prototype._createCamera = function () {

    if (this.scene_width_ === null || this.scene_height_ === null) {
        this.log("Error: Scene width or height not set correctly!");
        return false;
    }

    var aspect = this.scene_width_ / this.scene_height_;

    if (false)
    {
        this.three_camera_ =
                new THREE.PerspectiveCamera(
                        this.VIEWINGCONSTS.VIEW_ANGLE,
                        aspect,
                        this.VIEWINGCONSTS.NEAR,
                        this.VIEWINGCONSTS.FAR
                        );
    }
    else
    {
        this.three_camera_ =
                new THREE.OrthographicCamera(
                        this.scene_width_ / -2,
                        this.scene_width_ / 2,
                        this.scene_height_ / -2,
                        this.scene_height_ / 2,
                        this.VIEWINGCONSTS.NEAR,
                        this.VIEWINGCONSTS.FAR
                        );
    }

    //this.three_camera_.position.z = this.VIEWINGCONSTS.Z_POS;

    return true;
};



/**
 * Returns the singleton object of the scene-class
 * @returns {GLGR.Scene}
 */
GLGR.Scene.getSingleton = function () {
    return GLGR.Scene.singleton_;
};




GLGR.Scene.prototype.render = function () {

    this.graph_pos_handler_.setGraphPositions();

    //GLGR.Debug.debugTime("RENDER: START");
    this.time_.curr_time = this.time_.curr_time || Date.now();
    var now = Date.now();
    this.time_.delta = now - this.time_.curr_time;
    this.time_.curr_time = Date.now();


    for (var i = 0; i < this.graphs_.length; i++)
    {
        /** @type {GLGR.Graph} **/
        var curr_graph = this.graphs_[i];
        curr_graph.update();
    }

    for (var i = 0; i < this.graph_connections_.length; i++)
    {

        /** @type {GLGR.ConnectionGraphGraph} **/
        var connection = this.graph_connections_[i];
        connection.update();
    }

    this.three_renderer_.render(this.three_scene_, this.three_camera_);

    //GLGR.Debug.debugTime("RENDER: START");
};



GLGR.Scene.prototype.getExistingGraph = function (name, timestamp) {

    var graphs = this.getGraphs();

    for (var i = 0; i < graphs.length; i++)
    {
        var graph_uniques = graphs[i].getUniqueData();

        if (
                name === graph_uniques.name &&
                timestamp === graph_uniques.timestamp
                )
            return graphs[i];
    }

    return false;
};


/**
 * 
 * @returns {float} Time Delta for calculating animation steps
 */
GLGR.Scene.prototype.getTimeDelta = function () {
    return this.time_.delta;
    //return 10;
};

GLGR.Scene.prototype.getThreeScene = function () {
    return this.three_scene_;
};

GLGR.Scene.prototype.getThreeRenderer = function () {
    return this.three_renderer_;
};

GLGR.Scene.prototype.getThreeCamera = function () {
    return this.three_camera_;
};


GLGR.Scene.prototype.getCanvas = function () {
    return this.canvas_;
};

GLGR.Scene.prototype.getNavigationHandler = function () {
    return this.navigation_handler_;
};


GLGR.Scene.prototype.addGraphConnection = function (connection) {
    this.graph_connections_.push(connection);
};


GLGR.Scene.prototype.clearGraphConnection = function () {
    this.graph_connections_ = [];
};

/**
 * Logging-function of the scene
 * @param {String} msg
 * @returns void
 */
GLGR.Scene.prototype.log = function (msg) {
    console.log(msg);
};

