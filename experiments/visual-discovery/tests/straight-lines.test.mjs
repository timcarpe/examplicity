import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../src/straight-lines-model.js',import.meta.url),'utf8');
const model=vm.runInNewContext(source+';({railNumber,railValue,railPoint,railGap,railExtent,railSame,railParallel,railOnPoint,railEquation})');
const {railNumber,railValue,railPoint,railExtent,railSame,railParallel,railOnPoint,railEquation}=model;
test('Finite decimals and fractions; no expression execution or zero denominators',()=>{
 for(const [input,value]of [['0',0],['-.5',-.5],['−1/2',-.5],[' 3 / 2 ',1.5],['-1/-2',.5],['.25',.25]])assert.equal(railNumber(input),value);
 for(const input of ['', ' ', '1/0', '0/0', 'Infinity', 'NaN', '1/2/3', '1e999', 'alert(1)', '2+2', '0x10'])assert.equal(railNumber(input),null);
});
test('Tilt and slide preserve the independent coefficient; plotted points satisfy the same equation',()=>{
 for(let m=-1.5;m<=1.5;m+=.25)for(let c=-2;c<=2;c+=.5)for(let x=-2;x<=2;x+=.25){
  const a={mode:'linear',m,c};assert.equal(railPoint(a,x).y,m*x+c);assert.equal(railValue(a,0),c);
  assert.equal(railValue({...a,m:m+.25},0),c);
  assert.ok(railParallel(a,{...a,c:c+.5}));assert.ok(!railSame(a,{...a,c:c+.5}));
 }
});
test('Affine interval maximum and rejection of one-point coincidences',()=>{
 for(let m=-1.5;m<=1.5;m+=.25)for(let c=-2;c<=2;c+=.5){
  const a={mode:'linear',m,c},b={mode:'linear',m:-.5,c:2};
  const sampled=Math.max(...Array.from({length:81},(_,i)=>Math.abs(railValue(a,-2+i*.05)-railValue(b,-2+i*.05))));
  assert.ok(Math.abs(railExtent(a,b)-sampled)<1e-9);
 }
 const a={mode:'linear',m:.5,c:0},b={mode:'linear',m:-.5,c:2};
 assert.equal(railValue(a,2),railValue(b,2));assert.equal(railSame(a,b),false);
 assert.equal(railOnPoint(a,{x:2,y:1}),true);assert.equal(railOnPoint(a,{x:-2,y:3}),false);
});
test('Horizontal and vertical equations are distinct; vertical gradient is not represented as a number',()=>{
 for(let k=-3;k<=3;k+=.5){
  const v={mode:'vertical',k},h={mode:'linear',m:0,c:k};
  assert.equal(railSame(v,h),false);assert.equal(railParallel(v,h),false);assert.equal(railExtent(v,h),null);
  for(let t=-2;t<=2;t+=.25){assert.equal(railPoint(v,t).x,k);assert.equal(railPoint(v,t).y,t);assert.equal(railPoint(h,t).y,k);}
  assert.ok(railEquation(v).startsWith('x ='));assert.ok(railEquation(h).startsWith('y ='));
 }
});
