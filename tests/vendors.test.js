import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lookupCode,knownVendor} from '../rules.js';

test('longest matching prefix in the local table names the vendor',()=>{
 assert.deepEqual(lookupCode('screen','g9nabc'),{vendor:'三星显示 Samsung Display',code:'G9N',rule:'panel-samsung-g9',confidence:'资料对照 · 未独立验证',reference:'https://wker.com/iphone-samsung/'});
 assert.equal(lookupCode('screen','G9Qxx').code,'G9Q');
 assert.equal(lookupCode('screen','GH3xx').vendor,'LG Display');
 assert.equal(lookupCode('screen','GVCxx').code,'GVC');
 assert.equal(lookupCode('screen','B03xx').vendor,'京东方 BOE');
 assert.equal(lookupCode('battery','F8YPRIVATE').vendor,'欣旺达 Sunwoda');
 assert.equal(lookupCode('battery','fg9private').vendor,'新普科技 Simplo');
 assert.equal(lookupCode('battery','F9Yxx').code,'F9Y');
});

test('unknown codes, NAND type, and the wrong component stay unmapped',()=>{
 assert.equal(lookupCode('screen','JLNPRIVATE'),null);
 assert.equal(lookupCode('battery','G9NPRIVATE'),null);
 assert.equal(lookupCode('storage','TLC'),null);
 assert.equal(lookupCode('screen',''),null);
 assert.equal(knownVendor('Hynix'),'海力士 SK hynix');
 assert.equal(knownVendor('SK hynix'),'海力士 SK hynix');
 assert.equal(knownVendor('Sunwoda'),'欣旺达 Sunwoda');
 assert.equal(knownVendor('Desay'),'惠州德赛 Desay');
 assert.equal(knownVendor('Cowell'),'高伟电子 Cowell');
 assert.equal(knownVendor('Hon Hai'),'富士康 Foxconn');
 assert.equal(knownVendor('LG Display'),'LG');
 assert.equal(knownVendor('Kioxia'),'铠侠 Kioxia');
 assert.equal(knownVendor('TLC'),'TLC');
 assert.equal(knownVendor('MysteryCo'),'MysteryCo');
});
