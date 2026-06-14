export const getFirebaseErrorMessage = (err: any): string => {
  const msg = err?.message || "";
  if (!msg) return "An unexpected error occurred.";

  if (msg.includes("auth/invalid-credential")) return "Invalid email or password.";
  if (msg.includes("auth/user-not-found")) return "No account found with this email.";
  if (msg.includes("auth/wrong-password")) return "Incorrect password.";
  if (msg.includes("auth/email-already-in-use")) return "This email is already registered.";
  if (msg.includes("auth/weak-password")) return "Password should be at least 6 characters.";
  if (msg.includes("auth/invalid-email")) return "Invalid email address format.";
  if (msg.includes("auth/network-request-failed")) return "Network error. Please check your connection.";
  if (msg.includes("auth/too-many-requests")) return "Too many attempts. Please try again later.";

  // Generic cleanup for any other Firebase error
  return msg.replace("Firebase: ", "").replace(/\(auth\/.*?\)\.?/, "").trim() || "An error occurred. Please try again.";
};
