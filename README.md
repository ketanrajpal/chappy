# Chappy: Your Friendly and Quirky Chat Buddy

Welcome to Chappy, your versatile chat companion! Chappy can be accessed via a web browser or directly through WhatsApp, with seamless synchronization between both platforms.

Chappy is a true multitasker, able to read images, text, and voice chats, and is always ready to answer any question you throw its way.

## WhatsApp Bot

The WhatsApp Bot is crafted with:

1. **Twilio WhatsApp API**
2. **Next.js API**
3. **Transcribe API** for deciphering voice notes
4. **Vercel** for hosting
5. **MongoDB** for storing all your chats
6. **Google Gemini 1.5 Flash Model** for advanced capabilities

## Web Application

The Web Application shines with:

1. **Next.js** for a smooth user experience
2. **Twilio Verify API** for secure login
3. **Twilio WhatsApp API** to send chats from the web app to WhatsApp
4. **Vercel** for reliable hosting
5. **MongoDB** to keep all your conversations safe
6. **Google Gemini 1.5 Flash Model** for enhanced functionality
7. **Speech recognition and text-to-speech conversion**, powered by Polly

## Getting Started

### Running Locally

To run the application locally, use the following environment variables:

```bash
REACT_APP_ACCOUNT_SID=******
REACT_APP_AUTH_TOKEN=******
REACT_APP_SERVICE_SID=******
REACT_APP_MONGODB_URI=******
REACT_APP_GEMINI_API_KEY=******
REACT_APP_AWS_REGION=******
AWS_ACCESS_KEY_ID=******
AWS_SECRET_ACCESS_KEY=******
BLOB_READ_WRITE_TOKEN=******
REACT_APP_ASSEMBLY_AI=******
```

Then, simply run:

```bash
npm run dev
```
