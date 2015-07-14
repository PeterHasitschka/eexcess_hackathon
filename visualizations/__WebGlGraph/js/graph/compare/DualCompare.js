
var GLGR = GLGR || {};


/**
*   DEPRECATED (?)
**/

/**
 * Constructor of a Simple Compare Class to compare two graphs.
 * Two graphs are getting compared by looking at the results of their query.
 * Changed nodes are highlighted (or similar).
 * Automatically starts comparing if two graphs are selected and the compare-
 * button gets clicked
 */
GLGR.DualCompare = function () {

    this.button = jQuery("#webgl_status_bar_buttoncompare_dual");

    this.graphs_ = {g1: null, g2: null};


    jQuery(document).ready(function () {

        var that = GLGR.DualCompare.getSingleton();
        jQuery(that.button).click(function () {
            that.handleClick();
        });
    });
};


/**
 * Just for checking if 2 Graphs are selected.
 * If so -> Show compare button, else hide.
 */
GLGR.DualCompare.prototype.manageCompareButton = function () {

    var select_count = this.getSelectedGraphs_().length;
    
    if (select_count === 2)
        this.button.show();
    else
    {
        this.button.hide();
        this.graphs_.g1 = null;
        this.graphs_.g2 = null;
    }
};

/**
 * Searching the two graphs and init compare after clicking the Compare-Button
 */
GLGR.DualCompare.prototype.handleClick = function () {

    var selected_graphs = this.getSelectedGraphs_();

    if (selected_graphs.length !== 2)
        throw ("Error in handling compare button! Size is " +
                selected_graphs.length + " instead of 2");

    this.graphs_.g1 = selected_graphs[0];
    this.graphs_.g2 = selected_graphs[1];

    this.compare();


};



GLGR.DualCompare.prototype.compare = function () {

    GLGR.Scene.getCurrentScene().allow_rec_color_overwrites = true;
    
    if (!this.graphs_.g1 || !this.graphs_.g2)
        throw("Can't compare - At least 1 Graph not set!");


    var recs_1 = [];
    for (var i = 0; i < this.graphs_.g1.getRecommendations().length; i++)
        recs_1.push(this.graphs_.g1.getRecommendations()[i].getId());

    var recs_2 = [];
    for (var i = 0; i < this.graphs_.g2.getRecommendations().length; i++)
        recs_2.push(this.graphs_.g2.getRecommendations()[i].getId());


    var color_positive = GLGR.Recommendation.vis_params.node_color_positive;
    var color_negative = GLGR.Recommendation.vis_params.node_color_negative;


    for (var i = 0; i < recs_1.length; i++) {
        var curr_rec = this.graphs_.g1.getRecommendations()[i];
        if (jQuery.inArray(recs_1[i], recs_2) !== -1) {
            curr_rec.setColorOverwrite(color_positive);
            console.log(curr_rec.getId() + " also in G2");
        }
        else
            curr_rec.setColorOverwrite(color_negative);
    }
    for (var i = 0; i < recs_2.length; i++) {
        var curr_rec = this.graphs_.g2.getRecommendations()[i];
        if (jQuery.inArray(recs_2[i], recs_1) !== -1) {
            curr_rec.setColorOverwrite(color_positive);
            console.log(curr_rec.getId() + " also in G1");
        }
        else
            curr_rec.setColorOverwrite(color_negative);
    }

};


/**
 * Finding two selected graphs.
 * @return {array} holding all selected graphs
 */
GLGR.DualCompare.prototype.getSelectedGraphs_ = function () {

    var scene = GLGR.Scene.getCurrentScene();

    var graphs = scene.getGraphs();

    var out_graphs = [];
    for (var i = 0; i < graphs.length; i++) {

        /** @type {GLGR.Graph} **/
        var curr_graph = graphs[i];

        if (curr_graph.getIsSelected()) {
            out_graphs.push(curr_graph);
        }
    }

    return out_graphs;
};