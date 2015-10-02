var GLIVS = GLVIS || {};


GLVIS.DirectCompareBar = function (collection, percent) {

    this.dirty_ = true;
    this.collection_ = collection;
    this.percent_ = percent;

    /** @type {GLVIS.Text} **/
    this.label_ = null;

    this.webgl_objects_ = {
        bar_pos: null,
        bar_meg: null
    };

    this.initGlObjects();
};

GLVIS.DirectCompareBar.prototype.initGlObjects = function () {

    var config = GLVIS.config.collection.compare.directcompare.bar;

    var total_width = config.width;
    var pos_width = total_width * this.percent_ * 0.01;
    var neg_width = total_width - pos_width;

    var height = config.height;


    /**
     * POSITIVE (green) Bar
     */
    var mat_positive =
            new THREE.MeshBasicMaterial(
                    {
                        color: config.color_pos,
                        transparent: true,
                        side: THREE.DoubleSide
                    });

    var geometry_positive = new THREE.PlaneBufferGeometry(pos_width, height);
    var rect_positive = new THREE.Mesh(geometry_positive, mat_positive);

    //Register click-function
    rect_positive.interaction = {
        "mouseclick": this.collection_.handleClick.bind(this.collection_),
    };


    /**
     * NEGATIVE (red) Bar
     */
    var mat_negative =
            new THREE.MeshBasicMaterial(
                    {
                        color: config.color_neg,
                        transparent: true,
                        side: THREE.DoubleSide
                    });

    var geometry_negative = new THREE.PlaneBufferGeometry(neg_width, height);
    var rect_negative = new THREE.Mesh(geometry_negative, mat_negative);

    //Register click-function
    rect_negative.interaction = {
        "mouseclick": this.collection_.handleClick.bind(this.collection_)
    };



    /**
     * LABEL
     */
    var label_options = {
        color: config.label_color,
        pos_x: 0,
        pos_y: 0 + config.y_offset + config.label_y_offset

    };

    var beauty_percent = Math.round(this.percent_);
    var label = new GLVIS.Text(beauty_percent + " %", label_options, null, null, null, null, this.collection_);
    this.label_ = label;

    var meshcontainer = this.collection_.getMeshContainerNode();
    meshcontainer.add(rect_positive);
    meshcontainer.add(rect_negative);

    this.webgl_objects_.bar_pos = rect_positive;
    this.webgl_objects_.bar_neg = rect_negative;

};

GLVIS.DirectCompareBar.prototype.render = function () {

    if (!this.dirty_)
        return;

    var config = GLVIS.config.collection.compare.directcompare.bar;

    var total_width = config.width;
    var pos_width = total_width * this.percent_ * 0.01;
    var neg_width = total_width - pos_width;

    /**
     * Remember that the center of the mesh is used for positioning!
     */
    var pos = {x: 0, y: 0};
    var pos_x_positive = pos.x - total_width / 2 + (pos_width / 2);
    var pos_x_negative = pos_x_positive + pos_width / 2 + neg_width / 2;

    this.webgl_objects_.bar_pos.position.set(
            pos_x_positive,
            pos.y + config.y_offset,
            config.z_value
            );

    this.webgl_objects_.bar_neg.position.set(
            pos_x_negative,
            pos.y + config.y_offset,
            config.z_value
            );

    this.label_.render();
    this.setIsDirty(false);
};

GLVIS.DirectCompareBar.prototype.delete = function () {

    var three_scene = GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene();

    this.collection_.getMeshContainerNode().remove(this.webgl_objects_.bar_pos);
    this.collection_.getMeshContainerNode().remove(this.webgl_objects_.bar_neg);

    this.label_.delete();
    delete this.label_;

    delete this.webgl_objects_.bar_pos;
    delete this.webgl_objects_.bar_neg;
};


GLVIS.DirectCompareBar.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.DirectCompareBar.prototype.getIsDirty = function () {
    return this.dirty_;
};