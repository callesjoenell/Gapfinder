/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityStatus from "../activityStatus.js";
import type * as auth from "../auth.js";
import type * as billing from "../billing.js";
import type * as claude from "../claude.js";
import type * as conversationActions from "../conversationActions.js";
import type * as conversationState from "../conversationState.js";
import type * as http from "../http.js";
import type * as ideas from "../ideas.js";
import type * as ideasActions from "../ideasActions.js";
import type * as manualResearch from "../manualResearch.js";
import type * as messages from "../messages.js";
import type * as research_executor from "../research/executor.js";
import type * as research_hackernews from "../research/hackernews.js";
import type * as research_keywordAction from "../research/keywordAction.js";
import type * as research_keywords from "../research/keywords.js";
import type * as research_producthunt from "../research/producthunt.js";
import type * as research_reddit from "../research/reddit.js";
import type * as research_stackoverflow from "../research/stackoverflow.js";
import type * as research_tavily from "../research/tavily.js";
import type * as research_tools from "../research/tools.js";
import type * as researchActions from "../researchActions.js";
import type * as researchQueue from "../researchQueue.js";
import type * as sessions from "../sessions.js";
import type * as summaries from "../summaries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityStatus: typeof activityStatus;
  auth: typeof auth;
  billing: typeof billing;
  claude: typeof claude;
  conversationActions: typeof conversationActions;
  conversationState: typeof conversationState;
  http: typeof http;
  ideas: typeof ideas;
  ideasActions: typeof ideasActions;
  manualResearch: typeof manualResearch;
  messages: typeof messages;
  "research/executor": typeof research_executor;
  "research/hackernews": typeof research_hackernews;
  "research/keywordAction": typeof research_keywordAction;
  "research/keywords": typeof research_keywords;
  "research/producthunt": typeof research_producthunt;
  "research/reddit": typeof research_reddit;
  "research/stackoverflow": typeof research_stackoverflow;
  "research/tavily": typeof research_tavily;
  "research/tools": typeof research_tools;
  researchActions: typeof researchActions;
  researchQueue: typeof researchQueue;
  sessions: typeof sessions;
  summaries: typeof summaries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
