import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseGitHubUrl } from '@/lib/github';
import { analyzeConventions } from '@/lib/analysis/playbook';

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
    const repoInfo = parseGitHubUrl(`https://github.com/${repo}`);
    const conventions = await analyzeConventions(repoInfo, role, session.accessToken);
    return NextResponse.json({ conventions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
} 