"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, Loader2, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/providers/auth-provider"
import { useFirebase } from "@/components/providers/firebase-provider"
import type { QRCode } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import QRCodeLib from "qrcode"
import Image from "next/image"
import { format } from "date-fns"

export function QRCodeManager() {
  const { userData, user } = useAuth() // Added user
  const { db, initialized } = useFirebase()
  const [qrcodes, setQRCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [tableNumber, setTableNumber] = useState<number | string>("")
  const [generatedQRCodeDataUrl, setGeneratedQRCodeDataUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchQRCodes = async () => {
    if (!initialized || !db || !userData?.restaurantId || !user) return // Added !user

    setLoading(true)
    try {
      const idToken = await user.getIdToken() // Get ID token
      const response = await fetch(`/api/qr-codes?restaurantId=${userData.restaurantId}`, {
        headers: { Authorization: `Bearer ${idToken}` }, // Add Authorization header
      })
      if (!response.ok) throw new Error("Failed to fetch QR codes")
      const data = await response.json()
      setQRCodes(data.sort((a: QRCode, b: QRCode) => a.tableNumber - b.tableNumber))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load QR codes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialized && db && userData?.restaurantId && user) {
      // Added user
      fetchQRCodes()
    }
  }, [initialized, db, userData?.restaurantId, user]) // Added user to dependencies

  const handleGenerateQRCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userData?.restaurantId || !tableNumber || !user) {
      // Added !user
      toast({
        title: "Validation Error",
        description: "Table number is required.",
        variant: "destructive",
      })
      return
    }

    const existingQRCode = qrcodes.find((qr) => qr.tableNumber === Number(tableNumber))
    if (existingQRCode) {
      toast({
        title: "Duplicate Table",
        description: `A QR code for table ${tableNumber} already exists.`,
        variant: "destructive",
      })
      return
    }

    setFormLoading(true)
    try {
      const menuUrl = `${window.location.origin}/menu/${userData.restaurantId}/${tableNumber}`
      const qrCodeDataUrl = await QRCodeLib.toDataURL(menuUrl, { width: 256, margin: 2 })
      setGeneratedQRCodeDataUrl(qrCodeDataUrl)

      const idToken = await user.getIdToken() // Get ID token
      const payload = {
        tableNumber: Number(tableNumber),
        restaurantId: userData.restaurantId,
        qrCodeUrl: qrCodeDataUrl,
      }

      const response = await fetch("/api/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` }, // Add Authorization header
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save QR code")

      toast({
        title: "Success",
        description: `QR code for table ${tableNumber} generated and saved.`,
      })
      setDialogOpen(false)
      setTableNumber("")
      setGeneratedQRCodeDataUrl(null)
      fetchQRCodes()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate or save QR code.",
        variant: "destructive",
      })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteQRCode = async (id: string) => {
    if (!db || !userData?.restaurantId || !user) return // Added !user

    if (!window.confirm("Are you sure you want to delete this QR code? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    try {
      const idToken = await user.getIdToken() // Get ID token
      const response = await fetch(`/api/qr-codes/${id}?restaurantId=${userData.restaurantId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` }, // Add Authorization header
      })
      if (!response.ok) throw new Error("Failed to delete QR code")
      toast({
        title: "Success",
        description: "QR code deleted successfully.",
      })
      fetchQRCodes()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete QR code.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleDownloadQRCode = (qrCodeUrl: string, tableNum: number) => {
    const link = document.createElement("a")
    link.href = qrCodeUrl
    link.download = `qr-code-table-${tableNum}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (timestamp: any) => {
    try {
      // Handle Firebase Timestamp object with seconds and nanoseconds
      if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
        return format(date, 'MMM dd, yyyy HH:mm')
      }
      // Handle Firebase Timestamp object with toDate method
      if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
        return format(timestamp.toDate(), 'MMM dd, yyyy HH:mm')
      }
      // Handle regular Date object
      if (timestamp instanceof Date) {
        return format(timestamp, 'MMM dd, yyyy HH:mm')
      }
      // Handle timestamp in seconds (Firebase sometimes returns this)
      if (typeof timestamp === 'number') {
        return format(new Date(timestamp * 1000), 'MMM dd, yyyy HH:mm')
      }
      // Handle ISO string
      if (typeof timestamp === 'string') {
        return format(new Date(timestamp), 'MMM dd, yyyy HH:mm')
      }
      return 'N/A'
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (!userData?.restaurantId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          You need to be associated with a restaurant to manage QR codes.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Table QR Codes</CardTitle>
        <Button onClick={() => setDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Generate New QR
        </Button>
      </CardHeader>
      <CardContent>
        {qrcodes.length === 0 ? (
          <p className="text-center text-muted-foreground">No QR codes found. Generate one for your tables!</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Number</TableHead>
                <TableHead>QR Code</TableHead>
                <TableHead>Generated On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qrcodes.map((qr) => (
                <TableRow key={qr.id}>
                  <TableCell className="font-medium">{qr.tableNumber}</TableCell>
                  <TableCell>
                    <Image
                      src={qr.qrCodeUrl || "/placeholder.svg"}
                      alt={`QR Code for Table ${qr.tableNumber}`}
                      width={64}
                      height={64}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(qr.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownloadQRCode(qr.qrCodeUrl, qr.tableNumber)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteQRCode(qr.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate New QR Code</DialogTitle>
            <DialogDescription>Enter the table number to generate a unique QR code.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGenerateQRCode}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Table Number</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  required
                  disabled={formLoading}
                />
              </div>
              {generatedQRCodeDataUrl && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-muted-foreground">Preview:</p>
                  <Image
                    src={generatedQRCodeDataUrl || "/placeholder.svg"}
                    alt="Generated QR Code Preview"
                    width={128}
                    height={128}
                    className="border p-1 rounded-md"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadQRCode(generatedQRCodeDataUrl, Number(tableNumber))}
                    type="button"
                  >
                    <Download className="mr-2 h-4 w-4" /> Download Preview
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate & Save QR Code
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}