Object.assign(Xiangqi3DApp.prototype, {
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
      if (m.userData?.bodyMat) {
        m.userData.bodyMat.emissive.setHex(0x000000);
        m.userData.bodyMat.emissiveIntensity = 0.0;
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
    const clampedAlpha = Math.max(0, Math.min(1, opacity));
    if (clampedAlpha <= 0.01) {
      mesh.visible = false;
      return;
    }
    mesh.visible = true;
    const sx = Array.isArray(scale) ? scale[0] : scale;
    const sy = Array.isArray(scale) ? scale[1] : scale;
    const sz = Array.isArray(scale) ? scale[2] : scale;
    mesh.scale.set(sx, sy, sz);
    mesh.rotation.set(rx, ry, rz);

    // 棋子本地圆柱几何中心位于 (0, 0.175, 0)，补偿旋转带来的中心偏移
    const halfH = 0.175 * sy;
    const localMid = new THREE.Vector3(0, halfH, 0).applyEuler(mesh.rotation);
    mesh.position.set(x - localMid.x, y + halfH - localMid.y, z - localMid.z);

    mesh.children.forEach((ch) => {
      const mat = ch.material;
      if (!mat) return;
      if (clampedAlpha < 0.995) {
        mat.transparent = true;
        mat.opacity = clampedAlpha;
      } else {
        mat.transparent = false;
        mat.opacity = 1.0;
      }
    });
    const bodyChild = mesh.children[0];
    if (bodyChild?.material?.emissive) {
      bodyChild.material.emissive.setHex(glowIntensity > 0.01 ? glowHex : 0x000000);
      bodyChild.material.emissiveIntensity = glowIntensity;
    }
  },

  clearCheckmateVFX() {
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
    ctx.fillText(`◆  ${subBannerText}  ◆`, 0, 1);
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
      ctx.fillText(`◆ ${subText} ◆`, 0, fontSize * 0.78);
    }
    ctx.restore();
  },

  /*************************************************************************
   * REUSABLE MULTI-PART ARTICULATED 3D MODELS FOR CHECKMATE CUTSCENES
  /*************************************************************************
   * ULTRA-DETAILED MULTI-PART ARTICULATED 3D MODELS FOR CHECKMATE CUTSCENES
   *************************************************************************/

  /**
   * 精雕唐宋明光具装神驹 3D 模型（含胸肌/腹胁/臀胯解剖结构、当胸护心甲、盘龙胁甲、鱼鳞颈甲、
   * 高桥战鞍、马镫、镂金马面甲、鼻孔与可动下颌、金嚼缰绳、双飘带、十二层飘逸鬃毛、五束流云马尾与四肢三关节铁蹄）
   */
  createArticulated3DWarHorse(bodyMat, armorMat, glowMat) {
    const horse = new THREE.Group();
    const bodyPivot = new THREE.Group();
    horse.add(bodyPivot);

    // 1. 饱满躯干、宽阔前胸与浑圆臀胯
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.35, 22, 20), bodyMat);
    chest.scale.set(1.04, 1.14, 1.26);
    chest.position.set(0, 0.78, 0.48);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.31, 1.18, 22), bodyMat);
    torso.rotation.x = Math.PI / 2;
    torso.position.set(0, 0.76, -0.02);

    const croup = new THREE.Mesh(new THREE.SphereGeometry(0.33, 22, 20), bodyMat);
    croup.scale.set(1.04, 1.10, 1.20);
    croup.position.set(0, 0.79, -0.52);
    bodyPivot.add(chest, torso, croup);

    // 2. 唐宋明光具装马甲（当胸甲 + 护心金镜 + 侧翼盘龙马身甲 + 臀甲 + 高桥战鞍 + 双侧马镫 + 战鞍流苏飘带）
    const chestArmor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.37, 0.40, 0.40, 22, 1, false, -Math.PI * 0.58, Math.PI * 1.16),
      armorMat
    );
    chestArmor.position.set(0, 0.76, 0.46);
    const chestBoss = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), glowMat);
    chestBoss.scale.set(1.15, 1.15, 0.55);
    chestBoss.position.set(0, 0.77, 0.86);
    const chestHalo = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.022, 10, 20), armorMat);
    chestHalo.position.set(0, 0.77, 0.85);

    // 胸前红缨坠饰
    for (let t = -2; t <= 2; t++) {
      const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.22, 8), glowMat);
      tassel.rotation.x = Math.PI;
      tassel.position.set(t * 0.12, 0.52, 0.78 - Math.abs(t) * 0.05);
      bodyPivot.add(tassel);
    }

    const croupArmor = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.54),
      armorMat
    );
    croupArmor.rotation.x = -0.35;
    croupArmor.position.set(0, 0.81, -0.53);

    // 左右肋部鱼鳞甲片裙边
    [-1, 1].forEach(side => {
      for (let p = 0; p < 4; p++) {
        const flankPlate = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.24), p % 2 === 0 ? armorMat : glowMat);
        flankPlate.position.set(side * 0.32, 0.64, 0.30 - p * 0.24);
        flankPlate.rotation.z = side * 0.18;
        bodyPivot.add(flankPlate);
      }
    });

    const saddleCloth = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.34, 0.70), armorMat);
    saddleCloth.position.set(0, 0.84, 0.0);
    const saddleTrim = new THREE.Mesh(new THREE.BoxGeometry(0.73, 0.065, 0.74), glowMat);
    saddleTrim.position.set(0, 0.69, 0.0);
    const saddleSeat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.15, 0.54), bodyMat);
    saddleSeat.position.set(0, 1.01, 0.0);
    const pommel = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.15, 0.26, 14), armorMat);
    pommel.position.set(0, 1.13, 0.20);
    pommel.rotation.x = 0.28;
    const cantle = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, 0.28, 14), armorMat);
    cantle.position.set(0, 1.14, -0.22);
    cantle.rotation.x = -0.32;

    const ribbons = [];
    [-0.36, 0.36].forEach(sx => {
      const strap = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.38, 0.045), armorMat);
      strap.position.set(sx, 0.72, 0.02);
      const stirrup = new THREE.Mesh(new THREE.TorusGeometry(0.070, 0.020, 10, 18), glowMat);
      stirrup.rotation.y = Math.PI / 2;
      stirrup.position.set(sx, 0.50, 0.02);
      const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.75), glowMat);
      ribbon.position.set(sx * 1.05, 0.82, -0.55);
      bodyPivot.add(strap, stirrup, ribbon);
      ribbons.push(ribbon);
    });
    bodyPivot.add(chestArmor, chestBoss, chestHalo, croupArmor, saddleCloth, saddleTrim, saddleSeat, pommel, cantle);

    // 3. 矫健弓形马颈、叠片鱼鳞颈甲与十二层流云飞鬃
    const neckPivot = new THREE.Group();
    neckPivot.position.set(0, 0.88, 0.50);
    const neckLower = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.27, 0.48, 18), bodyMat);
    neckLower.position.set(0, 0.18, 0.12);
    neckLower.rotation.x = 0.48;
    const neckUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.20, 0.44, 18), bodyMat);
    neckUpper.position.set(0, 0.46, 0.26);
    neckUpper.rotation.x = 0.38;
    for (let c = 0; c < 4; c++) {
      const crinetPlate = new THREE.Mesh(new THREE.TorusGeometry(0.19 - c * 0.012, 0.028, 8, 16, Math.PI), armorMat);
      crinetPlate.position.set(0, 0.14 + c * 0.12, 0.10 + c * 0.05);
      crinetPlate.rotation.x = 1.15;
      neckPivot.add(crinetPlate);
    }
    neckPivot.add(neckLower, neckUpper);

    const maneLocks = [];
    for (let m = 0; m < 12; m++) {
      const maneFin = new THREE.Mesh(new THREE.ConeGeometry(0.068, 0.38, 6), m % 2 === 0 ? glowMat : armorMat);
      maneFin.position.set((m % 2 === 0 ? 0.022 : -0.022), 0.05 + m * 0.055, -0.03 + m * 0.024);
      maneFin.rotation.x = -0.82;
      neckPivot.add(maneFin);
      maneLocks.push(maneFin);
    }

    // 4. 精雕俊逸马首
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.68, 0.35);

    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.175, 18, 16), bodyMat);
    cranium.scale.set(0.92, 1.0, 1.18);
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.098, 0.15, 0.44, 16), bodyMat);
    bridge.rotation.x = Math.PI / 2 + 0.34;
    bridge.position.set(0, -0.06, 0.24);
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 14), bodyMat);
    muzzle.scale.set(0.95, 0.86, 1.15);
    muzzle.position.set(0, -0.13, 0.43);

    const lowerJaw = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.105, 0.35, 14), bodyMat);
    lowerJaw.rotation.x = Math.PI / 2 + 0.46;
    lowerJaw.position.set(0, -0.15, 0.21);

    // 镂金马面甲 (Chamfron) 与额顶双层龙角枪刺
    const chanfron = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.48), armorMat);
    chanfron.position.set(0, 0.06, 0.18);
    chanfron.rotation.x = 0.34;
    const chanfronCrest = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.42), glowMat);
    chanfronCrest.position.set(0, 0.08, 0.18);
    chanfronCrest.rotation.x = 0.34;
    const foreheadSpike = new THREE.Mesh(new THREE.ConeGeometry(0.052, 0.28, 8), glowMat);
    foreheadSpike.position.set(0, 0.18, 0.15);
    foreheadSpike.rotation.x = 0.55;

    [-1, 1].forEach(side => {
      const earOuter = new THREE.Mesh(new THREE.ConeGeometry(0.050, 0.22, 8), bodyMat);
      earOuter.position.set(side * 0.098, 0.22, -0.06);
      earOuter.rotation.x = -0.18;
      earOuter.rotation.z = -side * 0.22;
      const earInner = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.15, 6), armorMat);
      earInner.position.set(side * 0.098, 0.21, -0.04);
      earInner.rotation.x = -0.18;
      earInner.rotation.z = -side * 0.22;

      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 10), bodyMat);
      cheek.scale.set(0.65, 0.95, 1.1);
      cheek.position.set(side * 0.10, -0.05, 0.06);

      const eyeGlow = new THREE.Mesh(new THREE.SphereGeometry(0.040, 10, 10), glowMat);
      eyeGlow.position.set(side * 0.14, 0.03, 0.09);

      const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.030, 8, 8), armorMat);
      nostril.position.set(side * 0.068, -0.10, 0.48);

      const bitRing = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.013, 8, 14), glowMat);
      bitRing.rotation.y = Math.PI / 2;
      bitRing.position.set(side * 0.115, -0.16, 0.36);

      const reinCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(side * 0.115, -0.16, 0.36),
        new THREE.Vector3(side * 0.23, -0.32, 0.02),
        new THREE.Vector3(side * 0.16, -0.28, -0.35)
      );
      const reinMesh = new THREE.Mesh(new THREE.TubeGeometry(reinCurve, 14, 0.013, 6, false), armorMat);

      headGroup.add(earOuter, earInner, cheek, eyeGlow, nostril, bitRing, reinMesh);
    });

    headGroup.add(cranium, bridge, muzzle, lowerJaw, chanfron, chanfronCrest, foreheadSpike);
    neckPivot.add(headGroup);
    bodyPivot.add(neckPivot);

    // 5. 四肢三关节精雕马腿
    const createLeg = (lx, lz, isFront) => {
      const hipJoint = new THREE.Group();
      hipJoint.position.set(lx, 0.66, lz);

      const thigh = new THREE.Mesh(
        new THREE.CylinderGeometry(isFront ? 0.11 : 0.13, 0.080, 0.40, 14),
        bodyMat
      );
      thigh.position.y = -0.18;
      const shoulderPlate = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), armorMat);
      shoulderPlate.scale.set(0.8, 1.2, 1.0);
      shoulderPlate.position.set(lx > 0 ? 0.04 : -0.04, -0.10, 0.03);
      const kneeSphere = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), armorMat);
      kneeSphere.position.y = -0.38;
      hipJoint.add(thigh, shoulderPlate, kneeSphere);

      const kneeJoint = new THREE.Group();
      kneeJoint.position.y = -0.38;
      const cannonBone = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.058, 0.34, 14), bodyMat);
      cannonBone.position.y = -0.16;
      const shinGuard = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.04), armorMat);
      shinGuard.position.set(0, -0.16, 0.055);

      const fetlockJoint = new THREE.Group();
      fetlockJoint.position.y = -0.33;
      const fetlockSphere = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), bodyMat);
      const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.108, 0.115, 14), armorMat);
      hoof.position.set(0, -0.06, 0.02);
      const hoofRim = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.016, 8, 16), glowMat);
      hoofRim.rotation.x = Math.PI / 2;
      hoofRim.position.set(0, -0.10, 0.02);
      fetlockJoint.add(fetlockSphere, hoof, hoofRim);

      kneeJoint.add(cannonBone, shinGuard, fetlockJoint);
      hipJoint.add(kneeJoint);
      bodyPivot.add(hipJoint);
      return { hipJoint, kneeJoint, fetlockJoint, isFront };
    };

    const flLeg = createLeg(-0.20, 0.45, true);
    const frLeg = createLeg(0.20, 0.45, true);
    const blLeg = createLeg(-0.21, -0.46, false);
    const brLeg = createLeg(0.21, -0.46, false);

    // 6. 五束飘逸流云马尾
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.80, -0.66);
    [-0.12, -0.06, 0, 0.06, 0.12].forEach((tx, idx) => {
      const plume = new THREE.Mesh(
        new THREE.ConeGeometry(0.11 - Math.abs(tx) * 0.25, 0.88, 10),
        idx % 2 === 1 ? glowMat : armorMat
      );
      plume.rotation.x = -Math.PI * 0.66 + idx * 0.04;
      plume.rotation.z = tx * 1.3;
      plume.position.set(tx, -0.14, -0.34);
      tailPivot.add(plume);
    });
    bodyPivot.add(tailPivot);

    horse.userData = {
      bodyPivot,
      neckPivot,
      headGroup,
      tailPivot,
      legs: [flLeg, frLeg, blLeg, brLeg],
      animateGallop(time, rearUp = 0) {
        const clampedRear = Math.max(-0.35, Math.min(1.15, rearUp));
        bodyPivot.rotation.set(-clampedRear * 0.58, 0, 0);
        bodyPivot.position.set(0, Math.max(0, clampedRear) * 0.26, 0);
        neckPivot.rotation.x = Math.sin(time * 14) * 0.14 + clampedRear * 0.30;
        headGroup.rotation.x = Math.cos(time * 14) * 0.14 - clampedRear * 0.12;
        tailPivot.rotation.x = Math.sin(time * 16) * 0.28 + clampedRear * 0.36;
        tailPivot.rotation.y = Math.cos(time * 12) * 0.18;
        maneLocks.forEach((mLock, idx) => {
          mLock.rotation.z = Math.sin(time * 18 + idx * 0.5) * 0.15;
        });
        ribbons.forEach((rib, idx) => {
          rib.rotation.x = Math.sin(time * 16 + idx) * 0.22;
        });

        flLeg.hipJoint.rotation.x = Math.sin(time * 15) * 0.68 - clampedRear * 0.56;
        flLeg.kneeJoint.rotation.x = Math.max(0, Math.cos(time * 15) * 0.68) + clampedRear * 0.78;
        flLeg.fetlockJoint.rotation.x = Math.sin(time * 15) * 0.25;

        frLeg.hipJoint.rotation.x = Math.sin(time * 15 + Math.PI * 0.65) * 0.68 - clampedRear * 0.44;
        frLeg.kneeJoint.rotation.x = Math.max(0, Math.cos(time * 15 + Math.PI * 0.65) * 0.68) + clampedRear * 0.68;
        frLeg.fetlockJoint.rotation.x = Math.cos(time * 15) * 0.25;

        blLeg.hipJoint.rotation.x = Math.sin(time * 15 + Math.PI) * 0.56 + clampedRear * 0.42;
        blLeg.kneeJoint.rotation.x = -Math.max(0, Math.sin(time * 15) * 0.48);
        brLeg.hipJoint.rotation.x = Math.sin(time * 15 + Math.PI * 1.65) * 0.56 + clampedRear * 0.42;
        brLeg.kneeJoint.rotation.x = -Math.max(0, Math.sin(time * 15 + 0.6) * 0.48);
      }
    };
    return horse;
  },

  createArticulated3DTiger(goldMat, stripeMat, crimsonMat, fangMat, glowMat) {
    const tiger = new THREE.Group();
    const bodyPivot = new THREE.Group();
    tiger.add(bodyPivot);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.40, 20, 18), goldMat);
    chest.scale.set(1.08, 1.12, 1.24);
    chest.position.set(0, 0.78, 0.48);

    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.31, 1.24, 20), goldMat);
    torso.rotation.x = Math.PI / 2;
    torso.position.set(0, 0.78, -0.02);

    const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.34, 18, 16), goldMat);
    pelvis.scale.set(1.02, 1.06, 1.18);
    pelvis.position.set(0, 0.78, -0.56);

    // 虎背金甲背脊与护肩战甲
    for (let s = 0; s < 7; s++) {
      const spine = new THREE.Mesh(new THREE.ConeGeometry(0.072, 0.22, 6), glowMat);
      spine.position.set(0, 1.14 - s * 0.015, 0.52 - s * 0.18);
      spine.rotation.x = -0.38;
      bodyPivot.add(spine);
    }

    [-1, 1].forEach(side => {
      const shoulderArmor = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
        crimsonMat
      );
      shoulderArmor.position.set(side * 0.34, 0.88, 0.44);
      shoulderArmor.rotation.z = -side * 0.62;
      const armorSpike = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.22, 6), glowMat);
      armorSpike.position.set(side * 0.48, 0.94, 0.44);
      armorSpike.rotation.z = -side * 1.1;
      bodyPivot.add(shoulderArmor, armorSpike);
    });

    [-0.50, -0.36, -0.22, -0.08, 0.06, 0.20, 0.34, 0.48].forEach((bz, idx) => {
      const r = bz > 0.2 ? 0.38 : (bz < -0.25 ? 0.33 : 0.35);
      const stripe = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.034, 8, 24, Math.PI * 1.38),
        stripeMat
      );
      stripe.rotation.z = Math.PI * 0.32 + (idx % 2 === 0 ? 0.08 : -0.08);
      stripe.position.set(0, 0.79, bz);
      bodyPivot.add(stripe);
    });
    bodyPivot.add(chest, torso, pelvis);

    const neckPivot = new THREE.Group();
    neckPivot.position.set(0, 0.88, 0.76);
    bodyPivot.add(neckPivot);

    const neckMane = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.34, 18), goldMat);
    neckMane.rotation.x = Math.PI / 2 - 0.25;
    neckMane.position.set(0, 0.04, 0.10);
    neckPivot.add(neckMane);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.10, 0.26);
    neckPivot.add(headGroup);

    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 18), goldMat);
    cranium.scale.set(1.16, 1.0, 1.06);
    headGroup.add(cranium);

    [-1, 1].forEach(side => {
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.21, 14, 12), goldMat);
      cheek.scale.set(1.15, 0.88, 0.85);
      cheek.position.set(side * 0.22, -0.06, 0.12);
      headGroup.add(cheek);

      for (let t = 0; t < 4; t++) {
        const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.068, 0.24, 6), t % 2 === 0 ? goldMat : fangMat);
        tuft.position.set(side * (0.34 + t * 0.02), 0.0 - t * 0.055, 0.02);
        tuft.rotation.z = -side * (1.15 + t * 0.12);
        headGroup.add(tuft);
      }

      const earOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.075, 14), goldMat);
      earOuter.rotation.x = Math.PI / 2;
      earOuter.rotation.z = -side * 0.35;
      earOuter.position.set(side * 0.25, 0.28, -0.06);
      const earInner = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.08, 12), crimsonMat);
      earInner.rotation.x = Math.PI / 2;
      earInner.rotation.z = -side * 0.35;
      earInner.position.set(side * 0.25, 0.28, -0.05);
      headGroup.add(earOuter, earInner);

      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.05, 0.085), stripeMat);
      brow.position.set(side * 0.15, 0.14, 0.28);
      brow.rotation.z = -side * 0.32;
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), glowMat);
      eye.position.set(side * 0.15, 0.07, 0.29);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), stripeMat);
      pupil.position.set(side * 0.15, 0.07, 0.33);
      headGroup.add(brow, eye, pupil);

      for (let w = 0; w < 3; w++) {
        const whisker = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.004, 0.36, 6), fangMat);
        whisker.rotation.z = side * (Math.PI / 2 - 0.15 - w * 0.12);
        whisker.rotation.y = side * 0.25;
        whisker.position.set(side * 0.28, -0.06 - w * 0.03, 0.30);
        headGroup.add(whisker);
      }
    });

    const snoutBridge = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.18, 0.31), goldMat);
    snoutBridge.position.set(0, -0.02, 0.26);
    snoutBridge.rotation.x = 0.18;
    const noseTip = new THREE.Mesh(new THREE.ConeGeometry(0.088, 0.085, 4), crimsonMat);
    noseTip.rotation.x = Math.PI / 2;
    noseTip.rotation.y = Math.PI / 4;
    noseTip.position.set(0, 0.03, 0.42);
    headGroup.add(snoutBridge, noseTip);

    // 额头霸气“王”字金黑纹
    [0.24, 0.19, 0.14].forEach((wy, idx) => {
      const wLen = idx === 1 ? 0.19 : 0.25;
      const hBar = new THREE.Mesh(new THREE.BoxGeometry(wLen, 0.028, 0.042), stripeMat);
      hBar.position.set(0, wy, 0.29 + (2 - idx) * 0.015);
      hBar.rotation.x = -0.35;
      headGroup.add(hBar);
    });
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.135, 0.045), stripeMat);
    vBar.position.set(0, 0.19, 0.305);
    vBar.rotation.x = -0.35;
    headGroup.add(vBar);

    [-0.105, 0.105].forEach(fx => {
      const upperFang = new THREE.Mesh(new THREE.ConeGeometry(0.040, 0.22, 8), fangMat);
      upperFang.rotation.x = Math.PI - 0.12;
      upperFang.position.set(fx, -0.15, 0.35);
      headGroup.add(upperFang);
    });

    const jawPivot = new THREE.Group();
    jawPivot.position.set(0, -0.12, 0.14);
    const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.105, 0.29), goldMat);
    lowerJaw.position.set(0, -0.04, 0.12);
    const mouthCavity = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.055, 0.25), crimsonMat);
    mouthCavity.position.set(0, 0.01, 0.12);
    [-0.085, 0.085].forEach(fx => {
      const lowerFang = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.14, 8), fangMat);
      lowerFang.position.set(fx, 0.05, 0.22);
      jawPivot.add(lowerFang);
    });
    jawPivot.add(lowerJaw, mouthCavity);
    jawPivot.rotation.x = 0.48;
    headGroup.add(jawPivot);

    const createTigerLeg = (lx, lz, isFront) => {
      const shoulderJoint = new THREE.Group();
      shoulderJoint.position.set(lx, 0.68, lz);

      const upperLimb = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.11, 0.42, 14), goldMat);
      upperLimb.position.y = -0.18;
      shoulderJoint.add(upperLimb);

      [-0.10, -0.22].forEach(sy => {
        const legStripe = new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.022, 6, 16), stripeMat);
        legStripe.rotation.x = Math.PI / 2;
        legStripe.position.y = sy;
        shoulderJoint.add(legStripe);
      });

      const elbowJoint = new THREE.Group();
      elbowJoint.position.y = -0.36;
      const lowerLimb = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.088, 0.36, 14), goldMat);
      lowerLimb.position.y = -0.16;
      elbowJoint.add(lowerLimb);

      const pawGroup = new THREE.Group();
      pawGroup.position.set(0, -0.34, 0.05);
      const pawPad = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), goldMat);
      pawPad.scale.set(1.18, 0.56, 1.32);
      pawGroup.add(pawPad);

      [-0.078, -0.026, 0.026, 0.078].forEach(cx => {
        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.15, 6), fangMat);
        claw.rotation.x = Math.PI * 0.42;
        claw.position.set(cx, -0.01, 0.145);
        pawGroup.add(claw);
      });
      elbowJoint.add(pawGroup);
      shoulderJoint.add(elbowJoint);
      bodyPivot.add(shoulderJoint);
      return { shoulderJoint, elbowJoint, pawGroup, isFront };
    };

    const flLeg = createTigerLeg(-0.26, 0.46, true);
    const frLeg = createTigerLeg(0.26, 0.46, true);
    const blLeg = createTigerLeg(-0.24, -0.50, false);
    const brLeg = createTigerLeg(0.24, -0.50, false);

    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.84, -0.78);
    const tailSeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.054, 0.56, 12), goldMat);
    tailSeg1.rotation.x = -Math.PI * 0.36;
    tailSeg1.position.set(0, 0.12, -0.24);
    const tailSeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.038, 0.50, 12), stripeMat);
    tailSeg2.rotation.x = -Math.PI * 0.18;
    tailSeg2.position.set(0, 0.34, -0.56);
    tailPivot.add(tailSeg1, tailSeg2);
    bodyPivot.add(tailPivot);

    tiger.userData = {
      bodyPivot,
      neckPivot,
      headGroup,
      jawPivot,
      tailPivot,
      legs: [flLeg, frLeg, blLeg, brLeg],
      animatePounce(time, pouncePhase = 0, swipePhase = 0) {
        const pitch = Math.sin(pouncePhase * Math.PI) * -0.46 + (pouncePhase > 0.65 ? 0.24 : 0);
        bodyPivot.rotation.set(pitch, 0, 0);
        jawPivot.rotation.x = 0.38 + Math.abs(Math.sin(time * 12)) * 0.38;
        neckPivot.rotation.x = -0.15 + Math.sin(time * 10) * 0.12;
        tailPivot.rotation.y = Math.sin(time * 16) * 0.38;
        tailPivot.rotation.x = Math.cos(time * 14) * 0.22;

        flLeg.shoulderJoint.rotation.x = -0.75 - Math.sin(swipePhase * Math.PI) * 0.58;
        flLeg.elbowJoint.rotation.x = 0.45 + Math.cos(swipePhase * Math.PI * 2) * 0.35;
        frLeg.shoulderJoint.rotation.x = -0.65 - Math.cos(swipePhase * Math.PI) * 0.58;
        frLeg.elbowJoint.rotation.x = 0.40 + Math.sin(swipePhase * Math.PI * 2) * 0.35;

        blLeg.shoulderJoint.rotation.x = 0.58 + Math.sin(pouncePhase * Math.PI) * 0.35;
        blLeg.elbowJoint.rotation.x = -0.35;
        brLeg.shoulderJoint.rotation.x = 0.52 + Math.sin(pouncePhase * Math.PI) * 0.35;
        brLeg.elbowJoint.rotation.x = -0.35;
      }
    };
    return tiger;
  },

  /**
   * 精雕秦汉金甲皇家华盖冲锋战车（含饕餮撞角、双龙辕木、12辐条飞镰战轮、皇家八角流苏华盖与双战旗）
   */
  createArticulated3DWarChariot(woodMat, goldMat, ironMat, glowMat) {
    const chariot = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.18, 1.32), woodMat);
    base.position.y = 0.46;
    const baseFrame = new THREE.Mesh(new THREE.BoxGeometry(1.30, 0.10, 1.38), goldMat);
    baseFrame.position.y = 0.44;
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(1.26, 0.56, 0.14), woodMat);
    frontWall.position.set(0, 0.76, 0.58);
    const frontShield = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.42, 0.18), goldMat);
    frontShield.position.set(0, 0.76, 0.60);
    // 车前饕餮破阵尖刺撞角
    [-0.36, 0, 0.36].forEach((rx, idx) => {
      const ramSpike = new THREE.Mesh(new THREE.ConeGeometry(idx === 1 ? 0.14 : 0.10, idx === 1 ? 0.52 : 0.38, 4), glowMat);
      ramSpike.rotation.x = Math.PI / 2;
      ramSpike.position.set(rx, 0.62, 0.84);
      chariot.add(ramSpike);
    });
    chariot.add(base, baseFrame, frontWall, frontShield);

    [-0.58, 0.58].forEach(sx => {
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.46, 1.22), woodMat);
      sideWall.position.set(sx, 0.72, 0);
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 1.28), goldMat);
      topRail.position.set(sx, 0.96, 0);
      chariot.add(sideWall, topRail);
    });

    // 双龙战戟辕木
    [-0.38, 0.38].forEach(px => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.55, 12), goldMat);
      pole.rotation.x = Math.PI / 2;
      pole.position.set(px, 0.48, 1.20);
      const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.52, 4), glowMat);
      spearTip.rotation.x = Math.PI / 2;
      spearTip.position.set(px, 0.48, 2.08);
      const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 8, 16, Math.PI * 0.85), goldMat);
      crescent.rotation.x = Math.PI / 2;
      crescent.position.set(px, 0.48, 1.72);
      chariot.add(pole, spearTip, crescent);
    });

    // 皇家八角流苏华盖 (Imperial Canopy)
    const canopyPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.55, 10), goldMat);
    canopyPillar.position.set(0, 1.25, -0.10);
    const canopyRoof = new THREE.Mesh(new THREE.ConeGeometry(0.78, 0.36, 8), woodMat);
    canopyRoof.position.set(0, 2.08, -0.10);
    const canopyTrim = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.032, 8, 8), goldMat);
    canopyTrim.rotation.x = Math.PI / 2;
    canopyTrim.position.set(0, 1.92, -0.10);
    const canopyFinial = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 1), glowMat);
    canopyFinial.position.set(0, 2.32, -0.10);
    chariot.add(canopyPillar, canopyRoof, canopyTrim, canopyFinial);

    const banners = [-0.46, 0.46].map(bx => {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.042, 1.75, 8), goldMat);
      mast.position.set(bx, 1.28, -0.56);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.60, 0.82, 4, 4), glowMat);
      flag.position.set(bx, 1.66, -0.88);
      flag.rotation.y = Math.PI / 2;
      chariot.add(mast, flag);
      return flag;
    });

    const wheels = [-0.72, 0.72].map(wx => {
      const wGroup = new THREE.Group();
      wGroup.position.set(wx, 0.48, 0);
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.060, 14, 36), goldMat);
      tire.rotation.y = Math.PI / 2;
      const innerRim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.028, 10, 28), ironMat);
      innerRim.rotation.y = Math.PI / 2;
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.28, 16), ironMat);
      hub.rotation.z = Math.PI / 2;
      // 车毂旋转破军飞镰刺
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.42, 8), goldMat);
      spike.rotation.z = wx < 0 ? Math.PI / 2 : -Math.PI / 2;
      spike.position.x = wx < 0 ? -0.26 : 0.26;
      wGroup.add(tire, innerRim, hub, spike);

      for (let s = 0; s < 12; s++) {
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.92, 6), woodMat);
        spoke.rotation.x = (s * Math.PI) / 6;
        wGroup.add(spoke);
      }
      chariot.add(wGroup);
      return wGroup;
    });

    chariot.userData = {
      wheels,
      banners,
      spinWheels(deltaSpin, time = 0) {
        wheels.forEach(w => { w.rotation.x += deltaSpin; });
        banners.forEach((f, idx) => { f.rotation.z = Math.sin(time * 16 + idx) * 0.18; });
      }
    };
    return chariot;
  },

  /**
   * 精雕红衣金龙神威大炮（含吞口金龙炮首、龙角龙牙、四道盘龙金箍、耳轴齿轮与包铁战轮）
   */
  createArticulated3DCannon(woodMat, goldMat, ironMat, glowMat) {
    const cannon = new THREE.Group();

    const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.30, 1.36), woodMat);
    carriage.position.y = 0.28;
    const carriagePlate = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.12, 1.40), goldMat);
    carriagePlate.position.y = 0.36;
    cannon.add(carriage, carriagePlate);

    const wheels = [];
    [[-0.45, -0.44], [0.45, -0.44], [-0.45, 0.44], [0.45, 0.44]].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 20), ironMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.26, wz);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.028, 10, 24), goldMat);
      rim.rotation.y = Math.PI / 2;
      rim.position.set(wx + (wx > 0 ? 0.06 : -0.06), 0.26, wz);
      const hubCap = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 8), goldMat);
      hubCap.rotation.z = wx > 0 ? -Math.PI / 2 : Math.PI / 2;
      hubCap.position.set(wx + (wx > 0 ? 0.12 : -0.12), 0.26, wz);
      cannon.add(w, rim, hubCap);
      wheels.push(w);
    });

    const barrelPivot = new THREE.Group();
    barrelPivot.position.set(0, 0.54, 0);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.29, 1.75, 28), ironMat);
    barrel.rotation.x = Math.PI / 2;
    barrelPivot.add(barrel);

    [-0.60, -0.18, 0.26, 0.72].forEach(bz => {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.245 - bz * 0.032, 0.042, 12, 28), goldMat);
      band.position.z = bz;
      barrelPivot.add(band);
    });

    // 吞口金龙炮首雕塑（炮口龙唇圈、左右龙角与龙须）
    const muzzleRing = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.052, 14, 28), glowMat);
    muzzleRing.position.z = 0.88;
    [-1, 1].forEach(s => {
      const dragonHorn = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.34, 6), goldMat);
      dragonHorn.position.set(s * 0.18, 0.24, 0.68);
      dragonHorn.rotation.x = -0.65;
      dragonHorn.rotation.z = -s * 0.35;
      barrelPivot.add(dragonHorn);
    });
    const cascabelKnob = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), goldMat);
    cascabelKnob.position.z = -0.96;
    barrelPivot.add(muzzleRing, cascabelKnob);
    barrelPivot.rotation.x = -0.28;
    cannon.add(barrelPivot);

    cannon.userData = { barrelPivot, muzzleRing, wheels };
    return cannon;
  },

  /**
   * 精雕大唐明光铠金甲神将 3D 模型（新增：背插四杆护背龙旗靠旗、神将脑后乾坤金光轮、
   * 八片叠甲战裙、双圆护心镜胸甲、吞肩兽首甲、凤翅鎏金兜鍪、冲天红缨、左臂护盾与右臂轩辕龙渊巨剑）
   */
  createArticulated3DGeneral(goldMat, crimsonMat, ironMat, glowMat) {
    const general = new THREE.Group();

    // 1. 下摆战袍与八片环形叠甲战裙（Tassets）
    const innerRobe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.54, 1.14, 22), crimsonMat);
    innerRobe.position.y = 0.58;
    general.add(innerRobe);

    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const tasset = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.66, 0.075), i % 2 === 0 ? goldMat : ironMat);
      tasset.position.set(Math.sin(ang) * 0.43, 0.68, Math.cos(ang) * 0.43);
      tasset.rotation.y = ang;
      tasset.rotation.x = -0.16;
      const tassetTrim = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.085, 0.085), goldMat);
      tassetTrim.position.set(Math.sin(ang) * 0.46, 0.38, Math.cos(ang) * 0.46);
      tassetTrim.rotation.y = ang;
      general.add(tasset, tassetTrim);
    }

    // 2. 明光胸甲、玉带兽首扣与左右日月护心镜
    const waistBelt = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.42, 0.17, 22), goldMat);
    waistBelt.position.y = 1.05;
    const beltBuckle = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), glowMat);
    beltBuckle.position.set(0, 1.05, 0.41);

    const cuirass = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.38, 0.86, 22), ironMat);
    cuirass.position.y = 1.48;
    const chestTrim = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.39, 0.70, 22, 1, false, -Math.PI * 0.44, Math.PI * 0.88), goldMat);
    chestTrim.position.y = 1.48;

    [-0.16, 0.16].forEach(mx => {
      const mirrorPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.145, 0.065, 20), glowMat);
      mirrorPlate.rotation.x = Math.PI / 2;
      mirrorPlate.position.set(mx, 1.56, 0.44);
      general.add(mirrorPlate);
    });
    const centerEmblem = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 1), glowMat);
    centerEmblem.position.set(0, 1.35, 0.45);
    general.add(waistBelt, beltBuckle, cuirass, chestTrim, centerEmblem);

    // 3. 猎猎朱红披风 + 背插四杆护背龙旗靠旗 (Kao Banners) + 脑后神将乾坤金光轮
    const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 1.92, 8, 8), crimsonMat);
    cape.position.set(0, 1.24, -0.45);
    cape.rotation.x = 0.25;
    general.add(cape);

    const backHalo = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.032, 10, 32), glowMat);
    backHalo.position.set(0, 1.95, -0.32);
    general.add(backHalo);

    [-1.5, -0.5, 0.5, 1.5].forEach((idx) => {
      const flagGroup = new THREE.Group();
      flagGroup.position.set(0, 1.65, -0.38);
      flagGroup.rotation.z = idx * 0.32;
      flagGroup.rotation.x = -0.22;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 1.35, 8), goldMat);
      pole.position.y = 0.65;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 5), glowMat);
      tip.position.y = 1.38;
      const pennant = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 4), Math.abs(idx) > 1 ? crimsonMat : goldMat);
      pennant.position.set(idx > 0 ? 0.12 : -0.12, 0.95, 0);
      pennant.rotation.z = idx > 0 ? -Math.PI / 2 : Math.PI / 2;
      flagGroup.add(pole, tip, pennant);
      general.add(flagGroup);
    });

    // 4. 神将面庞、凤翅鎏金兜鍪与冲天红缨
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.20, 0.22, 14), goldMat);
    neck.position.y = 1.94;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 18), goldMat);
    head.position.y = 2.14;
    [-0.08, 0.08].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 8), glowMat);
      eye.position.set(ex, 2.15, 0.22);
      general.add(eye);
    });

    const helmetDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.29, 22, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
      ironMat
    );
    helmetDome.position.y = 2.18;
    const visorBrow = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.038, 10, 22, Math.PI), goldMat);
    visorBrow.rotation.x = Math.PI * 0.42;
    visorBrow.position.set(0, 2.24, 0.05);

    const crestBase = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.095, 0.24, 12), goldMat);
    crestBase.position.y = 2.52;
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.74, 14), crimsonMat);
    plume.position.set(0, 2.84, -0.10);
    plume.rotation.x = -0.38;
    general.add(neck, head, helmetDome, visorBrow, crestBase, plume);

    // 左右凤翅、顿项护颊与吞肩兽首甲
    [-1, 1].forEach(dir => {
      const cheekGuard = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.27, 0.19), goldMat);
      cheekGuard.position.set(dir * 0.24, 2.10, 0.04);
      cheekGuard.rotation.z = dir * 0.18;

      const wing = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.042, 10, 22, Math.PI * 0.85), goldMat);
      wing.position.set(dir * 0.30, 2.35, -0.02);
      wing.rotation.z = dir * 0.42;

      const pauldronUpper = new THREE.Mesh(
        new THREE.SphereGeometry(0.29, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.56),
        goldMat
      );
      pauldronUpper.position.set(dir * 0.59, 1.80, 0);
      pauldronUpper.rotation.z = -dir * 0.48;
      const pauldronLower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.29, 0.24, 16, 1, false, -Math.PI * 0.45, Math.PI * 0.9),
        crimsonMat
      );
      pauldronLower.position.set(dir * 0.59, 1.62, 0);
      pauldronLower.rotation.y = dir * (Math.PI / 2);
      general.add(cheekGuard, wing, pauldronUpper, pauldronLower);
    });

    // 5. 左臂（持玄铁鎏金护手圆盾）
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.59, 1.72, 0);
    const lUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.10, 0.58, 12), ironMat);
    lUpper.position.set(-0.06, -0.24, 0.16);
    lUpper.rotation.x = 0.48;
    lUpper.rotation.z = -0.22;
    const buckler = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.065, 20), goldMat);
    buckler.rotation.z = Math.PI / 2;
    buckler.position.set(-0.22, -0.38, 0.32);
    const bucklerBoss = new THREE.Mesh(new THREE.SphereGeometry(0.10, 12, 12), glowMat);
    bucklerBoss.position.set(-0.26, -0.38, 0.32);
    leftArmGroup.add(lUpper, buckler, bucklerBoss);
    general.add(leftArmGroup);

    // 6. 右臂多关节与轩辕龙渊巨剑
    const swordArmPivot = new THREE.Group();
    swordArmPivot.position.set(0.59, 1.74, 0);
    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.105, 0.46, 14), goldMat);
    upperArm.position.set(0, -0.18, 0.14);
    upperArm.rotation.x = Math.PI / 4;
    const vambrace = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.088, 0.42, 14), crimsonMat);
    vambrace.position.set(0, -0.40, 0.36);
    vambrace.rotation.x = Math.PI / 3;
    const gauntlet = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 12), goldMat);
    gauntlet.position.set(0, -0.52, 0.54);
    swordArmPivot.add(upperArm, vambrace, gauntlet);

    const swordGroup = new THREE.Group();
    swordGroup.position.set(0, -0.52, 0.56);
    const pommelRing = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.030, 8, 16), goldMat);
    pommelRing.position.y = -0.28;
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.068, 0.52, 14), crimsonMat);
    const guardCore = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.15, 0.22), goldMat);
    guardCore.position.y = 0.28;
    [-1, 1].forEach(dir => {
      const guardWing = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.35, 6), goldMat);
      guardWing.position.set(dir * 0.44, 0.36, 0);
      guardWing.rotation.z = -dir * 0.85;
      swordGroup.add(guardWing);
    });
    const bladeOuter = new THREE.Mesh(new THREE.ConeGeometry(0.21, 2.85, 4), glowMat);
    bladeOuter.scale.set(1.28, 1, 0.36);
    bladeOuter.position.y = 1.70;
    const bladeFuller = new THREE.Mesh(new THREE.BoxGeometry(0.095, 2.25, 0.095), goldMat);
    bladeFuller.position.y = 1.40;
    swordGroup.add(pommelRing, hilt, guardCore, bladeOuter, bladeFuller);
    swordGroup.rotation.x = Math.PI * 0.38;
    swordArmPivot.add(swordGroup);
    general.add(swordArmPivot);

    general.userData = { swordArmPivot, leftArmGroup, cape, plume, swordGroup, backHalo };
    return general;
  },

  /**
   * =========================================================================
   * 6 大超精细、高复杂度全屏 CG 绝杀专属场景构建器（不惜复杂化，彻底告别简陋）
   * 1. cg_battlefield      —— 烽火万里·九鼎点将古战场巨景（双层八角点将坛、8尊盘龙拴马桩配铁索、四方饕餮巨鼎烈焰、环绕式万里长城城垛与四座重檐箭楼、攻城床弩、12面猎猎大纛战旗与层峦叠嶂远山云雾）
   * 2. cg_imperial_citadel —— 九重玄铁禁城·困龙台巨景（用于闷宫、铁门栓、闷杀、困毙：黑曜石金脉广场、汉白玉困龙坛、8根盘龙金柱配宫灯、四方重檐皇城大殿与金色星轨阵纹）
   * 3. cg_grassland        —— 千山叠翠·瑶池芳甸巨景（多层次起伏碧绿草甸、碧水环溪、4座汉白玉小拱桥、80+簇立体青草与36朵盛开三色野花、8棵苍松翠柏、16团立体白云；天地炮模式下含塌陷巨坑、24块掀翻翘起的地壳断岩、沸腾岩浆池与14根喷涌熔岩火柱）
   * 4. cg_ocean_day        —— 沧海龙宫·千层碧浪巨景（真实深度遮挡海面、8座海蚀奇峰礁石群岛配拍岸白浪、6圈立体翻涌波涛管与16道卷曲浪冠）
   * 5. cg_ocean_night      —— 星河瀚海·沧海月明巨景（深邃夜海、8座海崖石柱、12盏漂浮莲花河灯、90颗璀璨星辰与星河光带、中心大型多层圆月倒影与8层荡漾波纹）
   * 6. cg_sunset_mountain  —— 雄关漫道·血日断崖巨景（远端险峻高山雄关、山巅石城垛口、悬崖栈道、迎客苍松、左右双翼烽火台、石板峡谷古道，以及带多层日冕与赤霞流云的巨型血色残阳）
   * =========================================================================
   */
  createCGSceneEnvironment(sceneType, parentGroup, options = {}) {
    const sceneGroup = new THREE.Group();
    sceneGroup.visible = false;
    parentGroup.add(sceneGroup);
    const fadeMaterials = [];
    const registerMat = (mat, baseOpacity = 1.0, forceDepthWrite = null) => {
      mat.transparent = true;
      mat.opacity = 0;
      fadeMaterials.push({ mat, baseOpacity, forceDepthWrite });
      return mat;
    };

    const animCallbacks = [];

    if (sceneType === 'cg_battlefield') {
      // 1. 辽阔古战场焦土大地与双层八角青铜雕花点将坛
      const groundMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x3b2316,
        roughness: 0.88,
        metalness: 0.08
      }), 1.0);
      const ground = new THREE.Mesh(new THREE.CylinderGeometry(50, 50, 0.36, 64), groundMat);
      ground.position.y = -0.18;
      sceneGroup.add(ground);

      const stoneSlabMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x291811,
        roughness: 0.76,
        metalness: 0.22,
        side: THREE.DoubleSide
      }), 0.96);
      const bronzeMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0xd97706,
        emissive: 0x78350f,
        emissiveIntensity: 0.22,
        roughness: 0.32,
        metalness: 0.85,
        side: THREE.DoubleSide
      }), 0.90);
      const darkIronMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x1e242b,
        roughness: 0.42,
        metalness: 0.78
      }), 0.98);
      const crimsonMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x881313,
        emissive: 0x450a0a,
        emissiveIntensity: 0.20,
        roughness: 0.48,
        side: THREE.DoubleSide
      }), 0.94);

      // 中央八角点将坛石面与放射青铜战车辙道
      const altarOctagon = new THREE.Mesh(new THREE.RingGeometry(0.1, 6.2, 8), stoneSlabMat);
      altarOctagon.rotation.x = -Math.PI / 2;
      altarOctagon.rotation.z = Math.PI / 8;
      altarOctagon.position.y = 0.006;
      const altarOuterRing = new THREE.Mesh(new THREE.RingGeometry(6.2, 16.5, 48), stoneSlabMat);
      altarOuterRing.rotation.x = -Math.PI / 2;
      altarOuterRing.position.y = 0.004;
      sceneGroup.add(altarOctagon, altarOuterRing);

      [3.2, 6.2, 10.8].forEach((r, idx) => {
        const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.14, r + 0.14, idx === 1 ? 8 : 48), bronzeMat);
        ring.rotation.x = -Math.PI / 2;
        if (idx === 1) ring.rotation.z = Math.PI / 8;
        ring.position.y = 0.012;
        sceneGroup.add(ring);
      });

      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const spoke = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 15.5), bronzeMat);
        spoke.rotation.x = -Math.PI / 2;
        spoke.rotation.z = a;
        spoke.position.y = 0.010;
        sceneGroup.add(spoke);

        // 八尊盘龙拴马望柱 + 环绕悬垂玄铁锁链
        const postX = Math.cos(a + Math.PI / 8) * 6.4;
        const postZ = Math.sin(a + Math.PI / 8) * 6.4;
        const bollard = new THREE.Group();
        bollard.position.set(postX, 0, postZ);
        const bBase = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.24, 0.56), darkIronMat);
        bBase.position.y = 0.12;
        const bShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.35, 10), stoneSlabMat);
        bShaft.position.y = 0.78;
        const bCap = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 1), bronzeMat);
        bCap.position.y = 1.56;
        bollard.add(bBase, bShaft, bCap);
        sceneGroup.add(bollard);

        const nextA = ((i + 1) * Math.PI) / 4 + Math.PI / 8;
        const nextX = Math.cos(nextA) * 6.4;
        const nextZ = Math.sin(nextA) * 6.4;
        const sagCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(postX, 1.25, postZ),
          new THREE.Vector3((postX + nextX) * 0.5, 0.62, (postZ + nextZ) * 0.5),
          new THREE.Vector3(nextX, 1.25, nextZ)
        );
        const chainTube = new THREE.Mesh(new THREE.TubeGeometry(sagCurve, 16, 0.038, 6, false), darkIronMat);
        sceneGroup.add(chainTube);
      }

      // 2. 四角三足双耳饕餮青铜火鼎与三层动态烈焰
      const flameOuterMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xea580c,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }), 0.78);
      const flameInnerMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }), 0.88);
      const flamesList = [];

      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        const r = 8.4;
        const cauldron = new THREE.Group();
        cauldron.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
        const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.58, 0.88, 20), darkIronMat);
        belly.position.y = 0.98;
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.09, 12, 24), bronzeMat);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 1.42;
        [-0.88, 0.88].forEach(ex => {
          const ear = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.34), bronzeMat);
          ear.position.set(ex, 1.62, 0);
          cauldron.add(ear);
        });
        for (let l = 0; l < 3; l++) {
          const la = (l * Math.PI * 2) / 3;
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.10, 0.92, 10), bronzeMat);
          leg.position.set(Math.cos(la) * 0.58, 0.46, Math.sin(la) * 0.58);
          cauldron.add(leg);
        }
        const fOuter = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.75, 12), flameOuterMat);
        fOuter.position.y = 2.15;
        const fInner = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.25, 10), flameInnerMat);
        fInner.position.y = 1.95;
        cauldron.add(belly, rim, fOuter, fInner);
        sceneGroup.add(cauldron);
        flamesList.push({ fOuter, fInner, phase: i * 1.6 });
      }

      // 3. 环绕式万里长城城墙垛口、四方重檐城楼箭塔、攻城巨弩车与十二面猎猎大纛战旗
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const r = 15.8;
        const wx = Math.cos(a) * r;
        const wz = Math.sin(a) * r;

        if (i % 4 === 0) {
          // 四方重檐城楼箭塔
          const tower = new THREE.Group();
          tower.position.set(wx, 0, wz);
          tower.rotation.y = -a + Math.PI / 2;
          const tBase = new THREE.Mesh(new THREE.BoxGeometry(4.6, 3.2, 2.8), darkIronMat);
          tBase.position.y = 1.6;
          const tHall = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.2, 2.2), crimsonMat);
          tHall.position.y = 4.2;
          const roof1 = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.4, 4), darkIronMat);
          roof1.rotation.y = Math.PI / 4;
          roof1.scale.set(1.3, 1, 0.85);
          roof1.position.y = 5.6;
          const roof2 = new THREE.Mesh(new THREE.ConeGeometry(2.5, 1.3, 4), bronzeMat);
          roof2.rotation.y = Math.PI / 4;
          roof2.scale.set(1.3, 1, 0.85);
          roof2.position.y = 6.8;
          tower.add(tBase, tHall, roof1, roof2);
          sceneGroup.add(tower);
        } else {
          // 城墙段与城垛 (Merlons)
          const wallSeg = new THREE.Group();
          wallSeg.position.set(wx, 0, wz);
          wallSeg.rotation.y = -a + Math.PI / 2;
          const wBody = new THREE.Mesh(new THREE.BoxGeometry(5.8, 2.4, 1.4), stoneSlabMat);
          wBody.position.y = 1.2;
          wallSeg.add(wBody);
          for (let m = -2; m <= 2; m++) {
            const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 0.45), darkIronMat);
            merlon.position.set(m * 1.05, 2.65, -0.45);
            wallSeg.add(merlon);
          }
          sceneGroup.add(wallSeg);
        }
      }

      // 12 面猎猎大纛战旗与折戟残剑阵
      const flags = [];
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + 0.15;
        const r = 11.2 + (i % 2) * 1.6;
        const fg = new THREE.Group();
        fg.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
        fg.rotation.y = -ang;
        fg.rotation.z = (i % 2 === 0 ? 0.08 : -0.10);
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.09, 5.2, 10), darkIronMat);
        pole.position.y = 2.6;
        const tip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.65, 6), bronzeMat);
        tip.position.y = 5.45;
        const crossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8), bronzeMat);
        crossBar.rotation.z = Math.PI / 2;
        crossBar.position.set(0.82, 4.75, 0);
        const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 2.65, 8, 6), crimsonMat);
        cloth.position.set(0.84, 3.35, 0);
        fg.add(pole, tip, crossBar, cloth);
        sceneGroup.add(fg);
        flags.push({ cloth, phase: i * 0.9 });

        // 战场斜插折戟残剑
        const relic = new THREE.Group();
        relic.position.set(Math.cos(ang + 0.22) * (r - 2.2), 0, Math.sin(ang + 0.22) * (r - 2.2));
        relic.rotation.set((i % 3 - 1) * 0.35, ang, 0.28);
        const rShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.1, 8), darkIronMat);
        rShaft.position.y = 0.95;
        const rBlade = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.75, 4), bronzeMat);
        rBlade.position.y = 2.15;
        relic.add(rShaft, rBlade);
        sceneGroup.add(relic);
      }

      // 4. 远景层峦叠嶂群山
      const peakMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x1a0e08,
        roughness: 0.92,
        metalness: 0.10
      }), 0.96);
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2;
        const dist = 24.5 + (i % 3) * 3.8;
        const h = 9.5 + (i % 4) * 3.2;
        const mGrp = new THREE.Group();
        mGrp.position.set(Math.cos(ang) * dist, -0.5, Math.sin(ang) * dist);
        const mainP = new THREE.Mesh(new THREE.ConeGeometry(6.5, h, 8), peakMat);
        mainP.position.y = h * 0.5;
        const subP = new THREE.Mesh(new THREE.ConeGeometry(4.5, h * 0.72, 7), peakMat);
        subP.position.set(3.2, h * 0.36, 1.2);
        mGrp.add(mainP, subP);
        sceneGroup.add(mGrp);
      }

      animCallbacks.push((dt, p) => {
        flags.forEach(item => {
          item.cloth.rotation.y = Math.sin(p * 18 + item.phase) * 0.22;
        });
        flamesList.forEach(fl => {
          const sx = 0.88 + Math.sin(p * 28 + fl.phase) * 0.16;
          const sy = 0.90 + Math.cos(p * 34 + fl.phase) * 0.20;
          fl.fOuter.scale.set(sx, sy, sx);
          fl.fInner.scale.set(sy, sx, sy);
        });
      });
    } else if (sceneType === 'cg_imperial_citadel') {
      // 九重玄铁禁城·困龙台场景（专为闷宫、铁门栓、闷杀、困毙打造的高复杂度皇城禁苑）
      const obsidianMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.24,
        metalness: 0.58
      }), 0.98);
      const jadeAltarMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.32,
        metalness: 0.45
      }), 0.98);
      const imperialGoldMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0x92400e,
        emissiveIntensity: 0.28,
        roughness: 0.22,
        metalness: 0.88,
        side: THREE.DoubleSide
      }), 0.92);
      const vermilionPillarMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x7f1d1d,
        roughness: 0.36,
        metalness: 0.22
      }), 0.96);
      const runeGlowMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xfde047,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.55);

      const floor = new THREE.Mesh(new THREE.CylinderGeometry(48, 48, 0.36, 64), obsidianMat);
      floor.position.y = -0.18;
      sceneGroup.add(floor);

      // 中央八角困龙祭坛与三圈黄金星轨阵环
      const dais = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 5.2, 0.12, 8), jadeAltarMat);
      dais.rotation.y = Math.PI / 8;
      dais.position.y = -0.05;
      sceneGroup.add(dais);

      [2.65, 4.85, 7.65, 11.2].forEach((r, idx) => {
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(r - 0.10, r + 0.10, idx < 2 ? 8 : 64),
          idx % 2 === 0 ? imperialGoldMat : runeGlowMat
        );
        ring.rotation.x = -Math.PI / 2;
        if (idx < 2) ring.rotation.z = Math.PI / 8;
        ring.position.y = 0.008 + idx * 0.002;
        sceneGroup.add(ring);
      });

      // 八根擎天盘龙金柱 + 悬浮八角琉璃宫灯 + 四方重檐皇城宫殿
      const lanterns = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        const r = 9.2;
        const px = Math.cos(a) * r;
        const pz = Math.sin(a) * r;

        const pGrp = new THREE.Group();
        pGrp.position.set(px, 0, pz);
        const colBase = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.82, 0.48, 16), imperialGoldMat);
        colBase.position.y = 0.24;
        const colShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 7.6, 20), vermilionPillarMat);
        colShaft.position.y = 4.0;
        const colCap = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.48, 0.45, 16), imperialGoldMat);
        colCap.position.y = 7.9;

        const coilPts = [];
        for (let t = 0; t <= 24; t++) {
          const f = t / 24;
          const ca = f * Math.PI * 4 + i;
          coilPts.push(new THREE.Vector3(Math.cos(ca) * 0.52, 0.6 + f * 6.8, Math.sin(ca) * 0.52));
        }
        const dragonCoil = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts), 36, 0.055, 8, false),
          imperialGoldMat
        );
        pGrp.add(colBase, colShaft, colCap, dragonCoil);
        sceneGroup.add(pGrp);

        // 柱间悬浮八角宫灯
        const la = a + Math.PI / 8;
        const lr = 7.8;
        const lantern = new THREE.Group();
        lantern.position.set(Math.cos(la) * lr, 3.8, Math.sin(la) * lr);
        const lCore = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.85, 8), runeGlowMat);
        const lRoof = new THREE.Mesh(new THREE.ConeGeometry(0.58, 0.34, 8), imperialGoldMat);
        lRoof.position.y = 0.55;
        const lBot = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 8), vermilionPillarMat);
        lBot.rotation.x = Math.PI;
        lBot.position.y = -0.68;
        lantern.add(lCore, lRoof, lBot);
        sceneGroup.add(lantern);
        lanterns.push({ lantern, baseY: 3.8, phase: i * 0.9 });
      }

      // 四方远景重檐皇城宫殿
      for (let d = 0; d < 4; d++) {
        const a = (d * Math.PI) / 2;
        const dist = 17.5;
        const palace = new THREE.Group();
        palace.position.set(Math.cos(a) * dist, 0, Math.sin(a) * dist);
        palace.rotation.y = -a + Math.PI / 2;
        const pPlatform = new THREE.Mesh(new THREE.BoxGeometry(11.5, 1.2, 3.6), jadeAltarMat);
        pPlatform.position.y = 0.6;
        const pHall = new THREE.Mesh(new THREE.BoxGeometry(9.2, 3.2, 2.8), vermilionPillarMat);
        pHall.position.y = 2.8;
        const pRoof1 = new THREE.Mesh(new THREE.ConeGeometry(7.6, 1.8, 4), obsidianMat);
        pRoof1.rotation.y = Math.PI / 4;
        pRoof1.scale.set(1.35, 1, 0.58);
        pRoof1.position.y = 5.1;
        const pRoof2 = new THREE.Mesh(new THREE.ConeGeometry(5.6, 1.6, 4), imperialGoldMat);
        pRoof2.rotation.y = Math.PI / 4;
        pRoof2.scale.set(1.35, 1, 0.58);
        pRoof2.position.y = 6.7;
        palace.add(pPlatform, pHall, pRoof1, pRoof2);
        sceneGroup.add(palace);
      }

      animCallbacks.push((dt, p) => {
        lanterns.forEach(lt => {
          lt.lantern.position.y = lt.baseY + Math.sin(p * 10 + lt.phase) * 0.16;
          lt.lantern.rotation.y += dt * 0.8;
        });
      });
    } else if (sceneType === 'cg_grassland') {
      // 千山叠翠·瑶池芳甸巨景（用于侧面虎、八角马、天地炮）
      const meadowMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x34d399,
        roughness: 0.76,
        metalness: 0.02
      }), 1.0);
      const outerMeadowMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x16a34a,
        roughness: 0.82,
        metalness: 0.02
      }), 1.0);
      const hillMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.84,
        metalness: 0.02
      }), 0.96);
      const streamMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.22,
        roughness: 0.15,
        metalness: 0.35,
        side: THREE.DoubleSide
      }), 0.90);
      const whiteStoneMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        roughness: 0.55,
        metalness: 0.08
      }), 0.96);

      const meadow = new THREE.Mesh(new THREE.CylinderGeometry(52, 52, 0.36, 64), outerMeadowMat);
      meadow.position.y = -0.18;
      sceneGroup.add(meadow);

      const innerLawn = new THREE.Mesh(new THREE.CircleGeometry(7.8, 48), meadowMat);
      innerLawn.rotation.x = -Math.PI / 2;
      innerLawn.position.y = 0.006;
      sceneGroup.add(innerLawn);

      // 环草甸碧水清溪与四座汉白玉小拱桥
      const brookRing = new THREE.Mesh(new THREE.RingGeometry(7.8, 9.4, 64), streamMat);
      brookRing.rotation.x = -Math.PI / 2;
      brookRing.position.y = 0.008;
      sceneGroup.add(brookRing);

      for (let b = 0; b < 4; b++) {
        const ba = (b * Math.PI) / 2 + Math.PI / 4;
        const br = 8.6;
        const bridge = new THREE.Group();
        bridge.position.set(Math.cos(ba) * br, 0, Math.sin(ba) * br);
        bridge.rotation.y = -ba + Math.PI / 2;
        for (let s = -2; s <= 2; s++) {
          const archY = Math.cos((s / 2.8) * (Math.PI / 2)) * 0.55;
          const deck = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 1.35), whiteStoneMat);
          deck.position.set(s * 0.42, archY, 0);
          bridge.add(deck);
        }
        sceneGroup.add(bridge);
      }

      // 80 簇立体青草、36 朵盛开三色野花与 8 棵苍翠古树
      const bladeMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.62 }), 0.96);
      const flowerGoldMat = registerMat(new THREE.MeshBasicMaterial({ color: 0xfef08a }), 0.95);
      const flowerPinkMat = registerMat(new THREE.MeshBasicMaterial({ color: 0xf472b6 }), 0.95);
      const trunkMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.85 }), 0.98);
      const crownMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.72 }), 0.96);

      for (let g = 0; g < 72; g++) {
        const ang = (g / 72) * Math.PI * 2 + (g % 5) * 0.09;
        const r = g < 28 ? (2.4 + (g % 5) * 1.05) : (9.8 + (g % 6) * 1.45);
        const tuft = new THREE.Group();
        tuft.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
        for (let b = 0; b < 4; b++) {
          const blade = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.38 + (b % 2) * 0.14, 4), bladeMat);
          blade.position.set((b - 1.5) * 0.08, 0.19, (b % 2) * 0.05);
          blade.rotation.z = (b - 1.5) * 0.22;
          tuft.add(blade);
        }
        if (g % 2 === 0) {
          const blossom = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.09, 0),
            g % 4 === 0 ? flowerGoldMat : flowerPinkMat
          );
          blossom.position.set(0, 0.36, 0);
          tuft.add(blossom);
        }
        sceneGroup.add(tuft);
      }

      // 8 棵立体苍松古树
      for (let t = 0; t < 8; t++) {
        const ta = (t / 8) * Math.PI * 2 + 0.2;
        const tr = 12.2 + (t % 2) * 2.2;
        const tree = new THREE.Group();
        tree.position.set(Math.cos(ta) * tr, 0, Math.sin(ta) * tr);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 2.6, 10), trunkMat);
        trunk.position.y = 1.3;
        tree.add(trunk);
        [[0, 2.8, 0, 1.45], [-0.65, 2.35, 0.35, 1.05], [0.65, 2.45, -0.35, 1.12], [0, 3.45, 0, 1.0]].forEach(([cx, cy, cz, cr]) => {
          const foliage = new THREE.Mesh(new THREE.SphereGeometry(cr, 14, 12), crownMat);
          foliage.scale.set(1.25, 0.72, 1.25);
          foliage.position.set(cx, cy, cz);
          tree.add(foliage);
        });
        sceneGroup.add(tree);
      }

      // 远景双层翠绿群山与山巅白云雾带
      for (let i = 0; i < 14; i++) {
        const ang = (i / 14) * Math.PI * 2;
        const dist = 22.0 + (i % 3) * 3.6;
        const h = 6.8 + (i % 4) * 2.4;
        const hillGrp = new THREE.Group();
        hillGrp.position.set(Math.cos(ang) * dist, -0.3, Math.sin(ang) * dist);
        const mainH = new THREE.Mesh(new THREE.ConeGeometry(6.8, h, 9), hillMat);
        mainH.position.y = h * 0.5;
        const subH = new THREE.Mesh(new THREE.ConeGeometry(4.8, h * 0.75, 8), meadowMat);
        subH.position.set(2.8, h * 0.37, -1.2);
        hillGrp.add(mainH, subH);
        sceneGroup.add(hillGrp);
      }

      // 蓝天白云：16 团高空立体洁白流云群
      const cloudMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xf0f9ff,
        emissiveIntensity: 0.32,
        roughness: 0.42
      }), 0.92);
      const clouds = [];
      for (let c = 0; c < 16; c++) {
        const ang = (c / 16) * Math.PI * 2;
        const rad = 10.5 + (c % 4) * 3.8;
        const cGrp = new THREE.Group();
        [[-1.05, 0, 0.95], [0, 0.32, 1.32], [1.05, 0.05, 0.92], [0.4, 0.18, 0.88], [-0.45, 0.16, 0.85]].forEach(([ox, oy, s]) => {
          const puff = new THREE.Mesh(new THREE.SphereGeometry(1.18 * s, 14, 12), cloudMat);
          puff.scale.set(1.5, 0.58, 1.05);
          puff.position.set(ox, oy, 0);
          cGrp.add(puff);
        });
        cGrp.position.set(Math.cos(ang) * rad, 6.8 + (c % 3) * 1.8, Math.sin(ang) * rad);
        cGrp.rotation.y = -ang + Math.PI / 2;
        sceneGroup.add(cGrp);
        clouds.push({ cGrp, baseX: cGrp.position.x, baseZ: cGrp.position.z, phase: c * 0.7 });
      }
      animCallbacks.push((dt, p) => {
        clouds.forEach(cl => {
          cl.cGrp.position.x = cl.baseX + Math.sin(p * 4 + cl.phase) * 0.65;
        });
      });

      // 天地炮专属：烈日坠地对场地造成毁灭性物理破坏 + 24块掀翻翘起的地壳断岩 + 立体沸腾熔岩池 + 14根喷涌岩浆火柱！
      if (options.withScorchEarth) {
        const scorchGroup = new THREE.Group();
        scorchGroup.position.set(0, 0.015, 0);
        scorchGroup.visible = false;
        sceneGroup.add(scorchGroup);

        const crackTex = typeof getMagmaCrackTexture === 'function' ? getMagmaCrackTexture() : null;
        const charMat = new THREE.MeshStandardMaterial({
          color: 0x140704,
          emissive: 0x7c2d12,
          emissiveIntensity: 0.55,
          roughness: 0.92,
          transparent: true,
          opacity: 0
        });
        const charDisc = new THREE.Mesh(new THREE.CircleGeometry(10.8, 64), charMat);
        charDisc.rotation.x = -Math.PI / 2;
        scorchGroup.add(charDisc);

        const lavaPoolMat = new THREE.MeshBasicMaterial({
          map: crackTex,
          color: 0xff4500,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        const lavaDisc = new THREE.Mesh(new THREE.CircleGeometry(9.8, 64), lavaPoolMat);
        lavaDisc.rotation.x = -Math.PI / 2;
        lavaDisc.position.y = 0.018;
        scorchGroup.add(lavaDisc);

        const moltenCoreMat = new THREE.MeshBasicMaterial({
          color: 0xfde047,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        const innerMoltenLake = new THREE.Mesh(new THREE.CircleGeometry(3.8, 48), moltenCoreMat);
        innerMoltenLake.rotation.x = -Math.PI / 2;
        innerMoltenLake.position.y = 0.028;
        scorchGroup.add(innerMoltenLake);

        // 8 条放射状立体奔涌熔岩火河 (Magma Rivers)
        const magmaRivers = [];
        for (let r = 0; r < 8; r++) {
          const ra = (r / 8) * Math.PI * 2 + 0.2;
          const pts = [
            new THREE.Vector3(0, 0.03, 0),
            new THREE.Vector3(Math.cos(ra + 0.15) * 3.8, 0.05, Math.sin(ra + 0.15) * 3.8),
            new THREE.Vector3(Math.cos(ra - 0.1) * 7.6, 0.03, Math.sin(ra - 0.1) * 7.6)
          ];
          const riverTube = new THREE.Mesh(
            new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.18, 8, false),
            r % 2 === 0 ? moltenCoreMat : lavaPoolMat
          );
          scorchGroup.add(riverTube);
          magmaRivers.push(riverTube);
        }

        // 24 块被太阳砸裂掀翻的立体地壳断岩与焦土块（分内外两圈，随太阳冲击波向上翘起掀翻！）
        const crustSlabRockMat = new THREE.MeshStandardMaterial({
          color: 0x1c100b,
          emissive: 0xdc2626,
          emissiveIntensity: 0.42,
          roughness: 0.86
        });
        const tectonicSlabs = [];
        for (let i = 0; i < 24; i++) {
          const isInner = i < 12;
          const idx = isInner ? i : i - 12;
          const ang = (idx / 12) * Math.PI * 2 + (isInner ? 0 : Math.PI / 12);
          const baseRad = isInner ? 2.45 : 4.85;
          const slabPivot = new THREE.Group();
          slabPivot.position.set(Math.cos(ang) * baseRad, -0.35, Math.sin(ang) * baseRad);
          slabPivot.rotation.y = -ang + Math.PI / 2;

          const w = isInner ? 1.15 : 1.65;
          const d = isInner ? 0.95 : 1.35;
          const topCrust = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, d), crustSlabRockMat);
          const glowingUnder = new THREE.Mesh(new THREE.BoxGeometry(w * 0.92, 0.16, d * 0.92), lavaPoolMat);
          glowingUnder.position.y = -0.14;
          const jaggedPeak = new THREE.Mesh(new THREE.ConeGeometry(w * 0.42, 0.75, 5), crustSlabRockMat);
          jaggedPeak.position.set(0, 0.35, -d * 0.2);
          jaggedPeak.rotation.x = -0.35;
          slabPivot.add(topCrust, glowingUnder, jaggedPeak);
          scorchGroup.add(slabPivot);
          tectonicSlabs.push({
            slabPivot,
            ang,
            baseRad,
            isInner,
            maxTilt: isInner ? 0.78 : 0.54,
            maxHeight: isInner ? 0.65 : 0.48
          });
        }

        // 14 道立体喷涌熔岩火柱 (Erupting Magma Geysers) 与 18 块崩飞熔岩巨石
        const lavaGeysers = Array.from({ length: 14 }, (_, i) => {
          const a = (i / 14) * Math.PI * 2 + 0.15;
          const r = 1.6 + (i % 3) * 1.55;
          const geyser = new THREE.Group();
          geyser.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
          const outerCol = new THREE.Mesh(new THREE.ConeGeometry(0.42, 3.6, 10), lavaPoolMat);
          outerCol.position.y = 1.8;
          const innerCol = new THREE.Mesh(new THREE.ConeGeometry(0.24, 3.2, 8), moltenCoreMat);
          innerCol.position.y = 1.6;
          geyser.add(outerCol, innerCol);
          geyser.scale.set(1, 0.001, 1);
          scorchGroup.add(geyser);
          return { geyser, phase: i * 0.9, maxH: 0.85 + (i % 3) * 0.35 };
        });

        const flyingMagmaRocks = Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2;
          const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.24 + (i % 3) * 0.08, 0),
            i % 3 === 0 ? moltenCoreMat : crustSlabRockMat
          );
          rock.visible = false;
          scorchGroup.add(rock);
          return { rock, a, spd: 3.2 + (i % 4) * 1.2, lift: 2.8 + (i % 3) * 1.1 };
        });

        sceneGroup.userData.setScorchProgress = (scorchP, destructionP = 0, fade = 1) => {
          if (scorchP <= 0.001 && destructionP <= 0.001) {
            scorchGroup.visible = false;
            return;
          }
          scorchGroup.visible = true;
          const sp = Math.min(1, Math.max(0, scorchP));
          const dp = Math.min(1, Math.max(0, destructionP));

          // 太阳砸下时原草地中心塌陷露出熔岩深坑
          innerLawn.position.y = 0.006 - dp * 0.38;

          const sc = 0.30 + sp * 0.95 + dp * 0.25;
          scorchGroup.scale.setScalar(sc);
          charMat.opacity = Math.min(1, sp * 1.1) * 0.96 * fade;
          lavaPoolMat.opacity = Math.min(1, sp * 1.15) * 0.92 * fade;
          moltenCoreMat.opacity = (sp * 0.55 + dp * 0.45) * 0.90 * fade;
          lavaDisc.rotation.z += 0.008;

          // 场地物理破坏：24块地壳断岩掀翻翘起 + 14根熔岩火柱喷涌 + 18块熔岩巨石崩飞
          const heaveEase = 1 - Math.pow(1 - Math.min(1, dp * 1.6), 3);
          tectonicSlabs.forEach(({ slabPivot, ang, baseRad, maxTilt, maxHeight }) => {
            const curR = baseRad + heaveEase * 0.55;
            slabPivot.position.set(
              Math.cos(ang) * curR,
              -0.35 + (sp * 0.25 + heaveEase * maxHeight),
              Math.sin(ang) * curR
            );
            slabPivot.rotation.x = -heaveEase * maxTilt;
          });

          lavaGeysers.forEach(({ geyser, phase, maxH }) => {
            if (dp > 0.01) {
              geyser.visible = true;
              const pulse = maxH * heaveEase * (0.78 + Math.sin(dp * 28 + phase) * 0.22);
              geyser.scale.set(0.85 + heaveEase * 0.35, Math.max(0.01, pulse), 0.85 + heaveEase * 0.35);
            } else {
              geyser.visible = false;
            }
          });

          flyingMagmaRocks.forEach(({ rock, a, spd, lift }) => {
            if (dp > 0.02 && dp < 0.96) {
              rock.visible = true;
              const r = 0.8 + dp * spd;
              rock.position.set(
                Math.cos(a) * r,
                Math.max(0.15, Math.sin(dp * Math.PI) * lift),
                Math.sin(a) * r
              );
              rock.rotation.x += 0.16;
              rock.rotation.z += 0.14;
              rock.scale.setScalar(Math.max(0.05, (1 - dp * 0.5) * fade));
            } else {
              rock.visible = false;
            }
          });
        };
      }
    } else if (sceneType === 'cg_ocean_day') {
      // 钓鱼马专属：沧海龙宫·千层碧浪巨景（含8座海蚀奇峰礁石岛屿、拍岸白浪、多层立体翻卷海浪管与真实深度遮挡海面）
      const deepSeaMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x0369a1,
        emissive: 0x075985,
        emissiveIntensity: 0.34,
        roughness: 0.14,
        metalness: 0.42
      }), 0.98, true);
      const seaSurface = new THREE.Mesh(new THREE.CircleGeometry(52, 64), deepSeaMat);
      seaSurface.rotation.x = -Math.PI / 2;
      seaSurface.position.y = 0.0;
      seaSurface.renderOrder = 2;
      sceneGroup.add(seaSurface);

      const waveFoamMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.68);
      const waveCyanMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.58);
      const reefRockMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.78,
        metalness: 0.18
      }), 0.98);
      const mossGreenMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x059669,
        roughness: 0.72
      }), 0.96);

      // 8 座海蚀奇峰礁石岛屿 + 岛基拍岸浪花环
      const surfRings = [];
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + 0.25;
        const dist = 9.5 + (i % 2) * 3.2;
        const island = new THREE.Group();
        island.position.set(Math.cos(ang) * dist, 0, Math.sin(ang) * dist);
        const h = 3.2 + (i % 3) * 1.4;
        const mainSpire = new THREE.Mesh(new THREE.ConeGeometry(1.65, h, 7), reefRockMat);
        mainSpire.position.y = h * 0.45;
        const subSpire = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 0), reefRockMat);
        subSpire.position.set(0.95, 0.85, 0.45);
        const topMoss = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.85, 7), mossGreenMat);
        topMoss.position.y = h * 0.78;
        const surfRing = new THREE.Mesh(new THREE.RingGeometry(1.55, 2.25, 24), waveFoamMat);
        surfRing.rotation.x = -Math.PI / 2;
        surfRing.position.y = 0.03;
        island.add(mainSpire, subSpire, topMoss, surfRing);
        sceneGroup.add(island);
        surfRings.push({ surfRing, phase: i * 0.8 });
      }

      const waveRings = [1.0, 1.9, 3.0, 4.4, 6.2, 8.2].map((r, idx) => {
        const pts = [];
        for (let s = 0; s < 56; s++) {
          const a = (s / 56) * Math.PI * 2;
          const rad = r + Math.sin(a * (6 + idx * 2)) * 0.20;
          pts.push(new THREE.Vector3(Math.cos(a) * rad, 0.045 + (idx % 2) * 0.035, Math.sin(a) * rad));
        }
        const curve = new THREE.CatmullRomCurve3(pts, true);
        const mesh = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 72, 0.060, 8, true),
          idx % 2 === 0 ? waveFoamMat : waveCyanMat
        );
        sceneGroup.add(mesh);
        return { mesh, idx };
      });

      const linearSwells = Array.from({ length: 18 }, (_, i) => {
        const ang = (i / 18) * Math.PI * 2;
        const dist = 2.4 + (i % 5) * 1.85;
        const crest = new THREE.Mesh(
          new THREE.TorusGeometry(0.72, 0.048, 8, 24, Math.PI * 0.88),
          i % 2 === 0 ? waveFoamMat : waveCyanMat
        );
        crest.position.set(Math.cos(ang) * dist, 0.055, Math.sin(ang) * dist);
        crest.rotation.x = Math.PI / 2;
        crest.rotation.z = ang;
        sceneGroup.add(crest);
        return { crest, ang, dist, i };
      });

      animCallbacks.push((dt, p) => {
        waveRings.forEach(({ mesh, idx }) => {
          mesh.rotation.y += dt * (idx % 2 === 0 ? 0.9 : -0.7);
          const sc = 0.94 + Math.sin(p * 10 + idx) * 0.08;
          mesh.scale.set(sc, 1, sc);
        });
        linearSwells.forEach(({ crest, ang, dist, i }) => {
          const curR = dist + Math.sin(p * 8 + i) * 0.45;
          crest.position.set(Math.cos(ang + p * 0.5) * curR, 0.055, Math.sin(ang + p * 0.5) * curR);
        });
        surfRings.forEach(({ surfRing, phase }) => {
          const s = 0.92 + Math.sin(p * 12 + phase) * 0.16;
          surfRing.scale.set(s, s, 1);
        });
      });
    } else if (sceneType === 'cg_ocean_night') {
      // 海底捞月专属：星河瀚海·沧海月明巨景（深邃夜海、海崖奇峰、12盏漂浮莲花河灯、90颗璀璨星辰、中心大型精雕圆月倒影与8层波纹）
      const nightSeaMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x041022,
        emissive: 0x071d3a,
        emissiveIntensity: 0.36,
        roughness: 0.12,
        metalness: 0.56
      }), 0.98, true);
      const nightSea = new THREE.Mesh(new THREE.CircleGeometry(52, 64), nightSeaMat);
      nightSea.rotation.x = -Math.PI / 2;
      nightSea.position.y = 0.0;
      sceneGroup.add(nightSea);

      // 中心巨大的多层精雕圆月海中倒影
      const moonReflectGroup = new THREE.Group();
      moonReflectGroup.position.set(0, 0.022, 0);
      sceneGroup.add(moonReflectGroup);

      const moonCoreMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xfef9c3,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.94);
      const moonInnerMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xfde047,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.72);
      const moonOuterHaloMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.46);

      const moonCoreDisc = new THREE.Mesh(new THREE.CircleGeometry(2.05, 64), moonCoreMat);
      moonCoreDisc.rotation.x = -Math.PI / 2;
      const moonInnerDisc = new THREE.Mesh(new THREE.CircleGeometry(2.68, 64), moonInnerMat);
      moonInnerDisc.rotation.x = -Math.PI / 2;
      moonInnerDisc.position.y = -0.004;
      const moonOuterHalo = new THREE.Mesh(new THREE.RingGeometry(1.95, 3.65, 64), moonOuterHaloMat);
      moonOuterHalo.rotation.x = -Math.PI / 2;
      moonOuterHalo.position.y = -0.006;
      moonReflectGroup.add(moonOuterHalo, moonInnerDisc, moonCoreDisc);

      // 海面 8 层波纹
      const rippleRings = Array.from({ length: 8 }, (_, i) => {
        const rMat = registerMat(new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xfef08a : 0x7dd3fc,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false
        }), 0.68);
        const rMesh = new THREE.Mesh(new THREE.RingGeometry(0.42 + i * 0.52, 0.52 + i * 0.52, 56), rMat);
        rMesh.rotation.x = -Math.PI / 2;
        rMesh.position.y = 0.03 + i * 0.002;
        sceneGroup.add(rMesh);
        return { rMesh, rMat, i };
      });

      // 12 盏海上漂浮发光莲花河灯 + 8 座远景海崖礁石
      const lotusPetalMat = registerMat(new THREE.MeshBasicMaterial({ color: 0x7dd3fc }), 0.85);
      const lotusCoreMat = registerMat(new THREE.MeshBasicMaterial({ color: 0xfef08a }), 0.95);
      const cliffMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x0b192c, roughness: 0.85 }), 0.95);
      const seaLanterns = [];

      for (let l = 0; l < 12; l++) {
        const la = (l / 12) * Math.PI * 2 + 0.18;
        const lr = 4.8 + (l % 3) * 1.85;
        const lGrp = new THREE.Group();
        lGrp.position.set(Math.cos(la) * lr, 0.04, Math.sin(la) * lr);
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.16, 0.10, 8), lotusPetalMat);
        const wick = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), lotusCoreMat);
        wick.position.y = 0.08;
        lGrp.add(base, wick);
        sceneGroup.add(lGrp);
        seaLanterns.push({ lGrp, la, lr, phase: l * 0.9 });
      }

      for (let c = 0; c < 8; c++) {
        const ca = (c / 8) * Math.PI * 2;
        const cr = 12.8;
        const cliff = new THREE.Mesh(new THREE.ConeGeometry(1.8, 3.6 + (c % 2) * 1.4, 7), cliffMat);
        cliff.position.set(Math.cos(ca) * cr, 1.5, Math.sin(ca) * cr);
        sceneGroup.add(cliff);
      }

      animCallbacks.push((dt, p) => {
        seaLanterns.forEach(sl => {
          const curA = sl.la + p * 0.18;
          sl.lGrp.position.set(
            Math.cos(curA) * sl.lr,
            0.04 + Math.sin(p * 12 + sl.phase) * 0.03,
            Math.sin(curA) * sl.lr
          );
        });
      });

      sceneGroup.userData.moonReflectGroup = moonReflectGroup;
      sceneGroup.userData.moonCoreMat = moonCoreMat;
      sceneGroup.userData.moonInnerMat = moonInnerMat;
      sceneGroup.userData.rippleRings = rippleRings;
    } else if (sceneType === 'cg_sunset_mountain') {
      // 列马车专属：雄关漫道·血日断崖巨景（远端多级险峻崇山峻岭与山巅古关城台、悬崖栈道、双翼烽火台、迎客苍松、峡谷石板古道与巨型血色残阳）
      const canyonGroundMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x2b120c,
        roughness: 0.86,
        metalness: 0.08
      }), 1.0);
      const canyonGround = new THREE.Mesh(new THREE.CylinderGeometry(52, 52, 0.36, 64), canyonGroundMat);
      canyonGround.position.y = -0.18;
      sceneGroup.add(canyonGround);

      const mainPeakMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x3b1810,
        roughness: 0.82,
        metalness: 0.14
      }), 1.0);
      const cliffRockMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x522216,
        roughness: 0.76,
        metalness: 0.18
      }), 1.0);
      const goldTrimMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0xd97706,
        emissive: 0x78350f,
        emissiveIntensity: 0.24,
        roughness: 0.32,
        metalness: 0.85
      }), 0.95);
      const pineGreenMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x14532d,
        roughness: 0.78
      }), 0.95);
      const fireGlowMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xf97316,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }), 0.85);

      // 1. 远端主峰雄关城台（建模马屹立其上）与多级岩层护坡、山顶垛口、悬崖迎客松与石板冲锋古道
      const farSummitGroup = new THREE.Group();
      farSummitGroup.position.set(0, 0, -5.8);
      const mainMount = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 5.2, 2.35, 12), mainPeakMat);
      mainMount.position.y = 1.15;
      const summitCap = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 2.15, 0.28, 12), cliffRockMat);
      summitCap.position.y = 2.28;
      const summitRim = new THREE.Mesh(new THREE.TorusGeometry(1.98, 0.06, 8, 24), goldTrimMat);
      summitRim.rotation.x = Math.PI / 2;
      summitRim.position.y = 2.38;
      farSummitGroup.add(mainMount, summitCap, summitRim);

      // 主峰四周险峻抱山岩块与悬崖古松
      [[-2.2, 1.1, -0.5, 1.4], [2.2, 1.1, -0.5, 1.4], [-1.6, 1.5, 0.8, 1.1], [1.6, 1.5, 0.8, 1.1]].forEach(([rx, ry, rz, rs], idx) => {
        const crag = new THREE.Mesh(new THREE.DodecahedronGeometry(rs, 0), idx % 2 === 0 ? mainPeakMat : cliffRockMat);
        crag.scale.set(1.0, 1.35, 0.9);
        crag.position.set(rx, ry, rz);
        farSummitGroup.add(crag);
      });

      [-1.75, 1.75].forEach(px => {
        const pine = new THREE.Group();
        pine.position.set(px, 2.15, -0.35);
        pine.rotation.z = px < 0 ? 0.32 : -0.32;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.95, 8), mainPeakMat);
        trunk.position.y = 0.45;
        const canopy1 = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.45, 7), pineGreenMat);
        canopy1.position.set(px < 0 ? -0.25 : 0.25, 0.85, 0);
        const canopy2 = new THREE.Mesh(new THREE.ConeGeometry(0.50, 0.40, 7), pineGreenMat);
        canopy2.position.set(px < 0 ? -0.45 : 0.45, 1.12, 0);
        pine.add(trunk, canopy1, canopy2);
        farSummitGroup.add(pine);
      });

      // 下山石阶冲锋古道与两侧护栏石柱
      const slopeRamp = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.30, 5.8), cliffRockMat);
      slopeRamp.position.set(0, 1.12, 2.45);
      slopeRamp.rotation.x = 0.41;
      farSummitGroup.add(slopeRamp);
      sceneGroup.add(farSummitGroup);

      // 2. 左右双翼崇山峻岭与山巅烽火台 + 峡谷两侧峭壁
      [[-5.6, -7.2, 4.8, 6.2, true], [5.6, -7.2, 4.8, 6.0, true], [-9.6, -4.8, 4.2, 5.0, false], [9.6, -4.8, 4.2, 5.0, false], [-7.5, 1.5, 3.6, 3.8, false], [7.5, 1.5, 3.6, 3.8, false]].forEach(([mx, mz, mr, mh, hasBeacon]) => {
        const pGroup = new THREE.Group();
        pGroup.position.set(mx, 0, mz);
        const sidePeak = new THREE.Mesh(new THREE.ConeGeometry(mr, mh, 8), mainPeakMat);
        sidePeak.position.y = mh * 0.5 - 0.2;
        const subCrag = new THREE.Mesh(new THREE.ConeGeometry(mr * 0.65, mh * 0.68, 7), cliffRockMat);
        subCrag.position.set(mx > 0 ? -1.4 : 1.4, mh * 0.32, 1.1);
        pGroup.add(sidePeak, subCrag);
        if (hasBeacon) {
          const beaconTower = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 1.1), cliffRockMat);
          beaconTower.position.y = mh - 0.4;
          const beaconFire = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.35, 8), fireGlowMat);
          beaconFire.position.y = mh + 0.75;
          pGroup.add(beaconTower, beaconFire);
        }
        sceneGroup.add(pGroup);
      });

      // 3. 远山背景的巨型血色残阳（半径 1.68，与浮现放大的“车”棋子等大，且配有多层日冕与赤霞流云）
      const redSunGroup = new THREE.Group();
      redSunGroup.position.set(0, 4.15, -8.8);
      const sunCoreMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xef4444
      }), 0.96);
      const sunHaloMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xf97316,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.64);
      const sunOuterMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.36);
      const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(1.68, 36, 36), sunCoreMat);
      sunDisc.scale.set(1, 1, 0.25);
      const sunCorona = new THREE.Mesh(new THREE.RingGeometry(1.58, 2.48, 56), sunHaloMat);
      const sunOuterRing = new THREE.Mesh(new THREE.RingGeometry(2.45, 3.65, 56), sunOuterMat);
      redSunGroup.add(sunDisc, sunCorona, sunOuterRing);
      sceneGroup.add(redSunGroup);
      sceneGroup.userData.redSunGroup = redSunGroup;
    }

    return {
      sceneGroup,
      setFade(alpha, dt = 0.016, p = 0) {
        const clamped = Math.max(0, Math.min(1, alpha));
        sceneGroup.visible = clamped > 0.01;
        sceneGroup.position.y = -(1 - clamped) * 0.55;
        fadeMaterials.forEach(({ mat, baseOpacity, forceDepthWrite }) => {
          mat.opacity = baseOpacity * clamped;
          if (forceDepthWrite !== null) {
            mat.depthWrite = clamped > 0.45 ? forceDepthWrite : false;
          }
        });
        animCallbacks.forEach(cb => cb(dt, p));
      }
    };
  },

  /**
   * 创建精细化棋子变身光环特效（用于“车”、“马”、“炮”、“将/帅”平滑变身为 3D 建模的过渡瞬间）
   */
  createSmoothMorphAura(parentGroup, colorHex = 0xfbbf24) {
    const aura = new THREE.Group();
    aura.visible = false;
    parentGroup.add(aura);

    const ringMat1 = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.045, 10, 32), ringMat1);
    ring1.rotation.x = Math.PI / 2;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 10, 28), ringMat2);
    ring2.rotation.x = Math.PI / 3;
    const flashSphere = new THREE.Mesh(new THREE.SphereGeometry(0.65, 18, 18), ringMat2);
    aura.add(ring1, ring2, flashSphere);

    return {
      aura,
      update(pos, morphT, fade = 1) {
        if (morphT <= 0.01 || morphT >= 0.99) {
          aura.visible = false;
          return;
        }
        aura.visible = true;
        aura.position.copy(pos);
        aura.position.y += 0.45;
        const env = Math.sin(morphT * Math.PI);
        ring1.rotation.z += 0.18;
        ring2.rotation.y += 0.22;
        ring1.scale.setScalar((0.6 + morphT * 1.35) * fade);
        ring2.scale.setScalar((0.5 + env * 1.25) * fade);
        flashSphere.scale.setScalar(env * 1.15 * fade);
        ringMat1.opacity = env * 0.72 * fade;
        ringMat2.opacity = env * 0.62 * fade;
      }
    };
  },

  /**
   * 双将专属：精细化神兵 1（赤焰盘龙神枪剑）与神兵 2（金凰凤翅破天戟）及合体轩辕破天巨剑
   * 每个旋转武器均内嵌「3D 刀光剑轮流光环 (bladeWheelRing)」，配合纯单轴刀轮旋转，彻底告别乱转！
   */
  createRefinedDivineWeaponPairAndGreatsword(goldMat, crimsonLacquerMat, darkIronMat, goldGlowMat, crimsonGlowMat) {
    // 武器 1 外层轨迹载体 + 内层纯单轴刀轮自转体：赤焰盘龙神枪剑
    const weapon1 = new THREE.Group();
    const spinPivot1 = new THREE.Group();
    weapon1.add(spinPivot1);

    const shaft1 = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.066, 2.45, 16), darkIronMat);
    const gripRing1 = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.028, 10, 20), goldMat);
    gripRing1.rotation.x = Math.PI / 2;
    gripRing1.position.y = -1.16;
    const dragonGuard1 = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.18, 0.24), goldMat);
    dragonGuard1.position.y = 0.78;
    [-1, 1].forEach(s => {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.42, 6), crimsonLacquerMat);
      horn.position.set(s * 0.45, 0.94, 0);
      horn.rotation.z = -s * 0.68;
      spinPivot1.add(horn);
    });
    const coilPts = [];
    for (let i = 0; i <= 24; i++) {
      const f = i / 24;
      const a = f * Math.PI * 5;
      coilPts.push(new THREE.Vector3(Math.cos(a) * 0.095, -0.68 + f * 1.40, Math.sin(a) * 0.095));
    }
    const dragonCoil = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coilPts), 36, 0.024, 8, false),
      goldMat
    );
    const spearBlade1 = new THREE.Mesh(new THREE.ConeGeometry(0.20, 1.22, 4), crimsonGlowMat.clone());
    spearBlade1.scale.set(1.28, 1, 0.38);
    spearBlade1.position.y = 1.46;
    const bladeSpine1 = new THREE.Mesh(new THREE.BoxGeometry(0.075, 1.0, 0.095), goldMat);
    bladeSpine1.position.y = 1.30;
    // 刀轮剑气残影环（保证旋转时形成完美同心光轮）
    const wheelHalo1 = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.68, 36), crimsonGlowMat.clone());
    spinPivot1.add(shaft1, gripRing1, dragonGuard1, dragonCoil, spearBlade1, bladeSpine1, wheelHalo1);
    weapon1.userData = { spinPivot: spinPivot1, wheelHalo: wheelHalo1 };

    // 武器 2 外层轨迹载体 + 内层纯单轴刀轮自转体：金凰凤翅破天戟
    const weapon2 = new THREE.Group();
    const spinPivot2 = new THREE.Group();
    weapon2.add(spinPivot2);

    const shaft2 = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.066, 2.45, 16), goldMat);
    const pommel2 = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 1), crimsonLacquerMat);
    pommel2.position.y = -1.24;
    const collar2 = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.085, 0.26, 14), crimsonLacquerMat);
    collar2.position.y = 0.76;
    [-1, 1].forEach(s => {
      const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.40, 0.052, 10, 26, Math.PI * 0.92), goldMat);
      crescent.rotation.z = s === 1 ? -Math.PI * 0.45 : Math.PI * 0.55;
      crescent.position.set(s * 0.17, 0.96, 0);
      const featherWing = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.52, 6), goldGlowMat.clone());
      featherWing.position.set(s * 0.50, 1.14, 0);
      featherWing.rotation.z = -s * 0.52;
      spinPivot2.add(crescent, featherWing);
    });
    const halberdTip2 = new THREE.Mesh(new THREE.ConeGeometry(0.20, 1.22, 4), goldGlowMat.clone());
    halberdTip2.scale.set(1.28, 1, 0.38);
    halberdTip2.position.y = 1.46;
    const wheelHalo2 = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.68, 36), goldGlowMat.clone());
    spinPivot2.add(shaft2, pommel2, collar2, halberdTip2, wheelHalo2);
    weapon2.userData = { spinPivot: spinPivot2, wheelHalo: wheelHalo2 };

    // 合体巨型神剑：龙凤乾坤轩辕破天巨剑
    const greatsword = new THREE.Group();
    const outerBlade = new THREE.Mesh(new THREE.ConeGeometry(0.48, 3.95, 4), goldMat);
    outerBlade.rotation.x = Math.PI;
    outerBlade.scale.set(1.52, 1, 0.36);
    outerBlade.position.y = 0.0;

    const bladeEdgeGlow = new THREE.Mesh(new THREE.ConeGeometry(0.52, 4.02, 4), goldGlowMat.clone());
    bladeEdgeGlow.rotation.x = Math.PI;
    bladeEdgeGlow.scale.set(1.58, 1, 0.24);
    bladeEdgeGlow.position.y = -0.02;

    const fullerCore = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.95, 0.19), crimsonLacquerMat);
    fullerCore.position.y = 0.42;
    const runeLine = new THREE.Mesh(new THREE.BoxGeometry(0.085, 2.75, 0.22), crimsonGlowMat.clone());
    runeLine.position.y = 0.42;

    const guardCenter = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.36, 0.45), crimsonLacquerMat);
    guardCenter.position.y = 1.92;
    const guardGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 1), goldGlowMat.clone());
    guardGem.position.set(0, 1.92, 0.24);
    const guardGemBack = guardGem.clone();
    guardGemBack.position.set(0, 1.92, -0.24);

    [-1, 1].forEach(s => {
      for (let w = 0; w < 3; w++) {
        const wingPinion = new THREE.Mesh(
          new THREE.ConeGeometry(0.15 - w * 0.02, 1.02 - w * 0.15, 6),
          w % 2 === 0 ? goldMat : crimsonLacquerMat
        );
        wingPinion.position.set(s * (0.75 + w * 0.30), 2.02 + w * 0.14, 0);
        wingPinion.rotation.z = -s * (0.95 - w * 0.18);
        greatsword.add(wingPinion);
      }
      const lowerFangs = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.56, 5), goldMat);
      lowerFangs.position.set(s * 0.50, 1.55, 0);
      lowerFangs.rotation.z = s * 2.75;
      greatsword.add(lowerFangs);
    });

    const swordHaloRing = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.060, 12, 40), goldGlowMat.clone());
    swordHaloRing.position.y = 1.92;

    const hiltShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 1.22, 16), darkIronMat);
    hiltShaft.position.y = 2.65;
    for (let r = 0; r < 4; r++) {
      const gripBand = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.030, 8, 20), goldMat);
      gripBand.rotation.x = Math.PI / 2;
      gripBand.position.y = 2.24 + r * 0.26;
      greatsword.add(gripBand);
    }
    const pommelCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.19, 0.24, 14), goldMat);
    pommelCrown.position.y = 3.32;
    const pommelSphere = new THREE.Mesh(new THREE.OctahedronGeometry(0.30, 1), crimsonGlowMat.clone());
    pommelSphere.position.y = 3.60;

    greatsword.add(
      outerBlade,
      bladeEdgeGlow,
      fullerCore,
      runeLine,
      guardCenter,
      guardGem,
      guardGemBack,
      swordHaloRing,
      hiltShaft,
      pommelCrown,
      pommelSphere
    );
    greatsword.userData = { swordHaloRing };
    return { weapon1, weapon2, greatsword };
  },

  /**
   * 构建 17 种古谱杀法的全屏 CG 级 3D 场景切换与棋子动态变身演出
   */
  build3DSpectacleForType(vfxType, kPos, cPos, rPos, winnerColor, pattern = null, kingItem = null, vfxContext = null) {
    const group = new THREE.Group();
    group.visible = false;
    this.checkmateVFXGroup.add(group);
    const slashTex = typeof getSlashArcTexture === 'function' ? getSlashArcTexture() : null;

    const wrapUpdater = (fn) => {
      const wrapped = (p, dt, fade = 1) => {
        if (!group.visible && fade > 0.001) group.visible = true;
        fn(p, dt, fade);
      };
      wrapped.spectacleGroup = group;
      return wrapped;
    };

    const smoothstep = (e0, e1, x) => {
      const t = Math.max(0, Math.min(1, (x - e0) / Math.max(1e-5, e1 - e0)));
      return t * t * (3 - 2 * t);
    };

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0x92400e,
      emissiveIntensity: 0.22,
      metalness: 0.86,
      roughness: 0.22
    });
    const darkIronMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0x0f172a,
      emissiveIntensity: 0.16,
      metalness: 0.82,
      roughness: 0.28
    });
    const crimsonLacquerMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      emissive: 0x450a0a,
      emissiveIntensity: 0.20,
      metalness: 0.36,
      roughness: 0.32
    });
    const bronzeWoodMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      emissive: 0x270e04,
      emissiveIntensity: 0.16,
      metalness: 0.42,
      roughness: 0.38
    });
    const ivoryFangMat = new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: 0xfef3c7,
      emissiveIntensity: 0.18,
      metalness: 0.22,
      roughness: 0.18
    });
    const jadeIceMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      emissiveIntensity: 0.28,
      metalness: 0.32,
      roughness: 0.18,
      transparent: true,
      opacity: 0.88
    });
    const crimsonGlowMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.60,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const goldGlowMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.62,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.60,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const checkersList = Array.isArray(pattern?.checkers) ? pattern.checkers : [];
    const attackerItems = (this._activeCheckerMeshes || []).filter(it => !it.isKing && it.isAttacker);

    const findAttackerItemByType = (typeChar, excludeItem = null) => {
      const found = attackerItems.find(
        it => it !== excludeItem && (it.piece?.isHidden ? (it.piece.posType || it.piece.type) : it.piece?.type) === typeChar
      );
      if (found) return found;
      if (this.engine?.board) {
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 9; c++) {
            const p = this.engine.board[r][c];
            if (p && p.color === winnerColor && (p.isHidden ? (p.posType || p.type) : p.type) === typeChar) {
              const m = this.pieceMeshes.get(p.id);
              if (m && (!excludeItem || excludeItem.mesh !== m)) {
                let item = this._activeCheckerMeshes.find(x => x.mesh === m);
                if (!item) {
                  item = {
                    mesh: m,
                    piece: p,
                    coord: { r, c },
                    basePos: m.position.clone(),
                    isKing: false,
                    isAttacker: true,
                    customDriven: false
                  };
                  this._activeCheckerMeshes.push(item);
                }
                return item;
              }
            }
          }
        }
      }
      return attackerItems.find(it => it !== excludeItem) || attackerItems[0] || null;
    };

    const findCheckerPosByType = (typeChar, fallbackPos) => {
      const item = findAttackerItemByType(typeChar);
      if (item && item.basePos) return item.basePos.clone();
      const found = checkersList.find(ch => ch && ch.type === typeChar && typeof ch.r === 'number' && typeof ch.c === 'number');
      if (found) return gridToWorld(found.r, found.c);
      return fallbackPos;
    };

    const findFriendlyGeneralItem = () => {
      if (this.engine?.board) {
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 9; c++) {
            const p = this.engine.board[r][c];
            if (p && p.color === winnerColor && p.type === 'k') {
              const m = this.pieceMeshes.get(p.id);
              if (m) {
                let item = this._activeCheckerMeshes.find(x => x.mesh === m);
                if (!item) {
                  item = {
                    mesh: m,
                    piece: p,
                    coord: { r, c },
                    basePos: m.position.clone(),
                    isKing: false,
                    isAttacker: true,
                    customDriven: false
                  };
                  this._activeCheckerMeshes.push(item);
                }
                return item;
              }
            }
          }
        }
      }
      return attackerItems[0] || null;
    };

    /**
     * 查找将（帅）周围将其闷死/困住的棋子（用于闷杀：闷着“将（帅）”的棋子变身成为栏杆拦住“将（帅）”）
     */
    const findSmotheringBlockerItems = (maxCount = 4) => {
      const results = [];
      const kCoord = pattern?.kingCoord || { r: 0, c: 4 };
      if (this.engine?.board) {
        const candidates = [];
        for (let r = 0; r < 10; r++) {
          for (let c = 0; c < 9; c++) {
            if (r === kCoord.r && c === kCoord.c) continue;
            const p = this.engine.board[r][c];
            if (!p) continue;
            const m = this.pieceMeshes.get(p.id);
            if (!m) continue;
            // 排除正在腾空变身铁球的致胜主攻子
            if (attackerItems[0] && attackerItems[0].mesh === m) continue;
            const dist = Math.hypot(r - kCoord.r, c - kCoord.c);
            candidates.push({ r, c, p, m, dist });
          }
        }
        candidates.sort((a, b) => a.dist - b.dist);
        for (const cand of candidates.slice(0, maxCount)) {
          let item = this._activeCheckerMeshes.find(x => x.mesh === cand.m);
          if (!item) {
            item = {
              mesh: cand.m,
              piece: cand.p,
              coord: { r: cand.r, c: cand.c },
              basePos: cand.m.position.clone(),
              isKing: false,
              isAttacker: false,
              customDriven: false
            };
            this._activeCheckerMeshes.push(item);
          }
          results.push(item);
        }
      }
      return results;
    };

    const create3DChainBetween = (p1, p2, linkCount = 14, parentObj = group) => {
      const chainGroup = new THREE.Group();
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = dir.length();
      const normDir = len > 1e-4 ? dir.clone().normalize() : new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normDir);
      for (let i = 0; i <= linkCount; i++) {
        const f = i / linkCount;
        const link = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 8, 16), i % 2 === 0 ? darkIronMat : goldMat);
        link.position.lerpVectors(p1, p2, f);
        link.quaternion.copy(quat);
        if (i % 2 === 1) link.rotateY(Math.PI / 2);
        chainGroup.add(link);
      }
      parentObj.add(chainGroup);
      return { chainGroup, len };
    };

    /**
     * 通用 3D 爆炸与冲击波模组（支持动态中心位置）
     */
    const create3DCannonExplosion = (centerPos, scale = 1.0) => {
      const expGroup = new THREE.Group();
      expGroup.position.set(centerPos.x, 0.25, centerPos.z);
      expGroup.visible = false;
      group.add(expGroup);

      const coreSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.48 * scale, 20, 20),
        goldGlowMat.clone()
      );
      const fireball = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.76 * scale, 2),
        crimsonGlowMat.clone()
      );
      const groundWave = new THREE.Mesh(
        new THREE.RingGeometry(0.38 * scale, 0.84 * scale, 40),
        goldGlowMat.clone()
      );
      groundWave.rotation.x = -Math.PI / 2;
      groundWave.position.y = -0.18;

      const tiltedWave = new THREE.Mesh(
        new THREE.TorusGeometry(0.68 * scale, 0.065 * scale, 12, 36),
        crimsonGlowMat.clone()
      );
      tiltedWave.rotation.x = Math.PI / 3;
      expGroup.add(coreSphere, fireball, groundWave, tiltedWave);

      const shrapnelList = Array.from({ length: 18 }, (_, i) => {
        const ang = (i / 18) * Math.PI * 2;
        const frag = new THREE.Mesh(
          new THREE.DodecahedronGeometry((0.13 + (i % 3) * 0.045) * scale, 0),
          i % 2 === 0 ? goldMat : darkIronMat
        );
        expGroup.add(frag);
        return {
          frag,
          ang,
          spd: (2.4 + (i % 4) * 0.75) * scale,
          lift: (1.55 + (i % 3) * 0.65) * scale
        };
      });

      let soundTriggered = false;
      return {
        expGroup,
        update(localP, fade = 1, overrideCenter = null) {
          if (localP <= 0 || localP >= 1) {
            expGroup.visible = false;
            return;
          }
          if (overrideCenter) {
            expGroup.position.set(overrideCenter.x, (overrideCenter.y || 0) + 0.25, overrideCenter.z);
          }
          expGroup.visible = true;
          if (!soundTriggered) {
            soundTriggered = true;
            this.cameraShake = Math.max(this.cameraShake || 0, 0.46 * scale);
          }
          const fastExpand = 1 - Math.pow(1 - localP, 3);
          const alpha = Math.max(0, (1 - localP) * fade);

          coreSphere.scale.setScalar(0.5 + fastExpand * 1.95);
          coreSphere.material.opacity = alpha * 0.78;

          fireball.scale.setScalar(0.4 + fastExpand * 2.5);
          fireball.rotation.y += 0.12;
          fireball.rotation.x += 0.08;
          fireball.material.opacity = alpha * 0.68;

          groundWave.scale.setScalar(0.5 + fastExpand * 3.6);
          groundWave.material.opacity = alpha * 0.74;

          tiltedWave.scale.setScalar(0.5 + fastExpand * 3.0);
          tiltedWave.rotation.z += 0.15;
          tiltedWave.material.opacity = alpha * 0.64;

          shrapnelList.forEach(({ frag, ang, spd, lift }) => {
            const dist = 0.25 + fastExpand * spd;
            frag.position.set(
              Math.cos(ang) * dist,
              Math.max(-0.15, Math.sin(localP * Math.PI) * lift),
              Math.sin(ang) * dist
            );
            frag.rotation.x += 0.20;
            frag.rotation.z += 0.16;
            frag.scale.setScalar(Math.max(0.01, (1 - localP * 0.65) * fade));
          });
        }
      };
    };

    /**
     * 通用受攻击将帅 3D 棋子物理受击反馈（支持自定义中心点 anchorPos 与基础缩放 baseScale）
     */
    const applyKingHitFeedback = (hitP, style = 'collision', dirX = 0, dirZ = 1, anchorPos = null, baseScale = 1.0) => {
      if (!kingItem || !kingItem.mesh || hitP <= 0) return;
      kingItem.customDriven = true;
      const m = kingItem.mesh;
      const bp = anchorPos || kingItem.basePos || kVec;
      const clamped = Math.min(1, Math.max(0, hitP));
      const env = Math.sin(clamped * Math.PI);
      const decay = 1 - clamped * 0.75;

      if (style === 'collision') {
        const joltX = Math.sin(clamped * 68) * 0.22 * decay + dirX * env * 0.34;
        const joltZ = Math.cos(clamped * 62) * 0.22 * decay + dirZ * env * 0.34;
        const jumpY = Math.max(0, Math.sin(clamped * Math.PI * 1.4) * 0.78 * decay);
        const sq = (1 + Math.sin(clamped * 36) * 0.18 * decay) * baseScale;
        this.setPiece3DPose(
          m,
          bp.x + joltX,
          (bp.y || 0) + jumpY,
          bp.z + joltZ,
          Math.sin(clamped * 32) * 0.65 * decay,
          clamped * Math.PI * 1.8,
          Math.cos(clamped * 28) * 0.58 * decay,
          [sq, (baseScale * baseScale) / Math.max(0.3, sq), sq],
          1.0,
          env * 0.75,
          0xef4444
        );
      } else if (style === 'slash') {
        const slideBack = Math.sin(clamped * Math.PI) * 0.38;
        const shake = Math.sin(clamped * 75) * 0.14 * decay;
        const pressY = (1 - env * 0.34) * baseScale;
        const spreadXZ = (1 + env * 0.22) * baseScale;
        this.setPiece3DPose(
          m,
          bp.x + shake,
          (bp.y || 0) + Math.max(0, Math.sin(clamped * Math.PI * 2) * 0.28 * decay),
          bp.z + dirZ * slideBack,
          -dirZ * env * 0.62,
          shake * 2.0,
          Math.sin(clamped * 42) * 0.38 * decay,
          [spreadXZ, pressY, spreadXZ],
          1.0,
          env * 0.78,
          0xfbbf24
        );
      } else if (style === 'cannon_blast') {
        const blastLift = Math.max(0, Math.sin(clamped * Math.PI) * 0.95);
        const recoil = Math.sin(clamped * Math.PI * 0.8) * 0.42;
        const jitter = Math.sin(clamped * 80) * 0.16 * decay;
        const pulse = (1 + Math.sin(clamped * 40) * 0.20 * decay) * baseScale;
        this.setPiece3DPose(
          m,
          bp.x + dirX * recoil + jitter,
          (bp.y || 0) + blastLift,
          bp.z + dirZ * recoil - jitter,
          dirZ * env * 0.78 + Math.sin(clamped * 30) * 0.28,
          clamped * Math.PI * 2.4,
          -dirX * env * 0.68,
          [pulse, (baseScale * baseScale) / Math.max(0.3, pulse), pulse],
          1.0,
          env * 0.80,
          0xef4444
        );
      } else if (style === 'heavy_smash') {
        const crush = clamped < 0.35 ? (clamped / 0.35) : Math.max(0.18, 1 - (clamped - 0.35) * 0.9);
        const tremor = Math.sin(clamped * 85) * 0.12 * decay;
        this.setPiece3DPose(
          m,
          bp.x + tremor,
          (bp.y || 0),
          bp.z - tremor,
          Math.sin(clamped * 45) * 0.24 * decay,
          0,
          Math.cos(clamped * 45) * 0.24 * decay,
          [(1 + crush * 0.38) * baseScale, Math.max(0.42, 1 - crush * 0.54) * baseScale, (1 + crush * 0.38) * baseScale],
          1.0,
          env * 0.78,
          0xef4444
        );
      }
    };

    // =========================================================================
    // 1. 双车错 (Double Chariot):
    // 两“车”棋子飞起绕屏幕中心旋转（含自身多圈翻转+远近缩放），同时“将（帅）”飞至屏幕中心战场地面，
    // 原棋盘渐隐切为古战场 -> 两“车”落于战场地面平滑变身为战车建模 -> 交错冲撞撞碎“将（帅）” -> 平滑切回终局棋面！
    // =========================================================================
    if (vfxType === 'double_chariot') {
      const cgScene = this.createCGSceneEnvironment('cg_battlefield', group);
      const rookItem0 = findAttackerItemByType('r', null);
      const rookItem1 = findAttackerItemByType('r', rookItem0);
      const startPos0 = rookItem0?.basePos ? rookItem0.basePos.clone() : new THREE.Vector3(cPos.x, 0, cPos.z);
      const startPos1 = rookItem1?.basePos ? rookItem1.basePos.clone() : new THREE.Vector3(kPos.x + 2.8, 0, kPos.z + 1.2);

      const morphAura0 = this.createSmoothMorphAura(group, 0xfbbf24);
      const morphAura1 = this.createSmoothMorphAura(group, 0xef4444);

      const chariot0 = this.createArticulated3DWarChariot(bronzeWoodMat, goldMat, darkIronMat, goldGlowMat);
      const chariot1 = this.createArticulated3DWarChariot(bronzeWoodMat, goldMat, darkIronMat, crimsonGlowMat);
      chariot0.visible = false;
      chariot1.visible = false;
      group.add(chariot0, chariot1);

      const centerGround = new THREE.Vector3(0, 0.02, 0);
      const crashExplosion = create3DCannonExplosion(centerGround, 1.38);

      const slashPlanes = [-1, 1].map((dir, idx) => {
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(6.8, 1.65),
          new THREE.MeshBasicMaterial({
            map: slashTex,
            color: idx === 0 ? 0xfef08a : 0xef4444,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
          })
        );
        plane.rotation.x = -Math.PI / 2;
        plane.rotation.z = dir * 0.56;
        plane.position.set(0, 0.45 + idx * 0.08, 0);
        group.add(plane);
        return plane;
      });

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.24, p) * (1 - smoothstep(0.76, 0.94, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        const landSpot0 = new THREE.Vector3(-4.2, 0.04, -1.65);
        const landSpot1 = new THREE.Vector3(4.2, 0.04, 1.65);
        const crossEnd0 = new THREE.Vector3(3.6, 0.04, 1.45);
        const crossEnd1 = new THREE.Vector3(-3.6, 0.04, -1.45);

        if (kingItem && kingItem.mesh) {
          kingItem.customDriven = true;
          if (p < 0.58) {
            const toCenterT = smoothstep(0.02, 0.30, p);
            const kx = THREE.MathUtils.lerp(kPos.x, 0, toCenterT);
            const kz = THREE.MathUtils.lerp(kPos.z, 0, toCenterT);
            const ky = Math.sin(toCenterT * Math.PI) * 1.65;
            const kSc = THREE.MathUtils.lerp(1.0, 1.38, toCenterT);
            this.setPiece3DPose(
              kingItem.mesh,
              kx,
              ky,
              kz,
              Math.sin(toCenterT * Math.PI) * 0.35,
              toCenterT * Math.PI * 2,
              0,
              kSc,
              1.0,
              0.15 * toCenterT
            );
          } else if (p < 0.80) {
            const hitP = (p - 0.58) / 0.22;
            applyKingHitFeedback(hitP, 'collision', 0, 1, centerGround, 1.38);
          } else {
            const backT = smoothstep(0.80, 0.96, p);
            const kx = THREE.MathUtils.lerp(0, kPos.x, backT);
            const kz = THREE.MathUtils.lerp(0, kPos.z, backT);
            const ky = Math.sin(backT * Math.PI) * 0.75;
            const kSc = THREE.MathUtils.lerp(1.38, 1.0, backT);
            this.setPiece3DPose(kingItem.mesh, kx, ky, kz, 0, (1 - backT) * Math.PI, 0, kSc, 1.0, 0);
          }
        }

        const driveRook = (rItem, sPos, lSpot, cEnd, chModel, mAura, idx) => {
          const sign = idx === 0 ? 1 : -1;
          if (p < 0.44) {
            const orbT = p / 0.44;
            const liftIn = smoothstep(0.0, 0.22, orbT);
            const settleToLand = smoothstep(0.72, 1.0, orbT);
            const angle = orbT * Math.PI * 3.2 + (idx === 0 ? 0 : Math.PI);
            const orbitRx = 3.6 + Math.sin(orbT * Math.PI * 2) * 0.65;
            const orbitRz = 2.45 + Math.cos(orbT * Math.PI * 2) * 0.45;
            const ox = Math.cos(angle) * orbitRx;
            const oz = Math.sin(angle) * orbitRz;
            const oy = 1.95 + Math.sin(angle * 2 + idx) * 0.95;

            let curX = THREE.MathUtils.lerp(sPos.x, ox, liftIn);
            let curZ = THREE.MathUtils.lerp(sPos.z, oz, liftIn);
            let curY = THREE.MathUtils.lerp(0, oy, liftIn);
            curX = THREE.MathUtils.lerp(curX, lSpot.x, settleToLand);
            curZ = THREE.MathUtils.lerp(curZ, lSpot.z, settleToLand);
            curY = THREE.MathUtils.lerp(curY, lSpot.y, settleToLand);

            const depthBoost = 1.18 + (curZ / 4.5) * 0.28;
            const morphT = smoothstep(0.76, 1.0, orbT);
            const pieceAlpha = 1 - smoothstep(0.25, 0.92, morphT);

            if (rItem?.mesh) {
              rItem.customDriven = true;
              this.setPiece3DPose(
                rItem.mesh,
                curX,
                curY,
                curZ,
                orbT * Math.PI * 6 * sign,
                orbT * Math.PI * 4,
                0,
                depthBoost * (1 + morphT * 0.35),
                pieceAlpha,
                morphT * 0.75,
                idx === 0 ? 0xfbbf24 : 0xef4444
              );
            }
            mAura.update(new THREE.Vector3(curX, curY, curZ), morphT, fade);

            if (morphT > 0.08) {
              chModel.visible = true;
              chModel.position.set(curX, curY, curZ);
              this.faceTargetHorizontally(chModel, 0, 0);
              chModel.scale.setScalar(1.08 * smoothstep(0.08, 0.95, morphT) * fade);
              chModel.userData.spinWheels(dt * 18, p * 5);
            } else {
              chModel.visible = false;
            }
          } else if (p < 0.78) {
            mAura.update(lSpot, 0, 0);
            if (rItem?.mesh) {
              rItem.customDriven = true;
              rItem.mesh.visible = false;
            }
            const chargeT = smoothstep(0.44, 0.72, p);
            chModel.visible = true;
            chModel.position.lerpVectors(lSpot, cEnd, chargeT);
            this.faceTargetHorizontally(chModel, cEnd.x, cEnd.z);
            const distCenter = chModel.position.length();
            const focusScale = 1.12 + Math.max(0, 1 - distCenter / 4.0) * 0.22;
            chModel.scale.setScalar(focusScale * fade);
            chModel.userData.spinWheels(dt * 28, p * 6);
          } else {
            const backT = smoothstep(0.78, 0.96, p);
            mAura.update(cEnd, 1 - backT, fade);
            const chScale = 1.08 * (1 - smoothstep(0.0, 0.65, backT)) * fade;
            chModel.visible = chScale > 0.02;
            chModel.scale.setScalar(Math.max(0.001, chScale));

            if (rItem?.mesh) {
              rItem.customDriven = true;
              const px = THREE.MathUtils.lerp(cEnd.x, sPos.x, backT);
              const pz = THREE.MathUtils.lerp(cEnd.z, sPos.z, backT);
              const py = Math.sin(backT * Math.PI) * 1.15;
              this.setPiece3DPose(
                rItem.mesh,
                px,
                py,
                pz,
                (1 - backT) * Math.PI * 2,
                (1 - backT) * Math.PI,
                0,
                THREE.MathUtils.lerp(1.28, 1.0, backT),
                smoothstep(0.10, 0.55, backT),
                (1 - backT) * 0.4
              );
            }
          }
        };

        driveRook(rookItem0, startPos0, landSpot0, crossEnd0, chariot0, morphAura0, 0);
        driveRook(rookItem1, startPos1, landSpot1, crossEnd1, chariot1, morphAura1, 1);

        if (p >= 0.57 && p <= 0.86) {
          const expP = (p - 0.57) / 0.29;
          crashExplosion.update.call(this, expP, fade, centerGround);
          slashPlanes.forEach((pl, i) => {
            pl.material.opacity = Math.sin(Math.min(1, expP) * Math.PI) * 0.78 * fade;
            pl.scale.setScalar(0.65 + expP * 1.55);
            pl.rotation.z += (i === 0 ? 1 : -1) * dt * 1.5;
          });
        } else {
          slashPlanes.forEach(pl => { pl.material.opacity = 0; });
        }

        if (vfxContext?.setCameraOverride) {
          if (p < 0.44) {
            vfxContext.setCameraOverride(new THREE.Vector3(0, 1.15, 0), 12.2, 0.88, Math.sin(p * Math.PI * 2) * 0.28);
          } else if (p < 0.78) {
            vfxContext.setCameraOverride(new THREE.Vector3(0, 0.45, 0), 10.4, 0.94, (p - 0.44) * 0.65);
          }
        }
      });
    }

    // =========================================================================
    // 2. 加强闷宫 (Smothered Palace):
    // 同理困毙特写运镜与九重玄铁禁城场景，“将（帅）”聚焦放大至中心，
    // 四面精雕重甲城墙（北、东、南、西）依次拔地升起合围（每升起一面“将（帅）”惊慌后退并触发震波），
    // 最后重檐玄铁封顶大盖从天而降严丝合缝盖死，随后平滑切回终局棋面！
    // =========================================================================
    if (vfxType === 'smothered_palace') {
      const cgScene = this.createCGSceneEnvironment('cg_imperial_citadel', group);
      const centerStage = new THREE.Vector3(0, 0.02, 0);

      // 四面依次升起的精雕玄铁皇城城墙（0:北 -Z, 1:东 +X, 2:南 +Z, 3:西 -X）
      const wallDefs = [
        { x: 0, z: -1.65, ry: 0, startT: 0.14, endT: 0.26, dodgeX: 0, dodgeZ: 0.42 },
        { x: 1.65, z: 0, ry: Math.PI / 2, startT: 0.26, endT: 0.38, dodgeX: -0.42, dodgeZ: 0 },
        { x: 0, z: 1.65, ry: 0, startT: 0.38, endT: 0.50, dodgeX: 0, dodgeZ: -0.42 },
        { x: -1.65, z: 0, ry: Math.PI / 2, startT: 0.50, endT: 0.62, dodgeX: 0.42, dodgeZ: 0 }
      ];

      const walls = wallDefs.map((o) => {
        const wGroup = new THREE.Group();
        const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(3.48, 0.28, 0.44), goldMat);
        basePlinth.position.y = 0.14;
        const wallBody = new THREE.Mesh(new THREE.BoxGeometry(3.32, 1.88, 0.34), darkIronMat);
        wallBody.position.y = 1.06;
        const dragonRelief = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.65, 0.38), crimsonLacquerMat);
        dragonRelief.position.y = 1.06;
        const topBeam = new THREE.Mesh(new THREE.BoxGeometry(3.52, 0.24, 0.44), goldMat);
        topBeam.position.y = 2.02;

        [-1.52, 1.52].forEach(px => {
          const cornerPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 2.22, 12), goldMat);
          cornerPillar.position.set(px, 1.11, 0);
          wGroup.add(cornerPillar);
        });
        for (let b = -2; b <= 2; b++) {
          const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.32, 0.38), crimsonLacquerMat);
          merlon.position.set(b * 0.58, 2.28, 0);
          const merlonCap = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.08, 0.42), goldMat);
          merlonCap.position.set(b * 0.58, 2.46, 0);
          wGroup.add(merlon, merlonCap);
        }

        const riseWave = new THREE.Mesh(new THREE.RingGeometry(0.4, 1.25, 24), goldGlowMat.clone());
        riseWave.rotation.x = -Math.PI / 2;
        riseWave.position.y = 0.04;
        riseWave.material.opacity = 0;

        wGroup.add(basePlinth, wallBody, dragonRelief, topBeam, riseWave);
        wGroup.position.set(o.x, -2.6, o.z);
        wGroup.rotation.y = o.ry;
        group.add(wGroup);
        return { wGroup, riseWave, ...o };
      });

      // 重檐玄铁鎏金封顶大盖
      const sealRoof = new THREE.Group();
      const roofRimFrame = new THREE.Mesh(new THREE.BoxGeometry(3.68, 0.28, 3.68), goldMat);
      roofRimFrame.position.y = -0.26;
      const roofInnerPlate = new THREE.Mesh(new THREE.BoxGeometry(3.42, 0.22, 3.42), darkIronMat);
      roofInnerPlate.position.y = -0.18;
      const pyramid = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 2.42, 0.84, 4), goldMat);
      pyramid.rotation.y = Math.PI / 4;
      pyramid.position.y = 0.28;
      const topSealBox = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.46, 0.92), crimsonLacquerMat);
      topSealBox.position.y = 0.82;
      const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.36, 1), goldGlowMat.clone());
      finial.position.y = 1.25;
      [[-1.65, -1.65], [1.65, -1.65], [-1.65, 1.65], [1.65, 1.65]].forEach(([px, pz]) => {
        const cornerLatch = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.48, 0.42), goldMat);
        cornerLatch.position.set(px, -0.32, pz);
        sealRoof.add(cornerLatch);
      });
      sealRoof.add(roofRimFrame, roofInnerPlate, pyramid, topSealBox, finial);
      sealRoof.position.set(0, 7.8, 0);
      group.add(sealRoof);

      const sealExplosion = create3DCannonExplosion(centerStage, 1.35);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.18, p) * (1 - smoothstep(0.86, 0.98, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        // 同理困毙特写运镜：环绕中心放大的“将（帅）”与依次升起的四面城墙
        if (vfxContext?.setCameraOverride) {
          vfxContext.setCameraOverride(
            new THREE.Vector3(0, 0.85, 0),
            9.2,
            0.70,
            p * 0.85
          );
        }

        const fadeOut = 1 - smoothstep(0.86, 0.98, p);
        let kingDodgeX = 0;
        let kingDodgeZ = 0;

        // 四面城墙依次拔地而起
        walls.forEach((w) => {
          const localP = Math.max(0, Math.min(1, (p - w.startT) / (w.endT - w.startT)));
          const easeRise = 1 - Math.pow(1 - localP, 3);
          w.wGroup.position.y = THREE.MathUtils.lerp(-2.6, 0.0, easeRise);
          w.wGroup.scale.setScalar(fadeOut * fade);

          if (localP > 0.05 && localP < 0.98) {
            const env = Math.sin(localP * Math.PI);
            kingDodgeX += w.dodgeX * env;
            kingDodgeZ += w.dodgeZ * env;
            w.riseWave.material.opacity = (1 - localP) * 0.85 * fadeOut;
            w.riseWave.scale.setScalar(0.8 + localP * 1.8);
            if (localP > 0.82 && localP < 0.92) {
              this.cameraShake = Math.max(this.cameraShake || 0, 0.25);
            }
          } else {
            w.riseWave.material.opacity = 0;
          }
        });

        // 0.62 -> 0.78 最后重檐玄铁封顶大盖从天而降严丝合缝盖上！
        const dropRaw = Math.min(1, Math.max(0, (p - 0.62) / 0.16));
        const dropEase = dropRaw * dropRaw;
        sealRoof.position.set(0, THREE.MathUtils.lerp(7.8, 2.38, dropEase), 0);
        sealRoof.scale.setScalar(fadeOut * fade);

        if (kingItem && kingItem.mesh) {
          kingItem.customDriven = true;
          const enlargedScale = 1.92;
          if (p < 0.14) {
            const toCenter = smoothstep(0.0, 0.14, p);
            this.setPiece3DPose(
              kingItem.mesh,
              THREE.MathUtils.lerp(kPos.x, 0, toCenter),
              Math.sin(toCenter * Math.PI) * 0.75,
              THREE.MathUtils.lerp(kPos.z, 0, toCenter),
              0,
              toCenter * Math.PI,
              0,
              THREE.MathUtils.lerp(1.0, enlargedScale, toCenter),
              1.0,
              0.25
            );
          } else if (p < 0.76) {
            this.setPiece3DPose(
              kingItem.mesh,
              kingDodgeX,
              0.02,
              kingDodgeZ,
              -kingDodgeZ * 0.35,
              p * Math.PI * 2,
              kingDodgeX * 0.35,
              enlargedScale,
              1.0,
              0.45,
              0xfbbf24
            );
          } else if (p < 0.86) {
            const hitP = (p - 0.76) / 0.10;
            sealExplosion.update.call(this, hitP, fade, centerStage);
            applyKingHitFeedback(hitP, 'heavy_smash', 0, 0, centerStage, enlargedScale);
          } else {
            const backT = smoothstep(0.86, 0.98, p);
            this.setPiece3DPose(
              kingItem.mesh,
              THREE.MathUtils.lerp(0, kPos.x, backT),
              0,
              THREE.MathUtils.lerp(0, kPos.z, backT),
              0,
              0,
              0,
              THREE.MathUtils.lerp(enlargedScale, 1.0, backT),
              1.0,
              0
            );
          }
        }
      });
    }

    // =========================================================================
    // 3. 对面笑 (Royal Gaze):
    // 聚焦己方“将（帅）”向上缓慢飞起且场景逐渐转为古战场场景 -> 平滑变身成披甲将军建模 ->
    // 挥舞着武器冲至对面（冲的途中场景平滑切回终局棋面） -> 将军建模在棋盘上斩杀对面的“帅（将）”！
    // =========================================================================
    if (vfxType === 'royal_gaze') {
      const cgScene = this.createCGSceneEnvironment('cg_battlefield', group);
      const royalItem = findFriendlyGeneralItem();
      const royalStart = royalItem?.basePos ? royalItem.basePos.clone() : new THREE.Vector3(rPos.x, 0, rPos.z);
      const dirSign = kPos.z <= royalStart.z ? -1 : 1;

      const morphAura = this.createSmoothMorphAura(group, 0xfbbf24);
      const general3D = this.createArticulated3DGeneral(goldMat, crimsonLacquerMat, darkIronMat, goldGlowMat);
      general3D.visible = false;
      this.faceTargetHorizontally(general3D, kPos.x, kPos.z);
      group.add(general3D);

      const swordWaveGroup = new THREE.Group();
      const waveOuterArc = new THREE.Mesh(
        new THREE.TorusGeometry(1.15, 0.11, 14, 36, Math.PI * 1.15),
        goldGlowMat.clone()
      );
      const waveInnerArc = new THREE.Mesh(
        new THREE.TorusGeometry(0.88, 0.07, 12, 32, Math.PI * 1.05),
        crimsonGlowMat.clone()
      );
      swordWaveGroup.add(waveOuterArc, waveInnerArc);
      swordWaveGroup.visible = false;
      this.faceTargetHorizontally(swordWaveGroup, kPos.x, kPos.z);
      group.add(swordWaveGroup);

      const slashImpactExplosion = create3DCannonExplosion(kPos, 1.25);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.26, p) * (1 - smoothstep(0.50, 0.72, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        const strikeStopZ = kPos.z - dirSign * 1.55;

        if (p < 0.38) {
          const riseT = smoothstep(0.0, 0.30, p);
          const morphT = smoothstep(0.20, 0.38, p);
          const curY = THREE.MathUtils.lerp(0, 1.95, riseT) * (1 - morphT * 0.85);
          const pScale = 1.0 + riseT * 0.65;

          if (royalItem?.mesh) {
            royalItem.customDriven = true;
            this.setPiece3DPose(
              royalItem.mesh,
              royalStart.x,
              curY,
              royalStart.z,
              Math.sin(riseT * Math.PI) * 0.22,
              riseT * Math.PI * 2,
              0,
              pScale,
              1 - smoothstep(0.15, 0.88, morphT),
              riseT * 0.75,
              0xfbbf24
            );
          }
          morphAura.update(new THREE.Vector3(royalStart.x, curY, royalStart.z), morphT, fade);

          if (morphT > 0.08) {
            general3D.visible = true;
            general3D.position.set(royalStart.x, curY * 0.35 + 0.05, royalStart.z);
            this.faceTargetHorizontally(general3D, kPos.x, kPos.z);
            general3D.scale.setScalar(1.25 * smoothstep(0.08, 0.95, morphT) * fade);
            general3D.userData.swordArmPivot.rotation.x = THREE.MathUtils.lerp(-0.4, -1.25, morphT);
          } else {
            general3D.visible = false;
          }
          swordWaveGroup.visible = false;

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(royalStart.x, 0.95 + curY * 0.5, royalStart.z),
              8.6,
              0.92,
              (p - 0.15) * 0.45
            );
          }
        } else {
          const chargeT = smoothstep(0.38, 0.72, p);
          const curZ = THREE.MathUtils.lerp(royalStart.z, strikeStopZ, chargeT);
          const curX = THREE.MathUtils.lerp(royalStart.x, kPos.x, chargeT);
          const strideBounce = p < 0.72 ? Math.abs(Math.sin(p * 38)) * 0.24 : 0;

          if (royalItem?.mesh) {
            royalItem.customDriven = true;
            const backAlpha = smoothstep(0.52, 0.74, p);
            this.setPiece3DPose(royalItem.mesh, royalStart.x, 0, royalStart.z, 0, 0, 0, 1.0, backAlpha, 0);
          }
          morphAura.update(royalStart, 0, 0);

          const genFadeOut = 1 - smoothstep(0.88, 0.98, p);
          general3D.visible = genFadeOut > 0.02;
          general3D.position.set(curX, 0.05 + strideBounce, curZ);
          this.faceTargetHorizontally(general3D, kPos.x, kPos.z);
          general3D.scale.setScalar(1.26 * genFadeOut * fade);
          general3D.userData.cape.rotation.x = 0.34 + Math.sin(p * 26) * 0.18;

          if (p < 0.70) {
            general3D.userData.swordArmPivot.rotation.x = -0.95 + Math.sin(p * 34) * 0.68;
            general3D.userData.swordArmPivot.rotation.z = Math.cos(p * 17) * 0.32;
            swordWaveGroup.visible = true;
            swordWaveGroup.position.set(curX, 1.05, curZ + dirSign * 0.95);
            swordWaveGroup.rotation.z = Math.sin(p * 34) * 0.45;
            swordWaveGroup.scale.setScalar(0.85 * fade);
          } else {
            const cleaveP = Math.min(1, (p - 0.70) / 0.10);
            general3D.userData.swordArmPivot.rotation.z = 0;
            general3D.userData.swordArmPivot.rotation.x = THREE.MathUtils.lerp(-1.58, 1.02, Math.pow(cleaveP, 2.2));
            swordWaveGroup.visible = p < 0.88;
            swordWaveGroup.position.set(kPos.x, 0.85, kPos.z);
            swordWaveGroup.rotation.z = 0;
            swordWaveGroup.scale.setScalar((1.0 + cleaveP * 0.85) * genFadeOut * fade);
          }

          if (p >= 0.75) {
            const hitP = (p - 0.75) / 0.24;
            slashImpactExplosion.update.call(this, hitP, fade, kPos);
            applyKingHitFeedback(hitP, 'slash', 0, dirSign);
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(curX, 0.78, THREE.MathUtils.lerp(curZ, kPos.z, 0.38)),
              9.6,
              0.90,
              0.24
            );
          }
        }
      });
    }

    // =========================================================================
    // 4. 重炮杀 (Double Cannon):
    // 两“炮”棋子飞跃放大至屏幕一左一右（同时平滑切换至战场） -> 在空中向中间合并成重炮建模并演示装弹动画 ->
    // 重炮建模下落（同时渐渐平滑切回终局棋面） -> 落入合适位置向“将（帅）”开炮轰击！
    // =========================================================================
    if (vfxType === 'double_cannon') {
      const cgScene = this.createCGSceneEnvironment('cg_battlefield', group);
      const cannonItem0 = findAttackerItemByType('c', null);
      const cannonItem1 = findAttackerItemByType('c', cannonItem0);
      const cStart0 = cannonItem0?.basePos ? cannonItem0.basePos.clone() : new THREE.Vector3(kPos.x - 1.5, 0, kPos.z + 3.5);
      const cStart1 = cannonItem1?.basePos ? cannonItem1.basePos.clone() : new THREE.Vector3(kPos.x + 1.5, 0, kPos.z + 4.5);

      const dirSign = kPos.z < 0 ? -1 : 1;
      const fireGroundPos = new THREE.Vector3(kPos.x, 0.06, kPos.z - dirSign * 3.8);
      const airMergePos = new THREE.Vector3(kPos.x, 3.25, fireGroundPos.z * 0.55);

      const morphAura = this.createSmoothMorphAura(group, 0xf97316);

      const heavyCannon = new THREE.Group();
      heavyCannon.position.copy(airMergePos);
      heavyCannon.visible = false;
      this.faceTargetHorizontally(heavyCannon, kPos.x, kPos.z);
      group.add(heavyCannon);

      const carriage = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.38, 1.65), crimsonLacquerMat);
      carriage.position.y = 0.34;
      const armorTrim = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.16, 1.72), goldMat);
      armorTrim.position.y = 0.52;
      heavyCannon.add(carriage, armorTrim);

      [[-0.82, -0.52], [0.82, -0.52], [-0.82, 0.52], [0.82, 0.52]].forEach(([wx, wz]) => {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.16, 20), darkIronMat);
        w.rotation.z = Math.PI / 2;
        w.position.set(wx, 0.36, wz);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.04, 10, 24), goldMat);
        rim.rotation.y = Math.PI / 2;
        rim.position.set(wx + (wx > 0 ? 0.08 : -0.08), 0.36, wz);
        heavyCannon.add(w, rim);
      });

      const barrelPivot = new THREE.Group();
      barrelPivot.position.set(0, 0.78, 0);
      [-0.32, 0.32].forEach(bx => {
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.30, 2.05, 24), darkIronMat);
        tube.rotation.x = Math.PI / 2;
        tube.position.set(bx, 0, 0.15);
        const muzzleRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 12, 24), goldGlowMat.clone());
        muzzleRing.position.set(bx, 0, 1.18);
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.04, 10, 22), goldMat);
        band.position.set(bx, 0, 0.25);
        barrelPivot.add(tube, muzzleRing, band);
      });

      const breechGate = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.42, 0.18), goldMat);
      breechGate.position.set(0, 0, -0.92);
      const loadingShells = [-0.32, 0.32].map(bx => {
        const s = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), crimsonGlowMat.clone());
        s.position.set(bx, 0.35, -1.65);
        barrelPivot.add(s);
        return { s, bx };
      });
      const ramrod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.15, 12), goldMat);
      ramrod.rotation.x = Math.PI / 2;
      ramrod.position.set(0, 0, -1.95);
      barrelPivot.add(breechGate, ramrod);
      barrelPivot.rotation.x = -0.22;
      heavyCannon.add(barrelPivot);

      const firedShells = [-0.32, 0.32].map(bx => {
        const fs = new THREE.Mesh(new THREE.SphereGeometry(0.30, 16, 16), goldGlowMat.clone());
        fs.visible = false;
        group.add(fs);
        return { fs, bx };
      });
      const twinExplosion = create3DCannonExplosion(kPos, 1.38);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.24, p) * (1 - smoothstep(0.54, 0.72, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        const leftHover = new THREE.Vector3(kPos.x - 2.65, airMergePos.y, airMergePos.z);
        const rightHover = new THREE.Vector3(kPos.x + 2.65, airMergePos.y, airMergePos.z);

        if (p < 0.38) {
          const leapT = smoothstep(0.0, 0.22, p);
          const mergeT = smoothstep(0.22, 0.38, p);

          [
            { item: cannonItem0, sPos: cStart0, sidePos: leftHover, sign: -1 },
            { item: cannonItem1, sPos: cStart1, sidePos: rightHover, sign: 1 }
          ].forEach(({ item, sPos, sidePos, sign }) => {
            if (!item?.mesh) return;
            item.customDriven = true;
            let pos = new THREE.Vector3().lerpVectors(sPos, sidePos, leapT);
            pos.y += Math.sin(leapT * Math.PI) * 1.15;
            pos.lerp(airMergePos, mergeT);
            const sc = THREE.MathUtils.lerp(1.0, 1.78, leapT) * (1 - mergeT * 0.25);
            const alpha = 1 - smoothstep(0.55, 0.98, mergeT);
            this.setPiece3DPose(
              item.mesh,
              pos.x,
              pos.y,
              pos.z,
              leapT * Math.PI * 2 * sign,
              p * Math.PI * 5,
              0,
              sc,
              alpha,
              (leapT + mergeT) * 0.55,
              0xf97316
            );
          });

          morphAura.update(airMergePos, mergeT, fade);
          if (mergeT > 0.25) {
            heavyCannon.visible = true;
            heavyCannon.position.copy(airMergePos);
            heavyCannon.scale.setScalar(1.15 * smoothstep(0.25, 1.0, mergeT) * fade);
          } else {
            heavyCannon.visible = false;
          }
          firedShells.forEach(({ fs }) => { fs.visible = false; });

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(kPos.x, airMergePos.y * 0.75, airMergePos.z),
              11.6,
              0.92,
              0
            );
          }
        } else if (p < 0.56) {
          morphAura.update(airMergePos, 0, 0);
          [cannonItem0, cannonItem1].forEach(it => {
            if (it?.mesh) { it.customDriven = true; it.mesh.visible = false; }
          });

          const reloadP = (p - 0.38) / 0.18;
          heavyCannon.visible = true;
          heavyCannon.position.copy(airMergePos);
          heavyCannon.scale.setScalar((1.15 + Math.sin(reloadP * Math.PI) * 0.12) * fade);

          const gateOpen = Math.sin(reloadP * Math.PI);
          breechGate.position.y = gateOpen * 0.42;

          loadingShells.forEach(({ s, bx }) => {
            s.visible = reloadP < 0.86;
            const insertT = smoothstep(0.10, 0.76, reloadP);
            s.position.set(
              bx,
              THREE.MathUtils.lerp(0.45, 0.0, smoothstep(0.0, 0.35, reloadP)),
              THREE.MathUtils.lerp(-1.65, -0.15, insertT)
            );
          });
          ramrod.visible = reloadP > 0.25 && reloadP < 0.92;
          const pushT = Math.sin(smoothstep(0.25, 0.90, reloadP) * Math.PI);
          ramrod.position.z = THREE.MathUtils.lerp(-1.95, -0.85, pushT);

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(airMergePos.x, airMergePos.y, airMergePos.z),
              8.8,
              0.98,
              0.36
            );
          }
        } else {
          loadingShells.forEach(({ s }) => { s.visible = false; });
          ramrod.visible = false;
          breechGate.position.y = 0;

          const dropT = smoothstep(0.56, 0.72, p);
          const curCannonPos = new THREE.Vector3().lerpVectors(airMergePos, fireGroundPos, dropT * dropT);
          const cannonFadeOut = 1 - smoothstep(0.90, 0.99, p);
          heavyCannon.visible = cannonFadeOut > 0.02;
          heavyCannon.position.copy(curCannonPos);
          heavyCannon.scale.setScalar(1.15 * cannonFadeOut * fade);

          const pieceReturnAlpha = smoothstep(0.58, 0.78, p);
          [
            { item: cannonItem0, sPos: cStart0 },
            { item: cannonItem1, sPos: cStart1 }
          ].forEach(({ item, sPos }) => {
            if (item?.mesh) {
              item.customDriven = true;
              this.setPiece3DPose(item.mesh, sPos.x, 0, sPos.z, 0, 0, 0, 1.0, pieceReturnAlpha, 0);
            }
          });

          if (p >= 0.72) {
            const fireP = (p - 0.72) / 0.28;
            const shellT = Math.min(1, fireP / 0.44);
            const recoil = fireP < 0.28 ? Math.sin((fireP / 0.28) * Math.PI) * 0.42 : 0;
            heavyCannon.position.z = fireGroundPos.z - dirSign * recoil;
            barrelPivot.rotation.x = -0.22 - recoil * 0.45;

            firedShells.forEach(({ fs, bx }) => {
              fs.visible = shellT < 0.96;
              fs.position.set(
                THREE.MathUtils.lerp(fireGroundPos.x + bx, kPos.x + bx * 0.2, shellT),
                0.85 + Math.sin(shellT * Math.PI) * 2.15,
                THREE.MathUtils.lerp(fireGroundPos.z, kPos.z, shellT)
              );
              fs.scale.setScalar(1.22 * fade);
            });

            if (fireP >= 0.40) {
              const hitP = (fireP - 0.40) / 0.60;
              twinExplosion.update.call(this, hitP, fade, kPos);
              applyKingHitFeedback(hitP, 'cannon_blast', 0, dirSign);
            }
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(kPos.x, 0.65, THREE.MathUtils.lerp(curCannonPos.z, kPos.z, 0.55)),
              10.5,
              0.92,
              0.15
            );
          }
        }
      });
    }

    // =========================================================================
    // 5. 马后炮 (Horse Cannon):
    // 聚焦同时切至古战场 -> “马”飞跃变身建模马，同时“炮”飞跃变身建模炮位于建模马前面并缓慢下落 ->
    // 随后建模马从建模炮背后跳过建模炮踏向地面（踏的空中平滑切回终局棋面） ->
    // 建模炮在建模马落地过后落入马身后，然后开炮轰击“将（帅）”！
    // =========================================================================
    if (vfxType === 'horse_cannon') {
      const cgScene = this.createCGSceneEnvironment('cg_battlefield', group);
      const horseItem = findAttackerItemByType('n', null);
      const cannonItem = findAttackerItemByType('c', horseItem);
      const horseOrigin = horseItem?.basePos ? horseItem.basePos.clone() : new THREE.Vector3(cPos.x, 0, cPos.z);
      const dirSign = kPos.z <= horseOrigin.z ? -1 : 1;
      const cannonOrigin = cannonItem?.basePos
        ? cannonItem.basePos.clone()
        : new THREE.Vector3(kPos.x, 0, horseOrigin.z - dirSign * 2.3);

      const horseAirStart = new THREE.Vector3(kPos.x, 2.35, horseOrigin.z - dirSign * 3.0);
      const cannonAirFront = new THREE.Vector3(kPos.x, 2.65, horseOrigin.z - dirSign * 1.45);
      const horseLandPos = new THREE.Vector3(horseOrigin.x, 0.05, horseOrigin.z);
      const cannonLandPos = new THREE.Vector3(cannonOrigin.x, 0.08, cannonOrigin.z);

      const horseMorphAura = this.createSmoothMorphAura(group, 0xfbbf24);
      const cannonMorphAura = this.createSmoothMorphAura(group, 0xef4444);

      const warHorse = this.createArticulated3DWarHorse(goldMat, crimsonLacquerMat, goldGlowMat);
      warHorse.visible = false;
      this.faceTargetHorizontally(warHorse, kPos.x, kPos.z);
      group.add(warHorse);

      const rearCannon = this.createArticulated3DCannon(bronzeWoodMat, goldMat, darkIronMat, crimsonGlowMat);
      rearCannon.visible = false;
      this.faceTargetHorizontally(rearCannon, kPos.x, kPos.z);
      group.add(rearCannon);

      const shell = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), crimsonGlowMat.clone());
      shell.visible = false;
      group.add(shell);

      const cannonExplosion = create3DCannonExplosion(kPos, 1.28);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.24, p) * (1 - smoothstep(0.44, 0.62, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        if (p < 0.28) {
          const leapT = smoothstep(0.0, 0.22, p);
          const morphT = smoothstep(0.14, 0.28, p);

          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            const hp = new THREE.Vector3().lerpVectors(horseOrigin, horseAirStart, leapT);
            this.setPiece3DPose(
              horseItem.mesh,
              hp.x,
              hp.y,
              hp.z,
              leapT * Math.PI * 2,
              leapT * Math.PI * 3,
              0,
              1.0 + leapT * 0.45,
              1 - smoothstep(0.2, 0.9, morphT),
              leapT * 0.65
            );
          }
          if (cannonItem?.mesh) {
            cannonItem.customDriven = true;
            const cp = new THREE.Vector3().lerpVectors(cannonOrigin, cannonAirFront, leapT);
            this.setPiece3DPose(
              cannonItem.mesh,
              cp.x,
              cp.y,
              cp.z,
              -leapT * Math.PI * 2,
              leapT * Math.PI * 3,
              0,
              1.0 + leapT * 0.45,
              1 - smoothstep(0.2, 0.9, morphT),
              leapT * 0.65,
              0xef4444
            );
          }

          horseMorphAura.update(horseAirStart, morphT, fade);
          cannonMorphAura.update(cannonAirFront, morphT, fade);

          const mScale = smoothstep(0.12, 0.95, morphT) * fade;
          warHorse.visible = mScale > 0.02;
          warHorse.position.copy(horseAirStart);
          warHorse.scale.setScalar(mScale);
          warHorse.userData.animateGallop(p * 4, 0.55);

          rearCannon.visible = mScale > 0.02;
          rearCannon.position.copy(cannonAirFront);
          rearCannon.scale.setScalar(mScale);

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(kPos.x, 1.85, (horseAirStart.z + cannonAirFront.z) * 0.5),
              10.2,
              0.94,
              0.42
            );
          }
        } else {
          horseMorphAura.update(horseAirStart, 0, 0);
          cannonMorphAura.update(cannonAirFront, 0, 0);

          const cannonDropT = smoothstep(0.28, 0.68, p);
          const curCannonPos = new THREE.Vector3().lerpVectors(cannonAirFront, cannonLandPos, cannonDropT);
          curCannonPos.y = THREE.MathUtils.lerp(cannonAirFront.y, cannonLandPos.y, cannonDropT * cannonDropT);

          const horseVaultT = smoothstep(0.30, 0.60, p);
          const curHorsePos = new THREE.Vector3().lerpVectors(horseAirStart, horseLandPos, horseVaultT);
          curHorsePos.y = THREE.MathUtils.lerp(horseAirStart.y, horseLandPos.y, horseVaultT) + Math.sin(horseVaultT * Math.PI) * 2.45;

          const modelFadeOut = 1 - smoothstep(0.90, 0.99, p);
          warHorse.visible = modelFadeOut > 0.02;
          warHorse.position.copy(curHorsePos);
          this.faceTargetHorizontally(warHorse, kPos.x, kPos.z);
          const rearUp = p < 0.60 ? Math.sin(horseVaultT * Math.PI) * 0.85 : Math.max(0, Math.sin((p - 0.60) * 14) * 0.35 * (1 - p));
          warHorse.userData.animateGallop(p * 4.5, rearUp);
          warHorse.scale.setScalar(modelFadeOut * fade);

          rearCannon.visible = modelFadeOut > 0.02;
          rearCannon.position.copy(curCannonPos);
          this.faceTargetHorizontally(rearCannon, kPos.x, kPos.z);
          rearCannon.scale.setScalar(modelFadeOut * fade);

          const pieceAlpha = smoothstep(0.58, 0.82, p);
          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            this.setPiece3DPose(horseItem.mesh, horseOrigin.x, 0, horseOrigin.z, 0, 0, 0, 1.0, pieceAlpha, 0);
          }
          if (cannonItem?.mesh) {
            cannonItem.customDriven = true;
            this.setPiece3DPose(cannonItem.mesh, cannonOrigin.x, 0, cannonOrigin.z, 0, 0, 0, 1.0, pieceAlpha, 0);
          }

          if (p >= 0.69) {
            const fireP = (p - 0.69) / 0.31;
            const shellT = Math.min(1, fireP / 0.42);
            const recoil = fireP < 0.28 ? Math.sin((fireP / 0.28) * Math.PI) * 0.38 : 0;
            rearCannon.position.z = cannonLandPos.z - dirSign * recoil;
            rearCannon.userData.barrelPivot.rotation.x = -0.28 - recoil * 0.52;

            shell.visible = shellT < 0.96;
            shell.position.set(
              THREE.MathUtils.lerp(cannonLandPos.x, kPos.x, shellT),
              0.72 + Math.sin(shellT * Math.PI) * 2.65,
              THREE.MathUtils.lerp(cannonLandPos.z, kPos.z, shellT)
            );
            shell.scale.setScalar(1.24 * fade);

            if (fireP >= 0.38) {
              const hitP = (fireP - 0.38) / 0.62;
              cannonExplosion.update.call(this, hitP, fade, kPos);
              applyKingHitFeedback(hitP, 'cannon_blast', 0, dirSign);
            }
          } else {
            shell.visible = false;
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(kPos.x, 0.85, THREE.MathUtils.lerp(curHorsePos.z, kPos.z, 0.45)),
              10.4,
              0.90,
              0.28
            );
          }
        }
      });
    }

    // =========================================================================
    // 6. 加强铁门栓 (Iron Bolt):
    // 同理困毙运镜场景，“将（帅）”周围先出现四根盘龙巨柱，柱子上有能合起来的双扇铁门；
    // 镜头围绕“将（帅）”旋转一周，在四个面各停止一下，停止时镜头前的门也轰然关上并落栓；
    // 最后拉开镜头出现许多粗大铁链把被门关起来的房间层层围起来，收缩铁链挤爆整个房间，“将（帅）”也一起挤爆了！
    // =========================================================================
    if (vfxType === 'iron_bolt') {
      const cgScene = this.createCGSceneEnvironment('cg_imperial_citadel', group);
      const centerStage = new THREE.Vector3(0, 0.02, 0);
      const halfSpan = 1.52;

      const roomGroup = new THREE.Group();
      group.add(roomGroup);

      // 1. 四角盘龙玄铁巨柱与顶部四方门楣横梁
      const cornerCoords = [
        [-halfSpan, -halfSpan],
        [halfSpan, -halfSpan],
        [halfSpan, halfSpan],
        [-halfSpan, halfSpan]
      ];
      cornerCoords.forEach(([cx, cz]) => {
        const pGrp = new THREE.Group();
        pGrp.position.set(cx, 0, cz);
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.24, 0.56), goldMat);
        plinth.position.y = 0.12;
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 2.55, 16), darkIronMat);
        shaft.position.y = 1.32;
        const goldCap = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 0.52), goldMat);
        goldCap.position.y = 2.65;
        const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.20, 1), crimsonLacquerMat);
        finial.position.y = 2.92;
        pGrp.add(plinth, shaft, goldCap, finial);
        roomGroup.add(pGrp);
      });

      // 2. 四个面的双扇合页朱漆铁门（0:南面 +Z, 1:东面 +X, 2:北面 -Z, 3:西面 -X）
      const faceDefs = [
        { x: 0, z: halfSpan, ry: 0, camTheta: 0, tStart: 0.14, tEnd: 0.265 },
        { x: halfSpan, z: 0, ry: Math.PI / 2, camTheta: Math.PI * 0.5, tStart: 0.265, tEnd: 0.39 },
        { x: 0, z: -halfSpan, ry: Math.PI, camTheta: Math.PI, tStart: 0.39, tEnd: 0.515 },
        { x: -halfSpan, z: 0, ry: -Math.PI / 2, camTheta: Math.PI * 1.5, tStart: 0.515, tEnd: 0.64 }
      ];

      const doorFaces = faceDefs.map((fd) => {
        const faceGrp = new THREE.Group();
        faceGrp.position.set(fd.x, 0, fd.z);
        faceGrp.rotation.y = fd.ry;

        const lintelBeam = new THREE.Mesh(new THREE.BoxGeometry(3.04, 0.24, 0.32), goldMat);
        lintelBeam.position.y = 2.52;
        faceGrp.add(lintelBeam);

        const doorW = 1.32;
        const doorH = 2.38;
        // 左扇门合页位于 x = -doorW，右扇门合页位于 x = +doorW
        const leftHinge = new THREE.Group();
        leftHinge.position.set(-doorW, 1.22, 0);
        const rightHinge = new THREE.Group();
        rightHinge.position.set(doorW, 1.22, 0);

        [leftHinge, rightHinge].forEach((hinge, idx) => {
          const sign = idx === 0 ? 1 : -1; // 门板相对于合页向内延伸 sign * doorW * 0.5
          const panel = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.16), crimsonLacquerMat);
          panel.position.x = sign * (doorW * 0.5);
          const border = new THREE.Mesh(new THREE.BoxGeometry(doorW + 0.04, doorH + 0.04, 0.12), goldMat);
          border.position.x = sign * (doorW * 0.5);
          const knocker = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.032, 10, 20), goldMat);
          knocker.position.set(sign * (doorW * 0.78), 0.05, 0.11);
          hinge.add(border, panel, knocker);

          for (let r = -1; r <= 1; r++) {
            for (let c = 1; c <= 2; c++) {
              const stud = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), goldMat);
              stud.position.set(sign * (c * 0.42), r * 0.68, 0.10);
              hinge.add(stud);
            }
          }
        });

        // 横向落锁玄铁门栓
        const boltBar = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.26, 0.24), darkIronMat);
        boltBar.position.set(0, 1.25, 0.18);
        const boltGoldTrim = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.10, 0.26), goldMat);
        boltGoldTrim.position.set(0, 1.25, 0.18);
        const boltGroup = new THREE.Group();
        boltGroup.add(boltBar, boltGoldTrim);
        boltGroup.visible = false;

        faceGrp.add(leftHinge, rightHinge, boltGroup);
        roomGroup.add(faceGrp);
        return { faceGrp, leftHinge, rightHinge, boltGroup, ...fd };
      });

      // 3. 拉开镜头后围困房间的多重粗大玄铁锁链群（6层水平捆绑铁链圈 + 8条交叉斜拉铁链）
      const chainsWrapper = new THREE.Group();
      chainsWrapper.visible = false;
      group.add(chainsWrapper);

      [0.45, 0.85, 1.25, 1.65, 2.05, 2.40].forEach((cy, idx) => {
        const cLoop = new THREE.Group();
        cLoop.position.y = cy;
        for (let k = 0; k < 28; k++) {
          const a = (k / 28) * Math.PI * 2;
          const r = 2.15;
          const link = new THREE.Mesh(
            new THREE.TorusGeometry(0.18, 0.055, 8, 16),
            (k + idx) % 2 === 0 ? darkIronMat : goldMat
          );
          link.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
          link.rotation.y = -a;
          if (k % 2 === 0) link.rotation.x = Math.PI / 2;
          cLoop.add(link);
        }
        chainsWrapper.add(cLoop);
      });

      const diagPairs = [
        [new THREE.Vector3(-2.1, 0.2, 2.1), new THREE.Vector3(2.1, 2.6, 2.1)],
        [new THREE.Vector3(2.1, 0.2, 2.1), new THREE.Vector3(-2.1, 2.6, 2.1)],
        [new THREE.Vector3(2.1, 0.2, -2.1), new THREE.Vector3(-2.1, 2.6, -2.1)],
        [new THREE.Vector3(-2.1, 0.2, -2.1), new THREE.Vector3(2.1, 2.6, -2.1)],
        [new THREE.Vector3(2.1, 0.2, -2.1), new THREE.Vector3(2.1, 2.6, 2.1)],
        [new THREE.Vector3(2.1, 0.2, 2.1), new THREE.Vector3(2.1, 2.6, -2.1)],
        [new THREE.Vector3(-2.1, 0.2, -2.1), new THREE.Vector3(-2.1, 2.6, 2.1)],
        [new THREE.Vector3(-2.1, 0.2, 2.1), new THREE.Vector3(-2.1, 2.6, -2.1)]
      ];
      diagPairs.forEach(([pA, pB]) => {
        create3DChainBetween(pA, pB, 14, chainsWrapper);
      });

      // 4. 房间与“将（帅）”被铁链一起挤爆时的 28 块飞散门板/石柱/锁链破片
      const burstDebris = Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2;
        const deb = new THREE.Mesh(
          i % 3 === 0
            ? new THREE.BoxGeometry(0.48, 0.72, 0.14)
            : (i % 3 === 1 ? new THREE.TorusGeometry(0.18, 0.05, 8, 14) : new THREE.DodecahedronGeometry(0.24, 0)),
          i % 3 === 0 ? crimsonLacquerMat : (i % 2 === 0 ? goldMat : darkIronMat)
        );
        deb.visible = false;
        group.add(deb);
        return { deb, a, spd: 3.4 + (i % 5) * 1.1, lift: 2.2 + (i % 4) * 0.85 };
      });

      const crushExplosion = create3DCannonExplosion(new THREE.Vector3(0, 1.1, 0), 1.85);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.16, p) * (1 - smoothstep(0.88, 0.98, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        const emergeT = smoothstep(0.0, 0.14, p);

        if (p < 0.64) {
          // 阶段1 & 2：四柱与敞开铁门升起 -> 镜头围绕“将（帅）”旋转一周，在四个面各停止一下，停止时镜头前的门轰然关上并上栓！
          roomGroup.visible = true;
          roomGroup.position.y = THREE.MathUtils.lerp(-2.5, 0, emergeT);
          roomGroup.scale.set(1, 1, 1);
          chainsWrapper.visible = false;
          burstDebris.forEach(({ deb }) => { deb.visible = false; });

          let camTheta = 0;
          if (p >= 0.14) {
            for (let idx = 0; idx < 4; idx++) {
              const df = doorFaces[idx];
              if (p >= df.tStart && p <= df.tEnd) {
                const segP = (p - df.tStart) / (df.tEnd - df.tStart);
                // 前 38% 快速转镜至当前门面，后 62% 镜头稳稳停住（停止时当前门合拢落栓）
                const moveCamT = smoothstep(0.0, 0.38, segP);
                const prevTheta = idx === 0 ? 0 : doorFaces[idx - 1].camTheta;
                camTheta = THREE.MathUtils.lerp(prevTheta, df.camTheta, moveCamT);
                break;
              }
            }
          }

          doorFaces.forEach((df) => {
            const segP = Math.max(0, Math.min(1, (p - df.tStart) / (df.tEnd - df.tStart)));
            // 在镜头停住区间 (segP: 0.35 -> 0.85)，左右两扇门合拢关闭
            const closeDoorT = smoothstep(0.32, 0.82, segP);
            const openAngle = Math.PI * 0.56 * (1 - closeDoorT * closeDoorT);
            df.leftHinge.rotation.y = -openAngle;
            df.rightHinge.rotation.y = openAngle;

            // 门关严瞬间 (segP > 0.76)，横栓滑入锁定并触发震屏
            if (segP >= 0.74) {
              const boltLockT = smoothstep(0.74, 0.96, segP);
              df.boltGroup.visible = true;
              df.boltGroup.position.x = THREE.MathUtils.lerp(-1.45, 0, boltLockT);
              if (segP > 0.80 && segP < 0.88) {
                this.cameraShake = Math.max(this.cameraShake || 0, 0.24);
              }
            } else {
              df.boltGroup.visible = false;
            }
          });

          if (kingItem && kingItem.mesh) {
            kingItem.customDriven = true;
            const kSc = THREE.MathUtils.lerp(1.0, 1.85, emergeT);
            const kx = THREE.MathUtils.lerp(kPos.x, 0, emergeT);
            const kz = THREE.MathUtils.lerp(kPos.z, 0, emergeT);
            this.setPiece3DPose(kingItem.mesh, kx, 0.02, kz, 0, camTheta, 0, kSc, 1.0, 0.35);
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, 1.15, 0),
              8.2,
              0.94,
              camTheta
            );
          }
        } else if (p < 0.79) {
          // 阶段3：拉开镜头，许多粗大铁链把被门关起来的房间层层围起来，并猛烈向内收缩挤压整个房间！
          const pullOutT = smoothstep(0.64, 0.72, p);
          const squeezeT = smoothstep(0.70, 0.79, p);

          doorFaces.forEach((df) => {
            df.leftHinge.rotation.y = 0;
            df.rightHinge.rotation.y = 0;
            df.boltGroup.visible = true;
            df.boltGroup.position.x = 0;
          });

          const squeezeXZ = THREE.MathUtils.lerp(1.0, 0.50, squeezeT * squeezeT);
          const squeezeY = THREE.MathUtils.lerp(1.0, 0.82, squeezeT * squeezeT);
          const jitter = Math.sin(p * 120) * 0.08 * squeezeT;

          roomGroup.visible = true;
          roomGroup.position.set(jitter, 0, -jitter);
          roomGroup.scale.set(squeezeXZ, squeezeY, squeezeXZ);

          chainsWrapper.visible = true;
          const chainAppear = smoothstep(0.64, 0.69, p);
          const chainSqueeze = THREE.MathUtils.lerp(1.22, 0.48, squeezeT * squeezeT);
          chainsWrapper.scale.set(chainSqueeze * chainAppear, squeezeY * chainAppear, chainSqueeze * chainAppear);
          chainsWrapper.rotation.y = squeezeT * 0.45;

          if (kingItem && kingItem.mesh) {
            kingItem.customDriven = true;
            this.setPiece3DPose(
              kingItem.mesh,
              jitter,
              0.02,
              -jitter,
              0,
              0,
              0,
              [1.85 * squeezeXZ, 1.85 * squeezeY, 1.85 * squeezeXZ],
              1.0,
              squeezeT * 0.95,
              0xef4444
            );
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, 1.25, 0),
              THREE.MathUtils.lerp(8.2, 13.8, pullOutT),
              THREE.MathUtils.lerp(0.94, 0.74, pullOutT),
              Math.PI * 1.5 + pullOutT * 0.45
            );
          }
        } else {
          // 阶段4：收缩铁链将整个房间连同里面的“将（帅）”一起轰然挤爆！随后平滑切回终局棋面
          const burstP = Math.min(1, (p - 0.79) / 0.16);
          roomGroup.visible = false;
          chainsWrapper.visible = false;

          crushExplosion.update.call(this, burstP, fade, new THREE.Vector3(0, 1.0, 0));

          burstDebris.forEach(({ deb, a, spd, lift }) => {
            if (burstP > 0 && burstP < 0.95) {
              deb.visible = true;
              const r = 0.5 + burstP * spd;
              deb.position.set(
                Math.cos(a) * r,
                Math.max(0.1, 1.0 + Math.sin(burstP * Math.PI) * lift - burstP * 1.2),
                Math.sin(a) * r
              );
              deb.rotation.x += 0.22;
              deb.rotation.y += 0.18;
              deb.scale.setScalar(Math.max(0.05, (1 - burstP * 0.75) * fade));
            } else {
              deb.visible = false;
            }
          });

          if (kingItem && kingItem.mesh) {
            kingItem.customDriven = true;
            if (p < 0.89) {
              // “将（帅）”与房间一同被挤爆震飞
              applyKingHitFeedback((p - 0.79) / 0.10, 'cannon_blast', 0, 1, centerStage, 1.45);
            } else {
              const backT = smoothstep(0.89, 0.99, p);
              this.setPiece3DPose(
                kingItem.mesh,
                THREE.MathUtils.lerp(0, kPos.x, backT),
                0,
                THREE.MathUtils.lerp(0, kPos.z, backT),
                0,
                0,
                0,
                THREE.MathUtils.lerp(1.45, 1.0, backT),
                smoothstep(0.0, 0.6, backT),
                0
              );
            }
          }

          if (vfxContext?.setCameraOverride && p < 0.90) {
            vfxContext.setCameraOverride(new THREE.Vector3(0, 1.05, 0), 13.8, 0.74, Math.PI * 1.95);
          }
        }
      });
    }

    // =========================================================================
    // 7. 侧面虎 (Side Tiger):
    // 两枚棋子飞到空中合适位置，同时场景平滑切到绿色草地和蓝天白云 ->
    // 建模老虎把这两枚棋子当做踏板依次跳跃（踩到踏板棋子时有下沉震动+波纹反馈） ->
    // 猛虎扑出去（扑出去时场景平滑切回终局棋面） -> 最后扑向“将（帅）”！
    // =========================================================================
    if (vfxType === 'side_tiger') {
      const cgScene = this.createCGSceneEnvironment('cg_grassland', group);
      const stepItem1 = findAttackerItemByType('n', null) || attackerItems[0];
      const stepItem2 = findAttackerItemByType('r', stepItem1) || attackerItems[1] || stepItem1;
      const orig1 = stepItem1?.basePos ? stepItem1.basePos.clone() : new THREE.Vector3(kPos.x + 2.4, 0, kPos.z + 2.2);
      const orig2 = stepItem2?.basePos ? stepItem2.basePos.clone() : new THREE.Vector3(kPos.x + 1.8, 0, kPos.z + 1.0);

      const sideSign = orig1.x >= kPos.x ? 1 : -1;
      const dirSign = kPos.z < 0 ? -1 : 1;

      const tigerStartGround = new THREE.Vector3(kPos.x + sideSign * 4.5, 0.05, kPos.z - dirSign * 3.8);
      const padPos1 = new THREE.Vector3(kPos.x + sideSign * 3.1, 1.35, kPos.z - dirSign * 2.55);
      const padPos2 = new THREE.Vector3(kPos.x + sideSign * 1.75, 2.38, kPos.z - dirSign * 1.25);
      const pounceTarget = new THREE.Vector3(kPos.x + sideSign * 0.25, 0.08, kPos.z - dirSign * 0.25);

      const stepRipples = [padPos1, padPos2].map((pos) => {
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.82, 32), goldGlowMat.clone());
        ring.rotation.x = -Math.PI / 2;
        ring.position.copy(pos);
        ring.visible = false;
        group.add(ring);
        return ring;
      });

      const tiger3D = this.createArticulated3DTiger(
        goldMat,
        darkIronMat,
        crimsonLacquerMat,
        ivoryFangMat,
        goldGlowMat
      );
      tiger3D.scale.setScalar(1.20);
      tiger3D.position.copy(tigerStartGround);
      this.faceTargetHorizontally(tiger3D, padPos1.x, padPos1.z);
      group.add(tiger3D);

      const claws = [];
      for (let i = -2; i <= 2; i++) {
        const arc = new THREE.Mesh(
          new THREE.TorusGeometry(1.68, 0.065, 10, 32, Math.PI * 0.84),
          i % 2 === 0 ? goldGlowMat.clone() : crimsonGlowMat.clone()
        );
        arc.position.set(kPos.x + i * 0.26, 0.88, kPos.z);
        arc.rotation.y = sideSign * 0.65;
        arc.rotation.x = 0.45;
        arc.visible = false;
        group.add(arc);
        claws.push({ arc, i });
      }

      const tigerImpact = create3DCannonExplosion(kPos, 1.18);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.22, p) * (1 - smoothstep(0.56, 0.74, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        const flyInT = smoothstep(0.0, 0.22, p);
        const flyBackT = smoothstep(0.64, 0.88, p);

        const updateSteppingPiece = (item, origPos, padPos, stepTime, rippleMesh, idx) => {
          if (!item?.mesh) return;
          item.customDriven = true;
          let cur = new THREE.Vector3().lerpVectors(origPos, padPos, flyInT);
          cur.lerp(origPos, flyBackT);

          const distStep = p - stepTime;
          let dipY = 0;
          let tiltX = 0;
          let squash = 1.0;
          let glow = 0.15 * (1 - flyBackT);
          if (distStep >= -0.02 && distStep <= 0.14) {
            const st = (distStep + 0.02) / 0.16;
            const env = Math.sin(st * Math.PI);
            dipY = -env * 0.44;
            tiltX = Math.sin(st * Math.PI * 3) * 0.28 * (1 - st);
            squash = 1 + env * 0.24;
            glow = env * 0.95;
            rippleMesh.visible = true;
            rippleMesh.position.set(cur.x, cur.y + dipY + 0.15, cur.z);
            rippleMesh.scale.setScalar((0.7 + st * 2.2) * fade);
            rippleMesh.material.opacity = (1 - st) * 0.85 * fade;
          } else {
            rippleMesh.visible = false;
          }

          const baseSc = THREE.MathUtils.lerp(1.0, 1.48, flyInT * (1 - flyBackT));
          this.setPiece3DPose(
            item.mesh,
            cur.x,
            cur.y + dipY,
            cur.z,
            tiltX,
            flyInT * (1 - flyBackT) * Math.PI * (idx === 0 ? 2 : -2),
            -tiltX * 0.6,
            [baseSc * squash, baseSc / squash, baseSc * squash],
            1.0,
            glow,
            0xfbbf24
          );
        };

        updateSteppingPiece(stepItem1, orig1, padPos1, 0.36, stepRipples[0], 0);
        if (stepItem2 !== stepItem1) {
          updateSteppingPiece(stepItem2, orig2, padPos2, 0.52, stepRipples[1], 1);
        }

        let tigerPos = new THREE.Vector3();
        let lookPt = kPos;
        let jumpArc = 0;
        if (p < 0.20) {
          const prep = p / 0.20;
          tigerPos.copy(tigerStartGround);
          lookPt = padPos1;
          tiger3D.userData.animatePounce(p * 4, prep * 0.3, 0);
        } else if (p < 0.36) {
          const t1 = (p - 0.20) / 0.16;
          tigerPos.lerpVectors(tigerStartGround, new THREE.Vector3(padPos1.x, padPos1.y + 0.22, padPos1.z), t1);
          jumpArc = Math.sin(t1 * Math.PI) * 1.15;
          tigerPos.y += jumpArc;
          lookPt = padPos1;
          tiger3D.userData.animatePounce(p * 5, t1, 0);
        } else if (p < 0.52) {
          const t2 = (p - 0.36) / 0.16;
          tigerPos.lerpVectors(
            new THREE.Vector3(padPos1.x, padPos1.y + 0.15, padPos1.z),
            new THREE.Vector3(padPos2.x, padPos2.y + 0.22, padPos2.z),
            t2
          );
          jumpArc = Math.sin(t2 * Math.PI) * 1.25;
          tigerPos.y += jumpArc;
          lookPt = padPos2;
          tiger3D.userData.animatePounce(p * 5, t2, 0);
        } else {
          const t3 = Math.min(1, (p - 0.52) / 0.24);
          const ease3 = 1 - Math.pow(1 - t3, 2.4);
          tigerPos.lerpVectors(
            new THREE.Vector3(padPos2.x, padPos2.y + 0.15, padPos2.z),
            pounceTarget,
            ease3
          );
          jumpArc = Math.sin(t3 * Math.PI) * 1.85;
          tigerPos.y += jumpArc;
          lookPt = kPos;
          const swipe = Math.max(0, (p - 0.70) / 0.28);
          tiger3D.userData.animatePounce(p * 5.5, t3, swipe);
        }

        const tigerFade = 1 - smoothstep(0.90, 0.99, p);
        tiger3D.visible = tigerFade > 0.02;
        tiger3D.position.copy(tigerPos);
        this.faceTargetHorizontally(tiger3D, lookPt.x, lookPt.z);
        tiger3D.scale.setScalar(1.22 * tigerFade * fade);

        if (p >= 0.73) {
          const hitP = (p - 0.73) / 0.26;
          tigerImpact.update.call(this, hitP, fade, kPos);
          applyKingHitFeedback(hitP, 'collision', -sideSign, dirSign);
          claws.forEach(({ arc, i }) => {
            arc.visible = hitP < 0.85;
            arc.rotation.z = -1.25 + hitP * 2.6 + i * 0.08;
            arc.scale.setScalar((0.6 + hitP * 0.85) * fade);
            arc.material.opacity = Math.sin(Math.min(1, hitP) * Math.PI) * 0.72 * fade;
          });
        } else {
          claws.forEach(({ arc }) => { arc.visible = false; });
        }

        if (vfxContext?.setCameraOverride) {
          vfxContext.setCameraOverride(
            new THREE.Vector3(
              THREE.MathUtils.lerp(tigerPos.x, kPos.x, 0.38),
              Math.max(0.65, tigerPos.y * 0.65),
              THREE.MathUtils.lerp(tigerPos.z, kPos.z, 0.38)
            ),
            10.8,
            0.90,
            sideSign * 0.28
          );
        }
      });
    }

    // =========================================================================
    // 8. 八角马 (Octagon Horse):
    // “马”飞跃变身建模马，另一枚棋子变身为拿武器的建模将军（同时平滑切至绿色草地和蓝天白云） ->
    // 建模将军骑在建模马上在草原奔跑一圈后（平滑切回终局棋面），建模马落回原点 ->
    // 同时建模将军从马身上跃起掷出武器在空中优美刀轮旋转，在马落回原点的同时武器扎入“将（帅）”，且建模将军跳回终局棋面原点！
    // =========================================================================
    if (vfxType === 'octagon_horse') {
      const cgScene = this.createCGSceneEnvironment('cg_grassland', group);
      const horseItem = findAttackerItemByType('n', null) || attackerItems[0];
      const genItem = findAttackerItemByType('r', horseItem) || attackerItems.find(it => it !== horseItem) || horseItem;
      const horseOrigin = horseItem?.basePos ? horseItem.basePos.clone() : new THREE.Vector3(cPos.x, 0, cPos.z);
      const genOrigin = genItem?.basePos ? genItem.basePos.clone() : new THREE.Vector3(kPos.x - 2.2, 0, kPos.z + 2.4);

      const horseMorphAura = this.createSmoothMorphAura(group, 0xfbbf24);
      const genMorphAura = this.createSmoothMorphAura(group, 0x38bdf8);

      const octagonHorse = this.createArticulated3DWarHorse(goldMat, darkIronMat, goldGlowMat);
      octagonHorse.visible = false;
      group.add(octagonHorse);

      const riderGeneral = this.createArticulated3DGeneral(goldMat, crimsonLacquerMat, darkIronMat, goldGlowMat);
      riderGeneral.visible = false;
      group.add(riderGeneral);

      // 将军投掷的精雕盘龙方天画戟（外层载体对准轨迹平面 + 内层 spinPivot 纯单轴优美刀轮旋转 + 3D 刀光剑轮环）
      const thrownSpear = new THREE.Group();
      const spearSpinPivot = new THREE.Group();
      thrownSpear.add(spearSpinPivot);

      const sShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.068, 2.65, 14), goldMat);
      const sTassel = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.46, 12), crimsonLacquerMat);
      sTassel.position.y = 0.88;
      const sTip = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.88, 6), goldGlowMat.clone());
      sTip.position.y = 1.54;
      [-1, 1].forEach(s => {
        const halberdCrescent = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.048, 10, 24, Math.PI * 0.9), goldMat);
        halberdCrescent.rotation.z = s === 1 ? -Math.PI * 0.45 : Math.PI * 0.55;
        halberdCrescent.position.set(s * 0.15, 0.95, 0);
        spearSpinPivot.add(halberdCrescent);
      });
      const spearWheelHalo = new THREE.Mesh(new THREE.RingGeometry(1.12, 1.62, 36), goldGlowMat.clone());
      spearSpinPivot.add(sShaft, sTassel, sTip, spearWheelHalo);
      thrownSpear.visible = false;
      group.add(thrownSpear);

      const pierceExplosion = create3DCannonExplosion(kPos, 1.28);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.22, p) * (1 - smoothstep(0.58, 0.76, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        const mountMeetPos = new THREE.Vector3(0, 0.05, 2.6);

        if (p < 0.24) {
          const leapT = smoothstep(0.0, 0.18, p);
          const morphT = smoothstep(0.10, 0.24, p);
          const hp = new THREE.Vector3().lerpVectors(horseOrigin, mountMeetPos, leapT);
          hp.y += Math.sin(leapT * Math.PI) * 1.45;
          const gp = new THREE.Vector3().lerpVectors(genOrigin, new THREE.Vector3(mountMeetPos.x, mountMeetPos.y + 0.95, mountMeetPos.z), leapT);
          gp.y += Math.sin(leapT * Math.PI) * 1.65;

          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            this.setPiece3DPose(
              horseItem.mesh,
              hp.x,
              hp.y,
              hp.z,
              leapT * Math.PI * 2,
              leapT * Math.PI * 3,
              0,
              1 + leapT * 0.4,
              1 - smoothstep(0.2, 0.9, morphT),
              leapT * 0.65
            );
          }
          if (genItem?.mesh && genItem !== horseItem) {
            genItem.customDriven = true;
            this.setPiece3DPose(
              genItem.mesh,
              gp.x,
              gp.y,
              gp.z,
              -leapT * Math.PI * 2,
              leapT * Math.PI * 3,
              0,
              1 + leapT * 0.4,
              1 - smoothstep(0.2, 0.9, morphT),
              leapT * 0.65,
              0x38bdf8
            );
          }

          horseMorphAura.update(hp, morphT, fade);
          genMorphAura.update(gp, morphT, fade);

          const mScale = smoothstep(0.15, 0.95, morphT) * fade;
          octagonHorse.visible = mScale > 0.02;
          octagonHorse.position.copy(hp);
          octagonHorse.scale.setScalar(1.12 * mScale);
          octagonHorse.userData.animateGallop(p * 4, 0.35);

          riderGeneral.visible = mScale > 0.02;
          riderGeneral.position.set(hp.x, hp.y + 0.86, hp.z - 0.05);
          riderGeneral.scale.setScalar(0.76 * mScale);
          thrownSpear.visible = false;

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(new THREE.Vector3(hp.x, 1.0, hp.z), 10.2, 0.88, 0);
          }
        } else if (p < 0.62) {
          horseMorphAura.update(mountMeetPos, 0, 0);
          genMorphAura.update(mountMeetPos, 0, 0);
          if (horseItem?.mesh) { horseItem.customDriven = true; horseItem.mesh.visible = false; }
          if (genItem?.mesh) { genItem.customDriven = true; genItem.mesh.visible = false; }

          const lapT = (p - 0.24) / 0.38;
          const lapAngle = lapT * Math.PI * 2 + Math.PI * 0.5;
          const rx = 3.85;
          const rz = 2.95;
          const gx = Math.cos(lapAngle) * rx;
          const gz = Math.sin(lapAngle) * rz;
          const nextAngle = lapAngle + 0.12;
          const tx = Math.cos(nextAngle) * rx;
          const tz = Math.sin(nextAngle) * rz;
          const gallopBounce = Math.abs(Math.sin(lapT * Math.PI * 10)) * 0.26;

          octagonHorse.visible = true;
          octagonHorse.position.set(gx, 0.05 + gallopBounce, gz);
          this.faceTargetHorizontally(octagonHorse, tx, tz);
          octagonHorse.userData.animateGallop(p * 5.2, 0.22);
          octagonHorse.scale.setScalar(1.15 * fade);

          riderGeneral.visible = true;
          riderGeneral.position.set(gx, 0.92 + gallopBounce, gz);
          this.faceTargetHorizontally(riderGeneral, tx, tz);
          riderGeneral.scale.setScalar(0.78 * fade);
          riderGeneral.userData.swordArmPivot.rotation.x = -0.85 + Math.sin(p * 24) * 0.35;
          thrownSpear.visible = false;

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(gx * 0.45, 0.85, gz * 0.45),
              11.4,
              0.86,
              lapT * 0.65
            );
          }
        } else {
          const actionT = Math.min(1, (p - 0.62) / 0.22);
          const settleT = smoothstep(0.84, 0.98, p);
          const launchStart = new THREE.Vector3(0, 0.05, 2.95);

          const hPos = new THREE.Vector3().lerpVectors(launchStart, horseOrigin, actionT);
          hPos.y = 0.05 + Math.sin(actionT * Math.PI) * 1.95;
          octagonHorse.visible = settleT < 0.92;
          octagonHorse.position.copy(hPos);
          this.faceTargetHorizontally(octagonHorse, kPos.x, kPos.z);
          octagonHorse.userData.animateGallop(p * 4.5, Math.sin(actionT * Math.PI) * 0.68);
          octagonHorse.scale.setScalar(1.12 * (1 - settleT) * fade);

          const gPos = new THREE.Vector3().lerpVectors(
            new THREE.Vector3(launchStart.x, 0.95, launchStart.z),
            genOrigin,
            actionT
          );
          gPos.y += Math.sin(actionT * Math.PI) * 2.85;
          riderGeneral.visible = settleT < 0.92;
          riderGeneral.position.copy(gPos);
          this.faceTargetHorizontally(riderGeneral, kPos.x, kPos.z);
          riderGeneral.scale.setScalar(0.78 * (1 - settleT) * fade);
          riderGeneral.userData.swordArmPivot.rotation.x = THREE.MathUtils.lerp(-1.55, 0.95, Math.min(1, actionT * 1.8));
          if (riderGeneral.userData.swordGroup) {
            riderGeneral.userData.swordGroup.visible = false;
          }

          // 优美武侠风单轴刀轮回旋：外层对准轨迹平面，内层 spinPivot 围绕 Z 轴纯平面高速飞轮旋转 + 刀轮光环！
          thrownSpear.visible = settleT < 0.96;
          const spearStart = new THREE.Vector3(launchStart.x, 2.65, launchStart.z);
          const spearEnd = new THREE.Vector3(kPos.x, 0.95, kPos.z);
          thrownSpear.position.lerpVectors(spearStart, spearEnd, actionT);
          thrownSpear.position.y += Math.sin(actionT * Math.PI) * 1.65;

          const angleToKing = Math.atan2(kPos.x - spearStart.x, kPos.z - spearStart.z);
          if (actionT < 0.96) {
            thrownSpear.rotation.set(0.18, angleToKing + Math.PI * 0.5, 0);
            spearSpinPivot.rotation.set(0, 0, -actionT * Math.PI * 8); // 4整圈纯平面刀轮高速飞旋
            spearWheelHalo.visible = true;
            spearWheelHalo.material.opacity = Math.sin(actionT * Math.PI) * 0.68 * fade;
          } else {
            // 扎入“将（帅）”瞬间定格为锋刃斜插姿态
            thrownSpear.rotation.set(0, angleToKing, 0);
            spearSpinPivot.rotation.set(Math.PI * 0.88, 0, 0);
            spearWheelHalo.visible = false;
          }
          thrownSpear.scale.setScalar(1.18 * (1 - settleT * 0.5) * fade);

          const pieceShow = smoothstep(0.76, 0.92, p);
          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            this.setPiece3DPose(horseItem.mesh, horseOrigin.x, 0, horseOrigin.z, 0, 0, 0, 1.0, pieceShow, 0);
          }
          if (genItem?.mesh && genItem !== horseItem) {
            genItem.customDriven = true;
            this.setPiece3DPose(genItem.mesh, genOrigin.x, 0, genOrigin.z, 0, 0, 0, 1.0, pieceShow, 0);
          }

          if (p >= 0.82) {
            const hitP = (p - 0.82) / 0.18;
            pierceExplosion.update.call(this, hitP, fade, kPos);
            applyKingHitFeedback(hitP, 'heavy_smash', 0, 0);
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(kPos.x * 0.5, 0.75, kPos.z * 0.5),
              10.8,
              0.88,
              0.15
            );
          }
        }
      });
    }

    // =========================================================================
    // 9. 钓鱼马 (Fishing Horse):
    // 聚焦“马”至屏幕中心并挂上鱼钩鱼线（聚焦的同时场景平滑切换至俯视海面·没有月亮） ->
    // 聚焦后“马”沉入水中消失（鱼钩鱼线随之一起下沉，鱼线露出一部分在海面上，沉入海面下的建模全部被遮挡看不见） ->
    // 随后收回鱼钩鱼线时拉出建模马，建模马身上带着对面的“将（帅）”棋子 ->
    // 随后建模马和“将（帅）”落回终局棋盘原位置！
    // =========================================================================
    if (vfxType === 'fishing_horse') {
      const cgScene = this.createCGSceneEnvironment('cg_ocean_day', group);
      const horseItem = findAttackerItemByType('n', null) || attackerItems[0];
      const horseOrigin = horseItem?.basePos ? horseItem.basePos.clone() : new THREE.Vector3(cPos.x, 0, cPos.z);

      const hookRig = new THREE.Group();
      group.add(hookRig);

      const swivelRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.038, 10, 20), goldMat);
      swivelRing.position.y = 0.52;
      const dragonChuck = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 8), crimsonLacquerMat);
      dragonChuck.rotation.x = Math.PI;
      dragonChuck.position.y = 0.32;
      const hookPts = [
        new THREE.Vector3(0, 0.26, 0),
        new THREE.Vector3(0, -0.15, 0),
        new THREE.Vector3(0.12, -0.48, 0),
        new THREE.Vector3(0.42, -0.54, 0),
        new THREE.Vector3(0.62, -0.26, 0),
        new THREE.Vector3(0.58, 0.08, 0)
      ];
      const hookTube = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(hookPts), 32, 0.068, 12, false),
        goldMat
      );
      const hookBarb = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.24, 8), crimsonLacquerMat);
      hookBarb.position.set(0.48, 0.06, 0);
      hookBarb.rotation.z = 2.38;
      hookRig.add(swivelRing, dragonChuck, hookTube, hookBarb);

      const upperFishingLine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.026, 1.0, 10),
        goldGlowMat.clone()
      );
      group.add(upperFishingLine);

      const waterEntryRing = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.68, 36), cyanGlowMat.clone());
      waterEntryRing.rotation.x = -Math.PI / 2;
      waterEntryRing.position.set(0, 0.035, 0);
      group.add(waterEntryRing);

      const splashDrops = Array.from({ length: 18 }, (_, i) => {
        const ang = (i / 18) * Math.PI * 2;
        const drop = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), i % 2 === 0 ? jadeIceMat : goldGlowMat.clone());
        drop.visible = false;
        group.add(drop);
        return { drop, ang, spd: 1.5 + (i % 4) * 0.45, lift: 1.4 + (i % 3) * 0.5 };
      });

      const emergedWarHorse = this.createArticulated3DWarHorse(jadeIceMat, goldMat, goldGlowMat);
      emergedWarHorse.visible = false;
      group.add(emergedWarHorse);

      const landExplosion = create3DCannonExplosion(kPos, 1.12);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.24, p) * (1 - smoothstep(0.76, 0.94, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        const rodTopY = 10.2;

        if (p < 0.28) {
          const focusT = smoothstep(0.0, 0.22, p);
          const hx = THREE.MathUtils.lerp(horseOrigin.x, 0, focusT);
          const hz = THREE.MathUtils.lerp(horseOrigin.z, 0, focusT);
          const hy = THREE.MathUtils.lerp(0, 1.45, focusT) + Math.sin(p * 18) * 0.08;
          const hScale = THREE.MathUtils.lerp(1.0, 1.58, focusT);

          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            this.setPiece3DPose(
              horseItem.mesh,
              hx,
              hy,
              hz,
              Math.sin(focusT * Math.PI) * 0.22,
              focusT * Math.PI * 2,
              0,
              hScale,
              1.0,
              focusT * 0.55,
              0x38bdf8
            );
          }
          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            this.setPiece3DPose(kingItem.mesh, kPos.x, 0, kPos.z, 0, 0, 0, 1.0, 1 - cgWeight, 0);
          }

          hookRig.visible = true;
          hookRig.position.set(hx, hy + 0.55, hz);
          hookRig.rotation.y = p * 4;
          hookRig.scale.setScalar(fade);

          const lineBottomY = Math.max(0.02, hy + 0.95);
          const lineLen = Math.max(0.1, rodTopY - lineBottomY);
          upperFishingLine.visible = true;
          upperFishingLine.scale.set(1, lineLen, 1);
          upperFishingLine.position.set(hx, lineBottomY + lineLen * 0.5, hz);

          waterEntryRing.scale.setScalar((0.8 + focusT * 0.6) * fade);
          waterEntryRing.material.opacity = focusT * 0.55 * fade;
          emergedWarHorse.visible = false;
          splashDrops.forEach(({ drop }) => { drop.visible = false; });

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(hx * 0.5, 0.65, hz * 0.5),
              11.2,
              THREE.MathUtils.lerp(0.82, 0.44, focusT),
              0
            );
          }
        } else if (p < 0.54) {
          const sinkT = smoothstep(0.28, 0.42, p);
          const hy = THREE.MathUtils.lerp(1.45, -2.2, sinkT);

          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            if (hy > 0.02) {
              const aboveRatio = Math.min(1, hy / 0.55);
              this.setPiece3DPose(
                horseItem.mesh,
                0,
                hy,
                0,
                sinkT * 0.45,
                p * Math.PI * 3,
                0,
                1.58 * (0.75 + 0.25 * aboveRatio),
                aboveRatio,
                0.35,
                0x38bdf8
              );
            } else {
              horseItem.mesh.visible = false;
            }
          }
          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            kingItem.mesh.visible = false;
          }

          const hookY = hy + 0.55;
          if (hookY > 0.12) {
            hookRig.visible = true;
            hookRig.position.set(0, hookY, 0);
          } else {
            hookRig.visible = false;
          }

          const lineTwitchX = p > 0.42 ? Math.sin(p * 85) * 0.12 : 0;
          const lineTwitchZ = p > 0.42 ? Math.cos(p * 78) * 0.12 : 0;
          const visibleTopY = 4.8;
          upperFishingLine.visible = true;
          upperFishingLine.scale.set(1, visibleTopY, 1);
          upperFishingLine.position.set(lineTwitchX, visibleTopY * 0.5, lineTwitchZ);

          const ripplePulse = 1.0 + ((p - 0.28) / 0.26) * 2.8;
          waterEntryRing.scale.setScalar(ripplePulse * fade);
          waterEntryRing.material.opacity = (0.75 - ((p - 0.28) / 0.26) * 0.35) * fade;

          const splashP = Math.min(1, (p - 0.31) / 0.18);
          splashDrops.forEach(({ drop, ang, spd, lift }) => {
            if (splashP > 0 && splashP < 1) {
              drop.visible = true;
              const r = 0.3 + splashP * spd;
              drop.position.set(Math.cos(ang) * r, Math.sin(splashP * Math.PI) * lift, Math.sin(ang) * r);
              drop.scale.setScalar((1 - splashP * 0.6) * fade);
            } else {
              drop.visible = false;
            }
          });
          emergedWarHorse.visible = false;

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(new THREE.Vector3(0, 0.2, 0), 10.6, 0.38, (p - 0.28) * 0.4);
          }
        } else if (p < 0.78) {
          const pullT = smoothstep(0.54, 0.70, p);
          const emergeY = THREE.MathUtils.lerp(-1.2, 2.35, pullT);

          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            horseItem.mesh.visible = false;
          }

          if (emergeY > 0.0) {
            emergedWarHorse.visible = true;
            emergedWarHorse.position.set(0, emergeY, 0);
            this.faceTargetHorizontally(emergedWarHorse, kPos.x, kPos.z);
            emergedWarHorse.userData.animateGallop(p * 4.8, Math.sin(pullT * Math.PI) * 0.82);
            emergedWarHorse.scale.setScalar(1.18 * Math.min(1, emergeY / 0.6 + 0.3) * fade);
          } else {
            emergedWarHorse.visible = false;
          }

          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            if (emergeY > 0.02) {
              this.setPiece3DPose(
                kingItem.mesh,
                0,
                emergeY + 0.36,
                -0.38,
                Math.sin(p * 42) * 0.35,
                p * Math.PI * 3,
                Math.cos(p * 38) * 0.35,
                1.35,
                1.0,
                0.72,
                0xef4444
              );
            } else {
              kingItem.mesh.visible = false;
            }
          }

          const hookCurrentY = Math.max(0.05, emergeY + 1.25);
          hookRig.visible = emergeY > -0.2;
          hookRig.position.set(0, hookCurrentY, 0);
          hookRig.rotation.y = p * 5;

          const lineLen = Math.max(0.2, rodTopY - hookCurrentY);
          upperFishingLine.visible = true;
          upperFishingLine.scale.set(1, lineLen, 1);
          upperFishingLine.position.set(0, hookCurrentY + lineLen * 0.5, 0);

          const burstP = Math.min(1, (p - 0.55) / 0.20);
          splashDrops.forEach(({ drop, ang, spd, lift }) => {
            if (burstP > 0 && burstP < 1) {
              drop.visible = true;
              const r = 0.4 + burstP * spd * 1.45;
              drop.position.set(Math.cos(ang) * r, Math.sin(burstP * Math.PI) * lift * 1.55, Math.sin(ang) * r);
              drop.scale.setScalar((1.2 - burstP * 0.6) * fade);
            } else {
              drop.visible = false;
            }
          });
          waterEntryRing.scale.setScalar((1.0 + burstP * 3.4) * fade);
          waterEntryRing.material.opacity = (1 - burstP * 0.7) * 0.78 * fade;

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, Math.max(0.5, emergeY * 0.7), 0),
              10.8,
              THREE.MathUtils.lerp(0.38, 0.78, pullT),
              0.25
            );
          }
        } else {
          const landT = smoothstep(0.78, 0.94, p);
          hookRig.visible = false;
          upperFishingLine.visible = false;
          waterEntryRing.material.opacity = 0;
          splashDrops.forEach(({ drop }) => { drop.visible = false; });

          const hCur = new THREE.Vector3().lerpVectors(new THREE.Vector3(0, 2.35, 0), horseOrigin, landT);
          hCur.y += Math.sin(landT * Math.PI) * 0.85;
          const morphBack = smoothstep(0.55, 0.95, landT);

          emergedWarHorse.visible = morphBack < 0.95;
          emergedWarHorse.position.copy(hCur);
          this.faceTargetHorizontally(emergedWarHorse, kPos.x, kPos.z);
          emergedWarHorse.userData.animateGallop(p * 4, 0.25);
          emergedWarHorse.scale.setScalar(1.15 * (1 - morphBack) * fade);

          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            this.setPiece3DPose(
              horseItem.mesh,
              hCur.x,
              hCur.y,
              hCur.z,
              0,
              (1 - landT) * Math.PI * 2,
              0,
              THREE.MathUtils.lerp(1.3, 1.0, landT),
              smoothstep(0.35, 0.85, landT),
              (1 - landT) * 0.4
            );
          }

          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            const kCur = new THREE.Vector3().lerpVectors(new THREE.Vector3(0, 2.71, -0.38), kPos, landT);
            kCur.y += Math.sin(landT * Math.PI) * 0.95;
            if (landT < 0.92) {
              this.setPiece3DPose(
                kingItem.mesh,
                kCur.x,
                kCur.y,
                kCur.z,
                (1 - landT) * Math.PI * 3,
                (1 - landT) * Math.PI * 2,
                0,
                THREE.MathUtils.lerp(1.35, 1.0, landT),
                1.0,
                0.45
              );
            } else {
              const hitP = (p - 0.90) / 0.10;
              landExplosion.update.call(this, hitP, fade, kPos);
              applyKingHitFeedback(hitP, 'heavy_smash', 0, 0);
            }
          }
        }
      });
    }

    // =========================================================================
    // 10. 列马车 (Standing Horse Chariot):
    // “马”从屏幕下方升空变身建模马站在场景远端的山上，其背景有一个红色的太阳 ->
    // 同时“车”在场景太阳的位置缓缓浮现在建模马后面（同时苍山残阳场景切换，场景的太阳和浮现的“车”一样大，要比建模马大一些） ->
    // 在“车”浮现完成后，“车”变身成为建模车，建模车绕过马冲向“将（帅）”，建模马随后也直冲过去！
    // =========================================================================
    if (vfxType === 'standing_horse_chariot') {
      const cgScene = this.createCGSceneEnvironment('cg_sunset_mountain', group);
      const horseItem = findAttackerItemByType('n', null) || attackerItems[0];
      const rookItem = findAttackerItemByType('r', horseItem) || attackerItems.find(it => it !== horseItem) || horseItem;
      const horseOrigin = horseItem?.basePos ? horseItem.basePos.clone() : new THREE.Vector3(cPos.x, 0, cPos.z);
      const rookOrigin = rookItem?.basePos ? rookItem.basePos.clone() : new THREE.Vector3(rPos.x, 0, rPos.z);

      const mountainPeakPos = new THREE.Vector3(0, 2.32, -5.8);
      const sunCenterPos = new THREE.Vector3(0, 4.15, -8.5);
      const targetKingStagePos = new THREE.Vector3(0, 0.04, 3.2);

      const horseMorphAura = this.createSmoothMorphAura(group, 0xfbbf24);
      const rookMorphAura = this.createSmoothMorphAura(group, 0xef4444);

      const horse3D = this.createArticulated3DWarHorse(crimsonLacquerMat, goldMat, goldGlowMat);
      horse3D.visible = false;
      this.faceTargetHorizontally(horse3D, targetKingStagePos.x, targetKingStagePos.z);
      group.add(horse3D);

      const chariot3D = this.createArticulated3DWarChariot(bronzeWoodMat, goldMat, darkIronMat, crimsonGlowMat);
      chariot3D.visible = false;
      this.faceTargetHorizontally(chariot3D, targetKingStagePos.x, targetKingStagePos.z);
      group.add(chariot3D);

      const chariotBypassCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 3.35, -7.8),
        new THREE.Vector3(1.85, 2.30, -5.6),
        new THREE.Vector3(1.25, 1.15, -2.2),
        new THREE.Vector3(0.35, 0.05, 2.45)
      ]);

      const horseDirectCurve = new THREE.CatmullRomCurve3([
        mountainPeakPos.clone(),
        new THREE.Vector3(0, 1.45, -2.8),
        new THREE.Vector3(-0.35, 0.05, 2.35)
      ]);

      const strikeExplosion = create3DCannonExplosion(targetKingStagePos, 1.32);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.24, p) * (1 - smoothstep(0.78, 0.95, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        if (kingItem?.mesh) {
          kingItem.customDriven = true;
          const kToStage = smoothstep(0.0, 0.22, p);
          const kToBoard = smoothstep(0.78, 0.95, p);
          const curK = new THREE.Vector3().lerpVectors(kPos, targetKingStagePos, kToStage * (1 - kToBoard));
          if (p >= 0.72 && p < 0.88) {
            applyKingHitFeedback((p - 0.72) / 0.16, 'collision', 0, 1, curK, 1.32);
          } else {
            this.setPiece3DPose(
              kingItem.mesh,
              curK.x,
              curK.y,
              curK.z,
              0,
              0,
              0,
              THREE.MathUtils.lerp(1.0, 1.32, kToStage * (1 - kToBoard)),
              1.0,
              0
            );
          }
        }

        if (p < 0.26) {
          const riseT = smoothstep(0.0, 0.22, p);
          const morphT = smoothstep(0.14, 0.26, p);
          const screenBottomStart = new THREE.Vector3(0, -0.4, 5.2);
          const hp = new THREE.Vector3().lerpVectors(screenBottomStart, mountainPeakPos, riseT);
          hp.y += Math.sin(riseT * Math.PI) * 1.65;

          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            this.setPiece3DPose(
              horseItem.mesh,
              hp.x,
              hp.y,
              hp.z,
              riseT * Math.PI * 2,
              riseT * Math.PI * 3,
              0,
              1.15,
              1 - smoothstep(0.2, 0.9, morphT),
              riseT * 0.75
            );
          }
          if (rookItem?.mesh && rookItem !== horseItem) {
            rookItem.customDriven = true;
            rookItem.mesh.visible = false;
          }

          horseMorphAura.update(hp, morphT, fade);
          const hScale = 1.05 * smoothstep(0.15, 0.95, morphT) * fade;
          horse3D.visible = hScale > 0.02;
          horse3D.position.copy(mountainPeakPos);
          this.faceTargetHorizontally(horse3D, targetKingStagePos.x, targetKingStagePos.z);
          horse3D.userData.animateGallop(p * 3.5, 0.48);
          horse3D.scale.setScalar(hScale);
          chariot3D.visible = false;

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, 2.25, -2.5),
              12.8,
              1.08,
              0
            );
          }
        } else if (p < 0.48) {
          horseMorphAura.update(mountainPeakPos, 0, 0);
          if (horseItem?.mesh) { horseItem.customDriven = true; horseItem.mesh.visible = false; }

          horse3D.visible = true;
          horse3D.position.copy(mountainPeakPos);
          horse3D.userData.animateGallop(p * 3.2, 0.35 + Math.sin(p * 12) * 0.15);
          horse3D.scale.setScalar(1.05 * fade);

          const emergeT = smoothstep(0.26, 0.45, p);
          if (rookItem?.mesh) {
            rookItem.customDriven = true;
            this.setPiece3DPose(
              rookItem.mesh,
              sunCenterPos.x,
              sunCenterPos.y - 0.45 * (1 - emergeT),
              sunCenterPos.z + 0.25,
              Math.PI / 2,
              0,
              (1 - emergeT) * Math.PI * 0.5,
              3.75 * (0.82 + 0.18 * emergeT),
              emergeT,
              emergeT * 0.65,
              0xef4444
            );
          }
          chariot3D.visible = false;

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, 2.65, -4.2),
              12.4,
              1.10,
              0
            );
          }
        } else if (p < 0.84) {
          const morphRookT = smoothstep(0.48, 0.56, p);
          rookMorphAura.update(new THREE.Vector3(0, 3.35, -7.8), morphRookT, fade);

          if (rookItem?.mesh) {
            rookItem.customDriven = true;
            this.setPiece3DPose(
              rookItem.mesh,
              sunCenterPos.x,
              sunCenterPos.y,
              sunCenterPos.z + 0.25,
              Math.PI / 2,
              0,
              0,
              3.75 * (1 - morphRookT * 0.4),
              1 - smoothstep(0.0, 0.85, morphRookT),
              0.8,
              0xef4444
            );
          }

          const chariotRushT = smoothstep(0.52, 0.74, p);
          const chPt = chariotBypassCurve.getPoint(chariotRushT);
          const chTan = chariotBypassCurve.getTangent(Math.min(0.99, chariotRushT));
          chariot3D.visible = true;
          chariot3D.position.copy(chPt);
          this.faceTargetHorizontally(chariot3D, chPt.x + chTan.x, chPt.z + chTan.z);
          chariot3D.userData.spinWheels(dt * 28, p * 6);
          chariot3D.scale.setScalar(1.18 * smoothstep(0.48, 0.55, p) * fade);

          const horseRushT = smoothstep(0.60, 0.78, p);
          const hPt = horseDirectCurve.getPoint(horseRushT);
          const hTan = horseDirectCurve.getTangent(Math.min(0.99, horseRushT));
          horse3D.visible = true;
          horse3D.position.copy(hPt);
          this.faceTargetHorizontally(horse3D, hPt.x + hTan.x, hPt.z + hTan.z);
          horse3D.userData.animateGallop(p * 5.5, horseRushT > 0.05 ? 0.28 : 0.55);
          horse3D.scale.setScalar(1.12 * fade);

          if (p >= 0.72) {
            const hitP = (p - 0.72) / 0.16;
            strikeExplosion.update.call(this, hitP, fade, targetKingStagePos);
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, THREE.MathUtils.lerp(2.2, 0.75, chariotRushT), THREE.MathUtils.lerp(-3.5, 1.5, chariotRushT)),
              11.6,
              THREE.MathUtils.lerp(1.06, 0.90, chariotRushT),
              0.18
            );
          }
        } else {
          const backT = smoothstep(0.84, 0.97, p);
          chariot3D.visible = backT < 0.75;
          chariot3D.scale.setScalar(1.18 * (1 - backT) * fade);
          horse3D.visible = backT < 0.75;
          horse3D.scale.setScalar(1.12 * (1 - backT) * fade);

          if (rookItem?.mesh) {
            rookItem.customDriven = true;
            this.setPiece3DPose(rookItem.mesh, rookOrigin.x, 0, rookOrigin.z, 0, 0, 0, 1.0, backT, 0);
          }
          if (horseItem?.mesh && horseItem !== rookItem) {
            horseItem.customDriven = true;
            this.setPiece3DPose(horseItem.mesh, horseOrigin.x, 0, horseOrigin.z, 0, 0, 0, 1.0, backT, 0);
          }
        }
      });
    }

    // =========================================================================
    // 11. 双将 (Double Check):
    // 精细化双武器与合体巨剑建模 + 优美同心刀轮旋转（拒绝乱转） ->
    // 两枚棋子丢出的武器在空中沿交汇轨道优美高速刀轮飞旋，同时平滑进入古战场场景 ->
    // 在战场高空两个武器合体变成精细的轩辕大剑落下 -> 落下的同时渐渐平滑切回终局棋面，插在对面“将（帅）”身上！
    // =========================================================================
    if (vfxType === 'double_check') {
      const cgScene = this.createCGSceneEnvironment('cg_battlefield', group);
      const checkerItem0 = attackerItems[0] || null;
      const checkerItem1 = attackerItems[1] || attackerItems[0] || null;
      const origin0 = checkerItem0?.basePos ? checkerItem0.basePos.clone() : new THREE.Vector3(kPos.x - 3.0, 0, kPos.z + 2.2);
      const origin1 = checkerItem1?.basePos && checkerItem1 !== checkerItem0
        ? checkerItem1.basePos.clone()
        : new THREE.Vector3(kPos.x + 3.0, 0, kPos.z + 2.2);

      const mergeApex = new THREE.Vector3(kPos.x, 4.85, kPos.z);
      const { weapon1, weapon2, greatsword } = this.createRefinedDivineWeaponPairAndGreatsword(
        goldMat,
        crimsonLacquerMat,
        darkIronMat,
        goldGlowMat,
        crimsonGlowMat
      );
      group.add(weapon1, weapon2, greatsword);
      greatsword.visible = false;

      const throwCurve0 = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(origin0.x, 0.9, origin0.z),
        new THREE.Vector3(kPos.x - 2.2, 5.6, (origin0.z + kPos.z) * 0.5),
        mergeApex.clone()
      );
      const throwCurve1 = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(origin1.x, 0.9, origin1.z),
        new THREE.Vector3(kPos.x + 2.2, 5.6, (origin1.z + kPos.z) * 0.5),
        mergeApex.clone()
      );

      const fusionAura = this.createSmoothMorphAura(group, 0xfacc15);
      const megaExplosion = create3DCannonExplosion(kPos, 1.45);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.24, p) * (1 - smoothstep(0.54, 0.74, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        [
          { item: checkerItem0, orig: origin0, sign: 1 },
          { item: checkerItem1, orig: origin1, sign: -1 }
        ].forEach(({ item, orig, sign }, idx) => {
          if (!item?.mesh || (idx === 1 && checkerItem1 === checkerItem0)) return;
          item.customDriven = true;
          const jumpArc = p < 0.36 ? Math.sin((p / 0.36) * Math.PI) * 1.45 : 0;
          const sc = p < 0.36 ? 1.0 + Math.sin((p / 0.36) * Math.PI) * 0.38 : 1.0;
          this.setPiece3DPose(
            item.mesh,
            orig.x,
            jumpArc,
            orig.z,
            jumpArc * 0.35 * sign,
            p < 0.36 ? (p / 0.36) * Math.PI * 2 * sign : 0,
            0,
            sc,
            1.0,
            jumpArc * 0.45
          );
        });

        if (p < 0.36) {
          // 阶段1：两柄神兵沿双龙弧线升空，外层载体固定倾角平面，内层 spinPivot 沿单一 Z 轴高速优美刀轮回旋（绝不乱转！）
          const throwT = smoothstep(0.02, 0.36, p);
          weapon1.visible = true;
          weapon2.visible = true;
          greatsword.visible = false;

          weapon1.position.copy(throwCurve0.getPoint(throwT));
          weapon1.rotation.set(0.28, 0.35, 0);
          weapon1.userData.spinPivot.rotation.set(0, 0, -throwT * Math.PI * 10);
          weapon1.userData.wheelHalo.material.opacity = Math.sin(throwT * Math.PI) * 0.72 * fade;
          weapon1.scale.setScalar((0.88 + throwT * 0.35) * fade);

          weapon2.position.copy(throwCurve1.getPoint(throwT));
          weapon2.rotation.set(0.28, -0.35, 0);
          weapon2.userData.spinPivot.rotation.set(0, 0, throwT * Math.PI * 10);
          weapon2.userData.wheelHalo.material.opacity = Math.sin(throwT * Math.PI) * 0.72 * fade;
          weapon2.scale.setScalar((0.88 + throwT * 0.35) * fade);

          fusionAura.update(mergeApex, smoothstep(0.24, 0.36, p) * 0.5, fade);

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(kPos.x, THREE.MathUtils.lerp(1.2, 4.2, throwT), kPos.z),
              11.8,
              0.92,
              throwT * 0.25
            );
          }
        } else if (p < 0.54) {
          const fuseT = (p - 0.36) / 0.18;
          weapon1.visible = fuseT < 0.35;
          weapon2.visible = fuseT < 0.35;
          const shrink = Math.max(0.01, 1 - fuseT * 2.8);
          weapon1.scale.setScalar(shrink * fade);
          weapon2.scale.setScalar(shrink * fade);

          fusionAura.update(mergeApex, 0.2 + fuseT * 0.78, fade);

          greatsword.visible = true;
          const popScale = fuseT < 0.45
            ? THREE.MathUtils.lerp(0.35, 1.36, fuseT / 0.45)
            : THREE.MathUtils.lerp(1.36, 1.22, (fuseT - 0.45) / 0.55);
          greatsword.scale.setScalar(popScale * fade);
          greatsword.position.set(mergeApex.x, mergeApex.y + fuseT * 0.55, mergeApex.z);
          // 轩辕巨剑合体时围绕自身剑身中轴线 (Y轴) 纯正旋转一周，威严端庄！
          greatsword.rotation.set(0, (1 - smoothstep(0.0, 0.9, fuseT)) * Math.PI * 2, 0);
          if (greatsword.userData.swordHaloRing) {
            greatsword.userData.swordHaloRing.rotation.z += dt * 9;
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(mergeApex.x, mergeApex.y, mergeApex.z),
              10.2,
              0.98,
              0.25 + fuseT * 0.3
            );
          }
        } else {
          weapon1.visible = false;
          weapon2.visible = false;
          fusionAura.update(mergeApex, 0, 0);

          const plungeT = smoothstep(0.54, 0.72, p);
          const swordFadeOut = 1 - smoothstep(0.92, 0.99, p);
          greatsword.visible = swordFadeOut > 0.02;
          greatsword.position.set(
            kPos.x,
            THREE.MathUtils.lerp(mergeApex.y + 0.55, 1.88, plungeT * plungeT),
            kPos.z
          );
          greatsword.rotation.set(0, 0, 0);
          greatsword.scale.setScalar(1.22 * swordFadeOut * fade);
          if (greatsword.userData.swordHaloRing) {
            greatsword.userData.swordHaloRing.rotation.z += dt * 10;
          }

          if (p >= 0.70) {
            const hitP = (p - 0.70) / 0.30;
            megaExplosion.update.call(this, hitP, fade, kPos);
            applyKingHitFeedback(hitP, 'heavy_smash', 0, 0);
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(kPos.x, THREE.MathUtils.lerp(4.2, 0.95, plungeT), kPos.z),
              10.6,
              0.90,
              0.18
            );
          }
        }
      });
    }

    // =========================================================================
    // 12. 夹车炮 (Chariot Cannon Clamp):
    // “车”和“炮”绕着某一点公转并升空（同时场景平滑切换为战场） ->
    // 变成建模车和建模炮之后合体拼装成合体炮下落 ->
    // 然后平滑切回终局棋面落到合适地点向“将（帅）”开炮！
    // =========================================================================
    if (vfxType === 'chariot_cannon_clamp') {
      const cgScene = this.createCGSceneEnvironment('cg_battlefield', group);
      const rookItem = findAttackerItemByType('r', null) || attackerItems[0];
      const cannonItem = findAttackerItemByType('c', rookItem) || attackerItems.find(it => it !== rookItem) || rookItem;
      const rookOrigin = rookItem?.basePos ? rookItem.basePos.clone() : new THREE.Vector3(kPos.x + 1.2, 0, kPos.z + 2.2);
      const cannonOrigin = cannonItem?.basePos ? cannonItem.basePos.clone() : new THREE.Vector3(kPos.x - 2.4, 0, kPos.z + 1.2);

      const dirSign = kPos.z < 0 ? -1 : 1;
      const fireGroundPos = new THREE.Vector3(kPos.x, 0.05, kPos.z - dirSign * 3.6);
      const orbitCenterXZ = new THREE.Vector3(kPos.x, 0, fireGroundPos.z * 0.65);
      const airAssemblyApex = new THREE.Vector3(orbitCenterXZ.x, 3.35, orbitCenterXZ.z);

      const rookMorphAura = this.createSmoothMorphAura(group, 0xfbbf24);
      const cannonMorphAura = this.createSmoothMorphAura(group, 0xef4444);

      const chariot = this.createArticulated3DWarChariot(bronzeWoodMat, goldMat, darkIronMat, goldGlowMat);
      const cannon = this.createArticulated3DCannon(crimsonLacquerMat, goldMat, darkIronMat, crimsonGlowMat);
      chariot.visible = false;
      cannon.visible = false;
      group.add(chariot, cannon);

      const combinedUnit = new THREE.Group();
      combinedUnit.position.copy(airAssemblyApex);
      this.faceTargetHorizontally(combinedUnit, kPos.x, kPos.z);
      combinedUnit.visible = false;
      group.add(combinedUnit);

      const hull = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.46, 1.85), bronzeWoodMat);
      hull.position.y = 0.46;
      const armorPlating = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.32, 1.92), goldMat);
      armorPlating.position.y = 0.52;
      const frontRam = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.75, 4), goldGlowMat.clone());
      frontRam.rotation.x = Math.PI / 2;
      frontRam.position.set(0, 0.42, 1.25);
      combinedUnit.add(hull, armorPlating, frontRam);

      const combinedWheels = [];
      [[-0.92, -0.58], [0.92, -0.58], [-0.92, 0.58], [0.92, 0.58]].forEach(([wx, wz]) => {
        const wGroup = new THREE.Group();
        wGroup.position.set(wx, 0.46, wz);
        const tire = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.068, 12, 28), goldMat);
        tire.rotation.y = Math.PI / 2;
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.26, 14), darkIronMat);
        hub.rotation.z = Math.PI / 2;
        wGroup.add(tire, hub);
        combinedUnit.add(wGroup);
        combinedWheels.push(wGroup);
      });

      const turretPivot = new THREE.Group();
      turretPivot.position.set(0, 0.88, 0);
      const turretBase = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 0.32, 20), crimsonLacquerMat);
      turretPivot.add(turretBase);

      [-0.32, 0.32].forEach(bx => {
        const mainBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.28, 2.15, 24), darkIronMat);
        mainBarrel.rotation.x = Math.PI / 2;
        mainBarrel.position.set(bx, 0.22, 0.35);
        const muzzleCrown = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 12, 24), goldGlowMat.clone());
        muzzleCrown.position.set(bx, 0.22, 1.42);
        const midBand = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.04, 10, 20), goldMat);
        midBand.position.set(bx, 0.22, 0.45);
        turretPivot.add(mainBarrel, muzzleCrown, midBand);
      });
      turretPivot.rotation.x = -0.24;
      combinedUnit.add(turretPivot);

      const superShell = new THREE.Group();
      const sCore = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), goldGlowMat.clone());
      const sWake = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.95, 12), crimsonGlowMat.clone());
      sWake.rotation.x = -Math.PI / 2;
      sWake.position.z = -0.45;
      superShell.add(sCore, sWake);
      superShell.visible = false;
      group.add(superShell);

      const clampExplosion = create3DCannonExplosion(kPos, 1.38);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.24, p) * (1 - smoothstep(0.56, 0.74, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        if (p < 0.36) {
          const orbT = p / 0.36;
          const morphT = smoothstep(0.68, 1.0, orbT);
          const curY = THREE.MathUtils.lerp(0.15, airAssemblyApex.y, smoothstep(0.0, 0.92, orbT));
          const rad = THREE.MathUtils.lerp(2.45, 1.25, orbT);
          const ang = orbT * Math.PI * 3.5;

          const rPt = new THREE.Vector3(
            orbitCenterXZ.x + Math.cos(ang) * rad,
            curY + Math.sin(ang * 2) * 0.28,
            orbitCenterXZ.z + Math.sin(ang) * rad
          );
          const cPt = new THREE.Vector3(
            orbitCenterXZ.x + Math.cos(ang + Math.PI) * rad,
            curY - Math.sin(ang * 2) * 0.28,
            orbitCenterXZ.z + Math.sin(ang + Math.PI) * rad
          );

          const pAlpha = 1 - smoothstep(0.20, 0.90, morphT);
          if (rookItem?.mesh) {
            rookItem.customDriven = true;
            this.setPiece3DPose(
              rookItem.mesh,
              rPt.x,
              rPt.y,
              rPt.z,
              orbT * Math.PI * 4,
              orbT * Math.PI * 6,
              0,
              1.18 + (rPt.z / 6.0) * 0.22,
              pAlpha,
              morphT * 0.75
            );
          }
          if (cannonItem?.mesh && cannonItem !== rookItem) {
            cannonItem.customDriven = true;
            this.setPiece3DPose(
              cannonItem.mesh,
              cPt.x,
              cPt.y,
              cPt.z,
              -orbT * Math.PI * 4,
              orbT * Math.PI * 6,
              0,
              1.18 + (cPt.z / 6.0) * 0.22,
              pAlpha,
              morphT * 0.75,
              0xef4444
            );
          }

          rookMorphAura.update(rPt, morphT, fade);
          cannonMorphAura.update(cPt, morphT, fade);

          const mScale = smoothstep(0.15, 0.98, morphT) * 0.92 * fade;
          chariot.visible = mScale > 0.02;
          chariot.position.copy(rPt);
          this.faceTargetHorizontally(chariot, airAssemblyApex.x, airAssemblyApex.z);
          chariot.scale.setScalar(mScale);
          chariot.userData.spinWheels(dt * 20, p * 4);

          cannon.visible = mScale > 0.02;
          cannon.position.copy(cPt);
          this.faceTargetHorizontally(cannon, airAssemblyApex.x, airAssemblyApex.z);
          cannon.scale.setScalar(mScale);

          combinedUnit.visible = false;
          superShell.visible = false;

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(orbitCenterXZ.x, curY * 0.75, orbitCenterXZ.z),
              10.8,
              0.92,
              orbT * 0.35
            );
          }
        } else if (p < 0.56) {
          if (rookItem?.mesh) { rookItem.customDriven = true; rookItem.mesh.visible = false; }
          if (cannonItem?.mesh) { cannonItem.customDriven = true; cannonItem.mesh.visible = false; }

          const dockT = smoothstep(0.36, 0.48, p);
          const fuseDoneT = smoothstep(0.45, 0.56, p);

          chariot.visible = fuseDoneT < 0.55;
          chariot.position.set(
            THREE.MathUtils.lerp(airAssemblyApex.x - 1.1, airAssemblyApex.x, dockT),
            airAssemblyApex.y - 0.35 * (1 - dockT),
            airAssemblyApex.z
          );
          chariot.scale.setScalar(0.95 * (1 - fuseDoneT) * fade);

          cannon.visible = fuseDoneT < 0.55;
          cannon.position.set(
            THREE.MathUtils.lerp(airAssemblyApex.x + 1.1, airAssemblyApex.x, dockT),
            airAssemblyApex.y + 0.55 * (1 - dockT),
            airAssemblyApex.z
          );
          cannon.scale.setScalar(0.95 * (1 - fuseDoneT) * fade);

          rookMorphAura.update(airAssemblyApex, Math.sin(fuseDoneT * Math.PI), fade);
          cannonMorphAura.update(airAssemblyApex, 0, 0);

          combinedUnit.visible = fuseDoneT > 0.15;
          combinedUnit.position.copy(airAssemblyApex);
          const pop = fuseDoneT < 0.5
            ? THREE.MathUtils.lerp(0.45, 1.24, fuseDoneT / 0.5)
            : THREE.MathUtils.lerp(1.24, 1.10, (fuseDoneT - 0.5) / 0.5);
          combinedUnit.scale.setScalar(pop * fade);
          combinedWheels.forEach(w => { w.rotation.x += dt * 14; });

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(airAssemblyApex.clone(), 9.4, 0.96, 0.25);
          }
        } else {
          chariot.visible = false;
          cannon.visible = false;
          rookMorphAura.update(airAssemblyApex, 0, 0);

          const dropT = smoothstep(0.56, 0.72, p);
          const curUnitPos = new THREE.Vector3().lerpVectors(airAssemblyApex, fireGroundPos, dropT * dropT);
          const unitFadeOut = 1 - smoothstep(0.90, 0.99, p);
          combinedUnit.visible = unitFadeOut > 0.02;
          combinedUnit.position.copy(curUnitPos);
          combinedUnit.scale.setScalar(1.10 * unitFadeOut * fade);

          const pieceShow = smoothstep(0.58, 0.78, p);
          if (rookItem?.mesh) {
            rookItem.customDriven = true;
            this.setPiece3DPose(rookItem.mesh, rookOrigin.x, 0, rookOrigin.z, 0, 0, 0, 1.0, pieceShow, 0);
          }
          if (cannonItem?.mesh && cannonItem !== rookItem) {
            cannonItem.customDriven = true;
            this.setPiece3DPose(cannonItem.mesh, cannonOrigin.x, 0, cannonOrigin.z, 0, 0, 0, 1.0, pieceShow, 0);
          }

          if (p >= 0.72) {
            const fireP = (p - 0.72) / 0.28;
            const shellFlight = Math.min(1, fireP / 0.42);
            const recoil = fireP < 0.28 ? Math.sin((fireP / 0.28) * Math.PI) * 0.45 : 0;
            combinedUnit.position.z = fireGroundPos.z - dirSign * recoil;
            turretPivot.rotation.x = -0.28 - recoil * 0.45;

            superShell.visible = shellFlight < 0.96;
            superShell.position.set(
              THREE.MathUtils.lerp(fireGroundPos.x, kPos.x, shellFlight),
              0.92 + Math.sin(shellFlight * Math.PI) * 2.15,
              THREE.MathUtils.lerp(fireGroundPos.z, kPos.z, shellFlight)
            );
            this.faceTargetHorizontally(superShell, kPos.x, kPos.z);
            superShell.scale.setScalar(1.25 * fade);

            if (fireP >= 0.38) {
              const hitP = (fireP - 0.38) / 0.62;
              clampExplosion.update.call(this, hitP, fade, kPos);
              applyKingHitFeedback(hitP, 'cannon_blast', 0, dirSign);
            }
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(kPos.x, 0.68, THREE.MathUtils.lerp(curUnitPos.z, kPos.z, 0.5)),
              10.2,
              0.92,
              0.15
            );
          }
        }
      });
    }

    // =========================================================================
    // 13. 加强卧槽马 (Trough Horse):
    // “将（帅）”和另一枚助战棋子飞起来在空中正面对峙（激起交锋电光火花），
    // 同时“马”棋子绕着这两个对峙的棋子螺旋盘旋飞起来，
    // 然后“马”在空中平滑变身成精雕 3D 建模马，咆哮疾冲把对峙中的“将（帅）”直接撞飞！
    // =========================================================================
    if (vfxType === 'trough_horse') {
      const cgScene = this.createCGSceneEnvironment('cg_battlefield', group);
      const horseItem = findAttackerItemByType('n', null) || attackerItems[0];
      const partnerItem = findAttackerItemByType('r', horseItem)
        || findAttackerItemByType('c', horseItem)
        || attackerItems.find(it => it !== horseItem)
        || horseItem;

      const horseOrigin = horseItem?.basePos ? horseItem.basePos.clone() : new THREE.Vector3(cPos.x, 0, cPos.z);
      const partnerOrigin = partnerItem?.basePos ? partnerItem.basePos.clone() : new THREE.Vector3(kPos.x + 2.0, 0, kPos.z + 2.0);

      // 空中对峙点：“将（帅）”在左 (-1.28, 2.25, 0)，助战棋子在右 (+1.28, 2.25, 0)
      const kingStandoffPos = new THREE.Vector3(-1.28, 2.25, 0);
      const partnerStandoffPos = new THREE.Vector3(1.28, 2.25, 0);
      const horseTransformPos = new THREE.Vector3(3.45, 2.35, 0);

      // 对峙双子之间的雷霆气场电弧与能量核
      const clashEnergyGroup = new THREE.Group();
      clashEnergyGroup.position.set(0, 2.25, 0);
      const clashCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 1), goldGlowMat.clone());
      const clashRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 10, 28), crimsonGlowMat.clone());
      clashRing.rotation.y = Math.PI / 2;
      const clashBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.2, 10), goldGlowMat.clone());
      clashBeam.rotation.z = Math.PI / 2;
      clashEnergyGroup.add(clashCore, clashRing, clashBeam);
      clashEnergyGroup.visible = false;
      group.add(clashEnergyGroup);

      const horseMorphAura = this.createSmoothMorphAura(group, 0xfbbf24);
      const troughHorse = this.createArticulated3DWarHorse(crimsonLacquerMat, goldMat, goldGlowMat);
      troughHorse.visible = false;
      group.add(troughHorse);

      const ramImpactExplosion = create3DCannonExplosion(kingStandoffPos, 1.38);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.22, p) * (1 - smoothstep(0.84, 0.97, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        const standoffInT = smoothstep(0.0, 0.22, p);
        const returnBoardT = smoothstep(0.84, 0.98, p);

        // 1. 另一枚助战棋子飞至右侧对峙点 (partnerStandoffPos) 与“将（帅）”交锋对峙，尾声归位
        if (partnerItem?.mesh && partnerItem !== horseItem) {
          partnerItem.customDriven = true;
          const pCur = new THREE.Vector3().lerpVectors(partnerOrigin, partnerStandoffPos, standoffInT * (1 - returnBoardT));
          const tremor = (p > 0.18 && p < 0.65) ? Math.sin(p * 85) * 0.06 : 0;
          const sc = THREE.MathUtils.lerp(1.0, 1.62, standoffInT * (1 - returnBoardT));
          this.setPiece3DPose(
            partnerItem.mesh,
            pCur.x + tremor,
            pCur.y,
            pCur.z,
            0,
            0,
            standoffInT * (1 - returnBoardT) * (Math.PI * 0.42),
            sc,
            1.0,
            standoffInT * (1 - returnBoardT) * 0.68,
            0xfbbf24
          );
        }

        // 对峙气场光束
        if (p > 0.16 && p < 0.65) {
          clashEnergyGroup.visible = true;
          const pulse = 0.85 + Math.sin(p * 48) * 0.25;
          clashCore.scale.setScalar(pulse * fade);
          clashRing.scale.setScalar((0.9 + Math.cos(p * 40) * 0.2) * fade);
          clashRing.rotation.x += dt * 12;
        } else {
          clashEnergyGroup.visible = false;
        }

        // 2. “马”棋子绕着空中对峙的两枚棋子螺旋盘旋飞升 (0.00 -> 0.44) -> 变身为 3D 建模马 (0.44 -> 0.56) -> 疾冲撞飞“将（帅）” (0.56 -> 0.84)
        if (p < 0.56) {
          const orbitT = smoothstep(0.04, 0.46, p);
          const morphT = smoothstep(0.42, 0.56, p);
          // 围绕对峙双子 (0, 2.25, 0) 的 3D 螺旋轨道
          const ang = orbitT * Math.PI * 4.0;
          const rx = 2.85 + Math.sin(orbitT * Math.PI) * 0.55;
          const rz = 1.95;
          const orbitPt = new THREE.Vector3(
            Math.cos(ang) * rx,
            THREE.MathUtils.lerp(0.25, 2.35, orbitT) + Math.sin(ang * 2) * 0.35,
            Math.sin(ang) * rz
          );
          const curHPt = new THREE.Vector3().lerpVectors(horseOrigin, orbitPt, smoothstep(0.0, 0.18, p));
          curHPt.lerp(horseTransformPos, morphT);

          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            this.setPiece3DPose(
              horseItem.mesh,
              curHPt.x,
              curHPt.y,
              curHPt.z,
              orbitT * Math.PI * 4,
              orbitT * Math.PI * 6,
              0,
              1.35 + (curHPt.z / 5.0) * 0.25,
              1 - smoothstep(0.15, 0.90, morphT),
              0.75,
              0xfbbf24
            );
          }

          horseMorphAura.update(curHPt, morphT, fade);
          const mScale = smoothstep(0.15, 0.95, morphT) * 1.22 * fade;
          troughHorse.visible = mScale > 0.02;
          troughHorse.position.copy(curHPt);
          this.faceTargetHorizontally(troughHorse, kingStandoffPos.x, kingStandoffPos.z);
          troughHorse.userData.animateGallop(p * 5, morphT * 0.72);
          troughHorse.scale.setScalar(mScale);
        } else if (p < 0.84) {
          horseMorphAura.update(horseTransformPos, 0, 0);
          if (horseItem?.mesh) { horseItem.customDriven = true; horseItem.mesh.visible = false; }

          const chargeT = smoothstep(0.56, 0.72, p);
          const chargeEnd = new THREE.Vector3(-2.15, 2.15, 0);
          troughHorse.visible = true;
          troughHorse.position.lerpVectors(horseTransformPos, chargeEnd, chargeT);
          troughHorse.position.y += Math.sin(chargeT * Math.PI) * 0.65;
          this.faceTargetHorizontally(troughHorse, chargeEnd.x - 1, chargeEnd.z);
          troughHorse.userData.animateGallop(p * 6.5, chargeT > 0.4 && chargeT < 0.8 ? 0.65 : 0.25);
          troughHorse.scale.setScalar(1.25 * fade);
        } else {
          const backT = smoothstep(0.84, 0.98, p);
          troughHorse.visible = backT < 0.75;
          troughHorse.scale.setScalar(1.22 * (1 - backT) * fade);
          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            const hp = new THREE.Vector3().lerpVectors(new THREE.Vector3(-2.15, 2.15, 0), horseOrigin, backT);
            this.setPiece3DPose(horseItem.mesh, hp.x, hp.y, hp.z, 0, 0, 0, THREE.MathUtils.lerp(1.3, 1.0, backT), backT, 0);
          }
        }

        // 3. “将（帅）”在空中左端对峙，p=0.66 被疾冲而来的建模马迎面撞飞出去！
        if (kingItem?.mesh) {
          kingItem.customDriven = true;
          if (p < 0.65) {
            const kCur = new THREE.Vector3().lerpVectors(kPos, kingStandoffPos, standoffInT);
            const tremor = p > 0.18 ? Math.sin(p * 85) * 0.06 : 0;
            this.setPiece3DPose(
              kingItem.mesh,
              kCur.x - tremor,
              kCur.y,
              kCur.z,
              0,
              0,
              -standoffInT * (Math.PI * 0.42),
              THREE.MathUtils.lerp(1.0, 1.62, standoffInT),
              1.0,
              standoffInT * 0.55,
              0xef4444
            );
          } else if (p < 0.85) {
            // 被建模马猛烈撞飞（沿抛物线向远空翻滚飞出！）
            const flyOutT = (p - 0.65) / 0.20;
            ramImpactExplosion.update.call(this, flyOutT, fade, kingStandoffPos);
            const kx = THREE.MathUtils.lerp(kingStandoffPos.x, -6.8, flyOutT);
            const kz = THREE.MathUtils.lerp(kingStandoffPos.z, -2.6, flyOutT);
            const ky = kingStandoffPos.y + Math.sin(flyOutT * Math.PI * 0.85) * 2.45 - flyOutT * 1.2;
            this.setPiece3DPose(
              kingItem.mesh,
              kx,
              Math.max(0.1, ky),
              kz,
              flyOutT * Math.PI * 5,
              flyOutT * Math.PI * 4,
              flyOutT * Math.PI * 3,
              1.62 * (1 - flyOutT * 0.25),
              1.0,
              0.90,
              0xef4444
            );
          } else {
            const backT = smoothstep(0.85, 0.98, p);
            const kx = THREE.MathUtils.lerp(-6.8, kPos.x, backT);
            const kz = THREE.MathUtils.lerp(-2.6, kPos.z, backT);
            const ky = Math.sin(backT * Math.PI) * 1.2;
            this.setPiece3DPose(
              kingItem.mesh,
              kx,
              ky,
              kz,
              (1 - backT) * Math.PI * 2,
              0,
              0,
              THREE.MathUtils.lerp(1.25, 1.0, backT),
              1.0,
              0
            );
          }
        }

        if (vfxContext?.setCameraOverride) {
          vfxContext.setCameraOverride(
            new THREE.Vector3(p > 0.65 && p < 0.84 ? -1.8 : 0, 2.05, 0),
            11.4,
            0.92,
            Math.sin(p * Math.PI) * 0.24
          );
        }
      });
    }

    // =========================================================================
    // 14. 加强闷杀 (Smothered Kill):
    // 闷杀“将（帅）”的棋子腾空而起，变身成为现有的这个带链狼牙铁球缓慢下落（精准卡好落地时机）；
    // 然后把镜头对着“将（帅）”，“将（帅）”尝试躲开铁球，
    // 但是闷着“将（帅）”的棋子开始变身成为现有的这个玄铁栏杆拦住了“将（帅）”，
    // “将（帅）”在其中弹了几下，铁球落下来一击砸中“将（帅）”！
    // =========================================================================
    if (vfxType === 'smothered_kill') {
      const cgScene = this.createCGSceneEnvironment('cg_imperial_citadel', group);
      const centerStage = new THREE.Vector3(0, 0.02, 0);

      const mainAttacker = attackerItems[0] || null;
      const attackerStart = mainAttacker?.basePos ? mainAttacker.basePos.clone() : new THREE.Vector3(cPos.x, 0, cPos.z);
      const blockerItems = findSmotheringBlockerItems(4);

      const ballMorphAura = this.createSmoothMorphAura(group, 0xf59e0b);
      const barMorphAuras = Array.from({ length: 8 }, () => this.createSmoothMorphAura(group, 0xef4444));

      // 8 根玄铁尖刺栏杆（由闷着“将（帅）”的棋子变身而成，围绕中心 r = 1.45 拦住“将（帅）”）
      const cageRadius = 1.45;
      const cageGroup = new THREE.Group();
      cageGroup.visible = false;
      group.add(cageGroup);

      const cageBars = [];
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const barGroup = new THREE.Group();
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.95, 12), darkIronMat);
        pillar.position.y = 0.98;
        const goldBand = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.032, 8, 16), goldMat);
        goldBand.rotation.x = Math.PI / 2;
        goldBand.position.y = 1.48;
        const topSpike = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.45, 6), crimsonLacquerMat);
        topSpike.position.y = 2.12;
        const hitRipple = new THREE.Mesh(new THREE.RingGeometry(0.16, 0.38, 20), crimsonGlowMat.clone());
        hitRipple.position.set(0, 0.65, 0);
        hitRipple.material.opacity = 0;
        barGroup.add(pillar, goldBand, topSpike, hitRipple);
        barGroup.position.set(Math.cos(ang) * cageRadius, 0, Math.sin(ang) * cageRadius);
        barGroup.rotation.y = -ang + Math.PI / 2;
        cageGroup.add(barGroup);
        cageBars.push({ barGroup, ang, hitRipple });
      }
      const cageRingTop = new THREE.Mesh(new THREE.TorusGeometry(cageRadius, 0.065, 10, 36), goldMat);
      cageRingTop.rotation.x = Math.PI / 2;
      cageRingTop.position.y = 1.52;
      cageGroup.add(cageRingTop);

      // 带铁链的巨型玄铁狼牙铁球（由致胜棋子在高空变身而成并缓慢下落）
      const ballWithChainAssembly = new THREE.Group();
      ballWithChainAssembly.position.set(0, 7.6, 0);
      ballWithChainAssembly.visible = false;
      group.add(ballWithChainAssembly);

      const ironBall = new THREE.Mesh(new THREE.SphereGeometry(1.12, 26, 22), darkIronMat);
      const magmaWire = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.14, 1),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24, wireframe: true, transparent: true, opacity: 0.68 })
      );
      ballWithChainAssembly.add(ironBall, magmaWire);

      const spikeDirs = [
        [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1],
        [0.7, 0.7, 0], [-0.7, 0.7, 0], [0.7, -0.7, 0], [-0.7, -0.7, 0],
        [0, 0.7, 0.7], [0, 0.7, -0.7], [0, -0.7, 0.7], [0, -0.7, -0.7]
      ];
      spikeDirs.forEach(([sx, sy, sz], idx) => {
        const dirV = new THREE.Vector3(sx, sy, sz).normalize();
        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.16, 0.48, 8),
          idx % 2 === 0 ? goldMat : crimsonLacquerMat
        );
        spike.position.copy(dirV).multiplyScalar(1.18);
        spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirV);
        ballWithChainAssembly.add(spike);
      });

      const topLug = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.06, 10, 20), goldMat);
      topLug.position.y = 1.18;
      ballWithChainAssembly.add(topLug);
      create3DChainBetween(
        new THREE.Vector3(0, 1.28, 0),
        new THREE.Vector3(0, 8.85, 0),
        16,
        ballWithChainAssembly
      );

      // “将（帅）”尝试躲开铁球并被栏杆拦住弹撞的轨迹节点
      const dodgeWaypoints = [
        { t: 0.30, ox: 0, oz: 0, barIdx: -1 },
        { t: 0.40, ox: Math.cos(0) * 1.06, oz: Math.sin(0) * 1.06, barIdx: 0 }, // 尝试向右冲刺躲避铁球，撞上剛变身升起的0号栏杆！
        { t: 0.50, ox: Math.cos(Math.PI * 0.75) * 1.06, oz: Math.sin(Math.PI * 0.75) * 1.06, barIdx: 3 },
        { t: 0.60, ox: Math.cos(Math.PI * 1.5) * 1.06, oz: Math.sin(Math.PI * 1.5) * 1.06, barIdx: 6 },
        { t: 0.68, ox: Math.cos(Math.PI * 0.25) * 1.06, oz: Math.sin(Math.PI * 0.25) * 1.06, barIdx: 1 },
        { t: 0.74, ox: 0, oz: 0, barIdx: -1 } // 弹回阵心，恰好在 p=0.76 被缓慢落下的狼牙铁球正中砸扁！
      ];

      const smashExplosion = create3DCannonExplosion(centerStage, 1.45);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.18, p) * (1 - smoothstep(0.88, 0.98, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        const skyApex = new THREE.Vector3(0, 7.6, 0);

        // 1. 致胜棋子腾空而起 (0.00 -> 0.18) -> 高空变身为狼牙铁球 (0.14 -> 0.26) -> 铁球从 0.22 -> 0.76 缓慢下落卡点砸中“将（帅）”！
        if (p < 0.26) {
          const soarT = smoothstep(0.0, 0.18, p);
          const morphT = smoothstep(0.14, 0.26, p);
          const curAttPos = new THREE.Vector3().lerpVectors(attackerStart, skyApex, soarT);

          if (mainAttacker?.mesh) {
            mainAttacker.customDriven = true;
            this.setPiece3DPose(
              mainAttacker.mesh,
              curAttPos.x,
              curAttPos.y,
              curAttPos.z,
              soarT * Math.PI * 3,
              soarT * Math.PI * 5,
              0,
              THREE.MathUtils.lerp(1.0, 1.85, soarT),
              1 - smoothstep(0.15, 0.90, morphT),
              0.85,
              0xf59e0b
            );
          }
          ballMorphAura.update(curAttPos, morphT, fade);
          const bScale = smoothstep(0.15, 0.95, morphT) * fade;
          ballWithChainAssembly.visible = bScale > 0.02;
          ballWithChainAssembly.position.copy(skyApex);
          ballWithChainAssembly.scale.setScalar(bScale);
        } else {
          ballMorphAura.update(skyApex, 0, 0);
          const fadeOut = 1 - smoothstep(0.88, 0.98, p);

          // 铁球缓慢下落（0.24 -> 0.70 匀速缓降营造窒息压迫感，0.70 -> 0.76 加速砸中中心“将（帅）”！）
          let ballY = 1.18;
          if (p < 0.70) {
            const slowT = (p - 0.24) / 0.46;
            ballY = THREE.MathUtils.lerp(7.6, 2.85, slowT);
          } else if (p < 0.76) {
            const finalDrop = (p - 0.70) / 0.06;
            ballY = THREE.MathUtils.lerp(2.85, 1.18, finalDrop * finalDrop);
          } else if (p < 0.84) {
            const bounce = (p - 0.76) / 0.08;
            ballY = 1.18 + Math.sin(bounce * Math.PI) * 0.35;
          }
          ballWithChainAssembly.visible = fadeOut > 0.02;
          ballWithChainAssembly.position.set(0, ballY, 0);
          ballWithChainAssembly.scale.setScalar(fadeOut * fade);
          ironBall.rotation.y += dt * 1.8;
          magmaWire.rotation.y -= dt * 2.2;

          if (mainAttacker?.mesh) {
            mainAttacker.customDriven = true;
            const backAlpha = smoothstep(0.86, 0.98, p);
            this.setPiece3DPose(mainAttacker.mesh, attackerStart.x, 0, attackerStart.z, 0, 0, 0, 1.0, backAlpha, 0);
          }
        }

        // 2. 闷着“将（帅）”的棋子在“将（帅）”尝试逃跑时 (0.28 -> 0.40) 飞至四周变身为玄铁尖刺栏杆拦住去路！
        const barMorphT = smoothstep(0.28, 0.40, p);
        const cageFadeOut = 1 - smoothstep(0.88, 0.98, p);

        blockerItems.forEach((bItem, idx) => {
          if (!bItem?.mesh) return;
          bItem.customDriven = true;
          const targetAng = (idx / Math.max(1, blockerItems.length)) * Math.PI * 2;
          const ringSlot = new THREE.Vector3(Math.cos(targetAng) * cageRadius, 0.25, Math.sin(targetAng) * cageRadius);
          if (p < 0.40) {
            const moveIn = smoothstep(0.18, 0.34, p);
            const curB = new THREE.Vector3().lerpVectors(bItem.basePos, ringSlot, moveIn);
            curB.y += Math.sin(moveIn * Math.PI) * 0.85;
            this.setPiece3DPose(
              bItem.mesh,
              curB.x,
              curB.y,
              curB.z,
              0,
              moveIn * Math.PI * 3,
              0,
              1 + moveIn * 0.35,
              1 - smoothstep(0.35, 0.95, barMorphT),
              moveIn * 0.75,
              0xef4444
            );
          } else if (p < 0.86) {
            bItem.mesh.visible = false;
          } else {
            const backAlpha = smoothstep(0.86, 0.98, p);
            this.setPiece3DPose(bItem.mesh, bItem.basePos.x, 0, bItem.basePos.z, 0, 0, 0, 1.0, backAlpha, 0);
          }
        });

        cageBars.forEach(({ barGroup, ang, hitRipple }, idx) => {
          const bPos = new THREE.Vector3(Math.cos(ang) * cageRadius, 0, Math.sin(ang) * cageRadius);
          barMorphAuras[idx].update(bPos, barMorphT, fade);

          let pushOut = 0;
          let rippleAlpha = 0;
          for (const wp of dodgeWaypoints) {
            if (wp.barIdx === idx) {
              const distT = Math.abs(p - wp.t);
              if (distT < 0.065) {
                const hf = 1 - distT / 0.065;
                pushOut = Math.sin(hf * Math.PI) * 0.20;
                rippleAlpha = hf * 0.92;
              }
            }
          }
          const curR = cageRadius + pushOut;
          barGroup.position.set(Math.cos(ang) * curR, THREE.MathUtils.lerp(-1.5, 0, barMorphT), Math.sin(ang) * curR);
          hitRipple.material.opacity = rippleAlpha * cageFadeOut;
          hitRipple.scale.setScalar(0.7 + (1 - rippleAlpha) * 1.8);
        });
        cageGroup.visible = barMorphT > 0.05 && cageFadeOut > 0.02;
        cageGroup.scale.setScalar(cageFadeOut * fade);

        // 3. “将（帅）”动作：0.00->0.28 在中心 -> 0.30 抬头见铁球下落惊慌冲刺躲避 -> 被变身升起的栏杆拦住并在栏杆内弹撞数次 -> 0.76 被落下的铁球砸中！
        if (kingItem && kingItem.mesh) {
          kingItem.customDriven = true;
          const m = kingItem.mesh;
          const kScale = 1.78;
          if (p < 0.30) {
            const toCenter = smoothstep(0.0, 0.18, p);
            this.setPiece3DPose(
              m,
              THREE.MathUtils.lerp(kPos.x, 0, toCenter),
              0.02,
              THREE.MathUtils.lerp(kPos.z, 0, toCenter),
              0,
              0,
              0,
              THREE.MathUtils.lerp(1.0, kScale, toCenter),
              1.0,
              0.25
            );
          } else if (p <= dodgeWaypoints[dodgeWaypoints.length - 1].t) {
            let segIdx = 0;
            for (let i = 0; i < dodgeWaypoints.length - 1; i++) {
              if (p >= dodgeWaypoints[i].t && p <= dodgeWaypoints[i + 1].t) {
                segIdx = i;
                break;
              }
            }
            const wA = dodgeWaypoints[segIdx];
            const wB = dodgeWaypoints[segIdx + 1];
            const segT = (p - wA.t) / Math.max(0.001, wB.t - wA.t);
            const curOx = THREE.MathUtils.lerp(wA.ox, wB.ox, segT);
            const curOz = THREE.MathUtils.lerp(wA.oz, wB.oz, segT);
            const arcY = 0.05 + Math.sin(segT * Math.PI) * 0.32;
            const nearBar = Math.min(segT, 1 - segT) < 0.18 ? (1 - Math.min(segT, 1 - segT) / 0.18) : 0;
            if (nearBar > 0.65) {
              this.cameraShake = Math.max(this.cameraShake || 0, 0.24);
            }
            this.setPiece3DPose(
              m,
              curOx,
              arcY,
              curOz,
              (wB.oz - wA.oz) * 0.28 * Math.sin(segT * Math.PI),
              p * Math.PI * 5,
              -(wB.ox - wA.ox) * 0.28 * Math.sin(segT * Math.PI),
              [kScale * (1 + nearBar * 0.18), kScale * (1 - nearBar * 0.16), kScale * (1 + nearBar * 0.18)],
              1.0,
              nearBar * 0.75,
              0xef4444
            );
          } else if (p < 0.88) {
            const hitP = Math.max(0, (p - 0.75) / 0.13);
            smashExplosion.update.call(this, hitP, fade, centerStage);
            applyKingHitFeedback(hitP, 'heavy_smash', 0, 0, centerStage, kScale);
          } else {
            const backT = smoothstep(0.88, 0.98, p);
            this.setPiece3DPose(
              m,
              THREE.MathUtils.lerp(0, kPos.x, backT),
              0,
              THREE.MathUtils.lerp(0, kPos.z, backT),
              0,
              0,
              0,
              THREE.MathUtils.lerp(kScale, 1.0, backT),
              1.0,
              0
            );
          }
        }

        // 4. 运镜：0.00 -> 0.26 追随致胜棋子腾空变身为高空铁球；0.26 -> 0.88 镜头迅速下拉对准地面“将（帅）”躲避、被栏杆围困弹撞及被铁球砸中全过程！
        if (vfxContext?.setCameraOverride) {
          if (p < 0.26) {
            const soarT = smoothstep(0.0, 0.22, p);
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, THREE.MathUtils.lerp(0.8, 6.8, soarT), 0),
              11.2,
              THREE.MathUtils.lerp(0.86, 1.06, soarT),
              soarT * 0.25
            );
          } else {
            const focusDownT = smoothstep(0.26, 0.34, p);
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, THREE.MathUtils.lerp(6.8, 0.85, focusDownT), 0),
              THREE.MathUtils.lerp(11.2, 9.2, focusDownT),
              THREE.MathUtils.lerp(1.06, 0.78, focusDownT),
              0.25 + (p - 0.26) * 0.45
            );
          }
        }
      });
    }

    // =========================================================================
    // 15. 加强天地炮 (Heaven Earth Cannon):
    // “将（帅）”飞跃至屏幕中心，落入浮现的绿草地与蓝天白云+巨大烈日场景 ->
    // 落入后视角往上转对着太阳，太阳开始向地面（对准“将（帅）”）砸去（视角逐渐拉远看清全过程） ->
    // 太阳砸下时“将（帅）”周围草地焦化并引发剧烈场地物理破坏（塌陷陨石深坑、24块掀翻翘起的破碎地壳岩层、立体沸腾岩浆池与14根喷涌熔岩火柱） ->
    // 产生惊天大爆炸后平滑切回终局场地！
    // =========================================================================
    if (vfxType === 'heaven_earth_cannon') {
      const cgScene = this.createCGSceneEnvironment('cg_grassland', group, { withScorchEarth: true });
      const centerStage = new THREE.Vector3(0, 0.02, 0);

      const giantSunGroup = new THREE.Group();
      const sunStartApex = new THREE.Vector3(0, 13.8, 0);
      giantSunGroup.position.copy(sunStartApex);
      group.add(giantSunGroup);

      const sunCore = new THREE.Mesh(
        new THREE.SphereGeometry(2.15, 36, 36),
        new THREE.MeshBasicMaterial({ color: 0xfffbeb, transparent: true, opacity: 0.96 })
      );
      const sunPhotosphere = new THREE.Mesh(
        new THREE.SphereGeometry(2.50, 36, 36),
        new THREE.MeshBasicMaterial({
          color: 0xf97316,
          transparent: true,
          opacity: 0.78,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      const sunCoronaOuter = new THREE.Mesh(
        new THREE.SphereGeometry(3.0, 28, 28),
        new THREE.MeshBasicMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.48,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      const coronaRing1 = new THREE.Mesh(new THREE.TorusGeometry(2.88, 0.14, 12, 48), goldGlowMat.clone());
      const coronaRing2 = new THREE.Mesh(new THREE.TorusGeometry(3.28, 0.10, 12, 48), crimsonGlowMat.clone());
      coronaRing2.rotation.x = Math.PI / 2;
      giantSunGroup.add(sunCore, sunPhotosphere, sunCoronaOuter, coronaRing1, coronaRing2);

      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const flare = new THREE.Mesh(
          new THREE.ConeGeometry(0.46, 1.75, 6),
          i % 2 === 0 ? goldGlowMat.clone() : crimsonGlowMat.clone()
        );
        flare.position.set(Math.cos(a) * 2.58, Math.sin(a) * 2.58, 0);
        flare.rotation.z = a - Math.PI / 2;
        giantSunGroup.add(flare);
      }

      const solarSupernovaExplosion = create3DCannonExplosion(centerStage, 2.35);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.22, p) * (1 - smoothstep(0.84, 0.98, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        coronaRing1.rotation.z += dt * 2.4;
        coronaRing2.rotation.y += dt * 3.0;
        sunPhotosphere.rotation.y += dt * 1.5;

        if (p < 0.24) {
          const leapT = smoothstep(0.0, 0.22, p);
          const kx = THREE.MathUtils.lerp(kPos.x, 0, leapT);
          const kz = THREE.MathUtils.lerp(kPos.z, 0, leapT);
          const ky = Math.sin(leapT * Math.PI) * 2.15;
          const kSc = THREE.MathUtils.lerp(1.0, 1.48, leapT);

          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            this.setPiece3DPose(
              kingItem.mesh,
              kx,
              ky,
              kz,
              Math.sin(leapT * Math.PI) * 0.35,
              leapT * Math.PI * 2,
              0,
              kSc,
              1.0,
              0.2
            );
          }

          giantSunGroup.visible = true;
          giantSunGroup.position.copy(sunStartApex);
          giantSunGroup.scale.setScalar(cgWeight);
          cgScene.sceneGroup.userData.setScorchProgress?.(0, 0, fade);

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(kx * 0.5, 0.65, kz * 0.5),
              10.6,
              0.84,
              0
            );
          }
        } else if (p < 0.40) {
          const lookUpT = smoothstep(0.24, 0.38, p);
          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            this.setPiece3DPose(kingItem.mesh, 0, 0.02, 0, 0, 0, 0, 1.48, 1.0, 0.25);
          }

          const initialDrop = smoothstep(0.32, 0.40, p);
          const sunY = THREE.MathUtils.lerp(13.8, 11.8, initialDrop);
          giantSunGroup.visible = true;
          giantSunGroup.position.set(0, sunY, 0);
          giantSunGroup.scale.setScalar((1.0 + initialDrop * 0.15) * fade);
          cgScene.sceneGroup.userData.setScorchProgress?.(initialDrop * 0.15, 0, fade);

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, THREE.MathUtils.lerp(0.65, 10.5, lookUpT), 0),
              THREE.MathUtils.lerp(10.6, 13.8, lookUpT),
              THREE.MathUtils.lerp(0.84, 1.18, lookUpT),
              0
            );
          }
        } else if (p < 0.68) {
          const fallT = (p - 0.40) / 0.28;
          const fallEase = fallT * fallT;
          const sunY = THREE.MathUtils.lerp(11.8, 1.35, fallEase);
          giantSunGroup.visible = true;
          giantSunGroup.position.set(0, sunY, 0);
          giantSunGroup.scale.setScalar((1.15 + fallEase * 0.28) * fade);

          const scorchP = smoothstep(0.05, 0.95, fallT);
          const preCrackP = smoothstep(0.55, 1.0, fallT) * 0.45;
          cgScene.sceneGroup.userData.setScorchProgress?.(scorchP, preCrackP, fade);

          if (this.scene && this.scene.background) {
            this.scene.background.lerp(new THREE.Color(0x450a0a), scorchP * 0.68);
          }

          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            const tremble = Math.sin(p * 95) * 0.09 * fallT;
            this.setPiece3DPose(
              kingItem.mesh,
              tremble,
              0.02,
              -tremble,
              0,
              0,
              0,
              1.48,
              1.0,
              fallT * 0.85,
              0xef4444
            );
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, THREE.MathUtils.lerp(8.5, 2.2, fallEase), 0),
              THREE.MathUtils.lerp(14.0, 20.8, smoothstep(0.0, 0.85, fallT)),
              THREE.MathUtils.lerp(1.16, 0.90, fallEase),
              fallT * 0.22
            );
          }
        } else {
          // 阶段4：太阳轰然砸入地面，对场地造成毁灭性物理破坏（地壳掀翻、熔岩火柱喷涌、陨石深坑塌陷）与惊天大爆炸！
          const postP = (p - 0.68) / 0.32;
          const expP = Math.min(1, postP / 0.78);
          const destructionP = Math.min(1, 0.45 + postP * 1.4);

          const sunShrink = Math.max(0, 1 - postP * 2.4);
          giantSunGroup.visible = sunShrink > 0.02;
          giantSunGroup.position.set(0, 0.95, 0);
          giantSunGroup.scale.setScalar((1.42 + postP * 1.25) * sunShrink * fade);

          cgScene.sceneGroup.userData.setScorchProgress?.(1.0, destructionP, cgWeight);
          solarSupernovaExplosion.update.call(this, expP, fade, centerStage);

          if (this.scene && this.scene.background && cgWeight > 0.2) {
            this.scene.background.lerp(new THREE.Color(0x3b0806), cgWeight * 0.75);
          }

          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            if (p < 0.86) {
              applyKingHitFeedback((p - 0.68) / 0.18, 'heavy_smash', 0, 1, centerStage, 1.48);
            } else {
              const backT = smoothstep(0.86, 0.98, p);
              const kx = THREE.MathUtils.lerp(0, kPos.x, backT);
              const kz = THREE.MathUtils.lerp(0, kPos.z, backT);
              const ky = Math.sin(backT * Math.PI) * 0.75;
              this.setPiece3DPose(
                kingItem.mesh,
                kx,
                ky,
                kz,
                0,
                0,
                0,
                THREE.MathUtils.lerp(1.48, 1.0, backT),
                1.0,
                (1 - backT) * 0.5
              );
            }
          }

          if (vfxContext?.setCameraOverride && p < 0.88) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, 1.15, 0),
              THREE.MathUtils.lerp(19.2, 12.2, postP),
              0.84,
              0.22 + postP * 0.22
            );
          }
        }
      });
    }

    // =========================================================================
    // 16. 困毙 (Stalemate Trap):
    // 聚焦放大“将（帅）”至屏幕中心，八卦阵此时浮现在其周围（置身九重玄铁禁城·困龙台场景） ->
    // 降低八卦阵墙壁高度，将上方旋转物优化为精致立体「太极阴阳乾坤罗盘法轮」 ->
    // “将（帅）”左冲右突碰撞八卦阵墙壁弹来弹去 -> 最后在阵中心翻滚成反面（背面朝上）表示被绝杀 -> 平滑切回终局！
    // =========================================================================
    if (vfxType === 'stalemate_trap') {
      const cgScene = this.createCGSceneEnvironment('cg_imperial_citadel', group);
      const wallRadius = 2.05;
      const wallHeight = 0.88;
      const monoliths = [];

      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const slab = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.96, wallHeight, 0.22), darkIronMat);
        body.position.y = wallHeight * 0.5;
        const trim = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.14, 0.28), goldMat);
        trim.position.y = wallHeight + 0.04;
        const baseTrim = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.12, 0.28), goldMat);
        baseTrim.position.y = 0.06;

        [0.64, 0.44, 0.24].forEach((ty) => {
          const bar = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.065, 0.25), goldGlowMat.clone());
          bar.position.y = ty;
          slab.add(bar);
        });

        const barrierPane = new THREE.Mesh(
          new THREE.PlaneGeometry(1.38, wallHeight * 0.92),
          new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            transparent: true,
            opacity: 0.20,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
          })
        );
        barrierPane.position.y = wallHeight * 0.5;

        const impactRipple = new THREE.Mesh(
          new THREE.RingGeometry(0.18, 0.42, 24),
          crimsonGlowMat.clone()
        );
        impactRipple.position.set(0, wallHeight * 0.5, -0.14);
        impactRipple.material.opacity = 0;

        slab.add(body, trim, baseTrim, barrierPane, impactRipple);
        slab.position.set(Math.cos(a) * 3.1, 0, Math.sin(a) * 3.1);
        slab.rotation.y = -a + Math.PI / 2;
        group.add(slab);
        monoliths.push({ slab, a, barrierPane, impactRipple });
      }

      const celestialCompass = new THREE.Group();
      celestialCompass.position.set(0, 1.38, 0);
      group.add(celestialCompass);

      const outerCompassRing = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.055, 12, 64), goldMat);
      outerCompassRing.rotation.x = Math.PI / 2;
      const innerCompassRing = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.04, 10, 48), goldGlowMat.clone());
      innerCompassRing.rotation.x = Math.PI / 2;
      celestialCompass.add(outerCompassRing, innerCompassRing);

      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.70), goldMat);
        spoke.position.set(Math.cos(a) * 1.70, 0, Math.sin(a) * 1.70);
        spoke.rotation.y = -a;
        const runeGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), i % 2 === 0 ? goldGlowMat.clone() : crimsonLacquerMat);
        runeGem.position.set(Math.cos(a) * 2.05, 0.06, Math.sin(a) * 2.05);
        celestialCompass.add(spoke, runeGem);
      }

      const baguaTex = typeof getBaguaMagicTexture === 'function' ? getBaguaMagicTexture() : null;
      const groundBaguaDisc = new THREE.Mesh(
        new THREE.CircleGeometry(2.65, 64),
        new THREE.MeshBasicMaterial({
          map: baguaTex,
          color: 0xfbbf24,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      groundBaguaDisc.rotation.x = -Math.PI / 2;
      groundBaguaDisc.position.set(0, 0.025, 0);
      group.add(groundBaguaDisc);

      const bounceWaypoints = [
        { t: 0.16, ox: 0, oz: 0, wallIdx: -1 },
        { t: 0.27, ox: Math.cos(0) * 1.42, oz: Math.sin(0) * 1.42, wallIdx: 0 },
        { t: 0.39, ox: Math.cos(Math.PI * 0.75) * 1.42, oz: Math.sin(Math.PI * 0.75) * 1.42, wallIdx: 3 },
        { t: 0.51, ox: Math.cos(Math.PI * 1.75) * 1.42, oz: Math.sin(Math.PI * 1.75) * 1.42, wallIdx: 7 },
        { t: 0.62, ox: Math.cos(Math.PI * 1.25) * 1.42, oz: Math.sin(Math.PI * 1.25) * 1.42, wallIdx: 5 },
        { t: 0.72, ox: Math.cos(Math.PI * 0.25) * 1.42, oz: Math.sin(Math.PI * 0.25) * 1.42, wallIdx: 1 },
        { t: 0.80, ox: 0, oz: 0, wallIdx: -1 }
      ];

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.18, p) * (1 - smoothstep(0.88, 0.98, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        if (vfxContext?.setCameraOverride) {
          vfxContext.setCameraOverride(
            new THREE.Vector3(0, 0.42, 0),
            8.2,
            0.66,
            p * 0.42
          );
        }

        const closeIn = smoothstep(0.0, 0.18, p);
        const fadeOut = 1 - smoothstep(0.88, 0.98, p);
        const rad = THREE.MathUtils.lerp(3.1, wallRadius, closeIn);

        monoliths.forEach(({ slab, a, barrierPane, impactRipple }, idx) => {
          let pushOut = 0;
          let rippleAlpha = 0;
          let rippleScale = 1;
          for (const wp of bounceWaypoints) {
            if (wp.wallIdx === idx) {
              const distT = Math.abs(p - wp.t);
              if (distT < 0.075) {
                const hitFactor = 1 - distT / 0.075;
                pushOut = Math.sin(hitFactor * Math.PI) * 0.22;
                rippleAlpha = hitFactor * 0.95;
                rippleScale = 0.6 + (1 - hitFactor) * 2.2;
              }
            }
          }
          const curR = rad + pushOut;
          slab.position.set(Math.cos(a) * curR, 0, Math.sin(a) * curR);
          slab.scale.setScalar(closeIn * fadeOut * fade);
          barrierPane.material.opacity = (0.16 + rippleAlpha * 0.48) * fadeOut * fade;
          impactRipple.material.opacity = rippleAlpha * fadeOut * fade;
          impactRipple.scale.setScalar(rippleScale);
        });

        celestialCompass.rotation.y += dt * 1.4;
        innerCompassRing.rotation.z -= dt * 2.2;
        celestialCompass.scale.setScalar(closeIn * fadeOut * fade);
        groundBaguaDisc.rotation.z -= dt * 0.85;
        groundBaguaDisc.material.opacity = 0.58 * closeIn * fadeOut * fade;

        if (kingItem && kingItem.mesh) {
          kingItem.customDriven = true;
          const m = kingItem.mesh;
          const enlargedScale = 2.05;

          if (p < bounceWaypoints[0].t) {
            const toCenterT = smoothstep(0.0, bounceWaypoints[0].t, p);
            const kx = THREE.MathUtils.lerp(kPos.x, 0, toCenterT);
            const kz = THREE.MathUtils.lerp(kPos.z, 0, toCenterT);
            const ky = Math.sin(toCenterT * Math.PI) * 0.85;
            const sc = THREE.MathUtils.lerp(1.0, enlargedScale, toCenterT);
            this.setPiece3DPose(m, kx, ky, kz, 0, toCenterT * Math.PI, 0, sc, 1.0, 0.25);
          } else if (p <= bounceWaypoints[bounceWaypoints.length - 1].t) {
            let segIdx = 0;
            for (let i = 0; i < bounceWaypoints.length - 1; i++) {
              if (p >= bounceWaypoints[i].t && p <= bounceWaypoints[i + 1].t) {
                segIdx = i;
                break;
              }
            }
            const wA = bounceWaypoints[segIdx];
            const wB = bounceWaypoints[segIdx + 1];
            const segT = (p - wA.t) / Math.max(0.001, wB.t - wA.t);
            const curOx = THREE.MathUtils.lerp(wA.ox, wB.ox, segT);
            const curOz = THREE.MathUtils.lerp(wA.oz, wB.oz, segT);
            const arcY = 0.08 + Math.sin(segT * Math.PI) * 0.36;

            const moveDx = wB.ox - wA.ox;
            const moveDz = wB.oz - wA.oz;
            const nearWall = Math.min(segT, 1 - segT) < 0.18 ? (1 - Math.min(segT, 1 - segT) / 0.18) : 0;
            if (nearWall > 0.65) {
              this.cameraShake = Math.max(this.cameraShake || 0, 0.24);
            }
            const sx = enlargedScale * (1 + nearWall * 0.18);
            const sy = enlargedScale * (1 - nearWall * 0.16);
            this.setPiece3DPose(
              m,
              curOx,
              arcY,
              curOz,
              moveDz * 0.28 * Math.sin(segT * Math.PI),
              p * Math.PI * 5,
              -moveDx * 0.28 * Math.sin(segT * Math.PI),
              [sx, sy, sx],
              1.0,
              nearWall * 0.75,
              0xef4444
            );
          } else if (p < 0.90) {
            const flipT = smoothstep(0.80, 0.88, p);
            const arcY = Math.sin(flipT * Math.PI) * 1.55;
            const rx = flipT * Math.PI * 3;
            if (flipT > 0.88 && flipT < 0.95) {
              this.cameraShake = Math.max(this.cameraShake || 0, 0.36);
            }
            this.setPiece3DPose(
              m,
              0,
              arcY,
              0,
              rx,
              0,
              0,
              enlargedScale,
              1.0,
              (1 - flipT) * 0.55,
              0xfbbf24
            );
          } else {
            const backT = smoothstep(0.90, 0.99, p);
            const kx = THREE.MathUtils.lerp(0, kPos.x, backT);
            const kz = THREE.MathUtils.lerp(0, kPos.z, backT);
            const sc = THREE.MathUtils.lerp(enlargedScale, 1.0, backT);
            const rx = THREE.MathUtils.lerp(Math.PI, 0, smoothstep(0.45, 1.0, backT));
            this.setPiece3DPose(m, kx, 0, kz, rx, 0, 0, sc, 1.0, 0);
          }
        }
      });
    }

    // =========================================================================
    // 17. 海底捞月 (Frost Lotus Strike / Sea Bottom Moon):
    // 场景平滑变成一片夜晚的海洋，海中有圆月的倒影，镜头俯视海洋，圆月的倒影在镜头中心且比较大 ->
    // 在一阵阵波纹后圆月的倒影逐渐变成对面的“将（帅）” ->
    // 弹出海面后翻转几圈至背面（反面朝上） -> 然后平滑切回终局棋面！
    // =========================================================================
    const cgScene = this.createCGSceneEnvironment('cg_ocean_night', group);
    const moonReflectGroup = cgScene.sceneGroup.userData.moonReflectGroup;
    const moonCoreMat = cgScene.sceneGroup.userData.moonCoreMat;
    const moonInnerMat = cgScene.sceneGroup.userData.moonInnerMat;
    const rippleRings = cgScene.sceneGroup.userData.rippleRings || [];

    const waterBurstDrops = Array.from({ length: 20 }, (_, i) => {
      const ang = (i / 20) * Math.PI * 2;
      const drop = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 10, 10),
        i % 2 === 0 ? jadeIceMat : goldGlowMat.clone()
      );
      drop.visible = false;
      group.add(drop);
      return { drop, ang, spd: 1.8 + (i % 4) * 0.55, lift: 1.8 + (i % 3) * 0.65 };
    });

    return wrapUpdater((p, dt, fade = 1) => {
      const cgWeight = smoothstep(0.02, 0.22, p) * (1 - smoothstep(0.84, 0.97, p)) * fade;
      vfxContext?.setSceneTransition?.(cgWeight);
      cgScene.setFade(cgWeight, dt, p);

      rippleRings.forEach(({ rMesh, rMat, i }) => {
        const waveCycle = (p * 3.2 + i * 0.14) % 1.0;
        const sc = 0.35 + waveCycle * 2.25;
        rMesh.scale.setScalar(sc);
        rMat.opacity = Math.sin(waveCycle * Math.PI) * 0.72 * cgWeight;
      });

      const enlargedKingScale = 2.18;

      if (p < 0.30) {
        if (kingItem?.mesh) {
          kingItem.customDriven = true;
          this.setPiece3DPose(kingItem.mesh, kPos.x, 0, kPos.z, 0, 0, 0, 1.0, 1 - cgWeight, 0);
        }
        if (moonReflectGroup) {
          moonReflectGroup.visible = true;
          const shimmer = 1.0 + Math.sin(p * 24) * 0.05;
          moonReflectGroup.scale.set(shimmer, 1, shimmer / (1 + Math.cos(p * 20) * 0.04));
        }
        waterBurstDrops.forEach(({ drop }) => { drop.visible = false; });

        if (vfxContext?.setCameraOverride) {
          vfxContext.setCameraOverride(
            new THREE.Vector3(0, 0.0, 0),
            11.4,
            THREE.MathUtils.lerp(0.76, 0.24, smoothstep(0.0, 0.24, p)),
            0
          );
        }
      } else if (p < 0.54) {
        const morphT = smoothstep(0.30, 0.52, p);
        const rippleWobble = Math.sin(p * 42) * 0.08 * (1 - morphT);

        if (moonReflectGroup) {
          moonReflectGroup.visible = morphT < 0.96;
          const mScale = THREE.MathUtils.lerp(1.0, 0.48, morphT) + rippleWobble;
          moonReflectGroup.scale.setScalar(Math.max(0.01, mScale));
          if (moonCoreMat) moonCoreMat.opacity = (1 - morphT * 0.88) * 0.92 * cgWeight;
          if (moonInnerMat) moonInnerMat.opacity = (1 - morphT * 0.75) * 0.68 * cgWeight;
        }

        if (kingItem?.mesh) {
          kingItem.customDriven = true;
          this.setPiece3DPose(
            kingItem.mesh,
            rippleWobble,
            0.02,
            -rippleWobble,
            0,
            (1 - morphT) * Math.PI * 0.5,
            0,
            enlargedKingScale * (0.75 + 0.25 * morphT),
            smoothstep(0.08, 0.85, morphT),
            (1 - morphT * 0.4) * 0.75,
            0xfef08a
          );
        }
        waterBurstDrops.forEach(({ drop }) => { drop.visible = false; });

        if (vfxContext?.setCameraOverride) {
          vfxContext.setCameraOverride(new THREE.Vector3(0, 0.05, 0), 10.2, 0.26, (p - 0.30) * 0.35);
        }
      } else if (p < 0.84) {
        if (moonReflectGroup) moonReflectGroup.visible = false;

        const popT = (p - 0.54) / 0.30;
        const arcY = Math.sin(Math.min(1, popT / 0.82) * Math.PI) * 3.85;
        const curY = Math.max(0.04, arcY);
        const flipRotX = smoothstep(0.0, 0.82, popT) * Math.PI * 5; // 纯单轴翻转两圈半至背面朝上！

        if (popT > 0.80 && popT < 0.88) {
          this.cameraShake = Math.max(this.cameraShake || 0, 0.42);
        }

        if (kingItem?.mesh) {
          kingItem.customDriven = true;
          this.setPiece3DPose(
            kingItem.mesh,
            0,
            curY,
            0,
            flipRotX,
            0,
            0,
            enlargedKingScale,
            1.0,
            Math.sin(popT * Math.PI) * 0.65,
            0x38bdf8
          );
        }

        const splashP = Math.min(1, popT / 0.55);
        waterBurstDrops.forEach(({ drop, ang, spd, lift }) => {
          if (splashP > 0 && splashP < 1) {
            drop.visible = true;
            const r = 0.45 + splashP * spd;
            drop.position.set(Math.cos(ang) * r, Math.sin(splashP * Math.PI) * lift, Math.sin(ang) * r);
            drop.scale.setScalar((1.15 - splashP * 0.65) * fade);
          } else {
            drop.visible = false;
          }
        });

        if (vfxContext?.setCameraOverride) {
          vfxContext.setCameraOverride(
            new THREE.Vector3(0, curY * 0.6, 0),
            10.8,
            THREE.MathUtils.lerp(0.26, 0.68, smoothstep(0.0, 0.65, popT)),
            0.08 + popT * 0.35
          );
        }
      } else {
        if (moonReflectGroup) moonReflectGroup.visible = false;
        waterBurstDrops.forEach(({ drop }) => { drop.visible = false; });

        const backT = smoothstep(0.84, 0.98, p);
        if (kingItem?.mesh) {
          kingItem.customDriven = true;
          const kx = THREE.MathUtils.lerp(0, kPos.x, backT);
          const kz = THREE.MathUtils.lerp(0, kPos.z, backT);
          const sc = THREE.MathUtils.lerp(enlargedKingScale, 1.0, backT);
          const rx = THREE.MathUtils.lerp(Math.PI, 0, smoothstep(0.45, 1.0, backT));
          this.setPiece3DPose(kingItem.mesh, kx, 0, kz, rx, 0, 0, sc, 1.0, 0);
        }
      }
    });
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

    const TOTAL_DURATION = 6.80;
    const STAGE1_END = 0.45;
    const STAGE2_END = 5.70;
    this.vfxAtmosphereDuration = TOTAL_DURATION;
    this.vfxAtmosphereTimer = TOTAL_DURATION;
    this._vfxCustomColorGrading = true;

    const kCoord = pattern.kingCoord || { r: 0, c: 4 };
    const rCoord = pattern.royalCoord || { r: 9, c: 4 };
    const kPos = gridToWorld(kCoord.r, kCoord.c);
    const rPos = gridToWorld(rCoord.r, rCoord.c);
    const lastRec = this.engine?.history?.[this.engine.history.length - 1];
    const checker = (pattern.checkers && pattern.checkers[0])
      ? pattern.checkers[0]
      : (lastRec?.move ? { r: lastRec.move.tr, c: lastRec.move.tc, char: lastRec.piece?.char || '俥' } : { r: Math.min(9, kCoord.r + 2), c: kCoord.c, char: '俥' });
    const cPos = gridToWorld(checker.r, checker.c);

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
          basePos: m.position.clone(),
          isKing,
          isAttacker,
          customDriven: false
        });
      }
    };

    addInteractivePieceByCoord(kCoord, 'king');
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
      setCameraOverride(targetVec, radius, phi, thetaOffset = 0) {
        this.cameraOverride = { targetVec, radius, phi, thetaOffset };
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
          const p2 = (sec - STAGE1_END) / (STAGE2_END - STAGE1_END);
          if (!stage2Triggered) {
            stage2Triggered = true;
            this.cameraShake = 0.24;
            if (updateCustom3D && updateCustom3D.spectacleGroup) {
              updateCustom3D.spectacleGroup.visible = true;
            }
          }

          vfxContext.cameraOverride = null;
          this._activeCheckerMeshes.forEach(it => { it.customDriven = false; });

          const enterT = Math.min(1, p2 / 0.08);
          const enterFade = 1 - Math.pow(1 - enterT, 3);
          if (updateCustom3D) updateCustom3D(p2, dt, enterFade);

          if (vfxContext.cameraOverride) {
            const ov = vfxContext.cameraOverride;
            this.camTarget.lerp(ov.targetVec, 0.28);
            this.desiredSpherical.radius = ov.radius * mobileScale;
            this.desiredSpherical.phi = isMobileView ? Math.min(0.96, ov.phi * 0.94) : ov.phi;
            this.desiredSpherical.theta = baseTheta + (ov.thetaOffset || 0);
          } else {
            const targetFocusFactor = isMobileView ? 0.68 : 0.90;
            this.camTarget.set(focusX * targetFocusFactor, 0.55, focusZ * targetFocusFactor);
            this.desiredSpherical.radius = (10.4 + Math.sin(p2 * Math.PI) * 0.85) * mobileScale;
            this.desiredSpherical.phi = (isMobileView ? 0.86 : 0.96) + Math.cos(p2 * Math.PI) * 0.06;
            this.desiredSpherical.theta = baseTheta + 0.16 + Math.sin(p2 * Math.PI * 1.5) * 0.24;
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
              const hoverY = (0.24 + Math.sin(p2 * 14 + idx) * 0.08) * bw;
              item.mesh.position.set(item.basePos.x, hoverY, item.basePos.z);
              item.mesh.rotation.set(Math.sin(p2 * 10 + idx) * 0.08 * bw, p2 * Math.PI * 2 * bw, 0);
              const pulseSc = 1.0 + (0.06 + Math.sin(p2 * 16 + idx) * 0.04) * bw;
              item.mesh.scale.set(pulseSc, pulseSc, pulseSc);
            }
          });
        } else {
          const p3 = (sec - STAGE2_END) / Math.max(0.01, TOTAL_DURATION - STAGE2_END);
          const ease3 = 1 - Math.pow(1 - p3, 3);
          if (!stage3Triggered) {
            stage3Triggered = true;
            this.triggerScreenFlash();
            this.cameraShake = 0.40;
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
