
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

    var recommendations = this.collection_.getRecommendations();


    var num_res = recommendations.length;

    var degree_step = (Math.PI * 2) / num_res;
    var curr_rad = -Math.PI / 2.0;

    for (var i = 0; i < recommendations.length; i++) {
        /** @type{GLVIS.Recommendation} **/

        curr_rad += degree_step + Math.random() / 20;


        //Normalization 
        while (curr_rad < 0)
            curr_rad += (Math.PI * 2);

        while (curr_rad > Math.PI * 2)
            curr_rad -= Math.PI * 2;

        var curr_rec = recommendations[i];
        
        GLVIS.Debugger.debug("RecommendationPosRingRepresentation", "Begin moving rec " + curr_rec.getId(), 8);
        GLVIS.Scene.getCurrentScene().getAnimation().register(
                "pos-rec" + curr_rec.getId(),
                curr_rad,
                curr_rec,
                curr_rec.getRelativePositionRad,
                curr_rec.setRelativePositionByRad,
                0,
                0.01,
                0.001,
                1,
                function () {
                    GLVIS.Debugger.debug("RecommendationPosRingRepresentation", "Finished moving rec " + curr_rec.getId(), 8);
                },
                true
                );
    }

};

