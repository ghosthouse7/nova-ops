// inspect-tambo.js
// Eta amader bolbe Real URL konta ar Model ki set kora uchit.

import { TamboAI } from "@tambo-ai/typescript-sdk";

const tambo = new TamboAI({ apiKey: "test" });

console.log("--- TAMBO SDK SECRETS ---");
// @ts-expect-error Accessing SDK internals for local debugging.
console.log("1. Base URL:", tambo.baseURL || tambo._client?.baseURL || "Hidden inside client");
console.log("-------------------------");
