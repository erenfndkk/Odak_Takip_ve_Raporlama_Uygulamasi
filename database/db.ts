import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('odakTakip.db');

export const initDatabase = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        duration INTEGER NOT NULL,
        date TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
    `);
  } catch (error) {
    console.error("DB Başlatma hatası:", error);
  }
};

export const addSession = (category: string, duration: number) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    db.runSync(
      'INSERT INTO sessions (category, duration, date, timestamp) VALUES (?, ?, ?, ?)',
      [category, duration, date, timestamp]
    );
  } catch (error) {
    console.error("Ekleme hatası:", error);
  }
};

// --- YENİ EKLENEN FONKSİYONLAR ---

// 1. Son seansları listelemek için (Geçmiş)
export const getRecentSessions = () => {
  try {
    return db.getAllSync('SELECT * FROM sessions ORDER BY timestamp DESC LIMIT 20');
  } catch (error) {
    console.error("Liste çekme hatası:", error);
    return [];
  }
};

// 2. Grafikler için kategorilere göre toplam süreleri getirir
// SQL'in "GROUP BY" gücünü kullanıyoruz.
export const getCategoryStats = () => {
  try {
    return db.getAllSync(`
      SELECT category, SUM(duration) as totalDuration 
      FROM sessions 
      GROUP BY category
    `);
  } catch (error) {
    console.error("İstatistik hatası:", error);
    return [];
  }
};