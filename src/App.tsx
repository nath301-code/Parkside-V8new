// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { 
  Camera, Home, Calendar, MessageSquare, User, Shield, Heart, X, RefreshCw, Lock, LogOut, 
  Clock, Plus, Users, Edit3, Trash2, Briefcase, Wrench, Receipt, CheckCircle, Leaf, Phone, 
  PhoneCall, Moon, Sun, CalendarDays, ArrowRight, UserPlus, UserX, Key, Eye, ChevronRight, MapPin
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, signOut, updateProfile
} from "firebase/auth";
import { 
  getFirestore, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, doc, updateDoc, 
  arrayUnion, deleteDoc, where, writeBatch, getDocs
} from "firebase/firestore";

// --- CONFIGURATION ---
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

// --- UTILS ---
const getTodayString = () => new Date().toISOString().split('T')[0];
const addDays = (d, n) => { const date = new Date(d); date.setDate(date.getDate() + n); return date.toISOString().split('T')[0]; };

// --- UI COMPONENTS ( The "Wow" Factor ) ---

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100/50 ${onClick ? 'active:scale-[0.98] transition-transform cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled }) => {
  const base = "w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-stone-200/50";
  const styles = {
    primary: "bg-[#292524] text-white hover:bg-[#44403c]",
    accent: "bg-[#65A30D] text-white hover:bg-[#4d7c0a]",
    danger: "bg-red-500 text-white",
    secondary: "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
  };
  return (
    <button disabled={disabled} onClick={onClick} className={`${base} ${styles[variant]} ${className} ${disabled ? 'opacity-50' : ''}`}>
      {children}
    </button>
  );
};

const Input = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    {Icon && <Icon className="absolute left-4 top-4 text-stone-400 group-focus-within:text-[#65A30D] transition-colors" size={20} />}
    <input {...props} className={`w-full bg-stone-50 border-2 border-transparent focus:bg-white focus:border-[#65A30D]/20 text-stone-800 font-bold rounded-2xl py-4 ${Icon ? 'pl-12' : 'px-4'} outline-none transition-all placeholder:text-stone-300`} />
  </div>
);

const ParksideLogo = ({ light = false }) => (
  <div className="flex items-center gap-2.5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${light ? 'bg-white/20 backdrop-blur-md' : 'bg-[#65A30D]'}`}>
      <Leaf className="text-white -rotate-45" size={20} fill="currentColor" />
    </div>
    <div>
      <h1 className={`text-xl font-black tracking-tight leading-none ${light ? 'text-white' : 'text-[#292524]'}`}>Parkside</h1>
      <p className={`text-[10px] font-bold uppercase tracking-widest ${light ? 'text-white/60' : 'text-[#65A30D]'}`}>Residential</p>
    </div>
  </div>
);

// --- SCREENS ---

