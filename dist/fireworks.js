'use strict';
// Finite, time-based sky effects: no particle timers or accumulated background work.
class NightFireworks {
 constructor(reducedMotion=false){this.reducedMotion=reducedMotion;this.key=null;this.started=0;this.shots=[]}
 sync(scene,phase,season,now){
  const key=scene==='beach'&&phase==='night'?String(season):null;
  if(key===this.key)return;
  this.key=key;this.shots=[];
  if(key===null)return;
  this.started=now;
  const palettes=[['#ffc2d7','#ffe4a3','#fff4dc'],['#a9f2df','#ffd98e','#ffe9c4'],['#ffc584','#ffe5a2','#ffbba3'],['#d5ccff','#bfe7ff','#ffe6b4']];
  this.shots=Array.from({length:this.reducedMotion?3:9},(_,i)=>({
   delay:i*(this.reducedMotion?2.2:1.15),x:[660,880,760,1030,610,930,710,1000,800][i],
   y:[260,240,220,280,245,270,235,255,215][i],color:palettes[season][i%3],seed:i*.73
  }));
 }
 draw(ctx,now){
  if(this.key===null||!this.shots.length)return;
  const elapsed=(now-this.started)/1000;
  if(elapsed>14){this.shots=[];return}
  ctx.save();ctx.beginPath();ctx.rect(0,120,1280,330);ctx.clip();
  ctx.globalCompositeOperation='screen';ctx.lineCap='round';
  for(const shot of this.shots){
   const age=elapsed-shot.delay;
   if(age<0||age>3.8)continue;
   ctx.strokeStyle=shot.color;ctx.fillStyle=shot.color;
   if(this.reducedMotion){
    // A quiet, stationary bloom instead of moving rockets or flashing light.
    ctx.globalAlpha=Math.sin(Math.min(1,age/3.8)*Math.PI)*.5;
    for(let j=0;j<16;j++){const a=j*Math.PI/8;ctx.beginPath();ctx.arc(shot.x+Math.cos(a)*38,shot.y+Math.sin(a)*38,2,0,Math.PI*2);ctx.fill()}
    continue;
   }
   if(age<.8){
    const p=age/.8,y=420+(shot.y-420)*p;
    ctx.globalAlpha=.8;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(shot.x,y+22);ctx.lineTo(shot.x,y);ctx.stroke();
    ctx.beginPath();ctx.arc(shot.x,y,2.5,0,Math.PI*2);ctx.fill();continue;
   }
   const t=age-.8,fade=Math.pow(Math.max(0,1-t/3),1.1),r=83*(1-Math.exp(-1.6*t));
   ctx.globalAlpha=fade*.88;ctx.lineWidth=2;
   for(let j=0;j<56;j++){
    const a=j*Math.PI*2/56+shot.seed,speed=.6+(j%5)*.1,fall=t*t*8;
    const x=shot.x+Math.cos(a)*r*speed,y=shot.y+Math.sin(a)*r*speed+fall;
    const tail=Math.max(0,r-7);
    ctx.beginPath();ctx.moveTo(shot.x+Math.cos(a)*tail*speed,shot.y+Math.sin(a)*tail*speed+fall-2);ctx.lineTo(x,y);ctx.stroke();
    ctx.beginPath();ctx.arc(x,y,j%4===0?1.9:1.2,0,Math.PI*2);ctx.fill();
   }
  }
  ctx.restore();
 }
}
