// Offline rules are deliberately narrow. No vendor-based quality score is assigned.
import {codeRules,nameRules} from './vendors.js';
export const components=[['screen','屏幕'],['battery','电池'],['storage','闪存 / 存储'],['memory','运行内存'],['front','前置摄像头'],['rear','后置主摄'],['ultrawide','超广角摄像头'],['telephoto','长焦摄像头']];
export const treeReference='https://gist.github.com/bazad/1faef1a6fe396b820a43170b43e38be1';
export const parserReference='https://github.com/IsMyPhonePwned/sysdiagnose-extractor-library';
export function lookupCode(component,value){const s=String(value).toUpperCase();const hits=codeRules.filter(r=>r.component===component).flatMap(r=>r.prefixes.filter(p=>s.startsWith(p)).map(p=>({p,r}))).sort((a,b)=>b.p.length-a.p.length);const hit=hits[0];return hit?{vendor:hit.r.vendor,code:hit.p,rule:hit.r.id,confidence:'资料对照 · 未独立验证',reference:hit.r.source}:null;}
export function knownVendor(value){const s=String(value).trim();const hit=nameRules.find(r=>r.test.test(s));return hit?hit.vendor:s;}
export function mask(value){const s=String(value);return s.length>7?s.slice(0,3)+'•••'+s.slice(-3):'•••';}
export function cleanKey(k){return k.replace(/^.*\./,'').replace(/^(last_value_|lastvalue_)/i,'').replace(/[^a-z0-9]/gi,'').toLowerCase();}
