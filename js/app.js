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
        if(ph && textarea){
          textarea.setAttribute('placeholder', ph);
          textarea.dispatchEvent(new CustomEvent('ph:update', {detail: ph}));
        }
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

// ---- App (Dashboard / Tes sites web / Website) : protection + déconnexion ----
(function(){
  if(!window.PapioAuth) return;
  var isAppPage = document.querySelector('.app-shell, .ws-shell');
  if(!isAppPage) return;
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

  // GenerationBox du Dashboard -> crée réellement un site et ouvre l'éditeur (même flow que "+ Nouveau site")
  var goBtn = document.querySelector('.app-content .search-card .go');
  if(goBtn && window.PapioSites){
    goBtn.addEventListener('click', function(e){
      e.preventDefault();
      var ta = document.querySelector('.app-content .search-card textarea.placeholder');
      var text = ta && ta.value.trim();
      var name = text ? (text.length > 46 ? text.slice(0,46) + '…' : text) : 'Nouveau site';
      var site = PapioSites.create(name);
      window.location.href = 'website.html?site=' + encodeURIComponent(site.id);
    });
  }
})();

// ---- Website : afficher le nom réel du site ouvert, ou un état "Site introuvable" ----
(function(){
  var breadcrumb = document.getElementById('breadcrumbToggle');
  if(!breadcrumb || !window.PapioSites) return;
  var id = new URLSearchParams(window.location.search).get('site');
  if(!id) return; // accès direct sans id -> on garde le contenu de démonstration existant

  var site = PapioSites.get(id);
  if(site){
    breadcrumb.childNodes[0].textContent = site.name + ' ';
    document.title = 'Papio — ' + site.name;
    return;
  }

  // Site inexistant / supprimé : on remplace le canevas par un état d'erreur, on désactive les actions.
  breadcrumb.childNodes[0].textContent = 'Site introuvable ';
  document.title = 'Papio — Site introuvable';
  ['btnPartager','btnPublier'].forEach(function(id){
    var b = document.getElementById(id);
    if(b){ b.disabled = true; b.style.opacity = '.4'; b.style.filter = 'grayscale(1)'; b.style.pointerEvents = 'none'; }
  });
  var chat = document.querySelector('.ws-chat');
  if(chat) chat.style.display = 'none';
  var canvas = document.querySelector('.ws-canvas');
  if(canvas){
    canvas.innerHTML = '<div class="state-block state-compact">' +
      '<div class="state-icon"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4"/><path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg></div>' +
      '<h2>Site introuvable</h2>' +
      '<p>Ce site n\'existe pas ou a été supprimé.</p>' +
      '<a class="btn-primary" href="sites.html">Retour à Tes sites web</a>' +
    '</div>';
  }
  var pill = document.querySelector('.ws-floating-pill');
  if(pill) pill.style.display = 'none';
})();

