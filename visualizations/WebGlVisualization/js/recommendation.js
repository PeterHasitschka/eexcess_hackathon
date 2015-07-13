

var GLVIS = GLVIS || {};

/**
 * Holding information and GL-Representations of one search Result / One Recommendation
 * @param {object} eexcess_data Data from the database
 * @returns {undefined}
 */
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
        to_collection: null,
        splines: []
    };

    this.initGlNode();

    GLVIS.Debugger.debug("Recommendation",
            "Recommendation with id " + this.id_ + " created!",
            6);
};


/**
 * Add a spline to the recommendation
 * @param {GLVIS.ConnectionRecRecSpline} spline
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.registerRecSpline = function (spline) {
    this.connections_.splines.push(spline);
};

/**
 * Remove a registered spline from the recommendation
 * @param {GLVIS.ConnectionRecRecSpline} spline
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.unregisterRecSpline = function (spline) {

    var index = _.indexOf(this.connections_.splines, spline);
    if (index >= 0) {
        this.connections_.splines = this.connections_.splines.splice(index, 1);
    }
};

GLVIS.Recommendation.prototype.deleteAllRecSplines = function () {

    _.each(this.connections_.splines, function (spline) {
        if (!spline)
            return;
        spline.delete();
        delete spline;
    });

    this.connections_.splines = [];
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

/**
 * Render the collection and its subnodes
 */
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
            ["RECOMMENDATION " + that.getId() + " clicked", that],
            3);

    //Don't do focus etc. if clicked before
    if (GLVIS.Recommendation.current_selected_rec && GLVIS.Recommendation.current_selected_rec === that)
        return;

    that.focusAndZoom();
    GLVIS.Scene.getCurrentScene().getRecDashboardHandler().onRecommendationClick(that);
};

/**
 * Swap the (no detailed) common node object with a Detail-Node.
 * Afterwards zoom and move in to the recommendation
 */
GLVIS.Recommendation.prototype.focusAndZoom = function () {

    //Replace common node with detail node
    GLVIS.Debugger.debug("Recommendation", "Setting node type to DETAILED and zoom in afterwards", 5);
    this.setNodeType(GLVIS.Recommendation.NODETYPES.DETAILED);


    var abs_pos = this.getPosition();
    var nav_handler = GLVIS.Scene.getCurrentScene().getNavigationHandler();
    var move_config = GLVIS.config.collection.recommendation.focus_animation.move;
    var move_setter = nav_handler.moveCamera;
    var move_getter_x = nav_handler.getPosX;
    var move_setter_param_x = 0;
    var move_getter_y = nav_handler.getPosY;
    var move_setter_param_y = 1;
    var move_speed = move_config.speed;
    var move_pow = move_config.pow;
    var move_threshold = move_config.threshold;

    //X
    GLVIS.Scene.getCurrentScene().getAnimation().register(
            nav_handler.animation_.move_id_x,
            abs_pos.x,
            null,
            move_getter_x,
            move_setter,
            move_setter_param_x,
            move_speed,
            move_pow,
            move_threshold,
            function () {
            }
    );

    //Y
    GLVIS.Scene.getCurrentScene().getAnimation().register(
            nav_handler.animation_.move_id_y,
            abs_pos.y,
            null,
            move_getter_y,
            move_setter,
            move_setter_param_y,
            move_speed,
            move_pow,
            move_threshold,
            function () {
            }
    );


    var zoom_config = GLVIS.config.collection.recommendation.focus_animation.zoom;
    var zoom_threshold = zoom_config.threshold;
    var zoom_pow = zoom_config.pow;
    var zoom_speed = zoom_config.speed;
    var zoom_goal = zoom_config.zoom_val;
    var zoom_getter = nav_handler.getZoomFactor;
    var zoom_setter = nav_handler.zoomDelta;

    GLVIS.Scene.getCurrentScene().getAnimation().register(
            nav_handler.animation_.zoom_id,
            zoom_goal,
            null,
            zoom_getter,
            zoom_setter,
            0,
            zoom_speed,
            zoom_pow,
            zoom_threshold,
            function () {
                console.log("READY ZOOM TO REC");
            }
    );

    if (GLVIS.Recommendation.current_selected_rec) {
        GLVIS.Debugger.debug("Recommendation", "Setting node type to COMMON of FORMER FOCUSED", 5);
        GLVIS.Recommendation.current_selected_rec.setNodeType(GLVIS.Recommendation.NODETYPES.COMMON);
    }
    GLVIS.Recommendation.current_selected_rec = this;
};

/**
 * De-Focus the Recommendation node.
 * Swap the detail node to a common node and move and zoom to the collection
 */
