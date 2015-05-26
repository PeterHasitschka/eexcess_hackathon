

var GLVIS = GLVIS || {};

/**
 * 
 * Object representing and visualizing a search-query from the database
 * or a saved collection in the rec-dashboard* 
 * 
 * @param {type} eexcess_data @TODO Define data structure
 */
GLVIS.Collection = function (eexcess_data) {

    /**
     * Internal increment id
     */
    this.id_ = GLVIS.Collection.getNewId();

    /**
     * @type {GLVIS.Collection.id_}
     */
    this.parent_id_ = null;

    /**
     * Data like search-query, timestamp
     */
    this.eexcess_data_ = eexcess_data;

    /**
     * True if collection changed and needs to be re-rendered
     */
    this.dirty_ = true;

    /**
     * Everything related to visualization
     */
    this.vis_data_ = {
        status: GLVIS.Collection.STATUSFLAGS.NORMAL,
        //Position is stuff that belongs to the collection and not in the node.
        //Because several visual repr. should be able to use it
        position: {
            x: 0,
            y: 0
        },
        gl_objects: []
    };

    /**
     * Connections to other objects (e.g parent-collection)
     */
    this.connections_ = {
        to_collection: []
    };

    /**
     * Holding all results from the query / collection
     */
    this.results_ = [];

    /**
     * Handles the positions of the results
     * @type{GLVIS.ResultPosDistributed} 
     */
    this.result_position_handler_ = new GLVIS.ResultPosDistributed(this);


    this.initGlNode();


    if (GLVIS.config.debug)
        console.log("Collection with id " + this.id_ + " created!");
};



/**
 * 
 * @param {GLVIS.Result} result Result object to add
 */
GLVIS.Collection.prototype.addResult = function (result) {
    result.setCollection(this);
    this.results_.push(result);

    this.result_position_handler_.calculatePositions();

};



/**
 * Creating a node in the center of the collection
 * @returns {undefined}
 */
GLVIS.Collection.prototype.initGlNode = function () {

    var gl_node = new GLVIS.CollectionCenterNode(this);
    this.vis_data_.gl_objects.push(gl_node);
};



GLVIS.Collection.prototype.render = function () {

    if (!this.dirty_)
        return;

    if (GLVIS.config.debug)
        console.log("Collection with id " + this.id_ + " rendered!");

    //Render all Gl-Objectss
    for (var key in this.vis_data_.gl_objects) {
        this.vis_data_.gl_objects[key].render();
    }

    //Render all results
    for (var i = 0; i < this.results_.length; i++) {
        /** @type {GLVIS.Result} **/
        var curr_res = this.results_[i];
        curr_res.render();
    }

    this.dirty_ = false;
};









/**
 * Called by interactionhandler. Function registered in mesh-objects
 * @returns {undefined}
 */
GLVIS.Collection.prototype.handleClick = function () {
    /** @type {GLVIS.Collection} **/
    var that = this.collection;

    if (that.getStatus() === GLVIS.Collection.STATUSFLAGS.HIDDEN)
        return;

    that.selectAndFocus();
};


GLVIS.Collection.prototype.selectAndFocus = function () {

    this.setStatus(GLVIS.Collection.STATUSFLAGS.SELECTED);


    GLVIS.Scene.getCurrentScene().getNavigationHandler().focusCollection(this, function () {

        console.log("FOCUSGRAPH: Callback finish!");

    });


    GLVIS.Scene.getCurrentScene().getRecDashboardHandler().onCollectionClick(this);
};


GLVIS.Collection.prototype.setMyGlObjectsDirty_ = function () {
    for (var key in this.vis_data_.gl_objects) {
        this.vis_data_.gl_objects[key].setIsDirty(true);
    }
};








GLVIS.Collection.prototype.getId = function () {
    return this.id_;
};

GLVIS.Collection.prototype.getPosition = function () {
    return this.vis_data_.position;
};

/**
 * Set the coordinates of the collection.
 * If one parameter is null or undefined it gets ignored
 * @param {float} x
 * @param {float} y
 */
GLVIS.Collection.prototype.setPosition = function (x, y) {
    if (x !== undefined && x !== null)
        this.vis_data_.position.x = x;

    if (y !== undefined && y !== null)
        this.vis_data_.position.y = y;
};

GLVIS.Collection.prototype.getResults = function () {
    return this.results_;
};


GLVIS.Collection.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

/**
 * Set the status of the collection.
 * See @see{GLVIS.Collection.STATUSFLAGS}
 * @param {type} status
 * @returns {undefined}
 */
GLVIS.Collection.prototype.setStatus = function (status) {

    if (status === this.vis_data_.status)
        return;

    this.vis_data_.status = status;


    this.dirty_ = true;
    //Status change also means change of visual representation
    this.setMyGlObjectsDirty_();

};

/**
 * Returning the current status
 * Available flags: @see{GLVIS.Collection.STATUSFLAG}
 * @returns {integer}
 */
GLVIS.Collection.prototype.getStatus = function () {
    return this.vis_data_.status;
};

/**
 * Setting the id of the parent-collection
 * @param {integer} parent_id
 */
GLVIS.Collection.prototype.setParentId = function (parent_id) {
    this.parent_id_ = parent_id;
};

/**
 * Resets the connection to the parent-collection. Necessary after initializing
 * all nodes and on possible change of collection-network
 * @returns {undefined}
 */
GLVIS.Collection.prototype.updateParentConnection = function () {
    //Set Parent Connection
    if (this.parent_id_ !== null) {
        var parent_collection = GLVIS.Scene.getCurrentScene().getCollection(this.parent_id_);
       
        if (parent_collection)
        {
            console.log("parent collection found. Creating connection");
            var parent_connection = new GLVIS.ConnectionCollectionCollection(parent_collection, this);
            this.vis_data_.gl_objects.push(parent_connection);
        }
        else
            throw("PARENT COLLECTION WITH ID " + this.parent_id_ + " NOT FOUND");
    }
};

/**
 * Returning the parent-collection's id
 * @returns {integer}
 */
GLVIS.Collection.prototype.getParentId = function () {
    return this.parent_id_;
};


/******************
 * 
 * STATIC FUNCTIONS
 * 
 ******************/


GLVIS.Collection.current_id = 0;
GLVIS.Collection.getNewId = function () {
    var id = this.current_id;
    this.current_id++;
    return id;
};


GLVIS.Collection.STATUSFLAGS = {
    NORMAL: 0x000,
    HIDDEN: 0x001,
    SELECTED: 0x002
};