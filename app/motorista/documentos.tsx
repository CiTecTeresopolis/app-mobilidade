import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator, Button, Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// Tipos expandidos para cobrir todos os novos documentos
type DocType = "cnh" | "alvara" | "selfie" | "curso" | "crlv" | "cmc" | "crv";
type DriverStatus = "pendente" | "analise" | "aprovado";

export default function DocumentosScreen() {
  const router = useRouter();

  // Estados dos documentos
  const [cnh, setCnh] = useState<string | null>(null);
  const [alvara, setAlvara] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [docCurso, setDocCurso] = useState<string | null>(null);
  const [crlv, setCrlv] = useState<string | null>(null);
  const [cmc, setCmc] = useState<string | null>(null);
  const [crv, setCrv] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [statusMotorista, setStatusMotorista] =
    useState<DriverStatus>("pendente");
  const [tipoVeiculo, setTipoVeiculo] = useState<string>("");

  const API_URL =
    "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api";

  const checkUserStatus = async () => {
    try {
      setCheckingStatus(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${API_URL}/drivers/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      const driver = response.data;
      setTipoVeiculo(driver.tipo_servico || "Uber");

      if (driver.status === "REJECTED") {
        setStatusMotorista("pendente");
      } else if (driver.ativo === true || driver.status === "APPROVED") {
        setStatusMotorista("aprovado");
      } else if (driver.status === "ANALYSIS") {
        // Se status no banco for PENDING ou ANALYSIS, mostramos tela de análise
        setStatusMotorista("analise");
      } else {
        setStatusMotorista("pendente");
      }
    } catch (error: any) {
      console.error("Erro ao buscar status:", error.message);
      setStatusMotorista("pendente");
    } finally {
      setCheckingStatus(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkUserStatus();
    }, []),
  );

  // Validação dinâmica baseada na categoria
  const canSubmit = () => {
    switch (tipoVeiculo) {
      case "Moto":
        return !!(cnh && selfie && crlv && cmc && docCurso);
      case "Uber":
        return !!(cnh && selfie && alvara && crlv);
      case "Van":
        return !!(crv && selfie && cnh);
      case "Táxi":
        return !!(cnh && crlv && selfie);
      case "Mudança":
        return !!(cnh && crlv && selfie);
      default:
        return !!(cnh && selfie);
    }
  };

  const pickImage = async (type: DocType) => {
    if (statusMotorista !== "pendente") return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão Necessária", "Acesso à câmera negado.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.2,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === "cnh") setCnh(uri);
      if (type === "alvara") setAlvara(uri);
      if (type === "selfie") setSelfie(uri);
      if (type === "curso") setDocCurso(uri);
      if (type === "crlv") setCrlv(uri);
      if (type === "cmc") setCmc(uri);
      if (type === "crv") setCrv(uri);
    }
  };

  const handleUpload = async () => {
    if (!canSubmit())
      return Alert.alert("Atenção", "Capture todos os documentos.");

    setLoading(true);
    const formData = new FormData();

    const appendFile = (uri: string | null, name: string) => {
      if (uri) {
        formData.append(name, {
          uri,
          name: `${name}.jpg`,
          type: "image/jpeg",
        } as any);
      }
    };

    appendFile(cnh, "cnh");
    appendFile(selfie, "selfie");
    appendFile(alvara, "alvara");
    appendFile(crlv, "crlv");
    appendFile(docCurso, "curso");
    appendFile(cmc, "cmc");
    appendFile(crv, "crv");

    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_URL}/auth/register/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        Alert.alert("Sucesso", "Documentos enviados para análise!");
        checkUserStatus();
      } else {
        throw new Error();
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar documentos.");
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentCards = () => {
    let docs: { label: string; state: string | null; type: DocType }[] = [];

    // Lógica de cards por categoria
    if (tipoVeiculo === "Moto") {
      docs = [
        { label: "CNH", state: cnh, type: "cnh" },
        { label: "Selfie com Documento", state: selfie, type: "selfie" },
        { label: "CRLV da Moto", state: crlv, type: "crlv" },
        { label: "Inscrição Municipal (CMC)", state: cmc, type: "cmc" },
        { label: "Certificado de Motofrete", state: docCurso, type: "curso" },
      ];
    } else if (tipoVeiculo === "Uber") {
      docs = [
        { label: "CNH", state: cnh, type: "cnh" },
        { label: "Selfie com Documento", state: selfie, type: "selfie" },
        { label: "Alvará / Registro", state: alvara, type: "alvara" },
        { label: "CRLV do Veículo", state: crlv, type: "crlv" },
      ];
    } else if (tipoVeiculo === "Van") {
      docs = [
        { label: "CRV", state: crv, type: "crv" },
        { label: "Selfie com Documento", state: selfie, type: "selfie" },
        { label: "CNH", state: cnh, type: "cnh" },
      ];
    } else if (tipoVeiculo === "Táxi") {
      docs = [
        { label: "CNH", state: cnh, type: "cnh" },
        { label: "CRLV", state: crlv, type: "crlv" },
        { label: "Selfie com Documento", state: selfie, type: "selfie" },
      ];
    } else if (tipoVeiculo === "Mudança") {
      docs = [
        { label: "CNH", state: cnh, type: "cnh" },
        { label: "CRLV", state: crlv, type: "crlv" },
        { label: "Selfie com Documento", state: selfie, type: "selfie" },
      ];
    }

    return docs.map((item, index) => (
      <Card
        key={index}
        style={styles.formCard}
        onPress={() => pickImage(item.type)}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleMedium" style={styles.cardLabel}>
              {item.label}
            </Text>
            {item.state && (
              <MaterialCommunityIcons
                name="check-circle"
                size={22}
                color="#a7c080"
              />
            )}
          </View>
          {item.state ? (
            <Image source={{ uri: item.state }} style={styles.preview} />
          ) : (
            <Button
              icon="camera"
              mode="outlined"
              textColor="#a7c080"
              style={styles.cameraBtn}
            >
              Tirar Foto
            </Button>
          )}
        </Card.Content>
      </Card>
    ));
  };

  if (checkingStatus) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator color="#a7c080" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonCustom}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#a7c080" />
        </TouchableOpacity>

        {statusMotorista === "pendente" ? (
          <>
            <View style={styles.titleSection}>
              <Text variant="headlineMedium" style={styles.title}>
                Verificação
              </Text>
              <Text style={styles.subtitle}>Categoria: {tipoVeiculo}</Text>
            </View>
            {renderDocumentCards()}
            <Button
              mode="contained"
              onPress={handleUpload}
              loading={loading}
              disabled={loading || !canSubmit()}
              style={[styles.uploadBtn, !canSubmit() && { opacity: 0.5 }]}
              labelStyle={styles.uploadLabel}
            >
              Enviar para Análise
            </Button>
          </>
        ) : (
          <View style={styles.statusView}>
            <Card
              style={[
                styles.statusCard,
                statusMotorista === "aprovado" && styles.borderSuccess,
              ]}
            >
              <Card.Content style={styles.centerItems}>
                {statusMotorista === "analise" ? (
                  <>
                    <ActivityIndicator
                      animating
                      color="#a7c080"
                      style={{ marginBottom: 20 }}
                    />
                    <Text variant="headlineSmall" style={styles.warningTitle}>
                      Em Análise ⏳
                    </Text>
                    <Text style={styles.statusSubtext}>
                      Estamos revisando seus documentos.
                    </Text>
                  </>
                ) : (
                  <>
                    <Text variant="headlineSmall" style={styles.successTitle}>
                      Perfil Ativo ✅
                    </Text>
                    <Text style={styles.statusSubtext}>
                      Seu cadastro foi aprovado!
                    </Text>
                    <Button
                      mode="contained"
                      onPress={() => router.push("/motorista/home")}
                      style={styles.actionBtn}
                    >
                      Ir para Home
                    </Button>
                  </>
                )}
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#2d3629" },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  loadingCenter: {
    flex: 1,
    backgroundColor: "#2d3629",
    justifyContent: "center",
  },
  backButtonCustom: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#3e4a39",
    width: 50,
    marginBottom: 10,
  },
  titleSection: { marginBottom: 25, alignItems: "center" },
  title: { color: "#fff", fontWeight: "bold" },
  subtitle: { color: "#a7c080", fontSize: 16, marginTop: 5 },
  statusView: { marginTop: 40 },
  statusCard: { backgroundColor: "#3e4a39", padding: 20, borderRadius: 15 },
  borderSuccess: { borderColor: "#a7c080", borderWidth: 1 },
  centerItems: { alignItems: "center" },
  successTitle: { color: "#a7c080", fontWeight: "bold", marginBottom: 10 },
  warningTitle: { color: "#fff", fontWeight: "bold", marginBottom: 10 },
  statusSubtext: { color: "#fff", textAlign: "center", opacity: 0.8 },
  actionBtn: { marginTop: 20, backgroundColor: "#a7c080" },
  formCard: { marginBottom: 20, backgroundColor: "#3e4a39", borderRadius: 12 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardLabel: { color: "#fff" },
  cameraBtn: { borderColor: "#a7c080", marginTop: 10 },
  preview: { width: "100%", height: 200, borderRadius: 8, marginTop: 10 },
  uploadBtn: { marginTop: 20, backgroundColor: "#a7c080", borderRadius: 12 },
  uploadLabel: { color: "#2d3629", fontWeight: "bold" },
});
