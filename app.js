const $=id=>document.getElementById(id);let worker=null, generation=0;
function node(tag,text,cls){const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;}
function render(r,isDemo){
 $('results').hidden=false;
 $('status').textContent=`${isDemo?'模拟数据 · ':''}读取 ${r.records} 条记录。结果仅来自文件。`;
 $('metrics').replaceChildren();$('evidence').replaceChildren();$('hardware').replaceChildren();$('notes').replaceChildren();
 for(const m of r.metrics){if(m.values.length||['cycles','health'].includes(m.id)){const card=node('article','','metric'+(['cycles','health'].includes(m.id)?' primary':'')+(!m.values.length?' missing':''));card.append(node('h3',m.label));const reading=node('div','','reading');reading.append(node('span',m.values.length?m.values.join(' / '):'未找到','value'),node('span',m.values.length?m.unit:'','unit'));card.append(reading,node('p',m.conflict?'多个值，见原始字段':m.matches.length&&!m.values.length?'字段存在，数值无法解读':!m.values.length?'此日志未包含可读数据':'文件中的记录值'));$('metrics').append(card);}
  for(const o of m.matches){const row=node('div',`${o.key}：${String(o.value).slice(0,160)}${o.number===null?'（无法解读）':''}`,'evidence');row.append(node('code',o.path));$('evidence').append(row);}}
 if(!$('evidence').children.length)$('evidence').append(node('p','未找到支持的电池字段。'));
 for(const x of r.identifiers){const row=node('div',`${x.key}：${x.value}`,'evidence');row.append(node('code',x.path));$('hardware').append(row);}
 if(!r.identifiers.length)$('hardware').append(node('p','未找到支持的硬件标识字段。'));
 const missing=r.metrics.filter(m=>!m.values.length);if(missing.length)$('evidence').append(node('p','未读取到：'+missing.map(m=>m.label).join('、')+'。缺失不等于 0。'));$('notes').append(node('p','日志记录可能滞后；数据不等同于当前电池健康或维修诊断。'));
 for(const e of r.estimates)$('notes').append(node('p',`同一记录、同一对象内的标称容量 ÷ 设计容量：${e.percent}%（仅算术比值，单位是否一致未经验证；不等于官方电池健康）。来源：${e.source.join(' 与 ')}`));
 if(r.crash)$('notes').append(node('p','此文件包含崩溃报告类型 309，通常不是电池分析日志。'));
 if(r.malformed||r.limited)$('notes').append(node('p',`结果不完整：${r.malformed} 个损坏或截断片段${r.limited?'；已达到安全解析限制':''}。`));
}
function reset(){generation++;worker?.terminate();worker=null;$('file').value='';$('results').hidden=true;for(const id of ['metrics','evidence','hardware','notes'])$(id).replaceChildren();$('status').textContent='已清除当前文件与结果。';}
function analyze(text,isDemo=false){worker?.terminate();worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});const active=++generation;$('status').textContent='正在设备内解析…';worker.onmessage=({data})=>{if(active!==generation)return;worker.terminate();worker=null;if(data.error){$('results').hidden=true;$('status').textContent=data.error;}else render(data.result,isDemo);};worker.onerror=()=>{if(active!==generation)return;worker?.terminate();worker=null;$('status').textContent='解析失败，请检查文件格式或重新打开页面。';};worker.postMessage(text);}
 $('file').addEventListener('change',async()=>{const f=$('file').files[0];if(!f)return;reset();const active=generation;if(f.size>50*1024*1024){$('status').textContent='文件超过 50 MB，为避免手机内存不足，请选择较小的日志。';return;}try{const text=await f.text();if(active===generation)analyze(text);}catch{if(active===generation)$('status').textContent='无法读取所选文件。';}});
 $('clear').addEventListener('click',reset);
 if('serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(async()=>{await navigator.serviceWorker.ready;$('offline').textContent='离线资源已就绪 · 可添加到主屏幕';}).catch(()=>{$('offline').textContent='离线功能未就绪；需 HTTPS 或本机预览，并允许网站缓存。';});}else $('offline').textContent='此浏览器不支持离线缓存。';
