import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';


let scene, camera, renderer, controls, effectComposer, customPass;
let sphere1, sphere2, sphere3, sphere4, sphere5;
let angle = 0;
let mouseX = 0, mouseY = 0;
let mouseOver = false;
let selectedSphere = null;
const titleElement = document.getElementById('title');
const infoElement = document.getElementById('info');
const socials = document.getElementById('socialcontainer');
const about = document.getElementById('about');
const back = document.getElementById('backarrow');
let rot = 0;
let col = 0;
let startscreen = true;
let deepness = 0;

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  '/zpos.png',  // right
  '/zpos.png',   // left
  '/zpos.png',    // top
  '/zpos.png', // bottom
  '/zpos.png',  // front
  '/zpos.png'   // back
]);

const spheres = [];
let currentSphereIndex = -1;
const sphereData = {};

const colors = ["#0066ff", "#ff0000", "#ffb800", "#ff5c00"]

let orbitLines = [];

init();
animate();

function init() {
    // Create the scene
    scene = new THREE.Scene();
    scene.background = texture;

    // Create the camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 38;

    // Create the renderer
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.setPixelRatio(0.6);

    // Create geometry and material for the spheres
    const geometry = new THREE.SphereGeometry(1, 8, 8);
    const geometry_sun = new THREE.SphereGeometry(6, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const material_about = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const material_projects = new THREE.MeshBasicMaterial({ color: 0x0066ff, wireframe: true });
    const material_competitions = new THREE.MeshBasicMaterial({ color: 0xffb800, wireframe: true });
    const material_contact = new THREE.MeshBasicMaterial({ color: 0xff5c00, wireframe: true });

    // Create the spheres
    sphere1 = new THREE.Mesh(geometry, material_projects);
    sphere1.position.x = -2;
    sphere1.userData = { 
        name: 'Projects', 
        info: 'Check out my projects to see what I’ve been working on and how I’ve learned along the way. Each entry reflects the challenges I’ve tackled and the skills I’ve developed. It’s a mix of successes and lessons, showing how my approach evolves with every new endeavor.' };
    scene.add(sphere1);
    spheres.push(sphere1);

    sphere2 = new THREE.Mesh(geometry, material_about);
    sphere2.position.x = 2;
    sphere2.userData = { 
        name: 'About Me', 
        info: "Hey! I’m Patrick, a mathematical physics student with a talent "
        + "for turning coffee into code. Care to learn more about my background "
        +  " passions, and hobbies? Click here to get to know me better!"};
    scene.add(sphere2);
    spheres.push(sphere2);

    sphere3 = new THREE.Mesh(geometry_sun, material);
    sphere3.position.x = 0;
    sphere3.userData = { 
        name: 'Sun', 
        info: 'Information about the sun.' };
    scene.add(sphere3);

    sphere4 = new THREE.Mesh(geometry, material_competitions);
    sphere4.position.y = 2;
    sphere4.userData = { 
        name: 'Competitions', 
        info: "Here’s a snapshot of my competition history where I’ve put my skills "
        + "to the test and sometimes come out with a story to tell. Each entry highlights "
        + "key moments and achievements from various contests, showcasing how I handle "
        + "challenges and strive for results under pressure. Dive in to see where I’ve made "
        + "an impact and learned a few lessons along the way." };
    scene.add(sphere4);
    spheres.push(sphere4);

    sphere5 = new THREE.Mesh(geometry, material_contact);
    sphere5.position.y = -2;
    sphere5.userData = { 
        name: 'Contact', 
        info: "Looking to see more of my work or get details on specific projects? This is where "
        + "you can reach out for additional information or access to my portfolio. If you’re "
        + "interested in diving deeper into what I do, just drop a message, and I’ll be happy to "
        + "share more." };
    scene.add(sphere5);
    spheres.push(sphere5);
    
    const orbitRadius = 20;

    // Add OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Handle mouse events
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('click', onDocumentMouseClick, false);
    document.addEventListener('keydown', onDocumentKeyDown, false);
    window.addEventListener('resize', onWindowResize, false);

    document.getElementById('enterbtn').addEventListener('click', entersite);

    createOrbitLines();
}

function entersite(){
    document.getElementById('startscreen').classList.add("hide");
    startscreen = false;
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onDocumentMouseClick(event) {
    if (selectedSphere || startscreen) return;
    back.addEventListener('click', goBack);
    const vector = new THREE.Vector3(mouseX, mouseY, 0.5).unproject(camera);
    const raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
    const intersects = raycaster.intersectObjects(spheres);

    if (intersects.length > 0) {
        selectedSphere = intersects[0].object;
        if(selectedSphere){
            deepness+=1;
            currentSphereIndex = spheres.indexOf(selectedSphere);
            const sphereData = selectedSphere.userData;

            document.removeEventListener('mousemove', onDocumentMouseMove, false);

            // Animate zoom in on the selected sphere
            new TWEEN.Tween(camera.position)
                .to({ x: selectedSphere.position.x, y: selectedSphere.position.y, z: selectedSphere.position.z + 5 }, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

            new TWEEN.Tween(controls.target)
                .to({ x: selectedSphere.position.x, y: selectedSphere.position.y, z: selectedSphere.position.z }, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

            controls.update();

            // Display the info box
            const sphereId = Object.keys(sphereData).find(id => sphereData[id] === selectedSphere.userData);
            const sphereInfo = sphereId ? sphereData[sphereId] : sphereData;
            back.classList.add('show');
            infoElement.style.display = 'block';
            console.log(sphereInfo.name.includes("About"));
            if(sphereInfo.name.includes("About") || sphereInfo.name.includes("Contact")){
                infoElement.innerHTML = `
                <h2>${sphereInfo.name}</h2>
                <p>${sphereInfo.info}</p>
                <div id="buttonbox"></div>
                <button id="prevBtn">Previous</button>
                <button id="nextBtn">Next</button>
                <button id="moreBtn" class="${sphereInfo.name}">See More</button>`;
            }
            else if (sphereInfo.name.includes("Competitions")){
                infoElement.innerHTML = `
                <h2>${sphereInfo.name}</h2>
                <p>${sphereInfo.info}</p>
                <div id="buttonbox"></div>
                <button id="prevBtn">Previous</button>
                <button id="nextBtn">Next</button>
                <button id="moreBtn" class="sac">Spaceport America Cup</button>
                <button id="moreBtn" class="citadel">Citadel Trading Invitational</button>
                <button id="moreBtn" class="imc">IMC Prosperity</button>`;
            }
            else{
                infoElement.innerHTML = `
                <h2>${sphereInfo.name}</h2>
                <p>${sphereInfo.info}</p>
                <div id="buttonbox"></div>
                <button id="prevBtn">Previous</button>
                <button id="nextBtn">Next</button>
                <button id="moreBtn" class="subwai">Subw-AI</button>
                <button id="moreBtn" class="mlbets">Algorithmic Sportsbetting</button>
                <button id="florence">Florence</button>`;
            }

            document.getElementById('prevBtn').addEventListener('click', showPreviousSphere);
            document.getElementById('nextBtn').addEventListener('click', showNextSphere);
            document.getElementById('florence').addEventListener('click', function() {
                console.log("Heyy");
                window.location.href = '/posts/florence.html';
            })

            const moreBtn = document.getElementById('moreBtn');
            moreBtn.addEventListener('click', function() {
                if (moreBtn.classList.contains("About")) {
                    about.classList.add('show');
                    infoElement.style.display = 'none';
                    deepness+=1;
                }
                if (moreBtn.classList.contains("Contact")) {
                    socials.classList.add('show');
                    infoElement.style.display = 'none';
                    deepness+=1;
                }
                if (moreBtn.classList.contains("florence")) {
                    
                }
                if (moreBtn.classList.contains("Competitions")) {
                    window.location.href = 'competitons.html';
                }
            });
        
        }
    }
}

function goBack(event) {
    new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 0, z: 50 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    new TWEEN.Tween(controls.target)
        .to({ x: 0, y: 0, z: 0 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    controls.update();

    // Hide the info box

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    selectedSphere = null;
    currentSphereIndex = -1;
    deepness -= 1;
    if (deepness > 1){
        socials.classList.remove('show');
        about.classList.remove('show');
    }
    else{
        infoElement.style.display = 'none';
        socials.classList.remove('show');
        about.classList.remove('show');
        back.classList.remove('show');
        deepness = 0;
    }
}   

function onDocumentKeyDown(event) {
    if (event.key === 'Escape' && selectedSphere) {
        // Animate camera zoom out
        new TWEEN.Tween(camera.position)
            .to({ x: 0, y: 0, z: 50 }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        new TWEEN.Tween(controls.target)
            .to({ x: 0, y: 0, z: 0 }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        controls.update();

        // Hide the info box
        infoElement.style.display = 'none';
        socials.classList.remove('show');
        about.classList.remove('show');
        back.classList.remove('show');


        document.addEventListener('mousemove', onDocumentMouseMove, false);

        selectedSphere = null;
        currentSphereIndex = -1;
        deepness = 0;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function showNextSphere() {
    if (currentSphereIndex === -1) return;
    currentSphereIndex = (currentSphereIndex + 1) % spheres.length;
    selectedSphere = spheres[currentSphereIndex];
    updateView();
}

function showPreviousSphere() {
    if (currentSphereIndex === -1) return;
    currentSphereIndex = (currentSphereIndex - 1 + spheres.length) % spheres.length;
    selectedSphere = spheres[currentSphereIndex];
    updateView();
}

function updateView() {
    const sphereData = selectedSphere.userData;

    new TWEEN.Tween(camera.position)
        .to({ x: selectedSphere.position.x, y: selectedSphere.position.y, z: selectedSphere.position.z + 5 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    new TWEEN.Tween(controls.target)
        .to({ x: selectedSphere.position.x, y: selectedSphere.position.y, z: selectedSphere.position.z }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    controls.update();

    // Display the info box
    const sphereId = Object.keys(sphereData).find(id => sphereData[id] === selectedSphere.userData);
    const sphereInfo = sphereId ? sphereData[sphereId] : sphereData;
    back.classList.add('show');
    infoElement.style.display = 'block';
    console.log(sphereInfo.name.includes("About"));
    if(sphereInfo.name.includes("About") || sphereInfo.name.includes("Contact")){
        infoElement.innerHTML = `
        <h2>${sphereInfo.name}</h2>
        <p>${sphereInfo.info}</p>
        <div id="buttonbox"></div>
        <button id="prevBtn">Previous</button>
        <button id="nextBtn">Next</button>
        <button id="moreBtn" class="${sphereInfo.name}">See More</button>`;
    }
    else if (sphereInfo.name.includes("Competitions")){
        infoElement.innerHTML = `
        <h2>${sphereInfo.name}</h2>
        <p>${sphereInfo.info}</p>
        <div id="buttonbox"></div>
        <button id="prevBtn">Previous</button>
        <button id="nextBtn">Next</button>
        <button id="moreBtn" class="sac">Spaceport America Cup</button>
        <button id="moreBtn" class="citadel">Citadel Trading Invitational</button>
        <button id="moreBtn" class="imc">IMC Prosperity</button>`;
    }
    else{
        infoElement.innerHTML = `
        <h2>${sphereInfo.name}</h2>
        <p>${sphereInfo.info}</p>
        <div id="buttonbox"></div>
        <button id="prevBtn">Previous</button>
        <button id="nextBtn">Next</button>
        <button id="moreBtn" class="subwai">Subw-AI</button>
        <button id="moreBtn" class="mlbets">Algorithmic Sportsbetting</button>
        <button id="moreBtn" class="florence">Florence</button>`;
    }

    document.getElementById('prevBtn').addEventListener('click', showPreviousSphere);
    document.getElementById('nextBtn').addEventListener('click', showNextSphere);

    const moreBtn = document.getElementById('moreBtn');
    moreBtn.addEventListener('click', function() {
        if (moreBtn.classList.contains("About")) {
            about.classList.add('show');
            infoElement.style.display = 'none';
            deepness+=1;
        }
        if (moreBtn.classList.contains("Contact")) {
            socials.classList.add('show');
            infoElement.style.display = 'none';
            deepness+=1;
        }
        if (moreBtn.classList.includes("florence")) {
            window.location.href = 'posts/florence.html';
        }
        if (moreBtn.classList.contains("Competitions")) {
            window.location.href = 'competitons.html';
        }
    });

}

function createCircularPaths(radius, segments, axisRotation) {
    const points = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const z = 0;
        points.push(new THREE.Vector3(x, y, z).applyAxisAngle(axisRotation.axis, axisRotation.angle));
    }
    return points;
}

function createDottedLine(points) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
        color: colors[col],
        dashSize: 0.5,
        gapSize: 0.5
    });
    col++;
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances(); // Required for LineDashedMaterial
    return line;
}

function updateSpheres(angle) {
    const radius = 20;

    function rotateX(x, y, z, theta) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        return {
            x: x,
            y: cosTheta * y - sinTheta * z,
            z: sinTheta * y + cosTheta * z
        };
    }

    function rotateY(x, y, z, theta) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        return {
            x: cosTheta * x + sinTheta * z,
            y: y,
            z: -sinTheta * x + cosTheta * z
        };
    }

    function rotateZ(x, y, z, theta) {
        const cosTheta = Math.cos(theta);
        const sinTheta = Math.sin(theta);
        return {
            x: cosTheta * x - sinTheta * y,
            y: sinTheta * x + cosTheta * y,
            z: z
        };
    }

    // Sphere 1 (no rotation needed, basic orbit)
    let pos1 = {
        x: -radius * Math.cos(angle),
        y: -radius * Math.sin(angle),
        z: 0
    };
    sphere1.position.set(pos1.x, pos1.y, pos1.z);

    // Sphere 2 (rotated around the x-axis)
    let pos2 = {
        x: radius * 0.85 * Math.cos(angle + Math.PI / 4),
        y: -radius * 0.85 * Math.sin(angle + Math.PI / 4),
        z: 0
    };
    pos2 = rotateZ(pos2.x, pos2.y, pos2.z, Math.PI / 4);
    sphere2.position.set(pos2.x, pos2.y, pos2.z);

    // Sphere 4 (rotated around the y-axis)
    let pos4 = {
        x: radius * 0.95 * Math.cos(angle + Math.PI / 2),
        y: radius * 0.95 * Math.sin(angle + Math.PI / 2),
        z: 0
    };
    pos4 = rotateY(pos4.x, pos4.y, pos4.z, Math.PI / 4);
    sphere4.position.set(pos4.x, pos4.y, pos4.z);

    // Sphere 5 (rotated around the z-axis)
    let pos5 = {
        x: radius * 0.9 * Math.cos(angle - Math.PI / 4),
        y: radius * 0.9 * Math.sin(angle - Math.PI / 4),
        z: 0
    };
    pos5 = rotateX(pos5.x, pos5.y, pos5.z, Math.PI / 4);
    sphere5.position.set(pos5.x, pos5.y, pos5.z);
}

function createOrbitLines() {
    const segments = 64; // Number of segments for the circular path
    const radius = 20;

    const path1 = createCircularPaths(radius, segments, { axis: new THREE.Vector3(1, 0, 0), angle: 0 });
    const line1 = createDottedLine(path1);
    scene.add(line1);

    const path5 = createCircularPaths(radius * 0.85, segments, { axis: new THREE.Vector3(0, 0, 1), angle: Math.PI / 4 });
    const line5 = createDottedLine(path5);
    scene.add(line5);

    const path4 = createCircularPaths(radius * 0.95, segments, { axis: new THREE.Vector3(0, 1, 0), angle: Math.PI / 4 });
    const line4 = createDottedLine(path4);
    scene.add(line4);

    const path2 = createCircularPaths(radius * 0.9, segments, { axis: new THREE.Vector3(1, 0, 0), angle: Math.PI / 4 });
    const line2 = createDottedLine(path2);
    scene.add(line2);
}

function animate() {
    requestAnimationFrame(animate);

    TWEEN.update();  // Ensure TWEEN animations are updated
    controls.update();

    const offset = -2
    if (selectedSphere) {
        camera.position.set(selectedSphere.position.x - offset, selectedSphere.position.y, selectedSphere.position.z + 5);
        controls.target.set(selectedSphere.position.x - offset, selectedSphere.position.y, selectedSphere.position.z);
        controls.update();
        titleElement.style.display = 'none';
    }

    const vector = new THREE.Vector3(mouseX, mouseY, 0.5).unproject(camera);
    const raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    // Rotate the spheres
    sphere3.rotation.y += 0.01;

    // Update the angle for orbiting
    angle += 0.006;

    updateSpheres(angle);


    // Position the title element
    const rect = renderer.domElement.getBoundingClientRect();
    let isAnySphereHovered = false;

    spheres.forEach((sphere) => {
        sphere.rotation.x += 0.01;
        sphere.rotation.y += 0.01;
        
        if(!selectedSphere && !startscreen){
            let intersect = raycaster.intersectObject(sphere);
            let mouseOver = intersect.length > 0;
            sphere.scale.set(mouseOver ? 1.5 : 1, mouseOver ? 1.5 : 1, mouseOver ? 1.5 : 1);

            if (mouseOver) {
                isAnySphereHovered = true;
                const sphereScreenPosition = sphere.position.clone().project(camera);
                const screenX = ((sphereScreenPosition.x + 1) / 2) * rect.width + rect.left;
                const screenY = ((-sphereScreenPosition.y + 1) / 2) * rect.height + rect.top;

                titleElement.style.display = 'block';
                titleElement.innerHTML = `${sphere.userData.name}`;
                titleElement.style.left = `${screenX + 40}px`;
                titleElement.style.top = `${screenY - 20}px`; // Adjusted position to be above the element
                titleElement.style.color = `${colors[spheres.indexOf(sphere)]}`;
            }
        }
    });

    if (!isAnySphereHovered) {
        titleElement.style.display = 'none';
    }

    // Render the scene
    renderer.render(scene, camera);
}
