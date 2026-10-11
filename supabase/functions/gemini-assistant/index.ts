// Supabase Edge Function: gemini-assistant
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
    const { message, userContext } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "Falta el mensaje del usuario" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          reply:
            "En ASCEND priorizamos la ejecución estricta en calistenia, superávit o déficit controlado y consistencia diaria. (Modo fuera de línea de Gemini)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Eres el Asistente Oficial de ASCEND — Personal Evolution.
Ayudas al usuario con:
- Técnica estricta y segura de calistenia en casa.
- Ideas de comidas saludables y económicas.
- Hábitos de higiene, descanso y disciplina.
- Motivación realista sin positividad tóxica.
REGLAS OBLIGATORIAS:
- No afirmes ser médico clínico ni dietista certificado.
- Ante lesiones o dolor punzante, recomienda consultar a un profesional de la salud.
- Sé conciso, directo y motivador.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemPrompt}\nContexto: ${JSON.stringify(userContext || {})}\n\nPregunta: ${message}` }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta disponible.";

    return new Response(JSON.stringify({ reply: replyText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
