
GLVIS = GLVIS || {};

/**
 * 
 * @param {string} text Text to be rendered
 * @param {float} font Fontsize as a number
 * @param {string} color Typical css value
 */
GLVIS.Text = function (text, font_size, color) {

    this.dirty_ = true;
    this.render_factor_ = 10;

    this.text_ = text;
    this.font_size_ = font_size;
    this.font_ = (font_size * this.render_factor_) + "px Arial";
    this.color_ = color;

    this.size_ = this.calculateSize_();

    this.webgl_objects_ = {
        mesh: null
    };

    this.initAndRegisterGlObj();
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

    var css = "font:" + this.font_ + ";" + "position: absolute;visibility: hidden;height: auto;width: auto;white-space: nowrap;";

    testDiv.attr('style', css);
    jQuery(document.body).append(testDiv);

    var width = testDiv.width();
    var height = testDiv.height();

    testDiv.remove();
    return [width, height];
};



GLVIS.Text.prototype.initAndRegisterGlObj = function () {

    var canvas = document.createElement('canvas');

    var w = this.size_[0];
    var h = this.size_[1];

    canvas.width = w;
    canvas.height = h;


    var context = canvas.getContext('2d');

    context.rect(0, 0, w, h);
    context.fillStyle = "green";
    context.fill();

    context.font = this.font_;
    context.fillStyle = this.color_;

    var diff_size_font = h - this.font_size_ * this.render_factor_;

    context.fillText(this.text_, 0, h-diff_size_font*2);


    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.flipY = false;

    var material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
    material.transparent = true;


    /**
     * TRUE if background
     * FALSE if tansparent!!!
     */
    material.depthTest = true;

    var mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(canvas.width, canvas.height),
            material
            );
    mesh.position.set(7500, 0, -0.1);

    var scale = 1.0 / this.render_factor_;
    mesh.scale.set(scale, scale, scale);

    this.webgl_objects_.mesh = mesh;
    GLVIS.Scene.getCurrentScene().getWebGlHandler().getThreeScene().add(mesh);
};



GLVIS.Text.prototype.render = function () {

    if (!this.dirty_)
        return;

    GLVIS.Debugger.debug("Text",
            "Rendering TEXT",
            5);
};


GLVIS.Text.prototype.setIsDirty = function (dirty) {
    this.dirty_ = dirty;
};

GLVIS.Text.prototype.getIsDirty = function () {
    return this.dirty_;
};