/* HELLXBONE — prototype Phaser 3 isolé, zéro écriture Supabase. */
(function(){
'use strict';
function start(){
if(!window.Phaser){document.getElementById('game').textContent='Phaser 3 indisponible : vérifie la connexion réseau.';return;}
class HellScene extends Phaser.Scene {
constructor(){super('HellScene');this.points=0;this.life=true;}
create(){
const {width:w,height:h}=this.scale;
this.cameras.main.setBackgroundColor('#061009');
this.add.graphics().fillGradientStyle(0x122719,0x122719,0x030703,0x030703,1).fillRect(0,0,w,h);
this.stars=this.add.group();
for(let i=0;i<60;i++){let dot=this.add.circle(Phaser.Math.Between(0,w),Phaser.Math.Between(0,h),Phaser.Math.Between(1,3),0x59ff80,Math.random()*.55+.12);this.stars.add(dot);this.tweens.add({targets:dot,alpha:0.05,duration:Phaser.Math.Between(800,2500),yoyo:true,repeat:-1});}
this.heading=this.add.text(w/2,62,'HELLXBONE',{fontFamily:'Arial Black, sans-serif',fontSize:'34px',fontStyle:'bold',color:'#8cff9d',stroke:'#050505',strokeThickness:6}).setOrigin(.5);
this.add.text(w/2,110,'PHASER 3  •  TEST DES EFFETS',{fontFamily:'Arial,sans-serif',fontSize:'17px',color:'#ffffff'}).setOrigin(.5);
this.scoreText=this.add.text(w/2,164,'EXPLOSIONS : 0',{fontFamily:'Arial,sans-serif',fontSize:'24px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);
this.add.text(w/2,h-64,'TOUCHE LES CRÂNES',{fontFamily:'Arial,sans-serif',fontSize:'20px',color:'#a4ffae'}).setOrigin(.5);
this.skulls=[];
for(let i=0;i<6;i++){const x=85+(i%3)*((w-170)/2),y=h*.35+Math.floor(i/3)*125;this.spawnSkull(x,y,i);}
this.scale.on('resize',()=>{ /* Fixed logical resolution scales with FIT */ });
}
spawnSkull(x,y,i){
const c=this.add.container(x,y);const glow=this.add.circle(0,0,43,0x36ff63,.13);const ring=this.add.circle(0,0,39,0x0d2412,1).setStrokeStyle(3,0x73ff83,1);
const skull=this.add.text(0,0,'☠',{fontFamily:'Arial,sans-serif',fontSize:'63px',color:'#d7ffdd',stroke:'#227c38',strokeThickness:2}).setOrigin(.5);
c.add([glow,ring,skull]);c.setSize(82,82).setInteractive({useHandCursor:true});
this.tweens.add({targets:c,scale:1.1,duration:650+i*75,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
c.on('pointerdown',()=>{this.points++;this.scoreText.setText('EXPLOSIONS : '+this.points);this.burst(c.x,c.y);this.cameras.main.shake(90,.003);this.tweens.add({targets:c,alpha:0,scale:1.7,duration:160,onComplete:()=>{c.destroy();this.spawnSkull(Phaser.Math.Between(60,this.scale.width-60),Phaser.Math.Between(235,this.scale.height-140),i);}});});
this.skulls.push(c);
}
burst(x,y){
for(let i=0;i<28;i++){const angle=Math.PI*2*i/28,speed=Phaser.Math.Between(45,150),p=this.add.circle(x,y,Phaser.Math.Between(2,6),[0x79ff93,0xefff91,0xf8ffe9][i%3],1);
this.tweens.add({targets:p,x:x+Math.cos(angle)*speed,y:y+Math.sin(angle)*speed,alpha:0,scale:0,duration:Phaser.Math.Between(250,580),ease:'Cubic.easeOut',onComplete:()=>p.destroy()});}
this.tweens.add({targets:this.heading,scale:1.05,duration:90,yoyo:true});
}
}
const config={type:Phaser.AUTO,parent:'game',backgroundColor:'#061009',width:450,height:700,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true,pixelArt:false},scene:[HellScene],audio:{disableWebAudio:true}};
new Phaser.Game(config);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();