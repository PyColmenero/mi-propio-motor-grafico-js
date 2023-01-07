const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
var ALLOWED_LOG, max_depth, CAMERA_ANGLE, resizeTimeOut, w_camera_angle, h_camera_angle, angle, aspectRatio, camera, w_camera_total_inter_distance, h_camera_total_inter_distance, events, font, height, ii, img, keys, m, max_angle, mouse, mouseClick, mouse_x, mouse_y, point_one, point_one_angles, point_one_rot, point_two, point_two_angles, point_two_rot, points, polygon_screen, polygons, relations, screen, size, speed, stime_start, time_start, width, x, screenCoortinatesP1, y, screenCoortinatesP2, z, gamedirection;
max_depth = 24;
var width = window.innerWidth;
var height = window.innerHeight;
var PHONE = 0;
var COMPUTER = 1;
var DEVICE;

const zFadingDistance = 1;

gamedirection = [];
CAMERA_ANGLE = 45;
speed = 0.6;
size = 10;

let cube_shape = get_polygon_from_json(cube);
let triangle_shape = get_polygon_from_json(triangle1);
// let teapot_shape = get_polygon_from_json(teapot);

// polygons = [teapot_shape];
// polygons = [cube_shape];
polygons = [cube_shape, triangle_shape];

function reset_camera() {
    return {


        "coordinates": {
            "x": 100,
            "y": 10,
            "z": 100
        },
        "angle": {
            "x": 0,
            "y": 0
        }


        // "coordinates": {
        //     "x": 92.98056446104476,
        //     "y": 15.200000000000006,
        //     "z": 100.702654826248
        // },
        // "angle": {
        //     "x": -26.099999999999994,
        //     "y": 4.049999999999983
        // }
    }
}



savedcamera = localStorage.getItem("camera");

if (savedcamera) {
    try {
        camera = JSON.parse(savedcamera);
    } catch (error) {

        camera = reset_camera();

        let sc = JSON.stringify(camera);
        localStorage.setItem("camera", sc);



    }
} else {
    camera = reset_camera();
}
camera = reset_camera();



function resize_canvas() {


    width = s || window.innerWidth;
    height = s || window.innerHeight;
    // width = 800 || window.innerWidth;
    // height = 800 || window.innerHeight;

    aspectRatio = width / height

    DEVICE = (width > height) ? COMPUTER : PHONE;

    if (DEVICE == COMPUTER) {
        w_camera_angle = CAMERA_ANGLE;
        h_camera_angle = CAMERA_ANGLE / aspectRatio;
    } else {
        w_camera_angle = (CAMERA_ANGLE * aspectRatio) / .9;
        h_camera_angle = CAMERA_ANGLE;
    }

    w_camera_total_inter_distance = Math.tan(degrees_to_radians(w_camera_angle));
    h_camera_total_inter_distance = Math.tan(degrees_to_radians(h_camera_angle));


    canvas.width = width; //document.width is obsolete
    canvas.height = height; //document.height is obsolete

}


function rotate_3d_point(cx, cy, cz, anglex, angley, px, py, pz) {
    [x, z] = rotate_point(cx, cz, anglex, px, pz);
    [y, z] = rotate_point(cy, cz, angley, py, z);
    return [x, y, z];
}

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function radians_to_degrees(radians) {
    var pi = Math.PI;
    return radians * (180 / pi);
}

function rotate_point(cx, cy, angle, px, py) {
    var c, s, xnew, ynew;
    s = Math.sin(degrees_to_radians(angle));
    c = Math.cos(degrees_to_radians(angle));
    px -= cx;
    py -= cy;
    xnew = px * c - py * s;
    ynew = px * s + py * c;
    px = xnew + cx;
    py = ynew + cy;
    return [px, py];
}

function angles_to_screenpixel(x, y) {
    var x_camera_screen_point_inter_distance, xp, y_camera_screen_point_inter_distance, yp;
    x_camera_screen_point_inter_distance = Math.tan(degrees_to_radians(x));
    y_camera_screen_point_inter_distance = Math.tan(degrees_to_radians(y));
    xp = 100 / (w_camera_total_inter_distance * 2 / (x_camera_screen_point_inter_distance + w_camera_total_inter_distance));
    yp = 100 - (100 / (h_camera_total_inter_distance * 2 / (y_camera_screen_point_inter_distance + h_camera_total_inter_distance)));
    return [Number.parseInt(width * (xp / 100)), Number.parseInt(height * (yp / 100))];
}

