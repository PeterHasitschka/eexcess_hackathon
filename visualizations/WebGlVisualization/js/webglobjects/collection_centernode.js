
GLVIS = GLVIS || {};


/**
 * Representing the node of a Collection in WebGl
 * @param {GLVIS.Collection} collection collection that node represents
 * @param {THREE.Object3D | null} mesh_parent Object to use as webgl-parent
 */
GLVIS.CollectionCenterNode = function (collection, mesh_parent) {

    /** @type{GLVIS.Collection} **/
    this.collection_ = collection;

    this.default_color_ = GLVIS.config.collection.center_node.circle.color;

    this.dirty_ = true;

    this.webgl_objects_ = {
        circle: null
    };

    this.initAndRegisterGlObj(mesh_parent);
};

GLVIS.CollectionCenterNode.prototype.initAndRegisterGlObj = function (mesh_parent) {

    var circle_config = GLVIS.config.collection.center_node.circle;

    var circleMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: circle_config.color,
                        transparent: true,
                        side: THREE.DoubleSide
                    });

    /*
     * For rotation a sphere is better
     var mesh = new THREE.CircleGeometry(
     circle_config.radius,
     circle_config.segments);
     */
    mesh = new THREE.SphereGeometry(circle_config.radius, circle_config.segments, circle_config.segments);

    var circle = new THREE.Mesh(
            mesh,
            circleMaterial);


    //Register click-function
    circle.interaction = {
        "mouseclick": this.collection_.handleClick.bind(this.collection_),
        "mouseover": this.collection_.handleMouseover.bind(this.collection_),
    };

    if (!mesh_parent) {
        var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();
        webgl_handler.getThreeScene().add(circle);
    }
    else
        mesh_parent.add(circle);

    this.webgl_objects_.circle = circle;


};



GLVIS.CollectionCenterNode.prototype.render = function () {

    if (!this.dirty_)
        return;


    GLVIS.Debugger.debug("CollectionCenterNode",
            "Rendering COLLECTION CENTER-NODE  for collection " + this.collection_.getId(),
            7);


    var circle_color;
    if (this.collection_.getStatus() === GLVIS.Collection.STATUSFLAGS.SELECTED)
        circle_color = GLVIS.config.collection.center_node.circle.select_color;
    else
        circle_color = this.default_color_;

    this.webgl_objects_.circle.material.color.setHex(circle_color);




    var pos = this.collection_.getPosition();

    var z_pos = GLVIS.config.collection.center_node.circle.z_value;
    this.webgl_objects_.circle.position.set(
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