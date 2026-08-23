import { notFound } from "next/navigation";

import { ContentEditor } from "@/components/editor/content-editor";
import { isPageKey } from "@/content/registry";

export default async function EditPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isPageKey(key)) notFound();
  return <ContentEditor pageKey={key} />;
}