function worldscreenpoint__camera_point(first_point_x = 0, first_point_y = 0, first_point_z = 0, second_point_x = 0, second_point_y = 0, second_point_z = 0, rotation_about_first_point_x = 0, rotation_about_first_point_y = 0) {
    var hipo, leg1, leg2, xangle, yangle;
    [x, y, z] = rotate_3d_point(first_point_x, first_point_y, first_point_z, -rotation_about_first_point_x, -rotation_about_first_point_y, second_point_x, second_point_y, second_point_z);
    leg1 = z - first_point_z;
    leg2 = x - first_point_x || 0.001;
    hipo = Math.hypot(leg2, leg1);
    xangle = radians_to_degrees(Math.asin(leg2 / hipo)) || 1;
    leg2 = y - first_point_y;
    hipo = Math.hypot(leg2, leg1) || 1;
    yangle = radians_to_degrees(Math.asin(leg2 / hipo));
    return [xangle, yangle];
}

function point_to_intersection(camera, vector, p1, p2) {
    var inter;

    [x, y, z] = angles_to_vector(
        -camera["angle"].x,
        -camera["angle"].y,
        1
    )

    inter = isect_line_plane_v3(
        [p1.x, p1.y, p1.z],
        [p2.x, p2.y, p2.z],
        [camera.coordinates.x + x, camera.coordinates.y + y, camera.coordinates.z + z],
        vector
    );

    if (inter) {
        return worldscreenpoint__camera_point(camera.coordinates.x, camera.coordinates.y, camera.coordinates.z, inter[0], inter[1], inter[2], camera["angle"].x, camera["angle"].y);
    }
}

function get_angles_from_depth_inter(point_one, point_two) {
    var normal_depth, p1, p2, p3;
    p1 = [camera.coordinates.x, camera.coordinates.y, camera.coordinates.z];
    p2 = [camera.coordinates.x + 2, camera.coordinates.y - 1, camera.coordinates.z];
    p3 = [camera.coordinates.x - 1, camera.coordinates.y + 2, camera.coordinates.z];

    normal_depth = points_to_normal(p1, p2, p3, camera);

    return point_to_intersection(
        camera,
        normal_depth,
        point_one,
        point_two
    );
}

function angles_to_vector(xangle, yangle, r) {
    x = Math.cos(degrees_to_radians(yangle)) * Math.sin(degrees_to_radians(xangle));
    z = Math.cos(degrees_to_radians(yangle)) * Math.cos(degrees_to_radians(xangle));
    y = Math.sin(degrees_to_radians(yangle));
    x *= r;
    y *= r;
    z *= r;

    if (x < 0.0001 && x > 0) {
        x = 0;
    }

    if (y < 0.0001 && y > 0) {
        y = 0;
    }

    if (z < 0.0001 && z > 0) {
        z = 0;
    }

    if (x < 0 && x > -0.0001) {
        x = 0;
    }

    if (y < 0 && y > -0.0001) {
        y = 0;
    }

    if (z < 0 && z > -0.0001) {
        z = 0;
    }

    return [x, y, z];
}

function get_polygon_from_json(polygon_json) {
    var abs_coordinates, angles, coordinates, relations, colors, scale, vertexs, x_degrees, y_degrees, z_degrees;
    abs_coordinates = polygon_json.coordinates;
    scale = polygon_json["scale"];
    vertexs = polygon_json["points"];
    angles = polygon_json["angles"];
    relations = [];
    colors = polygon_json["colors"];

    for (var r, _pj_c = 0, _pj_a = polygon_json["relations"], _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
        r = _pj_a[_pj_c];
        relations.push([
            [r[0], r[1]],
            [r[1], r[2]],
            [r[2], r[0]]
        ]);
    }

    polygon_json["relations"] = relations;
    [x_degrees, y_degrees, z_degrees] = [angles.x, angles.y, angles.z];

    vertexs = function () {
        var _pj_a = [],
            _pj_b = vertexs;

        for (var _pj_c = 0, _pj_d = _pj_b.length; _pj_c < _pj_d; _pj_c += 1) {
            var vertex = _pj_b[_pj_c];

            _pj_a.push({
                "x": vertex.x * scale.x,
                "y": vertex.y * scale.y,
                "z": vertex.z * scale.z
            });
        }

        return _pj_a;
    }.call(this);

    vertexs = function () {
        var _pj_a = [],
            _pj_b = vertexs;

        for (var _pj_c = 0, _pj_d = _pj_b.length; _pj_c < _pj_d; _pj_c += 1) {
            var v = _pj_b[_pj_c];

            _pj_a.push({
                "x": v.x * Math.cos(degrees_to_radians(x_degrees)) - v.y * Math.sin(degrees_to_radians(x_degrees)),
                "y": v.x * Math.sin(degrees_to_radians(x_degrees)) + v.y * Math.cos(degrees_to_radians(x_degrees)),
                "z": v.z
            });
        }

        return _pj_a;
    }.call(this);

    vertexs = function () {
        var _pj_a = [],
            _pj_b = vertexs;

        for (var _pj_c = 0, _pj_d = _pj_b.length; _pj_c < _pj_d; _pj_c += 1) {
            var v = _pj_b[_pj_c];

            _pj_a.push({
                "x": v.x * Math.cos(degrees_to_radians(y_degrees)) - v.z * Math.sin(degrees_to_radians(y_degrees)),
                "z": v.x * Math.sin(degrees_to_radians(y_degrees)) + v.z * Math.cos(degrees_to_radians(y_degrees)),
                "y": v.y
            });
        }

        return _pj_a;
    }.call(this);

    vertexs = function () {
        var _pj_a = [],
            _pj_b = vertexs;

        for (var _pj_c = 0, _pj_d = _pj_b.length; _pj_c < _pj_d; _pj_c += 1) {
            var v = _pj_b[_pj_c];

            _pj_a.push({
                "z": v.z * Math.cos(degrees_to_radians(z_degrees)) - v.y * Math.sin(degrees_to_radians(z_degrees)),
                "y": v.z * Math.sin(degrees_to_radians(z_degrees)) + v.y * Math.cos(degrees_to_radians(z_degrees)),
                "x": v.x
            });
        }

        return _pj_a;
    }.call(this);

    coordinates = function () {
        var _pj_a = [],
            _pj_b = vertexs;

        for (var _pj_c = 0, _pj_d = _pj_b.length; _pj_c < _pj_d; _pj_c += 1) {
            var c = _pj_b[_pj_c];

            _pj_a.push({
                "x": abs_coordinates.x + c.x,
                "y": abs_coordinates.y + c.y,
                "z": abs_coordinates.z + c.z
            });
        }

        return _pj_a;
    }.call(this);

    polygon_json["absolute_coordinates"] = coordinates;
    return polygon_json;
}

