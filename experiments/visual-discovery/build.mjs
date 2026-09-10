import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {parseLabContractV1,renderEmbeddedLabContract} from '../../tools/lab-contract/index.ts';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const read=p=>fs.readFile(path.join(here,p),'utf8');
const css=await read('src/shared.css'),runtime=await read('src/shared.js')+'\n'+await read('src/connections.js'),license=await fs.readFile(path.join(root,'LICENSE'),'utf8');

const guide=await fs.readFile(path.join(root,'docs/examplicity-living-style-guide-v3.html'),'utf8');
const tokens=guide.match(/<style id="examplicity-starter-token-layer">[\s\S]*?(:root\s*\{[\s\S]*?\})/)[1];
const sharedDesign=await fs.readFile(path.join(root,'public/developer/lab-kit/0.3.0/src/lab-design.css'),'utf8');
const sharedRuntime=await fs.readFile(path.join(root,'public/developer/lab-kit/0.3.0/src/lab-design.js'),'utf8');
const sources=[{id:'brilliant',title:'How Brilliant teaches math and helps understanding stick',url:'https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/',accessed:'2026-09-08',role:'Primary description of sequenced visual problems, feedback, and fading support; not independent evidence of this prototype’s effectiveness.'},{id:'phet',title:'Implicit scaffolding in interactive simulations: Design strategies to support multiple educational goals',url:'https://arxiv.org/abs/1306.6544',accessed:'2026-09-08',role:'Research framework and case study for affordances, constraints, cueing, and feedback built into the model.'}];
const labs=[
  {
    "id": "maths",
    "subject": "Maths",
    "title": "Investigate similarity and scale",
    "slug": "mathematics/similarity-scale-effects",
    "summary": "Compare length, area and volume factors using squares and cubes.",
    "action": "Drag an edge, fill unit squares, build cube layers, commit a prediction before checking, scale a non-unit reference, and repair an unequal height.",
    "change": "Lengths, corresponding face area, and volume derive from k, k², and k²h. h = k for similarity.",
    "evidence": "Unit tilings and cube layers precede the powers. A two-unit reference separates physical edge length from scale factor. Prediction verdicts appear only after testing.",
    "decision": "Use the relationship for a reverse target, a counterexample, or a self-directed comparison.",
    "quantities": {
      "scale": {
        "description": "Common corresponding-edge factor k.",
        "domain": "0.5 to 3 guided; 0.5 to 5 in the experiment, in steps of 0.1.",
        "source": "SVG corner slider.",
        "output": "Edge, face grid, cube grid and factor labels.",
        "inputSlots": [
          "[data-control=\"scale\"]",
          "#scaleAnswer"
        ]
      },
      "height": {
        "description": "Independent height factor h for the non-similar counterexample.",
        "domain": "0.5 to 3 guided; 0.5 to 5 in the experiment.",
        "source": "Independent SVG height slider.",
        "output": "Shape and actual volume k²h.",
        "inputSlots": [
          "[data-control=\"height\"]"
        ]
      }
    },
    "limits": [
      "Introductory reference edge 1; the reverse-volume transfer uses reference edge 2 and volume 8. Face area means one corresponding face, not total surface area.",
      "Continuous positive factors include partial units; all three powers apply only when h = k."
    ],
    "gates": [
      "Reach k = 2.",
      "Place all four unit squares.",
      "Build two layers, four cubes each.",
      "Predict k = 3 from area factor 9, resize independently, then explicitly test; typing never grades the answer and edits invalidate success.",
      "Use an original edge of 2 and original volume 8 to produce volume 64. Predict k = 2, resize, then test; the method is available through optional evidence-first hints.",
      "Restore the height to match the two other edge ratios.",
      "Ungated experiment: change view, separate layers, alter height, record immutable readings and select a comparison outline; returning restores the entire experiment."
    ]
  },
  {
    "id": "physics",
    "subject": "Physics",
    "title": "Measure critical angles",
    "slug": "physics/critical-angle-and-total-internal-reflection",
    "summary": "Measure and calculate when refraction becomes total internal reflection.",
    "action": "Rotate a source, observe and mark the limiting ray, calculate diamond, independently predict water to air, then reverse that same boundary.",
    "change": "Snell’s law and unpolarised Fresnel reflectance derive from the same two refractive indices and incidence angle.",
    "evidence": "An escaping ray becomes a grazing ray and then disappears; normal-referenced angles and calculation agree.",
    "decision": "Calculate another threshold or test whether any threshold exists for a reversed pair.",
    "quantities": {
      "angle": {
        "description": "Measured incidence or an untested predicted critical angle; the latter withholds outgoing rays until testing.",
        "domain": "5 to 80 degrees guided; first step limited to 35 degrees. Experiment: 0 to 89.9 degrees.",
        "source": "SVG source or predicted-angle input.",
        "output": "Rays, reflected/transmitted power, angular marks and regime.",
        "inputSlots": [
          "[data-control=\"angle\"]",
          "#angleInput"
        ]
      },
      "critical": {
        "description": "c = asin(n outside / n inside), only if n inside > n outside.",
        "domain": "Degrees; no critical angle when the index condition fails.",
        "source": "Media and learner calculation.",
        "output": "Marked threshold and calculation feedback.",
        "inputSlots": [
          "#ratioInput",
          "#insideMedium",
          "#outsideMedium",
          "#insideIndex",
          "#outsideIndex"
        ]
      }
    },
    "limits": [
      "Ideal lossless flat boundary; radial entry through the semicircular face is normal to that face. Unpolarised Fresnel power. The grazing ray at c indicates a limiting direction.",
      "Custom media accept hypothetical indices from 1 to 3.5; they do not represent measured real materials. Saved readings retain both indices.",
      "Ray lengths are illustrative. A minimum ray opacity preserves visibility; the saved power values are physical model values."
    ],
    "gates": [
      "Rotate beyond 29 degrees, while limited below the first critical angle.",
      "Observe angles on both sides of c and mark within 0.55 degrees; the accepted marker snaps to c.",
      "Replace glass with diamond, then supply the index ratio and inverse-sine result and test the beam. Earlier working shows the same calculation for glass. Edits immediately clear success.",
      "Predict water to air without a supplied substitution. Explicit testing accepts an angle within 0.3 degrees and aligns the measured limiting ray, then reversing the same boundary demonstrates no critical angle. No compulsory endpoint sweep.",
      "Ungated experiment with either medium and hypothetical indices; select frozen readings to compare a saved threshold and retain original numerical indices."
    ]
  },
  {
    "id": "chemistry",
    "subject": "Chemistry",
    "title": "Investigate gas pressure and volume",
    "slug": "physics/gas-compression-at-constant-temperature",
    "summary": "Predict pressure and volume changes for a gas at constant temperature.",
    "action": "Compress and expand without a formula, collect three readings, inspect their products, predict a fresh pressure, then plan a target volume before testing.",
    "change": "Guided stages use pV = 600 kPa·L with fixed particle count and speed. The experiment extends the same ideal-gas model to pV = 600 × (T/300) × relative gas amount, with particle speed proportional to sqrt(T).",
    "evidence": "Actual piston, impacts, gauge and recorded readings respond to the volume state. Products are disclosed after measurements, not before the initial observation.",
    "decision": "Revise a prediction, derive a new pressure or volume from the invariant, or collect another reading.",
    "quantities": {
      "volume": {
        "description": "Gas volume V.",
        "domain": "2 to 8 L, in 0.05 L increments by pointer and 0.25 L by keyboard.",
        "source": "Piston slider or predicted-volume input.",
        "output": "Chamber size, gauge pressure and reading table.",
        "inputSlots": [
          "[data-control=\"volume\"]",
          "#volumeInput"
        ]
      },
      "pressure": {
        "description": "Guided p = 600/V, including prediction at 4 L; experiment p = 600 × (T/300) × relative amount / V.",
        "domain": "75 to 300 kPa guided; 18.75 to 1200 kPa in the expanded experiment.",
        "source": "Actual gas volume; predictions are entered separately in the working card.",
        "output": "Gauge, prediction feedback and readings.",
        "inputSlots": [
          "#pressureInput"
        ]
      },
      "product": {
        "description": "Initial pressure times initial volume.",
        "domain": "600 kPa·L throughout the guided investigation; fixed for each chosen temperature and gas amount in the experiment.",
        "source": "Learner uses 150 kPa at 4 L.",
        "output": "Checks that predicted 2.5 L gives 240 kPa.",
        "inputSlots": [
          "#productInput"
        ]
      },
      "temperature": {
        "description": "Absolute gas temperature T, instantaneously equilibrated with the bath.",
        "domain": "300 K guided; 150 to 600 K in steps of 10 K in the experiment.",
        "source": "On-bath SVG thermostat.",
        "output": "Particle speed and ideal-gas pressure.",
        "inputSlots": [
          "[data-control=\"temperature\"]"
        ]
      },
      "amount": {
        "description": "Amount relative to the starting sample.",
        "domain": "1 guided; 0.5 to 2 in half-sample steps in the experiment.",
        "source": "On-apparatus add/remove gas buttons.",
        "output": "9 to 36 representative particles and ideal-gas pressure.",
        "inputSlots": [
          "[data-control=\"add-gas\"]",
          "[data-control=\"remove-gas\"]"
        ]
      }
    },
    "limits": [
      "This is the existing Physics/Chemistry cross-listed gas model, presented as a Chemistry prototype.",
      "The starting sample uses eighteen representative particles; the displayed pressure follows the ideal-gas relationship, not measured 2D simulation impulses.",
      "Temperature 300 K and gas amount remain fixed throughout the guided stages. The user-requested final extension varies both, with instantaneous bath equilibrium, no thermal transient, no non-ideal gas behaviour and no quantitative collision-pressure simulation.",
      "Representative particle positions rescale with apparatus resizing; speed and scientific pressure remain model-derived, not collision-measured."
    ],
    "gates": [
      "Compress 6 L to 3 L and return to 6 L. The gauge changes from 100 to 200 and back to 100 kPa; no formula card or numerical invariant is supplied.",
      "Record three distinct volumes. A non-blocking nudge flags clustered readings; products and the curve are revealed after the third reading.",
      "Predict 150 kPa for expansion from 3 L / 200 kPa to the unfamiliar 4 L. Explicit testing moves the piston; edits clear the verdict and restore the starting apparatus.",
      "Supply the invariant 600 kPa·L and planned volume 2.5 L for a 240 kPa target. Method help is optional; the test animates actual volume, not the gauge prediction.",
      "Ungated temperature/amount/volume experiment with immutable records, frozen piston/curve comparisons, shared plot scaling and restored particle/condition snapshots."
    ]
  },
  {
    "id": "biology",
    "subject": "Biology",
    "title": "Investigate natural selection",
    "slug": "biology/selection-pressure-and-trait-frequency",
    "summary": "Compare selected parents, inherited offspring and trait frequencies.",
    "action": "Change food without changing adults, trace parents and offspring, inspect worked selection cases, then construct a two-source environment to change the population pattern.",
    "change": "Environment changes reproductive weights of existing adults. Weighted parent selection and inherited variation generate a new fixed-size population.",
    "evidence": "Large bird glyphs illustrate three representative beak depths; count dots and frequency bars derive from the same population as mean, spread and middle-band readings. Original adults remain in place when food is edited.",
    "decision": "Compare directional, stabilising and disruptive effects, then reverse or reshape food in the experiment.",
    "quantities": {
      "food": {
        "description": "One or two Gaussian food-advantage peaks across the beak-depth axis.",
        "domain": "Peak centres 4.5 to 15.5 mm; widths 0.55 to 3 mm.",
        "source": "SVG food-peak and independent food-width handles.",
        "output": "Reproductive weights; no direct adult trait change.",
        "inputSlots": [
          "[data-control=\"food-0\"]",
          "[data-control=\"food-1\"]",
          "[data-control=\"food-width-0\"]",
          "[data-control=\"food-width-1\"]",
          "#foodPressure"
        ]
      },
      "population": {
        "description": "Inherited beak-depth values for every adult.",
        "domain": "4.05 to 15.95 mm; 72 adults and 24 parents guided. Experiment populations of 36, 72 or 144, with one third selected as parents.",
        "source": "Seeded weighted sampling with offspring variation SD 0.43 mm. Guided seed 9137; New sample increments the seed by 104729 without changing the food.",
        "output": "Adult count dots, parent-to-offspring transitions, beak-depth frequency bars and mean/SD/middle frequencies.",
        "inputSlots": [
          "#populationSize"
        ]
      },
      "frequency": {
        "description": "Percentage of the current adults within a named trait group.",
        "domain": "0 to 100 percent; the assessed middle group is 8.5–11.5 mm inclusive.",
        "source": "Group adult count divided by the total population and multiplied by 100; guided total 72.",
        "output": "Worked frequency examples precede a checked learner calculation to one decimal place.",
        "inputSlots": [
          "#frequencyInput"
        ]
      }
    },
    "limits": [
      "Simplified heritable continuous trait, not a complete genetic, ecological, or demographic simulation.",
      "Population size stays fixed within a run. Choosing a size starts a fresh seeded cohort. Steady food is editable; alternating food switches shallow/deep advantage after each generation; even food gives all traits equal reproductive weights, while random sampling remains.",
      "Dashed columns show starting frequencies; bars show every current adult. Bird drawings are representative trait examples. Spread is population standard deviation; the middle band is 8.5–11.5 mm.",
      "Comparison bands use the same 8.5 and 11.5 mm boundaries as the visible bird groups. Saved populations of a different size are explicitly normalised to the current total for the overlay."
    ],
    "gates": [
      "Move food advantage toward deeper existing beaks.",
      "Select 24 parents, observe 72 offspring inheriting traits from those parents, then replace the adults after the transition.",
      "Observe at least three generations in the worked directional case; completion indicates a comparison is available, not mastery or a hidden mean threshold.",
      "After at least three generations, explicitly check the current middle-group percentage to within 0.11 percentage points. No hidden spread threshold gates the calculation.",
      "Arrange two initially central food sources and their widths. After at least three generations since the last edit, both visible tails must increase and the middle decrease relative to the starting distribution. No hidden SD or fixed 15-percent tail requirement.",
      "Ungated food/population experiment: record frozen population snapshots, compare their distribution, repeat with a reproducible new seed, and return without losing the experiment. Cross-size overlays explicitly rescale proportions to the current total."
    ]
  }
];
await fs.mkdir(path.join(here,'review'),{recursive:true});await fs.mkdir(path.join(here,'contracts'),{recursive:true});
for(const lab of labs){const source=await read(`src/${lab.id}.js`)+(['chemistry','biology','physics'].includes(lab.id)?'\n'+await read(`src/${lab.id}-svg.js`):''),originalText=await fs.readFile(path.join(root,`lab-contracts/${lab.slug}.lab.json`),'utf8'),original=JSON.parse(originalText);const sequence=vm.runInNewContext(source.slice(0,source.indexOf('];')+2)+';lesson');const contract={...original,...(lab.id==='chemistry'?{relationship:lab.change,invariants:original.invariants.map((value,i)=>i<3?'At a fixed temperature and gas amount: '+value:value),nonGoals:['Do not model non-ideal gas behaviour or transient heat exchange.','Do not replace the piston investigation with a formula-only quiz.'],safeAdaptations:[...original.safeAdaptations,'In the final experiment, vary bath temperature and relative gas amount while preserving pV proportional to amount × absolute temperature.']}:{}),learnerLoop:{action:lab.action,modelChange:lab.change,evidence:lab.evidence,nextDecision:lab.decision},implementation:{reviewedRevision:'prototype-source-sha256:'+createHash('sha256').update(tokens+sharedDesign+sharedRuntime+css+runtime+source).digest('hex'),surfaces:{actions:{selectors:['#learningDock','#next','#back','#forwardVisited','#secondaryAction'],kind:'control',description:'One persistent primary action; Back and optional previously-visited Forward are secondary. Model-specific callbacks and gates are unchanged.',visibility:'Same relative position below the apparatus and working; before saved readings.'},help:{selectors:['#hintToggle','#evidenceHelp','#previousHint','#anotherHint'],kind:'control',description:'Optional inline hints from the dock, with previous/next, labelled worked examples and Escape dismissal. Only an explicit opening may scroll to reveal the requested help.',visibility:'Available when a step has authored hints; never opens automatically.'},reset:{selectors:['#resetMenu','#repeat','#restart'],kind:'control',description:'A consistent top-right disclosure separates repeating the step from restarting the lab.',visibility:'Restart options always available; Repeat disabled during model transitions.'},prompt:{selectors:['#title','#intro'],kind:'given',description:'A short goal and action sentence above the apparatus, with a guided-step label and quiet restart disclosure.',visibility:'Current step only.'},model:{selectors:['#stage'],kind:'model',description:lab.change,visibility:'Always visible; later controls are progressively disclosed.'},help:{selectors:['#evidenceHelp','#hintText'],kind:'support',description:'Learner-requested evidence cue, relationship hint and contrasting worked example; no automatic answer-directed pulse.',visibility:'Only when requested in the relevant experience.'},comparison:{selectors:['#records','#comparisonNote'],kind:'evidence',description:'Frozen readings and explicitly labelled comparison conditions; graphical overlays use the selected saved reading.',visibility:'Recorded experiment comparisons only.'},navigation:{selectors:['#back','#next','#repeat','#restart'],kind:'control',description:'Back and Forward restore snapshots; Repeat resets the current experience; Start over clears the session.',visibility:'Back and Forward depend on visited progress.'},working:{selectors:['#working'],kind:'working',description:'Worked examples precede learner calculations. Explicit quantity keys connect source labels to formula operands, with matching highlights and a button-triggered trace. Hover, focus and tap explain each source and calculation.',visibility:'Changes with the current step.'},evidence:{selectors:['#feedback','#records'],kind:'evidence',description:lab.evidence,visibility:'In-place feedback; readings only in relevant steps.'},completion:{selectors:['#next','#outcome','#outcomeTitle'],kind:'completion',description:'The persistent dock button runs the current test/check and changes to Continue only after the original model-derived criterion. Feedback and help share this dock; presentation does not set completion.',visibility:'Guided steps; absent in the open experiment.'}},quantities:lab.quantities,modes:{guided:'Small ordered visual investigations, with model actions and in-place revision.',experiment:lab.gates.at(-1)},dependencies:lab.gates,completion:'New experiences require their model-derived criterion. Back and Forward revisit saved state without forcing a rerun; Repeat experience resets only that experience. Start over clears all session snapshots. Worked observations are not mastery claims.',limitations:lab.limits}};
 if(sequence.length!==lab.gates.length)throw new Error(lab.id+': each experience needs a documented completion criterion');
 parseLabContractV1(JSON.stringify(contract));
 const pedagogy={schemaVersion:1,designStatus:'Review prototype; no empirical learning-effectiveness claim.',source:{baseRevision:'a42aaaa78d437926ba59b766a6415ddd89ba46ed',labSource:`labs-src/${lab.slug}/lab.html`,contract:`lab-contracts/${lab.slug}.lab.json`,originalContractSha256:createHash('sha256').update(originalText).digest('hex')},research:sources,approaches:['Implicit scaffolding through direct manipulation and constrained initial states','One causal relationship per guided screen','Visual model before formal notation','Prediction, observation and immediate model-specific revision','Faded transfer cases remove supplied methods but preserve the apparatus before the open experiment','Evidence-first optional hints precede a contrasting worked example','Session snapshots preserve learner evidence during Back and Forward navigation','Immutable comparison readings retain conditions and selected model overlays','Worked calculation rows retain the same quantities, order and units when learners later supply the answers','Explicit source identities link model quantities and earlier calculations to later formula operands','Optional quantity explanations keep context available without adding permanent panels','Consistent goal above the model and feedback/actions below it; evidence, retry and continuation do not create competing cards','One optional hint entry; restart controls separated from the learning action'],sequence:sequence.map((x,i)=>({...x,criterion:lab.gates[i],mode:i===sequence.length-1?'experiment':'guided'})),connections:{mapping:'data-source quantity keys pair with data-value-ref operands; earlier calculated results can be sources for later rows. Matching digits alone never creates a link.',cue:'Only activating the Trace values button starts the ordered source pulse, 560 ms curved value transfer and destination pulse. Loading, changing checkpoints, editing values and selecting sources never start a trace. Edits, dragging, scrolling and stage changes cancel a running trace.',help:'Quantity tooltips support hover, keyboard focus, tap and Escape dismissal. The whole working card no longer triggers a method popup; authored guidance is in the single requested hint disclosure.',transition:'Only changed mission, working, feedback, control and SVG parts fade out for 150 ms, then fade in for 300 ms. Identical visual parts stay visible, while changing working and model areas resize smoothly. Missions use typography without an icon; success uses one filled green checkmark in the feedback dock. Test and Continue retain the same button. Navigation is locked for the brief transition; reduced motion changes checkpoints immediately.',reducedMotion:'No value travel or stage movement. Button-triggered static paired outlines retain the connection.'},outcomeContinuity:{relationship:original.relationship,invariants:original.invariants,originalNonGoals:original.nonGoals,extensions:lab.id==='chemistry'?'User-requested extension beyond the original fixed-temperature and fixed-amount non-goal, confined to the final experiment. All original guided constraints and outcomes are retained.':lab.gates.at(-1),interactionChanges:'Replaces simultaneous panels, support-level switches and completion overlays with a sequenced model surface. The existing curriculum catalogue is untouched.',modelLimitations:lab.limits},accessibility:{pointer:'Touch and mouse operate the same SVG handles; all handle hit targets at least 44 CSS px.',keyboard:'Arrow keys and Home/End operate SVG sliders. Enter/Space activate unit tiles. Native inputs and buttons support the calculation and generation steps.',motion:'Respects prefers-reduced-motion; particle animation can also be paused. Laser direction cues are brief, piston tests interpolate physical volume, and offspring move from their actual sampled parents before population replacement.',feedback:'One polite, atomic live region announces settled status changes. The visible dock retains its position and one primary button; edits and result updates do not move focus. Dynamic pointer feedback is debounced.'}};
 const html=`<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${lab.title} · Examplicity</title>\n<!-- LICENSE\n${license}\n-->\n${renderEmbeddedLabContract(contract)}\n<script type="application/json" data-examplicity-pedagogy>${JSON.stringify(pedagogy,null,2).replace(/</g,'\\u003c')}</script>\n<style data-examplicity-tokens>${tokens}</style><style data-lab-design>${sharedDesign}</style><style>${css}</style></head><body><main class="lab"><header class="lesson-head lab-context" aria-labelledby="title"><div class="lesson-meta"><p id="stepLabel" class="step-label"></p><div id="checkpoints" class="lab-checkpoints" aria-label="Learning progress"></div></div><details id="resetMenu" class="reset-menu"><summary>Restart options</summary><div class="reset-options"><button type="button" class="lab-action" id="repeat">Repeat this step</button><button type="button" class="lab-action" id="restart" data-lab-action="reset">Restart lab</button></div></details><div class="mission-copy"><h1 id="title" tabindex="-1"></h1><p class="intro" id="intro"></p></div></header><div id="context" class="context"></div><div class="stage-wrap" id="stageWrap"><svg xmlns="http://www.w3.org/2000/svg" class="stage" id="stage" role="group" data-lab-role="model"></svg></div><section id="working" class="lab-work-card learning-work" hidden data-lab-role="working" aria-label="Working"></section><div class="controls" id="controls" data-lab-role="control"></div><footer class="foot learning-dock" id="learningDock" aria-label="Feedback and next action" data-state="idle"><div class="outcome" id="outcome" data-state="idle"><svg class="outcome-symbol" viewBox="0 0 24 24" aria-hidden="true"><circle class="outcome-disc" cx="12" cy="12" r="10.5"/><path class="success-mark" d="m7 12 3.25 3.25L17 8.5"/><path class="retry-mark" d="M12 7v6m0 4h.01"/></svg><div><p class="outcome-title" id="outcomeTitle"></p><p class="feedback" id="feedback"></p></div></div><div class="dock-actions"><div class="dock-navigation"><button class="lab-action" id="back" aria-label="Previous step">Back</button><button class="lab-action" id="forwardVisited" hidden>Forward</button><button type="button" class="lab-action hint-toggle" id="hintToggle" aria-expanded="false" aria-controls="evidenceHelp">Hint</button></div><div class="dock-advance"><button type="button" class="lab-action" id="secondaryAction" hidden></button><div class="primary-slot"><button type="button" class="lab-action" data-priority="primary" id="next" aria-describedby="feedback">Continue</button></div></div></div><section id="evidenceHelp" class="evidence-help" aria-labelledby="hintTitle" hidden><h2 id="hintTitle"></h2><p id="hintText"></p><div class="hint-navigation"><button type="button" id="previousHint" class="lab-action">Previous hint</button><button type="button" id="anotherHint" class="lab-action">Next hint</button></div></section></footer><table class="records" id="records" hidden aria-label="Experiment readings" data-lab-role="evidence"></table><p id="comparisonNote" class="comparison-note" hidden></p><p id="statusAnnouncement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p><p class="smallprint">${lab.id==='chemistry'?'Guided readings hold gas amount and temperature fixed. Particles represent an ideal gas.':lab.id==='biology'?'A simplified inheritance model. Spread = standard deviation.':lab.id==='physics'?'Ideal boundary. Rays show direction; recorded percentages show transmitted power.':'Face area refers to one corresponding face. Reference dimensions are labelled in each experience.'}</p><noscript>This interactive lab needs JavaScript enabled in your browser.</noscript></main><script data-lab-design>${sharedRuntime}</script><script>${runtime}\n${source}</script></body></html>\n`;
 await fs.writeFile(path.join(here,`contracts/${lab.id}.lab.json`),JSON.stringify(contract,null,2)+'\n');await fs.writeFile(path.join(here,`review/${lab.id}.html`),html);
 console.log(`${lab.id}: ${Math.round(Buffer.byteLength(html)/1024)} KB, ${sequence.length-1} guided experiences + experiment, valid v1 contract`)
}
await fs.writeFile(path.join(here,'review/index.html'),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Visual lab review · Examplicity</title><style>${tokens}\n${sharedDesign}\n${css}.review{max-width:850px;margin:32px auto;padding:24px}.review h1{font:400 16px/1.5 var(--lab-font-sans);color:var(--lab-accent-ink);margin:0 0 12px}.review p{font-size:14px;line-height:1.6}.entry{display:grid;grid-template-columns:90px 1fr auto;gap:20px;align-items:center;padding:22px 0;border-top:1px solid var(--lab-line-subtle);text-decoration:none;color:var(--lab-ink)}.entry h2{font:400 15px/1.5 var(--lab-font-sans);margin:0 0 4px;color:var(--lab-accent-ink)}.entry p{font-size:14px;margin:0;color:var(--lab-ink-secondary)}.entry span{font-size:12px;color:var(--lab-muted)}.entry:hover h2{text-decoration:underline}.review-note{border-top:1px solid var(--lab-line-subtle);padding-top:18px}.review-note a{color:var(--lab-accent-ink)}@media(max-width:600px){.review{margin:10px auto;padding:18px}.entry{grid-template-columns:1fr auto;gap:8px}.entry>span:first-child{grid-column:1/-1}}</style></head><body><main class="lab review"><h1>Visual lab review</h1><p>Four guided investigations that open into independent experiments.</p>${labs.map(l=>`<a class="entry" href="${l.id}.html"><span>${l.subject}</span><div><h2>${l.title}</h2><p>${l.summary}</p></div><span aria-hidden="true">→</span></a>`).join('')}<p class="review-note">Each lab works offline. Structured teaching contracts and research rationale are embedded in the HTML.<br><a href="../RESEARCH.md">Research and design decisions</a> · <a href="../README.md">Scope and source notes</a></p></main></body></html>`);
