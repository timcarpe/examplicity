const lesson = [
  {label:'Tilt', title:'Make the rails run in the same direction.', intro:'Drag Tilt to turn the amber rail. Then move the carriage to both ends and compare the gap.', success:'The gap stays constant.'},
  {label:'Slide', title:'Keep the direction. Move the rail through P.', intro:'Drag Slide until the amber rail passes through P(0, 2). Check both ends with the carriage.', success:'Sliding changes the intercept, not the gradient.'},
  {label:'Describe', title:'Write an equation for the amber rail.', intro:'Use the marked coordinates to enter m and c. Test your equation, then compare it at both ends.', success:'One equation describes the whole rail.'},
  {label:'Falling rail', title:'Build a rail through both mounting points.', intro:'Use Tilt and Slide to reach A(−2, 3) and B(2, 1). Write its equation and test both ends.', success:'Both points and the equation agree.'},
  {label:'Level rail', title:'Build a level rail through both mounts.', intro:'Place the rail through A(−2, −2) and B(2, −2). Enter its gradient and intercept, then test.', success:'A horizontal line has zero gradient.'},
  {label:'Vertical rail', title:'Slide a vertical rail through P.', intro:'Reach P(2, 1), then choose which coordinate stays constant. Test the equation along the rail.', success:'A vertical line keeps x constant.'},
  {label:'Experiment', title:'Compare lines of your own.', intro:'Tilt or slide the rail, move the carriage and save a reading. Select a saved line to compare it.', success:''}
];
const s = {mode:'linear',m:1,c:-1,k:-1,probe:0,visitedLow:null,visitedHigh:null,answerM:'',answerC:'',axis:'',answerK:'',tested:false,invalid:false,records:[],comparison:null};
function currentRail() { return {mode:s.mode,m:s.m,c:s.c,k:s.k}; }
function targetRail() {
  return [
    {mode:'linear',m:.5,c:-1}, {mode:'linear',m:.5,c:2}, {mode:'linear',m:.5,c:1},
    {mode:'linear',m:-.5,c:2}, {mode:'linear',m:0,c:-2}, {mode:'vertical',k:2}
  ][step] || null;
}
function referenceRail() { return step===0?{mode:'linear',m:.5,c:1}:step===1?{mode:'linear',m:.5,c:0}:null; }
function predictedRail() {
  if (step===5) {
    const k=railNumber(s.answerK);
    return k===null||!['x','y'].includes(s.axis)?null:s.axis==='x'?{mode:'vertical',k}:{mode:'linear',m:0,c:k};
  }
  const m=railNumber(s.answerM),c=railNumber(s.answerC);
  return m===null||c===null?null:{mode:'linear',m,c};
}
function needsEquation() { return step>=2 && step<=5; }
function geometryMatches() { return step===0?railParallel(currentRail(),targetRail()):railSame(currentRail(),targetRail()); }
function comparedBothEnds() { return s.visitedLow!==null&&s.visitedLow<=-2&&s.visitedHigh>=2; }
function clearTravel() { s.visitedLow=null;s.visitedHigh=null; }
function invalidateRail() { s.tested=false;s.invalid=false;clearTravel(); }
function setRailValue(key,value) {
  const increment=key==='m'?.25:.5;
  const next=Math.round(value/increment)*increment;
  if(s[key]!==next){s[key]=next;invalidateRail();}
  render();
}
function setProbe(value) {
  s.probe=Math.round(value*4)/4;
  if(!needsEquation()||s.tested) {
    s.visitedLow=s.visitedLow===null?s.probe:Math.min(s.visitedLow,s.probe);
    s.visitedHigh=s.visitedHigh===null?s.probe:Math.max(s.visitedHigh,s.probe);
  }
  render();
}
function reset() { Object.assign(s,{mode:'linear',m:1,c:-1,k:-1,probe:0,visitedLow:null,visitedHigh:null,answerM:'',answerC:'',axis:'',answerK:'',tested:false,invalid:false,records:[],comparison:null,helpLevel:0,helpOpen:false}); }
function enter() {
  invalidateRail();Object.assign(s,{probe:0,answerM:'',answerC:'',answerK:'',axis:''});
  const initial=[{m:1,c:-1},{m:.5,c:-1},{m:.5,c:1},{m:.5,c:0},{m:.5,c:-1},{k:-1},{m:.5,c:1,k:0}][step];
  Object.assign(s,initial,{mode:step===5?'vertical':'linear'});
  if(step===6){s.records=[];s.comparison=null;}
  controls();
}
function restoreView() { controls(); }
function inputHtml(id,label) { return `<input type="text" inputmode="text" autocomplete="off" spellcheck="false" id="${id}" aria-label="${label}" placeholder="${id==='gradientInput'?'m':id==='interceptInput'?'c':'value'}" maxlength="20">`; }
function controls() {
  $('context').replaceChildren();$('controls').replaceChildren();$('working').hidden=true;
  if(step===1) workSetup('Read the gradient, then the intercept',workRow('vertical change ÷ horizontal change',workOutput('gradientWork'))+workRow('where x = 0',workOutput('interceptWork')));
  if(needsEquation()) {
    const body=step===5?
      workRow('constant-coordinate equation','<select id="axisInput" aria-label="Constant coordinate"><option value="">Choose x or y</option><option value="x">x</option><option value="y">y</option></select> = '+inputHtml('constantInput','Constant coordinate value')):
      workRow('your equation',`y = ${inputHtml('gradientInput','Predicted gradient m')} x + ${inputHtml('interceptInput','Predicted intercept c')}`);
    workSetup('Predict, then compare',body,step===5?'Choose the coordinate, not the direction of movement.':'Decimals and fractions are accepted, including negative values.',true);
    $('traceWorking').hidden=true; // No supplied numerical substitution in these transfer cases.
    const fields=step===5?[['constantInput','answerK'],['axisInput','axis']]:[['gradientInput','answerM'],['interceptInput','answerC']];
    fields.forEach(([id,key])=>{const input=$(id);input.value=s[key];input.addEventListener(id==='axisInput'?'change':'input',()=>{s[key]=input.value;invalidateRail();render();});});
    workAction('Test equation',()=>{s.invalid=!predictedRail();s.tested=!s.invalid;clearTravel();render();});
  }
  if(step===6) {
    const label=document.createElement('label');label.textContent='Rail ';
    const select=document.createElement('select');select.id='railMode';select.setAttribute('aria-label','Rail orientation');
    select.innerHTML='<option value="linear">Tilt and slide</option><option value="vertical">Vertical</option>';select.value=s.mode;
    select.onchange=()=>{s.mode=select.value;invalidateRail();s.probe=0;controls();render();};label.appendChild(select);$('controls').appendChild(label);
    button('Record reading',()=>{rememberReading({...currentRail(),probe:s.probe,coordinate:railPoint(currentRail(),s.probe)});render();});
    button('Clear readings',clearReadings);
  }
  setHelp(railHints());
}
function railHints() {
  const examples={
    tilt:[{text:'Compare the amber rail with the blue reference at the left and right ends. Does the gap change?',keys:['gap']},{text:'Tilt changes the vertical rise while the horizontal run stays fixed. Parallel rails have the same gradient.',keys:['rise','run']},{text:'A different rail rises 2 units over a run of 4. Its gradient is 2 ÷ 4 = 0.5. Sliding it does not change that ratio.',example:true}],
    equation:[()=>({text:step===3?'Both mounts matter. Your line can pass through B yet miss A. Compare their y-coordinates as x increases.':'The marked points belong to the amber rail. Compare vertical change with horizontal change; then inspect x = 0.',keys:['point-a','point-b','intercept']}),{text:'Gradient is change in y divided by change in x. The intercept is the y-value at x = 0, not the height at any other point.',keys:['rise','run','intercept']},{text:'Different points (0, −1) and (4, 1) give m = (1 − (−1)) ÷ (4 − 0) = 0.5 and c = −1. Their equation is y = 0.5x − 1.',example:true}],
    vertical:[{text:'Move the carriage along the rail and watch the two coordinates. Which one does not change?',keys:['probe-coordinate']},{text:'Vertical travel changes y but not x. A vertical line cannot be written as y = mx + c with a finite gradient.'},{text:'For a different vertical line through (−3, 0) and (−3, 4), every point has x = −3. Its equation is x = −3, not y = −3.',example:true}]
  };
  if(step===0)return examples.tilt;
  if(step===1)return [{text:'P is on the y-axis. Slide moves every point up or down by the same amount.',keys:['point-p','intercept']},examples.tilt[1],examples.tilt[2]];
  if(step===5)return examples.vertical;
  if(step===6)return [{text:'Save a line, then change only Tilt or Slide. The dashed line preserves your saved geometry.'},{text:'The carriage reads actual coordinates. For two nonvertical lines, equal gradients keep their vertical separation constant; equal intercepts alone do not.'}];
  return examples.equation;
}
function updateRailWork() {
  if(step===1) {
    workFormula('gradientWork',`${term('rise',railText(2*s.m))} ÷ ${term('run','2')} = ${result('gradient-result',railText(s.m),'The ratio of vertical to horizontal change sets the direction.')}`);
    workFormula('interceptWork',`c = ${term('intercept',railText(s.c))}`);
  }
  if(!needsEquation())return;
  const prediction=predictedRail();
  const grade=(id,correct)=>{const input=$(id);if(!input)return;input.className=s.tested&&!correct||s.invalid&&!validNumber(input.value)&&railNumber(input.value)===null?'bad':'';input.setAttribute('aria-invalid',String(input.className==='bad'));};
  if(step===5){grade('constantInput',railNumber(s.answerK)===s.k);$('axisInput').setAttribute('aria-invalid',String(s.tested&&s.axis!=='x'||s.invalid&&!s.axis));}
  else {grade('gradientInput',prediction&&Math.abs(prediction.m-s.m)<1e-8);grade('interceptInput',prediction&&Math.abs(prediction.c-s.c)<1e-8);}
  // Route the action through the shared persistent button. Valid equations still need travel evidence.
  const source=$('workActions').querySelector('button');
  source.disabled=!!(s.tested&&prediction&&railSame(prediction,currentRail())&&geometryMatches());
  workState(s.invalid?'bad':'needed');
}
function railFeedback() {
  if(step===6){
    feedback(`${railEquation(currentRail())}. Move the carriage to read another point.`,false,false,'Explore and compare');
    const saved=s.comparison===null?null:s.records[s.comparison];
    table(['Equation','Carriage point'],s.records.map(r=>[railEquation(r),`(${railText(r.coordinate.x)}, ${railText(r.coordinate.y)})`]),true);
    if(saved)comparisonNote(comparisonDescription({equation:railEquation(saved)},{equation:railEquation(currentRail())})+(railParallel(saved,currentRail())?' The lines have the same direction.':' The directions differ.'));
    else comparisonNote('');
    return;
  }
  const geometric=geometryMatches(),prediction=predictedRail();
  if(s.invalid){feedback(step===5?'Choose x or y and enter a finite number.':'Enter both values as numbers or fractions. A denominator cannot be zero.',false,true,'Complete the equation');return;}
  if(needsEquation()&&!s.tested){feedback(step===3||step===4?'Position the rail, enter its equation, then test.':'Enter your equation before comparing it along the rail.',false,false,'Make a prediction');return;}
  if(needsEquation()&&prediction&&!railSame(prediction,currentRail())) {
    const message=step===5?(prediction.mode!=='vertical'?'Your equation draws a horizontal line, but the rail is vertical. Follow which coordinate stays constant.':'Your constant coordinate places a different vertical line. Compare it with the amber rail.'):
      Math.abs(prediction.m-s.m)>1e-8?'The dashed equation and amber rail have different directions. Compare the rise with the run.':'The direction agrees, but the intercept does not. Compare the two lines where x = 0.';
    feedback(message,false,true,'Compare your equation');return;
  }
  if(!geometric){
    const message=step===0?'Turn the Tilt handle. Compare the blue and amber directions.':step===1?'The direction is fixed. Slide the rail until it reaches P.':step===5?'The equation matches your rail, but the rail does not reach P. Slide it and revise the constant.':'Your equation matches the rail, but a mounting point is missed. Adjust the geometry and revise your equation.';
    feedback(message,false,needsEquation(),step===0?'Compare directions':'Check the placement');return;
  }
  if(!comparedBothEnds()){
    feedback(s.mode==='vertical'?'Move the carriage from y = −2 to y = 2. Check that x stays constant.':'Move the carriage to x = −2 and x = 2. Compare the rail at both stops.',false,false,'Check both ends');return;
  }
  const evidence=[
    'The vertical gap is 2 units at both ends. Equal gradients keep these rails parallel.',
    'The rail passes through (0, 2). Its gradient stays 0.5 as its intercept moves to 2.',
    'y = 0.5x + 1 agrees at x = −2 and x = 2. Both representations describe the same straight line.',
    'From A to B, y falls 2 while x increases 4. y = −0.5x + 2 reaches both mounts.',
    'y stays −2 as x changes: m = 0, so the equation simplifies to y = −2.',
    'x stays 2 as y changes. The equation is x = 2; its gradient is undefined, not zero.'
  ][step];
  feedback(evidence,true);
}
start();
