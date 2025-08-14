import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import './BackupManager.css';

const BackupManager = () => {
  const {
    lastBackup,
    backupStatus,
    backupHistory,
    createManualBackup,
    restoreBackup,
    deleteBackup
  } = useData();

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [manualBackupDescription, setManualBackupDescription] = useState('');
  const [showManualBackupModal, setShowManualBackupModal] = useState(false);

  const handleCreateManualBackup = async () => {
    try {
      await createManualBackup(manualBackupDescription || 'نسخة احتياطية يدوية');
      setShowManualBackupModal(false);
      setManualBackupDescription('');
      alert('✅ تم إنشاء النسخة الاحتياطية بنجاح!');
    } catch (error) {
      alert('❌ فشل في إنشاء النسخة الاحتياطية: ' + error.message);
    }
  };

  const handleRestoreBackup = async (backupId) => {
    if (window.confirm('⚠️ تحذير: استعادة النسخة الاحتياطية ستحل محل جميع البيانات الحالية. هل أنت متأكد؟')) {
      try {
        await restoreBackup(backupId);
        setShowRestoreModal(false);
        setSelectedBackup(null);
        alert('✅ تم استعادة النسخة الاحتياطية بنجاح! سيتم إعادة تحميل الصفحة.');
        window.location.reload();
      } catch (error) {
        alert('❌ فشل في استعادة النسخة الاحتياطية: ' + error.message);
      }
    }
  };

  const handleDeleteBackup = async (backupId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) {
      try {
        await deleteBackup(backupId);
        alert('🗑️ تم حذف النسخة الاحتياطية بنجاح!');
      } catch (error) {
        alert('❌ فشل في حذف النسخة الاحتياطية: ' + error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getBackupTypeIcon = (type) => {
    return type === 'auto' ? '🤖' : '👤';
  };

  return (
    <div className="backup-manager">
      <h2 className="section-title">💾 إدارة النسخ الاحتياطي</h2>
      
      {/* حالة النسخ الاحتياطي */}
      <div className="backup-status">
        <div className="status-card">
          <h3>حالة النسخ الاحتياطي</h3>
          <div className="status-info">
            <span className="status-icon">{getStatusIcon(backupStatus)}</span>
            <span className="status-text">
              {backupStatus === 'running' && 'جاري إنشاء نسخة احتياطية...'}
              {backupStatus === 'success' && 'آخر نسخة احتياطية ناجحة'}
              {backupStatus === 'error' && 'فشل في آخر نسخة احتياطية'}
              {backupStatus === 'idle' && 'في انتظار النسخة الاحتياطية التالية'}
            </span>
          </div>
          {lastBackup && (
            <p className="last-backup">
              آخر نسخة احتياطية: {formatDate(lastBackup)}
            </p>
          )}
        </div>
      </div>

      {/* أزرار التحكم */}
      <div className="backup-controls">
        <button 
          className="btn btn-primary"
          onClick={() => setShowManualBackupModal(true)}
          disabled={backupStatus === 'running'}
        >
          📦 إنشاء نسخة احتياطية يدوية
        </button>
        
        <button 
          className="btn btn-secondary"
          onClick={() => setShowRestoreModal(true)}
        >
          🔄 استعادة نسخة احتياطية
        </button>
      </div>

      {/* تاريخ النسخ الاحتياطية */}
      <div className="backup-history">
        <h3>تاريخ النسخ الاحتياطية</h3>
        <div className="backup-list">
          {backupHistory.length === 0 ? (
            <p className="no-backups">لا توجد نسخ احتياطية بعد</p>
          ) : (
            backupHistory.map((backup) => (
              <div key={backup.id} className="backup-item">
                <div className="backup-info">
                  <div className="backup-header">
                    <span className="backup-type">
                      {getBackupTypeIcon(backup.type)}
                      {backup.type === 'auto' ? 'تلقائي' : 'يدوي'}
                    </span>
                    <span className="backup-date">{formatDate(backup.timestamp)}</span>
                  </div>
                  <div className="backup-details">
                    <span>المنتجات: {backup.productsCount}</span>
                    <span>المبيعات: {backup.salesCount}</span>
                    {backup.description && (
                      <span className="backup-description">{backup.description}</span>
                    )}
                  </div>
                </div>
                <div className="backup-actions">
                  <button 
                    className="btn btn-small btn-primary"
                    onClick={() => handleRestoreBackup(backup.id)}
                  >
                    استعادة
                  </button>
                  <button 
                    className="btn btn-small btn-danger"
                    onClick={() => handleDeleteBackup(backup.id)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* معلومات النسخ الاحتياطي التلقائي */}
      <div className="backup-info">
        <h3>معلومات النسخ الاحتياطي التلقائي</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">التكرار:</span>
            <span className="info-value">كل 24 ساعة</span>
          </div>
          <div className="info-item">
            <span className="info-label">الاحتفاظ:</span>
            <span className="info-value">آخر 10 نسخ + تنظيف تلقائي بعد 30 يوم</span>
          </div>
          <div className="info-item">
            <span className="info-label">المحتوى:</span>
            <span className="info-value">جميع المنتجات والمبيعات</span>
          </div>
        </div>
      </div>

      {/* Modal إنشاء نسخة احتياطية يدوية */}
      {showManualBackupModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>إنشاء نسخة احتياطية يدوية</h3>
            <div className="form-group">
              <label>وصف النسخة الاحتياطية (اختياري):</label>
              <input
                type="text"
                value={manualBackupDescription}
                onChange={(e) => setManualBackupDescription(e.target.value)}
                placeholder="مثال: قبل تحديث المخزون"
              />
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={handleCreateManualBackup}
              >
                إنشاء النسخة الاحتياطية
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowManualBackupModal(false);
                  setManualBackupDescription('');
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal استعادة نسخة احتياطية */}
      {showRestoreModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>استعادة نسخة احتياطية</h3>
            <div className="backup-selection">
              {backupHistory.length === 0 ? (
                <p>لا توجد نسخ احتياطية متاحة</p>
              ) : (
                backupHistory.map((backup) => (
                  <div 
                    key={backup.id} 
                    className={`backup-option ${selectedBackup?.id === backup.id ? 'selected' : ''}`}
                    onClick={() => setSelectedBackup(backup)}
                  >
                    <div className="backup-option-header">
                      <span className="backup-type">
                        {getBackupTypeIcon(backup.type)}
                        {backup.type === 'auto' ? 'تلقائي' : 'يدوي'}
                      </span>
                      <span className="backup-date">{formatDate(backup.timestamp)}</span>
                    </div>
                    <div className="backup-option-details">
                      <span>المنتجات: {backup.productsCount}</span>
                      <span>المبيعات: {backup.salesCount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => handleRestoreBackup(selectedBackup.id)}
                disabled={!selectedBackup}
              >
                استعادة النسخة المحددة
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowRestoreModal(false);
                  setSelectedBackup(null);
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManager;
