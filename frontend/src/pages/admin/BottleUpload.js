import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Wand2, Loader2, Star, Plus, Sparkles, X } from "lucide-react";
import { api, formatErr } from "@/lib/api";

/**
 * High-performance client-side image compression and intelligent background removal.
 * Prevents Vercel 4.5MB HTTP 413 Payload Too Large by scaling max dimension to 1600px.
 * Performs fast canvas-based background isolation when removeBg is true.
 */
export async function prepareImage(file, removeBg = false, maxDim = 1600, quality = 0.90) {
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
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return resolve(file);

          ctx.drawImage(img, 0, 0, width, height);

          if (removeBg) {
            try {
              const imgData = ctx.getImageData(0, 0, width, height);
              const data = imgData.data;

              // Sample outer corners and edges to get background color
              const sampleIndices = [
                0,
                (width - 1) * 4,
                ((height - 1) * width) * 4,
                ((height - 1) * width + width - 1) * 4,
                Math.floor(width / 2) * 4,
                ((Math.floor(height / 2) * width)) * 4,
                ((Math.floor(height / 2) * width) + width - 1) * 4,
              ];

              let rSum = 0, gSum = 0, bSum = 0;
              sampleIndices.forEach((idx) => {
                rSum += data[idx];
                gSum += data[idx + 1];
                bSum += data[idx + 2];
              });
              const count = sampleIndices.length;
              const bgR = rSum / count;
              const bgG = gSum / count;
              const bgB = bSum / count;

              const isLightBg = (bgR + bgG + bgB) / 3 > 200;
              const tolSq = isLightBg ? 55 * 55 : 45 * 45;

              // BFS Flood Fill from edges so interior glass / highlights are preserved
              const totalPixels = width * height;
              const isBg = new Uint8Array(totalPixels);
              const visited = new Uint8Array(totalPixels);
              const queue = [];

              const isBgPixel = (x, y) => {
                const idx = (y * width + x) * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                if (isLightBg && r > 228 && g > 228 && b > 228) return true;
                const distSq = (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2;
                return distSq < tolSq;
              };

              // Seed edge pixels
              for (let x = 0; x < width; x++) {
                queue.push(x, 0);
                queue.push(x, height - 1);
                visited[x] = 1;
                visited[(height - 1) * width + x] = 1;
              }
              for (let y = 0; y < height; y++) {
                queue.push(0, y);
                queue.push(width - 1, y);
                visited[y * width] = 1;
                visited[y * width + (width - 1)] = 1;
              }

              let head = 0;
              while (head < queue.length) {
                const cx = queue[head++];
                const cy = queue[head++];
                const cPos = cy * width + cx;
                if (isBgPixel(cx, cy)) {
                  isBg[cPos] = 1;
                  const neighbors = [
                    [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
                  ];
                  for (let i = 0; i < 4; i++) {
                    const nx = neighbors[i][0];
                    const ny = neighbors[i][1];
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                      const nPos = ny * width + nx;
                      if (!visited[nPos]) {
                        visited[nPos] = 1;
                        queue.push(nx, ny);
                      }
                    }
                  }
                }
              }

              // Apply alpha transparency and compute bounding box
              let minX = width, minY = height, maxX = 0, maxY = 0;
              for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                  const pos = y * width + x;
                  const idx = pos * 4;
                  if (isBg[pos]) {
                    data[idx + 3] = 0;
                  } else {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                  }
                }
              }

              ctx.putImageData(imgData, 0, 0);

              // Auto-crop to bounding box if valid
              if (minX < maxX && minY < maxY && (maxX - minX) > 60 && (maxY - minY) > 60) {
                const cropW = maxX - minX + 1;
                const cropH = maxY - minY + 1;
                const cropCanvas = document.createElement("canvas");
                cropCanvas.width = cropW;
                cropCanvas.height = cropH;
                const cropCtx = cropCanvas.getContext("2d");
                cropCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

                cropCanvas.toBlob((blob) => {
                  if (blob) {
                    const newFile = new File([blob], file.name.replace(/\.[^.]+$/, ".png"), { type: "image/png" });
                    return resolve(newFile);
                  }
                  resolve(file);
                }, "image/png");
                return;
              }
            } catch (err) {
              console.warn("Client background isolation fallback:", err);
            }
          }

          // Export compressed PNG or JPEG
          const mime = removeBg || file.type === "image/png" ? "image/png" : "image/jpeg";
          const ext = mime === "image/png" ? ".png" : ".jpg";
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
  const inputRef = useRef(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Maintain local state so uploaded images display instantly
  const [gallery, setGallery] = useState(() => {
    const raw = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
    return Array.from(new Set(raw.filter(Boolean)));
  });
  const [primaryUrl, setPrimaryUrl] = useState(() => image || gallery[0] || "");

  const imagesKey = Array.isArray(images) ? images.join(",") : "";
  // Synchronize when parent props change
  useEffect(() => {
    const raw = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
    const unique = Array.from(new Set(raw.filter(Boolean)));
    setGallery(unique);
    setPrimaryUrl(image || unique[0] || "");
  }, [image, images, imagesKey]);

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
        setProgressMsg(`Processing & optimizing ${i + 1}/${validFiles.length}…`);

        const optimizedFile = await prepareImage(file, removeBg);

        setProgressMsg(`Uploading ${i + 1}/${validFiles.length}…`);
        const fd = new FormData();
        fd.append("file", optimizedFile);

        const isFirst = currentGallery.length === 0 && i === 0;
        const endpoint = slug
          ? `/admin/products/${slug}/image?remove_bg=${removeBg}&set_primary=${isFirst}`
          : `/admin/media/upload?remove_bg=${removeBg}`;

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

        // If backend returned the full updated images array, merge it
        if (Array.isArray(data.images) && data.images.length > 0) {
          currentGallery = Array.from(new Set([...currentGallery, ...data.images]));
        }

        // Update local state right away after each image uploads so user sees progress
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

      toast.success(
        validFiles.length === 1
          ? (removeBg ? "Bottle isolated and added to gallery" : "Photo added to gallery")
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
      api.patch(`/admin/products/${slug}`, { image: imgUrl }).catch(() => {});
    }
    toast.success("Set as primary cover photo");
  };

  const handleDeleteImage = async (imgUrlToDelete) => {
    const updated = gallery.filter((u) => u !== imgUrlToDelete);
    const newPrimary = primaryUrl === imgUrlToDelete ? (updated[0] || "") : primaryUrl;

    setGallery(updated);
    setPrimaryUrl(newPrimary);

    if (onChange) {
      onChange({
        image: newPrimary,
        images: updated,
      });
    }

    if (slug) {
      try {
        await api.patch(`/admin/products/${slug}`, {
          images: updated,
          image: newPrimary,
        });
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
            Upload bottle cutouts, packaging angles, texture details, or lifestyle shots. Click any photo or &ldquo;Make Cover&rdquo; to set as primary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-foreground select-none">
            <input
              type="checkbox"
              checked={removeBg}
              onChange={(e) => setRemoveBg(e.target.checked)}
              className="h-3.5 w-3.5 accent-[hsl(var(--gold))]"
              data-testid="bottle-upload-removebg"
            />
            <Wand2 className="h-3.5 w-3.5 text-gold" /> Auto-isolate background
          </label>

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
