import { 
  Category, 
  PaymentMethod, 
  Transaction, 
  Budget, 
  UserSettings, 
  UserProfile,
  CreditCard,
  CreditCardMovement,
  Loan,
  LoanPayment
} from '../types';
import { INITIAL_CATEGORIES, INITIAL_PAYMENT_METHODS, INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_SETTINGS } from './mockData';

const GLOBAL_KEYS = {
  USERS_REGISTRY: 'finandom_users_registry_v1',
  CURRENT_USER_ID: 'finandom_current_user_id_v1',
};

// Usuarios semilla iniciales (vacío en producción sin usuarios demo)
export const INITIAL_USERS: UserProfile[] = [];

class StorageService {
  private getUserKey(userId: string, subKey: string): string {
    return `finandom_usr_${userId}_${subKey}`;
  }

  // --- GESTIÓN DE USUARIOS ---
  getUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(GLOBAL_KEYS.USERS_REGISTRY);
      if (!data) {
        this.saveUsers([]);
        return [];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  saveUsers(users: UserProfile[]): void {
    localStorage.setItem(GLOBAL_KEYS.USERS_REGISTRY, JSON.stringify(users));
  }

  getCurrentUserId(): string | null {
    return localStorage.getItem(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  setCurrentUserId(userId: string | null): void {
    if (userId) {
      localStorage.setItem(GLOBAL_KEYS.CURRENT_USER_ID, userId);
    } else {
      localStorage.removeItem(GLOBAL_KEYS.CURRENT_USER_ID);
    }
  }

  // --- CATEGORÍAS ---
  getCategories(userId: string): Category[] {
    try {
      const data = localStorage.getItem(this.getUserKey(userId, 'categories'));
      return data ? JSON.parse(data) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  saveCategories(userId: string, categories: Category[]): void {
    localStorage.setItem(this.getUserKey(userId, 'categories'), JSON.stringify(categories));
  }

  // --- MÉTODOS DE PAGO / CUENTAS ---
  getPaymentMethods(userId: string): PaymentMethod[] {
    try {
      const data = localStorage.getItem(this.getUserKey(userId, 'payment_methods'));
      return data ? JSON.parse(data) : INITIAL_PAYMENT_METHODS;
    } catch {
      return INITIAL_PAYMENT_METHODS;
    }
  }

  savePaymentMethods(userId: string, methods: PaymentMethod[]): void {
    localStorage.setItem(this.getUserKey(userId, 'payment_methods'), JSON.stringify(methods));
  }

  // --- TARJETAS DE CRÉDITO ---
  getCreditCards(userId: string): CreditCard[] {
    try {
      const data = localStorage.getItem(this.getUserKey(userId, 'credit_cards'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCreditCards(userId: string, cards: CreditCard[]): void {
    localStorage.setItem(this.getUserKey(userId, 'credit_cards'), JSON.stringify(cards));
  }

  // --- MOVIMIENTOS DE TARJETAS ---
  getCardMovements(userId: string): CreditCardMovement[] {
    try {
      const data = localStorage.getItem(this.getUserKey(userId, 'card_movements'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCardMovements(userId: string, movements: CreditCardMovement[]): void {
    localStorage.setItem(this.getUserKey(userId, 'card_movements'), JSON.stringify(movements));
  }

  // --- PRÉSTAMOS Y DEUDAS ---
  getLoans(userId: string): Loan[] {
    try {
      const data = localStorage.getItem(this.getUserKey(userId, 'loans'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveLoans(userId: string, loans: Loan[]): void {
    localStorage.setItem(this.getUserKey(userId, 'loans'), JSON.stringify(loans));
  }

  // --- PAGOS DE PRÉSTAMOS ---
  getLoanPayments(userId: string): LoanPayment[] {
    try {
      const data = localStorage.getItem(this.getUserKey(userId, 'loan_payments'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveLoanPayments(userId: string, payments: LoanPayment[]): void {
    localStorage.setItem(this.getUserKey(userId, 'loan_payments'), JSON.stringify(payments));
  }

  // --- TRANSACCIONES ---
  getTransactions(userId: string): Transaction[] {
    try {
      const data = localStorage.getItem(this.getUserKey(userId, 'transactions'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveTransactions(userId: string, transactions: Transaction[]): void {
    localStorage.setItem(this.getUserKey(userId, 'transactions'), JSON.stringify(transactions));
  }

  // --- PRESUPUESTOS ---
  getBudgets(userId: string): Budget[] {
    try {
      const data = localStorage.getItem(this.getUserKey(userId, 'budgets'));
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveBudgets(userId: string, budgets: Budget[]): void {
    localStorage.setItem(this.getUserKey(userId, 'budgets'), JSON.stringify(budgets));
  }

  // --- AJUSTES ---
  getSettings(userId: string): UserSettings {
    try {
      const data = localStorage.getItem(this.getUserKey(userId, 'settings'));
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  }

  saveSettings(userId: string, settings: UserSettings): void {
    localStorage.setItem(this.getUserKey(userId, 'settings'), JSON.stringify(settings));
  }

  // Inicializar demo para Carlos Rodríguez con tarjetas y préstamos reales
  initDemoDataForUser(userId: string): void {
    const today = new Date();
    const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const demoCards: CreditCard[] = [
      {
        id: `card-popular-${userId}`,
        name: 'Visa Popular Platinum',
        bank: 'Banco Popular',
        cardNumberMasked: '**** 4582',
        creditLimit: 100000.00,
        currentDebt: 35500.00,
        cutOffDay: 18,
        paymentDueDay: 8,
        interestRate: 28.0,
        status: 'active',
        color: '#059669', // Emerald
        currency: 'DOP',
        createdAt: '2026-01-10T00:00:00.000Z',
        userId
      },
      {
        id: `card-banreservas-${userId}`,
        name: 'Mastercard Banreservas Gold',
        bank: 'Banreservas',
        cardNumberMasked: '**** 9021',
        creditLimit: 75000.00,
        currentDebt: 18450.00,
        cutOffDay: 12,
        paymentDueDay: 2,
        interestRate: 26.5,
        status: 'active',
        color: '#0284c7', // Sky
        currency: 'DOP',
        createdAt: '2026-01-15T00:00:00.000Z',
        userId
      }
    ];

    const demoCardMovements: CreditCardMovement[] = [
      {
        id: `mov-1-${userId}`,
        cardId: `card-popular-${userId}`,
        type: 'purchase',
        concept: 'Compra Supermercado Nacional',
        amount: 5000.00,
        resultingDebt: 40500.00,
        date: `${monthPrefix}-05`,
        createdAt: '2026-08-05T12:00:00.000Z'
      },
      {
        id: `mov-2-${userId}`,
        cardId: `card-popular-${userId}`,
        type: 'payment',
        concept: 'Pago Abono a Tarjeta',
        amount: 10000.00,
        resultingDebt: 30500.00,
        date: `${monthPrefix}-10`,
        createdAt: '2026-08-10T12:00:00.000Z'
      },
      {
        id: `mov-3-${userId}`,
        cardId: `card-popular-${userId}`,
        type: 'purchase',
        concept: 'Combustible Estación Shell',
        amount: 5000.00,
        resultingDebt: 35500.00,
        date: `${monthPrefix}-15`,
        createdAt: '2026-08-15T12:00:00.000Z'
      }
    ];

    const demoLoans: Loan[] = [
      {
        id: `loan-auto-${userId}`,
        name: 'Préstamo Vehículo Honda CR-V',
        institution: 'Banco BHD',
        originalAmount: 500000.00,
        pendingBalance: 350000.00,
        monthlyPayment: 25000.00,
        startDate: '2025-06-01',
        dueDate: '20', // Día 20 de cada mes
        frequency: 'monthly',
        interestRate: 14.5,
        totalInstallments: 20,
        paidInstallments: 6,
        remainingInstallments: 14,
        status: 'active',
        category: 'vehicle',
        color: '#3b82f6',
        currency: 'DOP',
        createdAt: '2025-06-01T00:00:00.000Z',
        userId
      },
      {
        id: `loan-personal-${userId}`,
        name: 'Préstamo Remodelación Apartamento',
        institution: 'Banco Popular',
        originalAmount: 150000.00,
        pendingBalance: 75000.00,
        monthlyPayment: 15000.00,
        startDate: '2025-10-01',
        dueDate: '15',
        frequency: 'monthly',
        interestRate: 18.0,
        totalInstallments: 10,
        paidInstallments: 5,
        remainingInstallments: 5,
        status: 'active',
        category: 'personal',
        color: '#a855f7',
        currency: 'DOP',
        createdAt: '2025-10-01T00:00:00.000Z',
        userId
      },
      {
        id: `loan-completado-${userId}`,
        name: 'Préstamo Compra Laptop Profesional',
        institution: 'Asociación Popular',
        originalAmount: 100000.00,
        pendingBalance: 0.00,
        monthlyPayment: 10000.00,
        startDate: '2025-01-01',
        dueDate: '05',
        frequency: 'monthly',
        interestRate: 12.0,
        totalInstallments: 10,
        paidInstallments: 10,
        remainingInstallments: 0,
        status: 'completed',
        category: 'personal',
        color: '#10b981',
        currency: 'DOP',
        createdAt: '2025-01-01T00:00:00.000Z',
        completedAt: '2025-10-05T00:00:00.000Z',
        userId
      }
    ];

    const demoLoanPayments: LoanPayment[] = [
      {
        id: `lp-1-${userId}`,
        loanId: `loan-auto-${userId}`,
        paymentDate: `${monthPrefix}-20`,
        amount: 25000.00,
        sourceAccountId: 'pm-popular',
        installmentNumber: 6,
        resultingBalance: 350000.00,
        notes: 'Pago mensual por débito automático',
        createdAt: '2026-08-20T10:00:00.000Z'
      }
    ];

    this.saveCategories(userId, INITIAL_CATEGORIES);
    this.savePaymentMethods(userId, INITIAL_PAYMENT_METHODS);
    this.saveCreditCards(userId, demoCards);
    this.saveCardMovements(userId, demoCardMovements);
    this.saveLoans(userId, demoLoans);
    this.saveLoanPayments(userId, demoLoanPayments);
    this.saveTransactions(userId, INITIAL_TRANSACTIONS);
    this.saveBudgets(userId, INITIAL_BUDGETS);
    this.saveSettings(userId, INITIAL_SETTINGS);
  }

  // Inicializar demo para Laura Gómez
  initDataForLaura(userId: string): void {
    const today = new Date();
    const monthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const lauraCards: CreditCard[] = [
      {
        id: `card-bhd-${userId}`,
        name: 'Visa BHD Mujer',
        bank: 'Banco BHD',
        cardNumberMasked: '**** 8812',
        creditLimit: 85000.00,
        currentDebt: 14200.00,
        cutOffDay: 15,
        paymentDueDay: 5,
        interestRate: 25.0,
        status: 'active',
        color: '#ec4899',
        currency: 'DOP',
        createdAt: '2026-02-01T00:00:00.000Z',
        userId
      }
    ];

    const lauraLoans: Loan[] = [
      {
        id: `loan-estudios-${userId}`,
        name: 'Préstamo Máster Diseño Digital',
        institution: 'Fondo Educativo',
        originalAmount: 120000.00,
        pendingBalance: 40000.00,
        monthlyPayment: 10000.00,
        startDate: '2025-08-01',
        dueDate: '25',
        frequency: 'monthly',
        totalInstallments: 12,
        paidInstallments: 8,
        remainingInstallments: 4,
        status: 'active',
        category: 'personal',
        color: '#6366f1',
        currency: 'DOP',
        createdAt: '2025-08-01T00:00:00.000Z',
        userId
      }
    ];

    const lauraMethods: PaymentMethod[] = [
      {
        id: `pm-bhd-${userId}`,
        name: 'Cuenta Corriente BHD',
        type: 'bank_account',
        bankName: 'Banco BHD',
        lastFour: '3109',
        color: '#059669',
        currency: 'DOP',
        balance: 45000.00
      },
      {
        id: `pm-efectivo-${userId}`,
        name: 'Efectivo en Mano',
        type: 'cash',
        color: '#d97706',
        currency: 'DOP',
        balance: 6500.00
      }
    ];

    this.saveCategories(userId, INITIAL_CATEGORIES);
    this.savePaymentMethods(userId, lauraMethods);
    this.saveCreditCards(userId, lauraCards);
    this.saveCardMovements(userId, []);
    this.saveLoans(userId, lauraLoans);
    this.saveLoanPayments(userId, []);
    this.saveTransactions(userId, []);
    this.saveBudgets(userId, []);
    this.saveSettings(userId, INITIAL_SETTINGS);
  }

  // Inicializar nuevo usuario registrado en blanco
  initNewUserAccount(userId: string, currency: 'DOP' | 'USD' = 'DOP'): void {
    const defaultMethods: PaymentMethod[] = [
      {
        id: `pm-default-bank-${userId}`,
        name: 'Cuenta Principal',
        type: 'bank_account',
        bankName: 'Banco',
        currency,
        balance: 0.00
      },
      {
        id: `pm-default-cash-${userId}`,
        name: 'Efectivo',
        type: 'cash',
        currency,
        balance: 0.00
      }
    ];

    this.saveCategories(userId, INITIAL_CATEGORIES);
    this.savePaymentMethods(userId, defaultMethods);
    this.saveCreditCards(userId, []);
    this.saveCardMovements(userId, []);
    this.saveLoans(userId, []);
    this.saveLoanPayments(userId, []);
    this.saveTransactions(userId, []);
    this.saveBudgets(userId, []);
    this.saveSettings(userId, {
      ...INITIAL_SETTINGS,
      primaryCurrency: currency
    });
  }

  clearUserData(userId: string): void {
    this.saveTransactions(userId, []);
    this.saveBudgets(userId, []);
    this.saveCreditCards(userId, []);
    this.saveCardMovements(userId, []);
    this.saveLoans(userId, []);
    this.saveLoanPayments(userId, []);
    
    // Reseteamos las cuentas bancarias a saldo 0.00 o arreglo limpio
    const currentMethods = this.getPaymentMethods(userId);
    const clearedMethods = currentMethods.map(pm => ({
      ...pm,
      balance: 0.00
    }));
    this.savePaymentMethods(userId, clearedMethods);
  }
}

export const storageService = new StorageService();
