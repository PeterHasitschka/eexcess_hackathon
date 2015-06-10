
GLVIS = GLVIS || {};

/**
 * 
 * @param {string} text Text to be rendered
 * @param {object} options Options. Possible values 'color', 'bg_color' 'font_size', 'font', 'opacity', 'pos_x', pos_y', 'pos_z', 'render_factor'
 */
GLVIS.Text = function (text, options) {

    var config = GLVIS.config.text;

    var init_data = {
        color: config.color,
        bg_color: null,
        font_size: config.font_size,
        font: config.font,
        opacity: config.opacity,
        pos_x: 0,
        pos_y: 0,
        pos_z: config.z_value,
        render_factor: config.render_factor
    };

    //Overwrite init config
    for (var key in options) {
        init_data[key] = options[key];
    }

    this.dirty_ = true;
    this.render_factor_ = init_data.render_factor;
    this.text_ = text;
    this.font_size_ = init_data.font_size;
    this.font_ = init_data.font;
    this.color_ = init_data.color;
    this.bg_color_ = init_data.bg_color;
    this.opacity_ = init_data.opacity;

    this.pos_ = {
        x: init_data.pos_x,
        y: init_data.pos_y,
        z: init_data.pos_z
    };

    this.webgl_objects_ = {
        mesh: null
    };


    this.updateWebGlObj();
    //GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene().add(this.webgl_objects_.mesh);
};


/**
 * Trick for calculating the size of the textbox:
 * Create a div with the text and check the clientWidth and clientHeight
 * Div has to be appended to body
 * @returns {Array} Holding width and height
 */
GLVIS.Text.prototype.calculateSize_ = function () {

    var testDivHtml = "<div id='size_calc_tmp'>" + this.text_ + "</div>";
    var testDiv = jQuery(testDivHtml);

    this.buildFontString_();
    var css = "font:" + this.font_ + ";" + "position: absolute;visibility: hidden;height: auto;width: auto;white-space: nowrap;";

    testDiv.attr('style', css);
    jQuery(document.body).append(testDiv);

    var width = testDiv.width();
    var height = testDiv.height();

    testDiv.remove();

    var ret = [width, height];
    GLVIS.Debugger.debug("Text", ["Calculated size of text: ", ret], 8);
    return ret;
};

GLVIS.Text.prototype.buildFontString_ = function () {
    this.font_ = (this.font_size_ * this.render_factor_) + "px " + GLVIS.config.text.font;
};


/**
 * Has to be called on initialization but also on changes like font, color etc.
 */
GLVIS.Text.prototype.updateWebGlObj = function () {

    GLVIS.Debugger.debug("Text",
            "Updating WebGl-Object",
            7);

    this.size_ = this.calculateSize_();

    var config = GLVIS.config.text;

    var canvas = document.createElement('canvas');

    var w = this.size_[0];
    var h = this.size_[1];

    canvas.width = w;
    canvas.height = h;


    var context = canvas.getContext('2d');

    //If background-color set -> make rectangle
    if (this.bg_color_) {
        context.rect(0, 0, w, h);
        context.fillStyle = this.bg_color_;
        context.fill();
    }


    context.font = this.font_;
    context.fillStyle = this.color_;

    //Vertical center alignment
    var diff_size_font = h - this.font_size_ * this.render_factor_;
    context.fillText(this.text_, 0, h - diff_size_font * 2);


    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.flipY = false;

    var material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
    material.transparent = true;
    material.opacity = this.opacity_;

    /**
     * TRUE if background
     * FALSE if tansparent!!!
     */
    if (this.bg_color_)
        material.depthTest = true;
    else
        material.depthTest = false;

    var mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(canvas.width, canvas.height),
            material
            );

    var x = this.pos_.x;
    var y = this.pos_.y;
    var z = this.pos_.z;

    mesh.position.set(x, y, z);


    var scale = 1.0 / this.render_factor_;
    mesh.scale.set(scale, scale, scale);

    GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene().remove(this.webgl_objects_.mesh);
    this.webgl_objects_.mesh = mesh;
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene().add(mesh);

    this.setIsDirty(true);

};





GLVIS.Text.prototype.render = function () {

    if (!this.dirty_) {
        return;
    }

    var config = GLVIS.config.text;

    GLVIS.Debugger.debug("Text",
            "Rendering TEXT",
            7);

    var pos_x = parseFloat(this.pos_.x);
    var pos_y = parseFloat(this.pos_.y);
    var pos_z = parseFloat(this.pos_.z);

    this.webgl_objects_.mesh.position.set(pos_x, pos_y, pos_z);
    this.webgl_objects_.mesh.material.opacity = this.opacity_;

    this.setIsDirty(false);
};


/**
 * Sets color. Leads to recreation of WebGl-Object
 * @param {mixed} color Color value
 */
GLVIS.Text.prototype.setColor = function (color) {
    this.color_ = color;
    this.updateWebGlObj();
};

/**
 * Sets backgorund-color. Leads to recreation of WebGl-Object
 * @param {mixed} bg_color Color value
 */
GLVIS.Text.prototype.setBgColor = function (bg_color) {
    this.bg_color_ = bg_color;
    this.updateWebGlObj();
};

/**
 * Sets font-size. Leads to recreation of WebGl-Object
 * @param {float} fontsize Fontsize
 */
GLVIS.Text.prototype.setFontSize = function (fontsize) {
    this.font_size_ = fontsize;
    this.updateWebGlObj();
};

/**
 * Sets text. Leads to recreation of WebGl-Object
 * @param {string} text Text to render
 */
GLVIS.Text.prototype.setText = function (text) {
    this.text_ = text;
    this.updateWebGlObj();
};

/**
 * Sets opacity
 * @param {float} opacity Opacity
 */
GLVIS.Text.prototype.setOpacity = function (opacity) {
    this.opacity_ = opacity;
    this.setIsDirty(true);
};



/**
 * 
 * @param {float | null} x X-Position
 * @param {float | null} y Y-Position
 * @returns {undefined}
 */
GLVIS.Text.prototype.setPosition = function (x, y) {
    if (y === undefined)
        y = null;

    if (x === this.pos_.x && y === this.pos_.y)
        return;

    GLVIS.Debugger.debug("Text", "Setting pos: " + x + " " + y, 8);

    if (x !== null)
        this.pos_.x = x;
    if (y !== null)
        this.pos_.y = y;

    this.setIsDirty(true);
};


GLVIS.Text.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.Text.prototype.getIsDirty = function () {
    return this.dirty_;
};


/**
 * Delete all webgl-objects
 */
GLVIS.Text.prototype.delete = function () {

    var three_scene = GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene();
    three_scene.remove(this.webgl_objects_.mesh);
};
