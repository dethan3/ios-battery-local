// Offline rules are deliberately narrow. No vendor-based quality score is assigned.
export const components=[['screen','屏幕'],['battery','电池'],['storage','闪存 / 存储'],['memory','运行内存'],['front','前置摄像头'],['rear','后置主摄'],['ultrawide','超广角摄像头'],['telephoto','长焦摄像头']];
export const panelRules=[
 {prefixes:['G9N','G9P','G9Q'],vendor:'三星显示 Samsung Display',id:'panel-prefix-samsung-v1'},
 {prefixes:['GVC','GH3'],vendor:'LG Display',id:'panel-prefix-lg-v1'}
];
export const panelReference='https://www.reddit.com/r/iphone18pro/comments/1wss5qr/sidebyside_display_comparison_gvclg_vs_g9nsamsung/';
export const treeReference='https://gist.github.com/bazad/1faef1a6fe396b820a43170b43e38be1';
export const parserReference='https://github.com/IsMyPhonePwned/sysdiagnose-extractor-library';
export function panelCandidate(value){const prefix=String(value).slice(0,3).toUpperCase();const r=panelRules.find(r=>r.prefixes.includes(prefix));return r?{vendor:r.vendor,code:prefix,rule:r.id,confidence:'社区映射 · 未独立验证',reference:panelReference}:null;}
export function mask(value){const s=String(value);return s.length>7?s.slice(0,3)+'•••'+s.slice(-3):'•••';}
export function cleanKey(k){return k.replace(/^.*\./,'').replace(/^(last_value_|lastvalue_)/i,'').replace(/[^a-z0-9]/gi,'').toLowerCase();}
