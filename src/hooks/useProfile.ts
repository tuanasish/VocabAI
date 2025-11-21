import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    if (mounted) {
                        setProfile(null);
                        setLoading(false);
                    }
                    return;
                }

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (mounted) {
                    setProfile(data);
                }
            } catch (err: any) {
                if (mounted) {
                    setError(err);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('profile_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                },
                (payload) => {
                    if (payload.eventType === 'UPDATE' && payload.new.id === profile?.id) {
                        setProfile(payload.new as Profile);
                    }
                }
            )
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(channel);
        };
    }, [profile?.id]);

    return { profile, loading, error };
}
