import React from "react";
import { Box, Button, Input, VStack, HStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import ObjProject from "./ObjProject";

class ObjHome extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projects: [],
      newProjectName: "",
    };
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

  render() {
    const { projects, newProjectName } = this.state;
    return (
      <Box p={4}>
        <VStack spacing={4}>
          <HStack>
            <Input
              placeholder="New project name"
              value={newProjectName}
              onChange={this.handleInputChange}
            />
            <Button
              onClick={this.handleAddProject}
              colorScheme="teal"
              leftIcon={<AddIcon />}
            >
              Add Project
            </Button>
          </HStack>
          {projects.map((project) => (
            <ObjProject
              key={project.id}
              name={project.name}
              onDelete={() => this.handleDeleteProject(project.id)}
            />
          ))}
        </VStack>
      </Box>
    );
  }
}

export default ObjHome;