function rotate_polygon(polygon, ax, ay) {
    var abs_coor, p, pointsa;
    points = polygon["absolute_coordinates"];
    abs_coor = polygon.coordinates;
    polygon.angles = { "x": ax, "y": ay }
    pointsa = [];

    for (var p, _pj_c = 0, _pj_a = points, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
        p = _pj_a[_pj_c];
        [x, y, z] = rotate_3d_point(abs_coor.x, abs_coor.y, abs_coor.z, ax, ay, p.x, p.y, p.z);
        p = {
            "x": x,
            "y": y,
            "z": z
        };
        pointsa.push(p);
    }

    polygon["absolute_coordinates"] = pointsa;

    // return polygon;
}
function move_polygon(polygon, x, y, z) {
    // var abs_coor, p, pointsa;
    let points = polygon["absolute_coordinates"];
    let coordinates = polygon.coordinates;

    // console.log(abs_coor);

    // console.log(coordinates);

    coordinates.x += x;
    coordinates.y += y;
    coordinates.z += z;

    // console.log(x,y,z);

    var npoints = [];

    for (var i = 0; i < points.length; i++) {
        var p = points[i];

        npoints.push({
            "x": x + p.x,
            "y": y + p.y,
            "z": z + p.z
        });
    }


    polygon.coordinates = coordinates;
    polygon.absolute_coordinates = npoints;

    // console.log(abs_coor);
    // pointsa = [];

    // for (var p, _pj_c = 0, _pj_a = points, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
    //     p = _pj_a[_pj_c];
    //     [x, y, z] = rotate_3d_point(abs_coor.x, abs_coor.y, abs_coor.z, ax, ay, p.x, p.y, p.z);
    //     p = {
    //         "x": x,
    //         "y": y,
    //         "z": z
    //     };
    //     pointsa.push(p);
    // }

    // polygon["absolute_coordinates"] = pointsa;

    // return polygon;
}


var startTime, endTime;

function start() {
    startTime = new Date();
};
function end() {
    endTime = new Date();
    var timeDiff = endTime - startTime; //in ms
    // strip the ms
    timeDiff /= 1000;

    // get seconds 
    var seconds = Math.round(timeDiff * 10000) / 10000;
    console.log(seconds + " seconds");
}

