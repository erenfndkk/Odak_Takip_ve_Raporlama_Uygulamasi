import * as SQLite from 'expo-sqlite';

// Veritabanı dosyasını aç (yoksa oluşturur)
const db = SQLite.openDatabaseSync('odakTakip.db');

// Tabloları Başlatma Fonksiyonu
export const initDatabase = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        duration INTEGER NOT NULL, -- Saniye cinsinden
        date TEXT NOT NULL,        -- ISO formatında tarih (YYYY-MM-DD)
        timestamp INTEGER NOT NULL -- Sıralama için epoch time
      );
    `);
    console.log("Veritabanı ve tablo hazır!");
  } catch (error) {
    console.error("Veritabanı hatası:", error);
  }
};

// Yeni Seans Ekleme Fonksiyonu
export const addSession = (category: string, duration: number) => {
  try {
    const date = new Date().toISOString().split('T')[0]; // Sadece tarihi al (2025-12-06)
    const timestamp = Date.now(); // Şimdiki zaman
    
    db.runSync(
      'INSERT INTO sessions (category, duration, date, timestamp) VALUES (?, ?, ?, ?)',
      [category, duration, date, timestamp]
    );
    console.log("Kayıt eklendi:", category, duration);
  } catch (error) {
    console.error("Kayıt ekleme hatası:", error);
  }
};

// Raporlar için veri çekme (Şimdilik tüm veriyi çekelim)
export const getSessions = () => {
  try {
    const allRows = db.getAllSync('SELECT * FROM sessions ORDER BY timestamp DESC');
    return allRows;
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    return [];
  }
};