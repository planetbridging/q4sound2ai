import logo from "./logo.svg";
import "./App.css";

import { ChakraProvider } from "@chakra-ui/react";

import ObjHome from "./ObjHome";

function App() {
  return (
    <ChakraProvider>
      <ObjHome />
    </ChakraProvider>
  );
}

export default App;
