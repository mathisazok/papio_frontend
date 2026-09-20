// ---- FAQ accordion: smooth max-height + only one open (utilisé par toutes les pages ayant .faq-item) ----
(function(){
  var items = document.querySelectorAll('.faq-item');
  if(!items.length) return;
  function setHeight(item){
    var body = item.querySelector('.faq-body');
    if(item.open){ body.style.maxHeight = body.scrollHeight + 'px'; }
    else { body.style.maxHeight = '0px'; }
  }
  items.forEach(function(item){
    setHeight(item);
    item.querySelector('summary').addEventListener('click', function(ev){
      ev.preventDefault();
      var willOpen = !item.open;
      items.forEach(function(other){
        if(other !== item && other.open){ other.open = false; setHeight(other); }
      });
      item.open = willOpen;
      setHeight(item);
    });
  });
  window.addEventListener('resize', function(){ items.forEach(setHeight); });
})();

// ---- scroll reveal (utilisé par toutes les pages ayant .reveal) ----
(function(){
  var els = document.querySelectorAll('.reveal');
  if(!els.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:0.15});
  els.forEach(function(el){ io.observe(el); });
})();

// ---- Curseur personnalisé (desktop uniquement) ----
(function(){
  if(window.matchMedia && !window.matchMedia('(hover:hover)').matches) return;
  var dot = document.createElement('div');
  dot.className = 'custom-cursor';
  document.body.appendChild(dot);
  document.addEventListener('mousemove', function(e){
    dot.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    dot.classList.add('visible');
  });
  document.addEventListener('mouseleave', function(){ dot.classList.remove('visible'); });
  var hoverSel = 'a, button, .card, .create-dd-item, .icon-btn, input, textarea, select, summary';
  document.addEventListener('mouseover', function(e){
    if(e.target.closest(hoverSel)) dot.classList.add('hovering');
  });
  document.addEventListener('mouseout', function(e){
    if(e.target.closest(hoverSel)) dot.classList.remove('hovering');
  });
})();

// ---- Transition de page (fade) sur les liens internes ----
(function(){
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href]');
    if(!a) return;
    var href = a.getAttribute('href');
    if(!href || href.charAt(0) === '#' || href.indexOf('http') === 0 || a.target === '_blank') return;
    if(!href.endsWith('.html')) return;
    e.preventDefault();
    document.body.classList.add('page-fade-out');
    setTimeout(function(){ window.location.href = href; }, 180);
  });
})();