// ---- Modèles : catalogue public + filtre par catégorie + Aperçu + "Utiliser ce modèle" ----
(function(){
  var grid = document.getElementById('templatesGrid');
  if(!grid || !window.PapioTemplates) return;

  var filterBar = document.getElementById('templatesFilter');
  var empty = document.getElementById('templatesEmpty');
  var currentCat = 'all';

  function cardHtml(t){
    return '' +
    '<div class="site-card template-card" data-id="' + t.id + '" data-cat="' + t.category + '">' +
      '<div class="site-thumb">' +
        '<span class="site-status category">' + t.category + '</span>' +
        (t.popular ? '<span class="site-status published" style="left:auto; right:40px;">Populaire</span>' : '') +
        '<img class="site-thumb-mark" src="assets/logo_mark.png" alt="">' +
      '</div>' +
      '<div class="site-card-body">' +
        '<h3 class="site-name">' + t.name + '</h3>' +
        '<p class="site-meta">' + t.description + '</p>' +
      '</div>' +
      '<div class="site-card-actions">' +
        '<button class="btn-outline" type="button" data-action="tpl-preview">Aperçu</button>' +
        '<button class="btn-primary" type="button" data-action="tpl-use">Utiliser ce modèle</button>' +
      '</div>' +
    '</div>';
  }

  function render(){
    var visible = PapioTemplates.filter(function(t){ return currentCat === 'all' || t.category === currentCat; });
    grid.innerHTML = visible.map(cardHtml).join('');
    if(empty) empty.style.display = visible.length === 0 ? 'block' : 'none';
  }

  function useTemplate(id){
    var t = PapioTemplates.find(function(x){ return x.id === id; });
    if(!t) return;
    if(window.PapioSites){
      var site = PapioSites.create(t.name);
      window.location.href = 'website.html?site=' + encodeURIComponent(site.id);
    } else {
      window.location.href = 'website.html';
    }
  }

  var overlay = document.getElementById('templatePreviewOverlay');
  function openPreview(id){
    var t = PapioTemplates.find(function(x){ return x.id === id; });
    if(!t || !overlay) return;
    document.getElementById('tplPreviewName').textContent = t.name;
    document.getElementById('tplPreviewMeta').textContent = t.category + ' · ' + t.description;
    document.getElementById('tplPreviewUse').onclick = function(e){ e.preventDefault(); useTemplate(id); };
    overlay.classList.add('open');
  }
  if(overlay){
    overlay.addEventListener('click', function(e){
      if(e.target === overlay || e.target.closest('.site-preview-close')) overlay.classList.remove('open');
    });
  }

  grid.addEventListener('click', function(e){
    var card = e.target.closest('.template-card');
    if(!card) return;
    var id = card.getAttribute('data-id');
    if(e.target.closest('[data-action="tpl-preview"]')){ openPreview(id); return; }
    if(e.target.closest('[data-action="tpl-use"]')){ useTemplate(id); return; }
  });

  if(filterBar){
    var btns = filterBar.querySelectorAll('button');
    btns.forEach(function(b){
      b.addEventListener('click', function(){
        btns.forEach(function(x){ x.classList.remove('active'); });
        b.classList.add('active');
        currentCat = b.getAttribute('data-cat');
        render();
      });
    });
  }

  render();
})();

