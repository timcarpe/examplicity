import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return Response.json({ error: 'Cleanup is not configured.' }, { status: 500 });
  }

  try {
    const sql = neon(connectionString);
    const rateLimits = await sql`
      DELETE FROM bug_report_rate_limits
      WHERE last_submitted_at <= now() - interval '24 hours'
      RETURNING 1
    `;
    const spam = await sql`
      DELETE FROM bug_reports
      WHERE status = 'spam' AND created_at < now() - interval '30 days'
      RETURNING 1
    `;
    const closed = await sql`
      DELETE FROM bug_reports
      WHERE status IN ('rejected', 'duplicate')
        AND created_at < now() - interval '180 days'
      RETURNING 1
    `;

    return Response.json({
      deleted: {
        rateLimits: rateLimits.length,
        spam: spam.length,
        rejectedOrDuplicate: closed.length,
      },
    });
  } catch {
    return Response.json({ error: 'Cleanup failed.' }, { status: 500 });
  }
}
