import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const exp=path.join(root,'experiments/visual-discovery');
const slug='straight-line-coordinates-equations';
const sourcePath=path.join(root,'labs-src/mathematics',slug,'lab.html');
const contractPath=path.join(root,'lab-contracts/mathematics',`${slug}.lab.json`);
const read=p=>fs.readFile(path.join(exp,p),'utf8');

const sharedCss=await read('src/shared.css');
const localCss=await read('src/straight-lines.css');
const sharedJs=await read('src/shared.js');
const connectionsJs=await read('src/connections.js');
const modelJs=await read('src/straight-lines-model.js');
const svgJs=await read('src/straight-lines-svg.js');
const labJs=await read('src/straight-lines.js');
const pilotContract=JSON.parse(await fs.readFile(path.join(exp,'contracts/straight-lines.lab.json'),'utf8'));

pilotContract.implementation.reviewedRevision='canonical-package-migration-2026-09-10';
pilotContract.implementation.surfaces.model.selectors=['#stage'];
pilotContract.implementation.surfaces.model.visibility='Always visible in the canonical production package; later controls are progressively disclosed.';
pilotContract.implementation.surfaces.actions.selectors=['#learningDock','#next','#back','#forwardVisited','#secondaryAction'];
pilotContract.implementation.surfaces.actions.description='Canonical package action surface. One persistent primary action; Back and previously visited Forward are secondary.';
pilotContract.implementation.surfaces.reset.selectors=['#resetMenu','#repeat','#restart','#resetConfirmation','#cancelRestart','#confirmRestart'];
pilotContract.implementation.surfaces.prompt.selectors=['#title','#intro'];
pilotContract.implementation.surfaces.working.selectors=['#working'];
pilotContract.implementation.surfaces.evidence.selectors=['#feedback','#records'];
pilotContract.implementation.surfaces.completion.selectors=['#next','#outcome','#outcomeTitle'];

const html=`<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<!-- LAB_MANIFEST_HEAD_START -->
<title>Straight-Line Coordinates and Equations</title>
<meta name="description" content="Explore straight-line coordinates, gradients, equations and parallel lines with an interactive rail alignment system for Cambridge IGCSE Mathematics 0580.">
<meta name="twitter:card" content="summary_large_image">
<!-- LAB_MANIFEST_HEAD_END -->
<!-- LAB_FRAME_STYLES_START -->
<style data-lab-frame></style>
<!-- LAB_FRAME_STYLES_END -->
<link rel="stylesheet" href="./lab-kit.css" data-lab-resource="lab-kit.css">
<style>
${sharedCss}
${localCss}
/* Canonical-package adapter: publication owns the outer rail and manifest header. */
body>main{width:calc(100vw - var(--lab-page-gutter)*2);max-width:1200px;margin:18px auto 42px}
body>main>.lab{width:100%;max-width:none;margin:0;padding:20px 24px}
.lab-authored-title-slot,[data-lab-authored-subtitle-slot]{display:none!important}
@media(max-width:620px){body>main{margin-top:8px}body>main>.lab{padding:14px 12px}}
</style>
<!-- LAB_DESIGN_COMPONENTS -->
</head>
<body class="lab-adopt-v3 mathematics straight-line-coordinates-equations" data-lab-layout="standard">
<main data-lab-workspace>
<span class="lab-authored-title-slot" data-lab-authored-title-slot aria-hidden="true"></span><span data-lab-authored-subtitle-slot hidden></span>
<section class="lab rail-lab" aria-label="Straight-line rail investigation">
<header class="lesson-head lab-context" aria-labelledby="title">
  <div class="lesson-meta"><p id="stepLabel" class="step-label"></p><div id="checkpoints" class="lab-checkpoints" aria-label="Learning progress"></div></div>
  <details id="resetMenu" class="reset-menu"><summary aria-controls="resetOptions">Restart options<span class="reset-chevron" aria-hidden="true"></span></summary><div class="reset-options" id="resetOptions"><div id="resetChoices" class="reset-choices"><button type="button" class="lab-action" id="repeat" aria-label="Repeat this step"><span id="repeatLabel">Repeat this step</span><small id="repeatDescription">Reset this step only; keep other progress.</small></button><button type="button" class="lab-action" id="restart" aria-label="Restart lab"><span>Restart lab…</span><small>Clear this lab’s progress and readings.</small></button></div><section class="reset-confirmation" id="resetConfirmation" aria-labelledby="resetTitle" hidden><h2 id="resetTitle">Restart this lab?</h2><p>This clears your answers, readings and visited steps in this lab. It cannot be undone.</p><div class="reset-confirm-actions"><button type="button" class="lab-action" id="cancelRestart">Keep working</button><button type="button" class="lab-action" id="confirmRestart" data-lab-action="reset">Restart lab</button></div></section></div></details>
  <div class="mission-copy"><h2 id="title" tabindex="-1"></h2><p class="intro" id="intro"></p></div>
</header>
<div id="context" class="context"></div>
<div class="stage-wrap lab-stage-surface" id="stageWrap"><svg xmlns="http://www.w3.org/2000/svg" class="stage" id="stage" role="group" data-lab-role="model" data-lab-manipulative="graph"></svg></div>
<section id="working" class="lab-work-card learning-work" hidden data-lab-role="working" aria-label="Working"></section>
<div class="controls" id="controls" data-lab-role="control"></div>
<footer class="foot learning-dock" id="learningDock" aria-label="Feedback and next action" data-state="idle" data-lab-role="evidence">
  <div class="outcome" id="outcome" data-state="idle"><svg class="outcome-symbol" viewBox="0 0 24 24" aria-hidden="true"><circle class="outcome-disc" cx="12" cy="12" r="10.5"/><path class="success-mark" d="m7 12 3.25 3.25L17 8.5"/><path class="retry-mark" d="M12 7v6m0 4h.01"/></svg><div><p class="outcome-title" id="outcomeTitle"></p><p class="feedback" id="feedback"></p></div></div>
  <div class="dock-actions"><div class="dock-navigation"><button class="lab-action" id="back" aria-label="Previous step" data-lab-action="back">Back</button><button class="lab-action" id="forwardVisited" hidden data-lab-action="forward">Forward</button><button type="button" class="lab-action hint-toggle" id="hintToggle" aria-expanded="false" aria-controls="evidenceHelp">Hint</button></div><div class="dock-advance"><button type="button" class="lab-action" id="secondaryAction" hidden></button><div class="primary-slot"><button type="button" class="lab-action" data-priority="primary" data-lab-action="advance" id="next" aria-describedby="feedback">Continue</button></div></div></div>
  <section id="evidenceHelp" class="evidence-help" aria-labelledby="hintTitle" hidden><h2 id="hintTitle"></h2><p id="hintText"></p><div class="hint-navigation"><button type="button" id="previousHint" class="lab-action">Previous hint</button><button type="button" id="anotherHint" class="lab-action">Next hint</button></div></section>
</footer>
<table class="records" id="records" hidden aria-label="Experiment readings" data-lab-role="evidence"></table><p id="comparisonNote" class="comparison-note" hidden></p>
<p id="statusAnnouncement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
<p class="smallprint">Coordinate units. Gradient is signed rise ÷ run. Vertical lines use x = k, not an infinite numerical gradient. The carriage checks the interval from −2 to 2.</p>
<noscript>This interactive lab needs JavaScript enabled in your browser.</noscript>
</section>
</main>
<script src="./lab-kit.js" data-lab-resource="lab-kit.js"></script>
<script>
${sharedJs}
${connectionsJs}
${modelJs}
${svgJs}
${labJs}
</script>
</body>
</html>
`;

