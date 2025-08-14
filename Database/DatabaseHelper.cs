using System;
using System.Data.SQLite;
using System.IO;

namespace MarknCodePOS.Database
{
    public static class DatabaseHelper
    {
        private static string dbName = "pos.db";
        private static string dbPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, dbName);
        private static string connectionString = $"Data Source={dbPath};Version=3;";

        public static SQLiteConnection GetConnection()
        {
            return new SQLiteConnection(connectionString);
        }

        public static void InitializeDatabase()
        {
            if (!File.Exists(dbPath))
            {
                SQLiteConnection.CreateFile(dbPath);
                using (var conn = GetConnection())
                {
                    conn.Open();
                    using (var cmd = new SQLiteCommand(conn))
                    {
                        // جدول المنتجات
                        cmd.CommandText = @"CREATE TABLE Products (
                                                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                Barcode TEXT,
                                                Name TEXT,
                                                PriceWholesale REAL,
                                                PriceRetail REAL,
                                                CostPrice REAL,
                                                Stock INTEGER
                                            );";
                        cmd.ExecuteNonQuery();

                        // جدول الفواتير
                        cmd.CommandText = @"CREATE TABLE Invoices (
                                                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                Date TEXT,
                                                Total REAL,
                                                Profit REAL
                                            );";
                        cmd.ExecuteNonQuery();

                        // تفاصيل الفاتورة
                        cmd.CommandText = @"CREATE TABLE InvoiceDetails (
                                                Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                InvoiceId INTEGER,
                                                ProductId INTEGER,
                                                Quantity INTEGER,
                                                Price REAL,
                                                FOREIGN KEY (InvoiceId) REFERENCES Invoices(Id),
                                                FOREIGN KEY (ProductId) REFERENCES Products(Id)
                                            );";
                        cmd.ExecuteNonQuery();
                    }
                }
            }
        }
    }
}
