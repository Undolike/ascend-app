// Supabase Edge Function: gemini-style-advisor
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
    const { outfitDescription } = await req.json();
    if (!outfitDescription) {
      return new Response(JSON.stringify({ error: "Falta la descripción del atuendo" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          suggestions:
            "• Armonía: Colores neutros con acento equilibrado.\n• Ajuste: Ropa a la medida sin compresión excesiva.\n• Calzado: Limpio y acorde a la ocasión.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Eres un asesor de estilo personal enfocado en presencia, proporciones, ajuste de prendas y combinaciones de color. Ofrece sugerencias respetuosas, prácticas y económicas. NO califiques el valor personal, la dignidad ni el atractivo como si fueran medidas objetivas. NO hagas inferencias sobre salud o personalidad.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\n\nAtuendo: ${outfitDescription}` }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta disponible.";

    return new Response(JSON.stringify({ suggestions: replyText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