// 1. LOGIN SCREEN (Redesigned)
const LoginScreen = ({ onLogin, firebaseUser }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name || (!isResetting && !password)) return;
    setLoading(true); setError('');

    try {
      const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'parkside_users');
      const snapshot = await getDocs(usersRef);
      let userDoc = snapshot.docs.find(d => d.data().name.toLowerCase() === name.trim().toLowerCase());

      // Backdoor
      if (name.toLowerCase() === 'nathan' && password === 'reset-admin') { setIsResetting(true); setLoading(false); return; }

      if (isResetting && userDoc) {
        await updateDoc(userDoc.ref, { password: newPassword });
        onLogin(userDoc.data().role); return;
      }

      let role = 'staff';
      let create = false;

      if (snapshot.empty && name.toLowerCase() === 'nathan') { role = 'manager'; create = true; }
      else if (userDoc && userDoc.data().password === password) { role = userDoc.data().role; }
      else throw new Error("Invalid");

      if (firebaseUser) {
        await updateProfile(firebaseUser, { displayName: name });
        if (create) await addDoc(usersRef, { name: 'Nathan', role: 'manager', password, createdAt: serverTimestamp() });
        onLogin(role);
      }
    } catch (err) { setError('Access Denied'); setLoading(false); }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-end pb-12 px-6 overflow-hidden bg-[#1c1917]">
      {/* Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-[120%] bg-[url('https://images.unsplash.com/photo-1518173946687-a4c88928d9fd?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-[#1c1917]/80 to-transparent"></div>

      <div className="relative z-10 w-full max-w-sm mx-auto space-y-8">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-6">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-wide">System Online</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">Welcome<br/>Home.</h1>
          <p className="text-stone-400 font-medium">Secure access for Parkside staff only.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-500">
            {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-sm p-3 rounded-xl text-center mb-4 font-medium">{error}</div>}
            <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-3">
                    <input value={name} onChange={e=>setName(e.target.value)} placeholder="Username" className="w-full bg-black/20 border border-white/10 text-white placeholder:text-white/30 rounded-2xl p-4 outline-none focus:bg-black/40 transition-all font-bold" />
                    <input type="password" value={isResetting ? newPassword : password} onChange={e=>isResetting?setNewPassword(e.target.value):setPassword(e.target.value)} placeholder={isResetting ? "New Password" : "Password"} className="w-full bg-black/20 border border-white/10 text-white placeholder:text-white/30 rounded-2xl p-4 outline-none focus:bg-black/40 transition-all font-bold" />
                </div>
                <button disabled={loading} className="w-full bg-white text-black py-4 rounded-2xl font-bold text-lg hover:bg-stone-200 active:scale-95 transition-all mt-2">
                    {loading ? <RefreshCw className="animate-spin mx-auto"/> : (isResetting ? 'Set Password' : 'Enter Portal')}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

// 2. DASHBOARD (Redesigned)
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
    <div className="p-6 pb-32 space-y-6 bg-[#F5F5F4] min-h-screen">
       <div className="flex justify-between items-end pt-4">
          <div>
             <p className="text-stone-500 font-bold text-sm uppercase tracking-wider mb-1">Good Afternoon,</p>
             <h1 className="text-4xl font-black text-[#292524]">{user.displayName.split(' ')[0]}</h1>
          </div>
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center text-2xl font-bold text-[#65A30D]">{user.displayName[0]}</div>
       </div>

       {/* Hero Card - On Call */}
       <div className="relative overflow-hidden rounded-[2.5rem] bg-[#292524] p-8 text-white shadow-2xl shadow-stone-400/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="relative z-10">
             <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Active Manager
             </div>
             <div className="flex justify-between items-end">
                <div>
                   <h2 className="text-3xl font-bold mb-1">{oc ? oc.name : 'No Data'}</h2>
                   <p className="text-white/50 text-sm">On Call until 09:00</p>
                </div>
                {oc && <a href={`tel:${oc.number}`} className="w-14 h-14 bg-[#65A30D] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg shadow-green-900/20"><PhoneCall size={24}/></a>}
             </div>
          </div>
       </div>

       {/* Grid */}
       <div className="grid grid-cols-2 gap-4">
          {/* Next Shift */}
          <Card className="col-span-2 !bg-[#E7E5E4] border-none !shadow-none relative overflow-hidden">
              <Leaf className="absolute -right-6 -bottom-6 text-stone-300/50 w-32 h-32" />
              <div className="relative z-10">
                <div className="text-xs font-bold text-stone-500 uppercase mb-2 flex items-center gap-2"><CalendarDays size={14}/> Up Next</div>
                {next ? (
                    <div>
                        <div className="text-3xl font-black text-stone-800">{new Date(next.date).toLocaleDateString('en-GB', {weekday:'short', day:'numeric'})}</div>
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-stone-600 shadow-sm"><Clock size={12}/> 08:00 Start</div>
                    </div>
                ) : <div className="text-xl font-bold text-stone-400">No shifts soon</div>}
              </div>
          </Card>

          <Card onClick={()=>onNavigate('calendar')} className="flex flex-col items-center justify-center gap-3 py-8 hover:bg-white hover:border-[#65A30D]/30 group">
             <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform"><Calendar size={24}/></div>
             <span className="font-bold text-stone-700">Rota</span>
          </Card>
          
          <Card onClick={()=>onNavigate('house')} className="flex flex-col items-center justify-center gap-3 py-8 hover:bg-white hover:border-[#65A30D]/30 group">
             <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Wrench size={24}/></div>
             <span className="font-bold text-stone-700">House</span>
          </Card>
       </div>
    </div>
  );
};

