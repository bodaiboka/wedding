import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var myCanvas = document.getElementById("wedding-canvas");
let siteWrapper = document.getElementById("site-wrapper");

var resizeObserver = new ResizeObserver(entry => {
    console.log("canvas change");
    camera.aspect = myCanvas.getBoundingClientRect().width / myCanvas.getBoundingClientRect().height;
    camera.updateProjectionMatrix();
    renderer.setSize(myCanvas.getBoundingClientRect().width, myCanvas.getBoundingClientRect().height);
});
resizeObserver.observe(myCanvas);

const scene = new THREE.Scene();
let rendererHeight = myCanvas.getBoundingClientRect().height;
const ratio = window.innerWidth / rendererHeight;
//const camera = new THREE.OrthographicCamera(-ratio, ratio, 1, -1, 0.01, 100);
const camera = new THREE.PerspectiveCamera( 25, ratio, 0.01, 1000 );
scene.add(camera);
const renderer = new THREE.WebGLRenderer({
	antialias: true,
	canvas: myCanvas,
	alpha: true 
});

camera.aspect = myCanvas.getBoundingClientRect().width / myCanvas.getBoundingClientRect().height;
camera.updateProjectionMatrix();
renderer.setSize(myCanvas.getBoundingClientRect().width, myCanvas.getBoundingClientRect().height);

renderer.outputColorSpace = THREE.SRGBColorSpace; 
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

const size = 10;
const divisions = 10;

const gridHelper = new THREE.GridHelper( size, divisions );
//scene.add( gridHelper );

renderer.setClearColor( 0x000000, 0 );
renderer.setPixelRatio(window.devicePixelRatio);
camera.position.y = 0;
camera.position.z = 16;

const sc = 0.4; // scale

let mixer;
let dove;
const loader = new GLTFLoader();
loader.load(
	'models/dove.glb',

	// called when the resource is loaded
	function ( gltf ) {
		dove = gltf.scene;
		console.log(dove);
		scene.add(dove);
		dove.castShadow = true;
		dove.scale.set(sc, sc, sc);
		dove.traverse(function(node) {
			if (node.isMesh)
				node.castShadow = true;
				node.receiveShadow = true;
		})
		mixer = new THREE.AnimationMixer(dove);
		const clips = gltf.animations;
		clips.forEach(clip => {
			const action = mixer.clipAction(clip);
            action.loop = THREE.LoopRepeat;
            /* action.zeroSlopeAtStart = false;
            action.zeroSlopeAtEnd = false; */
            action.setDuration(16);
            action.play();
		
            function animate() {
                requestAnimationFrame( animate );
                renderer.render( scene, camera );
                var dt = clock.getDelta();
                mixer.update( dt );
            }
            
            animate();
        });
	}, undefined, function(error) {
		console.error(error);
	}
);
const clock = new THREE.Clock();

