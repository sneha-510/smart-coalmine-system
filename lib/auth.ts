import { cookies } from "next/headers"
import { getUserByCredentials, getUserById } from "./db"

// Set user session
export async function setUserSession(user: any) {
  const oneDay = 24 * 60 * 60 * 1000
  cookies().set("userId", String(user.id), { expires: Date.now() + oneDay })
}

// Get current user
export async function getCurrentUser() {
  const userId = cookies().get("userId")?.value

  if (!userId) {
    return null
  }

  try {
    const user = await getUserById(Number(userId))
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Log out user
export function logoutUser() {
  cookies().delete("userId")
}

// Login user
export async function loginUser(email: string, password: string) {
  try {
    const user = await getUserByCredentials(email, password)

    if (user) {
      await setUserSession(user)
      return { success: true, user }
    }

    return { success: false, error: "Invalid credentials" }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "An error occurred during login" }
  }
}
