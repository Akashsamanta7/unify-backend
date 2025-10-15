import OpenAI from "openai";

export default async function handler(req, res) {
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
    const { childImageBase64, adultImageBase64 } = req.body;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `
      Create a single realistic image showing an adult hugging their child version.
      Use the uploaded adult and child photos as references.
      Replace the background with a smooth white one and apply soft, natural lighting.
    `;

    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      image: [childImageBase64, adultImageBase64],
      size: "1024x1024"
    });

    res.status(200).json({ imageUrl: result.data[0].url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
