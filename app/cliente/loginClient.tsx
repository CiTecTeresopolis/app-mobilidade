import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Asset } from "expo-asset";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView, // Importado
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

export default function LoginPassageiro() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function prepare() {
      try {
        await Asset.loadAsync(require("../../assets/images/logoLogin.png"));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }
    prepare();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Preencha e-mail e senha ❌");
      return;
    }
    setLoading(true);
    try {
      const urlLogin =
        "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/auth/login";
      const response = await axios.post(
        urlLogin,
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          timeout: 10000,
        },
      );

      const { access_token, user } = response.data;

      // --- NOVA LÓGICA DE BLOQUEIO PARA MOTORISTA ---
      // Pegamos o tipo de serviço vindo do seu AuthService
      const userRole = String(user?.tipo_servico || "").toUpperCase();

      // Se o serviço NÃO for passageiro (ou for especificamente motorista/security)
      if (userRole && userRole !== "PASSAGEIRO") {
        setLoading(false);

        Alert.alert(
          "Acesso Negado ✋",
          "Sua conta está vinculada ao Portal do Motorista. Por favor, utilize o portal de motoristas.",
          [
            {
              text: "Ir para Login Motorista",
              onPress: () => router.replace("/motorista/loginMoto"),
            },
            { text: "Entendido", style: "cancel" },
          ],
        );
        return;
      }

      if (access_token) {
        await AsyncStorage.setItem("token_passageiro", access_token);
        if (user?.name) await AsyncStorage.setItem("user_name", user.name);

        setMessage("Bem-vindo! ✅");
        setTimeout(() => {
          router.replace("/cliente/home" as any);
        }, 500);
      }
    } catch (error: any) {
      setMessage(`❌ ${error.response?.data?.message || "Erro no login"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#a7c080" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        // No iOS o padding empurra o conteúdo, no Android o sistema costuma ajustar sozinho
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        // Ajuste esse valor (80) se os botões ainda ficarem um pouco escondidos
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          // Isso garante que o clique no botão funcione de primeira
          keyboardShouldPersistTaps="handled"
          // Evita que o Scroll "pule" de forma estranha
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.card}>
            <Image
              source={require("../../assets/images/logoLogin.png")}
              style={styles.logo}
              fadeDuration={0}
            />

            <Card.Content>
              <Text variant="headlineSmall" style={styles.title}>
                Portal do Passageiro
              </Text>

              <TextInput
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                activeOutlineColor="#a7c080"
                outlineColor="#4f5b4a"
                style={styles.input}
                textColor="#fff"
                autoCapitalize="none"
                keyboardType="email-address"
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
                Entrar
              </Button>

              <Button
                mode="outlined"
                onPress={() => router.push("/cliente/cadastro" as any)}
                style={styles.buttonRegister}
                textColor="#a7c080"
                disabled={loading}
              >
                Não tenho conta
              </Button>

              <Button
                mode="text"
                onPress={() => router.replace("/")}
                style={{ marginTop: 10 }}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2d3629" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#2d3629",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  card: {
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#3e4a39",
    elevation: 10,
  },
  logo: {
    width: "80%",
    height: 180,
    alignSelf: "center",
    resizeMode: "contain",
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
  buttonRegister: {
    marginTop: 15,
    borderColor: "#a7c080",
    borderWidth: 1.5,
    borderRadius: 12,
  },
  buttonLabel: { fontWeight: "bold", fontSize: 16, color: "#2d3629" },
  message: { marginTop: 20, textAlign: "center", fontWeight: "600" },
});
