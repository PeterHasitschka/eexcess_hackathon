/* 
 * Recommendation class for the RSWEBGL Graph
 */


var GLGR = GLGR || {};

/**
 * Constructing a recommendation object
 * @param {Integer} rec_id optional parameter with fixed id
 */
GLGR.Recommendation = function (rec_id, rec_data) {

    /** Static array holding the list of all rec ids**/
    GLGR.Recommendation.reclist_ = GLGR.Recommendation.reclist_ || [];

    if (rec_id !== null)
        this.id_ = rec_id;
    else
        this.id_ = GLGR.Recommendation.reclist_.length;
    GLGR.Recommendation.reclist_.push(this);


    //Meshes
    this.webGlObjects_ = {
        node: null,
        label: null,
        line: null
    };

    this.graph_center_ = {
        x: 0.0,
        y: 0.0
    };

    this.position_data_ = {
        degree: {curr: 0, goal: 0},
        distance: {curr: 0, goal: 0}
    };

    this.weight_factor_ = {
        curr: 1,
        goal: 1,
        stored: null
    };

    this.is_minimized_ = false;

    this.transparency_from_graph_ = null;

    //Static object holding several parameters for visualization
    GLGR.Recommendation.vis_params =
            GLGR.Recommendation.vis_params ||
            {
                line_z: -100,
                node_z: -30,
                node_radius: 5,
                node_min_radius: 0.5,
                node_color: 0x4444FF,
                sphere: {
                    segments: 8,
                    rings: 8
                },
                line: {
                    color: 0x999999,
                    width: 1
                },
                weight: {
                    exp: 3,
                    minimized: 0.1
                },
                animation: {
                    inv_speed_weight: 300,
                    inv_speed_distance: 50,
                    threshold: 0.003
                }

            };


    //Parameter-Object holding data like title, url, image ...
    this.rec_data_ = {};
    if (typeof rec_data === "object")
        this.rec_data_ = rec_data;

};



/**
 * Needed on init and maybe on update if flag is set
 * @returns {THREE.Mesh} new Sphere Mesh object
 */
GLGR.Recommendation.prototype.createSphereMesh_ = function () {

    // create the sphere's material
    var sphereMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: GLGR.Recommendation.vis_params.node_color,
                        transparent: true
                    });

    var sphere_rad = GLGR.Recommendation.vis_params.node_radius;

    var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                    sphere_rad,
                    GLGR.Recommendation.vis_params.sphere.segments,
                    GLGR.Recommendation.vis_params.sphere.rings),
            sphereMaterial);

    return sphere;
};



GLGR.Recommendation.prototype.initWegGlObjects = function () {



    this.webGlObjects_.node = this.createSphereMesh_();

    this.webGlObjects_.node.interaction_handlers = {
        "mouseclick": this.handleRecClick,
        "recref": this
    };

    var rec_pos = this.getFinalPosition_();
    var z_pos = GLGR.Recommendation.vis_params.node_z;
    this.webGlObjects_.node.position = new THREE.Vector3(rec_pos.x, rec_pos.y, z_pos);


    GLGR.Scene.getSingleton().getThreeScene().add(
            this.webGlObjects_.node
            );





    //LINE

    var line_material = new THREE.LineBasicMaterial({
        color: GLGR.Recommendation.vis_params.line.color,
        linewidth: GLGR.Recommendation.vis_params.line.width,
        transparent: true
    });

    var line_geometry = new THREE.Geometry();
    line_geometry.vertices.push(new THREE.Vector3(
            this.graph_center_.x,
            this.graph_center_.y,
            GLGR.Recommendation.vis_params.line_z)
            );

    line_geometry.vertices.push(new THREE.Vector3(
            rec_pos.x,
            rec_pos.y,
            GLGR.Recommendation.vis_params.line_z))
            ;

    this.webGlObjects_.line = new THREE.Line(line_geometry, line_material);
    GLGR.Scene.getSingleton().getThreeScene().add(this.webGlObjects_.line);
};


/**
 * Call from graph to recalculate positions etc.
 */
