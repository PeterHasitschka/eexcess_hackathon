

var GLGR = GLGR || {};



GLGR.DbHandler = function () {

    if (GLGR.DbHandler.singleton_ !== undefined)
    {
        throw ("DbHandler singleton already created");
    }
    GLGR.DbHandler.singleton_ = this;

    this.db_ = null;
    this.query_store_name_ = "queries_full";
};

GLGR.DbHandler.getSingleton = function () {

    if (GLGR.DbHandler.singleton_ === undefined)
        GLGR.DbHandler.singleton_ = new GLGR.DbHandler();

    return GLGR.DbHandler.singleton_;
};

/**
 * Loading or returning the DB as a param  of a callback function,
 * depending if already loaded
 * @param {function} successFct
 */
GLGR.DbHandler.prototype.getDb_ = function (successFct) {
    //DB already loaded. Just call callback
    if (this.db_ !== null)
    {
        //console.log("DB already loaded. Callback");
        successFct(this.db_);
        return;
    }

    //Db not loaded yet
    //console.log("Loading IndexedDb once");
    EEXCESS.storage.getDb(successFct, this.loadDbError_);
};


/**
 * Loading all queries from the db
 * @param {function} cb_query_loaded Callback function with queries as param
 */
GLGR.DbHandler.prototype.getAllQueries = function (cb_query_loaded) {
    this.getStorageData_(cb_query_loaded, this.query_store_name_, ["id", "timestamp", "query"]);
};


/**
 * Loading all recommendations from the db
 * @param {function} cb_query_loaded Callback function with queries as param
 */
GLGR.DbHandler.prototype.getAllRecommendations = function (cb_query_loaded) {
    this.getStorageData_(cb_query_loaded, "recommendations", ["recommendation_id", "context", "result", "timestamp"]);
};



/**
 * @param {function} cb_query_loaded Callback function
 * @param {string} storage_name
 * @param {array} fields keys of the columns to load
 * @returns {array} holding all loaded data
 */
GLGR.DbHandler.prototype.getStorageData_ = function (cb_data_loaded, storage_name, fields) {

    //console.log("GETTING DATA FROM STORAGE " + storage_name);

    var that = GLGR.DbHandler.getSingleton();
    
    

    //callback gets called by storage.getDb or by this.getDb_ depending if 
    //db already loaded
    this.getDb_(function (db) {
        that.db_ = db;
        

        var trans = that.db_.transaction(storage_name, 'readonly');
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

    });

};






GLGR.DbHandler.prototype.loadDbError_ = function () {
    console.log("Error loading DB");
};

