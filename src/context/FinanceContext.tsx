import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Transaction, 
  Category, 
  PaymentMethod, 
  Budget, 
  UserSettings, 
  FinancialMetrics, 
  AlertNotification, 
  CurrencyCode,
  FortnightType,
  TransactionType,
  CreditCard,
  CreditCardMovement,
  Loan,
  LoanPayment
} from '../types';
import { storageService } from '../services/storageService';
import { calculateFinancialMetrics, generateSystemAlerts, filterTransactionsByMonth, getFortnightFromDate, convertAmount } from '../services/financeCalculations';
import { useAuth } from './AuthContext';
import { ConfirmDialog, ConfirmDialogOptions } from '../components/common/ConfirmDialog';

import { cloudStorageService } from '../services/cloudStorageService';
import { isSupabaseConfigured } from '../services/supabaseClient';

interface FinanceContextType {
  // Estado básico
  categories: Category[];
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  budgets: Budget[];
  settings: UserSettings;

  // NUEVO: Tarjetas y Préstamos
  creditCards: CreditCard[];
  cardMovements: CreditCardMovement[];
  loans: Loan[];
  loanPayments: LoanPayment[];

  // Estado de Nube y Sincronización
  isCloudSyncing: boolean;
  isCloudActive: boolean;
  syncCloudData: () => Promise<void>;
  
  // Filtros
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedFortnight: FortnightType;
  setSelectedFortnight: (fn: FortnightType) => void;
  displayCurrency: CurrencyCode;
  setDisplayCurrency: (cur: CurrencyCode) => void;

  // Métricas y Alertas
  metrics: FinancialMetrics;
  alerts: AlertNotification[];
  dismissedAlertIds: string[];
  dismissAlert: (id: string) => void;

  // CRUD Transacciones
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  toggleTransactionStatus: (id: string) => void;

  // CRUD Tarjetas de Crédito
  addCreditCard: (card: Omit<CreditCard, 'id' | 'createdAt' | 'userId'>) => void;
  updateCreditCard: (card: CreditCard) => void;
  deleteCreditCard: (id: string) => void;
  payCreditCard: (cardId: string, amount: number, sourcePaymentMethodId: string, date: string, notes?: string) => void;

