import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface City {
    name: string;
    lat: number;
    lng: number;
}

const CITIES: City[] = [
    { name: "Austin TX", lat: 30.2672, lng: -97.7431 },
    { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
    { name: "New York", lat: 40.7128, lng: -74.0060 },
    { name: "London", lat: 51.5074, lng: -0.1278 },
    { name: "Berlin", lat: 52.5200, lng: 13.4050 },
    { name: "Lagos", lat: 6.5244, lng: 3.3792 },
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
    { name: "Singapore", lat: 1.3521, lng: 103.8198 },
    { name: "Sydney", lat: -33.8688, lng: 151.2093 },
    { name: "Toronto", lat: 43.6532, lng: -79.3832 },
    { name: "Dubai", lat: 25.2048, lng: 55.2708 },
];

export const HeroGlobe: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredCity, setHoveredCity] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        // Scene
        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.z = 250;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        containerRef.current.appendChild(renderer.domElement);

        // Globe Group
        const globeGroup = new THREE.Group();
        scene.add(globeGroup);

        // Dotted Globe (Lat/Lng Grid)
        const globeRadius = 100;
        const dotPositions: number[] = [];
        const dotColors: number[] = [];

        const baseColor = new THREE.Color('#CBD5E1'); // brighter slate for better contrast

        for (let lat = -80; lat <= 80; lat += 4) {
            for (let lng = -180; lng < 180; lng += 4) {
                const phi = (90 - lat) * (Math.PI / 180);
                const theta = (lng + 180) * (Math.PI / 180);

                const x = -(globeRadius) * Math.sin(phi) * Math.cos(theta);
                const y = globeRadius * Math.cos(phi);
                const z = globeRadius * Math.sin(phi) * Math.sin(theta);

                dotPositions.push(x, y, z);

                dotColors.push(baseColor.r, baseColor.g, baseColor.b);
            }
        }

        const dotGeometry = new THREE.BufferGeometry();
        dotGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dotPositions, 3));
        dotGeometry.setAttribute('color', new THREE.Float32BufferAttribute(dotColors, 3));

        const dotMaterial = new THREE.PointsMaterial({
            size: 1.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        const dots = new THREE.Points(dotGeometry, dotMaterial);
        globeGroup.add(dots);

        // Conversion helper
        const latLngToVector3 = (lat: number, lng: number, radius: number) => {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lng + 180) * (Math.PI / 180);
            return new THREE.Vector3(
                -radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
        };

        // City Markers
        const cityGroup = new THREE.Group();
        globeGroup.add(cityGroup);

        const cityPoints: { name: string, pos: THREE.Vector3, mesh: THREE.Mesh }[] = [];

        CITIES.forEach((city) => {
            const pos = latLngToVector3(city.lat, city.lng, globeRadius + 2);
            const geometry = new THREE.SphereGeometry(2.5, 16, 16);
            const material = new THREE.MeshBasicMaterial({ color: '#F97316' });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(pos);
            cityGroup.add(mesh);
            cityPoints.push({ name: city.name, pos, mesh });
        });

        // Connection Arcs
        const arcGroup = new THREE.Group();
        globeGroup.add(arcGroup);

        const createArc = (start: THREE.Vector3, end: THREE.Vector3) => {
            const distance = start.distanceTo(end);
            const mid = start.clone().lerp(end, 0.5);
            const midLength = globeRadius + distance * 0.5;
            mid.normalize().multiplyScalar(midLength);

            const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
            const points = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: '#F97316', transparent: true, opacity: 0.7, linewidth: 2 });
            return new THREE.Line(geometry, material);
        };

        // Create some random connections
        const arcs: THREE.Line[] = [];
        for (let i = 0; i < 10; i++) {
            const startCity = cityPoints[Math.floor(Math.random() * cityPoints.length)];
            const endCity = cityPoints[Math.floor(Math.random() * cityPoints.length)];
            if (startCity !== endCity) {
                const arc = createArc(startCity.pos, endCity.pos);
                arcGroup.add(arc);
                arcs.push(arc);
            }
        }

        // Ambient Glow
        const glowGeometry = new THREE.SphereGeometry(globeRadius * 1.05, 32, 32);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                c: { value: 0.1 },
                p: { value: 2.0 },
                glowColor: { value: new THREE.Color(0x3B82F6) },
                viewVector: { value: camera.position }
            },
            vertexShader: `
            uniform vec3 viewVector;
            varying float intensity;
            void main() {
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
                intensity = pow( dot(normalize(viewVector), normalize(actual_normal)), 6.0 );
            }
        `,
            fragmentShader: `
            uniform vec3 glowColor;
            varying float intensity;
            void main() {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4( glow, 1.0 );
            }
        `,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        new THREE.Mesh(glowGeometry, glowMaterial);
        // globeGroup.add(globeGlow); // Disabled for now to simplify, will re-enable if requested/performance allows

        // Interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseMove = (event: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(cityGroup.children);

            if (intersects.length > 0) {
                const index = cityGroup.children.indexOf(intersects[0].object as THREE.Mesh);
                if (index !== -1) {
                    const city = cityPoints[index];
                    setHoveredCity(city.name);
                    setTooltipPos({ x: event.clientX, y: event.clientY });

                    // Highlight city
                    (intersects[0].object as THREE.Mesh).scale.set(1.5, 1.5, 1.5);
                    (intersects[0].object as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
                }
            } else {
                setHoveredCity(null);
                cityPoints.forEach(cp => {
                    cp.mesh.scale.set(1, 1, 1);
                    (cp.mesh.material as THREE.MeshBasicMaterial).color.set('#F97316');
                });
            }
        };

        window.addEventListener('mousemove', onMouseMove);

        // Animation Loop
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            globeGroup.rotation.y += 0.005; // Noticeable constant rotation (approx 1 rev / 20s at 60fps)
            renderer.render(scene, camera);
        };
        animate();

        // Resize Handler
        const handleResize = () => {
            if (!containerRef.current) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            containerRef.current?.removeChild(renderer.domElement);
            renderer.dispose();
            dotGeometry.dispose();
            dotMaterial.dispose();
            scene.clear();
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden">
            {hoveredCity && (
                <div
                    className="fixed z-50 px-3 py-1 bg-white/90 backdrop-blur-sm border border-navy/10 rounded-full text-navy font-bold text-xs pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-10px]"
                    style={{ left: tooltipPos.x, top: tooltipPos.y }}
                >
                    {hoveredCity}
                </div>
            )}
        </div>
    );
};