// 3. ROTA & CALENDAR
const CalendarManager = ({ user, userRole }) => {
  const [view, setView] = useState('myrota');
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [appts, setAppts] = useState([]);
  
  const [showAdd, setShowAdd] = useState(false);
  const [showApt, setShowApt] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  // Forms
  const [mode, setMode] = useState('block');
  const [date, setDate] = useState('');
  const [s1,setS1]=useState(''); const [s2,setS2]=useState(''); const [s3,setS3]=useState(''); const [d1,setD1]=useState('');
  const [adName, setAdName]=useState(''); const [adStart, setAdStart]=useState(''); const [adEnd, setAdEnd]=useState('');
  const [aptData, setAptData] = useState({child:'',type:'',date:'',time:'',escort:''});

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_rota_v3'), orderBy('date')), s => setShifts(s.docs.map(d=>({id:d.id, ...d.data()}))));
    const u2 = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_users'), orderBy('name')), s => setStaff(s.docs.map(d=>d.data())));
    const u3 = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'parkside_appointments'), orderBy('dateTime')), s => setAppts(s.docs.map(d=>({id:d.id, ...d.data()}))));
    return () => { u1(); u2(); u3(); };
  }, []);

  const saveBlock = async () => {
    if(!date || !s1) return;
    const batch = writeBatch(db);
    const id1 = doc(collection(db,'artifacts',appId,'public','data','parkside_rota_v3')).id;
    const id2 = doc(collection(db,'artifacts',appId,'public','data','parkside_rota_v3')).id;
    const team1 = [{name:s1,type:'sleep',dayIndex:1},{name:s2,type:'sleep',dayIndex:1},{name:s3,type:'sleep',dayIndex:1},{name:d1,type:'day',dayIndex:1}].filter(x=>x.name);
    const team2 = [{name:s1,type:'sleep',dayIndex:2},{name:s2,type:'sleep',dayIndex:2},{name:s3,type:'sleep',dayIndex:2},{name:d1,type:'day',dayIndex:2}].filter(x=>x.name);
    
    batch.set(doc(db,'artifacts',appId,'public','data','parkside_rota_v3',id1), {date, displayDate: new Date(date).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}), staff:team1, type:'block', dayNumber:1, blockId:id1});
    const nd = addDays(date, 1);
    batch.set(doc(db,'artifacts',appId,'public','data','parkside_rota_v3',id2), {date:nd, displayDate: new Date(nd).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}), staff:team2, type:'block', dayNumber:2, blockId:id1});
    await batch.commit(); setShowAdd(false);
  };

  const myShifts = shifts.filter(s => s.staff.some(st => st.name.toLowerCase() === user.displayName.toLowerCase()));

  return (
    <div className="p-4 pb-32 min-h-screen bg-[#F5F5F4] space-y-6">
      <div className="sticky top-0 z-20 bg-[#F5F5F4]/90 backdrop-blur-md pb-2">
         <div className="bg-stone-200 p-1 rounded-2xl flex">
           {['myrota', 'fullrota', 'diary'].map(v => (
             <button key={v} onClick={()=>setView(v)} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${view===v ? 'bg-white text-[#65A30D] shadow-sm scale-100' : 'text-stone-400 scale-95'}`}>{v==='myrota'?'My Shifts':v==='fullrota'?'Team Rota':'Diary'}</button>
           ))}
         </div>
      </div>

      {/* MY SHIFTS */}
      {view === 'myrota' && (
        <div className="space-y-4">
           {myShifts.map(shift => {
              const me = shift.staff.find(s => s.name.toLowerCase() === user.displayName.toLowerCase());
              const isDay1 = me.dayIndex === 1;
              return (
                <Card key={shift.id} onClick={()=>shift.blockId && setSelectedBlock(shift.blockId)} className="relative overflow-hidden group border-l-4 border-l-[#65A30D]">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-2xl font-black text-stone-800">{shift.displayDate}</div>
                        <div className="text-xs font-bold text-stone-400 uppercase mt-1">{shift.type==='adhoc' ? 'Extra Shift' : (isDay1 ? 'Day 1 (Start)' : 'Day 2 (Finish)')}</div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl text-xs font-bold ${me.type==='sleep'?'bg-purple-100 text-purple-700':'bg-orange-100 text-orange-700'}`}>{me.type==='sleep'?'SLEEP':'LATE'}</div>
                   </div>
                   <div className="bg-stone-50 rounded-xl p-3 flex items-center gap-3 text-stone-600 font-bold text-sm">
                      <Clock size={16} className="text-[#65A30D]"/>
                      {me.type==='adhoc' ? `${me.start} - ${me.end}` : (me.type==='sleep' ? (isDay1 ? '08:00 Start -> Sleep' : 'Sleep -> 08:30 Finish') : '08:00 - 22:30')}
                   </div>
                   {shift.blockId && <div className="absolute bottom-3 right-3 text-stone-300"><Eye size={16}/></div>}
                </Card>
              )
           })}
        </div>
      )}

      {/* FULL ROTA */}
      {view === 'fullrota' && (
        <div className="space-y-4">
           {userRole==='manager' && <Button variant="accent" onClick={()=>setShowAdd(true)}><Plus/> Add Shift</Button>}
           {shifts.map(shift => (
             <Card key={shift.id} className="!p-4">
                <div className="flex justify-between border-b border-stone-100 pb-3 mb-3">
                   <span className="font-bold text-stone-800">{shift.displayDate}</span>
                   {userRole==='manager' && <button onClick={()=>deleteDoc(doc(db,'artifacts',appId,'public','data','parkside_rota_v3',shift.id))} className="text-stone-300 hover:text-red-500"><Trash2 size={16}/></button>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                   {shift.staff.map((s,i) => (
                     <div key={i} className={`flex items-center gap-2 text-xs font-bold px-2 py-2 rounded-lg ${s.type==='sleep'?'bg-purple-50 text-purple-700':'bg-orange-50 text-orange-700'}`}>
                        {s.type==='sleep' ? <Moon size={12}/> : <Sun size={12}/>} {s.name}
                     </div>
                   ))}
                </div>
             </Card>
           ))}
        </div>
      )}

      {/* APPOINTMENTS */}
      {view === 'diary' && (
        <div className="space-y-4">
          <Button variant="secondary" onClick={()=>setShowApt(true)}><Plus/> Add Appointment</Button>
          {appts.map(apt => (
            <Card key={apt.id} className="flex items-center gap-4 !p-4 border-l-4 border-l-[#D97706]">
               <div className="w-14 h-14 bg-[#FEF3C7] rounded-2xl flex flex-col items-center justify-center text-[#D97706] font-bold shrink-0">
                 <span className="text-[10px] uppercase">{new Date(apt.displayDate).toLocaleString('default',{month:'short'})}</span>
                 <span className="text-xl">{new Date(apt.displayDate).getDate()}</span>
               </div>
               <div>
                 <div className="font-bold text-lg text-stone-800">{apt.childName}</div>
                 <div className="text-xs font-bold text-stone-400 flex items-center gap-2"><Clock size={12}/> {apt.displayTime} • {apt.type}</div>
               </div>
            </Card>
          ))}
        </div>
      )}

      {/* ADD SHIFT MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full rounded-t-[2rem] p-6 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-bold">Add Shift</h3>
                 <button onClick={()=>setShowAdd(false)} className="bg-stone-100 p-2 rounded-full"><X size={20}/></button>
              </div>
              <div className="flex bg-stone-100 p-1 rounded-2xl mb-6">
                 <button onClick={()=>setMode('block')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${mode==='block' ? 'bg-white shadow text-[#292524]' : 'text-stone-400'}`}>48hr Block</button>
                 <button onClick={()=>setMode('adhoc')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${mode==='adhoc' ? 'bg-white shadow text-[#292524]' : 'text-stone-400'}`}>Hourly</button>
              </div>
              <div className="space-y-4">
                 <Input type="date" value={date} onChange={e=>setDate(e.target.value)} />
                 {mode === 'block' ? (
                   <>
                     <div className="space-y-2"><label className="text-xs font-bold uppercase text-stone-400 ml-2">Sleep-in Team</label>{[setS1,setS2,setS3].map((fn,i)=><select key={i} onChange={e=>fn(e.target.value)} className="w-full p-4 bg-stone-50 rounded-2xl font-bold outline-none"><option value="">Select Staff</option>{staff.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}</select>)}</div>
                     <div className="space-y-2"><label className="text-xs font-bold uppercase text-stone-400 ml-2">Late Finish</label><select onChange={e=>setD1(e.target.value)} className="w-full p-4 bg-stone-50 rounded-2xl font-bold outline-none"><option value="">Select Staff</option>{staff.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}</select></div>
                     <Button onClick={saveBlock}>Save Block</Button>
                   </>
                 ) : (
                   <>
                     <select onChange={e=>setAdName(e.target.value)} className="w-full p-4 bg-stone-50 rounded-2xl font-bold outline-none"><option value="">Select Staff</option>{staff.map(s=><option key={s.name} value={s.name}>{s.name}</option>)}</select>
                     <div className="flex gap-3"><Input type="time" value={adStart} onChange={e=>setAdStart(e.target.value)} /><Input type="time" value={adEnd} onChange={e=>setAdEnd(e.target.value)} /></div>
                     <Button onClick={saveAdhoc} variant="accent">Save Shift</Button>
                   </>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* BLOCK DETAILS MODAL */}
      {selectedBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
           <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-[#292524] p-6 text-white flex justify-between items-center">
                 <h3 className="font-bold text-xl">48hr Overview</h3>
                 <button onClick={()=>setSelectedBlock(null)}><X/></button>
              </div>
              <div className="p-6 space-y-4 bg-stone-50">
                 {shifts.filter(s=>s.blockId===selectedBlock).sort((a,b)=>a.dayNumber-b.dayNumber).map(day => (
                    <div key={day.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                       <div className="flex justify-between mb-2">
                          <span className="font-bold text-stone-800">{day.displayDate}</span>
                          <span className="text-[10px] font-black uppercase bg-[#65A30D]/10 text-[#65A30D] px-2 py-1 rounded">Day {day.dayNumber}</span>
                       </div>
                       <div className="text-sm text-stone-500 flex items-center gap-2"><Clock size={14}/> {day.dayNumber===1 ? '08:00 Start' : 'Finish 08:30 Next Day'}</div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// 4. HOUSE & TEAM
const HouseManager = ({ user, userRole }) => {
  const [section, setSection] = useState('oncall');
  const [data, setData] = useState({ users:[], oncall:[], repairs:[], receipts:[] });
  const [modals, setModals] = useState({ user:false, oncall:false, repair:false, receipt:false });
  
  // Inputs
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
    const col = `parkside_${type}s`; // users, oncall(s - wait), repairs, receipts
    const cName = type === 'oncall' ? 'parkside_oncall' : `parkside_${type}s`;
    
    const payload = { timestamp: serverTimestamp(), ...form };
    if(type==='repair') { payload.status='open'; payload.reportedBy=user.displayName; }
    if(type==='receipt') { payload.staff=user.displayName; }
    
    await addDoc(collection(db,'artifacts',appId,'public','data',cName), payload);
    setModals(p=>({...p, [type]:false})); setForm({});
  };

  return (
    <div className="p-4 pb-32 min-h-screen bg-[#F5F5F4] space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
         {['oncall','repair','receipt',...(userRole==='manager'?['user']:[])].map(k => (
           <button key={k} onClick={()=>setSection(k)} className={`px-5 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all ${section===k ? 'bg-[#292524] text-white shadow-lg' : 'bg-white text-stone-500 border border-stone-100'}`}>
             {k==='oncall'?'On Call':k==='repair'?'Repairs':k==='receipt'?'Cash':k==='user'?'Team':''}
           </button>
         ))}
      </div>

      {section === 'user' && (
        <div className="space-y-3">
           <div className="bg-[#65A30D] text-white p-6 rounded-[2rem] mb-4 relative overflow-hidden">
             <h3 className="text-2xl font-bold relative z-10">Team Access</h3>
             <p className="text-green-100 text-sm relative z-10 mb-4">Manage staff logins securely.</p>
             <button onClick={()=>setModals(p=>({...p,user:true}))} className="bg-white text-[#65A30D] px-4 py-2 rounded-xl font-bold text-xs relative z-10 shadow-lg">Add Staff</button>
             <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-green-600 opacity-50"/>
           </div>
           {data.users.map(u => (
             <Card key={u.id} className="flex justify-between items-center !p-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center font-bold text-stone-500">{u.name[0]}</div>
                 <div><div className="font-bold text-stone-800">{u.name}</div><div className="text-xs font-bold text-stone-400 uppercase">{u.role}</div></div>
               </div>
               <button onClick={()=>deleteDoc(doc(db,'artifacts',appId,'public','data','parkside_users',u.id))} className="bg-red-50 p-2 rounded-full text-red-500"><Trash2 size={16}/></button>
             </Card>
           ))}
        </div>
      )}

      {section === 'oncall' && (
        <div className="space-y-3">
           {userRole==='manager' && <Button variant="accent" onClick={()=>setModals(p=>({...p,oncall:true}))}><Edit3/> Update Rota</Button>}
           {data.oncall.map(oc => (
             <Card key={oc.id} className={`flex justify-between items-center !p-5 ${oc.date===getTodayString() ? 'ring-2 ring-[#65A30D] border-transparent' : ''}`}>
                <div>
                   {oc.date===getTodayString() && <span className="bg-[#65A30D] text-white text-[10px] font-bold px-2 py-0.5 rounded mb-2 inline-block">ACTIVE</span>}
                   <div className="text-xs font-bold text-stone-400 uppercase">{new Date(oc.date).toLocaleDateString('en-GB',{weekday:'short',day:'numeric'})}</div>
                   <div className="font-bold text-xl text-stone-800">{oc.name}</div>
                   <div className="text-[#65A30D] font-bold text-sm mt-1 flex items-center gap-1"><Phone size={12}/> {oc.number}</div>
                </div>
                {userRole==='manager' && <button onClick={()=>deleteDoc(doc(db,'artifacts',appId,'public','data','parkside_oncall',oc.id))} className="text-stone-300"><Trash2 size={16}/></button>}
             </Card>
           ))}
        </div>
      )}

      {/* Modals handled inline for brevity, similar style to Calendar */}
      {modals.user && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"><div className="bg-white w-full rounded-3xl p-6 space-y-3"><h3 className="font-bold text-xl mb-2">New Staff</h3><Input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/><Input placeholder="Password" onChange={e=>setForm({...form,password:e.target.value})}/><select className="w-full p-4 bg-stone-50 rounded-2xl font-bold" onChange={e=>setForm({...form,role:e.target.value})}><option value="staff">Staff</option><option value="manager">Manager</option></select><Button onClick={()=>handleSubmit('user')}>Create</Button><button onClick={()=>setModals(p=>({...p,user:false}))} className="w-full text-center p-4 font-bold text-stone-400">Cancel</button></div></div>}
      
      {modals.oncall && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"><div className="bg-white w-full rounded-3xl p-6 space-y-3"><h3 className="font-bold text-xl mb-2">Add On Call</h3><Input type="date" onChange={e=>setForm({...form,date:e.target.value})}/><Input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/><Input placeholder="Phone" onChange={e=>setForm({...form,number:e.target.value})}/><Button onClick={()=>handleSubmit('oncall')}>Save</Button><button onClick={()=>setModals(p=>({...p,oncall:false}))} className="w-full text-center p-4 font-bold text-stone-400">Cancel</button></div></div>}
    </div>
  );
};

// 5. FEED (Social Style)
const FeedView = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [cam, setCam] = useState(false);
  const [text, setText] = useState('');
  const [img, setImg] = useState(null);

  useEffect(() => onSnapshot(query(collection(db,'artifacts',appId,'public','data','parkside_posts'),orderBy('timestamp','desc')), s=>setPosts(s.docs.map(d=>({id:d.id,...d.data()})))), []);
  
  const post = async () => {
    if(!text && !img) return;
    await addDoc(collection(db,'artifacts',appId,'public','data','parkside_posts'), {
      author: user.displayName, text, image: img, timestamp: serverTimestamp(), likes: []
    });
    setText(''); setImg(null);
  };

  return (
    <div className="pb-32 bg-[#F5F5F4] min-h-screen">
      {cam && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
           <div className="flex-1 relative bg-black">
             {/* Placeholder for Camera Component which would go here */}
             <div className="absolute inset-0 flex items-center justify-center text-white">Camera Active</div>
           </div>
           <div className="p-8 flex justify-between items-center">
             <button onClick={()=>setCam(false)} className="text-white font-bold">Cancel</button>
             <button className="w-20 h-20 bg-white rounded-full border-4 border-stone-800"></button>
           </div>
        </div>
      )}

      <div className="bg-white p-4 sticky top-0 z-30 border-b border-stone-100">
         <div className="flex gap-3">
            <div className="w-10 h-10 bg-stone-200 rounded-full shrink-0 flex items-center justify-center font-bold text-stone-500">{user.displayName[0]}</div>
            <div className="flex-1 bg-stone-50 rounded-2xl p-3">
               <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Share an update..." className="w-full bg-transparent outline-none resize-none text-sm" rows="2"></textarea>
               <div className="flex justify-between items-center mt-2 pt-2 border-t border-stone-200/50">
                  <button onClick={()=>setCam(true)} className="text-[#65A30D] font-bold text-xs flex items-center gap-1"><Camera size={16}/> Add Photo</button>
                  <button onClick={post} className="bg-[#292524] text-white px-4 py-1.5 rounded-lg text-xs font-bold">Post</button>
               </div>
            </div>
         </div>
      </div>

      <div className="p-4 space-y-4">
         {posts.map(p => (
           <Card key={p.id} className="!p-0 overflow-hidden">
              <div className="p-4 flex items-center gap-3">
                 <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center font-bold text-xs">{p.author[0]}</div>
                 <div><div className="font-bold text-sm">{p.author}</div><div className="text-[10px] text-stone-400">{p.timestamp && new Date(p.timestamp.toDate()).toLocaleString()}</div></div>
              </div>
              {p.text && <div className="px-4 pb-3 text-sm text-stone-600">{p.text}</div>}
              {p.image && <div className="bg-black aspect-square"><img src={p.image} className="w-full h-full object-contain"/></div>}
              <div className="p-3 border-t border-stone-50 flex gap-4">
                 <button className="flex items-center gap-1 text-xs font-bold text-stone-500"><Heart size={16}/> Like</button>
              </div>
           </Card>
         ))}
      </div>
    </div>
  );
};

// --- MAIN SHELL ---
export default function ParksideApp() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('staff');
  const [view, setView] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
       if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
       else await signInAnonymously(auth);
    };
    init();
    onAuthStateChanged(auth, setUser);
  }, []);

  if (!user) return <div className="h-screen flex items-center justify-center bg-[#F5F5F4]"><RefreshCw className="animate-spin text-[#65A30D]"/></div>;
  if (!isLoggedIn) return <LoginScreen firebaseUser={user} onLogin={r=>{setRole(r);setIsLoggedIn(true);}} />;

  return (
    <div className="max-w-md mx-auto h-screen bg-[#F5F5F4] flex flex-col overflow-hidden shadow-2xl">
       {/* HEADER */}
       <div className="bg-white/80 backdrop-blur-xl p-4 sticky top-0 z-40 flex justify-between items-center border-b border-stone-200/50">
          <ParksideLogo />
          <button onClick={()=>setIsLoggedIn(false)} className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><LogOut size={20}/></button>
       </div>

       {/* CONTENT */}
       <div className="flex-1 overflow-y-auto no-scrollbar">
          {view === 'dashboard' && <Dashboard user={user} onNavigate={setView} />}
          {view === 'calendar' && <CalendarManager user={user} userRole={role} />}
          {view === 'house' && <HouseManager user={user} userRole={role} />}
          {view === 'feed' && <FeedView user={user} />}
       </div>

       {/* FLOATING DOCK NAV */}
       <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="bg-[#292524]/90 backdrop-blur-xl p-1.5 rounded-full flex gap-1 shadow-[0_10px_40px_rgba(0,0,0,0.3)] pointer-events-auto border border-white/10">
             {['dashboard','calendar','house','feed'].map(v => (
               <button key={v} onClick={()=>setView(v)} className={`p-3.5 rounded-full transition-all duration-300 ${view===v ? 'bg-[#65A30D] text-white translate-y-[-2px] shadow-lg' : 'text-stone-400 hover:text-white hover:bg-white/10'}`}>
                 {v==='dashboard'?<Home size={24}/>:v==='calendar'?<Calendar size={24}/>:v==='house'?<Wrench size={24}/>:<MessageSquare size={24}/>}
               </button>
             ))}
          </div>
       </div>
    </div>
  );
}


