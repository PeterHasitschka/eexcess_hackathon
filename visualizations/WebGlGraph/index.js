 jQuery(document).ready(function () {
                /** @type {GLGR.Scene} **/
                myScene = new GLGR.Scene(jQuery('#canvas_container')[0]);




                var last_query = null;



                for (var query_count = 0; query_count < 1; query_count++)
                {
                    /** @type {GLGR.Graph} **/
                    var tmp_query = new GLGR.Graph("Query #" + (query_count + 1));




                    //var num_recs = Math.floor(Math.random() * 100);
                    var num_recs = 1000;
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



                myScene.buildScene();

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