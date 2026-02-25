import React from "react";
import "./style.css";

export default function App() {
  return (
    <div>
      <h1>Hello StackBlitz!</h1>
      <p>Start editing to see some magic happen :)</p>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import CryptoJS from 'crypto-js';

const SECRET_KEY='inovare-2026-secret-key-ultra-segura';
const MAX_TENTATIVAS_LOGIN=10;
const TEMPO_BLOQUEIO_LOGIN=15*60*1000;
const TIMEOUT_SESSAO=30*60*1000;

const criptografar=(texto)=>CryptoJS.AES.encrypt(texto,SECRET_KEY).toString();
const descriptografar=(textoCripto)=>{try{const bytes=CryptoJS.AES.decrypt(textoCripto,SECRET_KEY);return bytes.toString(CryptoJS.enc.Utf8);}catch{return null;}};
const hashSenha=(senha)=>CryptoJS.SHA256(senha+SECRET_KEY).toString();
const validarSenha=(senhaDigitada,senhaHash)=>hashSenha(senhaDigitada)===senhaHash;

const sanitizar=(texto)=>{if(typeof texto!=='string')return texto;return texto.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/\//g,'&#x2F;');};
const validarEmail=(email)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validarCPFCompleto=(cpf)=>{cpf=cpf.replace(/\D/g,'');if(cpf.length!==11||/^(\d)\1+$/.test(cpf))return false;let soma=0,resto;for(let i=1;i<=9;i++)soma+=parseInt(cpf.substring(i-1,i))*(11-i);resto=(soma*10)%11;if(resto===10||resto===11)resto=0;if(resto!==parseInt(cpf.substring(9,10)))return false;soma=0;for(let i=1;i<=10;i++)soma+=parseInt(cpf.substring(i-1,i))*(12-i);resto=(soma*10)%11;if(resto===10||resto===11)resto=0;if(resto!==parseInt(cpf.substring(10,11)))return false;return true;};

const DEFAULT_ADMINS=[
  {id:'ADM-001',role:'admin',nome:'Inovare Admin',email:'admin@inovare.com',senha:hashSenha('admin123'),foto:'',ativo:true,aceitouLGPD:true,dataAceiteLGPD:new Date().toISOString(),permissoes:{dashboard:true,editarAgendamentos:true,criarAgendamentos:true,gerenciarVistoriadores:true,gerenciarClientes:true,configuracoes:true,acessarLogs:true,exportarXLS:true}},
];

const DEFAULT_FILIAIS=[
  {id:1,nome:'Inovare Campinas',cidade:'Campinas',uf:'SP',endereco:'Av. Norte Sul, 1000',tel:'(19) 3333-3333',ativa:true},
  {id:2,nome:'Inovare Valinhos',cidade:'Valinhos',uf:'SP',endereco:'Rua Principal, 500',tel:'(19) 3444-4444',ativa:true},
  {id:3,nome:'Inovare Vinhedo',cidade:'Vinhedo',uf:'SP',endereco:'Av. Central, 200',tel:'(19) 3555-5555',ativa:true},
];

const DEFAULT_EMPRESAS=[
  {id:1,nome:'Dlange Imóveis',cnpj:'12.345.678/0001-90',tel:'(11) 3333-3333',email:'contato@dlange.com',endereco:'Rua Exemplo, 100 - São Paulo/SP',bloqueado:false,motivoBloqueio:'',logo:''},
  {id:2,nome:'Start Imobiliária',cnpj:'98.765.432/0001-10',tel:'(11) 4444-4444',email:'contato@start.com',endereco:'Av. Teste, 200 - São Paulo/SP',bloqueado:false,motivoBloqueio:'',logo:''},
];

const DEFAULT_CLIENTS=[
  {id:1,role:'client',nome:"Marlon Silva",email:"marlon@dlange.com",senha:hashSenha("123456"),tel:"(11) 99999-0001",empresaId:1,bloqueado:false,foto:'',aceitouLGPD:true,dataAceiteLGPD:new Date().toISOString()},
  {id:2,role:'client',nome:"Raquel Costa",email:"raquel@dlange.com",senha:hashSenha("123456"),tel:"(11) 99999-0002",empresaId:1,bloqueado:false,foto:'',aceitouLGPD:true,dataAceiteLGPD:new Date().toISOString()},
  {id:3,role:'client',nome:"Moisés Santos",email:"moises@dlange.com",senha:hashSenha("123456"),tel:"(11) 99999-0003",empresaId:1,bloqueado:false,foto:'',aceitouLGPD:true,dataAceiteLGPD:new Date().toISOString()},
  {id:4,role:'client',nome:"João Oliveira",email:"joao@start.com",senha:hashSenha("123456"),tel:"(11) 98888-0001",empresaId:2,bloqueado:false,foto:'',aceitouLGPD:true,dataAceiteLGPD:new Date().toISOString()},
  {id:5,role:'client',nome:"Maria Ferreira",email:"maria@start.com",senha:hashSenha("123456"),tel:"(11) 98888-0002",empresaId:2,bloqueado:false,foto:'',aceitouLGPD:true,dataAceiteLGPD:new Date().toISOString()},
  {id:6,role:'client',nome:"Julia Alves",email:"julia@start.com",senha:hashSenha("123456"),tel:"(11) 98888-0003",empresaId:2,bloqueado:false,foto:'',aceitouLGPD:true,dataAceiteLGPD:new Date().toISOString()},
];

const ad=(d)=>{const dt=new Date();dt.setDate(dt.getDate()+d);return dt.toISOString();};

const DEFAULT_INSPECTORS=[
  {id:'VST-001',nome:'Carlos Mendes',email:'carlos@inovare.com',senha:hashSenha('vst123'),tel:'(11) 91111-1111',rg:'12.345.678-9',cpf:'123.456.789-00',endereco:'Rua A, 100',dataNasc:'1985-05-15',filialId:1,filiaisAtendidas:[1,2],tiposAtendidos:['Vistoria de entrada','Vistoria de saída','Vistoria de rotina'],metragemMax:200,diasTrabalho:[1,2,3,4,5],horaInicio:'08:00',horaFim:'17:00',pausaAlmoco:{inicio:'12:00',fim:'13:00'},bloqueios:[],bloqueiosHorario:[],cor:'#00d4aa',foto:'',camposVisiveis:{valorVistoria:true,valorLocacao:true,codigoImovel:true,endereco:true,cep:true,localChaves:true,mobilia:true,nomeLocador:true,nomeLocatario:true,obs:true,nomeAcompanhante:true,contatoAcompanhante:true}},
  {id:'VST-002',nome:'Ana Ferreira',email:'ana@inovare.com',senha:hashSenha('vst123'),tel:'(11) 92222-2222',rg:'98.765.432-1',cpf:'987.654.321-00',endereco:'Rua B, 200',dataNasc:'1990-08-20',filialId:1,filiaisAtendidas:[1,3],tiposAtendidos:['Vistoria de entrada','Vistoria de saída','Revistoria de saída','Vistoria de constatação'],metragemMax:300,diasTrabalho:[1,2,3,4,5,6],horaInicio:'08:00',horaFim:'17:00',pausaAlmoco:{inicio:'12:00',fim:'13:00'},bloqueios:[],bloqueiosHorario:[],cor:'#a78bfa',foto:'',camposVisiveis:{valorVistoria:false,valorLocacao:false,codigoImovel:true,endereco:true,cep:true,localChaves:true,mobilia:true,nomeLocador:false,nomeLocatario:false,obs:true,nomeAcompanhante:true,contatoAcompanhante:true}},
];

const toMin=(s)=>{try{const[h,m]=s.split(':').map(Number);return h*60+m;}catch{return 0;}};
const toHHMM=(m)=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;

const gerarHorarios=(inicio,fim,intervalo,pausaInicio,pausaFim)=>{
  const slots=[];
  let current=toMin(inicio);
  const end=toMin(fim);
  const pInicio=pausaInicio?toMin(pausaInicio):null;
  const pFim=pausaFim?toMin(pausaFim):null;
  while(current<=end){
    if(pInicio!==null&&pFim!==null&&current>=pInicio&&current<pFim){current=pFim;continue;}
    if(current>end)break;
    slots.push(toHHMM(current));
    current+=intervalo;
  }
  return slots;
};

const HORARIOS_PADRAO=['08:15','10:30','13:30','16:00'];

const DEFAULT_AGS=[
  {id:"001",clienteId:1,empresaId:1,empresaNome:"Dlange Imóveis",clienteNome:"Marlon Silva",clienteTel:"(11) 99999-0001",tipo:"Vistoria de entrada",dataObj:ad(-30),hora:"08:15",filialId:1,endereco:"Rua das Flores, 123, Campinas/SP",cep:"13010-100",localChaves:"Portaria",obs:"",status:"atendido",m2:80,acompanhada:true,vistoriadorId:'VST-001',duracaoMin:110,nomeLocador:"Pedro Lima",nomeLocatario:"João Silva",valorLocacao:"R$ 2.500,00",valorVistoria:"R$ 350,00",mobilia:"mobiliado",nomeAcompanhante:"Carlos",contatoAcompanhante:"(11) 98888-8888",codigoImovel:"IM-001",pdfNome:"",pdfData:""},
  {id:"002",clienteId:4,empresaId:2,empresaNome:"Start Imobiliária",clienteNome:"João Oliveira",clienteTel:"(11) 98888-0001",tipo:"Vistoria de saída",dataObj:ad(-5),hora:"10:30",filialId:1,endereco:"Av. Paulista, 900, Campinas/SP",cep:"13020-200",localChaves:"Imobiliária",obs:"",status:"atendido",m2:120,acompanhada:false,vistoriadorId:'VST-002',duracaoMin:150,nomeLocador:"Ana Costa",nomeLocatario:"Maria Souza",valorLocacao:"R$ 3.200,00",valorVistoria:"R$ 420,00",mobilia:"semi_mobiliado",nomeAcompanhante:"",contatoAcompanhante:"",codigoImovel:"IM-002",pdfNome:"",pdfData:""},
  {id:"003",clienteId:2,empresaId:1,empresaNome:"Dlange Imóveis",clienteNome:"Raquel Costa",clienteTel:"(11) 99999-0002",tipo:"Vistoria de rotina",dataObj:ad(1),hora:"13:30",filialId:1,endereco:"Rua Augusta, 500, Valinhos/SP",cep:"13270-100",localChaves:"Com morador",obs:"Porteiro: Carlos",status:"agendado",m2:60,acompanhada:true,vistoriadorId:'VST-001',duracaoMin:90,nomeLocador:"Carlos Rua",nomeLocatario:"João Silva",valorLocacao:"R$ 1.800,00",valorVistoria:"R$ 280,00",mobilia:"sem_mobilia",nomeAcompanhante:"Carlos Silva",contatoAcompanhante:"(11) 97777-0001",codigoImovel:"IM-003",pdfNome:"",pdfData:""},
];

const DEFAULT_TIPOS=[
  {id:1,icon:'🏠',name:'Vistoria de entrada',desc:'Entrada do imóvel',ativo:true},
  {id:2,icon:'🔑',name:'Vistoria de saída',desc:'Devolução do imóvel',ativo:true},
  {id:3,icon:'🔄',name:'Revistoria de saída',desc:'Segunda vistoria de saída',ativo:true},
  {id:4,icon:'⚖️',name:'Vistoria de constatação',desc:'Fins jurídicos',ativo:true},
  {id:5,icon:'📋',name:'Vistoria de rotina',desc:'Revisão periódica',ativo:true},
  {id:6,icon:'🚁',name:'Imagens de drone',desc:'Fotografia aérea',ativo:true},
  {id:7,icon:'📌',name:'Instalação de placas',desc:'Instalação de sinalização',ativo:true},
];

const DEFAULT_CAMPOS_ORDEM=['m2','codigoImovel','endereco','cep','localChaves','mobilia','valorVistoria','valorLocacao','nomeLocador','nomeLocatario','nomeAcompanhante','contatoAcompanhante','obs'];

const DEFAULT_CONFIG={
  horaInicio:'08:00',horaFim:'17:00',intervaloMinutos:30,
  pausaAlmoco:{inicio:'12:00',fim:'13:00'},
  antecedenciaMinimaHoras:12,
  cancelamentoMinimoHoras:2,
  empresaNome:'Inovare Vistorias',empresaTel:'(11) 99999-9999',empresaEmail:'contato@inovare.com',
  logoInovare:'',
  minutosPorMetro:1,
  minutosDeslocamento:30,
  percentualSemiMobiliado:30,
  percentualMobiliado:50,
  camposOrdem:DEFAULT_CAMPOS_ORDEM,
  camposFormulario:{
    m2:{label:'Metragem (m²)',obrigatorio:true,ativo:true},
    codigoImovel:{label:'Código do Imóvel',obrigatorio:false,ativo:true},
    endereco:{label:'Endereço',obrigatorio:true,ativo:true},
    cep:{label:'CEP',obrigatorio:true,ativo:true},
    localChaves:{label:'Local das Chaves',obrigatorio:true,ativo:true},
    valorVistoria:{label:'Valor da Vistoria',obrigatorio:false,ativo:true},
    valorLocacao:{label:'Valor da Locação',obrigatorio:false,ativo:true},
    nomeLocador:{label:'Nome Locador',obrigatorio:false,ativo:true},
    nomeLocatario:{label:'Nome Locatário',obrigatorio:false,ativo:true},
    mobilia:{label:'Estado Mobília',obrigatorio:true,ativo:true},
    obs:{label:'Observações',obrigatorio:false,ativo:true},
    nomeAcompanhante:{label:'Nome Acompanhante',obrigatorio:false,ativo:true},
    contatoAcompanhante:{label:'Contato Acompanhante',obrigatorio:false,ativo:true},
  },
};

const DEFAULT_LOGS=[];

const store={};
const sGet=(k)=>store[k];
const sSet=(k,v)=>{store[k]=v;};

const fmtDate=(dt)=>{try{return new Date(dt).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'});}catch{return'—';}};
const fmtDateTime=(dt)=>{try{return new Date(dt).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});}catch{return'—';}};
const fmtDtLong=(dt)=>{try{return new Date(dt).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});}catch{return'—';}};
const fmtDur=(m)=>{const h=Math.floor(m/60),r=m%60;return h>0?(r>0?`${h}h ${r}min`:`${h}h`):`${r}min`;};

const calcDur=(m2,mobilia='sem_mobilia',config)=>{
  const cfg=config||sGet('config')||DEFAULT_CONFIG;
  const minPorMetro=cfg.minutosPorMetro||1;
  const minDesloc=cfg.minutosDeslocamento||30;
  const percSemi=cfg.percentualSemiMobiliado||30;
  const percMob=cfg.percentualMobiliado||50;
  let base=Math.max(30,parseInt(m2)||0)*minPorMetro+minDesloc;
  if(mobilia==='semi_mobiliado')base=Math.round(base*(1+percSemi/100));
  if(mobilia==='mobiliado')base=Math.round(base*(1+percMob/100));
  return base;
};

let idCounter=parseInt(localStorage.getItem('lastAgId')||'3');
const genID=()=>{idCounter++;localStorage.setItem('lastAgId',idCounter);return String(idCounter).padStart(3,'0');};
const genVID=()=>'VST-'+Math.random().toString(36).substring(2,5).toUpperCase();
const genADM=()=>'ADM-'+Math.random().toString(36).substring(2,5).toUpperCase();
const maskPhone=v=>{v=v.replace(/\D/g,'');return v.length>10?v.replace(/^(\d{2})(\d{5})(\d{4}).*/,'($1) $2-$3'):v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/,'($1) $2-$3');};
const maskCep=v=>{v=v.replace(/\D/g,'').substring(0,8);return v.length>5?v.substring(0,5)+'-'+v.substring(5):v;};
const maskCNPJ=v=>{v=v.replace(/\D/g,'').substring(0,14);return v.length>12?v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/,'$1.$2.$3/$4-$5'):v;};
const maskCPF=v=>{v=v.replace(/\D/g,'').substring(0,11);return v.length>9?v.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/,'$1.$2.$3-$4'):v;};
const maskRG=v=>{v=v.replace(/\D/g,'').substring(0,9);return v.length>8?v.replace(/^(\d{2})(\d{3})(\d{3})(\d{1}).*/,'$1.$2.$3-$4'):v;};
const maskValor=v=>{v=v.replace(/\D/g,'');if(!v)return'';const n=parseInt(v)/100;return'R$ '+n.toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');};
const isSameDay=(a,b)=>new Date(a).toDateString()===new Date(b).toDateString();
const dateStr=(dt)=>new Date(dt).toISOString().split('T')[0];
const startOfWeek=(dt)=>{const d=new Date(dt);d.setDate(d.getDate()-d.getDay());d.setHours(0,0,0,0);return d;};
const startOfMonth=(dt)=>{const d=new Date(dt);d.setDate(1);d.setHours(0,0,0,0);return d;};
const endOfMonth=(dt)=>{const d=new Date(dt.getFullYear(),dt.getMonth()+1,0);d.setHours(23,59,59,999);return d;};

const WEEK_DAYS=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
const WEEK_FULL=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const MONTHS=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MONTHS_SHORT=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const STATUS_CFG={
  agendado:{label:'📅 Agendado',bg:'rgba(0,153,255,.1)',c:'#0099ff',b:'rgba(0,153,255,.25)'},
  atendido:{label:'✓ Atendido',bg:'rgba(0,212,170,.1)',c:'#00d4aa',b:'rgba(0,212,170,.25)'},
  cancelado:{label:'✕ Cancelado',bg:'rgba(255,77,109,.1)',c:'#ff4d6d',b:'rgba(255,77,109,.25)'},
};

const addLog=(logs,setLogs,user,acao,detalhes,agId='')=>{
  const log={id:Date.now(),timestamp:new Date().toISOString(),usuario:user.nome,usuarioId:user.id,acao,detalhes,agendamentoId:agId,navegador:navigator.userAgent};
  const upd=[log,...logs];setLogs(upd);sSet('logs',upd);
};

const fazerBackup=()=>{
  const backup={timestamp:new Date().toISOString(),filiais:sGet('fil'),empresas:sGet('emp'),clients:sGet('cl'),inspectors:sGet('ins'),ags:sGet('ags'),tipos:sGet('tipos'),config:sGet('config'),logs:sGet('logs')};
  localStorage.setItem(`backup_${Date.now()}`,JSON.stringify(backup));
  const backups=Object.keys(localStorage).filter(k=>k.startsWith('backup_')).sort().reverse();
  backups.slice(5).forEach(k=>localStorage.removeItem(k));
};

const LogoDisplay=({height=40,maxWidth=120})=>{
  const logo=sGet('config')?.logoInovare;
  if(logo)return<img src={logo} alt="Logo" style={{maxHeight:height,maxWidth,objectFit:'contain'}}/>;
  return(<div style={{display:'flex',alignItems:'center',gap:6}}><div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#00d4aa,#0099ff)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,color:'#000'}}>IN</div><span style={{fontWeight:800,fontSize:15}}>inova<span style={{color:'#00d4aa'}}>re</span></span></div>);
};

const vistDispAleatorio=(inspectors,ags,date,horaInicio,duracaoMin,filialId,tipo,metragem)=>{
  if(!date||!horaInicio||!filialId||!tipo)return null;
  const ds=dateStr(date),dia=new Date(date).getDay(),ini=toMin(horaInicio),fim=ini+duracaoMin;
  const disponiveis=[];
  for(const v of inspectors){
    const checks={
      filial:v.filiaisAtendidas?.includes(filialId),
      tipo:v.tiposAtendidos?.includes(tipo),
      metragem:v.metragemMax?metragem<=v.metragemMax:true,
      diaTrabalho:v.diasTrabalho?.includes(dia),
      horario:toMin(v.horaInicio)<=ini&&toMin(v.horaFim)>=fim,
      bloqueado:!v.bloqueios?.some(b=>b.data===ds),
      bloqueadoHora:!v.bloqueiosHorario?.some(b=>b.data===ds&&toMin(b.horaInicio)<=ini&&toMin(b.horaFim)>=fim),
    };
    if(v.pausaAlmoco){
      const pInicio=toMin(v.pausaAlmoco.inicio),pFim=toMin(v.pausaAlmoco.fim);
      checks.pausaAlmoco=!((ini>=pInicio&&ini<pFim)||(fim>pInicio&&fim<=pFim)||(ini<=pInicio&&fim>=pFim));
    }else{checks.pausaAlmoco=true;}
    if(!Object.values(checks).every(Boolean))continue;
    const occ=ags.some(ag=>{
      if(ag.vistoriadorId!==v.id||ag.status==='cancelado'||dateStr(ag.dataObj)!==ds||!ag.hora||ag.hora==='A definir')return false;
      const ai=toMin(ag.hora),af=ai+(ag.duracaoMin||60);
      return ini<af&&fim>ai;
    });
    if(!occ)disponiveis.push(v);
  }
  if(disponiveis.length===0)return null;
  return disponiveis[Math.floor(Math.random()*disponiveis.length)];
};

const slotsDisp=(inspectors,ags,date,dur,filialId,tipo,metragem)=>{
  if(!date||!filialId||!tipo||!metragem)return[];
  const slots=HORARIOS_PADRAO.filter(h=>vistDispAleatorio(inspectors,ags,date,h,dur,filialId,tipo,metragem)!==null);
  return slots;
};

const C={bg:'#0a0c0f',surface:'#111418',card:'#161b22',border:'#222831',border2:'#2d3540',accent:'#00d4aa',accent2:'#0099ff',text:'#e8edf3',muted:'#7a8899',danger:'#ff4d6d',warn:'#f4c430'};
const S={
  app:{background:C.bg,minHeight:'100vh',color:C.text,fontFamily:"'Segoe UI',sans-serif",display:'flex'},
  inp:(err=false)=>({background:C.surface,border:`1.5px solid ${err?C.danger:C.border2}`,borderRadius:8,padding:'8px 10px',color:C.text,fontSize:13,outline:'none',width:'100%'}),
  lbl:{fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',marginBottom:4,display:'block'},
  btnP:(d=false)=>({padding:'8px 14px',borderRadius:8,background:d?'#1a2a25':'linear-gradient(135deg,#00d4aa,#0099ff)',color:d?C.muted:'#000',border:'none',cursor:d?'not-allowed':'pointer',fontWeight:700,fontSize:13}),
  btnG:{padding:'7px 12px',borderRadius:8,background:'transparent',color:C.muted,border:`1.5px solid ${C.border2}`,cursor:'pointer',fontWeight:600,fontSize:12},
  btnD:{padding:'6px 11px',borderRadius:8,background:'rgba(255,77,109,.1)',color:C.danger,border:`1.5px solid rgba(255,77,109,.25)`,cursor:'pointer',fontWeight:600,fontSize:12},
  btnW:{padding:'6px 11px',borderRadius:8,background:'rgba(244,196,48,.1)',color:C.warn,border:`1.5px solid rgba(244,196,48,.25)`,cursor:'pointer',fontWeight:600,fontSize:12},
};

const StatusChip=({status})=>{const m=STATUS_CFG[status]||{};return<span style={{fontSize:10,padding:'2px 7px',borderRadius:20,fontWeight:600,background:m.bg,color:m.c,border:`1px solid ${m.b}`,whiteSpace:'nowrap'}}>{m.label||status}</span>;};
const IDTag=({id})=><span style={{fontFamily:'monospace',fontSize:10,color:C.muted,background:C.surface,padding:'2px 6px',borderRadius:4,border:`1px solid ${C.border}`}}>{id}</span>;

const Modal=({title,message,icon,onConfirm,onCancel,confirmLabel='Confirmar',confirmColor=C.danger})=>(
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:16}}>
    <div style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:14,padding:22,maxWidth:360,width:'100%',textAlign:'center'}}>
      <div style={{fontSize:34,marginBottom:10}}>{icon}</div>
      <h3 style={{fontWeight:800,fontSize:16,marginBottom:7}}>{title}</h3>
      <p style={{color:C.muted,fontSize:12,marginBottom:18,lineHeight:1.6}}>{message}</p>
      <div style={{display:'flex',gap:7,justifyContent:'center'}}>
        <button style={S.btnG} onClick={onCancel}>Voltar</button>
        <button style={{padding:'8px 16px',borderRadius:8,background:confirmColor,color:'#000',border:'none',cursor:'pointer',fontWeight:700,fontSize:13}} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

