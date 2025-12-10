import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, AppState, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addSession } from '../../database/db';

export default function HomeScreen() {
  const DEFAULT_TIME = 25 * 60; // Varsayılan süre (25 dk)

  const [seconds, setSeconds] = useState(DEFAULT_TIME); 
  const [totalDuration, setTotalDuration] = useState(DEFAULT_TIME);
  
  const [isActive, setIsActive] = useState(false);
  const [isSessionStarted, setIsSessionStarted] = useState(false);

  const [category, setCategory] = useState("Ders");
  const [distractionCount, setDistractionCount] = useState(0);
  
  const appState = useRef(AppState.currentState);

  // 1. DİKKAT DAĞINIKLIĞI TAKİBİ
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/active/) && nextAppState === 'background') {
        if (isActive) {
          setIsActive(false); 
          setDistractionCount((prev) => prev + 1);
        }
      }
      appState.current = nextAppState;
    });
    return () => { subscription.remove(); };
  }, [isActive]);

  // 2. SAYAÇ MANTIĞI
  useEffect(() => {
    let interval: any = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isSessionStarted) { 
      // Süre Bittiğinde
      setIsActive(false);
      setIsSessionStarted(false); 
      clearInterval(interval);
      
      // Kayıt
      addSession(category, totalDuration, distractionCount); 
      
      Alert.alert(
        "Tebrikler!", 
        `${category} seansı tamamlandı!\nToplam Odak: ${totalDuration / 60} dk\nDikkat Dağılması: ${distractionCount} kez`,
        [
            { 
                text: "Tamam", 
                onPress: () => {
                    // SEANS BİTİNCE YAPILACAKLAR:
                    setDistractionCount(0);       // 1. Dikkat sayacını sıfırla
                    setSeconds(DEFAULT_TIME);     // 2. Sayacı tekrar 25 dk yap
                    setTotalDuration(DEFAULT_TIME); // 3. Hafızayı 25 dk yap 
                } 
            }
        ]
      );
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, isSessionStarted]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const second = time % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${second < 10 ? '0' : ''}${second}`;
  };

  const handleStartStop = () => {
    if (isActive) {
        setIsActive(false);
    } else {
        setIsActive(true);
        setIsSessionStarted(true); 
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setIsSessionStarted(false); 
    setSeconds(DEFAULT_TIME);     
    setTotalDuration(DEFAULT_TIME);
    setDistractionCount(0);
  };

  const changeTime = (amount: number) => {
    if (isSessionStarted) return; 

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
        
        <View style={[styles.pickerWrapper, isSessionStarted && styles.disabledPicker]}>
          <Picker
            selectedValue={category}
            enabled={!isSessionStarted} 
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.picker}
            dropdownIconColor={isSessionStarted ? "#999" : "#000"}
          >
            <Picker.Item label="📚 Ders Çalışma" value="Ders" />
            <Picker.Item label="💻 Kodlama" value="Kodlama" />
            <Picker.Item label="📖 Kitap Okuma" value="Kitap" />
            <Picker.Item label="🚀 Proje" value="Proje" />
            <Picker.Item label="🧘 Meditasyon" value="Meditasyon" />
          </Picker>
        </View>
        {isSessionStarted && <Text style={styles.infoText}>⚠️ Seans bitmeden kategori değişemez</Text>}
      </View>

      {/* SAYAÇ */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        {distractionCount > 0 && (
            <Text style={styles.distractionText}>⚠️ {distractionCount} Kez Dikkat Dağıldı!</Text>
        )}
      </View>

      {/* BUTONLAR */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isActive ? styles.stopButton : styles.startButton]} 
          onPress={handleStartStop}
        >
          <Text style={styles.buttonText}>{isActive ? "Duraklat" : (isSessionStarted ? "Devam Et" : "Başlat")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
          <Text style={styles.buttonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

      {/* HIZLI SÜRE AYARI */}
      <View style={[styles.quickAddContainer, { opacity: isSessionStarted ? 0.3 : 1 }]}>
        <TouchableOpacity 
          onPress={() => changeTime(60)} 
          disabled={isSessionStarted}
          style={styles.smallButton}
        >
            <Text style={styles.smallButtonText}>+1 Dk</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => changeTime(-60)} 
          disabled={isSessionStarted}
          style={styles.smallButton}
        >
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
  
  pickerWrapper: { 
    width: '80%', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    overflow: 'hidden' 
  },
  disabledPicker: {
    backgroundColor: '#e0e0e0',
    borderColor: '#ccc',
    opacity: 0.6
  },
  
  picker: { width: '100%', height: 55 },
  infoText: { fontSize: 12, color: '#999', marginTop: 5 },

  timerContainer: { alignItems: 'center', marginBottom: 40 },
  timerText: { fontSize: 90, fontWeight: 'bold', color: '#2c3e50', fontVariant: ['tabular-nums'] },
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