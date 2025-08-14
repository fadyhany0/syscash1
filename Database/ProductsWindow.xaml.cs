using System;
using System.Data;
using System.Windows;
using System.Data.SQLite;
using System.Text.RegularExpressions;

namespace MarknCodePOS
{
    public partial class ProductsWindow : Window
    {
        public ProductsWindow()
        {
            InitializeComponent();
            LoadProducts();
        }

        private void LoadProducts()
        {
            try
            {
                using (var conn = DatabaseHelper.GetConnection())
                {
                    conn.Open();
                    using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = "SELECT * FROM Products ORDER BY Name";
                        var da = new SQLiteDataAdapter(cmd);
                        var dt = new DataTable();
                        da.Fill(dt);
                        dgProducts.ItemsSource = dt.DefaultView;
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"خطأ في تحميل المنتجات: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void btnAdd_Click(object sender, RoutedEventArgs e)
        {
            // التحقق من صحة البيانات
            if (string.IsNullOrWhiteSpace(txtName.Text))
            {
                MessageBox.Show("أدخل اسم المنتج!", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
                txtName.Focus();
                return;
            }

            if (!IsValidPrice(txtBuyPrice.Text))
            {
                MessageBox.Show("أدخل سعر شراء صحيح!", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
                txtBuyPrice.Focus();
                return;
            }

            if (!IsValidPrice(txtSellPrice.Text))
            {
                MessageBox.Show("أدخل سعر بيع صحيح!", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
                txtSellPrice.Focus();
                return;
            }

            if (!IsValidQuantity(txtQuantity.Text))
            {
                MessageBox.Show("أدخل كمية صحيحة!", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
                txtQuantity.Focus();
                return;
            }

            double buyPrice = double.Parse(txtBuyPrice.Text);
            double sellPrice = double.Parse(txtSellPrice.Text);
            int quantity = int.Parse(txtQuantity.Text);

            if (sellPrice <= buyPrice)
            {
                MessageBox.Show("سعر البيع يجب أن يكون أكبر من سعر الشراء!", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            try
            {
                using (var conn = DatabaseHelper.GetConnection())
                {
                    conn.Open();
                    using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = @"INSERT INTO Products (Name, CostPrice, PriceRetail, PriceWholesale, Stock, Barcode) 
                                          VALUES (@name, @cost, @retail, @wholesale, @stock, @barcode)";
                        cmd.Parameters.AddWithValue("@name", txtName.Text.Trim());
                        cmd.Parameters.AddWithValue("@cost", buyPrice);
                        cmd.Parameters.AddWithValue("@retail", sellPrice);
                        cmd.Parameters.AddWithValue("@wholesale", sellPrice * 0.9); // سعر الجملة 90% من سعر البيع
                        cmd.Parameters.AddWithValue("@stock", quantity);
                        cmd.Parameters.AddWithValue("@barcode", GenerateBarcode());
                        cmd.ExecuteNonQuery();
                    }
                }

                LoadProducts();
                ClearFields();
                MessageBox.Show("✅ تم إضافة المنتج بنجاح", "نجاح", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"خطأ في إضافة المنتج: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private bool IsValidPrice(string price)
        {
            return double.TryParse(price, out double result) && result > 0;
        }

        private bool IsValidQuantity(string quantity)
        {
            return int.TryParse(quantity, out int result) && result >= 0;
        }

        private string GenerateBarcode()
        {
            // توليد باركود عشوائي بسيط
            Random random = new Random();
            return random.Next(100000000, 999999999).ToString();
        }

        private void ClearFields()
        {
            txtName.Text = "";
            txtBuyPrice.Text = "";
            txtSellPrice.Text = "";
            txtQuantity.Text = "";
            txtName.Focus();
        }
    }
}