const MiniCal=({selDate,onSelect,blockedDates=[],workDays=[1,2,3,4,5]})=>{
  const[calM,setCalM]=useState(new Date().getMonth());
  const[calY,setCalY]=useState(new Date().getFullYear());
  const today=new Date();today.setHours(0,0,0,0);
  const fd=new Date(calY,calM,1).getDay(),tot=new Date(calY,calM+1,0).getDate();
  const chg=d=>{let m=calM+d,y=calY;if(m>11){m=0;y++;}if(m<0){m=11;y--;}setCalM(m);setCalY(y);};
  return(<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
      <span style={{fontWeight:700,fontSize:12}}>{MONTHS_SHORT[calM]} {calY}</span>
      <div style={{display:'flex',gap:4}}>
        <button style={{width:24,height:24,borderRadius:6,background:C.surface,border:`1px solid ${C.border2}`,color:C.text,cursor:'pointer',fontSize:11}} onClick={()=>chg(-1)}>‹</button>
        <button style={{width:24,height:24,borderRadius:6,background:C.surface,border:`1px solid ${C.border2}`,color:C.text,cursor:'pointer',fontSize:11}} onClick={()=>chg(1)}>›</button>
      </div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
      {WEEK_DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:9,fontWeight:600,color:C.muted,padding:'3px 0'}}>{d}</div>)}
      {Array.from({length:fd}).map((_,i)=><div key={'e'+i}/>)}
      {Array.from({length:tot}).map((_,i)=>{
        const d=i+1,date=new Date(calY,calM,d),ds=date.toISOString().split('T')[0];
        const isSel=selDate&&new Date(selDate).toDateString()===date.toDateString();
        const dis=date<today||!workDays.includes(date.getDay())||blockedDates.includes(ds);
        return<div key={d} onClick={()=>{if(!dis)onSelect(date);}} style={{aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6,fontSize:11,fontWeight:500,cursor:dis?'not-allowed':'pointer',border:`1.5px solid ${isSel?C.accent:'transparent'}`,background:isSel?C.accent:'transparent',color:dis?C.border2:isSel?'#000':C.text}}>{d}</div>;
      })}
    </div>
  </div>);
};

