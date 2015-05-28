var GLVIS = GLVIS || {};

/**
 * 
 * Wrapper around the raw data-object from the storage.
 * 
 */



GLVIS.DbQueryObj = function (data) {

    this.data_ = null;
    if (data)
        this.data_ = data;
    
    this.recs_ = [];
};

/**
 * Set Data coming from @see{GLVIS.DbHandler.getStorageData_}
 * @param {type} data Obj
 */
GLVIS.DbQueryObj.prototype.setData = function (data) {
    this.data_ = data;
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
GLVIS.DbQueryObj.prototype.getTimestamp = function(){
    return this.data_.timestamp;
};

/**
 * 
 * @param {type} rec_data GLVIS.DbRecObj.data_
 * @returns {GLVIS.DbQueryObj.data_.timestamp}
 */
GLVIS.DbQueryObj.prototype.addRec = function(rec_data){
    this.recs_.push(rec_data);
};





GLVIS.DbQueryObj.createObjectsFromDbData = function (data) {

    var objects_ = [];

    for (var i = 0; i < data.length; i++)
        objects_.push(new GLVIS.DbQueryObj(data[i]));
    return objects_;
};



