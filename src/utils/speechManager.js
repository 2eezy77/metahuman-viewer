export function playSpeechWithVisemes(scene, avatarRoot, audioUrl, visemes, animationManager) {
  const morphMesh = avatarRoot.getChildMeshes().find(m => m.morphTargetManager);
  const morphManager = morphMesh?.morphTargetManager;

  if (!morphManager) {
    console.warn("⚠️ No morph target manager found — cannot animate visemes.");
    return;
  }

  // Load and play audio
  const audio = new Audio(audioUrl);
  audio.play();

  // Convert visemes to a timeline in seconds
  let startTime = performance.now();

  scene.onBeforeRenderObservable.clear(); // remove old hooks
  scene.onBeforeRenderObservable.add(() => {
    const currentTime = (performance.now() - startTime) / 1000;

    // Clear all morph targets first
    for (let i = 0; i < morphManager.numTargets; i++) {
      morphManager.getTarget(i).influence = 0;
    }

    // Get current viseme
    const current = visemes.find(v => currentTime >= v.start && currentTime <= v.end);

    if (current) {
      const visemeName = current.value;
      const target = morphManager.getTargetByName?.(visemeName);

      if (target) {
        target.influence = 1.0;
      } else {
        // fallback if morph target names aren't exact
        for (let i = 0; i < morphManager.numTargets; i++) {
          const t = morphManager.getTarget(i);
          if (t.name.toLowerCase().includes(visemeName.toLowerCase())) {
            t.influence = 1.0;
            break;
          }
        }
      }
    }
  });

  console.log("🗣️ Started audio + viseme playback");
}
