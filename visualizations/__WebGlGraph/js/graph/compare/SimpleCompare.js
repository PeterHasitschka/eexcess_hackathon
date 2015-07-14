
var GLGR = GLGR || {};




/**
 * Constructor of a Simple Compare Class to compare all graphs in one row
 * A graph is getting compared with its parent 
 * by looking at the results of their query.
 * Changed nodes are highlighted (or similar).
 * Automatically starts comparing if two graphs are selected and the compare-
 * button gets clicked
 */
GLGR.SimpleCompare = function () {

    this.button = jQuery("#webgl_status_bar_buttoncompare_simple");

    var that = this;
    jQuery(document).ready(function () {


        jQuery(that.button).click(function () {
            that.handleClick();
        });
    });
};

/**
 * compare after clicking the Compare-Button
 */
GLGR.SimpleCompare.prototype.handleClick = function () {

    if (!GLGR.Scene.getCurrentScene().allow_rec_color_overwrites)
        this.compare();
    else
        GLGR.Scene.getCurrentScene().allow_rec_color_overwrites = false;
};



GLGR.SimpleCompare.prototype.compare = function () {

    GLGR.Scene.getCurrentScene().allow_rec_color_overwrites = true;

    var graphs = GLGR.Scene.getCurrentScene().getGraphs();

    for (var i = 0; i < graphs.length; i++)
    {
        /** @type {GLGR.Graph} **/
        var g1 = graphs[i];

        /** @type {GLGR.Graph} **/
        var g2 = g1.getParent();

        //Has no parent
        if (!g2)
            continue;

        var recs_1 = [];
        for (var j = 0; j < g1.getRecommendations().length; j++)
            recs_1.push(g1.getRecommendations()[j].getId());

        var recs_2 = [];
        for (var j = 0; j < g2.getRecommendations().length; j++)
            recs_2.push(g2.getRecommendations()[j].getId());


        var color_positive = GLGR.Recommendation.vis_params.node_color_positive;
        var color_negative = GLGR.Recommendation.vis_params.node_color_negative;


        for (var j = 0; j < recs_1.length; j++) {
            var curr_rec = g1.getRecommendations()[j];
            if (jQuery.inArray(recs_1[j], recs_2) !== -1) {
                curr_rec.setColorOverwrite(color_positive);
                console.log(curr_rec.getId() + " also in G2");
            }
            else
                curr_rec.setColorOverwrite(color_negative);
        }
    }
};


/**
 * Finding two selected graphs.
 * @return {array} holding all selected graphs
 */
GLGR.SimpleCompare.prototype.getSelectedGraphs_ = function () {

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