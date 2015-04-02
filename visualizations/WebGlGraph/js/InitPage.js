
var webgl_scene;
jQuery(document).ready(function () {

    GLGR.Debug.debugTime("start");


    var db_handler = GLGR.DbHandler.getSingleton();
    db_handler.getAllQueries(function (q_data) {
        GLGR.Debug.debugTime("Got all Queries from DB");
        db_handler.getAllRecommendations(function (r_data) {
            GLGR.Debug.debugTime("Got all Recs from DB");
            var query_data = prepareData(q_data, r_data);
            GLGR.Debug.debugTime("Prepared Data");
            createScene(query_data);
            GLGR.Debug.debugTime("Created Graph");
        });
    });
});



function createScene(query_data) {
    GLGR.Debug.debugTime("CREATE GRAPH: START");
    var container = jQuery('#webgl_canvas_container')[0];


    /** @type {GLGR.Scene} **/
    webgl_scene = new GLGR.Scene(container);

    var graphs = GLGR.DbHandler.getSingleton().getNewGraphsFromQueryData(
            query_data
            );

    for (var i = 0; i < graphs.length; i++)
    {
        webgl_scene.addGraph(graphs[i]);
    }





    webgl_scene.getNavigationHandler().zoom(0.5);


    GLGR.Debug.debugTime("CREATE GRAPH: END");
    animate();

    GLGR.Debug.debugTime("CREATE GRAPH: AFTER ANIMATE");
}


function animate() {
    requestAnimationFrame(animate);
    webgl_scene.render();
}


/**
 * Combine query- and recommendation data
 * @param {array} raw_query_data From IndexedDb
 * @param {array} raw_rec_data From IndexedDb
 * @returns {undefined}
 */
function prepareData(raw_query_data, raw_rec_data)
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
            //console.log("Going through recs ("+r_count+"/"+raw_rec_data.length+")");
            var tmp_raw_rec = raw_rec_data[r_count];
            /*
            if (tmp_query.query_str == tmp_raw_rec.context.query)
                console.log(tmp_raw_rec.context.query, tmp_raw_rec.timestamp,tmp_query.timestamp);
                */
            //console.log(tmp_raw_rec.timestamp);
            if (
                    tmp_raw_rec.timestamp === tmp_query.timestamp
                    //&& tmp_raw_rec.context.query === tmp_query.query_str
                    )
            {
                //console.log("REC CHECK FOR " +tmp_raw_rec.context.query);
                //console.log("FOUND MATCHING REC!");
                tmp_raw_rec.result.db_id = tmp_raw_rec.recommendation_id;

                tmp_query.recs.push(tmp_raw_rec.result);
                //Remove r from array
                raw_rec_data.splice(r_count, 1);
            }
        }

        queries.push(tmp_query);
    }


    return queries;
}