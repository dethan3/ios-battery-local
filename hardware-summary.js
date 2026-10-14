import {knownVendor} from './rules.js';
export function vendorLabel(value){const s=knownVendor(value);return /[\u4e00-\u9fff]/.test(s)?s.replace(/\s+[A-Za-z].*$/,''):s;}
const unique=values=>[...new Set(values)];
export function hardwareSummary(rows,community=true){
 const direct=rows.filter(x=>x.kind==='日志厂商文本'),candidates=community?rows.filter(x=>x.candidate):[];
 const vendor=unique(direct.map(x=>vendorLabel(x.value))),types=unique(rows.filter(x=>x.kind==='日志类型').map(x=>x.display||x.value)),sizes=unique(rows.filter(x=>x.kind==='日志容量').map(x=>x.display||x.value));
 const parts=[...vendor];if(!parts.length)parts.push(...unique(candidates.map(x=>vendorLabel(x.candidate.vendor)+'（候选）')));
 if(rows.some(x=>x.component==='screen'))parts.push(...unique(rows.filter(x=>x.code).map(x=>x.code)));
 if(rows.some(x=>x.component==='memory'))parts.push(...sizes,...types);else parts.push(...types,...sizes);
 if(!parts.length){const models=rows.filter(x=>x.kind==='日志型号 / 参数');if(models.length)parts.push(...unique(models.map(x=>x.display||x.value)).slice(0,2));else if(rows.some(x=>x.kind==='部件代码'))parts.push(...unique(rows.filter(x=>x.kind==='部件代码').map(x=>'代号 '+(x.code||x.value.slice(0,3)))),'厂商未确认');else if(rows.some(x=>x.kind==='日志芯片代码'))parts.push(...unique(rows.filter(x=>x.kind==='日志芯片代码').map(x=>'芯片代号 '+x.value)));else if(rows.some(x=>x.kind==='日志模组代码'))parts.push(...unique(rows.filter(x=>x.kind==='日志模组代码').map(x=>'模组代码 '+x.value)),'厂商未确认');}
 const conflict=vendor.length>1||types.length>1||sizes.length>1;
 return {label:unique(parts).join(' · ')||'未识别',confidence:conflict?'多个值 · 查看来源':direct.length?'日志直接记录':candidates.length?'代码对照 · 未验证':rows.length?'原始参数 · 查看来源':'无可读字段',conflict,available:parts.length>0};
}
