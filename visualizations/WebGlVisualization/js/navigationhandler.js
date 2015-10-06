var GLVIS = GLVIS || {};


/**
 * Handling the visual navigation of the scene
 * @param {GLVIS.Scene} scene Current scene
 */
GLVIS.NavigationHandler = function (scene) {
    /** @type {GLVIS.Scene} **/
    this.scene_ = scene;

    /** @type {THREE.Vector3} **/
    this.lookat_lock_ = null;

    this.animation_ = {
        zoom_id: 'nh_anim_zoom',
        move: 'nh_anim_move',
        move_id_x: 'nh_anim_move_x',
        move_id_y: 'nh_anim_move_y',
        move_id_z: 'nh_anim_move_z'
    };
};

/**
 * 
 * Move the camera on a position on a virtual circle outside the circular-collection circle
 * facing the focused point.
 * The focused point and the center of the collection-circle is on on one line with the camera
 * 
 * @param {float} x
 * @param {float} y
 * @param {float} z
 * @param {bool} animate
 * @param {function} cb Only called if animated
 */
GLVIS.NavigationHandler.prototype.setCameraToCircle = function (x, y, z, animate, cb) {

    if (x === undefined)
        x = null;
    if (y === undefined)
        y = null;
    if (z === undefined)
        z = null;

    if (x === null | y === null | z === null) {
        throw Exception("All cordinate values needed!");
    }

    if (true)
    {
        if (!animate) {
            var missing_degrees = this.getMissingCameraDegrees(x, y, z);
            this.moveCameraAroundCircle(missing_degrees.h, missing_degrees.v);
        } else {

            console.error("Set Camera To Circle ANIMATION not supported " +
                    "due to problems at animation logic! (6.10.15 / 15:55");

            return;
            /*
             var anim = GLVIS.Scene.getCurrentScene().getAnimation();
             anim.finishAnimation(this.animation_.move);
             
             console.log("registering anim nh_move_h");
             anim.register(
             "nh_move_h",
             0,
             null,
             this.getMissingCameraDegreesH.bind(this),
             this.moveCameraAroundCircle.bind(this),
             0,
             0.01,
             1,
             10,
             function () {
             if (cb)
             cb();
             },
             false);
             */
        }
    }
    else
    {
        var collection_circle_center = new THREE.Vector3(0, 0, 0 - GLVIS.config.scene.circle_radius);
        var focus_point = new THREE.Vector3(x, y, z);

        var view_dir = collection_circle_center.clone().sub(focus_point);
        view_dir.normalize();

        var distance = GLVIS.config.three.camera_perspective.DISTANCE;
        var camera_pos = focus_point.clone().sub(view_dir.setLength(distance));

        var camera = this.scene_.getWebGlHandler().getCamera();
        camera.position.set(camera_pos.x, camera_pos.y, camera_pos.z);
        camera.lookAt(focus_point);
    }
};

/**
 * Difference of the current degree  (@see{GLVIS.NavigationHandler.prototype.getDegreeOnCameraSphere_})
 * and the camera position.
 * @param {float} goal_x
 * @param {float} goal_y
 * @param {float} goal_z
 * @returns {object} Holding 'h' (Horizontal degree), 'v' (Vertical degree)
 */
GLVIS.NavigationHandler.prototype.getMissingCameraDegrees = function (goal_x, goal_y, goal_z) {

    var camera = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera();
    var camera_degree = this.getDegreeOnCameraSphere_(camera.position.x, camera.position.y, camera.position.z);

    var goal_degree = this.getDegreeOnCameraSphere_(goal_x, goal_y, goal_z);

    return {h: goal_degree.h - camera_degree.h, v: goal_degree.v - camera_degree.v};
};


/**
 * Getting the current on the camera sphere.
 * That means a horizontal and vertical degree of the path between camera position
 * and circle center where it hits the sphere
 * @param {float} x
 * @param {float} y
 * @param {float} z
 * @returns {object} Holding 'h' (Horizontal degree), 'v' (Vertical degree)
 */
