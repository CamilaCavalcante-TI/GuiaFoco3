const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const defaultData = {
  responsavel: "Camila",
  child: { nome: "Ana", idade: 7, serie: "2º ano", tempoEstimado: 4.5, limite: 150, inicio: "18:00", fim: "21:00", prefs: ["Memória","Puzzle"], intervencao: true, intervencaoMin: 20, bloqueio: true }
};

let data = JSON.parse(localStorage.getItem("guiafocoData") || "null") || defaultData;

function save(){ localStorage.setItem("guiafocoData", JSON.stringify(data)); }
function toast(msg){ const el=$("#toast"); el.textContent=msg; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2500); }
function formatHours(v){ return String(v).replace(".", ",") + " h/dia"; }
function formatMinutes(min){ return `${Math.floor(min/60)}h${String(min%60).padStart(2,"0")}`; }

function renderProfile(){
  $("#responsavelLabel").textContent=data.responsavel;
  $("#avatar").textContent=(data.responsavel||"C").charAt(0).toUpperCase();
  $("#childLabel").textContent=data.child.nome;
  $("#profileChildName").textContent=data.child.nome;
  $("#profileChildMeta").textContent=`${data.child.idade} anos · ${data.child.serie}`;
  $("#challengeChildName").textContent=data.child.nome;
  $("#detailAge").textContent=`${data.child.idade} anos`;
  $("#detailSeries").textContent=data.child.serie;
  $("#detailEstimated").textContent=formatHours(data.child.tempoEstimado);
  $("#detailLimit").textContent=formatMinutes(data.child.limite);
  $("#detailSchedule").textContent=`${data.child.inicio}–${data.child.fim}`;
  $("#detailPrefs").textContent=data.child.prefs.join(" · ");
  $("#settingIntervention").checked=data.child.intervencao;
  $("#settingMinutes").value=data.child.intervencaoMin;
  $("#settingBlock").checked=data.child.bloqueio;
  $("#settingSchedule").textContent=`${data.child.inicio}–${data.child.fim}`;
}

const pageNames={dashboard:"Visão geral",crianca:"Perfil da criança",desempenho:"Desempenho",tempo:"Tempo de tela",desafios:"Microdesafios",config:"Configurações"};

