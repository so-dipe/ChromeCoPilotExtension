import serverUrl from "../../static/config";

export const messagePairsToList = (messages) => {
    if (!Array.isArray(messages)) {
        throw new Error("Messages must be an array");
    }

    return messages.flatMap((messagePair) => [
        { role: "user", content: messagePair.user },
        { role: "model", content: messagePair.bot },
    ]);
};

export const sendMessage = async (fetchData, user, message, messages) => {
    const url = `${serverUrl}/api/v1/messaging/stream_response`;
    await fetchData(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({
            message: message,
            history: messagePairsToList(messages),
        }),
    });
};

export const filterMessages = (messages, limit = null) => {
    let filteredMessages = [];
    messages.map(message => {
        if (message.type === 'message') {
            filteredMessages.push(message);
        }
    })
    if (limit) {
        return filteredMessages.slice(-limit);
    }
    return filteredMessages;
}

export const readStreamResponse = async (streamResponse, db, message, chatId, setBotResponse, setStream) => {
    try {
        if (!streamResponse) {
            return;
        }
        if (!db) {
            return;
        }
        setStream(true)
        const reader = streamResponse.body.getReader();
        let result = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            result += new TextDecoder().decode(value);
            setBotResponse(result);
        }
        setStream(false);
        db.appendMessagePair(chatId, { user: message, bot: result, type: 'message' });
    } catch (error) {
        console.error("Error reading response:", error);
    }
};

export const generateConversationTitle = async (fetchData, user, messagePair) => {
    const params = new URLSearchParams({
        prompt: messagePair.user,
        response: messagePair.bot,
    });
    const url = `${serverUrl}/api/v1/messaging/get_chat_title?${params.toString()}`;
    await fetchData(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${user.idToken}`,
        },
    });
};