import {Analyzer,TextScanner} from './analyzer.js';
import {isBinaryPlist,parseBinaryPlist} from './plist.js';
const MAX_INPUT=2*1024**3,MAX_EXPANDED=2*1024**3,MAX_STRUCTURED=8*1024*1024;
export function relevant(name){return /(?:^|\/)(?:ioreg\/[^/]+\.txt|IODeviceTree(?:\.txt)?|IOService(?:\.txt)?|remotectl_dumpstate(?:\.txt)?|SystemVersion\.plist|deviceinfo\.(?:txt|json))$/i.test(name)||/(?:^|\/)Battery(?:Health|BDC|UIPlist)\/[^/]+\.(?:txt|log|json|csv|plist)$/i.test(name)||/(?:^|\/)Analytics-[^/]+(?:\.ips(?:\.ca\.synced)?|\.json)$/i.test(name);}
function applyStructured(name,bytes,a){const source=safeSource(name);if(isBinaryPlist(bytes)){try{a.object(parseBinaryPlist(bytes),source,1);}catch{a.warnings.push(`无法读取二进制 plist：${source}`);}return;}const text=new TextDecoder().decode(bytes);if(/BatteryBDC/i.test(name)&&/\.csv$/i.test(name)||looksLikeBatteryCsv(text))a.noteBdc(name,text);else{const scanner=new TextScanner(a,source);scanner.push(text);scanner.end();}}
function looksLikeBatteryCsv(text){const line=(text.split(/\r?\n/,1)[0]||'').trim();return !!line&&line[0]!=='{'&&line[0]!=='['&&line[0]!=='<'&&/(?:^|,)\s*"?(?:CycleCount|MaxCapacityPercent|DesignCapacity)"?\s*(?:,|$)/i.test(line);}
function safeSource(name){return name.split(/[\\/]/).slice(-2).join('/').replace(/sysdiagnose_[^/]+\//,'');}
class Reader{
 constructor(stream){this.r=stream.getReader();this.chunk=new Uint8Array();this.offset=0;this.total=0;this.ended=false;}
 async available(){if(this.offset<this.chunk.length)return true;const x=await this.r.read();if(x.done){this.ended=true;return false;}this.chunk=x.value;this.offset=0;this.total+=x.value.length;if(this.total>MAX_EXPANDED){await this.r.cancel();throw new Error('解压后的数据超过 2 GiB 安全预算，已停止。');}return true;}
 async read(n){const out=new Uint8Array(n);let used=0;while(used<n&&await this.available()){const size=Math.min(n-used,this.chunk.length-this.offset);out.set(this.chunk.subarray(this.offset,this.offset+size),used);this.offset+=size;used+=size;}return out.subarray(0,used);}
 async consume(n,fn){while(n>0){if(!await this.available())throw new Error('诊断包被截断。');const size=Math.min(n,this.chunk.length-this.offset,64*1024);const part=this.chunk.subarray(this.offset,this.offset+size);if(fn)fn(part);this.offset+=size;n-=size;}}
 async rest(fn){while(await this.available()){const part=this.chunk.subarray(this.offset);this.offset=this.chunk.length;if(fn)fn(part);}}
 async cancel(){await this.r.cancel();}
}
const ascii=bytes=>new TextDecoder().decode(bytes).replace(/\0.*$/s,'');
function octal(bytes){const s=ascii(bytes).trim();if(!/^[0-7]*$/.test(s))throw new Error('不支持这个 TAR 数字编码。');return parseInt(s||'0',8);}
function isTar(b){if(b.length<512||!b.some(x=>x))return false;let sum=0;for(let i=0;i<512;i++)sum+=i>=148&&i<156?32:b[i];try{return sum===octal(b.subarray(148,156));}catch{return false;}}
function parsePax(bytes){const text=new TextDecoder().decode(bytes),out={};for(const l of text.split('\n')){const m=l.match(/^\d+ ([\w.]+)=(.*)$/);if(m)out[m[1]]=m[2];}return out;}
async function scanText(reader,head,a,source){const scanner=new TextScanner(a,source),decoder=new TextDecoder('utf-8',{fatal:false});scanner.push(decoder.decode(head,{stream:true}));await reader.rest(b=>scanner.push(decoder.decode(b,{stream:true})));scanner.push(decoder.decode());scanner.end();}
async function scanTar(reader,first,a,progress){let header=first,pax={},globalPax={},longname='',entries=0,selected=0,skipped=0;
 while(header.length===512&&header.some(x=>x)){
  if(!isTar(header))throw new Error('TAR 文件头校验失败；结果未接受。');if(++entries>20000)throw new Error('诊断包条目超过 20000 个，已停止。');
  const base=ascii(header.subarray(0,100)),prefix=ascii(header.subarray(345,500)),type=String.fromCharCode(header[156]||48);let size=octal(header.subarray(124,136));let name=longname||pax.path||globalPax.path||(prefix?prefix+'/':'')+base;
  if(pax.size||globalPax.size){size=Number(pax.size||globalPax.size);if(!Number.isSafeInteger(size)||size<0)throw new Error('TAR 条目大小无效。');}
  if(['x','g','L'].includes(type)){if(size>65536)throw new Error('TAR 路径元数据过大。');const data=await reader.read(size);if(data.length!==size)throw new Error('TAR 元数据被截断。');if(type==='L')longname=ascii(data).trim();else if(type==='g')globalPax={...globalPax,...parsePax(data)};else pax=parsePax(data);}
  else{const safe=!name.startsWith('/')&&!name.split('/').includes('..')&&!name.includes('\\');const wanted=safe&&['0','\0','7'].includes(type)&&relevant(name);
   if(wanted&&size<=512*1024**2){selected++;if(/\.(?:csv|plist)$/i.test(name)){if(size>MAX_STRUCTURED){a.warnings.push('有相关表格或 plist 超过 8 MiB，已跳过。');await reader.consume(size);}else{const data=await reader.read(size);if(data.length!==size)throw new Error('诊断包条目被截断。');applyStructured(name,data,a);}}else{const source=safeSource(name),scanner=new TextScanner(a,source),decoder=new TextDecoder();await reader.consume(size,b=>scanner.push(decoder.decode(b,{stream:true})));scanner.push(decoder.decode());scanner.end();}}
   else{skipped++;await reader.consume(size);if(wanted)a.warnings.push('有相关条目超过 512 MiB，已跳过。');}
   pax={};longname='';
  }
  const padding=(512-size%512)%512;await reader.consume(padding);if(entries%25===0)progress({phase:'正在扫描诊断包',entries,selected,skipped});header=await reader.read(512);
 }
 if(header.length!==512)throw new Error('TAR 结束标记被截断。');
 // Drain gzip through its checksum; a damaged archive must not produce a successful report.
 await reader.rest();return {entries,selected,skipped};
}
const crcTable=Array.from({length:256},(_,i)=>{for(let j=0;j<8;j++)i=i&1?0xedb88320^(i>>>1):i>>>1;return i>>>0;});
function crcUpdate(crc,bytes){for(const b of bytes)crc=crcTable[(crc^b)&255]^(crc>>>8);return crc;}
async function scanZip(file,a,progress){const tail=new Uint8Array(await file.slice(Math.max(0,file.size-65557)).arrayBuffer());let pos=-1;for(let i=tail.length-22;i>=0;i--){if(new DataView(tail.buffer).getUint32(i,true)===0x06054b50&&i+22+new DataView(tail.buffer).getUint16(i+20,true)===tail.length){pos=i;break;}}
 if(pos<0)throw new Error('ZIP 目录缺失或损坏。');const end=new DataView(tail.buffer,pos);const count=end.getUint16(10,true),size=end.getUint32(12,true),offset=end.getUint32(16,true);
 if(end.getUint16(4,true)||end.getUint16(6,true)||count===65535||offset===0xffffffff||size===0xffffffff)throw new Error('暂不支持分卷或 ZIP64，请改选 .tar.gz 或已解压的相关文件。');
 if(count>20000||size>16*1024**2||offset+size>file.size)throw new Error('ZIP 目录超过安全预算或已损坏。');const directory=new Uint8Array(await file.slice(offset,offset+size).arrayBuffer());let p=0,selected=0,skipped=0,expanded=0;
 for(let i=0;i<count;i++){
  if(p+46>directory.length)throw new Error('ZIP 目录被截断。');const d=new DataView(directory.buffer,p);if(d.getUint32(0,true)!==0x02014b50)throw new Error('ZIP 目录无效。');
  const flags=d.getUint16(8,true),method=d.getUint16(10,true),expectedCRC=d.getUint32(16,true),compressed=d.getUint32(20,true),uncompressed=d.getUint32(24,true),nameLen=d.getUint16(28,true),extraLen=d.getUint16(30,true),commentLen=d.getUint16(32,true),local=d.getUint32(42,true);
  if(p+46+nameLen+extraLen+commentLen>directory.length)throw new Error('ZIP 文件名被截断。');const name=new TextDecoder().decode(directory.subarray(p+46,p+46+nameLen));p+=46+nameLen+extraLen+commentLen;
  if(!relevant(name)||name.startsWith('/')||name.split('/').includes('..')||name.includes('\\')){skipped++;continue;}
  if(flags&1)throw new Error('相关文件已加密，请先在本机解密后再选择。');if(![0,8].includes(method))throw new Error('ZIP 压缩算法暂不支持，请改选 .tar.gz 或已解压文件。');
  if(uncompressed>512*1024**2||compressed===0xffffffff||local===0xffffffff||(/\.(?:csv|plist)$/i.test(name)&&uncompressed>MAX_STRUCTURED)){skipped++;a.warnings.push('有相关 ZIP 条目超过安全预算，已跳过。');continue;}
  const h=new DataView(await file.slice(local,local+30).arrayBuffer());if(h.byteLength<30||h.getUint32(0,true)!==0x04034b50)throw new Error('ZIP 条目文件头损坏。');const start=local+30+h.getUint16(26,true)+h.getUint16(28,true);if(start+compressed>file.size)throw new Error('ZIP 条目被截断。');
  let stream=file.slice(start,start+compressed).stream();if(method===8){try{stream=stream.pipeThrough(new DecompressionStream('deflate-raw'));}catch{throw new Error('此 Safari 版本不支持 ZIP 解压，请选 .tar.gz 或已解压文件。');}}
  const structured=/\.(?:csv|plist)$/i.test(name)&&uncompressed<=MAX_STRUCTURED;
  const reader=stream.getReader(),scanner=structured?null:new TextScanner(a,safeSource(name)),decoder=new TextDecoder();let bytes=0,crc=0xffffffff;const chunks=structured?[]:null;
  try{while(true){const x=await reader.read();if(x.done)break;bytes+=x.value.length;expanded+=x.value.length;if(bytes>uncompressed||expanded>MAX_EXPANDED)throw new Error('ZIP 解压超过声明大小或安全预算。');crc=crcUpdate(crc,x.value);if(structured)chunks.push(x.value);else scanner.push(decoder.decode(x.value,{stream:true}));}}catch(e){await reader.cancel().catch(()=>{});throw e;}
  if(bytes!==uncompressed||((crc^0xffffffff)>>>0)!==expectedCRC)throw new Error('ZIP 内容校验失败；结果未接受。');
  if(structured){const data=new Uint8Array(bytes);let at=0;for(const c of chunks){data.set(c,at);at+=c.length;}applyStructured(name,data,a);}else{scanner.push(decoder.decode());scanner.end();}selected++;progress({phase:'正在扫描 ZIP',entries:i+1,selected,skipped});
 }
 return {entries:count,selected,skipped};
}
export async function analyzeFile(file,progress=()=>{}){
 if(!file.size)throw new Error('文件为空。');if(file.size>MAX_INPUT)throw new Error('单文件超过 2 GiB 安全预算，请选择已解压的相关记录。');
 const first=new Uint8Array(await file.slice(0,512).arrayBuffer()),a=new Analyzer();let type='文本 / 键值日志',archive=null,read=0,last=0;
 if(first[0]===80&&first[1]===75&&first[2]===3&&first[3]===4){type='ZIP 诊断包';archive=await scanZip(file,a,progress);}
 else{
  let stream=file.stream().pipeThrough(new TransformStream({transform(chunk,c){read+=chunk.length;const now=Date.now();if(now-last>150){last=now;progress({phase:'本地读取',percent:Math.min(99,Math.floor(read/file.size*100))});}c.enqueue(chunk);}}));
  if(first[0]===31&&first[1]===139){type='GZIP';try{stream=stream.pipeThrough(new DecompressionStream('gzip'));}catch{throw new Error('此浏览器不支持本地 GZIP 解压，请先在本机解压。');}}
  const reader=new Reader(stream);try{const head=await reader.read(512);
   if(isTar(head)){type=type==='GZIP'?'TAR.GZ 诊断包':'TAR 诊断包';archive=await scanTar(reader,head,a,progress);}
   else{const text=new TextDecoder().decode(head);const csv=looksLikeBatteryCsv(text);
    if(isBinaryPlist(head)||csv){const parts=[head];let total=head.length;await reader.rest(b=>{total+=b.length;if(total>MAX_STRUCTURED)throw new Error('这个 plist 或表格超过 8 MiB，已停止。');parts.push(b);});const all=new Uint8Array(total);let at=0;for(const p of parts){all.set(p,at);at+=p.length;}if(isBinaryPlist(all)){type='二进制 plist';applyStructured('所选文件.plist',all,a);}else{type='电池表格';applyStructured('BatteryBDC/所选文件.csv',all,a);}}
    else{if(head.subarray(0,100).filter(b=>b===0).length>10)throw new Error('此二进制文件不是支持的日志或诊断包。');await scanText(reader,head,a,'所选文件');if(a.kinds.has('Analytics')||/^\s*[\[{]/.test(text))type='Analytics / JSON 记录';}}
  }finally{await reader.cancel().catch(()=>{});}
 }
 const result=a.finish();const useful=result.fields.length+result.hardware.length+result.batteryGroups.length;
 if(result.kinds.includes('JetsamEvent'))result.warnings.push('包含 JetsamEvent 内存终止报告，不是硬件配置或电池健康来源。');
 if(result.kinds.includes('崩溃报告'))result.warnings.push('包含应用崩溃报告，不是完整硬件配置来源。');
 if(!useful)result.warnings.push(archive?'已扫描诊断包，但未找到可提取的受支持硬件或电池字段。':'未找到受支持的硬件或电池字段。请选择 Analytics 日志、IORegistry 文本或 sysdiagnose 诊断包。');
 if(result.malformed||result.oversized||result.limited)result.warnings.push(`结果不完整：${result.malformed} 个损坏片段、${result.oversized} 个超大记录${result.limited?'；已达到字段或结构预算':''}。`);
 progress({phase:'读取完成',percent:100});return {...result,type,archive,bytes:file.size};
}
