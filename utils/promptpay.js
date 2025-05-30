//utils/promptpay.js

function padStart(str, length) {
  return str.toString().padStart(length, "0");
}

function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

function generatePromptPayPayload({ amount }) {
  const mobileNumber = process.env.NEXT_PUBLIC_PROMPT_PAY_MOBILE;
  const mobile = mobileNumber?.replace(/[^0-9]/g, "").slice(-9); // last 9 digits
  const formattedMobile = `0066${mobile}`;
  const payload = [
    "000201", // Payload Format Indicator
    "010212", // Point of Initiation Method
    "29370016A000000677010111", // PromptPay AID
    `01130066${mobile}`, // Biller ID or phone number
    `5303764`, // THB currency
    `54${padStart(formatAmount(amount).length, 2)}${formatAmount(amount)}`, // amount
    "5802TH", // country code
    "6304", // CRC placeholder
  ];

  const rawPayload = payload.join("");
  const crc = crc16(rawPayload);
  return rawPayload + crc;
}

function crc16(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  crc &= 0xffff;
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export { generatePromptPayPayload };
