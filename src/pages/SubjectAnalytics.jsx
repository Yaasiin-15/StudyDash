import  { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart as BarChartIcon, 
  Award, 
  Clock, 
  FileText, 
  BookOpen, 
  CheckCircle,
  Zap,
  PieChart,
  Info,
  TrendingUp,
  Calendar as CalendarIcon
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

// Chart.js options
const responsive = true;
const beginAtZero = true;
const display = true;

const SubjectAnalytics = () => {
  const { getSubjectAnalytics, darkMode, assignments, grades, tasks, resources } = useApp();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [studyTasks, setStudyTasks] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [timeSpentData, setTimeSpentData] = useState([0, 0, 0, 0, 0, 0, 0]);
  
  // Load study tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('studydash_study_tasks');
    if (savedTasks) {
      setStudyTasks(JSON.parse(savedTasks));
    }
    
    // Load calendar events/time slots
    const savedTimeSlots = localStorage.getItem('studydash_time_slots');
    if (savedTimeSlots) {
      setCalendarEvents(JSON.parse(savedTimeSlots));
    }
  }, []);
  
  // Calculate time spent per subject over the last 7 days
  useEffect(() => {
    if (selectedSubject) {
      // Create array of the last 7 days
      const last7Days = Array.from({length: 7}, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      // Calculate time spent for selected subject for each day
      const timeByDay = last7Days.map(day => {
        // Get time slots for this day and subject
        const subjectSlots = calendarEvents.filter(slot => 
          slot.date === day && 
          (slot.title.toLowerCase().includes(selectedSubject.toLowerCase()) || 
           slot.description?.toLowerCase().includes(selectedSubject.toLowerCase()))
        );
        
        // Calculate total minutes
        return subjectSlots.reduce((total, slot) => {
          const [startHour, startMin] = slot.start.split(':').map(Number);
          const [endHour, endMin] = slot.end.split(':').map(Number);
          
          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;
          
          return total + (endMinutes - startMinutes);
        }, 0);
      });
      
      setTimeSpentData(timeByDay);
    }
  }, [selectedSubject, calendarEvents]);
  
  // Get composite data across all sources
  const getCompositeSubjectData = () => {
    // Get all unique subjects from various sources
    const allSubjects = new Set([
      ...assignments.map(a => a.course),
      ...grades.map(g => g.course),
      ...tasks.filter(t => t.title.includes(':')).map(t => t.title.split(':')[0].trim()),
      ...resources.map(r => r.category),
      ...studyTasks.map(t => t.subject || t.course).filter(Boolean)
    ]);
    
    // Create subject data map
    return Array.from(allSubjects).filter(Boolean).map(subject => {
      // Get assignments for this subject
      const subjectAssignments = assignments.filter(a => a.course === subject);
      const completedAssignments = subjectAssignments.filter(a => a.status === 'completed').length;
      
      // Get study tasks for this subject
      const subjectStudyTasks = studyTasks.filter(t => 
        (t.subject === subject || t.course === subject) && t.isAssignment
      );
      const completedStudyTasks = subjectStudyTasks.filter(t => t.status === 'completed').length;
      
      // Get grades for this subject
      const subjectGrades = grades.filter(g => g.course === subject);
      const gradesData = subjectGrades.map(g => ({ score: g.score, maxScore: g.maxScore }));
      
      // Calculate average grade
      let averageGrade = 0;
      if (gradesData.length > 0) {
        const total = gradesData.reduce((acc, grade) => acc + (grade.score / grade.maxScore) * 100, 0);
        averageGrade = Math.round(total / gradesData.length);
      }
      
      // Get tasks for this subject (by looking for "Subject:" prefix in title)
      const subjectTasks = tasks.filter(t => t.title.includes(`${subject}:`));
      const completedTasks = subjectTasks.filter(t => t.completed).length;
      
      // Get resources for this subject
      const subjectResources = resources.filter(r => r.category === subject);
      
      // Get time slots for this subject
      const subjectTimeSlots = calendarEvents.filter(slot => 
        slot.title.toLowerCase().includes(subject.toLowerCase()) ||
        slot.description?.toLowerCase().includes(subject.toLowerCase())
      );
      
      // Calculate total study time in minutes
      const totalStudyTime = subjectTimeSlots.reduce((total, slot) => {
        const [startHour, startMin] = slot.start.split(':').map(Number);
        const [endHour, endMin] = slot.end.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        return total + (endMinutes - startMinutes);
      }, 0);
      
      // Calculate total XP (rough estimate based on completed items)
      const totalXp = completedAssignments * 5 + completedTasks * 5 + completedStudyTasks * 3;
      
      return {
        subject,
        assignments: subjectAssignments.length,
        completedAssignments,
        studyTasks: subjectStudyTasks.length,
        completedStudyTasks,
        grades: gradesData,
        averageGrade,
        totalXp,
        tasks: subjectTasks.length,
        completedTasks,
        resources: subjectResources.length,
        totalStudyTime,
        studyHours: Math.floor(totalStudyTime / 60),
        studyMinutes: totalStudyTime % 60
      };
    });
  };
  
  const subjectAnalytics = useMemo(() => getCompositeSubjectData(), [
    assignments, grades, tasks, resources, studyTasks, calendarEvents
  ]);
  
  // Sort subjects by total XP
  const sortedSubjects = [...subjectAnalytics].sort((a, b) => b.totalXp - a.totalXp);
  
  // Selected subject data
  const selectedSubjectData = selectedSubject 
    ? subjectAnalytics.find(s => s.subject === selectedSubject)
    : null;
  
  // Prepare data for the grade distribution chart
  const gradeDistributionData = {
    labels: ['90-100%', '80-89%', '70-79%', '60-69%', 'Below 60%'],
    datasets: [
      {
        label: 'Number of Grades',
        data: [0, 0, 0, 0, 0], // Default empty data
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',  // green/emerald
          'rgba(14, 165, 233, 0.8)',  // blue/sky
          'rgba(245, 158, 11, 0.8)',  // yellow/amber
          'rgba(249, 115, 22, 0.8)',  // orange
          'rgba(239, 68, 68, 0.8)',   // red
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(14, 165, 233)',
          'rgb(245, 158, 11)',
          'rgb(249, 115, 22)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  if (selectedSubjectData && selectedSubjectData.grades.length > 0) {
    // Count grades in each range
    const gradeCounts = [0, 0, 0, 0, 0]; // [90-100, 80-89, 70-79, 60-69, <60]
    
    selectedSubjectData.grades.forEach(grade => {
      const percentage = (grade.score / grade.maxScore) * 100;
      if (percentage >= 90) gradeCounts[0]++;
      else if (percentage >= 80) gradeCounts[1]++;
      else if (percentage >= 70) gradeCounts[2]++;
      else if (percentage >= 60) gradeCounts[3]++;
      else gradeCounts[4]++;
    });
    
    gradeDistributionData.datasets[0].data = gradeCounts;
  }
  
  // Prepare data for the task completion pie chart
  const taskCompletionData = useMemo(() => {
    const data = {
      labels: ['Completed', 'Pending'],
      datasets: [
        {
          data: [0, 0],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',  // green/emerald
            'rgba(239, 68, 68, 0.8)',   // red
          ],
          borderColor: [
            'rgb(16, 185, 129)',
            'rgb(239, 68, 68)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    if (selectedSubjectData) {
      data.datasets[0].data = [
        selectedSubjectData.completedTasks + selectedSubjectData.completedAssignments + selectedSubjectData.completedStudyTasks,
        (selectedSubjectData.tasks - selectedSubjectData.completedTasks) + 
        (selectedSubjectData.assignments - selectedSubjectData.completedAssignments) +
        (selectedSubjectData.studyTasks - selectedSubjectData.completedStudyTasks)
      ];
    }
    
    return data;
  }, [selectedSubjectData]);
  
  // Prepare data for the time spent chart 
  const timeSpentChartData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Today'],
    datasets: [
      {
        label: 'Study Time (minutes)',
        data: timeSpentData,
        borderColor: 'rgba(168, 85, 247, 0.8)', // purple
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(168, 85, 247, 1)',
        pointBorderColor: darkMode ? '#1f2937' : '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };
  
  // Prepare data for the XP by subject chart
  const xpBySubjectData = useMemo(() => {
    const colors = [
      'rgba(14, 165, 233, 0.8)',  // blue/sky
      'rgba(168, 85, 247, 0.8)',  // purple
      'rgba(16, 185, 129, 0.8)',  // green/emerald
      'rgba(245, 158, 11, 0.8)',  // yellow/amber
      'rgba(249, 115, 22, 0.8)',  // orange
      'rgba(239, 68, 68, 0.8)',   // red
      'rgba(236, 72, 153, 0.8)',  // pink
    ];
    
    return {
      labels: sortedSubjects.map(s => s.subject),
      datasets: [
        {
          label: 'XP Earned',
          data: sortedSubjects.map(s => s.totalXp),
          backgroundColor: sortedSubjects.map((_, i) => colors[i % colors.length]),
          borderWidth: 1,
        },
      ],
    };
  }, [sortedSubjects]);
  
  const chartOptions = {
    responsive,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#f3f4f6' : '#1f2937',
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: darkMode ? '#f3f4f6' : '#1f2937',
        bodyColor: darkMode ? '#d1d5db' : '#4b5563',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
      }
    },
    scales: {
      y: {
        beginAtZero,
        ticks: {
          color: darkMode ? '#d1d5db' : '#4b5563',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        ticks: {
          color: darkMode ? '#d1d5db' : '#4b5563',
        },
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        }
      }
    }
  };
  
  const lineChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        title: {
          display,
          text: 'Minutes',
          color: darkMode ? '#d1d5db' : '#4b5563',
        }
      }
    }
  };
  
  const pieOptions = {
    responsive,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? '#f3f4f6' : '#1f2937',
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: darkMode ? '#f3f4f6' : '#1f2937',
        bodyColor: darkMode ? '#d1d5db' : '#4b5563',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-fuchsia-500 to-primary-600 dark:from-fuchsia-600 dark:to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Subject Analytics</h1>
            <p className="mt-1 text-white/80">Comprehensive performance analysis across all your subjects</p>
          </div>
        </div>
      </div>

      {subjectAnalytics.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="md:col-span-3 lg:col-span-5">
              <div className="card h-full">
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <BarChartIcon size={20} className="text-primary-500 dark:text-primary-400" />
                  <span>XP by Subject</span>
                </h2>
                <div className="h-64">
                  <Bar data={xpBySubjectData} options={chartOptions} />
                </div>
              </div>
            </div>
            
            <div className="md:col-span-1 lg:col-span-2">
              <div className="card h-full">
                <h2 className="text-lg font-medium mb-4">Subject Overview</h2>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {sortedSubjects.map(subject => (
                    <button
                      key={subject.subject}
                      className={`p-3 w-full text-left rounded-lg border transition-all hover-scale
                        ${selectedSubject === subject.subject 
                          ? 'border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20' 
                          : 'border-gray-200 hover:border-primary-300 dark:border-gray-700 dark:hover:border-primary-500'}
                      `}
                      onClick={() => setSelectedSubject(subject.subject)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{subject.subject}</span>
                        <div className="flex flex-col items-end">
                          <span className="text-xs bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 px-2 py-0.5 rounded-full">
                            {subject.totalXp} XP
                          </span>
                          {subject.studyHours > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {subject.studyHours}h {subject.studyMinutes}m
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {selectedSubjectData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                      <Award size={24} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Average Grade</div>
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {selectedSubjectData.averageGrade ? `${selectedSubjectData.averageGrade}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <FileText size={24} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Academic Tasks</div>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedSubjectData.completedAssignments + selectedSubjectData.completedStudyTasks}/
                        {selectedSubjectData.assignments + selectedSubjectData.studyTasks}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-lg">
                      <Clock size={24} className="text-fuchsia-600 dark:text-fuchsia-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Study Time</div>
                      <div className="text-2xl font-bold text-fuchsia-600 dark:text-fuchsia-400">
                        {selectedSubjectData.studyHours}h {selectedSubjectData.studyMinutes}m
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card hover-lift">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <BookOpen size={24} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Resources</div>
                      <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {selectedSubjectData.resources}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Award size={20} className="text-primary-500 dark:text-primary-400" />
                    <span>Grade Distribution</span>
                  </h2>
                  
                  {selectedSubjectData.grades.length > 0 ? (
                    <div className="h-64">
                      <Bar data={gradeDistributionData} options={chartOptions} />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <p>No grades recorded for this subject yet</p>
                    </div>
                  )}
                </div>
                
                <div className="card">
                  <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <PieChart size={20} className="text-primary-500 dark:text-primary-400" />
                    <span>Task Completion</span>
                  </h2>
                  
                  {selectedSubjectData.tasks > 0 || selectedSubjectData.assignments > 0 || selectedSubjectData.studyTasks > 0 ? (
                    <div className="h-64">
                      <Pie data={taskCompletionData} options={pieOptions} />
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <p>No tasks or assignments for this subject yet</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="card">
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-secondary-500 dark:text-secondary-400" />
                  <span>Weekly Study Time</span>
                </h2>
                
                {timeSpentData.some(time => time > 0) ? (
                  <div className="h-64">
                    <Line data={timeSpentChartData} options={lineChartOptions} />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <CalendarIcon size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p>No study sessions recorded in calendar for this subject</p>
                      <p className="text-sm mt-2">Add time slots in Calendar to track your study time</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="card">
                <h2 className="text-lg font-medium mb-4">Performance Insights</h2>
                
                <div className="space-y-4">
                  {selectedSubjectData.averageGrade > 0 && (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                      <h3 className="font-medium text-primary-700 dark:text-primary-400 mb-2">Grade Performance</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedSubjectData.averageGrade >= 90 
                          ? 'Excellent work You\'re performing at an A level in this subject.' 
                          : selectedSubjectData.averageGrade >= 80
                          ? 'Good job You\'re maintaining a solid B average in this subject.' 
                          : selectedSubjectData.averageGrade >= 70
                          ? 'You\'re doing okay with a C average. Consider focusing more study time here.' 
                          : 'This subject needs more attention as your grade average is below C level.'}
                      </p>
                    </div>
                  )}
                  
                  {(selectedSubjectData.tasks > 0 || selectedSubjectData.assignments > 0 || selectedSubjectData.studyTasks > 0) && (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                      <h3 className="font-medium text-emerald-700 dark:text-emerald-400 mb-2">Task Completion</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {(selectedSubjectData.completedTasks + selectedSubjectData.completedAssignments + selectedSubjectData.completedStudyTasks) / 
                        (selectedSubjectData.tasks + selectedSubjectData.assignments + selectedSubjectData.studyTasks) >= 0.8
                          ? 'Great job staying on top of your work You\'ve completed most of your tasks and assignments.'
                          : (selectedSubjectData.completedTasks + selectedSubjectData.completedAssignments + selectedSubjectData.completedStudyTasks) / 
                            (selectedSubjectData.tasks + selectedSubjectData.assignments + selectedSubjectData.studyTasks) >= 0.5
                          ? 'You\'re making good progress on your tasks, but have some work remaining.'
                          : 'You have several incomplete tasks and assignments. Consider creating a plan to catch up.'}
                      </p>
                    </div>
                  )}
                  
                  {selectedSubjectData.totalStudyTimeMinutes > 0 && (
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                      <h3 className="font-medium text-fuchsia-700 dark:text-fuchsia-400 mb-2">Study Time Analysis</h3>
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedSubjectData.totalStudyTimeMinutes >= 300 
                          ? 'You\'ve dedicated significant time to studying this subject, which is excellent for retention and mastery.'
                          : selectedSubjectData.totalStudyTimeMinutes >= 120
                          ? 'You\'ve put in a good amount of study time, but could benefit from more consistent sessions.'
                          : 'Your recorded study time for this subject is relatively low. Consider scheduling more dedicated study sessions.'}
                      </p>
                    </div>
                  )}
                  
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                    <h3 className="font-medium text-secondary-700 dark:text-secondary-400 mb-2">Recommendations</h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      {selectedSubjectData.averageGrade < 70 && (
                        <li className="flex items-start gap-2">
                          <BookOpen size={16} className="text-secondary-500 dark:text-secondary-400 mt-0.5 flex-shrink-0" />
                          <span>Consider scheduling more study sessions for this subject.</span>
                        </li>
                      )}
                      
                      {(selectedSubjectData.totalStudyTimeMinutes < 120 && selectedSubjectData.averageGrade < 80) && (
                        <li className="flex items-start gap-2">
                          <Clock size={16} className="text-secondary-500 dark:text-secondary-400 mt-0.5 flex-shrink-0" />
                          <span>Increase your study time for this subject to improve your understanding and grades.</span>
                        </li>
                      )}
                      
                      {(selectedSubjectData.tasks - selectedSubjectData.completedTasks) > 2 && (
                        <li className="flex items-start gap-2">
                          <CheckCircle size={16} className="text-secondary-500 dark:text-secondary-400 mt-0.5 flex-shrink-0" />
                          <span>You have several pending tasks. Focus on completing these before taking on new work.</span>
                        </li>
                      )}
                      
                      {(selectedSubjectData.assignments - selectedSubjectData.completedAssignments) > 1 && (
                        <li className="flex items-start gap-2">
                          <FileText size={16} className="text-secondary-500 dark:text-secondary-400 mt-0.5 flex-shrink-0" />
                          <span>Prioritize completing your pending assignments in the next few days.</span>
                        </li>
                      )}
                      
                      {(selectedSubjectData.studyTasks - selectedSubjectData.completedStudyTasks) > 2 && (
                        <li className="flex items-start gap-2">
                          <BookOpen size={16} className="text-secondary-500 dark:text-secondary-400 mt-0.5 flex-shrink-0" />
                          <span>You have several incomplete study tasks. Create a schedule to tackle them systematically.</span>
                        </li>
                      )}
                      
                      {selectedSubjectData.resources === 0 && (
                        <li className="flex items-start gap-2">
                          <Info size={16} className="text-secondary-500 dark:text-secondary-400 mt-0.5 flex-shrink-0" />
                          <span>You haven't added any resources for this subject. Consider adding some to improve your study materials.</span>
                        </li>
                      )}
                      
                      {/* Default recommendations */}
                      <li className="flex items-start gap-2">
                        <CalendarIcon size={16} className="text-secondary-500 dark:text-secondary-400 mt-0.5 flex-shrink-0" />
                        <span>Schedule regular review sessions in your calendar to maintain knowledge.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-8">
              <BarChartIcon size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Select a Subject</h3>
              <p className="text-gray-500 dark:text-gray-400">Choose a subject from the list above to view detailed analytics and insights.</p>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-12">
          <img 
            src="https://images.unsplash.com/photo-1472289065668-ce650ac443d2?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc3R1ZGVudCUyMGRlc2slMjBzdHVkeSUyMGFuYWx5dGljcyUyMGRhdGF8ZW58MHx8fHwxNzQ2MTE1OTAwfDA&ixlib=rb-4.0.3&fit=fillmax&h=500&w=800"
            alt="Two gray pencils on yellow surface"
            className="mx-auto mb-6 h-32 w-auto rounded-lg shadow-md" 
          />
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-3">No Subject Data Available</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Start adding tasks, assignments, and grades to see analytics by subject. Make sure to categorize your entries consistently.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <a href="/assignments" className="btn btn-primary">Add Assignments</a>
            <a href="/grades" className="btn btn-outline">Add Grades</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectAnalytics;
 