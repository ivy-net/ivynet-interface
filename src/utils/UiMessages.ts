const messages = {
  BadCredentials: "Invalid Email/Password",
  ConfirmPasswordMismatch: "Confirmation password doesn't match.",
  ResetCheckEmail: "Check your email for next steps",
  HelpMessage: `Reach out on <a href="https://t.me/ivynetdotdev" target="_blank" rel="noopener noreferrer"><strong>TG</strong></a> and we will get back to you asap!`,
  MachineDeletedMessage: "Machine successfully deleted",
  MachineEditedMessage: "Machine successfully edited",
}

<<<<<<< HEAD
export const chains = [{ label: "ethereum", value: "mainnet" }, { label: "holesky", value: "holesky" }]
export const getChainLabel = (value: string | null) => {
  return chains.find(chain => chain.value === value)?.label || ""
}
=======

export const chains = [{ label: "ethereum", value: "mainnet" }, { label: "holesky", value: "holesky" }]
>>>>>>> 82ef17f (initial updates)

export const getMessage = (text: string) => {
  return messages[text as keyof typeof messages] || text
}
