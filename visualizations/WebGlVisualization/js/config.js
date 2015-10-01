

var GLVIS = GLVIS || {};
GLVIS.config = {
    scene: {
        queries_to_fetch: 20,
        skip_empty_queries: true
    },
    debug: {
        active: true,
        level: 5, // 1:Very important ... 10:Verbose story telling,
        prefix: "GLVIS::"
    },
    three: {
        camera_ortho: {
            NEAR: -1000,
            FAR: 10000,
            Z_POS: 300
        },
        camera_perspective : {
            FOV: 60,
            NEAR: 0.1,
            FAR: 6000,
            Z_POS: 1000
        },
        canvas_color: 0xFBFFFD
    },
    interaction: {
        raycaster_precision: 0.5
    },
    collection: {
        init_distance: 400,
        center_node: {
            transparency: {
                inactive: 0.5
            },
            sphere: {
                radius: 10.0,
                segments: 15,
                z_value: 0, //-20,
                color: 0x1d904e,
                select_color: 0xFF0000
            }
        },
        plane: {
            color: 0x4488FF,
            opacity: 0.1,
            z_value: 0.001,
            segments: 50
        },
        recommendation: {
            init_distance: 150,
            collapse_distance: 15,
            radius: 5.0,
            color: 0x4444FF,
            highlight_color: 0xFF00FF,
            init_z: 0, //-19,
            opacity_depth: {
                strength: 0.01,
                weakness: 0.5
            },
            common_node: {
                min_radius: 0.5,
                active_radius: 10,
                color_positive: 0x00CC00,
                color_negative: 0xCC0000,
                circle: {
                    segments: 15
                }
            },
            detail_node: {
                min_radius: 0.5,
                active_radius: 10,
                gap_inner_circle: 0.2,
                z_diff_inner_circle: 0.001,
                color_positive: 0x00CC00,
                color_negative: 0xCC0000,
                circle: {
                    segments: 40
                }
            },
            animation: {
                speed: 0.1,
                pow: 0.001,
                threshold: 0.003
            },
            focus_animation: {
                move: {
                    speed: 0.3,
                    pow: 0.001,
                    threshold: 0.01
                },
                zoom: {
                    speed: 2,
                    pow: 0.00001,
                    threshold: 0.01,
                    zoom_val: 50
                }
            },
            defocus_animation: {
                threshold: 0.001,
                pow: 0.0001,
                speed: 20
            },
            distfact_animation: {
                id_prefix: "rec_distfact_anim_",
                speed: 0.3,
                pow: 0.01,
                threshold: 0.001
            },
            opacity_animation: {
                id_prefix: "rec_opacity_anim_",
                speed: 0.3,
                pow: 0.01,
                threshold: 0.01
            },
            size_animation: {
                id_prefix: "rec_size_anim_",
                speed: 0.3,
                pow: 0.01,
                threshold: 0.01
            },
            relevance : {
                sizefactor : 2,
                sizeoffset : 0.5,
                distfactor : 0.2
            }
        },
        ring: {
            data: {
                1: {
                    type: "facet",
                    id: "type"
                },
                2: {
                    type: "facet",
                    id: "language"
                },
                3: {
                    type: "facet",
                    id: "provider"
                },
                4: {
                    type: "facet",
                    id: "license"
                },
                5: {
                    type: "facet",
                    id: "year"
                }

            },
            ring_segment: {
                min_distance: 15,
                thickness: 23,
                gap: 3,
                color: 0xFF00FF,
                z_value: 0,
                segments: 100,
                phi_seg_num: 8,
                opacity: 0.8,
                label: {
                    font_size: 8,
                    color: "#000033",
                    z_value: 0.1
                }
            },
            replacements: {
                "unknown": "?",
                "https://creativecommons.org/licenses/by/3.0/legalcode": "CC 3.0",
                "http://www.europeana.eu/rights/rr-f/": "E RR-F",
                "http://creativecommons.org/licenses/by-nc-sa/4.0/": "CC NC-SA 4.0",
                "http://creativecommons.org/licenses/by-nc-sa/3.0/": "CC NC-SA 3.0",
                "http://creativecommons.org/licenses/by-sa/3.0/": "CC SA 3.0",
                "http://creativecommons.org/licenses/by-sa/3.0/nl/": "CC SA 3.0 NL",
                "http://creativecommons.org/publicdomain/zero/1.0/": "CC0 1.0",
                "http://creativecommons.org/publicdomain/mark/1.0/": "CC PD Mark 1.0",
                "http://www.europeana.eu/rights/rr-r/": "E RR",
                "http://www.europeana.eu/rights/out-of-copyright-non-commercial/": "E OOC-NC",
                "http://www.europeana.eu/rights/out-of-copyright-non-commercial/http://www.europeana.eu/rights/out-of-copyright-non-commercial/": "E OOC-NC",
            }
        },
        labels: {
            columns: 3,
            column_distance: 100,
            vertical_offset: 200,
            title_color: "#CC0000",
            highlight_color: "#0000FF",
            distance: 25,
            init_opacity: 0.7,
            max_opacity: 0.9,
            min_opacity: 0.5,
            init_font_size: 20,
            max_font_size: 22,
            min_font_size: 13,
            weight_size_pow: 0.5,
            weight_opacity_pow: 0.5
        },
        compare: {
            color_pos: 0x5bdc5b,
            color_neg: 0xd85353,
            directcompare: {
                bar: {
                    color_pos: 0x5bdc5b,
                    color_neg: 0xd85353,
                    width: 140,
                    height: 20,
                    y_offset: -180,
                    z_value: -10,
                    label_y_offset: 1.3,
                    label_color: "#FFFFFF"
                }
            }
        },
        rotation: {
            speed: 0.1,
            pow: 0.01,
            threshold: 0.5,
            prefix: "coll_rot_"
        }
    },
    connection: {
        recommendation_collection: {
            width: 1,
            bold_width: 3,
            color: 0x668866,
            z: -0.1 //-50
        },
        collection_collection: {
            width: 1,
            color: 0xFF3333,
            z: 0, //-52,
            opacity: 0.3
        },
        rec_spline: {
            base_color: 0xAA0000,
            color_diff: 0x00AA00,
            rec_color: 0xFF0000,
            num_vertices: 300
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
                zoom_out: 0.5,
                zoom_in: 1
            }
        },
        move: {
            animated: {
                threshold: 1,
                pow: 0.2,
                speed_fct: 0.2
            }
        }
    },
    rec_dashboard: {
        selector: '#webgl_canvas_container',
        toolbar: {
            selector: '#webgl_toolbar',
            row_id_prefix: 'webgl_toolbar_row_',
            section_id_prefix: 'webgl_toolbar_section_',
            button_id_prefix: 'webgl_toolbar_btn_'
        }
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
