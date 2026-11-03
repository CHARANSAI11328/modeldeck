import { ProviderId } from "./types";

export interface AssistantConfig {
  id: string;
  name: string;
  title: string;
  greeting: string;
  persona: string;
  suggestedQuestions: string[];
  brandColor: string;
  avatar: string;
  position: "bottom-right" | "bottom-left";
  provider: ProviderId;
  model: string;
  allowedDomains: string[];
  websiteUrl?: string;
  createdAt: number;
}

export interface ScrapedSiteData {
  url: string;
  title: string;
  description: string;
  author: string;
  extractedText: string;
  detectedLinks: {
    github?: string;
    linkedin?: string;
    email?: string;
    twitter?: string;
    portfolio?: string;
  };
  skills: string[];
  projects: {
    title: string;
    description: string;
    link?: string;
  }[];
}

export interface ScrapeResponse {
  success: boolean;
  scrapedData?: ScrapedSiteData;
  assistant?: AssistantConfig;
  error?: string;
}

export interface ChatRequestPayload {
  messages: {
    role: "user" | "assistant" | "system";
    content: string;
  }[];
  assistantConfig: Partial<AssistantConfig>;
  hostOrigin?: string;
}

export interface GitHubPrRequestPayload {
  githubToken: string;
  repoUrl: string;
  scriptSnippet: string;
  assistantConfig: AssistantConfig;
}

export interface GitHubPrResponse {
  success: boolean;
  prUrl?: string;
  branch?: string;
  fileUpdated?: string;
  error?: string;
}
