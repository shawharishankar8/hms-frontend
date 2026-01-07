import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

export function initCornerstone() {
    console.log('🚀 Initializing Cornerstone...');

    try {
        // 1. Wire the libraries together
        cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
        cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
        console.log('✅ Libraries wired');

        // 2. REGISTER THE WADOURI LOADER - THIS IS THE FIX
        cornerstoneWADOImageLoader.wadouri.register(cornerstone);
        console.log('✅ Wadouri loader registered');

        // 3. Configure web workers
        if (!cornerstoneWADOImageLoader.webWorkerManager.initialized) {
            cornerstoneWADOImageLoader.webWorkerManager.initialize({
                maxWebWorkers: Math.min(navigator.hardwareConcurrency || 1, 4),
                startWebWorkersOnDemand: false, // Changed to false
                webWorkerTaskPaths: [],
                taskConfiguration: {
                    'decodeTask': {
                        initializeCodecsOnStartup: true, // Changed to true
                        usePDFJS: false,
                        strict: false
                    }
                }
            });
            console.log('✅ Web workers configured');
        } else {
            console.log('✅ Web workers already initialized');
        }

        // 4. Store globally (optional, for debugging)
        window.cornerstone = cornerstone;
        window.cornerstoneWADOImageLoader = cornerstoneWADOImageLoader;

        console.log('✅ Cornerstone initialized');

    } catch (error) {
        console.error('❌ Cornerstone initialization failed:', error);
    }
}