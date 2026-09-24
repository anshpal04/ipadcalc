import { useState } from "react";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import HomeScreen from "@/screens/home";
import AuthScreen from "@/screens/auth";
import { Button } from "@/components/ui/button";

function App() {
  // Very simple session persistence: keep the token in localStorage so a
  // page refresh doesn't force the user to log in again.
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("ipadcalc_token")
  );
  const [email, setEmail] = useState<string | null>(() =>
    localStorage.getItem("ipadcalc_email")
  );

  const handleAuthenticated = (newToken: string, newEmail: string) => {
    localStorage.setItem("ipadcalc_token", newToken);
    localStorage.setItem("ipadcalc_email", newEmail);
    setToken(newToken);
    setEmail(newEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem("ipadcalc_token");
    localStorage.removeItem("ipadcalc_email");
    setToken(null);
    setEmail(null);
  };

  return (
    <MantineProvider>
      {token ? (
        <div className="relative w-full h-full">
          <div className="absolute top-4 right-4 z-40 flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-2">
            <span className="text-zinc-400 text-xs">{email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </div>
          <HomeScreen token={token} />
        </div>
      ) : (
        <AuthScreen onAuthenticated={handleAuthenticated} />
      )}
    </MantineProvider>
  );
}

export default App;
