class Xiangqi3DApp {
  constructor() {
    window.gameApp = this;
    this.container = document.getElementById('canvas-container');
    this.sfx = new SoundEffects();
    this.engine = new XiangqiEngine();

    this.gameMode = 'inferno';
    this.variantMode = 'xiangqi';
    this.variantRegistry = [
      {
        id: 'xiangqi',
        name: '象棋',
        badge: '传统国粹',
        desc: '三十二子明置排阵，依传统规则博弈',
        icon: 'chess'
      },
      {
        id: 'jieqi',
        name: '揭棋',
        badge: '暗子奇谋',
        desc: '将帅明置，十五子暗布；暗子依初位行棋翻明，相仕可过河',
        icon: 'style'
      }
    ];
    this.currentSceneId = 'bamboo_park';
    this.sceneRegistry = [
      {
        id: 'bamboo_park',
        name: '翠竹石案',
        badge: '听泉雅集',
        desc: '晴日翠竹、青瓷香炉、温润石案与落英微风',
        icon: 'park',
        bgHex: 0xddece0,
        bodyCss: '#ddece0',
        fogDensity: 0.009,
        sunColor: 0xfff8eb,
        sunIntensity: 0.86,
        hemiSky: 0xffffff,
        hemiGround: 0x5c7c58,
        hemiIntensity: 0.66
      },
      {
        id: 'ancient_battlefield',
        name: '楚汉将台',
        badge: '赤壁烽火',
        desc: '暖金斜阳、玄铁将台、青铜火鼎与猎猎战旗',
        icon: 'local_fire_department',
        bgHex: 0x36231a,
        bodyCss: '#36231a',
        fogDensity: 0.009,
        sunColor: 0xffe0b5,
        sunIntensity: 0.88,
        hemiSky: 0xffd2a6,
        hemiGround: 0x4a2f21,
        hemiIntensity: 0.62
      },
      {
        id: 'imperial_study',
        name: '瑶台揽月',
        badge: '云海星宫',
        desc: '白玉莲台、九天皎月、重檐星阁、流云仙雾与临水河灯',
        icon: 'nights_stay',
        bgHex: 0x0d182e,
        bodyCss: '#0d182e',
        fogDensity: 0.0082,
        sunColor: 0xfff4d6,
        sunIntensity: 0.88,
        hemiSky: 0xdbeafe,
        hemiGround: 0x1e293b,
        hemiIntensity: 0.66
      }
    ];
    this.isBusy = false;
    this.gameOver = false;
    this.endgameReasonText = null;
    this.endgameEditor = false;
    this.replayMode = false;
    this.replayBranchActive = false;
    this.replayTrialCheckmated = false;
    this.editorPiece = { color: RED, type: 'k' };
    this.editorErase = false;
    this.customEndgameSnapshot = null;
    this.editorFirstTurn = RED;
    this.threatenedFriendlyIds = new Set();
    this.safeCapturableEnemyIds = new Set();

    this.peer = null;
    this.conn = null;
    this.onlineRole = null;
    this.roomCode = null;
    this.pendingUndoRequest = false;
    this.pendingDrawRequest = false;
    this.pendingRematchRequest = false;

    this.capturedTrayCollapsed = window.innerWidth < 1024;

    this.selectedSquare = null;
    this.legalMovesForSelected = [];

    this.pieceMeshes = new Map();
    this.sharedPieceAssets = null;
    this.sharedIndicatorAssets = null;
    this.activeAnimations = [];
    this.shatterParticles = [];
    this.impactWaves = [];
    this.checkmateHighlightRings = [];
    this.illegalWarningRings = [];
    this.illegalToastTimer = null;
    this.cycleBannerTimer = null;
    this.calloutHideTimer = null;
    this.actionBurstTimer = null;
    this.checkmateVFXAnimations = [];
    this.vfxAtmosphereTimer = 0;
    this.vfxAtmosphereDuration = 0;
    this.lastCheckmatePattern = null;
    this.lastWinnerColor = null;
    this.currentCamPreset = 'red';

    this._raycaster = new THREE.Raycaster();
    this._mouseVec = new THREE.Vector2();
    this._boardPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.15);
    this._intersectPt = new THREE.Vector3();
    this._tempVec3 = new THREE.Vector3();
    this.lastMoveCoords = null;
    this._tempDayColor = new THREE.Color(0xddece0);
    this._tempNightColor = new THREE.Color(0x161224);

    this.ensureVFXDOMTemplates?.();
    this.initAIWorker();
    this.initThree();
    this.buildParkEnvironment();
    this.buildBattlefieldEnvironment();
    this.buildImperialStudyEnvironment();
    this.buildChessboard3D();
    this.buildInteractionMarkers();
    this.piecesGroup = new THREE.Group();
    this.scene.add(this.piecesGroup);
    this.checkmateVFXGroup = new THREE.Group();
    this.scene.add(this.checkmateVFXGroup);
    this.syncPiecesFromEngine();
    this.setupControlsAndEvents();

    this.initReplaySession?.(this.engine.board, this.engine.turn, 'standard');
    this.updateRestartButtonLabel();
    this.updateUI();
    this.checkURLParams();

