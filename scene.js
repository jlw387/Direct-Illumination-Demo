import * as THREE from 'three'

import * as CMATH from './custom_math.js'

export function setup_scene(scene, lightDirectionTheta, lightDirectionPhi)
{
    scene.clear();

    // Create a ground plane
    var groundGeometry = new THREE.PlaneGeometry(400, 400); // Adjust the size as needed
    var groundMaterial = new THREE.MeshLambertMaterial({ color: 0x00c000 }); // Choose the color or material you want
    var ground = new THREE.Mesh(groundGeometry, groundMaterial);

    // Rotate the ground plane to be horizontal
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    var num_trees = Math.round(Math.min(Math.max(5, CMATH.gaussianRandom(50,25)),100));
    const treeRange = 120;
    const treeBuffer = 15;

    for(let i = 0; i < num_trees; ++i)
    {
        var x = random_tree_coord(treeRange, treeBuffer);
        var z = random_tree_coord(treeRange, treeBuffer);

        var num_segments = CMATH.intGaussianWithBounds(3,1,1,5);
        var trunkRad = CMATH.gaussianWithBounds(3,1,0.5,7);
        var trunkHeight = CMATH.gaussianWithBounds(trunkRad, trunkRad*2, 0.5 * trunkRad, 20 * trunkRad);
        var leafRad = CMATH.gaussianWithBounds(2*trunkRad * (trunkHeight / trunkRad),trunkRad,1.4*trunkRad,4*trunkRad);
        
        var leafHeight = CMATH.gaussianWithBounds(leafRad * (trunkHeight / trunkRad) * (2 + num_segments/3), leafRad, leafRad, 5 * leafRad);

        add_tree(scene, x, 0.0, z, trunkRad, trunkHeight, leafRad, leafHeight, num_segments, 0.5, 1.25, 0x522f14, random_tree_color());
    }
        
    
    // Axis Helper (DEBUG)
    //const axesHelper = new THREE.AxesHelper( 5 );
    //scene.add( axesHelper );

    // Add lighting to the scene (optional)
    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.name = "dir_light";
    light.target.position.set(0,0,0);

    var light_pos = CMATH.sphericalToCartesian(lightDirectionTheta, lightDirectionPhi);
    light.position.set(light_pos.pos_x, light_pos.pos_y, light_pos.pos_z);

    scene.add(light);
}

function random_tree_coord(treeRange, treeBuffer)
{
    const halfSize = treeRange - treeBuffer;
    var x = (halfSize) * 2 * Math.random();
    if(x < halfSize){
        return -treeBuffer - (halfSize - x);
    }

    return treeBuffer + (x - halfSize);
}

function random_tree_color()
{
    var r = CMATH.intGaussianWithBounds(48,48,0,128);
    var g = CMATH.intGaussianWithBounds(192,32,128,255);
    var b = CMATH.intGaussianWithBounds(16,16,0,48);

    return (r << 16) + (g << 8) + b;
}

function add_tree(scene, x, y, z, 
                    trunkRadius, trunkHeight, 
                    leafRadius, leafHeight,
                    numSegments = 3, indentFactor = 0.5, 
                    segmentSpacingfactor = 1.25,
                    trunkColor = 0x522f14, leafColor=0x008020)
{
    const tree = new THREE.Group();
    
    const eps = 0.01;

    // Create trunk
    var treeTrunkGeometry = new THREE.CylinderGeometry(trunkRadius,
                                                        trunkRadius,
                                                        trunkHeight + eps,
                                                        32, 1, false);
    const treeTrunkMaterial = new THREE.MeshStandardMaterial({ color: trunkColor });
    var treeTrunkMesh = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
    treeTrunkMesh.position.set(0, (trunkHeight + eps)/2, 0);

    tree.add(treeTrunkMesh);

    const treeLeafMaterial = new THREE.MeshStandardMaterial({ color: leafColor });

    // Create leaf segments
    const trueSlope = leafHeight / leafRadius;
    const indentSlope = trueSlope / indentFactor;
    const segmentSlopeNumer = trueSlope / numSegments; 
    const segmentSlopeDenom = (1 - indentFactor) + (indentFactor / numSegments);
    const segementSlope = segmentSlopeNumer / segmentSlopeDenom;

   
    // console.log("True Slope", trueSlope);
    // console.log("Indent Slope", indentSlope);
    // console.log("Segment Slope", segementSlope);
    // console.log("");

    for(let i = 0; i < numSegments; ++i) {
        var t_start = 1.0 - Math.pow((numSegments - i*1.0) / numSegments, segmentSpacingfactor);
        var t_end = 1.0 - Math.pow((numSegments - i - 1.0) / numSegments, segmentSpacingfactor);
        
        var segmentStartHeight = t_start * leafHeight + trunkHeight;
        var segmentEndHeight = t_end * leafHeight + trunkHeight;

        var segmentHeight = segmentEndHeight - segmentStartHeight;

        var segmentEndVDistToTop = (1 - t_end) * leafHeight;
        
        var segmentEndWidth = segmentEndVDistToTop / indentSlope;
        var segmentDeltaWidth = segmentHeight / segementSlope;
        var segmentStartWidth = segmentEndWidth + segmentDeltaWidth;

        // console.log("Segment " + i.toString() + " t End:", t_end);
        // console.log("Segment " + i.toString() + " Height:", segmentHeight);
        // console.log("Segment " + i.toString() + " Start Width:", segmentStartWidth);
        // console.log("Segment " + i.toString() + " Delta Width:", segmentDeltaWidth);
        // console.log("Segment " + i.toString() + " End Width:", segmentEndWidth);

        var leafSegmentGeometry = new THREE.CylinderGeometry(segmentEndWidth, 
                                                            segmentStartWidth, 
                                                            segmentHeight + eps, 
                                                            32, 1, false);
        var leafSegmentMesh = new THREE.Mesh(leafSegmentGeometry, treeLeafMaterial);
        
        var segmentCenter = (segmentStartHeight + segmentEndHeight + eps) / 2;
        leafSegmentMesh.position.set(0.0, segmentCenter, 0.0)
        
        console.log("");

        tree.add(leafSegmentMesh);
    }

    tree.position.set(x, y, z);

    scene.add(tree);
}

