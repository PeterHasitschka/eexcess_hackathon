
var webgl_scene;
var webgl_dbhandler;

//Because needed while creating scene
var webgl_simplecomparer;

jQuery(document).ready(function () {

    GLGR.Debug.debugTime("start");
});



function createScene(query_data) {
    GLGR.Debug.debugTime("CREATE GRAPH: START");
    var container = jQuery('#webgl_canvas_container')[0];


    /** @type {GLGR.Scene} **/
    webgl_scene = new GLGR.Scene(container);

    //@TODO: Fix Problems with parents, then activate!

    webgl_dbhandler.all_graphs_created_cb = fillBookmarkDropdown;
    webgl_dbhandler.getAndDrawNewGraphsFromDb();



    webgl_scene.getNavigationHandler().zoom(0.5);


    GLGR.Debug.debugTime("CREATE GRAPH: END");
    animate();

    GLGR.Debug.debugTime("CREATE GRAPH: AFTER ANIMATE");





}

/**
 * Adding all loaded graphs (queries or collections) to the bookmark
 * dropdown of the rec-dashboard
 * @returns {undefined}
 */
function fillBookmarkDropdown() {

    var bookmark_element = jQuery('.eexcess-bookmark-dropdown-list ul');


    var graphs = webgl_scene.getGraphs();


    var graph_list_template = jQuery("<li class=' webgl_select_content webgl_select_graph_element'></div>");
    graph_list_template.html("<input type=checkbox></input><a href='#' graph_id=''><span></span></a>");

    bookmark_element.append("<li class='webgl_select_content' id='webgl_select_separator'>----------</li>");

    for (var i = 0; i < graphs.length; i++) {

        var graph_name = graphs[i].getUniqueData().name;
        graph_name = graph_name.substring(0, 19);

        var new_list_element = graph_list_template.clone();
        new_list_element.find("a").attr("graph_id", graphs[i].getId());
        new_list_element.find("span").html(graph_name);
        bookmark_element.append(new_list_element);


        new_list_element.click(function () {
            alert("click");
        });
    }
}


function destroyScene() {

    webgl_scene = null;
    webgl_dbhandler = null;
    GLGR.Graph.graphlist_ = null;

    animcount = 0;

}


var animcount = 0;
function animate() {
    if (!webgl_scene)
        return;

    /*
     animcount++;
     if (animcount > 300)
     {
     console.log("finished animating by stop");
     return;
     }
     */


    requestAnimationFrame(animate);
    //console.log("ANIMATION STOPPED");


    webgl_scene.render();
}


