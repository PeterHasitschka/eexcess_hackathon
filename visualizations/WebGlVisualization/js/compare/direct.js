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

    var config = GLVIS.config.collection.compare;
    var recs = collection.getRecommendations();

    var parent_rec_ids = this.getParentsRecIds_(collection);

    var found_num_recs_in_parent = 0;

    for (var rec_count = 0; rec_count < recs.length; rec_count++) {

        var curr_rec = recs[rec_count];

        var eexcess_rec_id = curr_rec.getEexcessData().result.id;

        var found_in_parent = false;
        if (parent_rec_ids.indexOf(eexcess_rec_id) >= 0)
            found_in_parent = true;

        var color = config.color_neg;
        if (found_in_parent) {
            color = config.color_pos;
            found_num_recs_in_parent++;
        }
        curr_rec.setColor(color);
    }

    var percent_found = found_num_recs_in_parent / recs.length * 100;

    this.removeBarFromCollection_(collection);
    var compare_bar = new GLVIS.DirectCompareBar(collection, percent_found);
    this.addBarToCollection_(collection, compare_bar);
};

/**
 * Returns a list of all eexcess-recommendation-ids of the parent's recommendations
 * @param {GLVIS.Collection} collection
 * @returns {Array} holding all eexcess-recommendation-ids of the parent collection
 */
GLVIS.DirectCompare.prototype.getParentsRecIds_ = function (collection) {

    var parent_id = collection.getParentId();

    if (parent_id === null)
        return [];

    var parent_collection = GLVIS.Scene.getCurrentScene().getCollection(parent_id);

    if (!parent_collection)
        throw ("ERROR: CAN'T LOAD COLLECTION WITH ID " + parent_id);

    var parent_recs = parent_collection.getRecommendations();

    var rec_ids = [];
    for (var i = 0; i < parent_recs.length; i++) {
        rec_ids.push(parent_recs[i].getEexcessData().result.id);
    }

    return rec_ids;
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