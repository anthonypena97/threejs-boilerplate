// TESTED ON DESKTOP CHROME - SAFARI iOS - CHROME iOS - INSTAGRAM - TWITTER - 01/08/2022

import * as THREE from "three";
import { Vector3 } from "three";
import { InteractionManager } from "three.interactive";

// ==================================================== GLOBAL SCOPE DECLARATIONS ========================================================

let camera: THREE.PerspectiveCamera, scene: THREE.Scene, raycaster: THREE.Raycaster, renderer: THREE.WebGLRenderer;
let object: THREE.Mesh;
let canvas_dom: any;
let planes = [];
let intersects: any;

let target2 = new THREE.Vector2();
let target3 = new THREE.Vector3();
let target4 = new THREE.Vector4();

let INTERSECTED: any;

let zoom = 1;

const pointer = new THREE.Vector2(50, 50);
const isMobile = window.matchMedia("(max-width: 900px)");
const isMobileLandscape = window.matchMedia("(max-width: 900px) and (min-width: 700px)");

// for mobile browsing debugging
let version = document.getElementById("version");
let debugConsole = document.getElementById("debugConsole");
let stats = document.getElementById("stats");
let canvasSize = document.getElementById("canvasSize");

// //// UNCOOMMENT FOR DEBUGGING ////
// devevelopment version
// version.innerHTML = '50';

let ua = navigator.userAgent || navigator.vendor;
let isInstagram = (ua.indexOf('Instagram') > -1) ? true : false;

window.addEventListener('wheel', e => {
    e.preventDefault();
}, { passive: false });

window.addEventListener('gesturestart', e => e.preventDefault());
window.addEventListener('gesturechange', e => e.preventDefault());
window.addEventListener('gestureend', e => e.preventDefault());

// ============================================================ SCRIPT CALLS  ==============================================================

// //// UNCOMMENT FOR DEBUGGING - functions for displaying pages sizes ////
// window.onload = showViewport;
// window.onresize = showViewport;

// fix for instagram in app browser wrong height
if (isInstagram) {

    // //// UNCOOMMENT FOR DEBUGGING ////
    // debugConsole.innerHTML = 'instagram';

    setTimeout(function () {

        init();
        animate();

    }, 1000)

} else {

    init();
    animate();

}

// ============================================================ MAIN LOGIC STRUCTURE  =======================================================

function init() {

    // //// UNCOOMMENT FOR DEBUGGING ////
    // canvasSize.innerHTML = `C = ${window.innerWidth} x ${window.innerHeight}`

    // ==================================================== CAMERA ========================================================
    camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    if (isMobile.matches || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

        camera.position.z = 600;

    } else {

        camera.position.z = 400;

    }


    // ==================================================== SCENE ========================================================
    scene = new THREE.Scene();


    // ==================================================== MATERIAL ========================================================
    const texture = new THREE.TextureLoader().load("https://i.scdn.co/image/ab67706c0000bebbbd8a62c26fa146211707c5de");

    const geometry = new THREE.BoxGeometry(200, 200, 200);
    const material = new THREE.MeshBasicMaterial({ map: texture });


    // ==================================================== MESH ========================================================
    object = new THREE.Mesh(geometry, material);
    scene.add(object);
    planes.push(object);;


    // ==================================================== RAYCASTER ========================================================
    raycaster = new THREE.Raycaster();


    // ==================================================== RENDERER ========================================================
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio * 1.5);
    renderer.setSize(window.innerWidth, window.innerHeight);

    canvas_dom = renderer.domElement;
    document.body.appendChild(canvas_dom);

    document.getElementsByTagName('body')[0].classList.add('pageLock');
    document.getElementsByTagName('canvas')[0].classList.add('canvasFixed');


    fadeAnimation();

    // chrome ios full width workaound
    checkLandscape();

    // //// UNCOMMENT FOR DEBBUGIN -to receive information on camera data
    // debugConsole.innerHTML = `${JSON.stringify(camera.toJSON())}`


    // ============================================= EVENT LISTENERS FOR RAYCASTER =============================================
    if (isMobile.matches || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

        document.addEventListener('touchstart', onDocumentMouseMove, false);
        document.addEventListener('touchmove', onDocumentMouseMove, false);
        document.addEventListener('touchend', onDocumentTouchEnd, false);

    } else {

        document.addEventListener('mousemove', onDocumentMouseMove, false);

    }


    // ==================================================== INTERACTION ========================================================
    const interactionManager = new InteractionManager(
        renderer,
        camera,
        renderer.domElement
    );

    interactionManager.add(object);


    // ==================================================== EVENT LISTENERS ========================================================
    // for when the page is resized - except for instagram
    if (!isInstagram) {

        // event listener for resize logic - delay so proper measurements are made
        window.addEventListener("resize", function () {
            // delay for innerwidth to be set first - bug resolved
            fadeAnimation();
            setTimeout(onWindowResize, 250)
        });

    }

    // preventss user from scaling app
    window.addEventListener(
        "touchmove" as any,
        function (event) {
            if (event.scale !== 1) {
                event.preventDefault();
            }
        },
        { passive: false }
    );

    if (isMobile.matches || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

        object.addEventListener("click", (event) => {

            onClick();

            // using a mock href click to avoid google chrome iOS app loading a blank page
            setTimeout(function () {
                document.getElementById('aLink').click()
            }, 200)

        });

    } else {

        object.addEventListener("click", (event) => {

            setTimeout(function () {
                window.open("https://open.spotify.com/playlist/3I6ckbR7LxRVh6TDA7INpE?si=0067dadf6f6f4c2e");
            }, 200);

        });

    }

}


