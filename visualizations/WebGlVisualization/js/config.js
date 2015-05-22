

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
                color: 0x1d904e
            }
        },
        result: {
            init_distance: 150,
            collapse_distance: 15
        }
    }

};
