import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import './POS.css';

const POS = () => {
  const { products, addSale, updateProductStock } = useData();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerType, setCustomerType] = useState('retail');
  const [showInvoice, setShowInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState(null);

  // حساب المجاميع
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.15; // 15% ضريبة
  const total = subtotal + tax;

  // حساب الربح المتوقع للفاتورة الحالية
  const expectedProfit = cart.reduce((totalProfit, item) => {
    const product = products.find(p => p.id === item.id);
    if (product) {
      const sellingPrice = parseFloat(item.price) || 0;
      const purchasePrice = parseFloat(product.purchasePrice) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return totalProfit + ((sellingPrice - purchasePrice) * quantity);
    }
    return totalProfit;
  }, 0);

  // البحث في المنتجات
  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return product.name.toLowerCase().includes(searchLower) ||
           product.barcode.includes(searchTerm);
  });

  // البحث السريع بالباركود
  const quickBarcodeSearch = (barcode) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setSearchTerm('');
    }
  };

  // إضافة منتج للسلة
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // زيادة الكمية إذا كان المنتج موجود بالفعل
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
        console.log(`📦 تم زيادة كمية ${product.name} في السلة`);
      }
    } else {
      // إضافة منتج جديد للسلة
      const price = customerType === 'wholesale' ? product.wholesalePrice : product.retailPrice;
      setCart([...cart, {
        id: product.id,
        name: product.name,
        price: price,
        quantity: 1,
        unit: product.unit,
        stock: product.stock
      }]);
      console.log(`🛒 تم إضافة ${product.name} إلى السلة بسعر ${price} ج.م`);
    }
  };

  // تحديث كمية المنتج في السلة
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const cartItem = cart.find(item => item.id === productId);
    if (cartItem && newQuantity <= cartItem.stock) {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // إزالة منتج من السلة
  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // مسح السلة
  const clearCart = () => {
    setCart([]);
  };

  // إنهاء البيع
  const checkout = () => {
    if (cart.length === 0) {
      alert('السلة فارغة!');
      return;
    }

    // إنشاء الفاتورة
    const invoice = {
      id: Date.now(),
      date: new Date().toISOString(),
      customerType: customerType,
      items: cart.map(item => ({
        ...item,
        productId: item.id // إضافة productId للربط مع المنتج
      })),
      subtotal: subtotal,
      tax: tax,
      total: total
    };

    console.log('💰 إنشاء فاتورة جديدة:', {
      رقم_الفاتورة: invoice.id,
      نوع_العميل: customerType === 'retail' ? 'قطاعي' : 'جملة',
      عدد_المنتجات: cart.length,
      المجموع: subtotal,
      الضريبة: tax,
      الإجمالي: total
    });

    // إضافة المبيعات
    addSale(invoice);

    // تحديث المخزون
    cart.forEach(item => {
      updateProductStock(item.id, item.quantity);
    });

    // عرض الفاتورة
    setCurrentInvoice(invoice);
    setShowInvoice(true);

    // مسح السلة
    setCart([]);

    // إشعار نجاح العملية
    console.log('✅ تم إتمام عملية البيع بنجاح!');
  };

  // طباعة الفاتورة
  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="pos-container">
      <div className="main-content">
        <div className="left-panel">
          <h2 className="section-title">📦 اختيار المنتجات</h2>
          <div className="search-container">
            <div className="search-row">
              <input
                type="text"
                placeholder="ابحث عن منتج بالاسم أو الباركود..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    quickBarcodeSearch(searchTerm);
                  }
                }}
              />
              <button 
                onClick={() => quickBarcodeSearch(searchTerm)}
                className="btn btn-primary search-btn"
              >
                🔍 بحث سريع
              </button>
            </div>
          </div>
          
          <div className="product-grid">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => addToCart(product)}
              >
                <div className="product-name">{product.name}</div>
                <div className="product-unit">{product.unit}</div>
                <div className="product-barcode">{product.barcode}</div>
                <div className="product-prices">
                  <div className="price-wholesale">جملة: {product.wholesalePrice} ج.م</div>
                  <div className="price-retail">قطاعي: {product.retailPrice} ج.م</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-panel">
          <h2 className="section-title">🧾 الفاتورة</h2>
          
          <div className="customer-type">
            <label htmlFor="customerType">نوع العميل:</label>
            <select
              id="customerType"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
            >
              <option value="retail">قطاعي</option>
              <option value="wholesale">جملة</option>
            </select>
          </div>

          <div className="cart">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>السلة فارغة</p>
                <p>اختر منتجات لإضافتها للفاتورة</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">
                      {item.price} ج.م × {item.quantity} {item.unit}
                    </div>
                  </div>
                  <div className="item-total">
                    {(item.price * item.quantity).toFixed(2)} ج.م
                  </div>
                  <div className="item-actions">
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="cart-total">
            <div className="total-line">
              <span>المجموع:</span>
              <span>{subtotal.toFixed(2)} ج.م</span>
            </div>
            <div className="total-line">
              <span>الضريبة (15%):</span>
              <span>{tax.toFixed(2)} ج.م</span>
            </div>
            <div className="total-line total">
              <span>الإجمالي:</span>
              <span>{total.toFixed(2)} ج.م</span>
            </div>
            {expectedProfit > 0 && (
              <div className="total-line profit">
                <span>الربح المتوقع:</span>
                <span className="profit-value">+{expectedProfit.toFixed(2)} ج.م</span>
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button className="btn btn-danger" onClick={clearCart}>
              مسح السلة
            </button>
            <button className="btn btn-success" onClick={checkout}>
              إنهاء البيع
            </button>
          </div>
        </div>
      </div>

      {/* نافذة الفاتورة */}
      {showInvoice && currentInvoice && (
        <div className="modal" onClick={() => setShowInvoice(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowInvoice(false)}>&times;</span>
            <div className="invoice">
              <div className="invoice-header">
                <h2>فاتورة محل البلاستيكات</h2>
                <p>رقم الفاتورة: {currentInvoice.id}</p>
                <p>التاريخ: {new Date(currentInvoice.date).toLocaleDateString('ar-EG')}</p>
                <p>الوقت: {new Date(currentInvoice.date).toLocaleTimeString('ar-EG')}</p>
              </div>
              
              <div className="invoice-items">
                <table>
                  <thead>
                    <tr>
                      <th>المنتج</th>
                      <th>الكمية</th>
                      <th>السعر</th>
                      <th>المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoice.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity} {item.unit}</td>
                        <td>{item.price} ج.م</td>
                        <td>{(item.price * item.quantity).toFixed(2)} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="invoice-total">
                <p>المجموع: {currentInvoice.subtotal.toFixed(2)} ج.م</p>
                <p>الضريبة: {currentInvoice.tax.toFixed(2)} ج.م</p>
                <p><strong>الإجمالي: {currentInvoice.total.toFixed(2)} ج.م</strong></p>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={printInvoice}>
                طباعة الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;
