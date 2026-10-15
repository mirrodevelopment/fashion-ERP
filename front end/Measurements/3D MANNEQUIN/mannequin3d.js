/**
 * HAULO BOUTIQUE ERP - 3D MANNEQUIN VISUALISER
 * mannequin3d.js  |  Three.js r165
 * Parametric procedural female mannequin + garment overlay
 * Real-time morph from measurement inputs, fit score, size rec, history
 */
(function(){"use strict";

/* === 0. CONSTANTS === */
const SKIN=0xd4a882;
const GARMENT_COLORS={Blouse:0x6b3fa0,Saree:0xc0392b,Kurti:0x2980b9,Lehenga:0xe74c3c,Churidar:0x27ae60,Gown:0x8e44ad};
const SIZE_CHART=[
  {label:"XS",letter:"XS",bustMin:28,bustMax:32,waistMin:22,waistMax:26},
  {label:"Small",letter:"S",bustMin:32,bustMax:35,waistMin:26,waistMax:29},
  {label:"Medium",letter:"M",bustMin:35,bustMax:38,waistMin:29,waistMax:32},
  {label:"Large",letter:"L",bustMin:38,bustMax:42,waistMin:32,waistMax:36},
  {label:"XL",letter:"XL",bustMin:42,bustMax:46,waistMin:36,waistMax:40},
  {label:"XXL",letter:"XXL",bustMin:46,bustMax:52,waistMin:40,waistMax:46},
];

/* === 1. STATE === */
const State={
  activeGarment:"Blouse",activeView:"front",
  customers:[],selectedCustomer:null,
  measurements:{shoulder:15,neck:14,bust:36,underBust:30,waist:30,hip:38,thigh:22,blouseLength:15,height:63,upperArm:12,sleeveLength:23},
  showLabels:true,showGarment:true,wireframe:false,autoRotate:false,
  history:[],fitScore:85,
};

/* === 2. THREE VARS === */
let renderer,scene,camera,controls,bodyGroup,garmentGroup,labelPoints=[];

function inchToWorld(i){return i*(3.2/64);}
function lerp(a,b,t){return a+(b-a)*t;}
function easeInOut(t){return t<0.5?2*t*t:-1+(4-2*t)*t;}

/* === 3. SCENE INIT === */
function initThree(){
  const wrap=document.getElementById("mannequin-canvas-wrapper");
  if(!wrap)return;
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(wrap.clientWidth,wrap.clientHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  // r134 uses outputEncoding; r152+ uses outputColorSpace - handle both
  if(renderer.outputColorSpace!==undefined){renderer.outputColorSpace=THREE.SRGBColorSpace||'srgb';}
  else if(renderer.outputEncoding!==undefined){renderer.outputEncoding=THREE.sRGBEncoding||3001;}
  wrap.appendChild(renderer.domElement);
  scene=new THREE.Scene();
  scene.fog=new THREE.FogExp2(0x0d0a06,0.045);
  const aspect=wrap.clientWidth/wrap.clientHeight;
  camera=new THREE.PerspectiveCamera(45,aspect,0.01,100);
  camera.position.set(0,0.6,3.8);
  scene.add(new THREE.AmbientLight(0xfff5e0,0.65));
  const kl=new THREE.DirectionalLight(0xfff8e0,1.5);kl.position.set(2,4,3);kl.castShadow=true;scene.add(kl);
  const fl=new THREE.DirectionalLight(0xc8f0ff,0.45);fl.position.set(-2,2,-1);scene.add(fl);
  const rl=new THREE.DirectionalLight(0xa8c14a,0.4);rl.position.set(0,3,-3);scene.add(rl);
  const grid=new THREE.GridHelper(4,20,0x333320,0x222215);grid.position.y=-1.62;scene.add(grid);
  if(THREE.OrbitControls){
    controls=new THREE.OrbitControls(camera,renderer.domElement);
    controls.enableDamping=true;controls.dampingFactor=0.08;
    controls.minDistance=1.2;controls.maxDistance=6;
    controls.target.set(0,0.3,0);controls.maxPolarAngle=Math.PI*0.88;
  }
  bodyGroup=new THREE.Group();garmentGroup=new THREE.Group();
  scene.add(bodyGroup);scene.add(garmentGroup);
  new ResizeObserver(()=>{
    const w=wrap.clientWidth,h=wrap.clientHeight;
    camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);
  }).observe(wrap);
  buildMannequin(State.measurements);
  animate();
  setTimeout(()=>{const l=document.getElementById("viewerLoader");if(l)l.classList.add("hidden");},900);
}

/* === 4. ANIMATE === */
function animate(){
  requestAnimationFrame(animate);
  if(controls){controls.autoRotate=State.autoRotate;controls.update();}
  renderer.render(scene,camera);
  updateOverlayLabels();
}

/* === 5. MANNEQUIN BUILD === */
function buildMannequin(m){
  bodyGroup.clear();garmentGroup.clear();labelPoints=[];
  const h=m.height||63,bust=m.bust||36,waist=m.waist||30,hip=m.hip||38;
  const shoulder=m.shoulder||15,neck=m.neck||14,underBust=m.underBust||30;
  const thigh=m.thigh||22,upperArm=m.upperArm||12;
  const blouseLen=m.blouseLength||15,sleeveLen=m.sleeveLength||23;
  const rBust=inchToWorld(bust/(2*Math.PI));
  const rWaist=inchToWorld(waist/(2*Math.PI));
  const rHip=inchToWorld(hip/(2*Math.PI));
  const rUnderB=inchToWorld(underBust/(2*Math.PI));
  const rNeck=inchToWorld(neck/(2*Math.PI));
  const rThigh=inchToWorld(thigh/(2*Math.PI));
  const rUpperArm=inchToWorld(upperArm/(2*Math.PI));
  const rShoulder=inchToWorld(shoulder/(2*Math.PI))*0.9;
  const totalH=inchToWorld(h);
  const headH=totalH*0.13,neckH=totalH*0.035,torsoH=totalH*0.32;
  const pelvisH=totalH*0.10,legH=totalH*0.45;
  const legBotY=-totalH/2,pelvisY=legBotY+legH;
  const torsoBot=pelvisY+pelvisH,torsoTop=torsoBot+torsoH;
  const neckBot=torsoTop,headBot=neckBot+neckH;
  const mat=new THREE.MeshStandardMaterial({color:0xd4a882,roughness:0.55,metalness:0.04});
  /* head */
  const hm=new THREE.Mesh(new THREE.SphereGeometry(headH*0.52,32,24),mat);
  hm.position.y=headBot+headH*0.5;hm.castShadow=true;bodyGroup.add(hm);
  /* neck */
  addCyl(bodyGroup,mat,rNeck*0.72,rNeck*0.68,neckH,0,neckBot+neckH/2,0);
  /* torso */
  const tPts=makeTorsoPts(rWaist,rBust,rUnderB,rShoulder,torsoH);
  const tm=new THREE.Mesh(new THREE.LatheGeometry(tPts,48),mat);
  tm.position.y=torsoBot;tm.castShadow=true;bodyGroup.add(tm);
  /* pelvis */
  const pPts=makePelvisPts(rHip,rWaist,pelvisH);
  const pm=new THREE.Mesh(new THREE.LatheGeometry(pPts,40),mat);
  pm.position.y=pelvisY;pm.castShadow=true;bodyGroup.add(pm);
  /* legs */
  const legSep=rHip*0.55;
  [-legSep,legSep].forEach(x=>{
    const lg=new THREE.Mesh(new THREE.LatheGeometry(makeLegPts(rThigh,legH),32),mat);
    lg.position.set(x,legBotY,0);lg.castShadow=true;bodyGroup.add(lg);
  });
  /* arms */
  const armX=rShoulder*2.8,armTopY=torsoTop-torsoH*0.04;
  [-armX,armX].forEach((x,i)=>{
    const ag=new THREE.Mesh(new THREE.LatheGeometry(makeArmPts(rUpperArm,inchToWorld(sleeveLen)),24),mat);
    const piv=new THREE.Group();piv.add(ag);
    piv.rotation.z=i===0?Math.PI*0.12:-Math.PI*0.12;
    piv.position.set(x,armTopY-inchToWorld(sleeveLen)/2,0);bodyGroup.add(piv);
  });
  /* feet */
  const fMat=new THREE.MeshStandardMaterial({color:0xb07050,roughness:0.7});
  const fGeo=new THREE.SphereGeometry(1,16,8);fGeo.scale(rThigh*0.55,rThigh*0.22,rThigh*0.9);
  [-legSep,legSep].forEach(x=>{
    const f=new THREE.Mesh(fGeo,fMat);f.position.set(x,legBotY+0.02,rThigh*0.4);bodyGroup.add(f);
  });
  /* label anchors */
  const bustY=torsoBot+torsoH*0.72,waistY=torsoBot+torsoH*0.38;
  const hipY=pelvisY+pelvisH*0.55,shoulderY=torsoTop-torsoH*0.06;
  labelPoints=[
    {key:"bust",label:"Bust "+bust+chr34,pos:new THREE.Vector3(rBust+0.13,bustY,0)},
    {key:"waist",label:"Waist "+waist+chr34,pos:new THREE.Vector3(rWaist+0.13,waistY,0)},
    {key:"hip",label:"Hip "+hip+chr34,pos:new THREE.Vector3(rHip+0.13,hipY,0)},
    {key:"shoulder",label:"Shoulder "+shoulder+chr34,pos:new THREE.Vector3(armX+0.06,shoulderY,0)},
    {key:"neck",label:"Neck "+neck+chr34,pos:new THREE.Vector3(rNeck+0.13,neckBot+neckH,0)},
    {key:"height",label:"H "+h+chr34,pos:new THREE.Vector3(-rHip-0.22,0,0)},
  ];
  if(State.showGarment)buildGarment(m,{torsoBot,torsoTop,pelvisY,pelvisH,torsoH,rBust,rWaist,rHip,rShoulder,blouseLen});
}
const chr34=String.fromCharCode(34);
function addCyl(parent,mat,rTop,rBot,h,x,y,z){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(rTop,rBot,h,24),mat);
  m.position.set(x,y,z);m.castShadow=true;parent.add(m);
}
function makeTorsoPts(rWaist,rBust,rUnderB,rShoulder,h){
  const pts=[];
  for(let i=0;i<=20;i++){
    const t=i/20;let r;
    if(t<0.25)r=lerp(rUnderB,rWaist,easeInOut(t/0.25));
    else if(t<0.55)r=lerp(rWaist,rBust,easeInOut((t-0.25)/0.30));
    else if(t<0.75)r=lerp(rBust,rBust*0.88,easeInOut((t-0.55)/0.20));
    else r=lerp(rBust*0.88,rShoulder,easeInOut((t-0.75)/0.25));
    pts.push(new THREE.Vector2(r,t*h));
  }return pts;
}
function makePelvisPts(rHip,rWaist,h){
  const pts=[];
  for(let i=0;i<=14;i++){const t=i/14;pts.push(new THREE.Vector2(lerp(rHip,rWaist,easeInOut(t)),t*h));}
  return pts;
}
function makeLegPts(rThigh,h){
  const pts=[];
  for(let i=0;i<=18;i++){const t=i/18;let r=t<0.5?lerp(rThigh*0.55,rThigh*0.68,easeInOut(t/0.5)):lerp(rThigh*0.68,rThigh*0.4,easeInOut((t-0.5)/0.5));pts.push(new THREE.Vector2(r,t*h));}
  return pts;
}
function makeArmPts(rUpper,h){
  const pts=[];
  for(let i=0;i<=14;i++){const t=i/14;let r=t<0.5?lerp(rUpper,rUpper*0.72,easeInOut(t/0.5)):lerp(rUpper*0.72,rUpper*0.52,easeInOut((t-0.5)/0.5));pts.push(new THREE.Vector2(r,t*h));}
  return pts;
}

/* === 6. GARMENT OVERLAY === */
function buildGarment(m,layout){
  const {torsoBot,torsoTop,pelvisY,pelvisH,torsoH,rBust,rWaist,rHip,rShoulder,blouseLen}=layout;
  const gc={Blouse:0x6b3fa0,Saree:0xc0392b,Kurti:0x2980b9,Lehenga:0xe74c3c,Churidar:0x27ae60,Gown:0x8e44ad};
  const color=gc[State.activeGarment]||0x6b3fa0;
  const garMat=new THREE.MeshStandardMaterial({color,roughness:0.65,metalness:0.06,transparent:true,opacity:0.82,side:THREE.DoubleSide});
  const e=0.042;
  const bH=Math.min(inchToWorld(blouseLen),torsoH);
  const rUB=inchToWorld((m.underBust||30)/(2*Math.PI));
  const bPts=makeTorsoPts(rWaist+e,rBust+e,rUB+e,rShoulder+e*0.5,bH);
  const bod=new THREE.Mesh(new THREE.LatheGeometry(bPts,48),garMat);
  bod.position.y=torsoBot;garmentGroup.add(bod);
  if(["Lehenga","Gown","Kurti","Churidar"].includes(State.activeGarment)){
    const skH=inchToWorld(m.hip||38)*0.95;
    const skPts=[];
    for(let i=0;i<=16;i++){const t=i/16;skPts.push(new THREE.Vector2(lerp(rWaist+e,rHip*1.12+e,easeInOut(t)),(1-t)*skH));}
    const sk=new THREE.Mesh(new THREE.LatheGeometry(skPts,48),garMat);
    sk.position.y=torsoBot-skH+bH*0.1;garmentGroup.add(sk);
  }
}

/* === 7. SVG LABEL OVERLAY === */
function updateOverlayLabels(){
  if(!State.showLabels||!labelPoints.length||!renderer)return;
  const svg=document.getElementById("measOverlaySvg");if(!svg)return;
  svg.innerHTML="";
  const NS="http://www.w3.org/2000/svg";
  labelPoints.forEach(function(lp){
    const pos=lp.pos;const label=lp.label;
    const v=pos.clone().project(camera);
    if(v.z>1)return;
    const cw=renderer.domElement.clientWidth,ch=renderer.domElement.clientHeight;
    const sx=(v.x*0.5+0.5)*cw,sy=(-v.y*0.5+0.5)*ch;
    const dir=pos.x>=0?1:-1;
    const lx2=sx+dir*28;
    const ln=document.createElementNS(NS,"line");
    ln.setAttribute("x1",sx);ln.setAttribute("y1",sy);ln.setAttribute("x2",lx2);ln.setAttribute("y2",sy);
    ln.setAttribute("stroke","rgba(168,193,74,0.55)");ln.setAttribute("stroke-width","1");svg.appendChild(ln);
    const dot=document.createElementNS(NS,"circle");
    dot.setAttribute("cx",sx);dot.setAttribute("cy",sy);dot.setAttribute("r","3");dot.setAttribute("fill","#a8c14a");svg.appendChild(dot);
    const pw=label.length*5.8+14,px=pos.x>=0?lx2:lx2-pw;
    const rect=document.createElementNS(NS,"rect");
    rect.setAttribute("x",px);rect.setAttribute("y",sy-9);rect.setAttribute("width",pw);rect.setAttribute("height",18);rect.setAttribute("rx","9");
    rect.setAttribute("fill","rgba(10,7,3,0.82)");rect.setAttribute("stroke","rgba(168,193,74,0.5)");rect.setAttribute("stroke-width","1");svg.appendChild(rect);
    const txt=document.createElementNS(NS,"text");
    txt.setAttribute("x",px+pw/2);txt.setAttribute("y",sy+4);txt.setAttribute("text-anchor","middle");
    txt.setAttribute("fill","#a8c14a");txt.setAttribute("font-size","9.5");txt.setAttribute("font-weight","700");
    txt.setAttribute("font-family","Inter,system-ui,sans-serif");txt.textContent=label;svg.appendChild(txt);
  });
}

/* === 8. MEASUREMENT INPUT ROWS === */
const MEAS_DEFS=[
  {key:"height",name:"Height",unit:'"',min:48,max:80},
  {key:"shoulder",name:"Shoulder",unit:'"',min:10,max:22},
  {key:"bust",name:"Bust",unit:'"',min:24,max:56},
  {key:"underBust",name:"Under Bust",unit:'"',min:20,max:48},
  {key:"waist",name:"Waist",unit:'"',min:18,max:52},
  {key:"hip",name:"Hip",unit:'"',min:24,max:60},
  {key:"thigh",name:"Thigh",unit:'"',min:14,max:36},
  {key:"blouseLength",name:"Blouse Length",unit:'"',min:10,max:30},
  {key:"upperArm",name:"Upper Arm",unit:'"',min:8,max:22},
  {key:"sleeveLength",name:"Sleeve Length",unit:'"',min:10,max:36},
  {key:"neck",name:"Neck",unit:'"',min:10,max:20},
];

function buildMeasurementInputs(){
  const list=document.getElementById("measInputList");if(!list)return;
  list.innerHTML="";
  MEAS_DEFS.forEach(function(def){
    const row=document.createElement("div");row.className="meas-row";
    const dot=document.createElement("div");dot.className="meas-dot";
    const name=document.createElement("span");name.className="meas-name";name.textContent=def.name;
    const wrap=document.createElement("div");wrap.className="meas-input-wrap";
    const inp=document.createElement("input");
    inp.type="number";inp.className="meas-val";inp.id="meas_"+def.key;
    inp.min=def.min;inp.max=def.max;inp.step="0.5";
    inp.value=State.measurements[def.key]||"";inp.placeholder="--";
    const unit=document.createElement("span");unit.className="meas-unit";unit.textContent=def.unit;
    wrap.appendChild(inp);wrap.appendChild(unit);
    row.appendChild(dot);row.appendChild(name);row.appendChild(wrap);
    list.appendChild(row);
    inp.addEventListener("input",function(){
      const val=parseFloat(inp.value);
      if(!isNaN(val)&&val>=def.min&&val<=def.max){
        State.measurements[def.key]=val;debouncedRebuild();
      }
    });
  });
}

let _rebTimer=null;
function debouncedRebuild(){
  clearTimeout(_rebTimer);
  _rebTimer=setTimeout(function(){
    buildMannequin(State.measurements);
    updateFitScore();updateSizeRec();updateAlterations();updateStatList();
  },140);
}

/* === 9. FIT SCORE & SIZE === */
function calcFitScore(m){
  const bust=m.bust||36,waist=m.waist||30,hip=m.hip||38;
  let score=100;
  score-=Math.min(20,Math.abs(waist-bust*0.73)*2.5);
  score-=Math.min(20,Math.abs(hip-bust*1.08)*1.8);
  const filled=MEAS_DEFS.filter(function(d){return m[d.key]!=null&&m[d.key]>0;}).length;
  score=score*(filled/MEAS_DEFS.length);
  return Math.max(10,Math.min(100,Math.round(score)));
}

function recSize(m){
  const bust=m.bust||0;
  for(let i=0;i<SIZE_CHART.length;i++){const s=SIZE_CHART[i];if(bust>=s.bustMin&&bust<s.bustMax)return s;}
  return SIZE_CHART[2];
}

function updateFitScore(){
  State.fitScore=calcFitScore(State.measurements);
  const el=document.getElementById("fitScoreValue");
  if(el)el.textContent=State.fitScore;
  updateGauge(State.fitScore);
}

function updateGauge(score){
  const arc=document.getElementById("gaugeArc");
  const needle=document.getElementById("gaugeNeedle");
  if(!arc||!needle)return;
  const pct=score/100;
  arc.setAttribute("stroke-dashoffset",(157*(1-pct)).toFixed(1));
  const angle=Math.PI*(1-pct);
  arc.setAttribute("stroke",score>=80?"#a8c14a":score>=55?"#c1a04a":"#c14a4a");
  needle.setAttribute("cx",(60+50*Math.cos(Math.PI-angle)).toFixed(1));
  needle.setAttribute("cy",(55-50*Math.sin(Math.PI-angle)).toFixed(1));
  needle.setAttribute("fill",score>=80?"#a8c14a":score>=55?"#c1a04a":"#c14a4a");
  const sc=document.getElementById("fitScoreValue");
  if(sc)sc.style.color=score>=80?"#a8c14a":score>=55?"#c1a04a":"#c14a4a";
}

function updateSizeRec(){
  const rec=recSize(State.measurements);
  const setTxt=function(id,v){const e=document.getElementById(id);if(e)e.textContent=v;};
  setTxt("recSizeLetter",rec.letter);
  setTxt("recSizeLabel",rec.label);
  setTxt("recSizeRange","Bust "+rec.bustMin+"-"+rec.bustMax+'" * Waist '+rec.waistMin+"-"+rec.waistMax+'"');
  setTxt("sizeLabel",rec.letter);
  setTxt("sizeDetail","Recommended - "+rec.label);
}

function updateStatList(){
  const list=document.getElementById("statList");if(!list)return;list.innerHTML="";
  ["height","bust","waist","hip","shoulder","neck","thigh"].forEach(function(k){
    const def=MEAS_DEFS.find(function(d){return d.key===k;});if(!def)return;
    const val=State.measurements[k];
    const row=document.createElement("div");row.className="stat-row";
    const nm=document.createElement("span");nm.className="stat-name";nm.textContent=def.name;
    const vl=document.createElement("span");vl.className="stat-val";vl.textContent=val?val+'"':"--";
    row.appendChild(nm);row.appendChild(vl);list.appendChild(row);
  });
}

function updateAlterations(){
  const list=document.getElementById("alterationList");if(!list)return;list.innerHTML="";
  const m=State.measurements;const notes=[];
  if(m.bust&&m.waist){
    const r=m.waist/m.bust;
    if(r>0.82)notes.push({t:"warn",msg:"Wide waist vs bust - princess cut recommended."});
    else if(r<0.72)notes.push({t:"ok",msg:"Excellent waist-bust ratio - hourglass silhouette."});
  }
  if(m.hip&&m.waist){
    if(m.hip-m.waist<6)notes.push({t:"tip",msg:"Small hip-waist diff - A-line skirts will flatter."});
    else if(m.hip-m.waist>14)notes.push({t:"ok",msg:"Great hip curve - peplum or fitted bodice works well."});
  }
  if(m.shoulder&&m.bust&&m.shoulder>m.bust*0.44)notes.push({t:"warn",msg:"Wide shoulder - boat neck or off-shoulder recommended."});
  if(m.sleeveLength&&m.sleeveLength<14)notes.push({t:"tip",msg:"Short sleeve - consider 3/4 sleeve option."});
  if(!notes.length)notes.push({t:"tip",msg:"All proportions look balanced - standard cut recommended."});
  notes.forEach(function(n){
    const div=document.createElement("div");div.className="alert-item";
    const ico=document.createElement("div");ico.className="alert-icon "+n.t;
    ico.textContent=n.t==="ok"?"v":n.t==="warn"?"!":"*";
    const sp=document.createElement("span");sp.textContent=n.msg;
    div.appendChild(ico);div.appendChild(sp);list.appendChild(div);
  });
}

/* === 10. HISTORY (localStorage, last 3) === */
const HIST_KEY="mq3d_history";
function loadHistory(){
  try{State.history=JSON.parse(localStorage.getItem(HIST_KEY)||"[]");}catch(e){State.history=[];}
  renderHistory();
}
function saveHistory(){
  const entry={ts:new Date().toISOString(),garment:State.activeGarment,m:Object.assign({},State.measurements)};
  State.history.unshift(entry);
  if(State.history.length>3)State.history.pop();
  try{localStorage.setItem(HIST_KEY,JSON.stringify(State.history));}catch(e){}
  renderHistory();
}
function renderHistory(){
  const list=document.getElementById("historyList");if(!list)return;list.innerHTML="";
  if(!State.history.length){list.innerHTML='<div style="font-size:0.7rem;color:var(--c-text-sec,#b8a98a);opacity:0.6">No history yet</div>';return;}
  State.history.forEach(function(entry,idx){
    const div=document.createElement("div");div.className="history-entry fade-in"+(idx===0?" active":"");
    const d=new Date(entry.ts);
    const ds=d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})+" "+d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
    const dateEl=document.createElement("div");dateEl.className="history-date";dateEl.textContent=ds;
    const vals=document.createElement("div");vals.className="history-vals";
    ["bust","waist","hip"].forEach(function(k){
      if(entry.m[k]){const c=document.createElement("span");c.className="history-chip";c.textContent=k.charAt(0).toUpperCase()+k.slice(1)+" "+entry.m[k]+'"';vals.appendChild(c);}
    });
    const gc=document.createElement("span");gc.className="history-chip";gc.style.color="var(--c-accent,#a8c14a)";gc.textContent=entry.garment;vals.appendChild(gc);
    div.appendChild(dateEl);div.appendChild(vals);
    div.addEventListener("click",function(){
      Object.assign(State.measurements,entry.m);
      State.activeGarment=entry.garment;
      syncInputs();buildMannequin(State.measurements);
      updateFitScore();updateSizeRec();updateAlterations();updateStatList();renderHistory();
    });
    list.appendChild(div);
  });
}
function syncInputs(){
  MEAS_DEFS.forEach(function(def){
    const el=document.getElementById("meas_"+def.key);
    if(el)el.value=State.measurements[def.key]||"";
  });
}