GLVIS.NavigationHandler.prototype.getDegreeOnCameraSphere_ = function (x, y, z) {

    var coll_circle_d = GLVIS.config.scene.circle_radius;
    var coll_circle_center_v = new THREE.Vector3(0, 0, 0 - coll_circle_d);


    var pos_v = new THREE.Vector3(x, y, z);
    pos_v.sub(coll_circle_center_v);
    var pos_center_d = pos_v.clone().length();
    pos_v.divideScalar(pos_center_d);

    //pos-v is normalized in zero point now

    var rad_h = Math.atan2(pos_v.x, pos_v.z);

    //Rotate around y to determine vertical rotation
    pos_v.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0 - rad_h);
    //Avoid floating point problems (1.00000001)
    var z_val = pos_v.z > 1.0 ? 1.0 : pos_v.z;
    var z_val = z_val < -1.0 ? -1.0 : z_val;

    var rad_v = Math.acos(z_val);

    var h = rad_h * 180 / Math.PI;
    var v = rad_v * 180 / Math.PI;

    if (v > 0 && y < 0)
        v *= -1;

    return {h: h, v: v};
};

/**
 * Rotate the camera on a virtual sphere outside the circular-view circle by 2 delta values
 * 
 * @param {float} degree_h_delta Movement around the circle
 * @param {float} degree_b_delta Vertical tilt
 */
GLVIS.NavigationHandler.prototype.moveCameraAroundCircle = function (degree_h_delta, degree_v_delta) {

    if (degree_h_delta === null || degree_h_delta === undefined)
        degree_h_delta = 0;

    if (degree_v_delta === null || degree_v_delta === undefined)
        degree_v_delta = 0;

    var coll_circle_radius = GLVIS.config.scene.circle_radius;
    var camera_distance_to_colls = GLVIS.config.three.camera_perspective.DISTANCE;

    var total_distance_to_center = coll_circle_radius + camera_distance_to_colls;

    var camera = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera();

    /** @type {THREE.Vector3} **/
    var current_camera_pos = camera.position.clone();


    var current_degrees_of_camera = this.getDegreeOnCameraSphere_(
            current_camera_pos.x,
            current_camera_pos.y,
            current_camera_pos.z);

    var curr_degree_h = current_degrees_of_camera.h;
    var curr_degree_v = current_degrees_of_camera.v;

    //HORIZONTAL

    //Add new delta
    curr_degree_h += degree_h_delta;
    var rad_h_to_set = curr_degree_h / (180 / Math.PI);

    //Get positions / Calculate back to world
    var new_pos = new THREE.Vector3(Math.sin(rad_h_to_set), current_camera_pos.y / total_distance_to_center, Math.cos(rad_h_to_set));


    //VERTICAL

    var rad_v_to_set = degree_v_delta / (180 / Math.PI);

    new_pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), -rad_h_to_set);

    //Apply new angle for vertical movement over the x-axis of the rotated vector
    new_pos.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0 - rad_v_to_set);

    //Rotate the vector back to position before vertical calculations
    new_pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), rad_h_to_set);

    //Denormalize
    new_pos.multiplyScalar(total_distance_to_center / new_pos.length());

    new_pos.sub(new THREE.Vector3(0, 0, coll_circle_radius));

    //Set new camera
    camera.position.set(new_pos.x, new_pos.y, new_pos.z);
    camera.lookAt(new THREE.Vector3(0, 0, -coll_circle_radius));
};


/**
 * Change distance from collection-circle center to a value that the camera
 * is on the sphere described by the coll-circle.
 * @param {bool} animation TRUE for animation
 * @param {function} cb Callback after performed animation
 */
GLVIS.NavigationHandler.prototype.moveCameraToCircleSphere = function (animation, cb) {

    var coll_circle_radius = GLVIS.config.scene.circle_radius;

    var factor = this.getDistanceFactor();

    if (!animation) {
        this.setDistanceFactor(1 - factor);
    }
    else {
        var anim = GLVIS.Scene.getCurrentScene().getAnimation();
        anim.finishAnimation(this.animation_.move);

        anim.register(
                this.animation_.move,
                1.0,
                null,
                this.getDistanceFactor.bind(this),
                this.setDistanceFactor.bind(this),
                0,
                0.7,
                1,
                0.01,
                function () {
                    if (cb)
                        cb();
                },
                false);
    }
};


