"use client";

import React from "react";
import { EffectComposer, Bloom, ToneMapping, ChromaticAberration, Vignette, DepthOfField, SMAA } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";

const PostProcessing: React.FC = () => {

  return (
    <EffectComposer>
      {/* Anti-aliasing for smooth edges */}
      <SMAA />
      
      {/* Depth of Field for cinematic focus */}
      <DepthOfField
        focusDistance={0.02}
        focalLength={0.02}
        bokehScale={2}
        height={480}
      />

      {/* Bloom effect for glowing highlights */}
      <Bloom
        intensity={1.5}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.9}
        height={300}
        blendFunction={BlendFunction.ADD}
      />

      {/* Chromatic Aberration for subtle color separation */}
      <ChromaticAberration
        offset={[0.0005, 0.0012]}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Vignette for cinematic darkening at edges */}
      <Vignette
        eskil={false}
        offset={0.1}
        darkness={0.5}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* ACES Filmic Tone Mapping for cinematic color grading */}
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
        resolution={256}
        whitePoint={4.0}
        middleGrey={0.6}
        minLuminance={0.01}
        averageLuminance={1.0}
        adaptationRate={2.0}
      />
    </EffectComposer>
  );
};

export default PostProcessing;

