import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type TransactionType = 'revenue' | 'expense';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string; // YYYY-MM-DD
    type: TransactionType;
}

interface Category {
    id: string;
    name: string;
}

// --- Mock Data ---
const initialTransactions: Transaction[] = [
    // Previous months data
    { id: 't1', description: 'Salário', amount: 5000, category: 'Salário', date: '2024-05-15', type: 'revenue' },
    { id: 't2', description: 'Aluguel', amount: 1500, category: 'Moradia', date: '2024-05-05', type: 'expense' },
    { id: 't3', description: 'Supermercado', amount: 400, category: 'Alimentação', date: '2024-05-10', type: 'expense' },
    { id: 't4', description: 'Freelance', amount: 750, category: 'Extra', date: '2024-05-20', type: 'revenue' },
    { id: 't5', description: 'Conta de Luz', amount: 150, category: 'Contas', date: '2024-05-22', type: 'expense' },

    // Current month data
    { id: 't6', description: 'Salário', amount: 5000, category: 'Salário', date: new Date().toISOString().slice(0, 8) + '15', type: 'revenue' },
    { id: 't7', description: 'Aluguel', amount: 1500, category: 'Moradia', date: new Date().toISOString().slice(0, 8) + '05', type: 'expense' },
    { id: 't8', description: 'Supermercado', amount: 600, category: 'Alimentação', date: new Date().toISOString().slice(0, 8) + '10', type: 'expense' },
    { id: 't9', description: 'Cinema', amount: 80, category: 'Lazer', date: new Date().toISOString().slice(0, 8) + '18', type: 'expense' },
    { id: 't10', description: 'Venda de item usado', amount: 200, category: 'Extra', date: new Date().toISOString().slice(0, 8) + '20', type: 'revenue' },
    { id: 't11', description: 'Internet', amount: 100, category: 'Contas', date: new Date().toISOString().slice(0, 8) + '12', type: 'expense' },
    
    // Future months data (for testing filters)
    { id: 't12', description: 'Salário', amount: 5000, category: 'Salário', date: '2024-07-15', type: 'revenue' },
    
    // More data for pagination and charts
    ...Array.from({ length: 15 }, (_, i) => ({
        id: `p${i}`,
        description: `Compra Aleatória ${i + 1}`,
        amount: Math.random() * 200 + 10,
        category: ['Alimentação', 'Lazer', 'Transporte'][i % 3],
        date: new Date().toISOString().slice(0, 8) + (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0'),
        type: 'expense' as TransactionType,
    })),
];

const initialCategories: Category[] = [
    { id: 'c1', name: 'Salário' },
    { id: 'c2', name: 'Moradia' },
    { id: 'c3', name: 'Alimentação' },
    { id: 'c4', name: 'Contas' },
    { id: 'c5', name: 'Lazer' },
    { id: 'c6', name: 'Transporte' },
    { id: 'c7', name: 'Extra' },
];

// --- Helper Functions ---
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
};
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
};


// --- Components ---
const FeatureCard = ({ icon, title, children }: { icon: string, title: string, children?: React.ReactNode }) => (
    <div className="feature-card">
        <div className="feature-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{children}</p>
    </div>
);

const TestimonialCard = ({ author, children }: { author: string, children?: React.ReactNode }) => (
    <div className="testimonial-card">
        <p>"{children}"</p>
        <span>- {author}</span>
    </div>
);

const LandingPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
    return (
        <div className="lp-container">
            <header className="lp-header">
                <div className="logo" onClick={() => onNavigate('landing')}>FinTrack</div>
                <button className="btn btn-secondary" onClick={() => onNavigate('login')}>Entrar</button>
            </header>
            <main className="lp-main">
                <section className="hero">
                    <h2>Controle suas finanças com simplicidade e poder.</h2>
                    <p>FinTrack é a sua nova ferramenta para uma vida financeira organizada e sem estresse.</p>
                    <button className="btn btn-primary btn-lg" onClick={() => onNavigate('signup')}>Comece Agora, é Grátis</button>
                </section>
                <section id="features" className="lp-section">
                    <h2>Como Funciona</h2>
                    <div className="features-grid">
                        <FeatureCard icon="🚀" title="Cadastre-se Rapidamente">
                            Crie sua conta em menos de um minuto e comece a organizar suas finanças.
                        </FeatureCard>
                        <FeatureCard icon="💸" title="Registre Transações">
                            Adicione suas receitas e despesas de forma intuitiva, categorizando cada uma.
                        </FeatureCard>
                        <FeatureCard icon="📊" title="Visualize Seus Dados">
                            Acompanhe seu progresso com gráficos e relatórios claros e objetivos.
                        </FeatureCard>
                    </div>
                </section>
                 <section id="testimonials" className="lp-section">
                    <h2>O que dizem nossos usuários</h2>
                    <div className="testimonials-grid">
                        <TestimonialCard author="Ana Paula">
                            Finalmente uma ferramenta que me ajuda a entender para onde meu dinheiro vai. Simples e eficaz!
                        </TestimonialCard>
                        <TestimonialCard author="Carlos Silva">
                           O FinTrack mudou minha relação com o dinheiro. Os gráficos são incríveis para visualizar meus gastos.
                        </TestimonialCard>
                        <TestimonialCard author="Mariana Costa">
                            Uso todos os dias para registrar minhas vendas como autônoma. Essencial para meu negócio!
                        </TestimonialCard>
                    </div>
                </section>
            </main>
            <footer className="lp-footer">
                <p>&copy; 2024 FinTrack. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};

const AuthForm = ({ type, onNavigate }: { type: 'login' | 'signup' | 'forgot', onNavigate: (page: string) => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (type === 'login' && email === 'admin@admin.com' && password === '123123') {
             setMessage('Login bem-sucedido! Redirecionando...');
             setTimeout(() => onNavigate('dashboard'), 1000);
             return;
        }

        if (type === 'forgot') {
            setMessage('Se uma conta com este e-mail existir, um link de recuperação foi enviado.');
            return;
        }
        
        setMessage(`${type === 'login' ? 'Login' : 'Cadastro'} bem-sucedido! Redirecionando...`);
        setTimeout(() => onNavigate(type === 'login' ? 'dashboard' : 'login'), 1500);
    };

    const title = type === 'login' ? 'Acessar sua conta' : type === 'signup' ? 'Criar nova conta' : 'Recuperar Senha';

    return (
        <div className="auth-container">
            <div className="auth-form-wrapper">
                <div className="auth-logo logo" onClick={() => onNavigate('landing')}>FinTrack</div>
                <h2>{title}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    {type !== 'forgot' && (
                        <div className="form-group">
                            <label htmlFor="password">Senha</label>
                            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                    )}
                    {message && <p className="auth-message">{message}</p>}
                    <button type="submit" className="btn btn-primary auth-btn">
                        {type === 'login' ? 'Entrar' : type === 'signup' ? 'Cadastrar' : 'Enviar Link'}
                    </button>
                </form>
                <div className="auth-links">
                    {type === 'login' && <a onClick={() => onNavigate('signup')}>Não tem uma conta? Cadastre-se</a>}
                    {type === 'signup' && <a onClick={() => onNavigate('login')}>Já tem uma conta? Entre</a>}
                    {type !== 'forgot' && <a onClick={() => onNavigate('forgot')}>Esqueceu sua senha?</a>}
                    {type === 'forgot' && <a onClick={() => onNavigate('login')}>Voltar para o Login</a>}
                </div>
            </div>
        </div>
    );
};