/* === 11. CAMERA VIEWS === */
function setView(view){
  State.activeView=view;
  if(!camera)return;
  const t={front:{x:0,y:0.6,z:3.8},side:{x:3.8,y:0.6,z:0},back:{x:0,y:0.6,z:-3.8}};
  const p=t[view]||t.front;
  const s=camera.position.clone();const e=new THREE.Vector3(p.x,p.y,p.z);
  const t0=performance.now();
  (function step(now){
    const pct=Math.min((now-t0)/600,1);const k=pct<0.5?2*pct*pct:-1+(4-2*pct)*pct;
    camera.position.lerpVectors(s,e,k);if(pct<1)requestAnimationFrame(step);
  })(t0);
}

/* === 12. API & LIVE DATABASE INTEGRATION === */
function getApiBase(){
  if(typeof window!=='undefined'&&window.HAULO_API_BASE){
    return window.HAULO_API_BASE;
  }
  if(typeof window!=='undefined'&&window.location){
    const p=window.location.port;
    if(p==='8080'||p===''||p==='80'||p==='443'){
      return `${window.location.origin}/api/v1`;
    }
  }
  return 'http://localhost:8080/api/v1';
}

function getStoredToken(){
  try{
    return sessionStorage.getItem('erp_token')||localStorage.getItem('erp_token')||'';
  }catch(e){
    return '';
  }
}

