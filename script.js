const PREFERS_REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function typeText(el, text, speed = 40) {
  return new Promise((resolve) => {
    if (!el) return resolve();
    if (PREFERS_REDUCED) {
      el.textContent = text;
      return resolve();
    }
    el.textContent = '';
    let i = 0;
    const t = setInterval(() => {
      el.textContent += text.charAt(i);
      i++;
      if (i >= text.length) {
        clearInterval(t);
        resolve();
      }
    }, speed);
  });
}

async function runLoader() {
  const main = document.getElementById('site');
  const loading = document.getElementById('loadingScreen');
  const welcomeMain = document.getElementById('welcomeMain');
  const welcomeSub = document.getElementById('welcomeSub');
  const fill = document.getElementById('fillOverlay');

  const mainText = "Welcome to My Website!";
  const subText  = "- Manie Q. Chomchuen";

  await typeText(welcomeMain, mainText, PREFERS_REDUCED ? 0 : 28);
  await typeText(welcomeSub, subText, PREFERS_REDUCED ? 0 : 28);

  requestAnimationFrame(() => {
    setTimeout(() => fill.style.height = "100%", PREFERS_REDUCED ? 120 : 300);
  });

  const wait = PREFERS_REDUCED ? 400 : 2400;
  setTimeout(() => {
    loading.classList.add('fadeout');
    setTimeout(() => {
      loading.style.display = 'none';
      welcomeMain.textContent = '';
      welcomeSub.textContent = '';
      fill.style.height = '0%';
      loading.setAttribute('aria-hidden', 'true');
      main.classList.remove('hidden');
      main.setAttribute('aria-hidden', 'false');
      startHeroTyping();
      document.getElementById('heroLeft').focus();
    }, 420);
  }, wait);
}

function startHeroTyping() {
  const el = document.getElementById('heroText');
  const text = "Hi — I'm Manie!";
  if (!el) return;
  if (PREFERS_REDUCED) {
    el.textContent = text;
    return;
  }
  el.textContent = '';
  let i = 0;
  const caret = document.querySelector('.caret');
  const t = setInterval(() => {
    el.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(t);
      let b = 0;
      const blink = setInterval(() => {
        caret.style.opacity = caret.style.opacity === '0' ? '1' : '0';
        b++;
        if (b > 5) { clearInterval(blink); caret.style.opacity = '0'; }
      }, 220);
    }
  }, 60);
}

document.addEventListener('click', (e) => {
  if (e.target && e.target.id === 'toAbout') {
    document.querySelector('.about-wrap').scrollIntoView({ behavior: PREFERS_REDUCED ? 'auto' : 'smooth' });
  }
});

(function education() {
  const tabs = Array.from(document.querySelectorAll('.edu-tab'));
  const slides = Array.from(document.querySelectorAll('.edu-slide'));
  const prevBtn = document.getElementById('eduPrev');
  const nextBtn = document.getElementById('eduNext');
  let current = 0;
  let animating = false;

  function goTo(index, direction) {
    if (animating || index === current || index < 0 || index >= slides.length) return;
    animating = true;

    const old = slides[current];
    const neu = slides[index];

    neu.style.transition = 'none';
    neu.style.opacity = '1';
    if (direction === 'left') {
      neu.style.transform = 'translateX(100%)';
      requestAnimationFrame(() => {
        old.style.transform = 'translateX(-100%)';
        old.style.opacity = '0';
        neu.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1), opacity 320ms ease';
        neu.style.transform = 'translateX(0)';
        neu.style.opacity = '1';
      });
    } else {
      neu.style.transform = 'translateX(-100%)';
      requestAnimationFrame(() => {
        old.style.transform = 'translateX(100%)';
        old.style.opacity = '0';
        neu.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1), opacity 320ms ease';
        neu.style.transform = 'translateX(0)';
        neu.style.opacity = '1';
      });
    }

    const cleanup = () => {
      slides.forEach(s => {
        s.style.transition = '';
        s.style.transform = '';
        s.style.opacity = '';
        s.classList.toggle('active', Number(s.dataset.index) === index);
        s.setAttribute('aria-hidden', Number(s.dataset.index) === index ? 'false' : 'true');
      });
      tabs.forEach((t, idx) => {
        t.setAttribute('aria-selected', idx === index ? 'true' : 'false');
        t.tabIndex = idx === index ? 0 : -1;
        t.classList.toggle('active', idx === index);
      });
      current = index;
      animating = false;
      updateNavButtons();
    };

    setTimeout(cleanup, 460);
  }

  function updateNavButtons() {
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === slides.length - 1;
  }

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      const dir = idx > current ? 'left' : 'right';
      goTo(idx, dir);
      tab.focus();
    });
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { const ni = (idx + 1) % tabs.length; goTo(ni, 'left'); tabs[ni].focus(); }
      if (e.key === 'ArrowLeft')  { const ni = (idx - 1 + tabs.length) % tabs.length; goTo(ni, 'right'); tabs[ni].focus(); }
    });
  });

  prevBtn.addEventListener('click', () => { goTo(current - 1, 'right'); });
  nextBtn.addEventListener('click', () => { goTo(current + 1, 'left'); });

  updateNavButtons();
})();


