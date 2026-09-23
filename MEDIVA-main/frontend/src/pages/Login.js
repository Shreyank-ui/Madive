import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { User, Stethoscope, ArrowRight, Loader2, Mail, KeyRound, Zap,Lock} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MedivaLogo } from "@/components/Brand";
import { useAuth } from "@/context/AuthContext";
import { getSpecialties } from "@/lib/api";

const DEMO = {
  patient: { email: "patient@mediva.ai", password: "password123" },
  doctor: { email: "doctor@mediva.ai", password: "password123" },
};

export default function Login() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const [tab, setTab] = useState("patient");

  useEffect(() => {
    if (ready && user) {
      navigate(user.role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard", {
        replace: true,
      });
    }
  }, [ready, user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/">
            <MedivaLogo />
          </Link>
          <Link to="/book">
            <Button variant="outline" className="border-slate-300" data-testid="login-book-button">
              Book Appointment
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-md flex-col px-4 py-10 sm:py-14">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Secure sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Choose your portal to continue</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl border border-slate-200 bg-white p-1">
            <TabsTrigger
              value="patient"
              data-testid="tab-patient-portal"
              className="rounded-lg data-[state=active]:bg-sky-600 data-[state=active]:text-white"
            >
              <User className="mr-2 h-4 w-4" /> Patient Portal
            </TabsTrigger>
            <TabsTrigger
              value="doctor"
              data-testid="tab-doctor-portal"
              className="rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white"
            >
              <Stethoscope className="mr-2 h-4 w-4" /> Doctor / Staff
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patient" className="mt-5">
            <PatientPanel navigate={navigate} />
          </TabsContent>
          <TabsContent value="doctor" className="mt-5">
            <DoctorPanel navigate={navigate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Panel({ children }) {
  return (
    <div className="animate-fade-up rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

function DevLoginButton({ onClick, loading, label, testid }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
        <Zap className="h-3 w-3" /> Demo access (dev only)
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onClick}
        disabled={loading}
        className="h-10 w-full border-slate-300 text-slate-700"
        data-testid={testid}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
      </Button>
    </div>
  );
}


export function PatientPanel(props) {
  // Safe navigation fallback: use prop if passed, otherwise hook, otherwise browser redirect
  const navigateHook = useNavigate();
  const navigate = props.navigate || navigateHook || ((url) => { window.location.href = url; });

  // Safe auth context fallback
  const auth = useAuth() || {};

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State (User ID & Password)
  const [formData, setFormData] = useState({
    userId: '',
    fullName: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Standard Form Submit (Sign In / Sign Up)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (typeof auth.signupPatient === 'function') {
          await auth.signupPatient(formData);
        } else if (typeof auth.signup === 'function') {
          await auth.signup({ ...formData, role: 'patient' });
        }
      } else {
        if (typeof auth.loginPatient === 'function') {
          await auth.loginPatient(formData.userId, formData.password);
        } else if (typeof auth.login === 'function') {
          await auth.login({ userId: formData.userId, password: formData.password, role: 'patient' });
        }
      }

      // Redirect upon success
      if (typeof navigate === 'function') {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // One-Click Demo Patient Login
  const handleDemoPatient = async () => {
    setError('');
    setDemoLoading(true);

    try {
      if (typeof auth.demoLoginPatient === 'function') {
        await auth.demoLoginPatient();
      } else if (typeof auth.loginPatient === 'function') {
        await auth.loginPatient('patient_demo', 'demo123');
      } else if (typeof auth.login === 'function') {
        await auth.login({ userId: 'patient_demo', password: 'demo123', role: 'patient' });
      }

      if (typeof navigate === 'function') {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Could not log in as demo patient. Check server connection.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Mode Switcher Tabs */}
      <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => { setMode('login'); setError(''); }}
          className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'login'
              ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(''); }}
          className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'signup'
              ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'signup' && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@example.com"
                  className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                />
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            User ID / Patient ID
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="userId"
              required
              value={formData.userId}
              onChange={handleChange}
              placeholder="Enter your Patient ID"
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || demoLoading}
          className="w-full h-11 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {mode === 'login' ? 'Sign In as Patient' : 'Create Patient Account'}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
        <span className="flex-shrink mx-3 text-xs text-gray-400 uppercase">Or</span>
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
      </div>

      {/* Demo Patient Quick-Login */}
      <button
        type="button"
        onClick={handleDemoPatient}
        disabled={loading || demoLoading}
        className="w-full h-10 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        {demoLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          'Try as Demo Patient'
        )}
      </button>
    </div>
  );
}

