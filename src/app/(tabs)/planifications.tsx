import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Données de test (on les remplacera par de vraies données plus tard) ──
const COMPTES = [
  { nom: "BNP", solde: 10, type: "Courant" },
  { nom: "Bourso+", solde: 248, type: "Courant" },
  { nom: "Boursorama", solde: -70, type: "Courant" },
  { nom: "Test Épargne", solde: 700, type: "Épargne" },
];

const SOLDE_TOTAL = COMPTES.reduce((sum, c) => sum + c.solde, 0);

const MOIS_COURANT = "Mai 2026";

// ── Composant carte de compte ────────────────────────────────────────────────
function CarteCompte({
  nom,
  solde,
  type,
}: {
  nom: string;
  solde: number;
  type: string;
}) {
  const positif = solde >= 0;
  return (
    <ThemedView type="backgroundElement" style={styles.carteCompte}>
      <ThemedText type="small" style={styles.compteType}>
        {type}
      </ThemedText>
      <ThemedText type="defaultSemiBold">{nom}</ThemedText>
      <ThemedText
        type="defaultSemiBold"
        style={[
          styles.soldeMontant,
          { color: positif ? "#10b981" : "#ef4444" },
        ]}
      >
        {positif ? "+" : ""}
        {solde.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
      </ThemedText>
    </ThemedView>
  );
}

// ── Composant KPI ────────────────────────────────────────────────────────────
function KpiCard({
  label,
  valeur,
  couleur,
}: {
  label: string;
  valeur: string;
  couleur?: string;
}) {
  return (
    <ThemedView type="backgroundElement" style={styles.kpiCard}>
      <ThemedText type="small" style={styles.kpiLabel}>
        {label}
      </ThemedText>
      <ThemedText
        type="defaultSemiBold"
        style={[styles.kpiValeur, couleur ? { color: couleur } : {}]}
      >
        {valeur}
      </ThemedText>
    </ThemedView>
  );
}

// ── Écran principal ──────────────────────────────────────────────────────────
export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1, width: "100%" }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* En-tête */}
          <View style={styles.header}>
            <View>
              <ThemedText type="small" style={styles.sousTitre}>
                Mon Budget
              </ThemedText>
              <ThemedText type="title">Tableau de bord</ThemedText>
              <ThemedText type="small" style={styles.periode}>
                Données au {MOIS_COURANT}
              </ThemedText>
            </View>
          </View>

          {/* Solde total */}
          <ThemedView type="backgroundElement" style={styles.soldeTotalBloc}>
            <ThemedText type="small" style={styles.kpiLabel}>
              SOLDE TOTAL
            </ThemedText>
            <ThemedText
              type="title"
              style={{ color: SOLDE_TOTAL >= 0 ? "#10b981" : "#ef4444" }}
            >
              {SOLDE_TOTAL.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
              })}{" "}
              €
            </ThemedText>
          </ThemedView>

          {/* KPIs du mois */}
          <ThemedText type="defaultSemiBold" style={styles.sectionTitre}>
            Ce mois-ci
          </ThemedText>
          <View style={styles.kpiGrille}>
            <KpiCard label="REVENUS" valeur="0,00 €" couleur="#10b981" />
            <KpiCard label="DÉPENSES" valeur="0,00 €" couleur="#ef4444" />
            <KpiCard label="ÉPARGNE" valeur="0,00 €" couleur="#2563eb" />
            <KpiCard label="TAUX" valeur="0,0 %" />
          </View>

          {/* Soldes par compte */}
          <ThemedText type="defaultSemiBold" style={styles.sectionTitre}>
            Comptes
          </ThemedText>
          <View style={styles.comptesGrille}>
            {COMPTES.map((c) => (
              <CarteCompte key={c.nom} {...c} />
            ))}
          </View>

          {/* Bouton nouvelle transaction */}
          <TouchableOpacity style={styles.btnTransaction} activeOpacity={0.8}>
            <ThemedText type="defaultSemiBold" style={styles.btnTexte}>
              + Nouvelle transaction
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.four, gap: Spacing.three, paddingBottom: 40 },
  header: { marginBottom: Spacing.two },
  sousTitre: { opacity: 0.6, marginBottom: 2 },
  periode: { opacity: 0.5, marginTop: 4 },
  soldeTotalBloc: {
    borderRadius: 16,
    padding: Spacing.four,
    alignItems: "center",
    gap: 6,
  },
  sectionTitre: {
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
    opacity: 0.7,
  },
  kpiGrille: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  kpiCard: {
    borderRadius: 12,
    padding: Spacing.three,
    flex: 1,
    minWidth: "45%",
    gap: 4,
  },
  kpiLabel: { opacity: 0.6, fontSize: 10, letterSpacing: 0.5 },
  kpiValeur: { fontSize: 18, fontWeight: "700" },
  comptesGrille: { gap: Spacing.two },
  carteCompte: {
    borderRadius: 12,
    padding: Spacing.three,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compteType: { opacity: 0.5, fontSize: 10 },
  soldeMontant: { fontSize: 16, fontWeight: "700" },
  btnTransaction: {
    backgroundColor: "#b45309",
    borderRadius: 12,
    padding: Spacing.three,
    alignItems: "center",
    marginTop: Spacing.three,
  },
  btnTexte: { color: "white", fontSize: 15 },
});
