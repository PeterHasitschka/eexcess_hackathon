

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
     * Holding all recommendations from the query / collection
     */
    this.recommendations_ = [];

    /** @type{Array} holding @see{GLVIS.Text} Objects **/
    this.labels_ = [];

    /**
     * Created freshly when needed
     * @type {GLVIS.RingRepresentation}
     */
    this.ring_representation_ = null;

    /**
     * Handles the positions of the recommendations
     * @type{GLVIS.RecommendationPosDistributed} 
     */
    this.recommendation_position_handler_ = new GLVIS.RecommendationPosDistributed(this);

    this.initGlNode();
    this.initLabels();

    GLVIS.Debugger.debug("Collection",
            "Collection with id " + this.id_ + " created!",
            5);
};



/**
 * 
 * @param {GLVIS.Recommendation} recommendation Recommendation object to add
 */
GLVIS.Collection.prototype.addRecommendation = function (recommendation) {
    recommendation.setCollection(this);
    this.recommendations_.push(recommendation);

    this.recommendation_position_handler_.calculatePositions();
};



/**
 * Creating a node in the center of the collection
 * @returns {undefined}
 */
GLVIS.Collection.prototype.initGlNode = function () {

    var gl_node = new GLVIS.CollectionCenterNode(this);
    this.vis_data_.gl_objects.push(gl_node);
};

/**
 * Initializing the collection's label
 */
GLVIS.Collection.prototype.initLabels = function () {

    var config = GLVIS.config.collection.labels;
    var init_font_size = config.init_font_size;

    var text = "Collection #" + this.getId();

    var text_element = new GLVIS.Text(text, {
        font_size: init_font_size,
        color: config.title_color,
        opacity: config.init_opacity
    });

    this.labels_.push(text_element);

    if (this.eexcess_data_) {

        for (var i = 0; i < this.eexcess_data_.query.length; i++) {

            var curr_q_data = this.eexcess_data_.query[i];

            var text = curr_q_data.text;
            var weight = curr_q_data.weight;

            var fontsize = init_font_size * Math.pow(weight, 0.5);
            fontsize = Math.min(config.max_font_size, fontsize);
            fontsize = Math.max(config.min_font_size, fontsize);

            var opacity = config.init_opacity * weight * Math.pow(weight, 0.5);

            opacity = Math.min(config.max_opacity, opacity);
            opacity = Math.max(config.min_opacity, opacity);


            var text_element = new GLVIS.Text(text, {
                font_size: fontsize,
                opacity: opacity
            });

            this.labels_.push(text_element);
        }
    }
    this.rebuildLabelPositions();
};



GLVIS.Collection.prototype.render = function () {

    if (!this.dirty_)
        return;

    GLVIS.Debugger.debug("Collection",
            "Collection with id " + this.id_ + " rendered!",
            6);

    //Render all Gl-Objectss
    for (var key = 0; key < this.vis_data_.gl_objects.length; key++) {
        this.vis_data_.gl_objects[key].render();
    }

    //Render all recommendations
    for (var i = 0; i < this.recommendations_.length; i++) {
        /** @type {GLVIS.Recommendation} **/
        var curr_rec = this.recommendations_[i];
        curr_rec.render();
    }

    //If Ring representation -> render it.
    if (this.ring_representation_)
        this.ring_representation_.render();


    //Render labels
    for (var i = 0; i < this.labels_.length; i++) {
        this.labels_[i].render();
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

    GLVIS.Debugger.debug("Collection",
            "Collection " + that.getId() + " CLICKED!",
            3);

    GLVIS.Debugger.debug("Collection",
            that,
            5);
        
    that.deleteRingRepresentation();
    that.createRingRepresentation();

    that.selectAndFocus();
};


GLVIS.Collection.prototype.selectAndFocus = function () {

    this.setStatus(GLVIS.Collection.STATUSFLAGS.SELECTED);


    GLVIS.Scene.getCurrentScene().getNavigationHandler().focusCollection(this, function () {

        GLVIS.Debugger.debug("Collection",
                "FOCUSGRAPH: Callback finish!",
                3);
    });

    GLVIS.Scene.getCurrentScene().getRecDashboardHandler().onCollectionClick(this);
};


GLVIS.Collection.prototype.setMyGlObjectsDirty_ = function () {
    for (var key = 0; key < this.vis_data_.gl_objects.length; key++) {
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
 * If changed several other sub-objects (labels) get affected
 * If one parameter is null or undefined it gets ignored
 * @param {float} x
 * @param {float} y
 */
GLVIS.Collection.prototype.setPosition = function (x, y) {
    if (x !== undefined && x !== null)
        this.vis_data_.position.x = x;

    if (y !== undefined && y !== null)
        this.vis_data_.position.y = y;

    this.rebuildLabelPositions();

    this.setIsDirty(true);
};

/**
 * After changing the absolute position of the collection, the labels that only
 * hold absolute positions too, need new x and y values.
 * @returns {undefined}
 */
GLVIS.Collection.prototype.rebuildLabelPositions = function () {

    GLVIS.Debugger.debug("Collection", "Rebuilding Text positions", 5);

    var config = GLVIS.config.collection.labels;
    var vert_dist = config.distance;

    var vert_offset = config.vertical_offset;

    var c_x = this.vis_data_.position.x;
    var c_y = this.vis_data_.position.y;
    for (var i = 0; i < this.labels_.length; i++) {

        /** @type {GLVIS.Text} **/
        var curr_label = this.labels_[i];
        curr_label.setPosition(c_x, c_y + i * vert_dist + vert_offset);
    }
};


GLVIS.Collection.prototype.getRecommendations = function () {
    return this.recommendations_;
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
            GLVIS.Debugger.debug("Collection",
                    "parent collection found. Creating connection",
                    8);

            var parent_connection = new GLVIS.ConnectionCollectionCollection(parent_collection, this);
            this.vis_data_.gl_objects.push(parent_connection);
            this.dirty_ = true;
        }
        else
            throw("PARENT COLLECTION WITH ID " + this.parent_id_ + " NOT FOUND");
    }
};

/**
 * Creating a @see{GLVIS.RingRepresentation} object.
 * It shows several data of the collection and recommendations as rings inside
 * the graph.
 */
GLVIS.Collection.prototype.createRingRepresentation = function () {
    this.ring_representation_ = new GLVIS.RingRepresentation(this);
};


GLVIS.Collection.prototype.deleteRingRepresentation = function () {
    if (this.ring_representation_)
        this.ring_representation_.delete();
    this.ring_representation_ = null;
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