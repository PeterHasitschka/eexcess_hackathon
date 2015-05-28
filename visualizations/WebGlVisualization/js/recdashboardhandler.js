var GLVIS = GLVIS || {};










GLVIS.RecDashboardHandler = function () {


};



/**
 * Handles visualization of click on collection in rec-dashboard html
 * @param {GLVIS.Collection} collection
 */
GLVIS.RecDashboardHandler.prototype.onCollectionClick = function (collection) {
    jQuery('#webgl_info_title').html('Query/Collection #' + collection.getId());

    var info_content_container = jQuery('#webgl_info_content');
    info_content_container.html("");
};


/**
 * Handles visualization of click on recommendation in rec-dashboard html
 * @param {GLVIS.Recommendation} recommendation
 */
GLVIS.RecDashboardHandler.prototype.onRecommendationClick = function (recommendation) {
    jQuery('#webgl_info_title').html('Recommendation #' + recommendation.getId());

    var info_content_container = jQuery('#webgl_info_content');
    info_content_container.html("");
};

/**
 * Create DB-Handler and Scene. 
 * @param {GLVIS.Scene} scene
 * @param {GLVIS.DbHandler} db_handler
 */
GLVIS.RecDashboardHandler.initScene = function (scene, db_handler) {

    scene = new GLVIS.Scene(jQuery(GLVIS.config.rec_dashboard.selector));
    db_handler = new GLVIS.DbHandler();

    db_handler.loadQueries(function () {

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




GLVIS.RecDashboardHandler.cleanup = function () {
    
    console.log("RECDASHBOARD: CLEANUP!");
    
    delete GLVIS.Scene.getCurrentScene();
    GLVIS.Scene.current_scene = null;

    delete GLVIS.DbHandler.getCurrentDbHandler();
    GLVIS.DbHandler.current_db_handler_ = null;
};