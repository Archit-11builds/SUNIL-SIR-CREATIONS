'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award, BarChart3, BookOpen, CalendarDays, CheckCircle2, ChevronRight,
  Clock3, Download, DownloadCloud, ExternalLink, FileText, Flame, LayoutDashboard,
  Library, Lock, Menu, MessageSquare, Moon, NotebookPen, PlayCircle,
  Search, Settings, Star, Target, Brain, Sparkles, History, SlidersHorizontal,
  RotateCcw, CheckSquare, TimerReset, Trophy, Upload, User, X, Zap, Bot, Send,
  Medal, ClipboardCheck, Users, ShieldCheck, Cloud, Wifi, WifiOff, CalendarRange,
  Gauge, FileBadge, ListChecks, AlertCircle, CircleHelp, Save, Maximize2,
  ChevronDown, BookMarked, TrendingUp, CircleDot, Check, Plus, Trash2, RefreshCw,
  Copy, KeyRound, Timer, Bell, Lightbulb, ArrowUpRight, LibraryBig,
  GraduationCap, Goal, Percent, Clock, Sparkle, Layers3, UserRoundPlus, PanelTop,
  Database, CloudCog, RotateCw, SearchCheck, ListFilter, ChartNoAxesCombined,
  CircleCheckBig, CircleX
} from 'lucide-react';

type Status = 'todo' | 'progress' | 'done';
type Exam = { id: string; subject: string; date: string };
type Chapter = { id: string; name: string; note: string };
type Subject = { id: string; name: string; icon: string; chapters: Chapter[] };
type Viewer = { title: string; url: string; description?: string };
type LocalAccount = { id: string; name: string; className: string; createdAt: string };

type ResourceType = 'NCERT' | 'Syllabus' | 'Sample Papers' | 'PYQs' | 'Question Bank' | 'Marking Scheme' | 'Model Answers' | 'E-Resources';

const names = {
  maths: ['Real Numbers','Polynomials','Pair of Linear Equations in Two Variables','Quadratic Equations','Arithmetic Progressions','Triangles','Coordinate Geometry','Introduction to Trigonometry','Some Applications of Trigonometry','Circles','Areas Related to Circles','Surface Areas and Volumes','Statistics','Probability'],
  science: ['Chemical Reactions and Equations','Acids, Bases and Salts','Metals and Non-metals','Carbon and its Compounds','Life Processes','Control and Coordination','How do Organisms Reproduce?','Heredity','Light – Reflection and Refraction','The Human Eye and the Colourful World','Electricity','Magnetic Effects of Electric Current','Our Environment'],
  history: ['The Rise of Nationalism in Europe','Nationalism in India','The Making of a Global World','The Age of Industrialisation','Print Culture and the Modern World'],
  geography: ['Resources and Development','Forest and Wildlife Resources','Water Resources','Agriculture','Minerals and Energy Resources','Manufacturing Industries','Lifelines of National Economy'],
  civics: ['Power Sharing','Federalism','Gender, Religion and Caste','Political Parties','Outcomes of Democracy'],
  economics: ['Development','Sectors of the Indian Economy','Money and Credit','Globalisation and the Indian Economy','Consumer Rights'],
  english: ['A Letter to God','Nelson Mandela: Long Walk to Freedom','Two Stories about Flying','From the Diary of Anne Frank','Glimpses of India','Mijbil the Otter','Madam Rides the Bus','The Sermon at Benares','The Proposal','A Triumph of Surgery','The Thief’s Story','The Midnight Visitor','A Question of Trust','Footprints without Feet','The Making of a Scientist','The Necklace','Bholi','The Book That Saved the Earth','Grammar & Writing'],
  hindi: ['क्षितिज — गद्य खंड','क्षितिज — काव्य खंड','कृतिका — पूरक पाठ्यपुस्तक','व्याकरण','लेखन कौशल','अपठित बोध'],
} as Record<string, string[]>;

const meta = [
  ['maths','Mathematics','∑'], ['science','Science','⚗'], ['history','History','🏛'],
  ['geography','Geography','🌍'], ['civics','Civics','⚖'], ['economics','Economics','₹'],
  ['english','English','A'], ['hindi','Hindi','अ'],
];

const subjects: Subject[] = meta.map(([id, name, icon]) => ({
  id, name, icon,
  chapters: names[id].map((name, i) => ({
    id: `${id}-${i}`,
    name,
    note: 'Understand the concept, revise the important points, practise NCERT and finish with board-style questions.',
  })),
}));

const cbseNews = [
  { date: '13 Aug 2026', tag: 'CBSE UPDATE', title: '845+ curriculum-aligned virtual labs and digital resources are available on DIKSHA.', text: 'Useful for concept learning and interactive practice.', url: 'https://www.cbse.gov.in/cbsenew/cbse.html' },
  { date: '12 Aug 2026', tag: 'CBSE UPDATE', title: 'CBSE published a new Class XII supplementary-examination result update.', text: 'Keep the official CBSE examination page bookmarked for current board notices.', url: 'https://www.cbse.gov.in/cbsenew/cbse.html' },
  { date: '2026', tag: 'PAPERS', title: 'Official Class X 2026 question papers are available in the CBSE archive.', text: 'Use them for timed practice after completing a chapter.', url: 'https://www.cbse.gov.in/cbsenew/question-paper.html' },
  { date: '02 Apr 2026', tag: 'CURRICULUM', title: 'CBSE released the Class IX–X 2026–27 curriculum information.', text: 'Use the official curriculum when planning your syllabus and revision.', url: 'https://www.cbse.gov.in/cbsenew/documents/14_Circular_01042026.pdf' },
];

const nav = [
  ['dashboard','Dashboard',LayoutDashboard], ['syllabus','Syllabus',BookOpen],
  ['datesheet','Date Sheet',CalendarDays], ['study','What to Study',Zap],
  ['notes','Notes',NotebookPen], ['revision','Revision',PlayCircle],
  ['quiz','Quiz Arena',ClipboardCheck], ['mistakes','Mistake Book',AlertCircle],
  ['analytics','Analytics',BarChart3], ['leaderboard','Leaderboard',Trophy],
  ['rewards','Rewards',Medal], ['heatmap','Study Heatmap',CalendarRange],
  ['resources','Resource Library',LibraryBig], ['rooms','Study Rooms',Users],
  ['ai','Auren Intelligence',Bot], ['feedback','Feedback',MessageSquare], ['settings','Settings',Settings],
] as const;

const today = () => new Date().toISOString().slice(0, 10);
const pretty = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const days = (a: string, b: string) => Math.max(0, Math.ceil((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / 86400000));
const safeRead = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
};

const pdfBySubject: Record<string, string> = {
  Mathematics: 'https://www.ncert.nic.in/textbook/pdf/jemh1ps.pdf',
  Science: 'https://www.ncert.nic.in/textbook/pdf/jesc1ps.pdf',
  History: 'https://ncert.nic.in/textbook.php?iess3=0-5',
  Geography: 'https://ncert.nic.in/textbook.php?jess1=ps-4',
  Civics: 'https://ncert.nic.in/textbook.php?iess3=0-5',
  Economics: 'https://ncert.nic.in/textbook.php?jess1=ps-4',
  English: 'https://ncert.nic.in/textbook.php?lefl1=0-9',
  Hindi: 'https://ncert.nic.in/textbook.php?jhks1=3-12',
};

const cbseArchive = 'https://cbseacademic.nic.in/sqp_archive.html';
const cbseQuestionBank = 'https://www.cbse.gov.in/cbsenew/question_bank.html';
const cbseMarkingScheme = 'https://www.cbse.gov.in/cbsenew/marking-scheme.html';
const cbseEresources = 'https://www.cbse.gov.in/cbsenew/e-resources.html';
const cbseCurrent = 'https://www.cbse.gov.in/cbsenew/samplepaper.html';
const cbseSstPdf = 'https://cbseacademic.nic.in/web_material/SQP/ClassX_2025_26/SocialScience-SQP.pdf';
const cbseSciencePdf = 'https://cbseacademic.nic.in/web_material/SQP/ClassX_2025_26/Science-SQP.pdf';

const cbseSyllabus = 'https://cbseacademic.nic.in/curriculum_2027.html';
const cbseModelAnswers = 'https://www.cbse.gov.in/cbsenew/model-answer.html';

const getResource = (subject: string, chapter: string, type: ResourceType): Viewer | null => {
  const book = pdfBySubject[subject] || 'https://ncert.nic.in/textbook.php';
  if (type === 'NCERT') return { title: `${subject} · NCERT Textbook`, url: book, description: `Official NCERT textbook resource for ${chapter}.` };
  if (type === 'Syllabus') return { title: `${subject} · Class X Curriculum`, url: cbseSyllabus, description: 'Official CBSE 2026–27 curriculum and syllabus information.' };
  if (type === 'Sample Papers') {
    if (subject === 'Science') return { title: 'Science · CBSE Sample Paper', url: cbseSciencePdf, description: 'Official CBSE Class X Science sample paper.' };
    if (['History','Geography','Civics','Economics'].includes(subject)) return { title: 'Social Science · CBSE Sample Paper', url: cbseSstPdf, description: 'Official CBSE Class X Social Science sample paper.' };
    return { title: `${subject} · CBSE Sample Papers`, url: cbseCurrent, description: 'Official CBSE sample-paper hub.' };
  }
  if (type === 'PYQs') return { title: `${subject} · Previous Year Question Papers`, url: cbseArchive, description: 'Official CBSE archive of previous examination papers.' };
  if (type === 'Question Bank') return { title: `${subject} · CBSE Question Bank`, url: cbseQuestionBank, description: 'Official CBSE question-bank resources.' };
  if (type === 'Marking Scheme') return { title: `${subject} · CBSE Marking Scheme`, url: cbseMarkingScheme, description: 'Official CBSE marking schemes for answer-writing practice.' };
  if (type === 'Model Answers') return { title: `${subject} · CBSE Model Answers`, url: cbseModelAnswers, description: 'Official CBSE model-answer resources.' };
  return { title: `${subject} · CBSE E-Resources`, url: cbseEresources, description: 'Official CBSE e-resources and digital learning links.' };
};

