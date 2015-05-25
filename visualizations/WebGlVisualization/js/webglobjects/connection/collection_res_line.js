var GLVIS = GLVIS || {};


/**
 * 
 * @param {GLVIS.Result} result
 */
GLVIS.ConnectionCollectionResult = function (result) {

    /** @type{GLVIS.Result} **/
    this.result_ = result;
    this.dirty_ = true;

    this.webgl_objects_ = {
        line: null
    };

    this.initAndRegisterGlObj();
};

GLVIS.ConnectionCollectionResult.prototype.initAndRegisterGlObj = function () {

    var config = GLVIS.config.connection.result_collection;


    var line_material = new THREE.LineBasicMaterial({
        color: config.color,
        linewidth: config.width,
        transparent: true
    });

    var line_geometry = new THREE.Geometry();
    line_geometry.vertices.push(new THREE.Vector3(
            0.0,
            0.0,
            config.width
            )
            );

    line_geometry.vertices.push(new THREE.Vector3(
            0.0,
            0.0,
            config.width
            ))
            ;

    line_geometry.computeBoundingSphere();


    this.webgl_objects_.line = new THREE.Line(line_geometry, line_material);


    var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();
    webgl_handler.getThreeScene().add(this.webgl_objects_.line);
};


GLVIS.ConnectionCollectionResult.prototype.render = function () {

    if (!this.dirty_)
        return;

    var config = GLVIS.config.connection.result_collection;
    var res_pos = this.result_.getPosition();

    var coll_pos = this.result_.getCollection().getPosition();

    if (GLVIS.config.debug)
        console.log("Rendering CONNECTION for result " + this.result_.getId());


    this.webgl_objects_.line.geometry.vertices[0].set(res_pos.x, res_pos.y, config.z);
    this.webgl_objects_.line.geometry.vertices[1].set(coll_pos.x, coll_pos.y, config.z);
    this.webgl_objects_.line.geometry.verticesNeedUpdate = true;

    //Necessary for camera movement
    this.webgl_objects_.line.geometry.computeBoundingSphere();

    var width = config.width;

    this.webgl_objects_.line.material.linewidth = width;
};



GLVIS.ConnectionCollectionResult.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.ConnectionCollectionResult.prototype.getIsDirty = function () {
    return this.dirty_;
};