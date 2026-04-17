import React from "react";

const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}\.[a-zA-Z]{2,6}(?:\/[^\s]*)?)/g;
const URL_TEST_REGEX = /^(https?:\/\/[^\s]+|[a-zA-Z0-9][a-zA-Z0-9-]{1,61}\.[a-zA-Z]{2,6}(?:\/[^\s]*)?)$/;

export function renderWithLinks(text: string): React.ReactNode[] {
  return text.split(URL_SPLIT_REGEX).map((part, i) => {
    if (URL_TEST_REGEX.test(part)) {
      const href = /^https?:\/\//.test(part) ? part : `https://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="underline"
          style={{ wordBreak: "break-all" }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
