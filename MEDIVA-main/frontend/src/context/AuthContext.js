import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  getMyProfile,
  ensurePatientProfile,
  createDoctorProfileForSession,
} from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const p = await getMyProfile();
        if (mounted.current && p) setUser(p);
      }
      if (mounted.current) setReady(true);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        if (mounted.current) setUser(null);
        return;
      }
      if (session) {
        const p = await getMyProfile();
        // Only set when a profile is found; never clobber an active user with null
        if (mounted.current && p) setUser(p);
      }
    });

    return () => {
      mounted.current = false;
      subscription?.unsubscribe();
    };
  }, []);


// ----- Patient: direct sign-in bypass (no OTP needed) -----
  async function sendPatientOtp(email, extra = {}) {
    const cleanEmail = (email || "").trim();
    const demoPassword = "MedivaPatient2026!";

    // 1. Try to log in with preset password
    let { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: demoPassword,
    });

    // 2. If the user doesn't exist, create the account
    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: demoPassword,
      });
      if (signUpError) throw signUpError;
    }

    // 3. Attach patient profile and set session state
    const profile = await ensurePatientProfile(extra);
    setUser(profile);
    return profile;
  }

  async function verifyPatientOtp(email, token, extra = {}) {
    const { error } = await supabase.auth.verifyOtp({
      email: (email || "").trim(),
      token: (token || "").trim(),
      type: "email",
    });
    if (error) throw error;
    const profile = await ensurePatientProfile(extra);
    setUser(profile);
    return profile;
  }

  // ----- Doctor: email + password -----
  async function loginDoctor(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email: (email || "").trim(),
      password,
    });
    if (error) throw new Error(mapAuthError(error));
    const profile = await getMyProfile();
    if (!profile || profile.role !== "doctor") {
      await supabase.auth.signOut();
      throw new Error("This account is not registered as clinical staff.");
    }
    setUser(profile);
    return profile;
  }

  async function signupDoctor(profileData, password) {
    const { data, error } = await supabase.auth.signUp({
      email: (profileData.email || "").trim(),
      password,
    });
    if (error) throw new Error(mapAuthError(error));
    if (!data.session) {
      throw new Error(
        "Account created, but email confirmation is required. Please disable 'Confirm email' in Supabase Auth settings for this demo, or confirm via the email link."
      );
    }
    const profile = await createDoctorProfileForSession(profileData);
    setUser(profile);
    return profile;
  }

  // ----- Dev/demo bypass: password sign-in for seeded accounts (testing) -----
  async function devLogin(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email: (email || "").trim(),
      password,
    });
    if (error) throw new Error(mapAuthError(error));
    const profile = await getMyProfile();
    if (!profile) {
      await supabase.auth.signOut();
      throw new Error("No profile linked to this account.");
    }
    setUser(profile);
    return profile;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        sendPatientOtp,
        verifyPatientOtp,
        loginDoctor,
        signupDoctor,
        devLogin,
        logout,
        refreshProfile: async () => {
          const p = await getMyProfile();
          if (p) setUser(p);
          return p;
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function mapAuthError(error) {
  const msg = error?.message || "Authentication failed.";
  if (/invalid login credentials/i.test(msg)) return "Incorrect email or password.";
  if (/email not confirmed/i.test(msg))
    return "Email not confirmed. Disable 'Confirm email' in Supabase Auth settings for this demo.";
  if (/already registered/i.test(msg)) return "An account with this email already exists.";
  return msg;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