const Sidebar=({page,setPage,collapsed,setCollapsed,config,user})=>{
  const perms=user?.permissoes||{};
  const menu=[
    {id:'dashboard',icon:'📊',label:'Dashboard',perm:'dashboard'},
    {id:'lista',icon:'📋',label:'Lista',perm:'editarAgendamentos'},
    {id:'config',icon:'⚙️',label:'Configurações',perm:'configuracoes'},
    {id:'vistoriadores',icon:'👷',label:'Vistoriadores',perm:'gerenciarVistoriadores'},
    {id:'empresas',icon:'🏢',label:'Empresas',perm:'gerenciarClientes'},
    {id:'admins',icon:'👥',label:'Usuários Admin',perm:'configuracoes'},
    {id:'logs',icon:'📜',label:'Logs',perm:'acessarLogs'},
    {id:'filiais',icon:'🏪',label:'Filiais',perm:'configuracoes'},
  ].filter(item=>perms[item.perm]);
  const logo=config?.logoInovare;
  if(collapsed){
    return(<div style={{width:60,background:C.surface,borderRight:`1px solid ${C.border}`,padding:'16px 0',height:'100vh',position:'sticky',top:0,overflowY:'auto'}}>
      <div style={{padding:'0 10px 16px',marginBottom:16,borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'center'}}>
        <button onClick={()=>setCollapsed(false)} style={{background:'none',border:'none',color:C.text,cursor:'pointer',fontSize:18}}>☰</button>
      </div>
      {menu.map((item,i)=>(
        <div key={item.id} onClick={()=>setPage(item.id)} style={{padding:'10px 0',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',background:page===item.id?'rgba(0,212,170,.1)':'transparent',borderLeft:`3px solid ${page===item.id?C.accent:'transparent'}`,color:page===item.id?C.accent:C.muted}}>
          <span style={{fontSize:18}}>{item.icon}</span>
        </div>
      ))}
    </div>);
  }
  return(<div style={{width:220,background:C.surface,borderRight:`1px solid ${C.border}`,padding:'16px 0',height:'100vh',position:'sticky',top:0,overflowY:'auto'}}>
    <div style={{padding:'0 16px 16px',marginBottom:16,borderBottom:`1px solid ${C.border}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{flex:1}}>
        {logo?<img src={logo} alt="Logo" style={{maxWidth:130,maxHeight:48,objectFit:'contain',display:'block'}}/>:<><div style={{width:40,height:40,borderRadius:10,background:'linear-gradient(135deg,#00d4aa,#0099ff)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:15,color:'#000',marginBottom:8}}>IN</div><h2 style={{fontWeight:800,fontSize:16,margin:0}}>inova<span style={{color:C.accent}}>re</span></h2></>}
      </div>
      <button onClick={()=>setCollapsed(true)} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:18}}>☰</button>
    </div>
    {menu.map((item,i)=>(
      <div key={item.id} onClick={()=>setPage(item.id)} style={{padding:'10px 16px',cursor:'pointer',display:'flex',alignItems:'center',gap:10,background:page===item.id?'rgba(0,212,170,.1)':'transparent',borderLeft:`3px solid ${page===item.id?C.accent:'transparent'}`,color:page===item.id?C.accent:C.muted,fontWeight:page===item.id?700:500,fontSize:13}}>
        <span style={{fontSize:12,fontWeight:700,color:C.border2,minWidth:18}}>{i+1}</span>
        <span style={{fontSize:16}}>{item.icon}</span>
        <span>{item.label}</span>
      </div>
    ))}
  </div>);
};const TermoLGPD=({onAceitar,onRecusar})=>(
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.95)',zIndex:10000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
    <div style={{background:C.card,borderRadius:14,padding:24,maxWidth:700,maxHeight:'85vh',overflow:'auto',border:`2px solid ${C.accent}`}}>
      <div style={{textAlign:'center',marginBottom:16}}>
        <div style={{fontSize:48,marginBottom:8}}>🔒</div>
        <h2 style={{fontSize:20,fontWeight:800,marginBottom:4}}>Termos de Uso e Privacidade - LGPD</h2>
        <p style={{fontSize:11,color:C.muted}}>Lei Geral de Proteção de Dados Pessoais</p>
      </div>
      <div style={{fontSize:13,lineHeight:1.8,color:C.text,marginBottom:20,maxHeight:400,overflowY:'auto',padding:16,background:C.surface,borderRadius:8}}>
        <h3 style={{fontSize:14,fontWeight:700,color:C.accent,marginBottom:8}}>📋 1. Coleta de Dados</h3>
        <p style={{marginBottom:12}}>Coletamos apenas informações <strong>necessárias</strong> para prestação do serviço de vistorias imobiliárias:</p>
        <ul style={{marginLeft:20,marginBottom:16}}>
          <li>Dados pessoais: Nome, CPF, RG, telefone, e-mail, data de nascimento</li>
          <li>Dados de imóveis: Endereço, CEP, metragem, fotos</li>
          <li>Dados de agendamento: Data, horário, tipo de vistoria</li>
        </ul>
        
        <h3 style={{fontSize:14,fontWeight:700,color:C.accent,marginBottom:8}}>🎯 2. Uso dos Dados</h3>
        <p style={{marginBottom:12}}>Seus dados serão utilizados <strong>exclusivamente</strong> para:</p>
        <ul style={{marginLeft:20,marginBottom:16}}>
          <li>Agendamento e execução de vistorias</li>
          <li>Comunicação sobre serviços contratados</li>
          <li>Emissão de relatórios e laudos técnicos</li>
          <li>Cumprimento de obrigações legais</li>
        </ul>
        
        <h3 style={{fontSize:14,fontWeight:700,color:C.accent,marginBottom:8}}>🔐 3. Segurança e Armazenamento</h3>
        <p style={{marginBottom:12}}>Implementamos as seguintes medidas de segurança:</p>
        <ul style={{marginLeft:20,marginBottom:16}}>
          <li>Criptografia de ponta a ponta para senhas e dados sensíveis</li>
          <li>Armazenamento seguro em servidores certificados</li>
          <li>Controle de acesso por usuário e permissões</li>
          <li>Backup automático diário dos dados</li>
          <li>Logs de auditoria para rastreabilidade total</li>
        </ul>
        
        <h3 style={{fontSize:14,fontWeight:700,color:C.accent,marginBottom:8}}>🚫 4. Compartilhamento</h3>
        <p style={{marginBottom:16}}><strong>NÃO compartilhamos</strong> seus dados com terceiros sem sua autorização expressa, exceto quando exigido por lei.</p>
        
        <h3 style={{fontSize:14,fontWeight:700,color:C.accent,marginBottom:8}}>✅ 5. Seus Direitos (LGPD)</h3>
        <p style={{marginBottom:12}}>Você tem direito a:</p>
        <ul style={{marginLeft:20,marginBottom:16}}>
          <li>Acessar seus dados a qualquer momento</li>
          <li>Corrigir dados incompletos ou desatualizados</li>
          <li>Solicitar exclusão de seus dados</li>
          <li>Revogar consentimento a qualquer momento</li>
          <li>Portabilidade dos dados para outro fornecedor</li>
        </ul>
        
        <h3 style={{fontSize:14,fontWeight:700,color:C.accent,marginBottom:8}}>📞 6. Contato</h3>
        <p style={{marginBottom:8}}>Para dúvidas sobre privacidade ou exercer seus direitos:</p>
        <ul style={{marginLeft:20,marginBottom:16}}>
          <li>E-mail: privacidade@inovare.com</li>
          <li>Telefone: (11) 99999-9999</li>
          <li>Horário: Segunda a Sexta, 9h às 18h</li>
        </ul>
        
        <div style={{background:'rgba(0,212,170,.08)',border:`1px solid ${C.accent}`,borderRadius:8,padding:12,marginTop:16}}>
          <p style={{fontSize:12,margin:0,color:C.accent,fontWeight:600}}>
            ⚖️ Este sistema está em conformidade com a Lei nº 13.709/2018 (LGPD) e utiliza padrões de segurança equivalentes aos de instituições financeiras.
          </p>
        </div>
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'center'}}>
        <button style={S.btnD} onClick={onRecusar}>❌ Recusar e Sair</button>
        <button style={{...S.btnP(),padding:'10px 24px'}} onClick={onAceitar}>✅ Li e Aceito os Termos</button>
      </div>
      <p style={{fontSize:10,color:C.muted,textAlign:'center',marginTop:12}}>Ao aceitar, você concorda com nossos termos de uso e política de privacidade</p>
    </div>
  </div>
);

export default function InovareApp(){
  const[page,setPage]=useState('loading');
  const[adminPage,setAdminPage]=useState('dashboard');
  const[sidebarCollapsed,setSidebarCollapsed]=useState(false);
  const[user,setUser]=useState(null);
  const[filiais,setFiliais]=useState([]);
  const[empresas,setEmpresas]=useState([]);
  const[clients,setClients]=useState([]);
  const[inspectors,setInspectors]=useState([]);
  const[admins,setAdmins]=useState([]);
  const[ags,setAgs]=useState([]);
  const[tipos,setTipos]=useState([]);
  const[config,setConfig]=useState(DEFAULT_CONFIG);
  const[logs,setLogs]=useState([]);
  const[lEmail,setLEmail]=useState('');
  const[lSenha,setLSenha]=useState('');
  const[toast,setToast]=useState('');
  const[modal,setModal]=useState(null);
  const[tentativasLogin,setTentativasLogin]=useState({});
  const[mostrarTermoLGPD,setMostrarTermoLGPD]=useState(false);
  const[userPendenteAceite,setUserPendenteAceite]=useState(null);
  const timeoutRef=useRef(null);

  const showToast=(m)=>{setToast(m);setTimeout(()=>setToast(''),2500);};

  const resetTimeout=()=>{
    if(timeoutRef.current)clearTimeout(timeoutRef.current);
    if(user){
      timeoutRef.current=setTimeout(()=>{
        setUser(null);setPage('login');setLEmail('');setLSenha('');
        showToast('⚠️ Sessão expirada por inatividade');
        addLog(logs,setLogs,user,'Logout Automático','Timeout de sessão');
      },TIMEOUT_SESSAO);
    }
  };

  useEffect(()=>{
    const handleActivity=()=>resetTimeout();
    window.addEventListener('mousemove',handleActivity);
    window.addEventListener('keypress',handleActivity);
    window.addEventListener('click',handleActivity);
    resetTimeout();
    return()=>{
      window.removeEventListener('mousemove',handleActivity);
      window.removeEventListener('keypress',handleActivity);
      window.removeEventListener('click',handleActivity);
      if(timeoutRef.current)clearTimeout(timeoutRef.current);
    };
  },[user]);

  useEffect(()=>{
    let fil=sGet('fil')||DEFAULT_FILIAIS,emp=sGet('emp')||DEFAULT_EMPRESAS,cl=sGet('cl')||DEFAULT_CLIENTS,ins=sGet('ins')||DEFAULT_INSPECTORS,adm=sGet('admins')||DEFAULT_ADMINS,ag=sGet('ags')||DEFAULT_AGS,tp=sGet('tipos')||DEFAULT_TIPOS,cfg={...DEFAULT_CONFIG,...(sGet('config')||{}),camposOrdem:sGet('config')?.camposOrdem||DEFAULT_CAMPOS_ORDEM},lg=sGet('logs')||DEFAULT_LOGS;
    sSet('fil',fil);sSet('emp',emp);sSet('cl',cl);sSet('ins',ins);sSet('admins',adm);sSet('ags',ag);sSet('tipos',tp);sSet('config',cfg);sSet('logs',lg);
    setFiliais(fil);setEmpresas(emp);setClients(cl);setInspectors(ins);setAdmins(adm);setAgs(ag);setTipos(tp);setConfig(cfg);setLogs(lg);setPage('login');
  },[]);

  const persist=(fil=filiais,emp=empresas,cl=clients,ins=inspectors,ag=ags,tp=tipos,cfg=config,lg=logs,adm=admins)=>{sSet('fil',fil);sSet('emp',emp);sSet('cl',cl);sSet('ins',ins);sSet('ags',ag);sSet('tipos',tp);sSet('config',cfg);sSet('logs',lg);sSet('admins',adm);fazerBackup();};

  const handleLogin=()=>{
    if(!validarEmail(lEmail)){setModal({icon:'❌',title:'E-mail inválido',message:'Digite um e-mail válido.',confirmLabel:'OK',onConfirm:()=>setModal(null),onCancel:()=>setModal(null)});return;}
    const emailLower=lEmail.toLowerCase();
    const agora=Date.now();
    const tentativas=tentativasLogin[emailLower]||{count:0,bloqueadoAte:0};
    
    if(tentativas.bloqueadoAte>agora){
      const minutos=Math.ceil((tentativas.bloqueadoAte-agora)/60000);
      setModal({icon:'🚫',title:'Conta Bloqueada',message:`Muitas tentativas incorretas. Tente novamente em ${minutos} minuto(s).`,confirmLabel:'OK',onConfirm:()=>setModal(null),onCancel:()=>setModal(null)});
      return;
    }
    
    const adm=admins.find(a=>a.email.toLowerCase()===emailLower&&a.ativo);
    if(adm&&validarSenha(lSenha,adm.senha)){
      setTentativasLogin({...tentativasLogin,[emailLower]:{count:0,bloqueadoAte:0}});
      if(!adm.aceitouLGPD){setUserPendenteAceite({...adm,type:'admin'});setMostrarTermoLGPD(true);return;}
      setUser(adm);setPage('admin');addLog(logs,setLogs,adm,'Login Admin','Acesso realizado');resetTimeout();return;
    }
    
    const ins=inspectors.find(v=>v.email.toLowerCase()===emailLower);
    if(ins&&validarSenha(lSenha,ins.senha)){
      setTentativasLogin({...tentativasLogin,[emailLower]:{count:0,bloqueadoAte:0}});
      setUser({...ins,role:'inspector'});setPage('inspector');addLog(logs,setLogs,{...ins,role:'inspector'},'Login Vistoriador','Acesso realizado');resetTimeout();return;
    }
    
    const cl=clients.find(c=>c.email.toLowerCase()===emailLower);
    if(cl&&validarSenha(lSenha,cl.senha)){
      if(cl.bloqueado){setModal({icon:'🚫',title:'Acesso Bloqueado',message:'Seu acesso foi bloqueado. Entre em contato conosco.',confirmLabel:'OK',onConfirm:()=>setModal(null),onCancel:()=>setModal(null)});return;}
      const emp=empresas.find(e=>e.id===cl.empresaId);
      if(emp?.bloqueado){setModal({icon:'🚫',title:'Acesso Bloqueado',message:emp.motivoBloqueio||'Sua empresa está bloqueada.',confirmLabel:'OK',onConfirm:()=>setModal(null),onCancel:()=>setModal(null)});return;}
      setTentativasLogin({...tentativasLogin,[emailLower]:{count:0,bloqueadoAte:0}});
      if(!cl.aceitouLGPD){setUserPendenteAceite({...cl,empresa:emp,type:'client'});setMostrarTermoLGPD(true);return;}
      setUser({...cl,role:'client',empresa:emp});setPage('client');addLog(logs,setLogs,{...cl,role:'client'},'Login Cliente','Acesso realizado');resetTimeout();return;
    }
    
    const novasTentativas=tentativas.count+1;
    if(novasTentativas>=MAX_TENTATIVAS_LOGIN){
      setTentativasLogin({...tentativasLogin,[emailLower]:{count:novasTentativas,bloqueadoAte:agora+TEMPO_BLOQUEIO_LOGIN}});
      setModal({icon:'🚫',title:'Conta Bloqueada',message:`Você excedeu o limite de ${MAX_TENTATIVAS_LOGIN} tentativas. Conta bloqueada por 15 minutos.`,confirmLabel:'OK',onConfirm:()=>setModal(null),onCancel:()=>setModal(null)});
    }else{
      setTentativasLogin({...tentativasLogin,[emailLower]:{count:novasTentativas,bloqueadoAte:0}});
      setModal({icon:'❌',title:'Acesso negado',message:`E-mail ou senha incorretos. (${novasTentativas}/${MAX_TENTATIVAS_LOGIN})`,confirmLabel:'OK',onConfirm:()=>setModal(null),onCancel:()=>setModal(null)});
    }
  };

  const aceitarLGPD=()=>{
    if(!userPendenteAceite)return;
    const userAtualizado={...userPendenteAceite,aceitouLGPD:true,dataAceiteLGPD:new Date().toISOString()};
    
    if(userPendenteAceite.type==='admin'){
      const admsAtualizados=admins.map(a=>a.id===userAtualizado.id?userAtualizado:a);
      setAdmins(admsAtualizados);
      persist(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,admsAtualizados);
      setUser(userAtualizado);setPage('admin');
      addLog(logs,setLogs,userAtualizado,'LGPD Aceito','Termos de uso aceitos');
    }else if(userPendenteAceite.type==='client'){
      const clsAtualizados=clients.map(c=>c.id===userAtualizado.id?userAtualizado:c);
      setClients(clsAtualizados);
      persist(undefined,undefined,clsAtualizados);
      setUser({...userAtualizado,role:'client',empresa:userPendenteAceite.empresa});setPage('client');
      addLog(logs,setLogs,{...userAtualizado,role:'client'},'LGPD Aceito','Termos de uso aceitos');
    }
    
    setMostrarTermoLGPD(false);setUserPendenteAceite(null);resetTimeout();
  };

  const recusarLGPD=()=>{
    setMostrarTermoLGPD(false);setUserPendenteAceite(null);
    setModal({icon:'ℹ️',title:'Termos Recusados',message:'Para utilizar o sistema é necessário aceitar os termos de uso e privacidade.',confirmLabel:'OK',onConfirm:()=>setModal(null),onCancel:()=>setModal(null)});
  };

  if(page==='loading')return<div style={{...S.app,alignItems:'center',justifyContent:'center'}}><div style={{color:C.muted}}>Carregando sistema seguro...</div></div>;
  if(page==='login')return<>{mostrarTermoLGPD&&<TermoLGPD onAceitar={aceitarLGPD} onRecusar={recusarLGPD}/>}<LoginPage email={lEmail} setEmail={setLEmail} senha={lSenha} setSenha={setLSenha} onLogin={handleLogin} config={config} modal={modal} setModal={setModal}/></>;

  const sharedProps={user,filiais,setFiliais,empresas,setEmpresas,inspectors,setInspectors,ags,setAgs,clients,setClients,admins,setAdmins,tipos,setTipos,config,setConfig,logs,setLogs,persist,logout:()=>{if(timeoutRef.current)clearTimeout(timeoutRef.current);addLog(logs,setLogs,user,'Logout','Saída do sistema');setUser(null);setPage('login');setLEmail('');setLSenha('');setAdminPage('dashboard');},showToast,toast,modal,setModal,addLog};
  if(page==='admin')return<AdminPanel {...sharedProps} adminPage={adminPage} setAdminPage={setAdminPage} sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}/>;
  if(page==='inspector')return<InspectorPanel {...sharedProps}/>;
  return<ClientPanel {...sharedProps}/>;
}

function LoginPage({email,setEmail,senha,setSenha,onLogin,config,modal,setModal}){
  const logo=config?.logoInovare;
  return(
    <div style={{...S.app,display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',width:'100%'}}>
      {modal&&<Modal {...modal} onCancel={()=>setModal(null)}/>}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:20,maxWidth:340,width:'100%'}}>
        <div style={{textAlign:'center',marginBottom:18}}>
          <div style={{width:'auto',minWidth:80,maxWidth:200,height:80,borderRadius:10,margin:'0 auto 12px',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',background:'#fff',padding:8}}>
            {logo?<img src={logo} alt="Logo" style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/>:<svg viewBox="0 0 200 60" style={{width:'100%',height:'auto'}}><text x="10" y="45" fontFamily="Arial,sans-serif" fontSize="36" fontWeight="700" fill="#4a5568">Ino</text><text x="85" y="45" fontFamily="Arial,sans-serif" fontSize="36" fontWeight="700" fill="#00d4aa">v</text><text x="105" y="45" fontFamily="Arial,sans-serif" fontSize="36" fontWeight="700" fill="#4a5568">are</text><text x="10" y="58" fontFamily="Arial,sans-serif" fontSize="10" fill="#7a8899">Vistorias Imob</text></svg>}
          </div>
          <p style={{color:C.muted,fontSize:12}}>{config?.empresaNome||'Sistema de Vistorias'}</p>
          <div style={{background:'rgba(0,212,170,.08)',border:`1px solid ${C.accent}`,borderRadius:6,padding:6,marginTop:8}}>
            <div style={{fontSize:10,color:C.accent,fontWeight:600}}>🔒 Sistema 100% Seguro - LGPD</div>
          </div>
        </div>
        <div style={{marginBottom:11}}><label style={S.lbl}>E-mail</label><input style={S.inp()} value={email} onChange={e=>setEmail(sanitizar(e.target.value))} placeholder="seu@email.com" onKeyDown={e=>e.key==='Enter'&&onLogin()}/></div>
        <div style={{marginBottom:14}}><label style={S.lbl}>Senha</label><input style={S.inp()} type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&onLogin()}/></div>
        <button style={{...S.btnP(),width:'100%'}} onClick={onLogin}>🔐 Entrar com Segurança →</button>
        <div style={{marginTop:12,padding:10,background:C.surface,borderRadius:8,fontSize:11,color:C.muted,lineHeight:1.7}}>
          <strong style={{color:C.text}}>Acessos demo:</strong><br/>
          🧑 marlon@dlange.com / 123456<br/>
          👷 carlos@inovare.com / vst123<br/>
          ⚙️ admin@inovare.com / admin123
        </div>
      </div>
    </div>
  );
}

function AdminPanel({user,filiais,setFiliais,empresas,setEmpresas,inspectors,setInspectors,ags,setAgs,clients,setClients,admins,setAdmins,tipos,setTipos,config,setConfig,logs,setLogs,persist,logout,showToast,toast,modal,setModal,addLog,adminPage,setAdminPage,sidebarCollapsed,setSidebarCollapsed}){
  const[detailAg,setDetailAg]=useState(null);
  const[editAg,setEditAg]=useState(null);
  const[newAgModal,setNewAgModal]=useState(false);

  const changeStatus=(id,status)=>{
    const ag=ags.find(a=>a.id===id);
    const upd=ags.map(a=>a.id===id?{...a,status}:a);
    setAgs(upd);persist(undefined,undefined,undefined,undefined,upd);
    addLog(logs,setLogs,user,'Status Alterado',`${STATUS_CFG[ag.status]?.label} → ${STATUS_CFG[status]?.label}`,ag.id);
    showToast('✅ Status atualizado!');
    setDetailAg(upd.find(a=>a.id===id));
  };

  const saveEditAg=(data)=>{
    const upd=ags.map(a=>a.id===data.id?data:a);
    setAgs(upd);persist(undefined,undefined,undefined,undefined,upd);
    addLog(logs,setLogs,user,'Agendamento Editado','Dados atualizados',data.id);
    showToast('✅ Salvo!');setEditAg(null);setDetailAg(data);
  };

  useEffect(()=>{
    const now=new Date();
    const updated=ags.map(ag=>{
      if(ag.status==='agendado'&&new Date(ag.dataObj)<now)return{...ag,status:'atendido'};
      return ag;
    });
    if(JSON.stringify(updated)!==JSON.stringify(ags)){setAgs(updated);persist(undefined,undefined,undefined,undefined,updated);}
  },[]);

  return(
    <div style={S.app}>
      {toast&&<div style={{position:'fixed',bottom:16,left:'50%',transform:'translateX(-50%)',background:C.card,border:`1px solid ${C.accent}`,borderRadius:10,padding:'8px 14px',fontSize:12,fontWeight:600,color:C.accent,zIndex:9998}}>{toast}</div>}
      {modal&&<Modal {...modal} onCancel={()=>setModal(null)}/>}
      {detailAg&&<AgDetailModal ag={detailAg} inspectors={inspectors} onClose={()=>setDetailAg(null)} onStatusChange={changeStatus} onEdit={()=>{setEditAg({...detailAg});setDetailAg(null);}} isAdmin/>}
      {editAg&&<EditAgModal ag={editAg} setAg={setEditAg} inspectors={inspectors} filiais={filiais} tipos={tipos} config={config} onSave={saveEditAg} onCancel={()=>setEditAg(null)}/>}
      {newAgModal&&<NovoAgendamentoModal clients={clients} empresas={empresas} inspectors={inspectors} filiais={filiais} tipos={tipos} config={config} ags={ags} setAgs={setAgs} persist={persist} showToast={showToast} onClose={()=>setNewAgModal(false)} user={user} logs={logs} setLogs={setLogs} addLog={addLog} setModal={setModal}/>}
      <Sidebar page={adminPage} setPage={setAdminPage} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} config={config} user={user}/>
      <div style={{flex:1,padding:'16px 20px 60px',maxWidth:1200,margin:'0 auto',width:'100%'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>
          <div>
            <h1 style={{fontSize:17,fontWeight:800,margin:0}}>Olá, <span style={{color:C.accent}}>{user.nome.split(' ')[0]}</span></h1>
            <div style={{fontSize:11,color:C.muted}}>Admin · Inovare 🔒</div>
          </div>
          <div style={{display:'flex',gap:6}}>
            {adminPage==='dashboard'&&user.permissoes?.criarAgendamentos&&<button style={S.btnP()} onClick={()=>setNewAgModal(true)}>+ Novo</button>}
            <button style={S.btnG} onClick={logout}>Sair</button>
          </div>
        </div>
        {adminPage==='dashboard'&&<DashboardUnificado ags={ags} setAgs={setAgs} inspectors={inspectors} empresas={empresas} filiais={filiais} persist={persist} showToast={showToast} setDetailAg={setDetailAg} user={user} logs={logs} setLogs={setLogs} addLog={addLog}/>}
        {adminPage==='lista'&&<ListaView ags={ags} inspectors={inspectors} empresas={empresas} filiais={filiais} clients={clients} setDetailAg={setDetailAg} showToast={showToast}/>}
        {adminPage==='config'&&<ConfigGeralView config={config} setConfig={setConfig} tipos={tipos} setTipos={setTipos} persist={persist} showToast={showToast} setModal={setModal} user={user} logs={logs} setLogs={setLogs} addLog={addLog}/>}
        {adminPage==='vistoriadores'&&<VistoriadoresView inspectors={inspectors} setInspectors={setInspectors} filiais={filiais} tipos={tipos} config={config} persist={persist} showToast={showToast} setModal={setModal} user={user} logs={logs} setLogs={setLogs} addLog={addLog}/>}
        {adminPage==='empresas'&&<EmpresasView empresas={empresas} setEmpresas={setEmpresas} clients={clients} setClients={setClients} persist={persist} showToast={showToast} setModal={setModal} user={user} logs={logs} setLogs={setLogs} addLog={addLog}/>}
        {adminPage==='admins'&&<AdminsView admins={admins} setAdmins={setAdmins} persist={persist} showToast={showToast} setModal={setModal} user={user} logs={logs} setLogs={setLogs} addLog={addLog}/>}
        {adminPage==='logs'&&<LogsView logs={logs} ags={ags}/>}
        {adminPage==='filiais'&&<FiliaisView filiais={filiais} setFiliais={setFiliais} persist={persist} showToast={showToast} setModal={setModal} user={user} logs={logs} setLogs={setLogs} addLog={addLog}/>}
      </div>
    </div>
  );
}function DashboardUnificado({ags,setAgs,inspectors,empresas,filiais,persist,showToast,setDetailAg,user,logs,setLogs,addLog}){
  const[viewMode,setViewMode]=useState('mes');
  const[curDate,setCurDate]=useState(new Date());
  const[filterVist,setFilterVist]=useState('');
  const[filterTipo,setFilterTipo]=useState('');
  const[filterEmp,setFilterEmp]=useState('');
  const[filterFil,setFilterFil]=useState('');
  const[filterStatus,setFilterStatus]=useState('');
  const[filterDataInicio,setFilterDataInicio]=useState('');
  const[filterDataFim,setFilterDataFim]=useState('');
  const[filtrosAtivos,setFiltrosAtivos]=useState(false);

  const hoje=new Date();hoje.setHours(0,0,0,0);
  const agsDia=date=>ags.filter(ag=>ag.status!=='cancelado'&&isSameDay(ag.dataObj,date));

  const nav=d=>{
    if(viewMode==='dia'){const nd=new Date(curDate);nd.setDate(nd.getDate()+d);setCurDate(nd);}
    if(viewMode==='semana'){const nd=new Date(curDate);nd.setDate(nd.getDate()+(d*7));setCurDate(nd);}
    if(viewMode==='mes'){const nd=new Date(curDate);nd.setMonth(nd.getMonth()+d);setCurDate(nd);}
  };

  const getTitle=()=>{
    if(viewMode==='dia')return fmtDtLong(curDate);
    if(viewMode==='semana'){const start=startOfWeek(curDate);const end=new Date(start);end.setDate(end.getDate()+6);return`${start.getDate()} - ${end.getDate()} de ${MONTHS[start.getMonth()]} ${start.getFullYear()}`;}
    return`${MONTHS[curDate.getMonth()]} ${curDate.getFullYear()}`;
  };

  const aplicarFiltros=()=>setFiltrosAtivos(true);
  const limparFiltros=()=>{setFilterVist('');setFilterTipo('');setFilterEmp('');setFilterFil('');setFilterStatus('');setFilterDataInicio('');setFilterDataFim('');setFiltrosAtivos(false);};

  const filtered=ags.filter(ag=>{
    if(!filtrosAtivos)return true;
    if(filterVist&&ag.vistoriadorId!==filterVist)return false;
    if(filterTipo&&ag.tipo!==filterTipo)return false;
    if(filterEmp&&ag.empresaId!==parseInt(filterEmp))return false;
    if(filterFil&&ag.filialId!==parseInt(filterFil))return false;
    if(filterStatus&&ag.status!==filterStatus)return false;
    const agDate=new Date(ag.dataObj);
    if(filterDataInicio){const inicio=new Date(filterDataInicio);inicio.setHours(0,0,0,0);if(agDate<inicio)return false;}
    if(filterDataFim){const fim=new Date(filterDataFim);fim.setHours(23,59,59,999);if(agDate>fim)return false;}
    return true;
  });

  const agsExibir=filtered.filter(ag=>{
    const agDate=new Date(ag.dataObj);
    if(viewMode==='dia')return isSameDay(agDate,curDate);
    if(viewMode==='semana'){const weekStart=startOfWeek(curDate);const weekEnd=new Date(weekStart);weekEnd.setDate(weekEnd.getDate()+7);return agDate>=weekStart&&agDate<weekEnd;}
    if(viewMode==='mes'){const monthStart=startOfMonth(curDate);const monthEnd=endOfMonth(curDate);return agDate>=monthStart&&agDate<=monthEnd;}
    return true;
  });

  return(<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:8}}>
      <h2 style={{fontSize:16,fontWeight:700,margin:0}}>📊 Dashboard</h2>
      <div style={{display:'flex',gap:4}}>
        {['dia','semana','mes'].map(m=><button key={m} onClick={()=>setViewMode(m)} style={{padding:'6px 12px',borderRadius:7,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,background:viewMode===m?C.accent:'transparent',color:viewMode===m?'#000':C.muted,textTransform:'capitalize'}}>{m}</button>)}
      </div>
    </div>

    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:12}}>
      <div style={{fontWeight:700,fontSize:12,marginBottom:8}}>🔍 Filtros</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:6,marginBottom:8}}>
        <select value={filterVist} onChange={e=>setFilterVist(e.target.value)} style={{...S.inp(),padding:'6px 8px',fontSize:11}}><option value=''>👷 Vistoriador</option>{inspectors.map(v=><option key={v.id} value={v.id}>{v.nome}</option>)}</select>
        <select value={filterEmp} onChange={e=>setFilterEmp(e.target.value)} style={{...S.inp(),padding:'6px 8px',fontSize:11}}><option value=''>🏢 Empresa</option>{empresas.map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</select>
        <select value={filterFil} onChange={e=>setFilterFil(e.target.value)} style={{...S.inp(),padding:'6px 8px',fontSize:11}}><option value=''>🏪 Filial</option>{filiais.filter(f=>f.ativa).map(f=><option key={f.id} value={f.id}>{f.nome}</option>)}</select>
        <select value={filterTipo} onChange={e=>setFilterTipo(e.target.value)} style={{...S.inp(),padding:'6px 8px',fontSize:11}}><option value=''>🏠 Tipo</option>{DEFAULT_TIPOS.map(t=><option key={t.name} value={t.name}>{t.name}</option>)}</select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{...S.inp(),padding:'6px 8px',fontSize:11}}><option value=''>📊 Status</option><option value='agendado'>Agendado</option><option value='atendido'>Atendido</option><option value='cancelado'>Cancelado</option></select>
        <input type="date" value={filterDataInicio} onChange={e=>setFilterDataInicio(e.target.value)} style={{...S.inp(),padding:'6px 8px',fontSize:11}}/>
        <input type="date" value={filterDataFim} onChange={e=>setFilterDataFim(e.target.value)} style={{...S.inp(),padding:'6px 8px',fontSize:11}}/>
      </div>
      <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
        <button style={S.btnG} onClick={limparFiltros}>Limpar Filtros</button>
        <button style={S.btnP()} onClick={aplicarFiltros}>Aplicar Filtros</button>
      </div>
    </div>

    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
      <div style={{display:'flex',alignItems:'center',gap:7}}>
        <button style={S.btnG} onClick={()=>nav(-1)}>‹</button>
        <span style={{fontWeight:700,fontSize:13,minWidth:280,textAlign:'center'}}>{getTitle()}</span>
        <button style={S.btnG} onClick={()=>nav(1)}>›</button>
        <button style={{...S.btnG,fontSize:12}} onClick={()=>setCurDate(new Date())}>Hoje</button>
      </div>
      <span style={{fontSize:11,color:C.muted}}>{agsExibir.length} agendamento(s)</span>
    </div>

    {viewMode==='mes'&&<CalendarioMensal curDate={curDate} filtered={agsExibir} setDetailAg={setDetailAg} agsDia={agsDia}/>}
    {viewMode==='semana'&&<CalendarioSemanal curDate={curDate} filtered={agsExibir} setDetailAg={setDetailAg}/>}
    {viewMode==='dia'&&<VistaDiaAgenda curDate={curDate} ags={agsExibir} inspectors={inspectors} setDetailAg={setDetailAg}/>}
  </div>);
}

function VistaDiaAgenda({curDate,ags,inspectors,setDetailAg}){
  const hoje=dateStr(curDate);
  return(<div style={{overflowX:'auto'}}>
    <div style={{display:'grid',gridTemplateColumns:`80px repeat(${inspectors.length},1fr)`,gap:2,minWidth:600}}>
      <div style={{background:C.surface,padding:'8px',borderRight:`1px solid ${C.border}`,fontWeight:700,fontSize:11}}>Horário</div>
      {inspectors.map(v=>(
        <div key={v.id} style={{background:C.surface,padding:'8px',textAlign:'center',borderBottom:`1px solid ${C.border}`}}>
          <div style={{width:24,height:24,borderRadius:'50%',background:v.cor,display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:10,color:'#000',marginBottom:4}}>{v.nome[0]}</div>
          <div style={{fontWeight:600,fontSize:11}}>{v.nome.split(' ')[0]}</div>
        </div>
      ))}
      {HORARIOS_PADRAO.map(hora=>(
        <React.Fragment key={hora}>
          <div style={{background:C.bg,padding:'8px',borderRight:`1px solid ${C.border}`,fontSize:10,color:C.muted}}>{hora}</div>
          {inspectors.map(v=>{
            const ag=ags.find(a=>a.vistoriadorId===v.id&&a.status!=='cancelado'&&dateStr(a.dataObj)===hoje&&a.hora===hora);
            return(<div key={v.id} style={{background:ag?STATUS_CFG[ag.status]?.bg:C.card,border:`1px solid ${C.border}`,padding:'4px',minHeight:40,cursor:ag?'pointer':'default'}} onClick={()=>ag&&setDetailAg(ag)}>
              {ag&&<div style={{fontSize:9,fontWeight:600,color:STATUS_CFG[ag.status]?.c,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ag.tipo}<br/><span style={{fontSize:8,color:C.muted}}>{ag.clienteNome.split(' ')[0]}</span></div>}
            </div>);
          })}
        </React.Fragment>
      ))}
    </div>
  </div>);
}

function CalendarioMensal({curDate,filtered,setDetailAg,agsDia}){
  const hoje=new Date();hoje.setHours(0,0,0,0);
  const y=curDate.getFullYear(),m=curDate.getMonth(),fd=new Date(y,m,1).getDay(),tot=new Date(y,m+1,0).getDate();
  return(<>
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:2}}>
      {WEEK_DAYS.map(d=><div key={d} style={{textAlign:'center',fontSize:11,fontWeight:600,color:C.muted,padding:'5px 0'}}>{d}</div>)}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
      {Array.from({length:fd}).map((_,i)=><div key={'e'+i} style={{minHeight:90,background:C.surface,borderRadius:6,opacity:.3}}/>)}
      {Array.from({length:tot}).map((_,i)=>{
        const d=i+1,date=new Date(y,m,d),isHoje=date.toDateString()===hoje.toDateString(),items=agsDia(date).filter(ag=>filtered.includes(ag));
        return(<div key={d} style={{minHeight:90,background:isHoje?'rgba(0,212,170,.05)':C.surface,border:`1px solid ${isHoje?C.accent:C.border}`,borderRadius:6,padding:4,overflowY:'auto'}}>
          <div style={{fontSize:11,fontWeight:isHoje?800:500,color:isHoje?C.accent:C.muted,marginBottom:2}}>{d}</div>
          {items.slice(0,3).map(ag=>(
            <div key={ag.id} onClick={()=>setDetailAg(ag)} style={{background:STATUS_CFG[ag.status]?.bg,border:`1px solid ${STATUS_CFG[ag.status]?.b}`,borderRadius:4,padding:'2px 4px',fontSize:9,color:STATUS_CFG[ag.status]?.c,marginBottom:1,cursor:'pointer',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>
              {ag.hora&&ag.hora!=='A definir'?ag.hora+' ':''}{ag.tipo}
            </div>
          ))}
          {items.length>3&&<div style={{fontSize:9,color:C.muted,marginTop:1}}>+{items.length-3}</div>}
        </div>);
      })}
    </div>
  </>);
}

function CalendarioSemanal({curDate,filtered,setDetailAg}){
  const weekStart=startOfWeek(curDate);
  return(<div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
    {Array.from({length:7}).map((_,i)=>{
      const date=new Date(weekStart);date.setDate(date.getDate()+i);
      const items=filtered.filter(ag=>isSameDay(ag.dataObj,date));
      return(<div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:8,minHeight:180}}>
        <div style={{fontWeight:700,fontSize:12,marginBottom:6}}>{WEEK_DAYS[i]}<div style={{fontSize:10,color:C.muted}}>{date.getDate()}/{date.getMonth()+1}</div></div>
        {items.map(ag=>(
          <div key={ag.id} onClick={()=>setDetailAg(ag)} style={{background:STATUS_CFG[ag.status]?.bg,border:`1px solid ${STATUS_CFG[ag.status]?.b}`,borderRadius:4,padding:'4px',fontSize:10,color:STATUS_CFG[ag.status]?.c,marginBottom:3,cursor:'pointer'}}>
            <div style={{fontWeight:600}}>{ag.hora||'—'}</div>
            <div style={{fontSize:9}}>{ag.tipo}</div>
          </div>
        ))}
      </div>);
    })}
  </div>);
}

const AgDetailModal=({ag,inspectors,onClose,onStatusChange,onEdit,isAdmin})=>{
  if(!ag)return null;
  const vst=inspectors.find(v=>v.id===ag.vistoriadorId);
  const ml={'sem_mobilia':'Sem Mobília','semi_mobiliado':'Semi-Mobiliado','mobiliado':'Mobiliado'}[ag.mobilia]||'—';
  const Row=({l,v})=><div style={{display:'flex',gap:7,padding:'5px 0',borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'.4px',minWidth:100,flexShrink:0}}>{l}</span><span style={{fontSize:12}}>{v||'—'}</span></div>;
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',display:'flex',alignItems:'flex-start',justifyContent:'center',zIndex:9999,padding:'14px',overflowY:'auto'}}>
      <div style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:14,padding:18,maxWidth:540,width:'100%',marginTop:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
          <div><div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap',marginBottom:4}}><h3 style={{fontWeight:800,fontSize:16,margin:0}}>{ag.tipo}</h3><StatusChip status={ag.status}/></div><IDTag id={ag.id}/></div>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:17}}>✕</button>
        </div>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:6}}>Vistoria</div>
        <Row l="Empresa" v={ag.empresaNome}/>
        <Row l="Cliente" v={ag.clienteNome}/>
        <Row l="Data" v={fmtDtLong(ag.dataObj)}/>
        <Row l="Horário" v={ag.hora||'—'}/>
        <Row l="Duração" v={fmtDur(ag.duracaoMin)}/>
        <Row l="Vistoriador" v={vst?vst.nome:'Não atribuído'}/>
        <Row l="Acompanhada" v={ag.acompanhada?'👤 Sim':'🔓 Não'}/>
        <Row l="Valor Vistoria" v={ag.valorVistoria||'—'}/>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'.5px',margin:'11px 0 6px'}}>Imóvel</div>
        <Row l="Código" v={ag.codigoImovel}/>
        <Row l="Endereço" v={ag.endereco}/>
        <Row l="CEP" v={ag.cep}/>
        <Row l="Metragem" v={`${ag.m2}m²`}/>
        <Row l="Chaves" v={ag.localChaves}/>
        <Row l="Estado" v={ml}/>
        <Row l="Obs" v={ag.obs}/>
        <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'.5px',margin:'11px 0 6px'}}>Partes</div>
        <Row l="Locador" v={ag.nomeLocador}/>
        <Row l="Locatário" v={ag.nomeLocatario}/>
        <Row l="Valor Locação" v={ag.valorLocacao}/>
        {ag.acompanhada&&<><Row l="Acompanhante" v={ag.nomeAcompanhante}/><Row l="Contato" v={ag.contatoAcompanhante}/></>}
        {ag.pdfNome&&<div style={{margin:'11px 0 0'}}>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:6}}>Anexo</div>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:C.surface,border:`1px solid ${C.border2}`,borderRadius:8}}>
            <span style={{fontSize:16}}>📎</span>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:12}}>{ag.pdfNome}</div></div>
            {ag.pdfData&&<a href={ag.pdfData} download={ag.pdfNome} style={{...S.btnP(),textDecoration:'none',fontSize:11,display:'inline-block',padding:'6px 10px'}}>⬇ Baixar</a>}
          </div>
        </div>}
        {isAdmin&&onEdit&&<div style={{marginTop:12,paddingTop:11,borderTop:`1px solid ${C.border}`}}>
          <button style={{...S.btnW,width:'100%',marginBottom:6}} onClick={onEdit}>✏️ Editar Agendamento</button>
        </div>}
        {onStatusChange&&<div style={{marginTop:12,paddingTop:11,borderTop:`1px solid ${C.border}`}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:6}}>Alterar status:</div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {Object.entries(STATUS_CFG).filter(([k])=>k!==ag.status).map(([k,v])=>(
              <button key={k} onClick={()=>onStatusChange(ag.id,k)} style={{padding:'4px 8px',borderRadius:7,background:v.bg,color:v.c,border:`1px solid ${v.b}`,cursor:'pointer',fontWeight:600,fontSize:10}}>{v.label}</button>
            ))}
          </div>
        </div>}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:11}}><button style={S.btnG} onClick={onClose}>Fechar</button></div>
      </div>
    </div>
  );
};

const EditAgModal=({ag,setAg,inspectors,filiais,tipos,config,onSave,onCancel})=>{
  const upd=(k,v)=>setAg(a=>({...a,[k]:v}));
  const camposOrdenados=config.camposOrdem||DEFAULT_CAMPOS_ORDEM;
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',display:'flex',alignItems:'flex-start',justifyContent:'center',zIndex:9999,padding:'14px',overflowY:'auto'}}>
      <div style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:14,padding:18,maxWidth:640,width:'100%',marginTop:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h3 style={{fontWeight:800,fontSize:16,margin:0}}>✏️ Editar Agendamento</h3>
          <button onClick={onCancel} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:17}}>✕</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
          <div><label style={S.lbl}>Filial</label><select style={S.inp()} value={ag.filialId} onChange={e=>upd('filialId',parseInt(e.target.value))}>{filiais.filter(f=>f.ativa).map(f=><option key={f.id} value={f.id}>{f.nome}</option>)}</select></div>
          <div><label style={S.lbl}>Tipo</label><select style={S.inp()} value={ag.tipo} onChange={e=>upd('tipo',e.target.value)}>{tipos.filter(t=>t.ativo).map(t=><option key={t.name} value={t.name}>{t.name}</option>)}</select></div>
          <div><label style={S.lbl}>Data</label><input style={S.inp()} type="date" value={dateStr(ag.dataObj)} onChange={e=>upd('dataObj',new Date(e.target.value).toISOString())}/></div>
          <div><label style={S.lbl}>Horário</label><select style={S.inp()} value={ag.hora} onChange={e=>upd('hora',e.target.value)}><option value="A definir">A definir</option>{HORARIOS_PADRAO.map(h=><option key={h} value={h}>{h}</option>)}</select></div>
          <div><label style={S.lbl}>Vistoriador</label><select style={S.inp()} value={ag.vistoriadorId||''} onChange={e=>upd('vistoriadorId',e.target.value||null)}><option value="">Não atribuído</option>{inspectors.map(v=><option key={v.id} value={v.id}>{v.nome}</option>)}</select></div>
          <div><label style={S.lbl}>Status</label><select style={S.inp()} value={ag.status} onChange={e=>upd('status',e.target.value)}><option value="agendado">Agendado</option><option value="atendido">Atendido</option><option value="cancelado">Cancelado</option></select></div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr',gap:8}}>
          {camposOrdenados.map(k=>{
            const campo=config.camposFormulario?.[k];
            if(!campo?.ativo)return null;
            if(k==='m2')return<div key={k}><label style={S.lbl}>{campo.label}</label><input style={S.inp()} type="number" value={ag.m2} onChange={e=>upd('m2',parseInt(e.target.value)||0)}/></div>;
            if(k==='mobilia')return<div key={k}><label style={S.lbl}>{campo.label}</label><select style={S.inp()} value={ag.mobilia} onChange={e=>upd('mobilia',e.target.value)}><option value="sem_mobilia">Sem Mobília</option><option value="semi_mobiliado">Semi-Mobiliado</option><option value="mobiliado">Mobiliado</option></select></div>;
            if(k==='valorVistoria'||k==='valorLocacao')return<div key={k}><label style={S.lbl}>{campo.label}</label><input style={S.inp()} value={ag[k]||''} onChange={e=>upd(k,maskValor(e.target.value))}/></div>;
            if(k==='cep')return<div key={k}><label style={S.lbl}>{campo.label}</label><input style={S.inp()} value={ag[k]||''} onChange={e=>upd(k,maskCep(e.target.value))}/></div>;
            if(k==='nomeAcompanhante'||k==='contatoAcompanhante'){if(!ag.acompanhada)return null;return<div key={k}><label style={S.lbl}>{campo.label}</label><input style={S.inp()} value={ag[k]||''} onChange={e=>upd(k,k==='contatoAcompanhante'?maskPhone(e.target.value):e.target.value)}/></div>;}
            if(k==='obs')return<div key={k}><label style={S.lbl}>{campo.label}</label><textarea style={{...S.inp(),resize:'vertical',minHeight:50}} value={ag[k]||''} onChange={e=>upd(k,e.target.value)}/></div>;
            return<div key={k}><label style={S.lbl}>{campo.label}</label><input style={S.inp()} value={ag[k]||''} onChange={e=>upd(k,e.target.value)}/></div>;
          })}
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:12}}>
          <button style={S.btnG} onClick={onCancel}>Cancelar</button>
          <button style={S.btnP()} onClick={()=>onSave(ag)}>Salvar</button>
        </div>
      </div>
    </div>
  );
};function NovoAgendamentoModal({clients,empresas,inspectors,filiais,tipos,config,ags,setAgs,persist,showToast,onClose,user,logs,setLogs,addLog,setModal}){
  const[step,setStep]=useState(1);
  const[empresaSel,setEmpresaSel]=useState(null);
  const[clienteSel,setClienteSel]=useState(null);
  const[filialSel,setFilialSel]=useState(null);
  const[tipo,setTipo]=useState(null);
  const[acomp,setAcomp]=useState(null);
  const[selDate,setSelDate]=useState(null);
  const[selHora,setSelHora]=useState(null);
  const[vistSel,setVistSel]=useState(null);
  const[form,setForm]=useState({mobilia:'sem_mobilia'});
  const[pdfNome,setPdfNome]=useState('');
  const[pdfData,setPdfData]=useState('');
  const fileRef=useRef();
  const updF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const m2=form.m2||'';
  const duracao=calcDur(m2,form.mobilia,config);
  const camposOrdenados=config.camposOrdem||DEFAULT_CAMPOS_ORDEM;
  const handlePdf=(e)=>{const file=e.target.files?.[0];if(!file||file.type!=='application/pdf')return;setPdfNome(file.name);const r=new FileReader();r.onload=ev=>setPdfData(ev.target.result);r.readAsDataURL(file);};
  const slots=selDate&&acomp&&filialSel&&tipo&&m2?slotsDisp(inspectors,ags,selDate,duracao,filialSel,tipo,parseInt(m2)):[];

  const confirmar=()=>{
    if(acomp&&selHora&&slots.length>0&&!slots.includes(selHora)){
      setModal({icon:'⚠️',title:'Sem Capacidade',message:'Não há vistoriadores disponíveis para este horário.',confirmLabel:'OK',onConfirm:()=>setModal(null),onCancel:()=>setModal(null)});
      return;
    }
    const p=genID();
    const emp=empresas.find(e=>e.id===empresaSel);
    const cli=clients.find(c=>c.id===clienteSel);
    const fil=filiais.find(f=>f.id===filialSel);
    let vistIdFinal=vistSel;
    if(!vistIdFinal&&acomp&&selHora){
      const v=vistDispAleatorio(inspectors,ags,selDate,selHora,duracao,filialSel,tipo,parseInt(m2));
      if(v)vistIdFinal=v.id;
    }
    const novo={
      id:p,clienteId:clienteSel,empresaId:empresaSel,empresaNome:emp?.nome||'',clienteNome:cli?.nome||'',clienteTel:cli?.tel||'',
      tipo,dataObj:new Date(selDate).toISOString(),hora:selHora||'A definir',filialId:filialSel,
      endereco:form.endereco||'',cep:form.cep||'',localChaves:form.localChaves||'',obs:form.obs||'',
      nomeAcompanhante:acomp&&form.nomeAcompanhante?form.nomeAcompanhante:'',contatoAcompanhante:acomp&&form.contatoAcompanhante?form.contatoAcompanhante:'',
      mobilia:form.mobilia||'sem_mobilia',nomeLocador:form.nomeLocador||'',nomeLocatario:form.nomeLocatario||'',
      valorLocacao:form.valorLocacao||'',valorVistoria:form.valorVistoria||'',codigoImovel:form.codigoImovel||'',
      pdfNome,pdfData,status:'agendado',m2:parseInt(m2),acompanhada:acomp,vistoriadorId:vistIdFinal,duracaoMin:duracao
    };
    const lista=[...ags,novo];
    setAgs(lista);persist(undefined,undefined,undefined,undefined,lista);
    addLog(logs,setLogs,user,'Agendamento Manual',`${p} - ${tipo} - ${fil?.nome}`,p);
    showToast('✅ Agendamento criado!');onClose();
  };

  const LBLS=['Empresa/Cliente','Filial/Tipo','Acomp.','Data','Imóvel','OK'];
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',display:'flex',alignItems:'flex-start',justifyContent:'center',zIndex:9999,padding:'14px',overflowY:'auto'}}>
      <div style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:14,padding:18,maxWidth:640,width:'100%',marginTop:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <h3 style={{fontWeight:800,fontSize:16,margin:0}}>➕ Novo Agendamento</h3>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:17}}>✕</button>
        </div>
        <div style={{display:'flex',alignItems:'center',marginBottom:12,overflowX:'auto'}}>
          {[1,2,3,4,5,6].map((n,i)=>(
            <div key={n} style={{display:'flex',alignItems:'center',flex:i<5?1:'none'}}>
              <div style={{display:'flex',alignItems:'center',gap:3,whiteSpace:'nowrap'}}>
                <div style={{width:19,height:19,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,background:step>n?'rgba(0,212,170,.15)':step===n?C.accent:C.card,border:`1.5px solid ${step>=n?C.accent:C.border2}`,color:step>n?C.accent:step===n?'#000':C.muted,flexShrink:0}}>{step>n?'✓':n}</div>
                <span style={{fontSize:10,color:step>=n?C.text:C.muted,fontWeight:500}}>{LBLS[i]}</span>
              </div>
              {i<5&&<div style={{flex:1,height:1,background:C.border2,margin:'0 3px',minWidth:5}}/>}
            </div>
          ))}
        </div>
        {step===1&&<>
          <div><label style={S.lbl}>Empresa *</label><select style={S.inp()} value={empresaSel||''} onChange={e=>setEmpresaSel(parseInt(e.target.value))}><option value="">Selecione</option>{empresas.filter(e=>!e.bloqueado).map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</select></div>
          {empresaSel&&<div style={{marginTop:8}}><label style={S.lbl}>Cliente *</label><select style={S.inp()} value={clienteSel||''} onChange={e=>setClienteSel(parseInt(e.target.value))}><option value="">Selecione</option>{clients.filter(c=>c.empresaId===empresaSel&&!c.bloqueado).map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>}
          <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:10}}><button style={S.btnG} onClick={onClose}>Cancelar</button><button style={S.btnP(!empresaSel||!clienteSel)} disabled={!empresaSel||!clienteSel} onClick={()=>setStep(2)}>Próximo →</button></div>
        </>}
        {step===2&&<>
          <div><label style={S.lbl}>Filial *</label><select style={S.inp()} value={filialSel||''} onChange={e=>setFilialSel(parseInt(e.target.value))}><option value="">Selecione</option>{filiais.filter(f=>f.ativa).map(f=><option key={f.id} value={f.id}>{f.nome}</option>)}</select></div>
          {filialSel&&<div style={{marginTop:8}}><label style={S.lbl}>Tipo *</label><select style={S.inp()} value={tipo||''} onChange={e=>setTipo(e.target.value)}><option value="">Selecione</option>{tipos.filter(t=>t.ativo).map(t=><option key={t.name} value={t.name}>{t.icon} {t.name}</option>)}</select></div>}
          <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:10}}><button style={S.btnG} onClick={()=>setStep(1)}>← Voltar</button><button style={S.btnP(!filialSel||!tipo)} disabled={!filialSel||!tipo} onClick={()=>setStep(3)}>Próximo →</button></div>
        </>}
        {step===3&&<>
          <div><label style={S.lbl}>Metragem (m²) *</label><input style={S.inp()} type="number" min="1" placeholder="Ex: 80" value={form.m2||''} onChange={e=>updF('m2',e.target.value)}/></div>
          <div style={{marginTop:8}}><label style={S.lbl}>Mobília</label><select style={S.inp()} value={form.mobilia||'sem_mobilia'} onChange={e=>updF('mobilia',e.target.value)}><option value="sem_mobilia">Sem Mobília</option><option value="semi_mobiliado">Semi-Mobiliado (+30%)</option><option value="mobiliado">Mobiliado (+50%)</option></select></div>
          {parseInt(form.m2)>0&&<div style={{padding:'6px 10px',background:'rgba(0,212,170,.06)',border:'1px solid rgba(0,212,170,.15)',borderRadius:8,fontSize:11,marginTop:8}}>
            <span style={{color:C.accent,fontWeight:700}}>⏱ Duração: {fmtDur(duracao)}</span>
          </div>}
          <div style={{marginTop:8}}><label style={S.lbl}>Acompanhada? *</label><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:6}}><button onClick={()=>setAcomp(true)} style={{border:`1.5px solid ${acomp===true?C.accent:C.border2}`,background:acomp===true?'rgba(0,212,170,.1)':C.surface,borderRadius:8,padding:'10px 7px',cursor:'pointer',textAlign:'left',color:C.text}}><div style={{fontSize:16,marginBottom:3}}>👤</div><div style={{fontWeight:700,fontSize:11}}>Sim</div></button><button onClick={()=>setAcomp(false)} style={{border:`1.5px solid ${acomp===false?C.warn:C.border2}`,background:acomp===false?'rgba(244,196,48,.08)':C.surface,borderRadius:8,padding:'10px 7px',cursor:'pointer',textAlign:'left',color:C.text}}><div style={{fontSize:16,marginBottom:3}}>🔓</div><div style={{fontWeight:700,fontSize:11}}>Não</div></button></div></div>
          <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:10}}><button style={S.btnG} onClick={()=>setStep(2)}>← Voltar</button><button style={S.btnP(acomp===null||!form.m2)} disabled={acomp===null||!form.m2} onClick={()=>setStep(4)}>Próximo →</button></div>
        </>}
        {step===4&&<>
          <div><label style={S.lbl}>Data *</label><input type="date" style={S.inp()} value={selDate?dateStr(selDate):''} onChange={e=>setSelDate(new Date(e.target.value))}/></div>
          {selDate&&acomp&&<div style={{marginTop:8}}><label style={S.lbl}>Horário *</label><select style={S.inp()} value={selHora||''} onChange={e=>setSelHora(e.target.value)}><option value="">Selecione</option>{HORARIOS_PADRAO.map(h=><option key={h} value={h}>{h}</option>)}</select></div>}
          {selDate&&acomp&&selHora&&<div style={{marginTop:8}}><label style={S.lbl}>Vistoriador</label><select style={S.inp()} value={vistSel||''} onChange={e=>setVistSel(e.target.value||null)}><option value="">Atribuição automática</option>{inspectors.map(v=><option key={v.id} value={v.id}>{v.nome}</option>)}</select></div>}
          <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:10}}><button style={S.btnG} onClick={()=>setStep(3)}>← Voltar</button><button style={S.btnP(!selDate||(acomp&&!selHora))} disabled={!selDate||(acomp&&!selHora)} onClick={()=>setStep(5)}>Próximo →</button></div>
        </>}
        {step===5&&<>
          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:7,maxHeight:400,overflowY:'auto',padding:4}}>
            {camposOrdenados.map(k=>{
              const campo=config.camposFormulario?.[k];
              if(!campo?.ativo)return null;
              if(k==='m2'||k==='mobilia')return null;
              if(k==='valorVistoria'||k==='valorLocacao')return<div key={k}><label style={S.lbl}>{campo.label}{campo.obrigatorio&&' *'}</label><input style={S.inp()} placeholder="R$ 0,00" value={form[k]||''} onChange={e=>updF(k,maskValor(e.target.value))}/></div>;
              if(k==='cep')return<div key={k}><label style={S.lbl}>{campo.label}{campo.obrigatorio&&' *'}</label><input style={S.inp()} placeholder="00000-000" value={form[k]||''} onChange={e=>updF(k,maskCep(e.target.value))}/></div>;
              if(k==='nomeAcompanhante'||k==='contatoAcompanhante'){if(!acomp)return null;return<div key={k}><label style={S.lbl}>{campo.label}{campo.obrigatorio&&' *'}</label><input style={S.inp()} placeholder={k==='contatoAcompanhante'?'(00) 00000-0000':'Nome'} value={form[k]||''} onChange={e=>updF(k,k==='contatoAcompanhante'?maskPhone(e.target.value):e.target.value)}/></div>;}
              if(k==='obs')return<div key={k}><label style={S.lbl}>{campo.label}{campo.obrigatorio&&' *'}</label><textarea style={{...S.inp(),resize:'vertical',minHeight:50}} placeholder="Observações..." value={form[k]||''} onChange={e=>updF(k,e.target.value)}/></div>;
              return<div key={k}><label style={S.lbl}>{campo.label}{campo.obrigatorio&&' *'}</label><input style={S.inp()} value={form[k]||''} onChange={e=>updF(k,sanitizar(e.target.value))}/></div>;
            })}
            <div><label style={S.lbl}>📎 PDF</label><input ref={fileRef} type="file" accept="application/pdf" style={{display:'none'}} onChange={handlePdf}/>{pdfNome?<div style={{display:'flex',alignItems:'center',gap:7,padding:'8px 9px',background:'rgba(0,212,170,.06)',border:'1px solid rgba(0,212,170,.2)',borderRadius:8,marginTop:4}}><span style={{fontSize:15}}>📎</span><div style={{flex:1,fontSize:11,fontWeight:600}}>{pdfNome}</div><button onClick={()=>{setPdfNome('');setPdfData('');}} style={{background:'none',border:'none',color:C.danger,cursor:'pointer',fontSize:14}}>✕</button></div>:<button onClick={()=>fileRef.current.click()} style={{...S.btnG,width:'100%',marginTop:4}}>📄 Selecionar PDF</button>}</div>
          </div>
          <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:10}}><button style={S.btnG} onClick={()=>setStep(4)}>← Voltar</button><button style={S.btnP(!form.m2)} disabled={!form.m2} onClick={()=>setStep(6)}>Revisar →</button></div>
        </>}
        {step===6&&<>
          <div style={{background:C.surface,borderRadius:8,padding:12}}>
            <div style={{fontSize:10,color:C.muted,marginBottom:5}}>EMPRESA/CLIENTE</div>
            <div style={{fontSize:11,marginBottom:7}}>{empresas.find(e=>e.id===empresaSel)?.nome} · {clients.find(c=>c.id===clienteSel)?.nome}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:5}}>VISTORIA</div>
            <div style={{fontSize:11,marginBottom:7}}>{tipo} · {form.m2}m² · {fmtDur(duracao)}</div>
            <div style={{fontSize:10,color:C.muted,marginBottom:5}}>DATA/HORÁRIO</div>
            <div style={{fontSize:11}}>{selDate&&fmtDate(selDate)} · {selHora||'A definir'}</div>
          </div>
          <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:10}}><button style={S.btnG} onClick={()=>setStep(5)}>← Editar</button><button style={S.btnP()} onClick={confirmar}>Criar 🚀</button></div>
        </>}
      </div>
    </div>
  );
}

function ListaView({ags,inspectors,empresas,filiais,clients,setDetailAg,showToast}){
  const[filterDataInicio,setFilterDataInicio]=useState('');
  const[filterDataFim,setFilterDataFim]=useState('');
  const[filterVist,setFilterVist]=useState('');
  const[filterEmp,setFilterEmp]=useState('');
  const[filterFil,setFilterFil]=useState('');
  const[filterCli,setFilterCli]=useState('');
  const[filtrosAtivos,setFiltrosAtivos]=useState(false);

  const aplicarFiltros=()=>setFiltrosAtivos(true);
  const limparFiltros=()=>{setFilterDataInicio('');setFilterDataFim('');setFilterVist('');setFilterEmp('');setFilterFil('');setFilterCli('');setFiltrosAtivos(false);};

  const filtered=ags.filter(ag=>{
    if(!filtrosAtivos)return true;
    const agDate=new Date(ag.dataObj);
    if(filterDataInicio){const inicio=new Date(filterDataInicio);inicio.setHours(0,0,0,0);if(agDate<inicio)return false;}
    if(filterDataFim){const fim=new Date(filterDataFim);fim.setHours(23,59,59,999);if(agDate>fim)return false;}
    if(filterVist&&ag.vistoriadorId!==filterVist)return false;
    if(filterEmp&&ag.empresaId!==parseInt(filterEmp))return false;
    if(filterFil&&ag.filialId!==parseInt(filterFil))return false;
    if(filterCli&&ag.clienteId!==parseInt(filterCli))return false;
    return true;
  }).sort((a,b)=>new Date(b.dataObj)-new Date(a.dataObj));

  const exportXLS=()=>{
    const headers=['ID','Data','Horário','Filial','Empresa','Cliente','Tipo','Status','Vistoriador','Endereço','M²','Valor Locação','Valor Vistoria'];
    const rows=filtered.map(ag=>{
      const vst=inspectors.find(v=>v.id===ag.vistoriadorId);
      const fil=filiais.find(f=>f.id===ag.filialId);
      return[ag.id,fmtDate(ag.dataObj),ag.hora||'—',fil?.nome||'—',ag.empresaNome||'—',ag.clienteNome,ag.tipo,STATUS_CFG[ag.status]?.label||ag.status,vst?.nome||'Não atribuído',ag.endereco,ag.m2,ag.valorLocacao||'—',ag.valorVistoria||'—'];
    });
    const csv=[headers,...rows].map(row=>row.map(cell=>typeof cell==='string'&&cell.includes(',')?`"${cell}"`:cell).join(',')).join('\n');
    const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
    const link=document.createElement('a');link.href=URL.createObjectURL(blob);
    link.download=`agendamentos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();showToast('✅ Exportado!');
  };

  return(<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <h2 style={{fontSize:16,fontWeight:700,margin:0}}>📋 Lista ({filtered.length})</h2>
      <button style={S.btnP()} onClick={exportXLS}>📊 Exportar XLS</button>
    </div>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:12}}>
      <div style={{fontWeight:700,fontSize:12,marginBottom:8}}>🔍 Filtros</div>
      <div style={{display:'flex',gap:6,marginBottom:8,flexWrap:'wrap'}}>
        <input type="date" value={filterDataInicio} onChange={e=>setFilterDataInicio(e.target.value)} style={{...S.inp(),width:'auto',padding:'6px 8px',fontSize:11}}/>
        <input type="date" value={filterDataFim} onChange={e=>setFilterDataFim(e.target.value)} style={{...S.inp(),width:'auto',padding:'6px 8px',fontSize:11}}/>
        <select value={filterVist} onChange={e=>setFilterVist(e.target.value)} style={{...S.inp(),width:'auto',padding:'6px 8px',fontSize:11}}><option value=''>👷 Todos</option>{inspectors.map(v=><option key={v.id} value={v.id}>{v.nome}</option>)}</select>
        <select value={filterEmp} onChange={e=>setFilterEmp(e.target.value)} style={{...S.inp(),width:'auto',padding:'6px 8px',fontSize:11}}><option value=''>🏢 Todas</option>{empresas.map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</select>
        <select value={filterFil} onChange={e=>setFilterFil(e.target.value)} style={{...S.inp(),width:'auto',padding:'6px 8px',fontSize:11}}><option value=''>🏪 Todas</option>{filiais.filter(f=>f.ativa).map(f=><option key={f.id} value={f.id}>{f.nome}</option>)}</select>
        <select value={filterCli} onChange={e=>setFilterCli(e.target.value)} style={{...S.inp(),width:'auto',padding:'6px 8px',fontSize:11}}><option value=''>👤 Todos</option>{clients.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select>
      </div>
      <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
        <button style={S.btnG} onClick={limparFiltros}>Limpar Filtros</button>
        <button style={S.btnP()} onClick={aplicarFiltros}>Aplicar Filtros</button>
      </div>
    </div>
    <div style={{overflowX:'auto'}}>
      <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
        <thead><tr style={{background:C.surface,borderBottom:`1px solid ${C.border}`}}>
          {['ID','Data','Hora','Filial','Empresa','Cliente','Tipo','Status','Vistoriador'].map(h=><th key={h} style={{padding:'8px',textAlign:'left',fontSize:11,fontWeight:700,color:C.muted}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {filtered.map(ag=>{
            const vst=inspectors.find(v=>v.id===ag.vistoriadorId);
            const fil=filiais.find(f=>f.id===ag.filialId);
            return(<tr key={ag.id} onClick={()=>setDetailAg(ag)} style={{borderBottom:`1px solid ${C.border}`,cursor:'pointer',background:C.card}} onMouseEnter={e=>e.currentTarget.style.background=C.surface} onMouseLeave={e=>e.currentTarget.style.background=C.card}>
              <td style={{padding:'8px'}}><IDTag id={ag.id}/></td>
              <td style={{padding:'8px'}}>{fmtDate(ag.dataObj)}</td>
              <td style={{padding:'8px'}}>{ag.hora||'—'}</td>
              <td style={{padding:'8px',fontSize:10}}>{fil?.nome||'—'}</td>
              <td style={{padding:'8px',fontSize:10}}>{ag.empresaNome}</td>
              <td style={{padding:'8px'}}>{ag.clienteNome.split(' ')[0]}</td>
              <td style={{padding:'8px',fontSize:10}}>{ag.tipo}</td>
              <td style={{padding:'8px'}}><StatusChip status={ag.status}/></td>
              <td style={{padding:'8px',fontSize:10}}>{vst?.nome||'—'}</td>
            </tr>);
          })}
        </tbody>
      </table>
      {filtered.length===0&&<div style={{textAlign:'center',padding:'32px',color:C.muted}}>Nenhum agendamento encontrado</div>}
    </div>
  </div>);
}function ConfigGeralView({config,setConfig,tipos,setTipos,persist,showToast,setModal,user,logs,setLogs,addLog}){
  const[editMode,setEditMode]=useState(false);
  const[tempCfg,setTempCfg]=useState(config);
  const[editTipo,setEditTipo]=useState(null);
  const[newTipo,setNewTipo]=useState(null);
  const[newCampo,setNewCampo]=useState(null);
  const logoFileRef=useRef();

  const upd=(k,v)=>setTempCfg(c=>({...c,[k]:v}));
  const updCampo=(campo,prop,val)=>setTempCfg(c=>({...c,camposFormulario:{...c.camposFormulario,[campo]:{...c.camposFormulario[campo],[prop]:val}}}));

  const moveCampo=(idx,dir)=>{
    const ordem=[...tempCfg.camposOrdem];
    const newIdx=idx+dir;
    if(newIdx<0||newIdx>=ordem.length)return;
    [ordem[idx],ordem[newIdx]]=[ordem[newIdx],ordem[idx]];
    setTempCfg(c=>({...c,camposOrdem:ordem}));
  };

  const addCampoCustom=()=>{
    if(!newCampo?.id||!newCampo?.label)return;
    const campos={...tempCfg.camposFormulario,[newCampo.id]:{label:newCampo.label,obrigatorio:false,ativo:true,custom:true}};
    const ordem=[...tempCfg.camposOrdem,newCampo.id];
    setTempCfg(c=>({...c,camposFormulario:campos,camposOrdem:ordem}));
    setNewCampo(null);showToast('✅ Campo adicionado!');
  };

  const remCampoCustom=(id)=>{
    const campos={...tempCfg.camposFormulario};
    delete campos[id];
    const ordem=tempCfg.camposOrdem.filter(x=>x!==id);
    setTempCfg(c=>({...c,camposFormulario:campos,camposOrdem:ordem}));
    showToast('✅ Campo removido!');
  };

  const save=()=>{
    setConfig(tempCfg);
    persist(undefined,undefined,undefined,undefined,undefined,undefined,tempCfg);
    addLog(logs,setLogs,user,'Configurações Alteradas','Configurações atualizadas');
    showToast('✅ Salvo!');setEditMode(false);
  };

  const handleLogoUpload=(e)=>{
    const file=e.target.files?.[0];
    if(!file)return;
    if(file.size>2*1024*1024){showToast('❌ Arquivo muito grande! Máx 2MB.');return;}
    const r=new FileReader();
    r.onload=ev=>{
      const novoConfig={...config,logoInovare:ev.target.result};
      setConfig(novoConfig);
      setTempCfg(novoConfig);
      persist(undefined,undefined,undefined,undefined,undefined,undefined,novoConfig);
      addLog(logs,setLogs,user,'Logo Atualizado','Nova logo');
      showToast('✅ Logo atualizado!');
    };
    r.readAsDataURL(file);
  };

  const removerLogo=()=>{
    const novoConfig={...config,logoInovare:''};
    setConfig(novoConfig);
    setTempCfg(novoConfig);
    persist(undefined,undefined,undefined,undefined,undefined,undefined,novoConfig);
    addLog(logs,setLogs,user,'Logo Removido','Logo removido');
    showToast('✅ Logo removido!');
  };

  const saveTipo=(upd)=>{
    const l=tipos.map(t=>t.id===upd.id?upd:t);
    setTipos(l);persist(undefined,undefined,undefined,undefined,undefined,l);
    addLog(logs,setLogs,user,'Tipo Editado',upd.name);
    showToast('✅ Salvo!');setEditTipo(null);
  };

  const addTipo=(t)=>{
    const l=[...tipos,{...t,id:Math.max(...tipos.map(x=>x.id),0)+1,ativo:true}];
    setTipos(l);persist(undefined,undefined,undefined,undefined,undefined,l);
    addLog(logs,setLogs,user,'Tipo Adicionado',t.name);
    showToast('✅ Adicionado!');setNewTipo(null);
  };

  const toggleAtivo=(id)=>{
    const l=tipos.map(t=>t.id===id?{...t,ativo:!t.ativo}:t);
    const tipo=l.find(t=>t.id===id);
    setTipos(l);persist(undefined,undefined,undefined,undefined,undefined,l);
    showToast(tipo.ativo?'✅ Ativado!':'⚠️ Desativado.');
  };

  const remTipo=(id)=>{
    const tipo=tipos.find(t=>t.id===id);
    setModal({icon:'⚠️',title:'Remover',message:'Remover este tipo?',confirmLabel:'Sim',confirmColor:C.danger,onConfirm:()=>{
      const l=tipos.filter(t=>t.id!==id);
      setTipos(l);persist(undefined,undefined,undefined,undefined,undefined,l);
      addLog(logs,setLogs,user,'Tipo Removido',tipo.name);
      showToast('✅ Removido.');setModal(null);
    }});
  };

  return(<div>
    <h2 style={{fontSize:16,fontWeight:700,marginBottom:12}}>⚙️ Configurações 🔒</h2>

    {/* LOGO */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:16}}>
      <h3 style={{fontSize:14,fontWeight:700,margin:'0 0 12px'}}>🖼️ Logo da Empresa</h3>
      <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
        <div style={{width:150,height:80,borderRadius:8,border:`2px dashed ${C.border2}`,display:'flex',alignItems:'center',justifyContent:'center',background:C.surface,overflow:'hidden',flexShrink:0}}>
          {config.logoInovare?<img src={config.logoInovare} alt="Logo" style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/>:<div style={{textAlign:'center',padding:8}}><div style={{fontSize:24,marginBottom:4}}>🖼️</div><span style={{fontSize:10,color:C.muted}}>Sem logo</span></div>}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          <input ref={logoFileRef} type="file" accept="image/png,image/jpeg,image/jpg" style={{display:'none'}} onChange={handleLogoUpload}/>
          <button style={S.btnP()} onClick={()=>logoFileRef.current.click()}>📁 Upload Logo</button>
          {config.logoInovare&&<button style={S.btnD} onClick={removerLogo}>✕ Remover</button>}
          <div style={{fontSize:10,color:C.muted,lineHeight:1.5}}>PNG ou JPG · Máx 2MB</div>
        </div>
      </div>
    </div>

    {/* REGRAS */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <h3 style={{fontSize:14,fontWeight:700,margin:0}}>📋 Regras de Agendamento</h3>
        {!editMode&&<button style={S.btnW} onClick={()=>{setTempCfg(config);setEditMode(true);}}>✏️ Editar</button>}
      </div>
      {editMode?<>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:10}}>
          <div><label style={S.lbl}>Antecedência Mínima (h)</label><input style={S.inp()} type="number" min="1" value={tempCfg.antecedenciaMinimaHoras} onChange={e=>upd('antecedenciaMinimaHoras',parseInt(e.target.value))}/></div>
          <div><label style={S.lbl}>Cancelamento Mínimo (h)</label><input style={S.inp()} type="number" min="1" value={tempCfg.cancelamentoMinimoHoras} onChange={e=>upd('cancelamentoMinimoHoras',parseInt(e.target.value))}/></div>
        </div>
        <div style={{background:'rgba(0,212,170,.05)',border:'1px solid rgba(0,212,170,.2)',borderRadius:8,padding:10,marginBottom:10}}>
          <div style={{fontWeight:700,fontSize:12,marginBottom:8,color:C.accent}}>⏱ Cálculo de Duração</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
            <div><label style={S.lbl}>Minutos por m²</label><input style={S.inp()} type="number" min="0" value={tempCfg.minutosPorMetro||1} onChange={e=>upd('minutosPorMetro',parseInt(e.target.value))}/></div>
            <div><label style={S.lbl}>Minutos Deslocamento</label><input style={S.inp()} type="number" min="0" value={tempCfg.minutosDeslocamento||30} onChange={e=>upd('minutosDeslocamento',parseInt(e.target.value))}/></div>
            <div><label style={S.lbl}>% Semi-Mobiliado</label><input style={S.inp()} type="number" min="0" max="100" value={tempCfg.percentualSemiMobiliado||30} onChange={e=>upd('percentualSemiMobiliado',parseInt(e.target.value))}/></div>
            <div><label style={S.lbl}>% Mobiliado</label><input style={S.inp()} type="number" min="0" max="100" value={tempCfg.percentualMobiliado||50} onChange={e=>upd('percentualMobiliado',parseInt(e.target.value))}/></div>
          </div>
          <div style={{fontSize:10,color:C.muted,marginTop:8,lineHeight:1.5}}>
            Fórmula: (m² × min/m²) + deslocamento + % mobília<br/>
            Exemplo 80m² mobiliado: (80×{tempCfg.minutosPorMetro||1})+{tempCfg.minutosDeslocamento||30} = {80*(tempCfg.minutosPorMetro||1)+(tempCfg.minutosDeslocamento||30)}min +{tempCfg.percentualMobiliado||50}% = {Math.round((80*(tempCfg.minutosPorMetro||1)+(tempCfg.minutosDeslocamento||30))*(1+(tempCfg.percentualMobiliado||50)/100))}min
          </div>
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}><button style={S.btnG} onClick={()=>setEditMode(false)}>Cancelar</button><button style={S.btnP()} onClick={save}>Salvar</button></div>
      </>:<>
        <div style={{fontSize:11,color:C.muted,marginBottom:3}}>Antecedência Mínima</div>
        <div style={{fontSize:13,marginBottom:8}}>{config.antecedenciaMinimaHoras}h antes</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:3}}>Cancelamento Até</div>
        <div style={{fontSize:13,marginBottom:8}}>{config.cancelamentoMinimoHoras}h antes</div>
        <div style={{fontSize:11,color:C.muted,marginBottom:3}}>Cálculo de Duração</div>
        <div style={{fontSize:13}}>{config.minutosPorMetro||1}min/m² + {config.minutosDeslocamento||30}min deslocamento</div>
        <div style={{fontSize:11,color:C.muted,marginTop:6}}>Semi: +{config.percentualSemiMobiliado||30}% · Mobiliado: +{config.percentualMobiliado||50}%</div>
      </>}
    </div>

    {/* CAMPOS */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <h3 style={{fontSize:14,fontWeight:700,margin:0}}>📝 Campos do Formulário</h3>
        <button style={S.btnP()} onClick={()=>setNewCampo({id:'',label:''})}>+ Campo</button>
      </div>
      {newCampo&&<div style={{background:C.surface,border:`1.5px solid ${C.accent}`,borderRadius:8,padding:10,marginBottom:8}}>
        <div style={{fontWeight:700,fontSize:11,marginBottom:8}}>Novo Campo</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:6}}>
          <div><label style={S.lbl}>ID</label><input style={S.inp()} placeholder="Ex: obs2" value={newCampo.id} onChange={e=>setNewCampo({...newCampo,id:sanitizar(e.target.value.replace(/\s/g,'_'))})}/></div>
          <div><label style={S.lbl}>Label</label><input style={S.inp()} placeholder="Ex: Obs Extras" value={newCampo.label} onChange={e=>setNewCampo({...newCampo,label:sanitizar(e.target.value)})}/></div>
        </div>
        <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}><button style={S.btnG} onClick={()=>setNewCampo(null)}>Cancelar</button><button style={S.btnP(!newCampo.id||!newCampo.label)} disabled={!newCampo.id||!newCampo.label} onClick={addCampoCustom}>Adicionar</button></div>
      </div>}
      {tempCfg.camposOrdem?.map((k,idx)=>{
        const v=tempCfg.camposFormulario[k];
        if(!v)return null;
        return(<div key={k} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px',background:v.ativo?C.surface:'rgba(255,77,109,.05)',border:`1px solid ${v.ativo?C.border2:'rgba(255,77,109,.2)'}`,borderRadius:8,marginBottom:6}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{display:'flex',flexDirection:'column',gap:2}}>
              <button onClick={()=>moveCampo(idx,-1)} disabled={idx===0} style={{...S.btnG,padding:'2px 6px',fontSize:10,opacity:idx===0?.4:1}}>▲</button>
              <button onClick={()=>moveCampo(idx,1)} disabled={idx===tempCfg.camposOrdem.length-1} style={{...S.btnG,padding:'2px 6px',fontSize:10,opacity:idx===tempCfg.camposOrdem.length-1?.4:1}}>▼</button>
            </div>
            <div>
              <div style={{fontWeight:600,fontSize:12}}>{v.label}{v.custom&&<span style={{fontSize:9,padding:'2px 5px',borderRadius:12,background:'rgba(0,212,170,.1)',color:C.accent,marginLeft:4}}>Custom</span>}</div>
              <div style={{fontSize:10,color:C.muted}}>{v.obrigatorio?'Obrigatório':'Opcional'}</div>
            </div>
          </div>
          <div style={{display:'flex',gap:5}}>
            <button onClick={()=>updCampo(k,'obrigatorio',!v.obrigatorio)} style={{...S.btnG,fontSize:11,padding:'4px 8px'}}>{v.obrigatorio?'→ Opcional':'→ Obrig.'}</button>
            <button onClick={()=>updCampo(k,'ativo',!v.ativo)} style={v.ativo?{...S.btnD,fontSize:11,padding:'4px 8px'}:{...S.btnP(),fontSize:11,padding:'4px 8px'}}>{v.ativo?'Desativar':'Ativar'}</button>
            {v.custom&&<button onClick={()=>remCampoCustom(k)} style={{...S.btnD,fontSize:11,padding:'4px 8px'}}>✕</button>}
          </div>
        </div>);
      })}
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:8}}><button style={S.btnP()} onClick={save}>Salvar Campos</button></div>
    </div>

    {/* TIPOS */}
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
        <h3 style={{fontSize:14,fontWeight:700,margin:0}}>🏠 Tipos de Serviço ({tipos.filter(t=>t.ativo).length}/{tipos.length})</h3>
        <button style={S.btnP()} onClick={()=>setNewTipo({icon:'🏠',name:'',desc:''})}>+ Novo</button>
      </div>
      {newTipo&&<TipoForm data={newTipo} setData={setNewTipo} onSave={addTipo} onCancel={()=>setNewTipo(null)} isNew/>}
      {tipos.map(t=>(
        <div key={t.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:10,marginBottom:8,opacity:t.ativo?1:.5}}>
          {editTipo?.id===t.id?<TipoForm data={editTipo} setData={setEditTipo} onSave={saveTipo} onCancel={()=>setEditTipo(null)}/>:<>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:6}}>
              <div style={{display:'flex',alignItems:'center',gap:7}}>
                <span style={{fontSize:18}}>{t.icon}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:12}}>{t.name}</div>
                  <div style={{fontSize:10,color:C.muted}}>{t.desc}</div>
                </div>
                {!t.ativo&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:20,fontWeight:600,background:'rgba(255,77,109,.1)',color:C.danger}}>Desativado</span>}
              </div>
              <div style={{display:'flex',gap:5}}>
                <button style={t.ativo?S.btnG:S.btnP()} onClick={()=>toggleAtivo(t.id)}>{t.ativo?'Desativar':'Ativar'}</button>
                <button style={S.btnW} onClick={()=>setEditTipo({...t})}>✏️</button>
                <button style={S.btnD} onClick={()=>remTipo(t.id)}>✕</button>
              </div>
            </div>
          </>}
        </div>
      ))}
    </div>
  </div>);
}

