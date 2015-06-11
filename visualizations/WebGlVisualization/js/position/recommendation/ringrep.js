
GLVIS = GLVIS || {};


/**
 * 
 * @param {GLVIS.Collection} collection
 * @returns {undefined}
 */
GLVIS.RecommendationPosRingRepresentation = function (collection) {

    /** @type{GLVIS.Collection} **/
    this.collection_ = collection;
};


GLVIS.RecommendationPosRingRepresentation.prototype.calculatePositions = function () {


    var ringrep = this.collection_.getRingRepresentation();

    if (!ringrep)
        throw ("No Ring Representation found!");

    var segments = ringrep.getRingSegments();


    for (var seg_count = 0; seg_count < segments.length; seg_count++) {

        var curr_seg = segments[seg_count];

        if (curr_seg.getLevel() !== ringrep.max_level)
            continue;

        //console.log(curr_seg);
        var recommendations = curr_seg.getAffectedRecs();


        var num_res = recommendations.length;


        var seg_pos = curr_seg.getRelativePosition();
        var seg_degree = GLVIS.Tools.getRadFromPos(seg_pos.x, seg_pos.y);
        //var degree_step = (Math.PI * 2) / num_res;
        var curr_rad = seg_degree;



        for (var i = 0; i < recommendations.length; i++) {
            /** @type{GLVIS.Recommendation} **/
            // curr_rad += degree_step + Math.random() / 20;

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
                    },
                    true
                    );
        }


    }
    ;



};

