import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import HandTracker from './HandTracker';
import Scene from './Scene';

function App() {
  return (
    <div style={{ height: '100vh', width: '100vw', background: 'black' }}>
      <HandTracker />
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;