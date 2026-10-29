/** Token de Firebase de la sesión actual (solo navegador). */
export async function getAdminIdToken(): Promise<string> {
  const { getFirebaseAuth } = await import("@/lib/firebase");
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Falta iniciar sesión.");
  return user.getIdToken();
}
