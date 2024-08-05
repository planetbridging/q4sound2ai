import React, { Component } from "react";
import {
  Box,
  VStack,
  Text,
  Flex,
  Spacer,
  Button,
  Checkbox,
  Progress,
  Wrap,
  WrapItem,
  Stack,
  Card,
  CardHeader,
  Heading,
  StackDivider,
  CardBody,
} from "@chakra-ui/react";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline";
import SpectrogramPlugin from "wavesurfer.js/dist/plugins/spectrogram";

import md5 from "md5";

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
      labeledData: new Map(),
      generatingAll: false,
      progress: 0,
    };
    this.waveSurferInstance = null; // Initialize waveSurferInstance as null
  }

  handleGenerateAllSpectrograms = async () => {
    const { mapChunkWithLabel } = this.props;
    const chunkEntries = Array.from(mapChunkWithLabel.entries());
    this.setState({ generatingAll: true, progress: 0 });

    for (let i = 0; i < chunkEntries.length; i++) {
      const [chunkId, chunkData] = chunkEntries[i];
      const key = `${chunkData.uniqPassFile.name}_${chunkId}`;
      if (!this.state.labeledData.has(key)) {
        console.log(`Generating spectrogram for: ${key}`);
        await this.handleGenerateSpectrogram(chunkData, true);
        this.setState({ progress: ((i + 1) / chunkEntries.length) * 100 });
      }
    }

    this.setState({ generatingAll: false });
  };

  handleGenerateSpectrogram = async (chunkData, isBatch = false) => {
    const { uniqPassFile, uniqPassIn, lstCats } = chunkData;
    const start = uniqPassIn.start;
    const end = uniqPassIn.end;

    try {
      const chunkUrl = await convertToWavChunk(uniqPassFile, start, end, null);
      console.log(`Converted to WAV: ${chunkUrl}`);
      this.setState({ chunkUrl }, () => {
        this.initWaveSurfer(
          chunkUrl,
          uniqPassFile.name,
          chunkData.uniqPassIn.id,
          lstCats,
          isBatch
        );
      });
    } catch (error) {
      console.error("Error generating spectrogram:", error);
    }
  };

  initWaveSurfer = (url, fileName, chunkId, labels, isBatch) => {
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
      this.extractSpectrogramData(fileName, chunkId, labels, isBatch);
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

  extractSpectrogramData = (fileName, chunkId, labels, isBatch) => {
    const canvas = this.spectrogramRef.current.querySelector("canvas");
    if (!canvas) {
      console.error("Canvas element not found.");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      console.error("Failed to get 2D context.");
      return;
    }

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

    const spectrogramMD5 = this.generateMD5(spectrogramData);
    console.log(`MD5 Hash for ${fileName}_${chunkId}: ${spectrogramMD5}`);

    const key = `${fileName}_${chunkId}`;
    this.setState((prevState) => {
      const updatedMap = new Map(prevState.labeledData);
      updatedMap.set(key, {
        spectrogram: spectrogramData,
        labels: labels,
        md5: spectrogramMD5,
      });
      return { labeledData: updatedMap };
    });

    console.log(`Spectrogram data extracted for: ${key}`);

    if (isBatch) {
      this.cleanUpWaveSurferInstance();
    }
  };

  cleanUpWaveSurferInstance = () => {
    if (this.waveSurferInstance) {
      this.waveSurferInstance.unAll();
      this.waveSurferInstance.destroy();
      this.waveSurferInstance = null;
      console.log("WaveSurfer instance cleaned up.");
    }
  };

  handlePlayPause = () => {
    if (this.waveSurferInstance) {
      this.waveSurferInstance.playPause();
    }
  };

  generateMD5 = (data) => {
    return md5(JSON.stringify(data));
  };

  render() {
    const { mapChunkWithLabel } = this.props;
    const {
      chunkUrl,
      chunkDuration,
      isPlaying,
      labeledData,
      generatingAll,
      progress,
    } = this.state;

    return (
      <Box>
        <Button
          onClick={this.handleGenerateAllSpectrograms}
          disabled={generatingAll}
        >
          {generatingAll ? "Generating..." : "Generate All Spectrograms"}
        </Button>
        {generatingAll && <Progress value={progress} size="sm" mt={2} />}
        <Wrap spacing={4} align="stretch" mt={4}>
          {Array.from(mapChunkWithLabel.entries()).map(
            ([chunkId, chunkData]) => {
              const key = `${chunkData.uniqPassFile.name}_${chunkId}`;
              const isChecked = labeledData.has(key);
              const md5Hash = labeledData.get(key)?.md5;
              return (
                <WrapItem
                  key={chunkId}
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  bg="gray.700"
                >
                  <Card bg="transparent" color={"white"}>
                    <CardBody>
                      <Stack divider={<StackDivider />} spacing="4">
                        <Box>
                          <Heading size="xs" textTransform="uppercase">
                            {chunkId}: {chunkData.uniqPassIn.start}s -{" "}
                            {chunkData.uniqPassIn.end}
                          </Heading>
                          <Text pt="2" fontSize="sm">
                            {md5Hash}
                          </Text>
                        </Box>
                        <Box>
                          <Heading size="xs" textTransform="uppercase">
                            File: {chunkData.uniqPassFile.name}
                          </Heading>
                          <Stack>
                            <Text>Category: {chunkData.lstCats[0]}</Text>
                            <Text>Subcategory: {chunkData.lstCats[1]}</Text>
                            <Text>Sub-subcategory: {chunkData.lstCats[2]}</Text>
                          </Stack>
                        </Box>
                        <Box>
                          <Heading size="xs" textTransform="uppercase">
                            <Checkbox isChecked={isChecked} isDisabled>
                              Processed
                            </Checkbox>
                          </Heading>

                          <Button
                            onClick={() =>
                              this.handleGenerateSpectrogram(chunkData)
                            }
                            disabled={isChecked}
                          >
                            {isChecked
                              ? "Already Generated"
                              : "Generate Spectrogram"}
                          </Button>
                        </Box>
                      </Stack>
                    </CardBody>
                  </Card>
                </WrapItem>
              );
            }
          )}
        </Wrap>
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
      </Box>
    );
  }
}

/*        <Box mt={4}>
          <Text>Labeled Data:</Text>
          <pre>
            {JSON.stringify(Array.from(labeledData.entries()), null, 2)}
          </pre>
        </Box>*/

export default ObjChunkConverter;
