import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseGitHubUrl } from '@/lib/github';
import { analyzeCodebase } from '@/lib/analysis/insights';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const repo = request.nextUrl.searchParams.get('repo');
  const role = request.nextUrl.searchParams.get('role');

  if (!repo || !role) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    if (!session.accessToken) {
      return NextResponse.json({ error: 'Access token not found' }, { status: 401 });
    }

    // Ensure we're working with a decoded repository path
    const decodedRepo = decodeURIComponent(repo);
    const repoInfo = parseGitHubUrl(`https://github.com/${decodedRepo}`);
    const analysis = await analyzeCodebase(repoInfo, role, session.accessToken);
    console.log('Analysis result:', analysis);
    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}