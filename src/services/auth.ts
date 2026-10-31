import { supabase } from './supabase';

export async function seConnecter(email: string, motDePasse: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: motDePasse,
  });
  if (error) throw error;
  return data;
}

export async function sInscrire(email: string, motDePasse: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: motDePasse,
  });
  if (error) throw error;
  return data;
}

export async function seDeconnecter() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function obtenirSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}