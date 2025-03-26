"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

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

interface TextFieldEditorProps {
  textField: TextFieldType
  onChange: (updates: Partial<TextFieldType>) => void
  onDelete: () => void
}

const fontFamilies = [
  "Arial",
  "Verdana",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Trebuchet MS",
  "Impact",
]

export default function TextFieldEditor({ textField, onChange, onDelete }: TextFieldEditorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-content">Text Content</Label>
        <Input id="text-content" value={textField.text} onChange={(e) => onChange({ text: e.target.value })} />
        <p className="text-xs text-gray-500">
          This will be replaced with CSV data if a column with the same name exists.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="font-family">Font Family</Label>
        <Select value={textField.fontFamily} onValueChange={(value) => onChange({ fontFamily: value })}>
          <SelectTrigger id="font-family">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {fontFamilies.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="font-size">Font Size: {textField.fontSize}px</Label>
        <Slider
          id="font-size"
          min={8}
          max={72}
          step={1}
          value={[textField.fontSize]}
          onValueChange={(value) => onChange({ fontSize: value[0] })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-color">Text Color</Label>
        <div className="flex items-center gap-2">
          <Input
            id="text-color"
            type="color"
            value={textField.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="w-12 h-10 p-1"
          />
          <Input
            type="text"
            value={textField.color}
            onChange={(e) => onChange({ color: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Position</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="position-x" className="text-xs">
              X: {Math.round(textField.x)}
            </Label>
            <Input
              id="position-x"
              type="number"
              value={Math.round(textField.x)}
              onChange={(e) => onChange({ x: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="position-y" className="text-xs">
              Y: {Math.round(textField.y)}
            </Label>
            <Input
              id="position-y"
              type="number"
              value={Math.round(textField.y)}
              onChange={(e) => onChange({ y: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <Button variant="destructive" onClick={onDelete} className="w-full">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Text Field
      </Button>
    </div>
  )
}

