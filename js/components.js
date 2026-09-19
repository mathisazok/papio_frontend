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
