
GLVIS = GLVIS || {};


/**
 * Representing a common result of a Collection in WebGl
 * @param {GLVIS.Result} result result that node represents
 */
GLVIS.ResultCommonNode = function (result) {


    this.dirty_ = true;
    this.result_ = result;

    this.webgl_objects_ = {
        sphere: null
    };


    this.initAndRegisterGlObj();
};



GLVIS.ResultCommonNode.prototype.initAndRegisterGlObj = function () {

    var config = GLVIS.config.collection.result.common_node;

    var sphereMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: config.color,
                        transparent: true
                    });

    var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(
                    config.radius,
                    config.sphere.segments,
                    config.sphere.rings),
            sphereMaterial);


    //Register click-function
    sphere.interaction = {
        "mouseclick": this.result_.handleClick,
        "result": this.result_
    };


    var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();
    webgl_handler.getThreeScene().add(sphere);

    this.webgl_objects_.sphere = sphere;

};


GLVIS.ResultCommonNode.prototype.render = function () {
    
    if (!this.dirty_)
        return;



    if (GLVIS.config.debug)
        console.log("Rendering RESULT COMMON-NODE  for result " + this.result_.getId());
    
    
    
        
    var abs_pos = this.result_.getPosition();
    
    var z_pos = GLVIS.config.collection.result.common_node.z_value;
    this.webgl_objects_.sphere.position.set(
            abs_pos.x,
            abs_pos.y,
            z_pos
            );
};




GLVIS.ResultCommonNode.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.ResultCommonNode.prototype.getIsDirty = function () {
    return this.dirty_;
};