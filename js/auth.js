// ---- Mini "backend" de connexion (simulation côté client via localStorage) ----
// Pas de serveur réel : sert à démontrer le flux Sign up -> connecté -> Dashboard.
var PapioAuth = {
  KEY_USERS: 'papio_users',
  KEY_SESSION: 'papio_session',

  getUsers: function(){
    try { return JSON.parse(localStorage.getItem(this.KEY_USERS)) || []; }
    catch(e){ return []; }
  },
  saveUsers: function(users){
    localStorage.setItem(this.KEY_USERS, JSON.stringify(users));
  },
  register: function(user){
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
      return u.email.toLowerCase() === email.toLowerCase() && u.password === password;
    });
    if (!user) return { ok:false, error:'Email ou mot de passe incorrect.' };
    this.setSession(email);
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
  }
};
