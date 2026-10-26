/* Static, local-only search and eligibility: no paid services or tracking. */
(function(){
 'use strict';
 const D=window.ZCST_DATA,C=window.ZCST_COMPARE,$=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const val=v=>v==null?'—':esc(v), sources=Object.fromEntries(D.sources.map(x=>[x.id,x]));
 let category='',shown=[],toastTimer,browsing=false,visibleLimit=12;
 function toast(s){$('#toast').textContent=s;$('#toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.display='none',3000)}
 function showDialog(d){if(d.open)return;if(d.showModal)d.showModal();else d.setAttribute('open','')}
 function closeDialog(d){if(d.close)d.close();else d.removeAttribute('open')}
 function navigate(){
  const requested=location.hash.slice(1).split('?')[0],page=requested==='eligibility'?'eligibility':'majors';
  if(requested&&requested!==page)history.replaceState(null,'',location.pathname+location.search+'#'+page);
  $$('.page').forEach(e=>e.hidden=e.id!==page);$$('[data-nav]').forEach(e=>e.classList.toggle('active',e.dataset.nav===page));
  if(page==='eligibility')window.scrollTo(0,0);
 }
 window.addEventListener('hashchange',navigate);navigate();
 function sourceLink(id){const s=sources[id];return s?`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`:''}
 function renderCategories(){const cats=['','管理学','工学','经济学','医学','文学','教育学','艺术学','理学','法学'];$('#categories').innerHTML=cats.map(c=>`<button class="chip ${category===c?'active':''}" data-category="${c}" aria-pressed="${category===c}">${c||'全部门类'}</button>`).join('')}
 function comparisonTable(m,p,rows){
  const allowed=C.comparable(p,m),left=m.year===2025?m:p,right=m.year===2026?m:null;
  return `<table class="year-comparison" aria-label="${esc(m.name)}两年招生数据对照"><thead><tr><th scope="col">指标</th><th scope="col">2025年</th><th scope="col">2026年</th><th scope="col">数值变化</th></tr></thead><tbody>${rows.map(([name,key])=>`<tr><th scope="row">${name}</th><td>${val(left?.[key])}</td><td>${val(right?.[key])}</td><td class="delta">${C.difference(left?.[key],right?.[key],allowed)}</td></tr>`).join('')}</tbody></table>`;
 }
 function outlineHref(m){const i=D.outlines.findIndex(o=>o.url===m.outline);return i<0?'':`outline.html?id=${String(i+1).padStart(2,'0')}&major=${encodeURIComponent(m.id)}`}
 function requirements(m){if(m.year===2025)return `<details class="major-fold requirements" id="requirements-${m.id}"><summary>报考要求<span>2025年历史信息</span></summary><div class="requirements-body"><dl class="requirement-list"><div><dt>考试科目</dt><dd>${esc((m.subjects||[]).join('、'))}</dd></div><div><dt>专业限制</dt><dd>${esc(m.requirements||'暂无资料')}</dd></div><div><dt>学制</dt><dd>${val(m.duration)} 年</dd></div></dl><p class="requirement-footnote">仅展示2025年该批次资料；未提供费用及2026年计划，不作为当年报考资格结论。</p></div></details>`;const reader=outlineHref(m);return `<details class="major-fold requirements" id="requirements-${m.id}"><summary>报考要求<span>2026年 · 科目、限制与费用</span></summary><div class="requirements-body"><dl class="requirement-list"><div><dt>考试科目</dt><dd>${esc((m.subjects||[]).join('、'))}</dd></div><div><dt>专业限制</dt><dd>${esc(m.requirements||'暂无')}</dd></div><div><dt>学制费用</dt><dd class="fees-inline"><span>学制 ${val(m.duration)} 年</span><span>学费 ${val(m.tuition)} 元/年</span><span>住宿费 ${val(m.accommodation)} 元/年</span></dd></div>${m.books?`<div><dt>参考书目</dt><dd class="books-inline">${esc(m.books)}</dd></div>`:''}</dl>${reader?`<a class="outline-read" href="${esc(reader)}"><span>在线阅读考试大纲<small>无需下载，手机直接阅读</small></span><span aria-hidden="true">→</span></a>`:''}<p class="requirement-footnote">前置专业是否符合，以学校审核为准。<a href="${esc(sources.prerequisite2026.url)}" target="_blank" rel="noopener">查看具体要求 ↗</a></p></div></details>`}

 function card(m){
  const p=C.previous(D.records,m),veteran=m.batch==='退役士兵批',music=!!p&&p.name!==m.name;
  const figures=(veteran||m.batch==='建档立卡批')?comparisonTable(m,p,[['招生计划（人）','plan']]):`${music?`<p class="music-note">2025为${esc(p.name)}整体；2026为本方向，不计算差值。</p>`:''}${comparisonTable(m,p,[['最低分','minScore'],['最低排位','worstRank'],['招生计划（人）','plan'],['录取人数（人）','admitted'],['投档人数（人）','filed']])}`;
  return `<article class="major-card" id="major-${m.id}" data-major="${m.id}" tabindex="-1"><div class="compact-title"><h2><button class="major-title-toggle" data-toggle-requirements="${m.id}" aria-expanded="false" aria-controls="requirements-${m.id}">${esc(m.name)}</button></h2><span class="badge ${m.examType==='校考'?'school':''}">${esc(m.examType)}</span></div><p class="subline">${esc(m.batch)} · 专业号 ${esc(m.code)}</p>${figures}${requirements(m)}<div class="major-share"><button data-share="${m.id}" aria-label="分享${esc(m.name)}">分享专业 ↗</button></div></article>`;
 }
 function render(){
  const batch=$('#batch').value,q=$('#search').value.trim().toLowerCase(),exam=$('#exam').value;
  shown=D.records.filter(m=>m.year===(batch==='建档立卡批'?2025:2026)&&m.batch===batch&&(!category||m.category===category)&&(!exam||m.examType===exam)&&(!q||[m.name,m.code].join(' ').toLowerCase().includes(q)));
  if($('#sort').value==='min')shown.sort((a,b)=>(a.minScore??Infinity)-(b.minScore??Infinity));
  if($('#sort').value==='plan')shown.sort((a,b)=>(b.plan??-1)-(a.plan??-1));
  const active=!!q||browsing;
  $('#resultSection').hidden=!active;$('#searchStart').hidden=active;$('#loadMore').hidden=!active||shown.length<=visibleLimit;
  $('#resultCount').innerHTML=`找到 <b>${shown.length}</b> 个专业${batch==='普通批'?'及方向':''}`;
  $('#batchNote').textContent=batch==='退役士兵批'?'展示2025与2026年计划；变化＝2026－2025。暂无该批次投档与录取结果。':batch==='建档立卡批'?'仅收录2025年计划；2026年及录取结果暂缺，不与普通批混算。':'分数与排位：2025录取、2026投档；变化＝2026－2025。排位数值越小越靠前；跨年差值不代表录取难度。“—”表示暂无数据。';
  $('#results').innerHTML=!active?'':shown.length?shown.slice(0,visibleLimit).map(card).join(''):`<div class="empty-state"><h3>没有找到相关专业</h3><p>试试更短的专业名称，或调整批次和筛选条件。</p><button class="quiet" id="emptyReset">重新查找</button></div>`;
  renderCategories();
 }
 function reset(){browsing=false;visibleLimit=12;category='';$('#search').value='';$('#batch').value='普通批';$('#exam').value='';$('#sort').value='code';render()}
 ['batch','exam','sort'].forEach(s=>$('#'+s).addEventListener('change',()=>{visibleLimit=12;if(s==='exam')browsing=true;render()}));
 $('#search').addEventListener('input',()=>{visibleLimit=12;browsing=false;render()});$('#reset').addEventListener('click',reset);
 $('#searchForm').addEventListener('submit',e=>{e.preventDefault();if(!$('#search').value.trim()){toast('请输入专业名称，或点击“浏览全部专业”');$('#search').focus();return}visibleLimit=12;render();$('#search').blur();$('#resultSection').scrollIntoView({behavior:'smooth',block:'start'})});
 $$('[data-query]').forEach(b=>b.onclick=()=>{category='';$('#exam').value='';$('#search').value=b.dataset.query;browsing=false;visibleLimit=12;render()});
 $('#browseAll').onclick=()=>{$('#search').value='';browsing=true;visibleLimit=12;render()};
 $('#loadMore').onclick=()=>{visibleLimit+=12;render()};
 $('#categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;browsing=true;visibleLimit=12;render()}});
 $('#results').addEventListener('click',e=>{const b=e.target.closest('[data-share]');if(b)share(b.dataset.share);const t=e.target.closest('[data-toggle-requirements]');if(t){const d=document.getElementById('requirements-'+t.dataset.toggleRequirements);d.open=!d.open}if(e.target.id==='emptyReset')reset()});
 $('#results').addEventListener('toggle',e=>{if(!e.target.matches('.requirements'))return;const card=e.target.closest('.major-card'),button=card.querySelector('.major-title-toggle');button.setAttribute('aria-expanded',String(e.target.open))},true);
 function share(id){const u=new URL(location.href);u.search='';u.searchParams.set('major',id);u.hash='majors';$('#shareUrl').value=u.href;$('#copyStatus').textContent='';showDialog($('#shareDialog'))}
 $('#copyBtn').addEventListener('click',async()=>{const input=$('#shareUrl');try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(input.value)}else{input.focus();input.select();if(!document.execCommand('copy'))throw Error('copy')}$('#copyStatus').textContent='链接已复制，可粘贴到微信。'}catch{$('#copyStatus').textContent='请长按链接手动复制。';input.focus();input.select()}});
 $$('[data-close]').forEach(b=>b.onclick=()=>closeDialog(b.closest('dialog')));$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d)}}));
 document.addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)&&!$('dialog[open]')){e.preventDefault();location.hash='majors';$('#search').focus()}});
 const form=$('#checkForm');
 function field(name,title,options){return `<label>${title}<select name="${name}" required><option value="">请选择</option>${options.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`}
 const yesno=[['yes','是'],['no','否'],['unknown','不确定']];
 function conditional(){
  const a=Object.fromEntries(new FormData(form)),old={...a};let html='';
  if(a.route==='normal'){
   if(a.education==='current'&&a.hukou==='other'){html+=field('location','专科就读地区',[['gd','广东省内普通高校'],['other','外省普通高校'],['unknown','不确定']]);if(a.location==='other')html+=field('gaokao','是否在广东参加普通高考并被该外省高校录取？',yesno)}
   if(a.hukou==='gd'&&['previous','nonfull'].includes(a.education)){html+=field('years','报名时广东户籍是否连续满3年？',yesno);if(a.education==='previous'&&a.years==='no')html+=field('gdexam','是否在广东参加普通高考，且高考报名时为广东户籍？',yesno)}
   if(a.hukou==='gd'&&a.education==='nonfull'){html+=field('medical','广东基本医疗保险缴费是否累计满1年？',yesno)+field('pension','广东基本养老保险缴费是否累计满1年？',yesno)+field('certificate','专科毕业证书与日期',[['yes','国家承认学历，证书落款在2026年2月底前'],['selfexam','已办2025年12月自考毕业手续，但尚未领证'],['no','不符合上述情况'],['unknown','不确定']])}
  }
  $('#conditionalFields').innerHTML=html?'<div class="form-grid">'+html+'</div>':'';
  Object.entries(old).forEach(([k,v])=>{const el=form.elements.namedItem(k);if(el)el.value=v});
  $('#checkResult').innerHTML='';
 }
 form.addEventListener('change',conditional);form.addEventListener('reset',()=>{setTimeout(()=>{$('#conditionalFields').innerHTML='';$('#checkResult').innerHTML=''},0)});
 form.addEventListener('submit',e=>{e.preventDefault();const a=Object.fromEntries(new FormData(form)),r=window.assessEligibility(a);$('#checkResult').innerHTML=`<section class="panel result-panel ${r.status==='likely'?'':'warn'}"><p class="eyebrow">2026年政策 · 自查结果</p><h2>${esc(r.title)}</h2><p>${esc(r.reason)}</p><p><b>对应条款：</b>${esc(r.clause)}</p><p><b>如符合条件，可按要求准备：</b></p><ul>${r.materials.map(s=>`<li>${esc(s)}</li>`).join('')}</ul><p class="detail-remark">自查仅梳理一般政策条件，不代表报名资格已获审核。还须核对目标专业前置条件、身体要求及当年正式报名安排。下一年度须使用新政策。</p><div class="source-links">${sourceLink('policy2026')}${sourceLink(a.route==='veteran'?'veteranCharter2026':'charter2026')}<a href="tel:07567626272">联系招生办：0756-7626272</a></div></section>`;$('#checkResult').scrollIntoView({behavior:'smooth',block:'start'})});

 render();
 const shared=new URLSearchParams(location.search).get('major');
 if(shared){
  const original=D.records.find(m=>m.id===shared);
  if(original){
   const targets=D.records.filter(m=>m.year===(original.batch==='建档立卡批'?2025:2026)&&m.batch===original.batch&&(m.name===original.name||(original.year===2025&&m.baseName===original.baseName)));
   if(targets.length){
    if(location.hash!=='#majors'){history.replaceState(null,'',location.pathname+location.search+'#majors');navigate()}
    $('#batch').value=original.batch;$('#search').value=original.name;render();
    requestAnimationFrame(()=>{const target=document.getElementById('major-'+targets[0].id);if(target){target.classList.add('shared-target');if(new URLSearchParams(location.search).get('showRequirements')==='1')target.querySelector('.requirements').open=true;target.focus({preventScroll:true});target.scrollIntoView({block:'start'})}});
   }
  }else toast('该专业链接暂未收录，请输入专业名称查找。');
 }
})();
