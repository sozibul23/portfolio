/* ═══════════════════════════════════════════════════
   script.js — Professional Portfolio Interactions
═══════════════════════════════════════════════════ */

// ── Utilities ─────────────────────────────────────
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

// ── Theme ──────────────────────────────────────────
const html = document.documentElement;
const themeBtn = $('#themeToggle');
const saved = localStorage.getItem('pf-theme') || 'dark';
html.setAttribute('data-theme', saved);

themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('pf-theme', next);
});

// ── Custom Cursor ──────────────────────────────────
const cursor = document.createElement('div');
cursor.className = 'cursor';
cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
document.body.prepend(cursor);

const dot  = $('.cursor-dot',  cursor);
const ring = $('.cursor-ring', cursor);
let cx = 0, cy = 0, rx = 0, ry = 0;
let rafId;

document.addEventListener('mousemove', e => {
  cx = e.clientX;
  cy = e.clientY;
  dot.style.transform  = `translate(${cx}px, ${cy}px)`;
  if (!rafId) rafId = requestAnimationFrame(moveCursorRing);
});

function moveCursorRing() {
  rx += (cx - rx) * 0.12;
  ry += (cy - ry) * 0.12;
  ring.style.transform = `translate(${rx}px, ${ry}px)`;
  rafId = requestAnimationFrame(moveCursorRing);
}

// Hover effects for interactive elements
$$('a, button, .project-row, .tool-chip, .lab-row').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
});

// ── Scroll-based top bar ───────────────────────────
const topBar = $('.top-bar');
window.addEventListener('scroll', () => {
  topBar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ── Menu ───────────────────────────────────────────
const menuToggle = $('#menuToggle');
const siteMenu   = $('#site-menu');
const menuScrim  = $('#menuScrim');
const menuClose  = $('#menuClose');

const openMenu = () => {
  siteMenu.classList.add('is-open');
  siteMenu.setAttribute('aria-hidden', 'false');
  menuToggle.classList.add('is-open');
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
};
const closeMenu = () => {
  siteMenu.classList.remove('is-open');
  siteMenu.setAttribute('aria-hidden', 'true');
  menuToggle.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
};

menuToggle.addEventListener('click', () => siteMenu.classList.contains('is-open') ? closeMenu() : openMenu());
menuScrim.addEventListener('click', closeMenu);
if (menuClose) menuClose.addEventListener('click', closeMenu);
$$('.menu-item').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

// ── Smooth scroll ──────────────────────────────────
$$('[data-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = $(`#${btn.dataset.target}`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
$$('.menu-item[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = $(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── The Light Follows Your Cursor ──────────────────
window.addEventListener('mousemove', e => {
  document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
  document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
}, { passive: true });

// ── Right Side Rail Section Tracking ───────────────
const sections = $$('section[id]');
const railItems = $$('.rail-item');

const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      railItems.forEach(ri => ri.classList.toggle('active', ri.dataset.section === id));
    }
  });
}, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });

sections.forEach(s => sectionObs.observe(s));

// ── Hero entrance & Stats counter ──────────────────
function initHeroEntrance() {
  document.body.classList.add('loaded');

  // Counter animation for stats via IntersectionObserver
  const statEls = $$('.stat-n[data-count]');
  const statObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        let start = 0;
        const step = Math.max(1, target / 35);
        const timer = setInterval(() => {
          start = Math.min(start + step, target);
          el.textContent = Math.floor(start) + suffix;
          if (start >= target) clearInterval(timer);
        }, 30);
        statObs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });
  statEls.forEach(el => statObs.observe(el));
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  requestAnimationFrame(initHeroEntrance);
} else {
  window.addEventListener('DOMContentLoaded', initHeroEntrance);
  window.addEventListener('load', initHeroEntrance);
}

