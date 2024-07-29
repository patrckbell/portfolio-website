window.addEventListener('load', () => {
    // Hide the placeholder and show the content
    document.querySelector('.placeholder').style.display = 'none';
    document.getElementById('content').style.display = 'block';
});

document.addEventListener('DOMContentLoaded', () => {
    // Set up scene, camera, and renderer
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
    '../zpos.png',  // right
    '../zpos.png',  // right
    '../zpos.png',  // right
    '../zpos.png',  // right
    '../zpos.png',  // right
    '../zpos.png',  // right
    ]);

    const scene = new THREE.Scene();
    scene.background = texture;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('threejs-container').appendChild(renderer.domElement);

    // Create a wireframe sphere
    const geometry = new THREE.SphereGeometry(3, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Set the camera position
    camera.position.z = 10;

    // Animate the sphere
    function animate() {
        requestAnimationFrame(animate);
        sphere.rotation.x += 0.005;
        sphere.rotation.y += 0.005;

        renderer.render(scene, camera);
    }
    animate();

    // Adjust the scene on window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
