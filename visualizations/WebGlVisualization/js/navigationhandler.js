var GLVIS = GLVIS || {};
/**
 * Handling the visual navigation of the scene
 * @param {GLVIS.Scene} scene Current scene
 */
GLVIS.NavigationHandler = function (scene) {
    /** @type {GLVIS.Scene} **/
    this.scene_ = scene;

    this.animation_ = {
        zoom_id: 'nh_anim_zoom',
        move_id_x: 'nh_anim_move_x',
        move_id_y: 'nh_anim_move_y'
    };

    /*
     this.zoomanimation_ = {
     //Needed for calculating the ratio
     largest_diff: null,
     goal: null,
     cb: null
     };
     this.moveanimation_ = {
     //Needed for calculating the ratio
     largest_diff: {
     x: null,
     y: null
     },
     goal: {
     x: null,
     y: null
     },
     cb: null
     };
     */
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
 * Single getter for animation
 * @returns {float}
 */
GLVIS.NavigationHandler.prototype.getPosX = function () {
    return GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().position.x;
};

/**
 * Single getter for animation
 * @returns {float}
 */
GLVIS.NavigationHandler.prototype.getPosY = function () {
    return GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().position.y;
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

    GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().position.x += x;
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().position.y += y;
};
/**
 * Perform zoom
 * @param {float} zoom_factor
 */
GLVIS.NavigationHandler.prototype.zoom = function (zoom_factor) {

    if (zoom_factor < 0)
        zoom_factor = 0;

    GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().zoom = zoom_factor;
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().updateProjectionMatrix();
};


GLVIS.NavigationHandler.prototype.getZoomFactor = function () {
    var zoom = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().zoom;
    return zoom;
};
/**
 * Perform zoom relative
 * @param {float} delta_zoom_factor
 */
GLVIS.NavigationHandler.prototype.zoomDelta = function (delta_zoom_factor) {

    var zoom = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().zoom + (delta_zoom_factor / 100);

    //"this" may be unknown... 
    GLVIS.Scene.getCurrentScene().getNavigationHandler().zoom(zoom);
};


/**
 * 
 * @param {type} move_goal_x position x to reach
 * @param {type} move_goal_y position y to reach
 * @param {type} callback_fct
 */
GLVIS.NavigationHandler.prototype.animatedMovement = function (move_goal_x, move_goal_y, callback_fct) {

    var config = GLVIS.config.navigation.move.animated;
    var setter = this.moveCamera;

    var getter_x = this.getPosX;
    var setter_param_x = 0;
    var getter_y = this.getPosY;
    var setter_param_y = 1;

    var factor = config.speed_fct;
    var pow = config.pow;
    var threshold = config.threshold;


    //X
    GLVIS.Scene.getCurrentScene().getAnimation().register(
            this.animation_.move_id_x,
            move_goal_x,
            null,
            getter_x,
            setter,
            setter_param_x,
            factor,
            pow,
            threshold,
            callback_fct
            );

    //Y
    GLVIS.Scene.getCurrentScene().getAnimation().register(
            this.animation_.move_id_y,
            move_goal_y,
            null,
            getter_y,
            setter,
            setter_param_y,
            factor,
            pow,
            threshold,
            callback_fct
            );
};


/**
 * 
 * @param {type} zoom_goal zoom level to reach
 * @param {type} callback_fct
 */
GLVIS.NavigationHandler.prototype.animatedZoom = function (zoom_goal, callback_fct) {

    var config = GLVIS.config.navigation.zoom.animated;
    var threshold = config.threshold;
    var pow = config.pow;
    var factor = config.speed_fct;

    var getter = this.getZoomFactor;
    var setter = this.zoomDelta;

    GLVIS.Scene.getCurrentScene().getAnimation().register(
            this.animation_.zoom_id,
            zoom_goal,
            null,
            getter,
            setter,
            0,
            factor,
            pow,
            threshold,
            callback_fct
            );
};


GLVIS.NavigationHandler.prototype.resetAnimationMovement = function () {
    GLVIS.Scene.getCurrentScene().getAnimation().unregister(this.animation_.move_id_x);
    GLVIS.Scene.getCurrentScene().getAnimation().unregister(this.animation_.move_id_y);
};

GLVIS.NavigationHandler.prototype.resetAnimationZoom = function () {
    GLVIS.Scene.getCurrentScene().getAnimation().unregister(this.animation_.zoom_id);
};


/**
 * 
 * @param {GLVIS.Collection} collection
 * @param {function} callback_fct callback when ready
 */
GLVIS.NavigationHandler.prototype.focusCollection = function (collection, callback_fct) {
    var that = this;
    var callback_called = false;

    that.animatedZoom(GLVIS.config.navigation.zoom.animated.zoom_in, function () {
        GLVIS.Debugger.debug("NavigationHandler",
                "finished zoom to " + GLVIS.config.navigation.zoom.animated.zoom_in,
                3);

        if (callback_fct && !callback_called) {
            callback_called = true;
            callback_fct();
        }
    });

    /*
     this.animatedZoom(GLVIS.config.navigation.zoom.animated.zoom_out, function () {
     GLVIS.Debugger.debug("NavigationHandler",
     "finished zoom to " + GLVIS.config.navigation.zoom.animated.zoom_out,
     3);
     //INNER
     });
     */
    this.animatedMovement(collection.getPosition().x, collection.getPosition().y, function () {

        GLVIS.Debugger.debug("NavigationHandler",
                "Finished movement to graph",
                3);
        if (callback_fct && !callback_called) {
            callback_called = true;
            callback_fct();
        }

    });

};
