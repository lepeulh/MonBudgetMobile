import { SectionCategories } from '@/app/config/SectionCategories';
import { SectionComptes } from '@/app/config/SectionComptes';
import { SectionParametresUtilisateur } from '@/app/config/SectionUtilisateur';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Section = 'comptes' | 'categories' | 'parametres';

const C = {
  bg: '#0f1115', card: '#171a21', border: '#262b36',
  text: '#e8edf4', sub: '#8a93a3', primary: '#c08a2d',
};

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'comptes',    label: '🏦 Comptes' },
  { id: 'categories', label: '🏷 Catégories' },
  { id: 'parametres', label: '⚙️ Paramètres' },
];

export default function ConfigurationScreen() {
  const [section, setSection] = useState<Section>('comptes');

  return (
    <View style={s.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={s.pageTitle}>Configuration</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={s.navScroll} contentContainerStyle={s.navContent}>
          {SECTIONS.map(({ id, label }) => (
            <TouchableOpacity key={id} onPress={() => setSection(id)}
              style={[s.navBtn, section === id && s.navBtnActive]}>
              <Text style={[s.navBtnText, section === id && s.navBtnTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {section === 'comptes'    && <SectionComptes />}
        {section === 'categories' && <SectionCategories />}
        {section === 'parametres' && <SectionParametresUtilisateur />}
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  container:        { flex: 1, backgroundColor: C.bg },
  pageTitle:        { fontSize: 26, fontWeight: 'bold', color: C.text, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  navScroll:        { flexGrow: 0 },
  navContent:       { paddingHorizontal: 16, paddingVertical: 8, gap: 8, flexDirection: 'row' },
  navBtn:           { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  navBtnActive:     { backgroundColor: C.primary, borderColor: C.primary },
  navBtnText:       { color: C.sub, fontSize: 13, fontWeight: '600' },
  navBtnTextActive: { color: 'white' },
});