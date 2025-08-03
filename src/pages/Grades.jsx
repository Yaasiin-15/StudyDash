import  { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash, Award, TrendingUp, TrendingDown, Calendar, Clock, Book, AlertCircle } from 'lucide-react';

const Grades = () => {
  const { grades, addGrade, deleteGrade, tests, addTest, deleteTest, darkMode } = useApp();
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [date, setDate] = useState('');
  const [averageGrade, setAverageGrade] = useState(0);
  const [highestGrade, setHighestGrade] = useState(0);
  const [lowestGrade, setLowestGrade] = useState(0);
  
  // For test scheduling
  const [testTitle, setTestTitle] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testDate, setTestDate] = useState('');
  const [testTime, setTestTime] = useState('');
  const [testLocation, setTestLocation] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [activeTab, setActiveTab] = useState('grades');
  
  useEffect(() => {
    if (grades.length > 0) {
      // Calculate average
      const total = grades.reduce((acc, grade) => acc + (grade.score / grade.maxScore) * 100, 0);
      setAverageGrade(Math.round(total / grades.length));
      
      // Calculate highest and lowest
      const percentages = grades.map(grade => (grade.score / grade.maxScore) * 100);
      setHighestGrade(Math.round(Math.max(...percentages)));
      setLowestGrade(Math.round(Math.min(...percentages)));
    } else {
      setAverageGrade(0);
      setHighestGrade(0);
      setLowestGrade(0);
    }
  }, [grades]);

  const handleSubmitGrade = (e) => {
    e.preventDefault();
    if (title.trim() && course.trim() && score && maxScore && date) {
      addGrade({
        title: title.trim(),
        course: course.trim(),
        score: parseFloat(score),
        maxScore: parseFloat(maxScore),
        date,
      });
      resetGradeForm();
    }
  };

  const resetGradeForm = () => {
    setTitle('');
    setCourse('');
    setScore('');
    setMaxScore('100');
    setDate('');
    setIsAddingGrade(false);
  };
  
  const handleSubmitTest = (e) => {
    e.preventDefault();
    
    // Only proceed if the form is valid
    if (testTitle.trim() && testSubject.trim() && testDate) {
      // Create test directly without setTimeout
      addTest({
        title: testTitle.trim(),
        subject: testSubject.trim(),
        date,
        time,
        location,
        description,
      });
      
      // Reset form
      resetTestForm();
    }
  };
  
  const resetTestForm = () => {
    setTestTitle('');
    setTestSubject('');
    setTestDate('');
    setTestTime('');
    setTestLocation('');
    setTestDescription('');
    setIsAddingTest(false);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-500 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-500 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-500 dark:text-yellow-400';
    if (percentage >= 60) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-500 dark:text-red-400';
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };
  
  const getGradeBg = (percentage) => {
    if (percentage >= 90) return 'bg-green-100 dark:bg-green-900/20';
    if (percentage >= 80) return 'bg-blue-100 dark:bg-blue-900/20';
    if (percentage >= 70) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (percentage >= 60) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const sortedGrades = [...grades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const upcomingTests = [...tests]
    .filter(test => new Date(test.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastTests = [...tests]
    .filter(test => new Date(test.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const courseAverages = grades.length > 0 
    ? grades.reduce((acc, grade) => {
        if (!acc[grade.course]) {
          acc[grade.course] = { total: 0, count: 0 };
        }
        acc[grade.course].total += (grade.score / grade.maxScore) * 100;
        acc[grade.course].count += 1;
        return acc;
      }, {})
    : {};
    
  // Get course list for dropdowns
  const courses = [...new Set([...grades.map(g => g.course), ...tests.map(t => t.subject)])];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl p-6 text-white shadow-lg dark:from-amber-700 dark:to-amber-600">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Grades & Tests</h1>
            <p className="mt-1 text-white/80">Manage your academic performance and upcoming tests</p>
          </div>
          <div className="flex gap-2">
            <button 
              className={`btn ${activeTab === 'grades' ? 'bg-white text-amber-600' : 'bg-white/20 text-white'} hover:bg-white/90 shadow-md dark:hover:bg-white/80`}
              onClick={() => setActiveTab('grades')}
            >
              <Award size={18} className="mr-1" />
              Grades
            </button>
            <button 
              className={`btn ${activeTab === 'tests' ? 'bg-white text-amber-600' : 'bg-white/20 text-white'} hover:bg-white/90 shadow-md dark:hover:bg-white/80`}
              onClick={() => setActiveTab('tests')}
            >
              <Book size={18} className="mr-1" />
              Tests
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'grades' ? (
        <>
          {grades.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg mr-4 dark:bg-blue-900/30">
                  <Award size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Average Grade</div>
                  <div className={`text-2xl font-bold mt-1 ${getGradeColor(averageGrade)}`}>
                    {averageGrade}% ({getGradeLetter(averageGrade)})
                  </div>
                </div>
              </div>
              
              <div className="card flex items-center">
                <div className="p-3 bg-green-100 rounded-lg mr-4 dark:bg-green-900/30">
                  <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Highest Grade</div>
                  <div className={`text-2xl font-bold mt-1 ${getGradeColor(highestGrade)}`}>
                    {highestGrade}% ({getGradeLetter(highestGrade)})
                  </div>
                </div>
              </div>
              
              <div className="card flex items-center">
                <div className="p-3 bg-red-100 rounded-lg mr-4 dark:bg-red-900/30">
                  <TrendingDown size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Lowest Grade</div>
                  <div className={`text-2xl font-bold mt-1 ${getGradeColor(lowestGrade)}`}>
                    {lowestGrade}% ({getGradeLetter(lowestGrade)})
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold dark:text-gray-200">Grades</h2>
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={() => setIsAddingGrade(true)}
            >
              <Plus size={18} />
              <span>Add Grade</span>
            </button>
          </div>

          {isAddingGrade && (
            <div className="card">
              <h2 className="text-lg font-medium mb-4 dark:text-gray-200">Add New Grade</h2>
              <form onSubmit={handleSubmitGrade}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="input"
                      placeholder="Quiz, Test, Assignment, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="input"
                      placeholder="Course name"
                      required
                      list="courseList"
                    />
                    <datalist id="courseList">
                      {courses.map(course => (
                        <option key={course} value={course} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Score</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Score</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={maxScore}
                      onChange={(e) => setMaxScore(e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={resetGradeForm}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Grade
                  </button>
                </div>
              </form>
            </div>
          )}

          {Object.keys(courseAverages).length > 0 && (
            <div className="card">
              <h2 className="text-lg font-medium mb-4 dark:text-gray-200">Course Averages</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(courseAverages).map(([course, data]) => {
                  const average = Math.round(data.total / data.count);
                  return (
                    <div key={course} className={`${getGradeBg(average)} rounded-lg p-4`}>
                      <h3 className="font-medium text-gray-700 dark:text-gray-200">{course}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xl font-bold ${getGradeColor(average)}`}>
                          {average}% ({getGradeLetter(average)})
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {data.count} {data.count === 1 ? 'grade' : 'grades'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Award size={20} className="text-primary-500 dark:text-primary-400" />
              <h2 className="text-lg font-medium dark:text-gray-200">Grade History</h2>
            </div>

            {sortedGrades.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left p-3 dark:text-gray-300">Title</th>
                      <th className="text-left p-3 dark:text-gray-300">Course</th>
                      <th className="text-left p-3 dark:text-gray-300">Date</th>
                      <th className="text-right p-3 dark:text-gray-300">Score</th>
                      <th className="text-right p-3 dark:text-gray-300">Percentage</th>
                      <th className="text-right p-3 dark:text-gray-300">Grade</th>
                      <th className="text-right p-3 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {sortedGrades.map((grade) => {
                      const percentage = Math.round((grade.score / grade.maxScore) * 100);
                      return (
                        <tr key={grade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="p-3 dark:text-gray-300">{grade.title}</td>
                          <td className="p-3 dark:text-gray-300">{grade.course}</td>
                          <td className="p-3 dark:text-gray-300">{new Date(grade.date).toLocaleDateString()}</td>
                          <td className="p-3 text-right dark:text-gray-300">{grade.score}/{grade.maxScore}</td>
                          <td className="p-3 text-right dark:text-gray-300">{percentage}%</td>
                          <td className={`p-3 text-right font-bold ${getGradeColor(percentage)}`}>
                            {getGradeLetter(percentage)}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => deleteGrade(grade.id)}
                              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            >
                              <Trash size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Award size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No grades recorded yet. Add your first grade to start tracking your progress</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold dark:text-gray-200">Upcoming Tests</h2>
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={() => setIsAddingTest(true)}
            >
              <Plus size={18} />
              <span>Schedule Test</span>
            </button>
          </div>

          {isAddingTest && (
            <div className="card">
              <h2 className="text-lg font-medium mb-4 dark:text-gray-200">Schedule a Test</h2>
              <form onSubmit={handleSubmitTest}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Test Title</label>
                    <input
                      type="text"
                      value={testTitle}
                      onChange={(e) => setTestTitle(e.target.value)}
                      className="input"
                      placeholder="Midterm, Final, Quiz, etc."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                    <input
                      type="text"
                      value={testSubject}
                      onChange={(e) => setTestSubject(e.target.value)}
                      className="input"
                      placeholder="Subject or course name"
                      required
                      list="courseList"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={testDate}
                      onChange={(e) => setTestDate(e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time (optional)</label>
                    <input
                      type="time"
                      value={testTime}
                      onChange={(e) => setTestTime(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location (optional)</label>
                    <input
                      type="text"
                      value={testLocation}
                      onChange={(e) => setTestLocation(e.target.value)}
                      className="input"
                      placeholder="Room, building, etc."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                    <textarea
                      value={testDescription}
                      onChange={(e) => setTestDescription(e.target.value)}
                      className="input h-24"
                      placeholder="Topics covered, study notes, etc."
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={resetTestForm}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Schedule Test
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Book size={20} className="text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-medium dark:text-gray-200">Upcoming Tests</h2>
              </div>
              
              {upcomingTests.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTests.map(test => {
                    const testDate = new Date(test.date);
                    const daysUntil = Math.ceil((testDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isUrgent = daysUntil <= 3;
                    
                    return (
                      <div 
                        key={test.id} 
                        className={`p-4 rounded-lg border ${isUrgent ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10' : 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/10'}`}
                      >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium dark:text-gray-200">{test.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{test.subject}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <div className="flex items-center gap-1 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                                <Calendar size={12} className="text-blue-500 dark:text-blue-400" />
                                {new Date(test.date).toLocaleDateString()}
                              </div>
                              {test.time && (
                                <div className="flex items-center gap-1 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                                  <Clock size={12} className="text-blue-500 dark:text-blue-400" />
                                  {test.time}
                                </div>
                              )}
                              {test.location && (
                                <div className="flex items-center gap-1 text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded-full">
                                  <Book size={12} className="text-blue-500 dark:text-blue-400" />
                                  {test.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${isUrgent ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                              {daysUntil === 0 ? 'Today' : 
                               daysUntil === 1 ? 'Tomorrow' : 
                               `${daysUntil} days left`}
                            </div>
                            <button
                              onClick={() => deleteTest(test.id)}
                              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                        
                        {test.description && (
                          <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-lg text-sm dark:text-gray-300">
                            {test.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Book size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>No upcoming tests scheduled.</p>
                </div>
              )}
            </div>
            
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-lg font-medium dark:text-gray-200">Past Tests</h2>
              </div>
              
              {pastTests.length > 0 ? (
                <div className="space-y-3">
                  {pastTests.map(test => (
                    <div key={test.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium dark:text-gray-200">{test.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{test.subject}</p>
                          <div className="flex items-center gap-1 text-xs mt-2">
                            <Calendar size={12} className="text-gray-500 dark:text-gray-400" />
                            <span className="dark:text-gray-400">{new Date(test.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 mb-2">
                            Completed
                          </div>
                          <button
                            onClick={() => deleteTest(test.id)}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <button
                          className="btn btn-sm btn-outline w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => {
                            setIsAddingGrade(true);
                            setTitle(test.title);
                            setCourse(test.subject);
                            setDate(test.date);
                            setActiveTab('grades');
                          }}
                        >
                          <Plus size={14} className="mr-1" />
                          Add Grade for this Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <AlertCircle size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>No past tests found.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="card bg-gradient-to-r from-gray-50 to-white p-5 dark:from-gray-800 dark:to-gray-800 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <img 
                src="https://images.unsplash.com/photo-1504198266287-1659872e6590?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxtaW5pbWFsaXN0JTIwZGFyayUyMHN0dWRlbnQlMjB3b3Jrc3BhY2UlMjB3aXRoJTIwYm9va3MlMjBhbmQlMjBsYXB0b3B8ZW58MHx8fHwxNzQ2MzM3MDU4fDA&ixlib=rb-4.0.3&fit=fillmax&h=400&w=600"
                alt="Green leaf photography"
                className="w-24 h-24 object-cover rounded-lg hidden md:block"
              />
              <div>
                <h2 className="text-lg font-medium mb-2 dark:text-gray-200">Test Preparation Tips</h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs dark:bg-blue-900/40 dark:text-blue-400">1</div>
                    <p>Create a detailed study plan at least a week before your test</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs dark:bg-blue-900/40 dark:text-blue-400">2</div>
                    <p>Break down the material into manageable sections</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs dark:bg-blue-900/40 dark:text-blue-400">3</div>
                    <p>Use active recall techniques instead of just rereading notes</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-full text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs dark:bg-blue-900/40 dark:text-blue-400">4</div>
                    <p>Get adequate rest the night before your test</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Grades;
 