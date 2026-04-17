import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Avatar, Button, Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE = "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api";

export default function AvaliarScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Se não vier ID na URL, usamos o seu ID de teste para você conseguir ver a tela agora
  const driverId = params.id || "07860a2d-1e7a-405c-85e6-b1578ad3061f";

  const [driverData, setDriverData] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const loadDriver = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/auth/drivers/${driverId}`, {
          headers: { "ngrok-skip-browser-warning": "69420" },
        });
        setDriverData(res.data);
      } catch (e) {
        console.error("Erro ao buscar motorista:", e);
        setDriverData(null);
      } finally {
        setLoading(false);
      }
    };
    if (driverId) loadDriver();
  }, [driverId]);

  const handleEnviar = async () => {
    if (rating === 0) {
      return Alert.alert(
        "Atenção",
        "Por favor, selecione uma nota de 1 a 5 estrelas! ⭐",
      );
    }

    try {
      setLoading(true);

      // Montando o objeto exatamente como o banco/DTO do NestJS costuma esperar
      const payload = {
        // O String(...) garante que o valor seja tratado como texto simples
        driverId: String(driverId).trim(),
        stars: Number(rating),
        comment: String(feedback).trim() || "Sem comentário",
      };

      await axios.post(`${API_BASE}/auth/ratings`, payload, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      setEnviado(true);
    } catch (e: any) {
      console.error("Erro ao enviar avaliação:", e.response?.data || e.message);

      const errorMsg =
        e.response?.data?.message || "Não foi possível conectar ao servidor.";
      Alert.alert("Erro ao Avaliar", `❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !driverData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a7c080" />
      </View>
    );
  }

  if (!driverData) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#fff" }}>Motorista não identificado.</Text>
        <Button onPress={() => router.back()}>Voltar</Button>
      </View>
    );
  }

  if (enviado) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="check-circle" size={80} color="#a7c080" />
        <Text variant="headlineSmall" style={{ color: "#fff", marginTop: 20 }}>
          Avaliação enviada!
        </Text>
        <Button
          mode="contained"
          onPress={() => router.replace("/cliente/home")}
          style={styles.btnVoltar}
          textColor="#ffff"
        >
          Início
        </Button>
      </View>
    );
  }

  const handleDenunciar = () => {
    Alert.alert(
      "Denunciar Motorista ⚠️",
      "Deseja abrir um canal direto com a central de segurança para relatar um incidente grave?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Denunciar",
          style: "destructive",
          onPress: async () => {
            try {
              // Exemplo de chamada para sua API de denúncias
              await axios.post(`${API_BASE}/auth/reports`, {
                driverId,
                type: "GRAVE",
                description:
                  feedback || "Denúncia realizada pelo portal do passageiro",
              });
              Alert.alert(
                "Sucesso",
                "Sua denúncia foi enviada. Nossa equipe analisará o caso imediatamente.",
              );
            } catch (e) {
              Alert.alert("Erro", "Não foi possível enviar a denúncia agora.");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 25 }}>
          <View style={styles.header}>
            <Avatar.Text
              size={80}
              label={driverData.name.substring(0, 2).toUpperCase()}
              style={styles.avatar}
            />
            <Text variant="headlineSmall" style={styles.name}>
              {driverData.name}
            </Text>
            <Text style={styles.sub}>O que achou da sua viagem?</Text>
          </View>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <TouchableOpacity key={s} onPress={() => setRating(s)}>
                    <MaterialCommunityIcons
                      name={s <= rating ? "star" : "star-outline"}
                      size={45}
                      color={s <= rating ? "#f1c40f" : "#ccc"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Deixe um comentário sobre o motorista..."
                multiline
                value={feedback}
                onChangeText={setFeedback}
              />

              <Button
                mode="contained"
                onPress={handleEnviar}
                style={styles.btn}
                loading={loading}
                labelStyle={{ color: "#fff" }}
              >
                Confirmar Avaliação
              </Button>

              <Button
                mode="text"
                onPress={handleDenunciar}
                style={styles.btnReport}
                textColor="#e74c3c"
                icon="alert-octagon"
              >
                Denunciar Motorista
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2d3629" },
  center: {
    flex: 1,
    backgroundColor: "#2d3629",
    justifyContent: "center",
    alignItems: "center",
  },
  header: { alignItems: "center", marginVertical: 40 },
  avatar: { backgroundColor: "#4f5b4a" },
  name: { color: "#fff", fontWeight: "bold", marginTop: 15 },
  sub: { color: "#a7c080", marginTop: 5 },
  card: { borderRadius: 20, backgroundColor: "#fff", paddingVertical: 10 },
  stars: { flexDirection: "row", justifyContent: "center", marginBottom: 25 },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 15,
    minHeight: 100,
    textAlignVertical: "top",
  },
  btn: {
    marginTop: 25,
    backgroundColor: "#2d3629",
    borderRadius: 10,
  },

  btnReport: {
    marginTop: 10,
    borderRadius: 10,
  },

  btnVoltar: {
    marginTop: 25,
    backgroundColor: "#37443e",
  },
});
