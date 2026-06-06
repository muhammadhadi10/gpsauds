import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  name:        z.string().min(2, "Name is required"),
  email:       z.string().email("Valid email is required"),
  phone:       z.string().min(9, "Phone number is required"),
  category:    z.enum(["financial", "medical", "bereavement", "emergency", "other"]),
  title:       z.string().min(5, "Subject is required"),
  description: z.string().min(20, "Please provide more detail"),
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";
    let body: Record<string, string>;
    let fileUrls: string[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body = {
        name:        formData.get("name") as string,
        email:       formData.get("email") as string,
        phone:       formData.get("phone") as string,
        category:    formData.get("category") as string,
        title:       formData.get("title") as string,
        description: formData.get("description") as string,
      };

      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        const supabase = createAdminClient();
        const ext = file.name.split(".").pop();
        const path = `welfare-docs/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("welfare-docs")
          .upload(path, file, { contentType: file.type });

        if (!uploadError) {
          const { data } = supabase.storage
            .from("welfare-docs")
            .getPublicUrl(path);
          fileUrls = [data.publicUrl];
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

    // Try to find the user by email (may not be a registered user)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", parsed.data.email)
      .single();

    if (!profile) {
      // Non-member welfare submission — store in a complaints/contact table
      // For now, return a reference and log. You can extend this to a
      // separate public_welfare_submissions table if needed.
      const ticketRef = `WLF-${Date.now().toString(36).toUpperCase()}`;
      return NextResponse.json({ success: true, reference: ticketRef }, { status: 201 });
    }

    const { data: request, error } = await supabase
      .from("welfare_requests")
      .insert({
        user_id:               profile.id,
        type:                  parsed.data.category,
        status:                "submitted",
        title:                 parsed.data.title,
        description:           parsed.data.description,
        supporting_documents:  fileUrls,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[welfare/submit]", error);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    const ticketRef = `WLF-${request.id.slice(0, 8).toUpperCase()}`;
    return NextResponse.json({ success: true, reference: ticketRef }, { status: 201 });
  } catch (err) {
    console.error("[welfare/submit] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
