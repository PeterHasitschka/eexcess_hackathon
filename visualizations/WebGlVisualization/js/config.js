

var GLVIS = GLVIS || {};
GLVIS.config = {
    debug: true,
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
        result: {
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
        }
    },
    connection: {
        result_collection: {
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
    navigation: {
        zoom: {
            animated: {
                threshold: 0.001,
                pow: 0.1,
                speed_fct: 10
            }
        },
        move: {
            animated: {
                threshold: 1,
                pow: 0.2,
                speed_fct: 0.5
            }
        }
    }

};
