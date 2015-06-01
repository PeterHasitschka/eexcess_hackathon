
GLVIS = GLVIS || {};


/**
 * Representing a common recommendation of a Collection in WebGl
 * @param {GLVIS.Recommendation} recommendation recommendation that node represents
 */
GLVIS.RecommendationCommonNode = function (recommendation) {

    this.dirty_ = true;
    this.recommendation_ = recommendation;

    this.webgl_objects_ = {
        sphere: null
    };

    //Needed due to relative scaling.
    this.init_radius_ = this.recommendation_.getRadius();


    this.initAndRegisterGlObj();
};



GLVIS.RecommendationCommonNode.prototype.initAndRegisterGlObj = function () {

    var config = GLVIS.config.collection.recommendation.common_node;

    var sphereMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: this.recommendation_.getColor(),
                        transparent: true
                    });

    var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                    this.init_radius_,
                    config.sphere.segments,
                    config.sphere.rings),
            sphereMaterial);


    //Register click-function
    sphere.interaction = {
        "mouseclick": this.recommendation_.handleClick,
        "recommendation": this.recommendation_
    };


    var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();
    webgl_handler.getThreeScene().add(sphere);

    this.webgl_objects_.sphere = sphere;

};


GLVIS.RecommendationCommonNode.prototype.render = function () {

    if (!this.dirty_)
        return;



    GLVIS.Debugger.debug(
            "RecommendationCommonNode",
            "Rendering RECOMMENDATION COMMON-NODE  for recommendation " + this.recommendation_.getId(),
            7);





    var abs_pos = this.recommendation_.getPosition();

    var z_pos = GLVIS.config.collection.recommendation.common_node.z_value;
    this.webgl_objects_.sphere.position.set(
            abs_pos.x,
            abs_pos.y,
            z_pos
            );


    var curr_radius = this.recommendation_.getRadius();
    scale_factor = curr_radius / this.init_radius_;
    this.webgl_objects_.sphere.scale.set(scale_factor, scale_factor, scale_factor);


    this.webgl_objects_.sphere.material.opacity = this.recommendation_.getOpacity();

};




GLVIS.RecommendationCommonNode.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.RecommendationCommonNode.prototype.getIsDirty = function () {
    return this.dirty_;
};