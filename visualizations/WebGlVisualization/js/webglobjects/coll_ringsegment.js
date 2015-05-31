
GLVIS = GLVIS || {};


/**
 * @param {GLVIS.RingRepresentation} ring_representation Ring Representation
 */
GLVIS.RingSegment = function (ring_representation) {

    /** @type{GLVIS.RingRepresentation} **/
    this.ring_representation_ = ring_representation;

    this.default_color_ = GLVIS.config.collection.ring_segment.color;

    this.dirty_ = true;

    this.webgl_objects_ = {
        ring_seg: null
    };

    this.initAndRegisterGlObj();
};

GLVIS.RingSegment.prototype.initAndRegisterGlObj = function () {

    var ring_config = GLVIS.config.collection.ring_segment;

    var material =
            new THREE.MeshBasicMaterial(
                    {
                        color: ring_config.color,
                        transparent: true
                    });

    var rad_inner = ring_config.min_distance;
    var rad_outer = ring_config.min_distance + ring_config.thickness;

    var ring_geometry = new THREE.RingGeometry(rad_inner, rad_outer, 3, 3, 0, Math.PI / 2);

    var mesh = new THREE.Mesh(ring_geometry, material);

    //Register click-function
    ring_geometry.interaction = {
        "mouseclick": this.handleClick,
        "ringseg": this
    };


    var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();
    webgl_handler.getThreeScene().add(mesh);
    ring_geometry.computeBoundingSphere();


    this.webgl_objects_.ring_seg = mesh;

};



GLVIS.RingSegment.prototype.render = function () {

    if (!this.dirty_)
        return;


    GLVIS.Debugger.debug("RingSegment",
            "Rendering RING SEGMENT",
            5);





    var pos = this.ring_representation_.getPosition();

    var z_pos = GLVIS.config.collection.ring_segment.z_value;
    this.webgl_objects_.ring_seg.position.set(
            pos.x,
            pos.y,
            z_pos
            );
    GLVIS.Debugger.debug("RingSegment",
            "Setting pos to: " + pos.x + " " + pos.y + " " + z_pos,
            5);
    console.log(this.webgl_objects_.ring_seg);
    
    this.webgl_objects_.ring_seg.geometry.computeBoundingSphere();
    this.dirty_ = false;
};



GLVIS.RingSegment.prototype.handleClick = function () {

    GLVIS.Debugger.debug("RingSegment",
            "RING SEGMENT CLICKED",
            3);

};



GLVIS.RingSegment.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.RingSegment.prototype.getIsDirty = function () {
    return this.dirty_;
};