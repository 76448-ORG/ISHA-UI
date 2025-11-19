document.addEventListener("DOMContentLoaded", () => {
  const reportContent = document.getElementById("report-content");
  const loadingMessage = document.getElementById("loading-message");
  const errorMessage = document.getElementById("error-message");

  // Root-relative path to the URL configuration file
  const URL_CONFIG_FILE = "/assets/url.json";

  // --- Configuration for Marked.js ---
  if (typeof marked !== "undefined") {
    marked.setOptions({
      gfm: true,
      sanitize: true,
      breaks: true,
    });
  }

  /**
   * Fetches the Markdown content URL from config and then renders the report.
   */
  async function loadReport() {
    loadingMessage.classList.remove("hidden");
    errorMessage.classList.add("hidden");

    try {
      // STEP 1: Fetch the URL configuration
      const configResponse = await fetch(URL_CONFIG_FILE);
      if (!configResponse.ok) {
        throw new Error(
          `Config file not found or failed to load: ${URL_CONFIG_FILE} (${configResponse.status})`
        );
      }
      const config = await configResponse.json();

      // Extract the target URL
      const markdownUrl = config.GPRF-Readme;
      if (!markdownUrl) {
        throw new Error("GPRF-Readme not found in config.");
      }

      // STEP 2: Fetch the Markdown content using the URL from the config
      const response = await fetch(markdownUrl);

      if (!response.ok) {
        throw new Error(`GitHub URL fetch error! status: ${response.status}`);
      }

      const markdownText = await response.text();

      if (typeof marked === "undefined") {
        throw new Error("Markdown parser (marked.js) not loaded.");
      }

      // Convert Markdown to HTML
      const htmlContent = marked(markdownText);

      // Clear loading/error messages and inject HTML
      reportContent.innerHTML = "";
      const contentDiv = document.createElement("div");
      contentDiv.innerHTML = htmlContent;
      reportContent.appendChild(contentDiv);
    } catch (error) {
      console.error("Error loading project report:", error);
      // Display error message
      errorMessage.textContent = `Error: ${error.message}. Check console for details.`;
      errorMessage.classList.remove("hidden");
      loadingMessage.classList.add("hidden");
    }
  }

  loadReport();
});
