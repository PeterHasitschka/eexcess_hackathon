(function () {

    var WebGlVisPlugin = {
        scene: null,
        db_handler: null
    };
    var $root = null;

    WebGlVisPlugin.initialize = function (EEXCESSObj, rootSelector) {
        $root = $(rootSelector);
        this.loadCss("/visualizations/WebGlVisualization/css/webglvis.css");

        this.librariesLoaded = false;
        // load other needed scripts (require.js is available)
    };

    WebGlVisPlugin.draw = function (receivedData, mappingCombination, iWidth, iHeight) {

        //Load HTML-Credentials via AJAX
        jQuery.get(
                "../WebGlVisualization/html/recdashboard/index.html", function (data) {
                    $root.append(data);

                    /**
                     * Run require in two steps... Otherwise it may happen
                     * randomly that three.js doesn't get loaded until the scene
                     * gets created.
                     */
                    if (!WebGlVisPlugin.librariesLoaded) {
                        require([
                            "../../../libs/jquery-1.10.1.min.js",
                            "../../../libs/jquery-mousewheel/jquery.mousewheel.min.js",
                            "../WebGlVisualization/lib/three.js/three.min.js"],
                                function () {
                                    require([
                                        "../WebGlVisualization/js/config.js",
                                        "../WebGlVisualization/js/db/db_handler.js",
                                        "../WebGlVisualization/js/animationhelper.js",
                                        "../WebGlVisualization/js/webglhandler.js",
                                        "../WebGlVisualization/js/interactionhandler.js",
                                        "../WebGlVisualization/js/navigationhandler.js",
                                        "../WebGlVisualization/js/recdashboardhandler.js",
                                        "../WebGlVisualization/js/webglobjects/collection_centernode.js",
                                        "../WebGlVisualization/js/webglobjects/rec_commonnode.js",
                                        "../WebGlVisualization/js/collection.js",
                                        "../WebGlVisualization/js/recommendation.js",
                                        "../WebGlVisualization/js/position/recommendation/distributed.js",
                                        "../WebGlVisualization/js/position/collection/linear.js",
                                        "../WebGlVisualization/js/webglobjects/connection/collection_rec_line.js",
                                        "../WebGlVisualization/js/webglobjects/connection/collection_collection_line.js",
                                        "../WebGlVisualization/js/scene.js",
                                        //"../WebGlVisualization/html/recdashboard/init.js",
                                        "js/utils.js", //Important to prevent .scrollTo-Bug
                                        "js/colorpicker.js", //Important to prevent .colorPicker-Bug
                                        "js/accordion-and-dropdown.js"   //Important to prevent .dropdown-Bug
                                    ],
                                            function () {
                                                console.log("finished calling js files for webglvis-plugin");
                                                WebGlVisPlugin.librariesLoaded = true;

                                                //Recall this function
                                                WebGlVisPlugin.draw();
                                            });
                                }
                        );

                    }
                    else
                    {
                        GLVIS.RecDashboardHandler.initScene(this.scene, this.db_handler);
                    }


                }
        );





    };

    // indexArray: array with items' indices to highlight. They match items in receivedData (parameter in Render.draw)
    WebGlVisPlugin.highlightItems = function (indexArray) {
    };

    WebGlVisPlugin.finalize = function () {
        GLVIS.RecDashboardHandler.cleanup();
    };





    WebGlVisPlugin.loadCss = function (url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    };



    PluginHandler.registerVisualisation(WebGlVisPlugin, {
        'displayName': 'WebGlVis'
    });
})();
