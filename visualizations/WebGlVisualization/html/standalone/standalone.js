var canvas1, textElm;

jQuery(document).ready(function () {
    GLVIS.InitHandler.init(jQuery('body'), "../../", function () {

        GLVIS.Debugger.debug("standalone", "Finished initializing scene. Callback", 3);
    });



    jQuery('input[type=range]').change(function () {

        var camera = GLVIS.Scene.getCurrentScene().getWebGlHandler().getCamera();

        jQuery('#rangevalnear').html(jQuery('#cameracontrol_near').val());
        jQuery('#rangevalfar').html(jQuery('#cameracontrol_far').val());

        //camera.near = parseInt(jQuery('#cameracontrol_near').val());
        //camera.far = parseInt(jQuery('#cameracontrol_far').val());
        
        /*
        camera.position.x = parseInt(jQuery('#cameracontrol_x').val());
        camera.position.y = parseInt(jQuery('#cameracontrol_y').val());
        camera.position.z = parseInt(jQuery('#cameracontrol_z').val());
        */
        
        camera.rotation.y = parseFloat(jQuery('#cameracontrol_roty').val());
       
        camera.updateProjectionMatrix();    
        GLVIS.Scene.getCurrentScene().getWebGlHandler().render();
    });




});