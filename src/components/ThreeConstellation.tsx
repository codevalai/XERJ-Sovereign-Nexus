import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DOMAIN_STATISTICS, HubDomain } from '../shared/xerjSchemas.js';

interface ThreeConstellationProps {
  selectedDomain: HubDomain | 'ALL';
  onSelectDomain: (domain: HubDomain | 'ALL') => void;
}

export const ThreeConstellation: React.FC<ThreeConstellationProps> = ({
  selectedDomain,
  onSelectDomain,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 420;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06080d, 0.008);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 30, 85);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Ambient & Point Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(20, 40, 20);
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);

    // 3. Central Hub Core Sphere
    const coreGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x054f36,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    group.add(coreMesh);

    // 4. Background Starfield
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 350;
      starPositions[i + 1] = (Math.random() - 0.5) * 350;
      starPositions[i + 2] = (Math.random() - 0.5) * 350;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 1.2,
      transparent: true,
      opacity: 0.6,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 5. Build 11 Domain Nodes on an Orbital Ellipse
    const domainKeys = Object.keys(DOMAIN_STATISTICS) as HubDomain[];
    const nodeMeshes: THREE.Mesh[] = [];

    domainKeys.forEach((domain, idx) => {
      const stats = DOMAIN_STATISTICS[domain];
      const angle = (idx / domainKeys.length) * Math.PI * 2;
      const radius = 26 + (idx % 2) * 8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 5;

      // Sphere size scales logarithmically with domain GB footprint
      const sphereSize = Math.max(1.8, Math.min(5.2, Math.log2(stats.gb + 1.2) * 1.5));
      const sphereGeo = new THREE.SphereGeometry(sphereSize, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(stats.colorHex),
        emissive: new THREE.Color(stats.colorHex).multiplyScalar(0.25),
        roughness: 0.3,
        metalness: 0.5,
      });

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(x, y, z);
      mesh.userData = { domain, stats };
      group.add(mesh);
      nodeMeshes.push(mesh);

      // Connecting line back to core
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(stats.colorHex),
        transparent: true,
        opacity: 0.25,
      });
      const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);

      // Orbital halo ring for each node
      const ringGeo = new THREE.RingGeometry(sphereSize * 1.3, sphereSize * 1.45, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(stats.colorHex),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(x, y, z);
      ringMesh.rotation.x = Math.PI / 2;
      group.add(ringMesh);
    });

    // 6. Interactive Raycasting & Mouse Drag
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        group.rotation.y += deltaX * 0.005;
        group.rotation.x += deltaY * 0.005;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      isDragging = false;
      const rect = container.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(clickX, clickY), camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);
      if (intersects.length > 0) {
        const hit = intersects[0]!.object as THREE.Mesh;
        const domain = hit.userData.domain as HubDomain;
        onSelectDomain(domain);
      }
    };

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // 7. Render Loop with gentle continuous rotation
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        group.rotation.y += 0.002;
      }

      coreMesh.rotation.x = elapsed * 0.2;
      coreMesh.rotation.y = elapsed * 0.3;

      // Pulse selected domain
      nodeMeshes.forEach(mesh => {
        const isSelected = selectedDomain === mesh.userData.domain;
        const baseScale = isSelected ? 1.35 : 1.0;
        mesh.scale.set(baseScale, baseScale, baseScale);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [selectedDomain, onSelectDomain]);

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden bg-[#06080D] border border-slate-800/80">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute top-3 left-4 pointer-events-none text-xs text-slate-400">
        <span className="text-emerald-400 font-mono font-medium">3D Spatial Hub Constellation</span>
        <span className="mx-2 text-slate-600">·</span>
        <span>11 Domains (78.6 GB Pinned Text)</span>
        <span className="mx-2 text-slate-600">·</span>
        <span className="text-slate-500">Click node to inspect / drag to rotate</span>
      </div>
      <div className="absolute bottom-3 right-4 flex items-center gap-2">
        <button
          onClick={() => onSelectDomain('ALL')}
          className={`px-2.5 py-1 text-xs rounded transition-colors ${
            selectedDomain === 'ALL'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          View All Domains
        </button>
      </div>
    </div>
  );
};
