// ===== BabylonJS Core & GUI Imports =====
import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import * as GUI from '@babylonjs/gui';

// ===== Canvas Setup =====
const canvas = document.getElementById('renderCanvas');
canvas.style.width = '100%';
canvas.style.height = '100%';
const engine = new BABYLON.Engine(canvas, true);

// Global variables
let avatar = null;
let avatarSkeleton = null;
const expressionCache = {}; // Preloaded expression animations
let camera = null; // Reference to camera
let idleAnimGroup = null; // Reference to idle animation

// ===== Expression File Lists =====
const maleTalkingExpressions = [
  "M_Talking_Variations_001.glb",
  "M_Talking_Variations_002.glb",
  "M_Talking_Variations_003.glb",
  "M_Talking_Variations_004.glb",
  "M_Talking_Variations_005.glb",
  "M_Talking_Variations_006.glb",
  "M_Talking_Variations_007.glb",
  "M_Talking_Variations_008.glb",
  "M_Talking_Variations_009.glb",
  "M_Talking_Variations_010.glb"
];

const standingExpressions = [
  "M_Standing_Expressions_001.glb",
  "M_Standing_Expressions_002.glb",
  "M_Standing_Expressions_004.glb",
  "M_Standing_Expressions_005.glb"
];

const allExpressionFiles = [...maleTalkingExpressions, ...standingExpressions];

// ===== Preload All Expression Files into Cache =====
async function preloadExpressions(scene) {
  for (const file of allExpressionFiles) {
    try {
      const result = await BABYLON.SceneLoader.LoadAssetContainerAsync("/expressions/", file, scene);
      expressionCache[file] = {
        container: result,
        animGroups: result.animationGroups
      };
      console.log(`[Preloaded] ${file}`);
    } catch (e) {
      console.warn(`[Failed to preload] ${file}`, e);
    }
  }
}

// ===== Retarget Animation to Avatar Skeleton =====
function retargetAnimation(animGroup, scene, loop = false) {
  if (!avatarSkeleton || animGroup.targetedAnimations.length === 0) return;

  const remappedGroup = new BABYLON.AnimationGroup("retargeted", scene);

  animGroup.targetedAnimations.forEach(ta => {
    const targetName = ta.target.name;
    const avatarBone = avatarSkeleton.bones.find(b => b.name === targetName);
    if (avatarBone) {
      remappedGroup.addTargetedAnimation(ta.animation.clone(), avatarBone);
    }
  });

  remappedGroup.start(loop, 1.0, remappedGroup.from, remappedGroup.to, loop);
}

// ===== Play Expression from Cache with Retargeting =====
function playExpressionFromCache(file, scene, loop = false) {
  const cached = expressionCache[file];
  if (!cached) {
    console.warn(`[Expression] ${file} not found in cache.`);
    return;
  }

  if (cached.animGroups.length > 0) {
    retargetAnimation(cached.animGroups[0], scene, loop);
    console.debug(`[Expression] Retargeted${loop ? ' (looping)' : ''}: ${file}`);
  } else {
    console.warn(`[Expression] No animation found in: ${file}`);
  }
}

function playRandomMaleTalkingExpression(scene) {
  const file = maleTalkingExpressions[Math.floor(Math.random() * maleTalkingExpressions.length)];
  playExpressionFromCache(file, scene);
}

function playRandomStandingExpression(scene) {
  const file = standingExpressions[Math.floor(Math.random() * standingExpressions.length)];
  playExpressionFromCache(file, scene, true);
}

// ===== Scene Creation =====
async function createScene() {
  const scene = new BABYLON.Scene(engine);

  // Create and configure orbit-style camera
  camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 3, 5, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  camera.wheelDeltaPercentage = 0.01;
  camera.inertia = 0.9;
  camera.lowerRadiusLimit = 2;
  camera.upperRadiusLimit = 6;
  camera.lowerBetaLimit = Math.PI / 4;
  camera.upperBetaLimit = Math.PI / 2;
  camera.lowerAlphaLimit = Math.PI / 3;
  camera.upperAlphaLimit = Math.PI * 2 / 3;

  new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

  await BABYLON.SceneLoader.AppendAsync("https://thomlucc.github.io/Assets/RoomDemo/", "LivingRoomModel9.glb", scene);

  await BABYLON.SceneLoader.ImportMeshAsync(null, "https://models.readyplayer.me/", "686257d4f08a173b71508376.glb", scene)
    .then(result => {
      avatar = result.meshes[0];
      avatar.position = new BABYLON.Vector3(0, 0, 0);
      const bounding = avatar.getHierarchyBoundingVectors(true);
      const headY = bounding.max.y - 0.1;
      const target = new BABYLON.Vector3(avatar.position.x, headY, avatar.position.z);
      camera.setTarget(target);
      avatarSkeleton = result.skeletons[0];
    });

  await preloadExpressions(scene);
  playRandomStandingExpression(scene);

  const gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  const panel = new GUI.StackPanel();
  panel.width = "220px";
  panel.top = "20px";
  panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
  panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
  gui.addControl(panel);

  for (const file of maleTalkingExpressions.slice(0, 3)) {
    const btn = GUI.Button.CreateSimpleButton(file, file.replace(".glb", ""));
    btn.height = "40px";
    btn.color = "white";
    btn.background = "#333";
    btn.onPointerUpObservable.add(() => playExpressionFromCache(file, scene));
    panel.addControl(btn);
  }

  const startBtn = GUI.Button.CreateSimpleButton("startBtn", "Start Expression");
  startBtn.height = "40px";
  startBtn.color = "white";
  startBtn.background = "green";
  startBtn.onPointerUpObservable.add(() => playRandomMaleTalkingExpression(scene));
  panel.addControl(startBtn);

  const stopBtn = GUI.Button.CreateSimpleButton("stopBtn", "Stop Expression");
  stopBtn.height = "40px";
  stopBtn.color = "white";
  stopBtn.background = "red";
  stopBtn.onPointerUpObservable.add(() => playRandomStandingExpression(scene));
  panel.addControl(stopBtn);

  return scene;
}

createScene().then(scene => {
  engine.runRenderLoop(() => {
    scene.render();
  });
});

window.addEventListener("resize", () => engine.resize());
