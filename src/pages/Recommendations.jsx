import { useState } from 'react';
import {
  ExternalLink,
  Edit,
  Check,
  Clock,
  Calendar,
  Book,
  BookOpen,
  Sparkles,
  Layout,
  MessageSquare,
  Smartphone,
  Coffee,
  Languages,
  Activity,
} from 'lucide-react';



const Recommendations = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'all',
    'productivity',
    'learning',
    'collaboration',
    'writing',
    'organization'
  ];

  const tools = [
    {
      name: 'Revizly',
      description: 'Interactive flashcards and spaced repetition for better memory retention.',
      category: 'learning',
      url: 'https://revizly.com',
      icon: <Sparkles className="text-blue-500" />,
      tags: ['flashcards', 'memory', 'study']
    },
    {
      name: 'Canva',
      description: 'Create beautiful study visuals, presentations, and infographics easily.',
      category: 'productivity',
      url: 'https://canva.com',
      icon: <Edit className="text-purple-500" />,
      tags: ['design', 'presentations', 'visuals']
    },
    {
      name: 'Microsoft Ecosystem',
      description: 'Office 365, OneDrive, and Teams for seamless integration across devices.',
      category: 'productivity',
      url: 'https://microsoft.com/microsoft-365',
      icon: <Layout className="text-blue-600" />,
      tags: ['office', 'documents', 'collaboration']
    },
    {
      name: 'Trello',
      description: 'Visual project management with boards, lists, and cards to organize your tasks.',
      category: 'organization',
      url: 'https://trello.com',
      icon: <Layout className="text-blue-400" />,
      tags: ['kanban', 'projects', 'tasks']
    },
    {
      name: 'Google Calendar',
      description: 'Keep track of your schedule, deadlines, and events across all your devices.',
      category: 'organization',
      url: 'https://calendar.google.com',
      icon: <Calendar className="text-green-500" />,
      tags: ['schedule', 'time management', 'reminders']
    },
    {
      name: 'Notion',
      description: 'All-in-one workspace for notes, tasks, databases, and knowledge management.',
      category: 'productivity',
      url: 'https://notion.so',
      icon: <Book className="text-gray-800" />,
      tags: ['notes', 'wiki', 'database']
    },
    {
      name: 'Anki',
      description: 'Powerful spaced repetition flashcard app for memorizing facts efficiently.',
      category: 'learning',
      url: 'https://apps.ankiweb.net',
      icon: <Sparkles className="text-orange-500" />,
      tags: ['flashcards', 'memory', 'study']
    },
    {
      name: 'Todoist',
      description: 'Task manager and to-do list app that helps you stay organized and productive.',
      category: 'organization',
      url: 'https://todoist.com',
      icon: <Check className="text-red-500" />,
      tags: ['tasks', 'to-do', 'productivity']
    },
    {
      name: 'Slack',
      description: 'Messaging platform for study groups and project collaboration.',
      category: 'collaboration',
      url: 'https://slack.com',
      icon: <MessageSquare className="text-purple-600" />,
      tags: ['communication', 'teams', 'messaging']
    },
    {
      name: 'Forest',
      description: 'Stay focused by planting virtual trees that grow while you work.',
      category: 'productivity',
      url: 'https://forestapp.cc',
      icon: <Smartphone className="text-green-600" />,
      tags: ['focus', 'pomodoro', 'distraction-free']
    },
    {
      name: 'Habitica',
      description: 'Turn your goals and habits into a fun RPG game with rewards and penalties.',
      category: 'productivity',
      url: 'https://habitica.com',
      icon: <Activity className="text-indigo-500" />,
      tags: ['gamification', 'habits', 'goals']
    },
    {
      name: 'Overleaf',
      description: 'Online LaTeX editor for scientific and academic writing and collaboration.',
      category: 'writing',
      url: 'https://overleaf.com',
      icon: <Edit className="text-green-700" />,
      tags: ['latex', 'academic', 'papers']
    },
    {
      name: 'Grammarly',
      description: 'Writing assistant that helps with grammar, spelling, and style improvements.',
      category: 'writing',
      url: 'https://grammarly.com',
      icon: <Edit className="text-green-500" />,
      tags: ['grammar', 'proofreading', 'writing']
    },
    {
      name: 'Khan Academy',
      description: 'Free educational content covering math, science, and more with video lessons.',
      category: 'learning',
      url: 'https://khanacademy.org',
      icon: <BookOpen className="text-blue-700" />,
      tags: ['tutorials', 'lessons', 'learning']
    },
    {
      name: 'Duolingo',
      description: 'Fun and effective way to learn new languages through gamified lessons.',
      category: 'learning',
      url: 'https://duolingo.com',
      icon: <Languages className="text-green-500" />,
      tags: ['languages', 'learning', 'gamification']
    }
  ];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">StudyDash Recommends</h1>
            <p className="mt-1 text-white/80">Tools and apps to complement your productivity and learning journey</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-4">
          <div className="card p-4">
            <h2 className="font-medium mb-3">Categories</h2>
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeCategory === category
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  <span className="capitalize">{category}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
            <h3 className="font-medium text-purple-800 mb-2">Why These Tools?</h3>
            <p className="text-sm text-purple-700">
              We've carefully selected these applications based on their effectiveness, user-friendly interfaces, and ability to complement StudyDash's features.
            </p>
            <p className="text-sm text-purple-700 mt-2">
              Many are free or offer generous free tiers that provide excellent value for students.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="card mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for tools, categories, or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTools.length > 0 ? (
              filteredTools.map(tool => (
                <div key={tool.name} className="card hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-lg bg-gray-100">
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium">{tool.name}</h3>
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-700"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs capitalize">
                          {tool.category}
                        </span>
                        {tool.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 card p-8 text-center text-gray-500">
                <Coffee size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-1">No tools found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="card bg-gradient-to-br from-gray-50 to-white">
        <h2 className="text-lg font-medium mb-4">How These Tools Work With StudyDash</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <div className="w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mb-3">
              <Calendar size={24} />
            </div>
            <h3 className="font-medium mb-1">Time Management</h3>
            <p className="text-sm text-gray-600">
              Tools like Google Calendar and Forest complement StudyDash's calendar by helping you schedule focused study sessions and track your time commitments.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="w-12 h-12 flex items-center justify-center bg-green-100 text-green-600 rounded-full mb-3">
              <Book size={24} />
            </div>
            <h3 className="font-medium mb-1">Learning Enhancement</h3>
            <p className="text-sm text-gray-600">
              Anki, Revizly, and Khan Academy enhance your studying while StudyDash tracks your progress, helping you master challenging subjects.
            </p>
          </div>
          <div className="flex flex-col">
            <div className="w-12 h-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full mb-3">
              <Activity size={24} />
            </div>
            <h3 className="font-medium mb-1">Productivity Boost</h3>
            <p className="text-sm text-gray-600">
              Combine StudyDash's habit tracking with tools like Habitica for a gamified approach to building productive routines and achieving your goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
