import { AssemblyAI } from 'assemblyai'

const client = new AssemblyAI({
    apiKey: process.env.REACT_APP_ASSEMBLY_AI as string,
})

export async function transcribe(audioUrl: string) {
    const transcript = await client.transcripts.transcribe({
        audio_url: audioUrl,
    })
    return transcript.text
}
