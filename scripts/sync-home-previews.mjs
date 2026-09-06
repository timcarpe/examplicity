// Build-time ports of real lab components. No lab application runs on the homepage.
// Regenerate after changing a featured lab: node scripts/sync-home-previews.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import postcss from 'postcss';

const output = 'app/home-previews';
await mkdir(output, { recursive: true });
const definitions = [
  ['cpu', 'computer-science/fetch-decode-execute', '<div class="cpu-shell">', 'div'],
  ['geometry', 'mathematics/coordinate-distance-midpoint-perpendicular', '<div class="map-frame">', 'div'],
  ['patterns', 'mathematics/sequence-patterns-differences', '<div class="canvas" id="canvas"', 'div'],
  ['graph', 'computer-science/dijkstra-a-star-graph-search', '<div class="graph-shell"', 'div'],
  ['circle', 'mathematics/circle-theorem-constraint-network', '<div class="svg-wrap">', 'div'],
];

function component(source, start, tag) {
  const offset = source.indexOf(start);
  if (offset < 0) throw new Error(`Missing component: ${start}`);
  const tags = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
  tags.lastIndex = offset;
  let depth = 0;
  for (let match; (match = tags.exec(source));) {
    depth += match[1] ? -1 : 1;
    if (!depth) return source.slice(offset, tags.lastIndex);
  }
  throw new Error(`Unclosed ${tag}`);
}

