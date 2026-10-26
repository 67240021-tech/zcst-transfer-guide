/* No remote APIs: all searches and eligibility answers stay in this page. */
(function(){
 'use strict';
 const D=window.ZCST_DATA,$=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const val=v=>v==null?'—':esc(v), selected=new Set();
 let category='',shown=[],currentId='',toastTimer,browsing=false,visibleLimit=12;
 const sources=Object.fromEntries(D.sources.map(x=>[x.id,x]));
 function toast(s){$('#toast').textContent=s;$('#toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.display='none',3000)}
 function showDialog(d){if(d.open)return;if(d.showModal)d.showModal();else d.setAttribute('open','')}
 function closeDialog(d){if(d.close)d.close();else d.removeAttribute('open')}
 function navigate(){const p=location.hash.slice(1).split('?')[0]||'majors';$$('.page').forEach(e=>e.hidden=e.id!==( ['majors','eligibility','resources'].includes(p)?p:'majors'));$$('[data-nav]').forEach(e=>e.classList.toggle('active',e.dataset.nav===p));if(p!=='majors')window.scrollTo(0,0)}
 window.addEventListener('hashchange',navigate);navigate();
 function metric(label,n){return `<div class="metric"><small>${label}</small><strong class="${n==null?'empty':''}">${n==null?'暂无':n}</strong></div>`}
 function renderCategories(){const cats=['','管理学','工学','经济学','医学','文学','教育学','艺术学','理学','法学'];$('#categories').innerHTML=cats.map(c=>`<button class="chip ${category===c?'active':''}" data-category="${c}" aria-pressed="${category===c}">${c||'全部门类'}</button>`).join('')}
 function render(){
  const year=+$('#year').value,batch=$('#batch').value,q=$('#search').value.trim().toLowerCase(),exam=$('#exam').value;
  shown=D.records.filter(m=>m.year===year&&m.batch===batch&&(!category||m.category===category)&&(!exam||m.examType===exam)&&(!q||[m.name,m.code,m.category,...(m.subjects||[])].join(' ').toLowerCase().includes(q)));
  if($('#sort').value==='min')shown.sort((a,b)=>(a.minScore??Infinity)-(b.minScore??Infinity));
  if($('#sort').value==='plan')shown.sort((a,b)=>(b.plan??-1)-(a.plan??-1));
  const active=!!q||browsing;
  $('#resultSection').hidden=!active;$('#searchStart').hidden=active;
  $('#loadMore').hidden=!active||shown.length<=visibleLimit;
  $('#resultCount').innerHTML=`找到 <b>${shown.length}</b> 个专业${year===2026&&batch==='普通批'?'及方向':''}`;
  $('#batchNote').textContent=year===2025?'2025年为普通批录取口径；未提供该年招生计划、专业号及收费信息。音乐专业未细分方向。':batch==='退役士兵批'?'退役士兵批仅展示2026年计划；分数与录取数据尚未录入。':'2026年为普通批投档口径，最终录取人数暂缺。计划与投档分别保留；不同科目组排位不可直接比较。';
  $('#results').innerHTML=!active?'':shown.length?shown.slice(0,visibleLimit).map(m=>`<article class="major-card"><div class="card-main"><div class="compact-title"><h3><button class="title-btn" data-detail="${m.id}">${esc(m.name)}</button></h3><span class="badge ${m.examType==='校考'?'school':''}">${esc(m.examType)}</span></div><p class="subline">${m.year} · ${esc(m.batch)}${m.code?' · '+esc(m.code):''}</p><div class="metrics">${metric(year===2025?'录取人数':'招生计划',year===2025?m.admitted:m.plan)}${metric(year===2025?'录取最低分':'投档最低分',m.minScore)}${metric('最低排位',m.worstRank)}</div></div><div class="card-bottom"><label class="compare-check"><input type="checkbox" data-compare="${m.id}" ${selected.has(m.id)?'checked':''}>对比</label><button class="detail-btn" data-detail="${m.id}">历年数据与报考要求 →</button></div></article>`).join(''):`<div class="empty-state"><h3>没有找到相关专业</h3><p>${year===2025&&batch==='退役士兵批'?'尚未录入2025年退役士兵批资料，可切换2026年。':'试试输入更短的名称，如“护理”或“金融”，也可以调整筛选条件。'}</p><button class="quiet" id="emptyReset">重新查找</button></div>`;
  renderCategories();$('#compareCount').textContent=selected.size;
 }
 function reset(){browsing=false;visibleLimit=12;category='';$('#search').value='';$('#year').value='2026';$('#batch').value='普通批';$('#exam').value='';$('#sort').value='code';render()}
 ['year','batch','exam','sort'].forEach(s=>$('#'+s).addEventListener('change',()=>{visibleLimit=12;if(s==='exam')browsing=true;render()}));
 $('#search').addEventListener('input',()=>{visibleLimit=12;browsing=false;render()});$('#reset').addEventListener('click',reset);
 $('#searchForm').addEventListener('submit',e=>{e.preventDefault();if(!$('#search').value.trim()){toast('请输入专业名称，或点击“浏览全部专业”');$('#search').focus();return}visibleLimit=12;render();$('#search').blur();$('#resultSection').scrollIntoView({behavior:'smooth',block:'start'})});
 $$('[data-query]').forEach(b=>b.onclick=()=>{category='';$('#exam').value='';$('#search').value=b.dataset.query;browsing=false;visibleLimit=12;render()});
 $('#browseAll').onclick=()=>{$('#search').value='';browsing=true;visibleLimit=12;render()};
 $('#loadMore').onclick=()=>{visibleLimit+=12;render()};
 $('#categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;browsing=true;visibleLimit=12;render()}});
 $('#results').addEventListener('click',e=>{const d=e.target.closest('[data-detail]');if(d)detail(d.dataset.detail);if(e.target.id==='emptyReset')reset()});
 $('#results').addEventListener('change',e=>{const id=e.target.dataset.compare;if(!id)return;if(e.target.checked){if(selected.size>=3){e.target.checked=false;toast('最多选择3个专业进行对比');return}selected.add(id)}else selected.delete(id);$('#compareCount').textContent=selected.size});
 const dataRow=m=>`<tr><td>${m.year}<span class="small">${esc(m.batch)}</span></td><td>${esc(m.name)}</td><td>${val(m.plan)}</td><td>${val(m.filed)}</td><td>${val(m.admitted)}</td><td>${val(m.maxScore)}</td><td>${val(m.minScore)}</td><td>${val(m.bestRank)}</td><td>${val(m.worstRank)}</td></tr>`;
 const tableHead='<thead><tr><th>年份 / 批次</th><th>专业 / 方向</th><th>计划</th><th>投档人数</th><th>录取人数</th><th>最高分</th><th>最低分</th><th>最高排位</th><th>最低排位</th></tr></thead>';
 function historyCard(m){return `<article class="history-card"><h4>${m.year}年 · ${esc(m.batch)}</h4><p>${esc(m.name)}</p><dl>${[['招生计划',m.plan],['投档人数',m.filed],['录取人数',m.admitted],['最高分',m.maxScore],['最低分',m.minScore],['最高排位',m.bestRank],['最低排位',m.worstRank]].map(([k,v])=>`<div><dt>${k}</dt><dd>${val(v)}</dd></div>`).join('')}</dl></article>`}
 function sourceLink(id){const s=sources[id];return s?`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`:''}
 function detail(id){
  const m=D.records.find(x=>x.id===id);if(!m)return;currentId=id;
  const ordinary=D.records.find(x=>x.year===2026&&x.batch==='普通批'&&(x.name===m.name||x.baseName===m.baseName));
  const info=m.year===2026?m:ordinary;
  let history=D.records.filter(x=>x.baseName===m.baseName&&x.batch===m.batch);
  if(m.year===2026&&m.name!==m.baseName)history=history.filter(x=>x.year===2025||x.name===m.name);
  history.sort((a,b)=>b.year-a.year||String(a.code).localeCompare(String(b.code)));
  const music=m.baseName.startsWith('音乐'),historyNote=music?'2025年音乐专业按整体公布，2026年细分培养方向；两种口径不可直接同比。':'各年度计划、投档与录取分别保留，空白表示当前资料暂缺。';
  $('#detailContent').innerHTML=`<div class="detail-heading"><div><p class="eyebrow">${m.year} · ${esc(m.batch)}${m.code?' · 专业号 '+esc(m.code):''}</p><h2 id="detailTitle">${esc(m.name)}</h2><p>${esc(m.category)}${m.group?' · 专业组 '+esc(m.group):''}</p></div><div class="detail-actions"><button class="quiet" id="shareMajor">分享专业</button><button class="quiet" id="printMajor">打印</button></div></div><div class="detail-grid"><p><small>${m.year} 招生计划</small>${m.plan==null?'暂无数据':m.plan+'人'}</p><p><small>${m.year} ${m.year===2025?'录取人数':'投档人数'}</small>${(m.year===2025?m.admitted:m.filed)==null?'暂无数据':(m.year===2025?m.admitted:m.filed)+'人'}</p></div>${m.resultNote?`<p class="detail-remark">${esc(m.resultNote)}</p>`:''}<section class="detail-section"><h3>历年数据</h3><p class="muted">${historyNote}</p><div class="history-mobile">${history.map(historyCard).join('')}</div><div class="table-wrap history-desktop"><table>${tableHead}<tbody>${history.map(dataRow).join('')}</tbody></table></div><p class="muted">“—”表示尚未录入或原始表未提供，不代表0。最高排位为数字较小、最低排位为数字较大的一端。排位仅在对应年度、考试科目及公布口径内参考。</p></section>${info?`<details class="detail-section detail-fold"><summary>${info.year}年考试科目、报考限制与费用</summary>${m.year!==info.year?'<p class="detail-remark">以下为2026年资料，不能据此认定2025年或下一年度的要求。</p>':''}<div class="subject-list">${info.subjects.map(s=>`<span>${esc(s)}</span>`).join('')}</div><p><b>考试类型：</b>${esc(info.examType)}</p><p><b>前置专业限制：</b>${esc(info.requirements)}</p><div class="detail-grid"><p><small>学制</small>${info.duration}年</p><p><small>学费 / 住宿费（元·生·学年）</small>${info.tuition.toLocaleString()} / ${info.accommodation.toLocaleString()}</p></div>${info.books?`<p class="books"><b>参考书目：</b>${esc(info.books)}</p>`:''}<p class="muted">前置专业是否符合，须结合学校后续公告及招生办审核，系统不自动作出认定。</p><div class="source-links">${sourceLink(info.infoSource)}${sourceLink('prerequisite2026')}${info.outline?`<a href="${esc(info.outline)}" target="_blank" rel="noopener">该科目考试大纲 ↗</a>`:sourceLink('outline2026')}</div></details>`:''}<details class="detail-section detail-fold"><summary>查看数据来源</summary><div class="source-links">${[...new Set(history.flatMap(x=>[x.planSource,x.resultSource]))].filter(Boolean).map(sourceLink).join('')}</div><p class="muted">历史数据用于信息查询，不构成录取承诺。</p></details>`;
  showDialog($('#detailDialog'));$('#shareMajor').onclick=()=>share(m);$('#printMajor').onclick=()=>window.print();
 }
 function share(m){const u=new URL(location.href);u.search='';u.searchParams.set('major',m.id);u.hash='majors';$('#shareUrl').value=u.href;$('#copyStatus').textContent='';showDialog($('#shareDialog'))}
 $('#copyBtn').addEventListener('click',async()=>{const input=$('#shareUrl');try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(input.value)}else{input.focus();input.select();if(!document.execCommand('copy'))throw Error('copy')}$('#copyStatus').textContent='链接已复制，可粘贴到微信。'}catch{$('#copyStatus').textContent='请长按链接手动复制。';input.focus();input.select()}});
 $$('[data-close]').forEach(b=>b.onclick=()=>closeDialog(b.closest('dialog')));$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(d)}}));
 $('#compareBtn').onclick=()=>{if(selected.size<2){toast('请先选择2至3个专业');return}const records=[...selected].map(id=>D.records.find(x=>x.id===id));$('#compareContent').innerHTML=`<p>不同年份、批次、考试科目组的分数与排位不直接比较；请结合考试要求查看。</p><div class="table-wrap"><table>${tableHead}<tbody>${records.map(dataRow).join('')}</tbody></table></div><button class="quiet" id="clearCompare">清空对比</button>`;showDialog($('#compareDialog'));$('#clearCompare').onclick=()=>{selected.clear();closeDialog($('#compareDialog'));render()}};
 function download(content,name,type){const u=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
 $('#exportBtn').onclick=()=>{if(!shown.length){toast('当前没有可导出的结果');return}const keys=['year','batch','code','name','plan','filed','admitted','maxScore','minScore','bestRank','worstRank','examType'];const header=['年份','批次','专业号','专业名称','计划人数','投档人数','录取人数','最高分','最低分','最高排位','最低排位','考试类型'];const csv=[header,...shown.map(m=>keys.map(k=>m[k]??''))].map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');download('\ufeff'+csv,'珠科专升本-查询结果.csv','text/csv;charset=utf-8');toast('已生成CSV；微信如未触发下载，可在浏览器打开页面后导出。')};
 $('#presentBtn').onclick=()=>{const on=document.body.classList.toggle('presentation');$('#presentBtn').textContent=on?'退出展示':'展示模式'};
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
 function resources(type='all'){
  let items=D.sources.filter(s=>type==='all'||(type==='official'&&['学校官网','省考试院'].includes(s.type))||(type==='image'&&s.type==='原始图片'));
  if(type==='outline')items=[];
  const rendered=items.map(s=>`<article class="resource"><span class="file-icon">${s.type==='原始图片'?'IMG':'DOC'}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.type)} · ${esc(s.note)}</p><a href="${esc(s.url)}" target="_blank" rel="noopener">查看原始资料 ↗</a></div></article>`);
  if(type==='all'||type==='outline')D.outlines.forEach(o=>rendered.push(`<article class="resource"><span class="file-icon">${o.title.endsWith('.pdf')?'PDF':'WORD'}</span><div><h3>${esc(o.title.replace('2026年考试大纲-','').replace(/\.(docx|pdf)$/,''))}</h3><p>2026年校考大纲 · 学校官网原文件；微信内不能预览时可在浏览器打开。</p><a href="${esc(o.url)}" target="_blank" rel="noopener">打开大纲文件 ↗</a></div></article>`));
  $('#resourceList').innerHTML=rendered.join('');$$('[data-resource]').forEach(b=>b.classList.toggle('active',b.dataset.resource===type));
 }
 $$('[data-resource]').forEach(b=>b.onclick=()=>resources(b.dataset.resource));$('#methodNotes').innerHTML=D.notes.map(n=>`<li>${esc(n)}</li>`).join('');resources();render();
 const shared=new URLSearchParams(location.search).get('major');if(shared&&D.records.some(m=>m.id===shared)){const m=D.records.find(m=>m.id===shared);$('#year').value=m.year;$('#batch').value=m.batch;$('#search').value=m.name;render();detail(shared)}
})();