async function ensureAuthToken(){
  let token=getStoredToken();
  if(token)return token;
  try{
    const res=await fetch(getApiBase()+'/auth/login',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({username:'riwayat_owner',password:'Admin@123'})
    });
    if(res.ok){
      const data=await res.json();
      if(data&&data.token){
        token=data.token;
        try{
          localStorage.setItem('erp_token',token);
          if(data.companyName)localStorage.setItem('erp_company_name',data.companyName);
        }catch(e){}
        return token;
      }
    }
  }catch(err){
    console.warn('[Mannequin3D] Auto-auth attempt:',err);
  }
  return '';
}

async function apiFetch(path,options){
  options=options||{};
  const token=await ensureAuthToken();
  const headers=Object.assign({
    'Content-Type':'application/json'
  },options.headers||{});
  if(token){
    headers['Authorization']='Bearer '+token;
  }
  const url=path.startsWith('http')?path:(getApiBase()+path);
  return fetch(url,Object.assign({},options,{headers}));
}

function applyMeasurementData(raw){
  if(!raw)return;
  const meas=Array.isArray(raw)?(raw.find(function(x){return x.isCurrent||x.isActiveProfile;})||raw[0]||{}):(raw.measurements||raw);
  const km={
    height: ["height","fullLength","garmentLength"],
    shoulder: ["shoulder","crossBack"],
    bust: ["bust","upperBust"],
    underBust: ["underBust","under_bust"],
    waist: ["waist"],
    hip: ["hip","fullHip","highHip"],
    thigh: ["thigh","thighRound"],
    blouseLength: ["blouseLength","blouse_length","garmentLength"],
    upperArm: ["upperArm","upper_arm","armhole","bicep"],
    sleeveLength: ["sleeveLength","sleeve_length"],
    neck: ["neck","frontNeck","frontNeckDepth"]
  };
  let applied=false;
  Object.keys(km).forEach(function(stateKey){
    const aliases=km[stateKey];
    for(let i=0;i<aliases.length;i++){
      const val=meas[aliases[i]];
      if(val!=null&&!isNaN(parseFloat(val))&&parseFloat(val)>0){
        State.measurements[stateKey]=parseFloat(val);
        applied=true;
        break;
      }
    }
  });
  if(applied){
    syncInputs();
    buildMannequin(State.measurements);
    updateFitScore();
    updateSizeRec();
    updateAlterations();
    updateStatList();
  }
}