function functions(source) {
  const code = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
  const ast = ts.createSourceFile('lab.js', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const found = new Map();
  function walk(node) {
    if (ts.isFunctionDeclaration(node) && node.name) found.set(node.name.text, node.getText(ast));
    ts.forEachChild(node, walk);
  }
  walk(ast);
  return name => {
    if (!found.has(name)) throw new Error(`Missing source function ${name}`);
    return found.get(name);
  };
}

for (const [name, slug, start, tag] of definitions) {
  const source = await readFile(`labs-src/${slug}/lab.html`, 'utf8');
  // Published output contains the source's shared stylesheet dependencies in cascade order.
  const published = await readFile(`public/labs/${slug}.html`, 'utf8');
  const fn = functions(source);
  let html = component(source, start, tag);
  // The coordinate frame's cue is outside the map SVG: it is not part of the port.
  if (name === 'geometry') html = `<div class="map-frame">${component(source, '<svg id="map"', 'svg')}</div>`;
  const sourceClasses = published.match(/<body\b[^>]*\bclass="([^"]*)"/)?.[1]?.split(/\s+/) || [];
  const wrapperClasses = [...new Set(['lab-adopt-v3', ...sourceClasses,
    ...(name === 'cpu' ? ['lab-computing', 'computing-fetch-decode-execute'] : [])])];
  html = `<div class="${wrapperClasses.join(' ')}">${html}</div>`;
  const prefix = `home-${name}-`;
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  for (const id of ids) {
    html = html.replaceAll(`id="${id}"`, `id="${prefix}${id}"`).replaceAll(`url(#${id})`, `url(#${prefix}${id})`);
  }
  html = html.replace(/\b(aria-labelledby|aria-describedby|for)="([^"]+)"/g,
    (_, attribute, value) => `${attribute}="${value.split(/\s+/).map(id => ids.includes(id) ? prefix + id : id).join(' ')}"`);
  html = html.replace(/tabindex="[^"]*"/g, 'tabindex="-1"');

  const classNames = new Set([...html.matchAll(/class="([^"]+)"/g)].flatMap(m => m[1].split(/\s+/)));
  // Classes created by the source renderers rather than literal source markup.
  for (const c of 'lab-svg-value-surface active changed good show equal a b unlocked axis axis-label grid-minor tick-label sample ref-grid ref-tile last-growth grid-cell build-ghost placed-tile previous-pattern-label loose-tile used drag-valid'.split(' ')) classNames.add(c);
  if (name === 'circle') for (const c of 'grid-line circle-main centre-dot label small muted diameter chord-a radius construction wedge angle-value right-angle fixed-point drag-point b c a ghost-point gold stage-note trace low high good'.split(' ')) classNames.add(c);
  const css = postcss.parse([...published.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]).join('\n'));
  css.walkComments(n => n.remove());
  css.walkAtRules(n => {
    // Each port has fixed desktop source dimensions and scales uniformly as one piece.
    if (['media', 'container', 'import'].includes(n.name)) n.remove();
  });
  css.walkRules(rule => {
    const selectors = rule.selectors.filter(selector => {
      if (/^(?::root|html|body|\*)$/.test(selector.trim())) return true;
      const classes = [...selector.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map(m => m[1]);
      const selectorIds = [...selector.matchAll(/#([a-zA-Z_][\w-]*)/g)].map(m => m[1]);
      return (classes.length ? classes.some(c => classNames.has(c)) : selectorIds.every(id => ids.includes(id)))
        && !/\.computing-(?!fetch-decode-execute)[\w-]+/.test(selector)
        && !/(?:^|[ >])(?:main|header|footer|h1|h2|a)(?:$|[ .:#>])/.test(selector);
    });
    if (!selectors.length) return rule.remove();
    rule.selectors = selectors.map(selector => {
      selector = selector.replace(/body(?=\.)/g, '').replace(/(^|[\s>+~])(:root|html|body)(?=$|[\s.:#>+~])/g, '$1:host');
      for (const id of ids) selector = selector.replace(new RegExp(`#${id}(?![\\w-])`, 'g'), `#${prefix}${id}`);
      return selector;
    });
  });
  css.walkDecls(declaration => {
    for (const id of ids) declaration.value = declaration.value.replaceAll(`url(#${id})`, `url(#${prefix}${id})`);
  });
  // Styling is isolated in a shadow root; identifiers are also namespaced for SVG references.
  const asset = { source: `labs-src/${slug}/lab.html`, sha256: createHash('sha256').update(source).digest('hex'), html,
    css: css.toString() + `\n:host{display:block;margin:0;background:transparent;font-size:${name === 'geometry' ? 14 : 16}px} *{transition:none!important;animation-play-state:paused!important;animation-delay:calc(var(--preview-animation-time,0) * -1ms)!important}` };
  await writeFile(`${output}/${name}.json`, JSON.stringify(asset));

  const common = `const $ = id => root.getElementById('${prefix}' + id);\n`;
  let body;
  if (name === 'cpu') {
    const copied = ['displayAddress', 'isInstruction', 'displayInstruction', 'visibleOp', 'visibleDecodedInstruction', 'parseInstruction', 'clearHighlights', 'highlightComponent', 'activatePath', 'activateControl', 'displayRegister', 'fitSvgText', 'renderRegisters', 'enqueueFetch'].map(fn).join('\n');
    // Exact LOADI branch from enqueueExecute; other instructions are not in this excerpt.
    const execute = fn('enqueueExecute');
    const load = execute.slice(execute.indexOf('if(op==="LOADI")'), execute.indexOf('if(op==="ADDI"'));
    body = `${common}
const isSimpleMode=()=>true;
const currentProgram=()=>({simpleLabels:{0:'I1',1:'I2',2:'I3',3:'I4',10:'RESULT'}});
let state, currentInstruction, microQueue;
const memory={0:'LOADI 8'};
// External RAM/bus presentation is outside the crop. CPU paths still replay unchanged.
const activateBus=()=>{};
const highlightRam=()=>{};
${copied.replaceAll('document.querySelectorAll', 'root.querySelectorAll').replaceAll('el.id===', 'el.id.replace("home-cpu-", "")===')}
// Exact shared lab value-surface fitting, driven synchronously by the preview clock.
const values=[...root.querySelectorAll('svg text[data-lab-value]')].map(value=>{
  let surface=value.previousElementSibling;
  if(!surface?.classList.contains('lab-svg-value-surface')){surface=document.createElementNS('http://www.w3.org/2000/svg','rect');surface.setAttribute('class','lab-svg-value-surface');surface.setAttribute('rx','5');surface.setAttribute('aria-hidden','true');value.before(surface);}
  return {value,surface};
});
function fitValues(){for(const {value,surface} of values){value.style.removeProperty('--lab-value-fit-size');const css=getComputedStyle(value),px=Number(css.getPropertyValue('--lab-value-padding-x'))||7,py=Number(css.getPropertyValue('--lab-value-padding-y'))||3;let b=value.getBBox();const component=[...value.parentElement.children].find(el=>el.tagName==='rect'&&!el.classList.contains('lab-svg-value-surface'));if(component){const box=component.getBBox(),centre=b.x+b.width/2,available=2*Math.min(centre-box.x,box.x+box.width-centre)-2*px-8;if(available>0&&b.width>available){value.style.setProperty('--lab-value-fit-size',parseFloat(css.fontSize)*available/b.width+'px');b=value.getBBox();}}Object.entries({x:b.x-px,y:b.y-py,width:b.width+2*px,height:b.height+2*py}).forEach(([k,v])=>surface.setAttribute(k,v));}}
function enqueueExecute(){const {op,arg}=currentInstruction;${load}}
let completed=-1;
function reset(){state={PC:0,MAR:null,MDR:null,CIR:null,ACC:0,CU:'waiting',ALU:'idle'};currentInstruction=null;microQueue=[];completed=-1;clearHighlights();renderRegisters();fitValues();enqueueFetch();}
reset();
return time=>{const target=Math.max(-1,Math.min(6,Math.floor((time-1400)/1150)));if(target<completed)reset();while(completed<target){if(!microQueue.length)enqueueExecute();clearHighlights();microQueue.shift().apply();activatePath('wireClockCu');renderRegisters();fitValues();completed++;}};
`;
  } else if (name === 'geometry') {
    const helpers = ['sx','sy','setLine','setPoint','dist','mid','gcd','fmt','signed','frac','gradient','clipLine','pointOn','targetAngle','baseData','initGrid'].map(fn).join('\n');
    let render = fn('render').replace('validateCalculations(data);','').replace('evaluateProgress(success);','');
    render = render.slice(0, render.indexOf('updateCalcUI(data);')) + '}';
    let probe = fn('updateProbe');
    probe = probe.slice(0, probe.indexOf("const ps=$('probeState')")) + '}';
    body = `${common}
const plot={left:28,top:28,size:664,xMin:-10,xMax:10,yMin:-10,yMax:10};
const scale=plot.size/(plot.xMax-plot.xMin),sampleFractions=[.14,.26,.38,.50,.62,.74,.86],equalTol=.22,reduceMotion=false;
const state={A:{x:-4,y:-1},B:{x:4,y:5},anchor:{x:0,y:2},angle:Math.atan2(6,8)+Math.PI/2,checks:{},samples:[],endpointsUnlocked:false};
const requiredKeys=()=>[];
const el=Object.fromEntries(${JSON.stringify(ids.filter(id => id !== 'map'))}.map(id=>[id,$(id)]));
${helpers}
${render}
${probe}
initGrid();render();updateProbe(0);
return time=>updateProbe(Math.min(8500,Math.max(0,time-1400)));
`;
  } else if (name === 'patterns') {
    const helpers = ['bounds','squareShape','makeRefGrid','renderReference','maxShapeForFamily','buildAnchorFor','buildKeyFromModel','renderGrid','targetGrowthSet','ghostSet','renderBuild','renderTray','validTargetCell'].map(fn).join('\n');
    body = `${common}
const GRID_COLS=12,GRID_ROWS=7,MAX_TILES=16;
const key=(x,y)=>\x60\x24{x},\x24{y}\x60,parseKey=k=>k.split(',').map(Number),diffSet=(a,b)=>new Set([...b].filter(v=>!a.has(v)));
const family=()=>({id:'quadratic',shape:squareShape,maxStage:4});
const state={currentStage:2,placed:new Map(),notice:null};
const bindTile=()=>{};
// Ported cells are inert; original interaction handlers are not installed.
${helpers.replace("c.addEventListener('click',()=>{if(selectedTile)placeSelectedAt(c.dataset.cell)});",'')}
let count=0,finished=false,referenceMotion=[];
renderReference();renderGrid();renderBuild();renderTray();
const targets=[...targetGrowthSet()];
return time=>{
  const target=Math.min(targets.length,Math.max(0,Math.floor((time-1400)/1400)+1));
  if(target<count){referenceMotion.forEach(a=>a.cancel());referenceMotion=[];state.currentStage=2;state.placed.clear();count=0;finished=false;renderReference();renderBuild();renderTray();}
  if(target!==count){while(count<target){const cell=targets[count];if(!validTargetCell(cell))throw new Error('Invalid preview tile placement');state.placed.set(cell,'tile-'+(count+1));state.notice=null;count++;}renderBuild();renderTray();}
  // completeStage's original 420ms snap and 450ms transfer, on the shared pauseable clock.
  if(count===targets.length&&!finished){
    $('dropMessage').className='drop-message good';$('dropMessage').innerHTML='<strong>Stage 3 complete.</strong> You added 5 squares.';
    root.querySelectorAll('.placed-tile').forEach(n=>{n.classList.add('snap');n.style.setProperty('--preview-animation-time',String(time-7000));});
    if(time>=7420){
      const reference=$('referenceStage').querySelector('.ref-grid');
      if(!referenceMotion.length){referenceMotion=[reference.animate([{transform:'none'},{transform:'translateX(-32px) scale(.92)'}],{duration:450,easing:'cubic-bezier(.2,.75,.2,1)',fill:'forwards'}),reference.animate([{opacity:1},{opacity:0}],{duration:250,easing:'ease',fill:'forwards'})];referenceMotion.forEach(a=>a.pause());}
      referenceMotion.forEach(a=>a.currentTime=time-7420);
      $('buildStageShell').classList.add('fly-left');$('buildStageShell').style.setProperty('--preview-animation-time',String(time-7420));
    }
    if(time>=7870){state.currentStage=3;state.placed.clear();$('buildStageShell').classList.remove('fly-left');renderReference(true);renderBuild();renderTray();finished=true;}
  }
};
`;
  } else if (name === 'graph') {
    const constants=source.slice(source.indexOf('const nodeIds='),source.indexOf('const $=LabKit.dom.byId;'));
    const helpers=['edgeKey','currentEdges','neighbours','priority','frontierNodes','minimumCandidates','createSearch','buildRoute','previousRouteEdges','renderGraph'].map(fn).join('\n');
    body=`${common}
${constants}
const graphNodes=[...root.querySelectorAll('.node[data-node]')],graphEdges=[...root.querySelectorAll('.edge[data-edge]')],graphWeights=[...root.querySelectorAll('.edge-weight')];
const edgeCosts=Object.fromEntries(baseEdges.map(([a,b,w])=>[edgeKey(a,b),w])),edgeNames=Object.fromEntries(baseEdges.map(([a,b])=>[edgeKey(a,b),a+'–'+b]));
const costEditingUnlocked=false,selectedCostEdge=null,previousExperiment=null,revealMinimum=false,busy=false;
let search,inspected=null,activeEdge=null,activeNeighbour=null,scannedEdges=new Set();
${helpers}
// settleAndRelax's source state transitions, scheduled on the shared preview clock.
function* steps(){
  while(!search.complete){const id=minimumCandidates()[0];if(!id)return;
    inspected=id;activeEdge=null;activeNeighbour=null;scannedEdges=new Set();search.frontier.delete(id);search.settled.push(id);search.current=id;yield 450;inspected=null;
    if(id==='G'){search.route=buildRoute();search.complete=true;return;}
    for(const item of neighbours(id).filter(({id:n})=>!search.settled.includes(n))){activeEdge=item.edge;activeNeighbour=item.id;scannedEdges.add(item.edge);const old=search.distances[item.id],proposed=search.distances[id]+item.weight;yield 560;if(proposed<old){search.distances[item.id]=proposed;search.previous[item.id]=id;search.frontier.add(item.id);yield 360;}}
    activeEdge=null;activeNeighbour=null;search.current=null;yield 450;
  }
}
let iterator,nextAt,last=0;
function reset(){search=createSearch('astar');inspected=null;activeEdge=null;activeNeighbour=null;scannedEdges=new Set();iterator=steps();nextAt=1000;renderGraph();}
reset();return time=>{if(time<last)reset();last=time;while(time>=nextAt){const step=iterator.next();renderGraph();if(step.done){nextAt=Infinity;break;}nextAt+=step.value;}};
`;
  } else {
    const constants=source.slice(source.indexOf('const TAU='),source.indexOf('function lineDiff'))
      .replace('SNAP_DEG=.65, ', '')
      .replace(/^const (?:ccw|angleOf|mid)=.*;\r?\n/gm, '');
    const helpers=['svgLine','svgCircle','svgText','mathArcPoints','arcPath','wedge','rightMark','grid','outerTraceSegment','trace90','pointLabel','renderBase','rng','pick','safeAngle'].map(fn).join('\n');
    const problem=fn('makeProblem');
    const scenario=problem.slice(problem.indexOf("if(type==='semicircle'){")+"if(type==='semicircle'){".length,problem.indexOf('}else{'));
    const geometry=fn('semicircleGeometry');
    const draw=geometry.slice(0,geometry.indexOf("$('legend')"))+'}';
    body=`${common}
const svg=$('geometry');
${constants}
${helpers}
const r=rng(1),p={};${scenario}
const s={B:p.targetB,C:p.C,testTravel:0,alignedOnce:true},current=()=>p,session=()=>s;
${draw}
svg.style.setProperty('--lab-chart-text-size','14px');
semicircleGeometry();
return time=>{const motion=Math.max(0,time-1000)/1100;s.C=norm(p.C+Math.sin(motion)*22*RAD);s.testTravel=Math.min(50*RAD,Math.max(0,time-1000)/100*RAD);semicircleGeometry();};
`;
  }
  const header = `${name === 'geometry' ? '/* eslint-disable @typescript-eslint/no-unused-vars */\n' : ''}// Generated by scripts/sync-home-previews.mjs from ${asset.source}.\n// Source rendering functions are preserved; only UI orchestration outside the excerpt is omitted.\n`;
  await writeFile(`${output}/${name}.js`, `${header}export function mount(root) {\nconst update=(()=>{\n${body}\n})();\nlet lastTime;\nreturn time=>{if(time===lastTime)return;lastTime=time;root.host.style.setProperty('--preview-animation-time',String(time));update(time);};\n}\n`);
}
console.log('Generated five faithful homepage component ports.');
