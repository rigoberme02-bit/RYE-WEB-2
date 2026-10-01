(() => {
  'use strict';
  const config = window.RYE_CONFIG || {};
  const hero = document.querySelector('.hero');
  const slides = [...document.querySelectorAll('[data-slide]')];
  const dots = [...document.querySelectorAll('[data-go]')];
  const play = document.querySelector('.play-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const requested = new URLSearchParams(location.search).get('slide');
  let current = requested !== null ? Number(requested) : Number(config.initialSlide || 0);
  if (!Number.isInteger(current) || current < 0 || current >= slides.length) current = 0;
  let paused = reduced.matches, timer = null, touchStart = null;
  const interval = Number(config.slideInterval) > 0 ? Number(config.slideInterval) : 4000;
  const dialogs = [...document.querySelectorAll('dialog')];
  const isDialogOpen = () => dialogs.some(d => d.open);
  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.classList.toggle('is-active', i === current); slide.setAttribute('aria-hidden', String(i !== current)); });
    dots.forEach((dot, i) => { dot.classList.toggle('is-active', i === current); dot.setAttribute('aria-pressed', String(i === current)); });
  }
  function schedule() {
    clearInterval(timer); timer = null;
    if (!paused && !document.hidden && !isDialogOpen()) timer = setInterval(() => show(current + 1), interval);
  }
  function updatePlay() {
    play.setAttribute('aria-label', paused ? 'Reanudar carrusel' : 'Pausar carrusel');
    play.innerHTML = paused ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 4 10 6-10 6Z" fill="currentColor"/></svg>' : '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 5v10M14 5v10" stroke="currentColor" stroke-width="2.5"/></svg>';
  }
  dots.forEach(dot => dot.addEventListener('click', () => { show(Number(dot.dataset.go)); schedule(); }));
  play.addEventListener('click', () => { paused = !paused; updatePlay(); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { if (reduced.matches) { paused = true; updatePlay(); schedule(); hero.style.removeProperty('--mx'); hero.style.removeProperty('--my'); } });
  const carousel = document.querySelector('.carousel');
  carousel.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); show(current + (e.key === 'ArrowRight' ? 1 : -1)); schedule(); dots[current].focus(); } });
  carousel.addEventListener('touchstart', e => { touchStart = { x:e.changedTouches[0].clientX, y:e.changedTouches[0].clientY }; }, {passive:true});
  carousel.addEventListener('touchend', e => { if (!touchStart) return; const dx=e.changedTouches[0].clientX-touchStart.x, dy=e.changedTouches[0].clientY-touchStart.y; if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)){show(current+(dx<0?1:-1));schedule();}touchStart=null; }, {passive:true});
  hero.addEventListener('pointermove', e => { if (reduced.matches || !finePointer.matches) return; const r=hero.getBoundingClientRect(); hero.style.setProperty('--mx', `${((e.clientX-r.left)/r.width-.5)*20}px`); hero.style.setProperty('--my', `${((e.clientY-r.top)/r.height-.5)*20}px`); }, {passive:true});
  hero.addEventListener('pointerleave', () => { hero.style.setProperty('--mx','0px');hero.style.setProperty('--my','0px'); });
  const menu = document.querySelector('.menu-toggle'), nav = document.querySelector('.navigation');
  function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');nav.classList.remove('is-open');}
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');nav.classList.toggle('is-open',open);});
  document.addEventListener('keydown', e=>{if(e.key==='Escape')closeMenu();});
  document.addEventListener('click', e=>{if(!nav.contains(e.target)&&!menu.contains(e.target))closeMenu();});
  const contact = document.querySelector('#contact-dialog'), about = document.querySelector('#about-dialog'), form = document.querySelector('#contact-form'), result = document.querySelector('#message-result'), status = document.querySelector('#form-status');
  let previousFocus = null;
  const number = String(config.whatsappNumber || '').replace(/\D/g,'');
  const hasWhatsApp = /^\d{8,15}$/.test(number);
  function openDialog(dialog){previousFocus=document.activeElement;dialogs.forEach(d=>{if(d.open)d.close();});closeMenu();dialog.showModal();document.body.style.overflow='hidden';schedule();}
  function openContact(service='Orientación general'){
    form.reset();form.elements.service.value=service;result.hidden=true;status.textContent='';
    document.querySelector('#contact-title').textContent=service==='Orientación general'?'Conversemos':service;
    document.querySelector('#contact-description').textContent=hasWhatsApp?'Cuéntanos qué necesitas. Continuaremos la conversación por WhatsApp.':'Cuéntanos qué necesitas y prepara tu consulta. Podrás copiar el mensaje; no se enviará automáticamente.';
    form.querySelector('[type=submit]').textContent=hasWhatsApp?'Continuar en WhatsApp':'Preparar mensaje';openDialog(contact);
  }
  document.querySelectorAll('[data-service]').forEach(b=>b.addEventListener('click',()=>openContact(b.dataset.service)));
  document.querySelectorAll('[data-contact]').forEach(b=>b.addEventListener('click',()=>openContact()));
  document.querySelector('[data-about]').addEventListener('click',()=>openDialog(about));
  dialogs.forEach(dialog=>{
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
    dialog.addEventListener('close',()=>{if(!isDialogOpen()){document.body.style.overflow='';if(previousFocus?.isConnected)previousFocus.focus();}schedule();});
  });
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;
    const data=new FormData(form);const text=`Hola, RYE. Soy ${String(data.get('name')).trim()}.\nMe interesa: ${data.get('service')}.\nMi contacto: ${String(data.get('contact')).trim()}.\n\n${String(data.get('message')).trim()}`;
    document.querySelector('#prepared-message').value=text;result.hidden=false;
    if(hasWhatsApp){window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');status.textContent='Se abrió WhatsApp. Revisa el mensaje y envíalo cuando esté listo.';}
    else {status.textContent='Mensaje preparado. Todavía no se ha enviado.';document.querySelector('#copy-message').focus();}
  });
  document.querySelector('#copy-message').addEventListener('click',async()=>{const field=document.querySelector('#prepared-message');try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(field.value);status.textContent='Mensaje copiado. Puedes pegarlo en tu conversación con RYE.';}catch{field.focus();field.select();status.textContent='Seleccionamos el mensaje: presiona Ctrl+C o mantén pulsado para copiarlo.';}});
  window.addEventListener('pagehide',()=>clearInterval(timer));
  window.addEventListener('pageshow',schedule);
  show(current);updatePlay();schedule();
})();
