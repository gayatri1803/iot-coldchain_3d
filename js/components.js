// 3D Procedural Hardware Components Architecture
class HardwareModel {
  constructor(scene, materials) {
    this.scene = scene;
    this.mat = materials.materials;
    this.root = new THREE.Group();
    this.scene.add(this.root);

    // List of parts for exploded view animation interpolation
    this.animatableParts = [];
    this.hotspots = [];

    this.buildAssembly();
  }

  registerPart(meshOrGroup, explodeOffset) {
    const basePos = meshOrGroup.position.clone();
    const baseRot = meshOrGroup.rotation.clone();
    this.animatableParts.push({
      obj: meshOrGroup,
      basePos: basePos,
      explodeOffset: explodeOffset,
      baseRot: baseRot
    });
  }

  buildAssembly() {
    this.buildEnclosureBase();
    this.buildEnclosureLid();
    this.buildSolarPanel();
    this.buildCornerScrews();
    this.buildAntenna();
    this.buildCableGlands();
    this.buildFrontDisplayAndBranding();
    this.buildBatteryPack();
    this.buildElectronicsStack();
    this.buildSensorSuite();
    this.initHotspotData();
  }

  // 1. IP67 Rugged Enclosure Lower Body
  buildEnclosureBase() {
    const baseGroup = new THREE.Group();

    // Main outer box shell
    const outerGeo = new THREE.BoxGeometry(14, 5.2, 10);
    const outerMesh = new THREE.Mesh(outerGeo, this.mat.enclosure);
    outerMesh.castShadow = true;
    outerMesh.receiveShadow = true;
    baseGroup.add(outerMesh);

    // Inner cavity cutout effect (dark recessed floor)
    const cavityGeo = new THREE.BoxGeometry(12.4, 4.4, 8.4);
    const cavityMesh = new THREE.Mesh(cavityGeo, this.mat.enclosureInner);
    cavityMesh.position.y = 0.5;
    baseGroup.add(cavityMesh);

    // Outer corner reinforced pillars (4x)
    const pillarPositions = [
      [-6.6, 0, -4.6],
      [6.6, 0, -4.6],
      [-6.6, 0, 4.6],
      [6.6, 0, 4.6]
    ];
    pillarPositions.forEach(pos => {
      const pGeo = new THREE.CylinderGeometry(0.9, 0.9, 5.2, 16);
      const pMesh = new THREE.Mesh(pGeo, this.mat.enclosure);
      pMesh.position.set(...pos);
      baseGroup.add(pMesh);
    });

    // Outer mounting flanges/ears (left & right sides for cargo crate mounting)
    [-7.4, 7.4].forEach(x => {
      const earGeo = new THREE.BoxGeometry(0.8, 0.6, 4.5);
      const earMesh = new THREE.Mesh(earGeo, this.mat.enclosure);
      earMesh.position.set(x, -2.1, 0);
      baseGroup.add(earMesh);

      // Slotted hole
      const holeGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.7, 12);
      const holeMesh = new THREE.Mesh(holeGeo, this.mat.enclosureInner);
      holeMesh.position.set(x, -2.1, 0);
      baseGroup.add(holeMesh);
    });

