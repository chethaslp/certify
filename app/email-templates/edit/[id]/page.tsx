"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import EmailEditor from "@/components/email-editor"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"

export default function EditEmailTemplatePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState({
    id: "",
    name: "",
    subject: "",
    content: ""
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/email-templates/${params.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch email template");
        }
        
        const data = await response.json();
        setTemplate(data);
      } catch (error) {
        console.error("Error fetching email template:", error);
        setError("Failed to load email template. It might not exist or you don't have permission to view it.");
        toast({
          title: "Error",
          description: "Failed to load email template",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchTemplate();
    }
  }, [params.id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content: string) => {
    setTemplate(prev => ({
      ...prev,
      content
    }));
  };

  const saveTemplate = async () => {
    if (!template.name || !template.subject || !template.content) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/email-templates/${template.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      
      if (response.ok) {
        toast({
          title: "Template saved",
          description: "Your email template has been updated successfully",
        });
        router.push("/email-templates");
      } else {
        throw new Error("Failed to update template");
      }
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update email template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/email-templates">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-3xl font-bold ml-4">Edit Email Template</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
        
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 text-center">
          <p className="text-destructive font-medium mb-4">{error}</p>
          <Button onClick={() => router.push('/email-templates')}>
            Return to Email Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/email-templates">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold ml-4">Edit Email Template</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input 
                id="name" 
                name="name"
                placeholder="e.g., Welcome Email" 
                value={template.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input 
                id="subject" 
                name="subject"
                placeholder="e.g., Welcome to our service" 
                value={template.subject}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Email Content</Label>
            <div className="border rounded-md">
              <EmailEditor 
                initialContent={template.content} 
                onChange={handleContentChange}
              />
            </div>
            <p className="text-sm text-gray-500">
                Use variables like {`{{Name}} {{Date}}`}, etc. to insert dynamic content from your CSV data.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={saveTemplate}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Template"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

