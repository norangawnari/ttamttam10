// 땀땀 자수 작업대 — 오프라인 캐시
const V='ttam-2026-10-01-1', SHELL=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='ttam-fonts').map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url); if(e.request.method!=='GET') return;
  if(u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com'){
    // 웹 글꼴: 한 번 받은 글자는 저장해 두고 인터넷 없이도 사용
    e.respondWith(caches.open('ttam-fonts').then(async c=>{ const hit=await c.match(e.request);
      const net=fetch(e.request).then(r=>{ if(r.ok||r.type==='opaque') c.put(e.request,r.clone()); return r; }).catch(()=>hit);
      return hit||net; }));
    return;
  }
  if(u.origin===location.origin){
    // 앱 파일: 인터넷이 되면 새 버전, 안 되면 저장본
    e.respondWith(fetch(e.request).then(r=>{ if(r.ok){ const cp=r.clone(); caches.open(V).then(c=>c.put(e.request,cp)); } return r; })
      .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
  }
});
