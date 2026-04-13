export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getModules } from '@/lib/quiz/registry';

export async function GET() {
  const modulesData = getModules().map(m => ({
    slug: m.slug,
    title: m.title,
    desc: m.description
  }));
  return NextResponse.json(modulesData);
}
