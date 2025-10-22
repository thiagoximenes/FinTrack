// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- TIPOS E INTERFACES ---
interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'revenue' | 'expense';
  category: string;
  date: string; // Formato YYYY-MM-DD
}

interface Category {
  id: number;
  name: string;
}

// --- DADOS MOCKADOS ---
const initialCategories: Category[] = [
  { id: 1, name: 'Salário' },
  { id: 2, name: 'Alimentação' },
  { id: 3, name: 'Transporte' },
  { id: 4, name: 'Moradia' },
  { id: 5, name: 'Lazer' },
  { id: 6, name: 'Saúde' },
];

const generateInitialTransactions = (): Transaction[] => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const transactions = [];
    for (let i = 1; i <= 25; i++) {
        transactions.push({ id: i, description: `Compra Supermercado ${i}`, amount: 50 + i, type: 'expense', category: 'Alimentação', date: new Date(currentYear, currentMonth, Math.min(i, 28)).toISOString().split('T')[0] });
    }
    transactions.push({ id: 26, description: 'Salário Mensal', amount: 5000, type: 'revenue', category: 'Salário', date: new Date(currentYear, currentMonth, 5).toISOString().split('T')[0] });
    transactions.push({ id: 27, description: 'Aluguel', amount: 1500, type: 'expense', category: 'Moradia', date: new Date(currentYear, currentMonth, 10).toISOString().split('T')[0] });
     // Dados para meses anteriores
    transactions.push({ id: 28, description: 'Salário Mensal', amount: 5000, type: 'revenue', category: 'Salário', date: new Date(currentYear, currentMonth - 1, 5).toISOString().split('T')[0] });
    transactions.push({ id: 29, description: 'Aluguel', amount: 1500, type: 'expense', category: 'Moradia', date: new Date(currentYear, currentMonth - 1, 10).toISOString().split('T')[0] });
    transactions.push({ id: 30, description: 'Supermercado', amount: 450, type: 'expense', category: 'Alimentação', date: new Date(currentYear, currentMonth - 2, 12).toISOString().split('T')[0] });
     // Dados para o ano anterior
    transactions.push({ id: 31, description: 'Salário Mensal', amount: 4800, type: 'revenue', category: 'Salário', date: new Date(currentYear - 1, currentMonth, 5).toISOString().split('T')[0] });
    transactions.push({ id: 32, description: 'Aluguel', amount: 1450, type: 'expense', category: 'Moradia', date: new Date(currentYear - 1, currentMonth, 10).toISOString().split('T')[0] });
    
    return transactions;
};


// --- HELPERS ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// --- COMPONENTES DE UI ---
const FeatureCard: React.FC<{ icon: string; title: string; children?: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{children}</p>
  </div>
);

const TestimonialCard: React.FC<{ author: string; children?: React.ReactNode }> = ({ author, children }) => (
  <div className="testimonial-card">
    <p>"{children}"</p>
    <span>- {author}</span>
  </div>
);

// --- PÁGINAS ---
const LandingPage = ({ onNavigate }) => (
  <div className="lp-container">
    <header className="lp-header">
      <h1 className="logo">FinTrack</h1>
      <nav>
        <button onClick={() => onNavigate('login')} className="btn btn-secondary">Login</button>
      </nav>
    </header>
    <main className="lp-main">
      <div className="hero">
        <h2>Controle suas finanças com inteligência e simplicidade.</h2>
        <p>A plataforma definitiva para organizar suas receitas, despesas e alcançar seus objetivos financeiros.</p>
        <button onClick={() => onNavigate('signup')} className="btn btn-primary btn-lg">Comece Agora</button>
      </div>
    </main>

    <section id="features" className="lp-section">
      <h2>Como Funciona</h2>
      <div className="features-grid">
        <FeatureCard icon="1" title="Cadastre-se">
          Crie sua conta de forma rápida e segura para começar a organizar suas finanças.
        </FeatureCard>
        <FeatureCard icon="2" title="Registre Transações">
          Adicione suas receitas e despesas diárias com facilidade, usando categorias personalizadas.
        </FeatureCard>
        <FeatureCard icon="3" title="Visualize e Decida">
          Acompanhe seus gastos com gráficos intuitivos e tome decisões mais inteligentes.
        </FeatureCard>
      </div>
    </section>

    <section id="testimonials" className="lp-section">
        <h2>O que dizem nossos usuários</h2>
        <div className="testimonials-grid">
            <TestimonialCard author="Ana Silva">
                O FinTrack transformou a maneira como eu lido com meu dinheiro. Finalmente tenho clareza sobre meus gastos!
            </TestimonialCard>
            <TestimonialCard author="Carlos Souza">
                A interface é limpa e muito fácil de usar. O cadastro de despesas é super rápido. Recomendo!
            </TestimonialCard>
        </div>
    </section>

    <footer className="lp-footer">
        <p>&copy; {new Date().getFullYear()} FinTrack. Todos os direitos reservados.</p>
    </footer>
  </div>
);