    this.clock = new THREE.Clock();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createBlobAIWorker() {
    if (typeof window.__xiangqiAIWorkerBootstrap !== 'function') return null;
    try {
      const src = `(${window.__xiangqiAIWorkerBootstrap.toString()})();`;
      const blob = new Blob([src], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      const worker = new Worker(blobUrl);
      worker._isBlobWorker = true;
      return worker;
    } catch (_) {
      return null;
    }
  }

  bindAIWorkerEvents(worker) {
    if (!worker) return;
    worker.onmessage = (e) => {
      this.aiWorkerVerified = true;
      const data = e.data;
      if (data.type === 'progress') {
        this.updateTelemetryUI(data.depth, data.nodes, data.score, this.engine.turn);
      } else if (data.type === 'result') {
        this.updateTelemetryUI(data.depth, data.nodes, data.score, this.engine.turn);
        if (this.aiCallback) {
          const cb = this.aiCallback;
          this.aiCallback = null;
          cb(data.move);
        }
      }
    };
    worker.onerror = () => {
      const cb = this.aiCallback;
      const reqPayload = this.lastAIPayload;
      const wasBlob = Boolean(worker._isBlobWorker);
      try { worker.terminate(); } catch (_) { }
      if (this.aiWorker === worker) {
        this.aiWorker = null;
      }
      if (!wasBlob) {
        const blobWorker = this.createBlobAIWorker();
        if (blobWorker) {
          this.aiWorker = blobWorker;
          this.bindAIWorkerEvents(blobWorker);
          if (cb && reqPayload) {
            try {
              blobWorker.postMessage(reqPayload);
              return;
            } catch (_) { }
          }
          return;
        }
      }
      this.aiCallback = null;
      if (cb && reqPayload) {
        this.runMainThreadAIFallback(reqPayload, cb);
      }
    };
  }

  initAIWorker() {
    this.aiWorker = null;
    this.aiCallback = null;
    this.aiWorkerVerified = false;
    const isFileProtocol = true;
    if (isFileProtocol) {
      const blobWorker = this.createBlobAIWorker();
      if (blobWorker) {
        this.aiWorker = blobWorker;
        this.bindAIWorkerEvents(blobWorker);
        return;
      }
    }
    try {
      this.aiWorker = new Worker('ChineseChessJS/ai-worker.js?v=20261021');
      this.bindAIWorkerEvents(this.aiWorker);
    } catch (_) {
      const blobWorker = this.createBlobAIWorker();
      if (blobWorker) {
        this.aiWorker = blobWorker;
        this.bindAIWorkerEvents(blobWorker);
      }
    }
  }

  runMainThreadAIFallback(payload, callback) {
    setTimeout(() => {
      if (typeof window.runXiangqiAIEngine === 'function') {
        const res = window.runXiangqiAIEngine(payload, (prog) => {
          this.updateTelemetryUI(prog.depth, prog.nodes, prog.score, payload.turn);
        });
        this.updateTelemetryUI(res.depth, res.nodes, res.score, payload.turn);
        callback(res.move);
        return;
      }
      const forbiddenMoves = payload.forbiddenMoves || [];
      const allMoves = this.engine.getAllLegalMoves(payload.turn);
      const safeMoves = allMoves.filter(
        m => !forbiddenMoves.some(f => f.fr === m.fr && f.fc === m.fc && f.tr === m.tr && f.tc === m.tc)
      );
      callback((safeMoves.length > 0 ? safeMoves : allMoves)[0] || null);
    }, 30);
  }

  updateTelemetryUI(depth, nodes, scoreFromMover, moverColor) {
    const redScore = moverColor === RED ? scoreFromMover : -scoreFromMover;
    const clamped = Math.max(-2500, Math.min(2500, redScore));
    const pct = Math.round(50 + (clamped / 2500) * 45);
    const barEl = document.getElementById('eval-bar-red');
    if (barEl) barEl.style.width = `${pct}%`;

    const telEl = document.getElementById('ai-telemetry-text');
    if (!telEl) return;

    const nodesStr = nodes >= 1000 ? `${(nodes / 1000).toFixed(1)}k` : `${nodes}`;
    if (Math.abs(scoreFromMover) > 25000) {
      const matePly = Math.max(1, Math.ceil((29000 - Math.abs(scoreFromMover)) / 40));
      const winnerName = (scoreFromMover > 0 ? moverColor : (moverColor === RED ? BLACK : RED)) === RED ? '红方' : '黑方';
      telEl.textContent = `${depth} · ${nodesStr} · ${winnerName}胜定 M${matePly}`;
    } else {
      const adv = Math.abs(redScore) < 60 ? '均势' : (redScore > 0 ? `红优 +${Math.round(redScore / 100)}` : `黑优 +${Math.round(-redScore / 100)}`);
      telEl.textContent = depth === '开局库' ? `库着 · ${adv}` : `深${depth} · ${nodesStr} · ${adv}`;
    }
  }

  resetTelemetryUI(customText = null) {
    const barEl = document.getElementById('eval-bar-red');
    if (barEl) barEl.style.width = '50%';
    const telEl = document.getElementById('ai-telemetry-text');
    if (!telEl) return;
    if (customText) {
      telEl.textContent = customText;
      return;
    }
    const isJieqi = (this.engine?.variantMode || this.variantMode) === 'jieqi';
    const modeNames = { pvp: '双人对弈', easy: '简单AI', hard: '困难AI', inferno: '宗师AI' };
    const modeLabel = this.onlineRole ? '联机对弈' : (modeNames[this.gameMode] || '宗师AI');
    if (this.endgameEditor) {
      telEl.textContent = '残局工坊 · 自由布阵';
    } else if (this.replayMode && !this.replayBranchActive) {
      telEl.textContent = `复盘演武 · ${modeLabel}`;
    } else if (this.gameMode === 'pvp' || this.onlineRole) {
      telEl.textContent = `${modeLabel} · 均势`;
    } else if (isJieqi) {
      telEl.textContent = `${modeLabel} · 均势`;
    } else {
      telEl.textContent = `库着就绪 · 均势`;
    }
  }

  getActiveSceneConfig() {
    return this.sceneRegistry.find(s => s.id === this.currentSceneId) || this.sceneRegistry[0];
  }

  requestAIMove(color, difficulty, callback) {
    const historyMoves = this.engine.history.map(h => h.move);
    const forbiddenMoves = this.engine.getForbiddenRepetitionMoves(color);

    const historyBoards = [];
    if (this.replaySnapshots && this.replaySnapshots.length > 0) {
      const startIdx = Math.max(0, this.replaySnapshots.length - 20);
      for (let i = startIdx; i < this.replaySnapshots.length; i++) {
        const s = this.replaySnapshots[i];
        if (s && s.board && s.turn) {
          historyBoards.push({ board: s.board, turn: s.turn });
        } else if (s && s.fen) {
          const parsed = this.parseFENToBoard?.(s.fen);
          if (parsed) historyBoards.push(parsed);
        }
      }
    }

    const isJieqi = this.engine.variantMode === 'jieqi';
    const aiBoard = this.engine.board.map(row => row.map(cell => {
      if (!cell) return null;
      if (cell.isHidden) {
        return {
          id: cell.id,
          color: cell.color,
          type: cell.posType || cell.type,
          posType: cell.posType || cell.type,
          char: cell.char,
          isHidden: true
        };
      }
      return { ...cell };
    }));

    const payload = {
      board: aiBoard,
      turn: color,
      difficulty,
      variantMode: this.engine.variantMode || 'xiangqi',
      historyMoves,
      useBook: !isJieqi && difficulty !== 'easy',
      forbiddenMoves,
      historyBoards
    };
    this.lastAIPayload = payload;

    if (!this.aiWorker) {
      this.initAIWorker();
    }
    if (this.aiWorker) {
      this.aiCallback = callback;
      try {
        this.aiWorker.postMessage(payload);
        const workerAtRequest = this.aiWorker;
        const callbackAtRequest = callback;
        const timeoutMs = (difficulty === 'inferno' || difficulty === 'grandmaster_hint') ? 10000 : 5000;
        setTimeout(() => {
          if (this.aiWorker === workerAtRequest && this.aiCallback === callbackAtRequest) {
            this.aiCallback = null;
            try { workerAtRequest.terminate(); } catch (_) { }
            this.aiWorker = null;
            this.initAIWorker();
            this.runMainThreadAIFallback(payload, callbackAtRequest);
          }
        }, timeoutMs);
      } catch (_) {
        this.aiCallback = null;
        this.runMainThreadAIFallback(payload, callback);
      }
    } else {
      this.runMainThreadAIFallback(payload, callback);
    }
  }

  requestRedGrandmasterMove() {
    const side = this.engine.turn;
    if (this.isBusy || (this.gameOver && !this.replayMode) || this.onlineRole || this.replayTrialCheckmated) return;
    if (!this.replayMode && this.gameMode !== 'pvp' && side !== RED) return;
    if (this.replayMode) {
      this.stopReplayAutoPlay?.();
    }
    this.sfx.playHint ? this.sfx.playHint() : this.sfx.playSelect();
    this.isBusy = true;
    this.clearLegalMoveIndicators();
    this.clearGrandmasterHint3D?.();
    this.selectedSquare = null;

    const badge = document.getElementById('ai-thinking');
    const label = document.getElementById('ai-thinking-label');
    badge?.classList.remove('hidden');
    badge?.classList.add('inline-flex');
    if (label) label.textContent = '推演妙手…';

    this.requestAIMove(side, 'grandmaster_hint', (move) => {
      badge?.classList.add('hidden');
      badge?.classList.remove('inline-flex');
      if (!move || (this.gameOver && !this.replayMode)) {
        this.isBusy = false;
        this.updateUI(this.engine.isInCheck(this.engine.turn));
        return;
      }
      const notation = this.formatChineseMoveNotation(move);
      const mover = this.engine.board[move.fr]?.[move.fc];
      const target = this.engine.board[move.tr]?.[move.tc];
      let tactic = target ? `破阵取${target.char || '子'}` : '锦囊妙手';
      try {
        const after = this.engine.cloneBoard(this.engine.board);
        after[move.tr][move.tc] = mover;
        after[move.fr][move.fc] = null;
        const a = this.engine.classifyMoveAction?.(move, mover, this.engine.board, after);
        if (a?.type === 'jiang') tactic = '雷霆叫将';
        else if (a?.type === 'sha') tactic = '致命叫杀';
        else if (a?.desc) tactic = a.desc;
      } catch (_) { }

      this.showGrandmasterHint3D?.(move);
      this.showCenterCallout(`${notation} · ${tactic}`, side, '锦囊支招');

      setTimeout(() => {
        if (this.gameOver && !this.replayMode) {
          this.clearGrandmasterHint3D?.();
          this.isBusy = false;
          return;
        }
        if (this.replayMode) {
          this.replayHumanColor = side;
          this.prepareReplayBranchAtCurrentStep?.(side);
        }
        this.executeMoveAnimated(move, () => setTimeout(() => this.clearGrandmasterHint3D?.(), 800));
      }, 650);
    });
  }

  formatChineseMoveNotation(move) {
    const p = this.engine.board[move.fr]?.[move.fc];
    if (!p) return '妙手';
    const red = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
    const black = ['１', '２', '３', '４', '５', '６', '７', '８', '９'];
    const col = c => p.color === RED ? red[8 - c] : black[c];
    const step = n => p.color === RED ? red[Math.max(0, n - 1)] : black[Math.max(0, n - 1)];
    const dr = move.tr - move.fr;
    const activeType = p.isHidden ? (p.posType || p.type) : p.type;
    let action = '平', target = col(move.tc);
    if (dr !== 0) {
      action = (p.color === RED ? dr < 0 : dr > 0) ? '进' : '退';
      target = ['n', 'b', 'a'].includes(activeType) ? col(move.tc) : step(Math.abs(dr));
    }
    if (p.isHidden) {
      const revealChar = p.realChar || PIECE_CHARS[p.color]?.[p.realType] || '子';
      return `揭${revealChar}${col(move.fc)}${action}${target}`;
    }
    return `${p.char || PIECE_CHARS[p.color]?.[p.type] || '子'}${col(move.fc)}${action}${target}`;
  }

  updateViewportScale(animate = true) {
    const w = Math.max(320, window.innerWidth || 1024);
    const h = Math.max(320, window.innerHeight || 768);
    const aspect = w / h;
    this.camera.aspect = aspect;
    const portraitScale = aspect < 0.85 ? THREE.MathUtils.clamp(0.85 / aspect, 1.0, 1.68) : 1.0;
    this.camera.fov = aspect < 0.85 ? 46 : 42;
    this.camera.updateProjectionMatrix();

    const baseRadius = this.basePresetRadius || 17.5;
    this.desiredSpherical.radius = THREE.MathUtils.clamp(baseRadius * portraitScale, 9.5, 32.0);
    if (!animate) {
      this.camSpherical.radius = this.desiredSpherical.radius;
    }
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xddece0);
    this.scene.fog = new THREE.FogExp2(0xddece0, 0.009);

    const w = Math.max(320, window.innerWidth || 1024);
    const h = Math.max(320, window.innerHeight || 768);
    this.camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 150);

    try {
      this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch (_) {
      this.renderer = new THREE.WebGLRenderer({ antialias: false });
    }
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    this.camTarget = new THREE.Vector3(0, 0, 0.3);
    this.camSpherical = { radius: 17.5, phi: 0.72, theta: 0 };
    this.desiredSpherical = { ...this.camSpherical };
    this.cameraShake = 0;

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x5c7c58, 0.66);
    this.hemiLight.position.set(0, 30, 0);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight(0xfff8eb, 0.86);
    this.sunLight.position.set(12, 22, 14);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 2;
    this.sunLight.shadow.camera.far = 55;
    const d = 16;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    const fillLight = new THREE.DirectionalLight(0xfff7e6, 0.24);
    fillLight.position.set(-14, 12, -10);
    this.scene.add(fillLight);

    this.boardGlowLight = null;

