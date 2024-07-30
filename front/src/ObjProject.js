import React from "react";
import {
  Box,
  Input,
  VStack,
  Text,
  Progress,
  Button,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import { convertToWav } from "./audioUtils";

class ObjProject extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      audioUrls: [],
      processing: false,
      progress: 0,
      error: null,
      isPlaying: false,
      volume: 0.5,
      zoom: 50,
      chunks: [], // Add chunks to the state
    };
    this.waveSurferInstances = {};
    this.waveSurferRefs = {};
  }

  handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    this.setState({
      files: selectedFiles,
      audioUrls: [],
      processing: true,
      progress: 0,
      error: null,
    });

    const audioUrls = await this.processFiles(selectedFiles);
    this.setState({ audioUrls, processing: false, progress: 100 });
  };

  processFiles = async (files) => {
    const audioUrls = [];
    for (const file of files) {
      const audioUrl = await convertToWav(file, this.updateProgress);
      audioUrls.push(audioUrl);
    }
    return audioUrls;
  };

  updateProgress = (progress) => {
    this.setState({ progress });
  };

  initWaveSurfer = (url, index) => {
    if (!this.waveSurferInstances[index]) {
      const container = this.waveSurferRefs[`wavesurfer-${index}`];
      const regionsPlugin = RegionsPlugin.create();
      const waveSurfer = WaveSurfer.create({
        container,
        waveColor: "violet",
        progressColor: "purple",
        responsive: true,
        height: 100,
        plugins: [
          TimelinePlugin.create({
            container: `#timeline-${index}`,
          }),
          regionsPlugin,
        ],
      });
      waveSurfer.load(url);
      waveSurfer.on("play", () => this.setState({ isPlaying: true }));
      waveSurfer.on("pause", () => this.setState({ isPlaying: false }));
      waveSurfer.on("ready", () => {
        waveSurfer.setVolume(this.state.volume);
        waveSurfer.plugins.regions = regionsPlugin; // Assign regionsPlugin to waveSurfer.plugins.regions
      });
      this.waveSurferInstances[index] = waveSurfer;
    }
  };

  setWaveSurferRef = (el, index) => {
    if (el && !this.waveSurferRefs[`wavesurfer-${index}`]) {
      this.waveSurferRefs[`wavesurfer-${index}`] = el;
      this.initWaveSurfer(this.state.audioUrls[index], index);
    }
  };

  handlePlayPause = (index) => {
    const waveSurfer = this.waveSurferInstances[index];
    if (waveSurfer) {
      waveSurfer.playPause();
    }
  };

  handleVolumeChange = (value, index) => {
    const waveSurfer = this.waveSurferInstances[index];
    if (waveSurfer) {
      waveSurfer.setVolume(value);
      this.setState({ volume: value });
    }
  };

  handleZoomChange = (value, index) => {
    const waveSurfer = this.waveSurferInstances[index];
    if (waveSurfer) {
      waveSurfer.zoom(value);
      this.setState({ zoom: value });
    }
  };

  addRegion = (waveSurfer, regionsPlugin) => {
    if (waveSurfer && regionsPlugin) {
      regionsPlugin.addRegion({
        start: 1,
        end: 3,
        color: "rgba(0, 255, 0, 0.1)",
      });
    } else {
      console.error("WaveSurfer or regionsPlugin is not initialized");
    }
  };

  addMultipleRegions = (index) => {
    const waveSurfer = this.waveSurferInstances[index];
    if (waveSurfer && waveSurfer.plugins.regions) {
      const regionsPlugin = waveSurfer.plugins.regions;
      const duration = waveSurfer.getDuration(); // Get the total duration of the audio
      for (let i = 0; i < duration; i++) {
        const start = i; // Start of the region
        const end = i + 1; // End of the region (1 second after start)
        regionsPlugin.addRegion({
          start,
          end,
          color: `rgba(0, 255, 0, 0.1)`, // Adjust this to change the color of each region
        });
      }
      // Get the list of regions
      const regions = regionsPlugin.list;
      if (regions) {
        // Check if regions is not undefined
        // Create a list of chunks
        const chunks = regions.map((region, index) => ({
          id: index,
          start: region.start,
          end: region.end,
        }));
        // Update the state with the list of chunks
        this.setState({ chunks });
      } else {
        console.error("Regions are not yet populated");
      }
    } else {
      console.error("WaveSurfer or regionsPlugin is not initialized");
    }
  };

  render() {
    const {
      files,
      audioUrls,
      processing,
      progress,
      error,
      isPlaying,
      volume,
      zoom,
      chunks, // Add chunks to the state
    } = this.state;

    return (
      <Box borderWidth="1px" borderRadius="lg" p={4} mb={4}>
        <Input
          type="file"
          multiple
          onChange={this.handleFileChange}
          mt={4}
          accept="audio/*"
        />
        {processing && <Progress value={progress} mt={2} />}
        {error && (
          <Text color="red.500" mt={2}>
            {error}
          </Text>
        )}
        <VStack mt={4} spacing={4} align="stretch">
          {files.map((file, index) => (
            <Box key={index} p={2} borderWidth="1px" borderRadius="lg">
              <Text>{file.name}</Text>
            </Box>
          ))}
          {audioUrls.map((url, index) => (
            <Box key={index} p={2} borderWidth="1px" borderRadius="lg">
              <Text mb={2}>Audio {index + 1}</Text>
              <div
                ref={(el) => this.setWaveSurferRef(el, index)}
                id={`wavesurfer-${index}`}
              ></div>
              <div id={`timeline-${index}`}></div>
              <HStack mt={2} spacing={4}>
                <Button onClick={() => this.handlePlayPause(index)}>
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Text>Volume:</Text>
                <Slider
                  defaultValue={volume}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={(v) => this.handleVolumeChange(v, index)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Text>Zoom:</Text>
                <Slider
                  defaultValue={zoom}
                  min={0}
                  max={100}
                  onChange={(v) => this.handleZoomChange(v, index)}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Button
                  onClick={() =>
                    this.addRegion(
                      this.waveSurferInstances[index],
                      RegionsPlugin.create()
                    )
                  }
                >
                  Add Region
                </Button>
                <Button onClick={() => this.addMultipleRegions(index)}>
                  Add Multiple Regions
                </Button>
              </HStack>
              {chunks && (
                <Box mt={4}>
                  <Text mb={2}>Chunks:</Text>
                  <VStack align="stretch">
                    {chunks.map((chunk) => (
                      <Box
                        key={chunk.id}
                        p={2}
                        borderWidth="1px"
                        borderRadius="lg"
                      >
                        <Text>
                          Chunk {chunk.id}: {chunk.start}s - {chunk.end}s
                        </Text>
                      </Box>
                    ))}
                  </VStack>
                </Box>
              )}
            </Box>
          ))}
        </VStack>
      </Box>
    );
  }
}

export default ObjProject;
