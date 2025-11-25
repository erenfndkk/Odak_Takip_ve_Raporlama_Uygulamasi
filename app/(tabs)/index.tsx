import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  // Sadece süre ve aktiflik durumu kaldı
  const [seconds, setSeconds] = useState(25 * 60); // Varsayılan 25 dakika
  const [isActive, setIsActive] = useState(false);

  // SAYAÇ MANTIĞI
  useEffect(() => {
    let interval: any = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      // Süre Bittiğinde
      setIsActive(false);
      clearInterval(interval);
      Alert.alert("Süre Bitti", "Odaklanma seansı tamamlandı!");
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  // Yardımcı Fonksiyon: Saniyeyi DK:SN formatına çevirir
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const second = time % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${second < 10 ? '0' : ''}${second}`;
  };

  // Buton Fonksiyonları
  const handleReset = () => {
    setIsActive(false);
    setSeconds(25 * 60); // Sıfırlayınca tekrar 25 dk olsun
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Odaklanma Modu</Text>
      
      {/* SAYAÇ GÖSTERGESİ */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      </View>

      {/* KONTROL BUTONLARI */}
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

      {/* HIZLI SÜRE AYARI (+/- 1 DK) */}
      <View style={styles.quickAddContainer}>
        <TouchableOpacity onPress={() => setSeconds(seconds + 60)} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>+1 Dk</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setSeconds(seconds > 60 ? seconds - 60 : 0)} style={styles.smallButton}>
            <Text style={styles.smallButtonText}>-1 Dk</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5', 
    padding: 20 
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 50, 
    color: '#333' 
  },
  timerContainer: { 
    alignItems: 'center', 
    marginBottom: 50 
  },
  timerText: { 
    fontSize: 90, 
    fontWeight: 'bold', 
    color: '#2c3e50',
    fontVariant: ['tabular-nums'] // Rakamlar değişirken titremesin diye
  },
  buttonContainer: { 
    flexDirection: 'row', 
    gap: 20,
    marginBottom: 30
  },
  button: { 
    paddingVertical: 15, 
    paddingHorizontal: 35, 
    borderRadius: 30, 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  startButton: { backgroundColor: '#27ae60' },
  stopButton: { backgroundColor: '#f39c12' },
  resetButton: { backgroundColor: '#e74c3c' },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  quickAddContainer: { 
    flexDirection: 'row', 
    gap: 15 
  },
  smallButton: { 
    paddingVertical: 10,
    paddingHorizontal: 20, 
    backgroundColor: '#e0e0e0', 
    borderRadius: 10 
  },
  smallButtonText: {
    color: '#333',
    fontWeight: '600'
  }
});