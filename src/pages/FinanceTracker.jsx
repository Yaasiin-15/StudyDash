import   { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash, DollarSign, CreditCard, Calendar, FileText, ChevronDown, ChevronUp, Search, Filter, Download, ArrowUpDown, TrendingUp, TrendingDown, Tag, Edit } from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';





const FinanceTracker = () => {
  const { darkMode } = useApp();
  
  // Load transactions from localStorage
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('studydash_transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [
      {
        id: 'tx-' + Date.now() + '-1',
        amount: 50,
        description: 'Textbooks',
        category: 'Books',
        date: format(new Date(), 'yyyy-MM-dd'),
        isIncome: false,
        isRecurring: false
      },
      {
        id: 'tx-' + Date.now() + '-2',
        amount: 1200,
        description: 'Scholarship',
        category: 'Income',
        date: format(new Date(), 'yyyy-MM-dd'),
        isIncome: true,
        isRecurring: true,
        recurringPeriod: 'monthly'
      },
      {
        id: 'tx-' + Date.now() + '-3',
        amount: 35,
        description: 'Course supplies',
        category: 'Supplies',
        date: format(new Date(), 'yyyy-MM-dd'),
        isIncome: false,
        isRecurring: false
      }
    ];
  });
  
  // Load budgets from localStorage
  const [budgets, setBudgets] = useState(() => {
    const savedBudgets = localStorage.getItem('studydash_budgets');
    return savedBudgets ? JSON.parse(savedBudgets) : [
      {
        id: 'bdg-' + Date.now() + '-1',
        category: 'Books',
        amount: 150,
        period: 'monthly',
        spent: 50
      },
      {
        id: 'bdg-' + Date.now() + '-2',
        category: 'Food',
        amount: 300,
        period: 'monthly',
        spent: 120
      },
      {
        id: 'bdg-' + Date.now() + '-3',
        category: 'Entertainment',
        amount: 100,
        period: 'monthly',
        spent: 45
      }
    ];
  });
  
  // Form states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isIncome, setIsIncome] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPeriod, setRecurringPeriod] = useState('monthly');
  const [tags, setTags] = useState([]);
  const [tag, setTag] = useState('');
  
  // Budget form states
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState('monthly');
  
  // UI states
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('studydash_transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    localStorage.setItem('studydash_budgets', JSON.stringify(budgets));
  }, [budgets]);
  
  // Get unique categories from transactions
  const categories = Array.from(new Set([
    ...transactions.map(t => t.category),
    ...budgets.map(b => b.category)
  ])).filter(Boolean);
  
  // Helper function to get total income, expenses, and balance
  const calculateFinancials = (transactionList) => {
    const income = transactionList.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactionList.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses
    };
  };
  
  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.amount.toString().includes(searchQuery);
    
    // Category filter
    const matchesCategory = selectedCategory ? transaction.category === selectedCategory : true;
    
    // Period filter
    let matchesPeriod = true;
    if (selectedPeriod === 'current-month') {
      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());
      const transactionDate = parseISO(transaction.date);
      matchesPeriod = transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd;
    } else if (selectedPeriod === 'last-month') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStart = startOfMonth(lastMonth);
      const lastMonthEnd = endOfMonth(lastMonth);
      const transactionDate = parseISO(transaction.date);
      matchesPeriod = transactionDate >= lastMonthStart && transactionDate <= lastMonthEnd;
    }
    
    return matchesSearch && matchesCategory && matchesPeriod;
  });
  
  // Sort filtered transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDirection === 'asc' ? comparison : -comparison;
    } else {
      const comparison = a.amount - b.amount;
      return sortDirection === 'asc' ? comparison : -comparison;
    }
  });
  
  // Handle adding a new transaction
  const handleAddTransaction = (e) => {
    e.preventDefault();
    
    if (amount || description || category || date) return;
    
    const newTransaction = {
      id: editingTransaction || `tx-${Date.now()}`,
      amount: parseFloat(amount),
      description,
      category,
      date,
      isIncome,
      isRecurring,
      recurringPeriod: isRecurring ? recurringPeriod : undefined,
      tags: tags.length > 0 ? tags : undefined
    };
    
    if (editingTransaction) {
      // Update existing transaction
      setTransactions(transactions.map(t => 
        t.id === editingTransaction ? newTransaction : t
      ));
      
      // Update budget spent amount if expense category matches
      if (newTransaction.isIncome) {
        updateBudgetSpent(newTransaction.category, newTransaction.amount);
      }
    } else {
      // Add new transaction
      setTransactions([...transactions, newTransaction]);
      
      // Update budget spent amount if expense
      if (newTransaction.isIncome) {
        updateBudgetSpent(newTransaction.category, newTransaction.amount);
      }
    }
    
    // Reset form
    resetTransactionForm();
  };
  
  // Update budget spent amount
  const updateBudgetSpent = (category, amount) => {
    const matchingBudget = budgets.find(b => b.category === category);
    if (matchingBudget) {
      setBudgets(budgets.map(b => 
        b.id === matchingBudget.id ? { ...b, spent: b.spent + amount } : b
      ));
    }
  };
  
  // Handle adding a new budget
  const handleAddBudget = (e) => {
    e.preventDefault();
    
    if (budgetCategory || budgetAmount) return;
    
    const newBudget = {
      id: editingBudget || `bdg-${Date.now()}`,
      category,
      amount: parseFloat(budgetAmount),
      period,
      spent: editingBudget ? budgets.find(b => b.id === editingBudget)?.spent || 0 : 0
    };
    
    if (editingBudget) {
      // Update existing budget
      setBudgets(budgets.map(b => 
        b.id === editingBudget ? newBudget : b
      ));
    } else {
      // Add new budget
      setBudgets([...budgets, newBudget]);
    }
    
    // Reset form
    resetBudgetForm();
  };
  
  // Handle deleting a transaction
  const handleDeleteTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const transaction = transactions.find(t => t.id === id);
      
      // If it's an expense, update the budget spent amount
      if (transaction && transaction.isIncome) {
        const matchingBudget = budgets.find(b => b.category === transaction.category);
        if (matchingBudget) {
          setBudgets(budgets.map(b => 
            b.id === matchingBudget.id ? 
              { ...b, spent: Math.max(0, b.spent - transaction.amount) } : 
              b
          ));
        }
      }
      
      setTransactions(transactions.filter(t => t.id == id));
    }
  };
  
  // Handle deleting a budget
  const handleDeleteBudget = (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      setBudgets(budgets.filter(b => b.id == id));
    }
  };
  
  // Edit a transaction
  const handleEditTransaction = (transaction) => {
    setAmount(transaction.amount.toString());
    setDescription(transaction.description);
    setCategory(transaction.category);
    setDate(transaction.date);
    setIsIncome(transaction.isIncome);
    setIsRecurring(transaction.isRecurring);
    setRecurringPeriod(transaction.recurringPeriod || 'monthly');
    setTags(transaction.tags || []);
    setEditingTransaction(transaction.id);
    setShowAddTransaction(true);
  };
  
  // Edit a budget
  const handleEditBudget = (budget) => {
    setBudgetCategory(budget.category);
    setBudgetAmount(budget.amount.toString());
    setBudgetPeriod(budget.period);
    setEditingBudget(budget.id);
    setShowAddBudget(true);
  };
  
  // Reset transaction form
  const resetTransactionForm = () => {
    setAmount('');
    setDescription('');
    setCategory('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setIsIncome(false);
    setIsRecurring(false);
    setRecurringPeriod('monthly');
    setTags([]);
    setTag('');
    setEditingTransaction(null);
    setShowAddTransaction(false);
  };
  
  // Reset budget form
  const resetBudgetForm = () => {
    setBudgetCategory('');
    setBudgetAmount('');
    setBudgetPeriod('monthly');
    setEditingBudget(null);
    setShowAddBudget(false);
  };
  
  // Add tag to current transaction
  const addTag = () => {
    if (tag.trim() && tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTag('');
    }
  };
  
  // Remove tag from current transaction
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t == tagToRemove));
  };
  
  // Toggle sort direction
  const toggleSort = (sortField) => {
    if (sortBy === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sortField);
      setSortDirection('desc');
    }
  };
  
  // Calculate category breakdown
  const categoryBreakdown = categories.map(cat => {
    const catTransactions = filteredTransactions.filter(t => t.category === cat);
    const catIncome = catTransactions.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
    const catExpenses = catTransactions.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
    
    return {
      category,
      income,
      expenses,
      net: catIncome - catExpenses
    };
  }).sort((a, b) => Math.abs(b.net) - Math.abs(a.net)); // Sort by absolute net value
  
  // Calculate financials for filtered transactions
  const financials = calculateFinancials(filteredTransactions);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Student Finance Tracker</h1>
            <p className="mt-1 text-white/80">Manage your finances, track expenses, and stay on budget</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                resetTransactionForm();
                setShowAddTransaction(true);
              }}
              className="btn bg-white text-teal-600 hover:bg-white/90 hover-scale shadow-md flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Add Transaction</span>
            </button>
            <button 
              onClick={() => {
                resetBudgetForm();
                setShowAddBudget(true);
              }}
              className="btn bg-white/20 text-white hover:bg-white/30 hover-scale shadow-md flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Add Budget</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-gray-800 border border-emerald-100 dark:border-emerald-900/30 shadow-sm hover-scale">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 font-medium">Income</h3>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(financials.income)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="card bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800 border border-red-100 dark:border-red-900/30 shadow-sm hover-scale">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg text-red-600 dark:text-red-400">
                  <TrendingDown size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 font-medium">Expenses</h3>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(financials.expenses)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`card bg-gradient-to-br ${
              financials.balance >= 0 
                ? 'from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border border-blue-100 dark:border-blue-900/30' 
                : 'from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-800 border border-amber-100 dark:border-amber-900/30'
            } shadow-sm hover-scale`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 ${
                  financials.balance >= 0 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                    : 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                } rounded-lg`}>
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="text-sm text-gray-600 dark:text-gray-400 font-medium">Balance</h3>
                  <p className={`text-xl font-bold ${
                    financials.balance >= 0 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {formatCurrency(financials.balance)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Transaction List */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Transactions</h2>
              <button 
                onClick={() => setShowCategoryBreakdown(showCategoryBreakdown)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {showCategoryBreakdown ? (
                  <>
                    <ChevronUp size={14} />
                    Hide Breakdown
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    Show Breakdown
                  </>
                )}
              </button>
            </div>
            
            {/* Category Breakdown */}
            {showCategoryBreakdown && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Category Breakdown</h3>
                <div className="space-y-2">
                  {categoryBreakdown.map(cat => (
                    <div key={cat.category} className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-gray-500 dark:text-gray-400" />
                        <span className="font-medium">{cat.category}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-medium ${
                          cat.net > 0 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : cat.net < 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {formatCurrency(cat.net)}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {cat.income > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400 mr-2">+{formatCurrency(cat.income)}</span>
                          )}
                          {cat.expenses > 0 && (
                            <span className="text-red-600 dark:text-red-400">-{formatCurrency(cat.expenses)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-grow">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
              
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="input w-auto"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <select
                value={selectedPeriod}
                                  onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input w-auto"
              >
                <option value="all">All Time</option>
                <option value="current-month">Current Month</option>
                <option value="last-month">Last Month</option>
              </select>
            </div>
            
            {/* Transaction Table */}
            {sortedTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-left">
                    <tr>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <button 
                          onClick={() => toggleSort('date')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Date
                          {sortBy === 'date' && (
                            sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Category</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <button 
                          onClick={() => toggleSort('amount')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Amount
                          {sortBy === 'amount' && (
                            sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          )}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedTransactions.map(transaction => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar size={14} className="text-gray-400 mr-1.5" />
                            <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                            {transaction.isRecurring && (
                              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                Recurring
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{transaction.description}</div>
                          {transaction.tags && transaction.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {transaction.tags.map(tag => (
                                <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {transaction.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`font-medium ${transaction.isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {transaction.isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Edit Transaction"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                              title="Delete Transaction"
                            >
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <DollarSign size={40} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No transactions found. Add your first transaction to get started</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-medium mb-4">Budgets</h2>
            
            {budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.map(budget => {
                  const percentage = Math.min(100, Math.round((budget.spent / budget.amount) * 100));
                  const isOverBudget = budget.spent > budget.amount;
                  
                  return (
                    <div key={budget.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover-scale">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{budget.category}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)} Budget
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditBudget(budget)}
                            className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Edit Budget"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBudget(budget.id)}
                            className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Delete Budget"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex justify-between items-center text-sm">
                        <span className="font-medium">
                          {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}
                        </span>
                        <span className={`${
                          isOverBudget 
                            ? 'text-red-600 dark:text-red-400' 
                            : percentage > 80
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {percentage}%
                        </span>
                      </div>
                      
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            isOverBudget 
                              ? 'bg-red-600 dark:bg-red-500' 
                              : percentage > 80
                              ? 'bg-amber-500 dark:bg-amber-400'
                              : 'bg-emerald-500 dark:bg-emerald-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <CreditCard size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p>No budgets set up yet. Add a budget to track your spending</p>
              </div>
            )}
          </div>
          
          <div className="card">
            <div className="flex items-start gap-4">
              <img 
                src="https://images.unsplash.com/photo-1593672715438-d88a70629abe?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwZmluYW5jZSUyMHdhbGxldCUyMG1vbmV5JTIwYnVkZ2V0JTIwdHJhY2tlcnxlbnwwfHx8fDE3NDg1MjMyMTR8MA&ixlib=rb-4.1.0&fit=fillmax&h=500&w=800"
                alt="Student finance tools"
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div>
                <h2 className="text-lg font-medium mb-2">Finance Tips</h2>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Create a monthly budget for essential categories like books, supplies, and food.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Track recurring expenses like subscriptions and rent to avoid surprises.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>Save receipts for potential tax deductions on educational expenses.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Transaction Modal */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium dark:text-white">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button 
                onClick={resetTransactionForm}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Type</label>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => setIsIncome(false)}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md ${
                        isIncome 
                          ? 'bg-red-500 text-white dark:bg-red-600' 
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsIncome(true)}
                      className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md ${
                        isIncome 
                          ? 'bg-emerald-500 text-white dark:bg-emerald-600' 
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>
                
                <div className="w-2/5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="input pl-8"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                  placeholder="What was this for?"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input
                    type="text"
                    list="categories"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input"
                    placeholder="e.g., Books, Food"
                    required
                  />
                  <datalist id="categories">
                    {categories.map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
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
              
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={isRecurring}
                    onChange={() => setIsRecurring(isRecurring)}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recurring Transaction
                  </label>
                </div>
                
                {isRecurring && (
                  <select
                    value={recurringPeriod}
                    onChange={(e) => setRecurringPeriod(e.target.value)}
                    className="input mt-2"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (optional)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(t => (
                    <span key={t} className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 flex items-center gap-1">
                      {t}
                      <button 
                        type="button" 
                        onClick={() => removeTag(t)}
                        className="text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="input flex-1"
                    placeholder="Add a tag (e.g., textbooks, dining)"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn btn-outline py-1.5 px-3"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={resetTransactionForm}
                  className="btn btn-outline dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium dark:text-white">
                {editingBudget ? 'Edit Budget' : 'Add Budget'}
              </h3>
              <button 
                onClick={resetBudgetForm}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input
                  type="text"
                  list="budget-categories"
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="input"
                  placeholder="e.g., Books, Food"
                  required
                />
                <datalist id="budget-categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Amount</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="input pl-8"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget Period</label>
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setBudgetPeriod('weekly')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md ${
                      budgetPeriod === 'weekly' 
                        ? 'bg-blue-500 text-white dark:bg-blue-600' 
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetPeriod('monthly')}
                    className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md ${
                      budgetPeriod === 'monthly' 
                        ? 'bg-blue-500 text-white dark:bg-blue-600' 
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={resetBudgetForm}
                  className="btn btn-outline dark:border-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingBudget ? 'Update' : 'Add'} Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceTracker;
 