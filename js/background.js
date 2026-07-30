/**
 * 3D ANIMATED BACKGROUND SYSTEM (Three.js ES Module)
 * Inspired by Apple, Stripe, and Linear web aesthetics.
 * Features: Glowing particles, floating glass spheres, moving gradient lights,
 * soft exponential fog, mouse parallax, and performance optimizations.
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================
const COLOR_PALETTE = {
    purple: 0x7C3AED,  // #7C3AED
    indigo: 0x4F46E5,  // #4F46E5
    cyan:   0x00E5FF,  // #00E5FF
    white:  0xFFFFFF   // #FFFFFF
};

let scene, camera, renderer;
let particlesMesh, glassSpheres = [], lightOrbs = [], decorativeGeometries = [];
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
let clock = new THREE.Clock();
let isReducedMotion = false;
let isTabActive = true;
let animationFrameId = null;

// ============================================================================
// 2. INITIALIZATION
// ============================================================================
function initBackground() {
    const canvas = document.getElementById('webgl-bg');
    if (!canvas) {
        console.error('WebGL Background canvas #webgl-bg not found.');
        return;
    }

    // Check for reduced motion preference
    isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Scene Setup ---
    scene = new THREE.Scene();
    
    // Soft Futuristic Exponential Fog
    scene.fog = new THREE.FogExp2(0x0b0f19, 0.018);

    // --- Camera Setup ---
    camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 16);

    // --- Renderer Setup (GPU Optimized) ---
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // --- Add Scene Elements ---
    setupLights();
    setupGlassSpheres();
    setupParticleSystem();
    setupDecorativeGeometries();

    // --- Event Listeners ---
    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    // --- Start Animation Loop ---
    animate();
}

// ============================================================================
// 3. LIGHTING (Moving Gradient Lights)
// ============================================================================
function setupLights() {
    // Soft Ambient Base Light
    const ambientLight = new THREE.AmbientLight(COLOR_PALETTE.white, 0.6);
    scene.add(ambientLight);

    // Dynamic Moving Gradient Point Lights
    const lightConfigs = [
        { color: COLOR_PALETTE.purple, intensity: 12, distance: 45, pos: [-10, 8, -5] },
        { color: COLOR_PALETTE.indigo, intensity: 12, distance: 45, pos: [10, -8, -8] },
        { color: COLOR_PALETTE.cyan,   intensity: 15, distance: 40, pos: [0, 12, -2] },
        { color: COLOR_PALETTE.white,  intensity: 6,  distance: 35, pos: [0, -10, -4] }
    ];

    lightConfigs.forEach((cfg, idx) => {
        const light = new THREE.PointLight(cfg.color, cfg.intensity, cfg.distance);
        light.position.set(...cfg.pos);
        scene.add(light);
        
        lightOrbs.push({
            light: light,
            initialPos: new THREE.Vector3(...cfg.pos),
            speed: 0.4 + idx * 0.15,
            offset: idx * Math.PI * 0.5
        });
    });
}

// ============================================================================
// 4. LARGE GLASS SPHERES (Transmission & Refraction)
// ============================================================================
function setupGlassSpheres() {
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

    // Glass Material Variant 1 (Cyan / Indigo Glow)
    const glassMat1 = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(COLOR_PALETTE.indigo),
        emissive: new THREE.Color(COLOR_PALETTE.purple),
        emissiveIntensity: 0.12,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.88,
        ior: 1.45,
        transparent: true,
        opacity: 0.75,
        reflectivity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08
    });

    // Glass Material Variant 2 (Electric Cyan Glow)
    const glassMat2 = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(COLOR_PALETTE.cyan),
        emissive: new THREE.Color(COLOR_PALETTE.cyan),
        emissiveIntensity: 0.2,
        roughness: 0.05,
        metalness: 0.15,
        transmission: 0.92,
        ior: 1.5,
        transparent: true,
        opacity: 0.7,
        reflectivity: 0.95,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
    });

    // Sphere Spacing & Coordinates
    const sphereData = [
        { scale: 2.8, pos: [-9, 4, -6],  mat: glassMat1, speed: 0.5, floatAmp: 0.6 },
        { scale: 2.2, pos: [8, -5, -4],  mat: glassMat2, speed: 0.6, floatAmp: 0.8 },
        { scale: 1.8, pos: [10, 6, -10], mat: glassMat1, speed: 0.4, floatAmp: 0.5 },
        { scale: 3.2, pos: [-7, -7, -12],mat: glassMat2, speed: 0.3, floatAmp: 0.9 },
        { scale: 1.4, pos: [0, -3, -3],  mat: glassMat1, speed: 0.7, floatAmp: 0.4 }
    ];

    sphereData.forEach(data => {
        const mesh = new THREE.Mesh(sphereGeometry, data.mat);
        mesh.scale.setScalar(data.scale);
        mesh.position.set(...data.pos);
        scene.add(mesh);

        glassSpheres.push({
            mesh: mesh,
            initialPos: new THREE.Vector3(...data.pos),
            speed: data.speed,
            floatAmp: data.floatAmp,
            rotSpeedX: (Math.random() - 0.5) * 0.005,
            rotSpeedY: (Math.random() - 0.5) * 0.005
        });
    });
}

// ============================================================================
// 5. FLOATING GLOWING PARTICLES (Additive Blending)
// ============================================================================
function setupParticleSystem() {
    const particleCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const colorOptions = [
        new THREE.Color(COLOR_PALETTE.purple),
        new THREE.Color(COLOR_PALETTE.indigo),
        new THREE.Color(COLOR_PALETTE.cyan),
        new THREE.Color(COLOR_PALETTE.white)
    ];

    for (let i = 0; i < particleCount; i++) {
        // Distribute in wide 3D space
        positions[i * 3 + 0] = (Math.random() - 0.5) * 60;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 45;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 5;

        // Random palette assignment
        const chosenColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        colors[i * 3 + 0] = chosenColor.r;
        colors[i * 3 + 1] = chosenColor.g;
        colors[i * 3 + 2] = chosenColor.b;

        scales[i] = Math.random() * 0.6 + 0.2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom Glowing Particle Texture
    const particleTexture = createGlowTexture();

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.65,
        map: particleTexture,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.85
    });

    particlesMesh = new THREE.Points(geometry, particleMaterial);
    scene.add(particlesMesh);
}

function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.3, 'rgba(0, 229, 255, 0.8)');
    gradient.addColorStop(0.6, 'rgba(124, 58, 237, 0.3)');
    gradient.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// ============================================================================
// 6. FUTURISTIC GEOMETRIES (Wireframe Accents)
// ============================================================================
function setupDecorativeGeometries() {
    const ringGeo = new THREE.TorusGeometry(5, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
        color: COLOR_PALETTE.cyan,
        transparent: true,
        opacity: 0.25,
        wireframe: true
    });

    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    ring1.position.set(-6, 2, -15);
    ring1.rotation.x = Math.PI * 0.35;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
        color: COLOR_PALETTE.purple,
        transparent: true,
        opacity: 0.2,
        wireframe: true
    }));
    ring2.position.set(7, -4, -18);
    ring2.rotation.y = Math.PI * 0.45;
    scene.add(ring2);

    decorativeGeometries.push(
        { mesh: ring1, rotX: 0.001, rotY: 0.0015 },
        { mesh: ring2, rotX: -0.0012, rotY: 0.0008 }
    );
}

// ============================================================================
// 7. MOUSE & TOUCH PARALLAX INTERACTION
// ============================================================================
function onMouseMove(event) {
    if (isReducedMotion) return;
    targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (event.clientY / window.innerHeight - 0.5) * 2;
}

function onTouchMove(event) {
    if (isReducedMotion || !event.touches.length) return;
    targetMouseX = (event.touches[0].clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (event.touches[0].clientY / window.innerHeight - 0.5) * 2;
}

// ============================================================================
// 8. RESIZE & VISIBILITY HANDLERS
// ============================================================================
function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function onVisibilityChange() {
    isTabActive = !document.hidden;
    if (isTabActive && !animationFrameId) {
        clock.start();
        animate();
    }
}

// ============================================================================
// 9. ANIMATION LOOP (Smooth 60fps & Slow Motion)
// ============================================================================
function animate() {
    if (!isTabActive) {
        animationFrameId = null;
        return;
    }

    animationFrameId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();
    const timeSpeed = isReducedMotion ? 0.1 : 0.4;

    // --- Smooth Mouse Parallax Lerp ---
    mouseX += (targetMouseX - mouseX) * 0.035;
    mouseY += (targetMouseY - mouseY) * 0.035;

    camera.position.x = mouseX * 1.8;
    camera.position.y = -mouseY * 1.8;
    camera.lookAt(0, 0, 0);

    // --- Animate Moving Gradient Lights ---
    lightOrbs.forEach(item => {
        const t = elapsedTime * item.speed * timeSpeed + item.offset;
        item.light.position.x = item.initialPos.x + Math.sin(t) * 6;
        item.light.position.y = item.initialPos.y + Math.cos(t * 0.8) * 5;
        item.light.position.z = item.initialPos.z + Math.sin(t * 0.5) * 4;
    });

    // --- Animate Glass Spheres Floating ---
    glassSpheres.forEach(item => {
        const t = elapsedTime * item.speed * timeSpeed;
        item.mesh.position.y = item.initialPos.y + Math.sin(t) * item.floatAmp;
        item.mesh.position.x = item.initialPos.x + Math.cos(t * 0.7) * (item.floatAmp * 0.5);
        item.mesh.rotation.x += item.rotSpeedX;
        item.mesh.rotation.y += item.rotSpeedY;
    });

    // --- Animate Particles Slow Rotation & Float ---
    if (particlesMesh) {
        particlesMesh.rotation.y = elapsedTime * 0.02 * timeSpeed;
        particlesMesh.rotation.x = Math.sin(elapsedTime * 0.015 * timeSpeed) * 0.05;
    }

    // --- Animate Wireframe Geometries ---
    decorativeGeometries.forEach(item => {
        item.mesh.rotation.x += item.rotX;
        item.mesh.rotation.y += item.rotY;
    });

    // --- Render Scene ---
    renderer.render(scene, camera);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackground);
} else {
    initBackground();
}
