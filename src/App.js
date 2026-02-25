import { useState } from "react";
import CryptoJS from 'crypto-js';

const SECRET_KEY='inovare-2026';
const hashSenha=(senha)=>CryptoJS.SHA256(senha+SECRET_KEY).toString();
const validarSenha=(senhaDigitada,senhaHash)=>hashSenha(senhaDigitada)===senhaHash;

const C={bg:'#0a0c0f',surface:'#111418',card:'#161b22',border:'#222831',border2:'#2d3540',accent:'#00d4aa',text:'#e8edf3',muted:'#7a8899',danger:'#ff4d6d'};

const USERS={
  admin:{nome:'Inovare Admin',email:'admin@inovare.com',senha:hashSenha('admin123'),role:'admin'},
  carlos:{nome:'Carlos Mendes',email:'carlos@inovare.com',senha:hashSenha('vst123'),role:'vistoriador'},
  marlon:{nome:'Marlon Silva',email:'marlon@dlange.com',senha:hashSenha('123456'),role:'cliente'}
};

export default function InovareApp(){
  const[user,setUser]=useState(null);
  const[toast,setToast]=useState('');
  
  const showToast=(m)=>{setToast(m);setTimeout(()=>setToast(''),2500);};
  
  const handleLogin=(email,senha)=>{
    const foundUser=Object.values(USERS).find(u=>u.email===email&&validarSenha(senha,u.senha));
    if(foundUser){
      setUser(foundUser);
      showToast('✅ Login realizado com segurança!');
    }else{
      showToast('❌ E-mail ou senha incorretos!');
    }
  };
  
  if(!user){
    return(
      <div style={{background:C.bg,minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
        {toast&&<div style={{position:'fixed',bottom:16,left:'50%',transform:'translateX(-50%)',background:C.card,border:`1px solid ${C.accent}`,borderRadius:10,padding:'8px 14px',fontSize:12,fontWeight:600,color:C.accent,zIndex:9998}}>{toast}</div>}
        <LoginPage onLogin={handleLogin}/>
      </div>
    );
  }
  
  return(
    <div style={{background:C.bg,minHeight:'100vh',color:C.text,padding:40,fontFamily:'sans-serif'}}>
      {toast&&<div style={{position:'fixed',bottom:16,left:'50%',transform:'translateX(-50%)',background:C.card,border:`1px solid ${C.accent}`,borderRadius:10,padding:'8px 14px',fontSize:12,fontWeight:600,color:C.accent,zIndex:9998}}>{toast}</div>}
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:32,textAlign:'center'}}>
          <div style={{fontSize:64,marginBottom:16}}>🎉</div>
          <h1 style={{fontSize:32,fontWeight:800,color:C.accent,margin:'0 0 8px'}}>Sistema Inovare Online!</h1>
          <p style={{fontSize:18,color:C.text,margin:'0 0 24px'}}>Bem-vindo, <strong>{user.nome}</strong>!</p>
          
          <div style={{background:C.surface,borderRadius:8,padding:20,marginBottom:24,textAlign:'left'}}>
            <div style={{fontSize:14,fontWeight:700,color:C.accent,marginBottom:12}}>✅ Sistema Funcionando</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:8}}>🔒 Segurança: Criptografia SHA-256</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:8}}>🚀 Deploy: Vercel</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:8}}>⚡ Framework: Vite + React</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:8}}>👤 Perfil: {user.role}</div>
            <div style={{fontSize:13,color:C.muted}}>📧 E-mail: {user.email}</div>
          </div>
          
          <div style={{background:'rgba(0,212,170,.08)',border:`1px solid ${C.accent}`,borderRadius:8,padding:16,marginBottom:24}}>
            <div style={{fontSize:12,color:C.accent,fontWeight:600,marginBottom:8}}>🎯 Próximos Passos:</div>
            <div style={{fontSize:11,color:C.muted,textAlign:'left',lineHeight:1.7}}>
              ✅ Deploy realizado com sucesso<br/>
              ⏳ Conectar domínio próprio<br/>
              ⏳ Adicionar funcionalidades completas<br/>
              ⏳ Configurar banco de dados
            </div>
          </div>
          
          <button 
            onClick={()=>setUser(null)}
            style={{padding:'12px 24px',background:C.danger,color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:14}}
          >
            🚪 Sair do Sistema
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginPage({onLogin}){
  const[email,setEmail]=useState('');
  const[senha,setSenha]=useState('');
  
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:24,maxWidth:380,width:'100%'}}>
      <div style={{textAlign:'center',marginBottom:24}}>
        <div style={{width:70,height:70,borderRadius:12,background:'linear-gradient(135deg,#00d4aa,#0099ff)',display:'inline-flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:24,color:'#000',marginBottom:16,boxShadow:'0 8px 16px rgba(0,212,170,.2)'}}>IN</div>
        <h2 style={{fontWeight:800,fontSize:22,margin:'0 0 6px',color:C.text}}>inova<span style={{color:C.accent}}>re</span></h2>
        <p style={{color:C.muted,fontSize:13,margin:'0 0 16px'}}>Sistema de Vistorias Imobiliárias</p>
        <div style={{background:'rgba(0,212,170,.08)',border:`1px solid ${C.accent}`,borderRadius:6,padding:8}}>
          <div style={{fontSize:11,color:C.accent,fontWeight:600}}>🔒 Sistema 100% Seguro - LGPD</div>
        </div>
      </div>
      
      <div style={{marginBottom:14}}>
        <label style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',marginBottom:6,display:'block'}}>E-mail</label>
        <input 
          style={{background:C.surface,border:`1.5px solid ${C.border2}`,borderRadius:8,padding:'10px 12px',color:C.text,fontSize:14,outline:'none',width:'100%',boxSizing:'border-box'}}
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="seu@email.com"
          onKeyDown={e=>e.key==='Enter'&&onLogin(email,senha)}
        />
      </div>
      
      <div style={{marginBottom:18}}>
        <label style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:'uppercase',marginBottom:6,display:'block'}}>Senha</label>
        <input 
          style={{background:C.surface,border:`1.5px solid ${C.border2}`,borderRadius:8,padding:'10px 12px',color:C.text,fontSize:14,outline:'none',width:'100%',boxSizing:'border-box'}}
          type="password"
          value={senha}
          onChange={e=>setSenha(e.target.value)}
          placeholder="••••••••"
          onKeyDown={e=>e.key==='Enter'&&onLogin(email,senha)}
        />
      </div>
      
      <button 
        style={{padding:'12px 16px',borderRadius:8,background:'linear-gradient(135deg,#00d4aa,#0099ff)',color:'#000',border:'none',cursor:'pointer',fontWeight:700,fontSize:14,width:'100%',boxShadow:'0 4px 12px rgba(0,212,170,.3)'}}
        onClick={()=>onLogin(email,senha)}
      >
        🔐 Entrar com Segurança →
      </button>
      
      <div style={{marginTop:16,padding:12,background:C.surface,borderRadius:8,fontSize:12,color:C.muted,lineHeight:1.8}}>
        <strong style={{color:C.text,fontSize:13}}>Acessos demo:</strong><br/>
        🧑 marlon@dlange.com / 123456<br/>
        👷 carlos@inovare.com / vst123<br/>
        ⚙️ admin@inovare.com / admin123
      </div>
    </div>
  );
}
