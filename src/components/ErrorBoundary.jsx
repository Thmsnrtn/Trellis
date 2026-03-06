import { Component } from "react";
import { C, FN } from "../constants/theme";
import { AlertTriangle, RefreshCw } from "lucide-react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: "center", fontFamily: FN }}>
          <AlertTriangle size={32} color={C.r} style={{ marginBottom: 12 }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: C.t1, margin: "0 0 6px" }}>Something went wrong</h2>
          <p style={{ fontSize: 12, color: C.t3, marginBottom: 16, maxWidth: 320, margin: "0 auto 16px" }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 10, background: C.a,
              color: "#fff", border: "none", fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: FN,
            }}
          >
            <RefreshCw size={12} /> Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
