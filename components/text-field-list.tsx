"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Type } from "lucide-react"

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
}

interface TextFieldListProps {
  textFields: TextFieldType[]
  selectedIndex: number | null
  onSelect: (index: number) => void
}

export default function TextFieldList({ textFields, selectedIndex, onSelect }: TextFieldListProps) {
  if (textFields.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <Type className="mx-auto h-8 w-8 mb-2 opacity-30" />
        <p>No text fields added yet</p>
        <p className="text-xs mt-1">Click "Add Text Field" to get started</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[200px] pr-4">
      <div className="space-y-2">
        {textFields.map((field, index) => (
          <Button
            key={field.id}
            variant={selectedIndex === index ? "default" : "outline"}
            className="w-full justify-start text-left h-auto py-2 px-3"
            onClick={() => onSelect(index)}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: field.color }} />
              <div className="truncate">
                <span className="font-medium">{field.text}</span>
                <span className="text-xs block text-gray-500">
                  {field.fontFamily}, {field.fontSize}px
                </span>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}

