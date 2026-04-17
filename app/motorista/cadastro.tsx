import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Card, Menu, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Cadastro() {
  const router = useRouter();

  // Estados dos campos
  const [name, setName] = useState("");
  const [cnh, setCnh] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [placa, setPlaca] = useState("");
  const [modelo, setModelo] = useState("");

  // Estados do Seletor
  const [tipoServico, setTipoServico] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false); // Novo estado de loading

  const tipos = ["Uber", "Táxi", "Moto", "Van", "Mudança"];

  // Lógica para Esqueci Minha Senha
  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("Digite seu e-mail para recuperar a senha! 📧");
      return;
    }

    setForgotLoading(true);
    setMessage("");

    try {
      await axios.post(
        "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/auth/reset-password",
        { email: email.trim().toLowerCase() },
        {
          headers: { "ngrok-skip-browser-warning": "true" },
        },
      );
      Alert.alert(
        "Sucesso",
        "E-mail de recuperação enviado! Verifique sua caixa de entrada. 🚀",
      );
    } catch (error: any) {
      const serverMessage =
        error.response?.data?.message || "Erro ao solicitar recuperação";
      setMessage(`❌ ${serverMessage}`);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async () => {
    // 1. Validação de Campos Vazios
    if (
      !name ||
      !email ||
      !password ||
      !cnh ||
      !tipoServico ||
      !placa ||
      !modelo
    ) {
      setMessage("Preencha todos os campos! ❌");
      return;
    }

    // 2. Validação de Nome Completo
    const nomeLimpo = name.trim();
    if (nomeLimpo.split(/\s+/).length < 2) {
      setMessage("Digite seu nome completo (Nome e Sobrenome) 👤");
      return;
    }

    // 3. Validação de CNH
    const cnhLimpa = cnh.trim();
    const cnhRegex = /^\d{11}$/;
    const cnhRepetida = /^(\d)\1{10}$/.test(cnhLimpa);

    if (!cnhRegex.test(cnhLimpa) || cnhRepetida) {
      setMessage("CNH inválida! Digite os 11 números corretamente. 🪪");
      return;
    }

    // 4. Validação de Placa
    const placaLimpa = placa.toUpperCase().replace("-", "").trim();
    const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    if (!placaRegex.test(placaLimpa)) {
      setMessage("Placa do veículo inválida! 🚗");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/auth/register",
        {
          email: email.trim().toLowerCase(),
          password,
          name: nomeLimpo,
          cnh: cnhLimpa,
          tipo_servico: tipoServico,
          placa: placaLimpa,
          veiculo_modelo: modelo.trim(),
        },
        {
          timeout: 12000,
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      setMessage("Cadastro realizado! Verifique seu e-mail para confirmar. 🚀");
      setTimeout(() => router.replace("/"), 3000);
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
            Criar Conta
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Cadastre seu veículo no TereMobilidade
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            {/* ... (campos de Nome, CNH, Modelo, Placa e Tipo de Serviço permanecem iguais) ... */}

            <TextInput
              label="Nome Completo"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="flat"
              textColor="#fff"
              activeUnderlineColor="#a7c080"
              theme={{
                colors: { onSurfaceVariant: "#ffffff96", primary: "#a7c080" },
              }}
            />

            <TextInput
              label="CNH (11 dígitos)"
              value={cnh}
              onChangeText={(txt) => setCnh(txt.replace(/[^0-9]/g, ""))}
              style={styles.input}
              mode="flat"
              textColor="#fff"
              maxLength={11}
              keyboardType="numeric"
              activeUnderlineColor="#a7c080"
              theme={{
                colors: { onSurfaceVariant: "#ffffff96", primary: "#a7c080" },
              }}
            />

            <TextInput
              label="Modelo do Veículo"
              value={modelo}
              onChangeText={setModelo}
              style={styles.input}
              mode="flat"
              textColor="#fff"
              placeholder="Ex: Fiat Uno"
              activeUnderlineColor="#a7c080"
              theme={{
                colors: { onSurfaceVariant: "#ffffff96", primary: "#a7c080" },
              }}
            />

            <TextInput
              label="Placa"
              value={placa}
              onChangeText={(txt) => setPlaca(txt.toUpperCase())}
              style={styles.input}
              mode="flat"
              textColor="#fff"
              placeholder="ABC-1234"
              maxLength={8}
              activeUnderlineColor="#a7c080"
              theme={{
                colors: { onSurfaceVariant: "#ffffff96", primary: "#a7c080" },
              }}
            />

            <View style={styles.menuContainer}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setMenuVisible(true)}
                    style={styles.dropdownTrigger}
                  >
                    <View pointerEvents="none">
                      <TextInput
                        label="Tipo de Serviço"
                        value={tipoServico}
                        mode="flat"
                        textColor="#fff"
                        activeUnderlineColor="#a7c080"
                        theme={{
                          colors: {
                            onSurfaceVariant: "#ffffff96",
                            primary: "#a7c080",
                          },
                        }}
                        right={
                          <TextInput.Icon
                            icon={menuVisible ? "chevron-up" : "chevron-down"}
                            color="#a7c080"
                          />
                        }
                        style={{ backgroundColor: "transparent" }}
                      />
                    </View>
                  </TouchableOpacity>
                }
                contentStyle={styles.menuContent}
              >
                {tipos.map((item) => (
                  <Menu.Item
                    key={item}
                    onPress={() => {
                      setTipoServico(item);
                      setMenuVisible(false);
                    }}
                    title={item}
                    titleStyle={{ color: "#fff" }}
                  />
                ))}
              </Menu>
            </View>

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              mode="flat"
              textColor="#fff"
              keyboardType="email-address"
              autoCapitalize="none"
              activeUnderlineColor="#a7c080"
              theme={{
                colors: { onSurfaceVariant: "#ffffff96", primary: "#a7c080" },
              }}
            />

            <TextInput
              label="Senha"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="flat"
              textColor="#fff"
              secureTextEntry
              activeUnderlineColor="#a7c080"
              theme={{
                colors: { onSurfaceVariant: "#ffffff96", primary: "#a7c080" },
              }}
            />

            {/* BOTÃO ESQUECI MINHA SENHA */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              disabled={forgotLoading}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>
                {forgotLoading ? "Enviando..." : "Esqueci minha senha"}
              </Text>
            </TouchableOpacity>

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
              Finalizar Cadastro
            </Button>
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
  menuContainer: { marginBottom: 10 },
  dropdownTrigger: { width: "100%" },
  menuContent: { backgroundColor: "#3e4a39", marginTop: 50 },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 10,
    marginTop: -5,
  },
  forgotPasswordText: {
    color: "#a7c080",
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  submitButton: {
    marginTop: 15,
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
});
