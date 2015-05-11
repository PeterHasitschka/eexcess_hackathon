

var GLGR = GLGR || {};



GLGR.DbHandler = function () {


    this.db_ = null;
    this.query_store_name_ = "queries_full";


    this.all_graphs_created_cb = null;
    /*
     if (parent.GLGR.WidgetHelper !== undefined) {
     parent.GLGR.WidgetHelper.db_update_cb = this.getAndDrawNewGraphsFromDb;
     
     }
     else
     {
     //console.log("DB-Handler: Could not find widget helper");
     }
     */


    this.last_created_graph_ = null;

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



    //callback gets called by storage.getDb or by this.getDb_ depending if 
    //db already loaded
    this.getDb_(function (db) {
        GLGR.WebGlDashboardHandler.webgl_dbhandler.db_ = db;


        var trans = GLGR.WebGlDashboardHandler.webgl_dbhandler.db_.transaction(storage_name, 'readonly');
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

    //var last_query = this.last_created_graph_;

    var graphs = [];
    for (var query_count = 0; query_count < query_data.length; query_count++)
    {
        var tmp_query_data = query_data[query_count];

        //Check if graph already exists
        var existing = GLGR.Scene.getCurrentScene().getExistingGraph(
                tmp_query_data.query_str
                , tmp_query_data.timestamp
                );

        if (existing)
            continue;



        /** @type {GLGR.Graph} **/
        var tmp_query = new GLGR.Graph(
                tmp_query_data.query_str,
                {timestamp: tmp_query_data.timestamp}
        );

        var query_active = false;
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

        /*
         if (tmp_query_data.recs.length === 0)
         {
         console.log("Empty result for query '" + tmp_query_data.query_str +
         "' --> Maybe already existing? TODO: Move to existing query!");
         }
         */

        // Not prove that parent gets drawn --> set it later when adding to scene
        //tmp_query.setParent(last_query);

        //last_query = tmp_query;

        graphs.push(tmp_query);
    }
    //this.last_created_graph_ = last_query;
    return {graphs: graphs};
};


GLGR.DbHandler.prototype.getAndDrawNewGraphsFromDb = function () {
    //console.log("DB-HANDLER: UPDATED DB CB CALLED --> GRAPH REDRAW NEEDED!");

    var that = GLGR.WebGlDashboardHandler.webgl_dbhandler;
    that.getAllQueries(function (q_data) {

        GLGR.Debug.debugTime("Got all Queries from DB");
        that.getAllRecommendations(function (r_data) {

            GLGR.Debug.debugTime("Got all Recs from DB");
            var query_data = that.prepareQueryRecStructure(q_data, r_data);
            GLGR.Debug.debugTime("Prepared Data");


            /** @type {GLGR.Scene} **/
            var webgl_scene = GLGR.Scene.getCurrentScene();


            var newgr_res = that.getNewGraphsFromQueryData(
                    query_data
                    );

            var graphs = newgr_res.graphs;


            //If last graph to add is empty -> move to this one!
            var last_graph_with_existing_querystr = null;

            //Use as parent
            var last_added = null;

            for (var i = 0; i < graphs.length; i++)
            {
                //Prevent adding if:
                // * No recs
                // * Query exists!



                //Get last added as parent
                if (webgl_scene.getGraphs().length)
                {
                    var length_already_added_graphs = webgl_scene.getGraphs().length;
                    last_added = webgl_scene.getGraphs()[length_already_added_graphs - 1];
                }


                var skip_adding = false;
                if (!graphs[i].getRecommendations().length)
                {

                    //Check if query exists
                    for (var j = 0; j < webgl_scene.getGraphs().length; j++)
                    {
                        var graph_to_check = webgl_scene.getGraphs()[j];
                        var query_str_to_check = graph_to_check.getUniqueData().name;

                        var current_query_str = graphs[i].getUniqueData().name;

                        if (query_str_to_check === current_query_str)
                        {
                            skip_adding = true;
                            last_graph_with_existing_querystr = graph_to_check;
                            break;
                        }
                    }
                }

                var is_last = false;
                if (i === graphs.length - 1)
                    is_last = true;


                if (!skip_adding)
                {

                    var parent_id = null;
                    if (last_added)
                        parent_id = last_added.getId();

                    //console.log("Adding graph " + graphs[i].getId() +
                    //        " with parent " + parent_id);


                    graphs[i].setParent(last_added);
                    webgl_scene.addGraph(graphs[i]);


                    if (is_last)
                        webgl_scene.active_graph = graphs[i];
                }
                //If last to add, and gets skipped, move to the already searched
                else if (is_last)
                {
                    webgl_scene.active_graph = last_graph_with_existing_querystr;
                    webgl_scene.getGraphRelationHandler().setUpdateNeeded(true);
                    //console.log("Skipping an empty graph but moving to it... ");
                }
                else
                {
                    //console.log("Skipping an empty graph... ");
                }
            }


            GLGR.Debug.debugTime("Created Graph");

            //Calling finished callback if set
            if (that.all_graphs_created_cb !== null)
                that.all_graphs_created_cb();
        });
    });

};

/**
 * Combine query- and recommendation data
 * @param {array} raw_query_data From IndexedDb
 * @param {array} raw_rec_data From IndexedDb
 * @returns {undefined}
 */
GLGR.DbHandler.prototype.prepareQueryRecStructure = function (raw_query_data, raw_rec_data)
{
    //console.log(raw_query_data);
    //console.log(raw_rec_data);

    var queries = [];

    for (var q_count = 0; q_count < raw_query_data.length; q_count++)
    {
        var tmp_query = {};

        tmp_query.id = raw_query_data[q_count].id;

        var q_str = [];
        for (var q_str_count = 0; q_str_count < raw_query_data[q_count].query.length; q_str_count++)
        {
            q_str.push(raw_query_data[q_count].query[q_str_count].text);
        }

        tmp_query.query_str = q_str.join(" ");
        tmp_query.timestamp = raw_query_data[q_count].timestamp;
        tmp_query.recs = [];


        for (var r_count = 0; r_count < raw_rec_data.length; r_count++)
        {
            var tmp_raw_rec = raw_rec_data[r_count];

            if (
                    tmp_raw_rec.timestamp === tmp_query.timestamp
                    )
            {
                tmp_raw_rec.result.db_id = tmp_raw_rec.recommendation_id;
                tmp_query.recs.push(tmp_raw_rec.result);
            }
        }

        queries.push(tmp_query);
    }


    return queries;
}


GLGR.DbHandler.prototype.loadDbError_ = function () {
    console.log("Error loading DB");
};

