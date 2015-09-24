
GLVIS = GLVIS || {};


/**
 * 
 * @param {GLVIS.Collection} collection
 * @returns {undefined}
 */
GLVIS.RecommendationPosRingRepresentation = function (collection) {

    /** @type{GLVIS.Collection} **/
    this.collection_ = collection;

    this.rings_ready_ = 0;

    this.cb_ = null;
};

/**
 * Necessary if other ringrep was started before animation of this collection ready.
 */
GLVIS.RecommendationPosRingRepresentation.prototype.deleteCallback = function () {
    this.cb_ = null;
};

/**
 * Distributing the recommendations according to the ring representation.
 * @returns {undefined}
 */
GLVIS.RecommendationPosRingRepresentation.prototype.calculatePositions = function (cb) {

    var ringrep = this.collection_.getRingRepresentation();

    if (!ringrep)
        throw ("No Ring Representation found!");

    if (cb)
        this.cb_ = cb;

    var segments = ringrep.getRingSegments();

    for (var seg_count = 0; seg_count < segments.length; seg_count++) {

        var curr_seg = segments[seg_count];

        if (curr_seg.getLevel() !== ringrep.max_level)
            continue;

        var recommendations = curr_seg.getAffectedRecs();
        var num_res = recommendations.length;

        var seg_pos = curr_seg.getRelativePosition();
        var seg_degree = GLVIS.Tools.getRadFromPos(seg_pos.x, seg_pos.y);

        var seg_length_rad = curr_seg.getRadLength();
        var rad_step = seg_length_rad / recommendations.length;

        var curr_rad = seg_degree - seg_length_rad / 2 + rad_step / 2;

        for (var i = 0; i < recommendations.length; i++) {
            /** @type{GLVIS.Recommendation} **/


            var curr_rec = recommendations[i];
            //Normalization 
            while (curr_rad < 0)
                curr_rad += (Math.PI * 2);

            while (curr_rad > Math.PI * 2)
                curr_rad -= Math.PI * 2;

            var anim_config = GLVIS.config.collection.recommendation.animation;

            GLVIS.Debugger.debug("RecommendationPosRingRepresentation", "Begin moving rec " + curr_rec.getId(), 8);
            GLVIS.Scene.getCurrentScene().getAnimation().register(
                    "pos-rec" + curr_rec.getId(), //ID
                    curr_rad, //GOAL
                    curr_rec, //OBJECT (For getter and setter)
                    curr_rec.getRelativePositionRad, //GETTER
                    curr_rec.setRelativePositionByRad, //SETTER
                    0, //PARAMETER Nr.
                    anim_config.speed, //SPEED
                    anim_config.pow, //POW
                    anim_config.threshold, //THRESHOLD  
                    function () {
                        GLVIS.Debugger.debug("RecommendationPosRingRepresentation", "Finished moving rec " + curr_rec.getId(), 8);
                        if (cb)
                            this.cbRingReady_();
                    }.bind(this),
                    true
                    );
            curr_rad += rad_step;
        }
    }
};

/**
 * Callback for rec-movement.
 * Counting up how many recommendation performed their animation to finally
 * call the given callback
 */
GLVIS.RecommendationPosRingRepresentation.prototype.cbRingReady_ = function () {

    if (!this.cb_)
        return;

    this.rings_ready_++;

    if (this.rings_ready_ === this.collection_.getRecommendations().length) {
        GLVIS.Debugger.debug("RecommendationPosRingRepresentation", "All recs performed animation -> callback", 5);
        this.cb_();
    }
};

