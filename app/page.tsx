import AuthCheck from "./auth-check"
import ClientHome from "./page-client"

export default async function Home() {
  return (
    <>
      <AuthCheck />
      <ClientHome />
    </>
  )
}
