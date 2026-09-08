function sceneHeight(){return 390}
function opticsLayout(){return{cx:W*.5,cy:mobile?155:150,r:mobile?106:162}}
function ray(x1,y1,x2,y2,colour,width,opacity=1){
 const g=el('g',{opacity});line(x1,y1,x2,y2,{stroke:colour,'stroke-width':width+5,opacity:.12,'stroke-linecap':'round'},g);line(x1,y1,x2,y2,{stroke:colour,'stroke-width':width,'stroke-linecap':'round'},g);
 line(x1,y1,x2,y2,{stroke:'white','stroke-width':1.5,opacity:.7,class:'beam-flow'},g);
 const angle=Math.atan2(y2-y1,x2-x1)*180/Math.PI;
 el('path',{d:'M -4 -4 L 3 0 L -4 4',fill:'none',stroke:colour,'stroke-width':1.8,'stroke-linejoin':'round',transform:`translate(${x1+(x2-x1)*.6} ${y1+(y2-y1)*.6}) rotate(${angle})`},undefined,g);
}
function render(){
 const materialKey=s.inside+'/'+s.outside,materialChanged=materialKey!==previousMaterial;previousMaterial=materialKey;
 clear();head(lesson[step].title,lesson[step].intro);
 const {cx,cy,r}=opticsLayout(),radius=r+24,c=critical(),o=optics(),predict=step===2&&s.swapped&&!s.tested,a=materials[s.inside],b=materials[s.outside];
 const rad=s.angle*Math.PI/180,sx=cx-radius*Math.sin(rad),sy=cy+radius*Math.cos(rad),edgeRight=mobile?W-10:W*.85,edgeLeft=mobile?10:W*.15;
 // The original semicircular block keeps entry normal to the curved face.
 el('rect',{x:edgeLeft,y:25,width:edgeRight-edgeLeft,height:cy-25,fill:s.outside==='air'?'var(--lab-surface-muted)':`var(--lab-concept-${materialTone(s.outside)}-soft)`,'data-material':s.outside});
 const defs=el('defs'),glass=el('linearGradient',{id:'blockMaterial',x1:'0%',y1:'0%',x2:'0%',y2:'100%'},undefined,defs);
 el('stop',{offset:0,'stop-color':`var(--lab-concept-${materialTone(s.inside)}-soft)`},undefined,glass);el('stop',{offset:1,'stop-color':`var(--lab-concept-${materialTone(s.inside)}-fill)`},undefined,glass);
 el('path',{d:`M ${cx-r} ${cy} A ${r} ${r} 0 0 0 ${cx+r} ${cy} Z`,fill:s.inside==='air'?'var(--lab-surface-muted)':'url(#blockMaterial)',stroke:`var(--lab-concept-${materialTone(s.inside)}-line)`,'stroke-width':2,class:materialChanged?'material-piece':'','data-material':s.inside});
 if(s.inside==='diamond')el('path',{d:`M ${cx-r*.8} ${cy} L ${cx} ${cy+r*.85} L ${cx+r*.8} ${cy} M ${cx-r*.8} ${cy} L ${cx+r*.48} ${cy+r*.8} M ${cx+r*.8} ${cy} L ${cx-r*.48} ${cy+r*.8}`,fill:'none',stroke:'var(--lab-concept-violet-line)','stroke-width':1,opacity:.65});
 if(s.inside==='water')for(let j=0;j<3;j++)el('path',{d:`M ${cx-r*.7} ${cy+14+j*9} Q ${cx-r*.35} ${cy+6+j*9} ${cx} ${cy+14+j*9} T ${cx+r*.7} ${cy+14+j*9}`,fill:'none',stroke:'var(--lab-concept-teal-line)','stroke-width':1,opacity:.7});
 el('path',{d:`M ${cx-r+15} ${cy+16} A ${r-18} ${r-18} 0 0 0 ${cx-r*.57} ${cy+r*.77}`,fill:'none',stroke:'white','stroke-width':3.5,'stroke-linecap':'round',opacity:.85});
 line(edgeLeft,cy,edgeRight,cy,{stroke:'var(--lab-concept-slate)','stroke-width':2});
 line(cx,40,cx,cy+r+19,{stroke:'var(--lab-concept-slate)','stroke-width':1,'stroke-dasharray':'5 6'});
 text(cx+9,51,'normal','small');text(edgeLeft+12,47,`${b.name} · n = ${fmt(b.n,2)}`,'small');
 text(cx+r*.55,H-23,`${a.name} · n = ${fmt(a.n,2)}`,'small','middle');
 for(let deg=20;deg<=80;deg+=20){
  const t=deg*Math.PI/180,inner=r-5,outer=r+3,label=r+15;
  line(cx-inner*Math.sin(t),cy+inner*Math.cos(t),cx-outer*Math.sin(t),cy+outer*Math.cos(t),{stroke:'var(--lab-concept-slate)','stroke-width':1});
  if(Math.abs(deg-s.angle)>7)text(cx-label*Math.sin(t)-4,cy+label*Math.cos(t)+4,`${deg}°`,'small','end');
 }
 if(!predict){
  ray(sx,sy,cx,cy,'var(--lab-concept-amber)',4);
  ray(cx,cy,cx+r*Math.sin(rad),cy+r*Math.cos(rad),'var(--lab-concept-violet)',2+3*Math.sqrt(o.R),Math.max(.18,o.R));
  dot(cx+r*Math.sin(rad),cy+r*Math.cos(rad),3.5,{fill:'var(--lab-concept-violet)',opacity:Math.max(.18,o.R)});
  if(o.r!==null){
   const rr=o.r*Math.PI/180,dx=Math.sin(rr),dy=-Math.cos(rr),reach=Math.min((edgeRight-cx)/Math.max(.0001,dx),(cy-32)/Math.max(.0001,-dy));
   ray(cx,cy,cx+reach*dx,cy+reach*dy,'var(--lab-concept-blue)',3.5,Math.abs(o.r-90)<.01?.9:Math.max(.25,1-o.R));
   dot(cx+reach*dx,cy+reach*dy,3,{fill:'var(--lab-concept-blue)'});
   if(step>0)text(edgeRight-8,cy-18,`r = ${fmt(o.r)}°`,'accent','end');
  }else text(edgeRight-8,cy-18,'No escaping ray','accent','end');
 }else line(sx,sy,cx,cy,{stroke:'var(--lab-concept-violet)','stroke-width':2,'stroke-dasharray':'5 6'});
 const ar=mobile?40:54;
 el('path',{d:`M ${cx} ${cy+ar} A ${ar} ${ar} 0 0 1 ${cx-ar*Math.sin(rad)} ${cy+ar*Math.cos(rad)}`,fill:'none',stroke:'var(--lab-concept-amber)','stroke-width':1.5});
 text(cx-ar-13,cy+ar+19,`i = ${fmt(s.angle)}°`,'small','end');
 const source=handle('angle',sx,sy,{label:predict?'Predicted critical angle':'Incidence angle from the normal',min:5,max:step===0?35:80,value:s.angle,valueText:`${fmt(s.angle)} degrees`,increment:1,set:setAngle,fromPoint:p=>Math.atan2(cx-p.x,Math.max(1,p.y-cy))*180/Math.PI});
 source.replaceChildren();dot(sx,sy,24,{fill:'transparent'},source);
 const barrel=el('g',{transform:`translate(${sx} ${sy}) rotate(${s.angle})`},undefined,source);
 el('rect',{x:-10,y:-5,width:20,height:34,rx:5,fill:'#353f45',stroke:'#151a1d','stroke-width':1},undefined,barrel);
 el('rect',{x:-10,y:9,width:20,height:6,fill:'var(--lab-concept-amber)'},undefined,barrel);
 el('rect',{x:-8,y:-8,width:16,height:5,rx:2,fill:'var(--lab-concept-amber-fill)',stroke:'var(--lab-concept-amber)','stroke-width':1},undefined,barrel);
 for(let j=0;j<2;j++)line(-6,20+j*4,6,20+j*4,{stroke:'#7c8a91','stroke-width':.8},barrel);
 if(step===2&&s.swapped){const ref=Math.asin(1/1.5);line(cx,cy,cx-r*Math.sin(ref),cy+r*Math.cos(ref),{stroke:'var(--lab-concept-blue)','stroke-width':1.2,'stroke-dasharray':'4 4'});text(edgeLeft,H-23,'Glass: c = 41.8°','small')}
 if(s.marked&&c!==null){
  const cr=c*Math.PI/180;line(cx,cy,cx-r*Math.sin(cr),cy+r*Math.cos(cr),{stroke:'var(--lab-concept-violet)','stroke-width':1.5,'stroke-dasharray':'3 4'});
  text(edgeRight,H-23,`c = ${fmt(c)}°`,'accent','end');
 }
 dot(cx,cy,4,{fill:'white',stroke:'var(--lab-concept-slate)','stroke-width':1.5});
 if(step===0)feedback(s.angle>=29?'The ray bends away from the normal as it enters the lower-index medium.':'Move the amber source. The blue ray is the light that escapes.',s.angle>=29);
 if(step===1)feedback(s.marked?`At ${fmt(c)}°, the refracted ray reaches 90°. Beyond this angle, all light reflects.`:s.below&&s.above?'Return to the transition and mark it.':'Look for an escaping ray, then for a ray that stays inside.',s.marked);
 if(step===2){
  const ratioOK=Math.abs(Number(s.ratio)-1/2.42)<.005,angleOK=Math.abs(s.angle-c)<=.3,ok=s.tested&&ratioOK&&angleOK;
  if($('ratioInput'))$('ratioInput').className=s.tested?(ratioOK?'good':'bad'):'';
  if($('angleInput'))$('angleInput').className=s.tested?(angleOK?'good':'bad'):'';
  workState(s.swapped?(s.tested?(ok?'good':'bad'):'needed'):'reference');
  feedback(ok?`sin c = 1 ÷ 2.42 ≈ 0.413. c ≈ ${fmt(c)}°: a smaller threshold.`:s.tested?'Compare your angle with the ray. Use inverse sine on the index ratio.':'Use sin c = n outside ÷ n inside. Both values belong to the same boundary.',ok,s.tested&&!ok);
 }
 if(step===3)feedback(s.low&&s.high?'Light still escapes. Total internal reflection needs a higher-to-lower index boundary.':`Sweep the full range. ${s.low?'5° explored. ':''}${s.high?'80° explored.':''}`,s.low&&s.high);
 if(step===4){feedback(c===null?'No critical angle: the incident medium has an equal or lower refractive index.':`sin c = ${fmt(b.n,2)} ÷ ${fmt(a.n,2)}. c = ${fmt(c)}°. TIR requires i > c.`,false);table(['From → to','Incidence','Critical angle','Escaping light'],s.records)}
 if(step===2&&!s.swapped)feedback('Glass to air: c = 41.8°. Replace the glass to compare a higher refractive index.');
 if(step===1||step===2&&!s.swapped||step===4){const show=step!==1||s.marked;workValue('ratioWork',show?`${fmt(b.n,2)} ÷ ${fmt(a.n,2)} ≈ ${fmt(b.n/a.n,3)}`:'n outside ÷ n inside');workValue('criticalWork',!show?'c = sin⁻¹(index ratio)':c===null?'No critical angle':`sin⁻¹(${fmt(b.n/a.n,3)}) ≈ ${fmt(c)}°`)}
 endDraw();
}
