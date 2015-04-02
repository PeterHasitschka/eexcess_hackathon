
var webgl_scene;
jQuery(document).ready(function () {

    GLGR.Debug.debugTime("start");


    var db_handler = GLGR.DbHandler.getSingleton();
    db_handler.getAllQueries(function (q_data) {
        GLGR.Debug.debugTime("Got all Queries from DB");
        db_handler.getAllRecommendations(function (r_data) {
            GLGR.Debug.debugTime("Got all Recs from DB");
            var query_data = db_handler.prepareQueryRecStructure(q_data, r_data);
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

    
    
    //@TODO: Switch to second method!
    if (true)
    {
        //@TODO : Deactivate that reduntant stuff!
        
        var graphs = GLGR.DbHandler.getSingleton().getNewGraphsFromQueryData(
                query_data
                ).graphs;

        for (var i = 0; i < graphs.length; i++)
        {
            webgl_scene.addGraph(graphs[i]);


            var is_last = false;
            if (i === graphs.length - 1)
                is_last = true;

            if (is_last)
                webgl_scene.active_graph = graphs[i];
        }

    }
    else    
    {
        //@TODO: Fix Problems with parents, then activate!
        GLGR.DbHandler.getSingleton().getAndDrawNewGraphsFromDb();
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


