/**
 * A zero-byte file means the OS camera/gallery picker returned a File handle
 * without actually writing image data — the common signature of a capture
 * that failed because the device ran out of storage. Uploading it wastes a
 * retry cycle and shows a misleading "success" once it round-trips.
 */
export function isReadablePhotoFile(file: File): boolean {
  return file.size > 0;
}
