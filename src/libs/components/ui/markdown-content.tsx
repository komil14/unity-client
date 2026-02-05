import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import rehypeRaw from "rehype-raw";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  return (
    <div
      className={`prose prose-sm sm:prose-base dark:prose-invert max-w-none ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1
              className="text-3xl font-extrabold tracking-tight text-foreground mt-8 mb-4"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-2xl font-bold tracking-tight text-foreground mt-6 mb-3"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-xl font-semibold text-foreground mt-5 mb-2"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-lg font-semibold text-foreground mt-4 mb-2"
              {...props}
            />
          ),
          h5: ({ node, ...props }) => (
            <h5
              className="text-base font-semibold text-foreground mt-3 mb-1"
              {...props}
            />
          ),
          h6: ({ node, ...props }) => (
            <h6
              className="text-sm font-semibold text-foreground mt-2 mb-1"
              {...props}
            />
          ),

          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="leading-7 text-foreground mb-4" {...props} />
          ),

          // Lists
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside space-y-2 mb-4 text-foreground"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside space-y-2 mb-4 text-foreground"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-7 text-foreground" {...props} />
          ),

          // Links
          a: ({ node, ...props }) => (
            <a
              className="text-primary font-medium hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          // Code blocks
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code
                className="relative rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground"
                {...props}
              />
            ) : (
              <code
                className="block rounded-lg bg-muted p-4 font-mono text-sm text-foreground overflow-x-auto mb-4"
                {...props}
              />
            ),
          pre: ({ node, ...props }) => (
            <pre
              className="rounded-lg bg-muted p-4 overflow-x-auto mb-4"
              {...props}
            />
          ),

          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary pl-4 italic text-muted-foreground mb-4"
              {...props}
            />
          ),

          // Horizontal rules
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-border" {...props} />
          ),

          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto mb-4">
              <table
                className="w-full border-collapse border border-border"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-muted" {...props} />
          ),
          tbody: ({ node, ...props }) => <tbody {...props} />,
          tr: ({ node, ...props }) => (
            <tr className="border-b border-border" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-2 text-left font-semibold text-foreground"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-foreground" {...props} />
          ),

          // Images
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg max-w-full h-auto mb-4"
              loading="lazy"
              {...props}
            />
          ),

          // Strong/Bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-foreground" {...props} />
          ),

          // Emphasis/Italic
          em: ({ node, ...props }) => (
            <em className="italic text-foreground" {...props} />
          ),

          // Strikethrough (GFM)
          del: ({ node, ...props }) => (
            <del className="line-through text-muted-foreground" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
