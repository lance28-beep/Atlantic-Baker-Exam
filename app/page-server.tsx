import AuthCheck from "./auth-check"
import ClientHome from "./page"

export default async function HomePage() {
  return (
    <>
      <AuthCheck />
      <ClientHome />
    </>
  )
} 