// ==================================================== FUNCTIONS ========================================================
// for debugging
function showViewport() {

    // //// UNCOOMMENT FOR DEBUGGING ////
    // stats.innerHTML = `IW = ${window.innerWidth} x ${window.innerHeight}`

}

function onWindowResize() {

    // //// UNCOOMMENT FOR DEBUGGING ////
    // canvasSize.innerHTML = `C = ${window.innerWidth} x ${window.innerHeight}`

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    // //// UNCOMMENT FOR DEBUGGING - returns information on the camera ////
    // debugConsole.innerHTML = `${JSON.stringify(camera.toJSON())}`

    // update event listeners for raycasting
    // only changes camera and event listeners if its on the desktop - not on mobile as it causes bugs
    if (!isMobile.matches || !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

        if (isMobile.matches) {

            camera.position.z = 600;
            document.removeEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('touchstart', onDocumentMouseMove, false);
            document.addEventListener('touchmove', onDocumentMouseMove, false);
            document.addEventListener('click', onDocumentMouseMove, false);

        } else {

            camera.position.z = 400;
            document.removeEventListener('touchmove', onDocumentMouseMove, false);
            document.removeEventListener('touchstart', onDocumentMouseMove, false);
            document.removeEventListener('click', onDocumentMouseMove, false);
            document.addEventListener('mousemove', onDocumentMouseMove, false);

        }

    }

    checkLandscape()

    // //// UNCOMMENT FOR DEBUGGING - returns the innerwidth and the innerheight ////
    // showViewport();

}

function checkLandscape() {

    // chrome ios full width workaound
    if (isMobileLandscape.matches) {

        zoom = 1.5

        document.getElementsByTagName('body')[0].classList.remove('pageLock');
        document.getElementsByTagName('canvas')[0].classList.remove('canvasFixed');

        // canvas need to be in relative position forlandscape
        document.getElementsByTagName('body')[0].classList.add('pageUnlock');
        document.getElementsByTagName('canvas')[0].classList.add('canvasRelative');


        renderer.setSize(window.innerWidth * zoom, window.innerHeight * zoom);

        // //// UNCOMMENT FOR DEBUG - to check canvas is adjusted////
        // console.log(renderer.getSize(target2));

        let middleX = innerWidth * zoom / 6;
        let middleY = innerHeight * zoom / 6;

        // scroll to center for chrome ios full width workaoround
        setTimeout(function () {

            window.scrollTo(middleX, middleY);

            setTimeout(function () {

                document.getElementsByTagName('body')[0].classList.remove('pageUnlock');
                document.getElementsByTagName('body')[0].classList.add('pageLock');

            }, 250)


        }, 100);

    } else {

        zoom = 1;
        document.getElementsByClassName('html')[0].setAttribute('style', 'zoom:1');

        document.getElementsByTagName('body')[0].classList.add('pageLock');
        document.getElementsByTagName('canvas')[0].classList.add('canvasFixed');

    }

};

function onClick() {

    // triggered from object event listener and not raycaster
    // turns object temporarily grey to mimick press
    (scene.children[0] as any).material.color.set(0x808080);

    setTimeout(onDocumentTouchEnd, 150);

}


function onDocumentTouchEnd() {

    // // triggered from document event listener and not raycaster
    (scene.children[0] as any).material.color.set(0xFFFFFF);
    // 
}

function onDocumentMouseMove(event) {

    let mouse = new THREE.Vector2();

    if (isMobile.matches || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

        // pointer logic for touchstart, touchend, touchmove only
        pointer.x = +(event.targetTouches[0].pageX / window.innerWidth) * 2 + -zoom;
        pointer.y = -(event.targetTouches[0].pageY / window.innerHeight) * 2 + zoom;

    } else {

        // pointer coordinate desktop pointer to turn to mouse it floats above object
        mouse.x = (event.clientX / window.innerWidth) * 2 - zoom;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + zoom;

        // pointer coordinates for turning object grey if mouse is above object
        pointer.x = (event.clientX / window.innerWidth) * 2 - zoom;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + zoom;

    }

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(planes);

    if (intersects.length > 0) {
        $('html,body').css('cursor', 'pointer');
    } else {
        $('html,body').css('cursor', 'default');
    }
}

function fadeAnimation() {

    document.getElementsByTagName('canvas')[0].classList.remove('canvasFade');
    document.getElementsByTagName('canvas')[0].classList.add('canvasHidden');

    setTimeout(function () {

        document.getElementsByTagName('canvas')[0].classList.remove('canvasHidden');
        document.getElementsByTagName('canvas')[0].classList.add('canvasFade');

    }, 300)

}

function animate() {
    requestAnimationFrame(animate);

    object.rotation.x += 0.005;
    object.rotation.y += 0.01;

    render();

}

function render() {

    // findS intersections
    raycaster.setFromCamera(pointer, camera);

    intersects = raycaster.intersectObjects(scene.children, false);

    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) INTERSECTED.material.color.set(0xFFFFFF);

            INTERSECTED = intersects[0].object;
            INTERSECTED.material.color.set(0x808080);

        }

    } else {

        if (INTERSECTED) INTERSECTED.material.color.set(0xFFFFFF);

        INTERSECTED = null;

    }

    renderer.render(scene, camera);

}