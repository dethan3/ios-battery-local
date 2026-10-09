// iOS Analytics schemas are undocumented. These aliases are observations, not guarantees.
export const definitions = [
 ['cycles','循环次数',['CycleCount','BatteryCycleCount'],0,100000,'次'],
 ['health','日志中的最大容量比例',['MaximumCapacityPercent','BatteryHealthMetric'],0,150,'%'],
 ['nominal','标称满充容量',['NominalChargeCapacity'],1,30000,'原始单位'],
 ['raw','原始满充容量',['AppleRawMaxCapacity','RawMaxCapacity'],1,30000,'原始单位'],
 ['design','设计容量',['DesignCapacity'],1,30000,'原始单位'],
 ['maximum','最大满充容量',['MaximumFCC'],1,30000,'原始单位']
];
const hardware = /^(product|producttype|hardwaremodel|hwmodel|modelcode|boardid|chipid|socid|cpuid|batterymodel|batterymanufacturer|batteryvendor|nandmanufacturer|nandvendor|storagemodel)$/i;
function normalized(key) { return key.replace(/^.*\./,'').replace(/^(last_value_|lastvalue_)/i,''); }
export function parseAnalytics(input) {
 if (typeof input !== 'string' || !input.trim()) throw new Error('文件为空。');
 const text = input.replace(/^\uFEFF/,'');
 const roots=[]; let start=-1, depth=0, quoted=false, escaped=false, malformed=0;
 // Frame consecutive / newline-delimited JSON objects without interpreting strings as code.
 for(let i=0;i<text.length;i++) {
  const c=text[i];
  if(start<0) { if(c==='{'||c==='['){start=i;depth=1;} continue; }
  if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;continue;}
  if(c==='"')quoted=true;
  else if(c==='{'||c==='[')depth++;
  else if(c==='}'||c===']'){depth--;if(depth===0){try{roots.push(JSON.parse(text.slice(start,i+1)));}catch{malformed++;}start=-1;}}
 }
 if(start>=0)malformed++;
 if(!roots.length)throw new Error('未找到可读取的 JSON 记录。请选择未压缩的 iOS Analytics .ips 文件。');
 const observations=[], identifiers=[];let visited=0,limited=false;
 roots.forEach((root,record)=>{
  const stack=[{value:root,path:`记录 ${record+1}`,level:0}];
  while(stack.length){const {value,path,level}=stack.pop();if(++visited>500000){limited=true;break;}
   if(!value||typeof value!=='object')continue;
   if(level>60){limited=true;continue;}
   for(const [key,v] of Object.entries(value)){
    const p=`${path}.${key}`, k=normalized(key);
    if(v&&typeof v==='object'){stack.push({value:v,path:p,level:level+1});continue;}
    for(const [id,label,aliases,min,max,unit] of definitions){
     if(!aliases.some(a=>a.toLowerCase()===k.toLowerCase()))continue;
     const n=typeof v==='number'?v:typeof v==='string'&&/^\d+(\.\d+)?$/.test(v)?Number(v):NaN;
     observations.push({id,label,key,path:p,record,value:v,number:Number.isFinite(n)&&n>=min&&n<=max&&(id!=='cycles'||Number.isInteger(n))?n:null,unit});
    }
    if(hardware.test(k)&&['string','number'].includes(typeof v))identifiers.push({key,path:p,value:String(v).slice(0,160)});
   }
  }
 });
 const metrics=definitions.map(([id,label,,, ,unit])=>{
  const matches=observations.filter(o=>o.id===id), valid=matches.filter(o=>o.number!==null);
  const values=[...new Set(valid.map(o=>o.number))];
  return {id,label,unit,values,matches,conflict:values.length>1};
 });
 // Never combine capacity values across records or infer a missing design capacity.
 const estimates=[];
 for(let record=0;record<roots.length;record++){
  const a=observations.filter(o=>o.record===record&&o.id==='nominal'&&o.number!==null);
  const b=observations.filter(o=>o.record===record&&o.id==='design'&&o.number!==null);
  if(a.length===1&&b.length===1&&a[0].path.replace(/\.[^.]+$/,'')===b[0].path.replace(/\.[^.]+$/,''))estimates.push({percent:Math.round(a[0].number/b[0].number*1000)/10,source:[a[0].path,b[0].path]});
 }
 return {records:roots.length,malformed,limited,metrics,identifiers,estimates,crash:roots.some(r=>String(r?.bug_type)==='309')};
}
