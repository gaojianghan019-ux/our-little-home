'use strict';
let candlesOn=true,wishMade=storage.get('wish',false);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const nightFireworks=new NightFireworks(reduced);
homeObjects.push({id:'exit',name:'去室外看看',sub:'看看窗外的四季',ic:'exit',x:640,y:910,target:[640,875],hit:[520,835,240,125]});
function renderBedroom(t){
 nightFireworks.sync(scene,phase,season,t);
 if(scene==='beach'){renderOutdoor(t);return}
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(assets.bedroom,0,0,W,H);
 drawDestination(t);
 if(!candlesOn){const im=assets.bedroom;for(const x of [640,681]){ctx.drawImage(im,610/W*im.width,339/H*im.height,22/W*im.width,41/H*im.height,x,339,22,41)}}
 if(candlesOn){ctx.save();ctx.globalCompositeOperation='screen';
 for(const [x,y] of [[650,360],[691,360]]){const r=reduced?19:19+Math.sin(t/230+x)*2;const glow=ctx.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,'rgba(255,225,153,.65)');glow.addColorStop(1,'rgba(255,206,120,0)');ctx.fillStyle=glow;ctx.fillRect(x-r,y-r,r*2,r*2)}
 ctx.restore()}
 // Draw complete character sprites above the painted scene; no rectangular repaint.
 const actors=[{y:npc.y,draw:()=>drawNpc(t)},{y:pose?pose.y:player.y,draw:()=>drawPlayer(t)}];
 actors.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
}
function renderOutdoor(t){
 const seasonName=['spring','summer','autumn','winter'][season||0],phaseName=phase==='night'?'night':'day',im=assets[seasonName+'-'+phaseName];
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 // Use the full seasonal image in its fixed, centered 16:9 scene bounds.
 if(im)ctx.drawImage(im,0,120,W,720);
 nightFireworks.draw(ctx,t);
 drawDestination(t);
 drawParticles(t);
 const actors=[{y:npc.y,draw:()=>drawNpc(t)},{y:pose?pose.y:player.y,draw:()=>drawPlayer(t)}];actors.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
}
updateClock=function(){if(scene==='beach'){const t=clockState();currentTime=t;season=t.season;phase=t.phase;return t}phase='night';season=0;$('#season-label').textContent='生日夜';$('#phase-label').textContent='暖灯';$('#clock-label').textContent='19';$('#day-label').textContent='十九岁 · 一切慢慢来';$('#season-progress').style.width='100%'};
const originalPerform=perform;
perform=function(id){
 if(id==='cake'){
 showModal('<div class="modal-body birthday-modal"><div class="modal-eyebrow">A LITTLE WISH · 十九岁的心愿</div><div class="birthday-number">19</div><h2>嘟嘟，生日快乐。</h2><p class="gift-subtitle">闭上眼睛，认真许一个愿望。<br>愿你被爱着，也自在地成为自己。</p><div class="modal-footer"><button class="primary-btn" id="wish-button">'+(wishMade?'再许一个小小的愿望':'许好了，吹蜡烛')+'</button></div></div>');
 $('#wish-button').onclick=()=>{candlesOn=false;wishMade=true;storage.set('wish',true);discover('wish');modal.close();confetti();say('十九岁快乐，嘟嘟。愿你的小愿望，一个一个有回音。',{x:640,y:420});setTimeout(()=>{candlesOn=true},6500)};return}
 if(id==='exit'){switchScene(scene==='home'?'beach':'home');return}
 if(id==='sleep'){rest('sleep',280,290);say('今晚安心睡吧，生日的灯会为你亮着。',{x:338,y:200});return}
 if(id==='sit'){rest('sit',305,780);say('坐一会儿吧，今天也辛苦啦。',{x:320,y:650});return}
 originalPerform(id)
};
$('#travel').onclick=()=>requestAction('cake');
$('#help').onclick=()=>showModal('<div class="modal-body"><div class="modal-eyebrow">YOUR LITTLE BIRTHDAY ROOM</div><h2>在小屋里慢慢走。</h2><p class="help-text">点击木地板，小人会走过去；电脑也能用方向键或 WASD 移动。点击蛋糕、信件、礼物或小床，小人会走近后互动。也可以使用下方卡片。</p><p class="help-text">走到蛋糕旁许个愿，拆一份礼物，再读读写给你的那封信。按 E 与最近的物件互动，按 Esc 起身。</p><p class="gift-subtitle">这里的夜晚很安静，灯一直暖着。</p></div>');
$('#memories').onclick=()=>showModal('<div class="modal-body"><div class="modal-eyebrow">LITTLE MEMORIES</div><h2>我们的小小收藏</h2>'+[['letter','一封生日信'],['gift','新一岁好运通行证'],['wish','十九岁的生日愿望']].map(([id,title])=>'<div class="collection-item"><span>'+title+'</span><span>'+(found.has(id)?'已收藏 ♡':'待发现')+'</span></div>').join('')+'<p class="help-text">收藏保存在这台设备的浏览器里。</p></div>');
discover=function(k){if(k)found.add(k);storage.set('found',[...found]);$('#collection-count').textContent='已经收藏 '+['letter','gift','wish'].filter(k=>found.has(k)).length+' / 3 份心意'};
$('#zoom').hidden=false;
const originalSwitchScene=switchScene;
switchScene=async function(next){
 if(!ready||switching||next===scene)return;
 await originalSwitchScene(next);
 zoomed=false;destination=null;
 stage.classList.toggle('outdoor',scene==='beach');
 if(scene==='beach'){Object.assign(player,{x:640,y:700,dir:'front'});Object.assign(npc,{x:900,y:650})}
 updateClock();resize();renderActions();
};
setInterval(()=>{if(scene==='beach'){const t=clockState();currentTime=t;season=t.season;phase=t.phase}},1000);
init=async function(){
 try{
 await Promise.all([loadImage('bedroom','bedroom-open.png'),loadImage('girlWalk','girlWalk.png'),loadImage('girlActions','girlActions.png'),loadImage('boy','boy.png'),...['spring','summer','autumn','winter'].flatMap(s=>['day','night'].map(p=>loadImage(s+'-'+p,s+'-'+p+'.webp')))]);
 makeSprites();rebuildGrid();updateClock();renderActions();ready=true;resize();$('#loading').hidden=true;discover();
 setTimeout(()=>say('嘟嘟，生日快乐。小屋的灯亮着，蛋糕也准备好了。',{x:npc.x,y:npc.y-130}),900);
 }catch(error){$('#loading').innerHTML='<strong>小屋素材加载失败</strong><button class="primary-btn" onclick="location.reload()">重新打开</button>';console.error(error)}
};
updateClock();requestAnimationFrame(tick);init();
