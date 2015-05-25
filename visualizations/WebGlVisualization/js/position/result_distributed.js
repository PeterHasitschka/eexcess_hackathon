
GLVIS = GLVIS || {};


/**
 * 
 * @param {GLVIS.Collection} collection
 * @returns {undefined}
 */
GLVIS.ResultPosDistributed = function(collection){
    
    /** @type{GLVIS.Collection} **/
    this.collection_ = collection;
};


GLVIS.ResultPosDistributed.prototype.calculatePositions = function() {
    console.log("TODO: Distribute Positions of results...");
    
    var results = this.collection_.getResults();
    var res_config = GLVIS.config.collection.result;   
    var distance = res_config.init_distance;
    
    var num_res = results.length;
    
    
    var degree_step = (Math.PI * 2) / num_res;
    var curr_degree = 0.0;
    
    for (var i=0; i< results.length; i++) {
        /** @type{GLVIS.Result} **/
        
        
        var pos_x = Math.cos(curr_degree) * distance;
        var pos_y = Math.sin(curr_degree) * distance;
        
        var curr_res = results[i];
        curr_res.setRelativePosition(pos_x, pos_y);
        
        
        curr_degree += degree_step;
    }
    
};