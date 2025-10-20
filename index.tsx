import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

declare var Chart: any; // Make Chart.js available globally

type Page = 'landing' | 'login' | 'signup' | 'forgotPassword' | 'dashboard';
type Transaction = {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
};
type Category = {
    id: string;
    name: string;
}
type DashboardView = 'overview' | 'income' | 'expenses' | 'categories' | 'profile';

// --- MOCK DATA ---
const mockCategories: Category[] = [
    { id: '1', name: 'Salário' },
    { id: '2', name: 'Alimentação' },
    { id: '3', name: 'Moradia' },
    { id: '4', name: 'Contas' },
    { id: '5', name: 'Extra' },
    { id: '6', name: 'Lazer' },
    { id: '7', name: 'Transporte' },
];

const mockTransactions: Transaction[] = [
  { id: '1', description: 'Salário Mensal', amount: 5000, category: 'Salário', type: 'income', date: '2023-10-01' },
  { id: '2', description: 'Compras no mercado', amount: -150.75, category: 'Alimentação', type: 'expense', date: '2023-10-03' },
  { id: '3', description: 'Aluguel', amount: -1200, category: 'Moradia', type: 'expense', date: '2023-10-01' },
  { id: '4', description: 'Conta de Internet', amount: -60, category: 'Contas', type: 'expense', date: '2023-10-05' },
  { id: '5', description: 'Projeto Freelance', amount: 750, category: 'Extra', type: 'income', date: '2023-10-07' },
  { id: '6', description: 'Jantar com amigos', amount: -85.50, category: 'Lazer', type: 'expense', date: '2023-10-08' },
];

// --- MOCK API (Simulates Supabase calls) ---
const api = {
  login: async (email, password) => {
    console.log('Tentando login com:', email, password);
    return new Promise(resolve => setTimeout(() => resolve({ user: { id: '123', email }, error: null }), 1000));
  },
  signup: async (email, password) => {
    console.log('Tentando cadastro com:', email, password);
    return new Promise(resolve => setTimeout(() => resolve({ user: { id: '123', email }, error: null }), 1000));
  },
  forgotPassword: async (email) => {
    console.log('Enviando reset de senha para:', email);
    return new Promise(resolve => setTimeout(() => resolve({ error: null }), 1000));
  },
};

// --- UI Components ---
const Spinner = () => <div className="spinner"></div>;

const LandingPage = ({ setPage }) => {
  const FeatureCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children?: React.ReactNode }) => (
    <div className="lp-feature-card">
      {icon}
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );

  return (
    <div className="lp-wrapper">
      <div className="container lp-container">
        <header className="lp-header">
          <h1>Assuma o Controle das Suas Finanças.</h1>
          <p>FinTrack é a ferramenta simples, moderna e poderosa para acompanhar suas receitas e despesas, ajudando você a alcançar seus objetivos financeiros.</p>
          <div className="lp-cta-group">
              <button className="btn" onClick={() => setPage('signup')} style={{width: 'auto', padding: '0.85rem 2rem'}}>Comece Agora</button>
              <button className="btn" onClick={() => setPage('login')} style={{width: 'auto', padding: '0.85rem 2rem', background: 'none', border: '1px solid var(--primary-color)'}}>Entrar</button>
          </div>
        </header>

        <section className="lp-section">
            <h2>Como Funciona</h2>
            <div className="lp-features">
                <FeatureCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20v-10M18 20V4"/></svg>} title="1. Adicione Suas Transações">Registre suas receitas e despesas em segundos. Organize tudo por categorias personalizadas.</FeatureCard>
                <FeatureCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20v-10M18 20V4"/></svg>} title="2. Visualize Seus Dados">Gráficos intuitivos mostram para onde seu dinheiro está indo, ajudando a identificar padrões de gastos.</FeatureCard>
                <FeatureCard icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20v-6M6 20v-10M18 20V4"/></svg>} title="3. Alcance Seus Objetivos">Com uma visão clara de suas finanças, você pode planejar melhor, economizar mais e alcançar suas metas.</FeatureCard>
            </div>
        </section>

        <section className="lp-section">
            <h2>O que dizem nossos usuários</h2>
            <div className="lp-testimonials">
                <div className="lp-testimonial-card">
                    <p>"Finalmente uma ferramenta que não é complicada! O FinTrack me ajudou a entender meus gastos e a economizar para minhas férias."</p>
                    <span>- Ana Silva, Designer</span>
                </div>
                <div className="lp-testimonial-card">
                    <p>"O visual é limpo e os gráficos são super úteis. Consigo ver exatamente onde preciso cortar despesas. Recomendo!"</p>
                    <span>- João Pereira, Desenvolvedor</span>
                </div>
            </div>
        </section>

        <footer className="lp-footer">
            <p>&copy; 2024 FinTrack. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};


