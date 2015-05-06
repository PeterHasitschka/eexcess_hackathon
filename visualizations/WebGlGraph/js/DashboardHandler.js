
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


    webgl_dbhandler.getAndDrawNewGraphsFromDb();



    webgl_scene.getNavigationHandler().zoom(0.5);


    GLGR.Debug.debugTime("CREATE GRAPH: END");
    animate();

    GLGR.Debug.debugTime("CREATE GRAPH: AFTER ANIMATE");

    //console.log(webgl_scene);

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