function TipoForm({data,setData,onSave,onCancel,isNew=false}){
  const upd=(k,v)=>setData(d=>({...d,[k]:v}));
  const ok=data.icon&&data.name&&data.desc;
  const emojis=['🏠','🔑','🔄','⚖️','📋','🚁','📌','🔧','📊','📝'];
  return(<div style={{background:C.card,border:`1.5px solid ${C.accent}`,borderRadius:8,padding:10,marginBottom:8}}>
    <div style={{fontWeight:700,fontSize:11,marginBottom:8}}>{isNew?'Novo Tipo':'Editar'}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr',gap:6}}>
      <div><label style={S.lbl}>Ícone *</label><div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:4}}>{emojis.map(e=><button key={e} onClick={()=>upd('icon',e)} style={{width:32,height:32,borderRadius:6,border:`1.5px solid ${data.icon===e?C.accent:C.border2}`,background:data.icon===e?'rgba(0,212,170,.1)':C.surface,cursor:'pointer',fontSize:16}}>{e}</button>)}</div></div>
      <div><label style={S.lbl}>Nome *</label><input style={S.inp()} value={data.name} onChange={e=>upd('name',sanitizar(e.target.value))} placeholder="Ex: Vistoria entrada"/></div>
      <div><label style={S.lbl}>Descrição *</label><input style={S.inp()} value={data.desc} onChange={e=>upd('desc',sanitizar(e.target.value))} placeholder="Ex: Entrada do imóvel"/></div>
    </div>
    <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:8}}><button style={S.btnG} onClick={onCancel}>Cancelar</button><button style={S.btnP(!ok)} disabled={!ok} onClick={()=>onSave(data)}>{isNew?'Adicionar':'Salvar'}</button></div>
  </div>);
}function VistoriadoresView({inspectors,setInspectors,filiais,tipos,config,persist,showToast,setModal,user,logs,setLogs,addLog}){
  const[editInsp,setEditInsp]=useState(null);
  const[newInsp,setNewInsp]=useState(null);
  const[bloqSel,setBloqSel]=useState(null);
  const[bloqDate,setBloqDate]=useState(null);
  const[bloqMotivo,setBloqMotivo]=useState('');
  const[bloqHoraSel,setBloqHoraSel]=useState(null);
  const[bloqHoraDate,setBloqHoraDate]=useState(null);
  const[bloqHoraIni,setBloqHoraIni]=useState('08:15');
  const[bloqHoraFim,setBloqHoraFim]=useState('10:30');
  const[bloqHoraMotivo,setBloqHoraMotivo]=useState('');
  const cores=['#00d4aa','#a78bfa','#0099ff','#f4c430','#ff4d6d','#34d399','#fb923c'];

  const saveInsp=(upd)=>{
    if(!validarEmail(upd.email)){showToast('❌ E-mail inválido!');return;}
    if(!validarCPFCompleto(upd.cpf)){showToast('❌ CPF inválido!');return;}
    const l=inspectors.map(v=>v.id===upd.id?{...upd,senha:upd.senha.startsWith('$2a$')?upd.senha:hashSenha(upd.senha)}:v);
    setInspectors(l);persist(undefined,undefined,l);
    addLog(logs,setLogs,user,'Vistoriador Editado',upd.nome);
    showToast('✅ Salvo!');setEditInsp(null);
  };

  const addInsp=(v)=>{
    if(!validarEmail(v.email)){showToast('❌ E-mail inválido!');return;}
    if(!validarCPFCompleto(v.cpf)){showToast('❌ CPF inválido!');return;}
    const camposVisiveis={};
    Object.keys(config.camposFormulario||{}).forEach(k=>{camposVisiveis[k]=true;});
    const l=[...inspectors,{...v,id:genVID(),senha:hashSenha(v.senha),bloqueios:[],bloqueiosHorario:[],cor:cores[inspectors.length%cores.length],camposVisiveis,foto:''}];
    setInspectors(l);persist(undefined,undefined,l);
    addLog(logs,setLogs,user,'Vistoriador Cadastrado',v.nome);
    showToast('✅ Cadastrado!');setNewInsp(null);
  };

  const remInsp=(id)=>{
    const vst=inspectors.find(v=>v.id===id);
    setModal({icon:'⚠️',title:'Remover',message:'Remover este vistoriador?',confirmLabel:'Sim',confirmColor:C.danger,onConfirm:()=>{
      const l=inspectors.filter(v=>v.id!==id);setInspectors(l);persist(undefined,undefined,l);addLog(logs,setLogs,user,'Vistoriador Removido',vst.nome);showToast('✅ Removido.');setModal(null);
    }});
  };

  const addBloq=(inspId)=>{
    if(!bloqDate)return;
    const ds=dateStr(bloqDate);
    const l=inspectors.map(v=>v.id===inspId?{...v,bloqueios:[...(v.bloqueios||[]),{data:ds,motivo:sanitizar(bloqMotivo)||'Bloqueio'}]}:v);
    setInspectors(l);persist(undefined,undefined,l);showToast('✅ Bloqueado!');setBloqDate(null);setBloqMotivo('');setBloqSel(null);
  };

  const remBloq=(inspId,ds)=>{
    const l=inspectors.map(v=>v.id===inspId?{...v,bloqueios:(v.bloqueios||[]).filter(b=>b.data!==ds)}:v);
    setInspectors(l);persist(undefined,undefined,l);showToast('✅ Desbloqueado.');
  };

  const addBloqHora=(inspId)=>{
    if(!bloqHoraDate)return;
    const ds=dateStr(bloqHoraDate);
    const l=inspectors.map(v=>v.id===inspId?{...v,bloqueiosHorario:[...(v.bloqueiosHorario||[]),{data:ds,horaInicio:bloqHoraIni,horaFim:bloqHoraFim,motivo:sanitizar(bloqHoraMotivo)||'Bloqueio'}]}:v);
    setInspectors(l);persist(undefined,undefined,l);showToast('✅ Horário bloqueado!');setBloqHoraDate(null);setBloqHoraMotivo('');setBloqHoraSel(null);
  };

  const remBloqHora=(inspId,idx)=>{
    const l=inspectors.map(v=>v.id===inspId?{...v,bloqueiosHorario:(v.bloqueiosHorario||[]).filter((_,i)=>i!==idx)}:v);
    setInspectors(l);persist(undefined,undefined,l);showToast('✅ Desbloqueado.');
  };

  return(<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <h2 style={{fontSize:16,fontWeight:700,margin:0}}>👷 Vistoriadores ({inspectors.length})</h2>
      <button style={S.btnP()} onClick={()=>setNewInsp({nome:'',email:'',senha:'',tel:'',rg:'',cpf:'',endereco:'',dataNasc:'',filialId:filiais[0]?.id||1,filiaisAtendidas:[],tiposAtendidos:[],metragemMax:null,diasTrabalho:[1,2,3,4,5],horaInicio:'08:00',horaFim:'17:00',pausaAlmoco:{inicio:'12:00',fim:'13:00'}})}>+ Novo</button>
    </div>
    {newInsp&&<InspForm data={newInsp} setData={setNewInsp} filiais={filiais} tipos={tipos} config={config} onSave={addInsp} onCancel={()=>setNewInsp(null)} isNew/>}
    {inspectors.map(v=>{
      const fil=filiais.find(f=>f.id===v.filialId);
      return(<div key={v.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:10}}>
        {editInsp?.id===v.id?<InspForm data={editInsp} setData={setEditInsp} filiais={filiais} tipos={tipos} config={config} onSave={saveInsp} onCancel={()=>setEditInsp(null)}/>:<>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10,flexWrap:'wrap',gap:6}}>
            <div style={{display:'flex',alignItems:'center',gap:7}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:v.cor||C.accent,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:11,color:'#000'}}>{v.nome[0]}</div>
              <div>
                <div style={{fontWeight:700,fontSize:13}}>{v.nome}</div>
                <div style={{fontSize:11,color:C.muted}}>{v.email} · {v.tel}</div>
                <div style={{fontSize:10,color:C.muted}}>🏪 {fil?.nome} · ⏰ {v.horaInicio}–{v.horaFim}</div>
                <div style={{fontSize:10,color:C.muted}}>🍽️ Almoço: {v.pausaAlmoco?.inicio||'12:00'}–{v.pausaAlmoco?.fim||'13:00'}</div>
                <div style={{fontSize:10,color:C.muted}}>📅 {v.diasTrabalho.map(d=>WEEK_FULL[d].substring(0,3)).join(', ')}</div>
                <div style={{fontSize:10,color:C.muted}}>Metragem máx: {v.metragemMax?`${v.metragemMax}m²`:'Sem limite'}</div>
              </div>
              <IDTag id={v.id}/>
            </div>
            <div style={{display:'flex',gap:5}}><button style={S.btnW} onClick={()=>setEditInsp({...v})}>✏️</button><button style={S.btnD} onClick={()=>remInsp(v.id)}>✕</button></div>
          </div>
          <div style={{paddingTop:10,borderTop:`1px solid ${C.border}`}}>
            <div style={{fontWeight:600,fontSize:11,marginBottom:7}}>🔒 Bloqueios de Dia</div>
            {bloqSel===v.id?<>
              <MiniCal selDate={bloqDate} onSelect={d=>setBloqDate(d)} blockedDates={(v.bloqueios||[]).map(b=>b.data)} workDays={[0,1,2,3,4,5,6]}/>
              <div style={{marginTop:7,display:'flex',gap:5,flexWrap:'wrap',alignItems:'center'}}>
                <input style={{...S.inp(),maxWidth:160}} placeholder="Motivo" value={bloqMotivo} onChange={e=>setBloqMotivo(e.target.value)}/>
                {bloqDate&&<button style={S.btnP()} onClick={()=>addBloq(v.id)}>Bloquear {fmtDate(bloqDate)}</button>}
                <button style={S.btnG} onClick={()=>{setBloqSel(null);setBloqDate(null);}}>Cancelar</button>
              </div>
            </>:<button style={S.btnG} onClick={()=>{setBloqSel(v.id);setBloqDate(null);}}>+ Bloquear dia</button>}
            {v.bloqueios?.length>0&&<div style={{marginTop:7,display:'flex',flexWrap:'wrap',gap:4}}>
              {v.bloqueios.map(b=><div key={b.data} style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,77,109,.08)',border:'1px solid rgba(255,77,109,.2)',borderRadius:7,padding:'2px 7px',fontSize:10}}>🔒 {b.data}{b.motivo?` · ${b.motivo}`:''}<button onClick={()=>remBloq(v.id,b.data)} style={{background:'none',border:'none',color:C.danger,cursor:'pointer',fontSize:12}}>×</button></div>)}
            </div>}
            <div style={{marginTop:10}}>
              <div style={{fontWeight:600,fontSize:11,marginBottom:7}}>⏰ Bloqueios de Horário</div>
              {bloqHoraSel===v.id?<>
                <MiniCal selDate={bloqHoraDate} onSelect={d=>setBloqHoraDate(d)} workDays={[0,1,2,3,4,5,6]}/>
                <div style={{marginTop:7,display:'grid',gridTemplateColumns:'1fr 1fr',gap:5}}>
                  <div><label style={S.lbl}>Início</label><select style={S.inp()} value={bloqHoraIni} onChange={e=>setBloqHoraIni(e.target.value)}>{HORARIOS_PADRAO.map(h=><option key={h}>{h}</option>)}</select></div>
                  <div><label style={S.lbl}>Fim</label><select style={S.inp()} value={bloqHoraFim} onChange={e=>setBloqHoraFim(e.target.value)}>{HORARIOS_PADRAO.map(h=><option key={h}>{h}</option>)}</select></div>
                </div>
                <div style={{marginTop:5,display:'flex',gap:5,flexWrap:'wrap',alignItems:'center'}}>
                  <input style={{...S.inp(),maxWidth:160}} placeholder="Motivo" value={bloqHoraMotivo} onChange={e=>setBloqHoraMotivo(e.target.value)}/>
                  {bloqHoraDate&&<button style={S.btnP()} onClick={()=>addBloqHora(v.id)}>Bloquear</button>}
                  <button style={S.btnG} onClick={()=>{setBloqHoraSel(null);setBloqHoraDate(null);}}>Cancelar</button>
                </div>
              </>:<button style={S.btnG} onClick={()=>{setBloqHoraSel(v.id);setBloqHoraDate(null);}}>+ Bloquear horário</button>}
              {v.bloqueiosHorario?.length>0&&<div style={{marginTop:7,display:'flex',flexWrap:'wrap',gap:4}}>
                {v.bloqueiosHorario.map((b,idx)=><div key={idx} style={{display:'flex',alignItems:'center',gap:5,background:'rgba(244,196,48,.08)',border:'1px solid rgba(244,196,48,.2)',borderRadius:7,padding:'2px 7px',fontSize:10}}>⏰ {b.data} {b.horaInicio}–{b.horaFim}{b.motivo?` · ${b.motivo}`:''}<button onClick={()=>remBloqHora(v.id,idx)} style={{background:'none',border:'none',color:C.danger,cursor:'pointer',fontSize:12}}>×</button></div>)}
              </div>}
            </div>
          </div>
        </>}
      </div>);
    })}
  </div>);
}

