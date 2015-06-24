

var GLVIS = GLVIS || {};


/**
 * Highlighting recommendations of a collection if the given label exists in the rec
 * @param {type} collection
 * @returns {undefined}
 */
GLVIS.HighlightRecsByLabel = function (collection) {

    GLVIS.Debugger.debug("HighlightRecsByLabel", "Created highlighter", 2);
    /** @type{GLVIS.Collection} **/
    this.collection_ = collection;
    this.current_highlight_ = null;
};

/**
 * Highlight recs that have the label-text in Title
 * @param {GLVIS.Text} label to be searched
 */
GLVIS.HighlightRecsByLabel.prototype.highlight = function (label) {

    this.current_highlight_ = label.getText();

    var recs = this.collection_.getRecommendations();
    for (var i = 0; i < recs.length; i++) {

        /** @type{GLVIS.Recommendation} **/
        var curr_rec = recs[i];

        /**
         * Currently look if label in title, due to no labels existing in rec
         */
        var ee_data = curr_rec.getEexcessData();
        var title = ee_data.result.title.toLowerCase();
        var title_words = title.split(" ");

        var lc_label_text = label.getText().toLowerCase();

        GLVIS.Debugger.debug("HighlightRecsByLabel", [
            "Searching for label " + lc_label_text + "' in title:", title_words], 6);
        if (title_words.indexOf(lc_label_text) !== -1) {

            GLVIS.Debugger.debug("HighlightRecsByLabel",
                    "Highlighting rec " + curr_rec.getId() + " for label " + lc_label_text, 4);

            curr_rec.setColor(GLVIS.config.collection.recommendation.highlight_color);
        }
    }
};

/**
 * Reset Highlight. (Give the recs their config-color back)
 */
GLVIS.HighlightRecsByLabel.prototype.unHighlight = function () {

    this.current_highlight_ = null;

    var recs = this.collection_.getRecommendations();
    for (var i = 0; i < recs.length; i++) {

        /** @type{GLVIS.Recommendation} **/
        var curr_rec = recs[i];
        curr_rec.setColor(GLVIS.config.collection.recommendation.color);
    }
};

/**
 * Return the current highlighted label text
 * @returns {String | null}
 */
GLVIS.HighlightRecsByLabel.prototype.getCurrentHighlightedLabel = function () {
    return this.current_highlight_;
};