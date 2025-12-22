import { useGLTF } from "@react-three/drei";
import React from "react";

function Hall({ ...props }) {
  const { scene } = useGLTF("/model/hall.glb");
  return <primitive object={scene} {...props} />;
}

export default Hall;
