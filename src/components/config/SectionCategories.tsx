import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Modal, Pressable, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';

// ── Types ─────────────────────────────────────────────────────────────────────
type SousCategorie = { id: string; nom: string; };
type Categorie = {
  id: string; nom: string; type_operation: string;
  sous_categories: SousCategorie[];
};

// ── Couleurs ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#0f1115', card: '#171a21', border: '#262b36',
  text: '#e8edf4', sub: '#8a93a3', primary: '#c08a2d',
  danger: '#ef4444', success: '#10b981',
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export function SectionCategories() {
  const [categories, setCategories]     = useState<Categorie[]>([]);
  const [loading, setLoading]           = useState(true);
  const [typeOp, setTypeOp]             = useState<'DEPENSE' | 'REVENU'>('DEPENSE');
  const [showForm, setShowForm]         = useState(false);
  const [nomCat, setNomCat]             = useState('');
  const [saving, setSaving]             = useState(false);
  
  // Renommage inline
  const [enEdition, setEnEdition]       = useState<string | null>(null);
  const [nomEdition, setNomEdition]     = useState('');
  
  // Confirmation suppression (ID de la catégorie au lieu de l'objet complet pour stabiliser)
  const [confirmSupprId, setConfirmSupprId] = useState<string | null>(null);
  
  // ID de la catégorie sélectionnée pour la modale sous-catégories
  const [catSelectionneeId, setCatSelectionneeId] = useState<string | null>(null);

  const charger = useCallback(async () => {
    setLoading(true);
    const { data: cats } = await supabase.from('categories').select('*').order('nom');
    const { data: sous } = await supabase.from('sous_categories').select('*').order('nom');
    if (cats) {
      setCategories(cats.map(c => ({
        ...c, 
        sous_categories: sous?.filter(s => s.categorie_id === c.id) ?? []
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { charger(); }, [charger]);

  // ── Ajouter une catégorie ──────────────────────────────────────────────────
  async function ajouterCategorie() {
    if (!nomCat.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { error } = await supabase.from('categories').insert({
      user_id: user.id, nom: nomCat.trim(),
      type_operation: typeOp, icone: '📦', actif: true
    });
    if (!error) { setNomCat(''); setShowForm(false); charger(); }
    setSaving(false);
  }

  // ── Renommer une catégorie ─────────────────────────────────────────────────
  async function renommerCategorie(id: string) {
    if (!nomEdition.trim()) { setEnEdition(null); return; }
    await supabase.from('categories').update({ nom: nomEdition.trim() }).eq('id', id);
    setEnEdition(null);
    charger();
  }

  // ── Supprimer une catégorie ────────────────────────────────────────────────
  async function supprimerCategorie(id: string) {
    await supabase.from('sous_categories').delete().eq('categorie_id', id);
    await supabase.from('categories').delete().eq('id', id);
    setConfirmSupprId(null);
    charger();
  }

  const filtrees = categories.filter(c => c.type_operation === typeOp);
  const nbDep    = categories.filter(c => c.type_operation === 'DEPENSE').length;
  const nbRev    = categories.filter(c => c.type_operation === 'REVENU').length;

  // Retrouver la catégorie à supprimer ou à afficher en modale en toute sécurité
  const catASupprimer = categories.find(c => c.id === confirmSupprId);
  const catSelectionnee = categories.find(c => c.id === catSelectionneeId);

  return (
    <View style={{ flex: 1 }}>

      {/* ── Onglets Dépense / Revenu ──────────────────────────────────────── */}
      <View style={s.filtreRow}>
        {(['DEPENSE', 'REVENU'] as const).map(t => (
          <TouchableOpacity key={t}
            style={[s.filtreBtn, typeOp === t && s.filtreBtnActive]}
            onPress={() => setTypeOp(t)}>
            <Text style={[s.filtreBtnText, typeOp === t && s.filtreBtnTextActive]}>
              {t === 'DEPENSE' ? `📤 Dépenses (${nbDep})` : `📥 Revenus (${nbRev})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Bouton + Nouvelle catégorie ───────────────────────────────────── */}
      <TouchableOpacity style={s.btnAjouter} onPress={() => setShowForm(!showForm)}>
        <Ionicons name={showForm ? 'remove' : 'add'} size={18} color={C.primary} />
        <Text style={s.btnAjouterText}>{showForm ? 'Annuler' : 'Nouvelle catégorie'}</Text>
      </TouchableOpacity>

      {/* ── Formulaire ────────────────────────────────────────────────────── */}
      {showForm && (
        <View style={s.formCard}>
          <TextInput
            style={s.input} value={nomCat} onChangeText={setNomCat}
            placeholder="Nom de la catégorie" placeholderTextColor={C.sub}
            autoFocus onSubmitEditing={ajouterCategorie}
          />
          <TouchableOpacity style={s.btnPrimary} onPress={ajouterCategorie} disabled={saving}>
            {saving
              ? <ActivityIndicator color="white" />
              : <Text style={s.btnPrimaryText}>Ajouter</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* ── En-tête tableau ───────────────────────────────────────────────── */}
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderText, { flex: 1 }]}>Catégorie</Text>
        <Text style={[s.tableHeaderText, { width: 70, textAlign: 'center' }]}>Sous-cat.</Text>
        <Text style={[s.tableHeaderText, { width: 72, textAlign: 'center' }]}>Actions</Text>
      </View>

      {/* ── Liste ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginTop: 24 }} />
      ) : filtrees.length === 0 ? (
        <Text style={s.emptyText}>Aucune catégorie. Crées-en une ci-dessus.</Text>
      ) : (
        <ScrollView>
          {filtrees.map((cat, index) => (
            <View key={cat.id}
              style={[s.ligne, index % 2 === 0 && s.ligneAlternee]}>

              {/* Nom (ou champ de renommage) */}
              <TouchableOpacity style={{ flex: 1 }}
                onPress={() => setCatSelectionneeId(cat.id)}>
                {enEdition === cat.id ? (
                  <TextInput
                    style={[s.inputInline]}
                    value={nomEdition}
                    onChangeText={setNomEdition}
                    autoFocus
                    onSubmitEditing={() => renommerCategorie(cat.id)}
                    onBlur={() => renommerCategorie(cat.id)}
                  />
                ) : (
                  <Text style={s.ligneNom}>{cat.nom}</Text>
                )}
              </TouchableOpacity>

              {/* Compteur sous-cats */}
              <View style={[s.badge, { width: 70, alignItems: 'center' }]}>
                <Text style={s.badgeText}>{cat.sous_categories.length}</Text>
              </View>

              {/* Actions */}
              <View style={[s.row, { width: 72, justifyContent: 'flex-end', gap: 12 }]}>
                {enEdition === cat.id ? (
                  <>
                    <TouchableOpacity onPress={() => renommerCategorie(cat.id)}>
                      <Ionicons name="checkmark" size={18} color={C.success} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEnEdition(null)}>
                      <Ionicons name="close" size={18} color={C.sub} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => { setEnEdition(cat.id); setNomEdition(cat.nom); }}>
                      <Ionicons name="pencil-outline" size={17} color={C.sub} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setConfirmSupprId(cat.id)}>
                      <Ionicons name="trash-outline" size={17} color={C.danger} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── Modal confirmation suppression ────────────────────────────────── */}
      <Modal visible={!!catASupprimer} animationType="fade" transparent
        onRequestClose={() => setConfirmSupprId(null)}>
        <Pressable style={s.overlay} onPress={() => setConfirmSupprId(null)}>
          <Pressable style={s.confirmBoite} onPress={() => {}}>
            <Text style={s.confirmTitre}>Supprimer la catégorie</Text>
            <Text style={s.confirmTexte}>
              Supprimer «{catASupprimer?.nom}» et ses{' '}
              {catASupprimer?.sous_categories.length} sous-catégorie(s) ?{'\n'}
              Cette action est irréversible.
            </Text>
            <View style={s.row}>
              <TouchableOpacity
                style={[s.btnPrimary, { flex: 1, backgroundColor: C.border }]}
                onPress={() => setConfirmSupprId(null)}>
                <Text style={s.btnPrimaryText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.btnPrimary, { flex: 1, backgroundColor: C.danger }]}
                onPress={() => catASupprimer && supprimerCategorie(catASupprimer.id)}>
                <Text style={s.btnPrimaryText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Modal sous-catégories ─────────────────────────────────────────── */}
      {catSelectionnee && (
        <ModalSousCategories
          categorie={catSelectionnee}
          onClose={() => { setCatSelectionneeId(null); charger(); }}
        />
      )}

    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODAL SOUS-CATÉGORIES (Isolé hors du composant principal)
// ══════════════════════════════════════════════════════════════════════════════
function ModalSousCategories({
  categorie, onClose,
}: { categorie: Categorie; onClose: () => void; }) {
  const [sousCategories, setSousCategories] = useState<SousCategorie[]>(categorie.sous_categories);
  const [nomNouveau, setNomNouveau]         = useState('');
  const [enEdition, setEnEdition]           = useState<string | null>(null);
  const [nomEdition, setNomEdition]         = useState('');
  const [confirmSupprId, setConfirmSupprId] = useState<string | null>(null);
  const [saving, setSaving]                 = useState(false);

  async function ajouter() {
    if (!nomNouveau.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { data, error } = await supabase.from('sous_categories').insert({
      user_id: user.id, categorie_id: categorie.id, nom: nomNouveau.trim()
    }).select().single();
    if (!error && data) { setSousCategories(p => [...p, data]); setNomNouveau(''); }
    setSaving(false);
  }

  async function renommer(id: string) {
    if (!nomEdition.trim()) { setEnEdition(null); return; }
    await supabase.from('sous_categories').update({ nom: nomEdition.trim() }).eq('id', id);
    setSousCategories(p => p.map(s => s.id === id ? { ...s, nom: nomEdition.trim() } : s));
    setEnEdition(null);
  }

  async function supprimer(id: string) {
    await supabase.from('sous_categories').delete().eq('id', id);
    setSousCategories(p => p.filter(s => s.id !== id));
    setConfirmSupprId(null);
  }

  const scASupprimer = sousCategories.find(s => s.id === confirmSupprId);

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.modalBoite} onPress={() => {}}>

          {/* En-tête */}
          <View style={s.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.modalTitre}>{categorie.nom}</Text>
              <Text style={{ color: C.sub, fontSize: 12 }}>
                {sousCategories.length} sous-catégorie(s)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={C.sub} />
            </TouchableOpacity>
          </View>

          {/* Liste sous-catégories */}
          <ScrollView style={{ maxHeight: 280 }}>
            {sousCategories.length === 0 ? (
              <Text style={[s.emptyText, { marginTop: 12 }]}>
                Aucune sous-catégorie pour l'instant.
              </Text>
            ) : sousCategories.map(sc => (
              <View key={sc.id} style={s.scLigne}>
                {enEdition === sc.id ? (
                  <View style={[s.row, { flex: 1, gap: 8 }]}>
                    <TextInput
                      style={[s.input, { flex: 1, marginBottom: 0 }]}
                      value={nomEdition} onChangeText={setNomEdition}
                      autoFocus onSubmitEditing={() => renommer(sc.id)}
                      onBlur={() => renommer(sc.id)}
                    />
                    <TouchableOpacity onPress={() => renommer(sc.id)}>
                      <Ionicons name="checkmark" size={20} color={C.success} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEnEdition(null)}>
                      <Ionicons name="close" size={20} color={C.sub} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <Text style={[s.ligneNom, { flex: 1 }]}>• {sc.nom}</Text>
                    <TouchableOpacity style={s.scAction}
                      onPress={() => { setEnEdition(sc.id); setNomEdition(sc.nom); }}>
                      <Ionicons name="pencil-outline" size={16} color={C.sub} />
                    </TouchableOpacity>
                    <TouchableOpacity style={s.scAction}
                      onPress={() => setConfirmSupprId(sc.id)}>
                      <Ionicons name="trash-outline" size={16} color={C.danger} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Ajouter */}
          <View style={[s.row, { gap: 8, marginTop: 16 }]}>
            <TextInput
              style={[s.input, { flex: 1, marginBottom: 0 }]}
              value={nomNouveau} onChangeText={setNomNouveau}
              placeholder="Nouvelle sous-catégorie" placeholderTextColor={C.sub}
              onSubmitEditing={ajouter}
            />
            <TouchableOpacity style={s.btnAjouterSc} onPress={ajouter} disabled={saving}>
              {saving
                ? <ActivityIndicator color="white" size="small" />
                : <Ionicons name="add" size={20} color="white" />}
            </TouchableOpacity>
          </View>

          {/* Confirmation suppression sous-cat */}
          {scASupprimer && (
            <View style={s.confirmInline}>
              <Text style={{ color: C.text, fontSize: 13, flex: 1 }}>
                Supprimer «{scASupprimer.nom}» ?
              </Text>
              <TouchableOpacity style={[s.btnSmall, { backgroundColor: C.border }]}
                onPress={() => setConfirmSupprId(null)}>
                <Text style={s.btnSmallText}>Non</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btnSmall, { backgroundColor: C.danger }]}
                onPress={() => supprimer(scASupprimer.id)}>
                <Text style={s.btnSmallText}>Oui</Text>
              </TouchableOpacity>
            </View>
          )}

        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  filtreRow:          { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border },
  filtreBtn:          { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  filtreBtnActive:    { borderBottomColor: C.primary },
  filtreBtnText:      { color: C.sub, fontSize: 13, fontWeight: '600' },
  filtreBtnTextActive:{ color: C.primary },
  btnAjouter:         { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  btnAjouterText:     { color: C.primary, fontSize: 14, fontWeight: '600' },
  formCard:           { padding: 14, gap: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  tableHeader:        { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  tableHeaderText:    { color: C.sub, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  ligne:              { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border },
  ligneAlternee:      { backgroundColor: 'rgba(255,255,255,0.02)' },
  ligneNom:           { color: C.text, fontSize: 14, fontWeight: '500' },
  inputInline:        { color: C.text, fontSize: 14, borderBottomWidth: 1, borderBottomColor: C.primary, paddingVertical: 2 },
  badge:              { backgroundColor: C.card, borderRadius: 12, paddingVertical: 3, paddingHorizontal: 8 },
  badgeText:          { color: C.sub, fontSize: 12, fontWeight: '600' },
  row:                { flexDirection: 'row', alignItems: 'center' },
  input:              { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 8, padding: 10, color: C.text, marginBottom: 4 },
  btnPrimary:         { backgroundColor: C.primary, borderRadius: 8, padding: 12, alignItems: 'center', gap: 0 },
  btnPrimaryText:     { color: 'white', fontWeight: '700' },
  btnSmall:           { borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12 },
  btnSmallText:       { color: 'white', fontWeight: '700', fontSize: 13 },
  emptyText:          { color: C.sub, textAlign: 'center', marginTop: 32, fontStyle: 'italic' },
  overlay:            { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBoite:         { backgroundColor: C.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36, borderTopWidth: 1, borderTopColor: C.border },
  modalHeader:        { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  modalTitre:         { color: C.text, fontSize: 16, fontWeight: '700' },
  scLigne:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  scAction:           { padding: 8 },
  btnAjouterSc:       { backgroundColor: C.primary, borderRadius: 8, padding: 10, justifyContent: 'center', alignItems: 'center', width: 42 },
  confirmInline:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: C.card, borderRadius: 8, padding: 12 },
  confirmBoite:       { backgroundColor: C.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 36, gap: 12, borderTopWidth: 1, borderTopColor: C.border },
  confirmTitre:       { color: C.text, fontSize: 16, fontWeight: '700' },
  confirmTexte:       { color: C.sub, fontSize: 14, lineHeight: 20 },
});