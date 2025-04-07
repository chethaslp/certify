"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import EmailEditor from "@/components/email-editor"
import { ThemeToggle } from "@/components/theme-toggle"

export default function CreateEmailTemplate() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState({
    name: "",
    subject: "",
    content: "<p>Hello {{name}},</p><p>Your content here.</p>"
  });

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

    setLoading(true);
    try {
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });
      
      if (response.ok) {
        toast({
          title: "Template saved",
          description: "Your email template has been saved successfully",
        });
        // Redirect to email templates list
        window.location.href = "/email-templates";
      } else {
        throw new Error("Failed to save template");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save email template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold ml-4">Create Email Template</h1>
        </div>
        <ThemeToggle />
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
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

