

var GLVIS = GLVIS || {};



/** @constructor 
 *  @param {Object} canvas_element jQuery-object of the container holding the canvas
 */
GLVIS.Scene = function (canvas) {

    if (GLVIS.Scene.current_scene)
        throw new ("ERROR! ALREADY SCENE REGISTERED AS CURRENT SCENE!");
    GLVIS.Scene.current_scene = this;


    /** @type {GLVIS.NavigationHandler} **/
    this.navigation_handler_ = new GLVIS.NavigationHandler(this);
    this.db_handler_ = null;

    /** @type {GLVIS.RecDashboardHandler} **/
    this.recdashboard_handler_ = new GLVIS.RecDashboardHandler();

    /** @type{GLVIS.WebGlHandler} **/
    this.webgl_handler_ = new GLVIS.WebGlHandler(canvas);

    /** @type {GLVIS.InteractionHandler} **/
    this.interaction_handler_ = new GLVIS.InteractionHandler(this);

    /** @type{GLVIS.CollectionPosLinear} **/
    this.collection_position_handler_ = new GLVIS.CollectionPosLinear();

    this.time_ = {
        current: null,
        delta: null
    };

    /**
     * Holding @see{GLVIS.Collection} objects
     */
    this.collections_ = [];
};


GLVIS.Scene.prototype.render = function () {

    //Set Time Delta for performance-independent animation speed
    this.time_.current = this.time_.current || Date.now();
    var now = Date.now();
    this.time_.delta = now - this.time_.current;
    this.time_.current = Date.now();




    for (var i = 0; i < this.collections_.length; i++) {
        this.collections_[i].render();
    }
    this.webgl_handler_.render();


    this.navigation_handler_.performAnimations();
};

/**
 * Adding a collection to the scene
 * @param {GLVIS.Collection} collection
 */
GLVIS.Scene.prototype.addCollection = function (collection) {
    this.collections_.push(collection);

};

/**
 * Returning all registered collections
 * @returns {Array}
 */
GLVIS.Scene.prototype.getCollections = function () {
    return this.collections_;
};





/**
 * Getter for the WebGlHandler
 * @returns {GLVIS.WebGlHandler}
 */
GLVIS.Scene.prototype.getWebGlHandler = function () {
    return this.webgl_handler_;
};

/**
 * Getter for the NavigationHandler
 * @returns {GLVIS.NavigationHandler}
 */
GLVIS.Scene.prototype.getNavigationHandler = function () {
    return this.navigation_handler_;
};

/**
 * Getter for the Rec-Dashboard-Handler
 * @returns {GLVIS.RecDashboardHandler}
 */
GLVIS.Scene.prototype.getRecDashboardHandler = function () {
    return this.recdashboard_handler_;
};

/**
 * Returning the scene's position handler for the collections
 * @returns {GLVIS.CollectionPosLinear}
 */
GLVIS.Scene.prototype.getCollectionPositionHandler = function () {
    return this.collection_position_handler_;
};


/**
 * 
 * @returns {float} Time Delta for calculating animation steps
 */
GLVIS.Scene.prototype.getTimeDelta = function () {
    return this.time_.delta;
};

/**
 * 
 * @param {integer} collection_id
 * @returns {GLIVS.Collection || null}
 */
GLVIS.Scene.prototype.getCollection = function (collection_id) {

    collection_id = parseInt(collection_id);

    for (var key in this.collections_) {
        if (this.collections_[key].getId() === collection_id)
            return this.collections_[key];

    }
    return null;
};

/**
 * Sets positions of the loaded collections and connects them with a connection
 * @returns {undefined}
 */
GLVIS.Scene.prototype.initCollectionNetwork = function () {
    this.getCollectionPositionHandler().calculatePositions();

    //Creating parent connections
    for (var key in this.collections_) {
        this.collections_[key].updateParentConnection();
    }
};


/******************
 * 
 * Static functions
 * 
 ******************/


GLVIS.Scene.current_scene = null;

/**
 * Get current scene
 * @returns {GLVIS.Scene}
 */
GLVIS.Scene.getCurrentScene = function () {
    if (!this.current_scene)
        throw("ERROR: NO CURRENT SCENE!");

    return this.current_scene;
};