const AuthForm: React.FC<{ mode: 'login' | 'signup' | 'forgot'; onNavigate: (page: string) => void; onAuthSuccess: () => void; children?: React.ReactNode }> = ({ mode, onNavigate, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const title = {
    login: 'Acesse sua conta',
    signup: 'Crie sua conta',
    forgot: 'Recuperar Senha',
  };

  const buttonText = {
    login: 'Entrar',
    signup: 'Registrar',
    forgot: 'Enviar Link',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'admin@admin.com' && password === '123123') {
        onAuthSuccess();
        return;
    }
    // Lógica simulada
    if (mode === 'login') {
      setMessage('Login inválido (use admin@admin.com)');
    } else if (mode === 'signup') {
      setMessage('Registro efetuado com sucesso! Agora você pode fazer o login.');
      setTimeout(() => onNavigate('login'), 2000);
    } else {
      setMessage('Se o e-mail estiver correto, um link de recuperação foi enviado.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <h1 className="logo auth-logo" onClick={() => onNavigate('landing')}>FinTrack</h1>
        <h2>{title[mode]}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {mode !== 'forgot' && (
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}
          <button type="submit" className="btn btn-primary auth-btn">{buttonText[mode]}</button>
        </form>
        {message && <p className="auth-message">{message}</p>}
        <div className="auth-links">
          {mode === 'login' && <a onClick={() => onNavigate('signup')}>Não tem uma conta? Registre-se</a>}
          {mode === 'login' && <a onClick={() => onNavigate('forgot')}>Esqueceu a senha?</a>}
          {mode !== 'login' && <a onClick={() => onNavigate('login')}>Já tem uma conta? Faça login</a>}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTES DO DASHBOARD ---

const Sidebar = ({ currentView, onNavigate, onLogout }) => (
    <aside className="sidebar">
        <h1 className="logo" onClick={() => onNavigate('dashboard')}>FinTrack</h1>
        <nav className="sidebar-nav">
            <a className={currentView === 'dashboard' ? 'active' : ''} onClick={() => onNavigate('dashboard')}>Dashboard</a>
            <a className={currentView === 'revenues' ? 'active' : ''} onClick={() => onNavigate('revenues')}>Receitas</a>
            <a className={currentView === 'expenses' ? 'active' : ''} onClick={() => onNavigate('expenses')}>Despesas</a>
            <a className={currentView === 'categories' ? 'active' : ''} onClick={() => onNavigate('categories')}>Categorias</a>
            <a className={currentView === 'profile' ? 'active' : ''} onClick={() => onNavigate('profile')}>Meu Perfil</a>
        </nav>
        <button className="btn btn-secondary logout-btn" onClick={onLogout}>Sair</button>
    </aside>
);

const DashboardHeader = ({ title, selectedDate, onDateChange, onOpenModal }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);
    
    const handleMonthChange = (e) => {
        onDateChange({ ...selectedDate, month: parseInt(e.target.value) });
    };

    const handleYearChange = (e) => {
        onDateChange({ ...selectedDate, year: parseInt(e.target.value) });
    };
    
    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    return (
        <header className="dashboard-header">
            <div className="header-left">
                <span className="real-time-clock">{time.toLocaleTimeString('pt-BR')}</span>
            </div>
            <div className="header-center">
                 <h2>{title}</h2>
                 <div className="date-filters">
                    <select value={selectedDate.month} onChange={handleMonthChange}>
                        {months.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                        ))}
                    </select>
                    <select value={selectedDate.year} onChange={handleYearChange}>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                 </div>
            </div>
            <div className="header-right">
                <button className="btn btn-primary" onClick={onOpenModal}>+ Adicionar Transação</button>
            </div>
        </header>
    );
};

const AddTransactionModal = ({ isOpen, onClose, onAddTransaction, onUpdateTransaction, editingTransaction, categories }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const isEditMode = !!editingTransaction;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setDescription(editingTransaction.description);
                setAmount(String(editingTransaction.amount));
                setType(editingTransaction.type);
                setCategory(editingTransaction.category);
                setDate(editingTransaction.date);
            } else {
                // Reset form for "add" mode
                setDescription('');
                setAmount('');
                setType('expense');
                setCategory(categories[0]?.name || '');
                setDate(new Date().toISOString().split('T')[0]);
            }
        }
    }, [isOpen, editingTransaction, categories]);


    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const transactionData = {
            description,
            amount: parseFloat(amount),
            type,
            category,
            date,
        };
        
        if (isEditMode) {
            onUpdateTransaction({ ...transactionData, id: editingTransaction.id });
        } else {
            onAddTransaction(transactionData);
        }
        
        onClose();
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>{isEditMode ? 'Editar Transação' : 'Adicionar Nova Transação'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Descrição</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Valor</label>
                        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Data</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Tipo</label>
                        <select value={type} onChange={e => setType(e.target.value)}>
                            <option value="expense">Despesa</option>
                            <option value="revenue">Receita</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Categoria</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} required>
                            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">{isEditMode ? 'Salvar Alterações' : 'Adicionar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CategoryChart = ({ data, onCategoryClick }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
  
    useEffect(() => {
        if (!chartRef.current || !data) return;

        const ctx = chartRef.current.getContext('2d');
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const spendingByCategory = data
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        const labels = Object.keys(spendingByCategory);
        const values = Object.values(spendingByCategory);

        const chartColors = [
            '#4A90E2', '#50E3C2', '#F5A623', '#F8E71C', '#BD10E0', 
            '#9013FE', '#B8E986', '#7ED321', '#E84A5F', '#FF847C'
        ];

        chartInstance.current = new (window as any).Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: chartColors,
                    borderColor: '#1e1e2f',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                onClick: (evt, elements) => {
                    if (elements.length > 0) {
                        const clickedElementIndex = elements[0].index;
                        const label = chartInstance.current.data.labels[clickedElementIndex];
                        if (label && onCategoryClick) {
                            onCategoryClick(label);
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#a9a9c5',
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += formatCurrency(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, onCategoryClick]);
  
    return (
        <div className="chart-container">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

const AnnualTrendChart = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
  
    useEffect(() => {
        if (!chartRef.current || !data) return;

        const ctx = chartRef.current.getContext('2d');
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const monthlyRevenues = Array(12).fill(0);
        const monthlyExpenses = Array(12).fill(0);

        data.forEach(t => {
            const month = new Date(t.date).getMonth();
            if (t.type === 'revenue') {
                monthlyRevenues[month] += t.amount;
            } else {
                monthlyExpenses[month] += t.amount;
            }
        });

        const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        chartInstance.current = new (window as any).Chart(ctx, {
            type: 'line',
            data: {
                labels: monthLabels,
                datasets: [{
                    label: 'Receitas',
                    data: monthlyRevenues,
                    borderColor: '#50E3C2',
                    backgroundColor: 'rgba(80, 227, 194, 0.2)',
                    fill: true,
                    tension: 0.3
                },{
                    label: 'Despesas',
                    data: monthlyExpenses,
                    borderColor: '#E84A5F',
                    backgroundColor: 'rgba(232, 74, 95, 0.2)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#a9a9c5' },
                        grid: { color: 'rgba(169, 169, 197, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#a9a9c5' },
                        grid: { color: 'rgba(169, 169, 197, 0.1)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#a9a9c5' }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data]);
  
    return (
      <div className="annual-trend-chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
    );
};


const DashboardOverview = ({ transactions, annualTransactions, onCategorySelect, onEditTransaction, onDeleteTransaction }) => {
    const totalRevenue = transactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalRevenue - totalExpense;
    const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return (
        <div className="dashboard-grid">
            <div className="card summary-card balance">
                <h3>Saldo Atual</h3>
                <p>{formatCurrency(balance)}</p>
            </div>
            <div className="card summary-card revenue">
                <h3>Receitas do Mês</h3>
                <p>{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="card summary-card expense">
                <h3>Despesas do Mês</h3>
                <p>{formatCurrency(totalExpense)}</p>
            </div>
            <div className="card card-full-width">
                 <h3>Gastos por Categoria</h3>
                 <CategoryChart data={transactions} onCategoryClick={onCategorySelect} />
            </div>
             <div className="card card-full-width">
                 <h3>Tendência Anual</h3>
                 <AnnualTrendChart data={annualTransactions} />
            </div>
            <div className="card card-full-width">
                <h3>Transações Recentes</h3>
                <ul className="transaction-list">
                    {recentTransactions.map(t => (
                        <li key={t.id} className={t.type}>
                            <span>{t.description} <small>{t.category}</small></span>
                            <div className="transaction-actions">
                                <span className="transaction-amount">{formatCurrency(t.amount)}</span>
                                <button onClick={() => onEditTransaction(t)} className="btn-edit">Editar</button>
                                <button onClick={() => onDeleteTransaction(t.id)} className="btn-delete">Excluir</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const TransactionListView = ({ transactions, onEdit, onDelete }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const transactionsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [transactions]);

    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
    const totalPages = Math.ceil(transactions.length / transactionsPerPage);

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return (
        <div className="card">
            <ul className="transaction-list full-list">
                {currentTransactions.length > 0 ? currentTransactions.map(t => (
                    <li key={t.id} className={t.type}>
                        <div>
                            <span>{t.description}</span>
                            <small>{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})} - {t.category}</small>
                        </div>
                        <div className="transaction-actions">
                           <span className="transaction-amount">{formatCurrency(t.amount)}</span>
                           <button onClick={() => onEdit(t)} className="btn-edit">Editar</button>
                           <button onClick={() => onDelete(t.id)} className="btn-delete">Excluir</button>
                        </div>
                    </li>
                )) : <p>Nenhuma transação encontrada para este período.</p>}
            </ul>
            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="btn btn-secondary">
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="btn btn-secondary">
                        Próximo
                    </button>
                </div>
            )}
        </div>
    );
};

const CategoryManagerView = ({ categories, onAddCategory }) => {
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (newCategoryName.trim()) {
            onAddCategory(newCategoryName.trim());
            setNewCategoryName('');
        }
    };

    return (
        <div className="card">
            <h3>Gerenciar Categorias</h3>
            <form onSubmit={handleAdd} className="category-form">
                <input 
                    type="text" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nova categoria"
                />
                <button type="submit" className="btn btn-primary">Adicionar</button>
            </form>
            <ul className="category-list">
                {categories.map(cat => <li key={cat.id}>{cat.name}</li>)}
            </ul>
        </div>
    );
};

const ProfileView = () => (
    <div className="card">
        <h3>Meu Perfil</h3>
        <div className="form-group">
            <label>Email</label>
            <input type="email" value="admin@admin.com" readOnly />
        </div>
    </div>
);


const DashboardPage = ({ onLogout }) => {
    const [view, setView] = useState('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState(generateInitialTransactions());
    const [categories, setCategories] = useState(initialCategories);
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [editingTransaction, setEditingTransaction] = useState(null);

    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
    });

    useEffect(() => {
        setCategoryFilter(null);
    }, [selectedDate]);

    const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === selectedDate.month && transactionDate.getFullYear() === selectedDate.year;
    });
    
    const annualTransactions = transactions.filter(t => new Date(t.date).getFullYear() === selectedDate.year);


    const handleAddTransaction = (newTransaction) => {
        setTransactions(prev => [...prev, { ...newTransaction, id: Date.now() }]);
    };
    
    const handleUpdateTransaction = (updatedTransaction) => {
        setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    };

    const handleDeleteTransaction = (transactionId) => {
        if (window.confirm('Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.')) {
            setTransactions(prev => prev.filter(t => t.id !== transactionId));
        }
    };

    const handleOpenEditModal = (transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };

    const handleAddCategory = (categoryName) => {
        const newCategory = { id: categories.length + 1, name: categoryName };
        setCategories(prev => [...prev, newCategory]);
    };

    const viewTitles = {
        dashboard: 'Dashboard',
        revenues: 'Minhas Receitas',
        expenses: 'Minhas Despesas',
        categories: 'Categorias',
        profile: 'Meu Perfil',
    };

    const title = view === 'dashboard' && categoryFilter ? `Despesas: ${categoryFilter}` : viewTitles[view];

    const renderView = () => {
        switch (view) {
            case 'dashboard':
                if (categoryFilter) {
                    const categoryTransactions = filteredTransactions.filter(
                        t => t.type === 'expense' && t.category === categoryFilter
                    );
                    return (
                        <div className="filtered-transaction-view">
                            <button onClick={() => setCategoryFilter(null)} className="btn btn-secondary btn-back">
                                &larr; Voltar ao Dashboard
                            </button>
                            <TransactionListView transactions={categoryTransactions} onEdit={handleOpenEditModal} onDelete={handleDeleteTransaction}/>
                        </div>
                    );
                }
                return <DashboardOverview 
                            transactions={filteredTransactions} 
                            annualTransactions={annualTransactions} 
                            onCategorySelect={setCategoryFilter} 
                            onEditTransaction={handleOpenEditModal} 
                            onDeleteTransaction={handleDeleteTransaction}
                        />;
            case 'revenues':
                return <TransactionListView transactions={filteredTransactions.filter(t => t.type === 'revenue')} onEdit={handleOpenEditModal} onDelete={handleDeleteTransaction} />;
            case 'expenses':
                return <TransactionListView transactions={filteredTransactions.filter(t => t.type === 'expense')} onEdit={handleOpenEditModal} onDelete={handleDeleteTransaction} />;
            case 'categories':
                return <CategoryManagerView categories={categories} onAddCategory={handleAddCategory} />;
             case 'profile':
                return <ProfileView />;
            default:
                return <DashboardOverview 
                            transactions={filteredTransactions} 
                            annualTransactions={annualTransactions} 
                            onCategorySelect={setCategoryFilter} 
                            onEditTransaction={handleOpenEditModal}
                            onDeleteTransaction={handleDeleteTransaction}
                        />;
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar currentView={view} onNavigate={setView} onLogout={onLogout} />
            <main className="dashboard-main">
                 <DashboardHeader 
                    title={title}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    onOpenModal={() => setIsModalOpen(true)}
                />
                <div className="dashboard-content">
                    {renderView()}
                </div>
            </main>
            <AddTransactionModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                editingTransaction={editingTransaction}
                categories={categories}
            />
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
const App = () => {
  const [page, setPage] = useState('landing'); // 'landing', 'login', 'signup', 'forgot', 'dashboard'

  const handleNavigate = (targetPage: string) => {
    setPage(targetPage);
  };

  const handleAuthSuccess = () => {
    setPage('dashboard');
  };

  const handleLogout = () => {
    setPage('landing');
  };

  const renderPage = () => {
    switch (page) {
      case 'login':
      case 'signup':
      case 'forgot':
        return <AuthForm mode={page} onNavigate={handleNavigate} onAuthSuccess={handleAuthSuccess} />;
      case 'dashboard':
        return <DashboardPage onLogout={handleLogout}/>;
      case 'landing':
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return <div className="app-container">{renderPage()}</div>;
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
