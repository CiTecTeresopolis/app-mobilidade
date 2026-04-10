import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, Divider, IconButton, Menu, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// 1. Interfaces
interface ActionCardProps {
  icon: any;
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
}

const ActionCard = ({
  icon,
  title,
  subtitle,
  onPress,
  color,
}: ActionCardProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={styles.touchable}
  >
    <Card style={styles.actionCard}>
      <Card.Content style={styles.actionCardContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={icon} size={30} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={styles.cardTitle}>
            {title}
          </Text>
          <Text variant="bodySmall" style={styles.cardSubtitle}>
            {subtitle}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#8a9685"
        />
      </Card.Content>
    </Card>
  </TouchableOpacity>
);

const Home = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusAtivo, setStatusAtivo] = useState<boolean | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const API_URL =
    "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api";

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/");
        return;
      }
      const profileRes = await fetch(`${API_URL}/drivers/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!profileRes.ok) throw new Error("Erro ao buscar perfil");
      const profileData = await profileRes.json();
      setUserName(profileData.name);
      setCurrentCity(profileData.address || "Teresópolis");
      setStatusAtivo(profileData.ativo);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const status =
    statusAtivo === true
      ? { text: "Aprovado", color: "#a7c080", icon: "check-circle" }
      : statusAtivo === false
        ? { text: "Em Análise", color: "#f8d7da", icon: "clock-outline" }
        : { text: "Pendente", color: "#8a9685", icon: "alert-circle-outline" };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    setMenuVisible(false);
    await AsyncStorage.removeItem("token");
    router.replace("/");
  };

  const openStoreOrApp = async (
    scheme: string,
    bundleId: string,
    appId: string,
  ) => {
    // URLs das Lojas
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${bundleId}`;
    const appStoreUrl = `https://apps.apple.com/br/app/id${appId}`;

    // Define qual URL de loja usar baseado no sistema
    const storeUrl = Platform.OS === "ios" ? appStoreUrl : playStoreUrl;
    const appUrl = `${scheme}://`;

    try {
      const canOpen = await Linking.canOpenURL(appUrl);

      if (canOpen) {
        await Linking.openURL(appUrl);
      } else {
        await Linking.openURL(storeUrl);
      }
    } catch (err) {
      // Se falhar qualquer verificação, abre a loja
      await Linking.openURL(storeUrl);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {loading ? (
            <ActivityIndicator color="#a7c080" size="small" />
          ) : (
            <>
              <Text variant="headlineSmall" style={styles.welcomeText}>
                Olá, {userName.split(" ")[0] || "Motorista"}
              </Text>
              <Text variant="bodyMedium" style={styles.cityText}>
                {currentCity}
              </Text>
            </>
          )}
        </View>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="menu"
              iconColor="#a7c080"
              size={30}
              onPress={() => setMenuVisible(true)}
            />
          }
          contentStyle={styles.menuContent}
        >
          <Menu.Item
            leadingIcon="account-circle"
            onPress={() => {
              router.push("/motorista/perfil");
              setMenuVisible(false);
            }}
            title="Meu Perfil"
            titleStyle={styles.menuItemText}
          />
          <Divider style={styles.menuDivider} />
          <Menu.Item
            leadingIcon="logout"
            onPress={handleLogout}
            title="Sair"
            titleStyle={[styles.menuItemText, { color: "#ff7675" }]}
          />
        </Menu>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* CARD DE STATUS */}
        <Card style={styles.statsCard}>
          <ImageBackground
            source={require("../../assets/images/logoTere1.jpg")}
            style={styles.statsBackground}
            imageStyle={{ borderRadius: 16, opacity: 0.3 }}
          >
            <View style={styles.statsOverlay}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons
                  name={status.icon as any}
                  size={40}
                  color={status.color}
                />
                <Text
                  variant="headlineSmall"
                  style={[styles.statNumber, { color: status.color }]}
                >
                  {status.text}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Status da Conta
                </Text>
              </View>
            </View>
          </ImageBackground>
        </Card>

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Ações Rápidas
        </Text>

        <View style={styles.actionsGrade}>
          <ActionCard
            icon="car-multiple"
            title="Meus Documentos"
            subtitle={`Verificação: ${status.text}`}
            color={status.color}
            onPress={() => router.push("/motorista/documentos")}
          />
          <ActionCard
            icon="bell"
            title="Notificações"
            subtitle="Verificar avaliações"
            color="#d3e397"
            onPress={() => router.push("/motorista/agenda")}
          />
          <ActionCard
            icon="star-face"
            title="Avaliações"
            subtitle="Verificar avaliações"
            color="#d3e397"
            onPress={() => router.push("/motorista/avaliacao")}
          />
          <ActionCard
            icon="file-document-edit-outline"
            title="Legislação"
            subtitle="Regras e normas"
            color="#d3e397"
            onPress={async () => {
              const url =
                "https://www.teresopolis.rj.gov.br/transparencia/legislacao/";
              if (await Linking.canOpenURL(url)) await Linking.openURL(url);
            }}
          />
        </View>

        <Text
          variant="titleLarge"
          style={[styles.sectionTitle, { marginTop: 25 }]}
        >
          Serviços Adicionais
        </Text>

        <View style={styles.iconButtonsRow}>
          {[
            {
              img: require("../../assets/images/whatsapp.png"),
              onPress: () =>
                openStoreOrApp("whatsapp", "com.whatsapp.app", "310633997"),
            },
            {
              img: require("../../assets/images/digipare.png"),
              onPress: () =>
                openStoreOrApp("digipare", "com.digipare.app", "910964529"),
            },
            {
              img: require("../../assets/images/vai_de_on.png"),
              onPress: () =>
                openStoreOrApp("vai_de_on", "com.VaiDeOn.app", "6464055396"),
            },
            {
              img: require("../../assets/images/logo1.jpg"),

              route: "/contato",
            },
          ].map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.iconButtonContainer}
              onPress={item.onPress}
            >
              <View style={styles.iconCircle}>
                <Image source={item.img} style={styles.externalIcon} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footerBar}>
          <Image
            source={require("../../assets/images/logo1.jpg")}
            style={styles.logoA}
          />
          <Image
            source={require("../../assets/images/logoTere1.jpg")}
            style={styles.logoB}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2d3629" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerLeft: { flex: 1 },
  welcomeText: { color: "#fff", fontWeight: "bold" },
  cityText: { color: "#8a9685" },
  menuContent: { backgroundColor: "#3e4a39", borderRadius: 8, marginTop: 40 },
  menuItemText: { color: "#fff", fontSize: 16 },
  menuDivider: { backgroundColor: "#2d3629" },
  statsCard: { marginVertical: 10, borderRadius: 16, elevation: 4 },
  statsBackground: { width: "100%", height: 160 },
  statsOverlay: {
    flex: 1,
    backgroundColor: "rgba(45, 54, 41, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  statItem: { alignItems: "center" },
  statNumber: { fontWeight: "900" },
  statLabel: { color: "#a7c080", marginTop: 5 },
  sectionTitle: { color: "#fff", marginBottom: 15, fontWeight: "bold" },
  actionsGrade: { gap: 12 },
  touchable: { borderRadius: 12 },
  actionCard: { backgroundColor: "#3e4a39", borderRadius: 12 },
  actionCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  textContainer: { flex: 1 },
  cardTitle: { color: "#fff", fontWeight: "bold" },
  cardSubtitle: { color: "#8a9685" },
  iconButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  iconButtonContainer: { alignItems: "center", width: "22%" },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3e4a39",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  externalIcon: {
    width: 35,
    height: 35,
    resizeMode: "contain",
    // tintColor: "#d3e397" <-- Descomente se quiser forçar uma cor nos ícones
  },
  footerBar: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 10,
    borderRadius: 16,
  },
  logoA: { width: 60, height: 60, resizeMode: "contain" },
  logoB: { width: 120, height: 60, resizeMode: "contain" },
});

export default Home;