// ---- Compteur animé (.count-up) ----
(function(){
  var els = document.querySelectorAll('.count-up');
  if(!els.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      io.unobserve(entry.target);
      var el = entry.target;
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var start = null, duration = 1200;
      function step(ts){
        if(!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var val = Math.round(target * eased);
        el.textContent = val.toLocaleString('fr-FR') + suffix;
        if(progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, {threshold:0.4});
  els.forEach(function(el){ io.observe(el); });
})();

// ---- Hover magnétique sur les CTA principaux ----
(function(){
  var els = document.querySelectorAll('.btn-primary, .go, .card-cta.solid');
  els.forEach(function(el){
    el.addEventListener('mousemove', function(e){
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width/2) * 0.25;
      var y = (e.clientY - r.top - r.height/2) * 0.35;
      el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });
    el.addEventListener('mouseleave', function(){ el.style.transform = ''; });
  });
})();

// ---- Parallax léger fond ciel (scroll + mouvement souris sur le hero) ----
(function(){
  var heroBg = document.querySelector('.hero-bg');
  if(heroBg){
    window.addEventListener('scroll', function(){
      var y = window.scrollY * 0.12;
      heroBg.style.transform = 'translateY(' + y + 'px) scale(1.04)';
    }, {passive:true});
    var hero = document.querySelector('.hero');
    if(hero){
      hero.addEventListener('mousemove', function(e){
        var r = hero.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * 10;
        var yy = ((e.clientY - r.top) / r.height - 0.5) * 6;
        heroBg.style.transform = 'translate(' + x + 'px,' + yy + 'px) scale(1.04)';
      });
    }
  }
  var ctaWrap = document.querySelector('.cta-footer-wrap');
  if(ctaWrap){
    window.addEventListener('scroll', function(){
      ctaWrap.style.backgroundPositionY = (window.scrollY * -0.06) + 'px';
    }, {passive:true});
  }
})();

// ---- Effet de frappe dans le placeholder du textarea hero ----
(function(){
  var ta = document.querySelector('.hero .search-card textarea.placeholder');
  if(!ta) return;
  var full = ta.getAttribute('placeholder') || '';
  var i = 0, typing = true;
  ta.setAttribute('placeholder', '');
  ta.addEventListener('ph:update', function(e){ full = e.detail; i = 0; typing = true; });
  function tick(){
    if(document.activeElement === ta || ta.value){ return; }
    if(typing){
      i++;
      ta.setAttribute('placeholder', full.slice(0, i));
      if(i >= full.length){ typing = false; setTimeout(tick, 1800); return; }
      setTimeout(tick, 28);
    } else {
      i--;
      ta.setAttribute('placeholder', full.slice(0, i));
      if(i <= 0){ typing = true; setTimeout(tick, 500); return; }
      setTimeout(tick, 14);
    }
  }
  setTimeout(tick, 600);
})();

// ---- Skeleton shimmer sur le bloc Templates (Dashboard) avant apparition ----
(function(){
  var section = document.querySelector('.templates-section');
  if(!section) return;
  var skel = document.createElement('div');
  skel.className = 'templates-skeleton';
  skel.innerHTML = '<div class="skeleton" style="height:16px; width:120px; margin-bottom:16px;"></div>' +
    '<div style="display:flex; gap:14px;">' +
    '<div class="skeleton" style="height:120px; flex:1;"></div>' +
    '<div class="skeleton" style="height:120px; flex:1;"></div>' +
    '<div class="skeleton" style="height:120px; flex:1;"></div>' +
    '</div>';
  section.appendChild(skel);
  var h2 = section.querySelector('h2');
  if(h2) h2.style.display = 'none';
  setTimeout(function(){
    skel.style.transition = 'opacity .3s ease';
    skel.style.opacity = '0';
    setTimeout(function(){
      skel.remove();
      if(h2) h2.style.display = '';
      // Aucun modèle réel disponible pour le moment -> état vide au lieu d'un bloc creux
      var empty = document.createElement('div');
      empty.className = 'state-block state-compact';
      empty.innerHTML = '<div class="state-icon"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4" stroke="currentColor" stroke-width="1.4"/></svg></div>' +
        '<h3 style="font-size:15px;font-weight:500;color:#141414;margin-bottom:8px;">Aucun modèle pour le moment</h3>' +
        '<p>Les modèles Papio arrivent bientôt. En attendant, décris ton idée ci-dessus pour générer ton site.</p>';
      section.appendChild(empty);
    }, 300);
  }, 900);
})();

// ---- Apparition séquentielle des champs (signup) ----
(function(){
  var groups = document.querySelectorAll('.signup-card .form-group, .signup-card .btn-google, .signup-card .btn-soft');
  if(!groups.length) return;
  groups.forEach(function(el, idx){
    el.classList.add('stagger-in');
    setTimeout(function(){ el.classList.add('in'); }, 80 + idx * 70);
  });
})();

// ---- Toggle Mensuel/Annuel : pulse de transition sur les prix (Pricing) ----
(function(){
  var toggle = document.getElementById('toggle');
  if(!toggle) return;
  toggle.addEventListener('click', function(){
    document.querySelectorAll('.card-price').forEach(function(p){
      p.classList.remove('pulse');
      void p.offsetWidth;
      p.classList.add('pulse');
    });
  });
})();
