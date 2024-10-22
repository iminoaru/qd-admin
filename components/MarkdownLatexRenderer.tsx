import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm'; // GitHub Flavored Markdown
import 'katex/dist/katex.min.css'; // Import the KaTeX CSS

// Function to preprocess the content, ensuring proper escaping for inline and block LaTeX
const preprocessContent = (content: string) => {
    let processed = content;

    // Handle potential issues with double dollar signs for block LaTeX
    processed = processed.replace(/\$\$(.+?)\$\$/g, (match, p1) => {
        return `$$${p1.trim()}$$`; // Ensure no spaces between the dollars and content
    });

    // Handle inline LaTeX issues with single dollar signs
    processed = processed.replace(/\$(.+?)\$/g, (match, p1) => {
        return `$${p1.trim()}$`; // Ensure no spaces between the dollars and content
    });

    return processed;
};

const MarkdownLaTeXRenderer = ({ content }: { content: string }) => {
    const processedContent = preprocessContent(content);

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]} // Add GFM and Math plugins
            rehypePlugins={[rehypeKatex]} // KaTeX plugin for rendering LaTeX
        >
            {processedContent}
        </ReactMarkdown>
    );
};

export default MarkdownLaTeXRenderer;
