// ---- Mini "backend" des sites créés (simulation côté client via localStorage) ----
// Un site : { id, name, status: 'draft'|'published', url, updatedAt }
var PapioSites = {
  keyFor: function(){
    var email = (window.PapioAuth && PapioAuth.getSession()) || 'guest';
    return 'papio_sites_' + email;
  },
  SEED: [
    { name: 'Landing page — Hôtel 4 étoiles', status: 'published', url: 'yourwebsite.papio.io', daysAgo: 2 },
    { name: 'Site vitrine — Salon de coiffure', status: 'draft', url: '', daysAgo: 5 },
    { name: 'Boutique en ligne — Sneakers', status: 'published', url: 'yourwebsite.papio.io', daysAgo: 8 },
    { name: 'Page de capture — Coaching business', status: 'draft', url: '', daysAgo: 15 }
  ],
  uid: function(){ return 's_' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); },
  getAll: function(){
    var key = this.keyFor();
    var raw = localStorage.getItem(key);
    if(raw === null){
      // Premiere visite pour cet utilisateur : on amorce avec des sites d'exemple.
      var now = Date.now();
      var seeded = this.SEED.map(function(s){
        return {
          id: PapioSites.uid(),
          name: s.name,
          status: s.status,
          url: s.url,
          updatedAt: now - s.daysAgo * 86400000
        };
      });
      localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }
    try { return JSON.parse(raw) || []; } catch(e){ return []; }
  },
  saveAll: function(list){
    localStorage.setItem(this.keyFor(), JSON.stringify(list));
  },
  get: function(id){
    return this.getAll().find(function(s){ return s.id === id; }) || null;
  },
  create: function(name){
    var list = this.getAll();
    var site = { id: this.uid(), name: name || 'Nouveau site', status: 'draft', url: '', updatedAt: Date.now() };
    list.unshift(site);
    this.saveAll(list);
    return site;
  },
  update: function(id, patch){
    var list = this.getAll();
    var site = list.find(function(s){ return s.id === id; });
    if(!site) return null;
    Object.assign(site, patch, { updatedAt: Date.now() });
    this.saveAll(list);
    return site;
  },
  remove: function(id){
    var list = this.getAll().filter(function(s){ return s.id !== id; });
    this.saveAll(list);
  },
  relativeDate: function(ts){
    var diff = Math.max(0, Date.now() - ts);
    var day = 86400000;
    var days = Math.round(diff / day);
    if(days <= 0) return "aujourd'hui";
    if(days === 1) return 'hier';
    if(days < 7) return 'il y a ' + days + ' jours';
    if(days < 30) { var w = Math.round(days/7); return 'il y a ' + w + (w>1 ? ' semaines' : ' semaine'); }
    var m = Math.round(days/30);
    return 'il y a ' + m + (m>1 ? ' mois' : ' mois');
  }
};