let triangle;
let pixels_depth = [];
var colors = [];
function main(once) {

    start();

    pixels_depth = [];

    if (gamedirection) {
        if (gamedirection.indexOf("Control") != -1) {
            camera.coordinates.y -= speed
        }
        if (gamedirection.indexOf(" ") != -1) {
            camera.coordinates.y += speed
        }
        if (gamedirection.indexOf("w") != -1) {
            [x, y, z] = angles_to_vector(
                (-camera["angle"].x), 0, speed)
            camera.coordinates.x += x
            camera.coordinates.y += y
            camera.coordinates.z += z

        }
        if (gamedirection.indexOf("a") != -1) {
            [x, y, z] = angles_to_vector(
                (-camera["angle"].x) - 90, 0, speed
            )
            camera.coordinates.x += x
            camera.coordinates.y += y
            camera.coordinates.z += z
        }
        if (gamedirection.indexOf("d") != -1) {
            [x, y, z] = angles_to_vector(
                (-camera["angle"].x) + 90, 0, speed)
            camera.coordinates.x += x
            camera.coordinates.y += y
            camera.coordinates.z += z
        }
        if (gamedirection.indexOf("s") != -1) {
            [x, y, z] = angles_to_vector(
                (-camera["angle"].x), 0, speed)
            camera.coordinates.x -= x
            camera.coordinates.y -= y
            camera.coordinates.z -= z
        }
    }

    angle = 2;

    colors = [];
    let triangles = [];

    u8a.fill(0);

    for (var polygon, _pj_c = 0, _pj_a = polygons, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {

        // console.log(polygon);
        polygon = _pj_a[_pj_c];
        // colors.push(polygon.colors);
        points = polygon.absolute_coordinates;
        // console.log(points);
        relations = polygon["relations"];

        polygon_screen = function () {
            var _pj_d = [],
                _pj_e = points;

            for (var _pj_f = 0, _pj_g = _pj_e.length; _pj_f < _pj_g; _pj_f += 1) {
                var point = _pj_e[_pj_f];

                _pj_d.push(worldscreenpoint__camera_point(camera.coordinates.x, camera.coordinates.y, camera.coordinates.z, point.x, point.y, point.z, camera["angle"].x, camera["angle"].y));
            }

            return _pj_d;
        }.call(this);

        for (var triangle_relations, _pj_f = 0, _pj_d = relations, _pj_e = _pj_d.length; _pj_f < _pj_e; _pj_f += 1) {

            triangle_relations = _pj_d[_pj_f];

            let triangle = [];

            let skiped = 0;
            let intersected = 0;
            for (let rindex = 0; rindex < triangle_relations.length; rindex++) {
                const single_triangle_relation = triangle_relations[rindex];

                point_one = points[single_triangle_relation[0]];
                point_two = points[single_triangle_relation[1]];
                point_one_angles = polygon_screen[single_triangle_relation[0]];
                point_two_angles = polygon_screen[single_triangle_relation[1]];

                if (!point_one || !point_two) continue;
                [x, y, z] = rotate_3d_point(camera.coordinates.x, camera.coordinates.y, camera.coordinates.z, -camera["angle"].x, -camera["angle"].y, point_one.x, point_one.y, point_one.z);
                point_one_rot = {
                    "x": x,
                    "y": y,
                    "z": z
                };
                [x, y, z] = rotate_3d_point(camera.coordinates.x, camera.coordinates.y, camera.coordinates.z, -camera["angle"].x, -camera["angle"].y, point_two.x, point_two.y, point_two.z);
                point_two_rot = {
                    "x": x,
                    "y": y,
                    "z": z
                };

                // si de esta linea, producto de la relación entre dos puntos
                // ambos puntos están detrás de la cámara, pasando
                if (point_one_rot.z < camera.coordinates.z + zFadingDistance && point_two_rot.z < camera.coordinates.z + zFadingDistance) {
                    skiped++;
                    continue;
                }

                // let intersected = 0;

                // si uno de los 2 puntos está detrás, obtenemos el punto intersectado con 
                // el plano de la cámara
                if (point_one_rot.z < camera.coordinates.z + zFadingDistance) {
                    point_one_angles = get_angles_from_depth_inter(point_one, point_two);
                    intersected++;
                }

                // si uno de los 2 puntos está detrás, obtenemos el punto intersectado con 
                // el plano de la cámara
                if (point_two_rot.z < camera.coordinates.z + zFadingDistance) {
                    point_two_angles = get_angles_from_depth_inter(point_one, point_two);
                    intersected++;
                }

                // nose xd
                if (!point_one_angles || !point_two_angles) continue;

                // convertir coordenadas en el mundo virtual de los puntos, a coordenadas en la pantalla
                screenCoortinatesP1 = angles_to_screenpixel(point_one_angles[0], point_one_angles[1]);
                screenCoortinatesP2 = angles_to_screenpixel(point_two_angles[0], point_two_angles[1]);

                // obtener las distancias de la cámara al puntos
                const distanceToP1 = distance3d(
                    [camera.coordinates.x, camera.coordinates.y, camera.coordinates.z],
                    [point_one.x, point_one.y, point_one.z],
                )
                const distanceToP2 = distance3d(
                    [camera.coordinates.x, camera.coordinates.y, camera.coordinates.z],
                    [point_two.x, point_two.y, point_two.z],
                )


                triangle.push(
                    [
                        screenCoortinatesP1,
                        distanceToP1,
                        screenCoortinatesP2,
                        distanceToP2
                    ]
                );

                // console.log(
                //     screenCoortinatesP1
                // );
                draw_line(
                    screenCoortinatesP1,
                    screenCoortinatesP2,
                    distanceToP1, distanceToP2
                );

            }

            triangles.push(
                [triangle, polygon.colors[_pj_f], intersected, skiped]
            );

        }


    }


    if (true) {

        // console.log(triangles);
        for (let i = 0; i < triangles.length; i++) {
            let triangle1 = triangles[i][0];
            const color = triangles[i][1];
            const intersected = triangles[i][2];
            const skiped = triangles[i][3];
            if (!triangle1) continue;
            if (!triangle1.length) continue;

            // if (triangle1.length != 3) continue;
            // el triangulo tiene 1 arista completamente fuera de la cámara
            if (triangle1.length != 3) {
                if (triangle1[0][0][0] === triangle1[1][2][0] && triangle1[1][2][1] === triangle1[0][0][1]) {
                    triangle1.push(
                        [triangle1[0][2], triangle1[0][3]]
                    );
                } else {
                    triangle1.push(
                        [triangle1[1][2], triangle1[1][3]]
                    );
                }

                // continue;
            }

            if (intersected === 2 && skiped === 0) {
                if (triangle1[0][0][0] === triangle1[2][2][0] && triangle1[0][0][1] === triangle1[2][2][1]) {
                    let [p1, p3, p5] = [triangle1[0][2], triangle1[1][0], triangle1[2][2]];
                    let [p1_depth, p3_depth, p5_depth] = [triangle1[0][3], triangle1[1][1], triangle1[2][3]];
                    p1[2] = p1_depth;
                    p3[2] = p3_depth;
                    p5[2] = p5_depth;
                    drawTriangle(p1, p3, p5, color);
                    [p1, p3, p5] = [triangle1[0][2], triangle1[1][2], triangle1[2][0]];
                    [p1_depth, p3_depth, p5_depth] = [triangle1[0][3], triangle1[1][3], triangle1[2][1]];
                    p1[2] = p1_depth;
                    p3[2] = p3_depth;
                    p5[2] = p5_depth;
                    drawTriangle(p1, p3, p5, color);
                } else {
                    let [p1, p3, p5] = [triangle1[0][0], triangle1[1][2], triangle1[2][2]];
                    let [p1_depth, p3_depth, p5_depth] = [triangle1[0][1], triangle1[1][3], triangle1[2][3]];
                    p1[2] = p1_depth;
                    p3[2] = p3_depth;
                    p5[2] = p5_depth;
                    drawTriangle(p1, p3, p5, color);
                }
            }


            let [p1, p3, p5] = [triangle1[0][0], triangle1[1][0], triangle1[2][0]];
            let [p1_depth, p3_depth, p5_depth] = [triangle1[0][1], triangle1[1][1], triangle1[2][1]];
            p1[2] = p1_depth;
            p3[2] = p3_depth;
            p5[2] = p5_depth;

            // if(color[0]===20){
            //     console.log("T", p1[2], p3[2], p5[2]);
            // } else {
            //     console.log("C", p1[2], p3[2], p5[2]);
            // }
            drawTriangle(p1, p3, p5, color);

        }



    } else {

        // triangle_work_total = triangles.length;
        // let div = 100;
        // let vueltas = parseInt(triangle_work_total / div) + 1;
        // let post_triangles = [];

        // for (let i = 0; i < vueltas; i++) {
        //     post_triangles = triangles.slice(i * div, (i + 1) * div);
        //     triangle_worker.postMessage({ "triangles": post_triangles })

        // }

    }

    array_to_canvas();

    setTimeout(main, 10);

    rotate_polygon(polygons[0], 1,1);
    rotate_polygon(polygons[1], -1,0);
    // move_polygon(polygons[1], 0,0.02,0);


    // rotate_polygon(polygons[0], 1,1);


    // rotate_polygon(polygons[1], -2,0);

    // end();

    // array_to_canvas();

    // ALLOWED_LOG = false;


}



function slope(a, b) {
    if (a[0] == b[0]) {
        return null;
    }
    return (b[1] - a[1]) / (b[0] - a[0]);
}

function intercept(point, slope) {
    if (slope === null) {
        return point[0];
    }
    return point[1] - slope * point[0];
}



function cross(a, b, c) {
    return (b[0] - a[0]) * -(c[1] - a[1]) - -(b[1] - a[1]) * (c[0] - a[0]);
}

function full_fill(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
}

function isect_line_plane_v3(p0, p1, p_co, p_no, epsilon = 1e-06) {
    var dot, fac, u, w;
    u = sub_v3v3(p1, p0);
    dot = dot_v3v3(p_no, u);

    if (Math.abs(dot) > epsilon) {
        w = sub_v3v3(p0, p_co);
        fac = -dot_v3v3(p_no, w) / dot;
        u = mul_v3_fl(u, fac);
        return add_v3v3(p0, u);
    }

    return null;
}

function add_v3v3(v0, v1) {
    return [v0[0] + v1[0], v0[1] + v1[1], v0[2] + v1[2]];
}

function sub_v3v3(v0, v1) {
    return [v0[0] - v1[0], v0[1] - v1[1], v0[2] - v1[2]];
}

function dot_v3v3(v0, v1) {
    return v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2];
}

