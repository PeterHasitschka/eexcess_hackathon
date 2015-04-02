
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


