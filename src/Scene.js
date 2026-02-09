import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useStore from "./store";

export default function Scene() {
  const points = useRef();
  const fingerCount = useStore((state) => state.fingerCount); // Listen to the Brain

  // 1. Create 5,000 Particles (Low-Spec Friendly)
  const count = 5000;
  
  // Create initial random positions
  const [positions, initialPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const initPos = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      
      pos.set([x, y, z], i * 3);
      initPos.set([x, y, z], i * 3);
    }
    return [pos, initPos];
  }, []);

  // 2. The Animation Loop (Runs 60 times a second)
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const positionsArray = points.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = initialPositions[i3];
      const y = initialPositions[i3 + 1];
      const z = initialPositions[i3 + 2];

      // MODE 1: TORNADO (2 Fingers)
      if (fingerCount === 2) {
        const angle = time + y * 0.5;
        const radius = 3 + Math.sin(time * 2 + y) * 2;
        
        positionsArray[i3] = Math.cos(angle) * radius; // X
        positionsArray[i3 + 1] = y + Math.sin(time) * 0.5; // Y
        positionsArray[i3 + 2] = Math.sin(angle) * radius; // Z
      } 
      
      // MODE 2: FIREWORKS / SPHERE (5 Fingers)
      else if (fingerCount === 5) {
        const radius = 4 + Math.sin(time * 3 + x) * 0.5;
        // Normalize vector to make a sphere shape
        const len = Math.sqrt(x*x + y*y + z*z); 
        
        positionsArray[i3] = (x / len) * radius;
        positionsArray[i3 + 1] = (y / len) * radius;
        positionsArray[i3 + 2] = (z / len) * radius;
      }
      
      // MODE 3: CHAOS (Any other number)
      else {
        positionsArray[i3] = x + Math.sin(time + y) * 0.5;
        positionsArray[i3 + 1] = y + Math.cos(time + z) * 0.5;
        positionsArray[i3 + 2] = z + Math.sin(time + x) * 0.5;
      }
    }
    
    // Tell Three.js the positions changed
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#00ff00" transparent opacity={0.8} />
    </points>
  );
}