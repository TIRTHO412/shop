/**
 * 3D THREE.JS ANIMATED BACKGROUND
 * Floating particles, glass spheres, soft gradient lighting, and mouse parallax.
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

let scene, camera, renderer;
let particlesMesh, glassSpheres = [], lightOrbs = [];
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
let clock = new THREE.Clock();
let isTabActive = true;
let animationFrameId = null;

function initBackground() {
    const canvas = document.getElementById('webgl-bg');
    if (!canvas) return;

    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0d18, 0.015);

    // Camera setup
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 15);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    setupLights();
    setupGlassSpheres();
    setupParticles();

    window.addEventListener('resize', onWindowResize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    animate();
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const colors = [0x7C3AED, 0x4F46E5, 0x00E5FF, 0xFFFFFF];
    const positions = [
        [-8, 6, -5],
        [8, -6, -8],
        [0, 10, -2],
        [0, -8, -4]
    ];

    colors.forEach((color, i) => {
        const light = new THREE.PointLight(color, 10, 40);
        light.position.set(...positions[i]);
        scene.add(light);
        lightOrbs.push({
            light: light,
            initialPos: new THREE.Vector3(...positions[i]),
            speed: 0.3 + i * 0.1,
            offset: i * Math.PI * 0.5
        });
    });
}

function setupGlassSpheres() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x4F46E5,
        emissive: 0x7C3AED,
        emissiveIntensity: 0.15,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.85,
        ior: 1.45,
        transparent: true,
        opacity: 0.75,
        clearcoat: 1.0
    });

    const sphereData = [
        { scale: 2.5, pos: [-8, 3, -6], speed: 0.4 },
        { scale: 2.0, pos: [7, -4, -5], speed: 0.5 },
        { scale: 1.6, pos: [9, 5, -9], speed: 0.3 },
        { scale: 2.8, pos: [-6, -6, -11], speed: 0.35 }
    ];

    sphereData.forEach(d => {
        const mesh = new THREE.Mesh(geometry, glassMaterial.clone());
        mesh.scale.setScalar(d.scale);
        mesh.position.set(...d.pos);
        scene.add(mesh);
        glassSpheres.push({
            mesh: mesh,
            initialPos: new THREE.Vector3(...d.pos),
            speed: d.speed
        });
    });
}

function setupParticles() {
    const count = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
        new THREE.Color(0x7C3AED),
        new THREE.Color(0x4F46E5),
        new THREE.Color(0x00E5FF),
        new THREE.Color(0xFFFFFF)
    ];

    for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 55;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 45 - 5;

        const c = palette[Math.floor(Math.random() * palette.length)];
        colors[i * 3 + 0] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.6,
        map: createParticleGlowTexture(),
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.8
    });

    particlesMesh = new THREE.Points(geometry, material);
    scene.add(particlesMesh);
}

function createParticleGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(0, 229, 255, 0.8)');
    grad.addColorStop(0.7, 'rgba(124, 58, 237, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
}

function onMouseMove(e) {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function onVisibilityChange() {
    isTabActive = !document.hidden;
    if (isTabActive && !animationFrameId) animate();
}

function animate() {
    if (!isTabActive) return;
    animationFrameId = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Mouse parallax lerp
    mouseX += (targetMouseX - mouseX) * 0.03;
    mouseY += (targetMouseY - mouseY) * 0.03;
    camera.position.x = mouseX * 1.5;
    camera.position.y = -mouseY * 1.5;
    camera.lookAt(0, 0, 0);

    // Light movements
    lightOrbs.forEach(item => {
        const t = elapsed * item.speed + item.offset;
        item.light.position.x = item.initialPos.x + Math.sin(t) * 5;
        item.light.position.y = item.initialPos.y + Math.cos(t * 0.8) * 4;
    });

    // Sphere floating
    glassSpheres.forEach(item => {
        const t = elapsed * item.speed;
        item.mesh.position.y = item.initialPos.y + Math.sin(t) * 0.5;
        item.mesh.rotation.x += 0.002;
        item.mesh.rotation.y += 0.003;
    });

    // Particle rotation
    if (particlesMesh) {
        particlesMesh.rotation.y = elapsed * 0.015;
    }

    renderer.render(scene, camera);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackground);
} else {
    initBackground();
}
