import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Menu, Text, TextInput } from "react-native-paper"; // Adicionado Menu e Divider
import { SafeAreaView } from "react-native-safe-area-context";

export default function CadastroPassageiro() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para o Dropdown (Lista Suspensa)
  const [visible, setVisible] = useState(false);
  const [servico, setServico] = useState("Passageiro");

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSubmit = async () => {
    // 1. Validação de Campos Vazios
    if (!name || !email || !password || !servico) {
      setMessage("Preencha todos os campos! ❌");
      return;
    }

    // 2. Validação de Nome Completo (Verifica se há pelo menos um espaço entre palavras)
    const nameTrimmed = name.trim();
    const nameParts = nameTrimmed.split(" ");
    if (nameParts.length < 2 || nameParts[1].length < 1) {
      setMessage("Por favor, digite seu nome completo. ❌");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/auth/register-passenger",
        {
          email: email.trim(),
          password,
          name: nameTrimmed,
          servico: servico.toLowerCase(),
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      // 3. Mensagem orientando sobre o E-mail de Verificação
      setMessage("Sucesso! Verifique seu e-mail para ativar a conta. 📧🚀");

      // Opcional: Limpar campos após sucesso
      setName("");
      setEmail("");
      setPassword("");

      // Navega para o login após um tempo maior para o usuário ler o aviso do e-mail
      setTimeout(() => router.replace("/cliente/loginClient"), 4000);
    } catch (error: any) {
      const serverMessage =
        error.response?.data?.message || "Erro ao conectar com o servidor";
      setMessage(`❌ ${serverMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#a7c080"
            />
          </TouchableOpacity>
          <Image
            source={require("../../assets/images/logoLogin.png")}
            style={styles.logo}
          />
        </View>

        <View style={styles.titleSection}>
          <Text variant="headlineSmall" style={styles.title}>
            Criar Conta Passageiro
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Rápido, fácil e seguro.
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Nome Completo"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="flat"
              textColor="#fff"
              activeUnderlineColor="#a7c080"
              theme={{
                colors: {
                  onSurfaceVariant: "#ffffff96",
                  primary: "#a7c080",
                },
              }}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="flat"
              textColor="#fff"
              activeUnderlineColor="#a7c080"
              keyboardType="email-address"
              autoCapitalize="none"
              theme={{
                colors: {
                  onSurfaceVariant: "#ffffff96",
                  primary: "#a7c080",
                },
              }}
            />

            <View style={styles.dropdownContainer}>
              <Menu
                visible={visible}
                onDismiss={closeMenu}
                anchor={
                  <TouchableOpacity
                    onPress={openMenu}
                    style={styles.dropdownTrigger}
                  >
                    <TextInput
                      label="Tipo de Serviço"
                      value={servico}
                      editable={false} // Impede digitação, funciona apenas como botão
                      mode="flat"
                      style={styles.input}
                      textColor="#fff"
                      activeUnderlineColor="#a7c080"
                      theme={{
                        colors: {
                          onSurfaceVariant: "#ffffff96",
                          primary: "#a7c080",
                        },
                      }}
                      right={
                        <TextInput.Icon icon="chevron-down" color="#a7c080" />
                      }
                    />
                  </TouchableOpacity>
                }
                contentStyle={{ backgroundColor: "#3e4a39" }}
              >
                <Menu.Item
                  onPress={() => {
                    setServico("Passageiro");
                    closeMenu();
                  }}
                  title="Passageiro"
                  titleStyle={{ color: "#fff" }}
                />
                {/* Você pode adicionar outros itens aqui se quiser expandir no futuro */}
              </Menu>
            </View>

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="flat"
              textColor="#fff"
              activeUnderlineColor="#a7c080"
              secureTextEntry
              theme={{
                colors: {
                  onSurfaceVariant: "#ffffff96",
                  primary: "#a7c080",
                },
              }}
            />

            {message ? (
              <Text
                style={[
                  styles.message,
                  { color: message.includes("❌") ? "#ff7675" : "#a7c080" },
                ]}
              >
                {message}
              </Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              labelStyle={styles.buttonLabel}
            >
              {loading ? "Cadastrando..." : "Finalizar Cadastro"}
            </Button>

            <TouchableOpacity
              onPress={() => router.push("/cliente/loginClient" as any)}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                Já possui uma conta?{" "}
                <Text style={styles.loginHighlight}>Login</Text>
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2d3629" },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
    padding: 8,
    backgroundColor: "#3e4a39",
    borderRadius: 12,
  },
  logo: { width: 120, height: 60, resizeMode: "contain" },
  titleSection: { alignItems: "center", marginBottom: 25 },
  title: { color: "#fff", fontWeight: "bold" },
  subtitle: { color: "#8a9685", marginTop: 5 },
  card: {
    backgroundColor: "#3e4a39",
    borderRadius: 20,
    elevation: 4,
    paddingVertical: 10,
  },
  input: { marginBottom: 10, backgroundColor: "transparent" },
  dropdownContainer: { marginBottom: 5 },
  dropdownTrigger: { width: "100%" },
  submitButton: {
    marginTop: 25,
    backgroundColor: "#a7c080",
    borderRadius: 12,
    paddingVertical: 6,
  },
  buttonLabel: { color: "#2d3629", fontWeight: "bold", fontSize: 16 },
  message: {
    marginTop: 15,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
  },
  loginLink: { marginTop: 20, alignItems: "center" },
  loginText: { color: "#8a9685" },
  loginHighlight: { color: "#a7c080", fontWeight: "bold" },
});
