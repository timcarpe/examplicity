const lesson = [
  {label:'Area',title:'Make the second bar represent 20 pupils.',intro:'The first bar represents 10 pupils. Move the second bar’s top and compare the filled grid cells.',success:'Twice the area represents twice as many pupils.'},
  {label:'Width',title:'Give both intervals the same frequency.',intro:'These two groups each contain 20 pupils. Adjust the wider bar without changing its interval.',success:'Equal frequencies need equal areas, not equal heights.'},
  {label:'Build',title:'Build the whole grouped report.',intro:'Set the four bar heights from the given frequencies. You can work on the intervals in any order.',success:'Every bar area matches its group.'},
  {label:'Accumulate',title:'Turn the bar areas into a running total.',intro:'Move the three crosses to build a cumulative-frequency graph for the same 60 pupils. Then check it.',success:'Each cumulative rise equals the corresponding bar area.'},
  {label:'Middle half',title:'Locate the middle half of the journeys.',intro:'Use the ruler to record Q1, the median and Q3. Then calculate the interquartile range in minutes.',success:'The bracket spans the middle 50%.'},
  {label:'Experiment',title:'Change one group. Compare the whole distribution.',intro:'Adjust a bar, then save the report. Select a saved reading to compare its areas, totals and quartiles.',success:''}
];
const s = {bounds:[],counts:[],targets:[],sketch:[],selected:1,tested:false,scan:0,qIndex:0,quartiles:[null,null,null],readError:false,iqr:'',iqrChecked:false,records:[],comparison:null};
function histData() { return histogramDistribution(s.bounds,s.counts); }
function histReport() { return histogramDistribution(s.bounds,s.targets); }
function histInterval(i) { return `${s.bounds[i]}–${s.bounds[i+1]}`; }
function histAllRead() { return s.quartiles.every(x=>x!==null); }
function histNumberText(n) { return n===null?'not defined':fmt(n,1); }
function reset() {
  Object.assign(s,{bounds:[],counts:[],targets:[],sketch:[],selected:1,tested:false,scan:0,qIndex:0,quartiles:[null,null,null],readError:false,iqr:'',iqrChecked:false,records:[],comparison:null,helpLevel:0,helpOpen:false});
}
function enter() {
  s.bounds=step===0?[0,10,20]:step===1?[0,10,30]:[0,10,20,40,60];
  s.targets=step===0?[10,20]:step===1?[20,20]:[10,20,20,10];
  s.counts=step===0?[10,10]:step===1?[20,40]:step===2?[10,10,10,10]:s.targets.slice();
  Object.assign(s,{selected:step<2?1:0,tested:false,sketch:[0,10,20,30,60],scan:5,qIndex:0,quartiles:[null,null,null],readError:false,iqr:'',iqrChecked:false});
  if(step===5){s.records=[];s.comparison=null;}
  controls();
}
function restoreView() { controls(); }
function setHistFrequency(i,frequency) {
  const maximum=3*(s.bounds[i+1]-s.bounds[i]);
  const next=Math.round(clamp(frequency,0,maximum));
  if(next!==s.counts[i]){s.counts[i]=next;s.tested=false;}
  s.selected=i;render();
}
function setHistTotal(i,value) {
  const next=Math.round(clamp(value,s.sketch[i-1],s.sketch[i+1]));
  if(next!==s.sketch[i]){s.sketch[i]=next;s.tested=false;}
  s.selected=i-1;render();
}
function setHistScan(value) {
  const next=Math.round(clamp(value,0,s.bounds.at(-1))*2)/2;
  if(next!==s.scan){
    s.scan=next;s.readError=false;
    if(step===4){s.quartiles[s.qIndex]=null;s.iqrChecked=false;}
  }
  render();
}
function recordHistQuartile() {
  const data=histData(),rank=data.total*(s.qIndex+1)/4;
  s.readError=Math.abs(histogramCumulativeAt(data,s.scan)-rank)>.55;
  if(!s.readError){
    // Store the learner's actual read-off, not a silently substituted exact answer.
    s.quartiles[s.qIndex]=s.scan;s.iqrChecked=false;
    const next=s.quartiles.findIndex(x=>x===null);
    if(next!==-1)s.qIndex=next;
  }
  render();
}
function controls() {
  $('context').replaceChildren();$('controls').replaceChildren();$('working').hidden=true;
  if(step<4){
    workSetup(step===3?'Same pupils, a different representation':'Your report',workRow(step===3?'selected interval':'evidence',workOutput('histogramWork')));
    button(step===3?'Check totals':'Check bars',()=>{s.tested=true;render();},{'data-dock-action':'true'});
  } else if(step===4){
    const readings=['Q1','Median','Q3'].map((name,i)=>`<button type="button" class="lab-action" data-quantile="${i}" aria-pressed="${s.qIndex===i}"><span>${name}</span><span id="qReading${i}">Not recorded</span></button>`).join('');
    workSetup('Recorded estimates',`<div class="hist-readings">${readings}</div><div class="hist-range"><label for="iqrInput">Interquartile range</label><input type="text" inputmode="decimal" autocomplete="off" maxlength="20" id="iqrInput" aria-label="Interquartile range in minutes"><span>min</span></div>`,'Read-offs inside a group are estimates. Use your recorded Q3 and Q1.');
    $('iqrInput').value=s.iqr;
    $('iqrInput').oninput=e=>{s.iqr=e.target.value;s.iqrChecked=false;render();};
    $('working').querySelectorAll('[data-quantile]').forEach(button=>button.onclick=()=>{
      s.qIndex=Number(button.dataset.quantile);
      if(s.quartiles[s.qIndex]!==null)s.scan=s.quartiles[s.qIndex];
      s.readError=false;render();
    });
    button('Record estimate',recordHistQuartile,{'data-dock-action':'true',id:'recordQuartile'});
    button('Check range',()=>{s.iqrChecked=String(s.iqr).trim()!=='';render();},{'data-dock-action':'true',id:'checkHistRange'});
  } else {
    workSetup('Linked evidence',workRow('selected interval',workOutput('histogramWork')),'Between boundaries, the cumulative line assumes constant density. It is not a record of individual journey times.');
    button('Save report',()=>{rememberReading({bounds:s.bounds.slice(),counts:s.counts.slice()});render();});
    button('Clear readings',clearReadings);
  }
  setHelp(histHints());
}
function histHints() {
  if(step<3)return [
    {text:'Count the filled area, not just the height. A full grid cell represents 5 pupils; part of a cell represents part of that amount.',keys:['bar-area']},
    {text:'Width is measured in minutes; height is pupils per minute. Multiplying them gives pupils. A wider group needs less height to show the same number.',keys:['class-width','density']},
    {text:'Different example: 30 pupils spread over a 15-minute interval need a density of 30 ÷ 15 = 2 pupils per minute.',example:true}
  ];
  if(step===3)return [
    {text:'A cross includes this interval and every interval to its left. Compare the rise between two crosses with the area of the bar above.',keys:['bar-area','cumulative-rise']},
    {text:'Cumulative totals never decrease. The last total includes all 60 pupils; the earlier totals include only the groups already passed.'},
    {text:'Different report: group frequencies 6, 9 and 5 give running totals 0, 6, 15 and 20. A frequency of 9 is a rise of 9, not a height of 9.',example:true}
  ];
  if(step===4)return [
    {text:'Follow the horizontal target rank to the cumulative line, then read down to the time axis. The ruler shows that same position in the histogram.',keys:['read-time','read-total']},
    {text:'Q1 is at 25% of the total, the median at 50%, and Q3 at 75%. The interquartile range is Q3 minus Q1, not the median.'},
    {text:'Different report: with 80 journeys, use ranks 20, 40 and 60. If Q1 is about 8 minutes and Q3 about 26, the interquartile range is about 18 minutes.',example:true}
  ];
  return [{text:'Save the report before changing a bar. Dashed outlines retain the saved areas and cumulative totals on the same axes.'},{text:'Changing one bar changes its frequency and every later cumulative total. Quartile ranks also change when the overall total changes.'}];
}
function updateHistWork() {
  const data=histData(),i=s.selected;
  if(step===4){
    const all=histAllRead();
    for(let j=0;j<3;j++){
      $(`qReading${j}`).textContent=s.quartiles[j]===null?'Not recorded':`≈ ${histNumberText(s.quartiles[j])} min`;
      $('working').querySelector(`[data-quantile="${j}"]`).setAttribute('aria-pressed',String(j===s.qIndex));
    }
    $('recordQuartile').disabled=all;
    $('checkHistRange').disabled=!all;
    const value=histogramNumber(s.iqr),bad=s.iqrChecked&&(value===null||Math.abs(value-(s.quartiles[2]-s.quartiles[0]))>.11);
    $('iqrInput').className=bad?'bad':'';$('iqrInput').setAttribute('aria-invalid',String(bad));
    return;
  }
  if(step===0&&!s.tested){workFormula('histogramWork','Given: 10 pupils in 0–10 min; 20 pupils in 10–20 min.');return;}
  if(step===2){workFormula('histogramWork',`Your bar areas total ${data.total} pupils. The given report contains 60.`);return;}
  if(step===3){workFormula('histogramWork',`${histInterval(i)} min: bar area ${term('bar-area',data.frequencies[i])}; your cumulative rise ${term('cumulative-rise',s.sketch[i+1]-s.sketch[i])} pupils.`);return;}
  workFormula('histogramWork',`${term('class-width',data.widths[i])} min × ${term('density',fmt(data.densities[i],2))} pupils/min = ${term('bar-area',data.frequencies[i])} pupils`);
}
function histogramFeedback() {
  const data=histData(),report=histReport();
  if(step<3){
    const ok=s.tested&&histogramMatches(s.counts,s.targets),first=s.counts.findIndex((f,i)=>f!==s.targets[i]);
    if(ok){feedback(step===1?'The 10-minute and 20-minute groups both have area 20. The wider bar is half as high.':step===0?'The second bar contains four full grid cells; the first contains two. Each cell represents 5 pupils.':'The two 20-pupil groups have equal areas, even though their widths and heights differ.',true);return;}
    if(s.tested&&first!==-1){feedback(`The ${histInterval(first)} min bar represents ${s.counts[first]} pupils; its given frequency is ${s.targets[first]}. Revise its area.`,false,true,'Compare the areas');return;}
    feedback(step===1?'Both bars start at the same height. Does the wider bar contain the same area?':'The bar responds immediately. Check when its area matches the given frequency.',false,false,'Build and inspect');return;
  }
  if(step===3){
    const ok=s.tested&&histogramMatches(s.sketch,report.cumulative),first=s.sketch.findIndex((f,i)=>f!==report.cumulative[i]);
    if(ok){feedback('The cumulative rises are 10, 20, 20 and 10 pupils: exactly the four bar areas. The last total is 60.',true);return;}
    if(s.tested){feedback(`At ${s.bounds[first]} min your sketch reaches ${s.sketch[first]} pupils. Compare it with the report line and the areas to the left.`,false,true,'A group count is not a running total');return;}
    feedback('Move each cross vertically. Its height includes every group already passed; the final 60 is fixed.',false,false,'Construct the totals');return;
  }
  if(step===4){
    const names=['Q1','median','Q3'],rank=data.total*(s.qIndex+1)/4;
    if(s.readError){feedback(`Your ruler is at ${fmt(histogramCumulativeAt(data,s.scan),1)} pupils. The ${names[s.qIndex]} rank is ${rank}. Use the graph to revise the position.`,false,true,'Compare the read-off');return;}
    if(!histAllRead()){feedback(`Record ${names[s.qIndex]} at cumulative frequency ${rank}. The ruler currently reads ${fmt(s.scan,1)} min.`,false,false,'Read across, then down');return;}
    if(!s.iqrChecked){feedback('All three estimates are recorded. Enter the distance from Q1 to Q3, in minutes.',false,false,'Calculate the middle-half range');return;}
    const value=histogramNumber(s.iqr),answer=s.quartiles[2]-s.quartiles[0];
    if(value===null){feedback('Use a finite number or fraction for the range. A denominator cannot be zero.',false,true,'Check the range entry');return;}
    if(Math.abs(value-answer)>.11){feedback(`Your bracket starts at Q1 but ends at ${fmt(s.quartiles[0]+value,1)} min. It must reach your Q3 estimate.`,false,true,'Compare the bracket');return;}
    feedback(`Q1 ≈ ${fmt(s.quartiles[0],1)} min and Q3 ≈ ${fmt(s.quartiles[2],1)} min. Their difference is about ${fmt(answer,1)} min. Grouped data do not give exact individual times.`,true);return;
  }
  feedback(data.total?`There are now ${data.total} pupils. The median estimate is ${fmt(histogramQuantile(data,.5),1)} min.`:'With no pupils, the cumulative graph is flat and quartiles are undefined. Add frequency to a bar.',false,false,'Explore and compare');
  table(['Frequencies','Total','Median / min'],s.records.map(record=>{const d=histogramDistribution(record.bounds,record.counts);return [record.counts.join(', '),d.total,histNumberText(histogramQuantile(d,.5))];}),true);
  const saved=s.comparison===null?null:s.records[s.comparison];
  comparisonNote(saved?comparisonDescription({frequencies:saved.counts.join(', ')},{frequencies:s.counts.join(', ')})+' Both plots use the same axes; saved counts are not normalised.':'');
}
start();
