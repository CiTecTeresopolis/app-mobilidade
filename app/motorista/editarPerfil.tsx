import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Menu, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditarPerfilScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [modelo, setModelo] = useState("");
  const [placa, setPlaca] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoServico, setTipoServico] = useState("Uber");

  // Estado para o Menu (Lista Suspensa)
  const [menuVisible, setMenuVisible] = useState(false);
  const tipos = ["Uber", "Táxi", "Moto", "Van", "Mudança"];

  useEffect(() => {
    const carregarDadosAtuais = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await axios.get(
          "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/drivers/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          },
        );

        const { name, modelo, placa, email, categoria } = response.data;
        setNome(name || "");
        setModelo(modelo || "");
        setPlaca(placa || "");
        setEmail(email || "");
        setTipoServico(categoria || "Uber");
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar seus dados.");
      } finally {
        setLoading(false);
      }
    };

    carregarDadosAtuais();
  }, []);

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const dadosUpdate = {
        name: nome,
        modelo: modelo,
        placa: placa.toUpperCase(),
        email: email,
        categoria: tipoServico,
        ...(senha ? { password: senha } : {}),
      };

      await axios.put(
        "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/auth/drivers/update",
        dadosUpdate,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true", // Garante que a requisição passe pelo Ngrok
          },
        },
      );

      // Mensagem personalizada avisando sobre a reanálise
      Alert.alert(
        "Perfil Atualizado",
        "Seus dados foram salvos. Como houve alteração, seu perfil passará por uma nova análise da equipe TeresópolisMobilidade.",
        [
          {
            text: "Entendi",
          },
        ], // Redireciona para a tela de espera
      );
    } catch (error: any) {
      console.error("Erro no update:", error.response?.data || error.message);
      Alert.alert("Erro", "Falha ao atualizar perfil.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#a7c080" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="close" size={28} color="#a7c080" />
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.headerTitle}>
          Editar Dados
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.warningBox}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={24}
          color="#f1c40f"
        />
        <View style={styles.warningTextContent}>
          <Text style={styles.warningTitle}>Atenção!</Text>
          <Text style={styles.warningText}>
            Ao alterar seus dados cadastrais, seu perfil voltará para o status{" "}
            <Text style={{ fontWeight: "bold", color: "#f1c40f" }}>
              PENDENTE
            </Text>{" "}
            para uma nova análise da prefeitura.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          {/* LISTA SUSPENSA DE TIPO DE SERVIÇO */}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <View style={{ pointerEvents: "none" }}>
                  <TextInput
                    label="Tipo de Serviço"
                    value={tipoServico}
                    mode="outlined"
                    outlineColor="#3e4a39"
                    activeOutlineColor="#a7c080"
                    textColor="#fff"
                    style={styles.input}
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
                  />
                </View>
              </TouchableOpacity>
            }
            contentStyle={{ backgroundColor: "#3e4a39" }}
          >
            {tipos.map((t) => (
              <Menu.Item
                key={t}
                onPress={() => {
                  setTipoServico(t);
                  setMenuVisible(false);
                }}
                title={t}
                titleStyle={{ color: "#fff" }}
              />
            ))}
          </Menu>

          <TextInput
            label="Nome Completo"
            value={nome}
            onChangeText={setNome}
            mode="outlined"
            outlineColor="#3e4a39"
            activeOutlineColor="#a7c080"
            textColor="#fff"
            style={styles.input}
          />

          <TextInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            outlineColor="#3e4a39"
            activeOutlineColor="#a7c080"
            textColor="#fff"
            style={styles.input}
            keyboardType="email-address"
          />

          <TextInput
            label="Nova Senha (deixe em branco para manter)"
            value={senha}
            onChangeText={setSenha}
            mode="outlined"
            outlineColor="#3e4a39"
            activeOutlineColor="#a7c080"
            textColor="#fff"
            style={styles.input}
            secureTextEntry
          />

          <TextInput
            label="Modelo do Veículo"
            value={modelo}
            onChangeText={setModelo}
            mode="outlined"
            outlineColor="#3e4a39"
            activeOutlineColor="#a7c080"
            textColor="#fff"
            style={styles.input}
          />

          <TextInput
            label="Placa"
            value={placa}
            onChangeText={setPlaca}
            mode="outlined"
            outlineColor="#3e4a39"
            activeOutlineColor="#a7c080"
            textColor="#fff"
            style={styles.input}
            autoCapitalize="characters"
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSalvar}
          loading={salvando}
          style={styles.saveBtn}
          buttonColor="#a7c080"
          textColor="#2d3629"
        >
          Salvar Alterações
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2d3629" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: { padding: 8, borderRadius: 12, backgroundColor: "#3e4a39" },
  headerTitle: { color: "#fff", fontWeight: "bold" },
  content: { padding: 20 },
  form: { marginBottom: 30 },
  input: {
    backgroundColor: "#2d3629",
    marginBottom: 15,
  },
  saveBtn: {
    borderRadius: 10,
    marginTop: 10,
    height: 50,
    justifyContent: "center",
  },
  warningBox: {
    flexDirection: "row",
    backgroundColor: "rgba(241, 196, 15, 0.1)", // Amarelo bem suave
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(241, 196, 15, 0.3)",
    alignItems: "center",
  },
  warningTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  warningTitle: {
    color: "#f1c40f",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
  },
  warningText: {
    color: "#fff",
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.9,
  },
});
