import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const context=vm.createContext({});
vm.runInContext(await fs.readFile(new URL('../src/histograms-model.js',import.meta.url),'utf8'),context);
const {histogramDistribution:distribution,histogramCumulativeAt:at,histogramQuantile:q,histogramNumber:number}=context;
test('bar area and cumulative increment encode one frequency, including unequal widths',()=>{
 for(let a=0;a<=30;a+=3)for(let b=0;b<=60;b+=5){
  const d=distribution([0,10,30],[a,b]);
  assert.equal(d.densities[0]*10,a);assert.equal(d.densities[1]*20,b);
  assert.equal(at(d,10),a);assert.equal(at(d,30),a+b);
  for(let x=10;x<=30;x+=.5)assert.ok(Math.abs(at(d,x)-(a+(x-10)*b/20))<1e-9);
 }
});
test('cumulative graph is non-decreasing and ends at total, including empty groups',()=>{
 for(let k=0;k<50;k++){
  const d=distribution([0,10,20,40,60],[k%11,(k*3)%21,(k*7)%41,(k*11)%31]);
  let previous=0;
  for(let x=0;x<=60;x+=.25){const next=at(d,x);assert.ok(next>=previous-1e-9);previous=next;}
  assert.equal(previous,d.total);assert.equal(at(d,-1),0);assert.equal(at(d,100),d.total);
 }
});
test('quartiles use explicit within-group estimates and the left edge of plateaus',()=>{
 const d=distribution([0,10,20,40,60],[10,20,20,10]);
 assert.equal(q(d,.25),12.5);assert.equal(q(d,.5),20);assert.equal(q(d,.75),35);
 assert.equal(q(d,.75)-q(d,.25),22.5);
 assert.equal(q(distribution([0,10,20,30],[10,0,10]),.5),10);
 for(const rank of [0,.25,.5,.75,1])assert.equal(q(distribution([0,10,30],[0,0]),rank),null);
});
test('invalid distributions, coordinates and numeric entries are rejected without evaluation',()=>{
 for(const [bounds,counts]of [[[0,0],[2]],[[0,1],[-1]],[[0,Infinity],[2]],[[0,1],[NaN]],[[0],[1]],[[0],[]]])assert.throws(()=>distribution(bounds,counts));
 assert.throws(()=>at(distribution([0,1],[1]),NaN));assert.throws(()=>q(distribution([0,1],[1]),1.1));
 for(const value of ['', ' ', '1/0','NaN','Infinity','2+2','0x10','1/2/3','<script>'])assert.equal(number(value),null,value);
 assert.equal(number('−1/2'),-.5);assert.equal(number('45/2'),22.5);assert.equal(number('.5'),.5);assert.equal(number('0'),0);
});
