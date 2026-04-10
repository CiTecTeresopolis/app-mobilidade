import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, IconButton, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomePassageiro() {
  const [userName, setUserName] = useState("Passageiro");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const name = await AsyncStorage.getItem("user_name");
        if (name) {
          setUserName(name);
        }
      } catch (error) {
        console.log("Erro ao carregar nome:", error);
      }
    };

    loadUserData();
  }, []);
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Função para abrir o scanner verificando permissão
  const handleOpenScanner = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Permissão Necessária",
          "Precisamos da câmera para ler o QR Code.",
        );
        return;
      }
    }
    setIsScannerVisible(true);
    setScanned(false);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setIsScannerVisible(false); // Fecha o modal da câmera

    // IMPORTANTE: Sua tela de avaliação espera o parâmetro "id"
    // O 'data' lido pelo QR Code deve ser o ID do motorista
    router.push({
      pathname: "/cliente/avaliar",
      params: { id: data },
    });

    // Pequeno delay para permitir scanear novamente no futuro se necessário
    setTimeout(() => setScanned(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Conteúdo Principal da Home */}
      <View style={styles.mainContent}>
        <Image
          source={require("../../assets/images/logoLogin.png")}
          style={styles.logo}
        />

        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.welcomeTitle}>
              Olá, {userName}!
            </Text>
            <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
              Bem-vindo ao TereMobilidade. Sua segurança é nossa prioridade.
              Para iniciar, escaneie o código QR no veículo.
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="shield-check"
            size={24}
            color="#a7c080"
          />
          <Text style={styles.infoText}>
            Motoristas verificados pela Prefeitura
          </Text>
        </View>
      </View>

      {/* FOOTER COM BOTÃO QR CODE */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => router.replace("/")}
        >
          <MaterialCommunityIcons name="calendar" size={28} color="#a7c080" />
          <Text style={styles.footerLabel}>Agenda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.qrButton} onPress={handleOpenScanner}>
          <View style={styles.qrInner}>
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={32}
              color="#2d3629"
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => router.push("/contato")}
        >
          <MaterialCommunityIcons
            name="help-circle"
            size={28}
            color="#8a9685"
          />
          <Text style={styles.footerLabel}>Contato</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DA CÂMERA (Abre por cima de tudo) */}
      <Modal visible={isScannerVisible} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          >
            <View style={styles.cameraOverlay}>
              <IconButton
                icon="close"
                size={30}
                iconColor="#fff"
                style={styles.closeBtn}
                onPress={() => setIsScannerVisible(false)}
              />
              <View style={styles.scanTarget} />
              <Text style={styles.scanText}>
                Aponte para o QR Code do Motorista
              </Text>
            </View>
          </CameraView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2d3629" },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },
  logo: { width: 200, height: 100, resizeMode: "contain", marginBottom: 40 },
  welcomeCard: {
    backgroundColor: "#3e4a39",
    borderRadius: 20,
    width: "100%",
    padding: 10,
  },
  welcomeTitle: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  welcomeSubtitle: {
    color: "#a7c080",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    gap: 10,
  },
  infoText: { color: "#8a9685", fontSize: 14 },

  // Footer Styles
  footer: {
    height: 80,
    backgroundColor: "#3e4a39",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: "relative",
  },
  footerItem: { alignItems: "center" },
  footerLabel: { color: "#8a9685", fontSize: 12, marginTop: 4 },
  qrButton: {
    top: -30, // Faz o botão "flutuar" para cima do footer
    backgroundColor: "#2d3629",
    padding: 10,
    borderRadius: 50,
    elevation: 5,
  },
  qrInner: {
    backgroundColor: "#a7c080",
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },

  // Camera Styles
  cameraContainer: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  cameraOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  closeBtn: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  scanTarget: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#a7c080",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  scanText: { color: "#fff", marginTop: 20, fontWeight: "bold", fontSize: 16 },
});
