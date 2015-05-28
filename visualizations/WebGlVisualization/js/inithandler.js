
var GLVIS = GLVIS || {};



GLVIS.InitHandler = function () {


};
GLVIS.InitHandler.libs_loaded = false;


/**
 * 
 * @param {type} root_element
 * @param {type} path_to_webglvisualization_folder
 * @returns {undefined}
 */
GLVIS.InitHandler.init = function (root_element, path_to_webglvisualization_folder) {

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
                                    path + "js/db/db_handler.js",
                                    path + "js/db/query.js",
                                    path + "js/db/rec.js",
                                    path + "js/animationhelper.js",
                                    path + "js/webglhandler.js",
                                    path + "js/interactionhandler.js",
                                    path + "js/navigationhandler.js",
                                    path + "js/recdashboardhandler.js",
                                    path + "js/webglobjects/collection_centernode.js",
                                    path + "js/webglobjects/rec_commonnode.js",
                                    path + "js/collection.js",
                                    path + "js/recommendation.js",
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
                                            console.log("finished calling js files for webglvis-plugin");
                                            GLVIS.InitHandler.libs_loaded = true;

                                            //Recall this function
                                            GLVIS.InitHandler.init(root_element, path_to_webglvisualization_folder);
                                        });
                            }
                    );

                }
                else
                {
                    GLVIS.InitHandler.initScene(this.scene, this.db_handler);
                }


            }
    );
};









/**
 * Create DB-Handler and Scene. 
 * @param {GLVIS.Scene} scene
 * @param {GLVIS.DbHandler} db_handler
 */
GLVIS.InitHandler.initScene = function (scene, db_handler) {

    scene = new GLVIS.Scene(jQuery(GLVIS.config.rec_dashboard.selector));
    db_handler = new GLVIS.DbHandler();

    db_handler.loadQueriesAndRecs(function () {

        console.log("***** QUERIES LOADED *******");
    });



    /**
     * LOAD DATA HERE
     */

    var parents = {
        0: null,
        1: 0,
        2: 1,
        3: 0,
        4: 5,
        5: 3,
        6: 4,
        7: 8,
        8: 6,
        9: 7
    };

    for (var c_count = 0; c_count < 10; c_count++) {
        var c = new GLVIS.Collection();

        c.setParentId(parents[c_count]);


        for (var r_count = 0; r_count < 5; r_count++) {
            var r = new GLVIS.Recommendation();
            c.addRecommendation(r);
        }

        scene.addCollection(c);
    }



    scene.initCollectionNetwork();
    GLVIS.Scene.animate();
};




GLVIS.InitHandler.cleanup = function () {

    console.log("RECDASHBOARD: CLEANUP!");

    delete GLVIS.Scene.getCurrentScene();
    GLVIS.Scene.current_scene = null;

    delete GLVIS.DbHandler.getCurrentDbHandler();
    GLVIS.DbHandler.current_db_handler_ = null;
};