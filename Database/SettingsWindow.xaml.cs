using System;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using MarknCodePOS.Database;

namespace MarknCodePOS
{
    public partial class SettingsWindow : Window
    {
        public SettingsWindow()
        {
            InitializeComponent();
            LoadSettings();
        }

        private void LoadSettings()
        {
            try
            {
                // تحميل الإعدادات من ملف التكوين
                string configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.txt");
                if (File.Exists(configPath))
                {
                    var lines = File.ReadAllLines(configPath);
                    foreach (var line in lines)
                    {
                        var parts = line.Split('=');
                        if (parts.Length == 2)
                        {
                            switch (parts[0].Trim())
                            {
                                case "CompanyName":
                                    txtCompanyName.Text = parts[1].Trim();
                                    break;
                                case "CompanyAddress":
                                    txtCompanyAddress.Text = parts[1].Trim();
                                    break;
                                case "CompanyPhone":
                                    txtCompanyPhone.Text = parts[1].Trim();
                                    break;
                                case "TaxRate":
                                    if (double.TryParse(parts[1].Trim(), out double taxRate))
                                        txtTaxRate.Text = taxRate.ToString();
                                    break;
                                case "Currency":
                                    txtCurrency.Text = parts[1].Trim();
                                    break;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"خطأ في تحميل الإعدادات: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void btnSave_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // التحقق من صحة البيانات
                if (string.IsNullOrWhiteSpace(txtCompanyName.Text))
                {
                    MessageBox.Show("أدخل اسم الشركة!", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
                    txtCompanyName.Focus();
                    return;
                }

                if (!double.TryParse(txtTaxRate.Text, out double taxRate) || taxRate < 0 || taxRate > 100)
                {
                    MessageBox.Show("أدخل نسبة ضريبة صحيحة (0-100)!", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
                    txtTaxRate.Focus();
                    return;
                }

                // حفظ الإعدادات
                string configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.txt");
                var configLines = new[]
                {
                    $"CompanyName={txtCompanyName.Text.Trim()}",
                    $"CompanyAddress={txtCompanyAddress.Text.Trim()}",
                    $"CompanyPhone={txtCompanyPhone.Text.Trim()}",
                    $"TaxRate={taxRate}",
                    $"Currency={txtCurrency.Text.Trim()}"
                };

                File.WriteAllLines(configPath, configLines);

                MessageBox.Show("✅ تم حفظ الإعدادات بنجاح", "نجاح", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"خطأ في حفظ الإعدادات: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void btnReset_Click(object sender, RoutedEventArgs e)
        {
            if (MessageBox.Show("هل تريد إعادة تعيين جميع الإعدادات؟", "تأكيد", MessageBoxButton.YesNo, MessageBoxImage.Question) == MessageBoxResult.Yes)
            {
                txtCompanyName.Text = "MarknCode POS";
                txtCompanyAddress.Text = "العنوان هنا";
                txtCompanyPhone.Text = "+966-XX-XXX-XXXX";
                txtTaxRate.Text = "15";
                txtCurrency.Text = "ريال";
            }
        }

        private void btnBackup_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                var saveFileDialog = new Microsoft.Win32.SaveFileDialog
                {
                    Filter = "Database files (*.db)|*.db",
                    FileName = $"POS_Backup_{DateTime.Now:yyyyMMdd_HHmmss}.db"
                };

                if (saveFileDialog.ShowDialog() == true)
                {
                    string sourcePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "pos.db");
                    if (File.Exists(sourcePath))
                    {
                        File.Copy(sourcePath, saveFileDialog.FileName, true);
                        MessageBox.Show("✅ تم إنشاء نسخة احتياطية بنجاح", "نجاح", MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                    else
                    {
                        MessageBox.Show("لا يوجد قاعدة بيانات للنسخ الاحتياطي!", "تنبيه", MessageBoxButton.OK, MessageBoxImage.Warning);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"خطأ في إنشاء النسخة الاحتياطية: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
    }
}
