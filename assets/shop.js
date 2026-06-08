// Produse — filtering, search, sort, counts, mobile filter drawer, deep-link
(function(){
  const grid = document.getElementById('productGrid');
  if(!grid) return;
  const products = Array.from(grid.querySelectorAll('.product'));
  const catBtns = Array.from(document.querySelectorAll('#catList .filter-btn'));
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const countEl = document.getElementById('shopCount');
  const emptyEl = document.getElementById('shopEmpty');
  const resetBtn = document.getElementById('resetFilters');

  let activeCat = 'all';
  let query = '';

  // ----- counts per category -----
  function updateCounts(){
    const counts = {all: products.length};
    products.forEach(p=>{
      p.dataset.cat.split(' ').forEach(c=>{ counts[c]=(counts[c]||0)+1; });
    });
    document.querySelectorAll('.cnt').forEach(el=>{
      const k = el.dataset.for; el.textContent = counts[k]||0;
    });
  }

  // ----- apply filters -----
  function apply(){
    let shown = 0;
    products.forEach(p=>{
      const cats = p.dataset.cat.split(' ');
      const matchCat = activeCat==='all' || cats.includes(activeCat);
      const hay = (p.dataset.name+' '+p.dataset.brand).toLowerCase();
      const matchQ = !query || hay.includes(query);
      const show = matchCat && matchQ;
      p.classList.toggle('hide', !show);
      if(show) shown++;
    });
    countEl.textContent = shown;
    emptyEl.classList.toggle('show', shown===0);
  }

  // ----- sort -----
  function sortBy(mode){
    const arr = products.slice();
    arr.sort((a,b)=>{
      if(mode==='az') return a.dataset.name.localeCompare(b.dataset.name,'ro');
      if(mode==='za') return b.dataset.name.localeCompare(a.dataset.name,'ro');
      if(mode==='brand') return a.dataset.brand.localeCompare(b.dataset.brand,'ro') || a.dataset.name.localeCompare(b.dataset.name,'ro');
      return (+a.dataset.feat||999)-(+b.dataset.feat||999); // featured
    });
    arr.forEach(p=>grid.insertBefore(p, emptyEl));
  }

  // ----- category selection -----
  function setCat(cat){
    activeCat = cat;
    catBtns.forEach(b=>b.classList.toggle('active', b.dataset.cat===cat));
    apply();
  }
  catBtns.forEach(b=>b.addEventListener('click',()=>{ setCat(b.dataset.cat); closeDrawer(); }));

  searchInput && searchInput.addEventListener('input',()=>{ query = searchInput.value.trim().toLowerCase(); apply(); });
  sortSelect && sortSelect.addEventListener('change',()=>sortBy(sortSelect.value));
  resetBtn && resetBtn.addEventListener('click',()=>{ query=''; if(searchInput) searchInput.value=''; if(sortSelect) sortSelect.value='featured'; sortBy('featured'); setCat('all'); });

  // ----- mobile drawer -----
  const filters = document.getElementById('filters');
  const toggle = document.getElementById('filterToggle');
  const closeBtn = document.getElementById('filtersClose');
  function closeDrawer(){ filters && filters.classList.remove('open'); document.body.style.overflow=''; }
  toggle && toggle.addEventListener('click',()=>{ filters.classList.add('open'); document.body.style.overflow='hidden'; });
  closeBtn && closeBtn.addEventListener('click', closeDrawer);

  // ----- deep link ?cat= -----
  const params = new URLSearchParams(location.search);
  const initial = params.get('cat');
  const valid = catBtns.map(b=>b.dataset.cat);
  updateCounts();
  if(initial && valid.includes(initial)) setCat(initial); else apply();
  sortBy('featured');
})();
