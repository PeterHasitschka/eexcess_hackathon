var GLIVS = GLVIS || {};


GLVIS.DirectCompareBar = function (collection, percent) {

    this.dirty_ = true;
    this.collection_ = collection;
    this.percent_ = percent;

    this.label_ = null;
    this.webgl_objects_ = {
        bar_pos: null,
        bar_meg: null
    };

    this.initGlObjects();
};

GLVIS.DirectCompareBar.prototype.initGlObjects = function () {



    var mat_positive =
            new THREE.MeshBasicMaterial(
                    {
                        color: 0x00FF00,
                        transparent: true,
                        side: THREE.DoubleSide
                    });

    var geometry_positive = new THREE.PlaneGeometry(20, 10);
    var rect_positive = new THREE.Mesh(geometry_positive, mat_positive);

    //Register click-function
    rect_positive.interaction = {
        "mouseclick": this.collection_.handleClick,
        "collection": this.collection_
    };



    var mat_negative =
            new THREE.MeshBasicMaterial(
                    {
                        color: 0xFF0000,
                        transparent: true,
                        side: THREE.DoubleSide
                    });

    var geometry_negative = new THREE.PlaneGeometry(10, 10);
    var rect_negative = new THREE.Mesh(geometry_negative, mat_negative);

    //Register click-function
    rect_negative.interaction = {
        "mouseclick": this.collection_.handleClick,
        "collection": this.collection_
    };



    var webgl_handler = GLVIS.Scene.getCurrentScene().getWebGlHandler();

    webgl_handler.getThreeScene().add(rect_positive);
    webgl_handler.getThreeScene().add(rect_negative);
    this.webgl_objects_.bar_pos = rect_positive;
    this.webgl_objects_.bar_neg = rect_negative;

};

GLVIS.DirectCompareBar.prototype.render = function () {

    if (!this.dirty_)
        return;


    console.log("DUMMY RENDER COMPARE BAR");

    var pos = this.collection_.getPosition();

    this.webgl_objects_.bar_pos.position.set(
            pos.x,
            pos.y - 200,
            -10
            );

    this.webgl_objects_.bar_neg.position.set(
            pos.x + 15,
            pos.y - 200,
            -10
            );

    this.setIsDirty(false);
};

GLVIS.DirectCompareBar.prototype.delete = function () {
    console.log("DUMMY DELETE COMPARE BAR");

    var three_scene = GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene();

    three_scene.remove(this.webgl_objects_.bar_pos);
    three_scene.remove(this.webgl_objects_.bar_neg);

    delete this.webgl_objects_.bar_pos;
    delete this.webgl_objects_.bar_neg;
};


GLVIS.DirectCompareBar.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.DirectCompareBar.prototype.getIsDirty = function () {
    return this.dirty_;
};