function len_squared_v3(v0) {
    return dot_v3v3(v0, v0);
}

function mul_v3_fl(v0, f) {
    return [v0[0] * f, v0[1] * f, v0[2] * f];
}

function points_to_normal(p1, p2, p3, camera) {
    var normal, p, p0, points, u, u_cross_v, ux, uy, uz, v, vx, vy, vz, x, x0, x1, x2, y, y0, y1, y2, z, z0, z1, z2;
    points = [p1, p2, p3];

    for (var p, _pj_c = 0, _pj_a = points, _pj_b = _pj_a.length; _pj_c < _pj_b; _pj_c += 1) {
        p = _pj_a[_pj_c];
        [y, z] = rotate_point(camera.coordinates.y, camera.coordinates.z, camera["angle"].y, p[1], p[2]);
        [x, z] = rotate_point(camera.coordinates.x, camera.coordinates.z, camera["angle"].x, p[0], z);
        points[_pj_c] = [x, y, z];
    }

    [p0, p1, p2] = points;
    [x0, y0, z0] = p0;
    [x1, y1, z1] = p1;
    [x2, y2, z2] = p2;
    [ux, uy, uz] = u = [x1 - x0, y1 - y0, z1 - z0];
    [vx, vy, vz] = v = [x2 - x0, y2 - y0, z2 - z0];
    u_cross_v = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    // normal = np.array(u_cross_v);
    return u_cross_v;
}

