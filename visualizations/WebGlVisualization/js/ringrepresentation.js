var GLVIS = GLVIS || {};



GLVIS.RingRepresentation = function (collection) {

    this.collection_ = collection;


    this.dirty_ = true;

    this.ring_segments_ = [];
    
    this.initAndRegisterGlObj();
};


GLVIS.RingRepresentation.prototype.initAndRegisterGlObj = function () {

    this.ring_segments_.push(new GLVIS.RingSegment(this));
};


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


GLVIS.RingRepresentation.prototype.getPosition = function(){
    return this.collection_.getPosition();
};