await fs.mkdir(path.dirname(sourcePath),{recursive:true});
await fs.writeFile(sourcePath,html,'utf8');
await fs.writeFile(contractPath,JSON.stringify(pilotContract,null,2)+'\n','utf8');

// The canonical production slug is now the sole straight-line implementation target.
const buildPath=path.join(exp,'build.mjs');
let build=await fs.readFile(buildPath,'utf8');
build=build.replace("labs.push(JSON.parse(await read('src/straight-lines.pilot.json')));\n",'');
await fs.writeFile(buildPath,build,'utf8');

const verifyPath=path.join(exp,'verify-straight-lines.mjs');
let verify=await fs.readFile(verifyPath,'utf8');
verify=verify.replace("const here=path.dirname(fileURLToPath(import.meta.url)),out=path.resolve(here,'../../outputs/straight-lines-pilot');","const here=path.dirname(fileURLToPath(import.meta.url)),out=path.resolve(here,'../../outputs/straight-line-coordinates-equations');");
verify=verify.replace("const html=await fs.readFile(path.join(here,'review/straight-lines.html'),'utf8');","const html=await fs.readFile(path.resolve(here,'../../public/labs/mathematics/straight-line-coordinates-equations.html'),'utf8');");
verify=verify.replace("const contract=parseLabContractV1(await fs.readFile(path.join(here,'contracts/straight-lines.lab.json'),'utf8'));assert.deepEqual(extractEmbeddedLabContract(html),contract);\n const original=JSON.parse(await fs.readFile(path.resolve(here,'../../lab-contracts/mathematics/straight-line-coordinates-equations.lab.json'),'utf8'));\n assert.deepEqual(contract.invariants,original.invariants);assert.deepEqual(contract.nonGoals,original.nonGoals);assert.equal(contract.relationship,original.relationship);","const contract=parseLabContractV1(await fs.readFile(path.resolve(here,'../../lab-contracts/mathematics/straight-line-coordinates-equations.lab.json'),'utf8'));assert.deepEqual(extractEmbeddedLabContract(html),contract);");
await fs.writeFile(verifyPath,verify,'utf8');

for(const rel of ['review/straight-lines.html','contracts/straight-lines.lab.json','src/straight-lines.pilot.json']) await fs.rm(path.join(exp,rel),{force:true});

console.log(`Migrated ${slug} to its canonical lab package. The five remaining pilots stay isolated until this canary passes the real publication path.`);
