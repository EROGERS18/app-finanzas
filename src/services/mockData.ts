import { Category, PaymentMethod, Transaction, Budget, UserSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-salario', name: 'Salario / Nómina', icon: 'Briefcase', color: '#10b981', type: 'income', isDefault: true },
  { id: 'cat-freelance', name: 'Freelance / Extras', icon: 'Laptop', color: '#3b82f6', type: 'income', isDefault: true },
  { id: 'cat-inversiones', name: 'Inversiones / Rentas', icon: 'TrendingUp', color: '#8b5cf6', type: 'income', isDefault: true },
  { id: 'cat-vivienda', name: 'Vivienda & Alquiler', icon: 'Home', color: '#ef4444', type: 'expense', isDefault: true },
  { id: 'cat-alimentacion', name: 'Alimentación & Supermercado', icon: 'ShoppingCart', color: '#f59e0b', type: 'expense', isDefault: true },
  { id: 'cat-servicios', name: 'Servicios (Luz, Agua, Net)', icon: 'Zap', color: '#06b6d4', type: 'expense', isDefault: true },
  { id: 'cat-combustible', name: 'Combustible & Transporte', icon: 'Car', color: '#ec4899', type: 'expense', isDefault: true },
  { id: 'cat-prestamos', name: 'Préstamos & Tarjetas', icon: 'CreditCard', color: '#84cc16', type: 'expense', isDefault: true },
  { id: 'cat-entretenimiento', name: 'Entretenimiento & Ocio', icon: 'Film', color: '#a855f7', type: 'expense', isDefault: true },
  { id: 'cat-salud', name: 'Salud & Seguros', icon: 'HeartPulse', color: '#14b8a6', type: 'expense', isDefault: true },
  { id: 'cat-educacion', name: 'Educación & Cursos', icon: 'GraduationCap', color: '#6366f1', type: 'expense', isDefault: true },
  { id: 'cat-otros', name: 'Otros Gastos', icon: 'MoreHorizontal', color: '#64748b', type: 'expense', isDefault: true },
];

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-banreservas',
    name: 'Cuenta Nómina Banreservas',
    type: 'bank_account',
    bankName: 'Banreservas',
    lastFour: '4589',
    color: '#0284c7',
    currency: 'DOP',
    balance: 45200.00
  },
  {
    id: 'pm-popular',
    name: 'Cuenta Ahorros Popular',
    type: 'savings_account',
    bankName: 'Banco Popular',
    lastFour: '1290',
    color: '#059669',
    currency: 'DOP',
    balance: 85000.00
  },
  {
    id: 'pm-tc-bhd',
    name: 'Tarjeta Visa BHD León',
    type: 'credit_card',
    bankName: 'Banco BHD',
    lastFour: '7731',
    color: '#e11d48',
    currency: 'DOP',
    creditLimit: 75000.00,
    cutOffDay: 18,
    paymentDueDay: 8
  },
  {
    id: 'pm-efectivo',
    name: 'Efectivo en Mano',
    type: 'cash',
    color: '#d97706',
    currency: 'DOP',
    balance: 6500.00
  },
  {
    id: 'pm-usd-popular',
    name: 'Cuenta USD Popular',
    type: 'savings_account',
    bankName: 'Banco Popular',
    lastFour: '9044',
    color: '#4f46e5',
    currency: 'USD',
    balance: 1250.00
  }
];

