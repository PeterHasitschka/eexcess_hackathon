
var myScene;





jQuery(document).ready(function () {
    /** @type {GLGR.Scene} **/
    myScene = new GLGR.Scene(jQuery('#canvas_container')[0]);

    var add_random = false;


    if (!add_random)
    {


        /** @type {GLGR.Graph} **/
        var q1 = new GLGR.Graph("1");
        var q2 = new GLGR.Graph("2");
        var q3a = new GLGR.Graph("3a");
        var q3b = new GLGR.Graph("3b");
        var q4 = new GLGR.Graph("4");
        var q5 = new GLGR.Graph("5");

        q1.setIsActive(0);
        q2.setIsActive(0);
        q3a.setIsActive(0);
        q3b.setIsActive(0);
        q4.setIsActive(1);
        q5.setIsActive(1);

        addSomeRandomRecs(q1);
        addSomeRandomRecs(q2);
        addSomeRandomRecs(q3a);
        addSomeRandomRecs(q3b);
        addSomeRandomRecs(q4);
        addSomeRandomRecs(q5);






        q2.setParent(q1);
        q3a.setParent(q2);
        q3b.setParent(q2);
        q4.setParent(q3a);
        q5.setParent(q4);
        
        
        myScene.addGraph(q3a);
        myScene.addGraph(q1);
        myScene.addGraph(q4);
        myScene.addGraph(q3b);
        myScene.addGraph(q5);
        myScene.addGraph(q2);

    }
    else
    {

        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 100; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));




        var lastgr = null;

        for (var i = 0; i < 100; i++)
        {
            var graph = new GLGR.Graph("banana banana banana " + text);
            addSomeRandomRecs(graph);
            graph.setParent(lastgr);
            
            myScene.addGraph(graph);
            lastgr = graph;
        }

    }



    animate();

});



function addSomeRandomRecs(graph)
{
    var num_recs = 10;
    for (var rec_count = 0; rec_count < num_recs; rec_count++)
    {

        var rec_data = {
            title: "something" + Math.random() * 40,
            url: "http://www.tugraz.at/dummy" + Math.random() * 100 + ".html"
        };

        /** @type {GLGR.Recommendation} **/
        var tmp_rec = new GLGR.Recommendation("rec-" + rec_count, rec_data);

        graph.addRecommendation(tmp_rec);
    }
}

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
        var is_act = GLGR.Scene.getCurrentScene().getGraphs()[0].is_active_;
        GLGR.Scene.getCurrentScene().getGraphs()[0].setIsActive(!is_act);
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
    });


    jQuery("#add_rec").click(function () {

        var graphs = myScene.getGraphs();

        /** @type {GLGR.Graph} **/
        var lastgraph = graphs[graphs.length - 1];

        var tmp_rec = new GLGR.Recommendation("rec-NEW", {});
        lastgraph.addRecommendation(tmp_rec, true);
        tmp_rec.initWegGlObjects();
    });


    jQuery("#addconnection").click(function () {

        var graphs = myScene.getGraphs();

        /** @type {GLGR.Graph} **/
        var lastgraph = graphs[graphs.length - 2];

        var newgraph = new GLGR.Graph("x");
        newgraph.setParent(lastgraph);
        addSomeRandomRecs(newgraph);
        myScene.addGraph(newgraph);

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