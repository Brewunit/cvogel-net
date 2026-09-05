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
  const HERO_STOP = 20;
  const VIDEO_END = 0.36;
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
    const scale=Math.max(size.width/image.naturalWidth,size.height/image.naturalHeight);
    context.fillStyle='#050505';
    context.fillRect(0,0,size.width,size.height);
    context.drawImage(image,(size.width-image.naturalWidth*scale)/2,(size.height-image.naturalHeight*scale)/2,image.naturalWidth*scale,image.naturalHeight*scale);
    canvas.classList.add('ready'); debug.drawnFrame=index;
  }
  const snakeCanvas=$('#hero-snake'), snakeCtx=snakeCanvas&&snakeCanvas.getContext('2d');
  const SNAKE_GROW=0.52, SNAKE_HOLD=0.58, SNAKE_GONE=0.68, SNAKE_PULSE_END=0.98;
  let snakePulse=false;
  function snakeCorners(){
    const sticky=$('.hero-sticky'), btn=$('.quote-btn');
    if(!sticky||!btn) return [];
    const sr=sticky.getBoundingClientRect(), br=btn.getBoundingClientRect();
    const x=Math.max(28, sr.width*0.045);
    const start={x, y:Math.max(72, sr.height*0.11)};
    const end={x:br.left-sr.left+br.width/2, y:br.top-sr.top+br.height/2};
    return [start,{x, y:end.y},end];
  }
  function easeOut(t){t=Math.max(0,Math.min(1,t)); return 1-Math.pow(1-t,2);}
  function snakeLength(pts){
    let n=0; for(let i=1;i<pts.length;i++) n+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y); return n;
  }
  function snakeAt(pts, t, total){
    let left=Math.max(0,Math.min(1,t))*total;
    for(let i=1;i<pts.length;i++){
      const d=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);
      if(left<=d){const k=d?left/d:0; return {x:pts[i-1].x+(pts[i].x-pts[i-1].x)*k, y:pts[i-1].y+(pts[i].y-pts[i-1].y)*k};}
      left-=d;
    }
    return pts[pts.length-1];
  }
  function drawSnake(progress){
    if(!snakeCanvas||!snakeCtx) return;
    const sticky=$('.hero-sticky'), btn=$('.quote-btn');
    if(!sticky) return;
    const rect=sticky.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2);
    const w=Math.round(rect.width*dpr), h=Math.round(rect.height*dpr);
    if(snakeCanvas.width!==w||snakeCanvas.height!==h){snakeCanvas.width=w;snakeCanvas.height=h;}
    snakeCtx.setTransform(dpr,0,0,dpr,0,0);
    snakeCtx.clearRect(0,0,rect.width,rect.height);
    if(reduced.matches||progress<VIDEO_END){if(btn) btn.classList.remove('is-pointed'); snakePulse=false; return;}
    const pts=snakeCorners(); if(pts.length<2) return;
    const total=snakeLength(pts);
    let head=0, tail=0, pulse=0;
    if(progress<SNAKE_GROW){head=easeOut((progress-VIDEO_END)/(SNAKE_GROW-VIDEO_END));}
    else if(progress<SNAKE_HOLD){head=1; pulse=(progress-SNAKE_GROW)/(SNAKE_HOLD-SNAKE_GROW);}
    else if(progress<SNAKE_GONE){head=1; tail=easeOut((progress-SNAKE_HOLD)/(SNAKE_GONE-SNAKE_HOLD));}
    else if(progress<SNAKE_PULSE_END){
      if(btn) btn.classList.add('is-pointed');
      snakePulse=true;
      const br=btn.getBoundingClientRect();
      const cx=br.left-rect.left+br.width/2, cy=br.top-rect.top+br.height/2;
      const hold=(progress-SNAKE_GONE)/(SNAKE_PULSE_END-SNAKE_GONE);
      for(let k=0;k<3;k++){
        const local=(hold*2.2+k/3)%1;
        snakeCtx.strokeStyle='rgba(244,241,234,'+(1-local)*0.9+')';
        snakeCtx.lineWidth=3;
        snakeCtx.beginPath(); snakeCtx.arc(cx,cy,14+local*48,0,Math.PI*2); snakeCtx.stroke();
      }
      return;
    }
    else {if(btn) btn.classList.remove('is-pointed'); snakePulse=false; return;}
    if(head<=tail){if(btn) btn.classList.remove('is-pointed'); snakePulse=false; return;}
    snakeCtx.lineCap='round'; snakeCtx.lineJoin='round';
    snakeCtx.strokeStyle='#f4f1ea'; snakeCtx.lineWidth=8;
    snakeCtx.shadowColor='rgba(244,241,234,.55)'; snakeCtx.shadowBlur=12;
    snakeCtx.beginPath();
    const steps=96;
    for(let i=0;i<=steps;i++){
      const t=tail+(head-tail)*(i/steps);
      const p=snakeAt(pts,t,total);
      if(i===0) snakeCtx.moveTo(p.x,p.y); else snakeCtx.lineTo(p.x,p.y);
    }
    snakeCtx.stroke();
    snakeCtx.shadowBlur=0;
    const tip=snakeAt(pts,head,total);
    snakeCtx.fillStyle='#f4f1ea';
    snakeCtx.beginPath(); snakeCtx.arc(tip.x,tip.y,5,0,Math.PI*2); snakeCtx.fill();
    if(pulse>0 && pulse<1){
      for(let k=0;k<3;k++){
        const local=(pulse+k/3)%1;
        const r=10+local*42;
        snakeCtx.strokeStyle='rgba(244,241,234,'+(1-local)+')';
        snakeCtx.lineWidth=3;
        snakeCtx.beginPath(); snakeCtx.arc(tip.x,tip.y,r,0,Math.PI*2); snakeCtx.stroke();
      }
      if(btn && !snakePulse){btn.classList.add('is-pointed'); snakePulse=true;}
    } else if(btn && tail>0){
      btn.classList.add('is-pointed'); snakePulse=true;
    } else if(btn && pulse<=0){
      btn.classList.remove('is-pointed'); snakePulse=false;
    }
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
    desired=progress>=VIDEO_END?HERO_STOP:HERO_COUNT - Math.round(videoProgress * (HERO_COUNT - HERO_STOP));
    debug.frame=desired;debug.progress=progress;
    $('#scroll-progress').style.width=(progress*100)+'%';
    const frameEl=$('#frame-number'); if(frameEl) frameEl.textContent=String(desired).padStart(2,'0');
    const label=$('#motion-label');
    if(label && !reduced.matches) label.textContent=progress<VIDEO_END?'Scroll.':'Keep scrolling.';
    drawHero();
    drawSnake(progress);
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
      const scale=Math.max(size.width/image.naturalWidth,size.height/image.naturalHeight);
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

  (function bindSky(){
    const canvas=$('#sky'), section=$('.dream-sticky')||$('.dream');
    if(!canvas||!section) return;
    const gl=canvas.getContext('webgl',{antialias:false,alpha:false});
    const pointer={x:0,y:0,tx:0,ty:0};
    let raf=0, start=performance.now();
    if(!gl) return;
    const vs='attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}';
    const fs=[
      'precision highp float;',
      'uniform vec2 u_res,u_mouse;',
      'uniform float u_time;',
      'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}',
      'void main(){vec2 uv=gl_FragCoord.xy/u_res;uv.x*=u_res.x/max(u_res.y,.001);',
      'vec2 m=u_mouse; uv+=m*.28;',
      'vec2 p=uv*vec2(2.5,4.0); p.x+=u_time*.03; p.y+=m.y*.4;',
      'float warp=fbm(p*.75+vec2(m.x,m.y)*1.8);',
      'float n=fbm(p+warp*1.35);',
      'n=smoothstep(.1,.75,n);',
      'vec3 cyan=vec3(.39,.86,.92); vec3 red=vec3(.94,.33,.33); vec3 ink=vec3(.02,.02,.03);',
      'vec3 col=mix(cyan,red,smoothstep(.22,.78,fbm(p*1.15+2.7)));',
      'col=mix(ink,col,n);',
      'col+=(hash(gl_FragCoord.xy+floor(u_time*8.))-.5)*.08;',
      'gl_FragColor=vec4(col,1.);}'
    ].join('');
    function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
    const prog=gl.createProgram();
    gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));
    gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(prog,'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    const uRes=gl.getUniformLocation(prog,'u_res'), uMouse=gl.getUniformLocation(prog,'u_mouse'), uTime=gl.getUniformLocation(prog,'u_time');
    function resize(){
      const r=section.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,1.5);
      canvas.width=Math.max(2,Math.round(r.width*dpr)); canvas.height=Math.max(2,Math.round(r.height*dpr));
      gl.viewport(0,0,canvas.width,canvas.height);
    }
    function draw(now){
      raf=requestAnimationFrame(draw);
      pointer.x+=(pointer.tx-pointer.x)*.05; pointer.y+=(pointer.ty-pointer.y)*.05;
      gl.uniform2f(uRes,canvas.width,canvas.height);
      gl.uniform2f(uMouse,pointer.x,pointer.y);
      gl.uniform1f(uTime, reduced.matches?0:(now-start)*.001);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }
    section.addEventListener('pointermove',e=>{
      const r=section.getBoundingClientRect();
      pointer.tx=((e.clientX-r.left)/Math.max(1,r.width)-.5)*2;
      pointer.ty=(.5-(e.clientY-r.top)/Math.max(1,r.height))*2;
    },{passive:true});
    new ResizeObserver(resize).observe(section);
    resize();
    if(reduced.matches){draw(start);cancelAnimationFrame(raf);}
    else requestAnimationFrame(draw);
  })();

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
