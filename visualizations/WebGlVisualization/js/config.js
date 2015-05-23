

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
        center_node: {
            transparency: {
                inactive: 0.5
            },
            sphere: {
                radius: 10.0,
                segments: 4,
                rings: 8,
                z_value: -20,
                color: 0x1d904e,
                select_color: 0xFF0000
            }
        },
        result: {
            init_distance: 150,
            collapse_distance: 15,
            common_node: {
                z_value: -30,
                radius: 5,
                min_radius: 0.5,
                active_radius: 10,
                color: 0x4444FF,
                color_positive: 0x00CC00,
                color_negative: 0xCC0000,
                sphere: {
                    segments: 8,
                    rings: 8
                }
            },
            animation: {
            }
        }
    },
    navigation: {
        zoom: {
            animated: {
                threshold: 0.0001,
                speed_root: 1.5,
                speed_fct: 1
            }
        },
        move: {
            animated: {
                threshold: 1,
                root: 2,
                speed_fct: 1
            }
        }
    }

};
