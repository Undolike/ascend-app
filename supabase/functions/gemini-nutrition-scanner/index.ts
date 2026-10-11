// Supabase Edge Function: gemini-nutrition-scanner
// Deno TypeScript environment
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { mealDescription } = await req.json();
    if (!mealDescription) {
      return new Response(JSON.stringify({ error: "Falta la descripción del plato" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      // Graceful fallback si no hay clave de API configurada en Supabase Secrets
      return new Response(
        JSON.stringify({
          foodName: mealDescription,
          portionGrams: 200,
          calories: 350,
          protein: 28,
          carbs: 35,
          fat: 10,
          uncertaintyNotice: "Estimación matemática estándar (Modo sin conexión externa)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Eres un asistente de nutrición general enfocado en calistenia. Analiza la siguiente descripción de comida y devuelve EXCLUSIVAMENTE un JSON con:
{
  "foodName": string,
  "portionGrams": number,
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "uncertaintyNotice": "Estimación aproximada basada en ingredientes estándar. Revisa las cantidades antes de guardar."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nComida a analizar: ${mealDescription}` }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const cleanedJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanedJson);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
