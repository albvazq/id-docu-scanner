import { useEffect, useRef, useState } from 'react';
import Camera from './camera';

export type VideoAnalyzerBuilder = (
  v: HTMLVideoElement | null,
  o?: HTMLDivElement | null
) => () => Promise<void> | void;

export class VideoAnalyzerEngine {
  private video: HTMLVideoElement | null = null;
  private overlay: HTMLDivElement | null = null;
  private isFirst = true;
  private _analyzers: ((v: HTMLVideoElement | null) => Promise<void> | void)[] =
    [];
  private stopped = false;
  private isProcessing = false;
  private registeredAnalyzers = new Set();

  constructor(v: HTMLVideoElement | null, o: HTMLDivElement | null) {
    if (v !== null && o !== null) {
      this.video = v;
      this.overlay = o;
      this.video.onplay = () => {
        this.runAllAnalyzers();
      };
    }
  }

  set analyzers(analyzers: VideoAnalyzerBuilder[]) {
    if (this.video) {
      console.info(this.video, this.overlay);
      this._analyzers = analyzers.map((a) => a(this.video, this.overlay));
      this.runAllAnalyzers();
    }
  }

  async runAllAnalyzers() {
    if (this._analyzers.length > 0 && !this.isProcessing) {
      const video: HTMLVideoElement | null = document.getElementById(
        'inputVideo'
      ) as unknown as HTMLVideoElement | null;
      this.isProcessing = true;
      for (const analyzer of this._analyzers) {
        await analyzer(video);
      }
      this.isProcessing = false;
      requestAnimationFrame(() => {
        this.runAllAnalyzers();
      });
    }
  }

  stop() {
    requestAnimationFrame(() => {
      this.stopped = true;
      document.getElementById('inputVideo')?.remove();
    });
  }
}

const isMobile =
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

export const VideoAnalyzer = ({
  analyzers,
  width = 1200,
  height = 675,
}: {
  analyzers: VideoAnalyzerBuilder[];
  width?: number;
  height?: number;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const vWidth = isMobile ? height : width;
  const vHeight = isMobile ? width : height;

  const [videoAnalyzerEngine, setVideoAnalyzerEngine] = useState<
    VideoAnalyzerEngine | undefined
  >();

  useEffect(() => {
    if (videoRef.current && overlayRef.current) {
      const videoAnalyzerEngine = new VideoAnalyzerEngine(
        videoRef.current,
        overlayRef.current
      );
      setVideoAnalyzerEngine(videoAnalyzerEngine);
      return () => {
        videoAnalyzerEngine.stop();
      };
    }
  }, []);

  useEffect(() => {
    if (videoAnalyzerEngine) {
      videoAnalyzerEngine.analyzers = analyzers;
    }
  }, [analyzers, videoAnalyzerEngine]);

  return (
    <div
      ref={overlayRef}
      style={{
        width: `${vWidth}px`,
        height: `${vHeight}px`,
        position: 'absolute',
        top: 0,
        left: 0,
        transformOrigin: 'top left',
        overflow: 'hidden',
        border: '2px solid red',
        transform: 'scale(0.7)',
      }}
    >
      <Camera ref={videoRef} height={vHeight} width={vWidth} />
    </div>
  );
};
