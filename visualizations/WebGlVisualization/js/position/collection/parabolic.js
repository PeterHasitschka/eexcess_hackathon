var GLVIS = GLVIS || {};

/**
 * This position handler sets all collections on a hyperbolic path next to their parents.
 * This means that only one child per collections is supported.
 * @returns {undefined}
 */
GLVIS.CollectionPosParabolic = function () {

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
GLVIS.CollectionPosParabolic.prototype.getParentMapping_ = function (collections) {
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
        if (b[1] === null)
            return a;

        return a[1] - b[1];
    });

    return parent_mapping;
};

/**
 * Sets the positions of each collections
 */
GLVIS.CollectionPosParabolic.prototype.calculatePositions = function () {

    GLVIS.Debugger.debug("CollectionPosParabolic",
            "COLLECTION POS HANDLER: Recalculating positions",
            5);


    var coll_to_focus = this.getCollToFocus();
    var collections = this.scene_.getCollections();

    if (!collections.length)
        return;

    var parent_mapping = this.getParentMapping_(collections);




    var num_cols = collections.length;

    var center_id = parseInt((num_cols / 2)) - 1;

    console.log(num_cols, center_id);

    //For testing paint a parabolic curve



    var line_material = new THREE.LineBasicMaterial({color: 0xFF0000, linewidth: 5, transparent: false});
    var line_geometry = new THREE.Geometry();

    for (var i = 0; i < collections.length; i++) {

        var index = i - center_id;
        var pos = this.getXZPos(index);
        line_geometry.vertices.push(new THREE.Vector3(pos.x, 0, pos.z));
    }

    line_geometry.computeBoundingSphere();
    var line = new THREE.Line(line_geometry, line_material);
    this.scene_.getWebGlHandler().getThreeScene().add(line);





    /**
     * Focus last collection
     * @type {GLVIS.NavigationHandler} navigation_handler
     */
    var navigation_handler = GLVIS.Scene.getCurrentScene().getNavigationHandler();
    if (coll_to_focus) {
        navigation_handler.focusCollection(coll_to_focus, function () {
            GLVIS.Debugger.debug("CollectionPosParabolic",
                    "COLLECTION LINEAR POS: Ready positioning and focusing",
                    6);
        });
    }

};

/**
 * 
 * @param {integer} index Signed Int. 0 is center -1 is next left 1 is next right etc...
 * @returns {array}
 */
GLVIS.CollectionPosParabolic.prototype.getXZPos = function (index) {

    var x = index * 500;
    var z = Math.pow(index, 2) * -100;
    return {x: x, z: z};
};

/**
 * 
 * @param {boolean} value True if a focus representation should be performed
 * @returns {undefined}
 */
GLVIS.CollectionPosParabolic.prototype.setIsOneFocused = function (value) {
    this.is_onefocused_ = value;
};

/**
 * @returns {Boolean} True if onefocus flag is set
 */
GLVIS.CollectionPosParabolic.prototype.getIsOneFocused = function () {
    return this.is_onefocused_;
};

/**
 * Set Collection that gets focused after rendering the collections
 * @param {GLVIS.Collection} coll
 */
GLVIS.CollectionPosParabolic.prototype.setCollToFocus = function (coll) {
    this.coll_to_focus_ = coll;
};

/**
 * Get Collection that is set to be focused after rendering the collections
 * @returns {GLVIS.Collection}
 */
GLVIS.CollectionPosParabolic.prototype.getCollToFocus = function () {
    return this.coll_to_focus_;
};
