var GLVIS = GLVIS || {};
/**
 * Handling the visual navigation of the scene
 * @param {GLVIS.Scene} scene Current scene
 */
GLVIS.NavigationHandler = function (scene) {
    /** @type {GLVIS.Scene} **/
    this.scene_ = scene;

    this.zoomanimation_ = {
        goal: null,
        cb: null
    };
    this.moveanimation_ = {
        goal: {
            x: null,
            y: null
        },
        cb: null
    };
};
/**
 * Set the scene's camera position
 * @param {float | null} x
 * @param {type | null} y
 */
GLVIS.NavigationHandler.prototype.setCamera = function (x, y) {

    if (x === null || x === undefined)
        x = 0;
    if (y === null || y === undefined)
        y = 0;

    this.scene_.getWebGlHandler().getCamera().position.x = x;
    this.scene_.getWebGlHandler().getCamera().position.y = y;
};

/**
 * Move the scene's camera
 * @param {float | null} x
 * @param {type | null} y
 */
GLVIS.NavigationHandler.prototype.moveCamera = function (x, y) {

    if (x === null || x === undefined)
        x = 0;
    if (y === null || y === undefined)
        y = 0;

    this.scene_.getWebGlHandler().getCamera().position.x += x;
    this.scene_.getWebGlHandler().getCamera().position.y += y;
};
/**
 * Perform zoom
 * @param {float} zoom_factor
 */
GLVIS.NavigationHandler.prototype.zoom = function (zoom_factor) {

    //console.log("FINAL-ZOOM-FACTOR 1: " + zoom_factor);
    if (zoom_factor < 0)
        zoom_factor = 0;
    //console.log("FINAL-ZOOM-FACTOR 2: " + zoom_factor);

    this.scene_.getWebGlHandler().getCamera().zoom = zoom_factor;
    this.scene_.getWebGlHandler().getCamera().updateProjectionMatrix();
};
GLVIS.NavigationHandler.prototype.getZoomFactor = function () {
    return this.scene_.getWebGlHandler().getCamera().zoom;
};
/**
 * Perform zoom relative
 * @param {float} delta_zoom_factor
 */
GLVIS.NavigationHandler.prototype.zoomDelta = function (delta_zoom_factor) {
    var zoom = this.scene_.getWebGlHandler().getCamera().zoom + (delta_zoom_factor / 100);
    this.zoom(zoom);
};
/**
 * Called by every Scene-Render step
 */
GLVIS.NavigationHandler.prototype.performAnimations = function () {
    this.performZoomStep_();
    this.performMoveStep_();
};
/**
 * Do an animated move step called by perfomMovements
 */
GLVIS.NavigationHandler.prototype.performMoveStep_ = function () {

    if (this.moveanimation_.goal.x === null || this.moveanimation_.goal.y === null)
        return;

    var config = GLVIS.config.navigation.move.animated;

    var threshold = config.threshold;
    var curr_x = parseFloat(this.scene_.getWebGlHandler().getCamera().position.x);
    var curr_y = parseFloat(this.scene_.getWebGlHandler().getCamera().position.y);


    var goal_x = parseFloat(this.moveanimation_.goal.x);
    var goal_y = parseFloat(this.moveanimation_.goal.y);

    var calc_x = GLVIS.AnimationHelper.getStepRoot(curr_x, goal_x, config.root, config.speed_fct, threshold);
    var calc_y = GLVIS.AnimationHelper.getStepRoot(curr_y, goal_y, config.root, config.speed_fct, threshold);

    if (calc_x !== 0 || calc_y !== 0)
        this.moveCamera(calc_x, calc_y);
    else {
        this.setCamera(this.moveanimation_.goal.x, this.moveanimation_.goal.y);
        var cb = this.moveanimation_.cb;
        this.resetAnimationMovement();
        if (cb)
            cb();
    }
}
;



/**
 * Do an animated zoom step called by perfomMovements
 */
GLVIS.NavigationHandler.prototype.performZoomStep_ = function () {

    if (this.zoomanimation_.goal === null)
        return;
    var zoom_goal = this.zoomanimation_.goal;

    var config = GLVIS.config.navigation.zoom.animated;
    var threshold = config.threshold;
    var speed_root = config.speed_root;
    var speed_fct = config.speed_fct;

    var current_zoom = this.scene_.getWebGlHandler().getCamera().zoom;

    var zoom = GLVIS.AnimationHelper.getStepRoot(current_zoom, zoom_goal, speed_root, speed_fct, threshold);
    this.zoomDelta(zoom);

    if (zoom === 0)
    {
        this.zoom(zoom_goal);
        var cb = this.zoomanimation_.cb;
        this.resetAnimationZoom();
        if (cb)
            cb();
    }
};
/**
 * 
 * @param {type} move_goal_x position x to reach
 * @param {type} move_goal_y position y to reach
 * @param {type} callback_fct
 */
GLVIS.NavigationHandler.prototype.animatedMovement = function (move_goal_x, move_goal_y, callback_fct) {
    this.moveanimation_.goal.x = move_goal_x;
    this.moveanimation_.goal.y = move_goal_y;
    this.moveanimation_.cb = callback_fct;
};

GLVIS.NavigationHandler.prototype.resetAnimationMovement = function () {
    this.moveanimation_.goal.x = null;
    this.moveanimation_.goal.y = null;
    this.moveanimation_.cb = null;
};


/**
 * 
 * @param {type} zoom_goal zoom level to reach
 * @param {type} callback_fct
 */
GLVIS.NavigationHandler.prototype.animatedZoom = function (zoom_goal, callback_fct) {
    this.zoomanimation_.goal = zoom_goal;
    this.zoomanimation_.cb = callback_fct;
};

GLVIS.NavigationHandler.prototype.resetAnimationZoom = function () {
    this.zoomanimation_.goal = null;
    this.zoomanimation_.cb = null;
};


/**
 * 
 * @param {GLVIS.Collection} collection
 * @param {function} callback_fct callback when ready
 */
GLVIS.NavigationHandler.prototype.focusCollection = function (collection, callback_fct) {
    var that = this;
    this.animatedZoom(0.4, function () {
        that.animatedMovement(collection.getPosition().x, collection.getPosition().y, function () {
            console.log("Finished movement to graph");
            that.animatedZoom(1, function () {
                console.log("finished zoom to 1");

                if (callback_fct)
                    callback_fct();
            });
        });
    });


};
