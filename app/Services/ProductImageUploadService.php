<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\JpegEncoder;
use Intervention\Image\ImageManager;

/**
 * Resizes/compresses uploaded product images and stores full-size + thumbnail
 * versions on the S3-compatible "product_images" disk (MinIO locally, R2/S3 in prod).
 */
class ProductImageUploadService
{
    private const DISK = 'product_images';

    private const MAX_WIDTH = 1200;

    private const THUMBNAIL_WIDTH = 300;

    private const JPEG_QUALITY = 85;

    /**
     * @return array{image_path: string, thumbnail_path: string}
     */
    public function upload(UploadedFile $file): array
    {
        $manager = new ImageManager(new Driver());
        $source = $manager->read($file->getRealPath());

        $filename = (string) Str::uuid();

        $full = (clone $source)->scaleDown(width: self::MAX_WIDTH);
        $thumbnail = (clone $source)->scaleDown(width: self::THUMBNAIL_WIDTH);

        $fullKey = "{$filename}.jpg";
        $thumbnailKey = "{$filename}-thumb.jpg";

        Storage::disk(self::DISK)->put($fullKey, (string) $full->encode(new JpegEncoder(self::JPEG_QUALITY)));
        Storage::disk(self::DISK)->put($thumbnailKey, (string) $thumbnail->encode(new JpegEncoder(self::JPEG_QUALITY)));

        return [
            'image_path' => Storage::disk(self::DISK)->url($fullKey),
            'thumbnail_path' => Storage::disk(self::DISK)->url($thumbnailKey),
        ];
    }

    public function delete(?string $imagePath, ?string $thumbnailPath): void
    {
        $this->deleteByUrl($imagePath);
        $this->deleteByUrl($thumbnailPath);
    }

    private function deleteByUrl(?string $url): void
    {
        if (! $url || ! Str::startsWith($url, ['http://', 'https://'])) {
            // Skip legacy local-storage paths (e.g. "/storage/products/...") — nothing to clean up on this disk.
            return;
        }

        $base = rtrim(Storage::disk(self::DISK)->url(''), '/').'/';

        if (! Str::startsWith($url, $base)) {
            return;
        }

        Storage::disk(self::DISK)->delete(Str::after($url, $base));
    }
}
