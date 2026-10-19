import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Indicateurs } from '@/components/tableau_de_bord/indicateurs';
import { Historique } from '@/components/tableau_de_bord/historique';

type OngletPrincipal = 'INDICATEURS' | 'HISTORIQUE' | 'SIMULATION';

export default function TableauDeBordScreen() {
  const [ongletActif, setOngletActif] = useState<OngletPrincipal>('INDICATEURS');
  const [loading, setLoading] = useState(true);
  
  const [comptes, setComptes] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sousCategories, setSousCategories] = useState<any[]>([]);

  useEffect(() => {
    chargerDonnees();
  }, []);

  async function chargerDonnees() {
    setLoading(true);
    try {
      const [resComptes, resTx, resCat, resSousCat] = await Promise.all([
        supabase.from('comptes').select('*').eq('actif', true),
        supabase.from('transactions').select('*').order('date_operation', { ascending: false }),
        supabase.from('categories').select('*'),
        supabase.from('sous_categories').select('*')
      ]);

      setComptes(resComptes.data || []);
      setTransactions(resTx.data || []);
      setCategories(resCat.data || []);
      setSousCategories(resSousCat.data || []);
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de charger le tableau de bord.');
    } finally {
      setLoading(false);
    }
  }

  // --- LOGIQUE DE MODIFICATION ---
  const handleEditTransaction = async (txModifiee: any) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          date_operation: txModifiee.date_operation,
          libelle: txModifiee.libelle,
          montant: Math.abs(Number(txModifiee.montant)),
          compte_id: txModifiee.compte_id
        })
        .eq('id', txModifiee.id);

      if (error) throw error;
      Alert.alert('Succès', 'Transaction modifiée.');
      chargerDonnees();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  // --- LOGIQUE DE SUPPRESSION ET RÉTRO-PLANIFICATION ---
  const handleDeleteTransaction = async (tx: any) => {
    try {
      // 1. Supprimer la transaction (ou les deux si c'est un transfert lié par groupe_id)
      if (tx.type_operation === 'TRANSFERT' && tx.groupe_id) {
        await supabase.from('transactions').delete().eq('groupe_id', tx.groupe_id);
      } else {
        await supabase.from('transactions').delete().eq('id', tx.id);
      }

      // 2. Règle métier : Si c'était issu d'une planification, on la remet "A_FAIRE"
      // Note: Assurez-vous d'avoir une colonne 'occurrence_id' dans votre table transactions
      if (tx.occurrence_id) {
        await supabase
          .from('occurrences_planifiees')
          .update({ statut: 'A_FAIRE' })
          .eq('id', tx.occurrence_id);
      }

      Alert.alert('Succès', 'Transaction supprimée.');
      chargerDonnees();
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Tableau de bord</Text>
        <Text style={styles.indication}>Données au {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</Text>
      </View>

      <View style={styles.navPrincipale}>
        <TouchableOpacity style={[styles.navBtn, ongletActif === 'INDICATEURS' && styles.navBtnActif]} onPress={() => setOngletActif('INDICATEURS')}>
          <Text style={[styles.navBtnTexte, ongletActif === 'INDICATEURS' && styles.navBtnTexteActif]}>📊 Indicateurs</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, ongletActif === 'HISTORIQUE' && styles.navBtnActif]} onPress={() => setOngletActif('HISTORIQUE')}>
          <Text style={[styles.navBtnTexte, ongletActif === 'HISTORIQUE' && styles.navBtnTexteActif]}>📋 Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, ongletActif === 'SIMULATION' && styles.navBtnActif]} onPress={() => setOngletActif('SIMULATION')}>
          <Text style={[styles.navBtnTexte, ongletActif === 'SIMULATION' && styles.navBtnTexteActif]}>🧮 Simulation</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Chargement de vos finances...</Text>
      ) : (
        <>
          {ongletActif === 'INDICATEURS' && (
            <Indicateurs comptes={comptes} transactions={transactions} />
          )}
          
          {ongletActif === 'HISTORIQUE' && (
             <Historique 
               transactions={transactions} 
               comptes={comptes} 
               categories={categories} 
               sousCategories={sousCategories}
               onEdit={handleEditTransaction}
               onDelete={handleDeleteTransaction}
             />
          )}

          {ongletActif === 'SIMULATION' && (
             <View style={styles.placeholderBox}>
               <Text style={styles.sectionTitle}>Simulateurs</Text>
               <Text style={styles.placeholderText}>(Les simulateurs de Crédit, Épargne et Projection arriveront ici)</Text>
             </View>
          )}
        </>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1115' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 24 },
  pageTitle: { color: '#e8edf4', fontSize: 24, fontWeight: 'bold' },
  indication: { color: '#8a93a3', fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  
  navPrincipale: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#262b36', marginBottom: 24, gap: 10 },
  navBtn: { paddingVertical: 10, paddingHorizontal: 20, borderBottomWidth: 3, borderBottomColor: 'transparent', marginBottom: -2 },
  navBtnActif: { borderBottomColor: '#c08a2d' },
  navBtnTexte: { color: '#8a93a3', fontSize: 14, fontWeight: '500' },
  navBtnTexteActif: { color: '#c08a2d', fontWeight: 'bold' },
  
  loadingText: { color: '#8a93a3', textAlign: 'center', marginTop: 40 },
  
  placeholderBox: { backgroundColor: '#171a21', padding: 40, borderRadius: 12, borderWidth: 1, borderColor: '#262b36', alignItems: 'center' },
  sectionTitle: { color: '#e8edf4', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  placeholderText: { color: '#8a93a3', fontStyle: 'italic', textAlign: 'center' }
});