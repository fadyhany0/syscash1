import { useState, useEffect } from 'react';
import { useBackup } from './useBackup';

// بيانات المنتجات الافتراضية
const defaultProducts = [
  {
    id: 1,
    name: "أكياس شفافة صغيرة",
    category: "أكياس",
    unit: "كيلو",
    barcode: "123456789",
    purchasePrice: 20.00, // سعر الشراء (الجملة)
    wholesalePrice: 25.00, // سعر البيع بالجملة
    retailPrice: 35.00, // سعر البيع بالتجزئة
    stock: 50
  },
  {
    id: 2,
    name: "أكياس شفافة متوسطة",
    category: "أكياس",
    unit: "كيلو",
    barcode: "987654321",
    purchasePrice: 22.00,
    wholesalePrice: 28.00,
    retailPrice: 38.00,
    stock: 30
  },
  {
    id: 3,
    name: "كوبيات بلاستيك شفافة",
    category: "كوبيات",
    unit: "دستة",
    barcode: "456789123",
    purchasePrice: 12.00,
    wholesalePrice: 15.00,
    retailPrice: 22.00,
    stock: 40
  },
  {
    id: 4,
    name: "صحون بلاستيك صغيرة",
    category: "صحون",
    unit: "دستة",
    barcode: "789123456",
    purchasePrice: 9.00,
    wholesalePrice: 12.00,
    retailPrice: 18.00,
    stock: 60
  },
  {
    id: 5,
    name: "علب طعام متوسطة",
    category: "علب طعام",
    unit: "قطعة",
    barcode: "321654987",
    purchasePrice: 6.00,
    wholesalePrice: 8.00,
    retailPrice: 12.00,
    stock: 25
  }
];

