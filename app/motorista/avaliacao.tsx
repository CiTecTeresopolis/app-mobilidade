import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useFocusEffect, useRouter } from "expo-router"; // Adicionado useFocusEffect
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react"; // Adicionado useCallback
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE = "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api";

interface Avaliacao {
  id: string;
  stars: number;
  comment: string;
  created_at: string;
}

const Avaliacoes = () => {
  const router = useRouter();
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [media, setMedia] = useState(0);

  const fetchAvaliacoes = async (showLoading = true) => {
    const userDataJson = await AsyncStorage.getItem("user_data");
    const userData = userDataJson ? JSON.parse(userDataJson) : null;
    console.log("ID do Motorista consultado:", userData?.id);
    try {
      if (showLoading) setLoading(true);

      const userDataJson = await AsyncStorage.getItem("user_data");
      const userData = userDataJson ? JSON.parse(userDataJson) : null;

      // Importante: Verifique se o ID está vindo correto do login
      const driverId = userData?.id || "07860a2d-1e7a-405c-85e6-b1578ad3061f";

      const response = await axios.get(
        `${API_BASE}/auth/drivers/${driverId}/ratings`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
            "Cache-Control": "no-cache", // Evita cache do navegador/proxy
          },
        },
      );

      const dados = response.data || [];
      // Ordena por data mais recente primeiro, caso o banco não ordene
      const ordenados = dados.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setAvaliacoes(ordenados);

      if (ordenados.length > 0) {
        const soma = ordenados.reduce(
          (acc: number, cur: Avaliacao) => acc + cur.stars,
          0,
        );
        setMedia(parseFloat((soma / ordenados.length).toFixed(1)));
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ESTA É A CHAVE: Atualiza sempre que a tela entrar em foco
  useFocusEffect(
    useCallback(() => {
      fetchAvaliacoes();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAvaliacoes(false);
  };

  const RenderStars = ({ nota }: { nota: number }) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((s) => (
        <MaterialCommunityIcons
          key={s}
          name={s <= nota ? "star" : "star-outline"}
          size={18}
          color="#f1c40f"
        />
      ))}
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingCenter}>
        <ActivityIndicator size="large" color="#a7c080" />
        <Text style={{ color: "#a7c080", marginTop: 10 }}>
          Carregando feedbacks...
        </Text>
      </View>
    );
  }

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
            Avaliações
          </Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            Feedback em Tempo Real
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => fetchAvaliacoes()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="refresh" size={24} color="#a7c080" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#a7c080"
          />
        }
      >
        <Card style={styles.scoreCard}>
          <Card.Content style={styles.scoreContent}>
            <Text variant="displaySmall" style={styles.scoreNumber}>
              {avaliacoes.length > 0 ? media : "0.0"}
            </Text>
            <RenderStars nota={Math.round(media)} />
            <Text variant="bodyMedium" style={styles.totalReviews}>
              {avaliacoes.length}{" "}
              {avaliacoes.length === 1 ? "avaliação" : "avaliações"}
            </Text>
          </Card.Content>
        </Card>

        {avaliacoes.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <MaterialCommunityIcons
              name="comment-off-outline"
              size={50}
              color="#4f5b4a"
            />
            <Text style={{ color: "#8a9685", marginTop: 10 }}>
              Nenhuma avaliação encontrada.
            </Text>
          </View>
        ) : (
          avaliacoes.map((item) => (
            <Card key={item.id} style={styles.commentCard}>
              <Card.Content>
                <View style={styles.commentHeader}>
                  <Avatar.Icon
                    size={40}
                    icon="account-outline"
                    style={styles.avatar}
                    color="#a7c080"
                  />
                  <View style={styles.commentInfo}>
                    <Text variant="titleSmall" style={styles.clientName}>
                      Passageiro Anônimo
                    </Text>
                    <Text variant="bodySmall" style={styles.commentDate}>
                      {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </Text>
                  </View>
                  <RenderStars nota={item.stars} />
                </View>
                <Text variant="bodyMedium" style={styles.commentText}>
                  "{item.comment}"
                </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ... (Mantenha seus estilos originais)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2d3629" },
  loadingCenter: {
    flex: 1,
    backgroundColor: "#2d3629",
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: { padding: 20 },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: "#3e4a39" },
  headerTitleContainer: { alignItems: "center" },
  headerTitle: { color: "#fff", fontWeight: "bold" },
  headerSubtitle: { color: "#a7c080", fontSize: 10 },
  scoreCard: { backgroundColor: "#3e4a39", borderRadius: 20, marginBottom: 25 },
  scoreContent: { alignItems: "center", paddingVertical: 20 },
  scoreNumber: { color: "#fff", fontWeight: "bold" },
  totalReviews: { color: "#8a9685", marginTop: 10 },
  commentCard: {
    backgroundColor: "#3e4a39",
    marginBottom: 12,
    borderRadius: 12,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: { backgroundColor: "#2d3629" },
  commentInfo: { flex: 1, marginLeft: 12 },
  clientName: { color: "#fff" },
  commentDate: { color: "#8a9685" },
  commentText: { color: "#d3e397", fontStyle: "italic" },
  starsRow: { flexDirection: "row", gap: 2 },
});

export default Avaliacoes;
