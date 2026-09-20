// ---- Modal Paramètres (partagé sur toutes les pages app) ----
(function(){
  var TABS = [
    {id:'general', label:'Général', icon:'<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="2.1" stroke="currentColor" stroke-width="1.2"/><path d="M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.2 3.8l-1.1 1.1M4.9 11.1l-1.1 1.1M12.2 12.2l-1.1-1.1M4.9 4.9 3.8 3.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'},
    {id:'connecteurs', label:'Connecteurs', icon:'<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="3.2" cy="8" r="1.7" stroke="currentColor" stroke-width="1.2"/><circle cx="12.5" cy="3.6" r="1.7" stroke="currentColor" stroke-width="1.2"/><circle cx="12.5" cy="12.4" r="1.7" stroke="currentColor" stroke-width="1.2"/><path d="M4.7 7.2l6.2-2.8M4.7 8.8l6.2 2.8" stroke="currentColor" stroke-width="1.2"/></svg>'},
    {id:'domaines', label:'Domaines', icon:'<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M2 8h12M8 2c1.8 1.7 1.8 10.3 0 12M8 2C6.2 3.7 6.2 12.3 8 14" stroke="currentColor" stroke-width="1.1"/></svg>'},
    {id:'equipe', label:'Équipe', icon:'<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5.6" cy="5.4" r="2.1" stroke="currentColor" stroke-width="1.2"/><circle cx="11.2" cy="6.2" r="1.7" stroke="currentColor" stroke-width="1.2"/><path d="M1.6 13.4c.5-2.3 2.1-3.7 4-3.7s3.5 1.4 4 3.7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M10 10.2c1.7.1 3 1.3 3.4 3.2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>'}
  ];

  var CONNECTORS = [
    {name:'Stripe', icon:'assets/icon_connector_stripe.png', desc:'Processeur de paiement mondial'},
    {name:'Whatsapp Business', icon:'assets/icon_connector_whatsapp.png', desc:'Messagerie instantanée et appels'},
    {name:'Supabase', icon:'assets/icon_connector_supabase.png', desc:'Plateforme open-source Backend'},
    {name:'Crisp', icon:'assets/icon_connector_crisp.png', desc:'Messagerie et de support client'},
    {name:'Shopify', icon:'assets/icon_connector_shopify.png', desc:'Plateforme tout-en-un e-commerce'}
  ];

  var TEAM = [
    {name:'Arthur Lorthois', you:true, email:'lorthois.arthur@test.com', role:'Administrateur'},
    {name:'Pierre Sanchez', you:false, email:'pierre.sanchez@test.com', role:'Membre'},
    {name:'Mary Sow', you:false, email:'mary.sow@test.com', role:'Membre'}
  ];

  function paneGeneral(){
    return '<div class="settings-header"><h2>Général</h2></div>' +
      '<div class="settings-field"><label>Mon entreprise</label><button class="btn-outline" type="button">Changer le logo</button></div>' +
      '<div class="settings-field"><label>Description entreprise</label><textarea class="form-input settings-textarea" placeholder="Décrivez votre entreprise en quelques mots"></textarea></div>';
  }

  function paneConnecteurs(){
    var cards = CONNECTORS.map(function(c){
      return '<div class="connector-card">' +
        '<img class="connector-icon" src="' + c.icon + '" alt="' + c.name + '">' +
        '<div class="connector-info"><div class="connector-name">' + c.name + '</div><p>' + c.desc + '</p></div>' +
        '<button class="btn-outline connector-btn" type="button">Connecter</button>' +
      '</div>';
    }).join('');
    return '<div class="settings-header"><h2>Connecteurs</h2></div><div class="connector-grid">' + cards + '</div>';
  }

  function paneDomaines(){
    return '<div class="settings-header"><h2>Domaines</h2></div>' +
      '<div class="settings-field"><label>Nom de domaine <a href="#" class="settings-link">+ Add domain</a></label>' +
      '<input class="form-input" type="text" value="yourwebsite/papio.io" readonly></div>';
  }

  function paneEquipe(){
    var rows = TEAM.map(function(m){
      return '<div class="team-member-row">' +
        '<img class="team-avatar" src="assets/avatar_generic.png" alt="">' +
        '<div class="team-who"><div class="team-name">' + m.name + (m.you ? ' <span class="team-you">(vous)</span>' : '') + '</div><div class="team-mail">' + m.email + '</div></div>' +
        '<select class="role-select"><option' + (m.role==='Administrateur'?' selected':'') + '>Administrateur</option><option' + (m.role==='Membre'?' selected':'') + '>Membre</option></select>' +
        '<button class="btn-outline" type="button">Gérer</button>' +
      '</div>';
    }).join('');
    return '<div class="settings-header"><h2>Équipe</h2><button class="btn-primary" type="button">Inviter</button></div>' +
      '<div class="team-section-label">Gestion</div>' + rows;
  }

  var PANES = {general:paneGeneral, connecteurs:paneConnecteurs, domaines:paneDomaines, equipe:paneEquipe};

  function buildModal(){
    var tabsHtml = TABS.map(function(t,i){
      return '<button type="button" class="settings-tab' + (i===0?' active':'') + '" data-tab="' + t.id + '">' + t.icon + '<span>' + t.label + '</span></button>';
    }).join('');
    var overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    overlay.id = 'settingsOverlay';
    overlay.innerHTML =
      '<div class="settings-modal">' +
        '<aside class="settings-sidebar">' +
          '<h3>Paramètres</h3>' +
          '<div class="settings-search"><input type="text" placeholder="Search"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.3"/><line x1="10.8" y1="10.8" x2="14" y2="14" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg></div>' +
          '<nav class="settings-tabs">' + tabsHtml + '</nav>' +
        '</aside>' +
        '<div class="settings-content">' +
          '<button class="settings-close" type="button" aria-label="Fermer">' +
            '<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="1.5" y1="1.5" x2="12.5" y2="12.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="12.5" y1="1.5" x2="1.5" y2="12.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>' +
          '</button>' +
          '<div class="settings-pane" id="settingsPane"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    function renderPane(id){
      document.getElementById('settingsPane').innerHTML = PANES[id]();
    }
    renderPane('general');

    overlay.querySelectorAll('.settings-tab').forEach(function(btn){
      btn.addEventListener('click', function(){
        overlay.querySelectorAll('.settings-tab').forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        renderPane(btn.getAttribute('data-tab'));
      });
    });

    function close(){ overlay.classList.remove('open'); }
    overlay.querySelector('.settings-close').addEventListener('click', close);
    overlay.addEventListener('click', function(e){ if(e.target === overlay) close(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });

    return overlay;
  }

  document.addEventListener('DOMContentLoaded', function(){
    var triggers = document.querySelectorAll('[data-settings-trigger]');
    if(!triggers.length) return;
    var overlay = buildModal();
    triggers.forEach(function(t){
      t.addEventListener('click', function(e){
        e.preventDefault();
        overlay.classList.add('open');
      });
    });
  });
})();