const AddTransactionModal = ({
    isOpen,
    onClose,
    onAddTransaction,
    onUpdateTransaction,
    categories,
    editingTransaction,
}: {
    isOpen: boolean;
    onClose: () => void;
    onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
    onUpdateTransaction: (transaction: Transaction) => void;
    categories: Category[];
    editingTransaction: Transaction | null;
}) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [type, setType] = useState<TransactionType>('expense');

    useEffect(() => {
        if (editingTransaction) {
            setDescription(editingTransaction.description);
            setAmount(String(editingTransaction.amount));
            setCategory(editingTransaction.category);
            setDate(editingTransaction.date);
            setType(editingTransaction.type);
        } else {
            resetForm();
        }
    }, [editingTransaction, isOpen]);
    
    const resetForm = () => {
        setDescription('');
        setAmount('');
        setCategory(categories.length > 0 ? categories[0].name : '');
        setDate(new Date().toISOString().slice(0, 10));
        setType('expense');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const transactionData = {
            description,
            amount: parseFloat(amount),
            category,
            date,
            type,
        };

        if (editingTransaction) {
            onUpdateTransaction({ ...transactionData, id: editingTransaction.id });
        } else {
            onAddTransaction(transactionData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>{editingTransaction ? 'Editar Transação' : 'Adicionar Transação'}</h2>
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
                        <label>Categoria</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} required>
                           {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Data</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <div className="form-group">
                         <label>Tipo</label>
                         <select value={type} onChange={e => setType(e.target.value as TransactionType)}>
                             <option value="expense">Despesa</option>
                             <option value="revenue">Receita</option>
                         </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">{editingTransaction ? 'Salvar Alterações' : 'Adicionar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SimpleMarkdownRenderer = ({ text }: { text: string }) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    return (
        <div className="analysis-modal-content">
            {lines.map((line, index) => {
                if (line.startsWith('### ')) {
                    return <h3 key={index}>{line.substring(4)}</h3>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index}>{line.substring(3)}</h2>;
                }
                if (line.startsWith('# ')) {
                    return <h2 key={index}>{line.substring(2)}</h2>;
                }
                if (line.startsWith('* ')) {
                    const boldedLine = line.substring(2).split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    );
                    return <li key={index} style={{ marginLeft: '20px' }}>{boldedLine}</li>;
                }
                const parts = line.split('**');
                return (
                    <p key={index}>
                        {parts.map((part, i) =>
                            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                        )}
                    </p>
                );
            })}
        </div>
    );
};


