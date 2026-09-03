import * as THREE from "three";
import {
  berryVertexShader,
  berryFragmentShader,
  tunnelVertexShader,
  tunnelFragmentShader,
  fluidFragmentShader,
  particleVertexShader,
  particleFragmentShader,
  postVertexShader,
  postFragmentShader,
} from "./shaders";

export type Stage = 0 | 1 | 2;

export interface RenderState {
  distortion: number;
  warp: number;
  stage: Stage;
  depth: number;
}

export class MultiverseRenderer {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;
  private rafId = 0;
  private running = false;

  // Stage objects
  private berry!: THREE.Mesh;
  private berryMaterial!: THREE.ShaderMaterial;
  private tunnel!: THREE.Mesh;
  private tunnelMaterial!: THREE.ShaderMaterial;
  private fluidQuad!: THREE.Mesh;
  private fluidMaterial!: THREE.ShaderMaterial;
  private particles!: THREE.Points;
  private particleMaterial!: THREE.ShaderMaterial;

  // Post-processing
  private postScene: THREE.Scene;
  private postCamera: THREE.OrthographicCamera;
  private postMaterial!: THREE.ShaderMaterial;
  private renderTarget: THREE.WebGLRenderTarget;

  // State
  private state: RenderState = {
    distortion: 0.5,
    warp: 1,
    stage: 0,
    depth: 0,
  };

  // Camera transition
  private cameraTargetZ = 5;
  private cameraTargetFov = 60;
  private mouse = new THREE.Vector2(0, 0);
  private mouseWorld = new THREE.Vector3(0, 0, 0);
  private dragging = false;
  private lastMouse = new THREE.Vector2(0, 0);

  // Callbacks
  public onDepthChange: ((depth: number) => void) | null = null;

