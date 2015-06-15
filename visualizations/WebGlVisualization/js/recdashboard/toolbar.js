var GLVIS = GLVIS || {};

/**
 * Toolbar for the visualization.
 * Holds rows, sections and buttons.
 * The goal is to seperate HTML and JQuery stuff from the tool's logic as far as possible
 */
GLVIS.ToolbarHandler = function () {

    this.buttons_ = [];
    this.render();
    GLVIS.Debugger.debug("ToolbarHandler", "Creating toolbar", 3);
};

/**
 * Creates the HTML of the Toolbar.
 */
GLVIS.ToolbarHandler.prototype.render = function () {

    GLVIS.Debugger.debug("ToolbarHandler", "Rendering toolbar", 5);
    var toolbar_config = GLVIS.config.rec_dashboard.toolbar;

    this.buttons_ = [];

    for (var row_key in this.buttons) {

        var current_row = GLVIS.ToolbarHandler.prototype.buttons[row_key];

        var row_html = this.getRowHtml(row_key);
        jQuery(toolbar_config.selector).append(
                row_html
                );

        GLVIS.Debugger.debug("ToolbarHandler", "Adding row html for " + row_key, 5);

        for (var section_key in current_row) {

            var current_section = current_row[section_key];

            jQuery('#' + toolbar_config.row_id_prefix + row_key).append(
                    this.getSectionHtml(section_key)
                    );

            GLVIS.Debugger.debug("ToolbarHandler", "Adding section html for " + section_key, 5);

            for (var button_key in current_section) {
                var button_data = current_section[button_key];
                var button = new GLVIS.Button(button_key, button_data.label, button_data.icon);

                jQuery('#' + toolbar_config.section_id_prefix + section_key).append(
                        button.toHtml()
                        );

                GLVIS.Debugger.debug("ToolbarHandler", "Adding button html for " + button_key, 5);

                button.onClick(button_data.fct);

                if (button_data.visible === false)
                    button.hide();

                this.buttons_.push(button);
            }
        }
    }
};

/**
 * Toolbar data
 * Each row holds sections that have the buttons.
 * 
 * Each button is identifed by its key in this object.
 * fct is the function to be called when clicked.
 * Remember that the @see{GLVIS.Button} object can be accessed via data.btn in the event obj.
 * 
 */
GLVIS.ToolbarHandler.prototype.buttons = {
    row1: {
        section1: {
            rec_focusparentcol: {
                fct: function (e) {
                    var rdbh = GLVIS.Scene.getCurrentScene().getRecDashboardHandler();
                    var rec = rdbh.last_clicked_rec;
                    if (rec)
                        rec.defocusAndZoomOut();
                    var button = e.data.btn;
                    button.hide();
                },
                label: "Zoom out to collection",
                icon: "zoom-out.png",
                visible: false
            }

        }
    }
};

/**
 * Returns the button with the given identifier or null.
 * @param {String} id Identifier of the button to find
 * @returns {GLVIS.Button | null}
 */
GLVIS.ToolbarHandler.prototype.getButton = function (id) {

    for (var i = 0; i < this.buttons_.length; i++) {
        if (this.buttons_[i].getId() === id)
            return this.buttons_[i];
    }
    return null;
};

/**
 * Returns the html string of the given row
 * @param {String} key
 * @returns {String} Html
 */
GLVIS.ToolbarHandler.prototype.getRowHtml = function (key) {
    var config = GLVIS.config.rec_dashboard.toolbar;
    return '<div class="webgl_toolbar_row" id="' + config.row_id_prefix + key + '"></div>';
};

/**
 * Returns the html string of the given section
 * @param {String} key
 * @returns {String} Html
 */
GLVIS.ToolbarHandler.prototype.getSectionHtml = function (key) {
    var config = GLVIS.config.rec_dashboard.toolbar;
    return '<div class="webgl_toolbar_section" id="' + config.section_id_prefix + key + '"></div>';
};