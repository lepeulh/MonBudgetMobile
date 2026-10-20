import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, ScrollView, Platform, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

type TypeTx = 'DEPENSE' | 'REVENU' | 'TRANSFERT';
type Frequence = 'UNIQUE' | 'QUOTIDIENNE' | 'HEBDOMADAIRE' | 'MENSUELLE' | 'ANNUELLE' | 'X_JOURS';

export default function PlanificationsScreen() {
  const [comptes, setComptes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sousCategories, setSousCategories] = useState<any[]>([]);
  const [planifications, setPlanifications] = useState<any[]>([]);

  const [typeTx, setTypeTx] = useState<TypeTx>('DEPENSE');
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
  const [dateFin, setDateFin] = useState('');
  const [frequence, setFrequence] = useState<Frequence>('MENSUELLE');
  const [frequenceJours, setFrequenceJours] = useState('');
  const [montant, setMontant] = useState('');
  const [compteId, setCompteId] = useState('');
  const [compteSourceId, setCompteSourceId] = useState('');
  const [compteCibleId, setCompteCibleId] = useState('');
  const [categorieId, setCategorieId] = useState('');
  const [sousCategorieId, setSousCategorieId] = useState('');
  const [libelle, setLibelle] = useState('');
  const [note, setNote] = useState('');

  const [filtres, setFiltres] = useState({
    dateDebut: '', dateFin: '', type: '' as TypeTx | '', categorieId: '', sousCategorieId: '', compteId: '', libelle: ''
  });
  const [tri, setTri] = useState('DATE_ASC');

  useEffect(() => {
    chargerDonnees();
  }, []);

  async function chargerDonnees() {
    try {
      const [resComptes, resCategories, resSousCat, resPlanif] = await Promise.all([
        supabase.from('comptes').select('*').eq('actif', true).order('nom'),
        supabase.from('categories').select('*').order('nom'),
        supabase.from('sous_categories').select('*').order('nom'),
        supabase.from('planifications').select('*').order('date_debut', { ascending: true })
      ]);

      if (resComptes.data) setComptes(resComptes.data);
      if (resCategories.data) setCategories(resCategories.data);
      if (resSousCat.data) setSousCategories(resSousCat.data);
      if (resPlanif.data) setPlanifications(resPlanif.data);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données.');
    }
  }

 const handleSave = async () => {
    try {
      console.log("=== DÉBUT DE L'ENREGISTREMENT ===");
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log("1. Statut Utilisateur :", user ? user.id : "Non connecté", authError);
      
      if (!user) return Alert.alert("Erreur", "Vous devez être connecté.");

      const montantSaisi = Math.abs(Number(montant));
      if (!montantSaisi || isNaN(montantSaisi)) return Alert.alert("Erreur", "Veuillez saisir un montant valide.");
      if (!dateDebut) return Alert.alert("Erreur", "La date de début est obligatoire.");
      if (!libelle.trim()) return Alert.alert("Erreur", "Le libellé est obligatoire.");

      if (typeTx === 'TRANSFERT') {
        if (!compteSourceId || !compteCibleId) return Alert.alert("Erreur", "Veuillez sélectionner les deux comptes pour le transfert.");
      } else {
        if (!compteId) return Alert.alert("Erreur", "Veuillez sélectionner un compte.");
      }

      // Préparation des données exactement comme attendu par la base
      const payload = {
        user_id: user.id,
        nom: libelle.trim(),
        type_operation: typeTx,
        date_debut: dateDebut,
        date_fin: dateFin || null,
        frequence: frequence,
        frequence_jours: frequence === 'X_JOURS' ? Number(frequenceJours) : null,
        montant: montantSaisi,
        compte_id: typeTx === 'TRANSFERT' ? compteSourceId : compteId,
        compte_cible_id: typeTx === 'TRANSFERT' ? compteCibleId : null,
        categorie_id: typeTx === 'TRANSFERT' ? null : (categorieId || null),
        sous_categorie_id: typeTx === 'TRANSFERT' ? null : (sousCategorieId || null),
        note: note.trim() || null,
        actif: true
      };

      console.log("2. Données envoyées à Supabase :", JSON.stringify(payload, null, 2));

      const reponse = await supabase.from('planifications').insert([payload]);
      console.log("3. Réponse complète de Supabase :", reponse);

      if (reponse.error) {
        console.error("4. ERREUR SUPABASE :", reponse.error);
        throw reponse.error;
      }

      console.log("=== SUCCÈS ===");
      Alert.alert("Succès", "La planification a été enregistrée avec succès.");
      handleResetForm();
      chargerDonnees(); 

    } catch (error: any) {
      console.error("=== EXCEPTION ATTRAPÉE ===", error);
      Alert.alert("Détail de l'erreur", error.message || JSON.stringify(error));
    }
  };

  const handleResetForm = () => {
    setTypeTx('DEPENSE'); setDateDebut(new Date().toISOString().split('T')[0]); setDateFin(''); setFrequence('MENSUELLE');
    setFrequenceJours(''); setMontant(''); setCompteId(''); setCompteSourceId(''); setCompteCibleId(''); 
    setCategorieId(''); setSousCategorieId(''); setLibelle(''); setNote('');
  };

  const handleResetFilters = () => {
    setFiltres({ dateDebut: '', dateFin: '', type: '', categorieId: '', sousCategorieId: '', compteId: '', libelle: '' });
    setTri('DATE_ASC');
  };

  const categoriesFiltrees = categories.filter(c => c.type_operation === typeTx || c.type_operation === 'TOUS');
  const sousCategoriesFiltrees = categories.length > 0 && categorieId ? sousCategories.filter(sc => String(sc.categorie_id) === String(categorieId)) : [];

  const categoriesFiltreTableau = categories.filter(c => filtres.type === '' || c.type_operation === filtres.type || c.type_operation === 'TOUS');
  const sousCategoriesFiltreTableau = filtres.categorieId ? sousCategories.filter(sc => String(sc.categorie_id) === String(filtres.categorieId)) : [];

  const planificationsAffichees = useMemo(() => {
    let result = planifications.filter(p => {
      if (filtres.dateDebut && p.date_debut < filtres.dateDebut) return false;
      if (filtres.dateFin && p.date_debut > filtres.dateFin) return false;
      if (filtres.type && p.type_operation !== filtres.type) return false;
      if (filtres.categorieId && p.categorie_id !== filtres.categorieId) return false;
      if (filtres.compteId && p.compte_id !== filtres.compteId && p.compte_cible_id !== filtres.compteId) return false;
      if (filtres.libelle && p.nom && !p.nom.toLowerCase().includes(filtres.libelle.toLowerCase())) return false;
      return true;
    });

    result.sort((a, b) => {
      const dateA = a.date_debut;
      const dateB = b.date_debut;
      
      if (tri === 'DATE_ASC') return dateA > dateB ? 1 : -1;
      if (tri === 'DATE_DESC') return dateA < dateB ? 1 : -1;
      if (tri === 'MONTANT_ASC') return Number(a.montant) - Number(b.montant);
      if (tri === 'MONTANT_DESC') return Number(b.montant) - Number(a.montant);
      if (tri === 'TYPE') return String(a.type_operation).localeCompare(String(b.type_operation));
      return 0;
    });

    return result;
  }, [planifications, filtres, tri]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Planifications</Text>
        <Text style={styles.indication}>Créez et consultez vos transactions planifiées.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nouvelle planification</Text>
        
        <View style={styles.row}>
          <View style={styles.fieldCol}>
            <Text style={styles.label}>Type d'opération</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={typeTx} onValueChange={(v) => { setTypeTx(v as TypeTx); setCategorieId(''); setSousCategorieId(''); }} style={styles.picker}>
                <Picker.Item label="Dépense" value="DEPENSE" />
                <Picker.Item label="Revenu" value="REVENU" />
                <Picker.Item label="Transfert" value="TRANSFERT" />
              </Picker>
            </View>
          </View>
          <View style={styles.fieldCol}>
            <Text style={styles.label}>Date début</Text>
            <TextInput style={styles.input} value={dateDebut} onChangeText={setDateDebut} placeholder="jj/mm/aaaa" placeholderTextColor="#8a93a3" {...(Platform.OS === 'web' ? { type: 'date' } as any : {})} />
          </View>
          <View style={styles.fieldCol}>
            <Text style={styles.label}>Date fin</Text>
            <TextInput style={styles.input} value={dateFin} onChangeText={setDateFin} placeholder="Optionnel" placeholderTextColor="#8a93a3" {...(Platform.OS === 'web' ? { type: 'date' } as any : {})} />
          </View>
          <View style={styles.fieldCol}>
            <Text style={styles.label}>Fréquence</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={frequence} onValueChange={(v) => setFrequence(v as Frequence)} style={styles.picker}>
                <Picker.Item label="Ponctuelle" value="UNIQUE" />
                <Picker.Item label="Mensuelle" value="MENSUELLE" />
                <Picker.Item label="Hebdomadaire" value="HEBDOMADAIRE" />
                <Picker.Item label="Annuelle" value="ANNUELLE" />
                <Picker.Item label="Tous les X jours" value="X_JOURS" />
              </Picker>
            </View>
          </View>
          <View style={styles.fieldCol}>
            <Text style={styles.label}>Montant</Text>
            <TextInput style={styles.input} value={montant} onChangeText={setMontant} placeholder="0.00" keyboardType="numeric" placeholderTextColor="#8a93a3" />
          </View>
          <View style={styles.fieldCol}>
            <Text style={styles.label}>{typeTx === 'TRANSFERT' ? 'Compte source' : 'Compte'}</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={typeTx === 'TRANSFERT' ? compteSourceId : compteId} onValueChange={typeTx === 'TRANSFERT' ? setCompteSourceId : setCompteId} style={styles.picker}>
                <Picker.Item label="Sélectionner..." value="" color="#8a93a3" />
                {comptes.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          {typeTx === 'TRANSFERT' ? (
            <>
              <View style={styles.fieldCol}>
                <Text style={styles.label}>Compte cible</Text>
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={compteCibleId} onValueChange={setCompteCibleId} style={styles.picker}>
                    <Picker.Item label="Sélectionner..." value="" color="#8a93a3" />
                    {comptes.filter((c:any) => c.id !== compteSourceId).map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
                  </Picker>
                </View>
              </View>
              {frequence === 'X_JOURS' ? (
                <View style={styles.fieldCol}>
                  <Text style={styles.label}>Nb de jours</Text>
                  <TextInput style={styles.input} value={frequenceJours} onChangeText={setFrequenceJours} keyboardType="numeric" placeholder="Ex: 15" placeholderTextColor="#8a93a3" />
                </View>
              ) : <View style={styles.fieldCol} />}
            </>
          ) : (
            <>
              <View style={styles.fieldCol}>
                <Text style={styles.label}>Catégorie</Text>
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={categorieId} onValueChange={(v) => { setCategorieId(v); setSousCategorieId(''); }} style={styles.picker}>
                    <Picker.Item label="Sélectionner..." value="" color="#8a93a3" />
                    {categoriesFiltrees.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
                  </Picker>
                </View>
              </View>
              <View style={styles.fieldCol}>
                <Text style={styles.label}>Sous-catégorie</Text>
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={sousCategorieId} onValueChange={setSousCategorieId} style={styles.picker}>
                    <Picker.Item label={categorieId ? "Sélectionner..." : "Choisissez une catégorie"} value="" color="#8a93a3" />
                    {sousCategoriesFiltrees.map((sc: any) => <Picker.Item key={sc.id} label={sc.nom} value={sc.id} />)}
                  </Picker>
                </View>
              </View>
              {frequence === 'X_JOURS' && (
                <View style={styles.fieldCol}>
                  <Text style={styles.label}>Nb de jours</Text>
                  <TextInput style={styles.input} value={frequenceJours} onChangeText={setFrequenceJours} keyboardType="numeric" placeholder="Ex: 15" placeholderTextColor="#8a93a3" />
                </View>
              )}
            </>
          )}
          
          <View style={[styles.fieldCol, { flex: 2 }]}>
            <Text style={styles.label}>Libellé</Text>
            <TextInput style={styles.input} value={libelle} onChangeText={setLibelle} placeholder="Ex: Loyer, salaire, assurance..." placeholderTextColor="#8a93a3" />
          </View>
          <View style={[styles.fieldCol, { flex: 2 }]}>
            <Text style={styles.label}>Note</Text>
            <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="Commentaire facultatif" placeholderTextColor="#8a93a3" />
          </View>
        </View>

        <View style={styles.formActions}>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleResetForm}>
            <Text style={styles.btnSecondaryText}>Réinitialiser</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={handleSave}>
            <Text style={styles.btnPrimaryText}>Enregistrer la planification</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { flex: 1 }]}>
        <Text style={styles.cardTitle}>Liste des transactions planifiées</Text>
        
        <View style={[styles.row, styles.filtersRow]}>
          <View style={styles.fieldCol}>
            <Text style={styles.label}>Du</Text>
            <TextInput style={styles.input} value={filtres.dateDebut} onChangeText={(v) => setFiltres({...filtres, dateDebut: v})} placeholder="jj/mm/aaaa" placeholderTextColor="#8a93a3" {...(Platform.OS === 'web' ? { type: 'date' } as any : {})} />
          </View>
          <View style={styles.fieldCol}>
            <Text style={styles.label}>Au</Text>
            <TextInput style={styles.input} value={filtres.dateFin} onChangeText={(v) => setFiltres({...filtres, dateFin: v})} placeholder="jj/mm/aaaa" placeholderTextColor="#8a93a3" {...(Platform.OS === 'web' ? { type: 'date' } as any : {})} />
          </View>
          <View style={styles.fieldCol}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={filtres.type} onValueChange={(v) => setFiltres({...filtres, type: v as TypeTx})} style={styles.picker}>
                <Picker.Item label="Tous" value="" color="#8a93a3" />
                <Picker.Item label="Dépense" value="DEPENSE" />
                <Picker.Item label="Revenu" value="REVENU" />
                <Picker.Item label="Transfert" value="TRANSFERT" />
              </Picker>
            </View>
          </View>
          <View style={styles.fieldCol}>
            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={filtres.categorieId} onValueChange={(v) => setFiltres({...filtres, categorieId: v, sousCategorieId: ''})} style={styles.picker}>
                <Picker.Item label="Toutes" value="" color="#8a93a3" />
                {categoriesFiltreTableau.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
              </Picker>
            </View>
          </View>
          <View style={styles.fieldCol}>
            <Text style={styles.label}>Compte</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={filtres.compteId} onValueChange={(v) => setFiltres({...filtres, compteId: v})} style={styles.picker}>
                <Picker.Item label="Tous" value="" color="#8a93a3" />
                {comptes.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
              </Picker>
            </View>
          </View>
          <View style={styles.fieldCol}>
            <Text style={styles.label}>Trier par</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={tri} onValueChange={setTri} style={styles.picker}>
                <Picker.Item label="Date croissante" value="DATE_ASC" />
                <Picker.Item label="Date décroissante" value="DATE_DESC" />
                <Picker.Item label="Montant croissant" value="MONTANT_ASC" />
                <Picker.Item label="Montant décroissant" value="MONTANT_DESC" />
                <Picker.Item label="Type d'opération" value="TYPE" />
              </Picker>
            </View>
          </View>
          <View style={[styles.fieldCol, { flex: 1.5 }]}>
            <Text style={styles.label}>Recherche</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1 }]} value={filtres.libelle} onChangeText={(v) => setFiltres({...filtres, libelle: v})} placeholder="Ex: loyer..." placeholderTextColor="#8a93a3" />
              <TouchableOpacity style={styles.btnSecondary} onPress={handleResetFilters}>
                <Text style={styles.btnSecondaryText}>Réinitialiser</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={{ minWidth: 1000 }}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { width: 100 }]}>Date prévue</Text>
              <Text style={[styles.th, { flex: 2 }]}>Libellé</Text>
              <Text style={[styles.th, { width: 100 }]}>Type</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Catégorie</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Compte</Text>
              <Text style={[styles.th, { width: 100, textAlign: 'right' }]}>Montant</Text>
              <Text style={[styles.th, { width: 100, textAlign: 'center' }]}>Fréquence</Text>
              <Text style={[styles.th, { width: 160, textAlign: 'center' }]}>Actions</Text>
            </View>

            <FlatList
              data={planificationsAffichees}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const nomCompte = comptes.find((c: any) => c.id === item.compte_id || c.id === item.compte_source_id)?.nom || '';
                const nomCat = categories.find((c: any) => c.id === item.categorie_id)?.nom || '—';

                return (
                  <View style={styles.tableRow}>
                    <Text style={[styles.td, { width: 100 }]}>{item.date_debut}</Text>
                    <Text style={[styles.td, { flex: 2, fontWeight: '500', color: '#e8edf4' }]}>{item.nom}</Text>
                    <View style={[styles.td, { width: 100 }]}>
                      <Text style={[styles.badge, styles[`badge_${item.type_operation}` as keyof typeof styles]]}>{item.type_operation}</Text>
                    </View>
                    <Text style={[styles.td, { flex: 1.5 }]}>{nomCat}</Text>
                    <Text style={[styles.td, { flex: 1.5 }]}>{nomCompte}</Text>
                    <Text style={[styles.td, { width: 100, textAlign: 'right', fontWeight: 'bold', color: '#e8edf4' }]}>{Number(item.montant).toFixed(2)}</Text>
                    <Text style={[styles.td, { width: 100, textAlign: 'center', fontSize: 11 }]}>{item.frequence}</Text>
                    <View style={[styles.td, { width: 160, flexDirection: 'row', gap: 8, justifyContent: 'center' }]}>
                      <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="pencil" size={14} color="#c08a2d" />
                        <Text style={styles.actionBtnTextEdit}>Modifier</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionBtn}>
                        <Ionicons name="close" size={14} color="#ef4444" />
                        <Text style={styles.actionBtnTextDelete}>Annuler</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              ListEmptyComponent={<Text style={styles.placeholderText}>Aucune planification trouvée.</Text>}
            />
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1115' },
  scrollContent: { padding: 20, gap: 20 },
  header: { marginBottom: 5 },
  pageTitle: { color: '#e8edf4', fontSize: 24, fontWeight: 'bold' },
  indication: { color: '#8a93a3', fontSize: 13, marginTop: 4 },
  
  card: { backgroundColor: '#171a21', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#262b36' },
  cardTitle: { color: '#e8edf4', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  
  row: { flexDirection: 'row', gap: 15, marginBottom: 15, flexWrap: 'wrap' },
  fieldCol: { flex: 1, minWidth: 140 },
  
  label: { color: '#e8edf4', fontSize: 12, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#0f1115', color: '#e8edf4', paddingHorizontal: 12, height: 40, borderRadius: 6, borderWidth: 1, borderColor: '#262b36', fontSize: 13 },
  
  pickerContainer: { backgroundColor: '#0f1115', borderRadius: 6, borderWidth: 1, borderColor: '#262b36', overflow: 'hidden', height: 40, justifyContent: 'center' },
  picker: { color: '#e8edf4', backgroundColor: '#0f1115', borderWidth: 0, fontSize: 13, height: 40, outlineStyle: 'none' as any },
  
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  btnPrimary: { backgroundColor: '#c08a2d', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  btnSecondary: { backgroundColor: '#262b36', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 6 },
  btnSecondaryText: { color: '#e8edf4', fontWeight: '500', fontSize: 13 },

  filtersRow: { marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#262b36' },
  
  tableHeaderRow: { flexDirection: 'row', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#262b36', marginBottom: 10 },
  th: { color: '#8a93a3', fontSize: 12, fontWeight: '600' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#262b36' },
  td: { color: '#8a93a3', fontSize: 13 },
  
  badge: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 4, fontSize: 9, fontWeight: 'bold', alignSelf: 'flex-start', overflow: 'hidden' },
  badge_DEPENSE: { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: '#ef4444', borderWidth: 1 },
  badge_REVENU: { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: '#10b981', borderWidth: 1 },
  badge_TRANSFERT: { backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1', borderColor: '#6366f1', borderWidth: 1 },
  
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#0f1115', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4, borderWidth: 1, borderColor: '#262b36' },
  actionBtnTextEdit: { color: '#c08a2d', fontSize: 11, fontWeight: '600' },
  actionBtnTextDelete: { color: '#ef4444', fontSize: 11, fontWeight: '600' },
  
  placeholderText: { color: '#8a93a3', textAlign: 'center', fontStyle: 'italic', marginVertical: 20 },
});