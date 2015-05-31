var GLVIS = GLVIS || {};

/**
 * 
 * Wrapper around the raw data-object from the storage.
 * 
 */



GLVIS.DbQueryObj = function (data) {

    //For avoiding to join the 'query' array at every compare
    this.query_str_ = null;

    this.data_ = null;
    if (data)
        this.setData(data);

    this.duplicate_ = false;

    this.recs_ = [];
};

/**
 * Set Data coming from @see{GLVIS.DbHandler.getStorageData_}
 * @param {type} data Obj
 */
GLVIS.DbQueryObj.prototype.setData = function (data) {
    this.data_ = data;

    var words = [];
    for (var str_c = 0; str_c < data.query.length; str_c++) {
        words.push(data.query[str_c]["text"]);
    }
    this.query_str_ = words.join(" ");
};

/**
 * Returning (processed) data originally from @see{GLVIS.DbHandler.getStorageData_}.
 * @returns {object}
 */
GLVIS.DbQueryObj.prototype.getData = function () {
    return this.data_;
};

/**
 * Returns the timestamp from the db data
 * @returns {float} timestamp
 */
GLVIS.DbQueryObj.prototype.getTimestamp = function () {
    return this.data_.timestamp;
};

/**
 * 
 * @param {type} rec_data GLVIS.DbRecObj.data_
 * @returns {GLVIS.DbQueryObj.data_.timestamp}
 */
GLVIS.DbQueryObj.prototype.addRec = function (rec_data) {
    this.recs_.push(rec_data);
};

/**
 * Returning array of rec-data @see{GLVIS.DbRecObj}
 * @returns {Array}
 */
GLVIS.DbQueryObj.prototype.getRecs = function () {
    return this.recs_;
};

/**
 * Flag this query data as an duplicate
 */
GLVIS.DbQueryObj.prototype.flagDuplicate = function () {
    this.duplicate_ = true;
};

/**
 * Returns true if query-search is an duplicate of another one
 * @returns {Boolean}
 */
GLVIS.DbQueryObj.prototype.getIsDuplicate = function () {
    return(this.duplicate_);
};

/**
 * Returns the search string
 * @returns {string}
 */
GLVIS.DbQueryObj.prototype.getQueryStr = function () {
    return this.query_str_;
};





/**
 * Create DbQueryObj Array holding the db-data
 * @param {type} data
 * @returns {Array}
 */
GLVIS.DbQueryObj.createObjectsFromDbData = function (data) {

    var objects_ = [];

    for (var i = 0; i < data.length; i++)
        objects_.push(new GLVIS.DbQueryObj(data[i]));
    return objects_;
};



