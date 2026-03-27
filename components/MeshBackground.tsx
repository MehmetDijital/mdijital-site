'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function MeshBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    model: THREE.Mesh | null;
    greenLight: THREE.PointLight;
    purpleLight: THREE.PointLight;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.035);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const colorSequence = [
      { color: 0x00C26A, duration: 4200 },
      { color: 0x0A3F34, duration: 4200 },
      { color: 0x1FA3A3, duration: 4200 },
      { color: 0x0B2A45, duration: 4200 },
      { color: 0x2A1F3D, duration: 4200 },
      { color: 0xC46A1A, duration: 3000, opacity: 0.85 },
      { color: 0x9098a0, duration: 3800 },
      { color: 0xa0a8b0, duration: 3800 },
      { color: 0x78828c, duration: 1600 },
    ];
    
    const totalCycleDuration = colorSequence.reduce((sum, c) => sum + c.duration, 0);

    const greenLight = new THREE.PointLight(0x00C26A, 4, 30);
    greenLight.position.set(5, 5, 5);
    scene.add(greenLight);

    const purpleLight = new THREE.PointLight(0x1FA3A3, 4, 30);
    purpleLight.position.set(-5, -5, 5);
    scene.add(purpleLight);

    const venomMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x9098a0,
      emissive: 0x00C26A,
      emissiveIntensity: 1,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: true,
      side: THREE.DoubleSide,
    });

    const fallbackGeometry = new THREE.TorusKnotGeometry(10, 2.5, 100, 16);
    let model = new THREE.Mesh(fallbackGeometry, venomMaterial);

    const bbox = new THREE.Box3().setFromObject(model);
    const center = bbox.getCenter(new THREE.Vector3());
    const size = bbox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 5 / maxDim;
    model.scale.set(scale, scale, scale);

    scene.add(model);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      model,
      greenLight,
      purpleLight,
    };

    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    const mouseSensitivity = 0.0015;
    let scrollY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouseX = event.touches[0].clientX - windowHalfX;
        mouseY = event.touches[0].clientY - windowHalfY;
      }
    };

    const handleScroll = () => {
      scrollY = window.scrollY;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();

    const getCurrentColor = (elapsedTime: number) => {
      const cycleTime = (elapsedTime * 1000) % totalCycleDuration;
      let accumulatedTime = 0;
      
      for (let i = 0; i < colorSequence.length; i++) {
        const current = colorSequence[i];
        const next = colorSequence[(i + 1) % colorSequence.length];
        
        if (cycleTime >= accumulatedTime && cycleTime < accumulatedTime + current.duration) {
          const progress = (cycleTime - accumulatedTime) / current.duration;
          const currentColor = current.color;
          const nextColor = next.color;
          
          // Smooth interpolation between colors
          const r1 = (currentColor >> 16) & 0xFF;
          const g1 = (currentColor >> 8) & 0xFF;
          const b1 = currentColor & 0xFF;
          
          const r2 = (nextColor >> 16) & 0xFF;
          const g2 = (nextColor >> 8) & 0xFF;
          const b2 = nextColor & 0xFF;
          
          const r = Math.round(r1 + (r2 - r1) * progress);
          const g = Math.round(g1 + (g2 - g1) * progress);
          const b = Math.round(b1 + (b2 - b1) * progress);
          
          const interpolatedColor = (r << 16) | (g << 8) | b;
          const opacity = current.opacity !== undefined ? current.opacity : 1.0;
          
          return { color: interpolatedColor, opacity };
        }
        
        accumulatedTime += current.duration;
      }
      
      return { color: colorSequence[0].color, opacity: 1.0 };
    };

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (model) {
        model.rotation.y += 0.002;
        const targetX = mouseY * mouseSensitivity;
        const targetY = mouseX * mouseSensitivity;

        model.rotation.x += 0.05 * (targetX - model.rotation.x);
        model.rotation.y += 0.05 * (targetY - model.rotation.y);

        model.rotation.z = scrollY * 0.003;
        model.position.z = scrollY * 0.005;
      }

      const { color: currentColor, opacity } = getCurrentColor(elapsedTime);
      const pulse1 = Math.sin(elapsedTime * 5) * 0.5 + 0.5;
      const pulse2 = Math.sin(elapsedTime * 5 + 2) * 0.5 + 0.5;
      const currentIntensity = (0.75 + (pulse1 * 0.35 + pulse2 * 0.25)) * opacity;

      if (model) {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
            child.material.color.setHex(0x9098a0);
            child.material.emissive.setHex(currentColor);
            child.material.emissiveIntensity = Math.min(1.35, currentIntensity);
            child.material.opacity = opacity;
            child.material.transparent = opacity < 1.0;
          }
        });
      }

      // Update lights with complementary colors for gradient effect
      const lightColor1 = currentColor;
      const lightColor2 = ((currentColor >> 1) & 0x7F7F7F) | 0x808080; // Lighter variant
      
      greenLight.color.setHex(lightColor1);
      greenLight.intensity = 3 + Math.sin(elapsedTime * 1.5) * 1;
      
      purpleLight.color.setHex(lightColor2);
      purpleLight.intensity = 2 + Math.cos(elapsedTime * 1.2) * 1;

      greenLight.position.x = Math.sin(elapsedTime * 0.7) * 15;
      greenLight.position.z = Math.cos(elapsedTime * 0.5) * 15;

      purpleLight.position.x = Math.cos(elapsedTime * 0.3) * -15;
      purpleLight.position.z = Math.sin(elapsedTime * 0.5) * -15;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full z-[-1]"
      aria-hidden="true"
    />
  );
}
