// Optional read-only preview. The deliverables also open directly as offline files.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/'){res.writeHead(302,{Location:'/review/index.html'}).end();return}
  const relative=pathname.slice(1);
  const target=path.resolve(root,relative);
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return}
  const data=await fs.readFile(target);
  const type=path.extname(target)==='.html'?'text/html':path.extname(target)==='.json'?'application/json':'text/plain';
  res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store'}).end(data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'}).end('File not found')}
});
server.listen(Number(process.env.VISUAL_LAB_PORT)||0,'127.0.0.1',()=>console.log(`Visual lab review: http://127.0.0.1:${server.address().port}/review/index.html`));
