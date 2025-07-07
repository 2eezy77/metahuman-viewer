// BabylonScene.jsx

import React, { useEffect, useRef, useState } from 'react';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

import { loadAvatar, setupVisemePlayer } from './BabylonAvatar';
import { playSpeechWithVisemes } from '../utils/speechManager';
import { AnimationManager } from '../utils/animationManager';

import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const BabylonScene = () => {
  const canvasRef = useRef(null);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const sceneRef = useRef(null);
  const avatarRef = useRef(null);
  const cameraRef = useRef(null);
  const animationManagerRef = useRef(null);
  const visemePlayerRef = useRef(null);

  const [cameraAlpha, setCameraAlpha] = useState(Math.PI / 2);
  const [cameraBeta, setCameraBeta] = useState(Math.PI / 2.5);
  const [cameraRadius, setCameraRadius] = useState(2.5);

  const startSpeechToChat = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });
  };

  const stopSpeechToChat = () => {
    SpeechRecognition.stopListening();
  };

  useEffect(() => {
    if (!listening && transcript) {
      sendChat(transcript);
    }
  }, [listening]);

  function sendChat(message) {
    const scene = sceneRef.current;
    const avatar = avatarRef.current;
    const animationManager = animationManagerRef.current;
    const visemePlayer = visemePlayerRef.current;

    if (!scene || !avatar || !animationManager) return;

    fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(`API Error: ${text}`);
        return JSON.parse(text);
      })
      .then(({ audioUrl, visemes }) => {
        playSpeechWithVisemes(scene, avatar, audioUrl, visemes, animationManager, visemePlayer);
      })
      .catch((err) => console.error("❌ Chat request failed:", err.message));
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);
    sceneRef.current = scene;

    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    const camera = new BABYLON.ArcRotateCamera("camera", cameraAlpha, cameraBeta, cameraRadius, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    scene.activeCamera = camera;
    cameraRef.current = camera;

    const animationManager = new AnimationManager(scene);
    animationManagerRef.current = animationManager;

    loadAvatar(scene).then(({ root, animationGroups }) => {
      avatarRef.current = root;
      visemePlayerRef.current = setupVisemePlayer(scene, root);

      animationManager.registerAll?.(animationGroups) ||
        animationGroups.forEach(group => animationManager.register(group));

      const available = animationManager.listAnimations();
      if (available.includes("Idle")) animationManager.play("Idle");
      else if (available.length > 0) animationManager.play(available[0]);

      sendChat("Hey! Ready to help you!");
    });

    engine.runRenderLoop(() => {
      const cam = cameraRef.current;
      if (cam) {
        cam.alpha = cameraAlpha;
        cam.beta = cameraBeta;
        cam.radius = cameraRadius;
      }
      scene.render();
    });

    return () => engine.dispose();
  }, [cameraAlpha, cameraBeta, cameraRadius]);

  return (
    <>
      {/* 🧠 Transcript Viewer */}
      <div style={{
        position: 'absolute', top: 20, left: 20, background: 'white', padding: 10,
        borderRadius: 6, zIndex: 9999, fontFamily: 'monospace', maxWidth: 400
      }}>
        <strong>🧠 Transcript:</strong> {transcript || "Say something..."}
      </div>

      {/* 🎛️ GUI Controls */}
      <div style={{
        position: 'absolute', bottom: 20, right: 20, background: '#eee',
        padding: 15, borderRadius: 8, zIndex: 9999, width: 300
      }}>
        <h4 style={{ marginTop: 0 }}>📷 Camera Control</h4>
        <label>Alpha: {cameraAlpha.toFixed(2)}</label>
        <input type="range" min="0" max={Math.PI * 2} step="0.01" value={cameraAlpha}
          onChange={(e) => setCameraAlpha(parseFloat(e.target.value))} />

        <label>Beta: {cameraBeta.toFixed(2)}</label>
        <input type="range" min="0.1" max={Math.PI - 0.1} step="0.01" value={cameraBeta}
          onChange={(e) => setCameraBeta(parseFloat(e.target.value))} />

        <label>Radius: {cameraRadius.toFixed(2)}</label>
        <input type="range" min="1" max="10" step="0.1" value={cameraRadius}
          onChange={(e) => setCameraRadius(parseFloat(e.target.value))} />

        <hr />
        <h4>🎙️ Voice Control</h4>
        <button onClick={startSpeechToChat} style={{ marginRight: 10 }}>🎤 Start</button>
        <button onClick={stopSpeechToChat}>🛑 Stop</button>
      </div>

      {/* Babylon canvas */}
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

      
    </>
  );
};

export default BabylonScene;
