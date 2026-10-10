import {components,cleanKey,mask,panelCandidate} from './rules.js';
export const batteryDefinitions=[
 ['cycles','循环次数',['cyclecount','batterycyclecount'],0,100000,'次'],
 ['health','日志最大容量比例',['maximumcapacitypercent'],0,150,'%'],
 ['nominal','标称满充容量',['nominalchargecapacity'],1,30000,'原始单位'],
 ['raw','原始满充容量',['applerawmaxcapacity','rawmaxcapacity'],1,30000,'原始单位'],
 ['design','设计容量',['designcapacity'],1,30000,'原始单位'],
 ['maximum','最大满充容量',['maximumfcc','maxfcc'],1,30000,'原始单位']
];
const deviceFields={product:'设备代码',producttype:'设备代码',productname:'设备名称',marketingname:'设备名称',hardwaremodel:'主板代码',hwmodel:'主板代码',modelnumber:'型号号码',productsku:'地区代码',osversion:'系统版本',productversion:'系统版本',buildversion:'系统构建',devicecapacity:'存储容量（日志原值）',dramSize:'内存容量（日志原值）',dramsize:'内存容量（日志原值）',ramcapacity:'内存容量',storagecapacity:'存储容量',serialnumber:'设备序列号',deviceserialnumber:'设备序列号'};
const explicit={
 screen:['rawpanelserialnumber','panelserialnumber','displaymanufacturer','displayvendor','panelmanufacturer','panelvendor','displaymodel','panelmodel'],
 battery:['batterymanufacturer','batteryvendor','batterymodel','batteryserialnumber','cellmanufacturer','packmanufacturer'],
 memory:['dramvendor','drammanufacturer','rammanufacturer','ramvendor','drampartnumber','rammodel','ramcapacity'],
 storage:['nandmanufacturer','nandvendor','storagemanufacturer','storagevendor','nandmodel','storagemodel','nandpartnumber','nandtype','storagetype','storagecapacity'],
 front:['frontcameravendor','frontcameramanufacturer','frontcameramodel','frontcameraserialnumber'],
 rear:['rearcameravendor','rearcameramanufacturer','rearcameramodel','rearcameraserialnumber','widecameravendor','widecameramodel'],
 ultrawide:['ultrawidecameravendor','ultrawidecameramanufacturer','ultrawidecameramodel','ultrawidecameraserialnumber'],
 telephoto:['telephotocameravendor','telephotocameramanufacturer','telephotocameramodel','telephotocameraserialnumber']
};
function contextComponent(path){const p=path.toLowerCase();if(/ultra.?wide|super.?wide|swide/.test(p))return 'ultrawide';if(/telephoto/.test(p))return 'telephoto';if(/front.?camera|camera.?front/.test(p))return 'front';if(/rear.?camera|camera.?rear|wide.?camera/.test(p))return 'rear';if(/smartbattery|batteryhealth|applebattery|batterydata|battery\//.test(p))return 'battery';if(/dram|rammodule/.test(p))return 'memory';if(/nand|applenand|storagecontroller/.test(p))return 'storage';if(/displaypanel|appleclcd|paneldata/.test(p))return 'screen';return null;}
function readable(raw){let s=String(raw).trim().replace(/[,;]$/,'');const q=s.match(/^<?"([\s\S]*?)">?$/);if(q)return q[1].replace(/\\0/g,'').trim();if(/^<[a-f0-9\s]+>$/i.test(s)){const h=s.slice(1,-1).replace(/\s/g,'');if(h.length%2===0&&h.length<512){const a=h.match(/../g)?.map(x=>parseInt(x,16))||[];if(a.every(n=>n===0||n>=32&&n<127))return String.fromCharCode(...a).replace(/\0/g,'').trim();}}return s;}
const invalid=s=>!s||/^(unknown|<unknown>|null|n\/a|not available)$/i.test(s);
export class Analyzer{
 constructor(){this.records=0;this.malformed=0;this.oversized=0;this.fields=[];this.hardware=[];this.batteries=new Map();this.deviceIds=new Map();this.kinds=new Set();this.diagnosticSources=new Set();this.warnings=[];this.limit=false;this.devices=[];this.dates=[];this.seen=new Set();}
 subject(id,fallback){if(!id)return fallback;if(!this.deviceIds.has(id)){if(this.deviceIds.size>=32){this.limit=true;return '设备标识超出预算';}this.deviceIds.set(id,'日志设备 '+(this.deviceIds.size+1));}return this.deviceIds.get(id);}
 add(list,row){if(list.length>=250){this.limit=true;return;}const key=JSON.stringify([row.component,row.key,row.value,row.source,row.subject,row.path]);if(this.seen.has(key))return;this.seen.add(key);if(list.length>=250){this.limit=true;return;}list.push(row);}
 field(key,raw,{source='本地文件',path='',subject='设备未标明',record=0,object=''}={}){
  if(!['string','number'].includes(typeof raw))return;
  const k=cleanKey(key),value=readable(raw).slice(0,180);if(invalid(value))return;
  if(deviceFields[k]&&!(k==='serialnumber'&&contextComponent(path)))this.add(this.fields,{key,label:deviceFields[k],value:/serialnumber/.test(k)?mask(value):value,source,path,subject});
  if(k==='timestamp'||k==='starttimestamp'||k==='endtimestamp'){if(this.dates.length<20&&!this.dates.includes(value))this.dates.push(value);}
  if(k==='compatible'){const product=value.match(/i(?:Phone|Pad|Pod)\d+,\d+/)?.[0];if(product)this.add(this.fields,{key,label:'设备代码',value:product,source,path,subject});}
  let component=Object.keys(explicit).find(c=>explicit[c].includes(k));
  if(!component&&/^(manufacturer|vendor|model|partnumber|serialnumber)$/.test(k))component=contextComponent(path);
  if(component){const serial=/serial/.test(k);const kind=/manufacturer|vendor/.test(k)?'日志厂商文本':serial?'部件代码':/type/.test(k)?'日志类型':'日志型号 / 参数';const row={component,key,value:serial?mask(value):value,source,path,subject,kind};if(component==='screen'&&/panelserialnumber/.test(k)){row.code=value.slice(0,3);row.candidate=panelCandidate(value);}this.add(this.hardware,row);}
  for(const [id,label,aliases,min,max,unit] of batteryDefinitions){if(!aliases.includes(k))continue;
   // Battery aliases in a clearly unrelated component must not become battery evidence.
   const c=contextComponent(path);if(c&&c!=='battery')continue;
   const n=/^(?:\d+(?:\.\d+)?)$/.test(value)?Number(value):NaN;
   const number=Number.isFinite(n)&&n>=min&&n<=max&&(id!=='cycles'||Number.isInteger(n))?n:null;
   const groupKey=subject+'|'+source;
   if(!this.batteries.has(groupKey)&&this.batteries.size>=32){this.limit=true;continue;}if(!this.batteries.has(groupKey))this.batteries.set(groupKey,{subject,source,observations:[]});
   const group=this.batteries.get(groupKey);if(group.observations.length<120)group.observations.push({id,label,key,value,number,unit,path,source,subject,record,object});else this.limit=true;
  }
 }
 object(root,source,record){this.records++;const bug=String(root?.bug_type||'');if(bug==='211')this.kinds.add('Analytics');if(bug==='309'||bug==='298'){this.diagnosticSources.add(source);this.kinds.add(bug==='298'?'JetsamEvent':'崩溃报告');return;}
  if(this.diagnosticSources.has(source))return;const subject=this.subject(root?.deviceId,source);const stack=[{v:root,path:typeof root?.name==='string'?root.name.slice(0,100)+' · 记录 '+record:'记录 '+record,level:0}];let visited=0;
  while(stack.length){const {v,path,level}=stack.pop();if(++visited>100000||level>60){this.limit=true;continue;}if(!v||typeof v!=='object')continue;
   for(const [k,x] of Object.entries(v)){if(x&&typeof x==='object')stack.push({v:x,path:path+'.'+k,level:level+1});else this.field(k,x,{source,path:path+'.'+k,subject,record,object:path});}
  }
 }
 finish(){const batteryGroups=[...this.batteries.values()].map(g=>{
  const metrics=batteryDefinitions.map(([id,label,,,,unit])=>{const matches=g.observations.filter(o=>o.id===id);const values=[...new Set(matches.filter(o=>o.number!==null).map(o=>o.number))];return {id,label,unit,values,matches,conflict:values.length>1};});
  const estimates=[];const pairs=new Map();for(const o of g.observations){if(o.number===null||!['nominal','design'].includes(o.id))continue;const k=o.record+'|'+o.object;if(!pairs.has(k))pairs.set(k,{nominal:[],design:[]});pairs.get(k)[o.id].push(o);}
  for(const p of pairs.values())if(p.nominal.length===1&&p.design.length===1)estimates.push({percent:Math.round(p.nominal[0].number/p.design[0].number*1000)/10,source:[p.nominal[0].path,p.design[0].path]});
  return {subject:g.subject,source:g.source,metrics,estimates};
 });
  return {records:this.records,malformed:this.malformed,oversized:this.oversized,limited:this.limit,fields:this.fields,hardware:this.hardware,batteryGroups,dates:this.dates,kinds:[...this.kinds],warnings:this.warnings,components:components.map(([id,label])=>({id,label,observations:this.hardware.filter(x=>x.component===id)}))};
 }
}
// A bounded scanner handles JSON sequences and ioreg/plist/key-value text in one pass.
export class TextScanner{
 constructor(analyzer,source){this.a=analyzer;this.source=source;this.frame='';this.depth=0;this.quote=false;this.escape=false;this.allowed=true;this.drop=false;this.line='';this.lineDrop=false;this.lineNumber=0;this.record=0;this.node='';this.plistKey=null;this.jsonLine=false;this.nodeRecord=0;}
 push(text){for(const c of text){
  if(this.depth){this.jsonLine=true;if(!this.drop){this.frame+=c;if(this.frame.length>2*1024*1024){this.drop=true;this.frame='';this.a.oversized++;}}
   if(this.quote){if(this.escape)this.escape=false;else if(c==='\\')this.escape=true;else if(c==='"')this.quote=false;}
   else if(c==='"')this.quote=true;else if(c==='{'||c==='[')this.depth++;else if(c==='}'||c===']'){if(--this.depth===0){if(!this.drop)try{this.a.object(JSON.parse(this.frame),this.source,++this.record);}catch{this.a.malformed++;}this.frame='';this.drop=false;this.allowed=true;}}
  }else if(this.allowed&&(c==='{'||c==='[')){this.depth=1;this.jsonLine=true;this.frame=c;this.quote=false;this.escape=false;}else if(!/\s|\uFEFF/.test(c))this.allowed=false;
  if(c==='\n'){this.processLine();this.allowed=!this.depth;}
  else if(!this.lineDrop){this.line+=c;if(this.line.length>256*1024){this.lineDrop=true;this.line='';}}
 }}
 processLine(){this.lineNumber++;if(this.jsonLine){this.jsonLine=false;this.line='';this.lineDrop=false;return;}if(this.lineDrop){this.lineDrop=false;this.a.limit=true;return;}const line=this.line.trim();this.line='';if(!line||line[0]==='{'||line[0]==='[')return;
  const node=line.match(/\+\-o\s+([^<]+)/)||line.match(/^([\w@,\-/]+):$/);if(node){this.node=node[1].trim().slice(0,120);this.nodeRecord++;return;}
  const context={source:this.source,path:this.node+' · 行 '+this.lineNumber,subject:this.source,record:this.nodeRecord,object:this.node};
  // XML plist support is limited to scalar key/value pairs; no entity or external resource expansion.
  const xml=/<key>([^<]+)<\/key>\s*<(string|integer|real)>([^<]*)<\/\2>/g;let m;
  while((m=xml.exec(line)))this.a.field(m[1],m[3],context);
  const pending=line.match(/^<key>([^<]+)<\/key>$/);if(pending){this.plistKey=pending[1];return;}
  if(this.plistKey){const v=line.match(/^<(string|integer|real)>([^<]*)<\/\1>$/);if(v)this.a.field(this.plistKey,v[2],context);this.plistKey=null;}
  const kv=line.match(/"([\w.,-]+)"\s*=\s*(.+)/)||line.match(/(?:^|\s)([\w.-]+)\s*(?:\(\d+\))?\s*[:=]\s*(.+)/);
  if(kv)this.a.field(kv[1],kv[2],context);
 }
 end(){if(this.line)this.processLine();if(this.depth)this.a.malformed++;}
}
