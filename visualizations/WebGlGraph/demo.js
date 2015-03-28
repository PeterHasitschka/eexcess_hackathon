
var myScene;

jQuery(document).ready(function () {
    /** @type {GLGR.Scene} **/
    myScene = new GLGR.Scene(jQuery('#canvas_container')[0]);




    var last_query = null;


    var q_create = 2;

    for (var query_count = 0; query_count < q_create; query_count++)
    {
        /** @type {GLGR.Graph} **/
        var tmp_query = new GLGR.Graph("Query #" + (query_count + 1));

        var query_active = false;
        if (query_count + 1 === q_create)
            query_active = true;

        tmp_query.setIsActive(query_active);

        //var num_recs = Math.floor(Math.random() * 100);
        var num_recs = 3;
        for (var rec_count = 0; rec_count < num_recs; rec_count++)
        {

            var rec_data = {
                title: "something" + Math.random() * 100,
                url: "http://www.tugraz.at/dummy" + Math.random() * 100 + ".html"
            };

            /** @type {GLGR.Recommendation} **/
            var tmp_rec = new GLGR.Recommendation("rec-" + rec_count, rec_data);

            tmp_query.addRecommendation(tmp_rec);
        }




        tmp_query.setParent(last_query);
        last_query = tmp_query;

        myScene.addGraph(tmp_query);
    }



    //myScene.buildScene();

    animate();
});


function animate() {

    requestAnimationFrame(animate);
    myScene.render();
}




jQuery(document).ready(function () {

    jQuery("#demo_modify_link").click(function () {
        changeWeightsDemo();
    });
    jQuery("#toggle_animation_link").click(function () {
        GLGR.animation_demo_flag = !GLGR.animation_demo_flag;
    });
    jQuery("#toggle_isactive").click(function () {
        var is_act = GLGR.Scene.getSingleton().getGraphs()[0].is_active_;
        GLGR.Scene.getSingleton().getGraphs()[0].setIsActive(!is_act);
        console.log("Changed active to " + !is_act);
    });



    jQuery("#add_graph").click(function () {


        /** @type {GLGR.Graph} **/
        var tmp_query = new GLGR.Graph("New added");

        tmp_query.setIsActive(true);

        var num_recs = 55;
        for (var rec_count = 0; rec_count < num_recs; rec_count++)
        {

            var rec_data = {
                title: "something" + Math.random() * 100,
                url: "http://www.tugraz.at/dummy" + Math.random() * 100 + ".html"
            };

            /** @type {GLGR.Recommendation} **/
            var tmp_rec = new GLGR.Recommendation("rec-" + rec_count, rec_data);

            tmp_query.addRecommendation(tmp_rec);
        }



        var graphs = myScene.getGraphs();

        tmp_query.setParent(graphs[graphs.length - 1]);

        myScene.addGraph(tmp_query);
        myScene.calculate2DPositionsOfGraphs();
    });


    jQuery("#add_rec").click(function () {

        var graphs = myScene.getGraphs();

        /** @type {GLGR.Graph} **/
        var lastgraph = graphs[graphs.length - 1];

        var tmp_rec = new GLGR.Recommendation("rec-NEW", {});
        lastgraph.addRecommendation(tmp_rec, true);
        tmp_rec.initWegGlObjects();
    });


});



function changeWeightsDemo() {


    var all_graphs = myScene.getGraphs();
    /** @type {GLGR.Graph} **/
    var graph_to_choose = all_graphs[0];
    var all_recs = graph_to_choose.getRecommendations();
    for (var i = 0; i < all_recs.length; i++)
    {

        /** @type {GLGR.Recommendation} **/
        var rec_to_choose = all_recs[i];
        rec_to_choose.setWeight((Math.random() + 0.5));
    }
}