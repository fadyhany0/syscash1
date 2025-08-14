import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import './Inventory.css';

const Inventory = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: 'bags',
    unit: 'kg',
    purchasePrice: '',
    wholesalePrice: '',
    retailPrice: '',
    stock: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingProduct) {
      // تحديث منتج موجود
      updateProduct(editingProduct.id, {
        name: formData.name,
        barcode: formData.barcode,
        category: formData.category,
        unit: formData.unit,
        purchasePrice: parseFloat(formData.purchasePrice),
        wholesalePrice: parseFloat(formData.wholesalePrice),
        retailPrice: parseFloat(formData.retailPrice),
        stock: parseInt(formData.stock)
      });
      setEditingProduct(null);
    } else {
      // إضافة منتج جديد
      addProduct({
        name: formData.name,
        barcode: formData.barcode,
        category: formData.category,
        unit: formData.unit,
        purchasePrice: parseFloat(formData.purchasePrice),
        wholesalePrice: parseFloat(formData.wholesalePrice),
        retailPrice: parseFloat(formData.retailPrice),
        stock: parseInt(formData.stock)
      });
    }

    // مسح النموذج
    setFormData({
      name: '',
      barcode: '',
      category: 'bags',
      unit: 'kg',
      purchasePrice: '',
      wholesalePrice: '',
      retailPrice: '',
      stock: ''
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      unit: product.unit,
      purchasePrice: (product.purchasePrice || 0).toString(),
      wholesalePrice: product.wholesalePrice.toString(),
      retailPrice: product.retailPrice.toString(),
      stock: product.stock.toString()
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      deleteProduct(id);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      barcode: '',
      category: 'bags',
      unit: 'kg',
      purchasePrice: '',
      wholesalePrice: '',
      retailPrice: '',
      stock: ''
    });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { class: 'stock-empty', text: 'نفذ المخزون' };
    if (stock <= 10) return { class: 'stock-low', text: 'منخفض' };
    if (stock <= 30) return { class: 'stock-medium', text: 'متوسط' };
    return { class: 'stock-high', text: 'جيد' };
  };

  return (
    <div className="inventory-container">
      <h2 className="section-title">📦 إدارة المخزون</h2>
      
      <div className="add-product-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="productName">اسم المنتج:</label>
            <input
              type="text"
              id="productName"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="مثال: أكياس شفافة"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="productBarcode">الباركود:</label>
            <input
              type="text"
              id="productBarcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleInputChange}
              placeholder="مثال: 123456789"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="productCategory">الفئة:</label>
            <select
              id="productCategory"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="bags">أكياس</option>
              <option value="cups">كوبيات</option>
              <option value="plates">صحون</option>
              <option value="containers">علب طعام</option>
              <option value="other">أخرى</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="productUnit">الوحدة:</label>
            <select
              id="productUnit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
            >
              <option value="kg">كيلو</option>
              <option value="dozen">دستة</option>
              <option value="piece">قطعة</option>
              <option value="pack">عبوة</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="purchasePrice">سعر الشراء (الجملة):</label>
            <input
              type="number"
              id="purchasePrice"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleInputChange}
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="wholesalePrice">سعر البيع بالجملة:</label>
            <input
              type="number"
              id="wholesalePrice"
              name="wholesalePrice"
              value={formData.wholesalePrice}
              onChange={handleInputChange}
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="retailPrice">سعر البيع بالتجزئة:</label>
            <input
              type="number"
              id="retailPrice"
              name="retailPrice"
              value={formData.retailPrice}
              onChange={handleInputChange}
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="productStock">الكمية:</label>
            <input
              type="number"
              id="productStock"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label>&nbsp;</label>
            <div className="form-buttons">
              <button type="submit" className="btn btn-primary">
                {editingProduct ? 'تحديث المنتج' : 'إضافة منتج'}
              </button>
              {editingProduct && (
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  إلغاء
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الباركود</th>
              <th>الفئة</th>
              <th>الوحدة</th>
              <th>سعر الشراء</th>
              <th>سعر البيع بالجملة</th>
              <th>سعر البيع بالتجزئة</th>
              <th>الكمية</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td className="barcode-cell">{product.barcode}</td>
                  <td>{product.category}</td>
                  <td>{product.unit}</td>
                  <td>{(product.purchasePrice || 0).toFixed(2)} ج.م</td>
                  <td>{product.wholesalePrice} ج.م</td>
                  <td>{product.retailPrice} ج.م</td>
                  <td>
                    <span className={`stock-cell ${stockStatus.class}`}>
                      {product.stock} ({stockStatus.text})
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-btn btn-edit"
                      onClick={() => handleEdit(product)}
                    >
                      تعديل
                    </button>
                    <button
                      className="action-btn btn-delete"
                      onClick={() => handleDelete(product.id)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;

