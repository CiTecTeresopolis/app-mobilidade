import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { ActivityIndicator, Avatar, Card, Text } from "react-native-paper";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type: string;
}

export default function Agenda() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(
        "https://seu-ngrok-aqui.dev/api/api/auth/notifications",
        { headers: { Authorization: `Bearer ${token}` } },
      );
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

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return "alert";
      case "important":
        return "bell-alert";
      default:
        return "information";
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <Card style={styles.card}>
      <Card.Title
        title={item.title}
        subtitle={new Date(item.created_at).toLocaleDateString("pt-BR")}
        left={(props: any) => (
          <Avatar.Icon
            {...props}
            icon={getIcon(item.type)}
            color="white"
            style={[
              props.style,
              {
                backgroundColor:
                  item.type === "important" ? "#f87171" : "#a7c080",
              },
            ]}
          />
        )}
      />
      <Card.Content>
        <Text variant="bodyMedium" style={styles.messageText}>
          {item.message}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Notificações",
          headerTintColor: "#fff",
          headerStyle: { backgroundColor: "#2d3629" },
        }}
      />

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#a7c080" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchNotifications();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Nenhuma notificação por enquanto. 📭
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#2d3629" },
  list: { padding: 15 },
  card: { marginBottom: 15, backgroundColor: "#3e4a39", borderRadius: 12 },
  messageText: { color: "#e0e0e0", marginTop: 5 },
  empty: { marginTop: 50, alignItems: "center" },
  emptyText: { color: "#a7c080", opacity: 0.6 },
});
