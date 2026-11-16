(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const resources = window.NEXT_IMAGE_RESOURCES || [];
  if (!$('#visualLibraryContent') || !resources.length) return;
  const subjectOrder=['math','arabic','french','english','science','physics','svt'];
  const subjects={
    ar:{math:'الرياضيات',arabic:'اللغة العربية',french:'اللغة الفرنسية',english:'اللغة الإنجليزية',science:'الإيقاظ العلمي',physics:'العلوم الفيزيائية',svt:'علوم الحياة والأرض'},
    fr:{math:'Mathématiques',arabic:'Arabe',french:'Français',english:'Anglais',science:'Sciences',physics:'Physique',svt:'Sciences de la vie et de la Terre'},
    en:{math:'Mathematics',arabic:'Arabic',french:'French',english:'English',science:'Science',physics:'Physics',svt:'Life & Earth Sciences'}
  };
  const grades={
    ar:{'3p':'السنة الثالثة ابتدائي','4p':'السنة الرابعة ابتدائي','5p':'السنة الخامسة ابتدائي','6p':'السنة السادسة ابتدائي','7b':'السنة السابعة أساسي','8b':'السنة الثامنة أساسي','9b':'السنة التاسعة أساسي'},
    fr:{'3p':'3e année primaire','4p':'4e année primaire','5p':'5e année primaire','6p':'6e année primaire','7b':'7e année de base','8b':'8e année de base','9b':'9e année de base'},
    en:{'3p':'Grade 3 Primary','4p':'Grade 4 Primary','5p':'Grade 5 Primary','6p':'Grade 6 Primary','7b':'Grade 7 Basic','8b':'Grade 8 Basic','9b':'Grade 9 Basic'}
  };
  const w={
    ar:{root:'المكتبة المصوّرة',primary:'المرحلة الابتدائية',middle:'المرحلة الإعدادية',chooseStage:'اختر المرحلة التعليمية',start:'ابدأ من هنا للوصول إلى موارد مستواك',chooseGrade:'اختر سنتك الدراسية',chooseSubject:'اختر المادة',lessons:'الدروس والملخّصات',exams:'الامتحانات والإصلاحات',lessonSub:'صفحات تعليمية مصوّرة',examSub:'فروض واختبارات تدريبية',resources:'موارد مصوّرة',pages:'صفحات جاهزة للعرض',lessonType:'شرح الدرس',summaryType:'ورقة تلخيص',exam1:'تدريب أول',exam2:'تدريب ثان',correction:'مقترح إصلاح',open:'افتح الصفحة',back:'السابق',next:'التالي',close:'إغلاق',download:'تنزيل الصورة',print:'طباعة',source:'الصفحات المصوّرة الجديدة من إعداد قرايتي وهي موارد تدريبية أصلية، وليست امتحانات وزارية أو وثائق رسمية. للامتحانات الوطنية لشهادة ختم التعليم الأساسي، يمكنك زيارة',official:'أرشيف 9Web',available:'مستويات متاحة',subjects:'مواد في هذا المستوى',illustrated:'صفحة مصوّرة'},
    fr:{root:'Bibliothèque illustrée',primary:'École primaire',middle:'Collège',chooseStage:'Choisissez le cycle',start:'Commencez ici pour accéder aux ressources de votre niveau',chooseGrade:'Choisissez votre niveau',chooseSubject:'Choisissez une matière',lessons:'Cours et résumés',exams:'Examens et corrigés',lessonSub:'Pages pédagogiques illustrées',examSub:'Devoirs et tests d’entraînement',resources:'ressources illustrées',pages:'pages prêtes à consulter',lessonType:'Leçon illustrée',summaryType:'Fiche résumé',exam1:'Entraînement 1',exam2:'Entraînement 2',correction:'Proposition de correction',open:'Ouvrir la page',back:'Précédent',next:'Suivant',close:'Fermer',download:'Télécharger l’image',print:'Imprimer',source:'Les nouvelles pages sont des ressources originales de 9rayti, créées pour l’entraînement. Elles ne sont pas des examens officiels. Pour les épreuves nationales du certificat de fin d’études de base, consultez',official:'Archives 9Web',available:'niveaux disponibles',subjects:'matières dans ce niveau',illustrated:'page illustrée'},
    en:{root:'Visual library',primary:'Primary school',middle:'Middle school',chooseStage:'Choose a school stage',start:'Start here to find resources for your grade',chooseGrade:'Choose your grade',chooseSubject:'Choose a subject',lessons:'Lessons and summaries',exams:'Exams and answer guides',lessonSub:'Illustrated learning pages',examSub:'Practice papers and tests',resources:'illustrated resources',pages:'pages ready to view',lessonType:'Illustrated lesson',summaryType:'Summary sheet',exam1:'Practice test 1',exam2:'Practice test 2',correction:'Suggested correction',open:'Open page',back:'Previous',next:'Next',close:'Close',download:'Download image',print:'Print',source:'These new illustrated pages are original practice resources created by 9rayti. They are not official ministry exams or documents. For national basic education certificate exams, visit',official:'9Web archive',available:'grades available',subjects:'subjects in this grade',illustrated:'illustrated page'}
  };
  const lang=()=>['ar','fr','en'].includes(document.documentElement.lang)?document.documentElement.lang:'ar';
  const t=k=>(w[lang()]||w.ar)[k]||w.ar[k]||k;
  const subj=s=>(subjects[lang()]||subjects.ar)[s]||s;
  const gradeName=id=>(grades[lang()]||grades.ar)[id]||id;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const levelIds=['3p','4p','5p','6p','7b','8b','9b'];
  const state={category:'lesson',stage:null,level:null,subject:null,index:0,zoom:100};
  const content=$('#visualLibraryContent'),crumb=$('#visualBreadcrumb');
  const catItems=()=>resources.filter(r=>r.category===state.category);
  function setCrumb(){
    const bits=[`<button data-vback="root">${t('root')}</button>`];
    if(state.stage)bits.push(`<span>›</span><button data-vback="stage">${state.stage==='primary'?t('primary'):t('middle')}</button>`);
    if(state.level)bits.push(`<span>›</span><button data-vback="level">${gradeName(state.level)}</button>`);
    if(state.subject)bits.push(`<span>›</span><span class="crumb-current">${subj(state.subject)}</span>`);
    crumb.innerHTML=bits.join('');
    crumb.querySelectorAll('[data-vback]').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.vback;if(v==='root')state.stage=state.level=state.subject=null;if(v==='stage')state.level=state.subject=null;if(v==='level')state.subject=null;render();}));
  }
  function render(){
    setCrumb();
    if(!state.stage){
      content.innerHTML=`<div class="visual-step-title"><h3>${t('chooseStage')}</h3><p>${t('start')}</p></div><div class="visual-stage-grid"><button class="visual-stage-card" data-stage="primary"><span class="visual-card-kicker">PRIMARY · 4 LEVELS</span><b>${t('primary')}</b><small>${lang()==='ar'?'من الثالثة إلى السادسة ابتدائي':lang()==='fr'?'De la 3e à la 6e année':'Grades 3 to 6'}</small><span class="visual-card-arrow">↙</span></button><button class="visual-stage-card" data-stage="middle"><span class="visual-card-kicker">MIDDLE · 3 LEVELS</span><b>${t('middle')}</b><small>${lang()==='ar'?'من السابعة إلى التاسعة أساسي':lang()==='fr'?'De la 7e à la 9e année':'Grades 7 to 9'}</small><span class="visual-card-arrow">↙</span></button></div>`;
      content.querySelectorAll('[data-stage]').forEach(b=>b.addEventListener('click',()=>{state.stage=b.dataset.stage;render();}));return;
    }
    if(!state.level){
      const rows=levelIds.map(id=>resources.find(r=>r.level===id)).filter(Boolean).map(r=>({id:r.level,stage:r.stage})).filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).filter(x=>x.stage===state.stage);
      content.innerHTML=`<div class="visual-step-title"><h3>${t('chooseGrade')}</h3><p>${rows.length} ${t('available')}</p></div><div class="visual-grade-grid">${rows.map((l,i)=>`<button class="visual-grade-card" data-level="${l.id}"><span class="visual-card-kicker">GRADE 0${i+1}</span><b>${gradeName(l.id)}</b><small>${state.category==='lesson'?t('lessonSub'):t('examSub')}</small><span class="visual-card-arrow">↙</span></button>`).join('')}</div>`;
      content.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{state.level=b.dataset.level;render();}));return;
    }
    if(!state.subject){
      const list=catItems().filter(r=>r.level===state.level);const ids=[...new Set(list.map(r=>r.subject))].sort((a,b)=>subjectOrder.indexOf(a)-subjectOrder.indexOf(b));
      content.innerHTML=`<div class="visual-step-title"><h3>${t('chooseSubject')}</h3><p>${ids.length} ${t('subjects')}</p></div><div class="visual-subject-grid">${ids.map(s=>`<button class="visual-subject-card" data-subject="${s}"><span class="visual-card-kicker">SUBJECT</span><b>${subj(s)}</b><small class="visual-count">${list.filter(r=>r.subject===s).length} ${t('resources')}</small><span class="visual-card-arrow">↙</span></button>`).join('')}</div>`;
      content.querySelectorAll('[data-subject]').forEach(b=>b.addEventListener('click',()=>{state.subject=b.dataset.subject;render();}));return;
    }
    const items=catItems().filter(r=>r.level===state.level&&r.subject===state.subject);
    content.innerHTML=`<div class="visual-step-title"><h3>${state.category==='lesson'?t('lessons'):t('exams')} · ${subj(state.subject)}</h3><p>${items.length} ${t('pages')}</p></div><div class="visual-resource-grid">${items.map((r,i)=>`<article class="visual-resource-card"><img class="visual-resource-thumb" src="${esc(r.file)}" alt="${esc(r.title)}" loading="lazy"><div class="visual-resource-info"><b>${esc(r.title)}</b><small>${r.kind==='lesson'?t('lessonType'):r.kind==='summary'?t('summaryType'):r.kind==='exam1'?t('exam1'):r.kind==='exam2'?t('exam2'):t('correction')} · ${t('illustrated')}</small><button class="visual-open-btn" data-open-index="${i}">${t('open')} ↙</button></div></article>`).join('')}</div>`;
    content.querySelectorAll('[data-open-index]').forEach(b=>b.addEventListener('click',()=>openViewer(items,Number(b.dataset.openIndex))));
  }
  const viewer=document.createElement('div');viewer.className='visual-viewer';viewer.id='visualViewer';
  viewer.innerHTML=`<div class="visual-viewer-panel" role="dialog" aria-modal="true" aria-label="Image viewer"><div class="visual-viewer-top"><span class="visual-viewer-title" id="visualViewerTitle"></span><button type="button" id="visualZoomOut" aria-label="Zoom out">−</button><button type="button" id="visualZoomIn" aria-label="Zoom in">+</button><button type="button" id="visualClose">${t('close')} ×</button></div><div class="visual-viewer-stage" id="visualViewerStage"><img class="visual-viewer-image" id="visualViewerImage" alt="Illustrated learning page"></div><div class="visual-viewer-bottom"><button id="visualPrev">← ${t('back')}</button><span id="visualCounter"></span><div><button id="visualPrint">${t('print')}</button> <a class="visual-download" id="visualDownload" download style="display:inline-block;text-decoration:none;border-radius:8px;padding:8px 11px;font-size:11px;background:#173b32;color:white">${t('download')}</a></div><button id="visualNext">${t('next')} →</button></div></div>`;
  document.body.append(viewer);
  let currentItems=[];const img=$('#visualViewerImage'),title=$('#visualViewerTitle');
  function updateViewer(){const r=currentItems[state.index];if(!r)return;title.textContent=r.title;img.src=r.file;img.alt=r.title;img.style.width=state.zoom+'%';$('#visualCounter').textContent=`${state.index+1} / ${currentItems.length} · ${r.origin}`;$('#visualDownload').href=r.file;$('#visualDownload').download=r.id+'.png';$('#visualPrev').disabled=state.index===0;$('#visualNext').disabled=state.index===currentItems.length-1;$('#visualViewerStage').scrollTop=0;}
  function openViewer(items,index){currentItems=items;state.index=index;state.zoom=100;updateViewer();viewer.classList.add('open');document.body.style.overflow='hidden';}
  function closeViewer(){viewer.classList.remove('open');document.body.style.overflow='';document.body.classList.remove('visual-printing');}
  $('#visualClose').addEventListener('click',closeViewer);viewer.addEventListener('click',e=>{if(e.target===viewer)closeViewer();});
  $('#visualPrev').addEventListener('click',()=>{if(state.index>0){state.index--;updateViewer();}});
  $('#visualNext').addEventListener('click',()=>{if(state.index<currentItems.length-1){state.index++;updateViewer();}});
  $('#visualZoomIn').addEventListener('click',()=>{state.zoom=Math.min(160,state.zoom+15);img.style.width=state.zoom+'%';});
  $('#visualZoomOut').addEventListener('click',()=>{state.zoom=Math.max(60,state.zoom-15);img.style.width=state.zoom+'%';});
  $('#visualPrint').addEventListener('click',()=>{document.body.classList.add('visual-printing');window.print();setTimeout(()=>document.body.classList.remove('visual-printing'),500);});
  document.addEventListener('keydown',e=>{if(!viewer.classList.contains('open'))return;if(e.key==='Escape')closeViewer();if(e.key==='ArrowLeft'&&state.index<currentItems.length-1){state.index++;updateViewer();}if(e.key==='ArrowRight'&&state.index>0){state.index--;updateViewer();}});
  document.querySelectorAll('[data-vcat]').forEach(b=>b.addEventListener('click',()=>{state.category=b.dataset.vcat;state.stage=state.level=state.subject=null;document.querySelectorAll('[data-vcat]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b?'true':'false');});render();}));
  function applyVisualLanguage(){
    const l=lang(),section=$('#visual-library');
    const nav=document.querySelector('.main-nav a[href="#visual-library"]');if(nav)nav.textContent=l==='fr'?'Bibliothèque illustrée':l==='en'?'Visual library':'المكتبة المصوّرة';
    const eyebrow=section.querySelector('.visual-heading .eyebrow span:last-child');if(eyebrow)eyebrow.textContent=l==='fr'?'Archives illustrées 9rayti':l==='en'?'9rayti visual archive':'أرشيف قرايتي المصوّر';
    const h=section.querySelector('.visual-heading h2');if(h)h.innerHTML=l==='fr'?'Explorez le savoir, <em>page après page.</em>':l==='en'?'Explore knowledge, <em>page by page.</em>':'تصفّح المعرفة، <em>صفحةً بعد صفحة.</em>';
    const p=section.querySelector('.visual-heading p');if(p)p.textContent=l==='fr'?'Cours, résumés et devoirs sous forme de pages illustrées, à agrandir, imprimer ou télécharger.':l==='en'?'Lessons, summaries and practice papers as image pages you can zoom, print or download.':'دروس وملخّصات وفروض تدريبية على هيئة صفحات مصوّرة قابلة للتكبير والطباعة والتنزيل.';
    $('#visualTotal').textContent=`${resources.length} ${l==='fr'?'pages illustrées':l==='en'?'illustrated pages':'صفحة مصوّرة'}`;
    const intro=section.querySelector('.visual-library-intro>div span');if(intro)intro.textContent=l==='fr'?'Ressources originales classées par niveau et matière':l==='en'?'Original practice resources organized by grade and subject':'محتوى تدريبي أصلي موزّع حسب المستوى والمادة';
    const tabs=section.querySelectorAll('[data-vcat]');if(tabs[0]){tabs[0].querySelector('b').textContent=t('lessons');tabs[0].querySelector('small').textContent=t('lessonSub');}if(tabs[1]){tabs[1].querySelector('b').textContent=t('exams');tabs[1].querySelector('small').textContent=t('examSub');}
    const note=section.querySelector('.visual-source-note p');if(note)note.innerHTML=`${t('source')} <a href="https://9web.edunet.tn/" target="_blank" rel="noopener">${t('official')}</a>.`;
    render();
  }
  $('#language')?.addEventListener('change',()=>setTimeout(applyVisualLanguage,0));
  $('#visualTotal').textContent=`${resources.length} صفحة مصوّرة`;
  applyVisualLanguage();
})();
