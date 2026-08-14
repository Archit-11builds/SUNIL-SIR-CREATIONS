import { NextRequest } from 'next/server';

const ALLOWED_HOSTS = new Set([
  'ncert.nic.in',
  'www.ncert.nic.in',
  'cbse.gov.in',
  'www.cbse.gov.in',
  'cbseacademic.nic.in',
  'www.cbseacademic.nic.in',
]);

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url');
  if (!raw) return new Response('Missing resource URL', { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response('Invalid resource URL', { status: 400 });
  }

  if (target.protocol !== 'https:' || !ALLOWED_HOSTS.has(target.hostname)) {
    return new Response('Resource host is not allowed', { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 Archit-Creations/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/pdf,*/*',
      },
      cache: 'no-store',
      redirect: 'follow',
    });

    if (!upstream.ok) {
      return new Response(`Official resource returned ${upstream.status}`, { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    headers.set('Content-Disposition', contentType.includes('pdf') ? 'inline' : 'inline');
    headers.set('X-Content-Type-Options', 'nosniff');

    if (contentType.includes('text/html')) {
      let html = await upstream.text();
      const base = target.origin + target.pathname.replace(/\/[^/]*$/, '/');
      if (!/<base\s/i.test(html)) {
        html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${base}">`);
      }
      return new Response(html, { status: 200, headers });
    }

    return new Response(await upstream.arrayBuffer(), { status: 200, headers });
  } catch {
    return new Response('Could not load the official resource right now. Use Open Official Source instead.', { status: 502 });
  }
}
