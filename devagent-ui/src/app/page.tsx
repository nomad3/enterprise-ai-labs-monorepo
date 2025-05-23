'use client';

import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import styles from './page.module.css';
import Tickets from './components/Tickets';
import CodeGeneration from './components/CodeGeneration';
import Login from './components/Login';
import Register from './components/Register';

export default function Home() {
  const { user, loading } = useAuth();
  const [selectedTab, setSelectedTab] = useState('tickets');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login />
    ) : (
      <Register />
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>DevAgent</h1>
          <p className={styles.subtitle}>Full-Stack Developer & DevOps AI Agent</p>
        </div>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name}</span>
          <span className={styles.userRole}>{user.role}</span>
        </div>
      </header>

      <nav className={styles.nav}>
        <button 
          className={`${styles.navButton} ${selectedTab === 'tickets' ? styles.active : ''}`}
          onClick={() => setSelectedTab('tickets')}
        >
          Tickets
        </button>
        <button 
          className={`${styles.navButton} ${selectedTab === 'plans' ? styles.active : ''}`}
          onClick={() => setSelectedTab('plans')}
        >
          Plans
        </button>
        <button 
          className={`${styles.navButton} ${selectedTab === 'code' ? styles.active : ''}`}
          onClick={() => setSelectedTab('code')}
        >
          Code Generation
        </button>
        <button 
          className={`${styles.navButton} ${selectedTab === 'tests' ? styles.active : ''}`}
          onClick={() => setSelectedTab('tests')}
        >
          Test Generation
        </button>
        <button 
          className={`${styles.navButton} ${selectedTab === 'version' ? styles.active : ''}`}
          onClick={() => setSelectedTab('version')}
        >
          Version Control
        </button>
        <button 
          className={`${styles.navButton} ${selectedTab === 'cicd' ? styles.active : ''}`}
          onClick={() => setSelectedTab('cicd')}
        >
          CI/CD
        </button>
      </nav>

      <main className={styles.main}>
        {selectedTab === 'tickets' && <Tickets />}
        {selectedTab === 'plans' && (
          <div className={styles.content}>
            <h2>Development Plans</h2>
            <p>View and manage development plans</p>
          </div>
        )}
        {selectedTab === 'code' && <CodeGeneration />}
        {selectedTab === 'tests' && (
          <div className={styles.content}>
            <h2>Test Generation</h2>
            <p>Generate tests for your code</p>
          </div>
        )}
        {selectedTab === 'version' && (
          <div className={styles.content}>
            <h2>Version Control</h2>
            <p>Manage version control operations</p>
          </div>
        )}
        {selectedTab === 'cicd' && (
          <div className={styles.content}>
            <h2>CI/CD</h2>
            <p>Manage continuous integration and deployment</p>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>DevAgent v0.1.0</p>
      </footer>
    </div>
  );
}
