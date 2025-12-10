import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('odak_Takip.db');

export const initDatabase = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        duration INTEGER NOT NULL,
        distractionCount INTEGER DEFAULT 0,
        date TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
    `);
  } catch (error) {
    console.error("DB Başlatma hatası:", error);
  }
};

export const addSession = (category: string, duration: number, distractionCount: number) => {
  try {
    const date = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    db.runSync(
      'INSERT INTO sessions (category, duration, distractionCount, date, timestamp) VALUES (?, ?, ?, ?, ?)',
      [category, duration, distractionCount, date, timestamp]
    );
  } catch (error) {
    console.error("Ekleme hatası:", error);
  }
};

// --- YENİ RAPORLAMA FONKSİYONLARI ---

// 1. Özet Kartlar için (Bugün, Toplam, Dikkat)
export const getSummaryStats = () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Tek bir sorguda hepsini çekiyoruz
    const result = db.getAllSync(`
      SELECT 
        SUM(duration) as totalAllTime,
        SUM(distractionCount) as totalDistractions,
        SUM(CASE WHEN date = ? THEN duration ELSE 0 END) as totalToday
      FROM sessions
    `, [today]);

    return result[0] || { totalAllTime: 0, totalDistractions: 0, totalToday: 0 };
  } catch (error) {
    console.error("Özet istatistik hatası:", error);
    return { totalAllTime: 0, totalDistractions: 0, totalToday: 0 };
  }
};

// 2. Bar Chart için Son 7 Günlük Veri
export const getLast7DaysStats = () => {
  try {
    // Son 7 güne ait toplam süreleri tarihe göre grupla
    return db.getAllSync(`
      SELECT date, SUM(duration) as totalDuration
      FROM sessions
      GROUP BY date
      ORDER BY date DESC
      LIMIT 7
    `);
  } catch (error) {
    console.error("7 Günlük veri hatası:", error);
    return [];
  }
};

// 3. Pie Chart için Kategorik Dağılım
export const getCategoryStats = () => {
  try {
    return db.getAllSync(`
      SELECT category, SUM(duration) as totalDuration 
      FROM sessions 
      GROUP BY category
    `);
  } catch (error) {
    console.error("Kategori istatistik hatası:", error);
    return [];
  }
};

