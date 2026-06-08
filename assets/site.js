// Shared interactions: nav scroll state, mobile menu, scroll reveal, lang toggle
(function(){
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if(!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // mobile menu
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.mobile-menu');
  if(burger && menu){
    burger.addEventListener('click', ()=>{
      const open = menu.classList.toggle('open');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      menu.classList.remove('open'); document.body.style.overflow='';
    }));
  }

  // scroll reveal (rect-based — robust across embedded iframes where IO can be flaky)
  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const counters = Array.from(document.querySelectorAll('[data-count]'));

  function reveal(el){
    el.classList.add('in');
    // Fallback: some embedded/offscreen iframes freeze the transition clock,
    // leaving opacity stuck at 0. After the animation window, snap to the
    // final state with transitions disabled so content is ALWAYS visible.
    setTimeout(()=>{ el.style.transition='none'; el.style.opacity='1'; el.style.transform='none'; }, 1500);
  }

  function runCounter(el){
    if(el._counted) return; el._counted = true;
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1600, start = performance.now();
    const step = (now)=>{
      const p = Math.min((now-start)/dur,1);
      const eased = 1-Math.pow(1-p,3);
      const val = target*eased;
      el.textContent = (Number.isInteger(target)? Math.round(val): val.toFixed(0)) + suffix;
      if(p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // guarantee final value even if rAF is throttled
    setTimeout(()=>{ el.textContent = (Number.isInteger(target)?target:target.toFixed(0)) + suffix; }, 1800);
  }

  function check(){
    const vh = window.innerHeight || document.documentElement.clientHeight;
    for(let i=reveals.length-1;i>=0;i--){
      const el = reveals[i];
      const r = el.getBoundingClientRect();
      if(r.top < vh - 24 && r.bottom > 0){ reveal(el); reveals.splice(i,1); }
    }
    for(let i=counters.length-1;i>=0;i--){
      const el = counters[i];
      const r = el.getBoundingClientRect();
      if(r.top < vh*0.85 && r.bottom > 0){ runCounter(el); counters.splice(i,1); }
    }
  }
  let ticking=false;
  const onCheck=()=>{ if(ticking) return; ticking=true; requestAnimationFrame(()=>{check();ticking=false;}); };
  window.addEventListener('scroll', onCheck, {passive:true});
  window.addEventListener('resize', onCheck, {passive:true});
  check();
  setTimeout(check,120);
  window.addEventListener('load', check);

  // language toggle (visual demo)
  document.querySelectorAll('.lang button').forEach(b=>{
    b.addEventListener('click',()=>{
      b.parentElement.querySelectorAll('button').forEach(x=>x.classList.remove('on'));
      b.classList.add('on');
    });
  });

  // hero slider
  const hero = document.querySelector('.hero');
  if(hero){
    const slides  = Array.from(hero.querySelectorAll('.hero-slide'));
    const figures = Array.from(hero.querySelectorAll('.hero-figure'));
    const dots    = Array.from(hero.querySelectorAll('.hero-dot'));
    if(slides.length > 1){
      let idx = 0, timer = null, snapT = null;
      const DURATION = 6500;
      const apply = ()=>{
        clearTimeout(snapT);
        // Clear any inline overrides left by a previous snap so the CSS
        // transitions drive this change smoothly.
        figures.forEach(f=>{ f.style.transition=''; f.style.opacity=''; });
        slides.forEach(s=>Array.from(s.children).forEach(ch=>{ ch.style.transition=''; ch.style.opacity=''; ch.style.transform=''; }));
        slides.forEach((s,k)=>s.classList.toggle('active', k===idx));
        figures.forEach((f,k)=>f.classList.toggle('active', k===idx));
        dots.forEach((d,k)=>{ const on=k===idx; d.classList.toggle('active', on); d.setAttribute('aria-selected', on); });
        // Robustness: some embedded/offscreen iframes freeze the transition clock,
        // which would leave a faded layer stuck at the wrong opacity. After the fade
        // window, snap every layer to its final value (transitions briefly disabled).
        snapT = setTimeout(()=>{
          figures.forEach((f,k)=>{ f.style.transition='none'; f.style.opacity = (k===idx)?'1':'0'; });
          Array.from(slides[idx].children).forEach(ch=>{ ch.style.transition='none'; ch.style.opacity='1'; ch.style.transform='none'; });
        }, 1300);
      };
      const go = (n)=>{ idx = (n + slides.length) % slides.length; apply(); };
      const start = ()=>{ stop(); timer = setInterval(()=>go(idx+1), DURATION); };
      const stop  = ()=>{ if(timer){ clearInterval(timer); timer=null; } };
      dots.forEach((d,k)=>d.addEventListener('click', ()=>{ go(k); start(); }));
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      // entrance: re-trigger slide 0 so its content animates in, then auto-play
      requestAnimationFrame(()=>{
        slides.forEach(s=>s.classList.remove('active'));
        figures.forEach(f=>f.classList.remove('active'));
        void hero.offsetWidth;
        go(0); start();
      });
    }
  }
})();
