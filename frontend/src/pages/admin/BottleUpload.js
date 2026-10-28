import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Wand2, Loader2, Star, Trash2, Plus, Sparkles, Check } from "lucide-react";
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
 * Supports uploading 10+ images, background removal, setting primary cover bottle,
 * deleting images, and previews via squircle cubes.
 */
export function BottleUpload({ slug, image, images = [], onChange, onDone }) {
  const inputRef = useRef(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Normalize image gallery array
  const rawGallery = Array.isArray(images) && images.length > 0 ? images : (image ? [image] : []);
  const galleryList = Array.from(new Set(rawGallery.filter(Boolean)));
  const primaryImage = image || galleryList[0] || "";

  const handleUploadFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;
    const files = Array.from(filesList);

    // Filter valid image types
    const validFiles = files.filter((f) =>
      ["image/png", "image/jpeg", "image/webp", "image/jpg"].includes(f.type)
    );
    if (validFiles.length === 0) {
      return toast.error("Please select valid image files (PNG, JPEG, WebP)");
    }

    setBusy(true);
    const newUploadedUrls = [];

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        setProgressMsg(`Processing & optimizing ${i + 1}/${validFiles.length}…`);

        // Client-side canvas optimization & background removal
        const optimizedFile = await prepareImage(file, removeBg);

        setProgressMsg(`Uploading ${i + 1}/${validFiles.length}…`);
        const fd = new FormData();
        fd.append("file", optimizedFile);

        const isFirst = galleryList.length === 0 && i === 0;
        const endpoint = slug
          ? `/admin/products/${slug}/image?remove_bg=${removeBg}&set_primary=${isFirst}`
          : `/admin/media/upload?remove_bg=${removeBg}`;

        const { data } = await api.post(endpoint, fd, { timeout: 120000 });
        const uploadedUrl = data.url || data.image;
        if (uploadedUrl) {
          newUploadedUrls.push(uploadedUrl);
        }
      }

      // Merge newly uploaded URLs with existing gallery
      const updatedGallery = Array.from(new Set([...galleryList, ...newUploadedUrls]));
      const newPrimary = primaryImage || updatedGallery[0] || "";

      if (onChange) {
        onChange({
          image: newPrimary,
          images: updatedGallery,
        });
      }

      if (onDone) {
        onDone({ image: newPrimary, images: updatedGallery });
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
    if (onChange) {
      onChange({
        image: imgUrl,
        images: galleryList,
      });
    }
    toast.success("Set as primary bottle photo");
  };

  const handleDeleteImage = (imgUrlToDelete) => {
    const updated = galleryList.filter((u) => u !== imgUrlToDelete);
    const newPrimary = primaryImage === imgUrlToDelete ? (updated[0] || "") : primaryImage;

    if (onChange) {
      onChange({
        image: newPrimary,
        images: updated,
      });
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
              Product Images Gallery ({galleryList.length} Photos)
            </span>
            <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold">
              Up to 20+ Photos
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload bottle cutouts, packaging angles, texture details, or lifestyle shots. Select any photo to set as primary cover.
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
        {galleryList.length === 0 ? (
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
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {galleryList.map((imgUrl, idx) => {
              const isPrimary = primaryImage === imgUrl || (!primaryImage && idx === 0);
              return (
                <div
                  key={imgUrl + idx}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1.5 flex items-center justify-center backdrop-blur-md ${
                    isPrimary
                      ? "border-gold bg-gold/10 shadow-[0_0_16px_rgba(212,175,55,0.35)] ring-1 ring-gold"
                      : "border-border/60 bg-muted/40 hover:border-border hover:bg-muted/70"
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Photo ${idx + 1}`}
                    className="h-full w-full object-contain rounded-xl select-none"
                    draggable={false}
                  />

                  {/* Primary Badge */}
                  {isPrimary && (
                    <span className="absolute top-1 left-1 flex items-center gap-0.5 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-black shadow-sm">
                      <Star className="h-2.5 w-2.5 fill-black" /> Primary
                    </span>
                  )}

                  {/* Squircle Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1.5 p-1">
                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(imgUrl);
                        }}
                        title="Set as Primary Cover"
                        className="p-1 rounded-full bg-gold text-black hover:scale-110 transition-transform shadow"
                      >
                        <Star className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(imgUrl);
                      }}
                      title="Remove image"
                      className="p-1 rounded-full bg-red-600/90 text-white hover:bg-red-600 hover:scale-110 transition-transform shadow"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Quick Add Squircle Cube */}
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-2xl border-2 border-dashed border-border/80 hover:border-gold/60 bg-muted/20 hover:bg-gold/5 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Add</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
