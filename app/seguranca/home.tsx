import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Button, Card, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE = "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api";

export default function HomeSeguranca() {
  const router = useRouter();
  const [cnhBusca, setCnhBusca] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);
  const [erro, setErro] = useState("");
  const [nomeSeguranca, setNomeSeguranca] = useState("");

  useEffect(() => {
    carregarDadosSeguranca();
  }, []);

  const carregarDadosSeguranca = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user_seguranca");
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.name) {
          setNomeSeguranca(user.name.split(" ")[0]);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar dados do segurança:", e);
      setNomeSeguranca("Agente");
    }
  };

  const buscarMotoristas = async () => {
    const termo = cnhBusca.trim();
    if (termo.length < 3) {
      setErro("Digite pelo menos 3 números para pesquisar ❌");
      return;
    }

    setLoading(true);
    setErro("");
    setResultados([]);

    try {
      const response = await axios.get(
        `${API_BASE}/auth/drivers/search/cnh/${termo}`,
        { headers: { "ngrok-skip-browser-warning": "true" } },
      );

      if (!response.data || response.data.length === 0) {
        setErro("Nenhum motorista encontrado ❌");
      } else {
        setResultados(response.data);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Erro ao conectar com servidor ❌";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string, ativo: boolean | null) => {
    // Se estiver explicitamente ativo
    if (ativo === true) {
      return { label: "ATIVO", color: "#a7c080", icon: "check-decagram" };
    }

    // Se o status for recusado/rejeitado
    if (status === "REJECTED") {
      return {
        label: "RECUSADO",
        color: "#ef4444",
        icon: "close-circle-outline",
      };
    }

    // Se estiver pendente ou sem definição de ativo
    if (status === "PENDING" || ativo === null) {
      return { label: "PENDENTE", color: "#f1c40f", icon: "clock-outline" };
    }

    // Caso contrário, bloqueado
    return { label: "BLOQUEADO", color: "#f87171", icon: "alert-octagon" };
  };

  const getStatusMessage = (motorista: any) => {
    const { status, ativo, rejection_reason } = motorista;

    // Caso ATIVO
    if (ativo === true) {
      return "Seu cadastro está ativo e pronto para uso! ✅";
    }

    // Caso RECUSADO
    if (status === "REJECTED") {
      return `Seu cadastro foi recusado. Motivo: ${rejection_reason || "Documentação inválida ou ilegível"}. ❌`;
    }

    // Caso PENDENTE
    if (status === "PENDING" || ativo === null) {
      return "Aguarde a análise da prefeitura. Prazo médio: 2 a 5 dias úteis. ⏳";
    }

    // Caso BLOQUEADO
    return "Cadastro bloqueado. Entre em contato com o suporte da prefeitura. ⚠️";
  };

  // Função para renderizar as estrelas baseada na nota
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <MaterialCommunityIcons
          key={i}
          name={i <= Math.round(rating) ? "star" : "star-outline"}
          size={16}
          color={i <= Math.round(rating) ? "#f1c40f" : "#8a9685"}
        />,
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace("/")}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#f87171" />
        </TouchableOpacity>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeLabel}>PAINEL DE SEGURANÇA</Text>
          <Text variant="titleMedium" style={styles.securityName}>
            Agente {nomeSeguranca} 🛡️
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleSection}>
          <Text variant="headlineSmall" style={styles.pageTitle}>
            Verificar Credenciais
          </Text>
          <Text style={styles.subtitle}>
            Pesquise por número total ou parcial da CNH
          </Text>
        </View>

        {/* BUSCA */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <TextInput
              label="Digite a CNH"
              value={cnhBusca}
              onChangeText={setCnhBusca}
              keyboardType="numeric"
              mode="outlined"
              activeOutlineColor="#a7c080"
              outlineColor="#8a9685"
              textColor="#fff"
              style={styles.input}
              placeholder="Ex: 1234..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              left={<TextInput.Icon icon="magnify" color="#a7c080" />}
            />
            <Button
              mode="contained"
              onPress={buscarMotoristas}
              loading={loading}
              disabled={loading}
              style={styles.btnBusca}
              labelStyle={{ fontWeight: "bold", color: "#2d3629" }}
            >
              PESQUISAR AGORA
            </Button>
          </Card.Content>
        </Card>

        {erro ? <Text style={styles.errorText}>{erro}</Text> : null}

        {/* LISTAGEM */}
        <View style={styles.listContainer}>
          {resultados.map((motorista) => {
            // Pegamos a configuração de status e a mensagem de orientação
            const statusCfg = getStatusConfig(
              motorista.status,
              motorista.ativo,
            );
            const orientacaoMsg = getStatusMessage(motorista);

            return (
              <Card
                key={motorista.id}
                style={[
                  styles.resultCard,
                  { borderLeftColor: statusCfg.color },
                ]}
              >
                <Card.Content>
                  <View style={styles.driverHeader}>
                    <Avatar.Icon
                      size={45}
                      icon="account"
                      style={{ backgroundColor: "#2d3629" }}
                      color="#a7c080"
                    />
                    <View style={styles.driverInfoHead}>
                      <Text style={styles.driverName}>{motorista.name}</Text>
                      <Text style={styles.driverEmail}>{motorista.email}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* SEÇÃO DE AVALIAÇÃO */}
                  <View style={styles.ratingSection}>
                    <Text style={styles.infoLabel}>Avaliação do Condutor</Text>
                    <View style={styles.starsContainer}>
                      {motorista.rating_avg ? (
                        <>
                          <View style={styles.starsRow}>
                            {renderStars(motorista.rating_avg)}
                          </View>
                          <Text style={styles.ratingText}>
                            {motorista.rating_avg.toFixed(1)} (
                            {motorista.total_reviews || 0})
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.noRatingText}>
                          Sem avaliações registradas
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* DETALHES TÉCNICOS E STATUS */}
                  <View style={styles.detailsGrid}>
                    <View>
                      <Text style={styles.infoLabel}>CNH</Text>
                      <Text style={styles.infoValue}>{motorista.cnh}</Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusCfg.color + "22" },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={statusCfg.icon as any}
                        size={16}
                        color={statusCfg.color}
                      />
                      <Text
                        style={[styles.statusLabel, { color: statusCfg.color }]}
                      >
                        {statusCfg.label}
                      </Text>
                    </View>
                  </View>

                  {/* --- NOVA SEÇÃO: MENSAGEM DE ORIENTAÇÃO --- */}
                  <View
                    style={[
                      styles.orientacaoContainer,
                      { borderLeftColor: statusCfg.color },
                    ]}
                  >
                    <Text style={styles.orientacaoTitle}>
                      Situação do Cadastro:
                    </Text>
                    <Text style={styles.orientacaoText}>{orientacaoMsg}</Text>
                  </View>
                </Card.Content>
              </Card>
            );
          })}
        </View>

        {loading && (
          <ActivityIndicator color="#a7c080" style={{ marginTop: 20 }} />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(167, 192, 128, 0.1)",
  },
  logoutBtn: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(248, 113, 113, 0.1)",
  },
  welcomeContainer: { alignItems: "center" },
  welcomeLabel: {
    color: "#a7c080",
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "600",
  },
  securityName: { color: "#fff", fontWeight: "bold" },
  scroll: { padding: 20, paddingBottom: 50 },
  titleSection: { marginBottom: 20 },
  pageTitle: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  subtitle: {
    color: "#8a9685",
    textAlign: "center",
    fontSize: 12,
    marginTop: 5,
  },
  searchCard: { backgroundColor: "#3e4a39", borderRadius: 15, elevation: 4 },
  input: { backgroundColor: "#3e4a39", marginBottom: 15 },
  btnBusca: {
    backgroundColor: "#a7c080",
    borderRadius: 10,
    paddingVertical: 5,
  },
  listContainer: { marginTop: 10 },
  resultCard: {
    marginTop: 15,
    backgroundColor: "#3e4a39",
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#a7c080",
  },
  driverHeader: { flexDirection: "row", alignItems: "center" },
  driverInfoHead: { marginLeft: 12 },
  driverName: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  driverEmail: { color: "#8a9685", fontSize: 12 },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 12,
  },

  // Estilos da Avaliação
  ratingSection: { marginVertical: 2 },
  starsContainer: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  starsRow: { flexDirection: "row", marginRight: 8 },
  ratingText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  noRatingText: { color: "#8a9685", fontSize: 12, fontStyle: "italic" },

  detailsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    color: "#a7c080",
    fontSize: 10,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoValue: { color: "#fff", fontWeight: "500", fontSize: 15 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusLabel: { fontWeight: "bold", marginLeft: 6, fontSize: 11 },
  errorText: {
    color: "#f87171",
    textAlign: "center",
    marginTop: 20,
    fontWeight: "600",
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    padding: 10,
    borderRadius: 10,
  },
  orientacaoContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderLeftWidth: 3,
    borderRadius: 6,
  },
  orientacaoTitle: {
    color: "#a7c080",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  orientacaoText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 18,
  },
});
