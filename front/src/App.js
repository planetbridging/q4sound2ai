import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ChakraProvider, Box, extendTheme } from "@chakra-ui/react";
import ObjHome from "./ObjHome";
import ObjProject from "./ObjProject";
import ObjRegister from "./ObjRegister";
import ObjLogin from "./ObjLogin";
import ObjAuth from "./ObjAuth"; // Import ObjAuth

const theme = extendTheme({
  styles: {
    global: {
      body: {
        color: "white",
      },
    },
  },
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authenticated: false,
      user: null,
    };
  }

  async componentDidMount() {
    const { authenticated, user } = await ObjAuth.isAuthenticated();
    this.setState({ authenticated, user });
  }

  render() {
    const { authenticated } = this.state;

    return (
      <ChakraProvider theme={theme}>
        <Router>
          <Box>
            <Routes>
              <Route
                exact
                path="/"
                element={
                  authenticated ? <ObjHome /> : <Navigate to="/login" replace />
                }
              />
              <Route
                exact
                path="/login"
                element={
                  authenticated ? <Navigate to="/" replace /> : <ObjLogin />
                }
              />
              <Route
                exact
                path="/register"
                element={
                  authenticated ? <Navigate to="/" replace /> : <ObjRegister />
                }
              />
              <Route
                path="/projects/:id"
                element={
                  authenticated ? (
                    <ObjProject />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </Box>
        </Router>
      </ChakraProvider>
    );
  }
}

export default App;
