
GLVIS = GLVIS || {};


/**
 * Representing the node of a Collection in WebGl
 * @param {GLVIS.Collection} collection collection that node represents
 */
GLVIS.CollectionCenterNode = function (collection) {

    /** @type{GLVIS.Collection} **/
    this.collection_ = collection;

    this.default_color_ = GLVIS.config.collection.center_node.circle.color;

    this.dirty_ = true;

    this.webgl_objects_ = {
        circle: null
    };

    this.initAndRegisterGlObj();
};

GLVIS.CollectionCenterNode.prototype.initAndRegisterGlObj = function () {

    var circle_config = GLVIS.config.collection.center_node.circle;

    var circleMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: circle_config.color,
                        transparent: true,
                        side: THREE.DoubleSide
                    });

    var circle = new THREE.Mesh(
            new THREE.CircleGeometry(
                    circle_config.radius,
                    circle_config.segments),
            circleMaterial);

    //Register click-function
    circle.interaction = {
        "mouseclick": this.collection_.handleClick,
        "collection": this.collection_
    };


    var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();
    webgl_handler.getThreeScene().add(circle);

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