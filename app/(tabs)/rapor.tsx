import { StyleSheet, Text, View } from 'react-native';

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Raporlar ve Grafikler Yakında Buraya Gelecek</Text>
      <Text style={styles.subText}>Veritabanı bağlantısı henüz kurulmadı</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, fontWeight: 'bold' },
  subText: { marginTop: 10, color: 'gray' }
});