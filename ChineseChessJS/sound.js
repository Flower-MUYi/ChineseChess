class SoundEffects {
  constructor() {
    this.ctx = null;
    this.masterOut = null;
    this.dryBus = null;
    this.reverbSend = null;
    this.convolver = null;
    this.distortionCurve = null;
    this.enabled = true;
    this._vfxNodes = new Set();
    this._vfxTimers = new Set();
    this._noiseCache = new Map();
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // 1. 高通滤波滤除超低频直流杂音 (< 26Hz)
        const hpFilter = this.ctx.createBiquadFilter();
        hpFilter.type = 'highpass';
        hpFilter.frequency.setValueAtTime(26, this.ctx.currentTime);
        hpFilter.Q.setValueAtTime(0.7, this.ctx.currentTime);

        // 2. 温暖高频柔化滤波 (> 10500Hz)，彻底消除刺耳数码毛刺感
        const warmthFilter = this.ctx.createBiquadFilter();
        warmthFilter.type = 'lowpass';
        warmthFilter.frequency.setValueAtTime(10500, this.ctx.currentTime);
        warmthFilter.Q.setValueAtTime(0.65, this.ctx.currentTime);

        // 3. 母线动态压缩限制器，确保大动态爆炸浑厚不爆音
        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-10, this.ctx.currentTime);
        comp.knee.setValueAtTime(12, this.ctx.currentTime);
        comp.ratio.setValueAtTime(3.8, this.ctx.currentTime);
        comp.attack.setValueAtTime(0.005, this.ctx.currentTime);
        comp.release.setValueAtTime(0.14, this.ctx.currentTime);

        const makeup = this.ctx.createGain();
        makeup.gain.setValueAtTime(1.18, this.ctx.currentTime);

        hpFilter.connect(warmthFilter);
        warmthFilter.connect(comp);
        comp.connect(makeup);
        makeup.connect(this.ctx.destination);

        this.masterOut = hpFilter;
        this.dryBus = hpFilter;

        // 4. 古典厅堂立体声脉冲混响总线，赋予木石棋盘与古战场恢弘空间感
        try {
          this.convolver = this.ctx.createConvolver();
          this.convolver.buffer = this.createHallReverbImpulse(1.25, 2.4);
          this.reverbSend = this.ctx.createGain();
          this.reverbSend.gain.setValueAtTime(0.20, this.ctx.currentTime);
          this.reverbSend.connect(this.convolver);
          this.convolver.connect(hpFilter);
        } catch (_) {
          this.reverbSend = null;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  out() {
    return this.masterOut || (this.ctx ? this.ctx.destination : null);
  }

  connectWithSpace(node, wetLevel = 0.18, pan = 0) {
    if (!this.ctx || !node) return;
    const dest = this.out();
    let target = node;
    if (pan !== 0 && typeof this.ctx.createStereoPanner === 'function') {
      const panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), this.ctx.currentTime);
      node.connect(panner);
      target = panner;
    }
    target.connect(dest);
    if (this.reverbSend && wetLevel > 0.01) {
      const wetGain = this.ctx.createGain();
      wetGain.gain.setValueAtTime(wetLevel, this.ctx.currentTime);
      target.connect(wetGain);
      wetGain.connect(this.reverbSend);
    }
  }

  trackVFXSource(src) {
    if (!src) return src;
    this._vfxNodes.add(src);
    src.onended = () => {
      this._vfxNodes.delete(src);
    };
    return src;
  }

  scheduleVFXTimer(fn, delayMs) {
    if (!this.enabled) return null;
    const id = setTimeout(() => {
      this._vfxTimers.delete(id);
      if (this.enabled) fn();
    }, Math.max(0, delayMs));
    this._vfxTimers.add(id);
    return id;
  }

  stopAllVFXSounds() {
    for (const id of this._vfxTimers) {
      clearTimeout(id);
    }
    this._vfxTimers.clear();
    for (const src of this._vfxNodes) {
      try {
        src.stop();
        src.disconnect();
      } catch (_) {}
    }
    this._vfxNodes.clear();
  }

  createHallReverbImpulse(duration = 1.25, decay = 2.4) {
    const rate = this.ctx.sampleRate;
    const len = Math.max(1, Math.floor(rate * duration));
    const buf = this.ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        const env = Math.pow(1 - t, decay);
        const white = Math.random() * 2 - 1;
        lp = lp * 0.78 + white * 0.22;
        data[i] = lp * env * 0.65;
      }
      // 早期木石反射抽头
      const earlyTaps = [0.014, 0.029, 0.047, 0.071];
      earlyTaps.forEach((tapSec, idx) => {
        const idxSample = Math.floor((tapSec + ch * 0.003) * rate);
        if (idxSample < len) {
          data[idxSample] += (idx % 2 === 0 ? 0.35 : -0.28) * Math.pow(0.75, idx);
        }
      });
    }
    return buf;
  }

  getDistortionCurve(amount = 28) {
    if (this.distortionCurve && this._lastDistAmount === amount) return this.distortionCurve;
    const samples = 4096;
    const curve = new Float32Array(samples);
    const k = Math.max(1, amount);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((1 + k / 100) * x) / (1 + (k / 100) * Math.abs(x));
    }
    this.distortionCurve = curve;
    this._lastDistAmount = amount;
    return curve;
  }

  createDistortionNode(amount = 28) {
    const shaper = this.ctx.createWaveShaper();
    shaper.curve = this.getDistortionCurve(amount);
    shaper.oversample = '2x';
    return shaper;
  }

  /**
   * 合成自然粉红/棕红噪声缓存（比刺耳白噪声温暖浑厚得多，专用于风声、海浪、战鼓、火炮、岩石摩擦）
   */
  createNoiseBuffer(duration, decayPower = 1.4, colorType = 'pink') {
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, brown = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      const env = decayPower > 0 ? Math.pow(1 - i / len, decayPower) : 1.0;
      if (colorType === 'brown') {
        brown = (brown + 0.045 * white) / 1.045;
        data[i] = brown * 3.2 * env;
      } else if (colorType === 'pink') {
        b0 = 0.997 * b0 + white * 0.029;
        b1 = 0.985 * b1 + white * 0.032;
        b2 = 0.950 * b2 + white * 0.048;
        data[i] = (b0 + b1 + b2 + white * 0.08) * 1.65 * env;
      } else {
        data[i] = white * env;
      }
    }
    return buf;
  }

  // ===========================================================================
  // 一、基础交互与行棋物理拟真音效（温润紫檀木/黄杨木/古玉棋子 + 战鼓编钟）
  // ===========================================================================

  playSelect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 温润檀木轻叩声（替代原先刺耳的高频电子滴声）
    const woodOsc = this.ctx.createOscillator();
    const woodGain = this.ctx.createGain();
    woodOsc.type = 'triangle';
    woodOsc.frequency.setValueAtTime(340, now);
    woodOsc.frequency.exponentialRampToValueAtTime(175, now + 0.042);
    woodGain.gain.setValueAtTime(0.18, now);
    woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.046);
    woodOsc.connect(woodGain);
    this.connectWithSpace(woodGain, 0.06);
    woodOsc.start(now);
    woodOsc.stop(now + 0.05);

    const tapNoise = this.ctx.createBufferSource();
    tapNoise.buffer = this.createNoiseBuffer(0.022, 2.2, 'pink');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1150, now);
    bp.Q.setValueAtTime(2.5, now);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.12, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);
    tapNoise.connect(bp);
    bp.connect(nGain);
    this.connectWithSpace(nGain, 0.04);
    tapNoise.start(now);
    tapNoise.stop(now + 0.025);
  }

  playHint() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // 古琴/编钟五声泛音轻拨 (D4 - A4 - D5)
    const notes = [293.66, 440.0, 587.33];
    notes.forEach((f, idx) => {
      const t0 = now + idx * 0.055;
      const osc = this.ctx.createOscillator();
      const lp = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t0);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(f * 3.2, t0);
      lp.frequency.exponentialRampToValueAtTime(f * 1.2, t0 + 0.36);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(0.16 / (1 + idx * 0.2), t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.38);
      osc.connect(lp);
      lp.connect(g);
      this.connectWithSpace(g, 0.25);
      osc.start(t0);
      osc.stop(t0 + 0.40);
    });
  }

  playIllegal() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // 低沉双声木石闷响（替代刺耳锯齿波蜂鸣）
    [0, 0.085].forEach((delay, idx) => {
      const t0 = now + delay;
      const osc = this.ctx.createOscillator();
      const lp = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const freq = idx === 0 ? 155 : 115;
      osc.frequency.setValueAtTime(freq, t0);
      osc.frequency.exponentialRampToValueAtTime(52, t0 + 0.095);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(360, t0);
      gain.gain.setValueAtTime(0.28, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.10);
      osc.connect(lp);
      lp.connect(gain);
      this.connectWithSpace(gain, 0.08);
      osc.start(t0);
      osc.stop(t0 + 0.11);
    });
  }

  playPickUp(color = 'r', isSubtle = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const isRed = color === 'r';
    const volScale = isSubtle ? 0.65 : 1.0;

    // 捻起棋子时的木质微鸣与空气轻拂
    const brush = this.ctx.createBufferSource();
    brush.buffer = this.createNoiseBuffer(0.042, 1.8, 'pink');
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isRed ? 780 : 860, now);
    filter.frequency.exponentialRampToValueAtTime(isRed ? 1320 : 1450, now + 0.04);
    filter.Q.setValueAtTime(2.0, now);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.18 * volScale, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);
    brush.connect(filter);
    filter.connect(nGain);
    this.connectWithSpace(nGain, 0.06);
    brush.start(now);
    brush.stop(now + 0.046);

    const bodyOsc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(isRed ? 240 : 220, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(isRed ? 390 : 360, now + 0.048);
    bodyGain.gain.setValueAtTime(0.15 * volScale, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.052);
    bodyOsc.connect(bodyGain);
    this.connectWithSpace(bodyGain, 0.06);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.056);
  }

  playMove(color = 'r', pieceType = 'p') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const isRed = color === 'r';
    const isHeavy = pieceType === 'r' || pieceType === 'c' || pieceType === 'k' || pieceType === 'n';
    const weightMul = isHeavy ? 1.22 : 1.0;

    // 真实紫檀/花梨木棋子落盘声：主落子 + 16ms 微弹余韵
    const triggerWoodStoneClack = (delay, intensity, pitchMul = 1.0) => {
      const t0 = now + delay;

      // 1. 棋盘木石接触瞬态（温暖中频木纹共振，杜绝高频嘶声）
      const snap = this.ctx.createBufferSource();
      snap.buffer = this.createNoiseBuffer(0.028, 2.4, 'pink');
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime((isRed ? 1280 : 1420) * pitchMul, t0);
      bp.Q.setValueAtTime(2.2, t0);
      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.52 * intensity * weightMul, t0);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.026);
      snap.connect(bp);
      bp.connect(snapGain);
      this.connectWithSpace(snapGain, 0.12);
      snap.start(t0);
      snap.stop(t0 + 0.030);

      // 2. 实木棋子腔体三模态共振
      const modes = isRed ? [295, 560, 920] : [275, 525, 860];
      modes.forEach((baseF, mIdx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = mIdx === 0 ? 'triangle' : 'sine';
        const f0 = baseF * pitchMul * (isHeavy ? 0.92 : 1.0);
        osc.frequency.setValueAtTime(f0, t0);
        osc.frequency.exponentialRampToValueAtTime(f0 * 0.46, t0 + 0.068);
        const amp = (mIdx === 0 ? 0.42 : (mIdx === 1 ? 0.22 : 0.10)) * intensity * weightMul;
        g.gain.setValueAtTime(amp, t0);
        g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.072);
        osc.connect(g);
        this.connectWithSpace(g, 0.10);
        osc.start(t0);
        osc.stop(t0 + 0.076);
      });
    };

    triggerWoodStoneClack(0, 1.0, 1.0);
    triggerWoodStoneClack(0.015, 0.34, 1.12);

    // 3. 棋案低频浑厚共鸣
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(isHeavy ? 142 : 162, now);
    sub.frequency.exponentialRampToValueAtTime(44, now + 0.105);
    subGain.gain.setValueAtTime(0.44 * weightMul, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.112);
    sub.connect(subGain);
    this.connectWithSpace(subGain, 0.12);
    sub.start(now);
    sub.stop(now + 0.118);
  }

  playAttackShatter() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. 重击破甲低频战鼓冲击
    const punchKick = this.ctx.createOscillator();
    const punchGain = this.ctx.createGain();
    punchKick.type = 'sine';
    punchKick.frequency.setValueAtTime(155, now);
    punchKick.frequency.exponentialRampToValueAtTime(36, now + 0.16);
    punchGain.gain.setValueAtTime(0.82, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
    punchKick.connect(punchGain);
    this.connectWithSpace(punchGain, 0.18);
    punchKick.start(now);
    punchKick.stop(now + 0.18);

    // 2. 檀木棋子猛烈撞击爆裂声
    const woodSnap = this.ctx.createOscillator();
    const woodSnapGain = this.ctx.createGain();
    woodSnap.type = 'triangle';
    woodSnap.frequency.setValueAtTime(460, now);
    woodSnap.frequency.exponentialRampToValueAtTime(115, now + 0.085);
    woodSnapGain.gain.setValueAtTime(0.76, now);
    woodSnapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.092);
    woodSnap.connect(woodSnapGain);
    this.connectWithSpace(woodSnapGain, 0.15);
    woodSnap.start(now);
    woodSnap.stop(now + 0.098);

    const crackNoise = this.ctx.createBufferSource();
    crackNoise.buffer = this.createNoiseBuffer(0.11, 1.7, 'pink');
    const crackFilter = this.ctx.createBiquadFilter();
    crackFilter.type = 'bandpass';
    crackFilter.frequency.setValueAtTime(1580, now);
    crackFilter.frequency.exponentialRampToValueAtTime(680, now + 0.10);
    crackFilter.Q.setValueAtTime(1.6, now);
    const crackGain = this.ctx.createGain();
    crackGain.gain.setValueAtTime(0.85, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    crackNoise.connect(crackFilter);
    crackFilter.connect(crackGain);
    this.connectWithSpace(crackGain, 0.16);
    crackNoise.start(now);
    crackNoise.stop(now + 0.12);

    // 3. 棋子碎块散落棋盘的真实木石颗粒碰撞声（彻底摒弃原先刺耳的 6400Hz 正弦波尖叫）
    const debrisHits = [
      { delay: 0.018, freq: 620, dur: 0.045, vol: 0.34, pan: -0.35 },
      { delay: 0.038, freq: 840, dur: 0.042, vol: 0.28, pan: 0.40 },
      { delay: 0.062, freq: 540, dur: 0.048, vol: 0.24, pan: -0.22 },
      { delay: 0.088, freq: 760, dur: 0.040, vol: 0.19, pan: 0.28 },
      { delay: 0.118, freq: 680, dur: 0.038, vol: 0.14, pan: -0.15 }
    ];
    debrisHits.forEach(s => {
      const t0 = now + s.delay;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(s.freq, t0);
      osc.frequency.exponentialRampToValueAtTime(s.freq * 0.48, t0 + s.dur);
      g.gain.setValueAtTime(s.vol, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + s.dur);
      osc.connect(g);
      this.connectWithSpace(g, 0.14, s.pan);
      osc.start(t0);
      osc.stop(t0 + s.dur + 0.006);
    });
  }

  playCheck() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. 雄浑堂鼓重击 (War Drum Strike)
    const drumPunch = this.ctx.createOscillator();
    const drumGain = this.ctx.createGain();
    drumPunch.type = 'sine';
    drumPunch.frequency.setValueAtTime(148, now);
    drumPunch.frequency.exponentialRampToValueAtTime(42, now + 0.26);
    drumGain.gain.setValueAtTime(0.78, now);
    drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    drumPunch.connect(drumGain);
    this.connectWithSpace(drumGain, 0.22);
    drumPunch.start(now);
    drumPunch.stop(now + 0.30);

    // 2. 刀剑出鞘破风与青铜编钟共鸣（温润威严，不刺耳）
    const swish = this.ctx.createBufferSource();
    swish.buffer = this.createNoiseBuffer(0.18, 1.4, 'pink');
    const swishFilter = this.ctx.createBiquadFilter();
    swishFilter.type = 'bandpass';
    swishFilter.frequency.setValueAtTime(1100, now);
    swishFilter.frequency.exponentialRampToValueAtTime(2400, now + 0.07);
    swishFilter.frequency.exponentialRampToValueAtTime(920, now + 0.17);
    swishFilter.Q.setValueAtTime(2.2, now);
    const swishGain = this.ctx.createGain();
    swishGain.gain.setValueAtTime(0.48, now);
    swishGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    swish.connect(swishFilter);
    swishFilter.connect(swishGain);
    this.connectWithSpace(swishGain, 0.22);
    swish.start(now);
    swish.stop(now + 0.19);

    const bianzhong = [293.66, 440.0, 587.33, 880.0];
    bianzhong.forEach((f, idx) => {
      const t0 = now + idx * 0.012;
      const osc = this.ctx.createOscillator();
      const lp = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      osc.type = idx < 2 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f * 1.02, t0);
      osc.frequency.exponentialRampToValueAtTime(f, t0 + 0.025);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(f * 3.5, t0);
      g.gain.setValueAtTime(0.24 / (1 + idx * 0.3), t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.56);
      osc.connect(lp);
      lp.connect(g);
      this.connectWithSpace(g, 0.28);
      osc.start(t0);
      osc.stop(t0 + 0.58);
    });
  }

  playVictorySeal(delayOffset = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime + delayOffset;

    // 1. 传国玉玺轰然镇落重击
    const stampCrack = this.ctx.createBufferSource();
    stampCrack.buffer = this.createNoiseBuffer(0.22, 1.6, 'brown');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1150, now);
    bp.frequency.exponentialRampToValueAtTime(340, now + 0.20);
    bp.Q.setValueAtTime(1.5, now);
    const sGain = this.ctx.createGain();
    sGain.gain.setValueAtTime(0.88, now);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    stampCrack.connect(bp);
    bp.connect(sGain);
    this.connectWithSpace(sGain, 0.28);
    stampCrack.start(now);
    stampCrack.stop(now + 0.24);

    const slamSub = this.ctx.createOscillator();
    const slamGain = this.ctx.createGain();
    slamSub.type = 'sine';
    slamSub.frequency.setValueAtTime(138, now);
    slamSub.frequency.exponentialRampToValueAtTime(30, now + 0.48);
    slamGain.gain.setValueAtTime(0.86, now);
    slamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.50);
    slamSub.connect(slamGain);
    this.connectWithSpace(slamGain, 0.26);
    slamSub.start(now);
    slamSub.stop(now + 0.52);

    // 2. 皇家青铜大钟与编钟齐鸣和弦 (D3 - A3 - D4 - F#4 - A4 - D5)
    const chord = [146.83, 220.0, 293.66, 369.99, 440.0, 587.33];
    chord.forEach((f, i) => {
      const t0 = now + i * 0.016;
      const osc = this.ctx.createOscillator();
      const lp = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      osc.type = i < 3 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f, t0);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(f * 3.0, t0);
      lp.frequency.exponentialRampToValueAtTime(f * 1.3, t0 + 1.15);
      gain.gain.setValueAtTime(i === 0 ? 0.28 : 0.16 / (1 + i * 0.15), t0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);
      osc.connect(lp);
      lp.connect(gain);
      this.connectWithSpace(gain, 0.35);
      osc.start(t0);
      osc.stop(now + 1.28);
    });
  }

  // ===========================================================================
  // 二、17 大古谱绝杀 3D 动画专属逐帧同步声学原语库（与画面动作 100% 严丝合缝）
  // ===========================================================================

  /**
   * 绝杀一阶段 (0.00s -> 0.45s)：镜头推近与棋子蓄势低频风雷涌动 + 二阶段切入战鼓轰鸣
   */
  playCheckmateVFXSound(vfxType) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    this.stopAllVFXSounds();
    const now = this.ctx.currentTime;

    // 0.00s -> 0.45s: 苍穹低频蓄力呼啸
    const swellNoise = this.trackVFXSource(this.ctx.createBufferSource());
    swellNoise.buffer = this.createNoiseBuffer(0.48, 0.6, 'brown');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(140, now);
    bp.frequency.exponentialRampToValueAtTime(520, now + 0.44);
    bp.Q.setValueAtTime(1.8, now);
    const sGain = this.ctx.createGain();
    sGain.gain.setValueAtTime(0.01, now);
    sGain.gain.linearRampToValueAtTime(0.52, now + 0.40);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    swellNoise.connect(bp);
    bp.connect(sGain);
    this.connectWithSpace(sGain, 0.25);
    swellNoise.start(now);
    swellNoise.stop(now + 0.50);

    const subRiser = this.trackVFXSource(this.ctx.createOscillator());
    const subGain = this.ctx.createGain();
    subRiser.type = 'sine';
    subRiser.frequency.setValueAtTime(58, now);
    subRiser.frequency.exponentialRampToValueAtTime(135, now + 0.44);
    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.45, now + 0.40);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    subRiser.connect(subGain);
    this.connectWithSpace(subGain, 0.20);
    subRiser.start(now);
    subRiser.stop(now + 0.50);

    // 0.45s (Stage 2 CG 场景开启瞬间): 雄浑战鼓切入重音
    const stage2Start = now + 0.45;
    const drum = this.trackVFXSource(this.ctx.createOscillator());
    const dGain = this.ctx.createGain();
    drum.type = 'sine';
    drum.frequency.setValueAtTime(132, stage2Start);
    drum.frequency.exponentialRampToValueAtTime(34, stage2Start + 0.36);
    dGain.gain.setValueAtTime(0.68, stage2Start);
    dGain.gain.exponentialRampToValueAtTime(0.001, stage2Start + 0.38);
    drum.connect(dGain);
    this.connectWithSpace(dGain, 0.25);
    drum.start(stage2Start);
    drum.stop(stage2Start + 0.40);
  }

  /**
   * 1. 破空呼啸 / 棋子腾空 / 巨剑俯冲风声
   */
  playVFXWindWhoosh(freqStart = 260, freqEnd = 580, duration = 0.45, vol = 0.50, pan = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = Math.max(0.12, duration);

    const src = this.trackVFXSource(this.ctx.createBufferSource());
    src.buffer = this.createNoiseBuffer(dur, 0.85, 'pink');
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(Math.max(80, freqStart), now);
    filter.frequency.exponentialRampToValueAtTime(Math.max(80, freqEnd), now + dur * 0.85);
    filter.Q.setValueAtTime(2.0, now);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(vol, now + dur * 0.28);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(filter);
    filter.connect(g);
    this.connectWithSpace(g, 0.22, pan);
    src.start(now);
    src.stop(now + dur + 0.02);
  }

  /**
   * 2. 棋子高空化形变身（战车/重炮/神将/战马/猛虎）灵气凝聚共鸣
   */
  playVFXMorphFlash(vol = 0.70, pitchMul = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 低频能量聚拢脉冲
    const sub = this.trackVFXSource(this.ctx.createOscillator());
    const subG = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(145 * pitchMul, now);
    sub.frequency.exponentialRampToValueAtTime(48, now + 0.28);
    subG.gain.setValueAtTime(vol * 0.72, now);
    subG.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
    sub.connect(subG);
    this.connectWithSpace(subG, 0.22);
    sub.start(now);
    sub.stop(now + 0.32);

    // 温暖金石共鸣和弦 (D4 - A4 - D5)
    [293.66, 440.0, 587.33].forEach((f, idx) => {
      const t0 = now + idx * 0.015;
      const osc = this.trackVFXSource(this.ctx.createOscillator());
      const lp = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f * pitchMul, t0);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(f * 2.8, t0);
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime((vol * 0.26) / (1 + idx * 0.25), t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.42);
      osc.connect(lp);
      lp.connect(g);
      this.connectWithSpace(g, 0.28);
      osc.start(t0);
      osc.stop(t0 + 0.44);
    });
  }

  /**
   * 3. 3D 战车双轮疾驰碾压轰鸣（双车错 / 列马车 / 夹车炮）
   */
  playVFXChariotRumble(duration = 1.1, vol = 0.75) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = Math.max(0.3, duration);

    // 持续车轮碾地棕红低频隆隆声
    const rumble = this.trackVFXSource(this.ctx.createBufferSource());
    rumble.buffer = this.createNoiseBuffer(dur, 0.4, 'brown');
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(260, now);
    lp.frequency.linearRampToValueAtTime(380, now + dur * 0.7);
    const rGain = this.ctx.createGain();
    rGain.gain.setValueAtTime(0.01, now);
    rGain.gain.linearRampToValueAtTime(vol * 0.75, now + 0.08);
    rGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    rumble.connect(lp);
    lp.connect(rGain);
    this.connectWithSpace(rGain, 0.18);
    rumble.start(now);
    rumble.stop(now + dur + 0.02);

    // 战车木轮与青铜车轴节拍式颠簸声
    const stepCount = Math.max(3, Math.floor(dur / 0.11));
    for (let i = 0; i < stepCount; i++) {
      const t0 = now + i * 0.11;
      const thud = this.trackVFXSource(this.ctx.createOscillator());
      const tg = this.ctx.createGain();
      thud.type = 'triangle';
      thud.frequency.setValueAtTime(118 + (i % 2) * 18, t0);
      thud.frequency.exponentialRampToValueAtTime(45, t0 + 0.07);
      tg.gain.setValueAtTime(vol * 0.36, t0);
      tg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.075);
      thud.connect(tg);
      this.connectWithSpace(tg, 0.12, (i % 2 === 0 ? -1 : 1) * 0.25);
      thud.start(t0);
      thud.stop(t0 + 0.08);
    }
  }

  /**
   * 4. 电影级重型爆炸与冲击波（双车对撞 / 重炮轰击 / 卧槽马撞飞 / 闷杀铁球砸落 / 天地炮陨石）
   */
  playVFXHeavyExplosion(scale = 1.0, vol = 0.90) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const sc = Math.max(0.7, Math.min(2.0, scale));
    const amp = Math.min(1.0, vol);

    // 层 1：超低频胸腔震荡波 (Sub-Bass Impact)
    const subBoom = this.trackVFXSource(this.ctx.createOscillator());
    const subGain = this.ctx.createGain();
    subBoom.type = 'sine';
    subBoom.frequency.setValueAtTime(125 / Math.sqrt(sc), now);
    subBoom.frequency.exponentialRampToValueAtTime(24, now + 0.62 * sc);
    subGain.gain.setValueAtTime(amp * 0.95, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.66 * sc);
    subBoom.connect(subGain);
    this.connectWithSpace(subGain, 0.28);
    subBoom.start(now);
    subBoom.stop(now + 0.68 * sc);

    // 层 2：中低频火球轰鸣（棕红噪声 + 软饱和 + 低通扫频，浑厚不刺耳）
    const fireNoise = this.trackVFXSource(this.ctx.createBufferSource());
    const fireDur = 0.72 * sc;
    fireNoise.buffer = this.createNoiseBuffer(fireDur, 1.25, 'brown');
    const fireFilter = this.ctx.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.setValueAtTime(780, now);
    fireFilter.frequency.exponentialRampToValueAtTime(120, now + fireDur);
    const shaper = this.createDistortionNode(24);
    const fireGain = this.ctx.createGain();
    fireGain.gain.setValueAtTime(amp * 0.88, now);
    fireGain.gain.exponentialRampToValueAtTime(0.001, now + fireDur);
    fireNoise.connect(fireFilter);
    fireFilter.connect(shaper);
    shaper.connect(fireGain);
    this.connectWithSpace(fireGain, 0.32);
    fireNoise.start(now);
    fireNoise.stop(now + fireDur + 0.02);

    // 层 3：爆心瞬态碎石冲击
    const crack = this.trackVFXSource(this.ctx.createBufferSource());
    crack.buffer = this.createNoiseBuffer(0.14, 2.0, 'pink');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1350, now);
    bp.frequency.exponentialRampToValueAtTime(380, now + 0.13);
    bp.Q.setValueAtTime(1.4, now);
    const cGain = this.ctx.createGain();
    cGain.gain.setValueAtTime(amp * 0.72, now);
    cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    crack.connect(bp);
    bp.connect(cGain);
    this.connectWithSpace(cGain, 0.20);
    crack.start(now);
    crack.stop(now + 0.15);
  }

  /**
   * 5. 城墙拔地升起 / 石碑合围 / 铁笼升起（闷宫 / 铁门栓 / 困毙 / 闷杀）
   */
  playVFXStoneWallRise(pitchMul = 1.0, vol = 0.78) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 巨石破土摩擦隆隆声
    const grind = this.trackVFXSource(this.ctx.createBufferSource());
    grind.buffer = this.createNoiseBuffer(0.34, 0.9, 'brown');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(160 * pitchMul, now);
    bp.frequency.linearRampToValueAtTime(290 * pitchMul, now + 0.26);
    bp.Q.setValueAtTime(1.6, now);
    const gGain = this.ctx.createGain();
    gGain.gain.setValueAtTime(0.01, now);
    gGain.gain.linearRampToValueAtTime(vol * 0.68, now + 0.06);
    gGain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
    grind.connect(bp);
    bp.connect(gGain);
    this.connectWithSpace(gGain, 0.20);
    grind.start(now);
    grind.stop(now + 0.36);

    // 城墙到位沉重顿地声
    const lockT = now + 0.22;
    const thud = this.trackVFXSource(this.ctx.createOscillator());
    const tGain = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(128 * pitchMul, lockT);
    thud.frequency.exponentialRampToValueAtTime(38, lockT + 0.16);
    tGain.gain.setValueAtTime(vol * 0.82, lockT);
    tGain.gain.exponentialRampToValueAtTime(0.001, lockT + 0.17);
    thud.connect(tGain);
    this.connectWithSpace(tGain, 0.22);
    thud.start(lockT);
    thud.stop(lockT + 0.18);
  }

  /**
   * 6. 棋子惊慌迈步 / 撞墙反弹 / 落地闷响（闷宫 / 闷杀 / 困毙 / 海底捞月）
   */
  playVFXPieceStepThud(vol = 0.62, pitchMul = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.trackVFXSource(this.ctx.createOscillator());
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240 * pitchMul, now);
    osc.frequency.exponentialRampToValueAtTime(68, now + 0.085);
    g.gain.setValueAtTime(vol * 0.65, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(g);
    this.connectWithSpace(g, 0.12);
    osc.start(now);
    osc.stop(now + 0.095);

    const snap = this.trackVFXSource(this.ctx.createBufferSource());
    snap.buffer = this.createNoiseBuffer(0.025, 2.2, 'pink');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1100 * pitchMul, now);
    bp.Q.setValueAtTime(2.0, now);
    const sg = this.ctx.createGain();
    sg.gain.setValueAtTime(vol * 0.45, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    snap.connect(bp);
    bp.connect(sg);
    this.connectWithSpace(sg, 0.10);
    snap.start(now);
    snap.stop(now + 0.028);
  }

  /**
   * 7. 四面城墙合围后“将（帅）”原地惊慌急促震颤声（闷宫专属）
   */
  playVFXPanicTremble(duration = 0.55, vol = 0.55) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const count = Math.max(3, Math.floor(duration / 0.075));
    for (let i = 0; i < count; i++) {
      const t0 = now + i * 0.075;
      const osc = this.trackVFXSource(this.ctx.createOscillator());
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280 + (i % 2) * 45, t0);
      osc.frequency.exponentialRampToValueAtTime(95, t0 + 0.055);
      g.gain.setValueAtTime(vol * 0.38, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
      osc.connect(g);
      this.connectWithSpace(g, 0.08);
      osc.start(t0);
      osc.stop(t0 + 0.065);
    }
  }

  /**
   * 8. 神兵宝剑铮然出鞘与剑鸣（对面笑 / 八角马 / 双将）
   */
  playVFXSwordUnsheathe(vol = 0.80) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 剑刃擦鞘金属滑音
    const slide = this.trackVFXSource(this.ctx.createBufferSource());
    slide.buffer = this.createNoiseBuffer(0.20, 1.3, 'pink');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1400, now);
    bp.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
    bp.frequency.exponentialRampToValueAtTime(1600, now + 0.19);
    bp.Q.setValueAtTime(3.2, now);
    const sg = this.ctx.createGain();
    sg.gain.setValueAtTime(vol * 0.55, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
    slide.connect(bp);
    bp.connect(sg);
    this.connectWithSpace(sg, 0.24);
    slide.start(now);
    slide.stop(now + 0.21);

    // 龙泉剑身清越泛音 (D5 - A5 - D6)
    [587.33, 880.0, 1174.66].forEach((f, idx) => {
      const t0 = now + 0.02 + idx * 0.01;
      const osc = this.trackVFXSource(this.ctx.createOscillator());
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f * 1.03, t0);
      osc.frequency.exponentialRampToValueAtTime(f, t0 + 0.03);
      g.gain.setValueAtTime((vol * 0.22) / (1 + idx * 0.35), t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);
      osc.connect(g);
      this.connectWithSpace(g, 0.30);
      osc.start(t0);
      osc.stop(t0 + 0.47);
    });
  }

  /**
   * 9. 雷霆挥剑重劈破风与斩击声（对面笑 / 双车错 / 八角马 / 双将）
   */
  playVFXSwordCleave(vol = 0.92) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 凌厉剑风下劈
    const slash = this.trackVFXSource(this.ctx.createBufferSource());
    slash.buffer = this.createNoiseBuffer(0.24, 1.5, 'pink');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2200, now);
    bp.frequency.exponentialRampToValueAtTime(320, now + 0.22);
    bp.Q.setValueAtTime(1.8, now);
    const sg = this.ctx.createGain();
    sg.gain.setValueAtTime(vol * 0.85, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    slash.connect(bp);
    bp.connect(sg);
    this.connectWithSpace(sg, 0.25);
    slash.start(now);
    slash.stop(now + 0.25);

    // 剑锋破甲重击
    const hit = this.trackVFXSource(this.ctx.createOscillator());
    const hg = this.ctx.createGain();
    hit.type = 'triangle';
    hit.frequency.setValueAtTime(380, now + 0.03);
    hit.frequency.exponentialRampToValueAtTime(55, now + 0.22);
    hg.gain.setValueAtTime(vol * 0.82, now + 0.03);
    hg.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    hit.connect(hg);
    this.connectWithSpace(hg, 0.22);
    hit.start(now + 0.03);
    hit.stop(now + 0.25);
  }

  /**
   * 10. 金甲神将持剑阔步冲锋重甲脚步声（对面笑专属）
   */
  playVFXArmorFootsteps(count = 5, totalDur = 1.45, vol = 0.68) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const stepInterval = totalDur / Math.max(1, count);
    for (let i = 0; i < count; i++) {
      const t0 = now + i * stepInterval;
      // 战靴踏地低频
      const boot = this.trackVFXSource(this.ctx.createOscillator());
      const bg = this.ctx.createGain();
      boot.type = 'sine';
      boot.frequency.setValueAtTime(135, t0);
      boot.frequency.exponentialRampToValueAtTime(42, t0 + 0.09);
      bg.gain.setValueAtTime(vol * 0.62, t0);
      bg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.10);
      boot.connect(bg);
      this.connectWithSpace(bg, 0.14);
      boot.start(t0);
      boot.stop(t0 + 0.11);

      // 明光甲片铿锵碰撞声
      const clink = this.trackVFXSource(this.ctx.createBufferSource());
      clink.buffer = this.createNoiseBuffer(0.045, 2.0, 'pink');
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1650 + (i % 2) * 180, t0 + 0.01);
      bp.Q.setValueAtTime(2.6, t0 + 0.01);
      const cg = this.ctx.createGain();
      cg.gain.setValueAtTime(vol * 0.32, t0 + 0.01);
      cg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.055);
      clink.connect(bp);
      bp.connect(cg);
      this.connectWithSpace(cg, 0.12);
      clink.start(t0 + 0.01);
      clink.stop(t0 + 0.06);
    }
  }

  /**
   * 11. 机关重炮/战车机械变形与齿轮咬合声（重炮杀 / 夹车炮 / 马后炮）
   */
  playVFXMechanicalAssemble(vol = 0.80) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    [0.0, 0.11, 0.23].forEach((d, idx) => {
      const t0 = now + d;
      const clunk = this.trackVFXSource(this.ctx.createOscillator());
      const cg = this.ctx.createGain();
      clunk.type = 'triangle';
      const f = idx === 2 ? 185 : (240 + idx * 55);
      clunk.frequency.setValueAtTime(f, t0);
      clunk.frequency.exponentialRampToValueAtTime(64, t0 + 0.095);
      cg.gain.setValueAtTime(vol * 0.65, t0);
      cg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.10);
      clunk.connect(cg);
      this.connectWithSpace(cg, 0.16);
      clunk.start(t0);
      clunk.stop(t0 + 0.11);

      const metal = this.trackVFXSource(this.ctx.createBufferSource());
      metal.buffer = this.createNoiseBuffer(0.06, 1.8, 'pink');
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1320 + idx * 240, t0);
      bp.Q.setValueAtTime(2.4, t0);
      const mg = this.ctx.createGain();
      mg.gain.setValueAtTime(vol * 0.45, t0);
      mg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);
      metal.connect(bp);
      bp.connect(mg);
      this.connectWithSpace(mg, 0.14);
      metal.start(t0);
      metal.stop(t0 + 0.065);
    });
  }

  /**
   * 12. 炮膛开启、炮弹推入与炮闩闭锁声（重炮杀 / 夹车炮）
   */
  playVFXAmmoLoad(vol = 0.80) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 炮弹滑入铜膛摩擦声
    const slide = this.trackVFXSource(this.ctx.createBufferSource());
    slide.buffer = this.createNoiseBuffer(0.22, 1.2, 'pink');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(680, now);
    bp.frequency.linearRampToValueAtTime(1280, now + 0.20);
    bp.Q.setValueAtTime(2.2, now);
    const sg = this.ctx.createGain();
    sg.gain.setValueAtTime(vol * 0.48, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    slide.connect(bp);
    bp.connect(sg);
    this.connectWithSpace(sg, 0.14);
    slide.start(now);
    slide.stop(now + 0.23);

    // 重型炮闩咔哒闭锁
    const lockT = now + 0.20;
    const lockOsc = this.trackVFXSource(this.ctx.createOscillator());
    const lg = this.ctx.createGain();
    lockOsc.type = 'triangle';
    lockOsc.frequency.setValueAtTime(320, lockT);
    lockOsc.frequency.exponentialRampToValueAtTime(75, lockT + 0.09);
    lg.gain.setValueAtTime(vol * 0.78, lockT);
    lg.gain.exponentialRampToValueAtTime(0.001, lockT + 0.10);
    lockOsc.connect(lg);
    this.connectWithSpace(lg, 0.16);
    lockOsc.start(lockT);
    lockOsc.stop(lockT + 0.11);
  }

  /**
   * 13. 重炮齐射出膛轰鸣 + 炮弹破空呼啸（重炮杀 / 马后炮 / 夹车炮）
   */
  playVFXCannonFire(scale = 1.2, vol = 0.92) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 膛口爆轰
    const boom = this.trackVFXSource(this.ctx.createOscillator());
    const bg = this.ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(145, now);
    boom.frequency.exponentialRampToValueAtTime(28, now + 0.42);
    bg.gain.setValueAtTime(vol * 0.92, now);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    boom.connect(bg);
    this.connectWithSpace(bg, 0.28);
    boom.start(now);
    boom.stop(now + 0.46);

    const blast = this.trackVFXSource(this.ctx.createBufferSource());
    blast.buffer = this.createNoiseBuffer(0.36, 1.5, 'brown');
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(920, now);
    lp.frequency.exponentialRampToValueAtTime(160, now + 0.35);
    const blg = this.ctx.createGain();
    blg.gain.setValueAtTime(vol * 0.85, now);
    blg.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    blast.connect(lp);
    lp.connect(blg);
    this.connectWithSpace(blg, 0.26);
    blast.start(now);
    blast.stop(now + 0.38);

    // 炮弹破空呼啸
    this.playVFXWindWhoosh(720, 260, 0.28, vol * 0.55, 0);
  }

  /**
   * 14. 真实战马奔腾马蹄踏地声（马后炮 / 八角马 / 列马车 / 卧槽马，彻底摒弃刺耳锯齿波嘶鸣）
   */
  playVFXHoofGallop(count = 4, totalDur = 0.95, vol = 0.78) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const strideDur = totalDur / Math.max(1, count);

    for (let i = 0; i < count; i++) {
      const baseT = now + i * strideDur;
      // 三拍马蹄节奏 (哒-哒-咚)
      [0.0, strideDur * 0.24, strideDur * 0.52].forEach((subOff, beatIdx) => {
        const t0 = baseT + subOff;
        const isMain = beatIdx === 2;
        const hoof = this.trackVFXSource(this.ctx.createOscillator());
        const hg = this.ctx.createGain();
        hoof.type = 'triangle';
        const f0 = isMain ? 165 : (220 + beatIdx * 35);
        hoof.frequency.setValueAtTime(f0, t0);
        hoof.frequency.exponentialRampToValueAtTime(48, t0 + 0.065);
        hg.gain.setValueAtTime(vol * (isMain ? 0.58 : 0.38), t0);
        hg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.07);
        hoof.connect(hg);
        this.connectWithSpace(hg, 0.12);
        hoof.start(t0);
        hoof.stop(t0 + 0.075);

        const turf = this.trackVFXSource(this.ctx.createBufferSource());
        turf.buffer = this.createNoiseBuffer(0.032, 2.2, 'pink');
        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(isMain ? 760 : 980, t0);
        bp.Q.setValueAtTime(2.0, t0);
        const tg = this.ctx.createGain();
        tg.gain.setValueAtTime(vol * (isMain ? 0.42 : 0.28), t0);
        tg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.032);
        turf.connect(bp);
        bp.connect(tg);
        this.connectWithSpace(tg, 0.10);
        turf.start(t0);
        turf.stop(t0 + 0.036);
      });
    }
  }

  /**
   * 15. 铁门合拢与粗大铁门栓横插落锁声（铁门栓 / 夹车炮 / 闷杀）
   */
  playVFXIronBoltSlam(vol = 0.85, pitchMul = 1.0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 铁门沉重闷响
    const door = this.trackVFXSource(this.ctx.createOscillator());
    const dg = this.ctx.createGain();
    door.type = 'sine';
    door.frequency.setValueAtTime(140 * pitchMul, now);
    door.frequency.exponentialRampToValueAtTime(38, now + 0.18);
    dg.gain.setValueAtTime(vol * 0.82, now);
    dg.gain.exponentialRampToValueAtTime(0.001, now + 0.19);
    door.connect(dg);
    this.connectWithSpace(dg, 0.20);
    door.start(now);
    door.stop(now + 0.20);

    // 玄铁门栓滑入锁扣的金属撞击
    const bolt = this.trackVFXSource(this.ctx.createBufferSource());
    bolt.buffer = this.createNoiseBuffer(0.09, 1.8, 'pink');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1180 * pitchMul, now + 0.02);
    bp.frequency.exponentialRampToValueAtTime(460, now + 0.10);
    bp.Q.setValueAtTime(2.4, now + 0.02);
    const bg = this.ctx.createGain();
    bg.gain.setValueAtTime(vol * 0.68, now + 0.02);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
    bolt.connect(bp);
    bp.connect(bg);
    this.connectWithSpace(bg, 0.18);
    bolt.start(now + 0.02);
    bolt.stop(now + 0.12);
  }

  /**
   * 16. 铁链哗啦绷紧与绞盘拉拽声（铁门栓 / 钓鱼马 / 闷杀）
   */
  playVFXChainPull(duration = 0.80, vol = 0.82) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const links = Math.max(4, Math.floor(duration / 0.085));

    for (let i = 0; i < links; i++) {
      const t0 = now + i * 0.085;
      const pitch = 1.0 + (i / links) * 0.35;

      const clink = this.trackVFXSource(this.ctx.createBufferSource());
      clink.buffer = this.createNoiseBuffer(0.055, 2.0, 'pink');
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1450 * pitch, t0);
      bp.Q.setValueAtTime(3.0, t0);
      const cg = this.ctx.createGain();
      cg.gain.setValueAtTime(vol * 0.48, t0);
      cg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.055);
      clink.connect(bp);
      bp.connect(cg);
      this.connectWithSpace(cg, 0.16, ((i % 3) - 1) * 0.35);
      clink.start(t0);
      clink.stop(t0 + 0.06);

      const tension = this.trackVFXSource(this.ctx.createOscillator());
      const tg = this.ctx.createGain();
      tension.type = 'triangle';
      tension.frequency.setValueAtTime(220 * pitch, t0);
      tension.frequency.exponentialRampToValueAtTime(95, t0 + 0.065);
      tg.gain.setValueAtTime(vol * 0.35, t0);
      tg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.07);
      tension.connect(tg);
      this.connectWithSpace(tg, 0.14);
      tension.start(t0);
      tension.stop(t0 + 0.075);
    }
  }

  /**
   * 17. 猛虎低沉胸腔咆哮与扑杀虎啸（侧面虎专属：真实低频喉音共振峰调制）
   */
  playVFXTigerRoar(vol = 0.88, isPounce = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = isPounce ? 0.68 : 0.52;

    // 猛虎声带基频 + 26Hz 喉音颤动调制
    const carrier = this.trackVFXSource(this.ctx.createOscillator());
    const lfo = this.trackVFXSource(this.ctx.createOscillator());
    const lfoGain = this.ctx.createGain();
    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(isPounce ? 92 : 76, now);
    carrier.frequency.linearRampToValueAtTime(isPounce ? 148 : 118, now + dur * 0.32);
    carrier.frequency.exponentialRampToValueAtTime(52, now + dur);

    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(28, now);
    lfoGain.gain.setValueAtTime(22, now);
    lfo.connect(lfoGain);
    lfoGain.connect(carrier.frequency);

    // 虎口胸腔低通与共振峰滤波（彻底滤除高频毛刺，只保留浑厚兽吼）
    const formant = this.ctx.createBiquadFilter();
    formant.type = 'bandpass';
    formant.frequency.setValueAtTime(260, now);
    formant.frequency.linearRampToValueAtTime(420, now + dur * 0.35);
    formant.frequency.exponentialRampToValueAtTime(160, now + dur);
    formant.Q.setValueAtTime(1.4, now);

    const rGain = this.ctx.createGain();
    rGain.gain.setValueAtTime(0.01, now);
    rGain.gain.linearRampToValueAtTime(vol * 0.78, now + 0.05);
    rGain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    carrier.connect(formant);
    formant.connect(rGain);
    this.connectWithSpace(rGain, 0.28);
    carrier.start(now);
    lfo.start(now);
    carrier.stop(now + dur + 0.02);
    lfo.stop(now + dur + 0.02);

    // 虎啸气息棕红噪声层
    const breath = this.trackVFXSource(this.ctx.createBufferSource());
    breath.buffer = this.createNoiseBuffer(dur, 0.9, 'brown');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'lowpass';
    bp.frequency.setValueAtTime(520, now);
    bp.frequency.exponentialRampToValueAtTime(180, now + dur);
    const bg = this.ctx.createGain();
    bg.gain.setValueAtTime(vol * 0.72, now);
    bg.gain.exponentialRampToValueAtTime(0.001, now + dur);
    breath.connect(bp);
    bp.connect(bg);
    this.connectWithSpace(bg, 0.25);
    breath.start(now);
    breath.stop(now + dur + 0.02);
  }

  /**
   * 18. 旋转神兵/飞戟高速破空旋风声（八角马 / 双将）
   */
  playVFXSpinningWeaponThrow(duration = 1.05, vol = 0.82) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const pulses = Math.max(4, Math.floor(duration / 0.11));

    for (let i = 0; i < pulses; i++) {
      const t0 = now + i * 0.11;
      const swish = this.trackVFXSource(this.ctx.createBufferSource());
      swish.buffer = this.createNoiseBuffer(0.085, 1.5, 'pink');
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(520 + (i % 2) * 180, t0);
      bp.frequency.exponentialRampToValueAtTime(1150, t0 + 0.045);
      bp.frequency.exponentialRampToValueAtTime(420, t0 + 0.08);
      bp.Q.setValueAtTime(2.0, t0);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, t0);
      g.gain.linearRampToValueAtTime(vol * 0.52, t0 + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.085);
      swish.connect(bp);
      bp.connect(g);
      this.connectWithSpace(g, 0.18, ((i % 2) * 2 - 1) * 0.35);
      swish.start(t0);
      swish.stop(t0 + 0.09);
    }
  }

  /**
   * 19. 碧水入水沉潜、沧海浪涌与破水飞溅声（钓鱼马 / 海底捞月）
   */
  playVFXWaterPlunge(vol = 0.85) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 沉入深水低频咕咚声
    const plunge = this.trackVFXSource(this.ctx.createOscillator());
    const pg = this.ctx.createGain();
    plunge.type = 'sine';
    plunge.frequency.setValueAtTime(185, now);
    plunge.frequency.exponentialRampToValueAtTime(52, now + 0.18);
    pg.gain.setValueAtTime(vol * 0.78, now);
    pg.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    plunge.connect(pg);
    this.connectWithSpace(pg, 0.26);
    plunge.start(now);
    plunge.stop(now + 0.24);

    // 水花翻涌
    const splash = this.trackVFXSource(this.ctx.createBufferSource());
    splash.buffer = this.createNoiseBuffer(0.42, 1.3, 'pink');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(980, now);
    bp.frequency.exponentialRampToValueAtTime(280, now + 0.40);
    bp.Q.setValueAtTime(1.5, now);
    const sg = this.ctx.createGain();
    sg.gain.setValueAtTime(vol * 0.68, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
    splash.connect(bp);
    bp.connect(sg);
    this.connectWithSpace(sg, 0.28);
    splash.start(now);
    splash.stop(now + 0.44);
  }

  playVFXWaterSplash(vol = 0.90) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 破水腾空浪花激溅
    const burst = this.trackVFXSource(this.ctx.createBufferSource());
    burst.buffer = this.createNoiseBuffer(0.52, 1.2, 'pink');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(420, now);
    bp.frequency.exponentialRampToValueAtTime(1450, now + 0.14);
    bp.frequency.exponentialRampToValueAtTime(480, now + 0.50);
    bp.Q.setValueAtTime(1.4, now);
    const bg = this.ctx.createGain();
    bg.gain.setValueAtTime(0.01, now);
    bg.gain.linearRampToValueAtTime(vol * 0.78, now + 0.04);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
    burst.connect(bp);
    bp.connect(bg);
    this.connectWithSpace(bg, 0.30);
    burst.start(now);
    burst.stop(now + 0.54);

    const sub = this.trackVFXSource(this.ctx.createOscillator());
    const sg = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(95, now);
    sub.frequency.exponentialRampToValueAtTime(185, now + 0.18);
    sg.gain.setValueAtTime(vol * 0.55, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    sub.connect(sg);
    this.connectWithSpace(sg, 0.22);
    sub.start(now);
    sub.stop(now + 0.24);
  }

  playVFXOceanSwirl(duration = 1.4, vol = 0.70) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = Math.max(0.4, duration);

    const wave = this.trackVFXSource(this.ctx.createBufferSource());
    wave.buffer = this.createNoiseBuffer(dur, 0.65, 'brown');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(240, now);
    bp.frequency.exponentialRampToValueAtTime(620, now + dur * 0.45);
    bp.frequency.exponentialRampToValueAtTime(210, now + dur);
    bp.Q.setValueAtTime(1.2, now);
    const wg = this.ctx.createGain();
    wg.gain.setValueAtTime(0.01, now);
    wg.gain.linearRampToValueAtTime(vol * 0.72, now + dur * 0.25);
    wg.gain.exponentialRampToValueAtTime(0.001, now + dur);
    wave.connect(bp);
    bp.connect(wg);
    this.connectWithSpace(wg, 0.32);
    wave.start(now);
    wave.stop(now + dur + 0.02);
  }

  /**
   * 20. 卧槽马专属：双子高空能量对波激撞声（低频战气共鸣 + 电弧交锋脉冲）
   */
  playVFXEnergyBeamClash(duration = 2.0, vol = 0.78) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = Math.max(0.5, duration);

    // 初始对波激撞冲击
    this.playVFXHeavyExplosion(0.85, vol * 0.68);

    // 持续双波对抗低频共振嗡鸣
    [110, 164.81].forEach((freq, idx) => {
      const osc = this.trackVFXSource(this.ctx.createOscillator());
      const lp = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(420, now);
      g.gain.setValueAtTime(0.01, now);
      g.gain.linearRampToValueAtTime(vol * 0.28, now + 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(lp);
      lp.connect(g);
      this.connectWithSpace(g, 0.24, idx === 0 ? -0.35 : 0.35);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    });

    // 对波中心能量震荡脉冲
    const burstCount = Math.max(3, Math.floor(dur / 0.28));
    for (let i = 0; i < burstCount; i++) {
      const t0 = now + 0.15 + i * 0.28;
      const arc = this.trackVFXSource(this.ctx.createBufferSource());
      arc.buffer = this.createNoiseBuffer(0.12, 1.8, 'pink');
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(780 + (i % 2) * 260, t0);
      bp.Q.setValueAtTime(2.2, t0);
      const ag = this.ctx.createGain();
      ag.gain.setValueAtTime(vol * 0.34, t0);
      ag.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
      arc.connect(bp);
      bp.connect(ag);
      this.connectWithSpace(ag, 0.20);
      arc.start(t0);
      arc.stop(t0 + 0.13);
    }
  }

  /**
   * 21. 天地炮专属：巨型太阳化为熔岩球低频地心轰鸣 + 巨型陨石贴脸呼啸掠过 + 陨石雨砸地
   */
  playVFXSolarLavaRumble(duration = 2.2, vol = 0.88) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = Math.max(0.5, duration);

    const magmaNoise = this.trackVFXSource(this.ctx.createBufferSource());
    magmaNoise.buffer = this.createNoiseBuffer(dur, 0.5, 'brown');
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(220, now);
    lp.frequency.linearRampToValueAtTime(340, now + dur * 0.5);
    lp.frequency.exponentialRampToValueAtTime(110, now + dur);
    const mg = this.ctx.createGain();
    mg.gain.setValueAtTime(0.01, now);
    mg.gain.linearRampToValueAtTime(vol * 0.85, now + 0.18);
    mg.gain.exponentialRampToValueAtTime(0.001, now + dur);
    magmaNoise.connect(lp);
    lp.connect(mg);
    this.connectWithSpace(mg, 0.32);
    magmaNoise.start(now);
    magmaNoise.stop(now + dur + 0.02);

    const sub = this.trackVFXSource(this.ctx.createOscillator());
    const sg = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(68, now);
    sub.frequency.exponentialRampToValueAtTime(32, now + dur);
    sg.gain.setValueAtTime(vol * 0.72, now);
    sg.gain.exponentialRampToValueAtTime(0.001, now + dur);
    sub.connect(sg);
    this.connectWithSpace(sg, 0.25);
    sub.start(now);
    sub.stop(now + dur + 0.02);
  }

  playVFXMeteorWhistlePass(vol = 0.92) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const dur = 0.62;

    // 巨大熔岩碎片穿过屏幕中心的多普勒贴脸呼啸 (Doppler Pass-By)
    const passNoise = this.trackVFXSource(this.ctx.createBufferSource());
    passNoise.buffer = this.createNoiseBuffer(dur, 0.7, 'pink');
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(920, now);
    bp.frequency.exponentialRampToValueAtTime(1450, now + 0.22);
    bp.frequency.exponentialRampToValueAtTime(180, now + dur);
    bp.Q.setValueAtTime(1.8, now);

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.01, now);
    g.gain.linearRampToValueAtTime(vol * 0.92, now + 0.24);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    passNoise.connect(bp);
    bp.connect(g);
    this.connectWithSpace(g, 0.26);
    passNoise.start(now);
    passNoise.stop(now + dur + 0.02);
  }

  playVFXMeteorRainImpacts(duration = 1.1, vol = 0.82) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const hits = [0.0, 0.16, 0.31, 0.45, 0.58, 0.72];
    hits.forEach((d, idx) => {
      if (d > duration) return;
      this.scheduleVFXTimer(() => {
        this.playVFXHeavyExplosion(0.65 + (idx % 3) * 0.15, vol * 0.65);
      }, d * 1000);
    });
  }
}
