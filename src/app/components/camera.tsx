import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

const setupCamera = async (videoEl: HTMLVideoElement | null) => {
  if (!videoEl) return;

  try {
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    const width = 1200;
    const height = 675;

    if (isMobile) {
      videoEl.width = height;
      videoEl.height = width;
    } else {
      videoEl.width = width;
      videoEl.height = height;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Use the back camera
        width: { ideal: width },
        height: { ideal: height },
        aspectRatio: 16 / 9,
      },
    });

    videoEl.srcObject = stream;
  } catch (error) {
    console.error('Error accessing camera:', error);
  }
};

export const Camera = forwardRef(
  (props, ref: ForwardedRef<HTMLVideoElement | null>) => {
    const innerRef = useRef<HTMLVideoElement | null>(null);
    const [hasBeenInitialized, setHasBeenInitialized] = useState(false);

    useImperativeHandle<HTMLVideoElement | null, HTMLVideoElement | null>(
      ref,
      () => innerRef.current
    );

    useEffect(() => {
      if (!hasBeenInitialized && innerRef?.current) {
        setHasBeenInitialized(true);
        setupCamera(innerRef?.current);
      }
    }, [hasBeenInitialized]);

    return <video ref={innerRef} autoPlay muted playsInline></video>;
  }
);

export default Camera;
