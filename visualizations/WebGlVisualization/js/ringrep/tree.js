var GLVIS = GLVIS || {};


GLVIS.RingTree = function (recs) {

    GLVIS.Debugger.debug("RingTree",
            "Creating Ring Tree", 3);

    this.recs_ = recs;
    this.data_structure_ = GLVIS.config.collection.ring.data;

    this.tree_ = null;

    this.buildBasicTree_();
};


/**
 * Building an (unordered) tree with the specified structure as inner nodes
 * holding the recommendations as leafs
 */
GLVIS.RingTree.prototype.buildBasicTree_ = function () {

    GLVIS.Debugger.debug("RingTree",
            "Building ring-tree", 3);

    var tree = {
        id: null,
        children: []
    };
    for (var order in this.data_structure_) {

        //Only ints as key allowed. They represent the order
        if (Number(order) !== parseInt(order))
            continue;

        var structure = this.data_structure_[order];


        tree.children.push(this.getChildNodes_(this.recs_, structure));
    }

    GLVIS.Debugger.debug("RingTree", tree, 3);
    this.tree_ = tree;
};

/**
 * Separating recommendations by a specified key.
 * @param {Array} recs Holding the @see{GLVIS.Recommendation} nodes to separate
 * @param {type} structure Config value holding id (key) and type (e.g. 'facet')
 * @returns {Object}
 */
GLVIS.RingTree.prototype.getChildNodes_ = function (recs, structure) {

    GLVIS.Debugger.debug("RingTree", [recs, structure], 5);

    var sorted_recs = {};

    for (var i = 0; i < recs.length; i++) {

        /** @type{GLVIS.Recommendation} **/
        var curr_rec = recs[i];
        var rec_val = this.getValue(curr_rec, structure);

        if (sorted_recs[rec_val] === undefined)
            sorted_recs[rec_val] = [];

        sorted_recs[rec_val].push(curr_rec);


    }
    
    
    var children = [];
    
    for (var key in sorted_recs) {
        console.log(key, sorted_recs[key]);
    }
    
    var tree = {
        id: structure,
        children: children
    };

    return tree;
};




GLVIS.RingTree.prototype.getValue = function (rec, structure) {

    switch (structure.type) {

        case "facet" :

            var eexcess_data = rec.getEexcessData();

            if (!eexcess_data)
                throw ("ERROR: NO EEXCESS DATA FOUND");

            var id = structure.id;
            var val = eexcess_data.result.facets[id];
            return val;

            break;

        default:
            throw ("ERROR: TYPE " + structure.type + " UNKNOWN");

    }

};