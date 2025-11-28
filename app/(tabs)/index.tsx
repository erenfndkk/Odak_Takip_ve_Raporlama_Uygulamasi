import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  // State (Durum) Tanımları
  const [seconds, setSeconds] = useState(25 * 60); // 25 dakika (saniye cinsinden)
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState("Ders");
  const [distractionCount, setDistractionCount] = useState(0);
  
  // AppState için referans (Uygulamanın o anki durumu)
  const appState = useRef(AppState.currentState);

  // SAYAÇ MANTIĞI
  useEffect(() => {
    let interval: any = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      // Süre Bitti
      setIsActive(false);
      clearInterval(interval);
      Alert.alert("Tebrikler!", `Seans bitti. \nKategori: ${category}\nDikkat Dağılması: ${distractionCount}`);
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // DİKKAT DAĞINIKLIĞI TAKİBİ (APPSTATE)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      
      // Eğer uygulama aktifken arka plana (background) atılırsa:
      if (appState.current.match(/active/) && nextAppState === 'background') {
        if (isActive) {
          // Sayacı durdur
          setIsActive(false);
          // Dikkat dağınıklığı sayısını artır
          setDistractionCount((prev) => prev + 1);
          console.log("Dikkat dağıldı! Uygulama arka plana atıldı.");
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]);

  // Yardımcı Fonksiyon: Saniyeyi DK:SN formatına çevirir
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const second = time % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${second < 10 ? '0' : ''}${second}`;
  };

  // Buton Fonksiyonları
  const handleReset = () => {
    setIsActive(false);
    setSeconds(25 * 60);
    setDistractionCount(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Odaklanma Modu</Text>
      
      {/* Kategori Seçimi */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Kategori:</Text>
        <Picker
          selectedValue={category}
          style={styles.picker}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="Ders Çalışma" value="Ders" />
          <Picker.Item label="Kodlama" value="Kodlama" />
          <Picker.Item label="Kitap Okuma" value="Kitap" />
          <Picker.Item label="Proje" value="Proje" />
        </Picker>
      </View>

      {/* Sayaç Göstergesi */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        <Text style={styles.distractionText}>Dikkat Dağılması: {distractionCount}</Text>
      </View>

      {/* Kontrol Butonları */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isActive ? styles.stopButton : styles.startButton]} 
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={styles.buttonText}>{isActive ? "Duraklat" : "Başlat"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
          <Text style={styles.buttonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

      {/* Hızlı Süre Ayarı (Opsiyonel) */}
      <View style={styles.quickAddContainer}>
        <TouchableOpacity onPress={() => setSeconds(seconds + 60)} style={styles.smallButton}><Text>+1 Dk</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setSeconds(seconds > 60 ? seconds - 60 : 0)} style={styles.smallButton}><Text>-1 Dk</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#333' },
  pickerContainer: { width: '100%', marginBottom: 20, backgroundColor: '#fff', borderRadius: 10, elevation: 2 },
  label: { marginLeft: 10, marginTop: 10, color: '#666' },
  picker: { height: 50, width: '100%' },
  timerContainer: { alignItems: 'center', marginBottom: 40 },
  timerText: { fontSize: 80, fontWeight: 'bold', color: '#2c3e50' },
  distractionText: { fontSize: 16, color: '#e74c3c', marginTop: 10, fontWeight: '600' },
  buttonContainer: { flexDirection: 'row', gap: 20 },
  button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30, elevation: 3 },
  startButton: { backgroundColor: '#27ae60' },
  stopButton: { backgroundColor: '#f39c12' },
  resetButton: { backgroundColor: '#e74c3c' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  quickAddContainer: { flexDirection: 'row', marginTop: 20, gap: 10 },
  smallButton: { padding: 10, backgroundColor: '#ddd', borderRadius: 5 }
});