'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Upload, Download, Search } from 'lucide-react'
import MarkdownLatexRenderer from '@/components/MarkdownLatexRenderer'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function Component() {
  const [editableData, setEditableData] = useState<any[]>([])
  const [ogData, setOgData] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [editedEntry, setEditedEntry] = useState<any>(null)
  const [isEditableFileUploaded, setIsEditableFileUploaded] = useState(false)
  const [isOgFileUploaded, setIsOgFileUploaded] = useState(false)
  const [showOgPreview, setShowOgPreview] = useState(true)

  const handleEditableFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    const file = event.target.files?.[0]

    if (file) {
      fileReader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const lines = content.split(/\r?\n/)
          const parsedData = lines
            .map((line, index) => {
              const trimmedLine = line.trim()
              if (trimmedLine === '') return null
              try {
                return JSON.parse(trimmedLine)
              } catch (err) {
                console.error(`Error parsing JSON on line ${index + 1}:`, err)
                throw err
              }
            })
            .filter((item) => item !== null)

          // Initialize is_paid to 'FALSE' and subcategory, company to empty arrays
          const initializedData = parsedData.map((item) => ({
            ...item,
            is_paid: 'FALSE',
            subcategory: item.subcategory || [],
            company: item.company || [],
          }))

          setEditableData(initializedData)
          setCurrentIndex(0)
          setIsEditableFileUploaded(true)
        } catch (error: any) {
          console.error('Error processing file:', error)
          alert(`Error processing file: ${error.message}`)
        }
      }
      fileReader.readAsText(file)
    }
  }

  const handleOgFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    const file = event.target.files?.[0]

    if (file) {
      fileReader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const lines = content.split(/\r?\n/)
          const parsedData = lines
            .map((line, index) => {
              const trimmedLine = line.trim()
              if (trimmedLine === '') return null
              try {
                return JSON.parse(trimmedLine)
              } catch (err) {
                console.error(`Error parsing JSON on line ${index + 1}:`, err)
                throw err
              }
            })
            .filter((item) => item !== null)

          setOgData(parsedData)
          setIsOgFileUploaded(true)
        } catch (error: any) {
          console.error('Error processing file:', error)
          alert(`Error processing file: ${error.message}`)
        }
      }
      fileReader.readAsText(file)
    }
  }

  useEffect(() => {
    if (editableData.length > 0) {
      setEditedEntry(editableData[currentIndex])
    }
  }, [currentIndex, editableData])

  const saveCurrentEntry = (updatedEntry: any) => {
    const updatedData = [...editableData]
    updatedData[currentIndex] = updatedEntry
    setEditableData(updatedData)
    setEditedEntry(updatedEntry)
  }

  const handleNext = () => {
    if (currentIndex < editableData.length - 1) {
      saveCurrentEntry(editedEntry)
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      saveCurrentEntry(editedEntry)
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSearch = () => {
    // First try to find by serial_number
    let index = editableData.findIndex((item) => 
      item.serial_number?.toString() === searchQuery
    )
    
    // If not found by serial_number, then search by name
    if (index === -1) {
      index = editableData.findIndex((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (index !== -1) {
      saveCurrentEntry(editedEntry)
      setCurrentIndex(index)
    } else {
      alert('No matching entry found')
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const newData = editableData.filter((_, index) => index !== currentIndex)
      setEditableData(newData)
      
      // Adjust current index if necessary
      if (currentIndex >= newData.length) {
        setCurrentIndex(Math.max(0, newData.length - 1))
      }
    }
  }

  const JsonEditor = ({ entry, onSaveEntry }: { entry: any; onSaveEntry: (updatedEntry: any) => void }) => {
    const [localEditedEntry, setLocalEditedEntry] = useState(entry)

    useEffect(() => {
      setLocalEditedEntry(entry)
    }, [entry])

    const handleChange = (key: string, value: any) => {
      setLocalEditedEntry((prevState: any) => ({ ...prevState, [key]: value }))
    }

    const handleArrayChange = (key: string, value: string) => {
      setLocalEditedEntry((prevState: any) => ({
        ...prevState,
        [key]: [...(prevState[key] || []), value],
      }))
    }

    const handleArrayRemove = (key: string, index: number) => {
      setLocalEditedEntry((prevState: any) => ({
        ...prevState,
        [key]: prevState[key].filter((_: any, i: number) => i !== index),
      }))
    }

    const renderInputFields = () => {
      return Object.keys(localEditedEntry).map((key) => {
        if (key === 'is_paid') {
          return (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {key}:
              </label>
              <Select
                value={localEditedEntry[key]}
                onValueChange={(value) => handleChange(key, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRUE">TRUE</SelectItem>
                  <SelectItem value="FALSE">FALSE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )
        } else if (key === 'subcategory' || key === 'company') {
          return (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {key}:
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {localEditedEntry[key]?.map((item: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {item}
                    <X
                      className="ml-1 cursor-pointer"
                      onClick={() => handleArrayRemove(key, index)}
                    />
                  </Badge>
                ))}
              </div>
              <Input
                type="text"
                placeholder={`Add to ${key}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    e.preventDefault()
                    handleArrayChange(key, e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
            </div>
          )
        } else if (key === 'category') {
          return (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {key}:
              </label>
              <Select
                value={localEditedEntry[key]}
                onValueChange={(value) => handleChange(key, value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Brainteaser">Brainteaser</SelectItem>
                  <SelectItem value="Combinatorics">Combinatorics</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Maths">Maths</SelectItem>
                  <SelectItem value="Probability">Probability</SelectItem>
                  <SelectItem value="Statistics">Statistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )
        } else if (key === 'problem_text' || key === 'solution' || key === 'hints' || key === 'answer') {
          return (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {key}:
              </label>
              <Textarea
                value={localEditedEntry[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                rows={6}
                className="w-full"
              />
            </div>
          )
        } else {
          return (
            <div key={key} className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {key}:
              </label>
              <Input
                value={localEditedEntry[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full"
              />
            </div>
          )
        }
      })
    }

    const PreviewCard = ({ title, content }: { title: string; content?: string }) => {
      if (!content) return null
      return (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[200px] w-full" type="always">
              <div className="p-4">
                <MarkdownLatexRenderer content={content} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )
    }

    // Change this part to use serial_number instead of unique_name
    const ogEntry = ogData.find((item) => item.serial_number == localEditedEntry.serial_number)

    // Determine the number of columns based on showOgPreview
    const gridCols = showOgPreview && isOgFileUploaded && ogEntry ? 'md:grid-cols-3' : 'md:grid-cols-2'

    return (
      <div className={`grid grid-cols-1 ${gridCols} gap-6 mt-6`}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              {renderInputFields()}
            </ScrollArea>
            <Button onClick={() => onSaveEntry(localEditedEntry)} className="mt-4">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview (Editable Data)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]" type="always">
              {localEditedEntry.problem_text && (
                <PreviewCard title="Problem Text" content={localEditedEntry.problem_text} />
              )}
              {localEditedEntry.solution && (
                <PreviewCard title="Solution" content={localEditedEntry.solution} />
              )}
              {localEditedEntry.hints && (
                <PreviewCard title="Hints" content={localEditedEntry.hints} />
              )}
              {localEditedEntry.answer && (
                <PreviewCard title="Answer" content={localEditedEntry.answer} />
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {isOgFileUploaded && ogEntry && showOgPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Original Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)]" type="always">
                <div className="mb-4">
                  <strong>Name:</strong> {ogEntry.name}
                </div>
                <div className="mb-4">
                  <strong>Difficulty:</strong> {ogEntry.difficulty || 'N/A'}
                </div>
                {ogEntry.problem_text && (
                  <PreviewCard title="Problem Text" content={ogEntry.problem_text} />
                )}
                {ogEntry.solution && (
                  <PreviewCard title="Solution" content={ogEntry.solution} />
                )}
                {ogEntry.hints && (
                  <PreviewCard title="Hints" content={ogEntry.hints} />
                )}
                {ogEntry.answer && (
                  <PreviewCard title="Answer" content={ogEntry.answer} />
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-2 py-8">
      <h1 className="text-3xl font-bold mb-8">QD Admin Panel</h1>

      {!isEditableFileUploaded && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Editable JSON File</CardTitle>
            <CardDescription>Upload the data you want to edit in JSON format</CardDescription>
          </CardHeader>
          <CardContent>
            <label htmlFor="editable-file-upload" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      Upload Editable JSON
                    </span>
                    <input
                      id="editable-file-upload"
                      name="editable-file-upload"
                      type="file"
                      accept=".json,.jsonl"
                      className="sr-only"
                      onChange={handleEditableFileUpload}
                    />
                  </div>
                  <p className="text-xs text-gray-500">JSON files only</p>
                </div>
              </div>
            </label>
          </CardContent>
        </Card>
      )}

      {!isOgFileUploaded && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Original JSON File</CardTitle>
            <CardDescription>Upload the original data for reference</CardDescription>
          </CardHeader>
          <CardContent>
            <label htmlFor="og-file-upload" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      Upload Original JSON
                    </span>
                    <input
                      id="og-file-upload"
                      name="og-file-upload"
                      type="file"
                      accept=".json,.jsonl"
                      className="sr-only"
                      onChange={handleOgFileUpload}
                    />
                  </div>
                  <p className="text-xs text-gray-500">JSON files only</p>
                </div>
              </div>
            </label>
          </CardContent>
        </Card>
      )}

      {isEditableFileUploaded && editableData.length > 0 && editedEntry && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button onClick={handlePrevious} disabled={currentIndex === 0} variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Entry {currentIndex + 1} of {editableData.length}
              </span>
              <Button
                onClick={handleNext}
                disabled={currentIndex === editableData.length - 1}
                variant="outline"
                size="icon"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button onClick={handleDelete} variant="destructive">
                Delete Entry
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Search by serial number or name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button onClick={handleSearch} variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {isOgFileUploaded && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="showOgPreview"
                    checked={showOgPreview}
                    onCheckedChange={(checked) => setShowOgPreview(checked)}
                  />
                  <Label htmlFor="showOgPreview">Show Original Preview</Label>
                </div>
              )}
            </div>
          </div>

          <JsonEditor entry={editedEntry} onSaveEntry={saveCurrentEntry} />

          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => {
                const dataStr =
                  'data:text/json;charset=utf-8,' +
                  encodeURIComponent(
                    editableData.map((obj) => JSON.stringify(obj)).join('\n')
                  )
                const downloadAnchorNode = document.createElement('a')
                downloadAnchorNode.setAttribute('href', dataStr)
                downloadAnchorNode.setAttribute('download', 'edited_data.json')
                document.body.appendChild(downloadAnchorNode)
                downloadAnchorNode.click()
                downloadAnchorNode.remove()
              }}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Edited JSON
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
