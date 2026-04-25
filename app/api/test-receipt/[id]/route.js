export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import connection from "@/lib/db";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { cookies } from "next/headers";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { getReceiptTemplet } from "@/lib/receipt/templet";

export async function GET(req, { params }) {
  const { id } = await params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tokenResult = verifyToken(token);
    if (!tokenResult.valid)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = tokenResult.decoded.id;

    const [user] = await connection.query(
      `SELECT id FROM users WHERE id = ?`,
      [userId]
    );

    if (user.length === 0)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const [rows] = await connection.query(
      `
      SELECT 
        b.id AS bookingId,
        b.start_date AS checkIn,
        b.end_date AS checkOut,
        b.nights,
        b.guests,
        b.status AS bookingStatus,
        b.user_id,
        b.guest_details,
        b.total_amount,
        b.created_at AS bookingCreatedAt,
        a.id AS apartmentId,
        a.title AS apartment,
        a.price_per_night,
        p.id AS paymentId,
        p.amount AS total,
        p.status AS paymentStatus,
        p.method AS paymentMethod,
        p.paid_at AS paymentDate,
        p.razorpay_payment_id AS transactionId,
        p.razorpay_payment_id AS gatewayPaymentId,
        p.refund_id,
        p.refund_time,
        u.name AS userName,
        u.email AS userEmail,
        u.phone_number AS userPhone
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE p.id = ?
      `,
      [id]
    );

    if (rows.length === 0)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const data = rows[0];
    if (data.user_id !== userId)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    if (!data.paymentStatus)
      return NextResponse.json({ error: "Payment not completed" }, { status: 403 });

    // Parse guest_details if it exists
    let guestInfo = null;
    if (data.guest_details) {
      try {
        guestInfo = typeof data.guest_details === 'string'
          ? JSON.parse(data.guest_details)
          : data.guest_details;
      } catch (e) {
        console.error("Error parsing guest_details:", e);
      }
    }

    // Calculate receipt number (you can customize this logic)
    const receiptNumber = `RCT-${data.paymentId}-${new Date().getFullYear()}`;

    // Calculate price breakdown
    const baseAmount = data.price_per_night * data.nights;
    const cleaningFee = 500; // Flat cleaning fee (example)
    const serviceFee = baseAmount * 0.03; // 3% service fee (example)
    const discount = 0; // Calculate based on your logic
    const tax = (baseAmount + cleaningFee + serviceFee - discount) * 0.18; // 18% GST
    const total = baseAmount + cleaningFee + serviceFee - discount + tax;
    const amountPaid = data.total;
    const balanceDue = total - amountPaid;

    // Prepare company information
    const companyInfo = {
      companyName: "Rooms4U",
      companyAddress: "123 Business Park, MG Road, Bangalore, Karnataka 560001",
      gstNumber: "29ABCDE1234F1Z5",
      supportEmail: "finance@rooms4u.com",
      supportPhone: "+91 98765 43210"
    };

    // Generate gateway order ID (you may need to fetch this from your payments table)
    const gatewayOrderId = `order_${data.paymentId}_${Date.now()}`;

    // Prepare the final data object with all receipt fields
    const receiptData = {
      // Receipt identification
      receiptNumber: receiptNumber,
      bookingId: data.bookingId,

      // Company information
      ...companyInfo,

      // Guest information
      customerName: guestInfo?.name || data.userName,
      customerEmail: guestInfo?.email || data.userEmail,
      customerPhone: guestInfo?.phone || data.userPhone,
      guestNotes: guestInfo?.notes || null,
      guestIdType: guestInfo?.idType || null,
      guestIdNumber: guestInfo?.idNumber || null,

      // Stay details
      apartment: data.apartment,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      nights: data.nights,
      guests: data.guests,
      bookingCreatedAt: data.bookingCreatedAt,
      price_per_night: data.price_per_night,

      // Pricing breakdown
      baseAmount: baseAmount,
      cleaningFee: cleaningFee,
      serviceFee: serviceFee,
      discount: discount,
      tax: tax,
      total: total,
      amountPaid: amountPaid,
      balanceDue: balanceDue,

      // Payment status
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod || "Razorpay",

      // Gateway details
      gateway: "Razorpay",
      gatewayPaymentId: data.gatewayPaymentId || data.transactionId,
      gatewayOrderId: gatewayOrderId,
      transactionId: data.transactionId,

      // Dates
      paymentDate: data.paymentDate,

      // Booking status
      bookingStatus: data.bookingStatus
    };

    // ⚙️ Puppeteer launch configuration
    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      executablePath: await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"),
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // 🧾 Inject receipt HTML
    await page.setContent(getReceiptTemplet(receiptData), { waitUntil: "domcontentloaded" });

    // 📄 Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "5mm", bottom: "5mm", left: "5mm", right: "5mm" },
    });

    await browser.close();

    const uint8 = new Uint8Array(pdfBuffer);

    return new Response(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": uint8.length.toString(),
        "Content-Disposition": `inline; filename=receipt-${receiptNumber}.pdf`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Receipt generation error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}