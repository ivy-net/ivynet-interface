const messages = {
  BadCredentials: "Invalid Email/Password",
  ConfirmPasswordMismatch: "Confirmation password doesn't match.",
  ResetCheckEmail: "Check your email for next steps",
  HelpMessage: "Custom Help message",
  MachineDeletedMessage: "Machine successfully deleted",
  MachineEditedMessage: "Machine successfully edited",
}

export const chains = [{ label: "ethereum", value: "ethereum" }, { label: "holesky", value: "holesky" }]

export const getMessage = (text: string) => {
  return messages[text as keyof typeof messages] || text
}