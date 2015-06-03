
var GLVIS = GLVIS || {};

GLVIS.InitHandler = function () {
};

GLVIS.InitHandler.libs_loaded = false;


/**
 * 
 * @param {type} root_element
 * @param {type} path_to_webglvisualization_folder
 * @param {function} cb callback
 * @returns {undefined}
 */
GLVIS.InitHandler.init = function (root_element, path_to_webglvisualization_folder, cb) {

    var path = path_to_webglvisualization_folder;

    //Load HTML-Credentials via AJAX
    jQuery.get(
            path + "html/recdashboard/index.html", function (data) {
                root_element.append(data);

                /**
                 * Run require in two steps... Otherwise it may happen
                 * randomly that three.js doesn't get loaded until the scene
                 * gets created.
                 */
                if (!GLVIS.InitHandler.libs_loaded) {
                    require([
                        path + "../../../libs/jquery-1.10.1.min.js",
                        path + "../../../libs/jquery-mousewheel/jquery.mousewheel.min.js",
                        path + "lib/three.js/three.min.js"],
                            function () {
                                require([
                                    path + "js/config.js",
                                    path + "js/tools/debugger.js",
                                    path + "js/db/db_handler.js",
                                    path + "js/db/query.js",
                                    path + "js/db/rec.js",
                                    path + "js/db/query_creator.js",
                                    path + "js/animation.js",
                                    path + "js/webglhandler.js",
                                    path + "js/interactionhandler.js",
                                    path + "js/navigationhandler.js",
                                    path + "js/recdashboardhandler.js",
                                    path + "js/webglobjects/collection_centernode.js",
                                    path + "js/webglobjects/rec_commonnode.js",
                                    path + "js/webglobjects/coll_ringsegment.js",
                                    path + "js/webglobjects/text.js",
                                    path + "js/collection.js",
                                    path + "js/recommendation.js",
                                    path + "js/ringrepresentation.js",
                                    path + "js/position/recommendation/distributed.js",
                                    path + "js/position/collection/linear.js",
                                    path + "js/webglobjects/connection/collection_rec_line.js",
                                    path + "js/webglobjects/connection/collection_collection_line.js",
                                    path + "js/scene.js",
                                    path + "../../../common_js/storage.js",
                                    path + "../Vis-Template/js/utils.js", //Important to prevent .scrollTo-Bug
                                    path + "../Vis-Template/js/colorpicker.js", //Important to prevent .colorPicker-Bug
                                    path + "../Vis-Template/js/accordion-and-dropdown.js"   //Important to prevent .dropdown-Bug
                                ],
                                        function () {
                                            GLVIS.Debugger.debug("InitHandler",
                                                    "finished calling js files for webglvis-plugin",
                                                    3);

                                            GLVIS.InitHandler.libs_loaded = true;

                                            //Recall this function
                                            GLVIS.InitHandler.init(root_element, path_to_webglvisualization_folder, cb);
                                        });
                            }
                    );
                }
                else {
                    GLVIS.InitHandler.initScene(this.scene, this.db_handler, cb);
                }
            }
    );
};



/**
 * Create DB-Handler and Scene. 
 * @param {GLVIS.Scene} scene
 * @param {GLVIS.DbHandler} db_handler
 * @param {function} cb callback
 */
GLVIS.InitHandler.initScene = function (scene, db_handler, cb) {

    scene = new GLVIS.Scene(jQuery(GLVIS.config.rec_dashboard.selector));
    db_handler = new GLVIS.DbHandler();
    var queries_to_add = null;
    db_handler.loadQueriesAndRecs(function () {

        GLVIS.Debugger.debug("InitHandler",
                "Query-Data loaded and processed cb",
                3);

        var queries_to_add = db_handler.fetchQueries(GLVIS.config.scene.queries_to_fetch);

        for (var q_count = 0; q_count < queries_to_add.length; q_count++) {
            scene.addCollection(queries_to_add[q_count]);
        }

        scene.initCollectionNetwork();

        //Test: Add one ringsegment
        var last_q = queries_to_add[queries_to_add.length - 1];
        last_q.createRingRepresentation();


        GLVIS.Scene.animate();

        if (cb)
            cb();
    });
};


GLVIS.InitHandler.cleanup = function () {

    GLVIS.Debugger.debug("InitHandler",
            "Cleaning up!",
            3);

    delete GLVIS.Scene.getCurrentScene();
    GLVIS.Scene.current_scene = null;

    delete GLVIS.DbHandler.getCurrentDbHandler();
    GLVIS.DbHandler.current_db_handler_ = null;
};