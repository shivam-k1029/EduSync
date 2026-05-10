import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Bell, Calendar, CheckCircle2, Clock, ExternalLink, Filter, Mail, MessageSquare, 
  LayoutDashboard, BookOpen, Settings, AlertCircle, Search, Plus, ChevronRight, User,
  TrendingUp, BarChart3, Zap, Target, Flame, Brain, Share2, Archive, Trash2, Edit2,
  Moon, Sun, Maximize2, Download, Eye, EyeOff, GitBranch, Tag, Users, Repeat2,
  ArrowUp, ArrowDown, Lightbulb, Radio, Paperclip, Pin, Star, CheckSquare2, Menu,
  X, ArrowRight, Calendar as CalendarIcon, Clock as ClockIcon, Help, Globe, Github,
  Slack, Trello, Activity, PieChart, BarChart2, LineChart, Milestone, Layers, 
  FileText, HelpCircle, Bell as BellIcon, Inbox, Send, Minimize2
} from 'lucide-react';

// --- ENHANCED MOCK DATA ---
const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Design Principles Quiz",
    course: "User Experience Design",
    source: "LMS (Canvas)",
    type: "assignment",
    priority: "high",
    deadline: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
    weight: "15%",
    link: "https://canvas.university.edu/courses/101/quizzes/5",
    description: "Covers the fundamental principles of accessibility and hierarchy.",
    status: "pending",
    progress: 0,
    subtasks: [
      { id: 1, title: "Read Chapter 5", completed: true },
      { id: 2, title: "Watch video tutorials", completed: false },
      { id: 3, title: "Practice exercises", completed: false }
    ],
    attachments: 2,
    collaborators: ["Prof. Sarah", "Study Group"],
    tags: ["important", "exam-prep"],
    estimatedHours: 3,
    completedHours: 0
  },
  {
    id: 2,
    title: "Group Project Submission",
    course: "Software Engineering",
    source: "LMS (Canvas)",
    type: "assignment",
    priority: "critical",
    deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    weight: "40%",
    link: "https://canvas.university.edu/courses/202/assignments/12",
    description: "Final code repository and documentation for the EduSync project.",
    status: "in-progress",
    progress: 65,
    subtasks: [
      { id: 1, title: "Complete backend", completed: true },
      { id: 2, title: "Frontend integration", completed: true },
      { id: 3, title: "Testing & debugging", completed: false },
      { id: 4, title: "Documentation", completed: false }
    ],
    attachments: 5,
    collaborators: ["Alice", "Bob", "Charlie"],
    tags: ["team", "project"],
    estimatedHours: 20,
    completedHours: 13
  },
  {
    id: 3,
    title: "Change in Tutorial Room",
    course: "Mathematics III",
    source: "Email (Outlook)",
    type: "announcement",
    priority: "medium",
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    weight: "N/A",
    link: "#",
    description: "Tomorrow's tutorial will be held in Block B, Room 402.",
    status: "completed",
    progress: 100,
    subtasks: [],
    attachments: 0,
    collaborators: [],
    tags: ["announcement"],
    estimatedHours: 0,
    completedHours: 0
  },
  {
    id: 4,
    title: "Lab Report Part B",
    course: "Physics Lab",
    source: "WhatsApp (Group)",
    type: "assignment",
    priority: "high",
    deadline: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    weight: "10%",
    link: "#",
    description: "Submission link is live on the department portal.",
    status: "pending",
    progress: 30,
    subtasks: [
      { id: 1, title: "Data collection", completed: true },
      { id: 2, title: "Analysis", completed: false },
      { id: 3, title: "Write report", completed: false }
    ],
    attachments: 3,
    collaborators: ["Lab Partner"],
    tags: ["lab", "report"],
    estimatedHours: 8,
    completedHours: 2
  }
];

// SAMPLE_INSIGHTS removed — now computed dynamically from notifications + connectedPlatforms

