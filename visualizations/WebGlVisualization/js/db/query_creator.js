
var GLVIS = GLVIS || {};


GLVIS.DbQueryCreator = function (query_data) {

    this.query_data_ = query_data;

};


GLVIS.DbQueryCreator.prototype.createQueries = function (end_index, length, load_duplicates) {

    GLVIS.Debugger.debug("DbQueryCreator",
            "Creating " + length + " queries until index " + end_index,
            3);


    if (end_index > this.query_data_.length - 1)
        throw ("Index out of bounds!");


    var collections = [];


    for (var back_count = end_index; back_count >= 0; back_count--) {

        if (collections.length >= length)
            break;

        /** @type{GLVIS.DbQueryObj} **/
        var curr_query_data = this.query_data_[back_count];

        //If no duplicates wanted and is duplicate, continue
        if (curr_query_data.getIsDuplicate() && !load_duplicates)
            continue;

        var collection = this.createCollection(curr_query_data);
        collections.push(collection);
    }




    /**
     * 
     * DON'T FORGET TO SORT!
     * 
     * 
     * DON'T FORGET TO SET PARENTS!
     * 
     */


    return collections;
};

/**
 * Creates a query from the db-data
 * @param {GLVIS.DbQueryObj} query_data_obj
 * @returns {GLVIS.Collection}
 */
GLVIS.DbQueryCreator.prototype.createCollection = function (query_data_obj) {

    var query = new GLVIS.Collection();
    return query;
};