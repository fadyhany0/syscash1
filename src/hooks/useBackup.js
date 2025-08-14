import { useState, useEffect, useCallback } from 'react';

export const useBackup = () => {
  const [lastBackup, setLastBackup] = useState(null);
  const [backupStatus, setBackupStatus] = useState('idle'); // idle, running, success, error
  const [backupHistory, setBackupHistory] = useState([]);

  // تحميل معلومات النسخ الاحتياطي
  useEffect(() => {
    try {
      const savedLastBackup = localStorage.getItem('lastBackup');
      const savedBackupHistory = localStorage.getItem('backupHistory');
      
      if (savedLastBackup) {
        setLastBackup(new Date(savedLastBackup));
      }
      
      if (savedBackupHistory) {
        setBackupHistory(JSON.parse(savedBackupHistory));
      }
    } catch (error) {
      console.error('خطأ في تحميل معلومات النسخ الاحتياطي:', error);
    }
  }, []);

  // إنشاء نسخة احتياطية
  const createBackup = useCallback(async (data) => {
    setBackupStatus('running');
    
    try {
      const backupData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        products: data.products || [],
        sales: data.sales || [],
        version: '1.0',
        description: 'نسخة احتياطية تلقائية'
      };

      // حفظ النسخة الاحتياطية
      const backupKey = `backup_${backupData.id}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      // تحديث معلومات النسخ الاحتياطي
      setLastBackup(new Date());
      localStorage.setItem('lastBackup', new Date().toISOString());
      
      // إضافة للتاريخ
      const newHistory = [
        {
          id: backupData.id,
          timestamp: backupData.timestamp,
          productsCount: backupData.products.length,
          salesCount: backupData.sales.length,
          type: 'auto'
        },
        ...backupHistory.slice(0, 9) // الاحتفاظ بآخر 10 نسخ فقط
      ];
      
      setBackupHistory(newHistory);
      localStorage.setItem('backupHistory', JSON.stringify(newHistory));
      
      setBackupStatus('success');
      
      console.log('✅ تم إنشاء نسخة احتياطية بنجاح:', backupData.id);
      
      return backupData;
    } catch (error) {
      console.error('❌ خطأ في إنشاء النسخة الاحتياطية:', error);
      setBackupStatus('error');
      throw error;
    }
  }, [backupHistory]);

  // استعادة نسخة احتياطية
  const restoreBackup = useCallback(async (backupId) => {
    try {
      const backupKey = `backup_${backupId}`;
      const backupData = localStorage.getItem(backupKey);
      
      if (!backupData) {
        throw new Error('النسخة الاحتياطية غير موجودة');
      }
      
      const parsedBackup = JSON.parse(backupData);
      
      // استعادة البيانات
      localStorage.setItem('products', JSON.stringify(parsedBackup.products));
      localStorage.setItem('sales', JSON.stringify(parsedBackup.sales));
      
      console.log('✅ تم استعادة النسخة الاحتياطية بنجاح:', backupId);
      
      return parsedBackup;
    } catch (error) {
      console.error('❌ خطأ في استعادة النسخة الاحتياطية:', error);
      throw error;
    }
  }, []);

  // حذف نسخة احتياطية
  const deleteBackup = useCallback(async (backupId) => {
    try {
      const backupKey = `backup_${backupId}`;
      localStorage.removeItem(backupKey);
      
      // إزالة من التاريخ
      const newHistory = backupHistory.filter(backup => backup.id !== backupId);
      setBackupHistory(newHistory);
      localStorage.setItem('backupHistory', JSON.stringify(newHistory));
      
      console.log('🗑️ تم حذف النسخة الاحتياطية:', backupId);
    } catch (error) {
      console.error('❌ خطأ في حذف النسخة الاحتياطية:', error);
      throw error;
    }
  }, [backupHistory]);

  // الحصول على جميع النسخ الاحتياطية
  const getAllBackups = useCallback(() => {
    const backups = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('backup_')) {
        try {
          const backupData = JSON.parse(localStorage.getItem(key));
          backups.push(backupData);
        } catch (error) {
          console.error('خطأ في قراءة النسخة الاحتياطية:', key, error);
        }
      }
    }
    
    return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, []);

  // التحقق من الحاجة للنسخ الاحتياطي
  const shouldCreateBackup = useCallback(() => {
    if (!lastBackup) return true;
    
    const now = new Date();
    const hoursSinceLastBackup = (now - lastBackup) / (1000 * 60 * 60);
    
    return hoursSinceLastBackup >= 24;
  }, [lastBackup]);

  // تنظيف النسخ الاحتياطية القديمة (أكثر من 30 يوم)
  const cleanupOldBackups = useCallback(() => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const backups = getAllBackups();
      let deletedCount = 0;
      
      backups.forEach(backup => {
        if (new Date(backup.timestamp) < thirtyDaysAgo) {
          localStorage.removeItem(`backup_${backup.id}`);
          deletedCount++;
        }
      });
      
      if (deletedCount > 0) {
        console.log(`🗑️ تم حذف ${deletedCount} نسخة احتياطية قديمة`);
      }
    } catch (error) {
      console.error('خطأ في تنظيف النسخ الاحتياطية القديمة:', error);
    }
  }, [getAllBackups]);

  // إنشاء نسخة احتياطية يدوية
  const createManualBackup = useCallback(async (data, description = 'نسخة احتياطية يدوية') => {
    try {
      const backupData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        products: data.products || [],
        sales: data.sales || [],
        version: '1.0',
        description
      };

      const backupKey = `backup_${backupData.id}`;
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      // إضافة للتاريخ
      const newHistory = [
        {
          id: backupData.id,
          timestamp: backupData.timestamp,
          productsCount: backupData.products.length,
          salesCount: backupData.sales.length,
          type: 'manual',
          description
        },
        ...backupHistory.slice(0, 9)
      ];
      
      setBackupHistory(newHistory);
      localStorage.setItem('backupHistory', JSON.stringify(newHistory));
      
      console.log('✅ تم إنشاء نسخة احتياطية يدوية:', backupData.id);
      
      return backupData;
    } catch (error) {
      console.error('❌ خطأ في إنشاء النسخة الاحتياطية اليدوية:', error);
      throw error;
    }
  }, [backupHistory]);

  return {
    lastBackup,
    backupStatus,
    backupHistory,
    createBackup,
    restoreBackup,
    deleteBackup,
    getAllBackups,
    shouldCreateBackup,
    cleanupOldBackups,
    createManualBackup
  };
};
