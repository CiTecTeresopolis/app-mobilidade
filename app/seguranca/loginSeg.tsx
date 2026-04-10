import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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
      await AsyncStorage.clear();

      const urlLogin =
        "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/auth/login-seguranca";

      const response = await axios.post(
        urlLogin,
        {
          matricula: mat.trim(),
          password: password.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: "",
            "Cache-Control": "no-cache",
          },
          timeout: 10000,
        },
      );

      const { access_token, user } = response.data;

      if (access_token) {
        await AsyncStorage.setItem("token_seguranca", access_token);
        if (user)
          await AsyncStorage.setItem("user_seguranca", JSON.stringify(user));

        router.replace("/seguranca/home");
      }
    } catch (error: any) {
      console.log("Erro capturado:", error.response?.data);
      setMessage(
        `❌ ${error.response?.data?.message || "Matrícula ou senha incorretos"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // KeyboardAvoidingView garante que o teclado não cubra o conteúdo
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <View style={styles.container}>
        <StatusBar style="light" />
        <Stack.Screen options={{ headerShown: false }} />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="shield-lock"
                size={100}
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
                autoCapitalize="none"
                left={<TextInput.Icon icon="account" color="#a7c080" />}
                theme={{ colors: { surfaceVariant: "#3e4a39" } }}
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
                theme={{ colors: { surfaceVariant: "#3e4a39" } }}
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
                style={{ marginTop: 20 }}
                textColor="#a7c080"
                icon="chevron-left"
              >
                Voltar ao Início
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

          <Text style={styles.versionText}>
            Acesso Restrito - TereMobilidade v1.0
          </Text>
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
    // Espaço extra no fundo para garantir visibilidade total no scroll com teclado
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  card: {
    paddingVertical: 20,
    borderRadius: 25,
    backgroundColor: "#3e4a39",
    elevation: 10,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    marginBottom: 25,
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
  buttonLabel: { fontWeight: "bold", fontSize: 16, color: "#2d3629" },
  message: { marginTop: 20, textAlign: "center", fontWeight: "600" },
  versionText: {
    marginTop: 30,
    textAlign: "center",
    color: "rgba(255,255,255,0.2)",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