(function skillsTabbedCarousels() {
  const tabTech = document.getElementById('tabTech');
  const tabSoft = document.getElementById('tabSoft');
  const techTrack = document.getElementById('techTrack');
  const softTrack = document.getElementById('softTrack');
  const prev = document.getElementById('skillsPrev');
  const next = document.getElementById('skillsNext');
  const viewport = document.getElementById('skillsViewport');

  if (!tabTech || !tabSoft || !techTrack || !softTrack || !prev || !next || !viewport) return;

  const groups = {
    tech: { track: techTrack, cards: Array.from(techTrack.children), index: 0 },
    soft: { track: softTrack, cards: Array.from(softTrack.children), index: 0 }
  };

  let activeGroup = 'tech';


  function readGap(track) {
    const gapVal = getComputedStyle(track).gap || getComputedStyle(track).getPropertyValue('gap') || '18px';
    return parseInt(gapVal, 10) || 18;
  }

  function computeOffset(track, i) {
    const card = track.children[0];
    const cardW = card.offsetWidth;
    const gap = readGap(track);
    const viewportW = viewport.clientWidth;
    const center = (viewportW - cardW) / 2;
    return center - i * (cardW + gap);
  }

  function setActiveCard(track, cards, idx) {
    cards.forEach((c, i) => {
      c.classList.toggle('active', i === idx);
      c.tabIndex = i === idx ? 0 : -1;
      c.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
    });
    const offset = computeOffset(track, idx);
    if (PREFERS_REDUCED) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1)';
    }
    track.style.transform = `translateX(${offset}px)`;
  }

  function updateNavButtons() {
    const group = groups[activeGroup];
    prev.disabled = group.index === 0;
    next.disabled = group.index >= group.cards.length - 1;
  }


  function switchTo(groupName) {
    if (activeGroup === groupName) return;
    groups[activeGroup].track.style.display = 'none';
    groups[activeGroup].track.setAttribute('aria-hidden', 'true');
    activeGroup = groupName;
    groups[activeGroup].track.style.display = 'flex';
    groups[activeGroup].track.setAttribute('aria-hidden', 'false');

    tabTech.classList.toggle('active', activeGroup === 'tech');
    tabTech.setAttribute('aria-selected', activeGroup === 'tech' ? 'true' : 'false');
    tabSoft.classList.toggle('active', activeGroup === 'soft');
    tabSoft.setAttribute('aria-selected', activeGroup === 'soft' ? 'true' : 'false');

    const group = groups[activeGroup];
    if (group.index < 0) group.index = 0;
    if (group.index > group.cards.length - 1) group.index = group.cards.length - 1;

    setActiveCard(group.track, group.cards, group.index);
    updateNavButtons();
  }


  function goToInGroup(delta) {
    const group = groups[activeGroup];
    const newIndex = Math.min(Math.max(0, group.index + delta), group.cards.length - 1);
    if (newIndex === group.index) return;
    group.index = newIndex;
    setActiveCard(group.track, group.cards, group.index);
    updateNavButtons();
  }


  tabTech.addEventListener('click', () => switchTo('tech'));
  tabSoft.addEventListener('click', () => switchTo('soft'));


  tabTech.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') tabSoft.focus(); });
  tabSoft.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') tabTech.focus(); });


  prev.addEventListener('click', () => goToInGroup(-1));
  next.addEventListener('click', () => goToInGroup(1));


  function attachCardClicks(trackObj) {
    trackObj.cards.forEach((c, i) => {
      c.addEventListener('click', () => {
        if (trackObj.index === i) return;
        trackObj.index = i;
        setActiveCard(trackObj.track, trackObj.cards, i);
        updateNavButtons();
      });
    });
  }
  attachCardClicks(groups.tech);
  attachCardClicks(groups.soft);


  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToInGroup(-1);
    if (e.key === 'ArrowRight') goToInGroup(1);
  });


  groups.tech.track.style.display = 'flex';
  groups.tech.track.setAttribute('aria-hidden', 'false');
  groups.soft.track.style.display = 'none';
  groups.soft.track.setAttribute('aria-hidden', 'true');
  setActiveCard(groups.tech.track, groups.tech.cards, groups.tech.index);
  setActiveCard(groups.soft.track, groups.soft.cards, groups.soft.index);
  updateNavButtons();


  window.addEventListener('resize', () => {
    setActiveCard(groups[activeGroup].track, groups[activeGroup].cards, groups[activeGroup].index);
  });
})();


