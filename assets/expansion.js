/* 9RAYTI EXPANSION — Phase 1 browser tools. No remote AI, accounts or official exam claims. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lang = () => document.documentElement.lang || 'ar';
  const tr = (ar, fr, en) => lang()==='fr' ? fr : lang()==='en' ? en : ar;
  const get = (k, fallback) => { try { return JSON.parse(localStorage.getItem('9rayti-'+k)) ?? fallback; } catch { return fallback; } };
  const put = (k, value) => localStorage.setItem('9rayti-'+k, JSON.stringify(value));
  const levels = window.MIDAD_LEVELS || [];
  const subjects = window.MIDAD_SUBJECTS || [];
  const hub = $('#study-tools');
  if (!hub) return;

  const cards = [
    ['ai-coach','✧', ['المعلّم الذكي – المرحلة الأولى','Tuteur intelligent – phase 1','Smart tutor – phase 1'], ['شرح إرشادي محلي دون اتصال بخدمة AI بعد','Explications guidées locales, sans IA distante','Local guided help; no remote AI yet']],
    ['exam-maker','▤', ['منشئ الاختبارات','Générateur de tests','Practice test builder'], ['أنشئ اختباراً تدريبياً وصحّح إجاباتك','Créez un test et corrigez vos réponses','Build a practice test and check answers']],
    ['play-learn','★', ['العب وتعلّم','Jouer et apprendre','Play & Learn'], ['تحديات حساب ومفردات مع نقاط','Défis de calcul et vocabulaire','Math and vocabulary mini-games']],
    ['parent-view','⌂', ['لوحة متابعة الولي','Espace parent','Parent progress view'], ['ملخص محلي بموافقة التلميذ وعلى جهازه','Résumé local sur cet appareil','Local summary on this device']],
    ['level-check','◎', ['اكتشف مستواي','Évaluer mon niveau','Check my level'], ['تقييم تشخيصي قصير واقتراح مراجعة','Petit diagnostic et conseils','Short diagnostic and revision tips']]
  ];
  const grid = hub.querySelector('.feature-grid');
  cards.forEach(([id, icon, title, desc]) => {
    if (grid.querySelector(`[data-expansion="${id}"]`)) return;
    const b = document.createElement('button'); b.type='button'; b.className='feature-tile'; b.dataset.expansion=id;
    b.innerHTML = `<span>${icon}</span><b>${tr(...title)}</b><small>${tr(...desc)}</small>`;
    grid.append(b);
  });

  const modal = document.createElement('div'); modal.className='tool-modal hidden'; modal.id='expansionModal';
  modal.innerHTML='<div class="tool-dialog" role="dialog" aria-modal="true" aria-labelledby="expansionTitle"><button class="tool-close" type="button" aria-label="Close">×</button><div id="expansionBody"></div></div>';
  document.body.append(modal);
  const close=()=>modal.classList.add('hidden'); modal.querySelector('.tool-close').addEventListener('click',close); modal.addEventListener('click',e=>{if(e.target===modal)close()});
  const open=(title,body)=>{ $('#expansionBody').innerHTML=`<div class="eyebrow"><span class="eyebrow-line"></span>9RAYTI · NEXT</div><h2 id="expansionTitle">${title}</h2>${body}`; modal.classList.remove('hidden'); };
  const levelOptions=()=>levels.map(x=>`<option value="${esc(x.id)}">${esc(x[lang()]||x.ar)}</option>`).join('');
  const subjectOptions=()=>subjects.map(x=>`<option value="${esc(x.id)}">${esc(x[lang()]||x.ar)}</option>`).join('');

  function tutor(){
    open(tr('المعلّم الذكي – المرحلة الأولى','Tuteur intelligent – phase 1','Smart tutor – phase 1'),
      `<p class="tool-muted">${tr('هذه نسخة تمهيدية تعمل محلياً بقواعد وشروحات محددة. ليست نموذج ذكاء اصطناعي متصلاً، ولا تحلل الصور حالياً. لا تدخل بيانات شخصية.','Version initiale locale avec règles et explications ciblées. Ce n’est pas un modèle IA connecté et elle n’analyse pas encore les images.','A first local version with curated rules and explanations. It is not a connected AI model and cannot analyze images yet.')}</p>
      <label class="tool-label">${tr('المستوى','Niveau','Grade')}<select id="coachLevel">${levelOptions()}</select></label>
      <label class="tool-label">${tr('المادة','Matière','Subject')}<select id="coachSubject">${subjectOptions()}</select></label>
      <label class="tool-label">${tr('ما الذي تريد فهمه؟','Que souhaitez-vous comprendre ?','What would you like to understand?')}<textarea id="coachQuestion" rows="3" maxlength="1200" placeholder="${tr('مثال: كيف أجمع كسرين؟','Ex. : Comment additionner deux fractions ?','Example: How do I add two fractions?')}"></textarea></label>
      <button class="btn btn-primary" id="coachAsk">${tr('ساعدني على الفهم','Aidez-moi à comprendre','Help me understand')}</button><div id="coachAnswer" class="tool-answer" aria-live="polite"></div>
      <p class="tool-muted">${tr('المرحلة التالية: ربط API عبر خادم آمن بعد إعداد مفتاح الخدمة وسياسة حماية البيانات.','Étape suivante : connecter une API via un serveur sécurisé.','Next phase: connect an AI API through a secure backend.')}</p>`);
    $('#coachAsk').onclick=()=>{
      const q=$('#coachQuestion').value.trim(), s=$('#coachSubject').value, out=$('#coachAnswer');
      if(!q){out.textContent=tr('اكتب سؤالك أولاً.','Écrivez votre question.','Enter a question first.');return;}
      const rules=[
        {re:/مساح|aire|area/i, text:tr('الفكرة: مساحة المستطيل هي عدد الوحدات المربعة التي تغطي سطحه.\nالخطوة 1: حدّد الطول والعرض.\nالخطوة 2: اضرب الطول في العرض.\nمثال: طول 7 سم وعرض 3 سم، إذن المساحة 7 × 3 = 21 سم².\nتحقق: هل كتبت الوحدة مربعة؟','Idée : aire = longueur × largeur.\nExemple : 7 cm × 3 cm = 21 cm². Pensez à écrire une unité carrée.','Idea: area = length × width.\nExample: 7 cm × 3 cm = 21 cm². Remember square units.')},
        {re:/كسور|fraction/i, text:tr('لجمع كسرين: إذا كان المقامان متساويين، اجمع البسطين واحتفظ بالمقام. إذا اختلفا، ابحث عن مقام مشترك أولاً.\nمثال: 2/7 + 3/7 = 5/7.\nجرّب الآن: 1/5 + 2/5.','Pour additionner des fractions : même dénominateur, additionnez les numérateurs. Exemple : 2/7 + 3/7 = 5/7.','To add fractions: with equal denominators, add numerators. Example: 2/7 + 3/7 = 5/7.')},
        {re:/محيط|périmètre|perimeter/i, text:tr('محيط المستطيل هو مجموع أطوال أضلاعه. القاعدة: 2 × (الطول + العرض).\nمثال: طول 7 سم وعرض 3 سم، المحيط = 2 × (7 + 3) = 20 سم.','Le périmètre du rectangle = 2 × (longueur + largeur). Exemple : 2 × (7 + 3) = 20 cm.','Rectangle perimeter = 2 × (length + width). Example: 2 × (7 + 3) = 20 cm.')},
        {re:/فعل|verbe|verb/i, text:tr('الفعل كلمة تدل على حدث مرتبط بزمن. في العربية نميّز الفعل الماضي والمضارع والأمر. ابحث في الجملة عن الكلمة التي تعبّر عن العمل أو الحدث ثم حدّد زمنها.','Un verbe exprime une action ou un état. Repérez le verbe puis identifiez son temps.','A verb expresses an action or state. Find the verb, then identify its tense.')}
      ];
      const found=rules.find(x=>x.re.test(q));
      out.textContent=found?found.text:tr('لنختر طريقة عمل: 1) اكتب عنوان الدرس. 2) استخرج الكلمات أو المعطيات المهمة. 3) حدّد ما تعرفه وما تريد إيجاده. 4) حاول خطوة واحدة ثم راجعها. لا تتوفر لديّ بعد قاعدة موثقة لهذا السؤال؛ أضف نص الدرس أو ارجع إلى مورد موثوق في المكتبة.','Méthode : 1) notez le titre. 2) relevez les données. 3) identifiez ce que vous savez et cherchez. 4) essayez une étape. Cette question ne correspond pas encore à une règle documentée dans cette version.','Try this method: 1) name the lesson. 2) identify key information. 3) state what you know and need. 4) attempt one step. This version does not yet have a verified rule for that question.');
      const mistakes=get('mistakes',[]); mistakes.unshift(`${$('#coachSubject').selectedOptions[0].text}: ${q}`); put('mistakes',mistakes.slice(0,100));
    };
  }

  const questionBank=[
    {id:'m1',subject:'math',q:{ar:'ما ناتج 36 ÷ 6؟',fr:'Combien font 36 ÷ 6 ?',en:'What is 36 ÷ 6?'},a:['5','6','7'],c:1,why:{ar:'لأن 6 × 6 = 36.',fr:'Car 6 × 6 = 36.',en:'Because 6 × 6 = 36.'}},
    {id:'m2',subject:'math',q:{ar:'مستطيل طوله 8 سم وعرضه 2 سم. ما مساحته؟',fr:'Un rectangle mesure 8 cm sur 2 cm. Quelle est son aire ?',en:'A rectangle is 8 cm by 2 cm. What is its area?'},a:['10 سم²','16 سم²','20 سم²'],c:1,why:{ar:'المساحة = الطول × العرض = 8 × 2 = 16 سم².',fr:'Aire = 8 × 2 = 16 cm².',en:'Area = 8 × 2 = 16 cm².'}},
    {id:'a1',subject:'arabic',q:{ar:'كلمة «يكتب» هي:',fr:'Le mot « يكتب » est :',en:'The word “يكتب” is a:'},a:['اسم','فعل','حرف'],c:1,why:{ar:'لأنها تدل على حدث في الزمن الحاضر.',fr:'C’est un verbe.',en:'It is a verb.'}},
    {id:'f1',subject:'french',q:{ar:'اختر أداة التعريف المناسبة: ___ école',fr:'Choisissez l’article : ___ école',en:'Choose the article: ___ école'},a:['Le','La','L’'],c:2,why:{ar:'نستعمل L’ قبل كلمة تبدأ بحرف صوتي.',fr:'On utilise L’ devant une voyelle.',en:'Use L’ before a vowel sound.'}},
    {id:'e1',subject:'english',q:{ar:'اختر الفعل الصحيح: She ___ to school.',fr:'Choisissez : She ___ to school.',en:'Choose the correct verb: She ___ to school.'},a:['go','goes','going'],c:1,why:{ar:'مع She في المضارع البسيط نضيف s للفعل.',fr:'Avec “she”, le verbe prend -s au présent simple.',en:'With “she”, add -s in the present simple.'}},
    {id:'s1',subject:'science',q:{ar:'ما الحالة التي يكون عليها الماء عند التجمد؟',fr:'Quel est l’état de l’eau lorsqu’elle gèle ?',en:'What state is water in when it freezes?'},a:['صلبة','سائلة','غازية'],c:0,why:{ar:'يتحول الماء إلى جليد، أي الحالة الصلبة.',fr:'L’eau devient de la glace, un solide.',en:'Water becomes ice, a solid.'}}
  ];
  function exam(){
    open(tr('منشئ الاختبارات التدريبية','Générateur de tests','Practice test builder'),
      `<p class="tool-muted">${tr('أسئلة تدريبية توضيحية محدودة وليست امتحانات رسمية أو تغطية كاملة للبرنامج. اختر المادة وعدد الأسئلة.','Questions d’entraînement indicatives, non officielles et non exhaustives.','Illustrative practice questions only; not official exams or a complete syllabus.')}</p>
      <div class="math-grid"><label class="tool-label">${tr('المستوى','Niveau','Grade')}<select id="examLevel">${levelOptions()}</select></label><label class="tool-label">${tr('المادة','Matière','Subject')}<select id="examSubject">${subjectOptions()}</select></label></div>
      <label class="tool-label">${tr('عدد الأسئلة','Nombre de questions','Number of questions')}<select id="examCount"><option value="3">3</option><option value="5">5</option><option value="10">10</option></select></label>
      <button class="btn btn-primary" id="makeExam">${tr('إنشاء الاختبار','Créer le test','Create test')}</button><div id="examArea"></div>`);
    $('#makeExam').onclick=()=>{
      const subject=$('#examSubject').value, count=+$('#examCount').value;
      const pool=questionBank.filter(q=>q.subject===subject);
      const selected=pool.slice().sort(()=>Math.random()-.5).slice(0,count);
      const area=$('#examArea');
      if(!selected.length){area.innerHTML=`<p class="tool-feedback">${tr('لا تتوفر أسئلة تدريبية لهذه المادة في النسخة الحالية.','Aucune question disponible pour cette matière.','No practice questions are available for this subject yet.')}</p>`;return;}
      area.innerHTML=`<div class="exam-paper"><p class="tool-muted">${esc($('#examLevel').selectedOptions[0].text)} · ${esc($('#examSubject').selectedOptions[0].text)} · ${tr('تدريب','Entraînement','Practice')} · ${tr(`عدد الأسئلة المتاحة: ${selected.length}`,`${selected.length} questions disponibles`,`${selected.length} questions available`)}</p>${selected.map((q,i)=>`<fieldset class="exam-question"><legend>${i+1}. ${esc(q.q[lang()]||q.q.ar)}</legend>${q.a.map((a,j)=>`<label><input type="radio" name="ex${i}" value="${j}"> ${esc(a)}</label>`).join('')}</fieldset>`).join('')}<button class="btn btn-primary" id="gradeExam">${tr('تصحيح إجاباتي','Corriger mes réponses','Grade my answers')}</button><div id="examResult" class="tool-answer" aria-live="polite"></div></div>`;
      $('#gradeExam').onclick=()=>{let score=0;const details=selected.map((q,i)=>{const chosen=$(`input[name="ex${i}"]:checked`);const ok=!!chosen&&+chosen.value===q.c;if(ok)score++;return `${i+1}. ${ok?'✓':'✗'} ${q.why[lang()]||q.why.ar}`});$('#examResult').textContent=`${tr('نتيجتك','Votre résultat','Your score')}: ${score}/${selected.length}\n\n${details.join('\n')}`;put('lastExam',{score,total:selected.length,subject,date:new Date().toISOString()});put('points',get('points',0)+score*2);};
    };
  }
  function games(){
    open(tr('العب وتعلّم','Jouer et apprendre','Play & Learn'),
      `<p class="tool-muted">${tr('ألعاب قصيرة للتدريب. النقاط تحفظ محلياً في هذا المتصفح.','Mini-jeux éducatifs. Les points sont enregistrés localement.','Short learning games. Points are stored locally in this browser.')}</p>
      <div class="feature-grid game-choice"><button class="feature-tile" id="mathGame"><span>＋</span><b>${tr('تحدي الحساب','Défi calcul','Math sprint')}</b><small>${tr('عمليات سريعة','Calcul mental','Quick arithmetic')}</small></button><button class="feature-tile" id="wordGame"><span>文</span><b>${tr('تحدي المفردات','Défi vocabulaire','Word match')}</b><small>${tr('عربي وفرنسي وإنجليزي','Arabe, français, anglais','Arabic, French, English')}</small></button></div><div id="gameArea"></div>`);
    $('#mathGame').onclick = () => {
      const a=3+Math.floor(Math.random()*9), b=2+Math.floor(Math.random()*8), ans=a*b;
      $('#gameArea').innerHTML=`<div class="game-panel"><h3>${a} × ${b} = ؟</h3><input class="tool-input" id="mathAnswer" type="number" inputmode="numeric"><button class="btn btn-primary" id="checkMath">${tr('تحقق','Vérifier','Check')}</button><p id="gameFeedback" class="tool-feedback"></p></div>`;
      $('#checkMath').onclick = () => {
        const ok=Number($('#mathAnswer').value)===ans;
        $('#gameFeedback').textContent=ok?tr('أحسنت! +3 نقاط','Bravo ! +3 points','Great! +3 points'):tr(`حاول مجدداً. تلميح: ${a} مجموعات من ${b}.`,`Réessayez. Indice : ${a} groupes de ${b}.`,`Try again. Hint: ${a} groups of ${b}.`);
        if(ok){put('points',get('points',0)+3);$('#checkMath').disabled=true;}
      };
    };
    $('#wordGame').onclick = () => {
      const words=[['كتاب','livre','book'],['ماء','eau','water'],['شمس','soleil','sun'],['مدرسة','école','school']];
      const w=words[Math.floor(Math.random()*words.length)];
      $('#gameArea').innerHTML=`<div class="game-panel"><h3>${w[0]} = ؟</h3><div class="quiz-options">${[w[1],w[2],'maison'].sort(()=>Math.random()-.5).map(x=>`<button type="button" data-word="${esc(x)}">${esc(x)}</button>`).join('')}</div><p id="wordFeedback" class="tool-feedback"></p></div>`;
      $('#gameArea').querySelectorAll('[data-word]').forEach(button => {
        button.onclick = () => {
          const ok=button.dataset.word===w[1]||button.dataset.word===w[2];
          $('#wordFeedback').textContent=ok?tr('إجابة صحيحة! +3 نقاط','Bonne réponse ! +3 points','Correct! +3 points'):tr('حاول مرة أخرى.','Réessayez.','Try again.');
          if(ok){put('points',get('points',0)+3);$('#gameArea').querySelectorAll('button').forEach(x=>x.disabled=true);}
        };
      });
    };
  }
  function parent(){
    const tasks=get('tasks',[]), done=tasks.filter(x=>x.done).length, last=get('lastExam',null), points=get('points',0), wins=get('quizWins',0);
    open(tr('لوحة متابعة الولي','Espace parent','Parent progress view'),
      `<div class="notice-card"><b>${tr('خصوصية أولاً','Confidentialité d’abord','Privacy first')}</b><p>${tr('هذه لوحة محلية تعرض بيانات هذا المتصفح فقط. ليست حساب ولي حقيقياً ولا ترسل بيانات إلى أي جهة. لا تستخدم جهازاً مشتركاً دون موافقة التلميذ.','Ce tableau est local à ce navigateur. Aucun compte parent ni transmission de données.','This dashboard only reads this browser. No real parent account and no data is transmitted.')}</p></div>
      <div class="profile-stats"><div><b>${done}/${tasks.length}</b><small>${tr('مهام مكتملة','Tâches terminées','Tasks done')}</small></div><div><b>${points}</b><small>${tr('النقاط','Points','Points')}</small></div><div><b>${wins}</b><small>${tr('إجابات صحيحة','Bonnes réponses','Correct answers')}</small></div></div>
      <div class="notice-card"><b>${tr('آخر اختبار','Dernier test','Latest test')}</b><p>${last?`${esc(last.score)} / ${esc(last.total)} · ${esc(new Date(last.date).toLocaleDateString())}`:tr('لم يُسجّل اختبار بعد.','Aucun test enregistré.','No test recorded yet.')}</p></div>
      <p class="tool-muted">${tr('في المرحلة المتصلة ستضاف حسابات مستقلة وموافقة وليّ الأمر وصلاحيات خادمية آمنة.','La version connectée ajoutera des comptes distincts, le consentement parental et des autorisations côté serveur.','The connected phase will add separate accounts, parent consent and server-enforced permissions.')}</p>`);
  }
  function diagnostic(){
    const qs=[{q:tr('ما ناتج 9 × 4؟','Combien font 9 × 4 ?','What is 9 × 4?'),a:['32','36','40'],c:1},{q:tr('اختر الفعل في الجملة: «قرأ التلميذ»','Repérez le verbe : « L’élève lit »','Find the verb: “The student reads.”'),a:['التلميذ','قرأ','الـ'],c:1},{q:tr('ما مصدر الضوء الطبيعي نهاراً؟','Quelle est la source naturelle de lumière le jour ?','What is a natural source of daylight?'),a:[tr('القمر','La lune','The Moon'),tr('الشمس','Le soleil','The Sun'),tr('مصباح','Une lampe','A lamp')],c:1}];
    open(tr('اكتشف مستواي','Évaluer mon niveau','Check my level'),`<p class="tool-muted">${tr('تقييم تمهيدي قصير، لا يعادل اختباراً مدرسياً ولا يحدد المستوى الدراسي رسمياً.','Petit diagnostic indicatif, sans valeur scolaire officielle.','A short indicative check, not an official school assessment.')}</p>${qs.map((q,i)=>`<fieldset class="exam-question"><legend>${i+1}. ${q.q}</legend>${q.a.map((a,j)=>`<label><input type="radio" name="diag${i}" value="${j}"> ${esc(a)}</label>`).join('')}</fieldset>`).join('')}<button class="btn btn-primary" id="gradeDiag">${tr('اعرض النتيجة','Voir le résultat','Show result')}</button><div id="diagResult" class="tool-answer"></div>`);
    $('#gradeDiag').onclick=()=>{let score=0;qs.forEach((q,i)=>{const v=$(`input[name="diag${i}"]:checked`);if(v&&+v.value===q.c)score++});$('#diagResult').textContent=tr(`أجبت إجابة صحيحة عن ${score} من ${qs.length}. ${score===3?'واصل التقدم!':'راجع المهارات التي أخطأت فيها ثم أعد التدريب.'}`,`Vous avez ${score}/${qs.length}. ${score===3?'Continuez !':'Révisez puis réessayez.'}`,`You scored ${score}/${qs.length}. ${score===3?'Keep it up!':'Review and practise again.'}`);put('diagnostic',{score,total:qs.length,date:new Date().toISOString()});};
  }
  const actions={'ai-coach':tutor,'exam-maker':exam,'play-learn':games,'parent-view':parent,'level-check':diagnostic};
  grid.addEventListener('click',e=>{const b=e.target.closest('[data-expansion]');if(b)actions[b.dataset.expansion]?.()});
})();
