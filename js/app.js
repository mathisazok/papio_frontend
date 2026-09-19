// ---- GenerationBox : dropdown custom "Ton site" / "Ton idée" ----
(function(){
  var PLACEHOLDERS = {
    site: "Indique le lien de ton site pour que Papio l'analyse...",
    idee: "Décris ton idée de site avec le plus de détails possible (objectif, pages, style, contenu)..."
  };
  document.querySelectorAll('.create-dd').forEach(function(dd){
    var btn = dd.querySelector('.create-dd-btn');
    var label = dd.querySelector('.create-dd-label');
    var menu = dd.querySelector('.create-dd-menu');
    var items = dd.querySelectorAll('.create-dd-item');
    var box = dd.closest('.search-card') || dd.closest('.cta-card');
    var textarea = box ? box.querySelector('textarea.placeholder') : null;

    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var wasOpen = dd.classList.contains('open');
      document.querySelectorAll('.create-dd.open').forEach(function(o){ o.classList.remove('open'); });
      if(!wasOpen) dd.classList.add('open');
    });

    items.forEach(function(item){
      item.addEventListener('click', function(){
        items.forEach(function(i){ i.classList.remove('active'); });
        item.classList.add('active');
        label.textContent = item.textContent;
        dd.classList.remove('open');
        var ph = PLACEHOLDERS[item.getAttribute('data-value')];
        if(ph && textarea) textarea.setAttribute('placeholder', ph);
      });
    });
  });
  document.addEventListener('click', function(){
    document.querySelectorAll('.create-dd.open').forEach(function(o){ o.classList.remove('open'); });
  });
})();

// ---- How it works: clickable steps (Home uniquement) ----
(function(){
  var steps = document.querySelectorAll('.how-step');
  if(!steps.length) return;
  steps.forEach(function(step){
    step.addEventListener('click', function(){
      steps.forEach(function(s){ s.classList.remove('active'); });
      step.classList.add('active');
    });
  });
})();

// ---- Sign up : soumission du formulaire -> mini backend -> Dashboard ----
(function(){
  var form = document.getElementById('signupForm');
  if(!form || !window.PapioAuth) return;
  var errorEl = document.getElementById('signupError');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var user = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value
    };
    var result = PapioAuth.register(user);
    if(!result.ok){
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
      return;
    }
    window.location.href = 'dashboard.html';
  });
})();

// ---- Login : soumission du formulaire -> mini backend -> Dashboard ----
(function(){
  var form = document.getElementById('loginForm');
  if(!form || !window.PapioAuth) return;
  var errorEl = document.getElementById('loginError');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    var result = PapioAuth.login(email, password);
    if(!result.ok){
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
      return;
    }
    window.location.href = 'dashboard.html';
  });
})();

// ---- Dashboard : protection + déconnexion ----
(function(){
  if(!window.PapioAuth) return;
  var isDashboard = document.querySelector('.app-shell');
  if(!isDashboard) return;
  PapioAuth.requireAuth('signup.html');

  var collapseBtn = document.querySelector('.app-sidebar-top .icon-btn');
  var sidebar = document.querySelector('.app-sidebar');
  if(collapseBtn && sidebar){
    collapseBtn.addEventListener('click', function(){
      sidebar.classList.toggle('collapsed');
    });
  }

  var trigger = document.querySelector('.app-topbar-right');
  if(!trigger) return;
  var menu = document.createElement('div');
  menu.className = 'logout-menu';
  menu.innerHTML = '<button type="button" id="logoutBtn">Déconnexion</button>';
  trigger.appendChild(menu);
  trigger.addEventListener('click', function(e){
    if(e.target.closest('.app-avatar') || e.target.closest('.chevron')){
      menu.classList.toggle('open');
    } else if(!e.target.closest('.logout-menu')){
      menu.classList.remove('open');
    }
  });
  document.getElementById('logoutBtn').addEventListener('click', function(){
    PapioAuth.logout();
    window.location.href = 'index.html';
  });
})();

