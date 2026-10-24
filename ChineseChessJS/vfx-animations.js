// =============================================================================
// 十七大古谱杀法全屏 CG 级 3D 动画分镜演出与逐帧音画同步编排 (vfx-animations.js)
// =============================================================================
Object.assign(Xiangqi3DApp.prototype, {
  /**
   * 构建 17 种古谱杀法的全屏 CG 级 3D 场景切换与棋子动态变身演出
   */
  build3DSpectacleForType(vfxType, kPos, cPos, rPos, winnerColor, pattern = null, kingItem = null, vfxContext = null) {
    kPos = new THREE.Vector3(Number(kPos?.x) || 0, Number(kPos?.y) || 0, Number(kPos?.z) || 0);
    cPos = new THREE.Vector3(Number(cPos?.x) || 0, Number(cPos?.y) || 0, Number(cPos?.z) || 0);
    rPos = new THREE.Vector3(Number(rPos?.x) || 0, Number(rPos?.y) || 0, Number(rPos?.z) || 0);
    if ((!kingItem || !kingItem.mesh) && this.engine?.board) {
      for (let r = 0; r < 10 && (!kingItem || !kingItem.mesh); r++) {
        for (let c = 0; c < 9 && (!kingItem || !kingItem.mesh); c++) {
          const p = this.engine.board[r][c];
          if (p && p.type === 'k' && p.color !== winnerColor) {
            const m = this.pieceMeshes?.get(p.id);
            if (m) {
              kingItem = (this._activeCheckerMeshes || []).find(x => x.mesh === m);
              if (!kingItem) {
                kingItem = {
                  mesh: m,
                  piece: p,
                  coord: { r, c },
                  basePos: new THREE.Vector3(m.position.x, 0, m.position.z),
                  isKing: true,
                  isAttacker: false,
                  customDriven: false
                };
                if (Array.isArray(this._activeCheckerMeshes)) this._activeCheckerMeshes.push(kingItem);
              }
            }
          }
        }
      }
    }
    const group = new THREE.Group();
    group.visible = false;
    this.checkmateVFXGroup.add(group);
    const slashTex = typeof getSlashArcTexture === 'function' ? getSlashArcTexture() : null;

    const firedAudioCues = new Set();
    const dispatchVFXAudioCues = (p) => {
      if (!this.sfx || p >= 0.97) return;
      const cue = (minP, key, cb) => {
        if (p >= minP && !firedAudioCues.has(key)) {
          firedAudioCues.add(key);
          cb();
        }
      };

      if (vfxType === 'double_chariot') {
        cue(0.02, 'dc_w1', () => this.sfx.playVFXWindWhoosh?.(260, 580, 0.48, 0.48, -0.45));
        cue(0.16, 'dc_w2', () => this.sfx.playVFXWindWhoosh?.(300, 640, 0.45, 0.48, 0.45));
        cue(0.33, 'dc_morph', () => {
          this.sfx.playVFXMorphFlash?.(0.72, 0.96);
          this.sfx.playVFXPieceStepThud?.(0.65, 0.85);
        });
        cue(0.44, 'dc_charge', () => this.sfx.playVFXChariotRumble?.(1.30, 0.78));
        cue(0.57, 'dc_slash', () => this.sfx.playVFXSwordCleave?.(0.82));
        cue(0.80, 'dc_back', () => this.sfx.playVFXWindWhoosh?.(420, 200, 0.36, 0.38, 0));
      } else if (vfxType === 'smothered_palace') {
        cue(0.01, 'sp_in', () => this.sfx.playVFXWindWhoosh?.(320, 210, 0.34, 0.42, 0));
        cue(0.12, 'sp_s0', () => this.sfx.playVFXPieceStepThud?.(0.58, 1.00));
        cue(0.15, 'sp_w0', () => this.sfx.playVFXStoneWallRise?.(0.95, 0.78));
        cue(0.19, 'sp_b0', () => this.sfx.playVFXPieceStepThud?.(0.48, 0.92));
        cue(0.26, 'sp_s1', () => this.sfx.playVFXPieceStepThud?.(0.58, 1.04));
        cue(0.29, 'sp_w1', () => this.sfx.playVFXStoneWallRise?.(1.04, 0.80));
        cue(0.33, 'sp_b1', () => this.sfx.playVFXPieceStepThud?.(0.48, 0.95));
        cue(0.40, 'sp_s2', () => this.sfx.playVFXPieceStepThud?.(0.58, 1.08));
        cue(0.43, 'sp_w2', () => this.sfx.playVFXStoneWallRise?.(1.12, 0.82));
        cue(0.47, 'sp_b2', () => this.sfx.playVFXPieceStepThud?.(0.48, 0.98));
        cue(0.54, 'sp_s3', () => this.sfx.playVFXPieceStepThud?.(0.58, 1.12));
        cue(0.57, 'sp_w3', () => this.sfx.playVFXStoneWallRise?.(1.20, 0.85));
        cue(0.68, 'sp_tremble', () => this.sfx.playVFXPanicTremble?.(0.58, 0.62));
        cue(0.74, 'sp_roof_fall', () => this.sfx.playVFXWindWhoosh?.(620, 140, 0.35, 0.70, 0));
        cue(0.80, 'sp_roof_hit', () => this.sfx.playVFXIronBoltSlam?.(0.90, 0.82));
      } else if (vfxType === 'royal_gaze') {
        cue(0.02, 'rg_rise', () => this.sfx.playVFXWindWhoosh?.(240, 520, 0.45, 0.45, 0));
        cue(0.18, 'rg_morph', () => {
          this.sfx.playVFXMorphFlash?.(0.76, 1.0);
          this.sfx.playVFXSwordUnsheathe?.(0.85);
        });
        cue(0.36, 'rg_walk', () => this.sfx.playVFXArmorFootsteps?.(5, 1.58, 0.72));
        cue(0.68, 'rg_cleave', () => this.sfx.playVFXSwordCleave?.(0.96));
        cue(0.85, 'rg_back', () => this.sfx.playVFXWindWhoosh?.(380, 190, 0.35, 0.36, 0));
      } else if (vfxType === 'double_cannon') {
        cue(0.02, 'dcan_leap', () => this.sfx.playVFXWindWhoosh?.(260, 580, 0.45, 0.48, 0));
        cue(0.22, 'dcan_fuse', () => {
          this.sfx.playVFXMorphFlash?.(0.74, 0.94);
          this.sfx.playVFXMechanicalAssemble?.(0.84);
        });
        cue(0.39, 'dcan_load', () => this.sfx.playVFXAmmoLoad?.(0.85));
        cue(0.56, 'dcan_drop', () => this.sfx.playVFXWindWhoosh?.(480, 140, 0.35, 0.52, 0));
        cue(0.68, 'dcan_land', () => this.sfx.playVFXPieceStepThud?.(0.75, 0.78));
        cue(0.72, 'dcan_fire', () => this.sfx.playVFXCannonFire?.(1.38, 0.96));
      } else if (vfxType === 'horse_cannon') {
        cue(0.02, 'hc_leap', () => this.sfx.playVFXWindWhoosh?.(280, 580, 0.42, 0.48, 0));
        cue(0.14, 'hc_morph', () => {
          this.sfx.playVFXMorphFlash?.(0.74, 1.04);
          this.sfx.playVFXMechanicalAssemble?.(0.70);
        });
        cue(0.30, 'hc_vault', () => {
          this.sfx.playVFXHoofGallop?.(2, 0.65, 0.78);
          this.sfx.playVFXWindWhoosh?.(520, 220, 0.45, 0.52, 0);
        });
        cue(0.58, 'hc_land', () => this.sfx.playVFXPieceStepThud?.(0.72, 0.85));
        cue(0.69, 'hc_fire', () => this.sfx.playVFXCannonFire?.(1.30, 0.94));
      } else if (vfxType === 'iron_bolt') {
        cue(0.01, 'ib_room', () => this.sfx.playVFXStoneWallRise?.(0.86, 0.82));
        cue(0.18, 'ib_d0', () => this.sfx.playVFXPieceStepThud?.(0.65, 0.82));
        cue(0.23, 'ib_b0', () => this.sfx.playVFXIronBoltSlam?.(0.84, 0.95));
        cue(0.305, 'ib_d1', () => this.sfx.playVFXPieceStepThud?.(0.65, 0.88));
        cue(0.355, 'ib_b1', () => this.sfx.playVFXIronBoltSlam?.(0.86, 1.02));
        cue(0.43, 'ib_d2', () => this.sfx.playVFXPieceStepThud?.(0.65, 0.94));
        cue(0.48, 'ib_b2', () => this.sfx.playVFXIronBoltSlam?.(0.88, 1.08));
        cue(0.555, 'ib_d3', () => this.sfx.playVFXPieceStepThud?.(0.65, 1.00));
        cue(0.605, 'ib_b3', () => this.sfx.playVFXIronBoltSlam?.(0.92, 1.15));
        cue(0.65, 'ib_chains', () => this.sfx.playVFXChainPull?.(0.75, 0.90));
      } else if (vfxType === 'side_tiger') {
        cue(0.02, 'st_crouch', () => {
          this.sfx.playVFXTigerRoar?.(0.84, false);
          this.sfx.playVFXWindWhoosh?.(260, 480, 0.38, 0.42, 0);
        });
        cue(0.18, 'st_j1', () => this.sfx.playVFXWindWhoosh?.(240, 520, 0.32, 0.55, -0.3));
        cue(0.34, 'st_p1', () => this.sfx.playVFXPieceStepThud?.(0.78, 0.95));
        cue(0.39, 'st_j2', () => this.sfx.playVFXWindWhoosh?.(280, 620, 0.32, 0.58, 0.25));
        cue(0.52, 'st_p2', () => this.sfx.playVFXPieceStepThud?.(0.82, 1.08));
        cue(0.57, 'st_pounce', () => this.sfx.playVFXTigerRoar?.(0.95, true));
      } else if (vfxType === 'octagon_horse') {
        cue(0.02, 'oh_leap', () => this.sfx.playVFXWindWhoosh?.(260, 580, 0.42, 0.48, 0));
        cue(0.12, 'oh_morph', () => {
          this.sfx.playVFXMorphFlash?.(0.75, 1.0);
          this.sfx.playVFXSwordUnsheathe?.(0.80);
        });
        cue(0.24, 'oh_gallop', () => this.sfx.playVFXHoofGallop?.(5, 1.90, 0.80));
        cue(0.62, 'oh_throw', () => this.sfx.playVFXSpinningWeaponThrow?.(1.02, 0.85));
        cue(0.80, 'oh_hit', () => this.sfx.playVFXSwordCleave?.(0.92));
      } else if (vfxType === 'fishing_horse') {
        cue(0.02, 'fh_sea', () => this.sfx.playVFXOceanSwirl?.(1.30, 0.65));
        cue(0.28, 'fh_plunge', () => this.sfx.playVFXWaterPlunge?.(0.88));
        cue(0.54, 'fh_emerge', () => {
          this.sfx.playVFXWaterSplash?.(0.92);
          this.sfx.playVFXChainPull?.(1.10, 0.85);
          this.sfx.playVFXHoofGallop?.(3, 1.05, 0.78);
        });
      } else if (vfxType === 'standing_horse_chariot') {
        cue(0.01, 'shc_leap', () => this.sfx.playVFXWindWhoosh?.(240, 560, 0.48, 0.55, 0));
        cue(0.16, 'shc_hmorph', () => {
          this.sfx.playVFXMorphFlash?.(0.72, 1.05);
          this.sfx.playVFXHoofGallop?.(2, 0.55, 0.75);
        });
        cue(0.26, 'shc_sun', () => this.sfx.playVFXMorphFlash?.(0.75, 0.78));
        cue(0.48, 'shc_rush', () => {
          this.sfx.playVFXMorphFlash?.(0.78, 0.92);
          this.sfx.playVFXChariotRumble?.(1.20, 0.84);
        });
        cue(0.59, 'shc_hrush', () => this.sfx.playVFXHoofGallop?.(3, 0.85, 0.82));
      } else if (vfxType === 'double_check') {
        cue(0.02, 'dchk_throw', () => this.sfx.playVFXSpinningWeaponThrow?.(1.35, 0.84));
        cue(0.21, 'dchk_align', () => this.sfx.playVFXWindWhoosh?.(540, 260, 0.36, 0.58, 0));
        cue(0.33, 'dchk_mech1', () => this.sfx.playVFXMechanicalAssemble?.(0.88));
        cue(0.44, 'dchk_clamp', () => {
          this.sfx.playVFXIronBoltSlam?.(0.86, 0.96);
          this.sfx.playVFXAmmoLoad?.(0.82);
        });
        cue(0.54, 'dchk_fuse', () => {
          this.sfx.playVFXMorphFlash?.(0.84, 0.92);
          this.sfx.playVFXSwordUnsheathe?.(0.94);
        });
        cue(0.62, 'dchk_plunge', () => this.sfx.playVFXWindWhoosh?.(940, 130, 0.72, 0.90, 0));
        cue(0.74, 'dchk_cleave', () => this.sfx.playVFXSwordCleave?.(0.98));
      } else if (vfxType === 'chariot_cannon_clamp') {
        cue(0.02, 'ccc_spiral', () => this.sfx.playVFXWindWhoosh?.(240, 620, 0.65, 0.52, 0));
        cue(0.20, 'ccc_morph', () => this.sfx.playVFXMorphFlash?.(0.74, 0.96));
        cue(0.36, 'ccc_mech', () => this.sfx.playVFXMechanicalAssemble?.(0.84));
        cue(0.45, 'ccc_dock', () => {
          this.sfx.playVFXIronBoltSlam?.(0.88, 0.90);
          this.sfx.playVFXAmmoLoad?.(0.78);
        });
        cue(0.56, 'ccc_drop', () => {
          this.sfx.playVFXWindWhoosh?.(520, 150, 0.42, 0.55, 0);
          this.sfx.playVFXChariotRumble?.(0.75, 0.72);
        });
        cue(0.72, 'ccc_fire', () => this.sfx.playVFXCannonFire?.(1.42, 0.96));
      } else if (vfxType === 'trough_horse') {
        cue(0.02, 'th_fly', () => this.sfx.playVFXWindWhoosh?.(260, 520, 0.45, 0.48, 0));
        cue(0.14, 'th_clash', () => {
          this.sfx.playVFXEnergyBeamClash?.(2.40, 0.80);
          this.sfx.playVFXWindWhoosh?.(300, 640, 0.85, 0.42, 0.35);
        });
        cue(0.42, 'th_morph', () => this.sfx.playVFXMorphFlash?.(0.78, 1.04));
        cue(0.56, 'th_charge', () => {
          this.sfx.playVFXHoofGallop?.(3, 0.55, 0.88);
          this.sfx.playVFXWindWhoosh?.(580, 220, 0.40, 0.72, -0.3);
        });
      } else if (vfxType === 'smothered_kill') {
        cue(0.01, 'sk_soar', () => this.sfx.playVFXWindWhoosh?.(220, 680, 0.55, 0.55, 0));
        cue(0.14, 'sk_ball', () => {
          this.sfx.playVFXMorphFlash?.(0.76, 0.86);
          this.sfx.playVFXChainPull?.(0.55, 0.72);
        });
        cue(0.28, 'sk_cage', () => {
          this.sfx.playVFXStoneWallRise?.(1.12, 0.82);
          this.sfx.playVFXIronBoltSlam?.(0.84, 1.05);
        });
        cue(0.34, 'sk_b0', () => this.sfx.playVFXPieceStepThud?.(0.68, 1.00));
        cue(0.41, 'sk_b1', () => this.sfx.playVFXPieceStepThud?.(0.68, 1.05));
        cue(0.48, 'sk_b2', () => this.sfx.playVFXPieceStepThud?.(0.68, 1.10));
        cue(0.55, 'sk_b3', () => this.sfx.playVFXPieceStepThud?.(0.68, 1.15));
        cue(0.62, 'sk_b4', () => this.sfx.playVFXPieceStepThud?.(0.68, 1.20));
        cue(0.68, 'sk_fall', () => this.sfx.playVFXWindWhoosh?.(720, 110, 0.42, 0.85, 0));
      } else if (vfxType === 'heaven_earth_cannon') {
        cue(0.01, 'hec_land', () => this.sfx.playVFXPieceStepThud?.(0.72, 0.90));
        cue(0.10, 'hec_spiral', () => this.sfx.playVFXWindWhoosh?.(220, 760, 1.20, 0.62, 0));
        cue(0.22, 'hec_sun', () => {
          this.sfx.playVFXSolarLavaRumble?.(2.60, 0.88);
          this.sfx.playVFXHeavyExplosion?.(1.25, 0.80);
        });
        cue(0.39, 'hec_pass', () => this.sfx.playVFXMeteorWhistlePass?.(0.95));
        cue(0.45, 'hec_cut1_slam', () => this.sfx.playVFXHeavyExplosion?.(1.75, 0.96));
        cue(0.50, 'hec_rain', () => this.sfx.playVFXMeteorRainImpacts?.(1.35, 0.88));
        cue(0.70, 'hec_blocker', () => this.sfx.playVFXHeavyExplosion?.(1.80, 0.98));
        cue(0.75, 'hec_selfwave', () => this.sfx.playVFXSolarLavaRumble?.(2.10, 0.94));
        cue(0.80, 'hec_touchdown_quake', () => {
          this.sfx.playVFXHeavyExplosion?.(2.15, 1.0);
          this.sfx.playVFXSolarLavaRumble?.(1.85, 0.98);
        });
      } else if (vfxType === 'stalemate_trap') {
        cue(0.02, 'st_walls', () => this.sfx.playVFXStoneWallRise?.(0.88, 0.85));
        cue(0.16, 'st_hit0', () => this.sfx.playVFXPieceStepThud?.(0.68, 0.92));
        cue(0.25, 'st_hit1', () => this.sfx.playVFXPieceStepThud?.(0.68, 0.96));
        cue(0.34, 'st_hit2', () => this.sfx.playVFXPieceStepThud?.(0.68, 1.00));
        cue(0.43, 'st_hit3', () => this.sfx.playVFXPieceStepThud?.(0.68, 1.04));
        cue(0.52, 'st_hit4', () => this.sfx.playVFXPieceStepThud?.(0.68, 1.08));
        cue(0.60, 'st_hit5', () => this.sfx.playVFXPieceStepThud?.(0.68, 1.12));
        cue(0.68, 'st_hit6', () => this.sfx.playVFXPieceStepThud?.(0.68, 1.16));
        cue(0.80, 'st_flip', () => this.sfx.playVFXWindWhoosh?.(360, 150, 0.32, 0.52, 0));
        cue(0.86, 'st_flat', () => this.sfx.playVFXPieceStepThud?.(0.85, 0.75));
      } else if (vfxType === 'frost_lotus_strike' || vfxType === 'sea_bottom_moon') {
        cue(0.02, 'fls_wave', () => this.sfx.playVFXOceanSwirl?.(1.75, 0.76));
        cue(0.30, 'fls_morph', () => {
          this.sfx.playVFXMorphFlash?.(0.78, 1.12);
          this.sfx.playHint?.();
        });
        cue(0.54, 'fls_splash', () => this.sfx.playVFXWaterSplash?.(0.92));
        cue(0.76, 'fls_land', () => this.sfx.playVFXPieceStepThud?.(0.75, 0.85));
      }
    };

    const wrapUpdater = (fn) => {
      const wrapped = (p, dt, fade = 1) => {
        if (!group.visible && fade > 0.001) group.visible = true;
        dispatchVFXAudioCues(p);
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
      if (found) {
        const gw = gridToWorld(found.r, found.c);
        return new THREE.Vector3(gw.x, 0, gw.z);
      }
      return fallbackPos instanceof THREE.Vector3
        ? fallbackPos.clone()
        : new THREE.Vector3(Number(fallbackPos?.x) || 0, Number(fallbackPos?.y) || 0, Number(fallbackPos?.z) || 0);
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

    const create3DChainBetween = (p1, p2, linkCount = 18, parentObj = group) => {
      const chainGroup = new THREE.Group();
      const dir = new THREE.Vector3().subVectors(p2, p1);
      const len = Math.max(0.001, dir.length());
      const normDir = dir.clone().normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normDir);

      // 连贯的玄铁内芯索杆 + 紧密咬合无断层的环环相扣锁链环（支持沿路径滑动动画！）
      const coreCable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.036, 0.036, len, 10),
        darkIronMat
      );
      const midPt = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      coreCable.position.copy(midPt);
      coreCable.quaternion.copy(quat);
      chainGroup.add(coreCable);

      const denseCount = Math.max(linkCount, Math.ceil(len / 0.17));
      const links = [];
      for (let i = 0; i <= denseCount; i++) {
        const f = i / Math.max(1, denseCount);
        const link = new THREE.Mesh(
          new THREE.TorusGeometry(0.115, 0.036, 8, 16),
          i % 2 === 0 ? darkIronMat : goldMat
        );
        link.position.lerpVectors(p1, p2, f);
        link.quaternion.copy(quat);
        if (i % 2 === 1) link.rotateY(Math.PI / 2);
        chainGroup.add(link);
        links.push({ link, baseF: f, idx: i });
      }
      const p1Saved = p1.clone();
      const p2Saved = p2.clone();
      chainGroup.userData = {
        p1: p1Saved,
        p2: p2Saved,
        quat,
        links,
        denseCount,
        advanceLinks(shiftAmount = 0) {
          links.forEach(({ link, baseF, idx }) => {
            let curF = (baseF + shiftAmount) % 1.0;
            if (curF < 0) curF += 1.0;
            link.position.lerpVectors(p1Saved, p2Saved, curF);
            link.quaternion.copy(quat);
            if (idx % 2 === 1) link.rotateY(Math.PI / 2);
          });
        }
      };
      parentObj.add(chainGroup);
      return chainGroup;
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
            this.sfx?.playVFXHeavyExplosion?.(scale, 0.92);
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
      const bp = anchorPos || kingItem.basePos || kPos;
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
          // 固定冲锋切线方向向量，杜绝战车到达终点 cEnd 时因位置与目标重合导致 Math.atan2(0,0) 突然反转朝向！
          const fixedDirX = cEnd.x - lSpot.x;
          const fixedDirZ = cEnd.z - lSpot.z;
          const fixedHeadingYaw = Math.atan2(fixedDirX, fixedDirZ);

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
              chModel.rotation.set(0, fixedHeadingYaw, 0);
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
            // 始终保持冲锋正向角度 fixedHeadingYaw，在终点及收尾绝不突变朝向！
            chModel.rotation.set(0, fixedHeadingYaw, 0);
            const distCenter = chModel.position.length();
            const focusScale = 1.12 + Math.max(0, 1 - distCenter / 4.0) * 0.22;
            chModel.scale.setScalar(focusScale * fade);
            chModel.userData.spinWheels(dt * 28, p * 6);
          } else {
            const backT = smoothstep(0.78, 0.96, p);
            mAura.update(cEnd, 1 - backT, fade);
            const chScale = 1.08 * (1 - smoothstep(0.0, 0.65, backT)) * fade;
            chModel.visible = chScale > 0.02;
            chModel.position.copy(cEnd);
            chModel.rotation.set(0, fixedHeadingYaw, 0);
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
          slashPlanes.forEach((pl) => { pl.material.opacity = 0; });
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
    // “将（帅）”聚焦至中心后，依次尝试向北、东、南、西四个方向突围行走：
    // 朝向并走向一个方向 -> 那个方向立即拔地升起城墙挡路 -> “将（帅）”被逼后退回中心，再转身尝试向下一个方向走；
    // 直到四面墙全部升起合围后，才在原地惊慌抖动，紧接着重檐封顶大盖从天而降严丝合缝盖死！
    // =========================================================================
    if (vfxType === 'smothered_palace') {
      const cgScene = this.createCGSceneEnvironment('cg_imperial_citadel', group);
      const centerStage = new THREE.Vector3(0, 0.02, 0);

      // 四个方向定义：0:北 (0, -1), 1:东 (+1, 0), 2:南 (0, +1), 3:西 (-1, 0)
      const wallDefs = [
        { x: 0, z: -1.65, ry: 0, dirX: 0, dirZ: -1, faceYaw: Math.PI, startT: 0.12, endT: 0.26 },
        { x: 1.65, z: 0, ry: Math.PI / 2, dirX: 1, dirZ: 0, faceYaw: -Math.PI / 2, startT: 0.26, endT: 0.40 },
        { x: 0, z: 1.65, ry: 0, dirX: 0, dirZ: 1, faceYaw: 0, startT: 0.40, endT: 0.54 },
        { x: -1.65, z: 0, ry: Math.PI / 2, dirX: -1, dirZ: 0, faceYaw: Math.PI / 2, startT: 0.54, endT: 0.68 }
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

        [-1.52, 1.52].forEach((px) => {
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
        const cgWeight = smoothstep(0.02, 0.16, p) * (1 - smoothstep(0.88, 0.98, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        if (vfxContext?.setCameraOverride) {
          vfxContext.setCameraOverride(
            new THREE.Vector3(0, 0.85, 0),
            9.2,
            0.68,
            p * 0.72
          );
        }

        const fadeOut = 1 - smoothstep(0.88, 0.98, p);

        // 四面城墙：当“将（帅）”朝向该方向走过去时 (segP: 0.22 -> 0.68)，该方向的城墙拔地升起拦住去路！
        walls.forEach((w) => {
          const segP = Math.max(0, Math.min(1, (p - w.startT) / (w.endT - w.startT)));
          const wallRiseT = smoothstep(0.22, 0.68, segP);
          const easeRise = 1 - Math.pow(1 - wallRiseT, 3);
          w.wGroup.position.y = THREE.MathUtils.lerp(-2.6, 0.0, easeRise);
          w.wGroup.scale.setScalar(fadeOut * fade);

          if (wallRiseT > 0.05 && wallRiseT < 0.98) {
            w.riseWave.material.opacity = (1 - wallRiseT) * 0.85 * fadeOut;
            w.riseWave.scale.setScalar(0.8 + wallRiseT * 1.8);
            if (wallRiseT > 0.75 && wallRiseT < 0.88) {
              this.cameraShake = Math.max(this.cameraShake || 0, 0.24);
            }
          } else {
            w.riseWave.material.opacity = 0;
          }
        });

        // 四面墙全部升起且“将（帅）”在原地绝望抖动后 (0.72 -> 0.82)，重檐封顶大盖轰然落下盖死！
        const dropRaw = Math.min(1, Math.max(0, (p - 0.72) / 0.10));
        const dropEase = dropRaw * dropRaw;
        sealRoof.position.set(0, THREE.MathUtils.lerp(7.8, 2.38, dropEase), 0);
        sealRoof.scale.setScalar(fadeOut * fade);

        if (kingItem && kingItem.mesh) {
          kingItem.customDriven = true;
          const enlargedScale = 1.92;
          if (p < 0.12) {
            // 0.00 -> 0.12: “将（帅）”飞至中心困龙台
            const toCenter = smoothstep(0.0, 0.12, p);
            this.setPiece3DPose(
              kingItem.mesh,
              THREE.MathUtils.lerp(kPos.x, 0, toCenter),
              Math.sin(toCenter * Math.PI) * 0.75,
              THREE.MathUtils.lerp(kPos.z, 0, toCenter),
              0,
              0,
              0,
              THREE.MathUtils.lerp(1.0, enlargedScale, toCenter),
              1.0,
              0.25
            );
          } else if (p < 0.68) {
            // 0.12 -> 0.68: 依次尝试向北、东、南、西四个方向走：
            // segP 0.00 -> 0.44 朝向该方向迈步走过去 -> 城墙升起拦住 -> segP 0.44 -> 1.00 惊退回中心！
            let activeWall = walls[0];
            for (const w of walls) {
              if (p >= w.startT && p <= w.endT) {
                activeWall = w;
                break;
              }
            }
            const segP = Math.max(0, Math.min(1, (p - activeWall.startT) / (activeWall.endT - activeWall.startT)));
            let walkDist = 0;
            let pitchTilt = 0;
            let stepHopY = 0.02;
            if (segP < 0.45) {
              // 朝向该方向迈步前行
              const fwdT = smoothstep(0.0, 0.44, segP);
              walkDist = fwdT * 0.94;
              stepHopY = 0.02 + Math.abs(Math.sin(fwdT * Math.PI * 2)) * 0.22;
              pitchTilt = Math.sin(fwdT * Math.PI) * 0.26;
            } else {
              // 面前城墙升起，被逼向后退回中心！
              const backT = smoothstep(0.45, 0.96, segP);
              walkDist = (1 - backT) * 0.94;
              stepHopY = 0.02 + Math.abs(Math.sin(backT * Math.PI * 2)) * 0.18;
              pitchTilt = -Math.sin(backT * Math.PI) * 0.28;
            }
            const kx = activeWall.dirX * walkDist;
            const kz = activeWall.dirZ * walkDist;
            const rx = activeWall.dirZ * pitchTilt;
            const rz = -activeWall.dirX * pitchTilt;

            this.setPiece3DPose(
              kingItem.mesh,
              kx,
              stepHopY,
              kz,
              rx,
              activeWall.faceYaw,
              rz,
              enlargedScale,
              1.0,
              0.42,
              0xfbbf24
            );
          } else if (p < 0.80) {
            // 0.68 -> 0.80: 四面墙全部升起后，走投无路的“将（帅）”在原地剧烈惊慌抖动！
            const panicP = (p - 0.68) / 0.12;
            const jitterX = Math.sin(p * 165) * 0.14;
            const jitterZ = Math.cos(p * 152) * 0.14;
            const trembleTilt = Math.sin(p * 140) * 0.20;
            this.setPiece3DPose(
              kingItem.mesh,
              jitterX,
              0.02 + Math.abs(Math.sin(p * 90)) * 0.08,
              jitterZ,
              trembleTilt,
              Math.sin(panicP * Math.PI * 4) * 0.35,
              -trembleTilt,
              enlargedScale,
              1.0,
              0.78,
              0xef4444
            );
          } else if (p < 0.89) {
            const hitP = (p - 0.80) / 0.09;
            sealExplosion.update.call(this, hitP, fade, centerStage);
            applyKingHitFeedback(hitP, 'heavy_smash', 0, 0, centerStage, enlargedScale);
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
    // 变身后的神将手持巨剑【刀刃严格朝向正前方对手】，绝不横着拿剑；
    // 全程在古战场场景中挥舞神剑冲至对面并一剑劈斩对面的“将（帅）”，
    // 【砍完对面的“将（帅）”之后场景才会平滑变回终局棋面】，绝不在半路提前变回！
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

      // 纵向劈砍刀光剑气（严格对齐 Y-Z 纵向劈砍平面，刀刃正对敌将）
      const swordWaveGroup = new THREE.Group();
      const waveOuterArc = new THREE.Mesh(
        new THREE.TorusGeometry(1.15, 0.11, 14, 36, Math.PI * 1.15),
        goldGlowMat.clone()
      );
      waveOuterArc.rotation.y = Math.PI / 2;
      const waveInnerArc = new THREE.Mesh(
        new THREE.TorusGeometry(0.88, 0.07, 12, 32, Math.PI * 1.05),
        crimsonGlowMat.clone()
      );
      waveInnerArc.rotation.y = Math.PI / 2;
      swordWaveGroup.add(waveOuterArc, waveInnerArc);
      swordWaveGroup.visible = false;
      this.faceTargetHorizontally(swordWaveGroup, kPos.x, kPos.z);
      group.add(swordWaveGroup);

      const slashImpactExplosion = create3DCannonExplosion(kPos, 1.28);

      return wrapUpdater((p, dt, fade = 1) => {
        // 关键修正：直到神将在 p=0.70->0.84 彻底砍完对面的“将（帅）”之后，在 p=0.84->0.97 场景才会平滑切回终局棋面！
        const cgWeight = smoothstep(0.02, 0.24, p) * (1 - smoothstep(0.84, 0.97, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        const strikeStopZ = kPos.z - dirSign * 1.55;

        // 确保敌方“将（帅）”在古战场地面上清晰显示，并在 p >= 0.72 被神将迎面劈斩！
        if (kingItem?.mesh && p < 0.72) {
          kingItem.customDriven = true;
          this.setPiece3DPose(kingItem.mesh, kPos.x, 0.02, kPos.z, 0, 0, 0, 1.18, 1.0, 0.25, 0xef4444);
        }

        if (p < 0.36) {
          const riseT = smoothstep(0.0, 0.28, p);
          const morphT = smoothstep(0.18, 0.36, p);
          const curY = THREE.MathUtils.lerp(0, 1.85, riseT) * (1 - morphT * 0.85);
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
            // 仅在纵向平面绕 X 轴蓄力举剑，Y=0, Z=0 确保刀刃笔直朝向对手！
            general3D.userData.swordArmPivot.rotation.set(THREE.MathUtils.lerp(-0.4, -1.35, morphT), 0, 0);
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
          const chargeT = smoothstep(0.36, 0.68, p);
          const curZ = THREE.MathUtils.lerp(royalStart.z, strikeStopZ, chargeT);
          const curX = THREE.MathUtils.lerp(royalStart.x, kPos.x, chargeT);
          const strideBounce = p < 0.68 ? Math.abs(Math.sin(p * 38)) * 0.24 : 0;

          if (royalItem?.mesh) {
            royalItem.customDriven = true;
            // 砍完敌将、场景切回终局棋面时 (p: 0.84 -> 0.96) 己方“帅（将）”棋子平滑显形归位
            const backAlpha = smoothstep(0.84, 0.96, p);
            this.setPiece3DPose(royalItem.mesh, royalStart.x, 0, royalStart.z, 0, 0, 0, 1.0, backAlpha, 0);
          }
          morphAura.update(royalStart, 0, 0);

          const genFadeOut = 1 - smoothstep(0.85, 0.96, p);
          general3D.visible = genFadeOut > 0.02;
          general3D.position.set(curX, 0.05 + strideBounce, curZ);
          this.faceTargetHorizontally(general3D, kPos.x, kPos.z);
          general3D.scale.setScalar(1.26 * genFadeOut * fade);
          general3D.userData.cape.rotation.x = 0.34 + Math.sin(p * 26) * 0.18;

          if (p < 0.68) {
            // 奔跑冲锋途中：右臂在纵向平面内挥舞巨剑（刀刃始终朝向正前方对手，绝不横拿或侧歪）
            const swingX = -1.05 + Math.sin(p * 32) * 0.58;
            general3D.userData.swordArmPivot.rotation.set(swingX, 0, 0);
            swordWaveGroup.visible = true;
            swordWaveGroup.position.set(curX, 1.15, curZ + dirSign * 0.95);
            swordWaveGroup.rotation.x = Math.sin(p * 32) * 0.35;
            swordWaveGroup.scale.setScalar(0.85 * fade);
          } else {
            // 0.68 -> 0.84: 高举巨剑向对面“将（帅）”当头垂直劈下！
            const cleaveP = Math.min(1, (p - 0.68) / 0.10);
            general3D.userData.swordArmPivot.rotation.set(
              THREE.MathUtils.lerp(-1.68, 0.98, Math.pow(cleaveP, 2.0)),
              0,
              0
            );
            swordWaveGroup.visible = p < 0.86;
            swordWaveGroup.position.set(kPos.x, 0.88, kPos.z);
            swordWaveGroup.rotation.x = cleaveP * 0.85;
            swordWaveGroup.scale.setScalar((1.05 + cleaveP * 0.90) * genFadeOut * fade);
          }

          if (p >= 0.72) {
            const hitP = (p - 0.72) / 0.24;
            slashImpactExplosion.update.call(this, hitP, fade, kPos);
            applyKingHitFeedback(hitP, 'slash', 0, dirSign);
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(curX, 0.78, THREE.MathUtils.lerp(curZ, kPos.z, 0.42)),
              9.6,
              0.88,
              0.24
            );
          }
        }
      });
    }

    // =========================================================================
    // 4. 重炮杀 (Double Cannon):
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
        const leftHinge = new THREE.Group();
        leftHinge.position.set(-doorW, 1.22, 0);
        const rightHinge = new THREE.Group();
        rightHinge.position.set(doorW, 1.22, 0);

        [leftHinge, rightHinge].forEach((hinge, idx) => {
          const sign = idx === 0 ? 1 : -1;
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

      // 3. 连贯无断层的重型玄铁锁链群：
      // (A) 6 层环绕捆绑房间的紧密咬合连贯铁链圈 (wrappingLoops)
      // (B) 8 条斜向交叉捆绑房间的连贯铁链 (diagChains)
      // (C) 12 条从房间四壁与四角直连向【屏幕四面八方】远端的崩紧拉索铁链 (radialScreenChains)
      // 拉动收缩时，所有铁链的链环均沿着各自铁链路径高速流动平移（展现真实的拉动铁链运动感！）
      const chainsWrapper = new THREE.Group();
      chainsWrapper.visible = false;
      group.add(chainsWrapper);

      const radialChainsGroup = new THREE.Group();
      radialChainsGroup.visible = false;
      group.add(radialChainsGroup);

      const wrappingLoops = [0.42, 0.82, 1.22, 1.62, 2.02, 2.42].map((cy, idx) => {
        const cLoop = new THREE.Group();
        cLoop.position.y = cy;
        const loopR = 2.08;
        // 内部连贯玄铁环芯，彻底杜绝碎片感
        const coreTorus = new THREE.Mesh(
          new THREE.TorusGeometry(loopR, 0.042, 10, 64),
          darkIronMat
        );
        coreTorus.rotation.x = Math.PI / 2;
        cLoop.add(coreTorus);

        const loopLinks = [];
        const linkCount = 68;
        for (let k = 0; k < linkCount; k++) {
          const baseAngle = (k / linkCount) * Math.PI * 2;
          const link = new THREE.Mesh(
            new THREE.TorusGeometry(0.145, 0.045, 8, 16),
            (k + idx) % 2 === 0 ? darkIronMat : goldMat
          );
          link.position.set(Math.cos(baseAngle) * loopR, 0, Math.sin(baseAngle) * loopR);
          link.rotation.y = -baseAngle;
          if (k % 2 === 0) link.rotation.x = Math.PI / 2;
          cLoop.add(link);
          loopLinks.push({ link, baseAngle, k });
        }
        chainsWrapper.add(cLoop);
        return { cLoop, loopLinks, loopR, idx };
      });

      const diagPairs = [
        [new THREE.Vector3(-2.05, 0.25, 2.05), new THREE.Vector3(2.05, 2.55, 2.05)],
        [new THREE.Vector3(2.05, 0.25, 2.05), new THREE.Vector3(-2.05, 2.55, 2.05)],
        [new THREE.Vector3(2.05, 0.25, -2.05), new THREE.Vector3(-2.05, 2.55, -2.05)],
        [new THREE.Vector3(-2.05, 0.25, -2.05), new THREE.Vector3(2.05, 2.55, -2.05)],
        [new THREE.Vector3(2.05, 0.25, -2.05), new THREE.Vector3(2.05, 2.55, 2.05)],
        [new THREE.Vector3(2.05, 0.25, 2.05), new THREE.Vector3(2.05, 2.55, -2.05)],
        [new THREE.Vector3(-2.05, 0.25, -2.05), new THREE.Vector3(-2.05, 2.55, 2.05)],
        [new THREE.Vector3(-2.05, 0.25, 2.05), new THREE.Vector3(-2.05, 2.55, -2.05)]
      ];
      const diagChains = diagPairs.map(([pA, pB]) => create3DChainBetween(pA, pB, 28, chainsWrapper));

      // 12 条连向屏幕四面八方的巨型拉索铁链（高、中、低多仰角辐射至视野外 r = 16.5）
      const radialScreenChains = [];
      for (let rIdx = 0; rIdx < 12; rIdx++) {
        const azim = (rIdx / 12) * Math.PI * 2 + 0.18;
        const innerR = 1.65;
        const outerR = 16.5;
        const innerY = 0.65 + (rIdx % 3) * 0.72;
        const outerY = (rIdx % 3 === 0) ? 0.35 : (rIdx % 3 === 1 ? 3.8 : 7.2);
        const pInner = new THREE.Vector3(Math.cos(azim) * innerR, innerY, Math.sin(azim) * innerR);
        const pOuter = new THREE.Vector3(Math.cos(azim) * outerR, outerY, Math.sin(azim) * outerR);
        const rChain = create3DChainBetween(pInner, pOuter, 86, radialChainsGroup);
        radialScreenChains.push({ rChain, azim, innerY, outerY, outerR });
      }

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
          roomGroup.visible = true;
          roomGroup.position.y = THREE.MathUtils.lerp(-2.5, 0, emergeT);
          roomGroup.scale.set(1, 1, 1);
          chainsWrapper.visible = false;
          radialChainsGroup.visible = false;
          burstDebris.forEach(({ deb }) => { deb.visible = false; });

          let camTheta = 0;
          if (p >= 0.14) {
            for (let idx = 0; idx < 4; idx++) {
              const df = doorFaces[idx];
              if (p >= df.tStart && p <= df.tEnd) {
                const segP = (p - df.tStart) / (df.tEnd - df.tStart);
                const moveCamT = smoothstep(0.0, 0.38, segP);
                const prevTheta = idx === 0 ? 0 : doorFaces[idx - 1].camTheta;
                camTheta = THREE.MathUtils.lerp(prevTheta, df.camTheta, moveCamT);
                break;
              }
            }
          }

          doorFaces.forEach((df) => {
            const segP = Math.max(0, Math.min(1, (p - df.tStart) / (df.tEnd - df.tStart)));
            const closeDoorT = smoothstep(0.32, 0.82, segP);
            const openAngle = Math.PI * 0.56 * (1 - closeDoorT * closeDoorT);
            df.leftHinge.rotation.y = -openAngle;
            df.rightHinge.rotation.y = openAngle;

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
          // 阶段3：拉开镜头，连贯的捆绑铁链与连向屏幕四面八方的 12 根拉索铁链同时显现，
          // 拉动铁链时，所有铁链链环沿各自铁链路径急速滑动抽紧，将整个房间强行向内挤压！
          const pullOutT = smoothstep(0.64, 0.71, p);
          const squeezeT = smoothstep(0.68, 0.79, p);

          doorFaces.forEach((df) => {
            df.leftHinge.rotation.y = 0;
            df.rightHinge.rotation.y = 0;
            df.boltGroup.visible = true;
            df.boltGroup.position.x = 0;
          });

          const squeezeXZ = THREE.MathUtils.lerp(1.0, 0.48, squeezeT * squeezeT);
          const squeezeY = THREE.MathUtils.lerp(1.0, 0.80, squeezeT * squeezeT);
          const jitter = Math.sin(p * 135) * 0.09 * squeezeT;

          roomGroup.visible = true;
          roomGroup.position.set(jitter, 0, -jitter);
          roomGroup.scale.set(squeezeXZ, squeezeY, squeezeXZ);

          chainsWrapper.visible = true;
          radialChainsGroup.visible = true;
          const chainSqueeze = THREE.MathUtils.lerp(1.10, 0.46, squeezeT * squeezeT);
          chainsWrapper.scale.set(chainSqueeze, squeezeY, chainSqueeze);

          // 链环沿铁链路径持续高速滑动（呈现往屏幕四面八方拽拉铁链的真实路径运动！）
          const pathSlide = ((p - 0.64) / 0.15);
          wrappingLoops.forEach(({ loopLinks, loopR, idx }) => {
            const dirSign = idx % 2 === 0 ? 1 : -1;
            const angleShift = pathSlide * Math.PI * 3.2 * dirSign;
            loopLinks.forEach(({ link, baseAngle, k }) => {
              const curA = baseAngle + angleShift;
              link.position.set(Math.cos(curA) * loopR, 0, Math.sin(curA) * loopR);
              link.rotation.set(k % 2 === 0 ? Math.PI / 2 : 0, -curA, 0);
            });
          });
          diagChains.forEach((dc, idx) => {
            dc.userData?.advanceLinks?.(pathSlide * 1.8 * (idx % 2 === 0 ? 1 : -1));
          });
          radialScreenChains.forEach(({ rChain, azim, innerY }) => {
            // 内端随收缩的房间外壁一起向内收拢，链环沿着从房间通往屏幕四面八方的路径向外急速抽动！
            const curInnerR = 1.65 * squeezeXZ;
            rChain.userData.p1.set(Math.cos(azim) * curInnerR, innerY * squeezeY, Math.sin(azim) * curInnerR);
            rChain.userData?.advanceLinks?.(pathSlide * 2.4);
          });

          if (squeezeT > 0.15) {
            this.cameraShake = Math.max(this.cameraShake || 0, squeezeT * 0.30);
          }

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
              THREE.MathUtils.lerp(8.2, 14.2, pullOutT),
              THREE.MathUtils.lerp(0.94, 0.72, pullOutT),
              Math.PI * 1.5 + pullOutT * 0.45
            );
          }
        } else {
          // 阶段4：收缩铁链将整个房间连同里面的“将（帅）”一起轰然挤爆！
          const burstP = Math.min(1, (p - 0.79) / 0.16);
          roomGroup.visible = false;
          chainsWrapper.visible = false;
          radialChainsGroup.visible = false;

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
            vfxContext.setCameraOverride(new THREE.Vector3(0, 1.05, 0), 14.2, 0.72, Math.PI * 1.95);
          }
        }
      });
    }

    // =========================================================================
    // 7. 侧面虎 (Side Tiger):
    // 高精度猛虎建模 + 伏地蓄力、腾跃舒展、踩踏棋子弹性屈膝压缩借力、凌空张爪交叉扑杀的流畅生动动作！
    // =========================================================================
    if (vfxType === 'side_tiger') {
      const cgScene = this.createCGSceneEnvironment('cg_grassland', group);
      const stepItem1 = findAttackerItemByType('n', null) || attackerItems[0];
      const stepItem2 = findAttackerItemByType('r', stepItem1) || attackerItems[1] || stepItem1;
      const orig1 = stepItem1?.basePos ? stepItem1.basePos.clone() : new THREE.Vector3(kPos.x + 2.4, 0, kPos.z + 2.2);
      const orig2 = stepItem2?.basePos ? stepItem2.basePos.clone() : new THREE.Vector3(kPos.x + 1.8, 0, kPos.z + 1.0);

      const sideSign = orig1.x >= kPos.x ? 1 : -1;
      const dirSign = kPos.z < 0 ? -1 : 1;

      const tigerStartGround = new THREE.Vector3(kPos.x + sideSign * 4.6, 0.05, kPos.z - dirSign * 3.9);
      const padPos1 = new THREE.Vector3(kPos.x + sideSign * 3.15, 1.38, kPos.z - dirSign * 2.55);
      const padPos2 = new THREE.Vector3(kPos.x + sideSign * 1.75, 2.42, kPos.z - dirSign * 1.25);
      const pounceTarget = new THREE.Vector3(kPos.x + sideSign * 0.22, 0.08, kPos.z - dirSign * 0.22);

      const stepRipples = [padPos1, padPos2].map((pos) => {
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.86, 36), goldGlowMat.clone());
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
      tiger3D.scale.setScalar(1.24);
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

      const tigerImpact = create3DCannonExplosion(kPos, 1.22);

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.22, p) * (1 - smoothstep(0.58, 0.76, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        const flyInT = smoothstep(0.0, 0.20, p);
        const flyBackT = smoothstep(0.66, 0.88, p);

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
          if (distStep >= -0.02 && distStep <= 0.15) {
            const st = (distStep + 0.02) / 0.17;
            const env = Math.sin(st * Math.PI);
            dipY = -env * 0.48;
            tiltX = Math.sin(st * Math.PI * 3) * 0.30 * (1 - st);
            squash = 1 + env * 0.26;
            glow = env * 0.95;
            rippleMesh.visible = true;
            rippleMesh.position.set(cur.x, cur.y + dipY + 0.15, cur.z);
            rippleMesh.scale.setScalar((0.7 + st * 2.4) * fade);
            rippleMesh.material.opacity = (1 - st) * 0.88 * fade;
          } else {
            rippleMesh.visible = false;
          }

          const baseSc = THREE.MathUtils.lerp(1.0, 1.50, flyInT * (1 - flyBackT));
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

        updateSteppingPiece(stepItem1, orig1, padPos1, 0.34, stepRipples[0], 0);
        if (stepItem2 !== stepItem1) {
          updateSteppingPiece(stepItem2, orig2, padPos2, 0.52, stepRipples[1], 1);
        }

        const padTop1 = new THREE.Vector3(padPos1.x, padPos1.y + 0.22, padPos1.z);
        const padTop2 = new THREE.Vector3(padPos2.x, padPos2.y + 0.22, padPos2.z);
        let tigerPos = new THREE.Vector3();
        let lookPt = kPos;

        if (p < 0.18) {
          // 1. 伏地蓄力：猛虎压低前胸、屈膝弓背、张口咆哮
          const prep = p / 0.18;
          tigerPos.copy(tigerStartGround);
          lookPt = padPos1;
          tiger3D.userData.animatePounce(p * 5, prep, 0, 'crouch');
        } else if (p < 0.34) {
          // 2. 第一跃：从地面弹射跃上第一枚踏板棋子
          const t1 = (p - 0.18) / 0.16;
          tigerPos.lerpVectors(tigerStartGround, padTop1, t1);
          tigerPos.y += Math.sin(t1 * Math.PI) * 1.28;
          lookPt = padPos1;
          tiger3D.userData.animatePounce(p * 6, t1, 0, 'leap');
        } else if (p < 0.39) {
          // 3. 第一枚踏板缓冲借力：四肢屈膝下压踏板并瞬间蓄力弹起
          const c1 = (p - 0.34) / 0.05;
          tigerPos.copy(padTop1);
          tigerPos.y -= Math.sin(c1 * Math.PI) * 0.35;
          lookPt = padPos2;
          tiger3D.userData.animatePounce(p * 6, c1, 0, 'step_compress');
        } else if (p < 0.52) {
          // 4. 第二跃：从第一枚踏板腾空跃上第二枚踏板棋子
          const t2 = (p - 0.39) / 0.13;
          tigerPos.lerpVectors(padTop1, padTop2, t2);
          tigerPos.y += Math.sin(t2 * Math.PI) * 1.35;
          lookPt = padPos2;
          tiger3D.userData.animatePounce(p * 6, t2, 0, 'leap');
        } else if (p < 0.57) {
          // 5. 第二枚踏板缓冲借力：深蹲蓄势对准敌方“将（帅）”
          const c2 = (p - 0.52) / 0.05;
          tigerPos.copy(padTop2);
          tigerPos.y -= Math.sin(c2 * Math.PI) * 0.38;
          lookPt = kPos;
          tiger3D.userData.animatePounce(p * 6, c2, 0, 'step_compress');
        } else {
          // 6. 凌空猛虎扑杀：高高跃起舒展虎躯，下落时双前爪大张交叉挥击拍碎“将（帅）”！
          const t3 = Math.min(1, (p - 0.57) / 0.21);
          const ease3 = 1 - Math.pow(1 - t3, 2.2);
          tigerPos.lerpVectors(padTop2, pounceTarget, ease3);
          tigerPos.y += Math.sin(t3 * Math.PI) * 2.05;
          lookPt = kPos;
          const swipe = Math.max(0, (p - 0.70) / 0.24);
          tiger3D.userData.animatePounce(p * 6.5, t3, swipe, 'pounce_swipe');
        }

        const tigerFade = 1 - smoothstep(0.90, 0.99, p);
        tiger3D.visible = tigerFade > 0.02;
        tiger3D.position.copy(tigerPos);
        this.faceTargetHorizontally(tiger3D, lookPt.x, lookPt.z);
        tiger3D.scale.setScalar(1.25 * tigerFade * fade);

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
    // 骑马时神将手持武器【刀刃严格朝向对手】（非横拿），
    // 【战马奔跑动作幅度大幅增强】（四蹄大跨步腾跃起伏+身体俯仰摇摆），
    // 【投掷出去的武器旋转方向反转修正】为顺着飞行方向的自然正手前旋刀轮！
    // =========================================================================
    if (vfxType === 'octagon_horse') {
      const cgScene = this.createCGSceneEnvironment('cg_grassland', group);
      const horseItem = findAttackerItemByType('n', null) || attackerItems[0];
      const genItem = findAttackerItemByType('r', horseItem) || attackerItems.find((it) => it !== horseItem) || horseItem;
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

      const thrownSpear = new THREE.Group();
      const spearSpinPivot = new THREE.Group();
      thrownSpear.add(spearSpinPivot);

      const sShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.068, 2.65, 14), goldMat);
      const sTassel = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.46, 12), crimsonLacquerMat);
      sTassel.position.y = 0.88;
      const sTip = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.88, 6), goldGlowMat.clone());
      sTip.position.y = 1.54;
      [-1, 1].forEach((s) => {
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
          octagonHorse.scale.setScalar(1.14 * mScale);
          octagonHorse.userData.animateGallop(p * 6.0, 0.42, 1.45);

          riderGeneral.visible = mScale > 0.02;
          riderGeneral.position.set(hp.x, hp.y + 0.86, hp.z - 0.05);
          riderGeneral.scale.setScalar(0.76 * mScale);
          if (riderGeneral.userData.swordGroup) riderGeneral.userData.swordGroup.visible = true;
          riderGeneral.userData.swordArmPivot.rotation.set(-0.85, 0, 0);
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
          const rx = 3.95;
          const rz = 3.05;
          const gx = Math.cos(lapAngle) * rx;
          const gz = Math.sin(lapAngle) * rz;
          const nextAngle = lapAngle + 0.14;
          const tx = Math.cos(nextAngle) * rx;
          const tz = Math.sin(nextAngle) * rz;
          // 战马奔跑动作幅度大幅增强：高腾跃起伏 + 大跨步四蹄飞驰 (strideAmp = 1.58)
          const gallopPhase = lapT * Math.PI * 10;
          const gallopBounce = Math.abs(Math.sin(gallopPhase)) * 0.48;
          const gallopPitchRear = Math.sin(gallopPhase) * 0.42;

          octagonHorse.visible = true;
          octagonHorse.position.set(gx, 0.05 + gallopBounce, gz);
          this.faceTargetHorizontally(octagonHorse, tx, tz);
          octagonHorse.userData.animateGallop(p * 7.2, 0.22 + gallopPitchRear, 1.58);
          octagonHorse.scale.setScalar(1.18 * fade);

          riderGeneral.visible = true;
          riderGeneral.position.set(gx, 0.94 + gallopBounce, gz);
          this.faceTargetHorizontally(riderGeneral, tx, tz);
          riderGeneral.scale.setScalar(0.78 * fade);
          if (riderGeneral.userData.swordGroup) riderGeneral.userData.swordGroup.visible = true;
          // 骑马时巨剑保持在纵向劈砍平面内挥动，刀刃正对前方，绝不横拿！
          riderGeneral.userData.swordArmPivot.rotation.set(-0.92 + Math.sin(gallopPhase) * 0.42, 0, 0);
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
          hPos.y = 0.05 + Math.sin(actionT * Math.PI) * 2.15;
          octagonHorse.visible = settleT < 0.92;
          octagonHorse.position.copy(hPos);
          this.faceTargetHorizontally(octagonHorse, kPos.x, kPos.z);
          octagonHorse.userData.animateGallop(p * 6.5, Math.sin(actionT * Math.PI) * 0.78, 1.50);
          octagonHorse.scale.setScalar(1.14 * (1 - settleT) * fade);

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
          riderGeneral.userData.swordArmPivot.rotation.set(THREE.MathUtils.lerp(-1.55, 0.95, Math.min(1, actionT * 1.8)), 0, 0);
          if (riderGeneral.userData.swordGroup) {
            riderGeneral.userData.swordGroup.visible = false;
          }

          // 修正投掷武器的旋转方向：反转 spinPivot 的旋转符号为 +actionT * Math.PI * 8（顺着投掷轨迹正向飞旋！）
          thrownSpear.visible = settleT < 0.96;
          const spearStart = new THREE.Vector3(launchStart.x, 2.65, launchStart.z);
          const spearEnd = new THREE.Vector3(kPos.x, 0.95, kPos.z);
          thrownSpear.position.lerpVectors(spearStart, spearEnd, actionT);
          thrownSpear.position.y += Math.sin(actionT * Math.PI) * 1.65;

          const angleToKing = Math.atan2(kPos.x - spearStart.x, kPos.z - spearStart.z);
          if (actionT < 0.96) {
            thrownSpear.rotation.set(0.18, angleToKing + Math.PI * 0.5, 0);
            spearSpinPivot.rotation.set(0, 0, actionT * Math.PI * 8);
            spearWheelHalo.visible = true;
            spearWheelHalo.material.opacity = Math.sin(actionT * Math.PI) * 0.68 * fade;
          } else {
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
    // 修复海面图层优先级：海面 renderOrder = -12 并开启硬件深度遮挡，
    // 水上鱼钩、鱼线、跃出战马、浪花与棋子全部设置高优先级 renderOrder >= 15，
    // 确保水上部分 100% 清晰显示绝不被海水错误遮挡，而沉入水下 y < 0 的部分被海面自然遮蔽！
    // =========================================================================
    if (vfxType === 'fishing_horse') {
      const cgScene = this.createCGSceneEnvironment('cg_ocean_day', group);
      const horseItem = findAttackerItemByType('n', null) || attackerItems[0];
      const horseOrigin = horseItem?.basePos ? horseItem.basePos.clone() : new THREE.Vector3(cPos.x, 0, cPos.z);

      const hookRig = new THREE.Group();
      hookRig.renderOrder = 18;
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
      hookRig.traverse((o) => { if (o.isMesh) o.renderOrder = 18; });

      const lineMat = goldGlowMat.clone();
      lineMat.depthTest = true;
      const upperFishingLine = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.028, 1.0, 10),
        lineMat
      );
      upperFishingLine.renderOrder = 20;
      group.add(upperFishingLine);

      const waterEntryRing = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.68, 36), cyanGlowMat.clone());
      waterEntryRing.rotation.x = -Math.PI / 2;
      waterEntryRing.position.set(0, 0.04, 0);
      waterEntryRing.renderOrder = 16;
      group.add(waterEntryRing);

      const splashDrops = Array.from({ length: 18 }, (_, i) => {
        const ang = (i / 18) * Math.PI * 2;
        const drop = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), i % 2 === 0 ? jadeIceMat : goldGlowMat.clone());
        drop.visible = false;
        drop.renderOrder = 18;
        group.add(drop);
        return { drop, ang, spd: 1.5 + (i % 4) * 0.45, lift: 1.4 + (i % 3) * 0.5 };
      });

      // 使用高不透明度的白玉金甲材质制作跃出海面的 3D 战马，并赋予 renderOrder = 18，彻底杜绝被海面半透明层遮挡！
      const emergedHorseBodyMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        emissive: 0x0284c7,
        emissiveIntensity: 0.26,
        metalness: 0.35,
        roughness: 0.20
      });
      const emergedWarHorse = this.createArticulated3DWarHorse(emergedHorseBodyMat, goldMat, goldGlowMat);
      emergedWarHorse.visible = false;
      emergedWarHorse.renderOrder = 18;
      emergedWarHorse.traverse((o) => { if (o.isMesh) o.renderOrder = 18; });
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
          const hy = THREE.MathUtils.lerp(0.08, 1.45, focusT) + Math.sin(p * 18) * 0.08;
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

          const lineBottomY = Math.max(0.05, hy + 0.95);
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
            if (hy > 0.05) {
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
          if (hookY > 0.15) {
            hookRig.visible = true;
            hookRig.position.set(0, hookY, 0);
          } else {
            hookRig.visible = false;
          }

          const lineTwitchX = p > 0.42 ? Math.sin(p * 85) * 0.12 : 0;
          const lineTwitchZ = p > 0.42 ? Math.cos(p * 78) * 0.12 : 0;
          const visibleTopY = 5.2;
          upperFishingLine.visible = true;
          upperFishingLine.scale.set(1, visibleTopY, 1);
          upperFishingLine.position.set(lineTwitchX, visibleTopY * 0.5 + 0.02, lineTwitchZ);

          const ripplePulse = 1.0 + ((p - 0.28) / 0.26) * 2.8;
          waterEntryRing.scale.setScalar(ripplePulse * fade);
          waterEntryRing.material.opacity = (0.75 - ((p - 0.28) / 0.26) * 0.35) * fade;

          const splashP = Math.min(1, (p - 0.31) / 0.18);
          splashDrops.forEach(({ drop, ang, spd, lift }) => {
            if (splashP > 0 && splashP < 1) {
              drop.visible = true;
              const r = 0.3 + splashP * spd;
              drop.position.set(Math.cos(ang) * r, Math.max(0.05, Math.sin(splashP * Math.PI) * lift), Math.sin(ang) * r);
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

          if (emergeY > 0.04) {
            emergedWarHorse.visible = true;
            emergedWarHorse.position.set(0, emergeY, 0);
            this.faceTargetHorizontally(emergedWarHorse, kPos.x, kPos.z);
            emergedWarHorse.userData.animateGallop(p * 5.2, Math.sin(pullT * Math.PI) * 0.85, 1.35);
            emergedWarHorse.scale.setScalar(1.18 * Math.min(1, emergeY / 0.5 + 0.35) * fade);
          } else {
            emergedWarHorse.visible = false;
          }

          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            if (emergeY > 0.04) {
              this.setPiece3DPose(
                kingItem.mesh,
                0,
                emergeY + 0.42,
                -0.38,
                Math.sin(p * 42) * 0.35,
                p * Math.PI * 3,
                Math.cos(p * 38) * 0.35,
                1.38,
                1.0,
                0.75,
                0xef4444
              );
            } else {
              kingItem.mesh.visible = false;
            }
          }

          const hookCurrentY = Math.max(0.10, emergeY + 1.25);
          hookRig.visible = emergeY > -0.15;
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
              drop.position.set(Math.cos(ang) * r, Math.max(0.05, Math.sin(burstP * Math.PI) * lift * 1.55), Math.sin(ang) * r);
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
    // 1. 棋盘上的“马”直接从原位高高跳跃至远端山巅（取代从屏幕下方升起），落地变身建模马；
    // 2. 太阳位置上的“车”【不旋转】，定格正面缓缓浮现出来，浮现完成后变身为建模车；
    // 3. 建模车绕过建模马冲向前景石台上的“将（帅）”，建模马随后直冲过去；
    // 4. 修复前景“将（帅）”的图层与位置遮挡（置于山道前方高台 z=2.35, y=0.16 并微倾朝向镜头），且全流程运镜与场景切换丝滑衔接！
    // =========================================================================
    if (vfxType === 'standing_horse_chariot') {
      const cgScene = this.createCGSceneEnvironment('cg_sunset_mountain', group);
      const horseItem = findAttackerItemByType('n', null) || attackerItems[0];
      const rookItem = findAttackerItemByType('r', horseItem) || attackerItems.find((it) => it !== horseItem) || horseItem;
      const horseOrigin = horseItem?.basePos ? horseItem.basePos.clone() : new THREE.Vector3(cPos.x, 0, cPos.z);
      const rookOrigin = rookItem?.basePos ? rookItem.basePos.clone() : new THREE.Vector3(rPos.x, 0, rPos.z);

      const mountainPeakPos = new THREE.Vector3(0, 2.32, -5.8);
      const sunCenterPos = new THREE.Vector3(0, 4.15, -8.5);
      // 将受击“将（帅）”置于山道前方开阔高台 (0, 0.18, 2.35)，彻底避开远端山体 (-5.8) 与斜坡 (-3.35) 的几何遮挡！
      const targetKingStagePos = new THREE.Vector3(0, 0.18, 2.35);

      // 前景受击“将（帅）”脚下的玄铁鎏金点将圆台，凸显前景“将（帅）”层次
      const kingForegroundPedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.35, 0.16, 32),
        goldMat
      );
      kingForegroundPedestal.position.set(0, 0.08, 2.35);
      kingForegroundPedestal.renderOrder = 10;
      group.add(kingForegroundPedestal);

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
        new THREE.Vector3(1.25, 1.15, -2.0),
        new THREE.Vector3(0.32, 0.16, 1.85)
      ]);

      const horseDirectCurve = new THREE.CatmullRomCurve3([
        mountainPeakPos.clone(),
        new THREE.Vector3(0, 1.45, -2.4),
        new THREE.Vector3(-0.32, 0.16, 1.80)
      ]);

      const strikeExplosion = create3DCannonExplosion(targetKingStagePos, 1.32);

      return wrapUpdater((p, dt, fade = 1) => {
        // 平滑自然的场景渐入与渐出权重
        const cgWeight = smoothstep(0.0, 0.22, p) * (1 - smoothstep(0.80, 0.96, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        kingForegroundPedestal.visible = cgWeight > 0.05;
        kingForegroundPedestal.scale.setScalar(cgWeight);

        // 全程确保“将（帅）”在前景高台清晰可见（朝向镜头微倾 0.32 rad），并在完全切回棋盘阶段 (0.82 -> 0.96) 平滑归位！
        if (kingItem?.mesh) {
          kingItem.customDriven = true;
          const kToStage = smoothstep(0.0, 0.20, p);
          const kToBoard = smoothstep(0.82, 0.96, p);
          const stageWeight = kToStage * (1 - kToBoard);
          const curK = new THREE.Vector3().lerpVectors(kPos, targetKingStagePos, stageWeight);
          curK.y += Math.sin(kToStage * Math.PI) * (p < 0.22 ? 1.15 : 0);

          if (p >= 0.72 && p < 0.84) {
            applyKingHitFeedback((p - 0.72) / 0.12, 'collision', 0, 1, targetKingStagePos, 1.48);
          } else {
            this.setPiece3DPose(
              kingItem.mesh,
              curK.x,
              curK.y,
              curK.z,
              stageWeight * 0.32,
              0,
              0,
              THREE.MathUtils.lerp(1.0, 1.48, stageWeight),
              1.0,
              stageWeight * 0.55,
              0xef4444
            );
          }
        }

        if (p < 0.26) {
          // 1. 棋盘上的“马”从棋盘原位置 horseOrigin 沿高抛物线跳跃至远端山巅 mountainPeakPos！
          const leapT = smoothstep(0.0, 0.22, p);
          const morphT = smoothstep(0.15, 0.26, p);
          const hp = new THREE.Vector3().lerpVectors(horseOrigin, mountainPeakPos, leapT);
          hp.y += Math.sin(leapT * Math.PI) * 2.65;

          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            this.setPiece3DPose(
              horseItem.mesh,
              hp.x,
              hp.y,
              hp.z,
              leapT * Math.PI * 2,
              0,
              0,
              THREE.MathUtils.lerp(1.0, 1.25, leapT),
              1 - smoothstep(0.2, 0.9, morphT),
              leapT * 0.75
            );
          }
          if (rookItem?.mesh && rookItem !== horseItem) {
            rookItem.customDriven = true;
            // 过渡初期“车”在原位渐隐，准备在太阳中心浮现
            this.setPiece3DPose(rookItem.mesh, rookOrigin.x, 0, rookOrigin.z, 0, 0, 0, 1.0, 1 - leapT, 0);
          }

          horseMorphAura.update(hp, morphT, fade);
          const hScale = 1.08 * smoothstep(0.15, 0.95, morphT) * fade;
          horse3D.visible = hScale > 0.02;
          horse3D.position.copy(mountainPeakPos);
          this.faceTargetHorizontally(horse3D, targetKingStagePos.x, targetKingStagePos.z);
          horse3D.userData.animateGallop(p * 4.2, 0.48, 1.25);
          horse3D.scale.setScalar(hScale);
          chariot3D.visible = false;
        } else if (p < 0.48) {
          // 2. 建模马屹立山巅，背景血色残阳位置的“车”棋子【不旋转】，保持端正姿态慢慢浮现出来！
          horseMorphAura.update(mountainPeakPos, 0, 0);
          if (horseItem?.mesh) { horseItem.customDriven = true; horseItem.mesh.visible = false; }

          horse3D.visible = true;
          horse3D.position.copy(mountainPeakPos);
          horse3D.userData.animateGallop(p * 3.8, 0.35 + Math.sin(p * 12) * 0.15, 1.2);
          horse3D.scale.setScalar(1.08 * fade);

          const emergeT = smoothstep(0.26, 0.46, p);
          if (rookItem?.mesh) {
            rookItem.customDriven = true;
            // rx = Math.PI / 2, ry = 0, rz = 0（零旋转！文字面正对镜头，原地缓缓浮现）
            this.setPiece3DPose(
              rookItem.mesh,
              sunCenterPos.x,
              sunCenterPos.y,
              sunCenterPos.z + 0.32,
              Math.PI / 2,
              0,
              0,
              3.75,
              emergeT,
              emergeT * 0.68,
              0xef4444
            );
          }
          chariot3D.visible = false;
        } else if (p < 0.84) {
          // 3. “车”浮现完成后变身为建模车，绕过山巅建模马冲向前景“将（帅）”，建模马随后直冲过去！
          const morphRookT = smoothstep(0.48, 0.56, p);
          rookMorphAura.update(new THREE.Vector3(0, 3.35, -7.8), morphRookT, fade);

          if (rookItem?.mesh) {
            rookItem.customDriven = true;
            this.setPiece3DPose(
              rookItem.mesh,
              sunCenterPos.x,
              sunCenterPos.y,
              sunCenterPos.z + 0.32,
              Math.PI / 2,
              0,
              0,
              3.75 * (1 - morphRookT * 0.35),
              1 - smoothstep(0.0, 0.85, morphRookT),
              0.8,
              0xef4444
            );
          }

          const chariotRushT = smoothstep(0.52, 0.74, p);
          const chPt = chariotBypassCurve.getPoint(chariotRushT);
          const chTan = chariotBypassCurve.getTangent(Math.min(0.96, chariotRushT));
          chariot3D.visible = true;
          chariot3D.position.copy(chPt);
          this.faceTargetHorizontally(chariot3D, chPt.x + chTan.x, chPt.z + chTan.z);
          chariot3D.userData.spinWheels(dt * 28, p * 6);
          chariot3D.scale.setScalar(1.18 * smoothstep(0.48, 0.55, p) * fade);

          const horseRushT = smoothstep(0.59, 0.77, p);
          const hPt = horseDirectCurve.getPoint(horseRushT);
          const hTan = horseDirectCurve.getTangent(Math.min(0.96, horseRushT));
          horse3D.visible = true;
          horse3D.position.copy(hPt);
          this.faceTargetHorizontally(horse3D, hPt.x + hTan.x, hPt.z + hTan.z);
          horse3D.userData.animateGallop(p * 6.2, horseRushT > 0.05 ? 0.28 : 0.55, 1.45);
          horse3D.scale.setScalar(1.12 * fade);

          if (p >= 0.72) {
            const hitP = (p - 0.72) / 0.14;
            strikeExplosion.update.call(this, hitP, fade, targetKingStagePos);
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

        // 全程连续 C1 平滑运镜：从棋盘平滑推向远山血日 -> 追随战车与战马下山冲向前景“将（帅）” -> 平滑回到终局棋盘！
        if (vfxContext?.setCameraOverride) {
          const toVista = smoothstep(0.0, 0.24, p);
          const toCharge = smoothstep(0.50, 0.74, p);
          const toBoard = smoothstep(0.82, 0.97, p);

          let camY = THREE.MathUtils.lerp(0.65, 2.55, toVista);
          camY = THREE.MathUtils.lerp(camY, 0.72, toCharge);
          camY = THREE.MathUtils.lerp(camY, 0.45, toBoard);

          let camZ = THREE.MathUtils.lerp(0.0, -3.6, toVista);
          camZ = THREE.MathUtils.lerp(camZ, 1.45, toCharge);
          camZ = THREE.MathUtils.lerp(camZ, 0.0, toBoard);

          let camRad = THREE.MathUtils.lerp(11.2, 12.6, toVista);
          camRad = THREE.MathUtils.lerp(camRad, 11.4, toCharge);
          camRad = THREE.MathUtils.lerp(camRad, 11.0, toBoard);

          let camPhi = THREE.MathUtils.lerp(0.86, 1.08, toVista);
          camPhi = THREE.MathUtils.lerp(camPhi, 0.84, toCharge);
          camPhi = THREE.MathUtils.lerp(camPhi, 0.88, toBoard);

          vfxContext.setCameraOverride(
            new THREE.Vector3(0, camY, camZ),
            camRad,
            camPhi,
            toCharge * (1 - toBoard) * 0.16
          );
        }
      });
    }

    // =========================================================================
    // 11. 双将 (Double Check):
    // 修复电脑宽屏分辨率下另一枚棋子掷出武器不在屏幕内的问题：
    // 动态计算双子与将帅的包络中心及跨度，两枚进攻棋子起跳时向舞台中心聚拢，
    // 并自适应拉宽俯视运镜半径与焦点中心，确保电脑 16:9/21:9 与手机端均能完整同屏看到双子掷出神兵！
    // =========================================================================
    if (vfxType === 'double_check') {
      const cgScene = this.createCGSceneEnvironment('cg_battlefield', group);
      const checkerItem0 = attackerItems[0] || null;
      const checkerItem1 = attackerItems[1] || attackerItems[0] || null;
      const origin0 = checkerItem0?.basePos ? checkerItem0.basePos.clone() : new THREE.Vector3(kPos.x - 3.0, 0, kPos.z + 2.2);
      const origin1 = checkerItem1?.basePos && checkerItem1 !== checkerItem0
        ? checkerItem1.basePos.clone()
        : new THREE.Vector3(kPos.x + 3.0, 0, kPos.z + 2.2);

      // 将两枚起跳掷武器的棋子向视野中心聚拢，确保无论原棋盘坐标跨度多大都在视野中央
      const stageThrowPos0 = new THREE.Vector3(
        THREE.MathUtils.lerp(origin0.x, -2.15, 0.45),
        0,
        THREE.MathUtils.lerp(origin0.z, 0.65, 0.55)
      );
      const stageThrowPos1 = new THREE.Vector3(
        THREE.MathUtils.lerp(origin1.x, 2.15, 0.45),
        0,
        THREE.MathUtils.lerp(origin1.z, 0.65, 0.55)
      );
      const midThrowCenter = new THREE.Vector3(
        (stageThrowPos0.x + stageThrowPos1.x + kPos.x) / 3,
        0,
        (stageThrowPos0.z + stageThrowPos1.z + kPos.z) / 3
      );
      const mergeApex = new THREE.Vector3(kPos.x * 0.5, 4.35, (midThrowCenter.z + kPos.z) * 0.5);

      const { weapon1, weapon2, greatsword } = this.createRefinedDivineWeaponPairAndGreatsword(
        goldMat,
        crimsonLacquerMat,
        darkIronMat,
        goldGlowMat,
        crimsonGlowMat
      );
      group.add(weapon1, weapon2, greatsword);
      greatsword.visible = false;

      // 飞行轨迹终点定在合体点左右两侧 (mergeApex.x ∓ 0.86)，方便在飞行后段调整好竖直平行姿态后再开始机械拼装！
      const alignPos0 = new THREE.Vector3(mergeApex.x - 0.86, mergeApex.y + 0.35, mergeApex.z);
      const alignPos1 = new THREE.Vector3(mergeApex.x + 0.86, mergeApex.y + 0.35, mergeApex.z);
      const throwCurve0 = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(stageThrowPos0.x, 1.05, stageThrowPos0.z),
        new THREE.Vector3(mergeApex.x - 2.45, 5.05, (stageThrowPos0.z + mergeApex.z) * 0.5),
        alignPos0.clone()
      );
      const throwCurve1 = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(stageThrowPos1.x, 1.05, stageThrowPos1.z),
        new THREE.Vector3(mergeApex.x + 2.45, 5.05, (stageThrowPos1.z + mergeApex.z) * 0.5),
        alignPos1.clone()
      );

      const fusionAura = this.createSmoothMorphAura(group, 0xfacc15);
      const megaExplosion = create3DCannonExplosion(kPos, 1.45);
      let clampShakeTriggered = false;
      let lockShakeTriggered = false;

      return wrapUpdater((p, dt, fade = 1) => {
        const cgWeight = smoothstep(0.02, 0.22, p) * (1 - smoothstep(0.62, 0.80, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        [
          { item: checkerItem0, orig: origin0, stageP: stageThrowPos0, sign: 1 },
          { item: checkerItem1, orig: origin1, stageP: stageThrowPos1, sign: -1 }
        ].forEach(({ item, orig, stageP, sign }, idx) => {
          if (!item?.mesh || (idx === 1 && checkerItem1 === checkerItem0)) return;
          item.customDriven = true;
          const gatherWeight = p < 0.33 ? Math.sin((p / 0.33) * Math.PI) : 0;
          const curX = THREE.MathUtils.lerp(orig.x, stageP.x, gatherWeight);
          const curZ = THREE.MathUtils.lerp(orig.z, stageP.z, gatherWeight);
          const jumpArc = gatherWeight * 1.45;
          const sc = 1.0 + gatherWeight * 0.42;
          this.setPiece3DPose(
            item.mesh,
            curX,
            jumpArc,
            curZ,
            jumpArc * 0.35 * sign,
            p < 0.33 ? (p / 0.33) * Math.PI * 2 * sign : 0,
            0,
            sc,
            1.0,
            gatherWeight * 0.55
          );
        });

        const ud = greatsword.userData || {};

        if (p < 0.33) {
          // ===================================================================
          // 阶段 1 (0.00 -> 0.33): 双武器破空飞升 + 空中飞行途中减速调姿对齐
          // - 0.00 -> 0.20: 高速刀轮旋转飞向高空
          // - 0.20 -> 0.33: 在空中滑行到位的同时，旋转平滑制动，刀尖垂直朝下 (-Y)、枪戟躯干完全竖直平行对齐！
          // ===================================================================
          clampShakeTriggered = false;
          lockShakeTriggered = false;
          const flightT = smoothstep(0.02, 0.33, p);
          const alignT = smoothstep(0.19, 0.32, p); // 飞行后半段调姿对齐进度

          weapon1.visible = true;
          weapon2.visible = true;

          // 在 0.26 -> 0.33 提前浮现校准导轨光环，标示两把武器已完成空中姿态校准
          greatsword.visible = p >= 0.25;
          if (greatsword.visible) {
            greatsword.position.set(mergeApex.x, mergeApex.y + 0.35, mergeApex.z);
            greatsword.rotation.set(0, 0, 0);
            greatsword.scale.setScalar(1.18 * fade);
            if (ud.coreSpineGroup) ud.coreSpineGroup.visible = false;
            if (ud.leftBladeEdgeGroup) ud.leftBladeEdgeGroup.visible = false;
            if (ud.rightBladeEdgeGroup) ud.rightBladeEdgeGroup.visible = false;
            if (ud.leftGuardClampGroup) ud.leftGuardClampGroup.visible = false;
            if (ud.rightGuardClampGroup) ud.rightGuardClampGroup.visible = false;
            if (ud.leftWingArrayGroup) ud.leftWingArrayGroup.visible = false;
            if (ud.rightWingArrayGroup) ud.rightWingArrayGroup.visible = false;
            if (ud.hiltColumnGroup) ud.hiltColumnGroup.visible = false;
            if (ud.pommelCrownGroup) ud.pommelCrownGroup.visible = false;
            if (ud.swordHaloRing) ud.swordHaloRing.visible = false;
            if (ud.dockingRingsGroup) {
              ud.dockingRingsGroup.visible = true;
              const ringAppear = smoothstep(0.25, 0.33, p);
              ud.dockingRingsGroup.scale.set(1.25 - ringAppear * 0.20, 1.0, 1.25 - ringAppear * 0.20);
              ud.dockingRingsGroup.rotation.y += dt * 5.0;
            }
          }

          // 计算旋转角度：前段高速旋转，后段平滑制动锁定在 Math.PI (使原本 +Y 的枪尖/戟尖精准朝向正下方 -Y！)
          const spinPhase = flightT < 0.62
            ? (flightT / 0.62) * 0.82
            : 0.82 + (1 - Math.pow(1 - (flightT - 0.62) / 0.38, 3)) * 0.18;
          const targetSpinAngle = spinPhase * Math.PI * 5.0; // 5 * PI 同余于 PI (朝向正下方)

          // 外层姿态：飞行初期略带倾角，随后在 alignT 中完全校准为竖直平行姿态 (0, 0, 0)
          const tiltX = THREE.MathUtils.lerp(0.32, 0.0, alignT);
          const tiltY = THREE.MathUtils.lerp(0.38, 0.0, alignT);
          const tiltZ = THREE.MathUtils.lerp(0.24, 0.0, alignT);

          weapon1.position.copy(throwCurve0.getPoint(flightT));
          weapon1.rotation.set(tiltX, tiltY, -tiltZ);
          weapon1.userData.spinPivot.rotation.set(0, 0, -targetSpinAngle);
          weapon1.userData.wheelHalo.material.opacity = (1 - alignT * 0.88) * Math.sin(Math.min(1, flightT * 1.4) * Math.PI) * 0.72 * fade;
          weapon1.scale.setScalar(THREE.MathUtils.lerp(0.90, 1.15, flightT) * fade);

          weapon2.position.copy(throwCurve1.getPoint(flightT));
          weapon2.rotation.set(tiltX, -tiltY, tiltZ);
          weapon2.userData.spinPivot.rotation.set(0, 0, targetSpinAngle);
          weapon2.userData.wheelHalo.material.opacity = (1 - alignT * 0.88) * Math.sin(Math.min(1, flightT * 1.4) * Math.PI) * 0.72 * fade;
          weapon2.scale.setScalar(THREE.MathUtils.lerp(0.90, 1.15, flightT) * fade);

          fusionAura.update(
            new THREE.Vector3(mergeApex.x, mergeApex.y + 0.35, mergeApex.z),
            smoothstep(0.24, 0.33, p) * 0.38,
            fade
          );

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(
                THREE.MathUtils.lerp(midThrowCenter.x, mergeApex.x, flightT),
                THREE.MathUtils.lerp(1.1, mergeApex.y + 0.35, flightT),
                THREE.MathUtils.lerp(midThrowCenter.z, mergeApex.z, flightT)
              ),
              THREE.MathUtils.lerp(14.6, 12.2, alignT),
              THREE.MathUtils.lerp(0.76, 0.88, alignT),
              flightT * 0.18
            );
          }
        } else if (p < 0.61) {
          // ===================================================================
          // 阶段 2 (0.33 -> 0.61): 空中多部件机械拼装动画（绝非直接变身！）
          // 两把已校准为竖直朝下姿态的武器保留在画面中，向内平移对接为巨剑左右龙凤双锋轨，
          // 同时中央脊骨剑芯、左右外刃翼、玄铁护手卡扣、龙凤六翼、剑柄与帝王剑首依次机械滑入锁死！
          // ===================================================================
          const assembleT = (p - 0.33) / 0.28;
          const swordPos = new THREE.Vector3().lerpVectors(
            new THREE.Vector3(mergeApex.x, mergeApex.y + 0.35, mergeApex.z),
            new THREE.Vector3(kPos.x, mergeApex.y + 0.65, kPos.z),
            smoothstep(0.0, 1.0, assembleT)
          );

          // Step 1 (0.00 -> 0.38): 双武器保持竖直朝下姿态，从左右 ∓0.86 向内平滑靠拢对接到巨剑左右剑脊 ∓0.26！
          const railDockT = smoothstep(0.00, 0.38, assembleT);
          const railOffset = THREE.MathUtils.lerp(0.86, 0.26, railDockT);
          weapon1.visible = true;
          weapon2.visible = true;
          weapon1.position.set(swordPos.x - railOffset, swordPos.y + 0.32, swordPos.z);
          weapon2.position.set(swordPos.x + railOffset, swordPos.y + 0.32, swordPos.z);
          weapon1.rotation.set(0, 0, 0);
          weapon2.rotation.set(0, 0, 0);
          weapon1.userData.spinPivot.rotation.set(0, 0, -Math.PI);
          weapon2.userData.spinPivot.rotation.set(0, 0, Math.PI);
          weapon1.userData.wheelHalo.material.opacity = 0;
          weapon2.userData.wheelHalo.material.opacity = 0;
          weapon1.scale.setScalar(1.12 * fade);
          weapon2.scale.setScalar(1.12 * fade);

          greatsword.visible = true;
          greatsword.position.copy(swordPos);
          greatsword.rotation.set(0, 0, 0);
          greatsword.scale.setScalar(1.22 * fade);

          // 1) 中央脊骨剑芯 (0.00 -> 0.36): 从上方 y=+2.2 垂直插入双武器正中央
          const spineT = smoothstep(0.00, 0.36, assembleT);
          if (ud.coreSpineGroup) {
            ud.coreSpineGroup.visible = true;
            ud.coreSpineGroup.position.set(0, (1 - spineT) * 2.25, 0);
            ud.coreSpineGroup.scale.set(1, 0.35 + spineT * 0.65, 1);
          }

          // 2) 左右黄金巨剑外刃翼 (0.18 -> 0.56): 从两侧 x=∓1.15 横向滑入包覆锁定双武器
          const bladeClampT = smoothstep(0.18, 0.56, assembleT);
          if (ud.leftBladeEdgeGroup && ud.rightBladeEdgeGroup) {
            ud.leftBladeEdgeGroup.visible = assembleT >= 0.14;
            ud.rightBladeEdgeGroup.visible = assembleT >= 0.14;
            ud.leftBladeEdgeGroup.position.set(-(1 - bladeClampT) * 1.15, (1 - bladeClampT) * 0.35, 0);
            ud.rightBladeEdgeGroup.position.set((1 - bladeClampT) * 1.15, (1 - bladeClampT) * 0.35, 0);
          }

          // 3) 左右玄铁朱漆护手卡扣 (0.30 -> 0.64): 从两侧 x=∓1.35 强力咬合锁死在枪戟柄部
          const guardClampT = smoothstep(0.30, 0.64, assembleT);
          if (ud.leftGuardClampGroup && ud.rightGuardClampGroup) {
            ud.leftGuardClampGroup.visible = assembleT >= 0.26;
            ud.rightGuardClampGroup.visible = assembleT >= 0.26;
            ud.leftGuardClampGroup.position.set(-(1 - guardClampT) * 1.35, 0, 0);
            ud.rightGuardClampGroup.position.set((1 - guardClampT) * 1.35, 0, 0);
          }
          if (assembleT >= 0.60 && !clampShakeTriggered) {
            clampShakeTriggered = true;
            this.cameraShake = Math.max(this.cameraShake || 0, 0.24);
          }

          // 4) 龙凤六翼护手扇形展开 (0.46 -> 0.80): 随护手咬合向两侧霸气展开
          const wingOpenT = smoothstep(0.46, 0.80, assembleT);
          if (ud.leftWingArrayGroup && ud.rightWingArrayGroup) {
            ud.leftWingArrayGroup.visible = assembleT >= 0.44;
            ud.rightWingArrayGroup.visible = assembleT >= 0.44;
            ud.leftWingArrayGroup.rotation.z = (1 - wingOpenT) * 1.22;
            ud.rightWingArrayGroup.rotation.z = -(1 - wingOpenT) * 1.22;
            ud.leftWingArrayGroup.scale.setScalar(0.3 + wingOpenT * 0.7);
            ud.rightWingArrayGroup.scale.setScalar(0.3 + wingOpenT * 0.7);
          }

          // 5) 剑柄柱体下压套接 (0.52 -> 0.84)
          const hiltLockT = smoothstep(0.52, 0.84, assembleT);
          if (ud.hiltColumnGroup) {
            ud.hiltColumnGroup.visible = assembleT >= 0.48;
            ud.hiltColumnGroup.position.set(0, (1 - hiltLockT) * 1.65, 0);
          }

          // 6) 帝王剑首冠冕旋紧封顶 (0.68 -> 0.94)
          const pommelLockT = smoothstep(0.68, 0.94, assembleT);
          if (ud.pommelCrownGroup) {
            ud.pommelCrownGroup.visible = assembleT >= 0.65;
            ud.pommelCrownGroup.position.set(0, (1 - pommelLockT) * 1.95, 0);
            ud.pommelCrownGroup.rotation.y = (1 - pommelLockT) * Math.PI * 3;
          }
          if (assembleT >= 0.90 && !lockShakeTriggered) {
            lockShakeTriggered = true;
            this.cameraShake = Math.max(this.cameraShake || 0, 0.28);
          }

          // 7) 校准导轨环收缩锁入剑身 + 剑柄大光轮展开
          if (ud.dockingRingsGroup) {
            ud.dockingRingsGroup.visible = assembleT < 0.88;
            const ringShrink = 1 - smoothstep(0.55, 0.88, assembleT) * 0.65;
            ud.dockingRingsGroup.scale.set(ringShrink, 1.0, ringShrink);
            ud.dockingRingsGroup.rotation.y += dt * 9.0;
          }
          if (ud.swordHaloRing) {
            ud.swordHaloRing.visible = assembleT >= 0.62;
            const haloPop = smoothstep(0.62, 0.95, assembleT);
            ud.swordHaloRing.scale.setScalar(0.25 + haloPop * 0.75);
            ud.swordHaloRing.rotation.z += dt * 9.0;
          }

          // 拼装关键节点迸发金芒光环（不遮挡机械拼装细节）
          const sparkPulse = Math.sin(assembleT * Math.PI) * 0.42;
          fusionAura.update(swordPos, sparkPulse, fade);

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(swordPos.x, swordPos.y + 0.65, swordPos.z),
              THREE.MathUtils.lerp(12.2, 10.6, assembleT),
              THREE.MathUtils.lerp(0.88, 0.96, assembleT),
              0.18 + assembleT * 0.20
            );
          }
        } else {
          // ===================================================================
          // 阶段 3 (0.61 -> 1.00): 拼装完成的轩辕巨剑（内嵌双武器）从高空雷霆坠落劈斩
          // ===================================================================
          fusionAura.update(mergeApex, 0, 0);

          const plungeT = smoothstep(0.61, 0.75, p);
          const swordFadeOut = 1 - smoothstep(0.92, 0.99, p);
          const curY = THREE.MathUtils.lerp(mergeApex.y + 0.65, 1.88, plungeT * plungeT);
          const vis = swordFadeOut > 0.02;

          greatsword.visible = vis;
          greatsword.position.set(kPos.x, curY, kPos.z);
          greatsword.rotation.set(0, 0, 0);
          greatsword.scale.setScalar(1.22 * swordFadeOut * fade);

          // 保持已拼装嵌入巨剑内部的双武器随巨剑一同下劈，体现真实拼装一体感
          weapon1.visible = vis;
          weapon2.visible = vis;
          weapon1.position.set(kPos.x - 0.26 * swordFadeOut, curY + 0.32 * swordFadeOut, kPos.z);
          weapon2.position.set(kPos.x + 0.26 * swordFadeOut, curY + 0.32 * swordFadeOut, kPos.z);
          weapon1.rotation.set(0, 0, 0);
          weapon2.rotation.set(0, 0, 0);
          weapon1.scale.setScalar(1.12 * swordFadeOut * fade);
          weapon2.scale.setScalar(1.12 * swordFadeOut * fade);

          if (ud.dockingRingsGroup) ud.dockingRingsGroup.visible = false;
          if (ud.swordHaloRing) {
            ud.swordHaloRing.visible = true;
            ud.swordHaloRing.rotation.z += dt * 10;
          }

          if (p >= 0.74) {
            const hitP = (p - 0.74) / 0.26;
            megaExplosion.update.call(this, hitP, fade, kPos);
            applyKingHitFeedback(hitP, 'heavy_smash', 0, 0);
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(kPos.x, THREE.MathUtils.lerp(4.4, 0.95, plungeT), kPos.z),
              11.2,
              0.90,
              THREE.MathUtils.lerp(0.38, 0.16, plungeT)
            );
          }
        }
      });
    }

    // =========================================================================
    // 12. 夹车炮 (Chariot Cannon Clamp):
    // 1. 杜绝“消失变身替换为第三模型”：由建模车与建模炮自身发生【机械变形】后直接【上下咬合拼装】在一起！
    //    - 建模车：顶部八角华盖向下机械折叠收起，两侧装甲护墙与四轮向外滑出扩宽底盘，升起顶部金色炮塔锁座；
    //    - 建模炮：下方四个炮轮向内向上折叠收起为炮塔基座，主炮管两侧滑出展开双联神威副炮管，从上方严丝合缝扣入战车顶座！
    // 2. 修复合体前建模车朝向摆反的问题：建模车与建模炮全程正向朝向敌方“将（帅）” (forwardYaw)；
    // 3. 修复短暂画面回退：公转轨道与拼装起点及运镜参数全程 C1 连续平滑插值，零跳变、零回退！
    // =========================================================================
    if (vfxType === 'chariot_cannon_clamp') {
      const cgScene = this.createCGSceneEnvironment('cg_battlefield', group);
      const rookItem = findAttackerItemByType('r', null) || attackerItems[0];
      const cannonItem = findAttackerItemByType('c', rookItem) || attackerItems.find((it) => it !== rookItem) || rookItem;
      const rookOrigin = rookItem?.basePos ? rookItem.basePos.clone() : new THREE.Vector3(kPos.x + 1.2, 0, kPos.z + 2.2);
      const cannonOrigin = cannonItem?.basePos ? cannonItem.basePos.clone() : new THREE.Vector3(kPos.x - 2.4, 0, kPos.z + 1.2);

      const dirSign = kPos.z < 0 ? -1 : 1;
      const fireGroundPos = new THREE.Vector3(kPos.x, 0.05, kPos.z - dirSign * 3.6);
      const orbitCenterXZ = new THREE.Vector3(kPos.x, 0, fireGroundPos.z * 0.65);
      const airAssemblyApex = new THREE.Vector3(orbitCenterXZ.x, 3.15, orbitCenterXZ.z);
      // 正对敌方“将（帅）”的统一正向朝向角，彻底杜绝建模车摆反！
      const forwardYaw = Math.atan2(kPos.x - airAssemblyApex.x, kPos.z - airAssemblyApex.z);

      const rookMorphAura = this.createSmoothMorphAura(group, 0xfbbf24);
      const cannonMorphAura = this.createSmoothMorphAura(group, 0xef4444);

      const chariot = this.createArticulated3DWarChariot(bronzeWoodMat, goldMat, darkIronMat, goldGlowMat);
      const cannon = this.createArticulated3DCannon(crimsonLacquerMat, goldMat, darkIronMat, crimsonGlowMat);
      chariot.visible = false;
      cannon.visible = false;
      group.add(chariot, cannon);

      // 机械咬合锁定时的金色齿轮卡扣光环（非变身球）
      const dockLockRing = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.045, 10, 32), goldGlowMat.clone());
      dockLockRing.rotation.x = Math.PI / 2;
      dockLockRing.visible = false;
      group.add(dockLockRing);

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
        const cgWeight = smoothstep(0.02, 0.24, p) * (1 - smoothstep(0.58, 0.76, p)) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);
        cgScene.setFade(cgWeight, dt, p);

        if (p < 0.36) {
          // 阶段1 (0.00 -> 0.36): “车”与“炮”棋子螺旋升空变身为建模车与建模炮，并平滑过渡到上下预备拼装位（零位置跳变！）
          const orbT = p / 0.36;
          const morphT = smoothstep(0.58, 0.95, orbT);
          const alignToDock = smoothstep(0.68, 1.0, orbT);
          const curY = THREE.MathUtils.lerp(0.15, airAssemblyApex.y, smoothstep(0.0, 0.88, orbT));
          const rad = THREE.MathUtils.lerp(2.45, 0.95, orbT);
          const ang = orbT * Math.PI * 3.0;

          const orbitRPt = new THREE.Vector3(
            orbitCenterXZ.x + Math.cos(ang) * rad,
            curY - 0.25,
            orbitCenterXZ.z + Math.sin(ang) * rad
          );
          const orbitCPt = new THREE.Vector3(
            orbitCenterXZ.x + Math.cos(ang + Math.PI) * rad,
            curY + 0.45,
            orbitCenterXZ.z + Math.sin(ang + Math.PI) * rad
          );

          // 预备拼装位：建模车在下 (apex.y - 0.35)，建模炮在上 (apex.y + 0.95)，两者 X/Z 已平滑对齐至 airAssemblyApex
          const preDockRPt = new THREE.Vector3(airAssemblyApex.x, airAssemblyApex.y - 0.35, airAssemblyApex.z);
          const preDockCPt = new THREE.Vector3(airAssemblyApex.x, airAssemblyApex.y + 0.95, airAssemblyApex.z);
          const rPt = new THREE.Vector3().lerpVectors(orbitRPt, preDockRPt, alignToDock);
          const cPt = new THREE.Vector3().lerpVectors(orbitCPt, preDockCPt, alignToDock);

          const pAlpha = 1 - smoothstep(0.18, 0.88, morphT);
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

          const mScale = smoothstep(0.12, 0.95, morphT) * 1.05 * fade;
          chariot.visible = mScale > 0.02;
          chariot.position.copy(rPt);
          // 建模车与建模炮统一朝向敌方“将（帅）”正前方 forwardYaw，绝不摆反！
          chariot.rotation.set(0, forwardYaw, 0);
          chariot.scale.setScalar(mScale);
          chariot.userData.spinWheels(dt * 20, p * 4);
          chariot.userData.setAssemblyTransform(0);

          cannon.visible = mScale > 0.02;
          cannon.position.copy(cPt);
          cannon.rotation.set(0, forwardYaw, 0);
          cannon.scale.setScalar(mScale);
          cannon.userData.setTurretTransform(0);

          dockLockRing.visible = false;
          superShell.visible = false;
        } else if (p < 0.56) {
          // 阶段2 (0.36 -> 0.56): 建模车与建模炮在空中进行【机械变形】并【上下咬合拼装】！
          if (rookItem?.mesh) { rookItem.customDriven = true; rookItem.mesh.visible = false; }
          if (cannonItem?.mesh) { cannonItem.customDriven = true; cannonItem.mesh.visible = false; }
          rookMorphAura.update(airAssemblyApex, 0, 0);
          cannonMorphAura.update(airAssemblyApex, 0, 0);

          // 0.36 -> 0.48: 机械变形展开（战车华盖收起、底盘加宽、升起锁座；火炮四轮折叠收起、两侧滑出双联副炮管）
          const mechMorphT = smoothstep(0.36, 0.47, p);
          // 0.44 -> 0.55: 上下物理对接咬合（变形后的重炮炮塔从上方垂直落下，严丝合缝扣入战车顶座！）
          const dockClampT = smoothstep(0.44, 0.55, p);

          chariot.visible = true;
          chariot.position.set(
            airAssemblyApex.x,
            THREE.MathUtils.lerp(airAssemblyApex.y - 0.35, airAssemblyApex.y, dockClampT),
            airAssemblyApex.z
          );
          chariot.rotation.set(0, forwardYaw, 0);
          chariot.scale.setScalar(1.08 * fade);
          chariot.userData.setAssemblyTransform(mechMorphT);
          chariot.userData.spinWheels(dt * 16, p * 5);

          cannon.visible = true;
          cannon.position.set(
            airAssemblyApex.x,
            THREE.MathUtils.lerp(airAssemblyApex.y + 0.95, airAssemblyApex.y + 0.58, dockClampT),
            airAssemblyApex.z
          );
          cannon.rotation.set(0, forwardYaw, 0);
          cannon.scale.setScalar(1.08 * fade);
          cannon.userData.setTurretTransform(mechMorphT);

          // 咬合瞬间激起金色机械锁扣光环
          if (dockClampT > 0.1 && dockClampT < 0.98) {
            dockLockRing.visible = true;
            dockLockRing.position.set(airAssemblyApex.x, airAssemblyApex.y + 0.72, airAssemblyApex.z);
            const env = Math.sin(dockClampT * Math.PI);
            dockLockRing.scale.setScalar((0.75 + dockClampT * 1.15) * fade);
            dockLockRing.material.opacity = env * 0.85 * fade;
            if (dockClampT > 0.78 && dockClampT < 0.88) {
              this.cameraShake = Math.max(this.cameraShake || 0, 0.22);
            }
          } else {
            dockLockRing.visible = false;
          }
          superShell.visible = false;
        } else {
          // 阶段3 (0.56 -> 1.00): 拼装完成的【战车+重炮合体战车】保持一体下落至棋盘开火位，三管齐射轰击“将（帅）”！
          dockLockRing.visible = false;
          const dropT = smoothstep(0.56, 0.72, p);
          const curUnitPos = new THREE.Vector3().lerpVectors(airAssemblyApex, fireGroundPos, dropT * dropT);
          const unitFadeOut = 1 - smoothstep(0.90, 0.99, p);

          let recoilZ = 0;
          let barrelPitch = -0.28;
          if (p >= 0.72) {
            const fireP = (p - 0.72) / 0.28;
            const shellFlight = Math.min(1, fireP / 0.42);
            const recoil = fireP < 0.28 ? Math.sin((fireP / 0.28) * Math.PI) * 0.45 : 0;
            recoilZ = -dirSign * recoil;
            barrelPitch = -0.28 - recoil * 0.45;

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
          } else {
            superShell.visible = false;
          }

          chariot.visible = unitFadeOut > 0.02;
          chariot.position.set(curUnitPos.x, curUnitPos.y, curUnitPos.z + recoilZ);
          chariot.rotation.set(0, forwardYaw, 0);
          chariot.scale.setScalar(1.08 * unitFadeOut * fade);
          chariot.userData.setAssemblyTransform(1.0);
          chariot.userData.spinWheels(dt * 12, p * 5);

          cannon.visible = unitFadeOut > 0.02;
          cannon.position.set(curUnitPos.x, curUnitPos.y + 0.58 * unitFadeOut, curUnitPos.z + recoilZ * 1.25);
          cannon.rotation.set(0, forwardYaw, 0);
          cannon.scale.setScalar(1.08 * unitFadeOut * fade);
          cannon.userData.setTurretTransform(1.0);
          cannon.userData.barrelPivot.rotation.x = barrelPitch;

          const pieceShow = smoothstep(0.60, 0.80, p);
          if (rookItem?.mesh) {
            rookItem.customDriven = true;
            this.setPiece3DPose(rookItem.mesh, rookOrigin.x, 0, rookOrigin.z, 0, 0, 0, 1.0, pieceShow, 0);
          }
          if (cannonItem?.mesh && cannonItem !== rookItem) {
            cannonItem.customDriven = true;
            this.setPiece3DPose(cannonItem.mesh, cannonOrigin.x, 0, cannonOrigin.z, 0, 0, 0, 1.0, pieceShow, 0);
          }
        }

        // 全程单一连续平滑运镜函数，彻底消除 p=0.36 与 p=0.56 处的镜头回退抖动！
        if (vfxContext?.setCameraOverride) {
          const riseFocus = smoothstep(0.0, 0.36, p);
          const dropFocus = smoothstep(0.56, 0.74, p);
          const camY = THREE.MathUtils.lerp(
            THREE.MathUtils.lerp(0.65, airAssemblyApex.y + 0.25, riseFocus),
            0.72,
            dropFocus
          );
          const camZ = THREE.MathUtils.lerp(
            orbitCenterXZ.z,
            THREE.MathUtils.lerp(airAssemblyApex.z, kPos.z, 0.5),
            dropFocus
          );
          const camRad = THREE.MathUtils.lerp(
            THREE.MathUtils.lerp(11.0, 9.6, riseFocus),
            10.4,
            dropFocus
          );
          const camTheta = THREE.MathUtils.lerp(
            riseFocus * 0.28,
            0.16,
            dropFocus
          );
          vfxContext.setCameraOverride(
            new THREE.Vector3(kPos.x, camY, camZ),
            camRad,
            0.92,
            camTheta
          );
        }
      });
    }

    // =========================================================================
    // 13. 加强卧槽马 (Trough Horse):
    // 修复对峙时“将（帅）”没能正常显示的问题：
    // 1. 将空中对峙的“将（帅）”与助战棋子正面朝向镜头倾斜立起 (rx = Math.PI * 0.38)，使棋子字面清晰朝向观众（而非侧刃对镜头）；
    // 2. 为对峙中的“将（帅）”配备专属赤金背光护盾环，并赋予高优先级 renderOrder = 25，确保对峙全程清晰醒目！
    // =========================================================================
    if (vfxType === 'trough_horse') {
      const cgScene = this.createCGSceneEnvironment('cg_battlefield', group);
      const horseItem = findAttackerItemByType('n', null) || attackerItems[0];
      const partnerItem = findAttackerItemByType('r', horseItem)
        || findAttackerItemByType('c', horseItem)
        || attackerItems.find((it) => it !== horseItem && it !== kingItem && !it.isKing)
        || findFriendlyGeneralItem()
        || horseItem;

      // 确保对峙的“将（帅）”3D 棋子实体 100% 存在（若棋盘未找到对应 mesh，则动态创建一枚兜底“將/帥”3D 棋子参演）
      let kingMesh = kingItem?.mesh || null;
      if (!kingMesh && typeof this.createPieceMesh === 'function') {
        const enemyColor = winnerColor === RED ? BLACK : RED;
        const fallbackKing = this.createPieceMesh(
          { id: 'vfx_trough_king_fallback', color: enemyColor, type: 'k', char: enemyColor === RED ? '帥' : '將' },
          0,
          4
        );
        if (fallbackKing) {
          if (fallbackKing.parent) fallbackKing.parent.remove(fallbackKing);
          group.add(fallbackKing);
          kingMesh = fallbackKing;
        }
      }

      const horseOrigin = horseItem?.basePos
        ? new THREE.Vector3(Number(horseItem.basePos.x) || 0, 0, Number(horseItem.basePos.z) || 0)
        : new THREE.Vector3(Number(cPos.x) || 0, 0, Number(cPos.z) || 0);
      const partnerOrigin = partnerItem?.basePos
        ? new THREE.Vector3(Number(partnerItem.basePos.x) || 0, 0, Number(partnerItem.basePos.z) || 0)
        : new THREE.Vector3((Number(kPos.x) || 0) + 2.0, 0, (Number(kPos.z) || 0) + 2.0);
      const kingOrigin = kingItem?.basePos
        ? new THREE.Vector3(Number(kingItem.basePos.x) || 0, 0, Number(kingItem.basePos.z) || 0)
        : new THREE.Vector3(Number(kPos.x) || 0, 0, Number(kPos.z) || 0);

      // 空中对峙点：“将（帅）”在左 (-1.38, 2.25, 0.2)，助战棋子在右 (+1.38, 2.25, 0.2)
      const kingStandoffPos = new THREE.Vector3(-1.38, 2.25, 0.2);
      const partnerStandoffPos = new THREE.Vector3(1.38, 2.25, 0.2);
      const horseTransformPos = new THREE.Vector3(3.55, 2.35, 0.2);

      // 为对峙双子各自增加醒目的战气背光圆环（外径 1.18 大于放大后棋子半径 0.84），衬托“將（帥）”与助战子在空中清晰夺目
      const kingBackHalo = new THREE.Mesh(new THREE.RingGeometry(0.80, 1.18, 36), crimsonGlowMat.clone());
      const partnerBackHalo = new THREE.Mesh(new THREE.RingGeometry(0.80, 1.18, 36), goldGlowMat.clone());
      kingBackHalo.visible = false;
      partnerBackHalo.visible = false;
      group.add(kingBackHalo, partnerBackHalo);

      const clashEnergyGroup = new THREE.Group();
      clashEnergyGroup.position.set(0, 2.25, 0.2);
      const clashCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.26, 1), goldGlowMat.clone());
      const clashRing = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.042, 10, 28), crimsonGlowMat.clone());
      clashRing.rotation.y = Math.PI / 2;
      // 左右对波光束：左侧赤红战气波（连接左端“将（帅）”）与右侧金芒战气波（连接右端助战棋子）在中心激撞
      const leftKingBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.09, 0.96, 12), crimsonGlowMat.clone());
      leftKingBeam.rotation.z = Math.PI / 2;
      leftKingBeam.position.x = -0.48;
      const rightPartnerBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.055, 0.96, 12), goldGlowMat.clone());
      rightPartnerBeam.rotation.z = Math.PI / 2;
      rightPartnerBeam.position.x = 0.48;
      clashEnergyGroup.add(clashCore, clashRing, leftKingBeam, rightPartnerBeam);
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
        const activeStandoff = standoffInT * (1 - returnBoardT);

        // 1. 另一枚助战棋子飞至右侧对峙点，字面朝向观众倾斜 (rx = Math.PI * 0.38) 并朝左微倾与“将（帅）”正面对峙！
        if (partnerItem?.mesh && partnerItem !== horseItem && partnerItem !== kingItem) {
          partnerItem.customDriven = true;
          const pCur = new THREE.Vector3().lerpVectors(partnerOrigin, partnerStandoffPos, activeStandoff);
          const tremor = (p > 0.18 && p < 0.65) ? Math.sin(p * 85) * 0.06 : 0;
          const sc = THREE.MathUtils.lerp(1.0, 1.68, activeStandoff);
          this.setPiece3DPose(
            partnerItem.mesh,
            pCur.x + tremor,
            pCur.y,
            pCur.z,
            activeStandoff * (Math.PI * 0.38),
            -activeStandoff * 0.28,
            activeStandoff * 0.16,
            sc,
            1.0,
            activeStandoff * 0.72,
            0xfbbf24
          );
          partnerBackHalo.visible = p > 0.10 && p < 0.84;
          partnerBackHalo.position.set(pCur.x + tremor, pCur.y + 0.16, pCur.z - 0.12);
          partnerBackHalo.rotation.set(activeStandoff * (Math.PI * 0.38) - Math.PI / 2, -activeStandoff * 0.28, activeStandoff * 0.16);
          partnerBackHalo.scale.setScalar((0.95 + Math.sin(p * 32) * 0.12) * fade);
        } else {
          partnerBackHalo.visible = false;
        }

        if (p > 0.14 && p < 0.65) {
          clashEnergyGroup.visible = true;
          const pulse = 0.85 + Math.sin(p * 48) * 0.25;
          clashCore.scale.setScalar(pulse * fade);
          clashRing.scale.setScalar((0.9 + Math.cos(p * 40) * 0.2) * fade);
          clashRing.rotation.x += dt * 12;
        } else {
          clashEnergyGroup.visible = false;
        }

        // 2. “马”棋子绕着对峙双子螺旋盘旋飞升 -> 变身为 3D 建模马 -> 疾冲撞飞“将（帅）”
        if (p < 0.56) {
          const orbitT = smoothstep(0.04, 0.46, p);
          const morphT = smoothstep(0.42, 0.56, p);
          const ang = orbitT * Math.PI * 4.0;
          const rx = 2.95 + Math.sin(orbitT * Math.PI) * 0.55;
          const rz = 2.05;
          const orbitPt = new THREE.Vector3(
            Math.cos(ang) * rx,
            THREE.MathUtils.lerp(0.25, 2.35, orbitT) + Math.sin(ang * 2) * 0.35,
            Math.sin(ang) * rz + 0.2
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
          troughHorse.userData.animateGallop(p * 5, morphT * 0.72, 1.35);
          troughHorse.scale.setScalar(mScale);
        } else if (p < 0.84) {
          horseMorphAura.update(horseTransformPos, 0, 0);
          if (horseItem?.mesh) { horseItem.customDriven = true; horseItem.mesh.visible = false; }

          const chargeT = smoothstep(0.56, 0.72, p);
          const chargeEnd = new THREE.Vector3(-2.15, 2.15, 0.2);
          troughHorse.visible = true;
          troughHorse.position.lerpVectors(horseTransformPos, chargeEnd, chargeT);
          troughHorse.position.y += Math.sin(chargeT * Math.PI) * 0.65;
          this.faceTargetHorizontally(troughHorse, chargeEnd.x - 1, chargeEnd.z);
          troughHorse.userData.animateGallop(p * 6.5, chargeT > 0.4 && chargeT < 0.8 ? 0.65 : 0.25, 1.45);
          troughHorse.scale.setScalar(1.25 * fade);
        } else {
          const backT = smoothstep(0.84, 0.98, p);
          troughHorse.visible = backT < 0.75;
          troughHorse.scale.setScalar(1.22 * (1 - backT) * fade);
          if (horseItem?.mesh) {
            horseItem.customDriven = true;
            const hp = new THREE.Vector3().lerpVectors(new THREE.Vector3(-2.15, 2.15, 0.2), horseOrigin, backT);
            this.setPiece3DPose(horseItem.mesh, hp.x, hp.y, hp.z, 0, 0, 0, THREE.MathUtils.lerp(1.3, 1.0, backT), backT, 0);
          }
        }

        // 3. “将（帅）”在空中左端对峙（使用具备完整 y=0 坐标的 kingOrigin 插值至 kingStandoffPos，杜绝 y=NaN 消失问题），p=0.65 被建模马迎面撞飞！
        if (kingItem) kingItem.customDriven = true;
        if (kingMesh) {
          if (p < 0.65) {
            const kCur = new THREE.Vector3().lerpVectors(kingOrigin, kingStandoffPos, standoffInT);
            const tremor = p > 0.18 ? Math.sin(p * 85) * 0.06 : 0;
            this.setPiece3DPose(
              kingMesh,
              kCur.x - tremor,
              kCur.y,
              kCur.z,
              standoffInT * (Math.PI * 0.38),
              standoffInT * 0.28,
              -standoffInT * 0.16,
              THREE.MathUtils.lerp(1.0, 1.68, standoffInT),
              1.0,
              standoffInT * 0.75,
              0xef4444
            );
            kingBackHalo.visible = p > 0.10;
            kingBackHalo.position.set(kCur.x - tremor, kCur.y + 0.16, kCur.z - 0.12);
            kingBackHalo.rotation.set(standoffInT * (Math.PI * 0.38) - Math.PI / 2, standoffInT * 0.28, -standoffInT * 0.16);
            kingBackHalo.scale.setScalar((0.95 + Math.cos(p * 32) * 0.12) * fade);
          } else if (p < 0.85) {
            kingBackHalo.visible = false;
            const flyOutT = (p - 0.65) / 0.20;
            ramImpactExplosion.update.call(this, flyOutT, fade, kingStandoffPos);
            const kx = THREE.MathUtils.lerp(kingStandoffPos.x, -6.8, flyOutT);
            const kz = THREE.MathUtils.lerp(kingStandoffPos.z, -2.6, flyOutT);
            const ky = kingStandoffPos.y + Math.sin(flyOutT * Math.PI * 0.85) * 2.45 - flyOutT * 1.2;
            this.setPiece3DPose(
              kingMesh,
              kx,
              Math.max(0.1, ky),
              kz,
              flyOutT * Math.PI * 5,
              flyOutT * Math.PI * 4,
              flyOutT * Math.PI * 3,
              1.68 * (1 - flyOutT * 0.25),
              1.0,
              0.90,
              0xef4444
            );
          } else {
            kingBackHalo.visible = false;
            const backT = smoothstep(0.85, 0.98, p);
            const kx = THREE.MathUtils.lerp(-6.8, kPos.x, backT);
            const kz = THREE.MathUtils.lerp(-2.6, kPos.z, backT);
            const ky = Math.sin(backT * Math.PI) * 1.2;
            this.setPiece3DPose(
              kingMesh,
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
            new THREE.Vector3(p > 0.65 && p < 0.84 ? -1.8 : 0, 2.05, 0.2),
            11.4,
            0.90,
            Math.sin(p * Math.PI) * 0.18
          );
        }
      });
    }

    // =========================================================================
    // 14. 加强闷杀 (Smothered Kill):
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
      // 初始草地地图 (Map A: cg_grassland)
      const cgScene = this.createCGSceneEnvironment('cg_grassland', group, { withScorchEarth: true });

      const cannonItem0 = findAttackerItemByType('c', null) || attackerItems[0];
      const cannonItem1 = findAttackerItemByType('c', cannonItem0) || attackerItems.find((it) => it !== cannonItem0) || cannonItem0;
      const cStart0 = cannonItem0?.basePos ? cannonItem0.basePos.clone() : new THREE.Vector3(-2.2, 0, 2.5);
      const cStart1 = cannonItem1?.basePos && cannonItem1 !== cannonItem0
        ? cannonItem1.basePos.clone()
        : new THREE.Vector3(2.2, 0, -2.5);

      // =======================================================================
      // 炼狱熔岩焦土巨景地图 (Map B: lavaWorldMapGroup)
      // 在镜头仰视高空太阳融合为熔岩球时趁机切换为此熔岩地图
      // =======================================================================
      const lavaWorldMapGroup = new THREE.Group();
      lavaWorldMapGroup.visible = false;
      lavaWorldMapGroup.renderOrder = -12;
      group.add(lavaWorldMapGroup);

      // 生成高精度熔岩球表面与熔岩大地纹理（还原《白.mp4》中龟裂耀金岩浆脉络与暗黑冷却浮壳）
      const createMagmaSphereTexture = () => {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');
        const bg = ctx.createRadialGradient(256, 256, 20, 256, 256, 360);
        bg.addColorStop(0.0, '#fef08a');
        bg.addColorStop(0.28, '#f97316');
        bg.addColorStop(0.65, '#dc2626');
        bg.addColorStop(1.0, '#450a0a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 512, 512);

        ctx.fillStyle = 'rgba(24, 8, 5, 0.78)';
        for (let i = 0; i < 52; i++) {
          const rx = (i * 97) % 512;
          const ry = (i * 151) % 512;
          const rw = 20 + (i % 5) * 16;
          const rh = 13 + (i % 4) * 13;
          ctx.beginPath();
          ctx.ellipse(rx, ry, rw, rh, (i % 6) * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.strokeStyle = '#fef9c3';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 14;
        for (let l = 0; l < 40; l++) {
          ctx.lineWidth = 2.2 + (l % 3) * 2.0;
          ctx.beginPath();
          let lx = (l * 67) % 512;
          let ly = (l * 43) % 512;
          ctx.moveTo(lx, ly);
          for (let s = 0; s < 6; s++) {
            lx += Math.cos(l + s * 1.35) * 44;
            ly += Math.sin(l * 0.75 + s * 1.65) * 44;
            ctx.lineTo(lx, ly);
          }
          ctx.stroke();
        }
        return new THREE.CanvasTexture(c);
      };
      const magmaSphereTex = createMagmaSphereTexture();

      // 生成环绕太阳的圆周漩涡云环纹理（还原《白.mp4》01s-05s 中心太阳被一圈厚重金褐流云环绕在屏幕中央的视觉构图）
      const createCircularCloudRingTexture = () => {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, 512, 512);
        // 中心留出透明圆孔给太阳，圆周 115px -> 252px 为层叠浓密云环
        const baseRing = ctx.createRadialGradient(256, 256, 86, 256, 256, 252);
        baseRing.addColorStop(0.0, 'rgba(255, 251, 235, 0.0)');
        baseRing.addColorStop(0.14, 'rgba(254, 240, 138, 0.86)');
        baseRing.addColorStop(0.32, 'rgba(217, 119, 6, 0.92)');
        baseRing.addColorStop(0.62, 'rgba(92, 36, 22, 0.94)');
        baseRing.addColorStop(0.88, 'rgba(38, 15, 18, 0.92)');
        baseRing.addColorStop(1.0, 'rgba(18, 8, 12, 0.0)');
        ctx.fillStyle = baseRing;
        ctx.fillRect(0, 0, 512, 512);

        // 叠加 64 团沿圆周排布的立体云絮亮边与暗部体积感
        for (let i = 0; i < 64; i++) {
          const a = (i / 64) * Math.PI * 2 + (i % 3) * 0.08;
          const r = 112 + (i % 5) * 26;
          const px = 256 + Math.cos(a) * r;
          const py = 256 + Math.sin(a) * r;
          const pr = 26 + (i % 4) * 12;
          const g = ctx.createRadialGradient(
            px - Math.cos(a) * 6,
            py - Math.sin(a) * 6,
            2,
            px,
            py,
            pr
          );
          if (i % 3 === 0) {
            g.addColorStop(0, 'rgba(254, 243, 199, 0.55)');
            g.addColorStop(0.5, 'rgba(234, 88, 12, 0.35)');
            g.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else {
            g.addColorStop(0, 'rgba(68, 24, 18, 0.65)');
            g.addColorStop(0.6, 'rgba(30, 12, 16, 0.45)');
            g.addColorStop(1, 'rgba(0, 0, 0, 0)');
          }
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(px, py, pr, 0, Math.PI * 2);
          ctx.fill();
        }
        return new THREE.CanvasTexture(c);
      };
      const cloudVortexTex = createCircularCloudRingTexture();

      const lavaBasaltMat = new THREE.MeshStandardMaterial({
        color: 0x160705,
        emissive: 0x3b0808,
        emissiveIntensity: 0.32,
        roughness: 0.88,
        metalness: 0.15
      });
      const lavaMagmaRiverMat = new THREE.MeshBasicMaterial({
        map: magmaSphereTex,
        color: 0xffedd5,
        side: THREE.DoubleSide
      });

      const lavaFloorBase = new THREE.Mesh(new THREE.CylinderGeometry(58, 58, 0.4, 64), lavaBasaltMat);
      lavaFloorBase.position.y = -0.20;
      lavaFloorBase.renderOrder = -14;
      const lavaRiverOverlay = new THREE.Mesh(new THREE.CircleGeometry(42, 64), lavaMagmaRiverMat);
      lavaRiverOverlay.rotation.x = -Math.PI / 2;
      lavaRiverOverlay.position.y = 0.008;
      lavaRiverOverlay.renderOrder = -12;
      lavaWorldMapGroup.add(lavaFloorBase, lavaRiverOverlay);

      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        const r = 4.6 + (i % 3) * 3.8;
        const slab = new THREE.Mesh(
          new THREE.BoxGeometry(1.6 + (i % 3) * 0.8, 0.38, 1.4 + (i % 2) * 0.9),
          lavaBasaltMat
        );
        slab.position.set(Math.cos(a) * r, 0.08, Math.sin(a) * r);
        slab.rotation.y = -a;
        slab.rotation.x = -0.18 - (i % 3) * 0.08;
        slab.renderOrder = -10;
        lavaWorldMapGroup.add(slab);
      }
      for (let m = 0; m < 18; m++) {
        const ma = (m / 18) * Math.PI * 2 + 0.12;
        const mr = 18.0 + (m % 3) * 4.2;
        const mh = 3.2 + (m % 4) * 2.4;
        const spire = new THREE.Mesh(new THREE.ConeGeometry(0.9 + (m % 3) * 0.5, mh, 6), lavaBasaltMat);
        spire.position.set(Math.cos(ma) * mr, mh * 0.45, Math.sin(ma) * mr);
        spire.rotation.z = ((m % 3) - 1) * 0.14;
        spire.renderOrder = -11;
        lavaWorldMapGroup.add(spire);
      }

      const kingGroundHalo = new THREE.Mesh(
        new THREE.RingGeometry(0.75, 1.35, 36),
        crimsonGlowMat.clone()
      );
      kingGroundHalo.rotation.x = -Math.PI / 2;
      kingGroundHalo.position.set(0, 0.03, 0);
      kingGroundHalo.visible = false;
      group.add(kingGroundHalo);

      // =======================================================================
      // 太阳与熔岩球总成 (giantSunGroup)
      // 严格遵循参照视频《白.mp4》01s-05s：
      // 仰视时太阳位于屏幕正中心（半径 1.72，占屏幕约 30%，绝不覆盖全屏！），
      // 四周圆周被浓密云环围绕在中间；而在最后阶段 (p >= 0.74) 近景切镜时再放大至压顶巨球！
      // =======================================================================
      const sunStartApex = new THREE.Vector3(0, 17.5, 0);
      const giantSunGroup = new THREE.Group();
      giantSunGroup.position.copy(sunStartApex);
      group.add(giantSunGroup);

      const whiteSunCoreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 1.0
      });
      const whiteSunHaloMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.78,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const whiteSunCore = new THREE.Mesh(new THREE.SphereGeometry(1.72, 48, 48), whiteSunCoreMat);
      const whiteSunHalo = new THREE.Mesh(new THREE.SphereGeometry(2.12, 40, 40), whiteSunHaloMat);
      const solarFlareGroup = new THREE.Group();
      for (let sf = 0; sf < 12; sf++) {
        const ang = (sf / 12) * Math.PI * 2;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.25, 8), whiteSunHaloMat);
        spike.position.set(Math.cos(ang) * 2.05, 0, Math.sin(ang) * 2.05);
        spike.rotation.z = -Math.PI / 2;
        spike.rotation.y = -ang;
        solarFlareGroup.add(spike);
      }
      giantSunGroup.add(whiteSunCore, whiteSunHalo, solarFlareGroup);

      // 转化后的熔岩球层 (基础半径 1.78，仰视时位于圆周云环正中心，不覆盖全屏)
      const lavaSphereCoreMat = new THREE.MeshBasicMaterial({
        map: magmaSphereTex,
        color: 0xffedd5,
        transparent: true,
        opacity: 0.0
      });
      const lavaCrustWireMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        wireframe: true,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const lavaCoronaMat = new THREE.MeshBasicMaterial({
        color: 0xea580c,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const lavaSphereCore = new THREE.Mesh(new THREE.SphereGeometry(1.78, 48, 48), lavaSphereCoreMat);
      const lavaCrustWire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.83, 3), lavaCrustWireMat);
      const lavaCoronaMesh = new THREE.Mesh(new THREE.SphereGeometry(2.14, 40, 40), lavaCoronaMat);
      giantSunGroup.add(lavaSphereCore, lavaCrustWire, lavaCoronaMesh);

      const lavaBumps = [];
      for (let b = 0; b < 24; b++) {
        const phiB = Math.acos(1 - (2 * (b + 0.5)) / 24);
        const thetaB = Math.PI * (1 + Math.sqrt(5)) * b;
        const dirV = new THREE.Vector3(
          Math.sin(phiB) * Math.cos(thetaB),
          Math.cos(phiB),
          Math.sin(phiB) * Math.sin(thetaB)
        ).normalize();
        const bump = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 1), lavaSphereCoreMat);
        bump.position.copy(dirV).multiplyScalar(1.66);
        giantSunGroup.add(bump);
        lavaBumps.push(bump);
      }

      // =======================================================================
      // 最后阶段专属：从熔岩球自身变亮扩散的层叠球面气浪总成 (selfAirWaveGroup)
      // 还原用户要求：“最后的光效改为气浪从熔岩球自身变亮，熔岩球落地激起地震，石块飞起，整个屏幕再慢慢到全白”
      // =======================================================================
      const selfAirWaveGroup = new THREE.Group();
      selfAirWaveGroup.visible = false;
      giantSunGroup.add(selfAirWaveGroup);

      const selfWaveInnerMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const selfWaveMidMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const selfWaveOuterMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const selfWaveShell1 = new THREE.Mesh(new THREE.SphereGeometry(1.88, 40, 32), selfWaveInnerMat);
      const selfWaveShell2 = new THREE.Mesh(new THREE.SphereGeometry(2.15, 40, 32), selfWaveMidMat);
      const selfWaveShell3 = new THREE.Mesh(new THREE.SphereGeometry(2.48, 36, 28), selfWaveOuterMat);
      const selfWaveSkirtRing1 = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.24, 14, 48), selfWaveMidMat);
      selfWaveSkirtRing1.rotation.x = Math.PI / 2;
      selfWaveSkirtRing1.position.y = -0.85;
      const selfWaveSkirtRing2 = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.32, 14, 48), selfWaveOuterMat);
      selfWaveSkirtRing2.rotation.x = Math.PI / 2;
      selfWaveSkirtRing2.position.y = -0.55;
      selfAirWaveGroup.add(selfWaveShell1, selfWaveShell2, selfWaveShell3, selfWaveSkirtRing1, selfWaveSkirtRing2);

      const selfWaveRibbons = [];
      for (let sr = 0; sr < 20; sr++) {
        const ra = (sr / 20) * Math.PI * 2;
        const rr = 1.75 + (sr % 3) * 0.35;
        const rib = new THREE.Mesh(
          new THREE.ConeGeometry(0.18, 2.2, 10),
          sr % 2 === 0 ? selfWaveInnerMat : selfWaveMidMat
        );
        rib.position.set(Math.cos(ra) * rr, -0.75, Math.sin(ra) * rr);
        rib.rotation.z = -Math.cos(ra) * 0.55;
        rib.rotation.x = Math.sin(ra) * 0.55;
        selfAirWaveGroup.add(rib);
        selfWaveRibbons.push({ rib, ra, rr });
      }

      // =======================================================================
      // 圆周环绕太阳的 360° 浓密云环系统 (circularCloudRingDiscs + 36 团圆周立体云簇 wreathedClouds)
      // 仰视时将白色太阳完整围在屏幕正中间，并在变成熔岩球缓缓下坠时沿圆周缓缓向外散开！
      // =======================================================================
      const cloudRingDiscMatInner = new THREE.MeshBasicMaterial({
        map: cloudVortexTex,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const cloudRingDiscMatOuter = new THREE.MeshBasicMaterial({
        map: cloudVortexTex,
        color: 0xd97706,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const cloudRingDiscInner = new THREE.Mesh(new THREE.RingGeometry(1.78, 6.4, 64), cloudRingDiscMatInner);
      cloudRingDiscInner.rotation.x = Math.PI / 2;
      cloudRingDiscInner.position.set(0, 16.8, 0);
      const cloudRingDiscOuter = new THREE.Mesh(new THREE.RingGeometry(2.45, 8.8, 64), cloudRingDiscMatOuter);
      cloudRingDiscOuter.rotation.x = Math.PI / 2;
      cloudRingDiscOuter.position.set(0, 15.9, 0);
      group.add(cloudRingDiscInner, cloudRingDiscOuter);

      const wreathedClouds = [];
      for (let c = 0; c < 36; c++) {
        const ringLayer = c < 12 ? 0 : (c < 24 ? 1 : 2); // 0: 内环紧贴太阳圆周, 1: 中环云墙, 2: 外环浓云
        const cMat = new THREE.MeshStandardMaterial({
          color: ringLayer === 0 ? 0xfef3c7 : (ringLayer === 1 ? 0xd97706 : 0x451a03),
          emissive: ringLayer === 0 ? 0xd97706 : (ringLayer === 1 ? 0x7c2d12 : 0x1f0909),
          emissiveIntensity: ringLayer === 0 ? 0.48 : 0.28,
          roughness: 0.88,
          transparent: true,
          opacity: 0.94,
          depthWrite: false
        });
        const cGrp = new THREE.Group();
        const puffCount = 5;
        for (let pf = 0; pf < puffCount; pf++) {
          const puff = new THREE.Mesh(
            new THREE.SphereGeometry(0.95 - (pf % 2) * 0.18 + ringLayer * 0.22, 14, 12),
            cMat
          );
          puff.scale.set(1.55, 0.62, 1.25);
          puff.position.set(
            (pf - 2) * 0.65,
            (pf % 2) * 0.18,
            ((pf + 1) % 2) * 0.35
          );
          cGrp.add(puff);
        }
        const idxInLayer = c % 12;
        const baseAngle = (idxInLayer / 12) * Math.PI * 2 + ringLayer * 0.26;
        // 内圈半径 2.35（刚好围住半径 1.72 的白色太阳四周！），中圈 3.65，外圈 5.25（充满整个屏幕圆周外围！）
        const baseRad = ringLayer === 0
          ? (2.32 + (idxInLayer % 2) * 0.28)
          : (ringLayer === 1 ? (3.65 + (idxInLayer % 3) * 0.35) : (5.25 + (idxInLayer % 3) * 0.55));
        const baseY = ringLayer === 0
          ? (16.5 + (idxInLayer % 2) * 0.35)
          : (ringLayer === 1 ? (15.8 + (idxInLayer % 2) * 0.45) : (15.0 + (idxInLayer % 2) * 0.55));
        cGrp.position.set(Math.cos(baseAngle) * baseRad, baseY, Math.sin(baseAngle) * baseRad);
        cGrp.rotation.y = -baseAngle;
        group.add(cGrp);
        wreathedClouds.push({ cGrp, cMat, ringLayer, baseAngle, baseRad, baseY, idx: c });
      }

      // =======================================================================
      // 陨石碎片、远小近大透视分层 (64 颗)、每颗落地激起小石子 & 触发地震镜头震动
      // + 视角切换 1：经过屏幕中心的大碎片砸中靠近屏幕的地板掀起气浪与石块遮挡全屏 (cut1FloorBlastGroup)
      // + 视角切换 2：近景爆炸遮屏切入终局特写 (screenBlockerExplosionGroup)
      // + 终局熔岩球落地飞石群 (finalFlyingBoulders, 56 块大飞石)
      // =======================================================================
      const rockCragMat = new THREE.MeshStandardMaterial({
        color: 0x220a04,
        emissive: 0xea580c,
        emissiveIntensity: 0.82,
        roughness: 0.62
      });
      const rockFlameWakeMat = new THREE.MeshBasicMaterial({
        color: 0xf97316,
        transparent: true,
        opacity: 0.84,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const makeMeteorRock = (radius = 0.38, tailLenMult = 3.8) => {
        const rg = new THREE.Group();
        const spinBody = new THREE.Group();
        const core = new THREE.Mesh(new THREE.DodecahedronGeometry(radius, 1), rockCragMat);
        core.scale.set(1.2, 0.88, 1.05);
        const glowShell = new THREE.Mesh(new THREE.IcosahedronGeometry(radius * 1.08, 0), goldGlowMat.clone());
        glowShell.material.wireframe = true;
        spinBody.add(core, glowShell);

        const wakeCone = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.85, radius * tailLenMult, 12), rockFlameWakeMat);
        wakeCone.position.y = radius * (tailLenMult * 0.48);
        const innerWakeCone = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.48, radius * (tailLenMult * 0.72), 10), goldGlowMat.clone());
        innerWakeCone.position.y = radius * (tailLenMult * 0.35);

        rg.add(spinBody, wakeCone, innerWakeCone);
        rg.userData = { spinBody, wakeCone, innerWakeCone };
        rg.visible = false;
        group.add(rg);
        return rg;
      };

      // 64 颗远小近大的熔岩陨石碎片，每颗配备专属落地冲击环 + 6 颗落地激起的小石子 (共 384 颗伴随碎片溅起的小石子！)
      const TOTAL_METEORS = 64;
      const fallingLavaRocks = Array.from({ length: TOTAL_METEORS }, (_, i) => {
        // 按深度分为远景(0..23)、中景(24..47)、近景(48..63)三层，实现极其鲜明的「碎片远小近大」！
        let x, z, depthScale;
        if (i < 24) {
          // 远景小碎片 (z: -12.5 -> -3.8)
          const spread = ((i / 23) - 0.5) * 18.0;
          x = spread + Math.sin(i * 2.1) * 0.9;
          z = -12.5 + (i % 6) * 1.45;
          depthScale = 0.36 + (i % 4) * 0.06;
        } else if (i < 48) {
          // 中景中等碎片 (z: -3.4 -> +3.6)
          const j = i - 24;
          const spread = ((j / 23) - 0.5) * 13.5;
          x = spread + Math.cos(j * 1.7) * 0.7;
          z = -3.4 + (j % 7) * 1.05;
          depthScale = 0.78 + (j % 4) * 0.11;
        } else {
          // 近景大碎片 (z: +4.0 -> +9.8，靠近镜头，尺寸硕大！)
          const k = i - 48;
          const spread = ((k / 15) - 0.5) * 9.6;
          x = spread + Math.sin(k * 1.9) * 0.5;
          z = 4.0 + (k % 5) * 1.25;
          depthScale = 1.42 + (k % 4) * 0.22;
        }

        const baseRadius = 0.28 * depthScale;
        const mesh = makeMeteorRock(baseRadius, 4.2);
        const impactRing = new THREE.Mesh(
          new THREE.RingGeometry(0.14 * depthScale, 0.65 * depthScale, 20),
          i % 2 === 0 ? goldGlowMat.clone() : crimsonGlowMat.clone()
        );
        impactRing.rotation.x = -Math.PI / 2;
        impactRing.visible = false;
        group.add(impactRing);

        // 每颗碎片落地时激起的 6 颗弹跳小石子
        const impactPebbles = Array.from({ length: 6 }, (__, pIdx) => {
          const pa = (pIdx / 6) * Math.PI * 2 + (i % 5) * 0.2;
          const pebMesh = new THREE.Mesh(
            new THREE.DodecahedronGeometry((0.055 + (pIdx % 3) * 0.025) * Math.max(0.65, depthScale * 0.85), 0),
            pIdx % 2 === 0 ? lavaBasaltMat : rockCragMat
          );
          pebMesh.visible = false;
          group.add(pebMesh);
          return {
            pebMesh,
            vx: Math.cos(pa) * (0.45 + (pIdx % 3) * 0.32) * Math.max(0.7, depthScale),
            vz: Math.sin(pa) * (0.45 + (pIdx % 3) * 0.32) * Math.max(0.7, depthScale),
            jumpH: (0.55 + (pIdx % 3) * 0.38) * Math.max(0.7, depthScale)
          };
        });

        return {
          mesh,
          impactRing,
          impactPebbles,
          x,
          z,
          depthScale,
          startY: 13.5 + (i % 5) * 1.35,
          earlyStartT: 0.27 + (i % 10) * 0.014,
          earlyDur: 0.14 + (i % 3) * 0.02,
          earlyImpacted: false,
          prevCycle: -1,
          idx: i
        };
      });

      // 经过屏幕中心砸中靠近屏幕地板的大碎片 (heroCenterFragment) + 靠近屏幕地板掀起的遮屏气浪与飞石群 (cut1FloorBlastGroup)
      const heroCenterFragment = makeMeteorRock(0.84, 4.2);
      heroCenterFragment.renderOrder = 30;

      const cut1FloorBlastGroup = new THREE.Group();
      cut1FloorBlastGroup.visible = false;
      cut1FloorBlastGroup.renderOrder = 34;
      const cut1WaveCoreMat = new THREE.MeshBasicMaterial({
        color: 0xfef3c7,
        transparent: true,
        opacity: 0,
        depthTest: false,
        side: THREE.DoubleSide
      });
      const cut1WaveOuterMat = new THREE.MeshBasicMaterial({
        color: 0xea580c,
        transparent: true,
        opacity: 0,
        depthTest: false,
        side: THREE.DoubleSide
      });
      const cut1WaveDome = new THREE.Mesh(new THREE.SphereGeometry(2.6, 28, 24), cut1WaveCoreMat);
      const cut1WaveShell = new THREE.Mesh(new THREE.SphereGeometry(3.6, 28, 24), cut1WaveOuterMat);
      cut1FloorBlastGroup.add(cut1WaveShell, cut1WaveDome);

      const cut1FlyingRocks = Array.from({ length: 28 }, (_, i) => {
        const rkMesh = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.24 + (i % 4) * 0.14, 0),
          i % 3 === 0 ? rockCragMat : lavaBasaltMat
        );
        rkMesh.renderOrder = 36;
        cut1FloorBlastGroup.add(rkMesh);
        const a = (i / 28) * Math.PI * 2 + (i % 3) * 0.15;
        return {
          rkMesh,
          a,
          rad: 0.25 + (i % 5) * 0.36,
          vy: 0.45 + (i % 4) * 0.35
        };
      });
      group.add(cut1FloorBlastGroup);

      // 水平视角切入后中心大碎片在场地中央留下的冲天余波火柱 (heroImpactPillar)
      const heroImpactPillar = new THREE.Group();
      heroImpactPillar.position.set(0, 0.05, -0.4);
      heroImpactPillar.visible = false;
      const heroPillarCore = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.88, 11.5, 16), goldGlowMat.clone());
      heroPillarCore.position.y = 5.75;
      const heroPillarOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 1.50, 11.5, 16), crimsonGlowMat.clone());
      heroPillarOuter.position.y = 5.75;
      const heroPillarBaseWave = new THREE.Mesh(new THREE.RingGeometry(0.4, 2.6, 32), goldGlowMat.clone());
      heroPillarBaseWave.rotation.x = -Math.PI / 2;
      heroImpactPillar.add(heroPillarCore, heroPillarOuter, heroPillarBaseWave);
      group.add(heroImpactPillar);

      // 视角切换 2：砸向镜头正前方引发遮蔽全屏爆炸的特写碎片 (screenBlockerFragment)
      const screenBlockerFragment = makeMeteorRock(0.90, 3.6);
      screenBlockerFragment.renderOrder = 32;
      const screenBlockerExplosionGroup = new THREE.Group();
      screenBlockerExplosionGroup.visible = false;
      screenBlockerExplosionGroup.renderOrder = 35;
      const blockerFlashCore = new THREE.Mesh(
        new THREE.SphereGeometry(2.8, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0xfff7ed, transparent: true, opacity: 0, depthTest: false })
      );
      const blockerFireShell = new THREE.Mesh(
        new THREE.SphereGeometry(3.8, 24, 24),
        new THREE.MeshBasicMaterial({ color: 0xea580c, transparent: true, opacity: 0, depthTest: false })
      );
      screenBlockerExplosionGroup.add(blockerFireShell, blockerFlashCore);
      const blockerSilhouetteRocks = Array.from({ length: 18 }, (_, i) => {
        const sr = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.20 + (i % 3) * 0.11, 0),
          lavaBasaltMat
        );
        sr.renderOrder = 36;
        screenBlockerExplosionGroup.add(sr);
        const a = (i / 18) * Math.PI * 2;
        return { sr, a, r: 0.32 + (i % 4) * 0.34 };
      });
      group.add(screenBlockerExplosionGroup);

      // 终局阶段 (p >= 0.74)：熔岩球落地激起地震时冲天飞起的 56 块巨石与碎岩块 (finalFlyingBoulders)
      const finalFlyingBoulders = Array.from({ length: 56 }, (_, i) => {
        const a = (i / 56) * Math.PI * 2 + (i % 5) * 0.14;
        const dist = 0.55 + (i % 8) * 0.82;
        const bSize = 0.12 + (i % 5) * 0.085;
        const bMesh = new THREE.Mesh(
          new THREE.DodecahedronGeometry(bSize, 0),
          i % 4 === 0 ? rockCragMat : lavaBasaltMat
        );
        bMesh.scale.set(1.35, 0.78 + (i % 3) * 0.25, 1.15);
        bMesh.visible = false;
        bMesh.renderOrder = 28;
        group.add(bMesh);
        return {
          bMesh,
          baseX: Math.cos(a) * dist,
          baseZ: Math.sin(a) * dist + (i % 3 === 0 ? 2.2 : 0),
          vx: Math.cos(a) * (0.95 + (i % 4) * 0.65),
          vz: Math.sin(a) * (0.95 + (i % 4) * 0.65),
          upSpeed: 2.8 + (i % 6) * 0.95,
          delay: (i % 8) * 0.018,
          idx: i
        };
      });

      const whiteColor = new THREE.Color(0xffffff);
      const solarGoldColor = new THREE.Color(0xfef08a);
      const warmCloudColor = new THREE.Color(0xf97316);
      const magmaCloudColor = new THREE.Color(0xb91c1c);
      const darkAshCloudColor = new THREE.Color(0x2e1018);
      const skyBlueColor = new THREE.Color(0xdbeafe);
      const skyMagmaColor = new THREE.Color(0x240710);

      let cut1ImpactTriggered = false;
      let cut2ImpactTriggered = false;
      let lastRumbleP = -1;

      return wrapUpdater((p, dt, fade = 1) => {
        // 保持 3D 场景直到 p=1.00 全白完成，绝不在 Stage 2 中途提前褪掉全白！
        const cgWeight = smoothstep(0.01, 0.10, p) * fade;
        vfxContext?.setSceneTransition?.(cgWeight);

        if (p < 0.02) {
          cut1ImpactTriggered = false;
          cut2ImpactTriggered = false;
          lastRumbleP = -1;
          fallingLavaRocks.forEach((rk) => {
            rk.earlyImpacted = false;
            rk.prevCycle = -1;
          });
        }

        // p >= 0.26 趁镜头仰视高空太阳时将地面切换为炼狱熔岩地图
        const useLavaMap = p >= 0.26;
        if (!useLavaMap) {
          cgScene.setFade(cgWeight, dt, p);
          lavaWorldMapGroup.visible = false;
        } else {
          cgScene.setFade(0, dt, p);
          cgScene.sceneGroup.visible = false;
          lavaWorldMapGroup.visible = cgWeight > 0.02;
          lavaWorldMapGroup.position.y = -(1 - cgWeight) * 0.4;
        }

        // 太阳与熔岩球自转
        lavaSphereCore.rotation.y += dt * 0.48;
        lavaCrustWire.rotation.y -= dt * 0.36;
        lavaCoronaMesh.rotation.z += dt * 0.55;
        solarFlareGroup.rotation.y += dt * 0.85;
        cloudRingDiscInner.rotation.z -= dt * 0.22;
        cloudRingDiscOuter.rotation.z += dt * 0.15;

        // 白色太阳转化为熔岩球进度 (0.22 -> 0.34)
        const lavaTransformT = smoothstep(0.22, 0.34, p);
        whiteSunCoreMat.opacity = (1 - smoothstep(0.15, 0.85, lavaTransformT)) * fade;
        whiteSunHaloMat.opacity = (1 - lavaTransformT) * 0.78 * fade;
        whiteSunCore.visible = whiteSunCoreMat.opacity > 0.02;
        whiteSunHalo.visible = whiteSunHaloMat.opacity > 0.02;
        solarFlareGroup.visible = whiteSunHalo.visible;

        lavaSphereCoreMat.opacity = smoothstep(0.05, 0.75, lavaTransformT) * fade;
        lavaCrustWireMat.opacity = smoothstep(0.15, 0.90, lavaTransformT) * 0.82 * fade;
        lavaCoronaMat.opacity = smoothstep(0.10, 0.85, lavaTransformT) * 0.75 * fade;
        lavaSphereCore.visible = lavaSphereCoreMat.opacity > 0.02;
        lavaCrustWire.visible = lavaCrustWireMat.opacity > 0.02;
        lavaCoronaMesh.visible = lavaCoronaMat.opacity > 0.02;
        lavaBumps.forEach((b) => { b.visible = lavaSphereCore.visible; });

        // 天空与圆周云环变色 & 变成熔岩球缓缓下坠时云朵在圆周缓缓散开 (0.23 -> 0.46)
        const skyColorShiftT = smoothstep(0.22, 0.46, p);
        const cloudDisperseT = smoothstep(0.23, 0.46, p);
        if (this.scene && this.scene.background && cgWeight > 0.1) {
          this.scene.background.copy(skyBlueColor).lerp(skyMagmaColor, skyColorShiftT);
          if (this.scene.fog) {
            this.scene.fog.color.copy(this.scene.background);
          }
        }

        // 圆周漩涡云环圆盘在仰视阶段完整围住太阳，并在熔岩球下坠时沿圆周缓缓向外散开扩大
        const showUpwardCloudRing = p < 0.475;
        cloudRingDiscInner.visible = showUpwardCloudRing;
        cloudRingDiscOuter.visible = showUpwardCloudRing;
        if (showUpwardCloudRing) {
          const innerExpand = 1.0 + cloudDisperseT * 0.78;
          const outerExpand = 1.0 + cloudDisperseT * 0.52;
          cloudRingDiscInner.scale.setScalar(innerExpand);
          cloudRingDiscOuter.scale.setScalar(outerExpand);
          cloudRingDiscMatInner.opacity = (0.94 - cloudDisperseT * 0.35) * cgWeight;
          cloudRingDiscMatOuter.opacity = (0.88 - cloudDisperseT * 0.25) * cgWeight;
        }

        wreathedClouds.forEach((cl) => {
          cl.cGrp.visible = cgWeight > 0.05;
          const localColorT = cl.ringLayer === 0
            ? smoothstep(0.22, 0.38, p)
            : smoothstep(0.26, 0.46, p);
          if (localColorT < 0.5) {
            cl.cMat.color.copy(cl.ringLayer === 0 ? solarGoldColor : warmCloudColor).lerp(warmCloudColor, localColorT * 2);
            cl.cMat.emissive.setHex(0xb45309);
            cl.cMat.emissiveIntensity = 0.32 + localColorT * 0.65;
          } else {
            cl.cMat.color.copy(warmCloudColor).lerp(cl.ringLayer === 2 ? darkAshCloudColor : magmaCloudColor, (localColorT - 0.5) * 2);
            cl.cMat.emissive.setHex(cl.ringLayer === 0 ? 0xea580c : 0x7f1d1d);
            cl.cMat.emissiveIntensity = 0.58;
          }
          // 变成熔岩球缓缓下坠时，云朵在圆周方向缓缓向外散开并缓慢旋动
          const radialSpread = cl.ringLayer === 0
            ? cloudDisperseT * 2.45
            : (cl.ringLayer === 1 ? cloudDisperseT * 2.85 : cloudDisperseT * 3.20);
          const curR = cl.baseRad + radialSpread;
          const curAng = cl.baseAngle + p * (cl.ringLayer === 0 ? 0.55 : -0.35);
          const horizontalViewCloudDrop = smoothstep(0.45, 0.52, p);
          const targetCloudY = THREE.MathUtils.lerp(
            cl.baseY - cloudDisperseT * 0.65,
            8.2 + (cl.idx % 3) * 0.65,
            horizontalViewCloudDrop
          );
          cl.cGrp.position.set(
            Math.cos(curAng) * curR,
            targetCloudY,
            Math.sin(curAng) * curR
          );
          cl.cGrp.rotation.y = -curAng;
          cl.cMat.opacity = (0.92 - cloudDisperseT * 0.14) * cgWeight;
        });

        // =====================================================================
        // 分阶段镜头与动作编排
        // =====================================================================
        if (p < 0.09) {
          // 阶段 1 (0.00 -> 0.09): “将（帅）”飞跃落至场地中心 (0, 0.02, 0)
          const landT = smoothstep(0.0, 0.08, p);
          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            this.setPiece3DPose(
              kingItem.mesh,
              THREE.MathUtils.lerp(kPos.x, 0, landT),
              Math.sin(landT * Math.PI) * 1.85 + 0.02,
              THREE.MathUtils.lerp(kPos.z, 0, landT),
              Math.sin(landT * Math.PI) * 0.32,
              landT * Math.PI * 2,
              0,
              THREE.MathUtils.lerp(1.0, 1.55, landT),
              1.0,
              0.25
            );
          }
          kingGroundHalo.visible = landT > 0.7;
          [
            { item: cannonItem0, orig: cStart0 },
            { item: cannonItem1, orig: cStart1 }
          ].forEach(({ item, orig }, idx) => {
            if (!item?.mesh || (idx === 1 && cannonItem1 === cannonItem0)) return;
            item.customDriven = true;
            this.setPiece3DPose(item.mesh, orig.x, 0.04, orig.z, 0, 0, 0, 1.15, 1.0, 0.35, 0xfbbf24);
          });

          giantSunGroup.visible = true;
          giantSunGroup.position.copy(sunStartApex);
          giantSunGroup.scale.setScalar(1.0);
          selfAirWaveGroup.visible = false;
          heroCenterFragment.visible = false;
          cut1FloorBlastGroup.visible = false;
          heroImpactPillar.visible = false;
          screenBlockerFragment.visible = false;
          screenBlockerExplosionGroup.visible = false;
          fallingLavaRocks.forEach((r) => {
            r.mesh.visible = false;
            r.impactRing.visible = false;
            r.impactPebbles.forEach((pb) => { pb.pebMesh.visible = false; });
          });
          finalFlyingBoulders.forEach((b) => { b.bMesh.visible = false; });
          if (vfxContext) vfxContext.whiteoutAlpha = 0;

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, 0.45, 0),
              10.8,
              0.58,
              0,
              true
            );
          }
        } else if (p < 0.22) {
          // 阶段 2 (0.09 -> 0.22): 两“炮”螺旋升天，镜头仰视高空白色太阳
          // 此时白色太阳居中（绝不占满全屏！），圆周被一圈浓密云环围绕在屏幕正中间！
          const spiralT = (p - 0.09) / 0.13;
          const easeSpiral = smoothstep(0.0, 1.0, spiralT);
          const curCannonY = THREE.MathUtils.lerp(0.2, sunStartApex.y - 0.8, easeSpiral);
          const spiralRadius = THREE.MathUtils.lerp(2.6, 0.28, easeSpiral);
          const spiralAng = spiralT * Math.PI * 5.0;

          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            this.setPiece3DPose(kingItem.mesh, 0, 0.02, 0, 0, 0, 0, 1.55, 1.0, 0.25);
          }
          kingGroundHalo.visible = false;

          [cannonItem0, cannonItem1].forEach((item, idx) => {
            if (!item?.mesh || (idx === 1 && cannonItem1 === cannonItem0)) return;
            item.customDriven = true;
            const a = spiralAng + idx * Math.PI;
            const cx = Math.cos(a) * spiralRadius;
            const cz = Math.sin(a) * spiralRadius;
            this.setPiece3DPose(
              item.mesh,
              cx,
              curCannonY,
              cz,
              spiralT * Math.PI * 4,
              a,
              0,
              THREE.MathUtils.lerp(1.22, 1.48, easeSpiral),
              1 - smoothstep(0.85, 1.0, spiralT),
              0.85,
              0xfbbf24
            );
          });

          giantSunGroup.visible = true;
          giantSunGroup.position.copy(sunStartApex);
          // 保持 scale = 1.0，使太阳在屏幕正中间占约 30% 高度，四周圆周完整展示环绕云层！
          giantSunGroup.scale.setScalar(1.0);
          selfAirWaveGroup.visible = false;
          heroCenterFragment.visible = false;
          cut1FloorBlastGroup.visible = false;
          heroImpactPillar.visible = false;
          screenBlockerFragment.visible = false;
          screenBlockerExplosionGroup.visible = false;
          if (vfxContext) vfxContext.whiteoutAlpha = 0;

          if (vfxContext?.setCameraOverride) {
            // 相机从地面附近 (camPhi = 2.68, camRad = 14.8) 仰望高空 (0, 17.5, 0) 的白色太阳与圆周云环！
            const camPhi = THREE.MathUtils.lerp(0.58, 2.68, easeSpiral);
            const camTargetY = THREE.MathUtils.lerp(0.5, sunStartApex.y, easeSpiral);
            const camRad = THREE.MathUtils.lerp(10.8, 14.8, easeSpiral);
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, camTargetY, 0),
              camRad,
              camPhi,
              spiralT * 0.25,
              true
            );
          }
        } else if (p < 0.472) {
          // ===================================================================
          // 阶段 3 & 4 (0.22 -> 0.472):
          // 1) 中心的白色太阳变成熔岩球并缓缓下坠，同时圆周云朵在圆周缓缓向外散开 (0.22 -> 0.42)
          // 2) 周围远近碎片开始滑落，每颗碎片落地均触发地震震屏与小石子飞溅
          // 3) 0.39 -> 0.472: 一颗大碎片经过屏幕正中心，砸中靠近屏幕位置的地板，
          //    掀起滔天气浪和飞石块完全遮挡住全屏幕 (p = 0.472 达到 100% 遮屏)，借此遮屏时机切换到下一个视角！
          // ===================================================================
          [cannonItem0, cannonItem1].forEach((item) => {
            if (item?.mesh) { item.customDriven = true; item.mesh.visible = false; }
          });
          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            this.setPiece3DPose(kingItem.mesh, 0, 0.02, 0, Math.PI * 0.24, 0, 0, 1.58, 1.0, 0.55, 0xef4444);
          }
          kingGroundHalo.visible = false;

          // 熔岩球缓缓下坠 (y: 17.5 -> 14.6)，尺寸保持适中 (1.0 -> 1.16) 位于圆周云环正中心！
          const slowDescendT = smoothstep(0.23, 0.45, p);
          const curSunY = THREE.MathUtils.lerp(17.5, 14.6, slowDescendT);
          giantSunGroup.visible = true;
          giantSunGroup.position.set(0, curSunY, 0);
          giantSunGroup.scale.setScalar(THREE.MathUtils.lerp(1.0, 1.16, slowDescendT));
          selfAirWaveGroup.visible = false;
          heroImpactPillar.visible = false;
          screenBlockerFragment.visible = false;
          screenBlockerExplosionGroup.visible = false;
          finalFlyingBoulders.forEach((b) => { b.bMesh.visible = false; });
          if (vfxContext) vfxContext.whiteoutAlpha = 0;

          // 周围先导碎片从圆周云环间加速坠落，落地时震动镜头（地震）并激起小石子
          fallingLavaRocks.forEach((rk, i) => {
            if (i < 32 && p >= rk.earlyStartT && p <= rk.earlyStartT + rk.earlyDur) {
              const lt = (p - rk.earlyStartT) / rk.earlyDur;
              const accel = Math.pow(lt, 2.3);
              rk.mesh.visible = true;
              rk.mesh.position.set(rk.x, THREE.MathUtils.lerp(rk.startY, 0.1, accel), rk.z);
              rk.mesh.rotation.set(0, 0, 0);
              if (rk.mesh.userData?.spinBody) {
                rk.mesh.userData.spinBody.rotation.x += dt * (5 + lt * 12);
                rk.mesh.userData.spinBody.rotation.z += dt * (4 + lt * 10);
              }
              if (lt >= 0.88 && !rk.earlyImpacted) {
                rk.earlyImpacted = true;
                this.cameraShake = Math.max(this.cameraShake || 0, 0.22 + rk.depthScale * 0.18);
              }
            } else {
              rk.mesh.visible = false;
            }
            rk.impactRing.visible = false;
            rk.impactPebbles.forEach((pb) => { pb.pebMesh.visible = false; });
          });

          // 相机在 0.39 -> 0.455 跟随中心大碎片略微下移视线对准靠近屏幕前方的地板
          const followHeroT = smoothstep(0.39, 0.455, p);
          const camPhi = THREE.MathUtils.lerp(2.68, 1.86, followHeroT);
          const camTargetY = THREE.MathUtils.lerp(curSunY, 2.6, followHeroT);
          const camRad = THREE.MathUtils.lerp(14.8, 12.6, followHeroT);
          const camThetaOff = 0.25 * (1 - followHeroT);

          // 0.385 -> 0.452: 大碎片经过屏幕正中心，极速砸向靠近屏幕位置的地板！
          const heroFragT = (p - 0.385) / 0.067;
          if (heroFragT >= 0 && heroFragT <= 1.0) {
            const accelHero = Math.pow(heroFragT, 2.1);
            heroCenterFragment.visible = true;
            // 从熔岩球正下方经过屏幕正中心，砸向靠近相机前方的地板 (0, 0.3, 6.2)
            const fragY = THREE.MathUtils.lerp(curSunY - 0.6, 0.35, accelHero);
            const fragZ = THREE.MathUtils.lerp(0.8, 6.2, accelHero);
            heroCenterFragment.position.set(0, fragY, fragZ);
            heroCenterFragment.rotation.set(0, 0, 0);
            if (heroCenterFragment.userData?.spinBody) {
              heroCenterFragment.userData.spinBody.rotation.x += dt * 12;
              heroCenterFragment.userData.spinBody.rotation.y += dt * 9;
            }
            heroCenterFragment.scale.setScalar(1.15 + accelHero * 1.15);
          } else {
            heroCenterFragment.visible = false;
          }

          // 0.444 -> 0.472: 大碎片砸中靠近屏幕位置的地板，掀起滔天气浪和飞石块遮挡住全屏幕！
          if (p >= 0.444) {
            const occT = (p - 0.444) / 0.028; // 在 p = 0.472 达到 1.0 (100% 遮挡全屏幕)
            if (!cut1ImpactTriggered) {
              cut1ImpactTriggered = true;
              this.cameraShake = 0.85;
            } else {
              this.cameraShake = Math.max(this.cameraShake || 0, 0.55);
            }
            cut1FloorBlastGroup.visible = true;
            // 放置在靠近镜头前方的地板与视线正中央，气浪与飞石瞬间扑面遮满全屏
            cut1FloorBlastGroup.position.set(0, THREE.MathUtils.lerp(1.2, 2.6, occT), THREE.MathUtils.lerp(6.8, 9.6, occT));
            cut1FloorBlastGroup.scale.setScalar(0.95 + occT * 3.85);
            cut1WaveCoreMat.opacity = Math.min(1.0, occT * 1.45);
            cut1WaveOuterMat.opacity = Math.min(1.0, occT * 1.55);
            cut1FlyingRocks.forEach(({ rkMesh, a, rad, vy }, idx) => {
              const spread = rad * (0.35 + occT * 2.25);
              rkMesh.position.set(
                Math.cos(a) * spread,
                Math.sin(a) * spread * 0.65 + (occT - 0.3) * vy,
                1.35
              );
              rkMesh.rotation.x += dt * (12 + idx);
              rkMesh.rotation.y += dt * 14;
            });
          } else {
            cut1FloorBlastGroup.visible = false;
          }

          if (vfxContext?.setCameraOverride) {
            vfxContext.setCameraOverride(
              new THREE.Vector3(0, camTargetY, 0),
              camRad,
              camPhi,
              camThetaOff,
              true
            );
          }
        } else if (p < 0.74) {
          // ===================================================================
          // 阶段 5 (0.472 -> 0.74):
          // 趁大碎片砸中近处地板掀起气浪和石块完全遮住全屏的时机 (p = 0.472)，瞬间切换到水平远景视角！
          // - 0.472 -> 0.505: 遮屏气浪与飞石散开，露出水平战场视角
          // - 64 颗远小近大的熔岩碎片密集砸落，每颗碎片落地均激起 6 颗弹跳小石子，并触发镜头地震震动！
          // - 0.695 -> 0.74: 第二颗近景大碎片砸在镜头前掀起遮屏爆炸，切入终局熔岩球压顶特写！
          // ===================================================================
          heroCenterFragment.visible = false;
          finalFlyingBoulders.forEach((b) => { b.bMesh.visible = false; });

          // 0.472 -> 0.506: 遮挡全屏的气浪与石块迅速向镜头四周飞散消退，完成无缝转场！
          if (p < 0.506) {
            const clearT = (p - 0.472) / 0.034;
            cut1FloorBlastGroup.visible = true;
            cut1FloorBlastGroup.position.set(0, 3.05, 11.8);
            cut1FloorBlastGroup.scale.setScalar(4.8 + clearT * 2.2);
            cut1WaveCoreMat.opacity = (1 - clearT) * 0.96;
            cut1WaveOuterMat.opacity = (1 - clearT) * 0.92;
            cut1FlyingRocks.forEach(({ rkMesh, a, rad, vy }, idx) => {
              const spread = rad * (2.6 + clearT * 2.4);
              rkMesh.position.set(
                Math.cos(a) * spread,
                Math.sin(a) * spread * 0.75 + clearT * vy * 1.5,
                1.4
              );
              rkMesh.rotation.x += dt * (12 + idx);
            });
          } else {
            cut1FloorBlastGroup.visible = false;
          }

          const midAirApproachT = (p - 0.472) / 0.268;
          // 熔岩球在红云层下方露出球体下半部，缓缓下压逼近半空（还原《白.mp4》08.5s-15.0s）
          const curSunY = THREE.MathUtils.lerp(11.6, 8.8, midAirApproachT);
          giantSunGroup.visible = true;
          giantSunGroup.position.set(0, curSunY, 0);
          giantSunGroup.scale.setScalar(2.65);
          selfAirWaveGroup.visible = false;

          // 0.472 -> 0.555 场地中心大碎片落点冲天火柱（还原《白.mp4》08.5s-10.5s 中心火柱）
          if (p >= 0.472 && p < 0.56) {
            const pilT = (p - 0.472) / 0.088;
            heroImpactPillar.visible = true;
            const pilFade = Math.sin(pilT * Math.PI);
            heroImpactPillar.scale.set(0.85 + pilT * 0.95, pilFade, 0.85 + pilT * 0.95);
            heroPillarBaseWave.scale.setScalar(1.0 + pilT * 2.8);
          } else {
            heroImpactPillar.visible = false;
          }

          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            const tremble = Math.sin(p * 125) * 0.08 * midAirApproachT;
            this.setPiece3DPose(
              kingItem.mesh,
              tremble,
              0.02,
              -tremble,
              Math.PI * 0.26,
              0,
              0,
              1.65,
              1.0,
              0.82,
              0xef4444
            );
          }
          kingGroundHalo.visible = true;
          kingGroundHalo.scale.setScalar(0.95 + Math.sin(p * 45) * 0.15);

          // 64 颗远小近大的熔岩碎片密集坠落，每颗落地均激起小石子并触发地震镜头震动！
          const activeRockLimit = Math.floor(THREE.MathUtils.lerp(28, fallingLavaRocks.length, Math.min(1, midAirApproachT * 1.25)));
          let frameImpactShock = 0;
          fallingLavaRocks.forEach((rk, i) => {
            if (i >= activeRockLimit) {
              rk.mesh.visible = false;
              rk.impactRing.visible = false;
              rk.impactPebbles.forEach((pb) => { pb.pebMesh.visible = false; });
              return;
            }
            const speedMult = 2.6 + (i % 4) * 0.48;
            const cycle = ((p - 0.465) * speedMult + i * 0.137) % 1.0;
            const impactThreshold = 0.72;

            if (cycle >= 0 && cycle < impactThreshold) {
              // 空中加速坠落阶段 (0 -> 0.72)
              const fallP = cycle / impactThreshold;
              const accel = fallP * fallP;
              rk.mesh.visible = true;
              rk.mesh.position.set(rk.x, THREE.MathUtils.lerp(rk.startY, 0.05, accel), rk.z);
              rk.mesh.rotation.set(0, 0, 0);
              if (rk.mesh.userData?.spinBody) {
                rk.mesh.userData.spinBody.rotation.x += dt * 12;
                rk.mesh.userData.spinBody.rotation.z += dt * 10;
              }
              rk.impactRing.visible = false;
              rk.impactPebbles.forEach((pb) => { pb.pebMesh.visible = false; });
            } else {
              // 落地爆炸 + 激起小石子 + 触发地震镜头震动阶段 (0.72 -> 1.00)
              rk.mesh.visible = false;
              const postImpactP = (cycle - impactThreshold) / (1.0 - impactThreshold);

              // 每个碎片落地瞬间触发屏幕（镜头）地震震动！
              if (rk.prevCycle < impactThreshold && rk.prevCycle >= 0) {
                const quakeStrength = 0.24 + rk.depthScale * 0.24;
                frameImpactShock = Math.max(frameImpactShock, quakeStrength);
                if (p - lastRumbleP > 0.045) {
                  lastRumbleP = p;
                  this.sfx?.playVFXPieceStepThud?.(0.55 + Math.min(0.4, rk.depthScale * 0.2), 0.72 + (i % 4) * 0.12);
                }
              }

              // 地面冲击波光环
              rk.impactRing.visible = true;
              rk.impactRing.position.set(rk.x, 0.04, rk.z);
              rk.impactRing.scale.setScalar(0.5 + postImpactP * 2.4);
              rk.impactRing.material.opacity = (1 - postImpactP) * 0.80 * fade;

              // 碎片落地激起的 6 颗四溅弹跳小石子
              rk.impactPebbles.forEach((pb, pIdx) => {
                pb.pebMesh.visible = true;
                const bounceH = Math.abs(Math.sin(postImpactP * Math.PI * 1.35)) * pb.jumpH * (1 - postImpactP * 0.35);
                pb.pebMesh.position.set(
                  rk.x + pb.vx * postImpactP * 1.35,
                  0.03 + bounceH,
                  rk.z + pb.vz * postImpactP * 1.35
                );
                pb.pebMesh.rotation.x += dt * (15 + pIdx * 2);
                pb.pebMesh.rotation.z += dt * (12 + pIdx * 2);
                const pebSc = Math.max(0.1, 1 - postImpactP * 0.45);
                pb.pebMesh.scale.setScalar(pebSc);
              });
            }
            rk.prevCycle = cycle;
          });

          if (frameImpactShock > 0) {
            this.cameraShake = Math.max(this.cameraShake || 0, frameImpactShock);
          } else {
            // 持续余震微颤，强化陨石雨轰击大地的地震感
            this.cameraShake = Math.max(this.cameraShake || 0, 0.14);
          }

          // 0.69 -> 0.74: 第二颗近景大碎片砸在镜头正前方，掀起遮蔽全屏的爆炸与黑岩剪影，完成第二次遮屏切镜！
          if (p >= 0.69 && p < 0.722) {
            const bfT = (p - 0.69) / 0.032;
            screenBlockerFragment.visible = true;
            screenBlockerFragment.position.set(
              0,
              THREE.MathUtils.lerp(8.5, 2.9, bfT * bfT),
              THREE.MathUtils.lerp(8.0, 12.2, bfT)
            );
            screenBlockerFragment.rotation.set(0, 0, 0);
            if (screenBlockerFragment.userData?.spinBody) {
              screenBlockerFragment.userData.spinBody.rotation.x += dt * 18;
              screenBlockerFragment.userData.spinBody.rotation.z += dt * 12;
            }
            screenBlockerFragment.scale.setScalar(1.25 + bfT * 0.90);
          } else {
            screenBlockerFragment.visible = false;
          }

          if (p >= 0.715) {
            const covP = (p - 0.715) / 0.025; // 在 p=0.74 达到 100% 遮蔽全屏
            if (!cut2ImpactTriggered) {
              cut2ImpactTriggered = true;
              this.cameraShake = 0.88;
            } else {
              this.cameraShake = Math.max(this.cameraShake || 0, 0.58);
            }
            screenBlockerExplosionGroup.visible = true;
            screenBlockerExplosionGroup.position.set(0, 2.8, 12.2);
            screenBlockerExplosionGroup.scale.setScalar(1.0 + covP * 3.9);
            blockerFlashCore.material.opacity = Math.min(1, covP * 1.42);
            blockerFireShell.material.opacity = Math.min(1, covP * 1.52);
            blockerSilhouetteRocks.forEach(({ sr, a, r }, idx) => {
              const d = r * (0.4 + covP * 1.85);
              sr.position.set(Math.cos(a) * d, Math.sin(a) * d * 0.65, 1.2);
              sr.rotation.x += dt * (10 + idx);
              sr.rotation.y += dt * 12;
            });
          } else {
            screenBlockerExplosionGroup.visible = false;
          }
          if (vfxContext) vfxContext.whiteoutAlpha = 0;

          if (vfxContext?.setCameraOverride) {
            // 附加陨石落地引发的地震镜头微抖动偏移
            const quakeJoltX = Math.sin(p * 390) * (this.cameraShake || 0) * 0.22;
            const quakeJoltY = Math.cos(p * 350) * (this.cameraShake || 0) * 0.26;
            vfxContext.setCameraOverride(
              new THREE.Vector3(quakeJoltX, 3.05 + quakeJoltY, 0),
              15.4,
              Math.PI * 0.495,
              0,
              true,
              p < 0.495
            );
          }
        } else {
          // ===================================================================
          // 阶段 6 (0.74 -> 1.00): 还原《白.mp4》20.0s-30.0s 终局压顶与纯白湮灭：
          // 1) 遮屏爆炸散开，巨大熔岩球近在咫尺压向地面上的“将（帅）”
          // 2) 气浪从熔岩球自身变亮向外奔涌扩散 (selfAirWaveGroup & 熔岩球本体自发光升至炽白)
          // 3) 熔岩球落地 (p = 0.80) 激起剧烈地震 (持续高强度 cameraShake + 地面震波)
          // 4) 56 块黑曜石块与碎岩冲天飞起 (finalFlyingBoulders)
          // 5) 整个屏幕随着熔岩球自身气浪变亮与石块飞起，慢慢渐变到全白 (0.82 -> 1.00 单调递增至 1.0 纯白)！
          // ===================================================================
          heroCenterFragment.visible = false;
          cut1FloorBlastGroup.visible = false;
          heroImpactPillar.visible = false;
          screenBlockerFragment.visible = false;
          fallingLavaRocks.forEach((r) => {
            r.mesh.visible = false;
            r.impactRing.visible = false;
            r.impactPebbles.forEach((pb) => { pb.pebMesh.visible = false; });
          });

          // 0.74 -> 0.78 遮屏爆炸火光迅速散开，露出近在咫尺的巨大熔岩球
          if (p < 0.78) {
            const clearT = (p - 0.74) / 0.04;
            screenBlockerExplosionGroup.visible = true;
            screenBlockerExplosionGroup.position.set(0, 1.2, 6.5);
            screenBlockerExplosionGroup.scale.setScalar(4.8 + clearT * 2.0);
            blockerFlashCore.material.opacity = (1 - clearT) * 0.95;
            blockerFireShell.material.opacity = (1 - clearT) * 0.90;
          } else {
            screenBlockerExplosionGroup.visible = false;
          }

          // 熔岩球放大至 3.95 倍（半径 1.78 * 3.95 ≈ 7.03），从 y = 8.35 缓缓下压，在 p = 0.80 落地触碰地面并继续压入大地！
          const descendToTouchT = smoothstep(0.74, 0.81, p);
          const crushIntoGroundT = smoothstep(0.81, 1.00, p);
          const sphereCenterY = THREE.MathUtils.lerp(8.35, 6.95, descendToTouchT) - crushIntoGroundT * 0.65;
          giantSunGroup.visible = true;
          giantSunGroup.position.set(0, sphereCenterY, 0);
          giantSunGroup.scale.setScalar(3.95);

          // 气浪从熔岩球自身变亮 (selfBrightenT: 0.74 -> 0.98)
          const selfBrightenT = smoothstep(0.74, 0.98, p);
          lavaSphereCoreMat.color.copy(warmCloudColor).lerp(whiteColor, Math.pow(selfBrightenT, 0.75));
          lavaCrustWireMat.color.copy(solarGoldColor).lerp(whiteColor, selfBrightenT);
          lavaCrustWireMat.opacity = (0.85 + selfBrightenT * 0.15) * fade;
          lavaCoronaMat.color.copy(warmCloudColor).lerp(whiteColor, selfBrightenT);
          lavaCoronaMat.opacity = (0.78 + selfBrightenT * 0.22) * fade;

          selfAirWaveGroup.visible = true;
          selfAirWaveGroup.rotation.y += dt * (1.4 + selfBrightenT * 2.5);
          // 熔岩球自身发出的三层球面气浪与环状烈焰裙边由内向外节节变亮并膨胀
          const waveExpand = 1.0 + selfBrightenT * 0.62 + crushIntoGroundT * 0.45;
          selfWaveShell1.scale.setScalar(1.0 + selfBrightenT * 0.35);
          selfWaveShell2.scale.setScalar(waveExpand);
          selfWaveShell3.scale.setScalar(1.0 + selfBrightenT * 0.85 + crushIntoGroundT * 0.65);
          selfWaveInnerMat.opacity = Math.min(1.0, (0.28 + selfBrightenT * 0.72) * fade);
          selfWaveMidMat.opacity = Math.min(1.0, (0.35 + selfBrightenT * 0.65) * fade);
          selfWaveOuterMat.opacity = Math.min(1.0, (0.42 + selfBrightenT * 0.58) * fade);
          selfWaveMidMat.color.copy(solarGoldColor).lerp(whiteColor, smoothstep(0.35, 1.0, selfBrightenT));
          selfWaveOuterMat.color.copy(warmCloudColor).lerp(whiteColor, smoothstep(0.55, 1.0, selfBrightenT));

          selfWaveSkirtRing1.scale.setScalar(0.95 + selfBrightenT * 0.55);
          selfWaveSkirtRing2.scale.setScalar(0.92 + selfBrightenT * 0.75);

          // 熔岩球落地激起剧烈地震 (p >= 0.795)
          const quakeT = smoothstep(0.79, 0.98, p);
          if (p >= 0.79) {
            this.cameraShake = Math.max(this.cameraShake || 0, 0.52 + quakeT * 0.88);
          } else {
            this.cameraShake = Math.max(this.cameraShake || 0, 0.24);
          }

          // 地上“将（帅）”在熔岩球落地地震中剧烈震颤
          if (kingItem?.mesh) {
            kingItem.customDriven = true;
            const jitter = Math.sin(p * 175) * (0.08 + quakeT * 0.10);
            const squash = 1 + crushIntoGroundT * 0.28;
            this.setPiece3DPose(
              kingItem.mesh,
              jitter,
              0.02,
              -jitter,
              Math.PI * 0.22,
              0,
              0,
              [1.65 * squash, 1.65 / squash, 1.65 * squash],
              1.0,
              0.95,
              0xef4444
            );
            kingGroundHalo.visible = true;
            kingGroundHalo.scale.setScalar(1.1 + crushIntoGroundT * 0.85);
          }

          // 熔岩球落地激起地震，四周 56 块石块冲天飞起 (还原《白.mp4》23s-29.5s 满屏飞石腾空！)
          finalFlyingBoulders.forEach((fb) => {
            const localRockT = Math.max(0, (p - (0.785 + fb.delay)) / Math.max(0.05, 0.215 - fb.delay));
            if (localRockT > 0) {
              fb.bMesh.visible = true;
              const liftY = Math.pow(localRockT, 0.82) * fb.upSpeed;
              fb.bMesh.position.set(
                fb.baseX + fb.vx * localRockT * 1.85,
                0.04 + liftY,
                fb.baseZ + fb.vz * localRockT * 1.85
              );
              fb.bMesh.rotation.x += dt * (10 + (fb.idx % 7));
              fb.bMesh.rotation.y += dt * (8 + (fb.idx % 5));
              fb.bMesh.rotation.z += dt * (9 + (fb.idx % 6));
              fb.bMesh.scale.set(
                1.35 * (1 + localRockT * 0.35),
                (0.78 + (fb.idx % 3) * 0.25) * (1 + localRockT * 0.35),
                1.15 * (1 + localRockT * 0.35)
              );
            } else {
              fb.bMesh.visible = false;
            }
          });

          // 整个屏幕随着气浪从熔岩球自身变亮与石块飞起，慢慢渐变到全白 (0.82 -> 1.00 平滑单调递增至 1.0 纯白！)
          if (vfxContext) {
            const whiteRamp = smoothstep(0.82, 0.995, p);
            vfxContext.whiteoutAlpha = Math.pow(whiteRamp, 1.35);
          }

          if (vfxContext?.setCameraOverride) {
            const qx = Math.sin(p * 420) * (0.06 + quakeT * 0.22);
            const qy = Math.cos(p * 380) * (0.06 + quakeT * 0.26);
            vfxContext.setCameraOverride(
              new THREE.Vector3(qx, 1.15 + qy, 0),
              9.6,
              1.38,
              0,
              true,
              p < 0.765
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
    // 1. 动画播放时，海面激起扩算波纹并将棋盘上的【其他所有棋子向四周驱散隐去】，只留纯净的星夜沧海与中心明月倒影；
    // 2. 美化后的高精广寒圆月倒影与流光海面在一阵阵波纹后逐渐凝聚变成对面的“将（帅）”；
    // 3. “将（帅）”破水弹出海面后在空中翻转数圈至背面（反面朝上），随后平滑切回终局棋面！
    // =========================================================================
    const cgScene = this.createCGSceneEnvironment('cg_ocean_night', group);
    const moonReflectGroup = cgScene.sceneGroup.userData.moonReflectGroup;
    const moonCoreMat = cgScene.sceneGroup.userData.moonCoreMat;
    const moonInnerMat = cgScene.sceneGroup.userData.moonInnerMat;
    const rippleRings = cgScene.sceneGroup.userData.rippleRings || [];

    const waterBurstDrops = Array.from({ length: 24 }, (_, i) => {
      const ang = (i / 24) * Math.PI * 2;
      const drop = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 10, 10),
        i % 2 === 0 ? jadeIceMat : goldGlowMat.clone()
      );
      drop.visible = false;
      drop.renderOrder = 22;
      group.add(drop);
      return { drop, ang, spd: 1.8 + (i % 4) * 0.55, lift: 1.8 + (i % 3) * 0.65 };
    });

    return wrapUpdater((p, dt, fade = 1) => {
      const cgWeight = smoothstep(0.02, 0.22, p) * (1 - smoothstep(0.84, 0.97, p)) * fade;
      vfxContext?.setSceneTransition?.(cgWeight);
      cgScene.setFade(cgWeight, dt, p);

      // 关键增强：驱散棋盘上除敌方“将（帅）”以外的所有其他棋子（含参演攻击子与普通棋盘棋子）！
      // 在 0.00 -> 0.22 随海浪波纹向四周径向推散并淡出，在 0.84 -> 0.97 平滑归位
      const disperseT = smoothstep(0.0, 0.22, p) * (1 - smoothstep(0.84, 0.97, p));
      (this._activeCheckerMeshes || []).forEach((item) => {
        if (!item?.mesh || item === kingItem || item.isKing) return;
        item.customDriven = true;
        const bx = item.basePos.x;
        const bz = item.basePos.z;
        const r = Math.hypot(bx, bz) || 1;
        const pushDist = disperseT * 4.8;
        const curX = bx + (bx / r) * pushDist;
        const curZ = bz + (bz / r) * pushDist;
        const alpha = Math.max(0, 1 - disperseT * 1.35);
        this.setPiece3DPose(item.mesh, curX, 0, curZ, 0, disperseT * Math.PI, 0, 1 - disperseT * 0.3, alpha, 0);
      });
      if (this._vfxWorldSnapshot?.pieceState) {
        for (const ps of this._vfxWorldSnapshot.pieceState) {
          if (ps.isParticipant || !ps.mesh) continue;
          const bx = ps.pos.x;
          const bz = ps.pos.z;
          const r = Math.hypot(bx, bz) || 1;
          const pushDist = disperseT * 5.2;
          ps.mesh.position.set(
            bx + (bx / r) * pushDist,
            ps.pos.y - disperseT * 0.65,
            bz + (bz / r) * pushDist
          );
          if (disperseT > 0.72) ps.mesh.visible = false;
        }
      }

      rippleRings.forEach(({ rMesh, rMat, i }) => {
        const waveCycle = (p * 3.2 + i * 0.12) % 1.0;
        const sc = 0.35 + waveCycle * 2.35;
        rMesh.scale.setScalar(sc);
        rMat.opacity = Math.sin(waveCycle * Math.PI) * 0.76 * cgWeight;
      });

      const enlargedKingScale = 2.18;

      if (p < 0.30) {
        if (kingItem?.mesh) {
          kingItem.customDriven = true;
          // 敌方“将（帅）”在开场也随其他棋子向外退隐，随后从海面中心圆月倒影中化生浮现！
          const kAlpha = Math.max(0, 1 - smoothstep(0.0, 0.18, p));
          this.setPiece3DPose(kingItem.mesh, kPos.x, 0, kPos.z, 0, 0, 0, 1.0, kAlpha, 0);
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
          if (moonCoreMat) moonCoreMat.opacity = (1 - morphT * 0.88) * 0.95 * cgWeight;
          if (moonInnerMat) moonInnerMat.opacity = (1 - morphT * 0.75) * 0.72 * cgWeight;
        }

        if (kingItem?.mesh) {
          kingItem.customDriven = true;
          this.setPiece3DPose(
            kingItem.mesh,
            rippleWobble,
            0.03,
            -rippleWobble,
            0,
            (1 - morphT) * Math.PI * 0.5,
            0,
            enlargedKingScale * (0.75 + 0.25 * morphT),
            smoothstep(0.08, 0.85, morphT),
            (1 - morphT * 0.4) * 0.78,
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
        const curY = Math.max(0.05, arcY);
        const flipRotX = smoothstep(0.0, 0.82, popT) * Math.PI * 5;

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
            drop.position.set(Math.cos(ang) * r, Math.max(0.05, Math.sin(splashP * Math.PI) * lift), Math.sin(ang) * r);
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

});
