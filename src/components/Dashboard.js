import React, { useState, useEffect } from 'react';
import POS from './POS';
import Inventory from './Inventory';
import Reports from './Reports';
import BackupManager from './BackupManager';
import { useData } from '../hooks/useData';
import './Dashboard.css';

const Dashboard = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState('pos');
  const { lastBackup, backupStatus, products, sales } = useData();
  const [showBackupNotification, setShowBackupNotification] = useState(false);

  const handleLogout = () => {
    onLogout();
  };

  const switchTab = (tabName) => {
    setActiveTab(tabName);
  };

  // فحص حالة النسخ الاحتياطي
  useEffect(() => {
    if (backupStatus === 'success' && lastBackup) {
      const hoursSinceLastBackup = (new Date() - lastBackup) / (1000 * 60 * 60);
      if (hoursSinceLastBackup >= 23) { // تحذير قبل ساعة من موعد النسخ الاحتياطي التالي
        setShowBackupNotification(true);
      }
    }
  }, [backupStatus, lastBackup]);

  // تحديث فوري عند تغيير البيانات
  useEffect(() => {
    console.log('🔄 تحديث لوحة التحكم:', {
      عدد_المنتجات: products?.length || 0,
      عدد_المبيعات: sales?.length || 0,
      آخر_نسخة_احتياطية: lastBackup ? new Date(lastBackup).toLocaleString('ar-EG') : 'لا يوجد'
    });
  }, [lastBackup, products?.length, sales?.length]);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="header">
          <div className="header-content">
            <div className="header-text">
              <h1>🏪 نظام كاشير محل البلاستيكات</h1>
              <p>نظام متكامل لإدارة محل البلاستيكات</p>
            </div>
            <div className="header-actions">
              <button className="logout-btn" onClick={handleLogout}>
                <span className="logout-icon">🚪</span>
                <span className="logout-text">تسجيل الخروج</span>
              </button>
            </div>
          </div>
        </div>

        {/* Backup Notification */}
        {showBackupNotification && (
          <div className="backup-notification">
            <div className="notification-content">
              <span className="notification-icon">💾</span>
              <span className="notification-text">
                موعد النسخ الاحتياطي التلقائي قريب! سيتم إنشاء نسخة احتياطية خلال الساعة القادمة.
              </span>
              <button 
                className="notification-close"
                onClick={() => setShowBackupNotification(false)}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button 
            className={`tab-button ${activeTab === 'pos' ? 'active' : ''}`} 
            onClick={() => switchTab('pos')}
          >
            <span>🛒</span>
            <span>نقطة البيع</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`} 
            onClick={() => switchTab('inventory')}
          >
            <span>📦</span>
            <span>إدارة المخزون</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`} 
            onClick={() => switchTab('reports')}
          >
            <span>📊</span>
            <span>التقارير</span>
          </button>
          <button 
            className={`tab-button ${activeTab === 'backup' ? 'active' : ''}`} 
            onClick={() => switchTab('backup')}
          >
            <span>💾</span>
            <span>النسخ الاحتياطي</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'pos' && <POS />}
          {activeTab === 'inventory' && <Inventory />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'backup' && <BackupManager />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
