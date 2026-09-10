function railLayout() {
  const size=Math.min(W-68,350),left=(W-size)/2,top=42,unit=size/10;
  return {size,left,top,unit,right:left+size,bottom:top+size,x:v=>left+(v+5)*unit,y:v=>top+(5-v)*unit};
}
function sceneHeight() { return Math.min(W-68,350)+182; }
function drawRail(rail,kind,plot) {
  const group=el('g',{'clip-path':'url(#railPlotClip)',class:`rail-line rail-${kind}`,'data-rail':kind});
  const start=railPoint(rail,-5),end=railPoint(rail,5);
  if(kind==='candidate'||kind==='reference') {
    line(plot.x(start.x),plot.y(start.y),plot.x(end.x),plot.y(end.y),{class:'rail-bed'},group);
    line(plot.x(start.x),plot.y(start.y),plot.x(end.x),plot.y(end.y),{class:'rail-edge'},group);
    // Regular sleepers make the rail an operated construction, not a detached graph preview.
    for(let position=-5;position<=5;position+=.5){
      const p=railPoint(rail,position),norm=rail.mode==='vertical'?1:Math.hypot(rail.m,1),dx=rail.mode==='vertical'?4:4*rail.m/norm,dy=rail.mode==='vertical'?0:4/norm;
      line(plot.x(p.x)-dx,plot.y(p.y)-dy,plot.x(p.x)+dx,plot.y(p.y)+dy,{class:'rail-sleeper'},group);
    }
  } else line(plot.x(start.x),plot.y(start.y),plot.x(end.x),plot.y(end.y),{class:'rail-ghost'},group);
}
function railMount(label,x,y,plot,key) {
  const xx=plot.x(x),yy=plot.y(y);
  dot(xx,yy,7,{class:'rail-mount'});
  line(xx-3,yy,xx+3,yy,{class:'rail-mount-cross'});line(xx,yy-3,xx,yy+3,{class:'rail-mount-cross'});
  sourceLabel(key,xx+(x<0?-12:12),yy-15,`${label}(${railText(x)}, ${railText(y)})`,'A fixed mounting point. The same straight rail must pass through every supplied mount.','small',x<0?'end':'start');
}
function railHandle(id,x,y,label,config) {
  const g=handle(id,x,y,{label,...config});
  g.classList.add('rail-handle');
  return g;
}
function drawRailTriangle(plot) {
  if(s.mode!=='linear'||step===0||step===5)return;
  const ax=plot.x(0),ay=plot.y(s.c),bx=plot.x(2),by=plot.y(2*s.m+s.c);
  el('path',{d:`M ${ax} ${ay} H ${bx} V ${by} Z`,class:'rail-triangle'});
  line(ax,ay,bx,ay,{class:'rail-run'});line(bx,ay,bx,by,{class:'rail-rise'});
  if(step<=2||step===6){
    sourceLabel('run',(ax+bx)/2,ay+(s.m>=0?24:-16),'run 2','The horizontal coordinate increases by 2 units. This is the denominator of the gradient.','small','middle');
    sourceLabel('rise',bx+18,(ay+by)/2+4,`rise ${railText(2*s.m)}`,'The signed vertical change is final y minus starting y. It is negative when the rail falls as x increases.','small');
  }
}
function drawRailControls(plot) {
  const editableTilt=[0,3,4,6].includes(step)&&s.mode==='linear',editableSlide=[1,3,4,6].includes(step)&&s.mode==='linear';
  if(editableTilt){
    const x=plot.x(2),y=plot.y(2*s.m+s.c);
    railHandle('rail-tilt',x,y,'Tilt: gradient',{help:'Drag up or down to change the gradient. The intercept stays fixed.',min:-1.5,max:1.5,value:s.m,increment:.25,set:v=>setRailValue('m',v),fromPoint:p=>((plot.top+plot.size-p.y)/plot.unit-5-s.c)/2});
    text(x+19,y+([3,4].includes(step)||y<plot.top+28?24:-16),'Tilt','rail-control-label');
  }
  if(editableSlide){
    const x=plot.x(0),y=plot.y(s.c);
    railHandle('rail-slide',x,y,'Slide: y-intercept',{help:'Drag vertically to move the whole rail. Its gradient does not change.',min:-2,max:2,value:s.c,increment:.5,set:v=>setRailValue('c',v),fromPoint:p=>(plot.top+plot.size-p.y)/plot.unit-5});
    text(x-20,y-16,'Slide','rail-control-label','end');
  }
  if(s.mode==='vertical'){
    const xx=plot.x(s.k),yy=plot.y(0);
    railHandle('rail-vertical',xx,yy,'Slide: constant x-coordinate',{help:'Drag horizontally. Every point on the vertical rail keeps the same x-coordinate.',min:-3,max:3,value:s.k,increment:.5,set:v=>setRailValue('k',v),fromPoint:p=>(p.x-plot.left)/plot.unit-5});
    text(xx+18,yy-18,'Slide','rail-control-label');
  }
  // Coordinate labels are given measurements, never correctness signals.
  if(s.mode==='linear'&&step<=2){
    const xx=plot.x(0),yy=plot.y(s.c);
    if(!editableSlide)dot(xx,yy,4,{class:'rail-coordinate-dot'});
    sourceLabel('intercept',xx-16,yy+17,`(0, ${railText(s.c)})`,'At x = 0 the second coordinate is the y-intercept c.','small','end');
    if(step===2){dot(plot.x(2),plot.y(2*s.m+s.c),4,{class:'rail-coordinate-dot'});sourceLabel('point-b',plot.x(2)+14,plot.y(2*s.m+s.c)-18,`(2, ${railText(2*s.m+s.c)})`,'A second measured point on the amber rail. Compare its coordinates with the point at x = 0.','small');}
  }
}
function drawRailProbe(plot,other) {
  const p=railPoint(currentRail(),s.probe),xx=plot.x(p.x),yy=plot.y(p.y),trackY=plot.bottom+45;
  const group=el('g',{'clip-path':'url(#railPlotClip)'});
  line(xx,yy,xx,plot.bottom,{class:'rail-probe-guide'},group);
  if(s.mode==='linear')line(xx,plot.bottom,xx,trackY,{class:'rail-probe-guide'});
  // A neutral carriage follows the actual rail. It never changes the geometry or prediction.
  dot(xx,yy,5,{class:'rail-carriage'},group);
  if(other){
    if(other.mode===s.mode){
      const q=railPoint(other,s.probe);
      line(xx,yy,plot.x(q.x),plot.y(q.y),{class:'rail-gap'},group);
      dot(plot.x(q.x),plot.y(q.y),4,{class:'rail-other-point'},group);
    }
  }
  const left=plot.x(-2),right=plot.x(2),trackX=left+(s.probe+2)/4*(right-left);
  line(left,trackY,right,trackY,{class:'rail-travel-base'});
  if(s.visitedLow!==null)line(plot.x(s.visitedLow),trackY,plot.x(s.visitedHigh),trackY,{class:'rail-travel-visited'});
  for(const value of [-2,2]){const visited=value<0?s.visitedLow!==null&&s.visitedLow<=-2:s.visitedHigh!==null&&s.visitedHigh>=2;dot(plot.x(value),trackY,5,{class:`rail-stop${visited?' visited':''}`});text(plot.x(value),trackY+26,railText(value),'small','middle');}
  railHandle('rail-probe',trackX,trackY,'Test carriage position',{help:s.mode==='vertical'?'Move between −2 and 2 to inspect the lower and upper ends of the vertical rail.':'Move between −2 and 2 to compare the rail at different x-coordinates.',min:-2,max:2,value:s.probe,increment:.25,valueText:`${s.mode==='vertical'?'y':'x'} = ${railText(s.probe)}`,set:setProbe,fromPoint:q=>-2+4*(q.x-left)/(right-left)});
  text(W/2,trackY-23,'Test carriage','small','middle');
  sourceLabel('probe-coordinate',W/2,trackY+55,`Point (${railText(p.x)}, ${railText(p.y)})`,'The carriage reads a point on the actual amber rail. First coordinate: x. Second coordinate: y.','accent','middle');
  const gap=other?railGap(currentRail(),other,s.probe):null;
  const reading=other?(gap===null?'Different directions':`${s.mode==='vertical'?'Horizontal':'Vertical'} gap: ${railText(Math.abs(gap))}`):s.mode==='vertical'?'x stays constant as the carriage travels.':'Read x, then y, at this position.';
  sourceLabel('gap',W/2,trackY+80,reading,'The gap compares the rails at the same x-coordinate, or at the same y-coordinate for two vertical rails. A single matching point is not enough.','small','middle');
}
function render() {
  clear();head(lesson[step].title,lesson[step].intro);
  const plot=railLayout(),ref=referenceRail(),prediction=needsEquation()&&s.tested?predictedRail():null;
  const saved=step===6&&s.comparison!==null?s.records[s.comparison]:null;
  const defs=el('defs'),clip=el('clipPath',{id:'railPlotClip'},undefined,defs);
  el('rect',{x:plot.left,y:plot.top,width:plot.size,height:plot.size},undefined,clip);
  el('rect',{x:plot.left,y:plot.top,width:plot.size,height:plot.size,class:'rail-plot'});
  for(let i=-5;i<=5;i++){
    line(plot.x(i),plot.top,plot.x(i),plot.bottom,{class:i===0?'rail-axis':'rail-grid'});
    line(plot.left,plot.y(i),plot.right,plot.y(i),{class:i===0?'rail-axis':'rail-grid'});
    if(i!==0&&i%2===0){text(plot.x(i),plot.y(0)+15,String(i),'rail-tick','middle');text(plot.x(0)-7,plot.y(i)+4,String(i),'rail-tick','end');}
  }
  text(plot.right+14,plot.y(0)+5,'x','small','middle');text(plot.x(0),plot.top-10,'y','small','middle');
  // The legend is stable and sits outside the drawing, not in floating cards over it.
  line(plot.left,17,plot.left+17,17,{stroke:'var(--lab-concept-amber)','stroke-width':3});text(plot.left+24,21,'Your rail','small');
  if(ref){line(plot.right-100,17,plot.right-83,17,{stroke:'var(--lab-concept-blue)','stroke-width':3});text(plot.right-76,21,'Reference','small');drawRail(ref,'reference',plot);}
  else if(prediction||saved){line(plot.right-109,17,plot.right-90,17,{stroke:'var(--lab-concept-violet)','stroke-width':2,'stroke-dasharray':'5 3'});text(plot.right-84,21,saved?'Saved line':'Equation','small');}
  drawRailTriangle(plot);drawRail(currentRail(),'candidate',plot);
  if(prediction)drawRail(prediction,'prediction',plot);if(saved)drawRail(saved,'saved',plot);
  if(step===1)railMount('P',0,2,plot,'point-p');
  if(step===3){railMount('A',-2,3,plot,'point-a');railMount('B',2,1,plot,'point-b');}
  if(step===4){railMount('A',-2,-2,plot,'point-a');railMount('B',2,-2,plot,'point-b');}
  if(step===5)railMount('P',2,1,plot,'point-p');
  drawRailControls(plot);drawRailProbe(plot,prediction||saved||ref);
  updateRailWork();railFeedback();endDraw();
}
