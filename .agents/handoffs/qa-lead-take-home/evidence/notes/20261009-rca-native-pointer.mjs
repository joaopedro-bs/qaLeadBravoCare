// RCA-only: native Chrome pointer inputs, passive DOM/error/network observations.
// No application state writes, request rewriting, or deliverable imports.
import {spawn,execFileSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
const output=process.argv[2];
const journal={started:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),dirty:execFileSync('git',['status','--short'],{encoding:'utf8'}).trim(),sourceHash:createHash('sha256').update(readFileSync(import.meta.filename)).digest('hex'),cases:[],cleanup:[]};
const save=()=>writeFileSync(output,JSON.stringify(journal,null,2));
const profile=mkdtempSync(tmpdir()+'/qa-rca-chrome-');
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--no-first-run','--no-default-browser-check','--remote-debugging-port=9223',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
let ws, sequence=0, pending=new Map(), current;
function send(method,params={}){return new Promise((resolve,reject)=>{const id=++sequence;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error('DOM evaluation failed');return r.result.value;}
async function waitFor(expression){for(let i=0;i<100;i++){if(await evaluate(expression))return;await pause(100);}current.timeoutDOM=await evaluate(`({title:document.title,url:location.href,headings:Array.from(document.querySelectorAll('h1,h2,h3')).map(e=>e.textContent),calendar:!!document.querySelector('.rbc-calendar'),buttons:Array.from(document.querySelectorAll('button')).map(e=>e.textContent)})`);save();throw Error('observable DOM wait timed out');}
async function mouse(type,x,y,pressed=false){return send('Input.dispatchMouseEvent',{type,x,y,button:type==='mouseMoved'?'none':'left',buttons:pressed?1:0,clickCount:type==='mouseMoved'?0:1});}
async function settle(){let previous,stable=0;for(let i=0;i<40;i++){const sample=await evaluate(`JSON.stringify({scrollY,rect:document.querySelector('.rbc-calendar')?.getBoundingClientRect().toJSON()})`);stable=sample===previous?stable+1:0;previous=sample;if(stable>=3)return;await pause(50);}throw Error('layout did not settle');}
async function click(selector,text){const expression=`(()=>{const e=Array.from(document.querySelectorAll(${JSON.stringify(selector)})).find(e=>${text?`e.textContent.trim()===${JSON.stringify(text)}`:'true'});if(!e)return null;return e})()`;await evaluate(`(()=>{const e=${expression};e?.scrollIntoView({block:'center'});return !!e})()`);await settle();const p=await evaluate(`(()=>{const e=${expression};if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);if(!p)throw Error('click target absent');await mouse('mouseMoved',p.x,p.y);await mouse('mousePressed',p.x,p.y,true);await mouse('mouseReleased',p.x,p.y);}
const snapshot=`(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};return {at:performance.now(),label:document.querySelector('.rbc-toolbar-label')?.textContent,events:Array.from(document.querySelectorAll('.rbc-event')).map(e=>({text:e.textContent,rect:rect(e),rowDays:Array.from(e.closest('.rbc-month-row')?.querySelectorAll('.rbc-date-cell')||[]).map(d=>d.textContent),style:e.parentElement.getAttribute('style')})),calendar:document.querySelector('.rbc-calendar')?rect(document.querySelector('.rbc-calendar')):null,body:rect(document.body),scrollY,confirmation:!!Array.from(document.querySelectorAll('h2')).find(e=>e.textContent==='Booking Confirmed'),pointer:window.__qaPointer||[]};})()`;
try{
  let targets;
  for(let i=0;i<100;i++){try{targets=await (await fetch('http://127.0.0.1:9223/json')).json();break;}catch{await pause(100);}}
  if(!targets)throw Error('Chrome CDP did not start');
  ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise(r=>ws.addEventListener('open',r,{once:true}));
  ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error('CDP command failed'));else p.resolve(m.result);return;}if(!current)return;if(m.method==='Runtime.exceptionThrown'){const d=m.params.exceptionDetails;current.errors.push({at:Date.now(),pageTime:d.timestamp,description:d.exception?.description?.includes('418')?d.exception.description:'non-418 exception (details withheld)',stack:d.stackTrace?.callFrames?.map(f=>({url:f.url,line:f.lineNumber,column:f.columnNumber}))});save();}if(m.method==='Network.requestWillBeSent'&&m.params.request.url.endsWith('/api/booking')&&m.params.request.method==='POST'){const b=JSON.parse(m.params.request.postData||'{}');current.booking={requestId:m.params.requestId,at:Date.now(),identity:{roomid:b.roomid,firstname:b.firstname,lastname:b.lastname,depositpaid:b.depositpaid,bookingdates:b.bookingdates},contactFieldsPresent:{email:typeof b.email==='string',phone:typeof b.phone==='string'}};save();}if(m.method==='Network.responseReceived'&&current.booking?.requestId===m.params.requestId){current.booking.status=m.params.response.status;save();}});
  await send('Runtime.enable');await send('Page.enable');await send('Network.enable');
  const rooms=await (await fetch('https://automationintesting.online/api/room')).json();const roomid=rooms.rooms[0].roomid;
  journal.roomid=roomid;
  for(const [width,height] of [[1280,800],[390,844]])for(const preselected of [false,true]){
    current={width,height,preselected,errors:[]};journal.cases.push(current);
    await send('Network.clearBrowserCookies');await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    const url=`https://automationintesting.online/reservation/${roomid}`+(preselected?'?checkin=2029-01-29&checkout=2029-01-31':'');current.url=url;
    await send('Page.navigate',{url});await waitFor(`!!document.querySelector('h2')`);
    for(let ready=0;ready<30&&!(await evaluate(`!!document.querySelector('.rbc-toolbar-label')`));ready++)await pause(100);
    if(!(await evaluate(`!!document.querySelector('.rbc-toolbar-label')`))){current.cleanState={calendar:false,headings:await evaluate(`Array.from(document.querySelectorAll('h1,h2,h3')).map(e=>e.textContent)`)};save();continue;}
    current.initial=await evaluate(snapshot);
    // Passive event trace, installed after hydration readiness; no React/state access.
    await evaluate(`(()=>{window.__qaPointer=[];for(const type of ['pointerdown','mousedown','pointermove','mousemove','pointerup','mouseup'])document.addEventListener(type,e=>{if(e.target.closest?.('.rbc-calendar'))window.__qaPointer.push({type,at:performance.now(),trusted:e.isTrusted,x:e.clientX,y:e.clientY,buttons:e.buttons,target:e.target.className});},true);return true})()`);
    const desired='February 2029';let label=await evaluate(`document.querySelector('.rbc-toolbar-label').textContent`);let moves=0;
    while(label!==desired&&moves++<37){await click('.rbc-toolbar button','Next');const old=label;await waitFor(`document.querySelector('.rbc-toolbar-label').textContent!==${JSON.stringify(old)}`);label=await evaluate(`document.querySelector('.rbc-toolbar-label').textContent`);}
    if(label!==desired)throw Error('month navigation failed');
    await evaluate(`document.querySelector('.rbc-calendar').scrollIntoView({block:'center'})`);
    await settle();
    current.before=await evaluate(snapshot);
    const points=await evaluate(`(()=>{const get=day=>{const cell=Array.from(document.querySelectorAll('.rbc-date-cell:not(.rbc-off-range)')).find(e=>e.textContent===day);const row=cell.closest('.rbc-month-row');const bg=row.querySelectorAll('.rbc-day-bg')[Array.from(cell.parentElement.children).indexOf(cell)];const r=bg.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height-4;return {x,y,hit:document.elementFromPoint(x,y)?.className}};const r=document.body.getBoundingClientRect();return {start:get('12'),end:get('13'),bodyCentre:{x:r.x+r.width/2,y:r.y+r.height/2,hit:document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.className||null}}})()`);
    current.points=points;
    const began=Date.now();await mouse('mouseMoved',points.start.x,points.start.y);await mouse('mousePressed',points.start.x,points.start.y,true);
    for(let step=1;step<=12;step++){await mouse('mouseMoved',points.start.x+(points.end.x-points.start.x)*step/12,points.start.y+(points.end.y-points.start.y)*step/12,true);await pause(20);}
    await mouse('mouseReleased',points.end.x,points.end.y);await pause(100);
    current.drag={began,ended:Date.now()};current.after=await evaluate(snapshot);
    await click('#doReservation');await waitFor(`!!document.querySelector('input.room-firstname')`);current.form=await evaluate(`({at:performance.now(),dateInputs:Array.from(document.querySelectorAll('input')).filter(e=>e.type==='date').map(e=>({type:e.type,value:e.value})),dateText:Array.from(document.querySelectorAll('.booking-card')).map(e=>e.textContent.match(/\d{4}-\d{2}-\d{2}/g))})`);
    if(width===390&&preselected&&process.env.CYPRESS_ADMIN_USER&&process.env.CYPRESS_ADMIN_PASSWORD){
      const report=await (await fetch(`https://automationintesting.online/api/report/room/${roomid}`)).json();
      const unavailable=report.report.some(r=>r.start<'2029-02-15'&&r.end>'2029-02-11');current.availability={unavailable,readAt:Date.now()};save();
      if(unavailable)throw Error('target window not free; no booking sent');
      const selected=current.after.events; if(selected.length!==1||!selected[0].rowDays.includes('12')||!selected[0].style.includes('28.5714'))throw Error('target selection not demonstrated; no booking sent');
      const marker='qa'+Array.from({length:8},()=>String.fromCharCode(97+Math.floor(Math.random()*26))).join('');
      current.formInputs=[];
      for(const [selector,value] of [['input.room-firstname','Tester'],['input.room-lastname',marker],['input.room-email',marker+'@example.com'],['input.room-phone','01234567890']]){await click(selector);await waitFor(`document.activeElement?.matches(${JSON.stringify(selector)})`);await send('Input.insertText',{text:value});const matches=await evaluate(`document.querySelector(${JSON.stringify(selector)}).value===${JSON.stringify(value)}`);current.formInputs.push({selector,focused:true,valueMatches:matches});save();if(!matches)throw Error('native form input did not match; no submit');}
      current.anonymousBeforeSubmit=!(await send('Network.getCookies',{urls:['https://automationintesting.online']})).cookies.some(c=>c.name==='token');if(!current.anonymousBeforeSubmit)throw Error('guest token unexpectedly present');
      await click('button','Reserve Now');
      for(let i=0;i<100&&!current.booking?.status;i++)await pause(100);
      if(!current.booking){journal.cleanup.push({outcome:'submission-response-unknown',marker,unresolved:true});save();throw Error('booking outcome missing');}
      let response;
      for(let i=0;i<50;i++){try{const r=await send('Network.getResponseBody',{requestId:current.booking.requestId});response=JSON.parse(r.body);break;}catch{await pause(100);}}
      if(!response){journal.cleanup.push({outcome:'accepted-response-identity-unknown',marker,unresolved:true});save();throw Error('booking response unavailable');}
      const identity=current.booking.identity;
      current.booking.response={bookingid:response.bookingid,roomid:response.roomid,firstname:response.firstname,lastname:response.lastname,depositpaid:response.depositpaid,bookingdates:response.bookingdates};
      if(current.booking.status>=400&&typeof response.bookingid!=='number'){current.booking.rejected=true;current.booking.errorShape={errorsArray:Array.isArray(response.errors)};save();continue;}
      const obligation={bookingid:response.bookingid,identity,outcome:'pending',unresolved:true};journal.cleanup.push(obligation);save();
      try{
        await waitFor(`!!Array.from(document.querySelectorAll('h2')).find(e=>e.textContent==='Booking Confirmed')`);
        current.confirmation=await evaluate(`(()=>{const e=Array.from(document.querySelectorAll('h2')).find(e=>e.textContent==='Booking Confirmed');const visible=e=>!!e&&e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0&&getComputedStyle(e).visibility!=='hidden';const dates=Array.from(document.querySelectorAll('.booking-card strong')).find(e=>/\d{4}-\d{2}-\d{2}/.test(e.textContent));const back=Array.from(document.querySelectorAll('a')).find(e=>e.textContent==='Return home');return {at:performance.now(),heading:visible(e),dates:dates?.textContent,datesVisible:visible(dates),returnHome:visible(back)}})()`);save();
      }finally{
        if(!Number.isSafeInteger(obligation.bookingid)||obligation.bookingid<=0||identity.lastname!==marker){obligation.outcome='identity-unverified-no-delete';save();}
        else{
          const login=await fetch('https://automationintesting.online/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:process.env.CYPRESS_ADMIN_USER,password:process.env.CYPRESS_ADMIN_PASSWORD})});const auth=await login.json();obligation.loginStatus=login.status;save();
          if(login.status!==200||typeof auth.token!=='string'){obligation.outcome='cleanup-auth-unverified';save();}
          else{
            const url=`https://automationintesting.online/api/booking/${obligation.bookingid}`;const headers={Cookie:'token='+auth.token};const read=await fetch(url,{headers});obligation.readStatus=read.status;save();
            if(read.status===404){obligation.outcome='already-absent';obligation.classification='unknown';obligation.unresolved=false;save();}
            else if(read.status!==200){obligation.outcome='identity-read-unverified-no-delete';save();}
            else{const existing=await read.json();const matches=existing.bookingid===obligation.bookingid&&['roomid','firstname','lastname','depositpaid'].every(k=>existing[k]===identity[k])&&existing.bookingdates?.checkin===identity.bookingdates.checkin&&existing.bookingdates?.checkout===identity.bookingdates.checkout;obligation.identityMatches=matches;save();if(!matches){obligation.outcome='identity-mismatch-no-delete';save();}else{const del=await fetch(url,{method:'DELETE',headers});obligation.deleteStatus=del.status;save();if([202,404].includes(del.status)){const verify=await fetch(url,{headers});obligation.verifyStatus=verify.status;obligation.unresolved=verify.status!==404;obligation.outcome=verify.status===404?'deleted-and-absent':'absence-unverified';}else obligation.outcome='delete-failed';save();}}
          }
        }
      }
    }
    save();console.log(JSON.stringify({width,preselected,eventsBefore:current.before.events,eventsAfter:current.after.events,errors:current.errors.length,bodyCentre:points.bodyCentre,booking:current.booking?.response,confirmation:current.confirmation,cleanup:journal.cleanup.map(c=>({outcome:c.outcome,unresolved:c.unresolved}))}));
  }
}catch(e){journal.error=e.message;save();console.log(JSON.stringify({error:e.message}));process.exitCode=1;}
finally{journal.ended=new Date().toISOString();save();if(ws)ws.close();chrome.kill();setTimeout(()=>rmSync(profile,{recursive:true,force:true}),500);}