function InspForm({data,setData,filiais,tipos,config,onSave,onCancel,isNew=false}){
  const upd=(k,v)=>setData(d=>({...d,[k]:v}));
  const tog=d=>{const cur=data.diasTrabalho||[];setData(dd=>({...dd,diasTrabalho:cur.includes(d)?cur.filter(x=>x!==d):[...cur,d].sort()}));};
  const togFil=id=>{const cur=data.filiaisAtendidas||[];setData(d=>({...d,filiaisAtendidas:cur.includes(id)?cur.filter(x=>x!==id):[...cur,id]}));};
  const togTipo=nome=>{const cur=data.tiposAtendidos||[];setData(d=>({...d,tiposAtendidos:cur.includes(nome)?cur.filter(x=>x!==nome):[...cur,nome]}));};
  const togCampoVis=(campo)=>{const cur=data.camposVisiveis||{};setData(d=>({...d,camposVisiveis:{...cur,[campo]:!cur[campo]}}));};
  const ok=data.nome&&data.email&&data.senha&&data.tel&&data.cpf&&data.rg&&data.diasTrabalho?.length>0;
  const camposDisponiveis=Object.entries(config.camposFormulario||{}).filter(([k,v])=>v.ativo);
  return(<div style={{background:C.surface,border:`1.5px solid ${C.accent}`,borderRadius:10,padding:12,marginBottom:10}}>
    <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>{isNew?'Novo':'Editar'}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
      <div><label style={S.lbl}>Nome *</label><input style={S.inp()} value={data.nome} onChange={e=>upd('nome',sanitizar(e.target.value))}/></div>
      <div><label style={S.lbl}>E-mail *</label><input style={S.inp()} value={data.email} onChange={e=>upd('email',sanitizar(e.target.value))}/></div>
      <div><label style={S.lbl}>Telefone *</label><input style={S.inp()} value={data.tel} onChange={e=>upd('tel',maskPhone(e.target.value))}/></div>
      <div><label style={S.lbl}>Senha *</label><input style={S.inp()} type="password" value={data.senha} onChange={e=>upd('senha',e.target.value)}/></div>
      <div><label style={S.lbl}>CPF *</label><input style={S.inp()} value={data.cpf} onChange={e=>upd('cpf',maskCPF(e.target.value))}/></div>
      <div><label style={S.lbl}>RG *</label><input style={S.inp()} value={data.rg} onChange={e=>upd('rg',maskRG(e.target.value))}/></div>
      <div><label style={S.lbl}>Nascimento</label><input style={S.inp()} type="date" value={data.dataNasc} onChange={e=>upd('dataNasc',e.target.value)}/></div>
      <div><label style={S.lbl}>Filial Base *</label><select style={S.inp()} value={data.filialId} onChange={e=>upd('filialId',parseInt(e.target.value))}>{filiais.filter(f=>f.ativa).map(f=><option key={f.id} value={f.id}>{f.nome}</option>)}</select></div>
    </div>
    <div style={{marginTop:7}}><label style={S.lbl}>Endereço</label><input style={S.inp()} value={data.endereco} onChange={e=>upd('endereco',sanitizar(e.target.value))}/></div>
    <div style={{marginTop:7}}><label style={S.lbl}>Filiais Atendidas *</label><div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:4}}>{filiais.filter(f=>f.ativa).map(f=><button key={f.id} onClick={()=>togFil(f.id)} style={{padding:'4px 8px',borderRadius:6,border:`1.5px solid ${data.filiaisAtendidas?.includes(f.id)?C.accent:C.border2}`,background:data.filiaisAtendidas?.includes(f.id)?'rgba(0,212,170,.1)':C.surface,cursor:'pointer',color:C.text,fontSize:11}}>{f.nome}</button>)}</div></div>
    <div style={{marginTop:7}}><label style={S.lbl}>Tipos Atendidos *</label><div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:4}}>{tipos.filter(t=>t.ativo).map(t=><button key={t.name} onClick={()=>togTipo(t.name)} style={{padding:'4px 8px',borderRadius:6,border:`1.5px solid ${data.tiposAtendidos?.includes(t.name)?C.accent:C.border2}`,background:data.tiposAtendidos?.includes(t.name)?'rgba(0,212,170,.1)':C.surface,cursor:'pointer',color:C.text,fontSize:11}}>{t.icon} {t.name}</button>)}</div></div>
    <div style={{marginTop:7}}><label style={S.lbl}>Metragem Máx (m²)</label><input style={S.inp()} type="number" placeholder="Vazio = sem limite" value={data.metragemMax||''} onChange={e=>upd('metragemMax',e.target.value?parseInt(e.target.value):null)}/></div>
    <div style={{marginTop:7}}><label style={S.lbl}>Dias de Trabalho *</label><div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:4}}>{WEEK_FULL.map((d,i)=><button key={i} onClick={()=>tog(i)} style={{padding:'3px 7px',borderRadius:6,border:`1.5px solid ${data.diasTrabalho?.includes(i)?C.accent:C.border2}`,background:data.diasTrabalho?.includes(i)?'rgba(0,212,170,.1)':C.surface,cursor:'pointer',color:C.text,fontSize:11}}>{d.substring(0,3)}</button>)}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:7}}>
      <div><label style={S.lbl}>Início</label><select style={S.inp()} value={data.horaInicio} onChange={e=>upd('horaInicio',e.target.value)}>{gerarHorarios('06:00','18:00',30,'','').map(h=><option key={h}>{h}</option>)}</select></div>
      <div><label style={S.lbl}>Fim</label><select style={S.inp()} value={data.horaFim} onChange={e=>upd('horaFim',e.target.value)}>{gerarHorarios('06:00','20:00',30,'','').map(h=><option key={h}>{h}</option>)}</select></div>
    </div>
    <div style={{marginTop:7}}><label style={S.lbl}>🍽️ Pausa Almoço</label>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginTop:4}}>
        <div><label style={{...S.lbl,fontSize:10}}>Início</label><select style={S.inp()} value={data.pausaAlmoco?.inicio||'12:00'} onChange={e=>upd('pausaAlmoco',{...data.pausaAlmoco,inicio:e.target.value})}>{gerarHorarios('11:00','14:00',30,'','').map(h=><option key={h}>{h}</option>)}</select></div>
        <div><label style={{...S.lbl,fontSize:10}}>Fim</label><select style={S.inp()} value={data.pausaAlmoco?.fim||'13:00'} onChange={e=>upd('pausaAlmoco',{...data.pausaAlmoco,fim:e.target.value})}>{gerarHorarios('11:30','15:00',30,'','').map(h=><option key={h}>{h}</option>)}</select></div>
      </div>
    </div>
    <div style={{marginTop:7}}><label style={S.lbl}>Campos Visíveis</label><div style={{display:'flex',gap:4,flexWrap:'wrap',marginTop:4}}>
      {camposDisponiveis.map(([k,v])=><button key={k} onClick={()=>togCampoVis(k)} style={{padding:'4px 8px',borderRadius:6,border:`1.5px solid ${data.camposVisiveis?.[k]?C.accent:C.border2}`,background:data.camposVisiveis?.[k]?'rgba(0,212,170,.1)':C.surface,cursor:'pointer',color:C.text,fontSize:11}}>{v.label}</button>)}
    </div></div>
    <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:10}}><button style={S.btnG} onClick={onCancel}>Cancelar</button><button style={S.btnP(!ok)} disabled={!ok} onClick={()=>onSave(data)}>{isNew?'Cadastrar':'Salvar'}</button></div>
  </div>);
}function EmpresasView({empresas,setEmpresas,clients,setClients,persist,showToast,setModal,user,logs,setLogs,addLog}){
  const[editEmp,setEditEmp]=useState(null);
  const[newEmp,setNewEmp]=useState(null);
  const[editCl,setEditCl]=useState(null);
  const[newCl,setNewCl]=useState(null);

  const saveEmp=(upd)=>{
    if(!validarEmail(upd.email)){showToast('❌ E-mail inválido!');return;}
    const l=empresas.map(e=>e.id===upd.id?upd:e);
    setEmpresas(l);persist(l);
    addLog(logs,setLogs,user,'Empresa Editada',upd.nome);
    showToast('✅ Salvo!');setEditEmp(null);
  };

  const addEmp=(e)=>{
    if(!validarEmail(e.email)){showToast('❌ E-mail inválido!');return;}
    const l=[...empresas,{...e,id:Math.max(...empresas.map(x=>x.id),0)+1,bloqueado:false,motivoBloqueio:'',logo:''}];
    setEmpresas(l);persist(l);
    addLog(logs,setLogs,user,'Empresa Cadastrada',e.nome);
    showToast('✅ Cadastrada!');setNewEmp(null);
  };

  const remEmp=(id)=>{
    const emp=empresas.find(e=>e.id===id);
    const temClientes=clients.some(c=>c.empresaId===id);
    if(temClientes){setModal({icon:'⚠️',title:'Não é possível',message:'Esta empresa possui clientes.',confirmLabel:'OK',onConfirm:()=>setModal(null),onCancel:()=>setModal(null)});return;}
    setModal({icon:'⚠️',title:'Remover',message:'Remover esta empresa?',confirmLabel:'Sim',confirmColor:C.danger,onConfirm:()=>{const l=empresas.filter(e=>e.id!==id);setEmpresas(l);persist(l);addLog(logs,setLogs,user,'Empresa Removida',emp.nome);showToast('✅ Removida.');setModal(null);}});
  };

  const toggleBloqEmp=(id)=>{
    const emp=empresas.find(e=>e.id===id);
    if(!emp.bloqueado){
      const motivo=prompt('Motivo:')||'Bloqueio';
      const l=empresas.map(e=>e.id===id?{...e,bloqueado:true,motivoBloqueio:sanitizar(motivo)}:e);
      setEmpresas(l);persist(l);
      addLog(logs,setLogs,user,'Empresa Bloqueada',`${emp.nome} - ${motivo}`);
      showToast('🚫 Bloqueada!');
    }else{
      const l=empresas.map(e=>e.id===id?{...e,bloqueado:false,motivoBloqueio:''}:e);
      setEmpresas(l);persist(l);
      addLog(logs,setLogs,user,'Empresa Desbloqueada',emp.nome);
      showToast('✅ Desbloqueada!');
    }
  };

  const saveCl=(upd)=>{
    if(!validarEmail(upd.email)){showToast('❌ E-mail inválido!');return;}
    const emp=empresas.find(e=>e.id===upd.empresaId);
    const senhaFinal=upd.senha.startsWith('$2a$')?upd.senha:hashSenha(upd.senha);
    const l=clients.map(c=>c.id===upd.id?{...upd,senha:senhaFinal,empresa:emp}:c);
    setClients(l);persist(undefined,l);
    addLog(logs,setLogs,user,'Cliente Editado',upd.nome);
    showToast('✅ Salvo!');setEditCl(null);
  };

  const addCl=(c)=>{
    if(!validarEmail(c.email)){showToast('❌ E-mail inválido!');return;}
    const emp=empresas.find(e=>e.id===c.empresaId);
    const l=[...clients,{...c,id:Math.max(...clients.map(x=>x.id),0)+1,role:'client',senha:hashSenha(c.senha),empresa:emp,bloqueado:false,foto:'',aceitouLGPD:false}];
    setClients(l);persist(undefined,l);
    addLog(logs,setLogs,user,'Cliente Cadastrado',c.nome);
    showToast('✅ Cadastrado!');setNewCl(null);
  };

  const remCl=(id)=>{
    const cli=clients.find(c=>c.id===id);
    setModal({icon:'⚠️',title:'Remover',message:'Remover este cliente?',confirmLabel:'Sim',confirmColor:C.danger,onConfirm:()=>{const l=clients.filter(c=>c.id!==id);setClients(l);persist(undefined,l);addLog(logs,setLogs,user,'Cliente Removido',cli.nome);showToast('✅ Removido.');setModal(null);}});
  };

  const toggleBloqCl=(id)=>{
    const cli=clients.find(c=>c.id===id);
    const l=clients.map(c=>c.id===id?{...c,bloqueado:!c.bloqueado}:c);
    setClients(l);persist(undefined,l);
    addLog(logs,setLogs,user,cli.bloqueado?'Cliente Desbloqueado':'Cliente Bloqueado',cli.nome);
    showToast(cli.bloqueado?'✅ Desbloqueado!':'🚫 Bloqueado!');
  };

  return(<div>
    <h2 style={{fontSize:16,fontWeight:700,marginBottom:12}}>🏢 Empresas e Clientes</h2>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <h3 style={{fontSize:14,fontWeight:700,margin:0}}>Empresas ({empresas.length})</h3>
      <button style={S.btnP()} onClick={()=>setNewEmp({nome:'',cnpj:'',tel:'',email:'',endereco:''})}>+ Nova</button>
    </div>
    {newEmp&&<EmpresaForm data={newEmp} setData={setNewEmp} onSave={addEmp} onCancel={()=>setNewEmp(null)} isNew/>}
    {empresas.map(e=>{
      const usuarios=clients.filter(c=>c.empresaId===e.id);
      return(<div key={e.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:10,opacity:e.bloqueado?.5:1}}>
        {editEmp?.id===e.id?<EmpresaForm data={editEmp} setData={setEditEmp} onSave={saveEmp} onCancel={()=>setEditEmp(null)}/>:<>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:6}}>
            <div>
              <div style={{fontWeight:700,fontSize:13}}>{e.nome}{e.bloqueado&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:20,fontWeight:600,background:'rgba(255,77,109,.1)',color:C.danger,marginLeft:5}}>🚫 Bloqueada</span>}</div>
              <div style={{fontSize:11,color:C.muted}}>{e.cnpj} · {e.tel}</div>
              <div style={{fontSize:11,color:C.muted}}>{e.email}</div>
              <div style={{fontSize:11,color:C.muted}}>{e.endereco}</div>
              <div style={{fontSize:10,color:C.accent,marginTop:3}}>{usuarios.length} usuário(s)</div>
              {e.bloqueado&&e.motivoBloqueio&&<div style={{fontSize:10,color:C.danger,marginTop:2}}>Motivo: {e.motivoBloqueio}</div>}
            </div>
            <div style={{display:'flex',gap:5}}>
              <button style={e.bloqueado?S.btnP():S.btnD} onClick={()=>toggleBloqEmp(e.id)}>{e.bloqueado?'Desbloquear':'Bloquear'}</button>
              <button style={S.btnW} onClick={()=>setEditEmp({...e})}>✏️</button>
              <button style={S.btnD} onClick={()=>remEmp(e.id)}>✕</button>
            </div>
          </div>
        </>}
      </div>);
    })}

    <div style={{marginTop:20,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <h3 style={{fontSize:14,fontWeight:700,margin:0}}>Usuários ({clients.length})</h3>
      <button style={S.btnP()} onClick={()=>setNewCl({nome:'',email:'',senha:'',tel:'',empresaId:empresas[0]?.id||1})}>+ Novo</button>
    </div>
    {newCl&&<ClienteForm data={newCl} setData={setNewCl} empresas={empresas} onSave={addCl} onCancel={()=>setNewCl(null)} isNew/>}
    {empresas.map(emp=>{
      const usuarios=clients.filter(c=>c.empresaId===emp.id);
      if(usuarios.length===0)return null;
      return(<div key={emp.id} style={{marginBottom:16}}>
        <div style={{fontSize:12,fontWeight:700,color:C.accent,marginBottom:8}}>🏢 {emp.nome}</div>
        {usuarios.map(c=>(
          <div key={c.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:8,opacity:c.bloqueado?.5:1}}>
            {editCl?.id===c.id?<ClienteForm data={editCl} setData={setEditCl} empresas={empresas} onSave={saveCl} onCancel={()=>setEditCl(null)}/>:<>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:6}}>
                <div>
                  <div style={{fontWeight:700,fontSize:13}}>{c.nome}{c.bloqueado&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:20,fontWeight:600,background:'rgba(255,77,109,.1)',color:C.danger,marginLeft:5}}>🚫</span>}</div>
                  <div style={{fontSize:11,color:C.muted}}>{c.email} · {c.tel}</div>
                  {!c.aceitouLGPD&&<div style={{fontSize:10,color:C.warn,marginTop:2}}>⚠️ LGPD não aceito</div>}
                </div>
                <div style={{display:'flex',gap:5}}>
                  <button style={c.bloqueado?S.btnP():S.btnD} onClick={()=>toggleBloqCl(c.id)}>{c.bloqueado?'Desbloquear':'Bloquear'}</button>
                  <button style={S.btnW} onClick={()=>setEditCl({...c})}>✏️</button>
                  <button style={S.btnD} onClick={()=>remCl(c.id)}>✕</button>
                </div>
              </div>
            </>}
          </div>
        ))}
      </div>);
    })}
  </div>);
}

