import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const C = { 
  bg: '#0f1115', 
  card: '#171a21', 
  border: '#262b36', 
  text: '#e8edf4', 
  sub: '#8a93a3', 
  primary: '#c08a2d', 
  danger: '#ef4444' 
};

const DEVISES = ['EUR', 'USD', 'GBP', 'CHF', 'MAD', 'XOF', 'DZD'];

export function SectionParametresUtilisateur() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deviseActive, setDeviseActive] = useState('EUR');

  async function deconnecter() {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { 
        text: 'Déconnecter', 
        style: 'destructive', 
        onPress: async () => {
          setLoading(true);
          await supabase.auth.signOut();
        }
      }
    ]);
  }

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content}>
      {/* --- SECTION COMPTE & PROFIL --- */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Compte & Profil</Text>
        <Text style={s.label}>Email</Text>
        <Text style={s.sub}>{session?.user.email}</Text>
      </View>

      {/* --- SECTION APPARENCE & DEVISE --- */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Thème visuel</Text>
        <Text style={s.sub}>
          Le thème suit automatiquement votre téléphone. La gestion manuelle arrivera dans une prochaine version.
        </Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Devise d'affichage</Text>
        <Text style={[s.sub, { marginBottom: 12 }]}>
          La conversion multi-devise arrivera prochainement.
        </Text>
        <View style={s.deviseGrid}>
          {DEVISES.map(d => (
            <TouchableOpacity 
              key={d} 
              style={[s.deviseBtn, d === deviseActive && s.deviseBtnActive]}
              onPress={() => setDeviseActive(d)}
            >
              <Text style={[s.deviseText, d === deviseActive && s.deviseTextActive]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* --- ACTION DE DÉCONNEXION --- */}
      <TouchableOpacity 
        style={[s.btnPrimary, { backgroundColor: C.danger, marginTop: 8 }]}
        onPress={deconnecter} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={s.btnPrimaryText}>Se déconnecter</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  content:          { padding: 16, gap: 12 },
  card:             { backgroundColor: C.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: C.border },
  cardTitle:        { color: C.text, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  label:            { color: C.sub, fontSize: 12, fontWeight: '600', marginBottom: 4, marginTop: 4 },
  sub:              { color: C.sub, fontSize: 13 },
  deviseGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  deviseBtn:        { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border },
  deviseBtnActive:  { backgroundColor: C.primary, borderColor: C.primary },
  deviseText:       { color: C.sub, fontWeight: '600' },
  deviseTextActive: { color: 'white' },
  btnPrimary:       { backgroundColor: C.primary, borderRadius: 10, padding: 14, alignItems: 'center' },
  btnPrimaryText:   { color: 'white', fontWeight: '700', fontSize: 15 },
});