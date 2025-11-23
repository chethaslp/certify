"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface EmailEditorProps {
  initialContent: string
  onChange: (content: string) => void
}

export default function EmailEditor({ initialContent, onChange }: EmailEditorProps) {
  const [content, setContent] = useState(initialContent)

  const handleChange = (value: string) => {
    setContent(value)
    onChange(value)
  }

  const insertTag = (tag: string) => {
    const textarea = document.getElementById("html-editor") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    let newContent = ""
    if (tag === "link") {
      newContent = content.substring(0, start) + 
        `<a href="https://example.com">${selectedText || "Link text"}</a>` + 
        content.substring(end)
    } else if (tag === "image") {
      newContent = content.substring(0, start) + 
        `<img src="https://via.placeholder.com/150" alt="Image" />` + 
        content.substring(end)
    } else {
      newContent = content.substring(0, start) + 
        `<${tag}>${selectedText || `${tag} text`}</${tag}>` + 
        content.substring(end)
    }
    
    handleChange(newContent)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
      <div className="border rounded-md flex flex-col overflow-hidden">
        <div className="bg-muted/30 p-2 border-b flex flex-wrap gap-1">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => insertTag("p")}
              className="h-7 px-2 text-xs"
            >
              Paragraph
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => insertTag("strong")}
              className="h-7 px-2 text-xs"
            >
              <strong>Bold</strong>
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => insertTag("em")}
              className="h-7 px-2 text-xs"
            >
              <em>Italic</em>
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => insertTag("h1")}
              className="h-7 px-2 text-xs"
            >
              H1
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => insertTag("h2")}
              className="h-7 px-2 text-xs"
            >
              H2
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => insertTag("h3")}
              className="h-7 px-2 text-xs"
            >
              H3
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => insertTag("ul")}
              className="h-7 px-2 text-xs"
            >
              List
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => insertTag("link")}
              className="h-7 px-2 text-xs"
            >
              Link
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => insertTag("image")}
              className="h-7 px-2 text-xs"
            >
              Image
            </Button>
          </div>
          <Textarea
            id="html-editor"
            value={content}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Write your HTML content here..."
            className="flex-1 font-mono text-sm border-0 rounded-none resize-none focus-visible:ring-0 p-4"
          />
      </div>

      <div className="border rounded-md overflow-hidden flex flex-col">
        <div className="bg-muted/50 px-4 py-2 border-b text-sm font-medium">
          Preview
        </div>
        <div className="flex-1 overflow-auto p-4 bg-white dark:bg-black">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  )
}