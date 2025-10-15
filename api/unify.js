import OpenAI from "openai";

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => (data += chunk));
      req.on("end", () => resolve(JSON.parse(data)));
      req.on("error", reject);
    });

    const { childImageBase64, adultImageBase64 } = body;

    if (!childImageBase64 || !adultImageBase64) {
      return res.status(400).json({ error: "Missing images" });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
      Create a realistic photo showing an adult hugging their childhood self.
      Use the two provided photos as reference for the adult and the child.
      Both should look naturally interacting, with a soft white background
      and warm, natural lighting.
    `;

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024"
    });

    res.status(200).json({ imageUrl: result.data[0].url });
  } catch (err) {
    console.error("Error in backend:", err);
    res.status(500).json({ error: err.message });
  }
}
