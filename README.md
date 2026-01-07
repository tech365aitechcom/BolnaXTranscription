# Transcription Viewer

A real-time Next.js application for viewing conversation transcriptions from webhook data. Features live updates via Server-Sent Events, beautiful UI with Tailwind CSS, and comprehensive conversation analytics.

## Features

- **Real-time Updates**: Live conversation updates using Server-Sent Events
- **Beautiful UI**: Clean, modern interface with Tailwind CSS
- **Conversation Cards**: Overview of all conversations with key metrics
- **Detailed Transcript View**: Full conversation history with speaker identification
- **Audio Playback**: Play call recordings directly in the UI
- **Extracted Data**: View structured data extracted from conversations
- **Cost Analytics**: Track conversation costs and durations
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Installation

1. Navigate to the project directory:
```bash
cd transcription-viewer
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### POST /api/webhook
Receives webhook data from your conversation service.

**Example request:**
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d @example.json
```

### GET /api/conversations
Retrieves all stored conversations.

**Example request:**
```bash
curl http://localhost:3000/api/conversations
```

### GET /api/events
Server-Sent Events endpoint for real-time updates. Connect to this endpoint from the frontend to receive live conversation updates.

## Webhook Integration

To integrate your webhook service with this app:

1. **Configure your webhook URL**: Point your service to `http://your-domain:3000/api/webhook`

2. **For local testing**: Use a tunneling service like ngrok:
   ```bash
   ngrok http 3000
   ```
   Then use the ngrok URL as your webhook endpoint.

3. **For production**: Deploy to Vercel, Netlify, or any Node.js hosting platform.

### Webhook Data Format

The webhook expects JSON data in the following format (see `example.json` for complete schema):

```json
{
  "id": "unique-conversation-id",
  "transcript": "assistant: Hello\\nuser: Hi there\\n...",
  "conversation_duration": 155.7,
  "total_cost": 8.77,
  "status": "completed",
  "user_number": "+1234567890",
  "agent_number": "+0987654321",
  "extracted_data": {
    "caller_name": "John Doe",
    "call_outcome": "successful"
  },
  "telephony_data": {
    "recording_url": "https://example.com/recording.mp3"
  }
}
```

## Project Structure

```
transcription-viewer/
├── app/
│   ├── api/
│   │   ├── webhook/
│   │   │   └── route.ts          # Webhook endpoint
│   │   ├── conversations/
│   │   │   └── route.ts          # Get all conversations
│   │   └── events/
│   │       └── route.ts          # Server-Sent Events
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main dashboard page
│   └── globals.css               # Global styles
├── components/
│   ├── ConversationCard.tsx      # Conversation preview card
│   └── TranscriptViewer.tsx      # Full transcript modal
├── lib/
│   ├── types.ts                  # TypeScript interfaces
│   ├── storage.ts                # In-memory data storage
│   └── utils.ts                  # Utility functions
└── package.json
```

## Data Storage

Currently, the app uses **in-memory storage** for simplicity. This means:
- Data is lost when the server restarts
- Not suitable for production use

### For Production

Consider implementing persistent storage with:
- **PostgreSQL** with Prisma ORM
- **MongoDB** with Mongoose
- **Redis** for fast access
- **Firebase Firestore** for real-time features

To add database storage, update the `lib/storage.ts` file with your database implementation.

## Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `app/globals.css` for global styles
- Edit component files for specific UI changes

### Data Fields
- Update `lib/types.ts` to match your webhook schema
- Modify `lib/utils.ts` for custom data parsing
- Edit components to display additional fields

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
1. Build the production app:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Testing

To test the webhook endpoint with the example data:

```bash
# From the parent directory
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d @example.json
```

## Troubleshooting

### SSE Connection Issues
- Check browser console for errors
- Ensure the development server is running
- Some browsers limit SSE connections; try a different browser

### Webhook Not Receiving Data
- Verify the webhook URL is correct
- Check request payload matches expected format
- Review server logs for errors

### Unicode Characters Not Displaying
- Ensure your data uses proper Unicode escape sequences
- The app automatically decodes Unicode sequences like `\u0928`

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Server-Sent Events** - Real-time updates
- **React 19** - UI library

## License

ISC

## Support

For issues or questions, please open an issue in the repository.
