// =============================================================================
// 3D 棋盘、棋子网格建模、行棋物理轨迹与三大主题 3D 场景构建器 (scenes3d.js)
// =============================================================================
Object.assign(Xiangqi3DApp.prototype, {
  buildParkEnvironment() {
    this.parkGroup = new THREE.Group();
    this.scene.add(this.parkGroup);

    // 1. 远山层峦与碧水荷塘地面
    const groundGeo = new THREE.CylinderGeometry(58, 58, 1, 64);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x7ca972, roughness: 0.88, metalness: 0.04 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -4.85;
    ground.receiveShadow = true;
    this.parkGroup.add(ground);

    // 环绕式碧玉荷塘水面
    const pondGeo = new THREE.RingGeometry(10.2, 23.5, 64);
    const pondMat = new THREE.MeshStandardMaterial({
      color: 0x2d6a64,
      roughness: 0.16,
      metalness: 0.35,
      transparent: true,
      opacity: 0.90,
      side: THREE.DoubleSide
    });
    const pond = new THREE.Mesh(pondGeo, pondMat);
    pond.rotation.x = -Math.PI / 2;
    pond.position.y = -4.28;
    pond.receiveShadow = true;
    this.parkGroup.add(pond);

    // 远景青黛群山 3D 建模
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x4b745d, roughness: 0.85, metalness: 0.05 });
    const mistMountainMat = new THREE.MeshStandardMaterial({ color: 0x628c74, roughness: 0.82, metalness: 0.05 });
    const mountainConfigs = [
      { x: -28, z: -32, r: 14, h: 16, mat: mountainMat },
      { x: -12, z: -38, r: 18, h: 22, mat: mistMountainMat },
      { x: 14, z: -36, r: 16, h: 19, mat: mountainMat },
      { x: 32, z: -26, r: 15, h: 15, mat: mistMountainMat },
      { x: -35, z: 12, r: 14, h: 14, mat: mistMountainMat },
      { x: 34, z: 16, r: 15, h: 16, mat: mountainMat }
    ];
    mountainConfigs.forEach(mc => {
      const mGroup = new THREE.Group();
      const mainPeak = new THREE.Mesh(new THREE.ConeGeometry(mc.r, mc.h, 9), mc.mat);
      mainPeak.position.y = mc.h * 0.5 - 4.5;
      const subPeak = new THREE.Mesh(new THREE.ConeGeometry(mc.r * 0.68, mc.h * 0.72, 8), mc.mat);
      subPeak.position.set(mc.r * 0.45, mc.h * 0.36 - 4.5, mc.r * 0.2);
      mGroup.add(mainPeak, subPeak);
      mGroup.position.set(mc.x, 0, mc.z);
      this.parkGroup.add(mGroup);
    });

    // 2. 汉白玉雕花石台与青玉嵌环
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xdbe5de, roughness: 0.65, metalness: 0.10 });
    const carvedStoneMat = new THREE.MeshStandardMaterial({ color: 0xbac7bf, roughness: 0.58, metalness: 0.14 });
    const jadeMat = new THREE.MeshStandardMaterial({ color: 0x3b8a6b, roughness: 0.22, metalness: 0.18 });
    const bronzeAccentMat = new THREE.MeshStandardMaterial({ color: 0xc89838, roughness: 0.28, metalness: 0.86 });

    const patio = new THREE.Mesh(new THREE.CylinderGeometry(10.0, 10.6, 0.36, 48), stoneMat);
    patio.position.y = -4.22;
    patio.receiveShadow = true;
    this.parkGroup.add(patio);

    const patioStep = new THREE.Mesh(new THREE.CylinderGeometry(8.9, 9.3, 0.22, 48), carvedStoneMat);
    patioStep.position.y = -4.02;
    patioStep.receiveShadow = true;
    this.parkGroup.add(patioStep);

    const jadeInlayRing = new THREE.Mesh(new THREE.TorusGeometry(8.7, 0.10, 12, 64), jadeMat);
    jadeInlayRing.rotation.x = Math.PI / 2;
    jadeInlayRing.position.y = -3.90;
    this.parkGroup.add(jadeInlayRing);

    // 汉白玉石栏望柱（环绕平台）
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      if (Math.abs(Math.sin(a)) < 0.28 && Math.cos(a) > 0) continue; // 留出石桥通道
      const postGroup = new THREE.Group();
      const postShaft = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.95, 0.32), stoneMat);
      postShaft.position.y = 0.48;
      const postCap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 12), jadeMat);
      postCap.position.y = 1.05;
      postGroup.add(postShaft, postCap);
      postGroup.position.set(Math.cos(a) * 9.8, -4.05, Math.sin(a) * 9.8);
      postGroup.castShadow = true;
      this.parkGroup.add(postGroup);
    }

    // 3. 精雕青石棋案、束腰须弥座与桌上茶具香炉
    const tableTopMat = new THREE.MeshStandardMaterial({ color: 0x9fb0a8, roughness: 0.48, metalness: 0.15 });
    const tableDarkStoneMat = new THREE.MeshStandardMaterial({ color: 0x62706a, roughness: 0.68, metalness: 0.14 });

    const slab = new THREE.Mesh(new THREE.CylinderGeometry(8.12, 7.82, 0.78, 48), tableTopMat);
    slab.position.y = -0.62;
    slab.castShadow = true;
    slab.receiveShadow = true;
    this.parkGroup.add(slab);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(7.98, 0.16, 14, 64), tableDarkStoneMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.44;
    this.parkGroup.add(rim);

    const bronzeRim = new THREE.Mesh(new THREE.TorusGeometry(8.12, 0.06, 12, 64), bronzeAccentMat);
    bronzeRim.rotation.x = Math.PI / 2;
    bronzeRim.position.y = -0.34;
    this.parkGroup.add(bronzeRim);

    // 束腰莲瓣须弥座石柱
    const pillarUpper = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.2, 1.4, 24), tableDarkStoneMat);
    pillarUpper.position.y = -1.65;
    const pillarWaist = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.7, 20), carvedStoneMat);
    pillarWaist.position.y = -2.55;
    const pillarLower = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.4, 1.4, 24), tableDarkStoneMat);
    pillarLower.position.y = -3.45;
    const waistRing = new THREE.Mesh(new THREE.TorusGeometry(2.18, 0.08, 10, 32), bronzeAccentMat);
    waistRing.rotation.x = Math.PI / 2;
    waistRing.position.y = -2.55;
    this.parkGroup.add(pillarUpper, pillarWaist, pillarLower, waistRing);

    this.incenseSmokeRings = [];

    // 四方鼓形雕花石凳
    const stoolPositions = [
      { x: 0, z: 9.2 },
      { x: 0, z: -9.2 },
      { x: 9.2, z: 0 },
      { x: -9.2, z: 0 }
    ];
    stoolPositions.forEach(pos => {
      const stoolGroup = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.48, 0.42, 24), tableTopMat);
      seat.position.y = -2.08;
      seat.castShadow = true;
      const drumBelly = new THREE.Mesh(new THREE.SphereGeometry(1.38, 20, 16), carvedStoneMat);
      drumBelly.scale.set(1, 0.85, 1);
      drumBelly.position.y = -2.95;
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.48, 0.55, 20), tableDarkStoneMat);
      base.position.y = -3.82;
      stoolGroup.add(seat, drumBelly, base);
      stoolGroup.position.set(pos.x, 0, pos.z);
      stoolGroup.rotation.y = Math.atan2(pos.x, pos.z);
      this.parkGroup.add(stoolGroup);
    });

    // 4. 远景古典六角飞檐听泉亭 3D 建模
    const pavilionGroup = new THREE.Group();
    pavilionGroup.position.set(-16.5, -4.15, -15.5);
    const pavWoodMat = new THREE.MeshStandardMaterial({ color: 0x6e2c1b, roughness: 0.45, metalness: 0.12 });
    const pavRoofMat = new THREE.MeshStandardMaterial({ color: 0x2c3e35, roughness: 0.52, metalness: 0.22 });
    const pavFloor = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.5, 0.45, 6), stoneMat);
    pavFloor.position.y = 0.22;
    pavilionGroup.add(pavFloor);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.20, 4.6, 12), pavWoodMat);
      col.position.set(Math.cos(a) * 3.4, 2.6, Math.sin(a) * 3.4);
      col.castShadow = true;
      pavilionGroup.add(col);
      // 飞檐翘角脊兽
      const eaveSpur = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.2, 4), bronzeAccentMat);
      eaveSpur.position.set(Math.cos(a) * 4.8, 5.15, Math.sin(a) * 4.8);
      eaveSpur.rotation.z = -Math.cos(a) * 1.1;
      eaveSpur.rotation.x = Math.sin(a) * 1.1;
      pavilionGroup.add(eaveSpur);
    }
    const roofLower = new THREE.Mesh(new THREE.ConeGeometry(5.2, 1.8, 6), pavRoofMat);
    roofLower.position.y = 5.4;
    const roofUpper = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.5, 6), pavRoofMat);
    roofUpper.position.y = 6.65;
    const roofFinial = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 16), bronzeAccentMat);
    roofFinial.position.y = 7.55;
    pavilionGroup.add(roofLower, roofUpper, roofFinial);
    this.parkGroup.add(pavilionGroup);

    // 5. 荷塘汉白玉拱桥、游弋 3D 锦鲤与盛开荷花荷叶
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(14.5, -4.1, 4.2);
    bridgeGroup.rotation.y = 0.35;
    for (let s = -4; s <= 4; s++) {
      const archY = Math.cos((s / 5) * (Math.PI / 2)) * 1.35;
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 2.6), stoneMat);
      plank.position.set(s * 0.78, archY, 0);
      bridgeGroup.add(plank);
      [-1.15, 1.15].forEach(rz => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.65, 0.14), carvedStoneMat);
        post.position.set(s * 0.78, archY + 0.42, rz);
        bridgeGroup.add(post);
      });
    }
    this.parkGroup.add(bridgeGroup);

    // 荷塘立体荷叶与多层花瓣荷花
    const lotusLeafMat = new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.65, side: THREE.DoubleSide });
    const lotusPetalMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, emissive: 0xf472b6, emissiveIntensity: 0.12, roughness: 0.35 });
    const lotusCoords = [
      { x: -11.5, z: 6.5, s: 1.1, hasFlower: true },
      { x: -13.2, z: 4.8, s: 0.85, hasFlower: false },
      { x: 11.8, z: -7.5, s: 1.2, hasFlower: true },
      { x: 13.5, z: -5.8, s: 0.9, hasFlower: false },
      { x: -8.5, z: -12.8, s: 1.05, hasFlower: true },
      { x: 8.8, z: 12.6, s: 1.15, hasFlower: true }
    ];
    lotusCoords.forEach(lc => {
      const lGroup = new THREE.Group();
      lGroup.position.set(lc.x, -4.22, lc.z);
      lGroup.scale.setScalar(lc.s);
      const pad = new THREE.Mesh(new THREE.CircleGeometry(0.95, 20, 0, Math.PI * 1.92), lotusLeafMat);
      pad.rotation.x = -Math.PI / 2;
      lGroup.add(pad);
      if (lc.hasFlower) {
        const flower = new THREE.Group();
        flower.position.set(0.15, 0.08, 0.1);
        for (let p = 0; p < 8; p++) {
          const pa = (p * Math.PI) / 4;
          const petal = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 5), lotusPetalMat);
          petal.position.set(Math.cos(pa) * 0.18, 0.12, Math.sin(pa) * 0.18);
          petal.rotation.z = -Math.cos(pa) * 0.55;
          petal.rotation.x = Math.sin(pa) * 0.55;
          flower.add(petal);
        }
        const pistil = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), bronzeAccentMat);
        pistil.position.y = 0.12;
        flower.add(pistil);
        lGroup.add(flower);
      }
      this.parkGroup.add(lGroup);
    });

    // 动态游弋 3D 锦鲤模型
    this.koiFishList = [];
    const koiColors = [0xef4444, 0xf59e0b, 0xffffff, 0xf97316];
    for (let k = 0; k < 6; k++) {
      const koiGroup = new THREE.Group();
      const kMat = new THREE.MeshStandardMaterial({ color: koiColors[k % koiColors.length], roughness: 0.25, metalness: 0.12 });
      const body = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.72, 12), kMat);
      body.rotation.x = Math.PI / 2;
      const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 4), kMat);
      tail.rotation.x = -Math.PI / 2;
      tail.position.z = -0.46;
      koiGroup.add(body, tail);
      this.parkGroup.add(koiGroup);
      this.koiFishList.push({
        group: koiGroup,
        tail,
        radius: 12.2 + (k % 3) * 2.4,
        angle: (k / 6) * Math.PI * 2,
        speed: 0.22 + (k % 2) * 0.08,
        phase: k * 1.3
      });
    }

    // 6. 精细分节翠竹林（带竹节环与放射竹叶簇）与太湖奇石
    this.trees = [];
    const bambooCulmMat = new THREE.MeshStandardMaterial({ color: 0x4d8b55, roughness: 0.36, metalness: 0.08 });
    const bambooNodeMat = new THREE.MeshStandardMaterial({ color: 0xc2d8b8, roughness: 0.45 });
    const bambooLeafMat = new THREE.MeshStandardMaterial({ color: 0x366e42, roughness: 0.52, side: THREE.DoubleSide });
    const blossomLeafMat = new THREE.MeshStandardMaterial({ color: 0xe295a6, roughness: 0.48, side: THREE.DoubleSide });

    const bambooClusters = [
      { x: -13.2, z: -10.2, scale: 1.25, isBlossom: false },
      { x: 13.8, z: -10.8, scale: 1.32, isBlossom: false },
      { x: -14.8, z: 9.2, scale: 1.18, isBlossom: false },
      { x: 12.8, z: 11.4, scale: 1.22, isBlossom: true },
      { x: -6.8, z: -16.2, scale: 1.12, isBlossom: false },
      { x: 7.5, z: -16.8, scale: 1.28, isBlossom: false },
      { x: 18.2, z: 0.8, scale: 1.15, isBlossom: false }
    ];

    bambooClusters.forEach((cfg, idx) => {
      const clusterGroup = new THREE.Group();
      clusterGroup.position.set(cfg.x, -4.2, cfg.z);
      clusterGroup.scale.setScalar(cfg.scale);

      // 太湖石底座点缀
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 1), tableDarkStoneMat);
      rock.position.set(0.4, 0.55, -0.3);
      rock.scale.set(1.2, 1.4, 0.9);
      rock.castShadow = true;
      clusterGroup.add(rock);

      const swayGroup = new THREE.Group();
      const culmOffsets = [[0, 0, 0, 1.0], [-0.45, 0.32, 0.06, 0.88], [0.42, -0.28, -0.05, 0.92], [0.18, 0.48, 0.04, 0.80]];
      culmOffsets.forEach(([ox, oz, tilt, hScale]) => {
        const stalkGroup = new THREE.Group();
        stalkGroup.position.set(ox, 0, oz);
        stalkGroup.rotation.z = tilt;
        const segments = 6;
        const segH = 1.35 * hScale;
        for (let s = 0; s < segments; s++) {
          const r = 0.14 * (1 - s * 0.08);
          const seg = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.95, r, segH, 10), bambooCulmMat);
          seg.position.y = s * segH + segH * 0.5;
          seg.castShadow = true;
          stalkGroup.add(seg);

          const nodeRing = new THREE.Mesh(new THREE.TorusGeometry(r * 1.04, 0.022, 8, 14), bambooNodeMat);
          nodeRing.rotation.x = Math.PI / 2;
          nodeRing.position.y = (s + 1) * segH;
          stalkGroup.add(nodeRing);

          if (s >= 2) {
            for (let b = 0; b < 4; b++) {
              const ba = (b * Math.PI) / 2 + s * 0.7;
              const leaf = new THREE.Mesh(
                new THREE.ConeGeometry(0.24, 1.25, 4),
                cfg.isBlossom && (s + b) % 2 === 0 ? blossomLeafMat : bambooLeafMat
              );
              leaf.scale.set(0.32, 1, 1);
              leaf.position.set(Math.cos(ba) * 0.55, (s + 0.8) * segH, Math.sin(ba) * 0.55);
              leaf.rotation.z = -Math.cos(ba) * 1.15;
              leaf.rotation.x = Math.sin(ba) * 1.15;
              stalkGroup.add(leaf);
            }
          }
        }
        swayGroup.add(stalkGroup);
      });

      clusterGroup.add(swayGroup);
      this.parkGroup.add(clusterGroup);
      this.trees.push({ group: swayGroup, phase: idx * 1.3 });
    });


    this.breezeParticles = [];
    const petalGeo = new THREE.PlaneGeometry(0.18, 0.12);
    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xffe4e6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.84
    });

    for (let i = 0; i < 44; i++) {
      const p = new THREE.Mesh(petalGeo, petalMat);
      p.position.set(
        (Math.random() - 0.5) * 26,
        Math.random() * 10 - 1,
        (Math.random() - 0.5) * 26
      );
      p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.parkGroup.add(p);
      this.breezeParticles.push({
        mesh: p,
        speedY: 0.4 + Math.random() * 0.5,
        speedX: 0.5 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2
      });
    }
  },

  buildBattlefieldEnvironment() {
    this.battlefieldGroup = new THREE.Group();
    this.battlefieldGroup.visible = this.currentSceneId === 'ancient_battlefield';
    this.scene.add(this.battlefieldGroup);

    const groundGeo = new THREE.CylinderGeometry(58, 58, 1, 64);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x4a2f22, roughness: 0.86, metalness: 0.08 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -4.8;
    ground.receiveShadow = true;
    this.battlefieldGroup.add(ground);

    const outerRingGeo = new THREE.RingGeometry(11.2, 29.0, 48);
    const outerRingMat = new THREE.MeshStandardMaterial({
      color: 0x2c1b13,
      roughness: 0.90,
      side: THREE.DoubleSide
    });
    const outerSandRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerSandRing.rotation.x = -Math.PI / 2;
    outerSandRing.position.y = -4.28;
    outerSandRing.receiveShadow = true;
    this.battlefieldGroup.add(outerSandRing);

    const obsidianStoneMat = new THREE.MeshStandardMaterial({
      color: 0x262322,
      roughness: 0.65,
      metalness: 0.28
    });
    const darkIronMat = new THREE.MeshStandardMaterial({
      color: 0x1b1918,
      roughness: 0.38,
      metalness: 0.72
    });
    const gildedBronzeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x78350f,
      emissiveIntensity: 0.26,
      roughness: 0.28,
      metalness: 0.88
    });
    const crimsonLacquerMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      roughness: 0.42,
      metalness: 0.24
    });
    const woodBeamMat = new THREE.MeshStandardMaterial({ color: 0x472d1e, roughness: 0.75 });

    // 1. 八角玄铁点将台与饕餮兽首护角
    const daisBase = new THREE.Mesh(new THREE.CylinderGeometry(10.8, 11.8, 0.38, 8), obsidianStoneMat);
    daisBase.position.y = -4.22;
    daisBase.receiveShadow = true;
    this.battlefieldGroup.add(daisBase);

    const daisStep = new THREE.Mesh(new THREE.CylinderGeometry(9.3, 9.9, 0.30, 8), darkIronMat);
    daisStep.position.y = -3.94;
    daisStep.receiveShadow = true;
    this.battlefieldGroup.add(daisStep);

    const daisBronzeRim = new THREE.Mesh(new THREE.TorusGeometry(9.52, 0.12, 12, 8), gildedBronzeMat);
    daisBronzeRim.rotation.x = Math.PI / 2;
    daisBronzeRim.rotation.z = Math.PI / 8;
    daisBronzeRim.position.y = -3.84;
    this.battlefieldGroup.add(daisBronzeRim);

    const tableSlab = new THREE.Mesh(new THREE.CylinderGeometry(8.10, 7.78, 0.80, 32), darkIronMat);
    tableSlab.position.y = -0.62;
    tableSlab.castShadow = true;
    tableSlab.receiveShadow = true;
    this.battlefieldGroup.add(tableSlab);

    const tableBronzeRim = new THREE.Mesh(new THREE.TorusGeometry(7.92, 0.18, 14, 64), gildedBronzeMat);
    tableBronzeRim.rotation.x = Math.PI / 2;
    tableBronzeRim.position.y = -0.44;
    this.battlefieldGroup.add(tableBronzeRim);

    const rivetGeo = new THREE.SphereGeometry(0.14, 12, 12);
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8;
      const rivet = new THREE.Mesh(rivetGeo, gildedBronzeMat);
      rivet.position.set(Math.cos(a) * 7.96, -0.62, Math.sin(a) * 7.96);
      this.battlefieldGroup.add(rivet);
    }


    const drumPedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.68, 3.28, 3.5, 24), crimsonLacquerMat);
    drumPedestal.position.y = -2.55;
    drumPedestal.castShadow = true;
    drumPedestal.receiveShadow = true;
    this.battlefieldGroup.add(drumPedestal);

    const drumRingTop = new THREE.Mesh(new THREE.TorusGeometry(2.74, 0.11, 10, 36), gildedBronzeMat);
    drumRingTop.rotation.x = Math.PI / 2;
    drumRingTop.position.y = -1.2;
    const drumRingBot = new THREE.Mesh(new THREE.TorusGeometry(3.18, 0.11, 10, 36), gildedBronzeMat);
    drumRingBot.rotation.x = Math.PI / 2;
    drumRingBot.position.y = -3.6;
    this.battlefieldGroup.add(drumRingTop, drumRingBot);

    const drumStoolCoords = [
      { x: 0, z: 9.2 },
      { x: 0, z: -9.2 },
      { x: 9.2, z: 0 },
      { x: -9.2, z: 0 }
    ];
    drumStoolCoords.forEach(pos => {
      const sg = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.48, 1.95, 24), crimsonLacquerMat);
      body.position.y = -2.95;
      body.castShadow = true;
      body.receiveShadow = true;
      const topSeat = new THREE.Mesh(new THREE.CylinderGeometry(1.76, 1.72, 0.32, 24), darkIronMat);
      topSeat.position.y = -1.92;
      topSeat.castShadow = true;
      const goldBand = new THREE.Mesh(new THREE.TorusGeometry(1.74, 0.08, 10, 32), gildedBronzeMat);
      goldBand.rotation.x = Math.PI / 2;
      goldBand.position.y = -1.92;
      sg.add(body, topSeat, goldBand);
      sg.position.set(pos.x, 0, pos.z);
      sg.rotation.y = Math.atan2(pos.x, pos.z);
      this.battlefieldGroup.add(sg);
    });

    // 2. 四角三足双耳青铜火鼎与多层动态烈焰
    this.battlefieldFlames = [];
    this.battlefieldLights = [];
    const brazierCoords = [
      { x: -7.8, z: -7.8 },
      { x: 7.8, z: -7.8 },
      { x: -7.8, z: 7.8 },
      { x: 7.8, z: 7.8 }
    ];
    brazierCoords.forEach((bp, idx) => {
      const bg = new THREE.Group();
      bg.position.set(bp.x, 0, bp.z);

      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 0.68, 0.95, 20), darkIronMat);
      bowl.position.y = -1.75;
      bowl.castShadow = true;
      bg.add(bowl);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.10, 12, 28), gildedBronzeMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = -1.28;
      bg.add(rim);

      // 双立耳与三足鼎腿
      [-1.08, 1.08].forEach(ex => {
        const ear = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.48, 0.36), gildedBronzeMat);
        ear.position.set(ex, -1.06, 0);
        bg.add(ear);
      });
      for (let l = 0; l < 3; l++) {
        const la = (l * Math.PI * 2) / 3 + idx * 0.4;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 2.2, 12), gildedBronzeMat);
        leg.position.set(Math.cos(la) * 0.65, -3.1, Math.sin(la) * 0.65);
        bg.add(leg);
      }

      const coalBed = new THREE.Mesh(
        new THREE.CircleGeometry(0.96, 20),
        new THREE.MeshBasicMaterial({ color: 0xea580c })
      );
      coalBed.rotation.x = -Math.PI / 2;
      coalBed.position.y = -1.29;
      bg.add(coalBed);

      const flameGroup = new THREE.Group();
      flameGroup.position.y = -1.26;
      const outerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.76, 1.95, 12),
        new THREE.MeshBasicMaterial({
          color: 0xf97316,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      outerFlame.position.y = 0.88;
      const innerFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.45, 1.42, 12),
        new THREE.MeshBasicMaterial({
          color: 0xfef08a,
          transparent: true,
          opacity: 0.94,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      innerFlame.position.y = 0.64;
      flameGroup.add(outerFlame, innerFlame);
      bg.add(flameGroup);

      const fireLight = new THREE.PointLight(0xff7b24, 0.48, 16, 1.8);
      fireLight.position.set(0, -0.2, 0);
      bg.add(fireLight);

      this.battlefieldGroup.add(bg);
      this.battlefieldFlames.push({ group: flameGroup, outer: outerFlame, inner: innerFlame, phase: idx * 1.7 });
      this.battlefieldLights.push({ light: fireLight, baseIntensity: 0.48, phase: idx * 2.1 });
    });

    // 3. 远景巍峨城堞箭楼、夔纹巨型战鼓架与十八般兵器架建模
    const wallGroup = new THREE.Group();
    wallGroup.position.set(0, -4.2, -21.5);
    const mainWall = new THREE.Mesh(new THREE.BoxGeometry(28, 5.2, 2.6), obsidianStoneMat);
    mainWall.position.y = 2.6;
    wallGroup.add(mainWall);
    for (let m = -12; m <= 12; m += 2.0) {
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.95, 0.65), obsidianStoneMat);
      merlon.position.set(m, 5.65, 0.95);
      wallGroup.add(merlon);
    }
    // 城门洞与重檐箭楼
    const gateTower = new THREE.Mesh(new THREE.BoxGeometry(7.6, 3.8, 3.2), crimsonLacquerMat);
    gateTower.position.y = 7.1;
    const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(6.4, 2.2, 4), darkIronMat);
    towerRoof.rotation.y = Math.PI / 4;
    towerRoof.position.y = 10.1;
    wallGroup.add(gateTower, towerRoof);
    this.battlefieldGroup.add(wallGroup);

    // 夔纹巨型战鼓与动态击鼓槌建模
    this.warDrumGroup = new THREE.Group();
    this.warDrumGroup.position.set(-14.5, -4.15, -4.5);
    this.warDrumGroup.rotation.y = 0.45;
    const drumStandL = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 4.5, 10), woodBeamMat);
    drumStandL.position.set(-1.6, 2.25, 0);
    const drumStandR = drumStandL.clone();
    drumStandR.position.x = 1.6;
    const drumCrossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.8, 10), gildedBronzeMat);
    drumCrossbar.rotation.z = Math.PI / 2;
    drumCrossbar.position.y = 4.2;
    const bigDrumBody = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 1.8, 24), crimsonLacquerMat);
    bigDrumBody.rotation.x = Math.PI / 2;
    bigDrumBody.position.y = 2.6;
    const drumSkin = new THREE.Mesh(new THREE.CircleGeometry(1.22, 24), new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.55 }));
    drumSkin.position.set(0, 2.6, 0.92);
    this.warDrumMallet = new THREE.Group();
    this.warDrumMallet.position.set(0, 2.6, 1.45);
    const malletShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), woodBeamMat);
    malletShaft.position.y = -0.35;
    const malletHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), gildedBronzeMat);
    malletHead.position.y = 0.22;
    this.warDrumMallet.add(malletShaft, malletHead);
    this.warDrumGroup.add(drumStandL, drumStandR, drumCrossbar, bigDrumBody, drumSkin, this.warDrumMallet);
    this.battlefieldGroup.add(this.warDrumGroup);

    // 十八般兵器架与方天画戟建模
    const rackGroup = new THREE.Group();
    rackGroup.position.set(14.5, -4.15, -4.2);
    rackGroup.rotation.y = -0.45;
    const rackBase = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.28, 0.9), woodBeamMat);
    rackBase.position.y = 0.14;
    const rackBar = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.16, 0.18), gildedBronzeMat);
    rackBar.position.y = 2.2;
    rackGroup.add(rackBase, rackBar);
    for (let w = -2; w <= 2; w++) {
      const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 4.4, 8), woodBeamMat);
      spear.position.set(w * 0.55, 2.2, 0);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.55, 4), gildedBronzeMat);
      tip.position.set(w * 0.55, 4.55, 0);
      rackGroup.add(spear, tip);
    }
    this.battlefieldGroup.add(rackGroup);

    // 4. 猎猎战旗（带戟头与横杆）
    this.warBanners = [];
    const bannerConfigs = [
      { x: -13.2, z: -10.8, isRed: false, scale: 1.15 },
      { x: 13.2, z: -10.8, isRed: false, scale: 1.15 },
      { x: -13.2, z: 10.8, isRed: true, scale: 1.15 },
      { x: 13.2, z: 10.8, isRed: true, scale: 1.15 },
      { x: -16.5, z: 2.2, isRed: false, scale: 1.0 },
      { x: 16.5, z: 2.2, isRed: true, scale: 1.0 }
    ];
    bannerConfigs.forEach((cfg, idx) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(cfg.x, 0, cfg.z);
      bGroup.scale.setScalar(cfg.scale);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 10.5, 10), darkIronMat);
      pole.position.y = 1.0;
      pole.castShadow = true;
      bGroup.add(pole);

      const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.85, 6), gildedBronzeMat);
      spearTip.position.y = 6.55;
      bGroup.add(spearTip);

      const crossBar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), gildedBronzeMat);
      crossBar.rotation.z = Math.PI / 2;
      crossBar.position.set(1.15, 5.65, 0);
      bGroup.add(crossBar);

      const clothGeo = new THREE.PlaneGeometry(2.3, 4.4, 8, 8);
      const clothMat = new THREE.MeshStandardMaterial({
        color: cfg.isRed ? 0x991b1b : 0x111827,
        emissive: cfg.isRed ? 0x450a0a : 0x090d16,
        emissiveIntensity: 0.35,
        roughness: 0.6,
        side: THREE.DoubleSide
      });
      const cloth = new THREE.Mesh(clothGeo, clothMat);
      cloth.position.set(1.18, 3.35, 0);
      cloth.castShadow = true;
      bGroup.add(cloth);

      this.battlefieldGroup.add(bGroup);
      this.warBanners.push({ mesh: cloth, phase: idx * 1.4, baseX: 1.18 });
    });

    // 拒马鹿角防线
    const barricadeCoords = [
      { x: -11.5, z: -15.5, ry: 0.35 },
      { x: 11.5, z: -15.5, ry: -0.35 },
      { x: -15.8, z: 6.5, ry: 1.1 },
      { x: 15.8, z: -6.5, ry: -1.1 }
    ];
    barricadeCoords.forEach(bc => {
      const bg = new THREE.Group();
      bg.position.set(bc.x, -3.55, bc.z);
      bg.rotation.y = bc.ry;

      const mainLog = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 4.2, 8), woodBeamMat);
      mainLog.rotation.z = Math.PI / 2;
      bg.add(mainLog);

      for (let i = -1; i <= 1; i++) {
        const s1 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 2.6, 6), woodBeamMat);
        s1.position.x = i * 1.25;
        s1.rotation.x = 0.68;
        const s2 = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 2.6, 6), woodBeamMat);
        s2.position.x = i * 1.25;
        s2.rotation.x = -0.68;
        bg.add(s1, s2);
      }
      this.battlefieldGroup.add(bg);
    });

    this.battlefieldEmbers = [];
    const glowTex = typeof getGlowParticleTexture === 'function' ? getGlowParticleTexture() : null;
    for (let i = 0; i < 46; i++) {
      const spMat = new THREE.SpriteMaterial({
        map: glowTex,
        color: i % 3 === 0 ? 0xfef08a : (i % 2 === 0 ? 0xf97316 : 0xef4444),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sp = new THREE.Sprite(spMat);
      const s = 0.18 + Math.random() * 0.26;
      sp.scale.set(s, s, 1);
      sp.position.set(
        (Math.random() - 0.5) * 26,
        Math.random() * 11 - 3.5,
        (Math.random() - 0.5) * 26
      );
      sp.visible = this.currentSceneId === 'ancient_battlefield';
      this.battlefieldGroup.add(sp);
      this.battlefieldEmbers.push({
        sprite: sp,
        baseScale: s,
        speedY: 0.55 + Math.random() * 0.85,
        speedX: 0.35 + Math.random() * 0.55,
        phase: Math.random() * Math.PI * 2
      });
    }
  },

  buildImperialStudyEnvironment() {
    this.studyGroup = new THREE.Group();
    this.studyGroup.visible = this.currentSceneId === 'imperial_study';
    this.scene.add(this.studyGroup);

    const mirrorPoolMat = new THREE.MeshStandardMaterial({
      color: 0x0a192f,
      roughness: 0.14,
      metalness: 0.55
    });
    const whiteJadeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      emissive: 0xe2e8f0,
      emissiveIntensity: 0.08,
      roughness: 0.18,
      metalness: 0.12
    });
    const celadonJadeMat = new THREE.MeshStandardMaterial({
      color: 0xcffafe,
      emissive: 0x0891b2,
      emissiveIntensity: 0.12,
      roughness: 0.20,
      metalness: 0.15
    });
    const gildedMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0x92400e,
      emissiveIntensity: 0.24,
      roughness: 0.20,
      metalness: 0.88
    });
    const vermilionMat = new THREE.MeshStandardMaterial({
      color: 0x881313,
      roughness: 0.32,
      metalness: 0.18
    });
    const sandalwoodMat = new THREE.MeshStandardMaterial({
      color: 0x361c12,
      roughness: 0.26,
      metalness: 0.22
    });
    const darkRoofMat = new THREE.MeshStandardMaterial({
      color: 0x172554,
      roughness: 0.35,
      metalness: 0.35
    });

    // 1. 星河镜池底座与双层太极星轨法阵
    const poolFloor = new THREE.Mesh(new THREE.CylinderGeometry(62, 62, 1, 64), mirrorPoolMat);
    poolFloor.position.y = -4.85;
    poolFloor.receiveShadow = true;
    this.studyGroup.add(poolFloor);

    const carpetTex = typeof getBaguaMagicTexture === 'function' ? getBaguaMagicTexture() : null;
    const starlightAstrolabe = new THREE.Mesh(
      new THREE.CircleGeometry(12.2, 64),
      new THREE.MeshBasicMaterial({
        map: carpetTex,
        color: 0x7dd3fc,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    starlightAstrolabe.rotation.x = -Math.PI / 2;
    starlightAstrolabe.position.y = -3.76;
    this.studyGroup.add(starlightAstrolabe);
    this.studyAstrolabe = starlightAstrolabe;

    // 2. 三层汉白玉莲花须弥座、16根雕云望柱栏杆与四方丹陛玉阶
    const daisTier1 = new THREE.Mesh(new THREE.CylinderGeometry(11.4, 12.2, 0.38, 32), whiteJadeMat);
    daisTier1.position.y = -4.18;
    daisTier1.receiveShadow = true;
    const daisTier2 = new THREE.Mesh(new THREE.CylinderGeometry(9.8, 10.4, 0.34, 32), whiteJadeMat);
    daisTier2.position.y = -3.86;
    daisTier2.receiveShadow = true;
    const daisGoldRing = new THREE.Mesh(new THREE.TorusGeometry(9.86, 0.09, 12, 64), gildedMat);
    daisGoldRing.rotation.x = Math.PI / 2;
    daisGoldRing.position.y = -3.72;
    this.studyGroup.add(daisTier1, daisTier2, daisGoldRing);

    // 四方汉白玉丹陛踏步台阶
    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach(ang => {
      const stairGroup = new THREE.Group();
      stairGroup.rotation.y = ang;
      for (let s = 0; s < 3; s++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(2.6, 0.18, 0.65),
          s === 1 ? celadonJadeMat : whiteJadeMat
        );
        step.position.set(0, -4.25 + s * 0.16, 10.2 + (2 - s) * 0.55);
        stairGroup.add(step);
      }
      this.studyGroup.add(stairGroup);
    });

    // 16根汉白玉雕花望柱与双层玉栏（留出四方踏步通道）
    const balustradeRadius = 9.65;
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16;
      const postGroup = new THREE.Group();
      postGroup.position.set(Math.cos(a) * balustradeRadius, -3.70, Math.sin(a) * balustradeRadius);
      const postShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 1.05, 12), whiteJadeMat);
      postShaft.position.y = 0.52;
      const postCap = new THREE.Mesh(new THREE.SphereGeometry(0.20, 12, 12), gildedMat);
      postCap.position.y = 1.12;
      postGroup.add(postShaft, postCap);
      this.studyGroup.add(postGroup);

      // 相邻望柱之间的玉石栏板（跳过四个正方向入口）
      if (i % 4 !== 3 && i % 4 !== 0) {
        const nextA = ((i + 1) * Math.PI * 2) / 16;
        const mx = (Math.cos(a) + Math.cos(nextA)) * 0.5 * balustradeRadius;
        const mz = (Math.sin(a) + Math.sin(nextA)) * 0.5 * balustradeRadius;
        const segLen = 2 * balustradeRadius * Math.sin(Math.PI / 16);
        const railGroup = new THREE.Group();
        railGroup.position.set(mx, -3.70, mz);
        railGroup.rotation.y = -((a + nextA) * 0.5) + Math.PI / 2;
        const topRail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, segLen, 8), whiteJadeMat);
        topRail.rotation.z = Math.PI / 2;
        topRail.position.y = 0.86;
        const midPanel = new THREE.Mesh(new THREE.BoxGeometry(segLen * 0.88, 0.42, 0.08), celadonJadeMat);
        midPanel.position.y = 0.44;
        railGroup.add(topRail, midPanel);
        this.studyGroup.add(railGroup);
      }
    }

    // 3. 紫檀嵌金御案、仙鹤博山香炉（带动态青烟环）、白玉酒壶对杯与传国玉玺
    const tableSlab = new THREE.Mesh(new THREE.CylinderGeometry(8.12, 7.82, 0.82, 48), sandalwoodMat);
    tableSlab.position.y = -0.62;
    tableSlab.castShadow = true;
    tableSlab.receiveShadow = true;
    const goldRim = new THREE.Mesh(new THREE.TorusGeometry(7.98, 0.15, 14, 64), gildedMat);
    goldRim.rotation.x = Math.PI / 2;
    goldRim.position.y = -0.42;
    const jadeInlayRim = new THREE.Mesh(new THREE.TorusGeometry(7.55, 0.06, 10, 64), whiteJadeMat);
    jadeInlayRim.rotation.x = Math.PI / 2;
    jadeInlayRim.position.y = -0.20;
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2.65, 3.35, 3.25, 24), sandalwoodMat);
    pedestal.position.y = -2.42;
    pedestal.castShadow = true;
    const pedestalGoldBand = new THREE.Mesh(new THREE.TorusGeometry(2.85, 0.10, 10, 36), gildedMat);
    pedestalGoldBand.rotation.x = Math.PI / 2;
    pedestalGoldBand.position.y = -1.65;
    this.studyGroup.add(tableSlab, goldRim, jadeInlayRim, pedestal, pedestalGoldBand);

    // 仙鹤博山金香炉与袅袅动态青烟环
    this.studySmokeRings = [];

    // 4. 四方完整四足落地紫檀官帽太师椅（含四条椅腿、脚踏横枨、锦垫、S型靠背板、扶手与金箍官帽搭脑）
    const chairCoords = [
      { x: 0, z: 8.8, ry: 0 },
      { x: 0, z: -8.8, ry: Math.PI },
      { x: 8.8, z: 0, ry: Math.PI / 2 },
      { x: -8.8, z: 0, ry: -Math.PI / 2 }
    ];
    chairCoords.forEach(cc => {
      const cg = new THREE.Group();
      cg.position.set(cc.x, 0, cc.z);
      cg.rotation.y = cc.ry;

      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.22, 1.66), sandalwoodMat);
      seat.position.y = -2.12;
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.10, 1.48), vermilionMat);
      cushion.position.y = -1.98;
      cg.add(seat, cushion);

      // 四根落地实木椅腿 + 底部横枨（直达须弥座地面 y = -3.70）
      [[-0.84, -0.72], [0.84, -0.72], [-0.84, 0.72], [0.84, 0.72]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 1.60, 10), sandalwoodMat);
        leg.position.set(lx, -2.92, lz);
        cg.add(leg);
      });
      const frontStretcher = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.68, 8), gildedMat);
      frontStretcher.rotation.z = Math.PI / 2;
      frontStretcher.position.set(0, -3.35, -0.72);
      cg.add(frontStretcher);

      // 左右后立柱、背板与官帽搭脑
      [-0.84, 0.84].forEach(bx => {
        const backPost = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 1.78, 10), sandalwoodMat);
        backPost.position.set(bx, -1.16, 0.72);
        const armRest = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 1.52), sandalwoodMat);
        armRest.position.set(bx, -1.36, 0.0);
        const armSupport = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.74, 8), sandalwoodMat);
        armSupport.position.set(bx, -1.74, -0.58);
        cg.add(backPost, armRest, armSupport);
      });

      const splat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.68, 0.10), sandalwoodMat);
      splat.position.set(0, -1.16, 0.72);
      const splatJade = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.12, 16), whiteJadeMat);
      splatJade.rotation.x = Math.PI / 2;
      splatJade.position.set(0, -1.08, 0.72);
      const topRail = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 2.24, 12), gildedMat);
      topRail.rotation.z = Math.PI / 2;
      topRail.position.set(0, -0.26, 0.72);
      cg.add(splat, splatJade, topRail);
      this.studyGroup.add(cg);
    });

    // 5. 远景九天皎月、重檐飞角摘星仙阁与紫檀六曲云龙画屏
    this.studyMoonGroup = new THREE.Group();
    this.studyMoonGroup.position.set(0, 8.2, -25.5);
    const moonCore = new THREE.Mesh(
      new THREE.SphereGeometry(3.6, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xfef9c3 })
    );
    const moonAura1 = new THREE.Mesh(
      new THREE.RingGeometry(3.65, 4.85, 48),
      new THREE.MeshBasicMaterial({
        color: 0xfde047,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    const moonAura2 = new THREE.Mesh(
      new THREE.RingGeometry(4.85, 6.8, 48),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    this.studyMoonGroup.add(moonCore, moonAura1, moonAura2);
    this.studyGroup.add(this.studyMoonGroup);

    // 重檐飞角摘星仙阁
    const pavilionGroup = new THREE.Group();
    pavilionGroup.position.set(0, -4.15, -20.5);
    const pavBase = new THREE.Mesh(new THREE.BoxGeometry(16.5, 1.6, 5.2), whiteJadeMat);
    pavBase.position.y = 0.8;
    const pavHall = new THREE.Mesh(new THREE.BoxGeometry(12.8, 4.4, 4.0), vermilionMat);
    pavHall.position.y = 3.8;
    // 暖光棂窗
    for (let w = -2; w <= 2; w++) {
      const winPane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.45, 2.35),
        new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.82 })
      );
      winPane.position.set(w * 2.2, 3.8, 2.02);
      pavilionGroup.add(winPane);
    }
    const lowerEave = new THREE.Mesh(new THREE.ConeGeometry(10.8, 2.2, 4), darkRoofMat);
    lowerEave.rotation.y = Math.PI / 4;
    lowerEave.scale.set(1.35, 1, 0.58);
    lowerEave.position.y = 6.8;
    const upperHall = new THREE.Mesh(new THREE.BoxGeometry(8.6, 2.8, 3.0), vermilionMat);
    upperHall.position.y = 8.4;
    const upperEave = new THREE.Mesh(new THREE.ConeGeometry(8.0, 2.4, 4), darkRoofMat);
    upperEave.rotation.y = Math.PI / 4;
    upperEave.scale.set(1.32, 1, 0.58);
    upperEave.position.y = 10.6;
    const roofFinial = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 1), gildedMat);
    roofFinial.position.y = 12.1;
    pavilionGroup.add(pavBase, pavHall, lowerEave, upperHall, upperEave, roofFinial);
    this.studyGroup.add(pavilionGroup);

    // 紫檀六曲云龙画屏（含落地铜座）
    const screenGroup = new THREE.Group();
    screenGroup.position.set(0, -3.70, -13.4);
    for (let p = -2.5; p <= 2.5; p += 1.0) {
      const panelGroup = new THREE.Group();
      const angle = (p % 2 === 0 ? 0.16 : -0.16);
      panelGroup.position.set(p * 1.85, 2.45, Math.abs(p) * 0.28);
      panelGroup.rotation.y = angle;
      const outerFrame = new THREE.Mesh(new THREE.BoxGeometry(1.80, 4.9, 0.14), sandalwoodMat);
      const innerSilk = new THREE.Mesh(new THREE.BoxGeometry(1.56, 4.4, 0.16), vermilionMat);
      const goldMedallion = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.18, 20), gildedMat);
      goldMedallion.rotation.x = Math.PI / 2;
      goldMedallion.position.y = 0.42;
      const footStand = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.22, 0.46), gildedMat);
      footStand.position.y = -2.36;
      panelGroup.add(outerFrame, innerSilk, goldMedallion, footStand);
      screenGroup.add(panelGroup);
    }
    this.studyGroup.add(screenGroup);

    // 四根朱漆蟠龙金柱
    const pillarCoords = [
      { x: -13.2, z: -11.2 },
      { x: 13.2, z: -11.2 },
      { x: -13.2, z: 11.2 },
      { x: 13.2, z: 11.2 }
    ];
    pillarCoords.forEach(pc => {
      const pg = new THREE.Group();
      pg.position.set(pc.x, 0, pc.z);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.90, 15.5, 24), vermilionMat);
      col.position.y = 3.2;
      col.castShadow = true;
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.44, 0.85, 24), whiteJadeMat);
      base.position.y = -4.25;
      const dragonPoints = [];
      for (let t = 0; t <= 32; t++) {
        const f = t / 32;
        const a = f * Math.PI * 5;
        dragonPoints.push(new THREE.Vector3(Math.cos(a) * 0.90, -3.2 + f * 9.5, Math.sin(a) * 0.90));
      }
      const dragonCurve = new THREE.CatmullRomCurve3(dragonPoints);
      const dragonCoil = new THREE.Mesh(new THREE.TubeGeometry(dragonCurve, 48, 0.08, 8, false), gildedMat);
      pg.add(col, base, dragonCoil);
      this.studyGroup.add(pg);
    });

    // 6. 8盏悬浮八角琉璃宫灯 + 8盏池面漂浮莲花河灯 + 14团瑶台流云 + 40颗漫天星尘微粒
    this.studyLanterns = [];
    const lanternCoords = [
      { x: -8.6, y: 4.8, z: -8.2 },
      { x: 8.6, y: 4.8, z: -8.2 },
      { x: -8.6, y: 4.8, z: 8.2 },
      { x: 8.6, y: 4.8, z: 8.2 },
      { x: -12.4, y: 6.2, z: 0 },
      { x: 12.4, y: 6.2, z: 0 }
    ];
    lanternCoords.forEach((lc, idx) => {
      const lg = new THREE.Group();
      lg.position.set(lc.x, lc.y, lc.z);
      const shade = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.68, 1.38, 8),
        new THREE.MeshBasicMaterial({
          color: 0xffedd5,
          transparent: true,
          opacity: 0.90
        })
      );
      const topRoof = new THREE.Mesh(new THREE.ConeGeometry(1.02, 0.52, 8), gildedMat);
      topRoof.position.y = 0.92;
      const botCap = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.40, 0.26, 8), gildedMat);
      botCap.position.y = -0.82;
      const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.92, 10), vermilionMat);
      tassel.rotation.x = Math.PI;
      tassel.position.y = -1.38;
      const ptLight = new THREE.PointLight(0xffb74d, idx < 4 ? 0.48 : 0.28, 16, 1.8);
      lg.add(shade, topRoof, botCap, tassel, ptLight);
      this.studyGroup.add(lg);
      this.studyLanterns.push({ group: lg, tassel, baseY: lc.y, phase: idx * 1.3, light: ptLight });
    });

    // 池面漂浮莲花河灯
    this.studyWaterLanterns = [];
    for (let w = 0; w < 8; w++) {
      const ang = (w / 8) * Math.PI * 2;
      const rad = 13.8 + (w % 2) * 2.2;
      const wlGroup = new THREE.Group();
      const petalBase = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.28, 0.16, 8), celadonJadeMat);
      const candleCore = new THREE.Mesh(
        new THREE.SphereGeometry(0.20, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      candleCore.position.y = 0.12;
      wlGroup.add(petalBase, candleCore);
      wlGroup.position.set(Math.cos(ang) * rad, -4.28, Math.sin(ang) * rad);
      this.studyGroup.add(wlGroup);
      this.studyWaterLanterns.push({ group: wlGroup, angle: ang, radius: rad, speed: 0.06 + (w % 3) * 0.02, phase: w * 1.1 });
    }

    // 瑶台四周漂浮 3D 流云仙雾
    this.studyClouds = [];
    const cloudMat = new THREE.MeshLambertMaterial({
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.26
    });
    for (let c = 0; c < 12; c++) {
      const ang = (c / 12) * Math.PI * 2;
      const rad = 14.5 + (c % 3) * 2.8;
      const cGroup = new THREE.Group();
      for (let p = 0; p < 3; p++) {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.15 - p * 0.2, 12, 10), cloudMat);
        puff.scale.set(1.6, 0.42, 1.1);
        puff.position.set((p - 1) * 0.95, (p % 2) * 0.18, 0);
        cGroup.add(puff);
      }
      cGroup.position.set(Math.cos(ang) * rad, -3.65 + (c % 2) * 0.55, Math.sin(ang) * rad);
      cGroup.rotation.y = -ang + Math.PI / 2;
      this.studyGroup.add(cGroup);
      this.studyClouds.push({ group: cGroup, baseX: cGroup.position.x, baseZ: cGroup.position.z, phase: c * 0.9 });
    }

    // 漫天星尘流萤微粒
    this.studyStardust = [];
    const glowTex = typeof getGlowParticleTexture === 'function' ? getGlowParticleTexture() : null;
    for (let i = 0; i < 40; i++) {
      const spMat = new THREE.SpriteMaterial({
        map: glowTex,
        color: i % 3 === 0 ? 0x7dd3fc : (i % 2 === 0 ? 0xfef08a : 0xffffff),
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sp = new THREE.Sprite(spMat);
      const s = 0.16 + Math.random() * 0.22;
      sp.scale.set(s, s, 1);
      sp.position.set(
        (Math.random() - 0.5) * 28,
        Math.random() * 11 - 3.2,
        (Math.random() - 0.5) * 28
      );
      this.studyGroup.add(sp);
      this.studyStardust.push({
        sprite: sp,
        speedY: 0.22 + Math.random() * 0.35,
        speedX: 0.18 + Math.random() * 0.28,
        phase: Math.random() * Math.PI * 2
      });
    }
  },

  buildChessboard3D() {
    this.boardGroup = new THREE.Group();
    this.scene.add(this.boardGroup);

    const boardOuterW = BOARD_WIDTH + 1.84;
    const boardOuterH = BOARD_HEIGHT + 1.84;
    const boardThickness = 0.46;

    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x4a2812,
      roughness: 0.34,
      metalness: 0.16
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4a338,
      emissive: 0x78350f,
      emissiveIntensity: 0.18,
      roughness: 0.25,
      metalness: 0.88
    });
    const topTex = createChessboardTexture();
    const topMat = new THREE.MeshStandardMaterial({
      map: topTex,
      color: 0xf4e4c8,
      roughness: 0.46,
      metalness: 0.04
    });

    const materials = [frameMat, frameMat, topMat, frameMat, frameMat, frameMat];
    const boardMesh = new THREE.Mesh(new THREE.BoxGeometry(boardOuterW, boardThickness, boardOuterH), materials);
    boardMesh.position.y = -boardThickness / 2;
    boardMesh.castShadow = true;
    boardMesh.receiveShadow = true;
    this.boardGroup.add(boardMesh);

    const subBase = new THREE.Mesh(
      new THREE.BoxGeometry(boardOuterW + 0.34, 0.18, boardOuterH + 0.34),
      frameMat
    );
    subBase.position.y = -boardThickness - 0.08;
    subBase.castShadow = true;
    subBase.receiveShadow = true;
    this.boardGroup.add(subBase);

    const cornerGeo = new THREE.BoxGeometry(0.68, boardThickness + 0.04, 0.68);
    const halfW = boardOuterW / 2 - 0.28;
    const halfH = boardOuterH / 2 - 0.28;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => {
      const bracket = new THREE.Mesh(cornerGeo, brassMat);
      bracket.position.set(sx * halfW, -boardThickness / 2 + 0.005, sz * halfH);
      this.boardGroup.add(bracket);
    });
  },

  buildInteractionMarkers() {
    this.markersGroup = new THREE.Group();
    this.scene.add(this.markersGroup);

    const selTex = typeof getBoardMarkerTexture === 'function' ? getBoardMarkerTexture('selected') : null;
    const selMat = new THREE.MeshBasicMaterial({
      map: selTex,
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.94,
      depthWrite: false
    });
    this.selectedRing = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 1.16), selMat);
    this.selectedRing.rotation.x = -Math.PI / 2;
    this.selectedRing.position.y = 0.018;
    this.selectedRing.visible = false;
    this.scene.add(this.selectedRing);

    const fromTex = typeof getBoardMarkerTexture === 'function' ? getBoardMarkerTexture('last_from') : null;
    const fromMat = new THREE.MeshBasicMaterial({
      map: fromTex,
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.86,
      depthWrite: false
    });
    this.lastFromRing = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.92), fromMat);
    this.lastFromRing.rotation.x = -Math.PI / 2;
    this.lastFromRing.position.y = 0.012;
    this.lastFromRing.visible = false;
    this.lastFromCoord = null;

    const toTex = typeof getBoardMarkerTexture === 'function' ? getBoardMarkerTexture('last_to') : null;
    const toMat = new THREE.MeshBasicMaterial({
      map: toTex,
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.90,
      depthWrite: false
    });
    this.lastToRing = new THREE.Mesh(new THREE.PlaneGeometry(1.14, 1.14), toMat);
    this.lastToRing.rotation.x = -Math.PI / 2;
    this.lastToRing.position.y = 0.013;
    this.lastToRing.visible = false;
    this.lastToCoord = null;
    this.scene.add(this.lastFromRing, this.lastToRing);

    this.moveIndicators = [];
  },

  syncLastMoveMarkerVisibility() {
    if (!this.lastFromRing || !this.lastToRing) return;
    if (!this.lastFromCoord || !this.lastToCoord) {
      this.lastFromRing.visible = false;
      this.lastToRing.visible = false;
      return;
    }
    const sel = this.selectedSquare;
    const hasIndicatorAt = (r, c) => {
      if (!this.moveIndicators || this.moveIndicators.length === 0) return false;
      return this.moveIndicators.some(ind => ind.userData && ind.userData.tr === r && ind.userData.tc === c);
    };

    const hideFrom = (sel && sel.r === this.lastFromCoord.r && sel.c === this.lastFromCoord.c) ||
                     hasIndicatorAt(this.lastFromCoord.r, this.lastFromCoord.c);
    const hideTo = (sel && sel.r === this.lastToCoord.r && sel.c === this.lastToCoord.c) ||
                   hasIndicatorAt(this.lastToCoord.r, this.lastToCoord.c);

    this.lastFromRing.visible = !hideFrom;
    this.lastToRing.visible = !hideTo;
  },

  setLastMoveMarkers(fr, fc, tr, tc) {
    if (typeof fr !== 'number' || typeof tr !== 'number') {
      this.lastFromCoord = null;
      this.lastToCoord = null;
      if (this.lastFromRing) this.lastFromRing.visible = false;
      if (this.lastToRing) this.lastToRing.visible = false;
      return;
    }
    this.lastFromCoord = { r: fr, c: fc };
    this.lastToCoord = { r: tr, c: tc };
    const startPos = gridToWorld(fr, fc);
    const endPos = gridToWorld(tr, tc);
    if (this.lastFromRing) {
      this.lastFromRing.position.set(startPos.x, 0.012, startPos.z);
    }
    if (this.lastToRing) {
      this.lastToRing.position.set(endPos.x, 0.013, endPos.z);
    }
    this.syncLastMoveMarkerVisibility();
  },

  clearAllTransientVFX(clearLastMove = false) {
    this.clearLegalMoveIndicators();
    this.clearIllegalWarningRings();
    this.clearGrandmasterHint3D?.();
    if (this.impactWaves && this.impactWaves.length > 0) {
      for (const w of this.impactWaves) {
        this.scene?.remove(w.mesh);
        w.mesh?.geometry?.dispose?.();
        w.mesh?.material?.dispose?.();
      }
      this.impactWaves = [];
    }
    if (this.shatterParticles && this.shatterParticles.length > 0) {
      for (const sp of this.shatterParticles) {
        this.scene?.remove(sp.mesh);
        sp.mesh?.geometry?.dispose?.();
        sp.mesh?.material?.dispose?.();
      }
      this.shatterParticles = [];
    }
    if (clearLastMove) {
      this.setLastMoveMarkers(null, null, null, null);
    } else {
      this.syncLastMoveMarkerVisibility();
    }
  },

  ensureSharedPieceAssets() {
    if (this.sharedPieceAssets) return this.sharedPieceAssets;
    const height = 0.35;
    const radius = 0.445;

    this.sharedPieceAssets = {
      height,
      radius,
      cylGeo: new THREE.CylinderGeometry(radius * 0.93, radius, height, 40),
      rimGeo: new THREE.TorusGeometry(radius * 0.92, 0.028, 14, 40),
      baseRimGeo: new THREE.TorusGeometry(radius * 0.98, 0.022, 12, 40),
      topDiscGeo: new THREE.CircleGeometry(radius * 0.91, 40),
      redRimMat: new THREE.MeshStandardMaterial({ color: 0xb5852b, metalness: 0.65, roughness: 0.36 }),
      blackRimMat: new THREE.MeshStandardMaterial({ color: 0xc29332, metalness: 0.68, roughness: 0.32 })
    };
    return this.sharedPieceAssets;
  },

  ensureSharedIndicatorAssets() {
    if (this.sharedIndicatorAssets) return this.sharedIndicatorAssets;
    const dotSafeTex = getMoveIndicatorTexture('dot_safe');
    const dotUnsafeTex = getMoveIndicatorTexture('dot_unsafe');
    const capSafeTex = getMoveIndicatorTexture('capture_safe');
    const capUnsafeTex = getMoveIndicatorTexture('capture_unsafe');

    this.sharedIndicatorAssets = {
      captureBaseGeo: new THREE.PlaneGeometry(1.18, 1.18),
      lotusDotGeo: new THREE.PlaneGeometry(0.68, 0.68),
      hitGeo: new THREE.CylinderGeometry(0.56, 0.56, 0.50, 16),
      captureSafeMat: new THREE.MeshBasicMaterial({
        map: capSafeTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      }),
      captureUnsafeMat: new THREE.MeshBasicMaterial({
        map: capUnsafeTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      }),
      dotSafeMat: new THREE.MeshBasicMaterial({
        map: dotSafeTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      }),
      dotUnsafeMat: new THREE.MeshBasicMaterial({
        map: dotUnsafeTex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
        depthWrite: false
      }),
      hitMat: new THREE.MeshBasicMaterial({ visible: false })
    };
    return this.sharedIndicatorAssets;
  },

  createPieceMesh(pieceData, r, c) {
    const assets = this.ensureSharedPieceAssets();
    const { height } = assets;
    const group = new THREE.Group();
    const isRed = pieceData.color === RED;
    const isHidden = Boolean(pieceData.isHidden);

    const bodyMat = isRed
      ? new THREE.MeshPhysicalMaterial({
          color: 0xead8be,
          roughness: 0.32,
          metalness: 0.04,
          clearcoat: 0.26,
          clearcoatRoughness: 0.30
        })
      : new THREE.MeshPhysicalMaterial({
          color: 0x0b0f17,
          roughness: 0.22,
          metalness: 0.18,
          clearcoat: 0.42,
          clearcoatRoughness: 0.20
        });

    const cylMesh = new THREE.Mesh(assets.cylGeo, bodyMat);
    cylMesh.position.y = height / 2;
    cylMesh.castShadow = true;
    group.add(cylMesh);

    const rimMat = isRed ? assets.redRimMat : assets.blackRimMat;
    const rimMesh = new THREE.Mesh(assets.rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = height - 0.01;
    group.add(rimMesh);

    const baseRimMesh = new THREE.Mesh(assets.baseRimGeo, rimMat);
    baseRimMesh.rotation.x = Math.PI / 2;
    baseRimMesh.position.y = 0.02;
    group.add(baseRimMesh);

    const topMat = typeof getPieceTopMaterial === 'function'
      ? getPieceTopMaterial(pieceData.color, pieceData.char, isHidden)
      : new THREE.MeshStandardMaterial({ ...getPieceMedallionTextures(pieceData.color, pieceData.char, isHidden), bumpScale: 0.032 });
    const topDisc = new THREE.Mesh(assets.topDiscGeo, topMat);
    topDisc.rotation.x = -Math.PI / 2;
    const flipForBlack = (this.onlineRole === BLACK) || (!this.onlineRole && this.gameMode === 'pvp' && pieceData.color === BLACK);
    topDisc.rotation.z = flipForBlack ? Math.PI : 0;
    topDisc.position.y = height + 0.002;
    group.add(topDisc);

    const backMat = typeof getPieceTopMaterial === 'function'
      ? getPieceTopMaterial(pieceData.color, pieceData.char, true)
      : topMat;
    const bottomDisc = new THREE.Mesh(assets.topDiscGeo, backMat);
    bottomDisc.rotation.x = Math.PI / 2;
    bottomDisc.position.y = -0.002;
    group.add(bottomDisc);

    const pos = gridToWorld(r, c);
    group.position.set(pos.x, 0, pos.z);
    group.userData = {
      pieceId: pieceData.id,
      color: pieceData.color,
      type: pieceData.type,
      char: pieceData.char,
      isHidden,
      r,
      c,
      topDisc,
      bottomDisc,
      bodyMat,
      rimMat,
      tacticalState: null
    };
    if (this.piecesGroup) {
      this.piecesGroup.add(group);
    } else {
      this.scene.add(group);
    }
    return group;
  },

  syncPiecesFromEngine() {
    this.engine?.invalidateTacticalCache?.();
    const activeIds = new Set();
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const p = this.engine.board[r][c];
        if (p) activeIds.add(p.id);
      }
    }

    for (const [id, mesh] of this.pieceMeshes.entries()) {
      if (!activeIds.has(id)) {
        if (this.piecesGroup) this.piecesGroup.remove(mesh);
        this.scene.remove(mesh);
        this.pieceMeshes.delete(id);
      }
    }

    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const p = this.engine.board[r][c];
        if (!p) continue;
        const existing = this.pieceMeshes.get(p.id);
        if (existing && existing.userData && existing.userData.color === p.color) {
          const ud = existing.userData;
          const pos = gridToWorld(r, c);
          existing.position.set(pos.x, 0, pos.z);
          existing.rotation.set(0, 0, 0);
          existing.scale.set(1, 1, 1);
          ud.r = r;
          ud.c = c;
          ud.type = p.type;
          const nextHidden = Boolean(p.isHidden);
          if (ud.isHidden !== nextHidden || ud.char !== p.char) {
            ud.isHidden = nextHidden;
            ud.char = p.char;
            if (ud.topDisc && typeof getPieceTopMaterial === 'function') {
              ud.topDisc.material = getPieceTopMaterial(p.color, p.char, nextHidden);
            }
          }
          if (ud.topDisc) {
            const flipForBlack = (this.onlineRole === BLACK) || (!this.onlineRole && this.gameMode === 'pvp' && p.color === BLACK);
            ud.topDisc.rotation.z = flipForBlack ? Math.PI : 0;
          }
          if (this.piecesGroup && existing.parent !== this.piecesGroup) {
            this.piecesGroup.add(existing);
          }
        } else {
          if (existing) {
            if (this.piecesGroup) this.piecesGroup.remove(existing);
            this.scene.remove(existing);
          }
          this.pieceMeshes.set(p.id, this.createPieceMesh(p, r, c));
        }
      }
    }
    this.updateTacticalGlowState();
  },

  updateTacticalGlowState() {
    if (!this.engine || !this.pieceMeshes) return;
    this.threatenedFriendlyIds = new Set();
    this.safeCapturableEnemyIds = new Set();
    for (const mesh of this.pieceMeshes.values()) {
      const ud = mesh.userData;
      if (!ud) continue;
      ud.tacticalState = null;
      if (ud.bodyMat) {
        ud.bodyMat.emissive.setHex(0x000000);
        ud.bodyMat.emissiveIntensity = 0.0;
      }
    }
  },

  updatePiecesOrientation() {
    for (const mesh of this.pieceMeshes.values()) {
      if (!mesh.userData?.topDisc) continue;
      const flipForBlack = (this.onlineRole === BLACK) || (!this.onlineRole && this.gameMode === 'pvp' && mesh.userData.color === BLACK);
      mesh.userData.topDisc.rotation.z = flipForBlack ? Math.PI : 0;
    }
  },

  clearLegalMoveIndicators() {
    if (this.moveIndicators && this.moveIndicators.length > 0) {
      for (const m of this.moveIndicators) {
        this.markersGroup?.remove(m);
        this.scene?.remove(m);
      }
    }
    this.moveIndicators = [];
    if (this.markersGroup) {
      while (this.markersGroup.children.length > 0) {
        this.markersGroup.remove(this.markersGroup.children[0]);
      }
    }
    if (this.selectedRing) {
      this.selectedRing.visible = false;
    }
    this.syncLastMoveMarkerVisibility();
  },

  clearIllegalWarningRings() {
    if (!this.illegalWarningRings) return;
    for (const item of this.illegalWarningRings) {
      this.scene?.remove(item.mesh);
      item.mesh?.geometry?.dispose?.();
      item.mesh?.material?.dispose?.();
    }
    this.illegalWarningRings = [];
  },

  hideIllegalMovePrompt() {
    const toastEl = document.getElementById('illegal-move-toast');
    if (toastEl) {
      toastEl.dataset.forceHidden = 'true';
      toastEl.classList.add('toast-hidden');
      toastEl.style.display = 'none';
    }
    if (this.illegalToastTimer) {
      clearTimeout(this.illegalToastTimer);
      this.illegalToastTimer = null;
    }
    this.clearIllegalWarningRings();
  },

  showIllegalMovePrompt(diagnosis, duration = 2400) {
    if (!diagnosis) return;
    this.sfx.playIllegal();
    this.cameraShake = 0.12;

    const toastEl = document.getElementById('illegal-move-toast');
    const iconEl = document.getElementById('illegal-toast-icon');
    const titleEl = document.getElementById('illegal-toast-title');
    const descEl = document.getElementById('illegal-toast-desc');
    const barEl = document.getElementById('illegal-toast-bar');

    if (toastEl && titleEl && descEl) {
      if (iconEl) iconEl.textContent = diagnosis.icon || 'gpp_maybe';
      titleEl.textContent = diagnosis.title || '禁着提示';
      descEl.textContent = diagnosis.message || '该步违反行棋规则，请另选落点。';

      if (barEl) {
        barEl.style.setProperty('--toast-duration', `${duration}ms`);
        barEl.style.animation = 'none';
        void barEl.offsetWidth;
        barEl.style.animation = '';
      }

      delete toastEl.dataset.forceHidden;
      toastEl.style.removeProperty('display');
      toastEl.classList.remove('toast-hidden');
      if (this.illegalToastTimer) clearTimeout(this.illegalToastTimer);
      this.illegalToastTimer = setTimeout(() => this.hideIllegalMovePrompt(), duration);
    }

    this.clearIllegalWarningRings();
    if (Array.isArray(diagnosis.highlightSquares)) {
      const warnTex = typeof getBoardMarkerTexture === 'function' ? getBoardMarkerTexture('warning') : null;
      const selTex = typeof getBoardMarkerTexture === 'function' ? getBoardMarkerTexture('selected') : null;
      diagnosis.highlightSquares.forEach((sq, idx) => {
        if (!sq || typeof sq.r !== 'number' || typeof sq.c !== 'number') return;
        const pos = gridToWorld(sq.r, sq.c);
        const tex = idx === 0 ? warnTex : selTex;
        const ring = new THREE.Mesh(
          tex ? new THREE.PlaneGeometry(1.18, 1.18) : new THREE.RingGeometry(0.42, 0.54, 32),
          new THREE.MeshBasicMaterial({
            map: tex || null,
            color: tex ? 0xffffff : (idx === 0 ? 0xef4444 : 0xf59e0b),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.92,
            depthWrite: false
          })
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(pos.x, 0.026, pos.z);
        this.scene.add(ring);
        this.illegalWarningRings.push({ mesh: ring, age: 0, maxAge: 1.35 });
      });
    }
  },

  showLegalMoveIndicators(r, c, moves) {
    this.clearLegalMoveIndicators();
    const selPos = gridToWorld(r, c);
    this.selectedRing.position.set(selPos.x, 0.018, selPos.z);
    this.selectedRing.visible = true;

    const indAssets = this.ensureSharedIndicatorAssets();

    for (const m of moves) {
      const pos = gridToWorld(m.tr, m.tc);
      const isCapture = Boolean(m.capture);
      const isUnsafe = this.engine.wouldPieceBeCapturedAfterMove(m, this.engine.board);
      const holder = new THREE.Group();
      holder.position.set(pos.x, 0.016, pos.z);
      holder.userData = { isCapture, isUnsafe, tr: m.tr, tc: m.tc, phase: (m.tr * 0.65 + m.tc * 0.45) };

      if (isCapture) {
        const baseLock = new THREE.Mesh(
          indAssets.captureBaseGeo,
          isUnsafe ? indAssets.captureUnsafeMat : indAssets.captureSafeMat
        );
        baseLock.rotation.x = -Math.PI / 2;
        baseLock.position.y = 0.004;
        holder.add(baseLock);
        holder.userData.baseLock = baseLock;
      } else {
        const lotusDisc = new THREE.Mesh(
          indAssets.lotusDotGeo,
          isUnsafe ? indAssets.dotUnsafeMat : indAssets.dotSafeMat
        );
        lotusDisc.rotation.x = -Math.PI / 2;
        lotusDisc.position.y = 0.002;
        holder.add(lotusDisc);
        holder.userData.lotusDisc = lotusDisc;
      }

      const hitMesh = new THREE.Mesh(indAssets.hitGeo, indAssets.hitMat);
      hitMesh.position.y = 0.2;
      hitMesh.userData = { isMoveTarget: true, move: m };
      holder.add(hitMesh);

      this.markersGroup.add(holder);
      this.moveIndicators.push(holder);
    }
    this.syncLastMoveMarkerVisibility();
    this.updateTacticalGlowState();
  },

  toggleMoreMenu(forceState) {
    const menu = document.getElementById('more-tools-menu');
    if (!menu) return;
    const willShow = typeof forceState === 'boolean' ? forceState : menu.classList.contains('hidden');
    menu.classList.toggle('hidden', !willShow);
    if (willShow) {
      this.sfx.playSelect();
      document.getElementById('custom-endgame-panel')?.classList.add('hidden');
      document.getElementById('vfx-drawer')?.classList.add('hidden');
      document.getElementById('online-modal')?.classList.add('hidden');
    }
  },

  showActionBurstPopup(mainText, subText = '', color = RED, styleKind = 'capture') {
    this.ensureVFXDOMTemplates?.();
    const wrap = document.getElementById('action-burst-popup');
    const mainEl = document.getElementById('action-burst-char');
    const subEl = document.getElementById('action-burst-sub');
    const sealEl = document.getElementById('action-burst-seal');
    if (!wrap || !mainEl) return;

    mainEl.textContent = mainText;
    if (subEl) {
      subEl.textContent = subText;
      subEl.classList.toggle('hidden', !subText);
    }
    if (sealEl) {
      sealEl.textContent = styleKind === 'check' ? '雷霆叫将' : (styleKind === 'capture_check' ? '破阵斩将' : '锋芒夺子');
    }

    wrap.dataset.theme = color === BLACK ? 'black' : 'red';
    wrap.dataset.kind = styleKind;
    wrap.classList.remove('hidden', 'action-burst-active');
    void wrap.offsetWidth;
    wrap.classList.add('action-burst-active');

    if (this.actionBurstTimer) clearTimeout(this.actionBurstTimer);
    this.actionBurstTimer = setTimeout(() => {
      wrap.classList.add('hidden');
      wrap.classList.remove('action-burst-active');
    }, 1350);
  },

  computePieceMotionTransform(pieceType, startPos, endPos, isCapture, wasFlipped, t) {
    const dx = endPos.x - startPos.x;
    const dz = endPos.z - startPos.z;
    const dist = Math.hypot(dx, dz) || 0.001;
    const dirX = dx / dist;
    const dirZ = dz / dist;
    const perpX = -dirZ;
    const perpZ = dirX;

    let x = startPos.x;
    let y = 0;
    let z = startPos.z;
    let rx = 0, ry = 0, rz = 0;
    let sx = 1, sy = 1, sz = 1;

    if (wasFlipped) {
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      x = THREE.MathUtils.lerp(startPos.x, endPos.x, ease);
      z = THREE.MathUtils.lerp(startPos.z, endPos.z, ease);
      y = Math.sin(ease * Math.PI) * 1.42;
      rx = ease * Math.PI * 2;
      rz = Math.sin(ease * Math.PI * 2) * 0.26;
      const pulse = 1 + Math.sin(ease * Math.PI) * 0.14;
      sx = pulse; sy = pulse; sz = pulse;
      return { x, y, z, rx, ry, rz, sx, sy, sz };
    }

    if (pieceType === 'n') {
      if (t < 0.13) {
        const p = t / 0.13;
        sy = 1 - p * 0.22;
        sx = 1 + p * 0.11;
        sz = 1 + p * 0.11;
        rx = -dirZ * p * 0.28;
        rz = dirX * p * 0.28;
      } else if (t < 0.86) {
        const p = (t - 0.13) / 0.73;
        const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const sway = Math.sin(p * Math.PI) * (isCapture ? 0.28 : 0.20);
        x = THREE.MathUtils.lerp(startPos.x, endPos.x, ease) + perpX * sway;
        z = THREE.MathUtils.lerp(startPos.z, endPos.z, ease) + perpZ * sway;
        y = Math.sin(p * Math.PI) * (isCapture ? 1.85 : 1.48);
        const pitch = Math.sin(p * Math.PI * 2) * 0.36;
        rx = dirZ * pitch;
        rz = -dirX * pitch;
        ry = 0;
      } else {
        const p = (t - 0.86) / 0.14;
        x = endPos.x;
        z = endPos.z;
        const bounce = Math.sin(p * Math.PI);
        sy = 1 - bounce * 0.20;
        sx = 1 + bounce * 0.10;
        sz = 1 + bounce * 0.10;
        rx = dirZ * Math.sin(p * Math.PI * 2) * 0.14 * (1 - p);
        rz = -dirX * Math.sin(p * Math.PI * 2) * 0.14 * (1 - p);
      }
      return { x, y, z, rx, ry, rz, sx, sy, sz };
    }

    if (pieceType === 'c') {
      if (isCapture) {
        if (t < 0.15) {
          const p = t / 0.15;
          x = startPos.x - dirX * p * 0.22;
          z = startPos.z - dirZ * p * 0.22;
          y = p * 0.28;
          rx = -dirZ * p * 0.44;
          rz = dirX * p * 0.44;
          sy = 1 - p * 0.15;
          sx = 1 + p * 0.08;
          sz = 1 + p * 0.08;
        } else if (t < 0.78) {
          const p = (t - 0.15) / 0.63;
          const ease = 1 - Math.pow(1 - p, 2.2);
          x = THREE.MathUtils.lerp(startPos.x - dirX * 0.22, endPos.x, ease);
          z = THREE.MathUtils.lerp(startPos.z - dirZ * 0.22, endPos.z, ease);
          y = Math.sin(p * Math.PI) * 2.35 + (1 - p) * 0.28;
          const tilt = Math.cos(p * Math.PI) * -0.58;
          rx = dirZ * tilt;
          rz = -dirX * tilt;
          ry = p * Math.PI;
          const boost = 1 + Math.sin(p * Math.PI) * 0.16;
          sx = boost; sy = boost; sz = boost;
        } else {
          const p = (t - 0.78) / 0.22;
          x = endPos.x;
          z = endPos.z;
          y = Math.max(0, (1 - p * 2.5) * 0.18);
          const squash = Math.sin(p * Math.PI) * 0.24;
          sy = 1 - squash;
          sx = 1 + squash * 0.55;
          sz = 1 + squash * 0.55;
        }
      } else {
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        x = THREE.MathUtils.lerp(startPos.x, endPos.x, ease);
        z = THREE.MathUtils.lerp(startPos.z, endPos.z, ease);
        y = Math.sin(t * Math.PI) * 0.46;
        const tilt = Math.sin(t * Math.PI * 2) * 0.24;
        rx = dirZ * tilt;
        rz = -dirX * tilt;
        ry = Math.sin(t * Math.PI) * 0.28;
      }
      return { x, y, z, rx, ry, rz, sx, sy, sz };
    }

    if (pieceType === 'r') {
      if (t < 0.12) {
        const p = t / 0.12;
        x = startPos.x - dirX * p * 0.16;
        z = startPos.z - dirZ * p * 0.16;
        y = p * 0.14;
        rx = -dirZ * p * 0.24;
        rz = dirX * p * 0.24;
      } else if (t < 0.82) {
        const p = (t - 0.12) / 0.70;
        const ease = 1 - Math.pow(1 - p, 3);
        x = THREE.MathUtils.lerp(startPos.x - dirX * 0.16, endPos.x, ease);
        z = THREE.MathUtils.lerp(startPos.z - dirZ * 0.16, endPos.z, ease);
        y = 0.14 + Math.sin(p * Math.PI) * (isCapture ? 0.34 : 0.18);
        const lean = (1 - p * 0.65) * 0.38;
        rx = dirZ * lean;
        rz = -dirX * lean;
        sx = 1.05; sy = 0.95; sz = 1.05;
      } else {
        const p = (t - 0.82) / 0.18;
        x = endPos.x + dirX * Math.sin(p * Math.PI) * 0.08 * (1 - p);
        z = endPos.z + dirZ * Math.sin(p * Math.PI) * 0.08 * (1 - p);
        y = 0;
        const brake = Math.sin(p * Math.PI) * -0.28 * (1 - p * 0.4);
        rx = dirZ * brake;
        rz = -dirX * brake;
      }
      return { x, y, z, rx, ry, rz, sx, sy, sz };
    }

    if (pieceType === 'b' || pieceType === 'a') {
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const curveOffset = Math.sin(t * Math.PI) * (pieceType === 'b' ? 0.34 : 0.18);
      x = THREE.MathUtils.lerp(startPos.x, endPos.x, ease) + perpX * curveOffset;
      z = THREE.MathUtils.lerp(startPos.z, endPos.z, ease) + perpZ * curveOffset;
      y = Math.sin(t * Math.PI) * (pieceType === 'b' ? 1.15 : 0.72);
      ry = ease * Math.PI * 2;
      const bank = Math.sin(t * Math.PI) * 0.32;
      rx = perpZ * bank + dirZ * Math.sin(t * Math.PI * 2) * 0.16;
      rz = -perpX * bank - dirX * Math.sin(t * Math.PI * 2) * 0.16;
      return { x, y, z, rx, ry, rz, sx, sy, sz };
    }

    if (t < 0.16) {
      const p = t / 0.16;
      y = p * 0.25;
      rx = -dirZ * p * 0.26;
      rz = dirX * p * 0.26;
      sy = 1 - p * 0.12;
      sx = 1 + p * 0.06;
      sz = 1 + p * 0.06;
    } else if (t < 0.82) {
      const p = (t - 0.16) / 0.66;
      const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      x = THREE.MathUtils.lerp(startPos.x, endPos.x, ease);
      z = THREE.MathUtils.lerp(startPos.z, endPos.z, ease);
      y = 0.25 * (1 - p) + Math.sin(p * Math.PI) * (isCapture ? 1.08 : 0.76);
      const tilt = Math.sin(p * Math.PI) * 0.36;
      rx = dirZ * tilt;
      rz = -dirX * tilt;
    } else {
      const p = (t - 0.82) / 0.18;
      x = endPos.x;
      z = endPos.z;
      y = 0;
      const wobble = Math.sin(p * Math.PI * 2) * 0.15 * (1 - p);
      rx = dirZ * wobble;
      rz = -dirX * wobble;
      const sq = Math.sin(p * Math.PI) * 0.14;
      sy = 1 - sq;
      sx = 1 + sq * 0.5;
      sz = 1 + sq * 0.5;
    }
    return { x, y, z, rx, ry, rz, sx, sy, sz };
  },

  executeMoveAnimated(move, onComplete, isRemote = false) {
    this.hideIllegalMovePrompt();
    this.isBusy = true;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.clearLegalMoveIndicators();
    this.clearGrandmasterHint3D?.();

    const movingPiece = this.engine.board[move.fr][move.fc];
    const targetPiece = this.engine.board[move.tr][move.tc];
    const movingMesh = this.pieceMeshes.get(movingPiece.id);
    const targetMesh = targetPiece ? this.pieceMeshes.get(targetPiece.id) : null;

    const startPos = gridToWorld(move.fr, move.fc);
    const endPos = gridToWorld(move.tr, move.tc);
    const isCapture = Boolean(targetPiece);
    const capturedCharSnapshot = targetPiece ? (targetPiece.isHidden ? '暗子' : targetPiece.char) : '';
    const movePieceType = movingPiece.isHidden ? (movingPiece.posType || movingPiece.type) : movingPiece.type;

    if (this.gameMode !== 'pvp' && movingPiece.color === BLACK) {
      this.sfx.playPickUp(movingPiece.color, true);
    }

    const notation = this.formatChineseMoveNotation(move);
    const moverColor = this.engine.turn;
    const moveRes = this.engine.makeMove(move);
    const wasFlipped = Boolean(moveRes.flipped);

    this.recordReplayStep?.(move, notation, moverColor, moveRes.actionTag);

    if (!isRemote && this.conn?.open) {
      this.conn.send({
        type: 'move',
        move: { fr: move.fr, fc: move.fc, tr: move.tr, tc: move.tc },
        revealedType: wasFlipped ? movingPiece.type : null
      });
    }

    this.setLastMoveMarkers(move.fr, move.fc, move.tr, move.tc);

    this.spawnMoveTrailRibbon?.(startPos, endPos, moverColor, isCapture, movePieceType);

    const animDuration = isCapture
      ? (movePieceType === 'c' ? 0.54 : (movePieceType === 'n' ? 0.50 : 0.44))
      : (wasFlipped ? 0.48 : (movePieceType === 'n' ? 0.44 : (movePieceType === 'r' ? 0.34 : 0.38)));

    const moveDist = Math.hypot(endPos.x - startPos.x, endPos.z - startPos.z) || 1;
    const attackDirX = (endPos.x - startPos.x) / moveDist;
    const attackDirZ = (endPos.z - startPos.z) / moveDist;

    let midFlipApplied = false;
    let captureShattered = false;
    this.activeAnimations.push({
      mesh: movingMesh,
      elapsed: 0,
      duration: animDuration,
      update: (t) => {
        if (!movingMesh) return;
        const tf = this.computePieceMotionTransform(movePieceType, startPos, endPos, isCapture, wasFlipped, t);
        movingMesh.position.set(tf.x, tf.y, tf.z);
        movingMesh.rotation.set(tf.rx, tf.ry, tf.rz);
        movingMesh.scale.set(tf.sx, tf.sy, tf.sz);

        // 吃子防重叠优化：在进攻棋子即将触达目标格瞬间 (t >= 0.72) 提前击飞并粉碎被吃棋子，杜绝两子模型交叉重叠！
        if (isCapture && targetMesh && !captureShattered) {
          if (t >= 0.45 && t < 0.72) {
            const tremor = Math.sin(t * 95) * 0.032;
            targetMesh.position.set(endPos.x + tremor, 0, endPos.z - tremor);
          } else if (t >= 0.72) {
            captureShattered = true;
            if (this.piecesGroup) this.piecesGroup.remove(targetMesh);
            this.scene.remove(targetMesh);
            this.pieceMeshes.delete(targetPiece.id);
            this.spawnShatterFragments(endPos.x, endPos.z, targetPiece.color, attackDirX, attackDirZ);
            this.sfx.playAttackShatter();
          }
        }

        if (wasFlipped && t >= 0.48 && !midFlipApplied) {
          midFlipApplied = true;
          movingMesh.userData.isHidden = false;
          movingMesh.userData.type = movingPiece.type;
          movingMesh.userData.char = movingPiece.char;
          if (movingMesh.userData.topDisc && typeof getPieceTopMaterial === 'function') {
            movingMesh.userData.topDisc.material = getPieceTopMaterial(movingPiece.color, movingPiece.char, false);
          }
        }
      },
      complete: () => {
        if (movingMesh) {
          movingMesh.position.set(endPos.x, 0, endPos.z);
          movingMesh.rotation.set(0, 0, 0);
          movingMesh.scale.set(1, 1, 1);
          movingMesh.userData.r = move.tr;
          movingMesh.userData.c = move.tc;
          movingMesh.userData.isHidden = Boolean(movingPiece.isHidden);
          movingMesh.userData.type = movingPiece.type;
          movingMesh.userData.char = movingPiece.char;
          if (wasFlipped && !midFlipApplied && movingMesh.userData.topDisc && typeof getPieceTopMaterial === 'function') {
            movingMesh.userData.topDisc.material = getPieceTopMaterial(movingPiece.color, movingPiece.char, false);
          }
        }
        if (isCapture) {
          if (!captureShattered && targetMesh) {
            if (this.piecesGroup) this.piecesGroup.remove(targetMesh);
            this.scene.remove(targetMesh);
            this.pieceMeshes.delete(targetPiece.id);
            this.spawnShatterFragments(endPos.x, endPos.z, targetPiece.color, attackDirX, attackDirZ);
            this.sfx.playAttackShatter();
          }
        } else {
          this.spawnMoveImpactWave?.(endPos.x, endPos.z, movePieceType === 'r' || movePieceType === 'n');
          this.sfx.playMove(movingPiece.color, movingPiece.type);
        }
        this.updateTacticalGlowState();
        this.onTurnFinished({
          wasCapture: isCapture,
          moverColor,
          moverChar: movingPiece.char,
          capturedChar: capturedCharSnapshot,
          notation
        });
        if (onComplete) onComplete();
      }
    });
  },

});
