(function(){
 'use strict';
 const params=new URLSearchParams(location.search),id=params.get('id'),major=params.get('major');
 const doc=window.ZCST_OUTLINES.find(d=>d.id===id),body=document.getElementById('outlineContent');
 if(major&&/^202[56]-(normal|veteran)-\d{1,3}$/.test(major)){
  const back=new URL('index.html',location.href);back.searchParams.set('major',major);back.searchParams.set('showRequirements','1');back.hash='majors';document.getElementById('backLink').href=back.href;
 }
 if(!doc){document.getElementById('outlineTitle').textContent='暂未找到这份大纲';document.getElementById('readerNote').hidden=true;body.textContent='请返回专业页面，重新点击“在线阅读考试大纲”。';return}
 document.title=doc.subject+'考试大纲 · 珠科专升本';document.getElementById('outlineTitle').textContent=doc.subject;
 // HTML is produced by build_outline_reader.py from retained official documents;
 // text is escaped, external relationships are not executed, and no user HTML is accepted.
 body.innerHTML=doc.html;
})();
