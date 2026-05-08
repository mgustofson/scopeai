import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { projectType, description } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'Missing OPENROUTER_API_KEY in environment' }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // fast, cheap, and supports structured JSON easily
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an expert technical architect and scoping engineer. 
The user will provide a Project Type and a Description of what they want to build.
Your job is to break this down into a list of specific, actionable development tasks.
For each task, assign a complexity of "simple", "medium", or "complex".

Respond strictly with a JSON object in this format:
{
  "tasks": [
    { "name": "Task Name", "complexity": "simple|medium|complex" }
  ]
}`
          },
          {
            role: "user",
            content: `Project Type: ${projectType}\nDescription: ${description}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Error:", errorText);
      return NextResponse.json({ error: "Failed to generate scope from OpenRouter" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Error generating scope:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
