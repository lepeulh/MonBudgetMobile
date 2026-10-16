import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Fonction pour se connecter
  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Erreur de connexion', error.message);
    setLoading(false);
  }

  // Fonction pour s'inscrire
  async function signUpWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Erreur d'inscription", error.message);
    } else if (data.session) {
      Alert.alert('Succès', 'Inscription réussie !');
    } else {
      Alert.alert('Vérification', 'Veuillez vérifier vos emails pour confirmer votre compte.');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon Budget</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="email@exemple.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          placeholder="••••••••"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          disabled={loading} 
          onPress={signInWithEmail}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Se connecter</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          disabled={loading} 
          onPress={signUpWithEmail}
        >
          <Text style={styles.secondaryButtonText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#0f1115', // Fond sombre
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e8edf4',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#8a93a3',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#171a21',
    borderWidth: 1,
    borderColor: '#262b36',
    borderRadius: 8,
    padding: 15,
    color: '#e8edf4',
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 15,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#c08a2d', // Couleur accentuée (or/jaune)
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#262b36',
  },
  secondaryButtonText: {
    color: '#8a93a3',
    fontSize: 16,
    fontWeight: '600',
  },
});