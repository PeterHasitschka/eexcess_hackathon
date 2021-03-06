var GLGR = GLGR || {};


GLGR.ConnectionAbstract = function () {


    this.last_pos = {
        src: {
            x: null,
            y: null
        },
        dst: {
            x: null,
            y: null
        }
    };

    this.vis_data = {
        width: null,
        bold_width: null,
        color: null,
        z: null
    };

    this.line_mesh_ = null;

    this.is_visible_ = null;
    this.is_bold = false;
    
    this.force_update_ = false;
};



GLGR.ConnectionAbstract.prototype.update = function () {

    var pos = {};
    pos.src = this.getPosSrc();
    pos.dst = this.getPosDst();


    //At least on position not available -> return
    if (!(pos.src && pos.dst))
        return;

    if (!this.line_mesh_)
        this.createMesh_();


    var line_needs_update = false;

    if (
            this.last_pos.src.x !== pos.src.x ||
            this.last_pos.src.y !== pos.src.y ||
            this.last_pos.dst.x !== pos.dst.x ||
            this.last_pos.dst.y !== pos.dst.y
            )
        line_needs_update = true;

    if (this.force_update_)
    {
        line_needs_update = true;
        this.force_update_ = false;
    }


    //Only update if changed
    if (line_needs_update)
    {
        this.line_mesh_.geometry.vertices[0].set(pos.src.x, pos.src.y, this.vis_data.z);
        this.line_mesh_.geometry.vertices[1].set(pos.dst.x, pos.dst.y, this.vis_data.z);
        this.line_mesh_.geometry.verticesNeedUpdate = true;

        //Necessary for camera movement
        this.line_mesh_.geometry.computeBoundingSphere();



        var width = this.vis_data.width;
        if (this.is_bold)
            width = this.vis_data.bold_width;
 
 
        this.line_mesh_.material.linewidth = width;


        this.last_pos = pos;
    }

};

GLGR.ConnectionAbstract.prototype.createMesh_ = function () {

    var line_material = new THREE.LineBasicMaterial({
        color: this.vis_data.color,
        linewidth: this.vis_data.width,
        transparent: true
    });

    var line_geometry = new THREE.Geometry();
    line_geometry.vertices.push(new THREE.Vector3(
            0.0,
            0.0,
            this.vis_data.width
            )
            );

    line_geometry.vertices.push(new THREE.Vector3(
            0.0,
            0.0,
            this.vis_data.width
            ))
            ;

    line_geometry.computeBoundingSphere();


    this.line_mesh_ = new THREE.Line(line_geometry, line_material);
    GLGR.Scene.getCurrentScene().getThreeScene().add(this.line_mesh_);
};


/**
 * Hides the connection (Not visible at all)
 */
GLGR.ConnectionAbstract.prototype.hide = function () {
    this.setMeshesVisible_(false);
};

/**
 * Shows (unhides) the connection
 */
GLGR.ConnectionAbstract.prototype.show = function () {
    this.setMeshesVisible_(true);
};

GLGR.ConnectionAbstract.prototype.setMeshesVisible_ = function (status) {
    this.is_visible_ = status;
    if (this.line_mesh_ !== null)
        this.line_mesh_.visible = status;
    else
        console.log("line mesh of connection is null... skipping");
};

/**
 * Set if line should be bold or not
 * @param {boolean} bold
 */
GLGR.ConnectionAbstract.prototype.setIsBold = function (bold_val) {
    
    if (this.is_bold !== bold_val)
    {
        this.force_update_ = true;
    }
    this.is_bold = bold_val;
};


GLGR.ConnectionAbstract.prototype.getPosSrc = function () {
    throw ("ABSTRACT GETTER FCT CALLED. NOT IMPLEMENTED IN SUB-CLASS");
};

GLGR.ConnectionAbstract.prototype.getPosDst = function () {
    throw ("ABSTRACT GETTER FCT CALLED. NOT IMPLEMENTED IN SUB-CLASS");
};