import  { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Save,
  Plus,
  Trash,
  Image,
  X,
  FileText,
  Smile,
  Frown,
  Meh,
  Moon,
  Sun
} from 'lucide-react';
import {
  format,
  parseISO,
  isToday,
  isSameDay,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay
} from 'date-fns';

const Journal = () => {
  const { journals, addJournal, updateJournal, deleteJournal } = useApp();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [selectedJournal, setSelectedJournal] = useState(journals.find(j => 
    isSameDay(parseISO(j.date), selectedDate)
  ));
  const [images, setImages] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const fileInputRef = useRef(null);
  
  // Update selected journal when date changes
  useEffect(() => {
    const journalForDate = journals.find(j => 
      isSameDay(parseISO(j.date), selectedDate)
    );
    setSelectedJournal(journalForDate);
    
    if (journalForDate) {
      setTitle(journalForDate.title);
      setContent(journalForDate.content);
      setMood(journalForDate.mood);
      setImages(journalForDate.imageUrls || []);
    } else {
      resetForm();
    }
  }, [selectedDate, journals]);
  
  const resetForm = () => {
    setTitle('');
    setContent('');
    setMood('neutral');
    setImages([]);
  };
  
  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    
    if (!trimmedTitle && !trimmedContent) return;
    
    if (selectedJournal) {
      // Update existing journal
      updateJournal(selectedJournal.id, {
        title,
        content,
        mood,
        imageUrls: images
      });
    } else {
      // Add new journal
      addJournal({
        date: format(selectedDate, 'yyyy-MM-dd'),
        title,
        content,
        mood,
        imageUrls: images
      });
    }
    
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (selectedJournal && window.confirm('Are you sure you want to delete this journal entry?')) {
      deleteJournal(selectedJournal.id);
      resetForm();
    }
  };
  
  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages(prev => [...prev, event.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Generate calendar days
  const calendarDays = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const startDate = monthStart;
    const endDate = monthEnd;
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Add empty spaces for start of month
    const startDay = getDay(monthStart);
    const emptyDaysAtStart = Array.from({ length: startDay }, (_, i) => `empty-start-${i}`);
    
    return [...emptyDaysAtStart, ...days];
  };
  
  // Get mood icon based on mood
  const getMoodIcon = (moodValue) => {
    switch (moodValue) {
      case 'great':
        return <Smile className="text-green-500" />;
      case 'good':
        return <Smile className="text-blue-500" />;
      case 'neutral':
        return <Meh className="text-gray-500" />;
      case 'bad':
        return <Frown className="text-yellow-500" />;
      case 'awful':
        return <Frown className="text-red-500" />;
      default:
        return <Meh className="text-gray-500" />;
    }
  };
  
  // Get journal for a specific date
  const getJournalForDate = (date) => {
    return journals.find(j => isSameDay(parseISO(j.date), date));
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Journal</h1>
            <p className="mt-1 text-white/80">Record your thoughts, reflections, and daily experiences</p>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 shadow-md flex items-center gap-2"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <Calendar size={18} />
              <span>Calendar</span>
            </button>
            <button 
              className="btn bg-white text-purple-600 hover:bg-white/90 shadow-md flex items-center gap-2"
              onClick={() => {
                setIsEditing(true);
                if (selectedJournal) {
                  resetForm();
                }
              }}
            >
              <Plus size={18} />
              <span>New Entry</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Calendar Popup */}
      {showCalendar && (
        <div className="card p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setSelectedDate(prevDate => subDays(prevDate, 30))}
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-medium">{format(selectedDate, 'MMMM yyyy')}</h3>
            <button
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setSelectedDate(prevDate => addDays(prevDate, 30))}
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays().map((day, i) => {
              if (typeof day === 'string') {
                return <div key={day} className="h-10"></div>;
              }
              
              const journal = getJournalForDate(day);
              const isSelected = isSameDay(day, selectedDate);
              
              return (
                <button
                  key={format(day, 'yyyy-MM-dd')}
                  className={`h-10 rounded-full flex items-center justify-center ${
                    isToday(day) ? 'font-bold' : ''
                  } ${
                    isSelected 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' 
                      : journal 
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className="relative">
                    {format(day, 'd')}
                    {journal && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Journal List */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Recent Entries</h2>
            <div className="flex gap-2">
              <button
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setSelectedDate(prevDate => subDays(prevDate, 1))}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setSelectedDate(prevDate => addDays(prevDate, 1))}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="card">
            <div className="font-medium mb-2 text-center bg-gray-50 dark:bg-gray-800 py-2 rounded-t-lg">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              {isToday(selectedDate) && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Today
                </span>
              )}
            </div>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto p-2">
              {journals.length > 0 ? (
                journals
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(journal => (
                    <div
                      key={journal.id}
                      className={`p-3 rounded-lg hover:shadow-md transition-all cursor-pointer border ${
                        selectedJournal?.id === journal.id ? 'ring-2 ring-purple-300 bg-purple-50 dark:ring-purple-700 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => {
                        setSelectedDate(parseISO(journal.date));
                        setIsEditing(false);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium line-clamp-1">{journal.title}</h3>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {format(parseISO(journal.date), 'MMM d, yyyy')}
                            {journal.imageUrls && journal.imageUrls.length > 0 && (
                              <span className="ml-2 inline-flex items-center">
                                <Image size={12} className="mr-1" />
                                {journal.imageUrls.length}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-2">{getMoodIcon(journal.mood)}</div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {journal.content}
                      </p>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No journal entries yet.</p>
                  <p className="text-sm">Start writing your thoughts</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Journal Entry/Editor */}
        <div className="w-full lg:w-2/3">
          <div className="card h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center gap-2">
                {isEditing ? (
                  <Edit size={20} className="text-purple-500" />
                ) : (
                  <FileText size={20} className="text-indigo-500" />
                )}
                {isEditing ? 'Edit Journal Entry' : 'Journal Entry'}
              </h2>
              
              <div className="flex gap-2">
                {selectedJournal && isEditing && (
                  <>
                    <button
                      className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleDelete}
                    >
                      <Trash size={18} />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit size={18} />
                    </button>
                  </>
                )}
                
                {isEditing && (
                  <>
                    <button
                      className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        setIsEditing(false);
                        if (selectedJournal) {
                          setTitle(selectedJournal.title);
                          setContent(selectedJournal.content);
                          setMood(selectedJournal.mood);
                          setImages(selectedJournal.imageUrls || []);
                        } else {
                          resetForm();
                        }
                      }}
                    >
                      <X size={18} />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-green-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={handleSave}
                    >
                      <Save size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Journal Content */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your journal entry"
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">How are you feeling today?</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'great', label: 'Great', icon: <Smile size={24} className="text-green-500" /> },
                      { value: 'good', label: 'Good', icon: <Smile size={24} className="text-blue-500" /> },
                      { value: 'neutral', label: 'Neutral', icon: <Meh size={24} className="text-gray-500" /> },
                      { value: 'bad', label: 'Bad', icon: <Frown size={24} className="text-yellow-500" /> },
                      { value: 'awful', label: 'Awful', icon: <Frown size={24} className="text-red-500" /> }
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                          mood === option.value 
                            ? 'bg-purple-50 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700' 
                            : 'bg-white border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
                        }`}
                        onClick={() => setMood(option.value)}
                      >
                        {option.icon}
                        <span className="mt-1 text-xs">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Journal Entry</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write about your day, thoughts, or anything you want to remember..."
                    className="input min-h-[200px]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={image} 
                          alt={`Journal image ${index + 1}`} 
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <button
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      className="w-20 h-20 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Image size={24} />
                      <span className="text-xs mt-1">Add</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setIsEditing(false);
                      if (selectedJournal) {
                        setTitle(selectedJournal.title);
                        setContent(selectedJournal.content);
                        setMood(selectedJournal.mood);
                        setImages(selectedJournal.imageUrls || []);
                      } else {
                        resetForm();
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            ) : selectedJournal ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-bold">{selectedJournal.title}</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {format(parseISO(selectedJournal.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                      {getMoodIcon(selectedJournal.mood)}
                    </div>
                  </div>
                </div>
                
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {selectedJournal.content.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
                
                {selectedJournal.imageUrls && selectedJournal.imageUrls.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Images</h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedJournal.imageUrls.map((image, index) => (
                        <img 
                          key={index} 
                          src={image} 
                          alt={`Journal image ${index + 1}`} 
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(image, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <img 
                  src="https://images.unsplash.com/photo-1456324504439-367cee3b3c32?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxzdHVkZW50JTIwZGVzayUyMHdvcmtzcGFjZSUyMHByb2R1Y3Rpdml0eSUyMHN0dWR5JTIwcGxhbm5lcnxlbnwwfHx8fDE3NDgzNDcxMDZ8MA&ixlib=rb-4.1.0&fit=fillmax&h=600&w=800"
                  alt="Person writing in a journal"
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
                />
                <h3 className="text-xl font-medium mb-2">No Journal Entry Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {isToday(selectedDate)
                    ? "You haven't written an entry for today."
                    : `You haven't written an entry for ${format(selectedDate, 'MMMM d, yyyy')}.`}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsEditing(true)}
                >
                  Create New Entry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
 