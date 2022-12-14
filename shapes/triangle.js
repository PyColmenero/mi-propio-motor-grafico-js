const triangle1 = {
    "coordinates": {"x": 100, "y": 11, "z": 110},
    // "coordinates": {"x": 100, "y": 0, "z": 110},
    // "angles": {"x": 0, "y": 0, "z": 0},
    "angles": {"x": 0, "y": 0, "z": 0},
    "scale": {"x": 3, "y": 5, "z": 3},
    "points": [
        {"x": -1 , "y": -1, "z": -1},
        {"x": 0, "y": 1, "z": 0},
        {"x": 1, "y": -1, "z": -1},
        {"x": -1 , "y": -1, "z": 1},
        {"x": 1, "y": -1, "z": 1},
    ],
    // "relations": [
    //     [0,1,2],
    //     // [0,0,0],
    //     [0,1,4],
    //     [1,4,5],
    //     [1,5,6],
    //     [1,6,2],
    //     [0,4,7],
    //     [0,7,3],
    //     [4,5,6],
    //     [4,6,7],
    //     [0,2,3],
    //     [0,0,0],
    //     [0,0,0]
    // ],
    "relations": [
        [0,1,2],
        [1,3,4],
        [0,3,1],
        [0,2,3],
        [2,4,3],
        [2,1,4]
    ],
    // "colors": [
    //     [220, 220, 220],
    //     [220, 220, 220],
    //     [220, 220, 220],
    //     [220, 220, 220],
    //     [220, 220, 220],
    //     [220, 220, 220],
    // ]
    "colors": [
        [138, 0, 212],
        [240,240,240],
        [220,120,20],
        [20,20,20],
        [20,20,20],
        [60,60,60],
    ]
}