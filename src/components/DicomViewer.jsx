import React, { useEffect, useRef, useState } from "react";
import { MessageBar, MessageBarType, Spinner, SpinnerSize } from "@fluentui/react";
import cornerstone from "cornerstone-core";

export default function DicomViewer({ imageId }) {
    const elementRef = useRef(null);
    const [loading, setLoading] = useState(false); // Start as false
    const [error, setError] = useState(null);
    const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

    useEffect(() => {
        const element = elementRef.current;

        console.log('🖼️ DicomViewer - imageId:', imageId);
        console.log('🖼️ Element exists?', !!element);

        if (!imageId) {
            console.log('❌ No imageId provided');
            setError("No image to display");
            return;
        }

        if (!cornerstone) {
            console.log('❌ Cornerstone not available');
            setError("DICOM viewer not initialized");
            return;
        }

        if (!element) {
            console.log('⚠️ Element not ready yet');
            return; // Will retry on next render
        }

        console.log('✅ Starting image load...');
        let cancelled = false;
        setHasAttemptedLoad(true);
        setLoading(true);
        setError(null);

        const loadImage = async () => {
            try {
                console.log('🔄 Enabling canvas...');
                cornerstone.enable(element);

                console.log('📥 Loading image:', imageId);
                const image = await cornerstone.loadImage(imageId);

                if (!cancelled) {
                    console.log('✅ Image loaded, displaying...');
                    cornerstone.displayImage(element, image);
                    setLoading(false);
                }
            } catch (err) {
                console.error('❌ Load failed:', err);
                if (!cancelled) {
                    setError(`Failed to load: ${err.message}`);
                    setLoading(false);
                }
            }
        };

        loadImage();

        return () => {
            cancelled = true;
            if (element && cornerstone) {
                cornerstone.disable(element);
            }
        };
    }, [imageId]);

    // Show error immediately if no imageId
    if (!imageId && !hasAttemptedLoad) {
        return (
            <div style={{
                width: "100%",
                height: "512px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f3f2f1",
                borderRadius: 4,
            }}>
                <MessageBar messageBarType={MessageBarType.warning}>
                    No DICOM image available
                </MessageBar>
            </div>
        );
    }

    // ALWAYS RENDER THE CANVAS DIV, then overlay loading/error
    return (
        <div style={{ position: 'relative', width: "100%", height: "512px" }}>
            {/* CANVAS - ALWAYS RENDERED */}
            <div
                ref={elementRef}
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "black",
                    borderRadius: 4,
                    overflow: "hidden",
                }}
            />

            {/* LOADING OVERLAY - only show when actually loading */}
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: 4,
                }}>
                    <Spinner label="Loading DICOM image..." size={SpinnerSize.large} />
                </div>
            )}

            {/* ERROR OVERLAY - only show when error and not loading */}
            {error && !loading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: 'rgba(243, 242, 241, 0.9)',
                    borderRadius: 4,
                }}>
                    <MessageBar
                        messageBarType={MessageBarType.error}
                        styles={{ root: { width: "80%", maxWidth: 500 } }}
                    >
                        {error}
                    </MessageBar>
                </div>
            )}
        </div>
    );
}