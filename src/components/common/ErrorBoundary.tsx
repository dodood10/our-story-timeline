import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  /** Custom fallback shown instead of the default error card. */
  fallback?: ReactNode;
  /** Label used in console logs to identify which boundary caught the error. */
  section?: string;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const label = this.props.section ? `:${this.props.section}` : "";
    console.error(`[ErrorBoundary${label}]`, error.message, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center my-8 mx-4">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <p className="font-medium">Algo deu errado aqui</p>
            <p className="text-sm text-muted-foreground mt-1">{this.state.error.message}</p>
          </div>
          <Button variant="outline" size="sm" onClick={this.reset}>
            <RefreshCw className="h-4 w-4 mr-1.5" /> Tentar de novo
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
