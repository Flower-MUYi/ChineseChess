// =============================================================================
// 绝杀演武残局库、世界快照无缝切换、2D 御笔书法 HUD 与棋盘粒子特效核心 (vfx-core.js)
// =============================================================================
Object.assign(Xiangqi3DApp.prototype, {
  ensureVFXDOMTemplates() {
    const burstEl = document.getElementById('action-burst-popup');
    if (burstEl && !burstEl.hasChildNodes()) {
      burstEl.innerHTML = '<div class="action-burst-stage relative flex flex-col items-center justify-center">\n      <svg class="action-burst-wings" viewBox="0 0 400 210" fill="none" xmlns="http://www.w3.org/2000/svg">\n        <path d="M16 105 C72 42, 145 26, 200 32 C255 26, 328 42, 384 105 C328 164, 255 180, 200 174 C145 180, 72 164, 16 105 Z"\n          fill="url(#inkGrad)" stroke="url(#goldStroke)" stroke-width="2.6" />\n        <path d="M34 105 C82 54, 148 40, 200 45 C252 40, 318 54, 366 105 C318 152, 252 166, 200 161 C148 166, 82 152, 34 105 Z"\n          stroke="url(#goldStroke)" stroke-width="1.2" stroke-dasharray="5 4" opacity="0.72" />\n        <path d="M4 82 L68 98 L22 126 Z" fill="url(#goldStroke)" opacity="0.92" />\n        <path d="M396 82 L332 98 L378 126 Z" fill="url(#goldStroke)" opacity="0.92" />\n        <path d="M24 62 L78 84 L42 98 Z" fill="url(#crimsonWing)" opacity="0.82" />\n        <path d="M376 62 L322 84 L358 98 Z" fill="url(#crimsonWing)" opacity="0.82" />\n        <g class="action-burst-ring-spin">\n          <circle cx="200" cy="105" r="74" stroke="url(#goldStroke)" stroke-width="2.4" stroke-dasharray="10 6 3 6" opacity="0.88" />\n          <circle cx="200" cy="105" r="61" stroke="url(#goldStroke)" stroke-width="1.5" stroke-dasharray="4 5" opacity="0.68" />\n          <polygon points="200,25 205,35 195,35" fill="#fef08a" opacity="0.9" />\n          <polygon points="200,185 205,175 195,175" fill="#fef08a" opacity="0.9" />\n          <polygon points="120,105 130,100 130,110" fill="#fef08a" opacity="0.9" />\n          <polygon points="280,105 270,100 270,110" fill="#fef08a" opacity="0.9" />\n        </g>\n        <circle cx="200" cy="105" r="48" stroke="url(#goldStroke)" stroke-width="1.3" opacity="0.55" />\n        <defs>\n          <radialGradient id="inkGrad" cx="50%" cy="50%" r="56%">\n            <stop offset="0%" stop-color="#5c0c0c" stop-opacity="0.96" />\n            <stop offset="58%" stop-color="#1c1412" stop-opacity="0.93" />\n            <stop offset="100%" stop-color="#090707" stop-opacity="0" />\n          </radialGradient>\n          <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="100%">\n            <stop offset="0%" stop-color="#fffbeb" />\n            <stop offset="45%" stop-color="#fde047" />\n            <stop offset="80%" stop-color="#f59e0b" />\n            <stop offset="100%" stop-color="#b45309" />\n          </linearGradient>\n          <linearGradient id="crimsonWing" x1="0%" y1="0%" x2="100%" y2="0%">\n            <stop offset="0%" stop-color="#ef4444" />\n            <stop offset="100%" stop-color="#f59e0b" />\n          </linearGradient>\n        </defs>\n      </svg>\n      <span class="burst-spark s1"></span>\n      <span class="burst-spark s2"></span>\n      <span class="burst-spark s3"></span>\n      <span class="burst-spark s4"></span>\n      <span class="burst-spark s5"></span>\n      <span class="burst-spark s6"></span>\n      <span class="burst-spark s7"></span>\n      <span class="burst-spark s8"></span>\n      <div class="relative z-10 flex flex-col items-center">\n        <span id="action-burst-seal" class="action-burst-seal serif-cn">锋芒夺子</span>\n        <div id="action-burst-char" class="action-burst-char serif-cn">吃</div>\n        <div id="action-burst-sub" class="action-burst-sub serif-cn">俥吃馬 · 破阵</div>\n      </div>\n    </div>';
    }
    const drawerEl = document.getElementById('vfx-drawer');
    if (drawerEl && !drawerEl.hasChildNodes()) {
      drawerEl.innerHTML = '<div class="md-card brocade-panel rounded-3xl p-3.5 md:p-4 border border-amber-400/60 shadow-2xl">\n      <div class="flex items-center justify-between mb-2.5 px-1">\n        <div class="flex items-center gap-2">\n          <span class="material-symbols-rounded text-red-700 text-[20px]">flare</span>\n          <span class="serif-cn font-black text-slate-900 text-xs md:text-sm">古谱十七杀法 · 绝杀残局演武（点击摆局亲手绝杀）</span>\n        </div>\n        <button onclick="window.gameApp.toggleVFXDrawer(false)"\n          class="md-btn w-7 h-7 rounded-full bg-slate-200/80 hover:bg-slate-300 flex items-center justify-center text-slate-700">\n          <span class="material-symbols-rounded text-[16px]">close</span>\n        </button>\n      </div>\n      <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 max-h-[42vh] overflow-y-auto pr-0.5">\n        <button onclick="window.gameApp.previewUltimateVFX(\'double_chariot\', \'双车错\', \'双车交错 · 裂空斩将\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>⚔️ 双车错</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">双锋交叉斩</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'smothered_palace\', \'闷宫\', \'滚石封宫 · 困死中庭\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>🪨 闷宫</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">巨石坠落封宫</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'royal_gaze\', \'对面笑\', \'金甲神将 · 白脸封喉\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>👑 对面笑</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">帝王金剑斩将</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'double_cannon\', \'重炮\', \'双膛巨炮 · 毁天灭地\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>💣 重炮</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">双管巨炮齐射</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'horse_cannon\', \'马后炮\', \'神驹踏阵 · 巨炮轰顶\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>🐎 马后炮</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">战马火炮协同</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'iron_bolt\', \'铁门栓\', \'朱漆宫门 · 铁栓死锁\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>🚪 铁门栓</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">朱门铁链上栓</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'side_tiger\', \'侧面虎\', \'猛虎扑山 · 裂爪摧城\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>🐅 侧面虎</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">斑斓猛虎撕裂</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'octagon_horse\', \'八角马\', \'明月银枪 · 八角锁阵\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>🌕 八角马</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">明月银枪锁宫</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'fishing_horse\', \'钓鱼马\', \'金钩垂钓 · 碧浪锁将\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>🎣 钓鱼马</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">金钩碧浪收网</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'standing_horse_chariot\', \'列马车\', \'断崖赤日 · 列马斩将\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>🐎 列马车</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">断崖赤日破阵</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'double_check\', \'双将\', \'双将临门 · 金锤破空\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>🛡️ 双将</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">双神锤轰裂</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'chariot_cannon_clamp\', \'夹车炮\', \'玄铁巨钳 · 战车炮轰\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>⚙️ 夹车炮</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">巨钳战车合击</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'trough_horse\', \'卧槽马\', \'赤兔破槽 · 金印踏阵\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>🔥 卧槽马</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">破槽烈焰冲锋</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'smothered_kill\', \'闷杀\', \'玄铁重锤 · 轰然崩塌\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>⛰️ 闷杀</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">重锤铁链轰砸</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'heaven_earth_cannon\', \'天地炮\', \'九天雷火 · 乾坤十字\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>⚡ 天地炮</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">天地十字火柱</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'stalemate_trap\', \'困毙\', \'八卦石碑 · 四面合围\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40">\n          <span>🔒 困毙</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">八卦石阵封死</span>\n        </button>\n        <button onclick="window.gameApp.previewUltimateVFX(\'frost_lotus_strike\', \'海底捞月\', \'沧海映月 · 碧浪涌莲\')"\n          class="md-btn px-2 py-2 rounded-xl bg-slate-900/95 hover:bg-red-950 text-amber-100 text-xs font-bold serif-cn flex flex-col items-center gap-0.5 border border-amber-500/40 col-span-3 sm:col-span-2">\n          <span>🌕 海底捞月 · 碧海涌莲</span>\n          <span class="text-[10px] text-amber-300/80 font-normal">水中映月·冰莲破浪</span>\n        </button>\n      </div>\n    </div>';
    }
  },

  clearCheckmateHighlights() {
    if (!this.checkmateHighlightRings) return;
    for (const ring of this.checkmateHighlightRings) {
      this.scene?.remove(ring);
      this.checkmateVFXGroup?.remove(ring);
      ring.geometry?.dispose?.();
      ring.material?.dispose?.();
    }
    this.checkmateHighlightRings = [];
  },

  showCheckmateHighlights(coords) {
    this.clearCheckmateHighlights();
    if (!coords || !coords.length) return;
    const warnTex = typeof getBoardMarkerTexture === 'function' ? getBoardMarkerTexture('warning') : null;
    const goldTex = typeof getBoardMarkerTexture === 'function' ? getBoardMarkerTexture('selected') : null;

    const seen = new Set();
    coords.forEach((pt, idx) => {
      if (!pt || typeof pt.r !== 'number' || typeof pt.c !== 'number') return;
      const key = `${pt.r}_${pt.c}`;
      if (seen.has(key)) return;
      seen.add(key);
      const pos = gridToWorld(pt.r, pt.c);
      const tex = idx === 0 ? warnTex : goldTex;
      const ring = new THREE.Mesh(
        new THREE.PlaneGeometry(1.24, 1.24),
        new THREE.MeshBasicMaterial({
          map: tex || null,
          color: tex ? 0xffffff : (idx === 0 ? 0xff2222 : 0xfbbf24),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.88,
          depthWrite: false
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(pos.x, 0.028, pos.z);
      this.scene.add(ring);
      this.checkmateHighlightRings.push(ring);
    });
  },

  ensureCheckmateFXCanvas() {
    let canvas = document.getElementById('checkmate-fx-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'checkmate-fx-canvas';
      canvas.className = 'pointer-events-none fixed inset-0 z-30 hidden';
      document.body.appendChild(canvas);
    }
    canvas.style.zIndex = '28';
    canvas.style.pointerEvents = 'none';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(320, window.innerWidth || 1024);
    const h = Math.max(320, window.innerHeight || 768);
    if (canvas.width !== Math.floor(w * dpr) || canvas.height !== Math.floor(h * dpr)) {
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    return { canvas, ctx: canvas.getContext('2d'), w, h, dpr };
  },

  projectWorldToScreen(wx, wy, wz, w, h) {
    if (!this.camera) return { x: w * 0.5, y: h * 0.5 };
    const v = new THREE.Vector3(wx, wy, wz);
    v.project(this.camera);
    return {
      x: (v.x * 0.5 + 0.5) * w,
      y: (-v.y * 0.5 + 0.5) * h
    };
  },

  /**
   * 辅助函数：仅在水平面 (Y轴) 朝向目标点，严禁使用 lookAt 造成 X/Z 轴 180度翻转使得战马或猛虎倒立
   */
  faceTargetHorizontally(obj, tx, tz) {
    if (!obj) return;
    const dx = tx - obj.position.x;
    const dz = tz - obj.position.z;
    if (Math.abs(dx) > 1e-4 || Math.abs(dz) > 1e-4) {
      obj.rotation.set(0, Math.atan2(dx, dz), 0);
    } else {
      obj.rotation.set(0, 0, 0);
    }
  },

  /**

  /**
   * 17 种绝杀专属 3D 全屏 CG 光影调色配置（柔和电影级光感：显著降低初始光效亮度，避免过曝刺眼）
   */
  getVFXAtmosphereProfile(vfxType) {
    const profiles = {
      double_chariot: {
        bgHex: 0x261209,
        fogHex: 0x33180c,
        sunHex: 0xffcf70,
        sunIntensity: 0.62,
        hemiSky: 0xfde68a,
        hemiGround: 0x4a2010,
        hemiIntensity: 0.42,
        pointHex: 0xf97316,
        rimHex: 0xfde047,
        accent: '#f59e0b',
        tintInner: 'rgba(251, 191, 36, 0.03)',
        tintOuter: 'rgba(38, 12, 8, 0.48)',
        cssFilter: 'saturate(1.10) contrast(1.03) brightness(0.92)'
      },
      smothered_palace: {
        bgHex: 0x160f20,
        fogHex: 0x211630,
        sunHex: 0xfbbf24,
        sunIntensity: 0.58,
        hemiSky: 0xfde68a,
        hemiGround: 0x2b1244,
        hemiIntensity: 0.40,
        pointHex: 0xd97706,
        rimHex: 0xc084fc,
        accent: '#fbbf24',
        tintInner: 'rgba(245, 158, 11, 0.03)',
        tintOuter: 'rgba(20, 10, 36, 0.48)',
        cssFilter: 'saturate(1.08) contrast(1.03) brightness(0.91)'
      },
      royal_gaze: {
        bgHex: 0x241307,
        fogHex: 0x341c0b,
        sunHex: 0xffe49e,
        sunIntensity: 0.64,
        hemiSky: 0xfef08a,
        hemiGround: 0x5c280c,
        hemiIntensity: 0.42,
        pointHex: 0xf59e0b,
        rimHex: 0xfef3c7,
        accent: '#fbbf24',
        tintInner: 'rgba(254, 240, 138, 0.03)',
        tintOuter: 'rgba(44, 20, 6, 0.46)',
        cssFilter: 'saturate(1.10) contrast(1.03) brightness(0.92)'
      },
      double_cannon: {
        bgHex: 0x230a08,
        fogHex: 0x33100d,
        sunHex: 0xf97316,
        sunIntensity: 0.62,
        hemiSky: 0xfde047,
        hemiGround: 0x4c1414,
        hemiIntensity: 0.40,
        pointHex: 0xdc2626,
        rimHex: 0xfbbf24,
        accent: '#f97316',
        tintInner: 'rgba(239, 68, 68, 0.03)',
        tintOuter: 'rgba(46, 8, 8, 0.48)',
        cssFilter: 'saturate(1.10) contrast(1.04) brightness(0.91)'
      },
      horse_cannon: {
        bgHex: 0x241008,
        fogHex: 0x34170c,
        sunHex: 0xfb923c,
        sunIntensity: 0.62,
        hemiSky: 0xfde68a,
        hemiGround: 0x4e2010,
        hemiIntensity: 0.42,
        pointHex: 0xea580c,
        rimHex: 0xfde047,
        accent: '#f59e0b',
        tintInner: 'rgba(249, 115, 22, 0.03)',
        tintOuter: 'rgba(42, 10, 8, 0.48)',
        cssFilter: 'saturate(1.10) contrast(1.03) brightness(0.92)'
      },
      iron_bolt: {
        bgHex: 0x121724,
        fogHex: 0x1b2236,
        sunHex: 0xfbbf24,
        sunIntensity: 0.58,
        hemiSky: 0xcbd5e1,
        hemiGround: 0x1e293b,
        hemiIntensity: 0.40,
        pointHex: 0xd97706,
        rimHex: 0x38bdf8,
        accent: '#f59e0b',
        tintInner: 'rgba(251, 191, 36, 0.03)',
        tintOuter: 'rgba(15, 23, 42, 0.48)',
        cssFilter: 'saturate(1.08) contrast(1.03) brightness(0.91)'
      },
      side_tiger: {
        bgHex: 0x58b2f5,
        fogHex: 0x86ccf8,
        sunHex: 0xfffbeb,
        sunIntensity: 0.66,
        hemiSky: 0xe0f2fe,
        hemiGround: 0x22c55e,
        hemiIntensity: 0.48,
        pointHex: 0xf59e0b,
        rimHex: 0xfef08a,
        accent: '#f59e0b',
        tintInner: 'rgba(255, 255, 255, 0.02)',
        tintOuter: 'rgba(12, 42, 24, 0.32)',
        cssFilter: 'saturate(1.10) contrast(1.02) brightness(0.94)'
      },
      octagon_horse: {
        bgHex: 0x5ab4f8,
        fogHex: 0x8ad0fc,
        sunHex: 0xfffbeb,
        sunIntensity: 0.66,
        hemiSky: 0xe0f2fe,
        hemiGround: 0x22c55e,
        hemiIntensity: 0.48,
        pointHex: 0x38bdf8,
        rimHex: 0xfde68a,
        accent: '#38bdf8',
        tintInner: 'rgba(255, 255, 255, 0.02)',
        tintOuter: 'rgba(12, 38, 28, 0.32)',
        cssFilter: 'saturate(1.10) contrast(1.02) brightness(0.94)'
      },
      fishing_horse: {
        bgHex: 0x165b8a,
        fogHex: 0x1d70a8,
        sunHex: 0xe0f2fe,
        sunIntensity: 0.64,
        hemiSky: 0xbae6fd,
        hemiGround: 0x0369a1,
        hemiIntensity: 0.46,
        pointHex: 0x38bdf8,
        rimHex: 0xfde68a,
        accent: '#38bdf8',
        tintInner: 'rgba(56, 189, 248, 0.03)',
        tintOuter: 'rgba(6, 32, 56, 0.42)',
        cssFilter: 'saturate(1.10) contrast(1.03) brightness(0.93)'
      },
      standing_horse_chariot: {
        bgHex: 0x330a0a,
        fogHex: 0x4a1010,
        sunHex: 0xff6b4a,
        sunIntensity: 0.64,
        hemiSky: 0xfca5a5,
        hemiGround: 0x450a0a,
        hemiIntensity: 0.44,
        pointHex: 0xdc2626,
        rimHex: 0xfbbf24,
        accent: '#ef4444',
        tintInner: 'rgba(239, 68, 68, 0.04)',
        tintOuter: 'rgba(48, 8, 8, 0.48)',
        cssFilter: 'saturate(1.12) contrast(1.04) brightness(0.92)'
      },
      double_check: {
        bgHex: 0x241106,
        fogHex: 0x361909,
        sunHex: 0xfacc15,
        sunIntensity: 0.64,
        hemiSky: 0xfef08a,
        hemiGround: 0x4c1d0c,
        hemiIntensity: 0.42,
        pointHex: 0xd97706,
        rimHex: 0xef4444,
        accent: '#fde047',
        tintInner: 'rgba(250, 204, 21, 0.03)',
        tintOuter: 'rgba(44, 16, 6, 0.48)',
        cssFilter: 'saturate(1.10) contrast(1.03) brightness(0.92)'
      },
      chariot_cannon_clamp: {
        bgHex: 0x241307,
        fogHex: 0x341c0b,
        sunHex: 0xf59e0b,
        sunIntensity: 0.62,
        hemiSky: 0xfde68a,
        hemiGround: 0x4e220c,
        hemiIntensity: 0.42,
        pointHex: 0xea580c,
        rimHex: 0xfde047,
        accent: '#f59e0b',
        tintInner: 'rgba(245, 158, 11, 0.03)',
        tintOuter: 'rgba(42, 18, 8, 0.48)',
        cssFilter: 'saturate(1.10) contrast(1.03) brightness(0.92)'
      },
      trough_horse: {
        bgHex: 0x220c08,
        fogHex: 0x33120c,
        sunHex: 0xf59e0b,
        sunIntensity: 0.62,
        hemiSky: 0xfde68a,
        hemiGround: 0x4e1616,
        hemiIntensity: 0.42,
        pointHex: 0xd97706,
        rimHex: 0xef4444,
        accent: '#fbbf24',
        tintInner: 'rgba(251, 191, 36, 0.03)',
        tintOuter: 'rgba(46, 10, 10, 0.48)',
        cssFilter: 'saturate(1.10) contrast(1.03) brightness(0.92)'
      },
      smothered_kill: {
        bgHex: 0x140a1e,
        fogHex: 0x1f102e,
        sunHex: 0xf59e0b,
        sunIntensity: 0.58,
        hemiSky: 0xfde047,
        hemiGround: 0x2a0944,
        hemiIntensity: 0.40,
        pointHex: 0xdc2626,
        rimHex: 0xfbbf24,
        accent: '#f59e0b',
        tintInner: 'rgba(239, 68, 68, 0.03)',
        tintOuter: 'rgba(20, 8, 36, 0.48)',
        cssFilter: 'saturate(1.08) contrast(1.03) brightness(0.91)'
      },
      heaven_earth_cannon: {
        bgHex: 0x5ab4f8,
        fogHex: 0x8cd0ff,
        sunHex: 0xfff7ed,
        sunIntensity: 0.66,
        hemiSky: 0xfef08a,
        hemiGround: 0x22c55e,
        hemiIntensity: 0.46,
        pointHex: 0xea580c,
        rimHex: 0xfde047,
        accent: '#f97316',
        tintInner: 'rgba(249, 115, 22, 0.03)',
        tintOuter: 'rgba(44, 10, 6, 0.42)',
        cssFilter: 'saturate(1.10) contrast(1.03) brightness(0.93)'
      },
      stalemate_trap: {
        bgHex: 0x101824,
        fogHex: 0x192436,
        sunHex: 0xfbbf24,
        sunIntensity: 0.58,
        hemiSky: 0xcbd5e1,
        hemiGround: 0x1e293b,
        hemiIntensity: 0.40,
        pointHex: 0xd97706,
        rimHex: 0x94a3b8,
        accent: '#fbbf24',
        tintInner: 'rgba(251, 191, 36, 0.03)',
        tintOuter: 'rgba(15, 23, 42, 0.48)',
        cssFilter: 'saturate(1.08) contrast(1.03) brightness(0.92)'
      },
      frost_lotus_strike: {
        bgHex: 0x040d1e,
        fogHex: 0x071733,
        sunHex: 0xbae6fd,
        sunIntensity: 0.58,
        hemiSky: 0xe0f2fe,
        hemiGround: 0x082f49,
        hemiIntensity: 0.42,
        pointHex: 0x38bdf8,
        rimHex: 0xfef08a,
        accent: '#38bdf8',
        tintInner: 'rgba(56, 189, 248, 0.03)',
        tintOuter: 'rgba(4, 14, 30, 0.52)',
        cssFilter: 'saturate(1.10) contrast(1.03) brightness(0.92)'
      }
    };
    return profiles[vfxType] || profiles.double_chariot;
  },

  /**
   * 缓存原场景（棋盘、棋案、竹林/战场/书房环境、全部棋子）的材质与位置状态，
   * 以便在全屏 CG 绝杀场景浮现时平滑渐隐原棋盘与桌子，并在切回终局棋面时 100% 无损复原！
   */
  captureOriginalWorldSnapshot(participatingMeshes = []) {
    this.restoreOriginalWorldSnapshot();
    const partSet = new Set(participatingMeshes.filter(Boolean));
    const matMap = new Map();
    const groupState = [];
    const pieceState = [];
    const clonedPieceMaterials = [];

    const recordMat = (mat) => {
      if (!mat || matMap.has(mat)) return;
      matMap.set(mat, {
        transparent: Boolean(mat.transparent),
        opacity: typeof mat.opacity === 'number' ? mat.opacity : 1.0,
        depthWrite: typeof mat.depthWrite === 'boolean' ? mat.depthWrite : true
      });
    };

    const recordGroup = (grp) => {
      if (!grp) return;
      groupState.push({
        grp,
        visible: grp.visible,
        y: grp.position.y,
        scale: grp.scale.clone()
      });
      grp.traverse?.((obj) => {
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(recordMat);
          else recordMat(obj.material);
        }
      });
    };

    recordGroup(this.boardGroup);
    recordGroup(this.markersGroup);
    if (this.currentSceneId === 'ancient_battlefield') {
      recordGroup(this.battlefieldGroup);
    } else if (this.currentSceneId === 'imperial_study') {
      recordGroup(this.studyGroup);
    } else {
      recordGroup(this.parkGroup);
    }

    const ringRefs = [
      this.selectedRing,
      this.lastFromRing,
      this.lastToRing,
      ...(this.checkmateHighlightRings || [])
    ].filter(Boolean);
    ringRefs.forEach(r => {
      groupState.push({
        grp: r,
        visible: r.visible,
        y: r.position.y,
        scale: r.scale.clone(),
        isRing: true
      });
      if (r.material) recordMat(r.material);
    });

    if (this.pieceMeshes) {
      for (const mesh of this.pieceMeshes.values()) {
        if (!mesh) continue;
        const isParticipant = partSet.has(mesh);
        const origMaterials = [];
        mesh.children.forEach((ch) => {
          origMaterials.push({ child: ch, mat: ch.material });
        });

        // 为参演棋子独立克隆材质，使得参演棋子在平滑变身/发光/淡出时绝不影响棋盘上其余同色棋子
        if (isParticipant) {
          mesh.children.forEach((ch) => {
            if (ch.material && typeof ch.material.clone === 'function') {
              const cloned = ch.material.clone();
              ch.material = cloned;
              clonedPieceMaterials.push(cloned);
            }
          });
        } else {
          mesh.children.forEach((ch) => {
            if (ch.material) recordMat(ch.material);
          });
        }

        pieceState.push({
          mesh,
          isParticipant,
          pos: mesh.position.clone(),
          rot: mesh.rotation.clone(),
          scale: mesh.scale.clone(),
          visible: mesh.visible,
          origMaterials
        });
      }
    }

    this._vfxWorldSnapshot = {
      partSet,
      matMap,
      groupState,
      pieceState,
      clonedPieceMaterials,
      lastBoardWeight: 1.0
    };
  },

  /**
   * 实时设置原棋盘、桌子、原环境及非参演棋子的显现权重 (boardWeight: 1 = 完全显示原棋盘, 0 = 完全隐去原棋盘)
   */
  setOriginalWorldVisibilityWeight(boardWeight) {
    const snap = this._vfxWorldSnapshot;
    if (!snap) return;
    const w = Math.max(0, Math.min(1, boardWeight));
    snap.lastBoardWeight = w;

    for (const [mat, orig] of snap.matMap.entries()) {
      if (w >= 0.992) {
        mat.transparent = orig.transparent;
        mat.opacity = orig.opacity;
        mat.depthWrite = orig.depthWrite;
      } else {
        mat.transparent = true;
        mat.opacity = orig.opacity * w;
        mat.depthWrite = w > 0.45 ? orig.depthWrite : false;
      }
    }

    for (const gs of snap.groupState) {
      const { grp, visible, y, isRing } = gs;
      if (!grp) continue;
      if (isRing) {
        grp.visible = visible && w > 0.06;
      } else if (grp === this.boardGroup) {
        grp.visible = visible && w > 0.015;
        grp.position.y = y - (1 - w) * 0.72;
      } else {
        grp.visible = visible && w > 0.02;
        grp.position.y = y - (1 - w) * 1.45;
      }
    }

    for (const ps of snap.pieceState) {
      if (ps.isParticipant) continue;
      const m = ps.mesh;
      if (!m) continue;
      m.visible = ps.visible && w > 0.02;
      m.position.set(ps.pos.x, ps.pos.y - (1 - w) * 0.72, ps.pos.z);
      const sc = 0.88 + 0.12 * w;
      m.scale.set(ps.scale.x * sc, ps.scale.y * sc, ps.scale.z * sc);
    }
  },

  /**
   * 100% 还原原棋盘、桌子、原环境与所有终局棋子的材质、坐标、旋转与缩放
   */
  restoreOriginalWorldSnapshot() {
    const snap = this._vfxWorldSnapshot;
    if (!snap) return;
    for (const [mat, orig] of snap.matMap.entries()) {
      mat.transparent = orig.transparent;
      mat.opacity = orig.opacity;
      mat.depthWrite = orig.depthWrite;
    }
    for (const gs of snap.groupState) {
      if (!gs.grp) continue;
      gs.grp.visible = gs.visible;
      gs.grp.position.y = gs.y;
      gs.grp.scale.copy(gs.scale);
    }
    for (const ps of snap.pieceState) {
      const m = ps.mesh;
      if (!m) continue;
      ps.origMaterials.forEach(({ child, mat }) => {
        if (child && mat) child.material = mat;
      });
      m.visible = ps.visible;
      m.position.copy(ps.pos);
      m.rotation.copy(ps.rot);
      m.scale.copy(ps.scale);
      m.renderOrder = 0;
      m.children.forEach((ch) => { ch.renderOrder = 0; });
      if (m.userData?.bodyMat) {
        m.userData.bodyMat.emissive.setHex(0x000000);
        m.userData.bodyMat.emissiveIntensity = 0.0;
      }
      if (m.userData?.topDisc?.material?.emissive) {
        m.userData.topDisc.material.emissive.setHex(0x000000);
        m.userData.topDisc.material.emissiveIntensity = 0.0;
      }
    }
    if (snap.clonedPieceMaterials) {
      snap.clonedPieceMaterials.forEach(cm => cm.dispose?.());
    }
    this._vfxWorldSnapshot = null;
  },

  /**
   * 围绕棋子几何中心 (0, height/2, 0) 设置 3D 姿态、缩放与透明度，
   * 确保棋子在空中多轴自转、翻转至反面（rx = Math.PI）或放大缩小时平滑自然，绝不穿模下陷
   */
  setPiece3DPose(mesh, x, y, z, rx = 0, ry = 0, rz = 0, scale = 1.0, opacity = 1.0, glowIntensity = 0.0, glowHex = 0xf59e0b) {
    if (!mesh) return;
    const safeAlpha = Number.isFinite(opacity) ? opacity : 1.0;
    const clampedAlpha = Math.max(0, Math.min(1, safeAlpha));
    if (clampedAlpha <= 0.01) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    mesh.renderOrder = 25;
    const rawSx = Array.isArray(scale) ? scale[0] : scale;
    const rawSy = Array.isArray(scale) ? scale[1] : scale;
    const rawSz = Array.isArray(scale) ? scale[2] : scale;
    const sx = Number.isFinite(rawSx) ? rawSx : 1.0;
    const sy = Number.isFinite(rawSy) ? rawSy : 1.0;
    const sz = Number.isFinite(rawSz) ? rawSz : 1.0;
    const sRx = Number.isFinite(rx) ? rx : 0;
    const sRy = Number.isFinite(ry) ? ry : 0;
    const sRz = Number.isFinite(rz) ? rz : 0;
    const sX = Number.isFinite(x) ? x : 0;
    const sY = Number.isFinite(y) ? y : 0;
    const sZ = Number.isFinite(z) ? z : 0;
    mesh.scale.set(sx, sy, sz);
    mesh.rotation.set(sRx, sRy, sRz);

    // 棋子本地圆柱几何中心位于 (0, 0.175, 0)，补偿旋转带来的中心偏移
    const halfH = 0.175 * sy;
    const localMid = new THREE.Vector3(0, halfH, 0).applyEuler(mesh.rotation);
    mesh.position.set(sX - localMid.x, sY + halfH - localMid.y, sZ - localMid.z);

    const wantTrans = clampedAlpha < 0.995;
    mesh.children.forEach((ch) => {
      ch.renderOrder = 25;
      const mat = ch.material;
      if (!mat) return;
      if (mat.transparent !== wantTrans) {
        mat.transparent = wantTrans;
        mat.needsUpdate = true;
      }
      mat.opacity = wantTrans ? clampedAlpha : 1.0;
      mat.depthWrite = clampedAlpha > 0.25;
      mat.depthTest = true;
    });
    const bodyChild = mesh.children[0];
    if (bodyChild?.material?.emissive) {
      bodyChild.material.emissive.setHex(glowIntensity > 0.01 ? glowHex : 0x000000);
      bodyChild.material.emissiveIntensity = glowIntensity;
    }
    const topDiscChild = mesh.userData?.topDisc || mesh.children[3];
    if (topDiscChild?.material?.emissive) {
      topDiscChild.material.emissive.setHex(glowIntensity > 0.01 ? glowHex : 0x000000);
      topDiscChild.material.emissiveIntensity = glowIntensity * 0.36;
    }
  },

  clearCheckmateVFX() {
    this.sfx?.stopAllVFXSounds?.();
    this._vfxCustomColorGrading = false;
    this.restoreOriginalWorldSnapshot();
    this.clearCheckmateHighlights();
    if (this._activeCheckerMeshes && this._activeCheckerMeshes.length > 0) {
      for (const item of this._activeCheckerMeshes) {
        if (item.mesh && item.basePos) {
          item.mesh.visible = true;
          item.mesh.position.copy(item.basePos);
          item.mesh.rotation.set(0, 0, 0);
          item.mesh.scale.set(1, 1, 1);
          if (item.mesh.userData?.bodyMat) {
            item.mesh.userData.bodyMat.emissive.setHex(0x000000);
            item.mesh.userData.bodyMat.emissiveIntensity = 0.0;
          }
        }
      }
      this._activeCheckerMeshes = [];
    }
    if (this._activeCheckerMesh && this._activeCheckerBasePos) {
      this._activeCheckerMesh.visible = true;
      this._activeCheckerMesh.position.copy(this._activeCheckerBasePos);
      this._activeCheckerMesh.rotation.set(0, 0, 0);
      this._activeCheckerMesh.scale.set(1, 1, 1);
      this._activeCheckerMesh = null;
      this._activeCheckerBasePos = null;
    }
    if (this._savedCamBeforeVFX) {
      this.desiredSpherical = { ...this._savedCamBeforeVFX.spherical };
      this.camTarget.copy(this._savedCamBeforeVFX.target);
      this._savedCamBeforeVFX = null;
    }
    const fxCanvas = document.getElementById('checkmate-fx-canvas');
    if (fxCanvas) {
      const ctx = fxCanvas.getContext('2d');
      ctx?.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
      fxCanvas.classList.add('hidden');
    }
    if (this.container) {
      this.container.style.filter = '';
      this.container.style.transform = '';
    }
    if (this.checkmateVFXGroup) {
      while (this.checkmateVFXGroup.children.length > 0) {
        const child = this.checkmateVFXGroup.children[0];
        this.checkmateVFXGroup.remove(child);
        child.traverse?.(obj => {
          obj.geometry?.dispose?.();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose?.());
          else obj.material?.dispose?.();
        });
      }
    }
    this.checkmateVFXAnimations = [];
    this.vfxAtmosphereTimer = 0;
    this.vfxAtmosphereDuration = 0;
    if (this.scene && this.sunLight && this.hemiLight) {
      const sc = this.getActiveSceneConfig?.() || {
        bgHex: 0xdbe9dc,
        sunColor: 0xfff8eb,
        sunIntensity: 0.88,
        hemiSky: 0xfffdf6,
        hemiGround: 0x5c7a58,
        hemiIntensity: 0.62
      };
      this.scene.background.setHex(sc.bgHex);
      if (this.scene.fog) this.scene.fog.color.setHex(sc.bgHex);
      this.sunLight.color.setHex(sc.sunColor || 0xfff8eb);
      this.sunLight.intensity = sc.sunIntensity || 0.88;
      this.hemiLight.color.setHex(sc.hemiSky || 0xfffdf6);
      this.hemiLight.groundColor.setHex(sc.hemiGround || 0x5c7a58);
      this.hemiLight.intensity = sc.hemiIntensity || 0.62;
    }
  },

  toggleVFXDrawer(forceState) {
    if (this.onlineRole && forceState !== false) {
      this.showCenterCallout('联机中不可演武绝杀', this.onlineRole);
      return;
    }
    this.ensureVFXDOMTemplates?.();
    const drawer = document.getElementById('vfx-drawer');
    if (!drawer) return;
    const willShow = typeof forceState === 'boolean' ? forceState : drawer.classList.contains('hidden');
    drawer.classList.toggle('hidden', !willShow);
    if (willShow) this.sfx.playSelect();
  },

  /**
   * 十七大古谱杀法 · 一步绝杀交互演武残局库
   * 点击「绝杀演武」中的任一杀法按钮后，棋盘立即布设为对应的经典一步绝杀残局，
   * 供玩家亲手走出致命一击并触发对应的全屏 3D 绝杀动画！
   */
  getCheckmateEndgameDrill(vfxType) {
    if (vfxType === 'sea_bottom_moon') vfxType = 'frost_lotus_strike';
    const drills = {
      double_chariot: {
        fen: '4k4/1R7/9/2R6/9/9/9/4B4/4A4/3AK4 w',
        move: { fr: 3, fc: 2, tr: 0, tc: 2 },
        hintText: '俥七进三 · 双车交替锁喉绝杀'
      },
      smothered_palace: {
        fen: '3ka4/3pa4/3p5/9/1N7/9/9/4B4/4A4/4K4 w',
        move: { fr: 4, fc: 1, tr: 2, tc: 2 },
        hintText: '傌八进七 · 乘士塞路闷宫绝杀'
      },
      royal_gaze: {
        fen: '3kp4/3p5/9/3R5/9/9/9/4B4/4A4/3K5 w',
        move: { fr: 3, fc: 3, tr: 1, tc: 3 },
        hintText: '俥六进二 · 借帅助威对面笑绝杀'
      },
      double_cannon: {
        fen: '3akab2/3r1r3/9/4C4/9/9/2C6/4B4/4A4/3AK4 w',
        move: { fr: 6, fc: 2, tr: 6, tc: 4 },
        hintText: '炮七平五 · 双炮叠阵轰门绝杀'
      },
      horse_cannon: {
        fen: '4k4/9/b3N4/9/9/2C6/9/4B4/4A4/3AK4 w',
        move: { fr: 5, fc: 2, tr: 5, tc: 4 },
        hintText: '炮七平五 · 骏马控宫马后炮绝杀'
      },
      iron_bolt: {
        fen: '3ak4/4n4/9/4p4/8R/9/4C4/4B4/4A4/5K3 w',
        move: { fr: 4, fc: 8, tr: 0, tc: 8 },
        hintText: '俥一进四 · 中炮镇轴铁门栓绝杀'
      },
      side_tiger: {
        fen: '4k4/4p4/4p1N2/9/7R1/9/9/4B4/4A4/3K5 w',
        move: { fr: 4, fc: 7, tr: 0, tc: 7 },
        hintText: '俥二进四 · 虎踞侧翼车马绝杀'
      },
      octagon_horse: {
        fen: '3k5/9/5N3/9/2R6/9/9/4B4/4A4/3AK4 w',
        move: { fr: 4, fc: 2, tr: 0, tc: 2 },
        hintText: '俥七进四 · 八角定马车马联杀'
      },
      fishing_horse: {
        fen: '4ka3/4p4/2N1p4/9/R8/9/9/4B4/4A4/3AK4 w',
        move: { fr: 4, fc: 0, tr: 0, tc: 0 },
        hintText: '俥九进四 · 高钓锁将长车沉底'
      },
      standing_horse_chariot: {
        fen: 'R2pka3/9/2N6/9/9/9/9/4B4/4A4/3AK4 w',
        move: { fr: 0, fc: 0, tr: 0, tc: 3 },
        hintText: '俥九平六 · 天驹护车贴身斩将'
      },
      double_check: {
        fen: '3aka3/9/4N4/4p4/9/9/4C4/4B4/4A4/3AK4 w',
        move: { fr: 2, fc: 4, tr: 1, tc: 2 },
        hintText: '傌五进七 · 拔簧闪击马炮双将'
      },
      chariot_cannon_clamp: {
        fen: '4a4/3ak4/4pR3/4p4/1C7/9/9/4B4/4A4/3AK4 w',
        move: { fr: 4, fc: 1, tr: 1, tc: 1 },
        hintText: '炮八进三 · 车炮交相夹击绝杀'
      },
      trough_horse: {
        fen: '3ak4/3ra4/4N4/5R3/9/9/9/4B4/4A4/3AK4 w',
        move: { fr: 2, fc: 4, tr: 1, tc: 6 },
        hintText: '傌五进三 · 良驹跃槽强车锁门'
      },
      smothered_kill: {
        fen: '3akr3/4a4/3p1p3/9/2C6/9/9/4B4/4A4/3AK4 w',
        move: { fr: 4, fc: 2, tr: 4, tc: 4 },
        hintText: '炮七平五 · 九宫闭塞隔山闷杀'
      },
      heaven_earth_cannon: {
        fen: '3ak4/3rn4/9/1C2p4/9/9/4C4/4B4/4A4/5K3 w',
        move: { fr: 3, fc: 1, tr: 0, tc: 1 },
        hintText: '炮八进三 · 天门地户十字绝杀'
      },
      stalemate_trap: {
        fen: '3k5/5P3/9/9/9/9/9/4B4/4A4/4K4 w',
        move: { fr: 1, fc: 5, tr: 1, tc: 4 },
        hintText: '兵四平五 · 四面合围欠行困毙'
      },
      frost_lotus_strike: {
        fen: '4k1P2/4r4/9/4R4/5R3/9/9/9/4A4/3K5 w',
        move: { fr: 0, fc: 6, tr: 0, tc: 5 },
        hintText: '兵三平四 · 沉底逼宫海底捞月'
      }
    };
    return drills[vfxType] || drills.double_chariot;
  },

  previewUltimateVFX(vfxType, title, badge, stampText = '') {
    if (vfxType === 'sea_bottom_moon') vfxType = 'frost_lotus_strike';
    if (this.onlineRole) {
      this.showCenterCallout('联机对局中不可切换演武残局', this.onlineRole);
      return;
    }
    this.toggleVFXDrawer(false);
    this.closeModalOnly();
    this.hideCycleWarningBanner?.();
    this.hideIllegalMovePrompt?.();

    const drill = this.getCheckmateEndgameDrill(vfxType);
    const meta = (typeof CheckmateClassifier !== 'undefined' && CheckmateClassifier.getMetaByType)
      ? CheckmateClassifier.getMetaByType(vfxType)
      : { name: title || '绝杀', title: title || '绝杀', badge: badge || '绝杀演武', vfxType };

    const patternName = title || meta.name || '绝杀';
    this.variantMode = 'xiangqi';
    if (this.engine) this.engine.variantMode = 'xiangqi';
    this.activeDrillVfxType = vfxType;
    this.activeDrillWinningMove = drill.move;

    if (typeof this.loadBoardFromFEN === 'function') {
      this.loadBoardFromFEN(drill.fen, { isCustomEndgame: true });
    }

    // 预选中致胜棋子并展示其合法落点，方便玩家直接点击目标格完成一步绝杀
    if (drill.move && this.engine?.board?.[drill.move.fr]?.[drill.move.fc]) {
      const { fr, fc } = drill.move;
      this.selectedSquare = { r: fr, c: fc };
      this.legalMovesForSelected = this.engine.getLegalMoves(fr, fc);
      this.showLegalMoveIndicators?.(fr, fc, this.legalMovesForSelected);
    }

    this.sfx?.playSelect?.();
    this.showCenterCallout(
      `【${patternName}】一步绝杀残局 · ${drill.hintText}`,
      RED,
      '绝杀演武'
    );
  },

  replayCheckmateVFX() {
    if (!this.lastCheckmatePattern) return;
    this.closeModalOnly();
    this.triggerCheckmateVFX(this.lastCheckmatePattern, this.lastWinnerColor);
  },

  triggerScreenFlash() {
    const flashEl = document.getElementById('vfx-screen-flash');
    if (!flashEl) return;
    flashEl.classList.remove('vfx-flash-active');
    void flashEl.offsetWidth;
    flashEl.classList.add('vfx-flash-active');
  },

  drawImperialTopCinematicBar(ctx, cx, topY, subBannerText, alpha = 1, accentColor = '#f59e0b') {
    if (alpha <= 0.01 || !subBannerText) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, topY);

    const barW = Math.min(520, window.innerWidth * 0.86);
    const barH = 36;
    const grad = ctx.createLinearGradient(-barW * 0.5, 0, barW * 0.5, 0);
    grad.addColorStop(0, 'rgba(15, 23, 42, 0)');
    grad.addColorStop(0.18, 'rgba(18, 12, 10, 0.85)');
    grad.addColorStop(0.5, 'rgba(56, 14, 14, 0.92)');
    grad.addColorStop(0.82, 'rgba(18, 12, 10, 0.85)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(-barW * 0.5, -barH * 0.5, barW, barH);

    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-barW * 0.38, -barH * 0.5);
    ctx.lineTo(barW * 0.38, -barH * 0.5);
    ctx.moveTo(-barW * 0.38, barH * 0.5);
    ctx.lineTo(barW * 0.38, barH * 0.5);
    ctx.stroke();

    ctx.font = 'bold 14px "XiangqiCalligraphy", "Noto Serif SC", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fef3c7';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.fillText(`◆  ${subBannerText}  ◆`, 0, 1, barW * 0.90);
    ctx.restore();
  },

  drawImperialBrushTitle(ctx, cx, cy, text, fontSize, slamScale = 1, alpha = 1, subText = '', accentColor = '#f59e0b', colorPhase = 1) {
    if (alpha <= 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.scale(slamScale, slamScale);

    const chars = String(text || '绝杀').split('');
    const spacing = fontSize * 1.05;
    const totalW = (chars.length - 1) * spacing;

    const glowW = totalW + fontSize * 2.0;
    const glowGrad = ctx.createRadialGradient(0, 0, fontSize * 0.08, 0, 0, glowW * 0.55);
    const isCyanPhase = colorPhase < 0.45;
    glowGrad.addColorStop(0, isCyanPhase ? 'rgba(56, 189, 248, 0.24)' : 'rgba(245, 158, 11, 0.22)');
    glowGrad.addColorStop(0.55, isCyanPhase ? 'rgba(14, 116, 144, 0.10)' : 'rgba(180, 83, 9, 0.10)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, glowW * 0.55, fontSize * 0.62, -0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.strokeStyle = isCyanPhase ? '#7dd3fc' : '#fef08a';
    ctx.shadowColor = isCyanPhase ? '#0284c7' : accentColor;
    ctx.shadowBlur = 12;
    ctx.lineWidth = Math.max(2.5, fontSize * 0.04);
    ctx.beginPath();
    ctx.moveTo(-glowW * 0.44, fontSize * 0.34);
    ctx.quadraticCurveTo(0, fontSize * 0.50, glowW * 0.46, fontSize * 0.20);
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 ${fontSize}px "XiangqiCalligraphy", "STKaiti", "Kaiti SC", "KaiTi", "Noto Serif SC", "Songti SC", serif`;

    chars.forEach((ch, idx) => {
      const ox = idx * spacing - totalW * 0.5;
      const oy = (idx % 2 === 0 ? -2.5 : 2.5);
      ctx.save();
      ctx.translate(ox, oy);
      ctx.rotate((idx - (chars.length - 1) * 0.5) * 0.028 - 0.025);

      for (let d = 6; d >= 1; d--) {
        ctx.fillStyle = isCyanPhase
          ? (d > 3 ? '#082f49' : '#0369a1')
          : (d > 3 ? '#270e04' : '#78350f');
        ctx.fillText(ch, d * 1.3, d * 1.8);
      }

      ctx.shadowColor = 'rgba(0, 0, 0, 0.90)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 5;
      ctx.lineWidth = Math.max(5, fontSize * 0.09);
      ctx.strokeStyle = isCyanPhase ? '#082f49' : '#3b1106';
      ctx.strokeText(ch, 0, 0);

      ctx.shadowColor = isCyanPhase ? '#38bdf8' : accentColor;
      ctx.shadowBlur = 14;
      const g = ctx.createLinearGradient(0, -fontSize * 0.50, 0, fontSize * 0.50);
      if (isCyanPhase) {
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.35, '#bae6fd');
        g.addColorStop(0.75, '#38bdf8');
        g.addColorStop(1, '#0284c7');
      } else {
        g.addColorStop(0, '#fffef0');
        g.addColorStop(0.28, '#fef08a');
        g.addColorStop(0.65, '#f59e0b');
        g.addColorStop(1, '#b45309');
      }
      ctx.fillStyle = g;
      ctx.fillText(ch, 0, 0);

      ctx.lineWidth = Math.max(1.5, fontSize * 0.022);
      ctx.strokeStyle = isCyanPhase ? '#e0f2fe' : '#fffbeb';
      ctx.strokeText(ch, -1, -1.5);
      ctx.restore();
    });

    if (subText) {
      const subSize = Math.max(13, Math.round(fontSize * 0.22));
      ctx.font = `bold ${subSize}px "XiangqiCalligraphy", "Noto Serif SC", serif`;
      ctx.fillStyle = '#fef3c7';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 10;
      ctx.fillText(`◆ ${subText} ◆`, 0, fontSize * 0.78, Math.max(220, glowW * 0.92));
    }
    ctx.restore();
  },

  /**
   * 十七大绝杀动画节奏变速控制器 (Rhythm-Based Dynamic Speed Modulation Engine)
   * 支持所有绝杀动画按照各自戏剧张力节奏自动「蓄力/对峙/拼装慢放 + 突进/劈斩/轰击快放」，
   * 并可通过 this.vfxPlaybackSpeedMultiplier 全局调节快慢倍率。
   */
  getVFXRhythmProfile(vfxType) {
    const profiles = {
      // 天地炮：仰视太阳与圆周云环散开慢放 -> 中心碎片砸地遮屏快放 -> 远小近大陨石雨加速 -> 终局熔岩球自身气浪变亮、地震飞石与渐变全白凝重慢放
      heaven_earth_cannon: {
        totalDuration: 13.80,
        stage2End: 12.60,
        knots: [
          [0.00, 0.00],
          [0.10, 0.09],
          [0.24, 0.22],
          [0.44, 0.39], // 0.24->0.44 慢放 (0.85x): 从容展示白色太阳位于圆周云环中间、变熔岩球缓缓下坠且云朵沿圆周缓缓散开
          [0.49, 0.472], // 0.44->0.49 快放 (1.64x): 大碎片极速穿过屏幕中心砸中近处地板掀起气浪和石块遮屏切镜！
          [0.72, 0.74], // 0.49->0.72 紧凑加速 (1.17x): 64颗远小近大碎片雨密集砸落、激起小石子与连续地震震屏
          [0.84, 0.82], // 0.72->0.84 慢放 (0.67x): 近景巨型熔岩球压顶落地、气浪从熔岩球自身变亮并激起大地震与满屏飞石
          [1.00, 1.00]  // 0.84->1.00 渐进全白 (1.12x): 整个屏幕在飞石与气浪中慢慢到全白
        ]
      },
      // 双将：飞掷升空快 -> 空中飞行调姿对齐与多部件机械拼装慢放特写 -> 雷霆垂直坠落劈斩快放
      double_check: {
        totalDuration: 7.50,
        stage2End: 6.40,
        knots: [
          [0.00, 0.00],
          [0.18, 0.20], // 掷出旋转升空 (1.11x)
          [0.34, 0.33], // 空中减速调整姿态对齐慢放 (0.81x)
          [0.68, 0.61], // 多部件机械拼装特写慢放 (0.82x)，清晰展现双武器合拢与剑芯/护手/六翼/剑首组装
          [0.78, 0.76], // 巨剑雷霆下劈极速快放 (1.50x)
          [1.00, 1.00]
        ]
      },
      // 卧槽马：对波僵持慢放 -> 化马蓄力慢放 -> 铁骑冲锋撞飞快放
      trough_horse: {
        totalDuration: 7.10,
        stage2End: 6.00,
        knots: [
          [0.00, 0.00],
          [0.14, 0.16],
          [0.44, 0.40], // 气功波对峙僵持慢放 (0.80x)
          [0.58, 0.54], // 化为战马昂首蓄力
          [0.74, 0.78], // 烈焰冲锋撞飞快放 (1.50x)
          [1.00, 1.00]
        ]
      },
      // 夹车炮：空中变形组装慢放 -> 落地炮击快放
      chariot_cannon_clamp: {
        totalDuration: 7.20,
        stage2End: 6.10,
        knots: [
          [0.00, 0.00],
          [0.20, 0.22],
          [0.58, 0.54], // 战车与巨炮机械组装对接慢放 (0.84x)
          [0.76, 0.78], // 重炮轰击快放 (1.33x)
          [1.00, 1.00]
        ]
      },
      // 双车错：战车变形慢放 -> 双车交错斩击快放
      double_chariot: {
        totalDuration: 6.90,
        stage2End: 5.80,
        knots: [
          [0.00, 0.00],
          [0.36, 0.30], // 化车蓄势慢放 (0.83x)
          [0.64, 0.72], // 双车交错冲杀快放 (1.50x)
          [1.00, 1.00]
        ]
      },
      // 侧面虎：化虎蓄势慢放 -> 猛虎扑咬快放
      side_tiger: {
        totalDuration: 6.90,
        stage2End: 5.80,
        knots: [
          [0.00, 0.00],
          [0.38, 0.32], // 猛虎威压慢放 (0.84x)
          [0.66, 0.74], // 猛虎飞扑撕裂快放 (1.50x)
          [1.00, 1.00]
        ]
      }
    };

    return profiles[vfxType] || {
      totalDuration: 6.80,
      stage2End: 5.70,
      knots: [
        [0.00, 0.00],
        [0.35, 0.29], // 前段亮相蓄力微慢放 (0.83x)
        [0.70, 0.75], // 中段绝杀爆发快放 (1.31x)
        [1.00, 1.00]  // 尾段余韵收束 (0.83x)
      ]
    };
  },

  applyVFXRhythmTimeWarp(vfxType, rawP) {
    const clamped = Math.max(0, Math.min(1, rawP));
    const prof = this.getVFXRhythmProfile(vfxType);
    const knots = prof.knots;
    for (let i = 0; i < knots.length - 1; i++) {
      const [t0, p0] = knots[i];
      const [t1, p1] = knots[i + 1];
      if (clamped >= t0 && clamped <= t1) {
        const span = Math.max(1e-5, t1 - t0);
        const localU = (clamped - t0) / span;
        // 使用平滑余弦混合，保证分段节点处速度连续不突兀
        const smoothU = localU * 0.78 + (0.5 - 0.5 * Math.cos(localU * Math.PI)) * 0.22;
        const warpedP = p0 + (p1 - p0) * smoothU;
        const avgSlope = (p1 - p0) / span;
        return { p: Math.max(0, Math.min(1, warpedP)), rate: Math.max(0.35, Math.min(2.4, avgSlope)) };
      }
    }
    return { p: clamped, rate: 1.0 };
  },

  triggerCheckmateVFX(pattern, winnerColor) {
    this.clearCheckmateVFX();
    if (pattern && Array.isArray(pattern.highlightCoords) && pattern.highlightCoords.length > 0) {
      this.showCheckmateHighlights(pattern.highlightCoords);
    }
    this.lastCheckmatePattern = pattern;
    this.lastWinnerColor = winnerColor;

    const vfxType = (pattern.vfxType === 'sea_bottom_moon' ? 'frost_lotus_strike' : pattern.vfxType) || 'frost_lotus_strike';
    const stampTitle = pattern.stampText || (pattern.title || '绝杀').replace(/\s*·.*$/, '');
    const subBannerText = pattern.subBanner || pattern.badge || '古谱名局杀法 · 雷霆绝杀';
    const atmos = this.getVFXAtmosphereProfile(vfxType);

    this.sfx.playCheckmateVFXSound(vfxType);

    const rhythmProf = this.getVFXRhythmProfile(vfxType);
    const speedScale = Math.max(0.5, Math.min(2.0, Number(this.vfxPlaybackSpeedMultiplier) || 1.0));
    const TOTAL_DURATION = (rhythmProf.totalDuration || 6.80) / speedScale;
    const STAGE1_END = 0.45 / speedScale;
    const STAGE2_END = (rhythmProf.stage2End || 5.70) / speedScale;
    this.vfxAtmosphereDuration = TOTAL_DURATION;
    this.vfxAtmosphereTimer = TOTAL_DURATION;
    this._vfxCustomColorGrading = true;

    const kCoord = pattern.kingCoord || { r: 0, c: 4 };
    const rCoord = pattern.royalCoord || { r: 9, c: 4 };
    const kPosRaw = gridToWorld(kCoord.r, kCoord.c);
    const rPosRaw = gridToWorld(rCoord.r, rCoord.c);
    const kPos = new THREE.Vector3(kPosRaw.x, 0, kPosRaw.z);
    const rPos = new THREE.Vector3(rPosRaw.x, 0, rPosRaw.z);
    const lastRec = this.engine?.history?.[this.engine.history.length - 1];
    const checker = (pattern.checkers && pattern.checkers[0])
      ? pattern.checkers[0]
      : (lastRec?.move ? { r: lastRec.move.tr, c: lastRec.move.tc, char: lastRec.piece?.char || '俥' } : { r: Math.min(9, kCoord.r + 2), c: kCoord.c, char: '俥' });
    const cPosRaw = gridToWorld(checker.r, checker.c);
    const cPos = new THREE.Vector3(cPosRaw.x, 0, cPosRaw.z);

    this._activeCheckerMeshes = [];
    const highlightList = Array.isArray(pattern.highlightCoords) && pattern.highlightCoords.length > 0
      ? pattern.highlightCoords
      : [checker, kCoord];

    const addInteractivePieceByCoord = (coord, forceRole = null) => {
      if (!coord || typeof coord.r !== 'number' || typeof coord.c !== 'number') return;
      const p = this.engine?.board?.[coord.r]?.[coord.c];
      const m = p ? this.pieceMeshes.get(p.id) : null;
      if (m && !this._activeCheckerMeshes.some(x => x.mesh === m)) {
        const isKing = forceRole === 'king' || (p.type === 'k' && p.color !== winnerColor);
        const isAttacker = p.color === winnerColor;
        this._activeCheckerMeshes.push({
          mesh: m,
          piece: p,
          coord: { r: coord.r, c: coord.c },
          basePos: new THREE.Vector3(m.position.x, 0, m.position.z),
          isKing,
          isAttacker,
          customDriven: false
        });
      }
    };

    addInteractivePieceByCoord(kCoord, 'king');
    if (!this._activeCheckerMeshes.some(x => x.isKing) && this.engine?.board) {
      for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 9; c++) {
          const p = this.engine.board[r][c];
          if (p && p.type === 'k' && p.color !== winnerColor) {
            addInteractivePieceByCoord({ r, c }, 'king');
          }
        }
      }
    }
    if (Array.isArray(pattern.checkers)) {
      pattern.checkers.forEach(ch => addInteractivePieceByCoord(ch));
    }
    highlightList.forEach(coord => addInteractivePieceByCoord(coord));
    if (vfxType === 'royal_gaze') {
      addInteractivePieceByCoord(rCoord);
    }

    const kingItem = this._activeCheckerMeshes.find(x => x.isKing) || null;

    this._savedCamBeforeVFX = {
      spherical: { ...this.desiredSpherical },
      target: this.camTarget.clone()
    };

    const getMobileVFXScale = () => {
      const vw = Math.max(320, window.innerWidth || 1024);
      const vh = Math.max(320, window.innerHeight || 768);
      const aspect = vw / vh;
      if (aspect < 0.92) {
        return THREE.MathUtils.clamp(0.96 / Math.max(0.42, aspect), 1.32, 1.96);
      }
      return 1.0;
    };

    const focusX = (cPos.x * 0.28 + kPos.x * 0.72);
    const focusZ = (cPos.z * 0.28 + kPos.z * 0.72);
    const baseTheta = this._savedCamBeforeVFX.spherical.theta;

    // 柔和点光源（初始强度 0，删除旧场景中不必要的天柱/连线/裂纹贴片等冗余元素，保持 CG 画面干净纯粹）
    const vfxLight = new THREE.PointLight(atmos.pointHex, 0.0, 22, 1.7);
    vfxLight.position.set(kPos.x, 3.8, kPos.z);
    const vfxRimLight = new THREE.PointLight(atmos.rimHex, 0.0, 20, 1.8);
    vfxRimLight.position.set(cPos.x, 2.8, cPos.z);
    this.checkmateVFXGroup.add(vfxLight, vfxRimLight);

    const glowTex = getGlowParticleTexture();

    const vfxContext = {
      cameraOverride: null,
      onStage1Update: null,
      cgSceneWeight: 0,
      whiteoutAlpha: 0,
      setCameraOverride(targetVec, radius, phi, thetaOffset = 0, allowHighPhi = false, instant = false) {
        this.cameraOverride = { targetVec, radius, phi, thetaOffset, allowHighPhi, instant };
      },
      setSceneTransition: (cgWeight) => {
        vfxContext.cgSceneWeight = Math.max(0, Math.min(1, cgWeight));
        this.setOriginalWorldVisibilityWeight(1 - vfxContext.cgSceneWeight);
      }
    };

    const updateCustom3D = this.build3DSpectacleForType(
      vfxType,
      kPos,
      cPos,
      rPos,
      winnerColor,
      pattern,
      kingItem,
      vfxContext
    );
    if (updateCustom3D && updateCustom3D.spectacleGroup) {
      updateCustom3D.spectacleGroup.visible = false;
    }

    this.captureOriginalWorldSnapshot(this._activeCheckerMeshes.map(it => it.mesh));

    const spawn3DBurst = (wx, wy, wz, primaryHex = 0xff5500, secondaryHex = 0xfef08a, count = 26) => {
      for (let i = 0; i < count; i++) {
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: glowTex,
            color: i % 2 === 0 ? primaryHex : secondaryHex,
            transparent: true,
            opacity: 0.55,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        const initScale = 0.26 + Math.random() * 0.30;
        sprite.scale.set(initScale, initScale, 1);
        sprite.position.set(wx + (Math.random() - 0.5) * 0.35, wy + Math.random() * 0.25, wz + (Math.random() - 0.5) * 0.35);
        this.checkmateVFXGroup.add(sprite);

        const angle = Math.random() * Math.PI * 2;
        const speedXZ = 2.0 + Math.random() * 5.8;
        const speedY = 2.6 + Math.random() * 5.8;
        this.checkmateVFXAnimations.push({
          elapsed: 0,
          duration: 0.9 + Math.random() * 0.45,
          update: (t, dt) => {
            sprite.position.x += Math.cos(angle) * speedXZ * dt;
            sprite.position.z += Math.sin(angle) * speedXZ * dt;
            sprite.position.y += (speedY - t * 10.5) * dt;
            if (sprite.position.y < 0.08) sprite.position.y = 0.08;
            sprite.material.opacity = Math.max(0, 0.55 * (1 - Math.pow(t, 1.35)));
          }
        });
      }
    };

    const sparks2D = Array.from({ length: 48 }, (_, i) => {
      const ang = (i / 48) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      const spd = 120 + Math.random() * 380;
      return {
        ang,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 50,
        size: 3.0 + Math.random() * 6.8,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 9,
        color: i % 4 === 0 ? '#fffbeb' : (i % 2 === 0 ? '#fde68a' : atmos.accent)
      };
    });

    const baseSceneCfg = this.getActiveSceneConfig?.() || {
      bgHex: 0xdbe9dc,
      sunColor: 0xfff8eb,
      sunIntensity: 0.88,
      hemiSky: 0xfffdf6,
      hemiGround: 0x5c7a58,
      hemiIntensity: 0.62
    };
    const dayBgColor = new THREE.Color(baseSceneCfg.bgHex || 0xdbe9dc);
    const vfxBgColor = new THREE.Color(atmos.bgHex);
    const vfxFogColor = new THREE.Color(atmos.fogHex);
    const daySunColor = new THREE.Color(baseSceneCfg.sunColor || 0xfff8eb);
    const vfxSunColor = new THREE.Color(atmos.sunHex);
    const dayHemiSky = new THREE.Color(baseSceneCfg.hemiSky || 0xfffdf6);
    const vfxHemiSky = new THREE.Color(atmos.hemiSky);
    const dayHemiGround = new THREE.Color(baseSceneCfg.hemiGround || 0x5c7a58);
    const vfxHemiGround = new THREE.Color(atmos.hemiGround);

    let stage2Triggered = false;
    let stage3Triggered = false;

    const { canvas: fxCanvas } = this.ensureCheckmateFXCanvas();
    fxCanvas.classList.remove('hidden');

    this.checkmateVFXAnimations.push({
      elapsed: 0,
      duration: TOTAL_DURATION,
      update: (normT, dt) => {
        const sec = normT * TOTAL_DURATION;
        const { ctx, w, h, dpr } = this.ensureCheckmateFXCanvas();
        const mobileScale = getMobileVFXScale();
        const isMobileView = mobileScale > 1.05;
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        let gradeFactor = 0;
        if (normT < 0.12) gradeFactor = normT / 0.12;
        else if (normT < 0.84) gradeFactor = 1.0;
        else gradeFactor = Math.max(0, 1 - (normT - 0.84) / 0.16);

        if (this.scene) {
          this.scene.background.copy(dayBgColor).lerp(vfxBgColor, gradeFactor * 0.92);
          if (this.scene.fog) {
            this.scene.fog.color.copy(dayBgColor).lerp(vfxFogColor, gradeFactor * 0.92);
          }
        }
        if (this.sunLight) {
          this.sunLight.color.copy(daySunColor).lerp(vfxSunColor, gradeFactor);
          this.sunLight.intensity = THREE.MathUtils.lerp(baseSceneCfg.sunIntensity || 0.88, atmos.sunIntensity, gradeFactor);
        }
        if (this.hemiLight) {
          this.hemiLight.color.copy(dayHemiSky).lerp(vfxHemiSky, gradeFactor);
          this.hemiLight.groundColor.copy(dayHemiGround).lerp(vfxHemiGround, gradeFactor);
          this.hemiLight.intensity = THREE.MathUtils.lerp(baseSceneCfg.hemiIntensity || 0.62, atmos.hemiIntensity, gradeFactor);
        }
        if (this.container) {
          this.container.style.filter = gradeFactor > 0.05 ? atmos.cssFilter : '';
        }

        if (sec < STAGE1_END) {
          const p1 = sec / STAGE1_END;
          const ease1 = 1 - Math.pow(1 - p1, 3);

          if (updateCustom3D && updateCustom3D.spectacleGroup) {
            updateCustom3D.spectacleGroup.visible = false;
          }
          if (typeof vfxContext.onStage1Update === 'function') {
            vfxContext.onStage1Update(p1, ease1);
          }

          const targetFocusFactor = isMobileView ? 0.68 : 0.90;
          this.camTarget.set(
            THREE.MathUtils.lerp(0, focusX, ease1 * targetFocusFactor),
            THREE.MathUtils.lerp(0, 0.45, ease1),
            THREE.MathUtils.lerp(0.3, focusZ, ease1 * targetFocusFactor)
          );
          const stage1Radius = 11.2 * mobileScale;
          const stage1Phi = isMobileView ? 0.86 : 0.96;
          this.desiredSpherical.radius = THREE.MathUtils.lerp(this._savedCamBeforeVFX.spherical.radius, stage1Radius, ease1);
          this.desiredSpherical.phi = THREE.MathUtils.lerp(this._savedCamBeforeVFX.spherical.phi, stage1Phi, ease1);
          this.desiredSpherical.theta = baseTheta + ease1 * 0.14;

          this._activeCheckerMeshes.forEach((item, idx) => {
            if (!item.mesh) return;
            if (item.isKing) {
              const tremor = Math.sin(p1 * 36) * 0.02 * ease1;
              item.mesh.position.set(item.basePos.x + tremor, ease1 * 0.06, item.basePos.z + tremor);
            } else if (item.isAttacker) {
              const lift = Math.sin(ease1 * Math.PI * 0.5) * 0.48;
              item.mesh.position.set(item.basePos.x, lift, item.basePos.z);
              item.mesh.rotation.y = ease1 * Math.PI * (idx % 2 === 0 ? 1 : -1);
              const sc = 1 + ease1 * 0.10;
              item.mesh.scale.set(sc, sc, sc);
            }
          });
        } else if (sec < STAGE2_END) {
          const rawP2 = (sec - STAGE1_END) / (STAGE2_END - STAGE1_END);
          const { p: p2, rate: rhythmRate } = this.applyVFXRhythmTimeWarp(vfxType, rawP2);
          const warpedDt = dt * rhythmRate * speedScale;
          if (!stage2Triggered) {
            stage2Triggered = true;
            this.cameraShake = 0.24;
            if (updateCustom3D && updateCustom3D.spectacleGroup) {
              updateCustom3D.spectacleGroup.visible = true;
            }
          }

          vfxContext.cameraOverride = null;
          this._activeCheckerMeshes.forEach(it => { it.customDriven = false; });

          const enterT = Math.min(1, rawP2 / 0.08);
          const enterFade = 1 - Math.pow(1 - enterT, 3);
          if (updateCustom3D) updateCustom3D(p2, warpedDt, enterFade);

          if (vfxContext.cameraOverride) {
            const ov = vfxContext.cameraOverride;
            if (ov.instant) {
              this.camTarget.copy(ov.targetVec);
            } else {
              this.camTarget.lerp(ov.targetVec, 0.34);
            }
            this.desiredSpherical.radius = ov.radius * mobileScale;
            this.desiredSpherical.phi = (isMobileView && !ov.allowHighPhi)
              ? Math.min(0.96, ov.phi * 0.94)
              : ov.phi;
            this.desiredSpherical.theta = baseTheta + (ov.thetaOffset || 0);
            if (ov.instant && this.camSpherical) {
              this.camSpherical.radius = this.desiredSpherical.radius;
              this.camSpherical.phi = this.desiredSpherical.phi;
              this.camSpherical.theta = this.desiredSpherical.theta;
            }
          } else {
            const targetFocusFactor = isMobileView ? 0.68 : 0.90;
            this.camTarget.set(focusX * targetFocusFactor, 0.55, focusZ * targetFocusFactor);
            this.desiredSpherical.radius = (10.4 + Math.sin(p2 * Math.PI) * 0.85) * mobileScale;
            this.desiredSpherical.phi = (isMobileView ? 0.86 : 0.96) + Math.cos(p2 * Math.PI) * 0.06;
            this.desiredSpherical.theta = baseTheta + 0.16 + Math.sin(p2 * Math.PI * 1.5) * 0.24;
          }

          // 若当前帧存在全白强光转场 (如天地炮熔岩球触地全白过渡)，在 2D 顶层绘制柔和渐变全白遮罩
          if (vfxContext.whiteoutAlpha > 0.01) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 253, 248, ${Math.min(1, vfxContext.whiteoutAlpha)})`;
            ctx.fillRect(0, 0, w, h);
            ctx.restore();
          }

          const bw = 1 - (vfxContext.cgSceneWeight || 0);
          const impactHit = Math.max(0, Math.min(1, (p2 - 0.35) / 0.50));
          this._activeCheckerMeshes.forEach((item, idx) => {
            if (!item.mesh || item.customDriven) return;
            if (item.isKing) {
              const shakeAmp = (0.04 + impactHit * 0.08) * (1 - p2 * 0.25);
              const jx = Math.sin(p2 * 90) * shakeAmp;
              const jz = Math.cos(p2 * 84) * shakeAmp;
              const knockUp = Math.sin(impactHit * Math.PI) * 0.28;
              item.mesh.position.set(item.basePos.x + jx, 0.06 + knockUp, item.basePos.z + jz);
              item.mesh.rotation.set(
                Math.sin(p2 * 40) * 0.18 + impactHit * 0.22,
                Math.sin(p2 * 22) * 0.14,
                Math.cos(p2 * 36) * 0.18
              );
            } else {
              // 未被当前绝杀动画主动驱动的辅助高亮棋子随棋盘可见度 bw 平滑隐去，绝不在全屏 CG 场景中突兀残留！
              const hoverY = (0.24 + Math.sin(p2 * 14 + idx) * 0.08) * bw;
              const pulseSc = 1.0 + (0.06 + Math.sin(p2 * 16 + idx) * 0.04) * bw;
              this.setPiece3DPose(
                item.mesh,
                item.basePos.x,
                hoverY,
                item.basePos.z,
                Math.sin(p2 * 10 + idx) * 0.08 * bw,
                p2 * Math.PI * 2 * bw,
                0,
                pulseSc,
                bw,
                0
              );
            }
          });
        } else {
          const p3 = (sec - STAGE2_END) / Math.max(0.01, TOTAL_DURATION - STAGE2_END);
          const ease3 = 1 - Math.pow(1 - p3, 3);
          if (!stage3Triggered) {
            stage3Triggered = true;
            this.triggerScreenFlash();
            this.cameraShake = 0.40;
            this.sfx?.playVictorySeal?.(0);
            spawn3DBurst(kPos.x, 0.35, kPos.z, atmos.rimHex, atmos.pointHex, 24);
            this.spawnShatterFragments?.(kPos.x, kPos.z, winnerColor === RED ? BLACK : RED);
          }

          vfxContext.setSceneTransition(Math.max(0, (vfxContext.cgSceneWeight || 0) * (1 - p3 * 2.5)));

          this._activeCheckerMeshes.forEach((item) => {
            if (!item.mesh || !item.basePos) return;
            const settle = Math.min(1, p3 * 2.2);
            item.mesh.visible = true;
            item.mesh.children.forEach(ch => {
              if (ch.material) {
                ch.material.transparent = false;
                ch.material.opacity = 1.0;
              }
            });
            item.mesh.position.lerpVectors(item.mesh.position, item.basePos, settle);
            item.mesh.rotation.set(
              item.mesh.rotation.x * (1 - settle),
              item.mesh.rotation.y * (1 - settle),
              item.mesh.rotation.z * (1 - settle)
            );
            const sc = THREE.MathUtils.lerp(item.mesh.scale.x, 1, settle);
            item.mesh.scale.set(sc, sc, sc);
            const bodyChild = item.mesh.children[0];
            if (bodyChild?.material?.emissive) {
              bodyChild.material.emissiveIntensity *= (1 - settle);
            }
          });

          const fade3D = Math.max(0, 1 - p3 * 1.65);
          if (this.checkmateHighlightRings && this.checkmateHighlightRings.length > 0) {
            this.checkmateHighlightRings.forEach(ring => {
              if (ring.material) ring.material.opacity = fade3D * 0.85;
            });
          }

          this.camTarget.lerpVectors(this.camTarget, this._savedCamBeforeVFX.target, ease3 * 0.45);
          this.desiredSpherical.radius = THREE.MathUtils.lerp(11.0 * mobileScale, this._savedCamBeforeVFX.spherical.radius, ease3);
          this.desiredSpherical.phi = THREE.MathUtils.lerp(isMobileView ? 0.84 : 0.92, this._savedCamBeforeVFX.spherical.phi, ease3);
          this.desiredSpherical.theta = THREE.MathUtils.lerp(this.desiredSpherical.theta, this._savedCamBeforeVFX.spherical.theta, ease3);

          if (updateCustom3D) {
            if (fade3D <= 0.01 && updateCustom3D.spectacleGroup) {
              updateCustom3D.spectacleGroup.visible = false;
            } else {
              updateCustom3D(1.0, dt, fade3D);
            }
          }

          // 若 Stage 2 结束时处于全白状态（如天地炮整个屏幕慢慢变到全白），在 Stage 3 前段平滑过渡消散
          if (vfxContext.whiteoutAlpha > 0.01) {
            const whiteHoldFade = Math.max(0, 1 - Math.max(0, (p3 - 0.12) / 0.68));
            if (whiteHoldFade > 0.01) {
              ctx.save();
              ctx.fillStyle = `rgba(255, 253, 248, ${Math.min(1, vfxContext.whiteoutAlpha * whiteHoldFade)})`;
              ctx.fillRect(0, 0, w, h);
              ctx.restore();
            }
          }

          this.renderImperialFinalJueshaSeal2D(ctx, w, h, p3, stampTitle, subBannerText, sparks2D, vfxType, atmos);
        }

        const lightRampIn = Math.min(1, sec / 0.65);
        const lightRampOut = 1 - normT * 0.42;
        vfxLight.intensity = lightRampIn * lightRampOut * (0.60 + Math.sin(normT * 24) * 0.08);
        vfxRimLight.intensity = lightRampIn * lightRampOut * (0.40 + Math.cos(normT * 20) * 0.06);
        ctx.restore();
      }
    });
  },

  renderImperialHUD2D(ctx, w, h, p, vfxType, stampTitle, subBannerText, atmos = null) {
    const cx = w * 0.5;
    const cy = h * 0.5;
    const minDim = Math.min(w, h);
    const prof = atmos || this.getVFXAtmosphereProfile(vfxType);

    ctx.save();
    const vig = ctx.createRadialGradient(cx, cy, minDim * 0.36, cx, cy, Math.max(w, h) * 0.80);
    vig.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(0.65, prof.tintInner);
    vig.addColorStop(1.0, prof.tintOuter);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  },

  renderImperialFinalJueshaSeal2D(ctx, w, h, p3, stampTitle, subBannerText, sparks2D, vfxType = '', atmos = null) {
    const cx = w * 0.5;
    const cy = h * 0.48;
    const fadeOut = p3 > 0.72 ? Math.max(0, 1 - (p3 - 0.72) / 0.28) : 1.0;
    if (fadeOut <= 0.01) return;

    const isIceOrWater = vfxType === 'fishing_horse' || vfxType === 'frost_lotus_strike';
    const prof = atmos || this.getVFXAtmosphereProfile(vfxType);

    ctx.save();
    ctx.globalAlpha = fadeOut;

    const ringR = Math.min(w, h) * (0.14 + p3 * 0.42);
    ctx.strokeStyle = isIceOrWater
      ? `rgba(186, 230, 253, ${(1 - p3) * 0.58})`
      : `rgba(254, 240, 138, ${(1 - p3) * 0.58})`;
    ctx.lineWidth = 4.0 * (1 - p3 * 0.55);
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.stroke();

    sparks2D.forEach((sp, i) => {
      const sx = cx + sp.vx * (0.20 + p3 * 0.88);
      const sy = cy + sp.vy * (0.20 + p3 * 0.88) + 185 * p3 * p3;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(sp.rot + sp.vRot * p3);
      ctx.fillStyle = isIceOrWater && i % 2 === 0 ? '#bae6fd' : sp.color;
      const s = sp.size * Math.max(0.2, 1 - p3 * 0.5);
      ctx.fillRect(-s * 0.5, -s * 0.5, s, s);
      ctx.restore();
    });

    const slamT = Math.min(1, p3 / 0.16);
    const slamScale = slamT < 1
      ? THREE.MathUtils.lerp(2.45, 0.96, slamT * slamT)
      : 1.0 + Math.sin((p3 - 0.16) * 18) * 0.018;
    const bigFontSize = Math.round(Math.min(w * 0.19, h * 0.14, 118));
    const finalText = '绝杀';
    const caption = stampTitle && stampTitle !== '绝杀' ? `${stampTitle} · ${subBannerText}` : subBannerText;
    this.drawImperialBrushTitle(ctx, cx, cy, finalText, bigFontSize, slamScale, fadeOut, caption, prof.accent || '#f59e0b', 1.0);

    ctx.restore();
  },

  /**
   * 加强版行棋流光轨迹与起跳涟漪特效（双层立体流光丝带 + 沿途星芒粒子 + 起点聚气金环）
   */
  spawnMoveTrailRibbon(startPos, endPos, color, isCapture = false, pieceType = 'r') {
    if (!this.scene) return;
    const isRed = color === RED;
    const dx = endPos.x - startPos.x;
    const dz = endPos.z - startPos.z;
    const midX = (startPos.x + endPos.x) * 0.5;
    const midZ = (startPos.z + endPos.z) * 0.5;
    const peakY = isCapture
      ? (pieceType === 'c' ? 1.85 : (pieceType === 'n' ? 1.55 : 1.12))
      : (pieceType === 'n' ? 1.28 : 0.78);

    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(startPos.x, 0.16, startPos.z),
      new THREE.Vector3(midX, peakY, midZ),
      new THREE.Vector3(endPos.x, 0.16, endPos.z)
    );

    if (!this.impactWaves) this.impactWaves = [];

    // 1. 内层高亮流光核心束
    const coreGeo = new THREE.TubeGeometry(curve, 32, isCapture ? 0.062 : 0.044, 10, false);
    const coreMat = new THREE.MeshBasicMaterial({
      color: isCapture ? 0xfef08a : (isRed ? 0xff6b6b : 0xfbbf24),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    this.scene.add(coreMesh);
    this.impactWaves.push({
      mesh: coreMesh,
      age: 0,
      maxAge: isCapture ? 0.52 : 0.40,
      maxScale: 1.0,
      isTrail: true
    });

    // 2. 外层柔和晕染剑气光带
    const auraGeo = new THREE.TubeGeometry(curve, 24, isCapture ? 0.13 : 0.09, 8, false);
    const auraMat = new THREE.MeshBasicMaterial({
      color: isRed ? 0xef4444 : 0xd97706,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.scene.add(auraMesh);
    this.impactWaves.push({
      mesh: auraMesh,
      age: 0,
      maxAge: isCapture ? 0.58 : 0.44,
      maxScale: 1.0,
      isTrail: true
    });

    // 3. 起点腾空助推涟漪环
    const launchRing = new THREE.Mesh(
      new THREE.RingGeometry(0.22, 0.42, 32),
      new THREE.MeshBasicMaterial({
        color: isRed ? 0xf87171 : 0xfbbf24,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    launchRing.rotation.x = -Math.PI / 2;
    launchRing.position.set(startPos.x, 0.024, startPos.z);
    this.scene.add(launchRing);
    this.impactWaves.push({
      mesh: launchRing,
      age: 0,
      maxAge: 0.34,
      maxScale: 1.65
    });

    // 4. 沿途飘散的星芒微粒
    const glowTex = typeof getGlowParticleTexture === 'function' ? getGlowParticleTexture() : null;
    if (glowTex && this.shatterParticles) {
      const moteCount = isCapture ? 10 : 6;
      for (let i = 1; i <= moteCount; i++) {
        const pt = curve.getPoint(i / (moteCount + 1));
        const spMat = new THREE.SpriteMaterial({
          map: glowTex,
          color: i % 2 === 0 ? 0xfef08a : (isRed ? 0xf87171 : 0xfbbf24),
          transparent: true,
          opacity: 0.78,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const sp = new THREE.Sprite(spMat);
        const sc = isCapture ? 0.28 : 0.22;
        sp.scale.set(sc, sc, 1);
        sp.position.set(pt.x + (Math.random() - 0.5) * 0.16, pt.y, pt.z + (Math.random() - 0.5) * 0.16);
        this.scene.add(sp);
        this.shatterParticles.push({
          mesh: sp,
          vx: (Math.random() - 0.5) * 0.8 + dx * 0.12,
          vy: 0.6 + Math.random() * 1.1,
          vz: (Math.random() - 0.5) * 0.8 + dz * 0.12,
          life: 0,
          maxLife: 0.45 + Math.random() * 0.18
        });
      }
    }
  },

  spawnMoveImpactWave(worldX, worldZ, isCapture = false) {
    if (!this.scene) return;
    if (!this.impactWaves) this.impactWaves = [];
    const markerTex = typeof getBoardMarkerTexture === 'function'
      ? getBoardMarkerTexture(isCapture ? 'warning' : 'last_to')
      : null;
    const mat = new THREE.MeshBasicMaterial({
      map: markerTex || null,
      color: isCapture ? 0xffef8a : 0xfde047,
      transparent: true,
      opacity: isCapture ? 0.88 : 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const waveMesh = new THREE.Mesh(
      markerTex ? new THREE.PlaneGeometry(1.12, 1.12) : new THREE.RingGeometry(0.32, 0.50, 36),
      mat
    );
    waveMesh.rotation.x = -Math.PI / 2;
    waveMesh.position.set(worldX, 0.026, worldZ);
    this.scene.add(waveMesh);
    this.impactWaves.push({
      mesh: waveMesh,
      age: 0,
      maxAge: isCapture ? 0.56 : 0.42,
      maxScale: isCapture ? 2.45 : 1.75
    });

    // 第二道外扩激波金环，使落子瞬间更具分量感与节奏感
    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.38, 0.48, 36),
      new THREE.MeshBasicMaterial({
        color: isCapture ? 0xef4444 : 0xf59e0b,
        transparent: true,
        opacity: isCapture ? 0.72 : 0.54,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.set(worldX, 0.028, worldZ);
    this.scene.add(outerRing);
    this.impactWaves.push({
      mesh: outerRing,
      age: 0,
      maxAge: isCapture ? 0.48 : 0.34,
      maxScale: isCapture ? 2.85 : 2.05
    });
  },

  spawnShatterFragments(worldX, worldZ, color, dirX = 0, dirZ = 0) {
    const isRed = color === RED;
    this.spawnMoveImpactWave(worldX, worldZ, true);
    this.cameraShake = Math.max(this.cameraShake || 0, 0.34);
    const glowTex = typeof getGlowParticleTexture === 'function' ? getGlowParticleTexture() : null;
    const slashTex = typeof getSlashArcTexture === 'function' ? getSlashArcTexture() : null;

    if (slashTex) {
      for (let sIdx = 0; sIdx < 2; sIdx++) {
        const slashMat = new THREE.MeshBasicMaterial({
          map: slashTex,
          color: sIdx === 0 ? 0xfef08a : 0xff3333,
          transparent: true,
          opacity: 0.88,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        const slashMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.68, 1.68), slashMat);
        slashMesh.position.set(worldX, 0.38, worldZ);
        slashMesh.rotation.x = -Math.PI * 0.36;
        slashMesh.rotation.z = sIdx === 0 ? 0.55 : -0.55;
        this.scene.add(slashMesh);
        this.impactWaves.push({
          mesh: slashMesh,
          age: 0,
          maxAge: 0.36,
          maxScale: 2.15,
          isSlash: true
        });
      }
    }

    // 碎片顺着进攻方向迸射飞散，呈现真实的撞击击飞物理效果
    for (let i = 0; i < 20; i++) {
      const fragMat = new THREE.MeshStandardMaterial({
        color: isRed ? 0xe6d5b8 : 0x090d16,
        emissive: isRed ? 0xf59e0b : 0xfbbf24,
        emissiveIntensity: 0.38,
        roughness: 0.18,
        metalness: 0.38,
        transparent: true,
        opacity: 1
      });
      const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.075 + Math.random() * 0.045, 0), fragMat);
      mesh.position.set(worldX + dirX * 0.12, 0.24, worldZ + dirZ * 0.12);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.scene.add(mesh);
      this.shatterParticles.push({
        mesh,
        vx: (Math.random() - 0.5) * 5.2 + dirX * 2.4,
        vy: 3.4 + Math.random() * 4.0,
        vz: (Math.random() - 0.5) * 5.2 + dirZ * 2.4,
        life: 0,
        maxLife: 0.85
      });
    }

    if (glowTex) {
      for (let i = 0; i < 14; i++) {
        const spMat = new THREE.SpriteMaterial({
          map: glowTex,
          color: i % 2 === 0 ? 0xfef08a : (isRed ? 0xef4444 : 0xf59e0b),
          transparent: true,
          opacity: 0.82,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const sp = new THREE.Sprite(spMat);
        sp.scale.set(0.38, 0.38, 1);
        sp.position.set(worldX, 0.28, worldZ);
        this.scene.add(sp);
        this.shatterParticles.push({
          mesh: sp,
          vx: (Math.random() - 0.5) * 5.5 + dirX * 1.8,
          vy: 2.8 + Math.random() * 4.2,
          vz: (Math.random() - 0.5) * 5.5 + dirZ * 1.8,
          life: 0,
          maxLife: 0.72
        });
      }
    }
  },

  showGrandmasterHint3D(move) {
    this.clearGrandmasterHint3D();
    if (!this.scene || !window.THREE) return;
    this.hintVFXGroup = new THREE.Group();
    this.scene.add(this.hintVFXGroup);
    const a = gridToWorld(move.fr, move.fc);
    const b = gridToWorld(move.tr, move.tc);
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(a.x, 0.34, a.z),
      new THREE.Vector3((a.x + b.x) / 2, 1.48, (a.z + b.z) / 2),
      new THREE.Vector3(b.x, 0.26, b.z)
    );

    const coreTube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 40, 0.048, 12, false),
      new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.92,
        depthWrite: false
      })
    );
    this.hintVFXGroup.add(coreTube);

    const startTex = typeof getBoardMarkerTexture === 'function' ? getBoardMarkerTexture('selected') : null;
    const endTex = typeof getMoveIndicatorTexture === 'function' ? getMoveIndicatorTexture('capture_safe') : null;

    [a, b].forEach((pos, i) => {
      const tex = i === 0 ? startTex : endTex;
      const ring = new THREE.Mesh(
        new THREE.PlaneGeometry(1.18, 1.18),
        new THREE.MeshBasicMaterial({
          map: tex || null,
          color: tex ? 0xffffff : (i ? 0x10b981 : 0xf59e0b),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.94,
          depthWrite: false
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(pos.x, 0.032, pos.z);
      this.hintVFXGroup.add(ring);
    });
  },

  clearGrandmasterHint3D() {
    if (this.hintVFXGroup) {
      this.scene?.remove(this.hintVFXGroup);
      this.hintVFXGroup.traverse?.(o => {
        o.geometry?.dispose?.();
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose?.());
        else o.material?.dispose?.();
      });
      this.hintVFXGroup = null;
    }
  }
});

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Xiangqi3DApp.prototype.ensureVFXDOMTemplates?.());
  } else {
    Xiangqi3DApp.prototype.ensureVFXDOMTemplates?.();
  }
}
