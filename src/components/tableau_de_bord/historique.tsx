import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Modal, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export function Historique({ transactions, comptes, categories, sousCategories, onEdit, onDelete }: any) {
  // Filtres
  const [filtres, setFiltres] = useState({
    type: '', dateDebut: '', dateFin: '', compteId: '', categorieId: '', sousCategorieId: '', libelle: ''
  });

  // Modale d'édition
  const [txEnEdition, setTxEnEdition] = useState<any>(null);

  // Filtrage dynamique
  const transactionsFiltrees = useMemo(() => {
    return transactions.filter((tx: any) => {
      const matchType = filtres.type === '' || tx.type_operation === filtres.type;
      const matchCompte = filtres.compteId === '' || tx.compte_id === filtres.compteId;
      const matchCat = filtres.categorieId === '' || tx.categorie_id === filtres.categorieId;
      const matchSousCat = filtres.sousCategorieId === '' || tx.sous_categorie_id === filtres.sousCategorieId;
      const matchLibelle = filtres.libelle === '' || (tx.libelle && tx.libelle.toLowerCase().includes(filtres.libelle.toLowerCase()));
      const matchDateDebut = filtres.dateDebut === '' || tx.date_operation >= filtres.dateDebut;
      const matchDateFin = filtres.dateFin === '' || tx.date_operation <= filtres.dateFin;

      return matchType && matchCompte && matchCat && matchSousCat && matchLibelle && matchDateDebut && matchDateFin;
    });
  }, [transactions, filtres]);

  const handleConfirmerSuppression = (tx: any) => {
    Alert.alert(
      "Supprimer la transaction",
      "Êtes-vous sûr de vouloir supprimer cette transaction ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => onDelete(tx) }
      ]
    );
  };

  const handleSauvegarderEdition = () => {
    onEdit(txEnEdition);
    setTxEnEdition(null);
  };

  return (
    <View style={styles.container}>
      {/* ZONE DE FILTRES */}
      <View style={styles.filtresContainer}>
        <Text style={styles.sectionTitle}>🔍 Filtres de l'historique</Text>
        
        <View style={styles.filtresGrid}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={filtres.type} onValueChange={(v) => setFiltres({...filtres, type: v})} style={styles.picker}>
                <Picker.Item label="Tous" value="" color="#8a93a3" />
                <Picker.Item label="Dépense" value="DEPENSE" />
                <Picker.Item label="Revenu" value="REVENU" />
                <Picker.Item label="Transfert" value="TRANSFERT" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date début</Text>
            <TextInput style={styles.input} value={filtres.dateDebut} onChangeText={(v) => setFiltres({...filtres, dateDebut: v})} placeholder="AAAA-MM-JJ" placeholderTextColor="#8a93a3" {...(Platform.OS === 'web' ? { type: 'date' } as any : {})} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date fin</Text>
            <TextInput style={styles.input} value={filtres.dateFin} onChangeText={(v) => setFiltres({...filtres, dateFin: v})} placeholder="AAAA-MM-JJ" placeholderTextColor="#8a93a3" {...(Platform.OS === 'web' ? { type: 'date' } as any : {})} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Compte</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={filtres.compteId} onValueChange={(v) => setFiltres({...filtres, compteId: v})} style={styles.picker}>
                <Picker.Item label="Tous" value="" color="#8a93a3" />
                {comptes.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={filtres.categorieId} onValueChange={(v) => setFiltres({...filtres, categorieId: v, sousCategorieId: ''})} style={styles.picker}>
                <Picker.Item label="Toutes" value="" color="#8a93a3" />
                {categories.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sous-catégorie</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={filtres.sousCategorieId} onValueChange={(v) => setFiltres({...filtres, sousCategorieId: v})} style={styles.picker} enabled={filtres.categorieId !== ''}>
                <Picker.Item label="Toutes" value="" color="#8a93a3" />
                {sousCategories.filter((sc: any) => sc.categorie_id === filtres.categorieId).map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
              </Picker>
            </View>
          </View>
        </View>

        <View style={[styles.inputGroup, { marginTop: 10 }]}>
          <Text style={styles.label}>Recherche libellé</Text>
          <TextInput style={styles.input} value={filtres.libelle} onChangeText={(v) => setFiltres({...filtres, libelle: v})} placeholder="Ex: Courses, Loyer..." placeholderTextColor="#8a93a3" />
        </View>
      </View>

      {/* TABLEAU DES TRANSACTIONS */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.sectionTitle}>Résultats ({transactionsFiltrees.length})</Text>
        </View>

        <FlatList
          data={transactionsFiltrees}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const nomCompte = comptes.find((c: any) => c.id === item.compte_id)?.nom || 'Inconnu';
            const nomCat = categories.find((c: any) => c.id === item.categorie_id)?.nom || '';
            const isTransfert = item.type_operation === 'TRANSFERT';

            return (
              <View style={styles.transactionRow}>
                <Text style={styles.txDate}>{item.date_operation}</Text>
                
                <View style={styles.txBadgeContainer}>
                  <Text style={[styles.badge, styles[`badge_${item.type_operation}` as keyof typeof styles]]}>
                    {item.type_operation}
                  </Text>
                </View>

                <View style={styles.txInfo}>
                  <Text style={styles.txLibelle}>{item.libelle}</Text>
                  <Text style={styles.txDetails}>{nomCompte} {nomCat ? ` • ${nomCat}` : ''}</Text>
                </View>

                <Text style={[styles.txMontant, item.sens === 'ENTREE' ? styles.txPositive : styles.txNegative]}>
                  {item.sens === 'ENTREE' ? '+' : '-'}{Number(item.montant).toFixed(2)} €
                </Text>

                <View style={styles.actionsContainer}>
                  {!isTransfert && (
                    <TouchableOpacity style={styles.actionBtn} onPress={() => setTxEnEdition({...item})}>
                      <Ionicons name="pencil" size={16} color="#8a93a3" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleConfirmerSuppression(item)}>
                    <Ionicons name="trash" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.placeholderText}>Aucune transaction trouvée.</Text>}
        />
      </View>

      {/* MODALE D'ÉDITION */}
      {txEnEdition && (
        <Modal transparent={true} animationType="fade" visible={!!txEnEdition} onRequestClose={() => setTxEnEdition(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.sectionTitle}>Modifier la transaction</Text>
              
              <View style={styles.inputGroup}><Text style={styles.label}>Date</Text><TextInput style={styles.input} value={txEnEdition.date_operation} onChangeText={(t) => setTxEnEdition({...txEnEdition, date_operation: t})} {...(Platform.OS === 'web' ? { type: 'date' } as any : {})} /></View>
              <View style={styles.inputGroup}><Text style={styles.label}>Libellé</Text><TextInput style={styles.input} value={txEnEdition.libelle} onChangeText={(t) => setTxEnEdition({...txEnEdition, libelle: t})} /></View>
              <View style={styles.inputGroup}><Text style={styles.label}>Montant</Text><TextInput style={styles.input} value={String(txEnEdition.montant)} keyboardType="numeric" onChangeText={(t) => setTxEnEdition({...txEnEdition, montant: t})} /></View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Compte</Text>
                <View style={styles.pickerContainer}>
                  <Picker selectedValue={txEnEdition.compte_id} onValueChange={(t) => setTxEnEdition({...txEnEdition, compte_id: t})} style={styles.picker}>
                    {comptes.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
                  </Picker>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setTxEnEdition(null)}><Text style={styles.modalCancelText}>Annuler</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSauvegarderEdition}><Text style={styles.modalConfirmText}>Enregistrer</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 20 },
  filtresContainer: { backgroundColor: '#171a21', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#262b36' },
  sectionTitle: { color: '#e8edf4', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  filtresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  inputGroup: { flex: 1, minWidth: 150 },
  label: { color: '#8a93a3', fontSize: 11, marginBottom: 5, fontWeight: '600', textTransform: 'uppercase' },
  input: { backgroundColor: '#0f1115', color: '#e8edf4', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#262b36', fontSize: 13 },
  pickerContainer: { backgroundColor: '#0f1115', borderRadius: 6, borderWidth: 1, borderColor: '#262b36', overflow: 'hidden', height: 40, justifyContent: 'center' },
  picker: { color: '#e8edf4', backgroundColor: '#0f1115', borderWidth: 0, outlineStyle: 'none' as any },
  
  tableContainer: { backgroundColor: '#171a21', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#262b36', flex: 1 },
  tableHeader: { borderBottomWidth: 1, borderBottomColor: '#262b36', paddingBottom: 10, marginBottom: 10 },
  transactionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#262b36', gap: 10 },
  txDate: { color: '#8a93a3', fontSize: 12, width: 75 },
  txBadgeContainer: { width: 80 },
  badge: { paddingVertical: 3, paddingHorizontal: 6, borderRadius: 4, fontSize: 10, fontWeight: 'bold', textAlign: 'center', overflow: 'hidden' },
  badge_DEPENSE: { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  badge_REVENU: { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  badge_TRANSFERT: { backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#6366f1' },
  txInfo: { flex: 1 },
  txLibelle: { color: '#e8edf4', fontSize: 13, fontWeight: '500' },
  txDetails: { color: '#8a93a3', fontSize: 11, marginTop: 2 },
  txMontant: { fontWeight: 'bold', fontSize: 14, width: 80, textAlign: 'right' },
  txPositive: { color: '#10b981' },
  txNegative: { color: '#e8edf4' },
  actionsContainer: { flexDirection: 'row', gap: 5, width: 60, justifyContent: 'flex-end' },
  actionBtn: { padding: 6, backgroundColor: '#0f1115', borderRadius: 6, borderWidth: 1, borderColor: '#262b36' },
  placeholderText: { color: '#8a93a3', textAlign: 'center', fontStyle: 'italic', marginVertical: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#171a21', width: '100%', maxWidth: 400, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#262b36' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  modalCancelBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#262b36' },
  modalCancelText: { color: '#e8edf4', fontWeight: 'bold', fontSize: 12 },
  modalConfirmBtn: { backgroundColor: '#c08a2d', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  modalConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});