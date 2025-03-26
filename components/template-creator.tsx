"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Type, Download, Plus, FileDown, Save, Mail, Send } from "lucide-react"
import TextFieldEditor from "./text-field-editor"
import CSVImporter from "./csv-importer"
import TextFieldList from "./text-field-list"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 500

export default function TemplateCreator() {
  const { toast } = useToast()
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)
  const [textFields, setTextFields] = useState<Array<TextFieldType>>([])
  const [selectedTextFieldIndex, setSelectedTextFieldIndex] = useState<number | null>(null)
  const [csvData, setCsvData] = useState<Array<Record<string, string>>>([])
  const [activeTab, setActiveTab] = useState("editor")
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [templateName, setTemplateName] = useState("Untitled Template")
  const [templateDescription, setTemplateDescription] = useState("")
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailSettings, setEmailSettings] = useState<any>(null)
  const [emailTemplates, setEmailTemplates] = useState<any[]>([])
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string>("")
  const [emailColumnField, setEmailColumnField] = useState<string>("")
  const [sendingEmails, setSendingEmails] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const templateFileRef = useRef<HTMLInputElement>(null)

  // Text field type definition
  type TextFieldType = {
    id: string
    text: string
    x: number
    y: number
    width: number
    height: number
    fontSize: number
    fontFamily: string
    color: string
    isDragging: boolean
    dragOffsetX?: number
    dragOffsetY?: number
  }

  // Load email settings and templates on component mount
  useEffect(() => {
    const fetchEmailData = async () => {
      try {
        // Fetch email settings
        const settingsResponse = await fetch("/api/settings")
        if (settingsResponse.ok) {
          const data = await settingsResponse.json()
          if (data.settings) {
            setEmailSettings(data.settings)
          }
        }

        // Fetch email templates
        const templatesResponse = await fetch("/api/email-templates")
        if (templatesResponse.ok) {
          const data = await templatesResponse.json()
          setEmailTemplates(data.templates || [])
        }
      } catch (error) {
        console.error("Failed to fetch email data:", error)
      }
    }

    fetchEmailData()
  }, [])

  // Handle background image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setBackgroundImage(img)
          renderCanvas()
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  // Add a new text field
  const addTextField = () => {
    const newTextField: TextFieldType = {
      id: `text-${Date.now()}`,
      text: "Sample Text",
      x: CANVAS_WIDTH / 2 - 100,
      y: CANVAS_HEIGHT / 2,
      width: 200,
      height: 40,
      fontSize: 20,
      fontFamily: "Arial",
      color: "#000000",
      isDragging: false,
    }

    setTextFields([...textFields, newTextField])
    setSelectedTextFieldIndex(textFields.length)
  }

  // Update text field properties
  const updateTextField = (index: number, updates: Partial<TextFieldType>) => {
    const updatedFields = [...textFields]
    updatedFields[index] = { ...updatedFields[index], ...updates }
    setTextFields(updatedFields)
  }

  // Delete a text field
  const deleteTextField = (index: number) => {
    const updatedFields = textFields.filter((_, i) => i !== index)
    setTextFields(updatedFields)
    setSelectedTextFieldIndex(null)
  }

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Check if any text field was clicked (in reverse order to select top-most field first)
    for (let i = textFields.length - 1; i >= 0; i--) {
      const field = textFields[i]
      const ctx = canvas.getContext("2d")
      if (!ctx) continue

      // Calculate text dimensions for accurate hit detection
      ctx.font = `${field.fontSize}px ${field.fontFamily}`
      const textMetrics = ctx.measureText(field.text)
      const textWidth = textMetrics.width
      const textHeight = field.fontSize

      // Check if click is within text field bounds
      if (
        x >= field.x - textWidth / 2 - 10 &&
        x <= field.x + textWidth / 2 + 10 &&
        y >= field.y - textHeight / 2 - 10 &&
        y <= field.y + textHeight / 2 + 10
      ) {
        setSelectedTextFieldIndex(i)
        // Store the offset from the center of the text field
        const offsetX = x - field.x
        const offsetY = y - field.y

        // Create a new array to ensure state update
        const updatedFields = [...textFields]
        updatedFields[i] = {
          ...updatedFields[i],
          isDragging: true,
          dragOffsetX: offsetX,
          dragOffsetY: offsetY,
        }
        setTextFields(updatedFields)
        return
      }
    }

    setSelectedTextFieldIndex(null)
  }

  // Fix the handleMouseMove function for better dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || selectedTextFieldIndex === null) return

    const field = textFields[selectedTextFieldIndex]
    if (!field.isDragging) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Calculate new position, accounting for the drag offset
    const newX = x - (field.dragOffsetX || 0)
    const newY = y - (field.dragOffsetY || 0)

    // Create a new array to ensure state update
    const updatedFields = [...textFields]
    updatedFields[selectedTextFieldIndex] = {
      ...updatedFields[selectedTextFieldIndex],
      x: newX,
      y: newY,
    }

    setTextFields(updatedFields)
  }

  // Fix the handleMouseUp function
  const handleMouseUp = () => {
    if (selectedTextFieldIndex === null) return

    // Create a new array to ensure state update
    const updatedFields = [...textFields]
    updatedFields[selectedTextFieldIndex] = {
      ...updatedFields[selectedTextFieldIndex],
      isDragging: false,
    }

    setTextFields(updatedFields)
  }

  // Update the renderCanvas function to support dark mode
  const renderCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background image if available
    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
    } else {
      // Draw placeholder background - support dark mode
      const isDarkMode = document.documentElement.classList.contains("dark")
      ctx.fillStyle = isDarkMode ? "#1e293b" : "#f5f5f5"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = isDarkMode ? "#475569" : "#cccccc"
      ctx.font = "20px Arial"
      ctx.textAlign = "center"
      ctx.fillText("Upload a background image", canvas.width / 2, canvas.height / 2)
    }

    // Draw text fields
    textFields.forEach((field, index) => {
      ctx.font = `${field.fontSize}px ${field.fontFamily}`
      ctx.fillStyle = field.color
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Calculate text dimensions
      const textMetrics = ctx.measureText(field.text)
      const textWidth = textMetrics.width
      const textHeight = field.fontSize

      // Draw text at its current position
      ctx.fillText(field.text, field.x, field.y)

      // Draw selection box if selected
      if (index === selectedTextFieldIndex) {
        ctx.strokeStyle = "#0070f3"
        ctx.lineWidth = 2
        ctx.strokeRect(field.x - textWidth / 2 - 5, field.y - textHeight / 2 - 5, textWidth + 10, textHeight + 10)

        // Draw drag handles
        ctx.fillStyle = "#0070f3"
        const handleSize = 6

        // Corner handles
        ctx.fillRect(
          field.x - textWidth / 2 - 5 - handleSize / 2,
          field.y - textHeight / 2 - 5 - handleSize / 2,
          handleSize,
          handleSize,
        )
        ctx.fillRect(
          field.x + textWidth / 2 + 5 - handleSize / 2,
          field.y - textHeight / 2 - 5 - handleSize / 2,
          handleSize,
          handleSize,
        )
        ctx.fillRect(
          field.x - textWidth / 2 - 5 - handleSize / 2,
          field.y + textHeight / 2 + 5 - handleSize / 2,
          handleSize,
          handleSize,
        )
        ctx.fillRect(
          field.x + textWidth / 2 + 5 - handleSize / 2,
          field.y + textHeight / 2 + 5 - handleSize / 2,
          handleSize,
          handleSize,
        )
      }
    })
  }

  // Generate images from CSV data
  const generateImages = () => {
    if (!backgroundImage || textFields.length === 0 || csvData.length === 0) {
      toast({
        title: "Missing requirements",
        description: "Please add a background image, at least one text field, and import CSV data.",
        variant: "destructive",
      })
      return
    }

    const canvas = document.createElement("canvas")
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const images: string[] = []

    csvData.forEach((row, rowIndex) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)

      // Draw text fields with data from CSV
      textFields.forEach((field) => {
        ctx.font = `${field.fontSize}px ${field.fontFamily}`
        ctx.fillStyle = field.color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        // Replace text with CSV data if available
        const fieldName = field.text.trim()
        const text = row[fieldName] || field.text

        ctx.fillText(text, field.x, field.y)
      })

      // Convert to image
      const dataUrl = canvas.toDataURL("image/png")
      images.push(dataUrl)
    })

    setGeneratedImages(images)
    setActiveTab("generator")

    toast({
      title: "Images generated",
      description: `Successfully generated ${images.length} images from your template.`,
    })
  }

  // Download a generated image
  const downloadImage = (dataUrl: string, index: number) => {
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `generated-image-${index + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Download all images as a zip file
  const downloadAllAsZip = async () => {
    if (generatedImages.length === 0) return

    const zip = new JSZip()
    const folder = zip.folder("generated-images")

    // Add each image to the zip
    generatedImages.forEach((dataUrl, index) => {
      // Convert data URL to blob
      const data = dataUrl.split(",")[1]
      folder?.file(`image-${index + 1}.png`, data, { base64: true })
    })

    // Generate and save the zip file
    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, "generated-images.zip")
  }

  // Save template to database
  const saveTemplate = async () => {
    if (!templateName) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template",
        variant: "destructive",
      })
      return
    }

    if (!backgroundImage) {
      toast({
        title: "Background image required",
        description: "Please add a background image to your template",
        variant: "destructive",
      })
      return
    }

    // Create a thumbnail of the current canvas
    const canvas = canvasRef.current
    if (!canvas) return
    const thumbnailUrl = canvas.toDataURL("image/png")

    // Prepare template data
    const templateData = {
      name: templateName,
      description: templateDescription,
      textFields: textFields,
      backgroundImage: backgroundImage.src,
      thumbnail: thumbnailUrl,
    }

    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
      })

      if (response.ok) {
        toast({
          title: "Template saved",
          description: "Your template has been saved successfully",
        })
        setSaveDialogOpen(false)
      } else {
        throw new Error("Failed to save template")
      }
    } catch (error) {
      console.error("Error saving template:", error)
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      })
    }
  }

  // Export template as .tmpl file
  const exportTemplate = async () => {
    if (!backgroundImage || textFields.length === 0) {
      toast({
        title: "Missing requirements",
        description: "Please add a background image and at least one text field.",
        variant: "destructive",
      })
      return
    }

    // Create template data
    const templateData = {
      name: templateName || "Untitled Template",
      description: templateDescription,
      textFields: textFields,
      version: "1.0",
    }

    // Create a zip file
    const zip = new JSZip()

    // Add template data as JSON
    zip.file("template.json", JSON.stringify(templateData))

    // Add background image
    const imgData = backgroundImage.src.split(",")[1]
    zip.file("background.png", imgData, { base64: true })

    // Generate the zip file
    const content = await zip.generateAsync({ type: "blob" })

    // Save with .tmpl extension
    const filename = (templateName || "template").replace(/\s+/g, "-").toLowerCase() + ".tmpl"
    saveAs(content, filename)
  }

  // Import template from .tmpl file
  const importTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if it's a .tmpl file
    if (!file.name.endsWith(".tmpl")) {
      toast({
        title: "Invalid file",
        description: "Please upload a valid .tmpl file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        // Read the zip file
        const zipData = event.target?.result
        if (!zipData) return

        const zip = await JSZip.loadAsync(zipData as ArrayBuffer)

        // Extract template data
        const templateJson = await zip.file("template.json")?.async("text")
        if (!templateJson) throw new Error("Invalid template file")

        const templateData = JSON.parse(templateJson)

        // Extract background image
        const backgroundData = await zip.file("background.png")?.async("base64")
        if (!backgroundData) throw new Error("Background image not found")

        // Load the background image
        const img = new Image()
        img.onload = () => {
          setBackgroundImage(img)
          setTextFields(templateData.textFields)
          setTemplateName(templateData.name)
          setTemplateDescription(templateData.description || "")
          renderCanvas()

          toast({
            title: "Template imported",
            description: "Template has been imported successfully",
          })
        }
        img.src = `data:image/png;base64,${backgroundData}`
      } catch (error) {
        console.error("Error importing template:", error)
        toast({
          title: "Import failed",
          description: "Failed to import template file",
          variant: "destructive",
        })
      }
    }

    reader.readAsArrayBuffer(file)
  }

  // Send emails with generated images
  const sendEmails = async () => {
    if (!emailSettings) {
      toast({
        title: "Email settings required",
        description: "Please configure your email settings first",
        variant: "destructive",
      })
      return
    }

    if (!selectedEmailTemplate) {
      toast({
        title: "Email template required",
        description: "Please select an email template",
        variant: "destructive",
      })
      return
    }

    if (!emailColumnField) {
      toast({
        title: "Email field required",
        description: "Please select which CSV column contains email addresses",
        variant: "destructive",
      })
      return
    }

    if (generatedImages.length === 0 || csvData.length === 0) {
      toast({
        title: "Missing data",
        description: "Please generate images first",
        variant: "destructive",
      })
      return
    }

    setSendingEmails(true)

    try {
      // Get the selected email template
      const templateResponse = await fetch(`/api/email-templates/${selectedEmailTemplate}`)
      if (!templateResponse.ok) throw new Error("Failed to fetch email template")

      const emailTemplate = await templateResponse.json()

      // Prepare email data
      const emailData = {
        settings: emailSettings,
        template: emailTemplate,
        recipients: csvData.map((row, index) => ({
          email: row[emailColumnField],
          data: row,
          imageUrl: generatedImages[index],
        })),
      }

      // Send emails
      const response = await fetch("/api/send-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Emails sent",
          description: `Successfully sent ${result.sent} emails`,
        })
        setEmailDialogOpen(false)
      } else {
        throw new Error("Failed to send emails")
      }
    } catch (error) {
      console.error("Error sending emails:", error)
      toast({
        title: "Error",
        description: "Failed to send emails",
        variant: "destructive",
      })
    } finally {
      setSendingEmails(false)
    }
  }

  // Update canvas when dependencies change
  useEffect(() => {
    renderCanvas()
  }, [backgroundImage, textFields, selectedTextFieldIndex])

  // Add this useEffect to re-render the canvas when theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class" &&
          mutation.target === document.documentElement
        ) {
          renderCanvas()
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Replace the return statement with this updated version that includes the text field list and zip download button
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">{templateName || "Untitled Template"}</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => templateFileRef.current?.click()}>
              Import Template
            </Button>
            <input ref={templateFileRef} type="file" accept=".tmpl" className="hidden" onChange={importTemplate} />
            <Button variant="outline" onClick={exportTemplate}>
              Export Template
            </Button>
            <Button variant="outline" onClick={() => setSaveDialogOpen(true)}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Template Editor</TabsTrigger>
            <TabsTrigger value="generator">Generated Images</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-4">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border border-gray-300 rounded-lg shadow-sm w-full h-auto"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                <ImageIcon className="mr-2 h-4 w-4" />
                Upload Background
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

              <Button onClick={addTextField} variant="outline">
                <Type className="mr-2 h-4 w-4" />
                Add Text Field
              </Button>

              <Button
                onClick={generateImages}
                disabled={!backgroundImage || textFields.length === 0 || csvData.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Generate Images
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="generator" className="space-y-4">
            {generatedImages.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Generated Images ({generatedImages.length})</h3>
                  <div className="flex gap-2">
                    <Button onClick={downloadAllAsZip}>
                      <FileDown className="mr-2 h-4 w-4" />
                      Download All as ZIP
                    </Button>
                    <Button onClick={() => setEmailDialogOpen(true)}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send via Email
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedImages.map((dataUrl, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-4">
                        <img
                          src={dataUrl || "/placeholder.svg"}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-auto rounded-md"
                        />
                        <Button onClick={() => downloadImage(dataUrl, index)} className="mt-2 w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Download className="mx-auto h-12 w-12 mb-4 opacity-30" />
                <p>No images generated yet. Import CSV data and click "Generate Images".</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">Text Fields</h3>
            <TextFieldList
              textFields={textFields}
              selectedIndex={selectedTextFieldIndex}
              onSelect={setSelectedTextFieldIndex}
            />
            <Button onClick={addTextField} className="w-full mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Text Field
            </Button>
          </CardContent>
        </Card>

        {selectedTextFieldIndex !== null && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium mb-4">Text Field Properties</h3>
              <TextFieldEditor
                textField={textFields[selectedTextFieldIndex]}
                onChange={(updates) => updateTextField(selectedTextFieldIndex, updates)}
                onDelete={() => deleteTextField(selectedTextFieldIndex)}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-4">CSV Data Import</h3>
            <CSVImporter onDataImported={setCsvData} />

            {csvData.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">{csvData.length} rows imported. Preview:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        {Object.keys(csvData[0]).map((header) => (
                          <th key={header} className="p-2 text-left border border-gray-200">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 3).map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((value, j) => (
                            <td key={j} className="p-2 border border-gray-200">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {csvData.length > 3 && (
                  <p className="text-xs text-gray-500 mt-2">...and {csvData.length - 3} more rows</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Template Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="templateDescription">Description (optional)</Label>
              <Input
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Enter template description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate}>
              <Save className="mr-2 h-4 w-4" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send via Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!emailSettings ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">Email settings not configured</p>
                <Link href="/settings">
                  <Button>Configure Email Settings</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="emailTemplate">Email Template</Label>
                  <Select value={selectedEmailTemplate} onValueChange={setSelectedEmailTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select email template" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {emailTemplates.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      <Link href="/email-templates/create" className="text-blue-500 hover:underline">
                        Create an email template
                      </Link>{" "}
                      to continue
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailField">Email Address Field</Label>
                  <Select value={emailColumnField} onValueChange={setEmailColumnField}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select CSV column with email addresses" />
                    </SelectTrigger>
                    <SelectContent>
                      {csvData.length > 0 &&
                        Object.keys(csvData[0]).map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-gray-500">
                  <p>This will send personalized emails to each recipient with their generated image attached.</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={sendEmails}
              disabled={sendingEmails || !emailSettings || !selectedEmailTemplate || !emailColumnField}
            >
              <Send className="mr-2 h-4 w-4" />
              {sendingEmails ? "Sending..." : "Send Emails"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