const AuthForm = ({ page, setPage, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const titles = {
    login: 'Bem-vindo de volta!',
    signup: 'Crie sua conta',
    forgotPassword: 'Recuperar Senha',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // TEST ONLY
    if (page === 'login' && email === 'admin@admin.com' && password === '123123') {
        onAuthSuccess();
        return;
    }

    try {
      let result;
      if (page === 'login') {
        result = await api.login(email, password);
      } else if (page === 'signup') {
        result = await api.signup(email, password);
      } else {
        result = await api.forgotPassword(email);
        alert('Se o e-mail estiver correto, você receberá um link para redefinir sua senha.');
        setPage('login');
        return;
      }
      
      if (result.error) throw new Error(result.error.message);
      if (result.user) {
        onAuthSuccess();
      }
    } catch (err) {
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{titles[page]}</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {page !== 'forgotPassword' && (
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          )}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? <Spinner /> : (page === 'signup' ? 'Cadastrar' : (page === 'login' ? 'Entrar' : 'Enviar'))}
          </button>
          {error && <p style={{ color: 'var(--error-color)', marginTop: '1rem', textAlign: 'center' }}>{error}</p>}
        </form>
        <div className="auth-footer">
          {page === 'login' && <p>Não tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); setPage('signup'); }}>Cadastre-se</a> | <a href="#" onClick={(e) => { e.preventDefault(); setPage('forgotPassword'); }}>Esqueceu a senha?</a></p>}
          {page === 'signup' && <p>Já tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); setPage('login'); }}>Entrar</a></p>}
          {page === 'forgotPassword' && <p>Lembrou a senha? <a href="#" onClick={(e) => { e.preventDefault(); setPage('login'); }}>Entrar</a></p>}
        </div>
      </div>
    </div>
  );
};

const AddTransactionModal = ({ categories, onClose, onAddTransaction }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(categories.length > 0 ? categories[0].name : '');
    const [type, setType] = useState('expense');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newTransaction: Transaction = {
            id: new Date().toISOString(),
            description,
            amount: type === 'expense' ? -Math.abs(parseFloat(amount)) : parseFloat(amount),
            category,
            type: type as 'income' | 'expense',
            date
        };
        onAddTransaction(newTransaction);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Adicionar Transação</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tipo</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="expense">Despesa</option>
                            <option value="income">Receita</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Descrição</label>
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Valor</label>
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="0.01" step="0.01" />
                    </div>
                    <div className="form-group">
                        <label>Categoria</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                           {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Data</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn">Adicionar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const CategoryChart = ({ transactions }: { transactions: Transaction[] }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (!chartRef.current || !transactions) return;

        const spendingByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce<Record<string, number>>((acc, t) => {
                const amount = Math.abs(t.amount);
                acc[t.category] = (acc[t.category] || 0) + amount;
                return acc;
            }, {});

        const labels = Object.keys(spendingByCategory);
        const data = Object.values(spendingByCategory);
        
        const chartColors = [
            '#4CAF50', '#F44336', '#2196F3', '#FFC107', '#9C27B0',
            '#FF9800', '#009688', '#673AB7', '#E91E63', '#3F51B5'
        ];

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        chartInstanceRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Despesas por Categoria',
                    data: data,
                    backgroundColor: chartColors,
                    borderColor: 'var(--surface-color)',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'var(--on-surface-variant-color)',
                            font: { family: "'Inter', sans-serif" }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed !== null) {
                                    label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed);
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [transactions]);

    return (
        <div className="chart-container">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};


