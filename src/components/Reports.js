import React, { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';
import * as XLSX from 'xlsx';
import './Reports.css';

const Reports = () => {
  const { 
    products, 
    sales, 
    getTodaySales, 
    getTodayTotalSales, 
    getTodayTransactionsCount, 
    getLowStockCount,
    getTodayNetProfit,
    getTodayTotalCost,
    calculateNetProfit,
    calculateTotalCost,
    createTestSale
  } = useData();

  const [filteredSales, setFilteredSales] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customerType: ''
  });
  const [showNewSaleNotification, setShowNewSaleNotification] = useState(false);

  // تحديث المبيعات المفلترة عند تغيير الفلاتر
  useEffect(() => {
    let filtered = sales;

    if (filters.startDate) {
      filtered = filtered.filter(sale => 
        new Date(sale.date) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(sale => 
        new Date(sale.date) <= new Date(filters.endDate + 'T23:59:59')
      );
    }

    if (filters.customerType) {
      filtered = filtered.filter(sale => 
        sale.customerType === filters.customerType
      );
    }

    setFilteredSales(filtered);
    console.log('🔄 تم تحديث المبيعات المفلترة:', filtered.length, 'مبيعات');
  }, [sales, filters]);

  // حساب الإحصائيات
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const transactionsCount = filteredSales.length;
  const averageTransactionValue = transactionsCount > 0 ? totalSales / transactionsCount : 0;
  const totalCost = calculateTotalCost(filteredSales);
  const netProfit = calculateNetProfit(filteredSales);
  const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

  // معلومات تشخيص مفصلة
  console.log('📊 معلومات التشخيص المفصلة:', {
    إجمالي_المبيعات: totalSales.toFixed(2),
    عدد_المعاملات: transactionsCount,
    إجمالي_التكلفة: totalCost.toFixed(2),
    صافي_الربح: netProfit.toFixed(2),
    هامش_الربح: profitMargin.toFixed(1) + '%',
    عدد_المنتجات: products.length,
    عدد_المبيعات_الإجمالي: sales.length,
    عدد_المبيعات_المفلترة: filteredSales.length,
    تفاصيل_المبيعات: filteredSales.map(sale => ({
      id: sale.id,
      total: sale.total,
      itemsCount: sale.items.length,
      items: sale.items.map(item => ({
        productId: item.productId || item.id,
        price: item.price,
        quantity: item.quantity
      }))
    }))
  });

  // تحديث فوري عند تغيير البيانات
  useEffect(() => {
    console.log('🔄 تحديث التقارير:', {
      إجمالي_المبيعات: totalSales.toFixed(2),
      عدد_المعاملات: transactionsCount,
      إجمالي_التكلفة: totalCost.toFixed(2),
      صافي_الربح: netProfit.toFixed(2),
      هامش_الربح: profitMargin.toFixed(1) + '%'
    });
    
    // إشعار عند وجود ربح جديد
    if (netProfit > 0) {
      console.log('💰 ربح جديد تم حسابه!');
    }
  }, [totalSales, transactionsCount, totalCost, netProfit, profitMargin]);

  // معلومات تشخيص
  console.log('📊 معلومات التشخيص:', {
    totalSales,
    transactionsCount,
    totalCost,
    netProfit,
    profitMargin,
    productsCount: products.length,
    salesCount: sales.length,
    filteredSalesCount: filteredSales.length
  });

  // إشعار عند وجود مبيعات جديدة
  useEffect(() => {
    if (sales.length > 0) {
      const latestSale = sales[sales.length - 1];
      const saleDate = new Date(latestSale.date);
      const now = new Date();
      const timeDiff = now - saleDate;
      
      // إذا كانت المبيعات في آخر 5 دقائق
      if (timeDiff < 5 * 60 * 1000) {
        console.log('🆕 مبيعات جديدة تمت!', {
          فاتورة: latestSale.id,
          المبلغ: latestSale.total,
          الوقت: saleDate.toLocaleTimeString('ar-EG')
        });
        
        // إظهار إشعار بصري
        setShowNewSaleNotification(true);
        setTimeout(() => setShowNewSaleNotification(false), 5000); // إخفاء بعد 5 ثواني
      }
    }
  }, [sales]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      customerType: ''
    });
  };

  // تصدير تقرير المبيعات كملف Excel
  const exportSalesReport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredSales.map(sale => ({
      'رقم الفاتورة': sale.id,
      'التاريخ': new Date(sale.date).toLocaleDateString('ar-EG'),
      'الوقت': new Date(sale.date).toLocaleTimeString('ar-EG'),
      'نوع العميل': sale.customerType === 'retail' ? 'قطاعي' : 'جملة',
      'عدد المنتجات': sale.items.length,
      'المجموع الفرعي': sale.subtotal,
      'الضريبة': sale.tax,
      'الإجمالي': sale.total
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير المبيعات');
    
    const fileName = `تقرير_المبيعات_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // تصدير تقرير المخزون كملف Excel
  const exportInventoryReport = () => {
    const worksheet = XLSX.utils.json_to_sheet(products.map(product => ({
      'اسم المنتج': product.name,
      'الباركود': product.barcode,
      'الفئة': product.category,
      'الوحدة': product.unit,
      'سعر الشراء': product.purchasePrice || 0,
      'سعر البيع بالجملة': product.wholesalePrice,
      'سعر البيع بالتجزئة': product.retailPrice,
      'الكمية المتوفرة': product.stock,
      'حالة المخزون': product.stock === 0 ? 'نفذ' : product.stock <= 10 ? 'منخفض' : 'جيد'
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير المخزون');
    
    const fileName = `تقرير_المخزون_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // تصدير مبيعات اليوم
  const exportTodaySales = () => {
    const todaySales = getTodaySales();
    const worksheet = XLSX.utils.json_to_sheet(todaySales.map(sale => ({
      'رقم الفاتورة': sale.id,
      'الوقت': new Date(sale.date).toLocaleTimeString('ar-EG'),
      'نوع العميل': sale.customerType === 'retail' ? 'قطاعي' : 'جملة',
      'عدد المنتجات': sale.items.length,
      'المجموع الفرعي': sale.subtotal,
      'الضريبة': sale.tax,
      'الإجمالي': sale.total
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'مبيعات اليوم');
    
    const fileName = `مبيعات_اليوم_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // طباعة التقرير
  const printReport = () => {
    window.print();
  };

  return (
    <div className="reports-container">
      {/* إشعار المبيعات الجديدة */}
      {showNewSaleNotification && (
        <div className="new-sale-notification">
          <div className="notification-content">
            <span className="notification-icon">🆕</span>
            <span className="notification-text">
              تم إتمام عملية بيع جديدة! تم تحديث التقارير تلقائياً.
            </span>
            <button 
              className="notification-close"
              onClick={() => setShowNewSaleNotification(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      <div className="reports-header">
        <h2>📊 التقارير والإحصائيات</h2>
      </div>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>المبيعات اليومية</h3>
            <p>{getTodayTotalSales().toFixed(2)} جنيه</p>
          </div>
        </div>
                 <div className="summary-card">
           <div className="card-icon">📈</div>
           <div className="card-content">
             <h3>صافي الربح اليومي</h3>
             <p className="profit-value">{getTodayNetProfit().toFixed(2)} جنيه</p>
           </div>
         </div>
                 <div className="summary-card">
           <div className="card-icon">💸</div>
           <div className="card-content">
             <h3>إجمالي التكلفة اليومية</h3>
             <p className="cost-value">{getTodayTotalCost().toFixed(2)} جنيه</p>
           </div>
         </div>
        <div className="summary-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>عدد المعاملات اليوم</h3>
            <p>{getTodayTransactionsCount()}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">🏪</div>
          <div className="card-content">
            <h3>إجمالي المنتجات</h3>
            <p>{products.length}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">⚠️</div>
          <div className="card-content">
            <h3>منتجات منخفضة المخزون</h3>
            <p>{getLowStockCount()}</p>
          </div>
        </div>
      </div>

      {/* Recent Sales Section */}
      <div className="detailed-report-section">
        <div className="section-header">
          <h3>🕒 المبيعات الحديثة</h3>
        </div>
        <div className="recent-sales">
          {getTodaySales().slice(0, 5).map(sale => (
            <div key={sale.id} className="recent-sale-item">
              <div className="sale-info">
                <span className="sale-id">فاتورة #{sale.id}</span>
                <span className="sale-time">
                  {new Date(sale.date).toLocaleTimeString('ar-EG')}
                </span>
              </div>
              <div className="sale-amount">
                {sale.total.toFixed(2)} جنيه
              </div>
            </div>
          ))}
          {getTodaySales().length === 0 && (
            <p className="no-sales">لا توجد مبيعات اليوم</p>
          )}
        </div>
      </div>

      {/* Comprehensive Sales Report */}
      <div className="detailed-report-section">
        <div className="section-header">
          <h3>📋 التقرير الشامل للمبيعات</h3>
          <div className="report-controls">
            <button onClick={exportTodaySales} className="export-btn">
              📅 تصدير اليوم
            </button>
            <button onClick={exportSalesReport} className="export-btn">
              📊 تصدير Excel
            </button>
            <button onClick={exportInventoryReport} className="export-btn">
              📦 تصدير المخزون
            </button>
            <button onClick={printReport} className="print-btn">
              🖨️ طباعة التقرير
            </button>
            <button onClick={createTestSale} className="export-btn" style={{background: '#ff6b6b'}}>
              🧪 إنشاء مبيعات تجريبية
            </button>
            <button onClick={() => {
              console.log('🔍 فحص البيانات الحالية:', {
                products: products.map(p => ({ id: p.id, name: p.name, purchasePrice: p.purchasePrice })),
                sales: sales.map(s => ({ id: s.id, items: s.items }))
              });
            }} className="export-btn" style={{background: '#17a2b8'}}>
              🔍 فحص البيانات
            </button>
          </div>
        </div>
        
        <div className="report-filters">
          <div className="filter-group">
            <label>من تاريخ:</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>إلى تاريخ:</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>نوع العميل:</label>
            <select
              name="customerType"
              value={filters.customerType}
              onChange={handleFilterChange}
            >
              <option value="">الكل</option>
              <option value="retail">قطاعي</option>
              <option value="wholesale">جملة</option>
            </select>
          </div>
          <button onClick={clearFilters} className="clear-filters-btn">
            مسح الفلاتر
          </button>
        </div>

        <div className="sales-summary">
          <div className="summary-item">
            <span>إجمالي المبيعات:</span>
            <span>{totalSales.toFixed(2)} جنيه</span>
          </div>
          <div className="summary-item">
            <span>إجمالي التكلفة:</span>
            <span>{totalCost.toFixed(2)} جنيه</span>
          </div>
          <div className="summary-item">
            <span>صافي الربح:</span>
            <span className={netProfit >= 0 ? 'positive-profit' : 'negative-profit'}>
              {netProfit.toFixed(2)} جنيه
            </span>
          </div>
          <div className="summary-item">
            <span>هامش الربح:</span>
            <span className={profitMargin >= 0 ? 'positive-profit' : 'negative-profit'}>
              {profitMargin.toFixed(1)}%
            </span>
          </div>
          <div className="summary-item">
            <span>عدد المعاملات:</span>
            <span>{transactionsCount}</span>
          </div>
          <div className="summary-item">
            <span>متوسط قيمة المعاملة:</span>
            <span>{averageTransactionValue.toFixed(2)} جنيه</span>
          </div>
        </div>

        <div className="detailed-sales-table">
          <table>
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>التاريخ والوقت</th>
                <th>نوع العميل</th>
                <th>عدد المنتجات</th>
                <th>المجموع الفرعي</th>
                <th>الضريبة</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>
                    {new Date(sale.date).toLocaleDateString('ar-EG')}
                    <br />
                    {new Date(sale.date).toLocaleTimeString('ar-EG')}
                  </td>
                  <td>
                    {sale.customerType === 'retail' ? 'قطاعي' : 'جملة'}
                  </td>
                  <td>{sale.items.length}</td>
                  <td>{sale.subtotal.toFixed(2)} ج.م</td>
                  <td>{sale.tax.toFixed(2)} ج.م</td>
                  <td>{sale.total.toFixed(2)} ج.م</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSales.length === 0 && (
            <div className="no-data">
              <p>لا توجد بيانات للعرض</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

