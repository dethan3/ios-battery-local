import {analyzeFile} from './ingest.js';
self.onmessage=async({data})=>{const files=data.files;if(!Array.isArray(files)||files.length>20){self.postMessage({error:'一次最多选择 20 个文件。'});return;}
 for(let i=0;i<files.length;i++){
  self.postMessage({progress:{index:i,total:files.length,phase:'开始读取',percent:0}});
  try{const report=await analyzeFile(files[i],p=>self.postMessage({progress:{index:i,total:files.length,...p}}));self.postMessage({report,index:i});}
  catch(e){self.postMessage({fileError:String(e.message||e),index:i});}
 }
 self.postMessage({done:true});
};
