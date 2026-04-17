import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

const API_URL =
  "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/auth/login-seguranca";

export default function LoginSeguranca() {
  const router = useRouter();
  const [mat, setMat] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    if (!mat || !password) {
      setMessage("Preencha matrícula e senha ❌");
      return;
    }

    setLoading(true);
    setMessage("Autenticando credenciais... 🛡️");

    try {
      // No iOS, remover itens específicos é mais seguro que .clear()
      await AsyncStorage.removeItem("token_seguranca");
      await AsyncStorage.removeItem("user_seguranca");

      const response = await axios.post(
        API_URL,
        {
          matricula: mat.trim(),
          password: password.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          timeout: 10000,
        },
      );

      const { access_token, user } = response.data;

      if (access_token) {
        await AsyncStorage.setItem("token_seguranca", access_token);
        if (user) {
          await AsyncStorage.setItem("user_seguranca", JSON.stringify(user));
        }
        router.replace("/seguranca/home");
      }
    } catch (error: any) {
      if (error.response) {
        // Erro retornado pelo NestJS (Ex: 401, 404)
        console.log("Erro do Servidor:", error.response.data);
        setMessage(
          `❌ ${error.response.data.message || "Credenciais inválidas"}`,
        );
      } else if (error.request) {
        // Erro de rede (Ngrok fora ou sem internet)
        console.log("Erro de Rede:", error.request);
        setMessage("❌ Sem resposta do servidor. Verifique o Ngrok.");
      } else {
        // Erro genérico
        console.log("Erro de Configuração:", error.message);
        setMessage("❌ Erro ao tentar conectar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <StatusBar style="light" />
        <Stack.Screen options={{ headerShown: false }} />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.card}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="shield-lock"
                size={80}
                color="#a7c080"
              />
            </View>

            <Card.Content>
              <Text variant="headlineSmall" style={styles.title}>
                Portal do Segurança
              </Text>

              <TextInput
                label="Matrícula"
                value={mat}
                onChangeText={setMat}
                mode="outlined"
                activeOutlineColor="#a7c080"
                outlineColor="#4f5b4a"
                style={styles.input}
                textColor="#fff"
                keyboardType="numeric"
                left={<TextInput.Icon icon="account" color="#a7c080" />}
              />

              <TextInput
                label="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                mode="outlined"
                activeOutlineColor="#a7c080"
                outlineColor="#4f5b4a"
                style={styles.input}
                textColor="#fff"
                left={<TextInput.Icon icon="lock" color="#a7c080" />}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.buttonLogin}
                labelStyle={styles.buttonLabel}
              >
                Acessar Painel
              </Button>

              <Button
                mode="text"
                onPress={() => router.replace("/")}
                style={{ marginTop: 15 }}
                textColor="#a7c080"
                icon="chevron-left"
              >
                Voltar
              </Button>

              {message ? (
                <Text
                  style={[
                    styles.message,
                    { color: message.includes("❌") ? "#f87171" : "#a7c080" },
                  ]}
                >
                  {message}
                </Text>
              ) : null}
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2d3629" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    paddingVertical: 20,
    borderRadius: 25,
    backgroundColor: "#3e4a39",
    elevation: 8,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 5,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  input: { marginBottom: 15, backgroundColor: "#2d3629" },
  buttonLogin: {
    marginTop: 10,
    paddingVertical: 5,
    backgroundColor: "#a7c080",
    borderRadius: 12,
  },
  buttonLabel: { fontWeight: "bold", color: "#2d3629" },
  message: { marginTop: 20, textAlign: "center", fontWeight: "600" },
});
