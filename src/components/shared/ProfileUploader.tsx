"use client";

import { useCallback, useState, useRef } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button } from "@/components/ui/button";

type ProfileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string | null;
};

// Helper function to center the crop with 1:1 aspect ratio
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ProfileUploader = ({ fieldChange, mediaUrl }: ProfileUploaderProps) => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>(mediaUrl || "");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const originalFileRef = useRef<File | null>(null);

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    console.log("Profile onDrop called with acceptedFiles:", acceptedFiles);
    setErrorMessage("");

    if (acceptedFiles && acceptedFiles.length > 0) {
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB for source (will be compressed after crop)
      const file = acceptedFiles[0];

      if (file.size > MAX_SIZE) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setErrorMessage(`File size is ${fileSizeMB}MB. Maximum allowed size is 5MB.`);
        return;
      }

      // Store original file reference
      originalFileRef.current = file;

      // Create preview and show cropper
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || "");
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  }, []);

  const onDropRejected = useCallback((rejectedFiles: any[]) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      rejectedFiles.forEach((file) => {
        if (file.errors) {
          file.errors.forEach((error: any) => {
            if (error.code === "file-too-large") {
              setErrorMessage("File size exceeds 5MB limit. Please choose a smaller file.");
            } else if (error.code === "file-invalid-type") {
              setErrorMessage("Invalid file type. Please upload PNG or JPG image.");
            } else {
              setErrorMessage("File upload error. Please try again.");
            }
          });
        }
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  async function getCroppedImg(): Promise<File | null> {
    const image = imgRef.current;
    if (!image || !completedCrop) return null;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Set output size (300x300 for profile pictures)
    const outputSize = 300;
    canvas.width = outputSize;
    canvas.height = outputSize;

    // Calculate scale between natural and displayed size
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Draw cropped image
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize
    );

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const file = new File([blob], "profile-cropped.jpg", {
            type: "image/jpeg",
          });
          resolve(file);
        },
        "image/jpeg",
        0.9
      );
    });
  }

  const handleCropComplete = async () => {
    const croppedFile = await getCroppedImg();
    if (croppedFile) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(croppedFile);
      setCroppedImageUrl(previewUrl);
      
      // Pass to parent form
      fieldChange([croppedFile]);
      
      // Close cropper
      setShowCropper(false);
      setImageSrc("");
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setImageSrc("");
    originalFileRef.current = null;
  };

  // Cropper Modal
  if (showCropper && imageSrc) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <div className="bg-dark-2 rounded-xl p-4 md:p-6 max-w-lg w-full max-h-[90vh] overflow-auto">
          <h3 className="text-light-1 text-lg font-semibold mb-4 text-center">
            Crop Your Photo
          </h3>
          <p className="text-light-3 text-sm mb-4 text-center">
            Drag to reposition. The image will be cropped to a circle.
          </p>
          
          <div className="flex justify-center mb-4">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
              className="max-h-[50vh]"
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imageSrc}
                onLoad={onImageLoad}
                className="max-h-[50vh] max-w-full"
              />
            </ReactCrop>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              type="button"
              onClick={handleCancelCrop}
              variant="ghost"
              className="text-light-3 hover:text-light-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCropComplete}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <div {...getRootProps()}>
        <input {...getInputProps()} className="cursor-pointer" />

        <div className={`cursor-pointer flex-center gap-4 ${isDragActive ? "opacity-70" : ""}`}>
          <div className="relative">
            <img
              src={croppedImageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover"
              style={{ objectPosition: "center" }}
            />
            <div className="absolute bottom-0 right-0 bg-primary-500 rounded-full p-1.5">
              <img
                src="/assets/icons/edit.svg"
                alt="Edit"
                className="w-4 h-4 invert"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <p className="text-light-1 small-regular md:base-semibold">
              {isDragActive ? "Drop image here" : "Change profile photo"}
            </p>
            <p className="text-light-3 text-xs mt-1">
              JPG or PNG, max 5MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUploader;