function DoctorPanel({ navigate }) {
  const { loginDoctor, signupDoctor, devLogin } = useAuth();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [reg, setReg] = useState({
    full_name: "Dr. ",
    email: "",
    password: "",
    specialty_id: "",
    custom_specialty_name: "",
    years_of_experience: "",
    clinic_phone_number: "+91 123456789",
    consultation_fee: "500",
    advance_booking_fee: "200",
  });

  useEffect(() => {
    getSpecialties()
      .then(setSpecialties)
      .catch(() => {});
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await loginDoctor(creds.email, creds.password);
      toast.success("Welcome, Doctor.");
      navigate("/doctor/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (!reg.full_name || !reg.email || !reg.password)
      return toast.error("Name, email and password are required.");
    setLoading(true);
    try {
      const { password, ...profile } = reg;
      await signupDoctor(profile, password);
      toast.success("Clinical account created!");
      navigate("/doctor/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo() {
    setDemoLoading(true);
    try {
      await devLogin(DEMO.doctor.email, DEMO.doctor.password);
      toast.success("Signed in as demo doctor");
      navigate("/doctor/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message || "Demo login unavailable");
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <Panel>
      {mode === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="d-email">Hospital email</Label>
            <Input
              id="d-email"
              type="email"
              data-testid="doctor-login-email"
              value={creds.email}
              onChange={(e) => setCreds({ ...creds, email: e.target.value })}
              placeholder="doctor@mediva.ai"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-pass">Password</Label>
            <Input
              id="d-pass"
              type="password"
              data-testid="doctor-login-password"
              value={creds.password}
              onChange={(e) => setCreds({ ...creds, password: e.target.value })}
              placeholder="••••••••"
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            data-testid="doctor-login-submit"
            className="h-11 w-full bg-slate-900 hover:bg-slate-800"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in to Clinical Portal"}
          </Button>
          <p className="text-center text-sm text-slate-500">
            New clinician?{" "}
            <button
              type="button"
              onClick={() => setMode("register")}
              className="font-medium text-sky-600 hover:underline"
              data-testid="doctor-switch-register"
            >
              Register
            </button>
          </p>
          <DevLoginButton
            onClick={handleDemo}
            loading={demoLoading}
            label="Continue as Demo Doctor"
            testid="doctor-demo-login"
          />
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-3.5">
          <div className="space-y-1.5">
            <Label>Full name</Label>
            <Input
              data-testid="doctor-reg-name"
              value={reg.full_name}
              onChange={(e) => setReg({ ...reg, full_name: e.target.value })}
              placeholder="Dr. Shourya"
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                data-testid="doctor-reg-email"
                value={reg.email}
                onChange={(e) => setReg({ ...reg, email: e.target.value })}
                placeholder="name@mediva.ai"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                data-testid="doctor-reg-password"
                value={reg.password}
                onChange={(e) => setReg({ ...reg, password: e.target.value })}
                placeholder="••••••••"
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Specialization</Label>
            <Select
              value={reg.specialty_id}
              onValueChange={(v) => setReg({ ...reg, specialty_id: v })}
            >
              <SelectTrigger data-testid="doctor-reg-specialty" className="h-11">
                <SelectValue placeholder="Select a known specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              data-testid="doctor-reg-custom-specialty"
              value={reg.custom_specialty_name}
              onChange={(e) => setReg({ ...reg, custom_specialty_name: e.target.value })}
              placeholder="Or type custom, e.g. Ophthalmology / Eye Surgeon"
              className="h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Years of experience</Label>
              <Input
                type="number"
                data-testid="doctor-reg-experience"
                value={reg.years_of_experience}
                onChange={(e) => setReg({ ...reg, years_of_experience: e.target.value })}
                placeholder="8"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Clinic phone</Label>
              <Input
                data-testid="doctor-reg-phone"
                value={reg.clinic_phone_number}
                onChange={(e) => setReg({ ...reg, clinic_phone_number: e.target.value })}
                className="h-11"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Consultation fee (₹)</Label>
              <Input
                type="number"
                data-testid="doctor-reg-fee"
                value={reg.consultation_fee}
                onChange={(e) => setReg({ ...reg, consultation_fee: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Advance fee (₹)</Label>
              <Input
                type="number"
                data-testid="doctor-reg-advance"
                value={reg.advance_booking_fee}
                onChange={(e) => setReg({ ...reg, advance_booking_fee: e.target.value })}
                className="h-11"
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={loading}
            data-testid="doctor-reg-submit"
            className="h-11 w-full bg-slate-900 hover:bg-slate-800"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Create Clinical Account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          <p className="text-center text-sm text-slate-500">
            Already registered?{" "}
            <button
              type="button"
              onClick={() => setMode("login")}
              className="font-medium text-sky-600 hover:underline"
            >
              Sign in
            </button>
          </p>
        </form>
      )}
    </Panel>
  );
}
