/**
 * Knowlarity API Helper Library
 *
 * This library provides helper functions for interacting with Knowlarity's API
 * for telephony operations including Click-to-Call and call management.
 */

interface KnowlarityConfig {
  apiKey: string;
  srNumber: string;
}

interface Click2CallParams {
  customerNumber: string;
  agentNumber?: string;
  callerId?: string;
  isPromotional?: boolean;
}

interface CallLogParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get Knowlarity configuration from environment variables
 */
export function getKnowlarityConfig(): KnowlarityConfig {
  const apiKey = process.env.KNOWLARITY_API_KEY;
  const srNumber = process.env.KNOWLARITY_SR_NUMBER;

  if (!apiKey || !srNumber) {
    throw new Error('Missing Knowlarity configuration in environment variables');
  }

  return { apiKey, srNumber };
}

/**
 * Initiate a Click-to-Call (C2C) outbound call via Knowlarity
 *
 * This triggers Knowlarity to connect an agent with a customer
 */
export async function initiateClick2Call(params: Click2CallParams): Promise<any> {
  const config = getKnowlarityConfig();

  const {
    customerNumber,
    agentNumber = config.srNumber,
    callerId = '',
    isPromotional = false,
  } = params;

  // Knowlarity Click-to-Call API endpoint
  const url = new URL('https://konnect.knowlarity.com/konnect/makecall/');
  url.searchParams.append('api_key', config.apiKey);
  url.searchParams.append('k_number', config.srNumber);
  url.searchParams.append('customer', customerNumber);
  url.searchParams.append('agent_number', agentNumber);
  url.searchParams.append('caller_id', callerId);
  url.searchParams.append('is_promotional', isPromotional.toString());

  console.log('🔄 Knowlarity Click2Call request:', {
    customer: customerNumber,
    agent: agentNumber,
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-API-Key': config.apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Knowlarity Click2Call failed: ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ Knowlarity Click2Call response:', data);

  return data;
}

/**
 * Get call logs from Knowlarity
 *
 * Retrieves historical call data for analytics and reporting
 */
export async function getCallLogs(params: CallLogParams = {}): Promise<any> {
  const config = getKnowlarityConfig();

  const {
    startDate,
    endDate,
    limit = 100,
    offset = 0,
  } = params;

  // Knowlarity Get Call Logs API endpoint
  const url = new URL('https://kpi.knowlarity.com/Basic/v1/account/calllog');

  if (startDate) url.searchParams.append('start_date', startDate);
  if (endDate) url.searchParams.append('end_date', endDate);
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('offset', offset.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-API-Key': config.apiKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch call logs: ${errorText}`);
  }

  return await response.json();
}

/**
 * Validate incoming webhook request from Knowlarity
 *
 * Verifies that the webhook request is legitimate
 */
export function validateKnowlarityWebhook(payload: any): boolean {
  // Basic validation - check for required fields
  const requiredFields = ['caller_id', 'uuid'];

  for (const field of requiredFields) {
    if (!payload[field]) {
      console.warn(`Missing required field in webhook: ${field}`);
      return false;
    }
  }

  return true;
}

/**
 * Format phone number for Knowlarity API
 *
 * Ensures phone number is in the correct format (+91XXXXXXXXXX)
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove any spaces, dashes, or parentheses
  let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');

  // Add +91 if not present (for Indian numbers)
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('91')) {
      cleaned = '+' + cleaned;
    } else {
      cleaned = '+91' + cleaned;
    }
  }

  return cleaned;
}

/**
 * Parse Knowlarity webhook payload
 *
 * Extracts and normalizes data from incoming webhook
 */
export interface KnowlarityWebhookPayload {
  callerId: string;
  uuid: string;
  srNumber?: string;
  callType?: string;
  startTime?: string;
  destination?: string;
  callDuration?: number;
  rawPayload: any;
}

export function parseWebhookPayload(payload: any): KnowlarityWebhookPayload {
  return {
    callerId: formatPhoneNumber(payload.caller_id || payload.callerId),
    uuid: payload.uuid || payload.call_id,
    srNumber: payload.sr_number || payload.dispnumber,
    callType: payload.call_type || payload.Call_Type,
    startTime: payload.start_time || payload.startTime,
    destination: payload.destination,
    callDuration: payload.call_duration || payload.callDuration || 0,
    rawPayload: payload,
  };
}
