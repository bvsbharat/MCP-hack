"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Image,
  Globe,
  Download,
  ExternalLink,
  History,
  Clock,
  ChevronRight,
  Eye,
} from "lucide-react";

interface FileData {
  filename: string;
  content: string;
  path: string;
  file_type?: string;
  formatted_content?: string;
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

interface ResultsPanelProps {
  result: ResearchResult | null;
  isLoading: boolean;
  researchHistory: ResearchResult[];
  onSelectHistoryItem: (result: ResearchResult) => void;
  isLoadingReports?: boolean;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  isLoading,
  researchHistory,
  onSelectHistoryItem,
  isLoadingReports = false,
}) => {
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  const handleDownloadFile = (fileData: FileData) => {
    const blob = new Blob([fileData.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileData.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = (imageData: ImageData) => {
    const byteCharacters = atob(imageData.base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = imageData.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileContent = (content: string) => {
    const lines = content.split("\n");
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLanguage = "";
    
    const elements: JSX.Element[] = [];
    
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      
      // Handle code blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          // End of code block
          elements.push(
            <div key={`code-${index}`} className="my-4">
              <div
                className="rounded-lg p-4 overflow-x-auto"
                style={{
                  backgroundColor: "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <pre className="text-sm font-mono">
                  <code
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {codeBlockContent.join("\n")}
                  </code>
                </pre>
              </div>
            </div>
          );
          inCodeBlock = false;
          codeBlockContent = [];
          codeBlockLanguage = "";
        } else {
          // Start of code block
          inCodeBlock = true;
          codeBlockLanguage = line.replace(/```/, "").trim();
        }
        continue;
      }
      
      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }
      
      // Format headers
      if (line.startsWith("###")) {
        elements.push(
          <h3
            key={index}
            className="text-lg font-semibold mt-6 mb-3 border-b pb-1"
            style={{
              color: "var(--color-foreground)",
              borderColor: "var(--color-border)",
            }}
          >
            {line.replace(/^###\s*/, "")}
          </h3>
        );
        continue;
      }
      
      if (line.startsWith("##")) {
        elements.push(
          <h2
            key={index}
            className="text-xl font-bold mt-8 mb-4 border-b-2 pb-2"
            style={{
              color: "var(--color-foreground)",
              borderColor: "var(--color-primary)",
            }}
          >
            {line.replace(/^##\s*/, "")}
          </h2>
        );
        continue;
      }
      
      if (line.startsWith("#")) {
        elements.push(
          <h1
            key={index}
            className="text-2xl font-bold mt-8 mb-6 border-b-2 pb-3"
            style={{
              color: "var(--color-foreground)",
              borderColor: "var(--color-primary)",
            }}
          >
            {line.replace(/^#\s*/, "")}
          </h1>
        );
        continue;
      }
      
      // Format blockquotes
      if (line.trim().startsWith(">")) {
        const quoteContent = line.replace(/^\s*>\s*/, "");
        elements.push(
          <blockquote
            key={index}
            className="border-l-4 pl-4 py-2 my-3 italic"
            style={{
              borderColor: "var(--color-primary)",
              backgroundColor: "var(--color-muted)",
              color: "var(--color-muted-foreground)",
            }}
          >
            {formatInlineText(quoteContent)}
          </blockquote>
        );
        continue;
      }
      
      // Format bullet points
      if (line.trim().startsWith("-") || line.trim().startsWith("*")) {
        const listContent = line.replace(/^\s*[-*]\s*/, "");
        elements.push(
          <li
            key={index}
            className="ml-6 mb-2 list-disc list-outside"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {formatInlineText(listContent)}
          </li>
        );
        continue;
      }
      
      // Format numbered lists
      if (/^\s*\d+\./.test(line)) {
        const listContent = line.replace(/^\s*\d+\.\s*/, "");
        elements.push(
          <li
            key={index}
            className="ml-6 mb-2 list-decimal list-outside"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {formatInlineText(listContent)}
          </li>
        );
        continue;
      }
      
      // Regular paragraphs
      if (line.trim()) {
        elements.push(
          <p
            key={index}
            className="mb-3 leading-relaxed"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {formatInlineText(line)}
          </p>
        );
      } else {
        elements.push(<div key={index} className="h-3" />);
      }
    }
    
    return elements;
  };
  
  const formatInlineText = (text: string) => {
    // Handle inline code
    let formatted = text.replace(
      /`([^`]+)`/g,
      '<code class="px-1 py-0.5 rounded text-sm font-mono" style="background-color: var(--color-muted); color: var(--color-foreground);">$1</code>'
    );
    
    // Handle bold text
    formatted = formatted.replace(
      /\*\*(.*?)\*\*/g,
      '<strong style="color: var(--color-foreground); font-weight: 600;">$1</strong>'
    );
    
    // Handle italic text
    formatted = formatted.replace(
      /\*(.*?)\*/g,
      '<em style="font-style: italic;">$1</em>'
    );
    
    // Handle links
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">$1</a>'
    );
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const formatOutput = (output: string) => {
    const lines = output.split("\n");
    return lines.map((line, index) => {
      if (line.includes("INFO") || line.includes("DEBUG")) {
        return (
          <div
            key={index}
            className="text-sm font-mono"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {line}
          </div>
        );
      }
      if (line.includes("ERROR") || line.includes("WARN")) {
        return (
          <div
            key={index}
            className="text-sm font-mono"
            style={{ color: "var(--color-destructive-foreground)" }}
          >
            {line}
          </div>
        );
      }
      if (line.trim()) {
        return (
          <div
            key={index}
            className="text-sm"
            style={{ color: "var(--color-foreground)" }}
          >
            {line}
          </div>
        );
      }
      return <div key={index} className="h-2" />;
    });
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingReports ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{ borderColor: "var(--color-primary)" }}
              ></div>
              <p style={{ color: "var(--color-muted-foreground)" }}>
                Loading existing reports...
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{ borderColor: "var(--color-primary)" }}
              ></div>
              <p style={{ color: "var(--color-muted-foreground)" }}>
                Running research analysis...
              </p>
            </div>
          </div>
        ) : !result ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center px-8 max-w-md">
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--color-muted)" }}
              >
                <Globe
                  size={32}
                  style={{ color: "var(--color-muted-foreground)" }}
                />
              </div>
              <h2
                className="text-2xl font-semibold mb-3"
                style={{ color: "var(--color-foreground)" }}
              >
                How can I help you research today?
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Enter a research topic and query in the sidebar to get started
                with your analysis.
              </p>
            </div>
          </div>
        ) : !result.success ? (
          <div className="p-4">
            <div
              className="border rounded-lg p-4"
              style={{
                backgroundColor: "var(--color-destructive-background)",
                borderColor: "var(--color-destructive-border)",
              }}
            >
              <h3
                className="font-semibold mb-2"
                style={{ color: "var(--color-destructive-foreground)" }}
              >
                Error
              </h3>
              <p
                className="text-sm"
                style={{ color: "var(--color-destructive-foreground)" }}
              >
                {result.error}
              </p>
              {result.details && (
                <pre
                  className="text-xs mt-2 overflow-auto"
                  style={{ color: "var(--color-destructive-foreground)" }}
                >
                  {result.details}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <div className="px-8 py-8 max-w-4xl mx-auto">
            {/* Report Header */}
            <div className="mb-8">
              <h1
                className="text-3xl font-semibold mb-3 leading-tight"
                style={{ color: "var(--color-foreground)" }}
              >
                {result.topic}
              </h1>
              <p
                className="text-lg mb-6 leading-relaxed"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {result.query}
              </p>
              <div
                className="text-sm flex items-center space-x-6 pb-6 border-b"
                style={{
                  color: "var(--color-muted-foreground)",
                  borderColor: "var(--color-border)",
                }}
              >
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {new Date(result.timestamp).toLocaleString()}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: result.success
                      ? "var(--color-muted)"
                      : "var(--color-destructive-background)",
                    color: result.success
                      ? "var(--color-foreground)"
                      : "var(--color-destructive-foreground)",
                  }}
                >
                  {result.success ? "Completed" : "Failed"}
                </span>
                {(result as any).isExisting && (
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "var(--color-muted)",
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    📁 Previously Generated Report
                  </span>
                )}
              </div>
            </div>

            {/* Report Content */}
            {result.report && (
              <div>
                <h2
                  className="text-xl font-semibold mb-6"
                  style={{ color: "var(--color-foreground)" }}
                >
                  Research Report
                </h2>
                <div
                  className="prose prose-lg max-w-none"
                  style={{ color: "var(--color-foreground)" }}
                >
                  <div
                    className="text-base leading-relaxed whitespace-pre-wrap"
                    style={{
                      color: "var(--color-foreground)",
                      lineHeight: "1.7",
                    }}
                  >
                    {result.report}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {/* Generated Files Section */}
              {result.files_generated && result.files_generated.length > 0 && (
                <div>
                  <h2
                    className="text-xl font-semibold mb-6 flex items-center"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    <FileText
                      className="w-6 h-6 mr-3"
                      style={{ color: "var(--color-muted-foreground)" }}
                    />
                    Generated Files ({result.files_generated.length})
                  </h2>
                  <div className="space-y-4">
                    {result.files_generated.map((fileData, index) => {
                      const isMarkdown = fileData.file_type === 'markdown';
                      const fileTypeLabel = isMarkdown ? 'Markdown Report' : 'Text File';
                      
                      return (
                        <div
                          key={index}
                          className="border rounded-lg"
                          style={{
                            backgroundColor: "var(--color-background)",
                            borderColor: "var(--color-border)",
                          }}
                        >
                          <div
                            className="flex items-center justify-between p-4 border-b"
                            style={{ borderColor: "var(--color-border)" }}
                          >
                            <div className="flex items-center space-x-3">
                              <FileText
                                className="w-4 h-4"
                                style={{ color: "var(--color-muted-foreground)" }}
                              />
                              <div className="flex flex-col">
                                <span
                                  className="font-medium text-sm"
                                  style={{ color: "var(--color-foreground)" }}
                                >
                                  {fileData.filename}
                                </span>
                                <span
                                  className="text-xs px-2 py-1 rounded-full mt-1 inline-block w-fit"
                                  style={{
                                    backgroundColor: isMarkdown ? "var(--color-primary)" : "var(--color-muted)",
                                    color: isMarkdown ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
                                  }}
                                >
                                  {fileTypeLabel}
                                </span>
                              </div>
                            </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() =>
                                setExpandedFile(
                                  expandedFile === fileData.filename
                                    ? null
                                    : fileData.filename
                                )
                              }
                              className="flex items-center space-x-1 px-2 py-1 rounded transition-colors text-xs"
                              style={{ color: "var(--color-muted-foreground)" }}
                              title={
                                expandedFile === fileData.filename
                                  ? "Collapse"
                                  : "Expand"
                              }
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "var(--color-muted)";
                                e.currentTarget.style.color =
                                  "var(--color-foreground)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color =
                                  "var(--color-muted-foreground)";
                              }}
                            >
                              <ChevronRight
                                className={`w-3 h-3 transition-transform ${
                                  expandedFile === fileData.filename
                                    ? "rotate-90"
                                    : ""
                                }`}
                              />
                              <span>
                                {expandedFile === fileData.filename
                                  ? "Collapse"
                                  : "Expand"}
                              </span>
                            </button>
                            <button
                              onClick={() => handleDownloadFile(fileData)}
                              className="flex items-center space-x-1 px-2 py-1 rounded transition-colors text-xs"
                              style={{ color: "var(--color-muted-foreground)" }}
                              title="Download file"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "var(--color-muted)";
                                e.currentTarget.style.color =
                                  "var(--color-foreground)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color =
                                  "var(--color-muted-foreground)";
                              }}
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                        {expandedFile === fileData.filename && (
                          <div
                            className="p-4 border-t"
                            style={{ borderColor: "var(--color-border)" }}
                          >
                            {fileData.file_type === 'markdown' && (
                              <div
                                className="mb-3 p-2 rounded text-sm"
                                style={{
                                  backgroundColor: "var(--color-muted)",
                                  color: "var(--color-muted-foreground)",
                                  border: "1px solid var(--color-border)",
                                }}
                              >
                                💡 This is a detailed markdown report with rich formatting. Download to view with your preferred markdown editor for the best experience.
                              </div>
                            )}
                            <div className="prose prose-sm max-w-none">
                              {formatFileContent(fileData.content)}
                            </div>
                          </div>
                        )}
                        {expandedFile !== fileData.filename && (
                          <div className="p-4">
                            <div
                              className="text-sm line-clamp-3"
                              style={{ color: "var(--color-muted-foreground)" }}
                            >
                              {fileData.content.substring(0, 200)}...
                            </div>
                          </div>
                        )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Generated Images Section */}
              {result.images_generated &&
                result.images_generated.length > 0 && (
                  <div>
                    <h2
                      className="text-xl font-semibold mb-6 flex items-center"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      <Image
                        className="w-6 h-6 mr-3"
                        style={{ color: "var(--color-muted-foreground)" }}
                      />
                      Generated Images ({result.images_generated.length})
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {result.images_generated.map((imageData, index) => (
                        <div
                          key={index}
                          className="border rounded-lg overflow-hidden"
                          style={{
                            backgroundColor: "var(--color-card)",
                            borderColor: "var(--color-border)",
                          }}
                        >
                          <div
                            className="flex items-center justify-between p-3 border-b"
                            style={{ borderColor: "var(--color-border)" }}
                          >
                            <div className="flex items-center space-x-2">
                              <Image
                                className="w-4 h-4"
                                style={{
                                  color: "var(--color-muted-foreground)",
                                }}
                              />
                              <span
                                className="font-medium text-sm"
                                style={{ color: "var(--color-foreground)" }}
                              >
                                {imageData.filename}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDownloadImage(imageData)}
                              className="flex items-center space-x-1 px-2 py-1 rounded transition-colors text-xs"
                              style={{ color: "var(--color-muted-foreground)" }}
                              title="Download image"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "var(--color-muted)";
                                e.currentTarget.style.color =
                                  "var(--color-foreground)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color =
                                  "var(--color-muted-foreground)";
                              }}
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          </div>
                          <div className="p-3">
                            <img
                              src={`data:image/png;base64,${imageData.base64}`}
                              alt={imageData.filename}
                              className="w-full h-auto rounded border"
                              style={{
                                maxHeight: "400px",
                                objectFit: "contain",
                                borderColor: "var(--color-border)",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Execution Log - Collapsed by default */}
              <div>
                <details
                  className="rounded-lg border"
                  style={{
                    backgroundColor: "var(--color-muted)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <summary
                    className="px-6 py-4 cursor-pointer font-medium rounded transition-colors"
                    style={{ color: "var(--color-foreground)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span className="text-lg">Execution Log</span>
                  </summary>
                  <div
                    className="p-3 border-t"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="space-y-2 max-h-96 overflow-y-auto text-xs font-mono">
                      {formatOutput(result.output)}
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;