const DashboardOverview = ({ transactions }: { transactions: Transaction[] }) => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome + totalExpense;
    const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return (
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <h3>Saldo Atual</h3>
                <p className="amount">{balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div className="dashboard-card">
                <h3>Receitas</h3>
                <p className="amount income">{totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div className="dashboard-card">
                <h3>Despesas</h3>
                <p className="amount expense">{Math.abs(totalExpense).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
            </div>
            <div className="dashboard-card transaction-list">
                <h3>Últimas Transações</h3>
                <ul>
                    {recentTransactions.map(t => (
                        <li key={t.id}>
                            <div className="transaction-item-details">
                                <span className="description">{t.description}</span>
                                <span className="category">{t.category}</span>
                            </div>
                            <span className={`transaction-item-amount ${t.type === 'income' ? 'income' : 'expense'}`}>
                                {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="dashboard-card" style={{gridColumn: 'span 2'}}>
                <h3>Despesas por Categoria</h3>
                <CategoryChart transactions={transactions} />
            </div>
        </div>
    );
};

const TransactionListView = ({ title, transactions }: { title: string, transactions: Transaction[] }) => (
    <div className="dashboard-card transaction-list full">
        <h2>{title}</h2>
        <ul>
            {[...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                <li key={t.id}>
                    <div className="transaction-item-details">
                        <span className="description">{t.description}</span>
                        <div className="category-date">
                            <span className="category">{t.category}</span>
                            <span className="date">{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                        </div>
                    </div>
                    <span className={`transaction-item-amount ${t.type === 'income' ? 'income' : 'expense'}`}>
                        {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </li>
            ))}
        </ul>
    </div>
);

const CategoryView = ({ categories, onAddCategory }) => {
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newCategoryName.trim() === '') return;
        const newCategory: Category = {
            id: new Date().toISOString(),
            name: newCategoryName.trim()
        };
        onAddCategory(newCategory);
        setNewCategoryName('');
    };

    return (
        <div className="dashboard-card">
            <h2>Gerenciar Categorias</h2>
            <form className="category-add-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="categoryName">Nova Categoria</label>
                    <input
                        type="text"
                        id="categoryName"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Ex: Educação"
                    />
                </div>
                <button type="submit" className="btn">Adicionar</button>
            </form>

            <div className="category-list">
                <h4>Categorias existentes</h4>
                 <ul>
                    {categories.map(cat => (
                        <li key={cat.id}>{cat.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const ProfileView = () => {
    const userEmail = 'admin@admin.com'; // Static for now

    return (
        <div className="dashboard-card">
            <h2>Meu Perfil</h2>
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={userEmail} readOnly />
            </div>
        </div>
    );
};


const DashboardPage = ({ onLogout }) => {
  const [view, setView] = useState<DashboardView>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [categories, setCategories] = useState<Category[]>(mockCategories);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const addCategory = (category: Category) => {
      setCategories(prev => [category, ...prev]);
  };

  const viewTitles = {
      overview: 'Dashboard',
      income: 'Receitas',
      expenses: 'Despesas',
      categories: 'Categorias',
      profile: 'Meu Perfil',
  };

  const renderView = () => {
    switch (view) {
      case 'overview': return <DashboardOverview transactions={transactions} />;
      case 'income': return <TransactionListView title="Receitas" transactions={transactions.filter(t => t.type === 'income')} />;
      case 'expenses': return <TransactionListView title="Despesas" transactions={transactions.filter(t => t.type === 'expense')} />;
      case 'categories': return <CategoryView categories={categories} onAddCategory={addCategory} />;
      case 'profile': return <ProfileView />;
      default: return <DashboardOverview transactions={transactions} />;
    }
  };

  return (
    <div className="dashboard-layout">
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>FinTrack</h2>
            </div>
            <nav className="sidebar-nav">
                <button onClick={() => setView('overview')} className={view === 'overview' ? 'active' : ''}>Dashboard</button>
                <button onClick={() => setView('income')} className={view === 'income' ? 'active' : ''}>Receitas</button>
                <button onClick={() => setView('expenses')} className={view === 'expenses' ? 'active' : ''}>Despesas</button>
                <button onClick={() => setView('categories')} className={view === 'categories' ? 'active' : ''}>Categorias</button>
                <button onClick={() => setView('profile')} className={view === 'profile' ? 'active' : ''}>Meu Perfil</button>
            </nav>
            <div className="sidebar-footer">
                <button onClick={onLogout}>Sair</button>
            </div>
        </aside>
        <main className="dashboard-content">
            <header className="dashboard-content-header">
                <h1>{viewTitles[view]}</h1>
                {view !== 'categories' && view !== 'profile' && <button className="btn" onClick={() => setIsModalOpen(true)}>+ Adicionar Transação</button>}
            </header>
            <section className="dashboard-main">
                {renderView()}
            </section>
        </main>
        {isModalOpen && <AddTransactionModal categories={categories} onClose={() => setIsModalOpen(false)} onAddTransaction={addTransaction} />}
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [page, setPage] = useState<Page>('landing');

  const handleLogout = () => {
    // In a real app, you'd clear the user session here
    setPage('login');
  };
  
  const handleAuthSuccess = () => {
      setPage('dashboard');
  }

  const renderPage = () => {
    switch (page) {
      case 'landing': return <LandingPage setPage={setPage} />;
      case 'login': return <AuthForm page="login" setPage={setPage} onAuthSuccess={handleAuthSuccess} />;
      case 'signup': return <AuthForm page="signup" setPage={setPage} onAuthSuccess={handleAuthSuccess} />;
      case 'forgotPassword': return <AuthForm page="forgotPassword" setPage={setPage} onAuthSuccess={handleAuthSuccess} />;
      case 'dashboard': return <DashboardPage onLogout={handleLogout} />;
      default: return <LandingPage setPage={setPage} />;
    }
  };

  return <>{renderPage()}</>;
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);