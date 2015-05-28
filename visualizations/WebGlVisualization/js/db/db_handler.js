var GLVIS = GLVIS || {};


GLVIS.DbHandler = function () {
    GLVIS.DbHandler.current_db_handler_ = this;

    this.db_ = null;
    this.query_data_ = [];
    this.rec_data_ = [];
};


GLVIS.DbHandler.prototype.loadQueriesAndRecs = function (callback_ready) {

    var that = this;
    this.initDb_(function () {

        if (GLVIS.config.debug)
            console.log("DBHANDLER: Init DB ready.");

        /**
         * Load raw query data then load raw rec data
         */

        that.getFullQueryStorageData_(function () {
            that.getFullRecStorageData_(function () {


                /**
                 * Query- and Rec- Data loaded now.
                 * Time to process them.
                 */
                that.injectRecDataIntoQueryData_();


                console.log("QUERY- AND REC-DATA: ", that.query_data_, that.rec_data_);
                //Finally callback
                if (callback_ready)
                    callback_ready();
            });
        });
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
 * Load query-data from the storage and save it in @see{GLVIS.DbQueryObj} objects
 * @param {type} success_cb
 * @returns {undefined}
 */
GLVIS.DbHandler.prototype.getFullQueryStorageData_ = function (success_cb) {

    var config = GLVIS.config.db.query;
    var that = this;
    this.getStorageData_(function (data) {
        that.query_data_ = GLVIS.DbQueryObj.createObjectsFromDbData(data);
        success_cb();
    },
            config.storage_name, config.fields_to_load);

};

/**
 * Load rec-data from the storage and save it in @see{GLVIS.DbRecObj} objects
 * @param {type} success_cb
 * @returns {undefined}
 */
GLVIS.DbHandler.prototype.getFullRecStorageData_ = function (success_cb) {

    var config = GLVIS.config.db.rec;
    var that = this;
    this.getStorageData_(function (data) {
        that.rec_data_ = GLVIS.DbRecObj.createObjectsFromDbData(data);
        success_cb();
    },
            config.storage_name, config.fields_to_load);

};

/**
 * Fill the query-data with the data-objects of the rec-results
 * @returns {undefined}
 */
GLVIS.DbHandler.prototype.injectRecDataIntoQueryData_ = function () {

    for (var q_count = 0; q_count < this.query_data_.length; q_count++) {

        /** @type{GLVIS.DbQueryObj} **/
        var current_query_db_obj = this.query_data_[q_count];

        for (var r_count = 0; r_count < this.rec_data_.length; r_count++) {

            /** @type{GLVIS.DbRecObj} **/
            var current_rec_db_obj = this.rec_data_[r_count];

            //Maybe already unset
            if (!current_rec_db_obj)
                continue;

            /*
             * If they have the same timestamp -> Add data(!) from the rec-obj to the query-obj
             * Afterwards delete the rec-obj
             */
            if (current_query_db_obj.getTimestamp() === current_rec_db_obj.getTimestamp()) {
                current_query_db_obj.addRec(current_rec_db_obj.getData());
                delete this.rec_data_[r_count];
            }
            else
                continue;
        }
    }
    
    //Delete empty but long array
    this.rec_data_ = [];
    
    console.log("DBHANDLER: Finished injecting recs in queries");
};



/**
 * Loading data from a db-storage and save them in an object.
 * All defined fields of theentries from the corresponding storage are getting saved.
 * 
 * @param {function} cb_query_loaded Callback function
 * @param {string} storage_name
 * @param {array} fields keys of the columns to load
 * @returns {array} holding objects of all entries of the storage with the data of the fields
 */
GLVIS.DbHandler.prototype.getStorageData_ = function (cb_data_loaded, storage_name, fields) {

    console.log("GETTING DATA FROM " + storage_name);
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