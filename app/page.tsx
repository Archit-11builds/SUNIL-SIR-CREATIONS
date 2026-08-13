'use client';

import { useMemo, useState } from 'react';
import {
  BarChart3, BookOpen, CheckCircle2, ChevronRight, Clock3, ExternalLink,
  FileText, Flame, GraduationCap, LayoutDashboard, Library, Menu, Moon,
  PlayCircle, Plus, Search, Settings2, Sparkles, Sun, Target, X
} from 'lucide-react';

type Subject = { name:string; color:string; chapters:string[] };
const subjects:Subject[] = [
 {name:'Mathematics',color:'#f97316',chapters:['Real Numbers','Polynomials','Pair of Linear Equations in Two Variables','Quadratic Equations','Arithmetic Progressions','Triangles','Coordinate Geometry','Introduction to Trigonometry','Some Applications of Trigonometry','Circles','Areas Related to Circles','Surface Areas and Volumes','Statistics','Probability']},
 {name:'Science',color:'#fb7185',chapters:['Chemical Reactions and Equations','Acids, Bases and Salts','Metals and Non-metals','Carbon and its Compounds','Life Processes','Control and Coordination','How do Organisms Reproduce?','Heredity','Light – Reflection and Refraction','The Human Eye and the Colourful World','Electricity','Magnetic Effects of Electric Current','Our Environment']},
 {name:'Social Science',color:'#8b5cf6',chapters:['The Rise of Nationalism in Europe','Nationalism in India','The Making of a Global World','Print Culture and the Modern World','Resources and Development','Forest and Wildlife Resources','Water Resources','Agriculture','Manufacturing Industries','Lifelines of National Economy','Power Sharing','Federalism','Gender, Religion and Caste','Political Parties','Outcomes of Democracy','Development','Sectors of the Indian Economy','Money and Credit','Globalisation and the Indian Economy','Consumer Rights']},
 {name:'English',color:'#06b6d4',chapters:['A Letter to God','Nelson Mandela: Long Walk to Freedom','Two Stories about Flying','From the Diary of Anne Frank','Glimpses of India','Mijbil the Otter','Madam Rides the Bus','The Sermon at Benares','The Proposal']},
 {name:'Hindi',color:'#22c55e',chapters:['क्षितिज','कृतिका','व्याकरण','लेखन']},
 {name:'Information Technology',color:'#eab308',chapters:['Digital Documentation','Electronic Spreadsheet','Database Management System','Web Applications and Security']}
];

const resources = [
 {title:'CBSE Academic Curriculum 2026–27',url:'https://cbseacademic.nic.in/curriculum_2027.html'},
 {title:'CBSE Class X Question Bank',url:'https://cbseacademic.nic.in/qbclass10.html'},
 {title:'CBSE Assessment Resources',url:'https://cbseacademic.nic.in/cbe/assessment.html'},
 {title:'CBSE Skill Education Curriculum',url:'https://cbseacademic.nic.in/skill-education-curriculum.html'}
];

function ProgressRing({value}:{value:number}) {
 return <div className="ring" style={{'--p':`${value*3.6}deg`} as React.CSSProperties}><div><b>{value}%</b><span>complete</span></div></div>
}

