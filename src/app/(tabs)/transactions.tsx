import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, ScrollView, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

import { NouvelleTransactionForm, TransactionsRecentesTable, TypeTx } from '@/components/transactions/nouvelle-transaction';
import { PlanificationsFiltres, PlanificationsTable } from '@/components/transactions/planifications';

// Générateur d'UUID v4 pour les groupes de transfert Supabase
const generateUUID = () => {
  let dt = new Date().getTime();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = (dt + Math.random()*16)%16 | 0;
    dt = Math.floor(dt/16);
    return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
  });
};

export default function TransactionsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;

  const [comptes, setComptes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sousCategories, setSousCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const [modeSaisie, setModeSaisie] = useState<'NOUVELLE' | 'PLANIFIEE'>('NOUVELLE');
  const [typeTx, setTypeTx] = useState<TypeTx>('DEPENSE');
  
  const [filtresRecents, setFiltresRecents] = useState({ compteId: '', categorieId: '', sousCategorieId: '', libelle: '' });
  const [filtresPlanif, setFiltresPlanif] = useState({ type: '' as TypeTx | '', dateDebut: '', dateFin: '', compte: '', categorie: '', sousCategorie: '', libelle: '' });

  useEffect(() => { chargerDonnees(); }, []);

  async function chargerDonnees() {
    try {
      const [resComptes, resCategories, resSousCat, resTransactions] = await Promise.all([
        supabase.from('comptes').select('*').eq('actif', true).order('nom'),
        supabase.from('categories').select('*').order('nom'),
        supabase.from('sous_categories').select('*').order('nom'),
        supabase.from('transactions').select('*').order('date_operation', { ascending: false })
      ]);
      if (resComptes.data) setComptes(resComptes.data);
      if (resCategories.data) setCategories(resCategories.data);
      if (resSousCat.data) setSousCategories(resSousCat.data);
      if (resTransactions.data) setTransactions(resTransactions.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données.');
    }
  }

  // --- CALCUL DES SOLDES RÉELS ---
  const etatsComptes = useMemo(() => {
    return comptes.map(c => {
      let soldeActuel = 0;
      transactions.forEach(tx => {
        if (tx.compte_id === c.id) {
          soldeActuel += (tx.sens === 'ENTREE' ? Number(tx.montant) : -Number(tx.montant));
        }
      });
      return { ...c, actuel: soldeActuel, previsionnel: soldeActuel };
    });
  }, [comptes, transactions]);

  // --- ENREGISTREMENT AVEC CONTRÔLE DE DÉCOUVERT ---
  const handleSaveTransaction = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const montantSaisi = Math.abs(Number(data.montant));
      if (!montantSaisi || isNaN(montantSaisi)) {
        return Alert.alert('Erreur', 'Le montant est invalide.');
      }

      // VÉRIFICATION DÉCOUVERT
      if (data.typeTx === 'DEPENSE' || data.typeTx === 'TRANSFERT') {
        const compteIdConcerne = data.typeTx === 'TRANSFERT' ? data.compteSourceId : data.compteId;
        const compteInfo = etatsComptes.find(c => c.id === compteIdConcerne);
        if (compteInfo && compteInfo.decouvert_autorise === false) {
          if ((compteInfo.actuel - montantSaisi) < 0) {
            return Alert.alert('Refusé', `Le solde du compte "${compteInfo.nom}" ne permet pas ce découvert.`);
          }
        }
      }

      if (data.typeTx === 'TRANSFERT') {
        if (!data.compteSourceId || !data.compteCibleId) return Alert.alert('Erreur', 'Sélectionnez les deux comptes.');
        
        const groupeId = generateUUID(); // Format UUID valide exigé par Supabase

        const { error } = await supabase.from('transactions').insert([
          { user_id: user.id, type_operation: 'TRANSFERT', sens: 'SORTIE', montant: montantSaisi, compte_id: data.compteSourceId, groupe_id: groupeId, date_operation: data.date, libelle: data.libelle, note: data.note },
          { user_id: user.id, type_operation: 'TRANSFERT', sens: 'ENTREE', montant: montantSaisi, compte_id: data.compteCibleId, groupe_id: groupeId, date_operation: data.date, libelle: data.libelle, note: data.note }
        ]);
        if (error) throw error;
      } else {
        if (!data.compteId) return Alert.alert('Erreur', 'Sélectionnez un compte.');
        const { error } = await supabase.from('transactions').insert([{
          user_id: user.id,
          type_operation: data.typeTx,
          sens: data.typeTx === 'REVENU' ? 'ENTREE' : 'SORTIE',
          montant: montantSaisi,
          compte_id: data.compteId,
          categorie_id: data.categorieId || null,
          sous_categorie_id: data.sousCategorieId || null,
          date_operation: data.date,
          libelle: data.libelle,
          note: data.note
        }]);
        if (error) throw error;
      }

      Alert.alert('Succès', 'Transaction enregistrée !');
      chargerDonnees();
    } catch (err: any) {
      Alert.alert('Erreur serveur', err.message);
    }
  };

  const comptesCourants = etatsComptes.filter(c => c.type !== 'EPARGNE');
  const comptesEpargne = etatsComptes.filter(c => c.type === 'EPARGNE');
  const totauxComptes = etatsComptes.reduce((acc, c) => {
    if (c.type === 'EPARGNE') acc.epargne.actuel += c.actuel;
    else acc.courant.actuel += c.actuel;
    return acc;
  }, { courant: { actuel: 0 }, epargne: { actuel: 0 } });

  const donneesTableau = useMemo(() => {
    if (modeSaisie === 'NOUVELLE') {
      const txEnrichies = transactions.map(tx => ({
        ...tx,
        nomCompte: comptes.find(c => c.id === tx.compte_id)?.nom || '',
        nomCategorie: categories.find(c => c.id === tx.categorie_id)?.nom || '',
      }));

      return txEnrichies.filter(tx => 
        (filtresRecents.libelle === '' || (tx.libelle && tx.libelle.toLowerCase().includes(filtresRecents.libelle.toLowerCase()))) &&
        (filtresRecents.compteId === '' || tx.compte_id === filtresRecents.compteId) &&
        (filtresRecents.categorieId === '' || tx.categorie_id === filtresRecents.categorieId) &&
        (filtresRecents.sousCategorieId === '' || tx.sous_categorie_id === filtresRecents.sousCategorieId)
      ).slice(0, 15);
    } else {
      return []; // Mocks des planifications vides
    }
  }, [modeSaisie, transactions, filtresRecents, comptes, categories]);

  const getFormBackground = () => {
    const activeType = modeSaisie === 'NOUVELLE' ? typeTx : filtresPlanif.type;
    if (activeType === 'DEPENSE') return '#2a1a1c';
    if (activeType === 'REVENU') return '#1a261e';
    if (activeType === 'TRANSFERT') return '#1a202c';
    return '#171a21';
  };

  const LeftColumn = () => (
    <View style={[styles.leftColumn, isDesktop && { flex: 1 }]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, modeSaisie === 'NOUVELLE' && styles.tabActive]} onPress={() => setModeSaisie('NOUVELLE')}>
          <Text style={[styles.tabText, modeSaisie === 'NOUVELLE' && styles.tabTextActive]}>Nouvelle Transaction</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, modeSaisie === 'PLANIFIEE' && styles.tabActive]} onPress={() => setModeSaisie('PLANIFIEE')}>
          <Text style={[styles.tabText, modeSaisie === 'PLANIFIEE' && styles.tabTextActive]}>Transactions planifiées</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.formCard, { backgroundColor: getFormBackground() }]}>
        <Text style={styles.sectionTitle}>{modeSaisie === 'NOUVELLE' ? 'Saisir une opération' : 'Filtres de planification'}</Text>
        {modeSaisie === 'NOUVELLE' ? (
          <NouvelleTransactionForm typeTx={typeTx} setTypeTx={setTypeTx} comptes={comptes} categories={categories} sousCategories={sousCategories} onSave={handleSaveTransaction} />
        ) : (
          <PlanificationsFiltres filtres={filtresPlanif} setFiltres={setFiltresPlanif} comptes={comptes} categories={categories} sousCategories={sousCategories} />
        )}
      </View>
    </View>
  );

  const RightColumn = () => (
    <View style={[styles.rightColumn, isDesktop && { flex: 1.8 }]}>
      <View style={styles.card}>
        <View style={styles.balanceHeader}>
          <Text style={styles.sectionTitle}>État des comptes</Text>
        </View>
        <View style={isDesktop ? styles.threeColumnsContainer : styles.mobileScrollContent}>
          <View style={isDesktop && styles.balanceCol}>
            <Text style={styles.colTitle}>Comptes Courants</Text>
            {comptesCourants.map(solde => (
              <View key={solde.id} style={styles.compactBalanceRow}>
                <Text style={styles.accountName} numberOfLines={1}>{solde.nom}</Text>
                <View style={styles.balanceValues}><Text style={[styles.currentBalance, solde.actuel < 0 && {color: '#ef4444'}]}>{solde.actuel.toFixed(2)} €</Text></View>
              </View>
            ))}
          </View>
          <View style={[isDesktop && styles.balanceCol, isDesktop && styles.middleCol]}>
            <Text style={styles.colTitle}>Épargne</Text>
            {comptesEpargne.map(solde => (
              <View key={solde.id} style={styles.compactBalanceRow}>
                <Text style={styles.accountName} numberOfLines={1}>{solde.nom}</Text>
                <View style={styles.balanceValues}><Text style={styles.currentBalance}>{solde.actuel.toFixed(2)} €</Text></View>
              </View>
            ))}
          </View>
          <View style={isDesktop && styles.balanceCol}>
             <Text style={styles.colTitle}>Totaux</Text>
             <View style={styles.compactBalanceRow}>
                <Text style={styles.summaryLabel}>Courants</Text>
                <View style={styles.balanceValues}><Text style={[styles.summaryCurrent, totauxComptes.courant.actuel < 0 && {color: '#ef4444'}]}>{totauxComptes.courant.actuel.toFixed(2)} €</Text></View>
              </View>
              <View style={styles.compactBalanceRow}>
                <Text style={styles.summaryLabel}>Épargne</Text>
                <View style={styles.balanceValues}><Text style={styles.summaryCurrent}>{totauxComptes.epargne.actuel.toFixed(2)} €</Text></View>
              </View>
          </View>
        </View>
      </View>

      <View style={[styles.card, { flex: 1 }]}>
        {modeSaisie === 'NOUVELLE' ? (
          <TransactionsRecentesTable donnees={donneesTableau} filtres={filtresRecents} setFiltres={setFiltresRecents} comptes={comptes} categories={categories} sousCategories={sousCategories} />
        ) : (
          <PlanificationsTable donnees={donneesTableau} comptes={comptes} categories={categories} sousCategories={sousCategories} />
        )}
      </View>
    </View>
  );

  return (
    <>
      {!isDesktop ? (
        <ScrollView style={styles.container} contentContainerStyle={styles.mobileScrollContent}>
          <LeftColumn /><View style={styles.mobileDivider} /><RightColumn />
        </ScrollView>
      ) : (
        <View style={[styles.container, styles.containerDesktop]}><LeftColumn /><RightColumn /></View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1115', padding: 15, paddingTop: 5 },
  containerDesktop: { flexDirection: 'row', gap: 20 },
  mobileScrollContent: { gap: 20, paddingBottom: 30 },
  mobileDivider: { height: 1, backgroundColor: '#262b36', marginVertical: 10 },
  leftColumn: { gap: 10 },
  rightColumn: { gap: 15 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#171a21', borderRadius: 8, padding: 4, borderWidth: 1, borderColor: '#262b36' },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  tabActive: { backgroundColor: '#262b36' },
  tabText: { color: '#8a93a3', fontWeight: '600', fontSize: 12 },
  tabTextActive: { color: '#e8edf4' },
  card: { backgroundColor: '#171a21', borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#262b36' },
  formCard: { borderRadius: 12, padding: 15, borderWidth: 1, borderColor: '#262b36', flex: 1 },
  sectionTitle: { color: '#e8edf4', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  threeColumnsContainer: { flexDirection: 'row', gap: 15 },
  balanceCol: { flex: 1 },
  middleCol: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#262b36', paddingHorizontal: 15 },
  colTitle: { color: '#8a93a3', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 },
  compactBalanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#262b36' },
  accountName: { color: '#e8edf4', fontSize: 12, fontWeight: '500', flex: 1, paddingRight: 5 },
  balanceValues: { alignItems: 'flex-end', flexShrink: 0 },
  currentBalance: { color: '#e8edf4', fontSize: 12, fontWeight: 'bold' },
  summaryLabel: { color: '#c08a2d', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', flex: 1 },
  summaryCurrent: { color: '#c08a2d', fontSize: 13, fontWeight: 'bold' },
});