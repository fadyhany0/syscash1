using MarknCodePOS.Database;
using MarknCodePOS.Helpers;
using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.Linq;
using System.Windows;
using System.Windows.Controls;

namespace MarknCodePOS
{
    public partial class MainWindow : Window
    {
        private List<Product> products = new List<Product>();
        private List<CartItem> cartItems = new List<CartItem>();

        public MainWindow()
        {
            InitializeComponent();
            DatabaseHelper.InitializeDatabase();
            LoadProducts();
        }

        private void LoadProducts()
        {
            products.Clear();
            using (var conn = DatabaseHelper.GetConnection())
            {
                conn.Open();
                using (var cmd = new SQLiteCommand("SELECT * FROM Products", conn))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        products.Add(new Product
                        {
                            Id = Convert.ToInt32(reader["Id"]),
                            Barcode = reader["Barcode"]?.ToString() ?? "",
                            Name = reader["Name"]?.ToString() ?? "",
                            PriceWholesale = Convert.ToDouble(reader["PriceWholesale"]),
                            PriceRetail = Convert.ToDouble(reader["PriceRetail"]),
                            CostPrice = Convert.ToDouble(reader["CostPrice"]),
                            Stock = Convert.ToInt32(reader["Stock"])
                        });
                    }
                }
            }
            lstProducts.ItemsSource = products;
        }

        private void txtSearch_TextChanged(object sender, TextChangedEventArgs e)
        {
            string search = txtSearch.Text.Trim().ToLower();
            if (string.IsNullOrEmpty(search))
            {
                lstProducts.ItemsSource = products;
            }
            else
            {
                var result = products.Where(p => 
                    p.Name.ToLower().Contains(search) || 
                    p.Barcode.ToLower().Contains(search)).ToList();
                lstProducts.ItemsSource = result;
            }
        }

        private void lstProducts_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (lstProducts.SelectedItem is Product selected)
            {
                // Check if product already exists in cart
                var existingItem = cartItems.FirstOrDefault(item => item.ProductId == selected.Id);
                
                if (existingItem != null)
                {
                    existingItem.Qty++;
                    existingItem.Total = existingItem.Qty * existingItem.SellPrice;
                }
                else
                {
                    cartItems.Add(new CartItem
                    {
                        ProductId = selected.Id,
                        ProductName = selected.Name,
                        Qty = 1,
                        BuyPrice = selected.CostPrice,
                        SellPrice = selected.PriceRetail,
                        Total = selected.PriceRetail
                    });
                }

                dgCart.ItemsSource = null;
                dgCart.ItemsSource = cartItems;
                UpdateTotal();
                
                // Clear selection
                lstProducts.SelectedItem = null;
            }
        }

        private void UpdateTotal()
        {
            double total = cartItems.Sum(item => item.Total);
            txtTotal.Text = total.ToString("0.00");
        }

        private void btnSave_Click(object sender, RoutedEventArgs e)
        {
            if (cartItems.Count == 0)
            {
                MessageBox.Show("السلة فارغة! أضف منتجات أولاً.", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (string.IsNullOrWhiteSpace(txtCustomer.Text))
            {
                MessageBox.Show("أدخل اسم العميل!", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            SaveInvoice();
        }

        private void SaveInvoice()
        {
            try
            {
                // حفظ الفاتورة في قاعدة البيانات
                string invoiceNumber = Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
                string customerName = txtCustomer.Text;
                DateTime invoiceDate = DateTime.Now;
                double total = cartItems.Sum(item => item.Total);
                double profit = cartItems.Sum(item => (item.SellPrice - item.BuyPrice) * item.Qty);

                using (var conn = DatabaseHelper.GetConnection())
                {
                    conn.Open();

                    using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = "INSERT INTO Invoices (InvoiceNumber, Date, Total, Profit) VALUES (@num, @date, @total, @profit)";
                        cmd.Parameters.AddWithValue("@num", invoiceNumber);
                        cmd.Parameters.AddWithValue("@date", invoiceDate.ToString("yyyy-MM-dd HH:mm:ss"));
                        cmd.Parameters.AddWithValue("@total", total);
                        cmd.Parameters.AddWithValue("@profit", profit);
                        cmd.ExecuteNonQuery();
                    }
                }

                // إنشاء الفاتورة PDF + الطباعة
                PrintHelper.PrintInvoice(invoiceNumber, customerName, invoiceDate, cartItems.ToArray(), total, profit);

                MessageBox.Show("تم حفظ الفاتورة وطبعها بنجاح ✅", "نجاح", MessageBoxButton.OK, MessageBoxImage.Information);

                // مسح السلة
                cartItems.Clear();
                dgCart.ItemsSource = null;
                txtCustomer.Text = "";
                UpdateTotal();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"خطأ أثناء حفظ أو طباعة الفاتورة: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void btnClear_Click(object sender, RoutedEventArgs e)
        {
            cartItems.Clear();
            dgCart.ItemsSource = null;
            txtCustomer.Text = "";
            UpdateTotal();
        }

        private void btnReports_Click(object sender, RoutedEventArgs e)
        {
            var reportsWindow = new ReportsWindow();
            reportsWindow.ShowDialog();
        }

        private void btnProducts_Click(object sender, RoutedEventArgs e)
        {
            var productsWindow = new ProductsWindow();
            productsWindow.ShowDialog();
            LoadProducts(); // إعادة تحميل المنتجات بعد التعديل
        }
    }

    public class Product
    {
        public int Id { get; set; }
        public string Barcode { get; set; }
        public string Name { get; set; }
        public double PriceWholesale { get; set; }
        public double PriceRetail { get; set; }
        public double CostPrice { get; set; }
        public int Stock { get; set; }
    }

    public class CartItem
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int Qty { get; set; }
        public double BuyPrice { get; set; }
        public double SellPrice { get; set; }
        public double Total { get; set; }
    }
}
