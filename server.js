import 'dotenv/config';
import express from 'express';
const app = express();
app.use(express.json({limit:'1mb'}));
app.use(express.static('public'));
app.post('/api/session', async (req,res)=>{
  if(!process.env.OPENAI_API_KEY) return res.status(503).json({error:'Set OPENAI_API_KEY on the server.'});
  try {
    const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method:'POST',
      headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({session:{type:'realtime',model:'gpt-realtime-2.1-mini',audio:{output:{voice:'marin'}},instructions:'You are Bugga, a friendly, concise voice assistant. Help the user create tasks and sample food orders. Always use tools to add, list, complete tasks or create orders. For an order, confirm item names, quantities, and notes before calling create_order. Do not claim an order was sent to a real restaurant or printed. No external actions are available. Speak naturally and briefly.',tools:[{type:'function',name:'add_task',description:'Add a task to the local task list',parameters:{type:'object',properties:{title:{type:'string'}},required:['title']}},{type:'function',name:'list_tasks',description:'Read the local task list',parameters:{type:'object',properties:{},additionalProperties:false}},{type:'function',name:'complete_task',description:'Complete a task by its numeric ID',parameters:{type:'object',properties:{id:{type:'number'}},required:['id']}},{type:'function',name:'create_order',description:'Create a confirmed DEMO food order only, never a real restaurant order',parameters:{type:'object',properties:{items:{type:'array',items:{type:'object',properties:{name:{type:'string'},quantity:{type:'integer',minimum:1}},required:['name','quantity']}},notes:{type:'string'}},required:['items']}}]}})
    });
    const body=await r.json();
    if(!r.ok) return res.status(r.status).json({error:body.error?.message||'Could not create session'});
    res.json({value:body.value,expires_at:body.expires_at});
  } catch(e){res.status(502).json({error:'Unable to reach voice service'});}
});
app.listen(process.env.PORT||3000,()=>console.log(`Bugga running on port ${process.env.PORT||3000}`));
