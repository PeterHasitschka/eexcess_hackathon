var GLVIS = GLVIS || {};


GLVIS.DbHandler = function () {
    GLVIS.DbHandler.current_db_handler_ = this;

    this.db_ = null;
    this.query_data_ = [];
};


GLVIS.DbHandler.prototype.loadQueries = function (callback_ready) {
    
    var that = this;
    this.initDb_(function () {

        if (GLVIS.config.debug)
            console.log("DBHANDLER: Init DB ready.");


        that.getStorageData_(function (data) {
            console.log(data);
        }, "queries_full", ["id", "timestamp", "query"]);


        if (callback_ready)
            callback_ready();
    });


};

GLVIS.DbHandler.prototype.initDb_ = function (callback_ready) {
    
    if (this.db_ !== null) {
        callback_ready();
        return;
    }


    var that = this;
    EEXCESS.storage.getDb(function (db) {
        that.db_ = db;  //SUCCESS
        callback_ready();
    }, function () {    //ERROR
        throw("ERROR LOADING DB");
    }
    );

};


/**
 * @param {function} cb_query_loaded Callback function
 * @param {string} storage_name
 * @param {array} fields keys of the columns to load
 * @returns {array} holding all field names to be loaded
 */
GLVIS.DbHandler.prototype.getStorageData_ = function (cb_data_loaded, storage_name, fields) {


    if (!this.db_)
        throw ("DBHANDLER: ERROR: NO DB SET!");

    var trans = this.db_.transaction(storage_name, 'readonly');
    var store = trans.objectStore(storage_name);

    var request = store.openCursor();

    var data = [];

    trans.oncomplete = function (evt) {
        cb_data_loaded(data);
    };

    request.onsuccess = function (evt) {
        var result = evt.target.result;
        ;
        var cursor = evt.target.result;

        if (cursor) {

            var data_element = {};

            for (var i = 0; i < fields.length; i++)
            {
                data_element[fields[i]] = cursor.value[fields[i]];
            }

            data.push(data_element);
            cursor.continue();
        }
    };

    request.onerror = function (evt) {
        console.log("ERROR on Request");
    };


};



/******************
 * 
 * Static functions
 * 
 ******************/


GLVIS.DbHandler.current_db_handler_ = null;

/**
 * Get current DB-Handler
 * @returns {GLVIS.DbHandler}
 */
GLVIS.DbHandler.getCurrentDbHandler = function () {
    if (!this.current_db_handler_)
        throw("ERROR: NO CURRENT DB-HANDLER!");

    return this.current_db_handler_;
};