GLVIS.Recommendation.prototype.defocusAndZoomOut = function () {

    //Replace detail node with common node
    GLVIS.Debugger.debug("Recommendation", "Setting node type to COMMON and zoom out afterwards", 5);
    this.setNodeType(GLVIS.Recommendation.NODETYPES.COMMON);

    var nav_handler = GLVIS.Scene.getCurrentScene().getNavigationHandler();

    var config = GLVIS.config.collection.recommendation.defocus_animation;
    var zoom_out_threshold = config.threshold;
    var zoom_out_pow = config.pow;
    var zoom_out_speed = config.speed;
    var zoom_goal = GLVIS.config.navigation.zoom.animated.zoom_in;
    var zoom_out_getter = nav_handler.getZoomFactor;
    var zoom_out_setter = nav_handler.zoomDelta;

    var that = this;
    GLVIS.Scene.getCurrentScene().getAnimation().register(
            nav_handler.animation_.zoom_id,
            zoom_goal,
            null,
            zoom_out_getter,
            zoom_out_setter,
            0,
            zoom_out_speed,
            zoom_out_pow,
            zoom_out_threshold,
            function () {
                //that.getCollection().selectAndFocus();
            }
    );

    GLVIS.Recommendation.current_selected_rec = null;
};

/**
 * Swap the node type (e.g. common node or detailed node).
 * Each other registered type of node will be deleted from the gl list and will
 * be destroyed.
 * @param {type} Instance of @see{GLVIS.Recommendation.NODETYPES}
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.setNodeType = function (type) {

    var rec_common_node_exists = false;

    GLVIS.Debugger.debug("Recommendation", "Creating new node type.", 5);

    //Check if that kind of node already exists
    for (var i = 0; i < this.vis_data_.gl_objects.length; i++) {
        if (this.vis_data_.gl_objects[i] instanceof type) {
            rec_common_node_exists = true;
            GLVIS.Debugger.debug("Recommendation", "Node of type " + type + " exists... skip creating it.", 6);
        }
    }

    if (rec_common_node_exists)
        return;

    //Go through all other nodetypes and delete them from the gl objects
    //to make place for the wanted type
    for (var key in GLVIS.Recommendation.NODETYPES) {
        var curr_node_type = GLVIS.Recommendation.NODETYPES[key];

        //Delete this kind of node from the gl list
        for (var i = 0; i < this.vis_data_.gl_objects.length; i++) {
            if (this.vis_data_.gl_objects[i] instanceof curr_node_type) {
                this.vis_data_.gl_objects[i].delete();
                this.vis_data_.gl_objects.splice(i, 1);
            }
        }
    }
    //Create new node type
    var gl_node = new type(this);
    this.vis_data_.gl_objects.push(gl_node);
    this.setIsDirty(true);
};

/**
 * Return parent-collection
 * @returns {GLVIS.Collection}
 */
GLVIS.Recommendation.prototype.getCollection = function () {
    return this.collection_;
};

/**
 * Getting the status of the Recommendation
 * See @see{GLVIS.Recommendation.STATUSFLAGS}
 * @returns {type}
 */
GLVIS.Recommendation.prototype.getStatus = function () {
    return this.vis_data_.status;
};

/**
 * Set the status of the Recommendation.
 * See @see{GLVIS.Recommendation.STATUSFLAGS}
 * @param {type} status
 * @returns {undefined}
 */
GLVIS.Recommendation.prototype.setStatus = function (status) {

    if (status === this.vis_data_.status)
        return;

    this.vis_data_.status = status;

    //Status change also means change of visual representation
    this.setIsDirty(true);
};

/**
 * Setting all sub-objects that hold GL Objects dirty
 */
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

/**
 * Getting the relative position of the recommendation related to the collection
 * @returns {GLVIS.Recommendation.prototype.getRelativePosition.pos}
 */
GLVIS.Recommendation.prototype.getRelativePosition = function () {

    var pos = {
        x: this.vis_data_.relative_position.x,
        y: this.vis_data_.relative_position.y
    };
    return pos;

};

/**
 * Setting the relative position of the recommendation related to the collection
 * @param {float} x
 * @param {float} y
 */
GLVIS.Recommendation.prototype.setRelativePosition = function (x, y) {

    if (x !== null && x !== undefined)
        this.vis_data_.relative_position.x = x;

    if (y !== null && y !== undefined)
        this.vis_data_.relative_position.y = y;

    //Force redraw of node
    this.setIsDirty(true);
};

/**
 * Set the position by a radians value.
 * Necessary for animation. The "that" parameter is necessary as it is used as
 * ŕegistered function in the animation without any knowlege about the object.
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
 * Necessary for animation. The "that" parameter is necessary as it is used as
 * ŕegistered function in the animation without any knowlege about the object.
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
    this.setIsDirty(true);
};

/**
 * 
 * @param {integer} color e.g. 0xFF0000
 */
GLVIS.Recommendation.prototype.setColor = function (color) {
    if (this.vis_data_.color === color)
        return;
    this.vis_data_.color = color;
    this.setIsDirty(true);
};

/**
 * @param {float} opacity 0 - Transparent, 1 - Full visible
 */
GLVIS.Recommendation.prototype.setOpacity = function (opacity) {
    if (this.vis_data_.opacity === opacity)
        return;
    this.vis_data_.opacity = opacity;
    this.setIsDirty(true);
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

GLVIS.Recommendation.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
    if (dirty) {
        this.setMyGlObjectsDirty_();
    }
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
    HIDDEN: 0x001
};

GLVIS.Recommendation.NODETYPES = {
    COMMON: GLVIS.RecommendationCommonNode,
    DETAILED: GLVIS.RecommendationDetailNode
};


GLVIS.Recommendation.current_selected_rec = null;