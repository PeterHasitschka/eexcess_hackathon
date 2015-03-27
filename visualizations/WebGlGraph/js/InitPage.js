
var webgl_scene;
jQuery(document).ready(function () {



    var db_handler = GLGR.DbHandler.getSingleton();
    db_handler.getAllQueries(function (q_data) {
        db_handler.getAllRecommendations(function (r_data) {

            var query_data = prepareData(q_data, r_data);

            createGraph(query_data);
        });
    });






});


function createGraph(query_data) {

    var container = jQuery('#webgl_canvas_container')[0];

    var last_query = null;


    /** @type {GLGR.Scene} **/
    webgl_scene = new GLGR.Scene(container);
    
    var last_query = null;
    for (var query_count = 0; query_count < query_data.length; query_count++)
    {
        var tmp_query_data = query_data[query_count];
        
        
        /** @type {GLGR.Graph} **/
        var tmp_query = new GLGR.Graph(tmp_query_data.query_str);

        for (var rec_count = 0; rec_count < tmp_query_data.recs.length; rec_count++)
        {
            var  tmp_rec_data = tmp_query_data.recs[rec_count];
            
            
            var rec_data = tmp_rec_data;

            /** @type {GLGR.Recommendation} **/
            var tmp_rec = new GLGR.Recommendation(tmp_rec_data.id, rec_data);
            tmp_query.addRecommendation(tmp_rec);
        }




        tmp_query.setParent(last_query);
        last_query = tmp_query;

        webgl_scene.addGraph(tmp_query);
    }



    webgl_scene.buildScene();

    animate();


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
            //console.log(tmp_raw_rec.timestamp);
            if (
                    tmp_raw_rec.timestamp === tmp_query.timestamp
                    //&& tmp_raw_rec.context.query === tmp_query.query_str
                    )
            {
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