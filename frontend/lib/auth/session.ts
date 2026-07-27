/** Clears every role session through the app route shared by client shells. */
export async function signOut(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw new Error("Unable to end this session. Please try again.");
  }
}
