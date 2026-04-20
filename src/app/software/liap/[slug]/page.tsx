import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LIAP_DOCS, getDoc, getNeighbors } from "@/lib/liap-docs";
import { loadDocMarkdown } from "@/lib/liap-docs.server";
import LiapDocReader from "@/components/LiapDocReader";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return LIAP_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) return { title: "LIAP — Not Found" };
  return { title: `LIAP · ${doc.number} ${doc.title}` };
}

export default async function LiapDocPage({ params }: { params: Params }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();

  const markdown = await loadDocMarkdown(slug);
  const { prev, next } = getNeighbors(slug);

  return (
    <LiapDocReader
      markdown={markdown}
      doc={doc}
      prev={prev}
      next={next}
    />
  );
}
