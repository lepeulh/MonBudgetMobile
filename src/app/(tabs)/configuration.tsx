import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Switch } from 'react-native';
import { supabase } from '../../lib/supabase';

type Compte = {
  id: string;
  nom: string;
  type: string;
  devise: string;
  decouvert_autorise: boolean;
};

export default function ConfigurationScreen() {
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [loading, setLoading] = useState(true);

  // Nouveaux états pour le formulaire complet
  const [nouveauNom, setNouveauNom] = useState('');
  const [typeCompte, setTypeCompte] = useState('COURANT');
  const [devise, setDevise] = useState('EUR');
  const [decouvertAutorise, setDecouvertAutorise] = useState(true);

  useEffect(() => {
    chargerComptes();
  }, []);

  async function chargerComptes() {
    setLoading(true);
    const { data, error } = await supabase
      .from('comptes')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      Alert.alert('Erreur', error.message);
    } else if (data) {
      setComptes(data);
    }
    setLoading(false);
  }

  async function ajouterCompte() {
    if (!nouveauNom.trim()) {
      Alert.alert('Erreur', 'Le nom du compte est obligatoire.');
      return;
    }
    if (!devise.trim()) {
      Alert.alert('Erreur', 'La devise est obligatoire.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('comptes').insert([
      { 
        user_id: user.id, 
        nom: nouveauNom.trim(), 
        type: typeCompte,
        devise: devise.trim().toUpperCase(),
        decouvert_autorise: decouvertAutorise,
        actif: true 
      }
    ]);

    if (error) {
      Alert.alert('Erreur lors de l\'ajout', error.message);
    } else {
      // Réinitialiser le formulaire après succès
      setNouveauNom('');
      setTypeCompte('COURANT');
      setDevise('EUR');
      setDecouvertAutorise(true);
      chargerComptes();
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes Comptes</Text>

      {/* Formulaire d'ajout complet */}
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nom du compte (ex: Boursorama)"
          placeholderTextColor="#8a93a3"
          value={nouveauNom}
          onChangeText={setNouveauNom}
        />

        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Type de compte</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity 
                style={[styles.typeButton, typeCompte === 'COURANT' && styles.typeButtonActive]}
                onPress={() => setTypeCompte('COURANT')}
              >
                <Text style={[styles.typeText, typeCompte === 'COURANT' && styles.typeTextActive]}>Courant</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeButton, typeCompte === 'EPARGNE' && styles.typeButtonActive]}
                onPress={() => setTypeCompte('EPARGNE')}
              >
                <Text style={[styles.typeText, typeCompte === 'EPARGNE' && styles.typeTextActive]}>Épargne</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.deviseContainer}>
            <Text style={styles.label}>Devise</Text>
            <TextInput
              style={styles.input}
              placeholder="EUR"
              placeholderTextColor="#8a93a3"
              value={devise}
              onChangeText={setDevise}
              maxLength={3}
              autoCapitalize="characters"
            />
          </View>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Autoriser le solde négatif (Crédit/Découvert)</Text>
          <Switch 
            value={decouvertAutorise} 
            onValueChange={setDecouvertAutorise}
            trackColor={{ false: '#262b36', true: '#c08a2d' }}
            thumbColor={'#e8edf4'}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={ajouterCompte}>
          <Text style={styles.submitButtonText}>Ajouter le compte</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des comptes */}
      {loading ? (
        <Text style={styles.loadingText}>Chargement des comptes...</Text>
      ) : (
        <FlatList
          data={comptes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.nom}</Text>
                <Text style={styles.cardDevise}>{item.devise}</Text>
              </View>
              <Text style={styles.cardSub}>
                {item.type} {item.decouvert_autorise ? '• Découvert autorisé' : '• Pas de découvert'}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Aucun compte enregistré.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0f1115' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#e8edf4', marginBottom: 20 },
  formContainer: { backgroundColor: '#171a21', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#262b36' },
  row: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  flex1: { flex: 1 },
  deviseContainer: { width: 80 },
  label: { color: '#8a93a3', fontSize: 12, marginBottom: 8, fontWeight: '600' },
  input: { backgroundColor: '#0f1115', borderWidth: 1, borderColor: '#262b36', borderRadius: 8, padding: 12, color: '#e8edf4', marginBottom: 15 },
  typeContainer: { flexDirection: 'row', backgroundColor: '#0f1115', borderRadius: 8, borderWidth: 1, borderColor: '#262b36', overflow: 'hidden' },
  typeButton: { flex: 1, padding: 10, alignItems: 'center' },
  typeButtonActive: { backgroundColor: '#262b36' },
  typeText: { color: '#8a93a3', fontSize: 13, fontWeight: '600' },
  typeTextActive: { color: '#e8edf4' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  submitButton: { backgroundColor: '#c08a2d', padding: 14, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loadingText: { color: '#8a93a3', textAlign: 'center', marginTop: 20 },
  emptyText: { color: '#8a93a3', textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  card: { backgroundColor: '#171a21', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#262b36' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#e8edf4', fontSize: 16, fontWeight: 'bold' },
  cardDevise: { color: '#c08a2d', fontSize: 14, fontWeight: 'bold' },
  cardSub: { color: '#8a93a3', fontSize: 12, marginTop: 4 },
});