// ── Interactive Hero Canvas (Constellation & Cyber Grid) ──
const canvas = $('#heroCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: -9999, y: -9999 };

  function resizeCanvas() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.offsetWidth;
    height = canvas.height = parent.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  const numParticles = Math.min(50, Math.floor((window.innerWidth * window.innerHeight) / 20000));
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 1.8 + 1,
      isGreen: Math.random() > 0.6
    });
  }

  window.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  function animateCanvas() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Mouse repulsion
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 110) {
        p.x -= (dx / dist) * 1.2;
        p.y -= (dy / dist) * 1.2;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.isGreen ? 'rgba(0, 229, 176, 0.55)' : 'rgba(139, 109, 255, 0.55)';
      ctx.fill();

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const d = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (d < 115) {
          const alpha = (1 - d / 115) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = p.isGreen ? `rgba(0, 229, 176, ${alpha})` : `rgba(139, 109, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateCanvas);
  }
  requestAnimationFrame(animateCanvas);
}

// ── Dynamic Typewriter Effect ───────────────────────
const typewriterEl = $('#typewriter');
if (typewriterEl) {
  const roles = [
    'AppSec Engineer & Web Penetration Tester',
    'PortSwigger Labs Practitioner (BSCP Path)',
    'DevSecOps & Security Automation SDET',
    'Offensive Vulnerability Researcher (OWASP Top 10)',
    'Burp Suite Professional Specialist'
  ];
  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  const typeSpeed = 80;
  const deleteSpeed = 40;
  const pauseEnd = 1700;

  function typeStep() {
    const current = roles[roleIdx];
    if (isDeleting) {
      charIdx--;
      typewriterEl.textContent = current.substring(0, charIdx);
      if (charIdx <= 0) {
        isDeleting = false;
        roleIdx = (roleIdx + 1) % roles.length;
        setTimeout(typeStep, 350);
        return;
      }
      setTimeout(typeStep, deleteSpeed);
    } else {
      charIdx++;
      typewriterEl.textContent = current.substring(0, charIdx);
      if (charIdx >= current.length) {
        isDeleting = true;
        setTimeout(typeStep, pauseEnd);
        return;
      }
      setTimeout(typeStep, typeSpeed);
    }
  }
  setTimeout(typeStep, 600);
}

// ── Interactive Cyber Terminal Controller ───────────
const terminalInput  = $('#terminalInput');
const terminalOutput = $('#terminalOutput');
const termChips      = $$('.term-chip');

if (terminalInput && terminalOutput) {
  const commands = {
    help: () => `
<div class="text-green" style="margin-bottom:6px">AVAILABLE CYBER COMMANDS:</div>
• <strong>whoami</strong>   - Security Engineer profile & operational focus<br/>
• <strong>vulns</strong>    - Researched vulnerability vectors & CVSS 3.1 ratings<br/>
• <strong>tools</strong>    - Offensive weapon arsenal (Burp Suite Pro, ZAP, Nmap, Python)<br/>
• <strong>labs</strong>     - PortSwigger Web Security Academy status (BSCP Path)<br/>
• <strong>cert</strong>     - Offensive security certification roadmap<br/>
• <strong>matrix</strong>   - DevSecOps & penetration testing proficiency breakdown<br/>
• <strong>nmap</strong>     - Simulated reconnaissance scan on local target scope<br/>
• <strong>contact</strong>  - Encrypted communications & direct contact endpoints<br/>
• <strong>clear</strong>    - Clear terminal history
`,
    whoami: () => `Md Sozibul Islam (Sadhin) — Associate SQA & Application Security Engineer at Innovate Solution. Simulating offensive web exploit chains (SQLi, XSS, SSRF, IDOR) to architect impenetrable automated DevSecOps regression pipelines.`,
    vulns: () => `
<div class="text-green" style="margin-bottom:6px">VULNERABILITY RESEARCH & EXPLOIT POCs:</div>
💉 <strong>SQL Injection</strong> [CVSS 9.8 CRITICAL] — UNION data extraction, XML filter bypass, blind time delays.<br/>
🌐 <strong>Cross-Site Scripting</strong> [CVSS 8.2 HIGH] — Reflected/stored XSS, DOM sinks, WAF filter evasion.<br/>
📡 <strong>SSRF</strong> [CVSS 8.6 HIGH] — Localhost pivoting (127.0.0.1, 169.254.169.254), IP obfuscation.<br/>
🔓 <strong>IDOR & Broken Auth</strong> [CVSS 7.5 HIGH] — Horizontal privilege escalation, token tampering.<br/>
⚡ <strong>File Upload RCE</strong> [CVSS 9.8 CRITICAL] — Polyglot payload execution, MIME type spoofing.<br/>
🛡️ <strong>Burp Suite Pro</strong> [EXPLOIT SUITE] — Repeater manual crafting, Intruder fuzzing, Collaborator OOB.
`,
    tools: () => `[ARSENAL WEAPONS] Burp Suite Professional, OWASP ZAP, Nmap, Wireshark, SQLmap, ffuf, Playwright E2E, REST Assured, Python, Docker, GitHub Actions CI/CD, Allure Reports, Linux CLI.`,
    labs: () => `[PORTSWIGGER ACADEMY] 18+ verified labs solved (~45% of practitioner track). Documented exploit writeups & Python automation scripts across SQLi, XSS DOM sinks, SSRF filters, and Broken Auth.`,
    cert: () => `<span class="text-green">&gt; eJPT</span> (eLearnSecurity Junior Pen-tester) ➔ <span class="text-green">&gt; BSCP</span> (Burp Suite Certified Practitioner) ➔ <span class="text-green">&gt; OSCP</span> (OffSec Certified Professional).`,
    matrix: () => `[DEVSECOPS MATRIX] Pen-Testing: 90% | OWASP Top 10: 92% | Playwright Security Fuzzing: 95% | REST API Sec: 85% | CI/CD DevSecOps: 88% | Python Exploits: 85%.`,
    nmap: () => `
Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-19 13:30 BST<br/>
Nmap scan report for sozibul-secops.local (127.0.0.1)<br/>
Host is up (0.00012s latency).<br/>
PORT &nbsp;&nbsp;&nbsp;&nbsp;STATE SERVICE &nbsp;&nbsp;&nbsp;&nbsp;VERSION<br/>
80/tcp &nbsp;&nbsp;open &nbsp;http &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nginx/1.24 (SSL Redirect)<br/>
443/tcp &nbsp;open &nbsp;ssl/https &nbsp;&nbsp;TLS 1.3 (Hardened Cipher Suites)<br/>
8080/tcp open &nbsp;http-proxy &nbsp;Burp Suite Pro Interceptor<br/>
<span class="text-green">Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds. Defense perimeter active.</span>
`,
    contact: () => `Email: <a href="mailto:sozibul23@gmail.com" style="color:var(--green)">sozibul23@gmail.com</a> | LinkedIn: <a href="https://www.linkedin.com/in/md-sozibul-islam/" target="_blank" style="color:var(--accent)">/in/md-sozibul-islam</a> | GitHub: <a href="https://github.com/sozibul23" target="_blank" style="color:var(--accent)">/sozibul23</a> | Dhaka, Bangladesh.`
  };

  function executeCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'clear') {
      terminalOutput.innerHTML = '';
      return;
    }

    // Add prompt line
    const cmdLine = document.createElement('div');
    cmdLine.className = 't-line';
    cmdLine.innerHTML = `<span class="t-prompt">secops@sozibul23:~$</span> <span class="t-cmd">${escapeHtml(rawCmd.trim())}</span>`;
    terminalOutput.appendChild(cmdLine);

    // Add response
    const resLine = document.createElement('div');
    resLine.className = 't-response';

    if (commands[cmd]) {
      const result = commands[cmd]();
      resLine.innerHTML = result;
    } else {
      resLine.innerHTML = `<span class="text-red">zsh: command not found: ${escapeHtml(rawCmd.trim())}</span>. Type <strong style="color:var(--green)">help</strong> to view valid commands.`;
    }
    terminalOutput.appendChild(resLine);

    // Scroll to bottom
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  terminalInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = terminalInput.value;
      terminalInput.value = '';
      executeCommand(val);
    }
  });

  termChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.dataset.cmd;
      terminalInput.value = cmd;
      executeCommand(cmd);
      terminalInput.value = '';
    });
  });
}


// ── Interactive Spotlight on Hover ──────────────────
$$('.security-card, .project-row, .featured-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// ── Skill bar animation ────────────────────────────
const skillFills = $$('.skill-fill');
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = getComputedStyle(entry.target).getPropertyValue('--w') || entry.target.dataset.w;
      skillObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
skillFills.forEach(f => skillObs.observe(f));

// ── Progress bar (PortSwigger) ─────────────────────
const psFill = $('.ps-progress-fill');
if (psFill) {
  const psObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      psFill.style.width = psFill.dataset.width;
      psObs.disconnect();
    }
  }, { threshold: 0.5 });
  psObs.observe(psFill);
}

// ── Text & card reveal (fade-up + t-reveal) ─────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });

$$('.fade-up, .t-reveal, .section-header').forEach(el => revealObs.observe(el));

// ── Section header smooth reveal ────────────────────
$$('.section-title').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out)';

  const titleObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      titleObs.disconnect();
    }
  }, { threshold: 0.5 });
  titleObs.observe(el);
});

// ── Magnetic buttons ───────────────────────────────
$$('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top  - rect.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px) translateY(-2px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
    btn.style.transition = 'transform 0.5s var(--ease-back)';
    setTimeout(() => { btn.style.transition = ''; }, 500);
  });
});

// ── Project rows hover tilt ────────────────────────
$$('.project-row, .featured-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 2}deg) rotateX(${-y * 2}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.6s var(--ease-back)';
    card.style.transform = '';
    setTimeout(() => { card.style.transition = ''; }, 600);
  });
});

// ── Tool chip stagger on scroll ─────────────────────
const toolGrid = $('.tools-grid');
if (toolGrid) {
  const chips = $$('.tool-chip', toolGrid);
  chips.forEach((c, i) => {
    c.style.opacity = '0';
    c.style.transform = 'translateY(10px) scale(0.9)';
    c.style.transition = `opacity 0.4s ${i * 0.04}s, transform 0.4s ${i * 0.04}s`;
  });
  const chipObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      chips.forEach(c => {
        c.style.opacity = '1';
        c.style.transform = 'none';
      });
      chipObs.disconnect();
    }
  }, { threshold: 0.3 });
  chipObs.observe(toolGrid);
}

// ── Staggered project rows ─────────────────────────
$$('.project-row').forEach((row, i) => {
  row.style.opacity = '0';
  row.style.transform = 'translateX(-20px)';
  row.style.transition = `opacity 0.6s ${i * 0.08}s var(--ease-out), transform 0.6s ${i * 0.08}s var(--ease-out)`;

  const rowObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      row.style.opacity = '1';
      row.style.transform = 'none';
      rowObs.disconnect();
    }
  }, { threshold: 0.2 });
  rowObs.observe(row);
});

// ── Security card stagger ──────────────────────────
$$('.security-card, .lab-row').forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(16px)';
  card.style.transition = `opacity 0.5s ${i * 0.06}s, transform 0.5s ${i * 0.06}s`;

  const cardObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      card.style.opacity = '1';
      card.style.transform = 'none';
      cardObs.disconnect();
    }
  }, { threshold: 0.15 });
  cardObs.observe(card);
});

// ── Page enter animation ──────────────────────────
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s';
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});