export default function Home() {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('10');
  const [onboard, setOnboard] = useState(false);
  const [page, setPage] = useState('dashboard');
  const [mobile, setMobile] = useState(false);
  const [dark, setDark] = useState(false);
  const [selected, setSelected] = useState<Subject | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [chapterSteps, setChapterSteps] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [exams, setExams] = useState<Exam[]>([]);
  const [planned, setPlanned] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [toast, setToast] = useState('');
  const [draftSubject, setDraftSubject] = useState('Mathematics');
  const [draftDate, setDraftDate] = useState('');
  const [plannerExamId, setPlannerExamId] = useState('');
  const [search, setSearch] = useState('');
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [timerOpen, setTimerOpen] = useState(false);
  const [brandTransition, setBrandTransition] = useState(false);
  const [postBrandShlok, setPostBrandShlok] = useState(false);
  const [postBrandCoda, setPostBrandCoda] = useState(false);
  const [brandPhase, setBrandPhase] = useState<'auren' | 'archit' | 'exit'>('auren');
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [feedback, setFeedback] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState<{ rating: number; text: string; date: string }[]>([]);
  const [leaderFriends, setLeaderFriends] = useState<{ name: string; xp: number }[]>([]);
  const [friendName, setFriendName] = useState('');
  const [friendXp, setFriendXp] = useState('500');
  const [userList, setUserList] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<LocalAccount[]>([]);
  const [dailyMinutes, setDailyMinutes] = useState(90);
  const [activity, setActivity] = useState<string[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navTransition, setNavTransition] = useState(false);
  const [navTransitionLabel, setNavTransitionLabel] = useState('');
  const [goalDone, setGoalDone] = useState(0);
  const [lastSession, setLastSession] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [mistakes, setMistakes] = useState<{id:string;subject:string;chapter:string;question:string;answer:string;date:string;mastered:boolean}[]>([]);
  const [quizSubject, setQuizSubject] = useState('Mathematics');
  const [quizChapter, setQuizChapter] = useState('');
  const [quizDifficulty, setQuizDifficulty] = useState('Board');
  const [quizCount, setQuizCount] = useState(5);
  const [quizQuestions, setQuizQuestions] = useState<{q:string;answer:string;options:string[]}[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizScore, setQuizScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [studyMinutes, setStudyMinutes] = useState<Record<string, number>>({});
  const [streakFreeze, setStreakFreeze] = useState(1);
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [rooms, setRooms] = useState<{code:string;name:string;members:number;goal:string}[]>([]);
  const [cloudStatus, setCloudStatus] = useState<'local'|'syncing'|'online'|'offline'>('local');
  const [cloudUserId, setCloudUserId] = useState('');
  const [certificateOpen, setCertificateOpen] = useState(false);
  const [resourceFilter, setResourceFilter] = useState('All');
  const [adminOpen, setAdminOpen] = useState(false);
  const [reminders, setReminders] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [focusSessions, setFocusSessions] = useState(0);
  const [boardScore, setBoardScore] = useState(0);
  const [lastCloudSync, setLastCloudSync] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [briefDismissed, setBriefDismissed] = useState(false);
  const [commandPulse, setCommandPulse] = useState(false);

  useEffect(() => {
    const n = localStorage.getItem('ac_name');
    if (n) { setName(n); setClassName(localStorage.getItem('ac_class') || '10'); } else setOnboard(true);
    setStatus(safeRead('ac_status', {})); setChapterSteps(safeRead('ac_chapter_steps', {})); setNotes(safeRead('ac_notes', {})); setExams(safeRead('ac_exams', []));
    setPlanned(safeRead('ac_planned', [])); setCompleted(safeRead('ac_completed', []));
    setDark(localStorage.getItem('ac_dark') === '1'); setUserList(safeRead('ac_users', []));
    const storedAccounts = safeRead<LocalAccount[]>('ac_accounts', []);
    if (storedAccounts.length) setAccounts(storedAccounts);
    setDailyMinutes(Number(localStorage.getItem('ac_daily_minutes') || 90));
    setActivity(safeRead('ac_activity', []));
    setGoalDone(Number(localStorage.getItem('ac_goal_done') || 0));
    setFeedbackHistory(safeRead('ac_feedback_history', []));
    setLeaderFriends(safeRead('ac_leader_friends', []));
    setLastSession(localStorage.getItem('ac_last_session') || '');
    setMistakes(safeRead('ac_mistakes', [])); setStudyMinutes(safeRead('ac_study_minutes', {}));
    setStreakFreeze(Number(localStorage.getItem('ac_streak_freeze') || 1));
    setRooms(safeRead('ac_rooms', [])); setCloudUserId(localStorage.getItem('ac_cloud_user') || '');
    setReminders(localStorage.getItem('ac_reminders') !== '0'); setCompactMode(localStorage.getItem('ac_compact') === '1');
    setFocusSessions(Number(localStorage.getItem('ac_focus_sessions') || 0));
    setLastCloudSync(localStorage.getItem('ac_last_cloud_sync') || '');
  }, []);

  useEffect(() => { localStorage.setItem('ac_status', JSON.stringify(status)); }, [status]);
  useEffect(() => { localStorage.setItem('ac_chapter_steps', JSON.stringify(chapterSteps)); }, [chapterSteps]);
  useEffect(() => { localStorage.setItem('ac_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('ac_exams', JSON.stringify(exams)); }, [exams]);
  useEffect(() => { localStorage.setItem('ac_planned', JSON.stringify(planned)); }, [planned]);
  useEffect(() => { localStorage.setItem('ac_completed', JSON.stringify(completed)); }, [completed]);
  useEffect(() => { localStorage.setItem('ac_dark', dark ? '1' : '0'); }, [dark]);
  useEffect(() => { localStorage.setItem('ac_daily_minutes', String(dailyMinutes)); }, [dailyMinutes]);
  useEffect(() => { localStorage.setItem('ac_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('ac_activity', JSON.stringify(activity)); }, [activity]);
  useEffect(() => { localStorage.setItem('ac_goal_done', String(goalDone)); }, [goalDone]);
  useEffect(() => { if (lastSession) localStorage.setItem('ac_last_session', lastSession); }, [lastSession]);
  useEffect(() => { localStorage.setItem('ac_feedback_history', JSON.stringify(feedbackHistory)); }, [feedbackHistory]);
  useEffect(() => { localStorage.setItem('ac_leader_friends', JSON.stringify(leaderFriends)); }, [leaderFriends]);
  useEffect(() => { localStorage.setItem('ac_mistakes', JSON.stringify(mistakes)); }, [mistakes]);
  useEffect(() => { localStorage.setItem('ac_study_minutes', JSON.stringify(studyMinutes)); }, [studyMinutes]);
  useEffect(() => { localStorage.setItem('ac_streak_freeze', String(streakFreeze)); }, [streakFreeze]);
  useEffect(() => { localStorage.setItem('ac_rooms', JSON.stringify(rooms)); }, [rooms]);
  useEffect(() => { localStorage.setItem('ac_reminders', reminders ? '1' : '0'); }, [reminders]);
  useEffect(() => { localStorage.setItem('ac_compact', compactMode ? '1' : '0'); }, [compactMode]);
  useEffect(() => { localStorage.setItem('ac_focus_sessions', String(focusSessions)); }, [focusSessions]);
  useEffect(() => { if (lastCloudSync) localStorage.setItem('ac_last_cloud_sync', lastCloudSync); }, [lastCloudSync]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPaletteOpen(v => !v); }
      if (e.key.toLowerCase() === 'f' && !['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement)?.tagName || '')) { e.preventDefault(); setFocusMode(true); }
      if (e.key === 'Escape') { setPaletteOpen(false); setViewer(null); setFocusMode(false); setTimerOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => setTimerSeconds(s => s > 0 ? s - 1 : 0), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    if (timerRunning && timerSeconds === 0) {
      setTimerRunning(false);
      if (timerMode === 'focus') { setGoalDone(v => Math.min(dailyMinutes, v + 25)); setFocusSessions(v=>v+1); setStudyMinutes(v=>({...v,[todayDate]:(v[todayDate]||0)+25})); if (!activity.includes(todayDate)) setActivity(a => [...a, todayDate]); setLastSession(new Date().toISOString()); }
      notify(timerMode === 'focus' ? 'Focus session complete. +25 study minutes!' : 'Break complete. Ready for another focus session.');
    }
  }, [timerSeconds, timerRunning, timerMode]);

  const all = useMemo(() => subjects.flatMap(s => s.chapters), []);
  const done = all.filter(c => status[c.id] === 'done').length;
  const prog = Math.round(done / all.length * 100);
  const xp = done * 50 + completed.length * 20;
  const todayDate = today();
  const activityDays = new Set(activity).size;
  const streak = (() => { let n=0; const d=new Date(`${todayDate}T00:00:00`); while (activity.includes(d.toISOString().slice(0,10))) { n++; d.setDate(d.getDate()-1); } return n; })();
  const nextExam = exams.filter(e => e.date >= todayDate).sort((a,b)=>a.date.localeCompare(b.date))[0];
  const goalPercent = Math.min(100, Math.round(goalDone / Math.max(1, dailyMinutes) * 100));
  const totalStudyMinutes = Object.values(studyMinutes).reduce((a,b)=>a+b,0) + goalDone;
  const mistakeMastery = mistakes.length ? Math.round(mistakes.filter(m=>m.mastered).length / mistakes.length * 100) : 100;
  const boardScoreCalc = Math.min(100, Math.round((prog * .45) + (Math.min(100, streak * 5) * .15) + (Math.min(100, totalStudyMinutes / 6) * .15) + (Math.min(100, mistakeMastery) * .1) + (Math.min(100, focusSessions * 5) * .15)));
  const level = Math.floor(xp / 500) + 1;
  const achievements = [
    { title:'First Step', text:'Complete your first chapter', icon:'⚡', on:done>=1 },
    { title:'On Fire', text:'Build a 3-day study streak', icon:'🔥', on:streak>=3 },
    { title:'Planner Pro', text:'Select 10 chapters', icon:'🎯', on:planned.length>=10 },
    { title:'Board Ready', text:'Complete 10 chapters', icon:'🏆', on:done>=10 },
    { title:'Focused', text:'Finish a focus session', icon:'⏱', on:activityDays>=1 },
    { title:'XP Hunter', text:'Earn 500 XP', icon:'✦', on:xp>=500 },
    { title:'Quiz Master', text:'Score 80%+ in a quiz', icon:'🧠', on:quizScore>=80 },
    { title:'Mistake Slayer', text:'Master 5 mistakes', icon:'🎯', on:mistakes.filter(m=>m.mastered).length>=5 },
    { title:'Deep Work', text:'Complete 5 focus sessions', icon:'⏱️', on:focusSessions>=5 },
    { title:'Board Mode', text:'Reach 80 readiness score', icon:'🏅', on:boardScoreCalc>=80 },
    { title:'Consistent', text:'Study on 10 different days', icon:'📆', on:activityDays>=10 },
  ];

  const notify = (s: string) => { setToast(s); window.setTimeout(() => setToast(''), 2400); };
  const cycle = (id: string) => { setStatus(s => ({ ...s, [id]: !s[id] || s[id] === 'todo' ? 'progress' : s[id] === 'progress' ? 'done' : 'todo' })); if (!activity.includes(todayDate)) setActivity(a => [...a, todayDate]); };
  const save = () => {
    if (!name.trim()) return notify('Enter your name first');
    const clean = name.trim();
    localStorage.setItem('ac_name', clean); localStorage.setItem('ac_class', className);
    const users = Array.from(new Set([...userList, clean])); setUserList(users); localStorage.setItem('ac_users', JSON.stringify(users));
    setAccounts(list => {
      const existing = list.find(a => a.name.toLowerCase() === clean.toLowerCase());
      if (existing) return list.map(a => a.id === existing.id ? { ...a, name: clean, className } : a);
      return [...list, { id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`, name: clean, className, createdAt: new Date().toISOString() }];
    });
    setOnboard(false);
    notify(`Welcome to AUREN, ${clean}`);
  };
  const switchAccount = (account: LocalAccount) => {
    setName(account.name); setClassName(account.className);
    localStorage.setItem('ac_name', account.name); localStorage.setItem('ac_class', account.className);
    setLoginOpen(false); setOnboard(false); setPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    notify(`Switched to ${account.name}`);
  };
  const addAccount = () => {
    setLoginOpen(false); setName(''); setClassName('10'); setOnboard(true);
  };
  const deleteCurrentAccount = () => {
    const current = accounts.find(a => a.name.toLowerCase() === name.trim().toLowerCase() && a.className === className);
    const next = accounts.filter(a => a.id !== current?.id && a.name.toLowerCase() !== name.trim().toLowerCase());
    setAccounts(next); localStorage.setItem('ac_accounts', JSON.stringify(next));
    setName(''); setClassName('10'); localStorage.removeItem('ac_name'); localStorage.removeItem('ac_class');
    setLoginOpen(false); setOnboard(true);
    notify('Current profile deleted from this device');
  };
  const go = (p: string) => {
    setPage(p);
    setSelected(null);
    setChapter(null);
    setMobile(false);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
  };
  const openBrand = () => {
    if (brandTransition || postBrandShlok || postBrandCoda) return;
    setPostBrandShlok(false);
    setPostBrandCoda(false);
    setBrandPhase('auren');
    setBrandTransition(true);

    // Slow, readable cinematic sequence: the green bloom expands first,
    // then the creator credit remains on screen long enough to read.
    window.setTimeout(() => {
      setPage('home');
      setSelected(null);
      setChapter(null);
      setMobile(false);
      setBrandPhase('exit');
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 3400);

    window.setTimeout(() => {
      setBrandTransition(false);
      setBrandPhase('auren');
      setPostBrandShlok(true);
    }, 3900);

    // The shlok gets its own calm reading moment, followed by a short AUREN creed.
    window.setTimeout(() => {
      setPostBrandShlok(false);
      setPostBrandCoda(true);
    }, 7900);
    window.setTimeout(() => setPostBrandCoda(false), 11200);
  };
  const openChapter = (s: Subject, c: Chapter) => { setSelected(s); setChapter(c); setPage('subject'); window.scrollTo(0, 0); };

  const addManualExam = () => {
    if (!draftSubject || !draftDate) return notify('Choose a subject and exam date');
    const id = crypto.randomUUID();
    setExams(x => [...x.filter(e => e.subject.toLowerCase() !== draftSubject.toLowerCase()), { id, subject: draftSubject, date: draftDate }]);
    setPlannerExamId(id);
    notify(`${draftSubject} exam added — now choose its chapters`);
    setDraftDate('');
  };
  const updateExamDate = (id: string, date: string) => setExams(x => x.map(e => e.id === id ? { ...e, date } : e));
  const deleteExam = (id: string) => setExams(x => x.filter(e => e.id !== id));
  const toggleChapter = (id: string, checked?: boolean) => {
    setPlanned(p => {
      const shouldAdd = typeof checked === 'boolean' ? checked : !p.includes(id);
      return shouldAdd ? (p.includes(id) ? p : [...p, id]) : p.filter(x => x !== id);
    });
  };
  const stepsFor = (subject: string) => {
    const key = subject.toLowerCase();
    if (['mathematics'].includes(key)) return ['Understand the concept','Solve examples','Practise NCERT','Board-style questions'];
    if (key === 'science') return ['Understand the concept','Revise diagrams & key points','Practise NCERT','Board-style questions'];
    if (['history','geography','civics','economics'].includes(key)) return ['Understand the chapter','Revise important points','Practise NCERT','Board-style questions'];
    if (key === 'english') return ['Read & understand','Textbook questions','Grammar & writing','Board-style questions'];
    return ['Read & understand','Textbook questions','Grammar & writing','Board-style questions'];
  };
  const chapterComplete = (c: Chapter) => {
    const s = subjects.find(x => x.chapters.some(ch => ch.id === c.id));
    const steps = stepsFor(s?.name || '');
    return steps.every(step => (chapterSteps[c.id] || []).includes(step));
  };
  const toggleChapterStep = (c: Chapter, subject: Subject, step: string) => {
    setChapterSteps(prev => {
      const current = prev[c.id] || [];
      const next = current.includes(step) ? current.filter(x => x !== step) : [...current, step];
      const doneNow = stepsFor(subject.name).every(x => next.includes(x));
      setStatus(st => ({ ...st, [c.id]: doneNow ? 'done' : next.length ? 'progress' : 'todo' }));
      return { ...prev, [c.id]: next };
    });
  };


  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      const rows = String(r.result || '').split(/\r?\n/).map(x => x.trim()).filter(Boolean), out: Exam[] = [];
      rows.forEach(row => { const m = row.match(/^(.+?)[,;|]\s*(\d{4}-\d{2}-\d{2})$/); if (m) out.push({ id: crypto.randomUUID(), subject: m[1].trim(), date: m[2] }); });
      if (out.length) { setExams(out); notify(`${out.length} exam dates imported`); } else notify('Use CSV/TXT like: Mathematics,2027-02-17');
    };
    r.readAsText(f);
  };

  const plan = useMemo(() => {
    const out: { date: string; subject: string; chapter: string; task: string }[] = [];
    exams.forEach(ex => {
      const s = subjects.find(x => x.name.toLowerCase() === ex.subject.toLowerCase() || x.id === ex.subject);
      if (!s) return;
      const cs = s.chapters.filter(c => planned.includes(c.id) && !chapterComplete(c));
      if (!cs.length) return;
      const slots = Math.max(1, days(todayDate, ex.date));
      cs.forEach((c, i) => {
        const d = new Date(`${todayDate}T00:00:00`);
        const perDay = Math.max(1, Math.ceil(cs.length / slots));
        d.setDate(d.getDate() + Math.min(slots - 1, Math.floor(i / perDay)));
        out.push({ date: d.toISOString().slice(0, 10), subject: s.name, chapter: c.name, task: i % 3 === 0 ? 'Theory + NCERT' : i % 3 === 1 ? 'Questions + short notes' : 'PYQs + revision' });
      });
    });
    return out.sort((a, b) => a.date.localeCompare(b.date));
  }, [exams, planned, status, todayDate]);

  const todayPlan = plan.filter(x => x.date === todayDate);
  const next = todayPlan[0] || plan.find(x => x.date > todayDate);
  const unfinishedPlanned = subjects.flatMap(s => s.chapters.filter(c => planned.includes(c.id) && !chapterComplete(c)).map(c => ({ subject:s.name, chapter:c.name, id:c.id })));
  const priorityPreview = next || unfinishedPlanned[0];
  const readinessLabel = boardScoreCalc >= 85 ? 'Exam ready' : boardScoreCalc >= 65 ? 'Building momentum' : boardScoreCalc >= 40 ? 'Needs consistency' : 'Start your run';
  const dailyMantras = [
    'Consistency compounds.',
    'Understand first. Memorise last.',
    'One focused hour beats three distracted ones.',
    'Small wins become board confidence.',
    'Revise what you forget, not what you already know.'
  ];
  const dailyMantra = dailyMantras[new Date(`${todayDate}T00:00:00`).getDay() % dailyMantras.length];
  const markPlan = (x: typeof plan[number]) => {
    const k = `${x.date}|${x.subject}|${x.chapter}`;
    setCompleted(p => p.includes(k) ? p.filter(a => a !== k) : [...p, k]);
    const c = all.find(a => a.name === x.chapter); if (c) setStatus(s => ({ ...s, [c.id]: 'done' }));
    if (!activity.includes(todayDate)) setActivity(a => [...a, todayDate]);
    setGoalDone(v => Math.min(dailyMinutes, v + 25));
  };

  const timerLabel = `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`;
  const resetTimer = () => { setTimerRunning(false); setTimerSeconds(timerMode === 'focus' ? 25 * 60 : 5 * 60); };
  const switchTimerMode = (mode: 'focus' | 'break') => { setTimerMode(mode); setTimerRunning(false); setTimerSeconds(mode === 'focus' ? 25 * 60 : 5 * 60); };
  const startFocusMode = () => { setFocusMode(true); setTimerOpen(false); setTimerMode('focus'); setTimerSeconds(v => v > 0 && v < 25*60 ? v : 25*60); setTimerRunning(true); setCommandPulse(true); window.setTimeout(() => setCommandPulse(false), 900); };

  const resourceCards = (s: Subject, c: Chapter) => (['NCERT','Syllabus','Sample Papers','PYQs','Question Bank','Marking Scheme','Model Answers','E-Resources'] as ResourceType[]).map(type => {
    const doc = getResource(s.name, c.name, type);
    const descriptions: Record<ResourceType,string> = {
      NCERT: 'Read the prescribed textbook and examples.', Syllabus: 'Check the official Class X curriculum and scope.',
      'Sample Papers': 'Practise the latest official paper pattern.', PYQs: 'Train with real board examination papers.',
      'Question Bank': 'Build extra practice from official question-bank material.', 'Marking Scheme': 'Learn what earns marks in answers.',
      'Model Answers': 'Study official answer presentation and expectations.', 'E-Resources': 'Explore official digital learning resources.'
    };
    return <div className="resource premiumResource" key={type}>
      <div className="resourceIcon"><FileText size={17}/></div><div className="resourceCopy"><b>{type}</b><p>{descriptions[type]}</p></div>
      {doc ? <button type="button" className="resourceButton" onClick={() => setViewer(doc)}>Open inside site <ChevronRight size={14}/></button> : <button type="button" className="resourceButton" onClick={() => notify('Resource unavailable')}>Unavailable</button>}
    </div>;
  });

  const exportBackup = () => {
    const data = { version: 10, name, className, status, notes, exams, planned, completed, dailyMinutes, activity, goalDone, mistakes, studyMinutes, streakFreeze, rooms, focusSessions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='archit-creations-backup.json'; a.click(); URL.revokeObjectURL(url); notify('Backup exported');
  };
  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try { const d=JSON.parse(String(r.result||'{}')); if(d.status) setStatus(d.status); if(d.notes) setNotes(d.notes); if(d.exams) setExams(d.exams); if(d.planned) setPlanned(d.planned); if(d.completed) setCompleted(d.completed); if(d.dailyMinutes) setDailyMinutes(d.dailyMinutes); if(d.activity) setActivity(d.activity); if(typeof d.goalDone==='number') setGoalDone(d.goalDone); if(d.mistakes) setMistakes(d.mistakes); if(d.studyMinutes) setStudyMinutes(d.studyMinutes); if(typeof d.streakFreeze==='number') setStreakFreeze(d.streakFreeze); if(d.rooms) setRooms(d.rooms); if(typeof d.focusSessions==='number') setFocusSessions(d.focusSessions); if(d.name){setName(d.name);localStorage.setItem('ac_name',d.name)}; notify('Backup restored successfully'); } catch { notify('That backup file is not valid'); } }; r.readAsText(f);
  };
  const quickAction = (p:string) => {
    if (navTransition || p === page) { setPaletteOpen(false); return; }
    const label = p === 'ai' ? 'Auren Intelligence' : String(nav.find(x => x[0] === p)?.[1] || 'Dashboard');
    setPaletteOpen(false);
    setNavTransitionLabel(label);
    setNavTransition(true);
    window.setTimeout(() => go(p), 360);
    window.setTimeout(() => setNavTransition(false), 900);
  };
  const addMistake = () => {
    if (!chapter) return notify('Open a chapter first');
    const question = window.prompt('What question did you get wrong?');
    if (!question?.trim()) return;
    const answer = window.prompt('What is the correct idea/answer?') || '';
    setMistakes(m => [{id:crypto.randomUUID(),subject:selected?.name||'General',chapter:chapter.name,question:question.trim(),answer:answer.trim(),date:new Date().toISOString(),mastered:false},...m]);
    notify('Added to your Mistake Book');
  };
  const toggleMistake = (id:string) => setMistakes(m=>m.map(x=>x.id===id?{...x,mastered:!x.mastered}:x));
  const deleteMistake = (id:string) => setMistakes(m=>m.filter(x=>x.id!==id));
  const generateQuiz = () => {
    const s=subjects.find(x=>x.name===quizSubject); const c=s?.chapters.find(x=>x.name===quizChapter) || s?.chapters[0];
    if(!s||!c) return notify('Choose a subject and chapter');
    const bank=[
      {q:`Which statement best describes ${c.name}?`,answer:'The option that correctly explains the central concept and its application.',options:['A memorised definition only','The option that correctly explains the central concept and its application.','An unrelated fact','A trick with no concept']},
      {q:`For ${c.name}, which approach is most useful for board preparation?`,answer:'Understand the concept, practise NCERT, then solve competency and board-style questions.',options:['Only read once','Understand the concept, practise NCERT, then solve competency and board-style questions.','Skip examples','Memorise without practice']},
      {q:`What should you do after learning ${c.name}?`,answer:'Recall without notes and practise questions.',options:['Immediately forget it','Recall without notes and practise questions.','Only watch another video','Skip revision']},
      {q:`Which habit improves retention of ${c.name}?`,answer:'Spaced revision and active recall.',options:['Spaced revision and active recall.','Studying once for many hours','Only highlighting','Avoiding questions']},
      {q:`What is a strong final check for ${c.name}?`,answer:'Solve mixed board-style questions under time pressure.',options:['Read the title','Solve mixed board-style questions under time pressure.','Copy notes','Skip mistakes']},
    ];
    const arr=Array.from({length:Math.min(quizCount,bank.length)},(_,i)=>bank[i]);
    setQuizQuestions(arr);setQuizIndex(0);setQuizAnswer('');setQuizScore(0);setQuizStarted(true);
  };
  const answerQuiz = () => {
    if(!quizAnswer) return notify('Choose an answer');
    const q=quizQuestions[quizIndex]; const correct=quizAnswer===q.answer; if(correct)setQuizScore(v=>v+1);
    if(quizIndex+1<quizQuestions.length){setQuizIndex(v=>v+1);setQuizAnswer('');}else{setQuizStarted(false);setQuizScore(v=>{const final=Math.round(((v+(correct?1:0))/quizQuestions.length)*100);notify(`Quiz finished: ${final}%`);return final;});}
  };
  const createRoom = () => { const code=Math.random().toString(36).slice(2,7).toUpperCase(); const room={code,name:roomName.trim()||'Board Sprint',members:1,goal:'Class 10 focus session'}; setRooms(r=>[room,...r]);setRoomCode(code);notify(`Study room ${code} created`); };
  const joinRoom = () => { if(!roomCode.trim()) return notify('Enter a room code'); const code=roomCode.trim().toUpperCase(); const found=rooms.find(r=>r.code===code); if(found){setRooms(r=>r.map(x=>x.code===code?{...x,members:x.members+1}:x));notify(`Joined ${code}`);}else notify('Room not found on this device. Cloud rooms can be enabled with Supabase.'); };
  const cloudSync = async () => {
    setCloudStatus('syncing');
    try { const res=await fetch('/api/cloud',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'sync',profile:{name,className,status,notes,exams,planned,completed,activity,goalDone,dailyMinutes,mistakes,studyMinutes,focusSessions}})}); if(!res.ok) throw new Error('offline'); const data=await res.json(); if(data.id){setCloudUserId(data.id);localStorage.setItem('ac_cloud_user',data.id);} setCloudStatus('online');setLastCloudSync(new Date().toISOString());notify('Cloud sync complete'); } catch { setCloudStatus('offline');notify('Cloud is not configured yet — your local backup is safe.'); }
  };
  const copyRoom = async () => { if(!roomCode)return; try{await navigator.clipboard.writeText(roomCode);notify('Room code copied')}catch{notify(roomCode)} };

  const News = () => <section className="newsSection">
    <div className="head"><div><small>OFFICIAL CBSE NEWS</small><h2>Important Class 10 updates</h2></div><a className="newsAll" href="https://www.cbse.gov.in/cbsenew/cbse.html" target="_blank" rel="noreferrer">CBSE official <ExternalLink size={13}/></a></div>
    <div className="newsGrid">{cbseNews.map((item, i) => <a className="newsCard" href={item.url} target="_blank" rel="noreferrer" key={item.title} style={{ ['--delay' as string]: `${i * 80}ms` }}><div className="newsTop"><span>{item.tag}</span><time>{item.date}</time></div><h3>{item.title}</h3><p>{item.text}</p><div className="newsRead">Read official update <ChevronRight size={14}/></div></a>)}</div>
  </section>;

  const BrandHome = () => <>
    <section className="brandExperience">
      <div className="brandFilm" aria-hidden="true"></div>
      <div className="brandFilmGlow brandFilmGlowA" aria-hidden="true"></div>
      <div className="brandFilmGlow brandFilmGlowB" aria-hidden="true"></div>
      <div className="brandFilmGrid" aria-hidden="true"></div>

      <header className="brandExpTop">
        <div className="brandExpSerial"><span></span> AUREN / 01</div>
        <div className="brandExpMeta">CLASS {className} <i>·</i> {todayDate}</div>
      </header>

      <div className="brandExpHero">
        <div className="brandExpHeroCopy">
          <div className="brandExpEyebrow"><span>AUREN</span><b>EST. 2026</b></div>
          <h1>Study<br/><em>with intent.</em></h1>
          <p>Not another dashboard. A focused study experience built around one idea: understand deeply, practise deliberately, and arrive at your boards ready.</p>
          <div className="brandExpActions">
            <button type="button" className="brandExpMain" onClick={()=>go('dashboard')}>Enter AUREN <ArrowUpRight size={18}/></button>
            <button type="button" className="brandExpLink" onClick={()=>setPaletteOpen(true)}><span>⌘</span> Explore everything</button>
          </div>
        </div>

        <div className="brandExpEmblem" aria-label="AUREN emblem">
          <div className="emblemRing emblemRingOne"></div>
          <div className="emblemRing emblemRingTwo"></div>
          <div className="emblemTick tickOne"></div><div className="emblemTick tickTwo"></div>
          <div className="emblemDisc">
            <div className="emblemA">A<span>✦</span></div>
            <strong>AUREN</strong>
            <div className="emblemRule"></div><span className="emblemEdition">BOARD JOURNEY / 2026</span>
          </div>
          <div className="emblemOrbitLabel labelTop">01 / FOCUS</div>
          <div className="emblemOrbitLabel labelBottom">04 / MASTER</div>
        </div>
      </div>

      <div className="brandExpStatement">
        <div className="statementIndex">01</div>
        <div className="statementText">The goal isn't to <i>study more.</i><br/><strong>It's to study better.</strong></div>
        <div className="statementRule"></div>
      </div>

      <section className="brandExpRail">
        <div className="railIntro"><small>THE METHOD</small><h2>Four moves.<br/><i>One standard.</i></h2><p>Every chapter moves through the same disciplined rhythm — but each subject gets the practice it actually needs.</p></div>
        <div className="methodCards">
          <article className="methodCard methodCardDark"><span>01</span><div className="methodGlyph">◒</div><small>FIRST</small><h3>Understand</h3><p>Build the idea before you try to remember it.</p><b>CONCEPT → CLARITY</b></article>
          <article className="methodCard"><span>02</span><div className="methodGlyph">⌁</div><small>SECOND</small><h3>Revise</h3><p>Turn the important points into quick, reliable recall.</p><b>RECALL → RETAIN</b></article>
          <article className="methodCard"><span>03</span><div className="methodGlyph">＋</div><small>THIRD</small><h3>Practise</h3><p>NCERT, examples, PYQs and board-style questions.</p><b>PRACTISE → PRECISION</b></article>
          <article className="methodCard methodCardGold"><span>04</span><div className="methodGlyph">✦</div><small>FINAL</small><h3>Master</h3><p>Finish every study step until the chapter is genuinely complete.</p><b>CONSISTENCY → CONFIDENCE</b></article>
        </div>
      </section>

      <section className="brandExpProgress">
        <div className="progressCopy"><small>YOUR BOARD JOURNEY</small><h2>Already in motion.</h2><p>Your command centre keeps the journey measurable without making it feel like a spreadsheet.</p><button type="button" onClick={()=>go('dashboard')}>See my progress <ChevronRight/></button></div>
        <div className="progressPanel">
          <div className="progressPanelTop"><span>READINESS</span><b>{prog}%</b></div>
          <div className="progressTrack"><i style={{width:`${prog}%`}}></i></div>
          <div className="progressNumbers"><div><strong>{done}</strong><span>chapters mastered</span></div><div><strong>{xp}</strong><span>XP earned</span></div><div><strong>{exams.length}</strong><span>exams planned</span></div></div>
        </div>
      </section>

      <section className="brandExpFinal">
        <div className="finalIndex">02 / THE NEXT MOVE</div>
        <h2>Make the next<br/><em>session count.</em></h2>
        <p>Open your command centre and let the plan tell you what matters next.</p>
        <button type="button" onClick={()=>go('dashboard')}>Enter AUREN <ArrowUpRight size={18}/></button>
        <div className="finalMark"><span>A</span><i>✦</i></div>
      </section>

      <footer className="brandExpFooter"><span>DESIGNED WITH ❤️ BY ARCHIT</span><span>AUREN / BOARD JOURNEY</span><span>CLASS {className}</span></footer>
    </section>
  </>;



  const Dashboard = () => <>
    <header className="top"><div><small>YOUR BOARD JOURNEY · AUREN BRIEFING</small><h1>Good evening, {name || 'Student'} 👋</h1><p>Your next best move, progress and exam pressure — without the noise.</p></div><div className="topActions"><button type="button" className="briefPill" onClick={startFocusMode}><Zap size={15}/> Focus mode <kbd>F</kbd></button><button type="button" onClick={() => setDark(!dark)}>{dark ? <Star/> : <Moon/>}</button></div></header>
    <section className="hero"><div><span>CLASS {className} STUDY COMMAND CENTRE</span><h2>Study smarter.<br/><i>Finish stronger.</i></h2><p>Understand the concept, revise the important points, practise NCERT and finish with board-style questions.</p><div className="heroActions"><button type="button" className="primary" onClick={() => go('datesheet')}>Build my study plan <ChevronRight/></button><button type="button" className="heroGhost" onClick={startFocusMode}><Zap size={16}/> Enter focus mode</button></div></div><div className="ring"><b>{prog}%</b><small>complete</small><span>{readinessLabel}</span></div></section>
    {!briefDismissed && <section className={`dailyBrief ${commandPulse ? 'pulse' : ''}`}><div className="briefGlow"></div><div className="briefLead"><small>01 · TODAY'S AUREN BRIEF</small><h2>{priorityPreview ? 'Your next move is clear.' : 'Your command centre is ready.'}</h2><p>{priorityPreview ? <>Start with <b>{priorityPreview.chapter}</b>{' '}<span>·</span>{' '}{priorityPreview.subject}. Avoid opening five chapters at once.</> : 'Add an exam and select a few chapters. Auren will turn them into a focused daily route.'}</p><div className="briefQuote">“{dailyMantra}”</div></div><div className="briefMetrics"><div><span>READINESS</span><b>{boardScoreCalc}</b><small>/100 · {readinessLabel}</small></div><div><span>STREAK</span><b>{streak}</b><small>active days</small></div><div><span>FOCUS</span><b>{focusSessions}</b><small>sessions logged</small></div></div><div className="briefActions"><button type="button" className="primary" onClick={() => priorityPreview ? go('study') : go('datesheet')}>{priorityPreview ? 'Open my priority' : 'Build my route'} <ChevronRight/></button><button type="button" className="briefClose" onClick={() => setBriefDismissed(true)} aria-label="Dismiss brief"><X size={15}/></button></div></section>}
    <div className="stats"><div><Flame/><b>{Math.max(1, Math.floor(done / 3) + 1)}</b><small>day streak</small></div><div><Zap/><b>{xp}</b><small>XP earned</small></div><div><BookOpen/><b>{done}</b><small>chapters done</small></div><div><Trophy/><b>Level {Math.floor(xp / 500) + 1}</b><small>current level</small></div></div>
    <section className="commandGrid">
      <div className="commandCard goalCard"><div className="commandIcon"><Target/></div><div className="commandMain"><div className="commandTop"><div><small>TODAY'S STUDY GOAL</small><h3>{goalDone}/{dailyMinutes} minutes</h3></div><b>{goalPercent}%</b></div><div className="goalBar"><i style={{width:`${goalPercent}%`}}/></div><div className="goalControls"><button type="button" onClick={()=>setDailyMinutes(v=>Math.max(30,v-15))}>−15</button><button type="button" onClick={()=>setDailyMinutes(v=>v+15)}>+15</button><button type="button" className="miniPrimary" onClick={()=>setTimerOpen(true)}><Clock3/> Focus</button></div></div></div>
      <div className="commandCard examCard"><div className="commandIcon"><CalendarDays/></div><div><small>NEXT EXAM</small>{nextExam ? <><h3>{nextExam.subject}</h3><p>{pretty(nextExam.date)} · <b>{days(todayDate,nextExam.date)} days left</b></p></> : <><h3>No exam added</h3><p>Add your date sheet to activate countdowns.</p></>}<button type="button" className="textAction" onClick={()=>go('datesheet')}>Manage date sheet <ChevronRight/></button></div></div>
    </section>
    <section className="featureStrip"><button type="button" onClick={()=>setPaletteOpen(true)}><Search/><span><b>Quick command</b><small>Press Ctrl + K anytime</small></span><kbd>⌘K</kbd></button><button type="button" onClick={()=>go('revision')}><Brain/><span><b>Revision mode</b><small>4-step active recall workflow</small></span><ChevronRight/></button><button type="button" onClick={()=>go('analytics')}><BarChart3/><span><b>Performance</b><small>{activityDays} active study days</small></span><ChevronRight/></button></section>
    <div className="quickTools"><button type="button" onClick={() => setTimerOpen(true)}><Clock3/><span><b>Focus Timer</b><small>25-minute study session</small></span><ChevronRight/></button><button type="button" onClick={() => go('study')}><Zap/><span><b>What should I study?</b><small>Use your automatic plan</small></span><ChevronRight/></button></div>
    <News/>
    <div className="head"><div><small>TODAY'S PLAN</small><h2>{todayPlan.length ? 'Study these today' : 'No plan yet'}</h2></div><button type="button" onClick={() => go('datesheet')}>Date sheet <ChevronRight/></button></div>
    {todayPlan.length ? <div className="list">{todayPlan.map(x => <div className="row" key={`${x.date}-${x.chapter}`}><div><b>{x.subject} · {x.chapter}</b><small>{x.task}</small></div><button type="button" onClick={() => markPlan(x)}>{completed.includes(`${x.date}|${x.subject}|${x.chapter}`) ? <CheckCircle2/> : <ChevronRight/>}</button></div>)}</div> : <div className="empty"><CalendarDays/><h3>Build your date sheet to start</h3><p>Select chapters and the tracker will distribute them across the days before each exam.</p><button type="button" className="primary" onClick={() => go('datesheet')}>Open planner</button></div>}
    <div className="head"><div><small>SUBJECTS</small><h2>Resources for every subject</h2></div><button type="button" onClick={() => go('syllabus')}>View all <ChevronRight/></button></div>
    <div className="grid four">{subjects.map(s => <button type="button" className="card" key={s.id} onClick={() => { setSelected(s); setPage('subject'); }}><strong>{s.icon}</strong><div><h3>{s.name}</h3><p>{s.chapters.length} chapters · PDFs · notes · practice</p></div><ChevronRight/></button>)}</div>
    <div className="head"><div><small>ACHIEVEMENTS</small><h2>Unlock your board badges</h2></div><button type="button" onClick={()=>go('analytics')}>View performance <ChevronRight/></button></div>
    <div className="achievementGrid">{achievements.map(a=><div className={a.on?'achievement unlocked':'achievement'} key={a.title}><span>{a.icon}</span><div><b>{a.title}</b><small>{a.text}</small></div><Award size={16}/></div>)}</div>
    <div className="dashboardProStrip"><div><small>BOARD READINESS</small><b>{boardScoreCalc}/100</b><span>Completion · consistency · focus · mistake mastery</span></div><div className="miniReadiness"><i style={{width:`${boardScoreCalc}%`}}/></div><button type="button" className="secondaryButton" onClick={()=>go('rewards')}>Open readiness <ChevronRight size={14}/></button></div>
  </>;

  const Syllabus = () => <><div className="pageHead"><small>CLASS {className} SYLLABUS</small><h1>Every subject. Every chapter.</h1><p>Search, open a chapter and use the integrated resource viewer.</p></div><input className="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chapter or subject..."/>{subjects.map(s => { const filtered = s.chapters.filter(c => `${s.name} ${c.name}`.toLowerCase().includes(search.toLowerCase())); if (!filtered.length) return null; return <section className="subject" key={s.id}><div className="subjectTitle"><b>{s.icon}</b><div><h2>{s.name}</h2><small>{filtered.length} matching chapters</small></div></div>{filtered.map(c => <button type="button" className="chapterRow" key={c.id} onClick={() => openChapter(s, c)}><span className={`dot ${status[c.id] || 'todo'}`}></span><span>{c.name}</span><small>{status[c.id] === 'done' ? 'Completed' : status[c.id] === 'progress' ? 'In progress' : 'Not started'}</small><ChevronRight size={15}/></button>)}</section>; })}</>;

  const SubjectPage = () => {
    if (!selected) return <Syllabus/>;
    return <><div className="pageHead"><small>{selected.name.toUpperCase()} RESOURCES</small><h1>{selected.icon} {selected.name}</h1><p>Integrated textbook, practice and revision resources for every chapter.</p></div>{chapter ? <><button type="button" className="back" onClick={() => setChapter(null)}>← Back to {selected.name}</button><div className="chapterHero"><div><small>CHAPTER WORKSPACE</small><h1>{chapter.name}</h1><p>Work through the chapter checklist below. When every step is complete, the chapter is automatically marked complete.</p></div><span className={`status ${status[chapter.id] || 'todo'}`}>{status[chapter.id] === 'done' ? '✓ Completed' : status[chapter.id] === 'progress' ? '● In Progress' : '○ Not Started'}</span></div><div className="chapterWorkflow panel"><div className="workflowHead"><div><small>CHAPTER PROGRESS</small><h2>Finish the chapter in four passes</h2></div><b>{(chapterSteps[chapter.id] || []).length}/{stepsFor(selected.name).length}</b></div><div className="workflowSteps">{stepsFor(selected.name).map((step,i)=>{const checked=(chapterSteps[chapter.id]||[]).includes(step);return <label className={`workflowStep ${checked?'checked':''}`} key={step}><input type="checkbox" checked={checked} onChange={()=>toggleChapterStep(chapter,selected,step)}/><span className="workflowNumber">0{i+1}</span><span><b>{step}</b><small>{i===0?'Build understanding before memorising.':i===1?'Compress the chapter into high-value recall points.':i===2?'Use the prescribed textbook actively, not passively.':'Finish with exam-style answers under time pressure.'}</small></span><span className="workflowTick">{checked?<CheckCircle2 size={18}/>:<CircleDot size={18}/>}</span></label>})}</div></div><div className="resources">{resourceCards(selected, chapter)}<div className="resource"><b>Marking Scheme</b><p>Check how CBSE expects answers to be evaluated.</p><button type="button" className="resourceButton" onClick={()=>setViewer({title:`${selected.name} · CBSE Marking Scheme`,url:cbseMarkingScheme,description:'Official CBSE marking-scheme hub.'})}><FileText size={14}/> Open inside site <ChevronRight size={14}/></button></div><div className="resource"><b>Question Bank</b><p>Official CBSE question-bank hub for extra practice.</p><button type="button" className="resourceButton" onClick={()=>setViewer({title:`${selected.name} · CBSE Question Bank`,url:cbseQuestionBank,description:'Official CBSE question-bank hub.'})}><Library size={14}/> Open inside site <ChevronRight size={14}/></button></div></div><div className="notes"><h2>Your chapter notes</h2><textarea value={notes[chapter.id] || ''} onChange={e => setNotes(n => ({ ...n, [chapter.id]: e.target.value }))} placeholder="Write your revision notes..."/></div></> : <div className="grid">{selected.chapters.map(c => <button type="button" className="card chapterCard" key={c.id} onClick={() => setChapter(c)}><div><small className={`dot ${status[c.id] || 'todo'}`}></small><h3>{c.name}</h3><p>{c.note}</p><small>📖 PDF · 📝 Notes · ❓ Questions</small></div><ChevronRight/></button>)}</div>}</>;
  };

  const DateSheet = () => {
    const activeExam = exams.find(e => e.id === plannerExamId) || exams[0] || null;
    const activeSubject = activeExam ? subjects.find(s => s.name.toLowerCase() === activeExam.subject.toLowerCase()) || null : null;
    const activeChapters = activeSubject?.chapters || [];
    const activeSelected = activeChapters.filter(c => planned.includes(c.id)).length;

    return <>
      <div className="pageHead"><small>DATE SHEET → SMART TRACKER</small><h1>Build your study tracker</h1><p>Add each exam, choose its subject, then select only the chapters you want to prepare for that exam.</p></div>

      <section className="plannerWizard">
        <div className="wizardSteps">
          <div className="wizardStep active"><span>01</span><div><b>Add exams</b><small>Subject + date</small></div></div>
          <div className="wizardLine" />
          <div className={`wizardStep ${activeExam ? 'active' : ''}`}><span>02</span><div><b>Choose exam</b><small>Plan one subject</small></div></div>
          <div className="wizardLine" />
          <div className={`wizardStep ${activeSubject ? 'active' : ''}`}><span>03</span><div><b>Select chapters</b><small>Build your workload</small></div></div>
        </div>
        <div className="wizardBody">
          <div className="builderIcon"><CalendarDays/></div>
          <div className="builderMain"><small>STEP 01 · YOUR DATE SHEET</small><h2>Add an exam</h2><p>Enter your subject first, then its exam date. You can edit dates later.</p>
            <div className="builderForm"><label><span>Subject</span><select value={draftSubject} onChange={e => setDraftSubject(e.target.value)}>{subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></label><label><span>Exam date</span><input type="date" value={draftDate} onChange={e => setDraftDate(e.target.value)}/></label><button type="button" className="primary" onClick={addManualExam}><Plus size={16}/> Add exam</button></div>
          </div>
        </div>
      </section>

      <div className="upload secondaryUpload"><Upload/><div><h2>Optional typed import</h2><p>Already have dates in CSV/TXT? Import them here. No image upload is required.</p></div><label className="secondaryButton">Choose CSV/TXT<input type="file" accept=".csv,.txt" onChange={upload}/></label></div>

      <section className="trackerSection">
        <div className="head"><div><small>STEP 02 · EXAM SELECTOR</small><h2>Choose which exam to plan</h2></div><span className="badge">{exams.length} exams</span></div>
        {exams.length ? <div className="examSelectorGrid">{exams.map(e => <button type="button" key={e.id} className={`examSelector ${activeExam?.id === e.id ? 'selected' : ''}`} onClick={() => { setPlannerExamId(e.id); window.requestAnimationFrame(() => document.getElementById('chapter-planner')?.scrollIntoView({behavior:'smooth', block:'start'})); }}><span className="examSelectorIcon"><CalendarDays size={18}/></span><span className="examSelectorCopy"><small>{pretty(e.date)} · {days(todayDate,e.date)} days left</small><b>{e.subject}</b><em>{subjects.find(s=>s.name.toLowerCase()===e.subject.toLowerCase())?.chapters.length || 0} chapters available</em></span><ChevronRight size={17}/></button>)}</div> : <div className="empty"><CalendarDays/><h3>Start with your first exam</h3><p>Add a subject and date above. The chapter selector will appear only after an exam is added.</p></div>}
      </section>

      <section className="trackerSection chapterPlanner" id="chapter-planner">
        <div className="head"><div><small>STEP 03 · CHAPTER PLANNER</small><h2>{activeSubject ? `${activeSubject.name} chapters` : 'Select an exam first'}</h2><p>{activeExam ? `Planning for ${activeExam.subject} · ${pretty(activeExam.date)}` : 'Pick an exam above and we will show only that subject’s chapters.'}</p></div>{activeSubject && <span className="badge">{activeSelected}/{activeChapters.length} selected</span>}</div>
        {activeExam && activeSubject ? <>
          <div className="chapterPlannerBar"><div><span className="plannerSubjectIcon">{activeSubject.icon}</span><div><b>{activeSubject.name}</b><small>{days(todayDate,activeExam.date)} days until exam</small></div></div><span>Choose the chapters you actually need to prepare.</span></div>
          <div className="chapterPickGrid">{activeChapters.map((c,i) => <label key={c.id} className={`chapterPick ${planned.includes(c.id) ? 'chosen' : ''}`}><input type="checkbox" checked={planned.includes(c.id)} onChange={e => toggleChapter(c.id,e.target.checked)}/><span className="chapterPickNumber">{String(i+1).padStart(2,'0')}</span><span className="chapterPickText"><b>{c.name}</b><small>{c.note}</small></span><span className="chapterPickCheck">{planned.includes(c.id) ? <CheckCircle2 size={18}/> : <span/>}</span></label>)}</div>
          <div className="plannerFooter"><span><b>{activeSelected}</b> chapters selected for {activeSubject.name}</span><button type="button" className="primary" disabled={!activeSelected} onClick={() => go('study')}>Continue to What to Study <ChevronRight/></button></div>
        </> : <div className="empty"><BookOpen/><h3>Your subject chapters will appear here</h3><p>Select an exam above. Auren will keep every other subject out of this view so your tracker stays clean.</p></div>}
      </section>

      <section className="trackerSection" id="automatic-tracker">
        <div className="head"><div><small>STEP 04 · AUTOMATIC TRACKER</small><h2>Your day-by-day plan</h2><p>Only selected, unfinished chapters are scheduled before their matching exam.</p></div><span className="badge">{plan.length} tasks</span></div>
        <div className="list">{plan.length ? plan.map(x => <div className="row" key={`${x.date}-${x.subject}-${x.chapter}`}><div><b>{x.date === todayDate ? 'TODAY' : pretty(x.date)} · {x.subject}</b><small>{x.chapter} — {x.task}</small></div><button type="button" onClick={() => markPlan(x)}>{completed.includes(`${x.date}|${x.subject}|${x.chapter}`) ? <CheckCircle2/> : <ChevronRight/>}</button></div>) : <div className="empty"><Zap/><h3>Your tracker is waiting for your selections</h3><p>Add an exam, choose that exam above, select its chapters, and your daily schedule will be generated here.</p></div>}</div>
      </section>
    </>;
  };

  const Study = () => {
    const fallback = subjects.flatMap(s => s.chapters.filter(c => planned.includes(c.id) && !chapterComplete(c)).map(c => ({ subject:s.name, chapter:c.name, task:'Complete the next unfinished chapter step', date:todayDate })));
    const priority = next || fallback[0];
    const prioritySubject = priority ? subjects.find(s => s.name === priority.subject) : null;
    const priorityChapter = prioritySubject?.chapters.find(c => c.name === priority?.chapter);
    const doneSteps = priorityChapter ? (chapterSteps[priorityChapter.id] || []).length : 0;
    return <><div className="pageHead"><small>SMART STUDY ENGINE</small><h1>What should I study?</h1><p>One clear next action, based on your exams, selected chapters and unfinished chapter steps.</p></div>{priority ? <><div className="studyCommand"><div className="studyPriority"><span>YOUR NEXT PRIORITY</span><h2>{priority.chapter}</h2><p>{priority.subject} · {priority.task} · {priority.date === todayDate ? 'Today' : pretty(priority.date)}</p><div className="studyMeta"><b>{doneSteps}/{prioritySubject ? stepsFor(prioritySubject.name).length : 4} steps complete</b><span>{prioritySubject ? stepsFor(prioritySubject.name).filter(x => !(priorityChapter && (chapterSteps[priorityChapter.id]||[]).includes(x)))[0] || 'Chapter complete' : ''}</span></div><button type="button" className="primary" onClick={() => { if(prioritySubject && priorityChapter) openChapter(prioritySubject,priorityChapter); }}>Open chapter workspace <ChevronRight/></button></div><div className="studySide"><Zap/><small>BOARD ROUTINE</small><b>Understand → revise → practise → answer</b></div></div><div className="studyFlow">{prioritySubject && stepsFor(prioritySubject.name).map((step,i)=>{const checked=priorityChapter ? (chapterSteps[priorityChapter.id]||[]).includes(step):false;return <div className={checked?'flowItem checked':'flowItem'} key={step}><span>0{i+1}</span><div><b>{step}</b><small>{checked?'Completed':'Next step when you open the chapter workspace'}</small></div>{checked?<CheckCircle2/>:<CircleDot/>}</div>})}</div></> : <div className="empty"><Zap/><h2>Your smart plan is waiting</h2><p>Add an exam, select chapters, then continue here. Auren will turn those selections into a daily priority.</p><button type="button" className="primary" onClick={() => go('datesheet')}>Build my study plan <ChevronRight/></button></div>}<div className="panel smartRules"><h3>How the engine works</h3><p>It first uses your selected chapters and exam dates. Inside each chapter, the checklist tracks the actual work: understanding, revision, textbook practice and board-style questions.</p></div></>;
  };

  const QuizArena = () => {
    const q = quizQuestions[quizIndex];
    const quizSubjectObj = subjects.find(s=>s.name===quizSubject);
    return <>
      <div className="pageHead"><small>ACTIVE RECALL LAB</small><h1>Quiz Arena <span className="aiBadge">SMART PRACTICE</span></h1><p>Turn your chapter preparation into a focused board-style practice session.</p></div>
      {!quizStarted ? <>
        <div className="quizSetup panel">
          <div className="quizSetupHead"><div className="featureIcon indigo"><ClipboardCheck/></div><div><small className="quizEyebrow">QUIZ BUILDER</small><h2>Build your practice set</h2><p>Choose exactly what you want to revise, then start when you are ready.</p></div><span className="quizLivePill">● READY</span></div>
          <div className="formGrid fourCols"><label>Subject<select value={quizSubject} onChange={e=>{setQuizSubject(e.target.value);setQuizChapter('')}}>{subjects.map(s=><option key={s.id}>{s.name}</option>)}</select></label><label>Chapter<select value={quizChapter} onChange={e=>setQuizChapter(e.target.value)}><option value="">Choose chapter</option>{quizSubjectObj?.chapters.map(c=><option key={c.id}>{c.name}</option>)}</select></label><label>Level<select value={quizDifficulty} onChange={e=>setQuizDifficulty(e.target.value)}><option>Foundation</option><option>Board</option><option>Challenge</option></select></label><label>Questions<select value={quizCount} onChange={e=>setQuizCount(Number(e.target.value))}><option value={3}>3</option><option value={5}>5</option></select></label></div>
          <div className="quizActions"><button type="button" className="primary" onClick={generateQuiz}><Sparkles/> Generate quiz</button><button type="button" className="secondaryButton" onClick={()=>{setAiPrompt('Create a ' + quizCount + '-question ' + quizDifficulty + '-level Class 10 CBSE quiz for ' + quizSubject + (quizChapter ? ' — ' + quizChapter : '') + '. Give one question at a time with the answer hidden until I respond.');go('ai');}}><Bot size={15}/> Generate with Auren Intelligence</button></div>
        </div>
        <div className="quizFeatureGrid"><div className="panel quizFeature"><span className="quizFeatureNo">01</span><Brain/><div><b>Active recall</b><small>Try from memory before opening your notes.</small></div></div><div className="panel quizFeature"><span className="quizFeatureNo">02</span><Target/><div><b>Board focus</b><small>Keep practice aligned with Class 10 exam patterns.</small></div></div><div className="panel quizFeature"><span className="quizFeatureNo">03</span><TrendingUp/><div><b>Track mastery</b><small>Use your score to decide what needs another revision.</small></div></div></div>
      </> : <div className="quizLive">
        <div className="quizProgress"><div><small>QUESTION</small><strong>{quizIndex+1}<span>/ {quizQuestions.length}</span></strong></div><div className="quizProgressTrack"><i style={{width:`${((quizIndex+1)/Math.max(1,quizQuestions.length))*100}%`}}/></div><div className="quizScorePill">{quizScore} correct</div></div>
        <div className="panel quizQuestion"><div className="quizMeta"><span className="quizTopic">{quizSubject}</span><span>{quizDifficulty}</span><span>{quizChapter || 'Mixed chapter'}</span></div><div className="quizQuestionLabel">THINK FIRST · THEN ANSWER</div><h2>{q?.q}</h2><div className="optionGrid">{q?.options.map(o=><button type="button" key={o} className={quizAnswer===o?'selected':''} onClick={()=>setQuizAnswer(o)}>{o}</button>)}</div><button type="button" className="primary" onClick={answerQuiz}>{quizIndex+1===quizQuestions.length?'Finish quiz':'Next question'} <ChevronRight/></button></div>
      </div>}
      {quizScore>0 && !quizStarted && <div className="panel resultBanner"><div><small>LAST SCORE</small><strong>{quizScore}%</strong></div><p>Keep your score above 80% to mark this as a strong revision session.</p><button type="button" className="secondaryButton" onClick={()=>go('mistakes')}>Review mistakes</button></div>}
    </>;
  };

  const MistakeBook = () => <>
    <div className="pageHead"><small>ERROR → LEARNING</small><h1>Mistake Book</h1><p>Save questions you got wrong, revisit them and mark them mastered. This turns mistakes into a revision queue.</p></div>
    <div className="mistakeStats"><div className="panel"><AlertCircle/><b>{mistakes.length}</b><small>Total mistakes</small></div><div className="panel"><CircleCheckBig/><b>{mistakes.filter(m=>m.mastered).length}</b><small>Mastered</small></div><div className="panel"><Target/><b>{mistakeMastery}%</b><small>Mastery</small></div></div>
    <div className="panel mistakeAdd"><div><h3>Add a mistake</h3><p>Open a chapter and use the button there, or add one from a quiz review.</p></div><button type="button" className="primary" onClick={addMistake}><Plus/> Add mistake</button></div>
    {mistakes.length ? <div className="mistakeList">{mistakes.map(m=><article className={m.mastered?'mistakeItem mastered':'mistakeItem'} key={m.id}><div className="mistakeBadge">{m.mastered?'✓':'!'}</div><div className="mistakeBody"><div className="mistakeTop"><span>{m.subject} · {m.chapter}</span><time>{new Date(m.date).toLocaleDateString('en-IN')}</time></div><h3>{m.question}</h3>{m.answer&&<p><b>Correct idea:</b> {m.answer}</p>}<div className="mistakeActions"><button type="button" onClick={()=>toggleMistake(m.id)}>{m.mastered?'Mark for revision':'Mark mastered'}</button><button type="button" onClick={()=>deleteMistake(m.id)}><Trash2 size={14}/> Delete</button></div></div></article>)}</div> : <div className="empty"><AlertCircle/><h3>Your mistake book is empty</h3><p>That is a good thing. Add questions whenever you get something wrong so revision becomes targeted.</p></div>}
  </>;

  const Rewards = () => <>
    <div className="pageHead"><small>YOUR PROGRESS, REWARDED</small><h1>Rewards & achievements</h1><p>Every focused session, completed chapter and consistent day contributes to your board journey.</p></div>
    <div className="levelHero"><div className="levelOrb"><Medal/></div><div><small>LEVEL {level}</small><h2>{xp} XP</h2><p>{500-(xp%500)} XP until the next level</p><div className="xpBar"><i style={{width:`${(xp%500)/5}%`}}/></div></div><button type="button" className="primary" onClick={()=>setCertificateOpen(true)}><FileBadge/> Certificate</button></div>
    <div className="achievementGrid">{achievements.map(a=><div className={a.on?'achievement unlocked':'achievement'} key={a.title}><span>{a.icon}</span><div><b>{a.title}</b><small>{a.text}</small></div><Award size={16}/></div>)}</div>
    <div className="dashboardProStrip"><div><small>BOARD READINESS</small><b>{boardScoreCalc}/100</b><span>Completion · consistency · focus · mistake mastery</span></div><div className="miniReadiness"><i style={{width:`${boardScoreCalc}%`}}/></div><button type="button" className="secondaryButton" onClick={()=>go('rewards')}>Open readiness <ChevronRight size={14}/></button></div>
    <div className="rewardGrid"><div className="panel"><Flame/><h3>Streak Freeze</h3><p>Keep one recovery token ready if you miss a study day.</p><b>{streakFreeze} available</b><button type="button" className="secondaryButton" onClick={()=>setStreakFreeze(v=>v+1)}>Earn practice token</button></div><div className="panel"><Gauge/><h3>Board readiness</h3><strong className="readinessNumber">{boardScoreCalc}/100</strong><p>Built from completion, consistency, focus and mistake mastery.</p></div><div className="panel"><Trophy/><h3>Next milestone</h3><p>{done<10?'Complete 10 chapters':xp<1000?'Reach 1000 XP':focusSessions<10?'Finish 10 focus sessions':'Keep your streak alive.'}</p><button type="button" className="secondaryButton" onClick={()=>go('study')}>Work toward it</button></div></div>
  </>;

  const Heatmap = () => {
    const cells=Array.from({length:84},(_,i)=>{const d=new Date(`${todayDate}T00:00:00`);d.setDate(d.getDate()-(83-i));const key=d.toISOString().slice(0,10);return {key,minutes:(studyMinutes[key]||0)+(activity.includes(key)?10:0)};});
    return <><div className="pageHead"><small>CONSISTENCY ENGINE</small><h1>Study Heatmap</h1><p>Your last 12 weeks of activity at a glance.</p></div><div className="panel heatmapPanel"><div className="heatHeader"><div><h3>{activityDays} active days</h3><p>{totalStudyMinutes} tracked study minutes</p></div><span>Less <i className="heatLegend l0"/><i className="heatLegend l1"/><i className="heatLegend l2"/><i className="heatLegend l3"/> More</span></div><div className="heatGrid">{cells.map(c=><div title={`${c.key} · ${c.minutes} min`} className={`heatCell ${c.minutes===0?'l0':c.minutes<20?'l1':c.minutes<45?'l2':'l3'}`} key={c.key}/>)}</div></div><div className="heatInsight panel"><Lightbulb/><div><b>Consistency beats cramming.</b><p>Try to create a small study entry every day. Your planner and focus timer both contribute here.</p></div></div></>;
  };

  const ResourceLibrary = () => <>
    <div className="pageHead"><small>CURATED ACADEMIC LIBRARY</small><h1>Resources, without the clutter.</h1><p>Official NCERT and CBSE material organised around the way you actually study: learn, practise, check, revise.</p></div>
    <div className="libraryHero"><div><span>THE AUREN STANDARD</span><h2>Primary sources first.</h2><p>No random search-result maze. Start with prescribed textbooks, official curriculum, sample papers, previous papers, marking schemes and model answers.</p></div><ShieldCheck size={34}/></div>
    <div className="libraryFilters"><button type="button" className={resourceFilter==='All'?'active':''} onClick={()=>setResourceFilter('All')}>All resources</button>{['NCERT','CBSE','Practice','Revision'].map(x=><button type="button" className={resourceFilter===x?'active':''} onClick={()=>setResourceFilter(x)} key={x}>{x}</button>)}</div>
    <div className="resourceLibraryGrid">{subjects.map(s=>{const c=s.chapters[0];const docs=[['NCERT','NCERT','Prescribed textbook'],['CBSE','Syllabus','Curriculum'],['Practice','Sample Papers','Sample papers'],['Practice','Question Bank','Question bank'],['Revision','PYQs','Previous papers'],['Revision','Marking Scheme','Marking scheme'],['Revision','Model Answers','Model answers'],['CBSE','E-Resources','Digital resources']].filter(x=>resourceFilter==='All'||x[0]===resourceFilter);return <div className="panel librarySubject" key={s.id}><div className="librarySubjectHead"><span>{s.icon}</span><div><b>{s.name}</b><small>{s.chapters.length} chapters</small></div></div><p>Start with <b>{c.name}</b>, then use the official resource stack for practice and revision.</p>{docs.map(([filter,type,label])=><button type="button" key={type} className="libraryLink" onClick={()=>{const doc=getResource(s.name,c.name,type as ResourceType);if(doc)setViewer(doc)}}><span>{label}</span><ArrowUpRight size={15}/></button>)}</div>})}</div>
    <div className="panel officialStrip"><ShieldCheck/><div><b>Official-source first</b><p>Resources are anchored to NCERT and CBSE pages so the study workflow stays focused and trustworthy.</p></div><a href={cbseCurrent} target="_blank" rel="noreferrer">Open CBSE <ExternalLink size={14}/></a></div>
  </>;

  const StudyRooms = () => <>
    <div className="pageHead"><small>FOCUS TOGETHER</small><h1>Study Rooms</h1><p>Create a small study sprint and share a code. This version works locally; shared rooms become live when cloud sync is configured.</p></div>
    <div className="roomBuilder"><div className="panel"><Users/><h3>Create a room</h3><input className="search" value={roomName} onChange={e=>setRoomName(e.target.value)} placeholder="Room name, e.g. Sunday Science Sprint"/><button type="button" className="primary" onClick={createRoom}><Plus/> Create room</button></div><div className="panel"><UserRoundPlus/><h3>Join a room</h3><input className="search" value={roomCode} onChange={e=>setRoomCode(e.target.value.toUpperCase())} placeholder="5-character code" maxLength={5}/><button type="button" className="secondaryButton" onClick={joinRoom}>Join room</button></div></div>
    {roomCode&&<div className="panel roomActive"><div><small>ACTIVE ROOM</small><h2>{roomCode}</h2><p>Share this code with your study group.</p></div><button type="button" className="secondaryButton" onClick={copyRoom}><Copy/> Copy code</button></div>}
    <div className="head"><div><small>YOUR ROOMS</small><h2>Study sprints</h2></div><span className="badge">{rooms.length} rooms</span></div>
    {rooms.length?<div className="roomGrid">{rooms.map(r=><div className="panel roomCard" key={r.code}><div className="roomCode">{r.code}</div><h3>{r.name}</h3><p>{r.goal}</p><small>👥 {r.members} member{r.members===1?'':'s'}</small><button type="button" className="textAction" onClick={()=>{setRoomCode(r.code);notify('Room selected')}}>Open room <ChevronRight/></button></div>)}</div>:<div className="empty"><Users/><h3>No study rooms yet</h3><p>Create one for a focused revision sprint.</p></div>}
  </>;

  const submitFeedback = () => {
    if (!feedbackRating) return notify('Please choose a star rating first');
    if (!feedback.trim()) return notify('Write a little feedback first');
    const entry = { rating: feedbackRating, text: feedback.trim(), date: new Date().toISOString() };
    setFeedbackHistory(h => [entry, ...h].slice(0, 20));
    setFeedbackSent(true);
    setFeedback('');
    setFeedbackRating(0);
    notify('Feedback saved to your local feedback inbox');
  };

  const addLeaderboardFriend = () => {
    const clean = friendName.trim();
    const score = Math.max(0, Number(friendXp) || 0);
    if (!clean) return notify('Enter a student name');
    if (clean.toLowerCase() === name.trim().toLowerCase()) return notify('That is your own profile');
    setLeaderFriends(list => [...list.filter(x => x.name.toLowerCase() !== clean.toLowerCase()), { name: clean, xp: score }]);
    setFriendName('');
    setFriendXp('500');
    notify(`${clean} added to your local leaderboard`);
  };

  const Leaderboard = () => {
    const combined = [...leaderFriends, ...(name ? [{ name, xp }] : [])];
    const unique = Array.from(new Map(combined.map(x => [x.name.toLowerCase(), x])).values());
    const board = unique.sort((a,b) => b.xp - a.xp);
    const yourRank = Math.max(1, board.findIndex(x => x.name.toLowerCase() === name.toLowerCase()) + 1);
    return <><div className="pageHead"><small>COMMUNITY • LIVE ON THIS DEVICE</small><h1>AUREN LEADERBOARD</h1><p>Your rank changes automatically as your XP changes. Add classmates below to create your own study leaderboard.</p></div>
      <div className="leaderHero"><div><small>YOUR CURRENT RANK</small><strong>#{yourRank}</strong><span>{xp} XP · Level {Math.floor(xp / 500) + 1}</span></div><div><small>CHAPTERS DONE</small><strong>{done}</strong><span>{activityDays} active study days</span></div><div><small>STREAK</small><strong>{streak} 🔥</strong><span>Keep going</span></div></div>
      <div className="leaderboard">{board.map((x,i) => <div className={x.name.toLowerCase() === name.toLowerCase() ? 'you' : ''} key={x.name}><b>{i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}</b><span>{x.name}{x.name.toLowerCase() === name.toLowerCase() ? ' · YOU' : ''}</span><strong>{x.xp} XP</strong></div>)}</div>
      <div className="panel"><h3>➕ Add a study buddy</h3><p>Add classmates manually. Their score stays on this browser and can be updated whenever you want.</p><div className="builderForm"><input value={friendName} onChange={e=>setFriendName(e.target.value)} placeholder="Student name"/><input type="number" min="0" value={friendXp} onChange={e=>setFriendXp(e.target.value)} placeholder="XP"/><button type="button" className="primary" onClick={addLeaderboardFriend}>Add to leaderboard</button></div></div>
      <div className="panel"><Trophy/><h3>How XP works</h3><p>50 XP per completed chapter + 20 XP per completed planner task + focus-session progress.</p><small className="muted">For a truly shared leaderboard between different phones and students, connect a database such as Supabase/Firebase in the next deployment step.</small></div>
    </>;
  };

  const Analytics = () => <><div className="pageHead"><small>PERFORMANCE</small><h1>Your analytics</h1><p>See exactly where your preparation stands.</p></div><div className="analytics">{subjects.map(s => { const d = s.chapters.filter(c => status[c.id] === 'done').length; const percentage = Math.round(d / s.chapters.length * 100); return <div className="analytic" key={s.id}><div><b>{s.name}</b><span>{percentage}%</span></div><div className="bar"><i style={{ width: `${percentage}%` }}/></div><small>{d} of {s.chapters.length} chapters complete</small></div>; })}</div><div className="panel analyticsSummary"><h3>Overall completion</h3><div className="bigPercent">{prog}%</div><p>{done} of {all.length} chapters completed.</p></div></>;

  const Notes = () => <><div className="pageHead"><small>YOUR NOTES</small><h1>Notes</h1><p>Keep quick notes by subject. Chapter notes are saved separately inside each chapter workspace.</p></div><div className="grid">{subjects.map(s => <div className="panel" key={s.id}><h3>{s.icon} {s.name}</h3><textarea value={notes[s.id] || ''} onChange={e => setNotes(n => ({ ...n, [s.id]: e.target.value }))} placeholder={`Notes for ${s.name}...`}/></div>)}</div></>;
  const Revision = () => <><div className="pageHead"><small>REVISION MODE</small><h1>Four-step revision</h1><p>Use this flow for every selected chapter.</p></div><div className="grid four"><div className="panel"><b>01</b><h3>Understand</h3><p>Theory and examples.</p></div><div className="panel"><b>02</b><h3>Condense</h3><p>Short notes and mind map.</p></div><div className="panel"><b>03</b><h3>Practise</h3><p>NCERT, competency and questions.</p></div><div className="panel"><b>04</b><h3>Recall</h3><p>Revise without notes.</p></div></div><div className="panel"><h3>Ready for a focused session?</h3><button type="button" className="primary" onClick={() => setTimerOpen(true)}><Clock3/> Start focus timer</button></div></>;
  const askAI = async () => {
    const prompt = aiPrompt.trim();
    if (!prompt) return notify('Type a question for Auren Intelligence');
    setAiLoading(true);
    setAiResponse('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context: {
            name,
            className,
            progress: prog,
            nextExam: nextExam ? { subject: nextExam.subject, date: nextExam.date } : null,
            selectedChapters: planned.length,
            completedChapters: done,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI request failed');
      setAiResponse(data.text || 'No response received.');
    } catch (error) {
      setAiResponse(error instanceof Error ? error.message : 'Auren Intelligence is unavailable right now.');
    } finally {
      setAiLoading(false);
    }
  };

  const AIPage = () => <>
    <div className="pageHead"><small>INTELLIGENT STUDY LAB</small><h1>Meet Auren Intelligence <span className="aiBadge">BETA</span></h1><p>Your Class 10 study assistant for explanations, quizzes, revision and planning.</p></div>
    <div className="aiHero"><div className="aiOrb"><Bot/></div><div><small>AUREN INTELLIGENCE</small><h2>Ask. Learn. Practise.</h2><p>Ask for a simple explanation, a quiz, a revision plan or help understanding a Class 10 concept.</p></div><span className="freePill">FREE-TIER READY</span></div>
    <div className="aiQuick">{['Explain quadratic equations simply','Quiz me on Electricity','Make a 30-minute revision plan','Give me 5 competency-based questions'].map(q => <button type="button" key={q} onClick={() => setAiPrompt(q)}><Sparkles size={15}/>{q}</button>)}</div>
    <div className="aiComposer panel"><div className="aiInputRow"><textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Ask Auren Intelligence anything about your Class 10 studies..." onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') askAI(); }}/><button type="button" className="aiSend" onClick={askAI} disabled={aiLoading}>{aiLoading ? <span className="aiSpinner"/> : <Send size={18}/>}<span>{aiLoading ? 'Thinking…' : 'Ask AI'}</span></button></div><small className="muted">Ctrl + Enter to send · Never put your API key in page.tsx.</small></div>
    {aiResponse && <div className="panel aiResponse"><div className="aiResponseHead"><Bot size={18}/><b>Auren Intelligence</b><span>Study assistant</span></div><div className="aiText">{aiResponse}</div></div>}
    <div className="aiCards"><div className="panel"><Sparkles className="aiAccent"/><h3>Explain like Class 10</h3><p>Turn difficult topics into short, clear explanations with examples.</p></div><div className="panel"><Brain className="aiAccent"/><h3>Practice mode</h3><p>Generate questions and use them with your existing chapter resources.</p></div><div className="panel"><Target className="aiAccent"/><h3>Plan with context</h3><p>Auren Intelligence receives your study progress and next-exam context when you ask for a plan.</p></div></div>
  </>;

  const Feedback = () => <><div className="pageHead"><small>HELP US IMPROVE</small><h1>Feedback</h1><p>Rate your experience and tell Auren what would make this better.</p></div><div className="panel feedbackPanel"><h3>How would you rate AUREN?</h3><div className="stars" role="radiogroup" aria-label="Rating">{[1,2,3,4,5].map(i => <button type="button" key={i} className={i <= feedbackRating ? 'starButton active' : 'starButton'} onClick={() => setFeedbackRating(i)} aria-label={`${i} star${i > 1 ? 's' : ''}`}>★</button>)}</div><p className="ratingLabel">{feedbackRating ? `${feedbackRating}/5 · ${['','Needs work','Okay','Good','Great','Excellent'][feedbackRating]}` : 'Tap a star to rate'}</p><textarea value={feedback} onChange={e => { setFeedback(e.target.value); setFeedbackSent(false); }} placeholder="What should we improve?"/>{feedbackSent && <p className="success">✓ Saved. On this version, feedback is stored in your browser so it doesn't disappear.</p>}<button type="button" className="primary" onClick={submitFeedback}>Send feedback</button></div><div className="panel"><h3>Your feedback history</h3><p className="muted">This is your private local history. It will stay on this browser until a cloud feedback destination is connected.</p>{feedbackHistory.length ? <div className="feedbackHistory">{feedbackHistory.map((f,i)=><div className="feedbackItem" key={`${f.date}-${i}`}><div><span>{'★'.repeat(f.rating)}{'☆'.repeat(5-f.rating)}</span><small>{new Date(f.date).toLocaleString('en-IN')}</small></div><p>{f.text}</p></div>)}</div> : <div className="empty"><MessageSquare/><h3>No feedback submitted yet</h3><p>Your submitted ratings will appear here.</p></div>}</div></>;

  const SettingsPage = () => <><div className="pageHead"><small>AUREN CONTROL CENTRE</small><h1>Settings & backup</h1><p>Personalise your study engine, appearance and saved progress.</p></div><div className="settingsGrid"><div className="panel appearancePanel"><div className="settingIcon"><Moon/></div><h3>Appearance</h3><p>Choose the look of Auren. Your choice is saved automatically on this device.</p><div className="themeChoices"><button type="button" className={!dark ? 'themeChoice active' : 'themeChoice'} onClick={()=>setDark(false)}><span>☀</span><b>Light</b><small>Classic ivory</small></button><button type="button" className={dark ? 'themeChoice active darkChoice' : 'themeChoice'} onClick={()=>setDark(true)}><span>☾</span><b>Dark</b><small>Forest midnight</small></button></div><div className="themeStatus">Currently using <b>{dark ? 'Dark mode' : 'Light mode'}</b></div></div><div className="panel"><div className="settingIcon"><SlidersHorizontal/></div><h3>Daily study target</h3><p>Choose how many focused minutes you want to aim for each day.</p><div className="rangeRow"><input type="range" min="30" max="300" step="15" value={dailyMinutes} onChange={e=>setDailyMinutes(Number(e.target.value))}/><b>{dailyMinutes} min</b></div></div><div className="panel"><div className="settingIcon"><DownloadCloud/></div><h3>Backup your data</h3><p>Export exams, chapter status, notes, plans and activity as a JSON backup.</p><button type="button" className="primary" onClick={exportBackup}><DownloadCloud/> Export backup</button><label className="secondaryButton backupImport">Restore backup<input type="file" accept="application/json,.json" onChange={importBackup}/></label></div><div className="panel"><div className="settingIcon"><RotateCcw/></div><h3>Reset timer</h3><p>Quickly return the focus timer to a 25/5 setup.</p><button type="button" className="secondaryButton" onClick={()=>{switchTimerMode('focus');notify('Timer reset to 25 minutes')}}>Reset focus timer</button></div><div className="panel"><div className="settingIcon"><Sparkles/></div><h3>Premium mode</h3><p>Animations, keyboard command palette, achievements, countdowns and smart planning are enabled.</p><span className="premiumPill">✦ AUREN PREMIUM UI</span></div></div></>;

  const Content = () => page === 'home' ? BrandHome() : page === 'dashboard' ? Dashboard() : page === 'syllabus' ? Syllabus() : page === 'subject' ? SubjectPage() : page === 'datesheet' ? DateSheet() : page === 'study' ? Study() : page === 'notes' ? Notes() : page === 'revision' ? Revision() : page === 'quiz' ? QuizArena() : page === 'mistakes' ? MistakeBook() : page === 'analytics' ? Analytics() : page === 'leaderboard' ? Leaderboard() : page === 'rewards' ? Rewards() : page === 'heatmap' ? Heatmap() : page === 'resources' ? ResourceLibrary() : page === 'rooms' ? StudyRooms() : page === 'ai' ? AIPage() : page === 'settings' ? SettingsPage() : Feedback();

  return <main className={`${dark ? 'app dark' : 'app'} ${compactMode ? 'compactMode' : ''}`}>
    {onboard && <div className="onboardStage">
  <div className="onboardAtmosphere" aria-hidden="true"><i></i><b></b><span></span></div>
  <div className="onboardWindow">
    <div className="onboardTopline"><span><em></em> AUREN / PRIVATE</span><small>01 — SETUP</small></div>
    <div className="onboardGrid">
      <div className="onboardStory">
        <div className="onboardMonogram"><span>A</span><b>✦</b></div>
        <small className="onboardKicker">YOUR BOARD JOURNEY</small>
        <h1>Study with <i>intent.</i></h1>
        <p>AUREN turns your syllabus, exams and daily effort into one calm command centre.</p>
        <div className="onboardPromise"><span>01</span><div><b>Built around you</b><small>Your name and class personalise the experience.</small></div></div>
        <div className="onboardPromise"><span>02</span><div><b>Built for consistency</b><small>Small, focused sessions compound into board readiness.</small></div></div>
      </div>
      <div className="onboardFormPane">
        <div className="onboardFormHead"><span>WELCOME</span><b>Let's set your profile.</b><small>It takes less than a minute.</small></div>
        <label className="onboardField"><span>Your name</span><div className="onboardInputWrap"><UserRoundPlus size={17}/><input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" /></div></label>
        <div className="onboardField"><span>Your class</span><div className="onboardClassGrid">{['9','10'].map(c => <button type="button" className={className === c ? 'selected' : ''} onClick={() => setClassName(c)} key={c}><b>CLASS</b><strong>{c}</strong><small>{c === '10' ? 'Board year' : 'Foundation'}</small>{className === c && <Check size={15}/>}</button>)}</div></div>
        <div className="onboardPreview"><div className="onboardPreviewAvatar">{(name.trim()[0] || 'A').toUpperCase()}</div><div><small>YOUR AUREN PROFILE</small><b>{name.trim() || 'Your name'}</b><span>Class {className} · Board Journey</span></div><Sparkles size={17}/></div>
        <button type="button" className="onboardLaunch" onClick={save}><span>Enter AUREN</span><ArrowUpRight size={18}/></button>
        <div className="onboardFine"><span>⌘</span> Your profile is stored on this device <i></i> <span>PRIVATE</span></div>
      </div>
    </div>
    <div className="onboardFooter"><span>DESIGNED WITH ❤️ BY ARCHIT</span><span>AUREN / 2026</span></div>
  </div>
</div>}
    <section className="main commandMain"><header className="commandHeader">
      <button type="button" className="commandBrand brandButton" onClick={openBrand} aria-label="Open AUREN home">
        <b className="brandMark">A<span>✦</span></b><span className="commandBrandText">AUREN</span>
      </button>
      <div className="commandCurrent"><small>NOW EXPLORING</small><b>{String(page === 'ai' ? 'Auren Intelligence' : nav.find(x => x[0] === page)?.[1] || 'Dashboard')}</b></div>
      <div className="commandActions">
        <button type="button" className={`commandAI ${page === 'ai' ? 'active' : ''}`} onClick={() => go('ai')}><Bot size={16}/><span>Auren Intelligence</span></button>
        <button type="button" className="commandHubButton" onClick={() => { setPaletteOpen(true); setSearch(''); }}><Layers3 size={17}/><span>Explore</span><kbd>⌘K</kbd></button>
        <button type="button" className="commandTimer" onClick={() => setTimerOpen(true)} aria-label="Focus timer"><Clock3 size={17}/></button>
        <button type="button" className="commandProfile" onClick={() => setLoginOpen(true)} aria-label="Open profile"><User size={17}/></button>
      </div>
    </header><div className="content"><div className="pageTransition">{Content()}</div></div><footer><div className="footerBrand"><span className="devotionalMark small"><span>ॐ</span><b>MAHAKAL</b></span><span>DESIGNED WITH ❤️ BY ARCHIT</span></div><div>DESIGNED FOR FOCUS · BUILT FOR YOUR BOARD JOURNEY</div></footer></section>

    {navTransition && <div className="navRouteTransition" aria-hidden="true"><div className="navRouteGlow"></div><div className="navRouteLine"></div><div className="navRouteCore"><span>AUREN / NAVIGATION</span><strong>{navTransitionLabel}</strong><small>Entering your study space</small></div></div>}

    {brandTransition && <div className={`brandTransition brandPhase-${brandPhase}`} aria-hidden="true">
      <div className="brandBloom"></div>
      <div className="brandCreditCore"><span>DESIGNED WITH</span><strong>♥ BY ARCHIT</strong></div>
    </div>}

    {postBrandShlok && <div className="postBrandShlok" aria-hidden="true">
      <div className="postBrandShlokCard">
        <span className="postBrandEyebrow">AUREN · A THOUGHT FOR THE JOURNEY</span>
        <p lang="sa">विद्या ददाति विनयं विनयाद् याति पात्रताम्।<br/>पात्रत्वाद् धनमाप्नोति धनाद् धर्मं ततः सुखम्॥</p>
        <small>Knowledge gives humility; humility leads to worthiness, and worthiness to prosperity and fulfilment.</small>
      </div>
    </div>}

    {postBrandCoda && <div className="postBrandCoda" aria-hidden="true">
      <div className="postBrandCodaCard">
        <div className="codaEmblem">A<span>✦</span></div>
        <span className="postBrandEyebrow">AUREN · THE STANDARD</span>
        <h2>Clarity. Discipline. Progress.</h2>
        <p>One chapter at a time. One deliberate step at a time.</p>
        <div className="codaPillars"><span>01 <b>CLARITY</b></span><span>02 <b>DISCIPLINE</b></span><span>03 <b>PROGRESS</b></span></div>
      </div>
    </div>}

    {focusMode && <div className="focusOverlay" role="dialog" aria-modal="true"><div className="focusAtmosphere"></div><button type="button" className="focusClose" onClick={() => { setFocusMode(false); setTimerRunning(false); }}><X size={19}/><span>Exit focus</span></button><div className="focusPanel"><div className="focusEyebrow"><span>AUREN FOCUS PROTOCOL</span><i>01</i></div><div className="focusOrb"><div className="focusOrbInner"><span>{timerMode === 'focus' ? 'DEEP WORK' : 'RESET'}</span><b>{timerLabel}</b><small>{timerRunning ? 'Stay with one task.' : 'Ready when you are.'}</small></div></div><div className="focusTask"><small>NEXT BEST ACTION</small><h2>{priorityPreview?.chapter || 'Choose one chapter to begin'}</h2><p>{priorityPreview ? `${priorityPreview.subject} · ${priorityPreview.task || 'Complete the next unfinished step'}` : 'Use the planner to create a focused route.'}</p></div><div className="focusControls"><button type="button" className="primary" onClick={() => setTimerRunning(v => !v)}>{timerRunning ? 'Pause session' : 'Resume focus'} <ChevronRight/></button><button type="button" className="secondaryButton" onClick={() => { setTimerMode('focus'); setTimerSeconds(25*60); setTimerRunning(true); }}>Restart 25 min</button><button type="button" className="focusTaskButton" onClick={() => { setFocusMode(false); go(priorityPreview ? 'study' : 'datesheet'); }}>Open study route <ArrowUpRight size={15}/></button></div><div className="focusFooter"><span>F = focus mode</span><span>ESC = exit</span><span>25 / 5 rhythm</span></div></div></div>}

    {viewer && <div className="viewerOverlay"><div className="viewer"><header><div><small>INTEGRATED RESOURCE</small><h2>{viewer.title}</h2><p>{viewer.description}</p></div><div className="viewerActions"><a href={viewer.url} target="_blank" rel="noreferrer"><ExternalLink size={16}/> Open</a><a href={viewer.url} target="_blank" rel="noreferrer"><Download size={16}/> Download</a><button type="button" onClick={() => setViewer(null)}><X/></button></div></header><iframe src={`/api/resource?url=${encodeURIComponent(viewer.url)}`} title={viewer.title} /></div></div>}

    {timerOpen && <div className="overlay"><div className="timerModal"><button type="button" className="closeX" onClick={() => setTimerOpen(false)}><X/></button><small>FOCUS TIMER</small><h2>{timerMode === 'focus' ? 'Deep work' : 'Short break'}</h2><div className="timerCircle"><b>{timerLabel}</b><span>{timerRunning ? 'FOCUSING' : 'READY'}</span></div><div className="timerModes"><button type="button" className={timerMode === 'focus' ? 'selected' : ''} onClick={() => switchTimerMode('focus')}>25 min focus</button><button type="button" className={timerMode === 'break' ? 'selected' : ''} onClick={() => switchTimerMode('break')}>5 min break</button></div><div className="timerActions"><button type="button" className="primary" onClick={() => setTimerRunning(!timerRunning)}>{timerRunning ? 'Pause' : 'Start'} <ChevronRight/></button><button type="button" className="secondaryButton" onClick={resetTimer}><TimerReset size={15}/> Reset</button></div></div></div>}

    {loginOpen && <div className="overlay accountOverlay" onMouseDown={() => setLoginOpen(false)}><div className="accountHub" onMouseDown={e=>e.stopPropagation()}><button type="button" className="closeX" onClick={() => setLoginOpen(false)}><X/></button><div className="accountHubTop"><div className="accountOrb"><User size={22}/></div><div><small>AUREN · PRIVATE PROFILES</small><h2>Your accounts</h2><p>Switch profiles on this device or add another student.</p></div></div><div className="accountCurrent"><span className="accountAvatar">{(name.trim()[0] || 'A').toUpperCase()}</span><div><small>ACTIVE NOW</small><b>{name || 'Student'}</b><span>Class {className} · Local profile</span></div><span className="accountLive">LIVE</span></div><div className="accountList">{accounts.filter(a=>a.name.toLowerCase() !== name.trim().toLowerCase()).map(a=><button type="button" className="accountRow" key={a.id} onClick={()=>switchAccount(a)}><span className="accountMiniAvatar">{a.name[0].toUpperCase()}</span><span><b>{a.name}</b><small>Class {a.className}</small></span><ChevronRight/></button>)}{accounts.filter(a=>a.name.toLowerCase() !== name.trim().toLowerCase()).length===0 && <div className="accountEmpty"><Sparkles size={16}/><span>No other profiles yet.</span></div>}</div><div className="accountActions"><button type="button" className="accountAdd" onClick={addAccount}><Plus size={17}/><span><b>Add another account</b><small>Create a separate profile identity on this device.</small></span><ChevronRight/></button><button type="button" className="accountDelete" onClick={deleteCurrentAccount}><Trash2 size={16}/><span>Delete current account</span></button></div><div className="accountPremium"><span><Sparkles size={15}/></span><div><b>AUREN Premium experience</b><small>Private profiles · cinematic navigation · focus protocol · smart study tools</small></div></div><div className="accountFine">Profiles are stored locally on this device.</div></div></div>}

    {paletteOpen && <div className="overlay paletteOverlay" onMouseDown={()=>setPaletteOpen(false)}><div className="palette commandCenter" onMouseDown={e=>e.stopPropagation()}><div className="commandCenterTop"><div><small>AUREN COMMAND DECK</small><h2>Where do you want to go?</h2><p>Choose a destination without leaving the page.</p></div><button type="button" className="closeX" onClick={()=>setPaletteOpen(false)}><X/></button></div><div className="paletteHead"><Search/><input autoFocus value={search} placeholder="Search your study space..." onChange={e=>setSearch(e.target.value)}/><kbd>ESC</kbd></div><div className="paletteList commandGridNav">{nav.filter(([id]) => String(id) !== 'ai').map(([id,label,Icon])=>({id,label,Icon,desc:`Open ${String(label).toLowerCase()}`})).concat([{id:'ai',label:'Auren Intelligence',Icon:Bot,desc:'Ask, learn and practise'}] as any).filter((x:any)=>String(x.label).toLowerCase().includes(search.toLowerCase())||String(x.desc).toLowerCase().includes(search.toLowerCase())).map((x:any)=>{ const PaletteIcon = x.Icon as React.ElementType; return <button type="button" className={`commandTile ${page === x.id ? 'active' : ''}`} key={String(x.id)} onClick={()=>quickAction(String(x.id))}><span className="commandTileIcon"><PaletteIcon/></span><span><b>{String(x.label)}</b><small>{String(x.desc)}</small></span><ChevronRight/></button>; })}</div><div className="commandCenterBottom"><span><Sparkles size={14}/> FUTURISTIC STUDY NAVIGATION</span><span><b>Ctrl + K</b> anytime</span></div></div></div>}

    {toast && <div className="toast">{toast}</div>}
  </main>;
}
