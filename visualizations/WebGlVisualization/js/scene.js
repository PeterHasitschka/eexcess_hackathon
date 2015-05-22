

var GLVIS = GLVIS || {};



/** @constructor 
 *  @param {Object} canvas_element jQuery-object of the container holding the canvas
 */
GLVIS.Scene = function (canvas) {


    this.interaction_handler_ = null;
    this.navigation_handler_ = null;
    this.db_handler_ = null;
    this.recdashboard_handler = null;

    /** @type{GLVIS.WebGlHandler} **/
    this.webgl_handler_ = new GLVIS.WebGlHandler(canvas);


    this.time = {
        current: null,
        delta: null
    };

    /**
     * Holding @see{GLVIS.Collection} objects
     */
    this.collections_ = [];
};


GLVIS.Scene.prototype.render = function () {

    if (GLVIS.config.debug)
        console.log("RENDER SCENE");

    for (var i = 0; i < this.collections_.length; i++) {
        this.collections_[i].render();
    }


    this.webgl_handler_.render();
};

/**
 * Adding a collection to the scene
 * @param {GLVIS.Collection} collection
 */
GLVIS.Scene.prototype.addCollection = function (collection) {
    this.collections_.push(collection);
};