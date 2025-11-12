import React from 'react';
import Navbar from '../components/Navbar';
import WalletDashboard from '../components/WalletDashboard';
import theme from '../theme';

const styles = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${theme.colors.background.default} 0%, ${theme.colors.neutral.gray50} 100%)`,
  },
  content: {
    paddingTop: theme.spacing[8],
  },
};

const WalletPage = () => {
  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <WalletDashboard />
      </div>
    </div>
  );
};

export default WalletPage;