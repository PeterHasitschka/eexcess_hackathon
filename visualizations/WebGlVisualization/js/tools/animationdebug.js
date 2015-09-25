var GLVIS = GLVIS || {};


GLVIS.AnimationDebugger = function () {

    var container = "" +
            "<div id='animationdebugcontainer'>" +
            " <div id='animationdebughead'>" +
            "   <h3>Animations</h3>" + 
            " </div>" +
            " <div id='animationdebugcontent'>" +
            " </div>" +
            "</div>";

    jQuery('body').append(container);

};


GLVIS.AnimationDebugger.prototype.update = function(){
    
    
    var active_anims = GLVIS.Scene.getCurrentScene().getAnimation().animations_;
    
    var htmlrows = "";
    for (var i=0; i < active_anims.length; i++) {
        
        var anim = active_anims[i];
        
        var curr = anim.getter_fct(anim.object);
        
        var row = "<div class='animationdebugrow'>" +
                "   <div class='animationdebugrow_id'>" + anim.identifier + "</div>" +
                "   <div class='animationdebugrow_goal'>" + anim.goal + "</div>" +
                "   <div class='animationdebugrow_curr'>" + curr + "</div>" +
                "   <div class='animationdebugrow_th'>" + anim.threshold + "</div>" +
                "</div>";
        
        htmlrows += row;
    }
    
    
    jQuery('#animationdebugcontent').html(htmlrows);

    
};