export const useData = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [nextProductId, setNextProductId] = useState(6);
  
  // نظام النسخ الاحتياطي
  const {
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
  } = useBackup();

  // تحميل البيانات من التخزين المحلي
  useEffect(() => {
    try {
      const productsData = localStorage.getItem('products');
      const salesData = localStorage.getItem('sales');
      
      if (productsData) {
        const parsedProducts = JSON.parse(productsData);
        setProducts(parsedProducts);
        if (parsedProducts.length > 0) {
          setNextProductId(Math.max(...parsedProducts.map(p => p.id)) + 1);
        }
      } else {
        setProducts(defaultProducts);
        // حفظ البيانات الافتراضية عند أول تشغيل
        localStorage.setItem('products', JSON.stringify(defaultProducts));
      }
      
      if (salesData) {
        setSales(JSON.parse(salesData));
      } else {
        // حفظ مصفوفة فارغة للمبيعات عند أول تشغيل
        localStorage.setItem('sales', JSON.stringify([]));
      }
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
      setProducts(defaultProducts);
      setSales([]);
    }
  }, []);

  // حفظ البيانات عند تغييرها
  useEffect(() => {
    if (products.length > 0 || sales.length > 0) {
      try {
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('sales', JSON.stringify(sales));
        console.log('💾 تم حفظ البيانات تلقائياً:', {
          عدد_المنتجات: products.length,
          عدد_المبيعات: sales.length
        });
      } catch (error) {
        console.error('خطأ في حفظ البيانات:', error);
      }
    }
  }, [products, sales]);

  // فحص النسخ الاحتياطي التلقائي كل 24 ساعة
  useEffect(() => {
    const checkBackup = async () => {
      if (shouldCreateBackup() && (products.length > 0 || sales.length > 0)) {
        try {
          await createBackup({ products, sales });
          console.log('🔄 تم إنشاء نسخة احتياطية تلقائية');
        } catch (error) {
          console.error('❌ فشل في إنشاء النسخة الاحتياطية التلقائية:', error);
        }
      }
    };

    // فحص فوري عند التحميل
    checkBackup();

    // فحص كل ساعة
    const interval = setInterval(checkBackup, 60 * 60 * 1000);

    // تنظيف النسخ الاحتياطية القديمة كل يوم
    const cleanupInterval = setInterval(() => {
      cleanupOldBackups();
    }, 24 * 60 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, [products, sales, shouldCreateBackup, createBackup, cleanupOldBackups]);

  // إضافة منتج جديد
  const addProduct = (productData) => {
    const newProduct = {
      id: nextProductId,
      ...productData
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    setNextProductId(nextProductId + 1);
    
    // حفظ فوري للبيانات
    try {
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('خطأ في حفظ المنتج الجديد:', error);
    }
  };

  // تحديث منتج
  const updateProduct = (id, updatedData) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...updatedData } : product
    );
    setProducts(updatedProducts);
    
    // حفظ فوري للبيانات
    try {
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('خطأ في حفظ تحديث المنتج:', error);
    }
  };

  // حذف منتج
  const deleteProduct = (id) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    
    // حفظ فوري للبيانات
    try {
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('خطأ في حفظ حذف المنتج:', error);
    }
  };

  // تحديث مخزون المنتج
  const updateProductStock = (id, quantity) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, stock: Math.max(0, product.stock - quantity) } : product
    );
    setProducts(updatedProducts);
    
    // حفظ فوري للبيانات
    try {
      localStorage.setItem('products', JSON.stringify(updatedProducts));
    } catch (error) {
      console.error('خطأ في حفظ تحديث المخزون:', error);
    }
  };

  // إضافة مبيعات
  const addSale = (saleData) => {
    const updatedSales = [...sales, saleData];
    setSales(updatedSales);
    
    // حفظ فوري للبيانات
    try {
      localStorage.setItem('sales', JSON.stringify(updatedSales));
      console.log('💾 تم حفظ المبيعات في التخزين المحلي');
      
      // حساب الربح الفوري للفاتورة الجديدة
      const saleProfit = saleData.items.reduce((totalProfit, item) => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const sellingPrice = parseFloat(item.price) || 0;
          const purchasePrice = parseFloat(product.purchasePrice) || 0;
          const quantity = parseInt(item.quantity) || 0;
          const itemProfit = (sellingPrice - purchasePrice) * quantity;
          console.log(`📦 ${product.name}: ربح = ${itemProfit.toFixed(2)} ج.م`);
          return totalProfit + itemProfit;
        }
        return totalProfit;
      }, 0);
      
      console.log(`💰 ربح الفاتورة ${saleData.id}: ${saleProfit.toFixed(2)} ج.م`);
      
    } catch (error) {
      console.error('خطأ في حفظ المبيعات:', error);
    }
  };

  // الحصول على مبيعات اليوم
  const getTodaySales = () => {
    const today = new Date().toDateString();
    return sales.filter(sale => 
      new Date(sale.date).toDateString() === today
    );
  };

  // الحصول على إجمالي مبيعات اليوم
  const getTodayTotalSales = () => {
    const todaySales = getTodaySales();
    return todaySales.reduce((total, sale) => total + sale.total, 0);
  };

  // الحصول على عدد المعاملات اليوم
  const getTodayTransactionsCount = () => {
    return getTodaySales().length;
  };

  // الحصول على المنتجات منخفضة المخزون
  const getLowStockProducts = () => {
    return products.filter(product => product.stock <= 10);
  };

  // الحصول على عدد المنتجات منخفضة المخزون
  const getLowStockCount = () => {
    return getLowStockProducts().length;
  };

  // حساب صافي الربح للمبيعات
  const calculateNetProfit = (sales) => {
    console.log('🔍 حساب صافي الربح للمبيعات:', sales.length, 'مبيعات');
    return sales.reduce((totalProfit, sale) => {
      const saleProfit = sale.items.reduce((itemProfit, item) => {
        // البحث عن المنتج باستخدام productId أو id
        const product = products.find(p => p.id === (item.productId || item.id));
        if (product) {
          const sellingPrice = parseFloat(item.price) || 0;
          const purchasePrice = parseFloat(product.purchasePrice) || 0;
          const quantity = parseInt(item.quantity) || 0;
          const itemProfit = (sellingPrice - purchasePrice) * quantity;
          console.log(`📦 ${product.name}: سعر البيع=${sellingPrice}, سعر الشراء=${purchasePrice}, الكمية=${quantity}, ربح=${itemProfit}`);
          return itemProfit;
        }
        return itemProfit;
      }, 0);
      console.log(`💰 ربح الفاتورة ${sale.id}: ${saleProfit}`);
      return totalProfit + saleProfit;
    }, 0);
  };

  // الحصول على صافي ربح اليوم
  const getTodayNetProfit = () => {
    const todaySales = getTodaySales();
    return calculateNetProfit(todaySales);
  };

  // الحصول على صافي ربح الفترة المحددة
  const getNetProfitForPeriod = (startDate, endDate) => {
    const periodSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
    return calculateNetProfit(periodSales);
  };

  // الحصول على إجمالي التكلفة للمبيعات
  const calculateTotalCost = (sales) => {
    console.log('🔍 حساب إجمالي التكلفة للمبيعات:', sales.length, 'مبيعات');
    return sales.reduce((totalCost, sale) => {
      const saleCost = sale.items.reduce((itemCost, item) => {
        // البحث عن المنتج باستخدام productId أو id
        const product = products.find(p => p.id === (item.productId || item.id));
        if (product) {
          const purchasePrice = parseFloat(product.purchasePrice) || 0;
          const quantity = parseInt(item.quantity) || 0;
          const itemCost = purchasePrice * quantity;
          console.log(`📦 ${product.name}: سعر الشراء=${purchasePrice}, الكمية=${quantity}, تكلفة=${itemCost}`);
          return itemCost;
        }
        return itemCost;
      }, 0);
      console.log(`💸 تكلفة الفاتورة ${sale.id}: ${saleCost}`);
      return totalCost + saleCost;
    }, 0);
  };

  // الحصول على إجمالي تكلفة اليوم
  const getTodayTotalCost = () => {
    const todaySales = getTodaySales();
    return calculateTotalCost(todaySales);
  };

  // دالة اختبار لإنشاء مبيعات تجريبية
  const createTestSale = () => {
    if (products.length === 0) {
      console.log('❌ لا توجد منتجات لإنشاء مبيعات تجريبية');
      return;
    }

    const testSale = {
      id: Date.now(),
      date: new Date().toISOString(),
      customerType: 'retail',
      items: [
        {
          productId: products[0].id,
          name: products[0].name,
          price: products[0].retailPrice,
          quantity: 2
        }
      ],
      subtotal: products[0].retailPrice * 2,
      tax: (products[0].retailPrice * 2) * 0.14,
      total: (products[0].retailPrice * 2) * 1.14
    };

    addSale(testSale);
    console.log('✅ تم إنشاء مبيعات تجريبية:', testSale);
    
    // إشعار نجاح
    alert('✅ تم إنشاء مبيعات تجريبية بنجاح!\nيمكنك الآن رؤية الربح في التقارير.');
  };

  return {
    products,
    sales,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    addSale,
    getTodaySales,
    getTodayTotalSales,
    getTodayTransactionsCount,
    getLowStockProducts,
    getLowStockCount,
    nextProductId,
    // دوال حساب الربح
    calculateNetProfit,
    getTodayNetProfit,
    getNetProfitForPeriod,
    calculateTotalCost,
    getTodayTotalCost,
    // دوال النسخ الاحتياطي
    lastBackup,
    backupStatus,
    backupHistory,
    createBackup: () => createBackup({ products, sales }),
    createManualBackup: (description) => createManualBackup({ products, sales }, description),
    restoreBackup,
    deleteBackup,
    getAllBackups,
    // دالة اختبار
    createTestSale
  };
};

