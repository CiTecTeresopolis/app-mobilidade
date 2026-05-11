import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
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

  function openStoreOrApp(arg0: string, arg1: string, arg2: string) {
    throw new Error("Function not implemented.");
  }

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
              Olá, {userName ? userName.split(" ")[0] : "Passageiro"}!
            </Text>
            <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
              Bem-vindo ao TeresópolisMobilidade. Sua segurança é nossa
              prioridade. Para iniciar, escaneie o código QR no veículo.
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

        <Text
          variant="titleLarge"
          style={[styles.sectionTitle, { marginTop: 25 }]}
        >
          Serviços Adicionais
        </Text>

        <View style={styles.iconButtonsRow}>
          {[
            {
              img: require("../../assets/images/whatsapp.png"),
              onPress: async () => {
                const phoneNumber = "5521972088235";
                const message = encodeURIComponent(
                  "Olá! Preciso de suporte no TeresópolisMobilidade.",
                );

                // Links para abrir a conversa direta
                const waUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
                const waWebUrl = `https://wa.me/${phoneNumber}?text=${message}`;

                // Links da Loja (Fallback)
                const storeUrl =
                  Platform.OS === "android"
                    ? `market://details?id=com.whatsapp`
                    : `https://apps.apple.com/br/app/id310633997`;

                try {
                  // Tenta abrir o aplicativo do WhatsApp primeiro
                  const supported = await Linking.canOpenURL(waUrl);

                  if (supported) {
                    await Linking.openURL(waUrl);
                  } else {
                    // Se não conseguir abrir o 'whatsapp://', tenta o link universal 'wa.me'
                    // que abre no navegador ou redireciona para a loja
                    const canOpenWeb = await Linking.canOpenURL(waWebUrl);
                    if (canOpenWeb) {
                      await Linking.openURL(waWebUrl);
                    } else {
                      // Se tudo falhar, manda para a loja baixar o app
                      await Linking.openURL(storeUrl);
                    }
                  }
                } catch (err) {
                  // Em caso de erro crítico, abre a loja
                  await Linking.openURL(storeUrl);
                }
              },
            },
            {
              img: require("../../assets/images/digipare.png"),
              onPress: () => {
                const bundleId = "com.digipare.app"; // ID do Digipare na Play Store
                const appleId = "910964529"; // ID do Digipare na App Store

                const url =
                  Platform.OS === "android"
                    ? `market://details?id=${bundleId}`
                    : `https://apps.apple.com/br/app/id${appleId}`;

                Linking.canOpenURL(url)
                  .then((supported) => {
                    if (supported) {
                      Linking.openURL(url);
                    } else {
                      // Fallback: Abre o link do navegador se o app da loja não responder
                      Linking.openURL(
                        `https://play.google.com/store/apps/details?id=${bundleId}`,
                      );
                    }
                  })
                  .catch((err) =>
                    console.error("Erro ao abrir o Digipare", err),
                  );
              },
            },
            {
              img: require("../../assets/images/vai_de_on.png"),
              onPress: () => {
                const bundleId = "com.VaiDeOn.app"; // ID extraído do link da Play Store
                const appleId = "6464055396"; // ID do Vai de Ônibus na App Store

                // Se for Android, usa o protocolo 'market', se for iOS, usa o link da App Store
                const url =
                  Platform.OS === "android"
                    ? `market://details?id=${bundleId}`
                    : `https://apps.apple.com/br/app/id${appleId}`;

                Linking.canOpenURL(url)
                  .then((supported) => {
                    if (supported) {
                      Linking.openURL(url);
                    } else {
                      // Se falhar (ex: emulador), abre o link do navegador que você enviou
                      Linking.openURL(
                        `https://play.google.com/store/apps/details?id=${bundleId}`,
                      );
                    }
                  })
                  .catch((err) => console.error("Erro ao abrir a loja", err));
              },
            },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.iconButtonContainer}
              onPress={item.onPress}
            >
              <View style={styles.iconCircle}>
                <Image source={item.img} style={styles.externalIcon} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* FOOTER COM BOTÃO QR CODE */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => router.replace("/cliente/loginClient")}
        >
          <MaterialCommunityIcons name="logout" size={28} color="#a7c080" />
          <Text style={styles.footerLabel}>Sair</Text>
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
          onPress={async () => {
            const phoneNumber = "5521972088235";
            const message = encodeURIComponent(
              "Olá! Preciso de suporte no TeresópolisMobilidade.",
            );

            // Links de Deep Link e Web
            const waUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
            const waWebUrl = `https://wa.me/${phoneNumber}?text=${message}`;

            // Links das Lojas (Caso o app não esteja instalado)
            const storeUrl =
              Platform.OS === "android"
                ? `market://details?id=com.whatsapp`
                : `https://apps.apple.com/br/app/id310633997`;

            try {
              // 1. Tenta abrir pelo protocolo do App (whatsapp://)
              const supported = await Linking.canOpenURL(waUrl);

              if (supported) {
                await Linking.openURL(waUrl);
              } else {
                // 2. Se não abrir o app, tenta o link universal (wa.me) que pode abrir no navegador
                // ou redirecionar automaticamente.
                const canOpenWeb = await Linking.canOpenURL(waWebUrl);
                if (canOpenWeb) {
                  await Linking.openURL(waWebUrl);
                } else {
                  // 3. Fallback final: Abre a página na loja para o usuário baixar
                  await Linking.openURL(storeUrl);
                }
              }
            } catch (err) {
              // Se houver qualquer erro no processo, tenta abrir a loja diretamente
              Linking.openURL(storeUrl);
            }
          }}
        >
          <MaterialCommunityIcons name="whatsapp" size={28} color="#a7c080" />
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
  sectionTitle: { color: "#fff", marginBottom: 15, fontWeight: "bold" },
  iconButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  iconButtonContainer: { alignItems: "center", width: "22%" },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3e4a39",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  externalIcon: { width: 35, height: 35, resizeMode: "contain" },
  scanText: { color: "#fff", marginTop: 20, fontWeight: "bold", fontSize: 16 },
});
