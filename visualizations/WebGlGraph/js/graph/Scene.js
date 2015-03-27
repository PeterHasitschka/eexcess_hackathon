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

    this.horizontal_offset_ = 0;

    this.graph_distance_ = 400;

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

    this.has_to_recalculate_graph_positions_ = false;
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
    this.has_to_recalculate_graph_positions_ = true;
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


/**
 * Calculates all (relative) positions of graphs and nodes
 */
GLGR.Scene.prototype.calculate2DPositionsOfGraphs = function () {
    
    //Paint the graphs from left to right
    

    currX = 0 - this.graph_distance_ * (this.graphs_.length - 1);

    for (var i = 0; i < this.graphs_.length; i++)
    {
        this.graphs_[i].setPosition(currX, null);
        this.graphs_[i].force_update_while_inactive = true;
         this.graphs_[i].update();
        currX += this.graph_distance_ + this.horizontal_offset_;
        
    }

    this.has_to_recalculate_graph_positions_ = false;
};


GLGR.Scene.prototype.render = function () {

    if (this.has_to_recalculate_graph_positions_)
        this.calculate2DPositionsOfGraphs();

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

    this.three_renderer_.render(this.three_scene_, this.three_camera_);

    //GLGR.Debug.debugTime("RENDER: START");
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


/**
 * Draw the scene to canvas
 */
/*
 GLGR.Scene.prototype.buildScene = function () {
 
 GLGR.Debug.debugTime("BUILD SCENE: START");
 if (this.three_scene_ === null) {
 throw ("ERROR: Scene not initialized.");
 }
 
 this.calculate2DPositionsOfGraphs();
 
 for (var i = 0; i < this.graphs_.length; i++)
 {
 this.graphs_[i].initWegGlObjects();
 }
 
 GLGR.Debug.debugTime("BUILD SCENE: END");
 };
 */


/**
 * Move the scene's camera
 * @param {float | null} x
 * @param {type | null} y
 */
GLGR.Scene.prototype.moveCamera = function (x, y) {

    if (x === null || x === undefined)
        x = 0;
    if (y === null || y === undefined)
        y = 0;

    this.three_camera_.position.x += x;
    this.three_camera_.position.y += y;


};

/**
 * Perform zoom
 * @param {float} zoom_factor
 */
GLGR.Scene.prototype.zoom = function (zoom_factor) {

    this.three_camera_.zoom = zoom_factor;
    this.three_camera_.updateProjectionMatrix();
};


/**
 * Logging-function of the scene
 * @param {String} msg
 * @returns void
 */
GLGR.Scene.prototype.log = function (msg) {
    console.log(msg);
};

