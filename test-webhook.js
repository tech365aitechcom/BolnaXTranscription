#!/usr/bin/env node

/**
 * Test script to send example webhook data to the local server
 * Usage: node test-webhook.js
 */

const fs = require('fs');
const path = require('path');

const WEBHOOK_URL = 'http://localhost:3000/api/webhook';
const EXAMPLE_FILE = path.join(__dirname, '..', 'example.json');

async function sendWebhook() {
  try {
    // Read the example JSON file
    const exampleData = JSON.parse(fs.readFileSync(EXAMPLE_FILE, 'utf8'));

    // Generate a new ID to simulate a new conversation
    const newId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const testData = {
      ...exampleData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log(`Sending webhook to ${WEBHOOK_URL}...`);
    console.log(`Conversation ID: ${testData.id}`);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✓ Webhook sent successfully!');
      console.log('Response:', result);
    } else {
      console.error('✗ Webhook failed!');
      console.error('Response:', result);
    }
  } catch (error) {
    console.error('Error sending webhook:', error.message);
    process.exit(1);
  }
}

sendWebhook();
