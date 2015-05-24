
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
    
    for (var i=0; i< results.length; i++) {
        /** @type{GLVIS.Result} **/
        var curr_res = results[i];
        
        curr_res.setRelativePosition(50-Math.random()*100,50-Math.random()*100);
    }
    
};