// ---- Website : popups Partager / Publier (mutuellement exclusifs) ----
(function(){
  var btnShare = document.getElementById('btnPartager');
  var btnPublish = document.getElementById('btnPublier');
  var popupShare = document.getElementById('popupShare');
  var popupPublish = document.getElementById('popupPublish');
  if(!btnShare || !btnPublish) return;

  function toggle(popup){
    var wasOpen = popup.classList.contains('open');
    popupShare.classList.remove('open');
    popupPublish.classList.remove('open');
    if(!wasOpen) popup.classList.add('open');
  }
  btnShare.addEventListener('click', function(){ toggle(popupShare); });
  btnPublish.addEventListener('click', function(){ toggle(popupPublish); });
  document.addEventListener('click', function(e){
    if(!e.target.closest('.ws-popup') && !e.target.closest('#btnPartager') && !e.target.closest('#btnPublier')){
      popupShare.classList.remove('open');
      popupPublish.classList.remove('open');
    }
  });
})();

// ---- Pricing toggle Mensuel/Annuel (Pricing uniquement) ----
(function(){
  var toggle = document.getElementById('toggle');
  if(!toggle) return;
  var btns = toggle.querySelectorAll('button');
  btns.forEach(function(b){
    b.addEventListener('click', function(){
      btns.forEach(function(x){ x.classList.remove('active'); });
      b.classList.add('active');
    });
  });
})();

// ---- Three.js dot globe (Home uniquement — points sampled from world map asset) ----
(function(){
  var wrap = document.getElementById('globeWrap');
  if(!wrap || !window.THREE) return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, wrap.clientWidth/wrap.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8.2);

  var renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  wrap.appendChild(renderer.domElement);

  var globe = new THREE.Group();
  scene.add(globe);

  var core = new THREE.Mesh(
    new THREE.SphereGeometry(2.98, 48, 48),
    new THREE.MeshBasicMaterial({color:0xf4f8ff, transparent:true, opacity:0.55})
  );
  globe.add(core);

  var rim = new THREE.Mesh(
    new THREE.SphereGeometry(3.05, 48, 48),
    new THREE.MeshBasicMaterial({color:0xff8a4d, transparent:true, opacity:0.16, side:THREE.BackSide})
  );
  globe.add(rim);

  var wire = new THREE.Mesh(
    new THREE.SphereGeometry(3.0, 24, 16),
    new THREE.MeshBasicMaterial({color:0xcfe0ff, wireframe:true, transparent:true, opacity:0.18})
  );
  globe.add(wire);

  function buildDots(img){
    var cw = 260, ch = 130;
    var c = document.createElement('canvas'); c.width=cw; c.height=ch;
    var ctx = c.getContext('2d');
    ctx.drawImage(img,0,0,cw,ch);
    var data = ctx.getImageData(0,0,cw,ch).data;

    var positions = [];
    var R = 3;
    for(var y=0;y<ch;y++){
      for(var x=0;x<cw;x++){
        var i = (y*cw+x)*4;
        var r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
        var bright = (r+g+b)/3;
        if(a>40 && bright<235){
          var lon = (x/cw)*Math.PI*2 - Math.PI;
          var lat = (0.5-y/ch)*Math.PI;
          var px = R*Math.cos(lat)*Math.cos(lon);
          var py = R*Math.sin(lat);
          var pz = R*Math.cos(lat)*Math.sin(lon);
          positions.push(px,py,pz);
        }
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
    var mat = new THREE.PointsMaterial({color:0xff5a1f, size:0.045, transparent:true, opacity:0.95, sizeAttenuation:true});
    globe.add(new THREE.Points(geo, mat));

    var mat2 = new THREE.PointsMaterial({color:0xffb27a, size:0.02, transparent:true, opacity:0.7});
    globe.add(new THREE.Points(geo, mat2));
  }

  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function(){ buildDots(img); };
  img.src = "assets/image2.jpg";

  var mouseX = 0;
  wrap.addEventListener('mousemove', function(e){
    var rect = wrap.getBoundingClientRect();
    mouseX = ((e.clientX-rect.left)/rect.width - 0.5) * 2;
  });

  function animate(){
    requestAnimationFrame(animate);
    globe.rotation.y += 0.0018 + mouseX*0.0015;
    globe.rotation.x = 0.18;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function(){
    camera.aspect = wrap.clientWidth/wrap.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  });
})();
