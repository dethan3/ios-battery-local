const LIMIT=100000;
function readBE(bytes,offset,size){if(size<1||size>8||offset<0||offset+size>bytes.length)throw new Error('plist 越界。');let n=0;for(let i=0;i<size;i++)n=n*256+bytes[offset+i];return n;}
export function isBinaryPlist(bytes){return bytes.length>=8&&bytes[0]===98&&bytes[1]===112&&bytes[2]===108&&bytes[3]===105&&bytes[4]===115&&bytes[5]===116&&bytes[6]===48&&bytes[7]===48;}
export function parseBinaryPlist(bytes){
 if(!isBinaryPlist(bytes)||bytes.length<40)throw new Error('不是可读取的二进制 plist。');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),t=bytes.length-32;
 const offsetSize=bytes[t+6],refSize=bytes[t+7];
 const numObjects=Number(view.getBigUint64(t+8)),top=Number(view.getBigUint64(t+16)),table=Number(view.getBigUint64(t+24));
 if(offsetSize<1||offsetSize>4||refSize<1||refSize>4||!Number.isSafeInteger(numObjects)||numObjects<1||numObjects>LIMIT||top<0||top>=numObjects||table<0||table>=bytes.length)throw new Error('plist 超出预算或已损坏。');
 const offsets=Array.from({length:numObjects},(_,i)=>readBE(bytes,table+i*offsetSize,offsetSize));
 const seen=new Array(numObjects);
 function readObject(index,depth){
  if(!Number.isInteger(index)||index<0||index>=numObjects)throw new Error('plist 引用无效。');
  if(seen[index]!==undefined)return seen[index];
  if(depth>30)throw new Error('plist 嵌套过深。');
  seen[index]=null;
  let o=offsets[index];
  if(o<8||o>=t)throw new Error('plist 偏移无效。');
  const marker=bytes[o++],type=marker>>4;let size=marker&15;
  if(size===15&&type!==0){const sizeMarker=bytes[o++];if((sizeMarker>>4)!==1)throw new Error('plist 长度无效。');const ssize=1<<(sizeMarker&15);size=readBE(bytes,o,ssize);o+=ssize;if(size>bytes.length)throw new Error('plist 长度超出文件。');}
  let value=null;
  if(type===0)value=size===9?true:size===8?false:null;
  else if(type===1){const len=1<<size;value=readBE(bytes,o,len);o+=len;if(!Number.isSafeInteger(value))value=null;}
  else if(type===2){const len=1<<size;if(len===4)value=view.getFloat32(o);else if(len===8)value=view.getFloat64(o);if(typeof value==='number'&&!Number.isFinite(value))value=null;o+=len;}
  else if(type===4||type===5||type===6){const bytesLen=type===6?size*2:size;if(o+bytesLen>bytes.length||size>4096)value=null;
   else if(type===5)value=new TextDecoder('latin1').decode(bytes.subarray(o,o+size));
   else if(type===6){let s='';for(let i=0;i<size;i++)s+=String.fromCharCode((bytes[o+i*2]<<8)|bytes[o+i*2+1]);value=s;}
   else{const slice=bytes.subarray(o,o+size);value=[...slice].every(b=>b===0||b>=32&&b<127)?new TextDecoder().decode(slice).replace(/\0+$/g,''):null;}
   o+=bytesLen;
  }else if(type===10||type===12||type===13){
   if(o+size*refSize* (type===13?2:1)>bytes.length)throw new Error('plist 容器越界。');
   const refs=n=>{const out=[];for(let i=0;i<n;i++){out.push(readBE(bytes,o,refSize));o+=refSize;}return out;};
   if(type===13){const keys=refs(size),vals=refs(size);value={};seen[index]=value;for(let i=0;i<size;i++){const k=readObject(keys[i],depth+1),v=readObject(vals[i],depth+1);if(typeof k==='string'&&(typeof v==='string'||typeof v==='number'||v&&typeof v==='object'))value[k]=v;}}
   else{const items=refs(size);value=[];seen[index]=value;for(const r of items)value.push(readObject(r,depth+1));}
   return value;
  }
  seen[index]=value;return value;
 }
 return readObject(top,0);
}