export function setup_custom_objects(scene, customMaterial){
    // Create Custom Sphere
    const sphereGeo = new THREE.SphereGeometry(1.0,32,16);
    const sphereMesh = new THREE.Mesh(sphereGeo, customMaterial);
    sphereMesh.position.set(0,1,0);
    sphereMesh.name = "custom_material_sphere";

    scene.add(sphereMesh);

    // Create Custom Box
    const boxGeo = new THREE.BoxGeometry(2,2,2);
    const boxMesh = new THREE.Mesh(boxGeo, customMaterial);
    boxMesh.name = "custom_material_box";
    boxMesh.position.set(0,1,0);
    boxMesh.visible = false;

    scene.add(boxMesh);

    // Create Custom Cylinder
    const cylinderGeo = new THREE.CylinderGeometry(1.0,1.0,2.0,32,1,false);
    const cylinderMesh = new THREE.Mesh(cylinderGeo, customMaterial);
    cylinderMesh.name = "custom_material_cylinder";
    cylinderMesh.position.set(0,1,0);
    cylinderMesh.visible = false;

    scene.add(cylinderMesh);

    // Create Custom Cone
    const coneGeo = new THREE.CylinderGeometry(0.0,1.0,2.0,64,1,false);
    const coneMesh = new THREE.Mesh(coneGeo, customMaterial);
    coneMesh.name = "custom_material_cone";
    coneMesh.position.set(0,1,0);
    coneMesh.visible = false;

    scene.add(coneMesh);

    // Create Custom Octahedron
    const octahedronGeo = new THREE.OctahedronGeometry(1.0);
    const octahedronMesh = new THREE.Mesh(octahedronGeo, customMaterial);
    octahedronMesh.name = "custom_material_octahedron";
    octahedronMesh.position.set(0,1,0);
    octahedronMesh.visible = false;

    scene.add(octahedronMesh);

    // Create Custom Octahedron
    const dodecahedronGeo = new THREE.DodecahedronGeometry(1.0);
    const dodecahedronMesh = new THREE.Mesh(dodecahedronGeo, customMaterial);
    dodecahedronMesh.name = "custom_material_dodecahedron";
    dodecahedronMesh.position.set(0,1,0);
    dodecahedronMesh.visible = false;

    scene.add(dodecahedronMesh);

    // Create Custom Octahedron
    const icosahedronGeo = new THREE.IcosahedronGeometry(1.0);
    const icosahedronMesh = new THREE.Mesh(icosahedronGeo, customMaterial);
    icosahedronMesh.name = "custom_material_icosahedron";
    icosahedronMesh.position.set(0,1,0);
    icosahedronMesh.visible = false;

    scene.add(icosahedronMesh);
}

export function updateDirLight(scene, name, theta, phi, lightColor)
{
    var cart_coords = CMATH.sphericalToCartesian(theta, phi);

    scene.getObjectByName(name).position.set(cart_coords.pos_x, 
                                                cart_coords.pos_y, 
                                                cart_coords.pos_z);

    scene.getObjectByName(name).color = new THREE.Color(lightColor);
}

export function update_custom_objects_material(scene, updatedMaterial){

    const objList = ["sphere", "box", "cylinder", "cone", "octahedron", "dodecahedron", "icosahedron"];

    objList.forEach(function(objName){
        scene.getObjectByName("custom_material_" + objName).material = updatedMaterial;
    })
   
}