GLVIS.NavigationHandler.prototype.getDistanceFactor = function () {


    var coll_circle_radius = GLVIS.config.scene.circle_radius;
    var camera_distance_to_colls = GLVIS.config.three.camera_perspective.DISTANCE;

    var camera = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera();
    var current_camera_pos = camera.position.clone();

    var circle_center = new THREE.Vector3(0, 0, coll_circle_radius);

    var camera_center_vec = circle_center.clone().add(current_camera_pos);
    var current_length = camera_center_vec.length();

    var total_distance_to_center = coll_circle_radius + camera_distance_to_colls;
    var factor = total_distance_to_center / current_length;

    return factor;
};


GLVIS.NavigationHandler.prototype.setDistanceFactor = function (factor) {
    var coll_circle_radius = GLVIS.config.scene.circle_radius;

    var camera = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera();

    /** @type {THREE.Vector3} **/
    var current_camera_pos = camera.position.clone();

    var circle_center = new THREE.Vector3(0, 0, coll_circle_radius);
    var camera_center_vec = circle_center.clone().add(current_camera_pos);

    camera_center_vec.multiplyScalar(1 - factor);

    var new_camera_pos = camera_center_vec.clone().sub(circle_center);
    camera.position.set(new_camera_pos.x, new_camera_pos.y, new_camera_pos.z);
};


/**
 * Move the scene's camera
 * @param {float | null} x
 * @param {type | null} y
 * @param {type | null} z
 */
GLVIS.NavigationHandler.prototype.moveCamera = function (x, y, z) {

    if (x === null || x === undefined)
        x = 0;
    if (y === null || y === undefined)
        y = 0;
    if (z === null || z === undefined)
        z = 0;

    var camera = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera();
    camera.position.x += x;
    camera.position.y += y;
    camera.position.z += z;


    if (this.lookat_lock_)
        camera.lookAt(this.lookat_lock_);
};


/**
 * Lock the lookat vector for using the moveCamera method
 * @param {THREE.Vector3} vector
 */
GLVIS.NavigationHandler.prototype.lockLookAt = function (vector) {
    this.lookat_lock_ = vector;
};

/**
 * Unlock the lookat vector for using the moveCamera method
 */
GLVIS.NavigationHandler.prototype.unlockLookAt = function () {
    this.lookat_lock_ = null;
};

/**
 * Perform (absolute) zoom
 * @param {float} zoom_factor
 */
GLVIS.NavigationHandler.prototype.zoom = function (zoom_factor) {

    if (zoom_factor < 0)
        zoom_factor = 0;

    GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().zoom = zoom_factor;
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().updateProjectionMatrix();
};

/**
 * Getting the zoom level of the THREE.js Camera
 * @returns {Three.Camera.zoom}
 */
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
 * At first move camera to the circle Sphere
 * Then move it horizontal and vertical to the correct position on the circle
 * @param {GLVIS.Collection} collection
 */
GLVIS.NavigationHandler.prototype.animatedCollectionFocus = function (collection) {


    //move 

    this.moveCameraToCircleSphere(true, function () {


        /**
         * @TODO DIENSTAG
         * Do h-v movenent here after hitting the circle-sphere 
         **/

    });

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

    //GLVIS.Scene.getCurrentScene().getAnimation().finishAnimation(this.animation_.zoom_id);

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

/**
 * Resetting both movement-animations
 */
GLVIS.NavigationHandler.prototype.resetAnimationMovement = function () {
    GLVIS.Scene.getCurrentScene().getAnimation().unregister(this.animation_.move);
};

/**
 * Resetting the zoom-animation
 */
GLVIS.NavigationHandler.prototype.resetAnimationZoom = function () {
    GLVIS.Scene.getCurrentScene().getAnimation().unregister(this.animation_.zoom_id);
};

/**
 * 
 * @param {GLVIS.Collection} collection
 * @param {function} callback_fct callback when ready
 */
GLVIS.NavigationHandler.prototype.focusCollection = function (collection, callback_fct) {
    var animated_move = false;

    this.setCameraToCircle(collection.getPosition().x, collection.getPosition().y, collection.getPosition().z,
            animated_move,
            callback_fct
            );
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
 * Single getter for animation
 * @returns {float}
 */
GLVIS.NavigationHandler.prototype.getPosZ = function () {
    return GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera().position.z;
};

