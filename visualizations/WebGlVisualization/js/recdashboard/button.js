var GLVIS = GLVIS || {};

/**
 * Button element for the rec-dashboard toolbar
 * @param {string} id For identifying the icon. Must be unique!
 * @param {string} label Label of the button
 * @param {string} icon Element in the media/toolbar folder
 */
GLVIS.Button = function (id, label, icon) {

    this.id_ = id;

    this.label = label;
    this.icon = icon;

    this.on_click_fct_ = null;

    GLVIS.Debugger.debug("Button", "Created button '" + id + "'", 5);
};

/**
 * Returns the button html
 * @returns {String} Html
 */
GLVIS.Button.prototype.toHtml = function () {
    var config = GLVIS.config.rec_dashboard.toolbar;
    var out = "";

    out += "<div class='webgl_toolbar_element' id='" + config.button_id_prefix + this.id_ + "'>";

    if (this.icon)
        out += "    <img src='/visualizations/WebGlVisualization/media/toolbar/" + this.icon + "' class='webgl_toolbar_element_icon'/>";
    out += "    <span class='webgl_toolbar_element_label'>" + this.label + "</span>";
    out += "</div>";

    return out;
};

/**
 * Register a function that will be called on the button click
 * @param {function} fct
 */
GLVIS.Button.prototype.onClick = function (fct) {
    this.on_click_fct_ = fct;
    var config = GLVIS.config.rec_dashboard.toolbar;

    var elm = jQuery('#' + config.button_id_prefix + this.id_);

    //Pass the this object to jquery
    elm.click({btn: this}, this.on_click_fct_);
    elm.btn = this;

    GLVIS.Debugger.debug("Button", "Registered click fct for button '" + this.id_ + "'", 6);
};

/**
 * Returns the identificator of the button
 * @returns {String}
 */
GLVIS.Button.prototype.getId = function () {
    return this.id_;
};

/**
 * Hide the button
 */
GLVIS.Button.prototype.hide = function () {
    var config = GLVIS.config.rec_dashboard.toolbar;
    jQuery('#' + config.button_id_prefix + this.id_).hide();
    GLVIS.Debugger.debug("Button", "Hiding button '" + this.id_ + "'", 5);
};

/**
 * Show the button
 */
GLVIS.Button.prototype.show = function () {
    var config = GLVIS.config.rec_dashboard.toolbar;
    jQuery('#' + config.button_id_prefix + this.id_).show();
    GLVIS.Debugger.debug("Button", "Showing button '" + this.id_ + "'", 5);
};