// =============================================================================
// 绝杀 CG 级高精度关节可动 3D 建模（战马/猛虎/战车/重炮/神将/神兵）与全屏 3D 场景构建器 (vfx-models.js)
// =============================================================================
Object.assign(Xiangqi3DApp.prototype, {
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
      animateGallop(time, rearUp = 0, strideAmp = 1.0) {
        const clampedRear = Math.max(-0.35, Math.min(1.15, rearUp));
        const gallopPitch = Math.sin(time * 15) * 0.22 * strideAmp;
        const gallopLift = Math.abs(Math.sin(time * 15)) * 0.16 * strideAmp;
        bodyPivot.rotation.set(-clampedRear * 0.58 + gallopPitch, 0, Math.cos(time * 7.5) * 0.06 * strideAmp);
        bodyPivot.position.set(0, Math.max(0, clampedRear) * 0.26 + gallopLift, 0);
        neckPivot.rotation.x = Math.sin(time * 15 - 0.4) * 0.24 * strideAmp + clampedRear * 0.30;
        headGroup.rotation.x = Math.cos(time * 15) * 0.22 * strideAmp - clampedRear * 0.12;
        tailPivot.rotation.x = Math.sin(time * 17) * 0.38 * strideAmp + clampedRear * 0.36;
        tailPivot.rotation.y = Math.cos(time * 13) * 0.26 * strideAmp;
        maneLocks.forEach((mLock, idx) => {
          mLock.rotation.z = Math.sin(time * 20 + idx * 0.5) * 0.24 * strideAmp;
        });
        ribbons.forEach((rib, idx) => {
          rib.rotation.x = Math.sin(time * 18 + idx) * 0.32 * strideAmp;
        });

        flLeg.hipJoint.rotation.x = Math.sin(time * 15) * 0.96 * strideAmp - clampedRear * 0.56;
        flLeg.kneeJoint.rotation.x = Math.max(0, Math.cos(time * 15) * 1.05 * strideAmp) + clampedRear * 0.78;
        flLeg.fetlockJoint.rotation.x = Math.sin(time * 15) * 0.38 * strideAmp;

        frLeg.hipJoint.rotation.x = Math.sin(time * 15 + Math.PI * 0.55) * 0.96 * strideAmp - clampedRear * 0.44;
        frLeg.kneeJoint.rotation.x = Math.max(0, Math.cos(time * 15 + Math.PI * 0.55) * 1.05 * strideAmp) + clampedRear * 0.68;
        frLeg.fetlockJoint.rotation.x = Math.cos(time * 15) * 0.38 * strideAmp;

        blLeg.hipJoint.rotation.x = Math.sin(time * 15 + Math.PI) * 0.88 * strideAmp + clampedRear * 0.42;
        blLeg.kneeJoint.rotation.x = -Math.max(0, Math.sin(time * 15) * 0.82 * strideAmp);
        blLeg.fetlockJoint.rotation.x = -Math.sin(time * 15) * 0.32 * strideAmp;

        brLeg.hipJoint.rotation.x = Math.sin(time * 15 + Math.PI * 1.55) * 0.88 * strideAmp + clampedRear * 0.42;
        brLeg.kneeJoint.rotation.x = -Math.max(0, Math.sin(time * 15 + 0.55) * 0.82 * strideAmp);
        brLeg.fetlockJoint.rotation.x = -Math.cos(time * 15) * 0.32 * strideAmp;
      }
    };
    return horse;
  },

  createArticulated3DTiger(goldMat, stripeMat, crimsonMat, fangMat, glowMat) {
    const tiger = new THREE.Group();
    const bodyPivot = new THREE.Group();
    tiger.add(bodyPivot);

    // 1. 双段柔性脊柱：前胸肩胛总成 (frontTorsoGroup) + 柔性腰椎关节 (spineWaistJoint) + 后腰臀胯总成 (rearPelvisGroup)
    const frontTorsoGroup = new THREE.Group();
    frontTorsoGroup.position.set(0, 0.80, 0.22);
    bodyPivot.add(frontTorsoGroup);

    // 宽厚饱满的虎胸、肩胛背肌与肋骨腔
    const chestCore = new THREE.Mesh(new THREE.SphereGeometry(0.42, 28, 24), goldMat);
    chestCore.scale.set(1.14, 1.18, 1.32);
    chestCore.position.set(0, 0.02, 0.24);
    frontTorsoGroup.add(chestCore);

    // 胸前白玉/象牙色胸毛腹甲
    const underbellyFront = new THREE.Mesh(new THREE.SphereGeometry(0.35, 22, 18), fangMat);
    underbellyFront.scale.set(0.96, 0.85, 1.28);
    underbellyFront.position.set(0, -0.14, 0.22);
    frontTorsoGroup.add(underbellyFront);

    // 左右隆起的肩胛三角肌 (Scapula Deltoids) 与鎏金兽面护肩甲
    [-1, 1].forEach((side) => {
      const scapulaMuscle = new THREE.Mesh(new THREE.SphereGeometry(0.28, 22, 18), goldMat);
      scapulaMuscle.scale.set(0.88, 1.22, 1.16);
      scapulaMuscle.position.set(side * 0.30, 0.08, 0.26);
      frontTorsoGroup.add(scapulaMuscle);

      const shoulderArmor = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
        crimsonMat
      );
      shoulderArmor.position.set(side * 0.36, 0.14, 0.26);
      shoulderArmor.rotation.z = -side * 0.58;
      const armorTrim = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.028, 10, 24), glowMat);
      armorTrim.position.set(side * 0.36, 0.08, 0.26);
      armorTrim.rotation.y = side * 0.35;
      armorTrim.rotation.x = Math.PI * 0.42;
      const armorSpike = new THREE.Mesh(new THREE.ConeGeometry(0.058, 0.24, 8), glowMat);
      armorSpike.position.set(side * 0.50, 0.18, 0.26);
      armorSpike.rotation.z = -side * 1.12;
      frontTorsoGroup.add(shoulderArmor, armorTrim, armorSpike);
    });

    const midRibcage = new THREE.Mesh(new THREE.CylinderGeometry(0.39, 0.34, 0.68, 26), goldMat);
    midRibcage.rotation.x = Math.PI / 2;
    midRibcage.position.set(0, 0.0, -0.16);
    frontTorsoGroup.add(midRibcage);

    // 前躯环绕式立体黑虎斑纹
    [-0.36, -0.20, -0.04, 0.12, 0.28, 0.42].forEach((bz, idx) => {
      const r = bz > 0.15 ? 0.41 : 0.37;
      const stripe = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.032, 10, 28, Math.PI * 1.42),
        stripeMat
      );
      stripe.rotation.z = Math.PI * 0.29 + (idx % 2 === 0 ? 0.09 : -0.09);
      stripe.rotation.x = (idx % 2 === 0 ? 0.14 : -0.14);
      stripe.position.set(0, 0.02, bz);
      frontTorsoGroup.add(stripe);
    });

    // 柔性腰椎枢纽与后腰臀胯总成 (spineWaistJoint -> rearPelvisGroup)
    const spineWaistJoint = new THREE.Group();
    spineWaistJoint.position.set(0, 0.0, -0.44);
    frontTorsoGroup.add(spineWaistJoint);

    const rearPelvisGroup = new THREE.Group();
    spineWaistJoint.add(rearPelvisGroup);

    const lumbarLoins = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.56, 24), goldMat);
    lumbarLoins.rotation.x = Math.PI / 2;
    lumbarLoins.position.set(0, -0.01, -0.22);
    const pelvisCroup = new THREE.Mesh(new THREE.SphereGeometry(0.37, 24, 20), goldMat);
    pelvisCroup.scale.set(1.06, 1.12, 1.24);
    pelvisCroup.position.set(0, 0.0, -0.50);
    rearPelvisGroup.add(lumbarLoins, pelvisCroup);

    [-0.12, -0.28, -0.44, -0.58].forEach((bz, idx) => {
      const stripe = new THREE.Mesh(
        new THREE.TorusGeometry(0.35, 0.030, 10, 26, Math.PI * 1.38),
        stripeMat
      );
      stripe.rotation.z = Math.PI * 0.31 + (idx % 2 === 0 ? -0.10 : 0.10);
      stripe.position.set(0, 0.01, bz);
      rearPelvisGroup.add(stripe);
    });

    // 虎背鎏金骨刺战甲脊线
    for (let s = 0; s < 5; s++) {
      const dorsalFin = new THREE.Mesh(new THREE.ConeGeometry(0.062, 0.20, 6), glowMat);
      dorsalFin.position.set(0, 0.42 - s * 0.012, 0.30 - s * 0.16);
      dorsalFin.rotation.x = -0.42;
      frontTorsoGroup.add(dorsalFin);
    }

    // 2. 雄浑虎颈与高精雕猛虎头颅 (neckPivot -> headGroup)
    const neckPivot = new THREE.Group();
    neckPivot.position.set(0, 0.12, 0.54);
    frontTorsoGroup.add(neckPivot);

    const neckMuscle = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.40, 0.38, 24), goldMat);
    neckMuscle.rotation.x = Math.PI / 2 - 0.28;
    neckMuscle.position.set(0, 0.04, 0.12);
    neckPivot.add(neckMuscle);

    // 颈部一圈威武鬃毛领
    for (let m = 0; m < 12; m++) {
      const ma = (m / 12) * Math.PI * 2;
      const ruffCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.085, 0.28, 6),
        m % 2 === 0 ? goldMat : fangMat
      );
      ruffCone.position.set(Math.cos(ma) * 0.34, Math.sin(ma) * 0.32 + 0.04, 0.14);
      ruffCone.rotation.z = ma - Math.PI / 2;
      ruffCone.rotation.x = -0.35;
      neckPivot.add(ruffCone);
    }

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.10, 0.30);
    neckPivot.add(headGroup);

    // 多曲面精雕虎颅骨、眉弓、颧骨与吻部
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.36, 28, 24), goldMat);
    cranium.scale.set(1.18, 1.02, 1.10);
    headGroup.add(cranium);

    const snoutBridge = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.34, 20), goldMat);
    snoutBridge.rotation.x = Math.PI / 2 + 0.22;
    snoutBridge.position.set(0, -0.01, 0.28);
    headGroup.add(snoutBridge);

    // 饱满的双侧上唇胡须垫 (Muzzle Whisker Pads)
    [-1, 1].forEach((side) => {
      const muzzlePad = new THREE.Mesh(new THREE.SphereGeometry(0.145, 18, 16), fangMat);
      muzzlePad.scale.set(0.95, 0.82, 1.18);
      muzzlePad.position.set(side * 0.11, -0.07, 0.34);
      headGroup.add(muzzlePad);

      const cheekBone = new THREE.Mesh(new THREE.SphereGeometry(0.23, 20, 16), goldMat);
      cheekBone.scale.set(1.18, 0.92, 0.90);
      cheekBone.position.set(side * 0.23, -0.05, 0.10);
      headGroup.add(cheekBone);

      // 双颊黑纹与层次鬓毛
      for (let c = 0; c < 3; c++) {
        const cheekStripe = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.020, 8, 16, Math.PI * 0.65), stripeMat);
        cheekStripe.position.set(side * 0.26, -0.02 - c * 0.05, 0.12);
        cheekStripe.rotation.y = side * 1.1;
        headGroup.add(cheekStripe);
      }
      for (let t = 0; t < 5; t++) {
        const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.072, 0.26, 8), t % 2 === 0 ? fangMat : goldMat);
        tuft.position.set(side * (0.35 + t * 0.018), 0.04 - t * 0.05, 0.02);
        tuft.rotation.z = -side * (1.12 + t * 0.11);
        headGroup.add(tuft);
      }

      // 圆润立体虎耳（黑背白斑 + 朱红内耳廓）
      const earGroup = new THREE.Group();
      earGroup.position.set(side * 0.26, 0.29, -0.06);
      earGroup.rotation.z = -side * 0.34;
      earGroup.rotation.x = 0.18;
      const earShell = new THREE.Mesh(
        new THREE.SphereGeometry(0.125, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
        stripeMat
      );
      earShell.rotation.x = -Math.PI * 0.38;
      const earInner = new THREE.Mesh(new THREE.CircleGeometry(0.082, 14), crimsonMat);
      earInner.position.set(0, 0.0, 0.045);
      const earWhiteSpot = new THREE.Mesh(new THREE.CircleGeometry(0.055, 12), fangMat);
      earWhiteSpot.rotation.y = Math.PI;
      earWhiteSpot.position.set(0, 0.02, -0.065);
      earGroup.add(earShell, earInner, earWhiteSpot);
      headGroup.add(earGroup);

      // 怒目眉骨与琥珀金发光虎目 + 竖瞳
      const browRidge = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.046, 0.19, 10), stripeMat);
      browRidge.rotation.z = Math.PI / 2 - side * 0.34;
      browRidge.position.set(side * 0.15, 0.14, 0.29);
      const eyeSocket = new THREE.Mesh(new THREE.SphereGeometry(0.064, 14, 14), stripeMat);
      eyeSocket.position.set(side * 0.15, 0.07, 0.28);
      const eyeIris = new THREE.Mesh(new THREE.SphereGeometry(0.056, 14, 14), glowMat);
      eyeIris.position.set(side * 0.15, 0.07, 0.30);
      const slitPupil = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.072, 0.024), stripeMat);
      slitPupil.position.set(side * 0.15, 0.07, 0.345);
      headGroup.add(browRidge, eyeSocket, eyeIris, slitPupil);

      // 4 根修长刚劲的弧形虎须
      for (let w = 0; w < 4; w++) {
        const wCurve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(side * 0.18, -0.05 - w * 0.022, 0.38),
          new THREE.Vector3(side * 0.36, -0.06 - w * 0.030, 0.34),
          new THREE.Vector3(side * 0.52, -0.10 - w * 0.042, 0.24)
        );
        const whisker = new THREE.Mesh(new THREE.TubeGeometry(wCurve, 10, 0.0055, 6, false), fangMat);
        headGroup.add(whisker);
      }
    });

    // 立体心形虎鼻头
    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), crimsonMat);
    noseTip.scale.set(1.25, 0.85, 0.90);
    noseTip.position.set(0, 0.02, 0.45);
    headGroup.add(noseTip);

    // 额头立体浮雕“王”字皇冠虎纹
    [0.25, 0.195, 0.14].forEach((wy, idx) => {
      const wLen = idx === 1 ? 0.19 : 0.26;
      const hBar = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, wLen, 8), stripeMat);
      hBar.rotation.z = Math.PI / 2;
      hBar.position.set(0, wy, 0.30 + (2 - idx) * 0.016);
      headGroup.add(hBar);
    });
    const vBar = new THREE.Mesh(new THREE.CylinderGeometry(0.020, 0.020, 0.14, 8), stripeMat);
    vBar.position.set(0, 0.195, 0.315);
    vBar.rotation.x = -0.35;
    headGroup.add(vBar);

    // 上颚弯曲剑齿獠牙 + 门齿列
    [-0.105, 0.105].forEach((fx) => {
      const fangCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(fx, -0.09, 0.38),
        new THREE.Vector3(fx * 1.04, -0.19, 0.40),
        new THREE.Vector3(fx * 0.96, -0.27, 0.36)
      );
      const upperFang = new THREE.Mesh(new THREE.TubeGeometry(fangCurve, 12, 0.028, 10, false), fangMat);
      const fangTip = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.08, 10), fangMat);
      fangTip.rotation.x = Math.PI + 0.18;
      fangTip.position.set(fx * 0.96, -0.29, 0.35);
      headGroup.add(upperFang, fangTip);
    });
    for (let ic = -2; ic <= 2; ic++) {
      const incisor = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.045, 6), fangMat);
      incisor.rotation.x = Math.PI;
      incisor.position.set(ic * 0.032, -0.11, 0.41);
      headGroup.add(incisor);
    }

    // 可动下颚总成 (jawPivot) 含舌头、下犬齿与下颌骨
    const jawPivot = new THREE.Group();
    jawPivot.position.set(0, -0.12, 0.14);
    const lowerJaw = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.30, 16), goldMat);
    lowerJaw.rotation.x = Math.PI / 2;
    lowerJaw.scale.set(1.05, 1.0, 0.55);
    lowerJaw.position.set(0, -0.04, 0.13);
    const chinFur = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), fangMat);
    chinFur.scale.set(1.1, 0.65, 1.15);
    chinFur.position.set(0, -0.07, 0.24);
    const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), crimsonMat);
    tongue.scale.set(0.95, 0.38, 1.45);
    tongue.position.set(0, 0.01, 0.15);
    [-0.085, 0.085].forEach((fx) => {
      const lowerFang = new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.13, 10), fangMat);
      lowerFang.position.set(fx, 0.04, 0.24);
      jawPivot.add(lowerFang);
    });
    jawPivot.add(lowerJaw, chinFur, tongue);
    jawPivot.rotation.x = 0.42;
    headGroup.add(jawPivot);

    // 3. 四肢三关节解剖级虎腿（肩/髋 -> 肘/膝 -> 腕/踝 -> 梅花肉垫虎掌与弯钩利爪）
    const createAnatomicalTigerLeg = (lx, lz, isFront, parentGrp) => {
      const shoulderJoint = new THREE.Group();
      shoulderJoint.position.set(lx, -0.10, lz);

      const upperMuscular = new THREE.Mesh(
        new THREE.CylinderGeometry(isFront ? 0.155 : 0.175, 0.115, 0.42, 18),
        goldMat
      );
      upperMuscular.position.y = -0.18;
      const topJointSphere = new THREE.Mesh(new THREE.SphereGeometry(isFront ? 0.155 : 0.175, 16, 14), goldMat);
      shoulderJoint.add(topJointSphere, upperMuscular);

      [-0.08, -0.20, -0.30].forEach((sy, sIdx) => {
        const legStripe = new THREE.Mesh(
          new THREE.TorusGeometry(0.135 - sIdx * 0.01, 0.020, 8, 18, Math.PI * 1.35),
          stripeMat
        );
        legStripe.rotation.x = Math.PI / 2 + 0.12;
        legStripe.rotation.z = lx > 0 ? 0.2 : -0.2;
        legStripe.position.y = sy;
        shoulderJoint.add(legStripe);
      });

      const elbowJoint = new THREE.Group();
      elbowJoint.position.y = -0.37;
      const elbowCap = new THREE.Mesh(new THREE.SphereGeometry(0.112, 14, 12), goldMat);
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.112, 0.092, 0.36, 18), goldMat);
      forearm.position.y = -0.17;
      elbowJoint.add(elbowCap, forearm);

      [-0.10, -0.22].forEach((sy) => {
        const lowerStripe = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.016, 6, 16, Math.PI * 1.3), stripeMat);
        lowerStripe.rotation.x = Math.PI / 2;
        lowerStripe.position.y = sy;
        elbowJoint.add(lowerStripe);
      });

      const wristJoint = new THREE.Group();
      wristJoint.position.set(0, -0.34, 0.02);
      const pawGroup = new THREE.Group();
      wristJoint.add(pawGroup);

      // 宽厚虎掌与四趾指节 + 弧形锋利虎爪
      const mainPad = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 14), goldMat);
      mainPad.scale.set(1.24, 0.58, 1.36);
      pawGroup.add(mainPad);

      [-0.084, -0.028, 0.028, 0.084].forEach((cx, tIdx) => {
        const zOff = (tIdx === 1 || tIdx === 2) ? 0.12 : 0.095;
        const toeKnuckle = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), fangMat);
        toeKnuckle.scale.set(0.9, 0.78, 1.25);
        toeKnuckle.position.set(cx, -0.01, zOff);
        const claw = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.15, 8), fangMat);
        claw.rotation.x = Math.PI * 0.40;
        claw.position.set(cx, -0.02, zOff + 0.075);
        pawGroup.add(toeKnuckle, claw);
      });

      elbowJoint.add(wristJoint);
      shoulderJoint.add(elbowJoint);
      parentGrp.add(shoulderJoint);
      return { shoulderJoint, elbowJoint, wristJoint, pawGroup, isFront };
    };

    const flLeg = createAnatomicalTigerLeg(-0.27, 0.24, true, frontTorsoGroup);
    const frLeg = createAnatomicalTigerLeg(0.27, 0.24, true, frontTorsoGroup);
    const blLeg = createAnatomicalTigerLeg(-0.25, -0.44, false, rearPelvisGroup);
    const brLeg = createAnatomicalTigerLeg(0.25, -0.44, false, rearPelvisGroup);

    // 4. 六段式柔性长鞭虎尾 (6-Segment Whip Tail)
    const tailSegments = [];
    let parentTail = rearPelvisGroup;
    for (let t = 0; t < 6; t++) {
      const segPivot = new THREE.Group();
      if (t === 0) {
        segPivot.position.set(0, 0.08, -0.68);
      } else {
        segPivot.position.set(0, 0, -0.22);
      }
      const rTop = 0.068 - t * 0.006;
      const rBot = 0.062 - t * 0.006;
      const segMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(rBot, rTop, 0.24, 14),
        t % 2 === 0 ? goldMat : stripeMat
      );
      segMesh.rotation.x = Math.PI / 2;
      segMesh.position.z = -0.11;
      segPivot.add(segMesh);
      parentTail.add(segPivot);
      tailSegments.push(segPivot);
      parentTail = segPivot;
    }

    tiger.userData = {
      bodyPivot,
      frontTorsoGroup,
      spineWaistJoint,
      rearPelvisGroup,
      neckPivot,
      headGroup,
      jawPivot,
      tailSegments,
      legs: [flLeg, frLeg, blLeg, brLeg],
      /**
       * 高生动度流体猛虎动作解算：
       * mode: 'crouch' (伏地蓄力) | 'leap' (腾空舒展飞跃) | 'step_compress' (踩踏棋子缓冲借力) | 'pounce_swipe' (凌空扑杀挥爪)
       */
      animatePounce(time, phase = 0, swipePhase = 0, mode = 'leap') {
        // 虎尾6关节流体S型波浪摆动
        tailSegments.forEach((seg, idx) => {
          const wave = Math.sin(time * 14 - idx * 0.55);
          const liftWave = Math.cos(time * 11 - idx * 0.45);
          seg.rotation.y = wave * (0.18 + idx * 0.04);
          seg.rotation.x = (idx === 0 ? 0.35 : 0.08) + liftWave * 0.12;
        });

        if (mode === 'crouch') {
          const c = Math.sin(phase * Math.PI * 0.5);
          bodyPivot.position.y = -c * 0.26;
          frontTorsoGroup.rotation.x = c * 0.22;
          spineWaistJoint.rotation.x = -c * 0.34;
          neckPivot.rotation.x = -c * 0.28;
          headGroup.rotation.x = -c * 0.18;
          jawPivot.rotation.x = 0.35 + c * 0.35;

          flLeg.shoulderJoint.rotation.x = -0.58 * c;
          flLeg.elbowJoint.rotation.x = 1.05 * c;
          flLeg.wristJoint.rotation.x = -0.45 * c;
          frLeg.shoulderJoint.rotation.x = -0.52 * c;
          frLeg.elbowJoint.rotation.x = 0.98 * c;
          frLeg.wristJoint.rotation.x = -0.42 * c;

          blLeg.shoulderJoint.rotation.x = -0.65 * c;
          blLeg.elbowJoint.rotation.x = 1.15 * c;
          blLeg.wristJoint.rotation.x = -0.50 * c;
          brLeg.shoulderJoint.rotation.x = -0.65 * c;
          brLeg.elbowJoint.rotation.x = 1.15 * c;
          brLeg.wristJoint.rotation.x = -0.50 * c;
        } else if (mode === 'step_compress') {
          // 踩中空中踏板棋子时的弹性缓冲屈膝与弓背蓄力
          const comp = Math.sin(phase * Math.PI);
          bodyPivot.position.y = -comp * 0.28;
          frontTorsoGroup.rotation.x = comp * 0.28;
          spineWaistJoint.rotation.x = -comp * 0.46;
          neckPivot.rotation.x = -0.25 * comp;
          jawPivot.rotation.x = 0.45 + comp * 0.32;

          flLeg.shoulderJoint.rotation.x = -0.65 * comp;
          flLeg.elbowJoint.rotation.x = 1.18 * comp;
          flLeg.wristJoint.rotation.x = -0.52 * comp;
          frLeg.shoulderJoint.rotation.x = -0.58 * comp;
          frLeg.elbowJoint.rotation.x = 1.12 * comp;
          frLeg.wristJoint.rotation.x = -0.48 * comp;

          blLeg.shoulderJoint.rotation.x = -0.52 * comp;
          blLeg.elbowJoint.rotation.x = 1.05 * comp;
          brLeg.shoulderJoint.rotation.x = -0.52 * comp;
          brLeg.elbowJoint.rotation.x = 1.05 * comp;
        } else {
          // 腾空飞跃与扑击挥爪：前半程猛烈舒展脊柱与前后肢，最高点弓腰蓄势，下落时双前爪张开交叉挥拍！
          const arch = Math.cos(phase * Math.PI); // +1 起跳仰首舒展 -> -1 俯冲扑下
          const stretch = Math.sin(phase * Math.PI);
          bodyPivot.position.y = 0;
          frontTorsoGroup.rotation.x = -arch * 0.42;
          spineWaistJoint.rotation.x = stretch * 0.36 - (swipePhase > 0 ? 0.28 : 0);
          neckPivot.rotation.x = arch * 0.25 + Math.sin(time * 12) * 0.08;
          headGroup.rotation.x = arch * 0.15;
          jawPivot.rotation.x = 0.42 + stretch * 0.42 + (swipePhase > 0 ? 0.25 : 0);

          if (swipePhase > 0.01) {
            // 扑向“将（帅）”时双前爪大张并凌空交叉挥击！
            const sw = swipePhase * Math.PI * 2.2;
            flLeg.shoulderJoint.rotation.x = -1.18 + Math.sin(sw) * 0.68;
            flLeg.shoulderJoint.rotation.z = -0.32 + Math.cos(sw) * 0.36;
            flLeg.elbowJoint.rotation.x = 0.35 + Math.abs(Math.sin(sw)) * 0.45;
            flLeg.wristJoint.rotation.x = 0.32;

            frLeg.shoulderJoint.rotation.x = -1.18 - Math.sin(sw) * 0.68;
            frLeg.shoulderJoint.rotation.z = 0.32 - Math.cos(sw) * 0.36;
            frLeg.elbowJoint.rotation.x = 0.35 + Math.abs(Math.cos(sw)) * 0.45;
            frLeg.wristJoint.rotation.x = 0.32;
          } else {
            // 飞跃途中双前肢向前探爪，双后肢向后猛蹬伸直
            flLeg.shoulderJoint.rotation.x = -0.95 * stretch - 0.25;
            flLeg.shoulderJoint.rotation.z = -0.14 * stretch;
            flLeg.elbowJoint.rotation.x = 0.28 + (1 - stretch) * 0.45;
            flLeg.wristJoint.rotation.x = 0.22 * stretch;

            frLeg.shoulderJoint.rotation.x = -0.82 * stretch - 0.30;
            frLeg.shoulderJoint.rotation.z = 0.14 * stretch;
            frLeg.elbowJoint.rotation.x = 0.32 + (1 - stretch) * 0.45;
            frLeg.wristJoint.rotation.x = 0.22 * stretch;
          }

          blLeg.shoulderJoint.rotation.x = 0.88 * stretch + 0.18;
          blLeg.elbowJoint.rotation.x = -0.55 * stretch;
          blLeg.wristJoint.rotation.x = 0.35 * stretch;

          brLeg.shoulderJoint.rotation.x = 0.82 * stretch + 0.22;
          brLeg.elbowJoint.rotation.x = -0.55 * stretch;
          brLeg.wristJoint.rotation.x = 0.35 * stretch;
        }
      }
    };
    return tiger;
  },

  /**
   * 精雕秦汉金甲皇家华盖冲锋战车（支持夹车炮机械变形展开与底盘拼接！）
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

    // 车前饕餮破阵尖刺撞角总成（合体时可向前机械伸出展开）
    const frontRamGroup = new THREE.Group();
    [-0.36, 0, 0.36].forEach((rx, idx) => {
      const ramSpike = new THREE.Mesh(new THREE.ConeGeometry(idx === 1 ? 0.14 : 0.10, idx === 1 ? 0.52 : 0.38, 4), glowMat);
      ramSpike.rotation.x = Math.PI / 2;
      ramSpike.position.set(rx, 0.62, 0.84);
      frontRamGroup.add(ramSpike);
    });
    chariot.add(base, baseFrame, frontWall, frontShield, frontRamGroup);

    const sideWallGroups = [-0.58, 0.58].map((sx) => {
      const swGrp = new THREE.Group();
      swGrp.position.set(sx, 0, 0);
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.46, 1.22), woodMat);
      sideWall.position.set(0, 0.72, 0);
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.09, 1.28), goldMat);
      topRail.position.set(0, 0.96, 0);
      swGrp.add(sideWall, topRail);
      chariot.add(swGrp);
      return { swGrp, baseX: sx };
    });

    // 双龙战戟辕木
    const polesGroup = new THREE.Group();
    [-0.38, 0.38].forEach((px) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.55, 12), goldMat);
      pole.rotation.x = Math.PI / 2;
      pole.position.set(px, 0.48, 1.20);
      const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.52, 4), glowMat);
      spearTip.rotation.x = Math.PI / 2;
      spearTip.position.set(px, 0.48, 2.08);
      const crescent = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 8, 16, Math.PI * 0.85), goldMat);
      crescent.rotation.x = Math.PI / 2;
      crescent.position.set(px, 0.48, 1.72);
      polesGroup.add(pole, spearTip, crescent);
    });
    chariot.add(polesGroup);

    // 皇家八角流苏华盖总成（夹车炮合体时华盖可向下机械折叠收入车体，腾出顶部重炮对接基座！）
    const canopyGroup = new THREE.Group();
    const canopyPillar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 1.55, 10), goldMat);
    canopyPillar.position.set(0, 1.25, -0.10);
    const canopyRoof = new THREE.Mesh(new THREE.ConeGeometry(0.78, 0.36, 8), woodMat);
    canopyRoof.position.set(0, 2.08, -0.10);
    const canopyTrim = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.032, 8, 8), goldMat);
    canopyTrim.rotation.x = Math.PI / 2;
    canopyTrim.position.set(0, 1.92, -0.10);
    const canopyFinial = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 1), glowMat);
    canopyFinial.position.set(0, 2.32, -0.10);
    canopyGroup.add(canopyPillar, canopyRoof, canopyTrim, canopyFinial);
    chariot.add(canopyGroup);

    // 夹车炮机械变形专用的顶部重炮回转锁定座环 (默认隐藏在车厢内，变形时升起锁合重炮)
    const turretDockRing = new THREE.Group();
    const dockCollar = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.64, 0.28, 20), goldMat);
    const dockGlowRim = new THREE.Mesh(new THREE.TorusGeometry(0.60, 0.045, 10, 28), glowMat);
    dockGlowRim.rotation.x = Math.PI / 2;
    dockGlowRim.position.y = 0.14;
    turretDockRing.add(dockCollar, dockGlowRim);
    turretDockRing.position.set(0, 0.45, 0);
    turretDockRing.scale.setScalar(0.01);
    turretDockRing.visible = false;
    chariot.add(turretDockRing);

    const banners = [-0.46, 0.46].map((bx) => {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.042, 1.75, 8), goldMat);
      mast.position.set(bx, 1.28, -0.56);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.60, 0.82, 4, 4), glowMat);
      flag.position.set(bx, 1.66, -0.88);
      flag.rotation.y = Math.PI / 2;
      chariot.add(mast, flag);
      return flag;
    });

    const wheels = [-0.72, 0.72].map((wx) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(wx, 0.48, 0);
      const tire = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.060, 14, 36), goldMat);
      tire.rotation.y = Math.PI / 2;
      const innerRim = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.028, 10, 28), ironMat);
      innerRim.rotation.y = Math.PI / 2;
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.28, 16), ironMat);
      hub.rotation.z = Math.PI / 2;
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
      canopyGroup,
      sideWallGroups,
      frontRamGroup,
      turretDockRing,
      spinWheels(deltaSpin, time = 0) {
        wheels.forEach((w) => { w.rotation.x += deltaSpin; });
        banners.forEach((f, idx) => { f.rotation.z = Math.sin(time * 16 + idx) * 0.18; });
      },
      /**
       * 夹车炮机械变形：华盖折叠收起、两侧装甲与战轮横向外扩、重炮锁定座环升起
       */
      setAssemblyTransform(morphP) {
        const t = Math.max(0, Math.min(1, morphP));
        // 华盖平滑向下折叠缩入车体
        canopyGroup.scale.set(1 - t * 0.85, Math.max(0.01, 1 - t), 1 - t * 0.85);
        canopyGroup.position.y = -t * 0.85;
        canopyGroup.visible = t < 0.95;
        // 两侧护板与车轮向外机械滑出加宽底盘
        sideWallGroups.forEach(({ swGrp, baseX }) => {
          swGrp.position.x = baseX * (1 + t * 0.28);
        });
        wheels.forEach((w, idx) => {
          const sign = idx === 0 ? -1 : 1;
          w.position.x = sign * (0.72 + t * 0.24);
        });
        frontRamGroup.position.z = t * 0.28;
        turretDockRing.visible = t > 0.05;
        turretDockRing.scale.setScalar(Math.max(0.01, t));
        turretDockRing.position.y = 0.45 + t * 0.48;
      }
    };
    return chariot;
  },

  /**
   * 精雕红衣金龙神威大炮（支持夹车炮机械变形：底轮折叠收起、双联副炮管展开并锁合至战车顶座！）
   */
  createArticulated3DCannon(woodMat, goldMat, ironMat, glowMat) {
    const cannon = new THREE.Group();

    const carriageGroup = new THREE.Group();
    const carriage = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.30, 1.36), woodMat);
    carriage.position.y = 0.28;
    const carriagePlate = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.12, 1.40), goldMat);
    carriagePlate.position.y = 0.36;
    carriageGroup.add(carriage, carriagePlate);
    cannon.add(carriageGroup);

    const wheels = [];
    const wheelGroups = [];
    [[-0.45, -0.44], [0.45, -0.44], [-0.45, 0.44], [0.45, 0.44]].forEach(([wx, wz]) => {
      const wg = new THREE.Group();
      wg.position.set(wx, 0.26, wz);
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 20), ironMat);
      w.rotation.z = Math.PI / 2;
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.028, 10, 24), goldMat);
      rim.rotation.y = Math.PI / 2;
      rim.position.x = wx > 0 ? 0.06 : -0.06;
      const hubCap = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 8), goldMat);
      hubCap.rotation.z = wx > 0 ? -Math.PI / 2 : Math.PI / 2;
      hubCap.position.x = wx > 0 ? 0.12 : -0.12;
      wg.add(w, rim, hubCap);
      cannon.add(wg);
      wheels.push(w);
      wheelGroups.push({ wg, wx, wz });
    });

    const barrelPivot = new THREE.Group();
    barrelPivot.position.set(0, 0.54, 0);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.29, 1.75, 28), ironMat);
    barrel.rotation.x = Math.PI / 2;
    barrelPivot.add(barrel);

    [-0.60, -0.18, 0.26, 0.72].forEach((bz) => {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.245 - bz * 0.032, 0.042, 12, 28), goldMat);
      band.position.z = bz;
      barrelPivot.add(band);
    });

    const muzzleRing = new THREE.Mesh(new THREE.TorusGeometry(0.23, 0.052, 14, 28), glowMat);
    muzzleRing.position.z = 0.88;
    [-1, 1].forEach((s) => {
      const dragonHorn = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.34, 6), goldMat);
      dragonHorn.position.set(s * 0.18, 0.24, 0.68);
      dragonHorn.rotation.x = -0.65;
      dragonHorn.rotation.z = -s * 0.35;
      barrelPivot.add(dragonHorn);
    });
    const cascabelKnob = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), goldMat);
    cascabelKnob.position.z = -0.96;
    barrelPivot.add(muzzleRing, cascabelKnob);

    // 夹车炮机械变形时从主炮两侧滑出展开的左右双联神威副炮管 (Side Booster Barrels)
    const sideBoosters = [-1, 1].map((side) => {
      const bGrp = new THREE.Group();
      const subTube = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 1.48, 20), ironMat);
      subTube.rotation.x = Math.PI / 2;
      const subRing = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.032, 10, 20), goldMat);
      subRing.position.z = 0.72;
      const subGlow = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.028, 10, 20), glowMat);
      subGlow.position.z = 0.75;
      bGrp.add(subTube, subRing, subGlow);
      bGrp.position.set(0, 0, -0.1);
      bGrp.scale.setScalar(0.01);
      bGrp.visible = false;
      barrelPivot.add(bGrp);
      return { bGrp, side };
    });

    barrelPivot.rotation.x = -0.28;
    cannon.add(barrelPivot);

    cannon.userData = {
      barrelPivot,
      muzzleRing,
      wheels,
      wheelGroups,
      sideBoosters,
      /**
       * 夹车炮机械变形：炮车四轮向内向上折叠收起为炮塔底座，左右两侧副炮管滑出展开！
       */
      setTurretTransform(morphP) {
        const t = Math.max(0, Math.min(1, morphP));
        wheelGroups.forEach(({ wg, wx, wz }) => {
          wg.position.set(wx * (1 - t * 0.65), 0.26 + t * 0.18, wz * (1 - t * 0.25));
          wg.rotation.z = (wx > 0 ? 1 : -1) * t * (Math.PI * 0.48);
          wg.scale.setScalar(Math.max(0.01, 1 - t * 0.75));
        });
        sideBoosters.forEach(({ bGrp, side }) => {
          bGrp.visible = t > 0.05;
          bGrp.scale.setScalar(Math.max(0.01, t));
          bGrp.position.set(side * 0.36 * t, -0.02, 0.08 * t);
        });
      }
    };
    return cannon;
  },

  /**
   * 精雕大唐明光铠金甲神将 3D 模型（修正：手持轩辕巨剑的刀刃严格朝向正前方对手，处于垂直劈砍平面 Y-Z 内，绝不横着拿剑！）
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

    [-0.16, 0.16].forEach((mx) => {
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
    [-0.08, 0.08].forEach((ex) => {
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
    [-1, 1].forEach((dir) => {
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

    // 6. 右臂多关节与轩辕龙渊巨剑（刀刃严格位于 Y-Z 纵向劈砍平面内，刀刃朝向正前方 +Z 对手，绝不横着拿剑！）
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
    pommelRing.rotation.y = Math.PI / 2; // 剑首环同样对齐 Y-Z 劈砍平面
    pommelRing.position.y = -0.28;
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.066, 0.52, 14), crimsonMat);
    // 剑格护手沿 Z 轴（前后方向）展开，使刀刃前后方向宽、左右方向薄，正刃朝向对手！
    const guardCore = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.15, 0.76), goldMat);
    guardCore.position.y = 0.28;
    [-1, 1].forEach((dir) => {
      const guardWing = new THREE.Mesh(new THREE.ConeGeometry(0.092, 0.36, 6), goldMat);
      guardWing.position.set(0, 0.36, dir * 0.44);
      guardWing.rotation.x = dir * 0.85;
      swordGroup.add(guardWing);
    });
    // ConeGeometry(r, h, 4) 的四个棱角位于 ±X 与 ±Z；scale(0.24, 1, 1.36) 使 ±Z 方向为锋利刀刃（正对前方对手），±X 为扁平剑面！
    const bladeOuter = new THREE.Mesh(new THREE.ConeGeometry(0.22, 2.88, 4), glowMat);
    bladeOuter.scale.set(0.24, 1, 1.36);
    bladeOuter.position.y = 1.70;
    const bladeEdgeLine = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.65, 0.52), glowMat);
    bladeEdgeLine.position.y = 1.56;
    const bladeFuller = new THREE.Mesh(new THREE.BoxGeometry(0.11, 2.25, 0.14), goldMat);
    bladeFuller.position.y = 1.40;
    swordGroup.add(pommelRing, hilt, guardCore, bladeOuter, bladeEdgeLine, bladeFuller);
    // 仅绕 X 轴向前倾出，保持 Y=0, Z=0，刀刃 100% 垂直朝向正前方对手！
    swordGroup.rotation.set(Math.PI * 0.38, 0, 0);
    swordArmPivot.add(swordGroup);
    general.add(swordArmPivot);

    general.userData = { swordArmPivot, leftArmGroup, cape, plume, swordGroup, backHalo };
    return general;
  },

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
      // 钓鱼马专属：沧海龙宫·千层碧浪巨景（严格设置海面与浪花 renderOrder 为负数并开启硬件深度写入，
      // 确保水下 y < 0 模型被海面自然遮挡，而水上 y > 0 的鱼钩、鱼线、跃出战马与棋子 100% 处于海面上层绝不被海水错误遮挡！）
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
      seaSurface.renderOrder = -12;
      sceneGroup.add(seaSurface);

      const waveFoamMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xe0f2fe,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.68, false);
      const waveCyanMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.58, false);
      const reefRockMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.78,
        metalness: 0.18
      }), 0.98, true);
      const mossGreenMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x059669,
        roughness: 0.72
      }), 0.96, true);

      const surfRings = [];
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + 0.25;
        const dist = 9.5 + (i % 2) * 3.2;
        const island = new THREE.Group();
        island.position.set(Math.cos(ang) * dist, 0, Math.sin(ang) * dist);
        const h = 3.2 + (i % 3) * 1.4;
        const mainSpire = new THREE.Mesh(new THREE.ConeGeometry(1.65, h, 7), reefRockMat);
        mainSpire.position.y = h * 0.45;
        mainSpire.renderOrder = -8;
        const subSpire = new THREE.Mesh(new THREE.DodecahedronGeometry(1.15, 0), reefRockMat);
        subSpire.position.set(0.95, 0.85, 0.45);
        subSpire.renderOrder = -8;
        const topMoss = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.85, 7), mossGreenMat);
        topMoss.position.y = h * 0.78;
        topMoss.renderOrder = -8;
        const surfRing = new THREE.Mesh(new THREE.RingGeometry(1.55, 2.25, 24), waveFoamMat);
        surfRing.rotation.x = -Math.PI / 2;
        surfRing.position.y = 0.015;
        surfRing.renderOrder = -9;
        island.add(mainSpire, subSpire, topMoss, surfRing);
        sceneGroup.add(island);
        surfRings.push({ surfRing, phase: i * 0.8 });
      }

      const waveRings = [1.0, 1.9, 3.0, 4.4, 6.2, 8.2].map((r, idx) => {
        const pts = [];
        for (let s = 0; s < 56; s++) {
          const a = (s / 56) * Math.PI * 2;
          const rad = r + Math.sin(a * (6 + idx * 2)) * 0.20;
          pts.push(new THREE.Vector3(Math.cos(a) * rad, 0.012 + (idx % 2) * 0.010, Math.sin(a) * rad));
        }
        const curve = new THREE.CatmullRomCurve3(pts, true);
        const mesh = new THREE.Mesh(
          new THREE.TubeGeometry(curve, 72, 0.052, 8, true),
          idx % 2 === 0 ? waveFoamMat : waveCyanMat
        );
        mesh.renderOrder = -9;
        sceneGroup.add(mesh);
        return { mesh, idx };
      });

      const linearSwells = Array.from({ length: 18 }, (_, i) => {
        const ang = (i / 18) * Math.PI * 2;
        const dist = 2.4 + (i % 5) * 1.85;
        const crest = new THREE.Mesh(
          new THREE.TorusGeometry(0.72, 0.042, 8, 24, Math.PI * 0.88),
          i % 2 === 0 ? waveFoamMat : waveCyanMat
        );
        crest.position.set(Math.cos(ang) * dist, 0.016, Math.sin(ang) * dist);
        crest.rotation.x = Math.PI / 2;
        crest.rotation.z = ang;
        crest.renderOrder = -9;
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
          crest.position.set(Math.cos(ang + p * 0.5) * curR, 0.016, Math.sin(ang + p * 0.5) * curR);
        });
        surfRings.forEach(({ surfRing, phase }) => {
          const s = 0.92 + Math.sin(p * 12 + phase) * 0.16;
          surfRing.scale.set(s, s, 1);
        });
      });
    } else if (sceneType === 'cg_ocean_night') {
      // 海底捞月专属升级：精雕广寒玉盘明月倒影（含月海环形山肌理、桂影金晕、碎金月华波光带）+ 多层流光夜海碧波与十二莲花河灯
      const nightSeaMat = registerMat(new THREE.MeshStandardMaterial({
        color: 0x031126,
        emissive: 0x08254a,
        emissiveIntensity: 0.44,
        roughness: 0.08,
        metalness: 0.68
      }), 0.98, true);
      const nightSea = new THREE.Mesh(new THREE.CircleGeometry(52, 64), nightSeaMat);
      nightSea.rotation.x = -Math.PI / 2;
      nightSea.position.y = 0.0;
      nightSea.renderOrder = -14;
      sceneGroup.add(nightSea);

      const createMoonCanvasTex = () => {
        const c = document.createElement("canvas");
        c.width = 512;
        c.height = 512;
        const ctx = c.getContext("2d");
        const g = ctx.createRadialGradient(256, 256, 18, 256, 256, 248);
        g.addColorStop(0.0, "rgba(255, 255, 250, 1.0)");
        g.addColorStop(0.55, "rgba(254, 249, 195, 0.98)");
        g.addColorStop(0.82, "rgba(253, 224, 71, 0.88)");
        g.addColorStop(0.95, "rgba(56, 189, 248, 0.32)");
        g.addColorStop(1.0, "rgba(56, 189, 248, 0.0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 512);

        const craters = [
          [195, 185, 58, 0.13],
          [310, 215, 72, 0.14],
          [235, 305, 64, 0.11],
          [165, 285, 42, 0.10],
          [325, 315, 46, 0.12]
        ];
        craters.forEach(([cx, cy, cr, alpha]) => {
          const cg = ctx.createRadialGradient(cx, cy, cr * 0.1, cx, cy, cr);
          cg.addColorStop(0, `rgba(180, 130, 40, ${alpha})`);
          cg.addColorStop(0.7, `rgba(140, 100, 30, ${alpha * 0.6})`);
          cg.addColorStop(1, "rgba(255, 250, 220, 0)");
          ctx.fillStyle = cg;
          ctx.beginPath();
          ctx.arc(cx, cy, cr, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.strokeStyle = "rgba(254, 240, 138, 0.65)";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(256, 256, 212, 0, Math.PI * 2);
        ctx.stroke();
        return new THREE.CanvasTexture(c);
      };
      const moonTex = createMoonCanvasTex();

      const seaCausticsMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0x0ea5e9,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.24, false);
      const seaCausticsDisc = new THREE.Mesh(new THREE.RingGeometry(2.2, 16.5, 64), seaCausticsMat);
      seaCausticsDisc.rotation.x = -Math.PI / 2;
      seaCausticsDisc.position.y = 0.008;
      seaCausticsDisc.renderOrder = -12;
      sceneGroup.add(seaCausticsDisc);

      const moonReflectGroup = new THREE.Group();
      moonReflectGroup.position.set(0, 0.020, 0);
      sceneGroup.add(moonReflectGroup);

      const moonCoreMat = registerMat(new THREE.MeshBasicMaterial({
        map: moonTex,
        color: 0xffffff,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.96, false);
      const moonInnerMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xfde047,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.68, false);
      const moonOuterHaloMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.48, false);

      const moonCoreDisc = new THREE.Mesh(new THREE.CircleGeometry(2.38, 64), moonCoreMat);
      moonCoreDisc.rotation.x = -Math.PI / 2;
      moonCoreDisc.renderOrder = -6;
      const moonInnerDisc = new THREE.Mesh(new THREE.CircleGeometry(2.95, 64), moonInnerMat);
      moonInnerDisc.rotation.x = -Math.PI / 2;
      moonInnerDisc.position.y = -0.003;
      moonInnerDisc.renderOrder = -7;
      const moonOuterHalo = new THREE.Mesh(new THREE.RingGeometry(2.10, 4.25, 64), moonOuterHaloMat);
      moonOuterHalo.rotation.x = -Math.PI / 2;
      moonOuterHalo.position.y = -0.006;
      moonOuterHalo.renderOrder = -8;
      moonReflectGroup.add(moonOuterHalo, moonInnerDisc, moonCoreDisc);

      const shimmerStripMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xfef9c3,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      }), 0.62, false);
      const moonShimmerStrips = Array.from({ length: 18 }, (_, i) => {
        const zOff = (i - 8.5) * 0.26;
        const halfChord = Math.sqrt(Math.max(0.2, 2.25 * 2.25 - zOff * zOff));
        const strip = new THREE.Mesh(
          new THREE.PlaneGeometry(halfChord * 1.85, 0.055),
          shimmerStripMat
        );
        strip.rotation.x = -Math.PI / 2;
        strip.position.set(0, 0.004, zOff);
        strip.renderOrder = -5;
        moonReflectGroup.add(strip);
        return { strip, zOff, phase: i * 0.65 };
      });

      const rippleRings = Array.from({ length: 10 }, (_, i) => {
        const rMat = registerMat(new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xfef08a : 0x7dd3fc,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false
        }), 0.72, false);
        const rMesh = new THREE.Mesh(new THREE.RingGeometry(0.45 + i * 0.48, 0.54 + i * 0.48, 64), rMat);
        rMesh.rotation.x = -Math.PI / 2;
        rMesh.position.y = 0.024 + i * 0.001;
        rMesh.renderOrder = -5;
        sceneGroup.add(rMesh);
        return { rMesh, rMat, i };
      });

      const nightWaveTubeMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xbae6fd,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }), 0.46, false);
      const nightWaveTubes = [2.6, 3.8, 5.2, 6.8, 8.6, 10.6].map((rad, idx) => {
        const pts = [];
        for (let s = 0; s < 56; s++) {
          const a = (s / 56) * Math.PI * 2;
          const r = rad + Math.sin(a * (7 + idx)) * 0.18;
          pts.push(new THREE.Vector3(Math.cos(a) * r, 0.015, Math.sin(a) * r));
        }
        const tube = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 64, 0.036, 8, true),
          nightWaveTubeMat
        );
        tube.renderOrder = -9;
        sceneGroup.add(tube);
        return { tube, idx };
      });

      const glintMat = registerMat(new THREE.MeshBasicMaterial({
        color: 0xfef9c3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }), 0.85, false);
      const waterGlints = Array.from({ length: 32 }, (_, i) => {
        const ga = (i / 32) * Math.PI * 2 + (i % 3) * 0.2;
        const gr = 1.8 + (i % 7) * 1.25;
        const glint = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), glintMat);
        glint.scale.set(1.4, 0.25, 1.4);
        glint.position.set(Math.cos(ga) * gr, 0.028, Math.sin(ga) * gr);
        glint.renderOrder = -5;
        sceneGroup.add(glint);
        return { glint, ga, gr, phase: i * 0.7 };
      });

      const lotusPetalMat = registerMat(new THREE.MeshBasicMaterial({ color: 0x7dd3fc }), 0.88, false);
      const lotusCoreMat = registerMat(new THREE.MeshBasicMaterial({ color: 0xfef08a }), 0.98, false);
      const cliffMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x0b192c, roughness: 0.85 }), 0.95, true);
      const seaLanterns = [];

      for (let l = 0; l < 12; l++) {
        const la = (l / 12) * Math.PI * 2 + 0.18;
        const lr = 4.9 + (l % 3) * 1.85;
        const lGrp = new THREE.Group();
        lGrp.position.set(Math.cos(la) * lr, 0.04, Math.sin(la) * lr);
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.16, 0.09, 8), lotusPetalMat);
        for (let pt = 0; pt < 8; pt++) {
          const pa = (pt / 8) * Math.PI * 2;
          const petal = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 5), lotusPetalMat);
          petal.position.set(Math.cos(pa) * 0.22, 0.06, Math.sin(pa) * 0.22);
          petal.rotation.z = -Math.cos(pa) * 0.65;
          petal.rotation.x = Math.sin(pa) * 0.65;
          lGrp.add(petal);
        }
        const wick = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), lotusCoreMat);
        wick.position.y = 0.09;
        lGrp.add(base, wick);
        sceneGroup.add(lGrp);
        seaLanterns.push({ lGrp, la, lr, phase: l * 0.9 });
      }

      for (let c = 0; c < 8; c++) {
        const ca = (c / 8) * Math.PI * 2;
        const cr = 13.2;
        const cliff = new THREE.Mesh(new THREE.ConeGeometry(1.8, 3.6 + (c % 2) * 1.4, 7), cliffMat);
        cliff.position.set(Math.cos(ca) * cr, 1.5, Math.sin(ca) * cr);
        cliff.renderOrder = -10;
        sceneGroup.add(cliff);
      }

      animCallbacks.push((dt, p) => {
        seaLanterns.forEach((sl) => {
          const curA = sl.la + p * 0.18;
          sl.lGrp.position.set(
            Math.cos(curA) * sl.lr,
            0.04 + Math.sin(p * 12 + sl.phase) * 0.03,
            Math.sin(curA) * sl.lr
          );
        });
        moonShimmerStrips.forEach(({ strip, phase }) => {
          strip.position.x = Math.sin(p * 18 + phase) * 0.24;
          const s = 0.85 + Math.cos(p * 15 + phase) * 0.18;
          strip.scale.set(s, 1, 1);
        });
        nightWaveTubes.forEach(({ tube, idx }) => {
          tube.rotation.y += dt * (idx % 2 === 0 ? 0.55 : -0.45);
          const sc = 0.96 + Math.sin(p * 8 + idx) * 0.05;
          tube.scale.set(sc, 1, sc);
        });
        waterGlints.forEach(({ glint, phase }) => {
          const pulse = 0.5 + Math.abs(Math.sin(p * 22 + phase)) * 0.9;
          glint.scale.set(pulse * 1.4, 0.25, pulse * 1.4);
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

    sceneGroup.renderOrder = -12;
    sceneGroup.traverse((obj) => {
      if (obj.isMesh && obj.renderOrder === 0) {
        obj.renderOrder = -10;
      }
    });

    return {
      sceneGroup,
      setFade(alpha, dt = 0.016, p = 0) {
        const clamped = Math.max(0, Math.min(1, alpha));
        sceneGroup.visible = clamped > 0.01;
        sceneGroup.position.y = -(1 - clamped) * 0.42;
        fadeMaterials.forEach(({ mat, baseOpacity, forceDepthWrite }) => {
          mat.opacity = baseOpacity * clamped;
          if (forceDepthWrite !== null) {
            mat.depthWrite = clamped > 0.35 ? forceDepthWrite : false;
          }
        });
        animCallbacks.forEach((cb) => cb(dt, p));
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

    // =========================================================================
    // 合体巨型神剑（模块化机械拼装总成：龙凤乾坤轩辕破天巨剑）
    // 包含 7 大独立可动拼装子部件，在空中与对齐姿态后的双武器逐步机械锁死合体！
    // =========================================================================
    const greatsword = new THREE.Group();

    // 1. 中央脊骨剑芯模块 (coreSpineGroup: 从上方插入两把对齐武器正中央)
    const coreSpineGroup = new THREE.Group();
    const fullerCore = new THREE.Mesh(new THREE.BoxGeometry(0.26, 3.05, 0.20), crimsonLacquerMat);
    fullerCore.position.y = 0.42;
    const runeLine = new THREE.Mesh(new THREE.BoxGeometry(0.095, 2.85, 0.24), crimsonGlowMat.clone());
    runeLine.position.y = 0.42;
    const centerTipSpear = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.45, 4), goldGlowMat.clone());
    centerTipSpear.rotation.x = Math.PI;
    centerTipSpear.scale.set(1.25, 1, 0.35);
    centerTipSpear.position.y = -1.42;
    coreSpineGroup.add(fullerCore, runeLine, centerTipSpear);
    for (let lk = 0; lk < 4; lk++) {
      const latch = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.11, 0.26), goldMat);
      latch.position.y = -0.45 + lk * 0.62;
      coreSpineGroup.add(latch);
    }

    // 2. 左右黄金巨剑刃翼模块 (leftBladeEdgeGroup / rightBladeEdgeGroup: 从左右两侧向内滑入包覆锁定双武器)
    const leftBladeEdgeGroup = new THREE.Group();
    const leftOuterBlade = new THREE.Mesh(new THREE.ConeGeometry(0.36, 3.85, 4), goldMat);
    leftOuterBlade.rotation.x = Math.PI;
    leftOuterBlade.scale.set(1.18, 1, 0.32);
    leftOuterBlade.position.set(-0.24, 0.02, 0);
    const leftEdgeGlow = new THREE.Mesh(new THREE.ConeGeometry(0.39, 3.92, 4), goldGlowMat.clone());
    leftEdgeGlow.rotation.x = Math.PI;
    leftEdgeGlow.scale.set(1.22, 1, 0.22);
    leftEdgeGlow.position.set(-0.26, 0.0, 0);
    leftBladeEdgeGroup.add(leftOuterBlade, leftEdgeGlow);

    const rightBladeEdgeGroup = new THREE.Group();
    const rightOuterBlade = new THREE.Mesh(new THREE.ConeGeometry(0.36, 3.85, 4), goldMat);
    rightOuterBlade.rotation.x = Math.PI;
    rightOuterBlade.scale.set(1.18, 1, 0.32);
    rightOuterBlade.position.set(0.24, 0.02, 0);
    const rightEdgeGlow = new THREE.Mesh(new THREE.ConeGeometry(0.39, 3.92, 4), goldGlowMat.clone());
    rightEdgeGlow.rotation.x = Math.PI;
    rightEdgeGlow.scale.set(1.22, 1, 0.22);
    rightEdgeGlow.position.set(0.26, 0.0, 0);
    rightBladeEdgeGroup.add(rightOuterBlade, rightEdgeGlow);

    // 3. 左右玄铁朱漆护手卡扣模块 (leftGuardClampGroup / rightGuardClampGroup: 从两侧横向咬合锁死)
    const leftGuardClampGroup = new THREE.Group();
    const guardLeftBox = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.38, 0.46), crimsonLacquerMat);
    guardLeftBox.position.set(-0.31, 1.92, 0);
    const guardLeftTrim = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.10, 0.50), goldMat);
    guardLeftTrim.position.set(-0.31, 2.08, 0);
    leftGuardClampGroup.add(guardLeftBox, guardLeftTrim);

    const rightGuardClampGroup = new THREE.Group();
    const guardRightBox = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.38, 0.46), crimsonLacquerMat);
    guardRightBox.position.set(0.31, 1.92, 0);
    const guardRightTrim = new THREE.Mesh(new THREE.BoxGeometry(0.70, 0.10, 0.50), goldMat);
    guardRightTrim.position.set(0.31, 2.08, 0);
    const guardGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.27, 1), goldGlowMat.clone());
    guardGem.position.set(0, 1.92, 0.25);
    const guardGemBack = guardGem.clone();
    guardGemBack.position.set(0, 1.92, -0.25);
    rightGuardClampGroup.add(guardRightBox, guardRightTrim, guardGem, guardGemBack);

    // 4. 左右龙凤展翼护手模块 (leftWingArrayGroup / rightWingArrayGroup: 绕枢轴扇形展开)
    const leftWingArrayGroup = new THREE.Group();
    leftWingArrayGroup.position.set(-0.48, 1.92, 0);
    const rightWingArrayGroup = new THREE.Group();
    rightWingArrayGroup.position.set(0.48, 1.92, 0);

    [-1, 1].forEach(s => {
      const targetWingGrp = s === -1 ? leftWingArrayGroup : rightWingArrayGroup;
      for (let w = 0; w < 3; w++) {
        const wingPinion = new THREE.Mesh(
          new THREE.ConeGeometry(0.15 - w * 0.02, 1.05 - w * 0.15, 6),
          w % 2 === 0 ? goldMat : crimsonLacquerMat
        );
        wingPinion.position.set(s * (0.28 + w * 0.30), 0.10 + w * 0.14, 0);
        wingPinion.rotation.z = -s * (0.95 - w * 0.18);
        targetWingGrp.add(wingPinion);
      }
      const lowerFangs = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.58, 5), goldMat);
      lowerFangs.position.set(s * 0.06, -0.36, 0);
      lowerFangs.rotation.z = s * 2.75;
      targetWingGrp.add(lowerFangs);
    });

    // 5. 剑柄柱体模块 (hiltColumnGroup: 从上方下压套接在护手正上方)
    const hiltColumnGroup = new THREE.Group();
    const hiltShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 1.22, 16), darkIronMat);
    hiltShaft.position.y = 2.65;
    hiltColumnGroup.add(hiltShaft);
    for (let r = 0; r < 4; r++) {
      const gripBand = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.030, 8, 20), goldMat);
      gripBand.rotation.x = Math.PI / 2;
      gripBand.position.y = 2.24 + r * 0.26;
      hiltColumnGroup.add(gripBand);
    }

    // 6. 帝王剑首冠冕模块 (pommelCrownGroup: 最后旋紧叩击封顶)
    const pommelCrownGroup = new THREE.Group();
    const pommelCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.19, 0.25, 14), goldMat);
    pommelCrown.position.y = 3.32;
    const pommelSphere = new THREE.Mesh(new THREE.OctahedronGeometry(0.31, 1), crimsonGlowMat.clone());
    pommelSphere.position.y = 3.60;
    pommelCrownGroup.add(pommelCrown, pommelSphere);

    // 7. 空中姿态校准与拼装导轨光环组 (dockingRingsGroup & swordHaloRing)
    const dockingRingsGroup = new THREE.Group();
    for (let dr = 0; dr < 3; dr++) {
      const dRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.95 - dr * 0.18, 0.035, 10, 32),
        dr % 2 === 0 ? goldGlowMat.clone() : crimsonGlowMat.clone()
      );
      dRing.rotation.x = Math.PI / 2;
      dRing.position.y = -0.35 + dr * 1.05;
      dockingRingsGroup.add(dRing);
    }

    const swordHaloRing = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.062, 12, 40), goldGlowMat.clone());
    swordHaloRing.position.y = 1.92;

    greatsword.add(
      coreSpineGroup,
      leftBladeEdgeGroup,
      rightBladeEdgeGroup,
      leftGuardClampGroup,
      rightGuardClampGroup,
      leftWingArrayGroup,
      rightWingArrayGroup,
      hiltColumnGroup,
      pommelCrownGroup,
      dockingRingsGroup,
      swordHaloRing
    );
    greatsword.userData = {
      swordHaloRing,
      coreSpineGroup,
      leftBladeEdgeGroup,
      rightBladeEdgeGroup,
      leftGuardClampGroup,
      rightGuardClampGroup,
      leftWingArrayGroup,
      rightWingArrayGroup,
      hiltColumnGroup,
      pommelCrownGroup,
      dockingRingsGroup
    };
    return { weapon1, weapon2, greatsword };
  },

});
