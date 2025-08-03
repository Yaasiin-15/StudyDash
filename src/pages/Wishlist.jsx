import  { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash, ShoppingBag, DollarSign, Check, Edit, AlertCircle } from 'lucide-react';

const Wishlist = () => {
  const { wishlist, addWishlistItem, deleteWishlistItem, toggleWishlistItemPurchased } = useApp();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [priority, setPriority] = useState('medium');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [filter, setFilter] = useState('all');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      addWishlistItem({
        title: title.trim(),
        price: price ? parseFloat(price) : undefined,
        priority,
        url: url.trim() || undefined,
        note: note.trim() || undefined,
        purchased: false
      });
      setTitle('');
      setPrice('');
      setPriority('medium');
      setUrl('');
      setNote('');
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="badge badge-danger">High Priority</span>;
      case 'medium':
        return <span className="badge badge-warning">Medium Priority</span>;
      case 'low':
        return <span className="badge badge-info">Low Priority</span>;
      default:
        return null;
    }
  };

  // Filter and sort items
  const filteredItems = wishlist
    .filter(item => {
      if (filter === 'all') return true;
      if (filter === 'purchased') return item.purchased;
      if (filter === 'not-purchased') return !item.purchased;
      return true;
    })
    .sort((a, b) => {
      // First sort by purchased status
      if (a.purchased && !b.purchased) return 1;
      if (!a.purchased && b.purchased) return -1;
      
      // Then sort unpurchased items by priority
      if (!a.purchased && !b.purchased) {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      return 0;
    });

  // Calculate total price of unpurchased items
  const totalPrice = wishlist
    .filter(item => !item.purchased && item.price !== undefined)
    .reduce((sum, item) => sum + (item.price || 0), 0);
    
  // Calculate total spent
  const totalSpent = wishlist
    .filter(item => item.purchased && item.price !== undefined)
    .reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Wishlist</h1>
            <p className="mt-1 text-white/80">Keep track of items you want to buy</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-lg font-medium mb-4">Add to Wishlist</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Item name"
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (optional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="input"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL (optional)</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                className="input"
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
              <Plus size={18} />
              <span>Add to Wishlist</span>
            </button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-100 rounded-lg text-teal-600">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 font-medium">Total Wishlist</h3>
                  <p className="text-xl font-bold">
                    {wishlist.filter(item => item.purchased).length} items
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-4 shadow-md border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 font-medium">Total Budget</h3>
                  <p className="text-xl font-bold text-emerald-600">
                    ${totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mb-4">
            <button
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`btn ${filter === 'not-purchased' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('not-purchased')}
            >
              To Buy
            </button>
            <button
              className={`btn ${filter === 'purchased' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter('purchased')}
            >
              Purchased
            </button>
          </div>

          {filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow border-l-4 ${
                    item.purchased 
                      ? 'border-l-green-500 bg-gray-50' 
                      : item.priority === 'high' 
                      ? 'border-l-red-500 bg-white' 
                      : item.priority === 'medium' 
                      ? 'border-l-yellow-500 bg-white' 
                      : 'border-l-blue-500 bg-white'
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <button
                          onClick={() => toggleWishlistItemPurchased(item.id)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            item.purchased 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {item.purchased && <Check size={12} />}
                        </button>
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-medium text-lg ${item.purchased ? 'line-through text-gray-500' : ''}`}>
                          {item.title}
                        </h3>
                        {item.price === undefined && (
                          <span className={`text-lg font-medium ${item.purchased ? 'text-gray-500' : 'text-emerald-600'}`}>
                            ${item.price.toFixed(2)}
                          </span>
                        )}
                        {item.url && (
                          <div className="mt-1">
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                            >
                              <ShoppingBag size={12} />
                              {item.url.length > 30 ? item.url.substring(0, 30) + '...' : item.url}
                            </a>
                          </div>
                        )}
                        {item.note && (
                          <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {item.purchased && getPriorityBadge(item.priority)}
                      {item.purchased && (
                        <span className="badge badge-success flex items-center gap-1">
                          <Check size={10} />
                          Purchased
                        </span>
                      )}
                      <button
                        onClick={() => deleteWishlistItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-8 text-gray-500">
              <ShoppingBag size={40} className="mx-auto mb-4 text-gray-300" />
              <p>
                {filter === 'all' 
                  ? 'Your wishlist is empty. Add items you want to save for later' 
                  : filter === 'purchased' 
                  ? 'No purchased items yet.'
                  : 'No items in your wishlist yet.'}
              </p>
            </div>
          )}
          
          {totalSpent > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-emerald-600" />
                  <h3 className="font-medium">Total Spent</h3>
                </div>
                <p className="text-xl font-bold text-emerald-600">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
 