  // CRUD Préstamos y Deudas
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'userId'>) => void;
  updateLoan: (loan: Loan) => void;
  deleteLoan: (id: string) => void;
  payLoanInstallment: (loanId: string, amount: number, sourcePaymentMethodId: string, date: string, notes?: string) => void;

  // CRUD Categorías
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  // CRUD Métodos de Pago
  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => void;
  updatePaymentMethod: (pm: PaymentMethod) => void;
  deletePaymentMethod: (id: string) => void;

  // CRUD Presupuestos
  addBudget: (bgt: Omit<Budget, 'id'>) => void;
  updateBudget: (bgt: Budget) => void;
  deleteBudget: (id: string) => void;

  // Ajustes
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;

  // Modales
  quickModalOpen: boolean;
  quickModalType: TransactionType;
  openQuickModal: (type?: TransactionType) => void;
  closeQuickModal: () => void;

  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;

  // Confirmación Global de Borrado
  confirmDelete: (options: ConfirmDialogOptions) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'guest';

  // Estados cargados desde almacenamiento aislado
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories(userId));
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => storageService.getPaymentMethods(userId));
  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => storageService.getCreditCards(userId));
  const [cardMovements, setCardMovements] = useState<CreditCardMovement[]>(() => storageService.getCardMovements(userId));
  const [loans, setLoans] = useState<Loan[]>(() => storageService.getLoans(userId));
  const [loanPayments, setLoanPayments] = useState<LoanPayment[]>(() => storageService.getLoanPayments(userId));
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.getTransactions(userId));
  const [budgets, setBudgets] = useState<Budget[]>(() => storageService.getBudgets(userId));
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings(userId));

  // Nube y Sincronización
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const isCloudActive = isSupabaseConfigured();

  const syncCloudData = async () => {
    if (!currentUser || !cloudStorageService.isReady()) return;
    setIsCloudSyncing(true);
    try {
      const uId = currentUser.id;

      // 1. Guardar perfil en la nube
      await cloudStorageService.saveProfile(currentUser);

      // 2. Obtener estado real en la nube de Supabase
      const [cCloud, pmCloud, ccCloud, cmCloud, lCloud, lpCloud, txCloud, bCloud] = await Promise.all([
        cloudStorageService.fetchCategories(uId),
        cloudStorageService.fetchPaymentMethods(uId),
        cloudStorageService.fetchCreditCards(uId),
        cloudStorageService.fetchCardMovements(uId),
        cloudStorageService.fetchLoans(uId),
        cloudStorageService.fetchLoanPayments(uId),
        cloudStorageService.fetchTransactions(uId),
        cloudStorageService.fetchBudgets(uId),
      ]);

      // Supabase es la fuente de verdad única (Cloud-First) con actualización condicional anti-flicker
      if (txCloud !== null) {
        setTransactions(prev => {
          if (JSON.stringify(prev) === JSON.stringify(txCloud)) return prev;
          storageService.saveTransactions(uId, txCloud);
          return txCloud;
        });
      }

      if (cCloud !== null) {
        setCategories(prev => {
          if (JSON.stringify(prev) === JSON.stringify(cCloud)) return prev;
          storageService.saveCategories(uId, cCloud);
          return cCloud;
        });
      }

      if (pmCloud !== null) {
        setPaymentMethods(prev => {
          if (JSON.stringify(prev) === JSON.stringify(pmCloud)) return prev;
          storageService.savePaymentMethods(uId, pmCloud);
          return pmCloud;
        });
      }

      if (ccCloud !== null) {
        setCreditCards(prev => {
          if (JSON.stringify(prev) === JSON.stringify(ccCloud)) return prev;
          storageService.saveCreditCards(uId, ccCloud);
          return ccCloud;
        });
      }

      if (cmCloud !== null) {
        setCardMovements(prev => {
          if (JSON.stringify(prev) === JSON.stringify(cmCloud)) return prev;
          storageService.saveCardMovements(uId, cmCloud);
          return cmCloud;
        });
      }

      if (lCloud !== null) {
        setLoans(prev => {
          if (JSON.stringify(prev) === JSON.stringify(lCloud)) return prev;
          storageService.saveLoans(uId, lCloud);
          return lCloud;
        });
      }

      if (lpCloud !== null) {
        setLoanPayments(prev => {
          if (JSON.stringify(prev) === JSON.stringify(lpCloud)) return prev;
          storageService.saveLoanPayments(uId, lpCloud);
          return lpCloud;
        });
      }

      if (bCloud !== null) {
        setBudgets(prev => {
          if (JSON.stringify(prev) === JSON.stringify(bCloud)) return prev;
          storageService.saveBudgets(uId, bCloud);
          return bCloud;
        });
      }
    } catch (err) {
      console.error('Error al realizar sincronización con la nube:', err);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const [quickModalOpen, setQuickModalOpen] = useState<boolean>(false);
  const [quickModalType, setQuickModalType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [confirmDialogOptions, setConfirmDialogOptions] = useState<ConfirmDialogOptions | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Auto-sincronización al iniciar sesión, suscripción en tiempo real y Polling Suave de Respaldo (15s)
  useEffect(() => {
    if (!currentUser || !cloudStorageService.isReady()) return;

    syncCloudData();

    const unsubscribe = cloudStorageService.subscribeToChanges(currentUser.id, () => {
      if (!quickModalOpen && !editingTransaction && !isConfirmOpen) {
        syncCloudData();
      }
    });

    // Polling inteligente cada 15s (pausado si el usuario está escribiendo en un formulario/modal)
    const pollInterval = setInterval(() => {
      if (!quickModalOpen && !editingTransaction && !isConfirmOpen) {
        syncCloudData();
      }
    }, 15000);

    return () => {
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, [currentUser?.id, quickModalOpen, editingTransaction, isConfirmOpen]);

  // Filtros
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentYearMonth);
  const [selectedFortnight, setSelectedFortnight] = useState<FortnightType>('all');
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>(currentUser?.primaryCurrency || 'DOP');
  
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  const confirmDelete = (options: ConfirmDialogOptions) => {
    setConfirmDialogOptions(options);
    setIsConfirmOpen(true);
  };

  // Recargar base de datos cuando cambia el usuario autenticado
  useEffect(() => {
    if (currentUser) {
      const uId = currentUser.id;
      const userSettings = storageService.getSettings(uId);
      setCategories(storageService.getCategories(uId));
      setPaymentMethods(storageService.getPaymentMethods(uId));
      setCreditCards(storageService.getCreditCards(uId));
      setCardMovements(storageService.getCardMovements(uId));
      setLoans(storageService.getLoans(uId));
      setLoanPayments(storageService.getLoanPayments(uId));
      setTransactions(storageService.getTransactions(uId));
      setBudgets(storageService.getBudgets(uId));
      setSettings(userSettings);
      setDisplayCurrency(currentUser.primaryCurrency || userSettings.primaryCurrency || 'DOP');
      setDismissedAlertIds([]);

      // Si la nube está activa, cargar datos de Supabase y suscribirse en tiempo real
      if (cloudStorageService.isReady()) {
        syncCloudData();
        const unsubscribe = cloudStorageService.subscribeToChanges(uId, () => {
          syncCloudData();
        });
        return () => unsubscribe();
      }
    }
  }, [currentUser?.id]);

  // Tema
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Persistencia reactiva aislada por usuario (Local + Nube)
  useEffect(() => {
    if (currentUser) {
      storageService.saveCategories(currentUser.id, categories);
      categories.forEach(c => cloudStorageService.saveCategory(currentUser.id, c));
    }
  }, [categories, currentUser]);

  useEffect(() => {
    if (currentUser) {
      storageService.savePaymentMethods(currentUser.id, paymentMethods);
      paymentMethods.forEach(pm => cloudStorageService.savePaymentMethod(currentUser.id, pm));
    }
  }, [paymentMethods, currentUser]);

  useEffect(() => {
    if (currentUser) {
      storageService.saveCreditCards(currentUser.id, creditCards);
      creditCards.forEach(c => cloudStorageService.saveCreditCard(currentUser.id, c));
    }
  }, [creditCards, currentUser]);

  useEffect(() => {
    if (currentUser) {
      storageService.saveCardMovements(currentUser.id, cardMovements);
      cardMovements.forEach(cm => cloudStorageService.saveCardMovement(currentUser.id, cm));
    }
  }, [cardMovements, currentUser]);

  useEffect(() => {
    if (currentUser) {
      storageService.saveLoans(currentUser.id, loans);
      loans.forEach(l => cloudStorageService.saveLoan(currentUser.id, l));
    }
  }, [loans, currentUser]);

  useEffect(() => {
    if (currentUser) {
      storageService.saveLoanPayments(currentUser.id, loanPayments);
      loanPayments.forEach(lp => cloudStorageService.saveLoanPayment(currentUser.id, lp));
    }
  }, [loanPayments, currentUser]);

  useEffect(() => {
    if (currentUser) {
      storageService.saveTransactions(currentUser.id, transactions);
      transactions.forEach(t => cloudStorageService.saveTransaction(currentUser.id, t));
    }
  }, [transactions, currentUser]);

  useEffect(() => {
    if (currentUser) {
      storageService.saveBudgets(currentUser.id, budgets);
      budgets.forEach(b => cloudStorageService.saveBudget(currentUser.id, b));
    }
  }, [budgets, currentUser]);

  useEffect(() => {
    if (currentUser) storageService.saveSettings(currentUser.id, settings);
  }, [settings, currentUser]);

  // Filtrado de transacciones
  const monthTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedMonth);
  }, [transactions, selectedMonth]);

  const filteredTransactions = useMemo(() => {
    if (selectedFortnight === 'all') return monthTransactions;
    return monthTransactions.filter(tx => {
      const fn = tx.fortnight || getFortnightFromDate(tx.date, settings.q1EndDay);
      return fn === selectedFortnight;
    });
  }, [monthTransactions, selectedFortnight, settings.q1EndDay]);

  // CÁLCULO DE MÉTRICAS GLOBALES (CON SALDOS ACUMULATIVOS Y PATRIMONIO)
  const metrics = useMemo<FinancialMetrics>(() => {
    let incomePaid = 0;
    let incomePending = 0;
    let expensePaid = 0; // Solo consumo
    let expensePending = 0;
    let debtPayments = 0;

    const q1 = { incomePaid: 0, incomePending: 0, expensePaid: 0, expensePending: 0, netCashFlow: 0 };
    const q2 = { incomePaid: 0, incomePending: 0, expensePaid: 0, expensePending: 0, netCashFlow: 0 };

    filteredTransactions.forEach(tx => {
      const amountInTarget = convertAmount(
        tx.amount,
        tx.currency,
        displayCurrency,
        settings.exchangeRateUSDToDOP
      );

      const fn = tx.fortnight || getFortnightFromDate(tx.date, settings.q1EndDay);

      if (tx.type === 'income') {
        if (tx.status === 'paid') {
          incomePaid += amountInTarget;
          if (fn === 'q1') q1.incomePaid += amountInTarget;
          else q2.incomePaid += amountInTarget;
        } else {
          incomePending += amountInTarget;
          if (fn === 'q1') q1.incomePending += amountInTarget;
          else q2.incomePending += amountInTarget;
        }
      } else {
        // Gasto
        if (tx.isDebtPayment) {
          debtPayments += amountInTarget;
        } else {
          // Gasto de consumo
          if (tx.status === 'paid') {
            expensePaid += amountInTarget;
            if (fn === 'q1') q1.expensePaid += amountInTarget;
            else q2.expensePaid += amountInTarget;
          } else {
            expensePending += amountInTarget;
            if (fn === 'q1') q1.expensePending += amountInTarget;
            else q2.expensePending += amountInTarget;
          }
        }
      }
    });

    q1.netCashFlow = (q1.incomePaid + q1.incomePending) - (q1.expensePaid + q1.expensePending);
    q2.netCashFlow = (q2.incomePaid + q2.incomePending) - (q2.expensePaid + q2.expensePending);

    // Dinero disponible en cuentas líquidas (bancos y efectivo)
    const currentBalance = paymentMethods
      .filter(pm => pm.type !== 'credit_card')
      .reduce((sum, pm) => {
        const val = convertAmount(pm.balance || 0, pm.currency, displayCurrency, settings.exchangeRateUSDToDOP);
        return sum + val;
      }, 0);

    const realAvailable = currentBalance - expensePending;

    // Deudas acumulativas de Tarjetas de Crédito
    const totalCardDebt = creditCards.reduce((sum, c) => {
      const debt = convertAmount(c.currentDebt, c.currency, displayCurrency, settings.exchangeRateUSDToDOP);
      return sum + debt;
    }, 0);

    const totalAvailableCredit = creditCards.reduce((sum, c) => {
      const avail = Math.max(0, c.creditLimit - c.currentDebt);
      return sum + convertAmount(avail, c.currency, displayCurrency, settings.exchangeRateUSDToDOP);
    }, 0);

    // Deudas acumulativas de Préstamos (persisten a través de los meses)
    const totalLoanDebt = loans
      .filter(l => l.status !== 'completed' && l.pendingBalance > 0)
      .reduce((sum, l) => {
        const p = convertAmount(l.pendingBalance, l.currency, displayCurrency, settings.exchangeRateUSDToDOP);
        return sum + p;
      }, 0);

    const totalDebts = totalCardDebt + totalLoanDebt;
    const netWorth = currentBalance - totalDebts;

    const totalIn = incomePaid + incomePending;
    const savingsAmount = Math.max(0, currentBalance);
    const savingsRate = totalIn > 0 ? Math.round(((totalIn - (expensePaid + expensePending)) / totalIn) * 100) : 0;

    return {
      totalIncome: incomePaid,
      totalExpense: expensePaid,
      totalDebtPayments: debtPayments,
      totalPendingIncome: incomePending,
      totalPendingExpense: expensePending,
      currentBalance,
      realAvailable,
      totalCardDebt,
      totalLoanDebt,
      totalDebts,
      totalAvailableCredit,
      netWorth,
      savingsAmount,
      savingsRate: Math.max(0, savingsRate),
      q1,
      q2
    };
  }, [filteredTransactions, paymentMethods, creditCards, loans, displayCurrency, settings]);

  // Alertas del sistema
  const alerts = useMemo(() => {
    if (!settings.internalRemindersActive) return [];
    const allAlerts = generateSystemAlerts(monthTransactions, budgets, categories, settings);
    return allAlerts.filter(a => !dismissedAlertIds.includes(a.id));
  }, [monthTransactions, budgets, categories, settings, dismissedAlertIds]);

  const dismissAlert = (id: string) => {
    setDismissedAlertIds(prev => [...prev, id]);
  };

  // --- OPERACIONES DE TRANSACCIONES ---
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const fortnight = tx.fortnight || getFortnightFromDate(tx.date, settings.q1EndDay);
    const newTxId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    const newTx: Transaction = {
      ...tx,
      fortnight,
      id: newTxId,
      createdAt: new Date().toISOString()
    };

    // Si el gasto fue con tarjeta de crédito, aumentar automáticamente la deuda de la tarjeta y registrar movimiento
    if (tx.type === 'expense' && tx.linkedCardId) {
      setCreditCards(prev => prev.map(card => {
        if (card.id === tx.linkedCardId) {
          const newDebt = card.currentDebt + tx.amount;
          
          // Registrar movimiento en la tarjeta
          const movement: CreditCardMovement = {
            id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            cardId: card.id,
            type: 'purchase',
            concept: tx.title,
            amount: tx.amount,
            resultingDebt: newDebt,
            date: tx.date,
            createdAt: new Date().toISOString()
          };
          setCardMovements(mPrev => [movement, ...mPrev]);

          return { ...card, currentDebt: newDebt };
        }
        return card;
      }));
    } else if (tx.type === 'expense' && tx.status === 'paid') {
      // Si fue con cuenta bancaria o efectivo pagado, disminuir saldo de esa cuenta
      setPaymentMethods(prev => prev.map(pm => {
        if (pm.id === tx.paymentMethodId && pm.type !== 'credit_card') {
          return { ...pm, balance: Math.max(0, (pm.balance || 0) - tx.amount) };
        }
        return pm;
      }));
    } else if (tx.type === 'income' && tx.status === 'paid') {
      // Si fue ingreso pagado/cobrado, aumentar saldo de la cuenta
      setPaymentMethods(prev => prev.map(pm => {
        if (pm.id === tx.paymentMethodId && pm.type !== 'credit_card') {
          return { ...pm, balance: (pm.balance || 0) + tx.amount };
        }
        return pm;
      }));
    }

    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransaction = (updatedTx: Transaction) => {
    const fortnight = updatedTx.fortnight || getFortnightFromDate(updatedTx.date, settings.q1EndDay);
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? { ...updatedTx, fortnight } : t));
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // Si era un gasto con tarjeta, revertir la deuda de la tarjeta
    if (tx.type === 'expense' && tx.linkedCardId) {
      setCreditCards(prev => prev.map(card => {
        if (card.id === tx.linkedCardId) {
          const revertedDebt = Math.max(0, card.currentDebt - tx.amount);
          return { ...card, currentDebt: revertedDebt };
        }
        return card;
      }));
    }

    // Actualizar inmediatamente
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (currentUser) {
      cloudStorageService.deleteTransaction(currentUser.id, id);
    }
  };

  const toggleTransactionStatus = (id: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'paid' ? 'pending' : 'paid';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  // --- TARJETAS DE CRÉDITO ---
  const addCreditCard = (card: Omit<CreditCard, 'id' | 'createdAt' | 'userId'>) => {
    const newCard: CreditCard = {
      ...card,
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      createdAt: new Date().toISOString()
    };
    setCreditCards(prev => [newCard, ...prev]);
  };

  const updateCreditCard = (card: CreditCard) => {
    setCreditCards(prev => prev.map(c => c.id === card.id ? card : c));
  };

  const deleteCreditCard = (id: string) => {
    setCreditCards(prev => prev.filter(c => c.id !== id));
    setCardMovements(prev => prev.filter(m => m.cardId !== id));
    if (currentUser) {
      cloudStorageService.deleteCreditCard(currentUser.id, id);
    }
  };

  const payCreditCard = (
    cardId: string,
    amount: number,
    sourcePaymentMethodId: string,
    date: string,
    notes?: string
  ) => {
    const card = creditCards.find(c => c.id === cardId);
    if (!card) return;

    const newDebt = Math.max(0, card.currentDebt - amount);

    // 1. Actualizar deuda de la tarjeta
    setCreditCards(prev => prev.map(c => c.id === cardId ? { ...c, currentDebt: newDebt } : c));

    // 2. Registrar movimiento de pago en la tarjeta
    const movement: CreditCardMovement = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      cardId,
      type: 'payment',
      concept: `Pago a Tarjeta ${card.name}`,
      amount,
      resultingDebt: newDebt,
      date,
      createdAt: new Date().toISOString()
    };
    setCardMovements(prev => [movement, ...prev]);

    // 3. Disminuir saldo disponible de la cuenta de origen
    setPaymentMethods(prev => prev.map(pm => {
      if (pm.id === sourcePaymentMethodId && pm.type !== 'credit_card') {
        return { ...pm, balance: Math.max(0, (pm.balance || 0) - amount) };
      }
      return pm;
    }));

    // 4. Registrar en transacciones como PAGO DE DEUDA (isDebtPayment: true) para no duplicar gastos
    const tx: Transaction = {
      id: `tx-paycard-${Date.now()}`,
      title: `Pago a ${card.name}`,
      amount,
      currency: card.currency,
      type: 'expense',
      categoryId: 'cat-prestamos',
      paymentMethodId: sourcePaymentMethodId,
      date,
      status: 'paid',
      isRecurring: false,
      fortnight: getFortnightFromDate(date, settings.q1EndDay),
      notes: notes || `Abono de deuda a tarjeta de crédito`,
      createdAt: new Date().toISOString(),
      isDebtPayment: true,
      linkedCardId: cardId
    };
    setTransactions(prev => [tx, ...prev]);
  };

  // --- PRÉSTAMOS Y DEUDAS ---
  const addLoan = (loan: Omit<Loan, 'id' | 'createdAt' | 'userId'>) => {
    const newLoan: Loan = {
      ...loan,
      id: `loan-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId,
      createdAt: new Date().toISOString()
    };
    setLoans(prev => [newLoan, ...prev]);
  };

  const updateLoan = (loan: Loan) => {
    setLoans(prev => prev.map(l => l.id === loan.id ? loan : l));
  };

  const deleteLoan = (id: string) => {
    setLoans(prev => prev.filter(l => l.id !== id));
    setLoanPayments(prev => prev.filter(p => p.loanId !== id));
    if (currentUser) {
      cloudStorageService.deleteLoan(currentUser.id, id);
    }
  };

  const payLoanInstallment = (
    loanId: string,
    amount: number,
    sourcePaymentMethodId: string,
    date: string,
    notes?: string
  ) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const newPending = Math.max(0, loan.pendingBalance - amount);
    const newPaidInstallments = loan.paidInstallments + 1;
    const newRemainingInstallments = Math.max(0, loan.remainingInstallments - 1);
    const isCompleted = newPending <= 0;

    // 1. Actualizar préstamo (si saldo es 0 -> Completado)
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          pendingBalance: newPending,
          paidInstallments: newPaidInstallments,
          remainingInstallments: newRemainingInstallments,
          status: isCompleted ? 'completed' : newRemainingInstallments <= 2 ? 'ending_soon' : 'active',
          completedAt: isCompleted ? new Date().toISOString() : undefined
        };
      }
      return l;
    }));

    // 2. Registrar pago en historial del préstamo
    const loanPay: LoanPayment = {
      id: `lp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      loanId,
      paymentDate: date,
      amount,
      sourceAccountId: sourcePaymentMethodId,
      installmentNumber: newPaidInstallments,
      resultingBalance: newPending,
      notes: notes || `Pago de cuota #${newPaidInstallments}`,
      createdAt: new Date().toISOString()
    };
    setLoanPayments(prev => [loanPay, ...prev]);

    // 3. Descontar dinero disponible de la cuenta de origen
    setPaymentMethods(prev => prev.map(pm => {
      if (pm.id === sourcePaymentMethodId && pm.type !== 'credit_card') {
        return { ...pm, balance: Math.max(0, (pm.balance || 0) - amount) };
      }
      return pm;
    }));

    // 4. Registrar en transacciones como pago de deuda (no gasto de consumo)
    const tx: Transaction = {
      id: `tx-payloan-${Date.now()}`,
      title: `Pago Cuota: ${loan.name}`,
      amount,
      currency: loan.currency,
      type: 'expense',
      categoryId: 'cat-prestamos',
      paymentMethodId: sourcePaymentMethodId,
      date,
      status: 'paid',
      isRecurring: false,
      fortnight: getFortnightFromDate(date, settings.q1EndDay),
      notes: notes || `Pago cuota #${newPaidInstallments} de ${loan.totalInstallments}`,
      createdAt: new Date().toISOString(),
      isDebtPayment: true,
      linkedLoanId: loanId
    };
    setTransactions(prev => [tx, ...prev]);
  };

  // --- CRUD CATEGORÍAS ---
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (cat: Category) => {
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    if (currentUser) {
      cloudStorageService.deleteCategory(currentUser.id, id);
    }
  };

  // --- CRUD MÉTODOS DE PAGO ---
  const addPaymentMethod = (pm: Omit<PaymentMethod, 'id'>) => {
    const newPm: PaymentMethod = {
      ...pm,
      id: `pm-${Date.now()}`
    };
    setPaymentMethods(prev => [...prev, newPm]);
  };

  const updatePaymentMethod = (pm: PaymentMethod) => {
    setPaymentMethods(prev => prev.map(p => p.id === pm.id ? pm : p));
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(p => p.id !== id));
    if (currentUser) {
      cloudStorageService.deletePaymentMethod(currentUser.id, id);
    }
  };

  // --- CRUD PRESUPUESTOS ---
  const addBudget = (bgt: Omit<Budget, 'id'>) => {
    const newBgt: Budget = {
      ...bgt,
      id: `bgt-${Date.now()}`
    };
    setBudgets(prev => [...prev, newBgt]);
  };

  const updateBudget = (bgt: Budget) => {
    setBudgets(prev => prev.map(b => b.id === bgt.id ? b : b));
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    if (currentUser) {
      cloudStorageService.deleteBudget(currentUser.id, id);
    }
  };

  // Ajustes
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.primaryCurrency) {
        setDisplayCurrency(newSettings.primaryCurrency);
      }
      return updated;
    });
  };

  const resetToDemoData = () => {
    if (!currentUser) return;
    storageService.initDemoDataForUser(currentUser.id);
    setCategories(storageService.getCategories(currentUser.id));
    setPaymentMethods(storageService.getPaymentMethods(currentUser.id));
    setCreditCards(storageService.getCreditCards(currentUser.id));
    setCardMovements(storageService.getCardMovements(currentUser.id));
    setLoans(storageService.getLoans(currentUser.id));
    setLoanPayments(storageService.getLoanPayments(currentUser.id));
    setTransactions(storageService.getTransactions(currentUser.id));
    setBudgets(storageService.getBudgets(currentUser.id));
    setSettings(storageService.getSettings(currentUser.id));
    setDismissedAlertIds([]);
  };

  const clearAllData = async () => {
    if (!currentUser) return;
    storageService.clearUserData(currentUser.id);
    setTransactions([]);
    setBudgets([]);
    setCreditCards([]);
    setCardMovements([]);
    setLoans([]);
    setLoanPayments([]);
    const resetMethods = paymentMethods.map(pm => ({ ...pm, balance: 0 }));
    setPaymentMethods(resetMethods);
    setDismissedAlertIds([]);

    if (cloudStorageService.isReady()) {
      await cloudStorageService.clearAllUserData(currentUser.id);
      await Promise.all(resetMethods.map(pm => cloudStorageService.savePaymentMethod(currentUser.id, pm)));
    }
  };

  const openQuickModal = (type: TransactionType = 'expense') => {
    setQuickModalType(type);
    setEditingTransaction(null);
    setQuickModalOpen(true);
  };

  const closeQuickModal = () => {
    setQuickModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <FinanceContext.Provider
      value={{
        categories,
        paymentMethods,
        transactions,
        budgets,
        settings,
        creditCards,
        cardMovements,
        loans,
        loanPayments,
        isCloudSyncing,
        isCloudActive,
        syncCloudData,
        selectedMonth,
        setSelectedMonth,
        selectedFortnight,
        setSelectedFortnight,
        displayCurrency,
        setDisplayCurrency,
        metrics,
        alerts,
        dismissedAlertIds,
        dismissAlert,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        toggleTransactionStatus,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        payCreditCard,
        addLoan,
        updateLoan,
        deleteLoan,
        payLoanInstallment,
        addCategory,
        updateCategory,
        deleteCategory,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        addBudget,
        updateBudget,
        deleteBudget,
        updateSettings,
        resetToDemoData,
        clearAllData,
        quickModalOpen,
        quickModalType,
        openQuickModal,
        closeQuickModal,
        editingTransaction,
        setEditingTransaction,
        confirmDelete,
      }}
    >
      {children}

      {/* Modal de Confirmación Global de Borrado */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        options={confirmDialogOptions}
        onClose={() => setIsConfirmOpen(false)}
      />
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance debe ser usado dentro de un FinanceProvider');
  }
  return context;
};
