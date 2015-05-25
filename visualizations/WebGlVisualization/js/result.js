

var GLVIS = GLVIS || {};


GLVIS.Result = function (eexcess_data) {


    /**
     * Internal increment id
     */
    this.id_ = GLVIS.Result.getNewId();

    /**
     * Collection that has this result
     * @type{GLVIS.Collection} 
     */
    this.collection_ = null;

    /**
     * Data like urls, timestamp etc.
     */
    this.eexcess_data_ = eexcess_data;

    /**
     * True if result changed and needs to be re-rendered
     */
    this.dirty_ = true;

    /**
     * Everything related to visualization
     */
    this.vis_data_ = {
        status: GLVIS.Result.STATUSFLAGS.NORMAL,
        relative_position: {
            x: 0,
            y: 0
        },
        radius: GLVIS.config.collection.result.radius,
        color: GLVIS.config.collection.result.color,
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


    if (GLVIS.config.debug)
        console.log("Result with id " + this.id_ + " created!");

};



/**
 * Creating a common-node for representing the result
 * @returns {undefined}
 */
GLVIS.Result.prototype.initGlNode = function () {

    var gl_node = new GLVIS.ResultCommonNode(this);
    this.vis_data_.gl_objects.push(gl_node);

    var gl_connection = new GLVIS.ConnectionCollectionResult(this);
    this.vis_data_.gl_objects.push(gl_connection);
};



GLVIS.Result.prototype.render = function () {

    if (!this.dirty_)
        return;

    if (GLVIS.config.debug)
        console.log("Result with id " + this.id_ + " rendered!");

    //Render all Gl-Objectss
    for (var key in this.vis_data_.gl_objects) {
        this.vis_data_.gl_objects[key].render();
    }

    this.dirty_ = false;
};





/**
 * Setting the collection that the result belongs to
 * @param {GLVIS.Collection} collection Collection;
 */
GLVIS.Result.prototype.setCollection = function (collection) {
    this.collection_ = collection;
};


/**
 * Called by interactionhandler. Function registered in mesh-objects
 * @returns {undefined}
 */
GLVIS.Result.prototype.handleClick = function () {
    /** @type {GLVIS.Result} **/
    var that = this.result;

    if (that.getStatus() === GLVIS.Result.STATUSFLAGS.HIDDEN)
        return;
    console.log("RESULT " + that.getId() + " clicked");


    GLVIS.Scene.getCurrentScene().getRecDashboardHandler().onResultClick(that);
};




/**
 * Return parent-collection
 * @returns {GLVIS.Collection}
 */
GLVIS.Result.prototype.getCollection = function () {
    return this.collection_;
};

GLVIS.Result.prototype.getStatus = function () {
    return this.vis_data_.status;
};

/**
 * Set the status of the collection.
 * See @see{GLVIS.Collection.STATUSFLAGS}
 * @param {type} status
 * @returns {undefined}
 */
GLVIS.Result.prototype.setStatus = function (status) {

    if (status === this.vis_data_.status)
        return;

    this.dirty_ = true;
    this.vis_data_.status = status;

    //Status change also means change of visual representation
    this.setMyGlObjectsDirty_();

};


GLVIS.Result.prototype.setMyGlObjectsDirty_ = function () {
    for (var key in this.vis_data_.gl_objects) {
        this.vis_data_.gl_objects[key].setIsDirty(true);
    }

    //Collection needs rendering too to reach result
    this.collection_.setIsDirty(true);
};


/**
 * Get Relative position to the collection
 * @returns {GLVIS.Result.prototype.getPosition.pos}
 */
GLVIS.Result.prototype.getRelativePosition = function () {
    return this.vis_data_.relative_position;
};


/**
 * Get Absolute position
 * @returns {GLVIS.Result.prototype.getPosition.pos}
 */
GLVIS.Result.prototype.getPosition = function () {
    var coll_pos = this.getCollection().getPosition();

    var pos = {
        x: this.vis_data_.relative_position.x + coll_pos.x,
        y: this.vis_data_.relative_position.y + coll_pos.y
    };

    return pos;
};


GLVIS.Result.prototype.setRelativePosition = function (x, y) {

    this.vis_data_.relative_position.x = x;
    this.vis_data_.relative_position.y = y;

    //Force redraw of node
    this.dirty_ = true;
    this.setMyGlObjectsDirty_();
};


GLVIS.Result.prototype.setRadius = function (radius) {
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
GLVIS.Result.prototype.setColor = function (color) {
    if (this.vis_data_.color === color)
        return;

    this.vis_data_.color = color;
    this.dirty_ = true;
    this.setMyGlObjectsDirty_();
};

/**
 * @param {float} opacity 0 - Transparent, 1 - Full visible
 */
GLVIS.Result.prototype.setOpacity = function (opacity) {
    if (this.vis_data_.opacity === opacity)
        return;    
    
    this.vis_data_.opacity = opacity;
    this.dirty_ = true;
    this.setMyGlObjectsDirty_();
};


GLVIS.Result.prototype.getRadius = function () {
    return this.vis_data_.radius;
};

GLVIS.Result.prototype.getColor = function () {
    return this.vis_data_.color;
};

GLVIS.Result.prototype.getOpacity = function () {
    return this.vis_data_.opacity;
};

GLVIS.Result.prototype.getId = function () {
    return this.id_;
};



/******************
 * 
 * STATIC FUNCTIONS
 * 
 ******************/


GLVIS.Result.current_id = 0;
GLVIS.Result.getNewId = function () {
    var id = this.current_id;
    this.current_id++;
    return id;
};


GLVIS.Result.STATUSFLAGS = {
    NORMAL: 0x000,
    HIDDEN: 0x001,
    SELECTED: 0x002
};