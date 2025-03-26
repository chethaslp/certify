"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Link, Image } from "lucide-react"

interface EmailEditorProps {
  initialContent: string
  onChange: (content: string) => void
}

export default function EmailEditor({ initialContent, onChange }: EmailEditorProps) {
  const [editorContent, setEditorContent] = useState(initialContent)
  const [showHtml, setShowHtml] = useState(false)

  useEffect(() => {
    // Initialize the editor with content
    const editor = document.getElementById("email-editor-content")
    if (editor) {
      editor.innerHTML = initialContent
    }
  }, [initialContent])

  const handleContentChange = () => {
    const editor = document.getElementById("email-editor-content")
    if (editor) {
      const content = editor.innerHTML
      setEditorContent(content)
      onChange(content)
    }
  }

  const execCommand = (command: string, value = "") => {
    document.execCommand(command, false, value)
    handleContentChange()
  }

  const toggleBold = () => execCommand("bold")
  const toggleItalic = () => execCommand("italic")
  const toggleUnderline = () => execCommand("underline")
  const alignLeft = () => execCommand("justifyLeft")
  const alignCenter = () => execCommand("justifyCenter")
  const alignRight = () => execCommand("justifyRight")

  const insertLink = () => {
    const url = prompt("Enter URL:")
    if (url) {
      execCommand("createLink", url)
    }
  }

  const insertImage = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      execCommand("insertImage", url)
    }
  }

  const toggleHtmlView = () => {
    const editor = document.getElementById("email-editor-content")
    if (editor && !showHtml) {
      setEditorContent(editor.innerHTML)
    }
    setShowHtml(!showHtml)
  }

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value)
    onChange(e.target.value)
  }

  return (
    <div className="border rounded-md overflow-hidden dark:border-gray-700">
      <div className="bg-gray-50 dark:bg-gray-800 p-2 border-b dark:border-gray-700 flex flex-wrap gap-1">
        <Button type="button" variant="ghost" size="sm" onClick={toggleBold} className="h-8 w-8 p-0">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={toggleItalic} className="h-8 w-8 p-0">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={toggleUnderline} className="h-8 w-8 p-0">
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-gray-300 mx-1"></div>
        <Button type="button" variant="ghost" size="sm" onClick={alignLeft} className="h-8 w-8 p-0">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={alignCenter} className="h-8 w-8 p-0">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={alignRight} className="h-8 w-8 p-0">
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="w-px h-8 bg-gray-300 mx-1"></div>
        <Button type="button" variant="ghost" size="sm" onClick={insertLink} className="h-8 w-8 p-0">
          <Link className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={insertImage} className="h-8 w-8 p-0">
          <Image className="h-4 w-4" />
        </Button>
        <div className="flex-grow"></div>
        <Button type="button" variant="outline" size="sm" onClick={toggleHtmlView}>
          {showHtml ? "Visual Editor" : "HTML"}
        </Button>
      </div>

      {showHtml ? (
        <textarea
          value={editorContent}
          onChange={handleHtmlChange}
          className="w-full h-64 p-3 font-mono text-sm bg-white dark:bg-gray-900 dark:text-gray-200"
        />
      ) : (
        <div
          id="email-editor-content"
          contentEditable
          onInput={handleContentChange}
          onBlur={handleContentChange}
          className="w-full h-64 p-3 focus:outline-none overflow-y-auto bg-white dark:bg-gray-900 dark:text-gray-200"
        ></div>
      )}
    </div>
  )
}

