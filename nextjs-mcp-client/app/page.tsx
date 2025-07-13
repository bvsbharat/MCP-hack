"use client";

import { useState, useEffect } from "react";
import ChatInterface from "../components/ChatInterface";
import ResultsPanel from "../components/ResultsPanel";
import ThemeSelector from "../components/ThemeSelector";

interface FileData {
  filename: string;
  content: string;
  path: string;
}

interface ImageData {
  filename: string;
  base64: string;
  path: string;
}

interface ResearchResult {
  success: boolean;
  output: string;
  topic: string;
  query: string;
  timestamp: string;
  files_generated?: FileData[];
  images_generated?: ImageData[];
  error?: string;
  details?: string;
  id: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<ResearchResult | null>(
    null
  );
  const [researchHistory, setResearchHistory] = useState<ResearchResult[]>([]);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default width in pixels
  const [isResizing, setIsResizing] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // Load existing reports on component mount
  useEffect(() => {
    const loadExistingReports = async () => {
      try {
        const response = await fetch('/api/reports');
        const data = await response.json();
        
        if (data.success && data.reports.length > 0) {
          setResearchHistory(data.reports);
          // Set the most recent report as current
          setCurrentResult(data.reports[0]);
        }
      } catch (error) {
        console.error('Failed to load existing reports:', error);
      } finally {
        setIsLoadingReports(false);
      }
    };

    loadExistingReports();
  }, []);

  // Note: localStorage functionality removed to avoid quota exceeded errors

  const handleResearch = async (topic: string, query: string) => {
    setIsLoading(true);

    try {
      // Clear existing reports before starting new research
      await fetch('/api/clear-reports', {
        method: 'POST'
      });

      const response = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, query }),
      });

      const data = await response.json();
      const resultWithId = {
        ...data,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };

      setCurrentResult(resultWithId);

      // Replace history with new result (since we cleared old reports)
      setResearchHistory([resultWithId]);
    } catch (error) {
      const errorResult = {
        success: false,
        output: "",
        topic,
        query,
        timestamp: new Date().toISOString(),
        error: "Failed to connect to research service",
        details: error instanceof Error ? error.message : "Unknown error",
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      };
      setCurrentResult(errorResult);
      setResearchHistory([errorResult]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewResearch = () => {
    setCurrentResult(null);
    setResearchHistory([]);
  };

  const handleSelectHistoryItem = (result: ResearchResult) => {
    setCurrentResult(result);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const newWidth = e.clientX;
    // Set minimum and maximum width constraints
    const minWidth = 200;
    const maxWidth = 600;

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Add global mouse event listeners for drag functionality
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  return (
    <div
      className="h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          backgroundColor: "var(--color-background)",
          borderColor: "var(--color-border)",
        }}
      >
        <h1
          className="text-sm font-medium"
          style={{ color: "var(--color-foreground)" }}
        >
          ProjectR
        </h1>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
              style={{
                backgroundColor: "var(--color-muted)",
                color: "var(--color-foreground)",
              }}
            >
              M
            </div>
          </div>
          <ThemeSelector />
        </div>
      </div>

      {/* Main Content Area - Horizontal Split */}
      <div className="flex-1 flex">
        {/* Sidebar - Left */}
        <div
          className="border-r flex flex-col"
          style={{
            width: `${sidebarWidth}px`,
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-background)",
          }}
        >
          {/* New Research Button */}
          <div className="p-3">
            <button
              onClick={handleNewResearch}
              className="w-full px-3 py-2 rounded-lg border text-sm font-medium transition-colors"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-background)",
                color: "var(--color-foreground)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-background)";
              }}
            >
              New Research
            </button>
          </div>

          {/* Research History */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 pb-3">
              <h3
                className="text-xs font-medium mb-2 px-2"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Recent Research
              </h3>
              <div className="space-y-1">
                {researchHistory.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectHistoryItem(item)}
                    className="w-full text-left px-2 py-2 rounded text-sm transition-colors"
                    style={{
                      backgroundColor:
                        currentResult?.id === item.id
                          ? "var(--color-muted)"
                          : "transparent",
                      color: "var(--color-foreground)",
                    }}
                    onMouseEnter={(e) => {
                      if (currentResult?.id !== item.id) {
                        e.currentTarget.style.backgroundColor =
                          "var(--color-muted)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentResult?.id !== item.id) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <div className="truncate font-medium">{item.topic}</div>
                    <div
                      className="truncate text-xs mt-1"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {item.query}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Interface at bottom */}
          <div
            className="border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <ChatInterface onResearch={handleResearch} isLoading={isLoading} />
          </div>
        </div>

        {/* Drag Handle */}
        <div
          className="w-1 cursor-col-resize hover:bg-blue-500 transition-colors relative group"
          style={{ backgroundColor: "var(--color-border)" }}
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute inset-0 w-2 -ml-0.5 group-hover:bg-blue-500/20"
            style={{
              backgroundColor: isResizing
                ? "var(--color-accent)"
                : "transparent",
            }}
          />
        </div>

        {/* Results Panel - Main Content */}
        <div className="flex-1">
          <ResultsPanel
            result={currentResult}
            isLoading={isLoading || isLoadingReports}
            researchHistory={researchHistory}
            onSelectHistoryItem={handleSelectHistoryItem}
            isLoadingReports={isLoadingReports}
          />
        </div>
      </div>
    </div>
  );
}
