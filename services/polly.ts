'use server'

import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly'

const client = new PollyClient({
    region: process.env.REACT_APP_AWS_REGION,
})

const params = {
    OutputFormat: 'mp3',
    VoiceId: 'Amy',
    TextType: 'text',
    LanguageCode: 'en-GB',
    Engine: 'neural',
}

export default async function speak(text: string): Promise<string> {
    text = text.replace(/[^a-zA-Z0-9.!?, ]/g, '') // remove special characters
    text = `<speak><prosody rate="fast">${text}</prosody></speak>`
    const command = new SynthesizeSpeechCommand({
        Engine: 'neural',
        OutputFormat: 'mp3',
        Text: text,
        TextType: 'ssml',
        VoiceId: 'Ruth',
        LanguageCode: 'en-US',
        SampleRate: '22050',
    })

    const response = await client.send(command)
    const data = await response.AudioStream?.transformToByteArray()

    return `data:audio/mp3;base64,${Buffer.from(data as Uint8Array).toString(
        'base64'
    )}`
}
