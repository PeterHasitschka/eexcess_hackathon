var GLIVS = GLVIS || {};



GLVIS.DirectCompare = function () {

    GLVIS.Debugger.debug("DirectCompare", "Created Direct-Comparer", 5);

};



GLVIS.DirectCompare.prototype.activate = function () {

    GLVIS.Debugger.debug("DirectCompare", "Activating Direct-Compare on the scene", 5);

    var collections = GLVIS.Scene.getCurrentScene().getCollections();

    var percents = [];

    for (var col_count = 0; col_count < collections.length; col_count++) {
        var curr_col = collections[col_count];
        this.compareCollection_(curr_col);
    }
};

GLVIS.DirectCompare.prototype.deactivate = function () {

    GLVIS.Debugger.debug("DirectCompare", "Deactivating Direct-Compare on the scene", 5);

    var collections = GLVIS.Scene.getCurrentScene().getCollections();


    for (var col_count = 0; col_count < collections.length; col_count++) {

        var curr_col = collections[col_count];
        this.resetCollection_(curr_col);
    }
};

GLVIS.DirectCompare.prototype.compareCollection_ = function (collection) {

    var recs = collection.getRecommendations();
    for (var rec_count = 0; rec_count < recs.length; rec_count++) {

        var curr_rec = recs[rec_count];

        var color = parseInt(Math.random() * 0xFFFFFF);
        curr_rec.setColor(color);
    }

    this.removeBarFromCollection_(collection);
    var compare_bar = new GLVIS.DirectCompareBar(collection, 42);
    this.addBarToCollection_(collection, compare_bar);
};

GLVIS.DirectCompare.prototype.resetCollection_ = function (collection) {

    var recs = collection.getRecommendations();
    var default_color = GLVIS.config.collection.recommendation.color;

    for (var rec_count = 0; rec_count < recs.length; rec_count++) {

        var curr_rec = recs[rec_count];

        var color = parseInt(default_color);
        curr_rec.setColor(color);
    }
    
    this.removeBarFromCollection_(collection);
};

/**
 * Remove @see{GLVIS.DirectCompareBar} from Collection
 * @param {GLVIS.Collection} collection
 */
GLVIS.DirectCompare.prototype.removeBarFromCollection_ = function (collection) {

    var gl_objs = collection.getGlObjects();

    for (var key = 0; key < gl_objs.length; key++) {
        var curr_gl_obj = gl_objs[key];

        if (curr_gl_obj instanceof GLVIS.DirectCompareBar) {
            curr_gl_obj.delete();
            gl_objs.splice(key, 1);
            collection.setIsDirty(true);
            return;
        }
    }
};

/**
 * Add @see{GLVIS.DirectCompareBar} to Collection
 * @param {GLVIS.Collection} collection
 */
GLVIS.DirectCompare.prototype.addBarToCollection_ = function (collection, bar) {

    var gl_objs = collection.getGlObjects();
    gl_objs.push(bar);
    collection.setIsDirty(true);
};