import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var myCanvas = document.getElementById("wedding-canvas")

var resizeObserver = new ResizeObserver(entry => {
    camera.aspect = myCanvas.getBoundingClientRect().width / myCanvas.getBoundingClientRect().height;
    camera.updateProjectionMatrix();
    renderer.setSize(myCanvas.getBoundingClientRect().width, myCanvas.getBoundingClientRect().height);
})
resizeObserver.observe(myCanvas)



const scene = new THREE.Scene();
let rendererHeight = myCanvas.getBoundingClientRect().height;
const ratio = window.innerWidth / rendererHeight;
const camera = new THREE.OrthographicCamera(-ratio, ratio, 1, -1, 0.01, 100);
const renderer = new THREE.WebGLRenderer({
	antialias: true,
	canvas: myCanvas,
	alpha: true 
});
renderer.setSize( window.innerWidth, rendererHeight );
renderer.outputEncoding = THREE.sRGBEncoding; 
renderer.ena
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 1.2;

// LIGHTS
const light = new THREE.AmbientLight( 0x898989, 0.9 ); // soft white light
scene.add( light );
const sun = new THREE.DirectionalLight(0xffffff, 0.6);
sun.position.set(2, 6, 6);
const targetObject = new THREE.Object3D(-2, 1, -3);
scene.add(targetObject);
sun.target = targetObject;
sun.castShadow = true;
sun.shadow.camera.far = 20;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.normalBias = 0.05;
scene.add(sun);

renderer.setClearColor( 0x000000, 0 );
camera.position.y = 0;
camera.position.z = 50;

const sc = 0.05; // scale

let mixer;
const loader = new GLTFLoader();
loader.load(
	'models/dove.glb',

	// called when the resource is loaded
	function ( gltf ) {
		const model = gltf.scene;
		console.log(model);
		scene.add(model);
		model.castShadow = true;
		model.scale.set(sc, sc, sc);
		model.traverse(function(node) {
			if (node.isMesh)
				node.castShadow = true;
				node.receiveShadow = true;
		})
		mixer = new THREE.AnimationMixer(model);
		const clips = gltf.animations;
		clips.forEach(clip => {
			const action = mixer.clipAction(clip);
			action.play();
		});
	}, undefined, function(error) {
		console.error(error);
	}
);
const clock = new THREE.Clock();

function animate() {
	requestAnimationFrame( animate );
	//controls.update();
	renderer.render( scene, camera );
	if (mixer)
		mixer.update( clock.getDelta() );
}

animate();