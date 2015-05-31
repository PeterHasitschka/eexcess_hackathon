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
    this.initAndRegisterGlObj();
};


GLVIS.RingRepresentation.prototype.initAndRegisterGlObj = function () {

    for (var l_count = 0; l_count < 3; l_count++) {
        var num_segs = parseInt(Math.random() * 10);
        for (var seg_count = 0; seg_count < num_segs; seg_count++) {

            var color = parseInt(Math.random() * 0xFFFFFF);

            var seg_start = seg_count * (100 / num_segs);
            var seg_end = seg_start + (100 / num_segs);
            
            this.ring_segments_.push(new GLVIS.RingSegment(this,l_count, seg_start,seg_end, color));
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
};

/**
 * Returning the position object (holding x and y) of the corresponding collection
 * @returns {GLVIS.Collection.position_}
 */
GLVIS.RingRepresentation.prototype.getPosition = function () {
    return this.collection_.getPosition();
};