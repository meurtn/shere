import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore, collection, doc, setDoc, deleteDoc,
  onSnapshot, addDoc, query, orderBy, limit, getDocs, writeBatch
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// CONSTANTEN
const CFG_KEY  = 'shere_fb_cfg_v1';
const DARK_KEY = 'shere_dark';
const COLORS   = ['#3d6af3','#e05c2a','#1e9e60','#9b59b6','#d93025','#0097a7','#f39c12','#e91e63','#607d8b','#795548'];

// Snelle startset voor items en categorieen (bovenaan picker getoond)
const QUICK_EMOJIS     = ['📦','🔧','🔩','🪚','⚙️','🔨','🪛','⚡','🌿','🍴','✂️','🪣','🧰','💡','🔑','🧲','📐','🪜','🔌','🚗'];
const QUICK_CAT_EMOJIS = ['📦','⚡','🌱','🏗️','🔧','🚗','🧹','💧','🔥','🛠️','🪟','🧰','🔌','🌡️','⛏️'];

// Volledige emoji-set per categorie (WhatsApp-stijl)
const EMOJI_CATS = [
  { icon:'⭐', name:'Snel',      emojis: QUICK_EMOJIS },
  { icon:'😀', name:'Smileys',   emojis:['😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😋','😛','😝','😜','🤪','😎','🤩','🥳','😏','😒','😞','😔','😟','😕','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕','😈','👿','👻','💀','🤖','🎃','😺','😸','😹','😻','😼','😽','🙀','😿','😾'] },
  { icon:'👋', name:'Mensen',    emojis:['👋','🤚','✋','🖖','👌','✌️','🤞','👍','👎','✊','👊','👏','🙌','🤝','🙏','💪','👀','👅','👄','👶','🧒','👦','👧','🧑','👨','👩','🧓','👴','👵','🎅','🤶','👮','💂','👷','👸','🤴','🧙','🦸','🦹','💏','💑','👪'] },
  { icon:'🐶', name:'Dieren',    emojis:['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🦆','🦅','🦉','🦇','🐺','🐴','🦄','🐝','🦋','🐛','🐌','🐞','🐜','🦟','🕷️','🦂','🐢','🐍','🦎','🐙','🦑','🦐','🦀','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🐘','🦛','🐪','🦒','🐃','🐄','🐎','🐖','🐑','🐐','🐕','🐈','🐓','🦃','🦚','🦜','🐇','🦝','🦨','🦥','🐿️','🦔','🌿','🌺','🌸','🌼','🌻','🌹','🍀','🌱','🌲','🌳','🌴','🌵','🍃','🍂','🍁','🍄','🌾','💐','🌷'] },
  { icon:'🍕', name:'Eten',      emojis:['🍕','🍔','🍟','🌭','🍿','🥓','🥚','🍳','🥞','🧇','🍞','🥐','🥖','🧀','🥗','🥙','🥪','🌮','🌯','🥫','🍱','🍙','🍚','🍛','🍜','🍝','🍢','🍣','🍤','🍥','🍡','🥟','🥡','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🍫','🍬','🍭','🍮','🍯','🍷','🍸','🍹','🧃','🥤','🧋','☕','🍵','🍺','🍻','🥂','🍾','🍽️','🥄','🍴'] },
  { icon:'🏠', name:'Huis',      emojis:['🏠','🏡','🏢','🏥','🏦','🏨','🏪','🏫','🏬','🏭','🏯','🏰','🗼','🌋','🏕️','🏖️','🏜️','🏝️','🏟️','🏛️','🏗️','🪑','🛋️','🛏️','🚪','🪞','🪟','🧴','🧹','🧺','🧻','🪣','🧼','🧽','🧯','🛒','🚿','🛁','🪠','🔦','💡','🕯️','🛠️','🔧','🔨','⚒️','🪓','⛏️','🪚','🔩','🪛','🔗','🧰','🗑️','🪤','🧲','🔑','🗝️','🔒','🔓','📦','📫','✏️','📝','📖','📚','📊','📈','📉','📁','📂'] },
  { icon:'🚗', name:'Vervoer',   emojis:['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🚚','🚛','🚜','🛻','🚲','🛵','🏍️','🚨','🚃','🚋','🚞','🚝','🚄','🚅','🚇','🚉','✈️','🛫','🛬','🛩️','💺','🚁','🪂','🛸','🚀','🛶','⛵','🚤','🛥️','🚢','⚓','🪝','⛽','🚧','🚦','🚥','🗺️','🧭','🏁','🚩'] },
  { icon:'⚽', name:'Sport',     emojis:['⚽','🏀','🏈','⚾','🥎','🏐','🏉','🎾','🥏','🎳','🏏','🏑','🏒','🥍','🏓','🏸','🥊','🥋','🎽','⛳','🎿','🛷','🥌','🏆','🥇','🥈','🥉','🏅','🎖️','🏋️','🤸','🏄','🏊','🚣','🚵','🚴','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🎷','🎺','🎸','🎻','🎲','♟️','🎯','🎱','🎮','🕹️','🎰'] },
  { icon:'💡', name:'Objecten',  emojis:['💡','🔋','🔌','📱','💻','🖥️','🖨️','⌨️','🖱️','📷','📸','📹','🎥','📞','☎️','📺','📻','🧭','⏱️','⏲️','⏰','🕰️','⌚','📡','🔭','🔬','🩺','💊','🩻','🩹','🧬','🧪','🧲','💰','💵','💸','💳','🪙','📧','📦','✂️','📌','📍','🔖','🏷️','🔑','🗝️','🔒','🔓','🧳','☂️','💼','👜','👝','🎒','🧵','🧶','🪡','🧷'] },
  { icon:'🔢', name:'Symbolen',  emojis:['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','✨','🌟','⭐','🌈','🔥','💫','💥','🎉','🎊','🎈','🎀','🎁','🏮','🔮','🧿','🪬','🧸','🪆','🪅','💤','🔔','🔕','🎵','🎶','🎼','🔊','📢','📣','🔉','🔈','🔇','📯','💢','💬','💭','💯','✅','❌','❎','🟢','🔴','🔵','🟡','🟠','🟣','⚫','⚪','🟤','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔲','🔳'] },
];

// STATE
let db=null, DB={tools:[],members:[],categories:[],history:[]};
let _syncColor='yellow', _syncLabel='Verbinden...';
let selectedCategory='all', editingToolId=null, editingMemberId=null, editingCatId=null;
let detailToolId=null, detailSelMember=null;
let photoData=null, memberPhotoData=null;
let selectedEmoji='📦', selectedColor=COLORS[0], selectedCatEmoji='📦', toolHolderSel=null;
let _emojiTarget='tool', _emojiCatIdx=0;

