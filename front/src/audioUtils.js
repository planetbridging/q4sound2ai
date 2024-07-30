import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const ffmpeg = new FFmpeg();

const convertToWav = async (file, onProgress) => {
  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

  const fileType = file.name.split(".").pop().toLowerCase();
  const inputFileName = `input.${fileType}`;
  const outputFileName = "output.wav";

  try {
    // Write the file to FFmpeg's file system
    await ffmpeg.writeFile(inputFileName, await fetchFile(file));

    // Run FFmpeg command
    await ffmpeg.exec(["-i", inputFileName, outputFileName]);

    // Read the output file
    const data = await ffmpeg.readFile(outputFileName);
    const blob = new Blob([data.buffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    if (onProgress) {
      onProgress(100);
    }

    return url;
  } catch (error) {
    console.error("Error in convertToWav:", error);
    throw error;
  }
};

export { convertToWav };
