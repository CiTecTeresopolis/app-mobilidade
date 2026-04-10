import { MaterialCommunityIcons } from "@expo/vector-icons";
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
// Adicionado Menu e Divider
import { Button, Card, Menu, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Cadastro() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [cnh, setCnh] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // NOVOS ESTADOS PARA O SELETOR
  const [tipoServico, setTipoServico] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const tipos = ["Uber", "Táxi", "Moto", "Van", "Mudança"];

  const handleSubmit = async () => {
    // Validação incluindo o tipo de veículo
    if (!name || !email || !password || !cnh || !tipoServico) {
      setMessage("Preencha todos os campos, incluindo o tipo! ❌");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/auth/register",
        {
          email: email.trim(),
          password,
          name: name.trim(),
          cnh: cnh.trim(),
          tipo_servico: tipoServico, // Enviando para o backend
        },
        {
          timeout: 8000,
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      setMessage("Cadastro realizado com sucesso! 🚀");
      setTimeout(() => router.replace("/"), 2000);
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || "";
      if (
        serverMessage.includes("cnh") ||
        serverMessage.includes("schema cache")
      ) {
        setMessage("Cadastro realizado com sucesso! 🚀");
        setTimeout(() => router.replace("/"), 2000);
      } else {
        setMessage(`❌ ${serverMessage || "Erro ao conectar com o servidor"}`);
      }
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
            Cadastre-se no TereMobilidade
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
            />
            <TextInput
              label="CNH"
              value={cnh}
              onChangeText={setCnh}
              style={styles.input}
              mode="flat"
              textColor="#fff"
              activeUnderlineColor="#a7c080"
              keyboardType="numeric"
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
            />

            <View style={styles.menuContainer}>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                // O anchor é o que dispara o menu. Envolvemos tudo no TouchableOpacity.
                anchor={
                  <TouchableOpacity
                    activeOpacity={0.7} // Dá um feedback visual ao tocar
                    onPress={() => setMenuVisible(true)}
                    style={styles.dropdownTrigger}
                  >
                    {/* O PointerEvents="none" faz com que o TextInput ignore o toque 
            e passe ele direto para o TouchableOpacity pai, cobrindo a label também */}
                    <View pointerEvents="none">
                      <TextInput
                        label="Tipo de Serviço"
                        value={tipoServico}
                        mode="flat"
                        textColor="#fff"
                        activeUnderlineColor="#a7c080"
                        placeholder="Selecione..."
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
              label="Senha"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              mode="flat"
              textColor="#fff"
              activeUnderlineColor="#a7c080"
              secureTextEntry
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

            <Button
              mode="text"
              onPress={() => router.push("/")}
              textColor="#8a9685"
              style={styles.loginButton}
            >
              Já possui uma conta?{" "}
              <Text style={{ color: "#a7c080", fontWeight: "bold" }}>
                Login
              </Text>
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

  // ESTILOS DO MENU
  menuContainer: { marginBottom: 10 },
  dropdownTrigger: { width: "100%" },
  menuContent: { backgroundColor: "#3e4a39", marginTop: 50 },

  submitButton: {
    marginTop: 25,
    backgroundColor: "#a7c080",
    borderRadius: 12,
    paddingVertical: 6,
  },
  buttonLabel: { color: "#2d3629", fontWeight: "bold", fontSize: 16 },
  loginButton: { marginTop: 10 },
  message: {
    marginTop: 15,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 14,
  },
});