GLGR.Recommendation.prototype.update = function () {

    //Recalculate values for smooth animation
    this.animate_();

    //Set position of node
    var rec_pos = this.getFinalPosition_();
    var z_pos = GLGR.Recommendation.vis_params.node_z;
    this.webGlObjects_.node.position.set(rec_pos.x, rec_pos.y, z_pos);



    //Calculate the new scale factor of the rec-node and apply it.

    var curr_val = Math.pow(
            this.weight_factor_.curr,
            GLGR.Recommendation.vis_params.weight.exp
            );

    if (curr_val < GLGR.Recommendation.vis_params.node_min_radius)
        curr_val = GLGR.Recommendation.vis_params.node_min_radius;

    var old_val = Math.pow(
            this.webGlObjects_.node.scale.x,
            1 / GLGR.Recommendation.vis_params.weight.exp
            );

    var curr_scale = curr_val / old_val;

    this.webGlObjects_.node.scale.set(curr_scale, curr_scale, curr_scale);



    //Recalculate Line-Positions

    var l_v1 = new THREE.Vector3(
            this.graph_center_.x,
            this.graph_center_.y,
            GLGR.Recommendation.vis_params.line_z
            );

    var l_v2 = new THREE.Vector3(
            rec_pos.x,
            rec_pos.y,
            GLGR.Recommendation.vis_params.line_z
            );

    var line_needs_update = false;
    if (l_v1 !== this.webGlObjects_.line.geometry.vertices[0] ||
            l_v2 !== this.webGlObjects_.line.geometry.vertices[1])
        line_needs_update = true;

    this.webGlObjects_.line.geometry.vertices[0] = l_v1;
    this.webGlObjects_.line.geometry.vertices[1] = l_v2;

    //Only update if changed
    if (line_needs_update)
        this.webGlObjects_.line.geometry.verticesNeedUpdate = true;


    //Bounding sphere necessary for camera movement
    //Compute if never done before, or on change
    if (line_needs_update ||
            this.webGlObjects_.line.geometry.bounding_comp_once === undefined)
    {
        this.webGlObjects_.line.geometry.computeBoundingSphere();
        this.webGlObjects_.line.geometry.bounding_comp_once = true;
    }




    for (var gl_obj_key in this.webGlObjects_)
    {
        if (this.webGlObjects_[gl_obj_key] === null)
            continue;

        this.webGlObjects_[gl_obj_key].material.opacity = this.transparency_from_graph_;
    }



};




/**
 * Changes the values like weight or distance step by step to animate the changes
 */
GLGR.Recommendation.prototype.animate_ = function () {

    var objs_to_animate = [
        {
            obj: this.weight_factor_,
            inverse_speed: GLGR.Recommendation.vis_params.animation.inv_speed_weight
        },
        {
            obj: this.position_data_.distance,
            inverse_speed: GLGR.Recommendation.vis_params.animation.inv_speed_distance}
    ];


    for (var i = 0; i < objs_to_animate.length; i++)
    {
        var curr_obj = objs_to_animate[i].obj;
        var curr_inverse_speed = objs_to_animate[i].inverse_speed;


        //Only animate if not the same!
        if (curr_obj.curr !== curr_obj.goal)
        {
            var time_delta = GLGR.Scene.getSingleton().getTimeDelta();

            //calculate the new value by the old value plus the diff multiplied
            //with the time delta and the speed factor
            var new_val = curr_obj.curr +
                    ((curr_obj.goal - curr_obj.curr)) *
                    time_delta /
                    curr_inverse_speed;

            //Stopping if difference inside delta
            if (Math.abs(new_val - curr_obj.goal) < GLGR.Recommendation.vis_params.animation.threshold)
                new_val = curr_obj.goal;

            //Stop if curr overtook goal
            if (curr_obj.curr > curr_obj.goal)
            {
                if (new_val < curr_obj.goal)
                    new_val = curr_obj.goal;
            }

            if (curr_obj.curr < curr_obj.goal)
            {
                if (new_val > curr_obj.goal)
                    new_val = curr_obj.goal;
            }

            curr_obj.curr = new_val;

        }

    }
};




/**
 * Returns the global calculated positions (graph pos + x,y from degree and distance)
 * @returns {Object}
 */
