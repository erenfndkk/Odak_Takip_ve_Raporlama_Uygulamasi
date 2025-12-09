import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useRef, useState } from 'react'; // useRef eklendi
import { Alert, AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // AppState eklendi
import { addSession } from '../../database/db';

export default function HomeScreen() {
  const [seconds, setSeconds] = useState(25 * 60); 
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [category, setCategory] = useState("Ders");
  
  // YENİ: Dikkat dağınıklığı sayacı
  const [distractionCount, setDistractionCount] = useState(0);
  // YENİ: Uygulamanın durumunu takip etmek için referans
  const appState = useRef(AppState.currentState);

  // 1. DİKKAT DAĞINIKLIĞI TAKİBİ (APPSTATE)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      
      // Eğer uygulama aktifken -> arka plana (background) atılırsa:
      if (appState.current.match(/active/) && nextAppState === 'background') {
        if (isActive) {
          // Sayacı durdur
          setIsActive(false);
          // Sayacı 1 artır
          setDistractionCount((prev) => prev + 1);
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]); // isActive değiştiğinde listener güncellensin

  // 2. SAYAÇ MANTIĞI
  useEffect(() => {
    let interval: any = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      // Süre Bitti
      setIsActive(false);
      clearInterval(interval);
      
      addSession(category, totalDuration); 
      
      // Mesajda dikkat dağınıklığını da gösteriyoruz
      Alert.alert(
        "Tebrikler!", 
        `${category} seansı tamamlandı!\nToplam Odak: ${totalDuration / 60} dk\nDikkat Dağılması: ${distractionCount} kez`
      );
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const second = time % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${second < 10 ? '0' : ''}${second}`;
  };

  // SIFIRLAMA FONKSİYONU
  const handleReset = () => {
    setIsActive(false);
    setSeconds(25 * 60);     
    setTotalDuration(25 * 60);
    setDistractionCount(0); // Sayacı da sıfırla
  };

  const changeTime = (amount: number) => {
    const newTime = seconds + amount;
    if (newTime > 0) {
      setSeconds(newTime);
      setTotalDuration(newTime);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Odaklanma Modu</Text>
      
      {/* KATEGORİ SEÇİMİ */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Kategori Seçiniz:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="📚 Ders Çalışma" value="Ders" />
            <Picker.Item label="💻 Kodlama" value="Kodlama" />
            <Picker.Item label="📖 Kitap Okuma" value="Kitap" />
            <Picker.Item label="🚀 Proje" value="Proje" />
            <Picker.Item label="🧘 Meditasyon" value="Meditasyon" />
          </Picker>
        </View>
      </View>

      {/* SAYAÇ */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        {/* YENİ: Dikkat Dağınıklığı Göstergesi */}
        {distractionCount > 0 && (
            <Text style={styles.distractionText}>⚠️ {distractionCount} Kez Dikkat Dağıldı!</Text>
        )}
      </View>

      {/* BUTONLAR */}
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

      {/* HIZLI SÜRE AYARI */}
      <View style={styles.quickAddContainer}>
        <TouchableOpacity onPress={() => changeTime(60)} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>+1 Dk</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => changeTime(-60)} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>-1 Dk</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  pickerContainer: { width: '100%', alignItems: 'center', marginBottom: 30 },
  label: { fontSize: 16, color: '#666', marginBottom: 8, alignSelf: 'flex-start', marginLeft: '10%' },
  pickerWrapper: { width: '80%', backgroundColor: '#fff', borderRadius: 15, borderWidth: 1, borderColor: '#ddd', overflow: 'hidden' },
  picker: { width: '100%', height: 55 },
  timerContainer: { alignItems: 'center', marginBottom: 40 },
  timerText: { fontSize: 90, fontWeight: 'bold', color: '#2c3e50', fontVariant: ['tabular-nums'] },
  
  // YENİ STİL: Dikkat yazısı için
  distractionText: { fontSize: 16, color: '#e74c3c', marginTop: 10, fontWeight: 'bold' },

  buttonContainer: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  button: { paddingVertical: 15, paddingHorizontal: 35, borderRadius: 30, elevation: 3 },
  startButton: { backgroundColor: '#27ae60' },
  stopButton: { backgroundColor: '#f39c12' },
  resetButton: { backgroundColor: '#e74c3c' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  quickAddContainer: { flexDirection: 'row', gap: 15 },
  smallButton: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#e0e0e0', borderRadius: 10 },
  smallButtonText: { color: '#333', fontWeight: '600' }
});