

var GLVIS = GLVIS || {};


GLVIS.Recommendation = function (eexcess_data) {


    /**
     * Internal increment id
     */
    this.id_ = GLVIS.Recommendation.getNewId();

    /**
     * Collection that has this recommendation
     * @type{GLVIS.Collection} 
     */
    this.collection_ = null;

    /**
     * Data like urls, timestamp etc.
     */
    this.eexcess_data_ = eexcess_data;

    /**
     * True if recommendation changed and needs to be re-rendered
     */
    this.dirty_ = true;

    /**
     * Everything related to visualization
     */
    this.vis_data_ = {
        status: GLVIS.Recommendation.STATUSFLAGS.NORMAL,
        relative_position: {
            x: 0,
            y: 0
        },
        radius: GLVIS.config.collection.recommendation.radius,
        color: GLVIS.config.collection.recommendation.color,
        opacity: 1
        ,
        gl_objects: []
    };


    /**
     * Connections to other objects (e.g parent-collection)
     */
    this.connections_ = {
        to_collection: null
    };


    this.initGlNode();


    GLVIS.Debugger.debug("Recommendation",
            "Recommendation with id " + this.id_ + " created!",
            6);

};



/**
 * Creating a common-node for representing the recommendation
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.initGlNode = function () {

    var gl_node = new GLVIS.RecommendationCommonNode(this);
    this.vis_data_.gl_objects.push(gl_node);

    var gl_connection = new GLVIS.ConnectionCollectionRecommendation(this);
    this.vis_data_.gl_objects.push(gl_connection);

    this.setRelativePositionByRad(0);
};



GLVIS.Recommendation.prototype.render = function () {

    if (!this.dirty_)
        return;

    GLVIS.Debugger.debug("Recommendation",
            "Recommendation with id " + this.id_ + " rendered!",
            6);

    //Render all Gl-Objectss
    for (var key = 0; key < this.vis_data_.gl_objects.length; key++) {
        this.vis_data_.gl_objects[key].render();
    }

    this.dirty_ = false;
};





/**
 * Setting the collection that the recommendation belongs to
 * @param {GLVIS.Collection} collection Collection;
 */
GLVIS.Recommendation.prototype.setCollection = function (collection) {
    this.collection_ = collection;
};


/**
 * Called by interactionhandler. Function registered in mesh-objects
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.handleClick = function () {
    /** @type {GLVIS.Recommendation} **/
    var that = this.recommendation;

    if (that.getStatus() === GLVIS.Recommendation.STATUSFLAGS.HIDDEN)
        return;

    GLVIS.Debugger.debug("Recommendation",
            ["RECOMMENDATION " + that.getId() + " clicked", that.eexcess_data_],
            3);

    GLVIS.Scene.getCurrentScene().getRecDashboardHandler().onRecommendationClick(that);
};




/**
 * Return parent-collection
 * @returns {GLVIS.Collection}
 */
GLVIS.Recommendation.prototype.getCollection = function () {
    return this.collection_;
};

GLVIS.Recommendation.prototype.getStatus = function () {
    return this.vis_data_.status;
};

/**
 * Set the status of the collection.
 * See @see{GLVIS.Collection.STATUSFLAGS}
 * @param {type} status
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.setStatus = function (status) {

    if (status === this.vis_data_.status)
        return;

    this.dirty_ = true;
    this.vis_data_.status = status;

    //Status change also means change of visual representation
    this.setMyGlObjectsDirty_();

};


GLVIS.Recommendation.prototype.setMyGlObjectsDirty_ = function () {
    for (var key = 0; key < this.vis_data_.gl_objects.length; key++) {

        this.vis_data_.gl_objects[key].setIsDirty(true);
    }

    //Collection needs rendering too to reach recommendation
    //May be null when initializing gl objects.
    if (this.collection_)
        this.collection_.setIsDirty(true);
};


/**
 * Get Relative position to the collection
 * @returns {GLVIS.Recommendation.prototype.getPosition.pos}
 */
