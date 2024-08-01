import React, { Component } from "react";
import { Box, VStack, Text, Flex, Spacer, Button } from "@chakra-ui/react";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline";
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram";

import { convertToWavChunk } from "./audioUtils";

class ObjChunkConverter extends Component {
  constructor(props) {
    super(props);
    this.waveSurferRef = React.createRef();
    this.timelineRef = React.createRef();
    this.spectrogramRef = React.createRef();
    this.state = {
      chunkUrl: null,
      chunkDuration: 0,
      isPlaying: false,
      labeledData: [],
    };
  }

  handleGenerateSpectrogram = async (chunkData) => {
    const { uniqPassFile, uniqPassIn, lstCats } = chunkData;
    const start = uniqPassIn.start;
    const end = uniqPassIn.end;

    try {
      const chunkUrl = await convertToWavChunk(uniqPassFile, start, end, null);
      this.setState({ chunkUrl }, () => {
        this.initWaveSurfer(chunkUrl, lstCats);
      });
    } catch (error) {
      console.error("Error generating spectrogram:", error);
    }
  };

  initWaveSurfer = (url, labels) => {
    if (this.waveSurferInstance) {
      this.waveSurferInstance.destroy();
    }

    this.waveSurferInstance = WaveSurfer.create({
      container: this.waveSurferRef.current,
      waveColor: "violet",
      progressColor: "purple",
      responsive: true,
      height: 100,
      barWidth: 2,
      cursorWidth: 1,
      backend: "WebAudio",
      plugins: [
        TimelinePlugin.create({
          container: this.timelineRef.current,
        }),
        SpectrogramPlugin.create({
          container: this.spectrogramRef.current,
          labels: true,
        }),
      ],
    });

    this.waveSurferInstance.load(url);
    this.waveSurferInstance.on("ready", () => {
      const duration = this.waveSurferInstance.getDuration();
      this.setState({ chunkDuration: duration });

      // Extract spectrogram data
      this.extractSpectrogramData(labels);
    });
    this.waveSurferInstance.on("error", (error) => {
      console.error("Error loading audio data:", error);
    });
    this.waveSurferInstance.on("play", () =>
      this.setState({ isPlaying: true })
    );
    this.waveSurferInstance.on("pause", () =>
      this.setState({ isPlaying: false })
    );
  };

  extractSpectrogramData = (labels) => {
    // Extract spectrogram data from the spectrogram plugin
    const canvas = this.spectrogramRef.current.querySelector("canvas");
    const context = canvas.getContext("2d");
    const pixelData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;

    const spectrogramData = [];
    for (let i = 0; i < pixelData.length; i += 4) {
      const avg = (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 3;
      spectrogramData.push(avg / 255.0); // Normalize to [0, 1]
    }

    this.setState((prevState) => ({
      labeledData: [
        ...prevState.labeledData,
        { spectrogram: spectrogramData, labels: labels },
      ],
    }));
  };

  handlePlayPause = () => {
    if (this.waveSurferInstance) {
      this.waveSurferInstance.playPause();
    }
  };

  render() {
    const { mapChunkWithLabel } = this.props;
    const { chunkUrl, chunkDuration, isPlaying, labeledData } = this.state;

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
                    <Button
                      onClick={() => this.handleGenerateSpectrogram(chunkData)}
                    >
                      Generate Spectrogram
                    </Button>
                  </VStack>
                </Flex>
              </Box>
            )
          )}
        </VStack>
        {chunkUrl && (
          <Box mt={4}>
            <Text mb={2}>
              Spectrogram (Duration: {chunkDuration.toFixed(2)}s):
            </Text>
            <div ref={this.waveSurferRef}></div>
            <div ref={this.timelineRef}></div>
            <div ref={this.spectrogramRef}></div>
            <Button onClick={this.handlePlayPause}>
              {isPlaying ? "Pause" : "Play"}
            </Button>
          </Box>
        )}
        <Box mt={4}>
          <Text>Labeled Data:</Text>
          <pre>{JSON.stringify(labeledData, null, 2)}</pre>
        </Box>
      </Box>
    );
  }
}

export default ObjChunkConverter;