function onMouseUpdate(e) {

    // console.log(pressing);
    if (!pressing) {
        return;
    }

    let mouse_x = e.pageX || 1;
    let mouse_y = e.pageY || 1;

    mouse_x = 100 / (width / mouse_x)
    mouse_y = 100 - (100 / (height / mouse_y))

    max_angle = 180

    camera["angle"].x = -(((max_angle * 2) * (mouse_x / 100)) - max_angle);
    camera["angle"].y = -(((max_angle * 2) * (mouse_y / 100)) - max_angle);

    let sc = JSON.stringify(camera);
    localStorage.setItem("camera", sc);

}

function array_to_canvas() {
    var DAT = new ImageData(u8a, width, height);
    ctx.putImageData(DAT, 0, 0);
}



window.addEventListener("resize", function () {

    clearTimeout(resizeTimeOut);
    resizeTimeOut = setTimeout(resize_canvas, 500);

});
document.addEventListener("keydown", function (event) {

    event.preventDefault()

    if (gamedirection.indexOf(event.key) == -1) {
        gamedirection.push(event.key);

        localStorage.setItem("camera", JSON.stringify(camera));
    }

    return false;

});
document.addEventListener("keyup", function (evt) {

    index = gamedirection.indexOf(evt.key);
    if (index != -1) {
        gamedirection.splice(index, 1);
        localStorage.setItem("camera", JSON.stringify(camera));
    }

});
document.addEventListener('mousemove', onMouseUpdate, false);

let pressing = false;
document.addEventListener('mousedown', function () {

    pressing = true;

}, false);
document.addEventListener('mouseup', function () {

    pressing = false;

}, false);


resize_canvas();

function sign(p1, p2, p3) {
    return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
}

function depth_to_color(depth) {

    max_depth = 7
    depth = Math.min(depth, max_depth);
    // depth = Math.max(depth, 18);

    if (depth < 5) depth = 1;
    // if (depth > 22) depth = 22;

    let a1 = (depth / (max_depth / 10)) / 10
    return colourGradientor(a1, [255, 255, 255], [30, 25, 40]);
    // return colourGradientor(a1, [30, 25, 40], [240, 240, 240]);
}
function colourGradientor(p, rgb_beginning, rgb_end) {

    var w = p * 2 - 1;

    var w1 = (w + 1) / 2.0;
    var w2 = 1 - w1;

    var rgb = [parseInt(rgb_beginning[0] * w1 + rgb_end[0] * w2),
    parseInt(rgb_beginning[1] * w1 + rgb_end[1] * w2),
    parseInt(rgb_beginning[2] * w1 + rgb_end[2] * w2)];
    return rgb;
};
function distance(x1, y1, x2, y2) {
    let y = x2 - x1;
    let x = y2 - y1;

    return Math.sqrt(x * x + y * y);
}
function distance3d(p1, p2) {
    var a = p2[0] - p1[0];
    var b = p2[1] - p1[1];
    var c = p2[2] - p1[2];

    return Math.sqrt(a * a + b * b + c * c);
}

