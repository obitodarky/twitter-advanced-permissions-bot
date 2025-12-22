import React from "react";

export const Lights = () => {
  return (
    <>
      <color attach="background" args={["#1a1a1a"]} />
      <hemisphereLight intensity={0.8} groundColor="#2a2a2a" />
      <spotLight
        decay={0}
        position={[10, 20, 10]}
        angle={0.12}
        penumbra={1}
        intensity={3}
        castShadow
        shadow-mapSize={1024}
      />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
    </>
  );
};
