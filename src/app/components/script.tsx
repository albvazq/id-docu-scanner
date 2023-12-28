import { useEffect, useState } from 'react';

const scriptsAdded = new Set();

export function Script({
  src,
  onComplete,
}: {
  src: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}) {
  useEffect(() => {
    if (!scriptsAdded.has(src)) {
      scriptsAdded.add(src);
      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = () => {
        console.log(`${src} has been loaded successfully.`);
        onComplete && onComplete();
        // Perform additional actions or handle callbacks after script is loaded
      };

      script.onerror = () => {
        console.error(`Failed to load ${src}.`);
        // Handle error cases
      };

      document.body.appendChild(script);

      return () => {
        // Cleanup: Remove the script element if the component unmounts
        document.body.removeChild(script);
      };
    }
  }, []);

  return null; // The component doesn't render anything in the DOM
}

export default Script;
