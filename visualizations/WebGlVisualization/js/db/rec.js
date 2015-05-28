var GLVIS = GLVIS || {};

/**
 * 
 * Wrapper around the raw data-object from the storage.
 * 
 */

GLVIS.DbRecObj = function (data) {

    this.data_ = null;
    if (data)
        this.data_ = data;
};

/**
 * Set Data coming from @see{GLVIS.DbHandler.getStorageData_}
 * @param {type} data Obj
 */
GLVIS.DbRecObj.prototype.setData = function (data) {
    this.data_ = data;
};

/**
 * Returning (processed) data originally from @see{GLVIS.DbHandler.getStorageData_}.
 * @returns {object}
 */
GLVIS.DbRecObj.prototype.getData = function () {
    return this.data_;
};

/**
 * Returns the timestamp from the db data
 * @returns {float} timestamp
 */
GLVIS.DbRecObj.prototype.getTimestamp = function(){
    return this.data_.timestamp;
};


GLVIS.DbRecObj.createObjectsFromDbData = function (data) {

    var objects_ = [];

    for (var i = 0; i < data.length; i++)
        objects_.push(new GLVIS.DbRecObj(data[i]));


    return objects_;
};