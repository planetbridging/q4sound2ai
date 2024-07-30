import React from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Heading,
  Text,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import withNavigation from "./withNavigation";

class ObjHome extends React.Component {
  constructor(props) {
    super(props);
    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    this.state = {
      projects: savedProjects,
      newProjectName: "",
    };
  }

  componentDidUpdate() {
    localStorage.setItem("projects", JSON.stringify(this.state.projects));
  }

  handleAddProject = () => {
    const { newProjectName, projects } = this.state;
    if (newProjectName) {
      this.setState({
        projects: [...projects, { name: newProjectName, id: Date.now() }],
        newProjectName: "",
      });
    }
  };

  handleDeleteProject = (id) => {
    this.setState((prevState) => ({
      projects: prevState.projects.filter((project) => project.id !== id),
    }));
  };

  handleInputChange = (e) => {
    this.setState({ newProjectName: e.target.value });
  };

  handleSelectProject = (project) => {
    this.props.navigate(`/projects/${project.id}`);
  };

  render() {
    const { projects, newProjectName } = this.state;
    return (
      <Box
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bg="teal.600"
        bgImage="url('https://www.transparenttextures.com/patterns/cubes.png')"
        bgSize="cover"
        color="white"
        p={4}
      >
        <VStack
          spacing={6}
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Heading as="h1" size="2xl" mb={4}>
            Q4Sound2AI
          </Heading>
          <HStack>
            <Input
              placeholder="New project name"
              value={newProjectName}
              onChange={this.handleInputChange}
              bg="white"
              color="black"
            />
            <Button
              onClick={this.handleAddProject}
              colorScheme="teal"
              leftIcon={<AddIcon />}
            >
              Add Project
            </Button>
          </HStack>
          {projects.length === 0 ? (
            <Text>No projects yet. Start by adding a new project.</Text>
          ) : (
            <VStack spacing={4} align="stretch" width="100%">
              {projects.map((project) => (
                <Box
                  key={project.id}
                  p={2}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="gray.700"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  cursor="pointer"
                  onClick={() => this.handleSelectProject(project)}
                >
                  <Text>{project.name}</Text>
                  <Button
                    colorScheme="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      this.handleDeleteProject(project.id);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    );
  }
}

export default withNavigation(ObjHome);
