// Dynamic Telemetry & OLED Display Simulation Engine
class ColdChainTelemetry {
  constructor() {
    this.temp = 4.2;
    this.humidity = 58.3;
    this.ethylene = 12;
    this.vibration = 0.02;
    this.battery = 82;
    this.solarPower = 240; // mW
    this.signalDbm = -76;
    this.isCharging = true;
    this.gpsLat = 18.7625;
    this.gpsLng = 73.9812;
    this.tamperStatus = 'SECURE';
    this.blockchainBlock = 84920;
    this.currentHash = '0x8F4A..7C9B';

    // OLED Canvas Texture Generator
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 256;
    this.ctx = this.canvas.getContext('2d');
    
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    this.listeners = [];
    this.lastTick = Date.now();
    this.heartbeat = true;

    this.renderOLED();
    this.startSimulation();
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    const data = this.getData();
    this.listeners.forEach(cb => cb(data));
  }

  getData() {
    return {
      temp: this.temp.toFixed(1),
      humidity: this.humidity.toFixed(1),
      ethylene: this.ethylene.toFixed(0),
      vibration: this.vibration.toFixed(2),
      battery: Math.round(this.battery),
      solarPower: Math.round(this.solarPower),
      signalDbm: this.signalDbm,
      isCharging: this.isCharging,
      gps: `${this.gpsLat.toFixed(4)}°N, ${this.gpsLng.toFixed(4)}°E`,
      tamper: this.tamperStatus,
      block: this.blockchainBlock,
      hash: this.currentHash
    };
  }

  startSimulation() {
    setInterval(() => {
      // Natural micro fluctuations
      this.temp += (Math.random() - 0.49) * 0.08;
      this.temp = Math.max(3.8, Math.min(4.8, this.temp));

      this.humidity += (Math.random() - 0.5) * 0.2;
      this.humidity = Math.max(55.0, Math.min(62.0, this.humidity));

      if (Math.random() > 0.7) {
        this.ethylene = Math.round(11 + Math.random() * 2);
      }

      this.vibration = 0.01 + Math.random() * 0.03;
      
      // Solar charging simulation
      this.solarPower = 230 + Math.sin(Date.now() * 0.001) * 25;

      this.heartbeat = !this.heartbeat;

      if (Math.random() > 0.85) {
        this.blockchainBlock++;
        const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
        this.currentHash = `0x${hex.slice(0, 4)}..${hex.slice(4)}`;
      }

      this.renderOLED();
      this.texture.needsUpdate = true;
      this.notify();
    }, 1000);
  }

  renderOLED() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // True OLED Deep Black
    ctx.fillStyle = '#010307';
    ctx.fillRect(0, 0, w, h);

    // Subtle pixel grid / screen scanline effect
    ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }

    // Top Header Bar (Yellow/Amber OLED color like SSD1306 dual-color display)
    ctx.fillStyle = '#ffb700';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText('COLDCHAIN-IOT', 24, 38);

    // Heartbeat indicator
    ctx.beginPath();
    ctx.arc(240, 30, 6, 0, Math.PI * 2);
    ctx.fillStyle = this.heartbeat ? '#00ff9d' : 'rgba(0, 255, 157, 0.2)';
    ctx.fill();

    // Signal bars
    ctx.fillStyle = '#ffb700';
    for (let i = 0; i < 4; i++) {
      const bh = (i + 1) * 5;
      ctx.fillRect(400 + i * 8, 38 - bh, 5, bh);
    }

    // Battery outline & fill
    ctx.strokeStyle = '#ffb700';
    ctx.lineWidth = 2;
    ctx.strokeRect(440, 20, 44, 20);
    ctx.fillRect(484, 26, 4, 8); // terminal nub
    ctx.fillStyle = '#ffb700';
    const batW = (this.battery / 100) * 38;
    ctx.fillRect(443, 23, batW, 14);

    // Thin separator rule
    ctx.strokeStyle = 'rgba(255, 183, 0, 0.4)';
    ctx.beginPath();
    ctx.moveTo(20, 52);
    ctx.lineTo(w - 20, 52);
    ctx.stroke();

    // Main Telemetry Area (Bright Electric Blue/Cyan OLED)
    ctx.fillStyle = '#00f0ff';

    // Temperature (Highlighted large)
    ctx.font = 'bold 36px "JetBrains Mono", monospace';
    ctx.fillText(`TEMP: ${this.temp.toFixed(1)} °C`, 24, 102);

    // Status pill
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00ff9d';
    ctx.fillText('[OPTIMAL 2-8°C]', 320, 100);

    // Humidity
    ctx.fillStyle = '#00f0ff';
    ctx.font = '28px "JetBrains Mono", monospace';
    ctx.fillText(`HUM:  ${this.humidity.toFixed(1)} %`, 24, 148);

    // Ethylene gas (C2H4)
    ctx.font = '28px "JetBrains Mono", monospace';
    ctx.fillText(`C₂H₄: ${this.ethylene} ppm`, 24, 192);

    // Safe threshold indicator for Ethylene
    ctx.font = '18px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ffb700';
    ctx.fillText('PASS', 240, 190);

    // Bottom Status Strip
    ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.font = '18px "JetBrains Mono", monospace';
    ctx.fillText(`BLK #${this.blockchainBlock} | HASH: ${this.currentHash}`, 24, 234);

    // Solar icon indicator
    ctx.fillStyle = '#ffb700';
    ctx.font = '16px "JetBrains Mono", monospace';
    ctx.fillText(`SOLAR: ${Math.round(this.solarPower)}mW`, 370, 234);
  }
}
