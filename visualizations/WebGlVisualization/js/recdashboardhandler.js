var GLVIS = GLVIS || {};


GLVIS.RecDashboardHandler = function(){
    
    
};

/**
 * Handles visualization of click on collection in rec-dashboard html
 * @param {GLVIS.Collection} collection
 */
GLVIS.RecDashboardHandler.prototype.onCollectionClick = function(collection){
     jQuery('#webgl_info_title').html('Query/Collection #' + collection.getId());

    var info_content_container = jQuery('#webgl_info_content');
    info_content_container.html("");
};


/**
 * Handles visualization of click on result in rec-dashboard html
 * @param {GLVIS.Result} result
 */
GLVIS.RecDashboardHandler.prototype.onResultClick = function(result){
     jQuery('#webgl_info_title').html('Result #' + result.getId());

    var info_content_container = jQuery('#webgl_info_content');
    info_content_container.html("");
};
