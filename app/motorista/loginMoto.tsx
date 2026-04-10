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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";

export default function LoginMoto() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false); // Novo: controle de carregamento inicial
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Pré-carregamento da logo
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
      setMessage("Preencha todos os campos ❌");
      return;
    }

    setLoading(true);
    setMessage("Autenticando... ⏳");

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
          timeout: 15000,
        },
      );

      const { access_token, user } = response.data;
      console.log("DADOS DO USUARIO RECEBIDOS:", user);

      // Pegamos o valor e garantimos que ele exista antes de comparar
      const userRole = user?.tipo_servico || user?.role;

      // Usamos .toUpperCase() para comparar sem erro de letras grandes ou pequenas
      if (userRole && userRole.toUpperCase() === "PASSAGEIRO") {
        setLoading(false);
        setMessage("");

        Alert.alert(
          "Acesso Restrito ✋",
          "Identificamos que sua conta é de Passageiro. Por favor, utilize o portal correto.",
          [
            {
              text: "Ir para Login Passageiro",
              onPress: () => router.replace("/cliente/loginClient"),
            },
            {
              text: "Ok",
              style: "cancel",
            },
          ],
        );
        return; // Bloqueia o acesso
      }

      if (access_token) {
        await AsyncStorage.setItem("token", access_token);
        if (user) await AsyncStorage.setItem("user_data", JSON.stringify(user));

        setMessage("Sucesso! Bem-vindo ✅");
        setTimeout(() => {
          setLoading(false);
          router.replace("/motorista/home");
        }, 800);
      }
    } catch (error: any) {
      setLoading(false);
      if (error.response) {
        const apiMessage = error.response.data.message;
        setMessage(
          `❌ ${Array.isArray(apiMessage) ? apiMessage[0] : apiMessage || "Credenciais inválidas"}`,
        );
      } else {
        setMessage("❌ Sem resposta do servidor.");
      }
    }
  };

  // Enquanto carrega a imagem, mostra loading centralizado
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#a7c080" />
      </View>
    );
  }

  return (
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
            <Image
              source={require("../../assets/images/logoLogin.png")}
              style={styles.logo}
              fadeDuration={0}
            />

            <Card.Content>
              <Text variant="headlineSmall" style={styles.title}>
                Portal do Motorista
              </Text>

              <TextInput
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                mode="outlined"
                activeOutlineColor="#a7c080"
                outlineColor="#4f5b4a"
                style={styles.input}
                textColor="#fff"
                autoCapitalize="none"
                left={<TextInput.Icon icon="email" color="#a7c080" />}
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
                {loading ? "Entrando..." : "Entrar"}
              </Button>

              <Button
                mode="outlined"
                onPress={() => router.push("/motorista/cadastro" as any)}
                style={styles.buttonRegister}
                textColor="#a7c080"
                disabled={loading}
              >
                Não tenho conta
              </Button>

              <Button
                mode="text"
                onPress={() => router.replace("/")}
                style={styles.buttonBack}
                textColor="#a7c080"
                icon="arrow-left"
                disabled={loading}
              >
                Voltar ao Início
              </Button>

              {message ? (
                <Text
                  style={[
                    styles.message,
                    { color: message.includes("❌") ? "#f87171" : "#d3e397" },
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
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: "#3e4a39",
    elevation: 8,
  },
  logo: {
    width: "80%",
    height: 180,
    alignSelf: "center",
    resizeMode: "contain",
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
    paddingVertical: 6,
    backgroundColor: "#a7c080",
    borderRadius: 12,
  },
  buttonRegister: {
    marginTop: 15,
    borderColor: "#a7c080",
    borderWidth: 1.5,
    borderRadius: 12,
  },
  buttonBack: { marginTop: 15, alignSelf: "center" },
  buttonLabel: { fontWeight: "bold", fontSize: 16, color: "#2d3629" },
  message: {
    marginTop: 25,
    textAlign: "center",
    fontWeight: "600",
  },
});