    this.basePresetRadius = 17.5;
    this.updateViewportScale(false);
  }


  hideCycleWarningBanner() {
    const banner = document.getElementById('cycle-warning-banner');
    if (banner) {
      banner.dataset.forceHidden = 'true';
      banner.classList.add('hidden');
      banner.classList.remove('flex');
      banner.style.display = 'none';
    }
    if (this.cycleBannerTimer) {
      clearTimeout(this.cycleBannerTimer);
      this.cycleBannerTimer = null;
    }
  }

  updateCycleWarningUI(cycleStatus) {
    const banner = document.getElementById('cycle-warning-banner');
    if (!banner) return;

    if (this.cycleBannerTimer) {
      clearTimeout(this.cycleBannerTimer);
      this.cycleBannerTimer = null;
    }

    if (!cycleStatus || cycleStatus.remainingSteps <= 0) {
      banner.dataset.forceHidden = 'true';
      banner.classList.add('hidden');
      banner.classList.remove('flex');
      banner.style.display = 'none';
      return;
    }

    document.getElementById('cycle-red-tag').textContent = cycleStatus.redInfo.fullLabel;
    document.getElementById('cycle-black-tag').textContent = cycleStatus.blackInfo.fullLabel;
    document.getElementById('cycle-rule-desc').textContent = cycleStatus.ruleExplanation;
    document.getElementById('cycle-countdown-badge').textContent = `余 ${cycleStatus.remainingSteps} 步裁决`;

    delete banner.dataset.forceHidden;
    banner.style.removeProperty('display');
    banner.style.display = 'flex';
    banner.classList.remove('hidden');
    banner.classList.add('flex');

    this.cycleBannerTimer = setTimeout(() => {
      this.hideCycleWarningBanner();
    }, 3500);
  }

  triggerRuleAdjudication(cycleStatus) {
    this.gameOver = true;
    this.isBusy = false;
    this.hideCycleWarningBanner();
    let winnerColor = 'draw';
    let calloutTitle = '双方不变 · 判和';
    if (cycleStatus.verdict === 'RED_LOSE') { winnerColor = BLACK; calloutTitle = '红方长打不变 · 判负'; }
    else if (cycleStatus.verdict === 'BLACK_LOSE') { winnerColor = RED; calloutTitle = '黑方长打不变 · 判负'; }

    const rulePattern = {
      title: calloutTitle,
      stampText: winnerColor === 'draw' ? '握手言和' : '循环判负',
      badge: `循环裁决 · ${cycleStatus.verdictShort}`,
      poem: '“天道有常须变着，执迷不悟判负还。”',
      analysis: cycleStatus.ruleExplanation,
      highlightCoords: [],
      vfxType: 'stalemate_trap'
    };
    this.recordReplayOutcome?.(winnerColor, calloutTitle);
    this.updateRestartButtonLabel();
    this.updateUI(this.engine.isInCheck(this.engine.turn));
    this.sfx.playVictorySeal();
    this.showCenterCallout(calloutTitle, winnerColor === 'draw' ? RED : winnerColor, '循环裁定');
    setTimeout(() => { if (this.gameOver) this.showGameOverModal(winnerColor, rulePattern); }, 1450);
  }

  onTurnFinished(moveMeta = null) {
    const currentTurn = this.engine.turn;
    const inCheck = this.engine.isInCheck(currentTurn);
    const hasMoves = this.engine.hasAnyLegalMove(currentTurn);

    this.updateUI(inCheck);

    if (!hasMoves) {
      const winner = currentTurn === RED ? BLACK : RED;
      let pattern = CheckmateClassifier.classify(this.engine, currentTurn);
      if (this.activeDrillVfxType && winner === RED && this.engine.history.length <= 2) {
        if (pattern.vfxType !== this.activeDrillVfxType && typeof CheckmateClassifier.getMetaByType === 'function') {
          const drillMeta = CheckmateClassifier.getMetaByType(this.activeDrillVfxType);
          if (drillMeta) {
            pattern = {
              ...pattern,
              title: drillMeta.title,
              stampText: drillMeta.stampText,
              subBanner: drillMeta.subBanner,
              badge: drillMeta.badge,
              poem: drillMeta.poem,
              analysis: drillMeta.desc,
              vfxType: drillMeta.vfxType
            };
          }
        }
        this.activeDrillVfxType = null;
      }

      if (this.replayMode) {
        this.replayTrialCheckmated = true;
        this.isBusy = false;
        this.hideCycleWarningBanner();
        this.updateReplayPanelUI?.();
        this.updateTacticalGlowState();
        this.updateUI(inCheck);
        this.showCheckmateHighlights(pattern.highlightCoords);
        this.triggerCheckmateVFX(pattern, winner);
        this.showIllegalMovePrompt({
          icon: 'undo',
          title: `试招绝杀 · ${pattern.title}`,
          message: '当前分支已被绝杀，点击底部「悔棋」可退回继续推演。'
        }, 6000);
        return;
      }

      this.gameOver = true;
      this.isBusy = false;
      this.hideCycleWarningBanner();
      this.recordReplayOutcome?.(winner, pattern.title);
      this.updateRestartButtonLabel();
      this.updateTacticalGlowState();
      this.updateUI(inCheck);
      this.showCheckmateHighlights(pattern.highlightCoords);
      this.triggerCheckmateVFX(pattern, winner);
      const vfxWaitMs = Math.round((this.vfxAtmosphereDuration || 6.80) * 1000) + 80;
      setTimeout(() => { if (this.gameOver) this.showGameOverModal(winner, pattern); }, vfxWaitMs);
      return;
    }

    const cycleStatus = this.engine.analyzeCycleStatus();
    if (cycleStatus) {
      if (cycleStatus.remainingSteps === 0) {
        if (this.replayMode) {
          this.replayTrialCheckmated = true;
          this.isBusy = false;
          this.hideCycleWarningBanner();
          this.updateReplayPanelUI?.();
          this.updateTacticalGlowState();
          this.updateUI(inCheck);
          this.showCenterCallout(`${cycleStatus.verdictShort} · 请悔棋继续`, RED, '复盘裁定');
          this.showIllegalMovePrompt({
            icon: 'undo',
            title: `试招裁决 · ${cycleStatus.verdictShort}`,
            message: `${cycleStatus.ruleExplanation} 请点击「悔棋」退回继续推演。`
          }, 5500);
          return;
        }
        this.triggerRuleAdjudication(cycleStatus);
        return;
      }
      this.updateCycleWarningUI(cycleStatus);
      if (cycleStatus.remainingSteps === cycleStatus.period || cycleStatus.remainingSteps <= 2) {
        this.showIllegalMovePrompt({ icon: 'gavel', title: `循环警告 · 余${cycleStatus.remainingSteps}步`, message: cycleStatus.ruleExplanation }, 2800);
      }
    } else {
      this.hideCycleWarningBanner();
    }

    const attackerColor = currentTurn === RED ? BLACK : RED;
    if (inCheck && moveMeta?.wasCapture) {
      this.sfx.playCheck();
      this.showActionBurstPopup('吃·将', `${moveMeta.moverChar}斩${moveMeta.capturedChar} · 雷霆叫将`, attackerColor, 'capture_check');
    } else if (inCheck) {
      this.sfx.playCheck();
      this.showActionBurstPopup('將軍', moveMeta?.notation ? `${moveMeta.notation} · 威逼九宫` : '兵临城下 · 速解将围', attackerColor, 'check');
    } else if (moveMeta?.wasCapture) {
      this.showActionBurstPopup('吃', `${moveMeta.moverChar}吃${moveMeta.capturedChar} · ${moveMeta.notation}`, attackerColor, 'capture');
    }

    const shouldAITakeTurn = !this.replayMode
      ? (this.gameMode !== 'pvp' && currentTurn === BLACK && !this.gameOver)
      : (this.replayBranchActive && this.gameMode !== 'pvp' && !this.replayTrialCheckmated && currentTurn !== (this.replayHumanColor || RED));

    if (shouldAITakeTurn) {
      this.isBusy = true;
      const aiBadge = document.getElementById('ai-thinking');
      const aiLabel = document.getElementById('ai-thinking-label');
      aiBadge?.classList.remove('hidden');
      aiBadge?.classList.add('inline-flex');
      if (aiLabel) aiLabel.textContent = this.gameMode === 'inferno' ? '宗师推演…' : 'AI 推演…';

      this.requestAIMove(currentTurn, this.gameMode, (aiMove) => {
        aiBadge?.classList.add('hidden');
        aiBadge?.classList.remove('inline-flex');
        const stillValid = !this.replayMode
          ? !this.gameOver
          : (this.replayMode && this.replayBranchActive && !this.replayTrialCheckmated);
        if (aiMove && stillValid) {
          this.executeMoveAnimated(aiMove);
        } else {
          this.isBusy = false;
          this.updateUI(this.engine.isInCheck(this.engine.turn));
        }
      });
    } else {
      this.isBusy = false;
      this.updateUI(inCheck);
    }
  }

  handleBoardClick(clientX, clientY) {
    if (window.innerWidth < 1024 && !this.capturedTrayCollapsed) {
      this.capturedTrayCollapsed = true;
      this.syncCapturedTrayVisibility();
    }

    if (this.isBusy || (!this.replayMode && this.gameOver && !this.endgameEditor)) return;
    if (this.replayMode) {
      this.stopReplayAutoPlay?.();
      if (this.replayTrialCheckmated) {
        this.showIllegalMovePrompt({
          icon: 'undo',
          title: '当前分支已绝杀',
          message: '请点击底部「悔棋」退回上一步，继续尝试其他着法。'
        }, 3000);
        return;
      }
    }
    if (!this.endgameEditor && !this.replayMode && this.gameMode !== 'pvp' && this.engine.turn === BLACK) return;
    if (!this.endgameEditor && this.onlineRole && this.engine.turn !== this.onlineRole) return;

    if ((this.checkmateVFXGroup && this.checkmateVFXGroup.children.length > 0) || (this.checkmateHighlightRings && this.checkmateHighlightRings.length > 0)) {
      this.clearCheckmateVFX();
      this.clearCheckmateHighlights();
    }

    const rect = this.renderer.domElement.getBoundingClientRect();
    this._mouseVec.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );
    const raycaster = this._raycaster;
    raycaster.setFromCamera(this._mouseVec, this.camera);

    if (this.selectedSquare && this.moveIndicators.length > 0) {
      const hitTargets = [];
      for (let i = 0; i < this.moveIndicators.length; i++) {
        const children = this.moveIndicators[i].children;
        for (let j = 0; j < children.length; j++) {
          const ch = children[j];
          if (ch.userData && (ch.userData.isMoveTarget || ch.userData.isForbiddenTarget)) hitTargets.push(ch);
        }
      }
      const moveHits = raycaster.intersectObjects(hitTargets, false);
      if (moveHits.length > 0) {
        const hitData = moveHits[0].object.userData;
        if (hitData.isMoveTarget) {
          this.clearIllegalWarningRings();
          if (this.replayMode) {
            this.replayHumanColor = this.engine.turn;
            this.prepareReplayBranchAtCurrentStep?.(this.engine.turn);
          }
          this.executeMoveAnimated(hitData.move);
          return;
        } else if (hitData.isForbiddenTarget) {
          const diagnosis = this.engine.diagnoseIllegalMove(hitData.move.fr, hitData.move.fc, hitData.move.tr, hitData.move.tc);
          this.showIllegalMovePrompt(diagnosis);
          return;
        }
      }
    }

    const hitPlane = raycaster.ray.intersectPlane(this._boardPlane, this._intersectPt);
    if (hitPlane) {
      const c = Math.round(this._intersectPt.x / CELL_SIZE + 4);
      const r = Math.round(this._intersectPt.z / CELL_SIZE + 4.5);
      if (this.engine.inBounds(r, c)) {
        if (this.endgameEditor) { this.editBoardSquare(r, c); return; }
        const clickedPiece = this.engine.board[r][c];

        if (this.selectedSquare && this.selectedSquare.r === r && this.selectedSquare.c === c) {
          if (clickedPiece) this.sfx.playMove(clickedPiece.color, clickedPiece.type);
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          this.clearLegalMoveIndicators();
          this.updateTacticalGlowState();
          return;
        }

        if (clickedPiece && clickedPiece.color === this.engine.turn) {
          this.clearIllegalWarningRings();
          this.sfx.playPickUp(clickedPiece.color, false);
          this.selectedSquare = { r, c };
          const cache = this.engine._ensureTacticalCache?.(this.engine.turn, this.engine.board);
          this.legalMovesForSelected = cache
            ? (cache.legalMovesBySq.get(r * 9 + c) || [])
            : this.engine.getLegalMoves(r, c);
          this.showLegalMoveIndicators(r, c, this.legalMovesForSelected);
          return;
        }

        if (this.selectedSquare) {
          const matchingMove = this.legalMovesForSelected.find(m => m.tr === r && m.tc === c);
          if (matchingMove) {
            this.clearIllegalWarningRings();
            if (this.replayMode) {
              this.replayHumanColor = this.engine.turn;
              this.prepareReplayBranchAtCurrentStep?.(this.engine.turn);
            }
            this.executeMoveAnimated(matchingMove);
            return;
          }
          const diagnosis = this.engine.diagnoseIllegalMove(this.selectedSquare.r, this.selectedSquare.c, r, c);
          this.showIllegalMovePrompt(diagnosis);
          return;
        }
      }
    }

    if (this.selectedSquare) {
      const prevPiece = this.engine.board[this.selectedSquare.r]?.[this.selectedSquare.c];
      if (prevPiece) this.sfx.playMove(prevPiece.color, prevPiece.type);
    }
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.clearLegalMoveIndicators();
    this.updateTacticalGlowState();
  }

  setupControlsAndEvents() {
    const dom = this.renderer.domElement;
    const activePointers = new Map();
    let primaryDownPos = { x: 0, y: 0 };
    let primaryDownTime = 0;
    let maxMoveDistance = 0;
    let lastPinchDist = 0;
    let hadMultiTouch = false;

    const getPinchDistance = () => {
      const pts = Array.from(activePointers.values());
      return pts.length < 2 ? 0 : Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    };

    dom.addEventListener('contextmenu', e => e.preventDefault());
    dom.addEventListener('pointerdown', e => {
      this.sfx.init();
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (activePointers.size === 1) {
        primaryDownPos = { x: e.clientX, y: e.clientY };
        primaryDownTime = performance.now();
        maxMoveDistance = 0;
        hadMultiTouch = false;
      } else if (activePointers.size === 2) {
        hadMultiTouch = true;
        lastPinchDist = getPinchDistance();
      }
    });

    window.addEventListener('pointermove', e => {
      if (!activePointers.has(e.pointerId)) return;
      const prev = activePointers.get(e.pointerId);
      const dx = e.clientX - prev.x;
      const dy = e.clientY - prev.y;
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (activePointers.size === 1 && !hadMultiTouch) {
        maxMoveDistance = Math.max(maxMoveDistance, Math.hypot(e.clientX - primaryDownPos.x, e.clientY - primaryDownPos.y));
        const isTouch = e.pointerType === 'touch';
        if (maxMoveDistance > (isTouch ? 6 : 2)) {
          const rotSpeed = isTouch ? 0.0085 : 0.007;
          this.desiredSpherical.theta -= dx * rotSpeed;
          this.desiredSpherical.phi = THREE.MathUtils.clamp(this.desiredSpherical.phi - dy * (rotSpeed * 0.85), 0.12, 1.28);
        }
      } else if (activePointers.size === 2) {
        const curDist = getPinchDistance();
        if (lastPinchDist > 0 && curDist > 0) {
          this.desiredSpherical.radius = THREE.MathUtils.clamp(this.desiredSpherical.radius + (lastPinchDist - curDist) * 0.045, 9.5, 32.0);
        }
        lastPinchDist = curDist;
      }
    }, { passive: true });

    const onPointerEnd = e => {
      if (!activePointers.has(e.pointerId)) return;
      activePointers.delete(e.pointerId);
      if (activePointers.size < 2) lastPinchDist = 0;
      if (activePointers.size === 0 && !hadMultiTouch && e.type === 'pointerup') {
        if (maxMoveDistance < (e.pointerType === 'touch' ? 14 : 6) && performance.now() - primaryDownTime < 550) {
          this.handleBoardClick(e.clientX, e.clientY);
        }
      }
    };

    window.addEventListener('pointerup', onPointerEnd);
    window.addEventListener('pointercancel', onPointerEnd);
    dom.addEventListener('wheel', e => {
      e.preventDefault();
      this.desiredSpherical.radius = THREE.MathUtils.clamp(this.desiredSpherical.radius + e.deltaY * 0.012, 9.5, 32.0);
    }, { passive: false });

    window.addEventListener('resize', () => {
      this.updateViewportScale(true);
      this.syncCapturedTrayVisibility();
    });
  }

  animate() {
    requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    const camLerp = this.vfxAtmosphereTimer > 0 ? 0.25 : 0.1;
    this.camSpherical.radius = THREE.MathUtils.lerp(this.camSpherical.radius, this.desiredSpherical.radius, camLerp);
    this.camSpherical.phi = THREE.MathUtils.lerp(this.camSpherical.phi, this.desiredSpherical.phi, camLerp);
    this.camSpherical.theta = THREE.MathUtils.lerp(this.camSpherical.theta, this.desiredSpherical.theta, camLerp);

    const sinPhi = Math.sin(this.camSpherical.phi);
    const camX = this.camTarget.x + this.camSpherical.radius * sinPhi * Math.sin(this.camSpherical.theta);
    const camY = this.camTarget.y + this.camSpherical.radius * Math.cos(this.camSpherical.phi);
    const camZ = this.camTarget.z + this.camSpherical.radius * sinPhi * Math.cos(this.camSpherical.theta);

    if (this.cameraShake > 0.005) {
      const shakeOffset = (Math.random() - 0.5) * this.cameraShake;
      this.camera.position.set(camX + shakeOffset, camY + shakeOffset * 0.7, camZ + shakeOffset);
      this.cameraShake *= 0.84;
    } else {
      this.camera.position.set(camX, camY, camZ);
      this.cameraShake = 0;
    }
    this.camera.lookAt(this.camTarget);

    for (const mesh of this.pieceMeshes.values()) {
      if (this.activeAnimations.some(a => a.mesh === mesh)) continue;
      if (this._activeCheckerMeshes && this._activeCheckerMeshes.some(x => x.mesh === mesh) && this.vfxAtmosphereTimer > 0) continue;
      const ud = mesh.userData;
      if (!ud) continue;
      const { r, c } = ud;
      const isSelected = Boolean(this.selectedSquare && this.selectedSquare.r === r && this.selectedSquare.c === c);

      if (isSelected) {
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, 0.36 + Math.sin(elapsed * 5.2) * 0.06, 0.22);
        mesh.rotation.x = Math.sin(elapsed * 4.0) * 0.07;
        mesh.rotation.z = Math.cos(elapsed * 4.0) * 0.07;
      } else {
        if (Math.abs(mesh.position.y) > 0.001) mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, 0, 0.24);
        if (Math.abs(mesh.rotation.x) > 0.001 || Math.abs(mesh.rotation.z) > 0.001) {
          mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, 0, 0.24);
          mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, 0, 0.24);
        }
      }
    }

    if (this.selectedRing.visible) {
      const s = 1.0 + Math.sin(elapsed * 4.8) * 0.04;
      this.selectedRing.scale.set(s, s, 1);
      this.selectedRing.rotation.z = elapsed * 0.75;
    }
    if (this.lastFromRing?.visible) {
      this.lastFromRing.rotation.z = -elapsed * 0.35;
    }
    if (this.lastToRing?.visible) {
      const s = 0.98 + Math.sin(elapsed * 3.2) * 0.03;
      this.lastToRing.scale.set(s, s, 1);
      this.lastToRing.rotation.z = elapsed * 0.45;
    }

    for (const ind of this.moveIndicators) {
      const u = ind.userData;
      const ph = u.phase || 0;
      if (u.isCapture) {
        const s = 0.97 + Math.sin(elapsed * 4.8 + ph) * 0.05;
        ind.scale.set(s, 1, s);
        if (u.baseLock) u.baseLock.rotation.z = elapsed * 0.85 + ph;
      } else {
        const s = 0.96 + Math.sin(elapsed * 4.2 + ph) * 0.06;
        ind.scale.set(s, 1, s);
        if (u.lotusDisc) u.lotusDisc.rotation.z = elapsed * 0.65 + ph;
      }
    }

    if (this.impactWaves && this.impactWaves.length > 0) {
      for (let i = this.impactWaves.length - 1; i >= 0; i--) {
        const w = this.impactWaves[i];
        w.age += dt;
        const p = Math.min(1, w.age / w.maxAge);
        if (w.isTrail) {
          w.mesh.material.opacity = (1 - p) * 0.78;
        } else if (w.isSlash) {
          const sc = 0.75 + (1 - Math.pow(1 - p, 3)) * (w.maxScale - 0.75);
          w.mesh.scale.set(sc, sc, 1);
          w.mesh.rotation.z += dt * 4.2;
          w.mesh.material.opacity = (1 - p) * 0.90;
        } else {
          const sc = 0.70 + (1 - Math.pow(1 - p, 2)) * (w.maxScale - 0.70);
          w.mesh.scale.set(sc, sc, 1);
          w.mesh.material.opacity = (1 - p) * 0.82;
        }
        if (p >= 1) {
          this.scene.remove(w.mesh);
          w.mesh.geometry?.dispose?.();
          w.mesh.material?.dispose?.();
          this.impactWaves.splice(i, 1);
        }
      }
    }

    if (this.illegalWarningRings && this.illegalWarningRings.length > 0) {
      for (let i = this.illegalWarningRings.length - 1; i >= 0; i--) {
        const item = this.illegalWarningRings[i];
        item.age += dt;
        const p = Math.min(1, item.age / item.maxAge);
        const s = 0.94 + Math.sin(item.age * 10) * 0.06;
        item.mesh.scale.set(s, s, 1);
        item.mesh.rotation.z += dt * 1.2;
        item.mesh.material.opacity = (1 - p) * 0.88;
        if (p >= 1) {
          this.scene.remove(item.mesh);
          item.mesh.geometry?.dispose?.();
          item.mesh.material?.dispose?.();
          this.illegalWarningRings.splice(i, 1);
        }
      }
    }

    for (let i = this.activeAnimations.length - 1; i >= 0; i--) {
      const anim = this.activeAnimations[i];
      anim.elapsed += dt;
      const t = Math.min(anim.elapsed / anim.duration, 1);
      anim.update(t);
      if (t >= 1) {
        this.activeAnimations.splice(i, 1);
        if (anim.complete) anim.complete();
      }
    }

    if (this.vfxAtmosphereTimer > 0) {
      this.vfxAtmosphereTimer = Math.max(0, this.vfxAtmosphereTimer - dt);
      if (!this._vfxCustomColorGrading) {
        const progress = 1 - (this.vfxAtmosphereTimer / (this.vfxAtmosphereDuration || 3.80));
        let eclipseFactor = 0;
        if (progress < 0.14) eclipseFactor = progress / 0.14;
        else if (progress < 0.76) eclipseFactor = 1;
        else eclipseFactor = 1 - (progress - 0.76) / 0.24;
        const sc = this.getActiveSceneConfig();
        this._tempDayColor.setHex(sc.bgHex || 0xdbe9dc);
        this._tempDayColor.lerp(this._tempNightColor, Math.max(0, Math.min(1, eclipseFactor)) * 0.76);
        this.scene.background.copy(this._tempDayColor);
        if (this.scene.fog) this.scene.fog.color.copy(this._tempDayColor);
        if (this.sunLight) this.sunLight.intensity = THREE.MathUtils.lerp(sc.sunIntensity || 0.88, 0.24, eclipseFactor);
        if (this.hemiLight) this.hemiLight.intensity = THREE.MathUtils.lerp(sc.hemiIntensity || 0.65, 0.22, eclipseFactor);
      }
    }
    for (let i = this.checkmateVFXAnimations.length - 1; i >= 0; i--) {
      const vfx = this.checkmateVFXAnimations[i];
      vfx.elapsed += dt;
      const t = Math.min(vfx.elapsed / vfx.duration, 1);
      vfx.update(t, dt);
      if (t >= 1) this.checkmateVFXAnimations.splice(i, 1);
    }
    if (
      this.vfxAtmosphereDuration > 0 &&
      this.vfxAtmosphereTimer <= 0 &&
      this.checkmateVFXAnimations.length === 0
    ) {
      this.clearCheckmateVFX();
      this.clearCheckmateHighlights();
      this.vfxAtmosphereDuration = 0;
    }
    for (let i = this.shatterParticles.length - 1; i >= 0; i--) {
      const p = this.shatterParticles[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        p.mesh.geometry?.dispose?.();
        p.mesh.material?.dispose?.();
        this.shatterParticles.splice(i, 1);
        continue;
      }
      p.vy -= 14.5 * dt;
      this._tempVec3.set(p.vx, p.vy, p.vz);
      p.mesh.position.addScaledVector(this._tempVec3, dt);
      if (p.mesh.position.y < 0.04) { p.mesh.position.y = 0.04; p.vy = -p.vy * 0.42; }
      p.mesh.material.opacity = Math.max(0, 1 - p.life / p.maxLife);
    }

    if (this.currentSceneId === 'ancient_battlefield') {
      if (this.battlefieldFlames) {
        this.battlefieldFlames.forEach(f => {
          const sx = 0.92 + Math.sin(elapsed * 9.5 + f.phase) * 0.12;
          const sy = 0.90 + Math.cos(elapsed * 12.0 + f.phase) * 0.18;
          f.outer.scale.set(sx, sy, sx);
          f.inner.scale.set(sy, sx, sy);
          f.group.rotation.y = elapsed * 2.2 + f.phase;
        });
      }
      if (this.battlefieldLights) {
        this.battlefieldLights.forEach(bl => {
          bl.light.intensity = bl.baseIntensity + Math.sin(elapsed * 11.0 + bl.phase) * 0.22;
        });
      }
      if (this.warDrumMallet) {
        this.warDrumMallet.rotation.x = Math.abs(Math.sin(elapsed * 3.6)) * 0.55 - 0.15;
      }
      if (this.warBanners) {
        this.warBanners.forEach(wb => {
          wb.mesh.rotation.y = Math.sin(elapsed * 2.4 + wb.phase) * 0.18;
          wb.mesh.rotation.z = Math.cos(elapsed * 1.9 + wb.phase) * 0.045;
        });
      }
      if (this.battlefieldEmbers) {
        this.battlefieldEmbers.forEach(em => {
          em.sprite.position.y += em.speedY * dt;
          em.sprite.position.x += Math.sin(elapsed * 1.2 + em.phase) * em.speedX * dt;
          em.sprite.position.z += Math.cos(elapsed * 0.9 + em.phase) * 0.35 * dt;
          const flicker = 0.55 + 0.45 * Math.sin(elapsed * 6.5 + em.phase);
          em.sprite.material.opacity = flicker;
          if (em.sprite.position.y > 9.5) {
            em.sprite.position.y = -3.8;
            em.sprite.position.x = (Math.random() - 0.5) * 26;
            em.sprite.position.z = (Math.random() - 0.5) * 26;
          }
        });
      }
    } else if (this.currentSceneId === 'imperial_study') {
      if (this.studyLanterns) {
        this.studyLanterns.forEach(lt => {
          lt.group.position.y = lt.baseY + Math.sin(elapsed * 1.6 + lt.phase) * 0.14;
          lt.group.rotation.y = elapsed * 0.4 + lt.phase;
          lt.light.intensity = 0.52 + Math.sin(elapsed * 4.2 + lt.phase) * 0.10;
        });
      }
      if (this.studyAstrolabe) {
        this.studyAstrolabe.rotation.z = elapsed * 0.12;
      }
      if (this.studyWaterLanterns) {
        this.studyWaterLanterns.forEach(wl => {
          wl.angle += wl.speed * dt;
          wl.group.position.x = Math.cos(wl.angle) * wl.radius;
          wl.group.position.z = Math.sin(wl.angle) * wl.radius;
          wl.group.position.y = -4.28 + Math.sin(elapsed * 2.2 + wl.phase) * 0.03;
          wl.group.rotation.y = elapsed * 0.5 + wl.phase;
        });
      }
      if (this.studySmokeRings) {
        this.studySmokeRings.forEach(sr => {
          const cycle = (elapsed * 0.42 + sr.baseOffset) % 1.4;
          sr.mesh.position.y = 0.58 + cycle;
          sr.mesh.position.x = -6.35 + Math.sin(elapsed * 1.6 + sr.phase) * 0.08 * cycle;
          const sc = 0.75 + cycle * 1.15;
          sr.mesh.scale.set(sc, sc, 1);
          sr.mesh.material.opacity = Math.max(0, (1 - cycle / 1.4) * 0.34);
        });
      }
      if (this.studyClouds) {
        this.studyClouds.forEach(cl => {
          cl.group.position.x = cl.baseX + Math.sin(elapsed * 0.45 + cl.phase) * 0.45;
          cl.group.position.z = cl.baseZ + Math.cos(elapsed * 0.38 + cl.phase) * 0.35;
        });
      }
      if (this.studyStardust) {
        this.studyStardust.forEach(sd => {
          sd.sprite.position.y += sd.speedY * dt;
          sd.sprite.position.x += Math.sin(elapsed * 0.9 + sd.phase) * sd.speedX * dt;
          sd.sprite.material.opacity = 0.42 + 0.38 * Math.sin(elapsed * 4.5 + sd.phase);
          if (sd.sprite.position.y > 9.5) {
            sd.sprite.position.y = -3.2;
          }
        });
      }
    } else {
      this.trees.forEach(t => {
        t.group.rotation.z = Math.sin(elapsed * 1.2 + t.phase) * 0.035;
        t.group.rotation.x = Math.cos(elapsed * 0.9 + t.phase) * 0.025;
      });
      if (this.koiFishList) {
        this.koiFishList.forEach(koi => {
          koi.angle += koi.speed * dt;
          const kx = Math.cos(koi.angle) * koi.radius;
          const kz = Math.sin(koi.angle) * koi.radius;
          koi.group.position.set(kx, -4.25 + Math.sin(elapsed * 2.5 + koi.phase) * 0.03, kz);
          koi.group.rotation.y = -koi.angle + Math.PI;
          if (koi.tail) koi.tail.rotation.y = Math.sin(elapsed * 10.0 + koi.phase) * 0.35;
        });
      }
      if (this.incenseSmokeRings) {
        this.incenseSmokeRings.forEach(sr => {
          const cycle = (elapsed * 0.45 + sr.baseOffset) % 1.4;
          sr.mesh.position.y = 0.68 + cycle;
          sr.mesh.position.x = Math.sin(elapsed * 1.8 + sr.phase) * 0.08 * cycle;
          const sc = 0.8 + cycle * 1.1;
          sr.mesh.scale.set(sc, sc, 1);
          sr.mesh.material.opacity = Math.max(0, (1 - cycle / 1.4) * 0.38);
        });
      }

      this.breezeParticles.forEach(bp => {
        bp.mesh.position.y -= bp.speedY * dt;
        bp.mesh.position.x += Math.sin(elapsed * 0.8 + bp.phase) * bp.speedX * dt;
        bp.mesh.position.z += Math.cos(elapsed * 0.6 + bp.phase) * 0.3 * dt;
        bp.mesh.rotation.x += dt * 1.2;
        bp.mesh.rotation.y += dt * 0.9;

        if (bp.mesh.position.y < -3.5) {
          bp.mesh.position.y = 9.5;
          bp.mesh.position.x = (Math.random() - 0.5) * 26;
          bp.mesh.position.z = (Math.random() - 0.5) * 26;
        }
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateRestartButtonLabel() {
    const restartLabel = document.getElementById('restart-label');
    const restartIcon = document.getElementById('restart-icon');
    if (!restartLabel) return;

    const inRoom = Boolean(this.onlineRole);
    if (this.gameOver) {
      restartLabel.textContent = '再来一局';
      if (restartIcon) restartIcon.textContent = 'replay';
    } else if (inRoom) {
      restartLabel.textContent = '重新对局';
      if (restartIcon) restartIcon.textContent = 'restart_alt';
    } else if (this.customEndgameSnapshot) {
      restartLabel.textContent = '重置残局';
      if (restartIcon) restartIcon.textContent = 'restart_alt';
    } else {
      restartLabel.textContent = '新局';
      if (restartIcon) restartIcon.textContent = 'restart_alt';
    }
  }

  renderGroupedCapturedChips(piecesList, chipClass) {
    if (!piecesList || piecesList.length === 0) return '';
    const order = { r: 1, n: 2, c: 3, b: 4, a: 5, p: 6, hidden: 7, k: 0 };
    const grouped = new Map();
    for (const p of piecesList) {
      if (p.isHidden) {
        const key = 'hidden_dark';
        if (!grouped.has(key)) {
          grouped.set(key, { char: '暗', type: 'hidden', isHidden: true, count: 0 });
        }
        grouped.get(key).count++;
      } else {
        const key = p.type || p.char;
        if (!grouped.has(key)) {
          grouped.set(key, { char: p.char, type: p.type, isHidden: false, count: 0 });
        }
        grouped.get(key).count++;
      }
    }
    const sorted = Array.from(grouped.values()).sort((a, b) => (order[a.type] ?? 9) - (order[b.type] ?? 9));
    return sorted.map(item => {
      const badge = item.count > 1 ? `<em class="chip-count-badge">×${item.count}</em>` : '';
      if (item.isHidden) {
        return `<span class="captured-chip ${chipClass} chip-hidden-back serif-cn" title="暗子（背面朝上）"><span class="chip-back-emblem"></span>${badge}</span>`;
      }
      return `<span class="captured-chip ${chipClass} serif-cn">${item.char}${badge}</span>`;
    }).join('');
  }

  syncCapturedTrayVisibility() {
    const hasRedCaptures = this.engine.capturedBlack.length > 0;
    const hasBlackCaptures = this.engine.capturedRed.length > 0;
    const hasAny = hasRedCaptures || hasBlackCaptures;

    const toggleBtn = document.getElementById('captured-toggle');
    const contentEl = document.getElementById('captured-content');
    const redCard = document.getElementById('captured-red-card');
    const blackCard = document.getElementById('captured-black-card');
    const capturedRow = document.getElementById('captured-row');

    if (toggleBtn) {
      toggleBtn.classList.toggle('hidden', !hasAny);
      const arrow = this.capturedTrayCollapsed ? '▶' : '▼';
      toggleBtn.innerHTML = `<span class="serif-cn">战果</span> <span class="text-red-700">红${this.engine.capturedBlack.length}</span>·<span class="text-slate-900">黑${this.engine.capturedRed.length}</span> ${arrow}`;
    }

    if (redCard) redCard.classList.toggle('hidden', !hasRedCaptures);
    if (blackCard) blackCard.classList.toggle('hidden', !hasBlackCaptures);

    if (capturedRow) {
      capturedRow.classList.toggle('hidden', !hasAny || this.capturedTrayCollapsed);
    }
    if (contentEl) {
      contentEl.classList.toggle('hidden', this.capturedTrayCollapsed);
    }
  }

  updateUI(inCheck = false) {
    const turnDot = document.getElementById('turn-dot');
    const turnText = document.getElementById('turn-text');
    const checkBadge = document.getElementById('check-badge');
    const btnUndo = document.getElementById('btn-undo');
    const btnHint = document.getElementById('btn-hint');
    const btnDraw = document.getElementById('btn-offer-draw');
    const btnResign = document.getElementById('btn-resign');

    if (this.replayMode && this.replayTrialCheckmated) {
      turnDot.className = 'w-2.5 h-2.5 rounded-full bg-red-600 ring-4 ring-red-600/30 animate-ping';
      turnText.className = 'serif-cn font-bold text-xs text-red-700';
      turnText.textContent = '试招被杀 · 点悔棋继续';
    } else if (this.gameOver && !this.replayMode) {
      turnDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-600 ring-4 ring-amber-600/20';
      turnText.className = 'serif-cn font-bold text-xs text-amber-900';
      turnText.textContent = this.endgameReasonText || '终局盘面';
    } else if (this.engine.turn === RED) {
      turnDot.className = 'w-2.5 h-2.5 rounded-full bg-red-600 ring-4 ring-red-600/20';
      turnText.className = 'serif-cn font-bold text-xs text-red-800';
      const isAIOppInReplay = this.replayMode && this.replayBranchActive && this.gameMode !== 'pvp' && this.replayHumanColor === BLACK;
      turnText.textContent = this.replayMode ? (isAIOppInReplay ? '复盘 · 红方AI' : '复盘 · 红方') : '红方行棋';
    } else {
      turnDot.className = 'w-2.5 h-2.5 rounded-full bg-slate-900 ring-4 ring-slate-900/20';
      turnText.className = 'serif-cn font-bold text-xs text-slate-900';
      const modeLabels = { pvp: '黑方行棋', easy: '简单AI', hard: '困难AI', inferno: '宗师AI' };
      const isAIOppInReplay = this.replayMode && this.replayBranchActive && this.gameMode !== 'pvp' && (this.replayHumanColor || RED) === RED;
      turnText.textContent = this.replayMode ? (isAIOppInReplay ? `复盘 · ${modeLabels[this.gameMode] || 'AI'}` : '复盘 · 黑方') : (modeLabels[this.gameMode] || 'AI');
    }

    if (inCheck && (!this.gameOver || this.replayMode)) {
      checkBadge.classList.remove('hidden');
      checkBadge.classList.add('flex');
    } else {
      checkBadge.classList.add('hidden');
      checkBadge.classList.remove('flex');
    }

    const variantBadgeEl = document.getElementById('variant-mode-badge');
    if (variantBadgeEl) {
      const isJieqi = this.engine.variantMode === 'jieqi';
      variantBadgeEl.textContent = isJieqi ? '揭棋' : '象棋';
      variantBadgeEl.className = isJieqi
        ? 'inline-block cursor-pointer serif-cn text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600/15 text-amber-900 border border-amber-600/30'
        : 'inline-block cursor-pointer serif-cn text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-800/10 text-red-900 border border-red-800/20';
    }

    const isOnline = Boolean(this.onlineRole && (this.isOnlineConnected || this.conn?.open));
    ['mode-pvp', 'mode-easy', 'mode-hard', 'mode-inferno'].forEach(id => {
      document.getElementById(id)?.toggleAttribute('disabled', Boolean(this.onlineRole));
    });

    btnDraw?.classList.toggle('hidden', !isOnline);
    btnResign?.classList.toggle('hidden', !isOnline);

    ['btn-endgame-editor', 'btn-vfx-panel', 'btn-standard-new-game'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.disabled = Boolean(this.onlineRole);
        el.classList.toggle('opacity-45', Boolean(this.onlineRole));
        el.classList.toggle('cursor-not-allowed', Boolean(this.onlineRole));
        el.title = this.onlineRole ? '联机中不可使用' : '';
      }
    });

    if (btnUndo) {
      if (this.replayMode) {
        btnUndo.disabled = this.isBusy || (this.replayStepIndex || 0) <= 0;
        btnUndo.classList.toggle('ring-2', Boolean(this.replayTrialCheckmated));
        btnUndo.classList.toggle('ring-amber-500', Boolean(this.replayTrialCheckmated));
        btnUndo.classList.toggle('bg-amber-100', Boolean(this.replayTrialCheckmated));
      } else {
        btnUndo.disabled = this.engine.history.length === 0 || this.isBusy || this.gameOver || Boolean(this.pendingUndoRequest);
        btnUndo.classList.remove('ring-2', 'ring-amber-500', 'bg-amber-100');
      }
    }
    if (btnHint) {
      if (this.replayMode) {
        btnHint.disabled = this.isBusy || Boolean(this.replayTrialCheckmated) || Boolean(this.onlineRole);
      } else {
        btnHint.disabled = this.isBusy || this.gameOver || (this.gameMode !== 'pvp' && this.engine.turn !== RED) || Boolean(this.onlineRole);
      }
    }
    if (btnDraw) {
      btnDraw.disabled = !isOnline || this.isBusy || this.gameOver || this.replayMode;
    }
    if (btnResign) {
      btnResign.disabled = !isOnline || this.isBusy || this.gameOver || this.replayMode;
    }

    this.updateRestartButtonLabel();

    const redTray = document.getElementById('captured-by-red');
    const blackTray = document.getElementById('captured-by-black');
    const redCountEl = document.getElementById('captured-red-count');
    const blackCountEl = document.getElementById('captured-black-count');

    const hasRedCaptures = this.engine.capturedBlack.length > 0;
    const hasBlackCaptures = this.engine.capturedRed.length > 0;

    if (redCountEl) redCountEl.textContent = `${this.engine.capturedBlack.length}子`;
    if (blackCountEl) blackCountEl.textContent = `${this.engine.capturedRed.length}子`;

    if (redTray) {
      redTray.innerHTML = hasRedCaptures
        ? this.renderGroupedCapturedChips(this.engine.capturedBlack, 'chip-obsidian')
        : '';
    }
    if (blackTray) {
      blackTray.innerHTML = hasBlackCaptures
        ? this.renderGroupedCapturedChips(this.engine.capturedRed, 'chip-ivory')
        : '';
    }

    this.syncCapturedTrayVisibility();
  }

  toggleCapturedTray() {
    this.sfx.playSelect();
    this.capturedTrayCollapsed = !this.capturedTrayCollapsed;
    this.syncCapturedTrayVisibility();
  }

  showCenterCallout(text, color = RED, badgeLabel = '') {
    const container = document.getElementById('center-callout');
    const inner = document.getElementById('center-callout-inner');
    const textEl = document.getElementById('center-callout-text');
    const badgeEl = document.getElementById('center-callout-badge');
    if (!container || !inner) return;

    if (textEl) {
      textEl.textContent = text;
    } else {
      inner.textContent = text;
    }
    if (badgeEl) {
      const autoBadge = badgeLabel || (text.includes('支招') || text.includes('进') || text.includes('平') || text.includes('退') ? '锦囊妙手' : '雅集通告');
      badgeEl.textContent = autoBadge;
    }

    inner.dataset.theme = color === BLACK ? 'black' : 'red';
    container.classList.remove('hidden', 'callout-animate');
    void container.offsetWidth;
    container.classList.add('callout-animate');
    if (this.calloutHideTimer) clearTimeout(this.calloutHideTimer);
    this.calloutHideTimer = setTimeout(() => container.classList.add('hidden'), 1750);
  }

  showGameOverModal(winnerColor, pattern) {
    const modal = document.getElementById('gameover-modal');
    const icon = document.getElementById('winner-icon');
    const title = document.getElementById('winner-title');
    const subtitle = document.getElementById('winner-subtitle');
    const badgeText = document.getElementById('checkmate-badge-text');
    const poemEl = document.getElementById('checkmate-poem');
    const descEl = document.getElementById('winner-desc');
    const btnReplayVfx = document.getElementById('btn-modal-replay-vfx');

    const rounds = Math.max(1, Math.ceil(this.engine.history.length / 2));
    if (winnerColor === 'draw') {
      icon.textContent = '和';
      icon.className = 'w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-amber-50 flex items-center justify-center serif-cn text-2xl font-black shadow-lg ring-2 ring-amber-300/60 shrink-0';
      subtitle.textContent = `握手言和 · 共 ${rounds} 回合`;
    } else if (winnerColor === RED) {
      icon.textContent = '帥';
      icon.className = 'w-14 h-14 rounded-2xl bg-gradient-to-br from-red-700 to-amber-800 text-amber-50 flex items-center justify-center serif-cn text-2xl font-black shadow-lg ring-2 ring-amber-300/60 shrink-0';
      subtitle.className = 'serif-cn text-xs font-bold text-red-800 mt-0.5';
      subtitle.textContent = `红方（白玉）胜 · 第 ${rounds} 回合终局`;
    } else {
      icon.textContent = '將';
      icon.className = 'w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-950 to-black text-amber-300 flex items-center justify-center serif-cn text-2xl font-black shadow-lg ring-2 ring-amber-400/60 shrink-0';
      subtitle.className = 'serif-cn text-xs font-bold text-slate-900 mt-0.5';
      subtitle.textContent = `黑方（黑曜石）胜 · 第 ${rounds} 回合终局`;
    }

    title.textContent = pattern.title || '绝杀获胜';
    badgeText.textContent = pattern.badge || '古谱绝杀判定';
    poemEl.textContent = pattern.poem || '“运筹帷幄决千里，一着绝杀定乾坤。”';
    descEl.textContent = pattern.analysis || '精彩对局！';

    if (btnReplayVfx) {
      btnReplayVfx.classList.toggle('hidden', Boolean(pattern.isDrawOrResign));
    }

    this.updateRestartButtonLabel();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeModalOnly() {
    document.getElementById('gameover-modal')?.classList.add('hidden');
    document.getElementById('gameover-modal')?.classList.remove('flex');
    this.updateRestartButtonLabel();
  }

  setGameMode(mode) {
    if (this.isBusy || (this.onlineRole && mode !== 'pvp')) return;
    this.gameMode = mode;
    this.updatePiecesOrientation();
    ['pvp', 'easy', 'hard', 'inferno'].forEach(m => {
      const btn = document.getElementById(`mode-${m}`);
      if (!btn) return;
      btn.classList.remove('seg-active', 'seg-inferno-active');
      if (m === mode) btn.classList.add(mode === 'inferno' ? 'seg-inferno-active' : 'seg-active');
    });
    this.sfx.playSelect();
    this.resetTelemetryUI();
    this.updateTacticalGlowState();
    if (this.replayMode) {
      this.updateReplayPanelUI?.();
    }
    const shouldTriggerAI = !this.replayMode
      ? (this.gameMode !== 'pvp' && this.engine.turn === BLACK && !this.gameOver)
      : (this.replayBranchActive && this.gameMode !== 'pvp' && !this.replayTrialCheckmated && this.engine.turn !== (this.replayHumanColor || RED));
    if (shouldTriggerAI) {
      this.onTurnFinished();
    } else {
      this.updateUI(this.engine.isInCheck(this.engine.turn));
    }
  }

  undoMove(isRemoteApproved = false) {
    if (this.replayMode) {
      this.undoMoveInReplay?.();
      return;
    }
    if (this.isBusy || this.engine.history.length === 0) return;
    if (this.onlineRole && this.conn?.open && !isRemoteApproved) {
      if (this.pendingUndoRequest) return;
      this.pendingUndoRequest = true;
      this.sfx.playSelect();
      try {
        this.conn.send({ type: 'undo_request' });
        this.showCenterCallout('已发送悔棋请求', this.onlineRole);
        this.undoRequestTimeout = setTimeout(() => {
          if (!this.pendingUndoRequest) return;
          this.pendingUndoRequest = false;
          this.showCenterCallout('悔棋请求未获回应', this.onlineRole);
          this.updateUI(this.engine.isInCheck(this.engine.turn));
        }, 15000);
      } catch (_) {
        this.pendingUndoRequest = false;
        this.updateOnlineStatusUI('悔棋发送失败，请检查连接', false);
      }
      this.updateUI(this.engine.isInCheck(this.engine.turn));
      return;
    }
    this.pendingUndoRequest = false;
    clearTimeout(this.undoRequestTimeout);
    this.sfx.playSelect();
    this.gameOver = false;
    this.endgameReasonText = null;
    this.closeModalOnly();
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.clearCheckmateHighlights();
    this.clearCheckmateVFX();
    this.clearAllTransientVFX(false);

    if (!this.onlineRole && this.gameMode !== 'pvp' && this.engine.turn === RED && this.engine.history.length >= 2) {
      this.engine.undoLastMove();
      this.popReplayStep?.();
      this.engine.undoLastMove();
      this.popReplayStep?.();
    } else {
      this.engine.undoLastMove();
      this.popReplayStep?.();
    }
    if (this.engine.history.length === 0) {
      this.resetTelemetryUI();
      this.setLastMoveMarkers(null, null, null, null);
    } else {
      const prevH = this.engine.history[this.engine.history.length - 1];
      if (prevH?.move) {
        this.setLastMoveMarkers(prevH.move.fr, prevH.move.fc, prevH.move.tr, prevH.move.tc);
      }
    }
    this.syncPiecesFromEngine();
    this.updateRestartButtonLabel();
    this.updateUI(this.engine.isInCheck(this.engine.turn));
  }

  respondUndoRequest(approved) {
    document.getElementById('undo-request-modal')?.classList.add('hidden');
    if (!this.conn?.open) return;
    if (approved) {
      this.conn.send({ type: 'undo_accept' });
      this.undoMove(true);
      this.showCenterCallout('已同意悔棋', this.onlineRole || RED);
    } else {
      this.conn.send({ type: 'undo_reject' });
      this.sfx.playSelect();
    }
  }

  handleRestartButton() {
    if (this.replayMode) {
      this.exitReplayMode(true);
    }

    if (this.gameOver) {
      this.handlePlayAgain();
      return;
    }

    if (this.onlineRole) {
      this.requestRematchOnline(false);
      return;
    }

    if (this.customEndgameSnapshot) {
      this.replayEndgame();
      return;
    }
    this.restartGame();
  }

  handlePlayAgain() {
    if (this.onlineRole) {
      this.requestRematchOnline(true);
      return;
    }
    if (this.customEndgameSnapshot) {
      this.replayEndgame();
    } else {
      this.restartGame();
    }
  }

  openVariantSelectModal() {
    if (this.onlineRole && this.conn?.open) {
      this.showCenterCallout('联机中不可切换棋制', this.onlineRole);
      return;
    }
    this.sfx.playSelect();
    this.toggleMoreMenu(false);
    document.getElementById('scene-select-modal')?.classList.add('hidden');
    this.renderVariantModalOptions();
    document.getElementById('variant-select-modal')?.classList.remove('hidden');
  }

  closeVariantSelectModal() {
    document.getElementById('variant-select-modal')?.classList.add('hidden');
  }

  renderVariantModalOptions() {
    const container = document.getElementById('variant-options-list');
    if (!container) return;
    const currentVariant = this.engine.variantMode || this.variantMode || 'xiangqi';
    container.innerHTML = this.variantRegistry.map(v => {
      const isCurrent = v.id === currentVariant && !this.customEndgameSnapshot;
      return `
        <button type="button" onclick="window.gameApp.selectChessVariant('${v.id}')"
          class="md-btn w-full text-left rounded-2xl p-3.5 border-2 transition-all flex items-start gap-3 ${
            isCurrent
              ? 'border-red-700 bg-gradient-to-r from-red-50/95 to-amber-50/95 shadow-md'
              : 'border-amber-200/80 bg-white/90 hover:bg-amber-50/60'
          }">
          <div class="w-10 h-10 rounded-xl ${
            v.id === 'jieqi' ? 'bg-gradient-to-br from-amber-600 to-red-700' : 'bg-gradient-to-br from-red-700 to-slate-950'
          } text-amber-50 flex items-center justify-center shrink-0 shadow-sm serif-cn font-black text-lg">
            ${v.id === 'jieqi' ? '揭' : '象'}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5">
                <span class="serif-cn font-black text-sm text-slate-900">${v.name}</span>
                <span class="serif-cn text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  v.id === 'jieqi' ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-800'
                }">${v.badge}</span>
              </div>
              <span class="serif-cn text-[11px] font-bold ${isCurrent ? 'text-red-700' : 'text-amber-700'}">
                ${isCurrent ? '● 当前 · 开启新局' : '开启 ▶'}
              </span>
            </div>
            <p class="serif-cn text-xs text-slate-600 leading-relaxed mt-1">${v.desc}</p>
          </div>
        </button>
      `;
    }).join('');
  }

  selectChessVariant(variantId) {
    if (this.onlineRole && this.conn?.open) {
      this.showCenterCallout('联机中不可切换棋制', this.onlineRole);
      return;
    }
    const target = this.variantRegistry.find(v => v.id === variantId) || this.variantRegistry[0];
    this.variantMode = target.id;
    this.engine.variantMode = target.id;
    this.closeVariantSelectModal();
    this.customEndgameSnapshot = null;
    this.endgameEditor = false;
    document.getElementById('custom-endgame-panel')?.classList.add('hidden');
    this.restartGame();
    this.showCenterCallout(`开启【${target.name}】新局`, RED, '棋制切换');
  }

  toggleSceneModal(forceState) {
    const modal = document.getElementById('scene-select-modal');
    if (!modal) return;
    const willShow = typeof forceState === 'boolean' ? forceState : modal.classList.contains('hidden');
    if (willShow) {
      this.sfx.playSelect();
      this.toggleMoreMenu(false);
      this.closeVariantSelectModal();
      document.getElementById('online-modal')?.classList.add('hidden');
      this.renderSceneModalOptions();
    }
    modal.classList.toggle('hidden', !willShow);
  }

  renderSceneModalOptions() {
    const container = document.getElementById('scene-options-list');
    if (!container) return;
    container.innerHTML = this.sceneRegistry.map(sc => {
      const isCurrent = sc.id === this.currentSceneId;
      const isBattlefield = sc.id === 'ancient_battlefield';
      const isStudy = sc.id === 'imperial_study';
      const activeBorder = isBattlefield
        ? 'border-red-700 bg-gradient-to-r from-amber-50/95 to-red-50/95 shadow-md'
        : (isStudy
            ? 'border-amber-600 bg-gradient-to-r from-amber-50/95 to-purple-50/95 shadow-md'
            : 'border-emerald-700 bg-gradient-to-r from-emerald-50/95 to-teal-50/95 shadow-md');
      const iconBg = isBattlefield
        ? 'bg-gradient-to-br from-red-700 to-amber-700 text-amber-50'
        : (isStudy
            ? 'bg-gradient-to-br from-amber-600 to-purple-900 text-amber-50'
            : 'bg-gradient-to-br from-emerald-700 to-teal-800 text-emerald-50');
      const badgeCls = isBattlefield
        ? 'bg-red-100 text-red-900'
        : (isStudy ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900');
      const statusCls = isBattlefield ? 'text-red-800' : (isStudy ? 'text-amber-800' : 'text-emerald-800');
      return `
        <button type="button" onclick="window.gameApp.switchScene('${sc.id}')"
          class="md-btn w-full text-left rounded-2xl p-3.5 border-2 transition-all flex items-start gap-3 ${
            isCurrent ? activeBorder : 'border-slate-200 bg-white/90 hover:bg-amber-50/50'
          }">
          <div class="w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 shadow-sm">
            <span class="material-symbols-rounded text-[20px]">${sc.icon || 'park'}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-1.5">
                <span class="serif-cn font-black text-sm text-slate-900">${sc.name}</span>
                <span class="serif-cn text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeCls}">${sc.badge}</span>
              </div>
              <span class="serif-cn text-[11px] font-bold ${statusCls}">${isCurrent ? '✓ 当前' : '切换 ▶'}</span>
            </div>
            <p class="serif-cn text-xs text-slate-600 leading-relaxed mt-1">${sc.desc}</p>
          </div>
        </button>
      `;
    }).join('');
  }

  switchScene(sceneId) {
    const sc = this.sceneRegistry.find(s => s.id === sceneId) || this.sceneRegistry[0];
    this.currentSceneId = sc.id;
    const isPark = sc.id === 'bamboo_park';
    const isBattlefield = sc.id === 'ancient_battlefield';
    const isStudy = sc.id === 'imperial_study';
    this.sfx.playSelect();

    if (this.parkGroup) this.parkGroup.visible = isPark;
    if (this.breezeParticles) {
      this.breezeParticles.forEach(bp => { bp.mesh.visible = isPark; });
    }
    if (this.battlefieldGroup) this.battlefieldGroup.visible = isBattlefield;
    if (this.battlefieldEmbers) {
      this.battlefieldEmbers.forEach(em => { em.sprite.visible = isBattlefield; });
    }
    if (this.studyGroup) this.studyGroup.visible = isStudy;

    if (this.scene) {
      this.scene.background = new THREE.Color(sc.bgHex);
      if (this.scene.fog) {
        this.scene.fog.color.setHex(sc.bgHex);
        this.scene.fog.density = sc.fogDensity || 0.014;
      }
    }
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.background = isBattlefield ? '#432d22' : (isStudy ? '#0d182e' : '#dbe9dc');
    }
    if (this.sunLight) {
      this.sunLight.color.setHex(sc.sunColor || 0xfff6e5);
      this.sunLight.intensity = sc.sunIntensity || 0.54;
    }
    if (this.hemiLight) {
      this.hemiLight.color.setHex(sc.hemiSky || 0xfef9e7);
      this.hemiLight.groundColor.setHex(sc.hemiGround || 0x5c7a58);
      this.hemiLight.intensity = sc.hemiIntensity || 0.30;
    }

    const badgeEl = document.getElementById('scene-badge');
    if (badgeEl) {
      badgeEl.textContent = sc.name;
      badgeEl.className = !isPark
        ? 'hidden md:inline-block cursor-pointer serif-cn text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-800/15 text-amber-950 border border-amber-800/25'
        : 'hidden md:inline-block cursor-pointer serif-cn text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800/10 text-emerald-900 border border-emerald-800/15';
    }
    const switcherBtn = document.getElementById('btn-scene-switcher');
    if (switcherBtn) {
      switcherBtn.title = `切换场景（当前：${sc.name}）`;
    }

    this.toggleSceneModal(false);
    this.showCenterCallout(`已切换至【${sc.name}】`, RED, '雅集换景');
  }

  restartStandardGame(isRemote = false) {
    if (this.onlineRole && this.conn?.open && !isRemote) {
      this.showCenterCallout('联机中请点「重新对局」发起申请', this.onlineRole);
      return;
    }
    this.openVariantSelectModal();
  }

  replayEndgame(isRemote = false) {
    if (!this.customEndgameSnapshot) {
      this.restartGame();
      return;
    }
    this.hideCycleWarningBanner();
    this.hideIllegalMovePrompt();
    this.hideAllActionModals?.();
    this.sfx.playSelect();
    this.isBusy = false;
    this.aiCallback = null;
    this.activeAnimations = [];
    this.closeModalOnly();
    this.toggleVFXDrawer(false);
    this.gameOver = false;
    this.endgameReasonText = null;
    this.endgameEditor = false;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.clearCheckmateHighlights();
    this.clearCheckmateVFX();
    this.clearAllTransientVFX(true);
    this.engine.board = this.customEndgameSnapshot.map(row => row.map(p => p ? { ...p } : null));
    this.engine.turn = this.editorFirstTurn || RED;
    this.engine.clearCapturesAndHistory?.();

    this.initReplaySession?.(this.engine.board, this.engine.turn, 'endgame');

    this.syncPiecesFromEngine();
    this.setGameMode(this.onlineRole ? 'pvp' : this.gameMode);
    this.updateRestartButtonLabel();
    this.updateUI(this.engine.isInCheck(this.engine.turn));
    if (!isRemote && this.conn?.open) {
      this.conn.send({
        type: 'sync_board',
        fen: this.exportBoardToFEN(this.engine.board, this.engine.turn),
        isCustomEndgame: true
      });
    }
  }

  restartGame() {
    this.hideCycleWarningBanner();
    this.hideIllegalMovePrompt();
    this.hideAllActionModals?.();
    this.sfx.playSelect();
    this.isBusy = false;
    this.aiCallback = null;
    this.activeAnimations = [];
    this.closeModalOnly();
    this.toggleVFXDrawer(false);
    this.gameOver = false;
    this.endgameReasonText = null;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.clearCheckmateHighlights();
    this.clearCheckmateVFX();
    this.clearAllTransientVFX(true);
    this.engine.reset(this.variantMode || 'xiangqi');

    this.initReplaySession?.(this.engine.board, this.engine.turn, 'standard');

    this.resetTelemetryUI();
    this.syncPiecesFromEngine();
    this.updateRestartButtonLabel();
    this.updateUI(this.engine.isInCheck(this.engine.turn));
  }

  cycleCameraPreset() {
    const order = ['red', 'top', 'orbit'];
    const labels = { red: '正视', top: '俯视', orbit: '环绕' };
    const icons = { red: 'visibility', top: 'grid_on', orbit: '3d_rotation' };
    this.currentCamPreset = order[(order.indexOf(this.currentCamPreset || 'red') + 1) % order.length];
    this.setCameraPreset(this.currentCamPreset);

    document.getElementById('cam-cycle-label').textContent = labels[this.currentCamPreset];
    document.getElementById('cam-cycle-icon').textContent = icons[this.currentCamPreset];
  }

  setCameraPreset(preset) {
    this.sfx.playSelect();
    const baseTheta = this.onlineRole === BLACK ? Math.PI : 0;
    if (preset === 'red') {
      this.basePresetRadius = 17.5;
      this.desiredSpherical = { radius: 17.5, phi: 0.72, theta: baseTheta };
    } else if (preset === 'top') {
      const topRadius = window.innerWidth >= 768 ? 20.5 : 16.5;
      this.basePresetRadius = topRadius;
      this.desiredSpherical = { radius: topRadius, phi: 0.14, theta: baseTheta };
    } else if (preset === 'orbit') {
      this.basePresetRadius = 20.5;
      this.desiredSpherical = { radius: 20.5, phi: 0.85, theta: baseTheta + 0.65 };
    }
    this.updateViewportScale(true);
  }

  checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const fen = params.get('fen');
    const room = params.get('room');
    const replay = params.get('replay');
    const mode = params.get('mode');

    if (replay) {
      setTimeout(() => {
        if (!this.loadSharedReplayFromParam?.(replay) && fen) {
          this.loadBoardFromFEN(fen);
        }
      }, 120);
      return;
    }

    if (fen) {
      this.loadBoardFromFEN(fen);
      if (mode && ['pvp', 'easy', 'hard', 'inferno'].includes(mode)) {
        this.setGameMode(mode);
      }
    }
    if (room) {
      this.onlineRole = BLACK;
      this.updateRestartButtonLabel();
      setTimeout(() => this.joinOnlineRoom(room.trim().toUpperCase()), 250);
    }
  }

  toggleSound() {
    this.sfx.enabled = !this.sfx.enabled;
    document.getElementById('icon-sound').textContent = this.sfx.enabled ? 'volume_up' : 'volume_off';
    if (this.sfx.enabled) this.sfx.playSelect();
  }
}