function showPage(name){
  $$(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${name}`));
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
  $("#pageTitle").textContent=pageNames[name]||"GuiaFoco";
  if(innerWidth<=780) $("#sidebar").classList.remove("open");
}

function openApp(){
  $("#loginScreen").classList.add("hidden");
  $("#registerScreen").classList.add("hidden");
  $("#appScreen").classList.remove("hidden");
  renderProfile();
  showPage("dashboard");
}

$("#showRegister").addEventListener("click",()=>{$("#loginScreen").classList.add("hidden");$("#registerScreen").classList.remove("hidden")});
$("#backToLogin").addEventListener("click",()=>{$("#registerScreen").classList.add("hidden");$("#loginScreen").classList.remove("hidden")});

$("#loginForm").addEventListener("submit",(e)=>{e.preventDefault();data.responsavel=$("#loginEmail").value.split("@")[0]||"Responsável";save();openApp();toast("Login realizado com sucesso!");});
$("#demoLogin").addEventListener("click",()=>{data=JSON.parse(JSON.stringify(defaultData));save();openApp();toast("Modo demonstração iniciado.");});
$("#logoutBtn").addEventListener("click",()=>{$("#appScreen").classList.add("hidden");$("#loginScreen").classList.remove("hidden");toast("Sessão encerrada.");});

$("#registerForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  data.responsavel=$("#responsavelNome").value.trim()||"Responsável";
  data.child={
    nome:$("#criancaNome").value.trim()||"Criança", idade:Number($("#criancaIdade").value), serie:$("#criancaSerie").value,
    tempoEstimado:Number($("#tempoEstimado").value), limite:Number($("#limiteDiario").value),
    inicio:$("#inicioPermitido").value, fim:$("#fimPermitido").value,
    prefs:$$('input[name="pref"]:checked').map(x=>x.value),
    intervencao:$("#ativarIntervencao").checked, intervencaoMin:Number($("#intervencaoMin").value),
    bloqueio:$("#ativarBloqueio").checked
  };
  save();openApp();toast("Perfil criado! Bem-vindo ao GuiaFoco.");
});

$$(".nav-item").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.page)));
$$("[data-page-jump]").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.pageJump)));
$("#menuBtn").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));

function setDark(on){document.body.classList.toggle("dark",on);$("#accessDark").checked=on;localStorage.setItem("guiaDark",on?"1":"0")}
function setContrast(on){document.body.classList.toggle("contrast",on);$("#accessContrast").checked=on;localStorage.setItem("guiaContrast",on?"1":"0")}
$("#darkBtn").addEventListener("click",()=>setDark(!document.body.classList.contains("dark")));
$("#contrastBtn").addEventListener("click",()=>setContrast(!document.body.classList.contains("contrast")));
$("#accessDark").addEventListener("change",e=>setDark(e.target.checked));
$("#accessContrast").addEventListener("change",e=>setContrast(e.target.checked));

let fontScale=Number(localStorage.getItem("guiaFontScale")||1);
function renderFont(){document.documentElement.style.setProperty("--font-scale",fontScale);$("#fontValue").textContent=Math.round(fontScale*100)+"%";localStorage.setItem("guiaFontScale",fontScale)}
$("#fontUp").addEventListener("click",()=>{fontScale=Math.min(1.25,fontScale+.05);renderFont()});
$("#fontDown").addEventListener("click",()=>{fontScale=Math.max(.9,fontScale-.05);renderFont()});
renderFont();
setDark(localStorage.getItem("guiaDark")==="1");
setContrast(localStorage.getItem("guiaContrast")==="1");

$("#simulateIntervention").addEventListener("click",()=>openModal());
function openModal(){$("#interventionModal").classList.remove("hidden")}
function closeModal(){$("#interventionModal").classList.add("hidden")}
$("#modalClose").addEventListener("click",()=>{closeModal();toast("Sessão encerrada.");});
$("#modalChallenge").addEventListener("click",()=>{closeModal();showPage("desafios");startChallenge();});

$("#settingIntervention").addEventListener("change",e=>{data.child.intervencao=e.target.checked;save();toast("Configuração atualizada.")});
$("#settingMinutes").addEventListener("change",e=>{data.child.intervencaoMin=Number(e.target.value);save();toast("Tempo de intervenção atualizado.")});
$("#settingBlock").addEventListener("change",e=>{data.child.bloqueio=e.target.checked;save();toast("Configuração de bloqueio atualizada.")});

function startChallenge(){
  $("#challengeArea").classList.remove("hidden");
  $("#challengeResult").classList.add("hidden");
  $("#challengeArea").scrollIntoView({behavior:"smooth",block:"center"});
}
$("#startChallenge").addEventListener("click",startChallenge);

$$(".answers button").forEach(btn=>btn.addEventListener("click",()=>{
  const result=$("#challengeResult"); result.classList.remove("hidden");
  const correct=btn.dataset.answer==="BOLA";
  result.className=`result-box ${correct?"success":"error"}`;
  result.textContent=correct ? "🎉 Muito bem! Resposta correta. +15 pontos." : "💡 Quase! Vamos tentar outra vez. Observe a letra B.";
  toast(correct?"Desafio concluído!":"Tente novamente.");
}));

// Simulação simples de contador da sessão. Não bloqueia o dispositivo real.
let seconds=18*60+32;
setInterval(()=>{
  seconds++;
  const m=Math.floor(seconds/60), s=seconds%60;
  $("#sessionTimer").textContent=`${m}:${String(s).padStart(2,"0")}`;
},1000);
