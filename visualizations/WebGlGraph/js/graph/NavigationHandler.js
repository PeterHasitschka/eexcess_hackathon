var GLGR = GLGR || {};
/**
 * Handling the visual navigation of the scene
 * @param {GLGR.Scene} scene Current scene
 */
GLGR.NavigationHandler = function (scene) {
    /** @type {GLGR.Scene} **/
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
GLGR.NavigationHandler.prototype.setCamera = function (x, y) {

    if (x === null || x === undefined)
        x = 0;
    if (y === null || y === undefined)
        y = 0;
    this.scene_.getThreeCamera().position.x = x;
    this.scene_.getThreeCamera().position.y = y;
};
/**
 * Move the scene's camera
 * @param {float | null} x
 * @param {type | null} y
 */
GLGR.NavigationHandler.prototype.moveCamera = function (x, y) {

    if (x === null || x === undefined)
        x = 0;
    if (y === null || y === undefined)
        y = 0;

    this.scene_.getThreeCamera().position.x += x;
    this.scene_.getThreeCamera().position.y += y;
};
/**
 * Perform zoom
 * @param {float} zoom_factor
 */
GLGR.NavigationHandler.prototype.zoom = function (zoom_factor) {

    //console.log("FINAL-ZOOM-FACTOR 1: " + zoom_factor);
    if (zoom_factor < 0)
        zoom_factor = 0;
    //console.log("FINAL-ZOOM-FACTOR 2: " + zoom_factor);

    this.scene_.getThreeCamera().zoom = zoom_factor;
    this.scene_.getThreeCamera().updateProjectionMatrix();
};
GLGR.NavigationHandler.prototype.getZoomFactor = function () {
    return this.scene_.getThreeCamera().zoom;
};
/**
 * Perform zoom relative
 * @param {float} delta_zoom_factor
 */
GLGR.NavigationHandler.prototype.zoomDelta = function (delta_zoom_factor) {
    //console.log("DELTA-ZOOM-INPUT: " + delta_zoom_factor);
    //console.log("OLD-ZOOM-FACTOR: " + this.scene_.getThreeCamera().zoom);
    var zoom = this.scene_.getThreeCamera().zoom + (delta_zoom_factor / 100);
    this.zoom(zoom);
};
/**
 * Called by every Scene-Render step
 */
GLGR.NavigationHandler.prototype.performAnimations = function () {
    this.performZoomStep_();
    this.performMoveStep_();
};
/**
 * Do an animated move step called by perfomMovements
 */
GLGR.NavigationHandler.prototype.performMoveStep_ = function () {

    if (this.moveanimation_.goal.x === null || this.moveanimation_.goal.y === null)
        return;
    var threshold = 30;
    var curr_x = parseFloat(this.scene_.getThreeCamera().position.x);
    var curr_y = parseFloat(this.scene_.getThreeCamera().position.y);

    var speed = 20;
    var diff_x = 0;
    var diff_y = 0;



    var goal_x = parseFloat(this.moveanimation_.goal.x);
    var goal_y = parseFloat(this.moveanimation_.goal.y);



    if (Math.abs((curr_x - this.moveanimation_.goal.x)) > threshold) {
        if (curr_x < goal_x)
            diff_x = speed;
        else if (curr_x > goal_x)
            diff_x = speed * -1;
    }


    if (Math.abs((curr_y - this.moveanimation_.goal.y)) > threshold) {
        if (curr_y < goal_y)
            diff_y = speed;
        else if (curr_y > goal_y)
            diff_y = speed * -1;
    }

    /*
     console.log("FOCUSGRAPH MOVE: ",
     this.moveanimation_.goal.x, this.moveanimation_.goal.y,
     curr_x, this.scene_.getThreeCamera().position.y, curr_y,
     diff_x, diff_y, this.moveanimation_.goal);
     */
    
    if (diff_x !== 0 || diff_y !== 0)
        this.moveCamera(diff_x, diff_y);
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
GLGR.NavigationHandler.prototype.performZoomStep_ = function () {

    if (this.zoomanimation_.goal === null)
        return;
    var zoom_goal = this.zoomanimation_.goal;
    var threshold = 0.0001;
    var speed_root = 1.5;
    var speed_fct = 3;
    var current_zoom = this.scene_.getThreeCamera().zoom;
    if (Math.abs((current_zoom - zoom_goal)) > threshold) {

        var delta_zoom_step = 1.0 - ((parseFloat(current_zoom) / parseFloat(zoom_goal)));
        var delta_zoom_step_sqrt = Math.pow(Math.abs(delta_zoom_step), 1 / speed_root) * speed_fct;
        if (delta_zoom_step < 0)
            delta_zoom_step_sqrt *= -1;
        this.zoomDelta(delta_zoom_step_sqrt);
        current_zoom = this.scene_.getThreeCamera().zoom;
        //console.log("FOCUSGRAPH: ", zoom_goal, current_zoom, delta_zoom_step_sqrt);
    }
    else {
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
GLGR.NavigationHandler.prototype.animatedMovement = function (move_goal_x, move_goal_y, callback_fct) {
    this.moveanimation_.goal.x = move_goal_x;
    this.moveanimation_.goal.y = move_goal_y;
    this.moveanimation_.cb = callback_fct;
};

GLGR.NavigationHandler.prototype.resetAnimationMovement = function () {
    this.moveanimation_.goal.x = null;
    this.moveanimation_.goal.y = null;
    this.moveanimation_.cb = null;
};


/**
 * 
 * @param {type} zoom_goal zoom level to reach
 * @param {type} callback_fct
 */
GLGR.NavigationHandler.prototype.animatedZoom = function (zoom_goal, callback_fct) {
    this.zoomanimation_.goal = zoom_goal;
    this.zoomanimation_.cb = callback_fct;
};

GLGR.NavigationHandler.prototype.resetAnimationZoom = function () {
    this.zoomanimation_.goal = null;
    this.zoomanimation_.cb = null;
};


/**
 * 
 * @param {GLGR.Graph} graph
 * @param {function} callback_fct callback when ready
 */
GLGR.NavigationHandler.prototype.focusGraph = function (graph, callback_fct) {

    console.log("FOCUSGRAPH: ", graph.getPosition().x, graph.getPosition().y, this.scene_.getThreeCamera().position.x);
    var that = this;
    this.animatedZoom(0.4, function () {
        that.animatedMovement(graph.getPosition().x, graph.getPosition().y, function () {
            console.log("Finished movement to graph");
            that.animatedZoom(1, function () {
                console.log("finished zoom to 1");
            });
        });
    });

    //this.zoom(1);

    if (callback_fct)
        callback_fct();
};