function EmpresaForm({data,setData,onSave,onCancel,isNew=false}){
  const upd=(k,v)=>setData(d=>({...d,[k]:v}));
  const ok=data.nome&&data.cnpj&&data.tel&&data.email;
  return(<div style={{background:C.surface,border:`1.5px solid ${C.accent}`,borderRadius:10,padding:12,marginBottom:10}}>
    <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>{isNew?'Nova':'Editar'}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr',gap:7}}>
      <div><label style={S.lbl}>Nome *</label><input style={S.inp()} value={data.nome} onChange={e=>upd('nome',sanitizar(e.target.value))}/></div>
      <div><label style={S.lbl}>CNPJ *</label><input style={S.inp()} value={data.cnpj} onChange={e=>upd('cnpj',maskCNPJ(e.target.value))}/></div>
      <div><label style={S.lbl}>Tel *</label><input style={S.inp()} value={data.tel} onChange={e=>upd('tel',maskPhone(e.target.value))}/></div>
      <div><label style={S.lbl}>Email *</label><input style={S.inp()} value={data.email} onChange={e=>upd('email',sanitizar(e.target.value))}/></div>
      <div><label style={S.lbl}>Endereço</label><input style={S.inp()} value={data.endereco||''} onChange={e=>upd('endereco',sanitizar(e.target.value))}/></div>
    </div>
    <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:10}}><button style={S.btnG} onClick={onCancel}>Cancelar</button><button style={S.btnP(!ok)} disabled={!ok} onClick={()=>onSave(data)}>{isNew?'Cadastrar':'Salvar'}</button></div>
  </div>);
}

