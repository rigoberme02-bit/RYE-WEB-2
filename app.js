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
    if (!play) return;
    play.setAttribute('aria-label', paused ? 'Reanudar carrusel' : 'Pausar carrusel');
    play.innerHTML = paused ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m6 4 10 6-10 6Z" fill="currentColor"/></svg>' : '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 5v10M14 5v10" stroke="currentColor" stroke-width="2.5"/></svg>';
  }
  dots.forEach(dot => dot.addEventListener('click', () => { show(Number(dot.dataset.go)); schedule(); }));
  if (play) play.addEventListener('click', () => { paused = !paused; updatePlay(); schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { if (reduced.matches) { paused = true; updatePlay(); schedule(); hero.style.removeProperty('--mx'); hero.style.removeProperty('--my'); } });
  const carousel = document.querySelector('.carousel');
  carousel.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); show(current + (e.key === 'ArrowRight' ? 1 : -1)); schedule(); if (dots[current]) dots[current].focus(); } });
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
  const rawNumber = String(config.whatsappNumber || '593993046031').replace(/\D/g,'');
  const number = rawNumber.startsWith('0') ? '593' + rawNumber.slice(1) : rawNumber;
  const hasWhatsApp = /^\d{8,15}$/.test(number);
  document.querySelectorAll('a.whatsapp, a.whatsapp-banner').forEach(link => {
    if (hasWhatsApp) link.href = `https://wa.me/${number}`;
  });
  function openDialog(dialog){previousFocus=document.activeElement;dialogs.forEach(d=>{if(d.open)d.close();});closeMenu();dialog.showModal();document.body.style.overflow='hidden';schedule();}
  function openContact(service='Orientación general'){
    form.reset();form.elements.service.value=service;result.hidden=true;status.textContent='';
    document.querySelector('#contact-title').textContent=service==='Orientación general'?'Conversemos':service;
    document.querySelector('#contact-description').textContent=hasWhatsApp?'Cuéntanos qué necesitas. Continuaremos la conversación por WhatsApp.':'Cuéntanos qué necesitas y prepara tu consulta. Podrás copiar el mensaje; no se enviará automáticamente.';
    form.querySelector('[type=submit]').textContent=hasWhatsApp?'Continuar en WhatsApp':'Preparar mensaje';openDialog(contact);
  }

  // Controlador de Subpágina de Evaluaciones
  const evalModal = document.querySelector('#eval-subpage-modal');
  const openEvalBtn = document.querySelector('#open-eval-subpage');
  const evalHeroCard = document.querySelector('#eval-hero-card');
  const evalCloseBtns = document.querySelectorAll('[data-close-eval]');

  function openEvalSubpage() {
    if (!evalModal) return;
    previousFocus = document.activeElement;
    closeMenu();
    dialogs.forEach(d => { if (d.open) d.close(); });
    if (terapiasModal && !terapiasModal.hasAttribute('hidden')) closeTerapiasSubpage(true);
    evalModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    const backBtn = evalModal.querySelector('#close-eval-subpage');
    if (backBtn) backBtn.focus();
    if (location.hash !== '#evaluaciones-detalle') {
      try { history.pushState({ modal: 'evaluaciones' }, '', '#evaluaciones-detalle'); } catch (_) {}
    }
    setTimeout(() => {
      evalModal.querySelectorAll('.eval-service-card').forEach(c => c.classList.add('is-revealed'));
    }, 120);
  }

  function closeEvalSubpage(fromHistory = false) {
    if (!evalModal || evalModal.hasAttribute('hidden')) return;
    evalModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (previousFocus && previousFocus.isConnected) {
      previousFocus.focus();
    } else if (openEvalBtn) {
      openEvalBtn.focus();
    }
    if (!fromHistory && location.hash === '#evaluaciones-detalle') {
      try { history.pushState('', document.title, window.location.pathname + window.location.search); } catch (_) {}
    }
  }

  if (openEvalBtn) {
    openEvalBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEvalSubpage();
    });
  }

  if (evalHeroCard) {
    evalHeroCard.addEventListener('click', (e) => {
      if (!e.target.closest('button') && !e.target.closest('a')) {
        openEvalSubpage();
      }
    });

    evalHeroCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!e.target.closest('button') && !e.target.closest('a')) {
          e.preventDefault();
          openEvalSubpage();
        }
      }
    });

    // Efecto 3D Parallax con seguimiento del cursor
    evalHeroCard.addEventListener('pointermove', (e) => {
      if (reduced.matches || !finePointer.matches) return;
      const rect = evalHeroCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      evalHeroCard.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      evalHeroCard.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      const tiltX = (0.5 - y) * 4.5;
      const tiltY = (x - 0.5) * 5.5;
      evalHeroCard.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;
    }, { passive: true });

    evalHeroCard.addEventListener('pointerleave', () => {
      evalHeroCard.style.transform = '';
    });
  }

  evalCloseBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeEvalSubpage();
    });
  });

  // Controlador de Subpágina de Terapias
  const terapiasModal = document.querySelector('#terapias-subpage-modal');
  const openTerapiasBtn = document.querySelector('#open-terapias-subpage');
  const terapiasHeroCard = document.querySelector('#terapias-hero-card');
  const terapiasCloseBtns = document.querySelectorAll('[data-close-terapias]');

  function openTerapiasSubpage() {
    if (!terapiasModal) return;
    previousFocus = document.activeElement;
    closeMenu();
    dialogs.forEach(d => { if (d.open) d.close(); });
    if (evalModal && !evalModal.hasAttribute('hidden')) closeEvalSubpage(true);
    terapiasModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    const backBtn = terapiasModal.querySelector('#close-terapias-subpage');
    if (backBtn) backBtn.focus();
    if (location.hash !== '#terapias-detalle') {
      try { history.pushState({ modal: 'terapias' }, '', '#terapias-detalle'); } catch (_) {}
    }
    setTimeout(() => {
      terapiasModal.querySelectorAll('.terapia-service-card').forEach(c => c.classList.add('is-revealed'));
    }, 120);
  }

  function closeTerapiasSubpage(fromHistory = false) {
    if (!terapiasModal || terapiasModal.hasAttribute('hidden')) return;
    terapiasModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (previousFocus && previousFocus.isConnected) {
      previousFocus.focus();
    } else if (openTerapiasBtn) {
      openTerapiasBtn.focus();
    }
    if (!fromHistory && location.hash === '#terapias-detalle') {
      try { history.pushState('', document.title, window.location.pathname + window.location.search); } catch (_) {}
    }
  }

  if (openTerapiasBtn) {
    openTerapiasBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openTerapiasSubpage();
    });
  }

  if (terapiasHeroCard) {
    terapiasHeroCard.addEventListener('click', (e) => {
      if (!e.target.closest('button') && !e.target.closest('a')) {
        openTerapiasSubpage();
      }
    });

    terapiasHeroCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!e.target.closest('button') && !e.target.closest('a')) {
          e.preventDefault();
          openTerapiasSubpage();
        }
      }
    });

    terapiasHeroCard.addEventListener('pointermove', (e) => {
      if (reduced.matches || !finePointer.matches) return;
      const rect = terapiasHeroCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      terapiasHeroCard.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      terapiasHeroCard.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      const tiltX = (0.5 - y) * 4.5;
      const tiltY = (x - 0.5) * 5.5;
      terapiasHeroCard.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;
    }, { passive: true });

    terapiasHeroCard.addEventListener('pointerleave', () => {
      terapiasHeroCard.style.transform = '';
    });
  }

  terapiasCloseBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTerapiasSubpage();
    });
  });

  // Controlador de Subpágina de Talleres
  const talleresModal = document.querySelector('#talleres-subpage-modal');
  const openTalleresBtnAlt = document.querySelector('#open-talleres-subpage-alt');
  const btnTallerEstudio = document.querySelector('#btn-taller-estudio');
  const btnTallerEmocional = document.querySelector('#btn-taller-emocional');
  const talleresHeroCard = document.querySelector('#talleres-hero-card');
  const talleresCloseBtns = document.querySelectorAll('[data-close-talleres]');

  function openTalleresSubpage(preferred = 'estudio') {
    if (!talleresModal) return;
    previousFocus = document.activeElement;
    closeMenu();
    dialogs.forEach(d => { if (d.open) d.close(); });
    if (evalModal && !evalModal.hasAttribute('hidden')) closeEvalSubpage(true);
    if (terapiasModal && !terapiasModal.hasAttribute('hidden')) closeTerapiasSubpage(true);

    const cardsContainer = document.querySelector('#talleres-cards-container');
    const cardEstudio = document.querySelector('#taller-card-estudio');
    const cardEmocional = document.querySelector('#taller-card-emocional');

    if (cardsContainer && cardEstudio && cardEmocional) {
      cardEstudio.classList.remove('taller-highlighted-card');
      cardEmocional.classList.remove('taller-highlighted-card');

      if (preferred === 'emocional') {
        cardsContainer.insertBefore(cardEmocional, cardEstudio);
        cardEmocional.classList.add('taller-highlighted-card');
      } else {
        cardsContainer.insertBefore(cardEstudio, cardEmocional);
        cardEstudio.classList.add('taller-highlighted-card');
      }
    }

    talleresModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    // Asegurar que el modal inicie al principio del contenido
    talleresModal.scrollTop = 0;
    const sheet = talleresModal.querySelector('.talleres-subpage-sheet');
    if (sheet && typeof sheet.scrollTop !== 'undefined') {
      sheet.scrollTop = 0;
    }

    const backBtn = talleresModal.querySelector('#close-talleres-subpage');
    if (backBtn) backBtn.focus();

    const targetHash = preferred === 'emocional' ? '#talleres-emocional' : '#talleres-estudio';
    if (location.hash !== targetHash) {
      try { history.pushState({ modal: 'talleres', preferred }, '', targetHash); } catch (_) {}
    }

    setTimeout(() => {
      talleresModal.querySelectorAll('.taller-service-card').forEach(c => c.classList.add('is-revealed'));
    }, 100);
  }

  function closeTalleresSubpage(fromHistory = false) {
    if (!talleresModal || talleresModal.hasAttribute('hidden')) return;
    talleresModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (previousFocus && previousFocus.isConnected) {
      previousFocus.focus();
    } else if (openTalleresBtnAlt) {
      openTalleresBtnAlt.focus();
    }
    if (!fromHistory && (location.hash === '#talleres-detalle' || location.hash === '#talleres-estudio' || location.hash === '#talleres-emocional')) {
      try { history.pushState('', document.title, window.location.pathname + window.location.search); } catch (_) {}
    }
  }

  if (btnTallerEstudio) {
    btnTallerEstudio.addEventListener('click', (e) => {
      e.stopPropagation();
      openTalleresSubpage('estudio');
    });
  }

  if (btnTallerEmocional) {
    btnTallerEmocional.addEventListener('click', (e) => {
      e.stopPropagation();
      openTalleresSubpage('emocional');
    });
  }

  if (openTalleresBtnAlt) {
    openTalleresBtnAlt.addEventListener('click', (e) => {
      e.stopPropagation();
      openTalleresSubpage('estudio');
    });
  }

  if (talleresHeroCard) {
    talleresHeroCard.addEventListener('click', (e) => {
      if (!e.target.closest('button') && !e.target.closest('a')) {
        openTalleresSubpage('estudio');
      }
    });

    talleresHeroCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (!e.target.closest('button') && !e.target.closest('a')) {
          e.preventDefault();
          openTalleresSubpage('estudio');
        }
      }
    });

    talleresHeroCard.addEventListener('pointermove', (e) => {
      if (reduced.matches || !finePointer.matches) return;
      const rect = talleresHeroCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      talleresHeroCard.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      talleresHeroCard.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      const tiltX = (0.5 - y) * 4.5;
      const tiltY = (x - 0.5) * 5.5;
      talleresHeroCard.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-4px)`;
    }, { passive: true });

    talleresHeroCard.addEventListener('pointerleave', () => {
      talleresHeroCard.style.transform = '';
    });
  }

  talleresCloseBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTalleresSubpage();
    });
  });

  // Controlador de Subpágina de Servicios
  const serviciosModal = document.querySelector('#servicios-subpage-modal');
  const serviciosCloseBtns = document.querySelectorAll('[data-close-servicio]');
  const servicioModalBadgeText = document.querySelector('#servicio-modal-badge-text');
  const servicioTabPills = document.querySelectorAll('.servicio-tab-pill');
  const servicioPanels = document.querySelectorAll('.servicio-subpage-panel');

  const servicioBadgeTitles = {
    'tomatis': 'MÉTODO TOMATIS® · RYE',
    'vocacional': 'ORIENTACIÓN VOCACIONAL · RYE',
    'familiar': 'ASESORAMIENTO FAMILIAR · RYE',
    'capacitaciones': 'CAPACITACIONES INSTITUCIONALES · RYE',
    'ocupacional': 'TERAPIA OCUPACIONAL · RYE'
  };

  function openServicioSubpage(serviceKey = 'tomatis') {
    if (!serviciosModal) return;
    previousFocus = document.activeElement;
    closeMenu();
    dialogs.forEach(d => { if (d.open) d.close(); });
    if (evalModal && !evalModal.hasAttribute('hidden')) closeEvalSubpage(true);
    if (terapiasModal && !terapiasModal.hasAttribute('hidden')) closeTerapiasSubpage(true);
    if (talleresModal && !talleresModal.hasAttribute('hidden')) closeTalleresSubpage(true);

    // Ocultar todos los paneles y activar únicamente el servicio solicitado
    servicioPanels.forEach(panel => {
      panel.hidden = true;
      panel.classList.remove('is-active-panel');
    });

    const targetPanel = serviciosModal.querySelector(`#panel-servicio-${serviceKey}`);
    if (targetPanel) {
      targetPanel.hidden = false;
      targetPanel.classList.add('is-active-panel');
    } else if (servicioPanels.length > 0) {
      servicioPanels[0].hidden = false;
      servicioPanels[0].classList.add('is-active-panel');
    }

    // Actualizar tabs activas
    servicioTabPills.forEach(pill => {
      const isCurrent = pill.dataset.tabService === serviceKey;
      pill.classList.toggle('is-active', isCurrent);
      pill.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
    });

    if (servicioModalBadgeText && servicioBadgeTitles[serviceKey]) {
      servicioModalBadgeText.textContent = servicioBadgeTitles[serviceKey];
    } else if (servicioModalBadgeText) {
      servicioModalBadgeText.textContent = 'SERVICIOS · RYE';
    }

    serviciosModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    serviciosModal.scrollTop = 0;
    const sheet = serviciosModal.querySelector('.servicios-subpage-sheet');
    if (sheet && typeof sheet.scrollTop !== 'undefined') {
      sheet.scrollTop = 0;
    }

    const backBtn = serviciosModal.querySelector('#close-servicio-subpage');
    if (backBtn) backBtn.focus();

    const targetHash = `#servicio-${serviceKey}`;
    if (location.hash !== targetHash) {
      try { history.pushState({ modal: 'servicios', serviceKey }, '', targetHash); } catch (_) {}
    }
  }

  function closeServicioSubpage(fromHistory = false) {
    if (!serviciosModal || serviciosModal.hasAttribute('hidden')) return;
    serviciosModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (previousFocus && previousFocus.isConnected) {
      previousFocus.focus();
    }
    const currentHash = location.hash;
    if (!fromHistory && (currentHash.startsWith('#servicio-') || currentHash === '#servicios-detalle')) {
      try { history.pushState('', document.title, window.location.pathname + window.location.search); } catch (_) {}
    }
    if (typeof ScrollTrigger !== 'undefined') {
      setTimeout(() => ScrollTrigger.refresh(), 80);
    }
  }

  serviciosCloseBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeServicioSubpage();
    });
  });

  servicioTabPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const key = pill.dataset.tabService;
      if (key) {
        openServicioSubpage(key);
      }
    });
  });

  window.addEventListener('popstate', () => {
    if (location.hash === '#evaluaciones-detalle') {
      openEvalSubpage();
    } else if (location.hash === '#terapias-detalle') {
      openTerapiasSubpage();
    } else if (location.hash === '#talleres-emocional') {
      openTalleresSubpage('emocional');
    } else if (location.hash === '#talleres-estudio' || location.hash === '#talleres-detalle') {
      openTalleresSubpage('estudio');
    } else if (location.hash.startsWith('#servicio-')) {
      const key = location.hash.replace('#servicio-', '');
      openServicioSubpage(key);
    } else {
      closeEvalSubpage(true);
      closeTerapiasSubpage(true);
      closeTalleresSubpage(true);
      closeServicioSubpage(true);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEvalSubpage();
      closeTerapiasSubpage();
      closeTalleresSubpage();
      closeServicioSubpage();
    }
  });

  if (location.hash === '#evaluaciones-detalle') {
    openEvalSubpage();
  } else if (location.hash === '#terapias-detalle') {
    openTerapiasSubpage();
  } else if (location.hash === '#talleres-emocional') {
    openTalleresSubpage('emocional');
  } else if (location.hash === '#talleres-estudio' || location.hash === '#talleres-detalle') {
    openTalleresSubpage('estudio');
  } else if (location.hash.startsWith('#servicio-')) {
    const key = location.hash.replace('#servicio-', '');
    openServicioSubpage(key);
  }

  document.querySelectorAll('[data-service]').forEach(b => {
    if (b.dataset.service === 'Evaluaciones') {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
        const targetSec = document.querySelector('#evaluaciones');
        if (targetSec) {
          targetSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (evalHeroCard) evalHeroCard.focus();
        } else {
          openEvalSubpage();
        }
      });
    } else if (b.dataset.service === 'Terapias') {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
        const targetSec = document.querySelector('#terapias');
        if (targetSec) {
          targetSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (terapiasHeroCard) terapiasHeroCard.focus();
        } else {
          openTerapiasSubpage();
        }
      });
    } else if (b.dataset.service === 'Talleres') {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
        const targetSec = document.querySelector('#talleres');
        if (targetSec) {
          targetSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
          if (talleresHeroCard) talleresHeroCard.focus();
        } else {
          openTalleresSubpage();
        }
      });
    } else if (b.dataset.service === 'Servicios') {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        closeMenu();
        const targetSec = document.querySelector('#servicios');
        if (targetSec) {
          targetSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    } else {
      b.addEventListener('click', () => openContact(b.dataset.service));
    }
  });
  document.querySelectorAll('[data-contact]').forEach(b=>b.addEventListener('click',()=>openContact()));
  const aboutBtn = document.querySelector('[data-about]');
  if (aboutBtn) {
    aboutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu();
      const sec = document.querySelector('#nosotros');
      if (sec) {
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        openDialog(about);
      }
    });
  }
  const backToTop = document.querySelector('.footer-back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  dialogs.forEach(dialog=>{
    dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
    dialog.addEventListener('close',()=>{if(!isDialogOpen()){document.body.style.overflow='';if(previousFocus?.isConnected)previousFocus.focus();}schedule();});
  });
  form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;
    const data=new FormData(form);const text=`Hola, RYE. Soy ${String(data.get('name')).trim()}.\nMe interesa: ${data.get('service')}.\nMi contacto: ${String(data.get('contact')).trim()}.\n\n${String(data.get('message')).trim()}`;
    document.querySelector('#prepared-message').value=text;result.hidden=false;
    if(hasWhatsApp){
      try {
        const win = window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`,'_blank','noopener,noreferrer');
        if (!win) {
          status.textContent='Mensaje preparado. Puedes copiarlo abajo para enviarlo por WhatsApp.';
        } else {
          status.textContent='Se abrió WhatsApp. Revisa el mensaje y envíalo cuando esté listo.';
        }
      } catch (err) {
        status.textContent='Mensaje preparado. Copia el texto abajo para enviarlo.';
      }
    }
    else {status.textContent='Mensaje preparado. Todavía no se ha enviado.';document.querySelector('#copy-message').focus();}
  });
  document.querySelector('#copy-message').addEventListener('click',async()=>{const field=document.querySelector('#prepared-message');try{if(!navigator.clipboard)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(field.value);status.textContent='Mensaje copiado. Puedes pegarlo en tu conversación con RYE.';}catch{field.focus();field.select();status.textContent='Seleccionamos el mensaje: presiona Ctrl+C o mantén pulsado para copiarlo.';}});
  window.addEventListener('pagehide',()=>clearInterval(timer));
  window.addEventListener('pageshow',schedule);

  // Sistema de Scroll Reveal y Zoom dinámico para teléfonos y pantallas táctiles
  function setupScrollEffects() {
    if (reduced.matches) return;

    // Efecto de Zoom dinámico al scrollear (óptimo para teléfonos y pantallas táctiles)
    let scrollTicking = false;
    const heroCards = [
      document.querySelector('#eval-hero-card'),
      document.querySelector('#terapias-hero-card'),
      document.querySelector('#talleres-hero-card')
    ].filter(Boolean);

    function handleScrollZoom() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      heroCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < vh) {
          const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
          const zoom = 1 + progress * 0.065;
          card.style.setProperty('--scroll-zoom', zoom.toFixed(3));
          card.classList.add('is-in-view');
        }
      });
      scrollTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(handleScrollZoom);
        scrollTicking = true;
      }
    }, { passive: true });
    window.addEventListener('resize', () => {
      if (!scrollTicking) {
        requestAnimationFrame(handleScrollZoom);
        scrollTicking = true;
      }
    }, { passive: true });
    handleScrollZoom();

    // Elementos de la página principal al scrollear
    const mainTargets = [
      document.querySelector('.evaluaciones-section'),
      document.querySelector('#eval-hero-card'),
      document.querySelector('.terapias-section'),
      document.querySelector('#terapias-hero-card'),
      document.querySelector('.talleres-section'),
      document.querySelector('#talleres-hero-card'),
      ...document.querySelectorAll('.servicio-detail-card'),
      document.querySelector('.servicios-help-card')
    ].filter(Boolean);

    mainTargets.forEach(el => el.classList.add('eval-reveal-ready'));

    const mainObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    mainTargets.forEach(el => mainObserver.observe(el));

    // Elementos dentro de las subpáginas modales al scrollear
    [
      document.querySelector('#eval-subpage-modal'),
      document.querySelector('#terapias-subpage-modal'),
      document.querySelector('#talleres-subpage-modal')
    ].filter(Boolean).forEach(modal => {
      const subTargets = modal.querySelectorAll(
        '.eval-service-card, .terapia-service-card, .taller-service-card, .eval-when-section, .terapia-when-section, .taller-why-section, .eval-when-item, .eval-process-section, .eval-step-item, .eval-cta-card'
      );
      subTargets.forEach(el => el.classList.add('eval-reveal-ready'));

      const subObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      }, {
        root: modal,
        threshold: 0.08,
        rootMargin: '0px 0px -20px 0px'
      });

      subTargets.forEach(el => subObserver.observe(el));
    });
  }
  setupScrollEffects();

  const brand = document.querySelector('.brand');
  if (brand) {
    brand.addEventListener('click', (e) => {
      e.preventDefault();
      closeMenu();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // =========================================================================
  // TRANSICIÓN ANIMADA DE LA HERO SECTION (GSAP + SCROLLTRIGGER)
  // =========================================================================
  function initHeroScrollTransition() {
    const heroEl = document.querySelector('.hero');
    const statement = document.querySelector('#hero-brand-statement');
    const carouselEl = document.querySelector('.carousel');

    if (!heroEl || !statement || !carouselEl) return;

    if (reduced.matches) {
      return;
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP o ScrollTrigger no se encuentran cargados para la hero.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Activamos la clase que prepara los estilos superpuestos
    heroEl.classList.add('hero-transition-ready');

    const heroElements = [
      document.querySelector('.hero > .eyebrow'),
      document.querySelector('.hero > #hero-title'),
      document.querySelector('.hero > .description'),
      document.querySelector('.hero-disorders-tags'),
      ...document.querySelectorAll('.hero-disorders-tags .disorder-pill'),
      document.querySelector('.hero > .whatsapp-banner'),
      document.querySelector('.hero > .experience')
    ].filter(Boolean);

    const atmosphereEl = document.querySelector('.atmosphere');

    const mm = gsap.matchMedia();

    // 1. COMPUTADORA (Pantallas de 1024px o más)
    mm.add('(min-width: 1024px)', () => {
      gsap.set(statement, { opacity: 0, y: 30, visibility: 'hidden' });
      gsap.set([carouselEl, ...heroElements], { x: 0, y: 0, opacity: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'heroTransitionDesktop',
          trigger: heroEl,
          start: 'top top',
          end: () => '+=' + (window.innerHeight * 1.5),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (self.progress > 0.05) {
              clearInterval(timer);
            } else if (self.progress <= 0.05 && !paused) {
              schedule();
            }
          }
        }
      });

      const getExitDistance = () => carouselEl.offsetLeft + carouselEl.offsetWidth + 80;

      // 0 - 10%: La hero permanece completa mientras empieza el recorrido
      tl.to({}, { duration: 10 }, 0);

      // 10 - 50%: La imagen sale hacia la izquierda y los textos/botones desaparecen
      tl.to(carouselEl, {
        x: () => -getExitDistance(),
        duration: 40,
        ease: 'power1.inOut'
      }, 10);

      // La imagen conserva opacidad durante gran parte del recorrido y desvanece suavemente al final
      tl.to(carouselEl, {
        opacity: 0,
        duration: 14,
        ease: 'power1.in'
      }, 36);

      // Los textos y botones se desplazan ligeramente hacia la izquierda mientras pierden opacidad
      tl.to(heroElements, {
        x: -70,
        opacity: 0,
        duration: 32,
        ease: 'power1.inOut'
      }, 10);
      tl.set(heroElements, { visibility: 'hidden', pointerEvents: 'none' }, 42);

      if (atmosphereEl) {
        tl.to(atmosphereEl, {
          opacity: 0.35,
          duration: 32,
          ease: 'power1.inOut'
        }, 10);
      }

      // 40 - 65%: Aparece la frase centrada desde abajo (con opacidad progresiva y leve desplazamiento)
      tl.set(statement, { visibility: 'visible' }, 40);
      tl.fromTo(statement, {
        opacity: 0,
        y: 28
      }, {
        opacity: 1,
        y: 0,
        duration: 25,
        ease: 'power2.out'
      }, 40);

      // 65 - 100%: La frase permanece completamente visible y estable para leerla
      tl.to({}, { duration: 35 }, 65);

      return () => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
        gsap.set([statement, carouselEl, ...heroElements, atmosphereEl], { clearProps: 'all' });
      };
    });

    // 2. TELÉFONO Y TABLET (Pantallas de menos de 1024px)
    mm.add('(max-width: 1023px)', () => {
      const headerEl = document.querySelector('.header');
      const whiteOverlay = document.querySelector('.carousel-white-overlay');
      const phraseText = document.querySelector('.hero-statement-phrase');
      const statementBar = document.querySelector('.statement-bar');
      const carouselBadges = [
        document.querySelector('.carousel-location'),
        document.querySelector('.experience-mobile')
      ].filter(Boolean);

      gsap.set(statement, { opacity: 0, visibility: 'hidden' });
      if (phraseText) gsap.set(phraseText, { opacity: 0, y: 16, scale: 0.94, filter: 'blur(8px)' });
      if (statementBar) gsap.set(statementBar, { scaleX: 0, opacity: 0 });
      gsap.set([carouselEl, ...heroElements], { x: 0, y: 0, opacity: 1, scale: 1 });
      if (headerEl) gsap.set(headerEl, { opacity: 1, y: 0 });
      if (whiteOverlay) gsap.set(whiteOverlay, { opacity: 0 });
      if (carouselBadges.length) gsap.set(carouselBadges, { opacity: 1, y: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'heroTransitionMobile',
          trigger: heroEl,
          start: 'top top',
          end: () => '+=' + (window.innerHeight * 2.2), // Movimiento pausado y elegante
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (self.progress > 0.05) {
              clearInterval(timer);
            } else if (self.progress <= 0.05 && !paused) {
              schedule();
            }
          }
        }
      });

      // Distancia y escala para que la imagen suba y ocupe toda la pantalla
      const getMoveY = () => carouselEl.offsetTop;
      const getScale = () => Math.max(1, window.innerHeight / carouselEl.offsetHeight);

      // 0 - 2%: Inicio normal
      tl.to({}, { duration: 2 }, 0);

      // 2 - 18%: Los textos superiores (título, descripción de evaluaciones/terapias y whatsapp)
      // se retiran tempranamente hacia arriba para salir completamente con la hero
      tl.to(heroElements, {
        y: -45,
        opacity: 0,
        duration: 16,
        ease: 'power2.inOut'
      }, 2);
      tl.set(heroElements, { visibility: 'hidden', pointerEvents: 'none' }, 18);

      // Los distintivos del carrusel se desvanecen
      if (carouselBadges.length) {
        tl.to(carouselBadges, {
          opacity: 0,
          y: 15,
          duration: 15,
          ease: 'power1.inOut'
        }, 3);
      }

      // 4 - 38%: La imagen se expande y asciende suavemente hasta cubrir el 100% de la pantalla
      tl.to(carouselEl, {
        y: () => -getMoveY(),
        scale: () => getScale(),
        transformOrigin: 'top center',
        duration: 34,
        ease: 'power1.inOut'
      }, 4);

      // Cuando la imagen ocupa toda la pantalla, se oculta el logo y el menú
      if (headerEl) {
        tl.to(headerEl, {
          opacity: 0,
          y: -22,
          duration: 16,
          ease: 'power1.inOut'
        }, 20);
      }

      // 28 - 48%: La imagen se opaca suavemente en tono blanco luminoso (sin desaparecer)
      if (whiteOverlay) {
        tl.to(whiteOverlay, {
          opacity: 0.74,
          duration: 20,
          ease: 'power1.inOut'
        }, 28);
      }

      if (atmosphereEl) {
        tl.to(atmosphereEl, {
          opacity: 0.2,
          duration: 20,
          ease: 'power1.inOut'
        }, 4);
      }

      // 38 - 56%: Entrada con efecto cinemático de la frase justo en el medio de la pantalla
      tl.set(statement, { visibility: 'visible', opacity: 1 }, 38);
      if (phraseText) {
        tl.to(phraseText, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 18,
          ease: 'power2.out'
        }, 38);
      }

      if (statementBar) {
        tl.to(statementBar, {
          scaleX: 1,
          opacity: 1,
          duration: 14,
          ease: 'back.out(1.5)'
        }, 43);
      }

      // 56 - 100%: La frase permanece fija y estable en el centro exacto hasta que termine la animación
      tl.to({}, { duration: 44 }, 56);

      return () => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
        gsap.set([statement, phraseText, statementBar, carouselEl, ...heroElements, headerEl, whiteOverlay, ...carouselBadges, atmosphereEl], { clearProps: 'all' });
      };
    });

    return () => {
      mm.revert();
    };
  }
  const cleanupHeroTransition = initHeroScrollTransition();

  // =========================================================================
  // CONTROLADOR DEL SCROLL HORIZONTAL DE SERVICIOS (STICKY NATIVO FLUIDO SIN SALTOS)
  // =========================================================================
  function initServiciosCarousel() {
    const section = document.querySelector('.servicios-section');
    const stickyWrap = document.querySelector('.servicios-sticky-wrap');
    const track = document.querySelector('#servicios-carousel-track');
    const viewport = document.querySelector('#servicios-carousel-viewport');
    const cards = Array.from(document.querySelectorAll('.servicios-card'));
    const dots = Array.from(document.querySelectorAll('#servicios-carousel-dots .carousel-dot'));

    if (!section || !stickyWrap || !track || !viewport || !cards.length) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP o ScrollTrigger no se encuentran cargados.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Si el usuario prefiere movimiento reducido
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Calcula el recorrido con el ancho real de la fila menos el ancho visible,
    // garantizando que termine mostrando completamente la última tarjeta.
    function getScrollAmount() {
      const lastCard = cards[cards.length - 1];
      if (!lastCard || !viewport) return 0;
      const trackStyle = window.getComputedStyle(track);
      const paddingRight = parseFloat(trackStyle.paddingRight) || 36;
      // Ancho real total desde el inicio del track hasta el borde derecho de la última tarjeta con su padding
      const totalRowWidth = lastCard.offsetLeft + lastCard.offsetWidth + paddingRight;
      const visibleWidth = viewport.clientWidth;
      return Math.max(0, totalRowWidth - visibleWidth);
    }

    function updateSectionHeight() {
      const scrollDist = getScrollAmount();
      const isMobile = window.innerWidth <= 768;

      if (isMobile) {
        // En teléfono (móvil): exactamente la fórmula que ya está lista y aprobada por el usuario
        section.style.height = `${window.innerHeight + scrollDist}px`;
      } else {
        // En computadora (escritorio): otorgamos un recorrido vertical cinematográfico y amplio
        // para que las cartillas rueden de forma visible y continua a lo largo del scroll normal
        const desktopTravel = Math.max(window.innerHeight * 1.8, scrollDist * 2.2);
        section.style.height = `${window.innerHeight + desktopTravel}px`;
      }
    }

    let activeIndex = 0;
    function updateIndicators(progress) {
      const totalCards = cards.length;
      if (!totalCards || !viewport) return;
      const clamped = Math.max(0, Math.min(1, progress));
      const maxScroll = getScrollAmount();
      const currentTrackX = clamped * maxScroll;

      // Determinamos qué tarjeta se encuentra más centrada en el viewport
      const viewportCenter = currentTrackX + viewport.clientWidth / 2;
      let closestIdx = 0;
      let minDiff = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const diff = Math.abs(cardCenter - viewportCenter);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      });

      if (closestIdx !== activeIndex) {
        activeIndex = closestIdx;
        cards.forEach((card, i) => {
          card.classList.toggle('is-active-card', i === activeIndex);
        });
        dots.forEach((dot, i) => {
          const isActive = i === activeIndex;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
      }
    }

    // Calculamos la altura exacta inicial
    updateSectionHeight();

    // ScrollTrigger anima el desplazamiento horizontal entre el top y el bottom de la sección.
    // Al usar sticky nativo en CSS sin pin dinámico, se eliminan completamente el salto hacia arriba,
    // el bloqueo brusco y los huecos en blanco.
    const horizontalTween = gsap.to(track, {
      x: () => -getScrollAmount(),
      ease: 'none',
      scrollTrigger: {
        id: 'serviciosHorizontal',
        trigger: section,
        pin: false,
        start: 'top top',
        end: 'bottom bottom',
        scrub: window.innerWidth <= 768 ? 0.6 : 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          updateIndicators(self.progress);
        }
      }
    });

    // Navegación mediante clic en puntos indicadores inferiores
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        const st = horizontalTween.scrollTrigger;
        if (!st) return;
        const maxScroll = getScrollAmount();
        if (maxScroll <= 0) return;
        const targetCard = cards[idx];
        if (!targetCard) return;
        const targetProgress = Math.min(1, Math.max(0, targetCard.offsetLeft / maxScroll));
        const targetScroll = st.start + targetProgress * (st.end - st.start);
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
      });
    });

    // Clic en cualquier parte de la tarjeta o en "Conocer más" para abrir subpágina modal
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        const serviceKey = card.dataset.serviceKey || 'tomatis';
        openServicioSubpage(serviceKey);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const serviceKey = card.dataset.serviceKey || 'tomatis';
          openServicioSubpage(serviceKey);
        }
      });
    });

    // Estado inicial
    updateIndicators(0);

    const handleResize = () => {
      updateSectionHeight();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('load', handleResize);
    setTimeout(handleResize, 150);
    setTimeout(handleResize, 600);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('load', handleResize);
      if (horizontalTween.scrollTrigger) {
        horizontalTween.scrollTrigger.kill();
      }
      horizontalTween.kill();
    };
  }
  const cleanupServicios = initServiciosCarousel();

  // =========================================================================
  // CONTROLADOR DE LA SECCIÓN ANIMADA: «A tu ritmo, a tu manera, SonRYE.»
  // =========================================================================
  function initCradleAnimation() {
    const section = document.querySelector('.cradle-section');
    if (!section) return;

    const header = section.querySelector('#cradle-header');
    const balls = [
      section.querySelector('#cradle-ball-1'),
      section.querySelector('#cradle-ball-2'),
      section.querySelector('#cradle-ball-3'),
      section.querySelector('#cradle-ball-4'),
      section.querySelector('#cradle-ball-5')
    ].filter(Boolean);

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP o ScrollTrigger no se encuentran disponibles para la cuna animada.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Si el usuario prefiere movimiento reducido, mostrar estado final estático y accesible
    if (reduced.matches) {
      gsap.set(header, { opacity: 1, y: 0, scale: 1 });
      balls.forEach(ball => gsap.set(ball, { opacity: 1, scale: 1, x: 0, y: 0 }));
      return;
    }

    function setupMaskPath(pathEl) {
      if (!pathEl) return 0;
      const len = pathEl.getTotalLength ? pathEl.getTotalLength() : 500;
      gsap.set(pathEl, { strokeDasharray: len, strokeDashoffset: len });
      return len;
    }

    const mm = gsap.matchMedia();

    // 1. COMPUTADORA Y TABLET HORIZONTAL (>= 1024px)
    mm.add('(min-width: 1024px)', () => {
      const maskLeft = section.querySelector('#mask-path-left');
      const maskRight = section.querySelector('#mask-path-right');
      const maskStem = section.querySelector('#mask-path-stem');
      const maskBowl = section.querySelector('#mask-path-bowl');
      const junction = section.querySelector('#cradle-junction');
      const stage = section.querySelector('#cradle-balls-stage');

      setupMaskPath(maskLeft);
      setupMaskPath(maskRight);
      setupMaskPath(maskStem);
      setupMaskPath(maskBowl);

      gsap.set(header, { opacity: 1, y: 0, scale: 1 });
      gsap.set(junction, { opacity: 0, scale: 0 });

      function getLaunchDeltas(ballEl) {
        if (!ballEl || !stage) return { x: 0, y: -200 };
        const stageRect = stage.getBoundingClientRect();
        const ballRect = ballEl.getBoundingClientRect();
        const targetCenterX = ballRect.left + ballRect.width / 2;
        const targetCenterY = ballRect.top + ballRect.height / 2;
        const launchX = stageRect.left + stageRect.width * 0.5;
        const launchY = stageRect.top + stageRect.height * 0.415;
        return {
          x: launchX - targetCenterX,
          y: launchY - targetCenterY
        };
      }

      // Posicionamiento inicial en el extremo de la línea única
      balls.forEach(ball => {
        gsap.set(ball, {
          x: () => getLaunchDeltas(ball).x,
          y: () => getLaunchDeltas(ball).y,
          scale: 0.15,
          opacity: 0
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'cradleDesktop',
          trigger: section,
          pin: true,
          pinSpacing: true,
          start: 'top top',
          end: () => '+=' + (window.innerHeight * 2.5),
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 0
        }
      });

      // Paso 1 (0 - 15%): La frase ya está presente y se mantiene nítida y visible
      tl.to(header, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 15,
        ease: 'none'
      }, 0);

      // Paso 2 (15 - 34%): Se dibujan las líneas punteadas entrelazadas
      tl.to(maskLeft, {
        strokeDashoffset: 0,
        duration: 19,
        ease: 'power1.inOut'
      }, 15);

      tl.to(maskRight, {
        strokeDashoffset: 0,
        duration: 19,
        ease: 'power1.inOut'
      }, 15);

      // Destello en el punto de convergencia
      tl.to(junction, {
        opacity: 1,
        scale: 1.5,
        duration: 4,
        ease: 'power2.out'
      }, 33);

      // Paso 3 (37 - 44%): Los caminos convergen y solo una línea continúa hacia abajo
      tl.to(maskStem, {
        strokeDashoffset: 0,
        duration: 7,
        ease: 'power1.inOut'
      }, 37);

      // (43 - 54%): La línea dibuja la cuna curva de soporte
      tl.to(maskBowl, {
        strokeDashoffset: 0,
        duration: 11,
        ease: 'power1.out'
      }, 43);

      // Paso 4 (48 - 81%): Caen cinco círculos como pelotas desde el extremo, con aceleración y pequeños rebotes
      // Pelota 3 (Gran base central-izquierda)
      tl.fromTo(balls[2],
        { x: () => getLaunchDeltas(balls[2]).x, y: () => getLaunchDeltas(balls[2]).y, scale: 0.15, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 15, ease: 'bounce.out' },
        48
      );

      // Pelota 5 (Gran base derecha)
      tl.fromTo(balls[4],
        { x: () => getLaunchDeltas(balls[4]).x, y: () => getLaunchDeltas(balls[4]).y, scale: 0.15, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 15, ease: 'bounce.out' },
        53
      );

      // Pelota 1 (+20 años · Lateral izquierdo)
      tl.fromTo(balls[0],
        { x: () => getLaunchDeltas(balls[0]).x, y: () => getLaunchDeltas(balls[0]).y, scale: 0.15, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 14, ease: 'bounce.out' },
        58
      );

      // Pelota 2 (+800 pacientes · Superior izquierdo)
      tl.fromTo(balls[1],
        { x: () => getLaunchDeltas(balls[1]).x, y: () => getLaunchDeltas(balls[1]).y, scale: 0.15, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 14, ease: 'bounce.out' },
        64
      );

      // Pelota 4 (Talleres · Cresta superior derecha sobre la base)
      tl.fromTo(balls[3],
        { x: () => getLaunchDeltas(balls[3]).x, y: () => getLaunchDeltas(balls[3]).y, scale: 0.15, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 14, ease: 'bounce.out' },
        70
      );

      // Paso 5 (80 - 100%): Breve tramo de scroll estable para leer los círculos antes de continuar
      tl.to({}, { duration: 20 }, 80);

      return () => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
        gsap.set([header, junction, ...balls, maskLeft, maskRight, maskStem, maskBowl], { clearProps: 'all' });
      };
    });

    // 2. TELÉFONO Y TABLET VERTICAL (< 1024px)
    mm.add('(max-width: 1023px)', () => {
      const maskLeftM = section.querySelector('#mask-path-left-m');
      const maskRightM = section.querySelector('#mask-path-right-m');
      const maskStemM = section.querySelector('#mask-path-stem-m');
      const maskBowlM = section.querySelector('#mask-path-bowl-m');
      const junctionM = section.querySelector('#cradle-junction-m');
      const stageM = section.querySelector('#cradle-balls-stage');

      setupMaskPath(maskLeftM);
      setupMaskPath(maskRightM);
      setupMaskPath(maskStemM);
      setupMaskPath(maskBowlM);

      gsap.set(header, { opacity: 1, y: 0, scale: 1 });
      gsap.set(junctionM, { opacity: 0, scale: 0 });

      function getLaunchDeltasM(ballEl) {
        if (!ballEl || !stageM) return { x: 0, y: -150 };
        const stageRect = stageM.getBoundingClientRect();
        const ballRect = ballEl.getBoundingClientRect();
        const targetCenterX = ballRect.left + ballRect.width / 2;
        const targetCenterY = ballRect.top + ballRect.height / 2;
        const launchX = stageRect.left + stageRect.width * 0.5;
        const launchY = stageRect.top + stageRect.height * 0.355;
        return {
          x: launchX - targetCenterX,
          y: launchY - targetCenterY
        };
      }

      balls.forEach(ball => {
        gsap.set(ball, {
          x: () => getLaunchDeltasM(ball).x,
          y: () => getLaunchDeltasM(ball).y,
          scale: 0.15,
          opacity: 0
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: 'cradleMobile',
          trigger: section,
          pin: true,
          pinSpacing: true,
          start: 'top top',
          end: () => '+=' + (window.innerHeight * 2.4),
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 0
        }
      });

      // Paso 1 (0 - 15%): La frase ya está presente en pantalla
      tl.to(header, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 15,
        ease: 'none'
      }, 0);

      // Paso 2 (15 - 34%): Líneas punteadas móviles entrelazadas
      tl.to(maskLeftM, {
        strokeDashoffset: 0,
        duration: 19,
        ease: 'power1.inOut'
      }, 15);

      tl.to(maskRightM, {
        strokeDashoffset: 0,
        duration: 19,
        ease: 'power1.inOut'
      }, 15);

      // Destello convergencia
      tl.to(junctionM, {
        opacity: 1,
        scale: 1.5,
        duration: 4,
        ease: 'power2.out'
      }, 33);

      // Paso 3 (37 - 44%): Línea única hacia abajo
      tl.to(maskStemM, {
        strokeDashoffset: 0,
        duration: 7,
        ease: 'power1.inOut'
      }, 37);

      // Curva cuna inferior
      tl.to(maskBowlM, {
        strokeDashoffset: 0,
        duration: 11,
        ease: 'power1.out'
      }, 43);

      // Paso 4 (48 - 81%): Caída con aceleración y rebote de las 5 pelotas
      tl.fromTo(balls[2],
        { x: () => getLaunchDeltasM(balls[2]).x, y: () => getLaunchDeltasM(balls[2]).y, scale: 0.15, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 15, ease: 'bounce.out' },
        48
      );

      tl.fromTo(balls[4],
        { x: () => getLaunchDeltasM(balls[4]).x, y: () => getLaunchDeltasM(balls[4]).y, scale: 0.15, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 15, ease: 'bounce.out' },
        53
      );

      tl.fromTo(balls[0],
        { x: () => getLaunchDeltasM(balls[0]).x, y: () => getLaunchDeltasM(balls[0]).y, scale: 0.15, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 14, ease: 'bounce.out' },
        58
      );

      tl.fromTo(balls[1],
        { x: () => getLaunchDeltasM(balls[1]).x, y: () => getLaunchDeltasM(balls[1]).y, scale: 0.15, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 14, ease: 'bounce.out' },
        64
      );

      tl.fromTo(balls[3],
        { x: () => getLaunchDeltasM(balls[3]).x, y: () => getLaunchDeltasM(balls[3]).y, scale: 0.15, opacity: 0 },
        { x: 0, y: 0, scale: 1, opacity: 1, duration: 14, ease: 'bounce.out' },
        70
      );

      // Paso 5: Pausa de lectura
      tl.to({}, { duration: 20 }, 80);

      return () => {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
        gsap.set([header, junctionM, ...balls, maskLeftM, maskRightM, maskStemM, maskBowlM], { clearProps: 'all' });
      };
    });

    return () => {
      mm.revert();
    };
  }
  const cleanupCradle = initCradleAnimation();

  // =========================================================================
  // REVELACIÓN SUAVE POR SCROLL DE LA SECCIÓN «NOSOTROS» (ESTILO CINEMÁTICO)
  // =========================================================================
  function initNosotrosReveal() {
    const sec = document.querySelector('#nosotros');
    if (!sec) return;

    const heading = sec.querySelector('.nosotros-backdrop-heading');
    const cutout = sec.querySelector('.nosotros-cutout-container');
    const bios = sec.querySelectorAll('.nosotros-floating-bio');
    const footerBlock = sec.querySelector('.nosotros-footer-block');

    if (reduced.matches) {
      if (heading) gsap.set(heading, { opacity: 1, y: 0 });
      if (cutout) gsap.set(cutout, { opacity: 1, y: 0 });
      if (bios.length) gsap.set(bios, { opacity: 1, y: 0 });
      if (footerBlock) gsap.set(footerBlock, { opacity: 1, y: 0 });
      return;
    }

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.set(heading, { opacity: 0, y: 28 });
      gsap.set(cutout, { opacity: 0, y: 40 });
      gsap.set(bios, { opacity: 0, y: 30 });
      if (footerBlock) gsap.set(footerBlock, { opacity: 0, y: 20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sec,
          start: 'top 80%',
          once: true
        }
      });

      tl.to(heading, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out'
      })
      .to(cutout, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.4')
      .to(bios, {
        opacity: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.15,
        ease: 'power2.out'
      }, '-=0.45');

      if (footerBlock) {
        tl.to(footerBlock, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out'
        }, '-=0.3');
      }
    }
  }
  // =========================================================================
  // ANIMACIÓN COUNT UP PARA CIFRAS IMPORTANTES
  // =========================================================================
  function initCountUp() {
    if (reduced.matches) {
      document.querySelectorAll('[data-count-to]').forEach(el => {
        const target = el.getAttribute('data-count-to');
        const prefix = el.getAttribute('data-count-prefix') || '';
        const suffix = el.getAttribute('data-count-suffix') || '';
        el.textContent = `${prefix}${target}${suffix}`;
      });
      return;
    }

    const countEls = document.querySelectorAll('[data-count-to]');
    if (!countEls.length) return;

    const countObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          obs.unobserve(el);
          const target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
          const prefix = el.getAttribute('data-count-prefix') || '';
          const suffix = el.getAttribute('data-count-suffix') || '';
          const duration = parseInt(el.getAttribute('data-count-duration'), 10) || 1200;
          const startTime = performance.now();

          function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.round(ease * target);
            el.textContent = `${prefix}${currentVal}${suffix}`;
            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = `${prefix}${target}${suffix}`;
            }
          }
          requestAnimationFrame(updateCount);
        }
      });
    }, { threshold: 0.15 });

    countEls.forEach(el => countObserver.observe(el));
  }

  // =========================================================================
  // SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
  // =========================================================================
  function initScrollReveal() {
    if (reduced.matches) {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const revealEls = document.querySelectorAll('.reveal-on-scroll');
    if (!revealEls.length) return;

    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  initNosotrosReveal();
  initCountUp();
  initScrollReveal();

  show(current);updatePlay();schedule();
})();
