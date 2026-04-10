import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Avatar, Button, Card, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE = "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api";

export default function ConsultaCPF() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [erro, setErro] = useState("");

  const buscarMotorista = async () => {
    if (cpf.length < 11) {
      setErro("Digite um CPF válido ❌");
      return;
    }

    setLoading(true);
    setErro("");
    setResultado(null);

    try {
      const response = await axios.get(
        `${API_BASE}/auth/drivers/search/${cpf}`,
        {
          headers: { "ngrok-skip-browser-warning": "true" },
        },
      );
      setResultado(response.data);
    } catch (err: any) {
      setErro(err.response?.data?.message || "Motorista não encontrado ❌");
    } finally {
      setLoading(false);
    }
  };

  // Centraliza as configurações visuais do status
  const getStatusConfig = (status: string, ativo: boolean | null) => {
    if (ativo === true)
      return { label: "ATIVO", color: "#a7c080", icon: "check-decagram" };
    if (ativo === null)
      return { label: "PENDENTE", color: "#f87171", icon: "alert-octagon" };
    return { label: "EM ANÁLISE", color: "#f1c40f", icon: "clock-outline" };
  };

  // Centraliza as instruções detalhadas
  const getStatusInstructions = (ativo: boolean | null) => {
    if (ativo === true) return null;

    if (ativo === null) {
      return {
        titulo: "Documentação Pendente",
        mensagem:
          "O motorista precisa realizar o upload dos documentos (CNH, CRLV e Selfie) no painel do motorista para iniciar a validação.",
        icon: "file-upload-outline",
      };
    }

    return {
      titulo: "Aguardando Aprovação",
      mensagem:
        "Os documentos foram enviados e estão sendo revisados pela nossa equipe. Prazo médio de 24h para resposta.",
      icon: "timer-sand",
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => router.back()}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={28}
              color="#a7c080"
            />
          </View>
        </TouchableOpacity>

        <Text variant="titleLarge" style={styles.headerTitle}>
          Consulta de Segurança
        </Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.searchCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.label}>
              Consultar Credencial
            </Text>
            <TextInput
              label="Digite o CPF do Motorista"
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
              mode="outlined"
              maxLength={11}
              activeOutlineColor="#a7c080"
              outlineColor="#8a9685"
              textColor="#fff"
              style={styles.input}
              left={
                <TextInput.Icon icon="card-account-details" color="#a7c080" />
              }
            />
            <Button
              mode="contained"
              onPress={buscarMotorista}
              loading={loading}
              style={styles.btnBusca}
              labelStyle={{ fontWeight: "bold", color: "#2d3629" }}
            >
              Verificar Status
            </Button>
          </Card.Content>
        </Card>

        {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

        {resultado && (
          <Card style={styles.resultCard}>
            <Card.Content style={styles.resultContent}>
              <Avatar.Icon
                size={80}
                icon="account"
                style={{ backgroundColor: "#2d3629" }}
                color="#a7c080"
              />

              <Text variant="headlineSmall" style={styles.driverName}>
                {resultado.name}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      getStatusConfig(resultado.status, resultado.ativo).color +
                      "22",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    getStatusConfig(resultado.status, resultado.ativo)
                      .icon as any
                  }
                  size={20}
                  color={
                    getStatusConfig(resultado.status, resultado.ativo).color
                  }
                />
                <Text
                  style={[
                    styles.statusLabel,
                    {
                      color: getStatusConfig(resultado.status, resultado.ativo)
                        .color,
                    },
                  ]}
                >
                  {getStatusConfig(resultado.status, resultado.ativo).label}
                </Text>
              </View>

              {/* CAIXA DE INSTRUÇÕES (Renderiza apenas se não estiver Ativo) */}
              {getStatusInstructions(resultado.ativo) && (
                <View style={styles.instructionBox}>
                  <View style={styles.instructionHeader}>
                    <MaterialCommunityIcons
                      name={getStatusInstructions(resultado.ativo)?.icon as any}
                      size={20}
                      color="#a7c080"
                    />
                    <Text style={styles.instructionTitle}>
                      {getStatusInstructions(resultado.ativo)?.titulo}
                    </Text>
                  </View>
                  <Text style={styles.instructionText}>
                    {getStatusInstructions(resultado.ativo)?.mensagem}
                  </Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>CPF:</Text>
                <Text style={styles.infoValue}>{resultado.cpf}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{resultado.email}</Text>
              </View>
            </Card.Content>
          </Card>
        )}
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
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    flexShrink: 1,
    textAlign: "center",
  },
  backButtonContainer: { alignItems: "center", justifyContent: "center" },
  scroll: { padding: 20 },
  searchCard: { backgroundColor: "#3e4a39", borderRadius: 15, elevation: 5 },
  label: { color: "#fff", marginBottom: 10 },
  input: { backgroundColor: "#3e4a39", marginBottom: 15 },
  btnBusca: {
    backgroundColor: "#a7c080",
    borderRadius: 10,
    paddingVertical: 5,
  },
  resultCard: {
    marginTop: 25,
    backgroundColor: "#3e4a39",
    borderRadius: 20,
    paddingVertical: 10,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3e4a39",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#a7c080",
  },
  resultContent: { alignItems: "center" },
  driverName: { color: "#fff", fontWeight: "bold", marginTop: 15 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  statusLabel: { fontWeight: "bold", marginLeft: 8 },

  // NOVOS ESTILOS PARA AS INSTRUÇÕES
  instructionBox: {
    backgroundColor: "rgba(167, 192, 128, 0.1)",
    borderRadius: 12,
    padding: 15,
    width: "100%",
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#a7c080",
  },
  instructionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  instructionTitle: {
    color: "#a7c080",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
    textTransform: "uppercase",
  },
  instructionText: { color: "#ccc", fontSize: 13, lineHeight: 18 },

  infoRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  infoLabel: { color: "#a7c080", fontWeight: "500" },
  infoValue: { color: "#fff" },
  errorText: {
    color: "#f87171",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "bold",
  },
});
