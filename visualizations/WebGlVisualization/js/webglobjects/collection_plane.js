
GLVIS = GLVIS || {};


/**
 * Representing plane of a Collection in WebGl
 * @param {GLVIS.Collection} collection collection that node represents
 * @param {THREE.Object3D | null} mesh_parent Object to use as webgl-parent
 */
GLVIS.CollectionPlane = function (collection, mesh_parent) {

    /** @type{GLVIS.Collection} **/
    this.collection_ = collection;

    this.default_color_ = GLVIS.config.collection.plane.color;

    this.dirty_ = true;

    this.webgl_objects_ = {
        circle: null
    };

    this.initAndRegisterGlObj(mesh_parent);
};

GLVIS.CollectionPlane.prototype.initAndRegisterGlObj = function (mesh_parent) {

    var plane_config = GLVIS.config.collection.plane;

    var circleMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: plane_config.color,
                        transparent: true,
                        side: THREE.DoubleSide,
                        opacity: plane_config.opacity
                    });


    var mesh = new THREE.CircleGeometry(GLVIS.config.collection.recommendation.init_distance, plane_config.segments);

    var circle = new THREE.Mesh(
            mesh,
            circleMaterial);


    //Register click-function
    circle.interaction = {
        "mouseclick": this.collection_.handleClick.bind(this.collection_),
        "mouseover": this.collection_.handleMouseover.bind(this.collection_),
        "interaction_id": "collection_center",
        "interaction_singleclick_per_type": true
    };

    if (!mesh_parent) {
        var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();
        webgl_handler.getThreeScene().add(circle);
    }
    else
        mesh_parent.add(circle);

    this.webgl_objects_.circle = circle;


};



GLVIS.CollectionPlane.prototype.render = function () {

    if (!this.dirty_)
        return;


    GLVIS.Debugger.debug("CollectionPlane",
            "Rendering COLLECTION PLANE  for collection " + this.collection_.getId(),
            7);

    var z_pos = GLVIS.config.collection.plane.z_value;
    this.webgl_objects_.circle.position.setZ(
            z_pos
            );

    this.dirty_ = false;
};







GLVIS.CollectionPlane.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.CollectionPlane.prototype.getIsDirty = function () {
    return this.dirty_;
};