import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

const isMobile =
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

const setupCamera = async (
  videoEl: HTMLVideoElement | null,
  width: number,
  height: number
) => {
  if (!videoEl) return;

  try {
    videoEl.width = width;
    videoEl.height = height;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Use the back camera
        width: { ideal: isMobile ? height : width },
        height: { ideal: isMobile ? width : height },
        aspectRatio: 16 / 9,
      },
    });

    videoEl.srcObject = stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
};

export const Camera = forwardRef(
  (
    { width, height }: { width: number; height: number },
    ref: ForwardedRef<HTMLVideoElement | null>
  ) => {
    const innerRef = useRef<HTMLVideoElement | null>(null);
    const [hasBeenInitialized, setHasBeenInitialized] = useState(false);

    useImperativeHandle<HTMLVideoElement | null, HTMLVideoElement | null>(
      ref,
      () => innerRef.current
    );

    useEffect(() => {
      if (!hasBeenInitialized && innerRef?.current) {
        setHasBeenInitialized(true);
        setupCamera(innerRef?.current, width, height);
      }
    }, [hasBeenInitialized]);

    return (
      <video
        width={width}
        height={height}
        style={{ border: '2px solid blue', position: 'relative' }}
        ref={innerRef}
        autoPlay
        muted
        playsInline
      ></video>
    );
  }
);

export default Camera;