const App = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [currentSort, setCurrentSort] = useState('deadline');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeMessage, setComposeMessage] = useState({ recipients: '', subject: '', message: '' });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [showCourseManage, setShowCourseManage] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 28)); // April 28, 2026
  const [selectedEventDate, setSelectedEventDate] = useState(null);
  // --- INTEGRATION STATE (persisted to localStorage) ---
  const [connectedPlatforms, setConnectedPlatformsRaw] = useState(() => {
    try {
      const saved = localStorage.getItem('edusync_connected_platforms');
      return saved ? JSON.parse(saved) : ['Canvas LMS'];
    } catch { return ['Canvas LMS']; }
  });
  const [platformMeta, setPlatformMetaRaw] = useState(() => {
    try {
      const saved = localStorage.getItem('edusync_platform_meta');
      return saved ? JSON.parse(saved) : { 'Canvas LMS': { connectedAt: new Date().toISOString(), syncedAt: new Date().toISOString() } };
    } catch { return {}; }
  });
  const [connectingPlatform, setConnectingPlatform] = useState(null); // name of platform currently going through flow
  const [connectStep, setConnectStep] = useState(0); // 0=idle 1=authorizing 2=fetching 3=done

  const setConnectedPlatforms = (val) => {
    const next = typeof val === 'function' ? val(connectedPlatforms) : val;
    setConnectedPlatformsRaw(next);
    localStorage.setItem('edusync_connected_platforms', JSON.stringify(next));
  };
  const setPlatformMeta = (val) => {
    const next = typeof val === 'function' ? val(platformMeta) : val;
    setPlatformMetaRaw(next);
    localStorage.setItem('edusync_platform_meta', JSON.stringify(next));
  };

  // Mock notifications injected per platform when connected
  const PLATFORM_MOCK_NOTIFICATIONS = {
    'Gmail': [
      { id: 9001, title: 'Prof. Sharma: Assignment Extension Granted', course: 'Mathematics III', source: 'Email (Gmail)', type: 'announcement', priority: 'high', deadline: new Date(Date.now() + 3*24*60*60*1000).toISOString(), weight: 'N/A', link: '#', description: 'Prof. Sharma has granted a 48-hour extension for Problem Set 4 due to the lab downtime.', status: 'pending', progress: 0, subtasks: [], attachments: 1, collaborators: ['Prof. Sharma'], tags: ['email', 'extension'], estimatedHours: 0, completedHours: 0 },
      { id: 9002, title: 'Internship Application: Interview Scheduled', course: 'Career', source: 'Email (Gmail)', type: 'announcement', priority: 'critical', deadline: new Date(Date.now() + 1*24*60*60*1000).toISOString(), weight: 'N/A', link: '#', description: 'Your interview with TechCorp has been scheduled for tomorrow at 10 AM via Google Meet.', status: 'pending', progress: 0, subtasks: [], attachments: 0, collaborators: [], tags: ['email', 'career'], estimatedHours: 2, completedHours: 0 },
    ],
    'Slack': [
      { id: 9003, title: 'DSA Study Group: Session Tonight 8 PM', course: 'Data Structures & Algorithms', source: 'Slack', type: 'announcement', priority: 'medium', deadline: new Date(Date.now() + 10*60*60*1000).toISOString(), weight: 'N/A', link: '#', description: '#dsa-group: "Covering Binary Trees and AVL rotations tonight. Please read Chapter 12 beforehand."', status: 'pending', progress: 0, subtasks: [], attachments: 0, collaborators: ['Alice', 'Bob', 'Riya'], tags: ['slack', 'study-group'], estimatedHours: 2, completedHours: 0 },
      { id: 9004, title: 'TA Channel: Lab 3 Rubric Posted', course: 'Web & App Programming', source: 'Slack', type: 'assignment', priority: 'medium', deadline: new Date(Date.now() + 4*24*60*60*1000).toISOString(), weight: '15%', link: '#', description: '#wap-lab: "Lab 3 rubric is now live in the files tab. Pay close attention to the accessibility criteria."', status: 'pending', progress: 0, subtasks: [{ id:1, title:'Read rubric', completed:false },{ id:2, title:'Update components', completed:false }], attachments: 1, collaborators: ['TA Priya'], tags: ['slack', 'lab'], estimatedHours: 4, completedHours: 0 },
    ],
    'WhatsApp': [
      { id: 9005, title: 'Class Group: Venue Changed — Room 402', course: 'Fundamental System Thinking', source: 'WhatsApp', type: 'announcement', priority: 'high', deadline: new Date(Date.now() + 18*60*60*1000).toISOString(), weight: 'N/A', link: '#', description: 'Class WhatsApp: "Tomorrow\'s FST lecture has moved to Block B, Room 402. Please note the change."', status: 'pending', progress: 0, subtasks: [], attachments: 0, collaborators: [], tags: ['whatsapp', 'venue'], estimatedHours: 0, completedHours: 0 },
    ],
    'Trello': [
      { id: 9006, title: 'EduSync Project: Testing Card Overdue', course: 'Software Engineering', source: 'Trello', type: 'assignment', priority: 'critical', deadline: new Date(Date.now() + 6*60*60*1000).toISOString(), weight: '40%', link: '#', description: 'Trello card "Testing & Debugging" in the EduSync board is overdue and blocking deployment.', status: 'in-progress', progress: 40, subtasks: [{ id:1, title:'Write unit tests', completed:false },{ id:2, title:'Fix regression bugs', completed:false }], attachments: 2, collaborators: ['Charlie', 'Alice'], tags: ['trello', 'project'], estimatedHours: 6, completedHours: 2 },
    ],
    'Google Calendar': [
      { id: 9007, title: 'Mid-Semester Review: Block Your Calendar', course: 'All Courses', source: 'Google Calendar', type: 'announcement', priority: 'medium', deadline: new Date(Date.now() + 5*24*60*60*1000).toISOString(), weight: 'N/A', link: '#', description: 'Mid-semester review week begins Friday. 4 exams scheduled across 5 days — your calendar has been updated.', status: 'pending', progress: 0, subtasks: [], attachments: 0, collaborators: [], tags: ['calendar', 'exams'], estimatedHours: 0, completedHours: 0 },
    ],
  };

  const CONNECT_STEPS = [
    { label: 'Initiating OAuth handshake...', duration: 900 },
    { label: 'Verifying credentials...', duration: 700 },
    { label: 'Fetching your data...', duration: 1000 },
  ];

  // --- INTEGRATION HANDLERS ---
  const handleConnect = (platformName) => {
    if (connectedPlatforms.includes(platformName)) {
      // Disconnect — remove state + remove injected notifications
      const idsToRemove = (PLATFORM_MOCK_NOTIFICATIONS[platformName] || []).map(n => n.id);
      setNotifications(prev => prev.filter(n => !idsToRemove.includes(n.id)));
      setConnectedPlatforms(prev => prev.filter(p => p !== platformName));
      setPlatformMeta(prev => { const next = {...prev}; delete next[platformName]; return next; });
    } else {
      // Multi-step connect flow
      setConnectingPlatform(platformName);
      setConnectStep(1);
      let step = 1;
      const advance = () => {
        step++;
        if (step <= CONNECT_STEPS.length) {
          setConnectStep(step);
          setTimeout(advance, CONNECT_STEPS[step - 1]?.duration || 800);
        } else {
          // Done — persist and inject notifications
          setConnectedPlatforms(prev => [...prev, platformName]);
          setPlatformMeta(prev => ({
            ...prev,
            [platformName]: { connectedAt: new Date().toISOString(), syncedAt: new Date().toISOString() }
          }));
          if (PLATFORM_MOCK_NOTIFICATIONS[platformName]) {
            setNotifications(prev => {
              const existingIds = new Set(prev.map(n => n.id));
              const fresh = PLATFORM_MOCK_NOTIFICATIONS[platformName].filter(n => !existingIds.has(n.id));
              return [...fresh, ...prev];
            });
          }
          setConnectStep(0);
          setConnectingPlatform(null);
        }
      };
      setTimeout(advance, CONNECT_STEPS[0].duration);
    }
  };

  // --- HELPER FUNCTIONS ---
  const getUrgency = (deadline) => {
    const now = new Date();
    const target = new Date(deadline);
    const diffHours = (target - now) / (1000 * 60 * 60);
    if (diffHours <= 24) return { color: 'bg-red-100 text-red-700 border-red-200', label: 'Critical', icon: '🔴' };
    if (diffHours <= 72) return { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Urgent', icon: '🟠' };
    return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'On Track', icon: '🟢' };
  };

  const getTimeLeftLabel = (deadline) => {
    const now = new Date();
    const target = new Date(deadline);
    const diffHours = (target - now) / (1000 * 60 * 60);
    if (diffHours < 0) return "Overdue";
    if (diffHours < 24) return `${Math.floor(diffHours)}h left`;
    if (diffHours < 48) return `1d left`;
    return `${Math.floor(diffHours / 24)}d left`;
  };

  const filteredAndSortedNotifications = useMemo(() => {
    let filtered = notifications.filter(notif => {
      const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            notif.course.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || 
                         (activeTab === 'assignments' && notif.type === 'assignment') ||
                         (activeTab === 'announcements' && notif.type === 'announcement');
      const matchesPriority = filterPriority === 'all' || notif.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || notif.status === filterStatus;
      const matchesCompleted = showCompletedTasks || notif.status !== 'completed';

      return matchesSearch && matchesTab && matchesPriority && matchesStatus && matchesCompleted;
    });

    return filtered.sort((a, b) => {
      if (currentSort === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
      if (currentSort === 'priority') {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (currentSort === 'progress') return b.progress - a.progress;
      return 0;
    });
  }, [notifications, activeTab, searchQuery, filterPriority, filterStatus, showCompletedTasks, currentSort]);

  const stats = useMemo(() => {
    const total = notifications.length;
    const completed = notifications.filter(n => n.status === 'completed').length;
    const inProgress = notifications.filter(n => n.status === 'in-progress').length;
    const critical = notifications.filter(n => n.priority === 'critical').length;
    const overdue = notifications.filter(n => {
      const now = new Date();
      return new Date(n.deadline) < now && n.status !== 'completed';
    }).length;
    const avgProgress = Math.round(notifications.reduce((acc, n) => acc + n.progress, 0) / total);
    const completionRate = Math.round((completed / total) * 100);

    return { total, completed, inProgress, critical, overdue, avgProgress, completionRate };
  }, [notifications]);

  // Dynamic insights — recompute whenever notifications or connected platforms change
  const dynamicInsights = useMemo(() => {
    const tot = notifications.length || 1;
    const done = notifications.filter(n => n.status === 'completed').length;
    const onTime = Math.min(100, Math.round((done / tot) * 100) + (connectedPlatforms.length * 3));

    const leads = notifications
      .filter(n => n.status !== 'completed')
      .map(n => (new Date(n.deadline) - new Date()) / 86400000)
      .filter(d => d > 0);
    const avgLead = leads.length ? (leads.reduce((a,b)=>a+b,0)/leads.length).toFixed(1) : null;

    const prodScore = Math.min(10, 6.5 + connectedPlatforms.length * 0.3 + (done/tot)*2).toFixed(1);

    const timed = notifications.filter(n => n.estimatedHours > 0 && n.completedHours > 0);
    const accuracy = timed.length
      ? Math.round(timed.reduce((a,n)=>a+Math.min(100,(n.completedHours/n.estimatedHours)*100),0)/timed.length)
      : Math.min(99, 78 + connectedPlatforms.length * 3);

    const pBonus = (connectedPlatforms.length * 0.3).toFixed(1);
    return [
      { label:'On-Time Completion', value:`${onTime}%`,              trend: connectedPlatforms.length>1?`+${connectedPlatforms.length*2}%`:'+0%', icon:'📈', up:true  },
      { label:'Avg. Lead Time',     value: avgLead ? `${avgLead}d` : '—', trend: avgLead && avgLead<3?'⚠ tight':'✓ ok',                                 icon:'⏱️', up:false },
      { label:'Productivity Score', value:`${prodScore}/10`,          trend:`+${pBonus} platforms`,                                                  icon:'🎯', up:true  },
      { label:'Time Accuracy',      value:`${accuracy}%`,             trend: accuracy>85?`+${accuracy-78}%`:`${accuracy-78}%`,               icon:'🎲', up:accuracy>85 },
    ];
  }, [notifications, connectedPlatforms]);

  const handleToggleSubtask = (notifId, subtaskId) => {
    setNotifications(prev => prev.map(notif => {
      if (notif.id === notifId) {
        return {
          ...notif,
          subtasks: notif.subtasks.map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return notif;
    }));
  };

  const handleUpdateProgress = (notifId, newProgress) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notifId 
        ? { ...notif, progress: newProgress, status: newProgress === 100 ? 'completed' : 'in-progress' }
        : notif
    ));
  };

  // --- VIEW COMPONENTS ---

  const AdvancedDashboard = () => (
    <div className="space-y-8">
      {/* Header with Quick Access */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Academic Hub</h1>
          <p className="text-slate-500 mt-1">Synced across {connectedPlatforms.length} platform{connectedPlatforms.length !== 1 ? 's' : ''} · {stats.total} tasks tracked</p>
        </div>
        <div className="flex gap-3">
          <button className="p-2 hover:bg-slate-100 rounded-xl transition-all" onClick={() => setDarkMode(!darkMode)} title="Toggle dark mode">
            {darkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} className="text-slate-600" />}
          </button>
          <button className="p-2 hover:bg-slate-100 rounded-xl transition-all" title="Help">
            <HelpCircle size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Advanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdvancedStatCard 
          label="Total Tasks" 
          value={stats.total} 
          change="+2 this week"
          icon={<Target className="text-blue-500" size={24} />}
          trend="up"
          color="blue"
        />
        <AdvancedStatCard 
          label="Completed" 
          value={stats.completed} 
          change={`${stats.completionRate}% completion`}
          icon={<CheckCircle2 className="text-emerald-500" size={24} />}
          trend="up"
          color="emerald"
        />
        <AdvancedStatCard 
          label="In Progress" 
          value={stats.inProgress} 
          change={`${stats.avgProgress}% average`}
          icon={<Zap className="text-amber-500" size={24} />}
          trend="stable"
          color="amber"
        />
        <AdvancedStatCard 
          label="Critical" 
          value={stats.critical} 
          change={`${stats.overdue} overdue`}
          icon={<AlertCircle className="text-red-500" size={24} />}
          trend="down"
          color="red"
        />
      </div>

      {/* Platform Connection Banner — appears when 2+ platforms connected */}
      {connectedPlatforms.length > 1 && (
        <div
          className={`rounded-2xl p-4 border flex items-center gap-4 flex-wrap ${darkMode ? 'bg-teal-900/30 border-teal-700' : 'bg-teal-50 border-teal-200'}`}
          style={{ animation: 'fadeSlideIn .4s cubic-bezier(.16,1,.3,1)' }}
        >
          <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${darkMode ? 'bg-teal-700' : 'bg-teal-500'}`}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M5 9l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-bold ${darkMode ? 'text-teal-200' : 'text-teal-800'}`}>
              {connectedPlatforms.length} platforms synced — insights updated live
            </p>
            <p className={`text-xs mt-0.5 truncate ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>
              {connectedPlatforms.join(' · ')}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {[...Array(Math.min(connectedPlatforms.length, 6))].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-teal-400"
                style={{ animation: `pulse 1.4s ease ${i * 0.18}s infinite` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Insights Section — live computed from real notification data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicInsights.map((insight, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-4 border transition-all hover:shadow-md ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}
            style={{ animation: `fadeSlideIn ${0.25 + idx * 0.07}s cubic-bezier(.16,1,.3,1) both` }}
          >
            <div className="flex justify-between items-start">
              <span className="text-2xl">{insight.icon}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                insight.up
                  ? (darkMode ? 'bg-emerald-900 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
                  : (darkMode ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600')
              }`}>
                {insight.trend}
              </span>
            </div>
            <p className={`text-xs mt-3 uppercase font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{insight.label}</p>
            <p className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{insight.value}</p>
          </div>
        ))}
      </div>

      {/* Advanced Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="w-full md:w-96">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks, courses, instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex p-1 bg-white border border-slate-200 rounded-xl">
            {['all', 'assignments', 'announcements'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-teal-600 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all font-medium text-slate-600"
          >
            <Filter size={18} /> Filters
          </button>

          <button 
            onClick={() => setShowIntegrations(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all font-medium shadow-sm"
          >
            <Plus size={18} /> New
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvancedFilter && (
        <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl p-6 border border-slate-200 space-y-4 animate-in fade-in duration-300">
          <h3 className="font-bold text-slate-900">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase block mb-2">Priority</label>
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase block mb-2">Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showCompletedTasks}
                  onChange={(e) => setShowCompletedTasks(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600"
                />
                <span className="text-sm font-medium text-slate-600">Show Completed</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Sort Options */}
      <div className="flex gap-2">
        <span className="text-sm text-slate-500 font-medium">Sort by:</span>
        {['deadline', 'priority', 'progress'].map(sort => (
          <button
            key={sort}
            onClick={() => setCurrentSort(sort)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-all capitalize ${
              currentSort === sort 
                ? 'bg-teal-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {sort}
          </button>
        ))}
      </div>

      {/* ── Live Platform Feed — shows when any non-Canvas platform is connected */}
      {connectedPlatforms.filter(p => p !== 'Canvas LMS').length > 0 && (() => {
        const SOURCE_COLORS = {
          'Email (Gmail)': '#EA4335', 'Slack': '#4A154B', 'WhatsApp': '#25D366',
          'Trello': '#0052CC', 'Google Calendar': '#1A73E8',
        };
        const platformItems = notifications.filter(n =>
          connectedPlatforms.some(p => {
            if (p === 'Gmail' && n.source && n.source.includes('Gmail')) return true;
            if (p === 'Slack' && n.source === 'Slack') return true;
            if (p === 'WhatsApp' && n.source === 'WhatsApp') return true;
            if (p === 'Trello' && n.source === 'Trello') return true;
            if (p === 'Google Calendar' && n.source === 'Google Calendar') return true;
            return false;
          })
        ).slice(0, 4);
        if (platformItems.length === 0) return null;
        return (
          <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
            style={{ animation: 'fadeSlideIn .35s cubic-bezier(.16,1,.3,1)' }}>
            <div className={`px-5 py-3 flex items-center justify-between border-b ${darkMode ? 'border-slate-700 bg-slate-750' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-500" style={{ animation: 'pulse 1.4s ease infinite' }}/>
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Live from Connected Platforms</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${darkMode ? 'bg-teal-900 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
                {platformItems.length} new
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {platformItems.map((item, i) => {
                const srcColor = SOURCE_COLORS[item.source] || '#6B7280';
                const urgency = (() => {
                  const h = (new Date(item.deadline) - new Date()) / 3600000;
                  if (h <= 24) return { dot: 'bg-red-500', text: 'text-red-600', label: 'Critical' };
                  if (h <= 72) return { dot: 'bg-amber-500', text: 'text-amber-600', label: 'Urgent' };
                  return { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'On track' };
                })();
                return (
                  <div key={item.id}
                    className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}
                    onClick={() => setSelectedNotification(item)}
                    style={{ animation: `fadeSlideIn ${.1 + i * .07}s cubic-bezier(.16,1,.3,1) both` }}
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold mt-0.5"
                      style={{ background: srcColor }}>
                      {item.source.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-bold" style={{ color: srcColor }}>{item.source}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${urgency.text}`}>{urgency.label}</span>
                      </div>
                      <p className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                      <p className={`text-xs mt-0.5 truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.course}</p>
                    </div>
                    <div className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      {(() => {
                        const h = Math.round((new Date(item.deadline) - new Date()) / 3600000);
                        if (h < 0) return 'Overdue';
                        if (h < 24) return h + 'h';
                        return Math.floor(h/24) + 'd';
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Enhanced Task Cards */}
      <div className="space-y-4">
        {filteredAndSortedNotifications.length > 0 ? (
          filteredAndSortedNotifications.map(item => (
            <EnhancedNotificationCard 
              key={item.id} 
              item={item} 
              urgency={getUrgency(item.deadline)} 
              timeLeft={getTimeLeftLabel(item.deadline)}
              onToggleSubtask={handleToggleSubtask}
              onUpdateProgress={handleUpdateProgress}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3" />
            <h3 className="text-xl font-bold text-slate-900">All caught up! 🎉</h3>
            <p className="text-slate-500 mt-1">No tasks match your current filters</p>
          </div>
        )}
      </div>
    </div>
  );

  const AnalyticsView = () => (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Analytics & Insights</h1>
        <p className="text-slate-500 mt-1">Performance metrics and productivity trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Completion Rate</h3>
            <BarChart3 size={24} className="text-teal-500" />
          </div>
          <div className="space-y-4">
            {[
              { course: "UXD402", rate: 85 },
              { course: "CS201", rate: 62 },
              { course: "MAT300", rate: 45 },
              { course: "PHY102", rate: 92 }
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-medium">{item.course}</span>
                  <span className="text-teal-600 font-bold">{item.rate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-400 h-full transition-all" style={{ width: `${item.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Estimation Accuracy */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Time Estimation Accuracy</h3>
            <LineChart size={24} className="text-emerald-500" />
          </div>
          <div className="space-y-3">
            {[
              { label: "This Week", estimated: 15, actual: 14.2, accuracy: 95 },
              { label: "Last Week", estimated: 20, actual: 19.5, accuracy: 98 },
              { label: "2 Weeks Ago", estimated: 18, actual: 16.8, accuracy: 93 }
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{item.accuracy}% accurate</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-slate-600">Est: <span className="font-bold">{item.estimated}h</span></span>
                  <span className="text-slate-600">Actual: <span className="font-bold">{item.actual}h</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Priority Distribution</h3>
            <PieChart size={24} className="text-amber-500" />
          </div>
          <div className="space-y-4">
            {[
              { label: "Critical", count: 2, color: "bg-red-500", percent: 20 },
              { label: "High", count: 5, color: "bg-amber-500", percent: 50 },
              { label: "Medium", count: 2, color: "bg-blue-500", percent: 20 },
              { label: "Low", count: 1, color: "bg-emerald-500", percent: 10 }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="flex-1 text-sm text-slate-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${item.percent}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Productivity Metrics */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Weekly Activity</h3>
            <Activity size={24} className="text-purple-500" />
          </div>
          <div className="flex items-end justify-between h-32 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const heights = [60, 75, 55, 90, 70, 40, 30];
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                  <div className={`w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg transition-all hover:from-teal-600 hover:to-teal-500`} style={{ height: `${heights[idx] * 1.2}px` }} />
                  <span className="text-xs font-semibold text-slate-600">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const CalendarViewAdvanced = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    const events = {
      1: [{ title: "Design Review", time: "2:00 PM", course: "UXD402", type: "meeting", color: "blue" }],
      5: [{ title: "Assignment Due", time: "11:59 PM", course: "CS201", type: "deadline", color: "red" }],
      8: [{ title: "Midterm Exam", time: "10:00 AM", course: "MAT300", type: "exam", color: "orange" }],
      12: [{ title: "Project Presentation", time: "3:30 PM", course: "CS201", type: "presentation", color: "purple" }],
      15: [{ title: "Lab Report Due", time: "5:00 PM", course: "PHY102", type: "deadline", color: "red" }],
      18: [{ title: "Office Hours", time: "1:00 PM", course: "UXD402", type: "meeting", color: "blue" }],
      22: [
        { title: "Quiz 3", time: "9:00 AM", course: "MAT300", type: "exam", color: "orange" },
        { title: "Group Meeting", time: "4:00 PM", course: "CS201", type: "meeting", color: "blue" }
      ],
      25: [{ title: "Final Project Submission", time: "11:59 PM", course: "CS201", type: "deadline", color: "red" }],
      28: [{ title: "Today", time: "Now", course: "Academic Hub", type: "today", color: "teal" }]
    };

    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    const handleToday = () => setCurrentDate(new Date(2026, 3, 28));

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const selectedDate = selectedEventDate ? events[selectedEventDate] : null;

    return (
      <div className="space-y-8 animate-in fade-in">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Calendar & Timeline</h1>
          <p className="text-slate-500 mt-1">Track deadlines, exams, and important events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <div className="flex gap-2">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all font-bold text-slate-600">
                  ← Prev
                </button>
                <button onClick={handleToday} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 border border-teal-300 rounded-lg text-white font-medium hover:shadow-md transition-all">
                  Today
                </button>
                <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all font-bold text-slate-600">
                  Next →
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-slate-500 py-3 uppercase tracking-wider">{day.slice(0, 3)}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                const hasEvents = day && events[day];
                const isToday = day === 28;
                const isSelected = day === selectedEventDate;
                
                return (
                  <div
                    key={idx}
                    onClick={() => day && setSelectedEventDate(day)}
                    className={`h-32 rounded-xl p-3 transition-all cursor-pointer border-2 flex flex-col ${
                      !day 
                        ? 'border-transparent bg-gray-50' 
                        : isSelected
                        ? 'border-teal-500 bg-teal-50 shadow-md'
                        : isToday
                        ? 'border-teal-400 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-sm'
                        : hasEvents
                        ? 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:shadow-md'
                        : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {day && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-bold ${isToday ? 'text-teal-600' : 'text-slate-700'}`}>
                            {day}
                          </span>
                          {isToday && <span className="w-2 h-2 bg-teal-600 rounded-full" />}
                        </div>
                        {hasEvents && (
                          <div className="space-y-1 text-[10px]">
                            {events[day].slice(0, 1).map((evt, i) => (
                              <div key={i} className={`px-1.5 py-0.5 rounded font-semibold truncate text-white ${
                                evt.color === 'red' ? 'bg-red-500' :
                                evt.color === 'blue' ? 'bg-blue-500' :
                                evt.color === 'orange' ? 'bg-orange-500' :
                                evt.color === 'purple' ? 'bg-purple-500' :
                                'bg-teal-500'
                              }`}>
                                {evt.title}
                              </div>
                            ))}
                            {events[day].length > 1 && (
                              <div className="text-slate-500 font-semibold px-1">+{events[day].length - 1} more</div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs font-bold text-slate-600 uppercase mb-3">Event Types</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Deadline", color: "bg-red-500" },
                  { name: "Exam", color: "bg-orange-500" },
                  { name: "Meeting", color: "bg-blue-500" },
                  { name: "Presentation", color: "bg-purple-500" }
                ].map(legend => (
                  <div key={legend.name} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${legend.color}`} />
                    <span className="text-xs font-medium text-slate-600">{legend.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Event Details Sidebar */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Events</h3>
            
            {selectedDate ? (
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-200">
                  <p className="text-sm font-bold text-slate-500 uppercase">Selected Date</p>
                  <p className="text-2xl font-bold text-teal-600 mt-1">{monthNames[currentDate.getMonth()]} {selectedEventDate}, {currentDate.getFullYear()}</p>
                </div>
                
                <div className="space-y-3">
                  {selectedDate.map((event, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border-l-4 ${
                      event.color === 'red' ? 'bg-red-50 border-red-500' :
                      event.color === 'blue' ? 'bg-blue-50 border-blue-500' :
                      event.color === 'orange' ? 'bg-orange-50 border-orange-500' :
                      event.color === 'purple' ? 'bg-purple-50 border-purple-500' :
                      'bg-teal-50 border-teal-500'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-slate-900">{event.title}</p>
                          <p className="text-xs text-slate-600 mt-1">{event.course}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          event.type === 'deadline' ? 'bg-red-200 text-red-700' :
                          event.type === 'exam' ? 'bg-orange-200 text-orange-700' :
                          event.type === 'meeting' ? 'bg-blue-200 text-blue-700' :
                          event.type === 'presentation' ? 'bg-purple-200 text-purple-700' :
                          'bg-teal-200 text-teal-700'
                        }`}>
                          {event.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Clock size={14} /> {event.time}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-bold hover:shadow-lg transition-all">
                  Add Event
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">Select a date to view events</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events Feed */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Upcoming Events</h3>
          <div className="space-y-3">
            {[
              { date: "Apr 28", title: "Quiz 3", course: "MAT300", time: "9:00 AM", type: "exam" },
              { date: "Apr 30", title: "Assignment Due", course: "CS201", time: "11:59 PM", type: "deadline" },
              { date: "May 5", title: "Group Project Presentation", course: "CS201", time: "3:30 PM", type: "presentation" },
              { date: "May 8", title: "Lab Report Submission", course: "PHY102", time: "5:00 PM", type: "deadline" },
              { date: "May 15", title: "Final Exam", course: "MAT300", time: "10:00 AM", type: "exam" }
            ].map((event, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                <div className="flex-shrink-0 text-center">
                  <p className="text-sm font-bold text-teal-600">{event.date}</p>
                  <p className="text-xs text-slate-500">{event.time}</p>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{event.title}</p>
                  <p className="text-sm text-slate-600">{event.course}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-lg capitalize ${
                  event.type === 'deadline' ? 'bg-red-100 text-red-700' :
                  event.type === 'exam' ? 'bg-orange-100 text-orange-700' :
                  event.type === 'presentation' ? 'bg-purple-100 text-purple-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const CoursesViewAdvanced = () => (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">My Courses</h1>
        <p className="text-slate-500 mt-1">Track progress and manage coursework</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: "User Experience Design", code: "UXD402", progress: 85, color: "from-blue-500 to-blue-600", tasks: 12, completed: 10, instructor: "Prof. Sarah", semester: "Spring 2026" },
          { name: "Software Engineering", code: "CS201", progress: 62, color: "from-teal-500 to-teal-600", tasks: 8, completed: 5, instructor: "Prof. James", semester: "Spring 2026" },
          { name: "Mathematics III", code: "MAT300", progress: 45, color: "from-purple-500 to-purple-600", tasks: 15, completed: 7, instructor: "Prof. Kumar", semester: "Spring 2026" },
          { name: "Physics Lab", code: "PHY102", progress: 92, color: "from-orange-500 to-orange-600", tasks: 6, completed: 6, instructor: "Prof. Chen", semester: "Spring 2026" },
        ].map(course => (
          <div key={course.code} className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-all group cursor-pointer">
            <div className={`h-24 bg-gradient-to-r ${course.color} opacity-10`} />
            <div className="p-6 -mt-12 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{course.code}</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{course.name}</h3>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-slate-400 transition-all" />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Progress</p>
                      <p className={`text-2xl font-bold bg-gradient-to-r ${course.color} bg-clip-text text-transparent`}>{course.progress}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium">Tasks</p>
                      <p className="text-lg font-bold text-slate-900">{course.completed}/{course.tasks}</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className={`bg-gradient-to-r ${course.color} h-full transition-all duration-1000`} style={{ width: `${course.progress}%` }} />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => { setSelectedCourse(course); setShowCourseDetails(true); }}
                    className="flex-1 px-3 py-2 text-xs font-bold rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => { setSelectedCourse(course); setShowCourseManage(true); }}
                    className="flex-1 px-3 py-2 text-xs font-bold rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-all"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">{selectedCourse.code}</span>
                <h2 className="text-3xl font-bold text-slate-900 mt-1">{selectedCourse.name}</h2>
              </div>
              <button onClick={() => setShowCourseDetails(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                <X size={24} className="text-slate-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Course Info */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-200">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Instructor</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{selectedCourse.instructor}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Semester</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{selectedCourse.semester}</p>
                </div>
              </div>

              {/* Progress Details */}
              <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-bold text-lg mb-4">Progress Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-slate-700">Overall Progress</span>
                      <span className={`text-2xl font-bold bg-gradient-to-r ${selectedCourse.color} bg-clip-text text-transparent`}>{selectedCourse.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden">
                      <div className={`bg-gradient-to-r ${selectedCourse.color} h-full transition-all`} style={{ width: `${selectedCourse.progress}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-slate-500 font-semibold">Completed Tasks</p>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{selectedCourse.completed}/{selectedCourse.tasks}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="text-xs text-slate-500 font-semibold">Pending Tasks</p>
                      <p className="text-2xl font-bold text-amber-600 mt-1">{selectedCourse.tasks - selectedCourse.completed}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Materials */}
              <div>
                <h3 className="font-bold text-lg mb-4">Recent Materials</h3>
                <div className="space-y-2">
                  {[
                    { name: "Week 8 Lecture Slides", type: "PDF", date: "2 days ago" },
                    { name: "Assignment 5 Rubric", type: "PDF", date: "5 days ago" },
                    { name: "Group Project Guidelines", type: "DOC", date: "1 week ago" }
                  ].map((material, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all cursor-pointer">
                      <FileText size={20} className="text-teal-500" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{material.name}</p>
                        <p className="text-xs text-slate-500">{material.date}</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-teal-100 text-teal-700 rounded">{material.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button onClick={() => setShowCourseDetails(false)} className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-all">
                  Close
                </button>
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-bold hover:shadow-lg transition-all">
                  Open Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Manage Modal */}
      {showCourseManage && selectedCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Manage Course</h2>
                <p className="text-slate-500 mt-1">{selectedCourse.code} - {selectedCourse.name}</p>
              </div>
              <button onClick={() => setShowCourseManage(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                <X size={24} className="text-slate-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Course Settings */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="font-bold text-lg mb-4">Course Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-teal-600" />
                    <span className="font-medium text-slate-700">Receive notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-teal-600" />
                    <span className="font-medium text-slate-700">Pin to sidebar</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-teal-600" />
                    <span className="font-medium text-slate-700">Archive course</span>
                  </label>
                </div>
              </div>

              {/* Task Management */}
              <div>
                <h3 className="font-bold text-lg mb-4">Manage Tasks</h3>
                <div className="space-y-2">
                  {[
                    { title: "Assignment 5: Research Paper", due: "Apr 30", status: "Pending" },
                    { title: "Quiz 3: Chapters 7-9", due: "Apr 28", status: "Pending" },
                    { title: "Group Project Presentation", due: "May 5", status: "In Progress" }
                  ].map((task, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg hover:border-teal-300 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{task.title}</p>
                          <p className="text-xs text-slate-500 mt-1">Due: {task.due}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          task.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grading */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-teal-200">
                <h3 className="font-bold text-lg mb-4">Current Grade</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Based on {selectedCourse.completed} submitted assignments</p>
                    <p className="text-xs text-slate-500 mt-1">More assignments will be graded soon</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-600 uppercase font-semibold">Estimated Grade</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mt-1">A-</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 flex-col sm:flex-row">
                <button onClick={() => setShowCourseManage(false)} className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-all">
                  Close
                </button>
                <button className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg font-bold hover:bg-slate-300 transition-all">
                  Download Report
                </button>
                <button className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-bold hover:shadow-lg transition-all">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- MAIN RENDER ---
  return (
    <div className={`min-h-screen text-slate-800 font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-[#F8F7F2]'}`}>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 border-r transition-all duration-300 z-50 flex flex-col ${
        darkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-slate-200'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">E</div>
            <div>
              <span className="text-xl font-bold tracking-tight text-teal-600">EduSync</span>
              <p className="text-[10px] text-slate-500">Pro</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X size={20} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {[
            { icon: <LayoutDashboard size={20} />, label: "Dashboard", view: "dashboard" },
            { icon: <BarChart3 size={20} />, label: "Analytics", view: "analytics" },
            { icon: <Calendar size={20} />, label: "Calendar", view: "calendar" },
            { icon: <BookOpen size={20} />, label: "Courses", view: "courses" },
            { icon: <MessageSquare size={20} />, label: "Messages", view: "messages" },
            { icon: <Flame size={20} />, label: "Trending", view: "trending" },
          ].map(item => (
            <NavItemEnhanced 
              key={item.view}
              icon={item.icon} 
              label={item.label} 
              active={activeView === item.view}
              onClick={() => { setActiveView(item.view); setSidebarOpen(false); }}
              darkMode={darkMode}
            />
          ))}
        </nav>

        {/* Connected Services — live from state */}
        <div
          className={`m-4 p-4 rounded-2xl border transition-all ${darkMode ? 'bg-slate-700 border-slate-600' : 'bg-teal-50 border-teal-200'}`}
          onClick={() => setShowIntegrations(true)}
          style={{ cursor: 'pointer' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-semibold uppercase ${darkMode ? 'text-slate-400' : 'text-teal-800'}`}>Connected</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${darkMode ? 'bg-teal-800 text-teal-300' : 'bg-teal-200 text-teal-800'}`}>
              {connectedPlatforms.length}/6
            </span>
          </div>
          {connectedPlatforms.length === 0 ? (
            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No platforms connected</p>
          ) : (
            <div className="flex -space-x-2 flex-wrap gap-y-1">
              {connectedPlatforms.map((name) => {
                const colors = {
                  'Canvas LMS': '#E66000', 'Gmail': '#EA4335', 'WhatsApp': '#25D366',
                  'Slack': '#4A154B', 'Trello': '#0052CC', 'Google Calendar': '#1A73E8'
                };
                const bg = colors[name] || '#6B7280';
                return (
                  <div
                    key={name}
                    title={name}
                    style={{ background: bg }}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 ${darkMode ? 'border-slate-700' : 'border-white'}`}
                  >
                    {name.charAt(0)}
                  </div>
                );
              })}
            </div>
          )}
          <p className={`text-[10px] mt-2 font-medium ${darkMode ? 'text-slate-500' : 'text-teal-600'}`}>
            Click to manage integrations
          </p>
        </div>

        <div className={`p-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-100'} space-y-2`}>
          <NavItemEnhanced 
            icon={<Settings size={20} />} 
            label="Settings" 
            active={activeView === 'settings'}
            onClick={() => setActiveView('settings')}
            darkMode={darkMode}
          />
          <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
            darkMode 
              ? 'text-slate-400 hover:bg-slate-700 hover:text-slate-300' 
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
          }`}>
            <HelpCircle size={20} /> <span>Help & Support</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto pb-24 lg:pb-12">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-8 lg:mb-0 lg:absolute lg:top-8 lg:right-12">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
            <Menu size={24} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-all relative">
              <BellIcon size={20} className="text-slate-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">3</span>
            </button>
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs">SK</div>
              <span className="text-sm font-bold text-slate-700 mr-2">Shivam</span>
            </div>
          </div>
        </div>

        {/* View Rendering */}
        {activeView === 'dashboard' && <AdvancedDashboard />}
        {activeView === 'analytics' && <AnalyticsView />}
        {activeView === 'calendar' && <CalendarViewAdvanced />}
        {activeView === 'courses' && <CoursesViewAdvanced />}
        {activeView === 'messages' && <MessagesViewAdvanced showComposeModal={showComposeModal} setShowComposeModal={setShowComposeModal} composeMessage={composeMessage} setComposeMessage={setComposeMessage} />}
        {activeView === 'trending' && <TrendingView />}
        {activeView === 'settings' && <SettingsView darkMode={darkMode} setDarkMode={setDarkMode} />}
      </main>

      {/* ── INTEGRATIONS MODAL ──────────────────────────────────────────── */}
      {showIntegrations && (() => {
        const PLATFORM_DEFS = [
          {
            name: 'Canvas LMS',
            desc: 'Assignments, quizzes & grades',
            color: '#E66000',
            notifCount: 3,
            logo: (
              <svg viewBox="0 0 40 40" width="36" height="36">
                <rect width="40" height="40" rx="9" fill="#E66000"/>
                <text x="20" y="27" textAnchor="middle" fontSize="18" fontWeight="800" fill="white" fontFamily="serif">C</text>
              </svg>
            ),
          },
          {
            name: 'Gmail',
            desc: 'Professor emails & alerts',
            color: '#EA4335',
            notifCount: 2,
            logo: (
              <svg viewBox="0 0 40 40" width="36" height="36">
                <rect width="40" height="40" rx="9" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5"/>
                <path d="M8 14l12 9 12-9" stroke="#EA4335" strokeWidth="2" fill="none"/>
                <path d="M8 14h24v16H8z" fill="none" stroke="#e5e7eb" strokeWidth="1.5"/>
                <path d="M8 14l12 9 12-9V30H8z" fill="none"/>
                <path d="M8 14l12 9 12-9" stroke="#EA4335" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </svg>
            ),
          },
          {
            name: 'WhatsApp',
            desc: 'Class group announcements',
            color: '#25D366',
            notifCount: 1,
            logo: (
              <svg viewBox="0 0 40 40" width="36" height="36">
                <rect width="40" height="40" rx="9" fill="#25D366"/>
                <path d="M20 9C13.9 9 9 13.9 9 20c0 1.9.5 3.8 1.5 5.4L9 31l5.8-1.5A11 11 0 1020 9zm0 20a9 9 0 01-4.6-1.3l-.3-.2-3.5.9.9-3.4-.2-.3A9 9 0 1120 29zm4.9-6.7c-.3-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5.2-.4v-.4l-.7-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.5.5.6.2 1.2.1 1.6-.1.5-.2 1.5-.6 1.7-1.2.2-.6.2-1 .1-1.1-.1-.1-.2-.2-.5-.3z" fill="white"/>
              </svg>
            ),
          },
          {
            name: 'Slack',
            desc: 'TA channels & study groups',
            color: '#4A154B',
            notifCount: 2,
            logo: (
              <svg viewBox="0 0 40 40" width="36" height="36">
                <rect width="40" height="40" rx="9" fill="#4A154B"/>
                <g transform="translate(8,8) scale(0.6)">
                  <path d="M10 24a4 4 0 01-4-4 4 4 0 014-4h4v4a4 4 0 01-4 4z" fill="#36C5F0"/>
                  <path d="M24 10a4 4 0 01-4 4v-4a4 4 0 014-4 4 4 0 014 4 4 4 0 01-4 4z" fill="#2EB67D"/>
                  <path d="M30 24a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4v-4z" fill="#ECB22E"/>
                  <path d="M16 30a4 4 0 014-4v4a4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4z" fill="#E01E5A"/>
                </g>
              </svg>
            ),
          },
          {
            name: 'Trello',
            desc: 'Project boards & tasks',
            color: '#0052CC',
            notifCount: 1,
            logo: (
              <svg viewBox="0 0 40 40" width="36" height="36">
                <rect width="40" height="40" rx="9" fill="#0052CC"/>
                <rect x="10" y="11" width="8" height="13" rx="2" fill="white"/>
                <rect x="22" y="11" width="8" height="9" rx="2" fill="white"/>
              </svg>
            ),
          },
          {
            name: 'Google Calendar',
            desc: 'Deadlines & exam schedule',
            color: '#1A73E8',
            notifCount: 1,
            logo: (
              <svg viewBox="0 0 40 40" width="36" height="36">
                <rect width="40" height="40" rx="9" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5"/>
                <rect x="8" y="10" width="24" height="22" rx="3" fill="none" stroke="#1A73E8" strokeWidth="1.8"/>
                <line x1="8" y1="16" x2="32" y2="16" stroke="#1A73E8" strokeWidth="1.8"/>
                <line x1="15" y1="7" x2="15" y2="13" stroke="#EA4335" strokeWidth="2.5" strokeLinecap="round"/>
                <line x1="25" y1="7" x2="25" y2="13" stroke="#EA4335" strokeWidth="2.5" strokeLinecap="round"/>
                <text x="20" y="28" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A73E8" fontFamily="sans-serif">17</text>
              </svg>
            ),
          },
        ];

        const fmtTime = (iso) => {
          if (!iso) return null;
          const d = new Date(iso);
          const diff = Math.floor((Date.now() - d.getTime()) / 60000);
          if (diff < 1) return 'just now';
          if (diff < 60) return `${diff}m ago`;
          const h = Math.floor(diff / 60);
          if (h < 24) return `${h}h ago`;
          return `${Math.floor(h/24)}d ago`;
        };

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div
              className={`rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
              style={{ animation: 'intModalIn .25s cubic-bezier(.16,1,.3,1)' }}
            >
              <style>{`
                @keyframes intModalIn { from{opacity:0;transform:scale(.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes intSpin { to{transform:rotate(360deg)} }
                .int-spin { animation:intSpin .7s linear infinite }
                @keyframes intSlideIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
                .int-slide { animation:intSlideIn .2s ease both }
              `}</style>

              {/* Header */}
              <div className={`px-7 pt-7 pb-5 border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Connect & Integrate</h3>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Link your academic platforms for seamless synchronization
                    </p>
                  </div>
                  <button
                    onClick={() => setShowIntegrations(false)}
                    className={`p-2 rounded-xl transition-all ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                  >
                    <X size={20}/>
                  </button>
                </div>

                {/* Connected count bar */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                      style={{ width: `${(connectedPlatforms.length / PLATFORM_DEFS.length) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {connectedPlatforms.length}/{PLATFORM_DEFS.length} connected
                  </span>
                </div>
              </div>

              {/* Platform grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto">
                {PLATFORM_DEFS.map(platform => {
                  const isConnected = connectedPlatforms.includes(platform.name);
                  const isConnecting = connectingPlatform === platform.name;
                  const meta = platformMeta[platform.name];
                  const stepLabel = isConnecting ? CONNECT_STEPS[connectStep - 1]?.label : null;

                  return (
                    <div
                      key={platform.name}
                      className={`relative rounded-2xl border-2 p-4 transition-all duration-200 ${
                        isConnecting
                          ? `border-blue-300 ${darkMode ? 'bg-blue-950/30' : 'bg-blue-50'}`
                          : isConnected
                          ? `border-emerald-200 ${darkMode ? 'bg-emerald-950/20' : 'bg-emerald-50/60'}`
                          : `${darkMode ? 'border-slate-700 bg-slate-700/40 hover:border-slate-500' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Logo */}
                        <div className="relative flex-shrink-0">
                          {platform.logo}
                          {isConnected && !isConnecting && (
                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                              <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4L3.2 5.7 6.5 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                            </span>
                          )}
                          {isConnecting && (
                            <span className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                              <div className="int-spin w-2.5 h-2.5 border border-white/30 border-t-white rounded-full"/>
                            </span>
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{platform.name}</p>
                            {isConnected && !isConnecting && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wide">Live</span>
                            )}
                          </div>
                          {isConnecting ? (
                            <p className="text-xs text-blue-500 font-medium int-slide">{stepLabel}</p>
                          ) : isConnected && meta?.syncedAt ? (
                            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                              Synced {fmtTime(meta.syncedAt)} · {platform.notifCount} item{platform.notifCount !== 1 ? 's' : ''}
                            </p>
                          ) : (
                            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{platform.desc}</p>
                          )}
                        </div>

                        {/* Action button */}
                        <button
                          disabled={!!connectingPlatform}
                          onClick={(e) => { e.stopPropagation(); handleConnect(platform.name); }}
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isConnecting
                              ? 'bg-blue-100 text-blue-600 cursor-wait'
                              : isConnected
                              ? `${darkMode ? 'bg-emerald-800 text-emerald-300 hover:bg-red-900 hover:text-red-300' : 'bg-emerald-100 text-emerald-700 hover:bg-red-50 hover:text-red-600'} group`
                              : `${darkMode ? 'bg-slate-600 text-slate-200 hover:bg-teal-700 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-teal-600 hover:text-white'}`
                          }`}
                        >
                          {isConnecting ? 'Connecting...' : isConnected ? 'Connected ✓' : 'Connect'}
                        </button>
                      </div>

                      {/* Disconnect hint on hover — shown as subtext when connected */}
                      {isConnected && !isConnecting && (
                        <p className={`text-[10px] mt-2.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          Click "Connected" to disconnect and remove synced data
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className={`px-6 pb-6 pt-1`}>
                <div className={`p-3.5 rounded-xl flex gap-3 items-start mb-4 ${darkMode ? 'bg-blue-950/40 border border-blue-800' : 'bg-blue-50 border border-blue-100'}`}>
                  <Lightbulb size={16} className="text-blue-500 flex-shrink-0 mt-0.5"/>
                  <p className={`text-xs leading-relaxed ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    <strong>How it works:</strong> Connecting a platform syncs its notifications directly into your feed and persists across sessions. Disconnect any time to remove its data.
                  </p>
                </div>
                <button
                  onClick={() => setShowIntegrations(false)}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold hover:shadow-lg hover:from-teal-500 hover:to-teal-600 transition-all active:scale-[.99]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const AdvancedStatCard = ({ label, value, change, icon, trend, color }) => (
  <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-all">{icon}</div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
        trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 
        trend === 'down' ? 'bg-red-100 text-red-700' : 
        'bg-slate-100 text-slate-700'
      }`}>
        {trend === 'up' && <ArrowUp size={12} />}
        {trend === 'down' && <ArrowDown size={12} />}
        {change}
      </div>
    </div>
    <p className="text-slate-500 text-xs font-semibold uppercase mb-1">{label}</p>
    <p className={`text-3xl font-bold ${color === 'blue' ? 'text-blue-600' : color === 'emerald' ? 'text-emerald-600' : color === 'amber' ? 'text-amber-600' : 'text-red-600'}`}>
      {value}
    </p>
  </div>
);

const EnhancedNotificationCard = ({ item, urgency, timeLeft, onToggleSubtask, onUpdateProgress }) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityIcon = (priority) => {
    if (priority === 'critical') return '🔴';
    if (priority === 'high') return '🟠';
    if (priority === 'medium') return '🟡';
    return '🟢';
  };

  const completedSubtasks = item.subtasks.filter(st => st.completed).length;

  return (
    <div className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
      expanded ? 'border-teal-300 shadow-lg' : 'border-slate-200 hover:border-slate-300'
    }`}>
      <div className="p-6 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Left Section - Status & Urgency */}
          <div className="flex items-center md:flex-col justify-center min-w-[120px] gap-3">
            <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border ${urgency.color}`}>
              {urgency.label}
            </div>
            <p className="text-xs font-semibold text-slate-600 whitespace-nowrap">{timeLeft}</p>
            <div className="text-2xl">{getPriorityIcon(item.priority)}</div>
          </div>

          {/* Middle Section - Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-tighter">{item.course}</span>
              <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded uppercase">{item.source}</span>
              {item.priority === 'critical' && <Flame size={14} className="text-red-500" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-1">{item.description}</p>
            
            {/* Progress Bar */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-600">Progress</span>
                <span className="font-bold text-teal-600">{item.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-teal-400 h-full transition-all" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center justify-between md:flex-col md:items-end gap-4 border-t md:border-t-0 md:border-l border-slate-50 pt-4 md:pt-0 md:pl-6">
            <div className="text-center flex gap-4">
              <div>
                <p className="text-xs text-slate-400">Weight</p>
                <p className="text-lg font-bold text-slate-900">{item.weight}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Hours</p>
                <p className="text-lg font-bold text-slate-900">{item.completedHours}/{item.estimatedHours}h</p>
              </div>
            </div>
            <a href={item.link} className="flex items-center gap-2 text-sm font-bold bg-teal-50 hover:bg-teal-100 text-teal-700 px-4 py-2 rounded-xl transition-all">
              Details <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-100 bg-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Subtasks */}
          {item.subtasks.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <CheckSquare2 size={16} /> Subtasks ({completedSubtasks}/{item.subtasks.length})
              </h4>
              <div className="space-y-2">
                {item.subtasks.map(subtask => (
                  <label key={subtask.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-all cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => onToggleSubtask(item.id, subtask.id)}
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 cursor-pointer"
                    />
                    <span className={`text-sm ${subtask.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {subtask.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Time Estimate */}
          <div className="mb-6">
            <label className="font-bold text-sm text-slate-900 mb-3 block">Adjust Progress</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={item.progress}
                onChange={(e) => onUpdateProgress(item.id, parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-700 min-w-[50px]">{item.progress}%</span>
            </div>
          </div>

          {/* Collaborators & Tags */}
          <div className="grid grid-cols-2 gap-4">
            {item.collaborators.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Collaborators</p>
                <div className="flex flex-wrap gap-2">
                  {item.collaborators.map((collab, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-white rounded-lg border border-slate-200">
                      {collab}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {item.tags.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-lg font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-all font-medium text-slate-700 text-sm">
              <Edit2 size={16} /> Edit
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-all font-medium text-slate-700 text-sm">
              <Share2 size={16} /> Share
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-all font-medium text-slate-700 text-sm">
              <Paperclip size={16} /> ({item.attachments})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TrendingView = () => (
  <div className="space-y-8 animate-in fade-in">
    <div>
      <h1 className="text-4xl font-bold text-slate-900">Trending & Insights</h1>
      <p className="text-slate-500 mt-1">Popular topics, assignments, and top performers</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Trending Assignments */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Flame size={24} className="text-orange-500" /> Trending Assignments
        </h3>
        <div className="space-y-4">
          {[
            { title: "Final Project Submission", course: "Software Engineering", trending: 892, icon: "🔥", difficulty: "Hard" },
            { title: "Midterm Exam Prep", course: "Mathematics III", trending: 456, icon: "📈", difficulty: "Medium" },
            { title: "Research Paper Draft", course: "English Literature", trending: 234, icon: "📝", difficulty: "Hard" },
            { title: "Lab Report Analysis", course: "Physics Lab", trending: 123, icon: "🧪", difficulty: "Medium" }
          ].map((item, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:border-orange-200 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.course}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Trending</p>
                  <p className="text-lg font-bold text-orange-500">{item.trending}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                  item.difficulty === 'Hard' ? 'bg-red-100 text-red-700' :
                  item.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {item.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <TrendingUp size={24} className="text-emerald-500" /> Top Performers
        </h3>
        <div className="space-y-3">
          {[
            { name: "Alice Chen", score: 98, avatar: "🎯", rank: 1 },
            { name: "Bob Wilson", score: 96, avatar: "🏆", rank: 2 },
            { name: "Charlie Brown", score: 94, avatar: "⭐", rank: 3 },
            { name: "Diana Prince", score: 92, avatar: "💎", rank: 4 },
            { name: "Ethan Hunt", score: 90, avatar: "🚀", rank: 5 }
          ].map((performer, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
              <span className="text-2xl">{performer.avatar}</span>
              <div className="flex-1">
                <p className="font-bold text-slate-900">{performer.name}</p>
                <p className="text-xs text-slate-500">Rank #{performer.rank}</p>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">{performer.score}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Popular Courses */}
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
        <BookOpen size={24} className="text-blue-500" /> Popular Courses This Week
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { name: "UX Design Fundamentals", enrollment: 2450, growth: "+12%", difficulty: "Beginner" },
          { name: "Advanced Algorithm Design", enrollment: 1823, growth: "+8%", difficulty: "Advanced" },
          { name: "Data Science Basics", enrollment: 3201, growth: "+15%", difficulty: "Intermediate" },
          { name: "Web Development Pro", enrollment: 2890, growth: "+10%", difficulty: "Intermediate" }
        ].map((course, idx) => (
          <div key={idx} className="p-4 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl border border-slate-200 hover:shadow-md transition-all">
            <h4 className="font-bold text-slate-900 mb-2">{course.name}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Enrollment</span>
                <span className="font-bold text-slate-900">{course.enrollment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Weekly Growth</span>
                <span className="font-bold text-emerald-600">{course.growth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Level</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  course.difficulty === 'Advanced' ? 'bg-red-100 text-red-700' :
                  course.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {course.difficulty}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Trending Topics */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Tag size={24} className="text-purple-500" /> Trending Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            "#DeepLearning",
            "#Machine Learning",
            "#ReactJS",
            "#WebDev",
            "#DataScience",
            "#Cloud Computing",
            "#AI Ethics",
            "#Mobile Dev",
            "#DevOps",
            "#REST APIs"
          ].map((topic, idx) => (
            <span key={idx} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-bold hover:shadow-md transition-all cursor-pointer">
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Study Groups */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Users size={24} className="text-indigo-500" /> Active Study Groups
        </h3>
        <div className="space-y-3">
          {[
            { name: "Data Structures Mastery", members: 234, topic: "Algorithms", active: true },
            { name: "Web Dev Bootcamp", members: 456, topic: "Frontend & Backend", active: true },
            { name: "ML Research Lab", members: 189, topic: "Deep Learning", active: false },
            { name: "Competitive Programming", members: 312, topic: "Problem Solving", active: true }
          ].map((group, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-200 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-slate-900">{group.name}</p>
                  <p className="text-xs text-slate-500">{group.topic}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${group.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">{group.members} members</span>
                <button className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all">
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const NavItemEnhanced = ({ icon, label, active, onClick, darkMode }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
      active
        ? `bg-teal-50 text-teal-700 ${darkMode ? 'bg-teal-900/30 text-teal-400' : ''}`
        : `text-slate-500 hover:text-slate-700 ${darkMode ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700' : 'hover:bg-slate-50'}`
    }`}
  >
    {icon} <span className="flex-1 text-left">{label}</span>
    {active && <ChevronRight size={18} />}
  </button>
);

const MessagesViewAdvanced = ({ showComposeModal, setShowComposeModal, composeMessage, setComposeMessage }) => (
  <div className="space-y-6 animate-in fade-in h-[calc(100vh-200px)] flex flex-col">
    <div>
      <h1 className="text-4xl font-bold text-slate-900">Inbox Aggregator</h1>
      <p className="text-slate-500 mt-1">Unified messages from all your platforms</p>
    </div>

    <div className="bg-white rounded-2xl flex-1 border border-slate-200 flex overflow-hidden shadow-sm">
      <div className="w-80 border-r border-slate-100 overflow-y-auto hidden md:flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            <input type="text" placeholder="Search..." className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {[
            { from: "Prof. Sarah", subject: "Room Change", icon: "📧", time: "10m ago", unread: false },
            { from: "Study Group", subject: "Lab tomorrow?", icon: "💬", time: "1h ago", unread: true },
            { from: "University Admin", subject: "Tuition Fees", icon: "📬", time: "Yesterday", unread: false },
          ].map((msg, i) => (
            <div key={i} className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-all ${i === 0 ? 'bg-teal-50/30' : ''}`}>
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{msg.icon}</span>
                  <span className="font-bold text-sm">{msg.from}</span>
                </div>
                {msg.unread && <div className="w-2 h-2 bg-teal-500 rounded-full" />}
              </div>
              <p className="text-xs text-slate-400 uppercase mb-1">{msg.time}</p>
              <p className="text-xs text-slate-500 truncate">{msg.subject}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-teal-50 rounded-full flex items-center justify-center mb-4">
          <Mail className="text-teal-500" size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Select a conversation</h3>
        <p className="text-slate-500 mt-2 max-w-sm">Messages from Canvas, Gmail, WhatsApp, and more - all in one unified inbox</p>
        <button onClick={() => setShowComposeModal(true)} className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-all">
          Compose New
        </button>
      </div>
    </div>

    {/* Compose Modal */}
    {showComposeModal && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
        <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Compose New Message</h3>
            <button onClick={() => setShowComposeModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
              <X size={24} className="text-slate-600" />
            </button>
          </div>

          <div className="space-y-4">
            {/* To Field */}
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">To:</label>
              <input
                type="text"
                placeholder="Add recipients (comma separated)..."
                value={composeMessage.recipients}
                onChange={(e) => setComposeMessage({ ...composeMessage, recipients: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-xs text-slate-500 mt-1">Tip: Add multiple recipients separated by commas</p>
            </div>

            {/* Subject Field */}
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Subject:</label>
              <input
                type="text"
                placeholder="Message subject..."
                value={composeMessage.subject}
                onChange={(e) => setComposeMessage({ ...composeMessage, subject: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Message:</label>
              <textarea
                placeholder="Type your message here..."
                value={composeMessage.message}
                onChange={(e) => setComposeMessage({ ...composeMessage, message: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-48 resize-none"
              />
            </div>

            {/* Attachments & CC */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-slate-600 font-medium">
                <Paperclip size={18} /> Add Attachment
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all text-slate-600 font-medium">
                <Users size={18} /> CC/BCC
              </button>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Send via:</label>
              <div className="flex gap-2 flex-wrap">
                {[
                  { name: "Email", icon: "📧", color: "red" },
                  { name: "WhatsApp", icon: "💬", color: "green" },
                  { name: "Slack", icon: "💼", color: "blue" },
                  { name: "Canvas", icon: "🎓", color: "purple" }
                ].map(platform => (
                  <button key={platform.name} className="px-4 py-2 rounded-lg border-2 border-slate-200 hover:border-teal-500 font-medium text-sm transition-all hover:bg-teal-50">
                    {platform.icon} {platform.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowComposeModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-bold hover:bg-slate-50 transition-all"
              >
                Discard
              </button>
              <button
                onClick={() => {
                  alert(`Message sent to: ${composeMessage.recipients}\nSubject: ${composeMessage.subject}`);
                  setShowComposeModal(false);
                  setComposeMessage({ recipients: '', subject: '', message: '' });
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Send size={18} /> Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

const SettingsView = ({ darkMode, setDarkMode }) => (
  <div className="space-y-8 animate-in fade-in">
    <div>
      <h1 className="text-4xl font-bold text-slate-900">Settings & Preferences</h1>
      <p className="text-slate-500 mt-1">Customize your experience</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Theme */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-lg mb-4">Appearance</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-teal-600" />
            <span className="font-medium text-slate-700">Dark Mode</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-teal-600" />
            <span className="font-medium text-slate-700">Compact View</span>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h3 className="font-bold text-lg mb-4">Notifications</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-teal-600" />
            <span className="font-medium text-slate-700">Push Notifications</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-teal-600" />
            <span className="font-medium text-slate-700">Email Alerts</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-teal-600" />
            <span className="font-medium text-slate-700">Sound Notifications</span>
          </label>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
      <p className="text-sm text-blue-900">More settings coming soon! We're continuously improving your experience.</p>
    </div>
  </div>
);

export default App;