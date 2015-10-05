
var GLVIS = GLVIS || {};



GLVIS.InteractionHandler = function (scene) {


    /** @var {GLVIS.Scene} **/
    this.scene_ = scene;

    var config = GLVIS.config.interaction;


    this.keyinteractions_ = {
        keydown: {
            37: function () {   // LEFT
                this.scene_.getNavigationHandler().moveCameraAroundCircle(-5);
            }.bind(this),
            39: function () {   // RIGHT
                this.scene_.getNavigationHandler().moveCameraAroundCircle(5);
            }.bind(this),
            38: function () {   // UP
                this.scene_.getNavigationHandler().moveCameraAroundCircle(0, 5);
            }.bind(this),
            40: function () {   // DOWN
                this.scene_.getNavigationHandler().moveCameraAroundCircle(0, -5);
            }.bind(this)
        }
    };



    this.raycaster_ = new THREE.Raycaster();
    this.raycaster_.precision = config.raycaster_precision;

    this.mouse_ = new THREE.Vector2();

    var canvas = this.scene_.getWebGlHandler().getCanvas();

    jQuery(document).ready(function () {

        //KEYDOWN
        jQuery(window).keydown(function (e) {

            this.handleKeyClick(e);

        }.bind(this));


        //MOUSE-CLICK ON SCENE  
        jQuery(canvas).click(function (event) {
            this.handleInteraction_(event, "mouseclick");
        }.bind(this));


        //MOUSE-MOVE (DRAGGEDd)
        var is_mouse_down_in_canvas = false;
        var mouse_x_prev = null;
        var mouse_y_prev = null;
        jQuery(canvas).mousedown(function (event) {
            is_mouse_down_in_canvas = true;
            mouse_x_prev = event.clientX;
            mouse_y_prev = event.clientY;
        });

        jQuery(window).mouseup(function (event) {
            is_mouse_down_in_canvas = false;
        });

        jQuery(canvas).mouseleave(function (event) {
            is_mouse_down_in_canvas = false;
        });

        jQuery(canvas).mousemove(function (event) {

            this.handleInteraction_(event, "mouseover");


            if (!is_mouse_down_in_canvas)
                return;
            var zoom_factor = 1 / this.scene_.getNavigationHandler().getZoomFactor();
            var curr_mouse_x_diff = 0 - (event.clientX - mouse_x_prev) * zoom_factor;
            var curr_mouse_y_diff = (event.clientY - mouse_y_prev) * zoom_factor;

            this.scene_.getNavigationHandler().resetAnimationMovement();
            this.scene_.getNavigationHandler().moveCameraAroundCircle(
                    curr_mouse_x_diff / config.mousesensitivy,
                    curr_mouse_y_diff / config.mousesensitivy
                    );
            mouse_x_prev = event.clientX;
            mouse_y_prev = event.clientY;

        }.bind(this));


        //MOUSE-WHEEL (ZOOM)
        jQuery(canvas).mousewheel(function (event) {
            this.scene_.getNavigationHandler().resetAnimationZoom();
            this.scene_.getNavigationHandler().zoomDelta(event.deltaY * 5);
        }.bind(this));
    }.bind(this));
};

/**
 * @TODO Check if needed anymore
 */
GLVIS.InteractionHandler.prototype.deselectAllCollections = function () {
    //Deselect all collections
    for (var i = 0; i < this.scene_.getCollections().length; i++)
    {
        var curr_coll = this.scene_.getCollections()[i];
        curr_coll.setStatus(GLVIS.Collection.STATUSFLAGS.NORMAL);
    }
};

/**
 * Calls interaction function on Three-Object if exists
 * @param {event} event 
 * @param {string} interaction_type e.g  'mouseclick', 'mouseover' ...
 */
