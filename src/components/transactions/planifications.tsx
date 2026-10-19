import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Modal, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export function PlanificationsFiltres({ filtres, setFiltres, comptes, categories, sousCategories }: any) {
  
  const categoriesFiltrees = categories.filter((c: any) => filtres.type === '' || c.type_operation === filtres.type || c.type_operation === 'TOUS');
  const sousCategoriesFiltrees = filtres.categorie ? sousCategories.filter((sc: any) => sc.categorie_id === filtres.categorie) : [];

  const onCategorieChange = (val: string) => {
    setFiltres({...filtres, categorie: val, sousCategorie: ''});
  };

  return (
    <View>
      <Text style={styles.filterDesc}>Ces critères filtrent dynamiquement la liste des occurrences à venir affichées à droite.</Text>
      
      <View style={styles.typeSelector}>
        <TouchableOpacity style={[styles.typeBtn, filtres.type === '' && styles.typeBtnActive]} onPress={() => setFiltres({...filtres, type: ''})}>
            <Text style={[styles.typeBtnText, filtres.type === '' && styles.typeBtnTextActive]}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeBtn, filtres.type === 'DEPENSE' && styles.typeBtnActive]} onPress={() => setFiltres({...filtres, type: 'DEPENSE'})}>
            <Text style={[styles.typeBtnText, filtres.type === 'DEPENSE' && styles.typeBtnTextActive]}>Dépenses</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeBtn, filtres.type === 'REVENU' && styles.typeBtnActive]} onPress={() => setFiltres({...filtres, type: 'REVENU'})}>
            <Text style={[styles.typeBtnText, filtres.type === 'REVENU' && styles.typeBtnTextActive]}>Revenus</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeBtn, filtres.type === 'TRANSFERT' && styles.typeBtnActive]} onPress={() => setFiltres({...filtres, type: 'TRANSFERT'})}>
            <Text style={[styles.typeBtnText, filtres.type === 'TRANSFERT' && styles.typeBtnTextActive]}>Transferts</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date début</Text>
          <TextInput style={styles.input} placeholder="AAAA-MM-JJ" value={filtres.dateDebut} onChangeText={(t) => setFiltres({...filtres, dateDebut: t})} placeholderTextColor="#8a93a3" {...(Platform.OS === 'web' ? { type: 'date' } as any : {})} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date fin</Text>
          <TextInput style={styles.input} placeholder="AAAA-MM-JJ" value={filtres.dateFin} onChangeText={(t) => setFiltres({...filtres, dateFin: t})} placeholderTextColor="#8a93a3" {...(Platform.OS === 'web' ? { type: 'date' } as any : {})} />
        </View>
      </View>
      
      {filtres.type === 'TRANSFERT' ? (
        <View style={styles.formRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Compte Source</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={filtres.compte} onValueChange={(t) => setFiltres({...filtres, compte: t})} style={styles.picker}>
                <Picker.Item label="Tous les comptes" value="" color="#8a93a3" />
                {comptes.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
              </Picker>
            </View>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Compte</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={filtres.compte} onValueChange={(t) => setFiltres({...filtres, compte: t})} style={styles.picker}>
                <Picker.Item label="Tous les comptes" value="" color="#8a93a3" />
                {comptes.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
              </Picker>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catégorie</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={filtres.categorie} onValueChange={onCategorieChange} style={styles.picker}>
                  <Picker.Item label="Toutes" value="" color="#8a93a3" />
                  {categoriesFiltrees.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
                </Picker>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sous-catégorie</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={filtres.sousCategorie} onValueChange={(t) => setFiltres({...filtres, sousCategorie: t})} style={styles.picker} enabled={filtres.categorie !== ''}>
                  <Picker.Item label="Toutes" value="" color="#8a93a3" />
                  {sousCategoriesFiltrees.map((sc: any) => <Picker.Item key={sc.id} label={sc.nom} value={sc.id} />)}
                </Picker>
              </View>
            </View>
          </View>
        </>
      )}

      <View style={styles.inputGroup}><Text style={styles.label}>Libellé / Recherche</Text><TextInput style={styles.input} placeholder="Mot clé..." value={filtres.libelle} onChangeText={(t) => setFiltres({...filtres, libelle: t})} placeholderTextColor="#8a93a3" /></View>
    </View>
  );
}

export function PlanificationsTable({ donnees, comptes, categories, sousCategories }: any) {
  const [occurrenceASolder, setOccurrenceASolder] = useState<any>(null);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tableHeader}><Text style={styles.sectionTitle}>Occurrences à venir</Text></View>
      <FlatList
        data={donnees} keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionRow}>
            <Text style={styles.txDate}>{item.datePrevue}</Text>
            <View style={styles.txInfo}>
              <Text style={styles.txLibelle}>{item.libelle}</Text>
              <Text style={styles.txCompteRef}>{item.compte} {item.categorie ? ` • ${item.categorie}` : ''}</Text>
            </View>
            <View style={styles.txActionGroup}>
              <Text style={[styles.txMontant, item.montant < 0 ? styles.txNegative : styles.txPositive]}>
                {item.montant > 0 ? '+' : ''}{item.montant.toFixed(2)} €
              </Text>
              <TouchableOpacity style={styles.solderBtn} onPress={() => setOccurrenceASolder(item)}><Text style={styles.solderBtnText}>Solder</Text></TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.placeholderText}>Aucune donnée.</Text>}
      />

      {occurrenceASolder && (
        <Modal transparent={true} animationType="fade" visible={!!occurrenceASolder} onRequestClose={() => setOccurrenceASolder(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.sectionTitle}>Solder l'opération</Text>
              <Text style={styles.filterDesc}>Planifié : {occurrenceASolder.libelle} ({occurrenceASolder.montant.toFixed(2)} € le {occurrenceASolder.datePrevue})</Text>

              <View style={styles.formRow}>
                <View style={styles.inputGroup}><Text style={styles.label}>Date d'exécution</Text><TextInput style={styles.input} defaultValue={occurrenceASolder.datePrevue} placeholderTextColor="#8a93a3" {...(Platform.OS === 'web' ? { type: 'date' } as any : {})} /></View>
                <View style={styles.inputGroup}><Text style={styles.label}>Montant réel</Text><TextInput style={styles.input} defaultValue={Math.abs(occurrenceASolder.montant).toString()} keyboardType="numeric" placeholderTextColor="#8a93a3" /></View>
              </View>
              <View style={styles.inputGroup}><Text style={styles.label}>Compte impacté</Text><TextInput style={styles.input} defaultValue={occurrenceASolder.compte} placeholderTextColor="#8a93a3" /></View>
              <View style={styles.formRow}>
                <View style={styles.inputGroup}><Text style={styles.label}>Catégorie</Text><TextInput style={styles.input} defaultValue={occurrenceASolder.categorie} placeholderTextColor="#8a93a3" /></View>
                <View style={styles.inputGroup}><Text style={styles.label}>Sous-catégorie</Text><TextInput style={styles.input} defaultValue={occurrenceASolder.sousCategorie} placeholderTextColor="#8a93a3" /></View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setOccurrenceASolder(null)}><Text style={styles.modalCancelText}>Annuler</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn}><Text style={styles.modalConfirmText}>Valider l'exécution</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  typeSelector: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  typeBtn: { flex: 1, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#262b36', alignItems: 'center', backgroundColor: '#0f1115' },
  typeBtnActive: { borderColor: '#c08a2d', backgroundColor: '#262b36' },
  typeBtnText: { color: '#8a93a3', fontSize: 12, fontWeight: 'bold' },
  typeBtnTextActive: { color: '#e8edf4' },
  formRow: { flexDirection: 'row', gap: 10 },
  inputGroup: { flex: 1, marginBottom: 10 },
  label: { color: '#8a93a3', fontSize: 11, marginBottom: 4, fontWeight: '600' },
  input: { backgroundColor: '#0f1115', color: '#e8edf4', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#262b36', fontSize: 13 },
  pickerContainer: { backgroundColor: '#0f1115', borderRadius: 6, borderWidth: 1, borderColor: '#262b36', overflow: 'hidden', height: 40, justifyContent: 'center' },
  picker: { color: '#e8edf4', backgroundColor: '#0f1115', borderWidth: 0, outlineStyle: 'none' as any },
  filterDesc: { color: '#8a93a3', fontSize: 11, marginBottom: 15, fontStyle: 'italic' },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#e8edf4', fontSize: 15, fontWeight: 'bold' },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#262b36' },
  txDate: { color: '#8a93a3', fontSize: 11, width: 70 },
  txInfo: { flex: 1 },
  txLibelle: { color: '#e8edf4', fontSize: 12, fontWeight: '500' },
  txCompteRef: { color: '#8a93a3', fontSize: 10, marginTop: 2 },
  txActionGroup: { alignItems: 'flex-end', gap: 4 },
  txMontant: { fontWeight: 'bold', fontSize: 13 },
  txPositive: { color: '#10b981' },
  txNegative: { color: '#e8edf4' },
  solderBtn: { backgroundColor: '#c08a2d', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  solderBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  placeholderText: { color: '#8a93a3', textAlign: 'center', fontStyle: 'italic', marginVertical: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#171a21', width: '100%', maxWidth: 500, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#262b36' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15 },
  modalCancelBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#262b36' },
  modalCancelText: { color: '#e8edf4', fontWeight: 'bold', fontSize: 12 },
  modalConfirmBtn: { backgroundColor: '#c08a2d', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  modalConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});