const FinancialAnalysisModal = ({ isOpen, onClose, isLoading, analysisText }: {
    isOpen: boolean,
    onClose: () => void,
    isLoading: boolean,
    analysisText: string | null
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {isLoading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Analisando suas finanças... O Gemini está pensando.</p>
                    </div>
                ) : (
                    <>
                        <h2>Análise Financeira com IA</h2>
                        {analysisText ? <SimpleMarkdownRenderer text={analysisText} /> : <p>Não foi possível gerar a análise.</p>}
                        <div className="modal-actions">
                            <button className="btn btn-primary" onClick={onClose}>Fechar</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const CategoryChart = ({ data, onCategoryClick }: { data: Transaction[], onCategoryClick: (category: string) => void }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!chartRef.current || !data) return;

        const spendingByCategory = data
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as Record<string, number>);

        const labels = Object.keys(spendingByCategory);
        const chartData = Object.values(spendingByCategory);

        const colors = ['#5A67D8', '#38A169', '#E53E3E', '#ED8936', '#805AD5', '#319795', '#D53F8C'];
        
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;
        
        chartInstanceRef.current = new (window as any).Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: chartData,
                    backgroundColor: labels.map((_, i) => colors[i % colors.length]),
                    borderColor: 'var(--surface-color)',
                    borderWidth: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: 'var(--text-muted)',
                            boxWidth: 20,
                            padding: 20,
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context: any) {
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
                },
                onClick: (_, elements) => {
                    if (elements.length > 0) {
                        const clickedIndex = elements[0].index;
                        const category = labels[clickedIndex];
                        onCategoryClick(category);
                    }
                }
            }
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };

    }, [data, onCategoryClick]);

    return (
        <div className="chart-container">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

const AnnualTrendChart = ({ transactions }: { transactions: Transaction[] }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!chartRef.current || !transactions) return;

        const monthlyData = Array(12).fill(0).map(() => ({ revenue: 0, expense: 0 }));

        transactions.forEach(t => {
            const month = new Date(t.date).getMonth();
            if (t.type === 'revenue') {
                monthlyData[month].revenue += t.amount;
            } else {
                monthlyData[month].expense += t.amount;
            }
        });

        const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const revenueData = monthlyData.map(m => m.revenue);
        const expenseData = monthlyData.map(m => m.expense);

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }
        
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;
        
        chartInstanceRef.current = new (window as any).Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: revenueData,
                        borderColor: 'var(--green)',
                        backgroundColor: 'rgba(56, 161, 105, 0.2)',
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        borderColor: 'var(--red)',
                        backgroundColor: 'rgba(229, 62, 62, 0.2)',
                        fill: true,
                        tension: 0.4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: 'var(--text-muted)' },
                        grid: { color: 'var(--border-color)' }
                    },
                    x: {
                        ticks: { color: 'var(--text-muted)' },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { labels: { color: 'var(--text-muted)' } },
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
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };

    }, [transactions]);
    
    return (
        <div className="annual-trend-chart-container">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

const MonthlyTrendChart = ({ transactions, selectedDate }: { transactions: Transaction[], selectedDate: { month: number, year: number } }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!chartRef.current || !transactions) return;

        const daysInMonth = new Date(selectedDate.year, selectedDate.month, 0).getDate();
        const dailyData = Array.from({length: daysInMonth}, () => ({ revenue: 0, expense: 0 }));

        transactions.forEach(t => {
            const day = new Date(t.date).getDate() - 1;
            if (t.type === 'revenue') {
                dailyData[day].revenue += t.amount;
            } else {
                dailyData[day].expense += t.amount;
            }
        });

        const labels = Array.from({length: daysInMonth}, (_, i) => String(i + 1));
        const revenueData = dailyData.map(d => d.revenue);
        const expenseData = dailyData.map(d => d.expense);
        
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        chartInstanceRef.current = new (window as any).Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: revenueData,
                        borderColor: 'var(--green)',
                        backgroundColor: 'rgba(56, 161, 105, 0.2)',
                        fill: true,
                        tension: 0.4,
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        borderColor: 'var(--red)',
                        backgroundColor: 'rgba(229, 62, 62, 0.2)',
                        fill: true,
                        tension: 0.4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                 scales: {
                    y: { beginAtZero: true, ticks: { color: 'var(--text-muted)' }, grid: { color: 'var(--border-color)' } },
                    x: { ticks: { color: 'var(--text-muted)' }, grid: { display: false } }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: (tooltipItems: any[]) => {
                                const day = tooltipItems[0].label;
                                const monthName = new Date(selectedDate.year, selectedDate.month - 1, 1)
                                                    .toLocaleString('pt-BR', { month: 'long' });
                                const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
                                return `${day} de ${capitalizedMonth}`;
                            },
                            label: (context: any) => {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += formatCurrency(context.parsed.y);
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

    }, [transactions, selectedDate]);

    return (
        <div className="monthly-trend-chart-container">
            <canvas ref={chartRef}></canvas>
        </div>
    );
};

