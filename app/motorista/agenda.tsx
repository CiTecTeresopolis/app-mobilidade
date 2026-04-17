import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Card,
  Surface,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type: string;
}

const API_URL =
  "https://pilgrimatic-nita-scenographically.ngrok-free.dev/api/auth";

export default function Agenda() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(`${API_URL}/notifications/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      setNotifications(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const renderItem = ({ item }: { item: Notification }) => (
    <Surface style={styles.surface} elevation={1}>
      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Avatar.Icon
            size={36}
            icon={item.type === "REJECTION" ? "alert-octagon" : "information"}
            style={{
              backgroundColor:
                item.type === "REJECTION" ? "#f87171" : "#a7c080",
            }}
            color="white"
          />
          <View style={styles.headerTextContent}>
            <Text variant="titleMedium" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="labelSmall" style={styles.subtitle}>
              {new Date(item.created_at).toLocaleDateString("pt-BR")}
            </Text>
          </View>
        </View>
        <Card.Content style={{ paddingBottom: 15 }}>
          <Text style={styles.messageText}>{item.message}</Text>
        </Card.Content>
      </Card>
    </Surface>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#2d3629" />

      {/* Remove o header nativo do Expo Router */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.mainContainer}>
        {/* BOTÃO DE VOLTAR IGUAL À TELA DE DOCUMENTOS */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonCustom}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#a7c080" />
        </TouchableOpacity>

        <View style={styles.titleSection}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Notificações
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator color="#a7c080" size="large" />
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchNotifications();
                }}
                tintColor="#a7c080"
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhuma notificação encontrada.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2d3629",
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  // ESTILO EXATO DO BOTÃO DA TELA DE DOCUMENTOS
  backButtonCustom: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#3e4a39",
    width: 50,
    marginBottom: 10,
  },
  titleSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
  },
  listContent: {
    paddingBottom: 40,
  },
  surface: {
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "transparent",
  },
  card: {
    backgroundColor: "#3e4a39",
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
  },
  headerTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  title: { color: "#ffffff", fontWeight: "bold" },
  subtitle: { color: "#a7c080", opacity: 0.7 },
  messageText: { color: "#e0e0e0", lineHeight: 20 },
  emptyText: {
    color: "#a7c080",
    textAlign: "center",
    marginTop: 50,
    opacity: 0.6,
  },
});
