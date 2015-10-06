var GLVIS = GLVIS || {};

/**
 * This position handler sets all collections on a circular path next to their parents.
 * This means that only one child per collections is supported.
 * @returns {undefined}
 */
GLVIS.CollectionPosCircular = function () {

    /** @type {GLVIS.Scene} **/
    this.scene_ = GLVIS.Scene.getCurrentScene();

    this.is_onefocused_ = false;
    this.coll_to_focus_ = null;

};

/**
 * Calculate sorted parent-mapping
 * @param {array[GLVIS.Collection]} collections
 * @returns {array}
 */
GLVIS.CollectionPosCircular.prototype.getParentMapping_ = function (collections) {
    //Store parent-id and key in an array to sort it
    var parent_mapping = [];
    for (var coll_key = 0; coll_key < collections.length; coll_key++) {

        /** @type{GLVIS.Collection} **/
        var current_collection = collections[coll_key];

        var coll_id = current_collection.getId();
        var coll_parent_id = current_collection.getParentId();

        parent_mapping.push([coll_key, coll_parent_id]);
    }

    //Sort array
    parent_mapping.sort(function (a, b) {
        if (a[1] === null)
            return b;

        return b[1] - a[1];
    });

    return parent_mapping;
};

/**
 * Sets the positions of each collections
 */
GLVIS.CollectionPosCircular.prototype.calculatePositions = function () {

    GLVIS.Debugger.debug("CollectionPosCircular",
            "COLLECTION POS HANDLER: Recalculating positions",
            5);


    var coll_to_focus = this.getCollToFocus();
    var collections = this.scene_.getCollections();

    if (!collections.length)
        return;

    var parent_mapping = this.getParentMapping_(collections);


    var num_cols = collections.length;
    var center_id = num_cols - 1;


    var sphereMaterial =
            new THREE.MeshBasicMaterial(
                    {
                        color: 0x00FF00,
                        transparent: false,
                        side: THREE.DoubleSide
                    });

    var mesh = new THREE.SphereGeometry(30, 20, 20);
    var sphere = new THREE.Mesh(
            mesh,
            sphereMaterial);

    sphere.position.set(0,0,-GLVIS.config.scene.circle_radius);
    
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene().add(sphere);



    for (var coll_count = 0; coll_count < parent_mapping.length; coll_count++) {
        var collection_key = parent_mapping[coll_count][0];

        /** @type{GLVIS.Collection} **/
        var current_collection = collections[collection_key];

        var index = coll_count - center_id;
        var pos = this.getPosAndRot(index, collections.length);

        current_collection.setPosition(pos.x, null, pos.z);
        current_collection.setRotation(pos.degree);
    }
};

/**
 * 
 * @param {integer} index Signed Int. 0 is center -1 is next left 1 is next right etc...
 * @param {integer} numindizies Maximum number of collections to set pos
 * @returns {array}
 */
GLVIS.CollectionPosCircular.prototype.getPosAndRot = function (index, numindizies) {

    //Let one free to see where it ends
    //numindizies += 1;



    var rad_step = (Math.PI * 2) / (numindizies);

    var curr_rad = index * rad_step + Math.PI / 2;

    var radius = GLVIS.config.scene.circle_radius;
    var pos = GLVIS.Tools.getPosFromRad(curr_rad, radius);

    var degree = (curr_rad - Math.PI / 2) * 180 / Math.PI * -1;
    return {x: pos.x, z: pos.y - radius, degree: degree};
};

/**
 * 
 * @param {boolean} value True if a focus representation should be performed
 * @returns {undefined}
 */
GLVIS.CollectionPosCircular.prototype.setIsOneFocused = function (value) {
    this.is_onefocused_ = value;
};

/**
 * @returns {Boolean} True if onefocus flag is set
 */
GLVIS.CollectionPosCircular.prototype.getIsOneFocused = function () {
    return this.is_onefocused_;
};

/**
 * Set Collection that gets focused after rendering the collections
 * @param {GLVIS.Collection} coll
 */
GLVIS.CollectionPosCircular.prototype.setCollToFocus = function (coll) {
    this.coll_to_focus_ = coll;
};

/**
 * Get Collection that is set to be focused after rendering the collections
 * @returns {GLVIS.Collection}
 */
GLVIS.CollectionPosCircular.prototype.getCollToFocus = function () {
    return this.coll_to_focus_;
};
