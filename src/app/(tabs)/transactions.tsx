import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, useWindowDimensions, TextInput } from 'react-native';

export default function TransactionsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 800; // Point de bascule pour l'affichage côte à côte

  // État pour basculer entre la nouvelle transaction et les planifications
  const [modeSaisie, setModeSaisie] = useState<'NOUVELLE' | 'PLANIFIEE'>('NOUVELLE');
  const [recherche, setRecherche] = useState('');

  // Données fictives pour la structure (seront remplacées par Supabase)
  const soldesMocks = [
    { id: '1', nom: 'Boursorama', actuel: 1250.00, previsionnel: 850.00 },
    { id: '2', nom: 'Livret A', actuel: 5000.00, previsionnel: 5200.00 },
  ];

  const transactionsRecentesMocks = [
    { id: '1', libelle: 'Courses', montant: -45.50, date: '2026-10-18' },
    { id: '2', libelle: 'Salaire', montant: 2500.00, date: '2026-10-15' },
  ];

  const planificationsMocks = [
    { id: '1', libelle: 'Loyer', montant: -800.00, datePrevue: '2026-11-01' },
    { id: '2', libelle: 'Abonnement Internet', montant: -39.99, datePrevue: '2026-10-25' },
  ];

  // Sélection des données du tableau selon le mode
  const donneesTableau = modeSaisie === 'NOUVELLE' ? transactionsRecentesMocks : planificationsMocks;

  return (
    <View style={[styles.container, isDesktop && styles.containerDesktop]}>
      
      {/* ==========================================
          COLONNE GAUCHE : ZONE DE SAISIE
          ========================================== */}
      <View style={[styles.leftColumn, isDesktop && { flex: 1 }]}>
        
        {/* Navigation interne (Onglets) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, modeSaisie === 'NOUVELLE' && styles.tabActive]}
            onPress={() => setModeSaisie('NOUVELLE')}
          >
            <Text style={[styles.tabText, modeSaisie === 'NOUVELLE' && styles.tabTextActive]}>
              Nouvelle Transaction
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, modeSaisie === 'PLANIFIEE' && styles.tabActive]}
            onPress={() => setModeSaisie('PLANIFIEE')}
          >
            <Text style={[styles.tabText, modeSaisie === 'PLANIFIEE' && styles.tabTextActive]}>
              Planifier
            </Text>
          </TouchableOpacity>
        </View>

        {/* Zone de formulaire */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>
            {modeSaisie === 'NOUVELLE' ? 'Saisir une opération' : 'Créer une planification'}
          </Text>
          <Text style={styles.placeholderText}>
            (Le formulaire viendra ici à la prochaine étape)
          </Text>
        </View>
      </View>


      {/* ==========================================
          COLONNE DROITE : SOLDES ET LISTES
          ========================================== */}
      <View style={[styles.rightColumn, isDesktop && { flex: 1.5 }]}>
        
        {/* En-tête des Soldes */}
        <View style={styles.card}>
          <View style={styles.balanceHeader}>
            <Text style={styles.sectionTitle}>État des comptes</Text>
            <Text style={styles.projectionDate}>Proj. ciblée : Fin du mois</Text>
          </View>
          
          {soldesMocks.map(solde => (
            <View key={solde.id} style={styles.balanceRow}>
              <Text style={styles.accountName}>{solde.nom}</Text>
              <View style={styles.balanceValues}>
                <Text style={styles.currentBalance}>{solde.actuel.toFixed(2)} €</Text>
                <Text style={styles.projectedBalance}>→ {solde.previsionnel.toFixed(2)} €</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tableau contextuel */}
        <View style={[styles.card, { flex: 1 }]}>
          <View style={styles.tableHeader}>
            <Text style={styles.sectionTitle}>
              {modeSaisie === 'NOUVELLE' ? '10 Dernières Transactions' : 'À venir (Non soldé)'}
            </Text>
            <TextInput 
              style={styles.searchInput} 
              placeholder="Filtrer..." 
              placeholderTextColor="#8a93a3"
              value={recherche}
              onChangeText={setRecherche}
            />
          </View>

          <FlatList
            data={donneesTableau}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.transactionRow}>
                <Text style={styles.txDate}>{'date' in item ? item.date : item.datePrevue}</Text>
                <Text style={styles.txLibelle}>{item.libelle}</Text>
                <Text style={[styles.txMontant, item.montant < 0 ? styles.txNegative : styles.txPositive]}>
                  {item.montant > 0 ? '+' : ''}{item.montant.toFixed(2)} €
                </Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.placeholderText}>Aucune donnée.</Text>}
          />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
    padding: 15,
    gap: 20,
  },
  containerDesktop: {
    flexDirection: 'row',
  },
  leftColumn: {
    gap: 15,
  },
  rightColumn: {
    gap: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#171a21',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: '#262b36',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#262b36',
  },
  tabText: {
    color: '#8a93a3',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#e8edf4',
  },
  card: {
    backgroundColor: '#171a21',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262b36',
  },
  formCard: {
    backgroundColor: '#171a21',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#262b36',
    minHeight: 400,
    justifyContent: 'center',
  },
  sectionTitle: {
    color: '#e8edf4',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  placeholderText: {
    color: '#8a93a3',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectionDate: {
    color: '#c08a2d',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#262b36',
  },
  accountName: {
    color: '#e8edf4',
    fontSize: 16,
  },
  balanceValues: {
    alignItems: 'flex-end',
  },
  currentBalance: {
    color: '#e8edf4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectedBalance: {
    color: '#8a93a3',
    fontSize: 12,
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#0f1115',
    color: '#e8edf4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#262b36',
    width: 150,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262b36',
  },
  txDate: {
    color: '#8a93a3',
    fontSize: 12,
    width: 80,
  },
  txLibelle: {
    color: '#e8edf4',
    flex: 1,
    fontSize: 14,
  },
  txMontant: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  txPositive: {
    color: '#10b981',
  },
  txNegative: {
    color: '#e8edf4',
  },
});
