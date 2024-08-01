import React, { Component } from "react";
import { Box, VStack, Text, Flex, Spacer } from "@chakra-ui/react";

class ObjChunkConverter extends Component {
  render() {
    const { mapChunkWithLabel } = this.props;

    return (
      <Box>
        <VStack spacing={4} align="stretch">
          {Array.from(mapChunkWithLabel.entries()).map(
            ([chunkId, chunkData]) => (
              <Box
                key={chunkId}
                p={4}
                borderWidth="1px"
                borderRadius="lg"
                bg="gray.700"
                width="100%"
              >
                <Flex>
                  <Text>
                    Chunk {chunkId}: {chunkData.uniqPassIn.start}s -{" "}
                    {chunkData.uniqPassIn.end}s
                  </Text>
                  <Spacer />
                  <VStack align="stretch">
                    <Text>File: {chunkData.uniqPassFile.name}</Text>
                    <Text>Category: {chunkData.lstCats[0]}</Text>
                    <Text>Subcategory: {chunkData.lstCats[1]}</Text>
                    <Text>Sub-subcategory: {chunkData.lstCats[2]}</Text>
                  </VStack>
                </Flex>
              </Box>
            )
          )}
        </VStack>
      </Box>
    );
  }
}

export default ObjChunkConverter;
