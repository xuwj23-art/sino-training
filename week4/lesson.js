/* Week 4 extends the existing textbook shell. No network or AI calls are made here. */
(() => {
  'use strict';
  const data = window.WEEK4_DATA;
  if (!data) return;
  const panel = document.getElementById('week4Panel');
  if (!panel) return;
  let language = 'zh-CN';
  let currentStep = 0;
  let copyTimer;
  const checkKey = 'training-week4-review-v1';
  const safeRead = () => { try { return JSON.parse(localStorage.getItem(checkKey) || '[]'); } catch { return []; } };
  let checked = new Set(safeRead().filter(n => Number.isInteger(n) && n >= 0 && n < 6));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const t = key => data.copy[language]?.[key] || data.copy['zh-CN'][key] || key;
  const external = (href, label) => `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span aria-hidden="true">↗</span></a>`;
  const download = (file, key, secondary = false) => `<a class="w4-button${secondary ? ' w4-secondary' : ''}" href="week4/${file}" download>${esc(t(key))}<span aria-hidden="true"> ↓</span></a>`;
  const sources = {
    r1: 'https://apps.sfc.hk/edistributionWeb/api/circular/openAppendix?appendix=0&lang=EN&refNo=22EC30',
    r2: 'https://www.cinda.com.hk/tc/complaint_policy.php?id=0',
    r3: 'https://www.gyf.com.hk/wp-content/uploads/2024/08/cw_08221ESG-11082022.pdf',
    r4: 'https://www.kingston.com.hk/securities-fund'
  };
  const payloadKeys = ['opening', 'answer1', 'correction', 'confirmation', 'prompt', 'prompt', 'feedback'];
  function codeBlock(key, id, caption = '') {
    return `<div class="w4-code"><div class="w4-codebar"><span>${esc(caption || t('rawLanguage'))}</span><button type="button" class="w4-copy" data-w4-copy="${key}" aria-label="${esc(t('copy'))}">${esc(t('copy'))}</button></div><pre id="${id}" lang="zh-CN" tabindex="0">${esc(data.payload[key])}</pre></div>`;
  }
  function stepContent() {
    const n = currentStep + 1;
    return `<div class="w4-demo-header"><div><p class="eyebrow">${esc(t('scriptBadge'))}</p><h3 id="w4-step-title">${esc(t(`step${n}Title`))}</h3></div><span class="w4-step-count">0${n} <span>/ 07</span></span></div>
      <p class="w4-location">${esc(t(`where${n}`))}</p>
      <div class="w4-observation"><strong>${esc(t('watch'))}</strong><p>${esc(t(`watch${n}`))}</p></div>
      ${currentStep === 4 || currentStep === 5 ? `<p class="w4-small">${esc(t('promptNote'))}</p>` : ''}
      ${codeBlock(payloadKeys[currentStep], 'w4-active-message')}
      ${currentStep === 1 ? `<details class="w4-details"><summary>${esc(t('secondAnswers'))}</summary>${codeBlock('answer2', 'w4-second-answer')}</details>` : ''}
      <div class="w4-demo-controls"><button type="button" class="w4-button w4-secondary" data-w4-prev ${currentStep === 0 ? 'disabled' : ''}>← ${esc(t('prevStep'))}</button><span class="w4-small">${n} / 7</span><button type="button" class="w4-button" data-w4-next ${currentStep === 6 ? 'disabled' : ''}>${esc(t('nextStep'))} →</button></div>`;
  }
  function renderStep(moveFocus = false) {
    panel.querySelectorAll('[data-w4-step]').forEach(button => {
      const active = Number(button.dataset.w4Step) === currentStep;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    const stage = document.getElementById('w4-demo-stage');
    if (stage) {
      stage.setAttribute('aria-labelledby', `w4-tab-${currentStep}`);
      stage.innerHTML = stepContent();
      if (moveFocus) {
        const title = stage.querySelector('h3');
        title.tabIndex = -1;
        title.focus({preventScroll: true});
      }
    }
  }
  function checklist() {
    return `<div class="w4-check-head"><h3>${esc(t('checkTitle'))}</h3><output id="w4-check-count" aria-live="polite">${checked.size} / 6</output></div>
      <div class="w4-checklist">${Array.from({length: 6}, (_, i) => `<label class="w4-check-row"><input type="checkbox" data-w4-check="${i}" ${checked.has(i) ? 'checked' : ''}><span>${esc(t(`check${i + 1}`))}</span></label>`).join('')}</div>
      <div class="w4-check-footer"><button type="button" class="w4-text-button" data-w4-reset>${esc(t('reset'))}</button></div>`;
  }
  function simulatedRevision() {
    return `<p class="w4-sim-label">${esc(t('simLabel'))}</p>
      <div class="w4-sim-case"><h3>${esc(t('simCaseTitle'))}</h3><p>${esc(t('simCase'))}</p></div>
      <div class="w4-sim-step" id="w4-sim-old"><h3>${esc(t('sim1Title'))}</h3>
        <div class="w4-sim-reply"><p class="w4-sim-speaker">${esc(t('simAI'))}</p>
          <div class="table-wrap w4-sim-table"><table><thead><tr><th scope="col">${esc(t('simStepHead'))}</th><th scope="col">${esc(t('simActionHead'))}</th></tr></thead><tbody>${[1,2,3].map(i=>`<tr${i===3?' class="w4-sim-error-row"':''}><th scope="row">0${i}</th><td>${esc(t(`simBad${i}`))}</td></tr>`).join('')}</tbody></table></div>
        </div><p class="w4-sim-diagnosis">${esc(t('simProblem'))}</p>
      </div>
      <div class="w4-sim-step" id="w4-sim-feedback"><h3>${esc(t('sim2Title'))}</h3><p>${esc(t('sim2Intro'))}</p>${codeBlock('feedback','w4-feedback')}</div>
      <div class="w4-sim-step" id="w4-sim-coach"><h3>${esc(t('sim3Title'))}</h3>
        <div class="w4-sim-reply"><p class="w4-sim-speaker">${esc(t('simAI'))}</p><p>${esc(t('simCoach'))}</p><ol>${[1,2,3].map(i=>`<li>${esc(t(`simRule${i}`))}</li>`).join('')}</ol></div>
        <details class="w4-details" id="w4-sim-prompt-details"><summary>${esc(t('simPromptTitle'))}</summary><p class="w4-small">${esc(t('simPromptNote'))}</p>${codeBlock('simPrompt','w4-sim-prompt')}</details>
      </div>
      <div class="w4-sim-step" id="w4-sim-result"><h3>${esc(t('sim4Title'))}</h3><p>${esc(t('sim4Intro'))}</p>
        <div class="w4-sim-reply"><p class="w4-sim-speaker">${esc(t('simAI'))}</p><div class="table-wrap w4-sim-table w4-sim-results"><table><thead><tr><th scope="col">${esc(t('simResultHead1'))}</th><th scope="col">${esc(t('simResultHead2'))}</th></tr></thead><tbody>${['Pending','Accepted'].map(key=>`<tr><th scope="row">${esc(t(`sim${key}`))}</th><td>${esc(t(`sim${key}Result`))}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="w4-sim-try"><h4>${esc(t('simTryTitle'))}</h4><p>${esc(t('simTry'))}</p></div>
      </div>`;
  }
  function render(lang) {
    language = data.copy[lang] ? lang : 'zh-CN';
    panel.innerHTML = `
      <section class="hero w4-hero"><div class="hero-grid"><div><p class="eyebrow">${esc(t('eyebrow'))}</p><h1>${t('title')}</h1><p class="hero-lead">${esc(t('lead'))}</p></div><div class="hero-note"><strong>${esc(t('goal'))}</strong><p>${esc(t('goalText'))}</p></div></div>
        <div class="w4-hero-actions"><a class="w4-button" href="#w4-s3">${esc(t('start'))} <span aria-hidden="true">↗</span></a>${download('week4-learner-pack.zip', 'downloadPack', true)}</div>
      </section>
      <section id="w4-s1" class="article-section prose"><h2>${esc(t('s1'))}</h2><p class="section-intro">${esc(t('s1Intro'))}</p><blockquote>${esc(t('s1Quote'))}</blockquote>
        <ol class="w4-route">${Array.from({length:7}, (_,i) => `<li><span>0${i+1}</span>${esc(t(`route${i+1}`))}</li>`).join('')}</ol><p>${esc(t('s1Note'))}</p>
      </section>
      <section id="w4-s2" class="article-section prose"><h2>${esc(t('s2'))}</h2><p class="section-intro">${esc(t('s2Intro'))}</p>
        <div class="w4-source-block"><p class="eyebrow">${esc(t('realLabel'))}</p><h3>${esc(t('realTitle'))}</h3><p>${esc(t('realIntro'))}</p>
          <ul class="w4-source-list">${[[1,sources.r3,'PF Group · 2022 · pp. 19, 30'],[2,sources.r2,'Cinda'],[3,sources.r1,'SFC · 22EC30 · A.4 / C / F']].map(([i,url,label])=>`<li><strong>${esc(t(`real${i}Title`))}</strong><p>${esc(t(`real${i}`))} ${external(url,label)}</p></li>`).join('')}</ul>
          <div class="w4-source-use"><h4>${esc(t('sourceUseTitle'))}</h4><p>${esc(t('sourceUse'))}</p></div>
        </div>
        <div class="w4-scenario"><p class="eyebrow">${esc(t('fictionLabel'))}</p><h3>${esc(t('fictionTitle'))}</h3><p>${esc(t('fictionText'))}</p><div class="w4-process-line">${esc(t('flowPlain'))}</div></div>
        <h3 id="w4-roles-title">${esc(t('rolesTitle'))}</h3><div class="table-wrap w4-roles"><table aria-labelledby="w4-roles-title"><thead><tr>${[1,2,3].map(i=>`<th scope="col">${esc(t(`roleHead${i}`))}</th>`).join('')}</tr></thead><tbody>
          <tr><th scope="row">Ops</th><td>${esc(t('opsMeaning'))}</td><td>${esc(t('opsRole'))}</td></tr>
          <tr><th scope="row">Complaints Officer</th><td>${esc(t('officerMeaning'))}</td><td>${esc(t('officerRole'))}</td></tr>
        </tbody></table></div><p>${esc(t('roleExample'))}</p>
        <div class="w4-two-notes"><div><h4>${esc(t('scopeTitle'))}</h4><p>${esc(t('scopeText'))}</p></div><div><h4>${esc(t('deadlineTitle'))}</h4><p>${esc(t('deadlineText'))}</p></div></div>
      </section>
      <section id="w4-s3" class="article-section prose"><h2>${esc(t('s3'))}</h2><p class="section-intro">${esc(t('s3Intro'))}</p>
        <ol class="w4-setup">${[1,2,3,4].map(i=>`<li><span class="w4-setup-no">0${i}</span><div><h3>${esc(t(`setup${i}Title`))}</h3><p>${esc(t(`setup${i}`))}</p></div></li>`).join('')}</ol>
      </section>
      <section id="w4-s4" class="article-section prose"><h2>${esc(t('s4'))}</h2><p class="section-intro">${esc(t('s4Intro'))}</p>
        <div class="w4-demo"><div class="w4-tabs" role="tablist" aria-label="${esc(t('nav4'))}">${Array.from({length:7},(_,i)=>`<button type="button" id="w4-tab-${i}" role="tab" data-w4-step="${i}" aria-controls="w4-demo-stage" aria-selected="${i===currentStep}" tabindex="${i===currentStep?0:-1}"><span>0${i+1}</span>${esc(t(`route${i+1}`))}</button>`).join('')}</div><div id="w4-demo-stage" role="tabpanel" aria-labelledby="w4-tab-${currentStep}"></div></div>
      </section>
      <section id="w4-s5" class="article-section prose"><h2>${esc(t('s5'))}</h2><p class="section-intro">${esc(t('s5Intro'))}</p><ol>${[1,2,3].map(i=>`<li>${esc(t(`fresh${i}`))}</li>`).join('')}</ol>
        <div id="w4-check-panel" class="w4-check-panel">${checklist()}</div>
      </section>
      <section id="w4-s6" class="article-section prose"><h2>${esc(t('s6'))}</h2><p class="section-intro">${esc(t('s6Intro'))}</p>
        ${simulatedRevision()}
      </section>
      <section id="w4-s7" class="article-section prose"><h2>${esc(t('s7'))}</h2><p class="section-intro">${esc(t('s7Intro'))}</p><div class="table-wrap w4-scenarios"><table><thead><tr>${[1,2,3].map(i=>`<th>${esc(t(`scenarioHead${i}`))}</th>`).join('')}</tr></thead><tbody>${[1,2,3,4].map(i=>`<tr><td>${esc(t(`scenario${i}a`))}</td><td>${esc(t(`scenario${i}b`))}</td><td>${esc(t(`scenario${i}c`))}</td></tr>`).join('')}</tbody></table></div><p class="w4-small">${external(sources.r4,'Kingston · '+t('scenario1a'))} · ${external(sources.r3,'PF Group · 2022 · pp. 17, 30')}</p><div class="callout"><p>${esc(t('homework'))}</p></div></section>
      <section id="w4-s8" class="article-section prose"><h2>${esc(t('s8'))}</h2><p class="section-intro">${esc(t('materialsIntro'))}</p><div class="w4-actions">${download('week4-learner-pack.zip','downloadPack',true)}</div>
      </section><footer class="footer">${esc(t('footer'))}</footer><div id="w4-copy-status" class="sr-only" role="status" aria-live="polite"></div>`;
    document.querySelectorAll('[data-w4-nav-label]').forEach(el => {el.textContent=t(el.dataset.w4NavLabel);});
    document.querySelectorAll('[data-w4-rail]').forEach(el => {
      const key=el.dataset.w4Rail;
      el[key==='railTitle'?'innerHTML':'textContent']=t(key);
    });
    renderStep();
  }
  async function copyText(button) {
    const value = data.payload[button.dataset.w4Copy];
    if (typeof value !== 'string') return;
    let success=false;
    try { await navigator.clipboard.writeText(value); success=true; } catch {
      const area=document.createElement('textarea');
      area.value=value; area.style.cssText='position:fixed;left:-10000px;top:0;';
      document.body.appendChild(area); area.focus(); area.select();
      try {success=document.execCommand('copy');} catch {}
      area.remove();button.focus({preventScroll:true});
    }
    button.textContent=success?t('copied'):t('copyFallback');
    const status=document.getElementById('w4-copy-status');
    if(status) status.textContent=button.textContent;
    clearTimeout(copyTimer);
    copyTimer=setTimeout(()=>{if(button.isConnected)button.textContent=t('copy');},2200);
  }
  panel.addEventListener('click',event=>{
    const step=event.target.closest('[data-w4-step]');
    if(step){currentStep=Number(step.dataset.w4Step);renderStep();return;}
    const copy=event.target.closest('[data-w4-copy]');
    if(copy){void copyText(copy);return;}
    if(event.target.closest('[data-w4-prev]')){currentStep=Math.max(0,currentStep-1);renderStep(true);}
    if(event.target.closest('[data-w4-next]')){currentStep=Math.min(6,currentStep+1);renderStep(true);}
    if(event.target.closest('[data-w4-reset]')){checked.clear();try{localStorage.removeItem(checkKey);}catch{};document.getElementById('w4-check-panel').innerHTML=checklist();}
  });
  panel.addEventListener('change',event=>{
    if(!event.target.matches('[data-w4-check]'))return;
    const n=Number(event.target.dataset.w4Check);
    event.target.checked?checked.add(n):checked.delete(n);
    try{localStorage.setItem(checkKey,JSON.stringify([...checked]));}catch{}
    document.getElementById('w4-check-count').textContent=`${checked.size} / 6`;
  });
  panel.addEventListener('keydown',event=>{
    if(!event.target.matches('[data-w4-step]'))return;
    const actions={ArrowRight:()=>Math.min(6,currentStep+1),ArrowLeft:()=>Math.max(0,currentStep-1),Home:()=>0,End:()=>6};
    if(!actions[event.key])return;
    event.preventDefault();currentStep=actions[event.key]();renderStep();document.getElementById(`w4-tab-${currentStep}`).focus();
  });
  window.Week4Lesson={render};
})();
