

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  try {
    const payload = req.body;
    
    console.log("Received webhook payload:", JSON.stringify(payload));


    if (payload.apply && payload.apply.length > 0) {
      const transactions = payload.apply[0].transactions;


      for (const tx of transactions) {

        if (tx.metadata.success) {
          const sender = tx.metadata.sender;
          const txId = tx.transaction_identifier.hash;

          const shortSender = `${sender.slice(0, 6)}...${sender.slice(-4)}`;

          const message = `
🔥 <b>STREAK KEEPER ALERT!</b> 🔥

👤 <b>User:</b> <code>${shortSender}</code>
✅ <b>Action:</b> Daily Check-in Success!
🔗 <b>TxID:</b> <a href="https://explorer.hiro.so/txid/${txId}?chain=mainnet">View on Explorer</a>

<i>Keep the streak alive! ⚡</i>
          `;

        
          await sendTelegramMessage(message);
        }
      }
    }


    return res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({ status: 'error', error: error.message });
  }
}


async function sendTelegramMessage(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("Missing Telegram Config");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML', 
      disable_web_page_preview: true
    })
  });
}