

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
    this.dirty_ = false;

    /**
     * Everything related to visualization
     */
    this.vis_data_ = {
        status: GLVIS.Collection.STATUSFLAGS.NORMAL,
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
    
    
    this.initGlNode();
    
    
    if (GLVIS.config.debug)
        console.log("Collection with id " + this.id_ + " created!");
};

/**
 * Creating a node in the center of the collection
 * @returns {undefined}
 */
GLVIS.Collection.prototype.initGlNode = function(){
    
    var gl_node = new GLVIS.CollectionCenterNode(this);
    this.vis_data_.gl_objects.push(gl_node);
};



GLVIS.Collection.prototype.render = function(){
  
  if (GLVIS.config.debug)
        console.log("Collection with id " + this.id_ + " rendered!");
    
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