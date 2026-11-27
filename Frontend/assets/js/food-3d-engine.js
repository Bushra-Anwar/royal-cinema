/* Royal Cinema 3D 360° Procedural Food & Multi-Item Combo Engine (Three.js) */
(function initRoyalFood3DEngine() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('food3dCanvas');
  const stageEl = document.getElementById('foodStage3d');
  if (!canvas || !stageEl) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 2.2, 6.2);

  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.5;

  // Studio 3-point lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.35);
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xfbcfe8, 0.75);
  rimLight.position.set(-5, 3, -4);
  scene.add(rimLight);

  const fillLight = new THREE.PointLight(0xffedd5, 0.6, 18);
  fillLight.position.set(0, -2, 4);
  scene.add(fillLight);

  const rootGroup = new THREE.Group();
  scene.add(rootGroup);

  function resizeRenderer() {
    const w = stageEl.clientWidth || 420;
    const h = stageEl.clientHeight || 420;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resizeRenderer();
  window.addEventListener('resize', resizeRenderer);

  // Helper: Create striped cinema popcorn bucket texture
  function makePopcornTexture(labelText, primaryHex, stripeHex) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = stripeHex;
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = primaryHex;
    for (let x = 0; x < 512; x += 64) {
      ctx.fillRect(x, 0, 32, 256);
    }
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 96, 512, 64);
    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 28px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, 256, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    return tex;
  }

  function buildPopcornTub(opts = {}) {
    const g = new THREE.Group();
    const isCheese = !!opts.isCheese;
    const isCaramel = !!opts.isCaramel;
    const label = isCaramel ? 'CARAMEL XL' : (isCheese ? 'CHEESE BURST' : 'ROYAL POPCORN');
    const stripePrimary = isCaramel ? '#92400e' : (isCheese ? '#d97706' : '#dc2626');
    const tex = makePopcornTexture(label, stripePrimary, '#fffbeb');

    const tubGeo = new THREE.CylinderGeometry(1.05, 0.76, 1.95, 32);
    const tubMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.08 });
    const tub = new THREE.Mesh(tubGeo, tubMat);
    tub.position.y = -0.1;
    g.add(tub);

    // Gold rim
    const rimGeo = new THREE.TorusGeometry(1.05, 0.045, 12, 32);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.6 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.87;
    g.add(rim);

    // Mounded 3D popcorn kernels
    const kernelColor = isCaramel ? 0xd97706 : (isCheese ? 0xf59e0b : 0xfef08a);
    const kernelMat = new THREE.MeshStandardMaterial({ color: kernelColor, roughness: 0.65 });
    const butterMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.55 });
    for (let i = 0; i < 42; i++) {
      const r = Math.random() * 0.86;
      const a = Math.random() * Math.PI * 2;
      const yOff = (1 - r / 0.95) * 0.65 + Math.random() * 0.25;
      const kGeo = new THREE.IcosahedronGeometry(0.16 + Math.random() * 0.09, 1);
      const k = new THREE.Mesh(kGeo, i % 3 === 0 ? butterMat : kernelMat);
      k.position.set(Math.cos(a) * r, 0.85 + yOff, Math.sin(a) * r);
      k.scale.set(1 + Math.random() * 0.4, 0.85 + Math.random() * 0.4, 1 + Math.random() * 0.4);
      k.rotation.set(Math.random() * 3, Math.random() * 3, 0);
      g.add(k);
    }
    return g;
  }

  function buildMiniSodaCan(colorHex, labelStr) {
    const g = new THREE.Group();
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(labelStr, 128, 134);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.46, 1.5, 28),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.28, metalness: 0.45 })
    );
    g.add(body);

    const aluMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.85 });
    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.1, 28), aluMat);
    topCap.position.y = 0.8;
    g.add(topCap);
    const botCap = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.41, 0.08, 28), aluMat);
    botCap.position.y = -0.78;
    g.add(botCap);
    return g;
  }

  function buildNachosTray() {
    const g = new THREE.Group();
    const trayMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.2 });
    const tray = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.15, 0.26, 24), trayMat);
    tray.position.y = -0.35;
    g.add(tray);

    // Melted cheese base
    const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25 });
    const queso = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.15, 0.08, 24), cheeseMat);
    queso.position.y = -0.18;
    g.add(queso);

    // Crispy triangular tortilla chips
    const chipMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.65 });
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
      const r = 0.25 + Math.random() * 0.72;
      const chip = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.045, 3), chipMat);
      chip.position.set(Math.cos(a) * r, -0.05 + Math.random() * 0.45, Math.sin(a) * r);
      chip.rotation.set(0.5 + Math.random() * 0.8, a, 0.3 + Math.random() * 0.6);
      g.add(chip);
    }

    // Jalapeño rings
    const jalMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 8, 16), jalMat);
      ring.position.set((Math.random() - 0.5) * 1.1, 0.22 + Math.random() * 0.2, (Math.random() - 0.5) * 1.1);
      ring.rotation.set(Math.random() * 2, Math.random() * 2, 0);
      g.add(ring);
    }

    // Salsa dip cup
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.32, 16), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }));
    cup.position.set(0.92, -0.05, 0.55);
    g.add(cup);
    const salsa = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 }));
    salsa.position.set(0.92, 0.1, 0.55);
    g.add(salsa);
    return g;
  }

  function buildSamosaItem() {
    const g = new THREE.Group();
    const crustMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.62 });
    const samosa = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.92, 3), crustMat);
    samosa.rotation.z = 0.12;
    g.add(samosa);
    return g;
  }

  function buildPuffItem() {
    const puffMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.55 });
    const puff = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.42, 0.72), puffMat);
    puff.rotation.y = 0.25;
    return puff;
  }

  function buildSamosaPlate(isCombo) {
    const g = new THREE.Group();
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.48, 1.25, 0.14, 32),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.1 })
    );
    plate.position.y = -0.4;
    g.add(plate);

    const s1 = buildSamosaItem();
    s1.position.set(-0.48, 0.08, 0.22);
    s1.rotation.y = 0.6;
    g.add(s1);

    const s2 = buildSamosaItem();
    s2.position.set(0.42, 0.08, -0.25);
    s2.rotation.y = -0.8;
    g.add(s2);

    if (isCombo) {
      const puff = buildPuffItem();
      puff.position.set(-0.15, -0.1, -0.58);
      g.add(puff);

      // Masala Chai cup
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.24, 0.68, 20),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.5 })
      );
      cup.position.set(0.75, 0.02, 0.48);
      g.add(cup);
      const chai = new THREE.Mesh(
        new THREE.CylinderGeometry(0.29, 0.29, 0.05, 20),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.2 })
      );
      chai.position.set(0.75, 0.35, 0.48);
      g.add(chai);
    } else {
      // Mint chutney bowl
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.22, 0.25, 18), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      bowl.position.set(0.15, -0.2, 0.65);
      g.add(bowl);
      const chutney = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 18), new THREE.MeshStandardMaterial({ color: 0x16a34a }));
      chutney.position.set(0.15, -0.07, 0.65);
      g.add(chutney);
    }
    return g;
  }

  function buildChocoBrownie() {
    const g = new THREE.Group();
    const plate = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.2, 0.14, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e1b2e, roughness: 0.3, metalness: 0.25 })
    );
    plate.position.y = -0.4;
    g.add(plate);

    const cake = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.65, 1.35),
      new THREE.MeshStandardMaterial({ color: 0x3b1d0e, roughness: 0.75 })
    );
    cake.position.y = 0.02;
    g.add(cake);

    // Glossy fudge drizzle top
    const fudge = new THREE.Mesh(
      new THREE.BoxGeometry(1.48, 0.1, 1.38),
      new THREE.MeshStandardMaterial({ color: 0x1c0b04, roughness: 0.18, metalness: 0.15 })
    );
    fudge.position.y = 0.36;
    g.add(fudge);

    // Vanilla scoop on top
    const scoop = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 20, 20),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.55 })
    );
    scoop.position.set(0.15, 0.65, 0.1);
    g.add(scoop);
    return g;
  }

  function buildIcedCoffee() {
    const g = new THREE.Group();
    const cupMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.32,
      roughness: 0.12
    });
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.55, 2.05, 28), cupMat);
    g.add(cup);

    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.35 });
    const coffee = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.52, 1.55, 28), coffeeMat);
    coffee.position.y = -0.18;
    g.add(coffee);

    // Whipped cream dome
    const foam = new THREE.Mesh(
      new THREE.SphereGeometry(0.72, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.6 })
    );
    foam.position.y = 0.62;
    g.add(foam);

    // Floating ice cubes
    const iceMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.7, roughness: 0.1 });
    for (let i = 0; i < 4; i++) {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 0.26), iceMat);
      cube.position.set((Math.random() - 0.5) * 0.5, 0.52 + Math.random() * 0.15, (Math.random() - 0.5) * 0.5);
      cube.rotation.set(Math.random(), Math.random(), 0);
      g.add(cube);
    }

    // Black straw
    const straw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 2.4, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    straw.position.set(0.22, 0.65, 0);
    straw.rotation.z = -0.22;
    g.add(straw);
    return g;
  }

  function buildComboTray(itemsFn) {
    const g = new THREE.Group();
    const tray = new THREE.Mesh(
      new THREE.CylinderGeometry(2.15, 1.95, 0.14, 36),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35, metalness: 0.45 })
    );
    tray.position.y = -0.95;
    g.add(tray);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(2.15, 0.05, 10, 36),
      new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.3, metalness: 0.6 })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.88;
    g.add(rim);
    itemsFn(g);
    return g;
  }

  function createModelForProduct(id) {
    if (id === 'p1') {
      // Blockbuster Combo 1: Jumbo Popcorn + 600ml Coke
      return buildComboTray((g) => {
        const pop = buildPopcornTub({ isCheese: false });
        pop.scale.set(0.85, 0.85, 0.85);
        pop.position.set(-0.62, 0.02, 0.1);
        g.add(pop);

        const coke = buildMiniSodaCan('#c60c1c', 'Coca-Cola');
        coke.position.set(0.88, -0.08, 0.28);
        g.add(coke);
      });
    }
    if (id === 'p2') {
      // Gujarati Special Combo: 2 Samosas + Puff + Masala Chai
      const plate = buildSamosaPlate(true);
      plate.scale.set(1.15, 1.15, 1.15);
      return plate;
    }
    if (id === 'p3') return buildPopcornTub({ isCheese: false });
    if (id === 'p4') {
      const n = buildNachosTray();
      n.scale.set(1.15, 1.15, 1.15);
      return n;
    }
    if (id === 'p5') return buildPopcornTub({ isCheese: true });
    if (id === 'p6') {
      const g = new THREE.Group();
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.1, 0.14, 32), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }));
      plate.position.y = -0.35;
      g.add(plate);
      const p1 = buildPuffItem();
      p1.scale.set(1.3, 1.3, 1.3);
      p1.position.set(0, -0.02, 0);
      g.add(p1);
      return g;
    }
    if (id === 'p8') {
      const plate = buildSamosaPlate(false);
      plate.scale.set(1.2, 1.2, 1.2);
      return plate;
    }
    if (id === 'p9') {
      const b = buildChocoBrownie();
      b.scale.set(1.15, 1.15, 1.15);
      return b;
    }
    if (id === 'p10') {
      // Stree 2 Couple Feast: XL Caramel Tub + Nachos + 2 VIP Cokes
      return buildComboTray((g) => {
        const pop = buildPopcornTub({ isCaramel: true });
        pop.scale.set(0.78, 0.78, 0.78);
        pop.position.set(-0.78, -0.05, -0.35);
        g.add(pop);

        const nachos = buildNachosTray();
        nachos.scale.set(0.65, 0.65, 0.65);
        nachos.position.set(0.58, -0.58, 0.45);
        g.add(nachos);

        const c1 = buildMiniSodaCan('#c60c1c', 'Coca-Cola');
        c1.scale.set(0.75, 0.75, 0.75);
        c1.position.set(0.88, -0.25, -0.58);
        g.add(c1);

        const c2 = buildMiniSodaCan('#c60c1c', 'Coca-Cola');
        c2.scale.set(0.75, 0.75, 0.75);
        c2.position.set(-0.92, -0.25, 0.65);
        g.add(c2);
      });
    }
    if (id === 'p11') {
      // Deadpool Wolverine Nacho Bucket Deal: 2x Double Cheese Nachos + Choco Brownie
      return buildComboTray((g) => {
        const n1 = buildNachosTray();
        n1.scale.set(0.68, 0.68, 0.68);
        n1.position.set(-0.78, -0.58, 0.25);
        g.add(n1);

        const n2 = buildNachosTray();
        n2.scale.set(0.68, 0.68, 0.68);
        n2.position.set(0.78, -0.58, -0.25);
        g.add(n2);

        const br = buildChocoBrownie();
        br.scale.set(0.62, 0.62, 0.62);
        br.position.set(0.0, -0.56, -0.82);
        g.add(br);
      });
    }
    if (id === 'p15') return buildIcedCoffee();
    return buildPopcornTub({ isCheese: false });
  }

  let currentId = null;
  let spinRad = 0;

  window.setRoyalFood3DModel = function(item) {
    if (!item || item.use3DCan) return;
    if (currentId === item.id) return;
    currentId = item.id;
    while (rootGroup.children.length > 0) {
      rootGroup.remove(rootGroup.children[0]);
    }
    const model = createModelForProduct(item.id);
    rootGroup.add(model);
  };

  window.setRoyalFood3DSpin = function(deg) {
    spinRad = (deg * Math.PI) / 180;
  };

  function renderLoop() {
    requestAnimationFrame(renderLoop);
    controls.update();
    rootGroup.rotation.y = spinRad;
    renderer.render(scene, camera);
  }
  renderLoop();
})();
