var GLVIS = GLVIS || {};


/**
 * Repesenting data of a collection through a sunburst diagram.
 * It's built from several rings inside the recommendations. These rings hold
 * segments, that are represented by @see{GLVIS.RingSegment} objects.
 * @param {type} collection
 * @returns {undefined}
 */
GLVIS.RingRepresentation = function (collection) {
    this.collection_ = collection;
    this.dirty_ = true;
    this.ring_segments_ = [];

    this.max_level = null;

    this.tree_ = null;

    this.buildTree_();


    this.initAndRegisterGlObj();


    GLVIS.RingRepresentation.activeRepresentations.push(this);
};


GLVIS.RingRepresentation.prototype.buildTree_ = function () {

    GLVIS.Debugger.debug("RingRepresentation",
            "Building data-tree for Ring representation", 3);
    this.tree_ = new GLVIS.RingTree(this.collection_.getRecommendations());
};


GLVIS.RingRepresentation.prototype.initAndRegisterGlObj = function () {

    GLVIS.Debugger.debug("RingRepresentation",
            "Initializing Ring-Webgl-Objects", 4);

    if (!this.tree_)
        throw("Tree not initialized");

    var ring_structure = this.tree_.getRingStructure();

    GLVIS.Debugger.debug("RingRepresentation",
            ["Ring Structure", ring_structure], 4);


    for (var ring_count = 0; ring_count < ring_structure.length; ring_count++) {
        var curr_ring_data = ring_structure[ring_count];

        for (var seg_count = 0; seg_count < curr_ring_data.length; seg_count++) {

            var curr_ring_data_elm = curr_ring_data[seg_count];

            var color = parseInt(Math.random() * 0xFFFFFF);

            var seg_start = curr_ring_data_elm.position * 100;

            var seg_end = 100;
            if (seg_count + 1 !== curr_ring_data.length)
                seg_end = curr_ring_data[seg_count + 1].position * 100;

            var key = curr_ring_data_elm.my_id;
            var val = curr_ring_data_elm.my_val;
            this.ring_segments_.push(new GLVIS.RingSegment(this, ring_count, seg_start, seg_end, color, key, val, curr_ring_data_elm.recs));
        }
    }

    //Needed for finding the last ring
    this.max_level = ring_structure.length - 1;
};


/**
 * Called by collection. Only performs if dirty flag is true
 * @returns {undefined}
 */
GLVIS.RingRepresentation.prototype.render = function () {
    if (!this.dirty_)
        return;

    GLVIS.Debugger.debug("RingRepresentation",
            "Rendering RINGREPRESENTATION " + this.collection_.getId(),
            5);

    for (var i = 0; i < this.ring_segments_.length; i++) {
        this.ring_segments_[i].render();
    }

    this.dirty_ = false;
};


GLVIS.RingRepresentation.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
    this.collection_.setIsDirty(true);
};

/**
 * Delete all webgl-objects
 */
GLVIS.RingRepresentation.prototype.delete = function () {

    for (var i = 0; i < this.ring_segments_.length; i++) {
        this.ring_segments_[i].delete();
    }

    var index_to_delete = _.indexOf(GLVIS.RingRepresentation.activeRepresentations, this);
    GLVIS.RingRepresentation.activeRepresentations = GLVIS.RingRepresentation.activeRepresentations.splice(index_to_delete, 1);
};

/**
 * 
 * @returns {GLVIS.RingTree}
 */
GLVIS.RingRepresentation.prototype.getTree = function () {
    return this.tree_;
};

/**
 * @returns {GLVIS.Collection}
 */
GLVIS.RingRepresentation.prototype.getCollection = function () {
    return this.collection_;
};

/**
 * 
 * @returns {Array}
 */
GLVIS.RingRepresentation.prototype.getRingSegments = function () {
    return this.ring_segments_;
};


GLVIS.RingRepresentation.activeRepresentations = [];