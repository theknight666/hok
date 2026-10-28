import { useRef, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, Loader2, Star, Plus, Sparkles, X } from "lucide-react";
import { api, formatErr } from "@/lib/api";
import { getCachedCatalog, setCachedCatalog } from "@/hooks/useProducts";
import { isValidImageUrl, defaultCutoutOf } from "@/lib/visual";

/**
 * Fast client-side image compression.
 * Scales max dimension to 1600px to ensure quick uploads and avoid Vercel 4.5MB payload limit.
 */
export async function prepareImage(file, maxDim = 1600, quality = 0.90) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(file);

          ctx.drawImage(img, 0, 0, width, height);

          const isPng = file.type === "image/png";
          const mime = isPng ? "image/png" : "image/jpeg";
          const ext = isPng ? ".png" : ".jpg";

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, ext), { type: mime });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, mime, quality);
        } catch (e) {
          console.warn("Canvas compression failed, sending original:", e);
          resolve(file);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Luxury Multi-Image Manager for Product Admin.
 * Displays all uploaded images as squircle cubes with explicit "X" remove buttons,
 * primary cover selector, and high-speed upload handling.
 */
export function BottleUpload({ slug, image, images = [], onChange, onDone }) {
  const qc = useQueryClient();
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Maintain local state so uploaded images display instantly and only valid image paths are kept
  const [gallery, setGallery] = useState(() => {
    const raw = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
    const valid = Array.from(new Set(raw.filter(isValidImageUrl)));
    return valid.length > 0 ? valid : (slug ? [defaultCutoutOf(slug)] : []);
  });
  const [primaryUrl, setPrimaryUrl] = useState(() => (isValidImageUrl(image) ? image : (gallery[0] || "")));

  const imagesKey = Array.isArray(images) ? images.join(",") : "";
  // Synchronize when parent props change
  useEffect(() => {
    const raw = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
    const valid = Array.from(new Set(raw.filter(isValidImageUrl)));
    const finalGallery = valid.length > 0 ? valid : (slug ? [defaultCutoutOf(slug)] : []);
    setGallery(finalGallery);
    setPrimaryUrl(isValidImageUrl(image) ? image : (finalGallery[0] || ""));
  }, [image, images, imagesKey, slug]);

  const handleUploadFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const files = Array.from(filesList);

    const validFiles = files.filter((f) =>
      ["image/png", "image/jpeg", "image/webp", "image/jpg"].includes(f.type)
    );
    if (validFiles.length === 0) {
      return toast.error("Please select valid image files (PNG, JPEG, WebP)");
    }

    setBusy(true);
    let currentGallery = [...gallery];
    let activePrimary = primaryUrl || currentGallery[0] || "";

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setProgressMsg(`Processing ${i + 1}/${validFiles.length}…`);

        const optimizedFile = await prepareImage(file);

        setProgressMsg(`Uploading ${i + 1}/${validFiles.length}…`);
        const fd = new FormData();
        fd.append("file", optimizedFile);

        const isFirst = currentGallery.length === 0 && i === 0;
        const endpoint = slug
          ? `/admin/products/${slug}/image?set_primary=${isFirst}`
          : `/admin/media/upload`;

        const { data } = await api.post(endpoint, fd, { timeout: 120000 });

        // Extract uploaded URL from response
        const newUrl =
          data.url ||
          data.uploaded_url ||
          (Array.isArray(data.images) && data.images[data.images.length - 1]) ||
          data.image;

        if (newUrl && !currentGallery.includes(newUrl)) {
          currentGallery = [...currentGallery, newUrl];
          if (!activePrimary) activePrimary = newUrl;
        }

        // If backend returned updated images array, merge it
        if (Array.isArray(data.images) && data.images.length > 0) {
          currentGallery = Array.from(new Set([...currentGallery, ...data.images]));
        }

        // Update local state right away
        setGallery(currentGallery);
        setPrimaryUrl(activePrimary);
      }

      // Final unique gallery list
      const finalGallery = Array.from(new Set(currentGallery.filter(Boolean)));
      setGallery(finalGallery);
      setPrimaryUrl(activePrimary);

      if (onChange) {
        onChange({
          image: activePrimary,
          images: finalGallery,
        });
      }

      if (onDone) {
        onDone({
          image: activePrimary,
          images: finalGallery,
        });
      }

      if (slug) {
        qc.invalidateQueries({ queryKey: ["products"] });
        qc.invalidateQueries({ queryKey: ["product", slug] });
        qc.invalidateQueries({ queryKey: ["admin-products"] });
        try {
          const catalog = [...getCachedCatalog()];
          const idx = catalog.findIndex((p) => p.slug === slug);
          if (idx >= 0) {
            catalog[idx] = { ...catalog[idx], image: activePrimary, images: finalGallery };
            setCachedCatalog(catalog);
          }
        } catch (e) {}
      }

      toast.success(
        validFiles.length === 1
          ? "Photo added to gallery"
          : `${validFiles.length} photos added to gallery`
      );
    } catch (err) {
      toast.error(formatErr(err));
    } finally {
      setBusy(false);
      setProgressMsg("");
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleSetPrimary = (imgUrl) => {
    setPrimaryUrl(imgUrl);
    if (onChange) {
      onChange({
        image: imgUrl,
        images: gallery,
      });
    }
    if (slug) {
      api.patch(`/admin/products/${slug}`, { image: imgUrl }).then(() => {
        qc.invalidateQueries({ queryKey: ["products"] });
        qc.invalidateQueries({ queryKey: ["product", slug] });
        qc.invalidateQueries({ queryKey: ["admin-products"] });
        try {
          const catalog = [...getCachedCatalog()];
          const idx = catalog.findIndex((p) => p.slug === slug);
          if (idx >= 0) {
            catalog[idx] = { ...catalog[idx], image: imgUrl };
            setCachedCatalog(catalog);
          }
        } catch (e) {}
      }).catch((err) => {
        console.warn("Could not patch product cover:", err);
      });
    }
    toast.success("Set as primary cover photo");
  };

  const handleDeleteImage = async (imgUrlToDelete) => {
    const updated = gallery.filter((u) => u !== imgUrlToDelete && isValidImageUrl(u));
    const fallbackImage = slug ? defaultCutoutOf(slug) : "";
    const finalUpdated = updated.length > 0 ? updated : (fallbackImage ? [fallbackImage] : []);
    const newPrimary = primaryUrl === imgUrlToDelete ? (finalUpdated[0] || fallbackImage) : primaryUrl;

    setGallery(finalUpdated);
    setPrimaryUrl(newPrimary);

    if (onChange) {
      onChange({
        image: newPrimary,
        images: finalUpdated,
      });
    }

    if (slug) {
      try {
        await api.patch(`/admin/products/${slug}`, {
          images: updated,
          image: newPrimary,
        });
        qc.invalidateQueries({ queryKey: ["products"] });
        qc.invalidateQueries({ queryKey: ["product", slug] });
        qc.invalidateQueries({ queryKey: ["admin-products"] });
        try {
          const catalog = [...getCachedCatalog()];
          const idx = catalog.findIndex((p) => p.slug === slug);
          if (idx >= 0) {
            catalog[idx] = { ...catalog[idx], image: newPrimary, images: updated };
            setCachedCatalog(catalog);
          }
        } catch (e) {}
      } catch (err) {
        console.warn("Could not patch product after image deletion:", err);
      }
    }

    toast.info("Photo removed from gallery");
  };

  return (
    <div
      className={`rounded-2xl border transition-all p-4 sm:col-span-2 ${
        isDragOver ? "border-gold bg-gold/5" : "border-border/80 bg-card/60"
      }`}
      data-testid="bottle-upload"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) {
          handleUploadFiles(e.dataTransfer.files);
        }
      }}
    >
      {/* Header with Title and Upload Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
              Product Images Gallery ({gallery.length} Photos)
            </span>
            <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold">
              Up to 20+ Photos
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload bottle photos, packaging angles, texture details, or lifestyle shots. Click any photo or &ldquo;Make Cover&rdquo; to set as primary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={(e) => handleUploadFiles(e.target.files)}
            data-testid="bottle-upload-input"
          />

          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="btn-royal !py-2 !px-4 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-sm"
            data-testid="bottle-upload-btn"
          >
            {busy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {progressMsg || "Processing…"}
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" /> Upload Photos
              </>
            )}
          </button>
        </div>
      </div>

      {/* Gallery Squircle Cubes Grid */}
      <div className="mt-4">
        {gallery.length === 0 ? (
          <div
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/70 p-6 text-center cursor-pointer hover:border-gold/60 transition-colors"
          >
            <Upload className="h-8 w-8 text-muted-foreground/60 mb-2" />
            <p className="text-sm font-semibold text-foreground">No photos uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click here or drag & drop bottle photos to upload (supports multi-select 10+ images)
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3.5 pt-1">
            {gallery.map((imgUrl, idx) => {
              const isPrimary = primaryUrl === imgUrl || (!primaryUrl && idx === 0);
              return (
                <div
                  key={imgUrl + idx}
                  onClick={() => !isPrimary && handleSetPrimary(imgUrl)}
                  className={`group relative aspect-square rounded-2xl border-2 transition-all p-2 flex items-center justify-center backdrop-blur-md cursor-pointer ${
                    isPrimary
                      ? "border-gold bg-gold/15 shadow-[0_0_18px_rgba(212,175,55,0.4)] ring-2 ring-gold/40 scale-102"
                      : "border-border/80 bg-muted/30 hover:border-border hover:bg-muted/60 hover:scale-102"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Photo ${idx + 1}`}
                    className="h-full w-full object-contain rounded-xl select-none"
                    draggable={false}
                    onError={(e) => {
                      const fallback = defaultCutoutOf(slug);
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />

                  {/* Primary Badge */}
                  {isPrimary ? (
                    <span className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold text-black shadow-md tracking-wider">
                      <Star className="h-2.5 w-2.5 fill-black" /> Primary
                    </span>
                  ) : (
                    /* Make Primary Cover button on hover */
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(imgUrl);
                      }}
                      title="Set as Primary Cover"
                      className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 rounded-full bg-black/85 px-2 py-0.5 text-[9px] font-bold text-gold border border-gold/40 shadow cursor-pointer whitespace-nowrap hover:bg-gold hover:text-black"
                    >
                      <Star className="h-2.5 w-2.5" /> Make Cover
                    </button>
                  )}

                  {/* Explicit X Mark to Remove Image */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(imgUrl);
                    }}
                    title="Remove photo"
                    aria-label={`Remove photo ${idx + 1}`}
                    className="absolute -top-2 -right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 hover:scale-115 active:scale-95 transition-all cursor-pointer border-2 border-background"
                  >
                    <X className="h-3.5 w-3.5 stroke-[3]" />
                  </button>
                </div>
              );
            })}

            {/* Quick Add Squircle Cube */}
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-border/80 hover:border-gold/70 bg-muted/20 hover:bg-gold/10 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-all cursor-pointer p-2"
              title="Add more photos"
            >
              <Plus className="h-5 w-5 text-gold" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Add</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
