import React from "react";
import { MessageBar, MessageBarType } from "@fluentui/react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("DICOM Viewer Error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <MessageBar messageBarType={MessageBarType.error}>
                    Failed to load DICOM viewer. The file may be unsupported or corrupted.
                </MessageBar>
            );
        }

        return this.props.children;
    }
}