function ClienteForm({data,setData,empresas,onSave,onCancel,isNew=false}){
  const upd=(k,v)=>setData(d=>({...d,[k]:v}));
  const ok=data.nome&&data.email&&data.senha&&data.tel&&data.empresaId;
  return(<div style={{background:C.surface,border:`1.5px solid ${C.accent}`,borderRadius:10,padding:12,marginBottom:10}}>
    <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>{isNew?'Novo':'Editar'}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr',gap:7}}>
      <div><label style={S.lbl}>Empresa *</label><select style={S.inp()} value={data.empresaId} onChange={e=>upd('empresaId',parseInt(e.target.value))}>{empresas.map(e=><option key={e.id} value={e.id}>{e.nome}</option>)}</select></div>
      <div><label style={S.lbl}>Nome *</label><input style={S.inp()} value={data.nome} onChange={e=>upd('nome',sanitizar(e.target.value))}/></div>
      <div><label style={S.lbl}>Email *</label><input style={S.inp()} value={data.email} onChange={e=>upd('email',sanitizar(e.target.value))}/></div>
      <div><label style={S.lbl}>Tel *</label><input style={S.inp()} value={data.tel} onChange={e=>upd('tel',maskPhone(e.target.value))}/></div>
      <div><label style={S.lbl}>Senha *</label><input style={S.inp()} type="password" value={data.senha} onChange={e=>upd('senha',e.target.value)}/></div>
    </div>
    <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:10}}><button style={S.btnG} onClick={onCancel}>Cancelar</button><button style={S.btnP(!ok)} disabled={!ok} onClick={()=>onSave(data)}>{isNew?'Cadastrar':'Salvar'}</button></div>
  </div>);
}

function AdminsView({admins,setAdmins,persist,showToast,setModal,user,logs,setLogs,addLog}){
  const[editAdm,setEditAdm]=useState(null);
  const[newAdm,setNewAdm]=useState(null);
  
  const saveAdm=(upd)=>{
    if(!validarEmail(upd.email)){showToast('❌ E-mail inválido!');return;}
    const senhaFinal=upd.senha.startsWith('$2a$')?upd.senha:hashSenha(upd.senha);
    const l=admins.map(a=>a.id===upd.id?{...upd,senha:senhaFinal}:a);
    setAdmins(l);persist(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,l);
    addLog(logs,setLogs,user,'Admin Editado',upd.nome);
    showToast('✅ Salvo!');setEditAdm(null);
  };

  const addAdm=(a)=>{
    if(!validarEmail(a.email)){showToast('❌ E-mail inválido!');return;}
    const l=[...admins,{...a,id:genADM(),role:'admin',senha:hashSenha(a.senha),ativo:true,aceitouLGPD:true,dataAceiteLGPD:new Date().toISOString()}];
    setAdmins(l);persist(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,l);
    addLog(logs,setLogs,user,'Admin Cadastrado',a.nome);
    showToast('✅ Cadastrado!');setNewAdm(null);
  };

  const remAdm=(id)=>{
    const adm=admins.find(a=>a.id===id);
    if(admins.length===1){setModal({icon:'⚠️',title:'Não é possível',message:'Deve existir pelo menos 1 admin.',confirmLabel:'OK',onConfirm:()=>setModal(null),onCancel:()=>setModal(null)});return;}
    setModal({icon:'⚠️',title:'Remover',message:'Remover este admin?',confirmLabel:'Sim',confirmColor:C.danger,onConfirm:()=>{const l=admins.filter(a=>a.id!==id);setAdmins(l);persist(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,l);addLog(logs,setLogs,user,'Admin Removido',adm.nome);showToast('✅ Removido.');setModal(null);}});
  };

  const toggleAtivo=(id)=>{const l=admins.map(a=>a.id===id?{...a,ativo:!a.ativo}:a);const adm=l.find(a=>a.id===id);setAdmins(l);persist(undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,l);addLog(logs,setLogs,user,adm.ativo?'Admin Ativado':'Admin Desativado',adm.nome);showToast(adm.ativo?'✅ Ativado!':'⚠️ Desativado.');};

  return(<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <h2 style={{fontSize:16,fontWeight:700,margin:0}}>👥 Admins ({admins.filter(a=>a.ativo).length}/{admins.length})</h2>
      <button style={S.btnP()} onClick={()=>setNewAdm({nome:'',email:'',senha:'',foto:'',permissoes:{dashboard:true,editarAgendamentos:true,criarAgendamentos:true,gerenciarVistoriadores:true,gerenciarClientes:true,configuracoes:true,acessarLogs:true,exportarXLS:true}})}>+ Novo</button>
    </div>
    {newAdm&&<AdminForm data={newAdm} setData={setNewAdm} onSave={addAdm} onCancel={()=>setNewAdm(null)} isNew/>}
    {admins.map(a=>(
      <div key={a.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:10,opacity:a.ativo?1:.5}}>
        {editAdm?.id===a.id?<AdminForm data={editAdm} setData={setEditAdm} onSave={saveAdm} onCancel={()=>setEditAdm(null)}/>:<>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:6}}>
            <div>
              <div style={{fontWeight:700,fontSize:13}}>{a.nome}{!a.ativo&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:20,fontWeight:600,background:'rgba(255,77,109,.1)',color:C.danger,marginLeft:5}}>Inativo</span>}</div>
              <div style={{fontSize:11,color:C.muted}}>{a.email}</div>
              <IDTag id={a.id}/>
              <div style={{fontSize:10,color:C.muted,marginTop:4}}>Permissões: {Object.entries(a.permissoes||{}).filter(([k,v])=>v).map(([k])=>k).join(', ')}</div>
            </div>
            <div style={{display:'flex',gap:5}}>
              <button style={a.ativo?S.btnG:S.btnP()} onClick={()=>toggleAtivo(a.id)}>{a.ativo?'Desativar':'Ativar'}</button>
              <button style={S.btnW} onClick={()=>setEditAdm({...a})}>✏️</button>
              <button style={S.btnD} onClick={()=>remAdm(a.id)}>✕</button>
            </div>
          </div>
        </>}
      </div>
    ))}
  </div>);
}

function AdminForm({data,setData,onSave,onCancel,isNew=false}){
  const upd=(k,v)=>setData(d=>({...d,[k]:v}));
  const togPerm=(k)=>setData(d=>({...d,permissoes:{...d.permissoes,[k]:!d.permissoes[k]}}));
  const ok=data.nome&&data.email&&data.senha;
  const perms=[{key:'dashboard',label:'Dashboard'},{key:'editarAgendamentos',label:'Editar Agendamentos'},{key:'criarAgendamentos',label:'Criar Agendamentos'},{key:'gerenciarVistoriadores',label:'Gerenciar Vistoriadores'},{key:'gerenciarClientes',label:'Gerenciar Clientes'},{key:'configuracoes',label:'Configurações'},{key:'acessarLogs',label:'Logs'},{key:'exportarXLS',label:'Exportar XLS'}];
  return(<div style={{background:C.surface,border:`1.5px solid ${C.accent}`,borderRadius:10,padding:12,marginBottom:10}}>
    <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>{isNew?'Novo':'Editar'}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr',gap:7}}>
      <div><label style={S.lbl}>Nome *</label><input style={S.inp()} value={data.nome} onChange={e=>upd('nome',sanitizar(e.target.value))}/></div>
      <div><label style={S.lbl}>Email *</label><input style={S.inp()} value={data.email} onChange={e=>upd('email',sanitizar(e.target.value))}/></div>
      <div><label style={S.lbl}>Senha *</label><input style={S.inp()} type="password" value={data.senha} onChange={e=>upd('senha',e.target.value)}/></div>
      <div><label style={S.lbl}>Permissões</label><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:4,marginTop:4}}>
        {perms.map(p=><button key={p.key} onClick={()=>togPerm(p.key)} style={{padding:'6px 8px',borderRadius:6,border:`1.5px solid ${data.permissoes?.[p.key]?C.accent:C.border2}`,background:data.permissoes?.[p.key]?'rgba(0,212,170,.1)':C.surface,cursor:'pointer',color:C.text,fontSize:11,textAlign:'left'}}>{data.permissoes?.[p.key]?'✓ ':''}{p.label}</button>)}
      </div></div>
    </div>
    <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:10}}><button style={S.btnG} onClick={onCancel}>Cancelar</button><button style={S.btnP(!ok)} disabled={!ok} onClick={()=>onSave(data)}>{isNew?'Cadastrar':'Salvar'}</button></div>
  </div>);
}

function LogsView({logs,ags}){
  const sorted=[...logs].sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));
  return(<div>
    <h2 style={{fontSize:16,fontWeight:700,marginBottom:12}}>📜 Logs de Auditoria ({logs.length})</h2>
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
      {sorted.length===0?<div style={{textAlign:'center',padding:'32px',color:C.muted}}>Nenhum log registrado</div>:sorted.map(log=>(
        <div key={log.id} style={{borderBottom:`1px solid ${C.border}`,padding:'10px 0'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4,flexWrap:'wrap',gap:4}}>
            <div style={{fontWeight:700,fontSize:12}}>{log.acao}{log.agendamentoId&&<IDTag id={log.agendamentoId}/>}</div>
            <div style={{fontSize:10,color:C.muted}}>{fmtDateTime(log.timestamp)}</div>
          </div>
          <div style={{fontSize:11,color:C.muted,marginBottom:2}}>{log.detalhes}</div>
          <div style={{fontSize:10,color:C.accent}}>👤 {log.usuario} ({log.usuarioId})</div>
          {log.navegador&&<div style={{fontSize:9,color:C.muted,marginTop:2}}>🌐 {log.navegador.substring(0,80)}...</div>}
        </div>
      ))}
    </div>
  </div>);
}

function FiliaisView({filiais,setFiliais,persist,showToast,setModal,user,logs,setLogs,addLog}){
  const[editFil,setEditFil]=useState(null);
  const[newFil,setNewFil]=useState(null);
  const saveFil=(upd)=>{const l=filiais.map(f=>f.id===upd.id?upd:f);setFiliais(l);persist(l);addLog(logs,setLogs,user,'Filial Editada',upd.nome);showToast('✅ Salvo!');setEditFil(null);};
  const addFil=(f)=>{const l=[...filiais,{...f,id:Math.max(...filiais.map(x=>x.id),0)+1,ativa:true}];setFiliais(l);persist(l);addLog(logs,setLogs,user,'Filial Cadastrada',f.nome);showToast('✅ Cadastrada!');setNewFil(null);};
  const remFil=(id)=>{
    const fil=filiais.find(f=>f.id===id);
    setModal({icon:'⚠️',title:'Remover',message:'Remover esta filial?',confirmLabel:'Sim',confirmColor:C.danger,onConfirm:()=>{const l=filiais.filter(f=>f.id!==id);setFiliais(l);persist(l);addLog(logs,setLogs,user,'Filial Removida',fil.nome);showToast('✅ Removida.');setModal(null);}});
  };
  const toggleAtiva=(id)=>{const l=filiais.map(f=>f.id===id?{...f,ativa:!f.ativa}:f);const fil=l.find(f=>f.id===id);setFiliais(l);persist(l);addLog(logs,setLogs,user,fil.ativa?'Filial Ativada':'Filial Desativada',fil.nome);showToast(fil.ativa?'✅ Ativada!':'⚠️ Desativada.');};

  return(<div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
      <h2 style={{fontSize:16,fontWeight:700,margin:0}}>🏪 Filiais ({filiais.filter(f=>f.ativa).length}/{filiais.length})</h2>
      <button style={S.btnP()} onClick={()=>setNewFil({nome:'',cidade:'',uf:'SP',endereco:'',tel:''})}>+ Nova</button>
    </div>
    {newFil&&<FilialForm data={newFil} setData={setNewFil} onSave={addFil} onCancel={()=>setNewFil(null)} isNew/>}
    {filiais.map(f=>(
      <div key={f.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginBottom:10,opacity:f.ativa?1:.5}}>
        {editFil?.id===f.id?<FilialForm data={editFil} setData={setEditFil} onSave={saveFil} onCancel={()=>setEditFil(null)}/>:<>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:6}}>
            <div>
              <div style={{fontWeight:700,fontSize:13}}>{f.nome}{!f.ativa&&<span style={{fontSize:9,padding:'2px 6px',borderRadius:20,fontWeight:600,background:'rgba(255,77,109,.1)',color:C.danger,marginLeft:5}}>Desativada</span>}</div>
              <div style={{fontSize:11,color:C.muted}}>{f.cidade}/{f.uf} · {f.tel}</div>
              <div style={{fontSize:11,color:C.muted}}>{f.endereco}</div>
            </div>
            <div style={{display:'flex',gap:5}}>
              <button style={f.ativa?S.btnG:S.btnP()} onClick={()=>toggleAtiva(f.id)}>{f.ativa?'Desativar':'Ativar'}</button>
              <button style={S.btnW} onClick={()=>setEditFil({...f})}>✏️</button>
              <button style={S.btnD} onClick={()=>remFil(f.id)}>✕</button>
            </div>
          </div>
        </>}
      </div>
    ))}
  </div>);
}

function FilialForm({data,setData,onSave,onCancel,isNew=false}){
  const upd=(k,v)=>setData(d=>({...d,[k]:v}));
  const ok=data.nome&&data.cidade&&data.uf&&data.tel;
  return(<div style={{background:C.surface,border:`1.5px solid ${C.accent}`,borderRadius:10,padding:12,marginBottom:10}}>
    <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>{isNew?'Nova':'Editar'}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr',gap:7}}>
      <div><label style={S.lbl}>Nome *</label><input style={S.inp()} value={data.nome} onChange={e=>upd('nome',sanitizar(e.target.value))}/></div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:7}}>
        <div><label style={S.lbl}>Cidade *</label><input style={S.inp()} value={data.cidade} onChange={e=>upd('cidade',sanitizar(e.target.value))}/></div>
        <div><label style={S.lbl}>UF *</label><input style={S.inp()} value={data.uf} onChange={e=>upd('uf',sanitizar(e.target.value.toUpperCase()))} maxLength={2}/></div>
      </div>
      <div><label style={S.lbl}>Endereço</label><input style={S.inp()} value={data.endereco} onChange={e=>upd('endereco',sanitizar(e.target.value))}/></div>
      <div><label style={S.lbl}>Tel *</label><input style={S.inp()} value={data.tel} onChange={e=>upd('tel',maskPhone(e.target.value))}/></div>
    </div>
    <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:10}}><button style={S.btnG} onClick={onCancel}>Cancelar</button><button style={S.btnP(!ok)} disabled={!ok} onClick={()=>onSave(data)}>{isNew?'Cadastrar':'Salvar'}</button></div>
  </div>);
}

function InspectorPanel({user,inspectors,ags,logout,toast,config}){
  const[detailAg,setDetailAg]=useState(null);
  const meus=[...ags].filter(a=>a.vistoriadorId===user.id&&a.status!=='cancelado').sort((a,b)=>new Date(a.dataObj)-new Date(b.dataObj));
  const logo=config?.logoInovare;
  return(<div style={S.app}>
    {toast&&<div style={{position:'fixed',bottom:16,left:'50%',transform:'translateX(-50%)',background:C.card,border:`1px solid ${C.accent}`,borderRadius:10,padding:'8px 14px',fontSize:12,fontWeight:600,color:C.accent,zIndex:9998}}>{toast}</div>}
    {detailAg&&<AgDetailModalInspector ag={detailAg} inspectors={inspectors} onClose={()=>setDetailAg(null)} camposVisiveis={user.camposVisiveis}/>}
    <div style={{flex:1,padding:'16px 20px 60px',maxWidth:900,margin:'0 auto',width:'100%'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {logo&&<img src={logo} alt="Logo" style={{maxHeight:38,maxWidth:110,objectFit:'contain'}}/>}
          <div style={{borderLeft:logo?`1px solid ${C.border}`:'none',paddingLeft:logo?10:0}}>
            <div style={{fontSize:14,fontWeight:700}}>👷 {user.nome.split(' ')[0]}</div>
            <div style={{fontSize:10,color:C.muted}}>Vistoriador 🔒</div>
          </div>
        </div>
        <button style={S.btnG} onClick={logout}>Sair</button>
      </div>
      <h3 style={{fontSize:14,fontWeight:700,marginBottom:10}}>Minha Agenda ({meus.length})</h3>
      {meus.length===0?<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'24px',textAlign:'center',color:C.muted}}>Nenhuma vistoria alocada.</div>:meus.map(ag=>(
        <div key={ag.id} style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:9,padding:10,marginBottom:8,cursor:'pointer'}} onClick={()=>setDetailAg(ag)}>
          <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:4,flexWrap:'wrap'}}>
            <span style={{fontWeight:700,fontSize:12}}>{ag.tipo}</span>
            <StatusChip status={ag.status}/>
            <IDTag id={ag.id}/>
            {!ag.acompanhada&&<span style={{fontSize:9,padding:'1px 5px',borderRadius:20,fontWeight:600,background:'rgba(244,196,48,.1)',color:C.warn,border:'1px solid rgba(244,196,48,.2)'}}>🔓</span>}
          </div>
          <div style={{fontSize:10,color:C.muted,marginBottom:2}}>🏢 {ag.empresaNome}</div>
          <div style={{fontSize:11,color:C.muted,marginBottom:2}}>📅 {fmtDtLong(ag.dataObj)} {ag.hora&&ag.hora!=='A definir'?`às ${ag.hora}`:''}</div>
          <div style={{fontSize:11,color:C.muted}}>📍 {ag.endereco} · 📐 {ag.m2}m²</div>
          {ag.pdfNome&&<div style={{fontSize:10,color:C.accent,marginTop:2}}>📎 {ag.pdfNome}</div>}
        </div>
      ))}
    </div>
  </div>);
}

