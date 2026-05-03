import { query } from "@/lib/mysql-wrapper";
import { NextResponse } from "next/server";

export async function GET(request) {
    const [gstRate] = await query('SELECT gst FROM apartments')
    return NextResponse.json({
        success: true,
        gst: gstRate.gst
    });
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const { gst } = body;

        // Validate input
        if (gst === undefined || gst === null) {
            return NextResponse.json({
                success: false,
                message: "GST rate is required"
            }, { status: 400 });
        }

        if (isNaN(gst) || gst < 0 || gst > 100) {
            return NextResponse.json({
                success: false,
                message: "GST rate must be between 0 and 100"
            }, { status: 400 });
        }
        await query('UPDATE apartments SET gst=?',[gst])
        const [gstRate] = await query('SELECT gst FROM apartments')

        return NextResponse.json({
            success: true,
            message: "GST rate updated successfully",
            gst: gstRate.gst
        });

    } catch (error) {
        console.error("Error updating GST:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to update GST rate"
        }, { status: 500 });
    }
}

// Alternative: Use POST method
export async function POST(request) {
    try {
        const body = await request.json();
        const { gst } = body;

        if (gst === undefined || gst === null) {
            return NextResponse.json({
                success: false,
                message: "GST rate is required"
            }, { status: 400 });
        }

        if (isNaN(gst) || gst < 0 || gst > 100) {
            return NextResponse.json({
                success: false,
                message: "GST rate must be between 0 and 100"
            }, { status: 400 });
        }

        gstRate = Number(gst);

        return NextResponse.json({
            success: true,
            message: "GST rate updated successfully",
            gst: gstRate
        });

    } catch (error) {
        console.error("Error updating GST:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to update GST rate"
        }, { status: 500 });
    }
}