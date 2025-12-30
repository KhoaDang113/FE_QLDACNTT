import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface MultipleImageUploadProps {
  onPrimaryImageChange: (file: File | null) => void;
  onGalleryImagesChange: (files: File[]) => void;
  currentPrimaryImage?: string;
  currentGalleryImages?: string[];
}

export function MultipleImageUpload({
  onPrimaryImageChange,
  onGalleryImagesChange,
  currentPrimaryImage,
  currentGalleryImages = [],
}: MultipleImageUploadProps) {
  const [primaryPreview, setPrimaryPreview] = useState<string>(
    currentPrimaryImage || ""
  );
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(
    currentGalleryImages
  );
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const handlePrimaryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPrimaryPreview(result);
      };
      reader.readAsDataURL(file);
      setPrimaryFile(file);
      onPrimaryImageChange(file);
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPreviews: string[] = [];
      let loadedCount = 0;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          loadedCount++;

          if (loadedCount === files.length) {
            setGalleryPreviews((prev) => [...prev, ...newPreviews]);
            const newGalleryFiles = [...galleryFiles, ...files];
            setGalleryFiles(newGalleryFiles);
            onGalleryImagesChange(newGalleryFiles);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index: number) => {
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    const newFiles = galleryFiles.filter((_, i) => i !== index);
    setGalleryPreviews(newPreviews);
    setGalleryFiles(newFiles);
    onGalleryImagesChange(newFiles);
  };

  const removePrimaryImage = () => {
    setPrimaryPreview("");
    setPrimaryFile(null);
    onPrimaryImageChange(null);
  };

  return (
    <div className="space-y-6">
      {/* Ảnh chính */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="primary-image" className="text-base font-semibold">
            Ảnh chính <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Ảnh đại diện chính của sản phẩm
          </p>
          <Input
            id="primary-image"
            type="file"
            accept="image/*"
            onChange={handlePrimaryImageChange}
            className="cursor-pointer"
          />
        </div>

        {primaryPreview ? (
          <div className="relative w-full h-64 border border-border rounded-lg overflow-hidden group">
            <img
              src={primaryPreview}
              alt="Primary Preview"
              className="w-full h-full object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={removePrimaryImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="w-full h-64 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Chưa có ảnh chính
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Ảnh phụ */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="gallery-images" className="text-base font-semibold">
            Ảnh phụ (Gallery)
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Thêm nhiều ảnh để hiển thị chi tiết sản phẩm (có thể chọn nhiều ảnh cùng lúc)
          </p>
          <Input
            id="gallery-images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryImagesChange}
            className="cursor-pointer"
          />
        </div>

        {galleryPreviews.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryPreviews.map((preview, index) => (
              <div
                key={index}
                className="relative aspect-square border border-border rounded-lg overflow-hidden group"
              >
                <img
                  src={preview}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeGalleryImage(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Chưa có ảnh phụ
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

