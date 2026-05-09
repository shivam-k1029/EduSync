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

const SAMPLE_INSIGHTS = [
  { label: "On-Time Completion", value: "92%", trend: "+5%", icon: "📈" },
  { label: "Avg. Lead Time", value: "4.2d", trend: "-0.8d", icon: "⏱️" },
  { label: "Productivity Score", value: "8.7/10", trend: "+0.3", icon: "🎯" },
  { label: "Time Estimation Accuracy", value: "87%", trend: "+2%", icon: "🎲" }
];

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
  const [connectedPlatforms, setConnectedPlatforms] = useState(['Canvas LMS']);
  const [integrationMessages, setIntegrationMessages] = useState({});

  // --- INTEGRATION HANDLERS ---
  const handleConnect = (platformName) => {
    if (connectedPlatforms.includes(platformName)) {
      // Disconnect
      setConnectedPlatforms(connectedPlatforms.filter(p => p !== platformName));
      setIntegrationMessages({...integrationMessages, [platformName]: null});
    } else {
      // Connect - simulate OAuth flow
      const oauthUrls = {
        'Gmail': 'https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000&scope=https://www.googleapis.com/auth/gmail.readonly',
        'Slack': 'https://slack.com/oauth_authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000&scope=chat:read,chat:write',
        'WhatsApp': 'https://www.whatsapp.com/business/api',
        'Trello': 'https://trello.com/app-key',
        'Google Calendar': 'https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000&scope=https://www.googleapis.com/auth/calendar.readonly'
      };
      
      // For demo purposes, directly connect without actual OAuth
      setConnectedPlatforms([...connectedPlatforms, platformName]);
      setIntegrationMessages({...integrationMessages, [platformName]: `✓ Successfully connected to ${platformName}!`});
      
      // Simulate some data fetching
      console.log(`Connecting to ${platformName}...`);
      console.log(`OAuth URL: ${oauthUrls[platformName] || 'Not configured'}`);
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
          <p className="text-slate-500 mt-1">Your intelligent task management & analytics center</p>
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

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SAMPLE_INSIGHTS.map((insight, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-2xl">{insight.icon}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${insight.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {insight.trend}
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-3 uppercase font-semibold">{insight.label}</p>
            <p className="text-2xl font-bold mt-1">{insight.value}</p>
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

        <div className={`m-4 p-4 rounded-2xl ${darkMode ? 'bg-slate-700' : 'bg-teal-50'} border ${darkMode ? 'border-slate-600' : 'border-teal-200'}`}>
          <p className={`text-xs font-semibold uppercase mb-3 ${darkMode ? 'text-slate-400' : 'text-teal-800'}`}>Connected Services</p>
          <div className="flex -space-x-2">
            {[
              { name: 'Canvas', bg: 'bg-blue-500' },
              { name: 'Gmail', bg: 'bg-red-500' },
              { name: 'WhatsApp', bg: 'bg-green-500' }
            ].map(service => (
              <div key={service.name} className={`w-8 h-8 rounded-full border-2 ${darkMode ? 'border-slate-700' : 'border-white'} flex items-center justify-center text-white text-[10px] font-bold ${service.bg}`}>
                {service.name.charAt(0)}
              </div>
            ))}
          </div>
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

      {/* Integrations Modal */}
      {showIntegrations && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className={`rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in duration-300 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Connect & Integrate</h3>
                <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Link your academic platforms for seamless synchronization</p>
              </div>
              <button onClick={() => setShowIntegrations(false)} className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                <X size={24} className={darkMode ? 'text-slate-400' : 'text-slate-600'} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Canvas LMS", icon: "🎓" },
                { name: "Gmail", icon: "📧" },
                { name: "WhatsApp", icon: "💬" },
                { name: "Slack", icon: "💼" },
                { name: "Trello", icon: "📋" },
                { name: "Google Calendar", icon: "📅" },
              ].map(platform => {
                const isConnected = connectedPlatforms.includes(platform.name);
                const message = integrationMessages[platform.name];
                return (
                  <div key={platform.name} className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    isConnected
                      ? `border-emerald-200 ${darkMode ? 'bg-slate-700' : 'bg-emerald-50'}`
                      : `border-slate-200 ${darkMode ? 'bg-slate-700 hover:border-slate-300' : 'bg-white hover:border-slate-300'}`
                  }`} onClick={() => handleConnect(platform.name)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{platform.icon}</span>
                        <div>
                          <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>{platform.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {isConnected ? 'Click to disconnect' : 'Click to connect'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConnect(platform.name);
                        }}
                        className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                          isConnected
                            ? 'bg-emerald-200 text-emerald-700 hover:bg-emerald-300'
                            : darkMode ? 'bg-slate-600 text-slate-300 hover:bg-slate-500' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {isConnected ? 'Connected' : 'Connect'}
                      </button>
                    </div>
                    {message && <p className="text-xs text-emerald-600 mt-2 font-semibold">{message}</p>}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
              <Lightbulb size={20} className="text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                <strong>Pro Tip:</strong> Connect multiple platforms to get comprehensive notifications in one place. Your data is encrypted and secure.
              </p>
            </div>

            <button onClick={() => setShowIntegrations(false)} className="w-full mt-8 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold hover:shadow-lg transition-all">
              Done
            </button>
          </div>
        </div>
      )}
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
