
var GLVIS = GLVIS || {};


GLVIS.DbQueryFetcher = function (query_data) {

    this.query_data_ = query_data;

};


GLVIS.DbQueryFetcher.prototype.createQueries = function (end_index, length, load_duplicates) {

    GLVIS.Debugger.debug("DbQueryFetcher",
            "Creating " + length + " queries until index " + end_index,
            3);


    if (end_index > this.query_data_.length - 1)
        throw ("Index out of bounds!");
    
    
    var queries = [];
    
    
    for (var back_count=end_index; back_count >=0; back_count--) {
        
        /** @type{GLVIS.DbQueryObj} **/
        var curr_query_data = this.query_data_[back_count];
        
        //If no duplicates wanted and is duplicate, continue
        if (curr_query_data.getIsDuplicate() && !load_duplicates)
            continue;
    }
    
    
    
    
    /**
     * 
     * DON'T FORGET TO SORT!
     * 
     * 
     * DON'T FORGET TO SET PARENTS!
     * 
     */
    
    
    return [];
};

/**
 * Creates a query from the db-data
 * @param {GLVIS.DbQueryObj} query_data_obj
 * @returns {GLVIS.Query}
 */
GLVIS.DbQueryFetcher.prototype.createQuery = function(query_data_obj) {
  
    
};