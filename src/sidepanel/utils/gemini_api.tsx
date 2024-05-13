const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models"

const parseMessagesforGemini = (messages: any[], message: string) => {
    let parsedMessages = []
    messages.forEach(msg => {
        parsedMessages.push({
            "role": msg.role,
            "parts": [
                { "text": msg.content }
            ]
        });
    });
    parsedMessages.push({
        "role": "user",
        "parts": [
            { 'text': message }
        ]
    });
    return parsedMessages;
}

export const generateContent = async  (fetchData: any, message: string, messages: any[], geminiApi: string, version: string) => {
    messages = parseMessagesforGemini(messages, message);
    const url = `${geminiUrl}/${version}:streamGenerateContent?alt=sse&key=${geminiApi}`
    console.log("messages", JSON.stringify({contents: messages}));
    await fetchData(url, {
        method: 'POST',
        headers: { ContentType: 'application/json' },
        body: JSON.stringify({
            contents: messages
        })
    })
}

export const generateConversationTitle = async (fetchData: any, messagePair: any, version: string, geminiApi: string) => {
    const message = `Given the message, generate a short and catchy title not more than 3 words long: \n ${messagePair.user}`
    const url = `${geminiUrl}/${version}:generateContent?key=${geminiApi}`;
    await fetchData(url, {
        method: 'POST',
        headers: { ContentType: 'application/json' },
        body: JSON.stringify({contents: [{"parts":[{"text": message}]}]})
    })
}