    baseGroup.position.set(0, 0, 0);
    this.root.add(baseGroup);
    this.registerPart(baseGroup, new THREE.Vector3(0, 0, 0));
  }

  // 2. Weatherproof Lid & Neoprene Gasket
  buildEnclosureLid() {
    this.lidGroup = new THREE.Group();

    // Upper lid plate
    const lidGeo = new THREE.BoxGeometry(14.2, 1.0, 10.2);
    const lidMesh = new THREE.Mesh(lidGeo, this.mat.enclosure);
    lidMesh.castShadow = true;
    lidMesh.receiveShadow = true;
    this.lidGroup.add(lidMesh);

    // Recessed pocket on top for solar panel
    const pocketGeo = new THREE.BoxGeometry(11.2, 0.3, 7.8);
    const pocketMesh = new THREE.Mesh(pocketGeo, this.mat.enclosureInner);
    pocketMesh.position.y = 0.4;
    this.lidGroup.add(pocketMesh);

    // Black Neoprene Sealing Gasket (IP67 waterproof ring beneath lid)
    this.gasketGroup = new THREE.Group();
    const gGeo = new THREE.BoxGeometry(13.2, 0.25, 9.2);
    const gMesh = new THREE.Mesh(gGeo, this.mat.gasket);
    this.gasketGroup.add(gMesh);
    this.gasketGroup.position.set(0, 2.5, 0);
    this.root.add(this.gasketGroup);
    this.registerPart(this.gasketGroup, new THREE.Vector3(0, 2.8, 0));

    this.lidGroup.position.set(0, 3.1, 0);
    this.root.add(this.lidGroup);
    this.registerPart(this.lidGroup, new THREE.Vector3(0, 4.4, 0));
  }

  // 3. Solar Photovoltaic Energy Harvester
  buildSolarPanel() {
    this.solarGroup = new THREE.Group();

    // Aluminum frame border
    const frameGeo = new THREE.BoxGeometry(10.8, 0.25, 7.4);
    const frameMesh = new THREE.Mesh(frameGeo, this.mat.aluminum);
    this.solarGroup.add(frameMesh);

    // Solar active wafer surface
    const cellGeo = new THREE.PlaneGeometry(10.4, 7.0);
    const cellMesh = new THREE.Mesh(cellGeo, this.mat.solarPanel);
    cellMesh.rotation.x = -Math.PI / 2;
    cellMesh.position.y = 0.14;
    this.solarGroup.add(cellMesh);

    // Protective glass clear specular sheen
    const glassGeo = new THREE.PlaneGeometry(10.4, 7.0);
    const glassMesh = new THREE.Mesh(glassGeo, this.mat.acrylicGlass);
    glassMesh.rotation.x = -Math.PI / 2;
    glassMesh.position.y = 0.15;
    this.solarGroup.add(glassMesh);

    this.solarGroup.position.set(0, 3.65, 0);
    this.root.add(this.solarGroup);
    this.registerPart(this.solarGroup, new THREE.Vector3(0, 6.2, 0));
  }

  // 4. Stainless Steel Corner Socket Screws (M4 Hex Bolts)
  buildCornerScrews() {
    this.screwsGroup = new THREE.Group();
    const screwPositions = [
      [-6.5, 0, -4.5],
      [6.5, 0, -4.5],
      [-6.5, 0, 4.5],
      [6.5, 0, 4.5]
    ];

    screwPositions.forEach(pos => {
      const sGroup = new THREE.Group();
      // Cap head
      const headGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.5, 16);
      const headMesh = new THREE.Mesh(headGeo, this.mat.stainless);
      sGroup.add(headMesh);

      // Allen hex drive socket
      const hexGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.2, 6);
      const hexMesh = new THREE.Mesh(hexGeo, this.mat.enclosureInner);
      hexMesh.position.y = 0.2;
      sGroup.add(hexMesh);

      // Threaded shaft
      const shaftGeo = new THREE.CylinderGeometry(0.25, 0.25, 3.0, 12);
      const shaftMesh = new THREE.Mesh(shaftGeo, this.mat.stainless);
      shaftMesh.position.y = -1.6;
      sGroup.add(shaftMesh);

      sGroup.position.set(...pos);
      this.screwsGroup.add(sGroup);
    });

    this.screwsGroup.position.set(0, 3.7, 0);
    this.root.add(this.screwsGroup);
    this.registerPart(this.screwsGroup, new THREE.Vector3(0, 8.5, 0));
  }

  // 5. High-Gain 4G / LoRa Dipole Whip Antenna & Gold SMA Bulkhead
  buildAntenna() {
    this.antennaGroup = new THREE.Group();

    // Gold brass SMA bulkhead barrel
    const smaGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.8, 6);
    const smaMesh = new THREE.Mesh(smaGeo, this.mat.brass);
    smaMesh.rotation.z = Math.PI / 2;
    smaMesh.position.set(7.2, 0.8, 2.5);
    this.antennaGroup.add(smaMesh);

    // Knurled antenna swivel base
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 16);
    const baseMesh = new THREE.Mesh(baseGeo, this.mat.antennaRubber);
    baseMesh.position.set(7.8, 1.2, 2.5);
    this.antennaGroup.add(baseMesh);

    // Antenna flexible mast
    const mastGeo = new THREE.CylinderGeometry(0.35, 0.48, 7.5, 16);
    const mastMesh = new THREE.Mesh(mastGeo, this.mat.antennaRubber);
    mastMesh.position.set(7.8, 5.0, 2.5);
    this.antennaGroup.add(mastMesh);

    // Top rounded tip
    const tipGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const tipMesh = new THREE.Mesh(tipGeo, this.mat.antennaRubber);
    tipMesh.position.set(7.8, 8.75, 2.5);
    this.antennaGroup.add(tipMesh);

    this.root.add(this.antennaGroup);
    this.registerPart(this.antennaGroup, new THREE.Vector3(4.0, 0, 0));
  }

  // 6. Industrial PG7 / M12 Weatherproof Cable Glands
  buildCableGlands() {
    this.glandsGroup = new THREE.Group();
    [-2.2, 2.2].forEach(x => {
      const gGroup = new THREE.Group();

      // Hexagonal locking nut
      const nutGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 6);
      const nutMesh = new THREE.Mesh(nutGeo, this.mat.cableGland);
      nutMesh.rotation.x = Math.PI / 2;
      gGroup.add(nutMesh);

      // Domed clamping nut with strain relief ribs
      const domeGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.9, 16);
      const domeMesh = new THREE.Mesh(domeGeo, this.mat.cableGland);
      domeMesh.position.z = 0.6;
      domeMesh.rotation.x = Math.PI / 2;
      gGroup.add(domeMesh);

      // Cable rubber stub
      const cableGeo = new THREE.CylinderGeometry(0.28, 0.28, 1.4, 12);
      const cableMesh = new THREE.Mesh(cableGeo, this.mat.antennaRubber);
      cableMesh.position.z = 1.4;
      cableMesh.rotation.x = Math.PI / 2;
      gGroup.add(cableMesh);

      gGroup.position.set(x, -2.6, 4.9);
      this.glandsGroup.add(gGroup);
    });

    this.root.add(this.glandsGroup);
    this.registerPart(this.glandsGroup, new THREE.Vector3(0, -2.5, 2.5));
  }

  // 7. Front Face OLED Display & Brand Label
  buildFrontDisplayAndBranding() {
    this.frontGroup = new THREE.Group();

    // OLED Display Bezel Window (Inset in front wall)
    const bezelGeo = new THREE.BoxGeometry(4.6, 2.8, 0.2);
    const bezelMesh = new THREE.Mesh(bezelGeo, this.mat.enclosureInner);
    bezelMesh.position.set(-2.8, 0.3, 5.05);
    this.frontGroup.add(bezelMesh);

    // Active OLED Screen Surface (Dynamic live telemetry texture)
    const screenGeo = new THREE.PlaneGeometry(4.2, 2.4);
    const screenMesh = new THREE.Mesh(screenGeo, this.mat.oledScreen);
    screenMesh.position.set(-2.8, 0.3, 5.16);
    this.frontGroup.add(screenMesh);

    // Protective Clear Acrylic Window Lens
    const lensGeo = new THREE.PlaneGeometry(4.4, 2.6);
    const lensMesh = new THREE.Mesh(lensGeo, this.mat.acrylicGlass);
    lensMesh.position.set(-2.8, 0.3, 5.18);
    this.frontGroup.add(lensMesh);

    // Brand & QR Code Decal Plate
    const brandGeo = new THREE.PlaneGeometry(3.6, 2.2);
    const brandMesh = new THREE.Mesh(brandGeo, this.mat.brandLabel);
    brandMesh.position.set(3.2, 0.3, 5.05);
    this.frontGroup.add(brandMesh);

    this.root.add(this.frontGroup);
    this.registerPart(this.frontGroup, new THREE.Vector3(0, 0, 3.5));
  }

  // 8. LiFePO4 / Li-Ion High-Capacity Power Battery Pack
  buildBatteryPack() {
    this.batteryGroup = new THREE.Group();

    // Dual cylindrical cells shrink-wrapped in blue PVC
    const batGeo = new THREE.BoxGeometry(8.2, 2.2, 3.6);
    const batMesh = new THREE.Mesh(batGeo, this.mat.battery);
    batMesh.castShadow = true;
    this.batteryGroup.add(batMesh);

    // Red Positive lead wire
    const redWireGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
    const redWire = new THREE.Mesh(redWireGeo, this.mat.wireRed);
    redWire.rotation.z = Math.PI / 3;
    redWire.position.set(3.8, 1.1, 0.5);
    this.batteryGroup.add(redWire);

    // Black Negative lead wire
    const blackWireGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
    const blackWire = new THREE.Mesh(blackWireGeo, this.mat.wireBlack);
    blackWire.rotation.z = Math.PI / 3;
    blackWire.position.set(3.8, 1.1, -0.5);
    this.batteryGroup.add(blackWire);

    // JST 2-pin connector housing
    const jstGeo = new THREE.BoxGeometry(0.5, 0.4, 0.6);
    const jstMesh = new THREE.Mesh(jstGeo, this.mat.stainless);
    jstMesh.position.set(4.8, 1.6, 0);
    this.batteryGroup.add(jstMesh);

    this.batteryGroup.position.set(0, -1.2, 0);
    this.root.add(this.batteryGroup);
    this.registerPart(this.batteryGroup, new THREE.Vector3(0, -3.2, 0));
  }

  // 9. Modular Electronics Stack (ESP32-S3, FRAM, MPPT, Sensor Interface)
  buildElectronicsStack() {
    this.electronicsStack = new THREE.Group();

    // Brass mounting standoffs (4x)
    const standoffPositions = [
      [-4.5, 0, -3.2],
      [4.5, 0, -3.2],
      [-4.5, 0, 3.2],
      [4.5, 0, 3.2]
    ];
    standoffPositions.forEach(p => {
      const sGeo = new THREE.CylinderGeometry(0.25, 0.25, 1.4, 6);
      const sMesh = new THREE.Mesh(sGeo, this.mat.brass);
      sMesh.position.set(p[0], -0.7, p[2]);
      this.electronicsStack.add(sMesh);
    });

    // Main Carrier Motherboard
    const mbGeo = new THREE.BoxGeometry(10.2, 0.16, 7.4);
    const mbMesh = new THREE.Mesh(mbGeo, this.mat.pcbBlack);
    mbMesh.castShadow = true;
    this.electronicsStack.add(mbMesh);

    // --- Sub-Module 1: ESP32-S3 Edge Controller Board ---
    this.espModule = new THREE.Group();
    const espPcbGeo = new THREE.BoxGeometry(3.6, 0.12, 4.4);
    const espPcb = new THREE.Mesh(espPcbGeo, this.mat.pcbBlack);
    this.espModule.add(espPcb);

    // Nickel RF Shield with laser engraving
    const rfGeo = new THREE.BoxGeometry(2.4, 0.35, 2.4);
    const rfMesh = new THREE.Mesh(rfGeo, this.mat.espShield);
    rfMesh.position.set(0, 0.22, -0.6);
    this.espModule.add(rfMesh);

    // USB-C Connector
    const usbcGeo = new THREE.BoxGeometry(1.0, 0.35, 0.8);
    const usbcMesh = new THREE.Mesh(usbcGeo, this.mat.stainless);
    usbcMesh.position.set(0, 0.22, 2.0);
    this.espModule.add(usbcMesh);

    // Reset & Boot tactile switches
    [-1.2, 1.2].forEach(x => {
      const btnGeo = new THREE.BoxGeometry(0.35, 0.2, 0.35);
      const btnMesh = new THREE.Mesh(btnGeo, this.mat.aluminum);
      btnMesh.position.set(x, 0.15, 1.4);
      this.espModule.add(btnMesh);
    });

    // RGB Status LED (Blinks dynamically)
    const ledGeo = new THREE.BoxGeometry(0.2, 0.15, 0.2);
    this.espLed = new THREE.Mesh(ledGeo, this.mat.ledGreen);
    this.espLed.position.set(1.2, 0.15, 0.6);
    this.espModule.add(this.espLed);

    this.espModule.position.set(-2.8, 0.15, -1.2);
    this.electronicsStack.add(this.espModule);

    // --- Sub-Module 2: Secure Element / FRAM Cryptographic Storage ---
    this.framModule = new THREE.Group();
    const framPcbGeo = new THREE.BoxGeometry(3.4, 0.12, 2.8);
    const framPcb = new THREE.Mesh(framPcbGeo, this.mat.pcbBlack);
    this.framModule.add(framPcb);

    // High-speed non-volatile FRAM chip (SOIC-8 package)
    const icGeo = new THREE.BoxGeometry(1.2, 0.25, 0.9);
    const icMesh = new THREE.Mesh(icGeo, this.mat.enclosureInner);
    icMesh.position.set(-0.6, 0.16, 0);
    this.framModule.add(icMesh);

    // Hardware Secure Element (QFN crypto chip for AES-256)
    const cryptoGeo = new THREE.BoxGeometry(0.9, 0.2, 0.9);
    const cryptoMesh = new THREE.Mesh(cryptoGeo, this.mat.enclosureInner);
    cryptoMesh.position.set(0.7, 0.15, 0);
    this.framModule.add(cryptoMesh);

    // Tamper micro-switch
    const tamperGeo = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const tamperMesh = new THREE.Mesh(tamperGeo, this.mat.aluminum);
    tamperMesh.position.set(0, 0.25, 0.9);
    this.framModule.add(tamperMesh);

    this.framModule.position.set(2.6, 0.15, -1.8);
    this.electronicsStack.add(this.framModule);

    // --- Sub-Module 3: MPPT Solar Power Management & Charging ---
    this.mpptModule = new THREE.Group();
    const mpptPcbGeo = new THREE.BoxGeometry(3.4, 0.12, 2.6);
    const mpptPcb = new THREE.Mesh(mpptPcbGeo, this.mat.pcbBlue);
    this.mpptModule.add(mpptPcb);

    // Toroidal Power Inductor (Coil)
    const torGeo = new THREE.TorusGeometry(0.55, 0.22, 12, 24);
    const torMesh = new THREE.Mesh(torGeo, this.mat.brass);
    torMesh.rotation.x = Math.PI / 2;
    torMesh.position.set(-0.6, 0.35, 0);
    this.mpptModule.add(torMesh);

    // Electrolytic filter capacitors
    [-0.3, 0.7].forEach(z => {
      const capGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.7, 16);
      const capMesh = new THREE.Mesh(capGeo, this.mat.aluminum);
      capMesh.position.set(0.8, 0.4, z);
      this.mpptModule.add(capMesh);
    });

    // Dual Charging Status LEDs
    const chgLedGeo = new THREE.BoxGeometry(0.18, 0.12, 0.18);
    const chgLed1 = new THREE.Mesh(chgLedGeo, this.mat.ledAmber); // Charging
    chgLed1.position.set(-1.1, 0.14, 0.8);
    this.mpptModule.add(chgLed1);

    const chgLed2 = new THREE.Mesh(chgLedGeo, this.mat.ledGreen); // Full
    chgLed2.position.set(-0.7, 0.14, 0.8);
    this.mpptModule.add(chgLed2);

    this.mpptModule.position.set(2.6, 0.15, 1.6);
    this.electronicsStack.add(this.mpptModule);

    // --- Sub-Module 4: Sensor Interface Board (I2C/UART/JST) ---
    this.sensorIface = new THREE.Group();
    const ifacePcbGeo = new THREE.BoxGeometry(3.6, 0.12, 2.0);
    const ifacePcb = new THREE.Mesh(ifacePcbGeo, this.mat.pcbBlue);
    this.sensorIface.add(ifacePcb);

    // Screw terminal block for external wired probes
    const termGeo = new THREE.BoxGeometry(2.4, 0.65, 0.7);
    const termMesh = new THREE.Mesh(termGeo, this.mat.pcbGreen);
    termMesh.position.set(0, 0.35, -0.4);
    this.sensorIface.add(termMesh);

    // JST sensor headers
    [-1.0, 0, 1.0].forEach(x => {
      const jGeo = new THREE.BoxGeometry(0.4, 0.35, 0.4);
      const jMesh = new THREE.Mesh(jGeo, this.mat.stainless);
      jMesh.position.set(x, 0.22, 0.5);
      this.sensorIface.add(jMesh);
    });

    this.sensorIface.position.set(-2.8, 0.15, 2.2);
    this.electronicsStack.add(this.sensorIface);

    this.electronicsStack.position.set(0, 0.8, 0);
    this.root.add(this.electronicsStack);
    this.registerPart(this.electronicsStack, new THREE.Vector3(0, 1.6, 0));
  }

  // 10. Sensor Suite Breakdown (SHT31, MQ-138 Ethylene, MPU6050, NEO-6M GPS)
  buildSensorSuite() {
    this.sensorSuiteGroup = new THREE.Group();

    // 1. SHT31 / BME280 Temperature & Humidity Module
    this.shtSensor = new THREE.Group();
    const shtPcb = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.2), this.mat.pcbBlue);
    this.shtSensor.add(shtPcb);
    // Sensor package with white PTFE filter membrane
    const shtChip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.5), this.mat.enclosure);
    shtChip.position.y = 0.1;
    this.shtSensor.add(shtChip);
    this.shtSensor.position.set(-9.5, 2.0, -3.5);
    this.sensorSuiteGroup.add(this.shtSensor);

    // 2. MQ-138 Ethylene Gas Sensor (Cylindrical metal mesh dome)
    this.mqSensor = new THREE.Group();
    const mqBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.4, 24), this.mat.enclosureInner);
    this.mqSensor.add(mqBase);
    // Stainless wire mesh dome
    const mqMeshDome = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.0, 24), this.mat.gasSensorMesh);
    mqMeshDome.position.y = 0.65;
    this.mqSensor.add(mqMeshDome);
    const mqDomeTop = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), this.mat.gasSensorMesh);
    mqDomeTop.position.y = 1.15;
    this.mqSensor.add(mqDomeTop);
    this.mqSensor.position.set(-9.5, 2.0, 2.0);
    this.sensorSuiteGroup.add(this.mqSensor);

    // 3. MPU6050 3-Axis IMU (Vibration & Shock detection)
    this.mpuSensor = new THREE.Group();
    const mpuPcb = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.4), this.mat.pcbBlue);
    this.mpuSensor.add(mpuPcb);
    const mpuChip = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.6), this.mat.pcbBlack);
    mpuChip.position.y = 0.08;
    this.mpuSensor.add(mpuChip);
    this.mpuSensor.position.set(-9.5, -0.8, -3.5);
    this.sensorSuiteGroup.add(this.mpuSensor);

    // 4. NEO-6M GPS Module (Ceramic patch antenna)
    this.gpsSensor = new THREE.Group();
    // Square ceramic patch antenna
    const patchMesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 1.8), this.mat.gpsCeramic);
    this.gpsSensor.add(patchMesh);
    // Center feed pin
    const pinMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8), this.mat.stainless);
    pinMesh.position.y = 0.05;
    this.gpsSensor.add(pinMesh);
    // Gold ground plane base
    const gndMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.06, 2.0), this.mat.gold);
    gndMesh.position.y = -0.25;
    this.gpsSensor.add(gndMesh);
    this.gpsSensor.position.set(-9.5, -0.8, 2.0);
    this.sensorSuiteGroup.add(this.gpsSensor);

    this.root.add(this.sensorSuiteGroup);
    this.registerPart(this.sensorSuiteGroup, new THREE.Vector3(-3.0, 0, 0));
  }

  // Hotspots definitions with 3D anchors and specifications matching user's design
  initHotspotData() {
    this.hotspots = [
      {
        id: 1,
        title: "Energy Harvesting Solar Panel",
        category: "Power Subsystem",
        partNumber: "SOL-5V-350MA-ETFE",
        pos: new THREE.Vector3(0, 3.8, 0),
        desc: "High-efficiency monocrystalline photovoltaic panel with anti-soiling ETFE coating. Keeps internal battery charged continuously under direct/ambient sunlight in outdoor transit.",
        specs: {
          "Peak Power": "1.75 Watts",
          "Open Circuit Voc": "5.8V",
          "Opt. Current Isc": "320mA",
          "Efficiency": "22.4%",
          "Weather Rating": "UV / Salt Spray Resistant"
        },
        bullets: [
          "Eliminates manual battery swaps across multi-week reefer shipping.",
          "Coupled to onboard MPPT buck-boost charging controller.",
          "Protective acrylic glass and flush gasket seal prevent water ingress."
        ]
      },
      {
        id: 2,
        title: "Live OLED Telemetry Display",
        category: "HMI & Status Interface",
        partNumber: "OLED-12864-SSD1306",
        pos: new THREE.Vector3(-2.8, 0.3, 5.2),
        desc: "High-contrast dual-color 0.96-inch OLED screen displaying immediate status for logistics operators: real-time temperature, humidity, ethylene ppm, and blockchain sync state.",
        specs: {
          "Resolution": "128 x 64 pixels",
          "Panel Type": "Dual-Color OLED (Amber/Cyan)",
          "Viewing Angle": "160° Wide Angle",
          "Refresh Rate": "10 Hz Live Telemetry",
          "Power Draw": "< 25mW in active mode"
        },
        bullets: [
          "Instant go/no-go visual validation without needing a smartphone app.",
          "Shows battery state, cellular signal bars, and cryptographic hash verification.",
          "Protected by 2mm optical-grade impact-resistant clear polycarbonate window."
        ]
      },
      {
        id: 3,
        title: "ESP32-S3 Edge IoT Controller",
        category: "Edge Compute & Logic",
        partNumber: "ESP32-S3-WROOM-1",
        pos: new THREE.Vector3(-2.8, 0.9, -1.2),
        desc: "Dual-core Xtensa 32-bit LX7 processor running at 240MHz with vector instructions for AI anomaly detection, deep-sleep power management, and local sensor aggregation.",
        specs: {
          "CPU": "Dual-Core Xtensa LX7 @ 240MHz",
          "SRAM": "512 KB Internal + 8MB PSRAM",
          "Flash": "8MB Encrypted Flash",
          "Deep Sleep": "14 µA Ultralow Power",
          "Crypto": "Hardware AES-XTS, SHA-256, RSA"
        },
        bullets: [
          "Runs offline-first event detection and threshold violation triggers.",
          "Integrated Wi-Fi 802.11 b/g/n and Bluetooth 5.0 (LE / Mesh) gateway support.",
          "Manages dynamic duty-cycling to achieve up to 3 years continuous autonomy."
        ]
      },
      {
        id: 4,
        title: "Secure Element & Non-Volatile FRAM",
        category: "Cryptographic Storage",
        partNumber: "FM24V10 / ATECC608A",
        pos: new THREE.Vector3(2.6, 0.9, -1.8),
        desc: "Industrial-grade Ferroelectric RAM (FRAM) offering virtually infinite write endurance (10^14 cycles) paired with a hardware cryptographic secure element for tamper-evident data logging.",
        specs: {
          "Storage Type": "1Mbit Non-Volatile FRAM",
          "Write Endurance": "100 Trillion Cycles",
          "Write Speed": "Instantaneous (No flash delay)",
          "Security Chip": "Microchip ATECC608 Hardware Root",
          "Encryption": "AES-256 & ECDSA sign/verify"
        },
        bullets: [
          "Guarantees sensor telemetry is retained even during sudden power cutoffs.",
          "Cryptographically signs each batch of temperature records before syncing to ledger.",
          "Integrated hardware tamper-switch zeros keys if the enclosure is breached."
        ]
      },
      {
        id: 5,
        title: "MPPT Solar Power Management",
        category: "Energy Management",
        partNumber: "BQ25798 / SPV1040",
        pos: new THREE.Vector3(2.6, 0.9, 1.6),
        desc: "Synchronous switch-mode buck-boost charger with Maximum Power Point Tracking (MPPT). Maximizes energy extraction from the solar panel even in low-light and cloudy environments.",
        specs: {
          "Tracking": "True MPPT Dynamic Perturb-Observe",
          "Efficiency": "Up to 96.5% Conversion",
          "Battery Types": "LiFePO4 (3.2V) & Li-Ion (3.7V)",
          "Charging Current": "Up to 1.5A Programmable",
          "Protections": "OVP, UVLO, Thermal Foldback"
        },
        bullets: [
          "Seamless power-path management seamlessly switches between solar and battery.",
          "Cold-temperature battery charging protection prevents lithium plating below 0°C.",
          "Dual SMD status LEDs provide instant visual diagnostics on charge state."
        ]
      },
      {
        id: 6,
        title: "LiFePO4 Rugged Battery Pack",
        category: "Energy Storage",
        partNumber: "LFP-18650-2P-6000",
        pos: new THREE.Vector3(0, -1.2, 0),
        desc: "Lithium Iron Phosphate (LiFePO4) battery pack optimized specifically for cold-chain transport conditions (-20°C to +60°C) with superior thermal stability over standard Li-Ion.",
        specs: {
          "Nominal Voltage": "3.2V (3.65V Max Charge)",
          "Capacity": "6000 mAh (19.2 Wh)",
          "Cycle Life": "> 3000 Cycles @ 80% DoD",
          "Operating Temp": "-25°C to +65°C",
          "Safety": "Zero risk of thermal runaway"
        },
        bullets: [
          "Retains 80% discharge capacity even inside sub-zero reefer cargo freezers.",
          "Integrated PCM protects against overcharge, overdischarge, and short-circuit.",
          "Heavy blue flame-retardant PVC wrap with vibration-dampening foam cushions."
        ]
      },
      {
        id: 7,
        title: "4G / LTE-M & LoRa Long-Range Antenna",
        category: "Connectivity Subsystem",
        partNumber: "ANT-LORA-4G-SMA",
        pos: new THREE.Vector3(7.8, 3.5, 2.5),
        desc: "High-gain external rubber duck dipole antenna mounted via a waterproof gold-plated brass SMA bulkhead connector. Supports dual-mode cellular and long-range LoRaWAN mesh communication.",
        specs: {
          "Frequencies": "LTE-M (B1-B28) / LoRa (868/915 MHz)",
          "Peak Gain": "3.2 dBi Omni-directional",
          "VSWR": "< 1.8:1 Across Band",
          "Impedance": "50 Ohm Gold-Plated SMA",
          "Mounting": "Right-Angle 360° Swivel Joint"
        },
        bullets: [
          "Ensures reliable cellular connectivity even when enclosed in metal container trucks.",
          "Automatic store-and-forward buffers all data in FRAM when traversing remote blindspots.",
          "Direct MQTT telemetry push upon network reconnection to blockchain gateway."
        ]
      },
      {
        id: 8,
        title: "Rugged IP67 Weatherproof Enclosure",
        category: "Mechanical Packaging",
        partNumber: "ENC-IP67-160X120X90",
        pos: new THREE.Vector3(5.5, -1.0, -3.5),
        desc: "Heavy-duty impact-resistant polycarbonate enclosure with molded silicone gasket and stainless steel hex bolts, built to withstand vibration, dust, and continuous water jets.",
        specs: {
          "Ingress Rating": "IP67 (Submersible 1m for 30m)",
          "Impact Rating": "IK08 High Impact Strength",
          "Dimensions": "160mm x 120mm x 90mm",
          "Hardware": "M4 316 Stainless Steel Hex Bolts",
          "Flammability": "UL94-V0 Self-Extinguishing"
        },
        bullets: [
          "Dual bottom M12/PG7 cable glands for external digital probes and power lines.",
          "Side mounting ears for quick zip-tie or bolt mounting on refrigerated pallets.",
          "UV-stabilized resin prevents discoloration and embrittlement during outdoor exposure."
        ]
      },
      {
        id: 9,
        title: "Precision Multi-Sensor Suite",
        category: "Environmental Sensing",
        partNumber: "SHT31 / MQ-138 / MPU6050 / NEO-6M",
        pos: new THREE.Vector3(-9.5, 1.0, 0),
        desc: "Comprehensive 4-in-1 multi-parameter sensor array capturing ambient temperature, relative humidity, ethylene ripening gas, 3-axis transport shocks, and GPS fleet coordinates.",
        specs: {
          "Temperature": "±0.2°C Precision (-40°C to +125°C)",
          "Humidity": "±2% RH (0 to 100% Non-condensing)",
          "Ethylene Gas": "MQ-138 (5 - 500 ppm C2H4)",
          "IMU / Shock": "MPU6050 3-Axis ±16g Impact Detection",
          "GNSS / GPS": "NEO-6M 50-Channel Fleet Tracking"
        },
        bullets: [
          "Early Ethylene (C2H4) detection detects premature fruit/vegetable ripening in transit.",
          "3-Axis accelerometer flags cargo drops, rough handling, and vehicle accidents.",
          "Precision SHT31 sensor complies with WHO & FDA 21 CFR Part 11 cold-chain mandates."
        ]
      }
    ];
  }

  // Update exploded view translation based on a 0.0 - 1.0 factor
  setExplodeFactor(factor) {
    this.animatableParts.forEach(p => {
      p.obj.position.x = p.basePos.x + p.explodeOffset.x * factor;
      p.obj.position.y = p.basePos.y + p.explodeOffset.y * factor;
      p.obj.position.z = p.basePos.z + p.explodeOffset.z * factor;
    });
  }

  update(delta) {
    // Pulse ESP32-S3 status LED
    if (this.espLed) {
      const pulse = (Math.sin(Date.now() * 0.006) + 1) * 0.5;
      this.espLed.material.color.setRGB(0, pulse, pulse * 0.6);
    }
  }
}