(function projectsCarousel() {
  const track = document.getElementById('projectsTrack');
  const viewport = document.getElementById('projectsViewport');
  const prev = document.getElementById('projectsPrev');
  const next = document.getElementById('projectsNext');

  if (!track || !viewport || !prev || !next) return;

  const cards = Array.from(track.children);
  let index = 0;

  function readGap() {
    const gapVal = getComputedStyle(track).gap || getComputedStyle(track).getPropertyValue('gap') || '18px';
    return parseInt(gapVal, 10) || 18;
  }

  function computeOffset(i) {
    const card = track.children[0];
    const cardW = card.offsetWidth;
    const gap = readGap();
    const viewportW = viewport.clientWidth;
    const center = (viewportW - cardW) / 2;
    return center - i * (cardW + gap);
  }

  function setActive(i) {
    cards.forEach((c, idx) => {
      c.classList.toggle('active', idx === i);
      c.tabIndex = idx === i ? 0 : -1;
      c.setAttribute('aria-hidden', idx === i ? 'false' : 'true');
    });
    const offset = computeOffset(i);
    if (PREFERS_REDUCED) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1)';
    }
    track.style.transform = `translateX(${offset}px)`;
    prev.disabled = i === 0;
    next.disabled = i >= cards.length - 1;
  }

  prev.addEventListener('click', () => {
    index = Math.max(0, index - 1);
    setActive(index);
  });
  next.addEventListener('click', () => {
    index = Math.min(cards.length - 1, index + 1);
    setActive(index);
  });


  cards.forEach((c, i) => c.addEventListener('click', () => {
    if (index === i) return;
    index = i;
    setActive(index);
  }));


  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { index = Math.max(0, index - 1); setActive(index); }
    if (e.key === 'ArrowRight') { index = Math.min(cards.length - 1, index + 1); setActive(index); }
  });


  window.requestAnimationFrame(() => {
    setActive(index);

    const offset = computeOffset(index);
    track.style.transition = 'none';
    track.style.transform = `translateX(${offset}px)`;
  });

  window.addEventListener('resize', () => {
    const offset = computeOffset(index);
    track.style.transition = 'none';
    track.style.transform = `translateX(${offset}px)`;
  });
})();

(function focusHover() {
  const profile = document.getElementById('profile');
  const aboutCard = document.getElementById('aboutCard');
  const contactCard = document.getElementById('contactCard');
  profile && profile.addEventListener('focus', () => profile.classList.add('focused'));
  profile && profile.addEventListener('blur', () => profile.classList.remove('focused'));
  aboutCard && aboutCard.addEventListener('focus', () => aboutCard.classList.add('focused'));
  aboutCard && aboutCard.addEventListener('blur', () => aboutCard.classList.remove('focused'));
  contactCard && contactCard.addEventListener('focus', () => contactCard.classList.add('focused'));
  contactCard && contactCard.addEventListener('blur', () => contactCard.classList.remove('focused'));
})();

window.addEventListener('load', () => runLoader());
