/* Read-only pairing and published-value differences; never infer missing values. */
(function(root){
 'use strict';
 function previous(records,current){
  if(current.year!==2026)return null;
  return records.find(r=>r.year===2025&&r.batch===current.batch&&r.name===current.name)
   ||records.find(r=>r.year===2025&&r.batch===current.batch&&r.baseName===current.baseName)||null;
 }
 function comparable(previous,current){return !!previous&&previous.batch===current.batch&&previous.name===current.name&&previous.examType===current.examType}
 function difference(before,after,allowed=true){
  if(!allowed||!Number.isFinite(before)||!Number.isFinite(after))return '—';
  const delta=after-before;return delta>0?'+'+delta:String(delta);
 }
 root.ZCST_COMPARE={previous,comparable,difference};
})(typeof window==='undefined'?globalThis:window);
