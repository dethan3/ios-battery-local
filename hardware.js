// Decode only documented field shapes; retain the original value in evidence.
export function decodedHardware(key,value,path,originalKey=key){
 const storage=/AppleANS|AppleNAND|storagecontroller/i.test(path);
 const row=(component,kind,display,extra={})=>({component,kind,value,display,...extra});
 if(storage){
  if(key==='vendorname'){const nand=/Controller Characteristics/i.test(path)||originalKey==='vendor-name';return row('storage',nand?'日志厂商文本':'日志控制器厂商',value,{role:nand?'nand':'controller'});}
  if(key==='capacity'&&/^\d+$/.test(value)){const bytes=Number(value);if(Number.isSafeInteger(bytes)&&bytes>=1e8&&bytes<=64*1024**4)return row('storage','日志容量',`${Number((bytes/1e9).toFixed(3))} GB`,{decoded:bytes,interpretation:'容量字段按字节读取，除以 10⁹；十进制 GB'});}
  if(key==='nandmarketingname'){const type=value.match(/(?:^|[_\s-])(slc|mlc|tlc|qlc)(?:[_\s-]|$)/i)?.[1];return row('storage','日志类型',type?type.toUpperCase():value,{interpretation:type?'从 NAND 类型字符串读取':'未识别类型，保留原始参数'});}
  if(key==='defaultbitspercell'&&/^[1-4]$/.test(value))return row('storage','日志类型',['','SLC','MLC','TLC','QLC'][Number(value)],{interpretation:`每单元 ${value} bit；按 SLC/MLC/TLC/QLC 定义换算`});
  if(key==='chipid')return row('storage','日志芯片代码',value);
 }
 if(key==='dramsize'&&/^<(?:[0-9a-f]{8}|[0-9a-f]{16})>$/i.test(value)){
  const bytes=value.slice(1,-1).match(/../g);let n=0n;for(let i=bytes.length-1;i>=0;i--)n=n*256n+BigInt(parseInt(bytes[i],16));
  if(n>=128n*1024n**2n&&n<=1024n**4n&&n%(1024n**2n)===0n)return row('memory','日志容量',`${Number(n)/1024**3} GiB`,{decoded:Number(n),interpretation:'dram-size 按小端字节数读取；1 GiB = 2³⁰ 字节'});
 }
 if(key==='dramtype'&&/^LPDDR[2-9][A-Z0-9]*$/i.test(value))return row('memory','日志类型',value.toUpperCase());
 if(key==='basebandchipset')return row('baseband','日志芯片代码',value);
 if(['basebandversion','basebandfirmwareversion'].includes(key))return row('baseband','日志固件版本',value);
 if(['witimodulevendor','modulevendor'].includes(key)&&/centauri|wifi|wireless|airport/i.test(path))return row('wireless','日志模组代码',value);
 return null;
}
