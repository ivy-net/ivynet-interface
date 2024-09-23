const messages = {
  BadCredentials: "Invalid Email/Password"
}

export const getMessage = (text: string) => {
  return messages[text as keyof typeof messages] || ""
}