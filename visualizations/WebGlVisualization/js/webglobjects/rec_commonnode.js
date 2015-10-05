
GLVIS = GLVIS || {};


/**
 * Representing a common recommendation of a Collection in WebGl
 * @param {GLVIS.Recommendation} recommendation recommendation that node represents
 * @param {THREE.Object3D} mesh-parent
 */
GLVIS.RecommendationCommonNode = function (recommendation, mesh_parent) {

    this.dirty_ = true;
    this.recommendation_ = recommendation;

    this.webgl_objects_ = {
        circle: null
    };

    //Needed due to relative scaling.
    this.init_radius_ = this.recommendation_.getRadius() * this.recommendation_.getSizeFactor();

    this.mesh_parent_ = mesh_parent;

    this.initAndRegisterGlObj(mesh_parent);
};



GLVIS.RecommendationCommonNode.prototype.initAndRegisterGlObj = function (mesh_parent) {

    var config = GLVIS.config.collection.recommendation.common_node;

    var circleMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: this.recommendation_.getColor(),
                        transparent: true,
                        side: THREE.DoubleSide
                    });

    var circle = new THREE.Mesh(
            new THREE.CircleGeometry(
                    this.init_radius_,
                    config.circle.segments),
            circleMaterial);

    //Register click-function
    circle.interaction = {
        "mouseclick": this.recommendation_.handleClick.bind(this.recommendation_),
        "interaction_singleclick_exclusive": true
    };


    mesh_parent.add(circle);

    this.webgl_objects_.circle = circle;

};

GLVIS.RecommendationCommonNode.prototype.render = function () {

    if (!this.dirty_)
        return;

    //May happen after deleting GL-Nodes but render is called once more before deleting
    if (!this.webgl_objects_.circle)
        return;

    GLVIS.Debugger.debug(
            "RecommendationCommonNode",
            "Rendering RECOMMENDATION COMMON-NODE  for recommendation " + this.recommendation_.getId(),
            7);

    var pos = this.recommendation_.getRelativePosition();
    this.webgl_objects_.circle.position.set(
            pos.x,
            pos.y,
            pos.z
            );

    var curr_radius = this.recommendation_.getRadius() * this.recommendation_.getSizeFactor();
    var scale_factor = curr_radius / this.init_radius_;
    this.webgl_objects_.circle.scale.set(scale_factor, scale_factor, scale_factor);




    this.webgl_objects_.circle.material.opacity = this.recommendation_.getOpacity(true);
    this.webgl_objects_.circle.material.color.setHex(this.recommendation_.getColor());

};

GLVIS.RecommendationCommonNode.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.RecommendationCommonNode.prototype.getIsDirty = function () {
    return this.dirty_;
};

/**
 * Returns the mesh of the inner circle
 * @returns {THREE.Mesh}
 */
GLVIS.RecommendationCommonNode.prototype.getCircle = function () {
    return this.webgl_objects_.circle;
},
        /**
         * Delete all GL-Objects and remove them from the scene
         */
        GLVIS.RecommendationCommonNode.prototype.delete = function () {

            //var three_scene = GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene();
            this.mesh_parent_.remove(this.webgl_objects_.circle);

            delete this.webgl_objects_.circle;
        };