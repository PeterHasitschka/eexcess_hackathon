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

    this.tree_ = null;

    this.buildTree_();


    this.initAndRegisterGlObj();
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
            var color = parseInt(Math.random() * 0xFFFFFF);

            var seg_start = seg_count * (100 / curr_ring_data.length);
            var seg_end = seg_start + (100 / curr_ring_data.length);

            var key = curr_ring_data[seg_count].my_id;
            var val = curr_ring_data[seg_count].my_val;
            this.ring_segments_.push(new GLVIS.RingSegment(this, ring_count, seg_start, seg_end, color, key, val));
        }
    }
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
 * Returning the position object (holding x and y) of the corresponding collection
 * @returns {GLVIS.Collection.position_}
 */
GLVIS.RingRepresentation.prototype.getPosition = function () {
    return this.collection_.getPosition();
};

/**
 * Delete all webgl-objects
 */
GLVIS.RingRepresentation.prototype.delete = function(){
  
   for (var i=0; i < this.ring_segments_.length; i++) {
       this.ring_segments_[i].delete();
   }
    
};