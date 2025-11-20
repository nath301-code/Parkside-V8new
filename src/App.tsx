// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Camera, Home, Calendar, MessageSquare, User, Shield, Heart, X, RefreshCw, Lock, LogOut, 
  Clock, Plus, Users, Edit3, Trash2, Briefcase, Wrench, Receipt, CheckCircle, Leaf, Phone, 
  PhoneCall, Moon, Sun, CalendarDays, ArrowRight, UserPlus, UserX, Key, Eye, ChevronRight, MapPin, CreditCard
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, signOut, updateProfile
} from "firebase/auth";
import { 
  getFirestore, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, doc, updateDoc, 
  deleteDoc, where, writeBatch, getDocs
} from "firebase/firestore";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyANLKKf0OeSTs7_ok6fzIjtxVLWT_mdTnQ",
  authDomain: "parkside-d5885.firebaseapp.com",
  projectId: "parkside-d5885",
  storageBucket: "parkside-d5885.firebasestorage.app",
  messagingSenderId: "314330427304",
  appId: "1:314330427304:web:74ec323a2b6434040b779d",
  measurementId: "G-FRRM3JDB9M"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.projectId;

// --- STYLES ---
const theme = {
  bg: '#f2f2f7', // iOS Light Grey
  primary: '#16a34a', // Parkside Green
  primaryDark: '#15803d',
  text: '#1c1c1e',
  textSecondary: '#8e8e93',
  card: '#ffffff',
  border: '#e5e5ea',
  danger: '#ff3b30'
};

