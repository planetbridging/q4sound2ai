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
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import WaveSurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import { convertToWav } from "./audioUtils";
import withParams from "./withParams";

class ObjProject extends React.Component {
  constructor(props) {
    super(props);
    const projectId = this.props.params.id;
    const savedProject = JSON.parse(
      localStorage.getItem(`project-${projectId}`)
    ) || {
      files: [],
      audioUrls: [],
      selectedFileIndex: null,
      chunks: [],
    };
    this.state = {
      ...savedProject,
      processing: false,
      progress: 0,
      error: null,
      isPlaying: false,
      volume: 0.5,
      zoom: 50,
    };
    this.waveSurferInstance = null;
    this.waveSurferRef = React.createRef();
    this.timelineRef = React.createRef();
    this.projectId = projectId;
  }

  componentDidUpdate() {
    localStorage.setItem(
      `project-${this.projectId}`,
      JSON.stringify(this.state)
    );
  }

  handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    this.setState({
      files: selectedFiles,
      audioUrls: [],
      selectedFileIndex: null,
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

  initWaveSurfer = (url) => {
    if (this.waveSurferInstance) {
      this.waveSurferInstance.destroy();
    }
    const regionsPlugin = RegionsPlugin.create();
    this.waveSurferInstance = WaveSurfer.create({
      container: this.waveSurferRef.current,
      waveColor: "violet",
      progressColor: "purple",
      responsive: true,
      height: 100,
      plugins: [
        TimelinePlugin.create({
          container: this.timelineRef.current,
        }),
        regionsPlugin,
      ],
    });
    this.waveSurferInstance.load(url);
    this.waveSurferInstance.on("play", () =>
      this.setState({ isPlaying: true })
    );
    this.waveSurferInstance.on("pause", () =>
      this.setState({ isPlaying: false })
    );
    this.waveSurferInstance.on("ready", () => {
      this.waveSurferInstance.setVolume(this.state.volume);
      this.waveSurferInstance.zoom(this.state.zoom);
      this.waveSurferInstance.plugins.regions = regionsPlugin;
    });
  };

  handlePlayPause = () => {
    if (this.waveSurferInstance) {
      this.waveSurferInstance.playPause();
    }
  };

  handleVolumeChange = (value) => {
    if (this.waveSurferInstance) {
      this.waveSurferInstance.setVolume(value);
      this.setState({ volume: value });
    }
  };

  handleZoomChange = (value) => {
    if (this.waveSurferInstance) {
      this.waveSurferInstance.zoom(value);
      this.setState({ zoom: value });
    }
  };

  addRegion = () => {
    if (this.waveSurferInstance && this.waveSurferInstance.plugins.regions) {
      this.waveSurferInstance.plugins.regions.addRegion({
        start: 1,
        end: 3,
        color: "rgba(0, 255, 0, 0.1)",
      });
    }
  };

  addMultipleRegions = () => {
    if (this.waveSurferInstance && this.waveSurferInstance.plugins.regions) {
      const regionsPlugin = this.waveSurferInstance.plugins.regions;
      const duration = this.waveSurferInstance.getDuration();
      const chunkSize = 1; // Fixed chunk size of 1 second
      for (let i = 0; i < duration; i += chunkSize) {
        const start = i;
        const end = i + chunkSize;
        regionsPlugin.addRegion({
          start,
          end,
          color: `rgba(0, 255, 0, 0.1)`,
        });
      }
      const regions = regionsPlugin.list;
      if (regions) {
        const chunks = Object.values(regions).map((region, index) => ({
          id: index,
          start: region.start,
          end: region.end,
        }));
        this.setState({ chunks });
      }
    }
  };

  handleFileSelect = (index) => {
    this.setState({ selectedFileIndex: index }, () => {
      this.initWaveSurfer(this.state.audioUrls[index]);
    });
  };

  render() {
    const {
      files,
      audioUrls,
      selectedFileIndex,
      processing,
      progress,
      error,
      isPlaying,
      volume,
      zoom,
      chunks,
    } = this.state;

    return (
      <Box
        height="100vh"
        width="100vw"
        p={4}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bg="gray.800"
        color="white"
        overflow="hidden"
      >
        <Input
          type="file"
          multiple
          onChange={this.handleFileChange}
          mt={4}
          accept="audio/*"
        />
        {processing && <Progress value={progress} mt={2} width="100%" />}
        {error && (
          <Text color="red.500" mt={2}>
            {error}
          </Text>
        )}
        <VStack spacing={4} align="stretch" width="100%">
          <Wrap spacing={4} justify="center">
            {files.map((file, index) => (
              <WrapItem key={index}>
                <Box
                  p={2}
                  borderWidth="1px"
                  borderRadius="lg"
                  cursor="pointer"
                  bg={selectedFileIndex === index ? "teal.500" : "gray.700"}
                  onClick={() => this.handleFileSelect(index)}
                >
                  <Text>{file.name}</Text>
                </Box>
              </WrapItem>
            ))}
          </Wrap>
          {selectedFileIndex !== null && audioUrls[selectedFileIndex] && (
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              bg="gray.700"
              width="100%"
              overflow="hidden"
            >
              <Text mb={2}>Audio {selectedFileIndex + 1}</Text>
              <div ref={this.waveSurferRef}></div>
              <div ref={this.timelineRef}></div>
              <HStack mt={2} spacing={4} width="100%">
                <Button onClick={this.handlePlayPause}>
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Text>Volume:</Text>
                <Slider
                  value={volume}
                  min={0}
                  max={1}
                  step={0.1}
                  onChange={this.handleVolumeChange}
                  width="150px"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Text>Zoom:</Text>
                <Slider
                  value={zoom}
                  min={0}
                  max={100}
                  onChange={this.handleZoomChange}
                  width="150px"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Button onClick={this.addRegion}>Add Region</Button>
                <Button onClick={this.addMultipleRegions}>
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
          )}
        </VStack>
      </Box>
    );
  }
}

export default withParams(ObjProject);
