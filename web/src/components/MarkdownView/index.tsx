import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';

import 'highlight.js/styles/github-dark.css'; // 临时高亮样式
import './shoka.css'; // 你复制下来的 Shoka 样式

interface Props {
  content: string;
}

const MarkdownView: React.FC<Props> = ({ content }) => {
  return (
    <article className="shoka-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

export default MarkdownView;
