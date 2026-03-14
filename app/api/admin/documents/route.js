import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Extract URLs from stored JSON
function extractUrls(documentData) {
    const urls = {};

    if (!documentData || typeof documentData !== 'object') {
        return urls;
    }

    // Preferred structure
    if (documentData.front?.url) {
        urls.front = documentData.front.url;
    }

    if (documentData.back?.url) {
        urls.back = documentData.back.url;
    }

    // Fallback for single-image documents
    if (!urls.front && documentData.url) {
        urls.front = documentData.url;
    }

    return urls;
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        // ✅ Correct parameter
        const bookingId = searchParams.get('booking_id');

        if (!bookingId) {
            return NextResponse.json(
                { error: 'booking_id parameter is required' },
                { status: 400 }
            );
        }

        // ✅ Fetch documents for this booking
        const [documents] = await pool.query(
            `
            SELECT *
            FROM user_documents
            WHERE booking_id = ?
            ORDER BY created_at DESC
            `,
            [bookingId]
        );

        if (!documents || documents.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No documents found for this booking' },
                { status: 404 }
            );
        }

        // Process documents
        const processedDocuments = documents.map(doc => {

            let documentData = {};

            try {
                documentData =
                    typeof doc.document_data === 'string'
                        ? JSON.parse(doc.document_data)
                        : doc.document_data;
            } catch {
                documentData = {};
            }

            const urls = extractUrls(documentData);

            return {
                id: doc.id,
                user_id: doc.user_id,
                booking_id: doc.booking_id,
                document_type: doc.document_type,
                status: doc.status,
                document_data: documentData, // ✅ frontend needs this
                urls: urls,
                has_images: Object.keys(urls).length > 0,
                review_message: doc.review_message,
                created_at: doc.created_at,
                updated_at: doc.updated_at
            };
        });

        return NextResponse.json({
            success: true,
            booking_id: bookingId,
            documents_count: processedDocuments.length,
            documents: processedDocuments
        });

    } catch (error) {
        console.error('Error fetching documents:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch documents',
                details: error.message
            },
            { status: 500 }
        );
    }
}