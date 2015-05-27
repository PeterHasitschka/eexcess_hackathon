
GLVIS = GLVIS || {};


/**
 * 
 * @param {GLVIS.Collection} collection
 * @returns {undefined}
 */
GLVIS.RecommendationPosDistributed = function(collection){
    
    /** @type{GLVIS.Collection} **/
    this.collection_ = collection;
};


GLVIS.RecommendationPosDistributed.prototype.calculatePositions = function() {
    
    var recommendations = this.collection_.getRecommendations();
    var res_config = GLVIS.config.collection.recommendation;   
    var distance = res_config.init_distance;
    
    var num_res = recommendations.length;
    
    
    var degree_step = (Math.PI * 2) / num_res;
    var curr_degree = - Math.PI / 2.0;
    
    for (var i=0; i< recommendations.length; i++) {
        /** @type{GLVIS.Recommendation} **/
        
        
        var pos_x = Math.cos(curr_degree) * distance;
        var pos_y = Math.sin(curr_degree) * distance;
        
        var curr_res = recommendations[i];
        curr_res.setRelativePosition(pos_x, pos_y);
        
        
        curr_degree += degree_step;
    }
    
};