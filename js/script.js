// ── CURSOR (pointer devices only) ──
const isTouch = window.matchMedia('(hover:none),(pointer:coarse)').matches;
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
if(isTouch){
  if(cursor) cursor.remove();
  if(ring) ring.remove();
}else{
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    cursor.style.transform=`translate(${mx-6}px,${my-6}px)`;
  },{passive:true});
  (function animRing(){
    rx+=(mx-rx)*.12;ry+=(my-ry)*.12;
    ring.style.transform=`translate(${rx-18}px,${ry-18}px)`;
    requestAnimationFrame(animRing);
  })();
}

// ── PARTICLES ──
const pw = document.getElementById('particles');
for(let i=0;i<30;i++){
  const p=document.createElement('div');
  p.className='particle';
  const s=Math.random()*4+1;
  p.style.cssText=`
    width:${s}px;height:${s}px;
    left:${Math.random()*100}%;
    animation-duration:${Math.random()*15+10}s;
    animation-delay:${Math.random()*10}s;
    opacity:${Math.random()*0.4+0.1};
  `;
  pw.appendChild(p);
}

// ── SCROLL REVEAL ──
const obs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}
  });
},{threshold:.1,rootMargin:'0px 0px -50px 0px'});
document.querySelectorAll('.reveal').forEach((el,i)=>{
  el.style.transitionDelay=`${(i%4)*0.1}s`;
  obs.observe(el);
});

// ── FAQ ──
function toggleFaq(btn){
  const item=btn.closest('.faq-item');
  const isOpen=item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(el=>el.classList.remove('open'));
  if(!isOpen) item.classList.add('open');
}

// ── NAV SCROLL ──
window.addEventListener('scroll',()=>{
  const nav=document.querySelector('nav');
  nav.style.background=window.scrollY>50
    ?'rgba(0,4,13,0.98)':'linear-gradient(180deg,rgba(0,4,13,0.95) 0%,transparent 100%)';
});

/* hero 3D parallax */
(function(){
  var layer = document.getElementById('hero3d');
  var hero  = document.getElementById('hero');
  if(!layer || !hero) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(window.matchMedia('(hover: none)').matches) return;
  var qx = 0, qy = 0, ticking = false;
  hero.addEventListener('mousemove', function(e){
    var r = hero.getBoundingClientRect();
    qx = (e.clientX - r.left) / r.width - 0.5;
    qy = (e.clientY - r.top) / r.height - 0.5;
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      layer.style.transform = 'rotateY(' + (qx * 12).toFixed(2) + 'deg) rotateX(' + (-qy * 8).toFixed(2) + 'deg)';
      ticking = false;
    });
  }, {passive:true});
  hero.addEventListener('mouseleave', function(){
    layer.style.transform = '';
  });
})();

/* pause hero animations when off-screen */
(function(){
  var hero = document.getElementById('hero');
  if(!hero || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(en){
    hero.classList.toggle('hero-paused', !en[0].isIntersecting);
  },{threshold:0.01}).observe(hero);
})();

/* touch devices: activate card hover state when it reaches the middle of the screen */
(function(){
  if(!window.matchMedia('(hover:none),(pointer:coarse)').matches) return;
  if(!('IntersectionObserver' in window)) return;
  var sel = '.why-card,.module-card,.workflow-step,.testi-card,.cert-img-frame,.about-frame,.free-course-box';
  var items = document.querySelectorAll(sel);
  if(!items.length) return;
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      en.target.classList.toggle('in-view', en.isIntersecting);
    });
  },{rootMargin:'-42% 0px -42% 0px', threshold:0});
  items.forEach(function(el){ io.observe(el); });
})();

/* count-up stats on scroll */
(function(){
  var nodes = document.querySelectorAll('[data-countup]');
  if(!nodes.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function run(el){
    var target = parseInt(el.getAttribute('data-countup'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if(reduce){ el.textContent = target + suffix; return; }
    var dur = 1400, t0 = null;
    el.classList.add('counting');
    requestAnimationFrame(function step(ts){
      if(t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = Math.max(1, Math.round(eased * target));
      el.textContent = val + (p === 1 ? suffix : '');
      if(p < 1){
        requestAnimationFrame(step);
      }else{
        el.classList.remove('counting');
        el.classList.add('counted');
      }
    });
  }

  if(!('IntersectionObserver' in window)){
    nodes.forEach(run);
    return;
  }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      io.unobserve(en.target);
      run(en.target);
    });
  },{threshold:0.6});
  nodes.forEach(function(el){ io.observe(el); });
})();

/* mobile: draw the workflow line as the user scrolls */
(function(){
  var wrap = document.querySelector('.workflow-steps');
  if(!wrap) return;
  var mq = window.matchMedia('(max-width:640px)');
  var spark = wrap.querySelector('.wf-spark');
  var icons = wrap.querySelectorAll('.step-icon');
  var ticking = false;

  function paint(){
    ticking = false;
    if(!mq.matches){
      wrap.style.removeProperty('--wf-progress');
      wrap.classList.remove('wf-active');
      return;
    }
    var r = wrap.getBoundingClientRect();
    var readY = window.innerHeight * 0.5;   /* same line the card hover uses */
    var startY = r.top + 36;                /* first icon centre */
    var span = r.height - 116;              /* first icon centre → last icon centre */
    if(span <= 0) return;
    var p = (readY - startY) / span;
    p = Math.max(0, Math.min(1, p));
    var travelled = p * span;
    wrap.style.setProperty('--wf-progress', travelled.toFixed(1) + 'px');
    wrap.classList.toggle('wf-active', p > 0 && p < 1);

    /* hide the spark while it sits behind one of the orbs */
    var sparkY = 36 + travelled;
    var hidden = false;
    for(var i = 0; i < icons.length; i++){
      var ir = icons[i].getBoundingClientRect();
      var centre = (ir.top + ir.height / 2) - r.top;
      if(Math.abs(sparkY - centre) < (ir.height / 2) + 6){ hidden = true; break; }
    }
    if(spark) spark.classList.toggle('at-orb', hidden);
  }

  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(paint);
  }

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});
  if(mq.addEventListener) mq.addEventListener('change', paint);
  paint();
})();