const AgDetailModalInspector=({ag,inspectors,onClose,camposVisiveis})=>{
  if(!ag)return null;
  const ml={'sem_mobilia':'Sem Mobília','semi_mobiliado':'Semi-Mobiliado','mobiliado':'Mobiliado'}[ag.mobilia]||'—';
  const Row=({l,v,visible=true})=>{if(!visible)return null;return<div style={{display:'flex',gap:7,padding:'5px 0',borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:'uppercase',letterSpacing:'.4px',minWidth:100,flexShrink:0}}>{l}</span><span style={{fontSize:12}}>{v||'—'}</span></div>;};
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',display:'flex',alignItems:'flex-start',justifyContent:'center',zIndex:9999,padding:'14px',overflowY:'auto'}}>
      <div style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:14,padding:18,maxWidth:540,width:'100%',marginTop:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
          <div><div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap',marginBottom:4}}><h3 style={{fontWeight:800,fontSize:16,margin:0}}>{ag.tipo}</h3><StatusChip status={ag.status}/></div><IDTag id={ag.id}/></div>
          <button onClick={onClose} style={{background:'none',border:'none',color:C.muted,cursor:'pointer',fontSize:17}}>✕</button>
        </div>
        <Row l="Empresa" v={ag.empresaNome}/>
        <Row l="Cliente" v={ag.clienteNome}/>
        <Row l="Data" v={fmtDtLong(ag.dataObj)}/>
        <Row l="Horário" v={ag.hora||'—'}/>
        <Row l="Duração" v={fmtDur(ag.duracaoMin)}/>
        <Row l="Acompanhada" v={ag.acompanhada?'👤 Sim':'🔓 Não'}/>
        <Row l="Valor Vistoria" v={ag.valorVistoria} visible={camposVisiveis?.valorVistoria}/>
        <Row l="Código" v={ag.codigoImovel} visible={camposVisiveis?.codigoImovel}/>
        <Row l="Endereço" v={ag.endereco} visible={camposVisiveis?.endereco}/>
        <Row l="CEP" v={ag.cep} visible={camposVisiveis?.cep}/>
        <Row l="Metragem" v={`${ag.m2}m²`}/>
        <Row l="Chaves" v={ag.localChaves} visible={camposVisiveis?.localChaves}/>
        <Row l="Estado" v={ml} visible={camposVisiveis?.mobilia}/>
        <Row l="Obs" v={ag.obs} visible={camposVisiveis?.obs}/>
        <Row l="Locador" v={ag.nomeLocador} visible={camposVisiveis?.nomeLocador}/>
        <Row l="Locatário" v={ag.nomeLocatario} visible={camposVisiveis?.nomeLocatario}/>
        <Row l="Valor Locação" v={ag.valorLocacao} visible={camposVisiveis?.valorLocacao}/>
        {ag.acompanhada&&<><Row l="Acompanhante" v={ag.nomeAcompanhante} visible={camposVisiveis?.nomeAcompanhante}/><Row l="Contato" v={ag.contatoAcompanhante} visible={camposVisiveis?.contatoAcompanhante}/></>}
        {ag.pdfNome&&<div style={{margin:'11px 0 0'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:C.surface,border:`1px solid ${C.border2}`,borderRadius:8}}>
            <span style={{fontSize:16}}>📎</span>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:12}}>{ag.pdfNome}</div></div>
            {ag.pdfData&&<a href={ag.pdfData} download={ag.pdfNome} style={{...S.btnP(),textDecoration:'none',fontSize:11,display:'inline-block',padding:'6px 10px'}}>⬇ Baixar</a>}
          </div>
        </div>}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:11}}><button style={S.btnG} onClick={onClose}>Fechar</button></div>
      </div>
    </div>
  );
};function ClientPanel({user,filiais,empresas,inspectors,ags,setAgs,tipos,config,persist,logout,showToast,toast,modal,setModal,logs,setLogs,addLog}){
  const[tab,setTab]=useState('historico');
  const[step,setStep]=useState(1);
  const[filialSel,setFilialSel]=useState(null);
  const[tipo,setTipo]=useState(null);
  const[acomp,setAcomp]=useState(null);
  const[selDate,setSelDate]=useState(null);
  const[selHora,setSelHora]=useState(null);
  const[form,setForm]=useState({mobilia:'sem_mobilia'});
  const[pdfNome,setPdfNome]=useState('');
  const[pdfData,setPdfData]=useState('');
  const[agDone,setAgDone]=useState(false);
  const[protocol,setProtocol]=useState('');
  const[detailAg,setDetailAg]=useState(null);
  const fileRef=useRef();

  const meus=[...ags].filter(a=>a.clienteId===user.id).sort((a,b)=>new Date(b.dataObj)-new Date(a.dataObj));
  const updF=(k,v)=>setForm(f=>({...f,[k]:v}));
  const m2=form.m2||'';
  const duracao=calcDur(m2,form.mobilia,config);
  const slots=selDate&&acomp&&filialSel&&tipo&&m2?slotsDisp(inspectors,ags,selDate,duracao,filialSel,tipo,parseInt(m2)):[];
  const logo=config?.logoInovare;

  const resetAg=()=>{
    setStep(1);setFilialSel(null);setTipo(null);setAcomp(null);setSelDate(null);setSelHora(null);
    const initForm={mobilia:'sem_mobilia'};
    (config.camposOrdem||DEFAULT_CAMPOS_ORDEM).forEach(k=>{
      const campo=config.camposFormulario?.[k];
      if(campo?.ativo)initForm[k]='';
    });
    setForm(initForm);
    setPdfNome('');setPdfData('');setAgDone(false);
  };

  const handlePdf=(e)=>{const file=e.target.files?.[0];if(!file||file.type!=='application/pdf')return;setPdfNome(file.name);const r=new FileReader();r.onload=ev=>setPdfData(ev.target.result);r.readAsDataURL(file);};

  const confirmarAg=()=>{
    const now=new Date();
    const agDate=new Date(selDate);
    if(acomp&&selHora){
      const[h,m]=selHora.split(':').map(Number);
      agDate.setHours(h,m,0,0);
      const diffHours=(agDate-now)/1000/60/60;
      if(diffHours<config.antecedenciaMinimaHoras){
        setModal({icon:'⚠️',title:'Antecedência Insuficiente',message:`Necessário agendar com pelo menos ${config.antecedenciaMinimaHoras}h de antecedência.`,confirmLabel:'OK',onConfirm:()=>setModal(null),onCancel:()=>setModal(null)});
        return;
      }
    }
    const p=genID();
    let vistId=null;
    if(acomp&&selHora){
      const v=vistDispAleatorio(inspectors,ags,selDate,selHora,duracao,filialSel,tipo,parseInt(m2));
      if(v)vistId=v.id;
    }
    const fil=filiais.find(f=>f.id===filialSel);
    const novo={
      id:p,clienteId:user.id,empresaId:user.empresaId,empresaNome:user.empresa?.nome||'',clienteNome:user.nome,clienteTel:user.tel||'',
      tipo,dataObj:new Date(selDate).toISOString(),hora:acomp&&selHora?selHora:'A definir',filialId:filialSel,
      endereco:sanitizar(form.endereco)||'',cep:form.cep||'',localChaves:sanitizar(form.localChaves)||'',obs:sanitizar(form.obs)||'',
      nomeAcompanhante:acomp&&form.nomeAcompanhante?sanitizar(form.nomeAcompanhante):'',contatoAcompanhante:acomp&&form.contatoAcompanhante?form.contatoAcompanhante:'',
      mobilia:form.mobilia||'sem_mobilia',nomeLocador:sanitizar(form.nomeLocador)||'',nomeLocatario:sanitizar(form.nomeLocatario)||'',
      valorLocacao:form.valorLocacao||'',valorVistoria:form.valorVistoria||'',codigoImovel:sanitizar(form.codigoImovel)||'',
      pdfNome,pdfData,status:'agendado',m2:parseInt(m2),acompanhada:acomp,vistoriadorId:vistId,duracaoMin:duracao
    };
    const lista=[...ags,novo];
    setAgs(lista);
    persist(undefined,undefined,undefined,undefined,lista);
    addLog(logs,setLogs,user,'Agendamento Criado',`${tipo} - ${fil?.nome}${vistId?' - '+inspectors.find(v=>v.id===vistId)?.nome:''}`,p);
    setProtocol(p);setAgDone(true);
  };

  const cancelar=(id)=>{
    const ag=ags.find(a=>a.id===id);
    if(!ag)return;
    const now=new Date();
    const agDate=new Date(ag.dataObj);
    if(ag.hora&&ag.hora!=='A definir'){
      const[h,m]=ag.hora.split(':').map(Number);
      agDate.setHours(h,m,0,0);
      const diffHours=(agDate-now)/1000/60/60;
      if(diffHours<config.cancelamentoMinimoHoras){
        setModal({icon:'⚠️',title:'Prazo Encerrado',message:`Cancelamento permitido até ${config.cancelamentoMinimoHoras}h antes.`,confirmLabel:'OK',onConfirm:()=>setModal(null),onCancel:()=>setModal(null)});
        return;
      }
    }
    setModal({icon:'⚠️',title:'Cancelar',message:'Cancelar este agendamento?',confirmLabel:'Sim',confirmColor:C.danger,onConfirm:()=>{
      const l=ags.map(a=>a.id===id?{...a,status:'cancelado'}:a);
      setAgs(l);persist(undefined,undefined,undefined,undefined,l);
      addLog(logs,setLogs,user,'Agendamento Cancelado','Cliente cancelou',ag.id);
      setModal(null);showToast('✅ Cancelado.');
    }});
  };

  const LBLS=['Filial','Vistoria','M²/Acomp.','Data','Imóvel','OK'];
  const tiposAtivos=tipos.filter(t=>t.ativo);
  const filiaisAtivas=filiais.filter(f=>f.ativa);
  const camposOrdenados=config.camposOrdem||DEFAULT_CAMPOS_ORDEM;

  return(<div style={S.app}>
    {toast&&<div style={{position:'fixed',bottom:16,left:'50%',transform:'translateX(-50%)',background:C.card,border:`1px solid ${C.accent}`,borderRadius:10,padding:'8px 14px',fontSize:12,fontWeight:600,color:C.accent,zIndex:9998}}>{toast}</div>}
    {modal&&<Modal {...modal} onCancel={()=>setModal(null)}/>}
    {detailAg&&<AgDetailModal ag={detailAg} inspectors={inspectors} onClose={()=>setDetailAg(null)}/>}
    <div style={{flex:1,padding:'16px 20px 60px',maxWidth:900,margin:'0 auto',width:'100%'}}>

      {/* CABEÇALHO */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {logo&&<img src={logo} alt="Logo" style={{maxHeight:40,maxWidth:120,objectFit:'contain'}}/>}
          <div style={{borderLeft:logo?`1px solid ${C.border}`:'none',paddingLeft:logo?10:0}}>
            <h1 style={{fontSize:17,fontWeight:800,margin:'0 0 2px'}}>Olá, <span style={{color:C.accent}}>{user.nome.split(' ')[0]}</span> 👋</h1>
            <div style={{fontSize:11,color:C.muted}}>🏢 {user.empresa?.nome} · 🔒 Seguro</div>
          </div>
        </div>
        <button style={S.btnG} onClick={logout}>Sair</button>
      </div>

      {/* TABS */}
      <div style={{display:'flex',gap:5,marginBottom:14}}>
        {[['historico','📋 Agendamentos'],['agendar','➕ Novo']].map(([id,l])=>(
          <button key={id} onClick={()=>{setTab(id);if(id==='agendar')resetAg();}} style={{padding:'6px 11px',borderRadius:8,border:'none',cursor:'pointer',fontSize:12,fontWeight:600,background:tab===id?'linear-gradient(135deg,#00d4aa,#0099ff)':'transparent',color:tab===id?'#000':C.muted,whiteSpace:'nowrap'}}>{l}</button>
        ))}
      </div>

      {/* HISTÓRICO */}
      {tab==='historico'&&<>
        {meus.length===0&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'24px',textAlign:'center',color:C.muted}}>Nenhum agendamento ainda.</div>}
        {meus.map(ag=>{
          const vst=inspectors.find(v=>v.id===ag.vistoriadorId);
          const fil=filiais.find(f=>f.id===ag.filialId);
          const isFut=ag.status==='agendado';
          return(<div key={ag.id} style={{background:C.card,border:`1px solid ${C.border2}`,borderRadius:9,padding:10,marginBottom:8}}>
            <div onClick={()=>setDetailAg(ag)} style={{cursor:'pointer'}}>
              <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:4,flexWrap:'wrap'}}>
                <span style={{fontWeight:700,fontSize:12}}>{ag.tipo}</span>
                <StatusChip status={ag.status}/>
                {!ag.acompanhada&&<span style={{fontSize:9,padding:'1px 5px',borderRadius:20,fontWeight:600,background:'rgba(244,196,48,.1)',color:C.warn,border:'1px solid rgba(244,196,48,.2)'}}>🔓</span>}
                <IDTag id={ag.id}/>
              </div>
              <div style={{fontSize:10,color:C.muted,marginBottom:2}}>🏪 {fil?.nome||'—'}</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:2}}>📅 {fmtDate(ag.dataObj)} {ag.hora&&ag.hora!=='A definir'?`às ${ag.hora}`:''}</div>
              <div style={{fontSize:11,color:C.muted}}>📍 {ag.endereco} · 📐 {ag.m2}m²{vst?` · 👷 ${vst.nome.split(' ')[0]}`:''}</div>
              {ag.pdfNome&&<div style={{fontSize:10,color:C.accent,marginTop:2}}>📎 {ag.pdfNome}</div>}
            </div>
            {isFut&&<div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${C.border}`}}><button style={S.btnD} onClick={()=>cancelar(ag.id)}>✕ Cancelar</button></div>}
          </div>);
        })}
      </>}

      {/* AGENDAR */}
      {tab==='agendar'&&(agDone?(
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:'32px 16px',textAlign:'center'}}>
          <div style={{fontSize:40,marginBottom:8}}>✅</div>
          <h2 style={{fontWeight:800,fontSize:18,marginBottom:4}}>Agendamento Confirmado!</h2>
          <p style={{color:'#0099ff',fontSize:12,marginBottom:3}}>Status: Agendado 🔒</p>
          <div style={{display:'inline-block',fontWeight:700,color:C.accent,background:'rgba(0,212,170,.1)',border:'1px solid rgba(0,212,170,.25)',padding:'4px 12px',borderRadius:20,margin:'7px 0',fontSize:12}}># {protocol}</div>
          <div style={{marginTop:12}}><button style={{...S.btnP(),padding:'8px 18px'}} onClick={()=>{resetAg();setTab('historico');}}>Ver agendamentos</button></div>
        </div>
      ):(
        <>
          {/* STEPPER */}
          <div style={{display:'flex',alignItems:'center',marginBottom:12,overflowX:'auto'}}>
            {[1,2,3,4,5,6].map((n,i)=>(
              <div key={n} style={{display:'flex',alignItems:'center',flex:i<5?1:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:3,whiteSpace:'nowrap'}}>
                  <div style={{width:19,height:19,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,background:step>n?'rgba(0,212,170,.15)':step===n?C.accent:C.card,border:`1.5px solid ${step>=n?C.accent:C.border2}`,color:step>n?C.accent:step===n?'#000':C.muted,flexShrink:0}}>{step>n?'✓':n}</div>
                  <span style={{fontSize:10,color:step>=n?C.text:C.muted,fontWeight:500}}>{LBLS[i]}</span>
                </div>
                {i<5&&<div style={{flex:1,height:1,background:C.border2,margin:'0 3px',minWidth:5}}/>}
              </div>
            ))}
          </div>

          {/* STEP 1 - FILIAL */}
          {step===1&&<>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
              <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>🏪 Escolha a Filial</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:6}}>
                {filiaisAtivas.map(f=><button key={f.id} onClick={()=>setFilialSel(f.id)} style={{border:`1.5px solid ${filialSel===f.id?C.accent:C.border2}`,background:filialSel===f.id?'rgba(0,212,170,.1)':C.surface,borderRadius:8,padding:'10px 8px',cursor:'pointer',textAlign:'left',color:C.text}}><div style={{fontWeight:700,fontSize:12,marginBottom:2}}>{f.nome}</div><div style={{fontSize:10,color:C.muted}}>{f.cidade}/{f.uf}</div></button>)}
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:6}}><button style={S.btnP(!filialSel)} disabled={!filialSel} onClick={()=>setStep(2)}>Próximo →</button></div>
          </>}

          {/* STEP 2 - TIPO */}
          {step===2&&<>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
              <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>🔍 Tipo de Vistoria</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))',gap:6}}>
                {tiposAtivos.map(t=><button key={t.name} onClick={()=>setTipo(t.name)} style={{border:`1.5px solid ${tipo===t.name?C.accent:C.border2}`,background:tipo===t.name?'rgba(0,212,170,.1)':C.surface,borderRadius:8,padding:'9px 7px',cursor:'pointer',textAlign:'left',color:C.text}}><div style={{fontSize:15,marginBottom:3}}>{t.icon}</div><div style={{fontWeight:700,fontSize:11}}>{t.name}</div></button>)}
              </div>
            </div>
            <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:6}}><button style={S.btnG} onClick={()=>setStep(1)}>← Voltar</button><button style={S.btnP(!tipo)} disabled={!tipo} onClick={()=>setStep(3)}>Próximo →</button></div>
          </>}

          {/* STEP 3 - METRAGEM + ACOMPANHADA */}
          {step===3&&<>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
              <div style={{fontWeight:700,fontSize:12,marginBottom:11}}>📐 Metragem e Acompanhamento</div>
              <div style={{marginBottom:12}}>
                <label style={S.lbl}>Metragem (m²) *</label>
                <input style={S.inp()} type="number" min="1" placeholder="Ex: 80" value={form.m2||''} onChange={e=>updF('m2',e.target.value)}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.lbl}>Mobília</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5,marginTop:5}}>
                  {[['sem_mobilia','🛋️','Sem Mobília'],['semi_mobiliado','🪑','Semi (+30%)'],['mobiliado','🏠','Mobiliado (+50%)']].map(([val,ic,lb])=><button key={val} onClick={()=>updF('mobilia',val)} style={{border:`1.5px solid ${form.mobilia===val?C.accent:C.border2}`,background:form.mobilia===val?'rgba(0,212,170,.1)':C.surface,borderRadius:8,padding:'7px 5px',cursor:'pointer',color:C.text,textAlign:'center'}}><div style={{fontSize:14,marginBottom:2}}>{ic}</div><div style={{fontWeight:600,fontSize:10}}>{lb}</div></button>)}
                </div>
              </div>
              {parseInt(form.m2)>0&&<div style={{padding:'6px 10px',background:'rgba(0,212,170,.06)',border:'1px solid rgba(0,212,170,.15)',borderRadius:8,fontSize:11,marginBottom:12}}>
                <span style={{color:C.accent,fontWeight:700}}>⏱ Duração estimada: {fmtDur(duracao)}</span>
              </div>}
              <div>
                <label style={S.lbl}>Acompanhada? *</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:6}}>
                  <button onClick={()=>setAcomp(true)} style={{border:`1.5px solid ${acomp===true?C.accent:C.border2}`,background:acomp===true?'rgba(0,212,170,.1)':C.surface,borderRadius:8,padding:'10px 7px',cursor:'pointer',textAlign:'left',color:C.text}}>
                    <div style={{fontSize:16,marginBottom:3}}>👤</div>
                    <div style={{fontWeight:700,fontSize:11,marginBottom:2}}>Sim</div>
                    <div style={{fontSize:10,color:C.muted}}>Escolhe horário</div>
                  </button>
                  <button onClick={()=>{setAcomp(false);setSelHora(null);}} style={{border:`1.5px solid ${acomp===false?C.warn:C.border2}`,background:acomp===false?'rgba(244,196,48,.08)':C.surface,borderRadius:8,padding:'10px 7px',cursor:'pointer',textAlign:'left',color:C.text}}>
                    <div style={{fontSize:16,marginBottom:3}}>🔓</div>
                    <div style={{fontWeight:700,fontSize:11,marginBottom:2}}>Não</div>
                    <div style={{fontSize:10,color:C.muted}}>Inovare define</div>
                  </button>
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:6}}><button style={S.btnG} onClick={()=>setStep(2)}>← Voltar</button><button style={S.btnP(acomp===null||!form.m2)} disabled={acomp===null||!form.m2} onClick={()=>setStep(4)}>Próximo →</button></div>
          </>}

          {/* STEP 4 - DATA E HORÁRIO */}
          {step===4&&<>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
              <div style={{fontWeight:700,fontSize:12,marginBottom:4}}>📅 Data e Horário</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:9}}>{acomp?'Escolha a data e horário disponível':'Escolha a data preferencial'}</div>
              <MiniCal selDate={selDate} onSelect={d=>{setSelDate(d);setSelHora(null);}} workDays={[1,2,3,4,5,6]}/>
            </div>
            {selDate&&acomp&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12,marginTop:8}}>
              <div style={{fontWeight:700,fontSize:12,marginBottom:4}}>⏰ Horários Disponíveis</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:8}}>📐 {form.m2}m² · ⏱ {fmtDur(duracao)} · {form.mobilia==='sem_mobilia'?'Sem Mob':form.mobilia==='semi_mobiliado'?'Semi (+30%)':'Mob (+50%)'}</div>
              {slots.length===0
                ?<div style={{padding:'9px',background:'rgba(255,77,109,.08)',border:'1px solid rgba(255,77,109,.2)',borderRadius:8,fontSize:11,color:C.danger}}>⚠ Sem horários disponíveis nesta data. Tente outra data.</div>
                :<div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
                  {slots.map(h=>(
                    <div key={h} onClick={()=>setSelHora(h)} style={{border:`1.5px solid ${selHora===h?C.accent:C.border2}`,background:selHora===h?C.accent:C.surface,borderRadius:8,padding:'10px 8px',textAlign:'center',cursor:'pointer',color:selHora===h?'#000':C.text}}>
                      <div style={{fontWeight:700,fontSize:14}}>{h}</div>
                      <div style={{fontSize:10,opacity:.7,marginTop:2}}>até {toHHMM(toMin(h)+duracao)}</div>
                    </div>
                  ))}
                </div>
              }
            </div>}
            {selDate&&!acomp&&<div style={{background:'rgba(0,153,255,.04)',border:'1px solid rgba(0,153,255,.15)',borderRadius:10,padding:10,marginTop:8}}>
              <div style={{display:'flex',gap:6}}><div style={{fontSize:18}}>📋</div><div><div style={{fontWeight:700,fontSize:11,marginBottom:2}}>Horário a definir</div><div style={{color:C.muted,fontSize:10}}>A equipe Inovare entrará em contato.</div></div></div>
            </div>}
            <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:6}}><button style={S.btnG} onClick={()=>setStep(3)}>← Voltar</button><button style={S.btnP(!selDate||(acomp&&!selHora))} disabled={!selDate||(acomp&&!selHora)} onClick={()=>setStep(5)}>Próximo →</button></div>
          </>}

          {/* STEP 5 - DADOS DO IMÓVEL */}
          {step===5&&<>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
              <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>📍 Dados do Imóvel</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr',gap:7}}>
                {camposOrdenados.map(k=>{
                  const campo=config.camposFormulario?.[k];
                  if(!campo?.ativo)return null;
                  if(k==='m2'||k==='mobilia')return null;
                  if(k==='valorVistoria'||k==='valorLocacao')return<div key={k}><label style={S.lbl}>{campo.label}{campo.obrigatorio&&' *'}</label><input style={S.inp()} placeholder="R$ 0,00" value={form[k]||''} onChange={e=>updF(k,maskValor(e.target.value))}/></div>;
                  if(k==='cep')return<div key={k}><label style={S.lbl}>{campo.label}{campo.obrigatorio&&' *'}</label><input style={S.inp()} placeholder="00000-000" value={form[k]||''} onChange={e=>updF(k,maskCep(e.target.value))}/></div>;
                  if(k==='nomeAcompanhante'||k==='contatoAcompanhante'){if(!acomp)return null;return<div key={k}><label style={S.lbl}>{campo.label}{campo.obrigatorio&&' *'}</label><input style={S.inp()} placeholder={k==='contatoAcompanhante'?'(00) 00000-0000':'Nome completo'} value={form[k]||''} onChange={e=>updF(k,k==='contatoAcompanhante'?maskPhone(e.target.value):e.target.value)}/></div>;}
                  if(k==='obs')return<div key={k}><label style={S.lbl}>{campo.label}{campo.obrigatorio&&' *'}</label><textarea style={{...S.inp(),resize:'vertical',minHeight:50}} placeholder="Observações..." value={form[k]||''} onChange={e=>updF(k,e.target.value)}/></div>;
                  return<div key={k}><label style={S.lbl}>{campo.label}{campo.obrigatorio&&' *'}</label><input style={S.inp()} value={form[k]||''} onChange={e=>updF(k,e.target.value)}/></div>;
                })}
                <div>
                  <label style={S.lbl}>📎 PDF (opcional)</label>
                  <input ref={fileRef} type="file" accept="application/pdf" style={{display:'none'}} onChange={handlePdf}/>
                  {pdfNome
                    ?<div style={{display:'flex',alignItems:'center',gap:7,padding:'8px 9px',background:'rgba(0,212,170,.06)',border:'1px solid rgba(0,212,170,.2)',borderRadius:8,marginTop:4}}>
                      <span style={{fontSize:15}}>📎</span>
                      <div style={{flex:1,fontSize:11,fontWeight:600}}>{pdfNome}</div>
                      <button onClick={()=>{setPdfNome('');setPdfData('');}} style={{background:'none',border:'none',color:C.danger,cursor:'pointer',fontSize:14}}>✕</button>
                    </div>
                    :<button onClick={()=>fileRef.current.click()} style={{...S.btnG,width:'100%',marginTop:4,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'9px'}}>📄 Selecionar PDF</button>
                  }
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:6}}><button style={S.btnG} onClick={()=>setStep(4)}>← Voltar</button><button style={S.btnP()} onClick={()=>setStep(6)}>Revisar →</button></div>
          </>}

          {/* STEP 6 - CONFIRMAÇÃO */}
          {step===6&&<>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:12}}>
              <div style={{fontWeight:700,fontSize:12,marginBottom:10}}>✅ Confirme os Dados</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr',gap:8}}>
                <div style={{background:C.surface,borderRadius:8,padding:10}}>
                  <div style={{fontSize:10,color:C.muted,fontWeight:600,marginBottom:4}}>FILIAL</div>
                  <div style={{fontSize:12}}>{filiais.find(f=>f.id===filialSel)?.nome}</div>
                </div>
                <div style={{background:C.surface,borderRadius:8,padding:10}}>
                  <div style={{fontSize:10,color:C.muted,fontWeight:600,marginBottom:4}}>VISTORIA</div>
                  <div style={{fontSize:12}}>{tipo} · {form.m2}m² · {fmtDur(duracao)} · {acomp?'👤 Acompanhada':'🔓 Não acomp.'}</div>
                </div>
                <div style={{background:C.surface,borderRadius:8,padding:10}}>
                  <div style={{fontSize:10,color:C.muted,fontWeight:600,marginBottom:4}}>DATA E HORÁRIO</div>
                  <div style={{fontSize:12}}>{selDate&&fmtDate(selDate)} · {acomp&&selHora?`${selHora} → ${toHHMM(toMin(selHora)+duracao)}`:'A definir'}</div>
                </div>
                <div style={{background:C.surface,borderRadius:8,padding:10}}>
                  <div style={{fontSize:10,color:C.muted,fontWeight:600,marginBottom:4}}>IMÓVEL</div>
                  <div style={{fontSize:12}}>{form.endereco||'—'} · {form.cep||'—'}</div>
                </div>
                {pdfNome&&<div style={{padding:'7px 9px',background:'rgba(0,212,170,.06)',border:'1px solid rgba(0,212,170,.2)',borderRadius:8,fontSize:11}}>📎 {pdfNome}</div>}
              </div>
            </div>
            <div style={{display:'flex',gap:6,justifyContent:'flex-end',marginTop:6}}>
              <button style={S.btnG} onClick={()=>setStep(5)}>← Editar</button>
              <button style={S.btnP()} onClick={confirmarAg}>Confirmar Agendamento 🚀</button>
            </div>
          </>}
        </>
      ))}
    </div>
  </div>);
}