const crypto = require('crypto');

// Must be 32 bytes (256 bits)
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Using a deterministic IV based on the key so the same text encrypts to the same output.
// Note: This is less secure than randomized IV against certain attacks,
// but it enables exact-match searching in the database.
// For Aadhar numbers, deterministic is usually required if we ever need to search by it.
// If not searching by Aadhaar, randomized IV is better. We will use random IV for better security since Aadhaar is highly sensitive
// and we don't currently search users by Aadhaar.

// Optional deterministic method for exact match searches
exports.encryptDeterministic = (text) => {
    if (!text) return text;
    try {
        // Derive a fixed IV from the input and key. This is a compromise between random IV and fixed IV.
        // It provides deterministic output for the exact same input, allowing search,
        // while avoiding identical ciphertexts for different inputs using the same IV.
        const hash = crypto.createHash('sha256');
        hash.update(ENCRYPTION_KEY + text);
        const iv = hash.digest().slice(0, 16);

        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (e) {
        console.error('Encryption error:', e);
        return text;
    }
};

exports.decryptDeterministic = (text) => {
    if (!text) return text;
    // If text doesn't have our format (IV:encryptedData), it might not be encrypted yet. return as is.
    if (!text.includes(':')) return text;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error('Decryption error:', e);
        // Fallback to return the raw text if decryption fails, useful for legacy data
        return text;
    }
};
