import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var myCanvas = document.getElementById("wedding-canvas");
let siteWrapper = document.getElementById("site-wrapper");
let detailsBtn = document.querySelector('.details');

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

window.addEventListener('deviceorientation', function(event) {
    let alpha = event.alpha; // Z-axis rotation in degrees
    let beta = event.beta; // X-axis rotation in degrees
    let gamma = event.gamma; // Y-axis rotation in degrees

    // Convert degrees to radians
    let alphaRad = alpha * (Math.PI / 180);
    let betaRad = beta * (Math.PI / 180);
    let gammaRad = gamma * (Math.PI / 180);

    // Apply rotation to the camera
    //camera.rotation.set(betaRad, alphaRad, -gammaRad);
    camera.rotateY(alphaRad/6);
}, true);

const sc = 0.4; // scale
const scw = 0.13;
let mixer;
let dove;
const clock = new THREE.Clock();
const loader = new GLTFLoader();
const loader2 = new GLTFLoader();
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
        });
	}, undefined, function(error) {
		console.error(error);
	}
);

loader2.load(
	'models/churchbake.glb',
	function ( gltf ) {
		const model = gltf.scene;
		console.log(model);
		scene.add(model);
		const grass = scene.getObjectByName("GRASS001");
		console.log(grass);
		model.scale.set(scw, scw, scw);
        model.translateY(-6);
        model.rotateY(32)
	}
);

function animate() {
    TWEEN.update();
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    var dt = clock.getDelta();
    if (mixer) {
        mixer.update( dt );
    }
}

animate();




detailsBtn.addEventListener('click', () => {
    if (!isInfoOpen) {
        const tween1 = new TWEEN.Tween({x: camera.position.x, y: camera.position.y, z: camera.position.z })
        .to({x: camera.position.x, y: -4.7, z: camera.position.z}, 1000);

        tween1.onUpdate((object, elapsed) => {
            camera.position.y = object.y;
        })
        tween1.start();
        tween1.onComplete(() => {
            dove.scale.set(scw, scw, scw);
            dove.translateY(-6);
        })
    } else {
        const tween2 = new TWEEN.Tween({x: camera.position.x, y: camera.position.y, z: camera.position.z })
        .to({x: camera.position.x, y: 0, z: camera.position.z}, 1000);

        tween2.onUpdate((object, elapsed) => {
            camera.position.y = object.y;
        })
        tween2.start();
        dove.scale.set(sc, sc, sc);
        dove.translateY(6);
        
    }
    
})


