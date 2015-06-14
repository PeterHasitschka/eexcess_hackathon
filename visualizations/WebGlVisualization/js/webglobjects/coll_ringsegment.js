
var GLVIS = GLVIS || {};


/**
 * Holding the visual representation and data of a segment in one of the rings
 * in the @see{GLVIS.RingRepresentation}.
 * 
 * @param {GLVIS.RingRepresentation} ring_representation Ring Representation
 * @param {integer} level Between 0 and *. Ring number
 * @param {float} start_percent 0...100 percent to start. 0 is on the top
 * @param {float} end_percent 0...100 percent to end. 0 is on the top
 * @param {integer} color color to fill
 * @param {string} key Key like "language"
 * @param {string} val Value like "de"
 */
GLVIS.RingSegment = function (ring_representation, level, start_percent, end_percent, color, key, val, recs) {

    /** @type{GLVIS.RingRepresentation} **/

    GLVIS.Debugger.debug("RingSegment", [level, start_percent, end_percent], 6);

    this.ring_representation_ = ring_representation;

    this.data_ = {
        key: key,
        val: val
    };

    this.affected_recs_ = recs;

    this.default_color_ = color;
    this.level_ = level;

    this.start_pc_ = start_percent;
    this.end_pc_ = end_percent;

    this.dirty_ = true;

    this.webgl_objects_ = {
        ring_seg: null,
        label: null
    };

    this.relative_pos_ = null;

    this.is_selected_ = false;

    this.initAndRegisterGlObj();
};


/**
 * Initialize the ring-segments GL Objects.
 * These are the segment itself (Ring Geometry) and the label
 */
GLVIS.RingSegment.prototype.initAndRegisterGlObj = function () {

    var ring_config = GLVIS.config.collection.ring.ring_segment;

    var material =
            new THREE.MeshBasicMaterial(
                    {
                        color: this.default_color_,
                        side: THREE.DoubleSide,
                        transparent: true
                    });

    var rad_inner = ring_config.min_distance + this.level_ * (ring_config.thickness + ring_config.gap);
    var rad_outer = rad_inner + ring_config.thickness;

    var rad_fact = Math.PI * 2;

    var ring_start = this.start_pc_ * 0.01 * rad_fact - (Math.PI / 2);
    var ring_end = this.end_pc_ * 0.01 * rad_fact - (Math.PI / 2);


    var segment_middle_rad = (ring_end + ring_start) / 2;
    var radius_middle = (rad_outer + rad_inner) / 2;
    this.relative_pos_ = {
        x: Math.cos(segment_middle_rad) * radius_middle,
        y: Math.sin(segment_middle_rad) * radius_middle
    };


    /**
     * Segment
     */
    var seg_length = ring_end - ring_start;
    var seg_num_fact = seg_length / (Math.PI * 2); 
    var seg_num = Math.round(ring_config.segments * seg_num_fact);
    
    var phi_seg_num = ring_config.phi_seg_num;
    
    var ring_geometry = new THREE.RingGeometry(rad_inner, rad_outer, seg_num , phi_seg_num, ring_start, seg_length);
    var mesh = new THREE.Mesh(ring_geometry, material);

    var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();
    webgl_handler.getThreeScene().add(mesh);
    this.webgl_objects_.ring_seg = mesh;

    //Register click-function
    mesh.interaction = {
        "mouseclick": this.handleClick,
        "ringseg": this
    };


    /**
     * Label
     */
    var label_config = GLVIS.config.collection.ring.ring_segment.label;

    var label_options = {
        color: label_config.color,
        bg_color: null,
        font_size: label_config.font_size,
        pos_x: 0,
        pos_y: 0,
        pos_z: label_config.z_value
    };

    var text = this.data_.val;
    text = text.replace(" ", "\n");
    var label = new GLVIS.Text(text, label_options);
    this.webgl_objects_.label = label;
};

/**
 * Rendering the ring segment
 */
GLVIS.RingSegment.prototype.render = function () {

    if (!this.dirty_)
        return;

    GLVIS.Debugger.debug("RingSegment",
            "Rendering RING SEGMENT",
            7);

    var pos = this.ring_representation_.getPosition();

    var z_pos = GLVIS.config.collection.ring.ring_segment.z_value;

    this.webgl_objects_.ring_seg.position.set(
            pos.x,
            pos.y,
            z_pos
            );

    GLVIS.Debugger.debug("RingSegment",
            "Setting pos to: " + pos.x + " " + pos.y + " " + z_pos,
            6);

    if (this.is_selected_)
        this.webgl_objects_.ring_seg.material.opacity = 1;
    else
        this.webgl_objects_.ring_seg.material.opacity = GLVIS.config.collection.ring.ring_segment.opacity;


    this.webgl_objects_.label.setPosition(
            pos.x + this.relative_pos_.x,
            pos.y + this.relative_pos_.y,
            null
            );
    this.webgl_objects_.label.render();

    //this.webgl_objects_.ring_seg.geometry.computeBoundingSphere();
    this.dirty_ = false;
};



GLVIS.RingSegment.prototype.handleClick = function () {

    var that = this.ringseg;

    GLVIS.Debugger.debug("RingSegment",
            ["RING SEGMENT CLICKED", that],
            3);

    that.is_selected_ = !that.is_selected_;
    that.setIsDirty(true);

};

GLVIS.RingSegment.prototype.deSelect = function () {

    if (this.is_selected_ !== true)
        return;

    GLVIS.Debugger.debug("RingSegment",
            "Deselecting ring segment",
            6);

    this.is_selected_ = true;
    this.setIsDirty(true);
};


GLVIS.RingSegment.prototype.setIsDirty = function (dirty) {

    if (dirty === this.dirty_)
        return;

    this.dirty_ = dirty;
    this.ring_representation_.setIsDirty(true);
};

GLVIS.RingSegment.prototype.getIsDirty = function () {
    return this.dirty_;
};

/**
 * Get the level of the ring. Starting with 0
 * @returns {float}
 */
GLVIS.RingSegment.prototype.getLevel = function () {
    return this.level_;
};

/**
 * Returning all recs that are affected by this segment.
 * @returns {Array}
 */
GLVIS.RingSegment.prototype.getAffectedRecs = function () {
    return this.affected_recs_;
};

/**
 * Getting the center position around the collection
 * @returns {GLVIS.RingSegment.relative_pos_}
 */
GLVIS.RingSegment.prototype.getRelativePosition = function () {
    return this.relative_pos_;
};

/**
 * Get the length of the segment in Radians
 * @returns {float}
 */
GLVIS.RingSegment.prototype.getRadLength = function () {

    var length_perc = this.end_pc_ - this.start_pc_;
    var length_rad = length_perc * 0.01 * Math.PI * 2;

    return length_rad;
};

/**
 * Delete all webgl-objects
 */
GLVIS.RingSegment.prototype.delete = function () {

    var three_scene = GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene();

    three_scene.remove(this.webgl_objects_.ring_seg);
    this.webgl_objects_.label.delete();
};