/**
 * AnimationManager handles multiple named Babylon.js animation groups.
 * It allows you to register, play, stop, and inspect animations by name.
 */
export class AnimationManager {
  constructor(scene) {
    this.scene = scene;       // Babylon.js scene reference
    this.animations = {};     // All registered animation groups
    this.current = null;      // Currently playing animation group
  }

  /**
   * Registers all animation groups returned from a GLB file
   * @param {BABYLON.AnimationGroup[]} groups
   */
  registerAll(groups = []) {
    groups.forEach((group) => {
      this.animations[group.name] = group;
    });

    console.log("🎞️ Registered animations:", this.listAnimations());
  }

  /**
   * Register a single animation group
   * @param {BABYLON.AnimationGroup} group
   */
  register(group) {
    this.animations[group.name] = group;
  }

  /**
   * Play a named animation, stopping any currently playing one
   * @param {string} name - Name of the animation
   * @param {boolean} loop - Should it loop? (default true)
   */
  play(name, loop = true) {
    if (this.current) {
      this.current.stop(); // Stop previous animation
    }

    const group = this.animations[name];

    if (group) {
      group.start(loop);
      this.current = group;
      console.log(`▶️ Playing animation: "${name}"`);
    } else {
      console.warn(`⚠️ Animation "${name}" not found in AnimationManager`);
    }
  }

  /**
   * Stop any currently playing animation.
   */
  stop() {
    if (this.current) {
      this.current.stop();
      console.log(`⏹️ Stopped animation: "${this.current.name}"`);
    }
    this.current = null;
  }

  /**
   * Returns list of all registered animation names
   * @returns {string[]}
   */
  listAnimations() {
    return Object.keys(this.animations);
  }
}
