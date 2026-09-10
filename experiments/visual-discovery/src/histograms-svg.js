// References: original histogram lab (aligned intervals and cumulative growth),
// straight-line pilot (one model, committed comparison, persistent revision).
// Adaptation: piecewise-linear cumulative estimates integrate the very same bar areas.
function sceneHeight() { return step<3?340:500; }
function histLayout() {
  const left=mobile?42:Math.max(62,(W-820)/2),right=mobile?W-18:W-left;
  const top=step<3?64:54,bottom=step<3?250:198;
  return {left,right,top,bottom,x:value=>left+value/s.bounds.at(-1)*(right-left),
    y:value=>bottom-value/3*(bottom-top),cfTop:304,cfBottom:436};
}
function histPolyline(data,values,L,max) {
  return values.map((value,i)=>`${i?'L':'M'}${L.x(data.boundaries[i])} ${L.cfBottom-value/max*(L.cfBottom-L.cfTop)}`).join(' ');
}
function histGrid(L) {
  if(step<3)text(L.left,48,'Density / pupils per min','small');
  for(let v=0;v<=3;v++) {
    line(L.left,L.y(v),L.right,L.y(v),{class:'hist-grid'});
    text(L.left-10,L.y(v)+4,String(v),'small','end');
  }
  for(let v=0;v<=s.bounds.at(-1);v+=5)line(L.x(v),L.top,L.x(v),L.bottom,{class:'hist-grid'});
  line(L.left,L.top,L.left,L.bottom,{class:'hist-axis'});
  line(L.left,L.bottom,L.right,L.bottom,{class:'hist-axis'});
  for(const value of s.bounds)text(L.x(value),L.bottom+21,String(value),'small','middle');
}
function histBar(i,data,L,editable,saved=false) {
  const x=L.x(data.boundaries[i]),width=L.x(data.boundaries[i+1])-x,y=L.y(data.densities[i]);
  const group=el('g',{'data-histogram-bar':i});
  el('rect',{x,y,width,height:L.bottom-y,class:saved?'comparison-ghost':'hist-bar'},undefined,group);
  if(saved)return;
  // Each cell has area 5 min × 1 pupil/min. Partial cells retain exact bar area.
  for(let v=data.boundaries[i]+5;v<data.boundaries[i+1];v+=5)line(L.x(v),y,L.x(v),L.bottom,{class:'hist-cell'},group);
  for(let d=1;d<data.densities[i];d++)line(x,L.y(d),x+width,L.y(d),{class:'hist-cell'},group);
  const topLabel=step<3?L.bottom+51:L.bottom+44;
  text(x+width/2,topLabel,step<3?`Given ${s.targets[i]}`:`${data.frequencies[i]} pupils`,'small','middle',group);
  if(editable) {
    // A tap on a column sets the same density as dragging; it is not a second model.
    const tap=el('rect',{x,y:L.top,width,height:L.bottom-L.top,fill:'transparent',class:'hist-tap','data-set-bar':i},undefined,group);
    tap.onclick=e=>{if(e.detail>1)return;const p=point(e);setHistFrequency(i,(L.bottom-p.y)/(L.bottom-L.top)*3*data.widths[i]);};
    const control=handle('hist-bar-'+i,x+width/2,y,{label:`Frequency density for ${histInterval(i)} minutes`,min:0,max:3,value:data.densities[i],valueText:`${fmt(data.densities[i],2)} pupils per minute; area ${data.frequencies[i]} pupils`,increment:1/data.widths[i],set:value=>setHistFrequency(i,value*data.widths[i]),fromPoint:p=>(L.bottom-p.y)/(L.bottom-L.top)*3,help:'Drag this bar top, use the arrow keys, or tap inside its column to set the height. The interval width stays fixed.'});
    control.setAttribute('aria-orientation','vertical');
  }
  const wrong=step<3&&s.tested&&data.frequencies[i]!==s.targets[i];
  if(wrong){el('rect',{x:x+1,y:y+1,width:Math.max(0,width-2),height:Math.max(0,L.bottom-y-2),class:'hist-error-outline'},undefined,group);text(x+width/2,topLabel+18,'×','hist-error','middle',group);}
}
function histQuantityLabels(data,L) {
  const i=s.selected;
  if(step===0&&!s.tested){text((L.left+L.right)/2,29,'One full grid cell represents 5 pupils','small','middle');return;}
  if(step===2){text((L.left+L.right)/2,29,'Frequency density / pupils per minute','small','middle');return;}
  sourceLabel('bar-area',L.left,26,`${histInterval(i)} min: ${data.frequencies[i]} pupils`,'This frequency is the selected bar’s area, not its height.','small');
  sourceLabel('density',L.right,26,`Height ${fmt(data.densities[i],2)}`,`Frequency density is ${fmt(data.densities[i],2)} pupils per minute. Multiplying by the interval width gives its frequency.`,'small','end');
  sourceLabel('class-width',step<3?L.right:(L.left+L.right)/2,step<3?325:275,`Width ${data.widths[i]} min`,'The upper boundary minus the lower boundary gives the width of the selected interval.','small',step<3?'end':'middle');
}
function histCumulative(data,L,savedData) {
  const maximum=step===3||step===4?60:Math.max(60,Math.ceil(Math.max(data.total,savedData?.total||0)/20)*20);
  const cy=value=>L.cfBottom-value/maximum*(L.cfBottom-L.cfTop);
  text(L.left,292,'Cumulative frequency / pupils','small');
  for(let j=0;j<=4;j++) {
    const value=maximum*j/4;
    line(L.left,cy(value),L.right,cy(value),{class:'hist-grid'});
    text(L.left-10,cy(value)+4,fmt(value,1),'small','end');
  }
  for(const value of s.bounds) {
    line(L.x(value),L.cfTop,L.x(value),L.cfBottom,{class:'hist-grid'});
    text(L.x(value),L.cfBottom+21,String(value),'small','middle');
  }
  line(L.left,L.cfTop,L.left,L.cfBottom,{class:'hist-axis'});
  line(L.left,L.cfBottom,L.right,L.cfBottom,{class:'hist-axis'});
  if(savedData)el('path',{d:histPolyline(savedData,savedData.cumulative,L,maximum),class:'comparison-ghost','data-saved-curve':'true'});
  if(step!==3||s.tested)el('path',{d:histPolyline(data,data.cumulative,L,maximum),class:'hist-curve','data-report-curve':'true'});
  if(step===3) {
    el('path',{d:histPolyline(data,s.sketch,L,maximum),class:'hist-sketch'});
    const strip=el('g');
    // Generous invisible columns provide a non-drag pointer path for each cross.
    for(let i=1;i<s.sketch.length-1;i++) {
      const x=L.x(s.bounds[i]),target=el('rect',{x:x-20,y:L.cfTop,width:40,height:L.cfBottom-L.cfTop,fill:'transparent',class:'hist-tap','data-set-total':i},undefined,strip);
      target.onclick=e=>{if(e.detail>1)return;setHistTotal(i,(L.cfBottom-point(e).y)/(L.cfBottom-L.cfTop)*maximum);};
    }
    for(let i=1;i<s.sketch.length-1;i++) {
      const x=L.x(s.bounds[i]),y=cy(s.sketch[i]);
      const control=handle('hist-total-'+i,x,y,{label:`Cumulative frequency at ${s.bounds[i]} minutes`,min:s.sketch[i-1],max:s.sketch[i+1],value:s.sketch[i],valueText:`${s.sketch[i]} pupils accumulated`,increment:1,set:value=>setHistTotal(i,value),fromPoint:p=>(L.cfBottom-p.y)/(L.cfBottom-L.cfTop)*maximum,help:'Move this cross vertically, or tap above or below it. Include every interval to the left. Neighbouring totals keep the sketch non-decreasing.'});
      control.setAttribute('aria-orientation','vertical');
      line(x-5,y-5,x+5,y+5,{class:'hist-cross','pointer-events':'none'});
      line(x-5,y+5,x+5,y-5,{class:'hist-cross','pointer-events':'none'});
    }
    const i=s.selected;
    sourceLabel('cumulative-rise',L.right,275,`Rise ${s.sketch[i+1]-s.sketch[i]}`,'Subtract the previous total from the next total to find the pupils added by this interval.','small','end');
    text(L.right,484,s.tested?'Solid: report · dashed: your totals':'Dashed: your running totals','small','end');
  }
  if(step===4||step===5)histRuler(data,L,cy);
}
function histRuler(data,L,cy) {
  const x=L.x(s.scan),current=histogramCumulativeAt(data,s.scan);
  if(step===4) {
    const rank=data.total*(s.qIndex+1)/4;
    line(L.left,cy(rank),L.right,cy(rank),{class:'hist-rank'});
    text(L.right,cy(rank)-7,`${['Q1','Median','Q3'][s.qIndex]}: ${rank} pupils`,'small','end');
    for(let i=0;i<data.frequencies.length;i++) {
      const lower=histAllRead()?s.quartiles[0]:data.boundaries[0],upper=histAllRead()?s.quartiles[2]:s.scan;
      const left=L.x(Math.max(lower,data.boundaries[i])),right=L.x(Math.min(upper,data.boundaries[i+1]));
      if(right>left)el('rect',{x:left,y:L.y(data.densities[i]),width:right-left,height:L.bottom-L.y(data.densities[i]),class:'hist-estimate-shade','data-middle-half':String(histAllRead())});
    }
    const area=el('rect',{x:L.left,y:L.cfTop,width:L.right-L.left,height:L.cfBottom-L.cfTop,fill:'transparent',class:'hist-tap','data-set-ruler':'true'});
    area.onclick=e=>{if(e.detail>1)return;setHistScan((point(e).x-L.left)/(L.right-L.left)*s.bounds.at(-1));};
    line(x,L.top,x,L.cfBottom,{class:'hist-ruler','pointer-events':'none'});
    dot(x,cy(current),5,{class:'hist-read-dot','pointer-events':'none'});
    const control=handle('hist-ruler',x,L.cfBottom,{label:'Journey-time read-off ruler',min:0,max:s.bounds.at(-1),value:s.scan,valueText:`${fmt(s.scan,1)} minutes, ${fmt(current,1)} pupils accumulated`,increment:.5,set:setHistScan,fromPoint:p=>(p.x-L.left)/(L.right-L.left)*s.bounds.at(-1),help:'Move the ruler horizontally, use arrow keys, or tap the cumulative graph at a journey time.'});
    control.setAttribute('aria-orientation','horizontal');
    sourceLabel('read-time',L.left,484,`${fmt(s.scan,1)} min`,'This is an estimated journey time read from the horizontal axis.','small');
    sourceLabel('read-total',L.right,484,`${fmt(current,1)} pupils`,'The cumulative value at the ruler includes all histogram area to its left.','small','end');
    if(histAllRead()) {
      const prediction=histogramNumber(s.iqr),q1=s.quartiles[0],q3=s.quartiles[2],end=s.iqrChecked&&prediction!==null?q1+prediction:q3;
      const a=L.x(q1),b=L.x(clamp(end,0,s.bounds.at(-1))),y=256;
      line(a,y,b,y,{class:'hist-bracket'});line(a,y-5,a,y+5,{class:'hist-bracket'});line(b,y-5,b,y+5,{class:'hist-bracket'});
      line(L.x(q3),y-8,L.x(q3),y+8,{class:'hist-rank'});
    }
  } else if(data.total) {
    const median=histogramQuantile(data,.5),mx=L.x(median);
    line(mx,L.top,mx,L.cfBottom,{class:'hist-ruler'});
    dot(mx,cy(data.total/2),4,{class:'hist-read-dot'});
    text(L.right,484,`Median ≈ ${fmt(median,1)} min`,'small','end');
  }
}
function render() {
  clear();head(lesson[step].title,lesson[step].intro);
  const data=histData(),L=histLayout(),saved=s.comparison===null?null:s.records[s.comparison],savedData=saved?histogramDistribution(saved.bounds,saved.counts):null;
  histGrid(L);
  const activeLeft=L.x(s.bounds[s.selected]),activeRight=L.x(s.bounds[s.selected+1]);
  if(step>=3)el('rect',{x:activeLeft,y:L.top,width:activeRight-activeLeft,height:L.bottom-L.top,class:'hist-interval-highlight'});
  for(let i=0;i<data.frequencies.length;i++)histBar(i,data,L,step===0||step===1?i===1:step===2||step===5);
  if(savedData)for(let i=0;i<savedData.frequencies.length;i++)histBar(i,savedData,L,false,true);
  histQuantityLabels(data,L);
  if(step>=3)histCumulative(data,L,savedData);
  if(step<3)text(L.left,L.bottom+77,'Journey time / min','small');
  updateHistWork();histogramFeedback();endDraw();
}
