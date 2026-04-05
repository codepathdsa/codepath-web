import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import PremiumGate from '@/app/components/PremiumGate';
import { buildMdxComponents } from '@/app/components/mdxComponents';
import rehypeHighlight from 'rehype-highlight';
import ProblemShell from './ProblemShell';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const fileContent = fs.readFileSync(
      path.join(process.cwd(), 'content', 'problems', `${slug}.mdx`), 'utf8'
    );
    const { data } = matter(fileContent);
    return { title: `${data.title} — Editorial | CodePath` };
  } catch {
    return { title: 'Problem Not Found | CodePath' };
  }
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), 'content', 'problems', `${slug}.mdx`);

  let fileContent: string;
  try {
    fileContent = fs.readFileSync(filePath, 'utf8');
  } catch {
    notFound();
  }

  const { data, content } = matter(fileContent!);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // ── Split MDX: separate "editorial" from "VisualTree" section ─────────
  // Everything before the first <VisualTree is the editorial content.
  // Everything after the last </VisualTree> /> is excluded (CodeEditor is now built-in).
  // We render VisualTree separately as a React node for the left-panel Visual tab.

  const visualTreeMatch = content.match(/<VisualTree[\s\S]*?\/>/);
  const contentToSplit = content
    .replace(/<VisualTree[\s\S]*?\/>/g, '')
    .replace(/<CodeEditor[\s\S]*?\/>/g, '')
    .replace(/##\s+🌳\s+Algorithm Visual Walkthrough[\s\S]*?(?=##|$)/, '')
    .replace(/##\s+⌨️\s+Practice Editor[\s\S]*?(?=##|$)/, '')
    .trim();

  const splitRegex = /##\s+(Intuition|All \d+ Approaches|Approaches|Solution)/i;
  const match = contentToSplit.match(splitRegex);

  let questionContent = contentToSplit;
  let solutionContent = '';

  if (match && match.index !== undefined) {
    questionContent = contentToSplit.substring(0, match.index).trim();
    solutionContent = contentToSplit.substring(match.index).trim();
  }

  const intuitionMatch = solutionContent.match(/##\s+Intuition[\s\S]*?(?=##\s|$)/i);
  const hintContent = intuitionMatch ? intuitionMatch[0] : '';

  const visualTreeContent = visualTreeMatch ? visualTreeMatch[0] : null;

  // ── Build MDX component maps ──────────────────────────────────────────
  const premiumComponent = {
    Premium: ({ children }: { children: React.ReactNode }) => (
      <PremiumGate isAuthenticated={isAuthenticated}>{children}</PremiumGate>
    ),
  };

  const mdxComponents = buildMdxComponents(premiumComponent);

  // ── Render MDX parts as RSC ───────────────────────────────────────────
  const questionNode = (
    <MDXRemote
      source={questionContent}
      components={mdxComponents}
      options={{ mdxOptions: { rehypePlugins: [rehypeHighlight] } }}
    />
  );
  
  const solutionNode = solutionContent ? (
    <MDXRemote
      source={solutionContent}
      components={mdxComponents}
      options={{ mdxOptions: { rehypePlugins: [rehypeHighlight] } }}
    />
  ) : null;

  const hintNode = hintContent ? (
    <MDXRemote
      source={hintContent}
      components={mdxComponents}
      options={{ mdxOptions: { rehypePlugins: [rehypeHighlight] } }}
    />
  ) : null;

  // ── Render visual tree if present ─────────────────────────────────────
  const visualTree = visualTreeContent ? (
    <MDXRemote
      source={visualTreeContent}
      components={buildMdxComponents(premiumComponent)}
      options={{ mdxOptions: { rehypePlugins: [rehypeHighlight] } }}
    />
  ) : undefined;

  return (
    <ProblemShell
      slug={slug}
      meta={{
        title: data.title,
        difficulty: data.difficulty,
        topics: data.topics,
        companies: data.companies,
        acceptance: data.acceptance,
        readTime: data.readTime,
        approaches: data.approaches,
        leetcode_url: data.leetcode_url,
      }}
      isAuthenticated={isAuthenticated}
      question={questionNode}
      solution={solutionNode}
      hint={hintNode}
      visualTree={visualTree}
    />
  );
}
