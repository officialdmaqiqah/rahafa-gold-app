"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { loginAction } from "./actions";
import { useActionState, Suspense } from "react";
import { Loader2, LockKeyhole, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FloatingParticles } from "@/components/ui/floating-particles";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error') === 'session_invalid' 
    ? "Sesi login tidak valid atau gagal dibuat. Pastikan cookie diizinkan." 
    : null;

  return (
    <form action={formAction}>
      <Card className="border-0 shadow-2xl bg-white/95 dark:bg-[#111827]/90 backdrop-blur-xl relative overflow-hidden ring-1 ring-blue-900/10 dark:ring-blue-900/50">
        {/* Solid primary accent line at the top */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>
        
        <CardHeader className="pt-10 pb-6 text-center">
          <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center border border-primary/20 dark:border-primary/30 shadow-inner">
            <LockKeyhole className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            RAHAFA GOLD
          </CardTitle>
          <CardDescription className="text-blue-950/70 dark:text-blue-200/70 tracking-[0.25em] text-xs font-bold mt-2">
            MANAGEMENT SYSTEM
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8">
          {urlError && (
            <div className="p-3.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-2.5">
              <span className="w-1.5 h-full min-h-[20px] rounded-full bg-red-500 shrink-0 block"></span>
              <p>{urlError}</p>
            </div>
          )}
          {state?.error && (
            <div className="p-3.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-start gap-2.5">
              <span className="w-1.5 h-full min-h-[20px] rounded-full bg-red-500 shrink-0 block"></span>
              <p>{state.error}</p>
            </div>
          )}
          
          <div className="space-y-2.5">
            <Label htmlFor="whatsapp" className="text-blue-950 dark:text-blue-100 font-semibold">Username / Nomor WA</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-blue-900/40 dark:text-blue-200/40">
                <User className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <Input 
                id="whatsapp" 
                name="whatsapp" 
                placeholder="Contoh: admin atau 0853..." 
                type="text" 
                className="pl-11 h-12 bg-blue-50/50 dark:bg-[#0f172a] border-blue-100 dark:border-blue-900/50 text-blue-950 dark:text-blue-50 placeholder:text-blue-900/40 dark:placeholder:text-blue-200/40 focus-visible:ring-primary/50 focus-visible:border-primary transition-all rounded-lg"
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="pin" className="text-blue-950 dark:text-blue-100 font-semibold">PIN / Password</Label>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-primary text-blue-900/40 dark:text-blue-200/40">
                <LockKeyhole className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <Input 
                id="pin" 
                name="pin" 
                type="password" 
                className="pl-11 h-12 bg-blue-50/50 dark:bg-[#0f172a] border-blue-100 dark:border-blue-900/50 text-blue-950 dark:text-blue-50 placeholder:text-blue-900/40 dark:placeholder:text-blue-200/40 focus-visible:ring-primary/50 focus-visible:border-primary transition-all rounded-lg"
                placeholder="••••••"
                required 
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="px-8 pb-10 pt-4">
          <Button 
            type="submit" 
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200 rounded-lg text-base font-bold tracking-wide" 
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <span>Masuk Sistem</span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-br from-[#0a1128] via-[#101b3b] to-[#0a1128] p-6 md:p-10 relative overflow-hidden">
      {/* Luxurious ambient background glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Top left gold glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-amber-500/15 blur-[120px] rounded-full mix-blend-screen opacity-80 animate-ambient-drift"></div>
        {/* Bottom right blue/gold glow */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-yellow-400/10 blur-[100px] rounded-full mix-blend-screen opacity-70 animate-ambient-drift-reverse"></div>
        {/* Center subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none animate-ambient-drift [animation-delay:5s]"></div>
      </div>
      
      {/* Decorative background pattern (subtle grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
      
      {/* Floating Gold Particles Animation */}
      <FloatingParticles />
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        <Suspense fallback={<Loader2 className="animate-spin text-amber-500 mx-auto h-8 w-8" />}>
          <LoginForm />
        </Suspense>
        <div className="mt-8 text-center text-sm text-blue-200/60 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} Rahafa Gold. All rights reserved.
        </div>
      </div>
    </div>
  );
}

