// Master Application Controller - Three.js WebGL Hardware Showcase
class ShowcaseApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.hotspotContainer = document.getElementById('hotspots-layer');
    this.clock = new THREE.Clock();

    // Exploded View State
    this.currentExplode = 0;
    this.targetExplode = 0;
    this.isAutoSpin = true;
    this.currentMode = 'realistic';
    this.selectedHotspot = null;

    // Video Recording State
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;

    this.initScene();
    this.initLighting();
    this.initSystems();
    this.initHotspotsDOM();
    this.bindEvents();
    this.setupCameraPresets();

    // Start render loop
    this.animate();

    // Default select hotspot 1 after brief delay
    setTimeout(() => {
      this.selectHotspot(this.model.hotspots[0]);
    }, 800);
  }

  initScene() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x07090e);
    this.scene.fog = new THREE.FogExp2(0x07090e, 0.015);

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    this.camera.position.set(22, 14, 25);

    // 3. Renderer with antialiasing and tone mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true // Required for screenshot & video capture
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't flip below ground
    this.controls.minDistance = 8;
    this.controls.maxDistance = 65;
    this.controls.target.set(0, 0, 0);

    // 5. Studio Ground Grid & Pedestal
    const grid = new THREE.GridHelper(80, 40, 0x00f0ff, 0x1e293b);
    grid.position.y = -3.8;
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    this.scene.add(grid);

    // Ambient floating particles
    const partGeo = new THREE.BufferGeometry();
    const count = 300;
    const posArr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      posArr[i] = (Math.random() - 0.5) * 60;
      posArr[i + 1] = Math.random() * 30 - 5;
      posArr[i + 2] = (Math.random() - 0.5) * 60;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    const partMat = new THREE.PointsMaterial({
      size: 0.25,
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    this.particles = new THREE.Points(partGeo, partMat);
    this.scene.add(this.particles);
  }

  initLighting() {
    // 1. Soft Ambient Sky Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    // 2. Main Key Directional Studio Light
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    this.keyLight.position.set(18, 25, 18);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 70;
    this.keyLight.shadow.bias = -0.0005;
    const d = 16;
    this.keyLight.shadow.camera.left = -d;
    this.keyLight.shadow.camera.right = d;
    this.keyLight.shadow.camera.top = d;
    this.keyLight.shadow.camera.bottom = -d;
    this.scene.add(this.keyLight);

    // 3. Cyber Blue Rim Light (Edge definition)
    const rimLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    rimLight.position.set(-20, 10, -20);
    this.scene.add(rimLight);

    // 4. Warm Fill Light
    const fillLight = new THREE.DirectionalLight(0xffb700, 0.4);
    fillLight.position.set(0, -10, 15);
    this.scene.add(fillLight);
  }

  initSystems() {
    // 1. Telemetry simulation engine
    this.telemetry = new ColdChainTelemetry();

    // 2. Material library
    this.materials = new MaterialLibrary(this.telemetry);

    // 3. 3D Model assembly
    this.model = new HardwareModel(this.scene, this.materials);

    // Subscribe live telemetry updates to DOM HUD
    this.telemetry.subscribe(data => {
      this.updateTelemetryHUD(data);
    });
  }

  initHotspotsDOM() {
    this.hotspotElements = [];
    this.model.hotspots.forEach(spot => {
      const el = document.createElement('div');
      el.className = 'hotspot-marker';
      el.id = `hotspot-${spot.id}`;
      el.innerHTML = `
        <div class="marker-radar"></div>
        <div class="marker-inner">${spot.id}</div>
        <div class="hotspot-tooltip">${spot.title}</div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        window.soundEffects.playClick();
        this.selectHotspot(spot);
      });

      this.hotspotContainer.appendChild(el);
      this.hotspotElements.push({ spot, el });
    });
  }

  updateHotspotsPositions() {
    const tempV = new THREE.Vector3();
    const wHalf = window.innerWidth / 2;
    const hHalf = window.innerHeight / 2;

    this.hotspotElements.forEach(item => {
      tempV.copy(item.spot.pos);
      // Offset position slightly during explode view
      if (this.currentExplode > 0.05) {
        tempV.y += this.currentExplode * 1.5;
      }

      tempV.project(this.camera);

      // Check if behind camera
      if (tempV.z > 1) {
        item.el.style.display = 'none';
        return;
      }

      item.el.style.display = 'block';
      const x = (tempV.x * wHalf) + wHalf;
      const y = -(tempV.y * hHalf) + hHalf;
      item.el.style.left = `${x}px`;
      item.el.style.top = `${y}px`;
    });
  }

  selectHotspot(spot) {
    this.selectedHotspot = spot;
    this.updateInspectorDossier(spot);

    // Animate camera smoothly to focus on selected part
    const targetPos = spot.pos.clone();
    targetPos.y += this.currentExplode * 1.5;

    // Calculate camera offset
    const offsetDir = this.camera.position.clone().sub(this.controls.target).normalize();
    const newCamPos = targetPos.clone().add(offsetDir.multiplyScalar(18));

    this.tweenCamera(newCamPos, targetPos, 900);

    // Highlight active pin
    this.hotspotElements.forEach(item => {
      if (item.spot.id === spot.id) {
        item.el.querySelector('.marker-inner').style.backgroundColor = '#00f0ff';
        item.el.querySelector('.marker-inner').style.color = '#000';
      } else {
        item.el.querySelector('.marker-inner').style.backgroundColor = 'rgba(13, 18, 28, 0.85)';
        item.el.querySelector('.marker-inner').style.color = '#00f0ff';
      }
    });
  }

  updateInspectorDossier(spot) {
    document.getElementById('ins-title').innerText = spot.title;
    document.getElementById('ins-category').innerText = spot.category;
    document.getElementById('ins-partno').innerText = spot.partNumber;
    document.getElementById('ins-desc').innerText = spot.desc;

    // Specs Grid
    const specGrid = document.getElementById('ins-specs');
    specGrid.innerHTML = '';
    for (const [k, v] of Object.entries(spot.specs)) {
      const card = document.createElement('div');
      card.className = 'spec-card';
      card.innerHTML = `
        <div class="spec-label">${k}</div>
        <div class="spec-val">${v}</div>
      `;
      specGrid.appendChild(card);
    }

    // Bullets
    const bulletList = document.getElementById('ins-bullets');
    bulletList.innerHTML = '';
    spot.bullets.forEach(b => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="bullet-icon"></span><span>${b}</span>`;
      bulletList.appendChild(li);
    });
  }

  updateTelemetryHUD(data) {
    const elTemp = document.getElementById('hud-temp');
    const elHum = document.getElementById('hud-hum');
    const elEth = document.getElementById('hud-eth');
    const elBat = document.getElementById('hud-bat');
    const elBlock = document.getElementById('hud-block');
    const elHash = document.getElementById('hud-hash');

    if (elTemp) elTemp.innerText = `${data.temp}°C`;
    if (elHum) elHum.innerText = `${data.humidity}%`;
    if (elEth) elEth.innerText = `${data.ethylene} ppm`;
    if (elBat) elBat.innerText = `${data.battery}%`;
    if (elBlock) elBlock.innerText = `#${data.block}`;
    if (elHash) elHash.innerText = data.hash;
  }

  // Camera tween interpolation
  tweenCamera(targetPosition, targetLookAt, duration = 800) {
    const startPos = this.camera.position.clone();
    const startLookAt = this.controls.target.clone();
    const startTime = performance.now();

    const anim = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2; // Ease-in-out sine

      this.camera.position.lerpVectors(startPos, targetPosition, ease);
      this.controls.target.lerpVectors(startLookAt, targetLookAt, ease);

      if (progress < 1.0) {
        requestAnimationFrame(anim);
      }
    };
    requestAnimationFrame(anim);
  }

  setupCameraPresets() {
    this.presets = {
      isometric: { pos: new THREE.Vector3(22, 14, 25), target: new THREE.Vector3(0, 0, 0) },
      front: { pos: new THREE.Vector3(0, 1.5, 22), target: new THREE.Vector3(0, 0.5, 0) },
      top: { pos: new THREE.Vector3(0, 26, 0.1), target: new THREE.Vector3(0, 0, 0) },
      electronics: { pos: new THREE.Vector3(0, 10, 14), target: new THREE.Vector3(0, 1.2, 0) },
      sensors: { pos: new THREE.Vector3(-18, 5, 8), target: new THREE.Vector3(-9.5, 0.5, 0) },
      antenna: { pos: new THREE.Vector3(18, 6, 8), target: new THREE.Vector3(7.8, 3.5, 2.5) }
    };
  }

  applyPreset(presetKey) {
    const preset = this.presets[presetKey];
    if (preset) {
      window.soundEffects.playClick();
      this.tweenCamera(preset.pos, preset.target, 900);
    }
  }

  setRenderMode(mode) {
    this.currentMode = mode;
    this.materials.setRenderMode(mode);

    // If exploded mode clicked
    if (mode === 'exploded') {
      this.setExplode(0.85);
      const slider = document.getElementById('explode-slider');
      if (slider) slider.value = 85;
    } else if (this.currentExplode > 0 && mode === 'realistic') {
      this.setExplode(0);
      const slider = document.getElementById('explode-slider');
      if (slider) slider.value = 0;
    }

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    this.showToast(`View Mode: ${mode.toUpperCase()}`);
  }

  setExplode(factor) {
    this.targetExplode = Math.max(0, Math.min(1, factor));
    window.soundEffects.playServo();
  }

  // Record 360 Turntable Video Clip
  recordVideo() {
    if (this.isRecording) {
      this.stopVideoRecording();
      return;
    }

    window.soundEffects.playPing();
    const btn = document.getElementById('btn-record');
    btn.classList.add('recording');
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"/></svg> <span>RECORDING...</span>`;
    this.isRecording = true;
    this.recordedChunks = [];

    // Capture WebGL canvas stream at 60 FPS
    const canvas = this.renderer.domElement;
    const stream = canvas.captureStream(60);

    const options = { mimeType: 'video/webm;codecs=vp9' };
    try {
      this.mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(stream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ColdChain_IoT_3D_Showcase_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast('✅ Video recording saved to Downloads!');
      btn.classList.remove('recording');
      btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="#ef4444"/></svg> <span>RECORD 360° VIDEO</span>`;
      this.isRecording = false;
    };

    this.mediaRecorder.start();

    // Auto rotate 360 and smooth explode cycle during recording
    this.isAutoSpin = true;
    const startAngle = this.model.root.rotation.y;
    const recordingDuration = 7000; // 7 seconds showcase video

    // Trigger dynamic explode cycle during video
    setTimeout(() => { this.setExplode(0.75); }, 1500);
    setTimeout(() => { this.setExplode(0.0); }, 4500);

    setTimeout(() => {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    }, recordingDuration);

    this.showToast('🎥 Recording 360° showcase video clip (7s)...');
  }

  stopVideoRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  // 4K / High-Resolution Screenshot Snapshot
  captureSnapshot() {
    window.soundEffects.playClick();
    this.renderer.render(this.scene, this.camera);
    const dataURL = this.renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `ColdChain_IoT_Render_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.showToast('📸 High-Res Snapshot Saved!');
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.innerText = message;
      toast.classList.add('show');
      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }

  bindEvents() {
    // Window Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Explode Slider
    const slider = document.getElementById('explode-slider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        this.setExplode(parseFloat(e.target.value) / 100);
      });
    }

    // Auto-spin toggle
    const spinBtn = document.getElementById('btn-spin');
    if (spinBtn) {
      spinBtn.addEventListener('click', () => {
        this.isAutoSpin = !this.isAutoSpin;
        spinBtn.classList.toggle('active', this.isAutoSpin);
        window.soundEffects.playClick();
      });
    }

    // Reset View Button
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.applyPreset('isometric');
        this.setExplode(0);
        if (slider) slider.value = 0;
      });
    }

    // Audio SFX toggle
    const audioBtn = document.getElementById('btn-audio');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = window.soundEffects.toggleMute();
        audioBtn.classList.toggle('muted', isMuted);
        this.showToast(isMuted ? '🔇 Audio Muted' : '🔊 Audio Enabled');
      });
    }

    // Record Video Button
    const recordBtn = document.getElementById('btn-record');
    if (recordBtn) {
      recordBtn.addEventListener('click', () => this.recordVideo());
    }

    // Snapshot Button
    const snapBtn = document.getElementById('btn-snapshot');
    if (snapBtn) {
      snapBtn.addEventListener('click', () => this.captureSnapshot());
    }

    // Mode Buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.soundEffects.playClick();
        this.setRenderMode(btn.dataset.mode);
      });
    });

    // Camera Preset Buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyPreset(btn.dataset.preset);
      });
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();

    // 1. Smoothly interpolate Exploded View factor
    if (Math.abs(this.currentExplode - this.targetExplode) > 0.001) {
      this.currentExplode += (this.targetExplode - this.currentExplode) * 0.08;
      this.model.setExplodeFactor(this.currentExplode);
    }

    // 2. Turntable Auto Spin
    if (this.isAutoSpin) {
      this.model.root.rotation.y += delta * 0.25;
    }

    // 3. Gentle float animation for background particles
    if (this.particles) {
      this.particles.rotation.y += delta * 0.04;
    }

    // 4. Update hardware animated sub-elements (LEDs, coils)
    this.model.update(delta);

    // 5. Update OrbitControls
    this.controls.update();

    // 6. Update 3D Hotspot Screen-space positions
    this.updateHotspotsPositions();

    // 7. Render frame
    this.renderer.render(this.scene, this.camera);
  }
}

// Bootstrap on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  window.app = new ShowcaseApp();
});
