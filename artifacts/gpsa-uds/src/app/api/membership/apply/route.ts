import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  full_name:     z.string().min(2, "Full name is required"),
  email:         z.string().email("Valid email is required"),
  student_id:    z.string().min(3, "Student index number is required"),
  level:         z.enum(["100_level", "200_level", "300_level", "400_level", "500_level", "alumnus"]),
  phone:         z.string().min(9, "Phone number is required"),
  payment_method: z.enum(["momo", "receipt"]),
  // For MoMo: Paystack reference is verified server-side via webhook
  paystack_reference: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let body: Record<string, string>;
    let receiptUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body = {
        full_name:          formData.get("full_name") as string,
        email:              formData.get("email") as string,
        student_id:         formData.get("student_id") as string,
        level:              formData.get("level") as string,
        phone:              formData.get("phone") as string,
        payment_method:     formData.get("payment_method") as string,
        paystack_reference: (formData.get("paystack_reference") as string) ?? "",
      };

      const receipt = formData.get("receipt") as File | null;
      if (receipt && receipt.size > 0) {
        const supabase = createAdminClient();
        const ext = receipt.name.split(".").pop();
        const path = `receipts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("welfare-docs")
          .upload(path, receipt, { contentType: receipt.type });
        if (!uploadError) {
          const { data } = supabase.storage.from("welfare-docs").getPublicUrl(path);
          receiptUrl = data.publicUrl;
        }
      }
    } else {
      body = await req.json();
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Look up or create auth user
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", parsed.data.email)
      .single();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Update profile with latest info
      await supabase
        .from("profiles")
        .update({
          full_name:  parsed.data.full_name,
          student_id: parsed.data.student_id,
          phone:      parsed.data.phone,
          level:      parsed.data.level,
        })
        .eq("id", userId);
    } else {
      // Create auth user (they'll receive a magic link / set-password email)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email:            parsed.data.email,
        email_confirm:    false,
        user_metadata: {
          full_name: parsed.data.full_name,
        },
      });

      if (createError || !newUser.user) {
        return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
      }

      userId = newUser.user.id;

      await supabase
        .from("profiles")
        .update({
          full_name:  parsed.data.full_name,
          student_id: parsed.data.student_id,
          phone:      parsed.data.phone,
          level:      parsed.data.level,
        })
        .eq("id", userId);
    }

    // 2. Determine current academic year
    const now = new Date();
    const year = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
    const academicYear = `${year}/${year + 1}`;

    // 3. Get membership fee from site_settings
    const feeKey = `membership_fee_${parsed.data.level}`;
    const { data: feeSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", feeKey)
      .single();
    const feeGhs = feeSetting ? Number(feeSetting.value) : 30;
    const amountPesewas = feeGhs * 100;

    // 4. Create payment record
    let paymentId: string | null = null;
    const ref = parsed.data.paystack_reference || `MANUAL-${Date.now()}`;

    const { data: payment } = await supabase
      .from("payments")
      .insert({
        user_id:   userId,
        reference: ref,
        amount:    amountPesewas,
        currency:  "GHS",
        status:    parsed.data.payment_method === "momo" ? "pending" : "pending",
        provider:  "paystack",
        metadata:  receiptUrl ? { receipt_url: receiptUrl } : null,
      })
      .select("id")
      .single();

    paymentId = payment?.id ?? null;

    // 5. Create or update membership record
    const { error: membershipError } = await supabase
      .from("memberships")
      .upsert(
        {
          user_id:       userId,
          status:        "pending",
          tier:          parsed.data.level,
          academic_year: academicYear,
          payment_id:    paymentId,
        },
        { onConflict: "user_id,academic_year" }
      );

    if (membershipError) {
      console.error("[membership/apply]", membershipError);
      return NextResponse.json({ error: "Failed to create membership record" }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message:
          parsed.data.payment_method === "receipt"
            ? "Application received. Your receipt will be reviewed by our treasurer within 24–48 hours."
            : "Application submitted. Complete your Paystack payment to activate membership.",
        payment_reference: ref,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[membership/apply] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
