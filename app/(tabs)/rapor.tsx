import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getCategoryStats, getLast7DaysStats, getSummaryStats } from '../../database/db';

const screenWidth = Dimensions.get('window').width;

const chartColors: { [key: string]: string } = {
  "Ders": "#FF6384", "Kodlama": "#36A2EB", "Kitap": "#FFCE56", 
  "Proje": "#4BC0C0", "Meditasyon": "#9966FF", "Varsayilan": "#C9CBCF"
};

export default function ReportScreen() {
  // Özet Veriler
  const [summary, setSummary] = useState({ totalToday: 0, totalAllTime: 0, totalDistractions: 0 });
  
  // Grafik Verileri
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any>({ labels: [], datasets: [{ data: [] }] });

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  const loadAllData = () => {
    // 1. ÖZET KARTLAR VERİSİ
    const stats: any = getSummaryStats();
    setSummary(stats);

    // 2. pasta grafik için
    const catStats: any[] = getCategoryStats();
    const grandTotal = catStats.reduce((sum, item) => sum + item.totalDuration, 0);
    
    const formattedPieData = catStats.map((item) => {
      const percentage = grandTotal > 0 ? Math.round((item.totalDuration / grandTotal) * 100) : 0;
      return {
        name: `${item.category} (%${percentage})`,
        population: Math.floor(item.totalDuration / 60), // Dakika
        color: chartColors[item.category] || chartColors["Varsayilan"],
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
      };
    });
    setPieData(formattedPieData);

    // 3. çubuk grafik için
    const rawHistory: any[] = getLast7DaysStats();
    prepareBarChartData(rawHistory);
  };

  // Bar Chart için veriyi hazırlama 
  const prepareBarChartData = (rawHistory: any[]) => {
    const labels = [];
    const data = [];
    
    // Bugünden geriye 7 gün sayma
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; // "2023-12-10"
      
      // Grafik altında görünecek tarih formatı (Örn: 10/12)
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      labels.push(label);

      // Bu tarihte veri var mı veritabanında?
      const found = rawHistory.find((item: any) => item.date === dateStr);
      // Varsa dakikaya çevir, yoksa 0 yaz
      data.push(found ? Math.floor(found.totalDuration / 60) : 0);
    }

    setBarData({
      labels: labels,
      datasets: [{ data: data }]
    });
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return "0dk";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}sa ${mins}dk` : `${mins}dk`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>İstatistikler</Text>

      {/* --- BÖLÜM 1: ÖZET KARTLAR --- */}
      <View style={styles.cardsRow}>
        <View style={[styles.card, { backgroundColor: '#e3f2fd' }]}>
          <Text style={styles.cardLabel}>Bugün Toplam Odaklanma Süresi:</Text>
          <Text style={styles.cardValue}>{formatTime(summary.totalToday)}</Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: '#e8f5e9' }]}>
          <Text style={styles.cardLabel}>Tüm Zam. Toplam Odak Süresi:</Text>
          <Text style={styles.cardValue}>{formatTime(summary.totalAllTime)}</Text>
        </View>
        
        <View style={[styles.card, { backgroundColor: '#ffebee' }]}>
          <Text style={styles.cardLabel}>Dikkat Dağınıklığı Sayısı:</Text>
          <Text style={[styles.cardValue, { color: '#c62828' }]}>{summary.totalDistractions || 0}</Text>
        </View>
      </View>

      {/* --- BÖLÜM 2: BAR CHART (SON 7 GÜN) --- */}
      <Text style={styles.sectionTitle}>Son 7 Günlük Performans</Text>
      <View style={styles.chartContainer}>
        <BarChart
          data={barData}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=" dk"
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={{ borderRadius: 16 }}
        />
      </View>

      {/* --- BÖLÜM 3: PIE CHART (KATEGORİLER) --- */}
      <Text style={styles.sectionTitle}>Kategori Dağılımı</Text>
      {pieData.length > 0 ? (
        <View style={styles.chartContainer}>
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </View>
      ) : (
        <Text style={styles.noDataText}>Henüz veri yok.</Text>
      )}

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
  
  // Kart Stilleri
  cardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  card: { 
    width: '31%', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center', 
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardLabel: { fontSize: 12, color: '#555', marginBottom: 5, fontWeight: '600' },
  cardValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  // Başlıklar
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15, color: '#34495e' },
  
  // Grafik Kutuları
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: 'center'
  },
  
  noDataText: { textAlign: 'center', color: '#999', marginVertical: 20, fontStyle: 'italic' }
});