const styles = {
  app: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', backgroundColor: theme.bg, minHeight: '100vh', paddingBottom: '100px', color: theme.text },
  header: { position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${theme.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  section: { padding: '20px' },
  
  // Cards
  card: { backgroundColor: theme.card, borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${theme.border}` },
  heroCard: { background: 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)', borderRadius: '24px', padding: '24px', color: 'white', marginBottom: '24px', boxShadow: '0 10px 30px -10px rgba(22, 163, 74, 0.4)' },
  
  // Buttons
  fab: { position: 'fixed', bottom: '100px', right: '24px', width: '60px', height: '60px', borderRadius: '30px', backgroundColor: theme.primary, color: 'white', border: 'none', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 },
  btn: { width: '100%', padding: '16px', borderRadius: '14px', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  btnPrimary: { backgroundColor: theme.text, color: 'white' },
  btnSecondary: { backgroundColor: 'white', border: `1px solid ${theme.border}`, color: theme.text },
  
  // Inputs
  input: { width: '100%', padding: '16px', borderRadius: '12px', border: `1px solid ${theme.border}`, backgroundColor: '#f9f9f9', fontSize: '16px', marginBottom: '12px', outline: 'none' },
  select: { width: '100%', padding: '16px', borderRadius: '12px', border: `1px solid ${theme.border}`, backgroundColor: 'white', fontSize: '16px', marginBottom: '12px', outline: 'none', appearance: 'none' },
  
  // Tabs
  tabContainer: { display: 'flex', padding: '4px', backgroundColor: '#e5e5ea', borderRadius: '12px', marginBottom: '20px' },
  tab: { flex: 1, padding: '10px', borderRadius: '9px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', backgroundColor: 'transparent', color: '#8e8e93', transition: '0.2s' },
  tabActive: { backgroundColor: 'white', color: 'black', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },

  // Typography
  h1: { fontSize: '28px', fontWeight: '800', marginBottom: '4px' },
  h2: { fontSize: '20px', fontWeight: '700', marginBottom: '16px' },
  label: { fontSize: '12px', fontWeight: '700', color: theme.textSecondary, textTransform: 'uppercase', marginBottom: '6px', display: 'block' }
};

// --- UTILS ---
const getTodayString = () => new Date().toISOString().split('T')[0];
const addDays = (d, n) => { const date = new Date(d); date.setDate(date.getDate() + n); return date.toISOString().split('T')[0]; };

// --- COMPONENTS ---

// BRANDING
const ParksideLogo = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
    <div style={{width: '36px', height: '36px', borderRadius: '10px', backgroundColor: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Leaf color="white" size={20} />
    </div>
    <span style={{fontSize: '18px', fontWeight: '800', color: theme.text}}>Parkside</span>
  </div>
);

// BOTTOM NAV
const BottomNav = ({ active, onChange }) => (
  <div style={{position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderTop: `1px solid ${theme.border}`, padding: '12px 24px 30px 24px', display: 'flex', justifyContent: 'space-between', zIndex: 100}}>
     {[
       {id:'dashboard', icon:Home, label:'Home'},
       {id:'calendar', icon:Calendar, label:'Rota'},
       {id:'house', icon:Wrench, label:'House'},
       {id:'feed', icon:MessageSquare, label:'Log'}
     ].map(item => (
       <button key={item.id} onClick={()=>onChange(item.id)} style={{border:'none', background:'transparent', display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', color: active===item.id ? theme.primary : '#999'}}>
          <item.icon size={24} strokeWidth={active===item.id ? 2.5 : 2} />
          <span style={{fontSize:'10px', fontWeight:'600'}}>{item.label}</span>
       </button>
     ))}
  </div>
);

// 1. LOGIN SCREEN
const LoginScreen = ({ onLogin, firebaseUser }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'parkside_users');
      const snapshot = await getDocs(usersRef);
      let user = snapshot.docs.find(d => d.data().name.toLowerCase() === name.trim().toLowerCase());

      if (name.toLowerCase() === 'nathan' && password === 'reset-admin') { setIsReset(true); setLoading(false); return; }
      if (isReset && user) { await updateDoc(user.ref, { password }); onLogin(user.data().role); return; }

      let role = 'staff';
      let create = false;
      if (snapshot.empty && name.toLowerCase() === 'nathan') { role = 'manager'; create = true; }
      else if (user && user.data().password === password) { role = user.data().role; }
      else throw new Error();

      if (firebaseUser) {
         await updateProfile(firebaseUser, { displayName: name });
         if (create) await addDoc(usersRef, { name: 'Nathan', role: 'manager', password, createdAt: serverTimestamp() });
         onLogin(role);
      }
    } catch (err) { alert("Access Denied"); setLoading(false); }
  };

  return (
    <div style={{position:'fixed', inset:0, backgroundColor:'white', display:'flex', flexDirection:'column', padding:'32px', justifyContent:'center'}}>
      <div style={{marginBottom:'40px'}}>
         <div style={{width:'64px', height:'64px', backgroundColor:theme.primary, borderRadius:'18px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'24px', boxShadow:`0 10px 30px -5px ${theme.primary}66`}}>
            <Leaf color="white" size={32} />
         </div>
         <h1 style={{fontSize:'36px', fontWeight:'900', color:theme.text, lineHeight:'1.1'}}>Welcome<br/>Back.</h1>
         <p style={{color:theme.textSecondary, marginTop:'12px', fontSize:'16px'}}>Sign in to Parkside Staff Portal.</p>
      </div>
      <form onSubmit={handleLogin}>
         <div style={{marginBottom:'20px'}}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Nathan" />
         </div>
         <div style={{marginBottom:'32px'}}>
            <label style={styles.label}>{isReset ? 'New Password' : 'Password'}</label>
            <input style={styles.input} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••" />
         </div>
         <button style={{...styles.btn, backgroundColor: theme.text, color:'white', boxShadow:'0 10px 20px rgba(0,0,0,0.1)'}} disabled={loading}>
            {loading ? 'Verifying...' : isReset ? 'Set New Password' : 'Sign In'}
         </button>
      </form>
    </div>
  );
};

// 2. DASHBOARD
const Dashboard = ({ user, onNavigate }) => {
  const [oc, setOc] = useState(null);
  const [next, setNext] = useState(null);

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_oncall'), where('date','==',getTodayString())), s=>setOc(s.empty?null:s.docs[0].data()));
    const u2 = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_rota_v3'), where('date','>=',getTodayString()), orderBy('date')), s=>{
        const n = s.docs.map(d=>d.data()).find(sh => sh.staff.some(st => st.name.toLowerCase() === user.displayName.toLowerCase()));
        setNext(n);
    });
    return () => { u1(); u2(); };
  }, [user]);

  return (
    <div style={styles.section}>
      <div style={{marginBottom:'24px'}}>
         <p style={{color:theme.textSecondary, fontSize:'14px', fontWeight:'600', textTransform:'uppercase'}}>Good Afternoon,</p>
         <h1 style={styles.h1}>{user.displayName}</h1>
      </div>

      {/* HERO */}
      <div style={styles.heroCard}>
         <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'24px'}}>
            <div style={{width:'8px', height:'8px', backgroundColor:'#4ade80', borderRadius:'50%'}}></div>
            <span style={{fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'0.5px', opacity:0.9}}>On Call Manager</span>
         </div>
         <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
            <div>
               <div style={{fontSize:'32px', fontWeight:'800', lineHeight:'1'}}>{oc ? oc.name : 'No Data'}</div>
               <div style={{fontSize:'14px', opacity:0.7, marginTop:'6px'}}>Until 09:00 Tomorrow</div>
            </div>
            {oc && <a href={`tel:${oc.number}`} style={{width:'52px', height:'52px', backgroundColor:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:theme.primaryDark}}><PhoneCall size={24}/></a>}
         </div>
      </div>

      {/* NEXT SHIFT */}
      <div style={styles.card}>
         <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', fontWeight:'700', color:theme.textSecondary, textTransform:'uppercase'}}><CalendarDays size={14}/> Next Shift</div>
         </div>
         {next ? (
            <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
               <div style={{padding:'12px 16px', backgroundColor:'#f3f4f6', borderRadius:'12px', textAlign:'center'}}>
                  <div style={{fontSize:'12px', fontWeight:'700', color:theme.textSecondary, textTransform:'uppercase'}}>{new Date(next.date).toLocaleString('default',{month:'short'})}</div>
                  <div style={{fontSize:'24px', fontWeight:'800', color:theme.text}}>{new Date(next.date).getDate()}</div>
               </div>
               <div>
                  <div style={{fontSize:'18px', fontWeight:'700', color:theme.text}}>{new Date(next.date).toLocaleDateString('en-GB',{weekday:'long'})}</div>
                  <div style={{fontSize:'14px', color:theme.textSecondary, marginTop:'4px'}}>08:00 Start • 48hr Block</div>
               </div>
            </div>
         ) : <div style={{color:'#999', fontStyle:'italic'}}>No upcoming shifts found</div>}
      </div>

      {/* QUICK LINKS */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
         <div onClick={()=>onNavigate('calendar')} style={{...styles.card, display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', padding:'24px'}}>
            <div style={{color:'#f97316'}}><Calendar size={32}/></div>
            <span style={{fontWeight:'700', color:theme.text}}>Rota</span>
         </div>
         <div onClick={()=>onNavigate('house')} style={{...styles.card, display:'flex', flexDirection:'column', alignItems:'center', gap:'12px', padding:'24px'}}>
            <div style={{color:'#3b82f6'}}><Wrench size={32}/></div>
            <span style={{fontWeight:'700', color:theme.text}}>House</span>
         </div>
      </div>
    </div>
  );
};

// 3. ROTA & DIARY
const CalendarManager = ({ user, userRole }) => {
  const [tab, setTab] = useState('myrota');
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appts, setAppts] = useState([]);
  
  const [showAdd, setShowAdd] = useState(false);
  const [showApt, setShowApt] = useState(false);

  // Forms
  const [mode, setMode] = useState('block');
  const [date, setDate] = useState('');
  const [s1,setS1]=useState(''); const [s2,setS2]=useState(''); const [s3,setS3]=useState(''); const [d1,setD1]=useState('');
  const [adName, setAdName]=useState(''); const [adStart, setAdStart]=useState(''); const [adEnd, setAdEnd]=useState('');
  
  const [aptChild, setAptChild] = useState(''); const [aptType, setAptType] = useState(''); 
  const [aptDate, setAptDate] = useState(''); const [aptTime, setAptTime] = useState(''); const [aptEscort, setAptEscort] = useState('');

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_rota_v3'), orderBy('date')), s => setShifts(s.docs.map(d=>({id:d.id, ...d.data()}))));
    const u2 = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_users'), orderBy('name')), s => setStaff(s.docs.map(d=>d.data())));
    const u3 = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_appointments'), orderBy('dateTime')), s => setAppts(s.docs.map(d=>({id:d.id, ...d.data()}))));
    return () => { u1(); u2(); u3(); };
  }, []);

  const saveBlock = async () => {
    const b = writeBatch(db);
    const id1 = doc(collection(db,'artifacts',appId,'public','data','parkside_rota_v3')).id;
    const t1 = [{name:s1,type:'sleep',day:1},{name:s2,type:'sleep',day:1},{name:s3,type:'sleep',day:1},{name:d1,type:'day',day:1}].filter(x=>x.name);
    const t2 = [{name:s1,type:'sleep',day:2},{name:s2,type:'sleep',day:2},{name:s3,type:'sleep',day:2},{name:d1,type:'day',day:2}].filter(x=>x.name);
    b.set(doc(db,'artifacts',appId,'public','data','parkside_rota_v3',id1), {date, displayDate:new Date(date).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}), staff:t1, blockId:id1});
    const d2 = addDays(date,1);
    b.set(doc(collection(db,'artifacts',appId,'public','data','parkside_rota_v3')), {date:d2, displayDate:new Date(d2).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}), staff:t2, blockId:id1});
    await b.commit(); setShowAdd(false);
  };

  const saveAdhoc = async () => {
     await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_rota_v3'), {
       date, displayDate: new Date(date).toLocaleDateString('en-GB', {weekday:'short', day:'numeric', month:'short'}),
       staff: [{name: adName, type:'adhoc', start: adStart, end: adEnd}], type: 'adhoc'
     });
     setShowAdd(false);
  };

  const saveApt = async () => {
     await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_appointments'), {
       childName: aptChild, type: aptType, displayDate: aptDate, displayTime: aptTime, staff: aptEscort, dateTime: new Date(`${aptDate}T${aptTime}`).toISOString()
     });
     setShowApt(false);
  };

  const myShifts = shifts.filter(s => s.staff.some(st => st.name.toLowerCase() === user.displayName.toLowerCase()));

  return (
    <div style={styles.section}>
       <div style={styles.tabContainer}>
          {['myrota','fullrota','diary'].map(t => (
             <button key={t} onClick={()=>setTab(t)} style={tab===t ? {...styles.tab, ...styles.tabActive} : styles.tab}>{t==='myrota'?'My Shifts':t==='fullrota'?'Full Rota':'Diary'}</button>
          ))}
       </div>

       {tab === 'myrota' && (
          <div>
             {myShifts.length === 0 && <div style={{textAlign:'center', padding:'40px', color:'#999'}}>No shifts assigned to you.</div>}
             {myShifts.map(s => {
                const me = s.staff.find(x=>x.name.toLowerCase()===user.displayName.toLowerCase());
                return (
                   <div key={s.id} style={{...styles.card, borderLeft:`4px solid ${theme.primary}`}}>
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                         <div>
                            <div style={{fontSize:'20px', fontWeight:'800'}}>{s.displayDate}</div>
                            <div style={{fontSize:'12px', fontWeight:'700', color:'#999', marginTop:'2px'}}>{s.type==='adhoc' ? 'EXTRA SHIFT' : (me.day===1 ? 'DAY 1 (START)' : 'DAY 2 (FINISH)')}</div>
                         </div>
                         <div style={{backgroundColor:me.type==='sleep'?'#f3e8ff':me.type==='adhoc'?'#dbeafe':'#ffedd5', color:me.type==='sleep'?'#7e22ce':me.type==='adhoc'?'#1d4ed8':'#c2410c', padding:'6px 12px', borderRadius:'8px', fontSize:'11px', fontWeight:'800', height:'fit-content'}}>
                            {me.type==='sleep'?'SLEEP':me.type==='adhoc'?'HOURLY':'LATE'}
                         </div>
                      </div>
                      <div style={{backgroundColor:'#f9f9f9', padding:'12px', borderRadius:'10px', fontSize:'14px', fontWeight:'600', color:'#555', display:'flex', gap:'8px', alignItems:'center'}}>
                         <Clock size={16} color={theme.primary}/>
                         {me.type==='adhoc' ? `${me.start} - ${me.end}` : (me.type==='sleep' ? (me.day===1?'Start 08:00 → Sleep':'Sleep → Finish 08:30') : 'Start 08:00 → Finish 22:30')}
                      </div>
                   </div>
                )
             })}
          </div>
       )}

       {tab === 'fullrota' && (
          <div>
             {shifts.map(s => (
                <div key={s.id} style={styles.card}>
                   <div style={{display:'flex', justifyContent:'space-between', borderBottom:`1px solid ${theme.border}`, paddingBottom:'12px', marginBottom:'12px'}}>
                      <span style={{fontWeight:'700', fontSize:'16px'}}>{s.displayDate}</span>
                      {userRole==='manager' && <button onClick={()=>deleteDoc(doc(db,'artifacts',appId,'public','data','parkside_rota_v3',s.id))} style={{border:'none', background:'transparent', color:'#ff3b30'}}><Trash2 size={16}/></button>}
                   </div>
                   <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                      {s.staff.map((st,i) => (
                         <div key={i} style={{fontSize:'13px', fontWeight:'600', backgroundColor:st.type==='sleep'?'#f3e8ff':'#ffedd5', color:st.type==='sleep'?'#6b21a8':'#9a3412', padding:'8px', borderRadius:'8px', display:'flex', alignItems:'center', gap:'6px'}}>
                            {st.type==='sleep' ? <Moon size={12}/> : <Sun size={12}/>} {st.name}
                         </div>
                      ))}
                   </div>
                </div>
             ))}
             {userRole==='manager' && <button onClick={()=>setShowAdd(true)} style={styles.fab}><Plus size={28}/></button>}
          </div>
       )}

       {tab === 'diary' && (
          <div>
             {appts.map(a => (
                <div key={a.id} style={{...styles.card, display:'flex', gap:'16px', alignItems:'center'}}>
                   <div style={{backgroundColor:'#fef3c7', color:'#d97706', width:'50px', height:'50px', borderRadius:'12px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontWeight:'700'}}>
                      <span style={{fontSize:'10px', textTransform:'uppercase'}}>{new Date(a.displayDate).toLocaleString('default',{month:'short'})}</span>
                      <span style={{fontSize:'18px', lineHeight:'1'}}>{new Date(a.displayDate).getDate()}</span>
                   </div>
                   <div>
                      <div style={{fontSize:'17px', fontWeight:'700'}}>{a.childName}</div>
                      <div style={{fontSize:'13px', color:'#777'}}>{a.displayTime} • {a.type}</div>
                   </div>
                </div>
             ))}
             <button onClick={()=>setShowApt(true)} style={styles.fab}><Plus size={28}/></button>
          </div>
       )}

       {/* ADD SHIFT MODAL */}
       {showAdd && (
         <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end'}}>
            <div style={{backgroundColor:'white', width:'100%', borderRadius:'24px 24px 0 0', padding:'24px', maxHeight:'85vh', overflowY:'auto'}}>
               <div style={{display:'flex', justifyContent:'space-between', marginBottom:'24px'}}>
                  <h3 style={styles.h2}>Add Shift</h3>
                  <button onClick={()=>setShowAdd(false)} style={{border:'none', background:'transparent'}}><X/></button>
               </div>
               
               <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                  <button onClick={()=>setMode('block')} style={{...styles.btn, ...(mode==='block'?styles.btnPrimary:styles.btnSecondary)}}>48hr Block</button>
                  <button onClick={()=>setMode('adhoc')} style={{...styles.btn, ...(mode==='adhoc'?styles.btnPrimary:styles.btnSecondary)}}>Hourly</button>
               </div>
               
               <label style={styles.label}>Date</label>
               <input type="date" style={styles.input} value={date} onChange={e=>setDate(e.target.value)}/>
               
               {mode === 'block' ? (
                 <>
                    <label style={styles.label}>Sleep-in Team (x3)</label>
                    <select style={styles.select} onChange={e=>setS1(e.target.value)}><option>Select Staff</option>{staff.map(u=><option>{u.name}</option>)}</select>
                    <select style={styles.select} onChange={e=>setS2(e.target.value)}><option>Select Staff</option>{staff.map(u=><option>{u.name}</option>)}</select>
                    <select style={styles.select} onChange={e=>setS3(e.target.value)}><option>Select Staff</option>{staff.map(u=><option>{u.name}</option>)}</select>
                    <label style={styles.label}>Late Finish (x1)</label>
                    <select style={styles.select} onChange={e=>setD1(e.target.value)}><option>Select Staff</option>{staff.map(u=><option>{u.name}</option>)}</select>
                    <button onClick={saveBlock} style={{...styles.btn, ...styles.btnPrimary}}>Save Block</button>
                 </>
               ) : (
                 <>
                    <label style={styles.label}>Staff Member</label>
                    <select style={styles.select} onChange={e=>setAdName(e.target.value)}><option>Select Staff</option>{staff.map(u=><option>{u.name}</option>)}</select>
                    <div style={{display:'flex', gap:'10px'}}>
                       <div style={{flex:1}}><label style={styles.label}>Start</label><input type="time" style={styles.input} value={adStart} onChange={e=>setAdStart(e.target.value)}/></div>
                       <div style={{flex:1}}><label style={styles.label}>End</label><input type="time" style={styles.input} value={adEnd} onChange={e=>setAdEnd(e.target.value)}/></div>
                    </div>
                    <button onClick={saveAdhoc} style={{...styles.btn, ...styles.btnPrimary}}>Save Shift</button>
                 </>
               )}
            </div>
         </div>
       )}

       {/* ADD APPOINTMENT MODAL */}
       {showApt && (
         <div style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end'}}>
            <div style={{backgroundColor:'white', width:'100%', borderRadius:'24px 24px 0 0', padding:'24px'}}>
               <h3 style={styles.h2}>New Appointment</h3>
               <input style={styles.input} placeholder="Child (Initials)" value={aptChild} onChange={e=>setAptChild(e.target.value)}/>
               <input style={styles.input} placeholder="Type (e.g. Dentist)" value={aptType} onChange={e=>setAptType(e.target.value)}/>
               <div style={{display:'flex', gap:'10px'}}>
                  <input type="date" style={styles.input} value={aptDate} onChange={e=>setAptDate(e.target.value)}/>
                  <input type="time" style={styles.input} value={aptTime} onChange={e=>setAptTime(e.target.value)}/>
               </div>
               <input style={styles.input} placeholder="Escort Staff" value={aptEscort} onChange={e=>setAptEscort(e.target.value)}/>
               <button onClick={saveApt} style={{...styles.btn, ...styles.btnPrimary}}>Save</button>
               <button onClick={()=>setShowApt(false)} style={{...styles.btn, marginTop:'10px', color:'#999'}}>Cancel</button>
            </div>
         </div>
       )}
    </div>
  );
};

// 4. HOUSE & TEAM
const HouseManager = ({ user, userRole }) => {
  const [tab, setTab] = useState('oncall');
  const [data, setData] = useState({ users:[], oncall:[], repairs:[], receipts:[] });
  const [modals, setModals] = useState({ user:false, oncall:false, repair:false, receipt:false });
  
  // Forms
  const [form, setForm] = useState({});

  useEffect(() => {
    const unsubs = [
      onSnapshot(query(collection(db,'artifacts',appId,'public','data','parkside_users'),orderBy('name')), s=>setData(p=>({...p,users:s.docs.map(d=>({id:d.id,...d.data()}))}))),
      onSnapshot(query(collection(db,'artifacts',appId,'public','data','parkside_oncall'),orderBy('date')), s=>setData(p=>({...p,oncall:s.docs.map(d=>({id:d.id,...d.data()}))}))),
      onSnapshot(query(collection(db,'artifacts',appId,'public','data','parkside_repairs'),orderBy('timestamp','desc')), s=>setData(p=>({...p,repairs:s.docs.map(d=>({id:d.id,...d.data()}))}))),
      onSnapshot(query(collection(db,'artifacts',appId,'public','data','parkside_receipts'),orderBy('timestamp','desc')), s=>setData(p=>({...p,receipts:s.docs.map(d=>({id:d.id,...d.data()}))})))
    ];
    return () => unsubs.forEach(u=>u());
  }, []);

  const handleSubmit = async (type) => {
    const col = type === 'oncall' ? 'parkside_oncall' : `parkside_${type}s`;
    const payload = { timestamp: serverTimestamp(), ...form };
    if(type==='repair') { payload.status='open'; payload.reportedBy=user.displayName; }
    if(type==='receipt') { payload.staff=user.displayName; }
    
    await addDoc(collection(db,'artifacts',appId,'public','data',col), payload);
    setModals(p=>({...p, [type]:false})); setForm({});
  };

  return (
    <div style={styles.section}>
       <div style={styles.tabContainer}>
          {['oncall','repair','receipt',...(userRole==='manager'?['user']:[])].map(k => (
             <button key={k} onClick={()=>setTab(k)} style={tab===k ? {...styles.tab, ...styles.tabActive} : styles.tab}>
                {k==='oncall'?'On Call':k==='repair'?'Repairs':k==='receipt'?'Cash':k==='user'?'Team':''}
             </button>
          ))}
       </div>

       {/* TEAM */}
       {tab === 'user' && (
          <div>
             <div style={{backgroundColor:'#fef2f2', border:'1px solid #fca5a5', padding:'16px', borderRadius:'12px', marginBottom:'20px'}}>
                <h4 style={{fontWeight:'700', color:'#b91c1c'}}>Manager Area</h4>
                <p style={{fontSize:'13px', color:'#7f1d1d'}}>Create accounts for staff here. They will need their username and password to log in.</p>
             </div>
             <button onClick={()=>setModals(p=>({...p,user:true}))} style={{...styles.btn, ...styles.btnPrimary, marginBottom:'20px'}}><UserPlus/> Add New Staff</button>
             {data.users.map(u => (
                <div key={u.id} style={{...styles.card, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                      <div style={{width:'40px', height:'40px', borderRadius:'20px', backgroundColor:'#f4f4f5', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', color:'#71717a'}}>{u.name[0]}</div>
                      <div><div style={{fontWeight:'700'}}>{u.name}</div><div style={{fontSize:'12px', color:'#a1a1aa', textTransform:'uppercase'}}>{u.role}</div></div>
                   </div>
                   <button onClick={()=>deleteDoc(doc(db,'artifacts',appId,'public','data','parkside_users',u.id))} style={{color:'#ef4444', background:'transparent', border:'none'}}><Trash2 size={18}/></button>
                </div>
             ))}
          </div>
       )}

       {/* ON CALL */}
       {tab === 'oncall' && (
          <div>
             {userRole==='manager' && <button onClick={()=>setModals(p=>({...p,oncall:true}))} style={{...styles.btn, ...styles.btnPrimary, marginBottom:'20px'}}><Edit3/> Update Rota</button>}
             {data.oncall.map(oc => (
                <div key={oc.id} style={{...styles.card, display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft: oc.date===getTodayString() ? `4px solid ${theme.primary}` : `1px solid ${theme.border}`}}>
                   <div>
                      {oc.date===getTodayString() && <span style={{fontSize:'10px', fontWeight:'800', color:theme.primary, textTransform:'uppercase', display:'block', marginBottom:'4px'}}>ACTIVE NOW</span>}
                      <div style={{fontSize:'12px', fontWeight:'700', color:'#999', textTransform:'uppercase'}}>{new Date(oc.date).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}</div>
                      <div style={{fontSize:'18px', fontWeight:'800', marginTop:'2px'}}>{oc.name}</div>
                      <div style={{fontSize:'14px', fontWeight:'600', color:theme.primary, marginTop:'4px', display:'flex', alignItems:'center', gap:'4px'}}><Phone size={12}/> {oc.number}</div>
                   </div>
                   {userRole==='manager' && <button onClick={()=>deleteDoc(doc(db,'artifacts',appId,'public','data','parkside_oncall',oc.id))} style={{color:'#ccc', background:'transparent', border:'none'}}><Trash2 size={18}/></button>}
                </div>
             ))}
          </div>
       )}

       {/* REPAIRS */}
       {tab === 'repair' && (
          <div>
             <button onClick={()=>setModals(p=>({...p,repair:true}))} style={{...styles.btn, ...styles.btnPrimary, marginBottom:'20px'}}><Wrench/> Report Issue</button>
             {data.repairs.map(r => (
                <div key={r.id} style={{...styles.card, opacity:r.status==='fixed'?0.6:1, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                      <div style={{width:'40px', height:'40px', borderRadius:'10px', backgroundColor:r.status==='fixed'?'#dcfce7':'#ffedd5', color:r.status==='fixed'?'#15803d':'#c2410c', display:'flex', alignItems:'center', justifyContent:'center'}}>
                         {r.status==='fixed' ? <CheckCircle size={20}/> : <Wrench size={20}/>}
                      </div>
                      <div><div style={{fontWeight:'700'}}>{r.item}</div><div style={{fontSize:'12px', color:'#999'}}>{r.location}</div></div>
                   </div>
                   <button onClick={()=>updateDoc(doc(db,'artifacts',appId,'public','data','parkside_repairs',r.id),{status:r.status==='open'?'fixed':'open'})} style={{fontSize:'12px', fontWeight:'700', padding:'6px 12px', backgroundColor:'#f4f4f5', borderRadius:'8px', border:'none', color:'#555'}}>
                      {r.status==='open' ? 'Mark Done' : 'Undo'}
                   </button>
                </div>
             ))}
          </div>
       )}

       {/* CASH */}
       {tab === 'receipt' && (
          <div>
             <button onClick={()=>setModals(p=>({...p,receipt:true}))} style={{...styles.btn, ...styles.btnPrimary, marginBottom:'20px'}}><Receipt/> Add Receipt</button>
             {data.receipts.map(r => (
                <div key={r.id} style={{...styles.card, display:'flex', gap:'16px', alignItems:'center'}}>
                   <div style={{width:'50px', height:'50px', borderRadius:'12px', backgroundColor:'#dcfce7', color:'#15803d', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', fontSize:'16px'}}>£{r.amount}</div>
                   <div><div style={{fontWeight:'700'}}>{r.store}</div><div style={{fontSize:'12px', color:'#999'}}>{r.category} • {r.staff}</div></div>
                </div>
             ))}
          </div>
       )}

       {/* SHARED MODAL LAYOUT */}
       {Object.keys(modals).map(k => modals[k] && (
          <div key={k} style={{position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'flex-end'}}>
             <div style={{backgroundColor:'white', width:'100%', borderRadius:'24px 24px 0 0', padding:'24px'}}>
                <h3 style={styles.h2}>{k==='user'?'Add Staff':k==='oncall'?'Add On Call':k==='repair'?'Report Issue':'Add Receipt'}</h3>
                
                {k==='user' && <><input style={styles.input} placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/><input style={styles.input} placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/><select style={styles.select} onChange={e=>setForm({...form,role:e.target.value})}><option value="staff">Staff</option><option value="manager">Manager</option></select></>}
                
                {k==='oncall' && <><input style={styles.input} type="date" onChange={e=>setForm({...form,date:e.target.value})}/><input style={styles.input} placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/><input style={styles.input} placeholder="Phone" onChange={e=>setForm({...form,number:e.target.value})}/></>}
                
                {k==='repair' && <><input style={styles.input} placeholder="What's broken?" onChange={e=>setForm({...form,item:e.target.value})}/><input style={styles.input} placeholder="Location" onChange={e=>setForm({...form,location:e.target.value})}/></>}
                
                {k==='receipt' && <><input style={styles.input} type="number" placeholder="Amount £" onChange={e=>setForm({...form,amount:e.target.value})}/><input style={styles.input} placeholder="Store" onChange={e=>setForm({...form,store:e.target.value})}/><select style={styles.select} onChange={e=>setForm({...form,category:e.target.value})}><option>Food</option><option>Activities</option><option>Transport</option><option>Misc</option></select></>}

                <button onClick={()=>handleSubmit(k)} style={{...styles.btn, ...styles.btnPrimary}}>Save</button>
                <button onClick={()=>setModals(p=>({...p,[k]:false}))} style={{...styles.btn, marginTop:'10px', color:'#999'}}>Cancel</button>
             </div>
          </div>
       ))}
    </div>
  );
};

// 5. FEED
const FeedView = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [cam, setCam] = useState(false);
  const [img, setImg] = useState(null);

  useEffect(() => onSnapshot(query(collection(db,'artifacts',appId,'public','data','parkside_posts'),orderBy('timestamp','desc')), s=>setPosts(s.docs.map(d=>({id:d.id,...d.data()})))), []);

  const post = async () => {
    if(!text && !img) return;
    await addDoc(collection(db,'artifacts',appId,'public','data','parkside_posts'), { author:user.displayName, text, image:img, timestamp:serverTimestamp() });
    setText(''); setImg(null);
  };

  return (
    <div style={styles.section}>
       {cam && (
          <div style={{position:'fixed', inset:0, backgroundColor:'black', zIndex:300, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
             <div style={{color:'white'}}>Camera Active</div>
             <button onClick={()=>setCam(false)} style={{marginTop:'20px', color:'white'}}>Close</button>
          </div>
       )}

       <div style={styles.card}>
          <div style={{display:'flex', gap:'12px'}}>
             <div style={{width:'40px', height:'40px', borderRadius:'20px', backgroundColor:'#f4f4f5', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', color:'#71717a'}}>{user.displayName[0]}</div>
             <textarea style={{...styles.input, height:'80px', resize:'none', marginBottom:0}} placeholder="Share an update..." value={text} onChange={e=>setText(e.target.value)}></textarea>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', marginTop:'12px'}}>
             <button onClick={()=>setCam(true)} style={{border:'none', background:'transparent', color:theme.primary, fontWeight:'700', fontSize:'13px', display:'flex', alignItems:'center', gap:'6px'}}><Camera size={18}/> Add Photo</button>
             <button onClick={post} style={{backgroundColor:theme.text, color:'white', padding:'8px 20px', borderRadius:'20px', border:'none', fontWeight:'700'}}>Post</button>
          </div>
       </div>

       {posts.map(p => (
          <div key={p.id} style={{...styles.card, padding:'0', overflow:'hidden'}}>
             <div style={{padding:'16px', display:'flex', gap:'12px', alignItems:'center'}}>
                <div style={{width:'36px', height:'36px', borderRadius:'18px', backgroundColor:'#f4f4f5', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'700', color:'#71717a'}}>{p.author[0]}</div>
                <div><div style={{fontWeight:'700'}}>{p.author}</div><div style={{fontSize:'11px', color:'#999'}}>Just now</div></div>
             </div>
             {p.text && <div style={{padding:'0 16px 16px 16px', color:'#333'}}>{p.text}</div>}
             {p.image && <div style={{height:'300px', backgroundColor:'black', display:'flex', alignItems:'center', justifyContent:'center'}}><img src={p.image} style={{maxHeight:'100%', maxWidth:'100%'}}/></div>}
             <div style={{padding:'12px 16px', borderTop:`1px solid ${theme.border}`, display:'flex', gap:'20px'}}>
                <button style={{border:'none', background:'transparent', display:'flex', alignItems:'center', gap:'6px', color:'#666', fontWeight:'600'}}><Heart size={18}/> Like</button>
             </div>
          </div>
       ))}
    </div>
  );
};

// --- APP SHELL ---
export default function ParksideApp() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('staff');
  const [view, setView] = useState('dashboard');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
       if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
       else await signInAnonymously(auth);
    };
    init();
    onAuthStateChanged(auth, setUser);
  }, []);

  if (!user) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:theme.bg}}><RefreshCw className="animate-spin" color={theme.primary}/></div>;
  if (!loggedIn) return <LoginScreen firebaseUser={user} onLogin={r=>{setRole(r);setLoggedIn(true);}} />;

  return (
    <div style={styles.app}>
       <div style={styles.header}>
          <ParksideLogo />
          <button onClick={()=>setLoggedIn(false)} style={{width:'36px', height:'36px', borderRadius:'18px', backgroundColor:'#fee2e2', border:'none', display:'flex', alignItems:'center', justifyContent:'center', color:'#ef4444'}}><LogOut size={18}/></button>
       </div>

       {view === 'dashboard' && <Dashboard user={user} onNavigate={setView} />}
       {view === 'calendar' && <CalendarManager user={user} userRole={role} />}
       {view === 'house' && <HouseManager user={user} userRole={role} />}
       {view === 'feed' && <FeedView user={user} />}

       <BottomNav active={view} onChange={setView} />
    </div>
  );
}


