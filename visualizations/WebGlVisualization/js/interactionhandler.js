
var GLVIS = GLVIS || {};



GLVIS.InteractionHandler = function (scene) {


    /** @var {GLVIS.Scene} **/
    this.scene_ = scene;

    this.raycaster_ = new THREE.Raycaster();
    this.raycaster_.precision = 0.5;

    this.mouse_ = new THREE.Vector2();

    var that = this;

    var canvas = that.scene_.getWebGlHandler().getCanvas();

    jQuery(document).ready(function () {

        //MOUSE-CLICK ON SCENE  
        jQuery(canvas).click(function (event) {
            that.handleInteraction_(event, "mouseclick");
        });


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
            if (!is_mouse_down_in_canvas)
                return;
            var zoom_factor = 1 / that.scene_.getNavigationHandler().getZoomFactor();
            var curr_mouse_x_diff = 0 - (event.clientX - mouse_x_prev) * zoom_factor;
            var curr_mouse_y_diff = 0 - (event.clientY - mouse_y_prev) * zoom_factor;

            that.scene_.getNavigationHandler().resetAnimationMovement();
            that.scene_.getNavigationHandler().moveCamera(curr_mouse_x_diff, curr_mouse_y_diff);
            mouse_x_prev = event.clientX;
            mouse_y_prev = event.clientY;
        });


        //MOUSE-WHEEL (ZOOM)
        jQuery(canvas).mousewheel(function (event) {
            that.scene_.getNavigationHandler().resetAnimationZoom();
            that.scene_.getNavigationHandler().zoomDelta(event.deltaY * 5);
        });




    });
};


GLVIS.InteractionHandler.prototype.deactivateAllCollections = function () {
    //Deselect all collections

    for (var i = 0; i < this.scene_.getCollections().length; i++)
    {
        var curr_coll = this.scene_.getCollections()[i];
        curr_coll.setStatus(GLVIS.Collection.STATUSFLAGS.NORMAL);

        var results = curr_coll.getResults();

        for (var j = 0; j < results.length; j++) {
            var curr_res = results[j];
            //curr_res.setIsActive(false);
        }

    }
    
};


/**
 * Calls interaction function on Three-Object if exists
 * @param {event} event 
 * @param {string} interaction_type e.g  'mouseclick', 'mouseover' ...
 */
GLVIS.InteractionHandler.prototype.handleInteraction_ = function (event, interaction_type) {
    this.deactivateAllCollections();
    var intersected = this.getIntersectedObjects_(event);

    for (var i_count = 0; i_count < intersected.length; i_count++)
    {
        var curr_intersect_obj = intersected[i_count].object;
        
        if (curr_intersect_obj.interaction instanceof Object)
        {   
            
            if (
                    curr_intersect_obj.interaction[interaction_type] !== undefined &&
                    curr_intersect_obj.interaction[interaction_type] !== null
                    )
            {
                curr_intersect_obj.interaction[interaction_type](curr_intersect_obj);
            }
        }
    }
};



/**
 * Get Objects that are intersected
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


    