// Generar fechas dinámicas para el mes actual
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
const monthPrefix = `${currentYear}-${currentMonth}`;

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Ingresos Quincena 1
  {
    id: 'tx-ing-1',
    title: '1ra Quincena Nómina',
    amount: 55000.00,
    currency: 'DOP',
    type: 'income',
    categoryId: 'cat-salario',
    paymentMethodId: 'pm-banreservas',
    date: `${monthPrefix}-01`,
    status: 'paid',
    isRecurring: true,
    recurrenceFrequency: 'biweekly',
    fortnight: 'q1',
    notes: 'Pago de salario quincenal empresa',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-ing-extra',
    title: 'Proyecto Diseño Freelance',
    amount: 18000.00,
    currency: 'DOP',
    type: 'income',
    categoryId: 'cat-freelance',
    paymentMethodId: 'pm-popular',
    date: `${monthPrefix}-10`,
    status: 'paid',
    isRecurring: false,
    fortnight: 'q1',
    notes: 'Rediseño web cliente local',
    createdAt: new Date().toISOString()
  },
  // Ingresos Quincena 2
  {
    id: 'tx-ing-2',
    title: '2da Quincena Nómina',
    amount: 55000.00,
    currency: 'DOP',
    type: 'income',
    categoryId: 'cat-salario',
    paymentMethodId: 'pm-banreservas',
    date: `${monthPrefix}-15`,
    status: today.getDate() >= 15 ? 'paid' : 'pending',
    isRecurring: true,
    recurrenceFrequency: 'biweekly',
    dueDate: `${monthPrefix}-15`,
    fortnight: 'q2',
    notes: 'Pago de nómina fin de mes',
    createdAt: new Date().toISOString()
  },

  // Gastos Quincena 1 (1-15)
  {
    id: 'tx-gasto-alquiler',
    title: 'Alquiler Apartamento',
    amount: 25000.00,
    currency: 'DOP',
    type: 'expense',
    categoryId: 'cat-vivienda',
    paymentMethodId: 'pm-banreservas',
    date: `${monthPrefix}-03`,
    status: 'paid',
    isRecurring: true,
    recurrenceFrequency: 'monthly',
    fortnight: 'q1',
    notes: 'Transferencia directa al propietario',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-gasto-super-1',
    title: 'Supermercado Nacional (Compra Q1)',
    amount: 9800.00,
    currency: 'DOP',
    type: 'expense',
    categoryId: 'cat-alimentacion',
    paymentMethodId: 'pm-tc-bhd',
    date: `${monthPrefix}-04`,
    status: 'paid',
    isRecurring: false,
    fortnight: 'q1',
    notes: 'Compra de víveres, carnes y limpieza',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-gasto-comb-1',
    title: 'Combustible Gasolina Premium',
    amount: 3200.00,
    currency: 'DOP',
    type: 'expense',
    categoryId: 'cat-combustible',
    paymentMethodId: 'pm-tc-bhd',
    date: `${monthPrefix}-07`,
    status: 'paid',
    isRecurring: false,
    fortnight: 'q1',
    notes: 'Tanque lleno estación Shell',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-gasto-claro',
    title: 'Claro Fibra Óptica 100 Mbps',
    amount: 2850.00,
    currency: 'DOP',
    type: 'expense',
    categoryId: 'cat-servicios',
    paymentMethodId: 'pm-banreservas',
    date: `${monthPrefix}-12`,
    status: 'paid',
    isRecurring: true,
    recurrenceFrequency: 'monthly',
    dueDate: `${monthPrefix}-12`,
    fortnight: 'q1',
    notes: 'Internet y línea fija',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-gasto-gym',
    title: 'Gimnasio Smart Fit',
    amount: 1950.00,
    currency: 'DOP',
    type: 'expense',
    categoryId: 'cat-salud',
    paymentMethodId: 'pm-tc-bhd',
    date: `${monthPrefix}-14`,
    status: 'paid',
    isRecurring: true,
    recurrenceFrequency: 'monthly',
    fortnight: 'q1',
    notes: 'Plan Black mensual',
    createdAt: new Date().toISOString()
  },

  // Gastos Quincena 2 (16-Fin de mes) y Próximos Pagos
  {
    id: 'tx-gasto-prestamo-auto',
    title: 'Cuota Préstamo Vehículo',
    amount: 14500.00,
    currency: 'DOP',
    type: 'expense',
    categoryId: 'cat-prestamos',
    paymentMethodId: 'pm-popular',
    date: `${monthPrefix}-20`,
    status: 'pending',
    isRecurring: true,
    recurrenceFrequency: 'monthly',
    dueDate: `${monthPrefix}-20`,
    fortnight: 'q2',
    notes: 'Débito automático cuenta Banco Popular',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-gasto-super-2',
    title: 'Supermercado La Sirena (Compra Q2)',
    amount: 8500.00,
    currency: 'DOP',
    type: 'expense',
    categoryId: 'cat-alimentacion',
    paymentMethodId: 'pm-tc-bhd',
    date: `${monthPrefix}-18`,
    status: 'pending',
    isRecurring: false,
    dueDate: `${monthPrefix}-18`,
    fortnight: 'q2',
    notes: 'Estimado compra segunda quincena',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-gasto-edesur',
    title: 'Factura Edesur Dominicana',
    amount: 4200.00,
    currency: 'DOP',
    type: 'expense',
    categoryId: 'cat-servicios',
    paymentMethodId: 'pm-banreservas',
    date: `${monthPrefix}-23`,
    status: 'pending',
    isRecurring: true,
    recurrenceFrequency: 'monthly',
    dueDate: `${monthPrefix}-23`,
    fortnight: 'q2',
    notes: 'Consumo eléctrico del mes',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-gasto-pago-tc',
    title: 'Pago Tarjeta de Crédito BHD',
    amount: 15600.00,
    currency: 'DOP',
    type: 'expense',
    categoryId: 'cat-prestamos',
    paymentMethodId: 'pm-banreservas',
    date: `${monthPrefix}-28`,
    status: 'pending',
    isRecurring: true,
    recurrenceFrequency: 'monthly',
    dueDate: `${monthPrefix}-28`,
    fortnight: 'q2',
    notes: 'Pago total para no generar intereses',
    createdAt: new Date().toISOString()
  },
  {
    id: 'tx-gasto-salida',
    title: 'Cena y Cine Fin de Semana',
    amount: 3500.00,
    currency: 'DOP',
    type: 'expense',
    categoryId: 'cat-entretenimiento',
    paymentMethodId: 'pm-efectivo',
    date: `${monthPrefix}-22`,
    status: 'pending',
    isRecurring: false,
    dueDate: `${monthPrefix}-22`,
    fortnight: 'q2',
    notes: 'Salida recreativa',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'bgt-alimentacion',
    categoryId: 'cat-alimentacion',
    monthlyLimit: 22000.00,
    currency: 'DOP',
    month: monthPrefix,
    alertThreshold: 85
  },
  {
    id: 'bgt-combustible',
    categoryId: 'cat-combustible',
    monthlyLimit: 8000.00,
    currency: 'DOP',
    month: monthPrefix,
    alertThreshold: 80
  },
  {
    id: 'bgt-servicios',
    categoryId: 'cat-servicios',
    monthlyLimit: 8500.00,
    currency: 'DOP',
    month: monthPrefix,
    alertThreshold: 90
  },
  {
    id: 'bgt-entretenimiento',
    categoryId: 'cat-entretenimiento',
    monthlyLimit: 6000.00,
    currency: 'DOP',
    month: monthPrefix,
    alertThreshold: 75
  },
  {
    id: 'bgt-vivienda',
    categoryId: 'cat-vivienda',
    monthlyLimit: 26000.00,
    currency: 'DOP',
    month: monthPrefix,
    alertThreshold: 95
  }
];

export const INITIAL_SETTINGS: UserSettings = {
  primaryCurrency: 'DOP',
  exchangeRateUSDToDOP: 60.50,
  theme: 'dark',
  q1EndDay: 15,
  notificationsAllowed: false,
  internalRemindersActive: true
};
