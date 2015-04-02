

var GLGR = GLGR || {};



GLGR.DbHandler = function () {

    if (GLGR.DbHandler.singleton_ !== undefined)
    {
        throw ("DbHandler singleton already created");
    }
    GLGR.DbHandler.singleton_ = this;

    this.db_ = null;
    this.query_store_name_ = "queries_full";


    if (parent.GLGR.WidgetHelper !== undefined) {
        parent.GLGR.WidgetHelper.db_update_cb = this.dbUpdatedCb;

    }
    else
        console.log("DB-Handler: Could not find widget helper");

    this.last_created_graph_ = null;

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


/**
 * Building and collecting all graphs from a query that are not in the scene
 * already.
 * @param {} query_data
 * @returns {Array}
 */
GLGR.DbHandler.prototype.getNewGraphsFromQueryData = function (query_data) {

    var last_query = this.last_created_graph_;

    var graphs = [];
    for (var query_count = 0; query_count < query_data.length; query_count++)
    {
        var tmp_query_data = query_data[query_count];

        //Check if graph already exists
        var existing = GLGR.Scene.getSingleton().getExistingGraph(
                tmp_query_data.query_str,
                tmp_query_data.timestamp);

        //console.log(tmp_query_data, tmp_query_data.query_str, tmp_query_data.timestamp, existing);
        if (existing)
            continue;







        /** @type {GLGR.Graph} **/
        var tmp_query = new GLGR.Graph(
                tmp_query_data.query_str,
                {timestamp: tmp_query_data.timestamp}
        );

        var query_active = false;
        //if (query_count + 1 === query_data.length)
        query_active = true;

        tmp_query.setIsActive(query_active);

        for (var rec_count = 0; rec_count < tmp_query_data.recs.length; rec_count++)
        {
            var tmp_rec_data = tmp_query_data.recs[rec_count];


            var rec_data = tmp_rec_data;

            /** @type {GLGR.Recommendation} **/
            var tmp_rec = new GLGR.Recommendation(tmp_rec_data.id, rec_data);
            tmp_query.addRecommendation(tmp_rec);
        }



        tmp_query.setParent(last_query);

        console.log(tmp_query_data);
        console.log(tmp_query);


        last_query = tmp_query;

        graphs.push(tmp_query);
    }
    this.last_created_graph_ = last_query;
    return graphs;
};


GLGR.DbHandler.prototype.dbUpdatedCb = function () {
    console.log("DB-HANDLER: UPDATED DB CB CALLED --> GRAPH REDRAW NEEDED!");

    GLGR.DbHandler.getSingleton().getAllQueries(function (q_data) {

        GLGR.Debug.debugTime("Got all Queries from DB");
        GLGR.DbHandler.getSingleton().getAllRecommendations(function (r_data) {

            GLGR.Debug.debugTime("Got all Recs from DB");
            var query_data = prepareData(q_data, r_data);
            GLGR.Debug.debugTime("Prepared Data");


            /** @type {GLGR.Scene} **/
            var webgl_scene = GLGR.Scene.getSingleton();


            var graphs = GLGR.DbHandler.getSingleton().getNewGraphsFromQueryData(
                    query_data
                    );

            for (var i = 0; i < graphs.length; i++)
            {
                webgl_scene.addGraph(graphs[i]);
            }


            GLGR.Debug.debugTime("Created Graph");
        });
    });





};


GLGR.DbHandler.prototype.loadDbError_ = function () {
    console.log("Error loading DB");
};

