using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Printing;
using System.Windows;

namespace MarknCodePOS.Helpers
{
    public static class PrintHelper
    {
        public static void PrintInvoice(string invoiceNumber, string customerName, DateTime invoiceDate, CartItem[] items, double total, double profit)
        {
            try
            {
                var printDocument = new PrintDocument();
                printDocument.PrintPage += (sender, e) => PrintInvoicePage(sender, e, invoiceNumber, customerName, invoiceDate, items, total, profit);
                
                var printDialog = new PrintDialog
                {
                    Document = printDocument
                };

                if (printDialog.ShowDialog() == true)
                {
                    printDocument.Print();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"خطأ في الطباعة: {ex.Message}", "خطأ", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private static void PrintInvoicePage(object sender, PrintPageEventArgs e, string invoiceNumber, string customerName, DateTime invoiceDate, CartItem[] items, double total, double profit)
        {
            var graphics = e.Graphics;
            var font = new Font("Arial", 10);
            var boldFont = new Font("Arial", 12, FontStyle.Bold);
            var titleFont = new Font("Arial", 16, FontStyle.Bold);
            
            int y = 50;
            int leftMargin = 50;

            // عنوان الفاتورة
            graphics.DrawString("فاتورة مبيعات", titleFont, Brushes.Black, leftMargin, y);
            y += 30;

            // معلومات الفاتورة
            graphics.DrawString($"رقم الفاتورة: {invoiceNumber}", font, Brushes.Black, leftMargin, y);
            y += 20;
            graphics.DrawString($"التاريخ: {invoiceDate:dd/MM/yyyy HH:mm}", font, Brushes.Black, leftMargin, y);
            y += 20;
            graphics.DrawString($"العميل: {customerName}", font, Brushes.Black, leftMargin, y);
            y += 30;

            // رأس الجدول
            graphics.DrawString("المنتج", boldFont, Brushes.Black, leftMargin, y);
            graphics.DrawString("الكمية", boldFont, Brushes.Black, leftMargin + 200, y);
            graphics.DrawString("السعر", boldFont, Brushes.Black, leftMargin + 300, y);
            graphics.DrawString("الإجمالي", boldFont, Brushes.Black, leftMargin + 400, y);
            y += 25;

            // رسم خط تحت العنوان
            graphics.DrawLine(Pens.Black, leftMargin, y, leftMargin + 500, y);
            y += 10;

            // تفاصيل المنتجات
            foreach (var item in items)
            {
                graphics.DrawString(item.ProductName, font, Brushes.Black, leftMargin, y);
                graphics.DrawString(item.Qty.ToString(), font, Brushes.Black, leftMargin + 200, y);
                graphics.DrawString(item.SellPrice.ToString("0.00"), font, Brushes.Black, leftMargin + 300, y);
                graphics.DrawString(item.Total.ToString("0.00"), font, Brushes.Black, leftMargin + 400, y);
                y += 20;
            }

            // رسم خط فوق الإجمالي
            y += 5;
            graphics.DrawLine(Pens.Black, leftMargin, y, leftMargin + 500, y);
            y += 10;

            // الإجمالي والأرباح
            graphics.DrawString($"الإجمالي: {total:0.00} ريال", boldFont, Brushes.Black, leftMargin + 300, y);
            y += 20;
            graphics.DrawString($"الربح: {profit:0.00} ريال", font, Brushes.Green, leftMargin + 300, y);
            y += 30;

            // رسالة شكر
            graphics.DrawString("شكراً لكم على الشراء", titleFont, Brushes.Blue, leftMargin + 150, y);
            y += 30;
            graphics.DrawString("نتمنى لكم يوماً سعيداً", font, Brushes.Black, leftMargin + 150, y);

            // معلومات الشركة
            y += 40;
            graphics.DrawString("MarknCode POS System", font, Brushes.Gray, leftMargin, y);
            graphics.DrawString("www.markncode.com", font, Brushes.Gray, leftMargin, y + 20);
        }
    }
}
