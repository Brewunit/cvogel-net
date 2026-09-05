'use strict';
function frameForProgress(progress, count) {
  const last = Math.max(1, (count || 96) - 1);
  return 1 + Math.round(Math.max(0, Math.min(1, progress)) * last);
}
function composeInquiry(services, brief) {
  const subject = 'Project inquiry' + (services.length ? ' — ' + services.join(' + ') : '');
  const body = 'Hi C Vogel Designs,\n\n' + (services.length ? 'I’m interested in: ' + services.join(' + ') + '.\n\n' : '') + (brief.trim() || 'I’d like to talk about a project.') + '\n\nThanks!';
  return 'mailto:me@cvogel.net?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
}
if (typeof module !== 'undefined') module.exports = {frameForProgress, composeInquiry};
if (typeof document !== 'undefined') (() => {
  const $ = selector => document.querySelector(selector);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const debug = window.cvdDebug = {frame:120, drawnFrame:0, progress:0, loaded:0, failed:0, reducedMotion:reduced.matches, sculpture:{rotationX:-.25,rotationY:.4,shape:'knot',color:'chrome'}, mailto:''};
  const hero = $('.hero'), canvas = $('#hero-canvas'), context = canvas.getContext('2d');
  const HERO_COUNT = 120;
  const VIDEO_END = 0.55;
  const frames = new Array(HERO_COUNT + 1), pending = new Set();
  let desired = 120, scheduled = false, size = {width:0,height:0}, started = false;
  function resizeHero() {
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
    size = {width:canvas.width,height:canvas.height}; drawHero();
  }
  function drawHero() {
    if(reduced.matches){canvas.classList.remove('ready');return;}
    let index = desired;
    if (!frames[index]) {
      let nearest = -1;
      for(let i=1;i<=HERO_COUNT;i++) if(frames[i] && (nearest === -1 || Math.abs(i-desired)<Math.abs(nearest-desired))) nearest=i;
      if(nearest === -1) return;
      index=nearest;
    }
    const image=frames[index];
    if(!size.width || !image.naturalWidth) return;
    const fit=window.matchMedia('(max-width:640px)').matches?Math.min:Math.max;
    const scale=fit(size.width/image.naturalWidth,size.height/image.naturalHeight);
    context.fillStyle='#050505';
    context.fillRect(0,0,size.width,size.height);
    context.drawImage(image,(size.width-image.naturalWidth*scale)/2,(size.height-image.naturalHeight*scale)/2,image.naturalWidth*scale,image.naturalHeight*scale);
    canvas.classList.add('ready'); debug.drawnFrame=index;
  }
  function loadFrame(index) {
    return new Promise(resolve => {
      if(frames[index] || pending.has(index)) return resolve();
      pending.add(index);
      const image=new Image(); image.decoding='async';
      image.onload=()=>{frames[index]=image;pending.delete(index);debug.loaded++;drawHero();resolve();};
      image.onerror=()=>{pending.delete(index);debug.failed++;if(debug.failed===HERO_COUNT) $('#motion-label').textContent='Still view · keep scrolling';resolve();};
      image.src='assets/logo-frames/frame-'+String(index).padStart(3,'0')+'.webp?v=1';
    });
  }
  async function preload() {
    if(started || reduced.matches) return;
    started=true;
    // Sparse keyframes first keep fast scrolling responsive before the full sequence arrives.
    const order=[HERO_COUNT,1,Math.round(HERO_COUNT/2),Math.round(HERO_COUNT*.75),Math.round(HERO_COUNT/4),...Array.from({length:HERO_COUNT},(_,i)=>HERO_COUNT-i)].filter((n,i,a)=>n>=1&&n<=HERO_COUNT&&a.indexOf(n)===i);
    let cursor=0;
    async function worker(){while(cursor<order.length){await loadFrame(order[cursor++]);}}
    await Promise.all(Array.from({length:5},worker));
  }
  function updateScroll() {
    scheduled=false;
    const rect=hero.getBoundingClientRect();
    const distance=hero.offsetHeight-window.innerHeight;
    const progress=reduced.matches?0:Math.max(0,Math.min(1,-rect.top/Math.max(1,distance)));
    const videoProgress=Math.min(1, progress / VIDEO_END);
    const forward=frameForProgress(videoProgress, HERO_COUNT);
    desired=progress>=VIDEO_END?1:(HERO_COUNT+1-forward);
    debug.frame=desired;debug.progress=progress;
    $('#scroll-progress').style.width=(progress*100)+'%';
    const frameEl=$('#frame-number'); if(frameEl) frameEl.textContent=String(desired).padStart(2,'0');
    const label=$('#motion-label');
    if(label && !reduced.matches) label.textContent=progress<VIDEO_END?'Scroll.':'Keep scrolling.';
    document.querySelectorAll('#hero-services li').forEach(el=>{
      const from=parseFloat(el.dataset.from);
      el.classList.toggle('is-on', reduced.matches?false:progress>=from);
    });
    drawHero();
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(updateScroll);}}
  window.addEventListener('scroll',schedule,{passive:true});
  new ResizeObserver(()=>{resizeHero();schedule();}).observe(canvas);
  function motionPreference(){
    debug.reducedMotion=reduced.matches;
    $('#motion-label').textContent=reduced.matches?'C Vogel Designs.':'Scroll.';
    if(!reduced.matches)preload();
    else {
      canvas.classList.remove('ready');
      document.querySelectorAll('#hero-services li').forEach(el=>el.classList.add('is-on'));
    }
    schedule();
  }
  reduced.addEventListener('change',motionPreference);motionPreference();resizeHero();schedule();

  (function bindCanScrub(){
    const section=$('.can-stage'), canvas=$('#can-canvas');
    if(!section||!canvas) return;
    const context=canvas.getContext('2d');
    const COUNT=120;
    const bag=debug.can={frame:1,drawnFrame:0,progress:0,loaded:0,failed:0};
    const frames=new Array(COUNT+1);
    const pending=new Set();
    let desired=1, scheduled=false, size={width:0,height:0}, started=false;
    function resize(){
      const rect=canvas.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2);
      canvas.width=Math.round(rect.width*dpr); canvas.height=Math.round(rect.height*dpr);
      size={width:canvas.width,height:canvas.height}; draw();
    }
    function draw(){
      if(reduced.matches){canvas.classList.remove('ready');return;}
      let index=desired;
      if(!frames[index]){
        let nearest=-1;
        for(let i=1;i<=COUNT;i++) if(frames[i] && (nearest===-1 || Math.abs(i-desired)<Math.abs(nearest-desired))) nearest=i;
        if(nearest===-1) return;
        index=nearest;
      }
      const image=frames[index];
      if(!size.width || !image.naturalWidth) return;
      const fit=window.matchMedia('(max-width:640px)').matches?Math.min:Math.max;
      const scale=fit(size.width/image.naturalWidth,size.height/image.naturalHeight);
      context.fillStyle='#111';
      context.fillRect(0,0,size.width,size.height);
      context.drawImage(image,(size.width-image.naturalWidth*scale)/2,(size.height-image.naturalHeight*scale)/2,image.naturalWidth*scale,image.naturalHeight*scale);
      canvas.classList.add('ready'); bag.drawnFrame=index;
    }
    function loadFrame(index){
      return new Promise(resolve=>{
        if(frames[index]||pending.has(index)) return resolve();
        pending.add(index);
        const image=new Image(); image.decoding='async';
        image.onload=()=>{frames[index]=image;pending.delete(index);bag.loaded++;draw();resolve();};
        image.onerror=()=>{pending.delete(index);bag.failed++;if(bag.failed===COUNT) $('#can-motion-label').textContent='Still view · keep scrolling';resolve();};
        image.src='assets/can-frames/frame-'+String(index).padStart(3,'0')+'.webp?v=1';
      });
    }
    async function preload(){
      if(started||reduced.matches) return;
      started=true;
      const order=[1,COUNT,Math.round(COUNT/2),Math.round(COUNT/4),Math.round(COUNT*.75),...Array.from({length:COUNT},(_,i)=>i+1)].filter((n,i,a)=>n>=1&&n<=COUNT&&a.indexOf(n)===i);
      let cursor=0;
      async function worker(){while(cursor<order.length){await loadFrame(order[cursor++]);}}
      await Promise.all(Array.from({length:5},worker));
    }
    function update(){
      scheduled=false;
      const rect=section.getBoundingClientRect();
      const distance=section.offsetHeight-window.innerHeight;
      const FIRST=24, LAST=COUNT;
      const VIDEO_END=0.62;
      const progress=reduced.matches?0:Math.max(0,Math.min(1,-rect.top/Math.max(1,distance)));
      const videoProgress=Math.min(1, progress / VIDEO_END);
      desired=progress>=VIDEO_END?LAST:FIRST + Math.round(videoProgress * (LAST-FIRST)); bag.frame=desired; bag.progress=progress;
      const bar=$('#can-progress'); if(bar) bar.style.width=(progress*100)+'%';
      const overlay=$('#can-overlay');
      const locked=reduced.matches || progress>=VIDEO_END;
      if(overlay) overlay.classList.toggle('is-on', locked);
      section.classList.toggle('is-locked', locked);
      document.querySelectorAll('#can-services li').forEach(el=>{
        const from=parseFloat(el.dataset.from);
        el.classList.toggle('is-on', reduced.matches?true:progress>=from);
      });
      draw();
    }
    function tick(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
    window.addEventListener('scroll',tick,{passive:true});
    new ResizeObserver(()=>{resize();tick();}).observe(canvas);
    function motion(){
      $('#can-motion-label').textContent=reduced.matches?'Packaging':'Scroll';
      if(!reduced.matches)preload(); else canvas.classList.remove('ready');
      tick();
    }
    reduced.addEventListener('change',motion); motion(); resize(); tick();
  })();

  const stage=$('#logo-stage'), mark=$('#logo-3d');
  const spin=debug.sculpture={rotationX:-12,rotationY:18};
  let drag=null;
  function applySpin(){
    if(!mark) return;
    mark.style.transform='rotateX('+spin.rotationX+'deg) rotateY('+spin.rotationY+'deg)';
  }
  function resetLogo(){spin.rotationX=-12;spin.rotationY=18;applySpin();if($('#sculpture-status')) $('#sculpture-status').textContent='Logo reset.';}
  if(stage && mark){
    applySpin();
    stage.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};stage.setPointerCapture(e.pointerId);stage.focus({preventScroll:true});});
    stage.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;spin.rotationY+=(e.clientX-drag.x)*.35;spin.rotationX=Math.max(-60,Math.min(60,spin.rotationX-(e.clientY-drag.y)*.35));drag.x=e.clientX;drag.y=e.clientY;applySpin();});
    function endDrag(){drag=null;}
    stage.addEventListener('pointerup',endDrag);stage.addEventListener('pointercancel',endDrag);
    stage.addEventListener('keydown',e=>{
      const arrows=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
      if(arrows.includes(e.key)){e.preventDefault();const d=e.shiftKey?18:8;if(e.key==='ArrowLeft')spin.rotationY-=d;if(e.key==='ArrowRight')spin.rotationY+=d;if(e.key==='ArrowUp')spin.rotationX-=d;if(e.key==='ArrowDown')spin.rotationX+=d;applySpin();}
      else if(e.key.toLowerCase()==='r')resetLogo();
    });
  }

    document.querySelectorAll('[data-service-link]').forEach(link=>link.addEventListener('click',()=>{const input=document.querySelector('input[name="service"][value="'+link.dataset.serviceLink+'"]');if(input)input.checked=true;}));
  $('#inquiry-form').addEventListener('submit',event=>{
    event.preventDefault();const services=Array.from(document.querySelectorAll('input[name="service"]:checked'),input=>input.value);
    const url=composeInquiry(services,$('#project-brief').value);debug.mailto=url;
    $('#inquiry-status').textContent='Your email draft is ready. If no app opened, email me@cvogel.net directly.';
    window.location.href=url;
  });

  (function bindInstagram(){
    const rail=$('#ig-rail');
    if(!rail) return;
    const bag=debug.ig={source:'fallback',count:rail.querySelectorAll('figure').length,feed:''};
    const extras=[
      {src:'assets/feed/porkys-hats.jpg',alt:'Porky’s hats'},
      {src:'assets/feed/landscaping-tee.jpg',alt:'Landscaping tee'},
      {src:'assets/feed/landscaping-koozies.jpg',alt:'Landscaping koozies'},
      {src:'assets/feed/banana-socks.jpg',alt:'Banana socks'},
      {src:'assets/feed/cycle-era-tee.jpg',alt:'Cycle era tee'},
      {src:'assets/feed/redline-tee.jpg',alt:'Redline tee'}
    ];
    function thumb(post){
      if(post.sizes && post.sizes.large && post.sizes.large.mediaUrl) return post.sizes.large.mediaUrl;
      if(post.sizes && post.sizes.medium && post.sizes.medium.mediaUrl) return post.sizes.medium.mediaUrl;
      return post.thumbnailUrl || post.mediaUrl || post.src || '';
    }
    function addTile(href, src, alt){
      if(!src) return;
      const a=document.createElement('a');
      a.href=href; a.target='_blank'; a.rel='noopener noreferrer';
      const fig=document.createElement('figure');
      const img=document.createElement('img');
      img.src=src; img.alt=alt||'Instagram'; img.width=700; img.height=700; img.loading='lazy';
      fig.appendChild(img); a.appendChild(fig); rail.appendChild(a);
    }
    function paint(posts, username){
      const live=(posts||[]).filter(p=>thumb(p)).slice(0,9);
      rail.replaceChildren();
      live.forEach(post=>{
        addTile(post.permalink||'https://www.instagram.com/cvogel_designs/', thumb(post), post.altText||post.prunedCaption||post.caption||'Instagram');
      });
      extras.forEach(item=>{
        if(rail.children.length>=9) return;
        addTile('https://www.instagram.com/cvogel_designs/', item.src, item.alt);
      });
      bag.source=live.length?'behold':'fallback'; bag.count=rail.children.length;
      if(username){
        const link=document.querySelector('.ig-kicker a');
        if(link){ link.textContent='@'+username; link.href='https://www.instagram.com/'+username+'/'; }
      }
    }
    function feedIdFrom(config){
      const q=new URLSearchParams(location.search).get('ig');
      if(q) return q.trim();
      if(config && config.behold) return String(config.behold).trim();
      try { return (localStorage.getItem('cvd-behold')||'').trim(); } catch(e){ return ''; }
    }
    fetch('assets/ig-config.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({})).then(config=>{
      const id=feedIdFrom(config);
      bag.feed=id;
      if(!id){ paint([]); return; }
      return fetch('https://feeds.behold.so/'+encodeURIComponent(id)+'?t='+Date.now(),{cache:'no-store'}).then(r=>{
        if(!r.ok) throw new Error('behold '+r.status);
        return r.json();
      }).then(data=>{
        const posts=Array.isArray(data)?data:(data.posts||data.media||[]);
        paint(posts, data.username);
      }).catch(err=>{ bag.error=String(err); paint([]); });
    });
  })();
})();
