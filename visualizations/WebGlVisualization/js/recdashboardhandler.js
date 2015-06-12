var GLVIS = GLVIS || {};


GLVIS.RecDashboardHandler = function () {

    this.last_clicked_rec = null;
    this.last_clicked_col = null;

};

/**
 * Handles visualization of click on collection in rec-dashboard html
 * @param {GLVIS.Collection} collection
 */
GLVIS.RecDashboardHandler.prototype.onCollectionClick = function (collection) {
    jQuery('#webgl_info_title').html('Query/Collection #' + collection.getId());

    var info_content_container = jQuery('#webgl_info_content');
    info_content_container.html("");

    this.last_clicked_col = collection;

    this.hideRecButtons_();
};


/**
 * Handles visualization of click on recommendation in rec-dashboard html
 * @param {GLVIS.Recommendation} recommendation
 */
GLVIS.RecDashboardHandler.prototype.onRecommendationClick = function (recommendation) {
    jQuery('#webgl_info_title').html('Recommendation #' + recommendation.getId());

    var info_content_container = jQuery('#webgl_info_content');
    info_content_container.html("");

    this.last_clicked_rec = recommendation;

    this.showRecButtons_();
};



GLVIS.RecDashboardHandler.prototype.hideRecButtons_ = function () {
    jQuery('#webgl_toolbar_btn_rec_focusparentcol').hide();
};

GLVIS.RecDashboardHandler.prototype.showRecButtons_ = function () {
    jQuery('#webgl_toolbar_btn_rec_focusparentcol').show();
};




jQuery('#webgl_toolbar_btn_rec_focusparentcol').click(function () {

    var rdbh = GLVIS.Scene.getCurrentScene().getRecDashboardHandler();

    var rec = rdbh.last_clicked_rec;
    var col = rec.getCollection();
    col.selectAndFocus();

    rdbh.hideRecButtons_();
});