function PointInTriangle(pt, v1, v2, v3) {
    var d1, d2, d3;
    var has_neg, has_pos;

    d1 = sign(pt, v1, v2);
    d2 = sign(pt, v2, v3);
    d3 = sign(pt, v3, v1);

    has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(has_neg && has_pos);
}

let draw_line = ([x1, y1], [x2, y2], p1_depth, p2_depth, outline = true) => {
    // Iterators, counters required by algorithm
    let x, y, dx, dy, dx1, dy1, px, py, xe, ye, i;
    // Calculate line deltas
    dx = x2 - x1;
    dy = y2 - y1;
    // Create a positive copy of deltas (makes iterating easier)
    dx1 = Math.abs(dx);
    dy1 = Math.abs(dy);
    // Calculate error intervals for both axis
    px = 2 * dy1 - dx1;
    py = 2 * dx1 - dy1;
    // The line is X-axis dominant
    if (dy1 <= dx1) {
        // Line is drawn left to right
        if (dx >= 0) {
            x = x1; y = y1; xe = x2;
        } else { // Line is drawn right to left (swap ends)
            x = x2; y = y2; xe = x1;
        }
        p(x, y, [x1, y1], [x2, y2], p1_depth, p2_depth, [0, 0, 0], outline = outline);
        // Rasterize the line
        for (i = 0; x < xe; i++) {
            x = x + 1;
            // Deal with octants...
            if (px < 0) {
                px = px + 2 * dy1;
            } else {
                if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                    y = y + 1;
                } else {
                    y = y - 1;
                }
                px = px + 2 * (dy1 - dx1);
            }
            // Draw pixel from line span at
            // currently rasterized position
            p(x, y, [x1, y1], [x2, y2], p1_depth, p2_depth, [0, 0, 0], outline = outline);
        }
    } else { // The line is Y-axis dominant
        // Line is drawn bottom to top
        if (dy >= 0) {
            x = x1; y = y1; ye = y2;
        } else { // Line is drawn top to bottom
            x = x2; y = y2; ye = y1;
        }
        p(x, y, [x1, y1], [x2, y2], p1_depth, p2_depth, [0, 0, 0], outline = outline);
        // Rasterize the line
        for (i = 0; y < ye; i++) {
            y = y + 1;
            // Deal with octants...
            if (py <= 0) {
                py = py + 2 * dx1;
            } else {
                if ((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) {
                    x = x + 1;
                } else {
                    x = x - 1;
                }
                py = py + 2 * (dx1 - dy1);
            }
            // Draw pixel from line span at
            // currently rasterized position
            p(x, y, [x1, y1], [x2, y2], p1_depth, p2_depth, [0, 0, 0], outline = outline);
        }
    }
}

function p(x, y, p1, p2, d1, d2, color, outline = false) {
    pixelline(x, y, p1, p2, d1, d2, color, outline);
    // pixelline(x+1, y, p1, p2, d1, d2, color, outline);
    // pixelline(x-1, y, p1, p2, d1, d2, color, outline);
    // pixelline(x, y+1, p1, p2, d1, d2, color, outline);
    // pixelline(x, y-1, p1, p2, d1, d2, color, outline);
}

function depth_btw_points(x, y, p1, p2, d1, d2) {
    let dis1 = distance(x, y, p1[0], p1[1]);
    let dis_total = distance(p1[0], p1[1], p2[0], p2[1]);
    let dis_per = 100 / (dis_total / dis1)
    let ddiff = Math.abs(d1 - d2);
    let depth = 0;
    if (d1 < d2) {
        depth = d1 + ddiff * (dis_per / 100);
    } else {
        depth = d1 - ddiff * (dis_per / 100);
    }
    return depth;
}

function pixelline(x, y, p1, p2, d1, d2, color, outline = false) {

    if (x <= 0 || y <= 0 || x >= width || y >= width) {
        return;
    }

    // let color = null;
    depth = depth_btw_points(x, y, p1, p2, d1, d2);

    if (outline) {
        depth -= .02;

    }

    if (!color) {
        color = depth_to_color(depth);
    }
    // color = [20,20,20];

    if (isNaN(depth) || !color) {
        return;
    }


    if (true) {
        // pixel_depth_index = x + "_" + y
        // if (pixels_depth.hasOwnProperty(pixel_depth_index)) {

        if (pixels_depth.length < x) {
            pixels_depth[x] = []
        } else {

            if (!pixels_depth[x]) {
                pixels_depth[x] = []
            }

            if (pixels_depth[x].length >= y) {
                previous_depth = pixels_depth[x][y];

                if (previous_depth < depth) {
                    return;
                }
            }

        }

        // if()

        // }
        // baja los efe pe eses a -2M
        pixels_depth[x][y] = depth;
    }


    // color = depth_to_color(depth);


    ci = ((y * width) + x) * 4;

    u8a[ci + 0] = color[0];
    u8a[ci + 1] = color[1];
    u8a[ci + 2] = color[2];
    u8a[ci + 3] = 255;

}