const TransactionListView = ({
    title,
    transactions,
    onEdit,
    onDelete,
    isFullList = false,
}: {
    title: string;
    transactions: Transaction[];
    onEdit: (t: Transaction) => void;
    onDelete: (id: string) => void;
    isFullList?: boolean;
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const transactionsPerPage = 10;
    
    useEffect(() => {
        setCurrentPage(1);
    }, [transactions]);
    
    const indexOfLastTransaction = currentPage * transactionsPerPage;
    const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
    
    const totalPages = Math.ceil(transactions.length / transactionsPerPage);

    return (
        <div className={`card ${isFullList ? 'card-full-width' : ''}`}>
            <h3>{title}</h3>
            {currentTransactions.length > 0 ? (
                <ul className="transaction-list">
                    {currentTransactions.map(t => (
                        <li key={t.id} className={t.type}>
                            <div>
                                <span>{t.description}
                                <small>{t.category} • {formatDate(t.date)}</small>
                                </span>
                            </div>
                            <div className="transaction-actions">
                                <span className="transaction-amount">{formatCurrency(t.amount)}</span>
                                <button className="btn-icon" title="Editar" onClick={() => onEdit(t)}>✏️</button>
                                <button className="btn-icon btn-delete" title="Excluir" onClick={() => onDelete(t.id)}>🗑️</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : <p>Nenhuma transação encontrada.</p>}
            {isFullList && totalPages > 1 && (
                 <div className="pagination">
                    <button className="btn btn-secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                     <button className="btn btn-secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                        Próximo
                    </button>
                </div>
            )}
        </div>
    );
};

const CategoryManager = ({ categories, onAddCategory }: { categories: Category[], onAddCategory: (name: string) => void }) => {
    const [newCategory, setNewCategory] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            onAddCategory(newCategory.trim());
            setNewCategory('');
        }
    };
    
    return (
        <div className="card card-full-width">
            <h3>Gerenciar Categorias</h3>
            <form onSubmit={handleSubmit} className="category-form">
                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nova categoria" />
                <button type="submit" className="btn btn-primary">Adicionar</button>
            </form>
            <ul className="category-list">
                {categories.map(c => <li key={c.id}>{c.name}</li>)}
            </ul>
        </div>
    );
};

const ProfileView = () => (
    <div className="card card-full-width">
        <h3>Meu Perfil</h3>
        <div className="form-group">
            <label>Email</label>
            <input type="email" value="admin@admin.com" readOnly />
        </div>
    </div>
);

const DashboardHeader = ({
    title,
    selectedDate,
    onDateChange,
    onAnalyse,
}: {
    title: string;
    selectedDate: { month: number; year: number };
    onDateChange: (type: 'month' | 'year', value: number) => void;
    onAnalyse: () => void;
}) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    return (
        <header className="dashboard-header">
            <div className="header-left">
                <h2>{title}</h2>
                <div className="real-time-clock">{time.toLocaleTimeString('pt-BR')}</div>
            </div>
            <div className="header-center">
                 <div className="date-filters">
                    <select value={selectedDate.month} onChange={e => onDateChange('month', parseInt(e.target.value))}>
                        {months.map((month, i) => <option key={i} value={i + 1}>{month}</option>)}
                    </select>
                    <select value={selectedDate.year} onChange={e => onDateChange('year', parseInt(e.target.value))}>
                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
            </div>
            <div className="header-right">
                <button className="btn btn-secondary" onClick={onAnalyse}>Análise com IA ✨</button>
            </div>
        </header>
    );
};

const Sidebar = ({
    activeView,
    onNavigate,
    onLogout,
    theme,
    toggleTheme,
} : {
    activeView: string;
    onNavigate: (view: string) => void;
    onLogout: () => void;
    theme: string;
    toggleTheme: () => void;
}) => {
    return (
        <aside className="sidebar">
            <div className="logo" onClick={() => onNavigate('dashboard')}>FinTrack</div>
            <nav className="sidebar-nav">
                <a className={activeView === 'dashboard' ? 'active' : ''} onClick={() => onNavigate('dashboard')}>Dashboard</a>
                <a className={activeView === 'revenues' ? 'active' : ''} onClick={() => onNavigate('revenues')}>Receitas</a>
                <a className={activeView === 'expenses' ? 'active' : ''} onClick={() => onNavigate('expenses')}>Despesas</a>
                <a className={activeView === 'categories' ? 'active' : ''} onClick={() => onNavigate('categories')}>Categorias</a>
                <a className={activeView === 'profile' ? 'active' : ''} onClick={() => onNavigate('profile')}>Meu Perfil</a>
            </nav>
            <div className="theme-switcher-container">
                <label className="theme-switcher">
                    <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                    <span className="slider"></span>
                </label>
            </div>
            <button className="btn btn-secondary logout-btn" onClick={onLogout}>Sair</button>
        </aside>
    );
};


const DashboardOverview = ({
    transactions,
    filteredTransactions,
    selectedDate,
    onCategoryClick,
    onEdit,
    onDelete,
} : {
    transactions: Transaction[],
    filteredTransactions: Transaction[],
    selectedDate: {month: number, year: number},
    onCategoryClick: (category: string) => void,
    onEdit: (t: Transaction) => void,
    onDelete: (id: string) => void,
}) => {
    const revenue = filteredTransactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = revenue - expense;
    const recentTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    const annualTransactions = transactions.filter(t => new Date(t.date).getFullYear() === selectedDate.year);

    return (
        <div className="dashboard-grid">
            <div className="card summary-card balance">
                <h3>Saldo Mensal</h3>
                <p>{formatCurrency(balance)}</p>
            </div>
            <div className="card summary-card revenue">
                <h3>Receitas</h3>
                <p>{formatCurrency(revenue)}</p>
            </div>
            <div className="card summary-card expense">
                <h3>Despesas</h3>
                <p>{formatCurrency(expense)}</p>
            </div>
            
            <TransactionListView title="Transações Recentes" transactions={recentTransactions} onEdit={onEdit} onDelete={onDelete} />

            <div className="card card-full-width">
                 <h3>Gastos por Categoria</h3>
                 <CategoryChart data={filteredTransactions} onCategoryClick={onCategoryClick} />
            </div>

            <div className="card card-full-width">
                <div className="trends-container">
                    <div className="trend-chart-item">
                        <h3>Tendência Mensal</h3>
                        <MonthlyTrendChart transactions={filteredTransactions} selectedDate={selectedDate} />
                    </div>
                    <div className="trend-chart-item">
                        <h3>Tendência Anual</h3>
                        <AnnualTrendChart transactions={annualTransactions} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FilteredTransactionView = ({ transactions, category, onBack, onEdit, onDelete }: {
    transactions: Transaction[];
    category: string;
    onBack: () => void;
    onEdit: (t: Transaction) => void;
    onDelete: (id: string) => void;
}) => (
    <div>
        <button className="btn btn-secondary btn-back" onClick={onBack}>Voltar ao Dashboard</button>
        <TransactionListView
            title={`Despesas: ${category}`}
            transactions={transactions}
            onEdit={onEdit}
            onDelete={onDelete}
            isFullList={true}
        />
    </div>
);

const DashboardPage = ({ onLogout, theme, toggleTheme }: { onLogout: () => void, theme: string, toggleTheme: () => void }) => {
    const [view, setView] = useState('dashboard');
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });
    const [filteredCategory, setFilteredCategory] = useState<string | null>(null);

    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

    const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() + 1 === selectedDate.month &&
               transactionDate.getFullYear() === selectedDate.year;
    });

    const handleAnalyseFinances = async () => {
        setIsAnalysisModalOpen(true);
        setIsAnalysisLoading(true);
        setAnalysisResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `
                Você é um analista financeiro especialista. Analise a seguinte lista de transações (em formato JSON) para o mês selecionado.
                Forneça um resumo dos hábitos de consumo, identifique as 3 principais categorias de despesas, sugira 2 áreas onde o usuário pode economizar e dê um conselho geral para melhorar a saúde financeira.
                Formate sua resposta em Markdown. Use títulos (##), listas (*), e texto em negrito (**) para uma boa apresentação.
                
                Aqui estão as transações:
                ${JSON.stringify(filteredTransactions, null, 2)}
            `;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                  thinkingConfig: { thinkingBudget: 32768 }
                }
            });
            setAnalysisResult(response.text);
        } catch (error) {
            console.error("Error generating financial analysis:", error);
            setAnalysisResult("Ocorreu um erro ao gerar a análise. Tente novamente mais tarde.");
        } finally {
            setIsAnalysisLoading(false);
        }
    };

    const handleDateChange = (type: 'month' | 'year', value: number) => {
        setSelectedDate(prev => ({ ...prev, [type]: value }));
        setFilteredCategory(null);
    };

    const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
        setTransactions([...transactions, { ...transaction, id: `t${Date.now()}` }]);
    };
    
    const handleUpdateTransaction = (updatedTransaction: Transaction) => {
        setTransactions(transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    };

    const handleDeleteTransaction = (id: string) => {
        if(window.confirm('Tem certeza que deseja excluir esta transação?')) {
            setTransactions(transactions.filter(t => t.id !== id));
        }
    };
    
    const handleAddCategory = (name: string) => {
        if (!categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
            setCategories([...categories, { name, id: `c${Date.now()}` }]);
        }
    };
    
    const openEditModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const getHeaderTitle = () => {
        if (filteredCategory) return "Detalhes da Categoria";
        switch(view) {
            case 'dashboard': return 'Dashboard';
            case 'revenues': return 'Minhas Receitas';
            case 'expenses': return 'Minhas Despesas';
            case 'categories': return 'Minhas Categorias';
            case 'profile': return 'Meu Perfil';
            default: return 'Dashboard';
        }
    };

    const renderView = () => {
        if (filteredCategory) {
            const categoryTransactions = filteredTransactions.filter(t => t.category === filteredCategory && t.type === 'expense');
            return <FilteredTransactionView
                        transactions={categoryTransactions}
                        category={filteredCategory}
                        onBack={() => setFilteredCategory(null)}
                        onEdit={openEditModal}
                        onDelete={handleDeleteTransaction}
                    />;
        }

        switch(view) {
            case 'dashboard': return <DashboardOverview
                                        transactions={transactions}
                                        filteredTransactions={filteredTransactions}
                                        selectedDate={selectedDate}
                                        onCategoryClick={setFilteredCategory}
                                        onEdit={openEditModal}
                                        onDelete={handleDeleteTransaction}
                                    />;
            case 'revenues': return <TransactionListView title="Todas as Receitas" transactions={filteredTransactions.filter(t => t.type === 'revenue')} onEdit={openEditModal} onDelete={handleDeleteTransaction} isFullList />;
            case 'expenses': return <TransactionListView title="Todas as Despesas" transactions={filteredTransactions.filter(t => t.type === 'expense')} onEdit={openEditModal} onDelete={handleDeleteTransaction} isFullList />;
            case 'categories': return <CategoryManager categories={categories} onAddCategory={handleAddCategory} />;
            case 'profile': return <ProfileView />;
            default: return null;
        }
    }
    
    return (
        <div className="dashboard-layout">
            <Sidebar activeView={view} onNavigate={setView} onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} />
            <main className="dashboard-main">
                <DashboardHeader title={getHeaderTitle()} selectedDate={selectedDate} onDateChange={handleDateChange} onAnalyse={handleAnalyseFinances} />
                <button className="btn btn-primary" style={{alignSelf: 'flex-start', marginBottom: '2rem'}} onClick={openAddModal}>
                    Adicionar Transação
                </button>
                {renderView()}
            </main>
            <AddTransactionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddTransaction={handleAddTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                categories={categories}
                editingTransaction={editingTransaction}
            />
            <FinancialAnalysisModal
                isOpen={isAnalysisModalOpen}
                onClose={() => setIsAnalysisModalOpen(false)}
                isLoading={isAnalysisLoading}
                analysisText={analysisResult}
            />
        </div>
    );
};

const App = () => {
    const [page, setPage] = useState('landing');
    const [theme, setTheme] = useState('dark');
    
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    const renderPage = () => {
        switch (page) {
            case 'landing': return <LandingPage onNavigate={setPage} />;
            case 'login': return <AuthForm type="login" onNavigate={setPage} />;
            case 'signup': return <AuthForm type="signup" onNavigate={setPage} />;
            case 'forgot': return <AuthForm type="forgot" onNavigate={setPage} />;
            case 'dashboard': return <DashboardPage onLogout={() => setPage('login')} theme={theme} toggleTheme={toggleTheme} />;
            default: return <LandingPage onNavigate={setPage} />;
        }
    };
    return <div className="app-container">{renderPage()}</div>;
};

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode><App /></React.StrictMode>);