// ---- Website / Statistiques : conserver le ?site=id en naviguant entre les deux vues ----
(function(){
  var id = new URLSearchParams(window.location.search).get('site');
  if(!id) return;
  ['iconSiteWeb','iconStats'].forEach(function(elId){
    var el = document.getElementById(elId);
    if(el) el.href = el.getAttribute('href').split('?')[0] + '?site=' + encodeURIComponent(id);
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

// ---- Tes sites web : rendu dynamique depuis PapioSites + filtre + actions (Ouvrir/Modifier, Aperçu, Renommer, Supprimer) ----
(function(){
  var grid = document.getElementById('sitesGrid');
  if(!grid || !window.PapioSites) return;

  var filterBar = document.getElementById('sitesFilter');
  var filterEmpty = document.getElementById('sitesFilterEmpty');
  var emptyState = document.getElementById('sitesEmptyState');
  var currentFilter = 'all';
  var confirmingId = null;
  var openMenuId = null;

  function escapeHtml(s){
    return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; });
  }

  function cardHtml(site){
    var statusLabel = site.status === 'published' ? 'Publié' : 'Brouillon';
    var metaUrl = site.status === 'published' && site.url ? site.url + ' · ' : (site.status !== 'published' ? 'Non publié · ' : '');
    return '' +
    '<div class="site-card" data-id="' + site.id + '" data-status="' + site.status + '">' +
      '<div class="site-thumb">' +
        '<span class="site-status ' + site.status + '">' + statusLabel + '</span>' +
        '<img class="site-thumb-mark" src="assets/logo_mark.png" alt="">' +
        '<button class="icon-btn site-menu-btn" type="button" aria-label="Plus d\'options">' +
          '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="3.4" cy="8" r="1.3" fill="currentColor"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/><circle cx="12.6" cy="8" r="1.3" fill="currentColor"/></svg>' +
        '</button>' +
        '<div class="site-menu' + (openMenuId === site.id ? ' open' : '') + '">' +
          '<button type="button" data-action="rename">Renommer</button>' +
          '<button type="button" data-action="delete" class="danger">' + (confirmingId === site.id ? 'Confirmer la suppression ?' : 'Supprimer') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="site-card-body">' +
        '<h3 class="site-name" data-id="' + site.id + '">' + escapeHtml(site.name) + '</h3>' +
        '<p class="site-meta">' + metaUrl + 'modifié ' + PapioSites.relativeDate(site.updatedAt) + '</p>' +
      '</div>' +
      '<div class="site-card-actions">' +
        '<a class="btn-outline" data-action="edit" href="website.html?site=' + site.id + '">Modifier</a>' +
        '<button class="btn-outline" type="button" data-action="preview">Aperçu</button>' +
      '</div>' +
    '</div>';
  }

  function render(){
    var all = PapioSites.getAll();
    if(all.length === 0){
      grid.style.display = 'none';
      if(filterBar) filterBar.style.display = 'none';
      if(filterEmpty) filterEmpty.style.display = 'none';
      if(emptyState) emptyState.style.display = 'block';
      return;
    }
    if(emptyState) emptyState.style.display = 'none';
    if(filterBar) filterBar.style.display = '';
    grid.style.display = 'grid';

    var visible = all.filter(function(s){ return currentFilter === 'all' || s.status === currentFilter; });
    grid.innerHTML = visible.map(cardHtml).join('');
    if(filterEmpty) filterEmpty.style.display = visible.length === 0 ? 'block' : 'none';
  }

  grid.addEventListener('click', function(e){
    var card = e.target.closest('.site-card');
    if(!card) return;
    var id = card.getAttribute('data-id');

    var menuBtn = e.target.closest('.site-menu-btn');
    if(menuBtn){
      e.stopPropagation();
      var wasOpen = openMenuId === id;
      confirmingId = null;
      openMenuId = wasOpen ? null : id;
      render();
      return;
    }

    var renameBtn = e.target.closest('[data-action="rename"]');
    if(renameBtn){
      e.stopPropagation();
      openMenuId = null;
      startRename(card, id);
      return;
    }

    var deleteBtn = e.target.closest('[data-action="delete"]');
    if(deleteBtn){
      e.stopPropagation();
      if(confirmingId === id){
        PapioSites.remove(id);
        confirmingId = null;
        openMenuId = null;
        render();
      } else {
        confirmingId = id;
        openMenuId = id;
        render();
      }
      return;
    }

    var previewBtn = e.target.closest('[data-action="preview"]');
    if(previewBtn){
      e.preventDefault();
      openPreview(id);
      return;
    }
    // "Modifier" (data-action="edit") est un vrai lien <a>, laissé tel quel.
  });

  function startRename(card, id){
    var h3 = card.querySelector('.site-name');
    var site = PapioSites.get(id);
    if(!site) return;
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'site-name-input';
    input.value = site.name;
    h3.replaceWith(input);
    input.focus();
    input.select();
    function commit(){
      var val = input.value.trim() || site.name;
      PapioSites.update(id, { name: val });
      render();
    }
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ commit(); }
      if(e.key === 'Escape'){ render(); }
    });
    input.addEventListener('blur', commit);
  }

  document.addEventListener('click', function(){
    if(confirmingId || openMenuId){
      confirmingId = null;
      openMenuId = null;
      render();
    }
  });

  // ---- Modal Aperçu ----
  var overlay = document.getElementById('sitePreviewOverlay');
  function openPreview(id){
    var site = PapioSites.get(id);
    if(!site || !overlay) return;
    document.getElementById('previewName').textContent = site.name;
    document.getElementById('previewMeta').textContent = (site.status === 'published' ? 'Publié · ' + (site.url || '') : 'Non publié') + ' · modifié ' + PapioSites.relativeDate(site.updatedAt);
    var openPublic = document.getElementById('previewOpenPublic');
    if(site.status === 'published' && site.url){
      openPublic.href = 'https://' + site.url;
      openPublic.classList.remove('disabled');
    } else {
      openPublic.href = '#';
      openPublic.classList.add('disabled');
    }
    document.getElementById('previewEdit').href = 'website.html?site=' + id;
    overlay.classList.add('open');
  }
  if(overlay){
    overlay.addEventListener('click', function(e){
      if(e.target === overlay || e.target.closest('.site-preview-close')) overlay.classList.remove('open');
    });
  }

  if(filterBar){
    var btns = filterBar.querySelectorAll('button');
    btns.forEach(function(b){
      b.addEventListener('click', function(){
        btns.forEach(function(x){ x.classList.remove('active'); });
        b.classList.add('active');
        currentFilter = b.getAttribute('data-filter');
        render();
      });
    });
  }

  render();
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

// ---- Globe 3D (Home uniquement) : sphère construite à partir de l'asset Figma réel (carte de points) ----
// La carte plate exportée de Figma sert de masque pour placer les points sur une sphère, avec relief blanc/gris et interaction drag.
(function(){
  var wrap = document.getElementById('globeWrap');
  if(!wrap || !window.THREE) return;
  wrap.style.cursor = 'grab';

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, wrap.clientWidth/wrap.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8.4);

  var renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  wrap.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  var key = new THREE.DirectionalLight(0xffffff, 0.85);
  key.position.set(-4, 5, 6);
  scene.add(key);
  var fillLight = new THREE.DirectionalLight(0xdfe7f5, 0.35);
  fillLight.position.set(3, -2, -4);
  scene.add(fillLight);

  var globe = new THREE.Group();
  globe.rotation.x = 0.15;
  scene.add(globe);

  var core = new THREE.Mesh(
    new THREE.SphereGeometry(2.98, 64, 64),
    new THREE.MeshPhongMaterial({color:0xf4f5f7, shininess:30, specular:0xffffff})
  );
  globe.add(core);

  var rim = new THREE.Mesh(
    new THREE.SphereGeometry(3.04, 48, 48),
    new THREE.MeshBasicMaterial({color:0xe4eaf2, transparent:true, opacity:0.3, side:THREE.BackSide})
  );
  globe.add(rim);

  function buildDots(img){
    // La carte Figma ne couvre qu'une bande centrale (pas un équirectangulaire complet) :
    // on la reprojette sur toute la sphère en la répétant en longitude pour un rendu de globe cohérent.
    var cw = 440, ch = 200;
    var c = document.createElement('canvas'); c.width=cw; c.height=ch;
    var ctx = c.getContext('2d');
    ctx.clearRect(0,0,cw,ch);
    ctx.drawImage(img,0,0,cw,ch);
    var data = ctx.getImageData(0,0,cw,ch).data;

    var positions = [];
    var accentPositions = [];
    var oceanPositions = [];
    var R = 3.01;
    // pseudo-aleatoire stable (pas de motif en bandes) pour disperser les points bleus
    function hash(x,y){
      var s = Math.sin(x*12.9898 + y*78.233) * 43758.5453;
      return s - Math.floor(s);
    }
    for(var y=0;y<ch;y++){
      for(var x=0;x<cw;x++){
        var i = (y*cw+x)*4;
        var a = data[i+3];
        var lon = (x/cw)*Math.PI*2 - Math.PI;
        var lat = (0.5-y/ch)*Math.PI;
        var px = R*Math.cos(lat)*Math.cos(lon);
        var py = R*Math.sin(lat);
        var pz = R*Math.cos(lat)*Math.sin(lon);
        if(a>60){
          if(hash(x,y) < 0.022){ accentPositions.push(px,py,pz); }
          else { positions.push(px,py,pz); }
        } else {
          oceanPositions.push(px,py,pz);
        }
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
    var mat = new THREE.PointsMaterial({color:0xb9bfc9, size:0.031, transparent:true, opacity:0.95, sizeAttenuation:true});
    globe.add(new THREE.Points(geo, mat));

    var geoO = new THREE.BufferGeometry();
    geoO.setAttribute('position', new THREE.Float32BufferAttribute(oceanPositions,3));
    var matO = new THREE.PointsMaterial({color:0xe7eaee, size:0.02, transparent:true, opacity:0.55, sizeAttenuation:true});
    globe.add(new THREE.Points(geoO, matO));

    var geoA = new THREE.BufferGeometry();
    geoA.setAttribute('position', new THREE.Float32BufferAttribute(accentPositions,3));
    var matA = new THREE.PointsMaterial({color:0x2f8bff, size:0.058, transparent:true, opacity:0.9, sizeAttenuation:true});
    globe.add(new THREE.Points(geoA, matA));

    renderer.render(scene, camera);
    requestAnimationFrame(function(){ renderer.domElement.classList.add('in'); });
  }

  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function(){ buildDots(img); };
  img.src = "assets/world_dots.png";

  // ---- Interaction : drag pour tourner le globe, inertie après relâchement ----
  var autoSpeed = 0.0022;
  var velY = autoSpeed, velX = 0;
  var dragging = false, lastX = 0, lastY = 0;

  function pointerDown(e){
    dragging = true;
    wrap.style.cursor = 'grabbing';
    lastX = (e.touches ? e.touches[0].clientX : e.clientX);
    lastY = (e.touches ? e.touches[0].clientY : e.clientY);
  }
  function pointerMove(e){
    if(!dragging) return;
    var cx = (e.touches ? e.touches[0].clientX : e.clientX);
    var cy = (e.touches ? e.touches[0].clientY : e.clientY);
    var dx = cx - lastX, dy = cy - lastY;
    lastX = cx; lastY = cy;
    velY = dx * 0.0035;
    velX = dy * 0.0035;
    globe.rotation.y += velY;
    globe.rotation.x += velX;
  }
  function pointerUp(){
    dragging = false;
    wrap.style.cursor = 'grab';
  }
  wrap.addEventListener('mousedown', pointerDown);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);
  wrap.addEventListener('touchstart', pointerDown, {passive:true});
  window.addEventListener('touchmove', pointerMove, {passive:true});
  window.addEventListener('touchend', pointerUp);

  function animate(){
    requestAnimationFrame(animate);
    if(!dragging){
      globe.rotation.y += velY;
      globe.rotation.x += velX;
      velY += (autoSpeed - velY) * 0.02;
      velX *= 0.94;
    }
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function(){
    camera.aspect = wrap.clientWidth/wrap.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  });
})();

// ---- Globe 3D (page "Événement en Direct") : même sphère, réutilisée pour visualiser l'activité en cours ----
(function(){
  var wrap = document.getElementById('liveGlobeWrap');
  if(!wrap || !window.THREE) return;
  wrap.style.cursor = 'grab';

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, wrap.clientWidth/wrap.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8.4);

  var renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  wrap.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  var key = new THREE.DirectionalLight(0xffffff, 0.85);
  key.position.set(-4, 5, 6);
  scene.add(key);
  var fillLight = new THREE.DirectionalLight(0xdfe7f5, 0.35);
  fillLight.position.set(3, -2, -4);
  scene.add(fillLight);

  var globe = new THREE.Group();
  globe.rotation.x = 0.15;
  scene.add(globe);

  var core = new THREE.Mesh(
    new THREE.SphereGeometry(2.98, 64, 64),
    new THREE.MeshPhongMaterial({color:0xf4f5f7, shininess:30, specular:0xffffff})
  );
  globe.add(core);

  var rim = new THREE.Mesh(
    new THREE.SphereGeometry(3.04, 48, 48),
    new THREE.MeshBasicMaterial({color:0xe4eaf2, transparent:true, opacity:0.3, side:THREE.BackSide})
  );
  globe.add(rim);

  function buildDots(img){
    var cw = 440, ch = 200;
    var c = document.createElement('canvas'); c.width=cw; c.height=ch;
    var ctx = c.getContext('2d');
    ctx.clearRect(0,0,cw,ch);
    ctx.drawImage(img,0,0,cw,ch);
    var data = ctx.getImageData(0,0,cw,ch).data;

    var positions = [];
    var accentPositions = [];
    var oceanPositions = [];
    var R = 3.01;
    function hash(x,y){
      var s = Math.sin(x*12.9898 + y*78.233) * 43758.5453;
      return s - Math.floor(s);
    }
    for(var y=0;y<ch;y++){
      for(var x=0;x<cw;x++){
        var i = (y*cw+x)*4;
        var a = data[i+3];
        var lon = (x/cw)*Math.PI*2 - Math.PI;
        var lat = (0.5-y/ch)*Math.PI;
        var px = R*Math.cos(lat)*Math.cos(lon);
        var py = R*Math.sin(lat);
        var pz = R*Math.cos(lat)*Math.sin(lon);
        if(a>60){
          if(hash(x,y) < 0.022){ accentPositions.push(px,py,pz); }
          else { positions.push(px,py,pz); }
        } else {
          oceanPositions.push(px,py,pz);
        }
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
    var mat = new THREE.PointsMaterial({color:0xb9bfc9, size:0.031, transparent:true, opacity:0.95, sizeAttenuation:true});
    globe.add(new THREE.Points(geo, mat));

    var geoO = new THREE.BufferGeometry();
    geoO.setAttribute('position', new THREE.Float32BufferAttribute(oceanPositions,3));
    var matO = new THREE.PointsMaterial({color:0xe7eaee, size:0.02, transparent:true, opacity:0.55, sizeAttenuation:true});
    globe.add(new THREE.Points(geoO, matO));

    var geoA = new THREE.BufferGeometry();
    geoA.setAttribute('position', new THREE.Float32BufferAttribute(accentPositions,3));
    var matA = new THREE.PointsMaterial({color:0x2f8bff, size:0.065, transparent:true, opacity:0.95, sizeAttenuation:true});
    globe.add(new THREE.Points(geoA, matA));

    renderer.render(scene, camera);
    requestAnimationFrame(function(){ renderer.domElement.classList.add('in'); });
  }

  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function(){ buildDots(img); };
  img.src = "assets/world_dots.png";

  var autoSpeed = 0.0018;
  var velY = autoSpeed, velX = 0;
  var dragging = false, lastX = 0, lastY = 0;

  function pointerDown(e){
    dragging = true;
    wrap.style.cursor = 'grabbing';
    lastX = (e.touches ? e.touches[0].clientX : e.clientX);
    lastY = (e.touches ? e.touches[0].clientY : e.clientY);
  }
  function pointerMove(e){
    if(!dragging) return;
    var cx = (e.touches ? e.touches[0].clientX : e.clientX);
    var cy = (e.touches ? e.touches[0].clientY : e.clientY);
    var dx = cx - lastX, dy = cy - lastY;
    lastX = cx; lastY = cy;
    velY = dx * 0.0035;
    velX = dy * 0.0035;
    globe.rotation.y += velY;
    globe.rotation.x += velX;
  }
  function pointerUp(){
    dragging = false;
    wrap.style.cursor = 'grab';
  }
  wrap.addEventListener('mousedown', pointerDown);
  window.addEventListener('mousemove', pointerMove);
  window.addEventListener('mouseup', pointerUp);
  wrap.addEventListener('touchstart', pointerDown, {passive:true});
  window.addEventListener('touchmove', pointerMove, {passive:true});
  window.addEventListener('touchend', pointerUp);

  function animate(){
    requestAnimationFrame(animate);
    if(!dragging){
      globe.rotation.y += velY;
      globe.rotation.x += velX;
      velY += (autoSpeed - velY) * 0.02;
      velX *= 0.94;
    }
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', function(){
    camera.aspect = wrap.clientWidth/wrap.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
  });
})();

// ---- Menu mobile (ouvre/ferme la sidebar app-shell en dessous de 1024px) ----
(function(){
  var btn = document.getElementById('mobileMenuBtn');
  var sidebar = document.querySelector('.app-sidebar');
  var scrim = document.getElementById('sidebarScrim');
  if(!btn || !sidebar || !scrim) return;
  function close(){
    sidebar.classList.remove('mobile-open');
    scrim.classList.remove('open');
  }
  btn.addEventListener('click', function(){
    sidebar.classList.toggle('mobile-open');
    scrim.classList.toggle('open');
  });
  scrim.addEventListener('click', close);
  sidebar.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', close);
  });
})();
