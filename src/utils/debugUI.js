import * as dat from 'dat.gui';

export function createDebugUI({
  scene,
  animationManager,
  morphManager,
  visemeNames,
  triggerExpression,
}) {
  const gui = new dat.GUI();
  gui.width = 300;

  const state = {
    animation: animationManager.listAnimations()[0] || '',
    facialExpression: 'default',
    setupMode: false,
  };

  // Animation dropdown
  gui.add(state, 'animation', animationManager.listAnimations()).onChange((value) => {
    animationManager.play(value);
  });

  // Facial Expression dropdown or trigger buttons
  gui.add(state, 'facialExpression', ['default', 'happy', 'sad']).onChange(triggerExpression);

  // Setup mode toggle
  gui.add({ enableSetupMode: () => console.log("Setup mode ON") }, 'enableSetupMode');
  gui.add({ disableSetupMode: () => console.log("Setup mode OFF") }, 'disableSetupMode');

  // Morph Target Sliders
  const visemeFolder = gui.addFolder('MorphTargets');
  visemeNames.forEach((name, index) => {
    const obj = { [name]: 0 };
    visemeFolder.add(obj, name, 0, 1, 0.01).onChange((val) => {
      morphManager.getTarget(index).influence = val;
    });
  });

  return gui;
}
