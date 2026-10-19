import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export type TypeTx = 'DEPENSE' | 'REVENU' | 'TRANSFERT';

export function NouvelleTransactionForm({ typeTx, setTypeTx, comptes, categories, sousCategories, onSave }: any) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [montant, setMontant] = useState('');
  const [compteId, setCompteId] = useState('');
  const [compteSourceId, setCompteSourceId] = useState('');
  const [compteCibleId, setCompteCibleId] = useState('');
  const [categorieId, setCategorieId] = useState('');
  const [sousCategorieId, setSousCategorieId] = useState('');
  const [libelle, setLibelle] = useState('');
  const [note, setNote] = useState('');

  const categoriesFiltrees = categories.filter((c: any) => c.type_operation === typeTx || c.type_operation === 'TOUS');
  const sousCategoriesFiltrees = categorieId ? sousCategories.filter((sc: any) => sc.categorie_id === categorieId) : [];

  const handleSubmit = () => {
    onSave({ typeTx, date, montant, compteId, compteSourceId, compteCibleId, categorieId, sousCategorieId, libelle, note });
    setMontant(''); setLibelle(''); setNote('');
  };

  return (
    <View>
      <View style={styles.typeSelector}>
        {(['DEPENSE', 'REVENU', 'TRANSFERT'] as TypeTx[]).map((type) => (
          <TouchableOpacity key={type} style={[styles.typeBtn, typeTx === type && styles.typeBtnActive]} onPress={() => setTypeTx(type)}>
            <Text style={[styles.typeBtnText, typeTx === type && styles.typeBtnTextActive]}>{type === 'DEPENSE' ? 'Dépense' : type === 'REVENU' ? 'Revenu' : 'Transfert'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.formRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput 
            style={styles.input} 
            value={date} 
            onChangeText={setDate}
            placeholder="AAAA-MM-JJ"
            placeholderTextColor="#8a93a3" 
            {...(Platform.OS === 'web' ? { type: 'date' } as any : {})} 
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Montant</Text>
          <TextInput style={styles.input} placeholder="0.00 €" keyboardType="numeric" value={montant} onChangeText={setMontant} placeholderTextColor="#8a93a3" />
        </View>
      </View>

      {typeTx === 'TRANSFERT' ? (
        <View style={styles.formRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Compte Source</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={compteSourceId} onValueChange={setCompteSourceId} style={styles.picker}>
                <Picker.Item label="Sélectionner..." value="" color="#8a93a3" />
                {comptes.filter((c: any) => c.id !== compteCibleId).map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
              </Picker>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Compte Cible</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={compteCibleId} onValueChange={setCompteCibleId} style={styles.picker}>
                <Picker.Item label="Sélectionner..." value="" color="#8a93a3" />
                {comptes.filter((c: any) => c.id !== compteSourceId).map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
              </Picker>
            </View>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Compte</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={compteId} onValueChange={setCompteId} style={styles.picker}>
                <Picker.Item label="Sélectionner un compte..." value="" color="#8a93a3" />
                {comptes.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
              </Picker>
            </View>
          </View>
          <View style={styles.formRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catégorie</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={categorieId} onValueChange={(val) => { setCategorieId(val); setSousCategorieId(''); }} style={styles.picker}>
                  <Picker.Item label="Sélectionner..." value="" color="#8a93a3" />
                  {categoriesFiltrees.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
                </Picker>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sous-catégorie</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={sousCategorieId} onValueChange={setSousCategorieId} style={styles.picker} enabled={categorieId !== ''}>
                  <Picker.Item label="Optionnel" value="" color="#8a93a3" />
                  {sousCategoriesFiltrees.map((sc: any) => <Picker.Item key={sc.id} label={sc.nom} value={sc.id} />)}
                </Picker>
              </View>
            </View>
          </View>
        </>
      )}

      <View style={styles.inputGroup}><Text style={styles.label}>Libellé</Text><TextInput style={styles.input} value={libelle} onChangeText={setLibelle} placeholder="Titre de l'opération" placeholderTextColor="#8a93a3" /></View>
      <View style={styles.inputGroup}><Text style={styles.label}>Commentaire</Text><TextInput style={[styles.input, {height: 50}]} value={note} onChangeText={setNote} multiline placeholder="Notes optionnelles..." placeholderTextColor="#8a93a3" /></View>
      
      <TouchableOpacity onPress={handleSubmit} style={[styles.submitBtn, { backgroundColor: typeTx === 'DEPENSE' ? '#ef4444' : typeTx === 'REVENU' ? '#10b981' : '#3b82f6' }]}>
        <Text style={styles.submitBtnText}>Enregistrer la transaction</Text>
      </TouchableOpacity>
    </View>
  );
}

export function TransactionsRecentesTable({ donnees, filtres, setFiltres, comptes, categories, sousCategories }: any) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.tableHeader}>
        <Text style={styles.sectionTitle}>Transactions Récentes</Text>
        <TextInput style={styles.searchInputRight} placeholder="Recherche libellé..." placeholderTextColor="#8a93a3" value={filtres.libelle} onChangeText={(t) => setFiltres({...filtres, libelle: t})} />
      </View>
      
      <View style={styles.formRow}>
        <View style={styles.pickerContainerFlex}>
          <Picker selectedValue={filtres.compteId} onValueChange={(t) => setFiltres({...filtres, compteId: t})} style={styles.pickerMini}>
            <Picker.Item label="Tous les comptes" value="" color="#8a93a3" />
            {comptes.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
          </Picker>
        </View>
        <View style={styles.pickerContainerFlex}>
          <Picker selectedValue={filtres.categorieId} onValueChange={(t) => setFiltres({...filtres, categorieId: t})} style={styles.pickerMini}>
            <Picker.Item label="Toutes catégories" value="" color="#8a93a3" />
            {categories.map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
          </Picker>
        </View>
        <View style={styles.pickerContainerFlex}>
          <Picker selectedValue={filtres.sousCategorieId} onValueChange={(t) => setFiltres({...filtres, sousCategorieId: t})} style={styles.pickerMini} enabled={filtres.categorieId !== ''}>
            <Picker.Item label="Toutes S-Catégories" value="" color="#8a93a3" />
            {sousCategories.filter((sc: any) => sc.categorie_id === filtres.categorieId).map((c: any) => <Picker.Item key={c.id} label={c.nom} value={c.id} />)}
          </Picker>
        </View>
      </View>

      <FlatList
        data={donnees} keyExtractor={item => item.id}
        style={{ marginTop: 10 }}
        renderItem={({ item }) => (
          <View style={styles.transactionRow}>
            <Text style={styles.txDate}>{item.date_operation}</Text>
            <View style={styles.txInfo}>
              <Text style={styles.txLibelle}>{item.libelle}</Text>
              <Text style={styles.txCompteRef}>{item.nomCompte} {item.nomCategorie ? ` • ${item.nomCategorie}` : ''}</Text>
            </View>
            <View style={styles.txActionGroup}>
              <Text style={[styles.txMontant, item.sens === 'ENTREE' ? styles.txPositive : styles.txNegative]}>
                {item.sens === 'ENTREE' ? '+' : '-'}{Number(item.montant).toFixed(2)} €
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.placeholderText}>Aucune donnée.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  typeSelector: { flexDirection: 'row', gap: 8, marginBottom: 15 },
  typeBtn: { flex: 1, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#262b36', alignItems: 'center', backgroundColor: '#0f1115' },
  typeBtnActive: { borderColor: '#c08a2d', backgroundColor: '#262b36' },
  typeBtnText: { color: '#8a93a3', fontSize: 12, fontWeight: 'bold' },
  typeBtnTextActive: { color: '#e8edf4' },
  formRow: { flexDirection: 'row', gap: 10, marginBottom: 5 },
  inputGroup: { flex: 1, marginBottom: 10 },
  label: { color: '#8a93a3', fontSize: 11, marginBottom: 4, fontWeight: '600' },
  input: { backgroundColor: '#0f1115', color: '#e8edf4', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#262b36', fontSize: 13 },
  pickerContainer: { backgroundColor: '#0f1115', borderRadius: 6, borderWidth: 1, borderColor: '#262b36', overflow: 'hidden', height: 40, justifyContent: 'center' },
  pickerContainerFlex: { flex: 1, backgroundColor: '#0f1115', borderRadius: 6, borderWidth: 1, borderColor: '#262b36', overflow: 'hidden', height: 32, justifyContent: 'center' },
  picker: { color: '#e8edf4', backgroundColor: '#0f1115', borderWidth: 0, outlineStyle: 'none' as any },
  pickerMini: { color: '#e8edf4', backgroundColor: '#0f1115', borderWidth: 0, fontSize: 11, outlineStyle: 'none' as any },
  submitBtn: { padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 5 },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#e8edf4', fontSize: 15, fontWeight: 'bold' },
  searchInputRight: { backgroundColor: '#0f1115', color: '#e8edf4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: '#262b36', width: 140, fontSize: 12 },
  transactionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#262b36' },
  txDate: { color: '#8a93a3', fontSize: 11, width: 80 },
  txInfo: { flex: 1 },
  txLibelle: { color: '#e8edf4', fontSize: 12, fontWeight: '500' },
  txCompteRef: { color: '#8a93a3', fontSize: 10, marginTop: 2 },
  txActionGroup: { alignItems: 'flex-end', gap: 4 },
  txMontant: { fontWeight: 'bold', fontSize: 13 },
  txPositive: { color: '#10b981' },
  txNegative: { color: '#e8edf4' },
  placeholderText: { color: '#8a93a3', textAlign: 'center', fontStyle: 'italic', marginVertical: 20 },
});