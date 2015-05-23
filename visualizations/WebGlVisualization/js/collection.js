

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
            x: (0.5 - Math.random()) * 100,
            y: (0.5 - Math.random()) * 100
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

    jQuery('#webgl_info_title').html('Query/Collection #' + this.getId());

    var info_content_container = jQuery('#webgl_info_content');
    info_content_container.html("");
    info_content_container.append('<p>Name: ' + this.graph_name_ + "</p>");
    info_content_container.append('<p>Results: ' + this.getResults().length + "</p>");
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

GLVIS.Collection.prototype.getResults = function () {
    return this.results_;
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

    this.dirty_ = true;
    this.vis_data_.status = status;

    //Status change also means change of visual representation
    this.setMyGlObjectsDirty_();

};


GLVIS.Collection.prototype.getStatus = function () {
    return this.vis_data_.status;
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