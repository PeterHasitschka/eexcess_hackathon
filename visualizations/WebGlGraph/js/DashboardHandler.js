
var GLGR = GLGR || {};


jQuery(document).ready(function () {

    GLGR.Debug.debugTime("start");
});


GLGR.WebGlDashboardHandler = {
    //Because needed while creating scene
    webgl_simplecomparer: null,
    webgl_dbhandler: null,
    webgl_scene: null,
    animcount: 0,
    graphs_to_skip_by_checkbox: []

};




GLGR.WebGlDashboardHandler.createScene = function (query_data) {
    GLGR.Debug.debugTime("CREATE GRAPH: START");
    var container = jQuery('#webgl_canvas_container')[0];


    /** @type {GLGR.Scene} **/
    this.webgl_scene = new GLGR.Scene(container);

    //@TODO: Fix Problems with parents, then activate!

    this.webgl_dbhandler.all_graphs_created_cb = this.fillBookmarkDropdown;
    this.webgl_dbhandler.getAndDrawNewGraphsFromDb();



    this.webgl_scene.getNavigationHandler().zoom(0.5);


    GLGR.Debug.debugTime("CREATE GRAPH: END");
    this.animate();

    GLGR.Debug.debugTime("CREATE GRAPH: AFTER ANIMATE");

};



/**
 * Adding all loaded graphs (queries or collections) to the bookmark
 * dropdown of the rec-dashboard
 * @returns {undefined}
 */
GLGR.WebGlDashboardHandler.fillBookmarkDropdown = function () {

    var bookmark_element = jQuery('.eexcess-bookmark-dropdown-list ul');
    var graphs = GLGR.WebGlDashboardHandler.webgl_scene.getGraphs();

    var graph_list_template = jQuery("<li class=' webgl_select_content webgl_select_graph_element'></div>");
    graph_list_template.html("<input type=checkbox checked='checked'></input><a href='#' ><span></span></a>");

    bookmark_element.append("<li class='webgl_select_content' id='webgl_select_separator'>----------</li>");

    for (var i = 0; i < graphs.length; i++) {
        var graph_name = graphs[i].getUniqueData().name;
        graph_name = graph_name.substring(0, 19);

        var new_list_element = graph_list_template.clone();
        new_list_element.attr("graph_id", graphs[i].getId());
        new_list_element.find("span").html(graph_name);
        bookmark_element.append(new_list_element);


        new_list_element.find("input").click(function () {
            GLGR.WebGlDashboardHandler.handleBookmarkCheckboxChange();
        });

        new_list_element.find("a").click(function () {
            var checkbox = jQuery(jQuery(this).siblings("input")[0]);
            checkbox.prop('checked', !checkbox.prop('checked'));
            GLGR.WebGlDashboardHandler.handleBookmarkCheckboxChange();

        });
    }
};

/*
 GLGR.WebGlDashboardHandler.handleBookmarkCheckboxChange = function (checkbox) {
 var graph_id = checkbox.parent().attr("graph_id");
 
 if (graph_id === undefined)
 throw("ERROR: COULD NOT FIND GRAPH ID IN DROPDOWN!!!");
 
 var checkbox_status = checkbox.prop("checked");
 var scene = GLGR.WebGlDashboardHandler.webgl_scene;
 var graphs = scene.getGraphs();
 
 
 
 for (var i = 0; i < graphs.length; i++) {
 var curr_graph = graphs[i];
 
 
 if (curr_graph.getId().toString() === graph_id) {
 
 if (checkbox_status)
 curr_graph.show();
 else
 curr_graph.hide();
 
 
 }
 }
 
 scene.getGraphRelationHandler().setUpdateNeeded(true);
 };
 */


GLGR.WebGlDashboardHandler.handleBookmarkCheckboxChange = function () {

    this.webgl_dbhandler.all_graphs_created_cb = null;
    var checkboxes = jQuery(".webgl_select_graph_element").find("input");

    this.graphs_to_skip_by_checkbox = [];

    var graphs = this.webgl_scene.getGraphs();

    for (var i = 0; i < checkboxes.length; i++)
    {
        var graph_id = parseInt(jQuery(checkboxes[i]).parent().attr("graph_id"));

        var status = jQuery(checkboxes[i]).prop("checked");

        //Set to list for skipping in GraphRelationHandler
        if (!status)
            this.graphs_to_skip_by_checkbox.push(graph_id);

        //Hide graph itself
        for (var j = 0; j < graphs.length; j++) {
            if (graphs[j].getId() === graph_id) {

                if (status)
                    graphs[j].show();
                else
                    graphs[j].hide();
                break;
            }
        }
    }

    this.webgl_scene.getGraphRelationHandler().setUpdateNeeded(true);
};



GLGR.WebGlDashboardHandler.destroyScene = function () {

    this.webgl_scene = null;
    this.webgl_dbhandler = null;
    GLGR.Graph.graphlist_ = null;
    this.animcount = 0;
};

GLGR.WebGlDashboardHandler.animate = function () {

    if (!GLGR.WebGlDashboardHandler.webgl_scene)
        return;

    /*
     this.animcount++;
     if (this.animcount > 300)
     {
     console.log("finished animating by stop");
     return;
     }
     */


    requestAnimationFrame(GLGR.WebGlDashboardHandler.animate);
    //console.log("ANIMATION STOPPED");


    GLGR.WebGlDashboardHandler.webgl_scene.render();
};


