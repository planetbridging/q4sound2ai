import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider, Box } from "@chakra-ui/react";
import ObjHome from "./ObjHome";
import ObjProject from "./ObjProject";

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box>
          <Routes>
            <Route exact path="/" element={<ObjHome />} />
            <Route path="/projects/:id" element={<ObjProject />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
