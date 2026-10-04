// Materials & Textures System for 3D ColdChain IoT Showcase
class MaterialLibrary {
  constructor(telemetryEngine) {
    this.telemetry = telemetryEngine;
    this.textures = {};
    this.materials = {};

    this.initProceduralTextures();
    this.initMaterials();
  }

  initProceduralTextures() {
    // 1. Solar Photovoltaic Cell Grid Texture
    const solarCanvas = document.createElement('canvas');
    solarCanvas.width = 512;
    solarCanvas.height = 512;
    const sCtx = solarCanvas.getContext('2d');

    // Deep monocrystalline silicon navy/black
    sCtx.fillStyle = '#0b1626';
    sCtx.fillRect(0, 0, 512, 512);

    // Solar cells (4x3 grid)
    const cols = 4;
    const rows = 3;
    const pad = 6;
    const cw = (512 - pad * (cols + 1)) / cols;
    const ch = (512 - pad * (rows + 1)) / rows;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = pad + c * (cw + pad);
        const y = pad + r * (ch + pad);

        // Cell wafer with subtle corner chamfers
        sCtx.fillStyle = '#10223d';
        sCtx.beginPath();
        const cr = 8;
        sCtx.moveTo(x + cr, y);
        sCtx.lineTo(x + cw - cr, y);
        sCtx.lineTo(x + cw, y + cr);
        sCtx.lineTo(x + cw, y + ch - cr);
        sCtx.lineTo(x + cw - cr, y + ch);
        sCtx.lineTo(x + cr, y + ch);
        sCtx.lineTo(x, y + ch - cr);
        sCtx.lineTo(x, y + cr);
        sCtx.closePath();
        sCtx.fill();

        // Silver busbars (vertical thick traces)
        sCtx.fillStyle = 'rgba(220, 235, 255, 0.85)';
        sCtx.fillRect(x + cw * 0.33 - 1.5, y, 3, ch);
        sCtx.fillRect(x + cw * 0.66 - 1.5, y, 3, ch);

        // Thin grid fingers (horizontal micro traces)
        sCtx.fillStyle = 'rgba(180, 210, 240, 0.4)';
        for (let fy = y + 4; fy < y + ch; fy += 5) {
          sCtx.fillRect(x + 2, fy, cw - 4, 1);
        }
      }
    }
    this.textures.solar = new THREE.CanvasTexture(solarCanvas);

    // 2. Battery Label Texture
    const batCanvas = document.createElement('canvas');
    batCanvas.width = 512;
    batCanvas.height = 256;
    const bCtx = batCanvas.getContext('2d');
    bCtx.fillStyle = '#1d4ed8'; // Industrial blue PVC wrap
    bCtx.fillRect(0, 0, 512, 256);

    // White label box
    bCtx.fillStyle = '#ffffff';
    bCtx.fillRect(20, 30, 472, 196);

    bCtx.fillStyle = '#0f172a';
    bCtx.font = 'bold 24px "JetBrains Mono", sans-serif';
    bCtx.fillText('COLD-CHAIN POWER CELL', 40, 70);

    bCtx.font = '18px "JetBrains Mono", sans-serif';
    bCtx.fillStyle = '#334155';
    bCtx.fillText('Chemistry: LiFePO4 (Phosphate)', 40, 105);
    bCtx.fillText('Nominal Voltage: 3.2V | 6000mAh (19.2Wh)', 40, 135);
    bCtx.fillText('Temp Range: -30°C to +65°C | Ruggedized', 40, 165);
    bCtx.fillText('Integrated PCM / Over-Discharge Protection', 40, 195);

    // Hazard warning & CE badge
    bCtx.fillStyle = '#dc2626';
    bCtx.fillRect(410, 48, 60, 24);
    bCtx.fillStyle = '#fff';
    bCtx.font = 'bold 12px sans-serif';
    bCtx.fillText('CAUTION', 416, 64);

    this.textures.battery = new THREE.CanvasTexture(batCanvas);

    // 3. ESP32-S3 Laser Etched Metal Can Texture
    const rfCanvas = document.createElement('canvas');
    rfCanvas.width = 256;
    rfCanvas.height = 256;
    const rfCtx = rfCanvas.getContext('2d');
    rfCtx.fillStyle = '#d1d5db';
    rfCtx.fillRect(0, 0, 256, 256);

    rfCtx.fillStyle = '#4b5563';
    rfCtx.font = 'bold 22px monospace';
    rfCtx.fillText('ESPRESSIF', 24, 45);
    rfCtx.font = 'bold 28px monospace';
    rfCtx.fillText('ESP32-S3', 24, 85);
    rfCtx.font = '16px monospace';
    rfCtx.fillText('WROOM-1-N8R8', 24, 115);
    rfCtx.fillText('FCC ID: 2AC7Z-ESPS3', 24, 145);
    rfCtx.fillText('CE 2.4GHz Wi-Fi / BLE 5', 24, 175);
    rfCtx.fillText('Xtensa LX7 Dual-Core 240MHz', 24, 205);
    this.textures.espShield = new THREE.CanvasTexture(rfCanvas);

    // 4. Enclosure Front Branding Label (ColdChain IoT + QR Code)
    const brandCanvas = document.createElement('canvas');
    brandCanvas.width = 256;
    brandCanvas.height = 128;
    const brCtx = brandCanvas.getContext('2d');
    brCtx.fillStyle = '#e2e8f0';
    brCtx.fillRect(0, 0, 256, 128);

    // Leaf icon + ColdChain IoT
    brCtx.fillStyle = '#16a34a';
    brCtx.beginPath();
    brCtx.arc(36, 42, 14, 0, Math.PI * 2);
    brCtx.fill();

    brCtx.fillStyle = '#0f172a';
    brCtx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    brCtx.fillText('ColdChain', 60, 40);
    brCtx.fillStyle = '#0284c7';
    brCtx.fillText('IoT', 165, 40);

    // Subtext
    brCtx.font = 'bold 11px "JetBrains Mono", monospace';
    brCtx.fillStyle = '#475569';
    brCtx.fillText('IP67 SECURE NODE', 60, 58);
    brCtx.fillText('BLOCKCHAIN READY', 60, 72);

    // Simulated QR Code
    brCtx.fillStyle = '#000000';
    const qrX = 188, qrY = 48, qs = 48;
    brCtx.fillRect(qrX, qrY, qs, qs);
    brCtx.fillStyle = '#ffffff';
    brCtx.fillRect(qrX + 4, qrY + 4, 14, 14);
    brCtx.fillRect(qrX + qs - 18, qrY + 4, 14, 14);
    brCtx.fillRect(qrX + 4, qrY + qs - 18, 14, 14);
    brCtx.fillStyle = '#000000';
    brCtx.fillRect(qrX + 8, qrY + 8, 6, 6);
    brCtx.fillRect(qrX + qs - 14, qrY + 8, 6, 6);
    brCtx.fillRect(qrX + 8, qrY + qs - 14, 6, 6);
    this.textures.brandLabel = new THREE.CanvasTexture(brandCanvas);
  }

  initMaterials() {
    // Industrial Grey Enclosure Plastic (IP67 Body & Lid)
    this.materials.enclosure = new THREE.MeshStandardMaterial({
      color: 0xc8ccd4,
      roughness: 0.52,
      metalness: 0.12,
      name: 'enclosure_body'
    });

    // Darker inner cavity / mounting base
    this.materials.enclosureInner = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.65,
      metalness: 0.1
    });

    // Neoprene/Silicone Weatherproof Sealing Gasket (Black rubber)
    this.materials.gasket = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.85,
      metalness: 0.05
    });

    // Stainless Steel Hex Screws & Hardware
    this.materials.stainless = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      roughness: 0.22,
      metalness: 0.88
    });

    // Brass Standoffs & Connectors
    this.materials.brass = new THREE.MeshStandardMaterial({
      color: 0xcca43b,
      roughness: 0.32,
      metalness: 0.82
    });

    // Solar Panel Photovoltaic Material
    this.materials.solarPanel = new THREE.MeshStandardMaterial({
      map: this.textures.solar,
      roughness: 0.18,
      metalness: 0.35,
      color: 0xffffff
    });

    // Solar Beveled Frame (Anodized Aluminum)
    this.materials.aluminum = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35,
      metalness: 0.75
    });

    // Front Brand Label Decal
    this.materials.brandLabel = new THREE.MeshStandardMaterial({
      map: this.textures.brandLabel,
      roughness: 0.4,
      metalness: 0.1
    });

    // OLED Screen Face (Driven by Dynamic Telemetry Canvas)
    this.materials.oledScreen = new THREE.MeshBasicMaterial({
      map: this.telemetry.texture
    });

    // OLED Protective Acrylic Window Lens
    this.materials.acrylicGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.38,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.49
    });

    // Cable Glands (Industrial Black Nylon/Polyamide)
    this.materials.cableGland = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.15
    });

    // Antenna Rubber Overmold
    this.materials.antennaRubber = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.78,
      metalness: 0.08
    });

    // LiFePO4 Battery Pack
    this.materials.battery = new THREE.MeshStandardMaterial({
      map: this.textures.battery,
      roughness: 0.38,
      metalness: 0.05
    });

    // Main Carrier PCB (Matte Black Solder Mask)
    this.materials.pcbBlack = new THREE.MeshStandardMaterial({
      color: 0x111822,
      roughness: 0.45,
      metalness: 0.25
    });

    // Modular Sensor PCBs (Classic Blue FR4)
    this.materials.pcbBlue = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.4,
      metalness: 0.2
    });

    // Modular Controller PCB (Deep Green FR4)
    this.materials.pcbGreen = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.4,
      metalness: 0.2
    });

    // Gold ENIG Contacts & Pin Headers
    this.materials.gold = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.25,
      metalness: 0.95
    });

    // ESP32-S3 RF Metal Shield
    this.materials.espShield = new THREE.MeshStandardMaterial({
      map: this.textures.espShield,
      roughness: 0.3,
      metalness: 0.8
    });

    // MQ-138 Gas Sensor Mesh Dome
    this.materials.gasSensorMesh = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.35,
      metalness: 0.9,
      wireframe: false
    });

    // Ceramic GPS Patch Antenna
    this.materials.gpsCeramic = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.7,
      metalness: 0.15
    });

    // Glowing Status LEDs
    this.materials.ledGreen = new THREE.MeshBasicMaterial({ color: 0x00ff9d });
    this.materials.ledRed = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    this.materials.ledAmber = new THREE.MeshBasicMaterial({ color: 0xffb700 });
    this.materials.ledBlue = new THREE.MeshBasicMaterial({ color: 0x00f0ff });

    // Wires (Red + Black silicone)
    this.materials.wireRed = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    this.materials.wireBlack = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  }

  // Switch display styling between Realistic, X-Ray, and CAD Blueprint
  setRenderMode(mode) {
    if (mode === 'xray') {
      this.materials.enclosure.transparent = true;
      this.materials.enclosure.opacity = 0.22;
      this.materials.enclosure.roughness = 0.1;
      this.materials.enclosure.metalness = 0.1;
      this.materials.enclosure.color.setHex(0x00f0ff);
      this.materials.enclosure.wireframe = false;

      this.materials.enclosureInner.transparent = true;
      this.materials.enclosureInner.opacity = 0.15;
    } else if (mode === 'cad') {
      this.materials.enclosure.transparent = true;
      this.materials.enclosure.opacity = 0.7;
      this.materials.enclosure.wireframe = true;
      this.materials.enclosure.color.setHex(0x00f0ff);

      this.materials.enclosureInner.transparent = true;
      this.materials.enclosureInner.opacity = 0.5;
      this.materials.enclosureInner.wireframe = true;
    } else {
      // Realistic default
      this.materials.enclosure.transparent = false;
      this.materials.enclosure.opacity = 1.0;
      this.materials.enclosure.roughness = 0.52;
      this.materials.enclosure.metalness = 0.12;
      this.materials.enclosure.color.setHex(0xc8ccd4);
      this.materials.enclosure.wireframe = false;

      this.materials.enclosureInner.transparent = false;
      this.materials.enclosureInner.opacity = 1.0;
      this.materials.enclosureInner.wireframe = false;
    }

    this.materials.enclosure.needsUpdate = true;
    this.materials.enclosureInner.needsUpdate = true;
  }
}