// DARK MODE
function applyDark(on) {
  document.body.classList.toggle('dark-mode',on);
  document.getElementById('darkToggleBtn').textContent=on?'☀️':'🌙';
  document.getElementById('themeColor').content=on?'#0d1021':'#f0f2f8';
}
window.toggleDarkMode=function(){const on=!document.body.classList.contains('dark-mode');localStorage.setItem(DARK_KEY,on?'1':'0');applyDark(on);};
applyDark(localStorage.getItem(DARK_KEY)==='1');

// FIREBASE
function getSavedCfg(){try{return JSON.parse(localStorage.getItem(CFG_KEY));}catch{return null;}}

// SETUP AUTOFILL
window.autofillFromAuthDomain=function(){
  const val=document.getElementById('cfg_authDomain').value.trim();
  const match=val.match(/^([a-zA-Z0-9_-]+)\.firebaseapp\.com$/);
  if(match){
    const pid=match[1];
    document.getElementById('cfg_projectId').value=pid;
    document.getElementById('cfg_storageBucket').value=pid+'.firebasestorage.app';
  }else{
    document.getElementById('cfg_projectId').value='';
    document.getElementById('cfg_storageBucket').value='';
  }
};

window.saveFirebaseConfig=function(){
  const cfg={
    apiKey:document.getElementById('cfg_apiKey').value.trim(),
    authDomain:document.getElementById('cfg_authDomain').value.trim(),
    projectId:document.getElementById('cfg_projectId').value.trim(),
    storageBucket:document.getElementById('cfg_storageBucket').value.trim(),
    messagingSenderId:document.getElementById('cfg_messagingSenderId').value.trim(),
    appId:document.getElementById('cfg_appId').value.trim(),
  };
  if(!cfg.apiKey||!cfg.projectId){alert('Vul minimaal apiKey en projectId in');return;}
  localStorage.setItem(CFG_KEY,JSON.stringify(cfg));
  document.getElementById('setupScreen').classList.add('hidden');
  document.getElementById('loadingOverlay').classList.remove('hidden');
  connectFirebase(cfg);
};

function connectFirebase(cfg){
  try{
    setLoadTxt('Verbinden met Firebase...');
    const app=initializeApp(cfg);
    db=getFirestore(app);
    setSyncStatus('yellow','Synchroniseren...');
    listenAll();
  }catch(e){setLoadTxt('Fout: '+e.message);}
}

function listenAll(){
  const loaded={tools:false,members:false,categories:false,history:false};
  function tryReveal(){if(Object.values(loaded).every(Boolean)){hideLoading();setSyncStatus('green','Verbonden');}}
  onSnapshot(collection(db,'tools'),snap=>{DB.tools=snap.docs.map(d=>({id:d.id,...d.data()}));loaded.tools=true;tryReveal();refreshActive(['tools','members']);if(detailToolId)refreshDetailIfOpen();});
  onSnapshot(collection(db,'members'),snap=>{DB.members=snap.docs.map(d=>({id:d.id,...d.data()}));loaded.members=true;tryReveal();refreshActive(['tools','members']);});
  onSnapshot(collection(db,'categories'),snap=>{DB.categories=snap.docs.map(d=>({id:d.id,...d.data()}));if(!DB.categories.length)seedCats();loaded.categories=true;tryReveal();refreshActive(['tools','settings']);});
  onSnapshot(query(collection(db,'history'),orderBy('date','desc'),limit(200)),snap=>{DB.history=snap.docs.map(d=>({id:d.id,...d.data()}));loaded.history=true;tryReveal();refreshActive(['history']);});
}
async function seedCats(){
  await setDoc(doc(db,'categories','power'),{name:'Gereedschap',icon:'⚡'});
  await setDoc(doc(db,'categories','garden'),{name:'Tuin',icon:'🌱'});
}
function refreshActive(views){
  const active=document.querySelector('.view.active')?.id.replace('view-','');
  if(!views.includes(active))return;
  ({tools:renderTools,members:renderMembers,history:renderHistory,settings:renderSettings})[active]?.();
}

// VIEWS
window.switchView=function(name,el){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  if(el)el.classList.add('active');
  ({tools:renderTools,members:renderMembers,history:renderHistory,settings:renderSettings})[name]?.();
};

// TOOLS
function renderCatChips(){
  const sortedCats=[...DB.categories].sort((a,b)=>a.name.localeCompare(b.name,'nl'));
  document.getElementById('categoryChips').innerHTML=
    [{id:'all',name:'Alles',icon:'📦'},...sortedCats].map(c=>{
      const isAlles=c.id==='all';
      const isActive=selectedCategory===c.id;
      const classes=['cat-chip',isActive?'active':'',isAlles?'alles':''].filter(Boolean).join(' ');
      return `<div class="${classes}" onclick="setCategory('${c.id}')"><span>${c.icon}</span><span class="chip-label">${c.name}</span></div>`;
    }).join('');
}
window.setCategory=function(id){
  selectedCategory=id;
  renderTools();
};

