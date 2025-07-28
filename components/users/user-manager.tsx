"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/providers/auth-provider"
import { useFirebase } from "@/components/providers/firebase-provider"
import type { User } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"

export function UserManager() {
  const { userData: currentUserData } = useAuth()
  const { db, initialized } = useFirebase()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchUsers = async () => {
    if (!initialized || !db || !currentUserData) return

    setLoading(true)
    try {
      let url = "/api/users"
      if (currentUserData.role !== "admin" && currentUserData.restaurantId) {
        url += `?restaurantId=${currentUserData.restaurantId}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${await currentUserData.user?.getIdToken()}`, // Pass ID token for auth
        },
      })

      if (!response.ok) throw new Error("Failed to fetch users")
      const data = await response.json()
      setUsers(data.sort((a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load users.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialized && db && currentUserData) {
      fetchUsers()
    }
  }, [initialized, db, currentUserData])

  const handleApprovalChange = async (userId: string, approved: boolean) => {
    if (!db || !currentUserData) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await currentUserData.user?.getIdToken()}`,
        },
        body: JSON.stringify({ approved }),
      })

      if (!response.ok) throw new Error("Failed to update user approval status")

      toast({
        title: "Success",
        description: `User ${approved ? "approved" : "disapproved"} successfully.`,
      })
      fetchUsers() // Re-fetch users to update the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update approval status.",
        variant: "destructive",
      })
    }
  }

  const handleRoleChange = async (userId: string, newRole: User["role"]) => {
    if (!db || !currentUserData) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await currentUserData.user?.getIdToken()}`,
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) throw new Error("Failed to update user role")

      toast({
        title: "Success",
        description: `User role updated to ${newRole} successfully.`,
      })
      fetchUsers() // Re-fetch users to update the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!db || !currentUserData) return

    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    setLoading(true) // Set loading for the whole table during deletion
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await currentUserData.user?.getIdToken()}`,
        },
      })

      if (!response.ok) throw new Error("Failed to delete user")

      toast({
        title: "Success",
        description: "User deleted successfully.",
      })
      fetchUsers() // Re-fetch users to update the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      })
      setLoading(false)
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

  if (!currentUserData) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          You must be logged in to manage users.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registered Users</CardTitle>
        {/* Optionally add a button to invite/add new users if needed */}
        {/* <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Add User
        </Button> */}
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-center text-muted-foreground">No users found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Restaurant ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(newRole: User["role"]) => handleRoleChange(user.id, newRole)}
                      disabled={
                        currentUserData.role !== "admin" && user.id === currentUserData.id // Cannot change own role if not admin
                      }
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentUserData.role === "admin" && <SelectItem value="admin">Admin</SelectItem>}
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="worker">Worker</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={user.approved}
                      onCheckedChange={(checked) => handleApprovalChange(user.id, checked)}
                      disabled={
                        currentUserData.role === "worker" || // Workers cannot approve/disapprove
                        (currentUserData.role === "manager" && user.role === "restaurant") || // Managers cannot approve restaurant owners
                        user.id === currentUserData.id // Cannot approve/disapprove self
                      }
                    />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{user.restaurantId || "N/A"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={
                        user.id === currentUserData.id || // Cannot delete self
                        (currentUserData.role !== "admin" && user.role === "admin") || // Non-admin cannot delete admin
                        (currentUserData.role === "manager" && user.role === "restaurant") || // Manager cannot delete restaurant owner
                        (currentUserData.role === "restaurant" &&
                          user.role === "restaurant" &&
                          user.id !== currentUserData.id) // Restaurant owner cannot delete other restaurant owners
                      }
                    >
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
    </Card>
  )
}
