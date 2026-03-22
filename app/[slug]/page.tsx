import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import ProblemInteractiveClient from './ProblemInteractiveClient';
import PremiumGate from '@/app/components/PremiumGate';
import { buildMdxComponents } from '@/app/components/mdxComponents';
import rehypeHighlight from 'rehype-highlight';
import ThemeToggle from '@/app/components/ThemeToggle';

// Generates static metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const fileContent = fs.readFileSync(
      path.join(process.cwd(), 'content', 'problems', `${slug}.mdx`),
      'utf8'
    );
    const { data } = matter(fileContent);
    return { title: `${data.title} — Full Editorial | CodePath` };
  } catch (e) {
    return { title: 'Problem Not Found | CodePath' };
  }
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'content', 'problems', `${slug}.mdx`);

  let fileContent;
  try {
    fileContent = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    notFound();
  }

  const { data, content } = matter(fileContent);

  // Authenticate user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // Build full component map: styled pre/code/table + per-page Premium gate.
  const mdxComponents = buildMdxComponents({
    Premium: ({ children }: { children: React.ReactNode }) => (
      <PremiumGate isAuthenticated={isAuthenticated}>{children}</PremiumGate>
    ),
  });

  return (
    <>
      <nav className="site-nav">
        <Link href="/" className="nav-logo">Code<span>Path</span></Link>
        <ul className="nav-links">
          <li><Link href="/#practice">Practice</Link></li>
          <li><Link href="/#why">Why Written?</Link></li>
          <li><ThemeToggle /></li>
          <li><Link href="/#practice" className="nav-cta">Back to Practice →</Link></li>
        </ul>
      </nav>

      <div className="editorial-layout">
        <article>
          <div className="article-header">
            <div className="article-breadcrumb">
              <Link href="/#practice">Practice</Link>
              <span>›</span>
              <span>{data.topics && data.topics[0] ? data.topics[0] : 'Algorithms'}</span>
              <span>›</span>
              <span>{data.title.replace(/^#\d+\.\s*/, '')}</span>
            </div>

            <h1 className="article-title">{data.title}</h1>

            <div className="article-meta">
              <span className={`badge badge--${data.difficulty?.toLowerCase() || 'easy'}`}>
                {data.difficulty}
              </span>
              {data.topics?.map((topic: string) => (
                <span key={topic} className="badge badge--topic">{topic}</span>
              ))}
            </div>

            <div className="article-stats">
              {data.readTime && <span>⏱ {data.readTime}</span>}
              {data.approaches && <span>📐 {data.approaches} approaches</span>}
              {data.companies && <span>🏢 {data.companies.join(' · ')}</span>}
              {data.acceptance && <span>✅ {data.acceptance}</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              
              {/* Client Component for localStorage / React State interactivity */}
              <ProblemInteractiveClient slug={slug} />

              {data.leetcode_url && (
                <a 
                  href={data.leetcode_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn--outline" 
                  style={{ fontSize: '0.82rem', padding: '8px 14px' }}
                >
                  Try on LeetCode ↗
                </a>
              )}
            </div>
          </div>

          <div className="article-content">
            <MDXRemote
              source={content}
              components={mdxComponents}
              options={{
                mdxOptions: {
                  rehypePlugins: [rehypeHighlight],
                },
              }}
            />
          </div>
        </article>

        <aside className="article-sidebar">
          <div className="meta-card">
            <div className="meta-row">
              <span className="meta-label">Difficulty</span>
              <span className={`badge badge--${data.difficulty?.toLowerCase() || 'easy'}`}>{data.difficulty}</span>
            </div>
            {data.acceptance && (
              <div className="meta-row">
                <span className="meta-label">Acceptance</span>
                <span className="meta-value">{data.acceptance.replace(' acceptance', '')}</span>
              </div>
            )}
            {data.topics && data.topics[0] && (
              <div className="meta-row">
                <span className="meta-label">Topic</span>
                <span className="meta-value">{data.topics.join(' & ')}</span>
              </div>
            )}
            {data.companies && (
               <div className="meta-row">
                 <span className="meta-label">Companies</span>
                 <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                   {data.companies.map((company: string) => (
                     <span key={company} className="badge badge--topic" style={{ fontSize: '0.68rem' }}>{company}</span>
                   ))}
                 </div>
               </div>
            )}
          </div>
        </aside>
      </div>

      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">Code<span>Path</span></div>
            <p>Written DSA prep for engineers who prefer reading over watching. Free forever.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 CodePath · Free forever · Open source</span>
          <span>Made with ♥ for every engineer</span>
        </div>
      </footer>
    </>
  );
}
