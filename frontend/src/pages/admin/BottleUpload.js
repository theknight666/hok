import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Wand2, Loader2 } from "lucide-react";
import { api, formatErr } from "@/lib/api";

/** Admin bottle photo upload. Sends the file to the backend which cuts the bottle out and stores it. */
export function BottleUpload({ slug, image, onDone }) {
  const inputRef = useRef(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);

  const upload = async (file) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return toast.error("Use a PNG, JPEG or WebP image");
    if (file.size > 10 * 1024 * 1024) return toast.error("Image must be under 10 MB");
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const endpoint = slug
        ? `/admin/products/${slug}/image?remove_bg=${removeBg}`
        : `/admin/media/upload?remove_bg=${removeBg}`;
      const { data } = await api.post(endpoint, fd, { timeout: 180000 });
      toast.success(removeBg ? "Bottle cut out and saved" : "Photo saved");
      onDone(data);
    } catch (e) {
      toast.error(formatErr(e));
    } finally {
      setBusy(false);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border p-4 sm:col-span-2" data-testid="bottle-upload">
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid h-24 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-muted">
          {preview || image ? <img src={preview || image} alt="" className="h-full w-full object-contain" data-testid="bottle-upload-preview" /> : <span className="text-xs text-muted-foreground">No photo</span>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.3em] text-muted-foreground">Bottle photo</p>
          <p className="mt-1 text-sm text-muted-foreground">Upload any photo of the bottle. We will cut it out so it floats on the site like the others.</p>
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--gold))]" data-testid="bottle-upload-removebg" />
            <Wand2 className="h-4 w-4 text-gold" /> Auto-remove background
          </label>
        </div>
        <div>
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => upload(e.target.files?.[0])} data-testid="bottle-upload-input" />
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="btn-royal !px-5 !py-3 disabled:opacity-60" data-testid="bottle-upload-btn">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Cutting out…</> : <><Upload className="h-4 w-4" /> Upload photo</>}
          </button>
        </div>
      </div>
    </div>
  );
}
