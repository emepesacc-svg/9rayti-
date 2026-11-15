/* تنظيم الواجهات: صفحات متداخلة (مستوى ← مادة ← درس/امتحان) عبر مسارات #/ */
(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const L=window.MIDAD_LEVELS,S=window.MIDAD_SUBJECTS,C=window.C9;
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem('9rayti-'+k))??d}catch{return d}},put=(k,v)=>localStorage.setItem('9rayti-'+k,JSON.stringify(v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lv=id=>L.find(x=>x.id===id),sb=id=>S.find(x=>x.id===id);
const main=$('main'),app=document.createElement('section');app.className='section app-view hidden';app.id='appView';main.append(app);
const parts={home:['.hero','.stats','#levels','#latest','.cta-section'],levels:['#levels'],library:['#library'],tools:['#study-tools']};
const all=[...new Set(Object.values(parts).flat())];
let tab='lessons';
const crumbs=a=>`<nav class="crumbs">${a.map(([h,t])=>h?`<a href="#/${h}">${esc(t)}</a>`:`<span>${esc(t)}</span>`).join(' ‹ ')}</nav>`;
const card=(h,t,sm)=>`<a class="vcard" href="#/${h}"><b>${esc(t)}</b><small>${esc(sm)}</small></a>`;
const tag='';
function levelView(id){const l=lv(id);if(!l)return home();const ls=C.lessons.filter(x=>x.l===id),ex=C.exams.filter(x=>x.l===id),subs=[...new Set([...ls,...ex].map(x=>x.s))];const done=get('done',[]);
app.innerHTML=crumbs([['','الرئيسية'],['levels','المستويات'],['',l.ar]])+`<h2>${esc(l.ar)}</h2><p class="tool-muted">${ls.filter(x=>done.includes(x.id)).length} / ${ls.length} دروس مكتملة · ${ex.length} امتحانات</p><h3>المواد</h3><div class="vgrid">${subs.map(s=>card(`level/${id}/${s}`,sb(s).ar,`${ls.filter(x=>x.s===s).length} دروس · ${ex.filter(x=>x.s===s).length} امتحانات`)).join('')||'<p class="tool-muted">سيُضاف محتوى هذا المستوى قريباً.</p>'}</div><p><a class="btn btn-quiet" href="#/library" onclick="setTimeout(()=>{const f=document.querySelector('#filterLevel');f.value='${id}';f.dispatchEvent(new Event('change'))},50)">كل موارد المستوى في المكتبة ↙</a></p>`;}
function subjectView(id,s){const l=lv(id),su=sb(s);if(!l||!su)return home();const done=get('done',[]),res=get('exam-results',{});
const ls=C.lessons.filter(x=>x.l===id&&x.s===s),ex=C.exams.filter(x=>x.l===id&&x.s===s);
const TN=['','الثلاثي الأول','الثلاثي الثاني','الثلاثي الثالث'];const bt=(a,f)=>[1,2,3].map(t=>{const z=a.filter(v=>v.t===t);return z.length?`<h3>${TN[t]}</h3><div class="vgrid">${z.map(f).join('')}</div>`:''}).join('');
const lst=tab==='lessons'?bt(ls,x=>card(`lesson/${x.id}`,(done.includes(x.id)?'✓ ':'')+x.title,'درس')):bt(ex,x=>card(`exam/${x.id}`,x.title,res[x.id]!=null?`آخر نتيجة: ${res[x.id]}/${x.q.length}`:`${x.q.length} سؤالاً`));
app.innerHTML=crumbs([['','الرئيسية'],['levels','المستويات'],[`level/${id}`,l.ar],['',su.ar]])+`<h2>${esc(su.ar)} — ${esc(l.ar)}</h2><div class="level-tabs"><button class="level-tab ${tab==='lessons'?'active':''}" data-tab="lessons">الدروس (${ls.length})</button><button class="level-tab ${tab==='exams'?'active':''}" data-tab="exams">الامتحانات (${ex.length})</button></div>${lst||'<p class="tool-muted">لا يوجد محتوى هنا بعد.</p>'}`;
$$('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;subjectView(id,s)});}
function lessonView(id){const x=C.lessons.find(v=>v.id===id);if(!x)return home();const l=lv(x.l),done=get('done',[]),has=done.includes(id),ex=C.exams.find(v=>v.l===x.l&&v.s===x.s&&v.t===x.t);
app.innerHTML=crumbs([['','الرئيسية'],[`level/${x.l}`,l.ar],[`level/${x.l}/${x.s}`,sb(x.s).ar],['',x.title||x.t]])+`<article class="reader"><h2>${esc(x.title||x.t)}</h2><img class="lesson-img" src="assets/lessons/${x.id}.png" alt="${esc(x.title||x.t)}" loading="lazy">${tag}<div class="tool-actions"><button class="btn btn-primary" id="doneBtn">${has?'✓ تمت القراءة':'تعليم الدرس كمكتمل'}</button>${ex?`<a class="btn btn-quiet" href="#/exam/${ex.id}">جرّب الامتحان ↙</a>`:''}</div></article>`;
$('#doneBtn').onclick=()=>{const d=get('done',[]);put('done',d.includes(id)?d.filter(v=>v!==id):[...d,id]);lessonView(id)};}
function examView(id,show){const x=C.exams.find(v=>v.id===id);if(!x)return home();const l=lv(x.l);
app.innerHTML=crumbs([['','الرئيسية'],[`level/${x.l}`,l.ar],[`level/${x.l}/${x.s}`,sb(x.s).ar],['',x.title||x.t]])+`<h2>${esc(sb(x.s).ar)} — ${esc(x.title||x.t)}</h2>${tag}<div id="qs">${x.q.map((q,i)=>`<fieldset class="qbox"><legend>${i+1}. ${esc(q[0])}</legend>${q[1].map((o,j)=>`<label class="qopt"><input type="radio" name="q${i}" value="${j}"> ${esc(o)}</label>`).join('')}<div class="qfb"></div></fieldset>`).join('')}</div><button class="btn btn-primary" id="sendExam">تصحيح</button><div id="examRes" class="tool-feedback hidden"></div>`;
$('#sendExam').onclick=()=>{let ok=0;$$('.qbox').forEach((b,i)=>{const c=b.querySelector('input:checked'),good=c&&+c.value===x.q[i][2];if(good)ok++;b.querySelector('.qfb').innerHTML=`<b>${good?'✓ صحيحة':'✗ الصحيح: '+esc(x.q[i][1][x.q[i][2]])}</b> — ${esc(x.q[i][3])}`;b.querySelectorAll('input').forEach(n=>n.disabled=true)});
const r=get('exam-results',{});r[id]=ok;put('exam-results',r);put('points',get('points',0)+ok*2);const e=$('#examRes');e.classList.remove('hidden');e.innerHTML=`<b>نتيجتك: ${ok} / ${x.q.length}</b> (+${ok*2} نقطة)<br><a href="#/exam/${id}" onclick="setTimeout(()=>location.reload(),0)">إعادة المحاولة</a>`;$('#sendExam').disabled=true;e.scrollIntoView({behavior:'smooth'})};}
function meView(){const d=get('done',[]),r=get('exam-results',{});app.innerHTML=crumbs([['','الرئيسية'],['','فضائي']])+`<h2>فضائي</h2><div class="profile-stats"><div><b>${get('points',0)}</b><small>نقطة</small></div><div><b>${d.length}</b><small>دروس مكتملة</small></div><div><b>${Object.keys(r).length}</b><small>امتحانات منجزة</small></div></div><h3>نتائج الامتحانات</h3><div class="vgrid">${C.exams.filter(x=>r[x.id]!=null).map(x=>card(`exam/${x.id}`,x.t,`${r[x.id]}/${x.q.length}`)).join('')||'<p class="tool-muted">لم تُنجز امتحانات بعد.</p>'}</div><p class="tool-muted">البيانات محفوظة على هذا الجهاز فقط. الملف الدراسي والمخطط والدفاتر في <a href="#/tools">أدوات التعلّم</a>.</p>`;}
function home(){location.hash='#/'}
const alias={'':'home',home:'home',hero:'home',latest:'home',about:'home',levels:'levels',library:'library','study-tools':'tools',tools:'tools'};
function route(){const h=location.hash.replace(/^#\/?/,''),p=h.split('/');let v=alias[p[0]];const ap=['level','lesson','exam','me'].includes(p[0]);
all.forEach(s=>$$(s).forEach(el=>el.classList.add('hidden')));app.classList.toggle('hidden',!ap);
if(ap){if(p[0]==='level')p[2]?subjectView(p[1],p[2]):levelView(p[1]);else if(p[0]==='lesson')lessonView(p[1]);else if(p[0]==='exam')examView(p[1]);else meView();v='app'}
else{(parts[v||'home']||parts.home).forEach(s=>$$(s).forEach(el=>el.classList.remove('hidden')))}
$$('.main-nav a,.bottom-nav a,nav[class*=bottom] a').forEach(a=>{const k=a.getAttribute('href').replace(/^#\/?/,'');a.classList.toggle('active',(alias[k]||'home')===v||(v==='app'&&k==='levels'))});window.scrollTo(0,0)}
/* قائمة رئيسية مبسّطة */
$('.main-nav').innerHTML='<a href="#/">الرئيسية</a><a href="#/levels">المستويات</a><a href="#/library">المكتبة</a><a href="#/tools">أدوات التعلّم</a><a href="#/me">فضائي</a>';
$$('.main-nav a').forEach(a=>a.addEventListener('click',()=>$('.main-nav').classList.remove('open')));
/* بطاقات المستويات تفتح صفحة المستوى بدل الانتقال إلى المكتبة */
$('#levelGrid').addEventListener('click',e=>{const b=e.target.closest('.level-card');if(b){e.stopPropagation();location.hash='#/level/'+b.dataset.level}},true);
$('#latestStrip').addEventListener('click',e=>{if(e.target.closest('.latest-item'))e.stopPropagation()},true);
/* أدوات التعلّم مصنّفة في مجموعات بدل شبكة واحدة */
const grid=$('#study-tools .feature-grid'),G=[['المذاكرة والاختبار',['quiz','challenges','assistant','national']],['مختبرات',['mathlab','language','science','speech','print']],['تنظيمي',['planner','notebook','mistakes','progress','profile']],['موارد ومعلومات',['dictionary','videos','updates','community','offline','feedback']]];
const tiles=$$('#study-tools .feature-tile'),key=t=>t.dataset.open||t.dataset.ultimate;
const wrap=document.createElement('div');G.forEach(([n,ks])=>{const d=document.createElement('div');d.className='tool-group';d.innerHTML=`<h3>${n}</h3>`;const g=document.createElement('div');g.className='feature-grid';ks.forEach(k=>{const t=tiles.find(x=>key(x)===k);if(t)g.append(t)});d.append(g);wrap.append(d)});
const adm=tiles.find(t=>t.tagName==='A');const last=wrap.lastChild.querySelector('.feature-grid');if(adm)last.append(adm);grid.replaceWith(wrap);
/* إدراج الدروس والامتحانات في المكتبة */
(()=>{const R=window.MIDAD_RESOURCES,TT=['','الثلاثي الأول','الثلاثي الثاني','الثلاثي الثالث'];C.lessons.forEach((x,i)=>R.push({id:'r-'+x.id,title:{ar:x.title},description:{ar:`${TT[x.t]} — درس مصوّر.`},level:x.l,subject:x.s,type:'lesson',term:String(x.t),date:'2026-10-'+String(1+i%28).padStart(2,'0'),file:'#/lesson/'+x.id,demo:false}));C.exams.forEach((x,i)=>R.push({id:'r-'+x.id,title:{ar:`${sb(x.s).ar}: ${x.title}`},description:{ar:`${x.q.length} سؤالاً مع تصحيح فوري.`},level:x.l,subject:x.s,type:'exam',term:String(x.t),date:'2026-09-'+String(1+i%28).padStart(2,'0'),file:'#/exam/'+x.id,demo:false}));$('#filterType').dispatchEvent(new Event('change'))})();
window.addEventListener('hashchange',route);route();
})();
