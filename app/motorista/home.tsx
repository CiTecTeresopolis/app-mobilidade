import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
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
import {
  Badge,
  Card,
  Divider,
  IconButton,
  Menu,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// 1. Interfaces
interface ActionCardProps {
  icon: keyof typeof MaterialCommunityIcons.hasIcon | string;
  title: string;
  subtitle: string;
  onPress: () => void;
  color: string;
  badgeCount?: number;
}

const ActionCard = ({
  icon,
  title,
  subtitle,
  onPress,
  color,
  badgeCount,
}: ActionCardProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={styles.touchable}
  >
    <Card style={styles.actionCard}>
      <Card.Content style={styles.actionCardContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <MaterialCommunityIcons name={icon as any} size={30} color={color} />
          {badgeCount !== undefined && badgeCount > 0 && (
            <Badge style={styles.badgeStyle} size={18}>
              {badgeCount}
            </Badge>
          )}
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
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [driverId, setDriverId] = useState<string | null>(null);

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
      setUserName(profileData.name || "Motorista");
      setCurrentCity(profileData.address || "Teresópolis");
      setStatusAtivo(profileData.ativo);
      setDriverId(profileData.id);

      // Busca contagem de notificações não lidas
      const notifyRes = await fetch(
        `${API_URL}/auth/notifications/unread-count/${profileData.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );

      if (notifyRes.ok) {
        const notifyData = await notifyRes.json();
        setUnreadNotifications(notifyData.count || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, []),
  );

  const handlePressNotifications = async () => {
    // 1. ZERA O CONTADOR VISUALMENTE NA HORA
    // Isso faz o badge sumir antes mesmo de falar com o servidor
    setUnreadNotifications(0);

    try {
      const token = await AsyncStorage.getItem("token");

      // 2. Tenta pegar o ID do motorista (seja do estado ou do storage)
      const idAtual = driverId || (await AsyncStorage.getItem("userId"));

      if (idAtual && token) {
        // 3. Chamada para o banco (usamos await aqui para garantir o processo)
        const response = await fetch(
          `${API_URL}/auth/notifications/read-all/${idAtual}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          },
        );

        const resData = await response.json();
        console.log("Resposta do servidor:", resData);
      }
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
    }

    // 4. Navega para a tela de agenda
    router.push("/motorista/agenda");
  };

  const getStatusConfig = () => {
    if (statusAtivo === true) {
      return { text: "Aprovado", color: "#a7c080", icon: "check-circle" };
    } else if (statusAtivo === false) {
      return { text: "Em Análise", color: "#f8d7da", icon: "clock-outline" };
    } else {
      return {
        text: "Pendente",
        color: "#8a9685",
        icon: "alert-circle-outline",
      };
    }
  };

  const status = getStatusConfig();

  const handleLogout = async () => {
    setMenuVisible(false);
    await AsyncStorage.multiRemove(["token", "user_seguranca"]);
    router.replace("/");
  };

  const openStoreOrApp = async (
    scheme: string,
    bundleId: string,
    appId: string,
  ) => {
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${bundleId}`;
    const appStoreUrl = `https://apps.apple.com/br/app/id${appId}`;
    const storeUrl = Platform.OS === "ios" ? appStoreUrl : playStoreUrl;
    const appUrl = `${scheme}://`;

    try {
      const canOpen = await Linking.canOpenURL(appUrl);
      if (canOpen) await Linking.openURL(appUrl);
      else await Linking.openURL(storeUrl);
    } catch (err) {
      await Linking.openURL(storeUrl);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text variant="headlineSmall" style={styles.welcomeText}>
            Olá, {loading ? "..." : userName.split(" ")[0]}
          </Text>
          <Text variant="bodyMedium" style={styles.cityText}>
            {loading ? "Carregando..." : currentCity}
          </Text>
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
              setMenuVisible(false);
              router.push("/motorista/perfil");
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.statsCard}>
          <ImageBackground
            source={require("../../assets/images/logoTere1.jpg")}
            style={styles.statsBackground}
            imageStyle={{ borderRadius: 16, opacity: 0.15 }}
          >
            <View style={styles.statsOverlay}>
              {loading ? (
                <ActivityIndicator color="#a7c080" />
              ) : (
                <View style={styles.statItem}>
                  <MaterialCommunityIcons
                    name={status.icon as any}
                    size={44}
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
              )}
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
            icon="bell-outline"
            title="Notificações"
            subtitle={
              unreadNotifications > 0
                ? `Você tem ${unreadNotifications} novas`
                : "Alertas do sistema"
            }
            color="#d3e397"
            badgeCount={unreadNotifications}
            onPress={() => {
              console.log("Cliquei!");
              setUnreadNotifications(0);
              handlePressNotifications();
            }}
          />
          <ActionCard
            icon="star-face"
            title="Avaliações"
            subtitle="Notas dos passageiros"
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
              await Linking.openURL(url);
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
              onPress: () => {
                const url = "https://wa.me/5521972088235";
                Linking.openURL(url).catch((err) =>
                  console.error("Erro ao abrir o WhatsApp", err),
                );
              },
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
            source={require("../../assets/images/logo-guarda.png")}
            style={styles.logoA}
          />
          <Image
            source={require("../../assets/images/logo-smct.png")}
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
  statsCard: {
    marginVertical: 10,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: "#3e4a39",
  },
  statsBackground: { width: "100%", height: 160 },
  statsOverlay: {
    flex: 1,
    backgroundColor: "rgba(45, 54, 41, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  statItem: { alignItems: "center" },
  statNumber: { fontWeight: "900", marginTop: 5 },
  statLabel: { color: "#a7c080", marginTop: 2 },
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
    position: "relative",
  },
  badgeStyle: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff7675",
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
  externalIcon: { width: 35, height: 35, resizeMode: "contain" },
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
  logoA: { width: 100, height: 100, resizeMode: "contain" },
  logoB: { width: 100, height: 100, resizeMode: "contain" },
});

export default Home;
