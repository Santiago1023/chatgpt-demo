import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

// Le decimos a Vercel dónde queremos ejecutar este endpoint 
export const runtime = 'edge'

// -> edge tiene mejor rendimiento y soporta streaming de datos, no puede durar tanto la request usando la CPU (ms)

// -> default tiene peor rendimiento, no soporta el streaming de datos
// pero tiene mayor compatibilidad con paquetes de Node, la request puede durar más tiempo usando la CPU (seg)     

// Crear el cliente de OpenAI
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(config);
export async function POST(request){

    const { messages } = await request.json();
    const userMessage = messages[messages.length-1]
    // console.log('message: ', messages);
    // console.log(request.json());
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        stream: true, 
        messages: [
            {
                "role": "system",
                // "content": "You will be provided with a tweet, and your task is to classify its sentiment as positive, neutral, or negative, and the percentage in a decimal between 0 and 1 of each sentiment, in a json format"},
                // "content": "You will be provided with an array with some tweets, and your task is to classify for each tweet in the array its sentiment as positive, neutral, or negative, and the percentage in a decimal between 0 and 1 of each sentiment, in a json format like this {'tweets': [{ 'tweet': 'first tweet of array', 'sentiment': 'positive or negative or neutral', 'percentage': 'percentage of sentiment chosen'}, and so with the others tweets of array]}. You must take in mind that the sum of the percentages must be 1"
                "content": "You will be provided with an array of tweets. Your task is to classify the sentiment of each tweet as positive, neutral, or negative, and provide the percentage of each sentiment in a decimal format between 0 and 1. The response should be in JSON format as follows: {'tweets': [{'tweet': 'first tweet of array', 'sentiment': 'positive/neutral/negative', 'percentage': 'percentage of sentiment chosen'}, ... and so on for the rest of the tweets in the array]. Please ensure that the sum of the percentages equals 1."
            },
            {
                "role": "user",
                // "content": "I hate you"
                "content": userMessage.content
            }
        ],
        // max_tokens: 64,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
    })
    // console.log('response: ', response);
    // Analizar la respuesta de la API de OpenAI
    // const { choices } = response;
    // const { text } = choices[0];
    // const { value } = JSON.parse(text);
    // Construir la respuesta en formato JSON con el sentimiento y el porcentaje
    // const jsonResponse = {
    //     sentimiento: value.sentimiento,
    //     porcentaje: value.porcentaje
    // };
    // console.log('jsonResponse: ', jsonResponse);
    //transformar la respuesta de OpenAI en un text-stream  -> hecho por vercel
    const stream = OpenAIStream(response);
    // también esta utilidad es hecha por vercel
    console.log('response-stream: ',  new StreamingTextResponse(stream));
    return new StreamingTextResponse(stream) 
}

