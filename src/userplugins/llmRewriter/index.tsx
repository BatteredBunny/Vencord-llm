import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    enabled: {
        description: "Enable automatically rewriting messages as they are sent",
        type: OptionType.BOOLEAN,
        default: false
    },
    apiUrl: {
        description: "openai api compatible api",
        type: OptionType.STRING,
        default: "https://openrouter.ai/api/v1",
    },
    apiKey: {
        description: "api key",
        type: OptionType.STRING,
    },
    model: {
        description: "model id",
        type: OptionType.STRING,
        default: "deepseek/deepseek-chat-v3-0324"
    },

    prompt: {
        description: "Prompt provided to the model for rewriting",
        type: OptionType.STRING,
        default: "Rewrite the provided message in the style of a scene-core catgirl that types without proper grammar and with no capitals. Much like a generic internet user. Keep your result same length as the original one. Don't add any emojis to your message. Reply only with the rewritten message."
    }
});

export default definePlugin({
    name: "llmRewriter",
    description: "Rewrites your messages with llm",
    authors: [],

    settings,

    async onBeforeMessageSend(_, message) {
        if (!message.content || !settings.store.apiUrl || !settings.store.apiKey || !settings.store.enabled) return;

        const fullUrl = `${settings.store.apiUrl}/chat/completions`;

        const options = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${settings.store.apiKey}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                stream: false,
                model: settings.store.model,
                messages: [
                    {
                        role: "system",
                        content: settings.store.prompt,
                    },
                    {
                        role: "user",
                        content: message.content
                    }
                ],
            }),
        };

        try {
            const response = await fetch(fullUrl, options);
            const data = await response.json();

            if (data.choices.length > 0) {
                message.content = data.choices[0].message.content;
            }
        } catch (error) {
            console.error(error);
        }
    }
});