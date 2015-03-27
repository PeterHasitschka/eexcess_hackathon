
var GLGR = GLGR || {};



GLGR.InteractionHandler = function (scene) {

    if (GLGR.InteractionHandler.singleton_ !== undefined)
    {
        throw new ("ERROR: Only singleton usage in InteractionHandler");
    }
    GLGR.InteractionHandler.singleton_ = this;

    /** @var {GLGR.Scene} **/
    this.scene_ = scene;

    this.raycaster_ = new THREE.Raycaster();
    this.raycaster_.precision = 0.5;

    this.mouse_ = new THREE.Vector2();

    var that = this;
    jQuery(document).ready(function () {

        jQuery(that.scene_.getCanvas()).click(function (event) {


            //Demo
            //jQuery('#information-container-graph-info').hide();
            //jQuery('#information-container-rec-info').hide();

            that.handleInteraction_(event, "mouseclick");
        });




        var is_mouse_down_in_canvas = false;
        var mouse_x_prev = null;
        jQuery(that.scene_.getCanvas()).mousedown(function (event) {
            is_mouse_down_in_canvas = true;
            mouse_x_prev = event.clientX;
        });

        jQuery(that.scene_.getCanvas()).mouseup(function (event) {
            is_mouse_down_in_canvas = false;
        });

        jQuery(that.scene_.getCanvas()).mouseleave(function (event) {
            is_mouse_down_in_canvas = false;
        });


        jQuery(that.scene_.getCanvas()).mousemove(function (event) {

            if (!is_mouse_down_in_canvas)
                return;

            curr_mouse_x_diff =  0-(event.clientX-mouse_x_prev);
            
            that.scene_.moveCamera(curr_mouse_x_diff);
            mouse_x_prev = event.clientX;
            
        });




    });
};

GLGR.InteractionHandler.getSingleton = function () {
    return this.singleton_;
};



/**
 * Calls interaction function on Three-Object if exists
 * @param {event} event 
 * @param {string} interaction_type e.g  'mouseclick', 'mouseover' ...
 */
GLGR.InteractionHandler.prototype.handleInteraction_ = function (event, interaction_type) {

    var intersected = this.getIntersectedObjects_(event);



    for (var i_count = 0; i_count < intersected.length; i_count++)
    {
        var curr_intersect_obj = intersected[i_count].object;

        if (curr_intersect_obj.interaction_handlers instanceof Object)
        {

            if (
                    curr_intersect_obj.interaction_handlers[interaction_type] !== undefined &&
                    curr_intersect_obj.interaction_handlers[interaction_type] !== null
                    )
            {

                curr_intersect_obj.interaction_handlers[interaction_type](curr_intersect_obj);
            }
        }
    }
};



/**
 * Get Objects that are intersected
 * @param event Mouse over / down etc. event
 * @returns {GLGR.InteractionHandler.getIntersectedObjects_@pro;raycaster_@call;intersectObjects}
 */
GLGR.InteractionHandler.prototype.getIntersectedObjects_ = function (event) {
    var renderer = this.scene_.getThreeRenderer();
    var camera = this.scene_.getThreeCamera();

    var rel_l = event.pageX - jQuery(renderer.domElement).position().left;
    var rel_t = event.pageY - jQuery(renderer.domElement).position().top;


    this.mouse_.x = (rel_l / renderer.domElement.width) * 2 - 1;
    this.mouse_.y = -(rel_t / renderer.domElement.height) * 2 + 1;


    this.raycaster_.setFromCamera(this.mouse_, camera);

    var intersects = this.raycaster_.intersectObjects(this.scene_.getThreeScene().children, true);

    return intersects;
};


    