import React, { useState, useEffect } from 'react';
import { walletAPI } from '../services/wallet';
import toast from 'react-hot-toast';
import theme from '../theme';
import Card from './Card';
import Button from './Button';

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: theme.spacing[6],
  },
  header: {
    marginBottom: theme.spacing[6],
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  balanceCard: {
    background: `linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.primary.dark} 100%)`,
    color: theme.colors.neutral.white,
    padding: theme.spacing[6],
    borderRadius: '16px',
    marginBottom: theme.spacing[6],
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: '3rem',
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing[2],
  },
  balanceLabel: {
    fontSize: theme.typography.fontSize.lg,
    opacity: 0.9,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[6],
  },
  statCard: {
    padding: theme.spacing[4],
    textAlign: 'center',
    border: `1px solid ${theme.colors.neutral.gray200}`,
    borderRadius: '12px',
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary.main,
    marginBottom: theme.spacing[1],
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  transactionsSection: {
    marginTop: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  transactionsList: {
    space: theme.spacing[3],
  },
  transactionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[4],
    border: `1px solid ${theme.colors.neutral.gray200}`,
    borderRadius: '12px',
    marginBottom: theme.spacing[3],
  },
  transactionLeft: {
    flex: 1,
  },
  transactionType: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: theme.spacing[1],
  },
  transactionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  transactionDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
  },
  transactionRight: {
    textAlign: 'right',
  },
  transactionAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[1],
  },
  transactionStatus: {
    fontSize: theme.typography.fontSize.xs,
    padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
    borderRadius: '6px',
    textTransform: 'capitalize',
  },
  credit: {
    color: theme.colors.success.main,
  },
  debit: {
    color: theme.colors.error.main,
  },
  refund: {
    color: theme.colors.info.main,
  },
  payment: {
    color: theme.colors.warning.main,
  },
  loadingText: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    padding: theme.spacing[8],
  },
  errorText: {
    textAlign: 'center',
    color: theme.colors.error.main,
    padding: theme.spacing[8],
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing[8],
    color: theme.colors.text.secondary,
  },
  filterContainer: {
    display: 'flex',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
    border: `1px solid ${theme.colors.neutral.gray300}`,
    borderRadius: '8px',
    background: theme.colors.neutral.white,
    fontSize: theme.typography.fontSize.sm,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeFilterButton: {
    background: theme.colors.primary.main,
    color: theme.colors.neutral.white,
    borderColor: theme.colors.primary.main,
  },
};

const WalletDashboard = () => {
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [transactionPage, setTransactionPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [transactionFilter, transactionPage]);

  const fetchWalletData = async () => {
    try {
      const response = await walletAPI.getWallet();
      setWalletData(response.data);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('Failed to load wallet information');
      toast.error('Failed to load wallet information');
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: transactionPage,
        limit: 10,
        ...(transactionFilter !== 'all' && { type: transactionFilter }),
      };

      const response = await walletAPI.getTransactionHistory(params);
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getTransactionColor = (type) => {
    const colors = {
      credit: styles.credit.color,
      debit: styles.debit.color,
      refund: styles.refund.color,
      payment: styles.payment.color,
    };
    return colors[type] || theme.colors.text.primary;
  };

  const getAmountPrefix = (type) => {
    return type === 'debit' || type === 'payment' ? '-' : '+';
  };

  const filterButtons = [
    { key: 'all', label: 'All Transactions' },
    { key: 'credit', label: 'Credits' },
    { key: 'debit', label: 'Debits' },
    { key: 'refund', label: 'Refunds' },
    { key: 'payment', label: 'Payments' },
  ];

  if (loading && !walletData) {
    return <div style={styles.loadingText}>Loading wallet information...</div>;
  }

  if (error) {
    return <div style={styles.errorText}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Wallet</h1>
        <p style={styles.subtitle}>
          Manage your balance, view transaction history, and track refunds
        </p>
      </div>

      {/* Balance Card */}
      {walletData && (
        <div style={styles.balanceCard}>
          <div style={styles.balanceAmount}>
            {formatCurrency(walletData.balance)}
          </div>
          <div style={styles.balanceLabel}>Available Balance</div>
        </div>
      )}

      {/* Statistics */}
      {walletData && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {formatCurrency(walletData.totalCredits)}
            </div>
            <div style={styles.statLabel}>Total Credits</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {formatCurrency(walletData.totalDebits)}
            </div>
            <div style={styles.statLabel}>Total Spent</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {walletData.transactions?.length || 0}
            </div>
            <div style={styles.statLabel}>Total Transactions</div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div style={styles.transactionsSection}>
        <h2 style={styles.sectionTitle}>Transaction History</h2>
        
        {/* Filter Buttons */}
        <div style={styles.filterContainer}>
          {filterButtons.map((filter) => (
            <button
              key={filter.key}
              style={{
                ...styles.filterButton,
                ...(transactionFilter === filter.key && styles.activeFilterButton),
              }}
              onClick={() => {
                setTransactionFilter(filter.key);
                setTransactionPage(1);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {loading ? (
          <div style={styles.loadingText}>Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <div style={styles.emptyState}>
            No transactions found for the selected filter.
          </div>
        ) : (
          <div style={styles.transactionsList}>
            {transactions.map((transaction) => (
              <div key={transaction._id} style={styles.transactionItem}>
                <div style={styles.transactionLeft}>
                  <div 
                    style={{
                      ...styles.transactionType,
                      color: getTransactionColor(transaction.type),
                    }}
                  >
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </div>
                  <div style={styles.transactionDescription}>
                    {transaction.description}
                  </div>
                  <div style={styles.transactionDate}>
                    {formatDate(transaction.date)}
                  </div>
                </div>
                <div style={styles.transactionRight}>
                  <div 
                    style={{
                      ...styles.transactionAmount,
                      color: getTransactionColor(transaction.type),
                    }}
                  >
                    {getAmountPrefix(transaction.type)}{formatCurrency(transaction.amount)}
                  </div>
                  <span 
                    style={{
                      ...styles.transactionStatus,
                      background: transaction.status === 'completed' 
                        ? theme.colors.success.light 
                        : theme.colors.warning.light,
                      color: transaction.status === 'completed' 
                        ? theme.colors.success.dark 
                        : theme.colors.warning.dark,
                    }}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: theme.spacing[2], marginTop: theme.spacing[4] }}>
            <div style={{ transform: 'scale(0.85)' }}>
              <Button
                variant="secondary"
                onClick={() => setTransactionPage(Math.max(1, transactionPage - 1))}
                disabled={transactionPage === 1}
              >
                Previous
              </Button>
            </div>
            <span style={{ padding: `0 ${theme.spacing[2]}`, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, whiteSpace: 'nowrap' }}>
              Page {pagination.current} of {pagination.total}
            </span>
            <div style={{ transform: 'scale(0.85)' }}>
              <Button
                variant="secondary"
                onClick={() => setTransactionPage(Math.min(pagination.total, transactionPage + 1))}
                disabled={transactionPage === pagination.total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletDashboard;