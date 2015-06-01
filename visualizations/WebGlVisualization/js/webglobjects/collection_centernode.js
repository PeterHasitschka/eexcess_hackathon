
GLVIS = GLVIS || {};


/**
 * Representing the node of a Collection in WebGl
 * @param {GLVIS.Collection} collection collection that node represents
 */
GLVIS.CollectionCenterNode = function (collection) {

    /** @type{GLVIS.Collection} **/
    this.collection_ = collection;

    this.default_color_ = GLVIS.config.collection.center_node.sphere.color;

    this.dirty_ = true;

    this.webgl_objects_ = {
        sphere: null
    };

    this.initAndRegisterGlObj();
};

GLVIS.CollectionCenterNode.prototype.initAndRegisterGlObj = function () {

    var sphere_config = GLVIS.config.collection.center_node.sphere;

    var sphereMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: sphere_config.color,
                        transparent: true
                    });

    var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                    sphere_config.radius,
                    sphere_config.segments,
                    sphere_config.rings),
            sphereMaterial);

    //Register click-function
    sphere.interaction = {
        "mouseclick": this.collection_.handleClick,
        "collection": this.collection_
    };


    var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();
    webgl_handler.getThreeScene().add(sphere);

    this.webgl_objects_.sphere = sphere;


};



GLVIS.CollectionCenterNode.prototype.render = function () {

    if (!this.dirty_)
        return;


    GLVIS.Debugger.debug("CollectionCenterNode",
            "Rendering COLLECTION CENTER-NODE  for collection " + this.collection_.getId(),
            7);


    var sphere_color;
    if (this.collection_.getStatus() === GLVIS.Collection.STATUSFLAGS.SELECTED)
        sphere_color = GLVIS.config.collection.center_node.sphere.select_color;
    else
        sphere_color = this.default_color_;

    this.webgl_objects_.sphere.material.color.setHex(sphere_color);




    var pos = this.collection_.getPosition();

    var z_pos = GLVIS.config.collection.center_node.sphere.z_value;
    this.webgl_objects_.sphere.position.set(
            pos.x,
            pos.y,
            z_pos
            );

    this.dirty_ = false;
};







GLVIS.CollectionCenterNode.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.CollectionCenterNode.prototype.getIsDirty = function () {
    return this.dirty_;
};