// ---- Mini "backend" de connexion (simulation côté client via localStorage) ----
// Pas de serveur réel : sert à démontrer le flux Sign up -> connecté -> Dashboard,
// ainsi que connexion, mot de passe oublié / réinitialisation et suppression de compte.
var PapioAuth = {
  KEY_USERS: 'papio_users',
  KEY_SESSION: 'papio_session',
  KEY_RESETS: 'papio_resets',

  isValidEmail: function(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
  },

  getUsers: function(){
    try { return JSON.parse(localStorage.getItem(this.KEY_USERS)) || []; }
    catch(e){ return []; }
  },
  saveUsers: function(users){
    localStorage.setItem(this.KEY_USERS, JSON.stringify(users));
  },
  findByEmail: function(email){
    email = (email || '').toLowerCase();
    return this.getUsers().find(function(u){ return u.email.toLowerCase() === email; }) || null;
  },
  register: function(user){
    if (!user.email || !this.isValidEmail(user.email)) return { ok:false, error:'Adresse email invalide.' };
    if (!user.password || user.password.length < 6) return { ok:false, error:'Le mot de passe doit contenir au moins 6 caractères.' };
    var users = this.getUsers();
    if (users.some(function(u){ return u.email.toLowerCase() === user.email.toLowerCase(); })) {
      return { ok:false, error:'Un compte existe déjà avec cet email.' };
    }
    users.push(user);
    this.saveUsers(users);
    this.setSession(user.email);
    return { ok:true };
  },
  login: function(email, password){
    var users = this.getUsers();
    var user = users.find(function(u){
      return u.email.toLowerCase() === (email || '').toLowerCase() && u.password === password;
    });
    if (!user) return { ok:false, error:'Email ou mot de passe incorrect.' };
    this.setSession(user.email);
    return { ok:true };
  },
  setSession: function(email){ localStorage.setItem(this.KEY_SESSION, email); },
  getSession: function(){ return localStorage.getItem(this.KEY_SESSION); },
  getCurrentUser: function(){
    var email = this.getSession();
    if (!email) return null;
    return this.getUsers().find(function(u){ return u.email === email; }) || null;
  },
  logout: function(){ localStorage.removeItem(this.KEY_SESSION); },
  requireAuth: function(redirectTo){
    if (!this.getSession()) window.location.href = redirectTo || 'signup.html';
  },
  redirectIfAuthenticated: function(redirectTo){
    if (this.getSession()) window.location.href = redirectTo || 'dashboard.html';
  },

  // ---- Mot de passe oublié / réinitialisation ----
  getResets: function(){
    try { return JSON.parse(localStorage.getItem(this.KEY_RESETS)) || {}; }
    catch(e){ return {}; }
  },
  saveResets: function(resets){ localStorage.setItem(this.KEY_RESETS, JSON.stringify(resets)); },
  requestPasswordReset: function(email){
    if (!this.findByEmail(email)) return { ok:false, error:'Aucun compte associé à cet email.' };
    var token = 'rst_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    var resets = this.getResets();
    resets[token] = { email: email.toLowerCase(), createdAt: Date.now() };
    this.saveResets(resets);
    return { ok:true, token:token };
  },
  verifyResetToken: function(token){
    var resets = this.getResets();
    var entry = resets[token];
    if (!entry) return null;
    // Le lien expire au bout de 30 minutes (simulation)
    if (Date.now() - entry.createdAt > 30 * 60 * 1000) return null;
    return entry;
  },
  resetPassword: function(token, newPassword){
    var entry = this.verifyResetToken(token);
    if (!entry) return { ok:false, error:'Ce lien de réinitialisation est invalide ou a expiré.' };
    if (!newPassword || newPassword.length < 6) return { ok:false, error:'Le mot de passe doit contenir au moins 6 caractères.' };
    var users = this.getUsers();
    var user = users.find(function(u){ return u.email.toLowerCase() === entry.email; });
    if (!user) return { ok:false, error:'Compte introuvable.' };
    user.password = newPassword;
    this.saveUsers(users);
    var resets = this.getResets();
    delete resets[token];
    this.saveResets(resets);
    return { ok:true, email: user.email };
  },

  // ---- Suppression de compte ----
  deleteAccount: function(email){
    email = email || this.getSession();
    if (!email) return { ok:false };
    var users = this.getUsers().filter(function(u){ return u.email.toLowerCase() !== email.toLowerCase(); });
    this.saveUsers(users);
    if (this.getSession() && this.getSession().toLowerCase() === email.toLowerCase()) this.logout();
    return { ok:true };
  }
};
