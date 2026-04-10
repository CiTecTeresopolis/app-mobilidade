import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* LOGO E BOAS-VINDAS */}
        <View style={styles.logoSection}>
          <MaterialCommunityIcons
            name="car-connected"
            size={80}
            color="#a7c080"
          />
          <Text variant="headlineMedium" style={styles.title}>
            Teresópolis Mobilidade
          </Text>
          <Text style={styles.subtitle}>
            Escolha como deseja continuar no aplicativo
          </Text>
        </View>

        {/* BOTÕES DE SELEÇÃO */}
        <View style={styles.buttonSection}>
          <Button
            mode="contained"
            icon="account-group"
            onPress={() => router.push("/cliente/loginClient" as any)}
            style={styles.btnPassageiro}
            labelStyle={styles.btnLabelDark}
            contentStyle={styles.btnContent}
          >
            Sou Passageiro
          </Button>

          <View style={styles.spacer} />

          <Button
            mode="outlined"
            icon="steering"
            onPress={() => router.push("/motorista/loginMoto" as any)}
            style={styles.btnMotorista}
            labelStyle={styles.btnLabelLight}
            contentStyle={styles.btnContent}
          >
            Sou Motorista
          </Button>

          <View style={styles.spacer} />

          <Button
            mode="outlined"
            icon="shield-check"
            onPress={() => router.push("/seguranca/loginSeg" as any)}
            style={styles.btnSeguranca}
            labelStyle={styles.btnLabelLight}
            contentStyle={styles.btnContent}
          >
            Sou Segurança
          </Button>
        </View>

        <Text style={styles.footerText}>Teresópolis • Mobilidade Urbana</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2d3629",
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: "space-around",
    alignItems: "center",
  },
  logoSection: {
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    marginTop: 10,
  },
  subtitle: {
    color: "#a7c080",
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  buttonSection: {
    width: "100%",
  },
  btnPassageiro: {
    backgroundColor: "#a7c080",
    borderRadius: 15,
    elevation: 4,
  },
  btnMotorista: {
    borderColor: "#a7c080",
    borderWidth: 2,
    borderRadius: 15,
  },
  // Estilo para o botão de segurança
  btnSeguranca: {
    borderColor: "#a7c080",
    borderWidth: 2,
    borderRadius: 15,
    borderStyle: "dashed", // Um detalhe visual para diferenciar do motorista, opcional
  },
  btnContent: {
    height: 60,
  },
  btnLabelDark: {
    color: "#2d3629",
    fontWeight: "bold",
    fontSize: 16,
  },
  btnLabelLight: {
    color: "#a7c080",
    fontWeight: "bold",
    fontSize: 16,
  },
  spacer: {
    height: 20,
  },
  footerText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
