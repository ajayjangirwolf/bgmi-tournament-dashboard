"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function GridLines() {
  const groupRef = useRef<THREE.Group>(null);

  const gridGeometry = useMemo(() => {
    const points: number[] = [];
    const size = 40;
    const divisions = 20;
    const step = size / divisions;

    // Horizontal lines
    for (let i = 0; i <= divisions; i++) {
      const z = -size / 2 + i * step;
      points.push(-size / 2, 0, z, size / 2, 0, z);
    }
    // Vertical lines
    for (let i = 0; i <= divisions; i++) {
      const x = -size / 2 + i * step;
      points.push(x, 0, -size / 2, x, 0, size / 2);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3)
    );
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.1) * 0.05;
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.15) * 0.3 - 3;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial color="#facc15" opacity={0.08} transparent />
      </lineSegments>
    </group>
  );
}

function FloatingParticles() {
  const count = 60;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Use stable seed - generate positions once outside of render
  const positions = useRef(
    Array.from({ length: count }, (_, i) => ({
      x: (((i * 13.37) % 1) - 0.5) * 30,
      y: (((i * 7.43) % 1) - 0.5) * 20,
      z: (((i * 5.17) % 1) - 0.5) * 20,
    }))
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    const pts = positions.current;
    for (let i = 0; i < count; i++) {
      const matrix = new THREE.Matrix4();
      matrix.setPosition(
        pts[i].x + Math.sin(t * 0.3 + i) * 0.3,
        pts[i].y + Math.sin(t * 0.2 + i * 1.5) * 0.5,
        pts[i].z
      );
      meshRef.current.setMatrixAt(i, matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.03, 4, 4]} />
      <meshBasicMaterial color="#facc15" opacity={0.4} transparent />
    </instancedMesh>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 5, 12], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.1} />
        <GridLines />
        <FloatingParticles />
      </Canvas>
    </div>
  );
}
