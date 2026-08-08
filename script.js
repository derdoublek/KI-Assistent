const chatWindow = document.getElementById("chat-window");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// API-Schlüssel sicher aus dem Browser-Speicher holen oder abfragen
let apiKey = localStorage.getItem("gemini_api_key");

if (!apiKey) {
    apiKey = prompt("Bitte gib deinen Gemini API-Schlüssel ein:");
    if (apiKey) {
        localStorage.setItem("gemini_api_key", apiKey.trim());
    }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text || !apiKey) return;

    appendMessage(text, "user-message");
    userInput.value = "";

    try {
        const response = codegenRequest(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: text }] }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            appendMessage("API-Fehler: " + data.error.message, "bot-message");
        } else if (data.candidates && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            appendMessage(reply, "bot-message");
        } else {
            appendMessage("Unerwartete Antwortstruktur erhalten.", "bot-message");
        }
    } catch (error) {
        appendMessage("Fehler bei der Verbindung.", "bot-message");
    }
}

async function codegenRequest(url, options) {
    return await fetch(url, options);
}

function appendMessage(text, className) {
    const msg = document.createElement("div");
    msg.className = `message ${className}`;
    msg.textContent = text;
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}