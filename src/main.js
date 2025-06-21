import * as BABYLON from '@babylonjs/core';

//Create Canvas variable
const canvas = document.getElementById('renderCanvas');
//manually set canvas size
canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const engine = new BABYLON.Engine(canvas, true);

//create scene instance that is returned by the function()
const createScene = function () {
  const scene = new BABYLON.Scene(engine);

  // Create camera
  const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 3, Math.PI / 4, 5, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);

  // Create light
  new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

  // Create a visible material
  const material = new BABYLON.StandardMaterial("mat", scene);
  material.diffuseColor = new BABYLON.Color3(0.3, 0.6, 1);

  //Creating Box
  // const box = new BABYLON.MeshBuilder.CreateBox('myBox', {
  //   size: 0.1,
  //   width: 2,
  //   height: 0.03,
  //   depth: 0.5,
  //   faceColors: [
  //     new BABYLON.Color4(1, 0, 0, 1),
  //     BABYLON.Color3.Yellow(),
  //     BABYLON
  //   ]
  // });

  //Creating ground
  // const ground = BABYLON.MeshBuilder.CreateGround('', {
  //   height: 10,
  //   width: 10,
  //   subdivisions: 50,
  //   subdivisionsY: 10

  // });

  // ground.material = new BABYLON.StandardMaterial();
  // ground.material.wireframe = true;

  //Create terrain
  const groundFromHM = BABYLON.MeshBuilder.CreateGroundFromHeightMap(
    "groundFromHM",
    "/heightmap.png",
    {
      width: 10,
      height: 10,
      subdivisions: 50,
      minHeight: 0,
      maxHeight: 2
    },
    scene // ✅ You forgot this! (IDK chatgpt told me this)
  );
  //add wire frame for terrain
  const wireMat = new BABYLON.StandardMaterial("wireMat", scene);
  wireMat.wireframe = true;
  groundFromHM.material = wireMat;
  // Create sphere
  // const sphere = BABYLON.MeshBuilder.CreateSphere("mySphere", {
  //   segments: 16,
  //   diameter: 2
  // }, scene);
  // sphere.material = material;

  return scene;

  
};

//assign return scene to a variable createScene() to loop back to
const scene = createScene();

//renderLoop
engine.runRenderLoop(() => {
  scene.render();
});


window.addEventListener('resize', () => {
  engine.resize(); //force resize once DOM is ready
});
