// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Camera, Home, Calendar, MessageSquare, User, Shield, Heart, X, RefreshCw, Lock, LogOut, 
  Clock, Plus, Users, Edit3, Trash2, Briefcase, Wrench, Receipt, CheckCircle, Leaf, Phone, 
  PhoneCall, Moon, Sun, CalendarDays, ArrowRight, UserPlus, UserX, Key, Eye, ChevronRight
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

// --- STYLES (CSS-IN-JS) ---
const styles = {
  app: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', backgroundColor: '#F5F5F4', minHeight: '100vh', color: '#292524', paddingBottom: '100px' },
  
  // Header & Nav
  header: { position: 'sticky', top: 0, zIndex: 50, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  navDock: { position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#292524', borderRadius: '40px', padding: '8px', display: 'flex', gap: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 100 },
  navBtn: { padding: '12px', borderRadius: '50%', border: 'none', background: 'transparent', color: '#A8A29E', cursor: 'pointer', transition: '0.2s' },
  navBtnActive: { backgroundColor: '#65A30D', color: 'white', transform: 'scale(1.1)' },
  
  // Cards & Containers
  card: { backgroundColor: 'white', borderRadius: '24px', padding: '20px', marginBottom: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  
  // Typography
  h1: { fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' },
  h2: { fontSize: '20px', fontWeight: '700', marginBottom: '12px' },
  label: { fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#A8A29E', marginBottom: '6px', display: 'block' },
  
  // Inputs & Buttons
  input: { width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid transparent', backgroundColor: '#F5F5F4', fontSize: '16px', fontWeight: '600', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '16px', borderRadius: '16px', border: 'none', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s' },
  btnPrimary: { backgroundColor: '#292524', color: 'white', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' },
  btnAccent: { backgroundColor: '#65A30D', color: 'white', boxShadow: '0 10px 20px rgba(101, 163, 13, 0.2)' },
  btnSecondary: { backgroundColor: 'white', border: '1px solid #E7E5E4', color: '#57534E' },
  
  // Badges & Status
  badge: { padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' },
  badgeSleep: { backgroundColor: '#F3E8FF', color: '#7E22CE' },
  badgeLate: { backgroundColor: '#FFEDD5', color: '#C2410C' },
  badgeGreen: { backgroundColor: '#DCFCE7', color: '#15803D' },
  
  // Login Specific
  loginPage: { position: 'fixed', inset: 0, zIndex: 999, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px', background: 'linear-gradient(135deg, #1c1917 0%, #44403c 100%)' },
  loginCard: { backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', padding: '32px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' },
  loginInput: { backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' },
  
  // Modal
  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' },
  modalSheet: { width: '100%', backgroundColor: 'white', borderRadius: '32px 32px 0 0', padding: '24px', maxHeight: '85vh', overflowY: 'auto', animation: 'slideUp 0.3s ease-out' }
};

// --- UTILS ---
const getTodayString = () => new Date().toISOString().split('T')[0];
const addDays = (d, n) => { const date = new Date(d); date.setDate(date.getDate() + n); return date.toISOString().split('T')[0]; };

// --- COMPONENTS ---

const ParksideLogo = ({ dark = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <div style={{ width: '40px', height: '40px', backgroundColor: '#65A30D', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(101, 163, 13, 0.3)' }}>
      <Leaf color="white" size={24} />
    </div>
    <div>
      <div style={{ fontSize: '20px', fontWeight: '900', color: dark ? 'white' : '#292524', lineHeight: '1' }}>Parkside</div>
      <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: dark ? 'rgba(255,255,255,0.5)' : '#65A30D' }}>Residential</div>
    </div>
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

      // Backdoor
      if (name.toLowerCase() === 'nathan' && password === 'reset-admin') { setIsReset(true); setLoading(false); return; }

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
    <div style={styles.loginPage}>
      <div style={{ marginBottom: '40px' }}>
        <ParksideLogo dark />
        <h1 style={{ color: 'white', fontSize: '40px', fontWeight: '800', marginTop: '20px', lineHeight: '1.1' }}>Welcome<br/>Home.</h1>
      </div>
      <div style={styles.loginCard}>
        <form onSubmit={handleLogin}>
          <label style={{...styles.label, color: 'rgba(255,255,255,0.5)'}}>Username</label>
          <input style={{...styles.input, ...styles.loginInput}} value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Nathan" />
          <label style={{...styles.label, color: 'rgba(255,255,255,0.5)'}}>Password</label>
          <input type="password" style={{...styles.input, ...styles.loginInput}} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••" />
          <button style={{...styles.btn, backgroundColor: 'white', color: '#292524', marginTop: '10px'}} disabled={loading}>
            {loading ? 'Verifying...' : 'Enter Portal'} <ArrowRight size={18}/>
          </button>
        </form>
      </div>
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
    <div style={{ padding: '24px' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
             <p style={{ color: '#78716C', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Good Afternoon,</p>
             <h1 style={styles.h1}>{user.displayName.split(' ')[0]}</h1>
          </div>
          <div style={{ width: '50px', height: '50px', borderRadius: '16px', backgroundColor: '#E7E5E4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: '#57534E' }}>
            {user.displayName[0]}
          </div>
       </div>

       {/* HERO CARD */}
       <div style={{ backgroundColor: '#292524', borderRadius: '32px', padding: '24px', color: 'white', marginBottom: '20px', position: 'relative', overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ position: 'relative', zIndex: 10 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#22C55E', borderRadius: '50%' }}></div> Active Manager
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                   <div style={{ fontSize: '28px', fontWeight: '800' }}>{oc ? oc.name : 'No Data'}</div>
                   <div style={{ opacity: 0.5, fontSize: '14px' }}>On Call until 09:00</div>
                </div>
                {oc && <a href={`tel:${oc.number}`} style={{ width: '48px', height: '48px', backgroundColor: '#65A30D', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><PhoneCall size={20}/></a>}
             </div>
          </div>
       </div>

       <div style={styles.grid}>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{...styles.card, backgroundColor: '#E7E5E4', border: 'none', position: 'relative', overflow: 'hidden'}}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#57534E', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <CalendarDays size={14}/> Up Next
               </div>
               {next ? (
                  <div>
                      <div style={{ fontSize: '28px', fontWeight: '900', color: '#292524' }}>{new Date(next.date).toLocaleDateString('en-GB', {weekday:'short', day:'numeric'})}</div>
                      <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                        <Clock size={12}/> 08:00 Start
                      </div>
                  </div>
               ) : <div style={{fontSize: '20px', fontWeight: '700', opacity: 0.5}}>No upcoming shifts</div>}
            </div>
          </div>
          <div onClick={()=>onNavigate('calendar')} style={{...styles.card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', justifyContent: 'center', padding: '30px'}}>
             <div style={{ color: '#F97316' }}><Calendar size={32}/></div>
             <span style={{ fontWeight: '700', color: '#44403C' }}>Rota</span>
          </div>
          <div onClick={()=>onNavigate('house')} style={{...styles.card, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', justifyContent: 'center', padding: '30px'}}>
             <div style={{ color: '#3B82F6' }}><Wrench size={32}/></div>
             <span style={{ fontWeight: '700', color: '#44403C' }}>House</span>
          </div>
       </div>
    </div>
  );
};

// 3. ROTA
const CalendarManager = ({ user, userRole }) => {
  const [shifts, setShifts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [users, setUsers] = useState([]);
  const [date, setDate] = useState('');
  const [s1,setS1]=useState(''); const [s2,setS2]=useState(''); const [s3,setS3]=useState(''); const [d1,setD1]=useState('');

  useEffect(() => {
    onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_rota_v3'), orderBy('date')), s => setShifts(s.docs.map(d=>({id:d.id, ...d.data()}))));
    onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_users')), s => setUsers(s.docs.map(d=>d.data())));
  }, []);

  const saveBlock = async () => {
    const batch = writeBatch(db);
    const id = doc(collection(db,'artifacts',appId,'public','data','parkside_rota_v3')).id;
    const t1 = [{name:s1,type:'sleep',day:1},{name:s2,type:'sleep',day:1},{name:s3,type:'sleep',day:1},{name:d1,type:'day',day:1}].filter(x=>x.name);
    const t2 = [{name:s1,type:'sleep',day:2},{name:s2,type:'sleep',day:2},{name:s3,type:'sleep',day:2},{name:d1,type:'day',day:2}].filter(x=>x.name);
    batch.set(doc(db,'artifacts',appId,'public','data','parkside_rota_v3',id), {date, displayDate: new Date(date).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}), staff:t1, type:'block', dayNumber:1, blockId:id});
    const nd = addDays(date, 1);
    batch.set(doc(collection(db,'artifacts',appId,'public','data','parkside_rota_v3')), {date:nd, displayDate: new Date(nd).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}), staff:t2, type:'block', dayNumber:2, blockId:id});
    await batch.commit(); setShowAdd(false);
  };

  const myShifts = shifts.filter(s => s.staff.some(st => st.name.toLowerCase() === user.displayName.toLowerCase()));

  return (
    <div style={{ padding: '24px' }}>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
         <h2 style={styles.h1}>My Shifts</h2>
         {userRole==='manager' && <button onClick={()=>setShowAdd(true)} style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#292524', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={20}/></button>}
       </div>

       {myShifts.map(shift => {
          const me = shift.staff.find(s => s.name.toLowerCase() === user.displayName.toLowerCase());
          return (
            <div key={shift.id} style={{...styles.card, borderLeft: '4px solid #65A30D'}}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                     <div style={{ fontSize: '22px', fontWeight: '800' }}>{shift.displayDate}</div>
                     <div style={{ fontSize: '12px', fontWeight: '700', color: '#A8A29E', textTransform: 'uppercase' }}>{me.day===1 ? 'Day 1 (Start)' : 'Day 2 (Finish)'}</div>
                  </div>
                  <span style={{...styles.badge, ...(me.type==='sleep' ? styles.badgeSleep : styles.badgeLate)}}>{me.type==='sleep'?'SLEEP':'LATE'}</span>
               </div>
               <div style={{ backgroundColor: '#F5F5F4', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: '600', color: '#57534E', display: 'flex', gap: '8px' }}>
                  <Clock size={16} color="#65A30D"/>
                  {me.type==='sleep' ? (me.day===1 ? '08:00 Start -> Sleep Over' : 'Sleep -> Finish 08:30') : '08:00 - 22:30 Late Finish'}
               </div>
            </div>
          )
       })}

       {showAdd && (
         <div style={styles.modalOverlay}>
            <div style={styles.modalSheet}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={styles.h2}>Add 48hr Block</h3>
                  <button onClick={()=>setShowAdd(false)} style={{ border: 'none', background: 'none' }}><X/></button>
               </div>
               <input type="date" style={styles.input} value={date} onChange={e=>setDate(e.target.value)}/>
               <label style={styles.label}>Sleep-in Team (x3)</label>
               <select style={styles.input} onChange={e=>setS1(e.target.value)}><option>Select Staff</option>{users.map(u=><option>{u.name}</option>)}</select>
               <select style={styles.input} onChange={e=>setS2(e.target.value)}><option>Select Staff</option>{users.map(u=><option>{u.name}</option>)}</select>
               <select style={styles.input} onChange={e=>setS3(e.target.value)}><option>Select Staff</option>{users.map(u=><option>{u.name}</option>)}</select>
               <label style={styles.label}>Late Finish</label>
               <select style={styles.input} onChange={e=>setD1(e.target.value)}><option>Select Staff</option>{users.map(u=><option>{u.name}</option>)}</select>
               <button style={{...styles.btn, ...styles.btnAccent}} onClick={saveBlock}>Save Rota</button>
            </div>
         </div>
       )}
    </div>
  );
};

// 4. HOUSE HUB
const HouseManager = ({ user }) => {
  const [repairs, setRepairs] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [item, setItem] = useState(''); const [loc, setLoc] = useState('');

  useEffect(() => onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_repairs'), orderBy('timestamp', 'desc')), s => setRepairs(s.docs.map(d=>({id:d.id, ...d.data()})))), []);
  
  const save = async () => {
    await addDoc(collection(db,'artifacts',appId,'public','data','parkside_repairs'), {item, location:loc, status:'open', reportedBy:user.displayName, timestamp:serverTimestamp()});
    setShowAdd(false); setItem(''); setLoc('');
  };

  return (
    <div style={{ padding: '24px' }}>
       <h2 style={styles.h1}>Repairs Log</h2>
       <div style={{ marginTop: '20px' }}>
          <button onClick={()=>setShowAdd(true)} style={{...styles.btn, ...styles.btnPrimary, marginBottom: '20px'}}><Wrench size={18}/> Report Issue</button>
          {repairs.map(r => (
             <div key={r.id} style={{...styles.card, opacity: r.status==='fixed' ? 0.6 : 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: r.status==='fixed'?'#DCFCE7':'#FFEDD5', color: r.status==='fixed'?'#15803D':'#C2410C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {r.status==='fixed' ? <CheckCircle size={20}/> : <Wrench size={20}/>}
                   </div>
                   <div>
                      <div style={{ fontWeight: '700', fontSize: '16px' }}>{r.item}</div>
                      <div style={{ fontSize: '12px', color: '#A8A29E' }}>{r.location}</div>
                   </div>
                </div>
                <button onClick={()=>updateDoc(doc(db,'artifacts',appId,'public','data','parkside_repairs',r.id),{status:r.status==='open'?'fixed':'open'})} style={{ border: 'none', background: 'none', fontWeight: '700', fontSize: '12px', color: '#78716C' }}>
                   {r.status==='open' ? 'Mark Done' : 'Undo'}
                </button>
             </div>
          ))}
       </div>
       {showAdd && (
         <div style={styles.modalOverlay}>
            <div style={styles.modalSheet}>
               <h3 style={styles.h2}>Report Issue</h3>
               <input style={styles.input} placeholder="What broke?" value={item} onChange={e=>setItem(e.target.value)}/>
               <input style={styles.input} placeholder="Which room?" value={loc} onChange={e=>setLoc(e.target.value)}/>
               <button style={{...styles.btn, ...styles.btnPrimary}} onClick={save}>Submit Report</button>
               <button style={{...styles.btn, marginTop: '10px', backgroundColor: 'transparent'}} onClick={()=>setShowAdd(false)}>Cancel</button>
            </div>
         </div>
       )}
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

  if (!user) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#F5F5F4'}}><RefreshCw className="animate-spin" color="#65A30D"/></div>;
  if (!loggedIn) return <LoginScreen firebaseUser={user} onLogin={r=>{setRole(r);setLoggedIn(true);}} />;

  return (
    <div style={styles.app}>
       {/* HEADER */}
       <div style={styles.header}>
          <ParksideLogo />
          <button onClick={()=>setLoggedIn(false)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: '#F5F5F4', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LogOut size={20}/></button>
       </div>

       {/* CONTENT */}
       <div>
          {view === 'dashboard' && <Dashboard user={user} onNavigate={setView} />}
          {view === 'calendar' && <CalendarManager user={user} userRole={role} />}
          {view === 'house' && <HouseManager user={user} />}
          {view === 'feed' && <div style={{padding:'24px'}}><h2 style={styles.h1}>Team Log</h2><p style={{marginTop:'10px', color:'#A8A29E'}}>Feed updates coming in v2.0</p></div>}
       </div>

       {/* NAVIGATION */}
       <div style={styles.navDock}>
          {['dashboard', 'calendar', 'house', 'feed'].map(v => (
             <button key={v} onClick={()=>setView(v)} style={view === v ? {...styles.navBtn, ...styles.navBtnActive} : styles.navBtn}>
                {v==='dashboard'?<Home size={24}/>:v==='calendar'?<Calendar size={24}/>:v==='house'?<Wrench size={24}/>:<MessageSquare size={24}/>}
             </button>
          ))}
       </div>
    </div>
  );
}


