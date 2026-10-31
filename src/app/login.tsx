import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { seConnecter, sInscrire } from "@/services/auth";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [modeInscription, setModeInscription] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");

  async function soumettre() {
    if (!email || !motDePasse) {
      setErreur("Email et mot de passe requis.");
      return;
    }
    setChargement(true);
    setErreur("");
    try {
      if (modeInscription) {
        await sInscrire(email, motDePasse);
        setErreur("Compte créé ! Vérifie ton email pour confirmer.");
      } else {
        await seConnecter(email, motDePasse);
        // La redirection est gérée automatiquement par NavigationGuard
      }
    } catch (e: any) {
      setErreur(e.message ?? "Une erreur est survenue.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.inner}
        >
          <View style={styles.header}>
            <ThemedText type="title">💰 Mon Budget</ThemedText>
            <ThemedText type="small" style={styles.sous}>
              {modeInscription ? "Créer un compte" : "Connexion"}
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              placeholderTextColor="#888"
              value={motDePasse}
              onChangeText={setMotDePasse}
              secureTextEntry
              autoComplete="password"
            />

            {erreur !== "" && (
              <ThemedText style={styles.erreur}>{erreur}</ThemedText>
            )}

            <TouchableOpacity
              style={styles.bouton}
              onPress={soumettre}
              disabled={chargement}
              activeOpacity={0.8}
            >
              {chargement ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.boutonTexte}>
                  {modeInscription ? "Créer le compte" : "Se connecter"}
                </ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>

          <TouchableOpacity
            onPress={() => {
              setModeInscription(!modeInscription);
              setErreur("");
            }}
          >
            <ThemedText type="small" style={styles.lienMode}>
              {modeInscription
                ? "Déjà un compte ? Se connecter"
                : "Pas encore de compte ? Créer un compte"}
            </ThemedText>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: { alignItems: "center", gap: Spacing.two },
  sous: { opacity: 0.6 },
  form: { borderRadius: 16, padding: Spacing.four, gap: Spacing.three },
  input: {
    backgroundColor: "rgba(128,128,128,0.15)",
    borderRadius: 10,
    padding: Spacing.three,
    fontSize: 15,
    color: "white",
  },
  erreur: { color: "#ef4444", fontSize: 13, textAlign: "center" },
  bouton: {
    backgroundColor: "#b45309",
    borderRadius: 10,
    padding: Spacing.three,
    alignItems: "center",
  },
  boutonTexte: { color: "white", fontWeight: "700", fontSize: 15 },
  lienMode: { textAlign: "center", opacity: 0.6 },
});
