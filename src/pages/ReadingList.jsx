import  { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash, Book, Check } from 'lucide-react';

const ReadingList = () => {
  const { readingList, addReadingItem, toggleReadingItemCompletion, deleteReadingItem } = useApp();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [filter, setFilter] = useState('all');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && author.trim()) {
      addReadingItem({
        title: title.trim(),
        author: author.trim(),
      });
      setTitle('');
      setAuthor('');
    }
  };

  const filteredItems = readingList.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !item.completed;
    if (filter === 'completed') return item.completed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reading List</h1>
      </div>

      <div className="card">
        <h2 className="text-lg font-medium mb-4">Add to Reading List</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book/Article Title"
            className="input"
            required
          />
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author"
            className="input"
            required
          />
          <button type="submit" className="btn btn-primary mt-2 md:mt-0 flex items-center justify-center gap-2 md:col-span-2">
            <Plus size={18} />
            <span>Add to Reading List</span>
          </button>
        </form>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('active')}
        >
          In Progress
        </button>
        <button
          className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${item.completed ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {item.completed ? (
                    <Check size={20} className="text-green-600" />
                  ) : (
                    <Book size={20} className="text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-500">by {item.author}</p>
                  
                  <div className="mt-3">
                    <div className="flex items-center mb-1">
                      <span className={`text-sm font-medium ${item.completed ? 'text-green-600' : 'text-blue-600'}`}>
                        {item.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleReadingItemCompletion(item.id)}
                        className={`py-1 px-2 text-xs rounded ${
                          item.completed
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {item.completed ? 'Completed' : 'Mark Complete'}
                      </button>
                    </div>
                    <button
                      onClick={() => deleteReadingItem(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-8 text-gray-500">
          <Book size={40} className="mx-auto mb-4 text-gray-300" />
          <p>
            {filter === 'all'
              ? 'Your reading list is empty. Add a book or article to get started'
              : filter === 'active'
              ? 'No in-progress reading items.'
              : 'No completed reading items.'}
          </p>
        </div>
      )}
      
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <img 
            src="https://images.unsplash.com/photo-1472289065668-ce650ac443d2?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxtaW5pbWFsaXN0JTIwc3R1ZGVudCUyMHdvcmtzcGFjZXxlbnwwfHx8fDE3NDI4MTIwNjh8MA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800"
            alt="Minimal workspace with pencils"
            className="w-32 h-32 object-cover rounded-lg"
          />
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Reading Tips</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                <span>Set aside dedicated time each day for reading</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                <span>Take notes or highlight important passages</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                <span>Track your progress to stay motivated</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                <span>Discuss what you're reading with others</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingList;
 