/**
 * Strip markdown syntax from text to get plain text preview
 * Useful for showing article/content snippets without markdown formatting
 */
export function stripMarkdown(markdown: string): string {
  if (!markdown) return "";

  let text = markdown;

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, "");

  // Remove headings (# ## ### etc)
  text = text.replace(/^#+\s+/gm, "");

  // Remove bold/italic (**text**, *text*, __text__, _text_)
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2");
  text = text.replace(/(\*|_)(.*?)\1/g, "$2");

  // Remove strikethrough (~~text~~)
  text = text.replace(/~~(.*?)~~/g, "$1");

  // Remove code blocks (```code```)
  text = text.replace(/```[\s\S]*?```/g, "");

  // Remove inline code (`code`)
  text = text.replace(/`([^`]+)`/g, "$1");

  // Remove links [text](url)
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // Remove images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");

  // Remove blockquotes (> text)
  text = text.replace(/^>\s+/gm, "");

  // Remove horizontal rules (---, ***, ___)
  text = text.replace(/^[-*_]{3,}\s*$/gm, "");

  // Remove list markers (-, *, +, 1., 2., etc)
  text = text.replace(/^[\s]*[-*+]\s+/gm, "");
  text = text.replace(/^[\s]*\d+\.\s+/gm, "");

  // Remove table syntax
  text = text.replace(/\|/g, " ");

  // Collapse multiple newlines into one
  text = text.replace(/\n{2,}/g, "\n");

  // Trim whitespace
  text = text.trim();

  return text;
}

/**
 * Clamp text to a specific length with ellipsis
 * @param text - The text to clamp
 * @param maxLength - Maximum length before truncating
 * @returns Clamped text with ellipsis if truncated
 */
export function clampText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

/**
 * Get plain text preview from markdown content
 * Strips markdown and clamps to specified length
 */
export function getMarkdownPreview(
  markdown: string,
  maxLength: number = 140,
): string {
  const plainText = stripMarkdown(markdown);
  return clampText(plainText, maxLength);
}
