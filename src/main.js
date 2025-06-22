import * as BABYLON from '@babylonjs/core';

const canvas = document.getElementById('renderCanvas');
canvas.style.width = "99vw";
canvas.style.height = "90vh";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
  const scene = new BABYLON.Scene(engine);

  // ✅ Camera setup
  const camera = new BABYLON.ArcRotateCamera(
    'camera',
    Math.PI / 2,
    Math.PI / 3,
    20,
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  camera.attachControl(canvas, true);

  // ✅ Lighting
  new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

  // ✅ Material
  const sphereMaterial = new BABYLON.StandardMaterial("mat", scene);
  sphereMaterial.ambientColor = new BABYLON.Color3(0, 1, 1);
  sphereMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
  scene.ambientColor = new BABYLON.Color3(0, 1, 0.5);

  // // ✅ Box mesh
  // const box = BABYLON.MeshBuilder.CreateBox("myBox", {
  //   width: 2,
  //   height: 0.5,
  //   depth: 1,
  // }, scene);
  // box.material = sphereMaterial;
  // box.position.y = 1;

  // ✅ Animation (rotate box)
  // scene.registerBeforeRender(() => {
  //   box.rotation.x += 0.01;
  //   box.rotation.y += 0.01;
  //   box.rotation.z += 0.01;
  // });
  // Animation (scaling box on the x to 2 120/30 = # of seconds it takes)
  // BABYLON.Animation.CreateAndStartAnimation(
  //   'xScaleAnimation',
  //   box,
  //   'scaling.x',
  //   30,
  //   120,
  //   0,
  //   2,
  //   BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
  //   new BABYLON.CircleEase
  // );
  // const animation = new BABYLON.Animation(
  //   'yRotAnimation',
  //   'rotation.y',
  //   30,
  //   BABYLON.Animation.ANIMATIONTYPE_FLOAT,
  //   BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
  // );

  // const animationKeys = [ { frame: 0, value: 0 },
  // { frame: 60, value: 2 * Math.PI }];

  // animation.setKeys(animationKeys);

  // box.animations = [];
  // box.animations.push(animation);
  // scene.beginAnimation(box, 0, 60, true);

  // Create terrain from heightmap
const groundFromHM = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
  "groundFromHM",
  "/heightmap.png",
  {
    width: 10,
    height: 10,
    subdivisions: 75,
    minHeight: 0,
    maxHeight: 2
  },
  scene
);

// Create material with image texture (e.g., grass.jpg)
const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
groundMaterial.diffuseTexture = new BABYLON.Texture("/heightmap.png", scene); // 🔁 use a real texture image

// // Optional: Tile the texture
groundMaterial.diffuseTexture.uScale = 1;
groundMaterial.diffuseTexture.vScale = 1;

// // Apply material to the terrain
groundFromHM.material = groundMaterial;

groundMaterial.wireframe = true;
groundFromHM.material = groundMaterial;
  return scene;
};

const scene = createScene();

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
});
