import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import HomeScreen from "@/screens/home";

function App() {
  return (
    <MantineProvider>
      <HomeScreen />
    </MantineProvider>
  );
}

export default App;
