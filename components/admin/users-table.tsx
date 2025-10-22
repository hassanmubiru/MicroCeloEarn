"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Loader2 } from "lucide-react"
import { getAllUsers, getWorkerProfile } from "@/lib/contract-interactions"
import { isContractConfigured } from "@/lib/celo-config"

interface UserProfile {
  address: string
  tasksCompleted: number
  totalEarned: string
  rating: number
  ratingCount: number
}

export function UsersTable() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      if (!isContractConfigured()) {
        setLoading(false)
        return
      }

      try {
        const userAddresses = await getAllUsers()
        const userProfiles = await Promise.all(
          userAddresses.map(async (address) => {
            const profile = await getWorkerProfile(address)
            return {
              address,
              ...profile,
            }
          }),
        )
        setUsers(userProfiles)
      } catch (error) {
        console.error("[v0] Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
    const interval = setInterval(fetchUsers, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Users</CardTitle>
          <CardDescription>View and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Users</CardTitle>
        <CardDescription>View and manage user accounts ({users.length} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Tasks Completed</TableHead>
              <TableHead>Total Earned</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.address}>
                <TableCell className="font-mono">
                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </TableCell>
                <TableCell>{user.tasksCompleted}</TableCell>
                <TableCell className="font-medium">{user.totalEarned} cUSD</TableCell>
                <TableCell>
                  {user.ratingCount > 0 ? (
                    <Badge variant="outline">⭐ {(user.rating / 20).toFixed(1)}</Badge>
                  ) : (
                    <span className="text-muted-foreground">No rating</span>
                  )}
                </TableCell>
                <TableCell>{user.ratingCount}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {users.length === 0 && (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            No users found on the blockchain
          </div>
        )}
      </CardContent>
    </Card>
  )
}
