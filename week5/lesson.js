/* Local textbook renderer; no AI requests are made by this page. */
(() => {
  'use strict';
  const data=window.WEEK5_DATA, panel=document.getElementById('week5Panel');
  if(!data||!panel)return;
  let language='zh-CN', comparisonIndex=0;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const t=k=>data.copy[language]?.[k]||data.copy['zh-CN'][k]||k;
  const e=k=>esc(t(k));
  const p=(k,cls='')=>`<p class="${cls}">${e(k)}</p>`;
  const h=k=>`<h3>${e(k)}</h3>`;
  const ext=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
  const head=(n,min)=>`<div class="w5-section-head"><h2>${e(`s${n}`)}</h2><span class="w5-time">${min} ${e('minutes')}</span></div>`;
  const download=(file,key)=>`<a class="w5-button w5-secondary" href="week5/${esc(file)}" download>${e(key)} ↓</a>`;
  const detail=(title,body)=>`<details class="w5-explain"><summary>${e(title)}</summary><div>${body}</div></details>`;
  const table=(headers,rows,cls='')=>`<div class="table-wrap w5-table ${cls}"><table><thead><tr>${headers.map(k=>`<th scope="col">${e(k)}</th>`).join('')}</tr></thead><tbody>${rows.map(c=>`<tr><th scope="row">${e(c[0])}</th>${c.slice(1).map(k=>`<td>${e(k)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const vendorTable=()=>`<div class="table-wrap w5-table w5-model-table"><table><thead><tr><th scope="col">${e('vendorHead')}</th><th scope="col">${e('familyHead')}</th><th scope="col">${e('modelHead')}</th></tr></thead><tbody>${[
    ['https://developers.openai.com/api/docs/models','OpenAI','ChatGPT / GPT',t('openaiModels')],
    ['https://platform.claude.com/docs/en/models/overview','Anthropic','Claude',t('anthropicModels')],
    ['https://ai.google.dev/gemini-api/docs/models','Google','Gemini',t('googleModels')],
    ['https://docs.x.ai/developers/models','xAI','Grok','Grok 4.6'],
    ['https://api-docs.deepseek.com/updates/','DeepSeek','DeepSeek','V4.1-Flash'],
    ['https://huggingface.co/Qwen/Qwen3.8-27B',t('alibaba'),t('qwen'),'Qwen3.8-Max / Qwen3.8-27B'],
    ['https://platform.kimi.ai/docs/models','Moonshot AI','Kimi','Kimi K3']
  ].map(([url,vendor,family,model])=>`<tr><th scope="row">${ext(url,vendor)}</th><td>${esc(family)}</td><td>${esc(model)}</td></tr>`).join('')}</tbody></table></div>`;
  function renderComparison(){
    const items=data.comparison[language], item=items[comparisonIndex];
    panel.querySelectorAll('[data-w5-comparison]').forEach((button,index)=>{
      const active=index===comparisonIndex;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-selected',String(active));
      button.tabIndex=active?0:-1;
    });
    const stage=panel.querySelector('#w5-comparison-stage');
    stage.setAttribute('aria-labelledby',`w5-comparison-tab-${comparisonIndex}`);
    const checks=item.checks.length?`<ul>${item.checks.map(check=>`<li>${esc(check)}</li>`).join('')}</ul>`:'';
    const referenceTable=item.columns.length?`<div class="table-wrap w5-table w5-comparison-table"><table><thead><tr>${item.columns.map(column=>`<th scope="col">${esc(column)}</th>`).join('')}</tr></thead><tbody>${item.rows.map(row=>`<tr><th scope="row">${esc(row[0])}</th>${row.slice(1).map(cell=>`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
    stage.innerHTML=`<div class="w5-code"><div class="w5-codebar"><span>${e('compareInput')}</span><button type="button" class="w5-copy" data-w5-copy-question>${e('compareCopy')}</button></div><pre tabindex="0">${esc(item.prompt)}</pre></div><p class="w5-copy-status" role="status" aria-live="polite"></p>
      <details class="w5-explain"><summary>${e('compareReference')}</summary><div><p class="w5-comparison-answer${item.id==='password'?' w5-password-answer':''}">${esc(item.answer)}</p><p>${esc(item.explanation)}</p>${checks}${referenceTable}<p class="w5-example">${esc(item.note)}</p></div></details>`;
  }
  const longPrompt=index=>(index===0?data.experiments.common+'\n\n':'')+data.experiments.rounds[index].question;
  function longExercise(index){
    const item=data.experiments.rounds[index];
    return `<div class="w5-long-round" id="w5-long-round-${index+1}">${h(index===0?'longStep2':'longStep3')}${p(index===0?'longFirstHint':'longFollowHint')}
      <div class="w5-code"><div class="w5-codebar"><span>${e('rawInputLanguage')}</span><button type="button" class="w5-copy" data-w5-copy-long="${index}">${e('copyQuestion')}</button></div><pre lang="zh-CN" tabindex="0">${esc(longPrompt(index))}</pre></div><p class="w5-copy-status" role="status" aria-live="polite"></p>
      <details class="w5-answer"><summary>${e(index===0?'longFirstAnswer':'longFollowAnswer')}</summary><div class="w5-answer-content">${p('rawLanguage','w5-original-note')}<div class="table-wrap w5-table w5-ground-table"><table><thead><tr>${['groundHead1','groundHead2','groundHead3'].map(key=>`<th scope="col">${e(key)}</th>`).join('')}</tr></thead><tbody>${item.checks.map(([label,value,page])=>`<tr><th scope="row" lang="zh-CN">${esc(label)}</th><td lang="zh-CN">${esc(value)}</td><td><a href="week5/materials/${esc(data.experiments.files.single.filename)}#page=1" target="_blank" rel="noopener noreferrer" aria-label="${e('sourcePageLabel')} ${page}">${page}</a></td></tr>`).join('')}</tbody></table></div></div></details></div>`;
  }
  function render(lang){
    language=data.copy[lang]?lang:'zh-CN';
    panel.innerHTML=`
      <section class="hero w5-hero"><div class="hero-grid"><div>${p('eyebrow','eyebrow')}<h1>${t('title')}</h1>${p('lead','hero-lead')}</div><div class="hero-note"><strong>${e('goal')}</strong>${p('goalText')}<span class="w5-duration">${e('duration')}</span></div></div></section>
      <section id="w5-s1" class="article-section prose">${head(1,5)}${p('s1Intro','section-intro')}
        ${h('openTitle')}${p('openIntro')}${table(['openH1','openH2','openH3'],[1,2,4,3].map(i=>[`open${i}a`,`open${i}b`,`open${i}c`]))}${p('openNote')}
        ${h('modalityTitle')}<div class="w5-mechanism">${p('textPath')}${p('visionPath')}</div>${p('modalityBody')}${p('modalityExample','w5-example')}${p('modalityNote')}
        ${h('fastTitle')}${p('fastNote')}<blockquote>${e('fastQuestion')}</blockquote>${p('fastBody')}${p('fastCost')}<div class="callout"><div class="callout-label">${e('fastExampleTitle')}</div>${p('fastExample')}</div>
        <div class="w5-model-compare" aria-labelledby="w5-comparison-title"><h4 id="w5-comparison-title">${e('compareTitle')}</h4>${p('compareIntro')}${p('compareSetup','w5-small')}<div class="w5-demo"><div class="w5-tabs w5-ladder-tabs" role="tablist" aria-label="${e('compareTitle')}">${data.comparison[language].map((item,index)=>`<button type="button" id="w5-comparison-tab-${index}" data-w5-comparison="${index}" role="tab" aria-controls="w5-comparison-stage">${esc(item.title)}</button>`).join('')}</div><div id="w5-comparison-stage" class="w5-input-stage" role="tabpanel" tabindex="0"></div></div><blockquote>${e('compareConclusion')}</blockquote></div>
        ${detail('modelTitle',p('modelDate','w5-small')+vendorTable()+p('productNote'))}
      </section>
      <section id="w5-s2" class="article-section prose">${head(2,2)}${p('s2Intro','section-intro')}<div class="w5-mechanism">${p('thinkFlow')}</div>${p('thinkBody')}${h('thinkControls')}${table(['thinkH1','thinkH2'],[1,2,3].map(i=>[`think${i}a`,`think${i}b`]),'w5-choice-table')}
        ${p('thinkExample')}${detail('paramTitle',table(['paramHead1','paramHead2','paramHead3'],[1,2,3,4,5].map(i=>[`param${i}Name`,`param${i}Meaning`,`param${i}Effect`]))+p('paramNote','w5-small'))}
      </section>
      <section id="w5-s3" class="article-section prose">${head(3,3)}${p('s3Intro','section-intro')}<figure class="w5-desk"><figcaption>${e('deskLabel')}</figcaption><img class="w5-desk-art" src="week5/assets/context-desk.png" alt="${e('deskImageAlt')}" width="1774" height="887" loading="lazy" decoding="async"><div class="w5-desk-comparison"><div><strong>${e('deskWholeTitle')}</strong>${p('deskWholeText')}</div><div><strong>${e('deskSelectedTitle')}</strong>${p('deskSelectedText')}</div></div><div class="w5-desk-legend">${[1,2,3].map(i=>`<span><b class="w5-number">0${i}</b> ${e(`desk${i}`)}</span>`).join('')}</div>${p('deskQuote')}</figure>${p('contextWhy')}
        <ol class="w5-try-list">${[1,2,3].map(i=>`<li><span class="w5-number">0${i}</span><div><strong>${e(`context${i}Title`)}</strong>${p(`context${i}`)}</div></li>`).join('')}</ol>
        ${h('contextGuideTitle')}${p('contextGuideBody')}
      </section>
      <section id="w5-s4" class="article-section prose">${head(4,4)}${p('s4Intro','section-intro')}${p('longStory')}
        ${h('longStep1')}${p('longSetup')}<div class="w5-file-pair"><div class="w5-file-card"><strong>${e('longFileTitle')}</strong>${p('longFileSize','w5-file-size')}${p('longFileHint')}${download('materials/'+data.experiments.files.long.filename,'downloadLongPdf')}</div><div class="w5-file-card"><strong>${e('singleFileTitle')}</strong>${p('singleFileSize','w5-file-size')}${p('singleFileHint')}${download('materials/'+data.experiments.files.single.filename,'downloadSinglePdf')}</div></div>${p('longCropNote','w5-small')}<p class="w5-small w5-citation">${ext('https://ntrs.nasa.gov/citations/20030066167','NASA NTRS · 20030066167')}</p>
        ${longExercise(0)}${longExercise(1)}${h('longStep4')}${p('longScore')}<blockquote>${e('longResult')}</blockquote>
      </section>
      <section id="w5-s5" class="article-section prose">${head(5,1)}${table(['chooseHead1','chooseHead2'],[1,2,3,4,5].map(i=>[`choose${i}Situation`,`choose${i}Action`]),'w5-choice-table')}<div class="callout"><div class="callout-label">${e('closingLabel')}</div>${p('closing')}</div><div class="w5-actions">${download('week5-materials-and-prompts.zip','downloadDemo')}</div>${p('downloadLanguage','w5-small')}
      </section>`;
    renderComparison();
    document.querySelectorAll('[data-w5-nav-label]').forEach(node=>{node.textContent=t(node.dataset.w5NavLabel);});
  }
  async function copyInput(button,input,status,successKey='compareCopySuccess',fallbackKey='compareCopyFallback'){
    let copied=false;
    try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(input);copied=true;}}catch{}
    if(!copied){
      const field=document.createElement('textarea');
      field.value=input;field.readOnly=true;field.style.cssText='position:fixed;top:0;left:-9999px;';
      document.body.appendChild(field);field.select();
      try{copied=document.execCommand('copy');}catch{}
      field.remove();button.focus({preventScroll:true});
    }
    if(!copied&&status.isConnected){
      let field=status.parentElement.querySelector('.w5-manual-copy');
      if(!field){field=document.createElement('textarea');field.className='w5-manual-copy';field.readOnly=true;field.rows=8;field.setAttribute('aria-label',t(fallbackKey));status.insertAdjacentElement('afterend',field);}
      field.value=input;field.focus();field.select();
    }
    if(status.isConnected)status.textContent=t(copied?successKey:fallbackKey);
    if(copied&&button.isConnected){const label=button.textContent;button.textContent=t('compareCopied');setTimeout(()=>{if(button.isConnected)button.textContent=label;},2200);}
  }
  panel.addEventListener('click',async event=>{
    const tab=event.target.closest('[data-w5-comparison]');
    if(tab){comparisonIndex=Number(tab.dataset.w5Comparison);renderComparison();return;}
    const longCopy=event.target.closest('[data-w5-copy-long]');
    if(longCopy){
      await copyInput(longCopy,longPrompt(Number(longCopy.dataset.w5CopyLong)),longCopy.closest('.w5-code').nextElementSibling);return;
    }
    const button=event.target.closest('[data-w5-copy-question]');
    if(button)await copyInput(button,data.comparison[language][comparisonIndex].prompt,button.closest('.w5-code').nextElementSibling);
  });
  panel.addEventListener('keydown',event=>{
    const tab=event.target.closest('[data-w5-comparison]');
    if(!tab||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    event.preventDefault();
    const count=data.comparison[language].length;
    comparisonIndex=event.key==='Home'?0:event.key==='End'?count-1:(comparisonIndex+(['ArrowRight','ArrowDown'].includes(event.key)?1:count-1))%count;
    renderComparison();panel.querySelector(`#w5-comparison-tab-${comparisonIndex}`).focus();
  });
  window.Week5Lesson={render};
})();
