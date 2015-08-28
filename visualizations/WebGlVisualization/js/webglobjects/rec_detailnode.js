
GLVIS = GLVIS || {};


/**
 * Representing a detailed recommendation of a Collection in WebGl
 * @param {GLVIS.Recommendation} recommendation recommendation that node represents
 * @param {THREE.Object3D} mesh-parent
 */
GLVIS.RecommendationDetailNode = function (recommendation, mesh_parent) {

    this.dirty_ = true;
    this.recommendation_ = recommendation;

    this.webgl_objects_ = {
        circle_outer: null,
        circle_inner: null
    };

    this.mesh_parent_ = mesh_parent;

    //Needed due to relative scaling.
    this.init_radius_ = this.recommendation_.getRadius();

    this.initAndRegisterGlObj(mesh_parent);
};

GLVIS.RecommendationDetailNode.prototype.initAndRegisterGlObj = function (mesh_parent) {

    var config = GLVIS.config.collection.recommendation.detail_node;

    var circle_outer_material =
            new THREE.MeshBasicMaterial(
                    {
                        color: this.recommendation_.getColor(),
                        transparent: true,
                        side: THREE.DoubleSide
                    });

    var circle_outer = new THREE.Mesh(
            new THREE.CircleGeometry(
                    this.init_radius_,
                    config.circle.segments
                    ),
            circle_outer_material);


    //Register click-function
    circle_outer.interaction = {
        "mouseclick": this.recommendation_.handleClick.bind(this.recommendation_)
    };


    mesh_parent.add(circle_outer);

    this.webgl_objects_.circle_outer = circle_outer;


    var eexcess_data = this.recommendation_.getEexcessData();
    if (eexcess_data) {
        var result = eexcess_data.result;
        var preview_image = result.previewImage;

        //DUMMY FOR EVERYONE!
        if (!preview_image)
            preview_image = "/visualizations/WebGlVisualization/media/testtexture.jpg";

        if (preview_image) {

            /**
             * Create inner circle with image texture
             */
            var circle_inner_material =
                    new THREE.MeshBasicMaterial(
                            {
                                color: 0XFF0000,
                                transparent: true,
                                side: THREE.DoubleSide
                            });
            var circle_inner = new THREE.Mesh(
                    new THREE.CircleGeometry(
                            this.init_radius_ - config.gap_inner_circle,
                            config.circle.segments
                            ),
                    circle_inner_material);


            mesh_parent.add(circle_inner);
            this.webgl_objects_.circle_inner = circle_inner;


            GLVIS.Debugger.debug("RecommendationDetailNode", "Preview image exists... start loading", 5);

            var that = this;
            THREE.ImageUtils.loadTexture(preview_image, {}, function (texture) {

                GLVIS.Debugger.debug("RecommendationDetailNode", "Preview loaded. Creating texture", 5);
                texture.minFilter = THREE.LinearFilter;
                that.webgl_objects_.circle_inner.material = new THREE.MeshBasicMaterial({
                    map: texture,
                    side: THREE.DoubleSide
                });
                texture.flipY = false;
                texture.needsUpdate = true;

                that.setIsDirty(true);
                that.recommendation_.setIsDirty(true);
            });
        }
    }
};

GLVIS.RecommendationDetailNode.prototype.render = function () {

    if (!this.dirty_)
        return;

    GLVIS.Debugger.debug(
            "RecommendationDetailNode",
            "Rendering RECOMMENDATION DETAIL-NODE  for recommendation " + this.recommendation_.getId(),
            5);

    var abs_pos = this.recommendation_.getPosition();

    var z_pos = GLVIS.config.collection.recommendation.detail_node.z_value;
    this.webgl_objects_.circle_outer.position.set(
            abs_pos.x,
            abs_pos.y,
            abs_pos.z
            );

    var curr_radius = this.recommendation_.getRadius();
    var scale_factor = curr_radius / this.init_radius_;

    this.webgl_objects_.circle_outer.scale.set(scale_factor, scale_factor, scale_factor);
    this.webgl_objects_.circle_outer.material.opacity = this.recommendation_.getOpacity();
    this.webgl_objects_.circle_outer.material.color.setHex(this.recommendation_.getColor());

    if (this.webgl_objects_.circle_inner) {
        this.webgl_objects_.circle_inner.position.set(
                abs_pos.x,
                abs_pos.y,
                abs_pos.z + GLVIS.config.collection.recommendation.detail_node.z_diff_inner_circle
                );

        this.webgl_objects_.circle_inner.scale.set(scale_factor, scale_factor, scale_factor);
        this.webgl_objects_.circle_inner.material.opacity = this.recommendation_.getOpacity(true);
    }
};

GLVIS.RecommendationDetailNode.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.RecommendationDetailNode.prototype.getIsDirty = function () {
    return this.dirty_;
};

/**
 * Returns the mesh of the inner circle
 * @returns {THREE.Mesh}
 */
GLVIS.RecommendationDetailNode.prototype.getCircle = function(){
    return this.webgl_objects_.circle_outer;
},
        

/**
 * Delete all GL-Objects and remove them from the scene
 */
GLVIS.RecommendationDetailNode.prototype.delete = function () {

    //var three_scene = GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene();

    this.mesh_parent_.remove(this.webgl_objects_.circle_outer);
    if (this.webgl_objects_.circle_inner)
        this.mesh_parent_.remove(this.webgl_objects_.circle_inner);

    delete this.webgl_objects_.circle_outer;
    if (this.webgl_objects_.circle_inner)
        delete this.webgl_objects_.circle_inner;
};