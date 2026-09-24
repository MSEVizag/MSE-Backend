import { auth } from "@/lib/auth/server";
import { NextResponse } from "next/server";

export async function POST() {
    const { error } = await auth.signUp.email({
        email: process.env.ADMIN_EMAIL!,
        password: process.env.ADMIN_PASSWORD!,
        name: process.env.ADMIN_NAME ?? 'Administrator'
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
}