// const triangle_worker = new Worker("./js/drawTriangle.js");
let triangle_work_total = 0;
let triangle_work_current = 0;
let all_pixels = [];


p1 = [50, 50];
p3 = [350, 50];
p5 = [200, 250];




function fillBottomFlatTriangle(v1, v2, v3, color) {

    let invslope1 = ((v2[0] - v1[0]) / (v2[1] - v1[1])) + 0.00;
    let invslope2 = ((v3[0] - v1[0]) / (v3[1] - v1[1])) + 0.00;

    let curx1 = v1[0];
    let curx2 = v1[0];

    for (let scanlineY = v1[1]; scanlineY <= v2[1]; scanlineY++) {

        x1 = Math.round(curx1);
        x2 = Math.round(curx2);

        d1 = depth_btw_points(x1, scanlineY, v1, v2, v1[2], v2[2]);
        d2 = depth_btw_points(x2, scanlineY, v1, v3, v1[2], v3[2]);

        draw_hor_line(x1, x2, scanlineY, d1, d2, color);

        curx1 += invslope1;
        curx2 += invslope2;
    }
}

function fillTopFlatTriangle(v1, v2, v3, color) {
    let invslope1 = (v3[0] - v1[0]) / (v3[1] - v1[1]);
    let invslope2 = (v3[0] - v2[0]) / (v3[1] - v2[1]);

    let curx1 = v3[0];
    let curx2 = v3[0];

    let d1 = null, d2 = null;
    let x1 = null, x2 = null;

    for (let scanlineY = v3[1]; scanlineY > v1[1]; scanlineY--) {

        x1 = Math.round(curx1);
        x2 = Math.round(curx2);

        d1 = depth_btw_points(x1, scanlineY, v1, v3, v1[2], v3[2]);
        d2 = depth_btw_points(x2, scanlineY, v2, v3, v2[2], v3[2]);

        draw_hor_line(x1, x2, scanlineY, d1, d2, color);
        curx1 -= invslope1;
        curx2 -= invslope2;
    }
}
function draw_hor_line(x1, x2, y, d1, d2, color) {

    // color = [255,255,255]
    let m = Math.max(x1, x2);
    for (let x = Math.min(x1, x2); x < m; x++) {
        // for (let x = Math.min(x1, x2)-1; x < m+1; x++) {
        pixelline(x, y, [x1, y], [x2, y], d1, d2, color);
    }

}
function sortVerticesAscendingByY(ps) {
    return ps.sort(function (a, b) { return a[1] - b[1]; });
    // return ps
}
function drawTriangle(v1, v2, v3, color) {
    /* at first sort the three vertices by y-coordinate ascending so v1 is the topmost vertice */
    [rp1, rp2, rp3] = sortVerticesAscendingByY([v1, v2, v3]);


    /* here we know that v1.y <= v2.y <= v3.y */
    /* check for trivial case of bottom-flat triangle */
    if (rp2[1] == rp3[1]) {
        fillBottomFlatTriangle(rp1, rp2, rp3, color);
    }
    /* check for trivial case of top-flat triangle */
    else if (rp1[1] == rp2[1]) {
        fillTopFlatTriangle(rp1, rp2, rp3, color);
    } else {
        /* general case - split the triangle in a topflat and bottom-flat one */
        let v4 = [parseInt(rp1[0] + ((rp2[1] - rp1[1]) / (rp3[1] - rp1[1])) * (rp3[0] - rp1[0])), rp2[1]];
        // depth of V4
        let d4 = depth_btw_points(v4[0], v4[1], rp1, rp3, rp1[2], rp3[2]);
        v4.push(d4);

        fillBottomFlatTriangle(rp1, rp2, v4, color);
        fillTopFlatTriangle(rp2, v4, rp3, color);
    }
}


// drawTriangle(
//     [248,376],
//     [409,399],
//     [270,541],
//     15,12,2
// )

// drawTriangle(
//     [100,400, 12],
//     [200,450, 2],
//     [250,263, 2]
// )
// drawTriangle(
//     [100,480, 12],
//     [200,480, 2],
//     [190, 430, 2]
// )

main(true);
array_to_canvas();
