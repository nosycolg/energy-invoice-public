import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.API_URL || 'http://localhost:3002';

export async function POST(req: NextRequest) {
  let response: Response | undefined;
  try {
    const formData = await req.formData();

    response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('[/api/upload] resposta não-JSON do backend:', text.slice(0, 200));
      return NextResponse.json(
        { error: 'Resposta inválida do servidor de processamento.' },
        { status: 502 },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[/api/upload] proxy error:', msg);
    return NextResponse.json(
      { error: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.' },
      { status: 502 },
    );
  }
}
