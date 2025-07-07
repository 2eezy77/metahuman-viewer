import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders'; // Required to load .glb/.gltf files

/**
 * Loads a Ready Player Me avatar model and returns:
 *  - the root mesh (for positioning/scaling/skeleton access)
 *  - animationGroups (used for triggering prebuilt animations like "Talking", "Idle", etc.)
 *
 * @param {BABYLON.Scene} scene - The Babylon.js scene into which the avatar is loaded.
 * @returns {Promise<{ root: BABYLON.AbstractMesh, animationGroups: BABYLON.AnimationGroup[] }>}
 */
function loadAvatar(scene) {
  return new Promise((resolve, reject) => {
    BABYLON.SceneLoader.ImportMesh(
      null, // null = import all meshes from file
      "/models/", // Public folder path to .glb file
      "68676b878351410dbc966241.glb", // Replace with your avatar's filename
      scene,
      (meshes, particleSystems, skeletons, animationGroups) => {
        const root = meshes[0]; // Root mesh of the avatar

        // ✅ Adjust scale and position for visibility
        root.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
        root.position = new BABYLON.Vector3(0, -1.2, 0);

        // ✅ Link skeleton if present
        if (skeletons.length > 0) {
          root.skeleton = skeletons[0];
        }

        // ✅ Resolve with mesh + animationGroups
        resolve({ root, animationGroups });
      },
      null,
      (error) => {
        console.error("❌ Failed to load avatar:", error);
        reject(error);
      }
    );
  });
}

/**
 * Initializes the avatar for viseme-based facial animation.
 * This enables real-time lip sync using morph target values (from Rhubarb/ElevenLabs).
 *
 * @param {BABYLON.Scene} scene - The Babylon.js scene
 * @param {BABYLON.AbstractMesh} avatarRoot - Root mesh of the loaded avatar
 */
function setupVisemePlayer(scene, avatarRoot) {
  // ✅ Find the child mesh with morph targets
  const morphMesh = avatarRoot.getChildMeshes().find(m => m.morphTargetManager);
  const morphManager = morphMesh?.morphTargetManager;

  if (!morphManager) {
    console.warn("⚠️ No morph target manager found on avatar. Lip sync will not function.");
    return;
  }

  // ✅ Register a placeholder update loop (used later during speech playback)
  scene.onBeforeRenderObservable.add(() => {
    // This gets dynamically overwritten by playSpeechWithVisemes
  });

  console.log("✅ Viseme player setup complete.");
}

// ✅ Export both functions explicitly so they're accessible elsewhere
export { loadAvatar, setupVisemePlayer };