function selectCustomer(c){
  if(!c)return;
  State.selectedCustomer=c;
  const setT=function(id,v){const e=document.getElementById(id);if(e)e.textContent=v;};
  const phone=c.mobileNumber||c.phone||c.mobile||c.id||"";
  setT("custName",c.name||"Customer");
  const metaParts=[];
  if(phone)metaParts.push(phone);
  if(c.city)metaParts.push(c.city);
  if(c.tier)metaParts.push(c.tier+" Tier");
  if(c.favoriteGarment)metaParts.push(c.favoriteGarment);
  setT("custMeta",metaParts.join(" • ")||"Active Client");
  const parts=(c.name||"").trim().split(/\s+/);
  const initials=parts.map(function(w){return w[0]||"";}).join("").slice(0,2).toUpperCase()||"CU";
  setT("custInitials",initials);

  // If customer object already includes measurements, apply them immediately
  if(c.measurements&&c.measurements.length){
    applyMeasurementData(c.measurements);
  }
  // Also load detailed body measurement profile from backend
  if(phone){
    loadCustMeas(phone);
  }
}

async function loadCustomers(){
  const sel=document.getElementById("customerSelect");if(!sel)return;
  sel.innerHTML="<option value=''>Loading customers from database...</option>";
  try{
    const res=await apiFetch("/customers?size=200");
    if(!res.ok)throw new Error("HTTP "+res.status);
    const data=await res.json();
    const list=Array.isArray(data)?data:(data.content||data.customers||data.data||[]);
    if(!list.length)throw new Error("No customer records found");
    State.customers=list;
    sel.innerHTML="<option value=''>-- Select Customer ("+list.length+" in DB) --</option>";
    list.forEach(function(c){
      const phone=c.mobileNumber||c.phone||c.mobile||c.id||"";
      const o=document.createElement("option");
      o.value=phone;
      o.textContent=c.name+(phone?" ("+phone+")":"");
      sel.appendChild(o);
    });
    // Auto-select first customer from live database
    if(list.length>0){
      const first=list[0];
      const ph=first.mobileNumber||first.phone||first.mobile||first.id||"";
      sel.value=ph;
      selectCustomer(first);
    }
  }catch(e){
    console.warn("[Mannequin3D] Database load fallback:",e);
    sel.innerHTML="<option value=''>-- Live Database Unavailable --</option>";
    const o=document.createElement("option");o.value="demo";o.textContent="Demo Customer (Fallback)";sel.appendChild(o);
    sel.value="demo";loadDemo();
  }
}

