
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

    var selected_query_datas = [];
    for (var back_count = end_index; back_count >= 0; back_count--) {

        if (selected_query_datas.length >= length)
            break;

        /** @type{GLVIS.DbQueryObj} **/
        var curr_query_data = this.query_data_[back_count];

        //If no duplicates wanted and is duplicate, continue
        if (curr_query_data.getIsDuplicate() && !load_duplicates)
            continue;

        selected_query_datas.push(curr_query_data);

    }

    //Turn array around. Before creating collections due to increment ids
    selected_query_datas.reverse();

    for (var q_count = 0; q_count < selected_query_datas.length; q_count++) {
        var curr_query_data = selected_query_datas[curr_query_data];
        var collection = this.createCollection(curr_query_data);
        collections.push(collection);
    }

    GLVIS.Debugger.debug("DbQueryCreator",
            "************************DONT FORGET TO SET PARENTS************", 1);

    return collections;
};

/**
 * Creates a query from the db-data
 * @param {GLVIS.DbQueryObj} query_data_obj
 * @returns {GLVIS.Collection}
 */
GLVIS.DbQueryCreator.prototype.createCollection = function (query_data_obj) {

    var query = new GLVIS.Collection();

    GLVIS.Debugger.debug("DbQueryCreator",
            "Collection from query with ID " + query.getId() + " created", 5);
    return query;
};