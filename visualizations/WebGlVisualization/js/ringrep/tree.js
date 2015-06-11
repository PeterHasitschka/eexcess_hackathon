var GLVIS = GLVIS || {};


GLVIS.RingTree = function (recs) {

    GLVIS.Debugger.debug("RingTree",
            "Creating Ring Tree", 3);

    this.recs_ = recs;
    this.data_structure_ = GLVIS.config.collection.ring.data;

    this.tree_ = null;

    this.ring_structure_ = null;
    this.buildBasicTree_();
};


/**
 * Building an (unordered) tree with the specified structure as inner nodes
 * holding the recommendations as leafs
 */
GLVIS.RingTree.prototype.buildBasicTree_ = function () {

    GLVIS.Debugger.debug("RingTree",
            "Building ring-tree", 3);

    //Smallest level (=key) in config
    var level_to_start = 1;
    var tree = this.getSubtree_(this.recs_, this.data_structure_, level_to_start, null);

    GLVIS.Debugger.debug("RingTree", tree, 3);
    this.tree_ = tree;
};


/**
 * Separating recommendations recursively by a specified key.
 * @param {Array} recs Holding the @see{GLVIS.Recommendation} nodes to separate
 * @param {object} structures Config values holding id (key) and type (e.g. 'facet') @see{GLVIS.config.collection.ring.data}
 * @param {integer} current_depth Current structure id. Beware that these may not be 0...n indizies.
 * @param {string} val Current value. Just for storing in tree
 * @returns {Object}
 */
GLVIS.RingTree.prototype.getSubtree_ = function (recs, structures, current_depth, val) {

    var structure = structures[current_depth];

    if (!structure) {
        GLVIS.Debugger.debug("RingTree", ["Did not find a substructure for level " + current_depth, structures, val], 7);
    }

    GLVIS.Debugger.debug("RingTree", ["Calling treebuilder, level " + current_depth, structure, val], 7);

    var sorted_recs = {};

    //Collect recommendations 
    if (structure)
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
        var subtree = this.getSubtree_(sorted_recs[key], structures, current_depth + 1, key);
        children.push(subtree);
        subtree.my_val = key;
        subtree.my_id = structure;

        //GLVIS.Debugger.debug("RingTree", "Found no subtree anymore... Level " + current_depth, 5);
    }

    var tree = {
        children_separate_id: structure,
        children: children,
        recs: recs
    };
    return tree;
};



/**
 * Get a specific value from the recommendation, defined by "type" in the structure
 * @param {GLVIS.Recommendation} rec
 * @param {object} structure holding "id" and "type"
 * @returns {string} Value
 */
GLVIS.RingTree.prototype.getValue = function (rec, structure) {

    switch (structure.type) {

        case "facet" :
            var eexcess_data = rec.getEexcessData();

            if (!eexcess_data)
                throw ("ERROR: NO EEXCESS DATA FOUND");

            if (!eexcess_data.result.facets)
                return "NO_FACETS";

            var id = structure.id;
            var val = eexcess_data.result.facets[id];
            return val;

            break;

        default:
            throw ("ERROR: TYPE " + structure.type + " UNKNOWN");
    }
};


/**
 * Return array with all nodes ordered by level
 * @returns {Array}
 */
GLVIS.RingTree.prototype.getRingStructure = function () {

    if (!this.tree_)
        throw ("Tree not initialized");

    if (this.ring_structure_)
        return this.ring_structure_;

    var collected = [];

    var ring_level = 0;
    this.collectChildrenForRingStructure_(this.tree_, collected, ring_level);

    this.ring_structure_ = collected;
    return this.ring_structure_;
};


/**
 * 
 * @param {object} node Node from tree
 * @param {array} collected Recursively collected data.
 * @param {type} ring_level
 * @returns {undefined}
 */
GLVIS.RingTree.prototype.collectChildrenForRingStructure_ = function (node, collected, ring_level) {

    GLVIS.Debugger.debug("RingTree", ["Collecting ring structure ", ring_level], 7);

    //The node position describes a value between 0 and 1 where the ring segment will start.
    //Necessary for the position of the children
    if (node.position === undefined || node.position === null)
        node.position = 0.0;

    if (node.parent_length === undefined || node.parent_length === null)
        node.parent_length = 1;

    var seg_length = (1 / node.children.length) * node.parent_length;
    /*
     console.log("RL " + ring_level, " NP " + node.position
     + " NCL " + node.children.length
     + " SL " + seg_length
     + " NPL " + node.parent_length);
     */


    for (var i = 0; i < node.children.length; i++) {

        if (collected[ring_level] === undefined)
            collected[ring_level] = [];

        var subtree = node.children[i];

        subtree.position = node.position + i * seg_length;
        subtree.parent_length = seg_length;

        this.collectChildrenForRingStructure_(subtree, collected, ring_level + 1);
        collected[ring_level].push(subtree);
    }

};