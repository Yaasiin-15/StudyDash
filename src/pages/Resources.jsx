import  { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Trash, 
  Book, 
  ExternalLink, 
  Search, 
  Filter, 
  Link, 
  Upload, 
  FileText, 
  Folder,
  Tag,
  Download
} from 'lucide-react';

const Resources = () => {
  const { resources, addResource, deleteResource } = useApp();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const fileInputRef = useRef(null);
  const [uploadType, setUploadType] = useState('url');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      const newResource = {
        title: title.trim(),
        url: url.trim() || '',
        category: category.trim(),
        isPdf: uploadType === 'pdf',
        pdfName: pdfFile ? pdfFile.name : '',
        pdfSize: pdfFile ? pdfFile.size : 0,
        linkedAssignments: []
      };
      
      if (uploadType === 'pdf' && pdfFile) {
        // Convert PDF file to base64 data URL for storage
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && event.target.result) {
            // Add PDF content to the resource
            const pdfContent = event.target.result;
            addResource({
              ...newResource,
              url, // Store PDF data in the URL field
            });
            
            // Reset form
            resetForm();
          }
        };
        reader.readAsDataURL(pdfFile);
      } else {
        // Add URL resource
        addResource(newResource);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setCategory('');
    setPdfFile(null);
    setUploadType('url');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const categories = [...new Set(resources.map(resource => resource.category))];

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        alert('Please select a PDF file');
        setPdfFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const openPdf = (resource) => {
    if (resource.isPdf && resource.url && resource.url.startsWith('data:application/pdf')) {
      // Open the PDF in a new tab
      window.open(resource.url, '_blank');
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (resource.url && resource.url.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory ? resource.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Resources Hub</h1>
            <p className="mt-1 text-white/80">Store links, PDFs, and organize your study materials</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-medium mb-4">Add New Resource</h2>
        <div style={{
  backgroundColor: '#fff3cd',
  color: '#856404',
  padding: '10px',
  border: '1px solid #ffeeba',
  borderRadius: '5px',
  fontSize: '14px',
  textAlign: 'center',
  marginBottom: '15px'
}}>
  Hey there 👋, we're a bit low on storage since it's just the start 🚀Please prefer storing links when possible 💾🔗.<br />
</div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resource Title"
              className="input"
              required
            />
          </div>
          
          <div className="md:col-span-2 border-t border-b py-4 my-2">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <p className="font-medium">Choose resource type:</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <input 
                    type="radio" 
                    id="typeUrl" 
                    name="resourceType" 
                    className="mr-2" 
                    checked={uploadType === 'url'}
                    onChange={() => setUploadType('url')}
                  />
                  <label htmlFor="typeUrl" className="flex items-center gap-2">
                    <Link size={18} className="text-blue-500" />
                    <span>Add URL</span>
                  </label>
                </div>
                
                {uploadType === 'url' && (
                  <div className="mt-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className="input"
                      required={uploadType === 'url'}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <input 
                    type="radio" 
                    id="typePdf" 
                    name="resourceType" 
                    className="mr-2"
                    checked={uploadType === 'pdf'}
                    onChange={() => setUploadType('pdf')}
                  />
                  <label htmlFor="typePdf" className="flex items-center gap-2">
                    <FileText size={18} className="text-red-500" />
                    <span>Upload PDF</span>
                  </label>
                </div>
                
                {uploadType === 'pdf' && (
                  <div className="mt-2">
                    <label className="btn bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer w-full flex items-center justify-center py-2 gap-2">
                      <Upload size={16} />
                      {pdfFile ? 'Change PDF' : 'Select PDF File'}
                      <input
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        required={uploadType === 'pdf'}
                      />
                    </label>
                    {pdfFile && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg border text-sm text-gray-600 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-red-500" />
                          <span className="truncate max-w-[200px]">{pdfFile.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">({(pdfFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category (e.g. Math, Science)"
                className="input pl-9"
                required
                list="categories"
              />
              <datalist id="categories">
                {categories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>
          
          <div className="flex items-end">
            <button type="submit" className="btn btn-primary flex items-center justify-center gap-2 h-[42px] w-full">
              <Plus size={18} />
              <span>Add Resource</span>
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources..."
            className="input pl-10"
          />
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={18} className="text-gray-400" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input pl-10 appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="card hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${resource.isPdf ? 'bg-red-100' : 'bg-blue-100'}`}>
                  {resource.isPdf ? (
                    <FileText size={20} className="text-red-600" />
                  ) : (
                    <Link size={20} className="text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{resource.title}</h3>
                  
                  {resource.isPdf ? (
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <FileText size={14} />
                        {resource.pdfName} {resource.pdfSize && `(${Math.round(resource.pdfSize / 1024)} KB)`}
                      </div>
                      <button
                        onClick={() => openPdf(resource)}
                        className="btn btn-sm btn-outline flex items-center gap-1 text-xs"
                      >
                        <Download size={12} />
                        Open PDF
                      </button>
                    </div>
                  ) : (
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink size={14} />
                      {resource.url.length > 40 ? resource.url.substring(0, 40) + '...' : resource.url}
                    </a>
                  )}
                  
                  <div className="mt-3 flex justify-between items-center">
                    <span className="badge badge-info">{resource.category}</span>
                    
                    <div className="flex gap-2">
                      {resource.linkedAssignments && resource.linkedAssignments.length > 0 && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <FileText size={12} />
                          {resource.linkedAssignments.length} linked
                        </div>
                      )}
                      
                      <button
                        onClick={() => deleteResource(resource.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {resource.isPdf && (
                <div className="absolute bottom-0 right-0 w-16 h-16 -rotate-45 translate-x-6 translate-y-6 bg-red-500 opacity-10"></div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-8 text-gray-500">
          <Book size={40} className="mx-auto mb-4 text-gray-300" />
          {resources.length === 0 ? (
            <p>No resources yet. Add your first resource to get started</p>
          ) : (
            <p>No resources match your search. Try different keywords or categories.</p>
          )}
        </div>
      )}
      
      <div className="card p-5 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-start gap-4">
          <img 
            src="https://images.unsplash.com/photo-1487700160041-babef9c3cb55?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwc3R1ZGVudCUyMHN0dWR5JTIwcmVzb3VyY2VzJTIwZG9jdW1lbnRzJTIwYW5kJTIwYm9va3N8ZW58MHx8fHwxNzQ2MDI4MjE1fDA&ixlib=rb-4.0.3&fit=fillmax&h=400&w=600"
            alt="Green leafed plant on clear glass vase"
            className="w-24 h-24 object-cover rounded-lg hidden md:block"
          />
          <div>
            <h2 className="text-lg font-medium mb-2">Resource Management Tips</h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">1</div>
                <span>Store PDFs directly in your resource hub for easy access</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">2</div>
                <span>Link resources directly to assignments and study tasks</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">3</div>
                <span>Use consistent categories to organize your materials</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Resources;
 