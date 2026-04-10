import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Button, Card, Divider, Text } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

type DriverStatus = "pendente" | "analise" | "aprovado";

export default function PerfilScreen() {
  const router = useRouter();

  const [userData, setUserData] = useState({
    nome: "Carregando...",
    id: "",
    veiculo: "Não informado",
    placa: "",
  });
  const [statusMotorista, setStatusMotorista] =
    useState<DriverStatus>("pendente");
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/motorista/loginMoto");
        return;
      }

      const response = await axios.get(
        "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/drivers/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "69420",
          },
        },
      );

      const driver = response.data;

      setUserData({
        nome: driver.name || "Motorista",
        id: driver.id,
        veiculo: driver.modelo_carro || "Veículo não cadastrado",
        placa: driver.placa || "---",
      });

      if (driver.ativo === true) {
        setStatusMotorista("aprovado");
      } else if (driver.ativo === false) {
        setStatusMotorista("analise");
      } else {
        setStatusMotorista("pendente");
      }
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, []),
  );

  // Função para compartilhar o ID via WhatsApp/Sistema
  const compartilharNoWhatsapp = async () => {
    try {
      await Share.share({
        message: `Olá! Sou o motorista ${userData.nome} da TereMobilidade. 🚗\n\nMinha identificação digital: ${userData.id}\n\nAcesse o app para avaliar minha viagem!`,
      });
    } catch (error: any) {
      console.log("Erro ao compartilhar:", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#a7c080" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            Meu Perfil
          </Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            TereMobilidade
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.profileInfoSection}>
          <Avatar.Text
            size={90}
            label={userData.nome.substring(0, 2).toUpperCase()}
            style={styles.avatar}
            labelStyle={{ color: "#fff" }}
          />
          <Text variant="headlineSmall" style={styles.userName}>
            {userData.nome}
          </Text>
        </View>
        {statusMotorista === "aprovado" ? (
          <Card style={styles.qrCard}>
            <Card.Content style={styles.qrContent}>
              <Text variant="titleMedium" style={styles.qrTitle}>
                Identificação Digital
              </Text>
              <Text variant="bodySmall" style={styles.qrSubtitle}>
                Toque no QR Code abaixo para compartilhar via WhatsApp.
              </Text>

              {/* QR Code clicável */}
              <TouchableOpacity
                onPress={compartilharNoWhatsapp}
                activeOpacity={0.7}
                style={styles.qrWrapper}
              >
                {userData.id ? (
                  <QRCode
                    value={userData.id}
                    size={180}
                    color="#2d3629"
                    backgroundColor="white"
                    logo={require("../../assets/images/icon.png")}
                    logoSize={40}
                    logoBorderRadius={10}
                  />
                ) : (
                  <ActivityIndicator color="#2d3629" />
                )}
              </TouchableOpacity>

              <Text variant="labelLarge" style={styles.driverIdCode}>
                {`DRV-${userData.id.substring(0, 8).toUpperCase()}`}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.pendingCard}>
            <Card.Content style={styles.pendingContent}>
              <MaterialCommunityIcons
                name="timer-sand"
                size={40}
                color="#fff"
              />
              <Text style={styles.pendingTitle}>Perfil em Análise</Text>
              <Text style={styles.pendingDescription}>
                Seus documentos estão sendo revisados.
              </Text>
            </Card.Content>
          </Card>
        )}
        <Card style={styles.detailsCard}>
          <Card.Content>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Veículo</Text>
              <Text style={styles.detailValue}>{userData.veiculo}</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Placa</Text>
              <Text style={styles.detailValue}>{userData.placa}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* BOTÃO DE LOGOUT CORRIGIDO */}
        <Button
          mode="text"
          textColor="#ff7675"
          onPress={async () => {
            try {
              await AsyncStorage.clear();
              router.replace("/motorista/loginMoto");
            } catch (e) {
              console.error("Erro ao deslogar:", e);
            }
          }}
          style={styles.logoutBtn}
          icon="logout"
        >
          Sair da Conta
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2d3629" },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: "#3e4a39" },
  headerTitleContainer: { alignItems: "center" },
  headerTitle: { color: "#fff", fontWeight: "bold" },
  headerSubtitle: {
    color: "#a7c080",
    fontSize: 10,
    textTransform: "uppercase",
  },
  scroll: { padding: 20 },
  profileInfoSection: { alignItems: "center", marginBottom: 25 },
  avatar: { backgroundColor: "#4f5b4a" },
  userName: { color: "#fff", fontWeight: "bold", marginTop: 15 },
  qrCard: {
    backgroundColor: "#fff",
    borderRadius: 25,
    marginBottom: 20,
    elevation: 5,
  },
  qrContent: { alignItems: "center", paddingVertical: 25 },
  qrTitle: { color: "#2d3629", fontWeight: "bold", marginBottom: 5 },
  qrSubtitle: {
    color: "#666",
    textAlign: "center",
    fontSize: 12,
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  qrWrapper: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  driverIdCode: {
    color: "#2d3629",
    marginTop: 20,
    letterSpacing: 2,
    fontWeight: "bold",
    fontSize: 12,
  },
  detailsCard: { backgroundColor: "#3e4a39", borderRadius: 15 },
  detailRow: { padding: 15 },
  detailLabel: { color: "#a7c080", fontSize: 11, textTransform: "uppercase" },
  detailValue: { color: "#fff", fontSize: 16, marginTop: 4 },
  divider: { backgroundColor: "rgba(255,255,255,0.1)" },
  logoutBtn: { marginTop: 20, marginBottom: 40 },
  pendingCard: {
    backgroundColor: "#3e4a39",
    borderRadius: 20,
    marginBottom: 20,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#a7c080",
  },
  pendingContent: { alignItems: "center", padding: 20 },
  pendingTitle: { color: "#fff", fontWeight: "bold", marginTop: 10 },
  pendingDescription: { color: "#a7c080", textAlign: "center", marginTop: 8 },
});