async function loadCustMeas(phone){
  if(!phone||phone==="demo")return;
  try{
    const res=await apiFetch("/customers/"+encodeURIComponent(phone)+"/body-measurements");
    if(!res.ok)return;
    const data=await res.json();
    applyMeasurementData(data);
  }catch(e){
    console.warn("[Mannequin3D] Customer measurements error:",e);
  }
}

function loadDemo(){
  Object.assign(State.measurements,{height:64,shoulder:15,bust:38,underBust:32,waist:32,hip:40,thigh:22,blouseLength:15,upperArm:12,sleeveLength:22,neck:14});
  syncInputs();buildMannequin(State.measurements);updateFitScore();updateSizeRec();updateAlterations();updateStatList();
  const setT=function(id,v){const e=document.getElementById(id);if(e)e.textContent=v;};
  setT("custName","Demo Customer");setT("custMeta","Sample data • Connect API for live measurements");setT("custInitials","DC");
}

/* === 13. UI WIRING === */
function wireUI(){
  /* garment buttons */
  document.querySelectorAll(".garment-btn").forEach(function(btn){
    btn.addEventListener("click",function(){
      document.querySelectorAll(".garment-btn").forEach(function(b){b.classList.remove("active");});
      btn.classList.add("active");State.activeGarment=btn.dataset.garment;
      buildMannequin(State.measurements);
    });
  });
  /* view buttons */
  document.querySelectorAll(".view-btn").forEach(function(btn){
    btn.addEventListener("click",function(){
      document.querySelectorAll(".view-btn").forEach(function(b){b.classList.remove("active");});
      btn.classList.add("active");setView(btn.dataset.view);
    });
  });
  /* toggles */
  function tog(id,cb){const el=document.getElementById(id);if(el)el.addEventListener("change",function(){cb(el.checked);});}
  tog("toggleLabels",function(v){State.showLabels=v;const s=document.getElementById("measOverlaySvg");if(s)s.style.display=v?"":"none";});
  tog("toggleGarment",function(v){State.showGarment=v;if(garmentGroup)garmentGroup.visible=v;});
  tog("toggleWireframe",function(v){State.wireframe=v;if(scene)scene.traverse(function(o){if(o.isMesh&&o.material)o.material.wireframe=v;});});
  tog("toggleAutoRotate",function(v){State.autoRotate=v;});
  /* customer select */
  const csel=document.getElementById("customerSelect");
  if(csel)csel.addEventListener("change",function(){
    const val=csel.value;
    if(!val||val==="demo"){loadDemo();return;}
    const c=State.customers.find(function(x){
      const p=x.mobileNumber||x.phone||x.mobile||x.id;
      return p===val;
    });
    if(c){
      selectCustomer(c);
    }
  });
  /* toolbar */
  function tb(id,cb){const el=document.getElementById(id);if(el)el.addEventListener("click",cb);}
  tb("toolReset",function(){camera.position.set(0,0.6,3.8);if(controls){controls.target.set(0,0.3,0);controls.update();}});
  tb("toolZoomIn",function(){camera.position.multiplyScalar(0.85);});
  tb("toolZoomOut",function(){camera.position.multiplyScalar(1.18);});
  tb("toolScreenshot",function(){renderer.render(scene,camera);const a=document.createElement("a");a.href=renderer.domElement.toDataURL("image/png");a.download="mannequin_"+Date.now()+".png";a.click();});
  tb("btnSaveMeas",function(){saveHistory();const btn=document.getElementById("btnSaveMeas");if(btn){btn.textContent="Saved!";setTimeout(function(){btn.textContent="Save";},2000);}});
  /* tabs */
  document.querySelectorAll(".tab-pill").forEach(function(tab){
    tab.addEventListener("click",function(){
      document.querySelectorAll(".tab-pill").forEach(function(t){t.classList.remove("active");});
      tab.classList.add("active");
    });
  });
}

/* === 14. INIT === */
function init(){
  buildMeasurementInputs();
  wireUI();
  // Wait for THREE.js to be available (CDN may load async)
  var threeReady=function(){
    if(typeof THREE!=='undefined'){
      initThree();
    } else {
      console.warn('[Mannequin3D] THREE not yet loaded, retrying in 100ms...');
      setTimeout(threeReady,100);
      return;
    }
  };
  threeReady();
  loadCustomers();
  loadHistory();
  updateFitScore();updateSizeRec();updateAlterations();updateStatList();
  setTimeout(function(){if(window.lucide)lucide.createIcons();},200);
}

if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init);}else{init();}

})();
