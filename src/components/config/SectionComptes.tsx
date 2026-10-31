import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Switch, Alert, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

type Compte = {
  id: string; nom: string; type: string;
  devise: string; decouvert_autorise: boolean; actif: boolean;
};

const C = {
  bg: '#0f1115', card: '#171a21', border: '#262b36',
  text: '#e8edf4', sub: '#8a93a3', primary: '#c08a2d', danger: '#ef4444',
};

export function SectionComptes() {
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState('');
  const [type, setType] = useState('COURANT');
  const [devise, setDevise] = useState('EUR');
  const [decouvert, setDecouvert] = useState(true);
  const [saving, setSaving] = useState(false);

  const charger = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('comptes').select('*').order('created_at');
    if (data) setComptes(data);
    setLoading(false);
  }, []);

  useEffect(() => { charger(); }, [charger]);

  async function ajouter() {
    if (!nom.trim()) { Alert.alert('Erreur', 'Le nom est obligatoire.'); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from('comptes').insert({
      user_id: user.id, nom: nom.trim(), type,
      devise: devise.trim().toUpperCase() || 'EUR',
      decouvert_autorise: decouvert, actif: true,
    });
    if (error) Alert.alert('Erreur', error.message);
    else { setNom(''); setType('COURANT'); setDevise('EUR'); setDecouvert(true); charger(); }
    setSaving(false);
  }

  async function toggleActif(id: string, actif: boolean) {
    await supabase.from('comptes').update({ actif: !actif }).eq('id', id);
    charger();
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content}>
      <View style={s.card}>
        <Text style={s.cardTitle}>Nouveau compte</Text>
        <Text style={s.label}>Nom</Text>
        <TextInput style={s.input} value={nom} onChangeText={setNom}
          placeholder="ex: Boursorama" placeholderTextColor={C.sub} />
        <Text style={s.label}>Type</Text>
        <View style={s.toggleRow}>
          {['COURANT', 'EPARGNE'].map(t => (
            <TouchableOpacity key={t}
              style={[s.toggleBtn, type === t && s.toggleBtnActive]}
              onPress={() => setType(t)}>
              <Text style={[s.toggleText, type === t && s.toggleTextActive]}>
                {t === 'COURANT' ? '💳 Courant' : '🏦 Épargne'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.label}>Devise</Text>
        <TextInput style={[s.input, { width: 100 }]} value={devise}
          onChangeText={setDevise} placeholder="EUR"
          placeholderTextColor={C.sub} maxLength={3} autoCapitalize="characters" />
        <View style={s.switchRow}>
          <Text style={s.label}>Autoriser solde négatif</Text>
          <Switch value={decouvert} onValueChange={setDecouvert}
            trackColor={{ false: C.border, true: C.primary }} thumbColor={C.text} />
        </View>
        <TouchableOpacity style={s.btnPrimary} onPress={ajouter} disabled={saving}>
          {saving ? <ActivityIndicator color="white" />
            : <Text style={s.btnPrimaryText}>Ajouter</Text>}
        </TouchableOpacity>
      </View>

      <Text style={s.sectionTitle}>Mes comptes ({comptes.length})</Text>
      {loading ? <ActivityIndicator color={C.primary} />
        : comptes.map(c => (
          <View key={c.id} style={[s.card, !c.actif && { opacity: 0.5 }]}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{c.nom}
                  <Text style={{ color: C.primary }}> · {c.devise}</Text>
                </Text>
                <Text style={s.sub}>
                  {c.type} {c.decouvert_autorise ? '· Découvert OK' : '· Sans découvert'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => toggleActif(c.id, c.actif)}>
                <Ionicons
                  name={c.actif ? 'eye-outline' : 'eye-off-outline'} size={20} color={C.sub} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content:        { padding: 16, gap: 12, paddingBottom: 40 },
  card:           { backgroundColor: C.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border },
  cardTitle:      { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 4 },
  label:          { color: C.sub, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 8 },
  sub:            { color: C.sub, fontSize: 12, marginTop: 2 },
  input:          { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 12, color: C.text, marginBottom: 4 },
  row:            { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleRow:      { flexDirection: 'row', gap: 8, marginBottom: 8 },
  toggleBtn:      { flex: 1, padding: 10, borderRadius: 8, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  toggleBtnActive:{ backgroundColor: C.primary, borderColor: C.primary },
  toggleText:     { color: C.sub, fontSize: 13, fontWeight: '600' },
  toggleTextActive:{ color: 'white' },
  switchRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  btnPrimary:     { backgroundColor: C.primary, borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  btnPrimaryText: { color: 'white', fontWeight: '700', fontSize: 15 },
  sectionTitle:   { color: C.sub, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 8 },
});