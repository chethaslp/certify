"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileIcon, UploadIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CSVImporterProps {
  onDataImported: (data: Array<Record<string, string>>) => void
}

export default function CSVImporter({ onDataImported }: CSVImporterProps) {
  const [fileName, setFileName] = useState<string>("")
  const [error, setError] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError("")

    // Check if it's a CSV file
    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string
        const data = parseCSV(csvText)
        onDataImported(data)
      } catch (err) {
        setError("Failed to parse CSV file. Please check the format.")
        console.error(err)
      }
    }

    reader.onerror = () => {
      setError("Failed to read the file")
    }

    reader.readAsText(file)
  }

  const parseCSV = (text: string): Array<Record<string, string>> => {
    // Split by lines
    const lines = text.split(/\r\n|\n/)
    if (lines.length < 2) throw new Error("CSV must have headers and at least one data row")

    // Parse headers
    const headers = lines[0].split(",").map((header) => header.trim())

    // Parse data rows
    const result: Array<Record<string, string>> = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue // Skip empty lines

      const values = lines[i].split(",").map((value) => value.trim())
      if (values.length !== headers.length) {
        console.warn(`Line ${i + 1} has ${values.length} values, expected ${headers.length}`)
        continue
      }

      const row: Record<string, string> = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ""
      })

      result.push(row)
    }

    return result
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
          <UploadIcon className="mr-2 h-4 w-4" />
          Upload CSV
        </Button>
        <Input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      </div>

      {fileName && (
        <div className="flex items-center gap-2 text-sm">
          <FileIcon className="h-4 w-4 text-blue-500" />
          <span>{fileName}</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-gray-500">
        <p>Upload a CSV file with headers that match your text field names to generate multiple images.</p>
        <p className="mt-1">Example format:</p>
        <pre className="bg-gray-100 p-2 rounded text-xs mt-1">
          Name,Title,ID
          <br />
          John Doe,Manager,12345
          <br />
          Jane Smith,Developer,67890
        </pre>
      </div>
    </div>
  )
}

