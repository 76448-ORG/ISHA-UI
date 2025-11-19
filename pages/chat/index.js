document.addEventListener("DOMContentLoaded", () => {
  const chatBody = document.getElementById("chat-body");
  const chatInput = document.getElementById("chat-input");
  const chatSend = document.getElementById("chat-send");
  const apiSelect = document.getElementById("api-select");

  // Root-relative path to the API keys file
  const API_KEYS_FILE = "/assets/APIkeys.json";

  // --- Utility Functions ---

  /**
   * Appends a message to the chat body.
   * @param {string} text - The message content.
   * @param {string} sender - 'user' or 'bot'.
   */
  function appendMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message message-${sender}`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.textContent = text; // Use textContent for safety

    messageDiv.appendChild(contentDiv);
    chatBody.appendChild(messageDiv);

    // Scroll to the bottom of the chat
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  /**
   * Dynamically adjusts the height of the textarea based on content.
   */
  function autoGrowInput() {
    chatInput.style.height = "auto";
    chatInput.style.height = chatInput.scrollHeight + "px";
  }

  /**
   * Loads the API keys from the external JSON file.
   * NOTE: This function is currently non-functional in this environment
   * but provides the correct structure for when you deploy it.
   * @returns {Promise<object>} An object containing API keys.
   */
  async function loadApiKeys() {
    try {
      const response = await fetch(API_KEYS_FILE);
      if (!response.ok) {
        console.warn(
          `Could not load API keys from ${API_KEYS_FILE}. Using mock data.`
        );
        return {};
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching API keys:", error);
      return {};
    }
  }

  /**
   * Mocks an API response based on the selected model and user input.
   * @param {string} input - The user's message.
   * @param {string} model - The selected model ('gemini', 'chatgpt', 'gprf').
   * @returns {Promise<string>} The mock response.
   */
  function fetchApiResponse(input, model) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let responseText = "";
        const baseResponse = `(Using ${model.toUpperCase()} Mock API) Bro, that's a concise query. For your input, "${input.substring(
          0,
          50
        )}...", a powerful LLM would provide a detailed and relevant output.`;

        if (model === "gprf") {
          responseText = `(GPRF Mock: Emotional policy active) Your tone is neutral/anticipatory. ${baseResponse} The GPRF policy is ready to inject the necessary empathy and social context once activated.`;
        } else if (input.toLowerCase().includes("linux")) {
          responseText = `${baseResponse} Specifically, regarding GNU/Linux, you might be interested in the Arch with i3-WM setup on your Lenovo IDEAPAD S145, right?`;
        } else if (input.toLowerCase().includes("multiverse")) {
          responseText = `${baseResponse} Hypothetical concept acknowledged. My response is based on current physics models of time-space manifold and multiversal expansion.`;
        } else {
          responseText = baseResponse;
        }

        resolve(responseText);
      }, 1000 + Math.random() * 500); // 1.0 - 1.5s mock delay
    });
  }

  // --- Main Event Handlers ---

  async function handleSendMessage() {
    const input = chatInput.value.trim();
    if (!input) return;

    const selectedModel = apiSelect.value;
    const sendBtnIcon = chatSend.innerHTML; // Save original icon

    // 1. Display user message
    appendMessage(input, "user");
    chatInput.value = "";
    autoGrowInput();

    // 2. Disable input/button and show loading
    chatInput.disabled = true;
    chatSend.disabled = true;
    chatSend.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // 3. Simulate API call
    try {
      // In a real implementation, you'd load keys and use them here:
      // const keys = await loadApiKeys();
      // const response = await realApiCall(input, selectedModel, keys);

      const response = await fetchApiResponse(input, selectedModel);
      appendMessage(response, "bot");
    } catch (error) {
      console.error("Chat error:", error);
      appendMessage(
        `Error: Could not connect to ${selectedModel.toUpperCase()}. Check the console.`,
        "bot"
      );
    } finally {
      // 4. Re-enable controls
      chatInput.disabled = false;
      chatSend.disabled = false;
      chatSend.innerHTML = sendBtnIcon;
      chatInput.focus();
    }
  }

  // --- Initialization and Listeners ---

  // Send button click
  chatSend.addEventListener("click", handleSendMessage);

  // Enter key press in input area
  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // Auto-resize on input
  chatInput.addEventListener("input", autoGrowInput);

  // Initial focus and resize
  chatInput.focus();
  autoGrowInput();
});
