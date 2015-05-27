var GLVIS = GLVIS || {};


/**
 * 
 * @param {GLVIS.Recommendation} recommendation
 */
GLVIS.ConnectionCollectionRecommendation = function (recommendation) {

    /** @type{GLVIS.Recommendation} **/
    this.recommendation_ = recommendation;
    this.dirty_ = true;

    this.webgl_objects_ = {
        line: null
    };

    this.initAndRegisterGlObj();
};

GLVIS.ConnectionCollectionRecommendation.prototype.initAndRegisterGlObj = function () {

    var config = GLVIS.config.connection.recommendation_collection;


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


GLVIS.ConnectionCollectionRecommendation.prototype.render = function () {

    if (!this.dirty_)
        return;

    var config = GLVIS.config.connection.recommendation_collection;
    var rec_pos = this.recommendation_.getPosition();

    var coll_pos = this.recommendation_.getCollection().getPosition();

    if (GLVIS.config.debug)
        console.log("Rendering CONNECTION for recommendation " + this.recommendation_.getId());


    this.webgl_objects_.line.geometry.vertices[0].set(rec_pos.x, rec_pos.y, config.z);
    this.webgl_objects_.line.geometry.vertices[1].set(coll_pos.x, coll_pos.y, config.z);
    this.webgl_objects_.line.geometry.verticesNeedUpdate = true;

    //Necessary for camera movement
    this.webgl_objects_.line.geometry.computeBoundingSphere();

    var width = config.width;

    this.webgl_objects_.line.material.linewidth = width;
};



GLVIS.ConnectionCollectionRecommendation.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.ConnectionCollectionRecommendation.prototype.getIsDirty = function () {
    return this.dirty_;
};