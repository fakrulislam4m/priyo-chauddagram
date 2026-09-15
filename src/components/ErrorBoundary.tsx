import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl border border-slate-200 text-center">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5 border border-rose-200">
              <AlertTriangle size={28} />
            </div>
            <h2 className="text-base font-bold text-slate-800 mb-1">
              অ্যাপ লোড হতে সাময়িক সমস্যা হয়েছে
            </h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। নিচের বাটনে ক্লিক করে পুনরায় চালু করার চেষ্টা করুন।
            </p>
            {this.state.error?.message && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 text-left font-mono mb-4 break-words max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full py-2.5 px-4 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw size={15} />
              <span>পুনরায় চেষ্টা করুন</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
