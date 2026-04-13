export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: any, context: any) {
  try {
    const params = await context.params;
    const slug = params.module_slug;
    const usageRecords = await prisma.configUsage.findMany({
      where: { module_slug: slug },
      orderBy: { use_count: 'desc' }
    });

    const suggestions: Record<string, any[]> = {};
    const fieldCounts: Record<string, number> = {};

    for (const record of usageRecords) {
      const key = record.field_key;
      if (!suggestions[key]) {
        suggestions[key] = [];
        fieldCounts[key] = 0;
      }

      if (fieldCounts[key] < 5) {
        const parsed = parseInt(record.field_value, 10);
        suggestions[key].push(isNaN(parsed) ? record.field_value : parsed);
        fieldCounts[key] += 1;
      }
    }

    return NextResponse.json(suggestions);
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ detail: e.message }, { status: 500 });
  }
}
