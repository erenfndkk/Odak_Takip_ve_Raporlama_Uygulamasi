import { useFocusEffect } from 'expo-router'; // Tab değişimini algılamak için
import React, { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { getCategoryStats, getRecentSessions } from '../../database/db';

const screenWidth = Dimensions.get('window').width;

// Grafik için renk paleti
const chartColors: { [key: string]: string } = {
  "Ders": "#FF6384",
  "Kodlama": "#36A2EB",
  "Kitap": "#FFCE56",
  "Proje": "#4BC0C0",
  "Meditasyon": "#9966FF",
  "Varsayilan": "#C9CBCF"
};

export default function ReportScreen() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  // Sayfa her odaklandığında (Tab'a tıklandığında) çalışır
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = () => {
    // 1. Grafik Verilerini Çek
    const stats: any[] = getCategoryStats();
    let totalSec = 0;

    // Chart Kit'in istediği formata çevir
    const formattedData = stats.map((item) => {
      totalSec += item.totalDuration;
      return {
        name: item.category,
        population: Math.floor(item.totalDuration / 60), // Dakikaya çevir
        color: chartColors[item.category] || chartColors["Varsayilan"],
        legendFontColor: "#7F7F7F",
        legendFontSize: 12
      };
    });

    setChartData(formattedData);
    setTotalFocusTime(totalSec);

    // 2. Geçmiş Listesini Çek
    const recentHistory = getRecentSessions();
    setHistory(recentHistory);
  };

  const formatTotalTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}sa ${mins}dk`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Haftalık Rapor</Text>

      {/* ÖZET KARTLARI */}
      <View style={styles.summaryContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Toplam Odak</Text>
          <Text style={styles.cardValue}>{formatTotalTime(totalFocusTime)}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Toplam Seans</Text>
          <Text style={styles.cardValue}>{history.length}</Text>
        </View>
      </View>

      {/* PASTA GRAFİK */}
      <Text style={styles.sectionTitle}>Kategori Dağılımı (Dakika)</Text>
      {chartData.length > 0 ? (
        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute // Değerleri grafik üzerinde gösterir
        />
      ) : (
        <Text style={styles.noDataText}>Henüz veri yok. Biraz odaklanın!</Text>
      )}

      {/* SON SEANSLAR LİSTESİ */}
      <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
      {history.map((item, index) => (
        <View key={index} style={styles.historyItem}>
          <View style={styles.historyLeft}>
            <Text style={styles.historyCategory}>{item.category}</Text>
            <Text style={styles.historyDate}>{item.date}</Text>
          </View>
          <Text style={styles.historyDuration}>{Math.floor(item.duration / 60)} dk</Text>
        </View>
      ))}
      
      <View style={{ height: 50 }} /> 
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  card: { backgroundColor: '#fff', width: '48%', padding: 20, borderRadius: 15, elevation: 3, alignItems: 'center' },
  cardTitle: { fontSize: 14, color: '#888', marginBottom: 5 },
  cardValue: { fontSize: 22, fontWeight: 'bold', color: '#333' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15, color: '#444' },
  noDataText: { textAlign: 'center', color: '#999', marginVertical: 20, fontStyle: 'italic' },

  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
  historyLeft: { flexDirection: 'column' },
  historyCategory: { fontSize: 16, fontWeight: '600', color: '#333' },
  historyDate: { fontSize: 12, color: '#999' },
  historyDuration: { fontSize: 16, fontWeight: 'bold', color: '#27ae60' }
});