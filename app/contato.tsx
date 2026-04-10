import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContatoScreen() {
  const router = useRouter();
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSendEmail = () => {
    if (!assunto || !mensagem) {
      return Alert.alert("Ops!", "Por favor, preencha o assunto e a mensagem.");
    }
    setEnviando(true);
    // Simulação de envio
    setTimeout(() => {
      setEnviando(false);
      Alert.alert("Sucesso!", "Sua mensagem foi enviada para a central.");
      setAssunto("");
      setMensagem("");
    }, 1500);
  };

  const openWhatsApp = () => {
    const url =
      "whatsapp://send?phone=5524999999999&text=Olá, sou motorista do TereMobilidade e preciso de ajuda.";
    Linking.openURL(url).catch(() =>
      Alert.alert("Erro", "WhatsApp não instalado."),
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER PADRÃO */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#a7c080" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            Central de Ajuda
          </Text>
          <Text variant="bodySmall" style={styles.headerSubtitle}>
            Suporte ao Motorista
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* CANAIS RÁPIDOS */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Atendimento Rápido
        </Text>
        <View style={styles.row}>
          <Card style={styles.contactCard} onPress={openWhatsApp}>
            <Card.Content style={styles.center}>
              <MaterialCommunityIcons
                name="whatsapp"
                size={32}
                color="#25D366"
              />
              <Text style={styles.cardText}>WhatsApp</Text>
            </Card.Content>
          </Card>

          <Card
            style={styles.contactCard}
            onPress={() => Linking.openURL("tel:0800123456")}
          >
            <Card.Content style={styles.center}>
              <MaterialCommunityIcons name="phone" size={32} color="#a7c080" />
              <Text style={styles.cardText}>0800</Text>
            </Card.Content>
          </Card>
        </View>

        {/* FORMULÁRIO */}
        <Card style={styles.formCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.formTitle}>
              Envie sua dúvida
            </Text>

            <TextInput
              label="Assunto"
              value={assunto}
              onChangeText={setAssunto}
              mode="flat"
              textColor="#fff"
              activeUnderlineColor="#a7c080"
              style={styles.input}
              placeholderTextColor="#8a9685"
            />

            <TextInput
              label="Mensagem"
              value={mensagem}
              onChangeText={setMensagem}
              mode="flat"
              multiline
              numberOfLines={5}
              textColor="#fff"
              activeUnderlineColor="#a7c080"
              style={[styles.input, { height: 120 }]}
            />

            <Button
              mode="contained"
              onPress={handleSendEmail}
              loading={enviando}
              disabled={enviando}
              style={styles.sendButton}
              labelStyle={styles.sendButtonLabel}
            >
              Enviar Mensagem
            </Button>
          </Card.Content>
        </Card>

        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>
            Horário de atendimento: 08h às 18h
          </Text>
          <Text style={styles.footerText}>Secretaria de Mobilidade Urbana</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2d3629" },
  scroll: { padding: 20 },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#3e4a39",
  },
  headerTitleContainer: { alignItems: "center" },
  headerTitle: { color: "#fff", fontWeight: "bold" },
  headerSubtitle: {
    color: "#a7c080",
    fontSize: 10,
    textTransform: "uppercase",
  },

  sectionTitle: { color: "#fff", marginBottom: 15, fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  contactCard: {
    backgroundColor: "#3e4a39",
    width: "48%",
    borderRadius: 15,
  },
  center: { alignItems: "center", gap: 8 },
  cardText: { color: "#fff", fontWeight: "500" },

  formCard: {
    backgroundColor: "#3e4a39",
    borderRadius: 15,
    paddingVertical: 10,
  },
  formTitle: { color: "#a7c080", marginBottom: 15, fontWeight: "bold" },
  input: {
    backgroundColor: "transparent",
    marginBottom: 15,
  },
  sendButton: {
    backgroundColor: "#a7c080",
    marginTop: 10,
    borderRadius: 8,
  },
  sendButtonLabel: { color: "#2d3629", fontWeight: "bold" },
  footerInfo: { marginTop: 30, alignItems: "center" },
  footerText: { color: "#8a9685", fontSize: 12, marginBottom: 5 },
});
