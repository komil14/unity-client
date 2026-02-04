import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ImagePlus, Loader2, X } from "lucide-react";

import { useCheckAuthQuery } from "../../services/authApi";
import { useCreateArticleMutation } from "../../services/articlesApi";
import { useScrollToTop } from "../../hooks/useScrollToTop";
import { useToast } from "../../../libs/components/ui/toast";

export default function CreateArticlePage() {
  useScrollToTop();
  const navigate = useNavigate();
  const { data: authData, isLoading: authLoading } = useCheckAuthQuery();
  const isOrganizer = authData?.member?.memberType === "ORG";

  const [createArticle, createState] = useCreateArticleMutation();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size must be under 5MB.", "error");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isOrganizer) {
      setError("Only organizers can create articles.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    try {
      const result = await createArticle({
        boardTitle: title.trim(),
        boardContent: content.trim(),
        boardImage: image ?? undefined,
      }).unwrap();

      showToast("Article created successfully.");
      navigate(`/articles/${result._id}`);
    } catch (err: any) {
      setError(err?.data?.message || "Failed to create article.");
    }
  };

  if (authLoading) {
    return <div className="text-muted-foreground">Loading…</div>;
  }

  if (!isOrganizer) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-card/30 p-6 text-sm text-muted-foreground">
        Only organizer accounts can create articles. Please log in with an
        organizer account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Write an Article
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Share updates, stories, and insights with the Unity community.
          </p>
        </div>
        <Link
          to="/articles"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Back to Articles
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[var(--radius-lg)] border border-border bg-card/30 p-6 space-y-6"
      >
        {error ? (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article title"
            className="h-11 w-full rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your article..."
            rows={10}
            className="w-full rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring resize-y"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Featured Image (optional)
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-border bg-background/40 px-4 py-3 text-sm font-semibold text-foreground hover:bg-background/60"
            >
              <ImagePlus className="h-4 w-4" />
              Upload Image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {preview ? (
            <div className="relative mt-4 overflow-hidden rounded-[var(--radius-lg)] border border-border">
              <img
                src={preview}
                alt="Preview"
                className="w-full object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground hover:text-foreground"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={createState.isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-lg)] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {createState.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing…
              </>
            ) : (
              "Publish Article"
            )}
          </button>
          <Link
            to="/articles"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
