import {parseAnalytics} from './parser.js';
self.onmessage=({data})=>{try{self.postMessage({result:parseAnalytics(data)});}catch(e){self.postMessage({error:e.message});}};
