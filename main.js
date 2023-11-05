import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import * as CMATH from './custom_math.js';
import * as SCENE from './scene.js';
import * as FILE from './file.js'

const scene = new THREE.Scene();

const origin = new THREE.Vector3(0,0,0);
const cameraFocus = new THREE.Vector3(0,1.0,0);
scene.background = new THREE.Color(0x80D0FF);

const camera = new THREE.PerspectiveCamera( 75, 1.5, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
const canvasWidth = Math.min(window.innerWidth / 2, Math.floor(window.innerHeight * 1.5));
renderer.setSize( canvasWidth, Math.floor(canvasWidth / 1.5) );

const render_element = document.getElementById("renderCanvas");
render_element.appendChild( renderer.domElement );

camera.position.set(3, 3, 3);
camera.lookAt(0.0,1.0,0.0);
const controls = new OrbitControls( camera, renderer.domElement );
controls.target = cameraFocus;
controls.update();

// Set up important variables
var lightDirectionTheta = document.getElementById("lightDirectionThetaSlider").value;
var lightDirectionPhi = document.getElementById("lightDirectionPhiSlider").value;

var thetaValueText = document.getElementById("lightDirectionThetaValue");
var phiValueText = document.getElementById("lightDirectionPhiValue");

var kaSlider = document.getElementById("kaSlider");
var kdSlider = document.getElementById("kdSlider");
var ksSlider = document.getElementById("ksSlider");
var nsSlider = document.getElementById("nsSlider");

var kaValueText = document.getElementById("kaValue");
var kdValueText = document.getElementById("kdValue");
var ksValueText = document.getElementById("ksValue");
var nsValueText = document.getElementById("nsValue");

var kaValue = kaSlider.value;
var kdValue = kdSlider.value;
var ksValue = ksSlider.value;
var nsValue = nsSlider.value;

var objectColor = document.getElementById("colorpick_objectColor").value;
var lightColor = document.getElementById("colorpick_lightColor").value;

// Set up sliders
var sliders = document.querySelectorAll(".custom_slider");
sliders.forEach(function(slider){
    slider.addEventListener("input", handleSliderChange);
});

// Set up text boxes
var textboxes = document.querySelectorAll(".custom_text_entry");
textboxes.forEach(function(textbox){
    textbox.addEventListener("change", handleTextEntryChange);
});

// Set up color pickers
var colorpickers = document.querySelectorAll(".colorpicker");

colorpickers.forEach(function(colorpicker) {
    colorpicker.addEventListener("input", handleColorChange);
});

// Load Vertex Shader
var vertexShaderText = "";
try{
	vertexShaderText = FILE.loadFile("vertexShader.vs");
}
catch(error){
	console.log(error);
}

// Load Default Fragment Shader
var defaultFragmentShaderText = ""
try{
	defaultFragmentShaderText = FILE.loadFile("fragmentShader.fs");
}
catch(error){
	console.log(error);
}

// Custom Shader Prefix
var fragShaderPrefixText = ""

fragShaderPrefixText += "uniform vec3 objColor\;\n";
fragShaderPrefixText += "uniform vec3 lightDir\;\n";
fragShaderPrefixText += "uniform vec3 lightColor\;\n";
fragShaderPrefixText += "uniform float k_a\;\n";
fragShaderPrefixText += "uniform float k_d\;\n";
fragShaderPrefixText += "uniform float k_s\;\n";
fragShaderPrefixText += "uniform float n_s\;\n";
fragShaderPrefixText += "\n";
fragShaderPrefixText += "varying vec3 fPosition\;\n";
fragShaderPrefixText += "varying vec3 fNormal\;\n";
fragShaderPrefixText += "varying vec3 fCameraPos\;\n";
fragShaderPrefixText += "\n";

// Create Shader Material
var cart_light_coords = CMATH.sphericalToCartesian(lightDirectionTheta, lightDirectionPhi);

const customMaterial = new THREE.ShaderMaterial( {

	uniforms: {
		k_a: { value: kaValue },
		k_d: { value: kdValue },
		k_s: { value: ksValue },
		n_s: { value: nsValue },

		objColor: { value: new THREE.Color(objectColor) },
		lightColor: { value: new THREE.Color(lightColor) },
		
		lightDir: { value: new THREE.Vector3(cart_light_coords.pos_x,
												cart_light_coords.pos_y,
												cart_light_coords.pos_z) },
	},
	transparent: true,
	vertexShader: vertexShaderText,
	fragmentShader: defaultFragmentShaderText
} );

SCENE.setup_scene(scene, lightDirectionTheta, lightDirectionPhi);
SCENE.setup_custom_objects(scene, customMaterial);

var unitizeCoefficientsButton = document.getElementById("unitize_button");
unitizeCoefficientsButton.addEventListener("click", unitizeCoefficients);

var objectDropdown = document.getElementById("objectDropdown");
objectDropdown.addEventListener("change", handleDropdownChange);

var currentObject = objectDropdown.value;

var customShaderToggle = document.getElementById("customShaderToggle");
customShaderToggle.addEventListener("change", toggleCustomShader);

const shaderUpdateMenu = document.getElementById("customShaderContainer");

const shaderUpdateButton = document.getElementById("shaderUpdateButton");
shaderUpdateButton.addEventListener("click", () => { updateShader(true); });

function handleDropdownChange(){
	scene.getObjectByName("custom_material_" + currentObject).visible = false;
	scene.getObjectByName("custom_material_" + objectDropdown.value).visible = true;
	currentObject = objectDropdown.value;
}

function handleSliderChange(event){
    var id = event.target.id;

    switch(id)
    {
        case "lightDirectionThetaSlider":
            lightDirectionTheta = event.target.value;
			thetaValueText.value = event.target.value;
			updateDirectionalLight(scene);
            break;

        case "lightDirectionPhiSlider":
            lightDirectionPhi = event.target.value;
			phiValueText.value = event.target.value;
            updateDirectionalLight(scene);
            break;

		case "kaSlider":
			kaValue = event.target.value;
			kaValueText.value = event.target.value;
			break;

		case "kdSlider":
			kdValue = event.target.value;
			kdValueText.value = event.target.value;
			break;

		case "ksSlider":
			ksValue = event.target.value;
			ksValueText.value = event.target.value;
			break;

		case "nsSlider":
			nsValue = event.target.value;
			nsValueText.value = event.target.value;
			break;

    }

	updateShader(customShaderToggle.checked);
}

function handleTextEntryChange(event){
	var id = event.target.id;

	var clamped_to_positive_value = Math.max(0, event.target.value);

	switch(id){
		case "kaValue":
			kaValue = clamped_to_positive_value;
			kaSlider.value = clamped_to_positive_value;
			kaValueText.value = clamped_to_positive_value;
			break;

		case "kdValue":
			kdValue = clamped_to_positive_value;
			kdSlider.value = clamped_to_positive_value;
			kdValueText.value = clamped_to_positive_value;
			break;

		case "ksValue":
			ksValue = clamped_to_positive_value;
			ksSlider.value = clamped_to_positive_value;
			ksValueText.value = clamped_to_positive_value;
			break;

		case "nsValue":
			nsValue = clamped_to_positive_value;
			nsSlider.value = clamped_to_positive_value;
			nsValueText.value = clamped_to_positive_value;
			break;
	}

	updateShader(customShaderToggle.checked);
}

function handleColorChange(event){
    var id = event.target.id;
 
    switch(id)
    {   
        case "colorpick_objectColor":
            objectColor = event.target.value;
			updateShader(customShaderToggle.checked);
            break;

        case "colorpick_lightColor":
            lightColor = event.target.value;
			updateDirectionalLight(scene);
			updateShader(customShaderToggle.checked);
            break;        
    }

}

function unitizeCoefficients(event){
	// Compute new coefficients
	var sum = parseFloat(kaValue) + parseFloat(kdValue) + parseFloat(ksValue);

	if(sum == 0)
		return;

	kaValue /= sum;
	kdValue /= sum;
	ksValue /= sum;

	// Update k_a elements
	kaSlider.value = kaValue;
	kaValueText.value = kaValue;

	// Update k_d elements
	kdSlider.value = kdValue;
	kdValueText.value = kdValue;

	// Update k_s elements
	ksSlider.value = ksValue;
	ksValueText.value = ksValue;

	updateShader(customShaderToggle.checked);
}

function toggleCustomShader(event){
	if(event.target.checked){
		// Set Custom Shader to Active
		shaderUpdateMenu.classList.remove("hidden");
		updateShader(true);
	}
	else {
		// Set Custom Shader to Inactive
		shaderUpdateMenu.classList.add("hidden");
		updateShader(false);
	}
}

function updateDirectionalLight(scene){
	SCENE.updateDirLight(scene, "dir_light", lightDirectionTheta, lightDirectionPhi, lightColor);
}

function updateShader(custom = false){
	var cart_light_coords = CMATH.sphericalToCartesian(lightDirectionTheta, lightDirectionPhi);

	var customFragShaderText = document.getElementById("customShaderTextbox").value;
	var fragShader = custom ? fragShaderPrefixText + customFragShaderText : defaultFragmentShaderText;

	const updatedMaterial = new THREE.ShaderMaterial( {

		uniforms: {
			k_a: { value: kaValue },
			k_d: { value: kdValue },
			k_s: { value: ksValue },
			n_s: { value: nsValue },
	
			objColor: { value: new THREE.Color(objectColor) },
			lightColor: { value: new THREE.Color(lightColor) },
			
			lightDir: { value: new THREE.Vector3(cart_light_coords.pos_x,
													cart_light_coords.pos_y,
													cart_light_coords.pos_z) },
		},
		transparent: true,
		vertexShader: vertexShaderText,
		fragmentShader: fragShader
	
	} );

	SCENE.update_custom_objects_material(scene, updatedMaterial);
}

function animate() {
	requestAnimationFrame( animate );

	renderer.render( scene, camera );
}

animate();