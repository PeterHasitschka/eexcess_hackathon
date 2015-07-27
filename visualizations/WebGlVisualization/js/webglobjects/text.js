
GLVIS = GLVIS || {};

/**
 * 
 * @param {string} text Text to be rendered
 * @param {object} options Options. Possible values 'color', 'bg_color' 'font_size', 'font', 'opacity', 'pos_x', pos_y', 'pos_z', 'render_factor'
 * @param {object} highlight_options Options for highlighting. Possible vals: color, bg_color, opacity
 * @param {function} mouseover_fct Function called at mouse-over. First param: This object. Second param: mouse_fct
 * @param {function} mouseleave_fct Function called at mouse-over. First param: This object. Second param: mouse_fct
 * */
GLVIS.Text = function (text, options, highlight_options, mouseover_fct, mouseleave_fct, mouse_fct_data) {

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

    var init_highlight_data = {
        color: init_data.color,
        bg_color: init_data.bg_color,
        opacity: init_data.opacity
    };

    //Overwrite init hightlight config
    if (highlight_options)
        for (var key in highlight_options) {
            init_highlight_data[key] = highlight_options[key];
        }

    this.dirty_ = true;
    this.render_factor_ = init_data.render_factor;
    this.text_ = text;
    this.font_size_ = init_data.font_size;
    this.font_ = init_data.font;
    this.color_ = init_data.color;
    this.bg_color_ = init_data.bg_color;
    this.opacity_ = init_data.opacity;
    this.h_color_ = init_highlight_data.color;
    this.h_bg_color_ = init_highlight_data.bg_color;
    this.h_opacity_ = init_highlight_data.opacity;

    this.mouse_over_fct_ = mouseover_fct;
    this.mouse_leave_fct_ = mouseleave_fct;
    this.mouse_fct_data_ = mouse_fct_data;

    this.pos_ = {
        x: init_data.pos_x,
        y: init_data.pos_y,
        z: init_data.pos_z
    };

    this.visible_ = true;

    /**
     * Mesh Focus: Necessary to create second mesh. Updating with e.g. other font-
     * size or background for highlighting leads to unsetting and recreating mesh.
     * That causes flickering on mouse-over intersection because the mesh may not exist
     * at the moment. So it's necessary to prevent recreation on highlight
     */
    this.webgl_objects_ = {
        mesh: null,
        mesh_focus: null
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

    var mesh = this.createMesh(this.font_, this.font_size_, this.color_, this.bg_color_, this.opacity_);
    mesh.interaction = {
        "mouseover": this.handleMouseover.bind(this)
    };
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene().remove(this.webgl_objects_.mesh);
    this.webgl_objects_.mesh = mesh;
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene().add(mesh);


    var mesh_focus = this.createMesh(this.font_, this.font_size_, this.h_color_, this.h_bg_color_, this.h_opacity_);
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene().remove(this.webgl_objects_.mesh_focus);
    this.webgl_objects_.mesh_focus = mesh_focus;
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene().add(mesh_focus);
    mesh_focus.visible = false;

    this.setIsDirty(true);
};

/**
 * Create a Plane mesh with text-texture
 * @param {type} font
 * @param {type} font_size
 * @param {type} color
 * @param {type} bg_color
 * @param {type} opacity
 * @returns {THREE.Mesh}
 */
GLVIS.Text.prototype.createMesh = function (font, font_size, color, bg_color, opacity) {

    var config = GLVIS.config.text;

    var canvas = document.createElement('canvas');

    var w = this.size_[0];
    var h = this.size_[1];

    canvas.width = w;
    canvas.height = h;


    var context = canvas.getContext('2d');

    //If background-color set -> make rectangle
    if (bg_color) {
        context.rect(0, 0, w, h);
        context.fillStyle = bg_color;
        context.fill();
    }

    context.font = font;
    context.fillStyle = color;

    //Vertical center alignment
    var diff_size_font = h - font_size * this.render_factor_;
    context.fillText(this.text_, 0, h - diff_size_font * 2);


    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.flipY = false;

    //Get rid of the "not power of 2" warning
    texture.minFilter = THREE.LinearFilter;

    var material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
    material.transparent = true;
    material.opacity = opacity;

    /**
     * TRUE if background
     * FALSE if tansparent!!!
     */
    if (bg_color)
        material.depthTest = true;
    else
        material.depthTest = false;

    var x = this.pos_.x;
    var y = this.pos_.y;
    var z = this.pos_.z;

    var scale = 1.0 / this.render_factor_;

    var mesh = new THREE.Mesh(
            new THREE.PlaneBufferGeometry(canvas.width, canvas.height),
            material
            );
    mesh.position.set(x, y, z);
    mesh.scale.set(scale, scale, scale);

    return mesh;
};

/**
 * Handling a mouseover event. Called by the mesh's mouseover callback
 */
GLVIS.Text.prototype.handleMouseover = function () {

    if (!this.getIsVisible())
        return;

    this.highlight();

    if (GLVIS.Text.current_selected && GLVIS.Text.current_selected !== this)
        GLVIS.Text.current_selected.unHighlight();
    GLVIS.Text.current_selected = this;

    if (this.mouse_over_fct_)
        this.mouse_over_fct_(this, this.mouse_fct_data_);
};

/**
 * Handling mouse-leave. Called by interaction handler
 */
GLVIS.Text.prototype.handleMouseleave = function () {

    if (!this.getIsVisible())
        return;

    this.unHighlight();

    GLVIS.Text.current_selected = null;


    if (this.mouse_leave_fct_)
        this.mouse_leave_fct_(this, this.mouse_fct_data_);
};

/**
 * Swapping normal and hightlight mesh
 */
GLVIS.Text.prototype.highlight = function () {

    this.webgl_objects_.mesh_focus.visible = true;
    this.webgl_objects_.mesh.visible = false;
};

/**
 * Swapping normal and hightlight mesh
 */
GLVIS.Text.prototype.unHighlight = function () {
    this.webgl_objects_.mesh.visible = true;
    this.webgl_objects_.mesh_focus.visible = false;
};

/**
 * Rendering the Text object and its meshes
 */
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

    this.webgl_objects_.mesh.visible = this.getIsVisible();

    this.webgl_objects_.mesh_focus.position.set(pos_x, pos_y, pos_z);
    this.webgl_objects_.mesh_focus.material.opacity = this.opacity_;
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
 * Return text
 * @return{String} Setted Text of label
 */
GLVIS.Text.prototype.getText = function () {
    return this.text_;
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


GLVIS.Text.prototype.getIsVisible = function () {
    return this.visible_;
};

GLVIS.Text.prototype.setIsVisible = function (visible) {

    if (this.visible_ === visible)
        return;

    this.visible_ = visible;
    this.setIsDirty(true);
};

/**
 * Delete all webgl-objects
 */
GLVIS.Text.prototype.delete = function () {

    var three_scene = GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene();
    three_scene.remove(this.webgl_objects_.mesh);
};


GLVIS.Text.current_selected = null;