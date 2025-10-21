// ==========================================
// Utility Functions
// ==========================================

/**
 * Get element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement} - DOM element
 */
const getElement = (id) => document.getElementById(id)

// ==========================================
// Encryption Configuration
// ==========================================

// Fixed key & IV for AES-128 GCM encryption
const ENCRYPTION_CONFIG = {
  key: "ThisIsA16ByteKey", // 16 bytes for AES-128
  iv: "Fixed12ByteIV!", // 12 bytes for GCM mode
  algorithm: "AES-GCM",
}

// ==========================================
// Encryption & Decryption Functions
// ==========================================

/**
 * Encrypt text using AES-128 GCM
 * @param {string} text - Plain text to encrypt
 * @returns {Promise<string>} - Base64 encoded encrypted text
 */
async function encryptText(text) {
  try {
    // Convert key and IV to byte arrays
    const keyBytes = new TextEncoder().encode(ENCRYPTION_CONFIG.key)
    const ivBytes = new TextEncoder().encode(ENCRYPTION_CONFIG.iv)

    // Import the key for encryption
    const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, ENCRYPTION_CONFIG.algorithm, false, ["encrypt"])

    // Encrypt the text
    const encrypted = await crypto.subtle.encrypt(
      { name: ENCRYPTION_CONFIG.algorithm, iv: ivBytes },
      cryptoKey,
      new TextEncoder().encode(text),
    )

    // Convert to base64
    const bytes = new Uint8Array(encrypted)
    return btoa(String.fromCharCode(...bytes))
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`)
  }
}

/**
 * Decrypt text using AES-128 GCM
 * @param {string} base64Text - Base64 encoded encrypted text
 * @returns {Promise<string>} - Decrypted plain text
 */
async function decryptText(base64Text) {
  try {
    // Convert key and IV to byte arrays
    const keyBytes = new TextEncoder().encode(ENCRYPTION_CONFIG.key)
    const ivBytes = new TextEncoder().encode(ENCRYPTION_CONFIG.iv)

    // Import the key for decryption
    const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, ENCRYPTION_CONFIG.algorithm, false, ["decrypt"])

    // Convert base64 to byte array
    const bytes = Uint8Array.from(atob(base64Text), (c) => c.charCodeAt(0))

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt({ name: ENCRYPTION_CONFIG.algorithm, iv: ivBytes }, cryptoKey, bytes)

    // Convert to string
    return new TextDecoder().decode(decrypted)
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`)
  }
}

// ==========================================
// UI Helper Functions
// ==========================================

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    // Silent copy - no alert
  } catch (error) {
    console.error("Failed to copy:", error)
  }
}

/**
 * Clear input and output fields
 * @param {string} inputId - Input field ID
 * @param {string} outputId - Output field ID
 */
function clearFields(inputId, outputId) {
  getElement(inputId).value = ""
  getElement(outputId).value = ""
}

// ==========================================
// Event Handlers
// ==========================================

/**
 * Handle encryption button click
 */
async function handleEncrypt() {
  const inputText = getElement("inputText").value
  const outputField = getElement("encryptedOutput")

  if (!inputText.trim()) {
    outputField.value = "กรุณาใส่ข้อความที่ต้องการเข้ารหัส"
    return
  }

  try {
    const encrypted = await encryptText(inputText)
    outputField.value = encrypted
  } catch (error) {
    outputField.value = `เกิดข้อผิดพลาด: ${error.message}`
  }
}

/**
 * Handle decryption button click
 */
async function handleDecrypt() {
  const inputText = getElement("decryptInput").value
  const outputField = getElement("decryptedOutput")

  if (!inputText.trim()) {
    outputField.value = "กรุณาใส่ข้อความที่ต้องการถอดรหัส"
    return
  }

  try {
    const decrypted = await decryptText(inputText)
    outputField.value = decrypted
  } catch (error) {
    outputField.value = `เกิดข้อผิดพลาด: ${error.message}`
  }
}

// ==========================================
// Event Listeners Setup
// ==========================================

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
  // Encryption section
  getElement("encryptBtn").addEventListener("click", handleEncrypt)
  getElement("clearEncrypt").addEventListener("click", () => {
    clearFields("inputText", "encryptedOutput")
  })
  getElement("copyEncrypted").addEventListener("click", () => {
    copyToClipboard(getElement("encryptedOutput").value)
  })

  // Decryption section
  getElement("decryptBtn").addEventListener("click", handleDecrypt)
  getElement("clearDecrypt").addEventListener("click", () => {
    clearFields("decryptInput", "decryptedOutput")
  })
  getElement("copyDecrypted").addEventListener("click", () => {
    copyToClipboard(getElement("decryptedOutput").value)
  })

  // Enter key support for textareas
  getElement("inputText").addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleEncrypt()
    }
  })

  getElement("decryptInput").addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleDecrypt()
    }
  })
}

// ==========================================
// Initialize Application
// ==========================================

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeEventListeners()
  console.log("🔒 Encryption/Decryption app initialized successfully!")
})
