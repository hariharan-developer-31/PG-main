"use client";

import React, { useState } from "react";
import Link from "next/link";
import { services } from "@/services";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Layers, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await services.auth.resetPassword(email);
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 selection:bg-blue-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#0F172A]">
              STACK
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-[#0F172A]">
            Reset your password
          </h1>
          <p className="text-xs text-[#64748B]">
            We will send a password reset link to your registered email address.
          </p>
        </div>

        <Card className="border-[#E2E8F0] shadow-sm">
          <CardContent className="p-6">
            {isSubmitted ? (
              <div className="py-6 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#16A34A] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Password Reset Link Sent
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Check your inbox at <span className="font-semibold text-slate-800">{email}</span> for instructions to reset your password.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="w-full">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Registered Email"
                  type="email"
                  placeholder="hari@primeliving.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Button type="submit" isLoading={isLoading} className="w-full">
                  Send Recovery Link
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#64748B]">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
