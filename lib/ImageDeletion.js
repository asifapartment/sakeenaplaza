import db from "@/lib/db";

export async function queueImageDeletion(images, sourceType, sourceId, reason) {

    if (!images.length) return;

    const values = images.map(img => [
        img.url,
        img.public_id,
        sourceType,
        sourceId,
        reason
    ]);

    await db.query(
        `
        INSERT INTO pending_image_deletions
        (image_url, cloudinary_public_id, source_type, source_id, reason)
        VALUES ?
        `,
        [values]
    );
}