GLGR.Recommendation.prototype.getFinalPosition_ = function () {
    var final_pos_x = this.graph_center_.x;
    var final_pos_y = this.graph_center_.y;



    var degree = Math.random() * 2 * Math.PI;
    var dist_val = this.position_data_.distance.curr * this.weight_factor_.curr;


    var relative_x = Math.cos(this.position_data_.degree) * dist_val;
    var relative_y = Math.sin(this.position_data_.degree) * dist_val;
    final_pos_x += relative_x;
    final_pos_y += relative_y;

    return {x: final_pos_x, y: final_pos_y};
};


/**
 * 
 * @param {float|null} degree RAD
 * @param {float|null} distance Distance from graph-center
 */
GLGR.Recommendation.prototype.setPositionData = function (degree, distance) {

    if (degree !== null)
        this.position_data_.degree = degree;

    if (distance !== null)
        this.position_data_.distance.goal = distance;
};


GLGR.Recommendation.prototype.setWeight = function (weight_factor) {
    this.weight_factor_.goal = weight_factor;
};


/**
 * 
 * @return {GLGR.Recommendation.prototype.position_data_} Position data
 */
GLGR.Recommendation.prototype.getPositionData = function () {
    return this.position_data_;
};


/**
 * Setting the Rec's Graph's 2D-Position
 * @param {float|null} x
 * @param {float|null} y
 */
GLGR.Recommendation.prototype.setGraphCenter = function (x, y) {
    if (x !== null)
        this.graph_center_.x = x;
    if (y !== null)
        this.graph_center_.y = y;
};




/**
 * Returning the objects id
 * @returns {GLGR.Recommendation.id_}
 */
GLGR.Recommendation.prototype.getId = function () {
    return this.id_;
};



/**
 * Trys to get a recommendation with the specified-id
 * @param {Integer} rec_id_to_find
 * @returns {GLGR.Recommendation|null}
 */
GLGR.Recommendation.getRecommendationById = function (rec_id_to_find) {


    for (var i = 0; i < this.reclist_.length; i++)
    {
        var r_to_check_ = this.reclist_[i];
        if (r_to_check_.getId() === rec_id_to_find)
            return r_to_check_;
    }

    return null;
};


/**
 * Returns a list of graph-ids holding this recommendation
 * @returns {Array}
 */
GLGR.Recommendation.prototype.getUsage = function () {

    var out_graph_ids = new Array();

    //Get the Scene-Singleton
    var scene_singleton_ = GLGR.Scene.getSingleton();
    if (scene_singleton_ === null)
        throw new Exception("Scene singleton is null");

    //Get all graphs
    var all_graphs_ = scene_singleton_.getGraphs();

    //Check all graphs for my recommendation-id
    for (var i = 0; i < all_graphs_.length; i++)
    {

        var curr_graph_recs_ = all_graphs_[i].getRecommendationIds();

        //Id in array -> Add it to out-list
        if (curr_graph_recs_.indexOf(this.getId()) >= 0)
            out_graph_ids.push(all_graphs_[i].getId());
    }

    return out_graph_ids;
};


GLGR.Recommendation.prototype.handleRecClick = function () {

    var that = this.recref;



    //Demo
    var infoblock = jQuery('#information-container-rec-info');

    if (!infoblock.length)
        throw ("ERROR: DEMO REC INFO BLOCK NOT EXISTING! CLEAN UP YOUR CODE!");


    jQuery('#information-container-rec-info-id').html(that.getId());

    if (that.rec_data_.title !== undefined)
        jQuery('#information-container-rec-info-title').html(that.rec_data_.title);
    if (that.rec_data_.url !== undefined)
        jQuery('#information-container-rec-info-url').html(that.rec_data_.url);
    infoblock.show();

};


GLGR.Recommendation.prototype.toggleStateMinimized = function ()
{

    if (this.is_minimized_)
    {
        if (this.weight_factor_.stored !== null)
            this.weight_factor_.goal = this.weight_factor_.stored;
        this.weight_factor_.stored = null;
        this.is_minimized_ = false;
    }
    else
    {
        this.weight_factor_.stored = this.weight_factor_.goal;
        this.weight_factor_.goal = GLGR.Recommendation.vis_params.weight.minimized;
        this.is_minimized_ = true;
    }

};


/**
 * Setting a factor for transparency that comes from the graph
 * @param {float} transparency_factor
 */
GLGR.Recommendation.prototype.setTransparencyFromGraph = function (transparency_factor) {
    this.transparency_from_graph_ = transparency_factor;
};