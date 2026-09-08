const lesson=[
 {
  "label": "One length",
  "title": "Double a length and compare it with the original.",
  "intro": "The grey line is one unit long. Drag the blue endpoint until the new line is twice as long.",
  "success": "You have doubled the length."
 },
 {
  "label": "A whole face",
  "title": "Find out what doubling the sides does to the area.",
  "intro": "The length scale factor is now 2. Fill the larger square with unit squares and compare its area with the original.",
  "success": "Two doubled sides give four times the area."
 },
 {
  "label": "Into three dimensions",
  "title": "Build a doubled cube, one layer at a time.",
  "intro": "The doubled face holds four unit squares. Lift the handle to add layers and see how many unit cubes fill the solid.",
  "success": "Two layers give eight times the volume."
 },
 {
  "label": "Work backwards",
  "title": "Work backwards from an area nine times as large.",
  "intro": "You have seen how a length factor produces an area factor. Now calculate the length factor first, then resize the square to check it.",
  "success": "Your calculation matches the larger square."
 },
 {
  "label": "Reverse a volume",
  "title": "Find the length factor for 27 times the volume.",
  "intro": "Area involved two directions; volume involves three. Use the cube root to predict the length factor, then test it on the cube.",
  "success": "Your calculation matches the larger cube."
 },
 {
  "label": "Test the condition",
  "title": "Check what makes two solids similar.",
  "intro": "The width and depth have doubled, but the height has changed by a different factor. Adjust it until all three corresponding edge ratios agree.",
  "success": "All three edge ratios now agree."
 },
 {
  "label": "Experiment",
  "title": "Explore how size and shape change area and volume.",
  "intro": "Try larger scale factors, separate the layers or change the proportions. Keep readings when you find a comparison you want to return to.",
  "success": ""
 }
];
const s={k:1,height:3,separate:false,tiles:new Set(),layers:0,view:'solid',stretch:false,records:[],target:null};
function reset(){Object.assign(s,{k:1,height:3,tiles:new Set(),layers:0,view:'solid',stretch:false,records:[],target:null})}
function enter(){head(lesson[step].title,lesson[step].intro);s.target=null;s.separate=false;s.answer='';if(step===0)s.k=1;if(step===1){s.k=2;s.tiles=new Set()}if(step===2){s.k=2;s.layers=0}if(step===3||step===4)s.k=1;if(step===5){s.k=2;s.height=3}if(step===6){s.k=2;s.height=2;s.stretch=false;s.records=[];controls()}setupMathWork()}
function sceneHeight(){return mobile?(step===6?360:340):(step===6?450:360)}
function scaleSet(v){s.k=Math.round(v*10)/10;if(step===6&&!s.stretch)s.height=s.k;render()}
function cube(x,y,a,b,c,u,filled=true,parent=svg){const dx=u*.38,dy=-u*.28;const p=(i,j,k)=>[x+i*u+j*dx,y-j*-dy-k*u];const poly=(ps,fill)=>el('polygon',{points:ps.map(q=>p(...q).join(',')).join(' '),fill,stroke:filled?'var(--accent)':'var(--lab-line-strong)','stroke-width':1.4},undefined,parent);poly([[0,0,0],[a,0,0],[a,0,c],[0,0,c]],filled?'var(--soft)':'var(--lab-surface-muted)');poly([[a,0,0],[a,b,0],[a,b,c],[a,0,c]],filled?'var(--lab-concept-violet-fill)':'var(--lab-surface-muted)');poly([[0,0,c],[a,0,c],[a,b,c],[0,b,c]],filled?'var(--lab-concept-amber-fill)':'white');for(let i=1;i<a-.01;i++)line(...p(i,0,0),...p(i,0,c),{stroke:'var(--lab-concept-blue)','stroke-width':.8,opacity:.55},parent);for(let i=1;i<c-.01;i++)line(...p(0,0,i),...p(a,0,i),{stroke:'var(--lab-concept-blue)','stroke-width':.8,opacity:.55},parent);for(let z=1;z<c-.01;z++)line(...p(a,0,z),...p(a,b,z),{stroke:'var(--lab-concept-violet)','stroke-width':.8,opacity:.55},parent);for(let j=1;j<b-.01;j++){line(...p(a,j,0),...p(a,j,c),{stroke:'var(--lab-concept-violet)','stroke-width':.8,opacity:.55},parent);line(...p(0,j,c),...p(a,j,c),{stroke:'var(--lab-concept-blue)','stroke-width':.8,opacity:.55},parent)}for(let i=1;i<a-.01;i++)line(...p(i,0,c),...p(i,b,c),{stroke:'var(--lab-concept-blue)','stroke-width':.8,opacity:.55},parent);return p}
function rule(parts){const y=H-24;const gap=mobile?W/3:170,start=mobile?W/6:W/2-gap;parts.forEach(([label,value],i)=>{sourceLabel(['length-factor','area-factor','volume-factor'][i],start+i*gap,y-26,value,['Compare the scaled width with the one-unit reference. In the length view, this is the blue line’s length.','One corresponding square face scales in two directions: k × k = k². This is not the total surface area.','The current volume is width × depth × height: k × k × h. It equals k³ only when all three edge ratios match.'][i],'big accent','middle');text(start+i*gap,y,label,'small','middle')})}
function render(){clear();head(lesson[step].title,lesson[step].intro);const free=step===6;const mode=free?s.view:step===0?'length':step===1||step===3?'face':'solid';const x0=mobile?18:W*.18,x=mobile?W*.45:W*.52,y=H*.65;const k=s.k;
 if(mode==='length'){
  const yy=H*.43,xx=mobile?35:W*.24,unit=free?Math.min(mobile?90:185,(W-(mobile?35:W*.24)-25)/Math.max(2,k)):mobile?90:185;line(xx,yy-65,xx+unit,yy-65,{'stroke-width':6,stroke:'var(--lab-concept-slate)','stroke-linecap':'round'});sourceLabel('reference',xx+unit/2,yy-87,'1 unit','The original length is one unit. Divide the new length by this reference to find the length scale factor.','small','middle');line(xx,yy+45,xx+unit*2,yy+45,{class:'ghost'});line(xx,yy+45,xx+unit*k,yy+45,{'stroke-width':7,stroke:'var(--accent)','stroke-linecap':'round'});handle('scale',xx+unit*k,yy+45,{label:'Length scale factor',min:free?.5:1,max:free?5:2,value:k,increment:.1,set:scaleSet,fromPoint:p=>(p.x-xx)/unit});sourceLabel('length',xx+unit*k/2,yy+83,`${fmt(k)} ${k===1?'unit':'units'}`,'This is the current length of the blue line. It changes when you move the endpoint.','accent','middle');if(!free)text(xx+unit*2,yy+16,'2','small','middle');
 }else if(mode==='face'){
  const unit=free?Math.min(mobile?46:66,(W-(mobile?W*.4:W*.51)-25)/k,(H*.7-45)/k):mobile?46:step===1?88:66;const baseX=mobile?17:W*.19,baseY=H*.57;el('rect',{x:baseX,y:baseY-unit,width:unit,height:unit,fill:'var(--lab-surface-muted)',stroke:'var(--lab-concept-slate)'});sourceLabel('reference-area',baseX+unit/2,baseY+26,'1 unit²','The original square has side length 1 and area 1 × 1 = 1 square unit.','small','middle');const xx=mobile?W*.4:W*.51,yy=H*.7;const target=step===3?3:2;
  if(!free)el('rect',{x:xx,y:yy-unit*target,width:unit*target,height:unit*target,class:'ghost'});
  if(step===1){for(let r=0;r<2;r++)for(let c=0;c<2;c++){const id=r*2+c,g=el('g',{tabindex:0,role:'button','aria-label':`Unit square ${id+1}${s.tiles.has(id)?', filled':''}`,'data-control':`tile-${id}`,class:'clickable'});el('rect',{x:xx+c*unit+2,y:yy-(r+1)*unit+2,width:unit-4,height:unit-4,rx:3,fill:s.tiles.has(id)?'var(--lab-concept-blue-fill)':'white',stroke:s.tiles.has(id)?'var(--accent)':'var(--lab-line-strong)'},undefined,g);text(xx+(c+.5)*unit,yy-(r+.5)*unit+5,s.tiles.has(id)?'1':'＋',s.tiles.has(id)?'':'small','middle',g).style.fill=s.tiles.has(id)?'var(--lab-accent-ink)':'';g.onclick=()=>{s.tiles.add(id);render()};g.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();g.onclick()}}}sourceLabel('edge',xx+unit,yy+27,'2 units','Each side is twice the original length. The area uses this factor in two perpendicular directions.','small','middle');sourceLabel('area-count',xx+unit,yy-unit*2-22,`${s.tiles.size} unit squares`,'Count the filled unit squares to find the new area. Because the reference area is one, this count is also the area factor.','accent','middle')}
  else{el('rect',{x:xx,y:yy-unit*k,width:unit*k,height:unit*k,fill:'var(--soft)',stroke:'var(--accent)','stroke-width':2});for(let t=1;t<k;t++){line(xx+t*unit,yy,xx+t*unit,yy-unit*k,{stroke:'var(--lab-concept-blue)','stroke-width':1});line(xx,yy-t*unit,xx+unit*k,yy-t*unit,{stroke:'var(--lab-concept-blue)','stroke-width':1})}handle('scale',xx+unit*k,yy-unit*k,{label:'Length scale factor',min:.5,max:free?5:3,value:k,increment:.1,set:scaleSet,fromPoint:p=>(p.x-xx)/unit});sourceLabel('length',xx+unit*k/2,yy+28,`${fmt(k)} units`,'Every edge of this square scales by the same factor relative to the one-unit reference.','accent','middle');sourceLabel('area-count',xx+unit*k/2,yy-unit*k-24,`${fmt(k*k,2)} unit²`,'The square’s area is side × side. The square root reverses this relationship.','accent','middle')}
 }else{
  const baseY=free?H-135:H-78,xx=mobile?W*.43:W*.53,unit=free?Math.min(mobile?39:62,(W-xx-24)/(1.38*k),(baseY-40-10*Math.max(0,Math.ceil(s.stretch?s.height:k)-1))/((s.stretch?s.height:k)+.28*k)):mobile?39:step===2?76:62;const h=step===5||free&&s.stretch?s.height:k;
  cube(x0,baseY,1,1,1,unit,false);sourceLabel('reference',x0+unit*.65,baseY+29,'Reference: 1','Each edge of the original cube is one unit. Its volume is one cubic unit.','small','middle');
  if(step===2){cube(xx,baseY,2,2,2,unit,false);if(s.layers>0)cube(xx,baseY,2,2,s.layers,unit);handle('layers',xx+unit*2.8,baseY-s.layers*unit,{label:'Layers of four unit cubes',min:0,max:2,value:s.layers,increment:1,set:v=>{s.layers=Math.round(v);render()},fromPoint:p=>(baseY-p.y)/unit});sourceLabel('layers',xx+unit,baseY-unit*3.1,`${s.layers} ${s.layers===1?'layer':'layers'}`,'Each complete layer has four unit cubes. The total volume is cubes per layer × number of layers.','accent','middle');sourceLabel('layer-edge',xx+unit,H-20,'Layer: 2 × 2','A layer is two cubes wide and two cubes deep. Multiplying these counts gives four cubes in one layer.','small','middle');sourceLabel('volume-count',xx+unit,baseY+30,`${s.layers*4} unit cubes`,'Count all the unit cubes to find the volume. Two layers contain eight cubes.','accent','middle')}
  else{const gap=free&&s.separate?10:0;let p;if(free){for(let j=0;j<h;j++){const layer=el('g',{'data-layer':j});cube(xx,baseY-j*(unit+gap),k,k,Math.min(1,h-j),unit,true,layer);}p=(i,j,z)=>[xx+i*unit+j*unit*.38,baseY-j*unit*.28-z*unit-gap*Math.max(0,Math.ceil(h)-1)]}else p=cube(xx,baseY,k,k,h,unit);if(!free)sourceLabel('width',xx+unit*k/2,baseY+28,fmt(k),'This edge is the width, compared with the one-unit reference.','accent','middle');sourceLabel('height',xx-14,baseY-unit*h/2,fmt(h),'This is the height. Similarity requires its scale factor to match the width and depth.','accent','end');const stretch=step===5;handle(stretch?'height':'scale',...p(k,0,h),{label:stretch?'Height scale factor':'Common length scale factor',min:.5,max:free?5:3,value:stretch?h:k,increment:.1,set:v=>{if(stretch)s.height=Math.round(v*10)/10;else{s.k=Math.round(v*10)/10;if(free&&!s.stretch)s.height=s.k}render()},fromPoint:p=>stretch?(baseY-p.y-gap*Math.max(0,Math.ceil(h)-1))/unit:(p.x-xx)/unit});if(free){const gapOffset=gap*Math.max(0,Math.ceil(h)-1);handle('height',xx-24,baseY-h*unit-gapOffset,{label:'Independent height',help:'Drag vertically to change only the height. Match it to the width to restore similarity.',min:.5,max:5,value:h,valueText:fmt(h)+' times the reference height',increment:.1,set:v=>{s.height=Math.round(v*10)/10;s.stretch=Math.abs(s.height-s.k)>.01;render()},fromPoint:p=>(baseY-p.y-gapOffset)/unit})}if(step===4)text(xx+unit*k*.65,baseY-unit*k*1.28-23,`${fmt(k**3,2)} unit³`,'accent','middle');if(step===5)sourceLabel('depth',xx+unit*k*.7,baseY-unit*Math.max(3,h)-34,'Depth ×2','The depth is twice the reference depth. Compare this ratio with the width and height.','small','middle')}
 }
 if(step===3||step===4)sourceLabel('target-factor',x0,28,step===3?'Target area ×9':'Target volume ×27',step===3?'The target square has nine times the original area. Use a square root to find its length factor.':'The target cube has 27 times the original volume. Use a cube root to find its length factor.');
 if(step===0)feedback(k===2?'The length scale factor is 2.':'The fixed reference length is 1 unit.',k===2);
 if(step===1)feedback(s.tiles.size===4?'Two rows of two squares: 2 × 2 = 4 times the area.':`${s.tiles.size} of the four unit squares placed.`,s.tiles.size===4);
 if(step===2)feedback(s.layers===2?'Two layers of four cubes: 2 × 2 × 2 = 8 times the volume.':'Each new layer adds four cubes. The width and depth stay doubled.',s.layers===2);
 if(step===3)feedback(k===3?'Length ×3 gives area ×9. The reverse step is √9 = 3.':'A square with area 9 needs the same number of units in each direction.',k===3);
 if(step===4)feedback(k===3?'Three layers of nine cubes: 27. Work backwards: ∛27 = 3.':'A volume factor uses all three dimensions. Try a common length scale.',k===3);
 if(step===5)feedback(s.height===2?'All three edge ratios agree. Similarity needs a common scale.':`The height scales by ${fmt(s.height)}; the other edges scale by 2.`,s.height===2);
 if(free){const h=s.stretch?s.height:k,A=k*k,V=k*k*h;rule([['length factor',`×${fmt(k)}`],['face-area factor',`×${fmt(A,2)}`],['volume factor',`×${fmt(V,2)}`]]);const same=Math.abs(h-k)<.001;feedback(s.target?(Math.abs((s.target.kind==='area'?A:V)-s.target.value)<.06?'Target reached. Record this set of factors.':`Target: ${s.target.kind} factor ×${fmt(s.target.value,2)}.`):same?'Similar: length k, face area k², volume k³.':'Unequal edge ratios: face area k², volume k²h. This solid is not similar.',false);table(['Reading','Edge k','Height h','Face k²','Volume k²h'],s.records.map((r,i)=>[i+1,...r.map(v=>fmt(v,2))]))}
 updateMathWork();endDraw();
}
function controls(){
 const c=$('controls');c.innerHTML='';const label=document.createElement('label');label.textContent='View ';const view=document.createElement('select');view.id='mathView';view.setAttribute('aria-label','Model view');for(const [value,name]of [['length','Length'],['face','Square'],['solid','Solid']]){const option=document.createElement('option');option.value=value;option.textContent=name;view.appendChild(option)}view.value=s.view;view.onchange=()=>{s.view=view.value;controls();render()};label.appendChild(view);c.appendChild(label);
 if(s.view==='solid')button(s.separate?'Join layers':'Separate layers',()=>{s.separate=!s.separate;controls();render();if(!reduced.matches)svg.querySelectorAll('[data-layer]').forEach(node=>node.animate([{transform:`translateY(${Number(node.dataset.layer)*(s.separate?10:-10)}px)`},{transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.2,.7,.25,1)'}))},{class:'choice','aria-pressed':s.separate});
 button('Record reading',()=>{const k=s.k,h=s.stretch?s.height:k;s.records.push([k,h,k*k,k*k*h]);s.records=s.records.slice(-6);controls();render()});
 button('New target',()=>{s.stretch=false;s.view='solid';const ks=[1.5,4,5,.5],n=(s.target?.index??-1)+1,k=ks[n%ks.length];s.target={kind:n%2?'volume':'area',value:n%2?k**3:k*k,index:n};controls();render()});
 if(s.records.length)button('Clear readings',()=>{s.records=[];controls();render()});
}
start();
function setupMathWork(){
 if(step===6){$('working').hidden=true;return}
 if(step===0)workSetup('Calculate a length scale factor',workRow('new length ÷ reference length',workOutput('lengthWork')));
 if(step===1)workSetup('Connect the side lengths to the area',workRow('two scaled directions',workOutput('areaWork'))+workRow('reverse the calculation',workOutput('areaReverse')));
 if(step===2)workSetup('Connect the layers to the volume',workRow('unit cubes in one layer',workOutput('layerWork'))+workRow('cubes per layer × layers',workOutput('volumeWork'))+workRow('reverse the calculation',workOutput('volumeReverse')));
 if(step===3||step===4){workSetup('Calculate the length scale',workRow(step===3?'square root of the area factor':'cube root of the volume factor',`k = ${step===3?'√':'∛'}(${term('target-factor',step===3?9:27)}) = <input id="scaleAnswer" type="number" step="0.1" inputmode="decimal" aria-label="Calculated length scale factor">`),'Use the calculation to position the corner.',true);$('scaleAnswer').oninput=e=>{s.answer=e.target.value;render()}}
 if(step===5)workSetup('Compare the corresponding edge ratios',workRow('width',workOutput('widthWork'))+workRow('height',workOutput('heightWork'))+workRow('depth',workOutput('depthWork')));
 workingExplanation(['Divide the new length by the original length. A scale factor of 2 means every corresponding length is doubled.','Area scales in two perpendicular directions: k × k = k². A square root takes an area factor back to a length factor.','Volume scales in three directions. First count cubes in one layer, then multiply by the number of layers. A cube root reverses the complete volume factor.','Take the square root of the given area factor to find the common length factor. Then check the result against the model.','Take the cube root of the given volume factor to find the common length factor. Then check all three dimensions on the model.','Divide each new edge by its corresponding original edge. The solids are similar only when all three ratios are equal.'][step]);
}
function updateMathWork(){
 if(step===0)workFormula('lengthWork',`${term('length',fmt(s.k))} ÷ ${term('reference',1)} = ${result('scale-factor',fmt(s.k),'The length scale factor compares new length with the original.')}`);
 if(step===1){workFormula('areaWork',`${term('edge',2)} × ${term('edge',2)} = ${s.tiles.size===4?result('area-factor',4,'Two doubled directions give an area factor of four.'):'…'}`);workFormula('areaReverse',s.tiles.size===4?`√${term('area-count',4)} = ${result('scale-factor',2,'The square root of the area factor gives the length factor.')}`:'√(area factor) = length factor')}
 if(step===2){workFormula('layerWork',`${term('layer-edge',2)} × ${term('layer-edge',2)} = ${result('layer-area',4,'There are four unit cubes in each complete layer.')}`);workFormula('volumeWork',`${term('layer-area',4)} × ${term('layers',s.layers)} = ${result('volume-factor',s.layers*4,'Multiply cubes per layer by the layer count to find the total volume.')}`);workFormula('volumeReverse',s.layers===2?`∛${term('volume-count',8)} = ${result('scale-factor',2,'The cube root of eight gives the common length factor, two.')}`:'∛(volume factor) = length factor')}
 if(step===3||step===4){const answered=s.answer!=='',correct=answered&&Math.abs(Number(s.answer)-3)<.01,ok=correct&&s.k===3;$('scaleAnswer').className=answered?(correct?'good':'bad'):'';workState(answered?(correct?'good':'bad'):'needed');feedback(ok?'The calculation and the model agree: k = 3.':!answered?'Calculate k, then set the model to the same factor.':!correct?`Use the ${step===3?'square':'cube'} root of the given factor.`:'Now resize the model to k = 3.',ok,answered&&!correct)}
 if(step===5)for(const [id,value]of [['width',2],['height',s.height],['depth',2]])workFormula(id+'Work',`${term(id,fmt(value))} ÷ ${term('reference',1)} = ${result(id+'-ratio',fmt(value),'This ratio compares the new edge with the matching reference edge.')}`);
}