  // ── Init ────────────────────────────────────────────
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x030014, 1);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030014, 0.04);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.01,
      200
    );
    this.camera.position.set(0, 0, 5);

    this.clock = new THREE.Clock();

    // Post-processing
    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      }
    );

    this.buildBerry();
    this.buildTunnel();
    this.buildFluid();
    this.buildParticles();
    this.buildPostProcess();
    this.bindEvents();
  }

  // ── Build the quantum berry ────────────────────────
  private buildBerry() {
    const geometry = new THREE.IcosahedronGeometry(1.2, 64);
    this.berryMaterial = new THREE.ShaderMaterial({
      vertexShader: berryVertexShader,
      fragmentShader: berryFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uDistortion: { value: this.state.distortion },
        uPulse: { value: 0 },
        uMouse: { value: new THREE.Vector3(0, 0, 0) },
      },
    });
    this.berry = new THREE.Mesh(geometry, this.berryMaterial);
    this.scene.add(this.berry);
  }

  // ── Build the tunnel ───────────────────────────────
  private buildTunnel() {
    const geometry = new THREE.CylinderGeometry(1.5, 1.5, 40, 64, 32, true);
    geometry.rotateX(Math.PI / 2);
    this.tunnelMaterial = new THREE.ShaderMaterial({
      vertexShader: tunnelVertexShader,
      fragmentShader: tunnelFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uDistortion: { value: this.state.distortion },
        uWarp: { value: this.state.warp },
        uOpacity: { value: 0 },
      },
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.tunnel = new THREE.Mesh(geometry, this.tunnelMaterial);
    this.tunnel.position.z = -15;
    this.scene.add(this.tunnel);
  }

  // ── Build the fluid simulation ─────────────────────
  private buildFluid() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.fluidMaterial = new THREE.ShaderMaterial({
      vertexShader: postVertexShader,
      fragmentShader: fluidFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uWarp: { value: this.state.warp },
        uOpacity: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
      },
      transparent: true,
      depthWrite: false,
    });
    this.fluidQuad = new THREE.Mesh(geometry, this.fluidMaterial);
    this.fluidQuad.position.z = -2;
    this.fluidQuad.scale.set(4, 4, 1);
    this.scene.add(this.fluidQuad);
  }

  // ── Build the particle field ───────────────────────
  private buildParticles() {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    const palette = [
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xa855f7),
      new THREE.Color(0xd946ef),
      new THREE.Color(0x6366f1),
      new THREE.Color(0x3b0764),
    ];

    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      scales[i] = 0.3 + Math.random() * 0.7;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 8 },
        uWarp: { value: this.state.warp },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, this.particleMaterial);
    this.scene.add(this.particles);
  }

  // ── Build post-process pass ────────────────────────
  private buildPostProcess() {
    this.postMaterial = new THREE.ShaderMaterial({
      vertexShader: postVertexShader,
      fragmentShader: postFragmentShader,
      uniforms: {
        tDiffuse: { value: this.renderTarget.texture },
        uTime: { value: 0 },
        uAberration: { value: 0.004 },
      },
    });
    const quad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      this.postMaterial
    );
    this.postScene.add(quad);
  }

  // ── Event binding ──────────────────────────────────
  private bindEvents() {
    window.addEventListener("resize", this.onResize);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    this.canvas.addEventListener("touchmove", this.onTouchMove, {
      passive: true,
    });
  }

  private onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderTarget.setSize(w, h);
    this.fluidMaterial.uniforms.uResolution.value.set(w, h);
  };

  private onMouseMove = (e: MouseEvent) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    if (this.dragging) {
      const dx = e.clientX - this.lastMouse.x;
      const dy = e.clientY - this.lastMouse.y;
      this.berry.rotation.y += dx * 0.01;
      this.berry.rotation.x += dy * 0.01;
    }
    this.lastMouse.set(e.clientX, e.clientY);

    // Project mouse to world space near berry
    const vec = new THREE.Vector3(this.mouse.x, this.mouse.y, 0.5);
    vec.unproject(this.camera);
    const dir = vec.sub(this.camera.position).normalize();
    const distance = -this.camera.position.z / dir.z;
    this.mouseWorld.copy(this.camera.position).add(dir.multiplyScalar(distance));
  };

  private onMouseDown = (e: MouseEvent) => {
    this.dragging = true;
    this.lastMouse.set(e.clientX, e.clientY);
  };

  private onMouseUp = () => {
    this.dragging = false;
  };

  private onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      this.mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
    }
  };

  // ── Public controls ────────────────────────────────
  public setDistortion(v: number) {
    this.state.distortion = v;
    this.berryMaterial.uniforms.uDistortion.value = v;
    this.tunnelMaterial.uniforms.uDistortion.value = v;
  }

  public setWarp(v: number) {
    this.state.warp = v;
    this.particleMaterial.uniforms.uWarp.value = v;
    this.tunnelMaterial.uniforms.uWarp.value = v;
    this.fluidMaterial.uniforms.uWarp.value = v;
  }

  public setStage(stage: Stage) {
    this.state.stage = stage;
    if (stage === 0) {
      this.cameraTargetZ = 5;
      this.cameraTargetFov = 60;
    } else if (stage === 1) {
      this.cameraTargetZ = -1;
      this.cameraTargetFov = 75;
    } else {
      this.cameraTargetZ = -5;
      this.cameraTargetFov = 90;
    }
  }

  public diveIn() {
    // Quick zoom rush into the berry
    this.cameraTargetZ = -1.5;
    this.cameraTargetFov = 80;
    setTimeout(() => {
      this.setStage(1);
    }, 600);
  }

  // ── Render loop ────────────────────────────────────
  private animate = () => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.animate);

    const t = this.clock.getElapsedTime();
    const dt = this.clock.getDelta();

    // Smooth camera movement
    this.camera.position.z +=
      (this.cameraTargetZ - this.camera.position.z) * 0.04;
    this.camera.fov += (this.cameraTargetFov - this.camera.fov) * 0.04;
    this.camera.updateProjectionMatrix();

    // Camera parallax based on mouse
    this.camera.position.x += (this.mouse.x * 0.5 - this.camera.position.x) * 0.03;
    this.camera.position.y += (this.mouse.y * 0.5 - this.camera.position.y) * 0.03;
    this.camera.lookAt(0, 0, this.camera.position.z - 5);

    // Berry animation
    this.berryMaterial.uniforms.uTime.value = t;
    this.berryMaterial.uniforms.uMouse.value.copy(this.mouseWorld);
    const pulse = Math.sin(t * 1.5) * 0.5 + 0.5;
    this.berryMaterial.uniforms.uPulse.value = pulse * 0.3;
    if (!this.dragging) {
      this.berry.rotation.y += dt * 0.15;
      this.berry.rotation.x += dt * 0.05;
    }

    // Tunnel animation
    this.tunnelMaterial.uniforms.uTime.value = t;

    // Fluid animation
    this.fluidMaterial.uniforms.uTime.value = t;

    // Particles
    this.particleMaterial.uniforms.uTime.value = t;
    this.particles.rotation.y += dt * 0.05 * this.state.warp;
    this.particles.rotation.x += dt * 0.02 * this.state.warp;

    // Stage visibility transitions
    const stageOpacitySpeed = 0.02;
    const targetBerryOpacity = this.state.stage === 0 ? 1 : 0;
    const targetTunnelOpacity = this.state.stage === 1 ? 1 : 0;
    const targetFluidOpacity = this.state.stage === 2 ? 1 : 0;

    // Berry visibility via scale
    const berryScale = this.state.stage === 0 ? 1 : 0.001;
    this.berry.scale.x += (berryScale - this.berry.scale.x) * 0.05;
    this.berry.scale.y = this.berry.scale.x;
    this.berry.scale.z = this.berry.scale.x;

    this.tunnelMaterial.uniforms.uOpacity.value +=
      (targetTunnelOpacity - this.tunnelMaterial.uniforms.uOpacity.value) *
      stageOpacitySpeed;
    this.fluidMaterial.uniforms.uOpacity.value +=
      (targetFluidOpacity - this.fluidMaterial.uniforms.uOpacity.value) *
      stageOpacitySpeed;

    // Depth calculation
    const depth = (5 - this.camera.position.z) * 0.5;
    this.state.depth = Math.max(0, depth);
    if (this.onDepthChange) {
      this.onDepthChange(this.state.depth);
    }

    // Post-process
    this.postMaterial.uniforms.uTime.value = t;
    const aberrationAmount = this.state.stage === 1 ? 0.008 : 0.004;
    this.postMaterial.uniforms.uAberration.value = aberrationAmount * this.state.warp;

    // Render scene to target
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);

    // Render post-process to screen
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);
  };

  public start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.animate();
  }

  public stop() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  public dispose() {
    this.stop();
    window.removeEventListener("resize", this.onResize);
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    this.canvas.removeEventListener("touchmove", this.onTouchMove);
    this.renderer.dispose();
    this.berry.geometry.dispose();
    this.berryMaterial.dispose();
    this.tunnel.geometry.dispose();
    this.tunnelMaterial.dispose();
    this.fluidQuad.geometry.dispose();
    this.fluidMaterial.dispose();
    this.particles.geometry.dispose();
    this.particleMaterial.dispose();
    this.postMaterial.dispose();
    this.renderTarget.dispose();
  }
}
