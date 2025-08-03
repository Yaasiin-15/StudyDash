import  { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  startOfWeek, 
  endOfWeek,
  isSameMonth,
  isSameDay,
  isSameWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  parseISO,
  addDays,
  parse,
  startOfDay,
  differenceInMinutes,
  addMinutes
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Activity, 
  FileText, 
  Flag, 
  BookOpen, 
  Clock, 
  CheckCircle,
  List,
  Grid,
  Plus,
  X
} from 'lucide-react';





const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
  const [timeSlots, setTimeSlots] = useState(() => {
    const savedTimeSlots = localStorage.getItem('studydash_time_slots');
    return savedTimeSlots ? JSON.parse(savedTimeSlots) : [];
  });
  const [newTimeSlot, setNewTimeSlot] = useState({
    title: '',
    start: '09:00',
    end: '10:00',
    type: 'study',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    color: '#0ea5e9',
  });
  
  const { 
    tasks, 
    habits,
    journals,
    tests,
    darkMode
  } = useApp();
  
  const [studyTasks, setStudyTasks] = useState([]);
  
  // Load study tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('studydash_study_tasks');
    if (savedTasks) {
      setStudyTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save time slots to localStorage
  useEffect(() => {
    localStorage.setItem('studydash_time_slots', JSON.stringify(timeSlots));
  }, [timeSlots]);

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      // day view
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const navigatePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      // day view
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  // Generate days based on view mode
  const getDaysInView = () => {
    if (viewMode === 'month') {
      // Month view: all days in the month with padding from adjacent months
      return eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }),
      });
    } else if (viewMode === 'week') {
      // Week view: days in the current week
      return eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end: endOfWeek(currentDate, { weekStartsOn: 0 }),
      });
    } else {
      // Day view: just the current day
      return [currentDate];
    }
  };

  const days = getDaysInView();

  const getEventsForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const taskEvents = tasks
      .filter(task => task.dueDate && format(new Date(task.dueDate), 'yyyy-MM-dd') === dateStr)
      .map(task => ({
        id: `task-${task.id}`,
        title: task.title,
        type: 'task',
        status: task.completed ? 'completed' : 'not-started',
        time: task.time // Include time if available
      }));
      
    const habitEvents = habits
      .filter(habit => {
        if (habit.isGoal && habit.targetDate) {
          return format(new Date(habit.targetDate), 'yyyy-MM-dd') === dateStr;
        }
        if (habit.isGoal) {
          return habit.completedDates.includes(dateStr);
        }
        return false;
      })
      .map(habit => ({
        id: `habit-${habit.id}`,
        title: habit.title,
        type: habit.isGoal ? 'goal' : 'habit',
        status: habit.isGoal ? (habit.progress === 100 ? 'completed' : 'in-progress') : 'completed'
      }));
      
    const journalEvents = journals
      .filter(journal => format(parseISO(journal.date), 'yyyy-MM-dd') === dateStr)
      .map(journal => ({
        id: `journal-${journal.id}`,
        title: journal.title,
        type: 'journal'
      }));
      
    const testEvents = tests
      .filter(test => format(parseISO(test.date), 'yyyy-MM-dd') === dateStr)
      .map(test => ({
        id: `test-${test.id}`,
        title: test.title,
        type: 'test',
        subject: test.subject,
        time: test.time
      }));
      
    // Add study tasks
    const studyTaskEvents = studyTasks
      .filter((task) => {
        // For tasks with specific deadlines
        if (task.deadline && format(new Date(task.deadline), 'yyyy-MM-dd') === dateStr) {
          return true;
        }
        
        // For recurring tasks
        if (task.isRecurring && task.recurringDays && task.recurringDays.includes(date.getDay())) {
          return true;
        }
        
        return false;
      })
      .map((task) => ({
        id: `cal-${task.id}-${dateStr}`,
        title: task.title,
        type: task.isAssignment ? 'assignment' : 'study',
        status: task.status || 'not-started',
        priority: task.priority,
        subject: task.subject || task.course,
        duration: task.duration,
        time: task.time // Include time if available
      }));
      
    return [...taskEvents, ...habitEvents, ...journalEvents, ...testEvents, ...studyTaskEvents];
  };

  // Get time slots for a specific day
  const getTimeSlotsForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return timeSlots.filter(slot => slot.date === dateStr);
  };
  
  // Update day events when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      setDayEvents(getEventsForDay(selectedDate));
    } else {
      setDayEvents([]);
    }
  }, [selectedDate, tasks, habits, journals, tests, studyTasks]);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const handleDayClick = (day) => {
    setSelectedDate(day);
  };
  
  const getEventTypeColor = (type, status) => {
    if (type === 'task') {
      return status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    } else if (type === 'assignment' || type === 'study') {
      if (status === 'completed') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      if (status === 'in-progress') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    } else if (type === 'habit') {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    } else if (type === 'goal') {
      return status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
    } else if (type === 'journal') {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    } else if (type === 'test') {
      return 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };
  
  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'task': return <CheckCircle size={16} />;
      case 'assignment': return <FileText size={16} />;
      case 'study': return <BookOpen size={16} />;
      case 'habit': return <Activity size={16} />;
      case 'goal': return <Flag size={16} />;
      case 'journal': return <BookOpen size={16} />;
      case 'test': return <FileText size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const handleAddTimeSlot = () => {
    if (newTimeSlot.title && newTimeSlot.start && newTimeSlot.end) {
      const slotId = `timeslot-${Date.now()}`;
      const newSlot = {
        ...newTimeSlot,
        id: slotId
      };
      
      setTimeSlots([...timeSlots, newSlot]);
      
      // Reset form
      setNewTimeSlot({
        title: '',
        start: '09:00',
        end: '10:00',
        type: 'study',
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        description: '',
        color: '#0ea5e9',
      });
      
      setShowTimeSlotModal(false);
    }
  };

  const handleDeleteTimeSlot = (id) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const openAddTimeSlotModal = (date) => {
    setNewTimeSlot({
      ...newTimeSlot,
      date: format(date, 'yyyy-MM-dd')
    });
    setShowTimeSlotModal(true);
  };

  const getTimeSlotColor = (type) => {
    switch (type) {
      case 'study': return 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300';
      case 'assignment': return 'bg-indigo-100 border-indigo-500 text-indigo-800 dark:bg-indigo-900/40 dark:border-indigo-700 dark:text-indigo-300';
      case 'task': return 'bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-300';
      case 'test': return 'bg-amber-100 border-amber-500 text-amber-800 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-300';
      default: return 'bg-gray-100 border-gray-500 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300';
    }
  };

  // Generate time slots for week and day view (from 8 AM to 8 PM)
  const timeSlotHours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  // Calculate time slot height and position
  const calculateTimeSlotStyle = (start, end) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMin;
    const endTotalMinutes = endHour * 60 + endMin;
    
    // Calculate duration in minutes
    const duration = endTotalMinutes - startTotalMinutes;
    
    // Calculate top position (minutes from 8 AM)
    const topPosition = startTotalMinutes - (8 * 60);
    
    // Convert to percentage of the day view height
    const topPercentage = (topPosition / (12 * 60)) * 100;
    const heightPercentage = (duration / (12 * 60)) * 100;
    
    return {
      top: `${topPercentage}%`,
      height: `${heightPercentage}%`,
      minHeight: '30px' // Ensure minimum height for visibility
    };
  };

  // Render different calendar layouts based on view mode
  const renderCalendarView = () => {
    if (viewMode === 'month') {
      return (
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((day) => (
            <div key={day} className="text-center font-medium text-gray-600 py-2 dark:text-gray-300">
              {day}
            </div>
          ))}
          
          {days.map((day) => {
            const events = getEventsForDay(day);
            const slots = getTimeSlotsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            
            return (
              <div
                key={day.toString()}
                className={`min-h-[100px] border rounded-lg p-1 transition-colors cursor-pointer hover-scale
                  ${isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}
                  ${isToday ? 'border-primary-500 dark:border-primary-600' : 'border-gray-200 dark:border-gray-700'}
                  ${isSelected ? 'ring-2 ring-primary-500 dark:ring-primary-600' : ''}
                  hover:bg-gray-50 dark:hover:bg-gray-700
                `}
                onClick={() => handleDayClick(day)}
              >
                <div className="flex justify-between items-start">
                  <div className={`text-sm px-1 font-medium 
                    ${isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'} 
                    ${isToday ? 'text-primary-500 dark:text-primary-400' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddTimeSlotModal(day);
                    }} 
                    className="text-gray-400 hover:text-primary-600 p-0.5 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/30 dark:hover:text-primary-400"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                
                <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                  {slots.length > 0 && (
                    <div className="px-1 mb-1">
                      {slots.slice(0, 2).map((slot) => (
                        <div
                          key={slot.id}
                          className={`text-xs rounded px-1 py-0.5 mb-0.5 truncate border-l-2 ${getTimeSlotColor(slot.type)}`}
                        >
                          <div className="flex justify-between">
                            <span className="truncate">{slot.title}</span>
                            <span>{slot.start}</span>
                          </div>
                        </div>
                      ))}
                      {slots.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          +{slots.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                  
                  {events.slice(0, slots.length > 0 ? 1 : 3).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs truncate rounded px-1 py-0.5 flex items-center gap-1 ${getEventTypeColor(event.type, event.status)}`}
                    >
                      {getEventTypeIcon(event.type)}
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {events.length > (slots.length > 0 ? 1 : 3) && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium px-1">
                      +{events.length - (slots.length > 0 ? 1 : 3)} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    } else if (viewMode === 'week') {
      return (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-8 border-b dark:border-gray-700">
            <div className="p-2 border-r font-medium bg-gray-50 dark:bg-gray-700 dark:border-gray-600">Time</div>
            {days.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div 
                  key={day.toString()} 
                  className={`p-2 text-center font-medium border-r last:border-r-0 
                    ${isToday ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : ''} 
                    dark:border-gray-700`}
                >
                  <div>{format(day, 'EEE')}</div>
                  <div className={isToday ? 'text-primary-600 dark:text-primary-400 font-bold' : ''}>{format(day, 'd')}</div>
                  <button 
                    onClick={() => openAddTimeSlotModal(day)} 
                    className="text-xs mt-1 text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center gap-0.5 hover-scale"
                  >
                    <Plus size={10} />
                    <span>Add</span>
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="relative">
            {/* Hour grid lines */}
            {timeSlotHours.map((hour) => (
              <div 
                key={`grid-${hour}`} 
                className="grid grid-cols-8 border-t dark:border-gray-700"
                style={{ height: '80px' }}
              >
                <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                </div>
                
                {days.map((day, dayIndex) => (
                  <div 
                    key={`hour-${hour}-day-${dayIndex}`} 
                    className={`relative p-1 border-r last:border-r-0 ${
                      isSameDay(day, new Date()) ? 'bg-primary-50/40 dark:bg-primary-900/5' : ''
                    } dark:border-gray-700`}
                  >
                    {/* Content will be added by the slots */}
                  </div>
                ))}
              </div>
            ))}
            
            {/* Time slots */}
            {days.map((day, dayIndex) => {
              const daySlots = getTimeSlotsForDay(day);
              
              return daySlots.map(slot => {
                // Calculate position using hours from 8 AM
                const [startHour, startMin] = slot.start.split(':').map(Number);
                const [endHour, endMin] = slot.end.split(':').map(Number);
                
                const startMinutesFromMidnight = startHour * 60 + startMin;
                const endMinutesFromMidnight = endHour * 60 + endMin;
                const startMinutesFrom8AM = startMinutesFromMidnight - (8 * 60);
                const durationMinutes = endMinutesFromMidnight - startMinutesFromMidnight;
                
                // Convert to pixels (assuming each hour is 80px tall)
                const topPosition = (startMinutesFrom8AM / 60) * 80;
                const height = (durationMinutes / 60) * 80;
                
                // Calculate left position - each day column takes 1/7 of the width minus time column
                const colWidth = 100 / 7; // percentage width of each day column
                const leftPosition = (dayIndex + 1) * 12.5; // 12.5% for each column (8 columns total, first is time)
                
                return (
                  <div
                    key={slot.id}
                    className={`time-slot absolute ${getTimeSlotColor(slot.type)} shadow-sm hover:shadow-md z-10`}
                    style={{ 
                      top: `${topPosition}px`,
                      height: `${Math.max(height, 24)}px`, // Min height 24px
                      left: `${leftPosition}%`, 
                      width: '12%', // Slightly less than column width to avoid overlap
                      overflow: 'hidden'
                    }}
                  >
                    <div className="p-1 text-xs truncate h-full flex flex-col justify-between">
                      <div className="font-medium truncate">{slot.title}</div>
                      <div className="text-[10px] opacity-80">{slot.start}-{slot.end}</div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTimeSlot(slot.id);
                      }}
                      className="absolute top-0.5 right-0.5 text-gray-500 hover:text-red-500 p-0.5 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <X size={10} />
                    </button>
                  </div>
                );
              });
            })}
            
            {/* Events */}
            {days.map((day, dayIndex) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayEvents = getEventsForDay(day).filter(event => event.time);
              
              return dayEvents.map(event => {
                if (event.time) return null;
                
                // Calculate position based on time
                const [hour, minute] = event.time.split(':').map(Number);
                const minutesFromMidnight = hour * 60 + minute;
                const minutesFrom8AM = minutesFromMidnight - (8 * 60);
                
                if (minutesFrom8AM < 0 || minutesFrom8AM > 12 * 60) return null; // Skip if outside visible hours
                
                // Position is based on time
                const topPosition = (minutesFrom8AM / 60) * 80;
                
                // Calculate left position
                const leftPosition = (dayIndex + 1) * 12.5; // Same as time slots
                
                return (
                  <div
                    key={`event-${event.id}`}
                    className={`absolute px-1.5 py-1 rounded z-20 pointer-events-none ${getEventTypeColor(event.type, event.status)}`}
                    style={{ 
                      top: `${topPosition}px`,
                      height: '26px',
                      left: `${leftPosition}%`, 
                      width: '12%',
                      overflow: 'hidden'
                    }}
                  >
                    <div className="flex items-center gap-1 text-[10px]">
                      {getEventTypeIcon(event.type)}
                      <span className="truncate font-medium">{event.title}</span>
                    </div>
                  </div>
                );
              }).filter(Boolean); // Filter out null events
            })}
          </div>
        </div>
      );
    } else {
      // Day view
      const daySlots = getTimeSlotsForDay(currentDate);
      const events = getEventsForDay(currentDate);
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-3 font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 border-b dark:border-gray-700 flex justify-between items-center">
            <div>{format(currentDate, 'EEEE, MMMM d, yyyy')}</div>
            <button 
              onClick={() => openAddTimeSlotModal(currentDate)}
              className="btn btn-sm btn-primary flex items-center gap-1 hover-scale"
            >
              <Plus size={14} />
              <span>Add Time Slot</span>
            </button>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-12 min-h-[800px]">
              {/* Time labels */}
              <div className="col-span-1 border-r dark:border-gray-700">
                {timeSlotHours.map(hour => (
                  <div key={hour} className="h-[80px] p-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                  </div>
                ))}
              </div>
              
              {/* Content area */}
              <div className="col-span-11 relative">
                {/* Hour grid lines */}
                {timeSlotHours.map(hour => (
                  <div key={hour} className="absolute w-full h-[80px]" style={{ top: `${(hour - 8) * 80}px` }}>
                    <div className="border-t border-gray-100 dark:border-gray-700 h-full"></div>
                  </div>
                ))}
                
                {/* Time slots */}
                {daySlots.map(slot => {
                  const [startHour, startMinute] = slot.start.split(':').map(Number);
                  const [endHour, endMinute] = slot.end.split(':').map(Number);
                  
                  // Calculate position and height
                  const startMinutesFromMidnight = startHour * 60 + startMinute;
                  const endMinutesFromMidnight = endHour * 60 + endMinute;
                  const startMinutesFrom8AM = startMinutesFromMidnight - (8 * 60);
                  const durationMinutes = endMinutesFromMidnight - startMinutesFromMidnight;
                  
                  // Convert to pixels (assuming each hour is 80px)
                  const topPosition = (startMinutesFrom8AM / 60) * 80;
                  const height = (durationMinutes / 60) * 80;
                  
                  return (
                    <div
                      key={slot.id}
                      className={`time-slot ${getTimeSlotColor(slot.type)} absolute left-2 right-2 hover-scale z-10`}
                      style={{ 
                        top: `${topPosition}px`,
                        height: `${Math.max(height, 30)}px` // Min height 30px
                      }}
                    >
                      <div className="p-2 h-full flex flex-col justify-between">
                        <div>
                          <div className="font-medium">{slot.title}</div>
                          {slot.description && (
                            <div className="text-xs mt-1 opacity-80">{slot.description}</div>
                          )}
                        </div>
                        <div className="text-xs">
                          {slot.start} - {slot.end}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteTimeSlot(slot.id)}
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
                
                {/* Events */}
                {events
                  .filter(event => event.time)
                  .map(event => {
                    const [hour, minute] = event.time.split(':').map(Number);
                    const minutesFromMidnight = hour * 60 + minute;
                    const minutesFrom8AM = minutesFromMidnight - (8 * 60);
                    
                    // Position is based on time
                    const topPosition = (minutesFrom8AM / 60) * 80;
                    
                    return (
                      <div
                        key={event.id}
                        className={`absolute left-2 right-2 rounded-lg p-2 z-20 ${getEventTypeColor(event.type, event.status)} hover-scale`}
                        style={{ 
                          top: `${topPosition}px`,
                          height: '40px'
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(event.type)}
                            <span className="font-medium">{event.title}</span>
                          </div>
                          <span className="text-xs">{event.time}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  // Helper function to calculate duration in minutes
  const calculateDurationInMinutes = (start, end) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    
    return endTotalMinutes - startTotalMinutes;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-primary-600 dark:from-teal-600 dark:to-primary-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Calendar</h1>
            <p className="mt-1 text-white/80">View and manage all your activities in one place</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={navigatePrev} className="btn btn-outline p-2 hover-scale">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-medium">
              {viewMode === 'day' 
                ? format(currentDate, 'MMMM d, yyyy') 
                : viewMode === 'week'
                ? `${format(days[0], 'MMM d')} - ${format(days[6], 'MMM d, yyyy')}`
                : format(currentDate, 'MMMM yyyy')}
            </h2>
            <button onClick={navigateNext} className="btn btn-outline p-2 hover-scale">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className={`btn btn-sm ${viewMode === 'day' ? 'btn-primary' : 'btn-outline'} hover-scale`}
              onClick={() => setViewMode('day')}
            >
              <CalendarIcon size={16} />
              <span className="ml-1 hidden md:inline">Day</span>
            </button>
            <button 
              className={`btn btn-sm ${viewMode === 'week' ? 'btn-primary' : 'btn-outline'} hover-scale`}
              onClick={() => setViewMode('week')}
            >
              <List size={16} />
              <span className="ml-1 hidden md:inline">Week</span>
            </button>
            <button 
              className={`btn btn-sm ${viewMode === 'month' ? 'btn-primary' : 'btn-outline'} hover-scale`}
              onClick={() => setViewMode('month')}
            >
              <Grid size={16} />
              <span className="ml-1 hidden md:inline">Month</span>
            </button>
          </div>
        </div>

        {renderCalendarView()}
      </div>
      
      {selectedDate && viewMode === 'month' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">
              Events for {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            <div className="flex gap-2">
              <button 
                className="btn btn-sm btn-primary flex items-center gap-1 hover-scale"
                onClick={() => openAddTimeSlotModal(selectedDate)}
              >
                <Plus size={14} />
                <span>Add Time Slot</span>
              </button>
              <button 
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setSelectedDate(null)}
              >
                &times;
              </button>
            </div>
          </div>
          
          {/* Display time slots for the day */}
          {getTimeSlotsForDay(selectedDate).length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Slots</h3>
              <div className="space-y-2">
                {getTimeSlotsForDay(selectedDate).map(slot => (
                  <div
                    key={slot.id}
                    className={`${getTimeSlotColor(slot.type)} rounded p-2 text-sm border relative group hover-scale`}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium">{slot.title}</div>
                      <div className="text-xs bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full">
                        {slot.start} - {slot.end}
                      </div>
                    </div>
                    
                    {slot.description && (
                      <div className="text-xs mt-1 opacity-80">{slot.description}</div>
                    )}
                    
                    <button 
                      onClick={() => handleDeleteTimeSlot(slot.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 dark:text-gray-500 dark:hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Events</h3>
          {dayEvents.length > 0 ? (
            <div className="space-y-3">
              {dayEvents.map(event => (
                <div 
                  key={event.id}
                  className={`p-3 rounded-lg ${getEventTypeColor(event.type, event.status)} hover-scale`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(event.type)}
                        <h3 className="font-medium">{event.title}</h3>
                      </div>
                      
                      {(event.subject || event.time || event.duration) && (
                        <div className="ml-6 mt-1">
                          {event.subject && <p className="text-sm">{event.subject}</p>}
                          {event.time && (
                            <div className="flex items-center gap-1 text-xs mt-1">
                              <Clock size={12} />
                              <span>{event.time}</span>
                            </div>
                          )}
                          {event.duration && (
                            <div className="flex items-center gap-1 text-xs mt-1">
                              <Clock size={12} />
                              <span>{event.duration} minutes</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      {event.status && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          event.status === 'completed' 
                            ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : event.status === 'in-progress' 
                            ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                            : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {event.status === 'completed' 
                            ? 'Completed' 
                            : event.status === 'in-progress' 
                            ? 'In Progress' 
                            : 'Not Started'}
                        </span>
                      )}
                      
                      {(event.type === 'study' || event.type === 'assignment') && event.priority && (
                        <span className={`text-xs ml-1 px-2 py-0.5 rounded-full ${
                          event.priority === 'high' 
                            ? 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                            : event.priority === 'medium' 
                            ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
                            : 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CalendarIcon size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No events scheduled for this day.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Time Slot Modal */}
      {showTimeSlotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium dark:text-white">Add Time Slot</h3>
              <button 
                onClick={() => setShowTimeSlotModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input 
                  type="text" 
                  className="input" 
                  value={newTimeSlot.title}
                  onChange={(e) => setNewTimeSlot({...newTimeSlot, title: e.target.value})}
                  placeholder="Study session, Meeting, etc."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                  <input 
                    type="time" 
                    className="input" 
                    value={newTimeSlot.start}
                    onChange={(e) => setNewTimeSlot({...newTimeSlot, start: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                  <input 
                    type="time" 
                    className="input" 
                    value={newTimeSlot.end}
                    onChange={(e) => setNewTimeSlot({...newTimeSlot, end: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select 
                  className="input" 
                  value={newTimeSlot.type}
                  onChange={(e) => setNewTimeSlot({...newTimeSlot, type: e.target.value})}
                >
                  <option value="study">Study</option>
                  <option value="assignment">Assignment</option>
                  <option value="task">Task</option>
                  <option value="test">Test</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                <textarea 
                  className="input" 
                  value={newTimeSlot.description}
                  onChange={(e) => setNewTimeSlot({...newTimeSlot, description: e.target.value})}
                  placeholder="Add more details about this time slot"
                  rows={3}
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowTimeSlotModal(false)}
                  className="btn btn-outline hover-scale"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTimeSlot}
                  className="btn btn-primary hover-scale"
                >
                  Add Time Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-medium mb-4">Legend</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 hover-scale">
            <div className="p-1 rounded bg-blue-100 dark:bg-blue-900/30">
              <CheckCircle size={14} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm">Task</span>
          </div>
          <div className="flex items-center gap-2 hover-scale">
            <div className="p-1 rounded bg-red-100 dark:bg-red-900/30">
              <FileText size={14} className="text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm">Assignment</span>
          </div>
          <div className="flex items-center gap-2 hover-scale">
            <div className="p-1 rounded bg-purple-100 dark:bg-purple-900/30">
              <Activity size={14} className="text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm">Habit</span>
          </div>
          <div className="flex items-center gap-2 hover-scale">
            <div className="p-1 rounded bg-indigo-100 dark:bg-indigo-900/30">
              <Flag size={14} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-sm">Goal</span>
          </div>
          <div className="flex items-center gap-2 hover-scale">
            <div className="p-1 rounded bg-amber-100 dark:bg-amber-900/30">
              <BookOpen size={14} className="text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-sm">Journal</span>
          </div>
          <div className="flex items-center gap-2 hover-scale">
            <div className="p-1 rounded bg-fuchsia-100 dark:bg-fuchsia-900/30">
              <FileText size={14} className="text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
            <span className="text-sm">Test</span>
          </div>
          <div className="flex items-center gap-2 hover-scale">
            <div className="p-1 rounded bg-blue-100 border border-blue-500 dark:bg-blue-900/30 dark:border-blue-700">
              <Clock size={14} className="text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm">Time Slot</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
 