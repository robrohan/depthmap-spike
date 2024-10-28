import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

//////////////////////////////////////////////

const RGBTexture = new URL("./assets/AppleBin.jpg", import.meta.url);
const DepthTexture = new URL("./assets/AppleBin_depth.png", import.meta.url);

const textures = [null, null];

/////////////////////////////////////////////

let mesh;
let material;
// let image_ar;

const settings = {
	metalness: 0.0,
	roughness: 1.0,
	ambientIntensity: 1,
	displacementScale: 1,
	displacementBias: 0,
};

// init
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 3;

const scene = new THREE.Scene();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xff0000, 0.5);
pointLight.position.z = 2500;
scene.add(pointLight);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);
// renderer.xr.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);


// animation
function animation(time) {
	renderer.render(scene, camera);
}

function onWindowResize() {
	const aspect = window.innerWidth / window.innerHeight;
	camera.aspect = aspect;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);


// orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enableDamping = true;


{
	const i1 = new Image();
	i1.onload = function() {
		const ctx = document.createElement('canvas').getContext('2d');
		ctx.canvas.width = i1.width;
		ctx.canvas.height = i1.height;
		ctx.drawImage(i1, 0, 0, i1.width, i1.height, 0, 0, i1.width, i1.height);
		const myrgbmap = new THREE.CanvasTexture(ctx.canvas);
		textures[0] = myrgbmap;

		window.dispatchEvent(new CustomEvent("texture_loaded", {}));
	}
	i1.src = RGBTexture;

	const i2 = new Image();
	i2.onload = function() {
		const ctx2 = document.createElement('canvas').getContext('2d');
		ctx2.canvas.width = i2.width;
		ctx2.canvas.height = i2.height;
		ctx2.drawImage(i2, 0, 0, i2.width, i2.height, 0, 0, i2.width, i2.height);
		const mydepthmap = new THREE.CanvasTexture(ctx2.canvas);
		textures[1] = mydepthmap;

		window.dispatchEvent(new CustomEvent("texture_loaded", {}));
	}
	i2.src = DepthTexture;
}

{
	// setup gui
	const gui = new GUI();
	gui.add(settings, 'metalness').min(0).max(1).onChange(function (value) {
		material.metalness = value;
	});
	gui.add(settings, 'roughness').min(0).max(1).onChange(function (value) {
		material.roughness = value;
	});
	gui.add(settings, 'ambientIntensity').min(0).max(1).onChange(function (value) {
		ambientLight.intensity = value;
	});
	gui.add(settings, 'displacementScale').min(0).max(30.0).onChange(function (value) {
		material.displacementScale = value;
	});
	gui.add(settings, 'displacementBias').min(-10).max(10).onChange(function (value) {
		material.displacementBias = value;
	});
}

window.addEventListener('texture_loaded', function (e) {
	console.log(textures);
	if(textures[0] != null && textures[1] != null) {
		if (mesh) {
			mesh.geometry.dispose();
			mesh.material.dispose();
			scene.remove(mesh);
		}
		const myrgbmap = textures[0];
		const mydepthmap = textures[1];

		// material
		material = new THREE.MeshStandardMaterial({
			color: 0xaaaaaa,
			roughness: settings.roughness,
			metalness: settings.metalness,
			map: myrgbmap,
			displacementMap: mydepthmap,
			displacementScale: settings.displacementScale,
			displacementBias: settings.displacementBias,
			side: THREE.DoubleSide
		});

		// generating geometry and add mesh to scene
		const geometry = new THREE.PlaneGeometry(10, 10, 512, 512);
		mesh = new THREE.Mesh(geometry, material);
		mesh.scale.multiplyScalar(0.23);
		scene.add(mesh);
	}
});
