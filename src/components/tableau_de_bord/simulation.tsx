import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';

type SimTab = 'CREDIT' | 'EPARGNE' | 'PROJECTION';

export function Simulation({ transactions }: { transactions: any[] }) {
  const [onglet, setOnglet] = useState<SimTab>('CREDIT');

  // --- ÉTATS SIMULATEUR CRÉDIT ---
  const [crCapital, setCrCapital] = useState('200000');
  const [crTaux, setCrTaux] = useState('3.5');
  const [crDuree, setCrDuree] = useState('240'); // en mois

  const resCredit = useMemo(() => {
    const c = Number(crCapital) || 0;
    const tAnnuel = Number(crTaux) || 0;
    const n = Number(crDuree) || 1;

    if (c <= 0 || n <= 0) return { mensualite: 0, coutTotal: 0, interets: 0 };

    const tMensuel = (tAnnuel / 100) / 12;
    let mensualite = 0;
    
    if (tMensuel === 0) {
      mensualite = c / n;
    } else {
      mensualite = (c * tMensuel) / (1 - Math.pow(1 + tMensuel, -n));
    }

    const coutTotal = mensualite * n;
    const interets = coutTotal - c;

    return { mensualite, coutTotal, interets };
  }, [crCapital, crTaux, crDuree]);

  // --- ÉTATS SIMULATEUR ÉPARGNE ---
  const [epCapital, setEpCapital] = useState('5000');
  const [epVersement, setEpVersement] = useState('200');
  const [epTaux, setEpTaux] = useState('5');
  const [epAnnees, setEpAnnees] = useState('10');

  const resEpargne = useMemo(() => {
    const c = Number(epCapital) || 0;
    const v = Number(epVersement) || 0;
    const tAnnuel = Number(epTaux) || 0;
    const annees = Number(epAnnees) || 0;
    const moisTotal = annees * 12;

    const tMensuel = (tAnnuel / 100) / 12;
    let capitalFinal = c * Math.pow(1 + tMensuel, moisTotal);
    
    if (tMensuel > 0) {
      capitalFinal += v * ((Math.pow(1 + tMensuel, moisTotal) - 1) / tMensuel);
    } else {
      capitalFinal += v * moisTotal;
    }

    const totalVerse = c + (v * moisTotal);
    const plusValue = capitalFinal - totalVerse;

    return { capitalFinal, totalVerse, plusValue };
  }, [epCapital, epVersement, epTaux, epAnnees]);

  // --- ÉTATS SIMULATEUR PROJECTION ---
  const [prRevenus, setPrRevenus] = useState('0');
  const [prDepenses, setPrDepenses] = useState('0');
  const [prMois, setPrMois] = useState('12');

  // Pré-remplissage basé sur l'historique réel
  useEffect(() => {
    if (!transactions || transactions.length === 0) return;

    let revMois = 0;
    let depMois = 0;
    const now = new Date();
    const moisEnCours = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    transactions.forEach(tx => {
      if (tx.date_operation.startsWith(moisEnCours)) {
        if (tx.type_operation === 'REVENU' && tx.sens === 'ENTREE') revMois += Number(tx.montant);
        if (tx.type_operation === 'DEPENSE' && tx.sens === 'SORTIE') depMois += Number(tx.montant);
      }
    });

    setPrRevenus(revMois.toString());
    setPrDepenses(depMois.toString());
  }, [transactions]);

  const resProjection = useMemo(() => {
    const r = Number(prRevenus) || 0;
    const d = Number(prDepenses) || 0;
    const m = Number(prMois) || 0;

    const epargneMensuelle = r - d;
    const epargneCumulee = epargneMensuelle * m;
    const tauxEpargne = r > 0 ? (epargneMensuelle / r) * 100 : 0;

    return { epargneMensuelle, epargneCumulee, tauxEpargne };
  }, [prRevenus, prDepenses, prMois]);


  return (
    <View style={styles.container}>
      {/* Navigation Interne */}
      <View style={styles.sousNav}>
        <TouchableOpacity style={[styles.sousNavBtn, onglet === 'CREDIT' && styles.sousNavBtnActif]} onPress={() => setOnglet('CREDIT')}>
          <Text style={[styles.sousNavTexte, onglet === 'CREDIT' && styles.sousNavTexteActif]}>💳 Crédit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sousNavBtn, onglet === 'EPARGNE' && styles.sousNavBtnActif]} onPress={() => setOnglet('EPARGNE')}>
          <Text style={[styles.sousNavTexte, onglet === 'EPARGNE' && styles.sousNavTexteActif]}>💰 Épargne</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sousNavBtn, onglet === 'PROJECTION' && styles.sousNavBtnActif]} onPress={() => setOnglet('PROJECTION')}>
          <Text style={[styles.sousNavTexte, onglet === 'PROJECTION' && styles.sousNavTexteActif]}>📈 Projection</Text>
        </TouchableOpacity>
      </View>

      {/* --- SECTION CRÉDIT --- */}
      {onglet === 'CREDIT' && (
        <View style={styles.grid}>
          <View style={styles.formPanel}>
            <Text style={styles.sectionTitle}>Paramètres du crédit</Text>
            <View style={styles.inputGroup}><Text style={styles.label}>Montant emprunté (€)</Text><TextInput style={styles.input} value={crCapital} onChangeText={setCrCapital} keyboardType="numeric" /></View>
            <View style={styles.row}>
              <View style={styles.inputGroup}><Text style={styles.label}>Taux annuel (%)</Text><TextInput style={styles.input} value={crTaux} onChangeText={setCrTaux} keyboardType="numeric" /></View>
              <View style={styles.inputGroup}><Text style={styles.label}>Durée (mois)</Text><TextInput style={styles.input} value={crDuree} onChangeText={setCrDuree} keyboardType="numeric" /></View>
            </View>
          </View>
          <View style={styles.resultPanel}>
            <Text style={styles.resultLabel}>Mensualité estimée</Text>
            <Text style={styles.resultValueMain}>{resCredit.mensualite.toFixed(2)} €</Text>
            <View style={styles.divider} />
            <View style={styles.resultRow}><Text style={styles.resultLabel}>Coût total</Text><Text style={styles.resultValue}>{resCredit.coutTotal.toFixed(2)} €</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultLabel}>Dont intérêts</Text><Text style={styles.resultValueWarning}>{resCredit.interets.toFixed(2)} €</Text></View>
          </View>
        </View>
      )}

      {/* --- SECTION ÉPARGNE --- */}
      {onglet === 'EPARGNE' && (
        <View style={styles.grid}>
          <View style={styles.formPanel}>
            <Text style={styles.sectionTitle}>Paramètres du placement</Text>
            <View style={styles.inputGroup}><Text style={styles.label}>Capital initial (€)</Text><TextInput style={styles.input} value={epCapital} onChangeText={setEpCapital} keyboardType="numeric" /></View>
            <View style={styles.inputGroup}><Text style={styles.label}>Versement mensuel (€)</Text><TextInput style={styles.input} value={epVersement} onChangeText={setEpVersement} keyboardType="numeric" /></View>
            <View style={styles.row}>
              <View style={styles.inputGroup}><Text style={styles.label}>Rendement annuel (%)</Text><TextInput style={styles.input} value={epTaux} onChangeText={setEpTaux} keyboardType="numeric" /></View>
              <View style={styles.inputGroup}><Text style={styles.label}>Horizon (années)</Text><TextInput style={styles.input} value={epAnnees} onChangeText={setEpAnnees} keyboardType="numeric" /></View>
            </View>
          </View>
          <View style={styles.resultPanel}>
            <Text style={styles.resultLabel}>Capital final estimé</Text>
            <Text style={styles.resultValueMain}>{resEpargne.capitalFinal.toFixed(2)} €</Text>
            <View style={styles.divider} />
            <View style={styles.resultRow}><Text style={styles.resultLabel}>Total versé</Text><Text style={styles.resultValue}>{resEpargne.totalVerse.toFixed(2)} €</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultLabel}>Plus-value (Intérêts)</Text><Text style={styles.resultValueSuccess}>+{resEpargne.plusValue.toFixed(2)} €</Text></View>
          </View>
        </View>
      )}

      {/* --- SECTION PROJECTION --- */}
      {onglet === 'PROJECTION' && (
        <View style={styles.grid}>
          <View style={styles.formPanel}>
            <Text style={styles.sectionTitle}>Projection budgétaire</Text>
            <Text style={styles.infoText}>Pré-rempli avec vos données du mois en cours.</Text>
            <View style={styles.inputGroup}><Text style={styles.label}>Revenus mensuels prévus (€)</Text><TextInput style={styles.input} value={prRevenus} onChangeText={setPrRevenus} keyboardType="numeric" /></View>
            <View style={styles.inputGroup}><Text style={styles.label}>Dépenses mensuelles prévues (€)</Text><TextInput style={styles.input} value={prDepenses} onChangeText={setPrDepenses} keyboardType="numeric" /></View>
            <View style={styles.inputGroup}><Text style={styles.label}>Horizon de projection (mois)</Text><TextInput style={styles.input} value={prMois} onChangeText={setPrMois} keyboardType="numeric" /></View>
          </View>
          <View style={styles.resultPanel}>
            <Text style={styles.resultLabel}>Épargne cumulée projetée</Text>
            <Text style={[styles.resultValueMain, resProjection.epargneCumulee < 0 && {color: '#ef4444'}]}>{resProjection.epargneCumulee.toFixed(2)} €</Text>
            <View style={styles.divider} />
            <View style={styles.resultRow}><Text style={styles.resultLabel}>Capacité d'épargne mensuelle</Text><Text style={[styles.resultValue, resProjection.epargneMensuelle < 0 && {color: '#ef4444'}]}>{resProjection.epargneMensuelle.toFixed(2)} €</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultLabel}>Taux d'épargne estimé</Text><Text style={styles.resultValue}>{resProjection.tauxEpargne.toFixed(1)} %</Text></View>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sousNav: { flexDirection: 'row', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  sousNavBtn: { backgroundColor: '#171a21', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#262b36' },
  sousNavBtnActif: { backgroundColor: '#c08a2d', borderColor: '#c08a2d' },
  sousNavTexte: { color: '#8a93a3', fontSize: 13, fontWeight: '500' },
  sousNavTexteActif: { color: '#ffffff', fontWeight: 'bold' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  formPanel: { flex: 1, minWidth: 280, backgroundColor: '#171a21', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#262b36' },
  resultPanel: { flex: 1, minWidth: 280, backgroundColor: '#171a21', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#262b36', justifyContent: 'center' },
  
  sectionTitle: { color: '#e8edf4', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  infoText: { color: '#8a93a3', fontSize: 12, fontStyle: 'italic', marginBottom: 15 },
  row: { flexDirection: 'row', gap: 10 },
  inputGroup: { flex: 1, marginBottom: 15 },
  label: { color: '#8a93a3', fontSize: 11, marginBottom: 5, fontWeight: '600', textTransform: 'uppercase' },
  input: { backgroundColor: '#0f1115', color: '#e8edf4', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#262b36', fontSize: 14 },
  
  resultLabel: { color: '#8a93a3', fontSize: 12, textTransform: 'uppercase', fontWeight: '600', marginBottom: 5 },
  resultValueMain: { color: '#c08a2d', fontSize: 36, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#262b36', marginVertical: 20 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  resultValue: { color: '#e8edf4', fontSize: 16, fontWeight: 'bold' },
  resultValueSuccess: { color: '#10b981', fontSize: 16, fontWeight: 'bold' },
  resultValueWarning: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' }
});