GLVIS.Recommendation.prototype.getRelativePosition = function () {
    return this.vis_data_.relative_position;
};


/**
 * Get Absolute position
 * @returns {GLVIS.Recommendation.prototype.getPosition.pos}
 */
GLVIS.Recommendation.prototype.getPosition = function () {
    var coll_pos = this.getCollection().getPosition();

    var pos = {
        x: this.vis_data_.relative_position.x + coll_pos.x,
        y: this.vis_data_.relative_position.y + coll_pos.y
    };

    return pos;
};


GLVIS.Recommendation.prototype.getRelativePosition = function () {

    var pos = {
        x: this.vis_data_.relative_position.x,
        y: this.vis_data_.relative_position.y
    };
    return pos;

};
GLVIS.Recommendation.prototype.setRelativePosition = function (x, y) {

    if (x !== null && x !== undefined)
        this.vis_data_.relative_position.x = x;

    if (y !== null && y !== undefined)
        this.vis_data_.relative_position.y = y;

    //Force redraw of node
    this.dirty_ = true;
    this.setMyGlObjectsDirty_();
};
/**
 * Set the position by a radians value.
 * Necessary for animation
 * @param{GLVIS.Recommendation | null} that Reference to THIS object. (Animation doesn't know me...)
 * @param {float} rad Radians
 */
GLVIS.Recommendation.prototype.setRelativePositionByRad = function (that, rad) {

    if (!that)
        that = this;

    

    var distance = GLVIS.config.collection.recommendation.init_distance;
    
    var pos = GLVIS.Tools.getPosFromRad(rad, distance);

    that.setRelativePosition(pos.x, pos.y);
};
/**
 * Get the radians of the node around the collection.
 
 * Necessary for animation
 * @param{GLVIS.Recommendation | null} that Reference to THIS object. (Animation doesn't know me...)
 * @returns {float} Radians
 */
GLVIS.Recommendation.prototype.getRelativePositionRad = function (that) {

    if (!that)
        that = this;

    var distance = GLVIS.config.collection.recommendation.init_distance;


    var pos = that.getRelativePosition();

    return GLVIS.Tools.getRadFromPos(pos.x, pos.y);
    
};
GLVIS.Recommendation.prototype.setRadius = function (radius) {
    if (this.vis_data_.radius === radius)
        return;
    this.vis_data_.radius = radius;
    this.dirty_ = true;
    this.setMyGlObjectsDirty_();
};
/**
 * 
 * @param {integer} color e.g. 0xFF0000
 */
GLVIS.Recommendation.prototype.setColor = function (color) {
    if (this.vis_data_.color === color)
        return;
    this.vis_data_.color = color;
    this.dirty_ = true;
    this.setMyGlObjectsDirty_();
};
/**
 * @param {float} opacity 0 - Transparent, 1 - Full visible
 */
GLVIS.Recommendation.prototype.setOpacity = function (opacity) {
    if (this.vis_data_.opacity === opacity)
        return;
    this.vis_data_.opacity = opacity;
    this.dirty_ = true;
    this.setMyGlObjectsDirty_();
};
GLVIS.Recommendation.prototype.getRadius = function () {
    return this.vis_data_.radius;
};
GLVIS.Recommendation.prototype.getColor = function () {
    return this.vis_data_.color;
};
GLVIS.Recommendation.prototype.getOpacity = function () {
    return this.vis_data_.opacity;
};
GLVIS.Recommendation.prototype.getId = function () {
    return this.id_;
};
GLVIS.Recommendation.prototype.getEexcessData = function () {
    return this.eexcess_data_;
};
/******************
 * 
 * STATIC FUNCTIONS
 * 
 ******************/


GLVIS.Recommendation.current_id = 0;
GLVIS.Recommendation.getNewId = function () {
    var id = this.current_id;
    this.current_id++;
    return id;
};
GLVIS.Recommendation.STATUSFLAGS = {
    NORMAL: 0x000,
    HIDDEN: 0x001,
    SELECTED: 0x002
};