function renderTools(){
  if(!db)return;
  renderCatChips();
  const q=(document.getElementById('searchInput').value||'').toLowerCase();
  let tools=[...DB.tools];
  if(selectedCategory!=='all')tools=tools.filter(t=>t.category===selectedCategory);
  if(q)tools=tools.filter(t=>(t.name+' '+(t.notes||'')).toLowerCase().includes(q));
  tools.sort((a,b)=>a.name.localeCompare(b.name,'nl'));
  const catName=selectedCategory==='all'?'Totaal':(DB.categories.find(c=>c.id===selectedCategory)?.name||'items');
  document.getElementById('toolCountBar').innerHTML=
    `<div class="tool-count-pill"><span class="tool-count-num">${tools.length}</span>&nbsp;${catName}</div>`;
  const el=document.getElementById('toolsList');
  if(!tools.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon">🧰</div><div class="empty-title">Geen items gevonden</div><div class="empty-text">Tik op + om het eerste item toe te voegen</div></div>`;return;}
  el.innerHTML=tools.map(toolCard).join('');
}

function memberAvatarHTML(m,size='sm'){
  if(!m)return`<div class="member-avatar-${size}" style="background:var(--bg4);color:var(--text3)">?</div>`;
  const inner=m.photo?`<img src="${m.photo}">`:`<span>${m.name[0]}</span>`;
  return`<div class="member-avatar-${size}" style="background:${m.color}22;color:${m.color}">${inner}</div>`;
}

function toolCard(tool){
  const m=tool.holder?DB.members.find(x=>x.id===tool.holder):null;
  const cat=DB.categories.find(c=>c.id===tool.category);
  return`<div class="tool-card" onclick="openDetail('${tool.id}')">
    <div class="tool-photo">${tool.photo?`<img src="${tool.photo}">`:(tool.emoji||'📦')}</div>
    <div class="tool-info">
      <div class="tool-name">${tool.name}</div>
      <div class="tool-cat">${cat?cat.icon+' '+cat.name:''}</div>
    </div>
    <div class="tool-member-right">
      ${memberAvatarHTML(m,'sm')}
      <div class="member-name-small">${m?m.name:'-'}</div>
    </div>
  </div>`;
}

// TOOL TOEVOEGEN/WIJZIGEN
window.openAddToolSheet=function(){
  if(!db){showToast('Nog niet verbonden');return;}
  editingToolId=null;photoData=null;selectedEmoji='📦';toolHolderSel=null;
  document.getElementById('sheetToolTitle').textContent='Item toevoegen';
  document.getElementById('toolNameInput').value='';
  document.getElementById('toolNotesInput').value='';
  document.getElementById('photoPreview').style.display='none';
  document.getElementById('removeToolPhotoBtn').style.display='none';
  document.getElementById('toolEmojiDisplay').textContent='📦';
  populateCatSelect();renderToolHolderPicker(null);
  openSheet('sheetTool');
};
window.editCurrentTool=function(){openEditTool(detailToolId);};
function openEditTool(id){
  const t=DB.tools.find(x=>x.id===id);if(!t)return;
  editingToolId=id;photoData=t.photo||null;selectedEmoji=t.emoji||'📦';toolHolderSel=t.holder||null;
  document.getElementById('sheetToolTitle').textContent='Item wijzigen';
  document.getElementById('toolNameInput').value=t.name;
  document.getElementById('toolNotesInput').value=t.notes||'';
  document.getElementById('toolEmojiDisplay').textContent=selectedEmoji;
  const prev=document.getElementById('photoPreview');
  if(t.photo){prev.src=t.photo;prev.style.display='block';document.getElementById('removeToolPhotoBtn').style.display='block';}
  else{prev.style.display='none';document.getElementById('removeToolPhotoBtn').style.display='none';}
  populateCatSelect(t.category);renderToolHolderPicker(t.holder);
  closeAllSheets();setTimeout(()=>openSheet('sheetTool'),120);
}
function renderToolHolderPicker(cur){
  toolHolderSel=cur;
  document.getElementById('toolHolderPicker').innerHTML=DB.members.map(m=>
    `<div class="member-option ${toolHolderSel===m.id?'selected':''}" data-hid="${m.id}" onclick="pickToolHolder('${m.id}')">
      ${memberAvatarHTML(m,'lg')}
      <div class="member-name-opt">${m.name}</div>
    </div>`
  ).join('');
}
window.pickToolHolder=function(id){
  toolHolderSel=id;
  document.querySelectorAll('#toolHolderPicker .member-option').forEach(el=>el.classList.toggle('selected',el.dataset.hid===id));
};
function populateCatSelect(sel){
  document.getElementById('toolCatInput').innerHTML=DB.categories.map(c=>
    `<option value="${c.id}" ${c.id===sel?'selected':''}>${c.icon} ${c.name}</option>`).join('');
}

window.saveTool=async function(){
  const name=document.getElementById('toolNameInput').value.trim();
  if(!name){showToast('Voer een naam in');return;}
  // Houder is verplicht bij nieuw item
  if(!editingToolId&&!toolHolderSel){
    const picker=document.getElementById('toolHolderPicker');
    const msg=document.getElementById('holderRequiredMsg');
    picker.classList.add('holder-picker-error');
    msg.classList.add('show');
    picker.scrollIntoView({behavior:'smooth',block:'center'});
    setTimeout(()=>picker.classList.remove('holder-picker-error'),400);
    return;
  }
  // Verberg foutmelding als al getoond
  document.getElementById('holderRequiredMsg')?.classList.remove('show');
  const data={
    name,
    category:document.getElementById('toolCatInput').value,
    emoji:selectedEmoji,
    photo:photoData||'',
    notes:document.getElementById('toolNotesInput').value.trim(),
  };
  try{
    setSyncStatus('yellow','Opslaan...');
    if(editingToolId){
      await setDoc(doc(db,'tools',editingToolId),data,{merge:true});
      if(toolHolderSel!==null)await setDoc(doc(db,'tools',editingToolId),{holder:toolHolderSel},{merge:true});
      showToast('Item bijgewerkt');
    }else{
      const entry={who:toolHolderSel,action:'checked out',date:Date.now()};
      await addDoc(collection(db,'tools'),{...data,holder:toolHolderSel,history:[entry],createdAt:Date.now()});
      await addDoc(collection(db,'history'),{toolId:'new',toolName:name,...entry});
      showToast('Item toegevoegd!');
      setTimeout(playConfetti,200);
    }
    closeAllSheets();
  }catch(e){showToast('Fout: '+e.message);setSyncStatus('red','Fout');}
};
window.removeToolPhoto=function(){photoData=null;document.getElementById('photoPreview').style.display='none';document.getElementById('removeToolPhotoBtn').style.display='none';};
window.deleteCurrentTool=async function(){
  if(!detailToolId)return;
  const t=DB.tools.find(x=>x.id===detailToolId);
  if(!confirm(`"${t?.name}" definitief verwijderen?`))return;
  try{await deleteDoc(doc(db,'tools',detailToolId));closeAllSheets();showToast('Item verwijderd');}
  catch(e){showToast('Fout: '+e.message);}
};

// TOOL DETAIL
window.openDetail=function(id){
  const t=DB.tools.find(x=>x.id===id);if(!t)return;
  detailToolId=id;detailSelMember=t.holder;drawDetailSheet(t);openSheet('sheetDetail');
};
function refreshDetailIfOpen(){
  if(document.getElementById('sheetDetail').classList.contains('open')&&detailToolId){
    const t=DB.tools.find(x=>x.id===detailToolId);
    if(t){detailSelMember=t.holder;drawDetailSheet(t);}
  }
}
function drawDetailSheet(t){
  const cat=DB.categories.find(c=>c.id===t.category);
  const heroEl=document.getElementById('detailHero');
  if(t.photo){
    const safeUrl=t.photo.replace(/'/g,"\\'");
    heroEl.innerHTML=`<img src="${t.photo}" onclick="openLightbox('${safeUrl}')">`;
  }else{
    heroEl.innerHTML=t.emoji||'📦';
  }
  document.getElementById('detailName').textContent=t.name;
  document.getElementById('detailCat').textContent=cat?cat.icon+' '+cat.name:'';
  const notesEl=document.getElementById('detailNotes');
  if(t.notes&&t.notes.trim()){
    notesEl.textContent=t.notes;
    notesEl.style.fontStyle='normal';
    notesEl.style.color='';
  }else{
    notesEl.textContent='Geen notities.';
    notesEl.style.fontStyle='italic';
    notesEl.style.color='var(--text3)';
  }
  document.getElementById('detailMemberGrid').innerHTML=DB.members.map(m=>
    `<div class="member-option ${detailSelMember===m.id?'selected':''}" data-mid="${m.id}" onclick="selectMember('${m.id}')">
      ${memberAvatarHTML(m,'lg')}
      <div class="member-name-opt">${m.name}</div>
    </div>`
  ).join('');
  const hist=[...(t.history||[])].reverse().slice(0,8);
  document.getElementById('detailHistory').innerHTML=hist.length
    ?hist.map(h=>{const mem=DB.members.find(m=>m.id===h.who);return`<div class="history-item"><div class="history-icon">${h.action==='checked out'?'➡️':'⬅️'}</div><div class="history-text"><div class="history-action">naar ${mem?mem.name:'Onbekend'}</div><div class="history-date">${fmtDate(h.date)}</div></div></div>`;}).join('')
    :'<div style="color:var(--text3);font-size:13px;font-weight:500">Nog geen geschiedenis</div>';
}
window.selectMember=function(id){
  detailSelMember=id;
  document.querySelectorAll('#detailMemberGrid .member-option').forEach(el=>el.classList.toggle('selected',el.dataset.mid===id));
};
window.confirmCheckout=async function(){
  const t=DB.tools.find(x=>x.id===detailToolId);if(!t)return;
  if(detailSelMember===t.holder){closeAllSheets();return;}
  const action=detailSelMember?'checked out':'returned';
  const who=detailSelMember||t.holder;
  const entry={who,action,date:Date.now()};
  try{
    setSyncStatus('yellow','Opslaan...');
    await setDoc(doc(db,'tools',detailToolId),{holder:detailSelMember,history:[...(t.history||[]),entry]},{merge:true});
    await addDoc(collection(db,'history'),{toolId:detailToolId,toolName:t.name,...entry});
    const mem=DB.members.find(m=>m.id===who);
    showToast(detailSelMember?`${t.name} - naar ${mem?.name}`:`${t.name} teruggegeven`);
    closeAllSheets();
  }catch(e){showToast('Fout: '+e.message);}
};

// FAMILIE (weergave alleen - beheer via Instellingen)
function renderMembers(){
  const el=document.getElementById('membersList');
  if(!DB.members.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon">👥</div><div class="empty-title">Nog geen leden</div><div class="empty-text">Voeg familieleden toe via Instellingen</div></div>`;return;}
  const members=[...DB.members].sort((a,b)=>a.name.localeCompare(b.name,'nl'));
  el.innerHTML=`<div class="members-grid">`+members.map(m=>{
    const cnt=DB.tools.filter(t=>t.holder===m.id).length;
    const inner=m.photo?`<img src="${m.photo}">`:`<span>${m.name[0]}</span>`;
    return`<div class="member-card" onclick="showMemberTools('${m.id}')">
      <div class="member-card-avatar" style="background:${m.color}22;color:${m.color}">${inner}</div>
      <div class="member-card-name">${m.name}</div>
      <div class="member-card-count">${cnt} item${cnt!==1?'s':''} in bezit</div>
    </div>`;
  }).join('')+'</div>';
}

// Member edit/add (aangeroepen vanuit Instellingen)
window.openAddMemberSheet=function(){
  editingMemberId=null;memberPhotoData=null;
  document.getElementById('sheetMemberTitle').textContent='Lid toevoegen';
  document.getElementById('memberNameInput').value='';
  document.getElementById('memberPhotoPreview').style.display='none';
  const ic=document.getElementById('avatarUploadIcon');ic.style.display='flex';
  document.getElementById('deleteMemberBtn').style.display='none';
  document.getElementById('removeMemberPhotoBtn').style.display='none';
  selectedColor=COLORS[0];renderColorPicker();
  openSheet('sheetMember');
};
function openEditMember(id){
  const m=DB.members.find(x=>x.id===id);if(!m)return;
  editingMemberId=id;memberPhotoData=m.photo||null;
  document.getElementById('sheetMemberTitle').textContent='Lid wijzigen';
  document.getElementById('memberNameInput').value=m.name;
  document.getElementById('deleteMemberBtn').style.display='block';
  const prev=document.getElementById('memberPhotoPreview');
  if(m.photo){
    prev.src=m.photo;prev.style.display='block';
    document.getElementById('avatarUploadIcon').style.display='none';
    document.getElementById('removeMemberPhotoBtn').style.display='block';
  }else{
    prev.style.display='none';
    document.getElementById('avatarUploadIcon').style.display='flex';
    document.getElementById('removeMemberPhotoBtn').style.display='none';
  }
  selectedColor=m.color||COLORS[0];renderColorPicker();
  openSheet('sheetMember');
}
window.openEditMember=openEditMember;
function renderColorPicker(){
  document.getElementById('colorPicker').innerHTML=COLORS.map(c=>
    `<div class="tag ${c===selectedColor?'selected':''}" onclick="pickColor('${c}')" style="background:${c}22;border-color:${c===selectedColor?c:'transparent'};color:${c};font-weight:700">${c===selectedColor?'✓':'&nbsp;'}</div>`
  ).join('');
}
window.pickColor=function(c){selectedColor=c;renderColorPicker();};
window.removeMemberPhoto=function(){memberPhotoData=null;document.getElementById('memberPhotoPreview').style.display='none';document.getElementById('avatarUploadIcon').style.display='flex';document.getElementById('removeMemberPhotoBtn').style.display='none';};
window.saveMember=async function(){
  const name=document.getElementById('memberNameInput').value.trim();
  if(!name){showToast('Voer een naam in');return;}
  const data={name,color:selectedColor,photo:memberPhotoData===null?'':memberPhotoData};
  try{
    if(editingMemberId){await setDoc(doc(db,'members',editingMemberId),data,{merge:true});showToast('Lid bijgewerkt');}
    else{await addDoc(collection(db,'members'),data);showToast(name+' toegevoegd!');}
    closeAllSheets();
    setTimeout(()=>renderSettings(),200);
  }catch(e){showToast('Fout: '+e.message);}
};
window.deleteMember=async function(){
  if(!editingMemberId)return;
  const m=DB.members.find(x=>x.id===editingMemberId);
  const cnt=DB.tools.filter(t=>t.holder===editingMemberId).length;
  if(cnt>0){showToast(`${m.name} heeft nog ${cnt} item(s)`);return;}
  if(!confirm(`${m.name} verwijderen?`))return;
  try{await deleteDoc(doc(db,'members',editingMemberId));closeAllSheets();showToast('Lid verwijderd');setTimeout(()=>renderSettings(),200);}
  catch(e){showToast('Fout: '+e.message);}
};
window.showMemberTools=function(mid){
  const m=DB.members.find(x=>x.id===mid);
  const tools=[...DB.tools.filter(t=>t.holder===mid)].sort((a,b)=>a.name.localeCompare(b.name,'nl'));
  if(!tools.length){showToast(`${m.name} heeft geen items`);return;}
  selectedCategory='all';document.getElementById('searchInput').value='';
  switchView('tools',document.querySelector('.nav-item'));
  renderCatChips();
  document.getElementById('toolCountBar').innerHTML=`<div class="tool-count-pill"><span class="tool-count-num">${tools.length}</span>&nbsp;items van ${m.name}</div>`;
  document.getElementById('toolsList').innerHTML=tools.map(toolCard).join('');
};

// LOGBOEK
function renderHistory(){
  const el=document.getElementById('historyList');
  if(!DB.history.length){el.innerHTML=`<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">Nog geen activiteit</div><div class="empty-text">Voeg een item toe om de geschiedenis te starten</div></div>`;return;}
  el.innerHTML=`<div class="section-title">Recente activiteit</div>`+DB.history.map(h=>{
    const mem=DB.members.find(m=>m.id===h.who);
    return`<div class="history-item"><div class="history-icon">${h.action==='checked out'?'➡️':'⬅️'}</div><div class="history-text"><div class="history-action"><strong>${h.toolName}</strong> - naar ${mem?mem.name:'Onbekend'}</div><div class="history-date">${fmtDate(h.date)}</div></div></div>`;
  }).join('');
}

// INSTELLINGEN - accordion
let _openSection=null;
window.toggleSection=function(id){
  const wasOpen=_openSection===id;
  // sluit alle secties
  document.querySelectorAll('.settings-section').forEach(s=>{
    s.classList.remove('sec-open');
    const body=s.querySelector('.collapsible-body');
    const arrow=s.querySelector('.collapsible-arrow');
    if(body)body.classList.remove('open');
    if(arrow)arrow.classList.remove('open');
  });
  _openSection=null;
  if(!wasOpen){
    const sec=document.getElementById('sec-'+id);
    if(sec){
      sec.classList.add('sec-open');
      const body=document.getElementById('body-'+id);
      const arrow=document.getElementById('arrow-'+id);
      if(body)body.classList.add('open');
      if(arrow)arrow.classList.add('open');
      _openSection=id;
    }
  }
};

function secHTML(id,title,bodyContent){
  return`<div class="settings-section" id="sec-${id}">
    <div class="collapsible-header" onclick="toggleSection('${id}')">
      <div class="settings-section-title">${title}</div>
      <span class="collapsible-arrow" id="arrow-${id}">›</span>
    </div>
    <div class="collapsible-body" id="body-${id}">
      ${bodyContent}
    </div>
  </div>`;
}

function renderSettings(){
  // Categorieeen sectie
  const catsHTML=`<div style="padding-top:6px">
    ${[...DB.categories].sort((a,b)=>a.name.localeCompare(b.name,'nl')).map(c=>`
      <div class="cat-manage-item">
        <div class="cat-icon">${c.icon}</div>
        <div class="cat-name">${c.name}</div>
        <div class="cat-action-btns">
          <button class="cat-action-btn cat-edit-btn" onclick="openEditCategory('${c.id}')">✏️</button>
          <button class="cat-action-btn cat-delete-btn" onclick="deleteCategory('${c.id}')">🗑️</button>
        </div>
      </div>`).join('')}
    <div style="margin-top:9px"><button class="btn btn-ghost" onclick="openAddCategorySheet()">+ Categorie toevoegen</button></div>
  </div>`;

  // Familie sectie
  const membersHTML=`<div style="padding-top:6px">
    ${[...DB.members].sort((a,b)=>a.name.localeCompare(b.name,'nl')).map(m=>{
      const inner=m.photo?`<img src="${m.photo}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;vertical-align:middle">`:m.name[0];
      return`<div class="cat-manage-item">
        <div class="cat-icon" style="font-size:14px;width:24px;height:24px;border-radius:50%;background:${m.color}22;color:${m.color};display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;overflow:hidden">${inner}</div>
        <div class="cat-name" style="color:${m.color}">${m.name}</div>
        <div class="cat-action-btns">
          <button class="cat-action-btn cat-edit-btn" onclick="openEditMember('${m.id}')">✏️</button>
          <button class="cat-action-btn cat-delete-btn" onclick="deleteMemberDirect('${m.id}')">🗑️</button>
        </div>
      </div>`;
    }).join('')}
    <div style="margin-top:9px"><button class="btn btn-ghost" onclick="openAddMemberSheet()">+ Familielid toevoegen</button></div>
  </div>`;

  // Data sectie
  const dataHTML=`<div style="padding-top:6px">
    <div class="settings-row" onclick="exportData()"><div class="settings-row-left"><div class="settings-row-icon">💾</div><div class="settings-row-text">Export backup (JSON)</div></div><div class="settings-row-chevron">›</div></div>
    <div class="settings-row" onclick="doClearHistory()"><div class="settings-row-left"><div class="settings-row-icon">🗑️</div><div class="settings-row-text">Geschiedenis wissen</div></div><div class="settings-row-chevron">›</div></div>
    <div class="settings-row" onclick="resetCfg()"><div class="settings-row-left"><div class="settings-row-icon">🔥</div><div class="settings-row-text">Firebase config wijzigen</div></div><div class="settings-row-chevron">›</div></div>
  </div>`;

  // App installeren sectie
  const installHTML=`<div style="padding-top:6px">
    <div class="settings-row"><div class="settings-row-left"><div class="settings-row-icon">🍎</div><div class="settings-row-text">iPhone - tik Delen - "Zet op beginscherm"</div></div></div>
    <div class="settings-row"><div class="settings-row-left"><div class="settings-row-icon">🤖</div><div class="settings-row-text">Android - tik op menu - "Toevoegen aan beginscherm"</div></div></div>
  </div>`;

  // Verbinding sectie
  const connHTML=`<div style="padding-top:6px">
    <div class="settings-row" id="syncStatusRow">
      <div class="settings-row-left">
        <div class="settings-row-icon"><span class="sync-dot ${_syncColor}" id="syncDotSettings" style="width:10px;height:10px;display:inline-block"></span></div>
        <div class="settings-row-text" id="syncTextSettings">${_syncLabel}</div>
      </div>
    </div>
  </div>`;

  // Over sectie
  const aboutHTML=`<div style="padding-top:6px">
    <div class="settings-row"><div class="settings-row-left"><div class="settings-row-icon">ℹ️</div><div class="settings-row-text">shere v1.0 - Saarloosjes</div></div></div>
  </div>`;

  // Logboek sectie
  const logboekHTML=`<div style="padding-top:6px">
    <div class="settings-row" onclick="openLogboekBeheer()"><div class="settings-row-left"><div class="settings-row-icon">📋</div><div class="settings-row-text">Beheer logboek</div></div><div class="settings-row-chevron">›</div></div>
  </div>`;

  document.getElementById('settingsList').innerHTML=
    secHTML('cats','Categorieen',catsHTML)+
    secHTML('familie','Familie',membersHTML)+
    secHTML('logboek','Logboek',logboekHTML)+
    secHTML('data','Data (alleen voor Maarten)',dataHTML)+
    secHTML('install','App installeren',installHTML)+
    secHTML('connect','Verbinding',connHTML)+
    secHTML('about','Over',aboutHTML);

  // herstel open sectie na re-render
  if(_openSection){
    const sec=document.getElementById('sec-'+_openSection);
    const body=document.getElementById('body-'+_openSection);
    const arrow=document.getElementById('arrow-'+_openSection);
    if(sec)sec.classList.add('sec-open');
    if(body)body.classList.add('open');
    if(arrow)arrow.classList.add('open');
  }
}

window.deleteMemberDirect=async function(id){
  const m=DB.members.find(x=>x.id===id);if(!m)return;
  const cnt=DB.tools.filter(t=>t.holder===id).length;
  if(cnt>0){showToast(`${m.name} heeft nog ${cnt} item(s)`);return;}
  if(!confirm(`${m.name} verwijderen?`))return;
  try{await deleteDoc(doc(db,'members',id));showToast('Lid verwijderd');}
  catch(e){showToast('Fout: '+e.message);}
};

window.openAddCategorySheet=function(){
  editingCatId=null;
  document.getElementById('sheetCatTitle').textContent='Categorie toevoegen';
  document.getElementById('catNameInput').value='';
  selectedCatEmoji='📦';
  document.getElementById('catEmojiDisplay').textContent='📦';
  openSheet('sheetCategory');
};
window.openEditCategory=function(id){
  const c=DB.categories.find(x=>x.id===id);if(!c)return;
  editingCatId=id;
  document.getElementById('sheetCatTitle').textContent='Categorie wijzigen';
  document.getElementById('catNameInput').value=c.name;
  selectedCatEmoji=c.icon||'📦';
  document.getElementById('catEmojiDisplay').textContent=selectedCatEmoji;
  openSheet('sheetCategory');
};
window.saveCategory=async function(){
  const name=document.getElementById('catNameInput').value.trim();
  if(!name){showToast('Voer een naam in');return;}
  try{
    if(editingCatId){await setDoc(doc(db,'categories',editingCatId),{name,icon:selectedCatEmoji},{merge:true});showToast('Categorie bijgewerkt');}
    else{const id=name.toLowerCase().replace(/\s+/g,'_')+'_'+Date.now();await setDoc(doc(db,'categories',id),{name,icon:selectedCatEmoji});showToast('Categorie toegevoegd');}
    closeAllSheets();
  }catch(e){showToast('Fout: '+e.message);}
};
window.deleteCategory=async function(id){
  if(DB.tools.some(t=>t.category===id)){showToast('Er zijn nog items gekoppeld aan deze categorie');return;}
  const c=DB.categories.find(x=>x.id===id);
  if(!confirm(`Categorie "${c?.name}" verwijderen?`))return;
  try{await deleteDoc(doc(db,'categories',id));showToast('Categorie verwijderd');}
  catch(e){showToast('Fout: '+e.message);}
};
window.exportData=function(){
  const b=new Blob([JSON.stringify(DB,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='shere-backup.json';a.click();
  showToast('Geexporteerd!');
};
window.doClearHistory=async function(){
  if(!confirm('Alle geschiedenis verwijderen? Dit kan niet ongedaan worden gemaakt.'))return;
  try{const batch=writeBatch(db);(await getDocs(collection(db,'history'))).forEach(d=>batch.delete(d.ref));await batch.commit();showToast('Geschiedenis gewist');}
  catch(e){showToast('Fout: '+e.message);}
};
window.resetCfg=function(){if(!confirm('Firebase config resetten? De app herlaadt.'))return;localStorage.removeItem(CFG_KEY);location.reload();};

// EMOJI PICKER (WhatsApp-stijl)
window.openEmojiPicker=function(target){
  _emojiTarget=target;
  _emojiCatIdx=0;
  renderEmojiPickerModal();
  document.getElementById('emojiModal').classList.add('open');
};
window.closeEmojiPicker=function(){
  document.getElementById('emojiModal').classList.remove('open');
};
function renderEmojiPickerModal(){
  const cats=EMOJI_CATS;
  document.getElementById('emojiPickerCats').innerHTML=cats.map((c,i)=>
    `<button class="emoji-cat-btn ${i===_emojiCatIdx?'active':''}" onclick="switchEmojiCat(${i})" title="${c.name}">${c.icon}</button>`
  ).join('');
  renderEmojiGrid();
}
window.switchEmojiCat=function(i){
  _emojiCatIdx=i;
  document.querySelectorAll('.emoji-cat-btn').forEach((b,j)=>b.classList.toggle('active',j===i));
  renderEmojiGrid();
};
function renderEmojiGrid(){
  const emojis=EMOJI_CATS[_emojiCatIdx].emojis;
  document.getElementById('emojiPickerGrid').innerHTML=emojis.map(e=>
    `<button class="emoji-btn" onclick="pickEmojiFromModal('${e}')">${e}</button>`
  ).join('');
  document.getElementById('emojiPickerGrid').scrollTop=0;
}
window.pickEmojiFromModal=function(e){
  if(_emojiTarget==='tool'){
    selectedEmoji=e;
    document.getElementById('toolEmojiDisplay').textContent=e;
  }else{
    selectedCatEmoji=e;
    document.getElementById('catEmojiDisplay').textContent=e;
  }
  closeEmojiPicker();
};

// ZOEKFUNCTIE
window.onSearchInput=function(){renderTools();};

// LIGHTBOX
window.openLightbox=function(src){
  document.getElementById('lightboxImg').src=src;
  document.getElementById('lightbox').classList.add('open');
};
window.closeLightbox=function(){
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightboxImg').src='';
};

// FOTO MET CROP
let _cropState={isTool:true,previewId:null,iconId:null};
let _cropSrc='';
let _crop={x:0,y:0,scale:1,vw:0,vh:0,iw:0,ih:0};
let _cropTouch={startDist:0,startScale:1,lastX:0,lastY:0,touching:false};

function loadPhotoFile(file,previewId,iconId,isTool){
  if(!file)return;
  _cropState={isTool,previewId,iconId};
  const reader=new FileReader();
  reader.onload=function(e){
    _cropSrc=e.target.result;
    const img=new Image();
    img.onload=function(){_crop.iw=img.naturalWidth;_crop.ih=img.naturalHeight;startCrop();};
    img.src=_cropSrc;
  };
  reader.readAsDataURL(file);
}

window.handlePhotoCamera=function(ev){loadPhotoFile(ev.target.files[0],'photoPreview',null,true);ev.target.value='';};
window.handlePhotoGallery=function(ev){loadPhotoFile(ev.target.files[0],'photoPreview',null,true);ev.target.value='';};
window.handleMemberPhotoCamera=function(ev){loadPhotoFile(ev.target.files[0],'memberPhotoPreview','avatarUploadIcon',false);ev.target.value='';};
window.handleMemberPhotoGallery=function(ev){loadPhotoFile(ev.target.files[0],'memberPhotoPreview','avatarUploadIcon',false);ev.target.value='';};

function startCrop(){
  document.getElementById('cropTitle').textContent=_cropState.isTool?'Foto bijsnijden':'Profielfoto bijsnijden';
  const vp=document.getElementById('cropViewport');
  vp.style.aspectRatio='1/1';
  vp.style.borderRadius=_cropState.isTool?'14px':'50%';
  vp.style.width='100%';
  document.getElementById('cropModal').classList.add('open');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    _crop.vw=vp.offsetWidth;_crop.vh=vp.offsetHeight||vp.offsetWidth;
    const scaleX=_crop.vw/_crop.iw,scaleY=_crop.vh/_crop.ih;
    _crop.scale=Math.max(scaleX,scaleY);
    _crop.x=(_crop.vw-_crop.iw*_crop.scale)/2;
    _crop.y=(_crop.vh-_crop.ih*_crop.scale)/2;
    const ci=document.getElementById('cropImg');
    ci.onload=null;ci.src=_cropSrc;
    ci.style.width=_crop.iw+'px';ci.style.height=_crop.ih+'px';
    ci.style.maxWidth='none';ci.style.maxHeight='none';
    applyCropTransform();setupCropEvents();
  }));
}
function applyCropTransform(){
  const ci=document.getElementById('cropImg');
  ci.style.transform=`translate(${_crop.x}px,${_crop.y}px) scale(${_crop.scale})`;
  ci.style.transformOrigin='0 0';
}
function clampCrop(){
  const minX=_crop.vw-_crop.iw*_crop.scale,minY=_crop.vh-_crop.ih*_crop.scale;
  _crop.x=Math.min(0,Math.max(minX,_crop.x));
  _crop.y=Math.min(0,Math.max(minY,_crop.y));
}
function setupCropEvents(){
  const old=document.getElementById('cropViewport');
  const fresh=old.cloneNode(true);
  fresh.appendChild(document.getElementById('cropImg'));
  old.parentNode.replaceChild(fresh,old);
  let dragging=false,lastMX=0,lastMY=0;
  fresh.addEventListener('mousedown',e=>{dragging=true;lastMX=e.clientX;lastMY=e.clientY;});
  fresh.addEventListener('mousemove',e=>{if(!dragging)return;_crop.x+=e.clientX-lastMX;_crop.y+=e.clientY-lastMY;lastMX=e.clientX;lastMY=e.clientY;clampCrop();applyCropTransform();});
  fresh.addEventListener('mouseup',()=>dragging=false);
  fresh.addEventListener('mouseleave',()=>dragging=false);
  let t1=null,t2=null;
  fresh.addEventListener('touchstart',e=>{
    e.preventDefault();
    if(e.touches.length===1){t1={x:e.touches[0].clientX,y:e.touches[0].clientY};_cropTouch.lastX=t1.x;_cropTouch.lastY=t1.y;}
    if(e.touches.length===2){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;_cropTouch.startDist=Math.sqrt(dx*dx+dy*dy);_cropTouch.startScale=_crop.scale;}
  },{passive:false});
  fresh.addEventListener('touchmove',e=>{
    e.preventDefault();
    if(e.touches.length===1){const dx=e.touches[0].clientX-_cropTouch.lastX,dy=e.touches[0].clientY-_cropTouch.lastY;_crop.x+=dx;_crop.y+=dy;_cropTouch.lastX=e.touches[0].clientX;_cropTouch.lastY=e.touches[0].clientY;clampCrop();applyCropTransform();}
    if(e.touches.length===2){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY;const dist=Math.sqrt(dx*dx+dy*dy);const newScale=_cropTouch.startScale*(dist/_cropTouch.startDist);_crop.scale=Math.max(Math.max(_crop.vw/_crop.iw,_crop.vh/_crop.ih),newScale);clampCrop();applyCropTransform();}
  },{passive:false});
  fresh.addEventListener('touchend',()=>{t1=null;t2=null;});
}
window.cancelCrop=function(){document.getElementById('cropModal').classList.remove('open');};
window.confirmCrop=function(){
  const ci=document.getElementById('cropImg');
  const canvas=document.createElement('canvas');
  const size=500;canvas.width=size;canvas.height=size;
  const ctx=canvas.getContext('2d');
  const sx=-_crop.x/_crop.scale,sy=-_crop.y/_crop.scale;
  const sw=_crop.vw/_crop.scale,sh=_crop.vh/_crop.scale;
  ctx.drawImage(ci,sx,sy,sw,sh,0,0,size,size);
  const dataUrl=canvas.toDataURL('image/jpeg',0.85);
  document.getElementById('cropModal').classList.remove('open');
  if(_cropState.isTool){
    photoData=dataUrl;
    const prev=document.getElementById(_cropState.previewId);
    prev.src=dataUrl;prev.style.display='block';
    document.getElementById('removeToolPhotoBtn').style.display='block';
  }else{
    memberPhotoData=dataUrl;
    const prev=document.getElementById(_cropState.previewId);
    prev.src=dataUrl;prev.style.display='block';
    const ic=document.getElementById(_cropState.iconId);
    if(ic)ic.style.display='none';
    document.getElementById('removeMemberPhotoBtn').style.display='block';
  }
};

// LOGBOEK BEHEER
let _editingHistoryId=null, _logEditWho=null, _logEditAction='checked out';

window.openLogboekBeheer=function(){
  renderLogboekBeheerList();
  openSheet('sheetLogboek');
};

function renderLogboekBeheerList(){
  const el=document.getElementById('logboekBeheerList');
  if(!DB.history.length){
    el.innerHTML='<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">Geen activiteit</div></div>';
    return;
  }
  el.innerHTML=DB.history.map(h=>{
    const mem=DB.members.find(m=>m.id===h.who);
    const icon=h.action==='checked out'?'➡️':'⬅️';
    const actLabel=h.action==='checked out'?'uitgeleend aan':'teruggegeven door';
    return`<div class="logboek-item">
      <div style="font-size:16px;margin-top:2px;flex-shrink:0">${icon}</div>
      <div class="logboek-item-text">
        <div class="logboek-item-name">${h.toolName}</div>
        <div class="logboek-item-meta">${actLabel} ${mem?mem.name:'Onbekend'} - ${fmtDate(h.date)}</div>
      </div>
      <div class="logboek-item-actions">
        <button class="cat-action-btn cat-edit-btn" onclick="openLogboekEdit('${h.id}')">✏️</button>
        <button class="cat-action-btn cat-delete-btn" onclick="deleteLogboekEntry('${h.id}')">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

window.deleteLogboekEntry=async function(id){
  if(!confirm('Deze activiteit verwijderen?'))return;
  try{
    await deleteDoc(doc(db,'history',id));
    showToast('Activiteit verwijderd');
    renderLogboekBeheerList();
  }catch(e){showToast('Fout: '+e.message);}
};

window.openLogboekEdit=function(id){
  const h=DB.history.find(x=>x.id===id);if(!h)return;
  _editingHistoryId=id;
  _logEditWho=h.who||null;
  _logEditAction=h.action||'checked out';

  document.getElementById('logEditToolName').textContent=h.toolName;

  // Actie picker
  const actions=[
    {val:'checked out',label:'➡️ Uitgeleend'},
    {val:'returned',   label:'⬅️ Teruggegeven'},
  ];
  document.getElementById('logEditActionPicker').innerHTML=actions.map(a=>
    `<div class="tag ${_logEditAction===a.val?'selected':''}" onclick="pickLogAction('${a.val}')">${a.label}</div>`
  ).join('');

  // Lid picker
  document.getElementById('logEditMemberPicker').innerHTML=DB.members.map(m=>
    `<div class="member-option ${_logEditWho===m.id?'selected':''}" data-mid="${m.id}" onclick="pickLogMember('${m.id}')">
      ${memberAvatarHTML(m,'lg')}
      <div class="member-name-opt">${m.name}</div>
    </div>`
  ).join('');

  // Open edit sheet on top (keep logboek sheet open underneath)
  document.getElementById('sheetLogboekEdit').classList.add('open');
};

window.closeLogboekEdit=function(){
  document.getElementById('sheetLogboekEdit').classList.remove('open');
};

window.pickLogAction=function(val){
  _logEditAction=val;
  document.querySelectorAll('#logEditActionPicker .tag').forEach(el=>
    el.classList.toggle('selected',el.textContent.includes(val==='checked out'?'Uitgeleend':'Teruggegeven'))
  );
};

window.pickLogMember=function(id){
  _logEditWho=id;
  document.querySelectorAll('#logEditMemberPicker .member-option').forEach(el=>
    el.classList.toggle('selected',el.dataset.mid===id)
  );
};

window.saveLogboekEdit=async function(){
  if(!_editingHistoryId)return;
  if(!_logEditWho){showToast('Selecteer een familielid');return;}
  try{
    await setDoc(doc(db,'history',_editingHistoryId),{
      who:_logEditWho,
      action:_logEditAction,
    },{merge:true});
    showToast('Activiteit bijgewerkt');
    closeLogboekEdit();
    // Refresh the list - DB update komt via onSnapshot
    setTimeout(renderLogboekBeheerList,400);
  }catch(e){showToast('Fout: '+e.message);}
};

// SHEETS
window.openSheet=function(id){document.getElementById('overlay').classList.add('open');document.getElementById(id).classList.add('open');};
window.closeAllSheets=function(){
  document.getElementById('overlay').classList.remove('open');
  document.querySelectorAll('.sheet').forEach(s=>s.classList.remove('open'));
  _editingHistoryId=null;
};

// UTILS
window.showToast=function(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2800);
};
function fmtDate(ts){
  if(!ts)return'';
  const d=new Date(ts),now=new Date();
  if(now.toDateString()===d.toDateString())return'Vandaag, '+d.toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'});
  const gist=new Date(now);gist.setDate(gist.getDate()-1);
  if(gist.toDateString()===d.toDateString())return'Gisteren, '+d.toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'});
  const diff=Math.floor((now-d)/86400000);
  if(diff<7)return diff+' dagen geleden';
  return d.toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'});
}
function setSyncStatus(c,t){
  _syncColor=c;_syncLabel=t;
  const d=document.getElementById('syncDot'),tx=document.getElementById('syncText');
  if(d){d.className='sync-dot '+c;tx.textContent=t;}
  const ds=document.getElementById('syncDotSettings'),ts=document.getElementById('syncTextSettings');
  if(ds){ds.className='sync-dot '+c;ts.textContent=t;}
}
function setLoadTxt(t){const el=document.getElementById('loadingText');if(el)el.textContent=t;}
function hideLoading(){const el=document.getElementById('loadingOverlay');el.classList.add('hidden');setTimeout(()=>el.style.display='none',400);renderTools();}

// CONFETTI ANIMATIE
function playConfetti(){
  const canvas=document.getElementById('confettiCanvas');
  const overlay=document.getElementById('confettiOverlay');
  canvas.style.display='block';
  overlay.classList.add('active');

  const confettiInstance=window.confetti.create(canvas,{resize:true,useWorker:false});

  // Eerste burst vanuit het midden
  confettiInstance({
    particleCount:120,
    spread:90,
    startVelocity:55,
    origin:{x:.5,y:.6},
    colors:['#3d6af3','#5577ff','#e05c2a','#1e9e60','#f39c12','#e91e63','#9b59b6'],
    zIndex:800,
  });

  // Tweede burst iets later vanuit de zijkanten
  setTimeout(()=>{
    confettiInstance({particleCount:60,angle:60,spread:70,origin:{x:0,y:.65},colors:['#3d6af3','#f39c12','#27c270'],zIndex:800});
    confettiInstance({particleCount:60,angle:120,spread:70,origin:{x:1,y:.65},colors:['#e91e63','#5577ff','#e05c2a'],zIndex:800});
  },200);

  // Fade out na 2.8s
  setTimeout(()=>{
    overlay.classList.remove('active');
    setTimeout(()=>{
      canvas.style.display='none';
      confettiInstance.reset();
    },350);
  },2800);
}

// OPSTARTEN
const saved=getSavedCfg();
if(saved&&saved.apiKey&&saved.projectId){connectFirebase(saved);}
else{
  document.getElementById('loadingOverlay').classList.add('hidden');
  setTimeout(()=>document.getElementById('loadingOverlay').style.display='none',400);
  document.getElementById('setupScreen').classList.remove('hidden');
}
document.addEventListener('touchmove',e=>{
  if(e.target.closest('.sheet-body,.tools-container,.categories-scroll,.setup-card,.emoji-grid,.emoji-cats'))return;
  e.preventDefault();
},{passive:false});