GLVIS.InteractionHandler.prototype.handleInteraction_ = function (event, interaction_type) {

    if (interaction_type === "mouseclick")
        this.deselectAllCollections();

    var intersected = this.getIntersectedObjects_(event);

    GLVIS.Debugger.debug("InteractionHandler",
            "HANDLING SCENE INTERACTION EVENT '" + interaction_type + "'", 6);

    var single_ids_already_clicked = [];

    for (var i = 0; i < intersected.length; i++) {
        var curr_intersect_obj = intersected[i].object;
        GLVIS.Debugger.debug("InteractionHandler",
                ["Going through intersected object:", curr_intersect_obj], 9);

        if (curr_intersect_obj.interaction instanceof Object)
        {
            GLVIS.Debugger.debug("InteractionHandler",
                    "...which is an Object", 9);
            if (
                    curr_intersect_obj.interaction[interaction_type] !== undefined &&
                    curr_intersect_obj.interaction[interaction_type] !== null
                    )
            {
                //Check if only-single-click allowed
                var i_id = curr_intersect_obj.interaction.interaction_id;
                var i_sc = curr_intersect_obj.interaction.interaction_singleclick_per_type;
                if (i_id) {
                    if (i_sc && i_sc === true) {
                        //If already in array, it was already clicked
                        if (single_ids_already_clicked.indexOf(i_id) > -1) {
                            continue;
                        }
                        single_ids_already_clicked.push(i_id);
                    }
                }



                GLVIS.Debugger.debug("InteractionHandler",
                        "Intersected Object has following interaction-type: '" + interaction_type + "'", 8);
                curr_intersect_obj.interaction[interaction_type](curr_intersect_obj);
                
                //This flag prevents from executing any other interaction from this click
                if (curr_intersect_obj.interaction.interaction_singleclick_exclusive)
                    break;
            }
        }
    }

    if (!intersected.length)
        this.handleEmptyClick(interaction_type);
};

/**
 * Handling clicks defined in constructor
 * @param {Event} e
 */
GLVIS.InteractionHandler.prototype.handleKeyClick = function (e) {
    var is = this.keyinteractions_;

    GLVIS.Debugger.debug("InteractionHandler", ["Key-Click", e.type, e.which], 7);

    var type_is = is[e.type];
    if (type_is === undefined)
        return;

    var key = e.which;
    if (type_is[key] === undefined)
        return;
    type_is[key]();
};

/**
 * Performing several deselections of no object was intersected
 * @param {String} interaction_type
 */
GLVIS.InteractionHandler.prototype.handleEmptyClick = function (interaction_type) {

    /**
     * Unhighlighting last highlighted text if exists.
     */
    if (GLVIS.Text.current_selected) {
        GLVIS.Text.current_selected.handleMouseleave();
        GLVIS.Text.current_selected = null;
    }

    /**
     * Remove rec-rec-splines when leaving objects with mouse
     */
    if (interaction_type === "mouseover") {
        _.each(GLVIS.RecConnector.activatedAtCollections, function (coll) {

            if (!coll)
                return;
            coll.unconnectSameRecsFromOtherCollections();
        });
    }
};

/**
 * Get Objects this are intersected
 * @param event Mouse over / down etc. event
 * @returns {GLVIS.InteractionHandler.getIntersectedObjects_@pro;raycaster_@call;intersectObjects}
 */
GLVIS.InteractionHandler.prototype.getIntersectedObjects_ = function (event) {
    var renderer = this.scene_.getWebGlHandler().getThreeRenderer();
    var camera = this.scene_.getWebGlHandler().getCamera();

    var rel_l = event.pageX - jQuery(renderer.domElement).position().left;
    var rel_t = event.pageY - jQuery(renderer.domElement).position().top;

    this.mouse_.x = (rel_l / renderer.domElement.width) * 2 - 1;
    this.mouse_.y = -(rel_t / renderer.domElement.height) * 2 + 1;

    this.raycaster_.setFromCamera(this.mouse_, camera);

    var intersects = this.raycaster_.intersectObjects(this.scene_.getWebGlHandler().getThreeScene().children, true);

    return intersects;
};


    