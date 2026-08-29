import { Transaction, Budget, Category, UserSettings, FinancialMetrics, AlertNotification, CurrencyCode } from '../types';

/**
 * Convierte un monto entre USD y DOP según la tasa configurada
 */
export function convertAmount(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === 'USD' && toCurrency === 'DOP') {
    return amount * exchangeRate;
  }
  if (fromCurrency === 'DOP' && toCurrency === 'USD') {
    return amount / (exchangeRate || 60);
  }
  return amount;
}

/**
 * Formatea un número a moneda (RD$ o USD$)
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'DOP'): string {
  const isDOP = currency === 'DOP';
  const formatted = new Intl.NumberFormat('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return isDOP ? `RD$ ${formatted}` : `US$ ${formatted}`;
}

/**
 * Determina la quincena correspondiente según la fecha (YYYY-MM-DD)
 */
export function getFortnightFromDate(dateString: string, q1EndDay: number = 15): 'q1' | 'q2' {
  if (!dateString) return 'q1';
  const parts = dateString.split('-');
  const day = parseInt(parts[2] || '1', 10);
  return day <= q1EndDay ? 'q1' : 'q2';
}

/**
 * Filtra transacciones por mes seleccionado (formato 'YYYY-MM')
 */
export function filterTransactionsByMonth(transactions: Transaction[], yearMonth: string): Transaction[] {
  return transactions.filter(tx => tx.date.startsWith(yearMonth));
}

/**
 * Realiza todos los cálculos y métricas del período
 */
export function calculateFinancialMetrics(
  transactions: Transaction[],
  targetCurrency: CurrencyCode,
  settings: UserSettings
): FinancialMetrics {
  let incomePaid = 0;
  let incomePending = 0;
  let expensePaid = 0;
  let expensePending = 0;

  const q1 = { incomePaid: 0, incomePending: 0, expensePaid: 0, expensePending: 0, netCashFlow: 0 };
  const q2 = { incomePaid: 0, incomePending: 0, expensePaid: 0, expensePending: 0, netCashFlow: 0 };

  transactions.forEach(tx => {
    const amountInTarget = convertAmount(
      tx.amount,
      tx.currency,
      targetCurrency,
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
      // expense
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
  });

  q1.netCashFlow = (q1.incomePaid + q1.incomePending) - (q1.expensePaid + q1.expensePending);
  q2.netCashFlow = (q2.incomePaid + q2.incomePending) - (q2.expensePaid + q2.expensePending);

  const currentBalance = incomePaid - expensePaid;
  // Disponible real: saldo que queda disponible luego de cumplir con compromisos pendientes
  const realAvailable = currentBalance - expensePending;
  const savingsAmount = Math.max(0, currentBalance);
  const totalIn = incomePaid + incomePending;
  const savingsRate = totalIn > 0 ? Math.round(((totalIn - (expensePaid + expensePending)) / totalIn) * 100) : 0;

  return {
    totalIncome: incomePaid,
    totalExpense: expensePaid,
    totalDebtPayments: 0,
    totalPendingIncome: incomePending,
    totalPendingExpense: expensePending,
    currentBalance,
    realAvailable,
    totalCardDebt: 0,
    totalLoanDebt: 0,
    totalDebts: 0,
    totalAvailableCredit: 0,
    netWorth: currentBalance,
    savingsAmount,
    savingsRate: Math.max(0, savingsRate),
    q1,
    q2
  };
}

/**
 * Genera alertas automáticas internas basadas en compromisos, vencimientos y presupuestos
 */
export function generateSystemAlerts(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  settings: UserSettings
): AlertNotification[] {
  const alerts: AlertNotification[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Alertas de compromisos próximos / vencidos
  const pendingExpenses = transactions.filter(tx => tx.type === 'expense' && tx.status === 'pending');
  
  pendingExpenses.forEach(tx => {
    const due = tx.dueDate ? new Date(tx.dueDate) : new Date(tx.date);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      alerts.push({
        id: `alert-overdue-${tx.id}`,
        type: 'overdue',
        title: `Compromiso vencido: ${tx.title}`,
        message: `Venció hace ${Math.abs(diffDays)} día(s) (${formatCurrency(tx.amount, tx.currency)}).`,
        date: tx.dueDate || tx.date,
        transactionId: tx.id,
        severity: 'high'
      });
    } else if (diffDays === 0) {
      alerts.push({
        id: `alert-today-${tx.id}`,
        type: 'due_soon',
        title: `Vence hoy: ${tx.title}`,
        message: `Tienes un pago pendiente hoy de ${formatCurrency(tx.amount, tx.currency)}.`,
        date: tx.dueDate || tx.date,
        transactionId: tx.id,
        severity: 'high'
      });
    } else if (diffDays <= 3) {
      alerts.push({
        id: `alert-soon-${tx.id}`,
        type: 'due_soon',
        title: `Próximo a vencer (${diffDays} días): ${tx.title}`,
        message: `El compromiso de ${formatCurrency(tx.amount, tx.currency)} vence el ${tx.dueDate || tx.date}.`,
        date: tx.dueDate || tx.date,
        transactionId: tx.id,
        severity: 'medium'
      });
    }
  });

  // 2. Alertas de presupuestos
  budgets.forEach(budget => {
    const cat = categories.find(c => c.id === budget.categoryId);
    if (!cat) return;

    // Calcular gastos de esta categoría en el mes
    const spent = transactions
      .filter(tx => tx.type === 'expense' && tx.categoryId === budget.categoryId)
      .reduce((sum, tx) => {
        const val = convertAmount(tx.amount, tx.currency, budget.currency, settings.exchangeRateUSDToDOP);
        return sum + val;
      }, 0);

    const percentage = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;

    if (percentage >= 100) {
      alerts.push({
        id: `alert-bgt-exceeded-${budget.id}`,
        type: 'budget_exceeded',
        title: `Presupuesto excedido: ${cat.name}`,
        message: `Has gastado ${formatCurrency(spent, budget.currency)} de un límite de ${formatCurrency(budget.monthlyLimit, budget.currency)} (${percentage.toFixed(0)}%).`,
        categoryId: cat.id,
        severity: 'high'
      });
    } else if (percentage >= (budget.alertThreshold || 85)) {
      alerts.push({
        id: `alert-bgt-warning-${budget.id}`,
        type: 'budget_warning',
        title: `Presupuesto al límite: ${cat.name}`,
        message: `Has consumido el ${percentage.toFixed(0)}% de tu presupuesto de ${cat.name} (${formatCurrency(spent, budget.currency)} / ${formatCurrency(budget.monthlyLimit, budget.currency)}).`,
        categoryId: cat.id,
        severity: 'medium'
      });
    }
  });

  return alerts;
}
