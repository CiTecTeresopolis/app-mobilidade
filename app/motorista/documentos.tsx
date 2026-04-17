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

type DriverStatus = "pendente" | "analise" | "aprovado";

export default function DocumentosScreen() {
  const router = useRouter();

  const [cnh, setCnh] = useState<string | null>(null);
  const [alvara, setAlvara] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [docCurso, setDocCurso] = useState<string | null>(null);
  const [crlv, setCrlv] = useState<string | null>(null);
  const [cmc, setCmc] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [statusMotorista, setStatusMotorista] =
    useState<DriverStatus>("pendente");
  const [tipoVeiculo, setTipoVeiculo] = useState<string>("");

  const checkUserStatus = async () => {
    try {
      setCheckingStatus(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/drivers/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      const driver = response.data;
      setTipoVeiculo(driver.tipo_servico || "Uber");

      if (driver.ativo === true) setStatusMotorista("aprovado");
      else if (driver.ativo === false) setStatusMotorista("analise");
      else setStatusMotorista("pendente");
    } catch (error: any) {
      console.log("Erro ao buscar status:", error.message);
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

  const canSubmit = () => {
    if (!cnh) return false;
    if (tipoVeiculo === "Moto") {
      return !!(crlv && docCurso && cmc && selfie);
    }
    return !!(alvara && selfie);
  };

  const pickImage = async (
    type: "cnh" | "alvara" | "selfie" | "curso" | "crlv" | "cmc",
  ) => {
    if (statusMotorista !== "pendente") return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão Necessária",
        "Acesse as configurações para permitir a câmera.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Desativado para evitar que o editor do Expo aumente o peso do arquivo
      quality: 0.1, // Qualidade mínima para garantir que o servidor aceite sem mexer no main.ts
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      if (type === "cnh") setCnh(uri);
      if (type === "alvara") setAlvara(uri);
      if (type === "selfie") setSelfie(uri);
      if (type === "curso") setDocCurso(uri);
      if (type === "crlv") setCrlv(uri);
      if (type === "cmc") setCmc(uri);
    }
  };

  const handleUpload = async () => {
    if (!canSubmit()) {
      return Alert.alert(
        "Atenção",
        "Capture todos os documentos obrigatórios.",
      );
    }

    setLoading(true);
    const formData = new FormData();

    const appendFile = (uri: string, name: string) => {
      const filename = uri.split("/").pop() || `${name}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      formData.append(name, { uri, name: filename, type } as any);
    };

    if (cnh) appendFile(cnh, "cnh");
    if (selfie) appendFile(selfie, "selfie");
    if (alvara) appendFile(alvara, "alvara");
    if (crlv) appendFile(crlv, "crlv");
    if (docCurso) appendFile(docCurso, "curso");
    if (cmc) appendFile(cmc, "cmc");

    try {
      const token = await AsyncStorage.getItem("token");
      await axios.post(
        "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/auth/register/documents",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Alert.alert("Sucesso", "Documentos enviados para análise! ✅");
      await checkUserStatus();
    } catch (error: any) {
      console.log("Erro no upload:", error.response?.data || error.message);
      Alert.alert(
        "Erro",
        "Falha ao enviar. Tente tirar as fotos novamente com menos luz.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentCards = () => {
    const docs: {
      label: string;
      state: string | null;
      type: "cnh" | "alvara" | "selfie" | "curso" | "crlv" | "cmc";
    }[] = [{ label: "CNH do Motorista", state: cnh, type: "cnh" as const }];

    if (tipoVeiculo === "Moto") {
      docs.push(
        { label: "CRLV da Motocicleta", state: crlv, type: "crlv" as const },
        {
          label: "Certificado de Motofrete",
          state: docCurso,
          type: "curso" as const,
        },
        {
          label: "Inscrição Municipal (CMC)",
          state: cmc,
          type: "cmc" as const,
        },
        {
          label: "Selfie com Documento",
          state: selfie,
          type: "selfie" as const,
        },
      );
    } else {
      docs.push(
        {
          label: "Alvará / Registro Municipal",
          state: alvara,
          type: "alvara" as const,
        },
        {
          label: "Selfie segurando CNH",
          state: selfie,
          type: "selfie" as const,
        },
      );
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
              {loading ? "Enviando..." : "Enviar para Análise"}
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
  subtitle: { color: "#a7c080", fontSize: 16, marginTop: 5, fontWeight: "500" },
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
  uploadBtn: {
    marginTop: 20,
    backgroundColor: "#a7c080",
    borderRadius: 12,
    paddingVertical: 6,
  },
  uploadLabel: { color: "#2d3629", fontWeight: "bold", fontSize: 16 },
});
