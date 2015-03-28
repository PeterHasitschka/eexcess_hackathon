var GLGR = GLGR || {};

/**
 * Handling the visual navigation of the scene
 * @param {GLGR.Scene} scene Current scene
 */
GLGR.NavigationHandler = function (scene) {
    /** @type {GLGR.Scene} **/
    this.scene_ = scene;
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

    this.scene_.getThreeCamera().zoom = zoom_factor;
    this.scene_.getThreeCamera().updateProjectionMatrix();
};