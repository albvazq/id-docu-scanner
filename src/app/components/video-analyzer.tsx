import { useEffect } from 'react';

export type VideoAnalyzerBuilder = () => (
  v: HTMLVideoElement | null
) => Promise<void> | void;

export class VideoAnalyzerEngine {
  private video;
  private isFirst = true;
  private analyzers: ((v: HTMLVideoElement | null) => Promise<void> | void)[] =
    [];
  private stopped = false;
  private isProcessing = false;
  private registeredAnalyzers = new Set();

  constructor(v: HTMLVideoElement | null) {
    if (v !== null) {
      this.video = v;
      this.video.onplay = () => {
        this.runAllAnalyzers();
      };
    }
  }

  add(name: string, analyzer: VideoAnalyzerBuilder) {
    if (!this.registeredAnalyzers.has(name)) {
      this.registeredAnalyzers.add(name);
      if (this.video) {
        this.analyzers.push(analyzer());
        this.runAllAnalyzers();
      }
    }
  }

  async runAllAnalyzers() {
    if (this.analyzers.length > 0 && !this.isProcessing) {
      const video: HTMLVideoElement | null = document.getElementById(
        'inputVideo'
      ) as unknown as HTMLVideoElement | null;
      this.isProcessing = true;
      for (const analyzer of this.analyzers) {
        await analyzer(video);
      }
      this.isProcessing = false;
      requestAnimationFrame(() => {
        this.runAllAnalyzers();
      });
    }
  }

  stop() {
    // requestAnimationFrame(() => {
    //   this.stopped = true;
    //   document.getElementById('inputVideo')?.remove();
    // });
  }

  async setupCamera() {
    if (!this.video) return;

    try {
      const isMobile =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const width = 1200;
      const height = 675;

      if (isMobile) {
        this.video.width = height;
        this.video.height = width;
      } else {
        this.video.width = width;
        this.video.height = height;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use the back camera
          width: { ideal: width },
          height: { ideal: height },
          aspectRatio: 16 / 9,
        },
      });

      this.video.srcObject = stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }
}

const createVideoAnalyzer = async () => {
  if (!document.getElementById('inputVideo')) {
    const videoElement = document.createElement('video');
    videoElement.id = 'inputVideo';
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.style.position = 'absolute';
    videoElement.style.left = '0';
    videoElement.style.top = '0';
    // Append video element to the body
    document.body.appendChild(videoElement);
    window.videoAnalyzerEngine = new VideoAnalyzerEngine(videoElement);
    await window.videoAnalyzerEngine.setupCamera();
  }
};

export const VideoAnalyzer = () => {
  useEffect(() => {
    createVideoAnalyzer();
  }, []);
  return null;
};
