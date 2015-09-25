var GLVIS = GLVIS || {};


GLVIS.AnimationDebugger = function () {

    this.active = false;

    var container = "" +
            "<div id='animationdebugcontainer' class='inactive'>" +
            " <div id='animationdebughead'>" +
            "   <h3>Animations</h3>" +
            "<p><a id = 'animationdebugtogglebutton' href='#'>Activate</a></p>" +
            " </div>" +
            " <div id='animationdebugcontent'>" +
            " </div>" +
            "</div>";

    jQuery('body').append(container);


    jQuery('#animationdebugtogglebutton').click(function () {
        this.active = !this.active;
        
        jQuery('#animationdebugcontainer').addClass(this.active ? "" : "inactive");
        jQuery('#animationdebugcontainer').removeClass(this.active ? "inactive" : "");
        
        jQuery('#animationdebugtogglebutton').html(this.active ? "Deactivate" : "Activate")
        
    }.bind(this));
};


GLVIS.AnimationDebugger.prototype.update = function () {


    var active_anims = GLVIS.Scene.getCurrentScene().getAnimation().animations_;

    var htmlrows = "<div class='animationdebugrow'>" +
            "   <div class='animationdebugrow_id'><strong>ID</strong></div>" +
            "   <div class='animationdebugrow_goal'><strong>GOAL</strong></div>" +
            "   <div class='animationdebugrow_curr'><strong>CURRENT</strong></div>" +
            "   <div class='animationdebugrow_th'><strong>THRESHOLD</strong></div>" +
            "   <div class='animationdebugrow_iterations'><strong>ITER.</strong></div>" +
            "</div>";


    if (this.active) {
        for (var i = 0; i < active_anims.length; i++) {

            var anim = active_anims[i];

            var curr = anim.getter_fct(anim.object);

            var row = "<div class='animationdebugrow'>" +
                    "   <div class='animationdebugrow_id'>" + anim.identifier + "</div>" +
                    "   <div class='animationdebugrow_goal'>" + anim.goal + "</div>" +
                    "   <div class='animationdebugrow_curr'>" + curr + "</div>" +
                    "   <div class='animationdebugrow_th'>" + anim.threshold + "</div>" +
                    "   <div class='animationdebugrow_iterations'>" + anim.iterations + "</div>" +
                    "</div>";

            htmlrows += row;
        }
    }




    jQuery('#animationdebugcontent').html(htmlrows);


};