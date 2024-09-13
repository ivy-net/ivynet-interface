import React from "react";
import { CodeModal } from "../shared/CodeModal";


interface AvsDeregisterModalProps {
};

export const AvsDeregisterModal: React.FC<AvsDeregisterModalProps> = () => {
  const title = "Deregister AVS";
  const code =
    `lorem
Generates a random sentence.

lorem -s, --sentence
Generates a random sentence.

lorem -s -c, --sentence --count
Generates a number of random sentences.

lorem -p, --paragraph
Generates a paragraph.

lorem -p -c, --paragraph --count
Generates a number of paragraphs.  lorem -h, --help
Displays this help message.
`
  return (
    <CodeModal title={title} code={code} />
  );
}
