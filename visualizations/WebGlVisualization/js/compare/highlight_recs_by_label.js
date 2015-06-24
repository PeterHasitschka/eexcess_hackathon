

var GLVIS = GLVIS || {};



GLVIS.HighlightRecsByLabel = function (collection) {

    GLVIS.Debugger.debug("HighlightRecsByLabel", "Created highlighter", 2);
    /** @type{GLVIS.Collection} **/
    this.collection_ = collection;

    this.current_highlight_ = null;

};


GLVIS.HighlightRecsByLabel.prototype.highlight = function (label) {

    this.current_highlight_ = label;

    var recs = this.collection_.getRecommendations();
    for (var i = 0; i < recs.length; i++) {

        /** @type{GLVIS.Recommendation} **/
        var curr_rec = recs[i];

        curr_rec.setColor(Math.random() * 0xFF0000);
    }
};

GLVIS.HighlightRecsByLabel.prototype.unHighlight = function () {

    this.current_highlight_ = null;

    var recs = this.collection_.getRecommendations();
    for (var i = 0; i < recs.length; i++) {

        /** @type{GLVIS.Recommendation} **/
        var curr_rec = recs[i];

        curr_rec.setColor(GLVIS.config.collection.recommendation.color);
    }
};

GLVIS.HighlightRecsByLabel.prototype.getCurrentHighlightedLabel = function(){
    return this.current_highlight_;
};