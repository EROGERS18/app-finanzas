import { supabase, isSupabaseConfigured } from './supabaseClient';
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

class CloudStorageService {
  /**
   * Verifica si la nube está lista para sincronizar
   */
  public isReady(): boolean {
    return isSupabaseConfigured() && supabase !== null;
  }

  // --- PERFILES DE USUARIO ---
  async fetchProfiles(): Promise<UserProfile[] | null> {
    if (!this.isReady() || !supabase) return null;
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.user_id || row.id,
        name: row.name,
        email: row.email,
        password: row.phone || row.password || '',
        avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        birthDate: row.birth_date || '',
        phone: row.phone || '',
        primaryCurrency: row.primary_currency || 'DOP',
        createdAt: row.created_at || new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Error al cargar usuarios de la nube:', err);
      return null;
    }
  }

  async saveProfile(user: UserProfile): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      const payload: any = {
        user_id: user.id,
        name: user.name,
        email: user.email.toLowerCase(),
        avatar_url: user.avatarUrl,
        birth_date: user.birthDate || null,
        phone: user.password || null,
        primary_currency: user.primaryCurrency || 'DOP',
        created_at: user.createdAt || new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'email' });
      return !error;
    } catch (err) {
      console.error('Error al guardar usuario en la nube:', err);
      return false;
    }
  }

  // --- TRANSACCIONES ---
  async fetchTransactions(userId: string): Promise<Transaction[] | null> {
    if (!this.isReady() || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        title: row.title,
        amount: Number(row.amount),
        currency: row.currency,
        type: row.type,
        categoryId: row.category_id,
        paymentMethodId: row.payment_method_id,
        date: row.date,
        status: row.status,
        isRecurring: row.is_recurring,
        recurrenceFrequency: row.recurrence_frequency,
        dueDate: row.due_date,
        fortnight: row.fortnight,
        notes: row.notes,
        createdAt: row.created_at,
        linkedCardId: row.linked_card_id,
        isDebtPayment: row.is_debt_payment,
        linkedLoanId: row.linked_loan_id,
      }));
    } catch (err) {
      console.error('Error al cargar transacciones de la nube:', err);
      return null;
    }
  }

  async saveTransaction(userId: string, tx: Transaction): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      const { error } = await supabase.from('transactions').upsert({
        id: tx.id,
        user_id: userId,
        title: tx.title,
        amount: tx.amount,
        currency: tx.currency,
        type: tx.type,
        category_id: tx.categoryId,
        payment_method_id: tx.paymentMethodId,
        date: tx.date,
        status: tx.status,
        is_recurring: tx.isRecurring,
        recurrence_frequency: tx.recurrenceFrequency || null,
        due_date: tx.dueDate || null,
        fortnight: tx.fortnight,
        notes: tx.notes || null,
        linked_card_id: tx.linkedCardId || null,
        is_debt_payment: tx.isDebtPayment || false,
        linked_loan_id: tx.linkedLoanId || null,
        created_at: tx.createdAt || new Date().toISOString(),
      });
      return !error;
    } catch (err) {
      console.error('Error al guardar transacción en la nube:', err);
      return false;
    }
  }

  async deleteTransaction(userId: string, id: string): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', userId)
        .eq('id', id);
      return !error;
    } catch (err) {
      console.error('Error al eliminar transacción en la nube:', err);
      return false;
    }
  }

  // --- CATEGORÍAS ---
  async fetchCategories(userId: string): Promise<Category[] | null> {
    if (!this.isReady() || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        type: row.type,
        isDefault: row.is_default,
      }));
    } catch (err) {
      console.error('Error al cargar categorías de la nube:', err);
      return null;
    }
  }

  async saveCategory(userId: string, cat: Category): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      const { error } = await supabase.from('categories').upsert({
        id: cat.id,
        user_id: userId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        is_default: cat.isDefault || false,
      });
      return !error;
    } catch (err) {
      console.error('Error al guardar categoría en la nube:', err);
      return false;
    }
  }

  async deleteCategory(userId: string, id: string): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      const { error } = await supabase.from('categories').delete().eq('user_id', userId).eq('id', id);
      return !error;
    } catch (err) {
      console.error('Error al eliminar categoría en la nube:', err);
      return false;
    }
  }

  // --- MÉTODOS DE PAGO / CUENTAS ---
  async fetchPaymentMethods(userId: string): Promise<PaymentMethod[] | null> {
    if (!this.isReady() || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        bankName: row.bank_name,
        lastFour: row.last_four,
        color: row.color,
        currency: row.currency,
        balance: Number(row.balance || 0),
        creditLimit: Number(row.credit_limit || 0),
        cutOffDay: row.cut_off_day,
        paymentDueDay: row.payment_due_day,
      }));
    } catch (err) {
      console.error('Error al cargar métodos de pago de la nube:', err);
      return null;
    }
  }

  async savePaymentMethod(userId: string, pm: PaymentMethod): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      const { error } = await supabase.from('payment_methods').upsert({
        id: pm.id,
        user_id: userId,
        name: pm.name,
        type: pm.type,
        bank_name: pm.bankName || null,
        last_four: pm.lastFour || null,
        color: pm.color || null,
        currency: pm.currency,
        balance: pm.balance || 0,
        credit_limit: pm.creditLimit || 0,
        cut_off_day: pm.cutOffDay || null,
        payment_due_day: pm.paymentDueDay || null,
      });
      return !error;
    } catch (err) {
      console.error('Error al guardar método de pago en la nube:', err);
      return false;
    }
  }

  // --- TARJETAS DE CRÉDITO ---
  async fetchCreditCards(userId: string): Promise<CreditCard[] | null> {
    if (!this.isReady() || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        bank: row.bank,
        cardNumberMasked: row.card_number_masked,
        creditLimit: Number(row.credit_limit),
        currentDebt: Number(row.current_debt),
        cutOffDay: row.cut_off_day,
        paymentDueDay: row.payment_due_day,
        interestRate: row.interest_rate ? Number(row.interest_rate) : undefined,
        status: row.status,
        color: row.color,
        currency: row.currency,
        createdAt: row.created_at,
        userId: row.user_id,
      }));
    } catch (err) {
      console.error('Error al cargar tarjetas de la nube:', err);
      return null;
    }
  }

  async saveCreditCard(userId: string, card: CreditCard): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      const { error } = await supabase.from('credit_cards').upsert({
        id: card.id,
        user_id: userId,
        name: card.name,
        bank: card.bank,
        card_number_masked: card.cardNumberMasked,
        credit_limit: card.creditLimit,
        current_debt: card.currentDebt,
        cut_off_day: card.cutOffDay,
        payment_due_day: card.paymentDueDay,
        interest_rate: card.interestRate || null,
        status: card.status,
        color: card.color,
        currency: card.currency,
        created_at: card.createdAt || new Date().toISOString(),
      });
      return !error;
    } catch (err) {
      console.error('Error al guardar tarjeta en la nube:', err);
      return false;
    }
  }

  // --- MOVIMIENTOS DE TARJETAS ---
  async fetchCardMovements(userId: string): Promise<CreditCardMovement[] | null> {
    if (!this.isReady() || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('card_movements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        cardId: row.card_id,
        type: row.type,
        concept: row.concept,
        amount: Number(row.amount),
        resultingDebt: Number(row.resulting_debt),
        date: row.date,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.error('Error al cargar movimientos de tarjetas de la nube:', err);
      return null;
    }
  }

  async saveCardMovement(userId: string, mov: CreditCardMovement): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      const { error } = await supabase.from('card_movements').upsert({
        id: mov.id,
        user_id: userId,
        card_id: mov.cardId,
        type: mov.type,
        concept: mov.concept,
        amount: mov.amount,
        resulting_debt: mov.resultingDebt,
        date: mov.date,
        created_at: mov.createdAt || new Date().toISOString(),
      });
      return !error;
    } catch (err) {
      console.error('Error al guardar movimiento de tarjeta en la nube:', err);
      return false;
    }
  }

  // --- PRÉSTAMOS ---
  async fetchLoans(userId: string): Promise<Loan[] | null> {
    if (!this.isReady() || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        name: row.name,
        institution: row.institution,
        originalAmount: Number(row.original_amount),
        pendingBalance: Number(row.pending_balance),
        monthlyPayment: Number(row.monthly_payment),
        startDate: row.start_date,
        dueDate: row.due_date,
        frequency: row.frequency,
        interestRate: row.interest_rate ? Number(row.interest_rate) : undefined,
        totalInstallments: Number(row.total_installments),
        paidInstallments: Number(row.paid_installments),
        remainingInstallments: Number(row.remaining_installments),
        status: row.status,
        category: row.category,
        color: row.color,
        currency: row.currency,
        createdAt: row.created_at,
        completedAt: row.completed_at,
        userId: row.user_id,
      }));
    } catch (err) {
      console.error('Error al cargar préstamos de la nube:', err);
      return null;
    }
  }

  async saveLoan(userId: string, loan: Loan): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      const { error } = await supabase.from('loans').upsert({
        id: loan.id,
        user_id: userId,
        name: loan.name,
        institution: loan.institution,
        original_amount: loan.originalAmount,
        pending_balance: loan.pendingBalance,
        monthly_payment: loan.monthlyPayment,
        start_date: loan.startDate,
        due_date: loan.dueDate,
        frequency: loan.frequency,
        interest_rate: loan.interestRate || null,
        total_installments: loan.totalInstallments,
        paid_installments: loan.paidInstallments,
        remaining_installments: loan.remainingInstallments,
        status: loan.status,
        category: loan.category,
        color: loan.color,
        currency: loan.currency,
        created_at: loan.createdAt || new Date().toISOString(),
        completed_at: loan.completedAt || null,
      });
      return !error;
    } catch (err) {
      console.error('Error al guardar préstamo en la nube:', err);
      return false;
    }
  }

  // --- PAGOS DE PRÉSTAMOS ---
  async fetchLoanPayments(userId: string): Promise<LoanPayment[] | null> {
    if (!this.isReady() || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('loan_payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        loanId: row.loan_id,
        paymentDate: row.payment_date,
        amount: Number(row.amount),
        sourceAccountId: row.source_account_id,
        installmentNumber: Number(row.installment_number),
        resultingBalance: Number(row.resulting_balance),
        notes: row.notes,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.error('Error al cargar pagos de préstamos de la nube:', err);
      return null;
    }
  }

  async saveLoanPayment(userId: string, payment: LoanPayment): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      const { error } = await supabase.from('loan_payments').upsert({
        id: payment.id,
        user_id: userId,
        loan_id: payment.loanId,
        payment_date: payment.paymentDate,
        amount: payment.amount,
        source_account_id: payment.sourceAccountId,
        installment_number: payment.installmentNumber,
        resulting_balance: payment.resultingBalance,
        notes: payment.notes || null,
        created_at: payment.createdAt || new Date().toISOString(),
      });
      return !error;
    } catch (err) {
      console.error('Error al guardar pago de préstamo en la nube:', err);
      return false;
    }
  }

  // --- PRESUPUESTOS ---
  async fetchBudgets(userId: string): Promise<Budget[] | null> {
    if (!this.isReady() || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        categoryId: row.category_id,
        monthlyLimit: Number(row.monthly_limit),
        currency: row.currency,
        month: row.month,
        alertThreshold: Number(row.alert_threshold || 80),
      }));
    } catch (err) {
      console.error('Error al cargar presupuestos de la nube:', err);
      return null;
    }
  }

  async saveBudget(userId: string, budget: Budget): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      const { error } = await supabase.from('budgets').upsert({
        id: budget.id,
        user_id: userId,
        category_id: budget.categoryId,
        monthly_limit: budget.monthlyLimit,
        currency: budget.currency,
        month: budget.month,
        alert_threshold: budget.alertThreshold,
      });
      return !error;
    } catch (err) {
      console.error('Error al guardar presupuesto en la nube:', err);
      return false;
    }
  }

  // --- LIMPIEZA TOTAL DE DATOS EN LA NUBE ---
  async clearAllUserData(userId: string): Promise<boolean> {
    if (!this.isReady() || !supabase) return false;
    try {
      await Promise.all([
        supabase.from('transactions').delete().eq('user_id', userId),
        supabase.from('categories').delete().eq('user_id', userId),
        supabase.from('payment_methods').delete().eq('user_id', userId),
        supabase.from('credit_cards').delete().eq('user_id', userId),
        supabase.from('card_movements').delete().eq('user_id', userId),
        supabase.from('loans').delete().eq('user_id', userId),
        supabase.from('loan_payments').delete().eq('user_id', userId),
        supabase.from('budgets').delete().eq('user_id', userId),
      ]);
      return true;
    } catch (err) {
      console.error('Error al borrar datos del usuario en la nube:', err);
      return false;
    }
  }

  // --- SUSCRIPCIÓN EN TIEMPO REAL (Realtime Sincro PC / Móvil) ---
  subscribeToChanges(userId: string, onUpdate: () => void): () => void {
    if (!this.isReady() || !supabase) return () => {};

    try {
      const uniqueChannelId = `sync-${userId.replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}`;
      const channel = supabase
        .channel(uniqueChannelId)
        .on('postgres_changes', { event: '*', schema: 'public', filter: `user_id=eq.${userId}` }, () => {
          onUpdate();
        })
        .subscribe();

      return () => {
        try {
          if (supabase && channel) {
            supabase.removeChannel(channel);
          }
        } catch {
          // Ignorar errores al desuscribir
        }
      };
    } catch (err) {
      console.error('Error al suscribir cambios en tiempo real:', err);
      return () => {};
    }
  }
}

export const cloudStorageService = new CloudStorageService();
