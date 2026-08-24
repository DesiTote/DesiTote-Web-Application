"use client";

import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Float, Bounds } from "@react-three/drei";
import { Suspense } from "react";

function Model() {
  const { scene } = useGLTF("/models/modelToUsed.glb");

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.5}>
      {/* Increased scale from 1.8 to 2.8 for a much larger visual presence */}
      <primitive object={scene} scale={2.8} position={[0, -0.2, 0]} />
    </Float>
  );
}

useGLTF.preload("/models/modelToUsed.glb");

export default function Tote3DViewer() {
  return (
    /* Increased height and width container to fit expanded 3D bounds */
    <div className="w-full h-[550px] sm:h-[650px] cursor-grab active:cursor-grabbing">
      {/* Lower FOV (35) acts like a zoom-in lens without clipping */}
      <Canvas camera={{ position: [0, 0, 5], fov: 35 }}>
        <ambientLight intensity={1.8} />
        <directionalLight position={[5, 8, 5]} intensity={2.5} />
        <directionalLight position={[-5, -2, -5]} intensity={0.8} />
        
        <Suspense fallback={null}>
          {/* Reduced margin to 0.8 so the model takes up maximum container space */}
          <Bounds fit clip observe margin={0.8}>
            <Model />
          </Bounds>
        </Suspense>

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
      </Canvas>
    </div>
  );
}