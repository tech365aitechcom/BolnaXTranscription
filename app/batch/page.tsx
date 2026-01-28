"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Upload,
  Calendar,
  List,
  Download,
  RefreshCw,
  Clock,
  Users,
  Trash2,
  StopCircle,
} from "lucide-react";
import { formatToIST } from "@/lib/utils";

interface Batch {
  batch_id: string;
  agent_id?: string;
  status: string;
  file_name?: string;
  valid_contacts?: number;
  total_contacts?: number;
  execution_status?: string;
  selected_workflow?: string;
  scheduled_at?: string;
  stopped_at?: string;
  created_at: string;
  updated_at?: string;
}

export default function BatchCallingPage() {
  const { data: session } = useSession();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [scheduleBatchId, setScheduleBatchId] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  // Auto-select agent when session loads
  useEffect(() => {
    const userAgents = session?.user?.agents || [];
    if (userAgents.length === 1 && !selectedAgentId) {
      setSelectedAgentId(userAgents[0].bolnaAgentId);
    }
  }, [session]);

  async function fetchBatches() {
    try {
      setLoading(true);
      const response = await fetch("/api/batch/list");

      if (!response.ok) {
        throw new Error("Failed to fetch batches");
      }

      const data = await response.json();
      setBatches(data.batches || []);
    } catch (error) {
      console.error("Error fetching batches:", error);
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }
      setSelectedFile(file);
      toast.success(`Selected: ${file.name}`);
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast.error("Please select a CSV file first");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      if (selectedAgentId) {
        formData.append("agent_id", selectedAgentId);
      }

      const response = await fetch("/api/batch/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to upload batch");
      }

      const data = await response.json();
      toast.success(`Batch uploaded successfully! ID: ${data.batch_id}`);

      // Reset form
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh batches list
      fetchBatches();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload batch"
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSchedule() {
    if (!scheduleBatchId || !scheduledTime) {
      toast.error("Please select a batch and schedule time");
      return;
    }

    try {
      // Format as IST timestamp
      // scheduledTime is in format "YYYY-MM-DDTHH:mm" from datetime-local input
      // We append seconds and IST timezone offset
      const isoString = scheduledTime + ":00+05:30";

      const response = await fetch("/api/batch/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          batch_id: scheduleBatchId,
          scheduled_time: isoString,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to schedule batch");
      }

      toast.success("Batch scheduled successfully!");

      // Reset form
      setScheduleBatchId("");
      setScheduledTime("");

      // Refresh batches list
      fetchBatches();
    } catch (error) {
      console.error("Schedule error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to schedule batch"
      );
    }
  }

  async function downloadExampleCSV() {
    try {
      toast.info("Downloading example CSV...");

      // Fetch via proxy endpoint (bypasses CORS)
      const response = await fetch("/api/batch/example-csv");

      if (!response.ok) {
        throw new Error("Failed to download example CSV");
      }

      // Get the file as a blob
      const blob = await response.blob();

      // Create a download link (filename is set by server via Content-Disposition header)
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "hireagent-batch-calling-example.csv";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success("Example CSV downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download example CSV");
    }
  }

  async function handleRunNow(batchId: string) {
    try {
      toast.info("Scheduling batch...");

      const response = await fetch("/api/batch/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batch_id: batchId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to run batch");
      }

      toast.success("Batch scheduled to run in 3 minutes!");
      fetchBatches();
    } catch (error) {
      console.error("Run error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to run batch"
      );
    }
  }

  async function handleDownloadBatch(batchId: string, fileName: string) {
    try {
      toast.info("Downloading batch data...");

      const response = await fetch(`/api/batch/${batchId}/download`);

      if (!response.ok) {
        throw new Error("Failed to download batch data");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `batch-${batchId}.csv`;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success("Batch data downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download batch data");
    }
  }

  async function handleDeleteBatch(batchId: string) {
    if (
      !confirm(
        "Are you sure you want to delete this batch? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      toast.info("Deleting batch...");

      const response = await fetch(`/api/batch/${batchId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to delete batch");
      }

      toast.success("Batch deleted successfully!");
      fetchBatches();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete batch"
      );
    }
  }

  async function handleStopBatch(batchId: string) {
    if (
      !confirm(
        "Are you sure you want to stop this batch? Running calls will be terminated."
      )
    ) {
      return;
    }

    try {
      toast.info("Stopping batch...");

      const response = await fetch(`/api/batch/${batchId}/stop`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || "Failed to stop batch");
      }

      toast.success("Batch stopped successfully!");
      fetchBatches();
    } catch (error) {
      console.error("Stop error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to stop batch"
      );
    }
  }

  // Get user's agents
  const userAgents = session?.user?.agents || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Batch Calling
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Upload CSV and schedule batch campaigns
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Batch CSV
            </h2>
            <Button variant="outline" size="sm" onClick={downloadExampleCSV}>
              <Download className="w-4 h-4 mr-2" />
              Example CSV
            </Button>
          </div>

          <div className="space-y-4">
            {/* Agent Selection */}
            {userAgents.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userAgents.length === 1
                    ? "Agent"
                    : "Select Agent (Optional)"}
                </label>
                {userAgents.length === 1 ? (
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                    {userAgents[0].name}
                  </div>
                ) : (
                  <select
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Use default agent</option>
                    {userAgents.map((agent) => (
                      <option key={agent.id} value={agent.bolnaAgentId}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSV File
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedFile.name} (
                  {(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Batch
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">
              CSV Format Requirements:
            </p>
            <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
              <li>
                Must have{" "}
                <code className="bg-blue-100 px-1 rounded">contact_number</code>{" "}
                column header
              </li>
              <li>
                Phone numbers must include country code in E.164 format (e.g.,
                +919876543210)
              </li>
              <li>
                In Excel, add an apostrophe (') before the plus sign to retain
                it
              </li>
              <li>Additional variables can be included as separate columns</li>
            </ul>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            Schedule Batch
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Batch ID
              </label>
              <select
                value={scheduleBatchId}
                onChange={(e) => setScheduleBatchId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a batch...</option>
                {batches
                  .filter((b) => !b.scheduled_at)
                  .map((batch) => (
                    <option key={batch.batch_id} value={batch.batch_id}>
                      {batch.batch_id} ({batch.total_contacts || 0} contacts)
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Time (IST)
              </label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Select date and time in IST (Indian Standard Time)
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Note: The batch system rounds scheduled times to the nearest 10-minute interval (e.g., 2:05 PM → 2:10 PM)
              </p>
            </div>

            <Button
              onClick={handleSchedule}
              disabled={!scheduleBatchId || !scheduledTime}
              className="w-full"
            >
              <Clock className="w-4 h-4 mr-2" />
              Schedule Batch
            </Button>
          </div>
        </div>

        {/* Batches List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <List className="w-5 h-5" />
                Your Batches
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBatches}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading batches...</p>
            </div>
          ) : batches.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No batches found. Upload a CSV to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Batch ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      File Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Uploaded Contacts
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Execution Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Batch Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Workflow
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Scheduled Time
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Created At
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {batches.map((batch) => (
                    <tr key={batch.batch_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-900">
                        {batch.batch_id.slice(0, 6)}...
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {batch.file_name || "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {batch.valid_contacts || 0} /{" "}
                        {batch.total_contacts || 0} total
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {(() => {
                          if (
                            !batch.execution_status ||
                            batch.execution_status === "null"
                          )
                            return "-";
                          if (typeof batch.execution_status === "object")
                            return JSON.stringify(batch.execution_status);
                          return batch.execution_status;
                        })()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            (() => {
                              // Extract clean status from "scheduled to run..." format
                              const statusStr = typeof batch.status === "string" ? batch.status : "";
                              const cleanStatus = statusStr.startsWith("scheduled to run") ? "scheduled" : statusStr;

                              return cleanStatus === "completed"
                                ? "bg-green-100 text-green-800"
                                : cleanStatus === "scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : cleanStatus === "in_progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : cleanStatus === "processed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800";
                            })()
                          }`}
                        >
                          {(() => {
                            if (typeof batch.status === "object") return JSON.stringify(batch.status);
                            if (!batch.status) return "pending";

                            // Extract clean status from "scheduled to run YYYY-MM-DD..." format
                            const statusStr = batch.status;
                            if (statusStr.startsWith("scheduled to run")) {
                              return "scheduled";
                            }
                            return statusStr;
                          })()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {(() => {
                          if (
                            !batch.selected_workflow ||
                            batch.selected_workflow === "null"
                          )
                            return "-";
                          if (typeof batch.selected_workflow === "object")
                            return JSON.stringify(batch.selected_workflow);
                          return batch.selected_workflow;
                        })()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {(() => {
                          // Extract timestamp from "scheduled to run YYYY-MM-DD..." format in status field
                          const statusStr = typeof batch.status === "string" ? batch.status : "";
                          const match = statusStr.match(
                            /scheduled to run (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})([+-]\d{2}:\d{2})/
                          );

                          if (match && match[1] && match[2]) {
                            try {
                              const datetime = match[1];
                              const timezone = match[2];

                              // If already in IST (+05:30), display as-is without conversion
                              if (timezone === '+05:30') {
                                const date = new Date(datetime + timezone);
                                const day = date.getDate().toString().padStart(2, '0');
                                const month = date.toLocaleString('en-US', { month: 'short' });
                                const year = date.getFullYear().toString().slice(-2);
                                let hours = date.getHours();
                                const minutes = date.getMinutes().toString().padStart(2, '0');
                                const ampm = hours >= 12 ? 'PM' : 'AM';
                                hours = hours % 12;
                                hours = hours ? hours : 12;
                                const hoursStr = hours.toString().padStart(2, '0');
                                return `${day} ${month}, ${year}, ${hoursStr}:${minutes} ${ampm}`;
                              }

                              // If in UTC (+00:00 or Z), convert to IST
                              if (timezone === '+00:00' || timezone === 'Z') {
                                return formatToIST(datetime);
                              }

                              // For other timezones, return as-is
                              return `${datetime} ${timezone}`;
                            } catch {
                              return match[1];
                            }
                          }

                          // Fallback to batch.scheduled_at if status doesn't have timestamp
                          if (batch.scheduled_at) {
                            try {
                              // Check if it has timezone offset
                              const tzMatch = batch.scheduled_at.match(/([+-]\d{2}:\d{2})$/);
                              if (tzMatch && tzMatch[1] === '+05:30') {
                                // Already IST, display as-is
                                const date = new Date(batch.scheduled_at);
                                const day = date.getDate().toString().padStart(2, '0');
                                const month = date.toLocaleString('en-US', { month: 'short' });
                                const year = date.getFullYear().toString().slice(-2);
                                let hours = date.getHours();
                                const minutes = date.getMinutes().toString().padStart(2, '0');
                                const ampm = hours >= 12 ? 'PM' : 'AM';
                                hours = hours % 12;
                                hours = hours ? hours : 12;
                                const hoursStr = hours.toString().padStart(2, '0');
                                return `${day} ${month}, ${year}, ${hoursStr}:${minutes} ${ampm}`;
                              }
                              // Otherwise convert from UTC to IST
                              const cleanTimestamp = batch.scheduled_at.replace(/[+-]\d{2}:\d{2}$/, '');
                              return formatToIST(cleanTimestamp);
                            } catch {
                              return batch.scheduled_at;
                            }
                          }

                          return "-";
                        })()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {batch.created_at ? formatToIST(batch.created_at) : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Run Now"
                            onClick={() => handleRunNow(batch.batch_id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Download"
                            onClick={() =>
                              handleDownloadBatch(
                                batch.batch_id,
                                batch.file_name || "batch.csv"
                              )
                            }
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            title="Stop Batch"
                            onClick={() => handleStopBatch(batch.batch_id)}
                          >
                            <StopCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                            onClick={() => handleDeleteBatch(batch.batch_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
