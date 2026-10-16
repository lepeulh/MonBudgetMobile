import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { DarkTheme, DefaultTheme, Slot, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [session, setSession] = useState<Session | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // 1. Récupérer la session au démarrage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitialized(true);
    });

    // 2. Écouter les changements de connexion
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      // Non connecté et pas sur la page login -> Expulsion vers le login
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      // Connecté mais sur la page login -> Redirection vers le tableau de bord
      router.replace('/');
    }
  }, [session, isInitialized, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      
      {!isInitialized ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f1115' }}>
          <ActivityIndicator size="large" color="#c08a2d" />
        </View>
      ) : (
        /* Le Slot affichera soit le login, soit les onglets selon l'URL */
        <Slot />
      )}
    </ThemeProvider>
  );
}