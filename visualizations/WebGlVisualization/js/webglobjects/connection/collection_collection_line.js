var GLVIS = GLVIS || {};


/**
 * 
 * @param {GLVIS.Collection} collection_1
 * @param {GLVIS.Collection} collection_2
 */
GLVIS.ConnectionCollectionCollection = function (collection_1, collection_2) {

    /** @type{GLVIS.Collection} **/
    this.c1_ = collection_1;
    /** @type{GLVIS.Collection} **/
    this.c2_ = collection_2;
    this.dirty_ = true;

    this.webgl_objects_ = {
        line: null
    };
    
    if (!this.c1_ || !this.c2_)
        return;
    
    this.initAndRegisterGlObj();
};

GLVIS.ConnectionCollectionCollection.prototype.initAndRegisterGlObj = function () {

    var config = GLVIS.config.connection.collection_collection;


    var line_material = new THREE.LineBasicMaterial({
        color: config.color,
        linewidth: config.width,
        transparent: true
    });

    var line_geometry = new THREE.Geometry();
    line_geometry.vertices.push(new THREE.Vector3(
            0.0,
            0.0,
            0.0
            )
            );

    line_geometry.vertices.push(new THREE.Vector3(
            0.0,
            0.0,
            0.0
            ))
            ;

    line_geometry.computeBoundingSphere();


    this.webgl_objects_.line = new THREE.Line(line_geometry, line_material);


    var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();
    webgl_handler.getThreeScene().add(this.webgl_objects_.line);
};


GLVIS.ConnectionCollectionCollection.prototype.render = function () {

    if (!this.dirty_)
        return;

    if (!this.c1_ || !this.c2_)
        return;

    var config = GLVIS.config.connection.collection_collection;
    var pos1 = this.c1_.getPosition();
    var pos2 = this.c2_.getPosition();


    GLVIS.Debugger.debug("ConnectionCollectionCollection",
    "Rendering CONNECTION for Collections " + this.c1_.getId() + "/" + this.c2_.getId(),
    7);
    

    this.webgl_objects_.line.geometry.vertices[0].set(pos1.x, pos1.y, config.z);
    this.webgl_objects_.line.geometry.vertices[1].set(pos2.x, pos2.y, config.z);
    this.webgl_objects_.line.geometry.verticesNeedUpdate = true;

    //Necessary for camera movement
    this.webgl_objects_.line.geometry.computeBoundingSphere();

    var width = config.width;
this.webgl_objects_.line.material.opacity = config.opacity;
    this.webgl_objects_.line.material.linewidth = width;
};



GLVIS.ConnectionCollectionCollection.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.ConnectionCollectionCollection.prototype.getIsDirty = function () {
    return this.dirty_;
};