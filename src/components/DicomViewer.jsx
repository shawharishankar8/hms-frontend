import { useEffect, useRef } from "react";
import cornerstone from "cornerstone-core";

/**
 * DicomViewer
 *
 * Props:
 * - imageId (string): Cornerstone imageId (wadouri:...)
 *
 * This component:
 * - enables Cornerstone on mount
 * - loads and displays a DICOM image
 * - cleans up on unmount
 */
export default function DicomViewer({ imageId }) {
    const elementRef = useRef(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || !imageId) return;

        // Enable the DOM element for Cornerstone
        cornerstone.enable(element);

        let cancelled = false;

        // Load and display image
        cornerstone
            .loadImage(imageId)
            .then((image) => {
                if (cancelled) return;
                cornerstone.displayImage(element, image);
            })
            .catch((err) => {
                console.error("Failed to load DICOM image", err);
            });

        // Cleanup on unmount
        return () => {
            cancelled = true;
            if (cornerstone.getEnabledElements().some(e => e.element === element)) {
                cornerstone.disable(element);
            }
        };
    }, [imageId]);

    return (
        <div
            ref={elementRef}
            style={{
                width: "100%",
                height: "512px",
                backgroundColor: "black",
            }}
        />
    );
}
