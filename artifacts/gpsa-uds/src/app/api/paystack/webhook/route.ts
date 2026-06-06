import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret = process.env.PAYSTACK_WEBHOOK_SECRET ?? "";

  // Verify webhook authenticity
  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    data: {
      reference: string;
      status: string;
      paid_at: string;
      amount: number;
      channel: string;
      customer: { email: string };
      metadata: Record<string, unknown>;
    };
  };

  if (event.event === "charge.success") {
    const supabase = createAdminClient();
    await supabase
      .from("payments")
      .update({
        status:  "success",
        paid_at: event.data.paid_at,
        network: mapChannel(event.data.channel),
        metadata: event.data.metadata,
      })
      .eq("reference", event.data.reference);
    // The activate_membership_on_payment trigger fires automatically in Postgres.
  }

  return NextResponse.json({ received: true });
}

function mapChannel(channel: string): "mtn" | "vodafone" | "airteltigo" | null {
  const map: Record<string, "mtn" | "vodafone" | "airteltigo"> = {
    mtn:       "mtn",
    vodafone:  "vodafone",
    airteltigo:"airteltigo",
  };
  return map[channel.toLowerCase()] ?? null;
}
