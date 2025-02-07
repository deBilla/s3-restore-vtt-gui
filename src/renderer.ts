document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded.");

  const logContainer = document.getElementById("logContainer");
  if (!logContainer) {
    console.error("❌ logContainer not found in DOM!");
    return;
  }

  document.getElementById("submitButton")?.addEventListener("click", async () => {
    const userInput = (document.getElementById("userInput") as HTMLInputElement).value;
    logMessage(`🖱️ Sending restoreVtt request: ${userInput}`);

    try {
      const result = await window.electron.restoreVtt(userInput);
      logMessage(`✅ Success: ${result}`);
    } catch (error) {
      logMessage(`❌ Error: ${error}`);
    }
  });

  // Listen for logs from the main process
  window.electron.onLogMessage((message) => {
    logMessage(message);
  });

  // Function to display logs in the UI
  function logMessage(message: string) {
    console.log("📜 Logging message:", message);

    if (logContainer) {
      const logEntry = document.createElement("p");
      logEntry.textContent = message;
      logContainer.appendChild(logEntry);
      logContainer.scrollTop = logContainer.scrollHeight; // Auto-scroll
  
      // Send log to main process
      window.electron.sendLogToMain(message);
    }
  }
});
