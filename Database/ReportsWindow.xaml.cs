using System;
using System.Data;
using System.Data.SQLite;
using System.Windows;
using System.Windows.Controls;
using MarknCodePOS.Database;

namespace MarknCodePOS
{
    public partial class ReportsWindow : Window
    {
        public ReportsWindow()
        {
            InitializeComponent();
            LoadReports();
        }

        private void LoadReports()
        {
            try
            {
                LoadSalesReport();
                LoadProductsReport();
                LoadProfitReport();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"خطأ في تحميل التقارير: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void LoadSalesReport()
        {
            using (var conn = DatabaseHelper.GetConnection())
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                        SELECT 
                            Date,
                            Total,
                            Profit
                        FROM Invoices 
                        ORDER BY Date DESC 
                        LIMIT 50";
                    
                    var da = new SQLiteDataAdapter(cmd);
                    var dt = new DataTable();
                    da.Fill(dt);
                    dgSales.ItemsSource = dt.DefaultView;
                }
            }
        }

        private void LoadProductsReport()
        {
            using (var conn = DatabaseHelper.GetConnection())
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                        SELECT 
                            Name,
                            Stock,
                            CostPrice,
                            PriceRetail,
                            PriceWholesale
                        FROM Products 
                        ORDER BY Stock ASC";
                    
                    var da = new SQLiteDataAdapter(cmd);
                    var dt = new DataTable();
                    da.Fill(dt);
                    dgProducts.ItemsSource = dt.DefaultView;
                }
            }
        }

        private void LoadProfitReport()
        {
            using (var conn = DatabaseHelper.GetConnection())
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                        SELECT 
                            SUM(Total) as TotalSales,
                            SUM(Profit) as TotalProfit,
                            COUNT(*) as InvoiceCount
                        FROM Invoices";
                    
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            double totalSales = Convert.ToDouble(reader["TotalSales"]);
                            double totalProfit = Convert.ToDouble(reader["TotalProfit"]);
                            int invoiceCount = Convert.ToInt32(reader["InvoiceCount"]);
                            
                            txtTotalSales.Text = totalSales.ToString("0.00");
                            txtTotalProfit.Text = totalProfit.ToString("0.00");
                            txtInvoiceCount.Text = invoiceCount.ToString();
                            
                            if (totalSales > 0)
                            {
                                double profitMargin = (totalProfit / totalSales) * 100;
                                txtProfitMargin.Text = profitMargin.ToString("0.00") + "%";
                            }
                        }
                    }
                }
            }
        }

        private void btnRefresh_Click(object sender, RoutedEventArgs e)
        {
            LoadReports();
        }

        private void btnExport_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var saveFileDialog = new Microsoft.Win32.SaveFileDialog
                {
                    Filter = "CSV files (*.csv)|*.csv",
                    FileName = $"SalesReport_{DateTime.Now:yyyyMMdd}.csv"
                };

                if (saveFileDialog.ShowDialog() == true)
                {
                    ExportToCSV(saveFileDialog.FileName);
                    MessageBox.Show("تم تصدير التقرير بنجاح!", "نجاح", MessageBoxButton.OK, MessageBoxImage.Information);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"خطأ في تصدير التقرير: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ExportToCSV(string fileName)
        {
            using (var conn = DatabaseHelper.GetConnection())
            {
                conn.Open();
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                        SELECT 
                            Date,
                            Total,
                            Profit
                        FROM Invoices 
                        ORDER BY Date DESC";
                    
                    using (var reader = cmd.ExecuteReader())
                    {
                        var csv = new System.Text.StringBuilder();
                        csv.AppendLine("التاريخ,الإجمالي,الربح");
                        
                        while (reader.Read())
                        {
                            csv.AppendLine($"{reader["Date"]},{reader["Total"]},{reader["Profit"]}");
                        }
                        
                        System.IO.File.WriteAllText(fileName, csv.ToString());
                    }
                }
            }
        }
    }
}
