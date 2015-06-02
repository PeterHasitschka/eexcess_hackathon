

var GLVIS = GLVIS || {};
GLVIS.config = {
    scene: {
        queries_to_fetch: 20,
        skip_empty_queries : true
    },
    debug: {
        active: true,
        level: 5, // 1:Very important ... 10:Verbose story telling,
        prefix: "GLVIS::"
    },
    three: {
        camera: {
            NEAR: 0.1,
            FAR: 10000,
            Z_POS: 300
        },
        canvas_color: 0xFBFFFD
    },
    collection: {
        init_distance: 400,
        center_node: {
            transparency: {
                inactive: 0.5
            },
            sphere: {
                radius: 10.0,
                segments: 4,
                rings: 6,
                z_value: -20,
                color: 0x1d904e,
                select_color: 0xFF0000
            }
        },
        recommendation: {
            init_distance: 150,
            collapse_distance: 15,
            radius: 5.0,
            color: 0x4444FF,
            common_node: {
                z_value: -19,
                min_radius: 0.5,
                active_radius: 10,
                color_positive: 0x00CC00,
                color_negative: 0xCC0000,
                sphere: {
                    segments: 4,
                    rings: 6
                }
            },
            animation: {
            }
        },
        ring_segment: {
            min_distance: 15,
            thickness: 28,
            gap: 5,
            color: 0xFF00FF,
            z_value: -15,
            segments: 20,
            opacity: 0.3
        },
        labels: {
            vertical_offset: 200,
            title_color: "#CC0000",
            distance: 25,
            init_opacity : 0.7,
            max_opacity : 0.9,
            min_opacity : 0.5,
            init_font_size : 20,
            max_font_size : 30,
            min_font_size : 15,
            weight_size_pow : 0.5,
            weight_opacity_pow : 0.5
        }
    },
    connection: {
        recommendation_collection: {
            width: 1,
            bold_width: 3,
            color: 0x668866,
            z: -50
        },
        collection_collection: {
            width: 1,
            color: 0xFF3333,
            z: -52,
            opacity: 0.3
        }
    },
    text: {
        z_value: -1,
        render_factor: 3,
        font: "Arial",
        font_size: 20,
        color: "#000000",
        bg_color: null,
        opacity: 1
    },
    navigation: {
        zoom: {
            animated: {
                threshold: 0.001,
                pow: 0.0001,
                speed_fct: 10,
                zoom_out: 0.7,
                zoom_in: 1.5
            }
        },
        move: {
            animated: {
                threshold: 1,
                pow: 0.2,
                speed_fct: 0.5
            }
        }
    },
    rec_dashboard: {
        selector: '#webgl_canvas_container'
    },
    db: {
        query: {
            storage_name: "queries_full",
            fields_to_load: ["id", "timestamp", "query"]
        },
        rec: {
            storage_name: "recommendations",
            fields_to_load: ["recommendation_id", "context", "result", "timestamp"]
        }
    }

};
