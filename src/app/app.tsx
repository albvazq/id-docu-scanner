import styled from 'styled-components';
import {
  VideoAnalyzer,
  VideoAnalyzerBuilder,
  VideoAnalyzerEngine,
} from './components/video-analyzer';
import Script from './components/script';
import { useState } from 'react';

const StyledApp = styled.div`
  // Your style here
`;

declare const cv: any;
declare global {
  interface Window {
    videoAnalyzerEngine: VideoAnalyzerEngine;
  }
}

function DocumentAnalyzer(
  video: HTMLVideoElement | null,
  o?: HTMLDivElement | null
) {
  // const dst = new cv.Mat();
  const src = new cv.Mat(video?.height, video?.width, cv.CV_8UC4);
  const capture = new cv.VideoCapture(video);
  const canvas: HTMLCanvasElement = document.createElement('canvas');
  // Set canvas width and height to 100%
  canvas.width = video?.width || 0;
  canvas.height = video?.height || 0;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  // Append canvas to the provided div
  o?.appendChild(canvas);
  const context = canvas.getContext('2d');

  function isDocumentCentered(image: any) {
    // Convert image to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);

    // Apply edge detection (adjust parameters as needed)
    const edges = new cv.Mat();
    cv.Canny(gray, edges, 50, 150);

    // Find contours
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      edges,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // Find the contour with the largest area
    let maxArea = -1;
    let maxContourIndex = -1;

    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      const area = cv.contourArea(contour, false);

      if (area > maxArea) {
        maxArea = area;
        maxContourIndex = i;
      }

      contour.delete();
    }

    // Check if the largest contour is centered
    let isCentered = false;
    if (maxContourIndex !== -1) {
      const boundingRect = cv.boundingRect(contours.get(maxContourIndex));
      const centerX = boundingRect.x + boundingRect.width / 2;
      const centerY = boundingRect.y + boundingRect.height / 2;

      const imageCenterX = image.cols / 2;
      const imageCenterY = image.rows / 2;

      // Set a threshold for centering detection
      const threshold = 50;
      isCentered =
        Math.abs(centerX - imageCenterX) < threshold &&
        Math.abs(centerY - imageCenterY) < threshold;

      isCentered = isCentered && boundingRect.width > 0.65 * image.cols;
      context?.clearRect(0, 0, canvas.width, canvas.height);
      if (isCentered) {
        // Draw a green rectangle around the document
        context?.drawImage(video!, 0, 0, canvas.width, canvas.height);
        context!.strokeStyle = 'lime';
        context!.lineWidth = 12;
        context?.strokeRect(
          boundingRect.x,
          boundingRect.y,
          boundingRect.width,
          boundingRect.height
        );
      }
      // boundingRect.delete();
    }

    // Cleanup
    gray.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();
    return isCentered;
  }

  return async () => {
    try {
      capture.read(src);
      isDocumentCentered(src);
    } catch (err) {
      console.error(err);
    }
    return;
  };
}

export function App() {
  const [analyzers, setAnalyzers] = useState<VideoAnalyzerBuilder[]>([]);
  return (
    <StyledApp>
      <Script
        src="https://docs.opencv.org/3.4.0/opencv.js"
        onComplete={() => {
          setAnalyzers([DocumentAnalyzer]);
          // window.videoAnalyzerEngine.add('DocumentAnalyzer', DocumentAnalyzer);
        }}
      />

      <VideoAnalyzer
        analyzers={analyzers}
        width={(480 / 9) * 16}
        height={480}
      />
    </StyledApp>
  );
}

export default App;
