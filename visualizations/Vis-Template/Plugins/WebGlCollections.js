(function () {

    var WebGlCollectionsPlugin = {
        librariesLoaded: false
    };


    var $root = null;

    WebGlCollectionsPlugin.initialize = function (EEXCESSObj, rootSelector) {
        $root = $(rootSelector);
        loadCss("/visualizations/WebGlGraph/css/webglgraph.css");

    };

    WebGlCollectionsPlugin.draw = function (receivedData, mappingCombination, iWidth, iHeight) {

        if (!WebGlCollectionsPlugin.librariesLoaded) {
            console.log("requiring all the js files for webglcollplugin");

            require([
                '../WebGlGraph/js/../../../libs/jquery-1.10.1.min.js',
                '../WebGlGraph/js/../../../libs/jquery-mousewheel/jquery.mousewheel.min.js',
                '../WebGlGraph/js/libs/three.js/three.js',
                '../WebGlGraph/js/graph/Debugger.js',
                '../WebGlGraph/js/graph/InteractionHandler.js',
                '../WebGlGraph/js/graph/Scene.js',
                '../WebGlGraph/js/graph/NavigationHandler.js',
                '../WebGlGraph/js/graph/compare/SimpleCompare.js',
                '../WebGlGraph/js/graph/connections/ConnectionAbstract.js',
                '../WebGlGraph/js/graph/connections/ConnectionGraphRec.js',
                '../WebGlGraph/js/graph/connections/ConnectionGraphGraph.js',
                '../WebGlGraph/js/graph/GraphRelationHandler.js',
                '../WebGlGraph/js/graph/Graph.js',
                '../WebGlGraph/js/graph/Recommendation.js',
                '../WebGlGraph/js/../../../common_js/storage.js',
                '../WebGlGraph/js/DbHandler.js',
                '../WebGlGraph/js/InitPage.js'
            ],
                    function () {
                        console.log("finished calling js files for webglcollplugin");
                        WebGlCollectionsPlugin.librariesLoaded = true;
                        WebGlCollectionsPlugin.draw();
                    });



            return;
        }


        var inner_html = '' +
                '<div id="webgl_status_bar">' +
                '<span id="webgl_status_bar_content"> </span>' +
                '<div id="webgl_status_bar_buttoncompare_simple"><a href="#">' +
                '   Compare (Hierachical)' +
                '</a></div>' +
                '</div>' +
                '<div id="webgl_canvas_container">' +
                '<p>Loading WebGL-Graphs...<br />' +
                '' +
                '    Please wait!<br/>' +
                '    <img src="../WebGlGraph/media/ajax-loader.gif" alt="loading" /></p>' +
                '</div>';

        jQuery('#eexcess_main_panel').addClass("webglview");
        $root.append(inner_html);
    };

    // indexArray: array with items' indices to highlight. They match items in receivedData (parameter in Render.draw)
    WebGlCollectionsPlugin.highlightItems = function (indexArray) {
    };

    WebGlCollectionsPlugin.finalize = function () {
    };

    PluginHandler.registerVisualisation(WebGlCollectionsPlugin, {
        'displayName': 'WebGl-Collections'
    });


})();



function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
}