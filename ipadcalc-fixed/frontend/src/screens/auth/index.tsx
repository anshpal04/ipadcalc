import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8900";

interface AuthScreenProps {
  onAuthenticated: (token: string, email: string) => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, {
        email,
        password,
      });

      onAuthenticated(response.data.token, email);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Something went wrong. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-black">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-zinc-900 border border-zinc-700 rounded-xl p-8 w-full max-w-sm"
      >
        <h1 className="text-white text-xl font-semibold text-center">
          {mode === "login" ? "Log in" : "Create an account"}
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-zinc-800 text-white rounded-md px-3 py-2 outline-none border border-zinc-700 focus:border-zinc-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="bg-zinc-800 text-white rounded-md px-3 py-2 outline-none border border-zinc-700 focus:border-zinc-500"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-zinc-200">
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
        </Button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode(mode === "login" ? "register" : "login");
          }}
          className="text-zinc-400 text-sm hover:text-white"
        >
          {mode === "login"
            ? "Need an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
