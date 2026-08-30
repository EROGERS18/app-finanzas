export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'paid' | 'pending';
export type FrequencyType = 'once' | 'monthly' | 'biweekly' | 'weekly';
export type FortnightType = 'q1' | 'q2' | 'all'; // q1: 1-15, q2: 16-fin de mes
export type CurrencyCode = 'DOP' | 'USD';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password: string;
  avatarUrl: string;
  birthDate?: string;
  phone?: string;
  primaryCurrency: CurrencyCode;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense' | 'both';
  isDefault?: boolean;
}

export type PaymentMethodType = 'cash' | 'bank_account' | 'credit_card' | 'debit_card' | 'savings_account';

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  bankName?: string;
  lastFour?: string;
  color?: string;
  currency: CurrencyCode;
  balance?: number; // Para cuentas de débito/efectivo
  creditLimit?: number; // Para tarjetas de crédito
  cutOffDay?: number;
  paymentDueDay?: number;
}

// NUEVO: Tarjeta de Crédito Detallada
export interface CreditCard {
  id: string;
  name: string; // ej: "Visa Popular"
  bank: string; // ej: "Banco Popular"
  cardNumberMasked: string; // ej: "**** 4582"
  creditLimit: number; // ej: 100,000
  currentDebt: number; // ej: 35,500
  cutOffDay: number; // día de corte mensual (ej: 18)
  paymentDueDay: number; // día límite de pago mensual (ej: 8)
  interestRate?: number; // Tasa anual o mensual (opcional)
  status: 'active' | 'inactive';
  color: string;
  currency: CurrencyCode;
  createdAt: string;
  userId: string;
}

// Movimiento del historial de la Tarjeta de Crédito
export interface CreditCardMovement {
  id: string;
  cardId: string;
  type: 'purchase' | 'payment'; // 'purchase': gasto con tarjeta (+deuda), 'payment': pago a tarjeta (-deuda)
  concept: string;
  amount: number;
  resultingDebt: number;
  date: string;
  createdAt: string;
}

// NUEVO: Préstamo / Deuda Acumulativa
export interface Loan {
  id: string;
  name: string; // ej: "Préstamo Vehículo", "Préstamo Personal"
  institution: string; // ej: "Banco BHD", "Familiar", "Asociación"
  originalAmount: number; // ej: 500,000
  pendingBalance: number; // Saldo acumulativo que persiste hasta llegar a RD$0.00
  monthlyPayment: number; // Cuota periódica acordada, ej: 25,000
  startDate: string;
  dueDate: string; // Día del mes o fecha de vencimiento
  frequency: 'monthly' | 'biweekly';
  interestRate?: number; // % anual o mensual
  totalInstallments: number; // Número de cuotas totales (ej: 20)
  paidInstallments: number; // Cuotas pagadas (ej: 6)
  remainingInstallments: number; // Cuotas restantes (ej: 14)
  status: 'active' | 'ending_soon' | 'completed';
  category: 'personal' | 'vehicle' | 'mortgage' | 'business' | 'other';
  color: string;
  currency: CurrencyCode;
  createdAt: string;
  completedAt?: string;
  userId: string;
}

// Historial de pagos de un Préstamo
export interface LoanPayment {
  id: string;
  loanId: string;
  paymentDate: string;
  amount: number;
  sourceAccountId: string; // Cuenta de origen del dinero
  installmentNumber: number;
  resultingBalance: number;
  notes?: string;
  createdAt: string;
}

// Transacción enriquecida
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  currency: CurrencyCode;
  type: TransactionType; // 'income' | 'expense'
  categoryId: string;
  paymentMethodId: string;
  date: string; // YYYY-MM-DD
  status: TransactionStatus; // 'paid' | 'pending'
  isRecurring: boolean;
  recurrenceFrequency?: FrequencyType;
  dueDate?: string;
  fortnight: 'q1' | 'q2';
  notes?: string;
  createdAt: string;
  
  // Enlaces especiales para integridad y evitar doble contabilidad
  linkedCardId?: string; // Si se pagó con tarjeta de crédito
  isDebtPayment?: boolean; // True si es pago de tarjeta o cuota de préstamo (no es gasto de consumo)
  linkedLoanId?: string; // Si es pago de cuota de préstamo
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  currency: CurrencyCode;
  month: string; // YYYY-MM
  alertThreshold: number;
}

export interface UserSettings {
  primaryCurrency: CurrencyCode;
  exchangeRateUSDToDOP: number;
  theme: 'dark' | 'light';
  q1EndDay: number;
  notificationsAllowed: boolean;
  internalRemindersActive: boolean;
  hasCompletedOnboarding?: boolean;
}

// Métricas Financieras Enriquecidas con Deudas y Patrimonio
export interface FinancialMetrics {
  totalIncome: number;
  totalExpense: number; // Solo gastos de consumo (sin contar pagos de deuda para no duplicar)
  totalDebtPayments: number; // Pagos a tarjetas y préstamos
  totalPendingIncome: number;
  totalPendingExpense: number;
  
  // Saldos y Deudas
  currentBalance: number; // Dinero disponible en efectivo y cuentas bancarias
  realAvailable: number; // Dinero disponible menos compromisos pendientes del ciclo
  
  // Tarjetas y Préstamos
  totalCardDebt: number; // Deuda total acumulada en todas las tarjetas
  totalLoanDebt: number; // Saldo total pendiente acumulado en todos los préstamos activos
  totalDebts: number; // Deuda global (tarjetas + préstamos)
  totalAvailableCredit: number; // Límite total - Deuda total en tarjetas
  
  // Patrimonio Neto (Situación Financiera)
  netWorth: number; // Activos líquidos - Deudas totales
  
  savingsAmount: number;
  savingsRate: number;
  q1: {
    incomePaid: number;
    incomePending: number;
    expensePaid: number;
    expensePending: number;
    netCashFlow: number;
  };
  q2: {
    incomePaid: number;
    incomePending: number;
    expensePaid: number;
    expensePending: number;
    netCashFlow: number;
  };
}

export interface AlertNotification {
  id: string;
  type: 'due_soon' | 'overdue' | 'budget_warning' | 'budget_exceeded' | 'loan_due' | 'card_due' | 'info';
  title: string;
  message: string;
  date?: string;
  transactionId?: string;
  categoryId?: string;
  cardId?: string;
  loanId?: string;
  severity: 'low' | 'medium' | 'high';
}
