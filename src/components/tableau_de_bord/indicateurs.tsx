import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SousOnglet = 'GLOBALE' | 'CATEGORIES';

export function Indicateurs({ comptes, transactions }: { comptes: any[], transactions: any[] }) {
  const [sousOnglet, setSousOnglet] = useState<SousOnglet>('GLOBALE');

  const stats = useMemo(() => {
    let soldeGlobal = 0;
    let soldeHorsEpargne = 0;
    let revenusMois = 0;
    let depensesMois = 0;

    const now = new Date();
    const moisEnCours = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    transactions.forEach(tx => {
      const compte = comptes.find(c => c.id === tx.compte_id);
      if (!compte) return;

      const montant = Number(tx.montant);
      const valeur = tx.sens === 'ENTREE' ? montant : -montant;

      soldeGlobal += valeur;
      if (compte.type !== 'EPARGNE') soldeHorsEpargne += valeur;

      if (tx.date_operation.startsWith(moisEnCours)) {
        if (tx.type_operation === 'REVENU' && tx.sens === 'ENTREE') revenusMois += montant;
        if (tx.type_operation === 'DEPENSE' && tx.sens === 'SORTIE') depensesMois += montant;
      }
    });

    const epargneNette = revenusMois - depensesMois;
    const tauxEpargne = revenusMois > 0 ? (epargneNette / revenusMois) * 100 : 0;
    const nbTransactionsMois = transactions.filter(tx => tx.date_operation.startsWith(moisEnCours)).length;

    return { soldeGlobal, soldeHorsEpargne, revenusMois, depensesMois, epargneNette, tauxEpargne, nbTransactionsMois };
  }, [comptes, transactions]);

  const KpiCard = ({ libelle, valeur, icon, isPositive, isPercentage = false }: any) => (
    <View style={styles.kpiCard}>
      <Ionicons name={icon} size={22} color="#8a93a3" style={styles.kpiIcon} />
      <Text style={styles.kpiLibelle}>{libelle}</Text>
      <Text style={[styles.kpiValeur, isPositive === true && styles.textPositive, isPositive === false && styles.textNegative]}>
        {valeur}{isPercentage ? ' %' : ' €'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Sous-navigation : Globale / Catégories */}
      <View style={styles.sousNav}>
        <TouchableOpacity 
          style={[styles.sousNavBtn, sousOnglet === 'GLOBALE' && styles.sousNavBtnActif]} 
          onPress={() => setSousOnglet('GLOBALE')}
        >
          <Text style={[styles.sousNavTexte, sousOnglet === 'GLOBALE' && styles.sousNavTexteActif]}>Vue globale</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sousNavBtn, sousOnglet === 'CATEGORIES' && styles.sousNavBtnActif]} 
          onPress={() => setSousOnglet('CATEGORIES')}
        >
          <Text style={[styles.sousNavTexte, sousOnglet === 'CATEGORIES' && styles.sousNavTexteActif]}>Catégories</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENU : VUE GLOBALE */}
      {sousOnglet === 'GLOBALE' && (
        <View style={styles.sectionContenu}>
          <View style={styles.kpiGrid}>
            <KpiCard libelle="Solde total" valeur={stats.soldeGlobal.toFixed(2)} icon="wallet-outline" isPositive={stats.soldeGlobal >= 0} />
            <KpiCard libelle="Solde hors épargne" valeur={stats.soldeHorsEpargne.toFixed(2)} icon="home-outline" isPositive={stats.soldeHorsEpargne >= 0} />
            <KpiCard libelle="Revenus ce mois" valeur={stats.revenusMois.toFixed(2)} icon="arrow-down-circle-outline" isPositive={true} />
            <KpiCard libelle="Dépenses ce mois" valeur={stats.depensesMois.toFixed(2)} icon="arrow-up-circle-outline" isPositive={false} />
            <KpiCard libelle="Épargne nette" valeur={stats.epargneNette.toFixed(2)} icon="cash-outline" isPositive={stats.epargneNette >= 0} />
            <KpiCard libelle="Taux d'épargne" valeur={stats.tauxEpargne.toFixed(1)} icon="pie-chart-outline" isPositive={stats.tauxEpargne >= 20 ? true : stats.tauxEpargne < 0 ? false : null} isPercentage={true} />
            <KpiCard libelle="Transactions" valeur={stats.nbTransactionsMois.toString()} icon="swap-horizontal-outline" isPercentage={true} />
          </View>

          <View style={styles.placeholderBox}>
            <Text style={styles.sectionTitle}>Graphiques : Répartition & Évolution</Text>
            <Text style={styles.placeholderText}>(Les graphiques seront intégrés ici prochainement)</Text>
          </View>
        </View>
      )}

      {/* CONTENU : VUE CATÉGORIES */}
      {sousOnglet === 'CATEGORIES' && (
        <View style={styles.sectionContenu}>
          <View style={styles.placeholderBox}>
            <Text style={styles.sectionTitle}>Analyse détaillée par catégorie</Text>
            <Text style={styles.placeholderText}>(Le filtre de dates et les graphiques de répartition Dépenses/Revenus viendront ici)</Text>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sousNav: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  sousNavBtn: { backgroundColor: '#171a21', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#262b36' },
  sousNavBtnActif: { backgroundColor: '#c08a2d', borderColor: '#c08a2d' },
  sousNavTexte: { color: '#8a93a3', fontSize: 13, fontWeight: '500' },
  sousNavTexteActif: { color: '#ffffff', fontWeight: 'bold' },
  sectionContenu: { gap: 20 },
  
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  kpiCard: { backgroundColor: '#171a21', padding: 18, borderRadius: 12, borderWidth: 1, borderColor: '#262b36', flex: 1, minWidth: 190 },
  kpiIcon: { position: 'absolute', top: 14, right: 14, opacity: 0.5 },
  kpiLibelle: { fontSize: 11, color: '#8a93a3', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8, fontWeight: '500' },
  kpiValeur: { fontSize: 22, fontWeight: 'bold', color: '#e8edf4' },
  textPositive: { color: '#10b981' },
  textNegative: { color: '#ef4444' },
  
  sectionTitle: { color: '#e8edf4', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  placeholderBox: { backgroundColor: '#171a21', padding: 40, borderRadius: 12, borderWidth: 1, borderColor: '#262b36', alignItems: 'center' },
  placeholderText: { color: '#8a93a3', fontStyle: 'italic', textAlign: 'center' }
});