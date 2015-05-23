

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
 * Gives the result an initial position
 */
GLVIS.Result.prototype.initPosition = function () {

};

/**
 * Creating a common-node for representing the result
 * @returns {undefined}
 */
GLVIS.Result.prototype.initGlNode = function () {

    var gl_node = new GLVIS.ResultCommonNode(this);
    this.vis_data_.gl_objects.push(gl_node);
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
    /** @type {GLVIS.Collection} **/
    var that = this.result;

    if (that.getStatus() === GLVIS.Collection.STATUSFLAGS.HIDDEN)
        return;
    console.log("RESULT " + that.getId() + " clicked");
    //that.selectAndFocus();
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