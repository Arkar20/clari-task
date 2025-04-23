import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import React from "react";

export function AiTextMessage({
    message,
}: {
    message: ChatCompletionMessageParam;
}) {
    return (
        <>
            {typeof message.content === "string"
                ? message.content
                : Array.isArray(message.content)
                ? message.content.map((part, index) => {
                      if ("text" in part) {
                          return <span key={index}>{part.text}</span>;
                      }
                      if ("refusal" in part) {
                          return <em key={index}>{part.refusal}</em>;
                      }
                      return null;
                  })
                : null}
        </>
    );
}
