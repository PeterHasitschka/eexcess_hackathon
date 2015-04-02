var GLGR = GLGR || {};

GLGR.WidgetHelper = {
    db_update_cb : null
};


GLGR.WidgetHelper.finishedSearchResult = function () {
     if (
            this.db_update_cb !== null &&
            typeof (this.db_update_cb) === "function"
            )
        this.db_update_cb();
};