import { handlers } from '@/lib/auth';

export async function POST(req, ctx) {
	let body = null;
	const contentType = req.headers.get('content-type') || '';
	if (contentType.includes('application/json')) {
		try {
			body = await req.json();
		} catch {}
	} else if (contentType.includes('application/x-www-form-urlencoded')) {
		const text = await req.text();
		body = Object.fromEntries(new URLSearchParams(text));
	}
	req.body = body;
	return handlers.POST(req, ctx);
}

export const GET = handlers.GET;
