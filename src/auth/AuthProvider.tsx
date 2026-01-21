import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext";
import type { User, Session } from "@supabase/supabase-js";

export function AuthProvider({children} : { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
         setSession(data.session);
         setUser(data.session?.user || null);
         setIsLoading(false);
        })
        const {data : listener } = supabase.auth.onAuthStateChange((_event, session)  => { 
            setSession(session);
            setUser(session?.user || null);
        });
        return () => listener.subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}