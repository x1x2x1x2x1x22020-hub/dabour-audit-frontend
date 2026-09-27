import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-bold text-2xl mb-4">
            D
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-primary">تسجيل الدخول | Login</CardTitle>
          <CardDescription>
            برنامج دابور للمراجعة والتدقيق المالي
            <br />
            Dabour Financial Audit & Review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex justify-between">
                <span>البريد الإلكتروني</span>
                <span className="text-muted-foreground text-xs">Email</span>
              </Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="auditor@firm.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-left dir-ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex justify-between">
                <span>كلمة المرور</span>
                <span className="text-muted-foreground text-xs">Password</span>
              </Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-left dir-ltr"
              />
            </div>
            <Button type="submit" className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
              دخول / Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
