import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#2d3629" },
        }}
      >
        {/* Removido as referências manuais para evitar o erro de rota inexistente */}
        <Stack.Screen name="index" />
      </Stack>
    </PaperProvider>
  );
}
