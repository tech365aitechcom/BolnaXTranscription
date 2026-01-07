export interface WebhookData {
  id: string;
  agent_id: string;
  batch_id: string | null;
  created_at: string;
  updated_at: string;
  scheduled_at: string | null;
  answered_by_voice_mail: string | null;
  conversation_duration: number;
  total_cost: number;
  transcript: string;
  usage_breakdown: UsageBreakdown;
  cost_breakdown: CostBreakdown;
  extracted_data: ExtractedData;
  summary: string | null;
  error_message: string | null;
  status: string;
  agent_extraction: any | null;
  workflow_retries: any | null;
  rescheduled_at: string | null;
  custom_extractions: any | null;
  campaign_id: string | null;
  smart_status: string | null;
  user_number: string;
  agent_number: string;
  initiated_at: string;
  telephony_data: TelephonyData;
  transfer_call_data: any | null;
  context_details: ContextDetails;
  batch_run_details: any | null;
  provider: string;
  latency_data: LatencyData;
}

export interface UsageBreakdown {
  llmModel: { [key: string]: { input: number; output: number } };
  voice_id: string;
  api_tools: ApiTool[];
  llmTokens: number;
  buffer_size: number;
  endpointing: number;
  provider_source: {
    llm: string;
    synthesizer: string;
    transcriber: string;
  };
  incremental_delay: number;
  synthesizer_model: string;
  transcriber_model: string;
  llm_usage_breakdown: LLMUsageBreakdown;
  check_if_user_online: boolean;
  hangup_after_silence: number;
  synthesizer_provider: string;
  transcriber_duration: number;
  transcriber_language: string;
  transcriber_provider: string;
  synthesizer_characters: number;
  synthesizer_usage_breakdown: SynthesizerUsageBreakdown;
  transcriber_usage_breakdown: TranscriberUsageBreakdown;
  voicemail_detection_enabled: boolean;
  trigger_user_online_message_after: number;
}

export interface ApiTool {
  key: string;
  name: string;
  parameters: {
    url: string | null;
    param: { [key: string]: string };
    method: string;
    headers: { [key: string]: string };
    api_token: string | null;
  };
}

export interface LLMUsageBreakdown {
  hangup: any | null;
  analytics: any | null;
  extraction: {
    input: number;
    model: string;
    output: number;
    provider: string;
    provider_connected: boolean;
  } | null;
  conversation: {
    input: number;
    model: string;
    output: number;
    provider: string;
    provider_connected: boolean;
  } | null;
  summarization: any | null;
}

export interface SynthesizerUsageBreakdown {
  provider_connected: boolean;
  welcome_message_cache: boolean;
  conversation_characters: number;
  welcome_message_characters: number;
}

export interface TranscriberUsageBreakdown {
  provider_connected: boolean;
  transcriber_duration: number;
}

export interface CostBreakdown {
  llm: number;
  network: number;
  platform: number;
  synthesizer: number;
  transcriber: number;
  llm_breakdown: {
    hangup: number;
    analytics: number;
    extraction: number;
    conversation: number;
    summarization: number;
  };
  transfer_cost: number;
  synthesizer_breakdown: { conversation: number; welcome_message: number };
  transcriber_breakdown: { analytics: number; conversation: number };
}

export interface ExtractedData {
  caller_name: string;
  caller_age: string | null;
  hearing_issue: string | null;
  previous_hearing_aid: string;
  interested_in: string;
  appointment_booked: string;
  call_outcome: string;
}

export interface TelephonyData {
  duration: string;
  to_number: string;
  from_number: string;
  recording_url: string;
  hosted_telephony: boolean;
  provider_call_id: string;
  call_type: string;
  provider: string;
  hangup_by: string;
  hangup_reason: string;
  hangup_provider_code: number;
}

export interface ContextDetails {
  recipient_data: { timezone: string };
  recipient_phone_number: string;
}

export interface LatencyData {
  stream_id: number;
  time_to_first_audio: number;
  region: string;
  transcriber: { time_to_connect: number; turns: any[] };
  llm: {
    time_to_connect: number | null;
    turns: LLMTurn[];
  };
  synthesizer: {
    time_to_connect: number;
    turns: Turn[];
  };
  rag: any | null;
}

export interface LLMTurn {
  time_to_first_token: number;
  time_to_last_token: number;
  turn: number;
}

export interface Turn {
  time_to_first_token: number;
  time_to_last_token: number;
  turn: number;
}

export interface ConversationMessage {
  speaker: 'assistant' | 'user';
  message: string;
}

export interface ExecutionLog {
  created_at: string;
  data: string;
  type: 'request' | 'response';
  component: string;
  provider: string;
}

export interface ExecutionLogsResponse {
  data: ExecutionLog[];
}
