// Initialize Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('van-container').appendChild(renderer.domElement);

// Create US map background
const mapWidth = 100;
const mapHeight = 60;
const mapGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
const mapTexture = new THREE.TextureLoader().load('http://localhost:8000/map.jpg');
const mapMaterial = new THREE.MeshBasicMaterial({ 
    map: mapTexture,
    side: THREE.DoubleSide
});
const map = new THREE.Mesh(mapGeometry, mapMaterial);
scene.add(map);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

// Initialize van
let van = null;
const loader = new THREE.GLTFLoader();

// Load van model directly
loader.load('http://localhost:8000/Shaded/van.glb', (gltf) => {
    van = gltf.scene;
    van.scale.set(0.1, 0.1, 0.1);
    scene.add(van);
}, undefined, (error) => {
    console.error('Error loading van model:', error);
    // Create a simple cube as fallback
    const geometry = new THREE.BoxGeometry(1, 0.5, 0.5);
    const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    van = new THREE.Mesh(geometry, material);
    scene.add(van);
});

// Van position and movement
const vanState = {
    x: 0,
    y: 0,
    rotation: 0,
    speed: 0,
    rotationSpeed: 0
};

// Track pressed keys
const keys = {
    w: false,
    s: false,
    a: false,
    d: false
};

// Key listeners
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key.toLowerCase())) {
        keys[e.key.toLowerCase()] = false;
    }
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update van position based on keys
    if (keys.w) vanState.speed = 0.1;
    if (keys.s) vanState.speed = -0.1;
    if (!keys.w && !keys.s) vanState.speed *= 0.95; // Deceleration

    if (keys.d) vanState.rotationSpeed = 0.05;
    if (keys.a) vanState.rotationSpeed = -0.05;
    if (!keys.d && !keys.a) vanState.rotationSpeed *= 0.95; // Rotation deceleration

    // Update position and rotation
    vanState.rotation += vanState.rotationSpeed;
    vanState.x += Math.sin(vanState.rotation) * vanState.speed;
    vanState.y += Math.cos(vanState.rotation) * vanState.speed;

    // Keep van within map bounds
    vanState.x = Math.max(-mapWidth/2, Math.min(mapWidth/2, vanState.x));
    vanState.y = Math.max(-mapHeight/2, Math.min(mapHeight/2, vanState.y));

    // Update van position and rotation
    if (van) {
        van.position.set(vanState.x, vanState.y, 0.2);
        van.rotation.z = vanState.rotation;
    }

    // Update camera position
    camera.position.set(vanState.x, vanState.y - 5, 5);
    camera.lookAt(vanState.x, vanState.y, 0);

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate(); 