export default function Home(){
 const [page,setPage]=useState('Dashboard');
 const [dark,setDark]=useState(false);
 const [open,setOpen]=useState(false);
 const [query,setQuery]=useState('');
 const [done,setDone]=useState<Record<string,boolean>>({});
 const [notes,setNotes]=useState<string[]>([]);
 const [note,setNote]=useState('');
 const total=subjects.reduce((a,s)=>a+s.chapters.length,0);
 const completed=Object.values(done).filter(Boolean).length;
 const percent=Math.round(completed/total*100);

 const filtered=useMemo(()=>subjects.flatMap(s=>s.chapters.map(c=>({subject:s.name,chapter:c,color:s.color}))).filter(x=>(x.chapter+' '+x.subject).toLowerCase().includes(query.toLowerCase())),[query]);

 const toggle=(key:string)=>setDone(d=>({...d,[key]:!d[key]}));
 const nav=(p:string)=>{setPage(p);setOpen(false)};

 return <div className={dark?'app dark':'app'}>
   <aside className={open?'sidebar open':'sidebar'}>
     <div className="brand"><div className="brandIcon"><GraduationCap size={21}/></div><div><b>CBSE Study Hub</b><small>Class 10 • 2026–27</small></div></div>
     <nav>
       {[
        ['Dashboard',LayoutDashboard],['Syllabus',BookOpen],['Notes',FileText],['Revision',Target],['Resources',Library],['Analytics',BarChart3]
       ].map(([n,I]:any)=><button className={page===n?'nav active':'nav'} key={n} onClick={()=>nav(n)}><I size={18}/><span>{n}</span></button>)}
     </nav>
     <div className="sidebarBottom"><button className="nav"><Settings2 size={18}/><span>Settings</span></button><div className="mini"><Flame size={17}/><div><b>7 day streak</b><small>Keep it going!</small></div></div></div>
   </aside>

   <main>
    <header><button className="mobileMenu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><div className="crumb">Study Hub <ChevronRight size={15}/> {page}</div><div className="headerActions"><button onClick={()=>setDark(!dark)} className="iconBtn" title="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button><div className="avatar">A</div></div></header>

    {page==='Dashboard' && <section className="content">
      <div className="hero">
        <div><span className="eyebrow"><Sparkles size={14}/> YOUR STUDY COMMAND CENTRE</span><h1>Study smarter.<br/><em>Score better.</em></h1><p>Track your CBSE Class 10 journey, revise on time, and keep every resource in one place.</p><div className="heroBtns"><button className="primary" onClick={()=>nav('Syllabus')}>Continue studying <ChevronRight size={17}/></button><a className="softBtn" href="https://www.youtube.com/@SunilBhaiya-Science" target="_blank" rel="noreferrer"><PlayCircle size={17}/> Sunil Sir lectures</a></div></div><ProgressRing value={percent}/></div>
      <div className="stats">
       {[['Overall progress',percent+'%',Target],['Chapters done',completed+'/'+total,CheckCircle2],['Study streak','7 days',Flame],['Revision due','3',Clock3]].map(([t,v,I]:any)=><div className="stat" key={t}><div className="statIcon"><I size={18}/></div><div><span>{t}</span><b>{v}</b></div></div>)}
      </div>
      <div className="sectionTitle"><div><h2>Your subjects</h2><p>Real-time progress from your syllabus tracker.</p></div><button className="linkBtn" onClick={()=>nav('Syllabus')}>View syllabus <ChevronRight size={15}/></button></div>
      <div className="subjectGrid">{subjects.map(s=>{const d=s.chapters.filter(c=>done[s.name+'::'+c]).length;const p=Math.round(d/s.chapters.length*100);return <button className="subjectCard" key={s.name} onClick={()=>nav('Syllabus')}><div className="subjectTop"><span className="dot" style={{background:s.color}}/><span>{s.name}</span><b>{p}%</b></div><div className="bar"><i style={{width:p+'%',background:s.color}}/></div><small>{d} of {s.chapters.length} chapters complete</small></button>})}</div>
      <div className="twoCol"><div className="panel"><div className="panelHead"><div><h3>Continue studying</h3><p>Pick up where you left off.</p></div><BookOpen size={19}/></div><div className="continue"><div className="bookIcon">∑</div><div><b>Quadratic Equations</b><span>Mathematics • Chapter 4</span></div><button onClick={()=>nav('Syllabus')}><ChevronRight/></button></div></div>
      <div className="panel"><div className="panelHead"><div><h3>Quick resources</h3><p>Official & trusted links.</p></div><ExternalLink size={19}/></div>{resources.slice(0,3).map(r=><a className="resourceRow" href={r.url} target="_blank" rel="noreferrer" key={r.title}><span>{r.title}</span><ExternalLink size={15}/></a>)}</div></div>
    </section>}

    {page==='Syllabus' && <section className="content"><div className="pageHead"><div><span className="eyebrow">SYLLABUS TRACKER</span><h1>Master every chapter.</h1><p>Tick chapters off as you complete them. Your dashboard updates instantly.</p></div><div className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search chapters..."/></div></div><div className="syllabusList">{subjects.map(s=><div className="syllabusSubject" key={s.name}><div className="syllabusHead"><div><span className="dot" style={{background:s.color}}/><b>{s.name}</b></div><span>{s.chapters.filter(c=>done[s.name+'::'+c]).length}/{s.chapters.length}</span></div>{s.chapters.filter(c=>(s.name+' '+c).toLowerCase().includes(query.toLowerCase())).map((c,i)=>{const key=s.name+'::'+c;return <button className={done[key]?'chapter done':'chapter'} key={c} onClick={()=>toggle(key)}><span className="check">{done[key]?'✓':''}</span><span>{i+1}. {c}</span>{done[key]&&<small>Completed</small>}</button>})}</div>)}</div></section>}

    {page==='Notes' && <section className="content"><div className="pageHead"><div><span className="eyebrow">YOUR NOTES</span><h1>Keep your best notes close.</h1><p>Quick notes for formulas, reminders and last-minute revision.</p></div></div><div className="noteComposer"><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Write a quick revision note..."/><button className="primary" onClick={()=>{if(note.trim()){setNotes([...notes,note.trim()]);setNote('')}}}><Plus size={17}/> Add note</button></div><div className="notesGrid">{notes.length?notes.map((n,i)=><div className="noteCard" key={i}><div className="notePin">✦</div><p>{n}</p><button onClick={()=>setNotes(notes.filter((_,j)=>j!==i))}>Delete</button></div>):<div className="empty"><FileText size={32}/><b>No notes yet</b><span>Add your first quick revision note above.</span></div>}</div></section>}

    {page==='Revision' && <section className="content"><div className="pageHead"><div><span className="eyebrow">REVISION MODE</span><h1>Revise before you forget.</h1><p>A simple queue for chapters you want to revisit.</p></div></div><div className="revisionHero"><Target size={38}/><div><b>Today's focus</b><h2>Quadratic Equations</h2><span>Mathematics • High priority • 20 min</span></div><button className="primary" onClick={()=>nav('Syllabus')}>Open chapter</button></div><div className="panel revisionInfo"><h3>Suggested routine</h3><p>Review your short notes → solve a few questions → mark the chapter complete when you are confident.</p></div></section>}

    {page==='Resources' && <section className="content"><div className="pageHead"><div><span className="eyebrow">CBSE RESOURCES</span><h1>Everything in one place.</h1><p>Official CBSE links plus a dedicated resource area for each subject.</p></div></div><div className="resourceGrid">{resources.map(r=><a className="resourceCard" href={r.url} target="_blank" rel="noreferrer" key={r.title}><div className="resourceIcon"><ExternalLink size={19}/></div><b>{r.title}</b><span>Open official resource <ChevronRight size={14}/></span></a>)}</div><div className="panel lecturePanel"><div><span className="eyebrow">LECTURES</span><h2>Sunil Sir — Physics / Science</h2><p>Keep your lecture source one click away. Replace the link below with the exact lecture playlist for each chapter.</p></div><a className="primary" href="https://www.youtube.com/@SunilBhaiya" target="_blank" rel="noreferrer"><PlayCircle size={17}/> Open channel</a></div></section>}

    {page==='Analytics' && <section className="content"><div className="pageHead"><div><span className="eyebrow">ANALYTICS</span><h1>Your progress, clearly.</h1><p>Simple stats based on your current syllabus checklist.</p></div></div><div className="analytics"><div className="bigPanel"><ProgressRing value={percent}/><div><h2>{percent}% complete</h2><p>{completed} of {total} chapters checked off.</p><button className="primary" onClick={()=>nav('Syllabus')}>Keep going <ChevronRight size={16}/></button></div></div><div className="panel"><h3>Subject breakdown</h3>{subjects.map(s=>{const d=s.chapters.filter(c=>done[s.name+'::'+c]).length;return <div className="analyticRow" key={s.name}><span>{s.name}</span><b>{Math.round(d/s.chapters.length*100)}%</b><div className="bar"><i style={{width:(d/s.chapters.length*100)+'%',background:s.color}}/></div></div>})}</div></div></section>}
   </main>
 </div>
}